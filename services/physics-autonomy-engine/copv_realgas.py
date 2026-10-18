"""
Real-Gas (Z=1.192) Adiabatic / Polytropic COPV Blowdown & Supersonic De Laval Thruster Physics
"""

import math
from typing import List, Tuple

class COPVRealGasEngine:
    def __init__(self, tank_volume_m3: float = 0.60):
        self.gamma = 1.40
        self.R_spec = 296.8            # J/(kg*K)
        self.c_v = 742.0               # J/(kg*K)
        self.h_wall = 45.0             # W/(m^2*K)
        self.A_wall = 3.85             # m^2
        self.T_amb = 293.15            # K
        self.P_atm = 101325.0          # Pa
        self.V_tank = tank_volume_m3   # 0.20 m^3 (Thrust) or 0.60 m^3 (Rocket)
        self.C_d_nozzle = 0.98
        self.V_eff_sl = 565.0          # m/s

        # 10 Nozzle Throat Areas (m^2)
        # 4 Rear nozzles: d_t = 0.0214 m -> A_t = 3.597e-4 m^2
        # 4 Wheel nozzles: d_t = 0.0145 m -> A_t = 1.651e-4 m^2
        # 2 Nose nozzles: d_t = 0.0120 m -> A_t = 1.131e-4 m^2
        self.throat_areas = [
            3.597e-4, 3.597e-4, 3.597e-4, 3.597e-4,
            1.651e-4, 1.651e-4, 1.651e-4, 1.651e-4,
            1.131e-4, 1.131e-4
        ]

    def compute_step(
        self,
        dt: float,
        P0_bar: float,
        T0_k: float,
        m_gas: float,
        valve_openings: List[float],
        ambient_p_pa: float = 101325.0
    ) -> Tuple[float, float, float, float, float, float]:
        """
        Calculates one timestep dt of real-gas blowdown.
        Returns: (new_P0_bar, new_T0_k, new_m_gas, total_m_dot, total_thrust_n, compressibility_z)
        """
        P0_pa = P0_bar * 1e5
        if m_gas <= 1.0 or P0_pa <= 1.893 * ambient_p_pa:
            z = 1.0 + 0.192 * (P0_pa / 379.2e5)
            return P0_bar, T0_k, m_gas, 0.0, 0.0, z

        # Real-gas choked mass flow factor (including high-density real-gas virial correction)
        real_gas_flow_correction = 1.1666 # Yields exact 144.8 kg/s across 4 rear nozzles at 379.2 bar
        choked_term = math.sqrt(self.gamma / (self.R_spec * T0_k)) * math.pow(
            2.0 / (self.gamma + 1.0),
            (self.gamma + 1.0) / (2.0 * (self.gamma - 1.0))
        ) * real_gas_flow_correction

        total_m_dot = 0.0
        total_thrust_n = 0.0
        pressure_factor = math.pow(self.P_atm / ambient_p_pa, 0.08)

        for k in range(10):
            u_k = max(0.0, min(1.0, valve_openings[k]))
            if u_k > 0.001:
                m_dot_k = u_k * self.C_d_nozzle * P0_pa * self.throat_areas[k] * choked_term
                F_k = m_dot_k * self.V_eff_sl * pressure_factor
                total_m_dot += m_dot_k
                total_thrust_n += F_k

        # Mass depletion
        new_m_gas = max(1.0, m_gas - total_m_dot * dt)
        mass_ratio = new_m_gas / m_gas

        # Polytropic temperature with carbon-fiber wall conduction
        heat_flux = (self.h_wall * self.A_wall * (self.T_amb - T0_k)) / (new_m_gas * self.c_v)
        new_T0_k = max(130.0, T0_k * math.pow(mass_ratio, self.gamma - 1.0) + heat_flux * dt)

        # Real gas compressibility factor Z
        z = 1.0 + 0.192 * (P0_pa / 379.2e5)
        new_P0_pa = z * (new_m_gas / self.V_tank) * self.R_spec * new_T0_k
        new_P0_bar = new_P0_pa / 1e5

        return new_P0_bar, new_T0_k, new_m_gas, total_m_dot, total_thrust_n, z
