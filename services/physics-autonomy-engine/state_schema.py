"""
Tesla Roadster 2026 Simulation - Python 64-Float Binary State Schema
Mirrors packages/shared-core/src/vehicleState.ts exactly.
"""

import struct
from enum import IntEnum
from typing import List, Tuple

class VehicleVariant(IntEnum):
    PERFORMANCE = 0
    THRUST = 1
    ROCKET = 2

class VehicleState6DOF:
    FLOAT_COUNT = 64
    BYTE_SIZE = 64 * 8
    STRUCT_FORMAT = f"<{FLOAT_COUNT}d"

    def __init__(self, data: bytearray | bytes | None = None):
        if data:
            self.floats: List[float] = list(struct.unpack(self.STRUCT_FORMAT, data))
        else:
            self.floats: List[float] = [0.0] * self.FLOAT_COUNT
            self.init_rocket_defaults()

    def to_bytes(self) -> bytes:
        return struct.pack(self.STRUCT_FORMAT, *self.floats)

    def init_rocket_defaults(self):
        self.floats = [0.0] * self.FLOAT_COUNT
        self.quat_w = 1.0
        self.variant = VehicleVariant.ROCKET
        self.gas_mass_kg = 240.0
        self.stagnation_pressure_bar = 379.2
        self.stagnation_temp_k = 293.15
        self.compressibility_z = 1.192
        self.battery_soc_pct = 95.0
        self.battery_temp_c = 32.0
        for i in range(4):
            self.set_skirt_gap_mm(i, 3.5)

    # 1. Position & Velocity
    @property
    def pos(self) -> Tuple[float, float, float]:
        return (self.floats[0], self.floats[1], self.floats[2])
    @pos.setter
    def pos(self, p: Tuple[float, float, float]):
        self.floats[0], self.floats[1], self.floats[2] = p

    @property
    def vel(self) -> Tuple[float, float, float]:
        return (self.floats[3], self.floats[4], self.floats[5])
    @vel.setter
    def vel(self, v: Tuple[float, float, float]):
        self.floats[3], self.floats[4], self.floats[5] = v

    # 2. Attitude Quaternion & Angular Velocity
    @property
    def quat(self) -> Tuple[float, float, float, float]:
        return (self.floats[6], self.floats[7], self.floats[8], self.floats[9])
    @quat.setter
    def quat(self, q: Tuple[float, float, float, float]):
        self.floats[6], self.floats[7], self.floats[8], self.floats[9] = q

    @property
    def quat_w(self) -> float: return self.floats[6]
    @quat_w.setter
    def quat_w(self, v: float): self.floats[6] = v

    @property
    def omega(self) -> Tuple[float, float, float]:
        return (self.floats[10], self.floats[11], self.floats[12])
    @omega.setter
    def omega(self, w: Tuple[float, float, float]):
        self.floats[10], self.floats[11], self.floats[12] = w

    # 3. Variant & COPV
    @property
    def variant(self) -> VehicleVariant: return VehicleVariant(int(self.floats[13]))
    @variant.setter
    def variant(self, v: VehicleVariant): self.floats[13] = float(int(v))

    @property
    def gas_mass_kg(self) -> float: return self.floats[14]
    @gas_mass_kg.setter
    def gas_mass_kg(self, v: float): self.floats[14] = v

    @property
    def stagnation_pressure_bar(self) -> float: return self.floats[15]
    @stagnation_pressure_bar.setter
    def stagnation_pressure_bar(self, v: float): self.floats[15] = v

    @property
    def stagnation_temp_k(self) -> float: return self.floats[16]
    @stagnation_temp_k.setter
    def stagnation_temp_k(self, v: float): self.floats[16] = v

    @property
    def compressibility_z(self) -> float: return self.floats[17]
    @compressibility_z.setter
    def compressibility_z(self, v: float): self.floats[17] = v

    # 4. CGTs (Indices 19..28)
    def get_cgt_valve(self, idx: int) -> float:
        return self.floats[19 + idx]
    def set_cgt_valve(self, idx: int, val: float):
        self.floats[19 + idx] = max(0.0, min(1.0, val))

    @property
    def cgt_net_mass_flow(self) -> float: return self.floats[33]
    @cgt_net_mass_flow.setter
    def cgt_net_mass_flow(self, v: float): self.floats[33] = v

    @property
    def cgt_net_thrust_n(self) -> float: return self.floats[34]
    @cgt_net_thrust_n.setter
    def cgt_net_thrust_n(self, v: float): self.floats[34] = v

    # 5. Underbody Suction
    @property
    def fan_power_kw(self) -> float: return self.floats[39]
    @fan_power_kw.setter
    def fan_power_kw(self, v: float): self.floats[39] = v

    def set_skirt_gap_mm(self, idx: int, v: float):
        self.floats[40 + idx] = v
    def get_skirt_gap_mm(self, idx: int) -> float:
        return self.floats[40 + idx]

    @property
    def plenum_vacuum_kpa(self) -> float: return self.floats[44]
    @plenum_vacuum_kpa.setter
    def plenum_vacuum_kpa(self, v: float): self.floats[44] = v

    @property
    def suction_downforce_n(self) -> float: return self.floats[45]
    @suction_downforce_n.setter
    def suction_downforce_n(self, v: float): self.floats[45] = v

    @property
    def venturi_bypass_open(self) -> bool: return self.floats[46] > 0.5
    @venturi_bypass_open.setter
    def venturi_bypass_open(self, v: bool): self.floats[46] = 1.0 if v else 0.0

    # 6. Active Aero
    @property
    def rear_wing_pitch_deg(self) -> float: return self.floats[47]
    @rear_wing_pitch_deg.setter
    def rear_wing_pitch_deg(self, v: float): self.floats[47] = v

    @property
    def front_wing_flap_deg(self) -> float: return self.floats[48]
    @front_wing_flap_deg.setter
    def front_wing_flap_deg(self, v: float): self.floats[48] = v

    @property
    def passive_aero_downforce_n(self) -> float: return self.floats[51]
    @passive_aero_downforce_n.setter
    def passive_aero_downforce_n(self, v: float): self.floats[51] = v

    @property
    def aero_drag_n(self) -> float: return self.floats[52]
    @aero_drag_n.setter
    def aero_drag_n(self, v: float): self.floats[52] = v

    # 7. Powertrain
    def set_motor_torque_nm(self, idx: int, v: float):
        self.floats[53 + idx] = v
    def get_motor_torque_nm(self, idx: int) -> float:
        return self.floats[53 + idx]

    @property
    def battery_soc_pct(self) -> float: return self.floats[57]
    @battery_soc_pct.setter
    def battery_soc_pct(self, v: float): self.floats[57] = v

    @property
    def battery_temp_c(self) -> float: return self.floats[58]
    @battery_temp_c.setter
    def battery_temp_c(self, v: float): self.floats[58] = v

    @property
    def yoke_angle_deg(self) -> float: return self.floats[63]
    @yoke_angle_deg.setter
    def yoke_angle_deg(self, v: float): self.floats[63] = v
