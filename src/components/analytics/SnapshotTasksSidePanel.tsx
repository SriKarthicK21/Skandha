import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  UserCheck,
  Hash,
  ArrowUpRight,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  Tag,
  AlertCircle
} from 'lucide-react';
import type { ComplianceSnapshot, SnapshotComplianceTask } from './ComplianceMaturityD3Chart';

interface SnapshotTasksSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: ComplianceSnapshot | null;
  allSnapshots: ComplianceSnapshot[];
  onSelectSnapshot: (snapshot: ComplianceSnapshot) => void;
  onNavigateToTask?: (taskId: string, frameworkRef?: string) => void;
}

export const SnapshotTasksSidePanel: React.FC<SnapshotTasksSidePanelProps> = ({
  isOpen,
  onClose,
  snapshot,
  allSnapshots,
  onSelectSnapshot,
  onNavigateToTask
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [copiedTaskCode, setCopiedTaskCode] = useState<string | null>(null);
  const [copiedLedger, setCopiedLedger] = useState<boolean>(false);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // If no snapshot is selected, return null
  if (!snapshot) return null;

  // Previous and Next snapshot navigation
  const currentIndex = allSnapshots.findIndex((s) => s.id === snapshot.id);
  const prevSnapshot = currentIndex > 0 ? allSnapshots[currentIndex - 1] : null;
  const nextSnapshot = currentIndex < allSnapshots.length - 1 ? allSnapshots[currentIndex + 1] : null;

  // Calculate delta from previous snapshot
  const scoreDelta = prevSnapshot !== null ? snapshot.overallMaturity - prevSnapshot.overallMaturity : 0;

  // Task list from snapshot
  const tasks = snapshot.complianceTasks || [];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.frameworkRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.evidenceRef && task.evidenceRef.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDomain = selectedDomain === 'ALL' || task.domain === selectedDomain;
      const matchesStatus = selectedStatus === 'ALL' || task.status === selectedStatus;

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [tasks, searchQuery, selectedDomain, selectedStatus]);

  // Aggregate score impact for filtered tasks
  const totalScoreImpact = tasks.reduce((sum, t) => sum + t.scoreImpact, 0).toFixed(1);

  // Domain unique list
  const uniqueDomains = Array.from(new Set(tasks.map((t) => t.domain)));

  // Copy task details to clipboard
  const handleCopyTask = (task: SnapshotComplianceTask) => {
    const text = `[${task.id}] ${task.title}\nFramework: ${task.frameworkRef}\nScore Impact: +${task.scoreImpact}%\nStatus: ${task.status}\nOwner: ${task.assignedTo}\nDate: ${task.completionDate}\nDeliverable: ${task.evidenceRef || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedTaskCode(task.id);
    setTimeout(() => setCopiedTaskCode(null), 2000);
  };

  // Copy ledger summary to clipboard
  const handleCopyLedger = () => {
    const summary = `=== SKANDA COMPLIANCE AUDIT SNAPSHOT ===\nDate: ${snapshot.monthLabel} (${snapshot.date})\nMaturity Score: ${snapshot.overallMaturity}% (MoM Delta: ${scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta}%)\nVerdict: ${snapshot.auditReadinessVerdict}\nSHA-256 Hash: ${snapshot.snapshotHash}\n\nTasks Influencing Score (${tasks.length} tasks, Total Impact: +${totalScoreImpact}%):\n` +
      tasks.map((t, idx) => `${idx + 1}. [${t.id}] ${t.title} (${t.frameworkRef}) - Impact: +${t.scoreImpact}% - Status: ${t.status} - Owner: ${t.assignedTo}`).join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedLedger(true);
    setTimeout(() => setCopiedLedger(false), 2500);
  };

  // Export tasks as CSV
  const handleExportCSV = () => {
    const headers = ['Task ID', 'Title', 'Framework Ref', 'Domain', 'Score Impact (%)', 'Status', 'Priority', 'Owner', 'Completion Date', 'Evidence Ref', 'Auditor Verification'];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.frameworkRef}"`,
      `"${t.domain}"`,
      t.scoreImpact,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.assignedTo}"`,
      `"${t.completionDate}"`,
      `"${t.evidenceRef || ''}"`,
      `"${(t.auditorVerification || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-tasks-${snapshot.id}-${snapshot.monthLabel.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Status badge styling
  const getStatusBadge = (status: SnapshotComplianceTask['status']) => {
    switch (status) {
      case 'Audit Approved':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'Completed & Verified':
        return 'bg-sky-950/80 text-sky-300 border-sky-800';
      case 'Under Review':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Impact type badge styling
  const getImpactTypeBadge = (type: SnapshotComplianceTask['impactType']) => {
    switch (type) {
      case 'CONTROLS':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'EVIDENCE':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'GOVERNANCE':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'RISK_REDUCTION':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Sliding Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col relative z-10"
            >
              {/* Top Header Bar */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                      Snapshot Drill-Down
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {snapshot.id}
                    </span>
                  </div>

                  {/* Navigation Arrows & Close Button */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => prevSnapshot && onSelectSnapshot(prevSnapshot)}
                      disabled={!prevSnapshot}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                      title={prevSnapshot ? `Previous: ${prevSnapshot.monthLabel}` : 'No previous snapshot'}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => nextSnapshot && onSelectSnapshot(nextSnapshot)}
                      disabled={!nextSnapshot}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                      title={nextSnapshot ? `Next: ${nextSnapshot.monthLabel}` : 'No next snapshot'}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-800 mx-1" />

                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-rose-950/50 hover:border-rose-800 transition"
                      title="Close panel (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Snapshot Title & Score Progression */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      <span>{snapshot.monthLabel} Audited Ledger</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Specific compliance tasks & control implementations that influenced this maturity score.
                    </p>
                  </div>

                  {/* Score Pill */}
                  <div className="flex items-center space-x-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Score at Date</div>
                      <div className="text-base font-black text-sky-400 leading-tight">
                        {snapshot.overallMaturity}%
                      </div>
                    </div>
                    {prevSnapshot && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                        scoreDelta >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestone & Hash Banner */}
              <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 truncate max-w-md">
                  <Award className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-slate-300 font-medium truncate">
                    {snapshot.milestoneTitle || 'Operational Compliance Milestone'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-400">
                  <Hash className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[150px] text-slate-300">
                    {snapshot.snapshotHash.substring(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Summary Impact KPIs */}
              <div className="p-5 border-b border-slate-800 bg-slate-900/50 grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Contributing Tasks</div>
                  <div className="text-lg font-black text-white mt-0.5">{tasks.length}</div>
                  <div className="text-[10px] text-slate-400">Recorded for {snapshot.monthLabel}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Gross Score Contribution</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">+{totalScoreImpact}%</div>
                  <div className="text-[10px] text-emerald-400/70">Sum of direct impacts</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Auditor Sign-Off</div>
                  <div className="text-sm font-bold text-sky-300 mt-1 truncate">
                    {snapshot.auditReadinessVerdict.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] text-slate-400">Signed by Auditor</div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/70 space-y-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks by title, clause (e.g. 'Cl. 4.3', 'A.8.7'), deliverable, or owner..."
                      className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Domain Selector */}
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">All Domains ({tasks.length})</option>
                    {uniqueDomains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>

                  {/* Status Selector */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Audit Approved">Audit Approved</option>
                    <option value="Completed & Verified">Completed & Verified</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>

                {/* Quick Results Summary */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    Showing <strong className="text-slate-200">{filteredTasks.length}</strong> of {tasks.length} tasks
                  </span>
                  {(searchQuery || selectedDomain !== 'ALL' || selectedStatus !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDomain('ALL');
                        setSelectedStatus('ALL');
                      }}
                      className="text-sky-400 hover:underline text-[10px]"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              {/* Task List Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {filteredTasks.length === 0 ? (
                  <div className="p-12 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No Matching Tasks Found</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      No compliance task in the {snapshot.monthLabel} snapshot matched your current search filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDomain('ALL');
                        setSelectedStatus('ALL');
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-500 transition"
                    >
                      Clear Search & Filters
                    </button>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isCopied = copiedTaskCode === task.id;
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3 relative group shadow-sm"
                      >
                        {/* Top row: ID, Framework, Impact, Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold">
                              {task.id}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono text-[10px] font-semibold">
                              {task.frameworkRef}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Score Contribution Pill */}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getImpactTypeBadge(
                                task.impactType
                              )}`}
                              title={`Direct score influence on this date: +${task.scoreImpact}%`}
                            >
                              +{task.scoreImpact}% {task.impactType.replace('_', ' ')}
                            </span>

                            {/* Status Pill */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>

                        {/* Task Title */}
                        <div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {task.deliverableSummary}
                          </p>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Domain:</span>
                            <span className="text-slate-300 font-medium">{task.domain}</span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px]">Owner / Role:</span>
                            <span className="text-slate-300 font-medium truncate block">
                              {task.assignedTo}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px]">Signed Date:</span>
                            <span className="text-slate-300 font-mono">{task.completionDate}</span>
                          </div>
                        </div>

                        {/* Deliverable Evidence Artifact & Verification */}
                        {task.evidenceRef && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2 truncate max-w-sm">
                              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-slate-400 text-[11px]">Deliverable:</span>
                              <span className="text-amber-300 font-mono text-[11px] truncate font-medium">
                                {task.evidenceRef}
                              </span>
                            </div>

                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-mono shrink-0">
                              Verified Artifact
                            </span>
                          </div>
                        )}

                        {/* Auditor Validation Statement */}
                        <div className="text-[11px] text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 flex items-start space-x-2">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Auditor Finding:</strong> &ldquo;{task.auditorVerification}&rdquo;
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <button
                            onClick={() => handleCopyTask(task)}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 transition"
                            title="Copy task details"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy task info</span>
                              </>
                            )}
                          </button>

                          {onNavigateToTask && (
                            <button
                              onClick={() => onNavigateToTask(task.id, task.frameworkRef)}
                              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1 font-medium transition"
                            >
                              <span>View control details</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition font-medium"
                    title="Export tasks as CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export Tasks CSV</span>
                  </button>

                  <button
                    onClick={handleCopyLedger}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition font-medium"
                    title="Copy full audit ledger summary to clipboard"
                  >
                    {copiedLedger ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Ledger Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold shadow-sm transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
