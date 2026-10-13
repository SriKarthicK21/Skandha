import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  UnifiedRemediationItem,
  RemediationSourceDomain,
  RemediationSeverity,
  RemediationStatus,
  RemediationSLAStatus,
  RiskExceptionWaiverRequest,
  CompensatingControlVerification,
  RemediationAuditSignOff
} from '../../types/remediation';
import { PageContainer } from '../layout/PageContainer';
import { KPICard } from '../common/KPICard';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  Wrench,
  AlertTriangle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  FileCheck2,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Scale,
  Building,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  FileText,
  User,
  Calendar,
  Zap,
  Globe,
  HelpCircle,
  XCircle,
  Eye,
  Send,
  History,
  Activity
} from 'lucide-react';
import { IncidentResponseTimeline } from '../incident/IncidentResponseTimeline';

export const RemediationDeskModule: React.FC = () => {
  const {
    unifiedRemediations,
    addUnifiedRemediation,
    updateUnifiedRemediation,
    deleteUnifiedRemediation,
    requestRiskExceptionWaiver,
    approveOrRejectWaiver,
    verifyCompensatingControl,
    signOffRemediationAudit,
    triggerRemediationRetest,
    syncFindingsToRemediations,
    currentTenant,
    currentRole,
    currentUser,
    setActiveModule,
    theme
  } = useGRC();

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'ALL' | RemediationSourceDomain>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [slaFilter, setSlaFilter] = useState<string>('ALL');

  // Drawer / Modals State
  const [selectedItem, setSelectedItem] = useState<UnifiedRemediationItem | null>(null);
  const [drawerMode, setDrawerMode] = useState<'VIEW' | 'WAIVER' | 'COMPENSATING' | 'SIGNOFF' | 'TIMELINE'>('VIEW');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [retestLoading, setRetestLoading] = useState<string | null>(null);
  const [retestMessage, setRetestMessage] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // New Item Form State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemSourceDomain, setNewItemSourceDomain] = useState<RemediationSourceDomain>('Regulatory Gap');
  const [newItemSeverity, setNewItemSeverity] = useState<RemediationSeverity>('High');
  const [newItemOwner, setNewItemOwner] = useState(currentUser?.name || 'Security Lead');
  const [newItemEmail, setNewItemEmail] = useState(currentUser?.email || 'security@skanda.internal');
  const [newItemDept, setNewItemDept] = useState('IT & Security');
  const [newItemTargetDate, setNewItemTargetDate] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [newItemFramework, setNewItemFramework] = useState('ISO/IEC 27001:2022');
  const [newItemControl, setNewItemControl] = useState('A.8.1 User Endpoint Security');
  const [newItemAsset, setNewItemAsset] = useState('Production Core Infrastructure');
  const [newItemActionPlan, setNewItemActionPlan] = useState('');

  // Waiver Request Form State
  const [waiverJustification, setWaiverJustification] = useState('');
  const [waiverDurationDays, setWaiverDurationDays] = useState(90);
  const [waiverResidualRisk, setWaiverResidualRisk] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [waiverConditions, setWaiverConditions] = useState('');

  // Compensating Control Form State
  const [compControlCode, setCompControlCode] = useState('CMP-CTRL-01');
  const [compControlName, setCompControlName] = useState('');
  const [compControlDesc, setCompControlDesc] = useState('');
  const [compControlEffectiveness, setCompControlEffectiveness] = useState(85);
  const [compControlEvidence, setCompControlEvidence] = useState('');

  // Audit Sign-off Form State
  const [signOffConclusion, setSignOffConclusion] = useState<'Satisfactory - Finding Resolved' | 'Deficient - Reopen Remediation' | 'Exception Approved with Conditions'>('Satisfactory - Finding Resolved');
  const [signOffNotes, setSignOffNotes] = useState('');
  const [signOffBody, setSignOffBody] = useState('SKANDA Second-Line Assurance Desk');

  const isAuditorOrAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'PLATFORM_AUDITOR' || currentRole === 'INTERNAL_AUDITOR' || currentRole === 'COMPANY_ADMIN';
  const isCISO = currentRole === 'SUPER_ADMIN' || currentRole === 'COMPANY_ADMIN';

  // Filtered Remediations
  const tenantRemediations = useMemo(() => {
    return (unifiedRemediations || []).filter(r => r.tenantId === currentTenant?.id);
  }, [unifiedRemediations, currentTenant?.id]);

  const filteredItems = useMemo(() => {
    return tenantRemediations.filter(item => {
      const matchTab = activeTab === 'ALL' || item.sourceDomain === activeTab;
      const matchSearch =
        searchTerm === '' ||
        item.remediationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.linkedControls.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchSLA = slaFilter === 'ALL' || item.slaStatus === slaFilter;

      return matchTab && matchSearch && matchSeverity && matchStatus && matchSLA;
    });
  }, [tenantRemediations, activeTab, searchTerm, severityFilter, statusFilter, slaFilter]);

  // Aggregate Metrics for KPIs
  const totalOpen = tenantRemediations.filter(r => r.status !== 'Closed & Verified').length;
  const breachedCount = tenantRemediations.filter(r => r.slaStatus === 'SLA Breached' && r.status !== 'Closed & Verified').length;
  const atRiskCount = tenantRemediations.filter(r => r.slaStatus === 'At Risk (<5d)' && r.status !== 'Closed & Verified').length;
  const waiversPending = tenantRemediations.filter(r => r.waiverRequest?.approvalStatus === 'Pending Executive Review').length;
  const activeCompControls = tenantRemediations.filter(r => (r.compensatingControls || []).length > 0).length;
  const closedVerified = tenantRemediations.filter(r => r.status === 'Closed & Verified').length;

  const handleCreateRemediation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    addUnifiedRemediation({
      title: newItemTitle.trim(),
      description: newItemDesc.trim() || 'Remediation action registered via Continuous Remediation Desk.',
      sourceDomain: newItemSourceDomain,
      sourceFindingId: `MANUAL-${Date.now().toString().slice(-4)}`,
      sourceModule: 'Unified Remediation Desk',
      severity: newItemSeverity,
      status: 'Under Investigation',
      slaStatus: 'Within SLA',
      slaDeadlineHours: newItemSeverity === 'Critical' ? 48 : newItemSeverity === 'High' ? 168 : 720,
      targetResolutionDate: newItemTargetDate,
      ownerName: newItemOwner,
      ownerEmail: newItemEmail,
      department: newItemDept,
      affectedAssets: [newItemAsset],
      linkedFrameworks: [newItemFramework],
      linkedControls: [newItemControl],
      rootCauseAnalysis: 'Root cause analysis in progress.',
      proposedActionPlan: newItemActionPlan || 'Remediation plan to be refined by assigned owner.',
      remediationProgressPct: 10,
      history: [
        {
          id: `his-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: `${currentUser?.name || 'User'} (${currentRole})`,
          action: 'Created Remediation Item',
          notes: 'Remediation workflow initiated in Continuous Desk.'
        }
      ],
      milestones: [
        {
          id: `mil-1-${Date.now()}`,
          title: 'Root Cause & Scope Assessment',
          targetDate: newItemTargetDate,
          completed: false,
          owner: newItemOwner
        },
        {
          id: `mil-2-${Date.now()}`,
          title: 'Corrective Action Implementation',
          targetDate: newItemTargetDate,
          completed: false,
          owner: newItemOwner
        }
      ]
    });

    setShowAddModal(false);
    setNewItemTitle('');
    setNewItemDesc('');
    setNewItemActionPlan('');
  };

  const handleRetest = async (remediationId: string) => {
    setRetestLoading(remediationId);
    setRetestMessage(null);
    try {
      const res = await triggerRemediationRetest(remediationId);
      setRetestMessage({ id: remediationId, success: res.success, message: res.message });
      // Update local drawer item if open
      if (selectedItem && selectedItem.id === remediationId) {
        const updated = (unifiedRemediations || []).find(r => r.id === remediationId);
        if (updated) setSelectedItem(updated);
      }
    } finally {
      setRetestLoading(null);
    }
  };

  const handleSubmitWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !waiverJustification.trim()) return;

    requestRiskExceptionWaiver(selectedItem.id, {
      requestedBy: `${currentUser?.name || 'Security Lead'} (${currentRole})`,
      requestedDate: new Date().toISOString(),
      businessJustification: waiverJustification.trim(),
      waiverDurationDays: Number(waiverDurationDays),
      expiryDate: new Date(Date.now() + Number(waiverDurationDays) * 24 * 3600 * 1000).toISOString().split('T')[0],
      residualRiskLevel: waiverResidualRisk,
      conditions: waiverConditions.trim() ? [waiverConditions.trim()] : ['Compensating monitoring must remain active.']
    });

    setDrawerMode('VIEW');
    setWaiverJustification('');
    setWaiverConditions('');
    // refresh drawer selected item
    const updated = (unifiedRemediations || []).find(r => r.id === selectedItem.id);
    if (updated) setSelectedItem(updated);
  };

  const handleApproveWaiver = (remediationId: string, approved: boolean) => {
    const approver = `${currentUser?.name || 'Chief Information Security Officer'} (CISO)`;
    approveOrRejectWaiver(
      remediationId,
      approved,
      approver,
      ['Weekly vulnerability re-scan required', 'Review at next monthly risk committee meeting']
    );
    if (selectedItem && selectedItem.id === remediationId) {
      const updated = (unifiedRemediations || []).find(r => r.id === remediationId);
      if (updated) setSelectedItem(updated);
    }
  };

  const handleAddCompensatingControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !compControlName.trim()) return;

    verifyCompensatingControl(selectedItem.id, {
      controlCode: compControlCode,
      controlName: compControlName.trim(),
      description: compControlDesc.trim() || 'Temporary mitigation reducing exposure.',
      effectivenessScore: Number(compControlEffectiveness),
      verifiedBy: `${currentUser?.name || 'Security Engineer'} (${currentRole})`,
      verificationDate: new Date().toISOString().split('T')[0],
      evidenceArtifactRef: compControlEvidence.trim() || 'EVD-COMP-AUTOMATED-HASH'
    });

    setDrawerMode('VIEW');
    setCompControlName('');
    setCompControlDesc('');
    setCompControlEvidence('');
    if (selectedItem) {
      const updated = (unifiedRemediations || []).find(r => r.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  };

  const handleAuditSignOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    signOffRemediationAudit(selectedItem.id, {
      auditorName: `${currentUser?.name || 'Lead Auditor'} (${currentRole})`,
      auditorRole: currentRole,
      auditOrganization: signOffBody,
      conclusion: signOffConclusion,
      verificationEvidenceRefs: ['EVD-VERIFY-FINAL-01', 'SHA256:7b9e31d8a4f9...'],
      notes: signOffNotes.trim() || 'Independent controls verification conducted. Evidence objectively assessed.'
    });

    setDrawerMode('VIEW');
    setSignOffNotes('');
    if (selectedItem) {
      const updated = (unifiedRemediations || []).find(r => r.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  };

  return (
    <PageContainer id="remediation-desk-page" maxWidth="full" className="px-3 sm:px-6">
      {/* Header Banner */}
      <div id="remediation-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Continuous Remediation & Exception Desk
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Closed-Loop GRC
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Enterprise action tracker unifying regulatory gaps, brand perimeter infringements, vulnerability triage, SLA tracking, and CISO risk waivers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="view-incident-timeline-btn"
            onClick={() => setShowTimelineModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 transition-colors shadow-sm cursor-pointer"
            title="Inspect end-to-end incident response lifecycle from BrandGuard to RemediationDesk"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Incident Response Timeline</span>
          </button>

          <button
            id="sync-findings-btn"
            onClick={syncFindingsToRemediations}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors shadow-sm"
            title="Import active findings from Audit & MAS TRM modules"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Sync Audit Findings</span>
          </button>

          {isAuditorOrAdmin && (
            <button
              id="raise-remediation-btn"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Action Item</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div id="remediation-kpis" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          id="kpi-open-remediations"
          label="Active Remediations"
          icon={AlertTriangle}
          value={totalOpen}
          valueColor={totalOpen > 5 ? 'rose' : 'amber'}
          secondaryBadge={`${tenantRemediations.length} TOTAL`}
          secondaryBadgeType="neutral"
          statusPill="In progress across all domains"
          density="compact"
        />
        <KPICard
          id="kpi-sla-breaches"
          label="SLA Breached"
          icon={Clock}
          value={breachedCount}
          valueColor={breachedCount > 0 ? 'rose' : 'emerald'}
          secondaryBadge={breachedCount > 0 ? 'CRITICAL ESCALATION' : 'CLEAN'}
          secondaryBadgeType={breachedCount > 0 ? 'negative' : 'positive'}
          statusPill="Past mandated resolution target"
          density="compact"
        />
        <KPICard
          id="kpi-sla-at-risk"
          label="SLA at Risk (<5d)"
          icon={AlertOctagon}
          value={atRiskCount}
          valueColor={atRiskCount > 0 ? 'amber' : 'default'}
          secondaryBadge="NEARING DEADLINE"
          secondaryBadgeType="warning"
          statusPill="Requires immediate owner push"
          density="compact"
        />
        <KPICard
          id="kpi-risk-waivers"
          label="Pending Waivers"
          icon={Scale}
          value={waiversPending}
          valueColor={waiversPending > 0 ? 'amber' : 'default'}
          secondaryBadge="CISO DESK"
          secondaryBadgeType={waiversPending > 0 ? 'warning' : 'neutral'}
          statusPill="Risk acceptance requests"
          density="compact"
        />
        <KPICard
          id="kpi-compensating-controls"
          label="Compensating Controls"
          icon={ShieldCheck}
          value={activeCompControls}
          valueColor="indigo"
          secondaryBadge="ACTIVE MITIGATION"
          secondaryBadgeType="info"
          statusPill="Verified alternative defenses"
          density="compact"
        />
        <KPICard
          id="kpi-audit-closed"
          label="Verified Closed"
          icon={CheckCircle2}
          value={closedVerified}
          valueColor="emerald"
          secondaryBadge="AUDIT SIGNED OFF"
          secondaryBadgeType="positive"
          statusPill="Independently confirmed"
          density="compact"
        />
      </div>

      {/* Domain Source Tabs */}
      <div id="domain-source-tabs" className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          All Domains ({tenantRemediations.length})
        </button>
        <button
          onClick={() => setActiveTab('Regulatory Gap')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'Regulatory Gap'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-sky-400" />
          <span>Regulatory Gaps</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
            {tenantRemediations.filter(r => r.sourceDomain === 'Regulatory Gap').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('Brand & Perimeter Infringement')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'Brand & Perimeter Infringement'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-rose-400" />
          <span>Brand & Perimeter</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
            {tenantRemediations.filter(r => r.sourceDomain === 'Brand & Perimeter Infringement').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('Vulnerability Management')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'Vulnerability Management'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Vulnerability</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
            {tenantRemediations.filter(r => r.sourceDomain === 'Vulnerability Management').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('Third-Party / Vendor Finding')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'Third-Party / Vendor Finding'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-purple-400" />
          <span>Third-Party / Vendor</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
            {tenantRemediations.filter(r => r.sourceDomain === 'Third-Party / Vendor Finding').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('Continuous Compliance Drift')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'Continuous Compliance Drift'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Control Drift</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-slate-300">
            {tenantRemediations.filter(r => r.sourceDomain === 'Continuous Compliance Drift').length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div id="filter-controls-bar" className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex-1 min-w-[240px] max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="remediation-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, title, owner, control, or asset..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Severity:</span>
            <select
              id="severity-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Remediation In Progress">Remediation In Progress</option>
              <option value="Pending Auditor Verification">Pending Auditor Verification</option>
              <option value="Compensating Control Active">Compensating Control Active</option>
              <option value="Risk Exception Requested">Risk Exception Requested</option>
              <option value="Risk Accepted / Waived">Risk Accepted / Waived</option>
              <option value="Closed & Verified">Closed & Verified</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>SLA:</span>
            <select
              id="sla-filter"
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All SLA States</option>
              <option value="Within SLA">Within SLA</option>
              <option value="At Risk (<5d)">At Risk (&lt;5d)</option>
              <option value="SLA Breached">SLA Breached</option>
              <option value="Exception Granted">Exception Granted</option>
            </select>
          </div>

          {(searchTerm || severityFilter !== 'ALL' || statusFilter !== 'ALL' || slaFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
                setSlaFilter('ALL');
              }}
              className="text-[11px] text-amber-400 hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table: Continuous Remediation Items */}
      <div id="remediation-table-card" className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 border-b border-slate-700/80 uppercase font-mono text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Item Code & Domain</th>
                <th className="py-3 px-3">Title & Action Plan</th>
                <th className="py-3 px-3 text-center">Severity</th>
                <th className="py-3 px-3">Owner / Dept</th>
                <th className="py-3 px-3">SLA & Deadline</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-medium text-slate-400">No remediation items match your filters.</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        All items are either resolved or filter criteria are too restrictive. Click &quot;Reset Filters&quot; or &quot;Sync Audit Findings&quot; to populate.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isBreached = item.slaStatus === 'SLA Breached';
                  const isAtRisk = item.slaStatus === 'At Risk (<5d)';
                  const hasWaiver = Boolean(item.waiverRequest);
                  const hasCompControl = (item.compensatingControls || []).length > 0;
                  const isClosed = item.status === 'Closed & Verified';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setDrawerMode('VIEW');
                      }}
                    >
                      {/* Code & Domain */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-amber-300 text-[11px] group-hover:text-amber-200">
                            {item.remediationCode}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            {item.sourceDomain === 'Regulatory Gap' && <Award className="w-3 h-3 text-sky-400" />}
                            {item.sourceDomain === 'Brand & Perimeter Infringement' && <Globe className="w-3 h-3 text-rose-400" />}
                            {item.sourceDomain === 'Vulnerability Management' && <Zap className="w-3 h-3 text-amber-400" />}
                            {item.sourceDomain === 'Third-Party / Vendor Finding' && <Building className="w-3 h-3 text-purple-400" />}
                            {item.sourceDomain === 'Continuous Compliance Drift' && <Layers className="w-3 h-3 text-emerald-400" />}
                            <span className="truncate max-w-[130px]">{item.sourceDomain}</span>
                          </span>
                          {item.sourceFindingId && (
                            <span className="text-[9.5px] font-mono text-slate-500">
                              Ref: {item.sourceFindingId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title & Controls */}
                      <td className="py-3 px-3 align-top max-w-xs">
                        <div className="font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.proposedActionPlan}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {item.linkedControls.slice(0, 2).map((ctrl, idx) => (
                            <span key={idx} className="text-[9.5px] font-mono px-1.5 py-0.2 bg-slate-800 rounded border border-slate-700 text-slate-300">
                              {ctrl}
                            </span>
                          ))}
                          {hasWaiver && (
                            <span className="text-[9.5px] px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded">
                              Waiver ({item.waiverRequest?.approvalStatus.split(' ')[0]})
                            </span>
                          )}
                          {hasCompControl && (
                            <span className="text-[9.5px] px-1.5 py-0.2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded">
                              Compensating Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 align-top text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                          item.severity === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : item.severity === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : item.severity === 'Medium'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
                        }`}>
                          {item.severity}
                        </span>
                      </td>

                      {/* Owner & Dept */}
                      <td className="py-3 px-3 align-top">
                        <div className="text-slate-200 font-medium">{item.ownerName}</div>
                        <div className="text-[10px] text-slate-400">{item.department}</div>
                      </td>

                      {/* SLA & Deadline */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isBreached
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isAtRisk
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : item.slaStatus === 'Exception Granted'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {item.slaStatus}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{item.targetResolutionDate}</span>
                          <span className={item.daysRemainingOrOverdue < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            ({item.daysRemainingOrOverdue < 0 ? `${Math.abs(item.daysRemainingOrOverdue)}d Overdue` : `${item.daysRemainingOrOverdue}d left`})
                          </span>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-3 align-top min-w-[120px]">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Progress</span>
                          <span className="font-mono text-slate-200">{item.remediationProgressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.remediationProgressPct >= 100
                                ? 'bg-emerald-500'
                                : item.remediationProgressPct >= 50
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${item.remediationProgressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 align-top text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          isClosed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : item.status === 'Pending Auditor Verification'
                            ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                            : item.status === 'Risk Exception Requested'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : item.status === 'Risk Accepted / Waived'
                            ? 'bg-purple-900/30 border-purple-500/40 text-purple-300'
                            : item.status === 'Compensating Control Active'
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setDrawerMode('VIEW');
                            }}
                            className="p-1 rounded hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Open Detail & Workflow Drawer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleRetest(item.id)}
                            disabled={retestLoading === item.id || isClosed}
                            className={`p-1 rounded hover:bg-slate-700/80 text-slate-400 hover:text-sky-300 transition-colors ${
                              retestLoading === item.id ? 'animate-spin text-sky-400' : ''
                            } ${isClosed ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title="Execute Automated Re-Test Verification"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {isAuditorOrAdmin && (
                            <button
                              onClick={() => {
                                if (safeConfirm(`Delete remediation ${item.remediationCode}? This cannot be undone.`)) {
                                  deleteUnifiedRemediation(item.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete Item"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-test Notification Toast if fired */}
      {retestMessage && (
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          retestMessage.success
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {retestMessage.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>{retestMessage.message}</span>
          </div>
          <button onClick={() => setRetestMessage(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* DETAIL & WORKFLOW DRAWER / MODAL */}
      {selectedItem && (
        <div id="remediation-detail-drawer" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {selectedItem.remediationCode}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                      {selectedItem.severity}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white line-clamp-1 mt-0.5">
                    {selectedItem.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Sub-nav in Drawer */}
            <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-900/90 text-xs">
              <button
                onClick={() => setDrawerMode('VIEW')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  drawerMode === 'VIEW'
                    ? 'border-amber-400 text-amber-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview & Milestones
              </button>
              <button
                onClick={() => setDrawerMode('WAIVER')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  drawerMode === 'WAIVER'
                    ? 'border-purple-400 text-purple-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Risk Exception / Waiver
              </button>
              <button
                onClick={() => setDrawerMode('COMPENSATING')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  drawerMode === 'COMPENSATING'
                    ? 'border-indigo-400 text-indigo-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Compensating Controls
              </button>
              <button
                onClick={() => setDrawerMode('SIGNOFF')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  drawerMode === 'SIGNOFF'
                    ? 'border-emerald-400 text-emerald-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Audit Sign-Off
              </button>
              <button
                onClick={() => setDrawerMode('TIMELINE')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center space-x-1.5 ${
                  drawerMode === 'TIMELINE'
                    ? 'border-indigo-400 text-indigo-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lifecycle Timeline</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 sm:p-6 space-y-6 flex-1 text-xs text-slate-300">
              {drawerMode === 'TIMELINE' && (
                <div className="py-1">
                  <IncidentResponseTimeline
                    remediationItem={selectedItem}
                    onClose={() => setDrawerMode('VIEW')}
                    isStandalone={false}
                  />
                </div>
              )}
              {drawerMode === 'VIEW' && (
                <>
                  {/* Status, SLA & Progress Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Status</div>
                      <div className="font-semibold text-slate-200 mt-0.5">{selectedItem.status}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">SLA Standing</div>
                      <div className={`font-semibold mt-0.5 ${
                        selectedItem.slaStatus === 'SLA Breached' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {selectedItem.slaStatus}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Resolution Due</div>
                      <div className="font-mono text-slate-200 mt-0.5">{selectedItem.targetResolutionDate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Owner</div>
                      <div className="text-slate-200 font-medium mt-0.5">{selectedItem.ownerName}</div>
                    </div>
                  </div>

                  {/* Description & Action Plan */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-amber-400">
                        Description & Problem Statement
                      </h4>
                      <p className="mt-1 text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-sky-400">
                        Root Cause Analysis
                      </h4>
                      <p className="mt-1 text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {selectedItem.rootCauseAnalysis}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-emerald-400">
                        Corrective Action Plan
                      </h4>
                      <p className="mt-1 text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {selectedItem.proposedActionPlan}
                      </p>
                    </div>
                  </div>

                  {/* Affected Assets & Framework Mapping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Affected Scope & Assets</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                        {selectedItem.affectedAssets.map((asset, i) => (
                          <li key={i}>{asset}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Linked Controls & Standards</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.linkedControls.map((ctrl, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-mono">
                            {ctrl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Progress Slider */}
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Update Implementation Progress</span>
                      <span className="font-mono text-amber-300 font-bold text-sm">
                        {selectedItem.remediationProgressPct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={selectedItem.remediationProgressPct}
                      onChange={(e) => {
                        const newPct = Number(e.target.value);
                        updateUnifiedRemediation(selectedItem.id, {
                          remediationProgressPct: newPct,
                          status: newPct >= 100 ? 'Pending Auditor Verification' : 'Remediation In Progress'
                        });
                        setSelectedItem(prev => prev ? { ...prev, remediationProgressPct: newPct } : null);
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0% Started</span>
                      <span>50% Testing</span>
                      <span>100% Ready for Sign-Off</span>
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Implementation Milestones</span>
                      <span className="text-[10px] text-slate-500">
                        {selectedItem.milestones.filter(m => m.completed).length} / {selectedItem.milestones.length} Completed
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {selectedItem.milestones.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() => {
                              const updatedMilestones = selectedItem.milestones.map(itemM =>
                                itemM.id === m.id
                                  ? { ...itemM, completed: !itemM.completed, completedAt: !itemM.completed ? new Date().toISOString() : undefined }
                                  : itemM
                              );
                              updateUnifiedRemediation(selectedItem.id, { milestones: updatedMilestones });
                              setSelectedItem(prev => prev ? { ...prev, milestones: updatedMilestones } : null);
                            }}
                            className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {m.title}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Target: {m.targetDate}</span>
                              <span>•</span>
                              <span>Owner: {m.owner}</span>
                              {m.completedAt && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-400">Done {m.completedAt.split('T')[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Trail / History */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Audit Trail & Event History</span>
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedItem.history.map((h) => (
                        <div key={h.id} className="p-2 bg-slate-800/30 rounded border border-slate-800 text-[11px]">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-slate-300">{h.action}</span>
                            <span className="font-mono text-[10px]">{h.timestamp.split('T')[0]}</span>
                          </div>
                          <p className="text-slate-400 mt-0.5">{h.notes}</p>
                          <div className="text-[9.5px] text-slate-500 mt-1">Actor: {h.actor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* WORKFLOW: Risk Exception / Waiver */}
              {drawerMode === 'WAIVER' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                    <div className="flex items-center gap-2 font-semibold">
                      <Scale className="w-4 h-4 text-purple-400" />
                      <span>Formal Risk Exception & Waiver Protocol</span>
                    </div>
                    <p className="text-[11px] text-purple-300 mt-1">
                      Enables business units to request a temporary waiver for non-conformities when technical remediation is constrained. Requires formal CISO approval and residual risk acceptance.
                    </p>
                  </div>

                  {selectedItem.waiverRequest ? (
                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-300 font-bold">
                          {selectedItem.waiverRequest.waiverCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          selectedItem.waiverRequest.approvalStatus === 'Approved by CISO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : selectedItem.waiverRequest.approvalStatus === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {selectedItem.waiverRequest.approvalStatus}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-300">
                        <div className="text-[10px] text-slate-400 uppercase">Business Justification</div>
                        <p className="p-2.5 bg-slate-900 rounded border border-slate-800">
                          {selectedItem.waiverRequest.businessJustification}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <span className="text-slate-400">Duration: </span>
                          <span className="text-white font-medium">{selectedItem.waiverRequest.waiverDurationDays} days</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Expiry Date: </span>
                          <span className="font-mono text-white">{selectedItem.waiverRequest.expiryDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Residual Risk: </span>
                          <span className="text-amber-300 font-semibold">{selectedItem.waiverRequest.residualRiskLevel}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Requested By: </span>
                          <span className="text-white">{selectedItem.waiverRequest.requestedBy}</span>
                        </div>
                      </div>

                      {selectedItem.waiverRequest.approvedBy && (
                        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-200">
                          <div className="font-semibold text-[11px]">Executive Approval Granted</div>
                          <div className="text-[10px] text-emerald-300">
                            Approved by {selectedItem.waiverRequest.approvedBy} on {selectedItem.waiverRequest.approvalDate?.split('T')[0]}
                          </div>
                        </div>
                      )}

                      {/* CISO Action Buttons */}
                      {isCISO && selectedItem.waiverRequest.approvalStatus === 'Pending Executive Review' && (
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
                          <button
                            onClick={() => handleApproveWaiver(selectedItem.id, true)}
                            className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                          >
                            Approve Exception (CISO)
                          </button>
                          <button
                            onClick={() => handleApproveWaiver(selectedItem.id, false)}
                            className="flex-1 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
                          >
                            Reject Exception
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitWaiver} className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Business & Operational Justification *
                        </label>
                        <textarea
                          rows={3}
                          value={waiverJustification}
                          onChange={(e) => setWaiverJustification(e.target.value)}
                          placeholder="Explain why immediate remediation is unfeasible (e.g. legacy system freeze, dependency on vendor patch in Q4)..."
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Waiver Duration (Days)
                          </label>
                          <input
                            type="number"
                            min="30"
                            max="365"
                            value={waiverDurationDays}
                            onChange={(e) => setWaiverDurationDays(Number(e.target.value))}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Residual Risk Rating
                          </label>
                          <select
                            value={waiverResidualRisk}
                            onChange={(e) => setWaiverResidualRisk(e.target.value as any)}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                          >
                            <option value="Low">Low Residual Risk</option>
                            <option value="Medium">Medium Residual Risk</option>
                            <option value="High">High Residual Risk</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Mandated Conditions / Monitoring Commitments
                        </label>
                        <input
                          type="text"
                          value={waiverConditions}
                          onChange={(e) => setWaiverConditions(e.target.value)}
                          placeholder="e.g. Host-based WAF active, daily log review by SOC..."
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded transition-colors shadow-sm"
                      >
                        Submit Waiver for CISO Review
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* WORKFLOW: Compensating Controls */}
              {drawerMode === 'COMPENSATING' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>Compensating Controls Verification Engine</span>
                    </div>
                    <p className="text-[11px] text-indigo-300 mt-1">
                      Register and verify secondary defensive controls that neutralize exposure when primary controls cannot be directly deployed (ISO 27001 / MAS TRM alignment).
                    </p>
                  </div>

                  {/* List of existing compensating controls */}
                  {(selectedItem.compensatingControls || []).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Active Compensating Controls
                      </h4>
                      {selectedItem.compensatingControls?.map((cmp) => (
                        <div key={cmp.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{cmp.controlName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                              {cmp.effectivenessScore}% Effectiveness
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{cmp.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-700/60">
                            <span>Verified by {cmp.verifiedBy}</span>
                            <span className="font-mono">{cmp.verificationDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form to add compensating control */}
                  <form onSubmit={handleAddCompensatingControl} className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-semibold text-slate-200">Add Verified Compensating Control</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Control Identifier & Name *
                      </label>
                      <input
                        type="text"
                        value={compControlName}
                        onChange={(e) => setCompControlName(e.target.value)}
                        placeholder="e.g. Automated Microsegmentation & IPS Isolation Rule"
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Mitigation Description & Technical Operation
                      </label>
                      <textarea
                        rows={2}
                        value={compControlDesc}
                        onChange={(e) => setCompControlDesc(e.target.value)}
                        placeholder="Describe how this control blocks the exploit vector..."
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Effectiveness Score (%)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="100"
                          value={compControlEffectiveness}
                          onChange={(e) => setCompControlEffectiveness(Number(e.target.value))}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Evidence Artifact Hash / ID
                        </label>
                        <input
                          type="text"
                          value={compControlEvidence}
                          onChange={(e) => setCompControlEvidence(e.target.value)}
                          placeholder="EVD-2026-CMP-09"
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors shadow-sm"
                    >
                      Record Compensating Control
                    </button>
                  </form>
                </div>
              )}

              {/* WORKFLOW: Audit Sign-Off */}
              {drawerMode === 'SIGNOFF' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                    <div className="flex items-center gap-2 font-semibold">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Formal Independent Audit Sign-Off Desk</span>
                    </div>
                    <p className="text-[11px] text-emerald-300 mt-1">
                      Final verification step adhering to ISO 19011 and MAS TRM inspection guidelines. Only accredited internal/external lead auditors may execute closure signatures.
                    </p>
                  </div>

                  {selectedItem.auditSignOff ? (
                    <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Audit Sign-Off Executed</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {selectedItem.auditSignOff.signatureTimestamp.split('T')[0]}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase">Conclusion</div>
                        <div className="text-slate-200 font-medium">{selectedItem.auditSignOff.conclusion}</div>
                        <div className="text-slate-400 text-[11px] mt-1">{selectedItem.auditSignOff.notes}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                        <div>Auditor: <span className="text-slate-200">{selectedItem.auditSignOff.auditorName}</span></div>
                        <div>Body: <span className="text-slate-200">{selectedItem.auditSignOff.auditOrganization}</span></div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleAuditSignOffSubmit} className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Auditor Assessment Conclusion *
                        </label>
                        <select
                          value={signOffConclusion}
                          onChange={(e) => setSignOffConclusion(e.target.value as any)}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Satisfactory - Finding Resolved">
                            Satisfactory - Finding Resolved (Close Action)
                          </option>
                          <option value="Deficient - Reopen Remediation">
                            Deficient - Reopen Remediation (Incomplete Evidence)
                          </option>
                          <option value="Exception Approved with Conditions">
                            Exception Approved with Conditions
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Assurance Authority / Audit Organization
                        </label>
                        <input
                          type="text"
                          value={signOffBody}
                          onChange={(e) => setSignOffBody(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Auditor Fieldwork Notes & Objective Verification
                        </label>
                        <textarea
                          rows={3}
                          value={signOffNotes}
                          onChange={(e) => setSignOffNotes(e.target.value)}
                          placeholder="Record objective testing notes, sampling references, or reason for reopening..."
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded transition-colors shadow-sm"
                      >
                        Digitally Sign & Validate Closure
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE REMEDIATION ITEM MODAL */}
      {showAddModal && (
        <div id="add-remediation-modal" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Raise Unified Remediation Action</h3>
                  <p className="text-xs text-slate-400">Initiate closed-loop tracking for regulatory, perimeter, or security gaps.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRemediation} className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300 flex-1">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Remediation Title *
                </label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g. Enforce Multi-Factor Authentication on Production Jump Hosts"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Source Domain *</label>
                  <select
                    value={newItemSourceDomain}
                    onChange={(e) => setNewItemSourceDomain(e.target.value as any)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Regulatory Gap">Regulatory Gap (ISO / MAS)</option>
                    <option value="Brand & Perimeter Infringement">Brand & Perimeter Infringement</option>
                    <option value="Vulnerability Management">Vulnerability Management</option>
                    <option value="Third-Party / Vendor Finding">Third-Party / Vendor Finding</option>
                    <option value="Continuous Compliance Drift">Continuous Compliance Drift</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Severity Rating *</label>
                  <select
                    value={newItemSeverity}
                    onChange={(e) => setNewItemSeverity(e.target.value as any)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Critical (48h SLA)</option>
                    <option value="High">High (7d SLA)</option>
                    <option value="Medium">Medium (30d SLA)</option>
                    <option value="Low">Low (90d SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Defect Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Provide context regarding the non-conformity or security weakness..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Proposed Corrective Action Plan *
                </label>
                <textarea
                  rows={2}
                  value={newItemActionPlan}
                  onChange={(e) => setNewItemActionPlan(e.target.value)}
                  placeholder="Concrete engineering or policy steps to remediate..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assignee / Owner Name *</label>
                  <input
                    type="text"
                    value={newItemOwner}
                    onChange={(e) => setNewItemOwner(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newItemDept}
                    onChange={(e) => setNewItemDept(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Resolution Date *</label>
                  <input
                    type="date"
                    value={newItemTargetDate}
                    onChange={(e) => setNewItemTargetDate(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Affected Asset / System</label>
                  <input
                    type="text"
                    value={newItemAsset}
                    onChange={(e) => setNewItemAsset(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-colors shadow-sm"
                >
                  Create & Launch Remediation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Incident Response Lifecycle Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <IncidentResponseTimeline
              onClose={() => setShowTimelineModal(false)}
              onOpenRemediation={(code) => {
                setShowTimelineModal(false);
                const found = tenantRemediations.find(r => r.remediationCode === code);
                if (found) {
                  setSelectedItem(found);
                  setDrawerMode('VIEW');
                }
              }}
              isStandalone={true}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default RemediationDeskModule;
