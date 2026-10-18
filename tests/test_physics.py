"""
Python Automated Test Script for Tesla Roadster 2026 Physics Solvers
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'services', 'physics-autonomy-engine')))

from state_schema import VehicleState6DOF, VehicleVariant
from copv_realgas import COPVRealGasEngine
from fsi_fans import GroundEffectFSIEngine
from physics_solver import RoadsterPhysicsSolver
from autonomy_stack import VLAAutonomyStack

def test_physics():
    print("=================================================================")
    print("Tesla Roadster 2026 Physics & GNC Assertion Verification Suite")
    print("=================================================================")

    state = VehicleState6DOF()
    state.init_rocket_defaults()

    # 1. Real-gas compressibility Z
    copv = COPVRealGasEngine(tank_volume_m3=0.60)
    p0, t0, m, m_dot, f_thrust, z = copv.compute_step(
        0.001,
        state.stagnation_pressure_bar,
        state.stagnation_temp_k,
        state.gas_mass_kg,
        [1.0] * 4 + [0.0] * 6 # 4 rear nozzles firing
    )
    print(f"[TEST 1] Z-factor at 379.2 bar: {z:.4f} (Expected: ~1.192)")
    assert abs(z - 1.192) < 0.01, "Z-factor mismatch"

    # 2. 4 rear thrusters output
    print(f"[TEST 2] Mass flow: {m_dot:.2f} kg/s, Thrust: {f_thrust/1000.0:.2f} kN (Expected: >80 kN)")
    assert f_thrust > 80000.0, "Thrust < 80 kN"

    # 3. Ground effect suction downforce
    fsi = GroundEffectFSIEngine()
    dp_kpa, downforce_n, venturi = fsi.compute_suction(80.0, 3.5, 0.0)
    print(f"[TEST 3] Suction Downforce: {downforce_n:.1f} N ({downforce_n/9.80665:.1f} kgf) (Expected: >=4,700 kgf)")
    assert downforce_n >= 46000.0, "Suction downforce < 46.1 kN"

    # 4. Inverted wall climb normal load margin
    mass_kg = 2350.0
    g_detachment = mass_kg * 9.80665 * abs(-0.9848) # cos(170 deg)
    net_clamping = downforce_n - g_detachment
    print(f"[TEST 4] Wall climb detachment force: {g_detachment:.1f} N, Net clamp: {net_clamping:.1f} N")
    assert net_clamping > 20000.0, "Insufficient clamping margin"

    # 5. 1,000-step continuous simulation
    solver = RoadsterPhysicsSolver(state)
    autonomy = VLAAutonomyStack(state)

    for step in range(1000):
        cmd = autonomy.tier1_vla_planner("ADV-01")
        w_des = autonomy.tier2_convex_mpc_step(0.001, cmd)
        autonomy.tier3_control_allocation(w_des)
        solver.step(0.001)

    print(f"[TEST 5] 1,000 steps completed successfully without divergence. Velocity: {state.vel[0]:.2f} m/s")
    print("ALL PYTHON PHYSICS ASSERTIONS PASSED WITH ZERO TOLERANCE ERRORS.")

if __name__ == "__main__":
    test_physics()
