import {
  MeetingInterviewSession,
  ObjectiveDefinition,
  InterviewObjective,
  StakeholderRole
} from '../types/meetingScheduler';

export interface IsoImplementationProjectItem {
  id: string;
  name: string;
  code: string;
  standard: string;
  leadImplementer: string;
  targetAuditDate: string;
  currentPhase: 'Phase 1 Context & Leadership' | 'Phase 2 Scope & SoA' | 'Phase 3 Policies & Procedures' | 'Phase 4 Digital MoU' | 'Phase 5 Evidence & Audit Fieldwork' | 'Phase 6 Stage 1 Readiness';
  status: 'Active' | 'Under Review' | 'Audit Scheduled' | 'Completed';
  targetCertificationBody: string;
  description: string;
  totalInterviewsPlanned: number;
}

export const ISO_PROJECTS_CATALOG: IsoImplementationProjectItem[] = [
  {
    id: 'proj_iso27001_2022',
    name: 'ISO/IEC 27001:2022 Enterprise ISMS Certification Project',
    code: 'PRJ-ISO27K-2026',
    standard: 'ISO/IEC 27001:2022',
    leadImplementer: 'Chief Information Security Officer (CISO) / Lead Implementer',
    targetAuditDate: '2026-11-20',
    currentPhase: 'Phase 5 Evidence & Audit Fieldwork',
    status: 'Active',
    targetCertificationBody: 'BSI Group / TÜV SÜD',
    description: 'Full-scope ISMS transition and certification across 93 Annex A controls and Clauses 4-10 for cloud SaaS infrastructure.',
    totalInterviewsPlanned: 12
  },
  {
    id: 'proj_iso42001_aims',
    name: 'ISO/IEC 42001:2023 AI Management System (AIMS) Implementation',
    code: 'PRJ-ISO42K-AIMS',
    standard: 'ISO/IEC 42001:2023',
    leadImplementer: 'Head of AI Governance & Machine Learning Architect',
    targetAuditDate: '2026-12-15',
    currentPhase: 'Phase 2 Scope & SoA',
    status: 'Active',
    targetCertificationBody: 'DNV / Bureau Veritas',
    description: 'Scoping AI system lifecycle, algorithmic impact assessment, training data provenance, and 38 AI controls across engineering.',
    totalInterviewsPlanned: 8
  },
  {
    id: 'proj_iso27701_pims',
    name: 'ISO/IEC 27701:2019 Privacy Information Management System (PIMS)',
    code: 'PRJ-ISO277-PIMS',
    standard: 'ISO/IEC 27701:2019',
    leadImplementer: 'Data Protection Officer (DPO) & Legal Counsel',
    targetAuditDate: '2027-01-30',
    currentPhase: 'Phase 3 Policies & Procedures',
    status: 'Active',
    targetCertificationBody: 'BSI Group',
    description: 'Privacy extension to ISO 27001 covering PII controller and processor roles, cross-border data flows, and RoPA registers.',
    totalInterviewsPlanned: 6
  },
  {
    id: 'proj_mas_trm_2024',
    name: 'MAS TRM 2024 Regulatory Guidelines & Cyber Hygiene Compliance',
    code: 'PRJ-MAS-TRM-2026',
    standard: 'MAS TRM Guidelines',
    leadImplementer: 'APAC Compliance Director & DevOps Lead',
    targetAuditDate: '2026-10-31',
    currentPhase: 'Phase 5 Evidence & Audit Fieldwork',
    status: 'Active',
    targetCertificationBody: 'Monetary Authority of Singapore (Direct Reg)',
    description: 'Statutory compliance with MAS Notices 644/655, RTO recovery under 2 hours, and annual penetration testing remediation.',
    totalInterviewsPlanned: 10
  },
  {
    id: 'proj_soc2_iso_harmonized',
    name: 'SOC 2 Type II & ISO 27001 Multi-Standard Harmonization Project',
    code: 'PRJ-SOC2-ISO-HARM',
    standard: 'SOC 2 Type II & ISO 27001',
    leadImplementer: 'Senior GRC Manager & Security Assurance Team',
    targetAuditDate: '2026-11-10',
    currentPhase: 'Phase 5 Evidence & Audit Fieldwork',
    status: 'Active',
    targetCertificationBody: 'KPMG / Schellman',
    description: 'Harmonized control testing framework to satisfy both AICPA Trust Services Criteria and ISO 27001 Annex A simultaneously.',
    totalInterviewsPlanned: 14
  }
];

export const OBJECTIVE_DEFINITIONS: Record<InterviewObjective, ObjectiveDefinition> = {
  CONTEXT_AND_INTERESTED_PARTIES: {
    id: 'CONTEXT_AND_INTERESTED_PARTIES',
    title: 'Context of Org & Interested Parties Needs (Clause 4.1 & 4.2)',
    isoClause: 'Clauses 4.1 & 4.2',
    defaultPhase: 'Phase 1 Context & Leadership',
    description: 'Identify internal and external issues, legal and regulatory requirements, and expectations of interested parties (customers, regulators, vendors).',
    defaultControls: ['A.5.1', 'A.5.31', 'A.5.34'],
    deliverable: 'Clause 4.2 Interested Parties Register & Statutory Obligations Matrix'
  },
  SCOPE_AND_BOUNDARY: {
    id: 'SCOPE_AND_BOUNDARY',
    title: 'ISMS / AIMS Scope & Boundary Verification (Clause 4.3)',
    isoClause: 'Clause 4.3',
    defaultPhase: 'Phase 2 Scope & SoA',
    description: 'Verify organizational, geographic, and technological boundaries of the management system, including dependencies and exclusions.',
    defaultControls: ['A.5.1', 'A.5.8', 'A.8.1'],
    deliverable: 'ISMS Scope Statement & System Boundary Architecture Diagram'
  },
  ROLES_AND_AUTHORITIES: {
    id: 'ROLES_AND_AUTHORITIES',
    title: 'Organizational Roles, Responsibilities & RACI (Clause 5.3)',
    isoClause: 'Clause 5.3',
    defaultPhase: 'Phase 1 Context & Leadership',
    description: 'Review departmental security responsibilities, reporting hierarchies, segregated duties, and executive accountability.',
    defaultControls: ['A.5.2', 'A.5.3', 'A.5.4'],
    deliverable: 'ISMS Roles & Responsibilities Matrix (RACI) & Org Chart'
  },
  RISK_AND_THREAT_DISCOVERY: {
    id: 'RISK_AND_THREAT_DISCOVERY',
    title: 'Departmental Risk, Threat & Vulnerability Discovery (Clause 6.1)',
    isoClause: 'Clause 6.1.2 & 6.1.3',
    defaultPhase: 'Phase 2 Scope & SoA',
    description: 'Interview process owners to discover threats, vulnerabilities, likelihood/impact scoring, and evaluate current controls.',
    defaultControls: ['A.5.1', 'A.8.8', 'A.8.19', 'A.8.25'],
    deliverable: 'Departmental Risk Assessment Worksheet & Risk Treatment Plan'
  },
  AWARENESS_AND_COMPETENCE: {
    id: 'AWARENESS_AND_COMPETENCE',
    title: 'Competence, Security Awareness & Screening (Clauses 7.2 & 7.3)',
    isoClause: 'Clauses 7.2 & 7.3',
    defaultPhase: 'Phase 3 Policies & Procedures',
    description: 'Verify background checks, mandatory security awareness completion, role-based security training, and disciplinary processes.',
    defaultControls: ['A.6.1', 'A.6.2', 'A.6.3', 'A.6.4'],
    deliverable: 'Training & Competence Records & Security Awareness Verification'
  },
  OPERATIONAL_CONTROLS_WALKTHROUGH: {
    id: 'OPERATIONAL_CONTROLS_WALKTHROUGH',
    title: 'Operational Controls Walkthrough (Clause 8.1 & Annex A.5–A.8)',
    isoClause: 'Clause 8.1 / Annex A',
    defaultPhase: 'Phase 5 Evidence & Audit Fieldwork',
    description: 'Detailed inspection of technological, organizational, or physical controls (IAM, encryption, CI/CD, backup, change management).',
    defaultControls: ['A.5.15', 'A.8.5', 'A.8.12', 'A.8.13', 'A.8.24'],
    deliverable: 'Annex A Control Testing Working Paper & Artifact Verification'
  },
  BIA_AND_DISASTER_RECOVERY: {
    id: 'BIA_AND_DISASTER_RECOVERY',
    title: 'Business Impact Analysis (BIA) & Resilience (Clauses 8.2 & 8.3)',
    isoClause: 'Clauses 8.2 & 8.3 / A.5.29',
    defaultPhase: 'Phase 5 Evidence & Audit Fieldwork',
    description: 'Quantify Maximum Tolerable Outage (MTO), RTO, and RPO recovery metrics for critical business processes and systems.',
    defaultControls: ['A.5.29', 'A.5.30', 'A.8.14'],
    deliverable: 'Business Impact Analysis Report & BCP/DR Drill Verification'
  },
  INTERNAL_AUDIT_FIELDWORK: {
    id: 'INTERNAL_AUDIT_FIELDWORK',
    title: 'Pre-Certification Internal Audit Fieldwork (Clause 9.2)',
    isoClause: 'Clause 9.2',
    defaultPhase: 'Phase 5 Evidence & Audit Fieldwork',
    description: 'Conduct formal independent audit questioning per ISO 19011 sampling criteria to test control operating effectiveness.',
    defaultControls: ['A.5.35', 'A.5.36', 'Clause 9.2'],
    deliverable: 'Internal Audit Non-Conformity & Observation Report (IA-9.2)'
  },
  CAPA_AND_REMEDIATION_REVIEW: {
    id: 'CAPA_AND_REMEDIATION_REVIEW',
    title: 'CAPA & Corrective Action Closure Review (Clause 10.1 & 10.2)',
    isoClause: 'Clauses 10.1 & 10.2',
    defaultPhase: 'Phase 6 Stage 1 Readiness',
    description: 'Evaluate effectiveness of 5-Whys root cause analysis and corrective actions implemented for past audit findings.',
    defaultControls: ['Clause 10.1', 'Clause 10.2'],
    deliverable: 'CAPA Verification Record & Continual Improvement Registry'
  }
};

export const STAKEHOLDER_ROLE_LABELS: Record<StakeholderRole, { label: string; badge: string; description: string }> = {
  DEPARTMENT_HEAD: {
    label: 'Department Head / Business Unit Leader',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Overall operational owner of departmental processes, budget, and resource allocation.'
  },
  PROCESS_OWNER: {
    label: 'Critical Process Owner (BIA)',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'Accountable for process workflows, customer SLA delivery, and recovery objectives.'
  },
  SYSTEM_ADMIN: {
    label: 'System Administrator / Infrastructure Lead',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Technical custodian for cloud accounts, IAM access keys, network perimeters, and servers.'
  },
  TECH_CUSTODIAN: {
    label: 'Technical Custodian / Principal Engineer',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Responsible for software engineering repositories, CI/CD gates, and database configurations.'
  },
  RISK_OWNER: {
    label: 'Designated Risk Owner (Clause 6.1)',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Accountable for approving risk treatment plans and monitoring residual risk exposure.'
  },
  DATA_PROTECTION_LEAD: {
    label: 'Data Protection Officer (DPO) / Privacy Lead',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Monitors personal data processing, DPIAs, subject rights, and statutory privacy compliance.'
  },
  EXECUTIVE_SPONSOR: {
    label: 'Executive Sponsor / C-Suite (Clause 5.1)',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Top management providing leadership commitment, approving ISMS policies, and allocating resources.'
  },
  KEY_OPERATIONAL_STAFF: {
    label: 'Key Operational Personnel / Control Performer',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    description: 'Frontline staff executing day-to-day controls, customer onboarding, or manual verifications.'
  },
  EXTERNAL_CONSULTANT: {
    label: 'External Consultant / Advisory Lead',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    description: 'Third-party specialist guiding framework alignment and pre-assessment mock audits.'
  }
};

export const AVAILABLE_FRAMEWORKS = [
  { id: 'ISO/IEC 27001:2022', name: 'ISO/IEC 27001:2022 (ISMS)', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { id: 'ISO/IEC 42001:2023', name: 'ISO/IEC 42001:2023 (AIMS - AI Governance)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'ISO/IEC 27701:2019', name: 'ISO/IEC 27701:2019 (PIMS - Privacy)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'ISO 22301:2019', name: 'ISO 22301:2019 (BCMS - Business Continuity)', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  { id: 'MAS TRM Guidelines', name: 'MAS TRM Guidelines 2024 (Notice 644/655)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'DPDP Act 2023', name: 'Digital Personal Data Protection (DPDP) Act 2023', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'NIST CSF 2.0', name: 'NIST Cybersecurity Framework 2.0', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 'SOC 2 Type II', name: 'SOC 2 Type II (Trust Services Criteria)', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' }
];

export const DEPARTMENT_QUESTION_TEMPLATES: Record<string, Array<{ question: string; clause: string }>> = {
  'Software Engineering & DevOps': [
    { question: 'How is code reviewed and tested for security vulnerabilities before merging into the main branch? (A.8.25)', clause: 'A.8.25 Secure Coding' },
    { question: 'What mechanisms prevent unauthorized developers from directly deploying changes to production? (A.8.31)', clause: 'A.8.31 Separation of Dev & Prod' },
    { question: 'How are secrets, API keys, and database credentials managed and rotated across the CI/CD pipeline? (A.8.24)', clause: 'A.8.24 Cryptography & Secrets' },
    { question: 'What is the procedure for triaging and patching high/critical zero-day vulnerabilities in third-party libraries? (A.8.8)', clause: 'A.8.8 Technical Vulnerability Management' },
    { question: 'How are access permissions revoked immediately when an engineer transitions or departs the team? (A.6.5)', clause: 'A.6.5 Access Termination' }
  ],
  'Cloud Infrastructure & IT Ops': [
    { question: 'What multi-factor authentication (MFA) and conditional access rules are enforced on cloud console logins? (A.5.15 / A.8.5)', clause: 'A.5.15 & A.8.5 Access Control' },
    { question: 'How are immutable backup snapshots generated, tested for recovery, and safeguarded against ransomware? (A.8.13)', clause: 'A.8.13 Information Backup' },
    { question: 'What network segmentation controls separate public-facing DMZ load balancers from internal database tiers? (A.8.20)', clause: 'A.8.20 Network Security' },
    { question: 'Where are privileged access audit logs forwarded, and how is log tampering prevented? (A.8.15)', clause: 'A.8.15 Logging & Monitoring' },
    { question: 'What are the tested RTO and RPO benchmarks for full multi-region database failover? (A.5.29)', clause: 'A.5.29 ICT Readiness for Continuity' }
  ],
  'Human Resources & People Ops': [
    { question: 'What pre-employment screening and criminal/education background checks are mandated prior to hire? (A.6.1)', clause: 'A.6.1 Screening' },
    { question: 'How is employee agreement to the Acceptable Use Policy and Information Security NDA formally recorded? (A.6.2)', clause: 'A.6.2 Terms of Employment' },
    { question: 'What is the cadence of mandatory security awareness training, and how are non-attendees escalated? (A.6.3)', clause: 'A.6.3 Awareness & Training' },
    { question: 'Describe the SLA and workflow for HR notifying IT to deprovision credentials upon resignation or termination. (A.6.5)', clause: 'A.6.5 Disciplinary & Deprovisioning' },
    { question: 'How are remote work ergonomics and home network security requirements communicated to remote employees? (A.6.7)', clause: 'A.6.7 Remote Working' }
  ],
  'Legal, Risk & Compliance': [
    { question: 'How does the organization track, evaluate, and maintain compliance with statutory regulations (GDPR, MAS, DPDP)? (Clause 4.2)', clause: 'Clause 4.2 Interested Parties' },
    { question: 'What is the procedure for identifying and maintaining the Master Intellectual Property and Copyright Register? (A.5.32)', clause: 'A.5.32 Intellectual Property' },
    { question: 'What standard Data Protection Addendum (DPA) and security schedule terms are inserted in client and vendor contracts? (A.5.19)', clause: 'A.5.19 Supplier Agreements' },
    { question: 'Describe the formal workflow for executive risk acceptance when a remediation deadline cannot be met. (Clause 6.1.3)', clause: 'Clause 6.1.3 Risk Treatment' },
    { question: 'How are privacy impact assessments (DPIAs) initiated prior to launching new personal data processing activities? (ISO 27701)', clause: 'Clause 5.4.1 PIMS Impact Assessment' }
  ],
  'Procurement & Vendor Management': [
    { question: 'What security due diligence questionnaire and SOC 2 / ISO verification is performed before onboarding SaaS tools? (A.5.19)', clause: 'A.5.19 Supplier Due Diligence' },
    { question: 'How often are Tier-1 critical vendors subjected to annual security reassessments and audit certificate checks? (A.5.21)', clause: 'A.5.21 Monitoring Supplier Services' },
    { question: 'What contractual rights to audit and breach notification SLAs (e.g. 24h) are established with cloud providers? (A.5.20)', clause: 'A.5.20 Supplier Service Delivery' },
    { question: 'What is the offboarding procedure to ensure vendor access credentials and proprietary data are wiped on contract exit? (A.5.22)', clause: 'A.5.22 Addressing Supplier Changes' }
  ]
};

export const INITIAL_MEETING_SESSIONS: MeetingInterviewSession[] = [
  {
    id: 'mtg_001',
    tenantId: 'tenant_skanda_tech',
    meetingCode: 'MTG-ISO-2026-001',
    title: 'DevOps & CI/CD Pipeline Security Controls Discovery Interview',
    projectId: 'proj_iso27001_2022',
    projectName: 'ISO/IEC 27001:2022 Enterprise ISMS Certification Project',
    department: 'Software Engineering & DevOps',
    departmentId: 'dept_devops',
    stakeholder: {
      name: 'Michael Chen',
      email: 'michael.chen@skandagrc.com',
      title: 'Principal DevOps Architect & Infrastructure Lead',
      phone: '+65 9123 4567'
    },
    stakeholderRole: 'TECH_CUSTODIAN',
    interviewObjective: 'OPERATIONAL_CONTROLS_WALKTHROUGH',
    objectiveDescription: 'Walkthrough of GitHub Actions CI/CD pipeline branch protections, container image signing, and production IAM segregation per ISO 27001:2022 Annex A.8.25 and A.8.31.',
    frameworks: ['ISO/IEC 27001:2022', 'MAS TRM Guidelines', 'SOC 2 Type II'],
    primaryFramework: 'ISO/IEC 27001:2022',
    scheduledDate: '2026-09-24',
    scheduledTime: '10:00',
    durationMinutes: 60,
    locationOrLink: 'https://meet.google.com/iso-27k-devops-01',
    interviewer: {
      name: 'Alexander Ward, Lead ISMS Auditor',
      email: 'lead.auditor@skandagrc.com',
      role: 'Lead ISO Implementer & Lead Auditor'
    },
    status: 'Scheduled',
    consents: {
      audioVideoRecordingConsent: true,
      recordingConsentTimestamp: '2026-09-18T09:30:14.218Z',
      aiTranscriptionConsent: true,
      transcriptConsentTimestamp: '2026-09-18T09:30:20.512Z',
      confidentialityAgreementConsent: true,
      confidentialityConsentTimestamp: '2026-09-18T09:30:25.104Z',
      auditorAccessSamplingConsent: true,
      auditorAccessConsentTimestamp: '2026-09-18T09:30:30.880Z',
      dataRetentionMonths: 36,
      consentSignerName: 'Michael Chen',
      consentSignerEmail: 'michael.chen@skandagrc.com',
      consentSignedAt: '2026-09-18T09:30:00.000Z',
      consentIpAddress: '165.225.112.44',
      consentIntegrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    isoProjectMapping: {
      projectId: 'proj_iso27001_2022',
      projectName: 'ISO/IEC 27001:2022 Enterprise ISMS Certification Project',
      projectPhase: 'Phase 5 Evidence & Audit Fieldwork',
      targetMilestone: 'M5.2 Departmental Evidence & Control Effectiveness Verification',
      mappedClauses: ['Clause 8.1 Operational Planning', 'Clause 9.2 Internal Audit'],
      mappedAnnexAControls: ['A.8.25 Secure Coding', 'A.8.28 Code Security', 'A.8.31 Separation of Dev/Prod', 'A.8.24 Cryptography'],
      generatedTaskIds: ['tsk_devops_git_mfa', 'tsk_devops_ci_audit'],
      expectedEvidenceArtifacts: ['GitHub Branch Protection Settings Screenshot', 'AWS IAM AssumeRole Policy Export', 'Snyk Container Scan Reports'],
      deliverableOutput: 'Signed DevOps ISO 27001 Annex A.8 Control Walkthrough Working Paper'
    },
    interviewQuestions: [
      {
        id: 'q1',
        question: 'How is code reviewed and tested for security vulnerabilities before merging into the main branch? (A.8.25)',
        mappedClauseOrControl: 'A.8.25',
        responseNotes: 'Mandatory 2 senior engineer PR approvals enforced by branch rules. Automated SonarQube SAST and Snyk open-source license checks run on all PRs.',
        complianceFinding: 'Conforming'
      },
      {
        id: 'q2',
        question: 'What mechanisms prevent unauthorized developers from directly deploying changes to production? (A.8.31)',
        mappedClauseOrControl: 'A.8.31',
        responseNotes: 'No human has static AWS write access in production. Terraform deployments are executed exclusively by a dedicated IAM OIDC role tied to GitHub Actions.',
        complianceFinding: 'Conforming'
      },
      {
        id: 'q3',
        question: 'How are secrets, API keys, and database credentials managed and rotated across the CI/CD pipeline? (A.8.24)',
        mappedClauseOrControl: 'A.8.24',
        responseNotes: 'HashiCorp Vault and AWS Secrets Manager with KMS CMK encryption. Secrets rotated every 90 days automatically via Lambda script.',
        complianceFinding: 'Conforming'
      }
    ],
    transcriptSummary: 'Discussion focused on continuous security testing in DevOps. Architecture verified as conforming to zero-standing-privilege requirements for production.',
    createdAt: '2026-09-18T09:30:00.000Z',
    updatedAt: '2026-09-19T14:20:00.000Z'
  },
  {
    id: 'mtg_002',
    tenantId: 'tenant_skanda_tech',
    meetingCode: 'MTG-ISO-2026-002',
    title: 'HR & People Operations ISO 27001 Clause 7.2 Competence & Background Screening Interview',
    projectId: 'proj_iso27001_2022',
    projectName: 'ISO/IEC 27001:2022 Enterprise ISMS Certification Project',
    department: 'Human Resources & People Ops',
    departmentId: 'dept_hr',
    stakeholder: {
      name: 'Jessica Reynolds',
      email: 'jessica.reynolds@skandagrc.com',
      title: 'Head of People & Culture / HR Business Partner',
      phone: '+65 9234 5678'
    },
    stakeholderRole: 'DEPARTMENT_HEAD',
    interviewObjective: 'AWARENESS_AND_COMPETENCE',
    objectiveDescription: 'Verification of pre-employment background screening, signed Acceptable Use Policies, annual security awareness training logs, and offboarding deprovisioning SLA compliance.',
    frameworks: ['ISO/IEC 27001:2022', 'ISO/IEC 27701:2019'],
    primaryFramework: 'ISO/IEC 27001:2022',
    scheduledDate: '2026-09-22',
    scheduledTime: '14:30',
    durationMinutes: 45,
    locationOrLink: 'Executive Conference Room 3B & Google Meet',
    interviewer: {
      name: 'Alexander Ward, Lead ISMS Auditor',
      email: 'lead.auditor@skandagrc.com',
      role: 'Lead ISO Implementer'
    },
    status: 'Scheduled',
    consents: {
      audioVideoRecordingConsent: true,
      recordingConsentTimestamp: '2026-09-17T11:15:10.824Z',
      aiTranscriptionConsent: true,
      transcriptConsentTimestamp: '2026-09-17T11:15:19.431Z',
      confidentialityAgreementConsent: true,
      confidentialityConsentTimestamp: '2026-09-17T11:15:23.902Z',
      auditorAccessSamplingConsent: true,
      auditorAccessConsentTimestamp: '2026-09-17T11:15:29.112Z',
      dataRetentionMonths: 36,
      consentSignerName: 'Jessica Reynolds',
      consentSignerEmail: 'jessica.reynolds@skandagrc.com',
      consentSignedAt: '2026-09-17T11:15:00.000Z',
      consentIpAddress: '165.225.112.98',
      consentIntegrityHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    },
    isoProjectMapping: {
      projectId: 'proj_iso27001_2022',
      projectName: 'ISO/IEC 27001:2022 Enterprise ISMS Certification Project',
      projectPhase: 'Phase 5 Evidence & Audit Fieldwork',
      targetMilestone: 'M5.1 People Security & Clause 7 Competence Dossier',
      mappedClauses: ['Clause 7.2 Competence', 'Clause 7.3 Awareness'],
      mappedAnnexAControls: ['A.6.1 Screening', 'A.6.2 Terms of Employment', 'A.6.3 Information Security Awareness', 'A.6.5 Responsibilities After Termination'],
      generatedTaskIds: ['tsk_hr_awareness_audit', 'tsk_hr_offboarding_sop'],
      expectedEvidenceArtifacts: ['Sterling Talent Background Check Certificate Samples', 'Q3 Security Awareness LMS Completion Roster (98%)', 'Employee Separation Checklist Evidence'],
      deliverableOutput: 'Signed HR Competence & People Security Verification Dossier'
    },
    interviewQuestions: [
      {
        id: 'q1',
        question: 'What pre-employment screening and criminal/education background checks are mandated prior to hire? (A.6.1)',
        mappedClauseOrControl: 'A.6.1',
        responseNotes: '100% of full-time hires and contractors undergo 5-year background verification, financial integrity screening, and reference validation prior to system account creation.',
        complianceFinding: 'Conforming'
      },
      {
        id: 'q2',
        question: 'What is the cadence of mandatory security awareness training, and how are non-attendees escalated? (A.6.3)',
        mappedClauseOrControl: 'A.6.3',
        responseNotes: 'Mandatory upon onboarding (within 7 days) and annually every August via KnowBe4. Non-completers receive automated managerial warnings at 14 days and account suspension at 21 days.',
        complianceFinding: 'Conforming'
      }
    ],
    transcriptSummary: 'HR verified compliance with Annex A.6. All new employees sign NDA and Acceptable Use Policy electronically via DocuSign before receiving equipment.',
    createdAt: '2026-09-17T11:15:00.000Z',
    updatedAt: '2026-09-18T16:00:00.000Z'
  },
  {
    id: 'mtg_003',
    tenantId: 'tenant_skanda_tech',
    meetingCode: 'MTG-ISO-2026-003',
    title: 'Executive C-Suite ISO 27001 Clause 5 Leadership & ISMS Policy Ratification Interview',
    projectId: 'proj_iso27001_2022',
    projectName: 'ISO/IEC 27001:2022 Enterprise ISMS Certification Project',
    department: 'Executive Leadership & Governance',
    departmentId: 'dept_exec',
    stakeholder: {
      name: 'David Sterling',
      email: 'david.sterling@skandagrc.com',
      title: 'Chief Executive Officer (CEO)',
      phone: '+65 9345 6789'
    },
    stakeholderRole: 'EXECUTIVE_SPONSOR',
    interviewObjective: 'ROLES_AND_AUTHORITIES',
    objectiveDescription: 'Formal Clause 5.1 Leadership & Commitment interview, ISMS security policy ratification, resource allocation review, and authorization of the Statement of Applicability (SoA).',
    frameworks: ['ISO/IEC 27001:2022', 'MAS TRM Guidelines'],
    primaryFramework: 'ISO/IEC 27001:2022',
    scheduledDate: '2026-09-21',
    scheduledTime: '16:00',
    durationMinutes: 45,
    locationOrLink: 'Executive Boardroom & Encrypted Video Link',
    interviewer: {
      name: 'Alexander Ward, Lead ISMS Auditor',
      email: 'lead.auditor@skandagrc.com',
      role: 'Lead ISO Implementer'
    },
    status: 'Completed & Mapped',
    consents: {
      audioVideoRecordingConsent: true,
      aiTranscriptionConsent: true,
      confidentialityAgreementConsent: true,
      auditorAccessSamplingConsent: true,
      dataRetentionMonths: 60,
      consentSignerName: 'David Sterling',
      consentSignerEmail: 'david.sterling@skandagrc.com',
      consentSignedAt: '2026-09-15T15:00:00.000Z',
      consentIpAddress: '165.225.112.12',
      consentIntegrityHash: '4a44dc52e9e6e0e0293c41d81b7c728f1307814b915d3049f242568d14cd4e91'
    },
    isoProjectMapping: {
      projectId: 'proj_iso27001_2022',
      projectName: 'ISO/IEC 27001:2022 Enterprise ISMS Certification Project',
      projectPhase: 'Phase 1 Context & Leadership',
      targetMilestone: 'M1.3 Top Management Commitment & Policy Sign-Off',
      mappedClauses: ['Clause 5.1 Leadership & Commitment', 'Clause 5.2 Policy', 'Clause 5.3 Roles & Responsibilities'],
      mappedAnnexAControls: ['A.5.1 Policies for Information Security', 'A.5.2 Information Security Roles'],
      generatedTaskIds: ['tsk_ceo_signoff', 'tsk_board_minutes'],
      expectedEvidenceArtifacts: ['Signed Top-Level ISMS Policy v2.0', 'Executive MRM Minutes Signed', 'Approved Information Security Annual Budget'],
      deliverableOutput: 'Ratified Clause 5 Leadership Charter & Signed ISMS Policy'
    },
    interviewQuestions: [
      {
        id: 'q1',
        question: 'How does executive management ensure information security objectives are compatible with the strategic direction of the business? (Clause 5.1)',
        mappedClauseOrControl: 'Clause 5.1',
        responseNotes: 'CEO confirmed quarterly board-level security briefings, dedicated 15% IT budget allocation for cybersecurity tools, and active participation in the Management Review Meeting (Clause 9.3).',
        complianceFinding: 'Conforming'
      }
    ],
    transcriptSummary: 'CEO formally signed off on the ISMS Policy and reaffirmed full organizational backing for Stage 1 external certification scheduled with BSI.',
    createdAt: '2026-09-15T15:00:00.000Z',
    updatedAt: '2026-09-21T17:00:00.000Z'
  },
  {
    id: 'mtg_004',
    tenantId: 'tenant_skanda_tech',
    meetingCode: 'MTG-ISO-2026-004',
    title: 'AI Engineering & Model Governance ISO 42001 Scoping & Risk Interview',
    projectId: 'proj_iso42001_aims',
    projectName: 'ISO/IEC 42001:2023 AI Management System (AIMS) Implementation',
    department: 'Software Engineering & DevOps',
    departmentId: 'dept_devops',
    stakeholder: {
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@skandagrc.com',
      title: 'Head of Applied AI & Machine Learning Lead',
      phone: '+65 9456 7890'
    },
    stakeholderRole: 'TECH_CUSTODIAN',
    interviewObjective: 'RISK_AND_THREAT_DISCOVERY',
    objectiveDescription: 'Interviewing ML Engineering to establish inventory of foundational LLMs, training dataset provenance, bias testing protocols, and human-in-the-loop safeguards under ISO 42001 Annex A.5–A.10.',
    frameworks: ['ISO/IEC 42001:2023', 'ISO/IEC 27001:2022'],
    primaryFramework: 'ISO/IEC 42001:2023',
    scheduledDate: '2026-09-25',
    scheduledTime: '11:00',
    durationMinutes: 60,
    locationOrLink: 'https://meet.google.com/aims-iso42k-ml-scoping',
    interviewer: {
      name: 'Alexander Ward, Lead ISMS Auditor',
      email: 'lead.auditor@skandagrc.com',
      role: 'Lead ISO Implementer'
    },
    status: 'Scheduled',
    consents: {
      audioVideoRecordingConsent: true,
      aiTranscriptionConsent: true,
      confidentialityAgreementConsent: true,
      auditorAccessSamplingConsent: true,
      dataRetentionMonths: 36,
      consentSignerName: 'Dr. Elena Rostova',
      consentSignerEmail: 'elena.rostova@skandagrc.com',
      consentSignedAt: '2026-09-18T14:00:00.000Z',
      consentIpAddress: '165.225.112.203',
      consentIntegrityHash: 'bfd79e24b54784a9e526a090b8f0fc448b111664e16d44efc42c23579ab58e26'
    },
    isoProjectMapping: {
      projectId: 'proj_iso42001_aims',
      projectName: 'ISO/IEC 42001:2023 AI Management System (AIMS) Implementation',
      projectPhase: 'Phase 2 Scope & SoA',
      targetMilestone: 'M2.1 AI Inventory & AI Risk Assessment Baseline',
      mappedClauses: ['Clause 4.3 AIMS Scope', 'Clause 6.1.2 AI Risk Assessment'],
      mappedAnnexAControls: ['A.5.1 AI Policy', 'A.6.2 AI System Impact Assessment', 'A.9.2 Data Quality for Training', 'A.10.3 Human Oversight'],
      generatedTaskIds: ['tsk_ai_inventory', 'tsk_ai_eval_framework'],
      expectedEvidenceArtifacts: ['AI Model Inventory Register', 'RLHF Human Feedback Protocol', 'Training Data Lineage Hash Manifest'],
      deliverableOutput: 'ISO 42001 AI Risk Assessment & Annex A Scoping Matrix'
    },
    interviewQuestions: [
      {
        id: 'q1',
        question: 'What criteria determine whether an AI model is classified as High Impact under ISO 42001 Annex A.6.2?',
        mappedClauseOrControl: 'A.6.2',
        responseNotes: 'Models handling customer PII, making autonomous risk scoring decisions, or generating legal summaries are classified as High Impact requiring multi-layer testing.',
        complianceFinding: 'Conforming'
      }
    ],
    createdAt: '2026-09-18T14:00:00.000Z',
    updatedAt: '2026-09-19T10:00:00.000Z'
  }
];
