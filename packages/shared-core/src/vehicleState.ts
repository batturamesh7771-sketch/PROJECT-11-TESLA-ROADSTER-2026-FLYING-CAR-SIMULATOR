/**
 * Tesla Roadster 2026 Simulation - Shared Binary State Schema
 * Strictly typed 64-float contiguous SharedArrayBuffer state vector updated at 1,000 Hz (dt = 0.001 s)
 */

export enum VehicleVariant {
  PERFORMANCE = 0,
  THRUST = 1,
  ROCKET = 2,
}

export class VehicleStateBuffer {
  public static readonly FLOAT_COUNT = 64;
  public static readonly BYTE_LENGTH = VehicleStateBuffer.FLOAT_COUNT * Float64Array.BYTES_PER_ELEMENT;

  public readonly f64: Float64Array;

  constructor(bufferOrSab?: SharedArrayBuffer | ArrayBuffer) {
    if (bufferOrSab) {
      this.f64 = new Float64Array(bufferOrSab);
    } else {
      // Create new buffer (support SharedArrayBuffer where available, fallback to ArrayBuffer)
      const storage = typeof SharedArrayBuffer !== 'undefined'
        ? new SharedArrayBuffer(VehicleStateBuffer.BYTE_LENGTH)
        : new ArrayBuffer(VehicleStateBuffer.BYTE_LENGTH);
      this.f64 = new Float64Array(storage);
    }
  }

  public get buffer(): ArrayBufferLike {
    return this.f64.buffer;
  }

  // -------------------------------------------------------------
  // 1. Inertial Position & Velocity (Body/World Frame)
  // -------------------------------------------------------------
  public get posX(): number { return this.f64[0]; }
  public set posX(v: number) { this.f64[0] = v; }
  public get posY(): number { return this.f64[1]; }
  public set posY(v: number) { this.f64[1] = v; }
  public get posZ(): number { return this.f64[2]; }
  public set posZ(v: number) { this.f64[2] = v; }

  public get velX(): number { return this.f64[3]; }
  public set velX(v: number) { this.f64[3] = v; }
  public get velY(): number { return this.f64[4]; }
  public set velY(v: number) { this.f64[4] = v; }
  public get velZ(): number { return this.f64[5]; }
  public set velZ(v: number) { this.f64[5] = v; }

  // -------------------------------------------------------------
  // 2. Attitude Quaternion & Angular Velocity
  // -------------------------------------------------------------
  public get quatW(): number { return this.f64[6]; }
  public set quatW(v: number) { this.f64[6] = v; }
  public get quatX(): number { return this.f64[7]; }
  public set quatX(v: number) { this.f64[7] = v; }
  public get quatY(): number { return this.f64[8]; }
  public set quatY(v: number) { this.f64[8] = v; }
  public get quatZ(): number { return this.f64[9]; }
  public set quatZ(v: number) { this.f64[9] = v; }

  public get omegaX(): number { return this.f64[10]; }
  public set omegaX(v: number) { this.f64[10] = v; }
  public get omegaY(): number { return this.f64[11]; }
  public set omegaY(v: number) { this.f64[11] = v; }
  public get omegaZ(): number { return this.f64[12]; }
  public set omegaZ(v: number) { this.f64[12] = v; }

  // -------------------------------------------------------------
  // 3. Variant & COPV Real-Gas System
  // -------------------------------------------------------------
  public get variant(): VehicleVariant { return this.f64[13] as VehicleVariant; }
  public set variant(v: VehicleVariant) { this.f64[13] = v; }

  public get gasMassKg(): number { return this.f64[14]; }
  public set gasMassKg(v: number) { this.f64[14] = v; }

  public get stagnationPressureBar(): number { return this.f64[15]; }
  public set stagnationPressureBar(v: number) { this.f64[15] = v; }

  public get stagnationTempK(): number { return this.f64[16]; }
  public set stagnationTempK(v: number) { this.f64[16] = v; }

  public get compressibilityZ(): number { return this.f64[17]; }
  public set compressibilityZ(v: number) { this.f64[17] = v; }

  public get compressorActive(): boolean { return this.f64[18] > 0.5; }
  public set compressorActive(v: boolean) { this.f64[18] = v ? 1.0 : 0.0; }

  // -------------------------------------------------------------
  // 4. 10 SpaceX Cold-Gas Thruster States
  // -------------------------------------------------------------
  // Indices 19..28: valveOpenRatio (0.0..1.0)
  public getCgtValve(idx: number): number { return this.f64[19 + idx]; }
  public setCgtValve(idx: number, v: number): void { this.f64[19 + idx] = Math.max(0.0, Math.min(1.0, v)); }

  public get cgtRearGimbalPitch(): number { return this.f64[29]; }
  public set cgtRearGimbalPitch(v: number) { this.f64[29] = v; }
  public get cgtRearGimbalYaw(): number { return this.f64[30]; }
  public set cgtRearGimbalYaw(v: number) { this.f64[30] = v; }

  public get cgtTotalMassFlowKgS(): number { return this.f64[33]; }
  public set cgtTotalMassFlowKgS(v: number) { this.f64[33] = v; }
  public get cgtTotalThrustN(): number { return this.f64[34]; }
  public set cgtTotalThrustN(v: number) { this.f64[34] = v; }

  // -------------------------------------------------------------
  // 5. Underbody Suction Fan & Skirt Sealing States
  // -------------------------------------------------------------
  // Indices 35..38: fanRpm[0..3]
  public getFanRpm(idx: number): number { return this.f64[35 + idx]; }
  public setFanRpm(idx: number, v: number): void { this.f64[35 + idx] = v; }

  public get fanPowerKw(): number { return this.f64[39]; }
  public set fanPowerKw(v: number) { this.f64[39] = v; }

  // Indices 40..43: skirtGapMm[0..3]
  public getSkirtGapMm(idx: number): number { return this.f64[40 + idx]; }
  public setSkirtGapMm(idx: number, v: number): void { this.f64[40 + idx] = v; }

  public get plenumVacuumKpa(): number { return this.f64[44]; }
  public set plenumVacuumKpa(v: number) { this.f64[44] = v; }

  public get suctionDownforceN(): number { return this.f64[45]; }
  public set suctionDownforceN(v: number) { this.f64[45] = v; }

  public get venturiBypassOpen(): boolean { return this.f64[46] > 0.5; }
  public set venturiBypassOpen(v: boolean) { this.f64[46] = v ? 1.0 : 0.0; }

  // -------------------------------------------------------------
  // 6. Active Aerodynamics
  // -------------------------------------------------------------
  public get rearWingPitchDeg(): number { return this.f64[47]; }
  public set rearWingPitchDeg(v: number) { this.f64[47] = v; }

  public get frontWingFlapDeg(): number { return this.f64[48]; }
  public set frontWingFlapDeg(v: number) { this.f64[48] = v; }

  public get bargeBoardDeployMm(): number { return this.f64[49]; }
  public set bargeBoardDeployMm(v: number) { this.f64[49] = v; }

  public get hoodVentOpenRatio(): number { return this.f64[50]; }
  public set hoodVentOpenRatio(v: number) { this.f64[50] = v; }

  public get passiveAeroDownforceN(): number { return this.f64[51]; }
  public set passiveAeroDownforceN(v: number) { this.f64[51] = v; }

  public get aeroDragN(): number { return this.f64[52]; }
  public set aeroDragN(v: number) { this.f64[52] = v; }

  // -------------------------------------------------------------
  // 7. RWD Electric Powertrain & Chassis
  // -------------------------------------------------------------
  // Indices 53..54: motorTorqueNm[0..1]
  public getMotorTorqueNm(idx: number): number { return this.f64[53 + idx]; }
  public setMotorTorqueNm(idx: number, v: number): void { this.f64[53 + idx] = v; }

  // Indices 55..56: inverterPowerKw[0..1]
  public getInverterPowerKw(idx: number): number { return this.f64[55 + idx]; }
  public setInverterPowerKw(idx: number, v: number): void { this.f64[55 + idx] = v; }

  public get batterySocPct(): number { return this.f64[57]; }
  public set batterySocPct(v: number) { this.f64[57] = v; }

  public get batteryTempC(): number { return this.f64[58]; }
  public set batteryTempC(v: number) { this.f64[58] = v; }

  // Indices 59..62: wheelSlipRatio[0..3]
  public getWheelSlip(idx: number): number { return this.f64[59 + idx]; }
  public setWheelSlip(idx: number, v: number): void { this.f64[59 + idx] = v; }

  public get yokeAngleDeg(): number { return this.f64[63]; }
  public set yokeAngleDeg(v: number) { this.f64[63] = v; }

  // -------------------------------------------------------------
  // Convenience Helpers
  // -------------------------------------------------------------
  public initRocketDefaults(): void {
    this.f64.fill(0);
    this.quatW = 1.0;
    this.variant = VehicleVariant.ROCKET;
    this.gasMassKg = 240.0;
    this.stagnationPressureBar = 379.2;
    this.stagnationTempK = 293.15;
    this.compressibilityZ = 1.192;
    this.batterySocPct = 95.0;
    this.batteryTempC = 32.0;
    for (let i = 0; i < 4; i++) {
      this.setSkirtGapMm(i, 3.5);
    }
  }

  public initThrustDefaults(): void {
    this.initRocketDefaults();
    this.variant = VehicleVariant.THRUST;
    this.gasMassKg = 83.0;
  }

  public initPerformanceDefaults(): void {
    this.initRocketDefaults();
    this.variant = VehicleVariant.PERFORMANCE;
    this.gasMassKg = 0.0;
    this.stagnationPressureBar = 1.013;
  }
}
