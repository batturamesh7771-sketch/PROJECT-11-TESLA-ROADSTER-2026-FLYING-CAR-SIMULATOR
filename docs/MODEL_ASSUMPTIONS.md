# Vehicle Model Assumptions & Parameter Provenance Ledger

This document maintains an evidence-based accounting of all parameters used across the simulation.

## 1. Parameter Ledger

| Parameter | Value (SI) | Display Value | Classification | Source / Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Curb Mass (Base)** | 1,750 kg | 1,750 kg | ENGINEERING_ESTIMATE | Inferred from 4680 structural pack & carbon tub |
| **Loaded Mass (Rocket)** | 2,150 kg | 2,150 kg | REPORTED_CLAIM | October 2026 McGregor reveal disclosures |
| **Wheelbase** | 2.75 m | 2,750 mm | ENGINEERING_ESTIMATE | Visual proportion analysis from unveil photos |
| **Track Width (Front/Rear)** | 1.68 m / 1.72 m | 1,680 / 1,720 mm | ENGINEERING_ESTIMATE | Proportional estimate |
| **Tire Dimensions (F/R)** | 295/30R20 / 335/30R21 | 20" F / 21" R | REPORTED_CLAIM | Prototype display placards |
| **Peak Tire Friction (Dry)** | $\mu = 1.26$ | 1.26 | PUBLICLY_VERIFIED | Pirelli P Zero Trofeo RS track tire characterization |
| **Powertrain Architecture** | Dual rear SiC motors | RWD Dual Motor | REPORTED_CLAIM | Lars Moravy interview (Top Gear / MotorTrend) |
| **Peak Motor Power** | 1,000 kW | 1,341 hp | REPORTED_CLAIM | October 2026 announcement |
| **Peak Shaft Torque** | 1,400 Nm | 1,033 lb-ft | REPORTED_CLAIM | Technical briefing |
| **COPV Storage Volume** | 0.60 m³ (600 L) | 600 L | REPORTED_CLAIM | CellCog / EVXL technical review |
| **COPV Working Pressure** | 37.92 MPa | 5,500 psi | REPORTED_CLAIM | Track screen display readout |
| **COPV Structural Rating** | 68.95 MPa | 10,000 psi | SIMULATION_ASSUMPTION | Typical Type IV aerospace composite vessel rating |
| **Nozzle Array Layout** | 4 Rear + 4 Lift + 2 Yaw | 10 Nozzles | REPORTED_CLAIM | Prototype hardware breakdown |
| **Peak Thrust (4 Rear)** | 81.8 kN | 18,390 lbf | SIMULATION_ASSUMPTION | Theoretical isentropic/real-gas expansion model |
| **Fan Suction Downforce** | 46.1 kN | 4,700 kgf (2.0g) | REPORTED_CLAIM | US Patent 12,377,920 & McGregor demo telemetry |
| **Internal Gas Flow Rate** | Proprietary | N/A | NOT_KNOWN | Withheld by manufacturer |
| **Battery Cell Chemistry** | Proprietary 4680 | 4680 Format | REPORTED_CLAIM | Public announcement |

---

## 2. Classification Definitions

1. **`PUBLICLY_VERIFIED`**: Validated by published peer-reviewed data, standard tire physics, or open patents.
2. **`REPORTED_CLAIM`**: Disclosed by Tesla/SpaceX spokespersons or official reveal media, but not independently laboratory tested.
3. **`ENGINEERING_ESTIMATE`**: Derived from physical vehicle geometry, photographs, and established automotive equations.
4. **`SIMULATION_ASSUMPTION`**: Configured solely to allow virtual tests to run deterministically; visibly tagged in UI.
5. **`NOT_KNOWN`**: Proprietary information not disclosed publicly. Never fabricated as real telemetry.
