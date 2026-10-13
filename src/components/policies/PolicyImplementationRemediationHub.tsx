import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Terminal,
  GitBranch,
  KeyRound,
  Users,
  Server,
  FileText,
  RefreshCw,
  Sliders,
  Download,
  ExternalLink,
  FileCheck,
  ArrowRight,
  HelpCircle,
  Activity,
  Check,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  Zap,
  ListChecks,
  Printer,
  FileCode,
  Layers,
  Building2,
  AlertCircle,
  Tag,
  GitCompare
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';
import { ContextualizedPolicyStudio } from './ContextualizedPolicyStudio';
import { PolicyAsCodeDriftCenter } from './PolicyAsCodeDriftCenter';
import { Iso27001AttributeSoASync } from './Iso27001AttributeSoASync';
import { CohortAttestationDiffHub } from './CohortAttestationDiffHub';
import { Clause52And75AuditEvidenceHub } from './Clause52And75AuditEvidenceHub';
import { PolicyWaiverRegisterHub } from './PolicyWaiverRegisterHub';

interface SOPCardConfig {
  id: string;
  code: string;
  title: string;
  isoClause: string;
  annexA: string;
  owner: string;
  department: string;
  cadence: string;
  shelfwareRisk: string;
  technicalGuardrail: string;
  guardrailTool: string;
  guardrailEnabled: boolean;
  guardrailActionLabel: string;
  ruleExcerpt: string[];
  runbookSteps: string[];
  evidenceArtifact: string;
}

export const PolicyImplementationRemediationHub: React.FC = () => {
  const {
    currentTenant,
    departmentScopes,
    updateDepartmentPolicyRequirement,
    updateDepartmentScope,
    documentAcknowledgments,
    addFinding,
    findings,
    logAuditEvent,
    currentUser,
    currentRole,
    setActiveModule,
    theme
  } = useGRC();

  // Selected sub-tab across the 6 ISO policy operationalization pillars
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'contextualized' | 'policy_as_code' | 'iso_attributes' | 'sop_workbenches' | 'cohort_attestation' | 'clause_audit' | 'waivers' | 'auditor_sampling'
  >('overview');

  // Interactive Guardrails state
  const [guardrailStates, setGuardrailStates] = useState<Record<string, boolean>>({
    'sop_jml': true,
    'sop_change': true,
    'sop_access': false,
    'sop_patch': true,
    'sop_dr': false,
    'sop_vendor': true
  });

  // Expanded SOP card details
  const [expandedSOP, setExpandedSOP] = useState<string | null>('sop_jml');

  // Auto-Remediate batch state
  const [isRemediating, setIsRemediating] = useState(false);
  const [remediationSuccessMsg, setRemediationSuccessMsg] = useState<string | null>(null);

  // Auditor Dry-Run Simulation states
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [sampleFindingsLogged, setSampleFindingsLogged] = useState<Record<string, boolean>>({});

  // 1. Calculate Real-Time Implementation Metrics
  const inScopeDepts = useMemo(() => {
    return departmentScopes.filter(d => d.isInScope);
  }, [departmentScopes]);

  const stats = useMemo(() => {
    let totalReqs = 0;
    let compliantReqs = 0;
    let gapReqs = 0;
    let inReviewReqs = 0;

    inScopeDepts.forEach(d => {
      (d.policyRequirements || []).forEach(r => {
        totalReqs++;
        if (r.status === 'Compliant & Approved') compliantReqs++;
        else if (r.status === 'Gap - Required') gapReqs++;
        else if (r.status === 'In Review') inReviewReqs++;
      });
    });

    const tenantAcks = documentAcknowledgments.filter(a => a.tenantId === currentTenant?.id);
    const totalDocs = currentTenant?.generatedDocs?.length || 1;
    const docAckRate = Math.min(100, Math.round((tenantAcks.length / (totalDocs * Math.max(1, inScopeDepts.length * 2))) * 100));

    const totalGuardrails = Object.keys(guardrailStates).length;
    const activeGuardrails = Object.values(guardrailStates).filter(Boolean).length;
    const guardrailRate = Math.round((activeGuardrails / totalGuardrails) * 100);

    const overallImplementationScore = Math.round(
      ((totalReqs > 0 ? (compliantReqs / totalReqs) * 100 : 80) * 0.4) +
      (guardrailRate * 0.35) +
      (Math.max(docAckRate, 65) * 0.25)
    );

    return {
      totalReqs,
      compliantReqs,
      gapReqs,
      inReviewReqs,
      guardrailRate,
      activeGuardrails,
      totalGuardrails,
      overallImplementationScore,
      tenantAcksCount: tenantAcks.length
    };
  }, [inScopeDepts, documentAcknowledgments, currentTenant, guardrailStates]);

  // The 6 Core Operational SOP Workbenches
  const coreSOPs: SOPCardConfig[] = [
    {
      id: 'sop_jml',
      code: 'SOP-ISMS-01',
      title: 'Joiner, Mover & Leaver (JML) Deprovisioning SOP',
      isoClause: 'Clause 7.2 (Competence) / 7.3 (Awareness)',
      annexA: 'A.6.5 (Responsibilities after termination) & A.5.15 (Access control)',
      owner: 'Liam Hughes (IT Ops Lead) & HR Governance',
      department: 'IT & Infrastructure / HR',
      cadence: 'Event-driven (within 24h of HR status change)',
      shelfwareRisk: 'Manual Slack notification leads to lingering GitHub / AWS access for terminated contractors.',
      technicalGuardrail: 'Webhook from HRMS triggers automatic Okta SSO account suspension and Jamf MDM remote lock at 5:00 PM on last working day.',
      guardrailTool: 'Okta / Google Workspace IdP Webhook + Jamf Pro MDM',
      guardrailEnabled: guardrailStates['sop_jml'] ?? true,
      guardrailActionLabel: 'IdP Automated Deprovisioning Webhook',
      ruleExcerpt: [
        'HR must log termination ticket >= 5 business days prior to voluntary departures.',
        'Immediate involuntary termination requires instant CISO/IT emergency Slack dispatch.',
        'All active session tokens (JWT), SSH public keys, and GitHub org memberships must be invalidated within 24h.',
        'Hardware assets must be remotely wiped if not handed over to office facilities on final day.'
      ],
      runbookSteps: [
        'Step 1: HR Jira ticket #LEAVER triggers Okta workflow webhook.',
        'Step 2: Okta terminates active OAuth2 refresh tokens and disables user account.',
        'Step 3: Automated script revokes AWS IAM temporary credentials and GitHub Enterprise team access.',
        'Step 4: Jamf Pro initiates cryptographic lock on employee MacBook.',
        'Step 5: Timestamped completion report auto-attached to Evidence Centre under #A.6.5.'
      ],
      evidenceArtifact: 'Automated IdP Deprovisioning Log + MDM Device Recovery Receipt'
    },
    {
      id: 'sop_change',
      code: 'SOP-ISMS-02',
      title: 'Secure Software Development & Change Governance SOP',
      isoClause: 'Clause 8.1 (Operational planning & control)',
      annexA: 'A.8.32 (Change management) & A.8.28 (Secure coding)',
      owner: 'Priya Sharma (Cloud DevOps Lead)',
      department: 'Software Engineering & DevOps',
      cadence: 'Continuous (every pull request to main / production)',
      shelfwareRisk: 'Engineers bypass peer reviews for urgent production fixes using admin rights, leaving zero review record.',
      technicalGuardrail: 'GitHub repository branch protection enforces 2 mandatory peer approvals, CodeOwner sign-off, and passing Snyk/SonarQube CI checks. Force pushes permanently disabled.',
      guardrailTool: 'GitHub Enterprise Branch Protection + Snyk Container CI',
      guardrailEnabled: guardrailStates['sop_change'] ?? true,
      guardrailActionLabel: 'GitHub Branch Protection & CI SAST Gate',
      ruleExcerpt: [
        'Direct commits to main/master/production branches are strictly prohibited.',
        'All changes require a linked Jira ticket with documented rollback instructions.',
        'At least 2 senior engineers must approve the pull request after inspecting security diffs.',
        'Emergency hotfixes require retroactive Change Advisory Board (CAB) review within 48h.'
      ],
      runbookSteps: [
        'Step 1: Developer creates feature branch off main linked to ticket ID (e.g., FIX-1042).',
        'Step 2: Pull Request created; GitHub Actions triggers Trivy container scan & ESLint security linter.',
        'Step 3: Two designated CodeOwners review diff and submit formal approval.',
        'Step 4: Automated CI/CD pipeline deploys build to staging; automated smoke tests run.',
        'Step 5: Tagged deployment hash logged to Evidence Centre under #A.8.32.'
      ],
      evidenceArtifact: 'GitHub PR Approval Records + CI/CD Automated Test & Scan Manifests'
    },
    {
      id: 'sop_access',
      code: 'SOP-ISMS-03',
      title: 'Quarterly Privileged Access Review & Recertification SOP',
      isoClause: 'Clause 9.1 (Monitoring, measurement, analysis & evaluation)',
      annexA: 'A.5.15 (Access control) & A.5.18 (Access rights)',
      owner: 'SriKarthiK (CISO) & Antonio Silva (SecOps)',
      department: 'Cyber Security & SecOps',
      cadence: 'Quarterly (First week of Jan, Apr, Jul, Oct)',
      shelfwareRisk: 'Access reviews are done haphazardly over Slack with thumbs-up reactions, leaving no auditable sign-off evidence.',
      technicalGuardrail: 'Automated script exports active AWS IAM, production database, and Okta admin lists on the 1st of each quarter and generates Jira subtasks with digital signature requirements.',
      guardrailTool: 'AWS IAM Identity Center + Jira Automation Recertification Engine',
      guardrailEnabled: guardrailStates['sop_access'] ?? false,
      guardrailActionLabel: 'Quarterly Automated Recertification Cron',
      ruleExcerpt: [
        'All root/administrator accounts on AWS, GCP, and Snowflake must be reviewed every 90 days.',
        'Department heads have 10 business days to re-certify or revoke access for their staff.',
        'Unconfirmed accounts at day 11 are automatically downgraded to read-only.',
        'The CISO must sign off on the consolidated access review ledger at the end of the quarter.'
      ],
      runbookSteps: [
        'Step 1: On day 1 of the quarter, automated cron exports user privilege matrices to S3.',
        'Step 2: Jira tickets dispatched to each department manager with filtered user roster.',
        'Step 3: Managers check "Maintain" or "Revoke" with justification for each employee.',
        'Step 4: IT executes revoking requests within 2 business days.',
        'Step 5: Consolidated digital sign-off report saved to Skanda GRC Evidence Centre under #A.5.18.'
      ],
      evidenceArtifact: 'Signed Access Review Matrix + Ticket Deprovisioning Audit Trail'
    },
    {
      id: 'sop_patch',
      code: 'SOP-ISMS-04',
      title: 'Vulnerability Remediation & Patch Governance SOP',
      isoClause: 'Clause 8.1 / 9.1 (Evaluation)',
      annexA: 'A.8.8 (Management of technical vulnerabilities)',
      owner: 'Marcus Vance (SecOps Engineer)',
      department: 'Cyber Security & SecOps',
      cadence: 'Weekly automated scanning + continuous SLA tracking',
      shelfwareRisk: 'CVE alerts sit in Jira backlogs for months because engineering treats security tickets as low priority.',
      technicalGuardrail: 'Snyk and AWS Inspector automated webhooks auto-create PagerDuty/Jira tickets with strict countdown SLAs: Critical (CVSS >= 9.0) in 72h, High in 14 days, Medium in 30 days.',
      guardrailTool: 'Snyk Container Vulnerability Scanner + Jira SLA Escalation',
      guardrailEnabled: guardrailStates['sop_patch'] ?? true,
      guardrailActionLabel: 'Automated Snyk CVE Escalation Webhooks',
      ruleExcerpt: [
        'Critical zero-day exploits (e.g. Log4j) require emergency sprint freeze and 24h triage.',
        'High-severity dependencies must be patched in the next weekly maintenance release.',
        'Any vulnerability that cannot be resolved within SLA requires a formal Security Exception Form approved by CISO.',
        'Compensating controls (e.g. WAF rules, IP whitelisting) must be documented for exceptions.'
      ],
      runbookSteps: [
        'Step 1: Daily automated scanner detects CVE in base container image.',
        'Step 2: Scanner auto-files Jira ticket with CVSS score, exploitability vector, and remediation commit.',
        'Step 3: Engineering lead assigned; countdown timer begins.',
        'Step 4: Patch deployed to staging and verified with re-scan.',
        'Step 5: Closed ticket with Snyk zero-vulnerability attestation pushed to Evidence Centre.'
      ],
      evidenceArtifact: 'Snyk SLA Compliance Dashboard + Vulnerability Exception Register'
    },
    {
      id: 'sop_dr',
      code: 'SOP-ISMS-05',
      title: 'Disaster Recovery Tabletop Simulation & Backup Verification SOP',
      isoClause: 'Clause 8.1 / Clause 8.2 (Information security risk assessment)',
      annexA: 'A.5.29 / A.5.30 (ICT readiness for business continuity)',
      owner: 'Liam Hughes (IT Director) & Priya Sharma',
      department: 'IT & Infrastructure',
      cadence: 'Monthly automated restore verification + Semi-annual tabletop drill',
      shelfwareRisk: 'Backups are configured, but nobody has ever restored one to verify that production can actually recover within RTO/RPO.',
      technicalGuardrail: 'Automated monthly AWS RDS snapshot restore into an isolated sandbox VPC, validating checksums and data integrity without human intervention.',
      guardrailTool: 'AWS Backup / RDS Automated Restore Sandbox Engine',
      guardrailEnabled: guardrailStates['sop_dr'] ?? false,
      guardrailActionLabel: 'Automated RDS Snapshot Restore Verification',
      ruleExcerpt: [
        'Recovery Time Objective (RTO) for core banking services is <= 4 hours.',
        'Recovery Point Objective (RPO) is <= 15 minutes of database transaction logs.',
        'Automated database snapshots must be taken every 6 hours and replicated cross-region.',
        'At least once every 6 months, the incident team must run a simulated total-region failure drill.'
      ],
      runbookSteps: [
        'Step 1: 1st Sunday of each month, AWS Lambda initiates automated restore of latest production RDS snapshot.',
        'Step 2: Test script executes read/write query integrity checks against restored sandbox instance.',
        'Step 3: Restore duration (measured RTO) and timestamp variance (measured RPO) calculated.',
        'Step 4: Sandbox instance destroyed to eliminate idle cloud costs.',
        'Step 5: Pass/fail automated report archived in Evidence Centre under #A.5.30.'
      ],
      evidenceArtifact: 'Automated Snapshot Restoration Log + Annual Tabletop Post-Mortem Minutes'
    },
    {
      id: 'sop_vendor',
      code: 'SOP-ISMS-06',
      title: 'Third-Party & Cloud Vendor Due Diligence SOP',
      isoClause: 'Clause 8.1 (Operational planning)',
      annexA: 'A.5.19 / A.5.21 (Information security in supplier relationships)',
      owner: 'Elena Rostova (Compliance Counsel) & Procurement',
      department: 'Procurement & Legal',
      cadence: 'Pre-contract onboarding + Annual re-assessment for Tier 1 vendors',
      shelfwareRisk: 'Departments swipe corporate credit cards for shadow SaaS tools without privacy, DPA, or SOC 2 verification.',
      technicalGuardrail: 'Finance ERP gate: Invoicing blocked for any software vendor that has not completed the digital Skanda GRC Vendor Security Assessment questionnaire.',
      guardrailTool: 'Procurement Invoicing Gate + Vendor Assessment Portal',
      guardrailEnabled: guardrailStates['sop_vendor'] ?? true,
      guardrailActionLabel: 'Procurement Vendor Security Invoicing Gate',
      ruleExcerpt: [
        'Any vendor storing or processing Customer or Confidential data is classified as Tier 1 (Critical).',
        'Tier 1 vendors must provide an active SOC 2 Type II report or ISO/IEC 27001 certificate (<12 months old).',
        'Data Processing Addendum (DPA) with standard contractual clauses (SCCs) mandatory before go-live.',
        'Sub-processor notifications must be reviewed within 30 days of receipt.'
      ],
      runbookSteps: [
        'Step 1: Department lead requests new software vendor in procurement portal.',
        'Step 2: Automated link sent to vendor to upload SOC 2 Type II, penetration test summary, and DPA.',
        'Step 3: Compliance team reviews vendor security score and flags residual risks.',
        'Step 4: Approved vendor registered in Skanda GRC Vendor Module with 12-month expiry alert.',
        'Step 5: Signed DPA and audit report saved to Evidence Centre under #A.5.19.'
      ],
      evidenceArtifact: 'Vendor Security Assessment Matrix + Signed DPA + SOC 2 Type II Summary'
    }
  ];

  // Toggle single guardrail
  const handleToggleGuardrail = (id: string) => {
    const newState = !guardrailStates[id];
    setGuardrailStates(prev => ({ ...prev, [id]: newState }));
    logAuditEvent('UPDATE', 'Policy Guardrail Control', `Toggled ${id} guardrail enforcement to ${newState ? 'ACTIVE' : 'DISABLED'}`);
  };

  // Lead Implementer 1-Click Auto-Remediation
  const handleRunFullRemediation = () => {
    setIsRemediating(true);
    setRemediationSuccessMsg(null);

    setTimeout(() => {
      // 1. Enable all technical guardrails
      const allEnabled: Record<string, boolean> = {};
      coreSOPs.forEach(s => {
        allEnabled[s.id] = true;
      });
      setGuardrailStates(allEnabled);

      // 2. Loop through in-scope departments and mark all policy requirements as 'Compliant & Approved' with implementation notes
      inScopeDepts.forEach(dept => {
        (dept.policyRequirements || []).forEach(req => {
          if (req.status !== 'Compliant & Approved') {
            updateDepartmentPolicyRequirement(dept.id, req.id, {
              status: 'Compliant & Approved',
              assignedOwner: req.assignedOwner || dept.leadOwner,
              version: '2.0',
              lastAuditDate: '2026-09-01',
              nextReviewDate: '2027-09-01',
              implementationNotes: `Operationalized via Chief Implementer Sprint: Automated guardrails bound to ${dept.name} CI/CD and IdP pipelines.`
            });
          }
        });

        // Boost readiness score & maturity level
        updateDepartmentScope(dept.id, {
          readinessScore: Math.min(100, Math.max(92, (dept.readinessScore || 75) + 12)),
          maturityLevel: Math.max(4, dept.maturityLevel || 3)
        });
      });

      // 3. Log Audit Trail
      logAuditEvent(
        'UPDATE',
        'Chief ISO Implementer Remediation Engine',
        `Successfully executed enterprise policy operationalization sprint: Standardized 6 technical SOP runbooks, activated all software guardrails, and upgraded ${stats.gapReqs + stats.inReviewReqs} department policy requirements to Approved status.`
      );

      setIsRemediating(false);
      setRemediationSuccessMsg(
        `Full ISO 27001 Implementation Remediation Complete! All 6 technical guardrails are now ACTIVE, ${stats.gapReqs} policy gaps resolved, and department SOP runbooks operationalized for Stage 2 audit readiness.`
      );
    }, 1200);
  };

  // Lead Auditor "Red Team" Sampling Test Runner
  const handleRunAuditorSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setSimulationRunning(false);
      setSimulationCompleted(true);
      logAuditEvent('ACCESS', 'Lead Auditor Dry-Run', 'Completed 3-point pre-audit sampling dry-run on Awareness, Leaver timing, and PR branch protections.');
    }, 1500);
  };

  // Log a Simulated Gap as an Official Internal CAPA Finding (Proving Clause 10.1 maturity)
  const handleLogSampleCAPA = (findingKey: string, title: string, clause: string, dept: string, desc: string, rootCause: string, corrective: string) => {
    addFinding({
      severity: 'Minor Non-Conformity',
      source: 'INTERNAL_AUDIT',
      title,
      clauseOrControl: clause,
      department: dept,
      description: desc,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          'Why did this occur? -> Process was historically reliant on manual human memory.',
          'Why was it reliant on memory? -> No automated webhook or CI gate was configured.',
          'Why was no webhook configured? -> Priority was given to product delivery over GRC integration.',
          'Why was delivery prioritized? -> Cross-functional GRC alignment was informal.',
          'Root Cause Statement: ' + rootCause
        ],
        rootCauseStatement: rootCause
      },
      capaPlan: {
        correctiveAction: corrective,
        preventiveAction: 'Enforce technical guardrails in Skanda GRC Implementation Hub and review during quarterly ISMS steering committee.',
        owner: `${currentUser.name} (Lead Implementer)`,
        targetDate: '2026-10-15',
        evidenceRequired: 'Automated system log extract verifying zero unauthorized bypasses.'
      },
      implementationNotes: 'Logged proactively during pre-audit self-inspection to demonstrate Clause 10.1 self-correction to external certification body.',
      status: 'CAPA Submitted'
    });

    setSampleFindingsLogged(prev => ({ ...prev, [findingKey]: true }));
    logAuditEvent('CREATE', 'Findings & CAPA', `Proactively logged internal finding "${title}" to satisfy ISO 27001 Clause 10.1`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner: Chief ISO Implementer & Lead Auditor Mission */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0C152B] via-[#0F1E3D] to-[#16274E] border border-indigo-500/30 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 px-3 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Chief ISO Implementer & Auditor Remediation Engine</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">ISMS Scope / Operationalization Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Bridge the Policy-to-Procedure Implementation Gap
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Eliminate "shelfware" policies. Convert static PDF governance into active technical guardrails, role-specific SOP checklists, and automated evidence streams for guaranteed Stage 2 ISO 27001 certification.
            </p>
          </div>

          {/* Remediation Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunFullRemediation}
              disabled={isRemediating}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center space-x-2 cursor-pointer"
              title="Activate all 6 technical guardrails, resolve department policy gaps, and operationalize SOPs"
            >
              <Zap className={`w-4 h-4 text-amber-300 ${isRemediating ? 'animate-spin' : ''}`} />
              <span>{isRemediating ? 'Operationalizing Policies...' : 'Auto-Remediate All Gaps (1-Click)'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('auditor_sampling')}
              className="px-3.5 py-2.5 rounded-xl bg-[#0D1527] hover:bg-[#131E38] text-slate-200 border border-[#233354] text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Run Pre-Audit Dry-Run</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {remediationSuccessMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{remediationSuccessMsg}</span>
            </div>
            <button
              onClick={() => setRemediationSuccessMsg(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 4-Pillar Executive Health Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Operationalization Score */}
        <div className="p-4.5 rounded-xl bg-[#0D1527] border border-[#1E293B] flex flex-col justify-between h-full shadow-xs hover:border-slate-700/60 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="uppercase tracking-wider text-[11px]">Operationalization Score</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white font-mono">{stats.overallImplementationScore}%</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                stats.overallImplementationScore >= 85
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}>
                {stats.overallImplementationScore >= 85 ? 'Audit Ready' : 'Needs Guardrails'}
              </span>
            </div>
          </div>
          <div className="space-y-1.5 pt-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  stats.overallImplementationScore >= 85 ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${stats.overallImplementationScore}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">Weighted score across policies, SOPs & automation</div>
          </div>
        </div>

        {/* Card 2: Technical Guardrails Enforced */}
        <div className="p-4.5 rounded-xl bg-[#0D1527] border border-[#1E293B] flex flex-col justify-between h-full shadow-xs hover:border-slate-700/60 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="uppercase tracking-wider text-[11px]">Technical Guardrails Enforced</span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-sky-400 font-mono">
                {stats.activeGuardrails} / {stats.totalGuardrails}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                {stats.guardrailRate}% Live
              </span>
            </div>
          </div>
          <div className="space-y-1.5 pt-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.guardrailRate}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">Zero-honor system software enforcement</div>
          </div>
        </div>

        {/* Card 3: Department SOP Coverage */}
        <div className="p-4.5 rounded-xl bg-[#0D1527] border border-[#1E293B] flex flex-col justify-between h-full shadow-xs hover:border-slate-700/60 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="uppercase tracking-wider text-[11px]">Department SOP Coverage</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {stats.compliantReqs} / {stats.totalReqs}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Policies Approved
              </span>
            </div>
          </div>
          <div className="space-y-1.5 pt-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.totalReqs > 0 ? (stats.compliantReqs / stats.totalReqs) * 100 : 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              {stats.gapReqs > 0 ? (
                <span className="text-rose-400 font-semibold">{stats.gapReqs} actionable gaps remaining</span>
              ) : (
                <span className="text-emerald-400 font-medium">100% in-scope departments aligned</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Attestation & Audit Freshness */}
        <div className="p-4.5 rounded-xl bg-[#0D1527] border border-[#1E293B] flex flex-col justify-between h-full shadow-xs hover:border-slate-700/60 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="uppercase tracking-wider text-[11px]">Attestation & Audit Freshness</span>
              <FileCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-purple-400 font-mono">{stats.tenantAcksCount}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Sign-offs
              </span>
            </div>
          </div>
          <div className="space-y-1.5 pt-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${inScopeDepts.length > 0 ? Math.min(100, Math.round((stats.tenantAcksCount / Math.max(1, inScopeDepts.length * 2)) * 100)) : 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">Clause 7.3 verified awareness logs</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Switcher - Executive Cockpit Architecture */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#080D1A] border border-[#1E293B] overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Blueprint & Strategy
          </button>
          <button
            onClick={() => setActiveSubTab('contextualized')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'contextualized'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>P1: Policy Contextualizer</span>
          </button>
          <button
            onClick={() => setActiveSubTab('policy_as_code')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'policy_as_code'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>P2: Policy-as-Code & Drift</span>
          </button>
          <button
            onClick={() => setActiveSubTab('iso_attributes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'iso_attributes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>P3: 5-Attributes & SoA</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sop_workbenches')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'sop_workbenches'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>The 6 SOP Workbenches</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {coreSOPs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('cohort_attestation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'cohort_attestation'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>P4: Role Cohorts & Diff</span>
          </button>
          <button
            onClick={() => setActiveSubTab('clause_audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'clause_audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>P5: Clause 5.2 / 7.5 Package</span>
          </button>
          <button
            onClick={() => setActiveSubTab('waivers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'waivers'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>P6: Policy Waivers</span>
          </button>
          <button
            onClick={() => setActiveSubTab('auditor_sampling')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'auditor_sampling'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Pre-Audit Sampling</span>
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0D1527] hover:bg-[#131E38] text-slate-300 border border-[#1E293B] text-xs font-semibold transition shrink-0 cursor-pointer"
          title="Print official SOP Operationalization Pack"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Defense Pack</span>
        </button>
      </div>

      {/* VIEW 1: Implementation Blueprint & Strategy */}
      {activeSubTab === 'overview' && (
        <div className="space-y-5">
          {/* The 3-Tier Architecture Explainer */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>The 3-Tier Lean ISMS Architecture (Why Implementation Fails & How to Fix It)</span>
              </h3>
              <span className="text-[11px] text-slate-400">ISO 27001:2022 Clause 5.2 / 7.5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">Tier 1: Governance Policies</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Board / CISO</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  2–4 page strategic mandate outlining high-level principles (e.g. <em>Information Security Policy</em>, <em>Access Governance</em>).
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong>Auditor Expectation:</strong> Board approval, annual review timestamp, published in central library.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400">Tier 2: Operational Standards</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">Engineering Rules</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Concrete technical baselines (e.g. <em>16-character passwords + MFA</em>, <em>AES-256 GCM encryption</em>, <em>7-day critical patch SLA</em>).
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong>Auditor Expectation:</strong> Codified in config files, Terraform scripts, and MDM policy templates.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Tier 3: Step-by-Step SOPs</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Living Runbooks</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Executable checklists of who does what, when, and where (e.g. <em>JML Offboarding Runbook</em>, <em>Emergency CAB Review SOP</em>).
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong>Auditor Expectation:</strong> 90 days of completed execution tickets and automated log artifacts.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix for In-Scope Departments */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">Department Policy Implementation Status</h3>
                <p className="text-xs text-slate-400">
                  Review how each in-scope department has implemented their assigned ISMS policies and operational procedures.
                </p>
              </div>
              <button
                onClick={() => setActiveModule('departments')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 font-semibold"
              >
                <span>Open Department Scope Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {inScopeDepts.map(dept => {
                const reqs = dept.policyRequirements || [];
                const compliant = reqs.filter(r => r.status === 'Compliant & Approved').length;
                const gaps = reqs.filter(r => r.status === 'Gap - Required').length;
                const rate = reqs.length > 0 ? Math.round((compliant / reqs.length) * 100) : 100;

                return (
                  <div key={dept.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold">{dept.category}</span>
                        <h4 className="text-xs font-bold text-white">{dept.name}</h4>
                        <div className="text-[11px] text-slate-400">Lead: {dept.leadOwner}</div>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                        rate >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {rate}% Ready
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>SOP Enforcement</span>
                        <span>{compliant} / {reqs.length} Approved</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${rate}%` }} />
                      </div>
                    </div>

                    {gaps > 0 ? (
                      <div className="text-[11px] text-rose-400 flex items-center space-x-1 font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{gaps} SOP gaps need operationalization</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-400 flex items-center space-x-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>All department SOPs operational</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: The 6 Critical SOP Workbenches */}
      {activeSubTab === 'sop_workbenches' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                The 6 Essential Operational SOP Workbenches
              </h3>
              <p className="text-[11px] text-slate-400">
                Auditors focus 80% of their sampling on these 6 procedures. Each card pairs the written requirement with an enforceable technical guardrail.
              </p>
            </div>
            <span className="text-xs font-bold text-sky-400 px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800">
              {stats.activeGuardrails} of 6 Guardrails Live
            </span>
          </div>

          <div className="space-y-3">
            {coreSOPs.map(sop => {
              const isExpanded = expandedSOP === sop.id;
              const isGuardrailActive = guardrailStates[sop.id];

              return (
                <div
                  key={sop.id}
                  className={`p-4 rounded-xl transition-all border ${
                    isGuardrailActive
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-900/60 border-amber-500/30'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                          {sop.code}
                        </span>
                        <h4 className="text-sm font-bold text-white">{sop.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sop.department}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span>Clause: <strong className="text-slate-200">{sop.isoClause}</strong></span>
                        <span>•</span>
                        <span>Controls: <strong className="text-sky-300">{sop.annexA}</strong></span>
                        <span>•</span>
                        <span>Owner: <span className="text-slate-300">{sop.owner}</span></span>
                      </div>
                    </div>

                    {/* Guardrail Toggle & Expand */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleToggleGuardrail(sop.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          isGuardrailActive
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                        title={isGuardrailActive ? 'Guardrail Active' : 'Click to activate guardrail'}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{isGuardrailActive ? 'Guardrail Active' : 'Enable Guardrail'}</span>
                      </button>

                      <button
                        onClick={() => setExpandedSOP(isExpanded ? null : sop.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title={isExpanded ? 'Collapse' : 'Expand Details'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Runbook & Guardrail Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      {/* Left: Written Rule vs Reality Breakdown (6 Cols) */}
                      <div className="lg:col-span-6 space-y-3">
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="text-[11px] font-bold text-rose-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>The Shelfware Breakdown (Why Manual Fails)</span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {sop.shelfwareRisk}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 space-y-1.5">
                          <div className="text-[11px] font-bold text-indigo-300 flex items-center space-x-1">
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                            <span>The Technical Guardrail Solution</span>
                          </div>
                          <p className="text-slate-200 text-[11px] leading-relaxed">
                            {sop.technicalGuardrail}
                          </p>
                          <div className="text-[10px] text-indigo-300 font-mono">
                            Tooling: {sop.guardrailTool}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Operating Standard Rules
                          </div>
                          <ul className="space-y-1">
                            {sop.ruleExcerpt.map((r, i) => (
                              <li key={i} className="text-slate-300 flex items-start space-x-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Step-by-Step Execution Runbook (6 Cols) */}
                      <div className="lg:col-span-6 space-y-3">
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                          <div className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                            <ListChecks className="w-3.5 h-3.5" />
                            <span>Step-by-Step Operational Runbook</span>
                          </div>
                          <div className="space-y-1.5">
                            {sop.runbookSteps.map((step, idx) => (
                              <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Required Audit Evidence:</span>
                          <span className="text-sky-300 font-medium font-mono">{sop.evidenceArtifact}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PILLAR 1 VIEW: Anti-Shelfware Contextualized Policy Studio */}
      {activeSubTab === 'contextualized' && (
        <ContextualizedPolicyStudio />
      )}

      {/* PILLAR 2: Policy-as-Code & Drift Probes */}
      {activeSubTab === 'policy_as_code' && (
        <div className="space-y-6">
          <PolicyAsCodeDriftCenter onRequestWaiver={() => setActiveSubTab('waivers')} />

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>CI/CD & Cloud Infrastructure Enforcement Guardrails</span>
            </h3>
            <p className="text-xs text-slate-400">
              In ISO 27001, automated preventative controls are vastly superior to manual policies. Here are the active configuration standards enforcing your ISMS:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guardrail 1: GitHub Branch Protection */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <GitBranch className="w-4 h-4 text-sky-400" />
                  <span>GitHub Branch Protection (Annex A.8.32)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prevents unreviewed code from reaching production. Requires 2 peer code reviews, CodeOwner approval, and passing security linters.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                <pre>{`branch_protection_rule:
  pattern: "main"
  required_approving_review_count: 2
  require_code_owner_reviews: true
  dismiss_stale_reviews: true
  requires_strict_status_checks: true
  status_checks: ["snyk-container", "trivy-scan"]
  enforce_admins: true`}</pre>
              </div>
            </div>

            {/* Guardrail 2: Identity Provider MFA */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span>IdP Root Authentication Gate (Annex A.5.15 / A.8.5)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mandates TOTP / FIDO2 hardware keys across all company Google / Okta accounts. Blocks insecure SMS 2FA.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                <pre>{`authentication_policy:
  mfa_required: true
  allowed_factors: ["webauthn", "totp", "fido2"]
  disallowed_factors: ["sms", "voice_call"]
  session_lifetime_hours: 12
  remember_device_days: 14
  risk_based_authentication: true`}</pre>
              </div>
            </div>

            {/* Guardrail 3: Pre-Commit Secret Scanning */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Pre-Commit Automated Secret Scanning (Annex A.8.24)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Blocks developers from accidentally committing AWS secrets, API keys, or private SSH certificates to git.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                <pre>{`- repo: https://github.com/gitleaks/gitleaks
  rev: v8.18.2
  hooks:
    - id: gitleaks
      args: ["protect", "--staged", "--verbose"]`}</pre>
              </div>
            </div>

            {/* Guardrail 4: MDM Enforced Encryption & Screen Lock */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>MDM Hardware Endpoint Lockdown (Annex A.8.1)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pushes FileVault/BitLocker encryption keys and locks the screen automatically after 5 minutes of inactivity.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
                <pre>{`profile: "Endpoint Security Baseline"
payload:
  full_disk_encryption: "FileVault_Escrowed"
  screen_lock_idle_timeout_seconds: 300
  password_complexity: "min_16_chars_mixed"
  auto_update_os: true`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 3 VIEW: 5-Attribute Tagging & Dynamic SoA */}
      {activeSubTab === 'iso_attributes' && (
        <Iso27001AttributeSoASync />
      )}

      {/* PILLAR 4 VIEW: Role Cohort Attestation & Differential Diff Hub */}
      {activeSubTab === 'cohort_attestation' && (
        <CohortAttestationDiffHub />
      )}

      {/* PILLAR 5 VIEW: Clause 5.2 & 7.5 Audit Evidence Automation */}
      {activeSubTab === 'clause_audit' && (
        <Clause52And75AuditEvidenceHub />
      )}

      {/* PILLAR 6 VIEW: Time-Bound Policy Waiver Register */}
      {activeSubTab === 'waivers' && (
        <PolicyWaiverRegisterHub />
      )}

      {/* VIEW 4: Lead Auditor "Red Team" Pre-Audit Sampling Simulator */}
      {activeSubTab === 'auditor_sampling' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Lead Auditor 3-Point Pre-Audit Sampling Simulator</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate the exact sampling tests that external certification auditors run. If gaps are uncovered, log them directly into your internal CAPA tracker to demonstrate <strong>ISO 27001 Clause 10.1 self-correction</strong>.
                </p>
              </div>

              <button
                onClick={handleRunAuditorSimulation}
                disabled={simulationRunning}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${simulationRunning ? 'animate-spin' : ''}`} />
                <span>{simulationRunning ? 'Extracting Audit Samples...' : 'Execute Audit Sampling Dry-Run'}</span>
              </button>
            </div>
          </div>

          {/* Sampling Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Test 1: Employee Awareness Sampling */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Test 1: Policy Awareness (Clause 7.3)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  PASS (96%)
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auditor asks random staff where policies are located and verifies digital signature timestamps in Skanda GRC.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 text-[11px] text-slate-300 space-y-1">
                <div>Sample Size: <strong>15 Employees</strong></div>
                <div>Digital Attestations Found: <strong className="text-emerald-400">15 of 15 (100%)</strong></div>
                <div>Average Sign-off Time: <strong>2.4 days after onboarding</strong></div>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auditor Verdict: Full Compliance</span>
              </div>
            </div>

            {/* Test 2: Leaver Timing Audit */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Test 2: Leaver Deprovisioning (A.6.5)</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  MINOR GAP DETECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auditor cross-references HR termination dates against Okta/GitHub deactivation timestamps.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 text-[11px] text-slate-300 space-y-1">
                <div>Sample Size: <strong>5 Terminated Staff (Last 90d)</strong></div>
                <div>Timely Deprovisioning (&lt;24h): <strong className="text-amber-400">4 of 5 (80%)</strong></div>
                <div className="text-rose-400">1 Contractor account deactivated 36h after contract end.</div>
              </div>

              {sampleFindingsLogged['fnd_leaver'] ? (
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-[11px] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Logged in CAPA Tracker as Internal Finding</span>
                </div>
              ) : (
                <button
                  onClick={() => handleLogSampleCAPA(
                    'fnd_leaver',
                    'Contractor Account Deprovisioning Exceeded 24h SLA',
                    'A.6.5 Responsibilities after termination',
                    'IT & Infrastructure',
                    'Audit sampling identified contractor "M. Kincaid" whose GitHub access remained active for 36 hours post-termination.',
                    'Manual offboarding notification from recruitment vendor instead of automated HRMS webhook.',
                    'Configure direct webhook hook from vendor contract management into Okta suspension queue.'
                  )}
                  className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log as Internal CAPA Finding (Clause 10.1)</span>
                </button>
              )}
            </div>

            {/* Test 3: Production Change Peer-Review */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Test 3: Change Reviews (A.8.32)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  PASS (100%)
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auditor inspects 10 random pull requests merged to production to ensure zero unapproved merges.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 text-[11px] text-slate-300 space-y-1">
                <div>Sample Size: <strong>10 Merged PRs</strong></div>
                <div>Peer Approved (&gt;=2 reviewers): <strong className="text-emerald-400">10 of 10 (100%)</strong></div>
                <div>Automated SAST Checks: <strong className="text-emerald-400">100% Passed</strong></div>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auditor Verdict: Full Compliance</span>
              </div>
            </div>
          </div>

          {/* Explainer: Why Internal Findings Help Pass the Audit */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs">
            <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white">Lead Auditor Secret: Why Self-Found Gaps Build Auditor Trust</strong>
              <p className="text-slate-400 leading-relaxed">
                External ISO certification auditors look for an organization that is actively self-policing. If your audit has zero internal findings, the auditor will dig deeper until they find something you missed. When you show them that you discovered a 12-hour offboarding delay yourself, conducted a 5-Whys root cause analysis, and configured an automated webhook to prevent recurrence (Clause 10.1 / 10.2), they will reward your ISMS maturity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
