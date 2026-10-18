import { VehicleStateBuffer, VLATacticalCommand, ADVENTURE_DEFINITIONS } from '@tesla-roadster/shared-core';

export class VLABrainController {
  private state: VehicleStateBuffer;
  private currentAdventureId: string = 'ADV-01';
  private timer: number = 0;
  private currentCommand: VLATacticalCommand;

  constructor(state: VehicleStateBuffer) {
    this.state = state;
    this.currentCommand = this.generateTacticalPlan('ADV-01');
  }

  public setAdventure(advId: string): void {
    this.currentAdventureId = advId;
    this.timer = 0;
    this.currentCommand = this.generateTacticalPlan(advId);
  }

  public getTacticalCommand(): VLATacticalCommand {
    return this.currentCommand;
  }

  /**
   * Autonomous Control Step called in the physics/telemetry loop
   */
  public step(dt: number): void {
    this.timer += dt;

    // Tier 1: Update tactical plan (every 40 ms / 25 Hz)
    if (Math.floor(this.timer * 25) !== Math.floor((this.timer - dt) * 25)) {
      this.currentCommand = this.generateTacticalPlan(this.currentAdventureId);
    }

    // Tier 2 & 3: Apply control commands
    this.applyControlAllocation(dt);
  }

  private generateTacticalPlan(advId: string): VLATacticalCommand {
    const adv = ADVENTURE_DEFINITIONS.find((a) => a.id === advId);
    const title = adv ? adv.title : 'General Proving Ground';

    switch (advId) {
      case 'ADV-01': // McGregor 170 deg wall & drop
        if (this.timer < 3.0) {
          return {
            flightTrackMode: 'SUCTION_WALL_CLIMB',
            targetSpeedMps: 20.0,
            targetPitchDeg: 90.0,
            targetRollDeg: 0.0,
            targetYawRateDegS: 0.0,
            targetAltitudeM: 10.0,
            suctionFanPowerKw: 80.0,
            skirtTargetGapMm: 3.2,
            rearWingMode: 'MAX_DOWNFORCE',
            cgtArmState: true,
            reasoningTrace: `[ADV-01 ${title}] Ascending vertical wall. 4x20 kW fans locked at 28,000 RPM (46.1 kN clamping load). Approaching 170 deg inverted overhang.`,
          };
        } else if (this.timer < 4.5) {
          return {
            flightTrackMode: 'INVERTED_RELEASE',
            targetSpeedMps: 0.0,
            targetPitchDeg: 170.0,
            targetRollDeg: 0.0,
            targetYawRateDegS: 0.0,
            targetAltitudeM: 21.0,
            suctionFanPowerKw: 0.0,
            skirtTargetGapMm: 25.0,
            rearWingMode: 'STOWED',
            cgtArmState: true,
            reasoningTrace: `[ADV-01 ${title}] Inverted pause at 21 m apex (pitch=170°). Fans cut. Skirts retracted. Firing lateral CGTs for mid-air reorientation.`,
          };
        } else {
          return {
            flightTrackMode: 'RETRO_HOVER_SLAM',
            targetSpeedMps: 1.0,
            targetPitchDeg: 0.0,
            targetRollDeg: 0.0,
            targetYawRateDegS: 0.0,
            targetAltitudeM: 0.0,
            suctionFanPowerKw: 40.0,
            skirtTargetGapMm: 10.0,
            rearWingMode: 'AIRBRAKE_90',
            cgtArmState: true,
            reasoningTrace: `[ADV-01 ${title}] 3.3g retro hover-slam burn triggered at 6.5 m. Firing 4 wheel-well nozzles to arrest sink rate < 1.2 m/s. Touchdown safe.`,
          };
        }

      case 'ADV-02': // Convoy kickflip 360 deg
        if (this.timer < 1.2) {
          return {
            flightTrackMode: 'LAUNCH_BOOST',
            targetSpeedMps: 38.0,
            targetPitchDeg: 18.0,
            targetRollDeg: 0.0,
            targetYawRateDegS: 0.0,
            targetAltitudeM: 0.0,
            suctionFanPowerKw: 80.0,
            skirtTargetGapMm: 3.5,
            rearWingMode: 'MAX_DOWNFORCE',
            cgtArmState: true,
            reasoningTrace: `[ADV-02 ${title}] Launch sprint over convoy ramp. 0-60 mph in 0.81 s. Mach diamond plume visible. Approaching takeoff at 38 m/s.`,
          };
        } else if (this.timer < 2.45) {
          return {
            flightTrackMode: 'BALLISTIC_ROLL_KICKFLIP',
            targetSpeedMps: 38.0,
            targetPitchDeg: 0.0,
            targetRollDeg: 360.0,
            targetYawRateDegS: 0.0,
            targetAltitudeM: 7.1,
            suctionFanPowerKw: 0.0,
            skirtTargetGapMm: 20.0,
            rearWingMode: 'STOWED',
            cgtArmState: true,
            reasoningTrace: `[ADV-02 ${title}] Airborne at 7.1 m apogee! Pulsing left wheel-well CGTs at 18.4 kN (alpha = +16.08 rad/s^2), arresting with right CGTs at 360 deg.`,
          };
        } else {
          return {
            flightTrackMode: 'LAUNCH_BOOST',
            targetSpeedMps: 45.0,
            targetPitchDeg: 0.0,
            targetRollDeg: 0.0,
            targetYawRateDegS: 0.0,
            targetAltitudeM: 0.0,
            suctionFanPowerKw: 80.0,
            skirtTargetGapMm: 3.5,
            rearWingMode: 'MAX_DOWNFORCE',
            cgtArmState: true,
            reasoningTrace: `[ADV-02 ${title}] Touchdown absorbed by spool-valve dampers (<0.18 m landing error). Fans re-engaged for 2g ground-effect grip.`,
          };
        }

      case 'ADV-05': // Bonneville Salt Flats Mach 0.5
        return {
          flightTrackMode: 'HIGH_SPEED_VENTURI',
          targetSpeedMps: 165.0, // 368 mph
          targetPitchDeg: 0.0,
          targetRollDeg: 0.0,
          targetYawRateDegS: 0.0,
          targetAltitudeM: 0.0,
          suctionFanPowerKw: 80.0,
          skirtTargetGapMm: 12.0,
          rearWingMode: 'STOWED',
          cgtArmState: true,
          reasoningTrace: `[ADV-05 ${title}] Speed > 200 mph: skirts articulated open to High-Speed Venturi Mode. Sustained 600L COPV burn pushing 368.4 mph.`,
        };

      default:
        return {
          flightTrackMode: 'LAUNCH_BOOST',
          targetSpeedMps: 80.0,
          targetPitchDeg: 0.0,
          targetRollDeg: 0.0,
          targetYawRateDegS: 0.0,
          targetAltitudeM: 0.0,
          suctionFanPowerKw: 80.0,
          skirtTargetGapMm: 3.5,
          rearWingMode: 'MAX_DOWNFORCE',
          cgtArmState: true,
          reasoningTrace: `[${advId}] Autonomous guidance active. Full 1 MW electric traction + cold-gas reaction attitude control engaged.`,
        };
    }
  }

  private applyControlAllocation(dt: number): void {
    const cmd = this.currentCommand;

    // 1. Suction fans
    this.state.fanPowerKw = cmd.suctionFanPowerKw;
    for (let i = 0; i < 4; i++) {
      this.state.setSkirtGapMm(i, cmd.skirtTargetGapMm);
      this.state.setFanRpm(i, (cmd.suctionFanPowerKw / 80.0) * 28000.0);
    }

    // 2. Active Aero
    if (cmd.rearWingMode === 'AIRBRAKE_90') {
      this.state.rearWingPitchDeg = 90.0;
    } else if (cmd.rearWingMode === 'MAX_DOWNFORCE') {
      this.state.rearWingPitchDeg = 35.0;
    } else {
      this.state.rearWingPitchDeg = 5.0;
    }

    // 3. Motor torque
    this.state.setMotorTorqueNm(0, 725.0);
    this.state.setMotorTorqueNm(1, 725.0);

    // 4. CGT allocation based on mode
    if (cmd.cgtArmState) {
      if (cmd.flightTrackMode === 'LAUNCH_BOOST' || cmd.flightTrackMode === 'HIGH_SPEED_VENTURI') {
        // Fire rear 4 nozzles
        for (let k = 0; k < 4; k++) this.state.setCgtValve(k, 1.0);
        for (let k = 4; k < 10; k++) this.state.setCgtValve(k, 0.0);
      } else if (cmd.flightTrackMode === 'BALLISTIC_ROLL_KICKFLIP') {
        // Asymmetric wheel lift pulses
        if (this.timer < 1.8) {
          this.state.setCgtValve(4, 1.0); // W1
          this.state.setCgtValve(6, 1.0); // W3
          this.state.setCgtValve(5, 0.0);
          this.state.setCgtValve(7, 0.0);
        } else {
          this.state.setCgtValve(4, 0.0);
          this.state.setCgtValve(6, 0.0);
          this.state.setCgtValve(5, 1.0); // W2 arrest
          this.state.setCgtValve(7, 1.0); // W4 arrest
        }
      } else if (cmd.flightTrackMode === 'RETRO_HOVER_SLAM') {
        // All 4 wheel lift nozzles + rear nozzles
        for (let k = 0; k < 8; k++) this.state.setCgtValve(k, 1.0);
      }
    } else {
      for (let k = 0; k < 10; k++) this.state.setCgtValve(k, 0.0);
    }
  }
}
