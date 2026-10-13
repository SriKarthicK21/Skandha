import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Lock,
  ArrowRight,
  ExternalLink,
  Download,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckSquare,
  AlertOctagon,
  Users2,
  Clock
} from 'lucide-react';
import { StageGateItem, IsoWorkflowStage } from '../../types';
import { useToast } from '../common/ToastContainer';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Target
} from 'lucide-react';

export interface StageGatesReadinessVerifierProps {
  onNavigateToModule?: (moduleId: string) => void;
  onOpenAuditDossier?: () => void;
  stageId?: string;
  stageNumber?: number;
  stageData?: IsoWorkflowStage;
  compact?: boolean;
  showHeader?: boolean;
  defaultExpanded?: boolean;
}

export const StageGatesReadinessVerifier: React.FC<StageGatesReadinessVerifierProps> = ({
  onNavigateToModule,
  onOpenAuditDossier,
  stageId,
  stageNumber,
  stageData: passedStageData,
  compact = false,
  showHeader = true,
  defaultExpanded = false
}) => {
  const { currentTenant, evidence, findings, managementReviews, risks, workflowStages, advanceWorkflowStage, setActiveModule } = useGRC();
  const { showToast } = useToast();

  const [activeStage, setActiveStage] = useState<'Stage 1' | 'Stage 2'>('Stage 1');
  const [declaredReady, setDeclaredReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedDrilldownStageId, setSelectedDrilldownStageId] = useState<string | null>(null);

  // Resolve target stage if passed as prop or selected via drilldown
  const targetStage: IsoWorkflowStage | null = useMemo(() => {
    if (passedStageData) return passedStageData;
    if (stageId) return workflowStages.find(s => s.id === stageId) || null;
    if (stageNumber) return workflowStages.find(s => s.stageNumber === stageNumber) || null;
    if (selectedDrilldownStageId) return workflowStages.find(s => s.id === selectedDrilldownStageId) || null;
    return null;
  }, [passedStageData, stageId, stageNumber, selectedDrilldownStageId, workflowStages]);

  const navigateTo = onNavigateToModule || setActiveModule;

  // Derive stage-specific progress data, blockers, and gating criteria when a stage is targeted
  const stageSpecificData = useMemo(() => {
    if (!targetStage) return null;

    // 1. Upstream prerequisite stages evaluation
    const prereqStages = (targetStage.prerequisiteStageIds || [])
      .map(pId => workflowStages.find(s => s.id === pId))
      .filter((s): s is IsoWorkflowStage => Boolean(s));

    const incompletePrereqs = prereqStages.filter(p => p.status !== 'COMPLETED');
    const isPrereqsCleared = prereqStages.length === 0 || incompletePrereqs.length === 0;

    // 2. Blockers derived from stage gating logic
    const derivedBlockers: string[] = [];

    // Upstream prerequisite blockers
    if (incompletePrereqs.length > 0) {
      incompletePrereqs.forEach(p => {
        derivedBlockers.push(
          `Prerequisite Stage ${p.stageNumber} ("${p.name}") is ${p.status.toLowerCase().replace('_', ' ')} (${p.completionPct}%) and must be completed first.`
        );
      });
    }

    // Direct blockers from workflow engine
    if (targetStage.blockers && targetStage.blockers.length > 0) {
      targetStage.blockers.forEach(b => {
        if (!derivedBlockers.includes(b)) {
          derivedBlockers.push(b);
        }
      });
    }

    // Locked status gating blocker
    if (targetStage.status === 'LOCKED' && derivedBlockers.length === 0) {
      derivedBlockers.push('Stage is locked by the ISMS gating engine until upstream authorization gates are satisfied.');
    }

    // Deliverables gating blocker
    if (targetStage.completionPct < 100 && targetStage.deliverables && targetStage.deliverables.length > 0) {
      if (targetStage.status !== 'COMPLETED' && !derivedBlockers.some(b => b.toLowerCase().includes('deliverable'))) {
        const pendingCount = Math.max(1, Math.ceil((1 - targetStage.completionPct / 100) * targetStage.deliverables.length));
        derivedBlockers.push(`${pendingCount} of ${targetStage.deliverables.length} mandatory deliverables pending formal approval.`);
      }
    }

    // 3. Construct 4 Granular Stage Gates for this implementation stage
    const gates: StageGateItem[] = [
      {
        id: `GATE-S${targetStage.stageNumber}-01`,
        clauseRef: 'Upstream Gating',
        title: 'Prerequisite Stage Authorization & Gating Criteria',
        stage: targetStage.stageNumber <= 13 ? 'Stage 1' : 'Stage 2',
        description: prereqStages.length > 0
          ? `All prerequisite stages (${prereqStages.map(p => `Stage ${p.stageNumber}: ${p.name}`).join(', ')}) must be fully certified and signed off.`
          : 'Initial entry point stage. Requires foundational organization initialization and charter authorization.',
        isMandatoryPrerequisite: true,
        status: isPrereqsCleared ? 'COMPLIANT' : (targetStage.status === 'LOCKED' ? 'NOT_STARTED' : 'IN_PROGRESS'),
        evidenceRequired: prereqStages.length > 0
          ? prereqStages.map(p => `Stage ${p.stageNumber} Completion Certificate`)
          : ['Legal Entity Charter', 'Initial Management Authorization'],
        auditorVerificationCriteria: 'Auditor confirms sequential stage-gating integrity; no downstream stage may be initiated without upstream sign-off.',
        blockingReason: incompletePrereqs.length > 0
          ? `Blocked by ${incompletePrereqs.length} incomplete prerequisite stage(s): ${incompletePrereqs.map(p => `Stage ${p.stageNumber}`).join(', ')}`
          : undefined,
        spoc: 'ISMS Lead Architect'
      },
      {
        id: `GATE-S${targetStage.stageNumber}-02`,
        clauseRef: targetStage.isoClauses?.[0] || 'ISO 27001 Clause',
        title: `Mandatory Deliverables: ${targetStage.name}`,
        stage: targetStage.stageNumber <= 13 ? 'Stage 1' : 'Stage 2',
        description: `Formal authoring, review, and executive ratification of all deliverables required for Stage ${targetStage.stageNumber}.`,
        isMandatoryPrerequisite: true,
        status: targetStage.status === 'COMPLETED'
          ? 'COMPLIANT'
          : (targetStage.completionPct >= 60 ? 'IN_PROGRESS' : (targetStage.status === 'LOCKED' ? 'NOT_STARTED' : 'NON_COMPLIANT')),
        evidenceRequired: targetStage.deliverables && targetStage.deliverables.length > 0
          ? targetStage.deliverables
          : ['Approved Documentation Artifacts', 'Operational Procedures'],
        auditorVerificationCriteria: `Verification that deliverables are formally documented, version-controlled, and approved by ${targetStage.owner}.`,
        blockingReason: targetStage.completionPct < 100
          ? `Stage deliverables currently at ${targetStage.completionPct}% completion. Must reach 100% for gate clearance.`
          : undefined,
        spoc: targetStage.owner
      },
      {
        id: `GATE-S${targetStage.stageNumber}-03`,
        clauseRef: targetStage.isoClauses?.[1] || targetStage.isoClauses?.[0] || 'Annex A Controls',
        title: 'Operational Evidence & Control Verification Test',
        stage: targetStage.stageNumber <= 13 ? 'Stage 1' : 'Stage 2',
        description: `Verification that operational controls and audit evidence associated with Stage ${targetStage.stageNumber} are validated against ISO 27001 acceptance criteria.`,
        isMandatoryPrerequisite: true,
        status: targetStage.status === 'COMPLETED'
          ? 'COMPLIANT'
          : (targetStage.completedEvidenceCount > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'),
        evidenceRequired: [
          `${targetStage.completedEvidenceCount || 0} of ${targetStage.requiredEvidenceCount || 1} Evidence Artifacts Logged`,
          'Auditor Working Papers & Review Comments'
        ],
        auditorVerificationCriteria: 'Auditor tests evidentiary sample for authenticity, completeness, and tamper-resistance.',
        blockingReason: targetStage.status !== 'COMPLETED' && targetStage.blockers?.[0]
          ? targetStage.blockers[0]
          : undefined,
        spoc: 'Evidence & Assurance Lead'
      },
      {
        id: `GATE-S${targetStage.stageNumber}-04`,
        clauseRef: 'Sign-Off & Promotion',
        title: 'Designated SPOC & Lead Auditor Certification Sign-Off',
        stage: targetStage.stageNumber <= 13 ? 'Stage 1' : 'Stage 2',
        description: `Designated SPOC (${targetStage.owner}) certification that all stage requirements have been satisfied and that downstream stages may safely unlock.`,
        isMandatoryPrerequisite: false,
        status: targetStage.status === 'COMPLETED'
          ? 'COMPLIANT'
          : (targetStage.completionPct >= 90 ? 'IN_PROGRESS' : 'NOT_STARTED'),
        evidenceRequired: ['Stage Gate Sign-Off Record', 'Lead Auditor Stamp of Conformity'],
        auditorVerificationCriteria: `Designated SPOC (${targetStage.owner}) reviews complete evidence bundle and certifies stage readiness.`,
        blockingReason: targetStage.status !== 'COMPLETED'
          ? `Awaiting completion of all upstream criteria before SPOC sign-off`
          : undefined,
        spoc: targetStage.owner
      }
    ];

    const passedGatesCount = gates.filter(g => g.status === 'COMPLIANT').length;
    const isStageFullyPassed = targetStage.status === 'COMPLETED';
    const gatingTasksPercentage = gates.length > 0 ? Math.round((passedGatesCount / gates.length) * 100) : 0;

    return {
      stage: targetStage,
      prereqStages,
      incompletePrereqs,
      isPrereqsCleared,
      blockers: derivedBlockers,
      gates,
      passedGatesCount,
      totalGatesCount: gates.length,
      gatingTasksPercentage,
      isStageFullyPassed
    };
  }, [targetStage, workflowStages]);

  // Define the comprehensive Stage 1 & Stage 2 gates aligned with BSI / TÜV / PECB certification protocols
  const stageGates: StageGateItem[] = useMemo(() => [
    // STAGE 1 GATES (Documentation & Governance Prerequisites)
    {
      id: 'GATE-01',
      clauseRef: 'Clause 4.3',
      title: 'ISMS Scope & Boundaries Formally Documented',
      stage: 'Stage 1',
      description: 'The scope of the ISMS must clearly specify boundaries, applicability, interfaces, and physical/virtual locations.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['ISMS Scope Statement Document', 'Network Boundary Topology', 'Entity Interface Register'],
      auditorVerificationCriteria: 'Auditor inspects scope document to ensure no core business processes or data stores have been improperly excluded.',
      spoc: 'Chief Information Security Officer'
    },
    {
      id: 'GATE-02',
      clauseRef: 'Clause 5.2 & 5.3',
      title: 'Information Security Policy & Roles Approved by Top Management',
      stage: 'Stage 1',
      description: 'Formal Information Security Policy signed by executive management, published, and communicated to all personnel.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['Executive Signed ISMS Policy v2.0', 'Roles & Responsibilities RACI Matrix', 'Employee Acknowledgment Logs'],
      auditorVerificationCriteria: 'Signed document with timestamped executive approval and documented dissemination evidence.',
      spoc: 'ISMS Steering Committee'
    },
    {
      id: 'GATE-03',
      clauseRef: 'Clause 6.1.2 & 6.1.3',
      title: 'Risk Assessment & Treatment Methodology Executed',
      stage: 'Stage 1',
      description: 'Risk assessment criteria defined, risks identified and evaluated against Risk Appetite, and Risk Treatment Plan (RTP) produced.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['Risk Assessment Methodology', 'Risk Register with Inherent vs Residual Scores', 'Risk Treatment Plan (RTP)'],
      auditorVerificationCriteria: 'Verification that risks are linked to asset owners and that residual risk acceptance is formally documented.',
      spoc: 'Head of Risk & Governance'
    },
    {
      id: 'GATE-04',
      clauseRef: 'Clause 6.1.3 (d)',
      title: 'Statement of Applicability (SoA) Complete for All 93 Controls',
      stage: 'Stage 1',
      description: 'Every control in Annex A must have explicit inclusion or exclusion justification, implementation status, and control owner.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['Statement of Applicability (93 Controls)', 'Exclusion Justification Rationales', 'Control Implementation Evidence Links'],
      auditorVerificationCriteria: 'Zero unaddressed controls. Any excluded controls must have valid legal, regulatory, or operational justifications.',
      spoc: 'Lead Compliance Architect'
    },
    {
      id: 'GATE-05',
      clauseRef: 'Clause 9.2',
      title: 'Full Internal Audit Cycle Completed Across All Scopes',
      stage: 'Stage 1',
      description: 'At least one full cycle of internal audits completed using independent, qualified internal auditors before external audit.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['Internal Audit Annual Plan', 'Internal Audit Working Papers', 'Final Internal Audit Report with Findings'],
      auditorVerificationCriteria: 'Auditor must not audit their own work. Internal audit must cover all clauses 4–10 and applicable Annex A controls.',
      spoc: 'Internal Audit Lead'
    },
    {
      id: 'GATE-06',
      clauseRef: 'Clause 9.3',
      title: 'Management Review Meeting (MRM) Conducted with 11 Mandatory Inputs',
      stage: 'Stage 1',
      description: 'Top management review completed, formally covering all 11 mandatory inputs required by Clause 9.3.2 with signed minutes.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['MRM Agenda & Presentation Pack', 'Signed MRM Minutes & Decisions Record', 'Allocated Resource Commitments'],
      auditorVerificationCriteria: 'Auditor verifies that top management reviewed audit results, CAPAs, risk changes, and continual improvement opportunities.',
      spoc: 'Chief Executive Officer & CISO'
    },

    // STAGE 2 GATES (Implementation, Operational Effectiveness & Evidence Maturity)
    {
      id: 'GATE-07',
      clauseRef: 'Clause 7.5.3 & 9.1',
      title: 'Operational Evidence Track Record (Minimum 3 Months Operating History)',
      stage: 'Stage 2',
      description: 'Operational controls must have been actively functioning for at least 90 days with verifiable logs, tickets, and review records.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['Quarterly Access Review Tickets', 'Monthly Patching Logs', 'Firewall Rule Review Records', 'Backup Restoration Test Logs'],
      auditorVerificationCriteria: 'Auditor tests samples across a minimum 90-day historical window to ensure controls are not freshly fabricated.',
      spoc: 'Security Operations Center (SOC)'
    },
    {
      id: 'GATE-08',
      clauseRef: 'Clause 10.1 & 10.2',
      title: 'Zero Open Major Non-Conformities & CAPA Remediation Active',
      stage: 'Stage 2',
      description: 'All previous internal and surveillance audit findings must have documented Root Cause Analysis (5-Whys) and active CAPA plans.',
      isMandatoryPrerequisite: true,
      status: 'COMPLIANT',
      evidenceRequired: ['Corrective Action Logs (CAPA)', 'Root Cause Analysis Records', 'Verification of Effectiveness Tests'],
      auditorVerificationCriteria: 'Any unaddressed Major NC prevents Stage 2 recommendation. Minor NCs must have approved remediation plans.',
      spoc: 'Quality & Compliance Manager'
    },
    {
      id: 'GATE-09',
      clauseRef: 'Clause 7.2 & 7.3',
      title: 'Information Security Training & Awareness Completion (>90%)',
      stage: 'Stage 2',
      description: 'Mandatory security onboarding and annual refresher training completed with simulated phishing resilience assessments.',
      isMandatoryPrerequisite: false,
      status: 'COMPLIANT',
      evidenceRequired: ['LMS Training Completion Register', 'Phishing Simulation Report', 'Disciplinary Policy for Security Breaches'],
      auditorVerificationCriteria: 'Auditor conducts sample interviews with randomly selected employees to verify security awareness.',
      spoc: 'People & HR Operations'
    },
    {
      id: 'GATE-10',
      clauseRef: 'Annex A.5.29 & A.5.30',
      title: 'Business Continuity & Disaster Recovery Simulation Tested',
      stage: 'Stage 2',
      description: 'ICT disaster recovery failover drill or tabletop simulation conducted and reviewed within the preceding 12 months.',
      isMandatoryPrerequisite: false,
      status: 'IN_PROGRESS',
      blockingReason: 'Annual failover test scheduled for completion next week; tabletop exercise records completed.',
      evidenceRequired: ['BCP/DR Test Plan & Scenario', 'Post-Test Failover Metrics (RTO/RPO)', 'Remediation Action Items from Drill'],
      auditorVerificationCriteria: 'Auditor inspects post-incident or drill reports to verify recovery capabilities match declared RTO and RPO.',
      spoc: 'Infrastructure & DevOps Lead'
    }
  ], []);

  const currentStageGates = stageGates.filter(g => g.stage === activeStage);
  const compliantCount = currentStageGates.filter(g => g.status === 'COMPLIANT').length;
  const isStage1FullyReady = stageGates.filter(g => g.stage === 'Stage 1').every(g => g.status === 'COMPLIANT');

  const handleDeclareReady = () => {
    setDeclaredReady(true);
    showToast({ title: 'Readiness Gate Certified', message: 'Stage 1 Readiness Gate certified. Organization verified ready for external CB Stage 1 audit.', type: 'success' });
  };

  // 1. STAGE-SPECIFIC COMPACT EMBEDDED VIEW (Used within each of the implementation stages)
  if (stageSpecificData && compact) {
    const { stage, isPrereqsCleared, blockers, gates, passedGatesCount, totalGatesCount, gatingTasksPercentage, isStageFullyPassed } = stageSpecificData;

    return (
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
        {/* Stage Gate Readiness Header / Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              Stage Gate Readiness Verifier
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              isStageFullyPassed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : blockers.length > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : stage.status === 'LOCKED'
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
            }`}>
              {isStageFullyPassed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Gate Passed</span>
                </>
              ) : blockers.length > 0 ? (
                <>
                  <AlertOctagon className="w-3 h-3 text-rose-400" />
                  <span>{blockers.length} Gate Blocker{blockers.length > 1 ? 's' : ''}</span>
                </>
              ) : stage.status === 'LOCKED' ? (
                <>
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Gate Locked</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>In Progress</span>
                </>
              )}
            </span>
            <span className="text-[11px] font-mono text-slate-300 font-semibold">
              Gating Tasks: {passedGatesCount}/{totalGatesCount} ({gatingTasksPercentage}%)
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(prev => !prev);
              }}
              className="px-2 py-1 rounded text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
            >
              <span>{isExpanded ? 'Hide Gate Details' : 'Verify Gate Details'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {stage.status !== 'COMPLETED' && isPrereqsCleared && stage.completionPct >= 80 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  advanceWorkflowStage(stage.id);
                  showToast({ title: 'Stage Gate Certified', message: `Stage ${stage.stageNumber} certified and gate cleared.`, type: 'success' });
                }}
                className="px-2.5 py-1 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
              >
                <Check className="w-3 h-3" />
                <span>Certify Gate</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar for Gating Tasks within Current Stage */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <span>Gating Tasks Progress</span>
              <span className="text-[10px] text-slate-400">({passedGatesCount} of {totalGatesCount} completed)</span>
            </span>
            <span className={`font-mono text-xs font-bold ${
              gatingTasksPercentage === 100
                ? 'text-emerald-400'
                : gatingTasksPercentage >= 50
                ? 'text-sky-400'
                : 'text-amber-400'
            }`}>
              {gatingTasksPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                gatingTasksPercentage === 100
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/50'
                  : blockers.length > 0 && gatingTasksPercentage < 50
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-500'
              }`}
              style={{ width: `${gatingTasksPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Blockers Alert (Always rendered if blockers exist) */}
        {blockers.length > 0 && !isStageFullyPassed && (
          <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-400 text-[11px] uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Gating Blockers Derived from Stage Logic ({blockers.length}):</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-[11px] text-rose-200/90">
              {blockers.map((b, idx) => (
                <li key={idx} className="leading-snug">{b}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Expandable Gating Criteria Checklist & Auditor Guidance */}
        {isExpanded && (
          <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 space-y-3 mt-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800/80">
              <span className="font-semibold text-slate-300">Stage {stage.stageNumber} Gate Verification Matrix</span>
              <span>Designated SPOC: <strong className="text-slate-200">{stage.owner}</strong></span>
            </div>

            <div className="space-y-2">
              {gates.map(gate => {
                const isPassed = gate.status === 'COMPLIANT';
                return (
                  <div
                    key={gate.id}
                    className={`p-2.5 rounded-md border text-xs transition ${
                      isPassed
                        ? 'bg-slate-900/60 border-slate-800'
                        : 'bg-slate-900/90 border-amber-900/40 ring-1 ring-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">
                            {gate.clauseRef}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {gate.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {gate.description}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                        isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{gate.status}</span>
                      </span>
                    </div>

                    {gate.blockingReason && (
                      <div className="mt-2 p-1.5 rounded bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Action to Clear Gate:</strong> {gate.blockingReason}</span>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-300">Mandatory Evidence:</span>
                        <ul className="list-disc pl-3 text-slate-400 space-y-0.5 mt-0.5">
                          {gate.evidenceRequired.slice(0, 2).map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-300">Auditor Evaluation Test:</span>
                        <p className="text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {gate.auditorVerificationCriteria}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo(stage.targetModuleId);
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Open Linked Module ({stage.targetModuleId})</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                Collapse Details
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. STAGE-SPECIFIC FULL VIEW (Used in the active stage detail panel or dedicated stage view)
  if (stageSpecificData) {
    const { stage, prereqStages, incompletePrereqs, isPrereqsCleared, blockers, gates, passedGatesCount, totalGatesCount, gatingTasksPercentage, isStageFullyPassed } = stageSpecificData;

    return (
      <div className="space-y-4 rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Stage {stage.stageNumber} Readiness Verifier
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {stage.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {stage.name} Gating Verification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time audit gating engine enforcing upstream prerequisites, deliverable maturity, and operational verification before promoting stage status.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stage.status !== 'COMPLETED' && isPrereqsCleared && stage.completionPct >= 80 && (
              <button
                type="button"
                onClick={() => {
                  advanceWorkflowStage(stage.id);
                  showToast({ title: 'Stage Gate Certified', message: `Stage ${stage.stageNumber} certified and gate cleared.`, type: 'success' });
                }}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Certify & Advance Gate</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigateTo(stage.targetModuleId)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <span>Launch Module</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Progress & Gating Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gate Verification Status</span>
            <div className="flex items-center space-x-1.5">
              {isStageFullyPassed ? (
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Gate Passed
                </span>
              ) : blockers.length > 0 ? (
                <span className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  Gate Blocked
                </span>
              ) : (
                <span className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  In Progress
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">{passedGatesCount} of {totalGatesCount} Criteria Satisfied</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Gating Tasks Progress</span>
              <span className="text-xs font-mono font-bold text-sky-400">{gatingTasksPercentage}%</span>
            </div>
            <div className="text-sm font-bold text-white">{passedGatesCount} of {totalGatesCount} Gating Tasks Completed</div>
            {/* Visual progress bar calculating percentage of completed gating tasks */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  gatingTasksPercentage === 100
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/50'
                    : blockers.length > 0 && gatingTasksPercentage < 50
                    ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                    : 'bg-gradient-to-r from-sky-600 to-indigo-500'
                }`}
                style={{ width: `${gatingTasksPercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5 flex justify-between">
              <span>Deliverables: {stage.completionPct}%</span>
              <span>{isStageFullyPassed ? 'Gate Cleared' : 'Verification In-Flight'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Designated Owner / SPOC</span>
            <div className="text-xs font-bold text-slate-200 truncate">{stage.owner}</div>
            <span className="text-[11px] text-slate-400">{stage.isoClauses?.[0] || 'ISO 27001 ISMS'}</span>
          </div>
        </div>

        {/* Blockers Container */}
        {blockers.length > 0 && !isStageFullyPassed && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Active Stage Gating Blockers ({blockers.length})</span>
            </div>
            <p className="text-[11px] text-rose-200/80">
              The following prerequisite items are preventing stage completion or downstream promotion:
            </p>
            <ul className="space-y-1.5 pl-5 list-disc text-xs text-rose-200">
              {blockers.map((b, i) => (
                <li key={i} className="leading-snug">{b}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 4 Gates Verification Checklist */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 px-1 font-semibold gap-1">
            <div className="flex items-center gap-2">
              <span>Stage Gate Verification Criteria</span>
              <span className="font-mono text-[10px] font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                {gatingTasksPercentage}% Gating Tasks Passed ({passedGatesCount}/{totalGatesCount})
              </span>
            </div>
            <span>Auditor Inspection Standard: ISO 19011</span>
          </div>

          {/* Checklist header visual progress bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                gatingTasksPercentage === 100
                  ? 'bg-emerald-500'
                  : blockers.length > 0 && gatingTasksPercentage < 50
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
              style={{ width: `${gatingTasksPercentage}%` }}
            />
          </div>

          <div className="space-y-2">
            {gates.map(gate => {
              const isPassed = gate.status === 'COMPLIANT';
              return (
                <div
                  key={gate.id}
                  className={`p-3.5 rounded-xl border text-xs transition space-y-2 ${
                    isPassed
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950 border-amber-900/60 ring-1 ring-amber-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          {gate.clauseRef}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{gate.id}</span>
                        <span className="text-xs font-bold text-white">{gate.title}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{gate.description}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                      isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{gate.status}</span>
                    </span>
                  </div>

                  {gate.blockingReason && (
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-800/50 text-xs text-amber-300 flex items-start space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Action Required:</strong> {gate.blockingReason}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="font-semibold text-slate-400 block mb-1">Mandatory Evidence:</span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-0.5 text-[11px]">
                        {gate.evidenceRequired.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="sm:border-l border-slate-800/80 sm:pl-3">
                      <span className="font-semibold text-slate-400 block mb-1">Auditor Verification:</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {gate.auditorVerificationCriteria}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. GLOBAL STANDALONE VIEW (Master Stage 1 vs Stage 2 Audit Readiness Gate Verifier)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO/IEC 27001:2022 Stage Gates
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                BSI • TÜV • PECB Audit Prerequisite Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Stage 1 vs. Stage 2 Audit Readiness Gate Verifier
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Certification bodies require strict compliance with non-negotiable prerequisites before advancing from Stage 1 (Documentation & Scope Review) to Stage 2 (Implementation & Operational Fieldwork). Verify all gates to avoid premature audit failures.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isStage1FullyReady && (
              <button
                type="button"
                onClick={handleDeclareReady}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-600/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Declare Stage 1 Audit Ready</span>
              </button>
            )}
            {onOpenAuditDossier && (
              <button
                type="button"
                onClick={onOpenAuditDossier}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Auditor Pack</span>
              </button>
            )}
          </div>
        </div>

        {/* Stage 1 vs Stage 2 Toggle Pills */}
        <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveStage('Stage 1')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeStage === 'Stage 1'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Stage 1: Documentation & Governance Gates (6 Gates)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              6/6 Ready
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('Stage 2')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeStage === 'Stage 2'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Stage 2: Operational Effectiveness Gates (4 Gates)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              3/4 Passed
            </span>
          </button>
        </div>
      </div>

      {/* Stage Verdict Summary Box */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 flex-1">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-base font-bold text-white">
                {activeStage} Status: {compliantCount} of {currentStageGates.length} Verification Gates Satisfied
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {Math.round((compliantCount / currentStageGates.length) * 100)}% Gating Tasks Completed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeStage === 'Stage 1'
                ? 'All mandatory prerequisite documentation, risk methodologies, SoA boundaries, and review minutes meet certification body requirements.'
                : 'Operational controls active. One gate pending completion of annual DR simulation drill.'}
            </p>

            {/* Visual progress bar that calculates percentage of completed gating tasks */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden max-w-md border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  compliantCount === currentStageGates.length
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                    : 'bg-gradient-to-r from-sky-600 to-indigo-500'
                }`}
                style={{ width: `${Math.round((compliantCount / currentStageGates.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {declaredReady && (
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>SEALED: STAGE-1-VERIFIED-2026</span>
          </div>
        )}
      </div>

      {/* Gates Checklist Grid */}
      <div className="space-y-4">
        {currentStageGates.map((gate, index) => {
          const isPassed = gate.status === 'COMPLIANT';
          return (
            <div
              key={gate.id}
              className={`p-5 rounded-xl border transition space-y-3.5 ${
                isPassed
                  ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950 border-amber-900/60 ring-1 ring-amber-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    {gate.clauseRef}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {gate.id}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {gate.title}
                  </span>
                  {gate.isMandatoryPrerequisite && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                      Mandatory Prerequisite
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    isPassed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{gate.status}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {gate.description}
              </p>

              {gate.blockingReason && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Action Required to Clear Gate:</strong> {gate.blockingReason}
                  </div>
                </div>
              )}

              {/* Evidence & Auditor Evaluation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/70">
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mandatory Evidence Inspected:</span>
                  </span>
                  <ul className="space-y-1 pl-5 list-disc text-slate-300">
                    {gate.evidenceRequired.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Auditor Verification Test:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed pl-5">
                    {gate.auditorVerificationCriteria}
                  </p>
                  <div className="text-[11px] text-slate-400 pl-5 pt-1">
                    Designated SPOC: <strong className="text-slate-200">{gate.spoc}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
