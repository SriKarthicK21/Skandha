import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import * as d3 from 'd3';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Filter,
  BarChart2,
  Grid,
  Info,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Search,
  Eye,
  SlidersHorizontal,
  FileCheck2,
  Lock,
  Layers,
  HelpCircle
} from 'lucide-react';
import { ControlItem } from '../../types';

interface ISOClauseHeatmapProps {
  controls: ControlItem[];
  onSelectControl?: (ctrl: ControlItem) => void;
  onFilterChange?: (theme: string, status: string, query: string) => void;
  onRaiseNC?: (ctrl: ControlItem) => void;
}

// Domain definition for ISO 27001
interface DomainMaturityStats {
  id: string;
  name: string;
  shortCode: string;
  categoryKey: string;
  totalControls: number;
  averageMaturity: number;
  targetMaturity: number;
  lowMaturityCount: number; // < 3.0
  inProgressCount: number;
  implementedCount: number;
  auditorPriority: 'CRITICAL_FOCUS' | 'MODERATE_FOCUS' | 'COMPLIANT_EFFECTIVE';
  controls: ControlItem[];
}

export const ISOClauseHeatmap: React.FC<ISOClauseHeatmapProps> = ({
  controls,
  onSelectControl,
  onFilterChange,
  onRaiseNC
}) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'barchart' | 'domain_cards'>('matrix');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [focusFilter, setFocusFilter] = useState<'ALL' | 'AUDITOR_FOCUS' | 'IN_PROGRESS' | 'COMPLIANT'>('ALL');
  const [hoveredControl, setHoveredControl] = useState<ControlItem | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Setup D3 scale for continuous maturity color grading (Level 1 Red to Level 5 Cyan)
  const d3ColorScale = useMemo(() => {
    return d3.scaleLinear<string>()
      .domain([1, 2, 3, 4, 5])
      .range(['#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4'])
      .interpolate(d3.interpolateRgb);
  }, []);

  const getMaturityColor = (level: number = 3) => {
    return d3ColorScale(level);
  };

  const getMaturityBadge = (level: number = 3) => {
    switch (Math.round(level)) {
      case 1:
        return { label: 'L1: Initial / Non-Compliant', bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-800' };
      case 2:
        return { label: 'L2: Developing / Repeatable', bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-800' };
      case 3:
        return { label: 'L3: Defined / Compliant', bg: 'bg-yellow-950/80', text: 'text-yellow-400', border: 'border-yellow-800' };
      case 4:
        return { label: 'L4: Managed / Effective', bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-800' };
      case 5:
        return { label: 'L5: Optimizing / Automated', bg: 'bg-cyan-950/80', text: 'text-cyan-400', border: 'border-cyan-800' };
      default:
        return { label: `L${level}: Standard`, bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-700' };
    }
  };

  // Group controls by 4 ISO 27001:2022 Themes + Core ISMS Management Clauses
  const domainStats: DomainMaturityStats[] = useMemo(() => {
    const domains: { id: string; name: string; shortCode: string; categoryKey: string }[] = [
      { id: 'org', name: 'Organizational Controls (A.5)', shortCode: 'A.5', categoryKey: 'Organizational' },
      { id: 'people', name: 'People Controls (A.6)', shortCode: 'A.6', categoryKey: 'People' },
      { id: 'phys', name: 'Physical Controls (A.7)', shortCode: 'A.7', categoryKey: 'Physical' },
      { id: 'tech', name: 'Technological Controls (A.8)', shortCode: 'A.8', categoryKey: 'Technological' }
    ];

    return domains.map(dom => {
      const domControls = controls.filter(c =>
        c.category.toLowerCase().includes(dom.categoryKey.toLowerCase()) ||
        c.controlCode.startsWith(dom.shortCode)
      );

      const total = domControls.length;
      const sumMaturity = domControls.reduce((sum, c) => sum + (c.maturityLevel || 3), 0);
      const avgMaturity = total > 0 ? parseFloat((sumMaturity / total).toFixed(1)) : 3.0;

      const lowMaturityCount = domControls.filter(c => (c.maturityLevel || 3) < 3.0 || c.implementationStatus === 'Not Started').length;
      const inProgressCount = domControls.filter(c => c.implementationStatus === 'In Progress').length;
      const implementedCount = domControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited').length;

      let auditorPriority: DomainMaturityStats['auditorPriority'] = 'COMPLIANT_EFFECTIVE';
      if (avgMaturity < 3.0 || lowMaturityCount > 3) {
        auditorPriority = 'CRITICAL_FOCUS';
      } else if (avgMaturity < 3.8 || inProgressCount > 2) {
        auditorPriority = 'MODERATE_FOCUS';
      }

      return {
        ...dom,
        totalControls: total,
        averageMaturity: avgMaturity,
        targetMaturity: 4.0,
        lowMaturityCount,
        inProgressCount,
        implementedCount,
        auditorPriority,
        controls: domControls
      };
    });
  }, [controls]);

  // Overall calculations
  const overallMaturity = useMemo(() => {
    if (controls.length === 0) return 0;
    const total = controls.reduce((acc, c) => acc + (c.maturityLevel || 3), 0);
    return (total / controls.length).toFixed(1);
  }, [controls]);

  const nonCompliantCount = useMemo(() => {
    return controls.filter(c => (c.maturityLevel || 3) < 3.0 || c.implementationStatus === 'Not Started').length;
  }, [controls]);

  const inProgressTotal = useMemo(() => {
    return controls.filter(c => c.implementationStatus === 'In Progress').length;
  }, [controls]);

  // Filtered controls based on active domain, focus filter, and search
  const displayedControls = useMemo(() => {
    return controls.filter(ctrl => {
      const matchDomain = selectedDomain === 'All' ||
        ctrl.category.toLowerCase().includes(selectedDomain.toLowerCase()) ||
        ctrl.controlCode.startsWith(selectedDomain);

      let matchFocus = true;
      if (focusFilter === 'AUDITOR_FOCUS') {
        matchFocus = (ctrl.maturityLevel || 3) < 3.0 || ctrl.implementationStatus === 'Not Started' || ctrl.implementationStatus === 'In Progress';
      } else if (focusFilter === 'IN_PROGRESS') {
        matchFocus = ctrl.implementationStatus === 'In Progress';
      } else if (focusFilter === 'COMPLIANT') {
        matchFocus = (ctrl.maturityLevel || 3) >= 4.0 && (ctrl.implementationStatus === 'Implemented' || ctrl.implementationStatus === 'Audited');
      }

      const matchSearch = !searchFilter ||
        ctrl.controlCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ctrl.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ctrl.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ctrl.responsibleDepartment.toLowerCase().includes(searchFilter.toLowerCase());

      return matchDomain && matchFocus && matchSearch;
    });
  }, [controls, selectedDomain, focusFilter, searchFilter]);

  // Recharts Chart Data
  const chartData = useMemo(() => {
    return domainStats.map(d => ({
      name: d.shortCode,
      fullName: d.name,
      maturity: d.averageMaturity,
      target: d.targetMaturity,
      criticalGaps: d.lowMaturityCount,
      implemented: d.implementedCount,
      inProgress: d.inProgressCount,
      priority: d.auditorPriority
    }));
  }, [domainStats]);

  const handleApplyWorkbenchFilter = (theme: string, status: string, query: string) => {
    if (onFilterChange) {
      onFilterChange(theme, status, query);
    }
  };

  return (
    <div className="space-y-5 p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
      {/* Heatmap Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-800">
              ISO/IEC 27001:2022 Clause & Annex A
            </span>
            <span className="text-xs text-slate-400 font-mono">D3/Recharts Maturity Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>ISO Clause & Domain Maturity Heatmap</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Interactive heatmap mapping CMMI-aligned maturity levels (L1 Initial to L5 Optimizing). Rapidly identify non-compliant controls, operational gaps, and prioritize internal audit sample testing.
          </p>
        </div>

        {/* View Mode & Quick Reset */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap">
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                viewMode === 'matrix' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matrix Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('barchart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                viewMode === 'barchart' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Domain Benchmark</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('domain_cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                viewMode === 'domain_cards' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Domain Breakdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip for Auditor */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Overall ISMS Maturity</span>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">{overallMaturity}</span>
            <span className="text-xs text-slate-500 font-mono">/ 5.0 Level</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Exceeds Min Certification Bar (3.0)</span>
          </div>
        </div>

        <div
          onClick={() => {
            setFocusFilter('AUDITOR_FOCUS');
            handleApplyWorkbenchFilter('All', 'In Progress', '');
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            focusFilter === 'AUDITOR_FOCUS'
              ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-rose-500/30'
          }`}
        >
          <div className="text-[11px] text-rose-300 flex items-center justify-between">
            <span className="font-semibold">Auditor Attention Focus</span>
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-400 font-mono">{nonCompliantCount}</span>
            <span className="text-xs text-rose-300/70">Controls &lt; 3.0</span>
          </div>
          <div className="text-[10px] text-rose-300/80 font-medium">
            Click to isolate critical gaps
          </div>
        </div>

        <div
          onClick={() => {
            setFocusFilter('IN_PROGRESS');
            handleApplyWorkbenchFilter('All', 'In Progress', '');
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            focusFilter === 'IN_PROGRESS'
              ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/30'
          }`}
        >
          <div className="text-[11px] text-amber-300 flex items-center justify-between">
            <span className="font-semibold">Active Remediation</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{inProgressTotal}</span>
            <span className="text-xs text-amber-300/70">In Progress</span>
          </div>
          <div className="text-[10px] text-amber-300/80 font-medium">
            Remediation underway
          </div>
        </div>

        <div
          onClick={() => {
            setFocusFilter('COMPLIANT');
            handleApplyWorkbenchFilter('All', 'Implemented', '');
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            focusFilter === 'COMPLIANT'
              ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/30'
          }`}
        >
          <div className="text-[11px] text-emerald-300 flex items-center justify-between">
            <span className="font-semibold">Fully Effective (L4-L5)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {controls.filter(c => (c.maturityLevel || 3) >= 4).length}
            </span>
            <span className="text-xs text-emerald-300/70">Audited Controls</span>
          </div>
          <div className="text-[10px] text-emerald-300/80 font-medium">
            Operating effectively
          </div>
        </div>
      </div>

      {/* Heatmap Legend Bar */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 font-semibold text-slate-300">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>Maturity Spectrum:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            <span>L1 Initial (Non-compliant)</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>L2 Developing</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
            <span>L3 Defined (Certification Baseline)</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>L4 Managed</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
            <span>L5 Optimizing</span>
          </span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
          <span>Hover cell for audit notes • Click cell to filter workbench</span>
        </div>
      </div>

      {/* Interactive Controls Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Domain selection tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSelectedDomain('All')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              selectedDomain === 'All' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All 4 Themes ({controls.length})
          </button>
          {domainStats.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDomain(d.categoryKey)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                selectedDomain === d.categoryKey
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <span>{d.shortCode}</span>
              <span className={`text-[10px] px-1 rounded ${
                d.averageMaturity < 3.0 ? 'bg-rose-900/80 text-rose-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {d.averageMaturity}
              </span>
            </button>
          ))}
        </div>

        {/* Search bar inside heatmap */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search clause code, dept..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* VIEW 1: MATRIX GRID HEATMAP */}
      {viewMode === 'matrix' && (
        <div className="space-y-6">
          {domainStats
            .filter(d => selectedDomain === 'All' || selectedDomain === d.categoryKey)
            .map(dom => {
              const domControls = displayedControls.filter(c =>
                c.category.toLowerCase().includes(dom.categoryKey.toLowerCase()) ||
                c.controlCode.startsWith(dom.shortCode)
              );

              if (domControls.length === 0 && searchFilter) return null;

              return (
                <div key={dom.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                  {/* Domain Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                        {dom.shortCode}
                      </span>
                      <h3 className="text-sm font-bold text-white">{dom.name}</h3>
                      <span className="text-xs text-slate-400">({domControls.length} items)</span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-mono">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <span>Avg Maturity:</span>
                        <span
                          className="font-bold px-1.5 py-0.5 rounded text-[11px]"
                          style={{
                            backgroundColor: `${getMaturityColor(dom.averageMaturity)}20`,
                            color: getMaturityColor(dom.averageMaturity)
                          }}
                        >
                          {dom.averageMaturity} / 5.0
                        </span>
                      </div>
                      {dom.lowMaturityCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>{dom.lowMaturityCount} Low-Maturity Gaps</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Heatmap Grid Cells */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {domControls.map(ctrl => {
                      const maturity = ctrl.maturityLevel || (
                        ctrl.implementationStatus === 'Implemented' || ctrl.implementationStatus === 'Audited' ? 4 :
                        ctrl.implementationStatus === 'In Progress' ? 2 : 1
                      );
                      const color = getMaturityColor(maturity);
                      const isWeak = maturity < 3.0;

                      return (
                        <div
                          key={ctrl.id || ctrl.controlCode}
                          onClick={() => {
                            if (onSelectControl) onSelectControl(ctrl);
                            handleApplyWorkbenchFilter(dom.categoryKey, 'All', ctrl.controlCode);
                          }}
                          onMouseEnter={() => setHoveredControl(ctrl)}
                          onMouseLeave={() => setHoveredControl(null)}
                          style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: color
                          }}
                          className={`group relative p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                            isWeak ? 'ring-1 ring-rose-500/30' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-sky-300">
                              {ctrl.controlCode}
                            </span>
                            <span
                              className="text-[9px] font-mono font-bold px-1 rounded"
                              style={{
                                backgroundColor: `${color}25`,
                                color: color
                              }}
                            >
                              L{maturity}
                            </span>
                          </div>

                          <div className="text-[11px] font-medium text-slate-200 line-clamp-1 mt-1 group-hover:text-white" title={ctrl.title}>
                            {ctrl.title}
                          </div>

                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/60 text-[9px] text-slate-400 font-mono">
                            <span className="truncate max-w-[70px]">{ctrl.responsibleDepartment.split(' ')[0]}</span>
                            <span className={`px-1 py-0.2 rounded text-[8px] font-semibold ${
                              ctrl.implementationStatus === 'Implemented' || ctrl.implementationStatus === 'Audited'
                                ? 'text-emerald-400 bg-emerald-950/60'
                                : ctrl.implementationStatus === 'In Progress'
                                ? 'text-amber-400 bg-amber-950/60'
                                : 'text-rose-400 bg-rose-950/60'
                            }`}>
                              {ctrl.implementationStatus === 'Implemented' ? 'PASS' : ctrl.implementationStatus === 'In Progress' ? 'WIP' : 'GAP'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* VIEW 2: RECHARTS BENCHMARK BAR CHART */}
      {viewMode === 'barchart' && (
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Domain Maturity vs ISO 27001 Certification Benchmark</h3>
              <p className="text-xs text-slate-400">
                Benchmark line at 3.0 indicates minimum standard for external audit certification. Target is Level 4 (Managed & Effective).
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Compliant (&gt;=3.0)</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                <span>Critical Gap (&lt;3.0)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="fullName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={11} tickCount={6} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1.5">
                          <div className="font-bold text-white">{data.fullName}</div>
                          <div className="text-sky-400 font-mono">Maturity Score: {data.maturity} / 5.0</div>
                          <div className="text-slate-300">Implemented: {data.implemented} controls</div>
                          <div className="text-amber-300">In-Progress: {data.inProgress} controls</div>
                          <div className="text-rose-400">Low-Maturity Gaps: {data.criticalGaps} controls</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={3.0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Certification Pass Bar (3.0)', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                <ReferenceLine y={4.0} stroke="#10b981" strokeDasharray="2 2" label={{ value: 'Target Maturity (4.0)', fill: '#10b981', fontSize: 10, position: 'top' }} />
                <Bar dataKey="maturity" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.maturity >= 3.5 ? '#10b981' : entry.maturity >= 3.0 ? '#eab308' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 3: DOMAIN BREAKDOWN CARDS */}
      {viewMode === 'domain_cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainStats.map(dom => (
            <div key={dom.id} className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                    {dom.shortCode}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{dom.name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-white">
                    {dom.averageMaturity}
                    <span className="text-xs text-slate-500 font-normal"> / 5.0</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dom.auditorPriority === 'CRITICAL_FOCUS'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : dom.auditorPriority === 'MODERATE_FOCUS'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {dom.auditorPriority === 'CRITICAL_FOCUS' ? 'Priority Audit Focus' : dom.auditorPriority === 'MODERATE_FOCUS' ? 'Monitoring' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Maturity Progress</span>
                  <span>{Math.round((dom.averageMaturity / 5) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(dom.averageMaturity / 5) * 100}%`,
                      backgroundColor: getMaturityColor(dom.averageMaturity)
                    }}
                  />
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Implemented</div>
                  <div className="text-emerald-400 font-bold font-mono text-sm">{dom.implementedCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">In Progress</div>
                  <div className="text-amber-400 font-bold font-mono text-sm">{dom.inProgressCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Critical Gaps</div>
                  <div className="text-rose-400 font-bold font-mono text-sm">{dom.lowMaturityCount}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplyWorkbenchFilter(dom.categoryKey, 'All', '')}
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Filter Workbench to {dom.shortCode}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hovered Control Inspection Overlay Banner */}
      {hoveredControl && (
        <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/50 shadow-2xl animate-in fade-in duration-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono text-xs font-bold">
                {hoveredControl.controlCode}
              </span>
              <span className="text-xs font-bold text-white">{hoveredControl.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${getMaturityBadge(hoveredControl.maturityLevel || 3).bg} ${getMaturityBadge(hoveredControl.maturityLevel || 3).text} border ${getMaturityBadge(hoveredControl.maturityLevel || 3).border}`}>
                {getMaturityBadge(hoveredControl.maturityLevel || 3).label}
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">{hoveredControl.description}</p>
            <div className="text-[11px] text-slate-400 flex items-center space-x-4">
              <span>Dept: <strong className="text-slate-200">{hoveredControl.responsibleDepartment}</strong></span>
              <span>Status: <strong className="text-slate-200">{hoveredControl.implementationStatus}</strong></span>
              {hoveredControl.acceptanceCriteria && (
                <span>Criteria: <strong className="text-slate-300">{hoveredControl.acceptanceCriteria}</strong></span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onRaiseNC && (hoveredControl.maturityLevel || 3) < 3.5 && (
              <button
                type="button"
                onClick={() => onRaiseNC(hoveredControl)}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Raise NC / CAPA</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onSelectControl) onSelectControl(hoveredControl);
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-sky-900/30"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Evaluate Control</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
