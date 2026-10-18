-- Tesla Roadster 2026 CSP Extended Physics Script
-- Governs 10,000-PSI COPV Blowdown Thruster and 4,700 kgf Ground-Effect Suction

local copv_pressure_bar = 379.2  -- Nominal 5,500 PSI track readout
local gas_mass_kg       = 240.0  -- 600-liter dual COPV capacity (Rocket Trim)
local V_eff             = 565.0  -- Sea-level effective exhaust velocity (m/s)

function script.update(dt)
    local car = ac.getCarState(1)

    -- 1. Cold-Gas Thruster Boost (Triggered via Spacebar or Extra Switch A)
    if car.extraA and gas_mass_kg > 2.0 and copv_pressure_bar > 5.0 then
        local pressure_ratio = copv_pressure_bar / 379.2
        local m_dot = 144.8 * pressure_ratio
        local thrust_N = m_dot * V_eff

        gas_mass_kg = math.max(0.0, gas_mass_kg - m_dot * dt)
        local mass_ratio = math.max(0.01, gas_mass_kg / 240.0)
        copv_pressure_bar = 379.2 * math.pow(mass_ratio, 1.4)

        -- Longitudinal thrust vector at rear diffuser (X=0.0, Y=0.38, Z=-1.95)
        ac.addForce(vec3(0, 0, thrust_N), true, vec3(0, 0.38, -1.95), true)
    end

    -- 2. Underbody Suction Fan System (Extra Switch B)
    if car.extraB then
        local fan_downforce_N = (car.speedKmh < 320.0) and 46100.0 or 18500.0
        ac.addForce(vec3(0, -fan_downforce_N, 0), true, vec3(0, 0.15, 0.0), true)
    end
end
