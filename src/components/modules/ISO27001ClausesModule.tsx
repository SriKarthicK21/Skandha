import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Search,
  Building2,
  Users,
  Compass,
  Headphones,
  Sliders,
  Activity,
  TrendingUp,
  Filter,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  FileCheck2,
  Eye,
  X,
  Check,
  AlertTriangle,
  BarChart3,
  LayoutGrid,
  ArrowUpDown,
  SlidersHorizontal,
  FolderCheck
} from 'lucide-react';
import { RadialProgressIndicator } from '../common/RadialProgressIndicator';
import { PageContainer } from '../layout/PageContainer';
import { ControlItem, EvidenceRecord } from '../../types';
import { MASTER_ISO27001_CONTROLS } from '../../data/initialData';
import {
  ClauseRequirementProgressTracker,
  calculateRequirementEvidencePresence
} from '../compliance/ClauseRequirementProgressTracker';

export interface ClauseRequirement {
  code: string;
  name: string;
  text: string;
  auditCheck: string;
  status: 'Compliant' | 'In Progress' | 'Action Required';
  linkedControls: string[];
  mandatoryArtifacts: string[];
}

export interface MajorClauseGroup {
  number: '4' | '5' | '6' | '7' | '8' | '9' | '10';
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  linkedControlCodes: string[];
  mandatoryEvidenceChecklist: {
    title: string;
    description: string;
    controlCode: string;
  }[];
  auditorKeyInterviews: {
    question: string;
    evidenceToInspect: string;
  }[];
  requirements: ClauseRequirement[];
}

export const INITIAL_CLAUSES_DATA: MajorClauseGroup[] = [
  {
    number: '4',
    title: 'Context of the Organization',
    shortTitle: 'Context',
    description: 'Internal & external issues, interested party needs, official ISMS boundary scoping, and management system architecture.',
    icon: Building2,
    accentColor: 'sky',
    linkedControlCodes: ['A.5.1', 'A.5.19', 'A.5.31', 'A.5.36'],
    mandatoryEvidenceChecklist: [
      { title: 'Official ISMS Scope Statement v2.0', description: 'Boundaries, locations, cloud repositories, and exclusion justifications.', controlCode: 'A.5.1' },
      { title: 'Interested Parties & Regulatory Obligations Matrix', description: 'Legal, customer contractual SLAs, GDPR/DPA, and statutory mandates.', controlCode: 'A.5.31' },
      { title: 'Internal & External Issues (PESTLE / SWOT Analysis)', description: 'Risk posture context approved by senior executive leadership.', controlCode: 'A.5.1' },
      { title: 'ISMS Process & RACI Interaction Architecture Map', description: 'Core governance workflows, inputs, outputs, and department RACI.', controlCode: 'A.5.36' }
    ],
    auditorKeyInterviews: [
      { question: 'How do you ensure interested party expectations are kept up to date when laws or customer contracts evolve?', evidenceToInspect: 'Interested parties register review timestamps & legal counsel sign-offs.' },
      { question: 'Are any organizational systems or locations excluded from scope, and what is the justification?', evidenceToInspect: 'ISMS Scope Document Section 2.3 with explicit justification.' }
    ],
    requirements: [
      {
        code: '4.1',
        name: 'Understanding the organization and its context',
        text: 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.',
        auditCheck: 'Verify documented PESTLE / SWOT analysis, stakeholder registers, and risk strategy approved by leadership.',
        status: 'Compliant',
        linkedControls: ['A.5.1'],
        mandatoryArtifacts: ['Documented PESTLE/SWOT Context Analysis', 'Annual ISMS Strategy Review Minutes']
      },
      {
        code: '4.2',
        name: 'Understanding the needs and expectations of interested parties',
        text: 'The organization shall determine interested parties that are relevant to the ISMS, and the requirements of these interested parties.',
        auditCheck: 'Examine customer contractual SLAs, GDPR/DPA requirements, and regulator expectations register.',
        status: 'Compliant',
        linkedControls: ['A.5.19', 'A.5.31'],
        mandatoryArtifacts: ['Interested Parties & Statutory Obligations Matrix', 'Customer Security Addendum Catalog']
      },
      {
        code: '4.3',
        name: 'Determining the scope of the ISMS',
        text: 'The organization shall determine the boundaries and applicability of the ISMS to establish its scope. The scope shall be available as documented information.',
        auditCheck: 'Verify official ISMS Scope Statement covering all cloud SaaS repositories, production workloads, and corporate locations.',
        status: 'Compliant',
        linkedControls: ['A.5.1', 'A.5.36'],
        mandatoryArtifacts: ['Official ISMS Scope Statement Document v2.0', 'Scope Boundary Network Diagrams']
      },
      {
        code: '4.4',
        name: 'Information security management system',
        text: 'The organization shall establish, implement, maintain and continually improve an ISMS, including the processes needed and their interactions.',
        auditCheck: 'Check process mapping, RACI matrices, and continuous governance reviews.',
        status: 'Compliant',
        linkedControls: ['A.5.1', 'A.5.2'],
        mandatoryArtifacts: ['ISMS Core Process Map', 'Cross-Functional RACI Matrix']
      }
    ]
  },
  {
    number: '5',
    title: 'Leadership & Governance',
    shortTitle: 'Leadership',
    description: 'Executive leadership commitment, board-approved Information Security Policy, and organizational roles, authorities, and RACI.',
    icon: Users,
    accentColor: 'indigo',
    linkedControlCodes: ['A.5.1', 'A.5.2', 'A.5.3', 'A.5.4', 'A.5.5', 'A.5.6'],
    mandatoryEvidenceChecklist: [
      { title: 'Information Security Policy v2.1 Signed by CEO/Board', description: 'Comprehensive master security policy with mandatory workforce acknowledgement.', controlCode: 'A.5.1' },
      { title: 'CISO Charter & ISMS Steering Committee Minutes', description: 'Quarterly C-level governance meetings, risk tolerance approvals, and budget allocation.', controlCode: 'A.5.4' },
      { title: 'Organizational Security RACI Matrix & Job Descriptions', description: 'Formal allocation of security duties across engineering, HR, legal, and operations.', controlCode: 'A.5.2' },
      { title: 'Segregation of Duties Matrix & Production Access Gates', description: 'Separation between code development, security auditing, and production deployment.', controlCode: 'A.5.3' }
    ],
    auditorKeyInterviews: [
      { question: 'How does senior management demonstrate ongoing commitment to information security resources and budget?', evidenceToInspect: 'CISO steering committee minutes, cybersecurity budget approval, and board reporting.' },
      { question: 'How are conflicting duties segregated within software development and cloud operations?', evidenceToInspect: 'CI/CD branch protection rules and ERP/Cloud IAM permission segregation matrices.' }
    ],
    requirements: [
      {
        code: '5.1',
        name: 'Leadership and commitment',
        text: 'Top management shall demonstrate leadership and commitment with respect to the ISMS by ensuring the information security policy and objectives are established.',
        auditCheck: 'Review C-suite steering committee meeting minutes, budget allocations for cybersecurity, and board resolutions.',
        status: 'Compliant',
        linkedControls: ['A.5.1', 'A.5.4'],
        mandatoryArtifacts: ['ISMS Steering Committee Charter & Minutes', 'Approved Information Security Budget']
      },
      {
        code: '5.2',
        name: 'Policy',
        text: 'Top management shall establish an information security policy that is appropriate to the purpose of the organization and includes a commitment to satisfy applicable requirements.',
        auditCheck: 'Review signed Information Security Policy v2.1 with workforce acknowledgement logs.',
        status: 'Compliant',
        linkedControls: ['A.5.1'],
        mandatoryArtifacts: ['Signed Master Information Security Policy v2.1', 'Staff Policy Acknowledgement Verification (>95%)']
      },
      {
        code: '5.3',
        name: 'Organizational roles, responsibilities and authorities',
        text: 'Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated.',
        auditCheck: 'Inspect CISO Charter, Information Security Officer job descriptions, and Incident Response Team organogram.',
        status: 'Compliant',
        linkedControls: ['A.5.2', 'A.5.3'],
        mandatoryArtifacts: ['CISO Appointment Letter & Charter', 'Segregation of Duties (SoD) Audit Report']
      }
    ]
  },
  {
    number: '6',
    title: 'Planning & Risk Management',
    shortTitle: 'Planning',
    description: 'Enterprise risk assessment criteria, threat modeling, Statement of Applicability (SoA) baseline, and measurable security objectives.',
    icon: Compass,
    accentColor: 'purple',
    linkedControlCodes: ['A.5.8', 'A.5.15', 'A.5.18', 'A.8.1', 'A.8.20', 'A.8.24'],
    mandatoryEvidenceChecklist: [
      { title: 'Enterprise Risk Assessment Methodology & 5x5 Scoring Criteria', description: 'Asset, process, vendor, and regulatory risk scoring criteria with appetite thresholds.', controlCode: 'A.5.8' },
      { title: 'Master ISMS Risk Register with Inherent & Residual Scoring', description: 'Comprehensive risk catalog with assigned treatment owners and mitigation controls.', controlCode: 'A.5.15' },
      { title: 'Cryptographically Locked Statement of Applicability (SoA)', description: 'All 93 Annex A controls with inclusion/exclusion justifications and implementation statuses.', controlCode: 'A.5.18' },
      { title: 'Measurable Information Security Objectives & KPI Scorecard', description: 'Quantifiable targets (e.g. 99.95% uptime, 0 unpatched critical CVEs, 100% training).', controlCode: 'A.8.20' }
    ],
    auditorKeyInterviews: [
      { question: 'What criteria does the organization use to determine whether a risk is acceptable or requires treatment?', evidenceToInspect: 'Risk Assessment Methodology Section 4 (Risk Acceptance Thresholds & Scoring Matrix).' },
      { question: 'How was the Statement of Applicability derived from the risk treatment plan, and who signed off on exclusions?', evidenceToInspect: 'SoA cryptographic baseline lock and risk treatment mapping logs.' }
    ],
    requirements: [
      {
        code: '6.1.1',
        name: 'General actions to address risks and opportunities',
        text: 'When planning for the ISMS, the organization shall consider the issues referred to in 4.1 and 4.2 and determine the risks and opportunities that need to be addressed.',
        auditCheck: 'Inspect Enterprise Risk Assessment Methodology with 5x5 Likelihood/Impact matrices.',
        status: 'Compliant',
        linkedControls: ['A.5.8'],
        mandatoryArtifacts: ['Risk Assessment Methodology Document', 'Risk Appetite & Tolerance Thresholds']
      },
      {
        code: '6.1.2',
        name: 'Information security risk assessment',
        text: 'The organization shall define and apply an information security risk assessment process that establishes and maintains risk criteria and produces consistent, valid results.',
        auditCheck: 'Verify master risk register containing asset-based risk scoring and threat catalogs.',
        status: 'Compliant',
        linkedControls: ['A.5.15', 'A.8.1'],
        mandatoryArtifacts: ['Master ISMS Risk Register', 'Asset & Vulnerability Threat Mapping Matrix']
      },
      {
        code: '6.1.3',
        name: 'Information security risk treatment & Statement of Applicability',
        text: 'The organization shall define and apply an information security risk treatment process to select appropriate risk treatment options and produce a Statement of Applicability (SoA).',
        auditCheck: 'Verify locked Statement of Applicability baseline containing all 93 controls with inclusion justifications.',
        status: 'Compliant',
        linkedControls: ['A.5.18', 'A.8.24'],
        mandatoryArtifacts: ['Statement of Applicability (SoA) Cryptographic Baseline', 'Risk Treatment Action Plans & Residual Score Logs']
      },
      {
        code: '6.2',
        name: 'Information security objectives and planning to achieve them',
        text: 'The organization shall establish information security objectives at relevant functions and levels. Objectives shall be measurable and monitored.',
        auditCheck: 'Review quantitative KPI scorecard (99.95% uptime, 0 critical unpatched vulnerabilities, 100% staff training).',
        status: 'Compliant',
        linkedControls: ['A.8.20'],
        mandatoryArtifacts: ['Annual Information Security Objectives & KPI Dashboard', 'Objective Progress Tracking Log']
      }
    ]
  },
  {
    number: '7',
    title: 'Support & Awareness',
    shortTitle: 'Support',
    description: 'Human resources competence, cybersecurity training and awareness campaigns, resource allocation, and documented information control.',
    icon: Headphones,
    accentColor: 'emerald',
    linkedControlCodes: ['A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.5.37', 'A.7.1', 'A.7.2'],
    mandatoryEvidenceChecklist: [
      { title: 'Workforce Security Awareness Training Completion Records (>95%)', description: 'Curriculum completion logs and simulated phishing exercise metrics.', controlCode: 'A.6.3' },
      { title: 'Key Personnel Competency Matrix & Professional Certifications', description: 'CISSP, CISM, AWS Security, and specialized role qualification logs.', controlCode: 'A.6.2' },
      { title: 'Document Control Register & Controlled Information Lifecycle Procedure', description: 'Version-controlled document repository with mandatory review frequencies.', controlCode: 'A.5.37' },
      { title: 'Pre-Employment Screening & Non-Disclosure Agreement (NDA) Dossiers', description: 'Background checks and signed confidentiality clauses for all workforce members.', controlCode: 'A.6.1' }
    ],
    auditorKeyInterviews: [
      { question: 'What actions are taken when an employee fails a simulated phishing campaign multiple times?', evidenceToInspect: 'Phishing simulation remediation workflow and mandatory refresher training logs.' },
      { question: 'How do you ensure all documented procedures remain valid and updated after system changes?', evidenceToInspect: 'Document Control Register with annual review stamps and Annex A 5.37 logs.' }
    ],
    requirements: [
      {
        code: '7.1 & 7.2',
        name: 'Resources & Competence',
        text: 'Determine and provide resources needed for the ISMS. Ensure persons doing work under its control are competent on the basis of education, training, or experience.',
        auditCheck: 'Verify security engineer certifications (CISSP, CISM, AWS Security) and dedicated training budget.',
        status: 'Compliant',
        linkedControls: ['A.6.1', 'A.6.2'],
        mandatoryArtifacts: ['Information Security Competency Matrix', 'Technical Team Certifications Portfolio']
      },
      {
        code: '7.3',
        name: 'Awareness',
        text: 'Persons doing work under the organization control shall be aware of the information security policy, their contribution to ISMS effectiveness, and implications of non-conformity.',
        auditCheck: 'Review annual security awareness training completion records (>95% completion rate) and phishing simulation stats.',
        status: 'Compliant',
        linkedControls: ['A.6.3'],
        mandatoryArtifacts: ['LMS Security Awareness Training Completion Logs', 'Simulated Phishing Drill Results & Failure Remediation']
      },
      {
        code: '7.5',
        name: 'Documented information',
        text: 'The ISMS shall include documented information required by this standard and determined by the organization as necessary for effectiveness.',
        auditCheck: 'Inspect version-controlled Document Register with approval workflows and access permissions.',
        status: 'Compliant',
        linkedControls: ['A.5.37'],
        mandatoryArtifacts: ['Controlled Document Register with Lifecycle Statuses', 'Document Review & Approval Audit Trails']
      }
    ]
  },
  {
    number: '8',
    title: 'Operation & Technical Security',
    shortTitle: 'Operation',
    description: 'Operational security controls, secure software development lifecycle (SDLC), vulnerability remediation, and backup operations.',
    icon: Sliders,
    accentColor: 'cyan',
    linkedControlCodes: ['A.8.2', 'A.8.7', 'A.8.8', 'A.8.9', 'A.8.10', 'A.8.12', 'A.8.13', 'A.8.14', 'A.8.25', 'A.8.28', 'A.8.31', 'A.5.23'],
    mandatoryEvidenceChecklist: [
      { title: 'CI/CD Automated Security Gating (SAST, DAST, Container Scan)', description: 'Automated pipeline blocking for critical/high vulnerabilities before production deploy.', controlCode: 'A.8.25' },
      { title: 'Monthly Vulnerability Scanning & Penetration Test Remediation Dossiers', description: 'Internal & external vulnerability scan logs with SLA compliance verification.', controlCode: 'A.8.8' },
      { title: 'Cloud Infrastructure Immutable Backup Snapshotting & Restoration Drill', description: 'RTO/RPO drill records proving data recovery within designated recovery windows.', controlCode: 'A.8.13' },
      { title: 'Separation of Environments & Zero-Trust Cloud Access Telemetry', description: 'Strict network and IAM segregation between dev, test, and production workloads.', controlCode: 'A.8.31' }
    ],
    auditorKeyInterviews: [
      { question: 'Can you show evidence of the most recent backup restoration test including duration and verification?', evidenceToInspect: 'Quarterly Backup Restoration Drill Log with hash verification and RTO benchmark.' },
      { question: 'How is code peer review and branch protection enforced in the development pipeline?', evidenceToInspect: 'GitHub/GitLab branch protection rules with mandatory 2-person approval requirements.' }
    ],
    requirements: [
      {
        code: '8.1',
        name: 'Operational planning and control',
        text: 'The organization shall plan, implement and control the processes needed to meet information security requirements and to implement the actions determined in Clause 6.',
        auditCheck: 'Check DevOps CI/CD security gating, automated SAST/DAST pipeline integration, and infrastructure change logs.',
        status: 'Compliant',
        linkedControls: ['A.8.25', 'A.8.28', 'A.8.31', 'A.5.23'],
        mandatoryArtifacts: ['CI/CD Pipeline Security Gating Configuration', 'Production Change Management Audit Logs']
      },
      {
        code: '8.2 & 8.3',
        name: 'Information security risk assessment & treatment execution',
        text: 'The organization shall perform information security risk assessments at planned intervals or when significant changes occur, and implement risk treatment plans.',
        auditCheck: 'Review risk register review history logs, vulnerability remediation timelines, and CAPA closure tickets.',
        status: 'Compliant',
        linkedControls: ['A.8.8', 'A.8.13', 'A.8.14'],
        mandatoryArtifacts: ['Vulnerability Remediation SLA Compliance Dashboard', 'Disaster Recovery Restoration Drill Report']
      }
    ]
  },
  {
    number: '9',
    title: 'Performance Evaluation',
    shortTitle: 'Evaluation',
    description: 'SIEM logging and monitoring, independent internal audits (Cl. 9.2), and executive Management Review Meetings (Cl. 9.3).',
    icon: Activity,
    accentColor: 'amber',
    linkedControlCodes: ['A.8.15', 'A.8.16', 'A.8.17', 'A.5.35', 'A.5.36'],
    mandatoryEvidenceChecklist: [
      { title: 'SIEM Centralized Log Aggregation & 24/7 Threat Monitoring Configuration', description: 'NTP-synchronized audit logs preserved in immutable write-once storage.', controlCode: 'A.8.15' },
      { title: 'Annual ISMS Internal Audit Schedule, Workpapers & Final Report (Cl. 9.2)', description: 'Auditor independence confirmation, sampled control checks, and raised findings.', controlCode: 'A.5.35' },
      { title: 'Clause 9.3 Management Review Meeting (MRM) Minutes & Executive Sign-Off', description: 'Comprehensive review of all 10 Clause 9.3.2 mandatory agenda inputs.', controlCode: 'A.5.36' },
      { title: 'ISMS Key Performance Indicator (KPI) Quarterly Performance Review', description: 'Metrics covering incident rates, SLA attainment, and training compliance.', controlCode: 'A.8.16' }
    ],
    auditorKeyInterviews: [
      { question: 'How do you demonstrate that internal auditors were independent from the areas they audited?', evidenceToInspect: 'Internal Audit Plan lead auditor assignment letter and organizational independence matrix.' },
      { question: 'Did the Clause 9.3 Management Review cover all mandatory agenda inputs including audit results and risk assessment changes?', evidenceToInspect: 'Signed MRM Meeting Minutes with agenda item checkoff matrix.' }
    ],
    requirements: [
      {
        code: '9.1',
        name: 'Monitoring, measurement, analysis and evaluation',
        text: 'The organization shall evaluate the information security performance and the effectiveness of the ISMS.',
        auditCheck: 'Review SIEM metrics, vulnerability scanning logs, and quarterly SLA reporting.',
        status: 'Compliant',
        linkedControls: ['A.8.15', 'A.8.16'],
        mandatoryArtifacts: ['SIEM Audit Logging & Alerting Baseline', 'Quarterly Security Metric Evaluation Dashboard']
      },
      {
        code: '9.2',
        name: 'Internal audit',
        text: 'The organization shall conduct internal audits at planned intervals to provide information on whether the ISMS conforms to requirements and is effectively implemented.',
        auditCheck: 'Inspect Internal Audit Schedule, auditor independence declarations, and formal internal audit reports.',
        status: 'In Progress',
        linkedControls: ['A.5.35'],
        mandatoryArtifacts: ['Annual Internal Audit Plan & Charter', 'Formal Internal Audit Working Papers & Findings Report']
      },
      {
        code: '9.3',
        name: 'Management review',
        text: 'Top management shall review the organization ISMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness.',
        auditCheck: 'Examine Management Review Meeting (MRM) agenda, minutes, and signed management action items.',
        status: 'Compliant',
        linkedControls: ['A.5.36'],
        mandatoryArtifacts: ['Signed Management Review Meeting (MRM) Minutes v2026', 'Executive Action Item Commitment Tracker']
      }
    ]
  },
  {
    number: '10',
    title: 'Improvement & CAPA',
    shortTitle: 'Improvement',
    description: 'Continual improvement mechanisms, nonconformity management, 5-Whys root cause analysis, and corrective action implementation.',
    icon: TrendingUp,
    accentColor: 'rose',
    linkedControlCodes: ['A.5.24', 'A.5.25', 'A.5.26', 'A.5.27', 'A.5.28'],
    mandatoryEvidenceChecklist: [
      { title: 'Corrective Action & Preventive Action (CAPA) Register', description: 'Centralized nonconformity tracking with verified remediation evidence attachments.', controlCode: 'A.5.24' },
      { title: 'Root Cause Analysis (5-Whys / Fishbone) Investigation Records', description: 'Structured causal analysis preventing recurrence of audit nonconformities.', controlCode: 'A.5.27' },
      { title: 'Security Incident Response Post-Mortems & Lessons Learned', description: 'Post-incident corrective enhancements and runbook updates.', controlCode: 'A.5.26' },
      { title: 'Annual ISMS Continual Improvement Roadmap & Maturity Targets', description: 'Measurable multi-year capability enhancements approved by leadership.', controlCode: 'A.5.25' }
    ],
    auditorKeyInterviews: [
      { question: 'Can you demonstrate a closed corrective action where root cause was validated and tested for non-recurrence?', evidenceToInspect: 'CAPA closure ticket with 5-Whys evidence and auditor sign-off.' },
      { question: 'How are lessons learned from security incidents converted into preventive policy or technical updates?', evidenceToInspect: 'Incident post-mortem reports with cross-referenced task tickets in Jira.' }
    ],
    requirements: [
      {
        code: '10.1',
        name: 'Continual improvement',
        text: 'The organization shall continually improve the suitability, adequacy and effectiveness of the ISMS.',
        auditCheck: 'Review annual maturity improvement roadmap and post-incident lessons learned implementations.',
        status: 'Compliant',
        linkedControls: ['A.5.25', 'A.5.27'],
        mandatoryArtifacts: ['Continual Improvement Maturity Roadmap', 'Security Enhancement Program Deliverables']
      },
      {
        code: '10.2',
        name: 'Nonconformity and corrective action (CAPA)',
        text: 'When a nonconformity occurs, the organization shall react to the nonconformity, evaluate the need for action to eliminate the cause, and implement any action needed.',
        auditCheck: 'Review CAPA ticket register, root-cause 5-Whys documentation, and verification of corrective actions.',
        status: 'Compliant',
        linkedControls: ['A.5.24', 'A.5.26', 'A.5.28'],
        mandatoryArtifacts: ['Master Corrective Action (CAPA) Register', 'Root Cause Investigation Worksheets (5-Whys)']
      }
    ]
  }
];

export const ISO27001ClausesModule: React.FC = () => {
  const { currentTenant, controls, evidence, setActiveModule } = useGRC();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClauseFilter, setSelectedClauseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clausesState, setClausesState] = useState<MajorClauseGroup[]>(INITIAL_CLAUSES_DATA);

  // View mode tab: 'clauses' (detailed 7 HLS clause groups) vs 'evidence_matrix' (all requirements progress tracker matrix)
  const [activeViewMode, setActiveViewMode] = useState<'clauses' | 'evidence_matrix'>('clauses');
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'ready' | 'substantial' | 'in_progress' | 'gap'>('all');
  const [evidenceSort, setEvidenceSort] = useState<'clause' | 'score_desc' | 'score_asc'>('clause');

  // Inspector modal state
  const [inspectingClause, setInspectingClause] = useState<MajorClauseGroup | null>(null);
  const [inspectorActiveTab, setInspectorActiveTab] = useState<'controls' | 'evidence' | 'interviews'>('controls');

  // Filter effective controls for current tenant
  const tenantControls = useMemo(() => {
    const list = controls.filter(c => !c.framework || c.framework.includes('27001'));
    return list.length > 0 ? list : MASTER_ISO27001_CONTROLS.map((c, i) => ({ ...c, id: `ctrl_demo_27k_${i}` } as ControlItem));
  }, [controls]);

  // Tenant evidence
  const tenantEvidence = useMemo(() => {
    if (!currentTenant) return evidence;
    const te = evidence.filter(e => e.tenantId === currentTenant.id);
    return te.length > 0 ? te : evidence;
  }, [evidence, currentTenant]);

  // Compute live clause metrics based on linked controls and evidence
  const clauseMetrics = useMemo(() => {
    return clausesState.map(clause => {
      // 1. Linked Controls Calculation
      const linkedCtrls = tenantControls.filter(c =>
        clause.linkedControlCodes.includes(c.controlCode) ||
        clause.linkedControlCodes.some(code => c.controlCode.startsWith(code))
      );

      const applicableCtrls = linkedCtrls.filter(c => c.applicable !== false);
      const implementedCtrls = applicableCtrls.filter(
        c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited' || c.implementationStatus === 'Monitored'
      );
      const inProgressCtrls = applicableCtrls.filter(c => c.implementationStatus === 'In Progress');

      const controlScore = applicableCtrls.length > 0
        ? Math.min(100, Math.round(((implementedCtrls.length + inProgressCtrls.length * 0.5) / applicableCtrls.length) * 100))
        : 90;

      // 2. Linked Evidence Calculation
      const linkedEvid = tenantEvidence.filter(e =>
        clause.linkedControlCodes.includes(e.controlCode) ||
        e.tags?.some(t => t.toLowerCase().includes(`clause ${clause.number}`) || t.toLowerCase().includes(`cl. ${clause.number}`)) ||
        clause.mandatoryEvidenceChecklist.some(art =>
          e.title.toLowerCase().includes(art.title.toLowerCase().slice(0, 15)) ||
          e.controlCode === art.controlCode
        )
      );

      const verifiedEvid = linkedEvid.filter(e => e.status === 'Verified');
      const pendingEvid = linkedEvid.filter(e => e.status === 'Pending Review');

      // Evidence score calculated against mandatory checklist coverage
      const targetEvidenceBaseline = Math.max(clause.mandatoryEvidenceChecklist.length, 3);
      const verifiedScore = Math.min(100, (verifiedEvid.length / targetEvidenceBaseline) * 100);
      const coverageScore = Math.min(100, (linkedEvid.length / targetEvidenceBaseline) * 100);
      const evidenceScore = Math.min(100, Math.round(verifiedScore * 0.7 + coverageScore * 0.3));

      // 3. Clause Audit Requirements Compliance Calculation
      const totalReqs = clause.requirements.length;
      const compliantReqs = clause.requirements.filter(r => r.status === 'Compliant').length;
      const inProgressReqs = clause.requirements.filter(r => r.status === 'In Progress').length;
      const requirementsScore = totalReqs > 0
        ? Math.round(((compliantReqs + inProgressReqs * 0.5) / totalReqs) * 100)
        : 100;

      // 4. Composite Completion Percentage (Weighted: 45% Controls, 35% Evidence, 20% Requirements)
      const completionPercentage = Math.min(100, Math.max(0, Math.round(
        controlScore * 0.45 +
        evidenceScore * 0.35 +
        requirementsScore * 0.20
      )));

      // Audit readiness classification
      let readinessPill = { label: 'Action Required', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' };
      if (completionPercentage >= 90) {
        readinessPill = { label: 'Stage 1 & 2 Ready', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' };
      } else if (completionPercentage >= 75) {
        readinessPill = { label: 'Substantially Conforming', bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/30' };
      } else if (completionPercentage >= 50) {
        readinessPill = { label: 'Remediation Active', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' };
      }

      return {
        clause,
        completionPercentage,
        controlScore,
        evidenceScore,
        requirementsScore,
        readinessPill,
        applicableCtrls,
        implementedCtrls,
        inProgressCtrls,
        linkedEvid,
        verifiedEvid,
        pendingEvid,
        compliantReqs,
        totalReqs
      };
    });
  }, [clausesState, tenantControls, tenantEvidence]);

  // Overall aggregate completion score across Clauses 4-10
  const overallClausesScore = useMemo(() => {
    if (clauseMetrics.length === 0) return 0;
    const sum = clauseMetrics.reduce((acc, cm) => acc + cm.completionPercentage, 0);
    return Math.round(sum / clauseMetrics.length);
  }, [clauseMetrics]);

  // Executive summary of all 27 ISO 27001 requirements evidence completion
  const requirementsEvidenceSummary = useMemo(() => {
    let total = 0;
    let stageReady = 0;
    let substantial = 0;
    let inProgress = 0;
    let criticalGap = 0;
    let scoreSum = 0;

    const allReqs: Array<{
      clauseNumber: string;
      clauseTitle: string;
      requirement: ClauseRequirement;
      calculation: ReturnType<typeof calculateRequirementEvidencePresence>;
    }> = [];

    clausesState.forEach(clause => {
      clause.requirements.forEach(req => {
        total++;
        const calc = calculateRequirementEvidencePresence(req, clause.number, tenantEvidence, tenantControls);
        scoreSum += calc.percentage;
        if (calc.readinessLevel === 'STAGE_READY') stageReady++;
        else if (calc.readinessLevel === 'SUBSTANTIAL') substantial++;
        else if (calc.readinessLevel === 'IN_PROGRESS') inProgress++;
        else criticalGap++;

        allReqs.push({
          clauseNumber: clause.number,
          clauseTitle: clause.title,
          requirement: req,
          calculation: calc
        });
      });
    });

    const averageScore = total > 0 ? Math.round(scoreSum / total) : 0;

    return {
      total,
      stageReady,
      substantial,
      inProgress,
      criticalGap,
      averageScore,
      allReqs
    };
  }, [clausesState, tenantEvidence, tenantControls]);

  // Filtered and sorted list of requirements for Evidence Progress Matrix
  const filteredEvidenceMatrix = useMemo(() => {
    return requirementsEvidenceSummary.allReqs.filter(item => {
      if (selectedClauseFilter !== 'all' && item.clauseNumber !== selectedClauseFilter) {
        return false;
      }
      if (evidenceFilter === 'ready' && item.calculation.readinessLevel !== 'STAGE_READY') return false;
      if (evidenceFilter === 'substantial' && item.calculation.readinessLevel !== 'SUBSTANTIAL') return false;
      if (evidenceFilter === 'in_progress' && item.calculation.readinessLevel !== 'IN_PROGRESS') return false;
      if (evidenceFilter === 'gap' && item.calculation.readinessLevel !== 'CRITICAL_GAP') return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          item.requirement.code.toLowerCase().includes(term) ||
          item.requirement.name.toLowerCase().includes(term) ||
          item.clauseTitle.toLowerCase().includes(term) ||
          item.requirement.mandatoryArtifacts.some(a => a.toLowerCase().includes(term)) ||
          item.requirement.linkedControls.some(c => c.toLowerCase().includes(term))
        );
      }
      return true;
    }).sort((a, b) => {
      if (evidenceSort === 'score_desc') return b.calculation.percentage - a.calculation.percentage;
      if (evidenceSort === 'score_asc') return a.calculation.percentage - b.calculation.percentage;
      return a.requirement.code.localeCompare(b.requirement.code, undefined, { numeric: true });
    });
  }, [requirementsEvidenceSummary.allReqs, selectedClauseFilter, evidenceFilter, evidenceSort, searchTerm]);

  // Toggle requirement status
  const handleToggleRequirementStatus = (clauseNumber: string, reqCode: string) => {
    setClausesState(prev => prev.map(clause => {
      if (clause.number !== clauseNumber) return clause;
      return {
        ...clause,
        requirements: clause.requirements.map(req => {
          if (req.code !== reqCode) return req;
          const nextStatus: ClauseRequirement['status'] =
            req.status === 'Compliant' ? 'In Progress' :
            req.status === 'In Progress' ? 'Action Required' : 'Compliant';
          return { ...req, status: nextStatus };
        })
      };
    }));
  };

  // Filter clauses based on selection and search
  const filteredClauses = useMemo(() => {
    return clauseMetrics.filter(cm => {
      if (selectedClauseFilter !== 'all' && cm.clause.number !== selectedClauseFilter) {
        return false;
      }
      return true;
    }).map(cm => {
      const filteredReqs = cm.clause.requirements.filter(req => {
        if (statusFilter !== 'all' && req.status !== statusFilter) {
          return false;
        }
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          req.code.toLowerCase().includes(term) ||
          req.name.toLowerCase().includes(term) ||
          req.text.toLowerCase().includes(term) ||
          req.auditCheck.toLowerCase().includes(term) ||
          req.linkedControls.some(c => c.toLowerCase().includes(term)) ||
          cm.clause.title.toLowerCase().includes(term)
        );
      });

      return {
        ...cm,
        filteredRequirements: filteredReqs
      };
    }).filter(cm => cm.filteredRequirements.length > 0 || (searchTerm === '' && statusFilter === 'all'));
  }, [clauseMetrics, selectedClauseFilter, statusFilter, searchTerm]);

  // Export audit checklist to CSV
  const handleExportChecklistCSV = () => {
    const headers = [
      'Clause Number',
      'Clause Title',
      'Requirement Code',
      'Requirement Name',
      'Requirement Text',
      'Compliance Status',
      'External Auditor Check',
      'Linked Annex A Controls',
      'Mandatory Artifacts'
    ];

    const rows: string[][] = [];
    clausesState.forEach(clause => {
      clause.requirements.forEach(req => {
        rows.push([
          `"Clause ${clause.number}"`,
          `"${clause.title}"`,
          `"${req.code}"`,
          `"${req.name}"`,
          `"${req.text.replace(/"/g, '""')}"`,
          `"${req.status}"`,
          `"${req.auditCheck.replace(/"/g, '""')}"`,
          `"${req.linkedControls.join(', ')}"`,
          `"${req.mandatoryArtifacts.join(' | ')}"`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO_27001_Clauses_4-10_Checklist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer id="iso27001-clauses-module">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>ISO/IEC 27001:2022 ISMS</span>
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 font-mono">
                Clauses 4.1 – 10.2 (HLS Core Structure)
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium">
                Stage 1 & Stage 2 Audit Ready
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              ISMS Mandatory Clauses 4 – 10 Governance Radar
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time audit completion tracking for all 7 Harmonized Structure (HLS) management clauses.
              Radial completion indicators dynamically compute progress based on <strong>linked Annex A controls implementation</strong> and <strong>verified audit evidence artifacts</strong>.
            </p>
          </div>

          {/* Right Side Aggregate Score & Actions */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
            <RadialProgressIndicator
              value={overallClausesScore}
              size={76}
              strokeWidth={7}
              colorVariant="auto"
              showPercentage={true}
            />
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall ISMS Clauses</div>
              <div className="text-base font-bold text-white flex items-center space-x-2">
                <span>{overallClausesScore}% Complete</span>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>7 Clause Groups Active</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800 hidden sm:block" />

            {/* Evidence Coverage KPI */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <FileCheck2 className="w-3 h-3 text-sky-400" />
                <span>Evidence Coverage</span>
              </div>
              <div className="text-base font-bold text-white flex items-center space-x-1.5 font-mono">
                <span className="text-sky-400">{requirementsEvidenceSummary.averageScore}%</span>
                <span className="text-xs text-slate-400 font-sans font-normal">
                  ({requirementsEvidenceSummary.stageReady}/{requirementsEvidenceSummary.total} Ready)
                </span>
              </div>
              <div className="w-28 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                  style={{ width: `${requirementsEvidenceSummary.averageScore}%` }}
                />
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800 hidden sm:block" />

            <div className="flex flex-col gap-2">
              <button
                id="export-clauses-csv-btn"
                onClick={handleExportChecklistCSV}
                className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                title="Export ISO 27001 Clauses Checklist CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Checklist CSV</span>
              </button>

              <button
                id="view-soa-nav-btn"
                onClick={() => setActiveModule('statement_of_applicability')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-all"
                title="Jump to Statement of Applicability"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>SoA Matrix (Cl. 6.1.3)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE TABS: Clauses Group View vs Evidence Progress Matrix View */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
        <div className="flex items-center space-x-2">
          <button
            id="tab-view-clauses"
            onClick={() => setActiveViewMode('clauses')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
              activeViewMode === 'clauses'
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Clause Group Sections (Clauses 4 – 10)</span>
          </button>

          <button
            id="tab-view-evidence-matrix"
            onClick={() => setActiveViewMode('evidence_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
              activeViewMode === 'evidence_matrix'
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Evidence Progress Matrix ({requirementsEvidenceSummary.total} Requirements)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-[11px] font-mono border border-slate-800">
              {requirementsEvidenceSummary.averageScore}%
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 px-2">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{requirementsEvidenceSummary.stageReady} Ready</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1.5 text-amber-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{requirementsEvidenceSummary.inProgress + requirementsEvidenceSummary.substantial} In Progress</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1.5 text-rose-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{requirementsEvidenceSummary.criticalGap} Gaps</span>
          </span>
        </div>
      </div>

      {/* RADIAL PROGRESS INDICATORS RADAR GRID (7 MAJOR CLAUSE GROUPS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Clause Group Completion Radar (Controls & Evidence Linked)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click any card to filter requirements or inspect linked artifacts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {clauseMetrics.map(cm => {
            const isSelected = selectedClauseFilter === cm.clause.number;
            const Icon = cm.clause.icon;

            return (
              <button
                key={cm.clause.number}
                id={`clause-card-${cm.clause.number}`}
                onClick={() => {
                  if (selectedClauseFilter === cm.clause.number) {
                    setSelectedClauseFilter('all');
                  } else {
                    setSelectedClauseFilter(cm.clause.number);
                  }
                }}
                className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row: Clause pill and icon */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 font-mono font-bold text-[11px] border border-slate-700">
                    Clause {cm.clause.number}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Center: Radial Progress Indicator */}
                <div className="my-2 flex flex-col items-center justify-center w-full">
                  <RadialProgressIndicator
                    value={cm.completionPercentage}
                    size={68}
                    strokeWidth={6}
                    colorVariant="auto"
                    showPercentage={true}
                  />
                  <h3 className="mt-2 text-xs font-bold text-white text-center leading-tight line-clamp-1">
                    {cm.clause.shortTitle}
                  </h3>
                  <div className="text-[10px] text-slate-400 text-center line-clamp-1">
                    {cm.clause.title}
                  </div>
                </div>

                {/* Footer metrics: Controls & Evidence breakdown */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 w-full space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Shield className="w-3 h-3 text-sky-400" />
                      <span>Controls:</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      {cm.implementedCtrls.length}/{cm.applicableCtrls.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <FileCheck2 className="w-3 h-3 text-emerald-400" />
                      <span>Evidence:</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-200">
                      {cm.verifiedEvid.length}/{cm.clause.mandatoryEvidenceChecklist.length}
                    </span>
                  </div>

                  {/* Readiness status pill */}
                  <div className={`mt-1 text-center py-0.5 px-1.5 rounded text-[9px] font-semibold border ${cm.readinessPill.bg} ${cm.readinessPill.text} ${cm.readinessPill.border}`}>
                    {cm.readinessPill.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Filters, Search, and Active Selection Pill */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Clause:</span>
          </span>

          <button
            id="filter-clause-all"
            onClick={() => setSelectedClauseFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedClauseFilter === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Clauses (4 – 10)
          </button>

          {clausesState.map(c => (
            <button
              key={c.number}
              id={`filter-clause-${c.number}`}
              onClick={() => setSelectedClauseFilter(c.number)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedClauseFilter === c.number
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cl. {c.number}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            id="filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="Compliant">Compliant Only</option>
            <option value="In Progress">In Progress Only</option>
            <option value="Action Required">Action Required Only</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="clause-search-input"
              type="text"
              placeholder="Search clause, check, control..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW RENDERING: EVIDENCE MATRIX OR CLAUSES SECTIONS */}
      {activeViewMode === 'evidence_matrix' ? (
        <div className="space-y-6">
          {/* Executive Overview Cards for Evidence Presence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Average Evidence Presence</span>
                <FileCheck2 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {requirementsEvidenceSummary.averageScore}%
                </span>
                <span className="text-xs text-slate-400">across 27 requirements</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                  style={{ width: `${requirementsEvidenceSummary.averageScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-emerald-400">Stage Ready (90-100%)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold font-mono text-emerald-300">
                  {requirementsEvidenceSummary.stageReady}
                </span>
                <span className="text-xs text-slate-400">/ {requirementsEvidenceSummary.total} Requirements</span>
              </div>
              <p className="text-[11px] text-slate-400">Fully documented and verified audit evidence on file.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-amber-400">In Progress / Partial (40-89%)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold font-mono text-amber-300">
                  {requirementsEvidenceSummary.substantial + requirementsEvidenceSummary.inProgress}
                </span>
                <span className="text-xs text-slate-400">/ {requirementsEvidenceSummary.total} Requirements</span>
              </div>
              <p className="text-[11px] text-slate-400">Artifacts pending formal review or secondary proofs needed.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-rose-400">Missing Evidence Gaps (&lt;40%)</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold font-mono text-rose-300">
                  {requirementsEvidenceSummary.criticalGap}
                </span>
                <span className="text-xs text-slate-400">/ {requirementsEvidenceSummary.total} Requirements</span>
              </div>
              <p className="text-[11px] text-slate-400">Immediate external auditor finding risk; evidence collection needed.</p>
            </div>
          </div>

          {/* Evidence Matrix Filter & Sort Sub-bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Evidence Filter:</span>
              </span>

              <button
                onClick={() => setEvidenceFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  evidenceFilter === 'all'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({requirementsEvidenceSummary.total})
              </button>
              <button
                onClick={() => setEvidenceFilter('ready')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  evidenceFilter === 'ready'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Ready ({requirementsEvidenceSummary.stageReady})
              </button>
              <button
                onClick={() => setEvidenceFilter('substantial')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  evidenceFilter === 'substantial'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Substantial ({requirementsEvidenceSummary.substantial})
              </button>
              <button
                onClick={() => setEvidenceFilter('in_progress')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  evidenceFilter === 'in_progress'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                In Review ({requirementsEvidenceSummary.inProgress})
              </button>
              <button
                onClick={() => setEvidenceFilter('gap')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  evidenceFilter === 'gap'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Gaps ({requirementsEvidenceSummary.criticalGap})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort by:</span>
                <select
                  value={evidenceSort}
                  onChange={(e) => setEvidenceSort(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="clause">Clause Number (4.1 → 10.2)</option>
                  <option value="score_asc">Completion % (Lowest First - Gaps)</option>
                  <option value="score_desc">Completion % (Highest First)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid of All Requirements with Visual Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidenceMatrix.map(item => (
              <div
                key={item.requirement.code}
                id={`matrix-req-card-${item.requirement.code.replace('.', '-')}`}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-3 flex flex-col justify-between transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
                      Clause {item.requirement.code}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[160px]" title={item.clauseTitle}>
                      {item.clauseTitle}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {item.requirement.name}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {item.requirement.text}
                  </p>
                </div>

                {/* Embedded Visual Progress Tracking Component */}
                <div className="pt-2 border-t border-slate-800/80">
                  <ClauseRequirementProgressTracker
                    requirement={item.requirement}
                    clauseNumber={item.clauseNumber}
                    clauseTitle={item.clauseTitle}
                    evidenceList={tenantEvidence}
                    controlsList={tenantControls}
                    variant="card"
                    onNavigateToEvidenceCentre={() => setActiveModule('evidence_centre')}
                  />
                </div>
              </div>
            ))}
          </div>

          {filteredEvidenceMatrix.length === 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Requirements Found Matching Criteria</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No ISO 27001 requirements match your current filters. Try resetting your filter to "All".
              </p>
              <button
                onClick={() => {
                  setEvidenceFilter('all');
                  setSelectedClauseFilter('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Reset Evidence Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* DETAILED CLAUSES SECTIONS */
        <div className="space-y-6">
        {filteredClauses.map(cm => {
          const clause = cm.clause;
          const Icon = clause.icon;

          return (
            <div
              key={clause.number}
              id={`section-clause-${clause.number}`}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg relative overflow-hidden"
            >
              {/* Clause Header with Section Radial Progress Indicator */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-4">
                  {/* Radial Progress Indicator for this Clause Section */}
                  <div className="flex-shrink-0">
                    <RadialProgressIndicator
                      value={cm.completionPercentage}
                      size={58}
                      strokeWidth={6}
                      colorVariant="auto"
                      showPercentage={true}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono font-bold text-xs border border-sky-500/30">
                        Clause {clause.number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cm.readinessPill.bg} ${cm.readinessPill.text} ${cm.readinessPill.border}`}>
                        {cm.readinessPill.label}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                      <span>{clause.title}</span>
                    </h2>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                      {clause.description}
                    </p>
                  </div>
                </div>

                {/* Quick Link & Inspector Action */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <div className="text-right hidden xl:block mr-2">
                    <div className="text-[10px] text-slate-400">Controls Implementation</div>
                    <div className="text-xs font-mono font-bold text-slate-200">
                      {cm.implementedCtrls.length} of {cm.applicableCtrls.length} Implemented ({cm.controlScore}%)
                    </div>
                  </div>

                  <button
                    id={`inspect-artifacts-btn-${clause.number}`}
                    onClick={() => {
                      setInspectingClause(clause);
                      setInspectorActiveTab('controls');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Linked Controls & Evidence ({cm.applicableCtrls.length + cm.linkedEvid.length})</span>
                  </button>
                </div>
              </div>

              {/* Requirements Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cm.filteredRequirements.map((req) => (
                  <div
                    key={req.code}
                    id={`requirement-card-${req.code.replace('.', '-')}`}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 flex flex-col justify-between hover:border-slate-700/80 transition-all"
                  >
                    <div className="space-y-2.5">
                      {/* Top code, name, and status toggle */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
                              {req.code}
                            </span>
                            <h3 className="text-xs font-bold text-white">{req.name}</h3>
                          </div>
                        </div>

                        {/* Interactive Status Pill */}
                        <button
                          id={`toggle-status-${req.code.replace('.', '-')}`}
                          onClick={() => handleToggleRequirementStatus(clause.number, req.code)}
                          title="Click to toggle status (Compliant -> In Progress -> Action Required)"
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold flex items-center space-x-1 transition-all border ${
                            req.status === 'Compliant'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : req.status === 'In Progress'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                        >
                          {req.status === 'Compliant' && <Check className="w-3 h-3 text-emerald-400" />}
                          {req.status === 'In Progress' && <Clock className="w-3 h-3 text-amber-400" />}
                          {req.status === 'Action Required' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          <span>{req.status}</span>
                        </button>
                      </div>

                      {/* Standard Requirement Text */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {req.text}
                      </p>

                      {/* Linked Controls Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 font-medium">Mapped Controls:</span>
                        {req.linkedControls.map(ctrlCode => {
                          const ctrl = tenantControls.find(c => c.controlCode === ctrlCode);
                          const isImpl = ctrl?.implementationStatus === 'Implemented' || ctrl?.implementationStatus === 'Audited';
                          return (
                            <span
                              key={ctrlCode}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                isImpl
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                              title={ctrl ? `${ctrl.title} (${ctrl.implementationStatus})` : ctrlCode}
                            >
                              {ctrlCode}
                            </span>
                          );
                        })}
                      </div>

                      {/* Visual Progress Tracking Component Based on Associated Evidence Presence */}
                      <div className="pt-2">
                        <ClauseRequirementProgressTracker
                          requirement={req}
                          clauseNumber={clause.number}
                          clauseTitle={clause.title}
                          evidenceList={tenantEvidence}
                          controlsList={tenantControls}
                          variant="card"
                          onNavigateToEvidenceCentre={() => setActiveModule('evidence_centre')}
                        />
                      </div>
                    </div>

                    {/* Auditor Verification Protocol Box */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 text-[11px] text-slate-400 space-y-1 mt-2">
                      <div className="flex items-center space-x-1.5 text-sky-400 font-semibold text-[10px] uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>External Auditor Verification Check:</span>
                      </div>
                      <p className="text-slate-300 leading-normal">{req.auditCheck}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredClauses.length === 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Clauses or Requirements Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your search term "{searchTerm}" did not match any requirements. Try clearing your filters or changing search keywords.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClauseFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
      )}

      {/* INSPECT LINKED CONTROLS & EVIDENCE MODAL */}
      {inspectingClause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-3">
                <RadialProgressIndicator
                  value={
                    clauseMetrics.find(cm => cm.clause.number === inspectingClause.number)?.completionPercentage || 85
                  }
                  size={48}
                  strokeWidth={5}
                  colorVariant="auto"
                  showPercentage={true}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                      Clause {inspectingClause.number}
                    </span>
                    <h3 className="text-base font-bold text-white">{inspectingClause.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Audit Artifact & Controls Inspector for ISO/IEC 27001:2022
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingClause(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center space-x-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setInspectorActiveTab('controls')}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
                  inspectorActiveTab === 'controls'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Linked Annex A Controls ({inspectingClause.linkedControlCodes.length})</span>
              </button>

              <button
                onClick={() => setInspectorActiveTab('evidence')}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
                  inspectorActiveTab === 'evidence'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Mandatory Evidence & Artifacts ({inspectingClause.mandatoryEvidenceChecklist.length})</span>
              </button>

              <button
                onClick={() => setInspectorActiveTab('interviews')}
                className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
                  inspectorActiveTab === 'interviews'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Auditor Interview Protocols</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {inspectorActiveTab === 'controls' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    The following Annex A controls are directly mapped to demonstrate operational compliance with <strong>Clause {inspectingClause.number}: {inspectingClause.title}</strong>:
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {inspectingClause.linkedControlCodes.map(code => {
                      const ctrl = tenantControls.find(c => c.controlCode === code);
                      const isImplemented = ctrl?.implementationStatus === 'Implemented' || ctrl?.implementationStatus === 'Audited';
                      const isInProgress = ctrl?.implementationStatus === 'In Progress';

                      return (
                        <div
                          key={code}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold text-xs border border-sky-500/30">
                                {code}
                              </span>
                              <h4 className="text-xs font-bold text-white">
                                {ctrl?.title || `Control ${code}`}
                              </h4>
                              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {ctrl?.category || 'Organizational'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 max-w-xl">
                              {ctrl?.description || 'Mandatory Annex A security safeguard.'}
                            </p>
                            {ctrl?.responsibleDepartment && (
                              <div className="text-[10px] text-slate-400">
                                Responsible: <span className="text-slate-300 font-medium">{ctrl.responsibleDepartment}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 self-start sm:self-center">
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                              isImplemented
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : isInProgress
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {ctrl?.implementationStatus || 'Not Started'}
                            </span>

                            <button
                              onClick={() => {
                                setInspectingClause(null);
                                setActiveModule('iso27001_workbench');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                              title="Edit in Controls Workbench"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {inspectorActiveTab === 'evidence' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Lead auditors verify the following specific documented information and evidence artifacts during Stage 1 and Stage 2 evaluations for <strong>Clause {inspectingClause.number}</strong>:
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {inspectingClause.mandatoryEvidenceChecklist.map((artifact, idx) => {
                      // Check if matching evidence exists in tenantEvidence
                      const matchingEvidence = tenantEvidence.filter(e =>
                        e.controlCode === artifact.controlCode ||
                        e.title.toLowerCase().includes(artifact.title.toLowerCase().slice(0, 15))
                      );
                      const isVerified = matchingEvidence.some(e => e.status === 'Verified');

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-sky-400" />
                                <h4 className="text-xs font-bold text-white">{artifact.title}</h4>
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  Ref: {artifact.controlCode}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {artifact.description}
                              </p>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 border ${
                              isVerified
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : matchingEvidence.length > 0
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {isVerified && <CheckCircle2 className="w-3 h-3" />}
                              <span>{isVerified ? 'Verified on File' : matchingEvidence.length > 0 ? 'Pending Review' : 'Upload Required'}</span>
                            </span>
                          </div>

                          {/* Matching tenant evidence items if any */}
                          {matchingEvidence.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/80 space-y-1">
                              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Uploaded Tenant Artifacts:
                              </div>
                              {matchingEvidence.map(ev => (
                                <div key={ev.id} className="flex items-center justify-between text-[11px] bg-slate-900/90 p-2 rounded border border-slate-800">
                                  <div className="flex items-center space-x-2">
                                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-white font-medium">{ev.fileName || ev.title}</span>
                                    <span className="text-[10px] text-slate-400">({ev.fileSize || 'PDF'})</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[10px]">
                                    <span className="text-slate-400">{ev.uploadedDate}</span>
                                    <span className="font-mono text-slate-400 text-[9px] bg-slate-950 px-1.5 py-0.5 rounded">
                                      SHA256: 3a9f...
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setInspectingClause(null);
                        setActiveModule('evidence_centre');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Upload & Verify Evidence in Evidence Centre</span>
                    </button>
                  </div>
                </div>
              )}

              {inspectorActiveTab === 'interviews' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Anticipated interview lines of inquiry and documentary evidence scrutinized by certification auditors (e.g. BSI, SGS, TÜV) for <strong>Clause {inspectingClause.number}</strong>:
                  </div>

                  <div className="space-y-3">
                    {inspectingClause.auditorKeyInterviews.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold">
                          <Headphones className="w-4 h-4" />
                          <span>Auditor Question #{idx + 1}:</span>
                        </div>
                        <p className="text-xs text-white italic pl-6">
                          "{item.question}"
                        </p>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-0.5 mt-2">
                          <span className="font-semibold text-slate-300 block">Required Proof Points & Demonstration:</span>
                          <p className="text-slate-400">{item.evidenceToInspect}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>
                ISO/IEC 27001:2022 Stage 1 & Stage 2 Audit Governance
              </span>
              <button
                onClick={() => setInspectingClause(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
