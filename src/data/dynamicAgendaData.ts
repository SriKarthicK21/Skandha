import { AgendaItem, MeetingAgendaStructure, StakeholderRole, InterviewObjective } from '../types/meetingScheduler';

/**
 * Standard ISO 19011:2018 Clause 6.4 (Conducting audit activities)
 * Proportional time allocation helper across 5 structured phases.
 */
function calculatePhaseDurations(totalMinutes: number): {
  opening: number;
  governance: number;
  fieldwork: number;
  risk: number;
  closing: number;
} {
  if (totalMinutes <= 30) {
    return { opening: 5, governance: 5, fieldwork: 12, risk: 5, closing: 3 };
  }
  if (totalMinutes <= 45) {
    return { opening: 5, governance: 8, fieldwork: 20, risk: 8, closing: 4 };
  }
  if (totalMinutes <= 60) {
    return { opening: 10, governance: 10, fieldwork: 25, risk: 10, closing: 5 };
  }
  // 90 minutes or more
  const opening = 10;
  const closing = 10;
  const remaining = totalMinutes - opening - closing;
  const governance = Math.round(remaining * 0.25);
  const risk = Math.round(remaining * 0.25);
  const fieldwork = remaining - governance - risk;
  return { opening, governance, fieldwork, risk, closing };
}

/**
 * Generates a structured ISO Audit Meeting Agenda tailored to Framework, Department, Role and Duration.
 * Conforms to ISO 19011:2018 audit execution protocol.
 */
export function generateStructuredMeetingAgenda(
  framework: string = 'ISO/IEC 27001:2022',
  department: string = 'Software Engineering & DevOps',
  role: StakeholderRole = 'TECH_CUSTODIAN',
  totalDurationMinutes: number = 60,
  _objective?: InterviewObjective
): MeetingAgendaStructure {
  const fw = framework || 'ISO/IEC 27001:2022';
  const dept = department || 'Software Engineering & DevOps';
  const durations = calculatePhaseDurations(totalDurationMinutes);

  let offset = 0;

  // Phase 1: Opening & Scoping Protocol (Always aligned to ISO 19011 Clause 6.4.2)
  const openingItem: AgendaItem = {
    id: `agenda_p1_${Date.now()}`,
    phase: 'OPENING',
    phaseLabel: 'Phase 1: Opening & Protocol',
    title: 'Audit Protocol, Scope Boundaries & Confidentiality Confirmation',
    durationMinutes: durations.opening,
    timeOffsetMinutes: offset,
    responsibleRole: 'Lead Auditor & Department Stakeholder',
    isoAuditPoints: [
      'ISO 19011:2018 Cl. 6.4.2 (Conducting opening meeting)',
      'ISO/IEC 27001:2022 Cl. 4.3 (Determining ISMS scope boundaries)',
      'ISO 27001 Cl. 7.5.3 (Control of documented information & NDA)'
    ],
    discussionCheckpoints: [
      'Confirm audit scope, department boundaries, and specific exclusions.',
      'Verify stakeholder attendance, interview recording consent, and cryptographic session ledger.',
      'Review confidentiality terms, data handling limits, and rights of the interviewee.'
    ],
    mandatoryEvidence: [
      'Signed Interview Consent & Recording Authorization Form',
      'Departmental Organizational Chart & System Boundary Definition'
    ]
  };
  offset += durations.opening;

  // Phase 2: Context & Governance
  let governanceTitle = 'Departmental Leadership, Roles & Policy Enforcement';
  let governanceAuditPoints = [
    'ISO 27001:2022 Cl. 5.1 (Leadership & commitment)',
    'ISO 27001:2022 Cl. 5.3 (Organizational roles, responsibilities & authorities)',
    'ISO 27001:2022 Cl. 7.2 (Competence & technical qualification)'
  ];
  let governanceCheckpoints = [
    'Review departmental security objectives aligned with top-level executive governance.',
    'Verify role descriptions, RACI matrix, and segregated authorities for sensitive actions.',
    'Confirm security training records, role-specific onboarding certifications, and compliance logs.'
  ];
  let governanceEvidence = [
    'Departmental Security Role Descriptions & RACI Assignment Matrix',
    'Annual Security Awareness & Specialized Competence Records'
  ];

  if (fw.includes('42001')) {
    governanceTitle = 'AI Governance, Ethical Guidelines & Algorithmic Accountability';
    governanceAuditPoints = [
      'ISO/IEC 42001:2023 Cl. 5.1 (AI Leadership & policy commitments)',
      'ISO 42001 Cl. 5.3 (AI Roles, responsibilities & model custodian authorities)',
      'ISO 42001 Control B.2.1 (AI policy & ethical principles)'
    ];
    governanceCheckpoints = [
      'Inspect AI ethics charter, model governance council charter, and executive review cadences.',
      'Confirm designated AI model custodians and oversight over autonomous algorithmic pipelines.',
      'Evaluate competency frameworks for ML engineers, prompt designers, and safety reviewers.'
    ];
    governanceEvidence = [
      'Enterprise AI Governance Policy & Ethics Guidelines',
      'Designated AI Model Custodian & Safety Reviewer Appointment Roster'
    ];
  } else if (fw.includes('27701')) {
    governanceTitle = 'Privacy Governance, PII Controller/Processor Roles & Consent Registers';
    governanceAuditPoints = [
      'ISO/IEC 27701:2019 Cl. 5.2.1 (PIMS leadership & privacy policy)',
      'ISO 27701 Cl. 5.2.3 (Privacy roles & Data Protection Officer engagement)',
      'ISO 27701 Cl. 6.3.1 (Conditions for consent & collection notices)'
    ];
    governanceCheckpoints = [
      'Review privacy officer escalation channels and DPO sign-off thresholds for new processing.',
      'Confirm staff training on privacy rights, GDPR/PDPA breach timelines, and subject request routing.'
    ];
    governanceEvidence = [
      'Record of Processing Activities (RoPA / Article 30 inventory)',
      'Data Privacy Officer Appointment & Delegated Review Charter'
    ];
  } else if (fw.includes('22301')) {
    governanceTitle = 'Business Continuity Governance, Crisis Delegation & BIA Policy';
    governanceAuditPoints = [
      'ISO 22301:2019 Cl. 5.1 (BCMS Leadership commitment)',
      'ISO 22301 Cl. 5.3 (Crisis Management Team responsibilities & succession)',
      'ISO 22301 Cl. 8.2.2 (Business Impact Analysis governance & sign-off)'
    ];
    governanceCheckpoints = [
      'Review executive approval of maximum tolerable period of disruption (MTPD) parameters.',
      'Inspect crisis command hierarchy, deputy call-tree authorization, and communication mandates.'
    ];
    governanceEvidence = [
      'Approved Business Continuity Policy & Incident Command Charter',
      'Crisis Management Team Roster with Verified Primary & Secondary Contacts'
    ];
  }

  const governanceItem: AgendaItem = {
    id: `agenda_p2_${Date.now()}`,
    phase: 'CONTEXT_GOVERNANCE',
    phaseLabel: 'Phase 2: Context & Governance',
    title: governanceTitle,
    durationMinutes: durations.governance,
    timeOffsetMinutes: offset,
    responsibleRole: 'Lead Auditor & Department Lead',
    isoAuditPoints: governanceAuditPoints,
    discussionCheckpoints: governanceCheckpoints,
    mandatoryEvidence: governanceEvidence
  };
  offset += durations.governance;

  // Phase 3: Fieldwork Walkthrough & Operational Evidence Sampling
  let fieldworkTitle = 'Operational Controls Walkthrough & Technical Evidence Sampling';
  let fieldworkAuditPoints: string[] = [];
  let fieldworkCheckpoints: string[] = [];
  let fieldworkEvidence: string[] = [];

  // Department + Framework tailoring for Phase 3
  if (dept.includes('Software') || dept.includes('DevOps') || dept.includes('Engineering')) {
    if (fw.includes('42001')) {
      fieldworkTitle = 'MLOps Pipeline Inspection, Model Training Data Provenance & Bias Guardrails';
      fieldworkAuditPoints = [
        'ISO 42001:2023 Cl. 8.2 (AI risk assessment in deployment)',
        'ISO 42001 Control B.6.3 (AI development & training pipeline integrity)',
        'ISO 42001 Control B.7.2 (Data quality, provenance & dataset rights)',
        'ISO 42001 Control B.9.2 (Adversarial testing & prompt injection defense)'
      ];
      fieldworkCheckpoints = [
        'Live walkthrough of model training pipeline and dataset sanitization scripts.',
        'Review model checkpoint registry, cryptographic hash verification, and artifact provenance.',
        'Inspect automated bias detection metrics, precision/recall drift benchmarks, and test splits.',
        'Evaluate prompt guardrails, output hallucination filters, and API rate-limiting thresholds.'
      ];
      fieldworkEvidence = [
        'MLOps CI/CD Pipeline Configuration with Automated Test Gate Logs',
        'Model Card / Dataset Provenance Documentation with Cryptographic Checksums',
        'Recent Adversarial Red-Teaming & Prompt Injection Vulnerability Report'
      ];
    } else {
      // ISO 27001 / SOC 2 / General Tech
      fieldworkTitle = 'CI/CD Pipeline Security, Secure Coding & Access Control Walkthrough';
      fieldworkAuditPoints = [
        'ISO/IEC 27001:2022 Annex A.8.25 (Secure development lifecycle)',
        'ISO 27001 Annex A.8.28 (Secure coding standards & SAST/DAST)',
        'ISO 27001 Annex A.8.31 (Separation of development, test & prod)',
        'ISO 27001 Annex A.8.4 (Access to source code & branch protections)'
      ];
      fieldworkCheckpoints = [
        'Live inspection of Git branch protection rules (mandatory PR approvals, signed commits).',
        'Review static code analysis (SAST) and software composition analysis (SCA) blocking gates in CI.',
        'Verify database credential isolation, KMS secret rotation, and environment variable handling.',
        'Sample 3 recent production releases for documented change approvals and rollback verification.'
      ];
      fieldworkEvidence = [
        'Git Repository Branch Protection Settings & Enforcement Screenshots',
        'Automated CI/CD Pipeline Security Gate Scan Logs (Zero Critical/High CVEs)',
        'Sample of 3 Change Request Tickets with Independent Code Review Approvals'
      ];
    }
  } else if (dept.includes('Infrastructure') || dept.includes('Cloud') || dept.includes('IT Ops')) {
    fieldworkTitle = 'Cloud Infrastructure Hardening, Identity & Access (IAM) & Network Telemetry';
    fieldworkAuditPoints = [
      'ISO/IEC 27001:2022 Annex A.8.1 (User endpoint devices & MDM)',
      'ISO 27001 Annex A.8.9 (Configuration management & CIS benchmarks)',
      'ISO 27001 Annex A.8.15 & A.8.16 (Logging & monitoring telemetry)',
      'ISO 27001 Annex A.8.20 & A.8.22 (Network controls & web filtering)'
    ];
    fieldworkCheckpoints = [
      'Live audit of Cloud IAM roles: enforce least privilege, MFA enforcement, and zero permanent root keys.',
      'Inspect Terraform/IaC compliance scanning and configuration drift monitoring dashboards.',
      'Review centralized SIEM log retention, NTP synchronization, and immutable storage policies.',
      'Walk through network segmentation, VPC security groups, and bastion host jump box access logs.'
    ];
    fieldworkEvidence = [
      'Cloud IAM User Roster with MFA Status & Inactive Account Report',
      'Infrastructure as Code (Terraform) Security Compliance Scan Output',
      'SIEM / CloudTrail Audit Log Retention Policy & Immutable Bucket Configuration'
    ];
  } else if (dept.includes('Human Resources') || dept.includes('People')) {
    fieldworkTitle = 'Employee Lifecycle Security, Screening & Offboarding Walkthrough';
    fieldworkAuditPoints = [
      'ISO/IEC 27001:2022 Annex A.6.1 (Screening & background checks)',
      'ISO 27001 Annex A.6.2 (Terms and conditions of employment)',
      'ISO 27001 Annex A.6.5 (Responsibilities after termination / offboarding)',
      'ISO 27001 Annex A.6.4 (Disciplinary process & acceptable use violations)'
    ];
    fieldworkCheckpoints = [
      'Sample background verification records for 5 recently hired technical and sensitive roles.',
      'Review automated HRIS-to-IdP offboarding triggers (deprovisioning within standard SLA).',
      'Verify signed non-disclosure agreements (NDAs) and Information Security Acceptable Use Policies.'
    ];
    fieldworkEvidence = [
      'Sampled Pre-employment Background Check Dossiers (anonymized)',
      'Offboarding Checklist Records with Hardware Recovery & SSO Revocation Timestamps',
      'Signed Acceptable Use Policy (AUP) Master Acknowledgment Registry'
    ];
  } else if (dept.includes('Legal') || dept.includes('Risk') || dept.includes('Compliance')) {
    fieldworkTitle = 'Legal Obligations, Regulatory Compliance & Contractual Review';
    fieldworkAuditPoints = [
      'ISO/IEC 27001:2022 Annex A.5.31 (Legal, statutory, regulatory & contractual requirements)',
      'ISO 27001 Annex A.5.32 (Intellectual property rights)',
      'ISO 27001 Annex A.5.33 (Protection of records & retention rules)',
      'ISO 27001 Annex A.5.34 (Privacy and protection of PII)'
    ];
    fieldworkCheckpoints = [
      'Inspect corporate legal and regulatory compliance register for currency and coverage.',
      'Review standard master service agreements (MSAs), data processing addenda (DPAs), and customer SLAs.',
      'Sample annual software licensing audits to verify zero unauthorized or pirated software usage.'
    ];
    fieldworkEvidence = [
      'Enterprise Statutory, Regulatory & Contractual Compliance Register',
      'Executed Standard Data Processing Agreements (DPAs) with Key Cloud Providers',
      'Software License Inventory & Proof of Entitlement Audit Report'
    ];
  } else if (dept.includes('Procurement') || dept.includes('Vendor')) {
    fieldworkTitle = 'Supplier Security Evaluation, Third-Party Risk & SLA Monitoring';
    fieldworkAuditPoints = [
      'ISO/IEC 27001:2022 Annex A.5.19 (Information security in supplier relationships)',
      'ISO 27001 Annex A.5.20 (Addressing security within supplier agreements)',
      'ISO 27001 Annex A.5.21 (Managing ICT supply chain risk)',
      'ISO 27001 Annex A.5.22 (Monitoring, review and change management of supplier services)'
    ];
    fieldworkCheckpoints = [
      'Review tiering methodology for critical cloud providers (SaaS, PaaS, IaaS).',
      'Inspect annual third-party SOC 2 Type II and ISO 27001 certificate collection workflows.',
      'Sample vendor onboarding security assessments for 3 recent critical vendors.'
    ];
    fieldworkEvidence = [
      'Vendor Tiering Matrix & Third-Party Risk Register',
      'Collection Files of Vendor SOC 2 Type II / ISO 27001 Audit Reports',
      'Contractual Security Clauses & Breach Notification Mandates in Vendor Agreements'
    ];
  } else {
    // Operations / Executive / General
    fieldworkTitle = 'Core Operational Security Processes, Asset Ownership & Physical Controls';
    fieldworkAuditPoints = [
      'ISO/IEC 27001:2022 Annex A.5.9 (Inventory of information and other associated assets)',
      'ISO 27001 Annex A.5.10 (Acceptable use of information & assets)',
      'ISO 27001 Annex A.7.1 & A.7.4 (Physical security perimeter & office protection)',
      'ISO 27001 Annex A.8.13 (Information backup verification)'
    ];
    fieldworkCheckpoints = [
      'Verify the hardware/software asset management register for accuracy and designated ownership.',
      'Inspect physical access control badge logs, visitor sign-in registers, and CCTV retention.',
      'Review automated backup schedules, test restoration logs, and off-site immutable replication.'
    ];
    fieldworkEvidence = [
      'Master Information Asset Inventory with Assigned Custodians and Classification',
      'Recent Automated Backup Restoration Test Report with RTO/RPO Metrics',
      'Physical Access Facility Badge Records & Visitor Escort Logs'
    ];
  }

  const fieldworkItem: AgendaItem = {
    id: `agenda_p3_${Date.now()}`,
    phase: 'FIELDWORK_WALKTHROUGH',
    phaseLabel: 'Phase 3: Fieldwork & Evidence Walkthrough',
    title: fieldworkTitle,
    durationMinutes: durations.fieldwork,
    timeOffsetMinutes: offset,
    responsibleRole: 'Lead Auditor & Process Custodians',
    isoAuditPoints: fieldworkAuditPoints,
    discussionCheckpoints: fieldworkCheckpoints,
    mandatoryEvidence: fieldworkEvidence
  };
  offset += durations.fieldwork;

  // Phase 4: Risk Discovery, Incident History & CAPA Review
  const riskItem: AgendaItem = {
    id: `agenda_p4_${Date.now()}`,
    phase: 'RISK_VERIFICATION',
    phaseLabel: 'Phase 4: Risk & Exception Review',
    title: 'Departmental Risk Register, Incident Walkthrough & CAPA Remediations',
    durationMinutes: durations.risk,
    timeOffsetMinutes: offset,
    responsibleRole: 'Lead Auditor, Risk Owner & Technical Lead',
    isoAuditPoints: [
      'ISO/IEC 27001:2022 Cl. 6.1.2 (Information security risk assessment)',
      'ISO 27001 Cl. 6.1.3 (Information security risk treatment plan)',
      'ISO 27001 Cl. 10.2 (Nonconformity & corrective action / CAPA)',
      'ISO 27001 Annex A.5.24 & A.5.26 (Incident management & learning from incidents)'
    ],
    discussionCheckpoints: [
      'Walk through the departmental risk register: evaluate risk likelihood, impact scoring, and treatment plans.',
      'Inquire about security anomalies, operational outages, or near-misses over the prior 12 months.',
      'Verify status of open corrective action requests (CAPAs) and evidence of root cause analysis.'
    ],
    mandatoryEvidence: [
      'Departmental Operational Risk Register with Active Treatment Plans',
      'Post-Incident Review (PIR) Reports & Root Cause Analysis Dossiers',
      'Corrective Action Tracking Log (CAPA) with Verification of Effectiveness'
    ]
  };
  offset += durations.risk;

  // Phase 5: Closing Synthesis & Next Steps
  const closingItem: AgendaItem = {
    id: `agenda_p5_${Date.now()}`,
    phase: 'CLOSING_SYNTHESIS',
    phaseLabel: 'Phase 5: Closing & Synthesis',
    title: 'Preliminary Findings Debrief, Pending Artifacts & Working Paper Sign-off',
    durationMinutes: durations.closing,
    timeOffsetMinutes: offset,
    responsibleRole: 'Lead Auditor & Auditee Representatives',
    isoAuditPoints: [
      'ISO 19011:2018 Cl. 6.4.10 (Conducting closing meeting & presenting findings)',
      'ISO 19011 Cl. 6.5 (Preparing and distributing the audit report)',
      'ISO 27001 Cl. 9.2.2 (Documented audit findings & non-conformity classification)'
    ],
    discussionCheckpoints: [
      'Summarize positive conformities observed during operational walkthroughs.',
      'Present preliminary observations, potential minor non-conformities, and improvement opportunities.',
      'Agree on outstanding evidence submission deadlines (standard 48-hour auditor window).',
      'Confirm recording checksum generation, transcript confidentiality seal, and formal dossier archive.'
    ],
    mandatoryEvidence: [
      'Interim Audit Findings Summary & Action Item Commitment Log',
      'Cryptographic Session Integrity Signature (SHA-256 Checksum)'
    ]
  };

  return {
    framework: fw,
    department: dept,
    totalDurationMinutes,
    agendaTitle: `${fw} Structured Audit Interview Agenda — ${dept}`,
    leadAuditorStandardProtocol: 'ISO 19011:2018 Clause 6.4 Standard Compliant Audit Protocol',
    items: [openingItem, governanceItem, fieldworkItem, riskItem, closingItem],
    generatedBy: 'ISO 19011 Audit Engine',
    generatedAt: new Date().toISOString()
  };
}
