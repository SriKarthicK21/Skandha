import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';
import {
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Filter,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Search,
  ArrowUpDown,
  FileText,
  ListTodo,
  UserCheck
} from 'lucide-react';
import { ControlItem } from '../../types';
import {
  PerformanceStatus,
  PERFORMANCE_STATUS_CONFIG,
  calculateControlPerformance,
  getControlPerformanceStatus
} from '../../utils/soaPerformanceHelper';
import { ISO27001_2022_93_MASTER } from '../../data/iso27001_2022_masterControls';

interface ControlPerformanceDashboardProps {
  controls: ControlItem[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onOpenWorkflowModal?: (control: ControlItem) => void;
  onOpenRemediationDrawer?: (control: ControlItem) => void;
  onUpdateControlStatus?: (controlId: string, newStatus: ControlItem['implementationStatus']) => void;
}

export const ControlPerformanceDashboard: React.FC<ControlPerformanceDashboardProps> = ({
  controls,
  activeStatusFilter,
  onSelectStatusFilter,
  onOpenWorkflowModal,
  onOpenRemediationDrawer,
  onUpdateControlStatus
}) => {
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [inspectorSearch, setInspectorSearch] = useState<string>('');
  const [hoveredSlice, setHoveredSlice] = useState<PerformanceStatus | null>(null);

  // Compute performance metrics
  const summary = useMemo(() => {
    return calculateControlPerformance(controls);
  }, [controls]);

  // Controls scoped to active status filter for inspector
  const inspectorControls = useMemo(() => {
    // Filter for ISO 27001 controls
    const iso27001List = controls.filter(
      c => (!c.framework || c.framework.includes('27001')) && !c.framework?.includes('42001')
    );
    const baseList = iso27001List.length > 0 ? iso27001List : controls;

    return baseList.filter(ctrl => {
      const perfStatus = getControlPerformanceStatus(ctrl.implementationStatus);
      const matchesStatus =
        activeStatusFilter === 'All' ||
        activeStatusFilter === perfStatus ||
        (activeStatusFilter === 'Implemented' && perfStatus === 'Implemented') ||
        (activeStatusFilter === 'Partially Implemented' && perfStatus === 'Partially Implemented') ||
        (activeStatusFilter === 'Planned' && perfStatus === 'Planned');

      const matchesSearch =
        !inspectorSearch.trim() ||
        ctrl.controlCode.toLowerCase().includes(inspectorSearch.toLowerCase()) ||
        ctrl.title.toLowerCase().includes(inspectorSearch.toLowerCase()) ||
        ctrl.category.toLowerCase().includes(inspectorSearch.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [controls, activeStatusFilter, inspectorSearch]);

  // Handle slice click on doughnut chart
  const handleSliceClick = (entry: any) => {
    const name = entry?.name;
    if (name) {
      if (activeStatusFilter === name) {
        onSelectStatusFilter('All');
      } else {
        onSelectStatusFilter(name);
      }
    }
  };

  // Custom Tooltip for Recharts Doughnut
  const CustomDoughnutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const config = PERFORMANCE_STATUS_CONFIG[data.name as PerformanceStatus];

      return (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-700/80 shadow-2xl text-xs backdrop-blur-md z-50 min-w-[200px]">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="font-bold text-white">{data.name}</span>
            </div>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
              style={{
                backgroundColor: `${data.color}20`,
                color: data.color
              }}
            >
              {data.percent}%
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Total Controls:</span>
              <span className="font-mono font-bold text-white">
                {data.value} / {summary.totalControls}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug pt-1">
              {config.description}
            </p>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Click to filter table</span>
            <span className="text-indigo-400">→</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="control-performance-dashboard-container"
      className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-6"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shadow-inner">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Control Performance Dashboard
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                ISO/IEC 27001:2022
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                93 Controls
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live implementation status visualization (Implemented, Partially Implemented, Planned) across all Annex A themes.
            </p>
          </div>
        </div>

        {/* Action / Filter Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {activeStatusFilter !== 'All' && (
            <button
              id="clear-status-filter-btn"
              onClick={() => onSelectStatusFilter('All')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shadow-sm"
              title="Reset status filter to view all 93 controls"
            >
              <XCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtering: <strong className="text-white">{activeStatusFilter}</strong> (Reset)</span>
            </button>
          )}

          <button
            id="toggle-quick-inspector-btn"
            onClick={() => setShowInspector(!showInspector)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              showInspector
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/50'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Quick Control Inspector</span>
            {showInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Main Visual Section: Progress Doughnut Chart + 3 Status Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Doughnut Chart Canvas (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 self-start flex items-center justify-between w-full">
            <span>Implementation Progress Doughnut</span>
            <span className="text-[10px] text-slate-500 font-mono">Interactive (Click Slice)</span>
          </div>

          {/* Recharts Circular Doughnut with Entry Transition Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-56 h-56 my-1"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip content={<CustomDoughnutTooltip />} />
                <Pie
                  data={summary.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={handleSliceClick}
                  cursor="pointer"
                  isAnimationActive={true}
                  animationBegin={100}
                  animationDuration={1100}
                  animationEasing="ease-out"
                >
                  {summary.chartData.map((entry) => {
                    const isSelected = activeStatusFilter === entry.name;
                    return (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        stroke={isSelected ? '#ffffff' : '#0f172a'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="transition-all duration-300 hover:opacity-90 cursor-pointer outline-none"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Typography Display with Entrance Fade and Scale Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2"
            >
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {summary.implementedPercent}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mt-0.5">
                Implemented
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                {summary.implementedCount} / {summary.totalControls} Controls
              </span>
            </motion.div>
          </motion.div>

          {/* Interactive Legend Pills Below Chart */}
          <div className="grid grid-cols-3 gap-1.5 w-full mt-3 pt-3 border-t border-slate-800/80">
            {summary.chartData.map(slice => {
              const isSelected = activeStatusFilter === slice.name;
              return (
                <button
                  key={slice.name}
                  id={`doughnut-legend-${slice.name.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => onSelectStatusFilter(isSelected ? 'All' : slice.name)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-white/60 ring-1 ring-white/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-[10px] font-bold text-slate-300 truncate">
                      {slice.name === 'Partially Implemented' ? 'Partial' : slice.name}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    {slice.value} <span className="text-[10px] text-slate-400 font-normal">({slice.percent}%)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Status Cards (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Implementation Status Breakdown (Click Card to Filter SoA Hub)</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Audit Target: ≥75% ({summary.targetMet ? 'Met' : 'Pending'})
            </span>
          </div>

          {/* CARD 1: IMPLEMENTED */}
          <div
            id="status-card-implemented"
            onClick={() => onSelectStatusFilter(activeStatusFilter === 'Implemented' ? 'All' : 'Implemented')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              activeStatusFilter === 'Implemented'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 shadow-lg shadow-emerald-950/30'
                : 'bg-slate-900/90 border-slate-800 hover:border-emerald-700/60 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Implemented</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                      Audit-Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Fully operational, monitored, or formally auditor-verified safeguards with documented operational evidence.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {summary.implementedCount}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {summary.implementedPercent}% of 93
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${summary.implementedPercent}%` }}
              />
            </div>
          </div>

          {/* CARD 2: PARTIALLY IMPLEMENTED */}
          <div
            id="status-card-partially-implemented"
            onClick={() =>
              onSelectStatusFilter(
                activeStatusFilter === 'Partially Implemented' ? 'All' : 'Partially Implemented'
              )
            }
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              activeStatusFilter === 'Partially Implemented'
                ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500 shadow-lg shadow-amber-950/30'
                : 'bg-slate-900/90 border-slate-800 hover:border-amber-700/60 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Partially Implemented</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-amber-950/80 text-amber-300 border border-amber-800">
                      In Progress
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Active technical remediation or phased organizational rollout underway to address identified audit gaps.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black font-mono text-amber-400">
                  {summary.partiallyImplementedCount}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {summary.partiallyImplementedPercent}% of 93
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${summary.partiallyImplementedPercent}%` }}
              />
            </div>
          </div>

          {/* CARD 3: PLANNED */}
          <div
            id="status-card-planned"
            onClick={() => onSelectStatusFilter(activeStatusFilter === 'Planned' ? 'All' : 'Planned')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              activeStatusFilter === 'Planned'
                ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-950/30'
                : 'bg-slate-900/90 border-slate-800 hover:border-indigo-700/60 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Planned</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                      Roadmapped
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Scheduled on the multi-quarter compliance roadmap or formally excluded with defensible Clause 6.1.3 rationales.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black font-mono text-indigo-400">
                  {summary.plannedCount}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {summary.plannedPercent}% of 93
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${summary.plannedPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Theme Performance Matrix: 4 Annex A Themes Breakdown */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Theme Implementation Status Distribution</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Annex A.5 Organizational • A.6 People • A.7 Physical • A.8 Technological
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {summary.themeBreakdowns.map(theme => (
            <div
              key={theme.themeKey}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  {theme.clause}
                </span>
                <span className="text-xs font-bold font-mono text-white">
                  {theme.completionRate}%
                </span>
              </div>

              <div className="text-xs font-bold text-white mb-2 truncate">
                {theme.themeKey} ({theme.total})
              </div>

              {/* Stacked segmented bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 flex overflow-hidden mb-2">
                <div
                  title={`Implemented: ${theme.implemented}`}
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${theme.total > 0 ? (theme.implemented / theme.total) * 100 : 0}%`
                  }}
                />
                <div
                  title={`Partially Implemented: ${theme.partiallyImplemented}`}
                  className="bg-amber-500 h-full transition-all"
                  style={{
                    width: `${theme.total > 0 ? (theme.partiallyImplemented / theme.total) * 100 : 0}%`
                  }}
                />
                <div
                  title={`Planned: ${theme.planned}`}
                  className="bg-indigo-500 h-full transition-all"
                  style={{
                    width: `${theme.total > 0 ? (theme.planned / theme.total) * 100 : 0}%`
                  }}
                />
              </div>

              {/* Status breakdown numbers */}
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400">
                <span className="text-emerald-400">{theme.implemented} Imp</span>
                <span className="text-amber-400">{theme.partiallyImplemented} Partial</span>
                <span className="text-indigo-400">{theme.planned} Plan</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Expandable Quick Control Inspector / Status Updater */}
      {showInspector && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Controls Matching Status:
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {activeStatusFilter === 'All' ? 'All Statuses' : activeStatusFilter} ({inspectorControls.length} Controls)
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inspectorSearch}
                onChange={e => setInspectorSearch(e.target.value)}
                placeholder="Filter by code or title..."
                className="w-full pl-8 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-900 border border-slate-800/80 rounded-xl bg-slate-900/40">
            {inspectorControls.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No controls match this status filter.
              </div>
            ) : (
              inspectorControls.map(ctrl => {
                const perfStatus = getControlPerformanceStatus(ctrl.implementationStatus);
                const config = PERFORMANCE_STATUS_CONFIG[perfStatus];

                return (
                  <div
                    key={ctrl.id}
                    className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/80 transition"
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded shrink-0">
                        {ctrl.controlCode}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {ctrl.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>{ctrl.category}</span>
                          <span>•</span>
                          <span className={ctrl.applicable ? 'text-emerald-400' : 'text-amber-400'}>
                            {ctrl.applicable ? 'In-Scope' : 'Excluded'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      {/* Fast status switcher */}
                      {onUpdateControlStatus ? (
                        <select
                          value={ctrl.implementationStatus}
                          onChange={e =>
                            onUpdateControlStatus(
                              ctrl.id,
                              e.target.value as ControlItem['implementationStatus']
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Implemented">Implemented</option>
                          <option value="In Progress">Partially Implemented (In Progress)</option>
                          <option value="Not Started">Planned (Not Started)</option>
                          <option value="Monitored">Monitored</option>
                          <option value="Audited">Audited</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${config.badgeClass}`}
                        >
                          {perfStatus}
                        </span>
                      )}

                      {onOpenRemediationDrawer && (
                        <button
                          type="button"
                          onClick={() => onOpenRemediationDrawer(ctrl)}
                          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-800 text-[11px] font-semibold transition"
                          title="Open Remediation Planning, Notes & Owner Drawer"
                        >
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          <span>Remediate</span>
                        </button>
                      )}

                      {onOpenWorkflowModal && (
                        <button
                          type="button"
                          onClick={() => onOpenWorkflowModal(ctrl)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Open SoA Justification and Evidence Workflow Modal"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
