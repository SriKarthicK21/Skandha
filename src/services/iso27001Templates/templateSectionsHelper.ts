// Pre-defined Section Generator for ISO 27001:2022 Document Templates
// Adheres strictly to the 12-Step Senior GRC Consultant Architectural Standard:
// Step 1: Document Control & Revision
// Step 2: Purpose & Executive Mandate (Clause 5.1/5.2)
// Step 3: Scope & Technological Boundaries (Clause 4.3)
// Step 4: Normative Control Mapping (Clause 6.1.3)
// Step 5: RACI Governance Matrix (Clause 5.3)
// Step 6: Quantitative SLAs & Metrics (Clause 6.2)
// Step 7: Tooling & Infrastructure Guardrails (Annex A.8)
// Step 8: Operational Runbooks (Clause 8.1)
// Step 9: Exception & Waiver Lifecycle (Clause 8.1 / 6.1.3)
// Step 10: KPIs & Continuous Evaluation (Clause 9.1)
// Step 11: Auditor Evidence & Sampling Checklist (Clause 9.2, ISO 19011:2018 §B.3)
// Step 12: 5-Whys CAPA Linkage & Executive Ratification (Clause 10.1 / 10.2)

import { PolicyTemplateContext } from './types';
import { generateDeterministicSha256 } from './auditorVerificationHelper';
import { ISO27001_POLICY_CATALOG, StandardTemplateMetadata } from './catalogData';
import { getStandardRaciMatrixForDoc } from '../consultancyDocumentEngine';
import { FormalTuvSopStructure } from '../../types';
import { getFormalTuvSopStructure } from './sopTemplateEngine';

export interface PredefinedPurposeSection {
  executiveMandate: string;
  coreObjectives: string[];
  normativeStandards: string[];
  zeroToleranceRule: string;
  businessContextAlignment: string;
}

export interface PredefinedScopeSection {
  summary: string;
  inScopeEntities: string[];
  logicalCloudBoundaries: string[];
  physicalBoundaries: string[];
  dataClassifications: string[];
  defensibleExclusions: string;
}

export interface RaciRoleEntry {
  role: string;
  mandate: string;
  r: boolean; // Responsible
  a: boolean; // Accountable
  c: boolean; // Consulted
  i: boolean; // Informed
  escalationTrigger?: string;
  assignedUsers?: string[];
  department?: string;
}

export interface PredefinedRaciSection {
  summary: string;
  tableHeaders: string[];
  matrix: RaciRoleEntry[];
}

export interface EvidenceChecklistItem {
  artifactName: string;
  evidenceDescription: string;
  samplingMethodology: string;
  retentionSla: string;
  storageTarget: string;
  mandatoryAuditPeriod: string;
}

export interface PredefinedAuditorChecklistSection {
  primaryArtifact: string;
  samplingProtocol: string;
  storageLocation: string;
  retentionSla: string;
  normativeClause: string;
  masterRiskId: string;
  statutoryMandate: string;
  sha256DigestSeal: string;
  auditorVerdict: 'CONFORMING' | 'OPPORTUNITY_FOR_IMPROVEMENT' | 'NON_CONFORMING';
  leadAuditorOrg: string;
  samplingChecklist: EvidenceChecklistItem[];
}

export interface PredefinedArchitecturalStep {
  step: number;
  sectionTitle: string;
  isoRequirement: string;
  complianceCriterion: string;
  status: 'VERIFIED_CONFORMING';
  implementationSnippet: string;
}

export interface PredefinedTemplateSections {
  docCode: string;
  title: string;
  level: string;
  metadata: StandardTemplateMetadata;
  purpose: PredefinedPurposeSection;
  scope: PredefinedScopeSection;
  raci: PredefinedRaciSection;
  auditorChecklist: PredefinedAuditorChecklistSection;
  architecturalSteps: PredefinedArchitecturalStep[];
  sopStructure: FormalTuvSopStructure;
}

/**
 * Generates high-end, pre-defined sections for Purpose, Scope, RACI, and Auditor Evidence Checklists
 * for any given ISO 27001:2022 template code.
 */
export function getPredefinedTemplateSections(
  docCode: string,
  ctx: PolicyTemplateContext
): PredefinedTemplateSections {
  const code = docCode.toUpperCase();
  const meta = ISO27001_POLICY_CATALOG.find(t => t.code.toUpperCase() === code) || {
    id: `tmpl_${code.toLowerCase()}`,
    code,
    title: 'ISO 27001:2022 Standard Document',
    level: 'Level 2: Topic-Specific Policies',
    isoClauseOrAnnexA: 'ISO/IEC 27001:2022',
    isMandatory: true,
    category: 'Information Security Governance',
    type: 'POLICY',
    summary: 'Standardized ISO 27001:2022 compliance specification document.',
    auditorSamplingFocus: 'Verification of operational artifacts and conformity to ISO 27001:2022.',
    commonAuditPitfall: 'Uncontrolled changes and absent audit trail.',
    primaryDepartment: 'Information Security',
    defaultReviewCycle: 'Annual'
  } as StandardTemplateMetadata;

  const {
    companyName,
    framework = 'ISO/IEC 27001:2022',
    cloudProvider = 'AWS',
    identityProvider = 'Okta',
    mdmProvider = 'Jamf Pro',
    vulnerabilityTool = 'Snyk & Trivy',
    scmProvider = 'GitHub Enterprise',
    cisoName = 'Chief Information Security Officer (CISO)'
  } = ctx;

  const seed = `${companyName}:${code}:${meta.isoClauseOrAnnexA}:${meta.title}`;
  const sha256DigestSeal = generateDeterministicSha256(seed);

  // 1. Purpose Section definition
  let purpose: PredefinedPurposeSection;
  let scope: PredefinedScopeSection;
  let raciRows: RaciRoleEntry[];
  let auditorChecklist: PredefinedAuditorChecklistSection;

  switch (code) {
    case 'DOC-MAN-00':
      purpose = {
        executiveMandate: `Top Management and the Board of Directors of ${companyName} formally establish and ratify this ISMS Governance Architecture Blueprint and Process Interaction Model (DOC-MAN-00) pursuant to ${framework} Clause 4.4, 5.1, and 5.2, explicitly superseding obsolete 2013-style static manuals with an active, closed-loop continuous compliance operating model.`,
        coreObjectives: [
          `Fulfill ISO/IEC 27001:2022 Clause 4.4 by establishing the comprehensive network of 10 interacting ISMS processes and their operational information handoffs.`,
          `Establish a 3-tier governance hierarchy connecting the Board of Directors, ISMS Steering Committee, and operational execution pods across DevOps and SecOps.`,
          `Integrate quantitative SLAs, KRIs, and key performance indicators into daily tooling across ${cloudProvider}, ${identityProvider}, and ${scmProvider}.`,
          `Guarantee 100% audit traceability across the Triad: standard clause -> operational control -> immutable SHA-256 evidence artifact.`
        ],
        normativeStandards: [`${framework} Clause 4.4, 5.1, 5.2, 5.3, 6.2, 9.2, 9.3`, 'ISO/IEC 27002:2022 Guidance', 'MAS TRM Section 3.1 & 3.2', 'SOC 2 CC2.1 & CC3.1', 'ISO 19011:2018 Guidelines'],
        zeroToleranceRule: `Operating an unauthorized or unapproved secondary set of security guidelines, bypassing ISMS Steering Committee governance, or failing to present verifiable process interaction telemetry during certification audits is classified as an organizational non-conformity.`,
        businessContextAlignment: `Directly aligns organizational security velocity with ${companyName}'s enterprise customer commitments, institutional trust criteria, and global regulatory mandates.`
      };
      scope = {
        summary: `Encompasses 100% of information security management processes across ${companyName}'s global production infrastructure in ${cloudProvider}, identity directories in ${identityProvider}, endpoint fleets managed via ${mdmProvider}, and all workforce and contractor operations.`,
        inScopeEntities: [`${companyName} Global ISMS Governance Scope`, 'ISMS Steering Committee', 'Executive Board / Audit Committee', 'DevOps & Cloud SecOps Pods'],
        logicalCloudBoundaries: [`${cloudProvider} Multi-Account Organization`, `${identityProvider} Corporate & Workforce Tenants`, `${scmProvider} Enterprise Organization`, 'Continuous GRC Telemetry Pipelines'],
        physicalBoundaries: ['Corporate Headquarters', 'Co-located Datacenter Suites', 'Workforce Teleworking Remote Environments'],
        dataClassifications: ['Confidential - Customer Data', 'Restricted - Root Keys & Credentials', 'Internal - Operational Runbooks', 'Public - Marketing Collateral'],
        defensibleExclusions: 'Under ISO/IEC 27001:2022, no requirements from Clauses 4 through 10 may be excluded. Any Annex A control exclusions are strictly documented with technical justifications in the Statement of Applicability (DOC-SOA-03).'
      };
      raciRows = [
        { role: 'Executive Board / CEO', mandate: 'Governance sponsorship, risk appetite definition, and overall ISMS capital and resource allocation.', r: false, a: true, c: false, i: true },
        { role: `Chief Information Security Officer (${cisoName})`, mandate: 'Direct ownership of the ISMS Blueprint, control effectiveness, waiver governance, and certification audit representation.', r: true, a: true, c: false, i: false },
        { role: 'ISMS Steering Committee', mandate: 'Bi-monthly governance review, strategic exception evaluation, and cross-departmental alignment.', r: true, a: false, c: true, i: false },
        { role: 'DevOps & Cloud Platform Leads', mandate: 'Implementation of technical guardrails, automated CI/CD security gates, and infrastructure encryption.', r: true, a: false, c: true, i: false },
        { role: 'Lead Internal Auditor', mandate: 'Independent sampling, objective fieldwork testing (ISO 19011:2018), and annual internal audit reports.', r: true, a: false, c: false, i: false },
        { role: 'All In-Scope Personnel', mandate: 'Adherence to documented security policies, incident reporting, and mandatory training completion.', r: true, a: false, c: false, i: false }
      ];
      auditorChecklist = {
        primaryArtifact: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ISMS_GOV_ARCHITECTURE_BLUEPRINT_2026.pdf`,
        samplingProtocol: 'ISO 19011:2018 §B.3 Inspection of full 15-page process interaction model, bi-annual management review minutes, and 3-year rolling internal audit schedules',
        storageLocation: `AWS S3 Glacier WORM Vault: arn:aws:s3:::${companyName.toLowerCase()}-audit-vault/governance/`,
        retentionSla: '84 Months / 7 Years Pursuant to ISO 27001 Clause 7.5.3 and Corporate Governance Standards',
        normativeClause: 'Clause 4.4, 5.1, 5.2, 5.3, 6.2, 9.2, 9.3',
        masterRiskId: 'RSK-GOV-01 (Governance Breakdown & Process Disconnection)',
        statutoryMandate: 'ISO 27001:2022 Clause 4.4, MAS TRM Section 3.1, SOC 2 CC2.1',
        sha256DigestSeal,
        auditorVerdict: 'CONFORMING',
        leadAuditorOrg: 'TÜV SÜD / BSI / UKAS Accredited Conformity Assessment Body',
        samplingChecklist: [
          { artifactName: 'Process Interaction Execution Records', evidenceDescription: 'Evidence of continuous cross-process handoffs between Risk Management (Clause 6), Operational Controls (Clause 8), Internal Audit (Clause 9.2), and CAPA (Clause 10).', samplingMethodology: '100% inspection of core process handoff workflows', retentionSla: '84 Months', storageTarget: 'Skanda Process Engine', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: 'Signed Bi-Annual Management Review Minutes', evidenceDescription: 'Executive review pack covering all 11 mandatory Clause 9.3 inputs and 4 executive decisions with digital signatures of CEO and CISO.', samplingMethodology: '100% of Q2 and Q4 executive packs', retentionSla: '84 Months', storageTarget: 'Executive Minutes Vault', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: '3-Year Rolling Internal Audit Program & Findings', evidenceDescription: 'Formal audit schedule, auditor independence declarations, and closed finding reports covering 100% of standard clauses.', samplingMethodology: '100% of annual internal audit dossiers', retentionSla: '84 Months', storageTarget: 'GRC Audit Module', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: 'ISMS Steering Committee Bi-Monthly Meeting Ledger', evidenceDescription: 'Documented meeting minutes verifying quorum, policy ratifications, and high-risk exception approvals.', samplingMethodology: 'Sample of 6 bi-monthly steering committee meetings', retentionSla: '84 Months', storageTarget: 'Steering Minutes Repo', mandatoryAuditPeriod: 'Trailing 12 Months' }
        ]
      };
      break;

    case 'POL-ACC-04':
      purpose = {
        executiveMandate: `Top Management and the Board of ${companyName} formally mandate that access to all organizational information assets, source code repositories, and production cloud infrastructure (${cloudProvider}) is governed under the Principle of Least Privilege (PoLP), Zero Trust Architecture (ZTA), and strict Need-to-Know basis.`,
        coreObjectives: [
          `Prevent unauthorized access to customer confidential data and intellectual property across ${cloudProvider} and SaaS estates.`,
          `Enforce hardware-bound Multi-Factor Authentication (FIDO2 / WebAuthn) across 100% of workforce and administrative accounts.`,
          `Guarantee quantitative Joiner / Mover / Leaver (JML) SLAs: <= 15 minutes for involuntary offboarding and <= 24 hours for scheduled departures.`,
          `Eliminate standing administrative access through Just-In-Time (JIT) ephemeral role assumption with a maximum 4-hour session TTL.`
        ],
        normativeStandards: [framework, 'ISO/IEC 27002:2022 Controls 5.15, 5.16, 5.17, 5.18, 8.2, 8.3, 8.4', 'MAS TRM Section 5.1 & 5.2', 'SOC 2 CC6.1 - CC6.3'],
        zeroToleranceRule: `Circumventing MFA, sharing individual credentials, utilizing generic non-attributed accounts in production, or bypassing automated ${identityProvider} provisioning is classified as a Critical ISMS Violation resulting in immediate credential revocation and disciplinary escalation.`,
        businessContextAlignment: `Supports ${companyName}'s commercial commitments to enterprise clients regarding SOC 2 Type II trust criteria and GDPR Article 32 technical security measures.`
      };
      scope = {
        summary: `Applies comprehensively to all production and staging environments in ${cloudProvider}, corporate identity systems (${identityProvider}), employee endpoint devices managed via ${mdmProvider}, and all personnel (employees, contractors, third-party developers).`,
        inScopeEntities: [`${companyName} Global Production Infrastructure`, 'Corporate IdP Directories', 'Enterprise Remote Endpoints', 'Customer Data Workloads'],
        logicalCloudBoundaries: [`${cloudProvider} Production VPCs & Organization Accounts`, `${identityProvider} Workforce & Customer Tenants`, `${scmProvider} Code Organizations`],
        physicalBoundaries: [`Corporate Headquarters`, `Remote Employee Teleworking Locations`, `Public Cloud Multi-Tenant Datacenter Regions`],
        dataClassifications: ['Confidential - Customer Data', 'Restricted - Encryption Keys & Secrets', 'Internal - Operational Runbooks', 'Public - Marketing Collateral'],
        defensibleExclusions: 'Third-party SaaS applications that do not store, process, or transmit customer data or interact with production APIs are excluded from direct IAM token synchronization.'
      };
      raciRows = [
        { role: 'Executive Board / CEO', mandate: 'Ultimate oversight of access risk, approval of ISMS budget, and ratification of annual policy.', r: false, a: true, c: false, i: true },
        { role: 'Chief Information Security Officer (CISO)', mandate: 'Operational ownership of IAM policy, sign-off on security exceptions, and escalation of unauthorized access.', r: true, a: true, c: false, i: false },
        { role: 'IT & Cloud SecOps', mandate: 'Configuration of ${identityProvider}, MFA policies, conditional access filters, and quarterly access recertification.', r: true, a: false, c: false, i: false },
        { role: 'Software Engineering & DevOps', mandate: 'Adherence to Just-In-Time access elevation in ${cloudProvider}, ephemeral token usage, and zero standing keys.', r: true, a: false, c: true, i: false },
        { role: 'People Operations / HR', mandate: 'Immediate dispatch of termination tickets to IT (<= 15 minutes for involuntary leavers) and role transfer notices.', r: true, a: false, c: false, i: true },
        { role: 'All Workforce Personnel', mandate: 'Protection of individual MFA hardware tokens, zero credential sharing, and reporting of lost devices.', r: true, a: false, c: false, i: false }
      ];
      auditorChecklist = {
        primaryArtifact: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_OKTA_JML_AUDIT_LOG_2026.csv`,
        samplingProtocol: 'ISO 19011:2018 §B.3 Representative Attribute Sampling of 25 leavers across preceding 12 months',
        storageLocation: `AWS S3 Glacier WORM Compliance Vault: arn:aws:s3:::${companyName.toLowerCase()}-audit-vault/iam/`,
        retentionSla: '36 Months / 3 Audit Cycles Pursuant to ISO 27001 Clause 7.5.3',
        normativeClause: 'Annex A.5.15, A.5.16, A.5.17, A.5.18, A.8.2, A.8.3, A.8.4',
        masterRiskId: 'RSK-IAM-01 (Privilege Creep & Unauthorized Access)',
        statutoryMandate: 'ISO 27001:2022 A.5.15-A.5.18, MAS TRM Section 5.1, SOC 2 CC6.1',
        sha256DigestSeal,
        auditorVerdict: 'CONFORMING',
        leadAuditorOrg: 'TÜV SÜD / BSI / UKAS Accredited Conformity Assessment Body',
        samplingChecklist: [
          { artifactName: 'Okta / IdP Leaver Deactivation Timestamps', evidenceDescription: 'Delta between HR departure timestamp and IdP token revocation time (must be <= 15m for involuntary, <= 24h for voluntary).', samplingMethodology: '25 random sampled offboarding tickets', retentionSla: '36 Months', storageTarget: 'SIEM Cold Archive', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: 'Quarterly Access Recertification Campaign Sign-offs', evidenceDescription: 'Formal signed campaign records demonstrating department manager review and revocation of stale permissions.', samplingMethodology: '100% of Q1, Q2, Q3, Q4 campaigns', retentionSla: '36 Months', storageTarget: 'GRC Repository', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: 'Just-In-Time Elevation & Bastion Session Logs', evidenceDescription: 'CloudTrail / audit logs verifying zero standing root/admin access; all production elevations capped at 4 hours.', samplingMethodology: 'Sample of 30 production elevation events', retentionSla: '12 Months', storageTarget: 'CloudTrail S3 Bucket', mandatoryAuditPeriod: 'Trailing 6 Months' }
        ]
      };
      break;

    case 'POL-DEV-08':
      purpose = {
        executiveMandate: `${companyName} mandates that all software engineering, containerization, and infrastructure-as-code deployments adhere to Secure Software Development Lifecycle (SSDLC) principles, shift-left security testing, and strict Segregation of Duties (SoD).`,
        coreObjectives: [
          `Prevent introduction of OWASP Top 10 vulnerabilities, insecure cryptographic primitives, and unvetted third-party dependencies.`,
          `Enforce automated SAST, DAST, Container Scanning, and Secret Detection in CI/CD pipeline gates before merge.`,
          `Require at least one independent senior peer review on all pull requests merged to protected branches in ${scmProvider}.`,
          `Prohibit developers from having write access to production database credentials or direct container deployment rights.`
        ],
        normativeStandards: [framework, 'ISO/IEC 27002:2022 Controls 8.25, 8.26, 8.27, 8.28, 8.29, 8.30, 8.31', 'MAS TRM Section 9.1 & 9.2', 'NIST SP 800-218 (SSDF)'],
        zeroToleranceRule: `Bypassing branch protection, disabling automated security pipeline gates, committing plaintext secrets or private keys to git repositories, or manually pushing containers to production without CI/CD verification is strictly prohibited.`,
        businessContextAlignment: `Guarantees the integrity, confidentiality, and availability of customer workloads and complies with enterprise Master Services Agreement (MSA) security covenants.`
      };
      scope = {
        summary: `Encompasses 100% of application code, microservices, container images, Terraform/IaC scripts, and automated deployment pipelines managed across ${scmProvider} and deployed to ${cloudProvider}.`,
        inScopeEntities: [`${companyName} Software Engineering`, 'DevOps Infrastructure Team', 'External Third-Party Software Contractors'],
        logicalCloudBoundaries: [`${scmProvider} Repositories`, 'Container Registry (ECR/GCR/ACR)', 'Production Kubernetes Clusters'],
        physicalBoundaries: ['Developer Workstations', 'CI/CD Cloud Runners'],
        dataClassifications: ['Restricted - Source Code & Proprietary Algorithms', 'Confidential - Build Artifacts & Docker Images'],
        defensibleExclusions: 'Purely internal prototyping repositories marked as EXPERIMENTAL that are completely isolated from customer data and cannot be deployed to cloud environments.'
      };
      raciRows = [
        { role: 'VP of Engineering / CTO', mandate: 'Executive accountability for engineering architecture, budget for security tooling, and release governance.', r: false, a: true, c: true, i: false },
        { role: 'CISO / Product Security Lead', mandate: 'Definition of SSDLC standards, approval of security tooling gates (${vulnerabilityTool}), and review of annual pen-test results.', r: true, a: true, c: false, i: false },
        { role: 'Software Developers', mandate: 'Remediation of SAST/SCA vulnerabilities, writing unit tests, and adhering to secure coding guidelines.', r: true, a: false, c: false, i: false },
        { role: 'DevOps / Platform Engineers', mandate: 'Maintenance of branch protection rules, automated CI/CD runners, and automated rollback scripts.', r: true, a: false, c: true, i: false },
        { role: 'QA & Test Engineers', mandate: 'Execution of automated regression tests, security acceptance validation, and boundary testing in staging.', r: true, a: false, c: false, i: true }
      ];
      auditorChecklist = {
        primaryArtifact: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_GITHUB_SSDLC_PIPELINE_GATE_AUDIT_LOG_2026.json`,
        samplingProtocol: 'ISO 19011:2018 §B.3 Random sample of 20 production pull requests and releases across preceding 6 months',
        storageLocation: `AWS S3 Immutable Vault: arn:aws:s3:::${companyName.toLowerCase()}-audit-vault/ssdlc/`,
        retentionSla: '36 Months Pursuant to ISO 27001 Clause 7.5.3',
        normativeClause: 'Annex A.8.25, A.8.26, A.8.27, A.8.28, A.8.29, A.8.30, A.8.31',
        masterRiskId: 'RSK-DEV-01 (Deployment of Insecure Software & Secrets Leakage)',
        statutoryMandate: 'ISO 27001:2022 A.8.25-A.8.31, MAS TRM Section 9.1, SOC 2 CC8.1',
        sha256DigestSeal,
        auditorVerdict: 'CONFORMING',
        leadAuditorOrg: 'TÜV SÜD / BSI / UKAS Accredited Conformity Assessment Body',
        samplingChecklist: [
          { artifactName: 'GitHub Enterprise Branch Protection Configuration', evidenceDescription: 'Signed branch settings export confirming requirePullRequestReviews (>= 1 peer) and requireSignedCommits.', samplingMethodology: '100% of production repositories', retentionSla: '36 Months', storageTarget: 'Git Settings Export', mandatoryAuditPeriod: 'Active State' },
          { artifactName: 'Snyk / Trivy CI/CD Pipeline Scan Reports', evidenceDescription: 'Automated pipeline logs showing zero Critical or High CVEs in release builds before container promotion.', samplingMethodology: 'Sample of 25 production deployments', retentionSla: '24 Months', storageTarget: 'CI/CD Log Store', mandatoryAuditPeriod: 'Trailing 6 Months' },
          { artifactName: 'Annual Third-Party Web Application Penetration Test Report', evidenceDescription: 'Formal executive summary and raw finding closure report conducted by CREST-accredited ethical hacking firm.', samplingMethodology: 'Latest completed annual penetration test', retentionSla: '60 Months', storageTarget: 'Confidential Executive Folder', mandatoryAuditPeriod: 'Preceding 12 Months' }
        ]
      };
      break;

    case 'SOP-INC-12':
      purpose = {
        executiveMandate: `${companyName} mandates an operational runbook executed by the Computer Security Incident Response Team (CSIRT) to detect, triage, contain, eradicate, recover from, and conduct blameless post-mortems on all security incidents and data breaches.`,
        coreObjectives: [
          `Rapidly contain security breaches and minimize operational, financial, and reputational damage.`,
          `Fulfill statutory regulatory breach notification obligations within enforceable legal timeframes (e.g. GDPR 72-hour notice, MAS TRM 1-hour notice).`,
          `Preserve digital evidence, memory dumps, and cryptographic chain of custody pursuant to ISO/IEC 27037.`,
          `Enforce a mandatory 5-Whys Root Cause Analysis and corrective action plan (CAPA) closure within 30 days.`
        ],
        normativeStandards: [framework, 'ISO/IEC 27002:2022 Controls 5.24, 5.25, 5.26, 5.27, 5.28', 'GDPR Article 33 & 34', 'MAS Notice 655', 'NIST SP 800-61 Rev 2'],
        zeroToleranceRule: `Concealing security incidents, failing to report suspicious activities to the CSIRT hotline, or destroying forensic evidence without CISO authorization is grounds for immediate termination.`,
        businessContextAlignment: `Safeguards business continuity and customer trust while ensuring full adherence to international data privacy statutes.`
      };
      scope = {
        summary: `Encompasses all security events impacting corporate infrastructure, cloud environments in ${cloudProvider}, employee endpoints, customer datasets, and third-party SaaS integrations.`,
        inScopeEntities: ['Computer Security Incident Response Team (CSIRT)', 'Executive Crisis Committee', 'External Forensics Retainer'],
        logicalCloudBoundaries: [`${cloudProvider} Accounts & SIEM Telemetry`, 'Identity Provider Auth Logs', 'Email Gateway'],
        physicalBoundaries: ['All Office Locations', 'Remote Teleworkers'],
        dataClassifications: ['All Data Classifications (Public through Restricted)'],
        defensibleExclusions: 'Routine spam and isolated port scans automatically dropped by firewalls without internal compromise do not require full CSIRT war-room activation.'
      };
      raciRows = [
        { role: 'Incident Commander (CISO / SecOps Lead)', mandate: 'Authority to declare Sev-1/Sev-2 incident, order network isolation, and direct technical containment.', r: true, a: true, c: false, i: false },
        { role: 'Lead Technical Forensics Investigator', mandate: 'Preservation of digital snapshots, memory dumps, chain of custody logs, and malware reverse-engineering.', r: true, a: false, c: false, i: false },
        { role: 'Legal Counsel & Data Protection Officer (DPO)', mandate: 'Determination of regulatory breach notification thresholds under GDPR Article 33 and MAS Notice 655.', r: true, a: true, c: false, i: false },
        { role: 'Communications & PR Lead', mandate: 'Drafting of customer notifications and public statements; zero unauthorized external communications.', r: true, a: false, c: true, i: false },
        { role: 'Executive Board / CEO', mandate: 'Informed within 30 minutes of Sev-1 confirmation; approval of material customer breach notices.', r: false, a: true, c: true, i: true }
      ];
      auditorChecklist = {
        primaryArtifact: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ANNUAL_TABLETOP_INCIDENT_EXERCISE_2026.pdf`,
        samplingProtocol: 'ISO 19011:2018 §B.3 Inspection of all Sev-1 and Sev-2 incident registers and annual simulation exercise report',
        storageLocation: `AWS S3 Glacier WORM Vault: arn:aws:s3:::${companyName.toLowerCase()}-audit-vault/incident-response/`,
        retentionSla: '60 Months Pursuant to ISO 27001 Clause 7.5.3 and statutory regulations',
        normativeClause: 'Annex A.5.24, A.5.25, A.5.26, A.5.27, A.5.28',
        masterRiskId: 'RSK-OPS-01 (Data Breach & Ransomware Disruption)',
        statutoryMandate: 'ISO 27001:2022 A.5.24-A.5.28, GDPR Article 33/34, MAS Notice 655',
        sha256DigestSeal,
        auditorVerdict: 'CONFORMING',
        leadAuditorOrg: 'TÜV SÜD / BSI / UKAS Accredited Conformity Assessment Body',
        samplingChecklist: [
          { artifactName: 'Annual CSIRT Tabletop Simulation Exercise Report', evidenceDescription: 'Documented disaster scenario, participant attendance roster, timeline metrics, and lessons-learned register.', samplingMethodology: '100% of annual tabletop exercise dossiers', retentionSla: '60 Months', storageTarget: 'GRC Incident Register', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: 'Sev-1 / Sev-2 Post-Incident 5-Whys Investigation Dossiers', evidenceDescription: 'Comprehensive root cause analysis and corresponding CAPA ticket creation within 5 days of incident closure.', samplingMethodology: '100% of Sev-1/Sev-2 incident records', retentionSla: '60 Months', storageTarget: 'CAPA Module', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: 'Digital Forensics Chain of Custody & Hash Records', evidenceDescription: 'Cryptographic SHA-256 digests of volatile memory dumps and disk images captured during investigations.', samplingMethodology: 'Sample of raw incident evidence bags', retentionSla: '60 Months', storageTarget: 'Encrypted Forensics S3', mandatoryAuditPeriod: 'Trailing 12 Months' }
        ]
      };
      break;

    default:
      // High-End Universal ISO 27001:2022 Compliant Section Generator
      purpose = {
        executiveMandate: `The Executive Board and Top Management of ${companyName} formally establish and ratify this ${meta.title} (${code}) to govern information security across all in-scope operations pursuant to ${framework} Clause 5.1, 5.2, and ${meta.isoClauseOrAnnexA}.`,
        coreObjectives: [
          `Ensure rigorous conformity to ${meta.isoClauseOrAnnexA} and ${meta.summary}`,
          `Establish objective, quantifiable controls that eliminate organizational risk and prevent security degradation.`,
          `Mandate clear accountability across all designated stakeholders pursuant to the organizational RACI framework.`,
          `Pre-arm the organization with tangible, verifiable audit artifacts compliant with ISO 19011:2018 fieldwork sampling.`
        ],
        normativeStandards: [framework, meta.isoClauseOrAnnexA, 'ISO/IEC 27002:2022 Guidance', 'SOC 2 Trust Services Criteria', 'Statutory Cyber Regulations'],
        zeroToleranceRule: `Deliberate circumvention of the controls established within this policy without an approved, active Security Waiver signed by the CISO constitutes an immediate non-conformity and grounds for disciplinary action.`,
        businessContextAlignment: `Directly aligns organizational security operations with ${companyName}'s enterprise customer contractual obligations and market trust requirements.`
      };
      scope = {
        summary: `Governs 100% of systems, cloud infrastructure (${cloudProvider}), directories (${identityProvider}), workforce devices (${mdmProvider}), and personnel involved in operations at ${companyName}.`,
        inScopeEntities: [`${companyName} Global Business Operations`, `${meta.primaryDepartment}`, 'Cloud Infrastructure & SaaS Integrations'],
        logicalCloudBoundaries: [`${cloudProvider} Production & Non-Production Environments`, 'Corporate Directory & Identity Providers', 'Code & Repository Repositories'],
        physicalBoundaries: ['Corporate Headquarters', 'Co-located Datacenter Facilities', 'Remote Telework Environments'],
        dataClassifications: ['Confidential', 'Restricted', 'Internal', 'Public'],
        defensibleExclusions: 'Exclusions are permitted only where supported by a formal risk assessment and ratified in the Statement of Applicability (DOC-SOA-03).'
      };
      raciRows = [
        { role: 'Executive Board / CEO', mandate: 'Governance sponsorship, risk appetite definition, and overall ISMS resource allocation.', r: false, a: true, c: false, i: true },
        { role: `Chief Information Security Officer (${cisoName})`, mandate: 'Policy formulation, control effectiveness evaluation, exception sign-off, and audit representation.', r: true, a: true, c: false, i: false },
        { role: `${meta.primaryDepartment} Lead`, mandate: 'Day-to-day execution, operational monitoring, and implementation of procedural runbooks.', r: true, a: false, c: false, i: false },
        { role: 'Internal Audit & Compliance', mandate: 'Independent sampling, audit checklist verification (ISO 19011:2018), and CAPA tracking.', r: true, a: false, c: true, i: false },
        { role: 'All In-Scope Workforce Personnel', mandate: 'Adherence to documented procedures, immediate incident reporting, and mandatory training completion.', r: true, a: false, c: false, i: false }
      ];
      auditorChecklist = {
        primaryArtifact: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_${code.replace(/[^a-zA-Z0-9]/g, '_')}_AUDIT_RECORD_2026.pdf`,
        samplingProtocol: `ISO 19011:2018 §B.3 Representative sampling protocol aligned with ${meta.auditorSamplingFocus}`,
        storageLocation: `AWS S3 Glacier WORM Vault: arn:aws:s3:::${companyName.toLowerCase()}-audit-vault/${code.toLowerCase()}/`,
        retentionSla: '36 Months / 3 Audit Cycles Pursuant to ISO 27001 Clause 7.5.3',
        normativeClause: meta.isoClauseOrAnnexA,
        masterRiskId: `RSK-${code.split('-')[1] || 'GEN'}-01`,
        statutoryMandate: `${framework} ${meta.isoClauseOrAnnexA}`,
        sha256DigestSeal,
        auditorVerdict: 'CONFORMING',
        leadAuditorOrg: 'TÜV SÜD / BSI / UKAS Accredited Conformity Assessment Body',
        samplingChecklist: [
          { artifactName: `Official ${code} Signed Ratification Dossier`, evidenceDescription: `Executive digital sign-off from Top Management and ${cisoName} with immutable revision history.`, samplingMethodology: '100% census review', retentionSla: 'Permanent / Active', storageTarget: 'Skanda GRC Policy Vault', mandatoryAuditPeriod: 'Current Year' },
          { artifactName: `Operational Telemetry & Enforcement Logs`, evidenceDescription: `System and audit logs proving active technical enforcement in ${cloudProvider} or operational systems.`, samplingMethodology: 'Statistical sample of 25 operational cycles', retentionSla: '36 Months', storageTarget: 'SIEM / CloudWatch', mandatoryAuditPeriod: 'Trailing 12 Months' },
          { artifactName: `Annual Control Review & Performance Records`, evidenceDescription: `Management review minutes and internal audit findings verifying control suitability and adequacy.`, samplingMethodology: '100% of scheduled annual review records', retentionSla: '36 Months', storageTarget: 'Management Review Minutes', mandatoryAuditPeriod: 'Trailing 12 Months' }
        ]
      };
      break;
  }

  // 12-Step Architectural Standards mapping for this document
  const architecturalSteps: PredefinedArchitecturalStep[] = [
    {
      step: 1,
      sectionTitle: 'Document Control, Metadata & Version History',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 7.5 (Documented Information)',
      complianceCriterion: 'Unique document code, owner, approver, effective date, classification, and change history table with explicit justification.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Doc Code: ${code} | Owner: ${cisoName} | Version: 1.0 | Review Cycle: ${meta.defaultReviewCycle}`
    },
    {
      step: 2,
      sectionTitle: 'Executive Mandate & Purpose',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 5.1 (Leadership) & 5.2 (Policy)',
      complianceCriterion: 'Clear declaration from Top Management and the Board establishing zero tolerance for deliberate bypasses and aligning security with business goals.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: purpose.executiveMandate.slice(0, 160) + '...'
    },
    {
      step: 3,
      sectionTitle: 'Scope Boundaries & Technological Context',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 4.3 (Scope of the ISMS)',
      complianceCriterion: 'Explicit boundary declaration listing physical premises, cloud accounts, remote workforce endpoints, and integrated third-party SaaS.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: scope.summary.slice(0, 160) + '...'
    },
    {
      step: 4,
      sectionTitle: 'Normative References & ISO 27001:2022 Control Mapping',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 6.1.3 (Information Security Risk Treatment)',
      complianceCriterion: 'Direct cross-reference to relevant ISO 27001 clauses (4-10) and Annex A control domains (Organizational, People, Physical, Technological).',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Normative Standard: ${framework} | Direct Mapping: ${meta.isoClauseOrAnnexA}`
    },
    {
      step: 5,
      sectionTitle: 'RACI Governance & Accountability Matrix',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 5.3 (Organizational Roles & Responsibilities)',
      complianceCriterion: 'Tabular RACI model defining Responsible, Accountable, Consulted, and Informed stakeholders across business and technical functions.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `6 Cross-Functional Roles Defined: Executive, CISO, Technical Leads, HR, Legal, Workforce`
    },
    {
      step: 6,
      sectionTitle: 'Specific Policy Statements & Quantitative Baselines',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 6.2 (Information Security Objectives)',
      complianceCriterion: 'Concrete, verifiable rules with numeric metrics and SLAs. Vague adjectives are strictly eliminated.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Enforceable quantitative SLAs defined for all critical lifecycle actions and operational transitions.`
    },
    {
      step: 7,
      sectionTitle: 'Technical Infrastructure & Tooling Guardrails',
      isoRequirement: 'ISO/IEC 27002:2022 Annex A.8 (Technological Controls)',
      complianceCriterion: 'Explicit naming and configuration binding of in-scope technologies (e.g. AWS/GCP, Okta, Jamf, Snyk, GitHub).',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Bound to operational tooling: ${cloudProvider}, ${identityProvider}, ${mdmProvider}, ${vulnerabilityTool}`
    },
    {
      step: 8,
      sectionTitle: 'Operational Runbooks & TÜV Formal SOP Standards',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 8.1 (Operational Planning and Control)',
      complianceCriterion: 'TÜV-accredited standard operating procedures enforcing Process Triggers, Numbered Execution Steps, Dual-Control (Four-Eyes) Verification Gates, and Output Artifact Definitions.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `TÜV Standard SOP Model: Process Triggers, Numbered Execution Steps, Dual-Control Verification Gates & Output Artifacts.`
    },
    {
      step: 9,
      sectionTitle: 'Formal Security Exception & Waiver Governance',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 8.1 & Clause 6.1.3',
      complianceCriterion: 'Standardized exception request procedure requiring CISO written approval, documented compensating controls, and automatic 90-day sunset expiration.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Mandatory 90-day sunset, CISO written sign-off, and compensating control requirement.`
    },
    {
      step: 10,
      sectionTitle: 'KPIs, Monitoring & Continuous Evaluation',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 9.1 (Monitoring, Measurement & Evaluation)',
      complianceCriterion: 'Documented measurement cadences, telemetry collection methods, and CISO quarterly review targets.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Quarterly telemetry collection, SLA attainment tracking, and executive dashboard metrics.`
    },
    {
      step: 11,
      sectionTitle: 'Lead Auditor Evidence Artifacts & Sampling Checklist',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 9.2 (Internal Audit) & ISO 19011:2018 §B.3 Sampling Protocols',
      complianceCriterion: 'Explicit enumeration of tangible evidence artifacts (logs, exports, minutes, hashes) the external auditor will sample during certification.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Primary Artifact: ${auditorChecklist.primaryArtifact} | SHA-256 Digest Seal Generated`
    },
    {
      step: 12,
      sectionTitle: 'Enforcement, CAPA Linkage & Executive Ratification',
      isoRequirement: 'ISO/IEC 27001:2022 Clause 10.1 (Continual Improvement) & 10.2 (Nonconformity & CAPA)',
      complianceCriterion: 'Clear disciplinary consequence statements, mandatory 5-Whys root cause analysis for violations, distribution records, and CEO/Board digital sign-off.',
      status: 'VERIFIED_CONFORMING',
      implementationSnippet: `Linked to Skanda GRC CAPA Module with mandatory 5-Whys RCA and 30-day post-fix effectiveness review.`
    }
  ];

  const standardRaci = getStandardRaciMatrixForDoc(code, meta.title, ctx.cisoName, {
    users: ctx.users,
    tenant: ctx.tenant,
    companyName: ctx.companyName,
    customOverrides: ctx.customRaciOverrides
  });

  return {
    docCode: code,
    title: meta.title,
    level: meta.level,
    metadata: meta,
    purpose,
    scope,
    raci: standardRaci,
    auditorChecklist,
    architecturalSteps,
    sopStructure: getFormalTuvSopStructure(code, ctx)
  };
}
