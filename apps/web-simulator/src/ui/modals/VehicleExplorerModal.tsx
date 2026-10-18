import React from 'react';
import { X, Car, Wind, Shield, Layers, Zap, Gauge, Fan, Compass } from 'lucide-react';
import { GroundVehicleDynamics } from '../../physics/GroundVehicleDynamics';

interface VehicleExplorerModalProps {
  vehicle: GroundVehicleDynamics;
  onClose: () => void;
}

export const VehicleExplorerModal: React.FC<VehicleExplorerModalProps> = ({ vehicle, onClose }) => {
  const bar = Math.round(vehicle.copvPressurePsi / 14.5038);
  const remainingKg = ((vehicle.copvPressurePsi / 7500.0) * 250.0).toFixed(1);
  const isCompressing = vehicle.copvCompressorActive;

  return (
    <div className="absolute inset-0 z-50 bg-[#050811]/90 backdrop-blur-md flex flex-col p-6 overflow-hidden pointer-events-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span>VEHICLE DIGITAL TWIN & HARDWARE ARCHITECTURE</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                2026 TESLA ROADSTER FLIGHT VARIANT
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              SpaceX Cold-Gas Propulsion • 20 kW Underbody Suction • Carbon-Overwrapped Pressure Vessels
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

      {/* Main Grid Content */}
      <div className="flex-1 grid grid-cols-12 gap-5 overflow-y-auto pr-1">
        {/* Col 1: COPV System & Materials (4 cols) */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* COPV Cold-Gas System Card */}
          <div className="bg-[#0b101c] border border-cyan-800/60 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-400" /> SPACEX COPV ARCHITECTURE
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isCompressing
                  ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {isCompressing ? '⚡ COMPRESSOR RUNNING' : 'PRESSURE NOMINAL'}
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400">Total Tank Pressure</span>
                <span className="text-white font-bold">{Math.round(vehicle.copvPressurePsi).toLocaleString()} psi ({bar} bar)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400">Compressed Air Mass</span>
                <span className="text-cyan-300 font-bold">{remainingKg} kg / 250.0 kg</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400">Vessel Volume</span>
                <span className="text-white font-bold">{vehicle.copvCapacityL} Liters (Dual Tanks)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400">Compressor Recharge Rate</span>
                <span className="text-emerald-400 font-bold">+25.0 psi/sec (Grounded)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400">Joule-Thomson Expansion</span>
                <span className="text-cyan-400 font-bold">-42.5°C Cryo Drop</span>
              </div>
            </div>
          </div>

          {/* Interactive Trim Switcher */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl">
            <span className="text-xs font-mono font-bold text-slate-300 mb-3 block">
              SELECT VEHICLE CONFIGURATION
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Rocket', 'Thrust', 'Performance'] as const).map((trim) => (
                <button
                  key={trim}
                  onClick={() => vehicle.setTrimVariant(trim)}
                  className={`p-2.5 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                    vehicle.trimVariant === trim
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black">{trim}</div>
                  <div className="text-[9px] text-cyan-400">
                    {trim === 'Rocket' ? '10 Nozzles • Air Ready' : trim === 'Thrust' ? '4 Nozzles • Drag' : 'Aero Only • Street'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Materials & Chassis Specs */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl">
            <span className="text-xs font-mono font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" /> MATERIALS & CHASSIS
            </span>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Exterior Coating:</span>
                <span className="text-white">Metallic Crimson Red (Clearcoat 1.0)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Canopy Glass:</span>
                <span className="text-white">Spacesuit Gold Visor Tinted Electrochromic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chassis Subframe:</span>
                <span className="text-white">Magnesium-Titanium Cast + Carbon Tub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Curb Mass:</span>
                <span className="text-cyan-300 font-bold">{vehicle.massKg} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: 10-Nozzle Vectoring Matrix Top-Down Schematic (5 cols) */}
        <div className="col-span-5 bg-[#0b101c] border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" /> 10-NOZZLE PERIMETER VECTORING MATRIX
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-900 border border-slate-700 text-slate-300">
              {vehicle.activeNozzleCount}/10 PORTS FIRING
            </span>
          </div>

          {/* Top-Down Schematic Diagram */}
          <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center min-h-[340px]">
            {/* Outline of Roadster */}
            <div className="relative w-44 h-72 border-2 border-cyan-500/40 rounded-[35px] bg-slate-900/50 flex flex-col items-center justify-between py-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              {/* Cockpit Canopy */}
              <div className="absolute top-20 w-28 h-28 border border-cyan-400/30 rounded-2xl bg-cyan-950/30 flex items-center justify-center">
                <span className="text-[9px] font-mono text-cyan-400/80 font-bold">CANOPY</span>
              </div>

              {/* Front Nozzles (FL & FR) */}
              <div className="w-full flex justify-between px-3 z-10">
                <div className={`p-1.5 rounded-lg border text-center transition-all ${
                  vehicle.nozzleFL > 0.5 ? 'bg-cyan-500 text-black border-white shadow-[0_0_12px_rgba(6,182,212,1)]' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}>
                  <div className="text-[8px] font-bold">FL PORT</div>
                  <div className="text-[9px] font-mono font-black">{vehicle.nozzleFL.toFixed(1)} kN</div>
                </div>
                <div className={`p-1.5 rounded-lg border text-center transition-all ${
                  vehicle.nozzleFR > 0.5 ? 'bg-cyan-500 text-black border-white shadow-[0_0_12px_rgba(6,182,212,1)]' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}>
                  <div className="text-[8px] font-bold">FR PORT</div>
                  <div className="text-[9px] font-mono font-black">{vehicle.nozzleFR.toFixed(1)} kN</div>
                </div>
              </div>

              {/* Mid-Body Rocker Perimeter RCS (x4) */}
              <div className="w-full flex justify-between px-1 z-10">
                <div className="space-y-4">
                  <div className={`p-1 rounded border text-[8px] font-mono ${
                    vehicle.nozzlePerimeterEach > 0.5 ? 'bg-cyan-500 text-black border-white' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    SIDE L1: {vehicle.nozzlePerimeterEach.toFixed(1)} kN
                  </div>
                  <div className={`p-1 rounded border text-[8px] font-mono ${
                    vehicle.nozzlePerimeterEach > 0.5 ? 'bg-cyan-500 text-black border-white' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    SIDE L2: {vehicle.nozzlePerimeterEach.toFixed(1)} kN
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`p-1 rounded border text-[8px] font-mono ${
                    vehicle.nozzlePerimeterEach > 0.5 ? 'bg-cyan-500 text-black border-white' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    SIDE R1: {vehicle.nozzlePerimeterEach.toFixed(1)} kN
                  </div>
                  <div className={`p-1 rounded border text-[8px] font-mono ${
                    vehicle.nozzlePerimeterEach > 0.5 ? 'bg-cyan-500 text-black border-white' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    SIDE R2: {vehicle.nozzlePerimeterEach.toFixed(1)} kN
                  </div>
                </div>
              </div>

              {/* Rear Nozzles (RL, RR & Diffuser Pair) */}
              <div className="w-full flex flex-col items-center gap-1 z-10 px-3">
                <div className="w-full flex justify-between">
                  <div className={`p-1.5 rounded-lg border text-center transition-all ${
                    vehicle.nozzleRL > 0.5 ? 'bg-cyan-500 text-black border-white shadow-[0_0_12px_rgba(6,182,212,1)]' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    <div className="text-[8px] font-bold">RL BOOST</div>
                    <div className="text-[9px] font-mono font-black">{vehicle.nozzleRL.toFixed(1)} kN</div>
                  </div>
                  <div className={`p-1.5 rounded-lg border text-center transition-all ${
                    vehicle.nozzleRR > 0.5 ? 'bg-cyan-500 text-black border-white shadow-[0_0_12px_rgba(6,182,212,1)]' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    <div className="text-[8px] font-bold">RR BOOST</div>
                    <div className="text-[9px] font-mono font-black">{vehicle.nozzleRR.toFixed(1)} kN</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-[8px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    DIFFUSER CTR 1: {vehicle.nozzlePerimeterEach.toFixed(1)} kN
                  </div>
                  <div className="text-[8px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    DIFFUSER CTR 2: {vehicle.nozzlePerimeterEach.toFixed(1)} kN
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Electric Solenoid Actuator: &lt; 12ms</span>
            <span className="text-cyan-400 font-bold">Total Thrust: {vehicle.totalThrustKn.toFixed(1)} kN</span>
          </div>
        </div>

        {/* Col 3: Ground Effect Lizard Suction System (3 cols) */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <Fan className="w-4 h-4 text-amber-400 animate-spin" /> "LIZARD" SUCTION
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  vehicle.isLizardSuctionActive ? 'bg-amber-950 text-amber-300 border-amber-600' : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}>
                  {vehicle.isLizardSuctionActive ? '2.0G ADHESION' : 'STANDBY'}
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Fan Output Power</span>
                    <span className="text-white font-bold">{vehicle.fanPowerPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150"
                      style={{ width: `${vehicle.fanPowerPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Twin Turbines:</span>
                    <span className="text-white">20 kW Electric</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Underbody Vacuum:</span>
                    <span className="text-amber-400 font-bold">{(vehicle.fanDownforceKn * 0.42).toFixed(1)} kPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Normal Downforce:</span>
                    <span className="text-cyan-300 font-bold">{vehicle.fanDownforceKn.toFixed(1)} kN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Surface Grip Limit:</span>
                    <span className="text-white font-bold">2.0G Inverted Capable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[10px] font-mono text-cyan-300">
              💡 Enables upside-down driving on the curved loop ceiling without falling, utilizing active ground-sealing skirts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
