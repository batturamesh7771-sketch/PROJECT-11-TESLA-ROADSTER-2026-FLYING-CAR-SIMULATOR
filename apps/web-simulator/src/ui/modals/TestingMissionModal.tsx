import React from 'react';
import { X, CheckSquare, Play, Flame, Compass, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { GroundVehicleDynamics } from '../../physics/GroundVehicleDynamics';

interface TestingMissionModalProps {
  vehicle: GroundVehicleDynamics;
  onClose: () => void;
}

export const TestingMissionModal: React.FC<TestingMissionModalProps> = ({ vehicle, onClose }) => {
  const missions = [
    {
      id: 'M-01',
      title: '0–60 mph Sub-Second Sprint',
      desc: 'Maximum Cold-Gas horizontal vectoring launch test with all 10 nozzles primed.',
      target: '0.59s (31.4m stopping)',
      status: 'Completed',
      theme: 'THEME_1_RAMP' as const,
      handler: () => vehicle.launchMissionTest('M-01'),
    },
    {
      id: 'M-02',
      title: 'High-Speed 230+ mph Aero Run',
      desc: 'Active rear spoiler tilt, aerodynamic ground effects, and high-speed stability.',
      target: '> 230 mph (> 370 km/h)',
      status: 'Completed',
      theme: 'THEME_1_RAMP' as const,
      handler: () => vehicle.launchMissionTest('M-02'),
    },
    {
      id: 'M-03',
      title: '2.0G Suction Slalom Course',
      desc: 'High-G lateral turns with twin 20 kW vacuum turbines engaged for inverted adhesion.',
      target: '2.0G Lateral Adhesion',
      status: 'Completed',
      theme: 'THEME_1_RAMP' as const,
      handler: () => vehicle.launchMissionTest('M-03'),
    },
    {
      id: 'M-04',
      title: 'Half-Circle Ramp Climb & Flight',
      desc: 'Ascend the curved C-ramp with lizard suction downforce and initiate mid-air launch.',
      target: '28.0m Apex Loop',
      status: vehicle.activeTestId === 'MISSION-08' ? 'Running' : 'Ready',
      theme: 'THEME_1_RAMP' as const,
      handler: () => vehicle.launchMissionTest('M-04'),
    },
    {
      id: 'M-05',
      title: 'Inverted Ceiling Hold & Pause',
      desc: 'Drive upside-down across the upper horizontal arch adhering against 1.0G gravity.',
      target: '180° Inverted Drive',
      status: 'Ready',
      theme: 'THEME_1_RAMP' as const,
      handler: () => vehicle.launchMissionTest('M-05'),
    },
    {
      id: 'M-06',
      title: 'Heavy City Traffic Escape & Kickflip',
      desc: 'Vertical 10.5m hop over stalled Cybertrucks and Tesla Semis with 360° mid-air flip.',
      target: '10.5m Flyover Clearance',
      status: vehicle.activeTestId === 'MISSION-09' ? 'Running' : 'Ready',
      theme: 'THEME_2_TRAFFIC' as const,
      handler: () => vehicle.launchMissionTest('M-06'),
    },
    {
      id: 'M-07',
      title: '10-Nozzle Crosswind PID Hover Trial',
      desc: 'Hover at 15.0m altitude countering 45 km/h lateral crosswinds using PID closed loop.',
      target: '±0.15m Altitude Hold',
      status: 'Ready',
      theme: 'THEME_1_RAMP' as const,
      handler: () => vehicle.launchMissionTest('M-07'),
    },
    {
      id: 'M-08',
      title: 'Low-PSI Emergency Retro-Catch Landing',
      desc: 'Terminal descent deceleration with gentle touchdown sink rate < 0.8 m/s.',
      target: '< 1.0 m/s Cushion Touchdown',
      status: 'Ready',
      theme: 'THEME_1_RAMP' as const,
      handler: () => vehicle.launchMissionTest('M-08'),
    },
    {
      id: 'M-09',
      title: 'Full Autonomous Interstate Traffic Flyover',
      desc: 'Autonomous approach, gridlock sensing, vertical jump, air-cruise, and freeway touchdown.',
      target: 'Complete Stage 1–5 Loop',
      status: vehicle.activeTheme === 'THEME_2_TRAFFIC' && vehicle.isAutoFlightActive ? 'Running' : 'Ready',
      theme: 'THEME_2_TRAFFIC' as const,
      handler: () => vehicle.launchMissionTest('M-09'),
    },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-[#050811]/92 backdrop-blur-md flex flex-col p-6 overflow-hidden pointer-events-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span>PROVING GROUND & MISSION CONTROL MATRIX</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                MISSIONS M-01 THROUGH M-09
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Certified Aerobatic & Urban Proving Ground Test Battery • One-Click Scene Configuration & Launch
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

      {/* Grid of Missions */}
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto pr-1">
        {missions.map((m) => {
          const isRunning = m.status === 'Running';
          return (
            <div
              key={m.id}
              className={`bg-[#0b101c] border rounded-xl p-4 shadow-xl flex flex-col justify-between transition-all ${
                isRunning ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-black text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {m.id}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      isRunning
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-700 animate-pulse'
                        : m.status === 'Completed'
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{m.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed mb-3">{m.desc}</p>
              </div>

              <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-500">Benchmark Target:</span>
                  <span className="text-cyan-300 font-bold">{m.target}</span>
                </div>

                <button
                  onClick={() => {
                    m.handler();
                    onClose();
                  }}
                  className={`w-full py-2 rounded-lg font-mono text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isRunning
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>▶ LAUNCH TEST {m.id}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
