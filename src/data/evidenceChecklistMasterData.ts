// Authoritative Master Data for ISO Chief Implementer & Lead Auditor Evidence Checklist
// Covering ISO/IEC 27001:2022 (ISMS), ISO/IEC 42001:2023 (AIMS), and MAS TRM 2021/2024
// With Full Department-Wise Taxonomies, Implementation Protocols & Lead Auditor Testing

export type DepartmentCode = 
  | 'DEPT_ENG_DEVOPS'
  | 'DEPT_AI_DATA'
  | 'DEPT_INFOSEC_SOC'
  | 'DEPT_HR_PEOPLE'
  | 'DEPT_LEGAL_PRIVACY'
  | 'DEPT_PROCUREMENT_VRM'
  | 'DEPT_EXEC_BOARD'
  | 'DEPT_IT_OPS';

export interface DepartmentDefinition {
  code: DepartmentCode;
  name: string;
  shortName: string;
  headTitle: string;
  iconName: string;
  description: string;
  color: string;
  accentBg: string;
  borderColor: string;
  badgeColor: string;
  focusAreas: string[];
  keyAuditorInterviewTopics: string[];
  topAuditTrapsToAvoid: string[];
  liveDemonstrationArtifacts: string[];
  leadAuditorScrutinyLevel: 'CRITICAL_HIGH' | 'VERY_HIGH' | 'HIGH' | 'MEDIUM_HIGH';
  sampleInterviewQA: {
    question: string;
    targetRole: string;
    modelAnswer: string;
    auditTrapAnswer: string;
    requiredArtifacts: string;
  }[];
}

export const DEPARTMENT_DEFINITIONS: DepartmentDefinition[] = [
  {
    code: 'DEPT_ENG_DEVOPS',
    name: 'Engineering & Cloud DevOps',
    shortName: 'Engineering',
    headTitle: 'VP of Engineering / Lead DevOps Architect',
    iconName: 'Cpu',
    description: 'Cloud infrastructure security, CI/CD pipeline gating, branch protection, secrets management, IaC encryption, and automated DR recovery tests.',
    color: 'text-sky-400',
    accentBg: 'bg-sky-500/10 hover:bg-sky-500/15',
    borderColor: 'border-sky-500/30',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    focusAreas: [
      'CI/CD 2-Person Rule & Branch Protection (A.8.25 / MAS Sec 7.0)',
      'Automated SAST / DAST Vulnerability Pipeline Gating',
      'Immutable Backup Snapshotting & RTO/RPO Recovery Drills',
      'Terraform IaC State Encryption & KMS Key Management',
      'Production Separation & Zero-Trust Cloud Architecture'
    ],
    keyAuditorInterviewTopics: [
      'Show me how direct commits to the main production branch are technically blocked.',
      'Demonstrate the automated pipeline failing a build when a high-severity CVSS vulnerability is detected.',
      'Provide the database restoration log showing RTO under 4 hours from last quarter.'
    ],
    topAuditTrapsToAvoid: [
      'Developer possessing root/admin write access directly to production cloud instances.',
      'Lack of automated segregation between Staging and Production databases (using sanitized vs live customer PII).',
      'Untested backups or missing restoration verification logs within the past 12 months.'
    ],
    liveDemonstrationArtifacts: [
      'GitHub / GitLab Repository Branch Protection Settings screen',
      'AWS / GCP Backup Recovery Drill execution terminal log',
      'SonarQube / Snyk CI/CD Quality Gate blocker screenshot',
      'AWS KMS Customer Managed Keys (CMK) annual auto-rotation status'
    ],
    sampleInterviewQA: [
      {
        question: 'Can any software engineer push hotfixes directly to production without a peer review in an emergency?',
        targetRole: 'VP of Engineering / Lead DevOps',
        modelAnswer: 'No. All emergency changes require an approved expedited Change Request ticket in Jira, followed by a mandatory pull request with at least one Senior Engineer approval and automated passing CI/CD tests. In break-glass scenarios, temporary access is leased via PAM with full session recording.',
        auditTrapAnswer: 'Yes, our senior leads have direct SSH keys to production EC2 instances if an outage occurs at night.',
        requiredArtifacts: 'GitHub Branch Protection JSON export + Jira Emergency Change Ticket Sample'
      },
      {
        question: 'How do you verify that automated daily database backups are actually recoverable?',
        targetRole: 'DevOps / Database Administrator',
        modelAnswer: 'We perform automated quarterly database restore drills into an isolated VPC, execute data integrity verification queries, measure exact Recovery Time (RTO: 42 mins vs <4hr SLA), and generate a signed restoration report with SHA-256 validation.',
        auditTrapAnswer: 'AWS RDS takes snapshots automatically every night, so we know they work.',
        requiredArtifacts: 'Signed Quarterly DR Restoration Log + Integrity Check Scripts'
      }
    ]
  },
  {
    code: 'DEPT_AI_DATA',
    name: 'Data Science & AI / ML Engineering',
    shortName: 'AI & Data Science',
    headTitle: 'Head of AI / Lead ML Engineer / Chief AI Scientist',
    iconName: 'Brain',
    description: 'ISO 42001 Responsible AI governance, AI System Impact Assessments (AI-SIA), model card registers, bias/fairness testing, LLM jailbreak defenses, and training provenance.',
    color: 'text-purple-400',
    accentBg: 'bg-purple-500/10 hover:bg-purple-500/15',
    borderColor: 'border-purple-500/30',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    focusAreas: [
      'AI System Impact Assessment (AI-SIA) Lifecycle (ISO 42001 Cl 6.1.4)',
      'Training Data Provenance & PII Scrubbing (ISO 42001 Cl 8.3 / Annex A.7)',
      'LLM Red-Teaming, Prompt Injection & Jailbreak Reports (ISO 42001 Cl 8.4)',
      'Algorithmic Bias, Fairness & Disparate Impact Audits (ISO 42001 Cl 9.1)',
      'Model Card Registry, Feature Attribution (SHAP/LIME) & Versioning'
    ],
    keyAuditorInterviewTopics: [
      'Explain your process for assessing societal, ethical, and safety risks prior to training or deploying a new model.',
      'Show me how you validated that the training dataset does not contain leaked PII or copyright-infringing content.',
      'Demonstrate how continuous output drift or hallucinations are monitored in production inference.'
    ],
    topAuditTrapsToAvoid: [
      'Deploying LLM models into production without an adversarial prompt-injection test report.',
      'Inability to provide model explainability or feature importance for high-impact automated decisions.',
      'Lack of human-in-the-loop fallback mechanisms for AI model failure cases.'
    ],
    liveDemonstrationArtifacts: [
      'MLflow / Weights & Biases Model Registry showing versioned artifacts and checksums',
      'Fairlearn / AIF360 Disparate Impact Demographic Parity charts',
      'Adversarial Jailbreak penetration test report with mitigation patch history',
      'Automated Data Preprocessing Great Expectations PII validation pipeline'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure your machine learning models do not produce biased or discriminatory outputs for protected demographic groups?',
        targetRole: 'Head of AI / Lead Data Scientist',
        modelAnswer: 'We run formal disparate impact evaluations using Fairlearn across all protected attributes during model validation. Our threshold requires a demographic parity ratio >= 0.80 and equalized odds difference <= 0.05 before production promotion. All results are logged in our Model Card.',
        auditTrapAnswer: 'We remove gender and race columns from the training dataset, so it is impossible for the model to be biased.',
        requiredArtifacts: 'Disparate Impact Benchmark Report + Signed Model Validation Sign-off'
      },
      {
        question: 'What happens if a user injects adversarial prompt jailbreaks into your customer-facing AI agent?',
        targetRole: 'AI Application Security Lead',
        modelAnswer: 'We employ a defense-in-depth architecture: dual LLM guardrails (input screening for jailbreak patterns, system prompt boundary reinforcement, output classification for policy violations) and rate limiting. All suspicious prompts are quarantined and alerted to SOC.',
        auditTrapAnswer: 'We told the model in its system prompt to never be evil.',
        requiredArtifacts: 'LLM Red-Teaming Matrix + Input Guardrail Filter Configuration'
      }
    ]
  },
  {
    code: 'DEPT_INFOSEC_SOC',
    name: 'Information Security & Cyber SOC',
    shortName: 'InfoSec & SOC',
    headTitle: 'Chief Information Security Officer (CISO) / SOC Manager',
    iconName: 'ShieldAlert',
    description: '24/7 SIEM monitoring, threat intelligence, vulnerability remediation, annual third-party penetration testing, and 1-hour regulatory incident notification.',
    color: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    focusAreas: [
      '24/7 SIEM Alert Monitoring & 12-Month Log Retention (A.8.15 / MAS Sec 8.0)',
      'Annual Third-Party Penetration Testing & Retesting Remediation (A.8.8)',
      'Security Incident Playbooks & 1-Hour MAS TRM Escalation (A.5.24 / MAS Sec 12.0)',
      'Threat Intelligence Feeds & CVSS Vulnerability Scanning (A.5.7, A.8.8)',
      'MAS Notice 655 6-Directive Cyber Hygiene Statutory Compliance'
    ],
    keyAuditorInterviewTopics: [
      'Show me your SIEM retention settings proving that security logs are retained for at least 12 months with immutable storage.',
      'Show me the remediation tracking for all High/Critical findings from your last external penetration test.',
      'Walk me through the exact steps taken in the event of a ransomware or major data breach incident.'
    ],
    topAuditTrapsToAvoid: [
      'Penetration test findings older than 90 days with no remediation evidence or risk acceptance.',
      'SIEM retention configured for only 30-90 days, directly violating MAS TRM and ISO requirements.',
      'Incident management procedure with no documented communication chain to regulators or affected customers.'
    ],
    liveDemonstrationArtifacts: [
      'SIEM Splunk/Datadog Log Retention S3 Glacier compliance lock policy',
      'CREST-accredited Penetration Test Remediation Verification Letter',
      'Quarterly Tabletop Incident Simulation Exercise Minutes & Action Log',
      'CrowdStrike / Defender EDR 100% agent installation dashboard'
    ],
    sampleInterviewQA: [
      {
        question: 'Under MAS TRM guidelines, what is your statutory notification timeframe if a critical customer-facing banking service suffers an outage?',
        targetRole: 'CISO / Incident Commander',
        modelAnswer: 'We are mandated to notify the Monetary Authority of Singapore (MAS) within 1 hour of discovering a severe incident or major system failure, followed by an exhaustive root-cause investigation report within 14 days.',
        auditTrapAnswer: 'We notify the authorities within 72 hours under standard GDPR guidelines.',
        requiredArtifacts: 'Incident Response SOP v3.2 + MAS Escalation Contact Card'
      }
    ]
  },
  {
    code: 'DEPT_HR_PEOPLE',
    name: 'Human Resources & People Operations',
    shortName: 'HR & People Ops',
    headTitle: 'Head of People / Chief Human Resources Officer (CHRO)',
    iconName: 'Users',
    description: 'Pre-employment background screening, signed NDAs, acceptable use policies, mandatory security & AI awareness LMS tracking, and 24-hr offboarding deprovisioning.',
    color: 'text-amber-400',
    accentBg: 'bg-amber-500/10 hover:bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    focusAreas: [
      'Pre-Employment Background Verification & Criminal Screening (ISO 27001 A.6.1)',
      'Signed Information Security & Responsible AI Acknowledgements (A.6.2)',
      'Annual Mandatory Security Awareness & Phishing Simulation LMS Records (A.6.3)',
      'Employee Offboarding SLA & 24-Hour Access Revocation Proof (A.6.5)',
      'Disciplinary Process for Security & AI Ethics Violations (A.6.4)'
    ],
    keyAuditorInterviewTopics: [
      'Show me the background check file for the most recently hired software engineer and cloud admin.',
      'What percentage of full-time employees and contractors completed the mandatory annual security awareness training?',
      'Show me the offboarding records for the last 3 employees who left the company to verify access was revoked on day one.'
    ],
    topAuditTrapsToAvoid: [
      'Hiring contractors without verifying identity, criminal background, or signed NDAs.',
      'Training completion rate below 90% with no escalation process for delinquent staff.',
      'Offboarded employee retaining active email, Google Workspace, or GitHub access days after termination.'
    ],
    liveDemonstrationArtifacts: [
      'Third-party background screening agency verification certificate sample',
      'LMS Security Training completion report showing >98% company compliance',
      'Jira Offboarding Checklist with timestamps of IT access revocation',
      'Signed Remote Teleworking & Bring-Your-Own-Device (BYOD) agreements'
    ],
    sampleInterviewQA: [
      {
        question: 'What is your process when an employee resigns or is terminated?',
        targetRole: 'HR Director / Talent Operations',
        modelAnswer: 'HR immediately triggers an automated Offboarding Ticket in Jira. IT and Security receive instant notification to revoke Google Workspace, SSO, VPN, and GitHub access within 24 hours (or immediately for involuntary exits). Company hardware and badges are collected, and an exit interview NDA reaffirmation is executed.',
        auditTrapAnswer: 'HR sends an email to IT at the end of the month with the list of employees who left.',
        requiredArtifacts: 'Sample of 5 Offboarding Tickets with Access Revocation Timestamps'
      }
    ]
  },
  {
    code: 'DEPT_LEGAL_PRIVACY',
    name: 'Legal, Compliance & Data Privacy',
    shortName: 'Legal & Privacy',
    headTitle: 'General Counsel / Data Protection Officer (DPO)',
    iconName: 'Scale',
    description: 'Regulatory compliance registers, Data Protection Impact Assessments (DPIA), AI Ethics charters, copyright & training data licensing, and customer DPAs.',
    color: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
    borderColor: 'border-indigo-500/30',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    focusAreas: [
      'Statutory & Regulatory Obligations Register (ISO 27001 A.5.31 / MAS Sec 3.0)',
      'Data Protection Impact Assessments (DPIA) & GDPR/PDPA Cross-Border Transfers (A.5.34)',
      'AI Ethics Policy & Public AI Transparency Disclosures (ISO 42001 Cl 5.1 / Annex A.2)',
      'Intellectual Property & Training Data Licensing Register (ISO 42001 Annex A.7.4)',
      'Customer Data Processing Agreements (DPA) & Right-to-Audit Clauses (A.5.20)'
    ],
    keyAuditorInterviewTopics: [
      'Show me how you track evolving statutory requirements across all jurisdictions in which you operate.',
      'Show me the DPIA conducted prior to launching your customer AI profiling system.',
      'How do you ensure training datasets for your machine learning models do not infringe third-party copyrights?'
    ],
    topAuditTrapsToAvoid: [
      'Outdated compliance register with no record of reviewing new AI regulations (EU AI Act, ISO 42001, MAS FEAT).',
      'Processing sensitive customer biometric or health data without a formal DPIA on file.',
      'Missing Data Processing Addendum (DPA) with standard contractual clauses for transatlantic data transfers.'
    ],
    liveDemonstrationArtifacts: [
      'Master Statutory & Regulatory Compliance Register Spreadsheet',
      'Completed Data Protection Impact Assessment (DPIA) for AI System',
      'Signed Master Services Agreement (MSA) & Standard DPA Template',
      'Commercial AI Training Data License Contracts with IP Indemnities'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure compliance with data protection laws when customer data is processed by third-party LLM providers?',
        targetRole: 'Data Protection Officer (DPO) / Legal Counsel',
        modelAnswer: 'We enforce enterprise Zero-Data-Retention (ZDR) agreements with LLM API vendors ensuring customer data is never used to train foundational models. We conduct a DPIA, ensure encryption in transit/rest, and execute signed DPAs with standard contractual clauses.',
        auditTrapAnswer: 'Our developers use whatever open-source model or API is fastest for their sprint.',
        requiredArtifacts: 'Enterprise LLM Vendor DPA with Zero-Data-Retention Clause'
      }
    ]
  },
  {
    code: 'DEPT_PROCUREMENT_VRM',
    name: 'Procurement & Vendor Risk Management',
    shortName: 'Procurement & VRM',
    headTitle: 'Head of Procurement / Third-Party Risk Director',
    iconName: 'Truck',
    description: 'Third-party vendor risk tiering, material cloud outsourcing registers, annual vendor SOC 2 / ISO 27001 certificate tracking, and SLA enforcement.',
    color: 'text-orange-400',
    accentBg: 'bg-orange-500/10 hover:bg-orange-500/15',
    borderColor: 'border-orange-500/30',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    focusAreas: [
      'Third-Party Supplier Security Risk Assessment & Tiering Matrix (A.5.19 / ISO 42001 A.10)',
      'Material Cloud & Outsourced Service Provider Register (A.5.21 / MAS TRM Sec 6.0)',
      'Mandatory Security, Right-to-Audit & Data Destruction Clauses (A.5.20 / MAS Sec 6.3)',
      'Annual Vendor SOC 2 Type II / ISO 27001 Certificate Collection (A.5.22 / MAS Sec 6.4)',
      'Supply Chain Contingency & Vendor Exit Transition Plans'
    ],
    keyAuditorInterviewTopics: [
      'Show me how vendors are categorized into High, Medium, and Low risk tiers before contract signing.',
      'Show me the current SOC 2 Type II or ISO 27001 certificate for your primary cloud hosting provider.',
      'What happens if a critical SaaS vendor fails their annual security review?'
    ],
    topAuditTrapsToAvoid: [
      'Contracting with critical cloud vendors without conducting a pre-contract security risk assessment.',
      'Expired SOC 2 or ISO 27001 certificates on file for critical subprocessors.',
      'Absence of exit strategies or data repatriation terms in material outsourcing agreements.'
    ],
    liveDemonstrationArtifacts: [
      'Master Vendor Risk Register with Risk Tiering & Business Impact Scores',
      'Current SOC 2 Type II Report and Bridge Letters for Cloud Providers',
      'Signed Vendor Security Assessment Questionnaire (SIG/CAIQ) Sample',
      'Material Outsourcing Register formatted to MAS Guidelines Sec 6.0'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you monitor the ongoing security posture of your critical cloud suppliers and AI providers?',
        targetRole: 'Procurement Director / Vendor Risk Lead',
        modelAnswer: 'We maintain an automated Vendor Risk Register. Tier 1 Critical vendors must submit annual SOC 2 Type II reports (with clean bridge letters) or ISO 27001 certificates. We evaluate vendor SIG questionnaires and track real-time security telemetry using external rating feeds.',
        auditTrapAnswer: 'We assume major providers like AWS and Google are secure so we do not review them.',
        requiredArtifacts: 'Vendor Risk Evaluation Matrix + AWS SOC 2 Type II Package'
      }
    ]
  },
  {
    code: 'DEPT_EXEC_BOARD',
    name: 'Executive Board & C-Suite Governance',
    shortName: 'Executive & Board',
    headTitle: 'Chief Executive Officer (CEO) / Board Risk Committee',
    iconName: 'Building',
    description: 'ISMS / AIMS Scope approval, Risk Appetite Statement, Statement of Applicability, Annual Management Review Meeting (MRM) minutes, and resource allocation.',
    color: 'text-rose-400',
    accentBg: 'bg-rose-500/10 hover:bg-rose-500/15',
    borderColor: 'border-rose-500/30',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    focusAreas: [
      'ISMS & AIMS Scope, Policy & Strategic Alignment Approval (Cl 4.3, 5.1, 5.2)',
      'Enterprise Risk Appetite Statement & Risk Treatment Authorization (Cl 6.1.3)',
      'Statement of Applicability (SoA) Executive Sign-off (Cl 6.1.3 d)',
      'Annual Management Review Meeting (MRM) Minutes & Budget Allocation (Cl 9.3)',
      'MAS TRMF Board Oversight & Senior Management Accountability (MAS Sec 3.0)'
    ],
    keyAuditorInterviewTopics: [
      'How does executive leadership demonstrate commitment and active oversight of the ISMS and AIMS?',
      'Show me the minutes and action decisions from your most recent Management Review Meeting.',
      'How is sufficient budget and human resourcing ensured for security and compliance obligations?'
    ],
    topAuditTrapsToAvoid: [
      'Management Review Meeting conducted without covering mandatory ISO Clause 9.3 agenda inputs.',
      'Lack of executive awareness or inability of C-suite to speak to the company risk appetite during interview.',
      'Unsigned policies or policies drafted without formal executive authorization.'
    ],
    liveDemonstrationArtifacts: [
      'Signed Board Resolution approving Information Security & AI Governance Charters',
      'Comprehensive MRM Minutes pack with CEO/CISO signatures and budget approvals',
      'Enterprise Technology Risk Appetite Statement and Metric Thresholds',
      'Board Risk Committee Quarterly Information Security Briefing Deck'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you verify that the information security and AI management systems remain suitable, adequate, and effective?',
        targetRole: 'CEO / Board Member / CISO',
        modelAnswer: 'Through our annual formal Management Review Meeting (MRM) and quarterly Board Risk Committee briefings. We systematically review internal audit findings, incident trends, risk treatment status, regulatory changes, and allocate dedicated budget for continual improvement.',
        auditTrapAnswer: 'I delegate everything to IT; they handle security and let me know if something explodes.',
        requiredArtifacts: 'Signed Annual MRM Meeting Pack + Board Approval Minutes'
      }
    ]
  },
  {
    code: 'DEPT_IT_OPS',
    name: 'IT Operations & Workplace Tech',
    shortName: 'IT Operations',
    headTitle: 'IT Operations Manager / Workplace Technology Lead',
    iconName: 'Laptop',
    description: 'Asset hardware/software inventory, Privileged Access Management (PAM), quarterly access recertifications, endpoint MDM encryption, and Change Management.',
    color: 'text-teal-400',
    accentBg: 'bg-teal-500/10 hover:bg-teal-500/15',
    borderColor: 'border-teal-500/30',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    focusAreas: [
      'Comprehensive Hardware & Software Asset Inventory (A.5.9, A.5.10 / MAS Sec 4.0)',
      'Privileged Access Management (PAM) & Quarterly Access Recertification (A.5.15, A.5.18)',
      'Endpoint MDM, Full Disk Encryption (BitLocker/FileVault) & Remote Wipe (A.8.1)',
      'Change Advisory Board (CAB) Approval Logs & Production Deployment Tickets (A.8.32)',
      'Physical Facility Security, Visitor Logs & Clean Desk Controls (A.7.1, A.7.7)'
    ],
    keyAuditorInterviewTopics: [
      'Show me the full hardware inventory and verify when it was last reconciled against active directory / MDM.',
      'Show me evidence of the last quarterly user access review across your core databases and cloud consoles.',
      'Demonstrate that all company laptops enforce full disk encryption and screen lock timeouts.'
    ],
    topAuditTrapsToAvoid: [
      'Assets discovered in use that are missing from the formal hardware/software inventory.',
      'Privileged admin accounts assigned to generic usernames with no individual accountability.',
      'Quarterly user access reviews not completed or missing manager sign-offs.'
    ],
    liveDemonstrationArtifacts: [
      'Live MDM (Jamf / Intune) Console showing 100% BitLocker/FileVault disk encryption',
      'Quarterly User Access Review spreadsheets signed by Department Heads',
      'Automated Hardware/Software CMDB Inventory with asset owner tags',
      'Change Advisory Board (CAB) Weekly Meeting Minutes and Jira Deployment Approvals'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure that former employees or transferred staff do not retain excessive or obsolete privileges?',
        targetRole: 'IT Operations Lead / IAM Admin',
        modelAnswer: 'We conduct formal quarterly user access recertifications across all critical systems (AWS, GitHub, Google Workspace, Jira, Salesforce). System owners must affirmatively re-approve each user access right. Any unverified account is automatically suspended.',
        auditTrapAnswer: 'Managers usually email us if someone changes departments.',
        requiredArtifacts: 'Q3 User Access Recertification Report with Department Head Sign-offs'
      }
    ]
  }
];

export interface EvidenceChecklistItem {
  id: string;
  framework: 'ISO/IEC 27001:2022' | 'ISO/IEC 42001:2023' | 'MAS TRM 2021';
  frameworkCode: string; // e.g. "ISO_27001", "ISO_42001", "MAS_TRM"
  clauseOrControl: string;
  category: string;
  title: string;
  type: 'MANDATORY_RECORD' | 'POLICY_PROCEDURE' | 'TECHNICAL_LOG_CONFIG' | 'THIRD_PARTY_AUDIT' | 'MEETING_MINUTES' | 'TEST_REPORT';
  priority: 'CRITICAL_STAGE_1' | 'HIGH_STAGE_2' | 'CONTINUOUS_MONITORING';
  estimatedPrepTimeHours: number;
  templateAvailable: boolean;

  // Department Mapping
  department: string;
  departmentCode: DepartmentCode;
  deptHeadRole: string;
  departmentKeyArtifact: string;

  // Chief Implementer Perspective (Preparation & Packaging)
  implementerGuide: {
    whatToPrepare: string;
    mandatorySections: string[];
    recommendedFormat: string;
    collectionCadence: string;
    responsibleRole: string;
    packagingTip: string;
    commonMistakesToAvoid: string;
  };

  // Chief Lead Auditor Perspective (Inspection & Testing Protocols)
  auditorGuide: {
    auditStage: 'Stage 1 (Documentation Review)' | 'Stage 2 (Implementation & Effectiveness)' | 'Surveillance Audit' | 'Regulatory Inspection (MAS)';
    testingMethod: 'DOCUMENT_INSPECTION' | 'INQUIRY_INTERVIEW' | 'TECHNICAL_OBSERVATION' | 'SAMPLE_REPERFORMANCE';
    auditorExpectations: string;
    minimumSampleSize: string;
    auditInterviewQuestions: string[];
    redFlagsAndNCReasons: string;
    classificationIfMissing: 'MAJOR_NC' | 'MINOR_NC' | 'OFI';
  };

  // Status for tracking
  defaultStatus: 'Prepared' | 'In Progress' | 'Missing' | 'Verified';
  attachedEvidenceId?: string;
}

export const EVIDENCE_CHECKLIST_MASTER_DATA: EvidenceChecklistItem[] = [
  // ==========================================
  // ISO/IEC 27001:2022 - CLAUSES 4-10 & ANNEX A
  // ==========================================
  {
    id: 'EVD-27K-001',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Clause 4.3',
    category: 'Context & Scope',
    title: 'ISMS Scope Statement & System Boundaries Document',
    type: 'MANDATORY_RECORD',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 6,
    templateAvailable: true,
    department: 'Executive Board & C-Suite Governance',
    departmentCode: 'DEPT_EXEC_BOARD',
    deptHeadRole: 'Chief Information Security Officer (CISO) / Legal Counsel',
    departmentKeyArtifact: 'Signed ISMS Scope Definition v2.1 with AWS/GCP Boundary Architecture Diagram',
    implementerGuide: {
      whatToPrepare: 'Formal documented ISMS Scope statement defining physical locations, organizational units, cloud infrastructure (AWS/Azure/GCP), customer-facing SaaS apps, and explicit justifications for any excluded systems.',
      mandatorySections: ['Organizational Boundaries', 'Physical & Logical Scope', 'In-Scope Cloud SaaS Systems', 'Interested Parties & Statutory Obligations', 'Exclusions Justification'],
      recommendedFormat: 'Approved & Signed PDF Document (v1.0 or newer)',
      collectionCadence: 'Annual',
      responsibleRole: 'Chief Information Security Officer (CISO) / Legal Counsel',
      packagingTip: 'Ensure the company legal registered name and official address match your commercial registry and certification application form exactly.',
      commonMistakesToAvoid: 'Excluding core customer-facing production servers or outsourced data centers without formal risk justification.'
    },
    auditorGuide: {
      auditStage: 'Stage 1 (Documentation Review)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'The auditor verifies that the scope is unambiguous, covers all critical data flows, addresses stakeholder requirements (Clause 4.2), and does not artificially exclude high-risk operations.',
      minimumSampleSize: '100% (Single Authoritative Document)',
      auditInterviewQuestions: [
        'How did you determine the boundaries of the ISMS?',
        'Are there any third-party hosted systems or remote workers that process customer data outside this defined perimeter?',
        'When was this scope last reviewed with executive management?'
      ],
      redFlagsAndNCReasons: 'Failure to document scope or arbitrary exclusion of customer-facing infrastructure without justification leads to an immediate Major Non-Conformity.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-002',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Clause 6.1.2 & 6.1.3',
    category: 'Risk Management',
    title: 'Information Security Risk Assessment & Treatment Register',
    type: 'MANDATORY_RECORD',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 16,
    templateAvailable: true,
    department: 'Information Security & Cyber SOC',
    departmentCode: 'DEPT_INFOSEC_SOC',
    deptHeadRole: 'Head of Information Security / Risk Lead',
    departmentKeyArtifact: 'Dynamic GRC Risk Register with 5x5 Scoring & Residual Risk Matrix',
    implementerGuide: {
      whatToPrepare: 'Risk assessment methodology and completed risk treatment register mapping asset threats, vulnerabilities, likelihood/impact scoring (5x5 matrix), treatment option (Mitigate/Transfer/Avoid/Accept), and assigned risk owners.',
      mandatorySections: ['Risk Assessment Methodology & Criteria', 'Asset/Process Threat Catalog', 'Inherent vs Residual Scoring', 'Treatment Plans & Action Deadlines', 'Risk Owner Sign-Offs'],
      recommendedFormat: 'Structured GRC Export / Signed Risk Register Spreadsheet with version control',
      collectionCadence: 'Quarterly',
      responsibleRole: 'Head of Information Security / Risk Lead',
      packagingTip: 'Ensure all residual risks rated "High" have signed executive risk acceptance forms with explicit mitigation milestones.',
      commonMistakesToAvoid: 'Assessing risks once before the audit and having zero evidence of ongoing risk updates when new systems or vulnerabilities arise.'
    },
    auditorGuide: {
      auditStage: 'Stage 1 (Documentation Review)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor tests whether the risk scoring methodology is repeatable, consistently applied, and directly generates the Statement of Applicability (SoA) controls.',
      minimumSampleSize: 'Sample 10 High/Medium Risk Scenarios across Assets, Vendors, and Engineering',
      auditInterviewQuestions: [
        'Walk me through how you assess a newly discovered vulnerability in your production environment.',
        'Who has the authority to formally accept a residual risk above the organizational risk tolerance threshold?',
        'Show me evidence of the latest quarterly risk review meeting.'
      ],
      redFlagsAndNCReasons: 'Lack of defined risk criteria, unassigned risk owners, or risks with no corresponding Annex A controls selected.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-003',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Clause 6.1.3 d) & Annex A',
    category: 'Statement of Applicability',
    title: 'Statement of Applicability (SoA) with Cryptographic Baseline',
    type: 'MANDATORY_RECORD',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 12,
    templateAvailable: true,
    department: 'Executive Board & C-Suite Governance',
    departmentCode: 'DEPT_EXEC_BOARD',
    deptHeadRole: 'CISO / Lead Auditor',
    departmentKeyArtifact: 'Master 93-Control Statement of Applicability with SHA-256 Digest Export',
    implementerGuide: {
      whatToPrepare: 'The comprehensive Statement of Applicability covering all 93 ISO/IEC 27001:2022 Annex A controls. For every single control: indicate Applicable (Yes/No), Implementation Status, Legal/Contractual justification, and control reference.',
      mandatorySections: ['93 Annex A Control Mappings', 'Inclusion / Exclusion Justifications', 'Implementation Status (Implemented / In Progress)', 'Documented Evidence References', 'Executive Approval Date & Hash'],
      recommendedFormat: 'Locked GRC Statement of Applicability with SHA-256 Digest Export',
      collectionCadence: 'Annual',
      responsibleRole: 'CISO / Lead Auditor',
      packagingTip: 'Ensure exclusions are explicitly justified (e.g., A.7.4 Physical security of remote sites is excluded if 100% serverless/cloud). Never state "Not Applicable" without written rationale.',
      commonMistakesToAvoid: 'Using the obsolete 2013 114-control standard instead of the 2022 93-control 4-theme structure.'
    },
    auditorGuide: {
      auditStage: 'Stage 1 (Documentation Review)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'Auditor cross-checks the SoA against the Risk Treatment Plan and checks that all mandatory exclusions are legally and operationally sound.',
      minimumSampleSize: '100% of all 93 Controls & 100% of Excluded Controls',
      auditInterviewQuestions: [
        'Why was control A.7.4 (Physical monitoring) excluded from your SoA?',
        'How does your SoA reflect the new 2022 controls like Threat Intelligence (A.5.7) and Data Masking (A.8.11)?',
        'Show me the formal management sign-off for this baseline version.'
      ],
      redFlagsAndNCReasons: 'Missing SoA, missing justification for excluded controls, or unapproved draft status during Stage 1 audit.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-004',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Clause 9.2 & 9.3',
    category: 'Internal Audit & Governance',
    title: 'Annual Internal Audit Report & Management Review Meeting (MRM) Minutes',
    type: 'MEETING_MINUTES',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 10,
    templateAvailable: true,
    department: 'Executive Board & C-Suite Governance',
    departmentCode: 'DEPT_EXEC_BOARD',
    deptHeadRole: 'Internal Audit Lead / C-Level Executive Board',
    departmentKeyArtifact: 'Signed Board MRM Minutes Pack & Comprehensive Internal Audit Findings Matrix',
    implementerGuide: {
      whatToPrepare: 'Internal audit plan, independent internal audit working papers, formal audit report covering all clauses and Annex A controls, and signed Management Review Meeting (MRM) minutes covering mandatory agenda items.',
      mandatorySections: ['Internal Auditor Independence Declaration', 'Internal Audit Findings & Corrective Action Plans (CAPA)', 'MRM Mandatory Agenda (Risk review, Incident trends, Resource needs, Continual improvement)', 'Executive Board Signatures'],
      recommendedFormat: 'Signed Internal Audit Report & Board MRM Minutes PDF',
      collectionCadence: 'Annual',
      responsibleRole: 'Internal Audit Lead / C-Level Executive Board',
      packagingTip: 'Management Review Meeting MUST occur AFTER the Internal Audit report is completed so the board can formally review internal audit findings.',
      commonMistakesToAvoid: 'Auditing own work (internal auditor auditing their own operational department) or omitting mandatory MRM agenda topics listed in ISO 27001 Clause 9.3.'
    },
    auditorGuide: {
      auditStage: 'Stage 1 (Documentation Review)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'Auditor verifies that an internal audit was completed by an independent auditor prior to the Stage 1 audit, and that top management actually reviewed the results and allocated resources.',
      minimumSampleSize: '1 Full Internal Audit Report & 1 Full MRM Pack',
      auditInterviewQuestions: [
        'Who conducted your internal audit, and how was auditor independence guaranteed?',
        'What non-conformities were discovered during the internal audit, and are they tracked in your CAPA register?',
        'What decisions regarding resource allocation or budget were made during the last Management Review?'
      ],
      redFlagsAndNCReasons: 'No internal audit conducted prior to Stage 1, non-independent auditor, or MRM missing mandatory Clause 9.3 agenda topics.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-005',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Annex A.5.15 & A.5.18',
    category: 'Identity & Access Management',
    title: 'Privileged Access Management (PAM) Policy & Quarterly User Access Recertification Log',
    type: 'TECHNICAL_LOG_CONFIG',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'IT Operations & Workplace Tech',
    departmentCode: 'DEPT_IT_OPS',
    deptHeadRole: 'IAM Administrator / IT Operations Lead',
    departmentKeyArtifact: 'Q3 Signed Multi-System Access Recertification Sheets & Okta Admin MFA Logs',
    implementerGuide: {
      whatToPrepare: 'Access control policy, list of privileged administrators across AWS/Azure, Google Workspace, GitHub, databases, and production servers, plus signed quarterly manager recertification approvals.',
      mandatorySections: ['Privileged Account Inventory', 'MFA Enforcement Configuration (FIDO2 / TOTP)', 'Quarterly Recertification Sign-off by Dept Heads', 'Timely Revocation of Dormant Accounts'],
      recommendedFormat: 'CSV Access Export + Signed Department Manager Sign-Off PDF',
      collectionCadence: 'Quarterly',
      responsibleRole: 'IAM Administrator / IT Operations Lead',
      packagingTip: 'Filter out service accounts and show explicit human-to-account mappings. Highlight 100% MFA enforcement on all administrative portals.',
      commonMistakesToAvoid: 'Having shared root/admin accounts without individual accountability or missing recertification records for the past 2 quarters.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor tests whether privileges follow principle of least privilege, MFA is strictly enforced on all admin accounts, and quarterly access reviews result in active deprovisioning of departed or transferred staff.',
      minimumSampleSize: 'Sample 25 User Accounts (including 10 privileged admins and 5 recent transfers)',
      auditInterviewQuestions: [
        'How do you identify and disable dormant accounts that have not logged in for 90 days?',
        'Show me the approval ticket for granting database write access to Engineer X.',
        'Walk me through the last quarterly access review and show me any revocations that occurred as a result.'
      ],
      redFlagsAndNCReasons: 'Failure to enforce MFA on cloud root accounts, or discovering active accounts belonging to employees terminated >30 days ago.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-006',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Annex A.6.1, A.6.2, A.6.3 & A.6.5',
    category: 'Human Resources Security',
    title: 'HR Security Lifecycle: Background Screening, Signed NDAs, LMS Training & 24h Offboarding Logs',
    type: 'MANDATORY_RECORD',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 6,
    templateAvailable: true,
    department: 'Human Resources & People Operations',
    departmentCode: 'DEPT_HR_PEOPLE',
    deptHeadRole: 'Head of People / HR Operations Director',
    departmentKeyArtifact: 'BambooHR Background Check Logs, LMS 98.4% Security Training Report & Offboarding SLAs',
    implementerGuide: {
      whatToPrepare: 'Pre-employment background check logs, signed employee confidentiality/NDA agreements, LMS security awareness training completion records (min 95% completion rate), and timestamped offboarding access revocation tickets.',
      mandatorySections: ['Background Verification Policy & Records', 'Signed Acceptable Use Policy (AUP) Acknowledgements', 'Annual Phishing & Security Training Completion Logs', '24-Hour Offboarding SLA Ticket Evidence'],
      recommendedFormat: 'HRMS Automated Compliance Report PDF + Offboarding Ticket Sample Pack',
      collectionCadence: 'Monthly / Continuous',
      responsibleRole: 'Head of People / HR Operations Director',
      packagingTip: 'Redact sensitive national ID numbers in background check samples while preserving candidate name, verification pass status, and screening date.',
      commonMistakesToAvoid: 'Omitting contractors or remote freelancers from background screening and security training rosters.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor samples recent joiners and leavers to verify background checks precede start date and access is terminated within 24 hours of departure.',
      minimumSampleSize: 'Sample 5 New Hires, 5 Offboarded Employees, 5 Contractors',
      auditInterviewQuestions: [
        'Show me the background check and signed NDA for the developer hired last month.',
        'What happens when an employee fails a simulated phishing test three times in a row?',
        'Show me the Jira offboarding ticket for Employee Z showing the exact timestamp their Google Workspace and VPN access was revoked.'
      ],
      redFlagsAndNCReasons: 'Offboarded staff retaining active corporate or cloud credentials post-departure is a Major Non-Conformity.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-007',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Annex A.8.13 & A.8.14',
    category: 'Business Continuity & Data Protection',
    title: 'Backup Architecture Policy & Quarterly Full Restoration Integrity Test Records',
    type: 'TEST_REPORT',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 6,
    templateAvailable: true,
    department: 'Engineering & Cloud DevOps',
    departmentCode: 'DEPT_ENG_DEVOPS',
    deptHeadRole: 'DevOps Lead / Cloud Infrastructure Architect',
    departmentKeyArtifact: 'Quarterly AWS RDS Database Restore Drill Report with SHA-256 Validation (<45min RTO)',
    implementerGuide: {
      whatToPrepare: 'Documented 3-2-1 backup strategy, immutable snapshot configurations (AWS S3 Object Lock / Glacier Vault), automated daily backup logs, and quarterly technical restoration drill execution reports.',
      mandatorySections: ['Backup Cadence & Retention Rules (Daily, Weekly, Monthly)', 'Immutable / WORM Storage & Encryption Configuration (AES-256)', 'Quarterly Restoration Test Execution Logs', 'Measured Recovery Time (RTO) vs SLA (<4 hours)'],
      recommendedFormat: 'Signed Quarterly Backup Drill Report with Terminal Output Logs',
      collectionCadence: 'Quarterly',
      responsibleRole: 'DevOps Lead / Cloud Infrastructure Architect',
      packagingTip: 'Include terminal log screenshots showing the checksum validation of restored database tables against production baseline.',
      commonMistakesToAvoid: 'Presenting backup creation logs without any evidence of test restoration drills.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'Auditor requires concrete proof that backups are not only taken, but are regularly tested for restoration speed and data integrity.',
      minimumSampleSize: 'Sample 4 Quarterly Restore Drill Logs + 1 Live Backup Configuration Inspection',
      auditInterviewQuestions: [
        'When was the last time you performed a full database restoration test from cold storage?',
        'How do you protect your backup snapshots from being deleted by a rogue admin or ransomware attack?',
        'What is your target RTO and RPO, and what were the actual results from the last test drill?'
      ],
      redFlagsAndNCReasons: 'No documented backup restoration tests within the preceding 12 months constitutes a Minor or Major Non-Conformity.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-008',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Annex A.8.8 & A.8.28',
    category: 'Vulnerability Management & Testing',
    title: 'Annual Third-Party Penetration Test Report & Vulnerability Remediation Verification Letter',
    type: 'THIRD_PARTY_AUDIT',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Information Security & Cyber SOC',
    departmentCode: 'DEPT_INFOSEC_SOC',
    deptHeadRole: 'Head of AppSec / CISO',
    departmentKeyArtifact: 'CREST-Certified Penetration Test Report + Official Retest Remediation Sign-off Letter',
    implementerGuide: {
      whatToPrepare: 'Executive summary and technical report from a CREST/OSCP accredited external penetration testing firm, coupled with Jira remediation tickets and an official retest verification letter confirming closure of all High and Critical findings.',
      mandatorySections: ['Scope of Penetration Testing (Web apps, APIs, Cloud infrastructure)', 'Methodology (OWASP Top 10, ASVS)', 'Findings Classification (CVSS v3.1 scores)', 'Remediation Verification & Retest Letter'],
      recommendedFormat: 'External Security Firm Signed PDF Report + Remediation Log',
      collectionCadence: 'Annual (Pen-test) / Continuous (SAST)',
      responsibleRole: 'Head of AppSec / CISO',
      packagingTip: 'Ensure the pen-test occurred within the last 12 months and that any open findings have formal risk acceptance forms with mitigating controls.',
      commonMistakesToAvoid: 'Submitting an automated vulnerability scanner output instead of a manual penetration test performed by a qualified third party.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'Auditor examines whether testing was comprehensive, independent, and that high-severity vulnerabilities were remediated within established SLAs (e.g. Critical < 14 days, High < 30 days).',
      minimumSampleSize: '1 Full External Pen-Test Report + 100% of Critical/High Finding Remediation Evidence',
      auditInterviewQuestions: [
        'Who performed your last penetration test and what were their credentials?',
        'Show me the remediation and retest evidence for Finding #3 (SQL injection / Broken Auth).',
        'How do you manage ongoing vulnerabilities between annual penetration tests?'
      ],
      redFlagsAndNCReasons: 'Unremediated Critical or High vulnerabilities older than standard SLA thresholds without formal risk acceptance.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-009',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Annex A.5.19, A.5.20 & A.5.21',
    category: 'Supplier Relationships',
    title: 'Supplier Security Risk Management Register, SOC 2 / ISO 27001 Certifications & DPA Contracts',
    type: 'THIRD_PARTY_AUDIT',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Procurement & Vendor Risk Management',
    departmentCode: 'DEPT_PROCUREMENT_VRM',
    deptHeadRole: 'Head of Procurement / Vendor Risk Manager',
    departmentKeyArtifact: 'Material Vendor Risk Tiering Register + AWS/GCP SOC 2 Type II Reports & Bridge Letters',
    implementerGuide: {
      whatToPrepare: 'Vendor inventory tiered by criticality (Critical, High, Medium, Low), third-party security assessments, active SOC 2 Type II reports or ISO 27001 certificates for all Tier 1 vendors, and signed Data Processing Addenda (DPAs) with security clauses.',
      mandatorySections: ['Supplier Inventory & Criticality Classification', 'Annual SOC 2 / ISO 27001 Certificate Tracker', 'Security & Right-to-Audit Clauses in Vendor Master Services Agreements', 'Vendor Incident Notification SLAs (<24 hours)'],
      recommendedFormat: 'Vendor GRC Register + ZIP Archive of Vendor Compliance Certificates',
      collectionCadence: 'Annual / Pre-Contract',
      responsibleRole: 'Head of Procurement / Vendor Risk Manager',
      packagingTip: 'Obtain "Bridge Letters" for SOC 2 reports that are older than 6 months to prove coverage across your audit window.',
      commonMistakesToAvoid: 'Failing to track sub-processors or hosting providers that store or process customer personal data.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor samples critical vendors (e.g. AWS, SendGrid, Stripe, Okta) to verify that risk assessments are current and contracts include mandatory security requirements.',
      minimumSampleSize: 'Sample 5 Critical / Tier 1 Suppliers and 5 Tier 2 Suppliers',
      auditInterviewQuestions: [
        'How do you evaluate the security posture of a new SaaS vendor before onboarding?',
        'Show me the current ISO 27001 or SOC 2 report for your primary cloud hosting provider.',
        'What contract clause gives you the right to audit or demand security evidence from critical suppliers?'
      ],
      redFlagsAndNCReasons: 'Using critical cloud vendors with expired certifications or contracts lacking data protection and security clauses.',
      classificationIfMissing: 'MINOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-27K-010',
    framework: 'ISO/IEC 27001:2022',
    frameworkCode: 'ISO_27001',
    clauseOrControl: 'Annex A.5.24, A.5.25 & A.5.28',
    category: 'Incident Management',
    title: 'Security Incident Response Plan (SIRP), 12-Month Incident Log & Post-Mortem CAPA Records',
    type: 'MANDATORY_RECORD',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 6,
    templateAvailable: true,
    department: 'Information Security & Cyber SOC',
    departmentCode: 'DEPT_INFOSEC_SOC',
    deptHeadRole: 'Incident Response Commander / Head of SOC',
    departmentKeyArtifact: 'Incident Management Playbook v4.0 + Annual Tabletop Simulation Exercise Minutes',
    implementerGuide: {
      whatToPrepare: 'Documented Incident Response Plan with severity matrix (P1 to P4), communication trees, regulatory notification rules (e.g., GDPR 72h, MAS 1h), centralized incident log of all security events, and post-incident root-cause analysis (RCA) records.',
      mandatorySections: ['Incident Severity Definitions & Escalation Matrix', 'Roles & Responsibilities (IR Team & Legal)', 'Regulatory & Customer Notification Timelines', 'Post-Incident Review (Lessons Learned) & CAPA Integration'],
      recommendedFormat: 'Incident Playbook PDF + Incident Register Spreadsheet / Jira Service Desk Log',
      collectionCadence: 'Event-Driven / Monthly Review',
      responsibleRole: 'Incident Response Commander / Head of SOC',
      packagingTip: 'If zero P1 security breaches occurred in the past 12 months, include the report from your annual tabletop incident simulation exercise.',
      commonMistakesToAvoid: 'Claiming "we had zero security incidents" when there is no system or log to capture and investigate potential security events.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor tests whether incidents are categorized correctly, investigated promptly, and that root-cause fixes are implemented to prevent recurrence.',
      minimumSampleSize: 'Sample 3 Recent Security Incidents or Tabletop Drill Exercise Records',
      auditInterviewQuestions: [
        'Walk me through how a suspected phishing or credential leak is escalated and handled.',
        'Show me the post-mortem report and corrective actions from your last significant incident.',
        'When was your Incident Response Plan last tested in a simulation drill?'
      ],
      redFlagsAndNCReasons: 'Failure to document security incidents or lack of defined escalation protocols for critical breaches.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },

  // ==========================================
  // ISO/IEC 42001:2023 - ARTIFICIAL INTELLIGENCE MANAGEMENT SYSTEM (AIMS)
  // ==========================================
  {
    id: 'EVD-42K-001',
    framework: 'ISO/IEC 42001:2023',
    frameworkCode: 'ISO_42001',
    clauseOrControl: 'Clause 5.1, 5.2 & Annex A.2',
    category: 'AI Policy & Leadership',
    title: 'Responsible AI Governance Policy, Ethical Charter & AIMS Scope Definition',
    type: 'POLICY_PROCEDURE',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Legal, Compliance & Data Privacy',
    departmentCode: 'DEPT_LEGAL_PRIVACY',
    deptHeadRole: 'Chief AI Ethics Officer / General Counsel / CISO',
    departmentKeyArtifact: 'Signed Responsible AI Charter & AIMS Boundary Scope Statement v1.2',
    implementerGuide: {
      whatToPrepare: 'Executive-approved Responsible AI Policy defining principles for fairness, transparency, accountability, safety, privacy, and societal impact. Includes explicit AIMS scope boundaries for internal ML models and third-party LLMs.',
      mandatorySections: ['AI Ethics Principles (Fairness, Explainability, Robustness)', 'AI Risk Tolerance Thresholds', 'AIMS Scope & Application Boundaries', 'Board / Executive Sign-off & Policy Review Cadence'],
      recommendedFormat: 'Signed Responsible AI Policy Document PDF',
      collectionCadence: 'Annual',
      responsibleRole: 'Chief AI Ethics Officer / General Counsel / CISO',
      packagingTip: 'Ensure the policy explicitly addresses Generative AI, third-party foundation models (OpenAI, Anthropic), and automated decision-making systems.',
      commonMistakesToAvoid: 'Reusing general IT policies without addressing AI-specific risks like hallucination, bias, data poisoning, and model inversion.'
    },
    auditorGuide: {
      auditStage: 'Stage 1 (Documentation Review)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'Auditor examines whether top management has established an AI policy tailored to the organization role as an AI provider, developer, or deployer, and whether clear accountability exists.',
      minimumSampleSize: '100% (Core Governance Policy)',
      auditInterviewQuestions: [
        'How does your AI Policy govern the use of commercial foundation models versus internally trained models?',
        'Who is designated as the ultimate accountable authority for AI safety in the organization?',
        'How is this policy communicated to data scientists, ML engineers, and product managers?'
      ],
      redFlagsAndNCReasons: 'Absence of an AI-specific policy or lack of top management commitment to AI ethical risk management.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-42K-002',
    framework: 'ISO/IEC 42001:2023',
    frameworkCode: 'ISO_42001',
    clauseOrControl: 'Clause 6.1.4 & Annex A.3',
    category: 'AI Impact Assessment',
    title: 'AI System Impact Assessment (AI-SIA) Dossiers & Societal Harm Evaluations',
    type: 'MANDATORY_RECORD',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 14,
    templateAvailable: true,
    department: 'Data Science & AI / ML Engineering',
    departmentCode: 'DEPT_AI_DATA',
    deptHeadRole: 'Head of AI / Lead ML Engineer / Risk Lead',
    departmentKeyArtifact: 'Completed AI-SIA Dossiers for High-Risk Production Inference Systems',
    implementerGuide: {
      whatToPrepare: 'Documented AI-SIA reports for all production AI models evaluating potential harms to individuals, protected groups, privacy, fundamental rights, safety, and business operations throughout the full AI lifecycle.',
      mandatorySections: ['AI System Description & Intended Purpose', 'Stakeholder & Affected Population Analysis', 'Risk Assessment (Bias, Explainability, Security, Environmental)', 'Mitigation Controls & Residual Risk Evaluation', 'Formal Cross-Functional Approval (Legal, Tech, Ethics)'],
      recommendedFormat: 'Completed AI-SIA Dossier PDFs for each in-scope AI model',
      collectionCadence: 'Event-Driven (Prior to production release & major retraining)',
      responsibleRole: 'Head of AI / Lead ML Engineer / Risk Lead',
      packagingTip: 'Include quantitative thresholds (e.g. demographic parity ratio >= 0.80) and test results within each dossier.',
      commonMistakesToAvoid: 'Deploying high-impact AI systems without performing an AI impact assessment before production release.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor tests whether AI impact assessments are systematically completed prior to deployment, continually updated when models evolve, and effectively mitigate societal and ethical risks.',
      minimumSampleSize: 'Sample 3 Production AI Systems / Model Deployments',
      auditInterviewQuestions: [
        'Walk me through the AI Impact Assessment conducted before launching your automated customer underwriting model.',
        'How did you identify potential adverse impacts on vulnerable user groups?',
        'What controls were added to reduce the risk of discriminatory outcomes?'
      ],
      redFlagsAndNCReasons: 'Operating high-risk or customer-impacting AI models with no documented AI Impact Assessment.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-42K-003',
    framework: 'ISO/IEC 42001:2023',
    frameworkCode: 'ISO_42001',
    clauseOrControl: 'Clause 8.3 & Annex A.7',
    category: 'Data Management & Provenance',
    title: 'Training, Validation & Testing Data Provenance Logs, PII Scrubbing & Lineage Records',
    type: 'TECHNICAL_LOG_CONFIG',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 10,
    templateAvailable: true,
    department: 'Data Science & AI / ML Engineering',
    departmentCode: 'DEPT_AI_DATA',
    deptHeadRole: 'Data Engineering Lead / Chief Data Officer',
    departmentKeyArtifact: 'Automated DVC / Great Expectations Data Lineage & PII Scrubbing Validation Logs',
    implementerGuide: {
      whatToPrepare: 'Data management procedures detailing data collection sources, licensing permissions, data preprocessing / cleaning scripts, automated PII de-identification pipelines, and data versioning lineage across train/validation/test splits.',
      mandatorySections: ['Data Acquisition Sources & Copyright/Licensing Verification', 'Data Preprocessing & PII Scrubbing Specifications', 'Train/Validation/Test Split Strategy & Rationale', 'Data Lineage & Cryptographic Hash Versioning (e.g. DVC, LakeFS)'],
      recommendedFormat: 'Data Lineage Architecture Diagram + Data Validation Pipeline Logs (JSON/PDF)',
      collectionCadence: 'Continuous / Per Training Run',
      responsibleRole: 'Data Engineering Lead / Chief Data Officer',
      packagingTip: 'Provide proof of reproducible data hashes matching the specific weights of your production model checkpoint.',
      commonMistakesToAvoid: 'Training models on unverified web-scraped data containing copyrighted text or unredacted personal data.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'Auditor examines data quality controls, data hygiene protocols, and data provenance mechanisms ensuring models are trained on legitimate, validated datasets.',
      minimumSampleSize: 'Sample 2 Model Training Datasets & Preprocessing Pipelines',
      auditInterviewQuestions: [
        'How do you verify the legal right and licensing terms for data used in model fine-tuning?',
        'Show me how personal identifiers (PII) are scrubbed from training corpuses.',
        'How do you trace a production model artifact back to the exact version of the dataset it was trained on?'
      ],
      redFlagsAndNCReasons: 'Inability to identify the provenance of training data or using PII in training sets without legal justification.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-42K-004',
    framework: 'ISO/IEC 42001:2023',
    frameworkCode: 'ISO_42001',
    clauseOrControl: 'Clause 8.4 & Annex A.6',
    category: 'AI Model Verification & Validation',
    title: 'Adversarial Robustness Testing, LLM Jailbreak Defense & Red-Teaming Reports',
    type: 'TEST_REPORT',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 12,
    templateAvailable: true,
    department: 'Data Science & AI / ML Engineering',
    departmentCode: 'DEPT_AI_DATA',
    deptHeadRole: 'AI Red Team Lead / ML Security Engineer',
    departmentKeyArtifact: 'LLM Prompt-Injection Penetration Test Report & Automated Guardrail Filter Configs',
    implementerGuide: {
      whatToPrepare: 'AI model verification test plans, adversarial robustness evaluations (prompt injection, jailbreaks, data poisoning resistance, evasion attacks), and red-teaming exercise logs with mitigation remediation.',
      mandatorySections: ['Adversarial Attack Simulation Methodology (Garak, PyRIT, OWASP LLM Top 10)', 'Prompt Injection & System Prompt Extraction Test Results', 'Hallucination Rate & Output Guardrail Benchmarks', 'Model Retraining & Mitigation Remediation Matrix'],
      recommendedFormat: 'Technical AI Red-Teaming Report PDF + Guardrail Configuration Export',
      collectionCadence: 'Quarterly / Pre-Release',
      responsibleRole: 'AI Red Team Lead / ML Security Engineer',
      packagingTip: 'Show before-and-after test outputs demonstrating how guardrail layers intercept toxic, illegal, or jailbreak prompts.',
      commonMistakesToAvoid: 'Relying solely on system prompt instructions without automated programmatic input/output guardrails (e.g. NeMo Guardrails, Llama Guard).'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'Auditor verifies that the organization tests AI models against malicious inputs, prompt injection, and unexpected edge cases prior to deployment.',
      minimumSampleSize: '1 Comprehensive AI Red-Teaming Report & Guardrail Rule Review',
      auditInterviewQuestions: [
        'What tools and frameworks do you use for automated adversarial red-teaming of your LLMs?',
        'How do you prevent indirect prompt injection when your AI agent processes third-party documents or web pages?',
        'Show me the security evaluation scorecards from the last release candidate.'
      ],
      redFlagsAndNCReasons: 'Deploying LLM agents with tool-calling or database-write privileges without adversarial testing and guardrails.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-42K-005',
    framework: 'ISO/IEC 42001:2023',
    frameworkCode: 'ISO_42001',
    clauseOrControl: 'Clause 9.1 & Annex A.9',
    category: 'Model Performance & Fairness',
    title: 'Model Card Registry, Algorithmic Bias Metrics (Fairlearn/AIF360) & Explainability (SHAP/LIME)',
    type: 'TECHNICAL_LOG_CONFIG',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 10,
    templateAvailable: true,
    department: 'Data Science & AI / ML Engineering',
    departmentCode: 'DEPT_AI_DATA',
    deptHeadRole: 'Lead Data Scientist / AI Compliance Lead',
    departmentKeyArtifact: 'Centralized Model Cards Registry + Fairlearn Disparate Impact & SHAP Explainability Runs',
    implementerGuide: {
      whatToPrepare: 'Standardized Model Cards for all production models detailing architecture, intended use, limitations, performance benchmarks across demographic sub-groups, and feature importance explainability reports.',
      mandatorySections: ['Model Metadata, Architecture & Hyperparameters', 'Fairness & Bias Evaluation Metrics (Disparate Impact, Equalized Odds)', 'Explainability / Feature Attribution Reports (SHAP/LIME values)', 'Continuous Drift & Performance Monitoring Thresholds'],
      recommendedFormat: 'Structured Model Card Registry Export (Markdown / PDF / MLflow)',
      collectionCadence: 'Monthly / Pre-Release',
      responsibleRole: 'Lead Data Scientist / AI Compliance Lead',
      packagingTip: 'Include SHAP waterfall plots for sample high-stakes predictions to demonstrate explainability to non-technical users.',
      commonMistakesToAvoid: 'Publishing model accuracy metrics in aggregate without evaluating fairness across protected demographic sub-groups.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor reviews model cards to verify transparent reporting of model limitations, bias metrics, and explainability capabilities.',
      minimumSampleSize: 'Sample 3 Production Model Cards across different business use cases',
      auditInterviewQuestions: [
        'How do you explain the factors driving an individual automated credit or classification decision to an end user?',
        'What metrics do you use to measure bias against protected demographic classes?',
        'How frequently are Model Cards updated when models are retrained?'
      ],
      redFlagsAndNCReasons: 'Inability to explain model decision logic for high-impact automated decisions or lack of bias evaluation.',
      classificationIfMissing: 'MINOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-42K-006',
    framework: 'ISO/IEC 42001:2023',
    frameworkCode: 'ISO_42001',
    clauseOrControl: 'Clause 8.5 & Annex A.8',
    category: 'Human Oversight & Safety',
    title: 'Human-in-the-Loop (HITL) Workflow SOP, Override Logs & Autonomous Action Guardrails',
    type: 'POLICY_PROCEDURE',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Data Science & AI / ML Engineering',
    departmentCode: 'DEPT_AI_DATA',
    deptHeadRole: 'Head of Product / AI Operations Lead',
    departmentKeyArtifact: 'HITL Escalation SOP + Audit Log of Human Overrides on AI Output Decisions',
    implementerGuide: {
      whatToPrepare: 'Standard operating procedures for human oversight of AI outputs, threshold criteria for human review (e.g. confidence score < 85%), human override audit logs, and emergency kill-switch procedures for autonomous AI agents.',
      mandatorySections: ['HITL Review Trigger Thresholds & Confidence Scoring', 'Human Reviewer Training & Qualification Requirements', 'Audit Logging of Human Overrides and Model Discrepancies', 'Emergency AI Agent Decommissioning & Fallback Procedures'],
      recommendedFormat: 'HITL Operating Procedure PDF + Human Override Log Export',
      collectionCadence: 'Monthly Review',
      responsibleRole: 'Head of Product / AI Operations Lead',
      packagingTip: 'Show statistical analysis of how often human reviewers agree vs override the AI recommendation.',
      commonMistakesToAvoid: 'Creating autonomous agent workflows that trigger irreversible external actions (e.g., fund transfers, email broadcasting) without human approval gates.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'SAMPLE_REPERFORMANCE',
      auditorExpectations: 'Auditor verifies that human oversight is operational, that reviewers have the authority and competence to override AI outputs, and that override logs are analyzed for model improvement.',
      minimumSampleSize: 'Sample 15 Human Review Decisions & 1 Kill-Switch Procedure Test',
      auditInterviewQuestions: [
        'How does a human reviewer know why the AI recommended a specific action?',
        'What happens when a human operator overrides an AI decision?',
        'How quickly can your engineering team disable or rollback an autonomous AI agent if anomalous behavior is detected?'
      ],
      redFlagsAndNCReasons: 'Lack of human oversight on high-risk autonomous systems or unlogged human overrides.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-42K-007',
    framework: 'ISO/IEC 42001:2023',
    frameworkCode: 'ISO_42001',
    clauseOrControl: 'Annex A.5',
    category: 'AI Resource & Infrastructure Governance',
    title: 'AI Infrastructure & Compute Capacity Management, GPU Allocation & Carbon Footprint Telemetry',
    type: 'TECHNICAL_LOG_CONFIG',
    priority: 'CONTINUOUS_MONITORING',
    estimatedPrepTimeHours: 4,
    templateAvailable: true,
    department: 'Engineering & Cloud DevOps',
    departmentCode: 'DEPT_ENG_DEVOPS',
    deptHeadRole: 'MLOps Infrastructure Engineer / Cloud FinOps Lead',
    departmentKeyArtifact: 'CloudWatch / Datadog GPU Utilization Telemetry & Training Cost Budget Limits',
    implementerGuide: {
      whatToPrepare: 'Cluster resource allocation metrics (NVIDIA GPU utilization, training run duration, inference latency p95/p99), cloud compute budget ceilings, and carbon footprint / energy efficiency estimates for major model training runs.',
      mandatorySections: ['GPU Cluster Provisioning & Access Control', 'Model Training Budget Limits & Approval Gates', 'Inference Latency & Token Usage Telemetry', 'Energy Consumption & Sustainability Tracking'],
      recommendedFormat: 'Datadog/CloudWatch Dashboard Screenshots + Cost Allocation Report',
      collectionCadence: 'Monthly',
      responsibleRole: 'MLOps Infrastructure Engineer / Cloud FinOps Lead',
      packagingTip: 'Demonstrate automated alerting when GPU training cluster costs or token quotas exceed established monthly budgets.',
      commonMistakesToAvoid: 'Unmonitored GPU training clusters running indefinitely with zero resource governance.'
    },
    auditorGuide: {
      auditStage: 'Stage 2 (Implementation & Effectiveness)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'Auditor reviews whether the organization maintains adequate compute resources, monitors model serving capacity, and evaluates resource constraints.',
      minimumSampleSize: 'Sample 2 Production ML Serving Clusters & Training Budgets',
      auditInterviewQuestions: [
        'How do you manage compute capacity to prevent denial of service on your AI inference APIs?',
        'Who authorizes large GPU cluster allocations for foundation model fine-tuning?',
        'Do you assess the environmental impact or energy efficiency of training runs?'
      ],
      redFlagsAndNCReasons: 'No capacity planning or monitoring for AI serving infrastructure causing catastrophic outages.',
      classificationIfMissing: 'OFI'
    },
    defaultStatus: 'Prepared'
  },

  // ==========================================
  // MAS TRM 2021/2024 - MONETARY AUTHORITY OF SINGAPORE
  // ==========================================
  {
    id: 'EVD-MAS-001',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS TRM Sec 3.0',
    category: 'Board & Senior Management Oversight',
    title: 'Board-Approved Technology Risk Management Framework (TRMF) & Risk Appetite Statement',
    type: 'MANDATORY_RECORD',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 12,
    templateAvailable: true,
    department: 'Executive Board & C-Suite Governance',
    departmentCode: 'DEPT_EXEC_BOARD',
    deptHeadRole: 'Board of Directors / Chief Risk Officer (CRO) / CISO',
    departmentKeyArtifact: 'Board Approved Technology Risk Management Framework (TRMF) Resolution',
    implementerGuide: {
      whatToPrepare: 'Board-approved Technology Risk Management Framework (TRMF), Technology Risk Appetite Statement with quantitative tolerance limits (e.g. unscheduled downtime < 4 hours/year), and Board Risk Committee quarterly meeting minutes.',
      mandatorySections: ['Board & Senior Management Roles & Responsibilities', 'Technology Risk Appetite & Tolerance Limits', 'Three Lines of Defense Governance Model', 'Annual TRMF Review & Board Resolution Sign-Off'],
      recommendedFormat: 'Signed Board Resolution & TRMF Policy Pack PDF',
      collectionCadence: 'Annual',
      responsibleRole: 'Board of Directors / Chief Risk Officer (CRO) / CISO',
      packagingTip: 'Highlight the formal board resolution date and ensure senior management roles (CISO, CIO, CRO) have distinct, non-conflicting responsibilities.',
      commonMistakesToAvoid: 'Submitting draft policies without formal Board of Directors approval minutes.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'MAS inspectors verify that the Board of Directors and Senior Management maintain active oversight of technology risk, approve the risk appetite, and regularly review risk reports.',
      minimumSampleSize: '100% (Board Policy & 4 Quarterly Committee Meeting Minutes)',
      auditInterviewQuestions: [
        'How often does the Board of Directors review technology and cyber risk metrics?',
        'Show me the formal board approval for your current Technology Risk Appetite Statement.',
        'What actions were taken when a technology risk metric breached established tolerance levels?'
      ],
      redFlagsAndNCReasons: 'Failure to present board-approved TRMF documentation leads to immediate regulatory censure by MAS.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-MAS-002',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS TRM Sec 4.0 & 11.0',
    category: 'Critical IT Systems & Recovery',
    title: 'Critical IT Systems Register, RTO/RPO Tiering (<4hr SLA) & Technical Disaster Recovery (DR) Drills',
    type: 'TEST_REPORT',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 16,
    templateAvailable: true,
    department: 'Engineering & Cloud DevOps',
    departmentCode: 'DEPT_ENG_DEVOPS',
    deptHeadRole: 'Head of IT Infrastructure / Disaster Recovery Coordinator',
    departmentKeyArtifact: 'Critical Systems Classification Matrix (<4hr RTO) & Annual Multi-Region DR Drill Report',
    implementerGuide: {
      whatToPrepare: 'Inventory of all IT systems with clear designation of "Critical Systems", Business Impact Analysis (BIA), Maximum Tolerable Downtime (MTD), RTO <= 4 hours, and annual full-scale technical Disaster Recovery (DR) failover test reports.',
      mandatorySections: ['Critical Systems Classification & Dependency Mapping', 'RTO/RPO SLAs (RTO <= 4 hours for Critical Systems)', 'Annual DR Test Plan & Live Failover Execution Report', 'Independent Observer Sign-Off & RTO Verification'],
      recommendedFormat: 'Comprehensive DR Test Execution Report with Live Terminal Timestamps PDF',
      collectionCadence: 'Annual (Mandatory)',
      responsibleRole: 'Head of IT Infrastructure / Disaster Recovery Coordinator',
      packagingTip: 'Document exact start and completion timestamps during the live DR drill to mathematically prove RTO <= 4 hours.',
      commonMistakesToAvoid: 'Testing only table-top discussions instead of actual live technical traffic failover to secondary cloud regions.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'MAS inspectors require documented proof of annual live DR failover tests demonstrating recovery of critical customer-facing banking/financial services within 4 hours.',
      minimumSampleSize: '100% of Critical Systems DR Test Reports & BIA Review',
      auditInterviewQuestions: [
        'Walk me through the results of your last live Disaster Recovery failover test.',
        'What was the exact recovery time achieved for your critical transaction database?',
        'Who acted as the independent witness/validator during the DR exercise?'
      ],
      redFlagsAndNCReasons: 'RTO exceeding 4 hours for critical systems or failing to conduct an annual technical DR drill.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-MAS-003',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS TRM Sec 12.0',
    category: 'Regulatory Incident Notification',
    title: '1-Hour MAS Incident Escalation Playbook & Incident Investigation Report (Template & Records)',
    type: 'MANDATORY_RECORD',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 6,
    templateAvailable: true,
    department: 'Information Security & Cyber SOC',
    departmentCode: 'DEPT_INFOSEC_SOC',
    deptHeadRole: 'CISO / Head of Regulatory Compliance',
    departmentKeyArtifact: 'MAS 1-Hour Notification Incident Runbook + Formal 14-Day RCA Template Pack',
    implementerGuide: {
      whatToPrepare: 'Incident Management SOP detailing statutory mandate to notify MAS within 1 hour of discovering a critical system disruption or major security breach, followed by a formal root-cause analysis report within 14 calendar days.',
      mandatorySections: ['1-Hour MAS Notification Trigger Criteria (System unavailability, Data breach)', 'MAS Regulatory Contact Matrix & Electronic Submission Channels', '14-Day Comprehensive Incident Investigation Report Template', 'Post-Incident Action Item Tracking & Board Escalation'],
      recommendedFormat: 'MAS Notification Playbook PDF + Incident Investigation Archive',
      collectionCadence: 'Continuous / Quarterly Audit',
      responsibleRole: 'CISO / Head of Regulatory Compliance',
      packagingTip: 'Include sample MAS Incident Notification Form (Form TRM-1) pre-filled with organizational and regulatory liaison details.',
      commonMistakesToAvoid: 'Misinterpreting the 1-hour rule as starting after the investigation finishes; it starts upon confirmation of a severe disruption.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'MAS inspectors verify that the financial institution has foolproof procedures to alert MAS within 60 minutes of a major incident and submit the 14-day RCA.',
      minimumSampleSize: '100% of Incidents in past 12 months & Escalation SOP Review',
      auditInterviewQuestions: [
        'Who has the authority to transmit the 1-hour incident notification to MAS?',
        'Show me the incident records from the past year to verify all relevant outages met the 1-hour reporting requirement.',
        'What is your procedure for compiling and submitting the 14-day comprehensive root-cause report to MAS?'
      ],
      redFlagsAndNCReasons: 'Failure to notify MAS within the 1-hour statutory window during a major outage is a critical regulatory violation.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-MAS-004',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS TRM Sec 6.0 & Cloud Guidelines',
    category: 'Third-Party & Material Cloud Outsourcing',
    title: 'Material Cloud Outsourcing Register, Due Diligence Assessments & MAS Notification Letters',
    type: 'MANDATORY_RECORD',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 10,
    templateAvailable: true,
    department: 'Procurement & Vendor Risk Management',
    departmentCode: 'DEPT_PROCUREMENT_VRM',
    deptHeadRole: 'Head of Procurement / Vendor Risk Manager',
    departmentKeyArtifact: 'Material Outsourcing Register formatted to MAS Guidelines Sec 6.0',
    implementerGuide: {
      whatToPrepare: 'Register of all material outsourced service providers and cloud services (AWS/Azure/GCP), pre-contract due diligence assessments, right-to-audit and inspection clauses, multi-tenancy risk analysis, and MAS notification records.',
      mandatorySections: ['Materiality Assessment Methodology', 'Master Register of Material Cloud Service Providers', 'Right-to-Audit & MAS Inspection Clauses in SLAs', 'Cloud Service Provider Disaster Recovery & Exit Strategy'],
      recommendedFormat: 'MAS Material Outsourcing Register Spreadsheet + Cloud Due Diligence Dossiers',
      collectionCadence: 'Annual / Pre-Contract',
      responsibleRole: 'Head of Procurement / Vendor Risk Manager',
      packagingTip: 'Ensure cloud provider SLAs explicitly grant MAS and appointed auditors the right to inspect and audit systems.',
      commonMistakesToAvoid: 'Failing to maintain a centralized register of material cloud service providers as required by MAS Outsourcing Guidelines.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'MAS inspectors inspect the material outsourcing register and verify that financial institutions perform rigorous ongoing oversight of third-party cloud risks.',
      minimumSampleSize: '100% of Material Outsourcing Contracts (AWS, Core Banking, AI APIs)',
      auditInterviewQuestions: [
        'How do you determine whether a cloud service constitutes a "Material Outsourcing" arrangement under MAS rules?',
        'Show me the contract clause granting MAS the right to audit your cloud service provider.',
        'How do you assess the concentration risk of relying on a single cloud vendor?'
      ],
      redFlagsAndNCReasons: 'Missing material outsourcing register or agreements that omit MAS audit rights.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-MAS-005',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS TRM Sec 5.0 & 10.0',
    category: 'Identity, Cryptography & Key Management',
    title: 'Hardware Security Module (HSM) Key Management Policy, Key Ceremony Logs & Dual-Control Records',
    type: 'TECHNICAL_LOG_CONFIG',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Engineering & Cloud DevOps',
    departmentCode: 'DEPT_ENG_DEVOPS',
    deptHeadRole: 'Cryptographic Security Lead / Cloud Security Architect',
    departmentKeyArtifact: 'AWS KMS Key Ceremony Logs & Multi-Party Dual Control Sign-Off Records',
    implementerGuide: {
      whatToPrepare: 'Cryptographic policy covering data at rest (AES-256) and in transit (TLS 1.3), Key Management System (KMS / HSM) configuration, key generation ceremony logs under dual control (split-knowledge), and annual key rotation records.',
      mandatorySections: ['Cryptographic Algorithms & Approved Key Lengths', 'HSM / KMS Architecture (FIPS 140-2 Level 3 compliant)', 'Key Generation & Destruction Dual-Control Ceremony Logs', 'Automated Annual Key Rotation Telemetry'],
      recommendedFormat: 'Signed Key Ceremony Minutes PDF + KMS Auto-Rotation Dashboard Screenshot',
      collectionCadence: 'Annual Drill / Event-Driven',
      responsibleRole: 'Cryptographic Security Lead / Cloud Security Architect',
      packagingTip: 'Ensure cryptographic keys are never accessible by a single individual (enforce M-of-N split knowledge).',
      commonMistakesToAvoid: 'Storing unencrypted master encryption keys in software repositories or plain text config files.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'MAS inspectors verify that cryptographic keys protecting customer financial data are securely generated, stored in dedicated HSMs, and rotated systematically under dual control.',
      minimumSampleSize: '1 KMS/HSM Configuration Inspection & 2 Key Ceremony Logs',
      auditInterviewQuestions: [
        'How do you generate and store master encryption keys for customer databases?',
        'Show me the evidence of dual control during your last cryptographic key generation ceremony.',
        'How are API keys, tokens, and database credentials protected and rotated in your production cloud?'
      ],
      redFlagsAndNCReasons: 'Single-person control over cryptographic master keys or hardcoded production secrets in source code.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-MAS-006',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS TRM Sec 7.0 & API Guidelines',
    category: 'Software Architecture & API Security',
    title: 'Secure SDLC Architecture, API Gateway Security & Static/Dynamic Code Analysis (SAST/DAST)',
    type: 'TECHNICAL_LOG_CONFIG',
    priority: 'HIGH_STAGE_2',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Engineering & Cloud DevOps',
    departmentCode: 'DEPT_ENG_DEVOPS',
    deptHeadRole: 'Lead Software Architect / AppSec Lead',
    departmentKeyArtifact: 'GitHub Branch Protection JSON + SonarQube & Snyk Quality Gate Report',
    implementerGuide: {
      whatToPrepare: 'Secure software development policy, mandatory pull request peer review logs with 2-person rule, API gateway configuration (OAuth 2.0 mTLS, rate limiting, payload validation), and automated SonarQube / Snyk scan reports blocking high-severity builds.',
      mandatorySections: ['Branch Protection Rules & Mandatory Approval Policies', 'API Authentication & Token Validation Architecture', 'Automated SAST/DAST Pipeline Gating Rules', 'Cryptographic Hashing for Code Commits'],
      recommendedFormat: 'GitHub Branch Rule Screenshot + SonarQube Quality Gate Report PDF',
      collectionCadence: 'Continuous / Per Release',
      responsibleRole: 'Lead Software Architect / AppSec Lead',
      packagingTip: 'Include a screenshot showing that direct commits to the `main` branch are blocked and require at least 1 peer review and automated security scan pass.',
      commonMistakesToAvoid: 'Exposing open banking or financial APIs without rate limiting or without strong token-based authentication.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'MAS inspectors inspect code deployment controls to verify that no single developer can push code directly into production without independent review and automated scanning.',
      minimumSampleSize: 'Sample 10 Production Deployment Pull Requests & 1 API Gateway Config',
      auditInterviewQuestions: [
        'Can an engineer push code straight into production without approval?',
        'How are API rate limits and throttling configured to prevent DDoS attacks against your financial endpoints?',
        'Show me how automated dependency vulnerability scanning is enforced in your CI/CD pipeline.'
      ],
      redFlagsAndNCReasons: 'Lack of segregation of duties in software development (single-person push to production).',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-MAS-007',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS TRM Sec 8.0 & 9.0',
    category: 'Cyber Defense & SOC Telemetry',
    title: '24/7 Security Operations Center (SOC) SLA, 12-Month SIEM Log Retention & Threat Hunting',
    type: 'TECHNICAL_LOG_CONFIG',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Information Security & Cyber SOC',
    departmentCode: 'DEPT_INFOSEC_SOC',
    deptHeadRole: 'Head of SOC / Cloud Security Architect',
    departmentKeyArtifact: 'Splunk / Datadog 12-Month Immutable Retention Bucket Config + 24/7 SOC SLA Matrix',
    implementerGuide: {
      whatToPrepare: 'SOC Service Level Agreement (SLA) with 24/7/365 coverage (<15 min response to Critical alerts), SIEM retention policy ensuring at least 12 months of centralized security logs (with 3 months hot online), and quarterly threat hunting reports.',
      mandatorySections: ['24x7 SOC Coverage Roster & SLA Metrics', 'Centralized Log Aggregation Topology (Splunk / Datadog / Sentinel)', '12-Month Log Retention Proof & Immutable Storage', 'Quarterly Threat Hunting & IOC Correlation Reports'],
      recommendedFormat: 'SOC Monthly Performance Report PDF + SIEM Retention Bucket Policy Screenshot',
      collectionCadence: 'Monthly Review / 12-Month Retention',
      responsibleRole: 'Head of SOC / Cloud Security Architect',
      packagingTip: 'Provide proof of cold log archiving (e.g. AWS S3 Glacier with Object Lock Compliance Mode) configured for a minimum of 365 days retention.',
      commonMistakesToAvoid: 'Configuring SIEM log retention for only 30 or 90 days, directly violating MAS TRM Sec 8.2 requirement for 12 months minimum.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'TECHNICAL_OBSERVATION',
      auditorExpectations: 'MAS inspectors check that logs from critical servers, databases, firewalls, and admin actions are centralized, tamper-proof, and kept for at least 1 year.',
      minimumSampleSize: '1 SIEM Retention Configuration Inspection & 3 Monthly SOC Performance Reports',
      auditInterviewQuestions: [
        'How long are authentication and database audit logs retained in your SIEM?',
        'Can an administrator with root access delete or modify past SIEM logs?',
        'Show me the Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR) metrics for critical alerts last month.'
      ],
      redFlagsAndNCReasons: 'SIEM log retention less than 12 months or absence of 24/7 security alert monitoring.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  },
  {
    id: 'EVD-MAS-008',
    framework: 'MAS TRM 2021',
    frameworkCode: 'MAS_TRM',
    clauseOrControl: 'MAS Notice 655',
    category: 'Cyber Hygiene Directives',
    title: 'MAS Notice 655 (Mandatory Cyber Hygiene) 6-Directive Compliance Attestation',
    type: 'MANDATORY_RECORD',
    priority: 'CRITICAL_STAGE_1',
    estimatedPrepTimeHours: 8,
    templateAvailable: true,
    department: 'Information Security & Cyber SOC',
    departmentCode: 'DEPT_INFOSEC_SOC',
    deptHeadRole: 'CISO / Head of Compliance',
    departmentKeyArtifact: 'Annual MAS Notice 655 6-Directive Attestation Package + Patching & EDR Coverage Proof',
    implementerGuide: {
      whatToPrepare: 'Annual formal attestation of compliance against the 6 legally binding cyber hygiene mandates: (1) Administrative account security, (2) Security patch installation, (3) Security baseline configurations, (4) Perimeter defense, (5) Malware protection, (6) MFA for admin & email access.',
      mandatorySections: ['6 Mandatory Directive Compliance Matrix', 'Patching SLA Compliance Records (Critical patches <14 days)', 'Endpoint Antivirus & EDR 100% Coverage Report', 'Firewall Rule Review Minutes (Semi-annual)'],
      recommendedFormat: 'MAS Notice 655 Compliance Attestation Pack PDF',
      collectionCadence: 'Semi-Annual',
      responsibleRole: 'CISO / Head of Compliance',
      packagingTip: 'Ensure EDR agent coverage across all corporate laptops and production cloud virtual machines is documented at 100%.',
      commonMistakesToAvoid: 'Non-compliance with MAS Notice 655 carries statutory criminal/financial penalties; ensure zero deviations across the 6 directives.'
    },
    auditorGuide: {
      auditStage: 'Regulatory Inspection (MAS)',
      testingMethod: 'DOCUMENT_INSPECTION',
      auditorExpectations: 'MAS inspectors audit against Notice 655 on a strict pass/fail basis. Any gap in the 6 directives constitutes a formal statutory breach.',
      minimumSampleSize: '100% of the 6 Directives & Sample 20 Endpoint Patch Levels',
      auditInterviewQuestions: [
        'How do you track and verify that critical security patches are deployed within the mandatory timeframe?',
        'Show me the EDR console demonstrating 100% agent installation across all company assets.',
        'When was your last semi-annual firewall rule review conducted, and who approved the rules?'
      ],
      redFlagsAndNCReasons: 'Failure to comply with any of the 6 Notice 655 directives results in immediate statutory penalty from MAS.',
      classificationIfMissing: 'MAJOR_NC'
    },
    defaultStatus: 'Prepared'
  }
];

// ISO 19011 Sample Size Calculator Table
export const ISO19011_SAMPLE_SIZE_GUIDELINES = [
  { populationMin: 1, populationMax: 4, sampleSize: '100% (All Items)', riskRationale: 'Census required for low volume critical items (e.g. Policies, Board packs, Incident post-mortems)' },
  { populationMin: 5, populationMax: 20, sampleSize: '5 to 8 samples', riskRationale: 'Standard sample for quarterly reviews, pen-test findings, or critical vendors' },
  { populationMin: 21, populationMax: 100, sampleSize: '10 to 15 samples', riskRationale: 'Sample size for employee onboarding/offboarding, change tickets' },
  { populationMin: 101, populationMax: 500, sampleSize: '20 to 25 samples', riskRationale: 'Sample size for customer support tickets, access requests, backup jobs' },
  { populationMin: 501, populationMax: 10000, sampleSize: '30 to 45 samples', riskRationale: 'Statistically significant sample (95% confidence level, 5% margin of error) for high-frequency automated events' },
  { populationMin: 10001, populationMax: 9999999, sampleSize: '60 to 80 samples', riskRationale: 'Log sampling with automated anomaly scripts for big data / firewall transactions' }
];
