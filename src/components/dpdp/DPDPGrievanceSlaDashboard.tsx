import React, { useState, useEffect, useMemo } from 'react';
import {
  DPDPSLAQueueItem,
  DPDPSLARequestType,
  DPDPSLAPriority,
  DPDPSLAWorkflowStatus,
  INITIAL_DPDP_SLA_QUEUE,
  calculateSlaMetrics
} from '../../data/dpdpExtendedTypes';
import { useToast } from '../common/ToastContainer';
import {
  Clock,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Filter,
  Search,
  Plus,
  Download,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  User,
  Mail,
  FileText,
  Baby,
  Server,
  Zap,
  Timer,
  Flame,
  Layers,
  Send,
  Check,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface DPDPGrievanceSlaDashboardProps {
  onNavigateToConsent?: () => void;
  onNavigateToGrievance?: () => void;
}

export const DPDPGrievanceSlaDashboard: React.FC<DPDPGrievanceSlaDashboardProps> = ({
  onNavigateToConsent,
  onNavigateToGrievance
}) => {
  const { showToast } = useToast();

  // Queue state
  const [queueItems, setQueueItems] = useState<DPDPSLAQueueItem[]>(INITIAL_DPDP_SLA_QUEUE);

  // Live real-time clock ticker updating every second
  const [nowTime, setNowTime] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'URGENCY_ASC' | 'PRIORITY_DESC' | 'RECENT_DESC' | 'EXPIRING_FIRST'>('URGENCY_ASC');
  const [viewMode, setViewMode] = useState<'CARDS' | 'COMPACT_LEDGER'>('CARDS');

  // Modal States
  const [selectedTicket, setSelectedTicket] = useState<DPDPSLAQueueItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [ticketToResolve, setTicketToResolve] = useState<DPDPSLAQueueItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Create Ticket Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<DPDPSLARequestType>('CONSENT_WITHDRAWAL');
  const [newPrincipalName, setNewPrincipalName] = useState('');
  const [newPrincipalEmail, setNewPrincipalEmail] = useState('');
  const [newJurisdiction, setNewJurisdiction] = useState('Maharashtra (Mumbai)');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<DPDPSLAPriority>('HIGH');
  const [newOfficer, setNewOfficer] = useState('Karthik Raman (Designated Grievance Officer)');

  // Compute live metrics for all queue items
  const itemsWithMetrics = useMemo(() => {
    return queueItems.map(item => {
      const metrics = calculateSlaMetrics(item.submissionDate, item.deadlineDate, nowTime);
      return {
        ...item,
        metrics
      };
    });
  }, [queueItems, nowTime]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return itemsWithMetrics
      .filter(item => {
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            item.ticketId.toLowerCase().includes(q) ||
            item.title.toLowerCase().includes(q) ||
            item.principalName.toLowerCase().includes(q) ||
            item.principalEmail.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.statutoryClause.toLowerCase().includes(q) ||
            (item.downstreamProcessorsAffected &&
              item.downstreamProcessorsAffected.some(p => p.toLowerCase().includes(q)));
          if (!matches) return false;
        }

        // Type filter
        if (typeFilter !== 'ALL' && item.sourceType !== typeFilter) {
          return false;
        }

        // Urgency filter
        if (urgencyFilter !== 'ALL') {
          if (urgencyFilter === 'BREACHED' && !item.metrics.isBreached) return false;
          if (urgencyFilter === 'CRITICAL_24H' && item.metrics.urgencyBand !== 'CRITICAL_24H') return false;
          if (urgencyFilter === 'URGENT_72H' && item.metrics.urgencyBand !== 'URGENT_72H') return false;
          if (urgencyFilter === 'HEALTHY' && item.metrics.urgencyBand !== 'HEALTHY') return false;
        }

        // Priority filter
        if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'URGENCY_ASC') {
          // Breached first, then lowest remaining ms
          return a.metrics.remainingMs - b.metrics.remainingMs;
        }
        if (sortBy === 'PRIORITY_DESC') {
          const prioWeight: Record<DPDPSLAPriority, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
          };
          return prioWeight[b.priority] - prioWeight[a.priority];
        }
        if (sortBy === 'RECENT_DESC') {
          return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
        }
        return a.metrics.remainingMs - b.metrics.remainingMs;
      });
  }, [itemsWithMetrics, searchQuery, typeFilter, urgencyFilter, priorityFilter, sortBy]);

  // Aggregate KPI summary
  const kpiSummary = useMemo(() => {
    const active = itemsWithMetrics.filter(i => i.status !== 'RESOLVED');
    const breached = active.filter(i => i.metrics.isBreached);
    const critical24h = active.filter(i => !i.metrics.isBreached && i.metrics.urgencyBand === 'CRITICAL_24H');
    const consentWithdrawals = active.filter(i => i.sourceType === 'CONSENT_WITHDRAWAL');
    const childrenDisputes = active.filter(i => i.sourceType === 'CHILDREN_VPC_DISPUTE');
    const dpbiAtRisk = active.filter(i => i.dpbiEscalationRisk && (i.metrics.isBreached || i.metrics.urgencyBand === 'CRITICAL_24H'));

    return {
      totalActive: active.length,
      breachedCount: breached.length,
      critical24hCount: critical24h.length,
      consentWithdrawalCount: consentWithdrawals.length,
      childrenDisputeCount: childrenDisputes.length,
      dpbiAtRiskCount: dpbiAtRisk.length
    };
  }, [itemsWithMetrics]);

  // Handle Quick Action: Immediate Cessation & Close
  const handleQuickExecuteCessation = (ticket: DPDPSLAQueueItem) => {
    const nowIso = new Date().toISOString();
    setQueueItems(prev =>
      prev.map(item => {
        if (item.id === ticket.id) {
          return {
            ...item,
            status: 'RESOLVED',
            resolutionDate: nowIso,
            resolutionSummary: `Statutory one-click cessation executed. Downstream stop instruction webhooks confirmed dispatched to all ${item.downstreamProcessorsAffected?.length || 0} sub-processors. Section 6(4) & 6(6) SLA satisfied.`
          };
        }
        return item;
      })
    );

    showToast({
      title: 'Processor Stop Webhook Dispatched',
      description: `Executed cessation for ${ticket.principalName}. SLA timer stopped and marked RESOLVED.`,
      type: 'success'
    });
  };

  // Handle Formal Resolution
  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToResolve || !resolutionText.trim()) return;

    const nowIso = new Date().toISOString();
    setQueueItems(prev =>
      prev.map(item => {
        if (item.id === ticketToResolve.id) {
          return {
            ...item,
            status: 'RESOLVED',
            resolutionDate: nowIso,
            resolutionSummary: resolutionText.trim()
          };
        }
        return item;
      })
    );

    showToast({
      title: 'SLA Ticket Resolved',
      description: `Resolution recorded for ${ticketToResolve.ticketId} within statutory parameters.`,
      type: 'success'
    });

    setShowResolveModal(false);
    setTicketToResolve(null);
    setResolutionText('');
  };

  // Handle Escalation to DPO
  const handleEscalateToDPO = (ticketId: string) => {
    setQueueItems(prev =>
      prev.map(item => {
        if (item.id === ticketId) {
          return {
            ...item,
            priority: 'CRITICAL',
            assignedOfficer: 'Elena Rostova (Lead DPO - Priority Escalation)',
            dpbiEscalationRisk: true,
            notes: `${item.notes || ''} [ESCALATED TO DPO DUE TO IMMINENT SLA BREACH]`
          };
        }
        return item;
      })
    );

    showToast({
      title: 'Escalated to Data Protection Officer',
      description: 'Ticket marked as CRITICAL and prioritized for executive legal & technical intervention.',
      type: 'warning'
    });
  };

  // Handle Create SLA Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrincipalName.trim() || !newPrincipalEmail.trim()) return;

    const now = new Date();
    let slaHours = 720; // 30 days default
    if (newType === 'CONSENT_WITHDRAWAL') slaHours = 24; // 24h statutory cessation window
    if (newType === 'CHILDREN_VPC_DISPUTE') slaHours = 168; // 7-day expedited children SLA
    if (newType === 'PURPOSE_UNBUNDLING') slaHours = 168;

    const deadline = new Date(now.getTime() + slaHours * 3600 * 1000);

    const newItem: DPDPSLAQueueItem = {
      id: `sla_usr_${Date.now()}`,
      ticketId: `SLA-${newType === 'CONSENT_WITHDRAWAL' ? 'WTH' : 'GRV'}-2026-${Math.floor(100 + Math.random() * 900)}`,
      sourceType: newType,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Data Principal filed request requiring statutory triage and processing.',
      dataPrincipalId: `DP-IND-${Math.floor(10000 + Math.random() * 90000)}`,
      principalName: newPrincipalName.trim(),
      principalEmail: newPrincipalEmail.trim(),
      jurisdictionState: newJurisdiction,
      submissionDate: now.toISOString(),
      deadlineDate: deadline.toISOString(),
      totalSlaHours: slaHours,
      priority: newPriority,
      status: 'PENDING_TRIAGE',
      assignedOfficer: newOfficer,
      statutoryClause:
        newType === 'CONSENT_WITHDRAWAL'
          ? 'Section 6(4) & 6(6)'
          : newType === 'CHILDREN_VPC_DISPUTE'
          ? 'Section 9 & Section 13(2)'
          : 'Section 13',
      dpbiEscalationRisk: newType === 'CHILDREN_VPC_DISPUTE' || newType === 'CONSENT_WITHDRAWAL',
      downstreamProcessorsAffected: ['AWS ap-south-1 Mumbai', 'Snowflake DW'],
      noticeLanguage: 'English'
    };

    setQueueItems([newItem, ...queueItems]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewPrincipalName('');
    setNewPrincipalEmail('');
    setNewDescription('');

    showToast({
      title: 'SLA Ticket Enqueued',
      description: `Added ${newItem.ticketId} with statutory ${slaHours}h countdown clock.`,
      type: 'success'
    });
  };

  // Export SLA Queue CSV
  const handleExportCsv = () => {
    const headers = [
      'Ticket ID',
      'Request Type',
      'Priority',
      'Status',
      'Citizen Name',
      'Citizen Email',
      'Data Principal ID',
      'Jurisdiction',
      'Statutory Clause',
      'Submission Date',
      'Deadline Date',
      'Total SLA Hours',
      'Remaining/Overdue',
      'Is Breached',
      'Assigned Officer',
      'DPBI Escalation Risk'
    ];

    const rows = itemsWithMetrics.map(item => [
      `"${item.ticketId}"`,
      `"${item.sourceType}"`,
      `"${item.priority}"`,
      `"${item.status}"`,
      `"${item.principalName}"`,
      `"${item.principalEmail}"`,
      `"${item.dataPrincipalId}"`,
      `"${item.jurisdictionState}"`,
      `"${item.statutoryClause}"`,
      `"${item.submissionDate}"`,
      `"${item.deadlineDate}"`,
      `"${item.totalSlaHours}"`,
      `"${item.metrics.formattedCountdown}"`,
      `"${item.metrics.isBreached ? 'YES' : 'NO'}"`,
      `"${item.assignedOfficer}"`,
      `"${item.dpbiEscalationRisk ? 'YES' : 'NO'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DPDP_Grievance_Consent_SLA_Queue_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      title: 'SLA Queue Exported',
      description: 'Generated regulatory CSV register of all pending and resolved SLA items.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statutory Context */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>Statutory SLA Command Deck</span>
              </span>
              <span className="text-xs text-slate-400">Sections 6(4), 6(6), 9 & 13 DPDP Act 2023</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Live 1s Ticker Active
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Grievance & Consent Withdrawal SLA Dashboard</span>
              <Flame className="w-6 h-6 text-rose-400 shrink-0" />
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Unified operational queue prioritizing all incoming <strong>consent revocations</strong> and <strong>Data Principal grievances</strong> against strict statutory countdown windows. Failure to resolve empowers citizens to escalate directly to the <strong>Data Protection Board of India (DPBI)</strong> with non-compliance liabilities up to <strong>₹250 Crores</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Regulatory CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incoming SLA Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Active */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Pending In Queue</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {kpiSummary.totalActive}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Aggregated active requests</div>
        </div>

        {/* Breached / Overdue */}
        <div className={`p-3.5 rounded-2xl border shadow-sm transition-all ${
          kpiSummary.breachedCount > 0
            ? 'bg-rose-950/40 border-rose-800 text-rose-300'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-rose-400">SLA Breached</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {kpiSummary.breachedCount}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">Statutory cap exceeded</div>
        </div>

        {/* Critical <24h */}
        <div className={`p-3.5 rounded-2xl border shadow-sm ${
          kpiSummary.critical24hCount > 0
            ? 'bg-amber-950/30 border-amber-800'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
            <span>Expiring &lt; 24h</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {kpiSummary.critical24hCount}
          </div>
          <div className="text-[10px] text-amber-300/80 mt-0.5">Imminent breach window</div>
        </div>

        {/* Consent Withdrawals */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-sky-400 font-semibold">
            <span>Sec 6(4) Withdrawals</span>
            <Zap className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
            {kpiSummary.consentWithdrawalCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">One-click cessation clock</div>
        </div>

        {/* Children VPC Disputes */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-purple-400 font-semibold">
            <span>Sec 9 Children VPC</span>
            <Baby className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {kpiSummary.childrenDisputeCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Expedited 7-day clock</div>
        </div>

        {/* DPBI Direct Escalation Risk */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-rose-300 font-semibold">
            <span>DPBI Action Risk</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
            {kpiSummary.dpbiAtRiskCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Section 13(3) eligible</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket ID, citizen name, email, purpose, processor or statutory clause..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Prioritized Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('COMPACT_LEDGER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'COMPACT_LEDGER'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dense SLA Table
            </button>
          </div>
        </div>

        {/* Filter Chips & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Request Type Selector */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Request Types</option>
              <option value="CONSENT_WITHDRAWAL">⚡ Consent Withdrawals (Sec 6(4))</option>
              <option value="GRIEVANCE_COMPLAINT">🛡️ Grievance Complaints (Sec 13)</option>
              <option value="CHILDREN_VPC_DISPUTE">👶 Children VPC Disputes (Sec 9)</option>
              <option value="ERASURE_MANDATE">🗑️ Erasure Mandates (Sec 8(7))</option>
              <option value="PURPOSE_UNBUNDLING">📦 Purpose Unbundling (Sec 6(1))</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All SLA Urgencies</option>
              <option value="BREACHED">🚨 Breached / Overdue</option>
              <option value="CRITICAL_24H">⏳ Critical (&lt; 24h Remaining)</option>
              <option value="URGENT_72H">⚠️ Urgent (&lt; 72h Remaining)</option>
              <option value="HEALTHY">✅ Healthy / On Schedule</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Priority: Critical</option>
              <option value="HIGH">Priority: High</option>
              <option value="MEDIUM">Priority: Medium</option>
              <option value="LOW">Priority: Low</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="URGENCY_ASC">Urgency: Shortest Time-to-Expiry</option>
              <option value="PRIORITY_DESC">Priority: Highest Level First</option>
              <option value="RECENT_DESC">Submission: Most Recent First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main SLA Queue List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-base font-bold text-white">No Matching SLA Requests Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All pending consent withdrawals and grievance requests within the selected filters are cleared or have zero backlog.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('ALL');
              setUrgencyFilter('ALL');
              setPriorityFilter('ALL');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Reset Filter Criteria
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Prioritized Card Queue with Visual Countdown Bars */
        <div className="space-y-4">
          {filteredItems.map(item => {
            const { metrics } = item;
            const isResolved = item.status === 'RESOLVED';

            // Visual bar styling based on urgency band
            let barColor = 'bg-emerald-500';
            let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            let statusLabel = 'ON SCHEDULE';

            if (metrics.isBreached) {
              barColor = 'bg-rose-600 animate-pulse';
              badgeBg = 'bg-rose-500/30 text-rose-300 border-rose-500/50';
              statusLabel = 'SLA BREACHED • OVERDUE';
            } else if (metrics.urgencyBand === 'CRITICAL_24H') {
              barColor = 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse';
              badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              statusLabel = 'CRITICAL: EXPIRES IN <24H';
            } else if (metrics.urgencyBand === 'URGENT_72H') {
              barColor = 'bg-amber-500';
              badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              statusLabel = 'EXPEDITED: <72H REMAINING';
            }

            if (isResolved) {
              badgeBg = 'bg-slate-800 text-slate-400 border-slate-700';
              statusLabel = 'RESOLVED';
            }

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all hover:border-slate-700 shadow-md ${
                  metrics.isBreached && !isResolved
                    ? 'border-rose-800/80 bg-rose-950/10'
                    : metrics.urgencyBand === 'CRITICAL_24H' && !isResolved
                    ? 'border-amber-800/70'
                    : 'border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
                        {item.ticketId}
                      </span>

                      {/* Request Type Badge */}
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {item.sourceType === 'CONSENT_WITHDRAWAL' && '⚡ Consent Withdrawal'}
                        {item.sourceType === 'GRIEVANCE_COMPLAINT' && '🛡️ Grievance Redressal'}
                        {item.sourceType === 'CHILDREN_VPC_DISPUTE' && '👶 Minor VPC Dispute'}
                        {item.sourceType === 'ERASURE_MANDATE' && '🗑️ Erasure Mandate'}
                        {item.sourceType === 'PURPOSE_UNBUNDLING' && '📦 Purpose Unbundling'}
                      </span>

                      {/* Priority Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        item.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.priority}
                      </span>

                      {/* Statutory Clause */}
                      <span className="text-[11px] font-mono text-amber-400/90 font-medium">
                        {item.statutoryClause}
                      </span>

                      {item.dpbiEscalationRisk && !isResolved && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                          <span>DPBI Escalation Risk</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white pt-1">
                      {item.title}
                    </h3>
                  </div>

                  {/* Urgency Badge with Real-Time Countdown */}
                  <div className="flex flex-col items-start sm:items-end shrink-0">
                    <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 ${badgeBg}`}>
                      {metrics.isBreached && !isResolved ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{isResolved ? 'RESOLVED' : metrics.formattedCountdown}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Statutory Cap: {item.totalSlaHours}h ({item.totalSlaHours >= 24 ? `${Math.round(item.totalSlaHours / 24)}d` : `${item.totalSlaHours}h`})
                    </span>
                  </div>
                </div>

                {/* VISUAL TIME-TO-EXPIRY COUNTDOWN BAR */}
                <div className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Timer className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-slate-200">Statutory Window Elapsed:</span>
                      <span className="font-mono text-white font-bold">
                        {Math.round(metrics.elapsedPercent)}%
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      <span>Submitted: {new Date(item.submissionDate).toLocaleDateString()}</span>
                      <span className="mx-1.5">•</span>
                      <span>Deadline: {new Date(item.deadlineDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isResolved ? 'bg-slate-700' : barColor
                      }`}
                      style={{ width: `${metrics.elapsedPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="text-slate-500">0% (Inflow)</span>
                    <span className={`font-semibold ${
                      metrics.isBreached ? 'text-rose-400' : metrics.urgencyBand === 'CRITICAL_24H' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {statusLabel}
                    </span>
                    <span className="text-slate-500">100% (Statutory Expiry)</span>
                  </div>
                </div>

                {/* Citizen Details & Description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Data Principal:</span>
                    </div>
                    <div className="font-semibold text-white">{item.principalName}</div>
                    <div className="text-[11px] text-slate-400">{item.principalEmail}</div>
                    <div className="text-[10px] font-mono text-slate-500">{item.dataPrincipalId} • {item.jurisdictionState}</div>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>Request Summary:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {item.description}
                    </p>
                    {item.downstreamProcessorsAffected && item.downstreamProcessorsAffected.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-slate-500">Downstream Stop:</span>
                        {item.downstreamProcessorsAffected.map(proc => (
                          <span
                            key={proc}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                          >
                            {proc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolution Note if resolved */}
                {isResolved && item.resolutionSummary && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 space-y-0.5">
                    <div className="font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Statutory Redressal Recorded on {item.resolutionDate ? new Date(item.resolutionDate).toLocaleDateString() : 'Today'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 pl-4">{item.resolutionSummary}</p>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Assigned Officer: <span className="text-slate-200 font-medium">{item.assignedOfficer}</span>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {/* Inspect details button */}
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Inspect Dossier</span>
                    </button>

                    {!isResolved && (
                      <>
                        {/* Escalate to DPO button */}
                        {item.priority !== 'CRITICAL' && (
                          <button
                            type="button"
                            onClick={() => handleEscalateToDPO(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="Escalate to Chief DPO for immediate emergency compliance directive"
                          >
                            <ShieldAlert className="w-3 h-3 text-amber-400" />
                            <span>Escalate to DPO</span>
                          </button>
                        )}

                        {/* Quick Cessation Dispatch for Consent Withdrawals */}
                        {item.sourceType === 'CONSENT_WITHDRAWAL' && (
                          <button
                            type="button"
                            onClick={() => handleQuickExecuteCessation(item)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Dispatches processor halt webhook and terminates active SLA countdown"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Execute Cessation & Close</span>
                          </button>
                        )}

                        {/* Formal Resolution Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTicketToResolve(item);
                            setShowResolveModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve & Close SLA</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Ledger Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket / Type</th>
                  <th className="py-3 px-4">Citizen Principal</th>
                  <th className="py-3 px-4">Statutory Clause</th>
                  <th className="py-3 px-4">Time-to-Expiry Countdown</th>
                  <th className="py-3 px-4">SLA Window Bar</th>
                  <th className="py-3 px-4">Priority & Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredItems.map(item => {
                  const { metrics } = item;
                  const isResolved = item.status === 'RESOLVED';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{item.ticketId}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.sourceType === 'CONSENT_WITHDRAWAL' ? '⚡ Consent Withdrawal' : '🛡️ Grievance Ticket'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{item.principalName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{item.dataPrincipalId}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400 text-[11px]">
                        {item.statutoryClause}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold ${
                          isResolved
                            ? 'bg-slate-800 text-slate-400'
                            : metrics.isBreached
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                            : metrics.urgencyBand === 'CRITICAL_24H'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {isResolved ? 'RESOLVED' : metrics.formattedCountdown}
                        </span>
                      </td>
                      <td className="py-3 px-4 w-48">
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${
                              isResolved
                                ? 'bg-slate-700'
                                : metrics.isBreached
                                ? 'bg-rose-600 animate-pulse'
                                : metrics.urgencyBand === 'CRITICAL_24H'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${metrics.elapsedPercent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 font-mono">
                          {Math.round(metrics.elapsedPercent)}% of {item.totalSlaHours}h window
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                            item.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(item)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                        >
                          View
                        </button>
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => {
                              setTicketToResolve(item);
                              setShowResolveModal(true);
                            }}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Resolve
                          </button>
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

      {/* MODAL: INSPECT TICKET DOSSIER */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">SLA Evidentiary Dossier</h3>
                  <div className="text-xs text-slate-400 font-mono">{selectedTicket.ticketId} • {selectedTicket.statutoryClause}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Data Principal:</span>
                  <span className="text-white font-semibold">{selectedTicket.principalName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Principal Email & ID:</span>
                  <span className="text-slate-300 font-mono">{selectedTicket.principalEmail} ({selectedTicket.dataPrincipalId})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Statutory Deadline:</span>
                  <span className="text-amber-400 font-mono">{new Date(selectedTicket.deadlineDate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned Grievance Officer:</span>
                  <span className="text-slate-300">{selectedTicket.assignedOfficer}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px] mb-1">Request Description & Grounds:</span>
                <p className="text-slate-200 text-xs leading-relaxed bg-slate-900 p-2.5 rounded-lg">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.downstreamProcessorsAffected && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block text-[10px] mb-1">Downstream Processing Nodes Requiring Cessation (Sec 6(6)):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTicket.downstreamProcessorsAffected.map(proc => (
                      <span key={proc} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                        {proc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Section 13(3) of the DPDP Act 2023 grants the Data Principal the non-derogable right to directly lodge a complaint with the Data Protection Board of India (DPBI) if no satisfactory resolution or cessation acknowledgement is tendered within the statutory time window.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => {
                    setTicketToResolve(selectedTicket);
                    setShowResolveModal(true);
                    setSelectedTicket(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  Resolve This Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE TICKET */}
      {showResolveModal && ticketToResolve && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record Statutory SLA Resolution</h3>
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>Ticket: <span className="font-mono text-white font-bold">{ticketToResolve.ticketId}</span></div>
              <div>Citizen: <span className="text-slate-200">{ticketToResolve.principalName}</span></div>
            </div>

            <form onSubmit={handleConfirmResolution} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Resolution Statement & Evidence of Redressal / Processor Cessation:
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  placeholder="Detail the technical actions taken (e.g., telemetry webhook dispatches, database record status change, email confirmation dispatched to citizen)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Confirm Resolution & Halt SLA Clock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG INCOMING SLA REQUEST */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Log Statutory SLA Request into Queue</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Request Category & Statutory Clock</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as DPDPSLARequestType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="CONSENT_WITHDRAWAL">⚡ Consent Withdrawal (Section 6(4) • 24h Clock)</option>
                  <option value="GRIEVANCE_COMPLAINT">🛡️ Grievance Redressal (Section 13 • 30-day Clock)</option>
                  <option value="CHILDREN_VPC_DISPUTE">👶 Minor / Child VPC Dispute (Section 9 • 7-day Clock)</option>
                  <option value="PURPOSE_UNBUNDLING">📦 Purpose Unbundling Demand (Section 6(1) • 7-day Clock)</option>
                  <option value="ERASURE_MANDATE">🗑️ Erasure Mandate (Section 8(7) • 30-day Clock)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subject / Summary</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Statutory Withdrawal of Location & Telemetry Tracking"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Citizen Name</label>
                  <input
                    type="text"
                    required
                    value={newPrincipalName}
                    onChange={e => setNewPrincipalName(e.target.value)}
                    placeholder="e.g. Sanya Mirza"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newPrincipalEmail}
                    onChange={e => setNewPrincipalEmail(e.target.value)}
                    placeholder="sanya@example.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Jurisdiction / State</label>
                  <input
                    type="text"
                    value={newJurisdiction}
                    onChange={e => setNewJurisdiction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as DPDPSLAPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  >
                    <option value="CRITICAL">CRITICAL (&lt;24h Breach Risk)</option>
                    <option value="HIGH">HIGH (Expedited / Minor Data)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Citizen grievance or statutory withdrawal instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Grievance Redressal Officer</label>
                <select
                  value={newOfficer}
                  onChange={e => setNewOfficer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="Karthik Raman (Designated Grievance Officer)">Karthik Raman (Designated Grievance Officer)</option>
                  <option value="Elena Rostova (Lead DPO)">Elena Rostova (Lead DPO)</option>
                  <option value="Sanjay Mehta (Compliance Operations Lead)">Sanjay Mehta (Compliance Operations Lead)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Enqueue SLA Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
