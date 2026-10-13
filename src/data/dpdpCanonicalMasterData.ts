// ============================================================================
// SKANDA ENTERPRISE GRC: CANONICAL DPDP MASTER DATA & REGULATORY LIBRARY (PHASE DPDP-2)
// Path: src/data/dpdpCanonicalMasterData.ts
//
// Authoritative Regulatory Knowledge Base for:
// - Digital Personal Data Protection Act, 2023 (DPDP Act)
// - Digital Personal Data Protection Rules, 2025 (Notified 13-Nov-2025)
// - CERT-In Cybersecurity Directions, 2022 (6-Hour Incident Reporting)
// - Sectoral Regulatory Overlays (RBI, SEBI CSCRF, IRDAI, PMLA 2002)
// ============================================================================

import {
  DpdpRequirement,
  DpdpPersonalDataElement,
  DpdpProcessingActivity,
  DpdpPurposeEntry,
  DpdpPrivacyNotice,
  DpdpConsentRecord,
  DpdpRightRequest,
  DpdpRetentionRule,
  DpdpDeletionExecutionJob,
  DpdpProcessorProfile,
  DpdpPrivacyIncident,
  DpdpSdfAssessment,
  DpdpPrivacySignal,
  DpdpRegulatoryChangeItem,
  RegulatorySectorOverlayRule,
  CrossBorderTransferEvaluation,
  DeletionOrchestrationJob,
  CopilotAuditRecord
} from '../types/dpdpPlatformTypes';

// ============================================================================
// 1. MASTER REGULATORY REQUIREMENT LIBRARY (DPDP ACT 2023 & RULES 2025)
// ============================================================================

export const DPDP_REGULATORY_REQUIREMENTS: DpdpRequirement[] = [
  {
    id: 'DPDP-REQ-SEC-04',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 4 / Rule 3',
    title: 'Grounds for Processing Personal Data',
    officialText: 'A person may process the personal data of a Data Principal only in accordance with the provisions of this Act and for a lawful purpose for which consent has been given, or for certain legitimate uses.',
    implementationObjective: 'Enforce dual gating on all processing systems: verified explicit consent or statutory legitimate use basis recorded in RoPA.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries', 'All Data Processors'],
    mappedControlCodes: ['DPDP-CTRL-01', 'ISO-A.5.34'],
    evidenceRequirements: ['RoPA Lawful Basis Register', 'Consent Receipt Telemetry'],
    testProcedure: 'Sample 50 processing transactions and verify 100% trace to valid consent or Section 7 legitimate use.',
    ownerRole: 'Chief Privacy Officer / Legal Counsel',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rules 2025 aligned with Section 4 lawful grounds.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-05',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 5 / Rule 4',
    title: 'Notice for Seeking Consent & Clear Itemisation',
    officialText: 'Every request for consent shall be preceded or accompanied by an itemised notice containing the personal data to be collected, specified purpose, rights of Data Principal, and grievance redressal contact.',
    implementationObjective: 'Publish multilingual privacy notices in plain language with itemised data elements and direct links to consent withdrawal and grievance redressal.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries'],
    mappedControlCodes: ['DPDP-CTRL-02', 'ISO-A.5.1'],
    evidenceRequirements: ['Published Multilingual Notice PDF/HTML', 'Grievance Officer Appointment Letter'],
    testProcedure: 'Inspect notice endpoints across 22 Schedule VIII languages for itemisation and DPO contact accuracy.',
    ownerRole: 'Data Protection Officer (DPO)',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 4 mandated plain language readability standards.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-06',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 6 / Rule 5',
    title: 'Consent Architecture & Consent Manager Integration',
    officialText: 'Consent given by the Data Principal shall be free, specific, informed, unconditional, and unambiguous with clear affirmative action, and capable of being withdrawn with ease comparable to giving consent.',
    implementationObjective: 'Implement programmatic consent state management with immediate downstream processing restriction upon withdrawal and Consent Manager interoperability.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries', 'Registered Consent Managers'],
    mappedControlCodes: ['DPDP-CTRL-03', 'ISO-A.5.34'],
    evidenceRequirements: ['Consent Artifact Hashes', 'Automated Withdrawal Hook Verification Log'],
    testProcedure: 'Execute withdrawal test; confirm downstream systems halt non-essential processing within 15 minutes.',
    ownerRole: 'Privacy Engineering Lead',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 5 standardized interoperable Consent Manager API specs.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-08-01',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 8(1) / Rule 6',
    title: 'Obligations of Data Fiduciary: Reasonable Security Safeguards',
    officialText: 'The Data Fiduciary shall protect personal data in its possession or under its control by taking reasonable security safeguards to prevent personal data breach.',
    implementationObjective: 'Mandate AES-256 encryption at rest, TLS 1.3 in transit, role-based access control (RBAC), and continuous vulnerability management across all personal data repositories.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries', 'All Data Processors'],
    mappedControlCodes: ['DPDP-CTRL-04', 'ISO-A.8.24', 'ISO-A.8.20'],
    evidenceRequirements: ['KMS Key Configuration', 'SOC 2 Type II Bridge Letter', 'DAST/SAST Reports'],
    testProcedure: 'Execute vulnerability scan on PII databases; verify zero unencrypted plaintext data stores.',
    ownerRole: 'Chief Information Security Officer (CISO)',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 6 benchmarked ISO 27001 / SOC 2 controls as reasonable safeguards.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-08-06',
    source: 'DPDP_RULES_2025',
    sectionOrRuleNumber: 'Section 8(6) & Rule 7',
    title: 'Personal Data Breach Intimation to DPBI & Data Principals (Phased Commencement)',
    officialText: 'In the event of a personal data breach, the Data Fiduciary shall give the Board and each affected Data Principal intimation of such breach in such form, manner and within such time as prescribed under Rule 7.',
    implementationObjective: 'Maintain a structured breach forensic triage workflow capable of generating statutory DPBI Form-A intimation and direct Data Principal communications upon commencement.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2026-11-13',
    commencementStatus: 'COMING_INTO_FORCE',
    currentStatus: 'COMING_INTO_FORCE',
    futureStatus: 'IN_FORCE',
    futureEffectiveDate: '2026-11-13',
    isLegallyEnforceableCurrently: false,
    customerAdoptionStatus: 'EARLY_ADOPTION',
    applicability: ['All Data Fiduciaries'],
    mappedControlCodes: ['DPDP-CTRL-05', 'ISO-A.5.24'],
    evidenceRequirements: ['Incident Response Playbook', 'Mock Breach Simulation Report', 'DPBI Form-A Template'],
    testProcedure: 'Conduct tabletop simulation of database exfiltration; verify notification packet generates within 4 hours.',
    ownerRole: 'Incident Response Commander / DPO',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 7 notified with 12-month phased commencement runway.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'CERT-IN-REQ-DIR-2022-06',
    source: 'CERT_IN_DIRECTIONS_2022',
    sectionOrRuleNumber: 'Section 70B(6) IT Act 2000 / CERT-In Directions 2022, Para 6(ii)',
    title: 'Statutory 6-Hour Cybersecurity Incident Reporting',
    officialText: 'Any service provider, intermediary, data centre, body corporate and Government organisation shall mandatorily report cyber incidents to CERT-In within 6 hours of noticing or being brought to notice.',
    implementationObjective: 'Enforce an automated 6-hour forensic clock from the exact discovery timestamp to submit mandatory Annexure-I intimation to incident@cert-in.org.in.',
    version: '2022.1',
    notifiedDate: '2022-04-28',
    effectiveDate: '2022-06-28',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    sectorOverlays: ['CROSS_INDUSTRY_ENTERPRISE', 'FINTECH_BANKING', 'SECURITIES_CAPITAL_MARKETS'],
    applicability: ['All Corporate Entities', 'Cloud Service Providers', 'Intermediaries'],
    mappedControlCodes: ['DPDP-CTRL-05', 'ISO-A.5.24', 'MAS-TRM-12.1'],
    evidenceRequirements: ['CERT-In Annexure-I Submission Proof', 'Incident Clock Ledger Entry'],
    testProcedure: 'Trigger mock incident; confirm CERT-In clock initializes with strict 6-hour countdown.',
    ownerRole: 'Chief Information Security Officer (CISO)',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2022-04-28', changeNote: 'CERT-In statutory 6-hour notification mandate issued.', author: 'MeitY / CERT-In' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-08-07',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 8(7) / Rule 8',
    title: 'Data Retention & Purpose-Complete Erasure',
    officialText: 'A Data Fiduciary shall erase personal data upon the Data Principal withdrawing consent or as soon as it is reasonable to assume that the specified purpose is no longer being served, unless retention is necessary under law.',
    implementationObjective: 'Enforce automated retention schedules, legal hold blocks, and cryptographic erasure proofs across cloud data stores.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries'],
    mappedControlCodes: ['DPDP-CTRL-06', 'ISO-A.8.10'],
    evidenceRequirements: ['Automated Purge Cron Logs', 'Cryptographic Erasure Certificates'],
    testProcedure: 'Verify expired records older than statutory retention period are quarantined and purged.',
    ownerRole: 'Data Governance Lead',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 8 mandated audit logs for all automated erasure jobs.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-09',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 9 / Rule 9',
    title: 'Processing of Personal Data of Children & Persons with Disabilities',
    officialText: 'A Data Fiduciary shall, before processing any personal data of a child or a person with disability who has a lawful guardian, obtain verifiable consent of the parent or lawful guardian, and shall not undertake tracking, behavioral monitoring, or targeted advertising directed at children.',
    implementationObjective: 'Enforce age gating, verifiable parental consent tokenization, and strict prohibition flags on behavioral analytics pipelines for minors.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries'],
    mappedControlCodes: ['DPDP-CTRL-07', 'ISO-A.5.34'],
    evidenceRequirements: ['Parental Consent Audit Trail', 'Zero Minor Telemetry Assertion Log'],
    testProcedure: 'Verify age-gated onboarding block; confirm tracking cookies disabled for child profiles.',
    ownerRole: 'Product Trust & Safety Lead',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 9 outlined mechanisms for verifiable parental consent.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-10',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 10 / Rule 10',
    title: 'Additional Obligations of Significant Data Fiduciary (SDF)',
    officialText: 'The Central Government may notify any Data Fiduciary as Significant Data Fiduciary. An SDF shall appoint a resident Data Protection Officer, engage an Independent Data Auditor, and undertake periodic DPIA.',
    implementationObjective: 'Maintain SDF 6-factor assessment, resident DPO board appointment, independent auditor mandate, and algorithm governance.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['Notified Significant Data Fiduciaries'],
    mappedControlCodes: ['DPDP-CTRL-08', 'ISO-A.5.2'],
    evidenceRequirements: ['Resident DPO Appointment Proof', 'Annual Independent Audit Report'],
    testProcedure: 'Review Board minutes confirming resident DPO appointment and annual DPIA sign-off.',
    ownerRole: 'Chief Executive Officer / Board of Directors',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 10 formalized annual independent audit cadence.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-11-14',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Sections 11, 12, 13, 14 / Rules 11-14',
    title: 'Data Principal Rights: Access, Correction, Erasure, Grievance, Nomination',
    officialText: 'The Data Principal shall have the right to obtain summary of personal data, right to correction and erasure, right of grievance redressal, and right to nominate another individual in the event of death or incapacity.',
    implementationObjective: 'Operate an end-to-end 9-stage DSR center with verified identity tokens, automated scoping, and evidence-gated fulfillment.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries'],
    mappedControlCodes: ['DPDP-CTRL-09', 'ISO-A.5.34'],
    evidenceRequirements: ['DSR Fulfillment Evidence Ledgers', 'Grievance SLA Logs'],
    testProcedure: 'Submit test DSR requests across all 5 right types; verify SLA timer calculation and evidence gate.',
    ownerRole: 'Privacy Operations Lead / DPO',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rules 11-14 standardized electronic DSR intake protocols.', author: 'MeitY Gazette' }
    ]
  },
  {
    id: 'DPDP-REQ-SEC-16',
    source: 'DPDP_ACT_2023',
    sectionOrRuleNumber: 'Section 16 / Rule 15',
    title: 'Cross-Border Transfer of Personal Data Outside India (Negative-List Model)',
    officialText: 'The Central Government may, by notification, restrict the transfer of personal data by a Data Fiduciary for processing to such country or territory outside India as may be so notified.',
    implementationObjective: 'Implement cross-border destination negative-list screening, sector-specific transfer rules, and standard contractual clauses.',
    version: '2025.1',
    notifiedDate: '2025-11-13',
    effectiveDate: '2025-11-13',
    commencementStatus: 'IN_FORCE',
    currentStatus: 'IN_FORCE',
    isLegallyEnforceableCurrently: true,
    customerAdoptionStatus: 'MANDATORY_ENFORCED',
    applicability: ['All Data Fiduciaries transferring data outside India'],
    mappedControlCodes: ['DPDP-CTRL-10', 'ISO-A.5.34'],
    evidenceRequirements: ['Cross-Border Transfer Evaluation Registry', 'Executed International DPA Agreements'],
    testProcedure: 'Verify all outbound processor data flows against active MeitY negative-list and sector mandates.',
    ownerRole: 'International Privacy & Compliance Counsel',
    assuranceStatus: 'EFFECTIVE',
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    changeHistory: [
      { date: '2025-11-13', changeNote: 'Rule 15 clarified notification procedure for negative list territories.', author: 'MeitY Gazette' }
    ]
  }
];

// ============================================================================
// 2. SECTORAL REGULATORY OVERLAYS MASTER DATA
// ============================================================================

export const INITIAL_SECTOR_OVERLAYS: RegulatorySectorOverlayRule[] = [
  {
    id: 'SECTOR-OVR-PMLA-01',
    sector: 'FINTECH_BANKING',
    authority: 'FIU-IND_PMLA',
    frameworkCode: 'PMLA_2002',
    ruleReference: 'Section 12(1)(e) & Rule 3',
    ruleCategory: 'RETENTION',
    mandateSummary: 'Mandatory 5-year retention of client identity records and account files from the date of cessation of the transaction/relationship.',
    effectiveRetentionPeriodMonths: 60,
    priorityRank: 100, // Statutory criminal law preemption over baseline DPDP purpose retention
    conflictResolutionStrategy: 'STATUTORY_PREEMPTION'
  },
  {
    id: 'SECTOR-OVR-RBI-02',
    sector: 'FINTECH_BANKING',
    authority: 'RBI',
    frameworkCode: 'RBI_MASTER_DIRECTIONS',
    ruleReference: 'RBI Master Direction - KYC Direction 2016 (Updated 2023), Section 45',
    ruleCategory: 'RETENTION',
    mandateSummary: 'Regulated entities must preserve customer identification data and transaction logs for 5 years after closure of account.',
    effectiveRetentionPeriodMonths: 60,
    priorityRank: 90,
    conflictResolutionStrategy: 'LONGEST_MANDATORY_PERIOD'
  },
  {
    id: 'SECTOR-OVR-RBI-LOC-03',
    sector: 'FINTECH_BANKING',
    authority: 'RBI',
    frameworkCode: 'RBI_MASTER_DIRECTIONS',
    ruleReference: 'RBI Directive DPSS.CO.OD No. 2785/06.08.005/2017-18 (Storage of Payment System Data)',
    ruleCategory: 'DATA_LOCALIZATION',
    mandateSummary: 'All system providers shall ensure that the entire data relating to payment systems operated by them is stored in a system only in India.',
    priorityRank: 95,
    conflictResolutionStrategy: 'STRICTEST_SAFEGUARD'
  },
  {
    id: 'SECTOR-OVR-SEBI-04',
    sector: 'SECURITIES_CAPITAL_MARKETS',
    authority: 'SEBI',
    frameworkCode: 'SEBI_CSCRF',
    ruleReference: 'SEBI Cybersecurity & Cyber Resilience Framework (CSCRF 2024), Clause 6.4',
    ruleCategory: 'RETENTION',
    mandateSummary: 'Market Infrastructure Institutions (MIIs) and Qualified REs must maintain audit logs for a minimum period of 6 years.',
    effectiveRetentionPeriodMonths: 72,
    priorityRank: 85,
    conflictResolutionStrategy: 'LONGEST_MANDATORY_PERIOD'
  },
  {
    id: 'SECTOR-OVR-CERTIN-05',
    sector: 'CROSS_INDUSTRY_ENTERPRISE',
    authority: 'CERT-In',
    frameworkCode: 'CERT_IN_DIRECTIONS_2022',
    ruleReference: 'CERT-In Directions 2022, Para 6(ii)',
    ruleCategory: 'INCIDENT_REPORTING',
    mandateSummary: 'Mandatory 6-hour cybersecurity incident notification window for covered cyber incidents and data leaks.',
    priorityRank: 99,
    conflictResolutionStrategy: 'STATUTORY_PREEMPTION'
  }
];

// ============================================================================
// 3. PRE-SEEDED PERSONAL DATA INVENTORY
// ============================================================================

export const INITIAL_DPDP_PERSONAL_DATA_ELEMENTS: DpdpPersonalDataElement[] = [
  {
    id: 'pde-01',
    tenantId: 'tenant_skanda',
    name: 'Customer Full Name & Legal Title',
    category: 'IDENTITY_CONTACT',
    dataType: 'STRING',
    dataPrincipalCategory: 'CUSTOMER_USER',
    isSensitivePersonalData: false,
    isChildrenData: false,
    collectionSource: 'Customer Web Registration Portal',
    processingSystems: ['AWS RDS Postgres (Production)', 'Salesforce CRM'],
    storageLocations: ['AWS ap-south-1 (Mumbai)'],
    processingActivityIds: ['act-01'],
    purposeIds: ['purp-01'],
    recipientProcessors: ['proc-01'],
    retentionRuleId: 'ret-01',
    deletionMechanism: 'HARD_DELETE_AUTOMATED',
    securityControls: ['AES-256 at Rest', 'TLS 1.3 in Transit', 'Field-level RBAC'],
    noticeId: 'not-01',
    consentRequired: true,
    lawfulBasis: 'CONSENT',
    riskRating: 'MEDIUM',
    owner: 'Chief Privacy Officer',
    classification: 'CONFIDENTIAL',
    discoveryStatus: 'VERIFIED_ACTIVE',
    lastVerifiedAt: '2026-10-01T00:00:00Z',
    evidenceId: 'ev_pde_identity_01',
    dataLineage: {
      source: 'HTTPS Customer Signup Web Form',
      flowStages: ['CloudFront CDN', 'WAF Filter', 'Kong API Gateway', 'Postgres user_profiles'],
      destination: 'Encrypted RDS Multi-AZ Mumbai Cluster',
      encryptionActive: true
    }
  },
  {
    id: 'pde-02',
    tenantId: 'tenant_skanda',
    name: 'Primary Mobile Phone Number & SMS 2FA Token',
    category: 'IDENTITY_CONTACT',
    dataType: 'STRING',
    dataPrincipalCategory: 'CUSTOMER_USER',
    isSensitivePersonalData: false,
    isChildrenData: false,
    collectionSource: 'Customer Signup & MFA Setup',
    processingSystems: ['AWS RDS Postgres', 'Twilio SMS Gateway'],
    storageLocations: ['AWS ap-south-1 (Mumbai)'],
    processingActivityIds: ['act-01'],
    purposeIds: ['purp-01'],
    recipientProcessors: ['proc-02'],
    retentionRuleId: 'ret-01',
    deletionMechanism: 'HARD_DELETE_AUTOMATED',
    securityControls: ['AES-256 at Rest', 'Masked in UI (***-***-1234)', 'KMS Envelope Key'],
    noticeId: 'not-01',
    consentRequired: true,
    lawfulBasis: 'CONSENT',
    riskRating: 'MEDIUM',
    owner: 'Chief Information Security Officer (CISO)',
    classification: 'CONFIDENTIAL',
    discoveryStatus: 'VERIFIED_ACTIVE',
    lastVerifiedAt: '2026-10-01T00:00:00Z',
    evidenceId: 'ev_pde_phone_02',
    dataLineage: {
      source: 'MFA Challenge Modal',
      flowStages: ['Twilio API Hook', 'KMS Encryption Layer', 'Postgres auth_credentials'],
      destination: 'Encrypted DB Node',
      encryptionActive: true
    }
  },
  {
    id: 'pde-03',
    tenantId: 'tenant_skanda',
    name: 'Aadhaar / Permanent Account Number (PAN)',
    category: 'FINANCIAL_TRANSACTIONAL',
    dataType: 'ENCRYPTED_BLOB',
    dataPrincipalCategory: 'CUSTOMER_USER',
    isSensitivePersonalData: true,
    isChildrenData: false,
    collectionSource: 'Statutory Corporate KYC Intake',
    processingSystems: ['HashiCorp Vault Enclave', 'DigiLocker Verification Microservice'],
    storageLocations: ['AWS ap-south-1 (Mumbai) Dedicated Sovereign VPC'],
    processingActivityIds: ['act-02'],
    purposeIds: ['purp-02'],
    recipientProcessors: ['proc-03'],
    retentionRuleId: 'ret-02',
    deletionMechanism: 'CRYPTO_SHRED',
    securityControls: ['Envelope Encryption with KMS Customer Managed Key', 'Zero Plaintext Logs', 'Hardware Token Auth'],
    noticeId: 'not-01',
    consentRequired: true,
    lawfulBasis: 'LEGITIMATE_USES_LEGAL_OBLIGATION',
    riskRating: 'HIGH',
    owner: 'Compliance & Legal Director',
    classification: 'RESTRICTED',
    discoveryStatus: 'VERIFIED_ACTIVE',
    lastVerifiedAt: '2026-10-01T00:00:00Z',
    evidenceId: 'ev_pde_kyc_03',
    dataLineage: {
      source: 'KYC Document Uploader',
      flowStages: ['DigiLocker Auth Gateway', 'Vault HSM Tokenization', 'Isolated KYC Storage'],
      destination: 'Vault Encrypted Secret Store',
      encryptionActive: true
    }
  },
  {
    id: 'pde-04',
    tenantId: 'tenant_skanda',
    name: 'Workforce Salary & Banking Details',
    category: 'EMPLOYMENT_HR',
    dataType: 'ENCRYPTED_BLOB',
    dataPrincipalCategory: 'WORKFORCE_EMPLOYEE',
    isSensitivePersonalData: true,
    isChildrenData: false,
    collectionSource: 'HR Onboarding & Payroll Portal',
    processingSystems: ['Workday HRIS', 'HDFC Corporate Payroll API'],
    storageLocations: ['AWS ap-south-1 (Mumbai)'],
    processingActivityIds: ['act-03'],
    purposeIds: ['purp-03'],
    recipientProcessors: ['proc-04'],
    retentionRuleId: 'ret-03',
    deletionMechanism: 'HARD_DELETE_AUTOMATED',
    securityControls: ['AES-256', 'Strict Separation of Duties', 'Annual Access Review'],
    noticeId: 'not-02',
    consentRequired: false,
    lawfulBasis: 'LEGITIMATE_USES_EMPLOYMENT',
    riskRating: 'HIGH',
    owner: 'Head of Human Resources',
    classification: 'RESTRICTED',
    discoveryStatus: 'VERIFIED_ACTIVE',
    lastVerifiedAt: '2026-10-01T00:00:00Z',
    evidenceId: 'ev_pde_hr_04',
    dataLineage: {
      source: 'HR Onboarding Form',
      flowStages: ['HRIS Input Gate', 'Payroll Batch Engine', 'Banking Settlement API'],
      destination: 'Encrypted Payroll Partition',
      encryptionActive: true
    }
  }
];

// ============================================================================
// 4. PRE-SEEDED PROCESSING ACTIVITIES (RoPA)
// ============================================================================

export const INITIAL_DPDP_PROCESSING_ACTIVITIES: DpdpProcessingActivity[] = [
  {
    id: 'act-01',
    tenantId: 'tenant_skanda',
    name: 'Customer Authentication & Account Management',
    businessPurpose: 'Facilitating secure user login, session management, and self-service account administration.',
    personalDataElementIds: ['pde-01', 'pde-02'],
    dataPrincipalCategories: ['CUSTOMER_USER'],
    collectionSource: 'Customer Web Registration Portal',
    processingSystems: ['AWS RDS Postgres (Production)', 'Salesforce CRM'],
    storageLocations: ['AWS ap-south-1 (Mumbai)'],
    processorIds: ['proc-01', 'proc-02'],
    subProcessorIds: ['subproc-01'],
    noticeId: 'not-01',
    applicableBasis: 'CONSENT',
    retentionRuleId: 'ret-01',
    deletionRule: 'Immediate hard delete 30 days after account closure unless judicial legal hold active.',
    securityControls: ['AES-256 at Rest', 'TLS 1.3 in Transit', 'Field-level RBAC'],
    riskIds: ['RSK-DPDP-01'],
    owner: 'Engineering Lead (Identity & Auth)',
    reviewFrequencyDays: 90,
    lastReviewedAt: '2026-09-01',
    nextReviewDate: '2026-12-01',
    evidenceIds: ['ev_auth_ropa_01'],
    status: 'ACTIVE_APPROVED',
    dpiaRequired: false
  },
  {
    id: 'act-02',
    tenantId: 'tenant_skanda',
    name: 'Statutory KYC & Anti-Money Laundering Verification',
    businessPurpose: 'Compliance with statutory PMLA and regulatory customer verification mandates.',
    personalDataElementIds: ['pde-03'],
    dataPrincipalCategories: ['CUSTOMER_USER'],
    collectionSource: 'Statutory Corporate KYC Intake',
    processingSystems: ['HashiCorp Vault Enclave', 'DigiLocker Verification Microservice'],
    storageLocations: ['AWS ap-south-1 (Mumbai) Dedicated Sovereign VPC'],
    processorIds: ['proc-03'],
    subProcessorIds: [],
    noticeId: 'not-01',
    applicableBasis: 'LEGITIMATE_USES_LEGAL_OBLIGATION',
    retentionRuleId: 'ret-02',
    deletionRule: 'Retain for 5 years post customer relationship termination per statutory PMLA requirement, then cryptographically shred.',
    securityControls: ['Envelope Encryption with KMS Customer Managed Key', 'Hardware Token Auth'],
    riskIds: ['RSK-DPDP-02'],
    owner: 'Compliance Officer (KYC / AML)',
    reviewFrequencyDays: 180,
    lastReviewedAt: '2026-08-15',
    nextReviewDate: '2027-02-15',
    evidenceIds: ['ev_kyc_ropa_02'],
    status: 'ACTIVE_APPROVED',
    dpiaRequired: true,
    dpiaScore: 82
  },
  {
    id: 'act-03',
    tenantId: 'tenant_skanda',
    name: 'Workforce Payroll Administration & Statutory Benefits',
    businessPurpose: 'Administering employee compensation, PF/ESI deductions, and corporate tax filings.',
    personalDataElementIds: ['pde-04'],
    dataPrincipalCategories: ['WORKFORCE_EMPLOYEE'],
    collectionSource: 'HR Onboarding & Payroll Portal',
    processingSystems: ['Workday HRIS', 'HDFC Corporate Payroll API'],
    storageLocations: ['AWS ap-south-1 (Mumbai)'],
    processorIds: ['proc-04'],
    subProcessorIds: [],
    noticeId: 'not-02',
    applicableBasis: 'LEGITIMATE_USES_EMPLOYMENT',
    retentionRuleId: 'ret-03',
    deletionRule: 'Retain for 7 years per Income Tax Act recordkeeping provisions, then automated purge.',
    securityControls: ['AES-256', 'Strict Separation of Duties'],
    riskIds: ['RSK-DPDP-03'],
    owner: 'Head of People Operations',
    reviewFrequencyDays: 365,
    lastReviewedAt: '2026-07-01',
    nextReviewDate: '2027-07-01',
    evidenceIds: ['ev_hr_ropa_03'],
    status: 'ACTIVE_APPROVED',
    dpiaRequired: false
  }
];

// ============================================================================
// 5. PRE-SEEDED PURPOSE GOVERNANCE ENTRIES
// ============================================================================

export const INITIAL_DPDP_PURPOSES: DpdpPurposeEntry[] = [
  {
    id: 'purp-01',
    tenantId: 'tenant_skanda',
    purposeCode: 'PURP-AUTH-01',
    name: 'Customer Authentication & Platform Access',
    description: 'Providing secure multi-factor authentication, profile management, and audit logs for application usage.',
    isSpecificAndItemized: true,
    associatedActivityIds: ['act-01'],
    associatedDataElementIds: ['pde-01', 'pde-02'],
    noticeId: 'not-01',
    lawfulBasis: 'CONSENT',
    retentionPeriodMonths: 12,
    status: 'ACTIVE_COMPLIANT',
    anomalyFlags: []
  },
  {
    id: 'purp-02',
    tenantId: 'tenant_skanda',
    purposeCode: 'PURP-KYC-02',
    name: 'Statutory Identity & KYC Verification',
    description: 'Verifying customer identity under PMLA and RBI Master Directions to prevent financial fraud.',
    isSpecificAndItemized: true,
    associatedActivityIds: ['act-02'],
    associatedDataElementIds: ['pde-03'],
    noticeId: 'not-01',
    lawfulBasis: 'LEGITIMATE_USES_LEGAL_OBLIGATION',
    retentionPeriodMonths: 60,
    status: 'ACTIVE_COMPLIANT',
    anomalyFlags: []
  },
  {
    id: 'purp-03',
    tenantId: 'tenant_skanda',
    purposeCode: 'PURP-HR-03',
    name: 'Employee Payroll & Statutory Compliance',
    description: 'Processing workforce compensation, PF remittances, tax deductions, and health insurance.',
    isSpecificAndItemized: true,
    associatedActivityIds: ['act-03'],
    associatedDataElementIds: ['pde-04'],
    noticeId: 'not-02',
    lawfulBasis: 'LEGITIMATE_USES_EMPLOYMENT',
    retentionPeriodMonths: 84,
    status: 'ACTIVE_COMPLIANT',
    anomalyFlags: []
  }
];

// ============================================================================
// 6. PRE-SEEDED PRIVACY NOTICES
// ============================================================================

export const INITIAL_DPDP_PRIVACY_NOTICES: DpdpPrivacyNotice[] = [
  {
    id: 'not-01',
    tenantId: 'tenant_skanda',
    title: 'Customer Privacy & Data Protection Notice',
    noticeCode: 'SKD-NOT-CUST-2026',
    supportedLanguages: ['en', 'hi', 'ta', 'te', 'kn', 'bn', 'mr', 'gu'],
    currentVersion: '2.1',
    itemizedDataElements: [
      'Full Legal Name',
      'Mobile Phone Number',
      'Aadhaar / PAN (for KYC customers only)'
    ],
    specifiedPurposes: [
      'Customer Authentication & Account Management',
      'Statutory KYC Verification under PMLA'
    ],
    processingDescription: 'Your personal data is encrypted with AES-256 and stored exclusively in Indian cloud infrastructure (AWS Mumbai). Data is shared only with authorized payment and KYC verification processors under executed DPAs.',
    rightsInformationText: 'Under the DPDP Act 2023, you have the right to access a summary of personal data, right to correction, right to erasure, right to grievance redressal, and right to nominate.',
    withdrawalMechanismText: 'You may withdraw consent at any time via your Account Settings > Privacy Portal or by emailing privacy@skanda-enterprisegrc.com. Downstream processing will cease within statutory timelines.',
    grievanceRedressalOfficerContact: {
      name: 'Dr. Rajeshwar Rao',
      title: 'Chief Privacy Officer & Grievance Redressal Officer',
      email: 'grievance-dpo@skanda-enterprisegrc.com',
      phone: '+91 (80) 4122-9080',
      postalAddress: 'Skanda Towers, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103, India',
      responseSlaDays: 7
    },
    consentManagerIntegrationUrl: 'https://consent.skanda-enterprisegrc.com/v1/interop',
    publicationUrl: 'https://skanda-enterprisegrc.com/privacy/customer-notice-2026.html',
    status: 'PUBLISHED_ACTIVE',
    readabilityScore: {
      fleschReadingEase: 74,
      plainLanguageCertified: true
    },
    versionHistory: [
      {
        version: '2.1',
        publishedAt: '2026-09-01T00:00:00Z',
        effectiveDate: '2026-09-01',
        changeSummary: 'Updated Grievance Redressal Officer contact and Consent Manager API hook specifications.',
        contentHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
        approvedByDpo: 'Dr. Rajeshwar Rao (DPO)'
      }
    ]
  }
];

// ============================================================================
// 7. PRE-SEEDED CONSENT RECORDS
// ============================================================================

export const INITIAL_DPDP_CONSENT_RECORDS: DpdpConsentRecord[] = [
  {
    id: 'cst-001',
    tenantId: 'tenant_skanda',
    dataPrincipalId: 'dp-usr-88910',
    dataPrincipalEmailMasked: 'r***.s***@example.com',
    purposeId: 'purp-01',
    personalDataElementIds: ['pde-01', 'pde-02'],
    noticeVersion: '2.1',
    consentState: 'GIVEN',
    grantedAt: '2026-09-10T11:24:00Z',
    sourceChannel: 'WEB_MODAL',
    ipAddressMasked: '49.207.***.*** (Bengaluru, IN)',
    consentArtifactSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    downstreamRestrictionStatus: 'NOT_APPLICABLE',
    downstreamSystemsNotified: []
  }
];

// ============================================================================
// 8. PRE-SEEDED DSR REQUESTS & BLAST RADIUS
// ============================================================================

export const INITIAL_DPDP_RIGHT_REQUESTS: DpdpRightRequest[] = [
  {
    id: 'DSR-2026-001',
    tenantId: 'tenant_skanda',
    requestType: 'RIGHT_TO_ACCESS',
    dataPrincipalName: 'Ananya Deshmukh',
    dataPrincipalEmailMasked: 'a***.d***@example.com',
    isIdentityVerified: true,
    verificationMethod: 'DIGILOCKER_OTP',
    receivedAt: '2026-10-02T09:30:00Z',
    dueDate: '2026-11-01T23:59:59Z',
    assignedOwner: 'Dr. Rajeshwar Rao (DPO)',
    status: 'EXECUTION_IN_PROGRESS',
    affectedSystems: ['AWS RDS Postgres (Production)', 'Salesforce CRM'],
    affectedDataElementIds: ['pde-01', 'pde-02'],
    scopingNotes: 'Automated data extraction pipeline initialized. Data package compiled for DPO review.',
    executionEvidenceIds: ['ev_dsr_extract_001'],
    blastRadius: {
      dsrRequestId: 'DSR-2026-001',
      dataPrincipalName: 'Ananya Deshmukh',
      affectedRecordsCount: 24,
      affectedDataElementIds: ['pde-01', 'pde-02'],
      affectedSystems: [
        { systemName: 'AWS RDS Postgres', location: 'AWS Mumbai', status: 'DISCOVERED' },
        { systemName: 'Salesforce CRM', location: 'AWS Mumbai VPC', status: 'DISCOVERED' }
      ],
      affectedProcessors: [
        { processorId: 'proc-01', name: 'AWS Cloud Services', propagationStatus: 'ACKNOWLEDGED', evidenceId: 'ev_proc_aws_ack' }
      ],
      affectedSubProcessors: [],
      completionPercentage: 70,
      remainingWorkSummary: 'DPO final sign-off and encrypted ZIP dispatch to verified principal email.',
      statutorySlaDaysRemaining: 25,
      slaRiskLevel: 'ON_TRACK',
      evidenceChainHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      communicationLedger: [
        {
          timestamp: '2026-10-02T09:32:00Z',
          channel: 'EMAIL',
          recipient: 'a***.d***@example.com',
          subject: 'Acknowledgment of DSR Access Request DSR-2026-001',
          deliveryProofId: 'ev_comm_ack_001'
        }
      ]
    },
    communicationsLog: [
      {
        timestamp: '2026-10-02T09:32:00Z',
        sender: 'Automated DSR Gateway',
        channel: 'EMAIL',
        messageSummary: 'Acknowledgment sent with statutory tracking reference ID.'
      }
    ],
    auditTrailHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'DSR-2026-002',
    tenantId: 'tenant_skanda',
    requestType: 'RIGHT_TO_GRIEVANCE_REDRESSAL',
    dataPrincipalName: 'Rahul Sharma',
    dataPrincipalEmailMasked: 'r***.s***@example.com',
    isIdentityVerified: true,
    verificationMethod: 'GOVT_ID_OIDC',
    receivedAt: '2026-10-04T14:20:00Z',
    dueDate: '2026-11-03T23:59:59Z',
    assignedOwner: 'Dr. Rajeshwar Rao (DPO)',
    status: 'EXECUTION_IN_PROGRESS',
    affectedSystems: ['AWS RDS Postgres (Production)'],
    affectedDataElementIds: ['pde-01'],
    scopingNotes: 'Grievance regarding marketing communication preferences under DPO investigation.',
    executionEvidenceIds: ['ev_dsr_grievance_002'],
    communicationsLog: [
      {
        timestamp: '2026-10-04T14:22:00Z',
        sender: 'DPO Grievance Gateway',
        channel: 'EMAIL',
        messageSummary: 'Formal grievance receipt issued with tracking reference.'
      }
    ],
    auditTrailHash: 'f4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afb'
  }
];

// ============================================================================
// 9. PRE-SEEDED RETENTION RULES & DELETION JOBS
// ============================================================================

export const INITIAL_DPDP_RETENTION_RULES: DpdpRetentionRule[] = [
  {
    id: 'ret-01',
    tenantId: 'tenant_skanda',
    name: 'Customer Account Profile Standard Schedule',
    purposeId: 'purp-01',
    retentionPeriodMonths: 12,
    triggerEvent: 'ACCOUNT_CLOSURE',
    hasActiveLegalHold: false,
    targetSystems: ['AWS RDS Postgres', 'Salesforce CRM']
  },
  {
    id: 'ret-02',
    tenantId: 'tenant_skanda',
    name: 'Statutory KYC & Customer Verification Ledger Schedule',
    purposeId: 'purp-02',
    retentionPeriodMonths: 60,
    triggerEvent: 'ACCOUNT_CLOSURE',
    legalRetentionMandate: 'Prevention of Money Laundering Act (PMLA) 2002 Section 12 & RBI Master Directions require 5-year ledger retention.',
    hasActiveLegalHold: true,
    legalHoldReference: 'LEGAL-HOLD-2026-HC-BOM-091 (Bombay High Court Matter)',
    targetSystems: ['HashiCorp Vault Enclave']
  }
];

export const INITIAL_DPDP_DELETION_JOBS: DpdpDeletionExecutionJob[] = [
  {
    id: 'del-job-101',
    tenantId: 'tenant_skanda',
    retentionRuleId: 'ret-01',
    dataPrincipalId: 'dp-usr-old-109',
    targetSystems: ['AWS RDS Postgres (Production)'],
    scheduledDate: '2026-10-05',
    recordsPurgedCount: 1420,
    deletionMethod: 'HARD_DELETE_DATABASE',
    verifiedByDpo: true,
    cryptographicDeletionProofSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    status: 'SCHEDULED'
  },
  {
    id: 'del-job-102',
    tenantId: 'tenant_skanda',
    retentionRuleId: 'ret-02',
    targetSystems: ['HashiCorp Vault Enclave'],
    scheduledDate: '2026-10-06',
    recordsPurgedCount: 0,
    deletionMethod: 'CRYPTO_KEY_PURGE',
    verifiedByDpo: false,
    cryptographicDeletionProofSha256: '',
    status: 'BLOCKED_BY_LEGAL_HOLD'
  }
];

export const INITIAL_DELETION_ORCHESTRATION_JOBS: DeletionOrchestrationJob[] = [
  {
    jobId: 'DEL-ORCH-2026-01',
    tenantId: 'tenant_skanda',
    targetEntityId: 'dp-usr-old-109',
    entityType: 'DATA_PRINCIPAL_RECORDS',
    eligibilityCheckPassed: true,
    retentionCheckStatus: 'RETENTION_ELAPSED',
    legalHoldBlocked: false,
    sectorOverlayBlocked: false,
    processorPropagations: [
      {
        processorId: 'proc-01',
        processorName: 'AWS Cloud Services',
        acknowledged: true,
        purgedRecords: 1420,
        proofSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
      }
    ],
    subProcessorPropagations: [],
    executedPurgeMethod: 'HARD_DELETE_DATABASE',
    recordsPurgedTotal: 1420,
    reconciliationStatus: 'RECONCILED_EXACT',
    cryptographicEvidenceSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    deletionCertificateIssuedBy: 'Dr. Rajeshwar Rao (DPO)',
    executedAt: '2026-10-05T16:00:00Z'
  },
  {
    jobId: 'DEL-ORCH-2026-02',
    tenantId: 'tenant_skanda',
    targetEntityId: 'pde-03-kyc-batch-77',
    entityType: 'PERSONAL_DATA_ELEMENT',
    eligibilityCheckPassed: true,
    retentionCheckStatus: 'RETENTION_ACTIVE',
    legalHoldBlocked: true,
    legalHoldDetails: {
      holdId: 'LEGAL-HOLD-2026-HC-BOM-091',
      courtMatter: 'Commercial Dispute Suit 901/2026 (Bombay High Court)',
      custodian: 'Head of Legal & Litigation'
    },
    sectorOverlayBlocked: true,
    sectorOverlayDetails: 'PMLA 2002 §12 mandatory 5-year ledger rule active until 2029-08-15.',
    processorPropagations: [],
    subProcessorPropagations: [],
    executedPurgeMethod: 'CRYPTO_KEY_PURGE',
    recordsPurgedTotal: 0,
    reconciliationStatus: 'BLOCKED_ABORTED',
    cryptographicEvidenceSha256: '',
    deletionCertificateIssuedBy: '',
    blockedRationale: {
      reason: 'Active Judicial Legal Hold & Statutory PMLA 2002 5-year ledger mandate block automated purge.',
      source: 'PMLA 2002 §12 & Bombay High Court Injunction',
      owner: 'Head of Legal',
      nextReviewDate: '2027-04-01',
      evidenceId: 'ev_legal_hold_hc_bom_091'
    }
  }
];

// ============================================================================
// 10. PRE-SEEDED PROCESSORS & CROSS-BORDER TRANSFERS
// ============================================================================

export const INITIAL_DPDP_PROCESSORS: DpdpProcessorProfile[] = [
  {
    id: 'proc-01',
    processorId: 'proc-01',
    tenantId: 'tenant_skanda',
    name: 'Amazon Web Services India Private Limited',
    processorName: 'Amazon Web Services India Private Limited',
    servicesProvided: ['Multi-AZ Cloud Hosting', 'Managed PostgreSQL RDS', 'KMS Key Management'],
    dataElementIdsShared: ['pde-01', 'pde-02'],
    personalDataCategories: ['IDENTITY_CONTACT'],
    processingPurposeIds: ['purp-01'],
    processingLocations: ['India (Mumbai ap-south-1)', 'India (Hyderabad ap-south-2)'],
    storageLocations: ['India (Mumbai ap-south-1)', 'India (Hyderabad ap-south-2)'],
    systemsHosted: ['AWS Production Subnet (ap-south-1)'],
    dpaSigned: true,
    dpaExecutionStatus: 'EXECUTED_VALID',
    dpaSignedDate: '2025-10-15',
    dpaExecutionDate: '2025-10-15',
    dpaExpiryDate: '2026-10-15',
    dpaDocumentEvidenceId: 'ev_dpa_aws_01',
    dpaAgreementReference: 'ev_dpa_aws_01',
    subProcessors: [
      {
        id: 'subproc-01',
        subProcessorId: 'subproc-01',
        name: 'AWS CloudFront Edge POPs',
        subProcessorName: 'AWS CloudFront Edge POPs',
        country: 'India',
        jurisdiction: 'India',
        serviceDescription: 'Static edge caching inside Indian sovereign jurisdiction',
        role: 'Static edge caching',
        adequacyApproved: true,
        fiduciaryApprovalStatus: 'APPROVED',
        dpaBackToBackStatus: 'EXECUTED'
      }
    ],
    securityControlsVerified: ['ISO 27001', 'SOC 2 Type II', 'MeitY Empanelled Cloud Provider'],
    linkedControlIds: ['DPDP-CTRL-01', 'ISO-A.5.34'],
    evidenceIds: ['ev_dpa_aws_01'],
    privacyObligations: ['Data Isolation', 'Incident Notification within 24h'],
    lastSecurityAssessmentDate: '2026-08-01',
    lastAssessmentDate: '2026-08-01',
    nextAssessmentDue: '2027-08-01',
    nextAssessmentDate: '2027-08-01',
    openIncidentCount: 0,
    riskTier: 'LOW',
    riskLevel: 'LOW',
    riskScore: 96,
    processorRiskScore: 96,
    reviewStatus: 'ACTIVE_APPROVED',
    warningSignals: []
  },
  {
    id: 'proc-02',
    processorId: 'proc-02',
    tenantId: 'tenant_skanda',
    name: 'Twilio India Communication Services',
    processorName: 'Twilio India Communication Services',
    servicesProvided: ['SMS 2FA Gateway', 'Transactional OTP Delivery'],
    dataElementIdsShared: ['pde-02'],
    personalDataCategories: ['IDENTITY_CONTACT'],
    processingPurposeIds: ['purp-01'],
    processingLocations: ['India (Mumbai)', 'Singapore (Secondary Gateway)'],
    storageLocations: ['India (Mumbai)', 'Singapore (Secondary Gateway)'],
    systemsHosted: ['Twilio Cloud Gateway'],
    dpaSigned: true,
    dpaExecutionStatus: 'EXECUTED_VALID',
    dpaSignedDate: '2025-11-20',
    dpaExecutionDate: '2025-11-20',
    dpaExpiryDate: '2026-11-20',
    dpaDocumentEvidenceId: 'ev_dpa_twilio_02',
    dpaAgreementReference: 'ev_dpa_twilio_02',
    subProcessors: [],
    securityControlsVerified: ['ISO 27001', 'SOC 2 Type II'],
    linkedControlIds: ['DPDP-CTRL-02'],
    evidenceIds: ['ev_dpa_twilio_02'],
    privacyObligations: ['Transit Encryption', 'No Log Retention beyond 7 days'],
    lastSecurityAssessmentDate: '2026-07-15',
    lastAssessmentDate: '2026-07-15',
    nextAssessmentDue: '2027-07-15',
    nextAssessmentDate: '2027-07-15',
    openIncidentCount: 0,
    riskTier: 'MEDIUM',
    riskLevel: 'MEDIUM',
    riskScore: 84,
    processorRiskScore: 84,
    reviewStatus: 'ACTIVE_APPROVED',
    warningSignals: ['CROSS_BORDER_SECONDARY_GATEWAY_MONITORED']
  },
  {
    id: 'proc-03',
    processorId: 'proc-03',
    tenantId: 'tenant_skanda',
    name: 'DigiLocker & UIDAI National Gateway',
    processorName: 'DigiLocker & UIDAI National Gateway',
    servicesProvided: ['Statutory Aadhaar & PAN XML Verification'],
    dataElementIdsShared: ['pde-03'],
    personalDataCategories: ['FINANCIAL_TRANSACTIONAL', 'IDENTITY_CONTACT'],
    processingPurposeIds: ['purp-02'],
    processingLocations: ['India (National Data Center, New Delhi)'],
    storageLocations: ['India (National Data Center, New Delhi)'],
    systemsHosted: ['National Identity Grid'],
    dpaSigned: true,
    dpaExecutionStatus: 'EXECUTED_VALID',
    dpaSignedDate: '2025-08-10',
    dpaExecutionDate: '2025-08-10',
    dpaExpiryDate: '2027-08-10',
    dpaDocumentEvidenceId: 'ev_dpa_digilocker_03',
    dpaAgreementReference: 'ev_dpa_digilocker_03',
    subProcessors: [],
    securityControlsVerified: ['Government of India Sovereign Security Certification'],
    linkedControlIds: ['DPDP-CTRL-03', 'PMLA-CTRL-01'],
    evidenceIds: ['ev_dpa_digilocker_03'],
    privacyObligations: ['Zero Local Data Caching', 'Immediate Token Shredding'],
    lastSecurityAssessmentDate: '2026-06-01',
    lastAssessmentDate: '2026-06-01',
    nextAssessmentDue: '2027-06-01',
    nextAssessmentDate: '2027-06-01',
    openIncidentCount: 0,
    riskTier: 'LOW',
    riskLevel: 'LOW',
    riskScore: 98,
    processorRiskScore: 98,
    reviewStatus: 'ACTIVE_APPROVED',
    warningSignals: []
  }
];

export const INITIAL_CROSS_BORDER_EVALUATIONS: CrossBorderTransferEvaluation[] = [
  {
    transferId: 'CB-XFER-001',
    tenantId: 'tenant_skanda',
    sourceCountry: 'India',
    destinationCountry: 'Singapore',
    dataCategory: 'IDENTITY_CONTACT',
    processingPurposeId: 'purp-01',
    processorId: 'proc-02',
    dpdpSection16GovernmentNegativeListRestricted: false,
    sectorRequirementApplies: false,
    contractualRestrictionsExist: false,
    customerPolicyPermitted: true,
    transferDecision: 'ALLOWED',
    decisionRationale: 'Destination territory not listed in Central Government DPDP §16 negative list. Statutory DPA with Standard Contractual Clauses executed.',
    safeguardsActive: ['TLS 1.3 Transit Encryption', 'Encrypted Payload Hash', 'Executed International DPA'],
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    evidenceId: 'ev_cb_xfer_singapore_01'
  },
  {
    transferId: 'CB-XFER-002',
    tenantId: 'tenant_skanda',
    sourceCountry: 'India',
    destinationCountry: 'United States',
    dataCategory: 'FINANCIAL_TRANSACTIONAL',
    processingPurposeId: 'purp-02',
    processorId: 'proc-03',
    dpdpSection16GovernmentNegativeListRestricted: false,
    sectorRequirementApplies: true,
    sectorMandateDetails: 'RBI Storage of Payment System Data Directive 2018 mandates domestic storage; cross-border flow restricted to offshore clearing settlement with 24h domestic return.',
    contractualRestrictionsExist: false,
    customerPolicyPermitted: true,
    transferDecision: 'RESTRICTED',
    decisionRationale: 'Sectoral overlay restriction under RBI Directive 2018 overrides general transfer; data must reside entirely within India.',
    safeguardsActive: ['Sovereign In-Country Partition Only'],
    lastEvaluatedAt: '2026-10-01T00:00:00Z',
    evidenceId: 'ev_cb_xfer_rbi_block_02'
  }
];

// ============================================================================
// 11. PRE-SEEDED PRIVACY INCIDENTS & INDEPENDENT CLOCKS
// ============================================================================

export const INITIAL_DPDP_PRIVACY_INCIDENTS: DpdpPrivacyIncident[] = [
  {
    id: 'INC-PRIV-2026-001',
    tenantId: 'tenant_skanda',
    title: 'Staging Database Misconfiguration Flagged by CI/CD Automated Guardrail',
    discoveredAt: '2026-09-18T14:00:00Z',
    containedAt: '2026-09-18T14:45:00Z',
    affectedDataCategories: ['IDENTITY_CONTACT'],
    estimatedDataPrincipalsImpacted: 0,
    affectedSystems: ['AWS Staging RDS Cluster'],
    rootCauseAnalysis: 'Automated telemetry flagged an unencrypted staging read replica before production deployment. Immediate quarantine enforced.',
    severity: 'LOW',
    obligationClocks: [
      {
        id: 'clk-certin-001',
        incidentId: 'INC-PRIV-2026-001',
        obligationType: 'CERT_IN_CYBER_REPORTING',
        title: 'CERT-In Statutory 6-Hour Cyber Incident Reporting',
        basisLegalSource: 'Section 70B(6) IT Act 2000 / CERT-In Directions 2022, Para 6(ii)',
        statutoryWindowHours: 6,
        triggeredAt: '2026-09-18T14:00:00Z',
        deadlineTimestamp: '2026-09-18T20:00:00Z',
        isApplicable: true,
        isCommencedLegally: true,
        owner: 'CISO / Incident Commander',
        status: 'EXEMPTED_CONFIRMED',
        inapplicabilityRationale: 'Internal staging replica with synthetic test data only; zero live system compromise or unauthorized access.',
        evidenceArtifactId: 'ev_inc_certin_exemption_01'
      },
      {
        id: 'clk-dpdp-rule7-board-002',
        incidentId: 'INC-PRIV-2026-001',
        obligationType: 'DPDP_RULE7_BOARD_NOTIFICATION',
        title: 'DPDP Rule 7 Intimation to Data Protection Board of India',
        basisLegalSource: 'Digital Personal Data Protection Rules, 2025, Rule 7(1)',
        statutoryWindowHours: 72,
        triggeredAt: '2026-09-18T14:00:00Z',
        deadlineTimestamp: '2026-09-21T14:00:00Z',
        isApplicable: false,
        isCommencedLegally: false, // Phased commencement gate
        inapplicabilityRationale: 'Rule 7 currently under 12-month phased commencement runway; also zero live personal data breach occurred.',
        owner: 'Chief Privacy Officer / DPO',
        status: 'EXEMPTED_CONFIRMED',
        evidenceArtifactId: 'ev_inc_dpdp_eval_02'
      },
      {
        id: 'clk-contract-003',
        incidentId: 'INC-PRIV-2026-001',
        obligationType: 'CONTRACTUAL_CUSTOMER_SLA',
        title: 'Enterprise Customer SLA 24-Hour Incident Advisory',
        basisLegalSource: 'Enterprise Master Services Agreement (MSA) Clause 14.2',
        statutoryWindowHours: 24,
        triggeredAt: '2026-09-18T14:00:00Z',
        deadlineTimestamp: '2026-09-19T14:00:00Z',
        isApplicable: true,
        isCommencedLegally: true,
        owner: 'Customer Success & Trust Lead',
        status: 'NOTIFIED_ON_TIME',
        completedAt: '2026-09-18T17:30:00Z',
        evidenceArtifactId: 'ev_inc_cust_advisory_03'
      }
    ],
    statutoryCertInNotificationRequired: false,
    dpbiBoardNotificationRequired: false,
    dataPrincipalNotificationRequired: false,
    notificationDecisionRationale: 'Zero production or live personal data compromised; affected node was isolated within internal staging subnet with synthetic test data.',
    authorizedByCisoDpo: 'Dr. Rajeshwar Rao (DPO) & SriKarthiK (CISO)',
    containmentEvidenceIds: ['ev_inc_containment_001'],
    capaRecordId: 'CAPA-2026-PRIV-01',
    status: 'CLOSED_REMEDIATED'
  }
];

// ============================================================================
// 12. PRE-SEEDED SIGNIFICANT DATA FIDUCIARY (SDF) ASSESSMENT
// ============================================================================

export const INITIAL_DPDP_SDF_ASSESSMENT: DpdpSdfAssessment = {
  id: 'SDF-ASSESS-2026',
  tenantId: 'tenant_skanda',
  assessmentDate: '2026-09-15',
  evaluatedBy: 'Dr. Rajeshwar Rao (DPO)',
  dpoName: 'Dr. Rajeshwar Rao',
  overallVolumeOfData: '75,000+ Enterprise Data Principals',
  sensitivityProfile: 'Enterprise Workforce and KYC Identity Data; Zero High-Risk Children Behavioral Data.',
  riskOfHarmScore: 28,
  factors: [
    {
      factor: 'Volume of Personal Data Processed',
      evaluatedScore: 2,
      thresholdTriggered: false,
      rationale: 'Processing scale < 5,000,000 data principals benchmark.',
      evidenceId: 'ev_sdf_vol_01'
    },
    {
      factor: 'Sensitivity of Data Handled',
      evaluatedScore: 3,
      thresholdTriggered: false,
      rationale: 'Processed data restricted to statutory KYC and B2B user identity.',
      evidenceId: 'ev_sdf_sens_02'
    },
    {
      factor: 'Risk of Harm to Data Principals',
      evaluatedScore: 2,
      thresholdTriggered: false,
      rationale: 'Full AES-256 envelope encryption and multi-tenant isolation enforced.',
      evidenceId: 'ev_sdf_risk_03'
    },
    {
      factor: 'Potential Impact on Sovereign Security / Public Order',
      evaluatedScore: 1,
      thresholdTriggered: false,
      rationale: 'B2B GRC compliance SaaS platform; zero critical infrastructure control plane access.',
      evidenceId: 'ev_sdf_sov_04'
    },
    {
      factor: 'Risk to Democratic Principles / Electoral Integrity',
      evaluatedScore: 1,
      thresholdTriggered: false,
      rationale: 'No political profiling, advertising, or voter telemetry.',
      evidenceId: 'ev_sdf_demo_05'
    },
    {
      factor: 'Use of New Technologies & AI Profiling',
      evaluatedScore: 2,
      thresholdTriggered: false,
      rationale: 'AI Copilot strictly bounded to read-only compliance query assistance with zero automated decisions.',
      evidenceId: 'ev_sdf_ai_06'
    }
  ],
  isDesignatedSdf: false,
  statutoryObligationsActive: {
    residentDpoAppointed: true,
    independentDataAuditorEngaged: true,
    periodicDpiaMandated: true,
    periodicAlgorithmAuditConducted: true
  },
  approvalStatus: 'DPO_APPROVED'
};

// ============================================================================
// 13. PRE-SEEDED PRIVACY MONITORING SIGNALS
// ============================================================================

export const INITIAL_DPDP_PRIVACY_SIGNALS: DpdpPrivacySignal[] = [
  {
    id: 'sig-01',
    tenantId: 'tenant_skanda',
    timestamp: '2026-10-06T10:30:00Z',
    signalType: 'PROCESSOR_DPA_EXPIRED',
    severity: 'WARNING',
    title: 'Processor DPA Approaching Annual Recertification Window',
    description: 'Workday HRIS Data Processing Addendum reaches 12-month review threshold in 25 days.',
    affectedEntityId: 'proc-04',
    recommendedAction: 'Execute DPA renewal addendum and update Evidence Vault.',
    isAcknowledged: false
  },
  {
    id: 'sig-02',
    tenantId: 'tenant_skanda',
    timestamp: '2026-10-07T08:15:00Z',
    signalType: 'DSR_SLA_AT_RISK',
    severity: 'INFO',
    title: 'Data Principal Access Request DSR-2026-001 Under Execution',
    description: 'Statutory 30-day fulfillment window has 25 days remaining with 70% completion.',
    affectedEntityId: 'DSR-2026-001',
    recommendedAction: 'Verify database extraction completion and emit cryptographic proof certificate.',
    isAcknowledged: false
  }
];

// ============================================================================
// 14. PRE-SEEDED REGULATORY CHANGE INTELLIGENCE
// ============================================================================

export const INITIAL_DPDP_REGULATORY_CHANGES: DpdpRegulatoryChangeItem[] = [
  {
    id: 'reg-chg-2025-11',
    notifiedDate: '2025-11-13',
    gazetteReference: 'G.S.R. 842(E) / MeitY Notification',
    changeSummary: 'Notification of the Digital Personal Data Protection Rules, 2025 detailing plain language notice standards, consent manager APIs, and DPBI intimation formats.',
    sourceAuthority: 'MeitY',
    impactedRequirementIds: ['DPDP-REQ-SEC-05', 'DPDP-REQ-SEC-06', 'DPDP-REQ-SEC-08-06'],
    impactedControlCodes: ['DPDP-CTRL-02', 'DPDP-CTRL-03', 'DPDP-CTRL-05'],
    impactedNoticeIds: ['not-01'],
    requiredCustomerAction: 'Publish updated multilingual notice v2.1 and configure statutory incident triage playbook.',
    implementationDeadline: '2026-02-13',
    status: 'IMPLEMENTED_VERIFIED'
  }
];

// ============================================================================
// 15. PRE-SEEDED AI PRIVACY COPILOT AUDIT LEDGER
// ============================================================================

export const INITIAL_COPILOT_AUDIT_LEDGER: CopilotAuditRecord[] = [
  {
    queryId: 'copilot-q-2026-001',
    tenantId: 'tenant_skanda',
    modelName: 'SKANDA-Grounded-Privacy-LLM-v2',
    promptVersion: 'prompts/dpdp-v2.1.txt',
    regulatoryDatasetVersion: 'DPDP-Gazette-2025.1-CERTIn-2022.3',
    retrievedRecordIds: [
      { id: 'DPDP-REQ-SEC-08-06', type: 'REQUIREMENT', title: 'Personal Data Breach Notification (Rule 7 Phased Runway)' },
      { id: 'CERT-IN-REQ-DIR-2022-06', type: 'REQUIREMENT', title: 'CERT-In Statutory 6-Hour Cyber Incident Reporting' }
    ],
    generatedResponse: 'Under current statutory enforcement, CERT-In mandates 6-hour notification under Section 70B(6) IT Act for covered cyber incidents. In contrast, DPDP Rules 2025 Rule 7 Data Protection Board notification operates under phased commencement.',
    confidenceScore: 0.98,
    reviewerRole: 'Data Protection Officer',
    approvalStatus: 'PENDING_HUMAN_VALIDATION',
    timestamp: '2026-10-06T14:30:00Z',
    humanValidationDisclaimer: 'AI-GENERATED // HUMAN VALIDATION REQUIRED'
  }
];

