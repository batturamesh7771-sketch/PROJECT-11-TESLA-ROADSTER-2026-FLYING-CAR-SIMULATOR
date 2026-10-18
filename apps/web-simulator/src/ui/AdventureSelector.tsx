import React, { useState } from 'react';
import { ADVENTURE_DEFINITIONS, AdventureDefinition } from '@tesla-roadster/shared-core';
import { Compass, Play, CheckCircle2, ChevronRight, Wind, Thermometer, Gauge } from 'lucide-react';

interface AdventureSelectorProps {
  activeAdventureId: string;
  onSelectAdventure: (id: string) => void;
}

export const AdventureSelector: React.FC<AdventureSelectorProps> = ({
  activeAdventureId,
  onSelectAdventure,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeAdv = ADVENTURE_DEFINITIONS.find((a) => a.id === activeAdventureId) || ADVENTURE_DEFINITIONS[0];

  return (
    <div className="pointer-events-auto">
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-950/85 hover:bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 backdrop-blur-md shadow-xl transition-all"
      >
        <Compass className="w-4 h-4 text-red-500" />
        <span>MISSION: {activeAdv.id} · {activeAdv.title.split('(')[0].trim()}</span>
        <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Expandable Adventure Modal / Drawer */}
      {isOpen && (
        <div className="absolute top-16 left-4 w-96 max-h-[75vh] overflow-y-auto bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-30 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-black tracking-wider text-slate-300 uppercase">
              10 Adventure Proving Grounds
            </span>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/70 border border-red-800 px-2 py-0.5 rounded">
              OCT 2026 BENCHMARKS
            </span>
          </div>

          <div className="space-y-2">
            {ADVENTURE_DEFINITIONS.map((adv) => {
              const isSelected = adv.id === activeAdventureId;
              return (
                <div
                  key={adv.id}
                  onClick={() => {
                    onSelectAdventure(adv.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/30 border-red-600/70 shadow-lg glow-red'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-white font-mono">{adv.id}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{adv.location}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mb-2 leading-tight">
                    {adv.title}
                  </div>

                  {/* Conditions & Target Specs */}
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400 mb-2 bg-slate-950/60 p-1.5 rounded">
                    <div>P: {adv.environmentalConditions.ambientPressureKpa} kPa</div>
                    <div>T: {adv.environmentalConditions.ambientTempC}°C</div>
                    <div>μ: {adv.environmentalConditions.surfaceFrictionMu}</div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {adv.missionBrief}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
