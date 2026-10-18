# Prompt 04: Real-Time UI, Telemetry Bus & Navigation Modal System

## Workstation Overhaul Directives
Connect all static cockpit displays to a real-time reactive telemetry bus operating at 60 FPS.

### Requirements:
1. **Left Status & Configuration Panel:**
   - Real-time gauges: Speed (km/h), Altitude (m), Battery SoC (%), COPV Gas Pressure (psi), and Ground Suction (kN).
   - Interactive trim dropdown: Rocket (Air Ready), Thrust (Race Ready), Performance (Street Legal) affecting vehicle dynamics in real time.
   - Searchable 1,248-component BOM inspector with live telemetry metrics per category (Flight Systems, Aerodynamics, Propulsion, Suspension, Battery).

2. **Top Navigation Bar & 6 Interactive Modal Dialogs:**
   - `Vehicle`: SpaceX COPV dual-tank architecture, 10-nozzle vectoring matrix diagram, real-time pressure & mass.
   - `Simulation`: Real-time Newton-Euler 6-DOF equation solver, live variable viewer, numerical integrator status.
   - `Testing`: 9 certified proving ground missions (M-01 through M-09) with automated execution triggers.
   - `AI Autonomy`: Multi-modal neural sensor fusion, LiDAR point cloud, occupancy grid, Trajectory Planner state machine.
   - `Reports`: Comprehensive telemetry summary, peak G-forces, flight duration, COPV blowdown curves, and test certification export.
   - `Settings`: Physics tick rate (60–240 Hz), simulation time scale (0.1x–2.0x), aerodynamic drag coefficient, crosswind vector controls.

3. **Right Telemetry Panel & 60 FPS Multi-Channel Canvas Oscilloscope:**
   - 300-point rolling ring buffer rendered onto an HTML5 Canvas at 60 FPS.
   - Realistic baseline sensor jitter ($\pm 0.05$) when parked.
   - Filter tabs: All, Speed, Altitude, Thrust, G-Force, Temp.
   - Interactive mouse crosshair displaying timestamped values.
   - Live 10-nozzle cold-gas vectoring bar charts and thermal indicators.
