# Prompt 01: 2026 Tesla Roadster Flight Variant — System Architecture & Aerospace Physics

## Context & Engineering Requirements
Build a full-scale 60 FPS real-time digital twin and flight simulator for the 2026 Tesla Roadster SpaceX Package revealed at SpaceX McGregor, Texas.

### Key Technical Systems to Implement:
1. **600-Liter Dual Composite COPV Tanks (7,500 PSI / 517 Bar):**
   - 250 kg of compressed dry air/nitrogen.
   - Real-gas thermodynamic blowdown solver (Joule-Thomson cryo expansion cooling manifold to -42.5°C).
   - Dynamic mass depletion ($m(t) = m_0 - \int \dot{m}\,dt$) altering vehicle inertia and center of gravity.
   - Dual onboard compressors (+25 psi/s recharge when stationary on ground).

2. **10-Nozzle Cold-Gas Thruster Array:**
   - 2 Front bumper corner nozzles (pitch & roll stabilization).
   - 4 Underbody mid-rocker nozzles (vertical lift counteracting $mg = 19.42\text{ kN}$).
   - 4 Rear aerodynamic diffuser nozzles (forward 0–60 mph in 0.59s and retro-braking).
   - Fast solenoid valve response (< 12 ms latency).

3. **2.0G McMurtry-Style "Lizard" Vacuum Suction:**
   - Dual 20 kW electric turbines spinning at 18,000 RPM.
   - Active ground-effect skirts generating 39.2 kN (2.0G) of normal downforce.
   - Capability to drive completely inverted (180° upside-down) along ceiling loops.

4. **Multi-Platform Export Engine:**
   - Cross-engine adapters for Assetto Corsa, BeamNG.drive, Unreal Engine 5 Chaos Physics, and MATLAB/Simulink.
