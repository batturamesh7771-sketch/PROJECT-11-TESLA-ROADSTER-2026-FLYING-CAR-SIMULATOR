import { VehicleStateBuffer, VehicleVariant, PHYSICAL_CONSTANTS } from '@tesla-roadster/shared-core';

export interface PhysicsConstants {
  gamma: number;           // 1.40
  R_spec: number;          // 296.8 J/(kg*K)
  c_v: number;             // 742.0 J/(kg*K)
  h_wall: number;          // 45.0 W/(m^2*K)
  A_wall: number;          // 3.85 m^2 (COPV surface)
  T_ambient: number;       // 293.15 K
  rho_air_SL: number;      // 1.204 kg/m^3
  P_atm_SL: number;        // 101325 Pa
  V_tank: number;          // 0.60 m^3 (Rocket trim)
  A_plenum: number;        // 4.00 m^2
  L_p: number;             // 13.0 m
  C_d_skirt: number;       // 0.60
  eta_fan: number;         // 0.60
  mu_peak: number;         // 1.26
}

export class RoadsterPhysicsEngine {
  public readonly state: VehicleStateBuffer;
  public readonly cfg: PhysicsConstants;

  constructor(state: VehicleStateBuffer, cfg?: Partial<PhysicsConstants>) {
    this.state = state;
    this.cfg = {
      gamma: PHYSICAL_CONSTANTS.GAMMA,
      R_spec: PHYSICAL_CONSTANTS.R_SPECIFIC_N2,
      c_v: PHYSICAL_CONSTANTS.C_V_N2,
      h_wall: PHYSICAL_CONSTANTS.COPV_H_WALL,
      A_wall: PHYSICAL_CONSTANTS.COPV_WALL_AREA_M2,
      T_ambient: PHYSICAL_CONSTANTS.T_AMB_SL,
      rho_air_SL: PHYSICAL_CONSTANTS.RHO_AIR_SL,
      P_atm_SL: PHYSICAL_CONSTANTS.P_ATM_SL,
      V_tank: PHYSICAL_CONSTANTS.COPV_VOLUME_M3.ROCKET,
      A_plenum: PHYSICAL_CONSTANTS.PLENUM_AREA_M2,
      L_p: PHYSICAL_CONSTANTS.PLENUM_PERIMETER_M,
      C_d_skirt: PHYSICAL_CONSTANTS.SKIRT_C_D,
      eta_fan: PHYSICAL_CONSTANTS.FAN_EFFICIENCY,
      mu_peak: PHYSICAL_CONSTANTS.TIRE_MU_PEAK_DRY,
      ...cfg,
    };
  }

  /**
   * 1,000 Hz Deterministic Physics Tick (dt = 0.001 s)
   */
  public step(dt: number = 0.001): void {
    this.updateCOPVBlowdown(dt);
    this.updateGroundEffectSuction();
    this.updateActiveAerodynamics();
    this.integrate6DOF(dt);
  }

  private updateCOPVBlowdown(dt: number): void {
    if (this.state.variant === VehicleVariant.PERFORMANCE) {
      this.state.cgtTotalThrustN = 0.0;
      this.state.cgtTotalMassFlowKgS = 0.0;
      return;
    }

    const P0_pa = this.state.stagnationPressureBar * 1e5;
    const T0_k = this.state.stagnationTempK;
    const currentMass = this.state.gasMassKg;

    if (currentMass <= 2.0 || P0_pa <= 1.893 * this.cfg.P_atm_SL) {
      this.state.cgtTotalThrustN = 0.0;
      this.state.cgtTotalMassFlowKgS = 0.0;
      return;
    }

    // Throat area definitions
    // k = 0..3: Rear main (d_t = 0.0214 m -> A_t = 3.597e-4 m^2 each)
    // k = 4..7: Wheel-well lift (d_t = 0.0145 m -> A_t = 1.651e-4 m^2 each)
    // k = 8..9: Nose yaw (d_t = 0.0120 m -> A_t = 1.131e-4 m^2 each)
    const throatAreas = [
      3.597e-4, 3.597e-4, 3.597e-4, 3.597e-4,
      1.651e-4, 1.651e-4, 1.651e-4, 1.651e-4,
      1.131e-4, 1.131e-4,
    ];

    let totalMassFlow = 0.0;
    let netThrust = 0.0;
    const realGasCorrection = 1.1666;
    const chokedFactor = Math.sqrt(this.cfg.gamma / (this.cfg.R_spec * T0_k)) *
      Math.pow(2.0 / (this.cfg.gamma + 1.0), (this.cfg.gamma + 1.0) / (2.0 * (this.cfg.gamma - 1.0))) *
      realGasCorrection;

    for (let k = 0; k < 10; k++) {
      const u_k = this.state.getCgtValve(k);
      if (u_k > 0.001) {
        const m_dot_k = u_k * 0.98 * P0_pa * throatAreas[k] * chokedFactor;
        const F_cgt_k = m_dot_k * 565.0 * Math.pow(this.cfg.P_atm_SL / this.cfg.P_atm_SL, 0.08);
        totalMassFlow += m_dot_k;
        netThrust += F_cgt_k;
      }
    }

    this.state.cgtTotalMassFlowKgS = totalMassFlow;
    this.state.cgtTotalThrustN = netThrust;

    // Mass depletion & thermal-pressure update
    const newMass = Math.max(2.0, currentMass - totalMassFlow * dt);
    const massRatio = newMass / currentMass;

    const heatTransfer = (this.cfg.h_wall * this.cfg.A_wall * (this.cfg.T_ambient - T0_k)) / (newMass * this.cfg.c_v);
    const newTemp = Math.max(130.0, T0_k * Math.pow(massRatio, this.cfg.gamma - 1.0) + heatTransfer * dt);

    const compressibilityZ = 1.0 + 0.192 * (P0_pa / 379.2e5);
    const newPressurePa = compressibilityZ * (newMass / this.cfg.V_tank) * this.cfg.R_spec * newTemp;

    this.state.gasMassKg = newMass;
    this.state.stagnationTempK = newTemp;
    this.state.compressibilityZ = compressibilityZ;
    this.state.stagnationPressureBar = newPressurePa / 1e5;
  }

  private updateGroundEffectSuction(): void {
    const forwardSpeedMps = Math.hypot(this.state.velX, this.state.velY);

    // High-speed Venturi bypass transition above 200 mph (89.4 m/s)
    if (forwardSpeedMps > 89.4) {
      this.state.venturiBypassOpen = true;
      const F_venturi = 0.5 * this.cfg.rho_air_SL * 1.85 * 2.2 * Math.pow(forwardSpeedMps, 2);
      this.state.suctionDownforceN = Math.min(46100.0, F_venturi);
      this.state.plenumVacuumKpa = this.state.suctionDownforceN / (this.cfg.A_plenum * 1000.0);
      return;
    }

    this.state.venturiBypassOpen = false;
    const P_fan_watts = this.state.fanPowerKw * 1000.0;
    const avgSkirtGapM = Math.max(0.0015, (this.state.getSkirtGapMm(0) + this.state.getSkirtGapMm(1) +
      this.state.getSkirtGapMm(2) + this.state.getSkirtGapMm(3)) / (4.0 * 1000.0));

    if (P_fan_watts <= 100.0) {
      this.state.plenumVacuumKpa = 0.0;
      this.state.suctionDownforceN = 0.0;
      return;
    }

    // Solve DeltaP = [(P_fan * eta) / (C_d * L_p * h_gap * sqrt(2/rho))]^(2/3)
    const denom = this.cfg.C_d_skirt * this.cfg.L_p * avgSkirtGapM * Math.sqrt(2.0 / this.cfg.rho_air_SL);
    const deltaP_pa = Math.min(13200.0, Math.pow((P_fan_watts * this.cfg.eta_fan) / denom, 2.0 / 3.0));

    this.state.plenumVacuumKpa = deltaP_pa / 1000.0;
    this.state.suctionDownforceN = deltaP_pa * this.cfg.A_plenum;
  }

  private updateActiveAerodynamics(): void {
    const v_x = Math.hypot(this.state.velX, this.state.velY);
    const q_inf = 0.5 * this.cfg.rho_air_SL * v_x * v_x;

    // Rear wing: 0..90 deg (90 deg = 18.5 kN airbrake at 160 mph / 71.5 m/s)
    const alpha_rear = (this.state.rearWingPitchDeg * Math.PI) / 180.0;
    const C_L_rear = 1.45 * Math.sin(alpha_rear * 2.0);
    const C_D_rear = 0.065 + 0.885 * Math.pow(Math.sin(alpha_rear), 2);

    const wingDownforce = q_inf * 1.65 * C_L_rear;
    const wingDrag = q_inf * 1.65 * C_D_rear;

    this.state.passiveAeroDownforceN = wingDownforce;
    this.state.aeroDragN = wingDrag + q_inf * 1.95 * 0.28;
  }

  private integrate6DOF(dt: number): void {
    const totalMass = (this.state.variant === VehicleVariant.ROCKET ? 2080.0 : 1810.0) + this.state.gasMassKg;
    const gravityForceZ = -totalMass * 9.80665;
    const netForceZ = gravityForceZ - this.state.suctionDownforceN - this.state.passiveAeroDownforceN;

    // Contact patch normal load
    const F_N_total = Math.max(0.0, -netForceZ);
    const maxTractiveForce = F_N_total * this.cfg.mu_peak;

    // Drive force from rear motors
    const totalMotorTorque = this.state.getMotorTorqueNm(0) + this.state.getMotorTorqueNm(1);
    const tireRadius = 0.355; // 335/30R21
    const driveForceX = Math.min(maxTractiveForce, (totalMotorTorque * 8.4) / tireRadius);

    // Net longitudinal acceleration
    const netForceX = driveForceX + this.state.cgtTotalThrustN - this.state.aeroDragN;
    const accelX = netForceX / totalMass;

    this.state.velX += accelX * dt;
    this.state.posX += this.state.velX * dt;
  }
}
