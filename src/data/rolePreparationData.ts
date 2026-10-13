import { StakeholderRole } from '../types/meetingScheduler';

export interface DocumentationItem {
  id: string;
  name: string;
  category: 'Policy & Standard Drafts' | 'Asset & System Inventories' | 'Operational Records & Logs' | 'Risk & Architecture Artifacts';
  description: string;
  mandatoryFor: string[]; // ISO clauses or frameworks (e.g., 'ISO 27001 Clause 5.2', 'Annex A.8.1')
  suggestedFileFormat: 'PDF Signed' | 'CSV / Spreadsheet' | 'Live System Walkthrough' | 'JSON / Config Export' | 'Architecture Diagram (Draw.io/PNG)';
  priority: 'Critical / Blocker' | 'High' | 'Medium';
  isMandatory?: boolean;
  defaultMissingInSkanda?: boolean;
  skandaDetectionReason?: string;
  retentionRequirement?: string;
}

export interface RolePreparationProfile {
  role: StakeholderRole;
  title: string;
  roleBadgeColor: string;
  executiveSummary: string;
  isoClausesCovered: string[];
  requiredDocumentation: DocumentationItem[];
  preInterviewChecklist: Array<{ id: string; text: string; clause: string }>;
  auditorInterrogationFocus: string[];
  commonNonConformities: string[];
  recommendedPreparationTimeHours: number;
}

export const ROLE_PREPARATION_PROFILES: Record<StakeholderRole, RolePreparationProfile> = {
  DEPARTMENT_HEAD: {
    role: 'DEPARTMENT_HEAD',
    title: 'Department Head / Business Unit Leader',
    roleBadgeColor: 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300',
    executiveSummary: 'Department Heads establish operational tone at the top, enforce departmental information security standards, and verify that staff adhere to approved SOPs and asset allocation rules.',
    isoClausesCovered: ['Clause 5.1 (Leadership)', 'Clause 5.3 (Roles & Authorities)', 'Clause 7.1 (Resources)', 'Clause 7.2 (Competence)', 'Annex A.5.1 (Policies)'],
    requiredDocumentation: [
      {
        id: 'dh_doc_1',
        name: 'Departmental Standard Operating Procedures (SOPs) & Process Maps',
        category: 'Policy & Standard Drafts',
        description: 'Approved operational workflows depicting daily activities, boundary handoffs, and data ingestion points.',
        mandatoryFor: ['ISO 27001 Clause 4.4', 'ISO 9001 Clause 4.4'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: false
      },
      {
        id: 'dh_doc_2',
        name: 'Departmental Hardware & Software Asset Register',
        category: 'Asset & System Inventories',
        description: 'Complete inventory of laptops, mobile devices, specialized hardware, and SaaS subscriptions utilized by team members.',
        mandatoryFor: ['ISO 27001 Annex A.5.9', 'Annex A.5.10'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'No departmental asset inventory registered for current ISO audit cycle; last verified entry in compliance vault is over 180 days stale.'
      },
      {
        id: 'dh_doc_3',
        name: 'Departmental Security Training & Competency Records',
        category: 'Operational Records & Logs',
        description: 'Proof of 100% completion of annual security awareness training, phishing simulation results, and role-specific training records.',
        mandatoryFor: ['ISO 27001 Clause 7.2', 'Clause 7.3'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Departmental security training completion rate is at 84%, falling short of mandatory 100% threshold for ISO 27001 Clause 7.2.'
      },
      {
        id: 'dh_doc_4',
        name: 'Departmental Organizational Hierarchy & Delegated Authority Matrix',
        category: 'Risk & Architecture Artifacts',
        description: 'Formal organizational chart showing reporting lines, approval thresholds for purchases/data access, and designated deputies.',
        mandatoryFor: ['ISO 27001 Clause 5.3'],
        suggestedFileFormat: 'Architecture Diagram (Draw.io/PNG)',
        priority: 'High'
      },
      {
        id: 'dh_doc_5',
        name: 'Third-Party Vendor Contracts & SLA Commitment Schedule',
        category: 'Asset & System Inventories',
        description: 'List of external vendors and contractor agreements directly commissioned by the business unit.',
        mandatoryFor: ['ISO 27001 Annex A.5.19', 'Annex A.5.20'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Medium'
      }
    ],
    preInterviewChecklist: [
      { id: 'dh_c1', text: 'Validate that all departmental staff have completed mandatory annual ISMS training', clause: 'Clause 7.2' },
      { id: 'dh_c2', text: 'Confirm all active SaaS applications used by the team are registered in the central IT asset inventory', clause: 'Annex A.5.9' },
      { id: 'dh_c3', text: 'Review current organizational chart and ensure job descriptions specify security responsibilities', clause: 'Clause 5.3' },
      { id: 'dh_c4', text: 'Ensure physical clean desk policy is enforced within the departmental workspace', clause: 'Annex A.7.7' }
    ],
    auditorInterrogationFocus: [
      'How do you ensure information security objectives are communicated down to your team members?',
      'What is your formal process when an employee in your department resigns or is reassigned?',
      'How are newly adopted SaaS tools reviewed for security approval before departmental usage?'
    ],
    commonNonConformities: [
      'Departmental staff using unsanctioned "Shadow IT" SaaS tools without central security registration.',
      'Outdated SOP documents missing version control stamps or management authorization signatures.',
      'Incomplete training records for contractors or recently onboarded employees.'
    ],
    recommendedPreparationTimeHours: 2.5
  },

  PROCESS_OWNER: {
    role: 'PROCESS_OWNER',
    title: 'Critical Process Owner (BIA / BCMS)',
    roleBadgeColor: 'border-sky-500/40 bg-sky-500/20 text-sky-300',
    executiveSummary: 'Process Owners define and measure end-to-end critical business workflows, establish recovery time objectives (RTO/RPO), and conduct operational impact assessments for unexpected outages.',
    isoClausesCovered: ['Clause 8.1 (Operational Planning)', 'Clause 8.2 (Risk Assessment)', 'ISO 22301 Clause 8.2 (BIA)', 'Annex A.5.29 (Information Security in Disruption)'],
    requiredDocumentation: [
      {
        id: 'po_doc_1',
        name: 'Business Impact Analysis (BIA) Worksheet with RTO & RPO Metrics',
        category: 'Risk & Architecture Artifacts',
        description: 'Quantified assessment of Maximum Tolerable Period of Disruption (MTPD), Recovery Time Objective (RTO), and Recovery Point Objective (RPO).',
        mandatoryFor: ['ISO 22301 Clause 8.2.2', 'ISO 27001 Annex A.5.29'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'BIA worksheet unapproved for current fiscal cycle; missing signed RTO/RPO metrics for critical customer-facing services.'
      },
      {
        id: 'po_doc_2',
        name: 'Business Continuity Plan (BCP) & Disaster Recovery Runbooks',
        category: 'Policy & Standard Drafts',
        description: 'Step-by-step contingency procedure detailing manual fallbacks, call trees, and alternative operating sites in the event of an outage.',
        mandatoryFor: ['ISO 22301 Clause 8.4', 'ISO 27001 Annex A.5.30'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: false
      },
      {
        id: 'po_doc_3',
        name: 'End-to-End Process Workflow Diagram & Data Transformation Map',
        category: 'Asset & System Inventories',
        description: 'Detailed diagram illustrating system dependencies, database inputs, third-party API hooks, and customer deliverables.',
        mandatoryFor: ['ISO 27001 Clause 4.3', 'Clause 8.1'],
        suggestedFileFormat: 'Architecture Diagram (Draw.io/PNG)',
        priority: 'High'
      },
      {
        id: 'po_doc_4',
        name: 'BCP Simulation & Tabletop Exercise Drill Report',
        category: 'Operational Records & Logs',
        description: 'Documented results of the most recent disaster simulation, including measured recovery duration vs. targeted RTO.',
        mandatoryFor: ['ISO 22301 Clause 8.5', 'ISO 27001 Annex A.5.30'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'No formal tabletop simulation or disaster recovery drill retrospective logged in compliance vault within past 12 months.'
      }
    ],
    preInterviewChecklist: [
      { id: 'po_c1', text: 'Verify that RTO and RPO metrics for all critical systems were approved within the last 12 months', clause: 'ISO 22301 Clause 8.2' },
      { id: 'po_c2', text: 'Confirm the emergency contact call tree has up-to-date phone numbers and backup deputies', clause: 'Annex A.5.30' },
      { id: 'po_c3', text: 'Document any unresolved corrective actions identified during the previous BCP drill', clause: 'Clause 10.1' }
    ],
    auditorInterrogationFocus: [
      'If your primary cloud region becomes unreachable right now, how long does manual failover take?',
      'Who has the authority to formally declare a disaster and activate the Business Continuity Plan?',
      'How are upstream supplier outages accounted for in your recovery commitments?'
    ],
    commonNonConformities: [
      'BIA metrics have not been re-evaluated following major software or infrastructure architectural changes.',
      'Unrealistic RTO targets (e.g., "< 5 minutes") without automated multi-region active-active replication.',
      'Absence of formal post-drill retrospective records with remediation tracking.'
    ],
    recommendedPreparationTimeHours: 3.0
  },

  SYSTEM_ADMIN: {
    role: 'SYSTEM_ADMIN',
    title: 'System Administrator / Infrastructure Lead',
    roleBadgeColor: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
    executiveSummary: 'System Administrators manage the operational hygiene of servers, cloud perimeters, privileged credentials, operating system baselines, and backup verification.',
    isoClausesCovered: ['Annex A.5.15 (Access Control)', 'Annex A.5.17 (Authentication)', 'Annex A.8.2 (Privileged Access)', 'Annex A.8.8 (Vulnerabilities)', 'Annex A.8.13 (Backups)', 'Annex A.8.15 (Logging)'],
    requiredDocumentation: [
      {
        id: 'sa_doc_1',
        name: 'Cloud & On-Prem Infrastructure Asset Register',
        category: 'Asset & System Inventories',
        description: 'Comprehensive export of compute instances, server clusters, VPCs, network gateways, subnets, and operating system versions.',
        mandatoryFor: ['ISO 27001 Annex A.5.9', 'Annex A.8.1'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker'
      },
      {
        id: 'sa_doc_2',
        name: 'Privileged Access Management (PAM) & Root Account Inventory',
        category: 'Asset & System Inventories',
        description: 'List of all accounts with administrative, root, or elevated privileges across AWS/Azure/GCP and active directory domains.',
        mandatoryFor: ['ISO 27001 Annex A.8.2', 'Annex A.5.15'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker'
      },
      {
        id: 'sa_doc_3',
        name: 'Quarterly User Access Review (UAR) Sign-off Logs',
        category: 'Operational Records & Logs',
        description: 'Formal evidence showing managers reviewed and re-certified user access permissions, including prompt removal of departed users.',
        mandatoryFor: ['ISO 27001 Annex A.5.18', 'Annex A.5.16'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Q3 User Access Review overdue by 14 days; 3 departed contractor accounts remain active in IdP without de-provisioning ticket.'
      },
      {
        id: 'sa_doc_4',
        name: 'Backup Restoration Test Evidence & Immutable Snapshot Policy',
        category: 'Operational Records & Logs',
        description: 'Execution logs of scheduled test restores showing data integrity was successfully verified within RTO limits.',
        mandatoryFor: ['ISO 27001 Annex A.8.13', 'Annex A.8.14'],
        suggestedFileFormat: 'Live System Walkthrough',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'No verifiable backup restoration trial report logged on AWS S3 Glacier target within required 90-day cycle.'
      },
      {
        id: 'sa_doc_5',
        name: 'Vulnerability Scanning Reports & OS Patching Status Matrix',
        category: 'Operational Records & Logs',
        description: 'Monthly Tenable/Qualys/AWS Inspector scan reports with proof that critical CVEs were remediated within SLA (e.g. 14 days).',
        mandatoryFor: ['ISO 27001 Annex A.8.8'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High'
      },
      {
        id: 'sa_doc_6',
        name: 'Operating System Hardening Baselines (CIS Benchmark Standards)',
        category: 'Policy & Standard Drafts',
        description: 'Formal configuration guidelines applied to Golden AMIs, container base images, and Linux/Windows server templates.',
        mandatoryFor: ['ISO 27001 Annex A.8.9'],
        suggestedFileFormat: 'JSON / Config Export',
        priority: 'High'
      }
    ],
    preInterviewChecklist: [
      { id: 'sa_c1', text: 'Confirm 100% of administrative accounts have hardware token or App MFA enforced without exceptions', clause: 'Annex A.5.17' },
      { id: 'sa_c2', text: 'Generate an unredacted user list from Identity Provider (Okta/Google Workspace/Azure AD) for sample reconciliation', clause: 'Annex A.5.16' },
      { id: 'sa_c3', text: 'Prepare live screen demonstration of backup retention settings and SIEM log ingestion dashboards', clause: 'Annex A.8.13' },
      { id: 'sa_c4', text: 'Validate that default passwords and SNMP communities are disabled on all network appliances', clause: 'Annex A.8.20' }
    ],
    auditorInterrogationFocus: [
      'Can you show me the exact workflow when a senior engineer resigns—how quickly is access revoked across all cloud environments?',
      'Let us inspect your most recent backup restoration drill: what was restored, who witnessed it, and did you verify hash integrity?',
      'How are security patches deployed to live production systems, and what rollback mechanisms exist?'
    ],
    commonNonConformities: [
      'Stale active accounts belonging to former employees or long-term contractors remaining active.',
      'Root or superadmin cloud credentials without hardware MFA or shared amongst team members.',
      'Backups taken regularly but never subjected to formal test restoration drills.'
    ],
    recommendedPreparationTimeHours: 4.0
  },

  TECH_CUSTODIAN: {
    role: 'TECH_CUSTODIAN',
    title: 'Technical Custodian / Principal Engineer',
    roleBadgeColor: 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300',
    executiveSummary: 'Technical Custodians oversee source code security, CI/CD automated gates, API authentication, database encryption schemas, and change management RFC approvals.',
    isoClausesCovered: ['Annex A.8.25 (Secure Coding)', 'Annex A.8.28 (Coding Standards)', 'Annex A.8.29 (Security Testing in SDLC)', 'Annex A.8.31 (Separation of Environments)', 'Annex A.8.32 (Change Management)'],
    requiredDocumentation: [
      {
        id: 'tc_doc_1',
        name: 'Secure Software Development Lifecycle (SSDLC) Policy & Architecture Standard',
        category: 'Policy & Standard Drafts',
        description: 'Documented software development procedures detailing mandatory peer code reviews, SAST scans, and branch protection rules.',
        mandatoryFor: ['ISO 27001 Annex A.8.25', 'Annex A.8.28'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker'
      },
      {
        id: 'tc_doc_2',
        name: 'Software Bill of Materials (SBOM) & Third-Party Dependency Vulnerability Reports',
        category: 'Asset & System Inventories',
        description: 'Automated dependency manifests (Dependabot, Snyk) identifying libraries, open source packages, and license compliance.',
        mandatoryFor: ['ISO 27001 Annex A.8.8', 'Annex A.8.30'],
        suggestedFileFormat: 'JSON / Config Export',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Automated SBOM scanning pipeline broken on 2 core services; missing signed dependency vulnerability triage matrix.'
      },
      {
        id: 'tc_doc_3',
        name: 'Sample Change Management Pull Request (PR) Approval & Test Audit Trails',
        category: 'Operational Records & Logs',
        description: 'Sample bundle of 3 production deployments showing developer PR, independent senior reviewer approval, automated unit tests, and CI/CD deploy log.',
        mandatoryFor: ['ISO 27001 Annex A.8.32', 'Annex A.8.29'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: false
      },
      {
        id: 'tc_doc_4',
        name: 'Cryptographic Architecture & Data-at-Rest/In-Transit Encryption Specifications',
        category: 'Risk & Architecture Artifacts',
        description: 'Technical document defining TLS 1.3 ciphers, AES-256 KMS key management policies, rotation schedules, and database field-level encryption.',
        mandatoryFor: ['ISO 27001 Annex A.8.24'],
        suggestedFileFormat: 'Architecture Diagram (Draw.io/PNG)',
        priority: 'High',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Missing KMS key rotation runbook and cipher suites review for public TLS ingress endpoints.'
      },
      {
        id: 'tc_doc_5',
        name: 'Secrets Management Architecture & API Key Rotation Procedure',
        category: 'Policy & Standard Drafts',
        description: 'Procedure detailing elimination of hardcoded secrets via HashiCorp Vault, AWS Secrets Manager, and git pre-commit scanning hooks.',
        mandatoryFor: ['ISO 27001 Annex A.8.25', 'Annex A.8.4'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High'
      }
    ],
    preInterviewChecklist: [
      { id: 'tc_c1', text: 'Verify that branch protection rules strictly require at least one independent reviewer before merge to main branch', clause: 'Annex A.8.25' },
      { id: 'tc_c2', text: 'Ensure developer permissions do not allow direct manual code push to production clusters without CI/CD pipeline', clause: 'Annex A.8.31' },
      { id: 'tc_c3', text: 'Confirm no production data or live customer PII is replicated into staging or development environments without anonymization', clause: 'Annex A.8.33' },
      { id: 'tc_c4', text: 'Prepare live demonstration of CI/CD pipeline security linting and automated vulnerability break-build gates', clause: 'Annex A.8.29' }
    ],
    auditorInterrogationFocus: [
      'Can a software engineer push code directly into production without peer review? Can you demonstrate how the system prevents this?',
      'How are open source packages vetted for zero-day vulnerabilities prior to importing into core repositories?',
      'How do you separate development, test, and production environments, and who has direct access to production database queries?'
    ],
    commonNonConformities: [
      'Developers possessing direct administrative write access to production database clusters.',
      'Secrets or API keys inadvertently committed in git commit histories.',
      'Use of unmasked live production customer databases in local development or QA environments.'
    ],
    recommendedPreparationTimeHours: 3.5
  },

  RISK_OWNER: {
    role: 'RISK_OWNER',
    title: 'Designated Risk Owner (Clause 6.1)',
    roleBadgeColor: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
    executiveSummary: 'Risk Owners formally discover, evaluate, and accept risks to information assets, allocating resources to implement selected controls and tracking residual risk exposure.',
    isoClausesCovered: ['Clause 6.1.2 (Risk Assessment)', 'Clause 6.1.3 (Risk Treatment)', 'Clause 6.2 (Objectives)', 'Clause 8.2 (Execution)', 'Clause 8.3 (Treatment)'],
    requiredDocumentation: [
      {
        id: 'ro_doc_1',
        name: 'Information Security Risk Assessment Register (Likelihood x Impact Matrix)',
        category: 'Risk & Architecture Artifacts',
        description: 'Comprehensive risk ledger assessing threat events, vulnerabilities, pre-treatment scores, control mitigation, and residual risk levels.',
        mandatoryFor: ['ISO 27001 Clause 6.1.2', 'Clause 8.2'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker'
      },
      {
        id: 'ro_doc_2',
        name: 'Risk Treatment Plan (RTP) with Ownership & Milestone Sign-offs',
        category: 'Risk & Architecture Artifacts',
        description: 'Actionable treatment roadmap detailing chosen mitigation strategy (Mitigate, Transfer, Avoid, Accept) with assigned deadlines.',
        mandatoryFor: ['ISO 27001 Clause 6.1.3', 'Clause 8.3'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Residual risk treatment for RSK-003 and RSK-007 lacks signed executive acceptance by designated Risk Owner.'
      },
      {
        id: 'ro_doc_3',
        name: 'Statement of Applicability (SoA) Justification Matrix',
        category: 'Policy & Standard Drafts',
        description: 'Formal document justifying inclusion or exclusion of all 93 controls in Annex A based on risk assessment findings.',
        mandatoryFor: ['ISO 27001 Clause 6.1.3 d)'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: false
      },
      {
        id: 'ro_doc_4',
        name: 'Formal Risk Acceptance Letters & Executive Deviation Waivers',
        category: 'Operational Records & Logs',
        description: 'Signed records for risks where residual exposure exceeds target appetite thresholds, approved by C-level management.',
        mandatoryFor: ['ISO 27001 Clause 6.1.3 e)'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Expired temporary MFA bypass waiver for legacy billing service without formal compensating control review.'
      }
    ],
    preInterviewChecklist: [
      { id: 'ro_c1', text: 'Confirm every High or Critical risk has an assigned individual owner with a remediation target date', clause: 'Clause 6.1.3' },
      { id: 'ro_c2', text: 'Verify that every exclusion in the Statement of Applicability has a legally and technically sound justification', clause: 'Clause 6.1.3 d)' },
      { id: 'ro_c3', text: 'Check that risk assessment criteria (Likelihood & Impact scales 1-5) match the approved ISMS methodology', clause: 'Clause 6.1.2' }
    ],
    auditorInterrogationFocus: [
      'Walk me through how a newly discovered threat (e.g. generative AI data leakage) was ingested and scored in your risk register.',
      'Who has authority to accept a risk that exceeds your defined corporate risk appetite threshold?',
      'How do you verify that completed risk treatment actions actually reduced the risk score in practice?'
    ],
    commonNonConformities: [
      'Risk register has not been reviewed or updated in over 12 months despite major business changes.',
      'Controls excluded in the Statement of Applicability without clear, documented technical justifications.',
      'Unmitigated high risks left open indefinitely without formal executive risk acceptance waivers.'
    ],
    recommendedPreparationTimeHours: 3.0
  },

  DATA_PROTECTION_LEAD: {
    role: 'DATA_PROTECTION_LEAD',
    title: 'Data Protection Officer (DPO) / Privacy Lead',
    roleBadgeColor: 'border-purple-500/40 bg-purple-500/20 text-purple-300',
    executiveSummary: 'The Data Protection Officer ensures compliance with statutory privacy laws (GDPR, DPDP Act 2023, ISO 27701), managing DPIAs, RoPA registers, and data subject rights.',
    isoClausesCovered: ['ISO 27701 Clause 5 (PIMS Requirements)', 'Clause 6 (PIMS Controls)', 'GDPR Art 30 (RoPA)', 'GDPR Art 35 (DPIA)', 'Annex A.5.34 (Privacy & PII Protection)'],
    requiredDocumentation: [
      {
        id: 'dp_doc_1',
        name: 'Record of Processing Activities (RoPA) Register',
        category: 'Asset & System Inventories',
        description: 'Comprehensive inventory of all personal data processing purposes, data categories, legal bases, recipients, and retention periods.',
        mandatoryFor: ['GDPR Art 30', 'ISO 27701 Clause 5.2.2', 'DPDP Act 2023'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'RoPA register missing mandatory lawful basis and retention period mappings for generative AI customer pipelines.'
      },
      {
        id: 'dp_doc_2',
        name: 'Data Protection Impact Assessment (DPIA) Reports for High-Risk Processing',
        category: 'Risk & Architecture Artifacts',
        description: 'Formal risk assessments conducted for AI-driven customer profiling, biometric verification, or large-scale customer data handling.',
        mandatoryFor: ['GDPR Art 35', 'ISO 27701 Clause 5.4.1'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'No formal DPIA on record for customer telemetry model retraining under DPDP Section 8 and GDPR Article 35.'
      },
      {
        id: 'dp_doc_3',
        name: 'Customer Privacy Notices & Consent Logs',
        category: 'Policy & Standard Drafts',
        description: 'Live privacy notices displayed on web apps, cookie consent preference manager configurations, and timestamped opt-in records.',
        mandatoryFor: ['ISO 27701 Clause 7.2.1', 'Clause 7.2.2'],
        suggestedFileFormat: 'Live System Walkthrough',
        priority: 'Critical / Blocker'
      },
      {
        id: 'dp_doc_4',
        name: 'Data Subject Access Request (DSAR) Register & SLA Tracking',
        category: 'Operational Records & Logs',
        description: 'Log of customer requests for data deletion, export, or correction, including documented proof of fulfillment within 30 days.',
        mandatoryFor: ['ISO 27701 Clause 7.3.1'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'High'
      },
      {
        id: 'dp_doc_5',
        name: 'Data Processing Agreements (DPAs) & Sub-processor Audit Log',
        category: 'Policy & Standard Drafts',
        description: 'Executed privacy addendums with third-party vendors (Stripe, AWS, Zendesk) containing Standard Contractual Clauses (SCCs).',
        mandatoryFor: ['ISO 27701 Clause 8.2', 'Annex A.5.34'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High'
      }
    ],
    preInterviewChecklist: [
      { id: 'dp_c1', text: 'Confirm all sub-processors handling customer PII have signed DPAs with mandatory audit rights', clause: 'Annex A.5.34' },
      { id: 'dp_c2', text: 'Verify the 72-hour regulatory breach notification procedure has been tested within the last 12 months', clause: 'ISO 27701 Clause 6.13' },
      { id: 'dp_c3', text: 'Audit customer data retention timelines to ensure automatic purging occurs after expiration', clause: 'ISO 27701 Clause 7.4.1' }
    ],
    auditorInterrogationFocus: [
      'What is your step-by-step procedure if an EU or Singapore citizen exercises their Right to Erasure (deletion)?',
      'How do you evaluate and approve a new third-party cloud service before allowing them to ingest customer PII?',
      'Can you show me the DPIA for your latest machine learning / AI model that processes customer behavioral records?'
    ],
    commonNonConformities: [
      'Customer PII retained indefinitely in database backups without enforced data retention purging.',
      'Absence of executed DPAs with third-party SaaS providers who process employee or customer records.',
      'Outdated RoPA missing newly launched service offerings or automated AI feature pipelines.'
    ],
    recommendedPreparationTimeHours: 3.5
  },

  EXECUTIVE_SPONSOR: {
    role: 'EXECUTIVE_SPONSOR',
    title: 'Executive Sponsor / C-Suite (Clause 5.1)',
    roleBadgeColor: 'border-rose-500/40 bg-rose-500/20 text-rose-300',
    executiveSummary: 'Executive Sponsors demonstrate leadership commitment, approve core security policies, allocate required budgetary and personnel resources, and review ISMS performance in annual Management Reviews.',
    isoClausesCovered: ['Clause 5.1 (Leadership & Commitment)', 'Clause 5.2 (Policy)', 'Clause 5.3 (Organizational Roles)', 'Clause 9.3 (Management Review)', 'Clause 10.1 (Continual Improvement)'],
    requiredDocumentation: [
      {
        id: 'es_doc_1',
        name: 'Approved Information Security Policy signed by Chief Executive',
        category: 'Policy & Standard Drafts',
        description: 'Overarching ISMS Policy formally signed by CEO or Managing Director within the last 12 months.',
        mandatoryFor: ['ISO 27001 Clause 5.2'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker'
      },
      {
        id: 'es_doc_2',
        name: 'Formal Management Review Meeting (MRM) Minutes & Action Tracker',
        category: 'Operational Records & Logs',
        description: 'Comprehensive meeting minutes covering all mandatory Clause 9.3 inputs (audit results, risk changes, CAPA status, resource needs).',
        mandatoryFor: ['ISO 27001 Clause 9.3'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Clause 9.3 Management Review Meeting minutes from previous quarter lack signed Chair approval and resource commitment.'
      },
      {
        id: 'es_doc_3',
        name: 'ISMS Annual Budget & Security Headcount Approval Record',
        category: 'Operational Records & Logs',
        description: 'Board or executive committee budget approval showing dedicated funding for tooling, penetration testing, and compliance staffing.',
        mandatoryFor: ['ISO 27001 Clause 7.1'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High'
      },
      {
        id: 'es_doc_4',
        name: 'Corporate Information Security Objectives & Metric KPIs (Clause 6.2)',
        category: 'Risk & Architecture Artifacts',
        description: 'Quantifiable security KPIs (e.g. < 24h critical patch SLA, 0 unencrypted endpoints) tracked on an executive dashboard.',
        mandatoryFor: ['ISO 27001 Clause 6.2'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'High'
      }
    ],
    preInterviewChecklist: [
      { id: 'es_c1', text: 'Confirm the Management Review Meeting minutes reflect attendance by executive leadership', clause: 'Clause 9.3' },
      { id: 'es_c2', text: 'Be prepared to explain how information security aligns with the overall corporate business strategy', clause: 'Clause 5.1' },
      { id: 'es_c3', text: 'Ensure the CISO or Lead Implementer has direct reporting access to top management without intermediaries', clause: 'Clause 5.3' }
    ],
    auditorInterrogationFocus: [
      'How does top management ensure the Information Security Policy is compatible with the strategic direction of the company?',
      'Can you describe the findings from your most recent Management Review Meeting and what decisions were approved?',
      'How do you ensure sufficient budget and engineering headcount are provided to remediate internal audit non-conformities?'
    ],
    commonNonConformities: [
      'Management Review minutes missing required standard agenda topics (e.g. changes in external issues or vendor performance).',
      'Information Security Policy signed several years ago without annual re-authorization.',
      'C-suite unaware of current top 3 organizational security risks identified in the risk register.'
    ],
    recommendedPreparationTimeHours: 1.5
  },

  KEY_OPERATIONAL_STAFF: {
    role: 'KEY_OPERATIONAL_STAFF',
    title: 'Key Operational Personnel / Control Performer',
    roleBadgeColor: 'border-slate-500/40 bg-slate-500/20 text-slate-300',
    executiveSummary: 'Operational staff execute day-to-day controls, follow clean desk standards, verify identity during customer onboarding, and report security incidents promptly.',
    isoClausesCovered: ['Annex A.6.4 (Disciplinary)', 'Annex A.7.7 (Clean Desk)', 'Annex A.6.8 (Event Reporting)', 'Annex A.8.1 (User Endpoints)'],
    requiredDocumentation: [
      {
        id: 'op_doc_1',
        name: 'Workstation Security Baseline Verification (Disk Encryption & EDR Proof)',
        category: 'Operational Records & Logs',
        description: 'Proof that personal laptop runs enterprise EDR (CrowdStrike/SentinelOne) with active BitLocker/FileVault disk encryption.',
        mandatoryFor: ['ISO 27001 Annex A.8.1', 'Annex A.8.7'],
        suggestedFileFormat: 'Live System Walkthrough',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'No automated EDR telemetry heartbeat or active BitLocker key backup registered in MDM for 6 operational staff laptops.'
      },
      {
        id: 'op_doc_2',
        name: 'Signed Clean Desk & Clear Screen Policy Acknowledgment',
        category: 'Policy & Standard Drafts',
        description: 'Signed compliance agreement confirming physical documents and unlocked screens are not left unattended.',
        mandatoryFor: ['ISO 27001 Annex A.7.7'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High'
      },
      {
        id: 'op_doc_3',
        name: 'Incident Reporting Confirmation Ticket (Sample Test Report)',
        category: 'Operational Records & Logs',
        description: 'Sample submission into the internal security ticketing queue demonstrating knowledge of how to report a suspected phishing email.',
        mandatoryFor: ['ISO 27001 Annex A.6.8'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High'
      }
    ],
    preInterviewChecklist: [
      { id: 'op_c1', text: 'Ensure password manager is in use and no passwords are typed into plaintext spreadsheets or notes', clause: 'Annex A.5.17' },
      { id: 'op_c2', text: 'Know where to find the company Information Security Policy on the intranet', clause: 'Clause 7.3' },
      { id: 'op_c3', text: 'Know the exact contact email or Slack channel for reporting a lost laptop or suspicious email', clause: 'Annex A.6.8' }
    ],
    auditorInterrogationFocus: [
      'If you accidentally clicked a suspicious link in an email, what is the exact step-by-step action you would take right now?',
      'Can you show me where the company security policies are located and what your responsibilities are?',
      'What happens when you step away from your desk—how quickly does your computer automatically lock?'
    ],
    commonNonConformities: [
      'Staff member unable to explain how to report a security incident.',
      'Unattended laptops left unlocked or passwords written down on physical sticky notes.',
      'Lack of awareness of where the approved security policies reside.'
    ],
    recommendedPreparationTimeHours: 1.0
  },

  EXTERNAL_CONSULTANT: {
    role: 'EXTERNAL_CONSULTANT',
    title: 'External Consultant / Advisory Lead',
    roleBadgeColor: 'border-teal-500/40 bg-teal-500/20 text-teal-300',
    executiveSummary: 'External Consultants guide framework harmonization, execute independent mock audits, verify documentation completeness, and prepare process owners for external certification bodies.',
    isoClausesCovered: ['Clause 9.2 (Internal Audit)', 'Clause 10.2 (Corrective Action)', 'ISO 19011:2018 (Auditing Guidelines)', 'Statement of Applicability (SoA) Review'],
    requiredDocumentation: [
      {
        id: 'ec_doc_1',
        name: 'ISO Pre-Assessment Gap Analysis Report & Maturity Scoring Matrix',
        category: 'Risk & Architecture Artifacts',
        description: 'Detailed clause-by-clause readiness report identifying non-conformities, opportunities for improvement, and maturity ratings.',
        mandatoryFor: ['ISO 19011 Clause 6.4', 'ISO 27001 Clause 9.2'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'Critical / Blocker'
      },
      {
        id: 'ec_doc_2',
        name: 'Mock Audit Working Papers & Sample Testing Sheets',
        category: 'Operational Records & Logs',
        description: 'Documented audit sampling evidence testing controls across HR, IT, Engineering, and Facilities.',
        mandatoryFor: ['ISO 19011 Clause 6.4.7'],
        suggestedFileFormat: 'CSV / Spreadsheet',
        priority: 'Critical / Blocker',
        isMandatory: true,
        defaultMissingInSkanda: true,
        skandaDetectionReason: 'Mock audit sampling papers for Annex A.8 technical controls missing documentary evidence attachments.'
      },
      {
        id: 'ec_doc_3',
        name: 'Stage 1 Certification Body Audit Readiness Verification Checklist',
        category: 'Policy & Standard Drafts',
        description: 'Verification that all mandatory documented information (Clauses 4-10) is approved and ready for external auditor review.',
        mandatoryFor: ['ISO 27001 Clause 7.5', 'Stage 1 CB Protocol'],
        suggestedFileFormat: 'PDF Signed',
        priority: 'High'
      }
    ],
    preInterviewChecklist: [
      { id: 'ec_c1', text: 'Confirm all mandatory ISO 27001 policies have approved revision histories and formal approval stamps', clause: 'Clause 7.5' },
      { id: 'ec_c2', text: 'Validate that the Internal Audit Program has been completely executed prior to external audit Stage 1', clause: 'Clause 9.2' },
      { id: 'ec_c3', text: 'Verify that every identified finding in the internal audit has an open or resolved CAPA record', clause: 'Clause 10.2' }
    ],
    auditorInterrogationFocus: [
      'What sampling methodology was used during the pre-certification mock audit?',
      'Are there any unresolved Major Non-Conformities that could block Stage 1 certification recommendation?',
      'How was the competency of internal auditors validated per ISO 19011 Clause 7?'
    ],
    commonNonConformities: [
      'Internal audit conducted by individuals auditing their own operational work without independence.',
      'Internal audit findings left without formal root cause analysis (5-Whys) or CAPA deadlines.',
      'Mock audit completed but management review of the findings omitted before external audit.'
    ],
    recommendedPreparationTimeHours: 2.0
  }
};
