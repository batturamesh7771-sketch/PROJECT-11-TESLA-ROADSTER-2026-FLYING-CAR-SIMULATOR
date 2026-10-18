import React, { useState } from 'react';
import {
  Car,
  Activity,
  Gauge,
  Camera,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { GroundVehicleDynamics, TestRunResult } from '../physics/GroundVehicleDynamics';
import { TrackMinimap } from './TrackMinimap';

interface EngineeringWorkstationProps {
  vehicle: GroundVehicleDynamics;
  cameraPreset: 'chase' | 'isometric' | 'cockpit' | 'trackside' | 'top';
  onSelectCamera: (preset: 'chase' | 'isometric' | 'cockpit' | 'trackside' | 'top') => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onResetSimulation: () => void;
}

export const EngineeringWorkstation: React.FC<EngineeringWorkstationProps> = ({
  vehicle,
  cameraPreset,
  onSelectCamera,
  wireframe,
  onToggleWireframe,
  isPaused,
  onTogglePause,
  onResetSimulation,
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'VEHICLE' | 'TRACK_TEST' | 'PROPULSION' | 'AUTONOMY' | 'REPORTS'>('VEHICLE');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    exterior: true,
    chassis: true,
    powertrain: false,
    aero: false,
    provenance: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Convert telemetry history to SVG chart paths
  const chartWidth = 300;
  const chartHeight = 70;
  const history = vehicle.history;

  let speedPath = '';
  let accelPath = '';
  if (history.length > 1) {
    const minTime = history[0].time;
    const maxTime = Math.max(minTime + 1, history[history.length - 1].time);
    const timeSpan = maxTime - minTime;

    speedPath = history
      .map((pt, idx) => {
        const x = ((pt.time - minTime) / timeSpan) * chartWidth;
        const y = chartHeight - (Math.min(130, pt.speedKmh) / 130) * chartHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    accelPath = history
      .map((pt, idx) => {
        const x = ((pt.time - minTime) / timeSpan) * chartWidth;
        // Map -1.6g to +1.6g to [chartHeight, 0]
        const normAccel = (pt.accelG + 1.6) / 3.2;
        const y = chartHeight - Math.max(0, Math.min(1, normAccel)) * chartHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }

  const speedMph = (vehicle.speedKmh * 0.621371).toFixed(1);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-sans select-none text-slate-200">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER NAVIGATION BAR */}
      {/* ------------------------------------------------------------------- */}
      <header className="pointer-events-auto bg-slate-950/95 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            <span className="font-bold tracking-wider text-base text-white">
              ROADSTER <span className="text-cyan-400">DIGITAL TWIN</span>
            </span>
            <span className="text-slate-500 font-mono text-xs">| VIRTUAL TEST LAB</span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
            LEVEL 1-2 GROUND TEST
          </span>
        </div>

        {/* Center Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
          {(['VEHICLE', 'TRACK_TEST', 'PROPULSION', 'AUTONOMY', 'REPORTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNavTab(tab)}
              className={`px-3 py-1.5 rounded transition-all ${
                activeNavTab === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </nav>

        {/* Right Status Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SAFETY GOVERNOR: ARMED</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>T-01 100-0 BRAKING</span>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN WORKSPACE (LEFT PANEL | CENTER VIEWPORT OVERLAYS | RIGHT PANEL) */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: Vehicle State & 1,248-Part CAD Assembly Tree */}
        <aside className="pointer-events-auto w-80 bg-slate-950/90 border-r border-slate-800/80 p-3 flex flex-col gap-3 backdrop-blur overflow-y-auto z-10 custom-scrollbar">
          {/* Vehicle State Overview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Gauge className="w-3.5 h-3.5" /> VEHICLE DYNAMICS
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ESTIMATION: PHYSICS</span>
            </div>

            {/* Big Speedometer */}
            <div className="flex items-baseline justify-between mb-3 bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <div>
                <div className="text-3xl font-extrabold font-mono text-cyan-300 leading-none">
                  {vehicle.speedKmh.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">KM / H ({speedMph} MPH)</div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xl font-bold font-mono ${
                    vehicle.accelG < -0.1
                      ? 'text-red-400'
                      : vehicle.accelG > 0.1
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {vehicle.accelG >= 0 ? '+' : ''}
                  {vehicle.accelG.toFixed(2)} g
                </div>
                <div className="text-[10px] text-slate-400 font-mono">LONGITUDINAL ACCEL</div>
              </div>
            </div>

            {/* Input Gauges */}
            <div className="space-y-2 text-xs font-mono">
              {/* Throttle */}
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-400">THROTTLE:</span>
                  <span className="text-cyan-300">{(vehicle.throttle * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-75"
                    style={{ width: `${vehicle.throttle * 100}%` }}
                  />
                </div>
              </div>

              {/* Friction Brake */}
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-400">FRICTION BRAKE:</span>
                  <span className="text-red-400">{(vehicle.brake * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-75"
                    style={{ width: `${vehicle.brake * 100}%` }}
                  />
                </div>
              </div>

              {/* Steering Angle */}
              <div className="flex justify-between text-[11px] pt-1">
                <span className="text-slate-400">STEERING ANGLE:</span>
                <span className="text-slate-200">
                  {((vehicle.steerAngleRad * 180) / Math.PI).toFixed(1)}°
                </span>
              </div>

              {/* Battery SOC & Gear */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[10px]">GEAR:</span>
                  {(['P', 'R', 'N', 'D'] as const).map((g) => (
                    <span
                      key={g}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        vehicle.gear === g
                          ? 'bg-cyan-500 text-black font-extrabold'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  SOC: {vehicle.batterySocPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Subsystems Health */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs font-mono">
            <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              SUBSYSTEMS INTEGRITY
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center bg-slate-950/60 px-2 py-1 rounded">
                <span className="text-slate-300">Powertrain (Tri-Motor):</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Nominal
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/60 px-2 py-1 rounded">
                <span className="text-slate-300">Braking (Brembo CC):</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ABS Active
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/60 px-2 py-1 rounded">
                <span className="text-slate-300">Aero Actuation:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Wing Deployed
                </span>
              </div>
            </div>
          </div>

          {/* 1,248-Part CAD Assembly Tree */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex-1 flex flex-col min-h-48 text-xs font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                ASSEMBLY TREE <span className="text-cyan-400">(1,248 Parts)</span>
              </span>
              <button
                onClick={onToggleWireframe}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  wireframe
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {wireframe ? 'Solid View' : 'Wireframe'}
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1 text-[11px] pr-1">
              {/* Group 1: Body & Exterior */}
              <div>
                <button
                  onClick={() => toggleSection('exterior')}
                  className="w-full flex items-center justify-between text-left py-1 px-1.5 rounded hover:bg-slate-800 text-slate-200 font-medium"
                >
                  <span className="flex items-center gap-1">
                    {expandedSections.exterior ? (
                      <ChevronDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                    )}
                    Exterior & Monocoque Body
                  </span>
                  <span className="text-[10px] text-slate-400">412</span>
                </button>
                {expandedSections.exterior && (
                  <div className="pl-4 py-0.5 space-y-0.5 text-slate-400 text-[10px]">
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Carbon Undertray & Splitter (38)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Monocoque Passenger Tub (64)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Sloping Front Hood (42)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Curved Glass Canopy (24)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Active Rear Wing Blade (32)</div>
                  </div>
                )}
              </div>

              {/* Group 2: Chassis & Suspension */}
              <div>
                <button
                  onClick={() => toggleSection('chassis')}
                  className="w-full flex items-center justify-between text-left py-1 px-1.5 rounded hover:bg-slate-800 text-slate-200 font-medium"
                >
                  <span className="flex items-center gap-1">
                    {expandedSections.chassis ? (
                      <ChevronDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                    )}
                    Chassis & Running Gear
                  </span>
                  <span className="text-[10px] text-slate-400">328</span>
                </button>
                {expandedSections.chassis && (
                  <div className="pl-4 py-0.5 space-y-0.5 text-slate-400 text-[10px]">
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Front Double Wishbones (84)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ 20"/21" Alloy Wheels (64)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Brembo Carbon Ceramic Discs (48)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ 335/30R21 High-Traction Tires (32)</div>
                  </div>
                )}
              </div>

              {/* Group 3: Powertrain & Battery */}
              <div>
                <button
                  onClick={() => toggleSection('powertrain')}
                  className="w-full flex items-center justify-between text-left py-1 px-1.5 rounded hover:bg-slate-800 text-slate-200 font-medium"
                >
                  <span className="flex items-center gap-1">
                    {expandedSections.powertrain ? (
                      <ChevronDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                    )}
                    Powertrain & 200 kWh Pack
                  </span>
                  <span className="text-[10px] text-slate-400">316</span>
                </button>
                {expandedSections.powertrain && (
                  <div className="pl-4 py-0.5 space-y-0.5 text-slate-400 text-[10px]">
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Structural Battery Pack (160)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Front Reluctance Motor (48)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Dual Rear Induction Motors (82)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Inverter Power Electronics (26)</div>
                  </div>
                )}
              </div>

              {/* Group 4: Aero & Cold Gas Thruster Bezels */}
              <div>
                <button
                  onClick={() => toggleSection('aero')}
                  className="w-full flex items-center justify-between text-left py-1 px-1.5 rounded hover:bg-slate-800 text-slate-200 font-medium"
                >
                  <span className="flex items-center gap-1">
                    {expandedSections.aero ? (
                      <ChevronDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                    )}
                    SpaceX Package Actuators
                  </span>
                  <span className="text-[10px] text-slate-400">192</span>
                </button>
                {expandedSections.aero && (
                  <div className="pl-4 py-0.5 space-y-0.5 text-slate-400 text-[10px]">
                    <div className="hover:text-cyan-300 cursor-pointer">▪ 4x Diffuser Thruster Bezels (48)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Dual COPV Pressure Vessels (64)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Electro-Pneumatic Manifold (40)</div>
                    <div className="hover:text-cyan-300 cursor-pointer">▪ Ground Effect Skirt Flaps (40)</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER VIEWPORT OVERLAYS */}
        <div className="flex-1 relative flex flex-col justify-between p-4 pointer-events-none">
          {/* Top-Right: Camera Presets Toolbar */}
          <div className="pointer-events-auto self-end flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-lg backdrop-blur">
            <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <Camera className="w-3 h-3 text-cyan-400" /> CAMERA:
            </span>
            {(['chase', 'isometric', 'cockpit', 'trackside', 'top'] as const).map((cam) => (
              <button
                key={cam}
                onClick={() => onSelectCamera(cam)}
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
                  cameraPreset === cam
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cam}
              </button>
            ))}
          </div>

          {/* Bottom Overlays: Track Minimap + Driver Keyboard HUD */}
          <div className="flex items-end justify-between w-full">
            {/* Track Minimap */}
            <div className="pointer-events-auto">
              <TrackMinimap vehicleX={vehicle.posX} vehicleZ={vehicle.posZ} vehicleYaw={vehicle.yawRad} />
            </div>

            {/* Keyboard Driving Controls HUD */}
            <div className="pointer-events-auto bg-slate-950/85 border border-slate-800 px-4 py-2 rounded-lg backdrop-blur text-xs font-mono text-slate-300 shadow-xl">
              <div className="text-[10px] text-cyan-400 font-semibold mb-1">PROVING GROUND CONTROLS</div>
              <div className="flex items-center gap-4 text-[11px]">
                <div><span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded mr-1">W / ↑</span> Throttle</div>
                <div><span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded mr-1">S / ↓</span> Brake / Rev</div>
                <div><span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded mr-1">A / D</span> Steer</div>
                <div><span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded mr-1">Space</span> Handbrake</div>
                <div><span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded mr-1">R</span> Reset Line</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Engineering Telemetry & Test Missions */}
        <aside className="pointer-events-auto w-88 bg-slate-950/90 border-l border-slate-800/80 p-3 flex flex-col gap-3 backdrop-blur overflow-y-auto z-10 custom-scrollbar">
          {/* Mission T-01 Test Execution Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> TEST MISSION T-01
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  vehicle.isTestRunning
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : vehicle.testPhase === 'COMPLETED'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {vehicle.testPhase}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-mono mb-2">
              Baseline 100 - 0 km/h Straight-Line Braking. Target: Stopping distance ≤ 43.0m, Peak Decel ≥ 1.10g.
            </p>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => vehicle.startT01BrakingTest()}
                disabled={vehicle.isTestRunning}
                className={`flex-1 py-1.5 px-3 rounded font-mono text-xs font-bold transition-all shadow-md ${
                  vehicle.isTestRunning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {vehicle.isTestRunning ? 'EXECUTING TEST...' : 'START T-01 TEST'}
              </button>
              {vehicle.isTestRunning && (
                <button
                  onClick={() => vehicle.abortTest()}
                  className="py-1.5 px-3 rounded font-mono text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
                >
                  ABORT
                </button>
              )}
            </div>

            {/* Last Test Verdict Banner */}
            {vehicle.lastTestResult && (
              <div
                className={`p-2 rounded border font-mono text-xs ${
                  vehicle.lastTestResult.passed
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/50 border-red-800 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1">
                    {vehicle.lastTestResult.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    {vehicle.lastTestResult.passed ? 'TEST PASSED' : 'TEST FAILED'}
                  </span>
                  <span>{vehicle.lastTestResult.runId}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>Stop Distance: <span className="font-bold">{vehicle.lastTestResult.stoppingDistanceM} m</span></div>
                  <div>Peak Decel: <span className="font-bold">{vehicle.lastTestResult.peakDecelG} g</span></div>
                  <div>Stop Time: <span className="font-bold">{vehicle.lastTestResult.stoppingTimeSec} s</span></div>
                  <div>Target Limit: <span className="font-bold">≤ 43.0 m</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Live Telemetry Time Series Strip Charts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="font-semibold text-cyan-400">TELEMETRY STRIP CHARTS</span>
              <span className="text-[10px] text-slate-500">LIVE SENSOR TRACE</span>
            </div>

            {/* Chart 1: Speed (km/h) */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span>SPEED (km/h)</span>
                <span className="text-cyan-400 font-bold">{vehicle.speedKmh.toFixed(1)} km/h</span>
              </div>
              <div className="relative bg-slate-950 border border-slate-800 rounded overflow-hidden h-[70px]">
                {/* 100 km/h reference guideline */}
                <div
                  className="absolute w-full border-b border-dashed border-red-500/40 text-[8px] font-mono text-red-400 px-1"
                  style={{ top: `${70 - (100 / 130) * 70}px` }}
                >
                  100 km/h ref
                </div>
                <svg width="100%" height="70" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  {speedPath && (
                    <path d={speedPath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                  )}
                </svg>
              </div>
            </div>

            {/* Chart 2: Longitudinal Accel (g) */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span>LONGITUDINAL ACCEL (g)</span>
                <span className={`font-bold ${vehicle.accelG < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {vehicle.accelG.toFixed(2)} g
                </span>
              </div>
              <div className="relative bg-slate-950 border border-slate-800 rounded overflow-hidden h-[70px]">
                {/* 0g Centerline */}
                <div className="absolute w-full top-[35px] border-b border-slate-700/60" />
                <svg width="100%" height="70" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  {accelPath && (
                    <path d={accelPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Test Results Log Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs font-mono">
            <div className="text-[11px] text-slate-300 font-semibold mb-2">VERIFIED TEST RUN HISTORY</div>
            <div className="max-h-28 overflow-y-auto pr-1">
              <table className="w-full text-[10px] text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-1">RUN</th>
                    <th className="pb-1">DIST</th>
                    <th className="pb-1">DECEL</th>
                    <th className="pb-1">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {vehicle.testHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-2 text-center text-slate-600">
                        No test runs recorded yet. Press START T-01.
                      </td>
                    </tr>
                  ) : (
                    vehicle.testHistory.map((run) => (
                      <tr key={run.runId} className="hover:bg-slate-800/40">
                        <td className="py-1 text-cyan-400">{run.runId}</td>
                        <td className="py-1">{run.stoppingDistanceM}m</td>
                        <td className="py-1">{run.peakDecelG}g</td>
                        <td className="py-1">
                          <span
                            className={`px-1 rounded text-[9px] font-bold ${
                              run.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                            }`}
                          >
                            {run.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provenance Ledger Accordion */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs font-mono">
            <button
              onClick={() => toggleSection('provenance')}
              className="w-full flex items-center justify-between text-left text-slate-300 font-semibold"
            >
              <span>PARAMETER PROVENANCE LEDGER</span>
              {expandedSections.provenance ? (
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
            {expandedSections.provenance && (
              <div className="mt-2 space-y-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <div>
                  <span className="px-1 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold mr-1">
                    PUBLICLY_VERIFIED
                  </span>
                  Body Dimensions (4.45m x 1.95m), Wheelbase (2.75m), 20"/21" Centerlock Rims.
                </div>
                <div>
                  <span className="px-1 py-0.5 rounded bg-blue-950 text-blue-400 font-bold mr-1">
                    REPORTED_CLAIM
                  </span>
                  200 kWh battery pack, 10,000 Nm wheel torque, 0-60 mph &lt; 1.9s.
                </div>
                <div>
                  <span className="px-1 py-0.5 rounded bg-amber-950 text-amber-400 font-bold mr-1">
                    ENGINEERING_ESTIMATE
                  </span>
                  1,980 kg curb mass, Cd = 0.28, Brembo 390mm carbon-ceramic brakes.
                </div>
                <div>
                  <span className="px-1 py-0.5 rounded bg-purple-950 text-purple-400 font-bold mr-1">
                    SIMULATION_ASSUMPTION
                  </span>
                  Peak dry asphalt grip coefficient μ = 1.26, ABS refresh rate 200 Hz.
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. BOTTOM SIMULATION CONTROL TIMELINE BAR */}
      {/* ------------------------------------------------------------------- */}
      <footer className="pointer-events-auto bg-slate-950 border-t border-slate-800/90 px-4 py-2 flex items-center justify-between shadow-2xl z-20">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'RESUME SIM' : 'PAUSE SIM'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET VEHICLE</span>
          </button>
        </div>

        {/* Center Sim Clock */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            SIM TIME: <span className="text-cyan-300 font-bold">T + {vehicle.simTimeSec.toFixed(3)}s</span>
          </div>
          <div>
            TIMESTEP: <span className="text-slate-300">dt = 16.6ms (60 Hz)</span>
          </div>
          <div>
            GROUND LEVEL: <span className="text-emerald-400 font-semibold">y = 0.000m (TIRES CONTACT)</span>
          </div>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300">VIRTUAL PROVING GROUND ONLINE</span>
        </div>
      </footer>
    </div>
  );
};
