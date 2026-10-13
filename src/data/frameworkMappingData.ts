// Master Framework Mapping & Crosswalk Dataset
// Authoritative cross-mapping of security, risk, and regulatory standards
// Encodes overlapping vs. unique control requirements, evidence reusability, and audit gap analysis.

export type FrameworkId = 
  | 'ISO_27001'
  | 'SOC_2'
  | 'NIST_CSF'
  | 'MAS_TRM'
  | 'ISO_42001'
  | 'PCI_DSS'
  | 'INDIA_DPDP';

export type MappingType = 
  | 'EXACT_EQUIVALENT' 
  | 'SUPERSET' 
  | 'SUBSET' 
  | 'RELATED_OVERLAP';

export type EvidenceReusability = 
  | 'DIRECT_REUSE' 
  | 'REQUIRES_ADDITIONAL_METRIC' 
  | 'PARTIAL_SUPPORT';

export interface FrameworkMeta {
  id: FrameworkId;
  code: string;
  name: string;
  shortTitle: string;
  authority: string;
  jurisdiction: string;
  version: string;
  totalControls: number;
  totalDomains: number;
  category: string;
  badgeColor: string;
  borderAccent: string;
  bgLight: string;
  iconName: string;
  description: string;
  primaryAudience: string;
  typicalAuditCycle: string;
}

export interface ControlRequirement {
  code: string;
  title: string;
  domain: string;
  requirementStatement: string;
  auditExpectation: string;
  evidenceExamples: string[];
}

export interface OverlappingControlMapping {
  id: string;
  domain: string;
  controlA: ControlRequirement;
  controlB: ControlRequirement;
  mappingType: MappingType;
  confidenceScore: number; // 0-100%
  evidenceReusability: EvidenceReusability;
  synergyExplanation: string;
  sharedEvidenceArtifacts: string[];
  auditHourSavingsEstimate: number; // in hours
}

export interface UniqueControlRequirement {
  id: string;
  control: ControlRequirement;
  domain: string;
  frameworkId: FrameworkId;
  whyUnique: string;
  complianceGuidance: string;
  effortToAddress: 'LOW' | 'MEDIUM' | 'HIGH';
  targetDeliverable: string;
}

export interface FrameworkPairAnalysis {
  frameworkAId: FrameworkId;
  frameworkBId: FrameworkId;
  overallSynergyScore: number; // 0-100%
  estimatedAuditHoursSaved: number;
  directEvidenceReuseRate: number; // 0-100%
  overlapping: OverlappingControlMapping[];
  uniqueToA: UniqueControlRequirement[];
  uniqueToB: UniqueControlRequirement[];
  executiveBriefing: string;
}

export const SUPPORTED_FRAMEWORKS: FrameworkMeta[] = [
  {
    id: 'ISO_27001',
    code: 'ISO/IEC 27001:2022',
    name: 'ISO/IEC 27001:2022 Information Security Management System (ISMS)',
    shortTitle: 'ISO 27001:2022',
    authority: 'International Organization for Standardization (ISO / IEC)',
    jurisdiction: 'Global (International Standard)',
    version: '2022 Edition',
    totalControls: 93,
    totalDomains: 4,
    category: 'Information Security & Governance',
    badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    borderAccent: 'border-sky-500',
    bgLight: 'bg-sky-50/50 dark:bg-sky-950/20',
    iconName: 'ShieldCheck',
    description: 'Premier global standard for establishing, implementing, maintaining, and continually improving an Information Security Management System (ISMS).',
    primaryAudience: 'Global enterprises, enterprise SaaS, international clients',
    typicalAuditCycle: 'Annual surveillance, 3-year recertification'
  },
  {
    id: 'SOC_2',
    code: 'SOC 2 Type II',
    name: 'AICPA SOC 2 Type II (Trust Services Criteria 2022)',
    shortTitle: 'SOC 2 Type II',
    authority: 'American Institute of Certified Public Accountants (AICPA)',
    jurisdiction: 'United States & North America (Global Enterprise Standard)',
    version: 'Trust Services Criteria 2022',
    totalControls: 64,
    totalDomains: 5,
    category: 'Service Organization Controls & Attestation',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    borderAccent: 'border-indigo-500',
    bgLight: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    iconName: 'Award',
    description: 'Independent CPA attestation examining operational effectiveness of controls across Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
    primaryAudience: 'B2B SaaS buyers, US enterprise customers, procurement teams',
    typicalAuditCycle: 'Annual continuous 6-to-12 month observation window'
  },
  {
    id: 'NIST_CSF',
    code: 'NIST CSF 2.0',
    name: 'NIST Cybersecurity Framework 2.0',
    shortTitle: 'NIST CSF 2.0',
    authority: 'National Institute of Standards and Technology (NIST)',
    jurisdiction: 'United States (Global Cyber Benchmark)',
    version: '2.0 (2024)',
    totalControls: 106,
    totalDomains: 6,
    category: 'Cybersecurity Risk Management',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    borderAccent: 'border-amber-500',
    bgLight: 'bg-amber-50/50 dark:bg-amber-950/20',
    iconName: 'Flame',
    description: 'Voluntary risk-based taxonomy structured across six core functions: Govern (GV), Identify (ID), Protect (PR), Detect (DE), Respond (RS), and Recover (RC).',
    primaryAudience: 'Critical infrastructure, defense, federal contractors, CISOs',
    typicalAuditCycle: 'Continuous self-assessment and maturity scoring'
  },
  {
    id: 'MAS_TRM',
    code: 'MAS TRM 2021',
    name: 'MAS Technology Risk Management Guidelines (2021 / 2024)',
    shortTitle: 'MAS TRM Guidelines',
    authority: 'Monetary Authority of Singapore (MAS)',
    jurisdiction: 'Singapore (APAC Financial Sector)',
    version: 'v2021.3 (with 2024 Cloud Advisories)',
    totalControls: 94,
    totalDomains: 15,
    category: 'Banking & Financial Technology Risk',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    borderAccent: 'border-rose-500',
    bgLight: 'bg-rose-50/50 dark:bg-rose-950/20',
    iconName: 'Building2',
    description: 'Enforceable regulatory directives and supervisory expectations governing technology resilience, cybersecurity hygiene, critical system uptime, and 1-hour breach reporting.',
    primaryAudience: 'Singapore licensed banks, FinTechs, payment institutions, brokers',
    typicalAuditCycle: 'Annual MAS regulatory inspection & independent audits'
  },
  {
    id: 'ISO_42001',
    code: 'ISO/IEC 42001:2023',
    name: 'ISO/IEC 42001:2023 Artificial Intelligence Management System (AIMS)',
    shortTitle: 'ISO 42001 AIMS',
    authority: 'International Organization for Standardization (ISO / IEC)',
    jurisdiction: 'Global (AI Governance Standard)',
    version: '2023 Edition',
    totalControls: 38,
    totalDomains: 9,
    category: 'Responsible AI & Algorithmic Governance',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    borderAccent: 'border-purple-500',
    bgLight: 'bg-purple-50/50 dark:bg-purple-950/20',
    iconName: 'Sparkles',
    description: 'World-first certifiable standard for responsible AI systems, establishing controls for algorithmic fairness, training data lineage, model safety, and societal impact.',
    primaryAudience: 'AI developers, GenAI platform providers, algorithmic decisioning entities',
    typicalAuditCycle: 'Annual accredited surveillance audit'
  },
  {
    id: 'PCI_DSS',
    code: 'PCI DSS v4.0.1',
    name: 'Payment Card Industry Data Security Standard v4.0.1',
    shortTitle: 'PCI DSS v4.0.1',
    authority: 'PCI Security Standards Council (PCI SSC)',
    jurisdiction: 'Global (Payment Card Brands)',
    version: 'v4.0.1 (2024)',
    totalControls: 78,
    totalDomains: 12,
    category: 'Payments & Cardholder Data Security',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    borderAccent: 'border-emerald-500',
    bgLight: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    iconName: 'CreditCard',
    description: 'Technical and operational standard required for all entities that store, process, or transmit cardholder data (CHD) or sensitive authentication data (SAD).',
    primaryAudience: 'Payment processors, merchants, payment gateways, fintechs',
    typicalAuditCycle: 'Annual QSA on-site assessment or SAQ-D attestation'
  },
  {
    id: 'INDIA_DPDP',
    code: 'India DPDP Act 2023',
    name: 'India Digital Personal Data Protection Act 2023 / ISO 27701',
    shortTitle: 'India DPDP Act',
    authority: 'Ministry of Electronics and Information Technology (MeitY) / Data Protection Board',
    jurisdiction: 'India (Statutory Data Protection)',
    version: '2023 Act & 2026 Statutory Rules',
    totalControls: 42,
    totalDomains: 8,
    category: 'Data Privacy & Rights Management',
    badgeColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    borderAccent: 'border-teal-500',
    bgLight: 'bg-teal-50/50 dark:bg-teal-950/20',
    iconName: 'Scale',
    description: 'Statutory privacy legislation mandating granular consent notices, technical consent managers, purpose limitation, right to erasure, and 72-hour breach reporting.',
    primaryAudience: 'Data Fiduciaries processing Indian residents personal data',
    typicalAuditCycle: 'Ongoing statutory compliance & Data Protection Board oversight'
  }
];

// PRESET PAIRINGS FOR QUICK ACCESS
export const RECOMMENDED_PAIRINGS: {
  pairId: string;
  frameworkA: FrameworkId;
  frameworkB: FrameworkId;
  label: string;
  tag: string;
  description: string;
}[] = [
  {
    pairId: 'iso27001-soc2',
    frameworkA: 'ISO_27001',
    frameworkB: 'SOC_2',
    label: 'ISO 27001 vs. SOC 2 Type II',
    tag: 'Most Popular Dual Attestation',
    description: 'The definitive enterprise security duo. Compare international ISMS certification against AICPA Trust Services Criteria for SaaS clients.'
  },
  {
    pairId: 'iso27001-nistcsf',
    frameworkA: 'ISO_27001',
    frameworkB: 'NIST_CSF',
    label: 'ISO 27001 vs. NIST CSF 2.0',
    tag: 'International vs. Federal Cyber',
    description: 'Align management system governance clauses with NIST CSF 2.0 operational cyber functions (Govern, Protect, Detect, Respond).'
  },
  {
    pairId: 'iso27001-mastrm',
    frameworkA: 'ISO_27001',
    frameworkB: 'MAS_TRM',
    label: 'ISO 27001 vs. MAS TRM 2021',
    tag: 'Global Standard vs. Asian Banking Mandate',
    description: 'Examine how ISO 27001 controls map to Singapore statutory financial technology risk guidelines and 1-hour SLA requirements.'
  },
  {
    pairId: 'iso27001-iso42001',
    frameworkA: 'ISO_27001',
    frameworkB: 'ISO_42001',
    label: 'ISO 27001 vs. ISO 42001 (AIMS)',
    tag: 'InfoSec vs. AI Governance',
    description: 'Identify common Annex SL governance clauses and isolate AI-specific controls like algorithmic bias, model lineage, and AI impact assessments.'
  },
  {
    pairId: 'soc2-nistcsf',
    frameworkA: 'SOC_2',
    frameworkB: 'NIST_CSF',
    label: 'SOC 2 Type II vs. NIST CSF 2.0',
    tag: 'SaaS Trust vs. Cyber Baseline',
    description: 'Map CPA Trust Services Criteria against NIST operational categories to streamline customer security questionnaires.'
  },
  {
    pairId: 'iso27001-pcidss',
    frameworkA: 'ISO_27001',
    frameworkB: 'PCI_DSS',
    label: 'ISO 27001 vs. PCI DSS v4.0.1',
    tag: 'ISMS vs. Payment Card Security',
    description: 'Analyze cardholder data environment (CDE) segmentation, encryption keys, and vulnerability testing overlap.'
  },
  {
    pairId: 'iso27001-dpdp',
    frameworkA: 'ISO_27001',
    frameworkB: 'INDIA_DPDP',
    label: 'ISO 27001 vs. India DPDP Act',
    tag: 'Security Controls vs. Privacy Rights',
    description: 'Crosswalk technical security controls (A.8.11, A.8.12) with statutory consent management and data erasure duties.'
  }
];

// AUTHORITATIVE PAIR MAPPINGS DATASET: ISO 27001 VS SOC 2 (PRIMARY BENCHMARK)
export const ISO27001_VS_SOC2_PAIR: FrameworkPairAnalysis = {
  frameworkAId: 'ISO_27001',
  frameworkBId: 'SOC_2',
  overallSynergyScore: 78,
  estimatedAuditHoursSaved: 160,
  directEvidenceReuseRate: 84,
  executiveBriefing: 'High degree of harmonized synergy (78%). Core technical safeguards (access control, cryptography, vulnerability management, logging, incident response, and change management) accept identical audit artifacts. Unique gaps lie primarily in ISO 27001 formal Annex SL clauses (SoA, ISO 19011 internal audit, management review) versus SOC 2 Trust Services Criteria (independent board oversight, whistleblower hotlines, and cloud CUECs).',
  
  // OVERLAPPING CONTROLS
  overlapping: [
    {
      id: 'MAP-ISO-SOC-01',
      domain: 'Access Control & Identity Management',
      controlA: {
        code: 'A.5.15 / A.8.2',
        title: 'Access Control & Privileged Access Rights Management',
        domain: 'Technological & Organizational',
        requirementStatement: 'Rules to control physical and logical access to information assets shall be established and implemented based on business and security requirements. Allocation and use of privileged access rights shall be restricted and controlled.',
        auditExpectation: 'Inspect RBAC policy, multi-factor authentication (MFA) enforcement on cloud and SSO, and quarterly privileged account recertification records.',
        evidenceExamples: ['Okta/Azure AD Global MFA Policy', 'Quarterly Access Review Sign-offs', 'Privileged Account Inventory']
      },
      controlB: {
        code: 'CC6.1 / CC6.2 / CC6.3',
        title: 'Logical Access Controls, User Authorization & Least Privilege',
        domain: 'Common Criteria: Logical and Physical Access',
        requirementStatement: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity’s commitments and system requirements.',
        auditExpectation: 'Sample new hires and terminations for timely access provisioning/revocation. Verify MFA for all remote and privileged console logins.',
        evidenceExamples: ['SSO Enforced MFA Logs', 'Quarterly Manager User Access Reviews', 'Jira Access Request Tickets']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 98,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Both frameworks require the exact same core safeguards: strict RBAC, mandatory phishing-resistant MFA, least privilege, and periodic user access recertification. A single Okta/Azure AD export and quarterly manager sign-off sheet satisfies both auditors simultaneously.',
      sharedEvidenceArtifacts: [
        'Okta / Azure AD Global Multi-Factor Authentication (MFA) Configuration Export',
        'Quarterly User Access Review & Entitlement Recertification Matrix (signed by Dept Heads)',
        'Automated Deprovisioning & Offboarding Ticketing Audit Trail (Sample of 10 terminated users)'
      ],
      auditHourSavingsEstimate: 24
    },
    {
      id: 'MAP-ISO-SOC-02',
      domain: 'Cryptography & Data Protection',
      controlA: {
        code: 'A.8.24',
        title: 'Use of Cryptography & Key Management',
        domain: 'Technological',
        requirementStatement: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented according to risk assessments.',
        auditExpectation: 'Inspect cryptographic standard, TLS 1.3 server configs, AES-256 database encryption proofs, and annual KMS key rotation logs.',
        evidenceExamples: ['Enterprise Cryptographic Standard v3.0', 'AWS KMS Automated Rotation Config', 'Qualys SSL Labs A+ Reports']
      },
      controlB: {
        code: 'CC6.6 / CC6.7',
        title: 'Protection of Data in Transit and at Rest',
        domain: 'Common Criteria: Logical Access & Encryption',
        requirementStatement: 'The entity implements logical access security controls to protect information in transit and at rest using approved encryption algorithms to prevent unauthorized disclosure.',
        auditExpectation: 'Examine database volume encryption settings (EBS/RDS), cloud object storage (S3) default encryption, and API TLS 1.2+ minimum cipher suites.',
        evidenceExamples: ['AWS RDS/S3 Encryption Screenshots', 'KMS Key Policy and Audit Logs', 'Cipher Suite Scan Reports']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 96,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Direct evidence reuse. Both ISO 27001 A.8.24 and SOC 2 CC6.6/CC6.7 mandate AES-256 for data at rest and modern TLS (1.2/1.3) for data in transit, coupled with managed cryptographic key lifecycles.',
      sharedEvidenceArtifacts: [
        'Enterprise Cryptographic & Key Management Standard v2.4',
        'AWS KMS / HashiCorp Vault Key Rotation & Access Policy Configuration Logs',
        'SSL Labs A+ Certificates & Database Field-Level Encryption Verification Records'
      ],
      auditHourSavingsEstimate: 16
    },
    {
      id: 'MAP-ISO-SOC-03',
      domain: 'Change Management & Secure SDLC',
      controlA: {
        code: 'A.8.28 / A.8.32',
        title: 'Secure Coding & Change Management',
        domain: 'Technological',
        requirementStatement: 'Secure coding principles shall be applied to software development. Changes to information processing facilities and software shall be controlled through formal change management procedures.',
        auditExpectation: 'Review branch protection rules requiring peer review, automated SAST/DAST in CI/CD pipelines, and separation between test and production environments.',
        evidenceExamples: ['GitHub Branch Protection Settings', 'SonarQube SAST Gate Proof', 'Production Release Approval Tickets']
      },
      controlB: {
        code: 'CC8.1',
        title: 'System Change Management & Release Authorization',
        domain: 'Common Criteria: Change Management',
        requirementStatement: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet commitments.',
        auditExpectation: 'Sample 25 pull requests to production: verify automated testing pass, approval by non-author developer, and change ticket linked to release.',
        evidenceExamples: ['GitHub PR Approvals Sample', 'Jira Release Ticket Sample', 'Automated Integration Test Logs']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 97,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Identical evidence package. Both auditors examine the GitHub/GitLab repository settings, pull request approval logs with mandatory peer reviews, and automated CI/CD deployment safeguards.',
      sharedEvidenceArtifacts: [
        'GitHub Enterprise Branch Protection Rules (Required 2 Reviewers, Dismiss Stale Approvals)',
        'Production Deployment Sample (25 Sampled Releases with Jira Change Tickets & Approvals)',
        'CI/CD Pipeline Configuration with Automated SAST (SonarQube) & Dependency Scanning (Snyk)'
      ],
      auditHourSavingsEstimate: 22
    },
    {
      id: 'MAP-ISO-SOC-04',
      domain: 'Vulnerability Management & Security Monitoring',
      controlA: {
        code: 'A.8.8 / A.8.16',
        title: 'Management of Technical Vulnerabilities & Monitoring Activities',
        domain: 'Technological',
        requirementStatement: 'Information about technical vulnerabilities of information systems being used shall be obtained, evaluated, and addressed. Networks, systems and applications shall be monitored for abnormal behavior.',
        auditExpectation: 'Review weekly vulnerability scan schedules, remediation SLAs (Critical < 7 days), annual penetration test report, and SIEM alert rules.',
        evidenceExamples: ['Tenable/Qualys Vulnerability Scans', 'Annual Third-Party Pen Test Report', 'Datadog/Splunk SIEM Alert Config']
      },
      controlB: {
        code: 'CC7.1 / CC7.2',
        title: 'Vulnerability Identification, System Monitoring & Threat Detection',
        domain: 'Common Criteria: System Operations',
        requirementStatement: 'To meet its commitments and system requirements, the entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities, and conducts vulnerability assessments.',
        auditExpectation: 'Sample vulnerability remediation tickets for adherence to SLA. Review annual penetration testing report and management remediation response.',
        evidenceExamples: ['Automated Vulnerability Scan Reports', 'Third-Party CREST Penetration Test Dossier', 'SIEM P1 Incident Escalation Runbook']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 95,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Direct evidence reuse. The external independent penetration test report and vulnerability scanning dashboard satisfy both ISO 27001 lead auditors and SOC 2 CPA practitioners without modification.',
      sharedEvidenceArtifacts: [
        'Annual Third-Party CREST / OSCP Certified Penetration Testing Report and Executive Summary',
        'Automated Container & Infrastructure Vulnerability Scan Reports (Snyk & AWS Inspector)',
        'Vulnerability Remediation Tracking Register demonstrating compliance with P1/P2 resolution SLAs'
      ],
      auditHourSavingsEstimate: 20
    },
    {
      id: 'MAP-ISO-SOC-05',
      domain: 'Vendor & Third-Party Risk Management',
      controlA: {
        code: 'A.5.19 / A.5.20 / A.5.21',
        title: 'Information Security in Supplier Relationships',
        domain: 'Organizational',
        requirementStatement: 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of suppliers products or services. Supplier agreements shall include security requirements.',
        auditExpectation: 'Inspect Tier 1 vendor register, security assessment questionnaires, executed Data Processing Addenda (DPAs), and annual vendor SOC 2 collection logs.',
        evidenceExamples: ['Vendor Risk Tiering Matrix', 'Signed Master Service Agreements with DPA', 'AWS/GCP SOC 2 Bridge Letters']
      },
      controlB: {
        code: 'CC9.2',
        title: 'Risk Assessment of Third-Party Subservice Providers',
        domain: 'Common Criteria: Risk Mitigation',
        requirementStatement: 'The entity assesses and manages risks associated with vendors and business partners to meet commitments and system requirements.',
        auditExpectation: 'Sample Tier 1 critical subservice providers (AWS, Okta, Datadog): inspect annual SOC 2 Type II report reviews, bridge letters, and risk assessments.',
        evidenceExamples: ['Vendor Security Evaluation Questionnaires', 'Cloud Provider SOC 2 Type II Review Memos', 'Vendor Criticality Register']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 94,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Unified vendor register. Both standards require risk-tiering of critical vendors, collecting annual third-party audit reports (SOC 2 or ISO 27001), and enforcing contractual security terms.',
      sharedEvidenceArtifacts: [
        'Enterprise Vendor Risk Tiering Inventory (Critical / High / Medium classification)',
        'Annual Vendor SOC 2 Type II / ISO 27001 Certificate Tracker & Review Memorandums',
        'Standard Master Services Agreement (MSA) containing Security, Audit Rights, & 24h Breach SLAs'
      ],
      auditHourSavingsEstimate: 18
    },
    {
      id: 'MAP-ISO-SOC-06',
      domain: 'Incident Response & Breach Management',
      controlA: {
        code: 'A.5.24 - A.5.28',
        title: 'Information Security Incident Management Planning & Response',
        domain: 'Organizational',
        requirementStatement: 'The organisation shall plan and prepare for managing security incidents by defining, establishing, and communicating security incident management processes, roles, and responsibilities.',
        auditExpectation: 'Review formal Incident Response Plan (IRP), severity classification matrix, post-mortem root cause analysis (RCA) records, and annual tabletop drill minutes.',
        evidenceExamples: ['Incident Response Plan v3.0', 'Annual Tabletop Exercise After-Action Report', 'Post-Incident RCA Reports']
      },
      controlB: {
        code: 'CC7.3 / CC7.4',
        title: 'Incident Evaluation, Response, Communication & Remediation',
        domain: 'Common Criteria: System Operations',
        requirementStatement: 'The entity evaluates security events to determine whether they could result in a failure of the entity to meet its commitments and system requirements and responds to identified security incidents by executing a defined incident-response program.',
        auditExpectation: 'Sample security incidents logged over the audit period: verify timely acknowledgment, containment steps, customer communication, and post-incident remediation.',
        evidenceExamples: ['Jira Security Incident Tickets with Timestamps', 'Annual Tabletop Simulation Deck', 'Customer Incident Notification Templates']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 96,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Complete evidence harmonization. The same Incident Response Plan, P1-P4 escalation matrix, tabletop simulation records, and sample post-mortem reports satisfy both frameworks.',
      sharedEvidenceArtifacts: [
        'Enterprise Incident Response Plan (IRP) & Communication Playbook v3.2',
        'Annual Executive Cyber Tabletop Simulation Report & Lessons Learned Deck',
        'Sample Post-Incident Review / Root Cause Analysis (RCA) Reports with CAPA tracking'
      ],
      auditHourSavingsEstimate: 16
    },
    {
      id: 'MAP-ISO-SOC-07',
      domain: 'Human Resources & Security Awareness Training',
      controlA: {
        code: 'A.6.1 - A.6.3',
        title: 'Screening, Terms of Employment & Information Security Awareness',
        domain: 'People',
        requirementStatement: 'Background verification checks on all candidates for employment shall be carried out. Personnel shall receive appropriate information security awareness, education and training.',
        auditExpectation: 'Sample background check reports for new hires, signed employment contracts with confidentiality clauses, and annual security awareness training completion (>95%).',
        evidenceExamples: ['Background Check Vendor Proofs', 'Signed NDA / Employee Handbook', 'KnowBe4 Training Completion Report']
      },
      controlB: {
        code: 'CC2.2 / CC2.3',
        title: 'Communication of Responsibilities, Background Checks & Security Training',
        domain: 'Common Criteria: Communication and Information',
        requirementStatement: 'The entity communicates information to improve understanding of personnel responsibilities for security, conducts candidate screening, and ensures ongoing training.',
        auditExpectation: 'Sample 15 new hires: verify background checks completed prior to start date and security training completed within 30 days of onboarding.',
        evidenceExamples: ['HR Onboarding Checklist Sample', 'Annual Security & Phishing Awareness Dashboard', 'Signed Code of Conduct Acknowledgments']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 95,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Direct evidence reuse. Sample HR onboarding files (background check verification) and KnowBe4/Curricula training completion records directly fulfill both requirements.',
      sharedEvidenceArtifacts: [
        'Annual Security Awareness & Anti-Phishing Training Completion Metrics (>95% company-wide)',
        'Sample of New Hire Background Checks (Criminal, Employment, Education verification via Checkr)',
        'Employee Handbook & Code of Business Conduct with Signed Confidentiality Acknowledgment'
      ],
      auditHourSavingsEstimate: 14
    },
    {
      id: 'MAP-ISO-SOC-08',
      domain: 'Data Backup & Operational Resilience',
      controlA: {
        code: 'A.8.13',
        title: 'Information Backup',
        domain: 'Technological',
        requirementStatement: 'Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.',
        auditExpectation: 'Review automated backup schedules, cross-region replication configs, encryption of backups, and quarterly backup restoration test results.',
        evidenceExamples: ['AWS Backup Policy Screenshot', 'Quarterly DB Restore Test Log', 'Cross-Region Backup Replication Config']
      },
      controlB: {
        code: 'A1.2 / A1.3 (Availability Criteria)',
        title: 'Environmental Protections, Backup & Recovery Testing',
        domain: 'Availability Criteria',
        requirementStatement: 'The entity authorizes, designs, develops or acquires, implements, operates, approves, and monitors environmental protections, data backup processes, and recovery infrastructure to meet commitments.',
        auditExpectation: 'Verify automated daily backups of production databases, immutable storage policies, and documented semi-annual recovery time (RTO) test results.',
        evidenceExamples: ['Automated Daily Snapshot Configurations', 'Semi-Annual Disaster Recovery Tabletop & Restore Report', 'AWS Multi-AZ Redundancy Architecture']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 94,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Both auditors require technical verification of daily automated snapshots, immutable backup vaults, and actual restoration test tickets validating recovery objectives.',
      sharedEvidenceArtifacts: [
        'AWS Backup Automated Daily Snapshot Policy with Cross-Region / Immutable Vault Config',
        'Quarterly Database Backup Restoration Drill Sign-Off Report (validating RTO < 2h, RPO < 15m)',
        'High-Availability Architecture Diagram depicting Multi-AZ database failover'
      ],
      auditHourSavingsEstimate: 12
    },
    {
      id: 'MAP-ISO-SOC-09',
      domain: 'Asset Management & Data Classification',
      controlA: {
        code: 'A.5.9 / A.5.12',
        title: 'Inventory of Information and Other Associated Assets & Classification',
        domain: 'Organizational',
        requirementStatement: 'An inventory of information and other associated assets, including owners, shall be developed and maintained. Information shall be classified in accordance with information security needs.',
        auditExpectation: 'Review asset inventory covering hardware, cloud infrastructure, and databases. Inspect 4-tier data classification scheme and labeling procedures.',
        evidenceExamples: ['MDM / Cloud Asset Register', 'Data Classification Policy (Public, Internal, Confidential, Restricted)', 'DLP Labeling Config']
      },
      controlB: {
        code: 'CC6.1 (Asset Scope)',
        title: 'Asset Identification and Boundary Specification',
        domain: 'Common Criteria: System Boundaries',
        requirementStatement: 'The entity maintains an inventory of hardware, software, data, and infrastructure assets that make up the system boundary supporting the commitments and system requirements.',
        auditExpectation: 'Verify system description accurately reflects in-scope infrastructure, databases, and endpoint devices managed under MDM.',
        evidenceExamples: ['Jamf / Kandji MDM Device Inventory', 'Terraform Cloud Infrastructure State Inventory', 'Data Flow Diagram']
      },
      mappingType: 'RELATED_OVERLAP',
      confidenceScore: 88,
      evidenceReusability: 'REQUIRES_ADDITIONAL_METRIC',
      synergyExplanation: 'SOC 2 focuses heavily on the system description boundary and MDM fleet, while ISO 27001 requires formal information asset ownership and risk classification for all assets. Reusing the asset register requires adding data classification tags.',
      sharedEvidenceArtifacts: [
        'Central Asset Register (combining Jamf MDM laptops, AWS production instances, and database stores)',
        'Enterprise Data Classification Scheme & Tagging Guidelines',
        'Data Flow Architecture Diagram defining boundaries of customer data'
      ],
      auditHourSavingsEstimate: 14
    }
  ],

  // UNIQUE TO ISO 27001:2022
  uniqueToA: [
    {
      id: 'UNIQ-ISO-01',
      frameworkId: 'ISO_27001',
      domain: 'ISMS Governance & Certification Scope',
      control: {
        code: 'Clause 6.1.3 (Annex A SoA)',
        title: 'Statement of Applicability (SoA) Formulation',
        domain: 'ISMS Core Requirement (Clause 6)',
        requirementStatement: 'The organisation shall produce a Statement of Applicability that contains the necessary controls, justification for inclusion, whether they are implemented or not, and justification for exclusion of any Annex A controls.',
        auditExpectation: 'Inspect formal SoA document signed by top management addressing all 93 controls of ISO 27001:2022 with rigorous justification for exclusions.',
        evidenceExamples: ['Statement of Applicability v2.0 Matrix', 'Management Board Sign-off on SoA']
      },
      whyUnique: 'SOC 2 does not utilize a Statement of Applicability. SOC 2 evaluates management assertions against the AICPA Trust Services Criteria, whereas ISO 27001 accreditation bodies strictly require a formal 93-control SoA matrix.',
      complianceGuidance: 'Draft the SoA by cross-referencing your SOC 2 control narrative. Since ~78% of controls are already mapped to SOC 2, you only need to document justifications for remaining ISO-specific controls.',
      effortToAddress: 'MEDIUM',
      targetDeliverable: 'Signed ISO/IEC 27001:2022 Statement of Applicability (SoA) Document'
    },
    {
      id: 'UNIQ-ISO-02',
      frameworkId: 'ISO_27001',
      domain: 'Independent Evaluation',
      control: {
        code: 'Clause 9.2',
        title: 'Formal Internal Audit Program (ISO 19011 Compliance)',
        domain: 'ISMS Core Requirement (Clause 9)',
        requirementStatement: 'The organisation shall conduct internal audits at planned intervals to provide information on whether the ISMS conforms to the organisation’s own requirements and the requirements of ISO/IEC 27001.',
        auditExpectation: 'Review independent internal audit charter, auditor qualification certificates (ISO 27001 Lead Auditor), completed audit working papers, and findings log.',
        evidenceExamples: ['Internal Audit Plan & Schedule', 'ISO 19011 Internal Audit Report', 'Auditor Competency Certificates']
      },
      whyUnique: 'SOC 2 evaluates internal controls through an external CPA firm; it does not mandate a formal accredited internal audit program conforming to ISO 19011 before the external assessment.',
      complianceGuidance: 'Engage a certified internal auditor or trained internal staff to execute a formal Stage 1 internal audit checklist covering Clauses 4 through 10 before inviting the certification body.',
      effortToAddress: 'HIGH',
      targetDeliverable: 'Comprehensive ISO 27001 Internal Audit Report with corrective action tickets'
    },
    {
      id: 'UNIQ-ISO-03',
      frameworkId: 'ISO_27001',
      domain: 'Leadership Oversight',
      control: {
        code: 'Clause 9.3',
        title: 'Top Management Review of the ISMS',
        domain: 'ISMS Core Requirement (Clause 9)',
        requirementStatement: 'Top management shall review the organisation’s information security management system at planned intervals to ensure its continuing suitability, adequacy, and effectiveness.',
        auditExpectation: 'Inspect Management Review Meeting minutes containing all mandatory Annex SL agenda inputs (audit results, risk treatment status, metrics, nonconformities, and continual improvement actions).',
        evidenceExamples: ['Annual Management Review Minutes', 'C-Suite Sign-off on ISMS Resource Allocations']
      },
      whyUnique: 'SOC 2 requires management oversight (CC1.2), but does not enforce the specific, rigid Annex SL input/output agenda structure mandated by ISO registrars.',
      complianceGuidance: 'Schedule a dedicated 90-minute Executive Management Review meeting using a standardized Annex SL presentation template covering all required topics.',
      effortToAddress: 'LOW',
      targetDeliverable: 'Signed Management Review Meeting Minutes with formal leadership action items'
    },
    {
      id: 'UNIQ-ISO-04',
      frameworkId: 'ISO_27001',
      domain: 'Technical Privacy Safeguards',
      control: {
        code: 'A.8.11',
        title: 'Data Masking & Pseudonymization',
        domain: 'Technological',
        requirementStatement: 'Data masking shall be used in accordance with the organisation’s topic-specific policy on access control and other related topic-specific policies, and business requirements.',
        auditExpectation: 'Inspect dynamic or static data masking in staging/test environments. Verify production customer PII is never cloned into dev databases unmasked.',
        evidenceExamples: ['Database Obfuscation Scripts', 'PostgreSQL Data Masking Policy', 'Staging Database Verification Log']
      },
      whyUnique: 'Standard SOC 2 Security Criteria (CC1-CC9) does not mandate synthetic or masked data in test environments unless the optional Privacy Trust Principle is scoped.',
      complianceGuidance: 'Implement automated database sanitization scripts or synthetic data generation for dev/staging environments to ensure zero plain-text PII is exported.',
      effortToAddress: 'MEDIUM',
      targetDeliverable: 'Data Masking Pipeline & Sanitized Staging Database Certification'
    },
    {
      id: 'UNIQ-ISO-05',
      frameworkId: 'ISO_27001',
      domain: 'Operational Governance',
      control: {
        code: 'A.5.8',
        title: 'Information Security in Project Management',
        domain: 'Organizational',
        requirementStatement: 'Information security shall be integrated into project management regardless of the type of the project.',
        auditExpectation: 'Review project charter templates: verify security risk assessment checklist is mandatory at project kickoff gates for infrastructure and business initiatives.',
        evidenceExamples: ['Project Management Security Gate Checklist', 'Architecture Review Board (ARB) Minutes']
      },
      whyUnique: 'SOC 2 CC8.1 focuses specifically on software development changes (SDLC), whereas ISO 27001 A.5.8 applies security governance broadly to all corporate project management endeavors.',
      complianceGuidance: 'Add a 3-question security review checkpoint to standard Jira project creation templates and business case charters.',
      effortToAddress: 'LOW',
      targetDeliverable: 'Enterprise Project Management Security Integration Standard'
    }
  ],

  // UNIQUE TO SOC 2 TYPE II
  uniqueToB: [
    {
      id: 'UNIQ-SOC-01',
      frameworkId: 'SOC_2',
      domain: 'Governance & Board Independence',
      control: {
        code: 'CC1.3',
        title: 'Independent Board Oversight & Governance Structure',
        domain: 'Common Criteria: Control Environment',
        requirementStatement: 'The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control.',
        auditExpectation: 'CPA auditors inspect board of directors roster, proof of independent non-executive directors, and board audit committee minutes evaluating cybersecurity posture.',
        evidenceExamples: ['Board Audit Committee Charters', 'Independent Director Documentation', 'Quarterly Board Presentation Decks']
      },
      whyUnique: 'ISO 27001 accepts internal executive management oversight (Clause 5.1). SOC 2 specifically adheres to COSO principle 2 demanding independent board scrutiny for public or enterprise transparency.',
      complianceGuidance: 'Document quarterly cyber risk briefings provided to the Board or Advisory Committee, demonstrating independent inquiry into security investments.',
      effortToAddress: 'MEDIUM',
      targetDeliverable: 'Board Audit Committee Governance Charter and Quarterly Minutes'
    },
    {
      id: 'UNIQ-SOC-02',
      frameworkId: 'SOC_2',
      domain: 'Ethics & Communication',
      control: {
        code: 'CC2.1 (Whistleblower Mechanism)',
        title: 'Whistleblower Hotline & Anonymous Reporting Channel',
        domain: 'Common Criteria: Communication and Information',
        requirementStatement: 'The entity communicates information to external parties regarding the entity’s commitments and system requirements, and maintains an anonymous reporting channel for ethical or security concerns.',
        auditExpectation: 'CPA auditors verify active anonymous whistleblower portal (e.g. EthicsPoint/Whispli) and test whether submitted anonymous reports reach independent counsel.',
        evidenceExamples: ['Whistleblower Policy Document', 'Anonymous Hotline URL & Receipt Logs', 'Annual Whistleblower Test Ticket']
      },
      whyUnique: 'While ISO 27001:2022 has whistleblowing awareness (A.5.4), SOC 2 rigorously tests the operational mechanics of the confidential reporting channel as a core anti-fraud control.',
      complianceGuidance: 'Establish an anonymous intake channel (Google Form or third-party ethics hotline) with direct notification to the General Counsel and Audit Committee.',
      effortToAddress: 'LOW',
      targetDeliverable: 'Formal Whistleblower Policy and Tested Anonymous Reporting Portal'
    },
    {
      id: 'UNIQ-SOC-03',
      frameworkId: 'SOC_2',
      domain: 'Cloud Subservice Organizations',
      control: {
        code: 'CC5.3 (CUECs)',
        title: 'Complementary User Entity Controls (CUECs) Review',
        domain: 'Common Criteria: Control Activities',
        requirementStatement: 'The entity evaluates the Complementary User Entity Controls (CUECs) specified in the SOC 2 reports of its subservice organizations (e.g. AWS, Azure, Datadog) and implements corresponding internal controls.',
        auditExpectation: 'Inspect documented CUEC mapping matrix showing how each AWS/GCP user-entity control (e.g. customer responsible for MFA, backup retention, IAM keys) is satisfied internally.',
        evidenceExamples: ['AWS SOC 2 CUEC Compliance Matrix', 'Subprocessor Responsibilities Mapping']
      },
      whyUnique: 'CUECs are an explicit AICPA construct central to SOC 2 Type II reports that ISO 27001 does not specifically formalize in this manner.',
      complianceGuidance: 'Review Section III of your primary cloud host’s SOC 2 report (e.g. AWS). Extract the listed CUECs into a spreadsheet and annotate your internal controls addressing each one.',
      effortToAddress: 'LOW',
      targetDeliverable: 'Subservice Organization CUEC Review Matrix (AWS/GCP/Datadog)'
    },
    {
      id: 'UNIQ-SOC-04',
      frameworkId: 'SOC_2',
      domain: 'Availability Criteria',
      control: {
        code: 'A1.1',
        title: 'System Capacity, Uptime Commitments & SLA Tracking',
        domain: 'Availability Trust Services Criteria',
        requirementStatement: 'The entity maintains, monitors, and evaluates current processing capacity and availability of the system to meet its commitments and system requirements.',
        auditExpectation: 'Inspect public status page (status.company.com), monthly uptime calculation against customer 99.9% SLAs, and automated alerts for CPU/RAM utilization > 80%.',
        evidenceExamples: ['Datadog Infrastructure Capacity Alarms', 'Public Status Page Historic Uptime Log', 'Monthly SLA Credit / Penalty Reports']
      },
      whyUnique: 'ISO 27001 A.8.6 covers capacity management, but SOC 2 Availability criteria strictly links capacity to public customer contracts, SLA penalty tracking, and customer notice of scheduled downtime.',
      complianceGuidance: 'Link your Datadog/New Relic uptime metrics to a public Statuspage with customer notification toggles and maintain historical 99.9% uptime proof.',
      effortToAddress: 'MEDIUM',
      targetDeliverable: 'Public Status Page & Monthly SLA Availability Compliance Dashboard'
    },
    {
      id: 'UNIQ-SOC-05',
      frameworkId: 'SOC_2',
      domain: 'Fraud Risk Assessment',
      control: {
        code: 'CC3.2',
        title: 'Fraud Risk Evaluation & Executive Incentive Scrutiny',
        domain: 'Common Criteria: Risk Assessment',
        requirementStatement: 'The entity considers the potential for fraud in assessing risks to the achievement of objectives, including incentives, pressures, and opportunities for management override.',
        auditExpectation: 'Inspect risk assessment matrix explicitly evaluating risks of financial fraud, insider data tampering, and executive management override of security controls.',
        evidenceExamples: ['Fraud Risk Assessment Register', 'Segregation of Duties Conflict Audit Log']
      },
      whyUnique: 'ISO 27001 centers primarily on information security risks (confidentiality, integrity, availability). SOC 2 COSO framework requires explicit evaluation of fraudulent reporting and executive malfeasance.',
      complianceGuidance: 'Incorporate a "Fraud & Override" section into your annual Enterprise Risk Assessment, detailing segregation of duties and dual authorization for banking and database modifications.',
      effortToAddress: 'LOW',
      targetDeliverable: 'Enterprise Fraud Risk Assessment & Segregation of Duties Matrix'
    }
  ]
};

// DYNAMIC CROSSWALK GENERATOR FOR ARBITRARY FRAMEWORK PAIRS
export function generateFrameworkPairCrosswalk(
  frameworkAId: FrameworkId,
  frameworkBId: FrameworkId
): FrameworkPairAnalysis {
  // If user selected ISO 27001 vs SOC 2, return the benchmark dataset
  if (
    (frameworkAId === 'ISO_27001' && frameworkBId === 'SOC_2') ||
    (frameworkAId === 'SOC_2' && frameworkBId === 'ISO_27001')
  ) {
    if (frameworkAId === 'SOC_2' && frameworkBId === 'ISO_27001') {
      // Invert A and B
      return {
        frameworkAId: 'SOC_2',
        frameworkBId: 'ISO_27001',
        overallSynergyScore: ISO27001_VS_SOC2_PAIR.overallSynergyScore,
        estimatedAuditHoursSaved: ISO27001_VS_SOC2_PAIR.estimatedAuditHoursSaved,
        directEvidenceReuseRate: ISO27001_VS_SOC2_PAIR.directEvidenceReuseRate,
        executiveBriefing: ISO27001_VS_SOC2_PAIR.executiveBriefing,
        overlapping: ISO27001_VS_SOC2_PAIR.overlapping.map(o => ({
          ...o,
          controlA: o.controlB,
          controlB: o.controlA
        })),
        uniqueToA: ISO27001_VS_SOC2_PAIR.uniqueToB.map(u => ({ ...u, frameworkId: 'SOC_2' })),
        uniqueToB: ISO27001_VS_SOC2_PAIR.uniqueToA.map(u => ({ ...u, frameworkId: 'ISO_27001' }))
      };
    }
    return ISO27001_VS_SOC2_PAIR;
  }

  // Pre-configured synergy baselines for other popular pairings
  const metaA = SUPPORTED_FRAMEWORKS.find(f => f.id === frameworkAId)!;
  const metaB = SUPPORTED_FRAMEWORKS.find(f => f.id === frameworkBId)!;

  let synergyScore = 65;
  let hoursSaved = 110;
  let reuseRate = 75;
  let briefing = `Crosswalk analysis between ${metaA.shortTitle} and ${metaB.shortTitle} reveals substantial structural overlap in foundational security controls, with domain-specific divergence.`;

  if (
    (frameworkAId === 'ISO_27001' && frameworkBId === 'NIST_CSF') ||
    (frameworkAId === 'NIST_CSF' && frameworkBId === 'ISO_27001')
  ) {
    synergyScore = 82;
    hoursSaved = 175;
    reuseRate = 88;
    briefing = `Very strong synergy (82%) between ISO 27001:2022 and NIST CSF 2.0. ISO's 93 controls map closely into NIST's Govern, Protect, Detect, and Respond categories. The primary difference is ISO's certifiable ISMS governance vs NIST's functional cyber outcomes.`;
  } else if (
    (frameworkAId === 'ISO_27001' && frameworkBId === 'MAS_TRM') ||
    (frameworkAId === 'MAS_TRM' && frameworkBId === 'ISO_27001')
  ) {
    synergyScore = 74;
    hoursSaved = 145;
    reuseRate = 80;
    briefing = `Strong operational overlap (74%) in cyber hygiene, IAM, encryption, and vendor risk. MAS TRM imposes strict statutory thresholds (1-hour incident notification, 4-hour max annual downtime, and specific financial critical system mandates) that extend beyond standard ISO 27001 qualitative controls.`;
  } else if (
    (frameworkAId === 'ISO_27001' && frameworkBId === 'ISO_42001') ||
    (frameworkAId === 'ISO_42001' && frameworkBId === 'ISO_27001')
  ) {
    synergyScore = 68;
    hoursSaved = 95;
    reuseRate = 72;
    briefing = `Shared Annex SL high-level structure (Clauses 4 through 10) allows complete reuse of enterprise policies, internal audits, management reviews, and document management. Divergence centers on ISO 42001's specialized AI ethics, model lineage, data provenance, and algorithmic risk assessments.`;
  } else if (
    (frameworkAId === 'ISO_27001' && frameworkBId === 'PCI_DSS') ||
    (frameworkAId === 'PCI_DSS' && frameworkBId === 'ISO_27001')
  ) {
    synergyScore = 71;
    hoursSaved = 130;
    reuseRate = 76;
    briefing = `High technical synergy (71%) covering network firewalls, vulnerability patching, MFA, and access logs. PCI DSS v4.0 requires scoped cardholder data environment (CDE) segmentation and customized validation methods not mandated in general ISO 27001 audits.`;
  }

  // Synthesize overlapping controls tailored to the pair
  const syntheticOverlaps: OverlappingControlMapping[] = [
    {
      id: `MAP-${frameworkAId}-${frameworkBId}-01`,
      domain: 'Identity & Access Management',
      controlA: {
        code: `${metaA.code.split(' ')[0]} IAM-01`,
        title: 'Multi-Factor Authentication & Privileged Access Management',
        domain: 'Access Control',
        requirementStatement: `Mandatory multi-factor authentication (MFA) and strict role-based access control (RBAC) enforced under ${metaA.shortTitle}.`,
        auditExpectation: 'Inspect MFA configurations on production and cloud consoles, privileged account checkout logs, and quarterly access reviews.',
        evidenceExamples: ['Okta MFA Global Policy', 'Quarterly Access Review Sign-offs']
      },
      controlB: {
        code: `${metaB.code.split(' ')[0]} IAM-01`,
        title: 'Authentication, Least Privilege & Access Revocation',
        domain: 'Access Control',
        requirementStatement: `Technical access restrictions and user authentication protocols enforced under ${metaB.shortTitle}.`,
        auditExpectation: 'Verify offboarding within 24 hours, enforcement of least privilege, and non-repudiation logs.',
        evidenceExamples: ['SSO Enforced MFA Logs', 'Offboarding Tickets Sample']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 96,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: `Direct reuse of identity provider (IdP) logs and quarterly access review documentation across both ${metaA.shortTitle} and ${metaB.shortTitle}.`,
      sharedEvidenceArtifacts: [
        'Central Identity Provider (IdP) MFA Global Enforcement Policy Export',
        'Quarterly User Access Review Matrix signed by System Owners',
        'Privileged Access Management (PAM) session recording logs'
      ],
      auditHourSavingsEstimate: 20
    },
    {
      id: `MAP-${frameworkAId}-${frameworkBId}-02`,
      domain: 'Cryptography & Data Security',
      controlA: {
        code: `${metaA.code.split(' ')[0]} CRYPT-02`,
        title: 'Data Encryption at Rest and in Transit',
        domain: 'Cryptography',
        requirementStatement: `Protection of sensitive information using modern encryption standards under ${metaA.shortTitle}.`,
        auditExpectation: 'Review KMS key rotation policies, database storage volume encryption, and TLS 1.3 web cipher suites.',
        evidenceExamples: ['AWS KMS Automated Rotation', 'TLS 1.3 Scan Report']
      },
      controlB: {
        code: `${metaB.code.split(' ')[0]} CRYPT-02`,
        title: 'Cryptographic Protection & Key Management',
        domain: 'Data Protection',
        requirementStatement: `Enforcement of cryptographic controls and secure key lifecycles under ${metaB.shortTitle}.`,
        auditExpectation: 'Inspect cryptographic key lifecycle policy, key destruction protocols, and database field encryption.',
        evidenceExamples: ['KMS Key Policy', 'Database Encryption Evidence']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 94,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Both frameworks recognize AES-256 and TLS 1.2+ as industry baselines. Cloud KMS configurations satisfy both requirements.',
      sharedEvidenceArtifacts: [
        'Enterprise Cryptographic Key Management & Algorithm Standard',
        'Cloud KMS Automated Key Rotation Configuration & Proofs',
        'SSL Labs A+ Certificates & TLS Cipher Suite Configuration'
      ],
      auditHourSavingsEstimate: 16
    },
    {
      id: `MAP-${frameworkAId}-${frameworkBId}-03`,
      domain: 'Vulnerability Management & Pen Testing',
      controlA: {
        code: `${metaA.code.split(' ')[0]} VULN-03`,
        title: 'Continuous Vulnerability Assessment & Penetration Testing',
        domain: 'System Operations',
        requirementStatement: `Identification, scoring, and remediation of technical vulnerabilities within documented SLAs under ${metaA.shortTitle}.`,
        auditExpectation: 'Review automated daily/weekly vulnerability scans and annual certified third-party penetration test reports.',
        evidenceExamples: ['Tenable/Qualys Scans', 'Annual Pen Test Dossier']
      },
      controlB: {
        code: `${metaB.code.split(' ')[0]} VULN-03`,
        title: 'Technical Vulnerability Identification & Threat Remediation',
        domain: 'Threat Management',
        requirementStatement: `Systematic detection and prompt closure of security weaknesses across applications and infrastructure under ${metaB.shortTitle}.`,
        auditExpectation: 'Sample vulnerability remediation tickets for adherence to Critical (<7d) and High (<30d) SLAs.',
        evidenceExamples: ['Snyk/Inspector Scan Exports', 'Remediation SLA Dashboard']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 95,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Annual third-party pen test report and automated CI/CD vulnerability scanning exports satisfy both auditors.',
      sharedEvidenceArtifacts: [
        'Annual Third-Party Penetration Testing Dossier & Attestation of Remediation',
        'Automated Infrastructure & Container Vulnerability Scan Reports',
        'Vulnerability Remediation Tracking Register demonstrating SLA compliance'
      ],
      auditHourSavingsEstimate: 18
    },
    {
      id: `MAP-${frameworkAId}-${frameworkBId}-04`,
      domain: 'Incident Response & Resilience',
      controlA: {
        code: `${metaA.code.split(' ')[0]} INC-04`,
        title: 'Security Incident Management & Escalation',
        domain: 'Incident Management',
        requirementStatement: `Formal procedures for detecting, analyzing, containing, and recovering from security incidents under ${metaA.shortTitle}.`,
        auditExpectation: 'Inspect Incident Response Plan, on-call roster, and annual tabletop exercise records.',
        evidenceExamples: ['Incident Response Plan', 'Tabletop Exercise Minutes']
      },
      controlB: {
        code: `${metaB.code.split(' ')[0]} INC-04`,
        title: 'Incident Detection, Response & Root Cause Analysis',
        domain: 'Resilience',
        requirementStatement: `Execution of documented incident response steps, regulatory notifications, and post-incident lessons learned under ${metaB.shortTitle}.`,
        auditExpectation: 'Review historical incident tickets, post-mortem reports, and SLA timeliness.',
        evidenceExamples: ['Jira Incident Post-Mortems', 'After-Action Report']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 93,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'A single enterprise Incident Response Plan and annual tabletop exercise report serves both audits.',
      sharedEvidenceArtifacts: [
        'Enterprise Incident Response Plan (IRP) & Severity Escalation Matrix',
        'Annual Executive Tabletop Simulation Report & Lessons Learned Deck',
        'Historical Post-Incident Root Cause Analysis (RCA) Reports'
      ],
      auditHourSavingsEstimate: 16
    },
    {
      id: `MAP-${frameworkAId}-${frameworkBId}-05`,
      domain: 'Third-Party & Vendor Governance',
      controlA: {
        code: `${metaA.code.split(' ')[0]} VEN-05`,
        title: 'Supplier Risk Management & Cloud Oversight',
        domain: 'Vendor Risk',
        requirementStatement: `Evaluating, contracting, and monitoring third-party vendors and cloud service providers under ${metaA.shortTitle}.`,
        auditExpectation: 'Review vendor risk tiering inventory, annual SOC 2/ISO certificate collection, and DPA agreements.',
        evidenceExamples: ['Vendor Tiering Register', 'Cloud Provider SOC 2 Reports']
      },
      controlB: {
        code: `${metaB.code.split(' ')[0]} VEN-05`,
        title: 'Third-Party Risk Assessment & Ongoing Due Diligence',
        domain: 'Third-Party Risk',
        requirementStatement: `Assessing sub-processor risks and verifying external service provider controls under ${metaB.shortTitle}.`,
        auditExpectation: 'Sample vendor security questionnaires and verify annual reviews of critical SaaS providers.',
        evidenceExamples: ['Vendor Evaluation Questionnaire', 'Executed DPAs']
      },
      mappingType: 'EXACT_EQUIVALENT',
      confidenceScore: 92,
      evidenceReusability: 'DIRECT_REUSE',
      synergyExplanation: 'Central vendor inventory and collection of cloud provider audit certificates fulfills both requirements.',
      sharedEvidenceArtifacts: [
        'Enterprise Vendor Risk Tiering Inventory (Critical/High/Medium)',
        'Annual Vendor SOC 2 / ISO 27001 Certificate Collection Tracker',
        'Standard Master Services Agreement with Security & Audit Clauses'
      ],
      auditHourSavingsEstimate: 14
    }
  ];

  // Synthesize unique controls for A
  const uniqueToA: UniqueControlRequirement[] = [
    {
      id: `UNIQ-${frameworkAId}-01`,
      frameworkId: frameworkAId,
      domain: `${metaA.category}`,
      control: {
        code: `${metaA.code.split(' ')[0]} SPEC-01`,
        title: `${metaA.shortTitle} Specialized Domain Mandate`,
        domain: metaA.category,
        requirementStatement: `Statutory, certification, or operational requirements unique to ${metaA.name} not evaluated in ${metaB.shortTitle}.`,
        auditExpectation: `Auditor will examine artifacts explicitly aligned with ${metaA.authority} guidelines.`,
        evidenceExamples: [`${metaA.code} Compliance Package`, 'Dedicated Domain Register']
      },
      whyUnique: `${metaB.shortTitle} does not include the specialized regulatory scope or governance mechanisms defined by ${metaA.authority}.`,
      complianceGuidance: `Prepare targeted evidence dossier specifically satisfying ${metaA.shortTitle} without modifying the shared core controls.`,
      effortToAddress: 'MEDIUM',
      targetDeliverable: `${metaA.shortTitle} Specialized Compliance Dossier`
    },
    {
      id: `UNIQ-${frameworkAId}-02`,
      frameworkId: frameworkAId,
      domain: 'Governance & Documentation',
      control: {
        code: `${metaA.code.split(' ')[0]} SPEC-02`,
        title: `${metaA.shortTitle} Framework-Specific Governance & Reporting`,
        domain: 'Governance',
        requirementStatement: `Governance charters, metric reporting, or stakeholder obligations unique to ${metaA.shortTitle}.`,
        auditExpectation: `Verification of specific ${metaA.authority} reporting formats and sign-offs.`,
        evidenceExamples: [`${metaA.shortTitle} Annual Report`, 'Authority Notification Proof']
      },
      whyUnique: `This governance structure is exclusive to ${metaA.name}.`,
      complianceGuidance: `Establish the required governance cadences and maintain signed minutes on file.`,
      effortToAddress: 'LOW',
      targetDeliverable: `${metaA.shortTitle} Annual Governance Review Minutes`
    }
  ];

  // Synthesize unique controls for B
  const uniqueToB: UniqueControlRequirement[] = [
    {
      id: `UNIQ-${frameworkBId}-01`,
      frameworkId: frameworkBId,
      domain: `${metaB.category}`,
      control: {
        code: `${metaB.code.split(' ')[0]} SPEC-01`,
        title: `${metaB.shortTitle} Specific Control Requirement`,
        domain: metaB.category,
        requirementStatement: `Unique operational or reporting expectations required under ${metaB.name} not covered by ${metaA.shortTitle}.`,
        auditExpectation: `Auditor checks compliance against ${metaB.authority} specific criteria.`,
        evidenceExamples: [`${metaB.code} Specific Artifact`, 'Jurisdictional Form']
      },
      whyUnique: `${metaA.shortTitle} does not encompass the distinct mandates or evaluation criteria established by ${metaB.authority}.`,
      complianceGuidance: `Create auxiliary control procedures to bridge the gap without disrupting existing operations.`,
      effortToAddress: 'MEDIUM',
      targetDeliverable: `${metaB.shortTitle} Supplemental Control Documentation`
    },
    {
      id: `UNIQ-${frameworkBId}-02`,
      frameworkId: frameworkBId,
      domain: 'Auditor Evaluation',
      control: {
        code: `${metaB.code.split(' ')[0]} SPEC-02`,
        title: `${metaB.shortTitle} Specific Attestation or Evidence Protocol`,
        domain: 'Evaluation',
        requirementStatement: `Evidence collection format or test cadence specifically demanded by ${metaB.shortTitle} assessors.`,
        auditExpectation: `Inspect sampling logs and attestation statements tailored to ${metaB.authority}.`,
        evidenceExamples: [`${metaB.shortTitle} Attestation Form`, 'Sample Test Working Papers']
      },
      whyUnique: `Testing methodology strictly prescribed under ${metaB.name}.`,
      complianceGuidance: `Integrate the specific sampling requirements into existing quarterly compliance reviews.`,
      effortToAddress: 'LOW',
      targetDeliverable: `${metaB.shortTitle} Verification Record`
    }
  ];

  return {
    frameworkAId,
    frameworkBId,
    overallSynergyScore: synergyScore,
    estimatedAuditHoursSaved: hoursSaved,
    directEvidenceReuseRate: reuseRate,
    overlapping: syntheticOverlaps,
    uniqueToA,
    uniqueToB,
    executiveBriefing: briefing
  };
}
