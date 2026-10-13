// Skanda GRC — Interactive Multi-Dimensional Compliance Heatmap View
// Visually represents risk coverage across Departments, ISO 27001 Clauses, and MAS TRM Modules
// Features:
// - Color-coded intensity scale (Red=Non-compliant, Yellow=In Progress, Green=Compliant)
// - 4 Dimension pivots: Departments x ISO, Departments x MAS, ISO x MAS Crosswalk, Composite Heatmap
// - Interactive cell click to open deep-dive inspection modal & live status override
// - Department & status filter shortcuts, search, CSV export, and KPI ribbon

import React, { useState, useMemo } from 'react';
import {
  Grid,
  Layers,
  Building,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Download,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertOctagon,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  ArrowUpDown,
  BookOpen,
  Sliders,
  Flame,
  Zap,
  Shield,
  FileText
} from 'lucide-react';
import {
  HeatmapCellData,
  HeatmapStatus,
  RiskSeverityLevel,
  CrosswalkCellData,
  HEATMAP_DEPARTMENTS,
  HEATMAP_ISO_CLAUSES,
  HEATMAP_MAS_MODULES,
  HEATMAP_PIMS_CLAUSES,
  ISOClauseInherentRisk,
  ComplianceHeatmapService
} from '../../services/complianceHeatmapService';
import { ComplianceHeatmapDetailModal } from './ComplianceHeatmapDetailModal';
import { ISOInherentRiskConfigModal } from './ISOInherentRiskConfigModal';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { safeConfirm } from '../../utils/safeConfirm';

interface ComplianceHeatmapViewProps {
  onNavigateModule?: (moduleId: string) => void;
  onSwitchViewMode?: (mode: 'executive' | 'operational' | 'heatmap') => void;
}

export type HeatmapDimensionMode =
  | 'tri_dimensional'
  | 'dept_vs_iso'
  | 'dept_vs_mas'
  | 'dept_vs_pims'
  | 'iso_vs_mas_crosswalk'
  | 'department_composite';

// Representative subset for Unified Tri-Matrix View
const TRI_ISO_COLUMNS = [
  { code: 'Clause 4', shortTitle: 'Cl. 4 Context', title: 'Context of Organization & ISMS Scope' },
  { code: 'Clause 5', shortTitle: 'Cl. 5 Leadership', title: 'Leadership, Commitment & Policy' },
  { code: 'Clause 6', shortTitle: 'Cl. 6 Planning', title: 'Planning, Risk Assessment & Treatment' },
  { code: 'Clause 8', shortTitle: 'Cl. 8 Operations', title: 'Operation & Control Execution' },
  { code: 'Annex A.5', shortTitle: 'A.5 Org Controls', title: 'Organizational Controls' },
  { code: 'Annex A.6', shortTitle: 'A.6 People', title: 'People Controls' },
  { code: 'Annex A.8', shortTitle: 'A.8 Tech Controls', title: 'Technological Controls' }
];

const TRI_MAS_COLUMNS = [
  { code: 'DOM-03', shortTitle: '3.0 Governance', title: 'Technology Risk Governance' },
  { code: 'DOM-04', shortTitle: '4.0 Risk Framework', title: 'Technology Risk Management Framework' },
  { code: 'DOM-06', shortTitle: '6.0 Access Control', title: 'Access Control & Privileged Identity' },
  { code: 'DOM-08', shortTitle: '8.0 Cyber Threat', title: 'Cyber Threat Intelligence & Defense' },
  { code: 'DOM-10', shortTitle: '10.0 Incident Mgmt', title: 'IT Incident Management & Forensics' },
  { code: 'DOM-14', shortTitle: '14.0 Cloud/Third-Party', title: 'Cloud Computing & Third-Party Outsourcing' }
];

export const ComplianceHeatmapView: React.FC<ComplianceHeatmapViewProps> = ({
  onNavigateModule,
  onSwitchViewMode
}) => {
  const { theme, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  // State: default to the unified tri-dimensional risk coverage view
  const [dimensionMode, setDimensionMode] = useState<HeatmapDimensionMode>('tri_dimensional');
  const [cells, setCells] = useState<HeatmapCellData[]>(() => ComplianceHeatmapService.getAllCells());
  const [selectedCell, setSelectedCell] = useState<HeatmapCellData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{ deptId: string; targetCode: string } | null>(null);

  // Hover detection helpers for row and column highlighting
  const isColHovered = (colCode: string) => hoveredCell?.targetCode === colCode;
  const isRowHovered = (deptId: string) => hoveredCell?.deptId === deptId;

  // Inherent Risk Weighting & Visual Intensity State
  const [isInherentRiskWeighted, setIsInherentRiskWeighted] = useState<boolean>(true);
  const [isRiskConfigModalOpen, setIsRiskConfigModalOpen] = useState<boolean>(false);
  const [inherentRisks, setInherentRisks] = useState<Record<string, ISOClauseInherentRisk>>(() =>
    ComplianceHeatmapService.getISOInherentRisks()
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | HeatmapStatus>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [densityMode, setDensityMode] = useState<'compact' | 'detailed'>('detailed');
  const [highlightWeakGapsOnly, setHighlightWeakGapsOnly] = useState<boolean>(false);

  // Check if any non-default filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      statusFilter !== 'ALL' ||
      departmentFilter !== 'ALL' ||
      searchQuery.trim() !== '' ||
      highlightWeakGapsOnly
    );
  }, [statusFilter, departmentFilter, searchQuery, highlightWeakGapsOnly]);

  // Reset all active filters to default
  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setSearchQuery('');
    setHighlightWeakGapsOnly(false);
    setSelectedCell(null);
    setHoveredCell(null);
    showToast({
      title: 'Filters Cleared',
      message: 'All active filters reset. Showing full compliance heatmap dataset.',
      type: 'info'
    });
  };

  // Crosswalk data
  const crosswalkData = useMemo(() => ComplianceHeatmapService.getCrosswalkMatrix(), []);

  // Filtered cells according to active dimension
  const activeCells = useMemo(() => {
    let list = cells;
    if (dimensionMode === 'dept_vs_iso') {
      list = cells.filter(c => c.dimensionType === 'ISO_27001');
    } else if (dimensionMode === 'dept_vs_mas') {
      list = cells.filter(c => c.dimensionType === 'MAS_TRM');
    } else if (dimensionMode === 'dept_vs_pims') {
      list = cells.filter(c => c.dimensionType === 'ISO_27701');
    }

    if (departmentFilter !== 'ALL') {
      list = list.filter(c => c.departmentId === departmentFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(c => c.status === statusFilter);
    }

    if (highlightWeakGapsOnly) {
      list = list.filter(c => c.status === 'NON_COMPLIANT' || c.score < 50);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.departmentName.toLowerCase().includes(q) ||
          c.targetCode.toLowerCase().includes(q) ||
          c.targetTitle.toLowerCase().includes(q)
      );
    }

    return list;
  }, [cells, dimensionMode, departmentFilter, statusFilter, highlightWeakGapsOnly, searchQuery]);

  // Overall metrics
  const metrics = useMemo(() => {
    const relevantCells =
      dimensionMode === 'dept_vs_iso'
        ? cells.filter(c => c.dimensionType === 'ISO_27001')
        : dimensionMode === 'dept_vs_mas'
        ? cells.filter(c => c.dimensionType === 'MAS_TRM')
        : dimensionMode === 'dept_vs_pims'
        ? cells.filter(c => c.dimensionType === 'ISO_27701')
        : cells;
    return ComplianceHeatmapService.calculateMetrics(relevantCells);
  }, [cells, dimensionMode]);

  // Handle cell click
  const handleCellClick = (cell: HeatmapCellData) => {
    setSelectedCell(cell);
    setIsDetailModalOpen(true);
    logAuditEvent(
      'ACCESS',
      'Compliance Heatmap',
      `Inspected compliance node ${cell.departmentName} x ${cell.targetCode} (${cell.score}% ${cell.status}).`
    );
  };

  // Handle cell update from modal
  const handleCellUpdated = (updated: HeatmapCellData) => {
    setCells(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  // Export CSV
  const handleExportCSV = () => {
    const title =
      dimensionMode === 'dept_vs_iso'
        ? 'ISO 27001 Clause'
        : dimensionMode === 'dept_vs_pims'
        ? 'ISO 27701 PIMS Clause'
        : 'MAS TRM Module';
    const csv = ComplianceHeatmapService.exportToCSV(activeCells, title);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skanda_Compliance_Heatmap_${dimensionMode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({
      title: 'Heatmap Exported',
      message: 'Compliance heatmap matrix exported as CSV',
      type: 'success'
    });
  };

  // Reset baseline
  const handleResetBaseline = () => {
    if (safeConfirm('Reset all compliance heatmap cell scores and statuses back to baseline?')) {
      const reset = ComplianceHeatmapService.resetBaseline();
      setCells(reset);
      showToast({
        title: 'Baseline Reset',
        message: 'Compliance heatmap returned to initial baseline',
        type: 'info'
      });
    }
  };

  // Cell color & visual intensity helper with Inherent Risk weighting
  const getCellBgClass = (score: number, status: HeatmapStatus, targetCode?: string) => {
    if (!targetCode || !isInherentRiskWeighted) {
      if (status === 'NOT_APPLICABLE') {
        return theme === 'light'
          ? 'bg-slate-100 text-slate-400 border-slate-200'
          : 'bg-slate-900/40 text-slate-500 border-slate-800';
      }

      if (score >= 85) {
        // Compliant (Green)
        return theme === 'light'
          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/90'
          : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400';
      } else if (score >= 50) {
        // In Progress (Yellow / Amber)
        return theme === 'light'
          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/90'
          : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/60 hover:border-amber-400';
      } else {
        // Non-Compliant (Red / Rose)
        return theme === 'light'
          ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100/90'
          : 'bg-rose-950/50 text-rose-300 border-rose-500/50 hover:bg-rose-900/70 hover:border-rose-400 shadow-rose-950/30';
      }
    }

    const intensity = ComplianceHeatmapService.calculateInherentRiskIntensity(
      score,
      status,
      targetCode,
      isInherentRiskWeighted,
      theme
    );
    return intensity.bgClass;
  };

  // Helper to render individual cell trend arrow
  const renderCellTrendArrow = (cell: HeatmapCellData, size: 'sm' | 'md' = 'sm') => {
    const trend = cell.trend || (cell.scoreDelta && cell.scoreDelta > 0 ? 'UP' : cell.scoreDelta && cell.scoreDelta < 0 ? 'DOWN' : 'STABLE');
    const delta = cell.scoreDelta ?? (cell.previousScore !== undefined ? cell.score - cell.previousScore : 0);
    const prevScore = cell.previousScore ?? (cell.score - delta);
    const prevDate = cell.previousAssessedAt || 'Q2 2026';
    const iconClass = size === 'sm' ? "w-2.5 h-2.5 stroke-[3]" : "w-3 h-3 stroke-[2.5]";

    if (trend === 'UP') {
      return (
        <span
          className="inline-flex items-center text-emerald-400 shrink-0 group-hover:scale-125 transition-transform"
          title={`Trend: Improved +${Math.abs(delta)}% since last assessment (Prior: ${prevScore}% on ${prevDate})`}
          aria-label={`Improved +${Math.abs(delta)}%`}
        >
          <ArrowUp className={iconClass} />
        </span>
      );
    } else if (trend === 'DOWN') {
      return (
        <span
          className="inline-flex items-center text-rose-400 shrink-0 group-hover:scale-125 transition-transform"
          title={`Trend: Regressed -${Math.abs(delta)}% since last assessment (Prior: ${prevScore}% on ${prevDate})`}
          aria-label={`Regressed -${Math.abs(delta)}%`}
        >
          <ArrowDown className={iconClass} />
        </span>
      );
    } else {
      return (
        <span
          className="inline-flex items-center text-slate-400 opacity-60 shrink-0 group-hover:opacity-100 transition-opacity"
          title={`Trend: Stable at ${cell.score}% (No change since last assessment on ${prevDate})`}
          aria-label="Stable score"
        >
          <Minus className={iconClass} />
        </span>
      );
    }
  };

  // Helper to compute and render aggregate trend for a clause or module column
  const renderClauseTrendArrow = (targetCode: string, dimensionType: 'ISO_27001' | 'MAS_TRM' | 'ISO_27701') => {
    const targetCells = cells.filter(c => c.targetCode === targetCode && c.dimensionType === dimensionType);
    if (targetCells.length === 0) return null;

    const currentAvg = Math.round(targetCells.reduce((a, b) => a + b.score, 0) / targetCells.length);
    const prevAvg = Math.round(targetCells.reduce((a, b) => a + (b.previousScore ?? b.score), 0) / targetCells.length);
    const delta = currentAvg - prevAvg;

    if (delta > 0) {
      return (
        <span
          className="inline-flex items-center text-emerald-400 ml-0.5 shrink-0"
          title={`${targetCode} Posture: Improved +${delta}% across units (Prior: ${prevAvg}%, Current: ${currentAvg}%)`}
        >
          <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      );
    } else if (delta < 0) {
      return (
        <span
          className="inline-flex items-center text-rose-400 ml-0.5 shrink-0"
          title={`${targetCode} Posture: Regressed -${Math.abs(delta)}% across units (Prior: ${prevAvg}%, Current: ${currentAvg}%)`}
        >
          <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      );
    } else {
      return (
        <span
          className="inline-flex items-center text-slate-400 opacity-60 ml-0.5 shrink-0"
          title={`${targetCode} Posture: Stable at ${currentAvg}% across units`}
        >
          <Minus className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      );
    }
  };

  // Helper to compute and render aggregate trend for a department row
  const renderDepartmentTrendArrow = (deptId: string, dimensionType?: 'ISO_27001' | 'MAS_TRM' | 'ISO_27701') => {
    const deptCells = cells.filter(
      c => c.departmentId === deptId && (!dimensionType || c.dimensionType === dimensionType)
    );
    if (deptCells.length === 0) return null;

    const currentAvg = Math.round(deptCells.reduce((a, b) => a + b.score, 0) / deptCells.length);
    const prevAvg = Math.round(deptCells.reduce((a, b) => a + (b.previousScore ?? b.score), 0) / deptCells.length);
    const delta = currentAvg - prevAvg;
    const deptName = deptCells[0]?.departmentName || 'Department';

    if (delta > 0) {
      return (
        <span
          className="inline-flex items-center text-emerald-400 shrink-0"
          title={`${deptName} Score Trend: Improved +${delta}% (Prior: ${prevAvg}%, Current: ${currentAvg}%)`}
        >
          <ArrowUp className="w-3 h-3 stroke-[2.5]" />
        </span>
      );
    } else if (delta < 0) {
      return (
        <span
          className="inline-flex items-center text-rose-400 shrink-0"
          title={`${deptName} Score Trend: Regressed -${Math.abs(delta)}% (Prior: ${prevAvg}%, Current: ${currentAvg}%)`}
        >
          <ArrowDown className="w-3 h-3 stroke-[2.5]" />
        </span>
      );
    } else {
      return (
        <span
          className="inline-flex items-center text-slate-400 opacity-60 shrink-0"
          title={`${deptName} Score Trend: Stable at ${currentAvg}%`}
        >
          <Minus className="w-3 h-3 stroke-[2.5]" />
        </span>
      );
    }
  };

  return (
    <div id="command-center-compliance-heatmap" className="compliance-heatmap space-y-5 animate-in fade-in duration-200 w-full max-w-full">
      {/* 1. View Header & Navigation Switcher */}
      <div className={`p-5 rounded-2xl border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Grid className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Interactive Compliance Heatmap</span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Dimensional Matrix
              </span>
            </h2>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="compliance-heatmap-clear-filters-btn ml-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm ring-1 ring-indigo-400/40 transition-all cursor-pointer animate-in fade-in"
                title="Clear all active filters and smoothly return to full dataset view"
              >
                <RotateCcw className="w-3 h-3 text-white" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time visual risk coverage across business departments, ISO 27001:2022 clauses (Cl. 4-10 & Annex A),
            and MAS TRM modules. Click any cell to inspect controls, audit findings, or override status.
          </p>
        </div>

        {/* Pivot Selector Pills */}
        <div className={`flex flex-wrap items-center p-1 rounded-xl border text-xs font-semibold ${
          theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => setDimensionMode('tri_dimensional')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'tri_dimensional'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Unified View: Departments × ISO 27001 Clauses × MAS TRM Modules"
          >
            <Grid className="w-3.5 h-3.5 text-amber-300" />
            <span>Unified Tri-Matrix (Dept × ISO × MAS)</span>
          </button>

          <button
            onClick={() => setDimensionMode('dept_vs_iso')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'dept_vs_iso'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Dept × ISO 27001</span>
          </button>

          <button
            onClick={() => setDimensionMode('dept_vs_mas')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'dept_vs_mas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dept × MAS TRM</span>
          </button>

          <button
            onClick={() => setDimensionMode('dept_vs_pims')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'dept_vs_pims'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Dept × ISO 27701 PIMS</span>
          </button>

          <button
            onClick={() => setDimensionMode('iso_vs_mas_crosswalk')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'iso_vs_mas_crosswalk'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ISO × MAS Crosswalk</span>
          </button>

          <button
            onClick={() => setDimensionMode('department_composite')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              dimensionMode === 'department_composite'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Composite Scores</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall Coverage Index */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Coverage Index</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-white">{metrics.averageScore}%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Average across scope</span>
          </div>
        </div>

        {/* Compliant Nodes (Green) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'COMPLIANT' ? 'ALL' : 'COMPLIANT')}
          className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
            statusFilter === 'COMPLIANT'
              ? 'ring-2 ring-emerald-500 bg-emerald-950/30 border-emerald-500/50'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:border-emerald-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Compliant (Green)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {metrics.totalNodes > 0 ? Math.round((metrics.compliantCount / metrics.totalNodes) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-emerald-400">{metrics.compliantCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Score &ge; 85% verified</span>
          </div>
        </div>

        {/* In Progress Nodes (Yellow) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
            statusFilter === 'IN_PROGRESS'
              ? 'ring-2 ring-amber-500 bg-amber-950/30 border-amber-500/50'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:border-amber-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>In Progress (Yellow)</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {metrics.totalNodes > 0 ? Math.round((metrics.inProgressCount / metrics.totalNodes) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-amber-400">{metrics.inProgressCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Score 50-84% underway</span>
          </div>
        </div>

        {/* Non-Compliant Gaps (Red) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'NON_COMPLIANT' ? 'ALL' : 'NON_COMPLIANT')}
          className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition ${
            statusFilter === 'NON_COMPLIANT'
              ? 'ring-2 ring-rose-500 bg-rose-950/40 border-rose-500/60'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:border-rose-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-rose-400 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Non-Compliant (Red)</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-rose-400">{metrics.nonCompliantCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Critical gaps (&lt;50%)</span>
          </div>
        </div>

        {/* Critical Risk Nodes */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-rose-400">Critical Threats</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-rose-400">{metrics.criticalRiskNodesCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">High residual impact</span>
          </div>
        </div>

        {/* Open Audit Non-Conformities */}
        <div
          onClick={() => {
            if (onNavigateModule) onNavigateModule('non_conformity');
          }}
          className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 transition ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-indigo-400">Open CAPA Findings</span>
            <ExternalLink className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-mono text-indigo-300">{metrics.totalOpenFindings}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Linked audit tickets</span>
          </div>
        </div>
      </div>

      {/* 2.5 Inherent Risk Weighting Configuration & Visual Intensity Engine */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-all ${
          isInherentRiskWeighted
            ? 'bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border-indigo-500/50 shadow-md shadow-indigo-950/20'
            : theme === 'light'
            ? 'bg-slate-100/90 border-slate-200'
            : 'bg-slate-950/70 border-slate-800'
        }`}
      >
        {/* Left: Configuration Toggle */}
        <div className="flex items-start md:items-center space-x-3.5">
          <button
            type="button"
            role="switch"
            aria-checked={isInherentRiskWeighted}
            onClick={() => {
              const nextState = !isInherentRiskWeighted;
              setIsInherentRiskWeighted(nextState);
              showToast({
                title: nextState ? 'Inherent Risk Weighting Enabled' : 'Inherent Risk Weighting Disabled',
                message: nextState
                  ? 'Heatmap visual intensity scaled by ISO clause inherent threat weightings (0.8x – 2.2x)'
                  : 'Heatmap visual intensity returned to raw unweighted compliance scores',
                type: nextState ? 'success' : 'info'
              });
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden mt-0.5 md:mt-0 ${
              isInherentRiskWeighted ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
            title="Toggle Inherent Risk visual intensity scaling"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isInherentRiskWeighted ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Flame className={`w-4 h-4 ${isInherentRiskWeighted ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Inherent Risk Visual Weighting</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isInherentRiskWeighted
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isInherentRiskWeighted ? 'ACTIVE: 0.8x – 2.2x MULTIPLIERS' : 'OFF: RAW POSTURE SCORES'}
              </span>
            </div>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              {isInherentRiskWeighted
                ? 'Visual intensity dynamically adjusted: critical threat vectors (Annex A.8 Tech, Clause 6 Risk, Annex A.5 Org) intensify non-compliance with glowing crimson alert cues.'
                : 'Standard unweighted scale: all ISO clauses and Annex A controls share identical visual saturation regardless of operational threat severity.'}
            </p>
          </div>
        </div>

        {/* Right: Quick Multiplier Chips & Config Button */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {isInherentRiskWeighted && (
            <div className="hidden lg:flex items-center space-x-1.5 text-[11px] font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-rose-400 font-bold">A.8 Tech: 1.8x</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold">Cl.6 Risk: 1.5x</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-bold">A.5 Org: 1.4x</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Cl.4: 0.9x</span>
            </div>
          )}

          <button
            onClick={() => setIsRiskConfigModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
            title="Configure Inherent Risk multipliers for ISO clauses"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Configure Weights</span>
          </button>
        </div>
      </div>

      {/* 3. Interactive Filter & Intensity Scale Legend Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        {/* Left: Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <option value="ALL">All Departments (7)</option>
              {HEATMAP_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <option value="ALL">All Statuses</option>
              <option value="NON_COMPLIANT">Non-Compliant (Red)</option>
              <option value="IN_PROGRESS">In Progress (Yellow)</option>
              <option value="COMPLIANT">Compliant (Green)</option>
            </select>
          </div>

          {/* Weak Gaps Toggle */}
          <button
            onClick={() => setHighlightWeakGapsOnly(!highlightWeakGapsOnly)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition ${
              highlightWeakGapsOnly
                ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Highlight Red Gaps Only</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search clause or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs w-48 ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            />
          </div>

          {/* Quick Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 text-indigo-400 border-indigo-700 bg-indigo-950/60 hover:bg-indigo-900/80 transition cursor-pointer shrink-0"
              title="Reset active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Color Intensity Scale Legend & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Legend */}
          <div className="flex items-center space-x-2 text-[11px] font-semibold bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Scale:</span>
            {isInherentRiskWeighted ? (
              <>
                <span className="flex items-center space-x-1 text-rose-300" title="Amplified Crimson for Critical/High Inherent Risk Gaps (1.4x-1.8x)">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 ring-1 ring-rose-400" />
                  <span>Amplified Non-Compliant</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1 text-amber-300" title="Urgent Amber for High Risk In-Progress Controls">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 ring-1 ring-amber-400" />
                  <span>Urgent In Progress</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1 text-emerald-300" title="Fortified Defense for High Inherent Risk Compliant Controls">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 ring-1 ring-emerald-400" />
                  <span>Fortified Compliant</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1 text-slate-400" title="Subdued Soft Tone for Low Inherent Risk (0.8x-0.9x)">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 opacity-60" />
                  <span>Subdued (Low Risk)</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center space-x-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  <span>&lt;50% Non-Compliant</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span>50-84% In Progress</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>&ge;85% Compliant</span>
                </span>
              </>
            )}
          </div>

          {/* Assessment Trend Legend */}
          <div className="flex items-center space-x-2 text-[11px] font-semibold bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800" title="Assessment Score Trend vs Prior Audit Cycle">
            <span className="text-slate-400">Trend:</span>
            <span className="flex items-center space-x-1 text-emerald-400" title="Compliance score improved since last assessment">
              <ArrowUp className="w-3 h-3 stroke-[3]" />
              <span>Improved</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1 text-rose-400" title="Compliance score regressed since last assessment">
              <ArrowDown className="w-3 h-3 stroke-[3]" />
              <span>Regressed</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1 text-slate-400" title="Score stable (within 0% change)">
              <Minus className="w-3 h-3 stroke-[3]" />
              <span>Stable</span>
            </span>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            title="Export current heatmap matrix as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Clear Filters */}
          <button
            onClick={handleClearFilters}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              hasActiveFilters
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 shadow-sm font-bold ring-2 ring-indigo-500/30'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300'
            }`}
            title="Reset all active filters to default"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-white' : 'text-slate-400'}`} />
            <span>Clear Filters</span>
            {hasActiveFilters && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                Active
              </span>
            )}
          </button>

          {/* Reset Baseline */}
          <button
            onClick={handleResetBaseline}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Reset baseline values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Main Heatmap Canvas */}
      {/* Dimension: Unified Tri-Dimensional Heatmap (Departments × ISO 27001 Clauses × MAS TRM Modules) */}
      {dimensionMode === 'tri_dimensional' && (
        <div className={`rounded-2xl border shadow-xl overflow-hidden transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Card Header */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Grid className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Tri-Dimensional Risk Coverage Matrix</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Departments × ISO Clauses × MAS Modules
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive horizontal heatmap matrix showing risk coverage across all operational departments, key ISO 27001 clauses, and MAS TRM modules.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[11px] text-slate-400 hidden md:inline">Click any cell to inspect controls or findings</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1280px]">
              <thead>
                {/* Super Header Row */}
                <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-2.5 sticky left-0 z-20 bg-slate-950 min-w-[190px] border-r border-slate-800 text-slate-400">
                    Department Entity
                  </th>
                  <th colSpan={TRI_ISO_COLUMNS.length} className="p-2 text-center bg-indigo-950/40 border-r border-slate-800 text-indigo-300 font-semibold border-b border-indigo-500/30">
                    <span className="flex items-center justify-center space-x-1.5">
                      <Building className="w-3 h-3 text-indigo-400" />
                      <span>ISO/IEC 27001:2022 Core Clauses & Annex A Themes</span>
                    </span>
                  </th>
                  <th colSpan={TRI_MAS_COLUMNS.length} className="p-2 text-center bg-rose-950/30 border-r border-slate-800 text-rose-300 font-semibold border-b border-rose-500/30">
                    <span className="flex items-center justify-center space-x-1.5">
                      <ShieldCheck className="w-3 h-3 text-rose-400" />
                      <span>MAS TRM Notice & Guidelines (Domains 3.0 - 14.0)</span>
                    </span>
                  </th>
                  <th colSpan={2} className="p-2 text-center bg-emerald-950/30 text-emerald-300 font-semibold border-b border-emerald-500/30">
                    <span className="flex items-center justify-center space-x-1.5">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>Joint Posture</span>
                    </span>
                  </th>
                </tr>

                {/* Sub Header Row */}
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  <th className="p-3 sticky left-0 z-10 bg-slate-950 min-w-[190px] border-r border-slate-800">
                    Business Unit / Lead
                  </th>
                  {TRI_ISO_COLUMNS.map(col => {
                    const risk = inherentRisks[col.code] || ComplianceHeatmapService.getISOInherentRisk(col.code);
                    const isColActive = isColHovered(col.code);
                    return (
                      <th
                        key={col.code}
                        className={`p-2 text-center border-r border-slate-800/60 min-w-[88px] transition-all duration-200 ${
                          isColActive
                            ? 'bg-indigo-950/90 text-indigo-100 ring-1 ring-indigo-500/60 border-b-2 border-indigo-400 shadow-md shadow-indigo-950/70'
                            : ''
                        }`}
                      >
                        <div className={`font-mono font-bold text-[10.5px] flex items-center justify-center space-x-0.5 transition-colors duration-150 ${
                          isColActive ? 'text-indigo-300 font-extrabold' : 'text-sky-300'
                        }`}>
                          <span>{col.code}</span>
                          {renderClauseTrendArrow(col.code, 'ISO_27001')}
                        </div>
                        <div className={`text-[9.5px] truncate max-w-[88px] transition-colors duration-150 ${
                          isColActive ? 'text-indigo-200 font-semibold' : 'font-normal text-slate-400'
                        }`} title={col.title}>
                          {col.shortTitle}
                        </div>
                        {isInherentRiskWeighted && (
                          <div className="mt-1 flex justify-center">
                            <span
                              className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-sm border inline-flex items-center space-x-0.5 ${
                                risk.inherentRiskLevel === 'CRITICAL'
                                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/70'
                                  : risk.inherentRiskLevel === 'HIGH'
                                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/70'
                                  : risk.inherentRiskLevel === 'MEDIUM'
                                  ? 'bg-blue-950/90 text-blue-300 border-blue-500/70'
                                  : 'bg-slate-900 text-slate-400 border-slate-700'
                              }`}
                              title={`Inherent Threat Weight: ${risk.inherentRiskWeight}x (${risk.inherentRiskLevel})\nCategory: ${risk.threatCategory}`}
                            >
                              {risk.inherentRiskWeight >= 1.4 && <Flame className="w-2.5 h-2.5 text-rose-400 inline" />}
                              <span>{risk.inherentRiskWeight.toFixed(1)}x</span>
                            </span>
                          </div>
                        )}
                      </th>
                    );
                  })}
                  {TRI_MAS_COLUMNS.map(col => {
                    const isColActive = isColHovered(col.code);
                    return (
                      <th
                        key={col.code}
                        className={`p-2 text-center border-r border-slate-800/60 min-w-[86px] transition-all duration-200 ${
                          isColActive
                            ? 'bg-rose-950/90 text-rose-100 ring-1 ring-rose-500/60 border-b-2 border-rose-400 shadow-md shadow-rose-950/70'
                            : ''
                        }`}
                      >
                        <div className={`font-mono font-bold text-[10.5px] flex items-center justify-center space-x-0.5 transition-colors duration-150 ${
                          isColActive ? 'text-rose-300 font-extrabold' : 'text-rose-300'
                        }`}>
                          <span>{col.code}</span>
                          {renderClauseTrendArrow(col.code, 'MAS_TRM')}
                        </div>
                        <div className={`text-[9.5px] truncate max-w-[86px] transition-colors duration-150 ${
                          isColActive ? 'text-rose-200 font-semibold' : 'font-normal text-slate-400'
                        }`} title={col.title}>
                          {col.shortTitle}
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-2 text-center font-mono text-[10.5px] text-white min-w-[85px] border-r border-slate-800/60">
                    {isInherentRiskWeighted ? 'Risk Wtd Avg' : 'Avg %'}
                  </th>
                  <th className="p-2 text-center text-[10.5px] text-white min-w-[105px]">
                    Risk Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 text-xs">
                {HEATMAP_DEPARTMENTS.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map(dept => {
                  const deptISOCells = cells.filter(
                    c => c.departmentId === dept.id && c.dimensionType === 'ISO_27001'
                  );
                  const deptMASCells = cells.filter(
                    c => c.departmentId === dept.id && c.dimensionType === 'MAS_TRM'
                  );

                  const allDeptCells = [...deptISOCells, ...deptMASCells];
                  const deptScoreData = ComplianceHeatmapService.calculateDepartmentWeightedScore(
                    allDeptCells,
                    isInherentRiskWeighted
                  );

                  const effectiveAvg = deptScoreData.effectiveAverage;
                  const deptStatus: HeatmapStatus =
                    effectiveAvg >= 85 ? 'COMPLIANT' : effectiveAvg >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT';
                  const isRowActive = isRowHovered(dept.id);

                  return (
                    <tr
                      key={dept.id}
                      className={`transition-colors duration-150 ${
                        isRowActive ? 'bg-indigo-950/25' : 'hover:bg-slate-800/20'
                      }`}
                    >
                      {/* Department Row Header */}
                      <td className={`p-3 sticky left-0 z-20 border-r transition-all duration-200 ${
                        isRowActive
                          ? 'bg-slate-900 border-r-2 border-indigo-400 shadow-md shadow-indigo-950/60 ring-1 ring-inset ring-indigo-500/50'
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 ${
                            isRowActive ? 'scale-125 ring-2 ring-indigo-400' : ''
                          } ${dept.avatarColor}`} />
                          <div className="min-w-0">
                            <span className={`font-bold block text-xs truncate transition-colors duration-150 ${
                              isRowActive ? 'text-indigo-300 font-extrabold' : 'text-slate-200'
                            }`}>{dept.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">Head: {dept.head}</span>
                          </div>
                        </div>
                      </td>

                      {/* ISO 27001 Cells */}
                      {TRI_ISO_COLUMNS.map(col => {
                        const cell = deptISOCells.find(c => c.targetCode === col.code);
                        if (!cell) {
                          return (
                            <td key={col.code} className="p-1 border-r border-slate-800/40 text-center text-slate-600">
                              -
                            </td>
                          );
                        }

                        const bgClass = getCellBgClass(cell.score, cell.status, col.code);
                        const risk = inherentRisks[col.code] || ComplianceHeatmapService.getISOInherentRisk(col.code);
                        const isAmplified = isInherentRiskWeighted && risk.inherentRiskWeight >= 1.4 && cell.score < 50;
                        const isHovered = hoveredCell?.deptId === dept.id && hoveredCell?.targetCode === col.code;
                        const isInSameRow = isRowActive && !isHovered;
                        const isInSameCol = isColHovered(col.code) && !isHovered;

                        return (
                          <td key={col.code} className="p-1.5 border-r border-slate-800/40 text-center relative overflow-visible">
                            <button
                              type="button"
                              onClick={() => handleCellClick(cell)}
                              onMouseEnter={() => setHoveredCell({ deptId: dept.id, targetCode: col.code })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`w-full h-15 p-1 rounded-lg border transition-all duration-200 ease-out flex flex-col justify-between items-center group cursor-pointer relative ${bgClass} ${
                                isHovered
                                  ? 'scale-110 -translate-y-0.5 z-30 shadow-xl ring-2 ring-indigo-400 brightness-110'
                                  : isInSameRow || isInSameCol
                                  ? 'ring-1 ring-indigo-400/30'
                                  : 'hover:scale-105 shadow-xs'
                              }`}
                              title={`${dept.name} × ISO ${col.code} (${col.title}): ${cell.score}% (${cell.status})\nTrend: ${
                                cell.trend === 'UP'
                                  ? `▲ Improved (+${cell.scoreDelta}%)`
                                  : cell.trend === 'DOWN'
                                  ? `▼ Regressed (${cell.scoreDelta}%)`
                                  : '▬ Stable'
                              } vs prior cycle (${cell.previousScore}%)${
                                isInherentRiskWeighted
                                  ? `\nInherent Risk: ${risk.inherentRiskLevel} (${risk.inherentRiskWeight}x)\nThreat: ${risk.threatCategory}`
                                  : ''
                              }`}
                            >
                              <div className="w-full flex items-center justify-between">
                                {cell.status === 'COMPLIANT' ? (
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                ) : cell.status === 'IN_PROGRESS' ? (
                                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                                ) : (
                                  <AlertTriangle className={`w-2.5 h-2.5 ${isAmplified ? 'text-rose-300 animate-bounce' : 'text-rose-500 animate-pulse'}`} />
                                )}
                                <div className="flex items-center space-x-0.5">
                                  <span className="font-mono font-black text-xs">
                                    {cell.score}%
                                  </span>
                                  {renderCellTrendArrow(cell, 'sm')}
                                </div>
                              </div>
                              <div className="w-full flex items-center justify-between text-[9px] opacity-85 font-mono">
                                <span>{cell.controlsImplemented}/{cell.controlsTotal}</span>
                                {isInherentRiskWeighted ? (
                                  <span className={`font-bold px-1 py-0.2 rounded-xs text-[8px] ${
                                    risk.inherentRiskWeight >= 1.4
                                      ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
                                      : risk.inherentRiskWeight <= 0.95
                                      ? 'text-slate-400'
                                      : 'text-amber-300'
                                  }`}>
                                    {risk.inherentRiskWeight.toFixed(1)}x
                                  </span>
                                ) : (
                                  cell.openFindingsCount > 0 && (
                                    <span className="text-rose-400 font-bold">!{cell.openFindingsCount}</span>
                                  )
                                )}
                              </div>
                            </button>
                          </td>
                        );
                      })}

                      {/* MAS TRM Cells */}
                      {TRI_MAS_COLUMNS.map(col => {
                        const cell = deptMASCells.find(c => c.targetCode === col.code);
                        if (!cell) {
                          return (
                            <td key={col.code} className="p-1 border-r border-slate-800/40 text-center text-slate-600">
                              -
                            </td>
                          );
                        }

                        const bgClass = getCellBgClass(cell.score, cell.status, col.code);
                        const isHovered = hoveredCell?.deptId === dept.id && hoveredCell?.targetCode === col.code;
                        const isInSameRow = isRowActive && !isHovered;
                        const isInSameCol = isColHovered(col.code) && !isHovered;

                        return (
                          <td key={col.code} className="p-1.5 border-r border-slate-800/40 text-center relative overflow-visible">
                            <button
                              type="button"
                              onClick={() => handleCellClick(cell)}
                              onMouseEnter={() => setHoveredCell({ deptId: dept.id, targetCode: col.code })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`w-full h-15 p-1 rounded-lg border transition-all duration-200 ease-out flex flex-col justify-between items-center group cursor-pointer relative ${bgClass} ${
                                isHovered
                                  ? 'scale-110 -translate-y-0.5 z-30 shadow-xl ring-2 ring-rose-400 brightness-110'
                                  : isInSameRow || isInSameCol
                                  ? 'ring-1 ring-rose-400/30'
                                  : 'hover:scale-105 shadow-xs'
                              }`}
                              title={`${dept.name} × MAS ${col.code} (${col.title}): ${cell.score}% (${cell.status})\nTrend: ${
                                cell.trend === 'UP'
                                  ? `▲ Improved (+${cell.scoreDelta}%)`
                                  : cell.trend === 'DOWN'
                                  ? `▼ Regressed (${cell.scoreDelta}%)`
                                  : '▬ Stable'
                              } vs prior cycle (${cell.previousScore}%)`}
                            >
                              <div className="w-full flex items-center justify-between">
                                {cell.status === 'COMPLIANT' ? (
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                ) : cell.status === 'IN_PROGRESS' ? (
                                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                                ) : (
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
                                )}
                                <div className="flex items-center space-x-0.5">
                                  <span className="font-mono font-black text-xs">
                                    {cell.score}%
                                  </span>
                                  {renderCellTrendArrow(cell, 'sm')}
                                </div>
                              </div>
                              <div className="w-full flex items-center justify-between text-[9px] opacity-80 font-mono">
                                <span>{cell.controlsImplemented}/{cell.controlsTotal}</span>
                                {cell.openFindingsCount > 0 && (
                                  <span className="text-rose-400 font-bold">!{cell.openFindingsCount}</span>
                                )}
                              </div>
                            </button>
                          </td>
                        );
                      })}

                      {/* Average % */}
                      <td className="p-2 text-center font-mono font-black text-xs text-white border-r border-slate-800/60">
                        <span className={`px-2 py-1 rounded-md border text-xs font-mono font-bold flex items-center justify-center space-x-1 ${
                          effectiveAvg >= 85
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : effectiveAvg >= 50
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}>
                          <span>{effectiveAvg}%</span>
                          {renderDepartmentTrendArrow(dept.id)}
                        </span>
                        {isInherentRiskWeighted && deptScoreData.weightedAverage !== deptScoreData.rawAverage && (
                          <span className="text-[8.5px] text-slate-400 block font-mono mt-0.5" title="Raw Unweighted Score">
                            Raw: {deptScoreData.rawAverage}%
                          </span>
                        )}
                      </td>

                      {/* Risk Status Badge */}
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center space-x-1 ${
                          deptStatus === 'COMPLIANT'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                            : deptStatus === 'IN_PROGRESS'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                            : 'bg-rose-950/80 text-rose-300 border-rose-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            deptStatus === 'COMPLIANT' ? 'bg-emerald-400' : deptStatus === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-rose-400 animate-pulse'
                          }`} />
                          <span>
                            {deptStatus === 'COMPLIANT'
                              ? 'Compliant'
                              : deptStatus === 'IN_PROGRESS'
                              ? 'In Progress'
                              : 'At Risk'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Dimension: Department vs ISO 27701 PIMS Clauses */}
      {dimensionMode === 'dept_vs_pims' && (
        <div className={`rounded-2xl border shadow-xl overflow-hidden transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Departmental Privacy Risk Coverage × ISO/IEC 27701:2019 PIMS Extension</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Lead Auditor Certified
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {HEATMAP_DEPARTMENTS.length} Departments × {HEATMAP_PIMS_CLAUSES.length} PIMS Clauses = 70 Audit Intersections • Annex A (Controller 7.2–7.5, 31 Controls) & Annex B (Processor 8.2–8.5, 18 Controls)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigateModule?.('iso27701_soa')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open SoA & Audit Dossier</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  <th className="p-3 sticky left-0 z-10 bg-slate-950 min-w-[200px] border-r border-slate-800">
                    Business Unit / Department
                  </th>
                  {HEATMAP_PIMS_CLAUSES.map(clause => {
                    const isColActive = isColHovered(clause.clauseCode);
                    return (
                      <th
                        key={clause.id}
                        className={`p-2.5 text-center border-r border-slate-800/60 min-w-[105px] transition-all duration-200 ${
                          isColActive
                            ? 'bg-emerald-950/90 text-emerald-100 ring-1 ring-emerald-500/60 border-b-2 border-emerald-400 shadow-md shadow-emerald-950/70'
                            : ''
                        }`}
                      >
                        <div className={`font-mono font-bold text-[11px] flex items-center justify-center space-x-0.5 transition-colors duration-150 ${
                          isColActive ? 'text-emerald-300 font-extrabold' : 'text-white'
                        }`}>
                          <span>{clause.clauseCode}</span>
                          {renderClauseTrendArrow(clause.clauseCode, 'ISO_27701')}
                        </div>
                        <div className={`text-[10px] truncate max-w-[105px] transition-colors duration-150 ${
                          isColActive ? 'text-emerald-200 font-semibold' : 'font-normal text-slate-400'
                        }`} title={clause.title}>
                          {clause.shortTitle}
                        </div>
                        <div className="mt-1 flex justify-center space-x-1">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-flex items-center ${
                              clause.roleType === 'CONTROLLER'
                                ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40'
                                : clause.roleType === 'PROCESSOR'
                                ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-700'
                            }`}
                          >
                            {clause.roleType === 'CONTROLLER' ? 'Annex A' : clause.roleType === 'PROCESSOR' ? 'Annex B' : 'Core'}
                          </span>
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50">
                            {clause.totalControls}c
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-3 text-center font-mono text-[11px] text-emerald-300 min-w-[95px]">
                    Dept Avg
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {HEATMAP_DEPARTMENTS.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map(dept => {
                  const deptCells = cells.filter(
                    c => c.departmentId === dept.id && c.dimensionType === 'ISO_27701'
                  );
                  const deptAverage = deptCells.length > 0
                    ? Math.round(deptCells.reduce((a, b) => a + b.score, 0) / deptCells.length)
                    : 0;
                  const isRowActive = isRowHovered(dept.id);

                  return (
                    <tr
                      key={dept.id}
                      className={`transition-colors duration-150 ${
                        isRowActive ? 'bg-emerald-950/25' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Department Row Header */}
                      <td className={`p-3 sticky left-0 z-20 border-r transition-all duration-200 ${
                        isRowActive
                          ? 'bg-slate-900 border-r-2 border-emerald-400 shadow-md shadow-emerald-950/60 ring-1 ring-inset ring-emerald-500/50'
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                            isRowActive ? 'scale-125 ring-2 ring-emerald-400' : ''
                          } ${dept.avatarColor}`} />
                          <div>
                            <span className={`font-bold block text-xs transition-colors duration-150 ${
                              isRowActive ? 'text-emerald-300 font-extrabold' : 'text-slate-200'
                            }`}>{dept.name}</span>
                            <span className="text-[10px] text-slate-400">Head: {dept.head}</span>
                          </div>
                        </div>
                      </td>

                      {/* Heatmap Cells */}
                      {HEATMAP_PIMS_CLAUSES.map(clause => {
                        const cell = deptCells.find(c => c.targetCode === clause.clauseCode);
                        if (!cell) {
                          return (
                            <td key={clause.id} className="p-2 border-r border-slate-800/40 text-center text-slate-600">
                              -
                            </td>
                          );
                        }

                        const bgClass = getCellBgClass(cell.score, cell.status, cell.targetCode);
                        const isHovered = hoveredCell?.deptId === dept.id && hoveredCell?.targetCode === clause.clauseCode;
                        const isInSameRow = hoveredCell?.deptId === dept.id;
                        const isInSameCol = hoveredCell?.targetCode === clause.clauseCode;

                        return (
                          <td key={clause.id} className="p-1.5 border-r border-slate-800/40 text-center relative overflow-visible">
                            <button
                              type="button"
                              onClick={() => handleCellClick(cell)}
                              onMouseEnter={() => setHoveredCell({ deptId: dept.id, targetCode: clause.clauseCode })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`w-full h-16 p-1.5 rounded-xl border transition-all duration-200 ease-out flex flex-col justify-between items-center group cursor-pointer relative ${bgClass} ${
                                isHovered
                                  ? 'scale-110 -translate-y-0.5 z-30 shadow-xl ring-2 ring-emerald-400 brightness-110'
                                  : isInSameRow || isInSameCol
                                  ? 'ring-1 ring-emerald-400/30'
                                  : 'hover:scale-105 shadow-sm'
                              }`}
                              title={`${dept.name} × ${clause.clauseCode} (${clause.title}): ${cell.score}% (${cell.status})\nTrend: ${
                                cell.trend === 'UP'
                                  ? `▲ Improved (+${cell.scoreDelta}%)`
                                  : cell.trend === 'DOWN'
                                  ? `▼ Regressed (${cell.scoreDelta}%)`
                                  : '▬ Stable'
                              } vs prior cycle (${cell.previousScore}%)`}
                            >
                              <div className="w-full flex items-center justify-between">
                                {cell.status === 'COMPLIANT' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ) : cell.status === 'IN_PROGRESS' ? (
                                  <Clock className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                                )}

                                <div className="flex items-center space-x-1">
                                  <span className="font-mono font-black text-xs">
                                    {cell.score}%
                                  </span>
                                  {renderCellTrendArrow(cell, 'md')}
                                </div>
                              </div>

                              <div className="w-full flex items-center justify-between text-[10px] opacity-85">
                                <span className="font-mono text-[9px]">
                                  {cell.controlsImplemented}/{cell.controlsTotal} ctrl
                                </span>
                                {cell.openFindingsCount > 0 && (
                                  <span className="font-mono font-bold text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    {cell.openFindingsCount} gap
                                  </span>
                                )}
                              </div>
                            </button>
                          </td>
                        );
                      })}

                      {/* Department Average Column */}
                      <td className="p-2 text-center font-mono font-bold text-xs">
                        <span className={`px-2 py-1 rounded-lg border flex items-center justify-center space-x-1 ${
                          deptAverage >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : deptAverage >= 50
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          <span>{deptAverage}%</span>
                          {renderDepartmentTrendArrow(dept.id, 'ISO_27701')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {dimensionMode === 'dept_vs_iso' && (
        <div className={`rounded-2xl border shadow-xl overflow-hidden transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Departmental Risk Coverage × ISO 27001:2022 Clauses & Annex A Themes
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                ({HEATMAP_DEPARTMENTS.length} Departments × {HEATMAP_ISO_CLAUSES.length} ISO Clauses = 77 Audit Intersections)
              </span>
            </div>
            <span className="text-xs text-slate-400">Click any cell to inspect or signoff</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  <th className="p-3 sticky left-0 z-10 bg-slate-950 min-w-[200px] border-r border-slate-800">
                    Business Unit / Department
                  </th>
                  {HEATMAP_ISO_CLAUSES.map(clause => {
                    const risk = inherentRisks[clause.clauseCode] || ComplianceHeatmapService.getISOInherentRisk(clause.clauseCode);
                    const isColActive = isColHovered(clause.clauseCode);
                    return (
                      <th
                        key={clause.id}
                        className={`p-2.5 text-center border-r border-slate-800/60 min-w-[96px] transition-all duration-200 ${
                          isColActive
                            ? 'bg-indigo-950/90 text-indigo-100 ring-1 ring-indigo-500/60 border-b-2 border-indigo-400 shadow-md shadow-indigo-950/70'
                            : ''
                        }`}
                      >
                        <div className={`font-mono font-bold text-[11px] flex items-center justify-center space-x-0.5 transition-colors duration-150 ${
                          isColActive ? 'text-indigo-300 font-extrabold' : 'text-white'
                        }`}>
                          <span>{clause.clauseCode}</span>
                          {renderClauseTrendArrow(clause.clauseCode, 'ISO_27001')}
                        </div>
                        <div className={`text-[10px] truncate max-w-[96px] transition-colors duration-150 ${
                          isColActive ? 'text-indigo-200 font-semibold' : 'font-normal text-slate-400'
                        }`} title={clause.title}>
                          {clause.shortTitle}
                        </div>
                        {isInherentRiskWeighted && (
                          <div className="mt-1 flex justify-center">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm border inline-flex items-center space-x-0.5 ${
                                risk.inherentRiskLevel === 'CRITICAL'
                                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/70'
                                  : risk.inherentRiskLevel === 'HIGH'
                                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/70'
                                  : risk.inherentRiskLevel === 'MEDIUM'
                                  ? 'bg-blue-950/90 text-blue-300 border-blue-500/70'
                                  : 'bg-slate-900 text-slate-400 border-slate-700'
                              }`}
                              title={`Inherent Threat Weight: ${risk.inherentRiskWeight}x (${risk.inherentRiskLevel})\nCategory: ${risk.threatCategory}`}
                            >
                              {risk.inherentRiskWeight >= 1.4 && <Flame className="w-2.5 h-2.5 text-rose-400 inline" />}
                              <span>{risk.inherentRiskWeight.toFixed(1)}x</span>
                            </span>
                          </div>
                        )}
                      </th>
                    );
                  })}
                  <th className="p-3 text-center font-mono text-[11px] text-indigo-300 min-w-[95px]">
                    {isInherentRiskWeighted ? 'Risk Wtd Avg' : 'Dept Avg'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {HEATMAP_DEPARTMENTS.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map(dept => {
                  const deptCells = cells.filter(
                    c => c.departmentId === dept.id && c.dimensionType === 'ISO_27001'
                  );
                  const deptScoreData = ComplianceHeatmapService.calculateDepartmentWeightedScore(
                    deptCells,
                    isInherentRiskWeighted
                  );
                  const effectiveAvg = deptScoreData.effectiveAverage;
                  const isRowActive = isRowHovered(dept.id);

                  return (
                    <tr
                      key={dept.id}
                      className={`transition-colors duration-150 ${
                        isRowActive ? 'bg-indigo-950/25' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Department Row Header */}
                      <td className={`p-3 sticky left-0 z-20 border-r transition-all duration-200 ${
                        isRowActive
                          ? 'bg-slate-900 border-r-2 border-indigo-400 shadow-md shadow-indigo-950/60 ring-1 ring-inset ring-indigo-500/50'
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                            isRowActive ? 'scale-125 ring-2 ring-indigo-400' : ''
                          } ${dept.avatarColor}`} />
                          <div>
                            <span className={`font-bold block text-xs transition-colors duration-150 ${
                              isRowActive ? 'text-indigo-300 font-extrabold' : 'text-slate-200'
                            }`}>{dept.name}</span>
                            <span className="text-[10px] text-slate-400">Head: {dept.head}</span>
                          </div>
                        </div>
                      </td>

                      {/* Heatmap Cells */}
                      {HEATMAP_ISO_CLAUSES.map(clause => {
                        const cell = deptCells.find(c => c.targetCode === clause.clauseCode);
                        if (!cell) {
                          return (
                            <td key={clause.id} className="p-2 text-center border-r border-slate-800/40 text-slate-600">
                              -
                            </td>
                          );
                        }

                        const bgClass = getCellBgClass(cell.score, cell.status, clause.clauseCode);
                        const risk = inherentRisks[clause.clauseCode] || ComplianceHeatmapService.getISOInherentRisk(clause.clauseCode);
                        const isAmplified = isInherentRiskWeighted && risk.inherentRiskWeight >= 1.4 && cell.score < 50;
                        const isHovered = hoveredCell?.deptId === dept.id && hoveredCell?.targetCode === clause.clauseCode;
                        const isInSameRow = isRowActive && !isHovered;
                        const isInSameCol = isColHovered(clause.clauseCode) && !isHovered;

                        return (
                          <td key={clause.id} className="p-1.5 border-r border-slate-800/40 text-center relative overflow-visible">
                            <button
                              type="button"
                              onClick={() => handleCellClick(cell)}
                              onMouseEnter={() => setHoveredCell({ deptId: dept.id, targetCode: clause.clauseCode })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`w-full h-16 p-1.5 rounded-xl border transition-all duration-200 ease-out flex flex-col justify-between items-center group cursor-pointer relative ${bgClass} ${
                                isHovered
                                  ? 'scale-110 -translate-y-0.5 z-30 shadow-xl ring-2 ring-indigo-400 brightness-110'
                                  : isInSameRow || isInSameCol
                                  ? 'ring-1 ring-indigo-400/30'
                                  : 'hover:scale-105 shadow-sm'
                              }`}
                              title={`${dept.name} × ${clause.clauseCode}: ${cell.score}% (${cell.status})\nTrend: ${
                                cell.trend === 'UP'
                                  ? `▲ Improved (+${cell.scoreDelta}%)`
                                  : cell.trend === 'DOWN'
                                  ? `▼ Regressed (${cell.scoreDelta}%)`
                                  : '▬ Stable'
                              } vs prior cycle (${cell.previousScore}%)${
                                isInherentRiskWeighted
                                  ? `\nInherent Risk: ${risk.inherentRiskLevel} (${risk.inherentRiskWeight}x)\nThreat: ${risk.threatCategory}`
                                  : ''
                              } - Click to inspect`}
                            >
                              {/* Top: Status Icon & Score */}
                              <div className="w-full flex items-center justify-between">
                                {cell.status === 'COMPLIANT' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ) : cell.status === 'IN_PROGRESS' ? (
                                  <Clock className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <AlertTriangle className={`w-3 h-3 ${isAmplified ? 'text-rose-300 animate-bounce' : 'text-rose-500 animate-pulse'}`} />
                                )}

                                <div className="flex items-center space-x-1">
                                  <span className="font-mono font-black text-xs">
                                    {cell.score}%
                                  </span>
                                  {renderCellTrendArrow(cell, 'md')}
                                </div>
                              </div>

                              {/* Bottom: Controls breakdown & Open Findings alert */}
                              <div className="w-full flex items-center justify-between text-[10px] opacity-85">
                                <span className="font-mono text-[9px]">
                                  {cell.controlsImplemented}/{cell.controlsTotal} ctrl
                                </span>
                                {isInherentRiskWeighted ? (
                                  <span className={`px-1 rounded font-mono font-bold text-[9px] ${
                                    risk.inherentRiskWeight >= 1.4
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                      : 'text-amber-300'
                                  }`}>
                                    {risk.inherentRiskWeight.toFixed(1)}x
                                  </span>
                                ) : (
                                  cell.openFindingsCount > 0 && (
                                    <span className="px-1 rounded bg-rose-950 text-rose-300 font-bold text-[9px] border border-rose-800">
                                      {cell.openFindingsCount} NC
                                    </span>
                                  )
                                )}
                              </div>
                            </button>
                          </td>
                        );
                      })}

                      {/* Dept Avg */}
                      <td className="p-2.5 text-center font-mono font-black text-sm text-white">
                        <span className={`px-2 py-1 rounded-lg border flex items-center justify-center space-x-1 ${
                          effectiveAvg >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : effectiveAvg >= 50
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          <span>{effectiveAvg}%</span>
                          {renderDepartmentTrendArrow(dept.id, 'ISO_27001')}
                        </span>
                        {isInherentRiskWeighted && deptScoreData.weightedAverage !== deptScoreData.rawAverage && (
                          <span className="text-[9px] text-slate-400 block font-mono mt-0.5" title="Raw Unweighted Score">
                            Raw: {deptScoreData.rawAverage}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Dimension: Department vs MAS TRM Modules */}
      {dimensionMode === 'dept_vs_mas' && (
        <div className={`rounded-2xl border shadow-xl overflow-hidden transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">
                Departmental Risk Coverage × MAS TRM 2024 Modules / Domains (3.0 - 16.0)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                ({HEATMAP_DEPARTMENTS.length} Departments × {HEATMAP_MAS_MODULES.length} MAS Domains)
              </span>
            </div>
            <span className="text-xs text-slate-400">Click any cell to inspect statutory evidence</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  <th className="p-3 sticky left-0 z-10 bg-slate-950 min-w-[200px] border-r border-slate-800">
                    Business Unit / Department
                  </th>
                  {HEATMAP_MAS_MODULES.map(mod => {
                    const isColActive = isColHovered(mod.domainNumber);
                    return (
                      <th
                        key={mod.id}
                        className={`p-2.5 text-center border-r border-slate-800/60 min-w-[92px] transition-all duration-200 ${
                          isColActive
                            ? 'bg-rose-950/90 text-rose-100 ring-1 ring-rose-500/60 border-b-2 border-rose-400 shadow-md shadow-rose-950/70'
                            : ''
                        }`}
                      >
                        <div className={`font-mono font-bold text-[11px] flex items-center justify-center space-x-0.5 transition-colors duration-150 ${
                          isColActive ? 'text-rose-300 font-extrabold' : 'text-white'
                        }`}>
                          <span>{mod.domainNumber}</span>
                          {renderClauseTrendArrow(mod.domainNumber, 'MAS_TRM')}
                        </div>
                        <div className={`text-[10px] truncate max-w-[92px] transition-colors duration-150 ${
                          isColActive ? 'text-rose-200 font-semibold' : 'font-normal text-slate-400'
                        }`} title={mod.title}>
                          {mod.shortTitle}
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-3 text-center font-mono text-[11px] text-rose-300 min-w-[90px]">
                    MAS Avg
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {HEATMAP_DEPARTMENTS.filter(d => departmentFilter === 'ALL' || d.id === departmentFilter).map(dept => {
                  const deptCells = cells.filter(
                    c => c.departmentId === dept.id && c.dimensionType === 'MAS_TRM'
                  );
                  const deptAverage = deptCells.length > 0
                    ? Math.round(deptCells.reduce((a, b) => a + b.score, 0) / deptCells.length)
                    : 0;
                  const isRowActive = isRowHovered(dept.id);

                  return (
                    <tr
                      key={dept.id}
                      className={`transition-colors duration-150 ${
                        isRowActive ? 'bg-rose-950/25' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Dept Header */}
                      <td className={`p-3 sticky left-0 z-20 border-r transition-all duration-200 ${
                        isRowActive
                          ? 'bg-slate-900 border-r-2 border-rose-400 shadow-md shadow-rose-950/60 ring-1 ring-inset ring-rose-500/50'
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                            isRowActive ? 'scale-125 ring-2 ring-rose-400' : ''
                          } ${dept.avatarColor}`} />
                          <div>
                            <span className={`font-bold block text-xs transition-colors duration-150 ${
                              isRowActive ? 'text-rose-300 font-extrabold' : 'text-slate-200'
                            }`}>{dept.name}</span>
                            <span className="text-[10px] text-slate-400">Head: {dept.head}</span>
                          </div>
                        </div>
                      </td>

                      {/* Heatmap Cells */}
                      {HEATMAP_MAS_MODULES.map(mod => {
                        const cell = deptCells.find(c => c.targetCode === mod.domainNumber);
                        if (!cell) {
                          return (
                            <td key={mod.id} className="p-2 text-center border-r border-slate-800/40 text-slate-600">
                              -
                            </td>
                          );
                        }

                        const bgClass = getCellBgClass(cell.score, cell.status);
                        const isHovered = hoveredCell?.deptId === dept.id && hoveredCell?.targetCode === mod.domainNumber;
                        const isInSameRow = isRowActive && !isHovered;
                        const isInSameCol = isColHovered(mod.domainNumber) && !isHovered;

                        return (
                          <td key={mod.id} className="p-1.5 border-r border-slate-800/40 text-center relative overflow-visible">
                            <button
                              type="button"
                              onClick={() => handleCellClick(cell)}
                              onMouseEnter={() => setHoveredCell({ deptId: dept.id, targetCode: mod.domainNumber })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`w-full h-16 p-1.5 rounded-xl border transition-all duration-200 ease-out flex flex-col justify-between items-center group cursor-pointer relative ${bgClass} ${
                                isHovered
                                  ? 'scale-110 -translate-y-0.5 z-30 shadow-xl ring-2 ring-rose-400 brightness-110'
                                  : isInSameRow || isInSameCol
                                  ? 'ring-1 ring-rose-400/30'
                                  : 'hover:scale-105 shadow-sm'
                              }`}
                              title={`${dept.name} × ${mod.domainNumber} (${mod.title}): ${cell.score}% (${cell.status})\nTrend: ${
                                cell.trend === 'UP'
                                  ? `▲ Improved (+${cell.scoreDelta}%)`
                                  : cell.trend === 'DOWN'
                                  ? `▼ Regressed (${cell.scoreDelta}%)`
                                  : '▬ Stable'
                              } vs prior cycle (${cell.previousScore}%)`}
                            >
                              <div className="w-full flex items-center justify-between">
                                {cell.status === 'COMPLIANT' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ) : cell.status === 'IN_PROGRESS' ? (
                                  <Clock className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                                )}

                                <div className="flex items-center space-x-1">
                                  <span className="font-mono font-black text-xs">
                                    {cell.score}%
                                  </span>
                                  {renderCellTrendArrow(cell, 'md')}
                                </div>
                              </div>

                              <div className="w-full flex items-center justify-between text-[10px] opacity-85">
                                <span className="font-mono text-[9px]">
                                  {cell.controlsImplemented}/{cell.controlsTotal} req
                                </span>
                                {cell.openFindingsCount > 0 && (
                                  <span className="px-1 rounded bg-rose-950 text-rose-300 font-bold text-[9px] border border-rose-800">
                                    {cell.openFindingsCount} Gap
                                  </span>
                                )}
                              </div>
                            </button>
                          </td>
                        );
                      })}

                      {/* Dept Avg */}
                      <td className="p-2.5 text-center font-mono font-black text-sm text-white">
                        <span className={`px-2 py-1 rounded-lg border flex items-center justify-center space-x-1 ${
                          deptAverage >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : deptAverage >= 50
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          <span>{deptAverage}%</span>
                          {renderDepartmentTrendArrow(dept.id, 'MAS_TRM')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Dimension: Crosswalk Harmonization Matrix (ISO 27001 × MAS TRM) */}
      {dimensionMode === 'iso_vs_mas_crosswalk' && (
        <div className={`rounded-2xl border shadow-xl p-5 space-y-4 transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Multi-Standard Regulatory Crosswalk Matrix (ISO 27001:2022 ↔ MAS TRM)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Harmonized control mapping identifying dual-compliance coverage and shared regulatory breach risks.
              </p>
            </div>
            <button
              onClick={() => {
                if (onNavigateModule) onNavigateModule('multi_framework_harmonizer');
              }}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>Harmonizer Workbench</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crosswalkData.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  item.status === 'COMPLIANT'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : item.status === 'IN_PROGRESS'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-rose-950/30 border-rose-500/40 shadow-rose-950/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'COMPLIANT'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'IN_PROGRESS'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {item.auditCoverageStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-black text-sm text-white">
                      {item.overlapScore}% Harmonized
                    </span>
                  </div>

                  {/* Dual Crosswalk Mapping */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-400 block">ISO 27001 Ref</span>
                      <span className="font-bold text-white block mt-0.5">{item.isoClauseCode}</span>
                      <span className="text-[11px] text-slate-400 truncate block">{item.isoClauseTitle}</span>
                    </div>
                    <div className="border-l border-slate-800 pl-2">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block">MAS TRM Domain</span>
                      <span className="font-bold text-white block mt-0.5">{item.masDomainNumber}</span>
                      <span className="text-[11px] text-slate-400 truncate block">{item.masDomainTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.harmonizedControlsCount} Shared Controls</span>
                    {item.jointGapsCount > 0 ? (
                      <span className="text-rose-400 font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{item.jointGapsCount} Shared Non-Conformities</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Zero Shared Gaps</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {item.recommendedAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Dimension: Department Multi-Standard Composite Risk Heatmap */}
      {dimensionMode === 'department_composite' && (
        <div className={`rounded-2xl border shadow-xl p-5 space-y-4 transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Departmental Multi-Standard Composite Risk Heatmap</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated compliance posture per operational unit across ISO 27001, MAS TRM, and active threat exposure.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Weighted Risk Index</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HEATMAP_DEPARTMENTS.map(dept => {
              const deptISOCells = cells.filter(
                c => c.departmentId === dept.id && c.dimensionType === 'ISO_27001'
              );
              const deptMASCells = cells.filter(
                c => c.departmentId === dept.id && c.dimensionType === 'MAS_TRM'
              );

              const isoAvg = deptISOCells.length > 0
                ? Math.round(deptISOCells.reduce((a, b) => a + b.score, 0) / deptISOCells.length)
                : 0;
              const masAvg = deptMASCells.length > 0
                ? Math.round(deptMASCells.reduce((a, b) => a + b.score, 0) / deptMASCells.length)
                : 0;
              const compositeScore = Math.round((isoAvg + masAvg) / 2);

              const openFindings =
                deptISOCells.reduce((a, b) => a + b.openFindingsCount, 0) +
                deptMASCells.reduce((a, b) => a + b.openFindingsCount, 0);

              const criticalRisks =
                deptISOCells.filter(c => c.riskLevel === 'CRITICAL').length +
                deptMASCells.filter(c => c.riskLevel === 'CRITICAL').length;

              const status: HeatmapStatus =
                compositeScore >= 85 ? 'COMPLIANT' : compositeScore >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT';

              const statusClass =
                status === 'COMPLIANT'
                  ? 'status-compliant'
                  : status === 'IN_PROGRESS'
                  ? 'status-in-progress'
                  : 'status-non-compliant';

              return (
                <div
                  key={dept.id}
                  className={`dept-card-interactive ${statusClass} p-4 rounded-xl border space-y-3 cursor-pointer select-none ${
                    status === 'COMPLIANT'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : status === 'IN_PROGRESS'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-rose-950/30 border-rose-500/40 shadow-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${dept.avatarColor}`} />
                      <div>
                        <h4 className="font-bold text-sm text-white">{dept.name}</h4>
                        <span className="text-[11px] text-slate-400">Officer: {dept.head}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xl font-black font-mono ${
                        compositeScore >= 85 ? 'text-emerald-400' : compositeScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {compositeScore}%
                      </span>
                      {renderDepartmentTrendArrow(dept.id)}
                    </div>
                  </div>

                  {/* Framework Score Progress Bars */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>ISO 27001 Coverage:</span>
                        <span className="font-mono text-sky-400 font-bold flex items-center space-x-0.5">
                          <span>{isoAvg}%</span>
                          {renderDepartmentTrendArrow(dept.id, 'ISO_27001')}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isoAvg >= 85 ? 'bg-emerald-500' : isoAvg >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${isoAvg}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>MAS TRM Compliance:</span>
                        <span className="font-mono text-rose-400 font-bold flex items-center space-x-0.5">
                          <span>{masAvg}%</span>
                          {renderDepartmentTrendArrow(dept.id, 'MAS_TRM')}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            masAvg >= 85 ? 'bg-emerald-500' : masAvg >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${masAvg}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer Badges */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60 text-slate-400">
                    <span className="flex items-center space-x-1">
                      <span>{dept.criticalSystemsCount} Critical Systems</span>
                    </span>
                    {openFindings > 0 ? (
                      <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {openFindings} Open Findings
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Zero Gaps</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. Deep-Dive Inspection Modal */}
      <ComplianceHeatmapDetailModal
        isOpen={isDetailModalOpen}
        cell={selectedCell}
        onClose={() => setIsDetailModalOpen(false)}
        onCellUpdated={handleCellUpdated}
        onNavigateModule={onNavigateModule}
      />
    </div>
  );
};
