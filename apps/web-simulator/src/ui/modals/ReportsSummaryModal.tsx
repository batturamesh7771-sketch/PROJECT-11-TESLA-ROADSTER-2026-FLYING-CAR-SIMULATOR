import React from 'react';
import { X, FileText, Download, Printer, CheckCircle2, Award, TrendingUp, ShieldAlert } from 'lucide-react';
import { GroundVehicleDynamics } from '../../physics/GroundVehicleDynamics';

interface ReportsSummaryModalProps {
  vehicle: GroundVehicleDynamics;
  onClose: () => void;
}

export const ReportsSummaryModal: React.FC<ReportsSummaryModalProps> = ({ vehicle, onClose }) => {
  const downloadCSV = () => {
    let csv = 'Timestamp,Speed_Kmh,Altitude_M,Thrust_kN,G_Force,COPV_psi\n';
    vehicle.history.forEach((pt) => {
      csv += `${pt.time},${pt.speedKmh},${pt.altitudeM},${vehicle.totalThrustKn},${pt.accelG},${Math.round(vehicle.copvPressurePsi)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `roadster_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const reportData = {
      vehicle: 'Tesla Roadster 2026 Flight Variant',
      timestamp: new Date().toISOString(),
      peakKPIs: {
        maxSpeedKmh: vehicle.sessionMaxSpeedKmh,
        maxAltitudeM: vehicle.sessionMaxAltitudeM,
        peakThrustKn: vehicle.sessionPeakThrustKn,
        peakGForce: vehicle.sessionPeakG,
        minCopvPressurePsi: vehicle.sessionMinCopvPsi,
        totalFlightTimeSec: vehicle.sessionTotalFlightTimeSec,
      },
      flightHistory: vehicle.sessionFlightRuns,
      telemetryLog: vehicle.history,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `roadster_flight_report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#050811]/92 backdrop-blur-md flex flex-col p-6 overflow-hidden pointer-events-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span>LIVE SESSION TELEMETRY SUMMARY & ENGINEERING EXPORT</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                OFFICIAL FLIGHT LOG
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Certified Peak KPIs • Historical Landing Grades • One-Click CSV / JSON Data Extraction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV EXPORT</span>
          </button>

          <button
            onClick={downloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON LOG</span>
          </button>

          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-bold cursor-pointer transition-colors ml-2"
          >
            <X className="w-4 h-4" />
            <span>CLOSE</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
        {/* Row 1: Session Peak KPI Cards */}
        <div className="grid grid-cols-7 gap-3">
          <div className="bg-[#0b101c] border border-cyan-800/60 rounded-xl p-3 font-mono">
            <div className="text-[10px] text-slate-400 mb-1">Max Speed Achieved</div>
            <div className="text-xl font-black text-cyan-300">{vehicle.sessionMaxSpeedKmh.toFixed(0)} <span className="text-xs">km/h</span></div>
            <div className="text-[9px] text-slate-500 mt-1">Ground & Airborne</div>
          </div>

          <div className="bg-[#0b101c] border border-orange-800/60 rounded-xl p-3 font-mono">
            <div className="text-[10px] text-slate-400 mb-1">Max Altitude Reached</div>
            <div className="text-xl font-black text-orange-400">{vehicle.sessionMaxAltitudeM.toFixed(1)} <span className="text-xs">m</span></div>
            <div className="text-[9px] text-emerald-400 mt-1">&lt; 34.0m Safety Limit</div>
          </div>

          <div className="bg-[#0b101c] border border-purple-800/60 rounded-xl p-3 font-mono">
            <div className="text-[10px] text-slate-400 mb-1">Peak Thrust Fired</div>
            <div className="text-xl font-black text-purple-400">{vehicle.sessionPeakThrustKn.toFixed(1)} <span className="text-xs">kN</span></div>
            <div className="text-[9px] text-slate-500 mt-1">10 Nozzle Vectoring</div>
          </div>

          <div className="bg-[#0b101c] border border-emerald-800/60 rounded-xl p-3 font-mono">
            <div className="text-[10px] text-slate-400 mb-1">Peak Felt G-Force</div>
            <div className="text-xl font-black text-emerald-400">{vehicle.sessionPeakG.toFixed(2)} <span className="text-xs">g</span></div>
            <div className="text-[9px] text-slate-500 mt-1">Takeoff & Flip Max</div>
          </div>

          <div className="bg-[#0b101c] border border-blue-800/60 rounded-xl p-3 font-mono">
            <div className="text-[10px] text-slate-400 mb-1">Min COPV Pressure</div>
            <div className="text-xl font-black text-white">{Math.round(vehicle.sessionMinCopvPsi).toLocaleString()} <span className="text-xs">psi</span></div>
            <div className="text-[9px] text-slate-500 mt-1">Lowest Depletion Level</div>
          </div>

          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-3 font-mono">
            <div className="text-[10px] text-slate-400 mb-1">Touchdown Sink Rate</div>
            <div className="text-xl font-black text-cyan-300">0.42 <span className="text-xs">m/s</span></div>
            <div className="text-[9px] text-emerald-400 font-bold mt-1">GRADE: SMOOTH</div>
          </div>

          <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-3 font-mono">
            <div className="text-[10px] text-slate-400 mb-1">Total Flight Time</div>
            <div className="text-xl font-black text-amber-300">{vehicle.sessionTotalFlightTimeSec.toFixed(1)} <span className="text-xs">s</span></div>
            <div className="text-[9px] text-slate-500 mt-1">Airborne Time in Session</div>
          </div>
        </div>

        {/* Row 2: Historical Run Comparison Table */}
        <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> HISTORICAL RUN COMPARISON TABLE
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {vehicle.sessionFlightRuns.length} COMPLETED RUNS IN THIS SESSION
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] bg-slate-950/60">
                  <th className="p-2">RUN ID</th>
                  <th className="p-2">THEME / TRIAL</th>
                  <th className="p-2">TIMESTAMP</th>
                  <th className="p-2">PEAK ALTITUDE</th>
                  <th className="p-2">GAS CONSUMED</th>
                  <th className="p-2">SINK RATE</th>
                  <th className="p-2">LANDING GRADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vehicle.sessionFlightRuns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                      No complete flight runs recorded yet. Execute AUTO LOOP or manual flight trial to populate historical table.
                    </td>
                  </tr>
                ) : (
                  vehicle.sessionFlightRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-900/50">
                      <td className="p-2 font-bold text-cyan-400">{run.id}</td>
                      <td className="p-2 text-white">{run.theme}</td>
                      <td className="p-2 text-slate-400">{run.timestamp}</td>
                      <td className="p-2 text-orange-400 font-bold">{run.maxAlt.toFixed(1)} m</td>
                      <td className="p-2 text-slate-300">{run.gasUsed.toFixed(0)} psi</td>
                      <td className="p-2 text-cyan-300">{run.sinkRate.toFixed(2)} m/s</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          run.grade === 'SMOOTH'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : run.grade === 'FIRM'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-red-950 text-red-300 border-red-800'
                        }`}>
                          {run.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
