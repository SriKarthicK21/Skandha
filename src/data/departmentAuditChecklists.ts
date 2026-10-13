// Authoritative Department-Wise External Audit Checklists & PBC Master Data
// Covering ISO/IEC 27001:2022, SOC 2 Type II, ISO/IEC 42001:2023, MAS TRM 2024, and GDPR/SOX ITGC
// Designed for Big 4 & Leading Certification Body (BSI, SGS, TÜV, Schellman) Audits

export interface DepartmentPBCItem {
  id: string;
  code: string;
  title: string;
  description: string;
  itemType: 'Mandatory Record' | 'Policy & Standard' | 'Technical Log / Config' | 'Test / Drill Report' | 'Meeting Minutes & Sign-off' | 'Third-Party Attestation';
  requiredFormat: string;
  submissionCadence: 'Real-Time / Live' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Per Release' | 'Ad-Hoc / Triggered';
  minimumSampleSize: string;
  standardMappings: Array<{ standard: string; clauseOrControl: string }>;
  auditorTestingProcedure: string;
  deficiencySeverityIfMissing: 'Major Non-Conformity' | 'Minor Non-Conformity' | 'Opportunity for Improvement (OFI)' | 'Qualified Opinion (SOC 2)';
  defaultStatus: 'Verified & Submitted' | 'Prepared' | 'In Progress' | 'Missing / Gap';
  implementerTip: string;
}

export interface DepartmentInterviewQA {
  question: string;
  targetRole: string;
  modelAnswer: string;
  fatalTrapAnswer: string;
  backingArtifact: string;
}

export interface DepartmentAuditProfile {
  departmentId: string;
  departmentName: string;
  shortName: string;
  category: 'Technology' | 'Risk & Security' | 'People & Operations' | 'Corporate & Finance' | 'Commercial & Growth';
  leadAuditorScrutinyLevel: 'CRITICAL_HIGH' | 'VERY_HIGH' | 'HIGH' | 'MEDIUM_HIGH';
  headRole: string;
  auditeeRoles: string[];
  mandatedStandards: string[];
  auditorWalkthroughScope: string;
  keyInquiryQuestions: string[];
  commonAuditTrapsAndRedFlags: string[];
  liveDemonstrationRequirements: string[];
  sampleInterviewQA: DepartmentInterviewQA[];
  pbcItems: DepartmentPBCItem[];
}

export const DEPARTMENT_AUDIT_CHECKLISTS: DepartmentAuditProfile[] = [
  // =========================================================================
  // 1. TECHNOLOGY: Information Technology (IT Operations)
  // =========================================================================
  {
    departmentId: 'dept_it',
    departmentName: 'Information Technology (IT Operations)',
    shortName: 'IT Operations',
    category: 'Technology',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Director of IT Operations / Infrastructure Manager',
    auditeeRoles: ['IT Systems Administrator', 'Helpdesk Lead', 'Network Engineer'],
    mandatedStandards: ['ISO 27001:2022 (A.5.9, A.5.15, A.8.1, A.8.19)', 'SOC 2 (CC6.1, CC6.2, CC6.6)', 'MAS TRM Sec 4.0 & 8.0'],
    auditorWalkthroughScope: 'Auditors inspect hardware/software asset inventories, endpoint security posture, mobile device management (MDM), privileged credential management, quarterly access recertifications, network segmentation, and patch deployment SLAs.',
    keyInquiryQuestions: [
      'How is the IT asset inventory kept up to date and reconciled with actual devices touching company data?',
      'Show me how full disk encryption is enforced and monitored across remote laptops.',
      'Demonstrate the quarterly user access review process for core IT infrastructure.'
    ],
    commonAuditTrapsAndRedFlags: [
      'Unenrolled personal devices accessing corporate systems without MDM certificate checks.',
      'Shared or generic IT administrator accounts without individual accountability.',
      'Laptops missing BitLocker/FileVault encryption or disabled screen saver lockouts.'
    ],
    liveDemonstrationRequirements: [
      'Live MDM (Intune / Jamf) dashboard showing 100% disk encryption and remote wipe capability',
      'Active Directory / Okta user directory showing MFA enforcement status across staff',
      'Patch management compliance dashboard showing OS patches applied within 30-day SLA'
    ],
    sampleInterviewQA: [
      {
        question: 'What happens to a corporate laptop if an employee reports it lost or stolen?',
        targetRole: 'IT Systems Administrator',
        modelAnswer: 'The incident is logged in Jira ITSM immediately. IT issues a remote wipe command via Jamf/Intune within 15 minutes, revokes all SSO tokens and active sessions, changes user credentials, and files a report with the CSIRT to assess potential data exposure.',
        fatalTrapAnswer: 'We ask the employee to look for it, and if not found in a week, we order a replacement.',
        backingArtifact: 'MDM Remote Wipe Command Audit Log + Incident Escalation Ticket'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-IT-001',
        code: 'IT-01',
        title: 'Master Hardware & Software CMDB Asset Inventory',
        description: 'Complete, reconciled listing of all servers, workstations, network appliances, and authorized software with assigned owners, serials, and OS versions.',
        itemType: 'Mandatory Record',
        requiredFormat: 'CSV / CMDB Export with Date-Stamp',
        submissionCadence: 'Quarterly',
        minimumSampleSize: '100% of Active Infrastructure',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.9, A.5.10' }, { standard: 'SOC 2', clauseOrControl: 'CC6.1' }],
        auditorTestingProcedure: 'Auditor selects a sample of 25 physical serial numbers from purchase records and traces them to the active inventory, and vice-versa.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure cloud VMs and decommissioned legacy laptops are clearly marked with disposal/archive dates.'
      },
      {
        id: 'PBC-IT-002',
        code: 'IT-02',
        title: 'Endpoint Protection & Disk Encryption Verification Report',
        description: 'Centralized MDM/EDR telemetry export demonstrating 100% coverage of BitLocker/FileVault encryption, password complexity, and 15-minute screen lockouts.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'Signed MDM Compliance Report (PDF)',
        submissionCadence: 'Monthly',
        minimumSampleSize: '100% of Enrolled Endpoints',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.1, A.7.7' }, { standard: 'SOC 2', clauseOrControl: 'CC6.6' }],
        auditorTestingProcedure: 'Auditor inspects MDM policy profile settings and samples 15 user endpoints to confirm active encryption status and zero policy deviations.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Filter out dormant or retired devices before exporting to avoid false compliance flags.'
      },
      {
        id: 'PBC-IT-003',
        code: 'IT-03',
        title: 'Quarterly User Access Recertification Sign-Offs',
        description: 'Documented evidence of system owners reviewing and certifying active user accounts across Active Directory, VPN, and server bastion hosts.',
        itemType: 'Meeting Minutes & Sign-off',
        requiredFormat: 'Signed PDF / Access Review Workflow Audit Trail',
        submissionCadence: 'Quarterly',
        minimumSampleSize: '4 Quarters (1 per Quarter)',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.18' }, { standard: 'SOC 2', clauseOrControl: 'CC6.2, CC6.3' }],
        auditorTestingProcedure: 'Auditor verifies that all 4 quarters were completed on time and reconciles termination lists against active account rosters.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Include manager approval timestamps and specific revocation actions for transferred/departed staff.'
      }
    ]
  },

  // =========================================================================
  // 2. TECHNOLOGY: Software Engineering & Cloud DevOps
  // =========================================================================
  {
    departmentId: 'dept_dev',
    departmentName: 'Software Engineering & Cloud DevOps',
    shortName: 'DevOps & Engineering',
    category: 'Technology',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'VP of Engineering / Principal Cloud Architect',
    auditeeRoles: ['Lead DevOps Engineer', 'Senior Backend Engineer', 'Release Manager'],
    mandatedStandards: ['ISO 27001:2022 (A.8.25, A.8.28, A.8.31, A.8.32)', 'SOC 2 (CC8.1)', 'MAS TRM Sec 7.0 & 9.0'],
    auditorWalkthroughScope: 'Auditors evaluate source code security, CI/CD pipeline gating, branch protection enforcement, automated vulnerability scans, segregation of duties between coding and deployment, and production change control.',
    keyInquiryQuestions: [
      'Can any engineer bypass peer review and push code directly to production branches?',
      'Show me how automated SAST/DAST tools block pipeline builds when high-severity CVSS vulnerabilities are detected.',
      'How are production cloud secrets, API tokens, and database credentials protected from developer repositories?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Pull requests merged by the author with self-approval or no independent reviewer.',
      'Hardcoded plaintext credentials, private keys, or API secrets found in Git repository history.',
      'Developers having direct SSH/root write access to production database and server instances.'
    ],
    liveDemonstrationRequirements: [
      'GitHub / GitLab branch protection rule screen proving 2-person review is enforced on main/release',
      'SonarQube / Snyk CI/CD quality gate blocking a sample vulnerable pull request',
      'AWS Secrets Manager / HashiCorp Vault console proving secrets are dynamically injected'
    ],
    sampleInterviewQA: [
      {
        question: 'Under what circumstances can a developer deploy changes directly to the live production server?',
        targetRole: 'DevOps Architect',
        modelAnswer: 'Never directly. All production deployments must originate from a merged GitHub release tag through our automated CI/CD pipeline after automated tests and peer approvals pass. In emergency hotfix situations, an expedited change ticket is required with post-implementation review.',
        fatalTrapAnswer: 'Senior engineers have bastion access and can push urgent hotfixes using SSH.',
        backingArtifact: 'GitHub Branch Protection JSON Config + Jira Emergency Change Sample'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-DEV-001',
        code: 'DEV-01',
        title: 'Source Code Repository Branch Protection & 2-Person Rule Proof',
        description: 'Configuration export of repository settings showing required pull request approvals, dismissal of stale reviews, and linear Git commit history.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'API Export / Repository Settings Screenshots (PDF)',
        submissionCadence: 'Quarterly',
        minimumSampleSize: '100% of Production Repositories',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.25, A.8.28' }, { standard: 'SOC 2', clauseOrControl: 'CC8.1' }],
        auditorTestingProcedure: 'Auditor tests 25 random production pull requests to verify independent approver signatures and zero self-approvals.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure repository admin accounts do not have "Include Administrators" unchecked in branch protection.'
      },
      {
        id: 'PBC-DEV-002',
        code: 'DEV-02',
        title: 'CI/CD Automated Security Vulnerability Gating Logs',
        description: 'Automated build pipeline logs demonstrating Static Application Security Testing (SAST) and Software Bill of Materials (SBOM) dependency scans with blocking thresholds.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'CI/CD Pipeline Execution Logs + Vulnerability Scan Summaries',
        submissionCadence: 'Per Release',
        minimumSampleSize: '25 Production Releases across Audit Period',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.28, A.8.8' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 7.3' }],
        auditorTestingProcedure: 'Auditor reviews scanner logs for 25 releases to confirm no unresolved High or Critical vulnerabilities were deployed.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Retain pipeline logs for at least 12 months in immutable cloud storage.'
      },
      {
        id: 'PBC-DEV-003',
        code: 'DEV-03',
        title: 'Production Change Advisory Board (CAB) Deployment Records',
        description: 'Documented Jira deployment tickets showing business justification, test results, rollback plans, and formal CAB sign-off prior to production rollout.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Jira Change Ticket Export (PDF/CSV)',
        submissionCadence: 'Per Release',
        minimumSampleSize: '25 Change Tickets (AICPA Standard)',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.32' }, { standard: 'SOC 2', clauseOrControl: 'CC8.1' }],
        auditorTestingProcedure: 'Auditor verifies presence of rollback plans, post-release test sign-offs, and independent manager approval for each sampled ticket.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Tag emergency hotfixes separately and provide retrospective incident reviews for each.'
      }
    ]
  },

  // =========================================================================
  // 3. TECHNOLOGY: Data Science, AI & Machine Learning Engineering
  // =========================================================================
  {
    departmentId: 'dept_ds',
    departmentName: 'Data Science & Machine Learning AI',
    shortName: 'AI & Data Science',
    category: 'Technology',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Chief AI Officer / Head of Data Science & ML',
    auditeeRoles: ['Lead ML Engineer', 'Data Governance Specialist', 'AI Safety Researcher'],
    mandatedStandards: ['ISO 42001:2023 (Cl 6.1.4, Cl 8.3, Cl 8.4, Annex A.7)', 'EU AI Act High-Risk Rules', 'MAS FEAT Principles'],
    auditorWalkthroughScope: 'Auditors examine AI System Impact Assessments (AI-SIA), training data lineage, PII scrubbing verification, model bias and disparate impact metrics, model registry versioning, and LLM guardrails.',
    keyInquiryQuestions: [
      'What formal risk assessment is performed before training or deploying a new machine learning model into production?',
      'Show me how training datasets are verified to be free of copyright infringements and unconsented customer PII.',
      'Demonstrate how continuous model drift, hallucination rates, and adversarial prompt injection are monitored.'
    ],
    commonAuditTrapsAndRedFlags: [
      'Using live customer production data for training models without synthetic anonymization or customer consent.',
      'Deploying LLMs without adversarial prompt-injection test reports or guardrail filtering configurations.',
      'Inability to produce Model Cards or feature attribution records explaining automated algorithmic outcomes.'
    ],
    liveDemonstrationRequirements: [
      'MLflow / Weights & Biases model registry showing immutable model versions and training hashes',
      'Great Expectations or data validation pipeline showing automated PII scrubbing checks',
      'Fairlearn / AIF360 demographic parity dashboard showing bias thresholds within acceptable bounds'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure customer PII submitted via prompts does not end up training foundation models?',
        targetRole: 'Head of AI Engineering',
        modelAnswer: 'We enforce enterprise Zero-Data-Retention (ZDR) agreements with third-party LLM API providers. On the client side, our ingestion pipeline strips PII using Presidio before dispatch, and tokens are encrypted with ephemeral keys.',
        fatalTrapAnswer: 'We tell users in the privacy policy not to type sensitive personal data into the chat.',
        backingArtifact: 'LLM Vendor Zero-Retention Addendum + Automated Sanitization Pipeline Script'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-DS-001',
        code: 'DS-01',
        title: 'AI System Impact Assessment (AI-SIA) Dossiers',
        description: 'Completed risk assessments for all production AI models evaluating societal, bias, safety, privacy, and cybersecurity risks under ISO 42001 Clause 6.1.4.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Signed AI-SIA Evaluation Pack (PDF)',
        submissionCadence: 'Per Release',
        minimumSampleSize: '100% of Production AI Models',
        standardMappings: [{ standard: 'ISO 42001:2023', clauseOrControl: 'Cl 6.1.4, Annex A.6' }],
        auditorTestingProcedure: 'Auditor inspects assessments for all active models to verify ethical risk scoring and executive sign-off prior to deployment.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure high-impact automated decision models have documented human-in-the-loop oversight paths.'
      },
      {
        id: 'PBC-DS-002',
        code: 'DS-02',
        title: 'Training Data Provenance & Anonymization Audit Logs',
        description: 'Audit logs proving that training and fine-tuning datasets were scrubbed of PII and obtained under valid commercial licensing terms.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'Data Lineage Graph + Data Cleansing Execution Report',
        submissionCadence: 'Per Release',
        minimumSampleSize: 'Sample of All Fine-Tuned Datasets',
        standardMappings: [{ standard: 'ISO 42001:2023', clauseOrControl: 'Annex A.7.2, A.7.4' }, { standard: 'GDPR', clauseOrControl: 'Art. 5(1)(c)' }],
        auditorTestingProcedure: 'Auditor traces raw training data sources through the anonymization pipeline to verify that PII regex and masking executed cleanly.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Maintain SHA-256 checksums of raw and sanitized training datasets for forensic verification.'
      },
      {
        id: 'PBC-DS-003',
        code: 'DS-03',
        title: 'Algorithmic Fairness, Bias & Demographic Parity Reports',
        description: 'Empirical testing results proving that model predictions do not produce disparate impact across protected demographic groups (demographic parity ratio >= 0.80).',
        itemType: 'Test / Drill Report',
        requiredFormat: 'Fairness Benchmark Analysis Report (PDF/HTML)',
        submissionCadence: 'Quarterly',
        minimumSampleSize: 'All High-Impact Decision Models',
        standardMappings: [{ standard: 'ISO 42001:2023', clauseOrControl: 'Annex A.8.4' }, { standard: 'MAS FEAT', clauseOrControl: 'Fairness Pillar' }],
        auditorTestingProcedure: 'Auditor reviews demographic parity and equalized odds metrics against internal policy thresholds.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Document mitigation steps taken whenever initial tests reveal disparate impact scores below 0.80.'
      }
    ]
  },

  // =========================================================================
  // 4. TECHNOLOGY: Site Reliability Engineering (SRE) & Cloud Infrastructure
  // =========================================================================
  {
    departmentId: 'dept_sre',
    departmentName: 'Site Reliability Engineering (SRE) & Cloud Infrastructure',
    shortName: 'SRE & Cloud Infra',
    category: 'Technology',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Head of SRE & Cloud Infrastructure',
    auditeeRoles: ['Lead SRE Engineer', 'Cloud Network Architect', 'On-Call Incident Commander'],
    mandatedStandards: ['ISO 27001:2022 (A.8.14, A.8.20, A.8.22)', 'SOC 2 (CC7.1, CC7.2, A1.2)', 'MAS TRM Sec 8.0 & 11.0'],
    auditorWalkthroughScope: 'Auditors review cloud infrastructure as code (Terraform), high-availability architecture, DDoS protection, uptime SLA metrics (99.9%), on-call escalation schedules, and post-mortem incident analyses.',
    keyInquiryQuestions: [
      'Show me the historical uptime dashboard and prove that system availability met customer SLA commitments over the last 12 months.',
      'Walk me through the post-mortem analysis of your most severe P1 production outage.',
      'Show me how network perimeter segmentation and VPC security groups are audited for unauthorized open ports.'
    ],
    commonAuditTrapsAndRedFlags: [
      'Security groups configured with wide open ingress (0.0.0.0/0) on management ports (SSH 22, RDP 3389).',
      'P1 or P2 outages closed without a formal root-cause analysis (RCA) document or tracked corrective actions.',
      'Manual infrastructure modifications applied outside of version-controlled Terraform/IaC scripts.'
    ],
    liveDemonstrationRequirements: [
      'Datadog / Grafana uptime monitoring dashboard showing 99.9%+ availability and MTTR/MTTD metrics',
      'AWS / GCP Cloud Console showing security group ingress rules restricted to VPN/NAT gateways',
      'PagerDuty on-call rotation schedule showing primary and secondary responder coverage'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you track and remediate infrastructure configuration drift in AWS/GCP?',
        targetRole: 'Principal SRE Engineer',
        modelAnswer: 'All cloud infrastructure is managed strictly via Terraform with state locked in AWS S3. Automated daily Terraform plan jobs detect any drift and alert the SRE channel. Manual console modifications trigger immediate AWS CloudTrail alerts.',
        fatalTrapAnswer: 'Engineers occasionally make manual tweaks in the AWS console and update Terraform later.',
        backingArtifact: 'Terraform Drift Detection Log + CloudTrail Console Write Alert Webhook'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-SRE-001',
        code: 'SRE-01',
        title: 'System Uptime, Latency & SLA Telemetry Reports',
        description: 'Comprehensive historical reporting from APM tools proving 99.9% availability, error budget consumption, and SLA compliance over the audit period.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'Signed APM SLA Monthly Telemetry Pack (PDF)',
        submissionCadence: 'Monthly',
        minimumSampleSize: '12 Months Historical Data',
        standardMappings: [{ standard: 'SOC 2', clauseOrControl: 'A1.1, A1.2' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 11.2' }],
        auditorTestingProcedure: 'Auditor cross-references outage tickets with uptime telemetry to verify all downtime events were accurately recorded.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure planned maintenance windows are categorized separately from unscheduled outages.'
      },
      {
        id: 'PBC-SRE-002',
        code: 'SRE-02',
        title: 'Major Incident Post-Mortem (RCA) Dossiers',
        description: 'Detailed root-cause analysis reports for all P1 and P2 outages detailing timeline, impact, contributing factors, and verified CAPA tickets.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Blameless Post-Mortem Reports (PDF)',
        submissionCadence: 'Ad-Hoc / Triggered',
        minimumSampleSize: '100% of P1/P2 Incidents',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.28, Clause 10.1' }, { standard: 'SOC 2', clauseOrControl: 'CC7.3' }],
        auditorTestingProcedure: 'Auditor tests whether all corrective action items from post-mortems were closed and verified by management.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Include timestamped chat transcripts and monitoring graphs in post-mortem appendices.'
      }
    ]
  },

  // =========================================================================
  // 5. TECHNOLOGY: Database Administration (DBA)
  // =========================================================================
  {
    departmentId: 'dept_dba',
    departmentName: 'Database Administration (DBA) & Storage',
    shortName: 'Database Admin',
    category: 'Technology',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Lead Database Administrator / Data Platform Architect',
    auditeeRoles: ['Senior DBA', 'Cloud Storage Specialist'],
    mandatedStandards: ['ISO 27001:2022 (A.8.11, A.8.12, A.8.13, A.8.24)', 'SOC 2 (CC6.1, CC6.6, A1.2)', 'MAS TRM Sec 10.0'],
    auditorWalkthroughScope: 'Auditors inspect database backup automation, immutable backup retention, quarterly backup restoration drills with RTO/RPO verification, encryption-at-rest (AES-256), and database audit logging.',
    keyInquiryQuestions: [
      'How do you mathematically verify that daily database backups are not corrupted and can be restored within your RTO SLA?',
      'Show me proof of the most recent quarterly disaster recovery database restore drill.',
      'Show me database access logs and prove that direct queries by DBAs are logged and reviewed.'
    ],
    commonAuditTrapsAndRedFlags: [
      'Backups taken daily but never restored in a test environment during the past 12 months.',
      'Backup snapshots stored in the same cloud account and region with no immutable cross-region replica.',
      'Database master password shared among team members or stored unencrypted.'
    ],
    liveDemonstrationRequirements: [
      'AWS RDS / Cloud SQL backup dashboard showing automated snapshot schedule and KMS encryption',
      'Terminal execution log of the last quarterly restoration drill proving RTO was under 4 hours',
      'Database audit plugin (pgAudit / MySQL Audit) showing DDL and administrative command logging'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure ransomware cannot delete or encrypt your database backup snapshots?',
        targetRole: 'Lead DBA',
        modelAnswer: 'Our database snapshots are replicated cross-region into an isolated AWS backup vault protected by AWS Backup Vault Lock in Compliance Mode. This enforces immutable WORM retention; even AWS root accounts cannot delete snapshots before the 90-day retention expires.',
        fatalTrapAnswer: 'We take daily snapshots in the same account and keep them for 30 days.',
        backingArtifact: 'AWS Backup Vault Lock Compliance Policy JSON + Cross-Region Replication Proof'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-DBA-001',
        code: 'DBA-01',
        title: 'Quarterly Backup Restoration Drill Reports & RTO/RPO Measurements',
        description: 'Comprehensive test records proving end-to-end database restoration into an isolated VPC with data integrity checksum validation and exact recovery duration.',
        itemType: 'Test / Drill Report',
        requiredFormat: 'Signed DR Restoration Drill Report (PDF)',
        submissionCadence: 'Quarterly',
        minimumSampleSize: '4 Quarterly Restoration Drills',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.13' }, { standard: 'SOC 2', clauseOrControl: 'A1.2' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 10.1' }],
        auditorTestingProcedure: 'Auditor checks that tested RTO is within published SLA (<4 hours) and that sample data validation queries matched original checksums.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Record start and completion timestamps down to the second and have the Lead DBA and CISO co-sign.'
      },
      {
        id: 'PBC-DBA-002',
        code: 'DBA-02',
        title: 'Database Encryption at Rest & Key Management Proof',
        description: 'Cryptographic configuration showing all production databases, tablespaces, and transaction logs encrypted using AES-256 Customer Managed Keys (CMK).',
        itemType: 'Technical Log / Config',
        requiredFormat: 'KMS Configuration Export + DB Encryption Status (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of Production Databases',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.24' }, { standard: 'SOC 2', clauseOrControl: 'CC6.6' }],
        auditorTestingProcedure: 'Auditor inspects AWS KMS key policies and verifies automatic annual rotation is enabled.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Include proof that database read-replicas and backup snapshots inherit the same CMK encryption.'
      }
    ]
  },

  // =========================================================================
  // 6. TECHNOLOGY: Quality Assurance (QA) & Test Automation
  // =========================================================================
  {
    departmentId: 'dept_qa',
    departmentName: 'Quality Assurance (QA) & Test Automation',
    shortName: 'QA & Testing',
    category: 'Technology',
    leadAuditorScrutinyLevel: 'HIGH',
    headRole: 'Head of Quality Assurance / Test Automation Manager',
    auditeeRoles: ['Lead QA Automation Engineer', 'SDET Engineer'],
    mandatedStandards: ['ISO 27001:2022 (A.8.29, A.8.31, A.8.33)', 'SOC 2 (CC8.1)'],
    auditorWalkthroughScope: 'Auditors verify that test environments do not contain live customer PII, automated regression suites run before every release, and security defects are tracked to resolution before production releases.',
    keyInquiryQuestions: [
      'Do non-production test environments contain any real customer PII or payment card details?',
      'Show me how automated regression test suites gate production releases.',
      'What happens if a high-severity functional or security bug is identified during pre-release testing?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Direct copy of production database into staging/test without masking or obfuscation.',
      'Releases deployed with known unresolved critical test defects without risk sign-off.',
      'Lack of test execution evidence or sign-offs for releases deployed during the audit period.'
    ],
    liveDemonstrationRequirements: [
      'Synthetic test data generator tool or data masking script execution log',
      'Test management dashboard (TestRail / Jira Xray) showing release test execution pass rates (>98%)'
    ],
    sampleInterviewQA: [
      {
        question: 'Where do you obtain the data used for performance and regression testing?',
        targetRole: 'QA Automation Lead',
        modelAnswer: 'We exclusively use synthetically generated mock data created by automated scripts, or sanitized datasets processed through automated anonymization pipelines where all PII, emails, and identifiers are masked before reaching staging.',
        fatalTrapAnswer: 'We restore a backup of last week’s production database to staging so the data looks realistic.',
        backingArtifact: 'Data Masking Pipeline Script + Test Data Governance Policy'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-QA-001',
        code: 'QA-01',
        title: 'Non-Production Test Data Sanitization Verification Records',
        description: 'Evidence proving that databases in staging, QA, and developer environments are sanitized of all real customer PII and sensitive data.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'Data Masking Validation Report + Synthetic Data Generator Script',
        submissionCadence: 'Quarterly',
        minimumSampleSize: 'All Non-Production Environments',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.31' }, { standard: 'GDPR', clauseOrControl: 'Art. 32' }],
        auditorTestingProcedure: 'Auditor queries staging tables for recognizable customer emails and verifies all records are masked or synthetically generated.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Perform automated regex scans for SSNs, credit cards, and emails across non-prod databases.'
      },
      {
        id: 'PBC-QA-002',
        code: 'QA-02',
        title: 'Pre-Release Test Execution & Defect Sign-Off Records',
        description: 'Test summary reports demonstrating automated and manual test pass rates, regression results, and QA lead sign-offs for production releases.',
        itemType: 'Mandatory Record',
        requiredFormat: 'TestRail / Jira Xray Release Test Summary (PDF)',
        submissionCadence: 'Per Release',
        minimumSampleSize: '25 Sample Releases',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.29' }, { standard: 'SOC 2', clauseOrControl: 'CC8.1' }],
        auditorTestingProcedure: 'Auditor samples 25 production releases and confirms all test cases passed or waivers were formally approved by management.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Ensure test sign-off timestamps precede the production deployment timestamps.'
      }
    ]
  },

  // =========================================================================
  // 7. SECURITY & RISK: Information Security & Cyber SOC
  // =========================================================================
  {
    departmentId: 'dept_sec',
    departmentName: 'Information Security & Cyber SOC',
    shortName: 'InfoSec & SOC',
    category: 'Risk & Security',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Chief Information Security Officer (CISO) / SOC Manager',
    auditeeRoles: ['Lead SOC Analyst', 'Incident Commander', 'Vulnerability Management Lead'],
    mandatedStandards: ['ISO 27001:2022 (A.5.7, A.5.24, A.8.8, A.8.15, A.8.16)', 'SOC 2 (CC7.1-CC7.5)', 'MAS Notice 655 & TRM Sec 12.0'],
    auditorWalkthroughScope: 'Auditors inspect 24/7 SIEM monitoring coverage, 12-month immutable log retention, annual third-party penetration testing reports, vulnerability remediation SLAs, and incident management playbooks.',
    keyInquiryQuestions: [
      'Show me how security logs are retained for at least 12 months in tamper-proof, immutable storage.',
      'Show me the remediation tracking for all High and Critical findings from your last external penetration test.',
      'Walk me through the exact procedure for regulatory notification in the event of a severe security breach.'
    ],
    commonAuditTrapsAndRedFlags: [
      'Penetration test findings older than 90 days with no remediation evidence or approved risk acceptance.',
      'SIEM retention configured for only 30-90 days, directly violating MAS TRM and ISO 27001 mandates.',
      'Incident management procedures without documented 1-hour or 72-hour regulatory notification SLAs.'
    ],
    liveDemonstrationRequirements: [
      'SIEM (Splunk / Datadog / Wazuh) console showing active alert correlation and 12-month retention settings',
      'CrowdStrike / Microsoft Defender EDR console showing 100% agent health across fleet',
      'Vulnerability scanner (Tenable / Qualys / Snyk) showing remediation velocity within SLA'
    ],
    sampleInterviewQA: [
      {
        question: 'Under MAS TRM Notice 655, what is your statutory notification timeframe for a major cyber incident?',
        targetRole: 'CISO / Incident Commander',
        modelAnswer: 'We must notify the Monetary Authority of Singapore (MAS) within 1 hour of discovering a severe cyber incident or major system failure, followed by an exhaustive root-cause investigation report within 14 calendar days.',
        fatalTrapAnswer: 'We notify within 72 hours under GDPR guidelines if customer personal data is stolen.',
        backingArtifact: 'Cyber Incident Response Plan v3.2 + MAS Escalation Contact Card'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-SEC-001',
        code: 'SEC-01',
        title: 'Annual Third-Party Penetration Test & Retesting Remediation Report',
        description: 'CREST/OSCP accredited independent penetration test report covering cloud infrastructure, APIs, and web applications, accompanied by formal remediation verification.',
        itemType: 'Third-Party Attestation',
        requiredFormat: 'Executive & Technical Penetration Test Report (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '1 Comprehensive Annual Test + Retest Letter',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.8' }, { standard: 'SOC 2', clauseOrControl: 'CC7.1' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 8.4' }],
        auditorTestingProcedure: 'Auditor cross-examines all findings rated High or Critical and verifies closure or formal CISO risk acceptance with compensating controls.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Always schedule the re-test immediately following engineering remediation to obtain a clean letter of attestation.'
      },
      {
        id: 'PBC-SEC-002',
        code: 'SEC-02',
        title: 'SIEM 12-Month Immutable Log Retention Proof',
        description: 'Technical configuration proving security event logs from cloud consoles, firewalls, and servers are preserved in WORM immutable storage for >= 365 days.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'AWS S3 Glacier Vault Lock / Splunk Retention Policy Export',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of Core Infrastructure Logs',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.15' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 8.1' }],
        auditorTestingProcedure: 'Auditor queries SIEM for logs from exactly 11 months prior and validates integrity hash verification.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure log archiving is automated and alerts trigger if the daily log ingestion rate drops unexpectedly.'
      },
      {
        id: 'PBC-SEC-003',
        code: 'SEC-03',
        title: 'Annual Incident Response Tabletop Simulation Minutes & Action Items',
        description: 'Documentation of annual executive tabletop exercise simulating ransomware or breach, including scenario, participant log, and identified improvement actions.',
        itemType: 'Meeting Minutes & Sign-off',
        requiredFormat: 'Tabletop Simulation Exercise Minutes Pack (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '1 Annual Simulation Drill',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.24, A.5.26' }, { standard: 'SOC 2', clauseOrControl: 'CC7.3' }],
        auditorTestingProcedure: 'Auditor verifies participation by CISO, Legal, IT, and PR, and checks closure of corrective action tickets.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Include external incident response retainers and insurer notification steps in the drill scenario.'
      }
    ]
  },

  // =========================================================================
  // 8. SECURITY & RISK: Identity & Access Management (IAM)
  // =========================================================================
  {
    departmentId: 'dept_iam',
    departmentName: 'Identity & Access Management (IAM)',
    shortName: 'IAM & Directory',
    category: 'Risk & Security',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Head of IAM / Directory Services Architect',
    auditeeRoles: ['IAM Engineer', 'Okta/Azure AD Administrator', 'PAM Specialist'],
    mandatedStandards: ['ISO 27001:2022 (A.5.15, A.5.16, A.5.17, A.5.18, A.8.5)', 'SOC 2 (CC6.1-CC6.3)', 'MAS TRM Sec 5.0'],
    auditorWalkthroughScope: 'Auditors evaluate multi-factor authentication (MFA) enforcement across all applications, Privileged Access Management (PAM) just-in-time leasing, quarterly access recertifications, and service account key rotation.',
    keyInquiryQuestions: [
      'Is Multi-Factor Authentication (MFA) strictly enforced for 100% of staff and contractors without exception?',
      'Show me how privileged administrator sessions are recorded and credentials checked out via PAM.',
      'Demonstrate how API service account keys are inventoried and rotated annually.'
    ],
    commonAuditTrapsAndRedFlags: [
      'Exemption groups discovered in Okta/Entra ID allowing users to authenticate without MFA.',
      'Service account credentials with permanent admin rights stored in static files without rotation.',
      'Failure to terminate access for transferred employees who changed departments.'
    ],
    liveDemonstrationRequirements: [
      'Okta / Entra ID policy screen showing MFA is globally enforced with zero exclusions',
      'CyberArk / Teleport PAM console showing session recording and just-in-time access elevation'
    ],
    sampleInterviewQA: [
      {
        question: 'Can any employee disable MFA on their corporate account?',
        targetRole: 'Lead IAM Administrator',
        modelAnswer: 'No. MFA is enforced globally via Okta Adaptive MFA with FIDO2 WebAuthn / TOTP. There are zero policy exclusions. In the event of a lost device, temporary bypass requires HR identity verification and is limited to 4 hours with SOC alerting.',
        fatalTrapAnswer: 'Executives and certain offshore developers are exempted from MFA for convenience.',
        backingArtifact: 'Okta Sign-On Policy Configuration Export JSON'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-IAM-001',
        code: 'IAM-01',
        title: 'Global Multi-Factor Authentication (MFA) Enforcement Audit Report',
        description: 'Comprehensive directory export proving 100% active users enforce MFA across email, cloud consoles, VPN, and corporate SaaS applications.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'IdP Authentication Policy Export + Zero-Exclusion Audit Report',
        submissionCadence: 'Monthly',
        minimumSampleSize: '100% of Active User Base',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.17, A.8.5' }, { standard: 'SOC 2', clauseOrControl: 'CC6.1' }],
        auditorTestingProcedure: 'Auditor reviews authentication policies and inspects 25 random user logins for active MFA challenge logs.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure SMS OTP is disabled in favor of hardware security keys or authenticator push tokens.'
      },
      {
        id: 'PBC-IAM-002',
        code: 'IAM-02',
        title: 'Service Account & Machine Credential Inventory with Rotation Proof',
        description: 'Listing of all non-human service accounts, API keys, and IAM roles with assigned owners, business justification, and proof of annual key rotation.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Machine Identity Inventory Register (CSV/PDF)',
        submissionCadence: 'Semi-Annual',
        minimumSampleSize: '100% of Cloud Service Accounts',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.16' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 5.2' }],
        auditorTestingProcedure: 'Auditor verifies that no service account has active access keys older than 365 days in AWS/GCP.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Adopt AWS IAM Roles for Service Accounts (IRSA) to eliminate long-lived static credentials entirely.'
      }
    ]
  },

  // =========================================================================
  // 9. SECURITY & RISK: Business Continuity & Disaster Recovery (BCDR)
  // =========================================================================
  {
    departmentId: 'dept_bcdr',
    departmentName: 'Business Continuity & Disaster Recovery (BCDR)',
    shortName: 'BCDR & Resilience',
    category: 'Risk & Security',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    headRole: 'Head of Business Continuity / Enterprise Resilience Lead',
    auditeeRoles: ['BCP Coordinator', 'Disaster Recovery Lead Architect'],
    mandatedStandards: ['ISO 27001:2022 (A.5.29, A.5.30)', 'SOC 2 (A1.2, A1.3)', 'MAS TRM Sec 10.0'],
    auditorWalkthroughScope: 'Auditors evaluate Business Impact Analysis (BIA) documents, formal RTO and RPO definitions, disaster recovery runbooks, annual failover simulation drill reports, and crisis management communication rosters.',
    keyInquiryQuestions: [
      'When was your last Business Impact Analysis (BIA) conducted and approved by the Executive Board?',
      'Show me the full failover drill results demonstrating primary cloud region outage recovery.',
      'How are emergency contact rosters updated and verified for operational accuracy?'
    ],
    commonAuditTrapsAndRedFlags: [
      'BCP/DR plans that have not been tested or updated within the last 12 months.',
      'Tested recovery time exceeding the agreed business RTO without documented mitigation.',
      'Emergency notification chains with outdated personnel or disconnected phone numbers.'
    ],
    liveDemonstrationRequirements: [
      'Annual DR Failover Drill Execution Logs showing traffic diversion to secondary region',
      'Automated crisis notification system (Everbridge / AlertMedia) test message broadcast log'
    ],
    sampleInterviewQA: [
      {
        question: 'What are your formal Recovery Time Objective (RTO) and Recovery Point Objective (RPO) for core services?',
        targetRole: 'Disaster Recovery Lead',
        modelAnswer: 'For Tier 1 customer-facing services, our RTO is 4 hours and RPO is 15 minutes. For Tier 2 internal services, RTO is 24 hours and RPO is 4 hours. These targets are documented in our Board-approved BIA and verified annually during our DR drill.',
        fatalTrapAnswer: 'We hope to be back online as fast as possible, usually within a day or two.',
        backingArtifact: 'Business Impact Analysis (BIA) v2.4 + Annual DR Drill Sign-Off Report'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-BCDR-001',
        code: 'BCDR-01',
        title: 'Business Impact Analysis (BIA) & System Tiering Matrix',
        description: 'Comprehensive assessment defining criticality tiers, maximum tolerable downtime (MTD), RTO, and RPO for all business processes and technical assets.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Board-Approved BIA Pack (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of Core Business Services',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.29' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 10.1' }],
        auditorTestingProcedure: 'Auditor confirms BIA covers external dependencies and was reviewed and approved within the past 12 months.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure financial and operational impact thresholds are signed off by the CFO and CISO.'
      },
      {
        id: 'PBC-BCDR-002',
        code: 'BCDR-02',
        title: 'Annual Disaster Recovery Failover Simulation Drill Report',
        description: 'End-to-end technical drill documentation showing simulated outage of primary data center/cloud region, DNS failover, and user validation.',
        itemType: 'Test / Drill Report',
        requiredFormat: 'Signed Annual DR Drill Execution Report (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '1 Annual Failover Drill',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.30' }, { standard: 'SOC 2', clauseOrControl: 'A1.2' }],
        auditorTestingProcedure: 'Auditor checks that tested recovery time was strictly within the RTO target and that all deviations resulted in tracked corrective action tickets.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Include automated synthetic user transaction logs demonstrating data integrity after failover.'
      }
    ]
  },

  // =========================================================================
  // 10. PEOPLE & OPERATIONS: Human Resources & People Operations
  // =========================================================================
  {
    departmentId: 'dept_hr',
    departmentName: 'Human Resources & People Operations',
    shortName: 'HR & People Ops',
    category: 'People & Operations',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    headRole: 'Chief Human Resources Officer (CHRO) / Head of People',
    auditeeRoles: ['HR Operations Manager', 'Talent Lead', 'Employee Relations Specialist'],
    mandatedStandards: ['ISO 27001:2022 (A.6.1, A.6.2, A.6.4, A.6.5)', 'SOC 2 (CC1.4, CC2.2, CC6.2)', 'MAS TRM Sec 3.2'],
    auditorWalkthroughScope: 'Auditors inspect pre-employment background screening files, signed confidentiality agreements (NDA), security and acceptable use policy acknowledgements, and 24-hour offboarding access deprovisioning tickets.',
    keyInquiryQuestions: [
      'Show me the background check files for the last 5 employees hired, including contractors.',
      'Show me the offboarding records and IT ticket timestamps for the last 3 employees who left the organization.',
      'What disciplinary process is followed when an employee commits an information security violation?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Hiring contractors without criminal background checks or signed non-disclosure agreements.',
      'Offboarded employee retaining active corporate email or GitHub access days after termination.',
      'Lack of signed Acceptable Use Policy (AUP) acknowledgements in personnel files.'
    ],
    liveDemonstrationRequirements: [
      'Third-party background check agency portal showing screening completion certificates',
      'Jira ITSM Offboarding workflow showing automated access revocation timestamps (<24 hrs)'
    ],
    sampleInterviewQA: [
      {
        question: 'What is your procedure when an employee is involuntarily terminated for cause?',
        targetRole: 'HR Director',
        modelAnswer: 'HR coordinates directly with IT and Security prior to the termination meeting. All SSO, email, VPN, and building badge access are revoked simultaneously with the meeting. Personal items are supervised, hardware collected, and an exit NDA reaffirmation is executed.',
        fatalTrapAnswer: 'HR emails IT at the end of the day or adds the name to the Friday offboarding list.',
        backingArtifact: 'Immediate Termination Procedure SOP + Jira Timestamped Revocation Log'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-HR-001',
        code: 'HR-01',
        title: 'Pre-Employment Background Verification & Screening Packages',
        description: 'Completed third-party verification packages covering identity, criminal history, highest education, and reference checks for newly onboarded personnel.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Redacted Background Screening Certificates (PDF)',
        submissionCadence: 'Ad-Hoc / Triggered',
        minimumSampleSize: 'Sample of 15 New Hires (including Contractors)',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.6.1' }, { standard: 'SOC 2', clauseOrControl: 'CC1.4' }],
        auditorTestingProcedure: 'Auditor reconciles hire dates against background check completion dates to confirm screening finished prior to system access grant.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure background check vendor agreements include right-to-audit and GDPR/FCRA compliance terms.'
      },
      {
        id: 'PBC-HR-002',
        code: 'HR-02',
        title: 'Signed NDAs & Acceptable Use Policy (AUP) Acknowledgements',
        description: 'Legally binding confidentiality agreements and annual AUP acknowledgements signed by all active employees, contractors, and executives.',
        itemType: 'Mandatory Record',
        requiredFormat: 'DocuSign / HRIS Signed Acknowledgment Log',
        submissionCadence: 'Annual',
        minimumSampleSize: 'Sample of 25 Employees across All Departments',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.6.2' }, { standard: 'SOC 2', clauseOrControl: 'CC2.2' }],
        auditorTestingProcedure: 'Auditor inspects 25 personnel files to verify signed acknowledgments are present and dated within the current year.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Automate annual policy re-acknowledgment within the HRIS during the annual review cycle.'
      },
      {
        id: 'PBC-HR-003',
        code: 'HR-03',
        title: 'Employee Offboarding Access Revocation Timestamps Log',
        description: 'Comprehensive evidence of IT access, building access, and data permissions revoked within 24 hours of employee departure.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Jira Offboarding Tickets with Date/Time Logs (PDF/CSV)',
        submissionCadence: 'Ad-Hoc / Triggered',
        minimumSampleSize: '100% of Terminated Personnel during Audit Period',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.6.5' }, { standard: 'SOC 2', clauseOrControl: 'CC6.2' }],
        auditorTestingProcedure: 'Auditor compares HR termination effective dates against IdP account deactivation timestamps to verify <24 hour SLA.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Ensure company hardware return tracking and tracking numbers are linked to the offboarding ticket.'
      }
    ]
  },

  // =========================================================================
  // 11. PEOPLE & OPERATIONS: Learning & Employee Development (L&D)
  // =========================================================================
  {
    departmentId: 'dept_ld',
    departmentName: 'Learning & Employee Development (L&D)',
    shortName: 'L&D & Training',
    category: 'People & Operations',
    leadAuditorScrutinyLevel: 'HIGH',
    headRole: 'Head of Learning & Development / Security Awareness Lead',
    auditeeRoles: ['LMS Administrator', 'Security Awareness Specialist'],
    mandatedStandards: ['ISO 27001:2022 (A.6.3)', 'SOC 2 (CC2.2)', 'MAS TRM Sec 3.3'],
    auditorWalkthroughScope: 'Auditors inspect mandatory annual security awareness training completion rates (>95%), new-hire 30-day onboarding training, monthly simulated phishing campaign metrics, and specialized secure coding training for developers.',
    keyInquiryQuestions: [
      'What percentage of full-time employees and contractors completed the mandatory annual cybersecurity training?',
      'Show me the remediation and retraining process for employees who fail simulated phishing tests.',
      'Show me specialized training records for developers (OWASP Top 10) and AI engineers (responsible AI).'
    ],
    commonAuditTrapsAndRedFlags: [
      'Training completion rate below 90% with no documented escalation to senior management.',
      'Offshore contractors excluded from mandatory training programs.',
      'Developers never receiving secure code training or API security training.'
    ],
    liveDemonstrationRequirements: [
      'LMS (KnowBe4 / Curricula / Workday) dashboard showing 95%+ enterprise completion rate',
      'Phishing simulation platform showing campaign click rates and automatic retraining triggers'
    ],
    sampleInterviewQA: [
      {
        question: 'What action is taken if an employee repeatedly clicks simulated phishing links?',
        targetRole: 'Security Awareness Lead',
        modelAnswer: 'First failure triggers immediate micro-learning module. Second failure within 90 days requires mandatory 1-on-1 retraining with the SOC team and notification to their department manager. Third failure escalates to HR disciplinary review.',
        fatalTrapAnswer: 'We send them an email asking them to be more careful next time.',
        backingArtifact: 'Phishing Escalation Policy + Automated LMS Retraining Enrollment Audit'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-LD-001',
        code: 'LD-01',
        title: 'Annual Cybersecurity & Privacy Awareness LMS Completion Reports',
        description: 'Complete LMS logs showing completion dates, assessment scores (>80%), and enterprise completion percentage across all staff.',
        itemType: 'Mandatory Record',
        requiredFormat: 'LMS Enterprise Completion Export (PDF/CSV)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of Active Personnel',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.6.3' }, { standard: 'SOC 2', clauseOrControl: 'CC2.2' }],
        auditorTestingProcedure: 'Auditor verifies that overall completion rate exceeds 95% and checks that new hires completed training within 30 days of joining.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Retain specific certificate timestamps for staff who joined in the last quarter.'
      },
      {
        id: 'PBC-LD-002',
        code: 'LD-02',
        title: 'Monthly Phishing Simulation Campaign Results & Retraining Logs',
        description: 'Records of simulated phishing campaigns conducted throughout the year, tracking delivery, open, click, and report rates alongside remediation.',
        itemType: 'Test / Drill Report',
        requiredFormat: 'Phishing Platform Annual Executive Summary (PDF)',
        submissionCadence: 'Quarterly',
        minimumSampleSize: '12 Monthly Phishing Drills',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.6.3' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 3.3' }],
        auditorTestingProcedure: 'Auditor confirms monthly cadence and verifies that all staff who failed phishing tests completed remedial training.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Highlight the positive "Phish-Alarm" reporting rate to demonstrate employee vigilance.'
      }
    ]
  },

  // =========================================================================
  // 12. PEOPLE & OPERATIONS: Procurement & Vendor Risk Management (VRM)
  // =========================================================================
  {
    departmentId: 'dept_proc',
    departmentName: 'Procurement & Vendor Risk Management (VRM)',
    shortName: 'Procurement & VRM',
    category: 'People & Operations',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Head of Procurement / Third-Party Risk Director',
    auditeeRoles: ['Vendor Risk Analyst', 'Strategic Sourcing Manager', 'Procurement Lead'],
    mandatedStandards: ['ISO 27001:2022 (A.5.19, A.5.20, A.5.21, A.5.22, A.5.23)', 'SOC 2 (CC9.2)', 'MAS Outsourcing Guidelines Sec 5.0'],
    auditorWalkthroughScope: 'Auditors evaluate third-party vendor risk tiering, pre-contract security evaluations (SIG/CAIQ), mandatory contract security and right-to-audit clauses, annual SOC 2 Type II report collection, and vendor exit plans.',
    keyInquiryQuestions: [
      'How are third-party vendors tiered based on the sensitivity of data they access or host?',
      'Show me the current SOC 2 Type II report and bridge letter for your primary cloud service provider.',
      'What happens if a critical vendor fails their annual security review or suffers a public data breach?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Contracting with critical cloud vendors without conducting a pre-contract security risk assessment.',
      'Expired SOC 2 Type II or ISO 27001 certificates on file with no bridge letters covering audit gaps.',
      'Vendor contracts missing mandatory data breach notification (24-48 hrs) and right-to-audit clauses.'
    ],
    liveDemonstrationRequirements: [
      'Vendor Risk Management portal (OneTrust / Prevalent / UpGuard) showing active vendor tiering',
      'Master Vendor Inventory spreadsheet with up-to-date SOC 2 and ISO 27001 expiry dates'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure critical cloud suppliers maintain their security certifications year-over-year?',
        targetRole: 'Third-Party Risk Manager',
        modelAnswer: 'We maintain an automated TPRM register that alerts 60 days before vendor SOC 2 or ISO certificates expire. For all Tier 1 critical suppliers, we collect and evaluate their updated SOC 2 Type II report, review any qualified auditor opinions or user control considerations (CSOUs), and obtain bridge letters.',
        fatalTrapAnswer: 'We assume providers like AWS and Google always have current certifications.',
        backingArtifact: 'Vendor Risk Evaluation Register + AWS/GCP Current SOC 2 Bridge Letter Pack'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-PROC-001',
        code: 'PROC-01',
        title: 'Master Vendor Inventory & Third-Party Risk Tiering Register',
        description: 'Complete listing of all active SaaS, cloud, hardware, and service vendors categorized by criticality tier (High, Medium, Low) with data access scopes.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Vendor Risk Tiering Matrix (CSV/PDF)',
        submissionCadence: 'Quarterly',
        minimumSampleSize: '100% of Active Third Parties',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.19, A.5.21' }, { standard: 'SOC 2', clauseOrControl: 'CC9.2' }],
        auditorTestingProcedure: 'Auditor selects 15 vendors and verifies pre-contract assessments were completed prior to contract signing.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure sub-processors handling customer personal data are flagged with GDPR Article 28 compliance tags.'
      },
      {
        id: 'PBC-PROC-002',
        code: 'PROC-02',
        title: 'Critical Vendor Annual SOC 2 Type II Reports & Bridge Letters',
        description: 'Collection of current third-party audit reports (SOC 2 Type II / ISO 27001) for all critical vendors covering the client audit period.',
        itemType: 'Third-Party Attestation',
        requiredFormat: 'Vendor SOC 2 Reports + Signed Bridge Letters (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of Tier 1 Critical Vendors',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.22' }, { standard: 'SOC 2', clauseOrControl: 'CC9.2' }],
        auditorTestingProcedure: 'Auditor verifies that report testing periods cover the entire audit timeframe and checks client implementation of complementary user controls.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Document internal reviews of any exceptions noted in vendor SOC 2 reports.'
      }
    ]
  },

  // =========================================================================
  // 13. PEOPLE & OPERATIONS: Facilities, Physical Security & EHS
  // =========================================================================
  {
    departmentId: 'dept_fac',
    departmentName: 'Facilities, Physical Security & EHS',
    shortName: 'Facilities & Physical',
    category: 'People & Operations',
    leadAuditorScrutinyLevel: 'HIGH',
    headRole: 'Director of Facilities & Physical Security',
    auditeeRoles: ['Physical Security Lead', 'Office Manager', 'EHS Coordinator'],
    mandatedStandards: ['ISO 27001:2022 (A.7.1, A.7.2, A.7.3, A.7.4, A.7.7)', 'SOC 2 (CC6.4, CC6.5)'],
    auditorWalkthroughScope: 'Auditors inspect physical access control badge logs, visitor sign-in registers and badge returns, CCTV camera coverage and 30-day recording retention, clean desk and clear screen enforcement, and server room fire suppression maintenance.',
    keyInquiryQuestions: [
      'Show me visitor logs for the past 90 days and prove that visitors are escorted in secure areas at all times.',
      'Show me the annual maintenance inspection certificates for fire suppression and UPS battery backup systems.',
      'How are clean desk and clear screen policies audited across corporate workspaces?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Visitor logs with blank departure times or missing escort signatures.',
      'Physical keycard access not revoked for terminated employees on their last day.',
      'CCTV recordings overwriting in less than 30 days due to insufficient storage.'
    ],
    liveDemonstrationRequirements: [
      'Physical keycard access control console (Brivo / Lenel) showing active badge access logs',
      'CCTV video management system showing camera feeds and 30+ days storage retention'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you handle unescorted visitors or delivery contractors entering the building?',
        targetRole: 'Facilities Manager',
        modelAnswer: 'Unescorted access beyond reception is strictly forbidden. All visitors must present government ID, sign our visitor NDA register, receive a visitor badge, and be escorted by an authorized employee throughout their visit.',
        fatalTrapAnswer: 'Frequent couriers and cleaners know their way around so they don’t need an escort.',
        backingArtifact: 'Visitor Access Register Sample + Reception Desk SOP'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-FAC-001',
        code: 'FAC-01',
        title: 'Visitor Sign-In Registers & NDA Acknowledgement Logs',
        description: 'Complete physical visitor logs showing visitor name, company, date, arrival/departure timestamps, government ID verification, and escort signatures.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Electronic / Physical Visitor Logbook Scan (PDF)',
        submissionCadence: 'Monthly',
        minimumSampleSize: '3 Months Sample Logs',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.7.2' }, { standard: 'SOC 2', clauseOrControl: 'CC6.4' }],
        auditorTestingProcedure: 'Auditor inspects logs for completeness and verifies no blank departure times or missing escort entries.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Adopt electronic visitor kiosk registration (Envoy/SwipedOn) with automatic photo capture.'
      },
      {
        id: 'PBC-FAC-002',
        code: 'FAC-02',
        title: 'Fire Suppression & UPS Battery Annual Maintenance Certificates',
        description: 'Certified third-party inspection reports for FM-200 / Novec clean agent fire suppression, smoke detectors, and emergency UPS backup batteries.',
        itemType: 'Third-Party Attestation',
        requiredFormat: 'Signed Engineering Inspection Certificates (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of On-Premises Server Facilities',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.7.4' }, { standard: 'SOC 2', clauseOrControl: 'CC6.4' }],
        auditorTestingProcedure: 'Auditor checks that inspection dates are within the valid 12-month window and all recommendations were addressed.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'If fully cloud-hosted, obtain the physical security attestation from AWS/GCP data centers.'
      }
    ]
  },

  // =========================================================================
  // 14. CORPORATE & FINANCE: Legal & Corporate Affairs
  // =========================================================================
  {
    departmentId: 'dept_leg',
    departmentName: 'Legal & Corporate Affairs',
    shortName: 'Legal & Compliance',
    category: 'Corporate & Finance',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    headRole: 'General Counsel / Chief Legal Officer',
    auditeeRoles: ['Corporate Counsel', 'Regulatory Affairs Specialist', 'Contracts Manager'],
    mandatedStandards: ['ISO 27001:2022 (A.5.31, A.5.32, A.5.33)', 'SOC 2 (CC1.2, CC2.1)', 'MAS TRM Sec 3.0'],
    auditorWalkthroughScope: 'Auditors evaluate statutory and regulatory compliance registers, intellectual property protection, standard customer Master Services Agreements (MSA), Data Processing Addendums (DPA), and right-to-audit contract clauses.',
    keyInquiryQuestions: [
      'How does the organization identify and keep track of evolving statutory, regulatory, and contractual compliance obligations?',
      'Show me standard customer contracts proving that data security commitments and liability terms are legally enforceable.',
      'How is intellectual property and proprietary software code protected from unauthorized disclosure or infringement?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Regulatory compliance register that has not been reviewed in the past 12 months.',
      'Customer contracts executed without standard data protection addendums or breach notification terms.',
      'Pending litigation or intellectual property disputes not disclosed to external auditors.'
    ],
    liveDemonstrationRequirements: [
      'Master Statutory & Regulatory Obligations Register spreadsheet',
      'Contract lifecycle management portal showing signed customer DPAs and standard MSAs'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure customer data processing terms comply with cross-border data transfer restrictions?',
        targetRole: 'Corporate Counsel',
        modelAnswer: 'We incorporate Standard Contractual Clauses (SCCs) in all customer DPAs for international transfers, execute Transfer Impact Assessments (TIAs) where required, and ensure encryption keys remain under our administrative control.',
        fatalTrapAnswer: 'We assume our cloud providers handle international data transfer laws automatically.',
        backingArtifact: 'Standard DPA Template v4.0 with Standard Contractual Clauses'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-LEG-001',
        code: 'LEG-01',
        title: 'Master Statutory & Regulatory Obligations Register',
        description: 'Centralized inventory of all applicable laws, cybersecurity mandates, data privacy regulations, and contractual standards with compliance tracking.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Regulatory Compliance Register (PDF/Excel)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of Operating Jurisdictions',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.31' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 3.1' }],
        auditorTestingProcedure: 'Auditor verifies that recent legal changes (e.g. EU AI Act, MAS TRM updates, state privacy laws) are reflected in the register.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Schedule bi-annual reviews with outside legal counsel to refresh the regulatory landscape.'
      },
      {
        id: 'PBC-LEG-002',
        code: 'LEG-02',
        title: 'Customer Data Processing Addendum (DPA) & Right-to-Audit Clauses',
        description: 'Standard contractual terms executed with enterprise customers establishing data protection standards, breach notification SLAs, and audit cooperation.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Executed Sample Customer DPA Packages (PDF)',
        submissionCadence: 'Ad-Hoc / Triggered',
        minimumSampleSize: 'Sample of 5 Major Customer Contracts',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.20, A.5.34' }, { standard: 'SOC 2', clauseOrControl: 'CC2.1' }],
        auditorTestingProcedure: 'Auditor confirms presence of data breach notification clauses (<72 hours) and customer audit rights.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Highlight sections defining sub-processor notification and data return/deletion SLAs upon contract termination.'
      }
    ]
  },

  // =========================================================================
  // 15. CORPORATE & FINANCE: Data Privacy Office (DPO)
  // =========================================================================
  {
    departmentId: 'dept_privacy',
    departmentName: 'Data Privacy Office (DPO) & GDPR/PDPA',
    shortName: 'Data Privacy Office',
    category: 'Corporate & Finance',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Data Protection Officer (DPO) / Head of Privacy',
    auditeeRoles: ['Privacy Engineer', 'DSAR Specialist', 'Data Governance Lead'],
    mandatedStandards: ['ISO 27701:2019', 'GDPR (Art. 30, 35)', 'Singapore PDPA', 'India DPDP 2023', 'ISO 27001 A.5.34'],
    auditorWalkthroughScope: 'Auditors inspect the Record of Processing Activities (RoPA), Data Protection Impact Assessments (DPIA), customer Data Subject Access Request (DSAR) handling logs, cookie consent management, and privacy notices.',
    keyInquiryQuestions: [
      'Show me your current Record of Processing Activities (RoPA) under Article 30.',
      'Show me the DPIA conducted prior to the deployment of your customer analytics or AI features.',
      'Demonstrate how Data Subject Access Requests (DSARs) are tracked and fulfilled within statutory 30-day deadlines.'
    ],
    commonAuditTrapsAndRedFlags: [
      'RoPA missing key information such as data retention periods, legal basis, or international transfer destinations.',
      'DSAR requests exceeding the 30-day statutory response window with no extension documentation.',
      'Cookie banner loading tracking pixels before user grants affirmative consent.'
    ],
    liveDemonstrationRequirements: [
      'Privacy management portal (OneTrust / DataGrail) showing live RoPA inventory and data maps',
      'DSAR request portal demonstrating automated deletion verification across backend databases'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you handle a customer request for the erasure of all personal data (Right to be Forgotten)?',
        targetRole: 'Data Protection Officer (DPO)',
        modelAnswer: 'The request is logged in our privacy portal, identity verified, and dispatched via API to all backend databases and sub-processors. Data is scrubbed within 30 days, backup snapshots age out within 90 days, and a signed Certificate of Erasure is issued.',
        fatalTrapAnswer: 'We delete the user from our main CRM table and assume other databases sync eventually.',
        backingArtifact: 'DSAR Erasure SOP + Automated Database Deletion Confirmation Sample'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-PRIV-001',
        code: 'PRIV-01',
        title: 'Record of Processing Activities (RoPA) Article 30 Register',
        description: 'Comprehensive data inventory documenting data categories, data subjects, legal basis, retention periods, and third-party recipients.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Signed RoPA Register (PDF/Excel)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of Data Processing Operations',
        standardMappings: [{ standard: 'ISO 27701:2019', clauseOrControl: 'Cl 6.3' }, { standard: 'GDPR', clauseOrControl: 'Art. 30' }],
        auditorTestingProcedure: 'Auditor reconciles active database schemas against the RoPA to verify that all data fields with PII are documented.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure explicit retention periods (e.g. "7 years for billing records") are defined rather than vague terms.'
      },
      {
        id: 'PBC-PRIV-002',
        code: 'PRIV-02',
        title: 'Data Protection Impact Assessment (DPIA) Reports',
        description: 'Formal assessments conducted for high-risk data processing activities, profiling algorithms, or customer AI systems under GDPR Art. 35.',
        itemType: 'Mandatory Record',
        requiredFormat: 'DPIA Evaluation Pack (PDF)',
        submissionCadence: 'Ad-Hoc / Triggered',
        minimumSampleSize: 'All High-Risk Processing Initiatives',
        standardMappings: [{ standard: 'ISO 27701:2019', clauseOrControl: 'Cl 6.4' }, { standard: 'GDPR', clauseOrControl: 'Art. 35' }],
        auditorTestingProcedure: 'Auditor verifies that risk mitigation measures identified in DPIAs were implemented in technical architecture.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Involve both the DPO and Security Lead in the DPIA approval sign-off block.'
      }
    ]
  },

  // =========================================================================
  // 16. CORPORATE & FINANCE: Finance, Treasury & Accounting
  // =========================================================================
  {
    departmentId: 'dept_fin',
    departmentName: 'Finance, Treasury & Accounting',
    shortName: 'Finance & Treasury',
    category: 'Corporate & Finance',
    leadAuditorScrutinyLevel: 'VERY_HIGH',
    headRole: 'Chief Financial Officer (CFO) / Corporate Controller',
    auditeeRoles: ['Senior Accounting Manager', 'Treasury Specialist', 'Financial Systems Analyst'],
    mandatedStandards: ['SOX 404 ITGC', 'ISO 27001:2022 (A.5.3)', 'SOC 2 (CC1.3, CC6.1)'],
    auditorWalkthroughScope: 'Auditors evaluate financial segregation of duties (SoD), dual-authorization controls for banking wire transfers, financial reporting access restrictions, and annual cybersecurity budget allocation.',
    keyInquiryQuestions: [
      'Show me how dual authorization is enforced on all external bank wire transfers exceeding $10,000.',
      'Show me the segregation of duties matrix ensuring accounting staff cannot create and approve their own vendor invoices.',
      'Demonstrate how financial system user access is restricted and reviewed quarterly.'
    ],
    commonAuditTrapsAndRedFlags: [
      'Single individual possessing end-to-end authority to create, approve, and disburse bank payments.',
      'Financial spreadsheets containing sensitive payroll/revenue figures stored in unencrypted, shared folders.',
      'Accounting team sharing administrative logins to ERP or banking portals.'
    ],
    liveDemonstrationRequirements: [
      'Corporate banking portal (J.P. Morgan / HSBC / Brex) showing mandatory dual-approval rule settings',
      'NetSuite / QuickBooks access control matrix proving Segregation of Duties'
    ],
    sampleInterviewQA: [
      {
        question: 'Can any single person initiate and execute a wire payment from corporate bank accounts?',
        targetRole: 'Corporate Controller',
        modelAnswer: 'No. Our banking portal enforces mandatory two-person authorization. Payments can only be initiated by senior accounting staff, and must be digitally approved by either the CFO or CEO using hardware security tokens.',
        fatalTrapAnswer: 'The CFO or Controller can transfer funds directly in emergency situations.',
        backingArtifact: 'Bank Dual Authorization Policy + Wire Transfer Approval Audit Sample'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-FIN-001',
        code: 'FIN-01',
        title: 'Banking Dual-Authorization Wire Transfer Approval Logs',
        description: 'Audit logs from financial institutions proving that all disbursements require two distinct authorized signatures prior to fund release.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'Bank Portal Dual-Control Rule Export + Sample Wire Log (PDF)',
        submissionCadence: 'Quarterly',
        minimumSampleSize: 'Sample of 15 Wire Transfers across Year',
        standardMappings: [{ standard: 'SOX 404', clauseOrControl: 'ITGC Financial Controls' }, { standard: 'SOC 2', clauseOrControl: 'CC1.3' }],
        auditorTestingProcedure: 'Auditor tests sample of 15 disbursements to verify initiator ID does not match approver ID.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure bank portal administrator privileges are restricted and separate from transaction approvers.'
      },
      {
        id: 'PBC-FIN-002',
        code: 'FIN-02',
        title: 'Financial ERP Segregation of Duties (SoD) Conflict Matrix',
        description: 'System report demonstrating role-based access restrictions preventing users from holding incompatible accounting permissions.',
        itemType: 'Mandatory Record',
        requiredFormat: 'ERP SoD Access Conflict Matrix (PDF/Excel)',
        submissionCadence: 'Semi-Annual',
        minimumSampleSize: '100% of Financial System Users',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.3' }, { standard: 'SOC 2', clauseOrControl: 'CC6.1' }],
        auditorTestingProcedure: 'Auditor runs conflict queries to verify no user has simultaneous "Enter Invoice" and "Approve Payment" roles.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Document mitigating controls and monthly management reviews if small team size necessitates any SoD exceptions.'
      }
    ]
  },

  // =========================================================================
  // 17. CORPORATE & FINANCE: Executive Board & C-Suite Governance
  // =========================================================================
  {
    departmentId: 'dept_exec',
    departmentName: 'Executive Board & C-Suite Secretariat',
    shortName: 'Executive & Board',
    category: 'Corporate & Finance',
    leadAuditorScrutinyLevel: 'CRITICAL_HIGH',
    headRole: 'Chief Executive Officer (CEO) / Board Risk Committee Chair',
    auditeeRoles: ['CEO', 'Chief Information Security Officer (CISO)', 'Company Secretary'],
    mandatedStandards: ['ISO 27001:2022 (Cl 4.3, 5.1, 5.2, 5.3, 6.1.3, 9.3)', 'SOC 2 (CC1.1, CC1.2)', 'MAS TRM Sec 3.0'],
    auditorWalkthroughScope: 'Auditors interview executive leadership to test top management commitment, verify annual Management Review Meeting (MRM) minutes covering mandatory ISO Clause 9.3 inputs, approve Statement of Applicability (SoA), and evaluate risk appetite.',
    keyInquiryQuestions: [
      'How does top management demonstrate active leadership, commitment, and oversight of the ISMS and AI Governance?',
      'Show me the signed minutes and decision action log from your most recent annual Management Review Meeting (MRM).',
      'Show me how adequate cybersecurity and compliance budget is approved and allocated.'
    ],
    commonAuditTrapsAndRedFlags: [
      'MRM conducted without covering mandatory ISO 27001 Clause 9.3 agenda inputs (audit results, risk changes, feedback).',
      'C-Suite executives unable to speak to organizational risk appetite or security objectives during interview.',
      'Information Security Policy or Statement of Applicability drafted by consultants but lacking executive signature.'
    ],
    liveDemonstrationRequirements: [
      'Signed Board Resolution approving Enterprise Information Security Policy v2.0',
      'Annual Management Review Meeting (MRM) pack complete with CEO/CISO signatures and budget approval'
    ],
    sampleInterviewQA: [
      {
        question: 'How do you ensure the Information Security Management System remains aligned with strategic business goals?',
        targetRole: 'Chief Executive Officer (CEO)',
        modelAnswer: 'The Board Risk Committee meets quarterly to review our risk profile, key risk indicators (KRIs), and compliance postures. Annually, we conduct a formal Management Review Meeting under ISO 27001 Clause 9.3 where we review audit results, incident trends, resource needs, and approve the annual security budget.',
        fatalTrapAnswer: 'I delegate all security matters completely to the CISO and IT team.',
        backingArtifact: 'Annual Management Review Meeting (MRM) Minutes signed by CEO + Board Risk Charter'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-EXEC-001',
        code: 'EXEC-01',
        title: 'Annual Management Review Meeting (MRM) Minutes & Decision Log',
        description: 'Comprehensive meeting minutes covering all mandatory ISO 27001 Clause 9.3 inputs (audit findings, risk status, incident metrics, CAPA progress, resource needs).',
        itemType: 'Meeting Minutes & Sign-off',
        requiredFormat: 'Signed Executive MRM Minutes Pack (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '1 Comprehensive Annual MRM Pack',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'Clause 9.3' }, { standard: 'SOC 2', clauseOrControl: 'CC1.2' }, { standard: 'MAS TRM', clauseOrControl: 'Sec 3.1' }],
        auditorTestingProcedure: 'Auditor audits the agenda against Clause 9.3 required inputs and traces decision items to active budget/project allocations.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Ensure minutes explicitly record decisions regarding continual improvement and changes to ISMS scope.'
      },
      {
        id: 'PBC-EXEC-002',
        code: 'EXEC-02',
        title: 'Executive Statement of Applicability (SoA) & Risk Appetite Sign-Off',
        description: 'Formal document approved by executive leadership declaring the applicability status and justification for all 93 ISO 27001 Annex A controls.',
        itemType: 'Mandatory Record',
        requiredFormat: 'Signed Statement of Applicability v2.0 (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: '100% of 93 Controls',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'Clause 6.1.3 d' }],
        auditorTestingProcedure: 'Auditor verifies that every excluded Annex A control contains a rigorous, justifiable business/technical rationale.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Review the SoA whenever infrastructure changes occur, not just before the audit.'
      }
    ]
  },

  // =========================================================================
  // 18. COMMERCIAL & GROWTH: Customer Support & Technical Helpdesk
  // =========================================================================
  {
    departmentId: 'dept_supp',
    departmentName: 'Customer Support & Technical Helpdesk',
    shortName: 'Customer Support',
    category: 'Commercial & Growth',
    leadAuditorScrutinyLevel: 'HIGH',
    headRole: 'Director of Customer Support / Helpdesk Operations Lead',
    auditeeRoles: ['Senior Support Engineer', 'Tier 2 Escalation Lead', 'Helpdesk Supervisor'],
    mandatedStandards: ['ISO 27001:2022 (A.5.24, A.8.12)', 'SOC 2 (CC7.2, CC7.3)'],
    auditorWalkthroughScope: 'Auditors inspect customer identity verification procedures during password/MFA reset requests, customer data redaction in support tickets, support agent access scopes, and security incident escalation playbooks.',
    keyInquiryQuestions: [
      'How do support agents verify the identity of a customer before assisting with account recovery or MFA resets?',
      'Show me how customer sensitive data, passwords, and credit card numbers are redacted from ticket histories.',
      'What is the procedure when a support agent discovers a potential security vulnerability reported by a customer?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Support agents resetting passwords based solely on unauthenticated email or chat requests.',
      'Customer sensitive passwords or API keys stored in plaintext in Zendesk / Jira ticket comments.',
      'Support agents lacking an escalation path to security for reporting suspicious social engineering attempts.'
    ],
    liveDemonstrationRequirements: [
      'Zendesk / Intercom admin console showing automated PII and credit card redaction apps enabled',
      'Customer identity verification workflow execution during ticket triage'
    ],
    sampleInterviewQA: [
      {
        question: 'If a caller claims to be the CEO of a customer company and demands an immediate password reset, what do you do?',
        targetRole: 'Senior Support Agent',
        modelAnswer: 'We follow our strict out-of-band verification SOP. Regardless of their title, we cannot bypass verification. We initiate a push verification challenge to their registered mobile device or contact their designated account administrator through official verified records.',
        fatalTrapAnswer: 'If they are the CEO or a VIP customer, we assist them immediately to avoid bad customer satisfaction.',
        backingArtifact: 'Customer Account Recovery & Verification SOP v2.1'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-SUPP-001',
        code: 'SUPP-01',
        title: 'Customer Identity Verification & Account Recovery SOP',
        description: 'Standard operating procedure detailing mandatory multi-factor and out-of-band verification steps required before modifying customer accounts or credentials.',
        itemType: 'Policy & Standard',
        requiredFormat: 'Customer Verification SOP (PDF)',
        submissionCadence: 'Annual',
        minimumSampleSize: 'Sample of 15 Account Recovery Tickets',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.15' }, { standard: 'SOC 2', clauseOrControl: 'CC6.1' }],
        auditorTestingProcedure: 'Auditor samples 15 customer account recovery tickets to verify agent adhered to the verification checklist prior to granting access.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Enforce automated verification links rather than having agents manually ask security questions.'
      },
      {
        id: 'PBC-SUPP-002',
        code: 'SUPP-02',
        title: 'Support Ticket PII Redaction & Data Sanitization Audit Logs',
        description: 'Configuration and logs of automated redaction tools stripping credit cards, passwords, and sensitive PII from customer ticket attachments and conversations.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'Ticketing Platform Redaction Tool Audit Report',
        submissionCadence: 'Quarterly',
        minimumSampleSize: '100% of Active Support Channels',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.8.12' }, { standard: 'GDPR', clauseOrControl: 'Art. 32' }],
        auditorTestingProcedure: 'Auditor searches support ticketing database for keywords (password, CVV, SSN) to verify zero unredacted sensitive values.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Deploy AI-driven automated regex masking directly on ticket submission forms.'
      }
    ]
  },

  // =========================================================================
  // 19. COMMERCIAL & GROWTH: Enterprise Sales & Business Development
  // =========================================================================
  {
    departmentId: 'dept_sales',
    departmentName: 'Enterprise Sales & Business Development',
    shortName: 'Enterprise Sales',
    category: 'Commercial & Growth',
    leadAuditorScrutinyLevel: 'MEDIUM_HIGH',
    headRole: 'Chief Commercial Officer (CCO) / VP of Sales',
    auditeeRoles: ['Sales Operations Lead', 'Enterprise Account Executive', 'Sales Solutions Architect'],
    mandatedStandards: ['ISO 27001:2022 (A.5.20, A.5.34)', 'SOC 2 (CC2.1)'],
    auditorWalkthroughScope: 'Auditors evaluate mutual non-disclosure agreements (MNDA) executed prior to sharing architectural designs, security questionnaire RFP handling, customer security addendum approvals, and CRM access control.',
    keyInquiryQuestions: [
      'How do you ensure a signed NDA is in place before sharing technical architecture or product security documentation with prospective clients?',
      'Who reviews and authorizes custom security commitments or SLA terms requested by enterprise prospects?',
      'How is customer pipeline data protected from unauthorized export in your CRM?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Sales representatives sending SOC 2 reports or penetration test summaries to prospects without an executed NDA.',
      'Sales reps signing custom customer security addendums with unrealistic SLA penalties without Legal/CISO sign-off.',
      'Sales CRM accounts lacking MFA or allowing mass export of customer contact databases.'
    ],
    liveDemonstrationRequirements: [
      'Salesforce / HubSpot CRM showing export restrictions and mandatory NDA attachment workflow',
      'Whistic / Conveyor security portal showing NDA-gated trust center access logs'
    ],
    sampleInterviewQA: [
      {
        question: 'What process must be followed before sending a customer our confidential SOC 2 Type II report?',
        targetRole: 'Enterprise Account Executive',
        modelAnswer: 'We cannot email SOC 2 reports directly. We send the prospect a link to our automated Trust Center portal. The system requires them to execute our mutual NDA electronically. Once verified, they receive access with watermarked tracking and a 30-day expiration.',
        fatalTrapAnswer: 'I have a PDF on my desktop and attach it to the email if the customer asks for it.',
        backingArtifact: 'Trust Center NDA-Gated Download Log + Sales Security Disclosure SOP'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-SALES-001',
        code: 'SALES-01',
        title: 'Customer Non-Disclosure Agreement (MNDA) Execution Register',
        description: 'Records of mutual NDAs signed with prospective enterprise clients prior to sharing confidential audit reports, APIs, or architectural schemas.',
        itemType: 'Mandatory Record',
        requiredFormat: 'DocuSign Executed NDA Register (PDF/CSV)',
        submissionCadence: 'Quarterly',
        minimumSampleSize: 'Sample of 15 Enterprise Client Accounts',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.20' }, { standard: 'SOC 2', clauseOrControl: 'CC2.1' }],
        auditorTestingProcedure: 'Auditor compares the date of audit report sharing against the NDA signature date to verify NDA preceded disclosure.',
        deficiencySeverityIfMissing: 'Major Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Integrate CRM with e-signature tools so NDA execution automatically unlocks sales collateral.'
      },
      {
        id: 'PBC-SALES-002',
        code: 'SALES-02',
        title: 'Custom Customer Security Commitments Review & Approval Log',
        description: 'Formal legal and CISO approvals for any non-standard security terms, audit rights, or financial SLA penalties negotiated into enterprise sales contracts.',
        itemType: 'Meeting Minutes & Sign-off',
        requiredFormat: 'Sales Contract Exception Sign-off Log (PDF)',
        submissionCadence: 'Ad-Hoc / Triggered',
        minimumSampleSize: '100% of Non-Standard Security Addendums',
        standardMappings: [{ standard: 'ISO 27001:2022', clauseOrControl: 'A.5.20' }, { standard: 'SOC 2', clauseOrControl: 'CC2.1' }],
        auditorTestingProcedure: 'Auditor cross-checks sampled custom contracts to verify CISO approval was secured prior to executive signature.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Prepared',
        implementerTip: 'Maintain standard pre-approved clause fallback options in the sales playbook.'
      }
    ]
  },

  // =========================================================================
  // 20. COMMERCIAL & GROWTH: Marketing, Branding & Communications
  // =========================================================================
  {
    departmentId: 'dept_mkt',
    departmentName: 'Marketing, Branding & Communications',
    shortName: 'Marketing & PR',
    category: 'Commercial & Growth',
    leadAuditorScrutinyLevel: 'MEDIUM_HIGH',
    headRole: 'Chief Marketing Officer (CMO) / VP of Communications',
    auditeeRoles: ['Digital Marketing Lead', 'PR & Communications Specialist', 'Webmaster'],
    mandatedStandards: ['ISO 27001:2022 (A.5.34, A.8.12)', 'GDPR (Art. 7)', 'ISO 42001 (Annex A.2)'],
    auditorWalkthroughScope: 'Auditors inspect website cookie consent banner configurations, privacy notice accessibility, public AI transparency declarations, marketing email opt-out compliance (CAN-SPAM / CASL), and crisis communication PR playbooks.',
    keyInquiryQuestions: [
      'Show me how the corporate website enforces affirmative consent before placing analytical or marketing cookies.',
      'Show me the crisis communications plan and approval chain in the event of a public security breach.',
      'How are public claims regarding AI capabilities, data privacy, and certifications vetted for legal accuracy?'
    ],
    commonAuditTrapsAndRedFlags: [
      'Website firing Google Analytics or Meta tracking pixels before user clicks "Accept" on the cookie banner.',
      'Marketing sending mass promotional emails without functional one-click unsubscribe links.',
      'Marketing publishing inaccurate security claims (e.g. claiming "military grade encryption" or unearned certifications).'
    ],
    liveDemonstrationRequirements: [
      'Cookie consent tool (OneTrust / Cookiebot) dashboard proving geo-targeted opt-in enforcement for EU/CA visitors',
      'Corporate website showing published Privacy Notice, Terms of Service, and Responsible AI Statement'
    ],
    sampleInterviewQA: [
      {
        question: 'If a major ransomware or data leak incident occurs, who is authorized to issue public statements or social media posts?',
        targetRole: 'VP of Communications',
        modelAnswer: 'Strictly authorized spokespersons only (CEO and VP of Communications). All public and media communications must be pre-approved by the Incident Response Commander, Legal Counsel, and CISO. Employees are forbidden from speaking to the press under our Social Media and Crisis PR Policy.',
        fatalTrapAnswer: 'Marketing drafts a press release and posts an update on LinkedIn immediately to reassure customers.',
        backingArtifact: 'Crisis Communications Incident Playbook v2.0 + Media Policy'
      }
    ],
    pbcItems: [
      {
        id: 'PBC-MKT-001',
        code: 'MKT-01',
        title: 'Website Cookie Consent Banner & Tracking Telemetry Audit',
        description: 'Configuration export of consent management platform demonstrating prior-consent blocking of all non-essential marketing and tracking cookies.',
        itemType: 'Technical Log / Config',
        requiredFormat: 'Cookie Compliance Scanner Audit Report (PDF)',
        submissionCadence: 'Semi-Annual',
        minimumSampleSize: '100% of Public Corporate Web Domains',
        standardMappings: [{ standard: 'ISO 27701:2019', clauseOrControl: 'Cl 6.3' }, { standard: 'GDPR', clauseOrControl: 'Art. 7' }],
        auditorTestingProcedure: 'Auditor tests public website in a clean browser session and verifies that no tracking cookies fire before affirmative consent.',
        deficiencySeverityIfMissing: 'Minor Non-Conformity',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Conduct automated quarterly crawls of your marketing sites to detect rogue tracking tags.'
      },
      {
        id: 'PBC-MKT-002',
        code: 'MKT-02',
        title: 'Public AI Ethics & Transparency Statement Sign-Off',
        description: 'Published public declaration explaining how the company uses AI responsibly, user rights regarding automated profiling, and human oversight mechanisms under ISO 42001 Annex A.2.',
        itemType: 'Policy & Standard',
        requiredFormat: 'Public Responsible AI Charter + Board Approval Sign-Off',
        submissionCadence: 'Annual',
        minimumSampleSize: '1 Published Statement',
        standardMappings: [{ standard: 'ISO 42001:2023', clauseOrControl: 'Annex A.2.2' }],
        auditorTestingProcedure: 'Auditor checks that public claims regarding AI system safety and fairness match underlying technical controls.',
        deficiencySeverityIfMissing: 'Opportunity for Improvement (OFI)',
        defaultStatus: 'Verified & Submitted',
        implementerTip: 'Link the AI transparency disclosure directly in the website footer beside the Privacy Policy.'
      }
    ]
  }
];

// Helper to compute overall metrics across all 20+ departments
export function computeDepartmentAuditMetrics(customStatuses?: Record<string, string>) {
  let totalPBCItems = 0;
  let verifiedItems = 0;
  let preparedItems = 0;
  let inProgressItems = 0;
  let missingItems = 0;

  DEPARTMENT_AUDIT_CHECKLISTS.forEach(dept => {
    dept.pbcItems.forEach(item => {
      totalPBCItems++;
      const currentStatus = (customStatuses && customStatuses[item.id]) || item.defaultStatus;
      if (currentStatus === 'Verified & Submitted') verifiedItems++;
      else if (currentStatus === 'Prepared') preparedItems++;
      else if (currentStatus === 'In Progress') inProgressItems++;
      else if (currentStatus === 'Missing / Gap') missingItems++;
    });
  });

  const readinessScore = totalPBCItems > 0 
    ? Math.round(((verifiedItems + preparedItems * 0.8 + inProgressItems * 0.4) / totalPBCItems) * 100) 
    : 0;

  return {
    totalDepartments: DEPARTMENT_AUDIT_CHECKLISTS.length,
    totalPBCItems,
    verifiedItems,
    preparedItems,
    inProgressItems,
    missingItems,
    readinessScore
  };
}
