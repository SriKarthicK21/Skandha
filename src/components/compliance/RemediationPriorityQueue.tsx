// Skanda GRC — Remediation Priority Queue Component
// Displays an actionable list of evaluated controls that are currently 'High Risk'
// or 'Requires Urgent Remediation' for immediate action planning and executive mitigation.

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  Sparkles,
  User,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckSquare,
  FileText,
  AlertOctagon,
  TrendingDown,
  Layers
} from 'lucide-react';
import { HeatmapCellData, HeatmapStatus, RiskSeverityLevel } from '../../services/complianceHeatmapService';
import { useToast } from '../common/ToastContainer';

export interface RemediationQueueItem {
  id: string;
  controlCode: string;
  controlTitle: string;
  departmentId: string;
  departmentName: string;
  departmentLead: string;
  framework: 'ISO 27001' | 'MAS TRM' | 'ISO 27701';
  category: 'URGENT_REMEDIATION' | 'HIGH_RISK';
  urgencySeverity: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  adherenceScore: number;
  status: HeatmapStatus;
  gapDescription: string;
  recommendedAction: string;
  slaStatus: 'OVERDUE' | 'DUE_SOON' | 'ACTIVE';
  slaDays: number;
  openFindingsCount: number;
  capaTicketId: string;
  cellRef: HeatmapCellData;
  mandatory?: boolean;
}

interface RemediationPriorityQueueProps {
  theme?: 'light' | 'dark' | 'midnight' | string;
  cells: HeatmapCellData[];
  onSelectCell?: (cell: HeatmapCellData) => void;
  onCellUpdated?: (updatedCell: HeatmapCellData) => void;
  className?: string;
  defaultCategoryFilter?: 'ALL' | 'URGENT_REMEDIATION' | 'HIGH_RISK';
}

export const RemediationPriorityQueue: React.FC<RemediationPriorityQueueProps> = ({
  theme = 'dark',
  cells,
  onSelectCell,
  onCellUpdated,
  className = '',
  defaultCategoryFilter = 'ALL'
}) => {
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'URGENT_REMEDIATION' | 'HIGH_RISK'>(
    defaultCategoryFilter
  );
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'URGENCY' | 'SCORE_ASC' | 'SLA_OVERDUE' | 'CODE'>('URGENCY');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isQueueCollapsed, setIsQueueCollapsed] = useState<boolean>(false);
  const [remediatedItemIds, setRemediatedItemIds] = useState<Set<string>>(new Set());

  // Extract prioritized controls from evaluated heatmap cells
  const queueItems = useMemo<RemediationQueueItem[]>(() => {
    const items: RemediationQueueItem[] = [];

    cells.forEach(cell => {
      const isCellHighRisk = cell.score < 60 || cell.status === 'NON_COMPLIANT' || cell.riskLevel === 'CRITICAL' || cell.riskLevel === 'HIGH';
      const isCellUrgent = cell.score < 45 || cell.status === 'NON_COMPLIANT' || cell.riskLevel === 'CRITICAL';

      // 1. If cell has specific keyControls, evaluate each one
      if (cell.keyControls && cell.keyControls.length > 0) {
        cell.keyControls.forEach((ctrl, idx) => {
          const isCtrlNonCompliant = ctrl.status === 'NON_COMPLIANT';
          const isCtrlUrgent = isCtrlNonCompliant && (ctrl.mandatory || cell.score < 45 || cell.riskLevel === 'CRITICAL');
          const isCtrlHighRisk = isCtrlNonCompliant || (isCellHighRisk && ctrl.status !== 'COMPLIANT');

          if (isCtrlUrgent || isCtrlHighRisk) {
            const relatedTask = cell.outstandingTasks?.find(t => t.relatedControlCode === ctrl.code);
            const slaDays = relatedTask ? -relatedTask.daysOutstanding : -(idx * 3 + 2);
            const slaStatus: 'OVERDUE' | 'DUE_SOON' | 'ACTIVE' =
              slaDays < 0 ? 'OVERDUE' : slaDays <= 3 ? 'DUE_SOON' : 'ACTIVE';

            items.push({
              id: `queue-${cell.id}-${ctrl.code}`,
              controlCode: ctrl.code,
              controlTitle: ctrl.title,
              departmentId: cell.departmentId,
              departmentName: cell.departmentName,
              departmentLead: ctrl.assignedLead || cell.controlOwner || 'Assigned Lead',
              framework:
                cell.dimensionType === 'ISO_27001'
                  ? 'ISO 27001'
                  : cell.dimensionType === 'MAS_TRM'
                  ? 'MAS TRM'
                  : 'ISO 27701',
              category: isCtrlUrgent ? 'URGENT_REMEDIATION' : 'HIGH_RISK',
              urgencySeverity: isCtrlUrgent ? 'CRITICAL' : cell.riskLevel === 'CRITICAL' ? 'HIGH' : 'ELEVATED',
              adherenceScore: isCtrlNonCompliant ? Math.min(cell.score, 45) : cell.score,
              status: ctrl.status,
              gapDescription:
                ctrl.nonComplianceReason ||
                `Control non-conformity detected in ${cell.departmentName}. Mandatory audit evidence missing.`,
              recommendedAction:
                relatedTask?.description ||
                `Implement automated technical control verification and complete formal risk mitigation pack for ${ctrl.code}.`,
              slaStatus,
              slaDays,
              openFindingsCount: cell.openFindingsCount || cell.topFindings?.length || 1,
              capaTicketId: relatedTask?.capaRef || `CAPA-2026-${(cell.departmentId.charCodeAt(5) || 77) * 10 + idx + 10}`,
              cellRef: cell,
              mandatory: ctrl.mandatory
            });
          }
        });
      } else if (isCellHighRisk) {
        // Fallback: evaluate the cell node itself if no child controls
        const slaDays = cell.score < 45 ? -5 : -2;
        items.push({
          id: `queue-${cell.id}`,
          controlCode: cell.targetCode,
          controlTitle: cell.targetTitle,
          departmentId: cell.departmentId,
          departmentName: cell.departmentName,
          departmentLead: cell.controlOwner || 'Assigned Lead',
          framework:
            cell.dimensionType === 'ISO_27001'
              ? 'ISO 27001'
              : cell.dimensionType === 'MAS_TRM'
              ? 'MAS TRM'
              : 'ISO 27701',
          category: isCellUrgent ? 'URGENT_REMEDIATION' : 'HIGH_RISK',
          urgencySeverity: isCellUrgent ? 'CRITICAL' : 'HIGH',
          adherenceScore: cell.score,
          status: cell.status,
          gapDescription: `Operational adherence score of ${cell.score}% is below required regulatory threshold.`,
          recommendedAction: `Deploy remediating policy controls, verify audit evidence, and dispatch CAPA workflow.`,
          slaStatus: 'OVERDUE',
          slaDays,
          openFindingsCount: cell.openFindingsCount || 1,
          capaTicketId: `CAPA-2026-0${cell.score + 10}`,
          cellRef: cell,
          mandatory: true
        });
      }
    });

    return items;
  }, [cells]);

  // Filtered queue items
  const filteredItems = useMemo(() => {
    let result = [...queueItems];

    // Filter out items already remediated in session
    result = result.filter(item => !remediatedItemIds.has(item.id));

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Department filter
    if (selectedDept !== 'ALL') {
      result = result.filter(item => item.departmentId === selectedDept);
    }

    // Framework filter
    if (selectedFramework !== 'ALL') {
      result = result.filter(item => item.framework === selectedFramework);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.controlCode.toLowerCase().includes(q) ||
          item.controlTitle.toLowerCase().includes(q) ||
          item.departmentName.toLowerCase().includes(q) ||
          item.gapDescription.toLowerCase().includes(q) ||
          item.capaTicketId.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sortBy === 'URGENCY') {
      result.sort((a, b) => {
        const severityRank: Record<string, number> = { CRITICAL: 3, HIGH: 2, ELEVATED: 1 };
        const diff = (severityRank[b.urgencySeverity] || 0) - (severityRank[a.urgencySeverity] || 0);
        if (diff !== 0) return diff;
        return a.adherenceScore - b.adherenceScore;
      });
    } else if (sortBy === 'SCORE_ASC') {
      result.sort((a, b) => a.adherenceScore - b.adherenceScore);
    } else if (sortBy === 'SLA_OVERDUE') {
      result.sort((a, b) => a.slaDays - b.slaDays); // Most negative (most overdue) first
    } else if (sortBy === 'CODE') {
      result.sort((a, b) => a.controlCode.localeCompare(b.controlCode));
    }

    return result;
  }, [queueItems, categoryFilter, selectedDept, selectedFramework, searchQuery, sortBy, remediatedItemIds]);

  // Aggregate Metrics for Header
  const metrics = useMemo(() => {
    const total = queueItems.length;
    const urgentCount = queueItems.filter(i => i.category === 'URGENT_REMEDIATION' && !remediatedItemIds.has(i.id)).length;
    const highRiskCount = queueItems.filter(i => i.category === 'HIGH_RISK' && !remediatedItemIds.has(i.id)).length;
    const overdueCount = queueItems.filter(i => i.slaStatus === 'OVERDUE' && !remediatedItemIds.has(i.id)).length;
    return { total, urgentCount, highRiskCount, overdueCount };
  }, [queueItems, remediatedItemIds]);

  // Unique departments present in queue
  const availableDepartments = useMemo(() => {
    const deptMap = new Map<string, string>();
    queueItems.forEach(i => deptMap.set(i.departmentId, i.departmentName));
    return Array.from(deptMap.entries()).map(([id, name]) => ({ id, name }));
  }, [queueItems]);

  // Handle Mark Remediated
  const handleMarkRemediated = (item: RemediationQueueItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemediatedItemIds(prev => new Set(prev).add(item.id));

    // Also update parent cell state if handler exists
    if (onCellUpdated) {
      const updatedCell: HeatmapCellData = {
        ...item.cellRef,
        score: Math.min(95, Math.max(item.cellRef.score + 18, 88)),
        status: 'IN_PROGRESS' as HeatmapStatus,
        riskLevel: 'LOW' as RiskSeverityLevel
      };
      onCellUpdated(updatedCell);
    }

    showToast({
      title: 'Control Marked for Remediation',
      message: `${item.controlCode} (${item.departmentName}) marked as remediated. Adherence updated to compliant baseline.`,
      type: 'success'
    });
  };

  // Handle Generate CAPA Ticket
  const handleGenerateCapa = (item: RemediationQueueItem, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast({
      title: 'CAPA Ticket Dispatched',
      message: `Ticket ${item.capaTicketId} assigned to ${item.departmentLead} with 5-day statutory SLA remediation requirement.`,
      type: 'info'
    });
  };

  // Handle Export Priority Queue
  const handleExportQueue = () => {
    const csvRows = [
      ['Control ID', 'Control Title', 'Department', 'Framework', 'Priority Category', 'Severity', 'Adherence Score', 'SLA Days', 'CAPA Ticket', 'Root Cause Description', 'Recommended Action']
    ];

    filteredItems.forEach(item => {
      csvRows.push([
        `"${item.controlCode}"`,
        `"${item.controlTitle.replace(/"/g, '""')}"`,
        `"${item.departmentName}"`,
        `"${item.framework}"`,
        `"${item.category === 'URGENT_REMEDIATION' ? 'Requires Urgent Remediation' : 'High Risk'}"`,
        `"${item.urgencySeverity}"`,
        `"${item.adherenceScore}%"`,
        `"${item.slaDays} days"`,
        `"${item.capaTicketId}"`,
        `"${item.gapDescription.replace(/"/g, '""')}"`,
        `"${item.recommendedAction.replace(/"/g, '""')}"`
      ]);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Remediation_Priority_Queue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Queue Exported',
      message: `${filteredItems.length} prioritized controls exported to CSV workpaper`,
      type: 'success'
    });
  };

  return (
    <div
      id="remediation-priority-queue-section"
      data-testid="remediation-priority-queue"
      className={`rounded-2xl border shadow-xl transition-all duration-200 overflow-hidden ${
        theme === 'light'
          ? 'bg-white border-slate-200 shadow-slate-200/50'
          : 'bg-slate-900 border-slate-800 shadow-black/40'
      } ${className}`}
    >
      {/* 1. Header Toolbar with Title & Quick Counters */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-rose-500 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Remediation Priority Queue
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                <span>{metrics.urgentCount} Urgent</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {metrics.highRiskCount} High Risk
              </span>
              {metrics.overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-red-600 text-white shadow-xs animate-pulse">
                  {metrics.overdueCount} SLA Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specific evaluated controls requiring immediate executive action planning, CAPA dispatch, and technical mitigation.
            </p>
          </div>
        </div>

        {/* Action Buttons & Queue Collapse Toggle */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
          <button
            onClick={handleExportQueue}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Export filtered priority queue to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Export Queue</span>
          </button>

          <button
            onClick={() => setIsQueueCollapsed(prev => !prev)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            title={isQueueCollapsed ? 'Expand Remediation Queue' : 'Collapse Remediation Queue'}
            aria-expanded={!isQueueCollapsed}
          >
            {isQueueCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Filter & Sorting Strip */}
      {!isQueueCollapsed && (
        <div className={`p-4 border-b border-slate-200/80 dark:border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 ${
          theme === 'light' ? 'bg-slate-50/70' : 'bg-slate-950/40'
        }`}>
          {/* Priority Mode Switcher */}
          <div className="flex items-center space-x-1 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                categoryFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>All Controls</span>
              <span className="ml-1 text-[10px] font-mono px-1 rounded bg-black/20 text-white">
                {metrics.urgentCount + metrics.highRiskCount}
              </span>
            </button>
            <button
              onClick={() => setCategoryFilter('URGENT_REMEDIATION')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                categoryFilter === 'URGENT_REMEDIATION'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Requires Urgent Remediation</span>
              <span className="ml-1 text-[10px] font-mono px-1 rounded bg-black/20 text-white">
                {metrics.urgentCount}
              </span>
            </button>
            <button
              onClick={() => setCategoryFilter('HIGH_RISK')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                categoryFilter === 'HIGH_RISK'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>High Risk Only</span>
              <span className="ml-1 text-[10px] font-mono px-1 rounded bg-black/20 text-white">
                {metrics.highRiskCount}
              </span>
            </button>
          </div>

          {/* Department, Framework, Search and Sort Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Department selector */}
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
              title="Filter by Department"
            >
              <option value="ALL">All Departments</option>
              {availableDepartments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Framework selector */}
            <select
              value={selectedFramework}
              onChange={e => setSelectedFramework(e.target.value)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
              title="Filter by Regulatory Framework"
            >
              <option value="ALL">All Frameworks</option>
              <option value="ISO 27001">ISO 27001:2022</option>
              <option value="MAS TRM">MAS TRM 2021</option>
              <option value="ISO 27701">ISO 27701 PIMS</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
              title="Sort Queue By"
            >
              <option value="URGENCY">Sort: Highest Urgency</option>
              <option value="SLA_OVERDUE">Sort: Most Overdue SLA</option>
              <option value="SCORE_ASC">Sort: Lowest Adherence First</option>
              <option value="CODE">Sort: Control Code (A-Z)</option>
            </select>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search priority queue..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-1 rounded-lg border text-xs outline-none w-36 sm:w-48 ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                    : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Priority Queue Items List */}
      {!isQueueCollapsed && (
        <div>
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-2.5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                No Controls In Current Remediation Queue
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                All controls matching your filter criteria meet or exceed compliance standards, or active filters have filtered them out.
              </p>
              {(categoryFilter !== 'ALL' || selectedDept !== 'ALL' || selectedFramework !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setCategoryFilter('ALL');
                    setSelectedDept('ALL');
                    setSelectedFramework('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Reset Active Filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
              {filteredItems.map(item => {
                const isExpanded = expandedItemId === item.id;
                const isUrgent = item.category === 'URGENT_REMEDIATION';

                return (
                  <div
                    key={item.id}
                    className={`transition-colors duration-150 ${
                      isExpanded
                        ? theme === 'light'
                          ? 'bg-slate-50/90'
                          : 'bg-slate-800/40'
                        : isUrgent
                        ? theme === 'light'
                          ? 'hover:bg-rose-50/40 bg-rose-50/15'
                          : 'hover:bg-rose-950/20 bg-rose-950/10'
                        : theme === 'light'
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-800/25'
                    }`}
                  >
                    {/* Main Row */}
                    <div
                      onClick={() => setExpandedItemId(prev => (prev === item.id ? null : item.id))}
                      className="p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer"
                    >
                      {/* Left: Control Code, Title, Department & Framework */}
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className="pt-0.5">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono ${
                              isUrgent
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isUrgent ? '!' : 'H'}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                              {item.controlCode}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.framework}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                isUrgent
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {isUrgent ? 'Requires Urgent Remediation' : 'High Risk'}
                            </span>
                            {item.mandatory && (
                              <span className="text-[9px] font-semibold text-rose-500 uppercase tracking-wider">
                                Mandatory Clause
                              </span>
                            )}
                          </div>

                          <h4 className={`text-sm font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {item.controlTitle}
                          </h4>

                          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center space-x-1">
                              <Building className="w-3 h-3 text-slate-400" />
                              <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.departmentName}</strong>
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>Owner: {item.departmentLead}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="font-mono text-slate-400">
                              CAPA: {item.capaTicketId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Scores, SLA, and Action Buttons */}
                      <div className="flex items-center justify-between lg:justify-end space-x-3 sm:space-x-4 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-200/60 dark:border-slate-800/60">
                        {/* Adherence Score Badge */}
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-slate-400 block">Adherence</span>
                          <span className={`text-sm font-mono font-black ${
                            item.adherenceScore < 45 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {item.adherenceScore}%
                          </span>
                        </div>

                        {/* SLA Status Badge */}
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-slate-400 block">SLA Target</span>
                          <span className={`inline-flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            item.slaStatus === 'OVERDUE'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {item.slaDays < 0 ? `${Math.abs(item.slaDays)}d Overdue` : `${item.slaDays}d left`}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (onSelectCell) {
                                onSelectCell(item.cellRef);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1 shadow-xs"
                            title="Inspect underlying evidence, tasks, and audit trail"
                          >
                            <span>Inspect &amp; Action</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={e => handleMarkRemediated(item, e)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              theme === 'light'
                                ? 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-800 hover:bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                            }`}
                            title="1-Click Mark Remediated"
                          >
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          </button>

                          <button
                            onClick={() => setExpandedItemId(prev => (prev === item.id ? null : item.id))}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                            title={isExpanded ? 'Hide Details' : 'View Action Details'}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Action Planning Dossier */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`px-4 pb-4 pt-1 text-xs border-t border-slate-200/60 dark:border-slate-800/80 ${
                          theme === 'light' ? 'bg-slate-100/50' : 'bg-slate-950/60'
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                          {/* Gap Description & Root Cause */}
                          <div className={`p-3 rounded-xl border ${
                            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                          }`}>
                            <div className="flex items-center space-x-1.5 text-rose-500 font-bold mb-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Observed Audit Gap &amp; Non-Compliance Root Cause</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                              {item.gapDescription}
                            </p>
                          </div>

                          {/* Recommended Action Plan */}
                          <div className={`p-3 rounded-xl border ${
                            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                          }`}>
                            <div className="flex items-center space-x-1.5 text-indigo-500 dark:text-indigo-400 font-bold mb-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Recommended Immediate Action Plan</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                              {item.recommendedAction}
                            </p>
                          </div>
                        </div>

                        {/* Quick Action Plan Footer */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                            <span>Assigned: <strong>{item.departmentLead}</strong></span>
                            <span>&bull;</span>
                            <span>Open Findings: <strong>{item.openFindingsCount}</strong></span>
                            <span>&bull;</span>
                            <span className="font-mono text-indigo-500">{item.capaTicketId}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={e => handleGenerateCapa(item, e)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800 font-semibold cursor-pointer text-[11px]"
                            >
                              Dispatch CAPA Ticket
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (onSelectCell) {
                                  onSelectCell(item.cellRef);
                                }
                              }}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer text-[11px] flex items-center space-x-1"
                            >
                              <span>Open Full Forensic Modal</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RemediationPriorityQueue;
