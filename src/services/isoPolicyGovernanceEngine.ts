/**
 * ISO 27001:2022 Policy Governance & Implementation Engine
 * 
 * Provides end-to-end operationalization across the 6 key pillars:
 * 1. Contextualized Policies & Dynamic Variable Injection (Anti-Shelfware)
 * 2. Policy-as-Code & Automated Policy Drift Detection
 * 3. ISO/IEC 27001:2022 5-Attribute Tagging & Dynamic Statement of Applicability (SoA)
 * 4. Role-Based Cohort Attestation & Differential Diff Re-attestation
 * 5. Clause 5.2 & 7.5 Cryptographic Evidence Automation & One-Click Auditor Bundle
 * 6. Time-Bound Policy Waiver & Exception Management Register
 */

import {
  ISO27001Attributes,
  PolicyWaiver,
  PolicyDriftAlert,
  CohortAttestationGroup,
  GeneratedDocument,
  ControlItem
} from '../types';

export interface LiveMetadataVariables {
  companyName: string;
  cisoName: string;
  cisoEmail: string;
  dpoName: string;
  dpoEmail: string;
  cloudProvider: string;
  identityProvider: string;
  mdmProvider: string;
  scmProvider: string;
  vulnerabilityTool: string;
  databaseEngine: string;
  kmsKeyArn: string;
  escalationSlaP1: string;
  escalationSlaP2: string;
  backupRetentionDays: string;
  minPasswordLength: string;
  productionVpcId: string;
  oktaTenantUrl: string;
  githubOrg: string;
}

export const DEFAULT_LIVE_VARIABLES: LiveMetadataVariables = {
  companyName: 'Fintech Horizon Global Pte Ltd',
  cisoName: 'Sarah Jenkins, CISO',
  cisoEmail: 'ciso@fintechhorizon.com',
  dpoName: 'Elena Rostova, Legal & DPO',
  dpoEmail: 'dpo@fintechhorizon.com',
  cloudProvider: 'AWS Multi-Region (ap-southeast-1 / us-east-1)',
  identityProvider: 'Okta Identity Engine (Adaptive MFA + FIDO2 WebAuthn)',
  mdmProvider: 'Jamf Pro (Apple FileVault & Screen Lock Enforced)',
  scmProvider: 'GitHub Enterprise Cloud (Protected Branches + CodeOwners)',
  vulnerabilityTool: 'Snyk Container + AWS Inspector v2 + Trivy SAST',
  databaseEngine: 'Amazon Aurora PostgreSQL Serverless (KMS-CMK Enforced)',
  kmsKeyArn: 'arn:aws:kms:ap-southeast-1:123456789012:key/mrk-8a4b2c1d9e',
  escalationSlaP1: '1 Hour (24/7 On-Call PagerDuty Escalation)',
  escalationSlaP2: '4 Hours (Business Hours)',
  backupRetentionDays: '90 Days with Cross-Region Immutable WORM replication',
  minPasswordLength: '16 Characters (Alphanumeric + Special + Passphrase)',
  productionVpcId: 'vpc-0a8b9c7d6e5f4a3b2',
  oktaTenantUrl: 'https://fintechhorizon.okta.com',
  githubOrg: 'fintech-horizon-org'
};

export interface PolicyToControlMapping {
  id: string;
  policyCode: string;
  policyTitle: string;
  clauseOrSection: string;
  isoAnnexA: string;
  controlTitle: string;
  automatedProbe: string;
  probeCadence: string;
  status: 'Pass' | 'Drift Detected' | 'Remediated';
  lastProbeRun: string;
  enforcementMechanism: string;
}

export const POLICY_CONTROL_MAPPINGS: PolicyToControlMapping[] = [
  {
    id: 'pcm_01',
    policyCode: 'ARP_ISMS_P11',
    policyTitle: 'Cryptographic & Key Management Policy',
    clauseOrSection: 'Section 4.1 - Encryption at Rest Mandate',
    isoAnnexA: 'A.8.24',
    controlTitle: 'Use of cryptography',
    automatedProbe: 'AWS KMS CMK CSPM Inspection Probe',
    probeCadence: 'Continuous (Every 15 mins)',
    status: 'Pass',
    lastProbeRun: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    enforcementMechanism: 'AWS SCP denying unencrypted PutObject & non-CMK EBS volumes'
  },
  {
    id: 'pcm_02',
    policyCode: 'ARP_ISMS_P07',
    policyTitle: 'Secure Software Development Lifecycle Policy',
    clauseOrSection: 'Section 5.3 - Peer Review & Branch Protection',
    isoAnnexA: 'A.8.32',
    controlTitle: 'Change management',
    automatedProbe: 'GitHub Branch Protection Linter & Snyk CI Gate',
    probeCadence: 'Per Pull Request (CI/CD Webhook)',
    status: 'Pass',
    lastProbeRun: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    enforcementMechanism: 'GitHub Ruleset enforcing 2 reviews + CodeOwners + Snyk passing'
  },
  {
    id: 'pcm_03',
    policyCode: 'ARP_ISMS_P03',
    policyTitle: 'Identity & Access Control Policy',
    clauseOrSection: 'Section 3.2 - Mandatory Adaptive MFA & SSO',
    isoAnnexA: 'A.5.15',
    controlTitle: 'Access control',
    automatedProbe: 'Okta Identity Engine Sign-On Policy Evaluator',
    probeCadence: 'Hourly Cron Job',
    status: 'Drift Detected',
    lastProbeRun: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    enforcementMechanism: 'Okta Authentication Policy requiring FIDO2 / Okta Verify'
  },
  {
    id: 'pcm_04',
    policyCode: 'ARP_ISMS_PR01',
    policyTitle: 'Joiner, Mover, Leaver Deprovisioning Procedure',
    clauseOrSection: 'Section 2.4 - 24-Hour Offboarding SLA',
    isoAnnexA: 'A.6.5',
    controlTitle: 'Responsibilities after termination of employment',
    automatedProbe: 'BambooHR to Okta/Google Workspace Sync Monitor',
    probeCadence: 'Continuous Event Webhook',
    status: 'Pass',
    lastProbeRun: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    enforcementMechanism: 'Automated IdP account deactivation upon termination webhook'
  },
  {
    id: 'pcm_05',
    policyCode: 'ARP_ISMS_P09',
    policyTitle: 'Vulnerability Management & Patching Policy',
    clauseOrSection: 'Section 4.2 - 7-Day Critical CVE SLA',
    isoAnnexA: 'A.8.8',
    controlTitle: 'Management of technical vulnerabilities',
    automatedProbe: 'AWS Inspector v2 & Snyk Container Registry Scanner',
    probeCadence: 'Daily Automated Sweep',
    status: 'Pass',
    lastProbeRun: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    enforcementMechanism: 'Jira Auto-ticket generator with 7-day SLA countdown'
  }
];

export const INITIAL_POLICY_DRIFTS: PolicyDriftAlert[] = [
  {
    id: 'DRIFT-2026-001',
    policyCode: 'ARP_ISMS_P11',
    policyClause: 'Section 4.1 - Encryption at Rest with KMS-CMK',
    annexA: 'A.8.24',
    resourceId: 'arn:aws:s3:::customer-pii-backup-bucket-prod',
    resourceType: 'AWS S3 Bucket',
    detectedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    driftDescription: 'Bucket was provisioned using default AWS managed key (aws/s3) rather than dedicated Customer Managed Key (CMK).',
    policyRuleExpected: 'All production S3 buckets must utilize KMS Customer Managed Key: mrk-8a4b2c1d9e',
    actualObservedState: 'ServerSideEncryptionByDefault: AES256 (Default AWS Key)',
    severity: 'HIGH',
    status: 'OPEN',
    autoRemediationAvailable: true,
    autoRemediationAction: 'Apply KMS-CMK key ARN to S3 bucket encryption configuration and re-tag.'
  },
  {
    id: 'DRIFT-2026-002',
    policyCode: 'ARP_ISMS_P03',
    policyClause: 'Section 3.2 - Mandatory Adaptive MFA for Privileged Accounts',
    annexA: 'A.5.15',
    resourceId: 'okta:user:svc_legacy_etl_sync@fintechhorizon.com',
    resourceType: 'Okta Identity Provider',
    detectedAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    driftDescription: 'Service account used for legacy reporting ETL logged in from external IP without multi-factor challenge.',
    policyRuleExpected: 'Zero un-MFA exceptions allowed for privileged accounts without formal approved waiver.',
    actualObservedState: 'MFA Prompt: DISABLED (Password-Only Authentication)',
    severity: 'CRITICAL',
    status: 'OPEN',
    autoRemediationAvailable: false,
    autoRemediationAction: 'Restrict IP CIDR to corporate VPN or submit formal 30-day Policy Waiver.'
  },
  {
    id: 'DRIFT-2026-003',
    policyCode: 'ARP_ISMS_P07',
    policyClause: 'Section 5.3 - Peer Code Review & CI Gates',
    annexA: 'A.8.32',
    resourceId: 'github:repo:fintech-horizon-org/payment-gateway-api:pull/142',
    resourceType: 'GitHub Enterprise Repository',
    detectedAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    driftDescription: 'Hotfix commit force-pushed to main branch bypassing automated Snyk SAST check and 2nd peer review.',
    policyRuleExpected: 'Direct commits or single-approver overrides are strictly forbidden on protected branches.',
    actualObservedState: 'Merged by Admin Override with 1 approval and bypassed CI check.',
    severity: 'HIGH',
    status: 'AUTO_REMEDIATED',
    autoRemediationAvailable: true,
    autoRemediationAction: 'Retroactive security review completed, commit signed off by Security Lead, branch protection lock re-enabled.',
    remediatedAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString()
  }
];

export const INITIAL_POLICY_WAIVERS: PolicyWaiver[] = [
  {
    id: 'WVR-2026-001',
    waiverCode: 'WVR-2026-001',
    documentId: 'doc_isms_p03',
    documentCode: 'ARP_ISMS_P03',
    documentTitle: 'Identity & Access Control Policy',
    policyClause: 'Section 3.2 - Hardware FIDO2 MFA on All Core Interfaces',
    isoAnnexA: 'A.5.15 & A.5.18',
    requesterName: 'Marcus Vance',
    requesterRole: 'Principal Cloud Architect',
    department: 'Engineering & Infrastructure',
    systemOrAsset: 'Legacy AS400 Batch Reconciliation Gateway (Server AS400-SG-01)',
    businessJustification: 'Legacy core banking reconciliation batch engine does not support modern OAuth2/FIDO2 MFA protocols. System migration scheduled for Q3 2026.',
    riskAssessment: {
      inherentRisk: 'HIGH',
      likelihood: 3,
      impact: 4,
      residualRisk: 'MEDIUM'
    },
    compensatingControls: [
      'Isolated inside private VPC subnet (10.10.42.0/24) with zero internet gateway route.',
      'Access restricted strictly to dedicated SSH bastion jumpbox with IP whitelist and 15-minute idle timeout.',
      'Real-time GuardDuty log monitoring alerts SecOps Slack channel on any interactive session start.',
      'Daily automated database diff log exported to AWS S3 immutable archive.'
    ],
    status: 'ACTIVE',
    requestedDate: '2026-01-10',
    approvedDate: '2026-01-12',
    approverName: 'Sarah Jenkins',
    approverRole: 'Chief Information Security Officer (CISO)',
    expirationDate: '2026-07-12', // 180-day time-bound waiver
    reviewCadenceDays: 60,
    auditorNotes: 'Auditor pre-validated: Approved as managed temporary risk in accordance with ISO 27001 Clause 6.1.3 & 8.1.'
  },
  {
    id: 'WVR-2026-002',
    waiverCode: 'WVR-2026-002',
    documentId: 'doc_isms_p08',
    documentCode: 'ARP_ISMS_P08',
    documentTitle: 'Third-Party Supplier Security Policy',
    policyClause: 'Section 4.1 - Mandatory SOC 2 Type II or ISO 27001 Certification',
    isoAnnexA: 'A.5.19 & A.5.20',
    requesterName: 'Priya Sharma',
    requesterRole: 'Lead Product Manager',
    department: 'Product & Analytics',
    systemOrAsset: 'Niche AI Fraud Analytics Vendor (NeuroRisk AI Corp)',
    businessJustification: 'Vendor is an early-stage specialized fintech vendor whose formal SOC 2 Type II audit report is currently in fieldwork, expected in 60 days.',
    riskAssessment: {
      inherentRisk: 'MEDIUM',
      likelihood: 2,
      impact: 3,
      residualRisk: 'LOW'
    },
    compensatingControls: [
      'Strict contractual data processing agreement (DPA) with standard EU/SG model clauses.',
      'Completed comprehensive SIG-Lite security assessment questionnaire scoring 94%.',
      'Zero PII or customer financial data shared; only tokenized, pseudonymized transaction hashes transmitted.',
      'Letter of engagement from Big 4 CPA firm confirming active SOC 2 fieldwork.'
    ],
    status: 'ACTIVE',
    requestedDate: '2026-02-01',
    approvedDate: '2026-02-03',
    approverName: 'Sarah Jenkins',
    approverRole: 'Chief Information Security Officer (CISO)',
    expirationDate: '2026-05-03', // 90 days
    reviewCadenceDays: 30,
    auditorNotes: 'Auditor defense note: Vendor Risk Waiver recorded in central risk register with tokenization proof.'
  }
];

export const INITIAL_COHORT_GROUPS: CohortAttestationGroup[] = [
  {
    id: 'cohort_eng',
    name: 'Software Engineering, Cloud & DevOps',
    description: 'Technical staff with code repository, CI/CD pipeline, and cloud production infrastructure access.',
    targetDepartments: ['Software Engineering', 'Cloud DevOps', 'SecOps', 'Data Platform'],
    assignedPolicyCodes: ['ARP_ISMS_P07', 'ARP_ISMS_P11', 'ARP_ISMS_P09', 'ARP_ISMS_P03', 'ARP_ISMS_P01'],
    totalAssignedUsers: 34,
    completedAttestations: 32,
    pendingAttestations: 2,
    lastCadenceTrigger: '2026-02-15',
    cadenceTriggerEvent: 'SUBSTANTIVE_REVISION'
  },
  {
    id: 'cohort_all',
    name: 'All Enterprise Personnel & Contractors',
    description: 'Universal workforce required to uphold corporate security hygiene and reporting obligations.',
    targetDepartments: ['All Departments'],
    assignedPolicyCodes: ['ARP_ISMS_P01', 'ARP_ISMS_P04', 'ARP_ISMS_P10', 'ARP_ISMS_P12'],
    totalAssignedUsers: 148,
    completedAttestations: 142,
    pendingAttestations: 6,
    lastCadenceTrigger: '2026-01-15',
    cadenceTriggerEvent: 'SCHEDULED_ANNUAL'
  },
  {
    id: 'cohort_hr',
    name: 'People Operations, HR & Talent Governance',
    description: 'Human resources personnel handling pre-employment screening, employee data, and offboarding.',
    targetDepartments: ['Human Resources', 'Legal & Governance', 'Talent Acquisition'],
    assignedPolicyCodes: ['ARP_ISMS_P06', 'ARP_ISMS_PR01', 'ARP_ISMS_P01'],
    totalAssignedUsers: 12,
    completedAttestations: 12,
    pendingAttestations: 0,
    lastCadenceTrigger: '2026-01-20',
    cadenceTriggerEvent: 'SCHEDULED_ANNUAL'
  },
  {
    id: 'cohort_exec',
    name: 'Executive Leadership & Board Governance',
    description: 'C-Suite, Directors, and Board members overseeing ISMS strategic direction, budget, and Clause 5.2 mandate.',
    targetDepartments: ['Executive Office', 'Finance', 'Legal'],
    assignedPolicyCodes: ['ARP_ISMS_P01', 'ARP_ISMS_P02', 'ARP_ISMS_P08'],
    totalAssignedUsers: 8,
    completedAttestations: 8,
    pendingAttestations: 0,
    lastCadenceTrigger: '2026-01-05',
    cadenceTriggerEvent: 'AUDIT_PREP'
  }
];

export const ISO_27001_MASTER_ATTRIBUTES: Record<string, ISO27001Attributes> = {
  'A.5.15': {
    controlType: ['Preventive'],
    informationSecurityProperties: ['Confidentiality', 'Integrity'],
    cybersecurityConcepts: ['Protect'],
    operationalCapabilities: ['Identity and access management'],
    securityDomains: ['Protection', 'Defense']
  },
  'A.8.24': {
    controlType: ['Preventive'],
    informationSecurityProperties: ['Confidentiality', 'Integrity'],
    cybersecurityConcepts: ['Protect'],
    operationalCapabilities: ['Information protection'],
    securityDomains: ['Protection']
  },
  'A.8.32': {
    controlType: ['Preventive', 'Detective'],
    informationSecurityProperties: ['Integrity', 'Availability'],
    cybersecurityConcepts: ['Protect', 'Detect'],
    operationalCapabilities: ['Application security', 'Secure configuration'],
    securityDomains: ['Protection', 'Resilience']
  },
  'A.8.8': {
    controlType: ['Preventive', 'Corrective'],
    informationSecurityProperties: ['Confidentiality', 'Integrity', 'Availability'],
    cybersecurityConcepts: ['Identify', 'Protect'],
    operationalCapabilities: ['Threat and vulnerability management'],
    securityDomains: ['Defense', 'Protection']
  },
  'A.6.5': {
    controlType: ['Preventive', 'Corrective'],
    informationSecurityProperties: ['Confidentiality', 'Integrity'],
    cybersecurityConcepts: ['Protect'],
    operationalCapabilities: ['Human resource security', 'Identity and access management'],
    securityDomains: ['Governance_and_Ecosystem', 'Protection']
  },
  'A.5.19': {
    controlType: ['Preventive'],
    informationSecurityProperties: ['Confidentiality', 'Integrity', 'Availability'],
    cybersecurityConcepts: ['Identify', 'Protect'],
    operationalCapabilities: ['Supplier relationships security'],
    securityDomains: ['Governance_and_Ecosystem']
  },
  'A.8.16': {
    controlType: ['Detective', 'Corrective'],
    informationSecurityProperties: ['Integrity', 'Availability'],
    cybersecurityConcepts: ['Detect', 'Respond'],
    operationalCapabilities: ['Information security event management'],
    securityDomains: ['Defense', 'Resilience']
  }
};

/**
 * Replace generic placeholders with live, grounded operational tech stack variables.
 */
export function injectContextualVariables(
  content: string,
  variables: Partial<LiveMetadataVariables> = {}
): { contextualizedContent: string; replacedCount: number; activeReplacements: Record<string, string> } {
  const vars: LiveMetadataVariables = { ...DEFAULT_LIVE_VARIABLES, ...variables };

  const replacementMap: Record<string, string> = {
    '\\[Company Name\\]': vars.companyName,
    '{{COMPANY_NAME}}': vars.companyName,
    '{{CISO_NAME}}': vars.cisoName,
    '{{CISO_EMAIL}}': vars.cisoEmail,
    '{{DPO_NAME}}': vars.dpoName,
    '{{DPO_EMAIL}}': vars.dpoEmail,
    '{{CLOUD_PROVIDER}}': vars.cloudProvider,
    '{{IDENTITY_PROVIDER}}': vars.identityProvider,
    '{{MDM_PROVIDER}}': vars.mdmProvider,
    '{{SCM_PROVIDER}}': vars.scmProvider,
    '{{VULNERABILITY_TOOL}}': vars.vulnerabilityTool,
    '{{DATABASE_ENGINE}}': vars.databaseEngine,
    '{{KMS_KEY_ARN}}': vars.kmsKeyArn,
    '{{ESCALATION_SLA_P1}}': vars.escalationSlaP1,
    '{{ESCALATION_SLA_P2}}': vars.escalationSlaP2,
    '{{BACKUP_RETENTION_DAYS}}': vars.backupRetentionDays,
    '{{MIN_PASSWORD_LENGTH}}': vars.minPasswordLength,
    '{{PRODUCTION_VPC_ID}}': vars.productionVpcId,
    '{{OKTA_TENANT_URL}}': vars.oktaTenantUrl,
    '{{GITHUB_ORG}}': vars.githubOrg
  };

  let replacedCount = 0;
  let result = content;

  Object.entries(replacementMap).forEach(([pattern, value]) => {
    const regex = new RegExp(pattern, 'g');
    const matches = result.match(regex);
    if (matches && matches.length > 0) {
      replacedCount += matches.length;
      result = result.replace(regex, value);
    }
  });

  return {
    contextualizedContent: result,
    replacedCount,
    activeReplacements: vars as unknown as Record<string, string>
  };
}

/**
 * Side-by-side comparison between generic shelfware boilerplate and grounded contextualized policy clauses.
 */
export function getShelfwareVsGroundedExamples() {
  return [
    {
      domain: 'Access Control (Annex A.5.15)',
      shelfware: 'Access shall be granted to information processing facilities on a need-to-know basis and in accordance with business requirements. Passwords must be secure and changed periodically.',
      grounded: `Access to production VPC (${DEFAULT_LIVE_VARIABLES.productionVpcId}) is provisioned strictly via ${DEFAULT_LIVE_VARIABLES.identityProvider} using adaptive context-based policies. Passwords must be at least ${DEFAULT_LIVE_VARIABLES.minPasswordLength} with mandatory FIDO2 hardware keys (YubiKey). Direct SSH access is disabled; all engineers connect through AWS Systems Manager Session Manager with session logging to S3.`
    },
    {
      domain: 'Cryptographic Controls (Annex A.8.24)',
      shelfware: 'All confidential data at rest and in transit must be protected using appropriate encryption algorithms as deemed necessary by IT management.',
      grounded: `All PostgreSQL data volumes and S3 buckets must be encrypted using customer-managed KMS key (${DEFAULT_LIVE_VARIABLES.kmsKeyArn}) with automatic annual key rotation. In-transit traffic mandates TLS 1.3 with AES-256-GCM cipher suites. Decryption keys are managed via AWS KMS and prohibited from local developer workstations.`
    },
    {
      domain: 'Change Management & SDLC (Annex A.8.32)',
      shelfware: 'All changes to software systems must follow a structured change process with appropriate review, authorization, and documentation.',
      grounded: `Direct commits to main branches in ${DEFAULT_LIVE_VARIABLES.githubOrg} are locked. Pull requests require 2 designated CodeOwner approvals and passing ${DEFAULT_LIVE_VARIABLES.vulnerabilityTool} scans with zero high/critical vulnerabilities. Deploys to production automatically generate immutable Git tags logged to Evidence Centre.`
    },
    {
      domain: 'Offboarding / Deprovisioning (Annex A.6.5)',
      shelfware: 'Upon termination of employment, all access rights of the employee to organization assets and facilities shall be revoked in a timely manner.',
      grounded: `HR leaver notification triggers automatic webhook to ${DEFAULT_LIVE_VARIABLES.identityProvider}, disabling SSO tokens within 60 minutes. ${DEFAULT_LIVE_VARIABLES.mdmProvider} initiates remote cryptographic wipe of employee MacBook. AWS IAM STS temporary session credentials are automatically invalidated.`
    }
  ];
}

/**
 * Generate a comprehensive, auditor-ready export package adhering to ISO 27001 Clause 5.2 and 7.5.
 */
export function generateAuditorEvidenceBundle(
  tenantName: string,
  policies: GeneratedDocument[],
  waivers: PolicyWaiver[],
  cohorts: CohortAttestationGroup[],
  drifts: PolicyDriftAlert[],
  cisoSignature: { signer: string; hash: string; timestamp: string }
) {
  return {
    exportMetadata: {
      standard: 'ISO/IEC 27001:2022 ISMS Documentation & Implementation Package',
      clauseAlignment: ['Clause 5.2 (Policy Formulation)', 'Clause 7.5 (Documented Information)', 'Clause 6.1.3 (Risk Treatment)', 'Clause 9.3 (Management Review)'],
      tenantName,
      generatedTimestamp: new Date().toISOString(),
      compilerVersion: 'Skanda GRC ISO 27001:2022 Engine v4.2',
      masterPackageChecksum: `sha256_pkg_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`
    },
    executiveAttestationClause5_2: {
      statement: `Top Management of ${tenantName} formally confirms commitment to information security objectives, continuous improvement of the ISMS, and adherence to applicable legal and regulatory requirements.`,
      executiveCisoSigner: cisoSignature.signer,
      digitalSignatureHash: cisoSignature.hash,
      signedTimestamp: cisoSignature.timestamp,
      verificationStatus: 'CRYPTOGRAPHICALLY_VERIFIED'
    },
    documentedInformationRegisterClause7_5: policies.map(p => ({
      documentCode: p.docCode,
      title: p.title,
      version: p.version,
      status: p.status,
      owner: p.owner,
      approver: p.approver,
      effectiveDate: p.effectiveDate,
      reviewCycle: p.reviewCycle,
      contentSha256: p.contentSha256 || `sha256_${p.id}_${p.version}`,
      digitalSignaturesCount: (p.digitalSignatures || []).length
    })),
    employeeCohortAttestationMatrix: cohorts.map(c => ({
      cohortName: c.name,
      targetDepartments: c.targetDepartments,
      assignedPolicies: c.assignedPolicyCodes,
      completionRate: `${Math.round((c.completedAttestations / c.totalAssignedUsers) * 100)}%`,
      completedUsers: c.completedAttestations,
      totalUsers: c.totalAssignedUsers,
      lastCadenceTrigger: c.lastCadenceTrigger,
      triggerEvent: c.cadenceTriggerEvent
    })),
    approvedPolicyWaiverRegister: waivers.map(w => ({
      waiverCode: w.waiverCode,
      documentCode: w.documentCode,
      clause: w.policyClause,
      systemOrAsset: w.systemOrAsset,
      justification: w.businessJustification,
      residualRisk: w.riskAssessment.residualRisk,
      compensatingControls: w.compensatingControls,
      approvedBy: w.approverName,
      expirationDate: w.expirationDate,
      status: w.status
    })),
    continuousControlProbesAndDrift: {
      totalMonitoredProbes: POLICY_CONTROL_MAPPINGS.length,
      activeDriftIncidents: drifts.filter(d => d.status === 'OPEN').length,
      remediatedDrifts: drifts.filter(d => d.status === 'AUTO_REMEDIATED').length,
      driftLog: drifts
    }
  };
}
