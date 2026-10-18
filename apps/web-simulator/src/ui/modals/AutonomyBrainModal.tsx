import React, { useState } from 'react';
import { X, Cpu, Pause, Play, Trash2, Download, CheckCircle2, AlertTriangle, Eye, ShieldCheck, Activity } from 'lucide-react';
import { GroundVehicleDynamics } from '../../physics/GroundVehicleDynamics';

interface AutonomyBrainModalProps {
  vehicle: GroundVehicleDynamics;
  onClose: () => void;
}

export const AutonomyBrainModal: React.FC<AutonomyBrainModalProps> = ({ vehicle, onClose }) => {
  const [isLogPaused, setIsLogPaused] = useState(false);
  const [localLogs, setLocalLogs] = useState(() => [...vehicle.autonomyLogs]);

  // Determine active FSM node based on vehicle state
  const getActiveFsmNode = () => {
    if (vehicle.activeTheme === 'THEME_2_TRAFFIC') {
      if (vehicle.posY <= 0.1 && vehicle.speedKmh > 20) return 'GROUND_APPROACH';
      if (vehicle.trafficBlockadeDetected && vehicle.posY <= 0.5) return 'TRAFFIC_HALT';
      if (vehicle.mission09Phase === 'VERTICAL_LIFTOFF' || (vehicle.posY > 0.5 && vehicle.velY > 0.5)) return 'VERTICAL_POP';
      if (vehicle.mission09Phase === 'FLY_OVER_TRAFFIC' || vehicle.flipPhase !== 'IDLE') return 'AIR_CRUISE_FLIP';
      if (vehicle.isLandingActive || vehicle.mission09Phase === 'RETRO_LANDING') return 'PID_RETRO_LANDING';
      return 'TOUCHDOWN_COMPLETE';
    } else {
      if (vehicle.posY <= 0.1 && vehicle.posX < -30) return 'GROUND_APPROACH';
      if (vehicle.isOnRamp && vehicle.posY < 16.0) return 'SUCTION_WALL_CLIMB';
      if (vehicle.isOnRamp && vehicle.posY >= 16.0) return 'INVERTED_CEILING';
      if (vehicle.flipPhase !== 'IDLE') return 'LIP_DROP_180_FLIP';
      if (vehicle.isHoverActive) return 'HOVER_BALANCE';
      if (vehicle.isLandingActive) return 'PID_RETRO_LANDING';
      return 'TOUCHDOWN_COMPLETE';
    }
  };

  const activeNode = getActiveFsmNode();

  const fsmNodesTheme1 = [
    { id: 'GROUND_APPROACH', label: '1. Ground Approach', desc: 'Runway high-speed acceleration' },
    { id: 'SUCTION_WALL_CLIMB', label: '2. Suction Wall Climb', desc: '2.0G adhesion on curved ramp' },
    { id: 'INVERTED_CEILING', label: '3. Inverted Ceiling Hold', desc: '180° upside-down driving' },
    { id: 'LIP_DROP_180_FLIP', label: '4. Lip Drop & 180° Flip', desc: 'Ballistic angular pitch catch' },
    { id: 'HOVER_BALANCE', label: '5. 10-Nozzle PID Hover', desc: 'Closed-loop attitude hold' },
    { id: 'PID_RETRO_LANDING', label: '6. Retro-Burn Landing', desc: 'Cushioned descent < 1.0 m/s' },
    { id: 'TOUCHDOWN_COMPLETE', label: '7. Touchdown Complete', desc: 'Safe ground rollout' },
  ];

  const fsmNodesTheme2 = [
    { id: 'GROUND_APPROACH', label: '1. Expressway Cruise', desc: 'Interstate high-speed approach' },
    { id: 'TRAFFIC_HALT', label: '2. Gridlock Halt', desc: 'Forward obstacle sensing' },
    { id: 'VERTICAL_POP', label: '3. Vertical COPV Pop', desc: '10.5m liftoff clearance' },
    { id: 'AIR_CRUISE_FLIP', label: '4. 360° Flip Over Jam', desc: 'Transonic fleet flyover' },
    { id: 'PID_RETRO_LANDING', label: '5. Retro-Burn Landing', desc: 'Target lane deceleration' },
    { id: 'TOUCHDOWN_COMPLETE', label: '6. Highway Touchdown', desc: 'Open freeway cruise' },
  ];

  const activeFsmList = vehicle.activeTheme === 'THEME_2_TRAFFIC' ? fsmNodesTheme2 : fsmNodesTheme1;

  // Obstacle distance
  const obstacleDistanceM = vehicle.activeTheme === 'THEME_2_TRAFFIC'
    ? Math.max(0, -20.0 - vehicle.posX).toFixed(1)
    : Math.max(0, -30.0 - vehicle.posX).toFixed(1);

  const clearLogs = () => {
    vehicle.autonomyLogs = [];
    setLocalLogs([]);
  };

  const exportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vehicle.autonomyLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autonomy_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#050811]/92 backdrop-blur-md flex flex-col p-6 overflow-hidden pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span>FSD FLIGHT & GROUND NEURAL PLANNER HUB</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                NEURAL PLANNER 60 HZ CONFIDENCE: 99.4%
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic Finite State Machine (FSM) • Occupancy Network • ADAS LiDAR Ranging • Live Event Streaming
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
        {/* Col 1: FSM Finite State Machine Node Graph (5 cols) */}
        <div className="col-span-5 bg-[#0b101c] border border-cyan-800/60 rounded-xl p-4 shadow-xl flex flex-col">
          <span className="text-xs font-mono font-bold text-cyan-300 mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> FINITE STATE MACHINE (FSM) NODE GRAPH
          </span>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {activeFsmList.map((node, idx) => {
              const isCurrent = activeNode === node.id;
              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg border font-mono transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-white'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                      {node.label}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isCurrent ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-black' : 'text-slate-600'
                    }`}>
                      {isCurrent ? 'ACTIVE' : `STATE 0${idx + 1}`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 pl-4">{node.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: ADAS Occupancy & Target Coordinates (3 cols) */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" /> ADAS / OCCUPANCY FEED
            </span>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">Obstacle Clearance (LiDAR)</div>
              <div className="text-lg font-black text-cyan-300">{obstacleDistanceM} m</div>
              <div className="text-[10px] text-slate-500">
                {vehicle.activeTheme === 'THEME_2_TRAFFIC' ? 'Tesla Semi Corrugated Trailer' : 'Curved Aerobatic C-Ramp Base'}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">Target Touchdown Zone</div>
              <div className="text-sm font-bold text-white">
                X: {vehicle.activeTheme === 'THEME_2_TRAFFIC' ? '+115.0m (Lane 2)' : '-50.0m (Runway)'}
              </div>
              <div className="text-[10px] text-emerald-400">Glide Slope Aligned • Safe Clear Surface</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[10px]">Neural FSD Flight Latency</div>
              <div className="text-sm font-bold text-white">4.2 ms / Inference</div>
              <div className="text-[10px] text-slate-500">Hardware 4 Dual FSD Neural Chips</div>
            </div>
          </div>
        </div>

        {/* Col 3: Interactive Real-Time AI Autonomy Log Stream (4 cols) */}
        <div className="col-span-4 bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> LIVE EVENT LOG STREAM
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsLogPaused((p) => !p)}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  title={isLogPaused ? 'Resume Logging' : 'Pause Logging'}
                >
                  {isLogPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                </button>
                <button
                  onClick={clearLogs}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  title="Clear Log History"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
                <button
                  onClick={exportLogs}
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  title="Download JSON Log"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                </button>
              </div>
            </div>

            <div className="h-72 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] space-y-1.5 custom-scrollbar">
              {vehicle.autonomyLogs.length === 0 ? (
                <div className="text-slate-500 italic p-2">No autonomy events recorded yet. Drive or trigger flight.</div>
              ) : (
                vehicle.autonomyLogs.slice(-25).map((log) => {
                  let colorClass = 'text-slate-300';
                  if (log.type === 'thrust') colorClass = 'text-cyan-400 font-bold';
                  else if (log.type === 'flip') colorClass = 'text-purple-400 font-bold';
                  else if (log.type === 'suction') colorClass = 'text-amber-400 font-bold';
                  else if (log.type === 'warn') colorClass = 'text-red-400 font-bold';
                  else if (log.type === 'success') colorClass = 'text-emerald-400 font-bold';

                  return (
                    <div key={log.id} className="border-b border-slate-900/60 pb-1 leading-tight">
                      <span className="text-slate-500 mr-1.5">{log.timestamp}</span>
                      <span className={colorClass}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-center mt-2">
            Auto-streaming events at 60 Hz • Logging cold-gas vectoring, PID balancing & suction
          </div>
        </div>
      </div>
    </div>
  );
};
