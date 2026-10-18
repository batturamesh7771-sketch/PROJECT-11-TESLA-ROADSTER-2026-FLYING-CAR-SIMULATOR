/**
 * Physical, Aerothermodynamic, and Engineering Constants
 * Grounded in verified October 15-16, 2026 Tesla Roadster Specifications
 */

export const PHYSICAL_CONSTANTS = {
  // Gas Dynamics (Dry N2 / Air)
  GAMMA: 1.40,
  MOLAR_MASS_N2: 28.0134e-3, // kg/mol
  R_UNIVERSAL: 8314.46,       // J/(kmol*K)
  R_SPECIFIC_N2: 296.8,       // J/(kg*K)
  C_V_N2: 742.0,              // J/(kg*K)
  C_P_N2: 1038.8,             // J/(kg*K)
  CRITICAL_PRESSURE_RATIO: 1.893, // [(gamma+1)/2]^(gamma/(gamma-1))

  // Ambient Sea-Level Reference
  P_ATM_SL: 101325.0,         // Pa
  T_AMB_SL: 293.15,           // Kelvin (20 deg C)
  RHO_AIR_SL: 1.204,          // kg/m^3
  GRAVITY: 9.80665,           // m/s^2

  // COPV System Parameters
  COPV_WORKING_PRESSURE_PA: 379.2e5, // 5,500 psi
  COPV_BURST_RATED_PRESSURE_PA: 689.5e5, // 10,000 psi
  COPV_VOLUME_M3: {
    PERFORMANCE: 0.0,
    THRUST: 0.20,             // 200 L trunk tank
    ROCKET: 0.60,             // 200 L trunk + 400 L cabin tank
  },
  COPV_INITIAL_MASS_KG: {
    PERFORMANCE: 0.0,
    THRUST: 83.0,
    ROCKET: 240.0,            // 227-250 kg charge
  },
  COPV_WALL_AREA_M2: 3.85,
  COPV_H_WALL: 45.0,          // W/(m^2*K) heat transfer coefficient
  COMPRESSIBILITY_VIRIAL_SLOPE: 0.192,

  // Cold-Gas Thruster Array (10 Supersonic De Laval Nozzles)
  CGT_V_EFF_SEA_LEVEL: 565.0, // m/s
  CGT_I_SP_SEA_LEVEL: 57.6,   // seconds
  CGT_C_D_NOZZLE: 0.98,
  CGT_THROAT_DIAMETERS_M: {
    REAR_MAIN: 0.0214,        // 4 rear nozzles (3.597e-4 m^2 each, 14.39 cm^2 total)
    WHEEL_LIFT: 0.0145,       // 4 wheel-well lift nozzles (1.651e-4 m^2 each)
    NOSE_YAW: 0.0120,         // 2 nose lateral yaw nozzles (1.131e-4 m^2 each)
  },
  CGT_EXPANSION_RATIO_REAR: 2.05,
  CGT_EXIT_MACH_REAR: 2.18,
  CGT_VALVE_LATENCY_TAU: 0.0012, // 1.2 ms Optimus pintle actuator response

  // Underbody Ground-Effect Suction System (US Patent 12,377,920)
  PLENUM_AREA_M2: 4.00,
  PLENUM_PERIMETER_M: 13.0,
  FAN_COUNT: 4,
  FAN_RATED_POWER_KW: 80.0,   // 4 x 20 kW
  FAN_MAX_RPM: 28000.0,
  FAN_EFFICIENCY: 0.60,
  SKIRT_C_D: 0.60,
  MAX_SUCTION_VACUUM_PA: 13200.0, // 13.2 kPa
  NOMINAL_SUCTION_VACUUM_PA: 11525.0, // 11.525 kPa -> 46,100 N (4,700 kgf)
  VENTURI_TRANSITION_SPEED_MPS: 89.4, // 200 mph

  // Vehicle Dynamics & Chassis
  TIRE_MU_PEAK_DRY: 1.26,     // Pirelli P Zero Trofeo RS Elect
  TIRE_RADIUS_M: 0.355,       // 335/30R21
  GEAR_RATIO: 8.4,            // Planetary reduction
  RWD_MAX_POWER_KW: 1100.0,   // Transient max (1,500 hp)
  RWD_MAX_TORQUE_NM: 1450.0,  // Combined shaft torque
  RWD_CONTINUOUS_POWER_KW: 1000.0,

  // Mass Envelopes
  MASS_KG: {
    PERFORMANCE_DRY: 1680.0,
    PERFORMANCE_LOADED: 1700.0,
    THRUST_DRY: 1810.0,
    THRUST_LOADED: 1900.0,
    ROCKET_DRY: 2080.0,
    ROCKET_WET_FLIGHT: 2350.0,
  },

  // Active Aerodynamics
  FRONT_WING_MAX_DEG: 80.0,
  REAR_WING_MAX_DEG: 90.0,    // 90 deg = 18.5 kN airbrake @ 160 mph
  REAR_WING_PASSIVE_LOAD_N: 6867.0, // 700 kgf @ 160 mph
  AERO_FRONTAL_AREA_M2: 1.95,
  AERO_BASE_CD: 0.28,
} as const;
