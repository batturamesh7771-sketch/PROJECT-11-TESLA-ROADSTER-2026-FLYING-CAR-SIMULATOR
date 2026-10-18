"""
Underbody Suction Fan & Dynamic Skirt Sealing Fluid-Structure Interaction (FSI) Model
Patent US 12,377,920
"""

import math
from typing import Tuple

class GroundEffectFSIEngine:
    def __init__(self):
        self.A_plenum = 4.00        # m^2
        self.L_p = 13.0             # m perimeter
        self.C_d_skirt = 0.60
        self.eta_fan = 0.60
        self.rho_air_sl = 1.204     # kg/m^3
        self.max_delta_p_pa = 13200.0 # 13.2 kPa
        self.venturi_speed_mps = 89.4 # 200 mph

    def compute_suction(
        self,
        fan_power_kw: float,
        avg_skirt_gap_mm: float,
        forward_speed_mps: float,
        ambient_rho: float = 1.204
    ) -> Tuple[float, float, bool]:
        """
        Returns (plenum_vacuum_kpa, suction_downforce_n, venturi_bypass_open)
        """
        # High speed open-skirt Venturi mode above 200 mph
        if forward_speed_mps > self.venturi_speed_mps:
            # Venturi ground effect law: F = 0.5 * rho * C_L * A * v^2
            C_L_venturi = 1.85
            A_ref = 2.2
            f_venturi = min(46100.0, 0.5 * ambient_rho * C_L_venturi * A_ref * (forward_speed_mps ** 2))
            delta_p_kpa = (f_venturi / self.A_plenum) / 1000.0
            return delta_p_kpa, f_venturi, True

        fan_power_w = max(0.0, min(80.0, fan_power_kw)) * 1000.0
        h_gap_m = max(0.0015, min(0.055, avg_skirt_gap_mm / 1000.0))

        if fan_power_w <= 100.0:
            return 0.0, 0.0, False

        # Equilibrium DeltaP = [(P_fan * eta) / (C_d * L_p * h_gap * sqrt(2/rho))]^(2/3)
        denom = self.C_d_skirt * self.L_p * h_gap_m * math.sqrt(2.0 / ambient_rho)
        delta_p_pa = math.pow((fan_power_w * self.eta_fan) / denom, 2.0 / 3.0)
        delta_p_pa = min(self.max_delta_p_pa, delta_p_pa)

        downforce_n = delta_p_pa * self.A_plenum
        return delta_p_pa / 1000.0, downforce_n, False
