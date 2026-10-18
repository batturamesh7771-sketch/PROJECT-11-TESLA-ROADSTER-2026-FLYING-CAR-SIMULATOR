import React, { useRef, useEffect, useState } from 'react';

export interface TelemetryDataPoint {
  time: number;
  speedKmh: number;
  altitudeM: number;
  totalThrustKn: number;
  gForce: number;
  systemTempC: number;
}

interface TelemetryOscilloscopeProps {
  currentPoint: TelemetryDataPoint;
  historyBuffer: TelemetryDataPoint[];
}

export type ChannelType = 'All' | 'Speed' | 'Altitude' | 'Thrust' | 'G-Force' | 'Temp';

export const TelemetryOscilloscope: React.FC<TelemetryOscilloscopeProps> = ({
  currentPoint,
  historyBuffer,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('All');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute live Min, Max, Current for selected channel
  const getChannelMetrics = (channel: ChannelType) => {
    if (!historyBuffer.length) {
      return { current: 0, min: 0, max: 0, unit: '' };
    }
    const getValue = (p: TelemetryDataPoint) => {
      switch (channel) {
        case 'Speed': return p.speedKmh;
        case 'Altitude': return p.altitudeM;
        case 'Thrust': return p.totalThrustKn;
        case 'G-Force': return p.gForce;
        case 'Temp': return p.systemTempC;
        default: return p.speedKmh;
      }
    };

    const getUnit = () => {
      switch (channel) {
        case 'Speed': return 'km/h';
        case 'Altitude': return 'm';
        case 'Thrust': return 'kN';
        case 'G-Force': return 'g';
        case 'Temp': return '°C';
        default: return 'norm';
      }
    };

    const current = getValue(currentPoint);
    let min = getValue(historyBuffer[0]);
    let max = getValue(historyBuffer[0]);
    for (let i = 1; i < historyBuffer.length; i++) {
      const v = getValue(historyBuffer[i]);
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { current, min, max, unit: getUnit() };
  };

  const metrics = getChannelMetrics(selectedChannel);

  // High performance Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    // Draw Oscilloscope Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#121c2e';
    ctx.beginPath();
    // Horizontal lines
    for (let y = 0.25; y < 1.0; y += 0.25) {
      ctx.moveTo(0, height * y);
      ctx.lineTo(width, height * y);
    }
    // Vertical time lines (6 intervals for 60s)
    for (let x = 0.166; x < 1.0; x += 0.166) {
      ctx.moveTo(width * x, 0);
      ctx.lineTo(width * x, height);
    }
    ctx.stroke();

    if (historyBuffer.length < 2) return;

    const count = historyBuffer.length;
    const getX = (idx: number) => (idx / (Math.max(1, count - 1))) * width;

    // Render curves
    const drawTrace = (
      accessor: (p: TelemetryDataPoint) => number,
      minScale: number,
      maxScale: number,
      color: string,
      glowColor: string,
      lineWidth = 2
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();

      for (let i = 0; i < count; i++) {
        const x = getX(i);
        const val = accessor(historyBuffer[i]);
        // Normalize val between minScale and maxScale to [height - 4, 4]
        const norm = (val - minScale) / (maxScale - minScale || 1);
        const clampedNorm = Math.max(0.0, Math.min(1.0, norm));
        const y = height - 4 - clampedNorm * (height - 8);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    };

    if (selectedChannel === 'All') {
      // 5 Channels normalized
      drawTrace((p) => p.speedKmh, 0, 260, '#38bdf8', 'rgba(56,189,248,0.5)', 1.5); // Speed Cyan
      drawTrace((p) => p.altitudeM, 0, 32, '#fb923c', 'rgba(251,146,60,0.5)', 1.5); // Alt Orange
      drawTrace((p) => p.gForce, 0, 2.8, '#34d399', 'rgba(52,211,153,0.5)', 1.5); // G-Force Emerald
      drawTrace((p) => p.totalThrustKn, 0, 80, '#c084fc', 'rgba(192,132,252,0.5)', 1.5); // Thrust Purple
      drawTrace((p) => p.systemTempC, 20, 85, '#f87171', 'rgba(248,113,113,0.5)', 1.5); // Temp Red
    } else if (selectedChannel === 'Speed') {
      drawTrace((p) => p.speedKmh, 0, Math.max(120, metrics.max * 1.15), '#38bdf8', 'rgba(56,189,248,0.8)', 2.5);
    } else if (selectedChannel === 'Altitude') {
      drawTrace((p) => p.altitudeM, 0, Math.max(15, metrics.max * 1.15), '#fb923c', 'rgba(251,146,60,0.8)', 2.5);
    } else if (selectedChannel === 'Thrust') {
      drawTrace((p) => p.totalThrustKn, 0, 80, '#c084fc', 'rgba(192,132,252,0.8)', 2.5);
    } else if (selectedChannel === 'G-Force') {
      drawTrace((p) => p.gForce, 0, Math.max(2.2, metrics.max * 1.15), '#34d399', 'rgba(52,211,153,0.8)', 2.5);
    } else if (selectedChannel === 'Temp') {
      drawTrace((p) => p.systemTempC, 15, Math.max(50, metrics.max * 1.1), '#f87171', 'rgba(248,113,113,0.8)', 2.5);
    }

    // Draw Crosshair on Hover
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < count) {
      const hoverX = getX(hoverIndex);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();

      // Point circle
      const pt = historyBuffer[hoverIndex];
      let val = pt.speedKmh;
      let minS = 0, maxS = 260;
      let color = '#38bdf8';
      if (selectedChannel === 'Altitude') { val = pt.altitudeM; minS = 0; maxS = Math.max(15, metrics.max * 1.15); color = '#fb923c'; }
      else if (selectedChannel === 'Thrust') { val = pt.totalThrustKn; minS = 0; maxS = 80; color = '#c084fc'; }
      else if (selectedChannel === 'G-Force') { val = pt.gForce; minS = 0; maxS = Math.max(2.2, metrics.max * 1.15); color = '#34d399'; }
      else if (selectedChannel === 'Temp') { val = pt.systemTempC; minS = 15; maxS = Math.max(50, metrics.max * 1.1); color = '#f87171'; }

      const norm = (val - minS) / (maxS - minS || 1);
      const hoverY = height - 4 - Math.max(0, Math.min(1, norm)) * (height - 8);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(hoverX, hoverY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [historyBuffer, selectedChannel, hoverIndex, currentPoint, metrics.max]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !historyBuffer.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = x / rect.width;
    const idx = Math.round(ratio * (historyBuffer.length - 1));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const hoveredPoint = hoverIndex !== null && historyBuffer[hoverIndex] ? historyBuffer[hoverIndex] : null;

  return (
    <div className="bg-[#0b101c]/90 border border-slate-800/90 rounded-lg p-2.5 flex flex-col gap-1.5 shadow-md">
      {/* Header and Channel Tabs */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 font-bold">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>LIVE TELEMETRY (60 FPS)</span>
        </span>
        {/* Live Numeric Readout Header */}
        <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2">
          {selectedChannel === 'All' ? (
            <span className="text-cyan-300">{currentPoint.speedKmh.toFixed(0)} km/h • {currentPoint.altitudeM.toFixed(1)}m</span>
          ) : (
            <span>
              <span className="text-white font-bold">{metrics.current.toFixed(1)} {metrics.unit}</span>
              <span className="text-slate-500 mx-1">|</span>
              <span className="text-slate-400">Min: {metrics.min.toFixed(1)}</span>
              <span className="text-slate-500 mx-1">|</span>
              <span className="text-cyan-400">Max: {metrics.max.toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Sub-Tabs: All, Speed, Altitude, Thrust, G-Force, Temp */}
      <div className="flex gap-1">
        {(['All', 'Speed', 'Altitude', 'Thrust', 'G-Force', 'Temp'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedChannel(tab)}
            className={`flex-1 py-0.5 rounded text-[9px] font-mono font-semibold transition-all cursor-pointer ${
              selectedChannel === tab
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Canvas Oscilloscope */}
      <div className="relative bg-slate-950 border border-slate-800 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          width={264}
          height={92}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-[92px] block cursor-crosshair"
        />

        {/* Hover Inspector Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-1 left-2 pointer-events-none bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded text-[8px] font-mono text-white shadow-lg backdrop-blur">
            T+{hoveredPoint.time.toFixed(1)}s: {hoveredPoint.speedKmh.toFixed(0)} km/h | {hoveredPoint.altitudeM.toFixed(1)}m | {hoveredPoint.totalThrustKn.toFixed(1)} kN | {hoveredPoint.gForce.toFixed(2)}g
          </div>
        )}

        {/* Timeline Bottom Axis Labels */}
        <div className="flex justify-between text-[8px] font-mono text-slate-500 px-1 py-0.5 bg-slate-950/80 border-t border-slate-900">
          <span>-60s</span>
          <span>-45s</span>
          <span>-30s</span>
          <span>-15s</span>
          <span>0s (NOW)</span>
        </div>
      </div>

      {/* Multi-Channel Legend */}
      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 px-0.5">
        <span className="flex items-center gap-1 text-cyan-400">● Speed</span>
        <span className="flex items-center gap-1 text-orange-400">● Alt</span>
        <span className="flex items-center gap-1 text-purple-400">● Thrust</span>
        <span className="flex items-center gap-1 text-emerald-400">● G-Force</span>
        <span className="flex items-center gap-1 text-red-400">● Temp</span>
      </div>
    </div>
  );
};
