import * as THREE from 'three';
import { TrackSurfaceEvaluator } from './TrackSurfaceEvaluator';
import { CityTrafficWorld } from '../cad/CityTrafficWorld';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';

export interface TestRunResult {
  runId: string;
  testId: string;
  entrySpeedKmh: number;
  stoppingDistanceM: number;
  peakDecelG: number;
  stoppingTimeSec: number;
  passed: boolean;
  notes: string;
  timestamp: string;
}

export class GroundVehicleDynamics {
  // Vehicle Parameters (Tesla Roadster Next-Gen Flight Variant Specs)
  public readonly massKg: number = 1980.0;
  public readonly wheelBaseM: number = 2.75;
  public readonly trackWidthM: number = 1.68;
  public readonly tireRadiusM: number = 0.355;
  public readonly maxMotorTorqueNm: number = 1000.0;
  public readonly maxBrakeForceN: number = 24000.0;
  public readonly dragCoeffCd: number = 0.28;
  public readonly frontalAreaM2: number = 1.95;
  public readonly airDensityKgM3: number = 1.204;
  public readonly muDryAsphalt: number = 1.26;
  public readonly gravityMps2: number = 9.80665;
  public readonly weightN: number = 1980.0 * 9.80665; // ~19,417 N (19.42 kN)
  public readonly maxColdGasThrustKn: number = 78.4;   // 78.4 kN max Cold-Gas thrust
  public readonly loopRadiusM: number = TrackSurfaceEvaluator.RAMP_RADIUS; // 14.0m (Apex = 28.0m, strictly within 25-35m limit)

  // Interactive Trim Variant & Autonomous/Manual Control Mode
  public trimVariant: 'Rocket' | 'Thrust' | 'Performance' = 'Rocket';
  public controlMode: 'AUTONOMOUS' | 'MANUAL REMOTE' = 'AUTONOMOUS';

  // Tunable Live Physics Parameters & Sliders
  public userGravityMps2: number = 9.80665;
  public userVehicleMassKg: number = 1980.0;
  public userMaxThrustKn: number = 78.4;
  public simTimeScale: number = 1.0;
  public pidAltitudeKp: number = 1400.0;
  public pidAltitudeKi: number = 45.0;
  public pidAltitudeKd: number = 2800.0;

  // Real-Time 10-Nozzle Vectoring Outputs (kN)
  public nozzleFL: number = 0.0;
  public nozzleFR: number = 0.0;
  public nozzleRL: number = 0.0;
  public nozzleRR: number = 0.0;
  public nozzlePerimeterEach: number = 0.0;
  public activeNozzleCount: number = 0;

  // Environmental Weather & Wind Physics
  public weather: 'Clear' | 'Crosswind Gusts' | 'Rain / Wet Track' | 'Night Dusk' = 'Clear';
  public windSpeedKmh: number = 12.0;
  public ambientTempC: number = 22.0;

  // Battery, Thermal & Air Compressor
  public batteryPercent: number = 94.0;
  public systemTempC: number = 28.5;
  public copvCompressorActive: boolean = false;

  // Unit System & Visual FX Toggles
  public unitSystem: 'Metric' | 'Imperial' = 'Metric';
  public fxPlumesEnabled: boolean = true;
  public fxGroundShockwaveEnabled: boolean = true;
  public fxForceVectorsEnabled: boolean = true;
  public fxCameraShakeEnabled: boolean = true;

  // Active Theme / Trail Selection
  public activeTheme: 'THEME_1_RAMP' | 'THEME_2_TRAFFIC' = 'THEME_1_RAMP';
  public trafficBlockadeDetected: boolean = false;
  public mission09Phase: 'APPROACH_TRAFFIC' | 'STUCK_IN_TRAFFIC' | 'VERTICAL_LIFTOFF' | 'FLY_OVER_TRAFFIC' | 'RETRO_LANDING' | 'OPEN_HIGHWAY_CRUISE' = 'APPROACH_TRAFFIC';

  // Inertias for attitude simulation (kg*m^2)
  public readonly Ixx: number = 850.0;  // Roll inertia
  public readonly Iyy: number = 2400.0; // Pitch inertia
  public readonly Izz: number = 2600.0; // Yaw inertia

  // 6-DOF Kinematic & Dynamic State (Position & Velocity in 3D)
  public posX: number = -180.0;  // Starts directly on the runway
  public posY: number = 0.0;     // Resting on asphalt road
  public posZ: number = 0.0;
  private lastPosY: number = 0.0;

  public velX: number = 0.0;
  public velY: number = 0.0;
  public velZ: number = 0.0;

  public accelX: number = 0.0;
  public accelY: number = 0.0;
  public accelZ: number = 0.0;

  public yawRad: number = 0.0;
  public pitchRad: number = 0.0;
  public rollRad: number = 0.0;

  public yawRateRadS: number = 0.0;
  public pitchRateRadS: number = 0.0;
  public rollRateRadS: number = 0.0;

  public speedMps: number = 0.0;
  public speedKmh: number = 0.0;
  public accelG: number = 0.0;

  // Road & Ramp State
  public rampThetaRad: number = 0.0; // Angle along curved aerobatic ramp (0 to 2.95 rad)
  public isOnRamp: boolean = false;

  // Flight & Cold-Gas Propulsion State
  public totalThrustKn: number = 0.0;
  public thrustXKn: number = 0.0;
  public thrustYKn: number = 0.0;
  public isBoosting: boolean = false;
  public isHoverActive: boolean = false;
  public isLandingActive: boolean = false;
  public targetHoverAltitudeM: number = 15.0;

  // Active PID Altitude & Balancing State
  public pidAltitudeIntegral: number = 0.0;
  public pidPitchIntegral: number = 0.0;
  public pidRollIntegral: number = 0.0;

  // Cold Gas Cylinders (COPV) - 7,500 psi default
  public copvPressurePsi: number = 7500.0;
  public copvMaxPressurePsi: number = 7500.0;
  public copvCapacityL: number = 600.0;
  public copvDepletionMultiplier: number = 1.0;

  // Vehicle Systems & Telemetry
  public batterySocPercent: number = 94.0;
  public fanPowerPercent: number = 0.0;
  public fanDownforceKn: number = 0.0;
  public isLizardSuctionActive: boolean = false; // Active 2.0g suction on wall/ceiling (> 15 deg)
  public boostActiveTimerSec: number = 0.0;     // Clamped to 5.0s max continuous burst
  public flightMode: string = 'Ground / Runway Ready';
  public isFlightVariant: boolean = true;
  public flightSequenceIndex: number = 0; // 0: Approach, 1: Takeoff, 2: Mid-Air Flip/Hover, 3: Inverted, 4: Landing

  // Steering & Driver Controls
  public steerAngleRad: number = 0.0;
  public targetSteerAngleRad: number = 0.0;
  public throttle: number = 0.0;
  public brake: number = 0.0;
  public handbrake: boolean = false;
  public gear: 'P' | 'R' | 'N' | 'D' = 'D';

  public wheelRotations: [number, number, number, number] = [0, 0, 0, 0];

  // Telemetry History Recording (Rolling Ring Buffer)
  public history: { time: number; speedKmh: number; accelG: number; altitudeM: number; totalThrustKn: number; gForce: number; systemTempC: number }[] = [];
  public simTimeSec: number = 0.0;

  // Autonomy Live Event Logs
  public autonomyLogs: Array<{ id: string; timestamp: string; message: string; type: 'info' | 'thrust' | 'flip' | 'suction' | 'warn' | 'success' }> = [
    { id: 'log_0', timestamp: '14:31:02', message: 'FSD Neural Planner initialized (Model v2026.4)', type: 'info' },
    { id: 'log_1', timestamp: '14:31:05', message: 'COPV Tank Dual Array online at 7,500 psi (600L)', type: 'info' },
    { id: 'log_2', timestamp: '14:31:08', message: 'Twin 20 kW Ground Effect Suction Fans calibrated', type: 'suction' },
    { id: 'log_3', timestamp: '14:31:12', message: '10 Perimeter Cold-Gas Thruster Nozzles verified nominal', type: 'thrust' },
  ];

  // Session Peak Telemetry KPIs & Historical Flight Runs
  public sessionMaxSpeedKmh: number = 0.0;
  public sessionMaxAltitudeM: number = 0.0;
  public sessionPeakThrustKn: number = 0.0;
  public sessionPeakG: number = 1.0;
  public sessionMinCopvPsi: number = 7500.0;
  public sessionTotalFlightTimeSec: number = 0.0;
  public sessionFlightRuns: Array<{ id: string; theme: string; timestamp: string; maxAlt: number; gasUsed: number; sinkRate: number; grade: 'SMOOTH' | 'FIRM' | 'HARD' }> = [];

  // Mission & Test State
  public isTestRunning: boolean = true;
  public activeTestId: string = 'MISSION-08';
  public testPhase: 'IDLE' | 'ACCELERATING' | 'BRAKING' | 'COMPLETED' = 'ACCELERATING';
  public mission08Phase: 'APPROACH' | 'TAKEOFF' | 'MID_AIR_FLIP' | 'INVERTED_DRIVE' | 'LANDING' = 'APPROACH';

  public isAutoFlightActive: boolean = false;
  public autoFlightTimer: number = 0.0;
  public flipProgress: number = 0.0;

  // 4-Phase Finite Ballistic 3D Flip (Newtonian Free-Fall Maneuver)
  public flipPhase: 'IDLE' | 'LAUNCH_POP' | 'FREEFALL_ROTATION' | 'ANGULAR_BRAKE' | 'LANDING_CATCH' = 'IDLE';
  public flipType: 'FLAT_360' | 'LIP_180' = 'FLAT_360';
  public flipRotationAngleRad: number = 0.0;
  public flipTimerSec: number = 0.0;

  public lastTestResult: TestRunResult | null = {
    runId: 'RUN-1',
    testId: 'T-01',
    entrySpeedKmh: 100.0,
    stoppingDistanceM: 31.36,
    peakDecelG: 1.26,
    stoppingTimeSec: 2.27,
    passed: true,
    notes: 'PASSED: 31.36m (< 43.0m target). Peak decel 1.26g.',
    timestamp: '14:30:00',
  };

  public testHistory: TestRunResult[] = [
    {
      runId: 'RUN-1',
      testId: 'T-01',
      entrySpeedKmh: 100.0,
      stoppingDistanceM: 31.36,
      peakDecelG: 1.26,
      stoppingTimeSec: 2.27,
      passed: true,
      notes: 'PASSED: 31.36m (< 43.0m target). Peak decel 1.26g.',
      timestamp: '14:30:00',
    },
  ];

  // Key tracking
  private keysDown: Record<string, boolean> = {};

  constructor() {
    this.initKeyboardListeners();
    // Default: Start directly ON THE ROAD runway ready to drive and test!
    this.resetToGround();
  }

  private initKeyboardListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      this.keysDown[e.code] = true;
      if (e.code === 'KeyR') {
        this.resetToGround();
      } else if (e.code === 'Space') {
        this.isBoosting = true;
      } else if (e.code === 'KeyV') {
        this.toggleHoverMode();
      } else if (e.code === 'KeyL') {
        this.initiateSmoothLanding();
      } else if (e.code === 'KeyF') {
        this.triggerFlipManeuver();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.code] = false;
      if (e.code === 'Space') {
        this.isBoosting = false;
      }
    });
  }

  /**
   * Switch between Theme 1 (McGregor Ramp Loop) and Theme 2 (Heavy City Traffic Escape)
   */
  public setTheme(theme: 'THEME_1_RAMP' | 'THEME_2_TRAFFIC'): void {
    this.activeTheme = theme;
    this.activeTestId = theme === 'THEME_1_RAMP' ? 'MISSION-08' : 'MISSION-09';
    this.resetToGround();
  }

  /**
   * Reset car directly to the asphalt road at the beginning of the runway/highway
   */
  public resetToGround(): void {
    if (this.activeTheme === 'THEME_2_TRAFFIC') {
      this.posX = -65.0; // Starts 45m behind traffic blockade at X = -20m
      this.posY = 0.0;
      this.posZ = 2.5;   // In lane 2
      this.flightMode = 'City Highway (Traffic Ahead)';
      this.mission09Phase = 'APPROACH_TRAFFIC';
    } else {
      this.posX = -180.0;
      this.posY = 0.0;
      this.posZ = 0.0;
      this.flightMode = 'Ground / Runway Ready';
      this.mission08Phase = 'APPROACH';
    }

    this.velX = 0.0;
    this.velY = 0.0;
    this.velZ = 0.0;

    this.accelX = 0.0;
    this.accelY = 0.0;
    this.accelZ = 0.0;

    this.yawRad = 0.0;
    this.pitchRad = 0.0;
    this.rollRad = 0.0;

    this.yawRateRadS = 0.0;
    this.pitchRateRadS = 0.0;
    this.rollRateRadS = 0.0;

    this.speedMps = 0.0;
    this.speedKmh = 0.0;
    this.accelG = 0.0;

    this.rampThetaRad = 0.0;
    this.isOnRamp = false;

    this.throttle = 0.0;
    this.brake = 0.0;
    this.totalThrustKn = 0.0;
    this.thrustXKn = 0.0;
    this.thrustYKn = 0.0;

    this.isBoosting = false;
    this.isHoverActive = false;
    this.isLandingActive = false;
    this.isAutoFlightActive = false;
    this.isLizardSuctionActive = false;
    this.trafficBlockadeDetected = false;
    this.boostActiveTimerSec = 0.0;
    this.fanPowerPercent = 0.0;
    this.fanDownforceKn = 0.0;
    this.flipProgress = 0.0;
    this.flipPhase = 'IDLE';
    this.flipType = 'FLAT_360';
    this.flipRotationAngleRad = 0.0;
    this.flipTimerSec = 0.0;

    this.pidAltitudeIntegral = 0.0;
    this.pidPitchIntegral = 0.0;
    this.pidRollIntegral = 0.0;

    this.flightSequenceIndex = 0;
    this.simTimeSec = 0.0;

    // Refill COPV tanks to max pressure (7,500 psi for Rocket, 5,000 for Thrust, 0 for Performance)
    this.copvPressurePsi = this.copvMaxPressurePsi;
    this.copvCompressorActive = false;
  }

  /**
   * Set vehicle trim variant (Rocket, Thrust, Performance)
   */
  public setTrimVariant(variant: 'Rocket' | 'Thrust' | 'Performance'): void {
    this.trimVariant = variant;
    if (variant === 'Rocket') {
      this.copvMaxPressurePsi = 7500.0;
      this.copvCapacityL = 600.0;
      this.userMaxThrustKn = 78.4;
      this.copvPressurePsi = 7500.0;
    } else if (variant === 'Thrust') {
      this.copvMaxPressurePsi = 5000.0;
      this.copvCapacityL = 300.0;
      this.userMaxThrustKn = 48.0;
      this.copvPressurePsi = Math.min(this.copvPressurePsi, 5000.0);
      this.isHoverActive = false;
    } else if (variant === 'Performance') {
      this.copvMaxPressurePsi = 0.0;
      this.copvCapacityL = 0.0;
      this.userMaxThrustKn = 0.0;
      this.copvPressurePsi = 0.0;
      this.totalThrustKn = 0.0;
      this.isHoverActive = false;
      this.isBoosting = false;
    }
    this.logAutonomyEvent(`Vehicle configuration switched to ${variant} Trim`, 'info');
  }

  /**
   * Set simulation weather preset
   */
  public setWeatherPreset(weather: 'Clear' | 'Crosswind Gusts' | 'Rain / Wet Track' | 'Night Dusk'): void {
    this.weather = weather;
    if (weather === 'Clear') {
      this.windSpeedKmh = 12.0;
      this.ambientTempC = 22.0;
    } else if (weather === 'Crosswind Gusts') {
      this.windSpeedKmh = 45.0;
      this.ambientTempC = 19.0;
    } else if (weather === 'Rain / Wet Track') {
      this.windSpeedKmh = 24.0;
      this.ambientTempC = 15.0;
    } else if (weather === 'Night Dusk') {
      this.windSpeedKmh = 8.0;
      this.ambientTempC = 16.0;
    }
    this.logAutonomyEvent(`Weather preset updated: ${weather} (${this.windSpeedKmh} km/h)`, 'info');
  }

  /**
   * Stream live event to the AI Autonomy Event Log
   */
  public logAutonomyEvent(message: string, type: 'info' | 'thrust' | 'flip' | 'suction' | 'warn' | 'success' = 'info'): void {
    const d = new Date();
    const timeStr = d.toTimeString().split(' ')[0];
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      message,
      type,
    };
    this.autonomyLogs.push(newLog);
    if (this.autonomyLogs.length > 80) {
      this.autonomyLogs.shift();
    }
  }

  /**
   * Launch certified mission test (M-01 to M-09)
   */
  public launchMissionTest(missionId: string): void {
    this.activeTestId = missionId;
    this.isTestRunning = true;
    this.controlMode = 'AUTONOMOUS';
    this.logAutonomyEvent(`Autonomous test initiated: ${missionId}`, 'info');

    if (missionId === 'M-01') {
      this.setTheme('THEME_1_RAMP');
      this.resetToGround();
      this.posX = -180.0;
      this.throttle = 1.0;
      this.isBoosting = true;
      this.flightMode = 'M-01: 0–60 mph Cold-Gas Sprint';
      this.logAutonomyEvent('M-01: Cold-gas vectoring full thrust engaged', 'thrust');
    } else if (missionId === 'M-02') {
      this.setTheme('THEME_1_RAMP');
      this.resetToGround();
      this.posX = -170.0;
      this.velX = 52.0; // pre-roll
      this.speedKmh = 187.2;
      this.throttle = 1.0;
      this.isBoosting = true;
      this.flightMode = 'M-02: High-Speed 230+ mph Aero Run';
      this.logAutonomyEvent('M-02: Active rear wing pitched for high-speed stability', 'info');
    } else if (missionId === 'M-03') {
      this.setTheme('THEME_1_RAMP');
      this.resetToGround();
      this.posX = -140.0;
      this.velX = 35.0;
      this.speedKmh = 126.0;
      this.throttle = 0.8;
      this.isLizardSuctionActive = true;
      this.fanPowerPercent = 100.0;
      this.fanDownforceKn = 39.2;
      this.flightMode = 'M-03: 2.0G Suction Slalom Course';
      this.logAutonomyEvent('M-03: 20 kW twin turbines sealed to track for 2.0G cornering', 'suction');
    } else if (missionId === 'M-04') {
      this.setTheme('THEME_1_RAMP');
      this.setFlightSequenceStep(1);
      this.logAutonomyEvent('M-04: Ramp approach & wall suction climb active', 'info');
    } else if (missionId === 'M-05') {
      this.setTheme('THEME_1_RAMP');
      this.setFlightSequenceStep(2);
      this.logAutonomyEvent('M-05: 180° Inverted drive confirmed on ceiling arch', 'suction');
    } else if (missionId === 'M-06') {
      this.setTheme('THEME_2_TRAFFIC');
      this.setFlightSequenceStep(2);
      this.logAutonomyEvent('M-06: Traffic escape flyover and mid-air flip active', 'flip');
    } else if (missionId === 'M-07') {
      this.setTheme('THEME_1_RAMP');
      this.resetToGround();
      this.setWeatherPreset('Crosswind Gusts');
      this.posX = -100.0;
      this.posY = 15.0;
      this.toggleHoverMode(15.0);
      this.flightMode = 'M-07: Crosswind PID Hover Stability (15.0m)';
      this.logAutonomyEvent('M-07: 45 km/h crosswinds active, PID attitude balancing', 'warn');
    } else if (missionId === 'M-08') {
      this.setTheme('THEME_1_RAMP');
      this.startAutoLoopFlight();
    } else if (missionId === 'M-09') {
      this.setTheme('THEME_2_TRAFFIC');
      this.startAutoLoopFlight();
    }
  }

  /**
   * Continuous Rocket Boost Activation (can be triggered by click or held down)
   */
  public triggerRocketBoost(holdDurationMs: number = 3000): void {
    this.isBoosting = true;
    this.boostActiveTimerSec = 0.0;
    if (holdDurationMs > 0) {
      setTimeout(() => {
        if (!this.keysDown['Space']) {
          this.isBoosting = false;
        }
      }, holdDurationMs);
    }
  }

  /**
   * Toggle Active Altitude Hover & Dynamic PID Balance
   */
  public toggleHoverMode(targetAlt?: number): void {
    if (this.isHoverActive) {
      this.isHoverActive = false;
      this.flightMode = 'Hover Disengaged (Free Flight)';
    } else {
      this.isHoverActive = true;
      this.isLandingActive = false;
      this.flipPhase = 'IDLE';
      this.isOnRamp = false; // Detaches to hover
      this.isLizardSuctionActive = false;
      this.targetHoverAltitudeM = targetAlt !== undefined 
        ? Math.min(28.0, targetAlt)
        : (this.posY > 3.0 ? Math.min(28.0, this.posY) : 18.0);
      this.pidAltitudeIntegral = 0.0;
      this.flightMode = `Active Hover & PID Balance (${this.targetHoverAltitudeM.toFixed(1)}m)`;
    }
  }

  /**
   * Initiate Smooth Landing Sequence:
   * Actively balances thrusters to gently descend and touch down without freezing.
   */
  public initiateSmoothLanding(): void {
    if (this.posY <= 0.1) return; // Already on ground
    this.isLandingActive = true;
    this.isHoverActive = false;
    this.flipPhase = 'IDLE';
    this.isOnRamp = false;
    this.isLizardSuctionActive = false;
    this.flightMode = 'Smooth Landing Descent';
  }

  /**
   * Trigger 360° Mid-Air 4-Phase Ballistic Pitch Flip Maneuver (Rule 3)
   */
  public triggerFlipManeuver(): void {
    if (this.flipPhase !== 'IDLE') return; // Do not loop or retrigger while active
    if (this.copvPressurePsi <= 150.0) {
      this.flightMode = 'FLIP INHIBITED: COPV Gas Depleted';
      return;
    }

    this.isHoverActive = false;
    this.isLandingActive = false;
    this.isOnRamp = false;
    this.isLizardSuctionActive = false;
    this.flipType = 'FLAT_360';
    this.flipTimerSec = 0.0;
    this.flipRotationAngleRad = 0.0;
    this.flipProgress = 0.01;

    // Phase 1 (Launch Pop): If car is on ground or low altitude/velocity, fire downward nozzles at 78 kN
    if (this.posY < 6.0 || this.velY < 8.0) {
      this.flipPhase = 'LAUNCH_POP';
      this.flightMode = 'Flip Phase 1: 78kN Launch Pop';
    } else {
      // Already airborne with vertical velocity: enter ballistic free-fall rotation directly
      this.flipPhase = 'FREEFALL_ROTATION';
      this.flightMode = 'Flip Phase 2: Ballistic 360° Free-Fall';
    }
  }

  /**
   * Trigger Single 180° Flip Maneuver on Ramp Lip Exit (Rule 3)
   */
  public triggerLipFlipManeuver(): void {
    this.flipPhase = 'FREEFALL_ROTATION';
    this.flipType = 'LIP_180';
    this.flipTimerSec = 0.0;
    this.flipRotationAngleRad = Math.PI; // Starts upside down at 180°
    this.pitchRad = Math.PI;
    this.flipProgress = 0.01;
    this.isHoverActive = false;
    this.isLandingActive = false;
    this.isOnRamp = false;
    this.isLizardSuctionActive = false;
    this.fanDownforceKn = 0.0;
    this.flightMode = 'Lip Exit: Gravity Drop & 180° Flip';
  }

  /**
   * Start Autonomous Loop Flight Test (Mission 08 or Mission 09)
   */
  public startAutoLoopFlight(): void {
    this.resetToGround();
    this.isAutoFlightActive = true;
    this.autoFlightTimer = 0.0;
    this.gear = 'D';

    if (this.activeTheme === 'THEME_2_TRAFFIC') {
      this.posX = -65.0; // 45m approach before traffic blockade at X = -20m
      this.posZ = 2.5;
      this.throttle = 0.65;
      this.brake = 0.0;
      this.trafficBlockadeDetected = false;
      this.mission09Phase = 'APPROACH_TRAFFIC';
      this.flightMode = 'Mission 09: City Highway Traffic Approach';
    } else {
      this.posX = -120.0; // 90m approach runway run up to curved ramp at -30m
      this.throttle = 1.0;
      this.isBoosting = true;
      this.mission08Phase = 'APPROACH';
      this.flightMode = 'Mission 08: Approach Runway';
    }
  }

  /**
   * Set specific flight storyboard step from UI cards (Theme 1 or Theme 2)
   */
  public setFlightSequenceStep(idx: number): void {
    this.flightSequenceIndex = idx;
    this.isAutoFlightActive = false;
    this.isLandingActive = false;
    this.pidAltitudeIntegral = 0.0;

    // -------------------------------------------------------------------------
    // THEME 2: HEAVY CITY TRAFFIC ESCAPE (Mission 09)
    // -------------------------------------------------------------------------
    if (this.activeTheme === 'THEME_2_TRAFFIC') {
      if (idx === 0) {
        // Stage 1: Stuck in Gridlock (Ground Path Blocked)
        this.resetToGround();
        this.posX = -18.0;
        this.posY = 0.0;
        this.posZ = 2.5;
        this.velX = 0.0;
        this.speedKmh = 0.0;
        this.speedMps = 0.0;
        this.throttle = 0.0;
        this.brake = 1.0;
        this.trafficBlockadeDetected = true;
        this.mission09Phase = 'STUCK_IN_TRAFFIC';
        this.flightMode = '1. Stuck in Gridlock (Ground Path Blocked)';
      } else if (idx === 1) {
        // Stage 2: Vertical COPV Liftoff (10.5m Clearance above 4.2m Semi)
        this.resetToGround();
        this.posX = -16.0;
        this.posY = 10.5;
        this.posZ = 2.5;
        this.velX = 0.0;
        this.velY = 2.0;
        this.speedKmh = 7.2;
        this.speedMps = 2.0;
        this.totalThrustKn = 72.0;
        this.thrustYKn = 72.0;
        this.mission09Phase = 'VERTICAL_LIFTOFF';
        this.flightMode = '2. Vertical COPV Liftoff (10.5m Clearance)';
      } else if (idx === 2) {
        // Stage 3: Air-Cruise & 360° Flip Over Gridlock
        this.resetToGround();
        this.posX = 25.0;
        this.posY = 10.0;
        this.posZ = 2.5;
        this.velX = 26.5; // 95 km/h
        this.velY = 0.0;
        this.speedKmh = 95.4;
        this.speedMps = 26.5;
        this.totalThrustKn = 38.0;
        this.thrustYKn = 19.6;
        this.thrustXKn = 32.0;
        this.mission09Phase = 'FLY_OVER_TRAFFIC';
        this.flightMode = '3. Air-Cruise Over Traffic Jam (95 km/h)';
      } else if (idx === 3) {
        // Stage 4: Gravity Descent & 10-Nozzle Retro-Catch
        this.resetToGround();
        this.posX = 85.0;
        this.posY = 3.2;
        this.posZ = 2.5;
        this.velX = 12.0;
        this.velY = -0.4;
        this.speedKmh = 43.2;
        this.speedMps = 12.0;
        this.totalThrustKn = 32.0;
        this.thrustYKn = 32.0;
        this.mission09Phase = 'RETRO_LANDING';
        this.flightMode = '4. Gravity Descent & 10-Nozzle Retro-Catch';
      } else if (idx === 4) {
        // Stage 5: Open Highway Touchdown & Cruise
        this.resetToGround();
        this.posX = 125.0;
        this.posY = 0.0;
        this.posZ = 2.5;
        this.velX = 22.2; // 80 km/h
        this.velY = 0.0;
        this.speedKmh = 80.0;
        this.speedMps = 22.2;
        this.totalThrustKn = 0.0;
        this.thrustYKn = 0.0;
        this.mission09Phase = 'OPEN_HIGHWAY_CRUISE';
        this.flightMode = '5. Touchdown & Open Highway Cruise (80 km/h)';
      }
      return;
    }

    // -------------------------------------------------------------------------
    // THEME 1: MCGREGOR RAMP LOOP (Mission 08, 100% Intact)
    // -------------------------------------------------------------------------
    if (idx === 0) {
      // 1. Approach Runway (0.0m)
      this.resetToGround();
      this.posX = -120.0;
      this.velX = 38.9; // 140 km/h
      this.speedKmh = 140.0;
      this.speedMps = 38.9;
      this.totalThrustKn = 15.0;
      this.mission08Phase = 'APPROACH';
      this.flightMode = 'Approach Runway (0.0m)';
    } else if (idx === 1) {
      // 2. Wall Climb & 2.0g Lizard Suction (14.0m)
      this.resetToGround();
      this.isOnRamp = true;
      this.rampThetaRad = Math.PI / 2; // 90 deg vertical wall
      const pt = TrackSurfaceEvaluator.getRampPoint(this.rampThetaRad);
      this.posX = pt.x;
      this.posY = pt.y; // 14.0m
      this.pitchRad = pt.pitchRad; // 90 deg
      this.velX = 35.0;
      this.speedKmh = 126.0;
      this.speedMps = 35.0;
      this.isLizardSuctionActive = true;
      this.fanPowerPercent = 100.0;
      this.fanDownforceKn = 39.2;
      this.mission08Phase = 'TAKEOFF';
      this.flightMode = 'Wall Climb & 2.0g Lizard Suction (14.0m)';
    } else if (idx === 2) {
      // 3. Inverted Ceiling Adhesion (28.0m)
      this.resetToGround();
      this.isOnRamp = true;
      this.rampThetaRad = Math.PI * 0.95; // Near ceiling lip
      const pt = TrackSurfaceEvaluator.getRampPoint(this.rampThetaRad);
      this.posX = pt.x;
      this.posY = pt.y; // ~28.0m
      this.pitchRad = pt.pitchRad; // ~171 deg upside down
      this.velX = 28.0;
      this.speedKmh = 100.8;
      this.speedMps = 28.0;
      this.isLizardSuctionActive = true;
      this.fanPowerPercent = 100.0;
      this.fanDownforceKn = 39.2;
      this.mission08Phase = 'INVERTED_DRIVE';
      this.flightMode = 'Inverted Ceiling Adhesion (28.0m)';
    } else if (idx === 3) {
      // 4. Lip Release & 180° Ballistic Flip (24.0m)
      this.resetToGround();
      this.isOnRamp = false;
      this.posX = -38.0;
      this.posY = 24.0;
      this.velX = -16.0;
      this.velY = -3.2;
      this.pitchRad = 2.5; // Mid-flip
      this.speedKmh = 58.7;
      this.speedMps = 16.3;
      this.flipPhase = 'FREEFALL_ROTATION';
      this.flipType = 'LIP_180';
      this.flipRotationAngleRad = 2.5;
      this.mission08Phase = 'MID_AIR_FLIP';
      this.flightMode = 'Lip Release & 180° Flip (24.0m)';
    } else if (idx === 4) {
      // 5. 10-Nozzle Retro-Catch & Landing
      this.resetToGround();
      this.isOnRamp = false;
      this.posX = -52.0;
      this.posY = 6.0;
      this.velX = -6.0;
      this.velY = -1.2;
      this.pitchRad = 0.0;
      this.speedKmh = 22.0;
      this.speedMps = 6.1;
      this.flipPhase = 'LANDING_CATCH';
      this.mission08Phase = 'LANDING';
      this.flightMode = '10-Nozzle Retro-Catch (6.0m)';
    }
  }

  /**
   * Main Dynamic Simulation Update Step
   */
  public update(dt: number): void {
    dt = Math.min(0.04, Math.max(0.001, dt)) * this.simTimeScale;
    this.simTimeSec += dt;

    // 1. Process Driver Controls or Automated Sequence
    if (this.isAutoFlightActive) {
      this.controlMode = 'AUTONOMOUS';
      this.updateAutoFlightRoutine(dt);
    } else {
      if (this.throttle > 0 || this.brake > 0 || Math.abs(this.targetSteerAngleRad) > 0.05 || this.isBoosting || this.isHoverActive) {
        this.controlMode = 'MANUAL REMOTE';
      }
      this.updateManualDriverInputs(dt);
    }

    // 2. Cold-Gas Thruster Forces & PID Calculations
    this.updateColdGasThrusterDynamics(dt);

    // 3. Trajectory & Motion Integration (Runway -> Ramp Road Climb -> Flight -> Landing)
    this.updateMotionAndRoadClimb(dt);

    // 4. Attitude PID Stabilization (Pitch & Roll balancing)
    this.updateAttitudeStabilization(dt);

    // 5. Environmental Crosswind Gust Physics
    if (this.weather === 'Crosswind Gusts') {
      const gust = Math.sin(this.simTimeSec * 1.8) * (this.windSpeedKmh / 45.0) * 1.8;
      this.velZ += gust * dt;
      this.posZ += this.velZ * dt;
      if (this.posY <= 0.05) this.velZ *= 0.85;
    }

    // 6. Ground Effect Lizard Suction Calculation
    if (this.posY > 1.5 && !this.isOnRamp) {
      this.fanPowerPercent = 0.0;
      this.fanDownforceKn = 0.0;
      this.isLizardSuctionActive = false;
    } else if (this.isOnRamp) {
      this.fanPowerPercent = 100.0;
      this.fanDownforceKn = 39.2;
      this.isLizardSuctionActive = true;
    } else if (this.speedKmh > 50.0) {
      const sRatio = Math.min(1.0, (this.speedKmh - 50.0) / 180.0);
      this.fanPowerPercent = 60.0 + sRatio * 40.0;
      this.fanDownforceKn = 4.8 + sRatio * 18.0;
      this.isLizardSuctionActive = true;
    } else {
      this.fanPowerPercent = 0.0;
      this.fanDownforceKn = 0.0;
      this.isLizardSuctionActive = false;
    }

    // 7. COPV Gas Pressure Depletion & Onboard Compressor Refill
    if (this.totalThrustKn > 0.1) {
      this.copvPressurePsi = Math.max(0.0, this.copvPressurePsi - (this.totalThrustKn * 0.85 * dt));
      this.copvCompressorActive = false;
    } else if (this.posY <= 0.05 && this.copvPressurePsi < this.copvMaxPressurePsi) {
      this.copvPressurePsi = Math.min(this.copvMaxPressurePsi, this.copvPressurePsi + 25.0 * dt);
      this.copvCompressorActive = true;
    } else {
      this.copvCompressorActive = false;
    }

    // 8. Battery & Thermal Dissipation
    const motorDrain = (this.throttle * 0.012 + (this.speedKmh / 300.0) * 0.005) * dt;
    const fanDrain = (this.fanPowerPercent / 100.0) * 0.008 * dt;
    const compressorDrain = (this.copvCompressorActive ? 0.004 : 0.0) * dt;
    this.batteryPercent = Math.max(5.0, this.batteryPercent - (motorDrain + fanDrain + compressorDrain));
    this.batterySocPercent = this.batteryPercent;

    const heatGen = (this.throttle * 0.6 + (this.copvCompressorActive ? 0.35 : 0.0)) * dt;
    const coolingDissipation = (this.systemTempC - this.ambientTempC) * 0.05 * dt;
    const cryoCooling = (this.totalThrustKn > 0.5 ? this.totalThrustKn * 0.03 : 0.0) * dt;
    this.systemTempC = Math.max(15.0, Math.min(85.0, this.systemTempC + heatGen - coolingDissipation - cryoCooling));

    // 9. Update Per-Nozzle Dynamic Values
    this.updatePerNozzleOutputs(dt);

    // 10. Wheel Spin Angular Update
    const wheelAngularSpeed = this.velX / this.tireRadiusM;
    for (let w = 0; w < 4; w++) {
      this.wheelRotations[w] += wheelAngularSpeed * dt;
    }

    // 11. Session KPIs & Touchdown Detection
    this.sessionMaxSpeedKmh = Math.max(this.sessionMaxSpeedKmh, this.speedKmh);
    this.sessionMaxAltitudeM = Math.max(this.sessionMaxAltitudeM, this.posY);
    this.sessionPeakThrustKn = Math.max(this.sessionPeakThrustKn, this.totalThrustKn);
    this.sessionPeakG = Math.max(this.sessionPeakG, this.accelG);
    this.sessionMinCopvPsi = Math.min(this.sessionMinCopvPsi, this.copvPressurePsi);
    if (this.posY > 0.5) {
      this.sessionTotalFlightTimeSec += dt;
    }

    if (this.lastPosY > 0.4 && this.posY <= 0.08) {
      const sinkRate = Math.abs(this.velY);
      const grade: 'SMOOTH' | 'FIRM' | 'HARD' = sinkRate < 1.0 ? 'SMOOTH' : sinkRate < 2.0 ? 'FIRM' : 'HARD';
      this.sessionFlightRuns.unshift({
        id: `RUN-${this.sessionFlightRuns.length + 1}`,
        theme: this.activeTheme === 'THEME_2_TRAFFIC' ? 'Theme 2 Traffic Escape' : 'Theme 1 Ramp Loop',
        timestamp: new Date().toTimeString().split(' ')[0],
        maxAlt: this.sessionMaxAltitudeM,
        gasUsed: Math.max(0, 7500.0 - this.copvPressurePsi),
        sinkRate,
        grade,
      });
      if (this.sessionFlightRuns.length > 20) this.sessionFlightRuns.pop();
      this.logAutonomyEvent(`Touchdown confirmed. Sink rate: ${sinkRate.toFixed(2)} m/s (${grade})`, grade === 'SMOOTH' ? 'success' : 'warn');
    }
    this.lastPosY = this.posY;

    // 12. Synthesized WebAudio Engine Tick
    SoundSynthesizer.getInstance().update(this.totalThrustKn, this.fanPowerPercent, this.speedKmh, this.throttle);

    // 13. Record Live Telemetry (Rolling Ring Buffer 300 points)
    if (this.history.length === 0 || this.simTimeSec - this.history[this.history.length - 1].time >= 0.12) {
      this.history.push({
        time: parseFloat(this.simTimeSec.toFixed(1)),
        speedKmh: parseFloat(this.speedKmh.toFixed(1)),
        accelG: parseFloat(this.accelG.toFixed(2)),
        altitudeM: parseFloat(this.posY.toFixed(1)),
        totalThrustKn: parseFloat(this.totalThrustKn.toFixed(1)),
        gForce: parseFloat(this.accelG.toFixed(2)),
        systemTempC: parseFloat(this.systemTempC.toFixed(1)),
      });
      if (this.history.length > 300) this.history.shift();
    }
  }

  /**
   * Calculate live per-nozzle thrust vectoring outputs
   */
  private updatePerNozzleOutputs(dt: number): void {
    if (this.trimVariant === 'Performance' || this.totalThrustKn < 0.2) {
      this.nozzleFL = 0.0;
      this.nozzleFR = 0.0;
      this.nozzleRL = 0.0;
      this.nozzleRR = 0.0;
      this.nozzlePerimeterEach = 0.0;
      this.activeNozzleCount = 0;
      return;
    }

    if (this.trimVariant === 'Thrust') {
      this.nozzleFL = 0.0;
      this.nozzleFR = 0.0;
      const rearKn = Math.min(24.0, this.totalThrustKn * 0.5);
      this.nozzleRL = rearKn;
      this.nozzleRR = rearKn;
      this.nozzlePerimeterEach = 0.0;
      this.activeNozzleCount = 4;
      return;
    }

    // Rocket Trim: 10 Nozzles
    if (this.flipPhase === 'FREEFALL_ROTATION') {
      this.nozzleFL = 0.0;
      this.nozzleFR = 0.0;
      this.nozzleRL = 0.0;
      this.nozzleRR = 0.0;
      this.nozzlePerimeterEach = 3.6;
      this.activeNozzleCount = 6;
    } else if (this.isHoverActive) {
      const osc = Math.sin(this.simTimeSec * 28.0) * 0.35;
      const pitchOffset = this.pitchRad * 2.5;
      this.nozzleFL = Math.max(0.8, Math.min(6.5, 2.4 + osc - pitchOffset));
      this.nozzleFR = Math.max(0.8, Math.min(6.5, 2.4 - osc - pitchOffset));
      this.nozzleRL = Math.max(0.8, Math.min(8.0, 2.5 - osc + pitchOffset));
      this.nozzleRR = Math.max(0.8, Math.min(8.0, 2.5 + osc + pitchOffset));
      this.nozzlePerimeterEach = Math.max(0.5, Math.min(3.5, 1.6 + Math.cos(this.simTimeSec * 20.0) * 0.15));
      this.activeNozzleCount = 10;
    } else if (this.isBoosting || this.totalThrustKn > 30.0) {
      const ratio = this.totalThrustKn / 78.4;
      this.nozzleFL = ratio * 10.5;
      this.nozzleFR = ratio * 10.5;
      this.nozzleRL = ratio * 18.0;
      this.nozzleRR = ratio * 18.0;
      this.nozzlePerimeterEach = ratio * 7.8;
      this.activeNozzleCount = 10;
    } else {
      const ratio = this.totalThrustKn / 40.0;
      this.nozzleFL = ratio * 5.0;
      this.nozzleFR = ratio * 5.0;
      this.nozzleRL = ratio * 9.0;
      this.nozzleRR = ratio * 9.0;
      this.nozzlePerimeterEach = ratio * 2.5;
      this.activeNozzleCount = 10;
    }
  }

  /**
   * Calculates continuous cold-gas thruster outputs adhering to Newtonian mechanics:
   * 1. Nozzle Vectoring & Orientation-Dependent Lift (Rule 2)
   * 2. Inverted Thrust Cutoff to 0 kN (Rule 2)
   * 3. 4-Phase Finite Ballistic 3D Flip (Rule 3)
   * 4. 600L COPV Gas Pressure Depletion & Hard Cutoff (Rule 4)
   */
  private updateColdGasThrusterDynamics(dt: number): void {
    // 1. COPV Cutoff: When copvPressurePsi <= 150 psi, all nozzles immediately cut to 0 kN (Rule 4)
    if (this.copvPressurePsi <= 150.0) {
      this.copvPressurePsi = 0.0;
      this.thrustXKn = 0.0;
      this.thrustYKn = 0.0;
      this.totalThrustKn = 0.0;
      this.isHoverActive = false;
      this.isBoosting = false;
      if (this.flipPhase === 'LAUNCH_POP') {
        this.flipPhase = 'FREEFALL_ROTATION';
      }
      return;
    }

    const pressureRatio = Math.max(0.0, Math.min(1.0, (this.copvPressurePsi - 150.0) / 2200.0));
    const maxAvailableThrustN = this.maxColdGasThrustKn * 1000.0 * pressureRatio; // Up to 78.4 kN
    const gravityCancelN = this.weightN; // 19.42 kN to cancel gravity (F = mg)

    let commandedBodyThrustXN = 0.0;
    let commandedBodyLiftN = 0.0;

    // -------------------------------------------------------------------------
    // A. 3D FLIP BALLISTIC MANEUVER THRUST (Rule 3 & Rule 4)
    // -------------------------------------------------------------------------
    if (this.flipPhase === 'LAUNCH_POP') {
      // Phase 1 (Launch Pop): Downward nozzles fire at max thrust (78 kN)
      commandedBodyLiftN = maxAvailableThrustN;
      commandedBodyThrustXN = 0.0;

      if (this.velY >= 8.0 && this.posY >= 5.0) {
        this.flipPhase = 'FREEFALL_ROTATION';
        this.flipRotationAngleRad = 0.0;
        this.flightMode = 'Flip Phase 2: Ballistic 360° Free-Fall';
      }
    } else if (this.flipPhase === 'FREEFALL_ROTATION') {
      // Phase 2 (Ballistic Free-Fall): Main downward lift thrust is CUT TO 0 kN!
      // Only differential corner attitude nozzles pulse for angular torque.
      commandedBodyLiftN = 0.0;
      commandedBodyThrustXN = 0.0;
    } else if (this.flipPhase === 'ANGULAR_BRAKE') {
      // Phase 3 (Angular Brake): Counter-pulse stops rotation cleanly at 0° upright
      commandedBodyLiftN = 0.0;
      commandedBodyThrustXN = 0.0;
    } else if (this.flipPhase === 'LANDING_CATCH') {
      // Phase 4 (10-Nozzle Retro-Catch & Smooth Landing, Rule 4)
      let targetDescentMps = -1.5;
      if (this.posY > 15.0) targetDescentMps = -2.5;
      else if (this.posY > 3.0) targetDescentMps = -1.2;
      else targetDescentMps = -0.45; // Gentle touchdown cushion

      const velError = targetDescentMps - this.velY;
      const catchThrustN = gravityCancelN + (velError * 3600.0);
      commandedBodyLiftN = Math.max(0.0, Math.min(maxAvailableThrustN, catchThrustN));

      if (Math.abs(this.velX) > 2.0) {
        commandedBodyThrustXN = -Math.sign(this.velX) * 12000.0; // Retro braking along X
      }
    }

    // -------------------------------------------------------------------------
    // B. BOOST & HOVER & MANUAL LANDING (When flip is IDLE)
    // -------------------------------------------------------------------------
    if (this.flipPhase === 'IDLE') {
      // Boost: Horizontal propulsion + vertical lift component
      if (this.isBoosting) {
        commandedBodyThrustXN += 52000.0 * pressureRatio;
        commandedBodyLiftN += (gravityCancelN + 22000.0) * pressureRatio;
      }

      // Active Hover Mode: Closed-Loop PID Altitude Balancing
      if (this.isHoverActive) {
        if (this.throttle > 0.1) {
          this.targetHoverAltitudeM = Math.min(28.0, this.targetHoverAltitudeM + this.throttle * 12.0 * dt);
        }
        if (this.brake > 0.1) {
          this.targetHoverAltitudeM = Math.max(1.0, this.targetHoverAltitudeM - this.brake * 10.0 * dt);
        }

        const altErrorM = this.targetHoverAltitudeM - this.posY;
        const altVelocityMps = this.velY;

        const Kp_alt = 1400.0;
        const Kd_alt = 2800.0;
        const Ki_alt = 45.0;

        this.pidAltitudeIntegral = Math.max(-4000.0, Math.min(4000.0, this.pidAltitudeIntegral + altErrorM * dt * Ki_alt));
        const pidVerticalThrustN = gravityCancelN + (altErrorM * Kp_alt) - (altVelocityMps * Kd_alt) + this.pidAltitudeIntegral;
        commandedBodyLiftN = Math.max(0.0, Math.min(maxAvailableThrustN, pidVerticalThrustN));

        if (this.throttle > 0) {
          commandedBodyThrustXN += this.throttle * 24000.0 * pressureRatio;
        }
      }

      // Smooth Landing Mode
      if (this.isLandingActive) {
        let targetDescentMps = -1.5;
        if (this.posY > 15.0) targetDescentMps = -2.5;
        else if (this.posY > 3.0) targetDescentMps = -1.2;
        else targetDescentMps = -0.45; // Gentle touchdown cushion

        const velError = targetDescentMps - this.velY;
        const landingThrustN = gravityCancelN + (velError * 3400.0);
        commandedBodyLiftN = Math.max(0.0, Math.min(maxAvailableThrustN, landingThrustN));

        if (Math.abs(this.velX) > 2.0) {
          commandedBodyThrustXN = -Math.sign(this.velX) * 10000.0;
        }
      }
    }

    // -------------------------------------------------------------------------
    // C. HARD CLAMP: CUT UPWARD LIFT TO 0 kN ABOVE 30m ALTITUDE (Rule 5)
    // -------------------------------------------------------------------------
    if (this.posY >= 30.0) {
      commandedBodyLiftN = 0.0;
    }

    // -------------------------------------------------------------------------
    // D. NOZZLE VECTORING & ORIENTATION-DEPENDENT THRUST (Rule 2)
    // -------------------------------------------------------------------------
    const cosPitch = Math.cos(this.pitchRad);
    const cosRoll = Math.cos(this.rollRad);
    const cosTilt = cosPitch * cosRoll;

    let effectiveWorldLiftN = 0.0;
    let effectiveWorldThrustXN = commandedBodyThrustXN;

    if (cosTilt > 0.0) {
      // Upright orientation (< 90° tilt): nozzles blast toward ground, pushing car UP
      effectiveWorldLiftN = commandedBodyLiftN * cosTilt;
      effectiveWorldThrustXN += commandedBodyLiftN * Math.sin(this.pitchRad);
    } else {
      // Inverted orientation (>= 90° tilt): underbody nozzles point into sky!
      // Cut main lift thrust to 0 kN (Rule 2)
      effectiveWorldLiftN = 0.0;
    }

    this.thrustXKn = effectiveWorldThrustXN / 1000.0;
    this.thrustYKn = effectiveWorldLiftN / 1000.0;

    const targetTotalThrustKn = Math.sqrt(this.thrustXKn * this.thrustXKn + this.thrustYKn * this.thrustYKn);
    const thrustRateLimitKnS = 180.0;
    if (targetTotalThrustKn > this.totalThrustKn) {
      this.totalThrustKn = Math.min(targetTotalThrustKn, this.totalThrustKn + thrustRateLimitKnS * dt);
    } else {
      this.totalThrustKn = Math.max(targetTotalThrustKn, this.totalThrustKn - thrustRateLimitKnS * dt);
    }

    // -------------------------------------------------------------------------
    // E. COPV GAS PRESSURE DEPLETION & RECHARGE (Rule 4)
    // -------------------------------------------------------------------------
    if (this.totalThrustKn > 0.5) {
      const consumptionRate = 0.42; // psi per kN per second (600L tank at 7500 psi)
      this.copvPressurePsi = Math.max(0.0, this.copvPressurePsi - (this.totalThrustKn * consumptionRate * dt));
    } else if (this.posY <= 0.05 && this.copvPressurePsi < this.copvMaxPressurePsi) {
      this.copvPressurePsi = Math.min(this.copvMaxPressurePsi, this.copvPressurePsi + 60.0 * dt);
    }
  }

  /**
   * Handles Unified Vehicle Motion:
   * 1. Runway Driving on Asphalt
   * 2. Climbing the Curved Aerobatic Loop Ramp (Solid math, no ghosting)
   * 3. 2.0G Lizard Suction Adhesion
   * 4. Lip Release & Gravity Drop
   * 5. Touchdown Cushioning
   */
  private updateMotionAndRoadClimb(dt: number): void {
    // 1. Tractive & Braking Powertrain Forces
    let tractiveForceN = 0.0;
    let brakeForceN = 0.0;
    const isRoadContact = this.posY <= 0.05 || this.isOnRamp;

    if (isRoadContact) {
      if (this.throttle > 0 && this.gear === 'D') {
        tractiveForceN = this.throttle * 10500.0 / this.tireRadiusM;
      } else if (this.gear === 'R') {
        tractiveForceN = -this.throttle * 4000.0 / this.tireRadiusM;
      }

      if (this.brake > 0) {
        brakeForceN = Math.sign(this.velX) * this.brake * this.maxBrakeForceN;
      }
    }

    // 2. Aerodynamic Drag
    const totalSpeedMps = Math.max(0.1, Math.sqrt(this.velX * this.velX + this.velY * this.velY));
    const dynamicPressure = 0.5 * this.airDensityKgM3 * Math.pow(totalSpeedMps, 2);
    const aeroDragTotalN = dynamicPressure * this.frontalAreaM2 * this.dragCoeffCd;

    const dragXN = (this.velX / totalSpeedMps) * aeroDragTotalN;
    const dragYN = (this.velY / totalSpeedMps) * aeroDragTotalN;

    // 3. Accelerations along Road Tangent
    const netForceXN = (this.thrustXKn * 1000.0) + tractiveForceN - brakeForceN - dragXN;
    this.accelX = netForceXN / this.massKg;
    this.velX += this.accelX * dt;

    // Stop threshold on road
    if (isRoadContact && Math.abs(this.velX) < 0.1 && this.brake > 0.05 && this.throttle === 0) {
      this.velX = 0.0;
      this.accelG = 0.0;
    }

    // -------------------------------------------------------------------------
    // RULE 5 HARD CLAMPS AGAINST FLYING INTO SPACE
    // -------------------------------------------------------------------------
    // Max Speed: 350 km/h (97.22 m/s)
    const currentSpeedKmh = Math.sqrt(this.velX * this.velX + this.velY * this.velY) * 3.6;
    if (currentSpeedKmh > 350.0) {
      const maxMps = 350.0 / 3.6;
      const speedMps = currentSpeedKmh / 3.6;
      const ratio = maxMps / speedMps;
      this.velX *= ratio;
      this.velY *= ratio;
    }

    // Max Continuous Boost Burst: 5.0 seconds
    if (this.isBoosting) {
      this.boostActiveTimerSec += dt;
      if (this.boostActiveTimerSec >= 5.0) {
        this.isBoosting = false;
      }
    } else {
      this.boostActiveTimerSec = Math.max(0.0, this.boostActiveTimerSec - dt * 2.0);
    }

    // Max Altitude Clamp: strictly within 25-35 meters; hard ceiling at 34m
    if (this.posY > 34.0) {
      this.posY = 34.0;
      if (this.velY > 0) this.velY = 0.0;
    }

    // -------------------------------------------------------------------------
    // A. VEHICLE IS ON THE FLAT RUNWAY (posX < -30m) AND RESTING ON ASPHALT
    // -------------------------------------------------------------------------
    const isGroundResting = !this.isOnRamp && this.posY <= 0.05 && this.flipPhase === 'IDLE' && !this.isHoverActive && !this.isLandingActive && !this.isBoosting;

    if (isGroundResting) {
      this.posY = 0.0;
      this.velY = 0.0;
      this.accelY = 0.0;
      this.pitchRad = 0.0;
      this.rollRad = 0.0;
      this.isLizardSuctionActive = false;
      this.fanPowerPercent = 62.0;
      this.fanDownforceKn = 4.8;

      // Advance along asphalt runway (+X)
      this.posX += this.velX * Math.cos(this.yawRad) * dt;
      this.posZ -= this.velX * Math.sin(this.yawRad) * dt;

      if (this.activeTheme === 'THEME_1_RAMP') {
        // When reaching -30.0m in Theme 1: seamlessly enter the curved ramp!
        if (this.posX >= TrackSurfaceEvaluator.RAMP_START_X && this.velX > 0) {
          this.isOnRamp = true;
          this.rampThetaRad = 0.001;
        }
      } else {
        // Theme 2: City Highway & Traffic Jam Detection
        this.posZ = Math.max(-10.5, Math.min(10.5, this.posZ));
        if (this.posX >= -15.0 && this.posX <= 68.0 && this.velX > 0) {
          this.velX = 0.0;
          this.accelX = 0.0;
          this.trafficBlockadeDetected = true;
          this.flightMode = 'TRAFFIC BLOCKADE — LIFT OFF WITH COPV NOZZLES';
        } else if (this.posX < -15.0) {
          this.trafficBlockadeDetected = false;
        }
      }
    }
    // -------------------------------------------------------------------------
    // B. VEHICLE IS CLIMBING THE CURVED RAMP (Solid Surface Math, No Ghosting!)
    // -------------------------------------------------------------------------
    else if (this.isOnRamp && !this.isHoverActive) {
      // Angular velocity along the loop arc: dTheta = (v / R) * dt
      const deltaTheta = (this.velX / TrackSurfaceEvaluator.RAMP_RADIUS) * dt;
      this.rampThetaRad += deltaTheta;

      // Rule 2: Lizard on a Wall ground effect suction fans (> 15 deg)
      if (this.rampThetaRad > (15 * Math.PI / 180)) {
        this.isLizardSuctionActive = true;
        this.fanPowerPercent = 100.0;
        this.fanDownforceKn = 39.2; // 2.0g suction (39.2 kN)
      } else {
        this.isLizardSuctionActive = false;
        this.fanPowerPercent = 62.0;
        this.fanDownforceKn = 4.8;
      }

      // If driver reversed back onto the flat runway
      if (this.rampThetaRad <= 0.0) {
        this.isOnRamp = false;
        this.rampThetaRad = 0.0;
        this.isLizardSuctionActive = false;
        this.posX = TrackSurfaceEvaluator.RAMP_START_X;
        this.posY = 0.0;
        this.pitchRad = 0.0;
        this.flightMode = 'Ground / Runway Ready';
      }
      // Reached the top lip edge of the ramp (180 deg ceiling lip at x = -30, y = 28m)
      else if (this.rampThetaRad >= Math.PI) {
        this.isOnRamp = false;
        this.rampThetaRad = Math.PI;
        this.isLizardSuctionActive = false;
        this.fanDownforceKn = 0.0;
        this.fanPowerPercent = 62.0;

        // Position at the lip edge (28.0m altitude)
        this.posX = TrackSurfaceEvaluator.RAMP_START_X; // -30.0
        this.posY = 28.0;
        // Travel backwards along -X off the lip edge
        this.velX = -Math.max(12.0, Math.abs(this.velX));
        this.velY = 0.0;

        // Trigger Rule 3: Ramp Lip Exit, Gravity Drop & Single 180° Flip
        this.triggerLipFlipManeuver();
      }
      // Actively Climbing / Driving on the Curved Solid Ramp Deck (Rule 1 & Rule 2)
      else {
        const rampPoint = TrackSurfaceEvaluator.getRampPoint(this.rampThetaRad);
        this.posX = rampPoint.x;
        this.posY = rampPoint.y;
        this.posZ = 0.0;
        this.pitchRad = rampPoint.pitchRad; // Aligns pitch exactly with ramp tangent!

        this.flightMode = this.rampThetaRad > (Math.PI * 0.5)
          ? `Inverted Ceiling Run (${this.posY.toFixed(1)}m, 2.0g Suction)`
          : `Loop Wall Climb (${this.posY.toFixed(1)}m, 2.0g Suction)`;
      }
    }
    // -------------------------------------------------------------------------
    // C. IN FREE FLIGHT, BALLISTIC FLIP, HOVER, OR SMOOTH LANDING (Rule 1)
    // -------------------------------------------------------------------------
    else {
      // UNCONDITIONAL WORLD-SPACE GRAVITY (Every single frame whenever airborne):
      // a_y = (World Upward Thrust - Gravity - Aero Drag) / mass
      const thrusterLiftWorldN = this.thrustYKn * 1000.0;
      const netForceYN = thrusterLiftWorldN - this.weightN - dragYN;

      this.accelY = netForceYN / this.massKg;
      this.velY += this.accelY * dt;

      this.posX += this.velX * Math.cos(this.yawRad) * dt;
      this.posY += this.velY * dt;
      this.posZ -= this.velX * Math.sin(this.yawRad) * dt;

      // Ground collision & landing on asphalt road
      if (this.posY <= 0.0) {
        this.posY = 0.0;
        this.velY = 0.0;
        this.accelY = 0.0;
        this.pitchRad = 0.0;
        this.rollRad = 0.0;
        this.pitchRateRadS = 0.0;
        this.rollRateRadS = 0.0;
        this.isOnRamp = false;
        this.rampThetaRad = 0.0;
        this.isLandingActive = false;
        this.isLizardSuctionActive = false;
        this.totalThrustKn = 0.0;
        this.thrustYKn = 0.0;
        this.thrustXKn = 0.0;
        if (this.flipPhase !== 'IDLE') {
          this.flipPhase = 'IDLE';
          this.flipRotationAngleRad = 0.0;
          this.flipProgress = 0.0;
        }
        this.flightMode = 'Touchdown Complete (Ground Active)';
      }
    }

    // Speed metrics
    this.speedMps = Math.sqrt(this.velX * this.velX + (this.velY * this.velY));
    this.speedKmh = Math.max(0, this.speedMps * 3.6);

    const feelableAx = this.accelX;
    const feelableAy = this.accelY + (this.posY <= 0.05 ? 0.0 : this.gravityMps2);
    this.accelG = Math.sqrt(feelableAx * feelableAx + feelableAy * feelableAy) / this.gravityMps2;
  }

  /**
   * Attitude PID Balancing & Finite Ballistic Flip (Rule 3)
   */
  private updateAttitudeStabilization(dt: number): void {
    // -------------------------------------------------------------------------
    // 3D FLIP ROTATION & ATTITUDE CONTROL
    // -------------------------------------------------------------------------
    if (this.flipPhase === 'FREEFALL_ROTATION') {
      this.flipTimerSec += dt;
      // Corner attitude RCS nozzles rotate chassis at ~5.6 rad/s (320 deg/s)
      const omegaFlipRadS = 5.6;
      this.flipRotationAngleRad += omegaFlipRadS * dt;
      this.pitchRad = this.flipRotationAngleRad;
      this.pitchRateRadS = omegaFlipRadS;

      if (this.flipType === 'LIP_180') {
        // Lip exit flip: rotates from PI (180 deg) to 2*PI (360 deg = 0 deg upright)
        this.flipProgress = Math.min(1.0, (this.flipRotationAngleRad - Math.PI) / Math.PI);
        if (this.flipRotationAngleRad >= (2.0 * Math.PI - 0.15)) {
          this.flipPhase = 'ANGULAR_BRAKE';
          this.flightMode = 'Flip Phase 3: Angular Counter-Pulse Brake';
        }
      } else {
        // Flat ground 360 flip: rotates from 0 to 2*PI
        this.flipProgress = Math.min(1.0, this.flipRotationAngleRad / (2.0 * Math.PI));
        if (this.flipRotationAngleRad >= (2.0 * Math.PI - 0.20)) {
          this.flipPhase = 'ANGULAR_BRAKE';
          this.flightMode = 'Flip Phase 3: Angular Counter-Pulse Brake';
        }
      }
      return;
    }

    if (this.flipPhase === 'ANGULAR_BRAKE') {
      // Counter-torque stops spin cleanly at 0° (level upright attitude, omega = 0)
      this.pitchRad = 0.0;
      this.pitchRateRadS = 0.0;
      this.rollRad = 0.0;
      this.rollRateRadS = 0.0;
      this.flipRotationAngleRad = 0.0;
      this.flipProgress = 0.0;

      // Phase 4: Automatically transition into LANDING_CATCH (10-nozzle cushioned retro-burn)
      this.flipPhase = 'LANDING_CATCH';
      this.flightMode = '10-Nozzle Retro-Catch & Smooth Landing';
      return;
    }

    // Normal In-Flight Gyroscopic Stabilization (Auto-level when upright and airborne)
    if (this.posY > 0.5 && !this.isOnRamp && this.flipPhase === 'IDLE') {
      const pitchError = 0.0 - this.pitchRad;
      const rollError = 0.0 - this.rollRad;

      const Kp_att = 8200.0;
      const Kd_att = 2400.0;

      const pitchTorqueNm = (pitchError * Kp_att) - (this.pitchRateRadS * Kd_att);
      const rollTorqueNm = (rollError * Kp_att) - (this.rollRateRadS * Kd_att);

      this.pitchRateRadS += (pitchTorqueNm / this.Iyy) * dt;
      this.pitchRad += this.pitchRateRadS * dt;

      this.rollRateRadS += (rollTorqueNm / this.Ixx) * dt;
      this.rollRad += this.rollRateRadS * dt;
    } else if (this.posY <= 0.05 && !this.isOnRamp) {
      // Suspension squat & pitch animation:
      // When braking hard, front dips down (nose dive -0.04 rad ~ 2.3°)
      // When accelerating hard, rear squats (nose pitch up +0.025 rad)
      const targetSquatPitch = (this.brake > 0.1)
        ? (-0.038 * Math.min(1.0, this.brake))
        : (this.throttle > 0.2 ? 0.025 * this.throttle : 0.0);

      this.pitchRad += (targetSquatPitch - this.pitchRad) * Math.min(1.0, dt * 8.0);
      this.rollRad = 0.0;
      this.pitchRateRadS = 0.0;
      this.rollRateRadS = 0.0;
    }
  }

  /**
   * Manual driver keyboard inputs (WASD, Arrows)
   */
  private updateManualDriverInputs(dt: number): void {
    const up = this.keysDown['KeyW'] || this.keysDown['ArrowUp'];
    const down = this.keysDown['KeyS'] || this.keysDown['ArrowDown'];
    const left = this.keysDown['KeyA'] || this.keysDown['ArrowLeft'];
    const right = this.keysDown['KeyD'] || this.keysDown['ArrowRight'];

    if (up) {
      this.throttle = Math.min(1.0, this.throttle + dt * 4.0);
      this.brake = 0.0;
      this.gear = 'D';
    } else if (!this.isBoosting) {
      this.throttle = Math.max(0.0, this.throttle - dt * 5.0);
    }

    if (down) {
      if (this.speedMps > 0.5) {
        this.brake = Math.min(1.0, this.brake + dt * 5.0);
        this.throttle = 0.0;
      } else {
        this.gear = 'R';
        this.throttle = Math.min(0.5, this.throttle + dt * 2.0);
        this.brake = 0.0;
      }
    } else if (!up) {
      this.brake = Math.max(0.0, this.brake - dt * 4.0);
    }

    const maxSteer = 0.42;
    if (left) {
      this.targetSteerAngleRad = maxSteer;
    } else if (right) {
      this.targetSteerAngleRad = -maxSteer;
    } else {
      this.targetSteerAngleRad = 0.0;
    }
    this.steerAngleRad += (this.targetSteerAngleRad - this.steerAngleRad) * Math.min(1.0, dt * 10.0);
    this.yawRad += (this.speedMps / this.wheelBaseM) * Math.tan(this.steerAngleRad) * dt;
  }

  /**
   * Autonomous Mission 08 Sequence (Exact 5 Stages):
   * Stage 1: Runway Approach ->
   * Stage 2: Wall & Inverted Ceiling Climb (2.0G Lizard Suction) ->
   * Stage 3: Lip Edge Drop & 180° Flip ->
   * Stage 4: 10-Nozzle Retro-Catch ->
   * Stage 5: Soft Touchdown on Asphalt
   */
  private updateAutoFlightRoutine(dt: number): void {
    this.autoFlightTimer += dt;

    // -------------------------------------------------------------------------
    // THEME 2: HEAVY CITY TRAFFIC ESCAPE (Mission 09)
    // -------------------------------------------------------------------------
    if (this.activeTheme === 'THEME_2_TRAFFIC') {
      if (this.mission09Phase === 'APPROACH_TRAFFIC') {
        // Stage 1a: Approach traffic at ~60 km/h from -65m
        this.gear = 'D';
        if (this.posX < -24.0) {
          this.throttle = 0.55;
          this.brake = 0.0;
        } else {
          // Smooth brake to stop right in front of gridlock
          this.throttle = 0.0;
          this.brake = 0.85;
        }

        if (this.posX >= -18.0 || (this.posX >= -24.0 && this.speedMps < 0.6)) {
          this.velX = 0.0;
          this.throttle = 0.0;
          this.brake = 1.0;
          this.trafficBlockadeDetected = true;
          this.mission09Phase = 'STUCK_IN_TRAFFIC';
          this.flightMode = '1. Stuck in Gridlock — ADAS Traffic Blockade Alert';
          this.autoFlightTimer = 0.0;
        }
      } else if (this.mission09Phase === 'STUCK_IN_TRAFFIC') {
        // Stage 1b: Stuck in traffic at standstill for ~1.8s, then engage COPV liftoff
        this.throttle = 0.0;
        this.brake = 1.0;
        this.trafficBlockadeDetected = true;
        if (this.autoFlightTimer >= 1.8) {
          this.brake = 0.0;
          this.isHoverActive = true;
          this.targetHoverAltitudeM = 10.5; // Clear 4.2m Semi trailer with 6.3m headroom
          this.mission09Phase = 'VERTICAL_LIFTOFF';
          this.flightMode = '2. Vertical Cold-Gas Liftoff (10.5m Altitude)';
          this.autoFlightTimer = 0.0;
        }
      } else if (this.mission09Phase === 'VERTICAL_LIFTOFF') {
        // Stage 2: Vertical climb to 10.5m
        this.isHoverActive = true;
        this.targetHoverAltitudeM = 10.5;
        this.trafficBlockadeDetected = true;
        if (this.posY >= 9.8 || this.autoFlightTimer >= 2.2) {
          this.mission09Phase = 'FLY_OVER_TRAFFIC';
          this.flightMode = '3. Air-Cruise & 360° Flip Over Gridlock (95 km/h)';
          this.autoFlightTimer = 0.0;
        }
      } else if (this.mission09Phase === 'FLY_OVER_TRAFFIC') {
        // Stage 3: Forward cruise at ~95 km/h (26.4 m/s) over traffic jam (X in [-15, 65])
        this.isHoverActive = true;
        this.targetHoverAltitudeM = 10.0;
        if (this.velX < 26.4) {
          this.velX = Math.min(26.4, this.velX + 18.0 * dt);
        }

        // Halfway across the traffic jam (X approx 25m), trigger flip maneuver
        if (this.posX >= 22.0 && this.posX <= 35.0 && this.flipPhase === 'IDLE' && this.autoFlightTimer < 2.0) {
          this.triggerFlipManeuver();
        }

        // Clear of traffic blockade (obstacles end around X = 65m, target landing zone at X >= 75m)
        if (this.posX >= 72.0) {
          this.mission09Phase = 'RETRO_LANDING';
          this.flightMode = '4. Gravity Descent & 10-Nozzle Retro-Catch';
          this.isHoverActive = false;
          this.isLandingActive = true;
          this.autoFlightTimer = 0.0;
        }
      } else if (this.mission09Phase === 'RETRO_LANDING') {
        // Stage 4: Controlled descent & retro-catch
        this.isHoverActive = false;
        this.isLandingActive = true;
        if (this.velX > 22.2) {
          this.velX = Math.max(22.2, this.velX - 12.0 * dt);
        }
        if (this.posY <= 0.05) {
          this.isLandingActive = false;
          this.mission09Phase = 'OPEN_HIGHWAY_CRUISE';
          this.flightMode = '5. Touchdown & Open Highway Cruise (80 km/h)';
          this.autoFlightTimer = 0.0;
        }
      } else if (this.mission09Phase === 'OPEN_HIGHWAY_CRUISE') {
        // Stage 5: Drive along open highway at 80 km/h (22.2 m/s)
        this.throttle = 0.55;
        this.brake = 0.0;
        this.gear = 'D';
        this.isHoverActive = false;
        this.isLandingActive = false;
        if (this.autoFlightTimer > 5.0) {
          this.isAutoFlightActive = false;
          this.flightMode = 'Mission 09 Traffic Escape Complete';
        }
      }
      return;
    }

    // -------------------------------------------------------------------------
    // THEME 1: MCGREGOR RAMP LOOP (Mission 08, 100% UNTOUCHED)
    // -------------------------------------------------------------------------
    if (!this.isOnRamp && this.posY <= 0.05 && this.posX < TrackSurfaceEvaluator.RAMP_START_X) {
      // Stage 1: Track Acceleration along asphalt runway
      this.throttle = 1.0;
      this.gear = 'D';
      this.isBoosting = true;
      this.mission08Phase = 'APPROACH';
    } else if (this.isOnRamp) {
      // Stage 2: Wall & Inverted Ceiling Climb with 2.0g suction
      this.throttle = 0.85;
      this.gear = 'D';
      this.isBoosting = true;
      this.mission08Phase = this.rampThetaRad > (Math.PI * 0.5) ? 'INVERTED_DRIVE' : 'TAKEOFF';
    } else if (this.flipPhase === 'FREEFALL_ROTATION' || this.flipPhase === 'ANGULAR_BRAKE') {
      // Stage 3: Off-Lip Drop & 180° Ballistic Flip
      this.throttle = 0.0;
      this.isBoosting = false;
      this.mission08Phase = 'MID_AIR_FLIP';
    } else if (this.flipPhase === 'LANDING_CATCH' || this.isLandingActive) {
      // Stage 4: 10-Nozzle Retro-Catch
      this.throttle = 0.0;
      this.isBoosting = false;
      this.mission08Phase = 'LANDING';
    } else {
      // Stage 5: Soft Touchdown
      if (this.posY <= 0.05 && this.autoFlightTimer > 5.0) {
        this.throttle = 0.0;
        this.brake = 0.8;
        this.isAutoFlightActive = false;
        this.mission08Phase = 'LANDING';
        this.flightMode = 'Mission 08 Autonomous Sequence Complete';
      }
    }
  }

  public startT01BrakingTest(): void {
    this.resetToGround();
    this.testPhase = 'ACCELERATING';
  }

  public abortTest(): void {
    this.testPhase = 'IDLE';
    this.throttle = 0.0;
    this.brake = 1.0;
    this.isBoosting = false;
    this.isHoverActive = false;
    this.isLandingActive = false;
    this.flipPhase = 'IDLE';
  }

  /**
   * Sync visual Three.js mesh with dynamic physics state
   */
  public syncCarMesh(carGroup: THREE.Group): void {
    carGroup.position.set(this.posX, this.posY, this.posZ);
    // Three.js Euler: X is Roll (banking), Y is Yaw (heading), Z is Pitch (nose pitch along longitudinal +X travel)
    carGroup.rotation.set(this.rollRad, this.yawRad, this.pitchRad, 'YXZ');

    // Steer front wheels & spin all 4 wheels
    const wFL = carGroup.getObjectByName('WheelAssembly_0');
    const wFR = carGroup.getObjectByName('WheelAssembly_1');
    const wRL = carGroup.getObjectByName('WheelAssembly_2');
    const wRR = carGroup.getObjectByName('WheelAssembly_3');

    if (wFL) {
      wFL.rotation.y = this.steerAngleRad;
      wFL.rotation.z = -this.wheelRotations[0];
    }
    if (wFR) {
      wFR.rotation.y = this.steerAngleRad;
      wFR.rotation.z = -this.wheelRotations[1];
    }
    if (wRL) {
      wRL.rotation.z = -this.wheelRotations[2];
    }
    if (wRR) {
      wRR.rotation.z = -this.wheelRotations[3];
    }

    // Active Spoiler Deployment (Raises during flight, high speed > 100 km/h, or hard braking)
    const activeSpoiler = carGroup.getObjectByName('ActiveSpoilerBlade');
    if (activeSpoiler) {
      const isAeroHigh = this.posY > 1.2 || this.speedKmh > 110.0 || this.brake > 0.4;
      const targetSpoilerY = isAeroHigh ? 0.86 : 0.74;
      const targetSpoilerRotZ = isAeroHigh ? -0.32 : -0.10;
      activeSpoiler.position.y += (targetSpoilerY - activeSpoiler.position.y) * 0.2;
      activeSpoiler.rotation.z += (targetSpoilerRotZ - activeSpoiler.rotation.z) * 0.2;
    }

    // Dynamic 10 Perimeter Thruster Plumes Scaling & Supersonic Blue Plasma Glow
    // Render pressurized white/cyan plumes when thrust > 0.8 kN AND copvPressurePsi > 150 psi
    const isGasVenting = this.totalThrustKn > 0.8 && this.copvPressurePsi > 150.0;
    // When inverted in mid-air flip, main downward lift is cut, so downward plumes turn off:
    const isMainLiftCut = this.flipPhase === 'FREEFALL_ROTATION' && (Math.cos(this.pitchRad) * Math.cos(this.rollRad) <= 0);
    const isPlumeActive = isGasVenting && !isMainLiftCut;

    for (let i = 0; i < 10; i++) {
      const plume = carGroup.getObjectByName(`ThrusterPlume_${i}`);
      const core = carGroup.getObjectByName(`ThrusterCore_${i}`);
      if (plume && core) {
        plume.visible = isPlumeActive;
        core.visible = isPlumeActive;
        if (isPlumeActive) {
          const flicker = 0.93 + Math.random() * 0.14;
          const thrustScale = Math.max(0.4, (this.totalThrustKn / this.maxColdGasThrustKn) * 1.55);
          plume.scale.set(thrustScale * flicker, thrustScale * flicker, thrustScale * flicker);
          core.scale.set(thrustScale * flicker * 0.9, thrustScale * flicker * 0.9, thrustScale * flicker * 0.9);
        }
      }
    }

    // Ground Blast Pressure Shockwave Ring (Active when altitude < 6.0m and cold-gas thrusters fire)
    const blastRing = carGroup.getObjectByName('GroundBlastRing');
    if (blastRing) {
      const isGroundBlastActive = isPlumeActive && this.posY < 6.0 && this.posY > 0.05;
      blastRing.visible = isGroundBlastActive;
      if (isGroundBlastActive) {
        // Place ring exactly on the asphalt surface directly underneath the car
        blastRing.position.set(0, -this.posY + 0.03, 0);
        blastRing.rotation.set(-this.rollRad, 0, -this.pitchRad); // Keep horizontal with road
        const proxFactor = Math.max(0.0, 1.0 - (this.posY / 6.0));
        const ringScale = (1.2 + proxFactor * 2.4) * (0.95 + Math.random() * 0.1);
        blastRing.scale.set(ringScale, ringScale, ringScale);
        if ((blastRing as any).material) {
          (blastRing as any).material.opacity = Math.min(0.85, proxFactor * 0.9);
        }
      }
    }
  }
}
