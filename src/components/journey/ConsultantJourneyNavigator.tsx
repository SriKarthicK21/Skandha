import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Layers,
  SlidersHorizontal,
  Milestone,
  ShieldCheck,
  FolderCheck,
  CheckCircle2,
  Wrench,
  Award,
  Crown,
  Activity,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';

export interface JourneyStage {
  id: string;
  name: string;
  shortName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  completionPct: number;
  icon: React.ElementType;
  moduleId: string;
  summary: string;
  whyThisMatters: string;
  keyOutputs: string[];
  recommendedAction: string;
}

export const COMPLIANCE_JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'discover',
    name: '1. Discover',
    shortName: 'Discover',
    status: 'COMPLETED',
    completionPct: 100,
    icon: Compass,
    moduleId: 'business_discovery',
    summary: 'Identify organizational boundaries, legal entities, business functions, and digital infrastructure.',
    whyThisMatters: 'Establishes the foundation of the Information Security Management System (ISMS) without which control applicability cannot be legally proven.',
    keyOutputs: ['Corporate Entity Profile', 'Department Hierarchy', 'Business Function Directory'],
    recommendedAction: 'Verify updated subsidiary details or proceed to asset scoping.'
  },
  {
    id: 'scope',
    name: '2. Scope',
    shortName: 'Scope',
    status: 'COMPLETED',
    completionPct: 100,
    icon: Layers,
    moduleId: 'org_scope',
    summary: 'Define physical boundaries, CMDB infrastructure, data repositories, cloud boundaries, and interested parties.',
    whyThisMatters: 'ISO 27001 Clause 4.3 mandates a documented scope statement that explicitly lists boundaries and exclusions.',
    keyOutputs: ['ISO 27001 Clause 4.3 Scope Document', 'CMDB Hardware/Software Inventory', 'Interested Parties Register'],
    recommendedAction: 'Confirm cloud workload boundaries in AWS/GCP.'
  },
  {
    id: 'assess',
    name: '3. Assess',
    shortName: 'Assess',
    status: 'COMPLETED',
    completionPct: 92,
    icon: SlidersHorizontal,
    moduleId: 'gap_assessment',
    summary: 'Conduct baseline gap assessment using plain-English questions mapped to multi-framework controls.',
    whyThisMatters: 'Uncovers vulnerabilities and non-conformities before external certification auditors arrive.',
    keyOutputs: ['Cross-Framework Gap Matrix', 'Baseline Maturity Scorecard (82%)', 'Threat Vulnerability Register'],
    recommendedAction: 'Review the 7 remaining baseline questions in Annex A.8.'
  },
  {
    id: 'plan',
    name: '4. Plan',
    shortName: 'Plan',
    status: 'IN_PROGRESS',
    completionPct: 78,
    icon: Milestone,
    moduleId: 'implementation_plan',
    summary: 'Auto-generate 7-phase implementation roadmap, assign departmental owners, and schedule milestones.',
    whyThisMatters: 'Aligns executive resources and sets measurable timelines required under ISO 27001 Clause 6.2.',
    keyOutputs: ['7-Phase Implementation Roadmap', 'Resource Allocation Matrix', 'Executive Milestone Calendar'],
    recommendedAction: 'Approve Phase 3 technical control rollout target dates.'
  },
  {
    id: 'implement',
    name: '5. Implement',
    shortName: 'Implement',
    status: 'IN_PROGRESS',
    completionPct: 84,
    icon: ShieldCheck,
    moduleId: 'control_library',
    summary: 'Deploy technical controls, synthesize policies & SOPs, and configure security parameters.',
    whyThisMatters: 'Translates high-level governance requirements into operational day-to-day security safeguards.',
    keyOutputs: ['93 Annex A Control Implementations', '14 Core Security Policies', 'Signed SOPs & Runbooks'],
    recommendedAction: 'Implement MFA enforcement on all legacy staging database endpoints.'
  },
  {
    id: 'collect_evidence',
    name: '6. Collect Evidence',
    shortName: 'Evidence',
    status: 'IN_PROGRESS',
    completionPct: 76,
    icon: FolderCheck,
    moduleId: 'evidence_centre',
    summary: 'Gather objective documentary proof, screenshots, audit logs, and configurations with smart OCR inspection.',
    whyThisMatters: 'Auditors only accept objective, timestamped documentary evidence; verbal assurances are rejected.',
    keyOutputs: ['Cryptographic Evidence Vault', 'Freshness Expiry Monitors', 'Automated Verification Reports'],
    recommendedAction: 'Upload the Q3 Finance and HR User Access Review sign-off.'
  },
  {
    id: 'validate',
    name: '7. Validate',
    shortName: 'Validate',
    status: 'IN_PROGRESS',
    completionPct: 68,
    icon: CheckCircle2,
    moduleId: 'internal_audit',
    summary: 'Execute ISO 19011 statistical sampling, internal audits, and Stage Gates readiness testing.',
    whyThisMatters: 'Clause 9.2 requires comprehensive internal audit validation prior to opening your books to external auditors.',
    keyOutputs: ['ISO 19011 Audit Workpapers', 'Stage 1 vs 2 Gate Verifier Report', 'Auditor Manifest'],
    recommendedAction: 'Complete the Stage 1 Documentation Review checklist.'
  },
  {
    id: 'remediate',
    name: '8. Remediate',
    shortName: 'Remediate',
    status: 'IN_PROGRESS',
    completionPct: 70,
    icon: Wrench,
    moduleId: 'findings_capa',
    summary: 'Manage Corrective and Preventive Actions (CAPA) with 5-Whys root cause analysis and SLA tracking.',
    whyThisMatters: 'Clause 10.2 requires systematic remediation of all detected non-conformities with documented effectiveness checks.',
    keyOutputs: ['CAPA Non-Conformity Register', '5-Whys Root Cause Dossiers', 'Auditor Sign-Off Certificates'],
    recommendedAction: 'Resolve the 2 overdue remediation tasks for backup test failures.'
  },
  {
    id: 'audit_ready',
    name: '9. Audit Ready',
    shortName: 'Audit Ready',
    status: 'UPCOMING',
    completionPct: 76,
    icon: Award,
    moduleId: 'readiness_cert',
    summary: 'Compile the Unified Audit Binder, lock evidentiary baselines, and brief executive stakeholders.',
    whyThisMatters: 'Gives the Lead External Auditor frictionless access to pre-verified artifacts, expediting certification.',
    keyOutputs: ['Unified Audit Binder (1-Click ZIP)', 'CISO Executive 1-Pager', 'Auditor Inspection Portal'],
    recommendedAction: 'Simulate Stage 2 auditor interview using the Inspection Portal.'
  },
  {
    id: 'certification',
    name: '10. Certification',
    shortName: 'Certify',
    status: 'UPCOMING',
    completionPct: 40,
    icon: Crown,
    moduleId: 'global_accreditation',
    summary: 'Coordinate with accredited certification bodies (TÜV, BSI, DNV) and host Stage 2 external audit.',
    whyThisMatters: 'Achieves formal UKAS/ANAB/SAC-accredited ISO 27001:2022 & SOC 2 Type II attestation for customer trust.',
    keyOutputs: ['Accreditation Verification Record', 'External Auditor Observations', 'Formal Certificate Asset'],
    recommendedAction: 'Select accredited certification body from registry.'
  },
  {
    id: 'continuous_compliance',
    name: '11. Continuous Compliance',
    shortName: 'Continuous',
    status: 'UPCOMING',
    completionPct: 55,
    icon: Activity,
    moduleId: 'continuous_compliance',
    summary: 'Real-time telemetry monitoring, automated drift detection, BrandGuard threat defense, and annual reviews.',
    whyThisMatters: 'Compliance is a continuous operational discipline, not a once-a-year snapshot exercise.',
    keyOutputs: ['Live Connector Telemetry', 'Drift Alarms & Heartbeats', 'Annual Management Review Binder'],
    recommendedAction: 'Enable automated AWS CloudWatch and Okta telemetry connectors.'
  }
];

interface Props {
  onClose?: () => void;
  onNavigateModule?: (moduleId: string) => void;
}

export const ConsultantJourneyNavigator: React.FC<Props> = ({
  onClose,
  onNavigateModule
}) => {
  const { setActiveModule, theme } = useGRC();
  const [selectedStageId, setSelectedStageId] = useState<string>('plan');
  const isLight = theme === 'light';

  const selectedStage = COMPLIANCE_JOURNEY_STAGES.find(s => s.id === selectedStageId) || COMPLIANCE_JOURNEY_STAGES[0];

  const handleStageSelect = (stage: JourneyStage) => {
    setSelectedStageId(stage.id);
  };

  const handleGoToModule = (moduleId: string) => {
    setActiveModule(moduleId);
    if (onNavigateModule) onNavigateModule(moduleId);
    if (onClose) onClose();
  };

  const overallProgress = Math.round(
    COMPLIANCE_JOURNEY_STAGES.reduce((acc, s) => acc + s.completionPct, 0) / COMPLIANCE_JOURNEY_STAGES.length
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`p-5 rounded-2xl border ${
          isLight
            ? 'bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-blue-900 shadow-md'
            : 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
                Skanda Implementation Journey
              </span>
              <span className="text-xs text-blue-300">•</span>
              <span className="text-xs text-blue-200 font-medium">Big 4 Consultant Methodology</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              11-Stage Compliance Implementation Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl mt-1">
              From initial discovery to continuous post-certification compliance. Every step is automated, context-aware, and built for first-time non-expert implementers.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 shrink-0">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">
                Overall Progress
              </div>
              <div className="text-2xl font-black text-white">{overallProgress}%</div>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${overallProgress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">8/11</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Visual Stepper (Interactive) */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex items-center space-x-2 min-w-[960px]">
          {COMPLIANCE_JOURNEY_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = stage.id === selectedStageId;
            const isCompleted = stage.status === 'COMPLETED';
            const isInProgress = stage.status === 'IN_PROGRESS';

            return (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  onClick={() => handleStageSelect(stage)}
                  className={`flex-1 min-w-[90px] p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? isLight
                        ? 'bg-blue-50 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-blue-950/60 border-blue-500 shadow-lg ring-2 ring-blue-500/30'
                      : isCompleted
                      ? isLight
                        ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 text-slate-700'
                        : 'bg-emerald-950/20 border-emerald-900/60 hover:bg-emerald-950/40 text-slate-300'
                      : isInProgress
                      ? isLight
                        ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50 text-slate-700'
                        : 'bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/40 text-slate-300'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isInProgress
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className="text-[10px] font-bold font-mono">
                      {stage.completionPct}%
                    </span>
                  </div>

                  <div className="text-xs font-bold truncate text-[#0F172A] dark:text-white">
                    {stage.shortName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {stage.status.replace('_', ' ')}
                  </div>
                </button>

                {idx < COMPLIANCE_JOURNEY_STAGES.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail & Consultant Guidance Card */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-800'
            : 'bg-slate-900/90 border-slate-800 shadow-xl text-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                {React.createElement(selectedStage.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedStage.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : selectedStage.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {selectedStage.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {selectedStage.completionPct}% Complete
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mt-0.5">
                  {selectedStage.name}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedStage.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-900/40'
                }`}
              >
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Why This Matters to Auditors</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedStage.whyThisMatters}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/20 border-blue-900/40'
                }`}
              >
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Key Deliverables & Outputs</span>
                </div>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  {selectedStage.keyOutputs.map((out, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Callout Box */}
          <div
            className={`w-full lg:w-80 p-4 rounded-xl border flex flex-col justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
            }`}
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Consultant Recommended Action
              </div>
              <p className="text-xs font-semibold text-[#0F172A] dark:text-white leading-relaxed mb-4">
                {selectedStage.recommendedAction}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleGoToModule(selectedStage.moduleId)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <span>Open {selectedStage.shortName} Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
