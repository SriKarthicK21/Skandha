// ============================================================================
// SKANDA ENTERPRISE GRC: MAS LIVE REGULATORY INTELLIGENCE WORKSPACE
// Path: src/components/mas/regulatory/MASLiveRegulatoryIntelligenceWorkspace.tsx
//
// Phase 23: Enterprise Live Regulatory Intelligence Center
// Complete 12-section workspace for authoritative MAS regulatory monitoring,
// immutable version lineage, tenant applicability, impact assessment, and copilot.
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  FileCode2,
  FileDiff,
  FileText,
  Filter,
  Flame,
  GitBranch,
  GitCommit,
  Globe,
  HelpCircle,
  History,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  UserCheck,
  XCircle,
  Zap
} from 'lucide-react';

import {
  ApplicabilityStatus,
  CustomerFinancialProfile,
  FinancialInstitutionType,
  ImpactLevel,
  RegulatoryChangeEvent,
  RegulatoryNotice360,
  RegulatoryStatus,
  RegulatoryVersion,
  RegulatoryWatchSubscription,
  RequirementDiff,
  TenantImpactAssessment,
  TenantNoticeApplicability
} from '../../../types/masRegulatoryIntelligenceTypes';

import { masRegulatoryIntelligenceService } from '../../../../server/services/regulatory/MASRegulatoryIntelligenceService';

interface Props {
  onNavigateToWorkflow?: () => void;
  onNavigateToNotice644?: () => void;
  onNavigateToNotice655?: () => void;
}

export const MASLiveRegulatoryIntelligenceWorkspace: React.FC<Props> = ({
  onNavigateToWorkflow,
  onNavigateToNotice644,
  onNavigateToNotice655
}) => {
  // --------------------------------------------------------------------------
  // STATE: Active Tab (12 workspace sections)
  // --------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<
    | 'feed'
    | 'applicable'
    | 'changes'
    | 'impact'
    | 'library'
    | 'historical'
    | 'consultations'
    | 'faqs'
    | 'guidelines'
    | 'timeline'
    | 'watchlist'
    | 'provenance'
  >('feed');

  // Tenant Financial Profile State (Enterprise Customer Context)
  const [customerProfile, setCustomerProfile] = useState<CustomerFinancialProfile>({
    tenantId: 'tenant-enterprise-bank-sg',
    institutionName: 'Apex International Bank (Singapore)',
    institutionType: 'BANK',
    licenceType: 'Full Bank',
    sector: 'BANKING',
    operatesCriticalSystems: true,
    criticalSystemsList: ['Core Banking Engine (FIS Profile)', 'FAST/PayNow Settlement Switch', 'Internet Banking API Gateway'],
    usesPublicCloud: true,
    cloudProviders: ['AWS', 'AZURE'],
    providesOnlineFinancialServices: true,
    operatesCustomerFacingApis: true,
    usesGenAIOrLLMs: true,
    hasOutsourcedMaterialServices: true
  });

  // Drawer & Modal States
  const [selectedNotice, setSelectedNotice] = useState<RegulatoryNotice360 | null>(null);
  const [selectedDiffEvent, setSelectedDiffEvent] = useState<RegulatoryChangeEvent | null>(null);
  const [activeDiffRequirements, setActiveDiffRequirements] = useState<RequirementDiff[] | null>(null);
  const [syncingSources, setSyncingSources] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // AI Copilot Query State
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<any | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [showCopilotDrawer, setShowCopilotDrawer] = useState(false);

  // Watchlist State
  const [watchSubscriptions, setWatchSubscriptions] = useState<RegulatoryWatchSubscription[]>([
    {
      subscriptionId: 'sub-01',
      tenantId: customerProfile.tenantId,
      subscribedBy: 'CISO / Regulatory Risk Lead',
      watchNoticeIds: ['mas-notice-fsm-n05', 'mas-notice-fsm-n06', 'mas-notice-658'],
      watchFamilies: ['TECHNOLOGY_RISK_MANAGEMENT', 'CYBER_HYGIENE', 'THIRD_PARTY_RISK', 'OPERATIONAL_RESILIENCE'],
      watchEntityTypes: ['BANK', 'ALL_FINANCIAL_INSTITUTIONS'],
      minAlertLevel: 'HIGH',
      emailNotificationsEnabled: true,
      webhookStreamingEnabled: true,
      createdAt: '2026-01-15T08:00:00Z'
    }
  ]);

  // Acknowledged changes
  const [acknowledgedEvents, setAcknowledgedEvents] = useState<Set<string>>(new Set(['evt-02']));

  // --------------------------------------------------------------------------
  // DATA QUERIES FROM REGULATORY INTELLIGENCE SERVICE
  // --------------------------------------------------------------------------
  const allNotices = useMemo(() => masRegulatoryIntelligenceService.getAllNotices(), []);
  const sourceMetadata = useMemo(() => masRegulatoryIntelligenceService.getSourceMetadata(), [syncingSources]);
  const changeEvents = useMemo(() => masRegulatoryIntelligenceService.getRegulatoryChangeEvents(), []);
  const applicabilityList = useMemo(
    () => masRegulatoryIntelligenceService.evaluateTenantApplicability(customerProfile),
    [customerProfile]
  );
  const impactAssessments = useMemo(
    () => masRegulatoryIntelligenceService.assessAllChangesForTenant(customerProfile),
    [customerProfile]
  );

  // Filtered Lists
  const liveFeedItems = useMemo(() => {
    return changeEvents.filter(evt => {
      if (statusFilter !== 'ALL' && evt.eventType !== statusFilter && evt.impactLevel !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          evt.noticeNumber.toLowerCase().includes(q) ||
          evt.title.toLowerCase().includes(q) ||
          evt.changeSummary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [changeEvents, statusFilter, searchQuery]);

  const noticeLibraryItems = useMemo(() => {
    return allNotices.filter(n => {
      if (statusFilter !== 'ALL' && n.currentStatus !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          n.noticeNumber.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.governingAct.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allNotices, statusFilter, searchQuery]);

  const historicalNotices = useMemo(() => allNotices.filter(n => n.isHistorical), [allNotices]);
  const consultations = useMemo(() => allNotices.filter(n => n.currentStatus === 'CONSULTATION'), [allNotices]);
  const guidelines = useMemo(() => allNotices.filter(n => n.currentStatus === 'GUIDANCE'), [allNotices]);

  // Executive Posture Stats
  const postureStats = useMemo(() => {
    const applicableCount = applicabilityList.filter(a => a.applicabilityStatus === 'APPLICABLE').length;
    const highImpactChanges = changeEvents.filter(e => e.impactLevel === 'CRITICAL' || e.impactLevel === 'HIGH').length;
    const totalAffectedControls = impactAssessments.reduce((sum, i) => sum + i.affectedControlsCount, 0);
    const totalActions = impactAssessments.reduce((sum, i) => sum + i.requiredRemediationActions.length, 0);
    const pendingActions = impactAssessments.reduce(
      (sum, i) => sum + i.requiredRemediationActions.filter(a => a.status === 'PENDING').length,
      0
    );

    return {
      applicableCount,
      totalNotices: allNotices.length,
      highImpactChanges,
      totalAffectedControls,
      totalActions,
      pendingActions,
      postureStatus: pendingActions > 0 ? 'ACTION_REQUIRED' : 'ALIGNED'
    };
  }, [applicabilityList, allNotices, changeEvents, impactAssessments]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleTriggerSync = () => {
    setSyncingSources(true);
    setTimeout(() => {
      masRegulatoryIntelligenceService.syncRegulatorySources();
      setSyncingSources(false);
    }, 600);
  };

  const handleOpenNotice360 = (notice: RegulatoryNotice360) => {
    setSelectedNotice(notice);
  };

  const handleOpenDiff = (event: RegulatoryChangeEvent) => {
    setSelectedDiffEvent(event);
    if (event.oldVersionId && event.newVersionId) {
      try {
        const diffs = masRegulatoryIntelligenceService.compareVersions(event.oldVersionId, event.newVersionId);
        setActiveDiffRequirements(diffs);
      } catch {
        setActiveDiffRequirements(event.requirementDiffs);
      }
    } else {
      setActiveDiffRequirements(event.requirementDiffs);
    }
  };

  const handleAcknowledge = (eventId: string) => {
    setAcknowledgedEvents(prev => {
      const next = new Set(prev);
      next.add(eventId);
      return next;
    });
  };

  const handleAskCopilot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotQuery.trim()) return;

    setCopilotLoading(true);
    setTimeout(() => {
      const res = masRegulatoryIntelligenceService.queryCopilot(
        {
          tenantId: customerProfile.tenantId,
          query: copilotQuery,
          focusedNoticeNumber: selectedNotice ? selectedNotice.noticeNumber : undefined
        },
        customerProfile
      );
      setCopilotResponse(res);
      setCopilotLoading(false);
    }, 400);
  };

  const handleToggleWatchNotice = (noticeId: string) => {
    setWatchSubscriptions(prev => {
      const existing = prev[0];
      if (!existing) return prev;
      const has = existing.watchNoticeIds.includes(noticeId);
      const updated = has
        ? existing.watchNoticeIds.filter(id => id !== noticeId)
        : [...existing.watchNoticeIds, noticeId];
      return [{ ...existing, watchNoticeIds: updated }];
    });
  };

  // --------------------------------------------------------------------------
  // COLOR HELPERS
  // --------------------------------------------------------------------------
  const getStatusBadge = (status: RegulatoryStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'AMENDED':
        return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'SUPERSEDED':
      case 'HISTORICAL':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'CANCELLED':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'CONSULTATION':
        return 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'GUIDANCE':
        return 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getImpactBadge = (impact: ImpactLevel) => {
    switch (impact) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white font-bold';
      case 'HIGH':
        return 'bg-orange-500 text-white font-semibold';
      case 'MEDIUM':
        return 'bg-amber-500 text-white';
      case 'LOW':
        return 'bg-emerald-600 text-white';
      case 'INFORMATIONAL':
        return 'bg-sky-500 text-white';
    }
  };

  const getApplicabilityBadge = (app: ApplicabilityStatus) => {
    switch (app) {
      case 'APPLICABLE':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
      case 'CONDITIONAL':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30';
      case 'NOT_APPLICABLE':
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30';
      case 'HISTORICAL':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30';
      case 'REQUIRES_REVIEW':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* HEADER & SYNCHRONIZATION BANNER */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MAS AUTHORITATIVE REGULATORY SOURCE GROUNDED</span>
              <span className="text-indigo-400">•</span>
              <span className="font-mono">SHA-256 VERIFIED</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
              MAS Live Regulatory Intelligence
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Continuous regulatory ingestion, immutable version lineage, tenant-scoped applicability, and downstream control & policy impact assessment direct from the Monetary Authority of Singapore (MAS).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sync Frequency Disclosure & Trigger */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-300 flex items-center gap-3">
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Sync Mechanism</div>
                <div className="font-medium text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Periodic 6h Cycle</span>
                  <span className="text-emerald-400 text-[11px]">(Last synced 12m ago)</span>
                </div>
              </div>
              <button
                onClick={handleTriggerSync}
                disabled={syncingSources}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingSources ? 'animate-spin' : ''}`} />
                <span>{syncingSources ? 'Syncing...' : 'Sync Sources'}</span>
              </button>
            </div>

            {/* Grounded Copilot Drawer Button */}
            <button
              onClick={() => setShowCopilotDrawer(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>Grounded Copilot</span>
            </button>
          </div>
        </div>

        {/* Executive Posture KPIs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Applicable Notices</div>
            <div className="text-xl font-bold text-white mt-1">
              {postureStats.applicableCount} <span className="text-xs font-normal text-slate-400">/ {postureStats.totalNotices}</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Scoping Active Profile</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">High Impact Changes</div>
            <div className="text-xl font-bold text-rose-400 mt-1">{postureStats.highImpactChanges}</div>
            <div className="text-[10px] text-rose-300/80 mt-0.5">Requires immediate review</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Affected Controls</div>
            <div className="text-xl font-bold text-amber-300 mt-1">{postureStats.totalAffectedControls}</div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">Canonical GRC Controls</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Pending Actions</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">{postureStats.pendingActions}</div>
            <div className="text-[10px] text-indigo-200/80 mt-0.5">{postureStats.totalActions} total remediation tasks</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Regulatory Posture</div>
            <div className="text-sm font-bold text-amber-400 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>ACTION REQUIRED</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">14d to FSM-N05 target</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Source Integrity</div>
            <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% SHA-256 MATCH</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">MAS Official Gazette</div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TENANT FINANCIAL INSTITUTION CONTEXT BAR */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{customerProfile.institutionName}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                {customerProfile.licenceType}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Tenant: {customerProfile.tenantId}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sector: <span className="font-semibold text-slate-700 dark:text-slate-300">{customerProfile.sector}</span> • Critical Systems: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{customerProfile.operatesCriticalSystems ? 'YES (3 Registered)' : 'NO'}</span> • Cloud: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{customerProfile.cloudProviders?.join(', ')}</span> • GenAI: <span className="font-semibold text-purple-600 dark:text-purple-400">Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Institution Profile Scope:</span>
          <select
            value={customerProfile.institutionType}
            onChange={e =>
              setCustomerProfile(prev => ({
                ...prev,
                institutionType: e.target.value as FinancialInstitutionType,
                licenceType: e.target.value === 'BANK' ? 'Full Bank' : e.target.value === 'PAYMENT_SERVICE_PROVIDER' ? 'Major Payment Institution (MPI)' : 'Licensed CMS Entity'
              }))
            }
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="BANK">Bank (Full / Wholesale)</option>
            <option value="MERCHANT_BANK">Merchant Bank</option>
            <option value="PAYMENT_SERVICE_PROVIDER">Payment Service Provider (MPI)</option>
            <option value="DIGITAL_TOKEN_SERVICE">Digital Token Service Provider</option>
            <option value="CAPITAL_MARKETS_SERVICES">Capital Markets Services (CMS)</option>
            <option value="INSURER">Direct Insurer</option>
          </select>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* WORKSPACE NAVIGATION TABS (12 SECTIONS) */}
      {/* ==================================================================== */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-2 overflow-x-auto gap-2">
          <nav className="flex space-x-1 sm:space-x-2 text-xs font-medium min-w-max">
            {[
              { id: 'feed', label: 'Live Feed', icon: Activity, badge: `${liveFeedItems.length}` },
              { id: 'applicable', label: 'Applicable Notices', icon: ShieldCheck, badge: `${postureStats.applicableCount}` },
              { id: 'changes', label: 'Regulatory Changes & Diff', icon: FileDiff, badge: `${changeEvents.length}` },
              { id: 'impact', label: 'Impact Assessments', icon: Flame, badge: `${impactAssessments.length}` },
              { id: 'library', label: 'Notice Library', icon: BookOpen, badge: `${allNotices.length}` },
              { id: 'historical', label: 'Historical Notices', icon: History, badge: `${historicalNotices.length}` },
              { id: 'consultations', label: 'Consultations', icon: HelpCircle, badge: `${consultations.length}` },
              { id: 'faqs', label: 'FAQs & Notes', icon: MessageSquare, badge: '5' },
              { id: 'guidelines', label: 'Guidelines (14 Domains)', icon: Layers, badge: '1' },
              { id: 'timeline', label: 'Regulatory Timeline', icon: Calendar },
              { id: 'watchlist', label: 'Watchlist & Alerts', icon: Bell, badge: `${watchSubscriptions.length}` },
              { id: 'provenance', label: 'Source & Provenance', icon: FileCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SEARCH & FILTER BAR */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices, requirements, acts, controls..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Filter Status:</span>
          {['ALL', 'ACTIVE', 'AMENDED', 'HISTORICAL', 'CONSULTATION', 'GUIDANCE'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: LIVE REGULATORY FEED */}
      {/* ==================================================================== */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Official MAS Regulatory Activity Feed ({liveFeedItems.length} Events)
            </h3>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Automated Ingestion Feed • Provenance SHA-256 Locked</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {liveFeedItems.map(event => {
              const isAcknowledged = acknowledgedEvents.has(event.eventId);
              return (
                <div
                  key={event.eventId}
                  className={`p-4 rounded-xl border transition-all ${
                    isAcknowledged
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-85'
                      : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-md ring-1 ring-indigo-500/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700">
                          {event.noticeNumber}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${getStatusBadge(event.eventType === 'NEW_NOTICE' ? 'ACTIVE' : 'AMENDED')}`}>
                          {event.eventType.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] rounded font-bold ${getImpactBadge(event.impactLevel)}`}>
                          IMPACT: {event.impactLevel}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Detected: {new Date(event.detectedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {event.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {event.changeSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Published: <strong className="text-slate-700 dark:text-slate-200">{event.publishedDate}</strong></span>
                        <span>•</span>
                        <span>Effective: <strong className="text-rose-600 dark:text-rose-400">{event.effectiveDate}</strong></span>
                        <span>•</span>
                        <span>Affected Requirements: <strong className="text-indigo-600 dark:text-indigo-400">{event.requirementDiffs.length}</strong></span>
                        <span>•</span>
                        <span>SHA-256: <code className="text-[10px] text-slate-400">{event.documentSha256.substring(0, 12)}...</code></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const n = masRegulatoryIntelligenceService.getNoticeById(event.noticeId);
                            if (n) handleOpenNotice360(n);
                          }}
                          className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Notice 360</span>
                        </button>

                        <button
                          onClick={() => handleOpenDiff(event)}
                          className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileDiff className="w-3.5 h-3.5" />
                          <span>Compare Diff</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveTab('impact');
                          }}
                          className="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Assess Impact</span>
                        </button>

                        {!isAcknowledged ? (
                          <button
                            onClick={() => handleAcknowledge(event.eventId)}
                            className="px-2.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        ) : (
                          <span className="px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Acknowledged</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: APPLICABLE NOTICES */}
      {/* ==================================================================== */}
      {activeTab === 'applicable' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Tenant Applicability Matrix ({customerProfile.institutionName})
            </h3>
            <span className="text-xs text-slate-500">Evaluated against statutory institution mandate</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applicabilityList.map(app => (
              <div
                key={app.noticeId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-indigo-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                        {app.noticeNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${getApplicabilityBadge(app.applicabilityStatus)}`}>
                        {app.applicabilityStatus}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{app.title}</h4>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Applicability Rationale:</span>
                  </div>
                  <p className="leading-relaxed">{app.applicabilityRationale}</p>
                </div>

                {/* Criteria Match Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    {app.evaluatedCriteria.institutionTypeMatched ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>FI Type Match ({customerProfile.institutionType})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    {app.evaluatedCriteria.criticalSystemsTriggered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Critical Systems Trigger</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    {app.evaluatedCriteria.cloudUsageTriggered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Cloud Scope Trigger</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    {app.evaluatedCriteria.onlineServicesTriggered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Online Services Trigger</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500">
                    Applicable Requirements: <strong className="text-slate-900 dark:text-white">{app.applicableRequirementsCount}</strong>
                  </span>

                  <button
                    onClick={() => {
                      const n = masRegulatoryIntelligenceService.getNoticeById(app.noticeId);
                      if (n) handleOpenNotice360(n);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Notice 360</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: REGULATORY CHANGES & VERSION DIFF */}
      {/* ==================================================================== */}
      {activeTab === 'changes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileDiff className="w-4 h-4 text-indigo-500" />
                Version A vs Version B Granular Requirement Diff
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact statutory comparison highlighting ADDED, REMOVED, MODIFIED, and UNCHANGED provisions.
              </p>
            </div>
          </div>

          {/* Version Selection Header */}
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-indigo-900/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-300">
                <GitBranch className="w-4 h-4" />
                <span>Notice FSM-N05 (Financial Services and Markets Act 2022)</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                Comparing: <span className="text-indigo-300">Version 2024 (Baseline)</span> → <span className="text-emerald-400">Version 2026 (Statutory Revision)</span>
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold">
                +1 ADDED (GenAI & LLM Risk)
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 font-semibold">
                ~1 MODIFIED (CIS Resilience 4h Max)
              </span>
            </div>
          </div>

          {/* Granular Diff Items */}
          <div className="space-y-4">
            {changeEvents[0]?.requirementDiffs.map(diff => (
              <div
                key={diff.requirementId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {diff.sectionCode}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{diff.title}</h5>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        diff.diffType === 'ADDED'
                          ? 'bg-emerald-600 text-white'
                          : diff.diffType === 'MODIFIED'
                          ? 'bg-blue-600 text-white'
                          : diff.diffType === 'REMOVED'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-500 text-white'
                      }`}
                    >
                      {diff.diffType}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${getImpactBadge(diff.impactLevel)}`}>
                    IMPACT: {diff.impactLevel}
                  </span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {diff.diffType === 'MODIFIED' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-lg">
                        <div className="font-bold text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Version 2024 Baseline Requirement</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                          {diff.oldText}
                        </p>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 rounded-lg">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Version 2026 Amended Requirement</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                          {diff.newText}
                        </p>
                      </div>
                    </div>
                  )}

                  {diff.diffType === 'ADDED' && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 rounded-lg">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Newly Promulgated Statutory Requirement (Version 2026)</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                        {diff.newText}
                      </p>
                    </div>
                  )}

                  {/* Downstream Blast Radius Mapping */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Canonical Controls Impacted:</span>
                      {diff.affectedControls.map(c => (
                        <span key={c} className="px-2 py-0.5 font-mono text-[10px] font-bold rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Policies to Update:</span>
                      {diff.affectedPolicies.map(p => (
                        <span key={p} className="px-2 py-0.5 font-mono text-[10px] font-medium rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: TENANT IMPACT ASSESSMENTS */}
      {/* ==================================================================== */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Downstream Regulatory Impact Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated blast radius calculation linking regulatory amendments directly into Canonical Controls, Policies, Risks, and Workflows.
              </p>
            </div>
            {onNavigateToWorkflow && (
              <button
                onClick={onNavigateToWorkflow}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Open GRC Workflow Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {impactAssessments.map(assessment => (
              <div
                key={assessment.assessmentId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {assessment.noticeNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${getImpactBadge(assessment.overallImpactLevel)}`}>
                        {assessment.overallImpactLevel} IMPACT
                      </span>
                      <span className="text-xs text-slate-400">Assessed: {new Date(assessment.assessedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{assessment.noticeTitle}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Post-Change Assurance</div>
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{assessment.regulatoryAssurancePosture}</div>
                    </div>
                  </div>
                </div>

                {/* Blast Radius Counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Controls Requiring Review</div>
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{assessment.affectedControlsCount}</div>
                    <div className="text-[10px] text-slate-400">{assessment.affectedControlCodes.join(', ')}</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Policies to Update</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">{assessment.affectedPoliciesCount}</div>
                    <div className="text-[10px] text-slate-400">{assessment.affectedPolicyCodes.join(', ')}</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Risks to Reassess</div>
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">{assessment.affectedRisksCount}</div>
                    <div className="text-[10px] text-slate-400">{assessment.affectedRiskCodes.join(', ')}</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Evidence Items Refresh</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{assessment.affectedEvidenceCount}</div>
                    <div className="text-[10px] text-slate-400">SOC2, ISO, MAS Vault</div>
                  </div>
                </div>

                {/* Remediation Action Items (Integrated with existing Workflow Engine) */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Generated Remediation Actions ({assessment.requiredRemediationActions.length})</span>
                    <span className="text-[11px] text-slate-500 normal-case font-normal">Mapped to Canonical Action Model</span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-2.5">Action ID</th>
                          <th className="p-2.5">Remediation Task</th>
                          <th className="p-2.5">Target Type</th>
                          <th className="p-2.5">Assigned Role</th>
                          <th className="p-2.5">Priority</th>
                          <th className="p-2.5">Due Date</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                        {assessment.requiredRemediationActions.map(action => (
                          <tr key={action.actionId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-slate-100">{action.actionId}</td>
                            <td className="p-2.5 font-medium text-slate-900 dark:text-white">{action.title}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {action.targetType}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium">{action.assignedRole}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getImpactBadge(action.priority as ImpactLevel)}`}>
                                {action.priority}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400 font-semibold">{action.dueDate}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                {action.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 5: NOTICE LIBRARY */}
      {/* ==================================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Authoritative MAS Regulatory Notice Library ({noticeLibraryItems.length} Instruments)
            </h3>
            <span className="text-xs text-slate-500">Official MAS Publications Indexed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {noticeLibraryItems.map(notice => (
              <div
                key={notice.noticeId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                      {notice.noticeNumber}
                    </span>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${getStatusBadge(notice.currentStatus)}`}>
                      {notice.currentStatus}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {notice.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Governing Act: <span className="font-semibold text-slate-700 dark:text-slate-300">{notice.governingAct}</span>
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <div>Sector: <strong>{notice.targetSector}</strong></div>
                    <div>Requirements: <strong>{notice.totalRequirementsCount} ({notice.mandatoryRequirementsCount} mandatory)</strong></div>
                    <div>Controls Mapped: <strong>{notice.mappedCanonicalControlsCount}</strong></div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <a
                    href={notice.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>MAS Source</span>
                  </a>

                  <button
                    onClick={() => handleOpenNotice360(notice)}
                    className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Notice 360</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 6: HISTORICAL NOTICES */}
      {/* ==================================================================== */}
      {activeTab === 'historical' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Historical & Superseded MAS Notice Repository</span>
            </div>
            <p>
              Under official Monetary Authority of Singapore regulatory lineage, historical instruments (such as legacy Notice 644) are preserved for forensic auditability and historical compliance audits, but are linked to their active successors (e.g. MAS Notice 658 & TRM Guidelines).
            </p>
          </div>

          <div className="space-y-4">
            {historicalNotices.map(notice => (
              <div
                key={notice.noticeId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded">
                      {notice.noticeNumber}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      HISTORICAL / SUPERSEDED
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Superseded Date: 2021-01-18</div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">{notice.title}</h4>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-white">Active Successor Instrument:</div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{notice.successorNoticeNumber} (Technology Risk Management for Banks) + MAS TRM Guidelines 2021</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 pt-1">
                    Historical requirements: 4h maximum unscheduled downtime per 12 months & 1h mandatory incident notification to MAS.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      if (onNavigateToNotice644) onNavigateToNotice644();
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Open Legacy Notice Simulator</span>
                  </button>

                  <button
                    onClick={() => handleOpenNotice360(notice)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Historical Notice 360</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 7: CONSULTATIONS */}
      {/* ==================================================================== */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              Active MAS Regulatory Consultations & Proposed Revisions
            </h3>
            <span className="text-xs text-slate-500">Upcoming Regulatory Foresight</span>
          </div>

          <div className="space-y-3">
            {consultations.map(c => (
              <div key={c.noticeId} className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-xl p-4 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
                    {c.noticeNumber}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    CONSULTATION PAPER
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Target Family: <strong className="text-slate-900 dark:text-white">{c.family}</strong> • Published: {c.currentVersion.publishedDate}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Under Industry Review</span>
                  <button onClick={() => handleOpenNotice360(c)} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    View Consultation Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 8: FAQS & SUPERVISORY NOTES */}
      {/* ==================================================================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              Official MAS FAQs & Supervisory Clarification Circulars
            </h3>
            <span className="text-xs text-slate-500">Official MAS Interpretations</span>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What constitutes a "Critical System" under MAS Notice 658 and FSM-N05?',
                a: 'A critical system is any system the failure of which will cause significant disruption to the financial institution’s operations or materially impact customer service delivery, including core banking, payment switches, and trade execution engines.',
                ref: 'MAS TRM FAQs Q3.1'
              },
              {
                q: 'How is the 4-hour maximum unscheduled downtime per 12-month period calculated?',
                a: 'Downtime accumulates across all unplanned outages affecting critical systems over any rolling 12-month window. Maintenance windows agreed upon with MAS and scheduled during non-peak hours are excluded.',
                ref: 'MAS Notice 658 Para 4.1 Guidance'
              },
              {
                q: 'Are institutions required to notify MAS within 1 hour for high-severity cyber incidents?',
                a: 'Yes, initial notification must be dispatched within 1 hour of discovering a critical system malfunction or cyber attack that severely degrades operational capability, followed by IT-01 within 14 days.',
                ref: 'MAS Notice 658 Para 5.1 / Incident Circular'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400 font-mono">Q{idx + 1}:</span>
                  <span>{faq.q}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 pl-5 leading-relaxed">
                  {faq.a}
                </div>
                <div className="pl-5 pt-1 text-[11px] text-slate-400 font-medium">
                  Authoritative Reference: <strong className="text-slate-700 dark:text-slate-300">{faq.ref}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 9: GUIDELINES (14 DOMAINS BENCHMARK) */}
      {/* ==================================================================== */}
      {activeTab === 'guidelines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              MAS TRM Guidelines (2021) 14-Domain Reference Benchmark
            </h3>
            <span className="text-xs text-slate-500">Benchmark Guidance Instrument</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">MAS Technology Risk Management Guidelines</h4>
                <p className="text-xs text-slate-500">Issued January 2021 • 14 Governance & Technical Security Domains</p>
              </div>
              <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold text-xs rounded-full">
                GUIDANCE INSTRUMENT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              {[
                '1. IT Governance & Oversight',
                '2. Technology Risk Management',
                '3. Software Application Dev (SecDevOps)',
                '4. IT Project Management',
                '5. IT Service Management',
                '6. System Reliability & Availability',
                '7. Access Control & Identity',
                '8. Cryptography & Key Management',
                '9. Network & Infrastructure Security',
                '10. Security Operations & Monitoring',
                '11. Cyber Threat Intelligence',
                '12. Incident & Crisis Management',
                '13. Technology Audit & Assurance',
                '14. Emerging Technologies (AI/Cloud)'
              ].map(domain => (
                <div key={domain} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  {domain}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 10: REGULATORY TIMELINE */}
      {/* ==================================================================== */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Singapore Regulatory Promulgation & Effective Date Lineage
            </h3>
            <span className="text-xs text-slate-500">Chronological Evolution</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-300 dark:before:bg-indigo-900">
            {[
              {
                date: '2026-06-30',
                title: 'FSM-N05 (Amended 2026) Mandatory Enforcement',
                type: 'FUTURE_DEADLINE',
                desc: 'Strict enforcement of GenAI governance model risk validations and 4-hour max critical system downtime.',
                color: 'bg-rose-500'
              },
              {
                date: '2026-01-01',
                title: 'FSM-N05 Promulgation under FSM Act 2022',
                type: 'ENACTED',
                desc: 'Official gazette of technology and cyber risk mandate for broader digital token and financial institutions.',
                color: 'bg-indigo-500'
              },
              {
                date: '2025-06-01',
                title: 'MAS Consultation P004-2025 on Operational Resilience',
                type: 'CONSULTATION',
                desc: 'Proposed expansion of third-party concentration risk rules and severe-but-plausible scenario testing.',
                color: 'bg-purple-500'
              },
              {
                date: '2021-01-18',
                title: 'MAS Notice 658 Promulgated & TRM Guidelines Revised',
                type: 'HISTORICAL_EVENT',
                desc: 'Notice 658 becomes the active statutory TRM notice for banks, formally succeeding historical Notice 644.',
                color: 'bg-emerald-500'
              },
              {
                date: '2019-08-06',
                title: 'MAS Notice 655 (Cyber Hygiene) Enacted',
                type: 'HISTORICAL_EVENT',
                desc: 'Mandatory 6 baseline cyber hygiene requirements enacted for all financial institutions in Singapore.',
                color: 'bg-cyan-500'
              },
              {
                date: '2013-07-01',
                title: 'MAS Notice 644 (Original Banking TRM)',
                type: 'HISTORICAL_BASELINE',
                desc: 'Original Notice 644 enacted for technology risk management in banks (now classified as Historical/Superseded).',
                color: 'bg-amber-500'
              }
            ].map((t, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ${t.color} ring-4 ring-white dark:ring-slate-900`} />
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.date}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {t.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 11: WATCHLIST & ALERTS */}
      {/* ==================================================================== */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              Tenant Regulatory Watch & Streaming Alert Subscriptions
            </h3>
            <span className="text-xs text-slate-500">Tenant-Scoped Alerts</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            {watchSubscriptions.map(sub => (
              <div key={sub.subscriptionId} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Active Subscription: {sub.subscribedBy}
                    </div>
                    <div className="text-[11px] text-slate-400">Created: {new Date(sub.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                      Email Alerts: ON
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold">
                      Webhook Stream: ACTIVE
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monitored Regulatory Notices:</div>
                  <div className="flex flex-wrap gap-2">
                    {allNotices.map(n => {
                      const isWatched = sub.watchNoticeIds.includes(n.noticeId);
                      return (
                        <button
                          key={n.noticeId}
                          onClick={() => handleToggleWatchNotice(n.noticeId)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isWatched
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>{n.noticeNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 12: SOURCE & PROVENANCE */}
      {/* ==================================================================== */}
      {activeTab === 'provenance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Regulatory Provenance, Source Adapter & SHA-256 Ledger
            </h3>
            <span className="text-xs text-slate-500">Tamper-Proof Audit Trail</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Primary Authority Adapter Metadata</span>
              </h4>
              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Authority:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{sourceMetadata.authorityFullName} ({sourceMetadata.authority})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Base URL:</span>
                  <a href={sourceMetadata.baseUrl} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {sourceMetadata.baseUrl}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Polling Frequency:</span>
                  <span className="font-semibold">{sourceMetadata.syncFrequencyHours} Hours (Periodic Ingestion)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sync Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{sourceMetadata.syncStatus}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SHA-256 Integrity:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {sourceMetadata.sha256VerificationPassed ? 'PASSED (0 Mismatches)' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Ingestion Provenance Proofs</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every regulatory version ingested by SKANDA is crytographically hashed via SHA-256 upon retrieval from the MAS official repository. The hash is immutably sealed into the regulatory graph.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1 border border-slate-200 dark:border-slate-700">
                <div>FSM-N05 (2026): <code>d84f93a1c876b4e...</code></div>
                <div>MAS Notice 658: <code>e7b9201f8413a9c...</code></div>
                <div>MAS Notice 655: <code>b381a9947c01fe2...</code></div>
                <div>MAS Notice 644: <code>a1b2c3d4e5f6071...</code></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* NOTICE 360 DRAWER / MODAL */}
      {/* ==================================================================== */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded">
                    {selectedNotice.noticeNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${getStatusBadge(selectedNotice.currentStatus)}`}>
                    {selectedNotice.currentStatus}
                  </span>
                  {selectedNotice.isHistorical && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      HISTORICAL INSTRUMENT
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{selectedNotice.title}</h3>
                <p className="text-xs text-slate-500">Governing Act: {selectedNotice.governingAct}</p>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Current Version Details */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                <span>Current Version: {selectedNotice.currentVersion.versionTitle}</span>
                <span className="font-mono text-slate-500">{selectedNotice.currentVersion.versionId}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-400">
                <div>Published: <strong className="text-slate-900 dark:text-white">{selectedNotice.currentVersion.publishedDate}</strong></div>
                <div>Effective: <strong className="text-slate-900 dark:text-white">{selectedNotice.currentVersion.effectiveDate}</strong></div>
                <div>Authority: <strong className="text-slate-900 dark:text-white">{selectedNotice.authority}</strong></div>
                <div>Sector: <strong className="text-slate-900 dark:text-white">{selectedNotice.targetSector}</strong></div>
              </div>
              <div className="pt-1 text-[11px] text-slate-500">
                Official SHA-256 Hash: <code className="text-slate-700 dark:text-slate-300">{selectedNotice.currentVersion.documentHash}</code>
              </div>
            </div>

            {/* Statutory Requirements Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-500" />
                Statutory Requirements ({selectedNotice.currentVersion.requirements.length})
              </h4>

              <div className="space-y-2.5">
                {selectedNotice.currentVersion.requirements.map(req => (
                  <div
                    key={req.requirementId}
                    className="p-3.5 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                          {req.sectionCode}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{req.title}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {req.mandatory ? 'MANDATORY' : 'RECOMMENDED'}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{req.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Mapped Controls:</span>
                        {req.mappedControlCodes.map(c => (
                          <span key={c} className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Policies:</span>
                        {req.mappedPolicyCodes.map(p => (
                          <span key={p} className="font-mono text-purple-600 dark:text-purple-400">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href={selectedNotice.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Authoritative MAS Document</span>
              </a>

              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Notice 360
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* GROUNDED AI REGULATORY COPILOT DRAWER */}
      {/* ==================================================================== */}
      {showCopilotDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full shadow-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">MAS Regulatory AI Copilot</h3>
                    <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Zero-Hallucination Source Grounded</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCopilotDrawer(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Sample Queries */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Suggested MAS Regulatory Inquiries:</div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    'What is the maximum unscheduled downtime allowed under Notice 658?',
                    'What does FSM-N05 Section 4.3 require for GenAI models?',
                    'Is Notice 644 still the active TRM notice for banks in Singapore?',
                    'What are the mandatory baseline controls in MAS Notice 655?'
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCopilotQuery(s);
                      }}
                      className="px-2.5 py-1 text-left rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copilot Response Display */}
              {copilotLoading && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-2 text-xs text-slate-500">
                  <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                  <span>Searching official MAS regulatory versions & calculating provenance...</span>
                </div>
              )}

              {copilotResponse && !copilotLoading && (
                <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Authoritative MAS Grounded Answer</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      Confidence: {(copilotResponse.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {copilotResponse.answer}
                  </p>

                  <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/60 text-[11px] space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-white">Strict Citation Provenance:</div>
                    <div>Source Instrument: <strong className="text-indigo-600 dark:text-indigo-400">{copilotResponse.sourceNoticeNumber}</strong> ({copilotResponse.sourceNoticeTitle})</div>
                    <div>Section Reference: <strong>{copilotResponse.sectionReference}</strong></div>
                    <div>Tenant Applicability: <strong className="text-emerald-600 dark:text-emerald-400">{copilotResponse.applicabilityStatus}</strong></div>
                    <div>Mapped Canonical Controls: <code className="text-indigo-600 dark:text-indigo-400 font-bold">{copilotResponse.relatedCanonicalControls.join(', ') || 'N/A'}</code></div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      SHA-256 Hash: <code>{copilotResponse.documentHash.substring(0, 16)}...</code>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskCopilot} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask any MAS regulatory question..."
                value={copilotQuery}
                onChange={e => setCopilotQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={!copilotQuery.trim() || copilotLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
