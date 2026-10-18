import React, { useEffect, useRef } from 'react';

interface TrackMinimapProps {
  vehicleX: number;
  vehicleZ: number;
  vehicleYaw: number;
}

export const TrackMinimap: React.FC<TrackMinimapProps> = ({ vehicleX, vehicleZ, vehicleYaw }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Track coordinates: X from -150 to +150 (300m total), Z from -9 to +9 (18m wide)
    const paddingX = 14;
    const runwayWidth = width - 2 * paddingX;
    const trackCenterY = height / 2;
    const trackHalfHeight = 12;

    // Draw asphalt strip
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(paddingX, trackCenterY - trackHalfHeight, runwayWidth, trackHalfHeight * 2);

    // Track edge lines
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(paddingX, trackCenterY - trackHalfHeight, runwayWidth, trackHalfHeight * 2);

    // Centerline dashed
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(paddingX, trackCenterY);
    ctx.lineTo(width - paddingX, trackCenterY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance markings (-100m, 0m, +50m, +100m)
    const mapX = (xVal: number) => paddingX + ((xVal + 150) / 300) * runwayWidth;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';

    const markers = [-100, -50, 0, 50, 100];
    markers.forEach((m) => {
      const px = mapX(m);
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(px, trackCenterY - trackHalfHeight - 2);
      ctx.lineTo(px, trackCenterY + trackHalfHeight + 2);
      ctx.stroke();
      ctx.fillText(`${m}m`, px, trackCenterY + trackHalfHeight + 11);
    });

    // Braking test zone (from X = 0 to X = 43m highlighted in amber/red)
    const brakeStart = mapX(0);
    const brakeEnd = mapX(43);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fillRect(brakeStart, trackCenterY - trackHalfHeight, brakeEnd - brakeStart, trackHalfHeight * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('43m TARGET', (brakeStart + brakeEnd) / 2, trackCenterY - trackHalfHeight - 3);

    // Draw vehicle position
    const carPx = mapX(vehicleX);
    // In our coordinate system, +Z is to the right/left
    const carPy = trackCenterY + (vehicleZ / 9.0) * (trackHalfHeight - 2);

    ctx.save();
    ctx.translate(carPx, carPy);
    // In Three.js, yaw = 0 is +X (pointing right). Rotation in canvas:
    ctx.rotate(-vehicleYaw);

    // Vehicle blip body (silver/cyan rectangle)
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;
    ctx.fillRect(-6, -3, 12, 6);

    // Nose direction indicator (white dot)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -1, 3, 2);

    ctx.restore();
  }, [vehicleX, vehicleZ, vehicleYaw]);

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded p-2 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mb-1">
        <span className="font-semibold tracking-wider text-cyan-400">PROVING GROUND RUNWAY (300M)</span>
        <span className="text-slate-400">X: {vehicleX.toFixed(1)}m | Z: {vehicleZ.toFixed(1)}m</span>
      </div>
      <canvas ref={canvasRef} width={280} height={48} className="rounded border border-slate-800" />
    </div>
  );
};
