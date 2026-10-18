# Engineering Simulation Test Matrix

This matrix specifies the 15 executable test missions with mathematical acceptance criteria.

| Mission ID | Mission Title | Primary Test Objective | Mode / Environment | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **`T-01`** | Straight-line acceleration & braking | Measure 0–100 km/h sprint and 100–0 km/h braking distance | Standard Test Straight ($\mu = 1.0$) | Stopping distance $< 43.0\text{ m}$; Peak accel $> 6.5\text{ m/s}^2$ |
| **`T-02`** | Slalom & Dynamic Yaw Response | Track 30 m cone slalom at 65 km/h without spinout | Slalom Course ($\mu = 1.0$) | Cone hit count $= 0$; Yaw rate $< 45^\circ\text{/s}$ |
| **`T-03`** | Wet Skidpad & Lateral Friction | Constant-radius cornering at friction limits | Wet Skidpad ($\mu = 0.65$) | Sustained lateral load $> 0.70\text{g}$; Slip $< 12^\circ$ |
| **`T-04`** | Emergency Braking at Split-Mu | Evaluate ABS stability across mixed surfaces ($\mu=0.3 / 1.0$) | Split-Mu Straight | Yaw deviation $< 0.35\text{ m}$; Controlled stop |
| **`T-05`** | Closed-Range Impulse Test | Test longitudinal thruster pulse on isolated test pad | Restricted Test Pad | Force vector aligned $\pm 1.5^\circ$; Impulse logged |
| **`T-06`** | Asymmetric Thruster Fault | Inject single-nozzle failure during burst | Sandbox Test Rig | SafetyGovernor detects within 20 ms; Inhibit fired |
| **`T-07`** | Virtual Jump Arc (`VIRTUAL-ONLY`) | Parabolic ramp launch and landing settle | Launch Ramp | Ballistic trajectory matches $z(t) = z_0 + v_z t - \frac{1}{2}gt^2$ |
| **`T-08`** | Inverted Fan Loop (`VIRTUAL-ONLY`) | 360° loop driven by underbody vacuum clamp | Inverted Tunnel Loop | Clamping load $> m g$; Zero detachment |
| **`T-09`** | Canyon Road & Crosswind | High-speed tracking with 35 km/h crosswinds | Proving Ground Loop | Cross-track error $< 0.40\text{ m}$ |
| **`T-10`** | Autonomous Parking | Low-speed maneuvering into marked bay | Garage Bay | Final position error $< 0.10\text{ m}$; Heading $< 2^\circ$ |
| **`T-11`** | Sensor Dropout Recovery | Inject 200 ms IMU dropout at 80 km/h | Proving Ground Straight | Fallback estimator maintains trajectory without spin |
| **`T-12`** | Thermal & Energy Endurance | Continuous 5-lap drive cycle simulation | Full Course | Battery SOC accounting consistent; Temp $< 65^\circ\text{C}$ |
| **`T-13`** | Crosswind Disturbance Rejection | 50 km/h lateral gust during highway cruise | Open Runway | Steering corrective action restores lane within 1.2 s |
| **`T-14`** | Brake Degradation Fallback | 50% front hydraulic pressure loss | Braking Track | Motor regen automatically compensates; Warning logged |
| **`T-15`** | Fault-Free Regression Suite | Run all standard ground tests sequentially | All Standard Tracks | 100% pass across all assertions; Repeatability $< 1.5\%$ |
