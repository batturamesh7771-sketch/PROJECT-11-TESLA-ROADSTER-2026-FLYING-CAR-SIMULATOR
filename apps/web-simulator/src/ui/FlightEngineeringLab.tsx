import React, { useState, useEffect } from 'react';
import {
  Car,
  Home,
  CheckSquare,
  Cpu,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Fan,
  Activity,
  Layers,
  Eye,
  Maximize2,
  Radio,
  Search,
} from 'lucide-react';
import { GroundVehicleDynamics } from '../physics/GroundVehicleDynamics';
import { RemoteFlightController } from './RemoteFlightController';
import { TelemetryOscilloscope } from './telemetry/TelemetryOscilloscope';
import { VehicleExplorerModal } from './modals/VehicleExplorerModal';
import { SimulationPhysicsModal } from './modals/SimulationPhysicsModal';
import { TestingMissionModal } from './modals/TestingMissionModal';
import { AutonomyBrainModal } from './modals/AutonomyBrainModal';
import { ReportsSummaryModal } from './modals/ReportsSummaryModal';
import { SettingsLabModal } from './modals/SettingsLabModal';

interface FlightEngineeringLabProps {
  vehicle: GroundVehicleDynamics;
  cameraPreset: 'chase' | 'cockpit' | 'top' | 'free' | 'trafficSide';
  onSelectCamera: (cam: 'chase' | 'cockpit' | 'top' | 'free' | 'trafficSide') => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onSelectFlightStep: (stepIdx: number) => void;
}

export const FlightEngineeringLab: React.FC<FlightEngineeringLabProps> = ({
  vehicle,
  cameraPreset,
  onSelectCamera,
  isPaused,
  onTogglePause,
  onSelectFlightStep,
}) => {
  const [showPanels, setShowPanels] = useState<boolean>(true);
  const [showRemote, setShowRemote] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<string>('Home');
  const [searchComponent, setSearchComponent] = useState<string>('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Flight Systems');

  // Keyboard shortcut: Press H to toggle all panels, Press C to toggle Remote Controller
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'KeyH') {
        setShowPanels((p) => !p);
      } else if (e.code === 'KeyC') {
        setShowRemote((r) => !r);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const flightSequenceCardsTheme1 = [
    { title: '1. Runway Approach', time: 'T + 0.0s', img: '/assets/seq-01-approach.png' },
    { title: '2. 2.0G Wall Suction', time: 'T + 2.5s', img: '/assets/seq-02-takeoff.png' },
    { title: '3. Inverted Ceiling', time: 'T + 4.2s', img: '/assets/seq-04-inverted.png' },
    { title: '4. Lip Drop & 180° Flip', time: 'T + 5.5s', img: '/assets/seq-03-midair.png' },
    { title: '5. 10-Nozzle Landing', time: 'T + 8.0s', img: '/assets/seq-05-landing.png' },
  ];

  const flightSequenceCardsTheme2 = [
    { title: '1. Stuck in Gridlock', time: 'T + 0.0s', img: '/assets/seq-01-approach.png' },
    { title: '2. Vertical Liftoff', time: 'T + 2.0s', img: '/assets/seq-02-takeoff.png' },
    { title: '3. Fly & Flip Over Traffic', time: 'T + 3.8s', img: '/assets/seq-03-midair.png' },
    { title: '4. Gravity Drop & Retro', time: 'T + 6.5s', img: '/assets/seq-04-inverted.png' },
    { title: '5. Highway Touchdown', time: 'T + 8.5s', img: '/assets/seq-05-landing.png' },
  ];

  const flightSequenceCards = vehicle.activeTheme === 'THEME_2_TRAFFIC'
    ? flightSequenceCardsTheme2
    : flightSequenceCardsTheme1;

  // 10 Detailed Component Subsystems with Live Telemetry Bindings
  const obstacleDistM = vehicle.activeTheme === 'THEME_2_TRAFFIC'
    ? Math.max(0, -20.0 - vehicle.posX).toFixed(1)
    : Math.max(0, -30.0 - vehicle.posX).toFixed(1);

  const componentCategories = [
    {
      name: 'Flight Systems',
      count: 46,
      items: [
        { name: 'COPV Tank A Pressure', val: `${Math.round(vehicle.copvPressurePsi).toLocaleString()} psi` },
        { name: 'COPV Tank B Pressure', val: `${Math.round(vehicle.copvPressurePsi * 0.998).toLocaleString()} psi` },
        { name: 'Electric Nozzle Actuators', val: `${(8.4 + Math.sin(vehicle.simTimeSec * 10) * 1.2).toFixed(1)} ms response` },
        { name: 'Cold-Gas Manifold Temp', val: `${(vehicle.totalThrustKn > 0.5 ? -42.5 : -14.2).toFixed(1)} °C` },
        { name: 'PID Attitude Gyro Error', val: `${Math.abs(vehicle.pitchRad * 0.4).toFixed(2)}°` },
      ],
    },
    {
      name: 'Aerodynamics',
      count: 74,
      items: [
        { name: '20kW Twin Suction Fans', val: `${Math.round(vehicle.fanPowerPercent * 180)} RPM (${vehicle.fanDownforceKn.toFixed(1)} kN)` },
        { name: 'Active Ground Skirt', val: vehicle.isLizardSuctionActive ? '12 mm (Sealed 2.0G)' : '48 mm (Retracted)' },
        { name: 'Active Spoiler Wing', val: `${vehicle.posY > 1.2 || vehicle.speedKmh > 110 ? 22 : 4}° Pitch Tilt` },
        { name: 'Underbody Venturi Ducts', val: `${(vehicle.speedKmh * 0.08).toFixed(1)} kPa Vacuum` },
      ],
    },
    {
      name: 'Propulsion System',
      count: 86,
      items: [
        { name: 'Front Induction Motor', val: `${Math.round(vehicle.speedKmh * 58)} RPM | ${(vehicle.throttle * 280).toFixed(0)} kW` },
        { name: 'Rear Plaid Dual Motors', val: `${Math.round(vehicle.speedKmh * 62)} RPM | ${(vehicle.throttle * 560).toFixed(0)} kW` },
        { name: 'SiC Inverter Load', val: `${Math.round(vehicle.throttle * 90 + 10)}%` },
        { name: 'Carbon-Sleeve Rotor Temp', val: `${(vehicle.systemTempC + 12).toFixed(1)} °C` },
      ],
    },
    {
      name: 'Suspension & Brakes',
      count: 96,
      items: [
        { name: 'FL / FR Damper Height', val: `${(110 + (vehicle.posY <= 0.05 ? Math.sin(vehicle.simTimeSec * 8) * 4 : -40)).toFixed(1)} mm` },
        { name: 'RL / RR Damper Height', val: `${(115 + (vehicle.posY <= 0.05 ? Math.cos(vehicle.simTimeSec * 8) * 4 : -45)).toFixed(1)} mm` },
        { name: 'Carbon-Ceramic Discs', val: `${(vehicle.brake > 0 ? 320 : 85).toFixed(0)} °C` },
        { name: 'Magnetic Ride Dampers', val: vehicle.posY > 0.5 ? 'Flight Droop Active' : 'Stiff Track Mode' },
      ],
    },
    {
      name: 'Battery & Power',
      count: 102,
      items: [
        { name: '850V Pack Terminal', val: `${(830 + vehicle.batteryPercent * 0.25).toFixed(0)} V` },
        { name: 'Discharge Current', val: `${(vehicle.throttle * 680 + (vehicle.fanPowerPercent / 100) * 120 + 15).toFixed(0)} A` },
        { name: 'Battery State of Charge', val: `${vehicle.batteryPercent.toFixed(1)} %` },
        { name: 'Pack Cell Core Temp', val: `${(vehicle.systemTempC - 2.0).toFixed(1)} °C` },
      ],
    },
    {
      name: 'Thermal Management',
      count: 68,
      items: [
        { name: 'Octovalve Heat Pump', val: vehicle.systemTempC > 40 ? 'Full Chilling Loop' : 'Optimized Flow' },
        { name: 'Coolant Flow Rate', val: `${(12.5 + vehicle.throttle * 15.0).toFixed(1)} L/min` },
        { name: 'Radiator Ram Air Shutter', val: vehicle.speedKmh > 80 ? '100% Open' : 'Fan Assisted' },
      ],
    },
    {
      name: 'Sensors & ADAS',
      count: 112,
      items: [
        { name: 'Solid-State LiDAR Range', val: `${obstacleDistM} m Clearance` },
        { name: 'IMU Tri-Axial Gyro', val: `${vehicle.yawRateRadS.toFixed(2)} rad/s` },
        { name: 'Wheel Speed Encoders', val: `${Math.round(vehicle.speedKmh * 8.2)} Pulses/sec` },
      ],
    },
    {
      name: 'Chassis & Body',
      count: 124,
      items: [
        { name: 'Torsional Rigidity', val: '68,000 N•m/deg' },
        { name: 'Carbon Monocoque Strain', val: `${(120 + vehicle.accelG * 85).toFixed(0)} µε` },
        { name: 'Electrochromic Canopy', val: '92% Solar Rejection' },
      ],
    },
    {
      name: 'Interior & Cabin',
      count: 54,
      items: [
        { name: 'Cabin Pressure', val: '1.013 bar (Hermetic)' },
        { name: 'Steer-by-Wire Yoke', val: `${((vehicle.steerAngleRad * 180) / Math.PI).toFixed(1)}°` },
        { name: 'Climate Setpoint', val: '21.5 °C Auto' },
      ],
    },
    {
      name: 'Miscellaneous',
      count: 486,
      items: [
        { name: 'Telemetry Bus Bandwidth', val: '1.2 Gbps (60 Hz)' },
        { name: '12V Aux Lithium Battery', val: '13.8 V' },
        { name: 'Neural FSD Latency', val: '2.8 ms' },
      ],
    },
  ];

  const filteredCategories = componentCategories.filter((cat) => {
    if (!searchComponent.trim()) return true;
    const q = searchComponent.toLowerCase();
    if (cat.name.toLowerCase().includes(q)) return true;
    return cat.items.some((i) => i.name.toLowerCase().includes(q));
  });

  // Cycle Simulation Environment Weather
  const cycleEnvironmentWeather = () => {
    const presets: Array<'Clear' | 'Crosswind Gusts' | 'Rain / Wet Track' | 'Night Dusk'> = [
      'Clear',
      'Crosswind Gusts',
      'Rain / Wet Track',
      'Night Dusk',
    ];
    const currIdx = presets.indexOf(vehicle.weather);
    const nextPreset = presets[(currIdx + 1) % presets.length];
    vehicle.setWeatherPreset(nextPreset);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-sans select-none text-slate-200 text-xs">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER NAVIGATION */}
      {/* ------------------------------------------------------------------- */}
      {showPanels && (
        <header className="pointer-events-auto bg-[#070b13]/95 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between shadow-xl z-20">
          <div className="flex items-center gap-3">
            {/* Tesla Logo Glyph */}
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 100 100">
                <path d="M50 20 L50 90 M20 25 Q50 35 80 25 M32 30 Q50 38 68 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
              </svg>
              <div>
                <div className="font-extrabold tracking-widest text-sm text-white leading-none">
                  TESLA ROADSTER
                </div>
                <div className="text-[9px] font-mono text-cyan-400 font-semibold tracking-wider">
                  FLYING CAR — VIRTUAL ENGINEERING LAB
                </div>
              </div>
            </div>
          </div>

          {/* Center Tabs: Home, Vehicle, Simulation, Testing, AI Autonomy, Reports, Settings */}
          <nav className="flex items-center gap-1 text-[11px]">
            {[
              { id: 'Home', icon: Home },
              { id: 'Vehicle', icon: Car },
              { id: 'Simulation', icon: Layers },
              { id: 'Testing', icon: CheckSquare },
              { id: 'AI Autonomy', icon: Cpu },
              { id: 'Reports', icon: FileText },
              { id: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.id}</span>
                </button>
              );
            })}
          </nav>

          {/* Center-Right: THEME SWITCHER BUTTONS */}
          <div className="flex items-center gap-1.5 bg-[#0b101c] border border-cyan-800/60 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => vehicle.setTheme('THEME_1_RAMP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] font-black transition-all cursor-pointer ${
                vehicle.activeTheme === 'THEME_1_RAMP'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)] border border-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Switch to Theme 1: McGregor Half Circle Flight & Inverted Ramp Loop"
            >
              <span>🏁 THEME 1: RAMP & LOOP</span>
            </button>

            <button
              onClick={() => vehicle.setTheme('THEME_2_TRAFFIC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] font-black transition-all cursor-pointer ${
                vehicle.activeTheme === 'THEME_2_TRAFFIC'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.8)] border border-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Switch to Theme 2: Test Mission 09 - Heavy City Traffic Escape & Fleet Flight"
            >
              <span>🌆 THEME 2: TRAFFIC ESCAPE</span>
            </button>
          </div>

          {/* Right Status & Toggle Button */}
          <div className="flex items-center gap-2.5 text-[11px] font-mono">
            {/* Driver Remote Controller Button */}
            <button
              onClick={() => setShowRemote((r) => !r)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] font-bold shadow-md transition-all cursor-pointer ${
                showRemote
                  ? 'bg-cyan-500 text-slate-950 border border-white shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900 hover:bg-slate-800 border border-cyan-700/60 text-cyan-300'
              }`}
              title="Toggle Driver Flight Remote Controller (Shortcut: Key C)"
            >
              <Radio className="w-3.5 h-3.5 text-current animate-pulse" />
              <span>REMOTE CONTROLLER</span>
            </button>

            <button
              onClick={() => setShowPanels(false)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-mono text-[10px] font-bold shadow-md hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              title="Hide all panels to only display 3D car testing (Shortcut: Key H)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>HIDE ALL PANELS</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simulation 60 FPS</span>
            </div>
          </div>
        </header>
      )}

      {/* Floating Restore & Remote Buttons when in Pure 3D Testing Mode */}
      {!showPanels && (
        <div className="pointer-events-auto absolute top-3 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => vehicle.setTheme(vehicle.activeTheme === 'THEME_1_RAMP' ? 'THEME_2_TRAFFIC' : 'THEME_1_RAMP')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070b13]/95 hover:bg-slate-900 border border-amber-500/70 text-amber-300 font-mono text-xs font-bold shadow-2xl backdrop-blur transition-all hover:scale-105 cursor-pointer"
          >
            <span>{vehicle.activeTheme === 'THEME_1_RAMP' ? '🌆 THEME 2 (TRAFFIC)' : '🏁 THEME 1 (RAMP)'}</span>
          </button>

          <button
            onClick={() => setShowRemote((r) => !r)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold shadow-2xl backdrop-blur transition-all hover:scale-105 cursor-pointer ${
              showRemote
                ? 'bg-cyan-500 text-slate-950 border border-white shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'bg-[#070b13]/95 hover:bg-slate-900 border border-cyan-500/70 text-cyan-300'
            }`}
          >
            <Radio className="w-4 h-4 text-current animate-pulse" />
            <span>REMOTE (C)</span>
          </button>

          <button
            onClick={() => setShowPanels(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#070b13]/95 hover:bg-slate-900 border border-cyan-500/70 text-cyan-300 font-mono text-xs font-bold shadow-2xl backdrop-blur transition-all hover:scale-105 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>SHOW PANELS (H)</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: VEHICLE STATUS, CONFIGURATION & COMPONENTS */}
        {showPanels && (
          <aside className="pointer-events-auto w-[285px] bg-[#070b13]/90 border-r border-slate-800/80 p-2.5 flex flex-col gap-2.5 backdrop-blur overflow-y-auto z-10 custom-scrollbar">
            {/* VEHICLE STATUS CARD */}
            <div className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-cyan-400" /> VEHICLE STATUS
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                    vehicle.controlMode === 'AUTONOMOUS'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {vehicle.controlMode}
                </span>
              </div>

              {/* Vehicle Preview Card Image */}
              <div className="relative rounded overflow-hidden mb-2 border border-slate-800 bg-slate-950 h-24 flex items-center justify-center">
                <img
                  src="/assets/roadster-flight-card.png"
                  alt="Tesla Roadster Flight Variant"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="text-[11px] font-bold text-white mb-0.5">
                Tesla Roadster 2026 ({vehicle.trimVariant} Trim)
              </div>
              <div className="text-[10px] text-cyan-400 font-mono mb-2">
                Mode: {vehicle.flightMode}
              </div>

              {/* Live Status Table */}
              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Speed</span>
                  <span className={`font-bold transition-colors ${vehicle.speedKmh > 150 ? 'text-orange-400' : 'text-white'}`}>
                    {vehicle.speedKmh.toFixed(0)} km/h
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Altitude</span>
                  <span className="text-cyan-300 font-bold">{vehicle.posY.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Thrust (Total)</span>
                  <span className="text-white font-bold">{vehicle.totalThrustKn.toFixed(1)} kN</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Battery</span>
                  <span className="text-emerald-400 font-bold">{vehicle.batteryPercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Gas Pressure</span>
                  <span className="text-white font-bold">{Math.round(vehicle.copvPressurePsi).toLocaleString()} psi</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Lizard Suction</span>
                  <span className={vehicle.isLizardSuctionActive ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {vehicle.fanPowerPercent.toFixed(0)}% ({vehicle.fanDownforceKn.toFixed(1)} kN)
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Yaw / Pitch / Roll</span>
                  <span className="text-slate-200">
                    {((vehicle.yawRad * 180) / Math.PI).toFixed(1)}° / {((vehicle.pitchRad * 180) / Math.PI).toFixed(1)}° / {((vehicle.rollRad * 180) / Math.PI).toFixed(1)}°
                  </span>
                </div>
              </div>
            </div>

            {/* VEHICLE CONFIGURATION SELECTOR */}
            <div className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2.5">
              <div className="text-[10px] font-mono text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span>VEHICLE CONFIGURATION</span>
                <span className="text-[9px] text-cyan-400">3 TRIMS</span>
              </div>

              <select
                value={vehicle.trimVariant}
                onChange={(e) => vehicle.setTrimVariant(e.target.value as any)}
                className="w-full bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer mb-2"
              >
                <option value="Rocket">Rocket (Air Ready — Invite Only)</option>
                <option value="Thrust">Thrust (Race Ready — Limited)</option>
                <option value="Performance">Performance (Street Legal)</option>
              </select>

              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Seats</span>
                  <span className="text-white">{vehicle.trimVariant === 'Rocket' ? '1' : '2'}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Thrusters</span>
                  <span className="text-white">
                    {vehicle.trimVariant === 'Rocket' ? '10 (Perimeter + Rear)' : vehicle.trimVariant === 'Thrust' ? '4 (Rear Boost)' : '0 (Active Aero)'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Gas Capacity</span>
                  <span className="text-white">
                    {vehicle.trimVariant === 'Rocket' ? '600 L (7,500 psi)' : vehicle.trimVariant === 'Thrust' ? '300 L (5,000 psi)' : '0 L (N/A)'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-400">0-60 mph</span>
                  <span className="text-white font-bold text-cyan-300">
                    {vehicle.trimVariant === 'Rocket' ? '0.59 s' : vehicle.trimVariant === 'Thrust' ? '0.81 s' : '1.55 s'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Top Speed</span>
                  <span className="text-white font-bold">
                    {vehicle.trimVariant === 'Rocket' ? '> 230 mph' : vehicle.trimVariant === 'Thrust' ? '225 mph' : '215 mph'}
                  </span>
                </div>
              </div>
            </div>

            {/* COMPONENTS (1,248) SEARCH & LIVE ACCORDION */}
            <div className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2.5 flex-1 flex flex-col min-h-48">
              <div className="text-[10px] font-mono text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span>COMPONENTS</span>
                <span className="text-cyan-400">(1,248)</span>
              </div>

              {/* Search Input */}
              <div className="relative mb-2">
                <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchComponent}
                  onChange={(e) => setSearchComponent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-[10px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Accordion Categories */}
              <div className="space-y-1 overflow-y-auto flex-1 pr-1 text-[10px] font-mono custom-scrollbar">
                {filteredCategories.map((cat) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div key={cat.name} className="border border-slate-800/80 rounded overflow-hidden">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                        className="w-full flex items-center justify-between py-1 px-1.5 bg-slate-950/70 hover:bg-slate-800/50 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          )}
                          <span className="font-bold">{cat.name}</span>
                        </span>
                        <span className="text-slate-500">{cat.count}</span>
                      </button>

                      {isExpanded && (
                        <div className="p-1.5 bg-slate-950/90 border-t border-slate-900 space-y-1">
                          {cat.items.map((item) => (
                            <div key={item.name} className="flex justify-between py-0.5 text-[9px] border-b border-slate-900/60">
                              <span className="text-slate-400">{item.name}</span>
                              <span className="text-cyan-300 font-bold">{item.val}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* CENTER VIEWPORT & MISSION CONTROL OVERLAYS */}
        <div className="flex-1 relative flex flex-col justify-between p-3 pointer-events-none">
          {/* Top Overlays: Mission Banner + Minimap */}
          <div className="flex items-start justify-between w-full">
            {/* Mission Banner */}
            <div className="pointer-events-auto flex items-center gap-2 bg-[#070b13]/85 border border-slate-800/90 px-3 py-1.5 rounded-lg backdrop-blur shadow-xl">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {vehicle.activeTheme === 'THEME_2_TRAFFIC'
                  ? 'TEST MISSION 09 — HEAVY CITY TRAFFIC ESCAPE & FLEET FLIGHT'
                  : 'TEST MISSION 08 — HALF CIRCLE FLIGHT & INVERTED DRIVE'}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                RUNNING
              </span>
              {vehicle.trafficBlockadeDetected && vehicle.activeTheme === 'THEME_2_TRAFFIC' && (
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-600 animate-pulse flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                  <span>⚠️ TRAFFIC BLOCKADE DETECTED</span>
                </span>
              )}
            </div>

            {/* Track Minimap Wireframe */}
            <div className="pointer-events-auto bg-[#070b13]/85 border border-slate-800/90 p-2 rounded-lg backdrop-blur flex items-center gap-3">
              {vehicle.activeTheme === 'THEME_2_TRAFFIC' ? (
                <svg className="w-12 h-10 text-amber-400" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M5 20 L95 20 M5 40 L95 40 M5 60 L95 60" strokeDasharray="6,4" stroke="#64748b" strokeWidth="2" />
                  <rect x="35" y="15" width="30" height="50" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="2" rx="4" />
                  <circle cx={Math.max(10, Math.min(90, 50 + (vehicle.posX / 80) * 40))} cy="40" r="5" fill="#38bdf8" />
                </svg>
              ) : (
                <svg className="w-12 h-10 text-cyan-400" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M10 70 L40 70 Q70 70 80 40 Q85 10 50 10 Q20 10 20 40 Q20 70 50 70 L90 70" strokeLinecap="round" />
                  <circle cx="50" cy="10" r="5" fill="#38bdf8" />
                </svg>
              )}
              <div className="font-mono text-[10px]">
                <div className="text-slate-400">Altitude: <span className="text-cyan-300 font-bold">{vehicle.posY.toFixed(1)} m</span></div>
                <div className="text-slate-400">Speed: <span className="text-white font-bold">{vehicle.speedKmh.toFixed(0)} km/h</span></div>
              </div>
            </div>
          </div>

          {/* Center-Right Camera Presets + Real Time FPS */}
          <div className="pointer-events-auto self-end flex flex-col items-end gap-1.5">
            <div className="bg-[#070b13]/85 border border-slate-800/90 p-1.5 rounded-lg backdrop-blur flex flex-col gap-1 w-28">
              <span className="text-[9px] font-mono text-slate-400 px-1 font-bold">CAMERA</span>
              {(['chase', 'cockpit', 'top', 'trafficSide', 'free'] as const).map((cam) => (
                <button
                  key={cam}
                  onClick={() => onSelectCamera(cam)}
                  className={`w-full py-1 px-2 rounded text-[10px] font-mono capitalize transition-all cursor-pointer ${
                    cameraPreset === cam
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {cam === 'trafficSide' ? 'Traffic Cam' : cam === 'top' ? 'Top View' : cam}
                </button>
              ))}
            </div>

            <div className="bg-[#070b13]/80 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>REAL TIME 60 FPS</span>
            </div>
          </div>

          {/* Bottom Controls Bar: Speedometer + Live Interactive Gaming Drive & Flight Controls */}
          <div className="pointer-events-auto flex items-end justify-between w-full mb-2">
            {/* Speedometer Dial */}
            <div className="bg-[#070b13]/90 border border-slate-800/90 p-3 rounded-2xl backdrop-blur flex items-center gap-4 shadow-2xl">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#00e5ff"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (Math.min(300, vehicle.speedKmh) / 300) * 200}
                    strokeLinecap="round"
                    fill="none"
                    className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-white leading-none">
                    {vehicle.speedKmh.toFixed(0)}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">km/h</span>
                </div>
              </div>

              {/* Side Metric Readouts */}
              <div className="font-mono text-xs space-y-1">
                <div className="text-slate-400">
                  THRUST: <span className="text-white font-bold">{vehicle.totalThrustKn.toFixed(1)} kN</span>
                </div>
                <div className="text-slate-400">
                  G-FORCE: <span className="text-white font-bold">{vehicle.accelG.toFixed(1)} g</span>
                </div>
                <div className="text-slate-400">
                  ALTITUDE: <span className="text-cyan-300 font-bold">{vehicle.posY.toFixed(1)} m</span>
                </div>
              </div>
            </div>

            {/* LIVE INTERACTIVE FLIGHT & DRIVE TESTING CONTROLS */}
            <div className="bg-[#070b13]/95 border border-cyan-500/40 p-2.5 rounded-xl backdrop-blur flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              {/* Steer Left */}
              <button
                onMouseDown={() => { vehicle.targetSteerAngleRad = 0.42; }}
                onMouseUp={() => { vehicle.targetSteerAngleRad = 0; }}
                className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono font-bold text-[11px] active:bg-cyan-600 active:text-black transition-colors cursor-pointer"
                title="Steer Left (A / Left Arrow)"
              >
                ◀ STEER L
              </button>

              {/* Gas / Accelerate */}
              <button
                onMouseDown={() => { vehicle.throttle = 1.0; vehicle.brake = 0.0; vehicle.gear = 'D'; }}
                onMouseUp={() => { vehicle.throttle = 0.0; }}
                className="px-3 py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-mono font-bold text-[11px] active:bg-emerald-500 active:text-black transition-colors cursor-pointer"
                title="Accelerate (W / Up Arrow)"
              >
                ▲ GAS / DRIVE
              </button>

              {/* Brake / Reverse */}
              <button
                onMouseDown={() => { vehicle.brake = 1.0; vehicle.throttle = 0.0; }}
                onMouseUp={() => { vehicle.brake = 0.0; }}
                className="px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-mono font-bold text-[11px] active:bg-red-500 active:text-black transition-colors cursor-pointer"
                title="Brake (S / Down Arrow)"
              >
                ▼ BRAKE
              </button>

              {/* Steer Right */}
              <button
                onMouseDown={() => { vehicle.targetSteerAngleRad = -0.42; }}
                onMouseUp={() => { vehicle.targetSteerAngleRad = 0; }}
                className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono font-bold text-[11px] active:bg-cyan-600 active:text-black transition-colors cursor-pointer"
                title="Steer Right (D / Right Arrow)"
              >
                STEER R ▶
              </button>

              {/* Continuous Cold-Gas Rocket Boost (Space) */}
              <button
                onMouseDown={() => { vehicle.isBoosting = true; }}
                onMouseUp={() => { if (!vehicle.isHoverActive) vehicle.isBoosting = false; }}
                onClick={() => vehicle.triggerRocketBoost(3500)}
                className={`px-3 py-1.5 rounded font-mono font-extrabold text-[11px] border transition-all cursor-pointer ${
                  vehicle.isBoosting
                    ? 'bg-cyan-400 text-slate-950 border-white shadow-[0_0_15px_rgba(6,182,212,1)] scale-105'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400 shadow-md'
                }`}
                title="Fire Continuous Cold-Gas Thrusters (Hold Spacebar or Click)"
              >
                🚀 BOOST (78 kN)
              </button>

              {/* Active Hover & Dynamic PID Altitude Balance (Key V or H) */}
              <button
                onClick={() => vehicle.toggleHoverMode()}
                className={`px-3 py-1.5 rounded font-mono font-bold text-[11px] border transition-all cursor-pointer ${
                  vehicle.isHoverActive
                    ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_15px_rgba(16,185,129,0.9)] scale-105 animate-pulse'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600 text-emerald-300'
                }`}
                title="Toggle Active Hover & PID Balance - Counters Gravity F=mg (Shortcut: Key V or H)"
              >
                🛸 {vehicle.isHoverActive ? `HOVERING (${vehicle.targetHoverAltitudeM.toFixed(0)}m)` : 'HOVER & BALANCE (V)'}
              </button>

              {/* Smooth Landing Sequence (Key L) */}
              <button
                onClick={() => vehicle.initiateSmoothLanding()}
                className={`px-2.5 py-1.5 rounded font-mono font-bold text-[11px] border transition-all cursor-pointer ${
                  vehicle.isLandingActive
                    ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-pulse'
                    : 'bg-amber-950/80 hover:bg-amber-900 border-amber-700 text-amber-300'
                }`}
                title="Gradual Thruster Taper to Cushion Touchdown (Key L)"
              >
                🛬 LANDING (L)
              </button>

              {/* Mid-Air 3D Flip (F) */}
              <button
                onClick={() => vehicle.triggerFlipManeuver()}
                className={`px-2.5 py-1.5 rounded font-mono font-bold text-[11px] border transition-all cursor-pointer ${
                  vehicle.flipPhase !== 'IDLE'
                    ? 'bg-purple-600 text-white border-white shadow-[0_0_15px_rgba(168,85,247,0.9)] animate-pulse'
                    : 'bg-purple-950/80 hover:bg-purple-900 border-purple-700 text-purple-300'
                }`}
                title="Execute 4-Phase Finite 360° Ballistic Flip (Key F)"
              >
                🔄 {vehicle.flipPhase !== 'IDLE' ? `FLIP: ${vehicle.flipPhase}` : '3D FLIP (F)'}
              </button>

              {/* Auto Loop / Auto Escape Flight Test */}
              <button
                onClick={() => vehicle.startAutoLoopFlight()}
                className="px-2.5 py-1.5 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-300 font-mono font-bold text-[11px] active:bg-blue-500 active:text-black transition-colors cursor-pointer"
                title={vehicle.activeTheme === 'THEME_2_TRAFFIC' ? 'Autonomous Mission 09 Sequence' : 'Autonomous Mission 08 Sequence'}
              >
                {vehicle.activeTheme === 'THEME_2_TRAFFIC' ? '⚡ AUTO ESCAPE' : '⚡ AUTO LOOP'}
              </button>

              {/* Driver Remote Controller Button */}
              <button
                onClick={() => setShowRemote((r) => !r)}
                className={`px-2.5 py-1.5 rounded font-mono font-bold text-[10px] border transition-all cursor-pointer ${
                  showRemote
                    ? 'bg-cyan-500 text-slate-950 border-white shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : 'bg-slate-900 hover:bg-slate-800 border-cyan-700 text-cyan-300'
                }`}
                title="Toggle Driver Flight Remote Controller (Key C)"
              >
                🎮 REMOTE (C)
              </button>

              {/* Reset to Start (R) */}
              <button
                onClick={() => vehicle.resetToGround()}
                className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-mono text-[10px] transition-colors cursor-pointer"
                title="Reset Car to Start of Runway (Key R)"
              >
                ↺ RESET
              </button>
            </div>
          </div>

          {/* BOTTOM CENTER: TEST MISSION CONTROL, FLIGHT SEQUENCE & AI AUTONOMY LOG */}
          {showPanels && (
            <div className="pointer-events-auto grid grid-cols-12 gap-2 bg-[#070b13]/95 border border-slate-800/90 p-2.5 rounded-lg backdrop-blur shadow-2xl">
              {/* Col 1: TEST MISSION CONTROL */}
              <div className="col-span-3 border-r border-slate-800/80 pr-2">
                <div className="text-[10px] font-mono text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>TEST MISSION CONTROL</span>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">
                    {vehicle.activeTheme === 'THEME_2_TRAFFIC' ? 'M-09' : 'M-08'}
                  </span>
                </div>
                {vehicle.activeTheme === 'THEME_2_TRAFFIC' ? (
                  <div className="space-y-1 text-[10px] font-mono">
                    <button
                      onClick={() => onSelectFlightStep(0)}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>1. Stuck in Gridlock</span>
                      <span className={vehicle.flightSequenceIndex === 0 ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {vehicle.flightSequenceIndex === 0 ? 'Active' : 'Ready'}
                      </span>
                    </button>
                    <button
                      onClick={() => onSelectFlightStep(1)}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>2. Vertical Liftoff (10.5m)</span>
                      <span className={vehicle.flightSequenceIndex === 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {vehicle.flightSequenceIndex === 1 ? 'Active' : 'Ready'}
                      </span>
                    </button>
                    <button
                      onClick={() => onSelectFlightStep(2)}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>3. 360° Flip Over Jam</span>
                      <span className={vehicle.flightSequenceIndex === 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {vehicle.flightSequenceIndex === 2 ? 'Active' : 'Ready'}
                      </span>
                    </button>
                    <button
                      onClick={() => onSelectFlightStep(3)}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>4. Gravity Drop & Retro</span>
                      <span className={vehicle.flightSequenceIndex === 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {vehicle.flightSequenceIndex === 3 ? 'Active' : 'Ready'}
                      </span>
                    </button>
                    <button
                      onClick={() => onSelectFlightStep(4)}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>5. Highway Touchdown</span>
                      <span className={vehicle.flightSequenceIndex === 4 ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {vehicle.flightSequenceIndex === 4 ? 'Active' : 'Ready'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-[10px] font-mono">
                    <button
                      onClick={() => vehicle.launchMissionTest('M-01')}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>1. Acceleration Test</span>
                      <span className="text-emerald-400">Launch</span>
                    </button>
                    <button
                      onClick={() => vehicle.launchMissionTest('M-02')}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>2. High Speed Run</span>
                      <span className="text-emerald-400">Launch</span>
                    </button>
                    <button
                      onClick={() => vehicle.launchMissionTest('M-03')}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>3. Slalom Course</span>
                      <span className="text-emerald-400">Launch</span>
                    </button>
                    <button
                      onClick={() => vehicle.launchMissionTest('M-04')}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>4. Half Circle Flight</span>
                      <span className="text-cyan-400">Launch</span>
                    </button>
                    <button
                      onClick={() => vehicle.launchMissionTest('M-05')}
                      className="w-full text-left flex items-center justify-between text-slate-300 hover:text-white py-0.5 px-1 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>5. Inverted Drive</span>
                      <span className="text-cyan-400">Launch</span>
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => vehicle.resetToGround()}
                    className="flex-1 py-1 px-2 rounded font-mono text-[10px] font-bold bg-red-700/80 hover:bg-red-600 text-white cursor-pointer"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={onTogglePause}
                    className="flex-1 py-1 px-2 rounded font-mono text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    {isPaused ? 'RESUME' : 'PAUSE'}
                  </button>
                </div>
              </div>

              {/* Col 2: FLIGHT SEQUENCE (5 Storyboard Cards) */}
              <div className="col-span-6 px-1">
                <div className="text-[10px] font-mono text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>FLIGHT SEQUENCE ({vehicle.activeTheme === 'THEME_2_TRAFFIC' ? 'Mission 09 — Traffic Escape' : 'Mission 08 — Ramp Loop'})</span>
                  <span className="text-cyan-400 text-[9px]">CLICK ANY CARD TO JUMP</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {flightSequenceCards.map((card, idx) => {
                    const isActive = vehicle.flightSequenceIndex === idx;
                    return (
                      <div
                        key={card.title}
                        onClick={() => onSelectFlightStep(idx)}
                        className={`cursor-pointer rounded overflow-hidden border transition-all ${
                          isActive
                            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                            : 'border-slate-800 bg-slate-950/60 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="h-12 overflow-hidden bg-slate-900">
                          <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-1 text-[9px] font-mono">
                          <div className="font-bold text-white truncate">{card.title}</div>
                          <div className="text-cyan-400">{card.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Col 3: AI AUTONOMY LOG */}
              <div className="col-span-3 border-l border-slate-800/80 pl-2 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span>AI AUTONOMY LOG</span>
                    <span className="text-[8px] text-emerald-400">LIVE 60Hz</span>
                  </div>
                  <div className="space-y-0.5 text-[9px] font-mono overflow-y-auto max-h-20 pr-1 custom-scrollbar">
                    {vehicle.autonomyLogs.slice(-6).map((log) => {
                      let color = 'text-slate-400';
                      if (log.type === 'thrust') color = 'text-cyan-400 font-bold';
                      else if (log.type === 'flip') color = 'text-amber-300 font-bold';
                      else if (log.type === 'suction') color = 'text-orange-400';
                      else if (log.type === 'success') color = 'text-emerald-400 font-bold';
                      return (
                        <div key={log.id} className="truncate">
                          <span className="text-slate-500 mr-1">{log.timestamp}</span>
                          <span className={color}>{log.message}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[8px] font-mono text-slate-500">
                  Full Neural Log available in [AI Autonomy] tab
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: LIVE TELEMETRY OSCILLOSCOPE, THRUSTER STATUS, SUCTION, COPV, ENVIRONMENT */}
        {showPanels && (
          <aside className="pointer-events-auto w-[295px] bg-[#070b13]/90 border-l border-slate-800/80 p-2.5 flex flex-col gap-2.5 backdrop-blur overflow-y-auto z-10 custom-scrollbar">
            {/* LIVE TELEMETRY REAL-TIME OSCILLOSCOPE (60 FPS Canvas) */}
            <TelemetryOscilloscope
              currentPoint={{
                time: vehicle.simTimeSec,
                speedKmh: vehicle.speedKmh,
                altitudeM: vehicle.posY,
                totalThrustKn: vehicle.totalThrustKn,
                gForce: vehicle.accelG,
                systemTempC: vehicle.systemTempC,
              }}
              historyBuffer={vehicle.history}
            />

            {/* THRUSTER STATUS (Dynamic 10-Thruster Vectoring Output) */}
            <div className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="text-slate-300 font-bold">THRUSTER STATUS</span>
                <span
                  className={`font-bold flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                    vehicle.activeNozzleCount === 10
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : vehicle.activeNozzleCount > 0
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      vehicle.activeNozzleCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  {vehicle.activeNozzleCount}/10 Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Front Left</span>
                    <span className="text-cyan-400 font-bold">{vehicle.nozzleFL.toFixed(1)} kN</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Front Right</span>
                    <span className="text-cyan-400 font-bold">{vehicle.nozzleFR.toFixed(1)} kN</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Rear Left</span>
                    <span className="text-cyan-400 font-bold">{vehicle.nozzleRL.toFixed(1)} kN</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Rear Right</span>
                    <span className="text-cyan-400 font-bold">{vehicle.nozzleRR.toFixed(1)} kN</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center bg-slate-950/80 p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-400 text-center mb-0.5">Perimeter (x6)</div>
                  <div className="text-base font-bold text-cyan-300 font-mono">
                    {vehicle.nozzlePerimeterEach.toFixed(1)} kN
                  </div>
                  <div className="text-[8px] text-slate-500">each nozzle</div>
                </div>
              </div>
            </div>

            {/* GROUND EFFECT SUCTION */}
            <div className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fan
                  className={`w-6 h-6 text-cyan-400 ${vehicle.fanPowerPercent > 0 ? 'animate-spin' : ''}`}
                  style={{ animationDuration: vehicle.fanPowerPercent > 50 ? '0.6s' : '2s' }}
                />
                <div>
                  <div className="text-[10px] font-mono text-slate-300 font-bold">GROUND EFFECT SUCTION</div>
                  <div className="text-[9px] font-mono text-slate-400">
                    Fan Power: <span className="text-white font-bold">{vehicle.fanPowerPercent.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-[9px] text-slate-400">Downforce</div>
                <div className="text-xs font-bold text-cyan-300">{vehicle.fanDownforceKn.toFixed(1)} kN</div>
              </div>
            </div>

            {/* GAS PRESSURE (COPV) */}
            <div className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-300 font-bold">GAS PRESSURE (COPV)</span>
                <span className="text-white font-bold">{Math.round(vehicle.copvPressurePsi).toLocaleString()} psi</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, (vehicle.copvPressurePsi / vehicle.copvMaxPressurePsi) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">
                  {Math.round((vehicle.copvPressurePsi / vehicle.copvMaxPressurePsi) * 100)}%
                </span>
                <span className={vehicle.copvCompressorActive ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-400'}>
                  {vehicle.copvCompressorActive ? '⚡ Compressor Recharging...' : `${vehicle.copvCapacityL} L Total`}
                </span>
              </div>
            </div>

            {/* SIMULATION ENVIRONMENT (Interactive Click to Cycle Weather) */}
            <div
              onClick={cycleEnvironmentWeather}
              className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2 cursor-pointer hover:border-cyan-500/60 transition-colors"
              title="Click to cycle Simulation Weather Presets (Clear, Crosswind Gusts, Rain, Night Dusk)"
            >
              <div className="text-[10px] font-mono text-slate-300 font-bold mb-1.5 flex justify-between items-center">
                <span>SIMULATION ENVIRONMENT</span>
                <span className="text-[9px] text-cyan-400 font-normal">CLICK TO CYCLE</span>
              </div>
              <div className="flex gap-2">
                <img
                  src="/assets/simulation-environment.png"
                  alt="Coastal Mountain Environment"
                  className="w-20 h-14 rounded object-cover border border-slate-800"
                />
                <div className="space-y-0.5 text-[9px] font-mono text-slate-300 flex-1 justify-center flex flex-col">
                  <div>
                    Weather: <span className="text-white font-bold">
                      {vehicle.weather} {vehicle.weather === 'Clear' ? '☀️' : vehicle.weather === 'Crosswind Gusts' ? '💨' : vehicle.weather === 'Rain / Wet Track' ? '🌧️' : '🌙'}
                    </span>
                  </div>
                  <div>Wind: <span className="text-white">{vehicle.windSpeedKmh} km/h</span></div>
                  <div>Temp: <span className="text-white">{vehicle.ambientTempC}°C</span></div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. BOTTOM FOOTER BAR */}
      {/* ------------------------------------------------------------------- */}
      {showPanels && (
        <footer className="pointer-events-auto bg-[#05070d] border-t border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 z-20">
          <div>
            <span className="text-white font-bold">Tesla Roadster (Next Gen) — Virtual Engineering Lab</span>
            <span className="mx-2 text-slate-600">|</span>
            <span>Powered by AI</span>
            <span className="mx-2 text-slate-600">|</span>
            <span>Math-Driven Simulation</span>
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-cyan-400">Test • Analyze • Improve</span>
          </div>

          <div className="text-slate-300">
            Real Engineering. Real Calculations. Virtual World.
          </div>
        </footer>
      )}

      {/* Driver Flight Remote Controller Overlay */}
      <RemoteFlightController
        vehicle={vehicle}
        isOpen={showRemote}
        onClose={() => setShowRemote(false)}
      />

      {/* ------------------------------------------------------------------- */}
      {/* 4. INTERACTIVE TOP NAVIGATION ENGINEERING OVERLAYS */}
      {/* ------------------------------------------------------------------- */}
      {activeNav === 'Vehicle' && (
        <VehicleExplorerModal vehicle={vehicle} onClose={() => setActiveNav('Home')} />
      )}
      {activeNav === 'Simulation' && (
        <SimulationPhysicsModal vehicle={vehicle} onClose={() => setActiveNav('Home')} />
      )}
      {activeNav === 'Testing' && (
        <TestingMissionModal vehicle={vehicle} onClose={() => setActiveNav('Home')} />
      )}
      {activeNav === 'AI Autonomy' && (
        <AutonomyBrainModal vehicle={vehicle} onClose={() => setActiveNav('Home')} />
      )}
      {activeNav === 'Reports' && (
        <ReportsSummaryModal vehicle={vehicle} onClose={() => setActiveNav('Home')} />
      )}
      {activeNav === 'Settings' && (
        <SettingsLabModal vehicle={vehicle} onClose={() => setActiveNav('Home')} />
      )}
    </div>
  );
};
