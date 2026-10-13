import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MetricInfoTooltip } from '../common/Tooltip';

interface ControlEffectivenessCardProps {
  onNavigateModule: (moduleId: string) => void;
  className?: string;
}

export const ControlEffectivenessCard: React.FC<ControlEffectivenessCardProps> = ({
  onNavigateModule,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  const controlDomains = [
    { name: 'Organizational (Annex A.5)', tested: 37, passed: 36, rate: 97.3, status: 'Optimal' },
    { name: 'People Controls (Annex A.6)', tested: 8, passed: 8, rate: 100.0, status: 'Optimal' },
    { name: 'Physical Controls (Annex A.7)', tested: 14, passed: 13, rate: 92.8, status: 'Healthy' },
    { name: 'Technological (Annex A.8)', tested: 34, passed: 32, rate: 94.1, status: 'Healthy' }
  ];

  return (
    <div
      id="control-effectiveness-card"
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
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Control Effectiveness</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Operating 95.2%
              </span>
              <MetricInfoTooltip
                title="Continuous Control Evaluation"
                badge="ISO 27001 & SOC 2"
                content="Evaluates the operational effectiveness and test pass rate across all 93 Annex A control baselines based on continuous automated telemetry and manual auditor walkthroughs."
                formula="(Tested Controls Operating Effectively / Total In-Scope Controls) × 100"
                benchmark="Auditor Standard: ≥ 95% pass rate required for unqualified SOC 2 Type II and ISO 27001 certification."
                position="bottom"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous operational testing across all 93 Annex A control baselines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateModule('iso27001_controls')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Controls Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-black font-mono text-slate-950 dark:text-white">
              95.2%
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Overall Pass Rate</span>
              <span className="text-[11px] text-slate-500 font-mono">89 / 93 controls operating effectively</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+3.1% this quarter</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">4 undergoing CAPA</span>
          </div>
        </div>

        {/* Domain Progress List */}
        <div className="space-y-2.5 mt-3.5">
          {controlDomains.map(domain => (
            <div
              key={domain.name}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{domain.name}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{domain.rate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${domain.rate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>{domain.passed} of {domain.tested} verified</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{domain.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          Last automated control test: <strong>14m ago</strong>
        </span>
        <button
          type="button"
          onClick={() => onNavigateModule('control_lineage_graph')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
        >
          <span>Control Lineage Graph</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
