import React, { useState } from 'react';
import { SUBSYSTEM_DEFINITIONS, CADPartMetadata } from '@tesla-roadster/shared-core';
import { Layers, Eye, EyeOff, Search, Box, ChevronDown, ChevronRight } from 'lucide-react';

interface CADTreeViewProps {
  bomData: CADPartMetadata[];
  onSelectPart: (id: string) => void;
  onToggleSubsystem: (code: string, visible: boolean) => void;
  selectedPart: CADPartMetadata | null;
}

export const CADTreeView: React.FC<CADTreeViewProps> = ({
  bomData,
  onSelectPart,
  onToggleSubsystem,
  selectedPart,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubsystems, setExpandedSubsystems] = useState<Record<string, boolean>>({ 'SYS-01': true });
  const [subsystemVisibility, setSubsystemVisibility] = useState<Record<string, boolean>>({});

  const toggleSubsystemExpand = (code: string) => {
    setExpandedSubsystems((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleVisibility = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = subsystemVisibility[code] ?? true;
    const next = !current;
    setSubsystemVisibility((prev) => ({ ...prev, [code]: next }));
    onToggleSubsystem(code, next);
  };

  return (
    <div className="pointer-events-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-950/85 hover:bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 backdrop-blur-md shadow-xl transition-all"
      >
        <Layers className="w-4 h-4 text-purple-400" />
        <span>1,048-PART CAD TREE</span>
        <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-mono">
          {selectedPart ? selectedPart.id : '10 SUBSYSTEMS'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-16 right-4 w-96 max-h-[75vh] flex flex-col bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-30">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-black tracking-wider text-slate-300 uppercase">
              Digital Twin CAD Inspector
            </span>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/70 border border-purple-800 px-2 py-0.5 rounded">
              1,048 PARTS
            </span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter part ID or material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Subsystems & Parts Tree */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {SUBSYSTEM_DEFINITIONS.map((sys) => {
              const isExpanded = expandedSubsystems[sys.code];
              const isVisible = subsystemVisibility[sys.code] ?? true;
              const sysParts = bomData.filter((p) => p.subsystemCode === sys.code);
              const filteredParts = searchQuery
                ? sysParts.filter((p) => p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.material.toLowerCase().includes(searchQuery.toLowerCase()))
                : sysParts;

              if (searchQuery && filteredParts.length === 0) return null;

              return (
                <div key={sys.code} className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
                  <div
                    onClick={() => toggleSubsystemExpand(sys.code)}
                    className="flex items-center justify-between p-2.5 bg-slate-900/70 hover:bg-slate-850 cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-2">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="text-xs font-bold text-slate-200 font-mono">{sys.code}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[170px]">{sys.name.split('&')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-slate-500">{sys.partCount}p</span>
                      <button
                        onClick={(e) => toggleVisibility(sys.code, e)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-slate-950/60 max-h-48 overflow-y-auto border-t border-slate-800/60 font-mono">
                      {filteredParts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => onSelectPart(p.id)}
                          className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-[10px] transition-colors ${
                            selectedPart?.id === p.id
                              ? 'bg-purple-900/40 text-purple-200 border border-purple-600'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <Box className="w-3 h-3 text-purple-400" />
                            <span className="font-bold">{p.id}</span>
                          </div>
                          <span className="text-slate-500 truncate max-w-[120px]">{p.material}</span>
                          <span className="text-slate-400">{p.massKg}kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Part Detail Footer */}
          {selectedPart && (
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono bg-purple-950/20 p-2 rounded-lg border border-purple-900/40">
              <div className="flex justify-between font-bold text-purple-300">
                <span>{selectedPart.id}</span>
                <span>{selectedPart.massKg} kg</span>
              </div>
              <div className="text-slate-300 font-sans text-xs mt-0.5">{selectedPart.name}</div>
              <div className="text-slate-400 text-[10px] mt-1">Material: <span className="text-white">{selectedPart.material}</span></div>
              <div className="text-slate-400 text-[10px]">Kinematic Joint: <span className="text-cyan-400">{selectedPart.kinematicJoint}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
