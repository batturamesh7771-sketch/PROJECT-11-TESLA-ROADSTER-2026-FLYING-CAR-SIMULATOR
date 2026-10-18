# Initial Repository Audit & Diagnostics

**Date:** October 17, 2026  
**Auditor:** Autonomous Systems & Vehicle Engineering Agent  
**Repository:** `tesla-roadster-2026-sim/`

---

## 1. System & Architecture Overview

* **Frontend Framework:** React 19 + TypeScript 5.6 + Vite 6.0 + TailwindCSS.
* **3D Engine:** Three.js r170 (WebGL2/WebGPU compatible).
* **Entry Points:** `apps/web-simulator/src/main.tsx` -> `apps/web-simulator/src/App.tsx`.
* **Physics Implementations:**
  * Client-side Web Worker / TS loop: `apps/web-simulator/src/physics/RoadsterPhysicsEngine.ts` (1,000 Hz fixed-step Euler/RK4).
  * Backend Python reference engine: `services/physics-autonomy-engine/physics_solver.py` (FastAPI / SciPy / NumPy).
* **Test Frameworks:** Vitest 2.1 (`npm test`) & Python verification runner (`python tests/test_physics.py`).

---

## 2. Root Cause Analysis of Failed Screenshots (`media_1792241550367.png` & `media_1792241632384.png`)

1. **Disconnected/Floating Geometry:**
   * In `RoadsterMeshBuilder.ts` and `RoadsterCADAssembly.ts`, individual component groups (chassis, nose, canopy, wheels) were positioned using independent local coordinate systems with mismatched offsets.
   * `isHoverMode` defaulted to `true` on startup, forcing the vehicle to float 2.4 meters in the air with simulated thruster flutter, rather than resting physically on the test track with tire-ground contact.
2. **Missing Real-World Test Facility:**
   * The environment was a simple dark wireframe grid with a red circular decal and a fragmented curved ramp that looked like a row of floating dominoes.
   * No asphalt test straight, no braking marks, no slalom cones, no pit facilities, and no skybox or scale references.
3. **Sci-Fi Overlay vs. Professional Engineering Lab:**
   * The dashboard overlaid glowing neon gauges, raw terminal dumps, and complex gas equations over the viewport.
   * As shown in reference designs (`media_1792242213677.jpg` and `media_1792242563674.jpg`), an engineering workstation requires:
     * Structured layout: Top Mission bar, Left Vehicle State & Component Tree, Center 3D Viewport (70-80% area), Right Live Telemetry time-series charts, and Bottom Simulation Controls.
     * Measurable test records with repeatability metrics and pass/fail criteria.

---

## 3. Telemetry & Data Provenance Audit

| Channel / Gauge | Source Status | Diagnostic Finding | Corrective Action |
| :--- | :--- | :--- | :--- |
| **Speed / Acceleration** | SIMULATION_CALCULATED | Computed from velocity derivative, but not linked to keyboard drive input in real-time. | Bind direct longitudinal tire traction to keyboard/automated driver. |
| **Wheel Ground Contact** | BROKEN / FLOATING | Vehicle hovered above ground due to default hover flag. | Settle vehicle on tires with suspension normal load equilibrium. |
| **BOM Count (1,248)** | INFERRED_METRIC | Inferred from generic automotive parts breakdown. | Link directly to a structured, searchable component manifest (1,248 items). |
| **COPV Pressure & Temp** | SIMULATION_ASSUMPTION | Real-gas blowdown equation runs, but is disconnected from normal road driving. | Restrict thruster depletion to designated test missions (`T-07`, `T-08`). |
| **Downforce / Vacuum** | SIMULATION_ASSUMPTION | FSI equation runs, but was permanently enabled in HUD. | Modulate downforce strictly based on speed and fan activation state. |

---

## 4. Engineering Tool Detection on Local Host

| Tool / Environment | Detection Status | Executable Path / Notes |
| :--- | :--- | :--- |
| **MATLAB / Simulink** | **FOUND & VERIFIED** | `E:\Program Files\MATLAB\R2026a\bin\matlab.exe` |
| **Python** | **FOUND & VERIFIED** | Python 3.14.5 (PATH verified) |
| **Node.js / npm** | **FOUND & VERIFIED** | Node v26.3.0, npm 11.16.0 |
| **Blender** | **NOT INSTALLED** | Not present on PATH |
| **Unreal Engine** | **NOT INSTALLED** | Not present on PATH |
| **Project Chrono** | **NOT INSTALLED** | Not present on PATH |
| **OpenFOAM** | **NOT INSTALLED** | Not present on PATH |
| **OpenModelica** | **NOT INSTALLED** | Not present on PATH |
| **FreeCAD** | **NOT INSTALLED** | Not present on PATH |
| **CARLA** | **NOT INSTALLED** | Not present on PATH |

*Engineering Tool Strategy:* Use the browser-based deterministic physics plant (Three.js WebGPU/WebGL2) as the primary simulation runtime, backed by export scripts for the installed MATLAB R2026a Vehicle Dynamics Blockset.

---

## 5. Staged Recovery Plan

1. **Stage 1 (Immediate): Complete Assembled Car & Working Camera**
   * Build a continuous, smooth, photorealistic sports-car body inspired by the real prototype photos (silver/white metallic paint, black lower sills, flush aerodisc wheels, glass canopy).
   * Ensure the four tires rest firmly on the ground ($z=0$).
   * Provide multiple camera angles (Chase, 3/4 Exterior, Cockpit, Side, Top) with mouse orbit and Reset.
2. **Stage 2: Real Asphalt Proving Ground Facility**
   * Paved test facility with asphalt road, lane markings, pit building, cones, braking zone, and slalom course.
3. **Stage 3: Interactive Ground Vehicle Dynamics**
   * Enable real keyboard driving (W/S for Throttle/Brake, A/D for Steering, Space for E-Brake, R for Reset).
   * Compute tire friction, suspension settle, and stopping distance.
4. **Stage 4: Professional Engineering Workstation UI**
   * Replicate the exact layout in `media_1792242213677.jpg`:
   * Top navigation tabs, left vehicle state & 1,248-component tree, right live telemetry plots (Speed, Accel, Yaw, Altitude), bottom test mission runner.
