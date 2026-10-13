import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
  Zap,
  Bot
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';

interface GuidanceConfig {
  stage: string;
  stageBadge: string;
  completed: string;
  inProgress: string;
  nextStep: string;
  whyThisMatters: string;
  whatSkandaNeeds: string;
  expectedOutput: string;
  primaryActionLabel: string;
  primaryActionModule: string;
}

const MODULE_GUIDANCE_MAP: Record<string, GuidanceConfig> = {
  command_center: {
    stage: 'Executive Command Center',
    stageBadge: 'Stage 9 of 11 • Continuous Compliance',
    completed: 'Legal registration, scope definition, baseline gap assessment, and 93 Annex A control mappings.',
    inProgress: 'Active monitoring of 6 high-risk remediation actions and quarterly evidence freshness renewals.',
    nextStep: 'Upload Finance Quarterly Access Review and approve the 3 pending CAPA remediation items.',
    whyThisMatters: 'Lead auditors prioritize access reviews and documented CAPA closures; missing these is the #1 cause of Stage 2 audit findings.',
    whatSkandaNeeds: 'Signed PDF/CSV export of quarterly IAM user access review and vendor SOC 2 assessment.',
    expectedOutput: 'Cryptographically hashed evidence record linked across ISO 27001:2022 A.5.15, SOC 2 CC6.1, and MAS TRM 8.1.',
    primaryActionLabel: 'Review Pending Evidence',
    primaryActionModule: 'evidence_centre'
  },
  onboarding_survey: {
    stage: 'Guided Onboarding & Registration',
    stageBadge: 'Stage 1 of 11 • Foundation & Scope',
    completed: 'Account creation and multi-tenant environment provisioning.',
    inProgress: 'Collecting essential organization profile, technology stack, and regulatory framework targets.',
    nextStep: 'Confirm your legal profile and select your target compliance frameworks to unlock automated policies.',
    whyThisMatters: 'Your organization profile automatically calibrates control applicability, risk scoring, and mandatory statutory notices.',
    whatSkandaNeeds: 'Basic company details, cloud hosting providers, and data sensitivity classifications.',
    expectedOutput: 'Automated Statement of Applicability (SoA) and personalized 7-phase compliance implementation roadmap.',
    primaryActionLabel: 'Continue Setup',
    primaryActionModule: 'onboarding_survey'
  },
  control_library: {
    stage: 'Unified Control Architecture',
    stageBadge: 'Stage 5 of 11 • Implementation',
    completed: 'Baseline control requirements extracted and mapped across ISO 27001, SOC 2, and MAS TRM.',
    inProgress: 'Assigning control owners and establishing operational test procedures.',
    nextStep: 'Assign owners to the 4 unassigned critical security controls in Section A.8 (Technological Controls).',
    whyThisMatters: 'Every control requires a named departmental owner to maintain audit accountability and prevent policy drift.',
    whatSkandaNeeds: 'Assign department leads (IT Ops, DevOps, HR, Legal) to respective security controls.',
    expectedOutput: 'Role-based control matrix with automatic reminder workflows and evidence collection schedules.',
    primaryActionLabel: 'Assign Control Owners',
    primaryActionModule: 'tasks'
  },
  evidence_centre: {
    stage: 'Smart Evidence Repository',
    stageBadge: 'Stage 6 of 11 • Evidence Collection',
    completed: 'Evidence collection schedules initialized and linked to 93 security controls.',
    inProgress: 'Validating recent uploads against ISO 27001:2022 and MAS TRM audit criteria.',
    nextStep: 'Upload quarterly user access review report for production AWS & GCP cloud environments.',
    whyThisMatters: 'Auditors require objective documentary proof that access reviews occurred within the prescribed 90-day window.',
    whatSkandaNeeds: 'Manager-approved PDF/spreadsheet access review export covering privileged and IAM accounts.',
    expectedOutput: 'Automated document extraction, OCR validation, expiry timer, and SHA-256 tamper-evident hash.',
    primaryActionLabel: 'Upload New Evidence',
    primaryActionModule: 'evidence_upload'
  },
  risk_assessment: {
    stage: 'Enterprise Risk Management',
    stageBadge: 'Stage 3 of 11 • Risk Assessment',
    completed: 'Initial risk register established with 18 threat vectors identified.',
    inProgress: 'Quantifying inherent vs residual risk scores based on control effectiveness.',
    nextStep: 'Review and sign off on 3 high-residual risks exceeding the Board risk appetite threshold.',
    whyThisMatters: 'ISO 27001 Clause 6.1.2 mandates formal risk treatment decisions (Mitigate, Transfer, Avoid, Accept) by executive leadership.',
    whatSkandaNeeds: 'Select treatment strategy (Risk Treatment Plan) and designate target completion dates.',
    expectedOutput: 'ISO 27001:2022 compliant Risk Treatment Plan (RTP) and dynamic D3 Risk Heatmap.',
    primaryActionLabel: 'Review High Risks',
    primaryActionModule: 'risk_map'
  },
  policies: {
    stage: 'Auditor-Grade Policy Studio',
    stageBadge: 'Stage 4 of 11 • Governance & Policies',
    completed: '14 Core ISMS & Security policies synthesized using tenant metadata.',
    inProgress: 'Annual policy review and management approval cycle.',
    nextStep: 'Digitally approve the Access Control Policy (POL-01) and Information Security Policy (POL-02).',
    whyThisMatters: 'ISO 27001 Clause 5.2 requires documented evidence that top management approved all information security policies.',
    whatSkandaNeeds: 'Review generated policy text and click "Approve & Apply Digital Signature".',
    expectedOutput: 'Timestamped policy version with cryptographic signature stamp and employee distribution link.',
    primaryActionLabel: 'Approve Policies',
    primaryActionModule: 'policies'
  },
  internal_audit: {
    stage: 'Internal Audit & Assurance',
    stageBadge: 'Stage 7 of 11 • Validation',
    completed: 'Internal audit schedule and ISO 19011 sampling methodology established.',
    inProgress: 'Executing Stage 1 documentation review and interviewing process owners.',
    nextStep: 'Finalize the Stage 1 audit checklist and log any non-conformities into the CAPA workbench.',
    whyThisMatters: 'Clause 9.2 mandates at least one comprehensive internal audit prior to the external certification audit.',
    whatSkandaNeeds: 'Record audit test observations and upload auditor sampling workpapers.',
    expectedOutput: 'Formal Internal Audit Report ready for presentation to the Management Review meeting.',
    primaryActionLabel: 'Open Audit Portal',
    primaryActionModule: 'internal_audit'
  }
};

const DEFAULT_GUIDANCE: GuidanceConfig = {
  stage: 'Consultant-Guided Compliance',
  stageBadge: 'Skanda Intelligent Assistant',
  completed: 'Core tenant configurations and compliance framework crosswalk initialized.',
  inProgress: 'Executing active compliance roadmap milestones according to your industry profile.',
  nextStep: 'Follow the recommended action below or consult the Skanda AI Copilot for tailored assistance.',
  whyThisMatters: 'Consistent incremental progress reduces audit preparation time by up to 70% and prevents last-minute stress.',
  whatSkandaNeeds: 'Complete pending tasks, verify evidence uploads, and address high-priority gaps.',
  expectedOutput: 'Real-time audit readiness score progression and verified compliance documentation.',
  primaryActionLabel: 'View Implementation Journey',
  primaryActionModule: 'implementation_journey'
};

interface Props {
  onOpenJourneyModal?: () => void;
  onOpenAiCopilot?: (initialPrompt?: string) => void;
}

export const ConsultantGuidanceBar: React.FC<Props> = ({
  onOpenJourneyModal,
  onOpenAiCopilot
}) => {
  const { activeModule, setActiveModule, theme } = useGRC();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const isLight = theme === 'light';

  const guidance = MODULE_GUIDANCE_MAP[activeModule] || DEFAULT_GUIDANCE;

  return (
    <div
      className={`w-full border-b transition-colors ${
        isLight
          ? 'bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border-blue-200/80 text-slate-800'
          : 'bg-gradient-to-r from-[#0F2747]/90 via-[#132E52]/80 to-[#0A1A30]/90 border-blue-900/60 text-slate-200'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-1.5">
        {/* Top Summary Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs shrink-0 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 flex-wrap min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-300/40 dark:border-blue-700/40 shrink-0">
                Skanda Consultant Guide
              </span>
              <span className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                {guidance.stage}
              </span>
              <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
                • {guidance.stageBadge}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenJourneyModal && (
              <button
                type="button"
                onClick={onOpenJourneyModal}
                className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer bg-white/80 hover:bg-white text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-2xs"
                title="View full 11-stage compliance implementation journey"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Full Journey</span>
              </button>
            )}

            {onOpenAiCopilot && (
              <button
                type="button"
                onClick={() => onOpenAiCopilot(`Explain what I should do next on the ${guidance.stage} step.`)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-2xs"
                title="Ask Skanda AI Copilot about this step"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Ask Consultant</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition cursor-pointer"
              title={isExpanded ? 'Collapse guidance' : 'Expand full consultant guidance'}
              aria-label={isExpanded ? 'Collapse guidance' : 'Expand full consultant guidance'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable 7-Part Consultant Blueprint */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden pt-2.5 pb-1"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. COMPLETED & IN PROGRESS */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-white/90 border-slate-200 text-slate-700 shadow-2xs'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="uppercase text-[10px] tracking-wider">Completed</span>
                  </div>
                  <p className="text-[11px] leading-relaxed line-clamp-2">
                    {guidance.completed}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="uppercase text-[10px] tracking-wider">In Progress</span>
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-2">
                      {guidance.inProgress}
                    </p>
                  </div>
                </div>

                {/* 2. NEXT STEP (THE PRIMARY ACTION) */}
                <div
                  className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                    isLight
                      ? 'bg-blue-50/90 border-blue-300 text-slate-900 shadow-2xs'
                      : 'bg-blue-950/40 border-blue-800 text-blue-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-400 font-bold mb-1">
                      <Zap className="w-3.5 h-3.5 fill-blue-600/30" />
                      <span className="uppercase text-[10px] tracking-wider">Next Step</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed">
                      {guidance.nextStep}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModule(guidance.primaryActionModule)}
                      className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                    >
                      <span>{guidance.primaryActionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. WHY THIS MATTERS */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-white/90 border-slate-200 text-slate-700 shadow-2xs'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="uppercase text-[10px] tracking-wider">Why This Matters</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {guidance.whyThisMatters}
                  </p>
                </div>

                {/* 4. WHAT SKANDA NEEDS & EXPECTED OUTPUT */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-white/90 border-slate-200 text-slate-700 shadow-2xs'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span className="uppercase text-[10px] tracking-wider">What Skanda Needs</span>
                  </div>
                  <p className="text-[11px] leading-relaxed line-clamp-2">
                    {guidance.whatSkandaNeeds}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="uppercase text-[10px] tracking-wider">Expected Output</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {guidance.expectedOutput}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
