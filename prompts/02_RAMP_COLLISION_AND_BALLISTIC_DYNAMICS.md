# Prompt 02: Rigid Ramp Collision & Ballistic Loop Dynamics

## Critical Bug Fix & Physics Enforcement
Eliminate ghosting through the curved half-loop ramp and prevent unphysical altitude drift (car floating to 3,800m at 1,465 km/h).

### Directives:
1. **Solid Road & Curved Ramp Collision:**
   - Road and curved half-loop ramp must be completely impenetrable.
   - Enforce multi-point downward and surface-normal raycasting or analytical circular arc constraint:
     $$y(z) = y_c \pm \sqrt{R^2 - (z - z_c)^2}$$
   - Exact surface-normal orientation matching vehicle roll/pitch to ramp gradient.

2. **2.0G Lizard Suction Wall & Ceiling Climbing:**
   - Underbody fans generate sufficient suction force ($F_{\text{suction}} > mg$) to adhere the car to 90° vertical walls and 180° inverted ceilings at apex (28.0m).

3. **Ramp Lip Ballistic Release & 180° Flip:**
   - When car passes ramp lip at $z = z_{\text{lip}}$, release suction and enter 6-DOF ballistic flight.
   - Fire RCS pitch nozzles to execute controlled 180° vehicle attitude flip to orient wheels toward earth.
   - Altitude ceiling hard-limited to test protocol (max 25–35 meters).

4. **10-Nozzle Retro-Burn Landing:**
   - Active PID terminal deceleration firing underbody and diffuser nozzles.
   - Touchdown sink rate strictly controlled to $< 1.0\text{ m/s}$ onto runway surface.
