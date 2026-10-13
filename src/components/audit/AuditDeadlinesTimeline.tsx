import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Calendar,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Filter,
  Users,
  FileCheck2,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Check,
  Building,
  Info,
  ChevronDown,
  CalendarDays,
  FileText,
  UserCheck,
  X
} from 'lucide-react';
import { InternalAuditPlan } from '../../types';

export type AuditTypeFilter = 'ALL' | 'INTERNAL' | 'EXTERNAL';
export type AuditStatusFilter = 'ALL' | 'UPCOMING' | 'COMPLETED';

export interface AuditTimelineMilestone {
  id: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'MANAGEMENT_REVIEW';
  title: string;
  stageName: string;
  targetDate: string;
  endDate?: string;
  status: 'Completed' | 'In Progress' | 'Next Up' | 'Scheduled' | 'Pending';
  leadAuditor: string;
  auditorRole: string;
  isoClauses: string[];
  annexAThemes?: string[];
  scopeSummary: string;
  keyDeliverables: string[];
  readinessPct: number;
  isExternalLocked?: boolean;
  notes?: string;
  targetModule: string;
}

export const AuditDeadlinesTimeline: React.FC = () => {
  const {
    currentTenant,
    internalAudits,
    findings,
    evidence,
    managementReviews,
    setActiveModule,
    currentRole
  } = useGRC();

  const [typeFilter, setTypeFilter] = useState<AuditTypeFilter>('ALL');
  const [selectedMilestone, setSelectedMilestone] = useState<AuditTimelineMilestone | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  // Reference base date (September 2026 context)
  const today = useMemo(() => {
    const now = new Date();
    // Default to Sept 2026 if system time is skewed or for reproducible demo alignment
    if (now.getFullYear() < 2026) {
      return new Date('2026-09-03T00:00:00Z');
    }
    return now;
  }, []);

  // Compute milestones by combining externalAuditTimeline, dynamic internalAudits, and ISMS key gates
  const milestones: AuditTimelineMilestone[] = useMemo(() => {
    const list: AuditTimelineMilestone[] = [];
    const extTimeline = currentTenant?.externalAuditTimeline;

    // 1. Past H1 Internal Audit (from internalAudits context or standard baseline)
    const existingInternalAudits = internalAudits.filter(
      ia => !currentTenant?.id || ia.tenantId === currentTenant?.id
    );

    if (existingInternalAudits.length > 0) {
      existingInternalAudits.forEach(ia => {
        list.push({
          id: ia.id,
          type: 'INTERNAL',
          title: ia.title,
          stageName: 'Internal Audit Fieldwork',
          targetDate: ia.scheduledStartDate,
          endDate: ia.scheduledEndDate,
          status: ia.status === 'Fieldwork Completed' || ia.status === 'Report Issued' || ia.status === 'Closed'
            ? 'Completed'
            : ia.status === 'In Progress'
            ? 'In Progress'
            : 'Scheduled',
          leadAuditor: ia.leadAuditor || 'Marcus Brody',
          auditorRole: 'Lead Internal Auditor',
          isoClauses: ['Clause 9.2', 'Clause 5.15', 'Clause 8.1', 'Clause 8.8'],
          annexAThemes: ['Organizational', 'Technological'],
          scopeSummary: ia.scope,
          keyDeliverables: [
            'Sampling checklist execution',
            'Non-conformity identification',
            'Formal Internal Audit Report issuance'
          ],
          readinessPct: 100,
          notes: ia.executiveSummary,
          targetModule: 'internal_audit'
        });
      });
    } else {
      // Fallback baseline internal audit
      list.push({
        id: 'ia_baseline_1',
        type: 'INTERNAL',
        title: 'H1 ISMS Core Operations & Technical Controls Audit',
        stageName: 'Internal Audit Fieldwork',
        targetDate: '2026-06-10',
        endDate: '2026-06-25',
        status: 'Completed',
        leadAuditor: 'Marcus Brody',
        auditorRole: 'Lead Internal Auditor',
        isoClauses: ['Clause 9.2', 'Clause 5.15', 'Clause 8.8'],
        annexAThemes: ['Organizational', 'Technological'],
        scopeSummary: 'Rigorous sample testing of cloud infrastructure, IAM identities, and technical vulnerability SLAs.',
        keyDeliverables: [
          '3 Internal audit checklists executed',
          'Minor Non-Conformity FND-2026-01 raised & tracked to CAPA',
          'Internal Audit Executive Summary signed off'
        ],
        readinessPct: 100,
        targetModule: 'internal_audit'
      });
    }

    // 2. Pre-Audit Management Review Meeting (Clause 9.3)
    const reviewDate = '2026-09-06';
    const hasReview = managementReviews && managementReviews.length > 0;
    list.push({
      id: 'gate_mgmt_review',
      type: 'MANAGEMENT_REVIEW',
      title: 'Top Management Review & ISMS Suitability Sign-off',
      stageName: 'Clause 9.3 Management Review',
      targetDate: reviewDate,
      endDate: '2026-09-06',
      status: 'Next Up',
      leadAuditor: 'SriKarthiK (CISO) & Executive Board',
      auditorRole: 'Executive Governance Committee',
      isoClauses: ['Clause 9.3', 'Clause 5.1', 'Clause 6.2'],
      annexAThemes: ['Organizational Controls'],
      scopeSummary: 'Mandatory executive review of ISMS performance, internal audit findings, risk assessment outcomes, and resource allocation.',
      keyDeliverables: [
        'Management review minutes and decisions documented',
        'Residual risk acceptance validation',
        'Executive authorization for External Stage 1 Certification'
      ],
      readinessPct: 95,
      targetModule: 'management_review'
    });

    // 3. External Stage 1 Audit: Documentation & ISMS Scope Review
    const stage1Date = extTimeline?.stage1Date || '2026-09-10';
    list.push({
      id: 'ext_stage_1',
      type: 'EXTERNAL',
      title: 'ISO/IEC 27001:2022 Stage 1 Certification Audit',
      stageName: 'Stage 1: Documentation & Scope Review',
      targetDate: stage1Date,
      endDate: stage1Date,
      status: 'Scheduled',
      leadAuditor: currentTenant?.mou?.leadExternalAuditor || 'David Vance',
      auditorRole: 'Lead External Auditor (Accredited Certification Body)',
      isoClauses: ['Clauses 4.1-4.4', 'Clause 5.2', 'Clause 6.1', 'Clause 7.5', 'Clause 9.3'],
      annexAThemes: ['Governance & Scope Boundary', 'Statement of Applicability'],
      scopeSummary: 'Formal desk-review of ISMS context, scope boundaries, Information Security Policy, locked Statement of Applicability (SoA), and internal audit sufficiency.',
      keyDeliverables: [
        'Verified Statement of Applicability (SoA) baseline',
        'Internal Audit & Management Review records',
        'Information Security Policies (POL-SEC-01 through POL-BCP-05)',
        'Stage 1 Auditor Recommendation Report for Stage 2 advancement'
      ],
      readinessPct: 94,
      isExternalLocked: true,
      targetModule: 'external_audit'
    });

    // 4. Pre-Stage 2 Internal Verification & Rapid Gap Remediation
    list.push({
      id: 'ia_pre_stage2',
      type: 'INTERNAL',
      title: 'Pre-Stage 2 Technical Readiness & Evidence Verification Mock',
      stageName: 'Internal Pre-Audit Readiness',
      targetDate: '2026-09-18',
      endDate: '2026-09-19',
      status: 'Scheduled',
      leadAuditor: 'Marcus Brody & Elena Davies',
      auditorRole: 'Internal Audit Team',
      isoClauses: ['Annex A Themes 5, 6, 7, 8', 'Clause 9.1', 'Clause 10.1'],
      annexAThemes: ['People', 'Physical', 'Technological'],
      scopeSummary: 'Dry-run inspection of auditor dossier, fresh telemetry feeds, Okta access reviews, and CrowdStrike EDR sensor proofs.',
      keyDeliverables: [
        '100% evidence freshness verification',
        'Mock interview with system administrators & DevOps engineers',
        'Audit pack packaging & cryptographic hash stamping'
      ],
      readinessPct: 88,
      targetModule: 'internal_audit'
    });

    // 5. External Stage 2 Audit: Fieldwork & Control Implementation Effectiveness
    const stage2Date = extTimeline?.stage2Date || '2026-09-24';
    list.push({
      id: 'ext_stage_2',
      type: 'EXTERNAL',
      title: 'ISO/IEC 27001:2022 Stage 2 Onsite/Cloud Fieldwork Audit',
      stageName: 'Stage 2: Implementation Effectiveness Audit',
      targetDate: stage2Date,
      endDate: '2026-09-26',
      status: 'Scheduled',
      leadAuditor: currentTenant?.mou?.leadExternalAuditor || 'David Vance',
      auditorRole: 'Lead External Auditor & Technical Assessment Team',
      isoClauses: ['Clauses 4–10 Full Verification', '93 Annex A Controls Sampling'],
      annexAThemes: ['All 4 Annex A Themes (Theme 5, 6, 7, 8)'],
      scopeSummary: 'In-depth testing and evidentiary sampling across production environments, developer workflows, physical security, vendor compliance, and incident response procedures.',
      keyDeliverables: [
        'Live technical control demonstrations (IAM, TLS 1.3, KMS, CI/CD gates)',
        'Personnel awareness interviews across in-scope departments',
        'Auditor closing meeting & initial recommendation verdict'
      ],
      readinessPct: 88,
      isExternalLocked: true,
      targetModule: 'external_audit'
    });

    // 6. External Audit Findings CAPA & Closure Milestone
    list.push({
      id: 'gate_capa_closure',
      type: 'EXTERNAL',
      title: 'Stage 2 Audit Findings Remediation & Evidence Submission Deadline',
      stageName: 'CAPA Non-Conformity Resolution Gate',
      targetDate: '2026-10-15',
      endDate: '2026-10-15',
      status: 'Pending',
      leadAuditor: 'David Vance (Reviewing Auditor)',
      auditorRole: 'Certification Body Technical Reviewer',
      isoClauses: ['Clause 10.1', 'Clause 10.2'],
      annexAThemes: ['Corrective Action & Continual Improvement'],
      scopeSummary: 'Final submission cutoff for any corrective action plans (CAPA), root cause analyses (5-Whys), and supporting verification proofs for Stage 2 findings.',
      keyDeliverables: [
        'Closed CAPA tickets in GRC Finding Register',
        'Auditor verification and formal sign-off on non-conformity resolutions'
      ],
      readinessPct: 82,
      targetModule: 'findings_capa'
    });

    // 7. Formal ISO/IEC 27001:2022 Accredited Certificate Grant
    list.push({
      id: 'gate_cert_issuance',
      type: 'EXTERNAL',
      title: 'Formal ISO/IEC 27001:2022 Accredited Certificate Grant',
      stageName: 'Official Certification Milestone',
      targetDate: '2026-10-30',
      endDate: '2026-10-30',
      status: 'Pending',
      leadAuditor: 'Accreditation Board & Certification Authority',
      auditorRole: 'UKAS / ANAB Accredited Registrar',
      isoClauses: ['ISMS Certification Lifecycle'],
      annexAThemes: ['Enterprise Trust & Commercial Assurances'],
      scopeSummary: 'Issuance of three-year valid ISO/IEC 27001:2022 Certificate of Registration with public certificate repository listing.',
      keyDeliverables: [
        'Official Digital Certificate PDF & Badge Asset',
        'Customer Trust Center public compliance publication',
        'Surveillance audit schedule transition'
      ],
      readinessPct: 90,
      targetModule: 'readiness_cert'
    });

    // 8. Year 1 Annual Surveillance Audit Window
    list.push({
      id: 'ext_surveillance_y1',
      type: 'EXTERNAL',
      title: 'Year 1 Periodic Surveillance Audit (ISO 27001 Cl. 9.2 / 9.3)',
      stageName: 'Surveillance Audit Cycle 1',
      targetDate: '2027-09-10',
      endDate: '2027-09-17',
      status: 'Pending',
      leadAuditor: 'Accredited Certification Body',
      auditorRole: 'External Surveillance Team',
      isoClauses: ['Clause 9.1', 'Clause 9.2', 'Clause 9.3', 'Clause 10.2'],
      annexAThemes: ['Continuous Monitoring & High-Risk Controls'],
      scopeSummary: 'Annual check to ensure ongoing ISMS conformity, risk updates, and effective treatment of newly emergent threats.',
      keyDeliverables: [
        '12-month evidence freshness log',
        'Continuous risk assessment review minutes',
        'Surveillance continuation attestation'
      ],
      readinessPct: 75,
      targetModule: 'external_audit'
    });

    return list.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  }, [currentTenant, internalAudits, managementReviews]);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      if (typeFilter === 'INTERNAL') return m.type === 'INTERNAL' || m.type === 'MANAGEMENT_REVIEW';
      if (typeFilter === 'EXTERNAL') return m.type === 'EXTERNAL';
      return true;
    });
  }, [milestones, typeFilter]);

  // Helper function to calculate relative days
  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format date helper
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Find next upcoming milestone
  const nextMilestone = useMemo(() => {
    return milestones.find(m => {
      const days = getDaysRemaining(m.targetDate);
      return days >= 0 && m.status !== 'Completed';
    }) || milestones[1];
  }, [milestones, today]);

  return (
    <div
      id="iso27001-audit-timeline-container"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg space-y-6"
    >
      {/* Glow background accent */}
      <div className="absolute top-0 right-1/4 w-80 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title, Next Deadline Spotlight, and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800/60">
              Audit Operations & Certification Lifecycle
            </span>
            <span className="text-xs text-slate-400 flex items-center space-x-1 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Reference Date: {formatDateDisplay(today.toISOString())}</span>
            </span>
          </div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2 mt-0.5">
            <span>Upcoming Internal & External Audit Deadlines</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Integrated timeline synchronizing <strong className="text-emerald-400">Internal Audit Fieldwork (Cl. 9.2)</strong>, <strong className="text-purple-400">Management Reviews (Cl. 9.3)</strong>, and accredited <strong className="text-sky-400">External Certification Audits (Stage 1 & Stage 2)</strong>.
          </p>
        </div>

        {/* Right side controls: Type filters and View Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audit Type Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              id="filter-all-audits"
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                typeFilter === 'ALL'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Deadlines ({milestones.length})
            </button>
            <button
              id="filter-internal-audits"
              onClick={() => setTypeFilter('INTERNAL')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
                typeFilter === 'INTERNAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Internal ({milestones.filter(m => m.type !== 'EXTERNAL').length})</span>
            </button>
            <button
              id="filter-external-audits"
              onClick={() => setTypeFilter('EXTERNAL')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
                typeFilter === 'EXTERNAL'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>External ({milestones.filter(m => m.type === 'EXTERNAL').length})</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'timeline'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sequential Timeline Track"
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Milestone Cards Grid"
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Immediate Next Deadline Spotlight Banner */}
      {nextMilestone && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/50 via-slate-950 to-slate-950 border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Next Imminent Milestone
                </span>
                <span className="text-xs text-slate-400">
                  Target: <strong className="text-white">{formatDateDisplay(nextMilestone.targetDate)}</strong>
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {nextMilestone.title} ({nextMilestone.stageName})
              </h4>
              <p className="text-xs text-slate-300 line-clamp-1">
                Auditor: <span className="text-sky-300 font-medium">{nextMilestone.leadAuditor}</span> • Scope: {nextMilestone.scopeSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-start md:self-center">
            {/* Days Remaining Pill */}
            {(() => {
              const days = getDaysRemaining(nextMilestone.targetDate);
              return (
                <div className="text-right">
                  <div className="text-xl font-extrabold text-sky-400 tracking-tight">
                    {days > 0 ? `${days} Days` : days === 0 ? 'Today' : 'Passed'}
                  </div>
                  <div className="text-[10px] text-slate-400">Remaining to Window</div>
                </div>
              );
            })()}

            <button
              onClick={() => setActiveModule(nextMilestone.targetModule)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center space-x-1.5 transition shadow-sm"
            >
              <span>Prepare Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TIMELINE MODE: HORIZONTAL / CHRONOLOGICAL PROCESS TRACK */}
      {/* ========================================================================= */}
      {viewMode === 'timeline' ? (
        <div className="space-y-4">
          {/* Scrollable Horizontal Stepper Track */}
          <div className="overflow-x-auto pb-3 pt-1">
            <div className="min-w-[840px] relative px-4">
              {/* Central connecting track line */}
              <div className="absolute top-6 left-8 right-8 h-1 bg-slate-800 rounded-full z-0" />
              <div
                className="absolute top-6 left-8 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-sky-500/20 rounded-full z-0 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      15,
                      (filteredMilestones.filter(m => m.status === 'Completed').length /
                        Math.max(1, filteredMilestones.length)) *
                        100
                    )
                  )}%`
                }}
              />

              {/* Milestone Step Nodes */}
              <div className="grid grid-cols-6 gap-3 relative z-10">
                {filteredMilestones.slice(0, 6).map((item, idx) => {
                  const days = getDaysRemaining(item.targetDate);
                  const isPast = days < 0 || item.status === 'Completed';
                  const isCurrent = days >= 0 && days <= 14 && item.status !== 'Completed';
                  const isSelected = selectedMilestone?.id === item.id;

                  const isInternal = item.type === 'INTERNAL';
                  const isMgmt = item.type === 'MANAGEMENT_REVIEW';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMilestone(item)}
                      className={`flex flex-col items-center text-center cursor-pointer group transition p-2 rounded-xl border ${
                        isSelected
                          ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/30'
                          : 'hover:bg-slate-950/60 border-transparent hover:border-slate-800'
                      }`}
                    >
                      {/* Node Icon Circle */}
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                          isPast
                            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400'
                            : isCurrent
                            ? 'bg-sky-950/90 border-sky-400 text-sky-300 ring-4 ring-sky-500/20 animate-pulse'
                            : isInternal
                            ? 'bg-slate-900 border-emerald-600/60 text-emerald-300'
                            : isMgmt
                            ? 'bg-slate-900 border-purple-500/60 text-purple-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 group-hover:border-sky-500/60'
                        }`}
                      >
                        {isPast ? (
                          <Check className="w-5 h-5" />
                        ) : isInternal ? (
                          <Users className="w-5 h-5" />
                        ) : isMgmt ? (
                          <Building className="w-5 h-5" />
                        ) : (
                          <Award className="w-5 h-5" />
                        )}
                      </div>

                      {/* Date Badge */}
                      <div className="mt-2.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isPast
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : isCurrent
                              ? 'bg-sky-950 text-sky-300 border-sky-500 font-extrabold'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {formatDateDisplay(item.targetDate)}
                        </span>
                      </div>

                      {/* Stage Title */}
                      <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1 group-hover:text-sky-300 transition">
                        {item.stageName}
                      </h4>

                      {/* Type Pill */}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.2 rounded border ${
                          item.type === 'EXTERNAL'
                            ? 'text-sky-400 bg-sky-950/60 border-sky-800/40'
                            : item.type === 'INTERNAL'
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                            : 'text-purple-400 bg-purple-950/60 border-purple-800/40'
                        }`}
                      >
                        {item.type.replace('_', ' ')}
                      </span>

                      {/* Days Count Tag */}
                      <span className="text-[10px] text-slate-400 mt-1 font-mono">
                        {isPast ? 'Closed' : days === 0 ? 'Today' : `${days}d away`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sequential Milestone Rows List */}
          <div className="divide-y divide-slate-800/60 pt-2">
            {filteredMilestones.map((item, idx) => {
              const days = getDaysRemaining(item.targetDate);
              const isPast = days < 0 || item.status === 'Completed';
              const isSelected = selectedMilestone?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMilestone(item)}
                  className={`p-3.5 rounded-xl transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-sky-950/30 border border-sky-500/40'
                      : 'hover:bg-slate-950/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Status indicator pill */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 ${
                        item.type === 'EXTERNAL'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : item.type === 'INTERNAL'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {item.type === 'EXTERNAL' ? (
                        <Award className="w-4 h-4" />
                      ) : item.type === 'INTERNAL' ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        <Building className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-sky-300">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.type === 'EXTERNAL'
                              ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                              : item.type === 'INTERNAL'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {item.stageName}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : item.status === 'Next Up'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                        {item.scopeSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span>Auditor: <strong className="text-slate-300">{item.leadAuditor}</strong></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-sky-400" />
                          <span>ISO Clauses: {item.isoClauses.join(', ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Action */}
                  <div className="flex items-center justify-between md:justify-end space-x-4 shrink-0 pl-11 md:pl-0">
                    <div className="text-left md:text-right">
                      <div className="text-xs font-bold text-white font-mono">
                        {formatDateDisplay(item.targetDate)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {isPast ? (
                          <span className="text-emerald-400 font-semibold">Fieldwork Closed</span>
                        ) : days === 0 ? (
                          <span className="text-amber-400 font-bold">Scheduled Today</span>
                        ) : (
                          <span>{days} days remaining</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModule(item.targetModule);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        title={`Navigate to ${item.targetModule.replace(/_/g, ' ')}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* GRID MODE: MILESTONE CARDS */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMilestones.map(item => {
            const days = getDaysRemaining(item.targetDate);
            const isPast = days < 0 || item.status === 'Completed';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMilestone(item)}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/40 transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        item.type === 'EXTERNAL'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : item.type === 'INTERNAL'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isPast
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : days <= 14
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isPast ? 'Closed' : `${days}d left`}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[11px] text-sky-400 font-medium block mt-0.5">
                      {item.stageName}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.scopeSummary}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Date</span>
                    <span className="font-mono text-[11px] font-bold text-white">
                      {formatDateDisplay(item.targetDate)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModule(item.targetModule);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 transition border border-slate-700"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3 text-sky-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / SLIDE-IN INSPECTOR FOR SELECTED AUDIT DEADLINE */}
      {/* ========================================================================= */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedMilestone(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedMilestone.type === 'EXTERNAL'
                      ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                      : selectedMilestone.type === 'INTERNAL'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  }`}
                >
                  {selectedMilestone.type.replace('_', ' ')} AUDIT MILESTONE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: {formatDateDisplay(selectedMilestone.targetDate)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {selectedMilestone.title}
              </h3>
              <p className="text-xs text-slate-300">
                Stage: <strong className="text-sky-400">{selectedMilestone.stageName}</strong>
              </p>
            </div>

            {/* Scope & Auditor Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Lead Auditor</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedMilestone.leadAuditor}</span>
                <span className="text-[11px] text-slate-400">{selectedMilestone.auditorRole}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Readiness Index</span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-lg font-extrabold text-emerald-400">{selectedMilestone.readinessPct}%</span>
                  <span className="text-[10px] text-slate-400">ISMS Controls Satisfied</span>
                </div>
              </div>
            </div>

            {/* Scope Narrative */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-1">Assessment Scope & Requirements</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedMilestone.scopeSummary}
              </p>
            </div>

            {/* Key Deliverables & Evidence Checklist */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Key Deliverables & Evidence Requirements</span>
              </h4>
              <div className="space-y-1.5">
                {selectedMilestone.keyDeliverables.map((del, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{del}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                {getDaysRemaining(selectedMilestone.targetDate) > 0
                  ? `${getDaysRemaining(selectedMilestone.targetDate)} days remaining until evaluation window`
                  : 'Milestone target window reached'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setActiveModule(selectedMilestone.targetModule);
                    setSelectedMilestone(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center space-x-1.5 transition shadow-sm"
                >
                  <span>Open Related Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
