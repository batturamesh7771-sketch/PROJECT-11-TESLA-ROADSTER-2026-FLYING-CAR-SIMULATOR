import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Eye, Sparkles, Compass } from 'lucide-react';
import { GroundVehicleDynamics } from '../../physics/GroundVehicleDynamics';
import { SoundSynthesizer } from '../../audio/SoundSynthesizer';

interface SettingsLabModalProps {
  vehicle: GroundVehicleDynamics;
  onClose: () => void;
}

export const SettingsLabModal: React.FC<SettingsLabModalProps> = ({ vehicle, onClose }) => {
  const synth = SoundSynthesizer.getInstance();
  const [audioEnabled, setAudioEnabled] = useState(synth.enabled);
  const [volume, setVolume] = useState(synth.volume);
  const [unitSystem, setUnitSystem] = useState(vehicle.unitSystem);

  // Visual FX toggles (persisted in vehicle / settings state)
  const [plumesEnabled, setPlumesEnabled] = useState(vehicle.fxPlumesEnabled);
  const [groundShockwaveEnabled, setGroundShockwaveEnabled] = useState(vehicle.fxGroundShockwaveEnabled);
  const [forceVectorsEnabled, setForceVectorsEnabled] = useState(vehicle.fxForceVectorsEnabled);
  const [cameraShakeEnabled, setCameraShakeEnabled] = useState(vehicle.fxCameraShakeEnabled);

  const handleAudioToggle = () => {
    const newState = synth.toggle();
    setAudioEnabled(newState);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    synth.setVolume(v);
  };

  const handleUnitToggle = (unit: 'Metric' | 'Imperial') => {
    setUnitSystem(unit);
    vehicle.unitSystem = unit;
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#050811]/92 backdrop-blur-md flex flex-col p-6 overflow-hidden pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span>SIMULATION, AUDIO, HUD & CONTROLS CONFIGURATION</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                SYSTEM SETTINGS
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Unit System Conversion • WebAudio Real-Time Synth • 3D Particle & Plume FX Configuration
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

      <div className="flex-1 grid grid-cols-3 gap-5 overflow-y-auto pr-1">
        {/* Card 1: Unit System Conversion */}
        <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-300 mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" /> UNIT SYSTEM CONVERSION
            </span>

            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              Switches telemetry readouts and oscilloscope axes between SI Metric and US Customary Imperial.
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <button
                onClick={() => handleUnitToggle('Metric')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  unitSystem === 'Metric'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <div className="text-sm">Metric (SI)</div>
                <div className="text-[10px] text-slate-500 mt-1">km/h, m, kN, bar, °C</div>
              </button>

              <button
                onClick={() => handleUnitToggle('Imperial')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  unitSystem === 'Imperial'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <div className="text-sm">Imperial (US)</div>
                <div className="text-[10px] text-slate-500 mt-1">mph, ft, lbf, psi, °F</div>
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400">
            Active Unit: <span className="text-white font-bold">{unitSystem}</span> (Real-time recalculation)
          </div>
        </div>

        {/* Card 2: Synthesized WebAudio Engine */}
        <div className="bg-[#0b101c] border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" /> PROCEDURAL WEBAUDIO SYNTH
              </span>
              <button
                onClick={handleAudioToggle}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border cursor-pointer transition-all ${
                  audioEnabled
                    ? 'bg-emerald-500 text-slate-950 border-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {audioEnabled ? 'SOUND: ON' : 'SOUND: MUTED'}
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              Zero-asset procedural audio generation synthesizing cold-gas supersonic nozzle roar, 20 kW suction turbine whine, and dual-plaid electric motor hum.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Master Synth Volume:</span>
                  <span className="text-cyan-300 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>🚀 Thruster Roar:</span>
                  <span className="text-white">Active with Thrust kN</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>🌀 Suction Turbine:</span>
                  <span className="text-white">Active with Fan %</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>⚡ Motor Powertrain:</span>
                  <span className="text-white">Active with Speed km/h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 mt-2">
            Dynamic lowpass/bandpass filtering directly driven by 60 FPS physics loop.
          </div>
        </div>

        {/* Card 3: Visual & Plume FX Toggles */}
        <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> VISUAL & PLUME FX TOGGLES
            </span>

            <div className="space-y-2.5 font-mono text-xs">
              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span>10-Nozzle Supersonic Plumes</span>
                <input
                  type="checkbox"
                  checked={plumesEnabled}
                  onChange={(e) => {
                    setPlumesEnabled(e.target.checked);
                    vehicle.fxPlumesEnabled = e.target.checked;
                  }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span>Ground Shockwave Dust Rings</span>
                <input
                  type="checkbox"
                  checked={groundShockwaveEnabled}
                  onChange={(e) => {
                    setGroundShockwaveEnabled(e.target.checked);
                    vehicle.fxGroundShockwaveEnabled = e.target.checked;
                  }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span>3D Force Vector Arrows (HUD)</span>
                <input
                  type="checkbox"
                  checked={forceVectorsEnabled}
                  onChange={(e) => {
                    setForceVectorsEnabled(e.target.checked);
                    vehicle.fxForceVectorsEnabled = e.target.checked;
                  }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span>High-Thrust Camera Vibration</span>
                <input
                  type="checkbox"
                  checked={cameraShakeEnabled}
                  onChange={(e) => {
                    setCameraShakeEnabled(e.target.checked);
                    vehicle.fxCameraShakeEnabled = e.target.checked;
                  }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-800/40 text-[10px] font-mono text-cyan-300">
            Instantaneous effect on WebGL renderer and physics shaders without reloads.
          </div>
        </div>
      </div>
    </div>
  );
};
