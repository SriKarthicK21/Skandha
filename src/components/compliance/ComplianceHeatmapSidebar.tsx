// Skanda GRC — Compliance Heatmap Sidebar Detail View
// Displays deep-dive forensic context and the complete list of underlying controls
// for a specific CMMI Maturity Level (Levels 1-5) and Department x Standard cell intersection.
// Supports interactive control status updates, maturity progression ladder, gap analysis,
// and seamless handoff to the full forensic modal.

import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  User,
  ExternalLink,
  Maximize2,
  Download,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertOctagon,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  ShieldAlert,
  CheckSquare,
  Square,
  TrendingUp,
  Building,
  Hash,
  ArrowRight,
  RefreshCw,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  HeatmapCellData,
  HeatmapStatus,
  HeatmapCellControlItem,
  HeatmapCellTask,
  ComplianceHeatmapService
} from '../../services/complianceHeatmapService';
import { MATURITY_TIERS, MaturityTierInfo, getCellMaturityTier } from './ComplianceHeatmap';
import { MaturitySparkline } from './MaturitySparkline';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface ComplianceHeatmapSidebarProps {
  isOpen: boolean;
  cell: HeatmapCellData | null;
  onClose: () => void;
  onCellUpdated?: (updated: HeatmapCellData) => void;
  onOpenFullModal?: (cell: HeatmapCellData) => void;
  onNavigateModule?: (moduleId: string) => void;
  complianceOverlayActive?: boolean;
}

export const ComplianceHeatmapSidebar: React.FC<ComplianceHeatmapSidebarProps> = ({
  isOpen,
  cell,
  onClose,
  onCellUpdated,
  onOpenFullModal,
  onNavigateModule,
  complianceOverlayActive = false
}) => {
  const { theme, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  // Active filter states
  const [controlSearch, setControlSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | HeatmapStatus | 'MANDATORY'>('ALL');
  const [activeTab, setActiveTab] = useState<'controls' | 'tasks' | 'progression'>('controls');

  // Derive current maturity tier
  const maturityTier = useMemo<MaturityTierInfo>(() => {
    if (!cell) return MATURITY_TIERS[1];
    return getCellMaturityTier(cell.score);
  }, [cell]);

  // Filtered underlying controls
  const filteredControls = useMemo(() => {
    if (!cell?.keyControls) return [];
    let list = [...cell.keyControls];

    if (statusFilter === 'MANDATORY') {
      list = list.filter(c => c.mandatory);
    } else if (statusFilter !== 'ALL') {
      list = list.filter(c => c.status === statusFilter);
    }

    if (controlSearch.trim()) {
      const q = controlSearch.toLowerCase();
      list = list.filter(
        c =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.assignedLead && c.assignedLead.toLowerCase().includes(q))
      );
    }

    return list;
  }, [cell?.keyControls, statusFilter, controlSearch]);

  // Underlying control summary counts
  const controlStats = useMemo(() => {
    const list = cell?.keyControls || [];
    const total = list.length;
    const compliant = list.filter(c => c.status === 'COMPLIANT').length;
    const inProgress = list.filter(c => c.status === 'IN_PROGRESS').length;
    const nonCompliant = list.filter(c => c.status === 'NON_COMPLIANT').length;
    const mandatory = list.filter(c => c.mandatory).length;

    return { total, compliant, inProgress, nonCompliant, mandatory };
  }, [cell?.keyControls]);

  // CMMI Advancement Gap Analysis
  const advancementGaps = useMemo(() => {
    if (!cell) return null;
    const currentTierNum = maturityTier.tier;
    const nextTierNum = Math.min(5, currentTierNum + 1) as 1 | 2 | 3 | 4 | 5;
    const isAtMax = currentTierNum === 5;

    const blockingControls = (cell.keyControls || []).filter(
      c => c.status === 'NON_COMPLIANT' || (nextTierNum >= 4 && c.status !== 'COMPLIANT')
    );

    let thresholdScore = 40;
    if (nextTierNum === 2) thresholdScore = 40;
    else if (nextTierNum === 3) thresholdScore = 60;
    else if (nextTierNum === 4) thresholdScore = 75;
    else if (nextTierNum === 5) thresholdScore = 90;

    const pointsNeeded = Math.max(0, thresholdScore - cell.score);

    return {
      currentTierNum,
      nextTierNum,
      isAtMax,
      nextTierInfo: MATURITY_TIERS[nextTierNum],
      blockingControls,
      pointsNeeded,
      thresholdScore
    };
  }, [cell, maturityTier]);

  // Update control status handler
  const handleUpdateControlStatus = (controlCode: string, newStatus: HeatmapStatus) => {
    if (!cell) return;
    const updated = ComplianceHeatmapService.updateControlStatus(cell.id, controlCode, newStatus);
    if (updated) {
      if (onCellUpdated) onCellUpdated(updated);
      logAuditEvent(
        'UPDATE',
        'Compliance Heatmap Control Update',
        `Updated control ${controlCode} in ${cell.departmentName} (${cell.targetCode}) to ${newStatus}. New score: ${updated.score}%.`
      );
      showToast({
        title: `Control ${controlCode} Updated`,
        message: `Set to ${newStatus}. Cell maturity score recalibrated to ${updated.score}%.`,
        type: newStatus === 'COMPLIANT' ? 'success' : newStatus === 'IN_PROGRESS' ? 'warning' : 'error'
      });
    }
  };

  // Toggle task status
  const handleToggleTask = (taskId: string, currentStatus: HeatmapCellTask['status']) => {
    if (!cell) return;
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const updated = ComplianceHeatmapService.toggleTaskStatus(cell.id, taskId, nextStatus);
    if (updated) {
      if (onCellUpdated) onCellUpdated(updated);
      logAuditEvent(
        'UPDATE',
        'Compliance Heatmap Task',
        `Task ${taskId} in ${cell.departmentName} marked as ${nextStatus}. Score: ${updated.score}%.`
      );
      showToast({
        title: nextStatus === 'COMPLETED' ? 'Remediation Task Completed' : 'Task Reopened',
        message: `${cell.targetCode} score recalibrated to ${updated.score}%`,
        type: nextStatus === 'COMPLETED' ? 'success' : 'info'
      });
    }
  };

  // Export controls CSV
  const handleExportControlsCSV = () => {
    if (!cell) return;
    const headers = ['Control Code', 'Title', 'Status', 'Mandatory', 'Evidence Ref', 'Remediation SLA', 'Assigned Lead', 'Deficiency Reason'];
    const rows = (cell.keyControls || []).map(c => [
      `"${c.code}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      c.mandatory ? 'YES' : 'NO',
      `"${c.evidenceRef || ''}"`,
      c.remediationSlaDays ? `${c.remediationSlaDays} Days` : 'N/A',
      `"${c.assignedLead || cell.controlOwner}"`,
      `"${(c.nonComplianceReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Skanda-Controls-${cell.departmentName.replace(/\s+/g, '_')}-${cell.targetCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Controls Exported',
      message: `Exported ${cell.keyControls.length} controls for ${cell.targetCode}`,
      type: 'success'
    });
  };

  if (!isOpen || !cell) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="heatmap-sidebar-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          id="compliance-heatmap-sidebar-panel"
          className={`w-screen max-w-xl md:max-w-2xl xl:max-w-3xl transform transition-transform ease-out duration-300 flex flex-col shadow-2xl ${
            theme === 'light'
              ? 'bg-white border-l border-slate-200 text-slate-900'
              : 'bg-slate-900 border-l border-slate-800 text-slate-100'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono">
                  <Building className="w-3 h-3 mr-1" />
                  <span>{cell.departmentName}</span>
                </span>

                <span className="inline-flex items-center text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {cell.dimensionType.replace('_', ' ')}
                </span>

                <span className="text-xs text-slate-400 font-mono">
                  • {cell.targetCode}
                </span>
              </div>

              <h2 id="heatmap-sidebar-title" className="text-base sm:text-lg font-bold truncate leading-tight">
                {cell.targetTitle}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                CMMI Maturity Level Breakdown & Underlying Control Verification
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1.5 shrink-0">
              {onOpenFullModal && (
                <button
                  onClick={() => onOpenFullModal(cell)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Expand to Full Forensic Inspection Modal"
                  aria-label="Expand to full modal"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleExportControlsCSV}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Export Controls CSV"
                aria-label="Export controls"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Close Sidebar"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* 1. CMMI Maturity Level Highlight Banner */}
            <div
              className={`p-4 rounded-xl border relative overflow-hidden ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border uppercase tracking-wider ${maturityTier.badgeClass}`}
                    >
                      {maturityTier.label}
                    </span>

                    <MaturitySparkline
                      scores={cell.historicalScores}
                      currentScore={cell.score}
                      previousScore={cell.previousScore}
                      scoreDelta={cell.scoreDelta}
                      trend={cell.trend}
                      size="sm"
                      showSparkline={true}
                      showArrow={true}
                      showDeltaText={true}
                      fillArea={true}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {maturityTier.description}
                  </p>
                </div>

                {/* Score badge & Residual Risk */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
                      {cell.score}%
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Compliance Score
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border mt-1.5 ${
                      cell.riskLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40'
                        : cell.riskLevel === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/40'
                        : cell.riskLevel === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {cell.riskLevel} RESIDUAL RISK
                  </span>
                </div>
              </div>

              {/* CMMI 5-Tier Maturity Stepper */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span>CMMI Regulatory Maturity Ladder:</span>
                  <span className="font-mono text-indigo-500">Tier {maturityTier.tier} of 5</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map(level => {
                    const tierObj = MATURITY_TIERS[level];
                    const isCurrent = level === maturityTier.tier;
                    const isPast = level < maturityTier.tier;

                    return (
                      <div
                        key={level}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          isCurrent
                            ? `${tierObj.badgeClass} ring-2 ring-indigo-500 shadow-sm font-bold`
                            : isPast
                            ? 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            : 'bg-slate-100/40 dark:bg-slate-900/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-bold">L{level}</div>
                        <div className="text-[9px] truncate mt-0.5">{tierObj.shortLabel.split(' ')[1]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit Cycle Historical Trajectory Progression */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Maturity Trajectory (5 Audit Cycles):</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Cycle 1 &rarr; Active Assessment
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <MaturitySparkline
                      scores={cell.historicalScores}
                      currentScore={cell.score}
                      previousScore={cell.previousScore}
                      scoreDelta={cell.scoreDelta}
                      trend={cell.trend}
                      size="lg"
                      showSparkline={true}
                      showArrow={true}
                      showDeltaText={true}
                      fillArea={true}
                    />
                    <div className="text-xs">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Cycle-over-Cycle
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cell.trend === 'UP'
                          ? `+${Math.abs(cell.scoreDelta ?? 0)}% Improvement from Cycle 4`
                          : cell.trend === 'DOWN'
                          ? `-${Math.abs(cell.scoreDelta ?? 0)}% Regression from Cycle 4`
                          : 'Consistent Maturity Stability'}
                      </span>
                    </div>
                  </div>

                  {cell.historicalScores && cell.historicalScores.length > 0 && (
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {cell.historicalScores.map((score, idx) => (
                        <div key={idx} className="text-center">
                          <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            idx === cell.historicalScores!.length - 1
                              ? 'bg-indigo-500 text-white shadow-xs'
                              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {score}%
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">
                            {idx === cell.historicalScores!.length - 1 ? 'Current' : `C${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Control Summary Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-[10px] font-medium text-slate-400 uppercase">Underlying Controls</span>
                <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">{controlStats.total}</p>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase">Compliant</span>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{controlStats.compliant}</p>
              </div>

              <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">In Progress</span>
                <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{controlStats.inProgress}</p>
              </div>

              <div className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 uppercase">Non-Compliant</span>
                <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">{controlStats.nonCompliant}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('controls')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'controls'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Underlying Controls ({controlStats.total})</span>
              </button>

              <button
                onClick={() => setActiveTab('progression')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'progression'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Maturity Advancement</span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'tasks'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Remediation Tasks ({(cell.outstandingTasks || []).length})</span>
              </button>
            </div>

            {/* TAB 1: UNDERLYING CONTROLS FOR THIS CMMI LEVEL */}
            {activeTab === 'controls' && (
              <div className="space-y-3.5">
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={controlSearch}
                      onChange={e => setControlSearch(e.target.value)}
                      placeholder="Search control code, title, or lead..."
                      className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                          : 'bg-slate-950 border-slate-800 text-slate-100 focus:bg-slate-900'
                      } outline-hidden focus:ring-1 focus:ring-indigo-500`}
                    />
                    {controlSearch && (
                      <button
                        onClick={() => setControlSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                    {(['ALL', 'NON_COMPLIANT', 'IN_PROGRESS', 'COMPLIANT', 'MANDATORY'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                          statusFilter === filter
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {filter === 'ALL'
                          ? 'All'
                          : filter === 'NON_COMPLIANT'
                          ? `Gaps (${controlStats.nonCompliant})`
                          : filter === 'IN_PROGRESS'
                          ? `Active (${controlStats.inProgress})`
                          : filter === 'COMPLIANT'
                          ? `Met (${controlStats.compliant})`
                          : `Mandatory (${controlStats.mandatory})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control Cards List */}
                <div className="space-y-3">
                  {filteredControls.length === 0 ? (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                      No controls found matching filter criteria.
                    </div>
                  ) : (
                    filteredControls.map(ctrl => {
                      const isNonCompliant = ctrl.status === 'NON_COMPLIANT';
                      const isInProgress = ctrl.status === 'IN_PROGRESS';
                      const isCompliant = ctrl.status === 'COMPLIANT';

                      return (
                        <div
                          key={ctrl.code}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isNonCompliant
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-900/50'
                              : isInProgress
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-900/50'
                              : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                {ctrl.code}
                              </span>

                              {ctrl.mandatory && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                                  Mandatory
                                </span>
                              )}

                              <span className="text-[10px] font-mono text-slate-400">
                                CMMI L{maturityTier.tier} Baseline
                              </span>
                            </div>

                            {/* Status Modifier Selector */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <select
                                value={ctrl.status}
                                onChange={e => handleUpdateControlStatus(ctrl.code, e.target.value as HeatmapStatus)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-hidden transition cursor-pointer ${
                                  isCompliant
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                                    : isInProgress
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40'
                                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                                }`}
                              >
                                <option value="COMPLIANT">Compliant</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="NON_COMPLIANT">Non-Compliant</option>
                              </select>
                            </div>
                          </div>

                          <h3 className="font-bold text-xs sm:text-sm mt-2 text-slate-900 dark:text-white">
                            {ctrl.title}
                          </h3>

                          {ctrl.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {ctrl.description}
                            </p>
                          )}

                          {/* Deficiency Callout for Non-Compliant or In-Progress */}
                          {ctrl.nonComplianceReason && (
                            <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                              <div className="flex-1">
                                <span className="font-semibold text-[11px] uppercase tracking-wider block">
                                  Deficiency / Audit Finding:
                                </span>
                                <span className="text-[11px] leading-normal">{ctrl.nonComplianceReason}</span>
                              </div>
                            </div>
                          )}

                          {/* Metadata row */}
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{ctrl.assignedLead || cell.controlOwner}</span>
                              </span>

                              {ctrl.evidenceRef && (
                                <span className="flex items-center space-x-1 font-mono text-[10px] text-indigo-500">
                                  <FileText className="w-3 h-3" />
                                  <span>{ctrl.evidenceRef}</span>
                                </span>
                              )}
                            </div>

                            {ctrl.remediationSlaDays !== undefined && (
                              <span
                                className={`inline-flex items-center space-x-1 font-semibold text-[10px] px-2 py-0.5 rounded ${
                                  ctrl.remediationSlaDays <= 7
                                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                <Clock className="w-2.5 h-2.5 mr-0.5" />
                                <span>SLA: {ctrl.remediationSlaDays} Days Remaining</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: CMMI PROGRESSION & GAP ANALYSIS */}
            {activeTab === 'progression' && advancementGaps && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    theme === 'light' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900/50'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                    <Award className="w-4 h-4" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      Maturity Advancement Roadmap
                    </h3>
                  </div>

                  {advancementGaps.isAtMax ? (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      This control node has reached the maximum CMMI Level 5 (Optimizing) with continuous telemetry, closed-loop CAPA, and automated compliance auditing.
                    </div>
                  ) : (
                    <div className="mt-2 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                      <p>
                        Current: <strong className="text-slate-900 dark:text-white">{maturityTier.label}</strong> ({cell.score}%).
                        To advance to <strong className="text-indigo-600 dark:text-indigo-400">{advancementGaps.nextTierInfo.label}</strong> (≥ {advancementGaps.thresholdScore}%), the cell requires an additional <span className="font-mono font-bold text-indigo-500">+{advancementGaps.pointsNeeded}%</span> compliance score.
                      </p>
                    </div>
                  )}
                </div>

                {/* Blocking Controls to Advance */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Remediation Priority Controls ({advancementGaps.blockingControls.length})</span>
                    <span className="text-[10px] font-normal text-slate-400">Required to reach next CMMI tier</span>
                  </h4>

                  {advancementGaps.blockingControls.length === 0 ? (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>All underlying controls meet minimum criteria for current maturity tier.</span>
                    </div>
                  ) : (
                    advancementGaps.blockingControls.map(ctrl => (
                      <div
                        key={ctrl.code}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                              {ctrl.code}
                            </span>
                            <span className="font-semibold text-xs truncate text-slate-900 dark:text-white">
                              {ctrl.title}
                            </span>
                          </div>
                          {ctrl.nonComplianceReason && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {ctrl.nonComplianceReason}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleUpdateControlStatus(ctrl.code, 'COMPLIANT')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer whitespace-nowrap"
                        >
                          Mark Compliant
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: OUTSTANDING TASKS & CAPA */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {(!cell.outstandingTasks || cell.outstandingTasks.length === 0) ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                    No active remediation tasks assigned to this cell.
                  </div>
                ) : (
                  cell.outstandingTasks.map(task => {
                    const isCompleted = task.status === 'COMPLETED';

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCompleted
                            ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 opacity-70'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTask(task.id, task.status)}
                              className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                              title={isCompleted ? 'Reopen task' : 'Mark completed'}
                            >
                              {isCompleted ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <span
                                className={`text-xs font-bold block ${
                                  isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {task.title}
                              </span>

                              {task.description && (
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                                  {task.description}
                                </p>
                              )}

                              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                  Ctrl {task.relatedControlCode}
                                </span>
                                <span>Due: {task.dueDate}</span>
                                <span>Assignee: {task.assignee}</span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              task.priority === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                : task.priority === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-400 truncate">
              Lead Owner: <span className="font-semibold text-slate-600 dark:text-slate-200">{cell.controlOwner}</span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {onOpenFullModal && (
                <button
                  onClick={() => onOpenFullModal(cell)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Full Forensic Modal</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default ComplianceHeatmapSidebar;
