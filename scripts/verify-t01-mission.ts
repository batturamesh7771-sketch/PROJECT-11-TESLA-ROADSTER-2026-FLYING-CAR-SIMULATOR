import { GroundVehicleDynamics } from '../apps/web-simulator/src/physics/GroundVehicleDynamics';

console.log('================================================================');
console.log('TESLA ROADSTER 2026 DIGITAL TWIN - T-01 MISSION VERIFICATION');
console.log('Automated Straight-Line 100 - 0 km/h Braking Test Runner');
console.log('================================================================\n');

const vehicle = new GroundVehicleDynamics();
vehicle.startT01BrakingTest();

console.log(`Initial State: PosX = ${vehicle.posX.toFixed(1)}m, Speed = ${vehicle.speedKmh.toFixed(1)} km/h, Mass = ${vehicle.massKg} kg`);
console.log(`Peak Dry Friction Coeff mu = ${vehicle.muDryAsphalt}, Max Brake Force = ${vehicle.maxBrakeForceN} N\n`);

const dt = 0.01; // 100 Hz simulation time step
let steps = 0;
let loggedAccelPhase = false;
let loggedBrakePhase = false;

while (vehicle.testPhase !== 'COMPLETED' && steps < 2000) {
  vehicle.update(dt);
  steps++;

  if (vehicle.testPhase === 'ACCELERATING' && !loggedAccelPhase && vehicle.speedKmh > 50) {
    console.log(`[T + ${(steps * dt).toFixed(2)}s] Accelerating through 50 km/h | Accel: ${vehicle.accelG.toFixed(2)}g | PosX: ${vehicle.posX.toFixed(1)}m`);
    loggedAccelPhase = true;
  }

  if (vehicle.testPhase === 'BRAKING' && !loggedBrakePhase) {
    console.log(`[T + ${(steps * dt).toFixed(2)}s] 100 km/h Trigger Reached! Threshold ABS Braking Engaged!`);
    console.log(`             Start PosX: ${vehicle.testBrakeStartPosX.toFixed(2)}m, Speed: ${vehicle.speedKmh.toFixed(1)} km/h`);
    loggedBrakePhase = true;
  }
}

console.log('\n----------------------------------------------------------------');
console.log('TEST MISSION EXECUTION COMPLETE');
console.log('----------------------------------------------------------------');

if (vehicle.lastTestResult) {
  const res = vehicle.lastTestResult;
  console.log(`Run ID:            ${res.runId}`);
  console.log(`Entry Speed:       ${res.entrySpeedKmh.toFixed(1)} km/h`);
  console.log(`Stopping Distance: ${res.stoppingDistanceM.toFixed(2)} m (Acceptance Limit: <= 43.0 m)`);
  console.log(`Peak Deceleration: ${res.peakDecelG.toFixed(2)} g (Acceptance Limit: >= 1.05 g)`);
  console.log(`Stopping Time:     ${res.stoppingTimeSec.toFixed(2)} s`);
  console.log(`Verdict:           ${res.passed ? 'PASSED (VERIFIED)' : 'FAILED'}`);
  console.log(`Notes:             ${res.notes}`);

  if (res.passed) {
    console.log('\n>>> ACCEPTANCE CRITERIA SATISFIED FOR T-01 GROUND VEHICLE DYNAMICS <<<');
  } else {
    console.error('\n>>> ACCEPTANCE CRITERIA FAILED <<<');
    process.exit(1);
  }
} else {
  console.error('No test result was generated!');
  process.exit(1);
}
