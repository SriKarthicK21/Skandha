import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Sliders, 
  ArrowRight, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ConfigurableRiskEngine } from '../../services/grc/ConfigurableRiskEngine';
import { RiskMatrixDimension, GrcRisk } from '../../types/grcCoreTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';

interface ConfigurableRiskMatrixProps {
  onOpen360Drawer?: (entityId: string, entityType: string) => void;
}

export const ConfigurableRiskMatrix: React.FC<ConfigurableRiskMatrixProps> = ({ onOpen360Drawer }) => {
  const [dimension, setDimension] = useState<RiskMatrixDimension>('5x5');
  const [viewMode, setViewMode] = useState<'inherent' | 'residual'>('residual');
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);

  const matrixConfig = ConfigurableRiskEngine.getMatrixConfig(dimension);
  const risks = ConfigurableRiskEngine.getAllRisks();

  const dimSize = dimension === '5x5' ? 5 : dimension === '4x4' ? 4 : 3;

  // Filter risks in selected coordinate
  const cellRisks = selectedCell
    ? risks.filter(r => {
        const l = viewMode === 'inherent' ? r.inherentLikelihood : r.residualLikelihood;
        const i = viewMode === 'inherent' ? r.inherentImpact : r.residualImpact;
        return l === selectedCell.l && i === selectedCell.i;
      })
    : [];

  const getCellColor = (l: number, i: number) => {
    const score = l * i;
    const level = ConfigurableRiskEngine.calculateRiskLevel(score, dimension);
    switch (level) {
      case 'CRITICAL': return 'bg-rose-950/70 border-rose-600/70 text-rose-300 hover:bg-rose-900/80';
      case 'HIGH': return 'bg-orange-950/70 border-orange-600/70 text-orange-300 hover:bg-orange-900/80';
      case 'MEDIUM': return 'bg-amber-950/60 border-amber-600/60 text-amber-300 hover:bg-amber-900/80';
      case 'LOW': return 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Configurable Risk Matrix & Heatmap</h2>
              <PremiumBadge variant="warning" pulse>Version {matrixConfig.version}</PremiumBadge>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Configurable 3x3, 4x4, and 5x5 Likelihood x Impact heatmaps supporting Inherent and Residual risk calculations with treatment traceability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dimension Switcher */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center">
              {(['3x3', '4x4', '5x5'] as RiskMatrixDimension[]).map(d => (
                <button
                  key={d}
                  onClick={() => { setDimension(d); setSelectedCell(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dimension === d ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d} Matrix
                </button>
              ))}
            </div>

            {/* Inherent vs Residual Toggle */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center">
              <button
                onClick={() => setViewMode('inherent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'inherent' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inherent Risk
              </button>
              <button
                onClick={() => setViewMode('residual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'residual' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Residual Risk
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HEATMAP GRID (7 Cols) */}
        <div className="lg:col-span-7">
          <PremiumCard elevation={2}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {viewMode === 'inherent' ? 'Inherent Risk Posture (Pre-Controls)' : 'Residual Risk Posture (Post-Controls)'}
                </h3>
                <span className="text-xs text-slate-400">Click any coordinate cell to inspect risks</span>
              </div>

              {/* Matrix Layout */}
              <div className="space-y-2">
                {Array.from({ length: dimSize }, (_, rowIdx) => {
                  const likelihoodVal = dimSize - rowIdx; // 5 down to 1
                  return (
                    <div key={likelihoodVal} className="flex items-center gap-2">
                      <div className="w-20 text-[11px] font-bold text-slate-400 text-right truncate pr-2">
                        L{likelihoodVal} {matrixConfig.likelihoodLevels[likelihoodVal - 1]?.label}
                      </div>

                      <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${dimSize}, minmax(0, 1fr))` }}>
                        {Array.from({ length: dimSize }, (_, colIdx) => {
                          const impactVal = colIdx + 1; // 1 to 5
                          const count = risks.filter(r => {
                            const l = viewMode === 'inherent' ? r.inherentLikelihood : r.residualLikelihood;
                            const i = viewMode === 'inherent' ? r.inherentImpact : r.residualImpact;
                            return l === likelihoodVal && i === impactVal;
                          }).length;

                          const isSelected = selectedCell?.l === likelihoodVal && selectedCell?.i === impactVal;

                          return (
                            <button
                              key={impactVal}
                              onClick={() => setSelectedCell({ l: likelihoodVal, i: impactVal })}
                              className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${getCellColor(
                                likelihoodVal,
                                impactVal
                              )} ${isSelected ? 'ring-2 ring-white scale-105 shadow-xl z-10' : ''}`}
                            >
                              <span className="text-lg font-bold">{count}</span>
                              <span className="text-[10px] opacity-75 font-mono">Score {likelihoodVal * impactVal}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Impact Axis Labels */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-20" />
                  <div className="grid flex-1 gap-2 text-center" style={{ gridTemplateColumns: `repeat(${dimSize}, minmax(0, 1fr))` }}>
                    {Array.from({ length: dimSize }, (_, colIdx) => (
                      <div key={colIdx} className="text-[11px] font-bold text-slate-400 truncate">
                        I{colIdx + 1} {matrixConfig.impactLevels[colIdx]?.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* CELL DRILL-DOWN / SELECTED RISKS (5 Cols) */}
        <div className="lg:col-span-5">
          <PremiumCard elevation={2} className="h-full">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {selectedCell ? `Coordinate (L${selectedCell.l} × I${selectedCell.i}) Risks (${cellRisks.length})` : 'Select Heatmap Coordinate'}
                </h3>
                {selectedCell && (
                  <PremiumBadge variant="info">Score {selectedCell.l * selectedCell.i}</PremiumBadge>
                )}
              </div>

              {selectedCell ? (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {cellRisks.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">{r.riskCode}</span>
                        <PremiumBadge variant={r.residualLevel === 'CRITICAL' ? 'critical' : r.residualLevel === 'HIGH' ? 'warning' : 'success'}>
                          {r.residualLevel} RESIDUAL
                        </PremiumBadge>
                      </div>
                      <h4 className="text-xs font-bold text-white">{r.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{r.description}</p>
                      
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Treatment: <strong className="text-slate-200">{r.treatmentStrategy}</strong></span>
                        {onOpen360Drawer && (
                          <button
                            onClick={() => onOpen360Drawer(r.id, 'RISK')}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                          >
                            360° View <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {cellRisks.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No risks currently mapped to coordinate L{selectedCell.l} × I{selectedCell.i}.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Click any cell in the Likelihood × Impact grid to inspect underlying risks, assets, and mitigating controls.</p>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};
