import React, { useState, useRef, useEffect } from 'react';
import { GroundVehicleDynamics } from '../physics/GroundVehicleDynamics';
import {
  Radio,
  Sliders,
  Compass,
  Zap,
  RotateCcw,
  Minimize2,
  Maximize2,
  Power,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Gauge
} from 'lucide-react';

interface RemoteFlightControllerProps {
  vehicle: GroundVehicleDynamics;
  isOpen: boolean;
  onClose: () => void;
}

export const RemoteFlightController: React.FC<RemoteFlightControllerProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [leftStick, setLeftStick] = useState({ x: 0, y: 0 });
  const [rightStick, setRightStick] = useState({ x: 0, y: 0 });

  const leftStickRef = useRef<HTMLDivElement>(null);
  const rightStickRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Handle Left Joystick (Throttle / Cold-Gas Lift)
  const handleLeftStickMove = (clientX: number, clientY: number) => {
    if (!leftStickRef.current) return;
    const rect = leftStickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    const dx = Math.max(-radius, Math.min(radius, clientX - centerX));
    const dy = Math.max(-radius, Math.min(radius, clientY - centerY));

    const normX = dx / radius;
    const normY = -dy / radius; // Up is positive

    setLeftStick({ x: normX, y: normY });

    if (normY > 0.05) {
      // Forward Drive / Lift
      vehicle.throttle = normY;
      vehicle.brake = 0;
      vehicle.gear = 'D';
      if (vehicle.isHoverActive) {
        vehicle.targetHoverAltitudeM += normY * 0.4;
      }
    } else if (normY < -0.05) {
      // Brake / Descend
      vehicle.brake = -normY;
      vehicle.throttle = 0;
      if (vehicle.isHoverActive) {
        vehicle.targetHoverAltitudeM = Math.max(1.0, vehicle.targetHoverAltitudeM + normY * 0.3);
      }
    } else {
      vehicle.throttle = 0;
      vehicle.brake = 0;
    }
  };

  // Handle Right Joystick (Steering & Pitch Trim)
  const handleRightStickMove = (clientX: number, clientY: number) => {
    if (!rightStickRef.current) return;
    const rect = rightStickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    const dx = Math.max(-radius, Math.min(radius, clientX - centerX));
    const dy = Math.max(-radius, Math.min(radius, clientY - centerY));

    const normX = dx / radius;
    const normY = -dy / radius;

    setRightStick({ x: normX, y: normY });

    // Steering (-left, +right)
    vehicle.targetSteerAngleRad = -normX * 0.42;

    // Pitch Trim
    if (Math.abs(normY) > 0.1 && vehicle.posY > 2.0) {
      vehicle.pitchRad += normY * 0.02;
    }
  };

  const resetLeftStick = () => {
    setLeftStick({ x: 0, y: 0 });
    vehicle.throttle = 0;
    vehicle.brake = 0;
  };

  const resetRightStick = () => {
    setRightStick({ x: 0, y: 0 });
    vehicle.targetSteerAngleRad = 0;
  };

  return (
    <div className="pointer-events-auto fixed bottom-24 right-6 z-50 select-none">
      {/* Minimized Quick Remote Pill */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#070b13]/95 hover:bg-slate-900 border border-cyan-500/70 text-cyan-300 font-mono text-xs font-bold shadow-2xl backdrop-blur transition-transform hover:scale-105"
        >
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>DRIVER REMOTE (EXPAND)</span>
        </button>
      ) : (
        /* Full Aerospace-Grade Remote Transmitter Console */
        <div className="w-[380px] bg-[#070b13]/95 border-2 border-cyan-500/60 rounded-2xl p-3.5 backdrop-blur shadow-[0_0_35px_rgba(6,182,212,0.35)] flex flex-col gap-3 font-sans text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-xs font-black tracking-wider text-white">
                TESLA DRIVER FLIGHT REMOTE
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Minimize Remote"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-red-950 text-slate-400 hover:text-red-400"
                title="Close Remote Controller"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Theme Switcher Toggle Inside Remote Controller */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#04060a] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => vehicle.setTheme('THEME_1_RAMP')}
              className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                vehicle.activeTheme === 'THEME_1_RAMP'
                  ? 'bg-cyan-500 text-slate-950 border border-white shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🏁 THEME 1: RAMP & LOOP
            </button>
            <button
              onClick={() => vehicle.setTheme('THEME_2_TRAFFIC')}
              className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                vehicle.activeTheme === 'THEME_2_TRAFFIC'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border border-white shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🌆 THEME 2: TRAFFIC ESCAPE
            </button>
          </div>

          {/* Real-Time Pilot LCD Screen */}
          <div className="bg-[#04060a] border border-cyan-900/60 rounded-xl p-2.5 font-mono text-[10px] space-y-1.5 shadow-inner">
            <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-slate-900 pb-1">
              <span>MODE: {vehicle.flightMode}</span>
              <span className="text-emerald-400">RC LINK 100%</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[8px]">SPEED</div>
                <div className="text-white font-bold text-xs">{vehicle.speedKmh.toFixed(0)}</div>
                <div className="text-cyan-400 text-[8px]">km/h</div>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[8px]">ALTITUDE</div>
                <div className="text-cyan-300 font-bold text-xs">{vehicle.posY.toFixed(1)}</div>
                <div className="text-cyan-400 text-[8px]">meters</div>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[8px]">THRUST</div>
                <div className="text-white font-bold text-xs">{vehicle.totalThrustKn.toFixed(1)}</div>
                <div className="text-cyan-400 text-[8px]">kN</div>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[8px]">COPV GAS</div>
                <div className="text-emerald-400 font-bold text-xs">{vehicle.copvPressurePsi.toFixed(0)}</div>
                <div className="text-slate-500 text-[8px]">psi</div>
              </div>
            </div>

            {/* Attitude Horizon Pitch/Roll Bar */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 pt-0.5">
              <span>PITCH: {((vehicle.pitchRad * 180) / Math.PI).toFixed(1)}°</span>
              <span>YAW: {((vehicle.yawRad * 180) / Math.PI).toFixed(1)}°</span>
              <span className={vehicle.isLizardSuctionActive ? "text-amber-400 font-bold" : "text-slate-400"}>
                {vehicle.isLizardSuctionActive ? "SUCTION: 2.0G ACTIVE" : `G: ${vehicle.accelG.toFixed(1)}g`}
              </span>
            </div>
          </div>

          {/* Dual Flight Joysticks */}
          <div className="grid grid-cols-2 gap-4 my-1">
            {/* Left Joystick: Throttle / Cold-Gas Lift */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-mono font-bold text-slate-300 mb-1 flex items-center gap-1">
                <span>THROTTLE / LIFT</span>
              </div>
              <div
                ref={leftStickRef}
                onMouseDown={(e) => {
                  const onMove = (mv: MouseEvent) => handleLeftStickMove(mv.clientX, mv.clientY);
                  const onUp = () => {
                    resetLeftStick();
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                  handleLeftStickMove(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    handleLeftStickMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length > 0) {
                    handleLeftStickMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchEnd={() => resetLeftStick()}
                className="w-24 h-24 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center relative cursor-grab active:cursor-grabbing shadow-inner touch-none select-none"
              >
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-slate-800 pointer-events-none" />
                <div className="absolute h-full w-[1px] bg-slate-800 pointer-events-none" />
                {/* Gimbal Stick Head */}
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border border-white shadow-lg flex items-center justify-center text-slate-950 font-bold text-[9px] pointer-events-none"
                  style={{
                    transform: `translate(${leftStick.x * 24}px, ${-leftStick.y * 24}px)`,
                    transition: leftStick.x === 0 && leftStick.y === 0 ? 'transform 0.15s ease-out' : 'none',
                  }}
                >
                  LIFT
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-500 mt-1">▲ Gas / Lift • ▼ Brake</div>
            </div>

            {/* Right Joystick: Steering & Pitch Trim */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-mono font-bold text-slate-300 mb-1 flex items-center gap-1">
                <span>STEER / PITCH</span>
              </div>
              <div
                ref={rightStickRef}
                onMouseDown={(e) => {
                  const onMove = (mv: MouseEvent) => handleRightStickMove(mv.clientX, mv.clientY);
                  const onUp = () => {
                    resetRightStick();
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                  handleRightStickMove(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    handleRightStickMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length > 0) {
                    handleRightStickMove(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchEnd={() => resetRightStick()}
                className="w-24 h-24 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center relative cursor-grab active:cursor-grabbing shadow-inner touch-none select-none"
              >
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-slate-800 pointer-events-none" />
                <div className="absolute h-full w-[1px] bg-slate-800 pointer-events-none" />
                {/* Gimbal Stick Head */}
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-emerald-400 to-teal-600 border border-white shadow-lg flex items-center justify-center text-slate-950 font-bold text-[9px] pointer-events-none"
                  style={{
                    transform: `translate(${rightStick.x * 24}px, ${-rightStick.y * 24}px)`,
                    transition: rightStick.x === 0 && rightStick.y === 0 ? 'transform 0.15s ease-out' : 'none',
                  }}
                >
                  STEER
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-500 mt-1">◀ Left • Right ▶</div>
            </div>
          </div>

          {/* Quick-Action Flight Buttons */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] font-bold pt-1 border-t border-slate-800">
            {/* Boost */}
            <button
              onClick={() => vehicle.triggerRocketBoost(3500)}
              className="py-2 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400 shadow flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>ROCKET BOOST (78kN)</span>
            </button>

            {/* Hover Balance */}
            <button
              onClick={() => vehicle.toggleHoverMode()}
              className={`py-2 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                vehicle.isHoverActive
                  ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600 text-emerald-300'
              }`}
            >
              <span>🛸 {vehicle.isHoverActive ? 'HOVER ACTIVE' : 'HOVER (F=mg)'}</span>
            </button>

            {/* 3D Ballistic Flip */}
            <button
              onClick={() => vehicle.triggerFlipManeuver()}
              className={`py-2 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                vehicle.flipPhase !== 'IDLE'
                  ? 'bg-purple-600 text-white border-white shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse'
                  : 'bg-purple-950/80 hover:bg-purple-900 border-purple-700 text-purple-300'
              }`}
            >
              <span>🔄 {vehicle.flipPhase !== 'IDLE' ? `FLIP: ${vehicle.flipPhase}` : '3D FLIP (F)'}</span>
            </button>

            {/* Smooth Landing */}
            <button
              onClick={() => vehicle.initiateSmoothLanding()}
              className={`py-2 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                vehicle.isLandingActive
                  ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse'
                  : 'bg-amber-950/80 hover:bg-amber-900 border-amber-700 text-amber-300'
              }`}
            >
              <span>🛬 SMOOTH LANDING</span>
            </button>

            {/* Auto Flight (Full Width) */}
            <button
              onClick={() => vehicle.startAutoLoopFlight()}
              className="col-span-2 py-2 px-2.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-300 flex items-center justify-center gap-1.5 active:scale-95 text-[10px] font-bold"
            >
              <span>
                {vehicle.activeTheme === 'THEME_2_TRAFFIC'
                  ? '⚡ AUTO MISSION 09 (TRAFFIC APPROACH → LIFTOFF → FLEET FLYOVER → TOUCHDOWN)'
                  : '⚡ AUTO MISSION 08 (RUNWAY → RAMP → FLIP → LANDING)'}
              </span>
            </button>
          </div>

          {/* Bottom Reset & Keyboard Guide */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[9px] font-mono text-slate-400">
            <button
              onClick={() => vehicle.resetToGround()}
              className="flex items-center gap-1 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>RESET CAR (R)</span>
            </button>
            <span className="text-slate-500">Keys: WASD / Space / V / L / F / R</span>
          </div>
        </div>
      )}
    </div>
  );
};
