import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  Filter,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  ChevronRight,
  Lock
} from 'lucide-react';
import { ISO27701Control } from '../../data/iso27701MasterData';
import { ScopingPreset } from './ISO27701SoAWorkbench';

interface PIMSProgressGaugesProps {
  controls: ISO27701Control[];
  activeRoleFilter: 'ALL' | 'CONTROLLER' | 'PROCESSOR';
  onSelectRoleFilter: (role: 'ALL' | 'CONTROLLER' | 'PROCESSOR') => void;
  scopingPreset: ScopingPreset;
  theme: string;
}

type GaugeDisplayMode = 'PROGRESS_ARC' | 'SEGMENTED_STATUS';

export const PIMSProgressGauges: React.FC<PIMSProgressGaugesProps> = ({
  controls,
  activeRoleFilter,
  onSelectRoleFilter,
  scopingPreset,
  theme
}) => {
  const [displayMode, setDisplayMode] = useState<GaugeDisplayMode>('PROGRESS_ARC');

  // 1. Annex A Metrics (31 Controls: §7.2 - §7.5)
  const annexAMetrics = useMemo(() => {
    const list = controls.filter(c => c.annex === 'Annex A');
    const total = list.length || 31;
    const implemented = list.filter(c => c.implementationStatus === 'Implemented').length;
    const partial = list.filter(c => c.implementationStatus === 'Partially Implemented').length;
    const excluded = list.filter(c => c.implementationStatus === 'Not Applicable').length;
    const remaining = Math.max(0, total - implemented - partial - excluded);
    const applicable = list.filter(c => c.applicable).length;
    const percent = total > 0 ? Math.round((implemented / total) * 100) : 0;
    const applicablePercent = applicable > 0 ? Math.round((implemented / applicable) * 100) : 0;

    return { total, implemented, partial, excluded, remaining, applicable, percent, applicablePercent };
  }, [controls]);

  // 2. Annex B Metrics (18 Controls: §8.2 - §8.5)
  const annexBMetrics = useMemo(() => {
    const list = controls.filter(c => c.annex === 'Annex B');
    const total = list.length || 18;
    const implemented = list.filter(c => c.implementationStatus === 'Implemented').length;
    const partial = list.filter(c => c.implementationStatus === 'Partially Implemented').length;
    const excluded = list.filter(c => c.implementationStatus === 'Not Applicable').length;
    const remaining = Math.max(0, total - implemented - partial - excluded);
    const applicable = list.filter(c => c.applicable).length;
    const percent = total > 0 ? Math.round((implemented / total) * 100) : 0;
    const applicablePercent = applicable > 0 ? Math.round((implemented / applicable) * 100) : 0;

    return { total, implemented, partial, excluded, remaining, applicable, percent, applicablePercent };
  }, [controls]);

  // 3. Combined Overall Posture (49 Controls)
  const overallMetrics = useMemo(() => {
    const total = controls.length || 49;
    const implemented = controls.filter(c => c.implementationStatus === 'Implemented').length;
    const partial = controls.filter(c => c.implementationStatus === 'Partially Implemented').length;
    const excluded = controls.filter(c => c.implementationStatus === 'Not Applicable').length;
    const remaining = Math.max(0, total - implemented - partial - excluded);
    const applicable = controls.filter(c => c.applicable).length;
    const percent = total > 0 ? Math.round((implemented / total) * 100) : 0;
    const applicablePercent = applicable > 0 ? Math.round((implemented / applicable) * 100) : 0;

    return { total, implemented, partial, excluded, remaining, applicable, percent, applicablePercent };
  }, [controls]);

  const isDark = theme !== 'light';
  const trackColor = isDark ? '#1e293b' : '#e2e8f0'; // slate-800 : slate-200

  // Chart Data Generator
  const getChartData = (implemented: number, partial: number, excluded: number, total: number) => {
    if (displayMode === 'PROGRESS_ARC') {
      const remaining = Math.max(0, total - implemented);
      return [
        { name: 'Implemented', value: implemented, color: '#10b981' },
        { name: 'Remaining Controls', value: remaining, color: trackColor }
      ];
    } else {
      const data = [
        { name: 'Implemented', value: implemented, color: '#10b981' },
        { name: 'In Progress', value: partial, color: '#f59e0b' },
        { name: 'Not Applicable', value: excluded, color: '#6366f1' }
      ];
      const gap = Math.max(0, total - implemented - partial - excluded);
      if (gap > 0) {
        data.push({ name: 'Unassigned Gap', value: gap, color: trackColor });
      }
      return data;
    }
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="px-3 py-2 rounded-xl bg-slate-950/95 text-white border border-slate-700/80 shadow-2xl text-xs backdrop-blur-md z-50">
          <div className="flex items-center space-x-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-200">{item.name}:</span>
            <span className="font-mono font-bold text-white">{item.value} controls</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-2xl border shadow-lg overflow-hidden transition-all duration-200 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-slate-100'
      }`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                PIMS Control Implementation Posture
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                ISO/IEC 27701:2019
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Circular progress indicators visualizing implementation percentage across Annex A (PII Controllers) and Annex B (PII Processors)
            </p>
          </div>
        </div>

        {/* Display Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setDisplayMode('PROGRESS_ARC')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                displayMode === 'PROGRESS_ARC'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Progress Arc
            </button>
            <button
              onClick={() => setDisplayMode('SEGMENTED_STATUS')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                displayMode === 'SEGMENTED_STATUS'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Status Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Tri-Gauge Circular Progress Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800">
        
        {/* 1. Annex A Circular Gauge (PII Controllers - 31 Controls) */}
        <div className={`flex flex-col items-center justify-between p-3 rounded-xl transition ${
          activeRoleFilter === 'CONTROLLER' ? 'ring-2 ring-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
        }`}>
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Annex A (Controllers)
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              §7.2–7.5 • 31 Controls
            </span>
          </div>

          {/* Recharts Circular Gauge */}
          <div className="relative w-40 h-40 my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getChartData(annexAMetrics.implemented, annexAMetrics.partial, annexAMetrics.excluded, annexAMetrics.total)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {getChartData(annexAMetrics.implemented, annexAMetrics.partial, annexAMetrics.excluded, annexAMetrics.total).map((entry, index) => (
                    <Cell key={`annex-a-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-2xl font-black font-mono tracking-tight text-indigo-600 dark:text-indigo-400">
                {annexAMetrics.percent}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {annexAMetrics.implemented} / {annexAMetrics.total}
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="w-full mt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 font-mono">
              <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{annexAMetrics.implemented} Implemented</span>
              </span>
              <span className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                <span>{annexAMetrics.partial} Partial</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                <X className="w-3 h-3" />
                <span>{annexAMetrics.excluded} N/A</span>
              </span>
            </div>

            <button
              onClick={() => onSelectRoleFilter(activeRoleFilter === 'CONTROLLER' ? 'ALL' : 'CONTROLLER')}
              className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                activeRoleFilter === 'CONTROLLER'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{activeRoleFilter === 'CONTROLLER' ? 'Showing Annex A (Click to Clear)' : 'Filter Annex A Controls'}</span>
            </button>
          </div>
        </div>

        {/* 2. Combined Overall Progress Gauge (Annex A + Annex B - 49 Controls) */}
        <div className={`flex flex-col items-center justify-between p-3 rounded-xl transition pt-6 md:pt-3 ${
          activeRoleFilter === 'ALL' ? 'ring-2 ring-emerald-500/40 bg-emerald-50/15 dark:bg-emerald-950/20' : ''
        }`}>
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Overall PIMS Posture
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
              49 Total Controls
            </span>
          </div>

          {/* Recharts Circular Gauge - Slightly Accentuated */}
          <div className="relative w-44 h-44 my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getChartData(overallMetrics.implemented, overallMetrics.partial, overallMetrics.excluded, overallMetrics.total)}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={74}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {getChartData(overallMetrics.implemented, overallMetrics.partial, overallMetrics.excluded, overallMetrics.total).map((entry, index) => (
                    <Cell key={`overall-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {overallMetrics.percent}%
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                {overallMetrics.implemented} / {overallMetrics.total} Total
              </span>
              <span className="text-[9px] font-mono text-emerald-500 mt-0.5">
                {overallMetrics.percent >= 85 ? 'Stage 2 Ready' : 'Remediation Active'}
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="w-full mt-2 space-y-2">
            <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 font-mono">
              <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{overallMetrics.implemented} Impl.</span>
              </span>
              <span className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Clock className="w-3 h-3" />
                <span>{overallMetrics.partial} Partial</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-bold">
                <X className="w-3 h-3" />
                <span>{overallMetrics.excluded} Excl.</span>
              </span>
            </div>

            <button
              onClick={() => onSelectRoleFilter('ALL')}
              className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                activeRoleFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Show Complete SoA Matrix (49)</span>
            </button>
          </div>
        </div>

        {/* 3. Annex B Circular Gauge (PII Processors - 18 Controls) */}
        <div className={`flex flex-col items-center justify-between p-3 rounded-xl transition pt-6 md:pt-3 ${
          activeRoleFilter === 'PROCESSOR' ? 'ring-2 ring-purple-500/50 bg-purple-50/20 dark:bg-purple-950/20' : ''
        }`}>
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Annex B (Processors)
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              §8.2–8.5 • 18 Controls
            </span>
          </div>

          {/* Recharts Circular Gauge */}
          <div className="relative w-40 h-40 my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getChartData(annexBMetrics.implemented, annexBMetrics.partial, annexBMetrics.excluded, annexBMetrics.total)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {getChartData(annexBMetrics.implemented, annexBMetrics.partial, annexBMetrics.excluded, annexBMetrics.total).map((entry, index) => (
                    <Cell key={`annex-b-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-2xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
                {annexBMetrics.percent}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {annexBMetrics.implemented} / {annexBMetrics.total}
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="w-full mt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 font-mono">
              <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{annexBMetrics.implemented} Implemented</span>
              </span>
              <span className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                <span>{annexBMetrics.partial} Partial</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                <X className="w-3 h-3" />
                <span>{annexBMetrics.excluded} N/A</span>
              </span>
            </div>

            <button
              onClick={() => onSelectRoleFilter(activeRoleFilter === 'PROCESSOR' ? 'ALL' : 'PROCESSOR')}
              className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                activeRoleFilter === 'PROCESSOR'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{activeRoleFilter === 'PROCESSOR' ? 'Showing Annex B (Click to Clear)' : 'Filter Annex B Controls'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Status Ribbon & Auditor Assurance Callout */}
      <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Implemented ({overallMetrics.implemented})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Remediation In Progress ({overallMetrics.partial})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Statutory Exclusions ({overallMetrics.excluded})</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="text-slate-400">Scoping Active:</span>
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
            {scopingPreset === 'BOTH' ? 'Dual-Role (Annex A & B)' : scopingPreset === 'CONTROLLER_ONLY' ? 'Controller Primary' : 'Processor Primary'}
          </span>
        </div>
      </div>
    </div>
  );
};
