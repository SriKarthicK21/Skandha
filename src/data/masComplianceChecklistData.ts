// Authoritative Master Data for MAS TRM Compliance Checklist
// Breaks down the 14 core MAS Technology Risk Management (TRM) domains into actionable sub-tasks,
// integrated with statutory MAS Notices (Notice 655, Notice 644) and linked to Findings & CAPA.

import { 
  MAS_2026_CHECKLIST_DOMAINS, 
  CHECKLIST_METHODOLOGY_GUIDE 
} from './masChecklist2026MasterData';

export type ChecklistTaskStatus = 
  | 'COMPLIANT' 
  | 'IN_PROGRESS' 
  | 'GAP_FINDING' 
  | 'NOT_STARTED' 
  | 'NOT_APPLICABLE';

export type TaskPriority = 
  | 'CRITICAL' 
  | 'REQUIRED' 
  | 'ANNUAL' 
  | 'POLICY' 
  | 'GOVERNANCE' 
  | 'DOCS' 
  | 'REVIEW' 
  | 'HIGH' 
  | 'MEDIUM';

export type VerificationMethod = 
  | 'AUTOMATED_SCAN' 
  | 'DOCUMENT_INSPECTION' 
  | 'SYSTEM_CONFIGURATION' 
  | 'AUDIT_INTERVIEW';

export interface MASChecklistSubTask {
  id: string; // e.g. "TASK-MAS-3.1" or "MAS-2026-D1-01"
  domainNumber: string; // "3.0" or "D1"
  domainName: string;
  taskCode: string; // "3.1.1" or "1.1"
  title: string;
  description: string;
  actionableSteps: string[];
  regulatoryRef: string; // e.g. "MAS TRM 3.1 & Notice 644"
  mandatoryNoticeRef?: string; // e.g. "MAS Notice 655 Para 4.1"
  priority: TaskPriority;
  assignedRole: string; // e.g. "Chief Information Security Officer"
  department: string;
  status: ChecklistTaskStatus;
  evidenceRequired: string;
  linkedISOControl?: string; // e.g. "A.5.15"
  linkedFindingId?: string; // e.g. "fnd_gap_1"
  linkedFindingCode?: string; // e.g. "GAP-2026-01"
  verificationMethod: VerificationMethod;
  notes?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface MASDomainChecklistGroup {
  domainNumber: string; // "D1" or "3.0"
  domainName: string;
  shortName: string;
  description: string;
  iconName: string;
  badgeColor: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  guidelineSectionRef?: string;
  expertPractitionerTip?: string;
  subTasks: MASChecklistSubTask[];
}

export { MAS_2026_CHECKLIST_DOMAINS, CHECKLIST_METHODOLOGY_GUIDE };

// Practitioner 2026 Framework (10 Domains, 93 Controls, Industry Standard Aligned)
export const INITIAL_MAS_CHECKLIST_DOMAINS: MASDomainChecklistGroup[] = MAS_2026_CHECKLIST_DOMAINS;

// Legacy statutory chapter-by-chapter mapping (Chapters 3.0 to 16.0)
export const STATUTORY_CHAPTER_CHECKLIST_DOMAINS: MASDomainChecklistGroup[] = [
  // --- DOMAIN 3.0: Technology Risk Governance ---
  {
    domainNumber: '3.0',
    domainName: 'Technology Risk Governance',
    shortName: 'Governance & Leadership',
    description: 'Board and Senior Management oversight, establishment of Technology Risk Committee, and strategic alignment of cybersecurity.',
    iconName: 'Building2',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-3.1',
        domainNumber: '3.0',
        domainName: 'Technology Risk Governance',
        taskCode: '3.1.1',
        title: 'Board & Senior Management Annual TRM Policy Approval',
        description: 'Ensure the Board of Directors or designated Board Risk Committee formally approves the enterprise Technology Risk Management Policy on at least an annual cycle.',
        actionableSteps: [
          'Review current TRM Policy v2.1 against updated MAS circulars.',
          'Table TRM Policy at Q3 Board Risk Committee meeting.',
          'Secure formal Board resolution and minute approval signatures.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 3.1.1',
        priority: 'CRITICAL',
        assignedRole: 'Chief Risk Officer / Board Secretary',
        department: 'Executive Board & Governance',
        status: 'COMPLIANT',
        evidenceRequired: 'Signed Board Minutes approving TRM Policy & Board Risk Committee Charter',
        linkedISOControl: 'A.5.1 / A.5.2',
        verificationMethod: 'DOCUMENT_INSPECTION',
        completedAt: '2026-06-15T10:00:00Z',
        completedBy: 'Marcus Tan (CRO)'
      },
      {
        id: 'TASK-MAS-3.2',
        domainNumber: '3.0',
        domainName: 'Technology Risk Governance',
        taskCode: '3.2.1',
        title: 'Independent CISO Appointment & Direct Executive Escalation Line',
        description: 'Verify the CISO maintains operational independence from IT delivery (cannot report directly to CTO without Board escalation conduit).',
        actionableSteps: [
          'Audit CISO job charter and reporting structure.',
          'Ensure CISO has direct quarterly briefing access to the CEO and Board Risk Committee.',
          'Validate CISO professional certifications (CISSP, CISM).'
        ],
        regulatoryRef: 'MAS TRM Guidelines 3.2.1',
        priority: 'CRITICAL',
        assignedRole: 'Chief Executive Officer / Head of HR',
        department: 'Executive Board & Governance',
        status: 'COMPLIANT',
        evidenceRequired: 'CISO Appointment Charter, Org Chart & Direct Reporting Protocol',
        linkedISOControl: 'A.5.4',
        verificationMethod: 'DOCUMENT_INSPECTION',
        completedAt: '2026-05-10T14:30:00Z',
        completedBy: 'Arjun Mehta (CISO)'
      },
      {
        id: 'TASK-MAS-3.3',
        domainNumber: '3.0',
        domainName: 'Technology Risk Governance',
        taskCode: '3.3.1',
        title: 'Quarterly Technology Risk Committee (TRC) Cadence & Metrics Review',
        description: 'Convene monthly/quarterly Technology Risk Committee meetings reviewing cyber threat telemetry, key risk indicators (KRIs), and major system incidents.',
        actionableSteps: [
          'Collate monthly KRI dashboard (patch SLA, penetration testing findings, downtime stats).',
          'Conduct TRC meeting with documented attendance of business unit heads.',
          'Archive meeting minutes and action item logs in governance repository.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 3.1.3',
        priority: 'HIGH',
        assignedRole: 'Technology Risk Manager',
        department: 'Risk Management & GRC',
        status: 'COMPLIANT',
        evidenceRequired: 'Q1 & Q2 TRC Meeting Packs, Minutes, and Closed Action Item Tracker',
        linkedISOControl: 'A.5.3',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-3.4',
        domainNumber: '3.0',
        domainName: 'Technology Risk Governance',
        taskCode: '3.4.1',
        title: 'Board Cyber Competency & Annual Emerging Threats Training',
        description: 'Conduct annual specialized technology risk and cyber resilience executive briefings for Board members and C-suite executives.',
        actionableSteps: [
          'Engage third-party cybersecurity advisor for Board tabletop threat simulation.',
          'Deliver briefing on AI vulnerabilities, deepfakes, and geopolitical ransomware.',
          'Record training attendance and participant feedback.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 3.1.4',
        priority: 'MEDIUM',
        assignedRole: 'Head of Learning & Dev / CISO',
        department: 'Human Resources & People',
        status: 'IN_PROGRESS',
        evidenceRequired: 'Board Cyber Training Attendance Sheet, Presentation Deck, and Evaluation Records',
        linkedISOControl: 'A.6.3',
        verificationMethod: 'DOCUMENT_INSPECTION'
      }
    ]
  },

  // --- DOMAIN 4.0: Technology Risk Management Framework ---
  {
    domainNumber: '4.0',
    domainName: 'Technology Risk Management Framework',
    shortName: 'Risk Framework & Appetite',
    description: 'Establishment of a comprehensive technology risk management framework (TRMF), risk appetite statement, and continuous risk assessment.',
    iconName: 'ShieldAlert',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-4.1',
        domainNumber: '4.0',
        domainName: 'Technology Risk Management Framework',
        taskCode: '4.1.1',
        title: 'Technology Risk Appetite Statement (RAS) Calibration',
        description: 'Define and calibrate quantitative and qualitative risk appetite thresholds for technology disruptions, data leakage, and regulatory non-compliance.',
        actionableSteps: [
          'Formulate quantifiable risk limits (e.g., zero tolerance for unencrypted PII).',
          'Review risk limits against MAS critical system downtime standards (<= 4 hrs/year).',
          'Secure Board approval for revised RAS matrix.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 4.1.1',
        priority: 'CRITICAL',
        assignedRole: 'Chief Risk Officer',
        department: 'Risk Management & GRC',
        status: 'COMPLIANT',
        evidenceRequired: 'Approved Board Risk Appetite Statement (RAS) & Tolerance Breach Escalation Matrix',
        linkedISOControl: 'A.5.1 / Clause 6.1',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-4.2',
        domainNumber: '4.0',
        domainName: 'Technology Risk Management Framework',
        taskCode: '4.2.1',
        title: 'Dynamic Technology Risk Register & Threat Taxonomy Maintenance',
        description: 'Maintain a centralized, continuously updated Technology Risk Register mapping threats, vulnerabilities, likelihood, impact, and treatment plans.',
        actionableSteps: [
          'Conduct quarterly risk review with IT system owners and DevOps leads.',
          'Update risk scoring using 5x5 impact-likelihood matrix.',
          'Verify treatment plans for high-residual risks are assigned to accountable owners.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 4.2.1',
        priority: 'HIGH',
        assignedRole: 'IT Risk Lead',
        department: 'Risk Management & GRC',
        status: 'COMPLIANT',
        evidenceRequired: 'Export of Skanda GRC Risk Register with Inherent/Residual Heatmap',
        linkedISOControl: 'Clause 6.1.2 / 6.1.3',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-4.3',
        domainNumber: '4.0',
        domainName: 'Technology Risk Management Framework',
        taskCode: '4.3.1',
        title: 'Continuous Cyber Threat Horizon Scanning & Regulatory Circular Review',
        description: 'Establish automated tracking of cybersecurity advisories from SingCERT, FS-ISAC, and MAS regulatory circular updates.',
        actionableSteps: [
          'Configure real-time SingCERT / FS-ISAC alert webhooks into SOC Slack.',
          'Perform weekly triage of published advisories against corporate tech stack.',
          'Document regulatory impact assessments for all new MAS guidance releases.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 4.3.2',
        priority: 'MEDIUM',
        assignedRole: 'Threat Intelligence Analyst',
        department: 'Information Security & SOC',
        status: 'COMPLIANT',
        evidenceRequired: 'Weekly Threat Intelligence Digest & Advisory Triage Runbook',
        linkedISOControl: 'A.5.7',
        verificationMethod: 'DOCUMENT_INSPECTION'
      }
    ]
  },

  // --- DOMAIN 5.0: IT Project Management & Acquisition ---
  {
    domainNumber: '5.0',
    domainName: 'IT Project Management & Acquisition',
    shortName: 'IT Project Management',
    description: 'Project governance, business requirements analysis, vendor solution selection, quality assurance, and project risk reviews.',
    iconName: 'Milestone',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    criticality: 'MEDIUM',
    subTasks: [
      {
        id: 'TASK-MAS-5.1',
        domainNumber: '5.0',
        domainName: 'IT Project Management & Acquisition',
        taskCode: '5.1.1',
        title: 'Mandatory Security & Regulatory Gate in Project Charters',
        description: 'Embed mandatory cybersecurity, privacy, and MAS TRM compliance sign-offs at project initiation, architecture design, and pre-production release.',
        actionableSteps: [
          'Update Project Management Framework to require CISO sign-off before Stage-Gate 3.',
          'Execute Architecture Review Board (ARB) assessment for new projects.',
          'Record stage-gate sign-offs in Jira/Confluence governance templates.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 5.1.2',
        priority: 'HIGH',
        assignedRole: 'Head of PMO / Agile Delivery Lead',
        department: 'Software Engineering & DevOps',
        status: 'COMPLIANT',
        evidenceRequired: 'Approved Project Gate 3 Security Sign-Off Forms & ARB Minutes',
        linkedISOControl: 'A.8.25',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-5.2',
        domainNumber: '5.0',
        domainName: 'IT Project Management & Acquisition',
        taskCode: '5.2.1',
        title: 'Commercial Off-The-Shelf (COTS) Software Security Due Diligence',
        description: 'Perform rigorous third-party software evaluation prior to purchasing enterprise software, validating vendor vulnerability patch cycles and escrow agreements.',
        actionableSteps: [
          'Demand vendor Software Bill of Materials (SBOM) and SOC 2 Type II report.',
          'Execute software composition vulnerability scan on trial packages.',
          'Verify source code escrow clauses for mission-critical core banking modules.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 5.2.1',
        priority: 'MEDIUM',
        assignedRole: 'Procurement Specialist / Enterprise Architect',
        department: 'Procurement & Vendor Management',
        status: 'COMPLIANT',
        evidenceRequired: 'Vendor Security Evaluation Matrix & COTS Technical Assessment Dossier',
        linkedISOControl: 'A.5.21 / A.8.30',
        verificationMethod: 'DOCUMENT_INSPECTION'
      }
    ]
  },

  // --- DOMAIN 6.0: Software Development Life Cycle (SDLC) ---
  {
    domainNumber: '6.0',
    domainName: 'Software Development Life Cycle (SDLC)',
    shortName: 'Secure SDLC & DevSecOps',
    description: 'Secure application development, threat modeling, automated SAST/DAST scanning, and strict separation of non-production data.',
    iconName: 'Code2',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-6.1',
        domainNumber: '6.0',
        domainName: 'Software Development Life Cycle (SDLC)',
        taskCode: '6.1.1',
        title: 'Secure Coding Standards (OWASP Top 10 & ASVS Level 2)',
        description: 'Adopt formal secure coding standards covering input validation, output encoding, SQL injection defense, and cryptographic salt routines.',
        actionableSteps: [
          'Publish Secure Coding Guidelines v3.4 aligned with OWASP ASVS 4.0.',
          'Mandate developer completion of annual secure coding training.',
          'Audit peer code review checklists for mandatory security verification.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 6.1.1',
        priority: 'CRITICAL',
        assignedRole: 'Lead Application Security Architect',
        department: 'Software Engineering & DevOps',
        status: 'COMPLIANT',
        evidenceRequired: 'Secure Coding Policy v3.4 & Developer Secure Code Training Certifications',
        linkedISOControl: 'A.8.28',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-6.2',
        domainNumber: '6.0',
        domainName: 'Software Development Life Cycle (SDLC)',
        taskCode: '6.2.1',
        title: 'Automated SAST & Secret Scanning in CI/CD Blocking Gates',
        description: 'Enforce automated Static Application Security Testing (SAST) and hardcoded secret scanning in GitHub Actions pipeline that blocks merges on High/Critical flaws.',
        actionableSteps: [
          'Configure Snyk/SonarQube gate to fail builds on OWASP High vulnerabilities.',
          'Deploy GitGuardian pre-commit hooks preventing credentials in git commits.',
          'Review CI/CD scan telemetry weekly with DevSecOps team.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 6.2.3',
        priority: 'CRITICAL',
        assignedRole: 'DevSecOps Lead',
        department: 'Software Engineering & DevOps',
        status: 'COMPLIANT',
        evidenceRequired: 'GitHub Actions workflow YAML, Snyk SAST Dashboard Export, and Zero High Policy rule',
        linkedISOControl: 'A.8.25 / A.8.28',
        verificationMethod: 'AUTOMATED_SCAN'
      },
      {
        id: 'TASK-MAS-6.3',
        domainNumber: '6.0',
        domainName: 'Software Development Life Cycle (SDLC)',
        taskCode: '6.3.1',
        title: 'Software Composition Analysis (SCA) & CycloneDX SBOM Generation',
        description: 'Automatically inventory open-source libraries, generate CycloneDX Software Bill of Materials (SBOM), and flag dependencies with known CVEs.',
        actionableSteps: [
          'Integrate automated SBOM generation during release packaging.',
          'Configure automated Dependabot / Renovate pull requests for vulnerable packages.',
          'Audit third-party open source licenses for copyleft GPL non-compliance.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 6.2.4',
        priority: 'HIGH',
        assignedRole: 'Senior DevOps Engineer',
        department: 'Software Engineering & DevOps',
        status: 'COMPLIANT',
        evidenceRequired: 'CycloneDX JSON SBOM export for core settlement service & Dependabot SLA logs',
        linkedISOControl: 'A.8.30',
        verificationMethod: 'AUTOMATED_SCAN'
      },
      {
        id: 'TASK-MAS-6.4',
        domainNumber: '6.0',
        domainName: 'Software Development Life Cycle (SDLC)',
        taskCode: '6.4.1',
        title: 'Synthetic Test Data Replacement & Non-Production PII Obfuscation',
        description: 'Prohibit the use of unmasked production customer data in staging and test environments; deploy automated synthetic data generation pipelines.',
        actionableSteps: [
          'Identify and purge any residual masked production dumps in lower environments.',
          'Deploy Faker / Synthetic test data generator in CI seed pipelines.',
          'Perform cryptographic data entropy scan on staging DB to confirm zero real PII.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 6.4.2 & Notice 655 Para 4.4',
        priority: 'HIGH',
        assignedRole: 'Data Governance Lead / DevOps Architect',
        department: 'Data Engineering & Analytics',
        status: 'GAP_FINDING',
        evidenceRequired: 'Synthetic Data Pipeline Configuration, Clean-Room DB Scan, and Zero-PII Attestation',
        linkedISOControl: 'A.8.12 / A.8.31',
        linkedFindingId: 'fnd_gap_4',
        linkedFindingCode: 'GAP-2026-04',
        verificationMethod: 'SYSTEM_CONFIGURATION',
        notes: 'Active Finding GAP-2026-04 logged. Synthetic data seeding pipeline validated against schema v4.1; final staging purge scheduled for 2026-09-28.'
      }
    ]
  },

  // --- DOMAIN 7.0: IT Service Management & Change Control ---
  {
    domainNumber: '7.0',
    domainName: 'IT Service Management & Change Control',
    shortName: 'IT Operations & Change',
    description: 'Change Advisory Board (CAB), emergency patch management, segregation of production environments, and capacity planning.',
    iconName: 'GitPullRequest',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    criticality: 'HIGH',
    subTasks: [
      {
        id: 'TASK-MAS-7.1',
        domainNumber: '7.0',
        domainName: 'IT Service Management & Change Control',
        taskCode: '7.1.1',
        title: 'Change Advisory Board (CAB) & Zero Unauthorized Prod Changes',
        description: 'Enforce formal CAB reviews for all non-standard production changes with automated rollback procedures and business impact sign-offs.',
        actionableSteps: [
          'Verify all production pull requests require dual peer approvals and CAB ticket.',
          'Audit AWS CloudTrail to verify zero unapproved manual changes via AWS console.',
          'Validate rollback test records for Q2/Q3 release deployments.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 7.1.1',
        priority: 'HIGH',
        assignedRole: 'IT Change Manager',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'CAB Meeting Minutes, Jira Production Change Tickets, and Rollback Verification Logs',
        linkedISOControl: 'A.8.32',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-7.2',
        domainNumber: '7.0',
        domainName: 'IT Service Management & Change Control',
        taskCode: '7.2.1',
        title: 'Emergency Change Control SOP & Post-Implementation Review (PIR)',
        description: 'Establish strict protocols for emergency hotfixes, requiring retroactive CAB review and full post-incident documentation within 48 hours.',
        actionableSteps: [
          'Restrict emergency change authority to designated Incident Commander.',
          'Mandate post-implementation review (PIR) within 48 hours of emergency fix.',
          'Review Q2 emergency change tickets for 100% retrospective documentation compliance.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 7.1.4',
        priority: 'HIGH',
        assignedRole: 'Incident Commander / SecOps Lead',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'Emergency Change Management SOP v2.0 & PIR Audit Logs',
        linkedISOControl: 'A.8.32',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-7.3',
        domainNumber: '7.0',
        domainName: 'IT Service Management & Change Control',
        taskCode: '7.3.1',
        title: 'Security Patching Timelines & 72-Hour Critical CVE SLA Enforcement',
        description: 'Enforce statutory timelines for vulnerability patching (72 hours for Critical CVSS >= 9.0; 14 days for High CVSS 7.0-8.9) across all hosts and containers.',
        actionableSteps: [
          'Amend Vulnerability SOP v2.4 to mandate 72-hour emergency patch SLA for CVSS >= 9.0.',
          'Configure automated container rebuild alerts when base image CVE is flagged.',
          'Deploy CI/CD scanner blocking gate preventing release of overdue CVEs.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 7.3.1 & Notice 655 Para 4.3',
        mandatoryNoticeRef: 'MAS Notice 655 Para 4.3',
        priority: 'CRITICAL',
        assignedRole: 'SecOps & Vulnerability Lead',
        department: 'Cyber Security & SecOps',
        status: 'GAP_FINDING',
        evidenceRequired: 'Approved Vulnerability SOP v2.4, GitHub Actions branch protection rule, and SLA report',
        linkedISOControl: 'A.8.8',
        linkedFindingId: 'fnd_gap_3',
        linkedFindingCode: 'GAP-2026-03',
        verificationMethod: 'AUTOMATED_SCAN',
        notes: 'Active Finding GAP-2026-03 logged. Policy amendment drafted; CI/CD scanner webhook staging tests underway with target completion 2026-09-18.'
      }
    ]
  },

  // --- DOMAIN 8.0: Cyber Security Operations & Threat Intelligence ---
  {
    domainNumber: '8.0',
    domainName: 'Cyber Security Operations & Threat Intelligence',
    shortName: 'Cyber Defense & SOC',
    description: '24/7 Security Operations Center (SOC), proactive threat hunting, vulnerability management, and adversarial red teaming.',
    iconName: 'Radar',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-8.1',
        domainNumber: '8.0',
        domainName: 'Cyber Security Operations & Threat Intelligence',
        taskCode: '8.1.1',
        title: '24/7 Continuous SOC Monitoring & SIEM Real-Time Alerting',
        description: 'Maintain 24/7 continuous monitoring across cloud infrastructure, endpoints, and applications with automated high-priority paging.',
        actionableSteps: [
          'Verify SOC coverage SLA (15-minute alert triage for Tier-1 alerts).',
          'Review Datadog/Splunk SIEM correlation rules for credential stuffing and lateral movement.',
          'Conduct quarterly simulated alert generation drill to test SOC paging escalation.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 8.1.1',
        priority: 'CRITICAL',
        assignedRole: 'SOC Manager',
        department: 'Information Security & SOC',
        status: 'COMPLIANT',
        evidenceRequired: 'SOC Service Level Agreement (SLA) & Incident Escalation Runbook v3.1',
        linkedISOControl: 'A.8.16',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-8.2',
        domainNumber: '8.0',
        domainName: 'Cyber Security Operations & Threat Intelligence',
        taskCode: '8.2.1',
        title: 'Bi-Weekly Network & Application Vulnerability Scanning',
        description: 'Execute automated bi-weekly vulnerability scans across all public IP ranges, internal subnets, and web applications.',
        actionableSteps: [
          'Configure Qualys/Tenable scheduled bi-weekly scans against AWS perimeter.',
          'Review vulnerability delta report with infrastructure engineers.',
          'Verify remediation tracking tickets are auto-created in Jira with SLA countdowns.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 8.2.3',
        priority: 'HIGH',
        assignedRole: 'Vulnerability Management Analyst',
        department: 'Information Security & SOC',
        status: 'COMPLIANT',
        evidenceRequired: 'Bi-Weekly Qualys Vulnerability Scan Executive Summaries (Past 3 Months)',
        linkedISOControl: 'A.8.8',
        verificationMethod: 'AUTOMATED_SCAN'
      },
      {
        id: 'TASK-MAS-8.3',
        domainNumber: '8.0',
        domainName: 'Cyber Security Operations & Threat Intelligence',
        taskCode: '8.3.1',
        title: 'Annual Adversarial Attack Simulation & Red Teaming (AASE)',
        description: 'Engage an accredited external CREST-certified penetration testing firm to conduct adversarial red team simulation against critical systems.',
        actionableSteps: [
          'Draft red team rules of engagement (RoE) covering social engineering, cloud compromise, and lateral movement.',
          'Execute annual red teaming engagement simulating nation-state threat actors.',
          'Track all identified weaknesses into GRC remediation plan.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 8.3.1',
        priority: 'CRITICAL',
        assignedRole: 'Lead Penetration Tester / CISO',
        department: 'Information Security & SOC',
        status: 'COMPLIANT',
        evidenceRequired: 'CREST Accredited Red Team Assessment Report & Remediation Tracking Matrix',
        linkedISOControl: 'A.8.8',
        verificationMethod: 'AUDIT_INTERVIEW'
      }
    ]
  },

  // --- DOMAIN 9.0: Data Security & Cryptography ---
  {
    domainNumber: '9.0',
    domainName: 'Data Security & Cryptography',
    shortName: 'Data Security & Encryption',
    description: 'Data classification, strong cryptographic key management (HSM), encryption at rest and in transit, and data loss prevention (DLP).',
    iconName: 'Lock',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-9.1',
        domainNumber: '9.0',
        domainName: 'Data Security & Cryptography',
        taskCode: '9.1.1',
        title: 'Cryptographic Encryption at Rest (AES-256) & In Transit (TLS 1.3)',
        description: 'Enforce AES-256 encryption across all storage volumes, databases, and S3 buckets, with TLS 1.2/1.3 mandatory on all network transport.',
        actionableSteps: [
          'Audit AWS RDS, EBS, and S3 bucket encryption configurations.',
          'Enforce strict cipher suite policy blocking legacy SSL/TLS 1.0/1.1 on ALB/CloudFront.',
          'Verify HSTS (HTTP Strict Transport Security) header is enabled on all web domains.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 9.1.1',
        priority: 'CRITICAL',
        assignedRole: 'Principal Cloud Security Architect',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'AWS KMS Key Configuration Audit, SSL Labs A+ Verification, and Encryption Architecture Map',
        linkedISOControl: 'A.8.24',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-9.2',
        domainNumber: '9.0',
        domainName: 'Data Security & Cryptography',
        taskCode: '9.2.1',
        title: 'Hardware Security Module (HSM) Custody & Automated Key Rotation',
        description: 'Store primary cryptographic master keys in FIPS 140-2 Level 3 compliant cloud HSMs with annual automated key rotation.',
        actionableSteps: [
          'Verify AWS KMS master keys have annual rotation flag enabled.',
          'Review dual-custody access policies for master key administrative operations.',
          'Audit key access logs in AWS CloudTrail for unauthorized decryption requests.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 9.2.2',
        priority: 'CRITICAL',
        assignedRole: 'Cryptographic Engineer',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'AWS KMS Automatic Key Rotation Status Screenshot & Key Custody Policy v2.1',
        linkedISOControl: 'A.8.24',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      }
    ]
  },

  // --- DOMAIN 10.0: Access Control & Identity Management ---
  {
    domainNumber: '10.0',
    domainName: 'Access Control & Identity Management',
    shortName: 'Access Control & IAM',
    description: 'Multi-Factor Authentication (MFA), Privileged Access Management (PAM), dual control, and quarterly access recertification.',
    iconName: 'KeyRound',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-10.1',
        domainNumber: '10.0',
        domainName: 'Access Control & Identity Management',
        taskCode: '10.1.1',
        title: 'Mandatory Multi-Factor Authentication (MFA) on Admin & Remote Logins',
        description: 'Enforce hardware token, FIDO2, or push authenticator MFA across 100% of administrative consoles, AWS root/IAM accounts, and VPN endpoints.',
        actionableSteps: [
          'Enforce Okta MFA policy requiring WebAuthn/FIDO2 for privileged roles.',
          'Audit AWS IAM credential report to ensure zero console users without MFA.',
          'Block SMS-based OTP for administrative authentication tiers.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 10.1.1 & Notice 655 Para 4.2',
        mandatoryNoticeRef: 'MAS Notice 655 Para 4.2',
        priority: 'CRITICAL',
        assignedRole: 'Identity & Access Lead',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'Okta Adaptive MFA Policy Configuration & AWS IAM 100% MFA Enforcement Report',
        linkedISOControl: 'A.5.17 / A.8.5',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-10.2',
        domainNumber: '10.0',
        domainName: 'Access Control & Identity Management',
        taskCode: '10.2.1',
        title: 'Privileged Access Management (PAM) & Zero Standing Privileges (ZSP)',
        description: 'Eliminate standing administrative accounts in production; mandate Just-In-Time (JIT) access requests with session recording via bastion jump hosts.',
        actionableSteps: [
          'Deploy Teleport / HashiCorp Boundary PAM bastion for production database and EC2 access.',
          'Enforce automatic privilege revocation after 4-hour max session window.',
          'Enable encrypted keystroke and session video recording for audit reviews.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 10.2.1 & Notice 655 Para 4.1',
        mandatoryNoticeRef: 'MAS Notice 655 Para 4.1',
        priority: 'CRITICAL',
        assignedRole: 'Principal Cloud Infrastructure Architect',
        department: 'IT & Infrastructure',
        status: 'GAP_FINDING',
        evidenceRequired: 'PAM Teleport Configuration, JIT Approval Webhook Audit, and Session Recording Archives',
        linkedISOControl: 'A.5.15 / A.8.2',
        linkedFindingId: 'fnd_gap_1',
        linkedFindingCode: 'GAP-2026-01',
        verificationMethod: 'SYSTEM_CONFIGURATION',
        notes: 'Active Finding GAP-2026-01 logged. Emergency review completed on 2026-09-02; JIT IAM workflow deployment scheduled for production rollout by 2026-09-15.'
      },
      {
        id: 'TASK-MAS-10.3',
        domainNumber: '10.0',
        domainName: 'Access Control & Identity Management',
        taskCode: '10.3.1',
        title: 'Quarterly Privileged Access Recertification & Immediate Offboarding SLA',
        description: 'Execute formal quarterly user access reviews across all critical databases, Kubernetes clusters, and SaaS applications with 24-hr deprovisioning SLA.',
        actionableSteps: [
          'Export user rosters from Okta, AWS IAM, GitHub, and Postgres prod DBs.',
          'Distribute review lists to departmental managers for signed recertification.',
          'Verify that revoked employees are terminated across all systems within 24 hours.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 10.3.2',
        priority: 'CRITICAL',
        assignedRole: 'IAM Administrator / Internal Auditor',
        department: 'IT & Infrastructure',
        status: 'GAP_FINDING',
        evidenceRequired: 'Cryptographically signed Q2/Q3 Access Review Certification Sheets',
        linkedISOControl: 'A.5.18',
        linkedFindingId: 'fnd_gap_1',
        linkedFindingCode: 'GAP-2026-01',
        verificationMethod: 'DOCUMENT_INSPECTION',
        notes: 'Linked to GAP-2026-01. Automated quarterly recertification campaign initiated to eliminate manual email sign-offs.'
      },
      {
        id: 'TASK-MAS-10.4',
        domainNumber: '10.0',
        domainName: 'Access Control & Identity Management',
        taskCode: '10.4.1',
        title: 'Dual Control & Four-Eyes Principle for High-Risk Transactions',
        description: 'Implement dual authorization for customer balance adjustments, wholesale treasury disbursements, and cryptographic key export operations.',
        actionableSteps: [
          'Verify application workflow enforces Maker-Checker separation for transactions > SGD 50,000.',
          'Audit database permissions to prevent single admin from overriding ledger records.',
          'Review sample of Q2 ledger adjustments for documented dual sign-offs.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 10.4.1',
        priority: 'HIGH',
        assignedRole: 'Treasury Operations Lead / Software Architect',
        department: 'Treasury & Operations',
        status: 'COMPLIANT',
        evidenceRequired: 'Four-Eyes Principle System Architecture Documentation & Maker-Checker Sample Audit',
        linkedISOControl: 'A.5.15',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      }
    ]
  },

  // --- DOMAIN 11.0: Infrastructure, Endpoint & Network Security ---
  {
    domainNumber: '11.0',
    domainName: 'Infrastructure, Endpoint & Network Security',
    shortName: 'Network & Endpoint Security',
    description: 'Network zoning, micro-segmentation, DDoS mitigation, WAF, Zero Trust architecture, and continuous endpoint detection (EDR).',
    iconName: 'Network',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    criticality: 'HIGH',
    subTasks: [
      {
        id: 'TASK-MAS-11.1',
        domainNumber: '11.0',
        domainName: 'Infrastructure, Endpoint & Network Security',
        taskCode: '11.1.1',
        title: 'Multi-Tier DMZ Architecture & VPC Micro-Segmentation',
        description: 'Isolate internet-facing ingress load balancers from application servers and private database subnets with strict security group egress rules.',
        actionableSteps: [
          'Audit AWS VPC routing tables and Network Access Control Lists (NACLs).',
          'Verify databases sit in isolated private subnets without public internet gateways.',
          'Enforce Kubernetes network policies preventing pod-to-pod unrestricted communication.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 11.1.1 & Notice 655 Para 4.5',
        mandatoryNoticeRef: 'MAS Notice 655 Para 4.5',
        priority: 'CRITICAL',
        assignedRole: 'Network Infrastructure Lead',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'Network Topology Diagram v4.2, AWS VPC Route Tables, and NACL Rules Audit',
        linkedISOControl: 'A.8.20 / A.8.22',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-11.2',
        domainNumber: '11.0',
        domainName: 'Infrastructure, Endpoint & Network Security',
        taskCode: '11.2.1',
        title: 'Continuous Endpoint Detection & Response (EDR) Deployment (100%)',
        description: 'Install and enforce active CrowdStrike / SentinelOne EDR agents across all developer workstations, laptops, and production virtual machines.',
        actionableSteps: [
          'Verify MDM blocks unmanaged or non-EDR devices from accessing corporate VPN and Slack.',
          'Audit EDR console to confirm 100% agent coverage and daily threat intelligence updates.',
          'Conduct simulated malware detonation in isolated sandbox to test automated quarantine.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 11.3.1 & Notice 655 Para 4.6',
        mandatoryNoticeRef: 'MAS Notice 655 Para 4.6',
        priority: 'CRITICAL',
        assignedRole: 'Endpoint Security Lead',
        department: 'Cyber Security & SecOps',
        status: 'COMPLIANT',
        evidenceRequired: 'CrowdStrike Falcon Endpoint Fleet Coverage Report (100% Compliant)',
        linkedISOControl: 'A.8.7',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-11.3',
        domainNumber: '11.0',
        domainName: 'Infrastructure, Endpoint & Network Security',
        taskCode: '11.3.1',
        title: 'Web Application Firewall (WAF) & Layer 7 Anti-DDoS Protection',
        description: 'Deploy AWS WAF with Managed Rulesets (Core, SQLi, Known Bad Inputs) and Cloudflare/AWS Shield Advanced for DDoS attack absorption.',
        actionableSteps: [
          'Review AWS WAF rule configuration on all public API endpoints.',
          'Verify rate limiting rules block automated brute force and scraping attacks.',
          'Test automated DDoS mitigation failover under synthetic traffic load.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 11.2.3',
        priority: 'HIGH',
        assignedRole: 'Cloud Security Architect',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'AWS WAF Rule Matrix & Cloudflare Layer-7 DDoS Mitigation Telemetry',
        linkedISOControl: 'A.8.20 / A.8.21',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      }
    ]
  },

  // --- DOMAIN 12.0: Cloud & Virtualization Risk ---
  {
    domainNumber: '12.0',
    domainName: 'Cloud & Virtualization Risk',
    shortName: 'Cloud Security Governance',
    description: 'Cloud shared responsibility, tenant isolation, container runtime security, infrastructure-as-code (IaC) guardrails, and cloud key custody.',
    iconName: 'Cloud',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    criticality: 'HIGH',
    subTasks: [
      {
        id: 'TASK-MAS-12.1',
        domainNumber: '12.0',
        domainName: 'Cloud & Virtualization Risk',
        taskCode: '12.1.1',
        title: 'Cloud Shared Responsibility Matrix & Control Ownership Documentation',
        description: 'Formulate explicit shared responsibility matrix delineating security responsibilities between AWS and the financial institution across IaaS, PaaS, and SaaS.',
        actionableSteps: [
          'Document AWS Shared Responsibility Matrix for EKS, RDS Aurora, and S3.',
          'Identify financial institution customer-managed security controls.',
          'Review matrix annually with Lead Cloud Infrastructure Architect.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 12.1.1',
        priority: 'HIGH',
        assignedRole: 'Principal Cloud Infrastructure Architect',
        department: 'Software Engineering & DevOps',
        status: 'COMPLIANT',
        evidenceRequired: 'AWS Shared Responsibility Matrix v3.0 & Cloud Architecture Governance Charter',
        linkedISOControl: 'A.5.23',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-12.2',
        domainNumber: '12.0',
        domainName: 'Cloud & Virtualization Risk',
        taskCode: '12.2.1',
        title: 'Infrastructure-as-Code (IaC) Security Scanning & Cloud Drift Prevention',
        description: 'Scan Terraform / OpenTofu manifests using Checkov/Trivy for security misconfigurations, tag compliance, and exposed credentials prior to deployment.',
        actionableSteps: [
          'Configure Checkov in GitHub Actions to block non-compliant Terraform PRs.',
          'Audit AWS resources for mandatory asset tagging (Owner, Environment, DataClassification).',
          'Remediate untagged or orphaned staging instances.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 12.2.2',
        priority: 'HIGH',
        assignedRole: 'DevOps Security Engineer',
        department: 'Software Engineering & DevOps',
        status: 'GAP_FINDING',
        evidenceRequired: 'Checkov IaC Scan Report, AWS Tagging Compliance Matrix, and Remediation Tracker',
        linkedISOControl: 'A.8.9 / A.8.25',
        linkedFindingId: 'fnd_4',
        linkedFindingCode: 'FND-004',
        verificationMethod: 'AUTOMATED_SCAN',
        notes: 'Active Finding FND-004 logged. Terraform CI tagging enforcement hook staged to prevent untagged or unmonitored resources.'
      }
    ]
  },

  // --- DOMAIN 13.0: Third-Party & Outsourcing Technology Risk ---
  {
    domainNumber: '13.0',
    domainName: 'Third-Party & Outsourcing Technology Risk',
    shortName: 'Vendor & Outsourcing Risk',
    description: 'Pre-contract due diligence, material outsourcing register, right-to-audit clauses, fourth-party supply chain monitoring, and exit strategy.',
    iconName: 'Building',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    criticality: 'HIGH',
    subTasks: [
      {
        id: 'TASK-MAS-13.1',
        domainNumber: '13.0',
        domainName: 'Third-Party & Outsourcing Technology Risk',
        taskCode: '13.1.1',
        title: 'Material Outsourcing Register & Annual Criticality Classification',
        description: 'Maintain an authoritative Material Outsourcing Register meeting MAS Outsourcing Guidelines, identifying all critical cloud and IT service providers.',
        actionableSteps: [
          'Assess all technology vendors against MAS materiality criteria.',
          'Update Material Outsourcing Register with provider country, service tier, and BCP rating.',
          'Submit updated outsourcing inventory to Senior Management and Board Risk Committee.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 13.1.1 & MAS Guidelines on Outsourcing',
        priority: 'CRITICAL',
        assignedRole: 'Vendor Risk Manager',
        department: 'Procurement & Vendor Management',
        status: 'COMPLIANT',
        evidenceRequired: 'Master Material Outsourcing Register v2026.2 and Materiality Assessment Templates',
        linkedISOControl: 'A.5.19 / A.5.20',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-13.2',
        domainNumber: '13.0',
        domainName: 'Third-Party & Outsourcing Technology Risk',
        taskCode: '13.2.1',
        title: 'Contractual Right-to-Audit & MAS Regulatory Access Clauses',
        description: 'Verify contracts with material technology vendors include unconditional right-to-audit clauses granting access to internal auditors, external auditors, and MAS.',
        actionableSteps: [
          'Audit master service agreements (MSAs) for AWS, Okta, and core software providers.',
          'Confirm inclusion of standard MAS right-to-audit and data sovereignty language.',
          'Maintain legal compliance confirmation certificates for all active vendor contracts.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 13.2.1',
        priority: 'HIGH',
        assignedRole: 'Legal Counsel / Procurement Lead',
        department: 'Legal & Regulatory Affairs',
        status: 'COMPLIANT',
        evidenceRequired: 'Vendor Contract Clauses Audit Roster & Signed Standard Right-to-Audit Addenda',
        linkedISOControl: 'A.5.20',
        verificationMethod: 'DOCUMENT_INSPECTION'
      },
      {
        id: 'TASK-MAS-13.3',
        domainNumber: '13.0',
        domainName: 'Third-Party & Outsourcing Technology Risk',
        taskCode: '13.3.1',
        title: 'Annual Third-Party SOC 2 Type II / ISO 27001 Attestation Reviews',
        description: 'Collect, review, and formally evaluate annual SOC 2 Type II and ISO 27001 audit certificates for all material cloud and SaaS service providers.',
        actionableSteps: [
          'Establish annual vendor compliance certificate renewal tracking calendar.',
          'Analyze vendor SOC 2 Complementary User Entity Controls (CUECs) for internal implementation.',
          'Escalate vendors with lapsed attestations or significant auditor qualification findings.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 13.2.3',
        priority: 'HIGH',
        assignedRole: 'Third-Party Risk Specialist',
        department: 'Procurement & Vendor Management',
        status: 'GAP_FINDING',
        evidenceRequired: 'Vendor Attestation Dossiers & CUEC Implementation Verification Matrix',
        linkedISOControl: 'A.5.21 / A.5.22',
        linkedFindingId: 'fnd_2',
        linkedFindingCode: 'FND-002',
        verificationMethod: 'DOCUMENT_INSPECTION',
        notes: 'Active Finding FND-002 logged. Vendor SOC 2 Bridge letter collected; formal full-year audit report review in progress.'
      }
    ]
  },

  // --- DOMAIN 14.0: Incident Management & Breach Notification ---
  {
    domainNumber: '14.0',
    domainName: 'Incident Management & Breach Notification',
    shortName: 'Incident & MAS 1-Hour SLA',
    description: 'Cyber incident response plan, mandatory 1-hour notification to MAS for critical system disruptions, forensic readiness, and 14-day RCA.',
    iconName: 'AlertOctagon',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-14.1',
        domainNumber: '14.0',
        domainName: 'Incident Management & Breach Notification',
        taskCode: '14.1.1',
        title: 'Statutory 1-Hour Incident Notification to MAS (Notice 644/TRM)',
        description: 'Operationalize escalation workflow guaranteeing formal regulatory notification to the Monetary Authority of Singapore within 1 hour of discovering a critical incident.',
        actionableSteps: [
          'Document MAS Incident Notification SOP with pre-drafted Incident Notification Form.',
          'Designate Primary and Alternate Regulatory Escalation Officers with MAS contact details.',
          'Conduct unannounced tabletop drill testing end-to-end escalation within 45 minutes.'
        ],
        regulatoryRef: 'MAS Notice 644 Para 3 & MAS TRM Guidelines 14.1.2',
        mandatoryNoticeRef: 'MAS Notice 644 Para 3',
        priority: 'CRITICAL',
        assignedRole: 'Head of Incident Response / CISO',
        department: 'Cyber Security & SecOps',
        status: 'COMPLIANT',
        evidenceRequired: 'MAS 1-Hour Notification Runbook v4.0 & Simulated Notification Drill Record (Time: 28m)',
        linkedISOControl: 'A.5.24 / A.5.25',
        verificationMethod: 'DOCUMENT_INSPECTION',
        completedAt: '2026-07-12T16:00:00Z',
        completedBy: 'Arjun Mehta (CISO)'
      },
      {
        id: 'TASK-MAS-14.2',
        domainNumber: '14.0',
        domainName: 'Incident Management & Breach Notification',
        taskCode: '14.2.1',
        title: '14-Day Formal Root Cause Analysis (RCA) Regulatory Submission',
        description: 'Ensure comprehensive root cause analysis, forensic findings, impact assessment, and corrective actions are submitted to MAS within 14 calendar days.',
        actionableSteps: [
          'Standardize 5-Whys and Fishbone Root Cause Analysis template.',
          'Establish digital forensic chain of custody procedures for disk images and memory dumps.',
          'Conduct post-incident review meeting with Executive Committee prior to MAS filing.'
        ],
        regulatoryRef: 'MAS Notice 644 Para 4 & MAS TRM Guidelines 14.2.1',
        mandatoryNoticeRef: 'MAS Notice 644 Para 4',
        priority: 'CRITICAL',
        assignedRole: 'Lead Forensic Investigator / CISO',
        department: 'Cyber Security & SecOps',
        status: 'COMPLIANT',
        evidenceRequired: 'MAS 14-Day Formal RCA Template & Forensic Preservation SOP v2.2',
        linkedISOControl: 'A.5.28',
        verificationMethod: 'DOCUMENT_INSPECTION'
      }
    ]
  },

  // --- DOMAIN 15.0: Business Continuity & Operational Resilience ---
  {
    domainNumber: '15.0',
    domainName: 'Business Continuity & Operational Resilience',
    shortName: 'BCP / DR & System Availability',
    description: 'Critical system maximum unscheduled downtime <= 4 hrs/year, RTO <= 4 hrs, RPO <= 1 hr, and annual live disaster recovery simulation drills.',
    iconName: 'ServerCrash',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    criticality: 'CRITICAL',
    subTasks: [
      {
        id: 'TASK-MAS-15.1',
        domainNumber: '15.0',
        domainName: 'Business Continuity & Operational Resilience',
        taskCode: '15.1.1',
        title: 'Critical Systems Maximum Downtime Limit (<= 4 Hours/Year)',
        description: 'Maintain high availability architecture ensuring cumulative unscheduled downtime across all designated critical systems does not exceed 4 hours per rolling year.',
        actionableSteps: [
          'Monitor synthetic uptime probes with 1-minute heartbeat intervals via Datadog.',
          'Calculate rolling 365-day cumulative downtime metric on executive dashboard.',
          'Trigger emergency Sev-1 escalation if monthly downtime exceeds 20 minutes.'
        ],
        regulatoryRef: 'MAS Notice 644 Para 5 & MAS TRM Guidelines 15.1.1',
        mandatoryNoticeRef: 'MAS Notice 644 Para 5',
        priority: 'CRITICAL',
        assignedRole: 'Site Reliability Engineering (SRE) Lead',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'Annual System Uptime Ledger (Current: 99.98% / 1.8 hrs cumulative downtime)',
        linkedISOControl: 'A.8.14',
        verificationMethod: 'AUTOMATED_SCAN'
      },
      {
        id: 'TASK-MAS-15.2',
        domainNumber: '15.0',
        domainName: 'Business Continuity & Operational Resilience',
        taskCode: '15.2.1',
        title: 'Statutory Recovery Objectives (RTO <= 4 Hours, RPO <= 1 Hour)',
        description: 'Configure multi-AZ and cross-region replication guaranteeing critical system recovery time objective (RTO <= 4 hrs) and recovery point objective (RPO <= 1 hr).',
        actionableSteps: [
          'Configure AWS Aurora Global Database with continuous replication latency < 1 second.',
          'Automate ECS/EKS container cluster re-provisioning via Terraform in secondary region.',
          'Verify daily snapshot backups are cryptographically immutable with AWS Backup Vault Lock.'
        ],
        regulatoryRef: 'MAS Notice 644 Para 6 & MAS TRM Guidelines 15.2.1',
        mandatoryNoticeRef: 'MAS Notice 644 Para 6',
        priority: 'CRITICAL',
        assignedRole: 'Head of Infrastructure & Cloud Architecture',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'Aurora Cross-Region Replication Telemetry & RTO/RPO Architectural Specification',
        linkedISOControl: 'A.8.13 / A.8.14',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-15.3',
        domainNumber: '15.0',
        domainName: 'Business Continuity & Operational Resilience',
        taskCode: '15.3.1',
        title: 'Annual Live Multi-Region Disaster Recovery (DR) Simulation Drill',
        description: 'Conduct annual end-to-end disaster recovery failover drill simulating primary data center failure, measuring empirical RTO and RPO against statutory limits.',
        actionableSteps: [
          'Finalize DR Tabletop Simulation Runbook v3.2 with simulated ap-southeast-1 to ap-southeast-2 failover.',
          'Lock simulation drill date with Executive Committee and external audit observers.',
          'Record CloudWatch failover latency logs, business transaction validation, and RTO metric proof.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 15.3.1',
        priority: 'CRITICAL',
        assignedRole: 'Business Continuity Manager / DevOps Lead',
        department: 'Software Engineering & DevOps',
        status: 'GAP_FINDING',
        evidenceRequired: 'Signed DR Tabletop Simulation Minutes, Failover Latency Logs, and RTO Proof (< 4h)',
        linkedISOControl: 'A.5.29 / A.5.30',
        linkedFindingId: 'fnd_gap_2',
        linkedFindingCode: 'GAP-2026-02',
        verificationMethod: 'AUDIT_INTERVIEW',
        notes: 'Active Finding GAP-2026-02 logged. Tabletop drill date locked with Executive Committee for Sept 18, 2026; failover runbook v3.2 validated.'
      }
    ]
  },

  // --- DOMAIN 16.0: Logging, Audit Trail & Security Monitoring ---
  {
    domainNumber: '16.0',
    domainName: 'Logging, Audit Trail & Security Monitoring',
    shortName: 'Logging & Audit Trails',
    description: 'Centralized immutable logging, minimum 1-year retention (90 days online), clock synchronization via secure NTP, and real-time alerting.',
    iconName: 'FileClock',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    criticality: 'HIGH',
    subTasks: [
      {
        id: 'TASK-MAS-16.1',
        domainNumber: '16.0',
        domainName: 'Logging, Audit Trail & Security Monitoring',
        taskCode: '16.1.1',
        title: 'Centralized Immutable Log Storage (WORM) & 1-Year Retention',
        description: 'Aggregate all security, database, IAM, and network logs into write-once-read-many (WORM) S3 Glacier storage with minimum 1-year retention.',
        actionableSteps: [
          'Enable AWS S3 Object Lock in Compliance Mode on centralized log bucket.',
          'Configure lifecycle policy retaining 90 days hot index in Datadog and 365 days in Glacier.',
          'Verify cryptographic hash validation prevents modification or deletion by root users.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 16.1.1',
        priority: 'CRITICAL',
        assignedRole: 'Cloud Security Architect',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'AWS S3 Object Lock Compliance Policy Screenshot & 1-Year Log Retention Architecture',
        linkedISOControl: 'A.8.15',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      },
      {
        id: 'TASK-MAS-16.2',
        domainNumber: '16.0',
        domainName: 'Logging, Audit Trail & Security Monitoring',
        taskCode: '16.2.1',
        title: 'Secure Network Time Protocol (NTP) Clock Synchronization (< 50ms)',
        description: 'Synchronize system clocks across all servers, firewalls, and microservices using authenticated stratum-1 NTP servers with maximum drift under 50ms.',
        actionableSteps: [
          'Configure chrony / systemd-timesyncd on all server images to sync with AWS Time Sync Service.',
          'Alert automatically if clock drift exceeds 50 milliseconds on any cluster node.',
          'Audit timestamp consistency across multi-tier transaction log traces.'
        ],
        regulatoryRef: 'MAS TRM Guidelines 16.2.1',
        priority: 'HIGH',
        assignedRole: 'Systems Administrator',
        department: 'IT & Infrastructure',
        status: 'COMPLIANT',
        evidenceRequired: 'NTP Synchronization Audit Telemetry & Clock Drift Monitoring Dashboard',
        linkedISOControl: 'A.8.17',
        verificationMethod: 'SYSTEM_CONFIGURATION'
      }
    ]
  }
];

export const ALL_MAS_SUB_TASKS: MASChecklistSubTask[] = INITIAL_MAS_CHECKLIST_DOMAINS.flatMap(
  d => d.subTasks
);
