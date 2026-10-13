import {
  MasterCategory,
  MasterIndustry,
  MasterDepartment,
  ControlItem,
  TenantCompany,
  User,
  AssetRecord,
  DataAssetRecord,
  VendorRecord,
  RiskRecord,
  EvidenceRecord,
  InternalAuditPlan,
  FindingCAPARecord,
  AuditTrailEvent,
  SuperAdminRecommendation,
  TaskRecord,
  DocumentAcknowledgment,
  RiskTreatmentScenario,
  ManagementReviewRecord
} from '../types';
import { MASTER_ISO42001_CONTROLS, ISO42001_CLAUSES_4_10 } from './iso42001MasterData';
import { ISO27001_2022_93_MASTER } from './iso27001_2022_masterControls';
import { generateStandardISMSDocuments } from './standardPoliciesAndProcedures';
import { generateAuditorGradeDocumentSuite } from './auditorGradePolicyEngine';
import { generateInitialDepartmentScopes } from './departmentScopeMasterData';
export { MASTER_ISO42001_CONTROLS, ISO42001_CLAUSES_4_10, generateInitialDepartmentScopes };

export const MASTER_CATEGORIES: MasterCategory[] = [
  { id: 'cat_pvt', name: 'Private Limited Company', description: 'Privately held corporate entity', active: true },
  { id: 'cat_pub', name: 'Public Limited Company', description: 'Publicly traded or listed entity', active: true },
  { id: 'cat_llp', name: 'Limited Liability Partnership (LLP)', description: 'Partnership with limited personal liability', active: true },
  { id: 'cat_part', name: 'Partnership Firm', description: 'General or registered commercial partnership', active: true },
  { id: 'cat_sole', name: 'Sole Proprietorship', description: 'Single individual-owned business entity', active: true },
  { id: 'cat_ngo', name: 'Section 8 / Non-Profit Organisation', description: 'Charitable or non-profit corporation', active: true },
  { id: 'cat_stat', name: 'Statutory Body / Public Corporation', description: 'Government or regulatory authority', active: true }
];

export const MASTER_INDUSTRIES: MasterIndustry[] = [
  { id: 'ind_tech', name: 'Technology & Software SaaS', description: 'Cloud platforms, software vendors, AI and cyber services', active: true },
  { id: 'ind_fin', name: 'Banking, Financial Services & FinTech', description: 'Payment gateways, neo-banks, lending and wealth tech', active: true },
  { id: 'ind_health', name: 'Healthcare & Life Sciences', description: 'Hospitals, medical devices, biotech and health-tech', active: true },
  { id: 'ind_edu', name: 'Education & EdTech', description: 'Universities, online learning systems and school networks', active: true },
  { id: 'ind_mfg', name: 'Manufacturing & Industrial', description: 'Automotive, electronics, chemical and precision engineering', active: true },
  { id: 'ind_retail', name: 'Retail & E-Commerce', description: 'Consumer goods, omnichannel platforms and retail chains', active: true },
  { id: 'ind_log', name: 'Logistics, Supply Chain & Freight', description: 'Warehousing, 3PL, maritime and air freight', active: true },
  { id: 'ind_energy', name: 'Energy, Utilities & Renewables', description: 'Power generation, grid operations and clean energy', active: true },
  { id: 'ind_gov', name: 'Government & Public Sector', description: 'Municipalities, state entities and civic services', active: true },
  { id: 'ind_media', name: 'Media, Entertainment & Telecom', description: 'Broadcasting, streaming platforms and telco operators', active: true },
  { id: 'ind_re', name: 'Real Estate & Infrastructure', description: 'Commercial property, construction and facilities management', active: true },
  { id: 'ind_prof', name: 'Professional Services & Consulting', description: 'Legal, accounting, management advisory and audit practices', active: true },
  { id: 'ind_nonprofit', name: 'Non-Profit & International NGO', description: 'Humanitarian, educational and environmental charities', active: true },
  { id: 'ind_other', name: 'Other / Custom Sector', description: 'Specialized or diversified business sector', active: true }
];

export const MASTER_DEPARTMENTS: MasterDepartment[] = [
  // Technology & Cloud Engineering
  { id: 'dept_it', name: 'Information Technology (IT Operations)', category: 'Technology', active: true },
  { id: 'dept_dev', name: 'Software Engineering & Cloud DevOps', category: 'Technology', active: true },
  { id: 'dept_ds', name: 'Data Science & Machine Learning AI', category: 'Technology', active: true },
  { id: 'dept_bi', name: 'Power BI & Enterprise Analytics', category: 'Technology', active: true },
  { id: 'dept_sre', name: 'Site Reliability Engineering (SRE)', category: 'Technology', active: true },
  { id: 'dept_cloud', name: 'Cloud Architecture & Infrastructure', category: 'Technology', active: true },
  { id: 'dept_dba', name: 'Database Administration (DBA)', category: 'Technology', active: true },
  { id: 'dept_qa', name: 'Quality Assurance (QA) & Test Automation', category: 'Technology', active: true },
  { id: 'dept_prod', name: 'Product Management & UX Design', category: 'Technology', active: true },
  { id: 'dept_api', name: 'API Platform & Microservices', category: 'Technology', active: true },
  { id: 'dept_mobile', name: 'Mobile Application Engineering', category: 'Technology', active: true },
  { id: 'dept_erp', name: 'ERP & Enterprise Applications (SAP/Salesforce)', category: 'Technology', active: true },

  // Information Security & Risk
  { id: 'dept_sec', name: 'Information Security & Cyber SOC', category: 'Risk & Security', active: true },
  { id: 'dept_iam', name: 'Identity & Access Management (IAM)', category: 'Risk & Security', active: true },
  { id: 'dept_threat', name: 'Threat Hunting & Incident Response (CSIRT)', category: 'Risk & Security', active: true },
  { id: 'dept_ia', name: 'Internal Audit & Risk Oversight (Insiders)', category: 'Risk & Security', active: true },
  { id: 'dept_erm', name: 'Enterprise Risk Management (ERM)', category: 'Risk & Security', active: true },
  { id: 'dept_bcdr', name: 'Business Continuity & Disaster Recovery (BCDR)', category: 'Risk & Security', active: true },
  { id: 'dept_ai_gov', name: 'AI Governance & Model Risk Management', category: 'Risk & Security', active: true },
  { id: 'dept_comp', name: 'Compliance & Regulatory Governance', category: 'Risk & Security', active: true },

  // People & Operations
  { id: 'dept_hr', name: 'Human Resources & People Operations', category: 'People & Operations', active: true },
  { id: 'dept_talent', name: 'Talent Acquisition & Recruitment', category: 'People & Operations', active: true },
  { id: 'dept_ld', name: 'Learning & Employee Development (L&D)', category: 'People & Operations', active: true },
  { id: 'dept_proc', name: 'Procurement & Vendor Risk Management (VRM)', category: 'People & Operations', active: true },
  { id: 'dept_ops', name: 'Operations & Business Execution', category: 'People & Operations', active: true },
  { id: 'dept_fac', name: 'Facilities, Physical Security & EHS', category: 'People & Operations', active: true },
  { id: 'dept_supply', name: 'Supply Chain & Inventory Logistics', category: 'People & Operations', active: true },
  { id: 'dept_warehouse', name: 'Warehouse Operations & Distribution', category: 'People & Operations', active: true },

  // Corporate, Finance & Legal
  { id: 'dept_fin', name: 'Finance, Treasury & Accounting', category: 'Corporate & Finance', active: true },
  { id: 'dept_fpa', name: 'Financial Planning & Analysis (FP&A)', category: 'Corporate & Finance', active: true },
  { id: 'dept_payroll', name: 'Payroll & Employee Compensation', category: 'Corporate & Finance', active: true },
  { id: 'dept_revops', name: 'Revenue Operations (RevOps) & Billing', category: 'Corporate & Finance', active: true },
  { id: 'dept_finops', name: 'Cloud FinOps & Cost Optimization', category: 'Corporate & Finance', active: true },
  { id: 'dept_leg', name: 'Legal & Corporate Affairs', category: 'Corporate & Finance', active: true },
  { id: 'dept_privacy', name: 'Data Privacy Office (DPO) & GDPR/PDPA', category: 'Corporate & Finance', active: true },
  { id: 'dept_exec', name: 'Executive Board & C-Suite Secretariat', category: 'Corporate & Finance', active: true },
  { id: 'dept_ir', name: 'Investor Relations & Corporate Governance', category: 'Corporate & Finance', active: true },

  // Commercial & Customer Growth
  { id: 'dept_sales', name: 'Enterprise Sales & Business Development', category: 'Commercial & Growth', active: true },
  { id: 'dept_mkt', name: 'Marketing, Branding & Communications', category: 'Commercial & Growth', active: true },
  { id: 'dept_growth', name: 'Digital Growth & Demand Generation', category: 'Commercial & Growth', active: true },
  { id: 'dept_supp', name: 'Customer Support & Technical Helpdesk', category: 'Commercial & Growth', active: true },
  { id: 'dept_cs', name: 'Customer Success & Account Management', category: 'Commercial & Growth', active: true },
  { id: 'dept_partner', name: 'Partner Channels & Alliances', category: 'Commercial & Growth', active: true },
  { id: 'dept_rd', name: 'Research & Advanced Innovations (R&D)', category: 'Commercial & Growth', active: true }
];

// ISO/IEC 27001:2022 Core Master Controls - Complete 93 Controls across 4 Themes
export const MASTER_ISO27001_CONTROLS: Omit<ControlItem, 'id'>[] = ISO27001_2022_93_MASTER.map(m => ({
  controlCode: m.controlCode,
  title: m.title,
  category: m.theme,
  framework: 'ISO/IEC 27001:2022',
  description: m.description,
  guidance: m.guidance,
  applicable: m.defaultApplicable,
  justification: m.suggestedExclusionReason || 'Fundamental ISO/IEC 27001:2022 baseline control aligned with organizational risk assessment and treatment plan.',
  maturityLevel: m.defaultMaturity as 1 | 2 | 3 | 4 | 5,
  responsibleDepartment: m.responsibleDepartment,
  evidenceRequirements: m.evidenceRequirements,
  collectionFrequency: 'Annual',
  acceptanceCriteria: m.acceptanceCriteria,
  implementationStatus: 'Implemented' as const
}));

// Helper to generate full document set for a tenant
export function generateArtefactsForTenant(
  companyName: string,
  industry: string,
  framework: string,
  departments: string[],
  signatory: string
) {
  const dateStr = new Date().toISOString().split('T')[0];
  
  const policies = [
    {
      id: 'doc_pol_01',
      docCode: 'POL-ISMS-01',
      title: 'Information Security Policy',
      type: 'POLICY' as const,
      category: 'Governance & Management',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Chief Information Security Officer (CISO)',
      approver: 'Executive Board / CEO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      acknowledgementCount: 0,
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Information Security Policy
**Document Ref:** POL-ISMS-01 | **Classification:** Internal | **Standard:** ${framework}

## 1. Purpose & Scope
This policy defines the management direction and commitment of **${companyName}** towards establishing, implementing, maintaining and continuously improving an Information Security Management System (ISMS) in alignment with **${framework}**. This policy applies across all in-scope business entities, operations, information assets, and departments including: ${departments.join(', ')}.

## 2. Information Security Objectives
${companyName} is committed to preserving the **Confidentiality, Integrity, and Availability (CIA)** of all customer, financial, intellectual, and operational data.
- **Confidentiality:** Protecting proprietary algorithms, customer PII, and financial records against unauthorized disclosure.
- **Integrity:** Ensuring the accuracy, completeness, and tamper-resistance of application code and database transactions.
- **Availability:** Guaranteeing 99.9% uptime SLA for production workloads and business-critical cloud services.

## 3. Core Policy Principles
1. **Risk-Based Management:** All organizational decisions concerning security investments and control implementations shall be guided by structured risk assessments.
2. **Access Control:** Access to ${companyName} systems, repositories, and cloud tenants shall follow the Principle of Least Privilege (PoLP) and Role-Based Access Control (RBAC).
3. **Continuous Monitoring & Audit:** Regular internal and external audits shall be conducted to verify adherence to ${framework} controls.
4. **Compliance with Statutory Mandates:** Strict adherence to GDPR, local data protection laws, and contractual obligations with enterprise clients.

## 4. Enforcement & Review
Violations of this policy may result in disciplinary action up to and including termination of employment and legal prosecution. This policy shall be reviewed at least annually or upon significant organizational change.`
    },
    {
      id: 'doc_pol_02',
      docCode: 'POL-ACC-02',
      title: 'Access Control Policy',
      type: 'POLICY' as const,
      category: 'Identity & Access',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Head of Information Technology',
      approver: 'CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      acknowledgementCount: 0,
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Access Control Policy
**Document Ref:** POL-ACC-02 | **Classification:** Internal | **Standard:** ${framework}

## 1. Objective
To govern logical and physical access permissions across ${companyName}'s networks, applications, databases, and facilities, ensuring unauthorized access is prevented.

## 2. Key Access Rules
- **Multi-Factor Authentication (MFA):** Mandatory for all workforce members accessing corporate email, VPN, SSO, cloud consoles (AWS/GCP/Azure), and GitHub.
- **Password Standards:** Minimum 14 characters, complexity requirements, or passwordless FIDO2/WebAuthn tokens where supported.
- **Quarterly Access Recertification:** Department managers must review and re-authorize access rights of their staff every 90 days.
- **Privileged Access Management (PAM):** Administrative accounts must be segregated from standard email/browsing accounts. Just-In-Time (JIT) elevation is enforced for production environments.`
    },
    {
      id: 'doc_pol_03',
      docCode: 'POL-USE-03',
      title: 'Acceptable Use Policy (AUP)',
      type: 'POLICY' as const,
      category: 'Workforce & Assets',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Human Resources & People Ops',
      approver: 'Legal Counsel & CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      acknowledgementCount: 0,
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Acceptable Use Policy
**Document Ref:** POL-USE-03 | **Classification:** Public / All Personnel

## 1. Overview
This policy establishes acceptable practices for using ${companyName} endpoint hardware, cloud email, messaging (Slack/Teams), and network infrastructure.

## 2. Mandatory Rules
- Company devices are provided primarily for legitimate business purposes.
- Storing unencrypted customer PII on personal local storage or unapproved personal cloud accounts (Dropbox, Google Drive) is strictly prohibited.
- Immediate reporting of lost/stolen hardware to IT Helpdesk within 2 hours is mandatory.`
    },
    {
      id: 'doc_pol_04',
      docCode: 'POL-SUP-04',
      title: 'Supplier Security Policy',
      type: 'POLICY' as const,
      category: 'Third-Party Risk',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Procurement & Vendor Management',
      approver: 'CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      acknowledgementCount: 0,
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Supplier Security Policy
**Document Ref:** POL-SUP-04 | **Classification:** Internal

## 1. Purpose
To mitigate cybersecurity and operational risks arising from external software vendors, contractors, and cloud service providers.

## 2. Supplier Lifecycle Requirements
- **Due Diligence:** Mandatory security assessment prior to contract execution for all Tier 1 and Tier 2 suppliers.
- **Contractual Clauses:** Right to audit, 24-hour breach notification SLA, data processing agreement (DPA), and data return/deletion certification upon contract termination.
- **Annual Re-evaluation:** Periodic verification of SOC 2 / ISO 27001 audit reports.`
    },
    {
      id: 'doc_pol_05',
      docCode: 'POL-BCP-05',
      title: 'Business Continuity & Disaster Recovery Policy',
      type: 'POLICY' as const,
      category: 'Resilience',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Operations & Business Continuity',
      approver: 'CEO & CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      acknowledgementCount: 0,
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Business Continuity Policy
**Document Ref:** POL-BCP-05 | **Classification:** Internal

## 1. Policy Mandate
Ensure critical business processes can withstand and recover from catastrophic outages, cyber incidents, and facility disruptions.
- **Target RTO:** Recovery Time Objective < 4 Hours for core SaaS platform.
- **Target RPO:** Recovery Point Objective < 1 Hour (continuous database replication).
- **Annual Simulation Drill:** Execution of end-to-end failover test documented with post-mortem review.`
    },
    {
      id: 'doc_pol_06',
      docCode: 'POL-AI-06',
      title: 'Responsible Artificial Intelligence Policy',
      type: 'POLICY' as const,
      category: 'AI Governance & Ethics',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Chief AI Ethics & Security Officer',
      approver: 'Executive Board / CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      acknowledgementCount: 0,
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Responsible Artificial Intelligence Policy
**Document Ref:** POL-AI-06 | **Standard:** ISO/IEC 42001:2023 Clause 5.2 & Annex A.2.1

## 1. Purpose & Scope
This policy establishes the governance principles, safety boundaries, and ethical requirements for designing, developing, deploying, and operating Artificial Intelligence (AI) and Machine Learning (ML) systems within **${companyName}**, in strict alignment with **ISO/IEC 42001:2023**.

## 2. Core Ethical Principles
- **Transparency & Explainability:** All customer-facing AI interactions must be clearly disclosed. Users have the right to understand algorithmic decisions impacting them.
- **Fairness & Non-Discrimination:** Training data and model outputs must be actively audited for demographic bias and disparate impact.
- **Human Oversight & Accountability:** High-impact automated actions require Human-in-the-Loop (HITL) review. Autonomous destructive decisions are strictly prohibited.
- **Safety, Robustness & Security:** AI models must be resilient against prompt injection, data poisoning, adversarial perturbation, and model inversion attacks.
- **Data Privacy & Lineage:** PII shall be masked prior to training. Training datasets must possess verified legal provenance and copyright compliance.

## 3. Enforcement & Governance
The AI Ethics Board reviews all AI System Impact Assessments (AI-SIA) prior to production deployment. Violations are subject to immediate model suspension.`
    },
    {
      id: 'doc_pol_07',
      docCode: 'POL-ETH-07',
      title: 'AI Ethics, Algorithmic Fairness & Bias Policy',
      type: 'POLICY' as const,
      category: 'AI Governance & Ethics',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Data Science & AI Governance Lead',
      approver: 'Legal Counsel & CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      acknowledgementCount: 0,
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - AI Ethics, Fairness & Bias Policy
**Document Ref:** POL-ETH-07 | **Standard:** ISO/IEC 42001:2023 Annex A.7.3 & A.8.2

## 1. Objective
To guarantee that machine learning models and automated decisioning algorithms operate equitably across all user demographics without unlawful discrimination.

## 2. Mandatory Bias Thresholds
- **Disparate Impact Ratio:** Models must maintain an acceptance/approval ratio between 0.80 and 1.25 across all legally protected demographic categories.
- **Fairness Metrics:** Continuous calculation of Equalized Odds and Demographic Parity in pre-production validation gates.
- **Mitigation Mandate:** If bias metrics exceed acceptable thresholds, the model cannot be deployed until data rebalancing or adversarial de-biasing is applied.`
    }
  ];

  const procedures = [
    {
      id: 'doc_pro_01',
      docCode: 'SOP-RSK-01',
      title: 'Risk Assessment & Treatment Procedure',
      type: 'PROCEDURE' as const,
      category: 'Risk Management',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Information Security & Compliance',
      approver: 'CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Risk Assessment & Treatment Procedure
**Document Ref:** SOP-RSK-01 | **Standard:** ISO 27001 Clause 6.1.2 & 6.1.3

### Step 1: Asset & Threat Identification
Every asset, system, vendor, and process is cataloged with its business owner. Threats and vulnerabilities are identified using industry benchmarks.

### Step 2: Risk Scoring (5x5 Matrix)
- **Likelihood (1-5):** Rare (1), Unlikely (2), Moderate (3), Likely (4), Almost Certain (5).
- **Impact (1-5):** Negligible (1), Minor (2), Moderate (3), Major (4), Catastrophic (5).
- **Inherent Risk Score = Likelihood x Impact (1 to 25).**

### Step 3: Risk Treatment Decision
- Score >= 15 (Critical / High): Mandatory Mitigation or Avoidance. Automatic escalation to Super Admin / Executive Board.
- Score 6-14 (Medium): Mitigate or Transfer with management sign-off.
- Score 1-5 (Low): Accept within organizational appetite.`
    },
    {
      id: 'doc_pro_02',
      docCode: 'SOP-INC-02',
      title: 'Incident Management Procedure',
      type: 'PROCEDURE' as const,
      category: 'Security Operations',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Security Operations Lead',
      approver: 'CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Security Incident Management Procedure
**Document Ref:** SOP-INC-02 | **Standard:** ISO 27001 Clause 5.24 - 5.28

1. **Identification & Triage:** Incident reported via portal or SIEM alerts. Severity assigned (P1 Critical to P4 Low).
2. **Containment & Isolation:** Disconnect compromised instances, revoke active tokens, isolate affected subnets.
3. **Eradication & Recovery:** Remove root cause, restore from clean immutable backups, verify system integrity.
4. **Notification:** Regulators (GDPR 72h window) and affected clients notified by Legal Counsel if PII breached.
5. **Lessons Learned:** Root-cause analysis post-mortem within 5 business days.`
    },
    {
      id: 'doc_pro_03',
      docCode: 'SOP-CHG-03',
      title: 'Change Management Procedure',
      type: 'PROCEDURE' as const,
      category: 'DevOps & IT',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Software Engineering & DevOps',
      approver: 'VP of Engineering',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Change Management Standard Operating Procedure
**Document Ref:** SOP-CHG-03 | **Standard:** ISO 27001 Clause 8.32

1. **Request for Change (RFC):** Submitted via Jira ticketing system detailing impact, rollback plan, and test evidence.
2. **Peer Review & Testing:** Automated unit/integration tests and peer code review approval mandatory.
3. **CAB Approval:** Changes impacting core production infrastructure require Change Advisory Board sign-off.
4. **Deployment & Verification:** Executed during maintenance windows or via blue/green deployment strategy.`
    },
    {
      id: 'doc_pro_04',
      docCode: 'SOP-AUD-04',
      title: 'Internal Audit Procedure',
      type: 'PROCEDURE' as const,
      category: 'Audit & Governance',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Internal Audit Lead',
      approver: 'Audit Committee',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - Internal Audit Procedure
**Document Ref:** SOP-AUD-04 | **Standard:** ISO 27001 Clause 9.2

1. **Annual Audit Planning:** Audit universe defined covering all departments and clauses at least once every 12 months.
2. **Auditor Independence:** Internal auditors shall not audit their own work or direct operational functions.
3. **Fieldwork & Sampling:** Evidence gathered against SoA checklists; working papers documented.
4. **Reporting & CAPA:** Non-conformities classified as Major/Minor/Observation; CAPA owners assigned with 30-day remediation SLAs.`
    },
    {
      id: 'doc_pro_05',
      docCode: 'SOP-AIA-05',
      title: 'AI System Impact Assessment (AI-SIA) Procedure',
      type: 'PROCEDURE' as const,
      category: 'AI Governance & Lifecycle',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Head of AI Risk & Governance',
      approver: 'CISO & AI Ethics Board',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - AI System Impact Assessment (AI-SIA) Procedure
**Document Ref:** SOP-AIA-05 | **Standard:** ISO/IEC 42001:2023 Clause 6.1.2 & Annex A.5.1

### Step 1: Inception & Classification
Determine if the model is High-Risk (e.g. credit underwriting, biometric processing, automated customer account suspension) or Low/Medium Risk.

### Step 2: Impact Evaluation Dimensions
- **Individual Rights & Privacy:** Assess risk of PII memorization, inferential profiling, and automated bias.
- **Safety & Robustness:** Red-team for prompt injection vulnerabilities, jailbreaks, and adversarial input susceptibility.
- **Societal Impact:** Evaluate environmental compute footprint, misinformation risk, and labor impact.

### Step 3: Mitigation Verification
Document technical safeguards (NeMo Guardrails, Presidio PII scrubbers, Fairlearn reweighting). AI Ethics Board sign-off is required before production deployment.`
    },
    {
      id: 'doc_pro_06',
      docCode: 'SOP-DAT-06',
      title: 'AI Training Data Governance & Provenance Procedure',
      type: 'PROCEDURE' as const,
      category: 'AI Data Management',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Lead Data Steward',
      approver: 'Head of Data Science',
      effectiveDate: dateStr,
      reviewCycle: 'Annual',
      lastModified: new Date().toISOString(),
      content: `# ${companyName} - AI Training Data Governance Procedure
**Document Ref:** SOP-DAT-06 | **Standard:** ISO/IEC 42001:2023 Annex A.7.1 & A.7.2

1. **Provenance Verification:** Verify commercial licenses, open-source dataset licenses (MIT, Apache 2.0, CC-BY), and customer consent clauses before data ingestion.
2. **PII Scrubbing:** Execute automated regex and NER-based data sanitization to strip all credit cards, Social Security numbers, and personal identifiers.
3. **Data Quality Gate:** Great Expectations automated validation with >98% completeness and zero label corruption.
4. **Immutable Lineage:** Record dataset hash, source URL, transformation scripts, and date stamps in the enterprise Data Catalog.`
    }
  ];

  const registers = [
    {
      id: 'doc_reg_01',
      docCode: 'REG-RSK-01',
      title: 'Organizational Risk Register',
      type: 'REGISTER' as const,
      category: 'Risk Management',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'CISO',
      approver: 'Executive Board',
      effectiveDate: dateStr,
      reviewCycle: 'Quarterly',
      lastModified: new Date().toISOString(),
      content: `Master risk register containing catalog of identified threats, inherent ratings, treatment owners, and residual risk tracking.`
    },
    {
      id: 'doc_reg_02',
      docCode: 'REG-AST-02',
      title: 'Information & System Asset Inventory',
      type: 'REGISTER' as const,
      category: 'Asset Management',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'IT Operations',
      approver: 'Head of IT',
      effectiveDate: dateStr,
      reviewCycle: 'Quarterly',
      lastModified: new Date().toISOString(),
      content: `Comprehensive register of applications, cloud infrastructure, network components, endpoints, and data repositories.`
    },
    {
      id: 'doc_reg_03',
      docCode: 'REG-VND-03',
      title: 'Approved Vendor & Third-Party Register',
      type: 'REGISTER' as const,
      category: 'Vendor Management',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Procurement',
      approver: 'Legal & Compliance',
      effectiveDate: dateStr,
      reviewCycle: 'Bi-Annual',
      lastModified: new Date().toISOString(),
      content: `Catalog of suppliers, risk tiering, DPA status, ISO certifications, and renewal milestones.`
    },
    {
      id: 'doc_reg_04',
      docCode: 'REG-CAPA-04',
      title: 'Corrective & Preventive Action (CAPA) Log',
      type: 'REGISTER' as const,
      category: 'Continuous Improvement',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Quality Assurance & Governance',
      approver: 'CISO',
      effectiveDate: dateStr,
      reviewCycle: 'Monthly',
      lastModified: new Date().toISOString(),
      content: `Tracking log for internal audit findings, external audit observations, root cause analysis, and verification milestones.`
    }
  ];

  const schedules = [
    {
      id: 'doc_sch_01',
      docCode: 'SCH-EVD-01',
      title: 'Master Evidence Collection Schedule',
      type: 'SCHEDULE' as const,
      category: 'Compliance Evidence',
      version: '1.0',
      status: 'LOCKED' as const,
      owner: 'Lead Compliance Coordinator',
      approver: 'Lead Auditor',
      effectiveDate: dateStr,
      reviewCycle: 'Quarterly',
      lastModified: new Date().toISOString(),
      content: `Detailed cadence matrix mapping every applicable control to responsible departments, required artifact formats, collection frequency, and auditor acceptance criteria.`
    }
  ];

  const auditorGradeDocs = generateAuditorGradeDocumentSuite({
    companyName,
    industry,
    framework,
    departments,
    cisoName: 'Chief Information Security Officer (CISO)'
  });

  const standardDocs = generateStandardISMSDocuments(companyName, framework);

  // Prioritize Auditor-Grade documents, supplemented by complementary standard documents and registers
  const auditorTitles = new Set(auditorGradeDocs.map(d => d.title.toLowerCase()));
  const complementaryStandardDocs = standardDocs.filter(d => !auditorTitles.has(d.title.toLowerCase()));

  return [...auditorGradeDocs, ...complementaryStandardDocs, ...registers, ...schedules];
}

// Dedicated Fresh Organization for New Registration & Onboarding Survey
export const NEW_REGISTRATION_TENANT: TenantCompany = {
  id: 'tenant_new_reg',
  name: 'New Organization Registration',
  contactEmail: '',
  registeredCategory: 'Private Limited Company',
  registeredAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Singapore'
  },
  industryType: 'Banking, Financial Services & FinTech',
  onboardingPhase: 1,
  businessScope: {
    statement: '',
    exclusions: [],
    interestedParties: []
  },
  inScopeDepartmentIds: ['dept_it', 'dept_sec', 'dept_dev', 'dept_hr'],
  departmentScopes: generateInitialDepartmentScopes('tenant_new_reg'),
  customDepartments: [],
  selectedFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021'],
  soaBaselineLocked: false,
  controls: MASTER_ISO27001_CONTROLS.map((c, idx) => ({
    ...c,
    id: `ctrl_new_reg_${idx + 1}`
  })),
  generatedDocs: [],
  mou: {
    executed: false,
    signatoryName: '',
    signatoryRole: '',
    signatoryEmail: '',
    ipAddress: '',
    timestamp: '',
    documentHash: '',
    agreementVersion: '2026.1-STANDARD',
    commercialTier: 'Enterprise Audit Practice Partnership',
    auditWindowStart: '2026-10-01',
    auditWindowEnd: '2026-10-31',
    leadExternalAuditor: 'David Vance (Lead External Auditor)',
    scopeSummary: 'New Enterprise Scope',
    confidentialityTermsAccepted: false
  },
  assignedExternalAuditors: ['usr_ext_auditor'],
  externalAuditTimeline: {
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    stage1Date: '2026-10-10',
    stage2Date: '2026-10-24',
    status: 'Scheduled'
  },
  readinessScore: 0,
  isDemo: false,
  createdAt: '2026-09-01T00:00:00Z'
};

// Pre-seeded Primary Production Tenant: SKANDA Global Operations Ltd
export const INITIAL_TENANTS: TenantCompany[] = [
  NEW_REGISTRATION_TENANT,
  {
    id: 'tenant_skanda',
    organizationId: 'org_skanda_operations',
    name: 'SKANDA Global Operations Ltd',
    contactEmail: 'compliance@skanda.security',
    registeredCategory: 'Enterprise Corporation',
    registeredAddress: {
      street: '1 Marina Boulevard, Level 28',
      city: 'Singapore',
      state: 'Downtown Core',
      postalCode: '018989',
      country: 'Singapore'
    },
    industryType: 'Enterprise Security & Regulatory Compliance',
    onboardingPhase: 5,
    businessScope: {
      statement: 'Comprehensive Information Security Management System (ISMS), MAS TRM, ISO/IEC 27001, and SOC 2 Type II trust operations for SKANDA multi-tenant compliance intelligence architecture and global data processing operations.',
      exclusions: [],
      interestedParties: [
        {
          id: 'ip_skanda_1',
          party: 'Monetary Authority of Singapore (MAS)',
          requirements: 'MAS Technology Risk Management Guidelines (MAS-TRM 2021) and Cyber Hygiene Notices.',
          legalObligation: 'MAS Banking Act / PS Act Regulatory Framework'
        },
        {
          id: 'ip_skanda_2',
          party: 'Enterprise Global Clients & Certification Bodies',
          requirements: 'ISO/IEC 27001:2022 Certification, SOC 2 Type II, Continuous Control Verification, Zero-Trust Evidence Custody.',
          legalObligation: 'Enterprise Master Subscription Agreement & DPA'
        }
      ]
    },
    inScopeDepartmentIds: ['dept_it', 'dept_sec', 'dept_dev', 'dept_ds', 'dept_hr', 'dept_fin', 'dept_leg', 'dept_proc', 'dept_ops', 'dept_qa'],
    departmentScopes: generateInitialDepartmentScopes('tenant_skanda'),
    customDepartments: [],
    selectedFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021', 'SOC 2 Type II', 'ISO/IEC 42001:2023'],
    soaBaselineLocked: true,
    soaBaselineTimestamp: '2026-09-01T00:00:00Z',
    soaBaselineUser: 'ciso@skanda.security (CISO)',
    soaBaselineHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    controls: MASTER_ISO27001_CONTROLS.map((c, idx) => ({
      ...c,
      id: `ctrl_skanda_${idx + 1}`
    })),
    generatedDocs: generateArtefactsForTenant(
      'SKANDA Global Operations Ltd',
      'Enterprise Security & Regulatory Compliance',
      'ISO/IEC 27001:2022',
      ['Information Technology', 'Information Security', 'Software Engineering', 'Finance', 'Legal'],
      'SriKarthiK'
    ).map(doc => ({ ...doc, status: 'PUBLISHED' as const, acknowledgementCount: 52 })),
    mou: {
      executed: true,
      signatoryName: 'SriKarthiK',
      signatoryRole: 'Chief Information Security Officer',
      signatoryEmail: 'ciso@skanda.security',
      ipAddress: '103.252.200.12',
      timestamp: '2026-09-01T08:00:00Z',
      documentHash: '4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a',
      agreementVersion: '2026.1-ENTERPRISE',
      commercialTier: 'Enterprise Continuous Compliance Tier',
      auditWindowStart: '2026-09-01',
      auditWindowEnd: '2026-09-30',
      leadExternalAuditor: 'David Vance (Lead External Auditor)',
      scopeSummary: 'SKANDA Production Multi-Cloud GRC & Continuous Compliance Operations.',
      confidentialityTermsAccepted: true
    },
    assignedExternalAuditors: ['usr_ext_auditor'],
    externalAuditTimeline: {
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      stage1Date: '2026-09-10',
      stage2Date: '2026-09-24',
      status: 'Scheduled'
    },
    readinessScore: 92,
    isDemo: false,
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'tenant_apex',
    name: 'Apex FinTech Solutions Ltd',
    contactEmail: 'compliance@apexfintech.io',
    registeredCategory: 'Private Limited Company',
    registeredAddress: {
      street: '100 Bishopsgate, Level 24',
      city: 'London',
      state: 'Greater London',
      postalCode: 'EC2N 4AG',
      country: 'United Kingdom'
    },
    industryType: 'Banking, Financial Services & FinTech',
    onboardingPhase: 5, // Fully completed
    businessScope: {
      statement: 'The Information Security Management System covers the design, development, cloud operations, customer onboarding, and ongoing maintenance of Apex FinTech SaaS Open-Banking API platform, hosted in AWS (eu-west-1 and eu-west-2 regions), and operated from London Headquarters.',
      exclusions: [
        {
          id: 'ex_1',
          controlOrProcess: 'A.7.11 Supporting utilities (On-premise generator maintenance)',
          justification: 'Apex operates 100% serverless and cloud-native architecture on AWS. No physical data center or standalone electrical power infrastructure is maintained directly by the organization.'
        }
      ],
      interestedParties: [
        {
          id: 'ip_1',
          party: 'Financial Conduct Authority (FCA)',
          requirements: 'Operational resilience, incident notification, consumer duty and anti-money laundering compliance.',
          legalObligation: 'FCA SYSC Regulations & UK PSD2'
        },
        {
          id: 'ip_2',
          party: 'Enterprise Banking Clients',
          requirements: 'ISO 27001:2022 Certification, SOC 2 Type II attestation, 99.95% API Availability, 24h breach notification SLA.',
          legalObligation: 'Master Service Agreement (MSA) & DPA'
        },
        {
          id: 'ip_3',
          party: 'Information Commissioner\'s Office (ICO)',
          requirements: 'Data protection officer appointment, Article 30 records, Privacy by Design, 72h data breach reporting.',
          legalObligation: 'UK GDPR & Data Protection Act 2018'
        }
      ]
    },
    inScopeDepartmentIds: ['dept_it', 'dept_sec', 'dept_dev', 'dept_ds', 'dept_hr', 'dept_fin', 'dept_leg', 'dept_proc', 'dept_ops', 'dept_qa'],
    departmentScopes: generateInitialDepartmentScopes('tenant_apex'),
    customDepartments: [
      {
        id: 'cdept_openbank',
        name: 'Open Banking Integrations',
        owner: 'Liam Hughes',
        headcount: 14
      }
    ],
    selectedFrameworks: ['ISO/IEC 27001:2022', 'ISO/IEC 42001:2023', 'MAS TRM 2021', 'SOC 2 Type II', 'ISO 27701:2019'],
    soaBaselineLocked: false,
    soaBaselineTimestamp: '2026-06-15T09:30:00Z',
    soaBaselineUser: 'srikarthik@apexfintech.io (Company Admin / CISO)',
    soaBaselineHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    controls: [
      ...MASTER_ISO27001_CONTROLS.map((c, idx) => {
        // Formally excluded controls
        if (c.controlCode === 'A.8.12') {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            applicable: false,
            implementationStatus: 'Not Started' as const,
            scopeBoundaryCitation: 'ISMS-SCOPE-2026 §4.2 (Zero Public Database Footprint)',
            riskAssessmentCitation: 'RA-2026-DAT-02 (Residual Risk: 0 - Private VPC Egress Zero-Trust)',
            compensatingControlRef: 'AWS PrivateLink, IAM KMS Strict RBAC & Database Isolation',
            justification: '[Cl. 4.3 Scope: ISMS-SCOPE-2026 §4.2 (Zero Public Database Footprint)] [Cl. 6.1.2 Risk: RA-2026-DAT-02 (Residual Risk: 0 - Private VPC Egress Zero-Trust)] [Compensating: AWS PrivateLink, IAM KMS Strict RBAC & Database Isolation] — Formally excluded: All customer database operations are restricted to internal private VPC subnets with zero direct public internet egress, and corporate policy prohibits local storage of unencrypted PII on developer workstations.'
          };
        }
        if (c.controlCode === 'A.7.10') {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            applicable: false,
            implementationStatus: 'Not Started' as const,
            scopeBoundaryCitation: 'ISMS-SCOPE-2026 §3.1 (Zero Removable Media Authorization)',
            riskAssessmentCitation: 'RA-2026-ENDP-01 (Residual Risk: 0 - Endpoint USB Port Blocking)',
            compensatingControlRef: 'MDM Fleet Hardening (Jamf/Intune Port Disable) & Cloud DLP',
            justification: '[Cl. 4.3 Scope: ISMS-SCOPE-2026 §3.1 (Zero Removable Media Authorization)] [Cl. 6.1.2 Risk: RA-2026-ENDP-01 (Residual Risk: 0 - Endpoint USB Port Blocking)] [Compensating: MDM Fleet Hardening (Jamf/Intune Port Disable) & Cloud DLP] — Formally excluded: Apex FinTech enforces a 100% paperless and cloud-native architecture with zero on-premise physical servers and zero removable media usage. All workstations utilize non-removable soldered NVMe drives.'
          };
        }

        // Planned controls (scheduled in roadmap)
        const plannedCodes = ['A.5.21', 'A.7.11', 'A.7.14', 'A.8.30', 'A.8.34'];
        if (plannedCodes.includes(c.controlCode)) {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            implementationStatus: 'Not Started' as const,
            remediationOwner: 'DevSecOps Engineering Lead',
            targetDate: '2026-11-30',
            remediationPriority: 'High' as const,
            implementationNotes: `[Remediation Plan - ISO 27001 Roadmap Target]\n- Objective: Architecture evaluation and toolchain vendor selection in Q3.\n- Lead: DevSecOps Engineering Lead.\n- Target Completion: Q4 2026 before Stage 2 certification audit.`
          };
        }

        // Specific high-priority remediations requested by Chief ISO Consultant
        if (c.controlCode === 'A.5.7') {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            implementationStatus: 'In Progress' as const,
            remediationOwner: 'SecOps & Incident Response / Sarah Chen',
            responsibleDepartment: 'Information Security & Compliance',
            targetDate: '2026-10-13',
            remediationPriority: 'Critical' as const,
            implementationNotes: `[Technical Safeguards - Cloud & Infrastructure]\n- Architecture: Automated threat intelligence ingestion pipeline deployed.\n- Ingestion Feeds: CISA Known Exploited Vulnerabilities (KEV) catalog and vendor advisory RSS/API webhooks.\n- Alerting: Real-time notification routed to #secops-alerts Slack channel with 4-hour SLA triage for Critical CVEs.\n- Review Cadence: Weekly threat briefing with engineering leads.`,
            remediationMilestones: [
              { id: 'm_a57_1', title: 'Connect automated RSS/API feeds (e.g., CISA Known Exploited Vulnerabilities catalog, vendor security advisories) to your Slack/Teams alerts channel', completed: true, targetDate: '2026-10-05', owner: 'Sarah Chen' },
              { id: 'm_a57_2', title: 'Formalize Threat Intelligence Procedure (SOP-SEC-07) with triage severity matrix', completed: true, targetDate: '2026-10-10', owner: 'Sarah Chen' },
              { id: 'm_a57_3', title: 'Archive monthly threat briefing minutes in ISMS audit evidence folder', completed: false, targetDate: '2026-10-13', owner: 'Sarah Chen' }
            ]
          };
        }

        if (c.controlCode === 'A.5.23') {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            implementationStatus: 'In Progress' as const,
            remediationOwner: 'Cloud Infrastructure Architect / Marcus Brody',
            responsibleDepartment: 'IT & Cloud Infrastructure',
            targetDate: '2026-10-13',
            remediationPriority: 'High' as const,
            implementationNotes: `[Technical Safeguards & Cloud Governance]\n- Scope: AWS multi-account landing zone and Google Cloud Vertex AI tenancies.\n- Shared Responsibility: Formally documented in Cloud Security Matrix (CSM-2026-v2).\n- Security Baselines: Enforced via AWS Organizations Service Control Policies (SCPs) preventing public bucket creation and unencrypted RDS instances.`,
            remediationMilestones: [
              { id: 'm_a523_1', title: 'Download the AWS/GCP/Azure SOC 2 Type II reports and ISO 27001 certificates for your top cloud providers into your evidence repository', completed: true, targetDate: '2026-10-04', owner: 'Marcus Brody' },
              { id: 'm_a523_2', title: 'Establish Cloud Security Standard addressing shared responsibility matrices and data egress controls', completed: true, targetDate: '2026-10-09', owner: 'Marcus Brody' },
              { id: 'm_a523_3', title: 'Execute annual cloud configuration review and verify IAM role assumption constraints', completed: false, targetDate: '2026-10-13', owner: 'Marcus Brody' }
            ]
          };
        }

        if (c.controlCode === 'A.8.9') {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            implementationStatus: 'In Progress' as const,
            remediationOwner: 'DevSecOps Engineering Lead',
            responsibleDepartment: 'Software Engineering & DevOps',
            targetDate: '2026-10-13',
            remediationPriority: 'High' as const,
            implementationNotes: `[Configuration Hardening & Automation]\n- Hardening Standard: CIS Amazon Web Services Foundations Benchmark v1.4.0 Level 2.\n- Drift Detection: AWS Config rules active across all production VPCs.\n- Immutable Infrastructure: Zero manual changes allowed; all infrastructure provisioned via Terraform CI/CD pipelines.`,
            remediationMilestones: [
              { id: 'm_a89_1', title: 'Export and attach baseline configuration scanning results (e.g., AWS Config or CIS Benchmark compliance reports)', completed: true, targetDate: '2026-10-06', owner: 'DevSecOps Engineering Lead' },
              { id: 'm_a89_2', title: 'Implement automated Terraform configuration drift alarms in Datadog alerting within 15 minutes', completed: true, targetDate: '2026-10-10', owner: 'DevSecOps Engineering Lead' },
              { id: 'm_a89_3', title: 'Conduct quarterly golden AMI baseline audit with Head of Security', completed: false, targetDate: '2026-10-13', owner: 'DevSecOps Engineering Lead' }
            ]
          };
        }

        if (c.controlCode === 'A.8.16') {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            implementationStatus: 'In Progress' as const,
            remediationOwner: 'SecOps & Incident Response',
            responsibleDepartment: 'Information Security & Compliance',
            targetDate: '2026-10-13',
            remediationPriority: 'Critical' as const,
            implementationNotes: `[Security Event Logging & SIEM Monitoring]\n- Telemetry: Centralized CloudWatch and AWS CloudTrail streaming to Datadog SIEM with 365-day immutable S3 Glacier retention.\n- Detection Rules: High-severity alarms on root account logins, IAM privilege escalations, security group alterations, and suspicious MFA resets.\n- Response: On-call engineer alerted via PagerDuty within 5 minutes of trigger.`,
            remediationMilestones: [
              { id: 'm_a816_1', title: 'Validate that root/administrator login alerts, VPC changes, and firewall modifications generate SIEM or logging notifications', completed: true, targetDate: '2026-10-05', owner: 'SecOps & Incident Response' },
              { id: 'm_a816_2', title: 'Execute simulated unauthorized security group modification and verify PagerDuty paging SLA', completed: true, targetDate: '2026-10-09', owner: 'SecOps & Incident Response' },
              { id: 'm_a816_3', title: 'Assemble 90-day SIEM uptime and audit log integrity packet for Stage 1 submission', completed: false, targetDate: '2026-10-13', owner: 'SecOps & Incident Response' }
            ]
          };
        }

        if (c.controlCode === 'A.8.28') {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            implementationStatus: 'In Progress' as const,
            remediationOwner: 'DevSecOps Engineering Lead',
            responsibleDepartment: 'Software Engineering & DevOps',
            targetDate: '2026-10-13',
            remediationPriority: 'Critical' as const,
            implementationNotes: `[Secure Software Development Lifecycle (SSDLC)]\n- Pipeline Controls: GitHub Actions workflow executes Snyk Code (SAST) and Snyk Open Source (SCA) on every pull request.\n- Branch Protection: Merge blocked if any Critical or High vulnerability is detected.\n- Secret Scanning: GitHub Secret Scanning and TruffleHog enabled with pre-commit hooks.`,
            remediationMilestones: [
              { id: 'm_a828_1', title: 'Ensure your CI/CD pipeline enforces SAST/dependency vulnerability scanning with blocking rules on Critical CVEs', completed: true, targetDate: '2026-10-07', owner: 'DevSecOps Engineering Lead' },
              { id: 'm_a828_2', title: 'Publish Secure Coding Standard (POL-SSDLC-01) referencing OWASP Top 10 guidelines', completed: true, targetDate: '2026-10-10', owner: 'DevSecOps Engineering Lead' },
              { id: 'm_a828_3', title: 'Execute quarterly third-party penetration testing and verify zero critical vulnerabilities', completed: false, targetDate: '2026-10-13', owner: 'DevSecOps Engineering Lead' }
            ]
          };
        }

        // Partially Implemented controls (active implementation / remediation in progress)
        const partialCodes = [
          'A.5.16', 'A.5.18', 'A.5.30',
          'A.6.3', 'A.7.4', 'A.8.10', 'A.8.11',
          'A.8.23', 'A.8.32'
        ];
        if (partialCodes.includes(c.controlCode)) {
          return {
            ...c,
            id: `ctrl_apex_${idx + 1}`,
            implementationStatus: 'In Progress' as const,
            remediationOwner: 'Sarah Chen (Head of SecOps)',
            targetDate: '2026-10-15',
            remediationPriority: 'Critical' as const,
            implementationNotes: `[Active Technical Remediation]\n- Current Status: Phase 1 safeguard deployed and verified in staging VPC.\n- Pending Actions: CI/CD automated pipeline policy gating and operational logging ingestion to SIEM.\n- Lead: Sarah Chen (Head of SecOps). Target: Oct 15, 2026.`,
            remediationMilestones: [
              { id: `m_${c.controlCode}_1`, title: 'Deploy baseline technical safeguard in staging VPC', completed: true, targetDate: '2026-10-05', owner: 'Sarah Chen' },
              { id: `m_${c.controlCode}_2`, title: 'Conduct operational validation and collect audit logs', completed: false, targetDate: '2026-10-15', owner: 'Sarah Chen' }
            ]
          };
        }

        // Implemented controls (72 controls operational & audited)
        return {
          ...c,
          id: `ctrl_apex_${idx + 1}`,
          remediationOwner: 'CISO / Lead Security Engineer',
          targetDate: '2026-06-30',
          remediationPriority: 'Medium' as const,
          implementationNotes: `[Operational Baseline]\n- Safeguard fully deployed in production environment.\n- Continuous automated monitoring active via AWS Config and Datadog.\n- Formal evidence archived under annual ISMS repository.`
        };
      }),
      ...MASTER_ISO42001_CONTROLS.map((c, idx) => ({
        ...c,
        id: `ctrl_apex_ai_${idx + 1}`
      }))
    ],
    generatedDocs: generateArtefactsForTenant(
      'Apex FinTech Solutions Ltd',
      'Banking, Financial Services & FinTech',
      'ISO/IEC 27001:2022',
      ['Information Technology', 'Information Security', 'Software Engineering', 'Finance', 'Legal'],
      'SriKarthiK'
    ).map(doc => ({ ...doc, status: 'PUBLISHED' as const, acknowledgementCount: 48 })),
    mou: {
      executed: true,
      signatoryName: 'SriKarthiK',
      signatoryRole: 'Chief Information Security Officer & Board Delegate',
      signatoryEmail: 'srikarthik@apexfintech.io',
      ipAddress: '185.192.68.14',
      timestamp: '2026-06-15T10:14:22Z',
      documentHash: '8f49b6b7a9829e160e948c26b5d92039c4a86f9104b2a8d9f1c7e63b40d58a12',
      agreementVersion: '2026.1-ENTERPRISE',
      commercialTier: 'Enterprise Audit Practice Partnership',
      auditWindowStart: '2026-09-01',
      auditWindowEnd: '2026-09-30',
      leadExternalAuditor: 'David Vance (Lead External Auditor)',
      scopeSummary: 'ISO/IEC 27001:2022 Stage 1 & Stage 2 Initial Certification Audit for UK & EU SaaS Operations.',
      confidentialityTermsAccepted: true
    },
    assignedExternalAuditors: ['usr_ext_auditor'],
    externalAuditTimeline: {
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      stage1Date: '2026-09-10',
      stage2Date: '2026-09-24',
      status: 'Scheduled'
    },
    readinessScore: 0,
    isDemo: true,
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'tenant_cyber',
    name: 'CyberGuard Systems Corp',
    contactEmail: 'admin@cyberguard.tech',
    registeredCategory: 'Private Limited Company',
    registeredAddress: {
      street: '550 Howard Street, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States'
    },
    industryType: 'Technology & Software SaaS',
    onboardingPhase: 4, // Reached MoU execution phase
    businessScope: {
      statement: 'Cloud-native threat detection platform and managed SIEM agent operations.',
      exclusions: [],
      interestedParties: [
        {
          id: 'ip_cg_1',
          party: 'SOC 2 & ISO 27001 Certification Bodies',
          requirements: 'Compliance attestation reports.',
          legalObligation: 'Commercial contract SLAs'
        }
      ]
    },
    inScopeDepartmentIds: ['dept_it', 'dept_sec', 'dept_dev', 'dept_hr'],
    customDepartments: [],
    selectedFrameworks: ['ISO/IEC 27001:2022'],
    soaBaselineLocked: true,
    soaBaselineTimestamp: '2026-08-20T14:22:00Z',
    soaBaselineUser: 'admin@cyberguard.tech',
    soaBaselineHash: 'c795a98d6174a3f4e1975e929b3c4f7b6d5e182390a48b59c21ef83247d890e1',
    controls: MASTER_ISO27001_CONTROLS.map((c, idx) => ({
      ...c,
      id: `ctrl_cg_${idx + 1}`
    })),
    generatedDocs: generateArtefactsForTenant(
      'CyberGuard Systems Corp',
      'Technology & Software SaaS',
      'ISO/IEC 27001:2022',
      ['IT', 'Security', 'Engineering'],
      'Alex Mercer'
    ),
    mou: {
      executed: false,
      signatoryName: '',
      signatoryRole: '',
      signatoryEmail: '',
      ipAddress: '',
      timestamp: '',
      documentHash: '',
      agreementVersion: '2026.1-STANDARD',
      commercialTier: 'Growth SaaS Audit Tier',
      auditWindowStart: '2026-10-01',
      auditWindowEnd: '2026-10-31',
      leadExternalAuditor: 'David Vance (Lead External Auditor)',
      scopeSummary: 'ISO 27001:2022 Certification Assessment for SIEM Cloud Platform.',
      confidentialityTermsAccepted: false
    },
    assignedExternalAuditors: ['usr_ext_auditor'],
    externalAuditTimeline: {
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      stage1Date: '2026-10-12',
      stage2Date: '2026-10-26',
      status: 'Scheduled'
    },
    readinessScore: 0,
    isDemo: true,
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'tenant_nova',
    name: 'Nova Health Informatics',
    contactEmail: 'compliance@novahealth.care',
    registeredCategory: 'LLP',
    registeredAddress: {
      street: '200 Medical Center Way',
      city: 'Boston',
      state: 'MA',
      postalCode: '02115',
      country: 'United States'
    },
    industryType: 'Healthcare & Life Sciences',
    onboardingPhase: 2, // In Scope & SoA phase
    businessScope: {
      statement: 'Electronic health record (EHR) exchange platform and clinical trials portal.',
      exclusions: [],
      interestedParties: [
        {
          id: 'ip_nh_1',
          party: 'HIPAA & FDA Regulatory Auditors',
          requirements: 'ePHI safeguards, encryption, strict audit trail logging.',
          legalObligation: 'HIPAA Security Rule 45 CFR Part 164'
        }
      ]
    },
    inScopeDepartmentIds: ['dept_it', 'dept_sec', 'dept_rd'],
    customDepartments: [],
    selectedFrameworks: ['ISO/IEC 27001:2022', 'ISO 27701:2019'],
    soaBaselineLocked: false,
    controls: MASTER_ISO27001_CONTROLS.map((c, idx) => ({
      ...c,
      id: `ctrl_nh_${idx + 1}`
    })),
    generatedDocs: [],
    mou: {
      executed: false,
      signatoryName: '',
      signatoryRole: '',
      signatoryEmail: '',
      ipAddress: '',
      timestamp: '',
      documentHash: '',
      agreementVersion: '2026.1-HEALTHCARE',
      commercialTier: 'Healthcare & Life Sciences Tier',
      auditWindowStart: '2026-11-01',
      auditWindowEnd: '2026-11-30',
      leadExternalAuditor: 'David Vance',
      scopeSummary: 'HIPAA + ISO 27001 Combined Clinical EHR Assessment.',
      confidentialityTermsAccepted: false
    },
    assignedExternalAuditors: [],
    externalAuditTimeline: {
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      stage1Date: '2026-11-10',
      stage2Date: '2026-11-25',
      status: 'Scheduled'
    },
    readinessScore: 0,
    isDemo: true,
    createdAt: '2026-08-25T09:00:00Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_super_admin',
    name: 'Elena Rostova',
    email: 'elena.rostova@grcportal.internal',
    role: 'SUPER_ADMIN',
    tenantId: 'super',
    title: 'Platform Master Admin & Head of Audit Practice'
  },
  {
    id: 'usr_ext_auditor',
    name: 'David Vance, Lead Auditor',
    email: 'david.vance@grc-auditpractice.com',
    role: 'PLATFORM_AUDITOR',
    tenantId: 'super',
    title: 'External ISO Lead Auditor (IRCA Certified)'
  },
  {
    id: 'usr_company_admin',
    name: 'SriKarthiK',
    email: 'srikarthik@skanda.security',
    role: 'COMPANY_ADMIN',
    tenantId: 'tenant_skanda',
    title: 'Chief Information Security Officer (CISO)'
  },
  {
    id: 'usr_internal_auditor',
    name: 'Marcus Brody',
    email: 'marcus.brody@skanda.security',
    role: 'INTERNAL_AUDITOR',
    tenantId: 'tenant_skanda',
    title: 'Lead Internal Auditor & Risk Specialist'
  },
  {
    id: 'usr_dept_contributor',
    name: 'Priya Sharma',
    email: 'priya.sharma@skanda.security',
    role: 'DEPARTMENT_CONTRIBUTOR',
    tenantId: 'tenant_skanda',
    departmentId: 'dept_dev',
    title: 'Senior DevOps & Cloud Infrastructure Engineer'
  },
  {
    id: 'usr_exec_viewer',
    name: 'Jonathan Ward',
    email: 'jonathan.ward@skanda.security',
    role: 'EXECUTIVE_VIEWER',
    tenantId: 'tenant_skanda',
    title: 'Chief Executive Officer & Board Member'
  }
];

export const INITIAL_ASSETS: AssetRecord[] = [
  {
    id: 'ast_1',
    tenantId: 'tenant_apex',
    name: 'Core Open-Banking API Gateway',
    type: 'Application',
    criticality: 'Critical',
    owner: 'Priya Sharma (DevOps Lead)',
    department: 'Software Engineering & DevOps',
    location: 'AWS eu-west-1 (Ireland)',
    classification: 'Confidential',
    description: 'High-throughput microservices gateway processing open banking payment requests and transaction aggregation.',
    lastReviewDate: '2026-07-15'
  },
  {
    id: 'ast_2',
    tenantId: 'tenant_apex',
    name: 'PostgreSQL Aurora Multi-AZ Cluster',
    type: 'Infrastructure',
    criticality: 'Critical',
    owner: 'Liam Hughes (Data Platform)',
    department: 'Information Technology (IT)',
    location: 'AWS eu-west-1 encrypted via KMS',
    classification: 'Restricted',
    description: 'Primary relational database holding account ledgers, audit trails, and encrypted user credentials.',
    lastReviewDate: '2026-08-01'
  },
  {
    id: 'ast_3',
    tenantId: 'tenant_apex',
    name: 'Okta Identity Cloud (SSO & MFA)',
    type: 'Application',
    criticality: 'High',
    owner: 'SriKarthiK (CISO)',
    department: 'Information Security & Compliance',
    location: 'SaaS / Multi-Region',
    classification: 'Restricted',
    description: 'Workforce identity provider enforcing WebAuthn MFA, adaptive risk policies, and SCIM provisioning.',
    lastReviewDate: '2026-08-10'
  },
  {
    id: 'ast_4',
    tenantId: 'tenant_apex',
    name: 'London HQ Network & Firewall Appliance',
    type: 'Facility',
    criticality: 'Medium',
    owner: 'Dave Miller (Facilities)',
    department: 'Facilities, Physical Security & EHS',
    location: '100 Bishopsgate, London',
    classification: 'Internal',
    description: 'Fortinet Next-Gen Firewall protecting office Wi-Fi and physical badge access control server.',
    lastReviewDate: '2026-06-20'
  },
  {
    id: 'ast_5',
    tenantId: 'tenant_apex',
    name: 'Corporate Managed MacBooks & Laptops',
    type: 'Device',
    criticality: 'High',
    owner: 'IT Helpdesk',
    department: 'Information Technology (IT)',
    location: 'Distributed Workforce (MDM Enforced)',
    classification: 'Confidential',
    description: '145 corporate laptops managed via Jamf Pro with FileVault 2 encryption and CrowdStrike EDR.',
    lastReviewDate: '2026-08-15'
  }
];

export const INITIAL_DATA_ASSETS: DataAssetRecord[] = [
  {
    id: 'da_1',
    tenantId: 'tenant_apex',
    datasetName: 'Customer Banking Credentials & Auth Tokens',
    description: 'OAuth tokens, API client secrets, and hashed bank account identifiers.',
    dataClassification: 'Restricted',
    personalDataIncluded: true,
    retentionPeriod: 'Duration of active client subscription + 90 days',
    lawfulBasis: 'Contract',
    crossBorderTransfer: false,
    owner: 'SriKarthiK (CISO)',
    storageLocation: 'AWS Secrets Manager & KMS Vault'
  },
  {
    id: 'da_2',
    tenantId: 'tenant_apex',
    datasetName: 'KYC & Customer Identification Documents',
    description: 'Passport scans, proof of address, company incorporation certificates.',
    dataClassification: 'Confidential',
    personalDataIncluded: true,
    retentionPeriod: '5 years post termination (FCA AML mandate)',
    lawfulBasis: 'Legal Obligation',
    crossBorderTransfer: true,
    destinationCountries: 'UK & EEA only',
    safeguards: 'Standard Contractual Clauses (SCC) with KMS encryption',
    owner: 'Emma Watson (Head of Compliance)',
    storageLocation: 'Encrypted S3 Bucket with Object Lock'
  },
  {
    id: 'da_3',
    tenantId: 'tenant_apex',
    datasetName: 'Employee HR & Payroll Records',
    description: 'Salaries, tax records, home addresses, performance evaluations.',
    dataClassification: 'Confidential',
    personalDataIncluded: true,
    retentionPeriod: '6 years following employment termination',
    lawfulBasis: 'Legal Obligation',
    crossBorderTransfer: false,
    owner: 'Rachel Zane (Head of People)',
    storageLocation: 'BambooHR & Workday Secure Cloud'
  }
];

export const INITIAL_VENDORS: VendorRecord[] = [
  {
    id: 'vnd_1',
    tenantId: 'tenant_apex',
    name: 'Amazon Web Services (AWS EMEA)',
    serviceProvided: 'Cloud infrastructure, Kubernetes EKS, RDS, and S3 Storage',
    tier: 'Tier 1 - High Risk',
    criticality: 'Critical',
    dueDiligenceStatus: 'Completed',
    certifications: ['ISO/IEC 27001:2022', 'SOC 2 Type II', 'PCI-DSS Level 1', 'FedRAMP'],
    contractClauses: ['Right to Audit', '24h Security Breach Notice', 'EU Standard Contractual Clauses', 'DPA Attached'],
    dpaSigned: true,
    nextReviewDate: '2027-01-15',
    contactPerson: 'Enterprise Support Desk',
    contactEmail: 'aws-support@amazon.com'
  },
  {
    id: 'vnd_2',
    tenantId: 'tenant_apex',
    name: 'CrowdStrike Inc',
    serviceProvided: 'Falcon Endpoint Detection and Response (EDR) and Threat Intel',
    tier: 'Tier 1 - High Risk',
    criticality: 'Major',
    dueDiligenceStatus: 'Completed',
    certifications: ['ISO 27001', 'SOC 2 Type II'],
    contractClauses: ['Continuous Telemetry Protection', 'Strict Confidentiality', 'DPA'],
    dpaSigned: true,
    nextReviewDate: '2026-12-01',
    contactPerson: 'Account Executive',
    contactEmail: 'enterprise@crowdstrike.com'
  },
  {
    id: 'vnd_3',
    tenantId: 'tenant_apex',
    name: 'Okta Identity Inc',
    serviceProvided: 'Single Sign-On (SSO), MFA, and Directory Federation',
    tier: 'Tier 1 - High Risk',
    criticality: 'Critical',
    dueDiligenceStatus: 'Completed',
    certifications: ['ISO 27001', 'SOC 2 Type II', 'ISO 27018'],
    contractClauses: ['99.99% Availability SLA', 'Breach Notification 24h', 'DPA Attached'],
    dpaSigned: true,
    nextReviewDate: '2027-02-28',
    contactPerson: 'Customer Success Manager',
    contactEmail: 'success@okta.com'
  },
  {
    id: 'vnd_4',
    tenantId: 'tenant_apex',
    name: 'Slack Technologies (Salesforce)',
    serviceProvided: 'Internal enterprise messaging and incident bridge channels',
    tier: 'Tier 2 - Medium Risk',
    criticality: 'Standard',
    dueDiligenceStatus: 'Completed',
    certifications: ['ISO 27001', 'SOC 2 Type II', 'HIPAA compliant'],
    contractClauses: ['Enterprise Key Management Support', 'Data Retention Policies'],
    dpaSigned: true,
    nextReviewDate: '2026-11-15',
    contactPerson: 'Sales Team',
    contactEmail: 'sales@slack.com'
  }
];

export const INITIAL_RISKS: RiskRecord[] = [
  {
    id: 'rsk_1',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-01',
    title: 'Unauthorized Cloud Privilege Escalation in Production AWS Accounts',
    category: 'Information Security',
    linkedItem: 'AWS eu-west-1 Infrastructure (ast_2)',
    department: 'Software Engineering & DevOps',
    threatDescription: 'Compromise of developer IAM credentials leading to unauthorized lateral movement and database dump.',
    vulnerabilityDescription: 'Legacy long-lived IAM access keys previously utilized in standalone automated scripts.',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Migrated 100% CI/CD scripts to GitHub Actions OpenID Connect (OIDC) with zero static access keys, plus AWS GuardDuty anomaly alerts.',
    treatmentOwner: 'Priya Sharma (DevOps Lead)',
    targetDate: '2026-07-30',
    residualLikelihood: 1,
    residualImpact: 4,
    residualScore: 4,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: true,
    frameworkMappings: {
      iso27001Controls: ['A.5.15', 'A.5.23', 'A.8.2'],
      iso42001Controls: ['A.6.2', 'A.8.4'],
      masTrmSections: ['MAS TRM 5.1', 'MAS TRM 8.2', 'MAS Notice 644']
    },
    controlEffectiveness: 94,
    evidenceLinks: [
      {
        id: 'ev_rsk_1_1',
        name: 'AWS IAM Identity Center OIDC Trust Policy & Zero Static Keys Config',
        controlCode: 'A.5.15',
        type: 'Terraform IaC & IAM Audit Log',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadedDate: '2026-08-12',
        status: 'Verified',
        verificationNotes: 'Audited by Lead Auditor. All static IAM secrets rotated out and revoked.'
      },
      {
        id: 'ev_rsk_1_2',
        name: 'AWS GuardDuty S3 Anomaly Detection & CloudTrail Telemetry Log',
        controlCode: 'A.8.16',
        type: 'SIEM Export & Telemetry Feed',
        sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        uploadedDate: '2026-08-20',
        status: 'Verified'
      }
    ],
    executiveAcceptance: {
      required: true,
      status: 'Accepted',
      acceptedBy: 'SriKarthiK (CISO)',
      acceptedAt: '2026-08-15T09:30:00Z',
      reviewFrequencyMonths: 6,
      expiryDate: '2027-02-15',
      justification: 'Residual risk score of 4 is strictly within Board-approved risk appetite (≤4). Compensating controls include real-time CloudTrail SIEM alarms.',
      compensatingControls: 'CloudWatch real-time metric alarm triggers automated Slack PagerDuty escalation on any Root/IAM write API call.',
      boardMeetingRef: 'Q3-2026-BOR-MIN-04'
    },
    telemetrySignals: [
      {
        source: 'AWS Security Hub',
        alertTitle: 'GuardDuty: IAMUser/AdministrativePrivilegesGranted anomaly detected (Resolved)',
        severity: 'Low',
        detectedAt: '2026-08-28T14:22:00Z',
        active: false,
        rawPayloadSnippet: '{"account": "123456789012", "service": "guardduty", "findings": 0, "status": "COMPLIANT"}'
      }
    ]
  },
  {
    id: 'rsk_2',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-02',
    title: 'Phishing Attack Targeting Finance Payroll Authorizers',
    category: 'Process',
    linkedItem: 'Finance & Banking Authorization Workflow',
    department: 'Finance & Accounting',
    threatDescription: 'Sophisticated CEO fraud or spear-phishing email soliciting fraudulent wire transfer changes.',
    vulnerabilityDescription: 'Reliance on single-person email confirmations for vendor bank account modification.',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Enforced mandatory dual-authorization on banking portal, out-of-band telephone voice verification, and monthly anti-phishing simulations.',
    treatmentOwner: 'David Sterling (CFO)',
    targetDate: '2026-08-15',
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: true,
    frameworkMappings: {
      iso27001Controls: ['A.6.3', 'A.5.15', 'A.5.19'],
      iso42001Controls: ['A.5.2'],
      masTrmSections: ['MAS TRM 9.1', 'MAS TRM 11.2']
    },
    controlEffectiveness: 92,
    evidenceLinks: [
      {
        id: 'ev_rsk_2_1',
        name: 'Dual Authorization Standard Operating Procedure & Sign-off Register',
        controlCode: 'A.6.3',
        type: 'Policy Document & Audit Trail',
        sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        uploadedDate: '2026-08-01',
        status: 'Verified'
      }
    ],
    executiveAcceptance: {
      required: false,
      status: 'Accepted',
      acceptedBy: 'David Sterling (CFO)',
      acceptedAt: '2026-08-10T11:00:00Z',
      reviewFrequencyMonths: 12,
      expiryDate: '2027-08-10',
      justification: 'Residual score 3 meets low threshold.',
      compensatingControls: 'Bank-level dual token confirmation for any transfer over $5,000.'
    }
  },
  {
    id: 'rsk_3',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-03',
    title: 'Major Cloud Outage Impacting AWS eu-west-1 Region',
    category: 'Asset',
    linkedItem: 'Core Open-Banking API Gateway (ast_1)',
    department: 'Operations & Business Continuity',
    threatDescription: 'Multi-datacenter power or fiber cut causing complete regional availability loss in Dublin.',
    vulnerabilityDescription: 'Primary synchronous replication was historically confined to single AWS availability zone.',
    likelihood: 2,
    impact: 5,
    inherentScore: 10,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Architected automated Route53 active-active failover between eu-west-1 (Ireland) and eu-west-2 (London) with Cross-Region Aurora read replicas.',
    treatmentOwner: 'Priya Sharma (DevOps Lead)',
    targetDate: '2026-09-15',
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    status: 'Treatment in Progress',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.5.29', 'A.5.30', 'A.8.14'],
      iso42001Controls: ['A.9.3'],
      masTrmSections: ['MAS TRM 12.1', 'MAS TRM 12.2', 'MAS Notice 644 (4h RTO)']
    },
    controlEffectiveness: 88,
    evidenceLinks: [
      {
        id: 'ev_rsk_3_1',
        name: 'Disaster Recovery Failover Test Report v2.4 (RTO: 42m, RPO: 4m)',
        controlCode: 'A.5.29',
        type: 'DR Simulation Drill Log',
        sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        uploadedDate: '2026-07-28',
        status: 'Verified'
      }
    ],
    executiveAcceptance: {
      required: false,
      status: 'Accepted',
      acceptedBy: 'SriKarthiK (CISO)',
      acceptedAt: '2026-08-05T14:00:00Z',
      reviewFrequencyMonths: 12,
      expiryDate: '2027-08-05',
      justification: 'Residual score 3 meets operational resilience criteria.'
    }
  },
  {
    id: 'rsk_4',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-04',
    title: 'Third-Party SaaS Vendor Security Breach',
    category: 'Vendor',
    linkedItem: 'Okta Identity Provider (vnd_3)',
    department: 'Procurement & Vendor Management',
    threatDescription: 'Breach at key identity provider resulting in workforce session hijacking.',
    vulnerabilityDescription: 'Single vendor reliance for all single-sign-on access federation.',
    likelihood: 2,
    impact: 4,
    inherentScore: 8,
    treatmentOption: 'Transfer',
    mitigationControl: 'Enforced device-bound Fast Identity Online (FIDO2) WebAuthn keys and emergency break-glass direct administrative accounts with hardware YubiKeys.',
    treatmentOwner: 'SriKarthiK (CISO)',
    targetDate: '2026-08-30',
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.5.19', 'A.5.20', 'A.5.21'],
      iso42001Controls: ['A.8.2'],
      masTrmSections: ['MAS TRM 5.3', 'MAS TRM 11.1']
    },
    controlEffectiveness: 91,
    evidenceLinks: [
      {
        id: 'ev_rsk_4_1',
        name: 'Okta SOC 2 Type II Certification & FIDO2 Policy Enactment',
        controlCode: 'A.5.19',
        type: 'Vendor Audit Certificate',
        sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        uploadedDate: '2026-06-30',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'rsk_5',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-05',
    title: 'Ransomware Infection via Endpoint Workstations',
    category: 'Information Security',
    linkedItem: 'Workforce Laptop Fleet (ast_4)',
    department: 'Information Technology (IT)',
    threatDescription: 'Drive-by download or zero-day malware executing on developer workstation with local admin privileges.',
    vulnerabilityDescription: 'Endpoint protection software missing on remote contractor laptops.',
    likelihood: 4,
    impact: 5,
    inherentScore: 20,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Mandatory CrowdStrike Falcon EDR deployment, removal of local admin rights, and automated endpoint isolate quarantine on telemetry alert.',
    treatmentOwner: 'SriKarthiK (CISO)',
    targetDate: '2026-09-01',
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: true,
    frameworkMappings: {
      iso27001Controls: ['A.8.7', 'A.8.1', 'A.8.8', 'A.8.16'],
      iso42001Controls: ['A.8.1'],
      masTrmSections: ['MAS TRM 9.2', 'MAS TRM 11.2', 'MAS Notice 644']
    },
    controlEffectiveness: 97,
    evidenceLinks: [
      {
        id: 'ev_rsk_5_1',
        name: 'CrowdStrike Falcon Sensor Coverage 100% Fleet Telemetry Report',
        controlCode: 'A.8.7',
        type: 'EDR Agent Audit Telemetry',
        sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        uploadedDate: '2026-08-25',
        status: 'Verified'
      }
    ],
    executiveAcceptance: {
      required: true,
      status: 'Accepted',
      acceptedBy: 'SriKarthiK (CISO)',
      acceptedAt: '2026-08-18T16:00:00Z',
      reviewFrequencyMonths: 6,
      expiryDate: '2027-02-18',
      justification: 'Inherent score of 20 successfully reduced to 3 via kernel-level EDR sensor deployment across 100% of workforce endpoints.',
      compensatingControls: 'Zero-day behavioral heuristics and automated USB storage block policy.',
      boardMeetingRef: 'Q3-2026-BOR-MIN-06'
    },
    telemetrySignals: [
      {
        source: 'CrowdStrike Falcon',
        alertTitle: 'EDR: Zero malicious behavioral executions detected in last 30 days (100% clean)',
        severity: 'Low',
        detectedAt: '2026-09-01T08:00:00Z',
        active: false,
        rawPayloadSnippet: '{"sensor_count": 284, "offline_sensors": 0, "quarantine_queue": 0, "status": "HEALTHY"}'
      }
    ]
  },
  {
    id: 'rsk_6',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-06',
    title: 'MAS TRM Notice 644 Regulatory Sanctions & Non-Compliance',
    category: 'Legal & Compliance',
    linkedItem: 'MAS TRM Singapore Regulatory Obligation',
    department: 'Information Security & Compliance',
    threatDescription: 'Failure to meet MAS 1-hour breach notification or 4-hour RTO resulting in regulatory reprimand and licensing suspension.',
    vulnerabilityDescription: 'Unautomated manual incident escalation workflows during weekend or off-hours.',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Pre-configured automated MAS Notice 644 dispatch bridge, real-time CCM telemetry streams, and tested 4-hour disaster recovery drills.',
    treatmentOwner: 'SriKarthiK (CISO)',
    targetDate: '2026-08-20',
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: true,
    frameworkMappings: {
      iso27001Controls: ['A.5.24', 'A.5.25', 'A.5.26', 'A.5.28', 'A.5.36'],
      iso42001Controls: ['A.9.1', 'A.9.2'],
      masTrmSections: ['MAS Notice 644', 'MAS TRM 4.1', 'MAS TRM 13.1']
    },
    controlEffectiveness: 98,
    evidenceLinks: [
      {
        id: 'ev_rsk_6_1',
        name: 'Automated MAS Incident Response Runbook & API Integration Hook',
        controlCode: 'A.5.24',
        type: 'Automated Regulatory Dispatch Script',
        sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        uploadedDate: '2026-08-14',
        status: 'Verified'
      }
    ],
    executiveAcceptance: {
      required: true,
      status: 'Accepted',
      acceptedBy: 'SriKarthiK (CISO)',
      acceptedAt: '2026-08-12T10:00:00Z',
      reviewFrequencyMonths: 12,
      expiryDate: '2027-08-12',
      justification: 'Residual score of 2 well below regulatory scrutiny limit.',
      compensatingControls: '24x7 SOC escalation integration via PagerDuty and automated regulator notification template.'
    }
  },
  {
    id: 'rsk_7',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-07',
    title: 'Cross-Border Personal Data Leakage & PDPA Infringement',
    category: 'Legal & Compliance',
    linkedItem: 'Customer KYC & PII Vault (ast_3)',
    department: 'Legal & Regulatory Affairs',
    threatDescription: 'Accidental database replication or analytics export sent to unapproved overseas jurisdiction.',
    vulnerabilityDescription: 'Lack of data classification tagging on ad-hoc analytical queries in production data warehouse.',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Implemented automated AWS Macie data classification, database field-level encryption with customer-managed KMS keys, and strict VPC service perimeters.',
    treatmentOwner: 'Rachel Zane (Head of People)',
    targetDate: '2026-09-30',
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    status: 'Treatment in Progress',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.5.33', 'A.8.11', 'A.8.12', 'A.8.24'],
      iso42001Controls: ['A.7.2', 'A.7.3'],
      masTrmSections: ['MAS TRM 10.1', 'MAS TRM 10.2']
    },
    controlEffectiveness: 89,
    evidenceLinks: [
      {
        id: 'ev_rsk_7_1',
        name: 'AWS Macie PII Sensitivity Scan & Data Loss Prevention Rule Configuration',
        controlCode: 'A.8.12',
        type: 'DLP Configuration Artifact',
        sha256Hash: '11a4a60b518bf24989d4818073fc25ced599e4f4513007412d433d9169345e28',
        uploadedDate: '2026-08-18',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'rsk_8',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-08',
    title: 'Unvetted Open Source Dependencies in Core Banking Engine',
    category: 'Asset',
    linkedItem: 'Core Open-Banking API Gateway (ast_1)',
    department: 'Software Engineering & DevOps',
    threatDescription: 'Supply-chain compromise of npm or Go packages containing cryptominers or backdoor telemetry.',
    vulnerabilityDescription: 'Direct deployment of unpinned packages in Docker build pipelines.',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Integrated Snyk and GitHub Dependabot into GitHub Actions PR gate blocking all CVSS 7+ critical packages, plus weekly SBOM generation.',
    treatmentOwner: 'Priya Sharma (DevOps Lead)',
    targetDate: '2026-07-15',
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.8.8', 'A.8.28', 'A.8.30'],
      iso42001Controls: ['A.8.3'],
      masTrmSections: ['MAS TRM 8.1', 'MAS TRM 8.3']
    },
    controlEffectiveness: 95,
    evidenceLinks: [
      {
        id: 'ev_rsk_8_1',
        name: 'GitHub Dependabot SBOM CycloneDX Report & CI/CD Gate Enforcement',
        controlCode: 'A.8.8',
        type: 'SBOM & Vulnerability Scan Log',
        sha256Hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        uploadedDate: '2026-08-22',
        status: 'Verified'
      }
    ],
    telemetrySignals: [
      {
        source: 'GitHub Dependabot',
        alertTitle: 'Dependabot: 0 critical vulnerabilities in production Docker container manifests',
        severity: 'Low',
        detectedAt: '2026-08-31T03:15:00Z',
        active: false,
        rawPayloadSnippet: '{"repo": "skanda-banking-core", "critical_cve": 0, "high_cve": 0, "status": "CLEAN"}'
      }
    ]
  },
  {
    id: 'rsk_9',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-09',
    title: 'Insider Threat & Unauthorized Customer Record Extraction',
    category: 'Department',
    linkedItem: 'Customer Support & Operations Portal',
    department: 'Human Resources & People Ops',
    threatDescription: 'Disgruntled employee downloading high-value wealth client financial transaction histories prior to resignation.',
    vulnerabilityDescription: 'Bulk CSV export capability available to all tier-1 support staff without manager approval.',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Restricted bulk export permissions, implemented DLP clipboard watermarking, and configured SIEM alerts for anomalies >50 customer record queries per hour.',
    treatmentOwner: 'Rachel Zane (Head of People)',
    targetDate: '2026-08-10',
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: true,
    frameworkMappings: {
      iso27001Controls: ['A.6.2', 'A.6.5', 'A.5.15', 'A.8.12'],
      iso42001Controls: ['A.5.3'],
      masTrmSections: ['MAS TRM 6.1', 'MAS TRM 10.1']
    },
    controlEffectiveness: 93,
    evidenceLinks: [
      {
        id: 'ev_rsk_9_1',
        name: 'Employee Offboarding & Privileged Role Revocation SLA Verification',
        controlCode: 'A.6.5',
        type: 'HR & IAM Audit Log',
        sha256Hash: 'fcde2b2edba56bf408686e333d3d89855a53df773e1649b69d45ca90a3e813bb',
        uploadedDate: '2026-08-08',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'rsk_10',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-10',
    title: 'AI Model Hallucination & Biased Financial Credit Decisions',
    category: 'Information Security',
    linkedItem: 'AI Algorithmic Credit Scoring Pipeline',
    department: 'Product Management & UX',
    threatDescription: 'AI Copilot providing inaccurate risk predictions or violating ISO 42001 AI fairness benchmarks.',
    vulnerabilityDescription: 'Training data skew and lack of deterministic human-in-the-loop validation for high-stake loan approvals.',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Established ISO 42001:2023 AIMS governance committee, implemented adversarial bias testing suite, and required mandatory human underwriter sign-off.',
    treatmentOwner: 'Alex Mercer (Head of Product)',
    targetDate: '2026-09-20',
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    status: 'Treatment in Progress',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.8.25', 'A.8.31', 'A.5.8'],
      iso42001Controls: ['A.5.1', 'A.6.1', 'A.7.1', 'A.8.1', 'A.9.1'],
      masTrmSections: ['MAS FEAT AI Principles', 'MAS TRM 8.1']
    },
    controlEffectiveness: 96,
    evidenceLinks: [
      {
        id: 'ev_rsk_10_1',
        name: 'ISO/IEC 42001:2023 AI System Impact Assessment & Bias Benchmark Audit',
        controlCode: 'A.5.1',
        type: 'AI Ethics & Model Verification Report',
        sha256Hash: '3b7b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b',
        uploadedDate: '2026-08-27',
        status: 'Verified'
      }
    ],
    executiveAcceptance: {
      required: true,
      status: 'Accepted',
      acceptedBy: 'SriKarthiK (CISO)',
      acceptedAt: '2026-08-29T15:00:00Z',
      reviewFrequencyMonths: 6,
      expiryDate: '2027-02-28',
      justification: 'Automated bias testing harness ensures algorithmic parity across all demographic tiers.',
      compensatingControls: 'Mandatory human underwriter approval for any credit rating score override.'
    }
  },
  {
    id: 'rsk_11',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-11',
    title: 'Subcontractor Facility Physical Infiltration',
    category: 'Vendor',
    linkedItem: 'Secondary Disaster Recovery Co-Location Facility',
    department: 'Operations & Business Continuity',
    threatDescription: 'Unauthorized physical access to backup server racks at third-party regional facility.',
    vulnerabilityDescription: 'Shared datacenter access badges without biometric verification on secondary server cages.',
    likelihood: 2,
    impact: 4,
    inherentScore: 8,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Installed dedicated biometric cage locks, 24/7 motion-activated CCTV with 90-day retention, and quarterly physical security audit reviews.',
    treatmentOwner: 'David Sterling (CFO)',
    targetDate: '2026-10-01',
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.7.1', 'A.7.2', 'A.7.4'],
      iso42001Controls: [],
      masTrmSections: ['MAS TRM 7.1', 'MAS TRM 7.2']
    },
    controlEffectiveness: 92
  },
  {
    id: 'rsk_12',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-12',
    title: 'Critical Zero-Day in Core API Gateway Framework',
    category: 'Information Security',
    linkedItem: 'Core Open-Banking API Gateway (ast_1)',
    department: 'Software Engineering & DevOps',
    threatDescription: 'Unauthenticated remote code execution vulnerability discovered in public API gateway reverse proxy.',
    vulnerabilityDescription: 'Exposure to public internet with unpatched reverse proxy edge services.',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    treatmentOption: 'Mitigate',
    mitigationControl: 'AWS WAF managed rule groups with rate limiting, automated container image rebuild on base OS patch release, and 24h P1 patch SLA.',
    treatmentOwner: 'Priya Sharma (DevOps Lead)',
    targetDate: '2026-08-05',
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: true,
    frameworkMappings: {
      iso27001Controls: ['A.8.8', 'A.8.20', 'A.8.26'],
      iso42001Controls: ['A.8.3'],
      masTrmSections: ['MAS TRM 8.1', 'MAS Notice 644']
    },
    controlEffectiveness: 96,
    executiveAcceptance: {
      required: true,
      status: 'Accepted',
      acceptedBy: 'SriKarthiK (CISO)',
      acceptedAt: '2026-08-10T12:00:00Z',
      reviewFrequencyMonths: 6,
      expiryDate: '2027-02-10',
      justification: 'WAF virtual patching blocks known CVE payloads before binary re-deploy.'
    }
  },
  {
    id: 'rsk_13',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-13',
    title: 'Inadequate Separation of Duties in Production Database Administration',
    category: 'Process',
    linkedItem: 'Production Aurora Postgres Cluster',
    department: 'Information Technology (IT)',
    threatDescription: 'Single engineer executing schema migrations and data deletions without peer review or changelog tracking.',
    vulnerabilityDescription: 'Direct SSH and pgAdmin write credentials distributed to multiple engineers.',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Enforced Teleport zero-trust database proxy with temporary ephemeral credentials, dual-approver Jira ticket requirement, and full session recording.',
    treatmentOwner: 'SriKarthiK (CISO)',
    targetDate: '2026-07-25',
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.5.3', 'A.5.15', 'A.8.2'],
      iso42001Controls: ['A.6.2'],
      masTrmSections: ['MAS TRM 5.1', 'MAS TRM 8.2']
    },
    controlEffectiveness: 95
  },
  {
    id: 'rsk_14',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-14',
    title: 'High Key Personnel Turnover in Information Security Team',
    category: 'Department',
    linkedItem: 'SecOps On-Call Roster',
    department: 'Human Resources & People Ops',
    threatDescription: 'Loss of critical institutional knowledge regarding SIEM tuning and cryptographic key ceremonies.',
    vulnerabilityDescription: 'Single point of failure with undocumented custom automation scripts.',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    treatmentOption: 'Avoid',
    mitigationControl: 'Codified all Runbooks into Version-Controlled Markdown in Skanda GRC, instituted cross-training pairs, and retention incentive packages.',
    treatmentOwner: 'Rachel Zane (Head of People)',
    targetDate: '2026-08-30',
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.5.1', 'A.6.6'],
      iso42001Controls: ['A.5.1'],
      masTrmSections: ['MAS TRM 4.1']
    },
    controlEffectiveness: 87
  },
  {
    id: 'rsk_15',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-15',
    title: 'Loss of Removable Backup Media in Transit',
    category: 'Asset',
    linkedItem: 'Encrypted Offline Tape Archives',
    department: 'Operations & Business Continuity',
    threatDescription: 'Physical courier accident or theft of encrypted offline backup tapes during transit to cold vault.',
    vulnerabilityDescription: 'Physical handling by external third-party logistics courier.',
    likelihood: 2,
    impact: 3,
    inherentScore: 6,
    treatmentOption: 'Mitigate',
    mitigationControl: 'All data encrypted with AES-256-GCM prior to tape write, tamper-evident locked transport cases with GPS cellular tracking.',
    treatmentOwner: 'David Sterling (CFO)',
    targetDate: '2026-09-10',
    residualLikelihood: 1,
    residualImpact: 1,
    residualScore: 1,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.7.10', 'A.8.24'],
      iso42001Controls: [],
      masTrmSections: ['MAS TRM 10.1']
    },
    controlEffectiveness: 98
  },
  {
    id: 'rsk_16',
    tenantId: 'tenant_apex',
    riskCode: 'RSK-2026-16',
    title: 'Delayed External Certificate Authority Revocation',
    category: 'Vendor',
    linkedItem: 'DigiCert TLS Wildcard Certificates',
    department: 'Software Engineering & DevOps',
    threatDescription: 'Public TLS certificate expiration causing browser warning blocks and client API failure.',
    vulnerabilityDescription: 'Manual calendar reminders for annual SSL/TLS certificate renewal.',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    treatmentOption: 'Mitigate',
    mitigationControl: 'Automated Let\'s Encrypt / AWS Certificate Manager (ACM) DNS auto-renewal with 30-day proactive Slack alert monitoring.',
    treatmentOwner: 'Priya Sharma (DevOps Lead)',
    targetDate: '2026-08-01',
    residualLikelihood: 1,
    residualImpact: 1,
    residualScore: 1,
    status: 'Residual Monitored',
    escalatedToSuperAdmin: false,
    frameworkMappings: {
      iso27001Controls: ['A.8.24', 'A.8.26'],
      iso42001Controls: [],
      masTrmSections: ['MAS TRM 9.1']
    },
    controlEffectiveness: 99
  }
];

export const INITIAL_EVIDENCE: EvidenceRecord[] = [
  {
    id: 'evd_1',
    tenantId: 'tenant_apex',
    title: 'Q2 2026 Okta User Access Recertification Sign-off',
    controlCode: 'A.5.15',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-07-02T14:30:00Z',
    fileName: 'Okta_Q2_Access_Review_Signed.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-07-03T09:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-07-05T11:00:00Z',
    reviewNotes: 'Sampled 25 user accounts across engineering and finance. Zero orphan accounts detected; revoked access verified against HR exit records.',
    expiryDate: '2026-10-02',
    tags: ['Access Review', 'Okta', 'Quarterly', 'Mandatory', 'DPDP-Sec8(5)', 'DPDP-Sec8(6)'],
    dpdpClauses: ['SEC_8_5', 'SEC_8_6'],
    autoTaggedByAI: true,
    aiTaggedAt: '2026-07-02T14:35:00Z',
    documentExcerpt: 'Quarterly Okta directory access recertification attestation confirming RBAC enforcement, MFA compliance, and zero orphan accounts.',
    dpdpScanResult: {
      overallConfidence: 'High',
      suggestedTags: ['DPDP-Sec8(5)', 'DPDP-Sec8(6)', 'Access-Control', 'MFA-Enforcement'],
      summary: 'Directly fulfills DPDP Section 8(5) and Section 8(6) reasonable security safeguards through strict identity and access control management.'
    },
    dpdpMappings: [
      {
        sectionCode: 'SEC_8_5',
        sectionTitle: 'Section 8(5) - Reasonable Security Safeguards',
        relevanceScore: 94,
        rationale: 'Access reviews enforce the principle of least privilege, preventing unauthorized personal data access and exfiltration.',
        mandatorySafeguards: ['Role-based access reviews', 'MFA on administrative directories', 'Zero orphan credential audit'],
        statutoryPenaltyNote: 'Non-compliance risks penalties up to ₹250 Crores for failure to take reasonable security safeguards under Schedule.'
      },
      {
        sectionCode: 'SEC_8_6',
        sectionTitle: 'Section 8(6) - Personal Data Breach Prevention & Notice',
        relevanceScore: 88,
        rationale: 'Periodic access reviews prevent credential abuse which is the primary vector for unauthorized data breach incidents.',
        mandatorySafeguards: ['Revocation of ex-employee tokens within 24 hours', 'Audit logging of privileged actions'],
        statutoryPenaltyNote: 'Breach failure penalties up to ₹200 Crores under DPDP Act Schedule.'
      }
    ]
  },
  {
    id: 'evd_2',
    tenantId: 'tenant_apex',
    title: 'AWS KMS Cryptographic Key Annual Auto-Rotation Report',
    controlCode: 'A.8.24',
    department: 'Software Engineering & DevOps',
    uploadedBy: 'Priya Sharma',
    uploadedDate: '2026-06-28T09:15:00Z',
    fileName: 'AWS_KMS_Rotation_Audit_2026.json',
    fileSize: '480 KB',
    fileType: 'application/json',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'Priya Sharma',
    submittedDate: '2026-06-29T10:00:00Z',
    reviewedBy: 'Marcus Brody (Internal Auditor)',
    reviewDate: '2026-07-01T15:20:00Z',
    reviewNotes: 'All 8 KMS Customer Managed Keys have auto-rotation enabled and verified active.',
    expiryDate: '2027-06-28',
    tags: ['Encryption', 'AWS KMS', 'TLS 1.3', 'DPDP-Sec8(5)', 'Data-Protection-by-Design'],
    dpdpClauses: ['SEC_8_5'],
    autoTaggedByAI: true,
    aiTaggedAt: '2026-06-28T09:20:00Z',
    documentExcerpt: 'AWS KMS annual cryptographic key rotation audit confirming AES-256 envelope encryption across all customer PII databases.',
    dpdpScanResult: {
      overallConfidence: 'High',
      suggestedTags: ['DPDP-Sec8(5)', 'Encryption', 'Key-Rotation'],
      summary: 'Satisfies DPDP Section 8(5) technical safeguards by enforcing cryptographic segregation and key rotation on stored digital personal data.'
    },
    dpdpMappings: [
      {
        sectionCode: 'SEC_8_5',
        sectionTitle: 'Section 8(5) - Reasonable Security Safeguards',
        relevanceScore: 96,
        rationale: 'Hardware security module (HSM) backed envelope encryption with automatic key rotation prevents unauthorized plaintext exposure of personal data.',
        mandatorySafeguards: ['KMS key rotation cadence ≤ 365 days', 'Separation of duties between key custodian and database administrator'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹250 Crores for failure to protect digital personal data.'
      }
    ]
  },
  {
    id: 'evd_3',
    tenantId: 'tenant_apex',
    title: 'Annual Third-Party Web App Penetration Test Attestation',
    controlCode: 'A.8.8',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK',
    uploadedDate: '2026-08-01T16:00:00Z',
    fileName: 'Apex_PenTest_Executive_Report_2026.pdf',
    fileSize: '5.1 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Pending Review',
    verificationState: 'Pending Review',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-02T09:30:00Z',
    reviewNotes: 'Awaiting formal auditor verification against CREST findings and CAPA plan verification.',
    expiryDate: '2027-08-01',
    tags: ['PenTest', 'CREST', 'Vulnerability', 'DPDP-Sec8(5)', 'DPDP-Sec8(6)'],
    dpdpClauses: ['SEC_8_5', 'SEC_8_6'],
    autoTaggedByAI: true,
    aiTaggedAt: '2026-08-01T16:05:00Z',
    documentExcerpt: 'CREST-certified external security assessment evaluating OWASP Top 10 API vulnerabilities and authentication bypass risks.',
    dpdpScanResult: {
      overallConfidence: 'High',
      suggestedTags: ['DPDP-Sec8(5)', 'DPDP-Sec8(6)', 'PenTest', 'Vulnerability-Management'],
      summary: 'Validates organizational resilience against security intrusions and verifies no critical exposure exists for consumer personal data.'
    },
    dpdpMappings: [
      {
        sectionCode: 'SEC_8_5',
        sectionTitle: 'Section 8(5) - Reasonable Security Safeguards',
        relevanceScore: 92,
        rationale: 'Annual independent penetration testing is a mandated technical verification safeguard to ensure proactive vulnerability mitigation.',
        mandatorySafeguards: ['Remediation of High/Critical CVEs within 30 days', 'Independent CREST or CERT-In empaneled auditor attestation'],
        statutoryPenaltyNote: 'Up to ₹250 Crores penalty under DPDP Act 2023 for failure to protect personal data.'
      },
      {
        sectionCode: 'SEC_8_6',
        sectionTitle: 'Section 8(6) - Personal Data Breach Prevention & Notice',
        relevanceScore: 85,
        rationale: 'Proactive vulnerability assessments uncover security weaknesses before malicious threat actors can exploit them to trigger data breaches.',
        mandatorySafeguards: ['API security boundary audits', 'Automated patch validation'],
        statutoryPenaltyNote: 'Up to ₹200 Crores penalty for failing to report or prevent data breach occurrences.'
      }
    ]
  },
  {
    id: 'evd_4',
    tenantId: 'tenant_apex',
    title: 'Employee Annual Information Security Training LMS Log',
    controlCode: 'A.6.3',
    department: 'Human Resources & People Ops',
    uploadedBy: 'Rachel Zane',
    uploadedDate: '2026-08-10T11:45:00Z',
    fileName: 'Security_Awareness_Roster_98.4pct.xlsx',
    fileSize: '1.2 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    version: '1.1',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'Rachel Zane',
    submittedDate: '2026-08-11T09:00:00Z',
    reviewedBy: 'Marcus Brody (Internal Auditor)',
    reviewDate: '2026-08-12T14:10:00Z',
    reviewNotes: '142 out of 145 staff completed training (98.4%). 3 remaining staff are on statutory maternity leave with notes on file.',
    expiryDate: '2027-08-10',
    tags: ['Training', 'HR', 'Awareness', 'DPDP-Sec8(5)', 'Privacy-Training'],
    dpdpClauses: ['SEC_8_5'],
    autoTaggedByAI: true,
    aiTaggedAt: '2026-08-10T11:50:00Z',
    documentExcerpt: 'Enterprise security & data privacy training completion roster indicating 98.4% workforce completion including DPDP obligations and phishing simulation.',
    dpdpScanResult: {
      overallConfidence: 'High',
      suggestedTags: ['DPDP-Sec8(5)', 'Workforce-Awareness', 'Privacy-By-Design'],
      summary: 'Demonstrates organizational measures under DPDP Section 8(5) by ensuring personnel handling personal data are trained on statutory safeguards.'
    },
    dpdpMappings: [
      {
        sectionCode: 'SEC_8_5',
        sectionTitle: 'Section 8(5) - Reasonable Security Safeguards',
        relevanceScore: 91,
        rationale: 'Workforce privacy training constitutes an essential organizational safeguard to prevent human error-induced data compromises.',
        mandatorySafeguards: ['Annual training curriculum covering DPDP principles', 'Audited sign-off roster with >95% completion rate'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹250 Crores for neglect of reasonable safeguards.'
      }
    ]
  },
  {
    id: 'evd_5',
    tenantId: 'tenant_apex',
    title: 'Q3 AWS RDS Automated Snapshot & Point-in-Time Recovery Drill',
    controlCode: 'A.8.14',
    department: 'Software Engineering & DevOps',
    uploadedBy: 'Priya Sharma (Staff DevOps)',
    uploadedDate: '2026-08-28T10:00:00Z',
    fileName: 'RDS_Restore_Drill_2026_Q3.log',
    fileSize: '840 KB',
    fileType: 'text/plain',
    version: '0.9',
    status: 'Draft',
    verificationState: 'Draft',
    tags: ['Backup', 'Disaster Recovery', 'RDS', 'Redundancy', 'DPDP-Sec8(5)', 'DPDP-Sec8(7)'],
    dpdpClauses: ['SEC_8_5', 'SEC_8_7'],
    autoTaggedByAI: true,
    aiTaggedAt: '2026-08-28T10:05:00Z',
    documentExcerpt: 'Point-in-time automated recovery execution log validating RTO < 4 hours and RPO < 1 hour with zero database corruption.',
    dpdpScanResult: {
      overallConfidence: 'High',
      suggestedTags: ['DPDP-Sec8(5)', 'DPDP-Sec8(7)', 'Backup-Drill', 'Resilience'],
      summary: 'Confirms continuous data availability safeguards under Section 8(5) alongside data retention and erasure integrity under Section 8(7).'
    },
    dpdpMappings: [
      {
        sectionCode: 'SEC_8_5',
        sectionTitle: 'Section 8(5) - Reasonable Security Safeguards',
        relevanceScore: 89,
        rationale: 'Continuous backups and disaster recovery drills protect personal data from irreversible destruction or availability failure.',
        mandatorySafeguards: ['Automated snapshot encryption', 'Quarterly restoration drill verification'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹250 Crores.'
      },
      {
        sectionCode: 'SEC_8_7',
        sectionTitle: 'Section 8(7) - Erasure of Personal Data Upon Purpose Completion',
        relevanceScore: 78,
        rationale: 'Backup lifecycle policies must ensure expired personal data is purged in accordance with retention and deletion policies.',
        mandatorySafeguards: ['Retention policy enforcement on automated snapshots', 'Cryptographic shredding of decommissioned volumes'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹50 Crores for improper data retention.'
      }
    ]
  },
  {
    id: 'evd_6',
    tenantId: 'tenant_apex',
    title: 'CrowdStrike Falcon Sensor Enterprise EDR Coverage Audit',
    controlCode: 'A.8.7',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-25T14:20:00Z',
    fileName: 'Falcon_Agent_Health_Report.csv',
    fileSize: '1.9 MB',
    fileType: 'text/csv',
    version: '1.0',
    status: 'Pending Review',
    verificationState: 'Pending Review',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-26T08:30:00Z',
    reviewNotes: 'Submitted for Stage 1 external audit verification. 100% production server coverage attested.',
    tags: ['Malware Protection', 'EDR', 'CrowdStrike', 'DPDP-Sec8(5)', 'DPDP-Sec8(6)'],
    dpdpClauses: ['SEC_8_5', 'SEC_8_6'],
    autoTaggedByAI: true,
    aiTaggedAt: '2026-08-25T14:25:00Z',
    documentExcerpt: 'Telemetry report verifying active Falcon EDR sensor coverage across 284 workstations and production servers with zero malware infections.',
    dpdpScanResult: {
      overallConfidence: 'High',
      suggestedTags: ['DPDP-Sec8(5)', 'DPDP-Sec8(6)', 'EDR', 'Endpoint-Security'],
      summary: 'Demonstrates active technical defenses to prevent ransomware and malware-driven digital personal data breaches.'
    },
    dpdpMappings: [
      {
        sectionCode: 'SEC_8_5',
        sectionTitle: 'Section 8(5) - Reasonable Security Safeguards',
        relevanceScore: 95,
        rationale: 'Endpoint detection and response (EDR) provides real-time behavioral monitoring preventing unauthorized data exfiltration.',
        mandatorySafeguards: ['100% workstation agent installation', 'Real-time telemetry and process isolation'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹250 Crores for failure to take reasonable security safeguards.'
      },
      {
        sectionCode: 'SEC_8_6',
        sectionTitle: 'Section 8(6) - Personal Data Breach Prevention & Notice',
        relevanceScore: 90,
        rationale: 'Real-time telemetry alerts enable rapid containment within the statutory window before a breach compromises personal data.',
        mandatorySafeguards: ['Automated isolation of compromised endpoints', 'SIEM telemetry correlation'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹200 Crores.'
      }
    ]
  },
  {
    id: 'evd_7',
    tenantId: 'tenant_apex',
    title: 'Critical Cloud Vendor SOC 2 Type II Assessment Memo',
    controlCode: 'A.5.19',
    department: 'Information Security & Compliance',
    uploadedBy: 'Elena Davies',
    uploadedDate: '2026-08-30T17:15:00Z',
    fileName: 'Vendor_SOC2_Evaluation_Datadog.pdf',
    fileSize: '3.4 MB',
    fileType: 'application/pdf',
    version: '0.1',
    status: 'Draft',
    verificationState: 'Draft',
    tags: ['Supplier Security', 'SOC 2', 'Vendor Risk', 'DPDP-Sec8(2)', 'DPDP-Sec8(5)'],
    dpdpClauses: ['SEC_8_2', 'SEC_8_5'],
    autoTaggedByAI: true,
    aiTaggedAt: '2026-08-30T17:20:00Z',
    documentExcerpt: 'Third-party vendor compliance review analyzing Datadog SOC 2 Type II attestation, data processing agreement (DPA), and data sovereignty clauses.',
    dpdpScanResult: {
      overallConfidence: 'High',
      suggestedTags: ['DPDP-Sec8(2)', 'DPDP-Sec8(5)', 'Data-Processor', 'Vendor-DPA'],
      summary: 'Ensures compliance with DPDP Section 8(2) requiring Data Fiduciary engagement of Data Processors only under valid contract with security safeguards.'
    },
    dpdpMappings: [
      {
        sectionCode: 'SEC_8_2',
        sectionTitle: 'Section 8(2) - Engagement of Data Processor under Valid Contract',
        relevanceScore: 97,
        rationale: 'Validates that cloud data processors operate under a legally binding contract with explicit confidentiality and security commitments.',
        mandatorySafeguards: ['Executed DPA with audit rights', 'Verification of third-party SOC 2 or ISO 27001 certifications'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹250 Crores for uncontracted or unsafe data processor engagement.'
      },
      {
        sectionCode: 'SEC_8_5',
        sectionTitle: 'Section 8(5) - Reasonable Security Safeguards',
        relevanceScore: 86,
        rationale: 'Third-party vendor risk assessment extends reasonable security safeguards to the external supply chain handling personal telemetry.',
        mandatorySafeguards: ['Annual vendor reassessment', 'Breach notification SLA < 24 hours'],
        statutoryPenaltyNote: 'Statutory penalty up to ₹250 Crores.'
      }
    ]
  },
  {
    id: 'evd_gov_1',
    tenantId: 'tenant_apex',
    title: 'Quarterly User Access Recertification & Privileged Account Review (Q3 2026)',
    controlCode: 'A.5.18',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-09-02T10:00:00Z',
    fileName: 'Apex_Q3_Access_Recertification_Report.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-09-02T11:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-09-05T14:30:00Z',
    reviewNotes: 'Quarterly access recertification across AWS IAM, GitHub Enterprise, and PostgreSQL production clusters verified. Deprovisioning confirmed within 24h of employee departures. Zero standing admin privileges.',
    expiryDate: '2026-12-02',
    tags: ['Access Review', 'Annex A.5.18', 'Quarterly', 'Mandatory Governance', 'Privileged Access'],
    documentExcerpt: 'Quarterly review of user accounts across cloud consoles, GitHub, and production databases confirming departed employees deprovisioned and privileged access justified.'
  },
  {
    id: 'evd_gov_2',
    tenantId: 'tenant_apex',
    title: 'Production Aurora PostgreSQL Backup Restoration Drill & Integrity Verification (Q3 2026)',
    controlCode: 'A.8.13',
    department: 'Software Engineering & DevOps',
    uploadedBy: 'Priya Sharma (DevOps Lead)',
    uploadedDate: '2026-08-25T14:30:00Z',
    fileName: 'Apex_DB_Backup_Restore_Drill_Q3_2026.pdf',
    fileSize: '1.8 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'Priya Sharma (DevOps Lead)',
    submittedDate: '2026-08-25T15:00:00Z',
    reviewedBy: 'Marcus Brody (Internal Auditor)',
    reviewDate: '2026-08-26T09:00:00Z',
    reviewNotes: 'Test restore of production database snapshot into isolated staging VPC completed successfully. Achieved RTO: 38 minutes (Target: <= 4h); RPO: 4 minutes 12 seconds (Target: <= 15m). Data integrity checksum 100% verified.',
    expiryDate: '2027-02-25',
    tags: ['Backup Restoration', 'Annex A.8.13', 'RTO', 'RPO', 'Disaster Recovery', 'Mandatory Governance'],
    documentExcerpt: 'Routine test restore of production database backup into staging environment recording RTO (Recovery Time Objective: 38m) and RPO (Recovery Point Objective: 4m12s) achieved.'
  },
  {
    id: 'evd_gov_3',
    tenantId: 'tenant_apex',
    title: 'Annual Information Security Awareness & Anti-Phishing Training Completion Attestation',
    controlCode: 'A.6.3',
    department: 'People Operations & HR',
    uploadedBy: 'Elena Davies (HR Director)',
    uploadedDate: '2026-08-15T09:00:00Z',
    fileName: 'Apex_Staff_ISMS_Awareness_Completion_2026.pdf',
    fileSize: '3.1 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'Elena Davies (HR Director)',
    submittedDate: '2026-08-15T10:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-08-18T16:00:00Z',
    reviewNotes: 'LMS completion log verifies that 100% (148/148) in-scope personnel completed annual ISO 27001 information security awareness training and Q3 simulated phishing drill.',
    expiryDate: '2027-08-15',
    tags: ['Training', 'Clause 7.2', 'Clause 7.3', 'Annex A.6.3', 'Awareness', 'Mandatory Governance'],
    documentExcerpt: 'LMS platform completion log verifying that 100% of staff have finished the annual security awareness curriculum and phishing simulations.'
  },
  {
    id: 'evd_gov_4',
    tenantId: 'tenant_apex',
    title: 'Tier-1 Critical SaaS & Cloud Vendor Information Security Risk Assessment Summary',
    controlCode: 'A.5.19',
    department: 'Procurement & Vendor Management',
    uploadedBy: 'James Sterling (Head of Procurement)',
    uploadedDate: '2026-08-20T11:30:00Z',
    fileName: 'Apex_Tier1_Vendor_Security_Due_Diligence_2026.pdf',
    fileSize: '4.2 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'James Sterling (Head of Procurement)',
    submittedDate: '2026-08-20T13:00:00Z',
    reviewedBy: 'SriKarthiK (CISO)',
    reviewDate: '2026-08-22T10:00:00Z',
    reviewNotes: 'Security evaluations completed for top 5 critical vendor services (AWS, Okta, Datadog, Stripe, GitHub). Validated clean SOC 2 Type II reports, ISO 27001 certificates, and executed DPAs.',
    expiryDate: '2027-08-20',
    tags: ['Vendor Risk', 'Annex A.5.19', 'Annex A.5.21', 'Third-Party Due Diligence', 'Mandatory Governance'],
    documentExcerpt: 'Security evaluations for top 5 critical SaaS and vendor services (identity provider, cloud host, code repository, payment processor) with SOC 2 Type II and ISO certificates.'
  },
  {
    id: 'evd_gov_5',
    tenantId: 'tenant_apex',
    title: 'Annual Business Continuity & Ransomware Outage Tabletop Simulation Report',
    controlCode: 'A.5.29',
    department: 'Operations & Business Continuity',
    uploadedBy: 'David Sterling (CFO & BCP Lead)',
    uploadedDate: '2026-08-28T16:00:00Z',
    fileName: 'Apex_BCP_Incident_Tabletop_Simulation_Report_2026.pdf',
    fileSize: '2.9 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'David Sterling (CFO & BCP Lead)',
    submittedDate: '2026-08-28T17:00:00Z',
    reviewedBy: 'SriKarthiK (CISO)',
    reviewDate: '2026-08-30T11:00:00Z',
    reviewNotes: '1-hour tabletop exercise simulating operational cloud outage and ransomware scenario conducted with executive leadership. Documented post-incident summary with recovery playbooks and lessons learned.',
    expiryDate: '2027-08-28',
    tags: ['BCP', 'Tabletop Drill', 'Annex A.5.29', 'Annex A.5.30', 'Incident Simulation', 'Mandatory Governance'],
    documentExcerpt: '1-hour tabletop exercise simulating operational outage (cloud region failure and ransomware scenario) with 1-page Post-Incident Summary detailing lessons learned.'
  },
  {
    id: 'evd_iso_41',
    tenantId: 'tenant_apex',
    title: 'Documented PESTLE/SWOT Context Analysis & Annual Strategy Minutes',
    controlCode: 'A.5.1',
    department: 'Executive Governance & Legal',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-15T10:00:00Z',
    fileName: 'ISMS_Clause_4_1_PESTLE_SWOT_2026.pdf',
    fileSize: '3.1 MB',
    fileType: 'application/pdf',
    version: '2.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-16T09:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-08-18T14:30:00Z',
    reviewNotes: 'Comprehensive PESTLE and SWOT internal/external context assessment approved by board.',
    expiryDate: '2027-08-15',
    tags: ['Clause 4.1', 'PESTLE', 'SWOT', 'Context Analysis', 'ISO27001:2022'],
    isoRequirements: ['A.5.1', 'Clause 4.1'],
    documentExcerpt: 'ISMS Context of the Organization evaluation covering political, economic, socio-technical, legal and cybersecurity risk landscape.'
  },
  {
    id: 'evd_iso_43',
    tenantId: 'tenant_apex',
    title: 'Official ISMS Scope Statement Document v2.0 & Boundary Diagrams',
    controlCode: 'A.5.1',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-12T11:20:00Z',
    fileName: 'Apex_ISMS_Scope_Statement_v2_Signed.pdf',
    fileSize: '4.2 MB',
    fileType: 'application/pdf',
    version: '2.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-12T12:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-08-14T10:15:00Z',
    reviewNotes: 'Verified clear boundary definitions including all AWS regions, GitHub repos, and zero unjustified exclusions.',
    expiryDate: '2027-08-12',
    tags: ['Clause 4.3', 'ISMS Scope', 'Scope Boundary', 'ISO27001:2022'],
    isoRequirements: ['A.5.1', 'Clause 4.3'],
    documentExcerpt: 'Official ISMS Scope Statement establishing organizational boundaries, physical facilities, cloud accounts, and SaaS integrations.'
  },
  {
    id: 'evd_iso_51',
    tenantId: 'tenant_apex',
    title: 'ISMS Steering Committee Charter & Information Security Budget Approval',
    controlCode: 'A.5.4',
    department: 'Executive Governance & Legal',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-07-20T15:00:00Z',
    fileName: 'Board_ISMS_Charter_and_Budget_Minutes.pdf',
    fileSize: '2.7 MB',
    fileType: 'application/pdf',
    version: '1.2',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-07-21T09:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-07-23T16:00:00Z',
    reviewNotes: 'Leadership commitment demonstrated through approved $1.8M cybersecurity budget and monthly CISO governance cadence.',
    expiryDate: '2027-07-20',
    tags: ['Clause 5.1', 'Leadership', 'Steering Committee', 'Budget', 'ISO27001:2022'],
    isoRequirements: ['A.5.4', 'Clause 5.1'],
    documentExcerpt: 'Board resolutions establishing CISO mandate, quarterly steering committee charter, and approved cybersecurity capital allocation.'
  },
  {
    id: 'evd_iso_52',
    tenantId: 'tenant_apex',
    title: 'Information Security Policy v2.1 Signed by Board & Workforce Acknowledgment',
    controlCode: 'A.5.1',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-07-15T09:00:00Z',
    fileName: 'Apex_Information_Security_Policy_v2.1_Signed.pdf',
    fileSize: '5.8 MB',
    fileType: 'application/pdf',
    version: '2.1',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-07-16T10:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-07-19T11:30:00Z',
    reviewNotes: 'Board signature verified; 98.4% workforce acknowledgment tracked in HR LMS.',
    expiryDate: '2027-07-15',
    tags: ['Clause 5.2', 'Security Policy', 'Board Signed', 'AUP', 'ISO27001:2022'],
    isoRequirements: ['A.5.1', 'Clause 5.2'],
    documentExcerpt: 'Master Information Security Policy establishing high-level security directives, management intent, and mandatory employee standards.'
  },
  {
    id: 'evd_iso_53',
    tenantId: 'tenant_apex',
    title: 'Organizational Security RACI Matrix & Segregation of Duties Matrix',
    controlCode: 'A.5.2',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-05T14:00:00Z',
    fileName: 'ISMS_RACI_and_SoD_Enforcement_Matrix.xlsx',
    fileSize: '1.4 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-06T10:00:00Z',
    reviewedBy: 'Marcus Brody (Internal Auditor)',
    reviewDate: '2026-08-08T15:00:00Z',
    reviewNotes: 'Roles assigned for CISO, Lead Auditor, DPO, and SecOps; branch protection prevents developers approving their own PRs.',
    expiryDate: '2027-08-05',
    tags: ['Clause 5.3', 'RACI', 'Segregation of Duties', 'Roles', 'ISO27001:2022'],
    isoRequirements: ['A.5.2', 'A.5.3', 'Clause 5.3'],
    documentExcerpt: 'Formal RACI governance matrix mapping organizational responsibilities, authority limits, and segregation of conflicting duties.'
  },
  {
    id: 'evd_iso_612',
    tenantId: 'tenant_apex',
    title: 'ISMS Risk Assessment Methodology Document & Asset-Threat Matrix',
    controlCode: 'A.5.7',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-18T16:00:00Z',
    fileName: 'Apex_Risk_Assessment_Methodology_v2.pdf',
    fileSize: '3.6 MB',
    fileType: 'application/pdf',
    version: '2.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-19T09:30:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-08-21T14:00:00Z',
    reviewNotes: '5x5 qualitative and quantitative risk scoring methodology aligned with ISO 31000 and ISO 27005 principles.',
    expiryDate: '2027-08-18',
    tags: ['Clause 6.1.2', 'Risk Assessment', 'Methodology', 'Risk Register', 'ISO27001:2022'],
    isoRequirements: ['A.5.7', 'Clause 6.1.2'],
    documentExcerpt: 'ISMS risk assessment methodology establishing likelihood and impact criteria, risk appetite thresholds, and threat-asset modeling.'
  },
  {
    id: 'evd_iso_613',
    tenantId: 'tenant_apex',
    title: 'Statement of Applicability (SoA) v2.4 Approved & Risk Treatment Plan (RTP)',
    controlCode: 'A.5.1',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-22T11:00:00Z',
    fileName: 'Apex_Statement_of_Applicability_v2.4_Approved.pdf',
    fileSize: '4.8 MB',
    fileType: 'application/pdf',
    version: '2.4',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-22T14:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-08-24T10:00:00Z',
    reviewNotes: 'Full SoA covering 93 Annex A controls. Justifications for inclusions and exclusions documented and validated.',
    expiryDate: '2027-08-22',
    tags: ['Clause 6.1.3', 'SoA', 'Statement of Applicability', 'Risk Treatment', 'ISO27001:2022'],
    isoRequirements: ['A.5.1', 'Clause 6.1.3'],
    documentExcerpt: 'Formal Statement of Applicability (SoA) version 2.4 detailing implementation status and justifications across all 93 Annex A controls.'
  },
  {
    id: 'evd_iso_92',
    tenantId: 'tenant_apex',
    title: 'Annual Internal Audit Plan & Formal Working Papers Report (H1 2026)',
    controlCode: 'A.5.35',
    department: 'Information Security & Compliance',
    uploadedBy: 'Marcus Brody (Internal Auditor)',
    uploadedDate: '2026-07-28T16:30:00Z',
    fileName: 'Apex_ISMS_Internal_Audit_Report_H1_2026.pdf',
    fileSize: '4.1 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'Marcus Brody (Internal Auditor)',
    submittedDate: '2026-07-29T10:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-08-01T15:00:00Z',
    reviewNotes: 'Internal audit executed with independent objectivity. 1 minor nonconformity identified and added to CAPA.',
    expiryDate: '2027-07-28',
    tags: ['Clause 9.2', 'Internal Audit', 'Audit Plan', 'Working Papers', 'ISO27001:2022'],
    isoRequirements: ['A.5.35', 'Clause 9.2'],
    documentExcerpt: 'Comprehensive H1 2026 internal audit report covering Clauses 4-10 and Annex A technological safeguards.'
  },
  {
    id: 'evd_iso_93',
    tenantId: 'tenant_apex',
    title: 'Signed Management Review Meeting (MRM) Minutes v2026 & Executive Tracker',
    controlCode: 'A.5.36',
    department: 'Executive Governance & Legal',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-10T15:00:00Z',
    fileName: 'Management_Review_Meeting_Minutes_Signed_2026.pdf',
    fileSize: '3.3 MB',
    fileType: 'application/pdf',
    version: '1.0',
    status: 'Verified',
    verificationState: 'Verified',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-11T09:00:00Z',
    reviewedBy: 'David Vance (Lead External Auditor)',
    reviewDate: '2026-08-13T11:00:00Z',
    reviewNotes: 'Full executive attendance including CEO, CFO, and CISO. Review covered internal audit results, risk posture, and resource allocation.',
    expiryDate: '2027-08-10',
    tags: ['Clause 9.3', 'Management Review', 'MRM', 'Minutes', 'ISO27001:2022'],
    isoRequirements: ['A.5.36', 'Clause 9.3'],
    documentExcerpt: 'Executive Management Review Meeting (MRM) documentation fulfilling ISO/IEC 27001 Clause 9.3 agenda requirements.'
  },
  {
    id: 'evd_iso_102',
    tenantId: 'tenant_apex',
    title: 'Master Corrective Action (CAPA) Register & 5-Whys Root Cause Worksheets',
    controlCode: 'A.5.24',
    department: 'Information Security & Compliance',
    uploadedBy: 'SriKarthiK (CISO)',
    uploadedDate: '2026-08-26T14:00:00Z',
    fileName: 'Apex_Master_CAPA_Register_2026.xlsx',
    fileSize: '1.6 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    version: '1.3',
    status: 'Pending Review',
    verificationState: 'Pending Review',
    submittedBy: 'SriKarthiK (CISO)',
    submittedDate: '2026-08-27T10:00:00Z',
    reviewNotes: 'CAPA tracking verified for internal audit finding FND-2026-01; awaiting final closure verification.',
    expiryDate: '2027-08-26',
    tags: ['Clause 10.2', 'CAPA', 'Corrective Action', 'Nonconformity', '5-Whys', 'ISO27001:2022'],
    isoRequirements: ['A.5.24', 'Clause 10.2'],
    documentExcerpt: 'Master CAPA log recording non-conformities, root cause analysis investigations, corrective actions, and verification timelines.'
  }
];

export const INITIAL_INTERNAL_AUDITS: InternalAuditPlan[] = [
  {
    id: 'ia_1',
    tenantId: 'tenant_apex',
    auditCode: 'IA-2026-01',
    title: 'H1 2026 ISMS Internal Audit - Engineering, Cloud Ops & Access Control',
    scope: 'Evaluation of ISO 27001 Clauses 5.15, 5.19, 8.1, 8.8, 8.24 and AWS production deployment controls.',
    department: 'Software Engineering & DevOps',
    leadAuditor: 'Marcus Brody (Senior Internal Auditor)',
    auditTeam: ['Marcus Brody', 'Elena Davies'],
    scheduledStartDate: '2026-06-10',
    scheduledEndDate: '2026-06-25',
    status: 'Fieldwork Completed',
    checklists: [
      {
        id: 'chk_1',
        controlCode: 'A.5.15',
        requirement: 'Verify MFA enforcement and quarterly access recertification for production infrastructure.',
        sampleDescription: 'Sampled 20 engineers and 5 contractors from Okta and AWS IAM directories.',
        evidenceReviewed: 'Okta directory export, AWS IAM Identity Center logs, Q2 access review minutes.',
        complianceStatus: 'Conforming',
        workingPaperNotes: 'All 25 sampled accounts have WebAuthn MFA active. No unauthorized admin privileges identified.'
      },
      {
        id: 'chk_2',
        controlCode: 'A.8.8',
        requirement: 'Verify vulnerability scanning cadence and patch deployment SLA adherence.',
        sampleDescription: 'Sampled 15 container image scans and 4 AWS RDS database instances.',
        evidenceReviewed: 'Snyk vulnerability dashboard and AWS Inspector reports.',
        complianceStatus: 'Minor Non-Conformity',
        workingPaperNotes: 'One non-critical staging container image had a Medium vulnerability (CVE-2026-3198) unpatched for 42 days (SLA target is 30 days). Raised finding FND-2026-01.'
      },
      {
        id: 'chk_3',
        controlCode: 'A.8.24',
        requirement: 'Verify cryptographic protection in transit and at rest.',
        sampleDescription: 'Inspected public API endpoints and S3 bucket encryption configurations.',
        evidenceReviewed: 'SSL Labs test results and AWS Config compliance rules.',
        complianceStatus: 'Conforming',
        workingPaperNotes: 'TLS 1.3 enforced on all public domains. All S3 buckets enforce aws:kms encryption with deny-unencrypted policy.'
      }
    ],
    executiveSummary: 'The internal audit concluded that the ISMS implementation exhibits high maturity and robust automated controls across cloud operations. One minor non-conformity was identified regarding patch SLA tracking in staging environments and has been converted into a CAPA item.'
  }
];

export const INITIAL_FINDINGS: FindingCAPARecord[] = [
  {
    id: 'fnd_1',
    tenantId: 'tenant_apex',
    findingCode: 'FND-2026-01',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Vulnerability Remediation in Staging Containers Exceeded 30-Day SLA',
    clauseOrControl: 'A.8.8 Management of technical vulnerabilities',
    department: 'Software Engineering & DevOps',
    description: 'During the internal audit sampling of container repositories, it was discovered that container image "apex-reporting-worker:v2.1" in staging contained Medium vulnerability CVE-2026-3198 which remained unpatched for 42 days, exceeding the 30-day internal remediation SLA.',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      fiveWhysChain: [
        { whyNumber: 1, question: 'Why did the container patch exceed the 30-day SLA window?', answer: 'The Jira engineering ticket was categorized as Low priority backlog instead of high-priority security remediation sprint.', category: 'Process' },
        { whyNumber: 2, question: 'Why was the ticket marked as backlog rather than sprint priority?', answer: 'The automated Snyk vulnerability notification was routed to a legacy, unmonitored Slack channel (#temp-devops-alerts).', category: 'Technology' },
        { whyNumber: 3, question: 'Why was that Slack channel unmonitored?', answer: 'Channel ownership changed during the Q1 DevOps reorganization, and notification webhooks were never repointed to the new triage channel.', category: 'People' },
        { whyNumber: 4, question: 'Why was there no webhook update or verification during the re-org?', answer: 'There was no centralized alert inventory or formal change procedure for security tooling webhooks.', category: 'Governance' },
        { whyNumber: 5, question: 'Why was there no centralized alert webhook governance?', answer: 'Tooling integrations were managed ad-hoc by individual engineers without central architectural oversight or automated health-checks.', category: 'Governance' }
      ],
      whys: [
        'Why did the patch exceed SLA? -> The engineering ticket was marked as backlog rather than sprint priority.',
        'Why was it marked backlog? -> The automated Snyk alert was routed to an unmonitored Slack channel.',
        'Why was the Slack channel unmonitored? -> Channel ownership changed during recent team restructuring without alert webhook update.',
        'Why was there no webhook update? -> Lack of centralized alert routing configuration documentation.',
        'Root Cause: Alert routing was unmonitored following departmental reorganization.'
      ],
      rootCauseStatement: 'Automated vulnerability notifications for staging repositories were sent to a decommissioned Slack channel following team re-alignment due to lack of central webhook governance.',
      contributingFactors: ['Missing webhook heartbeat monitoring', 'Ad-hoc tooling configuration', 'Departmental restructuring handoff omission']
    },
    capaPlan: {
      correctiveAction: 'Immediately rebuild "apex-reporting-worker" with patched base image and deploy to staging (Completed).',
      preventiveAction: 'Implement automated PagerDuty/Jira ticket creation for any CVE approaching day 20 of the SLA window, and audit all Slack webhook destinations.',
      owner: 'Priya Sharma (DevOps Lead)',
      targetDate: '2026-07-20',
      evidenceRequired: 'Snyk automated Jira integration screenshot and zero overdue tickets report.',
      implementationStatus: 'Implemented',
      completedDate: '2026-07-18',
      attachedEvidenceArtifacts: [
        {
          id: 'art-fnd-01',
          title: 'Snyk-Jira Automated Escalation Webhook Verification Export.pdf',
          fileRef: 'artifacts/2026/capa/SNYK-JIRA-ESCALATION-PROOF.pdf',
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          fileSize: '1.4 MB',
          uploadedAt: '2026-07-18T14:30:00Z',
          uploadedBy: 'Priya Sharma (DevOps Lead)'
        }
      ]
    },
    implementationNotes: 'Snyk Jira integration configured and tested on 2026-07-18. All alerts now generate prioritized Jira tasks automatically.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-06-25T16:00:00Z',
    verifiedBy: 'Marcus Brody (Lead Internal Auditor)',
    verifiedDate: '2026-07-22T10:00:00Z',
    isExternalLocked: false,
    independentAuditValidation: {
      validationId: 'VAL-2026-07-001',
      auditProgramRef: 'IA-2026-Q3-RETEST-01',
      auditorName: 'Marcus Brody',
      auditorEmail: 'm.brody@skanda-audit.internal',
      auditorRole: 'Lead Internal Auditor (ISO 27001 / CISA)',
      validationDate: '2026-07-22T10:00:00Z',
      testOfOperatingEffectiveness: 'PASSED',
      samplingMethodology: '100% Population re-scan of all 38 active staging container images plus synthetic vulnerability injection test on webhook routing.',
      sampleSizeInspected: 38,
      inspectedArtifactReferences: ['SNYK-JIRA-ESCALATION-PROOF.pdf', 'CONTAINER-STAGE-SBOM-REPORT-20260721.json'],
      auditorObservations: 'Independently tested automated alert webhook by injecting a mock CVE alert into staging pipeline. Alert successfully created a P1 Jira ticket in DevOps sprint queue within 45 seconds. Zero outstanding CVEs >30 days in staging image registry.',
      effectivenessConclusion: 'Corrective and Preventive Action validated effective. Root cause (alert routing failure) permanently mitigated through automated Jira bi-directional webhook and central webhook heartbeat monitor.',
      independenceStatementConfirmed: true,
      digitalSignatureHash: '8f4e2c91a0b3d5e7f912c34a6b8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d',
      validatedAt: '2026-07-22T10:00:00Z'
    }
  },
  {
    id: 'fnd_2',
    tenantId: 'tenant_apex',
    findingCode: 'EXT-2026-01',
    source: 'EXTERNAL_AUDIT',
    severity: 'Opportunity for Improvement',
    title: 'Formalize Supplier Due-Diligence Tiering Matrix in Procurement Handbook',
    clauseOrControl: 'A.5.19 Information security in supplier relationships',
    department: 'Procurement & Vendor Management',
    description: 'External auditor observed that while all Tier 1 vendors maintain comprehensive security certifications and signed DPAs, the initial classification criteria between Tier 2 and Tier 3 vendors is primarily documented in internal spreadsheets rather than published in the formal Procurement Standard Operating Procedure.',
    rootCauseAnalysis: {
      methodology: 'DIRECT',
      rootCauseStatement: 'Procurement team was using working spreadsheets during hypergrowth without updating the central policy appendix.'
    },
    capaPlan: {
      correctiveAction: 'Update Supplier Security Policy Appendix B with explicit numerical scoring criteria for vendor tiering.',
      preventiveAction: 'Conduct refresher training for procurement team on annual vendor classification review.',
      owner: 'James Sterling (Head of Procurement)',
      targetDate: '2026-09-01',
      evidenceRequired: 'Approved Supplier Security Policy v1.2 with tiering rubric.'
    },
    implementationNotes: 'Policy updated and submitted to CISO for sign-off.',
    status: 'CAPA Submitted',
    raisedBy: 'David Vance (Lead External Auditor)',
    raisedDate: '2026-08-10T14:00:00Z',
    isExternalLocked: true // Raised by external auditor: client cannot delete or edit core finding
  },
  {
    id: 'fnd_gap_1',
    tenantId: 'tenant_apex',
    findingCode: 'GAP-2026-01',
    source: 'INTERNAL_AUDIT',
    severity: 'Major Non-Conformity',
    title: 'Quarterly Privileged Access Review Sign-Off Pending for Production DB & Cloud Infrastructure',
    clauseOrControl: 'A.5.15 Access control',
    department: 'IT & Infrastructure',
    description: 'Quarterly access recertification sign-offs for production database administrators and root AWS IAM accounts have not been completed for Q2/Q3, posing elevated privilege creep risk.',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      whys: [
        'Why was sign-off delayed? -> Manager review queue relied on manual email notifications.',
        'Why email? -> Access review module was not connected to Jira/Slack webhooks.',
        'Why no webhook? -> API integration was postponed during Q2 cloud migration.',
        'Why postponed? -> Competing sprint commitments for customer-facing features.',
        'Root Cause: Absence of automated just-in-time (JIT) access revocation and zero-standing privilege enforcement.'
      ],
      rootCauseStatement: 'Manual email-based access reviews without automated workflow enforcement led to missed quarterly recertification cycles.'
    },
    capaPlan: {
      correctiveAction: 'Execute emergency privileged access recertification across all AWS and Postgres production accounts; revoke 14 stale administrative credentials.',
      preventiveAction: 'Deploy Zero Standing Privilege (ZSP) with Just-In-Time (JIT) IAM approval webhooks and automated 90-day revocation triggers.',
      owner: 'Arun Krishnan (Principal Cloud Infrastructure Architect)',
      targetDate: '2026-09-15',
      evidenceRequired: 'Cryptographically signed quarterly access recertification report and Okta/AWS IAM Zero-Standing audit export.'
    },
    implementationNotes: 'Emergency review completed on 2026-09-02; JIT IAM workflow deployment scheduled for production rollout.',
    status: 'CAPA Submitted',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-08-28T09:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_gap_2',
    tenantId: 'tenant_apex',
    findingCode: 'GAP-2026-02',
    source: 'INTERNAL_AUDIT',
    severity: 'Major Non-Conformity',
    title: 'Multi-Region Disaster Recovery Tabletop Simulation & Failover Records Missing',
    clauseOrControl: 'A.5.23 Information security for cloud services',
    department: 'Software Engineering & DevOps',
    description: 'Annual multi-region failover drill has not been formally conducted within the 12-month audit window to validate cross-region Aurora and ECS recovery time objective (RTO <= 4h).',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      whys: [
        'Why was failover drill skipped? -> Production freeze during high-volume customer migration.',
        'Why was freeze blocking? -> Team lacked a fully isolated synthetic secondary staging environment.',
        'Why no synthetic staging? -> Cross-region database replication costs were not pre-allocated in Q1 budget.',
        'Why not pre-allocated? -> BCP budget was lumped with general cloud OPEX.',
        'Root Cause: Lack of dedicated disaster recovery simulation calendar and dedicated automated failover testing harness.'
      ],
      rootCauseStatement: 'Disaster recovery simulation drills were deferred due to absence of automated non-disruptive failover testing tooling.'
    },
    capaPlan: {
      correctiveAction: 'Schedule and execute a scheduled cross-region DR tabletop simulation drill with simulated AWS ap-southeast-1 to ap-southeast-2 failover.',
      preventiveAction: 'Establish automated monthly chaos engineering and database sync integrity verification; publish RTO/RPO delta dashboard.',
      owner: 'Priya Sharma (DevOps Lead)',
      targetDate: '2026-09-22',
      evidenceRequired: 'Signed DR Tabletop Simulation Minutes, CloudWatch failover latency logs, and RTO metric proof (< 4 hours).'
    },
    implementationNotes: 'Failover runbook v3.2 drafted. Simulation drill date locked with Executive Committee for Sept 18.',
    status: 'CAPA Submitted',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-08-28T10:30:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_gap_3',
    tenantId: 'tenant_apex',
    findingCode: 'GAP-2026-03',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Critical CVE Patch SLA Enforcement Policy (CVSS >= 9.0 within 72 Hours)',
    clauseOrControl: 'A.8.8 Management of technical vulnerabilities',
    department: 'Cyber Security & SecOps',
    description: 'Vulnerability Management policy currently sets a generic 14-day SLA across all severities without a dedicated 72-hour emergency escalation path for Critical CVSS >= 9.0 exploits.',
    rootCauseAnalysis: {
      methodology: 'DIRECT',
      rootCauseStatement: 'Legacy SLA matrix grouped high and critical vulnerabilities into a single tier without automated PagerDuty emergency dispatch.'
    },
    capaPlan: {
      correctiveAction: 'Update Vulnerability Management SOP v2.4 with a strict 72-hour remediation SLA for CVSS >= 9.0 and 14 days for CVSS 7.0–8.9.',
      preventiveAction: 'Configure automated container vulnerability webhook in GitHub Actions to block builds containing unpatched CVEs >= 9.0 after 72 hours.',
      owner: 'Marcus Brody (SecOps & Vulnerability Lead)',
      targetDate: '2026-09-18',
      evidenceRequired: 'Approved Vulnerability SOP v2.4, GitHub Actions branch protection rule screenshot, and zero-overdue SLA report.'
    },
    implementationNotes: 'Policy amendment drafted; CI/CD scanner webhook staging tests underway.',
    status: 'Open',
    raisedBy: 'David Vance (Lead External Auditor)',
    raisedDate: '2026-08-30T11:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_gap_4',
    tenantId: 'tenant_apex',
    findingCode: 'GAP-2026-04',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Staging Environment Contains Masked Production Data without Synthetic Generation',
    clauseOrControl: 'A.8.12 Data leakage prevention',
    department: 'Data Engineering & Analytics',
    description: 'Sampling of lower staging database revealed partial obfuscation of customer transaction records rather than 100% synthetically generated test datasets, risking inadvertent PII leakage.',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      whys: [
        'Why was masked data used? -> Developers needed realistic schemas and statistical distributions for performance testing.',
        'Why not synthetic? -> Data generation tool was not integrated into CI/CD database seeding pipelines.',
        'Why no integration? -> Legacy scripts relied on sanitized dumps.',
        'Why legacy dumps? -> Lack of formal Data Masking and Synthetic Test Data Standard.',
        'Root Cause: Absence of automated synthetic dataset generation pipeline for non-production environments.'
      ],
      rootCauseStatement: 'Developers utilized sanitized production extracts due to lack of a high-fidelity automated synthetic data generator.'
    },
    capaPlan: {
      correctiveAction: 'Purge all sanitized production extracts from staging databases; run cryptographic zero-hash verification scan.',
      preventiveAction: 'Implement automated Faker/Synthetic test data seeding pipeline integrated into developer onboarding and CI test suites.',
      owner: 'Elena Rostova (Data Governance Lead)',
      targetDate: '2026-09-28',
      evidenceRequired: 'Cryptographic staging clean-room verification log and Synthetic Data Generator CI/CD configuration files.'
    },
    implementationNotes: 'Synthetic data generation script completed and validated against schema v4.1.',
    status: 'Open',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-08-31T14:15:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_apr1',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-04-01',
    source: 'INTERNAL_AUDIT',
    severity: 'Major Non-Conformity',
    title: 'Unencrypted Backup Snapshots Identified in Secondary Cloud Bucket',
    clauseOrControl: 'A.8.24 Use of cryptography',
    department: 'IT & Infrastructure',
    description: 'Internal audit sample discovered unencrypted database backup archives in cross-region S3 disaster recovery bucket lacking AWS KMS customer-managed encryption keys.',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      rootCauseStatement: 'Terraform bucket replica module was missing server-side encryption configuration block during initial multi-region rollout.'
    },
    capaPlan: {
      correctiveAction: 'Applied AWS KMS AES-256 customer-managed key encryption to secondary S3 bucket and re-encrypted all historical snapshots.',
      preventiveAction: 'Implemented Terraform Sentinel policy blocking creation of unencrypted storage buckets in CI/CD pipeline.',
      owner: 'Arun Krishnan (Principal Cloud Architect)',
      targetDate: '2026-05-02',
      evidenceRequired: 'KMS encryption verification report and Sentinel pipeline guardrail screenshot.'
    },
    implementationNotes: 'Remediation completed on 2026-05-01. Sentinel guardrail enforced.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-04-08T10:00:00Z',
    verifiedBy: 'Marcus Brody (Lead Auditor)',
    verifiedDate: '2026-05-04T15:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_apr2',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-04-02',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Offboarding Access Revocation Exceeded 24-Hour SLA for Contractor',
    clauseOrControl: 'A.6.5 Responsibilities after termination',
    department: 'Human Resources & People Ops',
    description: 'Access revocation for contract developer took 74 hours post-contract expiry instead of mandatory 24-hour SLA due to manual ticket handover.',
    rootCauseAnalysis: {
      methodology: 'DIRECT',
      rootCauseStatement: 'Contractor management system was not integrated with automated identity lifecycle deprovisioning.'
    },
    capaPlan: {
      correctiveAction: 'Immediately revoked all stale sessions and audited contractor activity logs.',
      preventiveAction: 'Integrated BambooHR contractor end-date webhook with Okta SCIM automated deprovisioning queue.',
      owner: 'Sarah Jenkins (VP People)',
      targetDate: '2026-05-15',
      evidenceRequired: 'Okta SCIM automated deprovisioning log export.'
    },
    implementationNotes: 'Okta SCIM automated workflow validated with zero overdue deprovisionings.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-04-20T09:30:00Z',
    verifiedBy: 'Marcus Brody (Lead Auditor)',
    verifiedDate: '2026-05-18T11:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_may1',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-05-01',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Annual Physical Perimeter Access Badge Audit Lacked Biometric Re-authentication',
    clauseOrControl: 'A.7.2 Physical entry controls',
    department: 'Physical Facilities & Security',
    description: 'Secondary server room door proximity sensor permitted badge-only ingress without mandatory dual-factor PIN code verification after hours.',
    rootCauseAnalysis: {
      methodology: 'DIRECT',
      rootCauseStatement: 'Access control panel firmware update reset door controller configuration to single-factor mode.'
    },
    capaPlan: {
      correctiveAction: 'Re-programmed door controller to enforce badge + PIN for high-security comms room.',
      preventiveAction: 'Configured automated daily controller integrity health checks alerting facilities team on config drift.',
      owner: 'David Kowalski (Facilities Director)',
      targetDate: '2026-05-25',
      evidenceRequired: 'Door controller configuration export and physical audit ingress logs.'
    },
    implementationNotes: 'Physical controller reconfigured and tested with auditor in attendance.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-05-06T14:00:00Z',
    verifiedBy: 'Marcus Brody (Lead Auditor)',
    verifiedDate: '2026-05-27T16:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_may2',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-05-02',
    source: 'INTERNAL_AUDIT',
    severity: 'Major Non-Conformity',
    title: 'Production Database API Key Committed into Private Git Repository',
    clauseOrControl: 'A.8.28 Secure coding',
    department: 'Software Engineering & DevOps',
    description: 'During source code sampling, a test file in the billing service repository was found to contain hardcoded staging database credentials.',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      rootCauseStatement: 'Developer bypassed local pre-commit hook during an urgent hotfix release.'
    },
    capaPlan: {
      correctiveAction: 'Rotated all staging database credentials and purged git history using git-filter-repo.',
      preventiveAction: 'Implemented mandatory GitHub secret scanning with branch push rejection for API keys and tokens.',
      owner: 'Priya Sharma (DevOps Lead)',
      targetDate: '2026-06-05',
      evidenceRequired: 'GitHub push protection configuration and credential rotation audit log.'
    },
    implementationNotes: 'Credentials rotated; push protection active across 100% of repositories.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-05-18T11:15:00Z',
    verifiedBy: 'Marcus Brody (Lead Auditor)',
    verifiedDate: '2026-06-08T10:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_jun1',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-06-01',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Supplier SOC 2 Type II Attestation Missing for SMS Gateway Provider',
    clauseOrControl: 'A.5.20 Addressing information security within supplier agreements',
    department: 'Procurement & Vendor Management',
    description: 'Annual vendor review for critical 2FA SMS provider was missing current year SOC 2 Type II attestation report.',
    rootCauseAnalysis: {
      methodology: 'DIRECT',
      rootCauseStatement: 'Vendor account manager changed and automated annual compliance questionnaire reminder bounced.'
    },
    capaPlan: {
      correctiveAction: 'Obtained current SOC 2 Type II clean report from vendor portal and reviewed bridge letter.',
      preventiveAction: 'Added vendor compliance attestation tracking into automated Vendor Due Diligence dashboard.',
      owner: 'James Sterling (Head of Procurement)',
      targetDate: '2026-06-25',
      evidenceRequired: 'Signed vendor SOC 2 Type II report and updated vendor profile.'
    },
    implementationNotes: 'SOC 2 report obtained with unmodified clean opinion.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-06-08T09:00:00Z',
    verifiedBy: 'Marcus Brody (Lead Auditor)',
    verifiedDate: '2026-06-26T14:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_jul1',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-07-01',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Multi-Factor Authentication Bypass Allowed on Internal Engineering Wiki',
    clauseOrControl: 'A.8.5 Secure authentication',
    department: 'IT & Infrastructure',
    description: 'Internal documentation portal allowed password-only fallback authentication for users on the office Wi-Fi subnet.',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      rootCauseStatement: 'Legacy IP whitelisting rule was grandfathered in during SAML 2.0 migration without security exception review.'
    },
    capaPlan: {
      correctiveAction: 'Disabled IP whitelist exemption; enforced strict FIDO2/WebAuthn MFA for all wiki sessions.',
      preventiveAction: 'Conducted comprehensive audit of all SSO conditional access policies to eliminate IP-based MFA bypasses.',
      owner: 'Arun Krishnan (Principal Cloud Architect)',
      targetDate: '2026-07-18',
      evidenceRequired: 'Okta Conditional Access policy export showing 100% MFA enforcement.'
    },
    implementationNotes: 'MFA enforced universally; verified with zero exceptions.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-07-05T13:00:00Z',
    verifiedBy: 'Marcus Brody (Lead Auditor)',
    verifiedDate: '2026-07-19T10:30:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_jul2',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-07-02',
    source: 'INTERNAL_AUDIT',
    severity: 'Major Non-Conformity',
    title: 'Audit Log Streaming Pipeline Buffer Dropped 3 Hours of Database Queries',
    clauseOrControl: 'A.8.15 Logging',
    department: 'Cyber Security & SecOps',
    description: 'Audit log streaming daemon experienced memory exhaustion during high transaction load, causing temporary backpressure and lost event telemetry.',
    rootCauseAnalysis: {
      methodology: '5_WHYS',
      rootCauseStatement: 'FluentBit container memory limit was set to 128MB without disk-backed buffer spillover.'
    },
    capaPlan: {
      correctiveAction: 'Increased memory allocation to 1GB and configured disk-backed queue storage buffer for log forwarders.',
      preventiveAction: 'Established CloudWatch alarm alerting on any log ingestion lag exceeding 60 seconds.',
      owner: 'Marcus Brody (SecOps Lead)',
      targetDate: '2026-07-28',
      evidenceRequired: 'FluentBit buffer config and CloudWatch 99.99% log ingestion proof.'
    },
    implementationNotes: 'Buffer increased and validated against simulated 10,000 eps burst.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-07-16T15:45:00Z',
    verifiedBy: 'Elena Rostova (CISO)',
    verifiedDate: '2026-07-29T11:00:00Z',
    isExternalLocked: false
  },
  {
    id: 'fnd_hist_aug1',
    tenantId: 'tenant_apex',
    findingCode: 'NC-2026-08-01',
    source: 'INTERNAL_AUDIT',
    severity: 'Minor Non-Conformity',
    title: 'Incident Response Playbook Lacked Mandated Regulatory Contact Details',
    clauseOrControl: 'A.5.24 Incident management planning',
    department: 'Cyber Security & SecOps',
    description: 'The cyber incident escalation matrix listed outdated phone numbers for national cyber emergency response team (CERT).',
    rootCauseAnalysis: {
      methodology: 'DIRECT',
      rootCauseStatement: 'Contact details had not been refreshed during the semi-annual incident tabletop exercise.'
    },
    capaPlan: {
      correctiveAction: 'Updated Incident Response SOP Annexure C with verified 24/7 hotline numbers for CERT and data protection regulator.',
      preventiveAction: 'Established calendar cadence to test regulatory contact numbers quarterly.',
      owner: 'Elena Rostova (CISO)',
      targetDate: '2026-08-15',
      evidenceRequired: 'Approved IR Playbook v3.1 with verified external contact registry.'
    },
    implementationNotes: 'Contacts verified and updated in automated pager escalation roster.',
    status: 'Closed Verified',
    raisedBy: 'Marcus Brody (Internal Auditor)',
    raisedDate: '2026-08-04T10:00:00Z',
    verifiedBy: 'Marcus Brody (Lead Auditor)',
    verifiedDate: '2026-08-16T14:00:00Z',
    isExternalLocked: false
  }
];

export const INITIAL_AUDIT_TRAIL: AuditTrailEvent[] = [
  {
    id: 'log_1',
    tenantId: 'tenant_apex',
    timestamp: '2026-06-01T08:00:00Z',
    actorName: 'SriKarthiK',
    actorEmail: 'srikarthik@apexfintech.io',
    actorRole: 'COMPANY_ADMIN',
    action: 'CREATE',
    module: 'Company Registration',
    description: 'Initial company registration survey submitted for the registered organization.',
    ipAddress: '185.192.68.14',
    sha256Hash: '9a3b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b'
  },
  {
    id: 'log_2',
    tenantId: 'tenant_apex',
    timestamp: '2026-06-15T09:30:00Z',
    actorName: 'SriKarthiK',
    actorEmail: 'srikarthik@apexfintech.io',
    actorRole: 'COMPANY_ADMIN',
    action: 'LOCK_BASELINE',
    module: 'Statement of Applicability',
    description: 'Statement of Applicability baseline locked with 93 applicable controls.',
    ipAddress: '185.192.68.14',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'log_3',
    tenantId: 'tenant_apex',
    timestamp: '2026-06-15T10:14:22Z',
    actorName: 'SriKarthiK',
    actorEmail: 'srikarthik@apexfintech.io',
    actorRole: 'COMPANY_ADMIN',
    action: 'SIGN_MOU',
    module: 'Digital Memorandum of Understanding',
    description: 'Digital MoU executed with cryptographic SHA-256 hash. Full generated document suite released to dashboard.',
    ipAddress: '185.192.68.14',
    sha256Hash: '8f49b6b7a9829e160e948c26b5d92039c4a86f9104b2a8d9f1c7e63b40d58a12'
  },
  {
    id: 'log_4',
    tenantId: 'tenant_apex',
    timestamp: '2026-07-05T11:00:00Z',
    actorName: 'David Vance',
    actorEmail: 'david.vance@grc-auditpractice.com',
    actorRole: 'PLATFORM_AUDITOR',
    action: 'APPROVE',
    module: 'Evidence Centre',
    description: 'Verified and approved evidence item: Q2 2026 Okta User Access Recertification (A.5.15).',
    ipAddress: '82.45.190.22',
    sha256Hash: '4d8a1c9e7b2f6a5b3c0d8e1f9a7b5c3d2e4f6a8b0c1d3e5f7a9b2c4d6e8f0a1b'
  }
];

export const INITIAL_SUPERADMIN_RECOMMENDATIONS: SuperAdminRecommendation[] = [
  {
    id: 'rec_1',
    tenantId: 'tenant_apex',
    title: 'Adopt ISO/IEC 42001:2023 AI Governance Controls for LLM Data Layer',
    category: 'Regulatory',
    priority: 'High',
    description: 'Given the organization is integrating generative AI transaction summaries, we recommend adopting ISO 42001 AI risk management controls to mitigate algorithmic bias and sensitive data training ingestion risks.',
    recommendedActions: [
      'Publish an AI Ethical Use & Transparency Policy.',
      'Incorporate AI model hallucination and prompt injection into the Risk Register.',
      'Establish human-in-the-loop review for automated credit scoring models.'
    ],
    issuedBy: 'Elena Rostova (Super Admin)',
    issuedDate: '2026-07-10T10:00:00Z',
    status: 'Open'
  },
  {
    id: 'rec_2',
    tenantId: 'tenant_cyber',
    title: 'Complete Phase 4 MoU Execution to Unlock Audit Schedule',
    category: 'Control',
    priority: 'High',
    description: 'Statement of Applicability has been locked. Please execute the digital Memorandum of Understanding to release your mandatory documentation pack and confirm the October certification audit window.',
    recommendedActions: [
      'Review digital MoU terms with your legal authorized signatory.',
      'Execute cryptographic digital signature in the portal.'
    ],
    issuedBy: 'Elena Rostova (Super Admin)',
    issuedDate: '2026-08-22T14:00:00Z',
    status: 'Open'
  }
];

export const INITIAL_TASKS: TaskRecord[] = [
  {
    id: 'tsk_1',
    tenantId: 'tenant_apex',
    title: 'Upload Q3 CrowdStrike EDR Agent Coverage Export',
    category: 'Evidence Collection',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Priya Sharma',
    department: 'Software Engineering & DevOps',
    dueDate: '2026-09-05',
    linkedControl: 'A.8.7'
  },
  {
    id: 'tsk_2',
    tenantId: 'tenant_apex',
    title: 'Finalize Supplier Security Policy Appendix B with Vendor Tiering Rubric',
    category: 'CAPA',
    priority: 'Medium',
    status: 'To Do',
    assignedTo: 'James Sterling',
    department: 'Procurement & Vendor Management',
    dueDate: '2026-09-01',
    linkedControl: 'A.5.19'
  },
  {
    id: 'tsk_3',
    tenantId: 'tenant_apex',
    title: 'Complete Stage 1 Audit Document Walkthrough Prep',
    category: 'Audit Prep',
    priority: 'High',
    status: 'To Do',
    assignedTo: 'SriKarthiK',
    department: 'Information Security & Compliance',
    dueDate: '2026-09-08',
    linkedControl: 'A.5.1'
  },
  {
    id: 'tsk_4',
    tenantId: 'tenant_apex',
    title: 'Simulate Annual AWS Disaster Recovery Cross-Region Failover Drill',
    category: 'Remediation',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Priya Sharma',
    department: 'Operations & Business Continuity',
    dueDate: '2026-09-12',
    linkedControl: 'A.5.29'
  }
];

export const INITIAL_DOCUMENT_ACKNOWLEDGMENTS: DocumentAcknowledgment[] = [
  {
    id: 'ack_1',
    tenantId: 'tenant_apex',
    documentId: 'doc_1',
    documentCode: 'POL-SEC-01',
    documentTitle: 'Information Security Policy (ISO/IEC 27001:2022 ISMS)',
    documentVersion: '1.0',
    userId: 'usr_srikarthik',
    userName: 'SriKarthiK',
    userEmail: 'srikarthik@apexfintech.io',
    userRole: 'COMPANY_ADMIN',
    department: 'Information Security & Compliance',
    timestamp: '2026-06-16T11:20:00Z',
    ipAddress: '185.192.68.14',
    signatureText: 'SriKarthiK / CISO',
    declarationAccepted: true,
    verificationHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    notes: 'Approved and distributed to all staff during Q2 ISMS rollout.'
  },
  {
    id: 'ack_2',
    tenantId: 'tenant_apex',
    documentId: 'doc_1',
    documentCode: 'POL-SEC-01',
    documentTitle: 'Information Security Policy (ISO/IEC 27001:2022 ISMS)',
    documentVersion: '1.0',
    userId: 'usr_priya',
    userName: 'Priya Sharma',
    userEmail: 'priya.sharma@apexfintech.io',
    userRole: 'DEPARTMENT_CONTRIBUTOR',
    department: 'Software Engineering & DevOps',
    timestamp: '2026-06-17T09:45:12Z',
    ipAddress: '185.192.68.22',
    signatureText: 'Priya Sharma / DevOps Lead',
    declarationAccepted: true,
    verificationHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    notes: 'Reviewed and confirmed engineering teams compliance with repository branching and secrets scanning.'
  },
  {
    id: 'ack_3',
    tenantId: 'tenant_apex',
    documentId: 'doc_2',
    documentCode: 'POL-ACC-02',
    documentTitle: 'Access Control and Identity Management Policy',
    documentVersion: '1.0',
    userId: 'usr_srikarthik',
    userName: 'SriKarthiK',
    userEmail: 'srikarthik@apexfintech.io',
    userRole: 'COMPANY_ADMIN',
    department: 'Information Security & Compliance',
    timestamp: '2026-06-18T14:10:05Z',
    ipAddress: '185.192.68.14',
    signatureText: 'SriKarthiK / CISO',
    declarationAccepted: true,
    verificationHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    notes: 'Access control standards aligned with Okta WebAuthn rollout.'
  },
  {
    id: 'ack_4',
    tenantId: 'tenant_apex',
    documentId: 'doc_3',
    documentCode: 'PRO-INC-01',
    documentTitle: 'Information Security Incident Management Standard Operating Procedure',
    documentVersion: '1.0',
    userId: 'usr_priya',
    userName: 'Priya Sharma',
    userEmail: 'priya.sharma@apexfintech.io',
    userRole: 'DEPARTMENT_CONTRIBUTOR',
    department: 'Software Engineering & DevOps',
    timestamp: '2026-06-20T16:30:28Z',
    ipAddress: '185.192.68.22',
    signatureText: 'Priya Sharma / Incident Commander',
    declarationAccepted: true,
    verificationHash: '8f434346648f6b96df89dda901c5176b10e6d0ceec3e4a1cac3d8eab6c5fe35f',
    notes: 'PagerDuty escalation tree verified.'
  }
];

export const INITIAL_RISK_SCENARIOS: RiskTreatmentScenario[] = [
  {
    id: 'scen_1',
    tenantId: 'tenant_apex',
    riskId: 'rsk_1',
    riskCode: 'RSK-001',
    riskTitle: 'Production AWS Cloud Infrastructure Misconfiguration',
    scenarioName: 'Scenario A: Automated Drift Detection & Mandatory Guardrails',
    treatmentOption: 'Mitigate',
    proposedControls: ['A.8.9 Configuration management', 'A.8.19 Information security in use of cloud services', 'A.8.28 Secure coding'],
    customControlDescription: 'Deploy AWS Config rules with automated auto-remediation Lambda triggers and mandatory Terraform IAM boundary policies.',
    targetOwner: 'Priya Sharma (DevOps Lead)',
    targetDate: '2026-10-15',
    inherentLikelihood: 4,
    inherentImpact: 4,
    inherentScore: 16,
    projectedLikelihood: 1,
    projectedImpact: 2,
    projectedResidualScore: 2,
    scoreDelta: 14,
    riskReductionPercentage: 87.5,
    estimatedCostEffort: 'Medium',
    justificationNotes: 'Automated remediation eliminates human error in S3 bucket policy and security group alterations within 60 seconds.',
    simulatedAt: '2026-08-20T10:30:00Z',
    simulatedBy: 'SriKarthiK (CISO)'
  },
  {
    id: 'scen_2',
    tenantId: 'tenant_apex',
    riskId: 'rsk_2',
    riskCode: 'RSK-002',
    riskTitle: 'Third-Party Payment Gateway (Stripe) API Outage or Breach',
    scenarioName: 'Scenario B: Multi-Region Fallback + SLA Indemnity Cyber Insurance',
    treatmentOption: 'Transfer',
    proposedControls: ['A.5.19 Information security in supplier relationships', 'A.5.22 Monitoring, review and change management of supplier services'],
    customControlDescription: 'Establish secondary standby payment routing pipeline (Adyen backup) and purchase $10M cyber liability transfer coverage.',
    targetOwner: 'James Sterling (Head of Procurement)',
    targetDate: '2026-11-01',
    inherentLikelihood: 3,
    inherentImpact: 5,
    inherentScore: 15,
    projectedLikelihood: 1,
    projectedImpact: 3,
    projectedResidualScore: 3,
    scoreDelta: 12,
    riskReductionPercentage: 80.0,
    estimatedCostEffort: 'High',
    justificationNotes: 'Insurance transfer covers direct business interruption while standby gateway prevents customer checkout failures.',
    simulatedAt: '2026-08-22T14:15:00Z',
    simulatedBy: 'SriKarthiK (CISO)'
  }
];

export const INITIAL_MANAGEMENT_REVIEWS: ManagementReviewRecord[] = [
  {
    id: 'mrm_2026_q2',
    tenantId: 'tenant_apex',
    meetingTitle: 'Annual ISMS Management Review (Clause 9.3) - FY2026 H1',
    meetingDate: '2026-06-25',
    chairPerson: 'Marcus Vance (CEO)',
    status: 'Signed Off',
    attendees: [
      { name: 'Marcus Vance', role: 'Chief Executive Officer', department: 'Executive Leadership', attended: true },
      { name: 'SriKarthiK', role: 'Chief Information Security Officer (CISO)', department: 'Information Security & Compliance', attended: true },
      { name: 'Priya Sharma', role: 'DevOps & Infrastructure Lead', department: 'Software Engineering & DevOps', attended: true },
      { name: 'James Sterling', role: 'Head of Procurement & Vendor Management', department: 'Procurement & Finance', attended: true },
      { name: 'Elena Rostova', role: 'Lead Internal Auditor', department: 'Internal Audit & Risk', attended: true }
    ],
    agendaItems: [
      {
        id: 'ag_1',
        clauseRef: '9.3.2 a',
        title: 'Status of actions from previous management reviews',
        description: 'Review implementation status of decisions from the 2025 Q4 MRM.',
        findingsAndNotes: 'All 4 previous action items completed: AWS multi-region failover tested, MFA enforced for 100% of staff, vendor DPA updated.',
        status: 'Satisfactory'
      },
      {
        id: 'ag_2',
        clauseRef: '9.3.2 b',
        title: 'Changes in external and internal issues relevant to the ISMS',
        description: 'New regulatory landscape, EU AI Act, new cloud vendor acquisitions.',
        findingsAndNotes: 'Context of the organization updated in Clause 4.1 register. No major scope alterations required.',
        status: 'Reviewed'
      },
      {
        id: 'ag_3',
        clauseRef: '9.3.2 c',
        title: 'Needs and expectations of interested parties (Clause 4.2)',
        description: 'Enterprise fintech client demands SOC 2 Type II bridge letter and ISO 27001 certificate.',
        findingsAndNotes: 'Client security questionnaires increased by 40%. Direct need for Stage 2 certification completion by Q4.',
        status: 'Action Required'
      },
      {
        id: 'ag_4',
        clauseRef: '9.3.2 d',
        title: 'Feedback on ISMS performance & audit findings',
        description: 'Internal audit results, nonconformities, CAPA status, monitoring KPIs.',
        findingsAndNotes: 'Internal audit identified 2 minor nonconformities (access review lag & vendor SOC2 expiry). Both CAPAs actively managed and on track for closure.',
        status: 'Reviewed'
      },
      {
        id: 'ag_5',
        clauseRef: '9.3.2 e',
        title: 'Results of risk assessment and status of risk treatment plan',
        description: 'Clause 6.1.2 / 6.1.3 review of 5x5 matrix and Treatment Simulator scenarios.',
        findingsAndNotes: 'Residual risks reduced across all critical assets. Automated configuration drift detection implemented, reducing inherent risk RSK-001 by 87.5%.',
        status: 'Satisfactory'
      },
      {
        id: 'ag_6',
        clauseRef: '9.3.2 f',
        title: 'Opportunities for continual improvement & resource allocation',
        description: 'Clause 10.2 continual improvement initiatives and security tooling budget.',
        findingsAndNotes: 'Approved $45k budget for automated SAST/DAST pipeline integration and external ISO 27001 certification audit engagement.',
        status: 'Satisfactory'
      }
    ],
    decisionsAndImprovements: '1. Approved updated Statement of Applicability (SoA v2.0) with all 93 Annex A controls verified.\n2. Allocated $45,000 security engineering budget for FY2026 H2.\n3. Confirmed Stage 1 & Stage 2 external audit window for Q3 2026.',
    resourceNeedsAllocated: '1 Dedicated DevSecOps Engineer headcount approved; Snyk developer licenses authorized.',
    actionItems: [
      {
        id: 'act_1',
        action: 'Complete closure evidence for CAPA-2026-001 (vendor SOC 2 renewals)',
        owner: 'James Sterling',
        dueDate: '2026-09-15',
        priority: 'High',
        status: 'In Progress'
      },
      {
        id: 'act_2',
        action: 'Conduct simulated Stage 1 documentation pre-audit with external practice',
        owner: 'SriKarthiK',
        dueDate: '2026-09-30',
        priority: 'High',
        status: 'Open'
      }
    ],
    conclusions: 'The Information Security Management System (ISMS) is deemed suitable, adequate, and effective in meeting business objectives and ISO/IEC 27001:2022 requirements. Top management confirms readiness for external certification.',
    signoffTimestamp: '2026-06-25T16:45:00Z',
    signoffSignatory: 'Marcus Vance (CEO) & SriKarthiK (CISO)',
    signoffHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
];

