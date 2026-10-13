import { DepartmentScopeProfile, DepartmentPolicyRequirement } from '../types';

export const STANDARD_ISMS_POLICIES_AND_SOPS: Omit<DepartmentPolicyRequirement, 'id' | 'status' | 'assignedOwner'>[] = [
  // Governance & General
  {
    docCode: 'ARP_ISMS_P01',
    title: 'Information Security Management Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 5.2 / 5.3',
    annexAControl: 'A.5.1 Policies for information security',
    version: '2.1',
    implementationNotes: 'Approved by Board & CISO. Reviewed annually.'
  },
  {
    docCode: 'ARP_ISMS_P02',
    title: 'Asset Management & Information Classification Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.9 / A.5.12 Classification of information',
    version: '1.4',
    implementationNotes: 'Mandatory for all departments processing Confidential or Restricted data.'
  },
  {
    docCode: 'ARP_ISMS_P03',
    title: 'Change Management & Release Governance Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.32 Change management',
    version: '1.8',
    implementationNotes: 'Mandates peer-reviewed pull requests, change advisory board approval, and rollback testing.'
  },
  {
    docCode: 'ARP_ISMS_P04',
    title: 'Third-Party & Supplier Security Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.19 / A.5.21 Managing information security in the ICT supply chain',
    version: '1.2',
    implementationNotes: 'Requires annual SOC 2 / ISO 27001 due diligence for all Tier 1 cloud vendors.'
  },
  {
    docCode: 'ARP_ISMS_P05',
    title: 'Cryptography & Key Management Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.24 Use of cryptography',
    version: '1.5',
    implementationNotes: 'Mandates AES-256 for data at rest and TLS 1.3 for data in transit.'
  },
  {
    docCode: 'ARP_ISMS_P06',
    title: 'Vulnerability Management & Patch Governance Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.8 Management of technical vulnerabilities',
    version: '2.0',
    implementationNotes: 'SLA: Critical (7 days), High (14 days), Medium (30 days).'
  },
  {
    docCode: 'ARP_ISMS_P07',
    title: 'Threat Intelligence & Attack Surface Policy',
    type: 'POLICY',
    mandatory: false,
    isoClause: 'Clause 6.1',
    annexAControl: 'A.5.7 Threat intelligence',
    version: '1.1',
    implementationNotes: 'Ingests real-time CISA, MITRE ATT&CK, and cloud threat feeds.'
  },
  {
    docCode: 'ARP_ISMS_P08',
    title: 'Secure System Architecture & Engineering Principles',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.29 Security architecture and engineering principles',
    version: '1.3',
    implementationNotes: 'Zero-trust network segregation, immutable infrastructure, and least privilege access.'
  },
  {
    docCode: 'ARP_ISMS_P09',
    title: 'BYOD, Mobile Device & Teleworking Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 6.1 / 7.2',
    annexAControl: 'A.6.7 Remote working / A.8.1 User endpoint devices',
    version: '1.6',
    implementationNotes: 'Requires MDM enrollment, full disk encryption, and automatic screen lock.'
  },
  {
    docCode: 'ARP_ISMS_P11',
    title: 'Access Control & Privileged Access Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 5.3 / 8.1',
    annexAControl: 'A.5.15 / A.5.16 / A.5.18 Access rights',
    version: '1.0',
    implementationNotes: 'Mandatory MFA on all workforce accounts; quarterly user access recertification.'
  },
  {
    docCode: 'ARP_ISMS_P12',
    title: 'AI Governance & LLM Prompt Security Policy',
    type: 'POLICY',
    mandatory: false,
    isoClause: 'ISO 42001 Clause 5.1 / 6.1',
    annexAControl: 'ISO 42001 A.5.1 / ISO 27001 A.8.28 Secure coding',
    version: '1.0',
    implementationNotes: 'Prohibits pasting customer confidential data into public non-enterprise LLMs.'
  },
  {
    docCode: 'ARP_ISMS_P13',
    title: 'Human Resources Security & Staff Screening Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 7.2',
    annexAControl: 'A.6.1 Screening / A.6.2 Terms and conditions of employment',
    version: '2.0',
    implementationNotes: '7-year criminal & employment background verification prior to issuing equipment.'
  },
  {
    docCode: 'ARP_ISMS_P14',
    title: 'Disciplinary & Misconduct Process Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 7.2',
    annexAControl: 'A.6.4 Disciplinary process',
    version: '1.2',
    implementationNotes: 'Formal escalation steps for security policy infractions.'
  },
  {
    docCode: 'ARP_ISMS_P15',
    title: 'Clear Desk and Clear Screen Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 7.2',
    annexAControl: 'A.7.7 Clear desk and clear screen',
    version: '1.3',
    implementationNotes: 'Lock screen timeout set to 5 minutes; clean desk spot checks conducted monthly.'
  },
  {
    docCode: 'ARP_ISMS_P16',
    title: 'Financial Data Security & Anti-Fraud Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.3 Segregation of duties / A.5.12 Data classification',
    version: '1.4',
    implementationNotes: 'Enforces dual-authorization on banking transfers over $10,000.'
  },
  {
    docCode: 'ARP_ISMS_P17',
    title: 'Data Privacy & Regulatory Protection Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 4.2 / 8.1',
    annexAControl: 'A.5.34 Privacy and protection of PII',
    version: '2.2',
    implementationNotes: 'Compliance with GDPR, UK DPA 2018, and Singapore PDPA regulations.'
  },
  {
    docCode: 'ARP_ISMS_P18',
    title: 'Intellectual Property & Licensing Governance Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 4.2',
    annexAControl: 'A.5.32 Intellectual property rights',
    version: '1.1',
    implementationNotes: 'Software license compliance tracking and open-source copyright attribution.'
  },
  {
    docCode: 'ARP_ISMS_P19',
    title: 'Physical & Environmental Perimeter Security Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.7.1 Physical security perimeters / A.7.4 Physical security monitoring',
    version: '1.5',
    implementationNotes: '24/7 CCTV surveillance with 90-day retention and badge access control logs.'
  },
  {
    docCode: 'ARP_ISMS_P20',
    title: 'Business Continuity & Disaster Recovery Policy',
    type: 'POLICY',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.29 / A.5.30 ICT readiness for business continuity',
    version: '2.0',
    implementationNotes: 'RTO < 4 hours, RPO < 1 hour. Annual failover test drill.'
  },

  // Standard Operating Procedures (SOPs)
  {
    docCode: 'ARP_ISMS_PR01',
    title: 'User Access Provisioning & Deprovisioning SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.16 Identity management / A.5.18 Access rights',
    version: '2.1',
    implementationNotes: 'SLA: Provisioning within 24h of Jira approval; Deprovisioning within 2h of HR notice.'
  },
  {
    docCode: 'ARP_ISMS_PR02',
    title: 'Quarterly User Access Review & Privilege Recertification SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 9.2',
    annexAControl: 'A.5.18 Access rights review',
    version: '1.4',
    implementationNotes: 'Department leads must sign off on access lists every 90 days.'
  },
  {
    docCode: 'ARP_ISMS_PR03',
    title: 'Security Incident Handling & Data Breach Response SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1 / 10.2',
    annexAControl: 'A.5.24 Information security incident management planning',
    version: '2.3',
    implementationNotes: 'Defines Severity 1-4 triage matrix, CSIRT mobilization, and 72h regulatory notification.'
  },
  {
    docCode: 'ARP_ISMS_PR04',
    title: 'Automated Backup Verification & Disaster Recovery Restoration SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.13 Information backup',
    version: '1.9',
    implementationNotes: 'Quarterly test restoration into isolated staging VPC with SHA-256 data checksum validation.'
  },
  {
    docCode: 'ARP_ISMS_PR05',
    title: 'Workforce Cyber Hygiene & Phishing Simulation SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 7.2 / 7.3',
    annexAControl: 'A.6.3 Information security awareness, education and training',
    version: '2.0',
    implementationNotes: 'Monthly unannounced phishing simulations; mandatory remedial training for repeat clickers.'
  },
  {
    docCode: 'ARP_ISMS_PR06',
    title: 'Employee Offboarding & Asset Retrieval Checklist SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 7.2',
    annexAControl: 'A.6.5 Responsibilities after termination or change of employment',
    version: '1.7',
    implementationNotes: 'Remote MDM wipe, laptop return tracking, and badge deactivation.'
  },
  {
    docCode: 'ARP_ISMS_PR07',
    title: 'Secure Software Development Lifecycle (SSDLC) & Code Review SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.25 Secure development life cycle / A.8.28 Secure coding',
    version: '2.4',
    implementationNotes: 'Two-person approval rule on GitHub PRs, automated SonarQube SAST gating, Dependabot dependency scans.'
  },
  {
    docCode: 'ARP_ISMS_PR08',
    title: 'Emergency Production Access & Break-Glass SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.32 Change management / A.5.15 Access control',
    version: '1.3',
    implementationNotes: 'Time-bounded 4-hour PAM credentials with session screen recording and post-incident review.'
  },
  {
    docCode: 'ARP_ISMS_PR09',
    title: 'Dual-Authorization Payment & Wire Verification SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.3 Segregation of duties',
    version: '1.1',
    implementationNotes: 'Callback verification required for all new vendor bank account detail changes.'
  },
  {
    docCode: 'ARP_ISMS_PR10',
    title: 'Data Subject Access Request (DSAR) Fulfillment Procedure',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.34 Privacy and protection of PII',
    version: '1.5',
    implementationNotes: '30-day statutory turnaround for customer data export and right-to-be-forgotten deletion requests.'
  },
  {
    docCode: 'ARP_ISMS_PR11',
    title: 'Vendor Security Due Diligence & Annual Tiering SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.5.20 Addressing information security within supplier agreements',
    version: '1.6',
    implementationNotes: 'Annual SIG questionnaire, SOC 2 Type II report verification, and DPA contract review.'
  },
  {
    docCode: 'ARP_ISMS_PR12',
    title: 'Physical Facility Visitor Logging & Badge Escort SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.7.2 Physical entry / A.7.3 Securing offices, rooms and facilities',
    version: '1.2',
    implementationNotes: 'Government photo ID verification and mandatory non-disclosure agreement (NDA) sign-in at front desk.'
  },
  {
    docCode: 'ARP_ISMS_PR13',
    title: 'Test Data Masking & Synthetic Data Generation SOP',
    type: 'SOP',
    mandatory: true,
    isoClause: 'Clause 8.1',
    annexAControl: 'A.8.33 Test information',
    version: '1.4',
    implementationNotes: 'Prohibits copying unmasked customer PII or payment data into non-production test databases.'
  },
  {
    docCode: 'ARP_AIMS_PR01',
    title: 'AI Model Risk Assessment & System Impact Analysis (AI-SIA) SOP',
    type: 'SOP',
    mandatory: false,
    isoClause: 'ISO 42001 Clause 6.1.2',
    annexAControl: 'ISO 42001 A.6.1 / A.7.1 AI system lifecycle',
    version: '1.0',
    implementationNotes: 'Comprehensive algorithmic bias testing, explainability scorecard, and human-in-the-loop validation.'
  }
];

export function generateInitialDepartmentScopes(tenantId: string = 'tenant_skanda'): DepartmentScopeProfile[] {
  const timestamp = new Date().toISOString();

  return [
    {
      id: 'dept_it',
      tenantId,
      name: 'Information Technology (IT Operations)',
      category: 'Technology',
      isInScope: true,
      leadOwner: 'IT Operations Lead',
      leadEmail: 'it.lead@skanda.local',
      headcount: 14,
      scopeBoundary: 'Corporate workforce laptops, employee IAM accounts, VPN concentrators, office Wi-Fi, mobile device management (MDM), asset tracking, and software license administration.',
      coreProcesses: [
        'User account provisioning & deprovisioning (SLA < 24h)',
        'Quarterly access rights review & recertification',
        'Hardware asset lifecycle management & cryptographic decommissioning',
        'Patch management & OS vulnerability remediation across all workstations',
        'Endpoint encryption enforcement (BitLocker & FileVault)'
      ],
      criticalAssetsAndSystems: [
        'Okta Identity Cloud (Workforce IAM)',
        'JumpCloud MDM & Endpoint Fleet Management',
        'Zscaler Private Access (ZTNA / VPN)',
        'Jira Service Management (ITSM Ticketing)',
        'Google Workspace Enterprise Administration'
      ],
      dataClassifications: ['Confidential', 'Restricted', 'Internal'],
      workLocations: ['Corporate HQ Office', 'Remote (100% Cloud)', 'Hybrid'],
      applicableAnnexAControls: [
        'A.5.9 Inventory of information and other associated assets',
        'A.5.10 Acceptable use of information and other associated assets',
        'A.5.15 Access control',
        'A.5.16 Identity management',
        'A.5.18 Access rights',
        'A.8.1 User endpoint devices',
        'A.8.8 Management of technical vulnerabilities',
        'A.8.13 Information backup',
        'A.8.20 Network security',
        'A.8.24 Use of cryptography'
      ],
      applicableIsoClauses: [
        'Clause 4.3 (Scope Boundaries)',
        'Clause 5.3 (Roles & Responsibilities)',
        'Clause 7.1 (Resources & Infrastructure)',
        'Clause 8.1 (Operational Planning)',
        'Clause 9.2 (Internal Audit)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021/2024', 'SOC 2 Type II'],
      threatVectors: [
        'Compromised workforce credentials / credential stuffing',
        'Lost or stolen unencrypted employee laptop',
        'Unpatched zero-day vulnerability in endpoint OS',
        'Shadow IT software adoption bypassing IT approval'
      ],
      policyRequirements: [
        {
          id: 'pr_it_1',
          docCode: 'ARP_ISMS_P11',
          title: 'Access Control & Privileged Access Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 5.3 / 8.1',
          annexAControl: 'A.5.15 / A.5.16',
          status: 'Compliant & Approved',
          assignedOwner: 'IT Operations Lead',
          version: '1.0',
          lastAuditDate: '2026-07-15',
          nextReviewDate: '2027-07-15',
          implementationNotes: 'MFA enforced on 100% of user accounts; automated JumpCloud sync.'
        },
        {
          id: 'pr_it_2',
          docCode: 'ARP_ISMS_P02',
          title: 'Asset Management & Information Classification Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.5.9 / A.5.10',
          status: 'Compliant & Approved',
          assignedOwner: 'IT Operations Lead',
          version: '1.4',
          lastAuditDate: '2026-06-20',
          nextReviewDate: '2027-06-20',
          implementationNotes: 'All serial numbers logged in Evidence & Asset Register.'
        },
        {
          id: 'pr_it_3',
          docCode: 'ARP_ISMS_PR01',
          title: 'User Access Provisioning & Deprovisioning SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.5.16 / A.5.18',
          status: 'Compliant & Approved',
          assignedOwner: 'IT Operations Lead',
          version: '2.1',
          lastAuditDate: '2026-08-01',
          nextReviewDate: '2027-08-01',
          implementationNotes: 'Okta lifecycle management triggers automated deprovisioning upon HR ticket.'
        },
        {
          id: 'pr_it_4',
          docCode: 'ARP_ISMS_P09',
          title: 'BYOD, Mobile Device & Teleworking Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 6.1 / 7.2',
          annexAControl: 'A.6.7 / A.8.1',
          status: 'Compliant & Approved',
          assignedOwner: 'IT Operations Lead',
          version: '1.6',
          lastAuditDate: '2026-05-10',
          nextReviewDate: '2027-05-10',
          implementationNotes: 'Strict MDM enrollment required for accessing company email.'
        },
        {
          id: 'pr_it_5',
          docCode: 'ARP_ISMS_P06',
          title: 'Vulnerability Management & Patch Governance Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.8',
          status: 'Compliant & Approved',
          assignedOwner: 'IT Operations Lead',
          version: '2.0',
          lastAuditDate: '2026-08-12',
          nextReviewDate: '2027-08-12',
          implementationNotes: 'Automated weekly patch push via JumpCloud.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 95,
      auditorNotes: 'IT Operations maintains immaculate documentation and automated MDM enforcement.',
      updatedAt: timestamp
    },
    {
      id: 'dept_dev',
      tenantId,
      name: 'Software Engineering & Cloud DevOps',
      category: 'Technology',
      isInScope: true,
      leadOwner: 'Arjun Mehta (VP of Engineering / DevOps)',
      leadEmail: 'engineering.lead@skanda.local',
      headcount: 32,
      scopeBoundary: 'SaaS application codebase, microservices, AWS/GCP cloud environments (Production, Staging, Dev), CI/CD build agents, container registries, Kubernetes clusters, and database infrastructure.',
      coreProcesses: [
        'Secure Software Development Lifecycle (SSDLC) & Automated SAST/DAST testing',
        'Peer-reviewed pull requests with mandatory 2-person approval gating',
        'Production deployment automation via ArgoCD with canary rollouts',
        'Cloud infrastructure-as-code (IaC) provisioning using Terraform',
        'Continuous backup snapshotting & quarterly DR restoration drills'
      ],
      criticalAssetsAndSystems: [
        'AWS Production Cloud Account (ap-southeast-1, us-east-1)',
        'GitHub Enterprise Organization & Actions Runners',
        'ArgoCD GitOps Kubernetes Controller',
        'HashiCorp Vault Enterprise (Secrets & KMS Management)',
        'SonarQube Enterprise Code Quality Gate',
        'Datadog APM & Cloud Monitoring'
      ],
      dataClassifications: ['Restricted', 'Confidential', 'Internal'],
      workLocations: ['Remote (100% Cloud)', 'Hybrid'],
      applicableAnnexAControls: [
        'A.8.24 Use of cryptography',
        'A.8.25 Secure development life cycle',
        'A.8.26 Application security requirements',
        'A.8.27 Secure system architecture and engineering principles',
        'A.8.28 Secure coding',
        'A.8.29 Security testing in development and acceptance',
        'A.8.31 Separation of development, test and production environments',
        'A.8.32 Change management',
        'A.8.33 Test information',
        'A.8.13 Information backup'
      ],
      applicableIsoClauses: [
        'Clause 4.3 (Scope Boundaries)',
        'Clause 6.1 (Risk Assessment & Treatment)',
        'Clause 8.1 (Operational Planning & Control)',
        'Clause 9.1 (Monitoring, Measurement, Analysis)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021/2024', 'SOC 2 Type II'],
      threatVectors: [
        'Supply chain package vulnerability / malicious npm dependency',
        'Hardcoded AWS / API secrets committed into source code',
        'Unapproved emergency hotfix pushed directly to production',
        'Misconfigured cloud S3 bucket or open Kubernetes ingress'
      ],
      policyRequirements: [
        {
          id: 'pr_dev_1',
          docCode: 'ARP_ISMS_PR07',
          title: 'Secure Software Development Lifecycle (SSDLC) SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.25 / A.8.28',
          status: 'Compliant & Approved',
          assignedOwner: 'Arjun Mehta',
          version: '2.4',
          lastAuditDate: '2026-08-15',
          nextReviewDate: '2027-08-15',
          implementationNotes: 'SonarQube quality gate configured with zero High/Critical CVSS tolerance.'
        },
        {
          id: 'pr_dev_2',
          docCode: 'ARP_ISMS_P03',
          title: 'Change Management & Release Governance Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.32',
          status: 'Compliant & Approved',
          assignedOwner: 'Arjun Mehta',
          version: '1.8',
          lastAuditDate: '2026-07-20',
          nextReviewDate: '2027-07-20',
          implementationNotes: 'Main branch write access blocked for all users; automated CI/CD gating.'
        },
        {
          id: 'pr_dev_3',
          docCode: 'ARP_ISMS_PR08',
          title: 'Emergency Production Access & Break-Glass SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.32 / A.5.15',
          status: 'Compliant & Approved',
          assignedOwner: 'Arjun Mehta',
          version: '1.3',
          lastAuditDate: '2026-08-01',
          nextReviewDate: '2027-08-01',
          implementationNotes: 'Requires dual-approval in Jira and generates temporary IAM credentials.'
        },
        {
          id: 'pr_dev_4',
          docCode: 'ARP_ISMS_PR04',
          title: 'Automated Backup Verification & Disaster Recovery Restoration SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.13',
          status: 'Compliant & Approved',
          assignedOwner: 'Arjun Mehta',
          version: '1.9',
          lastAuditDate: '2026-08-20',
          nextReviewDate: '2027-08-20',
          implementationNotes: 'Quarterly DR restoration test executed with RTO 42 minutes vs <4hr SLA.'
        },
        {
          id: 'pr_dev_5',
          docCode: 'ARP_ISMS_PR13',
          title: 'Test Data Masking & Synthetic Data Generation SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.33',
          status: 'Compliant & Approved',
          assignedOwner: 'Arjun Mehta',
          version: '1.4',
          lastAuditDate: '2026-06-15',
          nextReviewDate: '2027-06-15',
          implementationNotes: 'Synthetic Faker data utilized in Staging; zero live customer PII.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 96,
      auditorNotes: 'Excellent CI/CD pipeline security controls and branch protection mechanisms.',
      updatedAt: timestamp
    },
    {
      id: 'dept_sec',
      tenantId,
      name: 'Information Security & Cyber SOC',
      category: 'Risk & Security',
      isInScope: true,
      leadOwner: 'Elena Rostova (Chief Information Security Officer)',
      leadEmail: 'secops.lead@skanda.local',
      headcount: 8,
      scopeBoundary: 'Enterprise Information Security Management System (ISMS), 24/7 Security Operations Center (SOC), Threat Intelligence, Incident Response (CSIRT), Vulnerability Management, and Compliance Governance.',
      coreProcesses: [
        'Continuous Control Monitoring (CCM) & SIEM log analytics',
        'Threat hunting, alert triage, and incident response mobilization',
        'Quarterly penetration testing & external attack surface scanning',
        'Annual risk assessment & risk treatment plan execution',
        'Management Review Meetings (MRM) and Board reporting'
      ],
      criticalAssetsAndSystems: [
        'CrowdStrike Falcon Complete EDR',
        'Splunk Cloud Enterprise SIEM',
        'AWS Security Hub & GuardDuty',
        'Qualys VMDR (Vulnerability Management)',
        'Phoenix GRC Regulatory Intelligence Platform'
      ],
      dataClassifications: ['Restricted', 'Confidential', 'Internal'],
      workLocations: ['Corporate HQ Office', 'Remote (100% Cloud)'],
      applicableAnnexAControls: [
        'A.5.1 Policies for information security',
        'A.5.4 Management responsibilities',
        'A.5.7 Threat intelligence',
        'A.5.24 Information security incident management planning and preparation',
        'A.5.25 Assessment and decision on information security events',
        'A.5.26 Response to information security incidents',
        'A.5.28 Collection of evidence',
        'A.8.8 Management of technical vulnerabilities',
        'A.8.16 Monitoring activities'
      ],
      applicableIsoClauses: [
        'Clause 4.1 - 4.4 (Context & Scope)',
        'Clause 5.1 - 5.3 (Leadership & Commitment)',
        'Clause 6.1 - 6.3 (Risk Management & Objectives)',
        'Clause 8.1 - 8.3 (Operational Control)',
        'Clause 9.1 - 9.3 (Performance Evaluation & MRM)',
        'Clause 10.1 - 10.2 (Improvement & CAPA)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'ISO/IEC 42001:2023', 'MAS TRM 2021/2024'],
      threatVectors: [
        'Advanced Persistent Threat (APT) nation-state intrusion',
        'Ransomware outbreak across cloud workloads',
        'Undetected insider data exfiltration',
        'Zero-day vulnerability exploitation'
      ],
      policyRequirements: [
        {
          id: 'pr_sec_1',
          docCode: 'ARP_ISMS_P01',
          title: 'Information Security Management Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 5.2 / 5.3',
          annexAControl: 'A.5.1',
          status: 'Compliant & Approved',
          assignedOwner: 'Elena Rostova',
          version: '2.1',
          lastAuditDate: '2026-07-01',
          nextReviewDate: '2027-07-01',
          implementationNotes: 'Signed by CEO and CISO; distributed to all personnel.'
        },
        {
          id: 'pr_sec_2',
          docCode: 'ARP_ISMS_PR03',
          title: 'Security Incident Handling & Data Breach Response SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1 / 10.2',
          annexAControl: 'A.5.24 / A.5.26',
          status: 'Compliant & Approved',
          assignedOwner: 'Elena Rostova',
          version: '2.3',
          lastAuditDate: '2026-08-10',
          nextReviewDate: '2027-08-10',
          implementationNotes: 'Tested in table-top exercise with executive team.'
        },
        {
          id: 'pr_sec_3',
          docCode: 'ARP_ISMS_P06',
          title: 'Vulnerability Management & Patch Governance Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.8',
          status: 'Compliant & Approved',
          assignedOwner: 'Elena Rostova',
          version: '2.0',
          lastAuditDate: '2026-08-12',
          nextReviewDate: '2027-08-12',
          implementationNotes: 'Automated weekly scans across all external IPs.'
        },
        {
          id: 'pr_sec_4',
          docCode: 'ARP_ISMS_P07',
          title: 'Threat Intelligence & Attack Surface Policy',
          type: 'POLICY',
          mandatory: false,
          isoClause: 'Clause 6.1',
          annexAControl: 'A.5.7',
          status: 'Compliant & Approved',
          assignedOwner: 'Elena Rostova',
          version: '1.1',
          lastAuditDate: '2026-06-01',
          nextReviewDate: '2027-06-01',
          implementationNotes: 'Integrated with MISP and CrowdStrike threat feeds.'
        }
      ],
      maturityLevel: 5,
      readinessScore: 98,
      auditorNotes: 'Robust security governance and telemetry integration across the entire tech stack.',
      updatedAt: timestamp
    },
    {
      id: 'dept_ds',
      tenantId,
      name: 'Data Science & Machine Learning AI',
      category: 'Technology',
      isInScope: true,
      leadOwner: 'Dr. Vivek Sridhar (Head of AI & Data Science)',
      leadEmail: 'ai.lead@skanda.local',
      headcount: 18,
      scopeBoundary: 'Machine learning training pipelines, generative AI models, vector databases, synthetic data generation, prompt evaluation harnesses, and AI System Impact Assessments (AI-SIA).',
      coreProcesses: [
        'AI System Impact Assessment (AI-SIA) before model deployment',
        'Training dataset provenance verification & PII data cleansing',
        'Model bias, fairness, explainability, and safety red-teaming',
        'LLM prompt injection defenses and output hallucination filtering',
        'Model card registry & version control management'
      ],
      criticalAssetsAndSystems: [
        'AWS SageMaker Studio Enterprise',
        'Snowflake AI Data Cloud (Feature Store)',
        'Pinecone Vector Database (Enterprise Tenant)',
        'Weights & Biases Model Registry',
        'Azure OpenAI Private VPC Service'
      ],
      dataClassifications: ['Restricted', 'Confidential', 'Internal'],
      workLocations: ['Remote (100% Cloud)', 'Hybrid'],
      applicableAnnexAControls: [
        'A.5.12 Classification of information',
        'A.8.24 Use of cryptography',
        'A.8.28 Secure coding',
        'A.8.33 Test information',
        'ISO 42001 A.5.1 AI Policy',
        'ISO 42001 A.6.1 AI Risk Assessment',
        'ISO 42001 A.7.2 AI Data Provenance',
        'ISO 42001 A.8.2 AI Model Card Registry'
      ],
      applicableIsoClauses: [
        'Clause 4.3 (Scope)',
        'Clause 6.1 (AI Risk Assessment & Treatment)',
        'Clause 8.1 (AI Lifecycle Controls)',
        'Clause 9.1 (Model Monitoring)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'ISO/IEC 42001:2023', 'MAS TRM 2021/2024'],
      threatVectors: [
        'Adversarial prompt injection & jailbreaking of LLM',
        'Model inversion / membership inference training data leakage',
        'Uncurated bias in algorithmic risk scoring outputs',
        'Model poisoning attack in synthetic training dataset'
      ],
      policyRequirements: [
        {
          id: 'pr_ds_1',
          docCode: 'ARP_ISMS_P12',
          title: 'AI Governance & LLM Prompt Security Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'ISO 42001 Clause 5.1 / 6.1',
          annexAControl: 'ISO 42001 A.5.1 / A.8.28',
          status: 'Compliant & Approved',
          assignedOwner: 'Dr. Vivek Sridhar',
          version: '1.0',
          lastAuditDate: '2026-08-05',
          nextReviewDate: '2027-08-05',
          implementationNotes: 'Prohibits passing raw customer identifiers to external LLM APIs.'
        },
        {
          id: 'pr_ds_2',
          docCode: 'ARP_AIMS_PR01',
          title: 'AI Model Risk Assessment & System Impact Analysis (AI-SIA) SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'ISO 42001 Clause 6.1.2',
          annexAControl: 'ISO 42001 A.6.1',
          status: 'Compliant & Approved',
          assignedOwner: 'Dr. Vivek Sridhar',
          version: '1.0',
          lastAuditDate: '2026-08-18',
          nextReviewDate: '2027-08-18',
          implementationNotes: 'Formal risk assessment required prior to model registry release.'
        },
        {
          id: 'pr_ds_3',
          docCode: 'ARP_ISMS_PR13',
          title: 'Test Data Masking & Synthetic Data Generation SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.33',
          status: 'Compliant & Approved',
          assignedOwner: 'Dr. Vivek Sridhar',
          version: '1.4',
          lastAuditDate: '2026-06-15',
          nextReviewDate: '2027-06-15',
          implementationNotes: 'Automated differential privacy and synthetic generator used for model training.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 92,
      auditorNotes: 'Pioneer implementation of ISO 42001 AI governance controls aligned with ISO 27001.',
      updatedAt: timestamp
    },
    {
      id: 'dept_hr',
      tenantId,
      name: 'Human Resources & People Operations',
      category: 'People & Operations',
      isInScope: true,
      leadOwner: 'Sarah Jenkins (VP of People & Culture)',
      leadEmail: 'hr.lead@skanda.local',
      headcount: 10,
      scopeBoundary: 'Employee hiring & screening, background verification, employment contracts, confidentiality NDAs, annual security awareness training campaigns, disciplinary procedures, and offboarding workflows.',
      coreProcesses: [
        'Pre-employment background verification (criminal, reference, credential checks)',
        'New hire security onboarding & NDA signing',
        'Annual security awareness training & monthly phishing simulation management',
        'Offboarding checklist execution & 2-hour notification to IT/Security',
        'Clean desk spot audits & disciplinary enforcement'
      ],
      criticalAssetsAndSystems: [
        'Workday HRIS (Employee Master Records)',
        'Lattice People Platform',
        'KnowBe4 Security Awareness Training Platform',
        'DocuSign / Ironclad (NDA & Employment Contracts)'
      ],
      dataClassifications: ['Restricted', 'Confidential', 'Internal'],
      workLocations: ['Corporate HQ Office', 'Remote (100% Cloud)', 'Hybrid'],
      applicableAnnexAControls: [
        'A.6.1 Screening',
        'A.6.2 Terms and conditions of employment',
        'A.6.3 Information security awareness, education and training',
        'A.6.4 Disciplinary process',
        'A.6.5 Responsibilities after termination or change of employment',
        'A.6.6 Confidentiality or non-disclosure agreements',
        'A.6.7 Remote working',
        'A.7.7 Clear desk and clear screen'
      ],
      applicableIsoClauses: [
        'Clause 4.3 (Scope)',
        'Clause 5.3 (Organizational Roles)',
        'Clause 7.2 (Competence)',
        'Clause 7.3 (Awareness)',
        'Clause 7.4 (Communication)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021/2024', 'SOC 2 Type II'],
      threatVectors: [
        'Insider threat / rogue employee data exfiltration before resignation',
        'Workforce failure on phishing simulation leading to malware infection',
        'Failure to revoke SaaS access post-termination within SLA',
        'Unauthorized exposure of employee payroll or medical PII'
      ],
      policyRequirements: [
        {
          id: 'pr_hr_1',
          docCode: 'ARP_ISMS_P13',
          title: 'Human Resources Security & Staff Screening Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 7.2',
          annexAControl: 'A.6.1 / A.6.2',
          status: 'Compliant & Approved',
          assignedOwner: 'Sarah Jenkins',
          version: '2.0',
          lastAuditDate: '2026-07-10',
          nextReviewDate: '2027-07-10',
          implementationNotes: '100% background checks verified in Evidence Vault.'
        },
        {
          id: 'pr_hr_2',
          docCode: 'ARP_ISMS_PR05',
          title: 'Workforce Cyber Hygiene & Phishing Simulation SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 7.2 / 7.3',
          annexAControl: 'A.6.3',
          status: 'Compliant & Approved',
          assignedOwner: 'Sarah Jenkins',
          version: '2.0',
          lastAuditDate: '2026-08-01',
          nextReviewDate: '2027-08-01',
          implementationNotes: '98.4% workforce completion rate on KnowBe4 Q3 module.'
        },
        {
          id: 'pr_hr_3',
          docCode: 'ARP_ISMS_PR06',
          title: 'Employee Offboarding & Asset Retrieval Checklist SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 7.2',
          annexAControl: 'A.6.5',
          status: 'Compliant & Approved',
          assignedOwner: 'Sarah Jenkins',
          version: '1.7',
          lastAuditDate: '2026-08-02',
          nextReviewDate: '2027-08-02',
          implementationNotes: 'Automated Jira ticket created 48 hours prior to last working day.'
        },
        {
          id: 'pr_hr_4',
          docCode: 'ARP_ISMS_P14',
          title: 'Disciplinary & Misconduct Process Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 7.2',
          annexAControl: 'A.6.4',
          status: 'Compliant & Approved',
          assignedOwner: 'Sarah Jenkins',
          version: '1.2',
          lastAuditDate: '2026-06-12',
          nextReviewDate: '2027-06-12',
          implementationNotes: 'Explicitly outlines sanctions for deliberate security policy violations.'
        },
        {
          id: 'pr_hr_5',
          docCode: 'ARP_ISMS_P15',
          title: 'Clear Desk and Clear Screen Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 7.2',
          annexAControl: 'A.7.7',
          status: 'Compliant & Approved',
          assignedOwner: 'Sarah Jenkins',
          version: '1.3',
          lastAuditDate: '2026-07-22',
          nextReviewDate: '2027-07-22',
          implementationNotes: 'Quarterly clean desk audit log signed by Office Manager.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 94,
      auditorNotes: 'High employee awareness training completion rate and verified pre-employment screening.',
      updatedAt: timestamp
    },
    {
      id: 'dept_fin',
      tenantId,
      name: 'Finance, Treasury & Accounting',
      category: 'Corporate & Finance',
      isInScope: true,
      leadOwner: 'Marcus Vance (Chief Financial Officer)',
      leadEmail: 'finance.lead@skanda.local',
      headcount: 12,
      scopeBoundary: 'Corporate bank accounts, treasury disbursements, customer invoicing & billing platform, payroll processing, tax filings, and financial statement audit records.',
      coreProcesses: [
        'Dual-authorization (Four-Eyes) approval for outgoing wire transfers > $10k',
        'Vendor bank account detail verification & fraud callback protocol',
        'Monthly financial account reconciliation & ledger closing',
        'Payroll execution with strict segregation of duties',
        'Annual statutory financial audit & SOC 1 / SOC 2 Type II coordination'
      ],
      criticalAssetsAndSystems: [
        'Oracle NetSuite Enterprise ERP',
        'Stripe Billing & Payments Gateway',
        'Coupa Spend Management',
        'JPMorgan Chase Corporate Online Banking',
        'ADP Global Payroll Processing'
      ],
      dataClassifications: ['Restricted', 'Confidential', 'Internal'],
      workLocations: ['Corporate HQ Office', 'Remote (100% Cloud)', 'Hybrid'],
      applicableAnnexAControls: [
        'A.5.3 Segregation of duties',
        'A.5.12 Classification of information',
        'A.5.15 Access control',
        'A.5.16 Identity management',
        'A.8.12 Data leakage prevention'
      ],
      applicableIsoClauses: [
        'Clause 4.3 (Scope)',
        'Clause 5.3 (Roles & Segregation of Duties)',
        'Clause 8.1 (Operational Control)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021/2024', 'SOC 1 / SOC 2 Type II'],
      threatVectors: [
        'Business Email Compromise (BEC) wire fraud / fraudulent invoice spoofing',
        'Unauthorized payroll modification or embezzlement',
        'Unencrypted financial statement spreadsheet leakage'
      ],
      policyRequirements: [
        {
          id: 'pr_fin_1',
          docCode: 'ARP_ISMS_P16',
          title: 'Financial Data Security & Anti-Fraud Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.5.3 / A.5.12',
          status: 'Compliant & Approved',
          assignedOwner: 'Marcus Vance',
          version: '1.4',
          lastAuditDate: '2026-07-28',
          nextReviewDate: '2027-07-28',
          implementationNotes: 'Strict segregation between payment initiator and payment approver.'
        },
        {
          id: 'pr_fin_2',
          docCode: 'ARP_ISMS_PR09',
          title: 'Dual-Authorization Payment & Wire Verification SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.5.3',
          status: 'Compliant & Approved',
          assignedOwner: 'Marcus Vance',
          version: '1.1',
          lastAuditDate: '2026-08-04',
          nextReviewDate: '2027-08-04',
          implementationNotes: 'Mandatory phone callback on recorded lines for any bank account changes.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 93,
      auditorNotes: 'Strong segregation of duties in ERP and bank authorization matrices.',
      updatedAt: timestamp
    },
    {
      id: 'dept_leg',
      tenantId,
      name: 'Legal, Privacy & Compliance (DPO)',
      category: 'Corporate & Finance',
      isInScope: true,
      leadOwner: 'Rachel Zane (General Counsel & Data Protection Officer)',
      leadEmail: 'legal.lead@skanda.local',
      headcount: 6,
      scopeBoundary: 'Statutory compliance (ISO 27001, GDPR, MAS TRM), enterprise contract negotiation, Data Processing Addenda (DPAs), Record of Processing Activities (RoPA), Data Subject Access Requests (DSAR), and intellectual property protection.',
      coreProcesses: [
        'Annual review of interested parties & legal compliance register (Clause 4.2)',
        'Customer DPA negotiation & standard contractual clause (SCC) management',
        'Data Subject Access Request (DSAR) intake and 30-day fulfillment',
        'Regulatory breach reporting (72h notification to ICO / MAS / PDPC)',
        'Intellectual property copyright & patent registry maintenance'
      ],
      criticalAssetsAndSystems: [
        'OneTrust Privacy Management Platform',
        'Ironclad Contract Lifecycle Management (CLM)',
        'LexisNexis Compliance Intelligence',
        'Phoenix GRC Legal Register'
      ],
      dataClassifications: ['Restricted', 'Confidential', 'Internal'],
      workLocations: ['Corporate HQ Office', 'Remote (100% Cloud)'],
      applicableAnnexAControls: [
        'A.5.31 Legal, statutory, regulatory and contractual requirements',
        'A.5.32 Intellectual property rights',
        'A.5.33 Protection of records',
        'A.5.34 Privacy and protection of PII',
        'A.5.35 Independent review of information security',
        'A.5.36 Compliance with policies and standards for information security'
      ],
      applicableIsoClauses: [
        'Clause 4.2 (Understanding the needs and expectations of interested parties)',
        'Clause 7.5 (Documented Information)',
        'Clause 9.2 (Internal Audit Compliance)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'ISO/IEC 42001:2023', 'MAS TRM 2021/2024', 'GDPR/PDPA'],
      threatVectors: [
        'Regulatory non-compliance fine for late breach notification',
        'Unfulfilled DSAR resulting in statutory enforcement action',
        'Unapproved contract signing omitting standard security warranties'
      ],
      policyRequirements: [
        {
          id: 'pr_leg_1',
          docCode: 'ARP_ISMS_P17',
          title: 'Data Privacy & Regulatory Protection Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 4.2 / 8.1',
          annexAControl: 'A.5.34',
          status: 'Compliant & Approved',
          assignedOwner: 'Rachel Zane',
          version: '2.2',
          lastAuditDate: '2026-07-15',
          nextReviewDate: '2027-07-15',
          implementationNotes: 'Aligned with UK GDPR, EU GDPR, and Singapore PDPA 2020.'
        },
        {
          id: 'pr_leg_2',
          docCode: 'ARP_ISMS_PR10',
          title: 'Data Subject Access Request (DSAR) Fulfillment Procedure',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.5.34',
          status: 'Compliant & Approved',
          assignedOwner: 'Rachel Zane',
          version: '1.5',
          lastAuditDate: '2026-08-03',
          nextReviewDate: '2027-08-03',
          implementationNotes: 'Automated OneTrust workflow with identity verification before data release.'
        },
        {
          id: 'pr_leg_3',
          docCode: 'ARP_ISMS_P18',
          title: 'Intellectual Property & Licensing Governance Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 4.2',
          annexAControl: 'A.5.32',
          status: 'Compliant & Approved',
          assignedOwner: 'Rachel Zane',
          version: '1.1',
          lastAuditDate: '2026-06-20',
          nextReviewDate: '2027-06-20',
          implementationNotes: 'Open-source software license auditing in CI/CD pipeline.'
        }
      ],
      maturityLevel: 5,
      readinessScore: 97,
      auditorNotes: 'Comprehensive statutory register and interested parties mapping.',
      updatedAt: timestamp
    },
    {
      id: 'dept_proc',
      tenantId,
      name: 'Procurement & Vendor Risk Management (VRM)',
      category: 'People & Operations',
      isInScope: true,
      leadOwner: 'Daniel Chen (Head of Procurement & Vendor Risk)',
      leadEmail: 'procurement.lead@skanda.local',
      headcount: 7,
      scopeBoundary: 'Third-party vendor evaluation, SaaS procurement, supply chain security assessments, vendor contract reviews, and annual vendor security recertification.',
      coreProcesses: [
        'Tier 1 / Tier 2 Vendor security due diligence (SOC 2, ISO 27001 evaluation)',
        'Standard Information Gathering (SIG) questionnaire review',
        'Contractual security clause enforcement (24h breach notice, right to audit)',
        'Annual vendor performance and cybersecurity posture review',
        'Vendor decommissioning & data destruction attestation verification'
      ],
      criticalAssetsAndSystems: [
        'Vendorpedia / Whistic TPRM Platform',
        'Coupa Procurement Portal',
        'UpGuard Cyber Risk Rating & Attack Surface Monitor',
        'DocuSign Vendor Agreement Vault'
      ],
      dataClassifications: ['Confidential', 'Internal'],
      workLocations: ['Corporate HQ Office', 'Remote (100% Cloud)'],
      applicableAnnexAControls: [
        'A.5.19 Information security in supplier relationships',
        'A.5.20 Addressing information security within supplier agreements',
        'A.5.21 Managing information security in the ICT supply chain',
        'A.5.22 Monitoring, review and change management of supplier services',
        'A.5.23 Information security for use of cloud services'
      ],
      applicableIsoClauses: [
        'Clause 8.1 (Operational Control - Externally Provided Processes)',
        'Clause 9.1 (Supplier Performance Evaluation)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021/2024', 'SOC 2 Type II'],
      threatVectors: [
        'Third-party cloud vendor data breach affecting customer records',
        'Supply chain software library compromise (e.g. SolarWinds / Log4j style)',
        'Vendor onboarding without mandatory Data Processing Addendum (DPA)'
      ],
      policyRequirements: [
        {
          id: 'pr_proc_1',
          docCode: 'ARP_ISMS_P04',
          title: 'Third-Party & Supplier Security Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.5.19 / A.5.21',
          status: 'Compliant & Approved',
          assignedOwner: 'Daniel Chen',
          version: '1.2',
          lastAuditDate: '2026-07-25',
          nextReviewDate: '2027-07-25',
          implementationNotes: 'Mandatory SOC 2 Type II or ISO 27001 required for all critical SaaS vendors.'
        },
        {
          id: 'pr_proc_2',
          docCode: 'ARP_ISMS_PR11',
          title: 'Vendor Security Due Diligence & Annual Tiering SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.5.20',
          status: 'Compliant & Approved',
          assignedOwner: 'Daniel Chen',
          version: '1.6',
          lastAuditDate: '2026-08-08',
          nextReviewDate: '2027-08-08',
          implementationNotes: '100% Tier 1 vendors have current SOC 2 Type II reports on file.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 94,
      auditorNotes: 'All 15 third-party cloud vendors have verified ISO 27001 or SOC 2 attestations.',
      updatedAt: timestamp
    },
    {
      id: 'dept_fac',
      tenantId,
      name: 'Facilities, Physical Security & EHS',
      category: 'People & Operations',
      isInScope: true,
      leadOwner: 'Antonio Silva (Director of Corporate Facilities & Real Estate)',
      leadEmail: 'facilities.lead@skanda.local',
      headcount: 5,
      scopeBoundary: 'Corporate physical offices, visitor reception, badge access systems, server & network wiring closets, CCTV cameras, clean desk enforcement, fire suppression, and UPS battery backup systems.',
      coreProcesses: [
        'Physical access badge programming & biometric verification',
        'Visitor registration, government ID check & mandatory badge escorting',
        'Monthly CCTV camera inspection & 90-day retention verification',
        'Annual fire extinguisher & clean-agent suppression system maintenance',
        'Clean desk spot checks in collaboration with Information Security'
      ],
      criticalAssetsAndSystems: [
        'Kisi Cloud Physical Access Control System (Badge Reader)',
        'Verkada Cloud CCTV Surveillance (90-day Cloud Backup)',
        'APC Smart-UPS On-Line Battery Backup Systems',
        'Envoy Workplace Visitor Management Kiosk'
      ],
      dataClassifications: ['Confidential', 'Internal'],
      workLocations: ['Corporate HQ Office'],
      applicableAnnexAControls: [
        'A.7.1 Physical security perimeters',
        'A.7.2 Physical entry',
        'A.7.3 Securing offices, rooms and facilities',
        'A.7.4 Physical security monitoring',
        'A.7.5 Protecting against physical and environmental threats',
        'A.7.6 Working in secure areas',
        'A.7.7 Clear desk and clear screen',
        'A.7.8 Equipment siting and protection',
        'A.7.11 Supporting utilities',
        'A.7.12 Cabling security'
      ],
      applicableIsoClauses: [
        'Clause 4.3 (Physical Scope Boundaries)',
        'Clause 8.1 (Operational Control)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021/2024'],
      threatVectors: [
        'Tailgating / unauthorized physical intruder entering server closet',
        'HVAC failure causing thermal shutdown of network racks',
        'Unescorted visitor viewing confidential whiteboard diagrams'
      ],
      policyRequirements: [
        {
          id: 'pr_fac_1',
          docCode: 'ARP_ISMS_P19',
          title: 'Physical & Environmental Perimeter Security Policy',
          type: 'POLICY',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.7.1 / A.7.4',
          status: 'Compliant & Approved',
          assignedOwner: 'Antonio Silva',
          version: '1.5',
          lastAuditDate: '2026-07-12',
          nextReviewDate: '2027-07-12',
          implementationNotes: 'All physical server closets require dual badge authentication.'
        },
        {
          id: 'pr_fac_2',
          docCode: 'ARP_ISMS_PR12',
          title: 'Physical Facility Visitor Logging & Badge Escort SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.7.2 / A.7.3',
          status: 'Compliant & Approved',
          assignedOwner: 'Antonio Silva',
          version: '1.2',
          lastAuditDate: '2026-08-14',
          nextReviewDate: '2027-08-14',
          implementationNotes: 'Envoy digital visitor register signed with NDA acknowledgment.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 91,
      auditorNotes: 'Well-maintained physical security perimeters and clean desk spot audits.',
      updatedAt: timestamp
    },
    {
      id: 'dept_qa',
      tenantId,
      name: 'Quality Assurance & Test Automation',
      category: 'Technology',
      isInScope: true,
      leadOwner: 'Pooja Sharma (Head of QA & Governance)',
      leadEmail: 'qa.lead@skanda.local',
      headcount: 12,
      scopeBoundary: 'Automated test pipelines, regression test suites, performance benchmark environments, test data sanitization, and release sign-off gating.',
      coreProcesses: [
        'Automated regression testing in CI/CD pipeline',
        'Synthetic test data generation & sanitization (zero live PII in staging)',
        'Security regression test execution prior to major releases',
        'Defect classification and SLA tracking in Jira'
      ],
      criticalAssetsAndSystems: [
        'TestRail Enterprise QA Management',
        'Cypress / Playwright E2E Test Cluster',
        'Synthetic Faker Data Pipeline'
      ],
      dataClassifications: ['Internal', 'Public'],
      workLocations: ['Remote (100% Cloud)', 'Hybrid'],
      applicableAnnexAControls: [
        'A.8.29 Security testing in development and acceptance',
        'A.8.31 Separation of development, test and production environments',
        'A.8.33 Test information'
      ],
      applicableIsoClauses: [
        'Clause 8.1 (Operational Planning)',
        'Clause 9.1 (Monitoring & Measurement)'
      ],
      applicableFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021/2024'],
      threatVectors: [
        'Copying live production database into QA test environment',
        'Undetected critical security bug leaking into production build'
      ],
      policyRequirements: [
        {
          id: 'pr_qa_1',
          docCode: 'ARP_ISMS_PR13',
          title: 'Test Data Masking & Synthetic Data Generation SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.33',
          status: 'Compliant & Approved',
          assignedOwner: 'Pooja Sharma',
          version: '1.4',
          lastAuditDate: '2026-06-15',
          nextReviewDate: '2027-06-15',
          implementationNotes: 'Faker synthetic data engine enforced across all test databases.'
        },
        {
          id: 'pr_qa_2',
          docCode: 'ARP_ISMS_PR07',
          title: 'Secure Software Development Lifecycle (SSDLC) SOP',
          type: 'SOP',
          mandatory: true,
          isoClause: 'Clause 8.1',
          annexAControl: 'A.8.25 / A.8.29',
          status: 'Compliant & Approved',
          assignedOwner: 'Pooja Sharma',
          version: '2.4',
          lastAuditDate: '2026-08-15',
          nextReviewDate: '2027-08-15',
          implementationNotes: 'Automated test suite must pass 100% before production deploy.'
        }
      ],
      maturityLevel: 4,
      readinessScore: 92,
      auditorNotes: 'Strict data sanitization and automated test verification.',
      updatedAt: timestamp
    }
  ];
}
