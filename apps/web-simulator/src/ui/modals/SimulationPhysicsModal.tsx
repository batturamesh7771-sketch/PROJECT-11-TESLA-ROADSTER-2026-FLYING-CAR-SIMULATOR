import React, { useState } from 'react';
import { X, Sliders, Play, RotateCcw, Activity, Layers, Zap } from 'lucide-react';
import { GroundVehicleDynamics } from '../../physics/GroundVehicleDynamics';

interface SimulationPhysicsModalProps {
  vehicle: GroundVehicleDynamics;
  onClose: () => void;
}

export const SimulationPhysicsModal: React.FC<SimulationPhysicsModalProps> = ({ vehicle, onClose }) => {
  const [, setRerender] = useState(0);

  // Math substitutions
  const theta = vehicle.pitchRad;
  const phi = vehicle.rollRad;
  const cosPitch = Math.cos(theta);
  const cosRoll = Math.cos(phi);
  const cosTilt = cosPitch * cosRoll;
  const fThrustKn = vehicle.totalThrustKn;
  const mass = vehicle.massKg;
  const g = vehicle.userGravityMps2;
  const weightKn = (mass * g) / 1000.0;
  const liftKn = Math.max(0, fThrustKn * Math.max(0, cosTilt));
  const fNetYKn = liftKn - weightKn;
  const ay = (fNetYKn * 1000.0) / mass;

  // Ramp & Suction
  const thetaRamp = vehicle.rampThetaRad;
  const fSuctionKn = vehicle.fanDownforceKn;
  const fNormalKn = vehicle.isOnRamp
    ? fSuctionKn + weightKn * Math.cos(thetaRamp)
    : fSuctionKn + weightKn;
  const mu = vehicle.muDryAsphalt;
  const fTractionKn = mu * fNormalKn;

  // Torque
  const Iyy = vehicle.Iyy;
  const pitchRate = vehicle.pitchRateRadS;
  const alphaPitch = vehicle.flipPhase !== 'IDLE' ? 4.2 : 0.0;
  const tauNm = (Iyy * alphaPitch).toFixed(0);

  const resetPid = () => {
    vehicle.pidAltitudeKp = 1400.0;
    vehicle.pidAltitudeKi = 45.0;
    vehicle.pidAltitudeKd = 2800.0;
    setRerender((r) => r + 1);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#050811]/92 backdrop-blur-md flex flex-col p-6 overflow-hidden pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span>REAL-TIME PHYSICS SOLVER & MATH EQUATIONS STUDIO</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                NEWTONIAN 6-DOF SOLVER ACTIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Live Equation Evaluation • Dynamic Variable Substitution • Tunable Environmental & Control Gains
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-bold cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
          <span>CLOSE VIEW (RETURN TO 3D)</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-5 overflow-y-auto pr-1">
        {/* Left Column: Live Math Equations with Real Substitutions (6 cols) */}
        <div className="col-span-6 flex flex-col gap-4">
          {/* Vertical Newton-Euler Equation */}
          <div className="bg-[#0b101c] border border-cyan-800/60 rounded-xl p-4 shadow-xl">
            <span className="text-xs font-mono font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> VERTICAL NEWTON-EULER FORCE SOLVER
            </span>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs space-y-2">
              <div className="text-cyan-400 font-bold">
                F_y,net = F_thrust • cos(θ) • cos(ϕ) - m•g = m • a_y
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/80 pt-2">
                <span>Substituted Current Frame:</span>
                <div className="text-white mt-1">
                  ({fThrustKn.toFixed(1)} kN • cos({(theta * 180 / Math.PI).toFixed(1)}°) • cos({(phi * 180 / Math.PI).toFixed(1)}°)) - ({mass} kg • {g.toFixed(2)} m/s²)
                </div>
                <div className="text-emerald-400 font-bold mt-1">
                  = {liftKn.toFixed(1)} kN - {weightKn.toFixed(1)} kN = {fNetYKn.toFixed(2)} kN Net Force
                </div>
                <div className="text-cyan-300 font-bold">
                  ➔ Vertical Acceleration a_y = {ay.toFixed(2)} m/s²
                </div>
              </div>
            </div>
          </div>

          {/* Wall/Ceiling Suction Equilibrium */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl">
            <span className="text-xs font-mono font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> WALL / CEILING SUCTION EQUILIBRIUM & TRACTION LIMIT
            </span>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs space-y-2">
              <div className="text-amber-300 font-bold">
                F_normal = F_suction + m•g • cos(θ_ramp) &nbsp;|&nbsp; F_traction = μ • F_normal
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/80 pt-2">
                <div>F_suction = {fSuctionKn.toFixed(1)} kN &nbsp;|&nbsp; θ_ramp = {(thetaRamp * 180 / Math.PI).toFixed(1)}°</div>
                <div className="text-white mt-1">
                  F_normal = {fSuctionKn.toFixed(1)} kN + ({weightKn.toFixed(1)} kN • cos({(thetaRamp * 180 / Math.PI).toFixed(1)}°)) = <span className="text-cyan-300 font-bold">{fNormalKn.toFixed(1)} kN</span>
                </div>
                <div className="text-emerald-400 font-bold mt-1">
                  Maximum Available Grip F_traction = {mu} • {fNormalKn.toFixed(1)} kN = {fTractionKn.toFixed(1)} kN
                </div>
              </div>
            </div>
          </div>

          {/* Rotational Torque & Flip Dynamics */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl">
            <span className="text-xs font-mono font-bold text-purple-400 mb-2 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-purple-400" /> ROTATIONAL TORQUE & ATTITUDE DYNAMICS
            </span>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs space-y-2">
              <div className="text-purple-300 font-bold">
                τ = I_yy • α &nbsp;|&nbsp; ω_pitch = ∫ α dt
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/80 pt-2">
                <div>Moment of Inertia I_yy = {Iyy} kg•m²</div>
                <div className="text-white mt-1">
                  Current Angular Velocity ω_pitch = <span className="text-cyan-300 font-bold">{pitchRate.toFixed(2)} rad/s</span> ({(pitchRate * 180 / Math.PI).toFixed(0)}°/s)
                </div>
                <div className="text-purple-300 font-bold mt-1">
                  Commanded Pitch Torque τ = {tauNm} N•m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Physics Sliders & Control Tuning (6 cols) */}
        <div className="col-span-6 flex flex-col gap-4">
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            <span className="text-xs font-mono font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> INTERACTIVE LIVE PHYSICS SLIDERS
            </span>

            {/* Gravity Slider & Presets */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Gravitational Acceleration (g):</span>
                <span className="text-cyan-300 font-bold">{vehicle.userGravityMps2.toFixed(2)} m/s²</span>
              </div>
              <div className="flex gap-2">
                {[
                  { name: 'Earth (9.81)', val: 9.80665 },
                  { name: 'Mars (3.72)', val: 3.72 },
                  { name: 'Moon (1.62)', val: 1.62 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => { vehicle.userGravityMps2 = preset.val; setRerender((r) => r + 1); }}
                    className={`flex-1 py-1 px-2 rounded text-[10px] border cursor-pointer ${
                      Math.abs(vehicle.userGravityMps2 - preset.val) < 0.1
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.1"
                value={vehicle.userGravityMps2}
                onChange={(e) => { vehicle.userGravityMps2 = parseFloat(e.target.value); setRerender((r) => r + 1); }}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Vehicle Mass */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Mass (m):</span>
                <span className="text-cyan-300 font-bold">{vehicle.userVehicleMassKg} kg</span>
              </div>
              <input
                type="range"
                min="1500"
                max="2500"
                step="20"
                value={vehicle.userVehicleMassKg}
                onChange={(e) => { vehicle.userVehicleMassKg = parseFloat(e.target.value); setRerender((r) => r + 1); }}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Max Thruster Output */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Cold-Gas Maximum Thrust:</span>
                <span className="text-cyan-300 font-bold">{vehicle.userMaxThrustKn.toFixed(1)} kN</span>
              </div>
              <input
                type="range"
                min="40.0"
                max="120.0"
                step="1.0"
                value={vehicle.userMaxThrustKn}
                onChange={(e) => { vehicle.userMaxThrustKn = parseFloat(e.target.value); setRerender((r) => r + 1); }}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* PID Altitude Gains */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">PID Hover Gains</span>
                <button
                  onClick={resetPid}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-cyan-400 border border-cyan-800 cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Proportional K_p: {vehicle.pidAltitudeKp.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="50"
                  value={vehicle.pidAltitudeKp}
                  onChange={(e) => { vehicle.pidAltitudeKp = parseFloat(e.target.value); setRerender((r) => r + 1); }}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Integral K_i: {vehicle.pidAltitudeKi.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={vehicle.pidAltitudeKi}
                  onChange={(e) => { vehicle.pidAltitudeKi = parseFloat(e.target.value); setRerender((r) => r + 1); }}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Derivative K_d: {vehicle.pidAltitudeKd.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="100"
                  value={vehicle.pidAltitudeKd}
                  onChange={(e) => { vehicle.pidAltitudeKd = parseFloat(e.target.value); setRerender((r) => r + 1); }}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Simulation Time Scale */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-slate-400">Simulation Time Scale:</span>
              <div className="flex gap-2">
                {[0.25, 0.5, 1.0, 2.0].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => { vehicle.simTimeScale = scale; setRerender((r) => r + 1); }}
                    className={`flex-1 py-1.5 rounded text-xs font-bold border cursor-pointer ${
                      vehicle.simTimeScale === scale
                        ? 'bg-cyan-500 text-slate-950 border-white shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {scale === 1.0 ? '1.0x (Real-Time)' : `${scale}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
