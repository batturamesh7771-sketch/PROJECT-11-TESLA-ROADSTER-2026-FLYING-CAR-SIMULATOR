/**
 * Vision-Language-Action (VLA) Tactical Commands, Adventure Missions & Telemetry Types
 */

export type FlightTrackMode =
  | 'LAUNCH_BOOST'
  | 'SUCTION_WALL_CLIMB'
  | 'INVERTED_RELEASE'
  | 'BALLISTIC_ROLL_KICKFLIP'
  | 'RETRO_HOVER_SLAM'
  | 'HIGH_SPEED_VENTURI'
  | 'CRYOGENIC_ICE_YAW'
  | 'CREVASSE_ARC_JUMP'
  | 'CROSSWIND_BALLISTIC_LEAP';

export interface VLATacticalCommand {
  flightTrackMode: FlightTrackMode;
  targetSpeedMps: number;
  targetPitchDeg: number;
  targetRollDeg: number;
  targetYawRateDegS: number;
  targetAltitudeM: number;
  suctionFanPowerKw: number;
  skirtTargetGapMm: number;
  rearWingMode: 'STOWED' | 'MAX_DOWNFORCE' | 'AIRBRAKE_90';
  cgtArmState: boolean;
  reasoningTrace: string;
}

export interface AdventureDefinition {
  id: string; // 'ADV-01'..'ADV-10'
  title: string;
  location: string;
  targetMetrics: {
    propellantBudgetKg: number;
    targetCompletionSec: number;
    maxAllowedLandingErrorM?: number;
    targetTopSpeedMph?: number;
    targetLapTimeStr?: string;
  };
  environmentalConditions: {
    ambientPressureKpa: number;
    ambientTempC: number;
    surfaceFrictionMu: number;
    crosswindSpeedKmh: number;
  };
  missionBrief: string;
}

export const ADVENTURE_DEFINITIONS: AdventureDefinition[] = [
  {
    id: 'ADV-01',
    title: 'SpaceX McGregor 170° Vertical Wall & Inverted Ceiling Drop',
    location: 'Waco / McGregor, TX',
    targetMetrics: { propellantBudgetKg: 142.0, targetCompletionSec: 8.5, maxAllowedLandingErrorM: 0.20 },
    environmentalConditions: { ambientPressureKpa: 101.3, ambientTempC: 22.0, surfaceFrictionMu: 1.15, crosswindSpeedKmh: 5.0 },
    missionBrief: 'Autonomous launch -> 4,700 kgf suction lock -> climb 21 m parabolic wall to 170 deg pitch -> zero-speed inverted pause -> fan cut & mid-air pitch/roll leveling -> 3.3g hover-slam at 6.5 m -> soft touchdown.',
  },
  {
    id: 'ADV-02',
    title: 'Tesla Convoy Kickflip & 360° Mid-Air Barrel Roll',
    location: 'McGregor Pad, TX',
    targetMetrics: { propellantBudgetKg: 165.0, targetCompletionSec: 6.2, maxAllowedLandingErrorM: 0.18 },
    environmentalConditions: { ambientPressureKpa: 101.3, ambientTempC: 22.0, surfaceFrictionMu: 1.26, crosswindSpeedKmh: 8.0 },
    missionBrief: '0-60 mph launch in 0.81 s -> ramp liftoff to 7.1 m apogee -> 360 deg axial roll over 5 Tesla vehicles via asymmetric wheel-well pulses (18.4 kN for 0.62 s) -> level landing.',
  },
  {
    id: 'ADV-03',
    title: 'Snake River Canyon 500-Meter Supersonic Ballistic Leap',
    location: 'Twin Falls, ID',
    targetMetrics: { propellantBudgetKg: 227.0, targetCompletionSec: 9.4, targetTopSpeedMph: 238.0 },
    environmentalConditions: { ambientPressureKpa: 89.2, ambientTempC: 15.0, surfaceFrictionMu: 1.10, crosswindSpeedKmh: 35.0 },
    missionBrief: 'Approach ramp with 2g suction + 1 MW RWD to 195 mph -> full 80 kN rear burn at 28 deg exit (4.64g launch) -> 94 m apogee flight -> crosswind rejection via yaw CGTs -> retro-burn landing on far rim.',
  },
  {
    id: 'ADV-04',
    title: 'Nürburgring Nordschleife Sub-5-Minute Autonomous Time Attack',
    location: 'Nürburg, Germany',
    targetMetrics: { propellantBudgetKg: 195.0, targetCompletionSec: 288.2, targetLapTimeStr: '4:48.20' },
    environmentalConditions: { ambientPressureKpa: 94.5, ambientTempC: 18.0, surfaceFrictionMu: 1.35, crosswindSpeedKmh: 12.0 },
    missionBrief: 'Flugplatz crest liftoff suppression via 4,700 kgf suction pulse -> automatic 25 mm skirt lift through Karussell banking -> 230+ mph straight -> 90-deg Optimus airbrake + 3.15g braking.',
  },
  {
    id: 'ADV-05',
    title: 'Bonneville Salt Flats Mach 0.5 (383 MPH) High-Speed Aero Run',
    location: 'Wendover, UT',
    targetMetrics: { propellantBudgetKg: 220.0, targetCompletionSec: 18.0, targetTopSpeedMph: 368.4 },
    environmentalConditions: { ambientPressureKpa: 86.8, ambientTempC: 28.0, surfaceFrictionMu: 0.65, crosswindSpeedKmh: 10.0 },
    missionBrief: 'FOD salt filter active below 180 mph -> auto transition at 200 mph to Open-Skirt High-Speed Venturi Mode -> sustained 600L COPV burn pushing 368+ mph top speed.',
  },
  {
    id: 'ADV-06',
    title: 'Pikes Peak 14,115-Foot Thin-Air Alpine Ascent',
    location: 'Colorado Springs, CO',
    targetMetrics: { propellantBudgetKg: 180.0, targetCompletionSec: 432.4, targetLapTimeStr: '7:12.40' },
    environmentalConditions: { ambientPressureKpa: 60.1, ambientTempC: 2.0, surfaceFrictionMu: 1.18, crosswindSpeedKmh: 25.0 },
    missionBrief: 'Thin air reduces suction DeltaP by 38% while boosting nozzle Isp by +10.5% -> VLA compensates hairpin slip via nose yaw CGT pulses + RWD torque vectoring.',
  },
  {
    id: 'ADV-07',
    title: 'Monaco Urban Tunnel Corkscrew & Yacht Helipad Hop',
    location: 'Monte Carlo, Monaco',
    targetMetrics: { propellantBudgetKg: 155.0, targetCompletionSec: 12.0, maxAllowedLandingErrorM: 0.15 },
    environmentalConditions: { ambientPressureKpa: 101.3, ambientTempC: 24.0, surfaceFrictionMu: 1.20, crosswindSpeedKmh: 14.0 },
    missionBrief: 'Continuous 112 km/h inverted ceiling corkscrew along tunnel roof using 2g suction -> exit portal -> precision 2.8 s ballistic CGT hop onto moving offshore yacht helipad.',
  },
  {
    id: 'ADV-08',
    title: "Moab Hell's Revenge Sandstone Crevasse Multi-Hop",
    location: 'Moab, UT',
    targetMetrics: { propellantBudgetKg: 190.0, targetCompletionSec: 15.0, maxAllowedLandingErrorM: 0.25 },
    environmentalConditions: { ambientPressureKpa: 87.0, ambientTempC: 30.0, surfaceFrictionMu: 0.95, crosswindSpeedKmh: 18.0 },
    missionBrief: 'Suspension lifts +35 mm and retracts skirts 100% into sills -> VLA maps far ledge -> synchronized rear + wheel-well CGT launch vaulting 16.4 m rock chasm at 42 deg arc.',
  },
  {
    id: 'ADV-09',
    title: 'Arctic Sea-Ice Sheet -40°C Cryogenic Zero-Friction Slalom',
    location: 'Svalbard, Norway',
    targetMetrics: { propellantBudgetKg: 135.0, targetCompletionSec: 22.0, targetTopSpeedMph: 90.0 },
    environmentalConditions: { ambientPressureKpa: 101.0, ambientTempC: -40.0, surfaceFrictionMu: 0.12, crosswindSpeedKmh: 20.0 },
    missionBrief: 'Octovalve thermal loop heats Optimus cryo-valves while COPV gas drops to -128.4 C -> nose lateral yaw thrusters and rear gimbaled CGTs execute 145 km/h zero-countersteer slalom.',
  },
  {
    id: 'ADV-10',
    title: 'Giga Texas Autonomous Obstacle Gauntlet & Falcon Pad Hover-Slam',
    location: 'Austin, TX',
    targetMetrics: { propellantBudgetKg: 175.0, targetCompletionSec: 14.5, maxAllowedLandingErrorM: 0.10 },
    environmentalConditions: { ambientPressureKpa: 100.8, ambientTempC: 27.0, surfaceFrictionMu: 1.25, crosswindSpeedKmh: 6.0 },
    missionBrief: 'High-speed obstacle blockage at 18 m -> 14.2 ms VLA detection -> emergency 4.6 m vertical CGT hop over barrier -> mid-air yaw turn -> Falcon-9 hover-slam onto center bullseye.',
  },
];
