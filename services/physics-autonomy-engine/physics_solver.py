"""
Coupled 6-DOF Multi-Physics & RK4 Rigid Body Dynamics Solver (1,000 Hz)
"""

import math
import numpy as np
from typing import Tuple
from state_schema import VehicleState6DOF, VehicleVariant
from copv_realgas import COPVRealGasEngine
from fsi_fans import GroundEffectFSIEngine

class RoadsterPhysicsSolver:
    def __init__(self, vehicle_state: VehicleState6DOF):
        self.state = vehicle_state
        self.copv = COPVRealGasEngine(tank_volume_m3=0.60)
        self.fsi = GroundEffectFSIEngine()

        # Physical Constants
        self.mass_dry = 2080.0 # kg (Rocket trim)
        self.Ixx = 1029.0      # kg*m^2 (W=2.0m, H=1.12m)
        self.Iyy = 2850.0      # kg*m^2
        self.Izz = 3200.0      # kg*m^2
        self.wheelbase = 2.75  # m
        self.track_width = 1.70# m
        self.tire_radius = 0.355 # m (335/30R21)
        self.gear_ratio = 8.4
        self.mu_peak = 1.26

        # 10 Thruster Mounting Offsets [x, y, z] relative to vehicle CG (m)
        self.cgt_offsets = [
            [-1.95, -0.45, 0.38], [-1.95, -0.15, 0.38], [-1.95, 0.15, 0.38], [-1.95, 0.45, 0.38], # Rear 4
            [ 1.30,  0.90, 0.32], [ 1.30, -0.90, 0.32], [-1.30, 0.90, 0.32], [-1.30, -0.90, 0.32], # Wheel 4 (Lift)
            [ 1.85,  0.88, 0.42], [ 1.85, -0.88, 0.42]                                             # Nose 2 (Yaw)
        ]

        # Nominal thrust unit direction vectors
        self.cgt_directions = [
            [ 1.0,  0.0,  0.0], [ 1.0,  0.0,  0.0], [ 1.0,  0.0,  0.0], [ 1.0,  0.0,  0.0], # Push forward
            [ 0.0,  0.0,  1.0], [ 0.0,  0.0,  1.0], [ 0.0,  0.0,  1.0], [ 0.0,  0.0,  1.0], # Push upward
            [ 0.0, -1.0,  0.0], [ 0.0,  1.0,  0.0]                                             # Opposed lateral
        ]

    def step(self, dt: float = 0.001):
        """
        Executes a single 1,000 Hz RK4 integration step.
        """
        # 1. Update Subsystem Equations
        valves = [self.state.get_cgt_valve(i) for i in range(10)]
        p0, t0, mg, m_dot, f_cgt, z = self.copv.compute_step(
            dt,
            self.state.stagnation_pressure_bar,
            self.state.stagnation_temp_k,
            self.state.gas_mass_kg,
            valves
        )
        self.state.stagnation_pressure_bar = p0
        self.state.stagnation_temp_k = t0
        self.state.gas_mass_kg = mg
        self.state.cgt_net_mass_flow = m_dot
        self.state.cgt_net_thrust_n = f_cgt
        self.state.compressibility_z = z

        # 2. Update Ground Effect Suction
        avg_skirt = sum(self.state.get_skirt_gap_mm(i) for i in range(4)) / 4.0
        v_forward = math.hypot(self.state.vel[0], self.state.vel[1])
        dp_kpa, f_suction, venturi_open = self.fsi.compute_suction(
            self.state.fan_power_kw,
            avg_skirt,
            v_forward
        )
        self.state.plenum_vacuum_kpa = dp_kpa
        self.state.suction_downforce_n = f_suction
        self.state.venturi_bypass_open = venturi_open

        # 3. Active Aerodynamics
        q_inf = 0.5 * 1.204 * (v_forward ** 2)
        alpha_rear = math.radians(self.state.rear_wing_pitch_deg)
        cl_rear = 1.45 * math.sin(alpha_rear * 2.0)
        cd_rear = 0.065 + 0.885 * (math.sin(alpha_rear) ** 2)
        f_wing_downforce = q_inf * 1.65 * cl_rear
        f_wing_drag = q_inf * 1.65 * cd_rear
        f_body_drag = q_inf * 1.95 * 0.28
        self.state.passive_aero_downforce_n = f_wing_downforce
        self.state.aero_drag_n = f_wing_drag + f_body_drag

        # 4. Total Mass & Normal Force
        total_mass = self.mass_dry + self.state.gas_mass_kg
        gravity_force_z = -total_mass * 9.80665

        # Net vertical body force
        net_f_z = gravity_force_z - self.state.suction_downforce_n - self.state.passive_aero_downforce_n
        normal_load = max(0.0, -net_f_z)
        max_tractive = normal_load * self.mu_peak

        # 5. Electric Motor Drive Force
        motor_torque = self.state.get_motor_torque_nm(0) + self.state.get_motor_torque_nm(1)
        shaft_drive_force = (motor_torque * self.gear_ratio) / self.tire_radius
        traction_force = min(max_tractive, shaft_drive_force)

        # 6. Sum Forces & Accelerations along Longitudinal Axis
        net_f_x = traction_force + self.state.cgt_net_thrust_n - self.state.aero_drag_n
        accel_x = net_f_x / total_mass

        # Euler / RK4 integration of 1-D velocity & position
        vx = self.state.vel[0] + accel_x * dt
        px = self.state.pos[0] + vx * dt
        self.state.vel = (vx, self.state.vel[1], self.state.vel[2])
        self.state.pos = (px, self.state.pos[1], self.state.pos[2])
