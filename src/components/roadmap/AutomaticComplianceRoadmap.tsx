import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Layers,
  FileCheck2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Check,
  FolderCheck,
  Award,
  ExternalLink,
  Target
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface RoadmapMilestone {
  id: string;
  phaseId: number;
  title: string;
  description: string;
  category: string;
  owner: string;
  targetDays: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'BLOCKED';
  evidenceNeeded: string;
  deliverables: string[];
  moduleTarget: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface RoadmapPhase {
  phaseNumber: number;
  name: string;
  subtitle: string;
  description: string;
  estimatedWeeks: number;
  milestones: RoadmapMilestone[];
  icon: React.ElementType;
}

export const AutomaticComplianceRoadmap: React.FC = () => {
  const { currentTenant, setActiveModule } = useGRC();
  const { showToast } = useToast();

  const [expandedPhases, setExpandedPhases] = useState<number[]>([1, 2]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedMilestone, setSelectedMilestone] = useState<RoadmapMilestone | null>(null);

  // 7 Big-4 Consulting Phases conforming directly to Section 11
  const phases: RoadmapPhase[] = [
    {
      phaseNumber: 1,
      name: 'Phase 1 — Foundation',
      subtitle: 'Scope, Governance, Asset Inventory & Risk Methodology',
      description: 'Establish the operational charter, legal boundaries, asset classification, and enterprise risk scoring matrix.',
      estimatedWeeks: 2,
      icon: Compass,
      milestones: [
        {
          id: 'm1-1',
          phaseId: 1,
          title: 'Define ISMS / PIMS Scope Boundaries',
          description: 'Document physical, logical, cloud, and organizational perimeters of compliance.',
          category: 'Scope',
          owner: 'CISO / Head of Security',
          targetDays: 5,
          status: 'COMPLETED',
          evidenceNeeded: 'Approved Scope Document & Statement of Applicability v1.0',
          deliverables: ['Context of Organization', 'Interested Parties Matrix', 'Scope Boundary Diagram'],
          moduleTarget: 'org_scope',
          criticality: 'CRITICAL'
        },
        {
          id: 'm1-2',
          phaseId: 1,
          title: 'Establish Governance & Steering Committee',
          description: 'Appoint Information Security Steering Committee (ISSC) and define RACI matrix.',
          category: 'Governance',
          owner: 'Executive Committee',
          targetDays: 7,
          status: 'COMPLETED',
          evidenceNeeded: 'Signed Governance Charter & First Meeting Minutes',
          deliverables: ['GRC Steering Charter', 'RACI Matrix', 'Role Delegations'],
          moduleTarget: 'statement_of_applicability',
          criticality: 'HIGH'
        },
        {
          id: 'm1-3',
          phaseId: 1,
          title: 'Hardware, Software & Cloud Asset Inventory',
          description: 'Comprehensive discovery of crown-jewel systems, databases, APIs, and microservices.',
          category: 'Asset Inventory',
          owner: 'DevOps / IT Lead',
          targetDays: 10,
          status: 'COMPLETED',
          evidenceNeeded: 'Live CMDB Asset Register with Data Classifications',
          deliverables: ['Primary Asset Register', 'Support Asset Register', 'Data Flow Diagrams'],
          moduleTarget: 'assets',
          criticality: 'CRITICAL'
        },
        {
          id: 'm1-4',
          phaseId: 1,
          title: 'Risk Assessment Methodology Formulation',
          description: 'Define 5x5 Likelihood x Impact scoring, risk appetite, and ISO 31000 aligned thresholds.',
          category: 'Risk Methodology',
          owner: 'Enterprise Risk Manager',
          targetDays: 12,
          status: 'IN_PROGRESS',
          evidenceNeeded: 'Risk Treatment Plan (RTP) and Scoring Matrix criteria',
          deliverables: ['Risk Assessment Methodology Document', 'Risk Acceptance Criteria', 'Risk Register'],
          moduleTarget: 'risk_management',
          criticality: 'CRITICAL'
        }
      ]
    },
    {
      phaseNumber: 2,
      name: 'Phase 2 — Policies & Procedures',
      subtitle: 'Author, Review & Board Approval of Mandatory ISMS Policies',
      description: 'Generate and adopt the 24 foundational policies required by ISO 27001:2022, MAS TRM, and DPDPA.',
      estimatedWeeks: 3,
      icon: FileCheck2,
      milestones: [
        {
          id: 'm2-1',
          phaseId: 2,
          title: 'Information Security Master Policy (A.5.1)',
          description: 'Top-level management directive acknowledging management commitment and annual review cadence.',
          category: 'Organizational',
          owner: 'CISO',
          targetDays: 14,
          status: 'COMPLETED',
          evidenceNeeded: 'CEO Signed Master ISMS Policy & Employee Acknowledgement Logs',
          deliverables: ['ISMS Policy Document', 'HR Employee Handbook Clause', 'Intranet Publication'],
          moduleTarget: 'policy_management',
          criticality: 'CRITICAL'
        },
        {
          id: 'm2-2',
          phaseId: 2,
          title: 'Access Control & Password Policy (A.5.15 - A.5.18)',
          description: 'Standards for Least Privilege, MFA enforcement, quarterly user access reviews, and key custody.',
          category: 'Technical Policy',
          owner: 'IT Ops Lead',
          targetDays: 18,
          status: 'IN_PROGRESS',
          evidenceNeeded: 'Approved Access Control Policy and Okta/Azure AD Policy configs',
          deliverables: ['Access Control Policy', 'Privileged Access Procedure', 'Revocation SOP'],
          moduleTarget: 'policy_management',
          criticality: 'CRITICAL'
        },
        {
          id: 'm2-3',
          phaseId: 2,
          title: 'Incident Response & Breach Notification SOP (A.5.24 - A.5.28)',
          description: 'Runbooks for triage, escalation, CERT notification, and statutory 6-hour breach reporting.',
          category: 'Operations',
          owner: 'SecOps Lead',
          targetDays: 20,
          status: 'IN_PROGRESS',
          evidenceNeeded: 'IR Plan with designated Incident Commander and Tabletop drill record',
          deliverables: ['Incident Response Plan', 'Severity Classification Matrix', 'Communication Templates'],
          moduleTarget: 'policy_management',
          criticality: 'HIGH'
        },
        {
          id: 'm2-4',
          phaseId: 2,
          title: 'Supplier & Third-Party Security Policy (A.5.19 - A.5.23)',
          description: 'Vendor onboarding security questionnaires, Tier 1 vendor audits, and contractual SLA safeguards.',
          category: 'Vendor Risk',
          owner: 'Procurement / GRC Lead',
          targetDays: 22,
          status: 'PENDING',
          evidenceNeeded: 'Vendor Security Standard and Signed DPA templates',
          deliverables: ['Third-Party Risk Standard', 'Vendor Assessment Rubric', 'Right-to-Audit Clauses'],
          moduleTarget: 'vendors',
          criticality: 'HIGH'
        }
      ]
    },
    {
      phaseNumber: 3,
      name: 'Phase 3 — Technical Controls',
      subtitle: 'Technical Hardening, Cryptography & Cloud Guardrails',
      description: 'Implement automated guardrails across Identity, Infrastructure, Endpoints, and CI/CD pipelines.',
      estimatedWeeks: 4,
      icon: Shield,
      milestones: [
        {
          id: 'm3-1',
          phaseId: 3,
          title: 'Universal Multi-Factor Authentication (MFA) & SSO',
          description: 'Enforce hardware-bound or app-based MFA across all corporate and infrastructure endpoints.',
          category: 'Identity',
          owner: 'IAM Lead',
          targetDays: 28,
          status: 'IN_PROGRESS',
          evidenceNeeded: '100% MFA Enforcement Report from IdP with zero exemptions',
          deliverables: ['IdP Configuration Export', 'Privileged Account MFA Audit', 'Break-Glass Protocol'],
          moduleTarget: 'continuous_compliance',
          criticality: 'CRITICAL'
        },
        {
          id: 'm3-2',
          phaseId: 3,
          title: 'Vulnerability Management & Penetration Testing (A.8.8)',
          description: 'Quarterly external penetration testing and weekly automated vulnerability scans.',
          category: 'Security Testing',
          owner: 'AppSec Lead',
          targetDays: 32,
          status: 'IN_PROGRESS',
          evidenceNeeded: 'CREST Certified External Pentest Report with Zero Critical/High Vulnerabilities',
          deliverables: ['Pentest Report v2026', 'Remediation Verification Letter', 'Qualys/Tenable Scans'],
          moduleTarget: 'live_scanner',
          criticality: 'CRITICAL'
        },
        {
          id: 'm3-3',
          phaseId: 3,
          title: 'Data Loss Prevention (DLP) & Encryption at Rest (A.8.24)',
          description: 'AES-256 for all stored data, TLS 1.3 in transit, and endpoint DLP preventing data exfiltration.',
          category: 'Data Protection',
          owner: 'Data Engineering Lead',
          targetDays: 36,
          status: 'PENDING',
          evidenceNeeded: 'Cloud KMS Key Rotation Logs and Database Encryption Status',
          deliverables: ['Encryption Key Management SOP', 'DLP Policy Ruleset', 'Database Configuration Logs'],
          moduleTarget: 'data_info',
          criticality: 'HIGH'
        },
        {
          id: 'm3-4',
          phaseId: 3,
          title: 'Centralized Logging & SIEM Integration (A.8.15)',
          description: 'Aggregate audit trails into immutable WORM storage with 365-day retention and alerting.',
          category: 'Monitoring',
          owner: 'SecOps Team',
          targetDays: 40,
          status: 'PENDING',
          evidenceNeeded: 'Splunk/Datadog ingest confirmation and alert runbooks',
          deliverables: ['Log Ingestion Register', 'Retention Policy Verification', 'SOC Alert Playbooks'],
          moduleTarget: 'telemetry_stream',
          criticality: 'HIGH'
        }
      ]
    },
    {
      phaseNumber: 4,
      name: 'Phase 4 — Evidence Collection',
      subtitle: 'Departmental Evidence Harvesting & Auditor Verification',
      description: 'Collect objective proof across 93 controls from HR, Finance, DevOps, Legal, and Physical Facilities.',
      estimatedWeeks: 3,
      icon: FolderCheck,
      milestones: [
        {
          id: 'm4-1',
          phaseId: 4,
          title: 'Quarterly User Access Review Evidence (A.5.15)',
          description: 'Managers re-certify access permissions with documented sign-offs for all active personnel.',
          category: 'Evidence Harvesting',
          owner: 'Department Leads',
          targetDays: 45,
          status: 'PENDING',
          evidenceNeeded: 'Access Review sign-off sheets with timestamped approvals',
          deliverables: ['Q1 Access Review Dossier', 'Revocation Audit Logs', 'Exception Register'],
          moduleTarget: 'evidence_center',
          criticality: 'CRITICAL'
        },
        {
          id: 'm4-2',
          phaseId: 4,
          title: 'Disaster Recovery (DR) Drill & BCP Simulation (A.8.14)',
          description: 'Full failover simulation demonstrating recovery within RTO < 2 hrs and RPO < 15 mins.',
          category: 'BCP/DR',
          owner: 'Infrastructure Architect',
          targetDays: 50,
          status: 'PENDING',
          evidenceNeeded: 'DR Drill Execution Report signed by Chief Technology Officer',
          deliverables: ['DR Test Plan', 'Actual Failover Telemetry', 'Post-Mortem Lessons Learned'],
          moduleTarget: 'business_continuity',
          criticality: 'CRITICAL'
        },
        {
          id: 'm4-3',
          phaseId: 4,
          title: 'Employee Security Awareness & Phishing Simulation (A.6.3)',
          description: '100% staff completion of annual training and baseline phishing resilience simulation.',
          category: 'Human Resources',
          owner: 'HR & Training Lead',
          targetDays: 52,
          status: 'PENDING',
          evidenceNeeded: 'LMS Completion Certificates & Phishing Click-Rate Report (< 3%)',
          deliverables: ['Training Curriculum', 'Attendance Roster', 'Simulated Campaign Analytics'],
          moduleTarget: 'training_academy',
          criticality: 'HIGH'
        }
      ]
    },
    {
      phaseNumber: 5,
      name: 'Phase 5 — Internal Audit',
      subtitle: 'Independent Clause 9.2 Assessment & Sampling',
      description: 'Execute formal internal audit examining control effectiveness, objective evidence, and interview logs.',
      estimatedWeeks: 2,
      icon: Layers,
      milestones: [
        {
          id: 'm5-1',
          phaseId: 5,
          title: 'Charter & Annual Internal Audit Plan',
          description: 'Define audit schedule, auditor independence verification, and sampling methodologies.',
          category: 'Audit Planning',
          owner: 'Lead Internal Auditor',
          targetDays: 58,
          status: 'PENDING',
          evidenceNeeded: 'Approved Audit Plan with sample sizes and interview schedules',
          deliverables: ['Audit Charter', 'Sampling Methodology', 'Notification Letters'],
          moduleTarget: 'internal_audit',
          criticality: 'CRITICAL'
        },
        {
          id: 'm5-2',
          phaseId: 5,
          title: 'Fieldwork Interviews & Sample Evidence Testing',
          description: 'Conduct structured interviews across all departments and verify live screenshots/records.',
          category: 'Audit Fieldwork',
          owner: 'Audit Team',
          targetDays: 62,
          status: 'PENDING',
          evidenceNeeded: 'Completed Audit Working Papers and sampling logs',
          deliverables: ['Working Papers', 'Sampled Artifacts', 'Interview Transcripts'],
          moduleTarget: 'internal_audit',
          criticality: 'CRITICAL'
        },
        {
          id: 'm5-3',
          phaseId: 5,
          title: 'Internal Audit Report & Management Presentation',
          description: 'Formally issue findings categorized by Major NC, Minor NC, and Opportunities for Improvement (OFI).',
          category: 'Audit Reporting',
          owner: 'Lead Auditor',
          targetDays: 65,
          status: 'PENDING',
          evidenceNeeded: 'Final Internal Audit Report signed by Lead Auditor and CISO',
          deliverables: ['Formal Audit Report', 'Findings Summary Matrix', 'Executive Summary Deck'],
          moduleTarget: 'internal_audit',
          criticality: 'HIGH'
        }
      ]
    },
    {
      phaseNumber: 6,
      name: 'Phase 6 — CAPA',
      subtitle: 'Corrective & Preventive Actions with Root Cause Analysis',
      description: 'Remediate all internal audit non-conformities using 5-Whys and Fishbone root-cause analysis.',
      estimatedWeeks: 2,
      icon: Clock,
      milestones: [
        {
          id: 'm6-1',
          phaseId: 6,
          title: 'Root Cause Analysis (5-Whys) on Audit Findings',
          description: 'Conduct forensic investigation into why controls failed rather than merely treating symptoms.',
          category: 'RCA',
          owner: 'Control Owners',
          targetDays: 70,
          status: 'PENDING',
          evidenceNeeded: 'Documented 5-Whys analysis and Ishikawa diagram for each NC',
          deliverables: ['RCA Documentation', 'Contributing Factors Matrix'],
          moduleTarget: 'capa_tracker',
          criticality: 'CRITICAL'
        },
        {
          id: 'm6-2',
          phaseId: 6,
          title: 'Remediation Implementation & Preventative Controls',
          description: 'Execute engineering and policy fixes with updated SOPs and architectural guardrails.',
          category: 'Remediation',
          owner: 'Action Assignees',
          targetDays: 75,
          status: 'PENDING',
          evidenceNeeded: 'Remediation proof artifacts and commit logs/updated configs',
          deliverables: ['Updated Configurations', 'Retested Artifacts'],
          moduleTarget: 'capa_tracker',
          criticality: 'CRITICAL'
        },
        {
          id: 'm6-3',
          phaseId: 6,
          title: 'CAPA Effectiveness Verification & Formal Closure',
          description: 'Internal audit re-tests remediated controls after 30 days to verify sustained efficacy.',
          category: 'Verification',
          owner: 'Lead Auditor',
          targetDays: 80,
          status: 'PENDING',
          evidenceNeeded: 'CAPA Closure Sign-off Form with auditor endorsement',
          deliverables: ['Closure Certificate', 'Residual Risk Assessment Update'],
          moduleTarget: 'capa_tracker',
          criticality: 'HIGH'
        }
      ]
    },
    {
      phaseNumber: 7,
      name: 'Phase 7 — Certification Readiness',
      subtitle: 'Management Review, Stage 1 / Stage 2 External Certification',
      description: 'Executive sign-off, external registrar appointment (BSI, TÜV, SGS), and auditor dossier generation.',
      estimatedWeeks: 3,
      icon: Award,
      milestones: [
        {
          id: 'm7-1',
          phaseId: 7,
          title: 'Executive Management Review Meeting (Clause 9.3)',
          description: 'C-suite formal evaluation of ISMS performance, resources, incident trends, and continual improvement.',
          category: 'Executive Review',
          owner: 'CEO & CISO',
          targetDays: 82,
          status: 'PENDING',
          evidenceNeeded: 'Management Review Minutes signed by CEO with allocated budget decisions',
          deliverables: ['MRM Presentation', 'Signed Meeting Minutes', 'Improvement Action Items'],
          moduleTarget: 'management_review',
          criticality: 'CRITICAL'
        },
        {
          id: 'm7-2',
          phaseId: 7,
          title: 'Stage 1 External Audit (Documentation Review)',
          description: 'Accredited Certification Body reviews ISMS policies, SoA, Scope, and Internal Audit records.',
          category: 'External Audit',
          owner: 'Lead Auditor & CISO',
          targetDays: 88,
          status: 'PENDING',
          evidenceNeeded: 'Stage 1 CB Audit Report with recommendation to proceed to Stage 2',
          deliverables: ['Certification Body Contract', 'Auditor Pack Dossier', 'Stage 1 Clear Report'],
          moduleTarget: 'command_center',
          criticality: 'CRITICAL'
        },
        {
          id: 'm7-3',
          phaseId: 7,
          title: 'Stage 2 Certification Audit & Formal Certificate Issuance',
          description: 'On-site/remote comprehensive verification of live controls followed by UKAS/ANAB certificate award.',
          category: 'Certification Award',
          owner: 'Executive Leadership',
          targetDays: 95,
          status: 'PENDING',
          evidenceNeeded: 'Official ISO/IEC 27001:2022 Accredited Certificate & Registry Listing',
          deliverables: ['ISO Certificate PDF', 'Trust Center Badge', 'Continuous Surveillance Plan'],
          moduleTarget: 'command_center',
          criticality: 'CRITICAL'
        }
      ]
    }
  ];

  // Overall roadmap metrics
  const allMilestones = phases.flatMap(p => p.milestones);
  const completedCount = allMilestones.filter(m => m.status === 'COMPLETED').length;
  const inProgressCount = allMilestones.filter(m => m.status === 'IN_PROGRESS').length;
  const pendingCount = allMilestones.filter(m => m.status === 'PENDING').length;
  const totalCount = allMilestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseNum) ? prev.filter(p => p !== phaseNum) : [...prev, phaseNum]
    );
  };

  const expandAll = () => setExpandedPhases([1, 2, 3, 4, 5, 6, 7]);
  const collapseAll = () => setExpandedPhases([]);

  const handleExportRoadmap = () => {
    showToast({
      title: 'Roadmap Exported',
      message: 'Exporting Skanda Implementation Roadmap Dossier (PDF/JSON) with 7-phase timeline and milestones...',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Automated Compliance Roadmap</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300">
                Tenant: <strong>{currentTenant?.name || 'Enterprise'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
              <span>7-Phase Implementation Journey</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated roadmap engineered from Big-4 consulting methodologies. Seamlessly transitions your organization
              from Foundation to Formal Accredited Certification with zero guesswork.
            </p>
          </div>

          {/* Quick Metrics Tile */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/60 rounded-xl p-4 text-center min-w-[130px]">
              <div className="text-3xl font-black text-indigo-400">{progressPercent}%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                Overall Progress
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 min-w-[80px]">
                <div className="text-base font-bold text-emerald-400">{completedCount}</div>
                <div className="text-[9px] text-slate-400">Completed</div>
              </div>
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-2.5 min-w-[80px]">
                <div className="text-base font-bold text-sky-400">{inProgressCount}</div>
                <div className="text-[9px] text-slate-400">In Progress</div>
              </div>
              <div className="bg-slate-700/40 border border-slate-700 rounded-xl p-2.5 min-w-[80px]">
                <div className="text-base font-bold text-slate-300">{pendingCount}</div>
                <div className="text-[9px] text-slate-400">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Phase 1 (Foundation) &rarr; Phase 7 (Certification)</span>
            <span className="font-bold text-indigo-300">{completedCount} of {totalCount} Milestones Verified</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50 flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Milestones:</span>
          {(['ALL', 'IN_PROGRESS', 'PENDING', 'COMPLETED'] as const).map(statusKey => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === statusKey
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {statusKey === 'ALL'
                ? `All (${totalCount})`
                : statusKey === 'IN_PROGRESS'
                ? `Active (${inProgressCount})`
                : statusKey === 'PENDING'
                ? `Pending (${pendingCount})`
                : `Done (${completedCount})`}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Collapse All
          </button>
          <button
            onClick={handleExportRoadmap}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer ml-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roadmap</span>
          </button>
        </div>
      </div>

      {/* 7 Phase Accordions */}
      <div className="space-y-4">
        {phases.map(phase => {
          const isExpanded = expandedPhases.includes(phase.phaseNumber);
          const PhaseIcon = phase.icon;

          const phaseMilestones = phase.milestones.filter(m => {
            if (filterStatus === 'ALL') return true;
            return m.status === filterStatus;
          });

          const phaseCompleted = phase.milestones.filter(m => m.status === 'COMPLETED').length;
          const phaseTotal = phase.milestones.length;
          const phasePercent = Math.round((phaseCompleted / phaseTotal) * 100);

          return (
            <div
              key={phase.phaseNumber}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
            >
              {/* Phase Header */}
              <div
                onClick={() => togglePhase(phase.phaseNumber)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition select-none"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      phasePercent === 100
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                        : phasePercent > 0
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <PhaseIcon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                        {phase.name}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Est: {phase.estimatedWeeks} Weeks
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {phase.subtitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {phaseCompleted} / {phaseTotal} Milestones
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          phasePercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${phasePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Milestones List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-4 sm:p-6"
                  >
                    {phaseMilestones.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No milestones match filter "{filterStatus}".
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {phaseMilestones.map(m => {
                          const isDone = m.status === 'COMPLETED';
                          const isAct = m.status === 'IN_PROGRESS';

                          return (
                            <div
                              key={m.id}
                              className={`p-4 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-white dark:bg-slate-900/90 border-emerald-200 dark:border-emerald-900/40'
                                  : isAct
                                  ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800 shadow-sm ring-1 ring-indigo-500/20'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        isDone
                                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                          : isAct
                                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      {m.status.replace('_', ' ')}
                                    </span>

                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      {m.category}
                                    </span>

                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        m.criticality === 'CRITICAL'
                                          ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                                          : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                                      }`}
                                    >
                                      {m.criticality}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <span>{m.title}</span>
                                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                  </h4>

                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {m.description}
                                  </p>

                                  <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center space-x-1">
                                      <Users className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Owner: <strong className="text-slate-700 dark:text-slate-200">{m.owner}</strong></span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Target: Day {m.targetDays}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center space-x-1">
                                      <FolderCheck className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="truncate max-w-xs">Required: {m.evidenceNeeded}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 shrink-0 self-start lg:self-center pt-2 lg:pt-0">
                                  <button
                                    onClick={() => setSelectedMilestone(m)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  >
                                    View Details
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveModule(m.moduleTarget as any);
                                      showToast({
                                        title: 'Navigating to Module',
                                        message: `Opening ${m.title}...`,
                                        type: 'info'
                                      });
                                    }}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                                  >
                                    <span>Open Module</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Milestone Details Drawer Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedMilestone(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                  {selectedMilestone.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">Milestone {selectedMilestone.id}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedMilestone.title}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedMilestone.description}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Responsible Owner:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedMilestone.owner}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target SLA:</span>
                  <strong className="text-slate-900 dark:text-white">Day {selectedMilestone.targetDays}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Required Evidence:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 truncate max-w-xs">{selectedMilestone.evidenceNeeded}</strong>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Expected Output & Deliverables
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {selectedMilestone.deliverables.map((del, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const target = selectedMilestone.moduleTarget;
                    setSelectedMilestone(null);
                    setActiveModule(target as any);
                    showToast({
                      title: 'Navigating to Module',
                      message: `Opening ${selectedMilestone.title}...`,
                      type: 'info'
                    });
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <span>Launch Module</span>
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
