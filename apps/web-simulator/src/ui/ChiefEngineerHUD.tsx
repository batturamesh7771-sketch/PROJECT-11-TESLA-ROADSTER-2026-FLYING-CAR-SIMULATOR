import React from 'react';
import { VehicleStateBuffer, VehicleVariant, VLATacticalCommand } from '@tesla-roadster/shared-core';
import { Gauge, Wind, Flame, ShieldAlert, Cpu, Layers } from 'lucide-react';

interface HUDProps {
  state: VehicleStateBuffer;
  command: VLATacticalCommand;
  explosionFactor: number;
  onExplosionChange: (factor: number) => void;
  onTrimChange: (trim: VehicleVariant) => void;
  onResetCOPV: () => void;
}

export const ChiefEngineerHUD: React.FC<HUDProps> = ({
  state,
  command,
  explosionFactor,
  onExplosionChange,
  onTrimChange,
  onResetCOPV,
}) => {
  const speedMph = (Math.hypot(state.velX, state.velY) * 2.23694).toFixed(1);
  const pressurePsi = (state.stagnationPressureBar * 14.5038).toFixed(0);
  const tempC = (state.stagnationTempK - 273.15).toFixed(1);
  const suctionKgf = (state.suctionDownforceN / 9.80665).toFixed(0);
  const thrustKn = (state.cgtTotalThrustN / 1000.0).toFixed(1);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20 font-sans">
      {/* Top Header Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse glow-red" />
            <span className="font-extrabold tracking-wider text-sm text-slate-200">TESLA ROADSTER 2026</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400 font-mono font-bold">
            CHIEF ENGINEER TELEMETRY BUS · 1 kHz
          </span>
          <div className="flex space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => onTrimChange(VehicleVariant.PERFORMANCE)}
              className={`px-3 py-1 rounded transition-colors ${state.variant === VehicleVariant.PERFORMANCE ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Performance
            </button>
            <button
              onClick={() => onTrimChange(VehicleVariant.THRUST)}
              className={`px-3 py-1 rounded transition-colors ${state.variant === VehicleVariant.THRUST ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Thrust Augment
            </button>
            <button
              onClick={() => onTrimChange(VehicleVariant.ROCKET)}
              className={`px-3 py-1 rounded transition-colors ${state.variant === VehicleVariant.ROCKET ? 'bg-red-600 text-white font-bold glow-red' : 'text-slate-400 hover:text-white'}`}
            >
              Rocket (Invite Only)
            </button>
          </div>
        </div>

        {/* Speedometer & G-Force Bubble */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl px-5 py-3 shadow-2xl flex items-center space-x-6">
          <div className="text-right">
            <div className="text-3xl font-black font-mono tracking-tight text-white">{speedMph}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">MPH SPEED</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-2xl font-black font-mono text-cyan-400">
              {((state.cgtTotalThrustN + state.suctionDownforceN) / (2350 * 9.81)).toFixed(2)}g
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">NET G-LOAD</div>
          </div>
        </div>
      </div>

      {/* Center Left: Gauges Column */}
      <div className="flex justify-between items-center w-full">
        <div className="space-y-3 pointer-events-auto w-80">
          {/* COPV Real-Gas Gauge */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>600L COPV BLOWDOWN (Z={state.compressibilityZ.toFixed(3)})</span>
              </div>
              <button
                onClick={onResetCOPV}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
              >
                REFILL
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">PRESSURE</div>
                <div className="text-sm font-bold text-amber-400">{pressurePsi} PSI</div>
                <div className="text-[9px] text-slate-500">{state.stagnationPressureBar.toFixed(1)} bar</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">PROPELLANT</div>
                <div className="text-sm font-bold text-cyan-400">{state.gasMassKg.toFixed(1)} kg N₂</div>
                <div className="text-[9px] text-slate-500">{( (state.gasMassKg / 240.0) * 100).toFixed(0)}% Capacity</div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-400">
              <span>Cryo Gas Temp: <span className="text-blue-400 font-bold">{tempC}°C</span></span>
              <span>Net Thrust: <span className="text-amber-400 font-bold">{thrustKn} kN</span></span>
            </div>
          </div>

          {/* Underbody Suction Fan Gauge */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>4x20 kW GROUND-EFFECT SUCTION</span>
              </div>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${state.venturiBypassOpen ? 'bg-purple-900/70 text-purple-300' : 'bg-cyan-950 text-cyan-300'}`}>
                {state.venturiBypassOpen ? 'VENTURI 200+' : 'CLOSED-SKIRT'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">DOWNFORCE</div>
                <div className="text-sm font-bold text-cyan-400">{suctionKgf} kgf</div>
                <div className="text-[9px] text-slate-500">{(state.suctionDownforceN / 1000).toFixed(1)} kN</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">PLENUM VACUUM</div>
                <div className="text-sm font-bold text-cyan-400">{state.plenumVacuumKpa.toFixed(2)} kPa</div>
                <div className="text-[9px] text-slate-500">Fan Shaft: {state.fanPowerKw.toFixed(0)} kW</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Right: 1,048 CAD Controls */}
        <div className="pointer-events-auto w-80 space-y-3">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>1,048-PART CAD EXPLODED VIEW</span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400">{(explosionFactor * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explosionFactor}
              onChange={(e) => onExplosionChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% Compact</span>
              <span>50% Subsystems</span>
              <span>100% Kinematic Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: VLA Cognitive Reasoning Trace & Mode */}
      <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl flex items-center space-x-4">
        <div className="flex items-center space-x-2 border-r border-slate-800 pr-4">
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">VLA TACTICAL MODE</div>
            <div className="text-xs font-mono font-bold text-emerald-400">{command.flightTrackMode}</div>
          </div>
        </div>
        <div className="flex-1 font-mono text-xs text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-slate-500 font-semibold">[25 Hz Strategic Stream]: </span>
          {command.reasoningTrace}
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono border-l border-slate-800 pl-4 text-slate-400">
          <div>Wing: <span className="text-white font-bold">{command.rearWingMode}</span></div>
          <div>Thrusters: <span className={command.cgtArmState ? 'text-green-400 font-bold' : 'text-slate-500 font-bold'}>{command.cgtArmState ? 'ARMED' : 'SAFE'}</span></div>
        </div>
      </div>
    </div>
  );
};
