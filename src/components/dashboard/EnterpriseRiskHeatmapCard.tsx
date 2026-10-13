import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  ShieldAlert,
  Sliders,
  ChevronRight,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MetricInfoTooltip } from '../common/Tooltip';

interface EnterpriseRiskHeatmapCardProps {
  onNavigateModule: (moduleId: string) => void;
  className?: string;
}

export const EnterpriseRiskHeatmapCard: React.FC<EnterpriseRiskHeatmapCardProps> = ({
  onNavigateModule,
  className = ''
}) => {
  const { theme, risks, currentTenant } = useGRC();
  const isLight = theme === 'light';

  const [perspective, setPerspective] = useState<'residual' | 'inherent'>('residual');
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);

  const tenantRisks = useMemo(() => {
    return risks.filter(r => !r.tenantId || r.tenantId === currentTenant?.id);
  }, [risks, currentTenant?.id]);

  // Compute 5x5 counts
  const matrixCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tenantRisks.forEach(r => {
      const l = perspective === 'residual' ? (r.residualLikelihood || 2) : (r.likelihood || 4);
      const i = perspective === 'residual' ? (r.residualImpact || 2) : (r.impact || 4);
      const key = `${l}-${i}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [tenantRisks, perspective]);

  // Distribution counts
  const riskDist = useMemo(() => {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    tenantRisks.forEach(r => {
      const score = perspective === 'residual' ? r.residualScore : r.inherentScore;
      if (score >= 17) critical += 1;
      else if (score >= 10) high += 1;
      else if (score >= 5) medium += 1;
      else low += 1;
    });

    return { critical, high, medium, low, total: tenantRisks.length };
  }, [tenantRisks, perspective]);

  return (
    <div
      id="enterprise-risk-heatmap-card"
      className={`p-5 rounded-2xl border transition-all h-full flex flex-col justify-between ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-md'
      } ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Enterprise Risk (5×5 Matrix)</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                In Appetite
              </span>
              <MetricInfoTooltip
                title="Board Risk Appetite Matrix"
                badge="Likelihood × Impact"
                content="Aggregates in-scope technical, operational, and AI governance risks across a calibrated 5x5 matrix comparing inherent exposure against mitigated residual posture."
                formula="Risk Score = Likelihood (1-5) × Impact (1-5)"
                benchmark="Appetite Threshold: Zero residual risks in Critical zone (17-25) without formal Board Sign-off."
                position="bottom"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Residual exposure vs board risk appetite for {tenantRisks.length} registered risks.
            </p>
          </div>

          {/* Perspective Toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-[11px]">
            <button
              onClick={() => {
                setPerspective('residual');
                setSelectedCell(null);
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                perspective === 'residual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Residual
            </button>
            <button
              onClick={() => {
                setPerspective('inherent');
                setSelectedCell(null);
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                perspective === 'inherent'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Inherent
            </button>
          </div>
        </div>

        {/* Risk Distribution Summary Strip */}
        <div className="grid grid-cols-4 gap-2 mt-3.5 text-center">
          <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
            <span className="text-[9px] uppercase font-bold text-rose-700 dark:text-rose-400 block">Critical</span>
            <span className="text-lg font-black font-mono text-rose-700 dark:text-rose-400">{riskDist.critical}</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400 block">High</span>
            <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-400">{riskDist.high}</span>
          </div>
          <div className="p-2 rounded-lg bg-yellow-50/70 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40">
            <span className="text-[9px] uppercase font-bold text-yellow-800 dark:text-yellow-400 block">Medium</span>
            <span className="text-lg font-black font-mono text-yellow-800 dark:text-yellow-400">{riskDist.medium}</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
            <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Low</span>
            <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">{riskDist.low}</span>
          </div>
        </div>

        {/* Interactive 5x5 Matrix Compact Grid */}
        <div className="mt-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2 text-slate-500">
            <span>Likelihood (5=High, 1=Low)</span>
            <span>Impact (1=Low, 5=Severe)</span>
          </div>

          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map(l => (
              <div key={l} className="flex items-center space-x-1">
                <span className="w-5 text-[9px] font-mono text-slate-400 text-right shrink-0">L{l}</span>
                <div className="grid grid-cols-5 gap-1 flex-1">
                  {[1, 2, 3, 4, 5].map(i => {
                    const score = l * i;
                    const key = `${l}-${i}`;
                    const count = matrixCounts[key] || 0;
                    const isSelected = selectedCell?.l === l && selectedCell?.i === i;

                    let bgClass = isLight
                      ? 'bg-emerald-100/70 text-emerald-900 border-emerald-300'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20';

                    if (score >= 17) {
                      bgClass = isLight
                        ? 'bg-rose-100/80 text-rose-900 border-rose-300'
                        : 'bg-rose-950/60 text-rose-300 border-rose-500/40';
                    } else if (score >= 10) {
                      bgClass = isLight
                        ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                        : 'bg-amber-950/50 text-amber-300 border-amber-500/30';
                    } else if (score >= 5) {
                      bgClass = isLight
                        ? 'bg-yellow-100/80 text-yellow-950 border-yellow-300'
                        : 'bg-yellow-950/40 text-yellow-200 border-yellow-500/30';
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedCell(isSelected ? null : { l, i })}
                        className={`h-7 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer flex items-center justify-center ${bgClass} ${
                          isSelected ? 'ring-2 ring-indigo-500 scale-105 z-10' : ''
                        }`}
                        title={`L:${l} × I:${i} = Score ${score} (${count} risks)`}
                      >
                        {count > 0 ? count : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          Risk Reduction Factor: <strong className="text-emerald-500">-58%</strong>
        </span>
        <button
          type="button"
          onClick={() => onNavigateModule('risk_map')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
        >
          <span>Full Risk Register</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
