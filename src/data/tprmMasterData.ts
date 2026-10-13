/**
 * SKANDA ENTERPRISE TPRM MASTER DATA & REGULATORY REPOSITORY
 * Path: src/data/tprmMasterData.ts
 * 
 * Provides authentic, production-grade TPRM seed data, methodology definitions,
 * assessment questionnaires (SIG Lite, MAS TRM, CAIQ, DPDP, ISO 42001), 
 * fourth-party dependency trees, and regulatory cross-reference matrices.
 */

import {
  MasterVendorRecord,
  TprmMethodology,
  TprmAssessmentQuestion,
  FourthPartyNode,
  TprmRegulatoryRequirementMapping,
  VendorLifecycleStatus
} from '../types/tprmTypes';

// ============================================================================
// 1. DEFAULT 5X5 & 3X3 RISK METHODOLOGY SPECIFICATIONS
// ============================================================================

export const DEFAULT_TPRM_METHODOLOGY_5X5: TprmMethodology = {
  id: 'METH-TPRM-5X5-V2026',
  version: '2026.1-TPRM-Enterprise',
  name: 'SKANDA 14-Factor Multi-Tenant TPRM Risk Matrix (5x5)',
  matrixDimension: '5X5',
  isDefault: true,
  factorWeights: {
    INFOSEC: 0.15,
    PRIVACY_PII: 0.15,
    REGULATORY: 0.10,
    RESILIENCE_BCP: 0.10,
    FINANCIAL_VIABILITY: 0.05,
    ARCHITECTURE_TECH: 0.05,
    PRIVILEGE_ACCESS: 0.10,
    GEOGRAPHIC_JURISDICTION: 0.05,
    FOURTH_PARTY_SUPPLY_CHAIN: 0.05,
    CONCENTRATION: 0.05,
    AI_GOVERNANCE: 0.05,
    BUSINESS_CRITICALITY: 0.10
  },
  likelihoodScale: [
    { level: 1, label: 'Rare (≤ 5% probability)', description: 'Highly resilient supplier with continuous telemetry and no historical incidents' },
    { level: 2, label: 'Unlikely (5% - 20%)', description: 'Strong controls with minor audit exceptions' },
    { level: 3, label: 'Possible (20% - 50%)', description: 'Standard vendor controls with periodic assessments' },
    { level: 4, label: 'Likely (50% - 80%)', description: 'Observed control drift or delayed remediation' },
    { level: 5, label: 'Almost Certain (> 80%)', description: 'Active critical vulnerability, expiring certificate or DPA non-compliance' }
  ],
  impactScale: [
    { level: 1, label: 'Insignificant', description: 'Negligible business disruption, public data only, easily substitutable' },
    { level: 2, label: 'Minor', description: 'Internal non-critical workflow impacted (< 4 hours RTO)' },
    { level: 3, label: 'Moderate', description: 'Substantial business operational impact or internal confidential data exposure' },
    { level: 4, label: 'Major', description: 'Core business service degradation, MAS critical system impacted, customer PII exposed' },
    { level: 5, label: 'Catastrophic', description: 'Severe regulatory sanctions (MAS/DPDP/GDPR), total service outage, systemic compromise' }
  ],
  severityBands: [
    { min: 1, max: 4, label: 'LOW', color: '#10b981' },
    { min: 5, max: 9, label: 'MEDIUM', color: '#0ea5e9' },
    { min: 10, max: 16, label: 'HIGH', color: '#f59e0b' },
    { min: 17, max: 25, label: 'CRITICAL', color: '#f43f5e' }
  ],
  appetitePolicy: 'Enterprise Risk Appetite Threshold is score 8. Residual scores > 8 require formal CRO Risk Acceptance or Board escalation.',
  approvedBy: 'Chief Risk Officer & Head of GRC',
  effectiveDate: '2026-01-01'
};

export const DEFAULT_TPRM_METHODOLOGY_3X3: TprmMethodology = {
  id: 'METH-TPRM-3X3-V2026',
  version: '2026.1-TPRM-3X3',
  name: 'Standard 14-Factor TPRM Risk Matrix (3x3)',
  matrixDimension: '3X3',
  isDefault: false,
  factorWeights: {
    INFOSEC: 0.20,
    PRIVACY_PII: 0.20,
    REGULATORY: 0.15,
    RESILIENCE_BCP: 0.15,
    BUSINESS_CRITICALITY: 0.15,
    PRIVILEGE_ACCESS: 0.15
  },
  likelihoodScale: [
    { level: 1, label: 'Low', description: 'Rare / unlikely probability' },
    { level: 2, label: 'Medium', description: 'Possible probability' },
    { level: 3, label: 'High', description: 'Likely / almost certain probability' }
  ],
  impactScale: [
    { level: 1, label: 'Low', description: 'Minor operational impact' },
    { level: 2, label: 'Medium', description: 'Moderate business disruption' },
    { level: 3, label: 'High', description: 'Critical outage or regulatory sanction' }
  ],
  severityBands: [
    { min: 1, max: 2, label: 'LOW', color: '#10b981' },
    { min: 3, max: 5, label: 'MEDIUM', color: '#0ea5e9' },
    { min: 6, max: 9, label: 'CRITICAL', color: '#f43f5e' }
  ],
  appetitePolicy: '3x3 Risk Appetite Threshold is score 4.',
  approvedBy: 'Chief Risk Officer',
  effectiveDate: '2026-01-01'
};

export const DEFAULT_TPRM_METHODOLOGY_4X4: TprmMethodology = {
  id: 'METH-TPRM-4X4-V2026',
  version: '2026.1-TPRM-4X4',
  name: 'Standard 14-Factor TPRM Risk Matrix (4x4)',
  matrixDimension: '4X4',
  isDefault: false,
  factorWeights: { ...DEFAULT_TPRM_METHODOLOGY_5X5.factorWeights },
  likelihoodScale: [
    { level: 1, label: 'Low', description: '< 10% probability' },
    { level: 2, label: 'Medium', description: '10% - 40% probability' },
    { level: 3, label: 'High', description: '40% - 75% probability' },
    { level: 4, label: 'Very High', description: '> 75% probability' }
  ],
  impactScale: [
    { level: 1, label: 'Low', description: 'Negligible business impact' },
    { level: 2, label: 'Medium', description: 'Noticeable business impact' },
    { level: 3, label: 'High', description: 'Major business degradation' },
    { level: 4, label: 'Critical', description: 'Severe regulatory breach or systemic downtime' }
  ],
  severityBands: [
    { min: 1, max: 3, label: 'LOW', color: '#10b981' },
    { min: 4, max: 8, label: 'MEDIUM', color: '#0ea5e9' },
    { min: 9, max: 12, label: 'HIGH', color: '#f59e0b' },
    { min: 13, max: 16, label: 'CRITICAL', color: '#f43f5e' }
  ],
  appetitePolicy: '4x4 Risk Appetite Threshold is score 6.',
  approvedBy: 'Chief Risk Officer',
  effectiveDate: '2026-01-01'
};

// ============================================================================
// 2. QUESTIONNAIRE MASTER QUESTION BANK (SIG, MAS TRM, DPDP, ISO 42001)
// ============================================================================

export const MASTER_TPRM_QUESTIONS: TprmAssessmentQuestion[] = [
  {
    id: 'Q-SEC-01',
    category: 'INFORMATION_SECURITY',
    questionCode: 'SEC-ISMS-01',
    questionText: 'Does your organization maintain an Information Security Management System (ISMS) certified to ISO/IEC 27001:2022 by an accredited certification body?',
    guidanceText: 'Provide valid ISO 27001 certificate including Statement of Applicability (SoA) and audit scope details.',
    isMandatory: true,
    weight: 9,
    mappedControlIds: ['A.5.19', 'A.5.20', 'CTRL-TPRM-01'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['ISO_CERTIFICATE', 'AUDIT_REPORT']
  },
  {
    id: 'Q-SEC-02',
    category: 'INFORMATION_SECURITY',
    questionCode: 'SEC-SOC2-02',
    questionText: 'Do you provide an annual independent SOC 2 Type II assurance report covering the Security, Availability, and Confidentiality Trust Services Criteria without qualified opinions?',
    guidanceText: 'Attach current SOC 2 Type II report (within 12 months) and bridge letter if reporting period ended > 3 months ago.',
    isMandatory: true,
    weight: 9,
    mappedControlIds: ['A.5.21', 'SOC2-CC9.2'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['SOC2_REPORT', 'BRIDGE_LETTER']
  },
  {
    id: 'Q-IAM-01',
    category: 'IDENTITY_ACCESS_MGMT',
    questionCode: 'IAM-MFA-01',
    questionText: 'Is Multi-Factor Authentication (MFA / FIDO2 WebAuthn) strictly enforced for all administrative and privileged access to systems hosting or processing customer data?',
    guidanceText: 'SMS-based OTP is insufficient for critical administrative roles. Hardware security keys or authenticator apps required.',
    isMandatory: true,
    weight: 10,
    mappedControlIds: ['A.8.5', 'MAS-TRM-8.1', 'CTRL-IAM-01'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['IAM_CONFIG_SCREENSHOT', 'SECURITY_POLICY']
  },
  {
    id: 'Q-PRV-01',
    category: 'PRIVACY_DATA_PROTECTION',
    questionCode: 'PRV-DPDP-01',
    questionText: 'Do you process personal data strictly in accordance with documented Data Processing Addendum (DPA) terms compliant with GDPR Art 28 and India DPDP Act 2023 Sec 8?',
    guidanceText: 'Provide executed DPA, Standard Contractual Clauses (SCCs), and data sub-processor transparency list.',
    isMandatory: true,
    weight: 10,
    conditionalTriggerField: 'personalDataInvolvement',
    mappedControlIds: ['ISO27701-7.2.8', 'DPDP-SEC-8'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['DPA_AGREEMENT', 'SCC_ANNEX']
  },
  {
    id: 'Q-PRV-02',
    category: 'DATA_RESIDENCY',
    questionCode: 'PRV-RES-02',
    questionText: 'Are all customer data storage and primary computing services restricted to authorized jurisdictions (e.g. Singapore / India / EU) without unauthorized cross-border transfers?',
    guidanceText: 'Specify geographical regions for all active and secondary disaster recovery data centers.',
    isMandatory: true,
    weight: 8,
    mappedControlIds: ['A.8.11', 'MAS-TRM-12.4', 'DPDP-SEC-9'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['ARCHITECTURE_DIAGRAM', 'DATA_FLOW_MAP']
  },
  {
    id: 'Q-BCP-01',
    category: 'BCP_DR_RESILIENCE',
    questionCode: 'BCP-RTO-01',
    questionText: 'Does your service provide a contracted Recovery Time Objective (RTO) ≤ 4 hours and Recovery Point Objective (RPO) ≤ 1 hour with annual failover test validation?',
    guidanceText: 'Provide executive summary of the most recent Disaster Recovery simulation and failover test results.',
    isMandatory: true,
    weight: 9,
    mappedControlIds: ['A.8.14', 'MAS-TRM-13.1', 'ISO22301-8.4'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['BCP_TEST_REPORT', 'DR_RUNBOOK']
  },
  {
    id: 'Q-VULN-01',
    category: 'VULNERABILITY_MGMT',
    questionCode: 'VULN-PENTEST-01',
    questionText: 'Do you conduct annual independent third-party penetration testing and maintain a formal vulnerability disclosure program with strict remediation SLAs (Critical < 7 days)?',
    guidanceText: 'Provide executive attestation of the latest external network and application penetration test.',
    isMandatory: true,
    weight: 8,
    mappedControlIds: ['A.8.8', 'MAS-TRM-10.2'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['PENTEST_EXEC_SUMMARY', 'REMEDIATION_ATTESTATION']
  },
  {
    id: 'Q-SUB-01',
    category: 'FOURTH_PARTY_SUBPROCESSORS',
    questionCode: 'SUB-NOTIF-01',
    questionText: 'Do you maintain an updated register of direct subprocessors and provide at least 30 days prior written notice before engaging new downstream sub-processors?',
    guidanceText: 'Attach public subprocessor disclosure URL or list of critical infrastructure partners.',
    isMandatory: true,
    weight: 7,
    mappedControlIds: ['A.5.23', 'GDPR-ART-28.2', 'MAS-TRM-12.3'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['SUBPROCESSOR_REGISTER']
  },
  {
    id: 'Q-AI-01',
    category: 'AI_GOVERNANCE',
    questionCode: 'AI-SAFETY-01',
    questionText: 'If AI models or Large Language Models are integrated into the service, do you guarantee that customer data is never used to train or fine-tune public foundation models?',
    guidanceText: 'Provide contractual Zero Data Retention (ZDR) and Enterprise AI privacy terms.',
    isMandatory: false,
    weight: 8,
    conditionalTriggerField: 'aiGovernanceApplicable',
    mappedControlIds: ['ISO42001-A.6.2', 'NIST-AI-RMF-GOV'],
    evidenceRequired: true,
    allowedEvidenceTypes: ['AI_POLICY', 'VENDOR_AI_CLAUSE']
  }
];

// ============================================================================
// 3. FOURTH-PARTY DEPENDENCY NODES (CONCENTRATION GRAPH)
// ============================================================================

export const MASTER_FOURTH_PARTY_NODES: FourthPartyNode[] = [
  {
    id: '4th-aws',
    name: 'Amazon Web Services (AWS)',
    serviceCategory: 'Hyperscale Cloud Infrastructure & Data Centers',
    jurisdiction: 'United States / Singapore / Ireland / Frankfurt',
    isKnownDownstreamDependency: true,
    directVendorsCount: 6,
    dependentVendorIds: ['vnd-aws-001', 'vnd-okta-002', 'vnd-datadog-004', 'vnd-github-005', 'vnd-snowflake-006', 'vnd-anthropic-007'],
    concentrationRiskRating: 'HIGH_SYSTEMIC',
    singlePointOfFailureFlag: true,
    failoverPlanDocumented: true,
    exitSubstitutabilityDifficulty: 'EXTREME'
  },
  {
    id: '4th-cloudflare',
    name: 'Cloudflare Anycast Network & Edge WAF',
    serviceCategory: 'Global Edge Routing, DDoS Defense & Authoritative DNS',
    jurisdiction: 'United States / Global Anycast',
    isKnownDownstreamDependency: true,
    directVendorsCount: 4,
    dependentVendorIds: ['vnd-okta-002', 'vnd-stripe-003', 'vnd-datadog-004', 'vnd-salesforce-008'],
    concentrationRiskRating: 'ELEVATED',
    singlePointOfFailureFlag: false,
    failoverPlanDocumented: true,
    exitSubstitutabilityDifficulty: 'MODERATE'
  },
  {
    id: '4th-equinix',
    name: 'Equinix International Business Exchange (IBX)',
    serviceCategory: 'Tier-4 Colocation Data Center & Physical Security',
    jurisdiction: 'Singapore / Frankfurt / Ashburn VA',
    isKnownDownstreamDependency: true,
    directVendorsCount: 3,
    dependentVendorIds: ['vnd-aws-001', 'vnd-stripe-003', 'vnd-snowflake-006'],
    concentrationRiskRating: 'MODERATE',
    singlePointOfFailureFlag: false,
    failoverPlanDocumented: true,
    exitSubstitutabilityDifficulty: 'HIGH'
  },
  {
    id: '4th-visa-mc',
    name: 'Visa / Mastercard Global Settlement Network',
    serviceCategory: 'Card Payment Clearing & Authorization Rails',
    jurisdiction: 'United States / Global',
    isKnownDownstreamDependency: true,
    directVendorsCount: 1,
    dependentVendorIds: ['vnd-stripe-003'],
    concentrationRiskRating: 'HIGH_SYSTEMIC',
    singlePointOfFailureFlag: true,
    failoverPlanDocumented: true,
    exitSubstitutabilityDifficulty: 'EXTREME'
  },
  {
    id: '4th-unknown-sub',
    name: 'UNKNOWN_DOWNSTREAM_DEPENDENCY',
    serviceCategory: 'Undisclosed Subcontractor',
    jurisdiction: 'UNKNOWN',
    isKnownDownstreamDependency: false,
    directVendorsCount: 1,
    dependentVendorIds: ['vnd-workday-009'],
    concentrationRiskRating: 'HIGH_SYSTEMIC',
    singlePointOfFailureFlag: false,
    failoverPlanDocumented: false,
    exitSubstitutabilityDifficulty: 'EXTREME'
  }
];

// ============================================================================
// 4. CANONICAL REGULATORY MAPPINGS FOR TPRM
// ============================================================================

export const MASTER_TPRM_REGULATORY_MAPPINGS: TprmRegulatoryRequirementMapping[] = [
  {
    frameworkCode: 'ISO_27001_2022',
    frameworkVersion: '2022',
    requirementCode: 'A.5.19',
    requirementTitle: 'Information security in supplier relationships',
    sectionCode: 'Organizational controls',
    mappingType: 'EXPLICIT_REGULATORY_MANDATE',
    mappingRationale: 'Mandates formal processes to manage risks associated with supplier access to organizational assets.',
    confidenceScore: 1.0,
    unifiedControlId: 'CTRL-TPRM-01',
    governingJurisdiction: 'Global'
  },
  {
    frameworkCode: 'ISO_27001_2022',
    frameworkVersion: '2022',
    requirementCode: 'A.5.20',
    requirementTitle: 'Addressing information security within supplier agreements',
    sectionCode: 'Organizational controls',
    mappingType: 'EXPLICIT_REGULATORY_MANDATE',
    mappingRationale: 'Requires security, privacy, and incident SLA clauses within all contractual supplier agreements.',
    confidenceScore: 1.0,
    unifiedControlId: 'CTRL-TPRM-01',
    governingJurisdiction: 'Global'
  },
  {
    frameworkCode: 'ISO_27001_2022',
    frameworkVersion: '2022',
    requirementCode: 'A.5.21',
    requirementTitle: 'Managing information security in the ICT supply chain',
    sectionCode: 'Organizational controls',
    mappingType: 'EXPLICIT_REGULATORY_MANDATE',
    mappingRationale: 'Defines requirements for mitigating supply chain risks in cloud and IT software procurement.',
    confidenceScore: 1.0,
    unifiedControlId: 'CTRL-TPRM-01',
    governingJurisdiction: 'Global'
  },
  {
    frameworkCode: 'MAS_TRM_2021',
    frameworkVersion: '2021',
    requirementCode: 'MAS-TRM-12.1',
    requirementTitle: 'Third-Party Risk Management & Outsourcing Due Diligence',
    sectionCode: 'Section 12 (Third-Party Risk)',
    mappingType: 'EXPLICIT_REGULATORY_MANDATE',
    mappingRationale: 'Financial institutions must perform comprehensive risk assessments before engaging critical service providers.',
    confidenceScore: 1.0,
    unifiedControlId: 'CTRL-TPRM-01',
    governingJurisdiction: 'Singapore'
  },
  {
    frameworkCode: 'MAS_TRM_2021',
    frameworkVersion: '2021',
    requirementCode: 'MAS-TRM-12.3',
    requirementTitle: 'Subcontracting & Multi-Tier Supply Chain Oversight',
    sectionCode: 'Section 12 (Third-Party Risk)',
    mappingType: 'EXPLICIT_REGULATORY_MANDATE',
    mappingRationale: 'Requires prior consent and security audits for fourth-party sub-contractors engaged by primary vendors.',
    confidenceScore: 1.0,
    unifiedControlId: 'CTRL-TPRM-01',
    governingJurisdiction: 'Singapore'
  },
  {
    frameworkCode: 'DPDP_ACT_2023',
    frameworkVersion: '2023',
    requirementCode: 'DPDP-SEC-8',
    requirementTitle: 'Obligations of Data Fiduciary in engaging Data Processors',
    sectionCode: 'Section 8 (General Obligations)',
    mappingType: 'EXPLICIT_REGULATORY_MANDATE',
    mappingRationale: 'Data Fiduciary remains legally liable and must execute valid data processing agreements with all data processors.',
    confidenceScore: 1.0,
    unifiedControlId: 'CTRL-PRV-01',
    governingJurisdiction: 'India'
  },
  {
    frameworkCode: 'SOC_2_TYPE_2',
    frameworkVersion: '2017 Trust Services Criteria',
    requirementCode: 'CC9.2',
    requirementTitle: 'Vendor and Business Partner Risk Management',
    sectionCode: 'Common Criteria 9',
    mappingType: 'EXPLICIT_REGULATORY_MANDATE',
    mappingRationale: 'Organization assesses and manages risks associated with vendors and business partners.',
    confidenceScore: 1.0,
    unifiedControlId: 'CTRL-TPRM-01',
    governingJurisdiction: 'United States'
  }
];

// ============================================================================
// 5. MASTER ENTERPRISE VENDORS DATASET (AUTHENTIC TPRM SEEDS)
// ============================================================================

export const MASTER_ENTERPRISE_VENDORS: MasterVendorRecord[] = [
  {
    id: 'vnd-aws-001',
    tenantId: 'tenant-acme-corp',
    vendorCode: 'VND-001',
    lifecycleStatus: 'CONTINUOUS_MONITORING',
    approvalDecision: 'APPROVED',
    approvedBy: 'CRO (Elena Rostova)',
    approvedAt: '2026-01-15T09:30:00Z',
    profile: {
      legalName: 'Amazon Web Services Singapore Private Limited',
      tradingName: 'AWS Asia Pacific',
      vendorIdentifier: 'VND-AWS-001',
      taxIdentifier: 'UEN-201017849K',
      legalEntityJurisdiction: 'Singapore (SG)',
      headquartersAddress: '23 Church Street, #10-01 Capital Square, Singapore 049481',
      industryCategory: 'CLOUD_INFRASTRUCTURE',
      websiteUrl: 'https://aws.amazon.com',
      keyContacts: {
        relationshipOwner: { name: 'Sarah Chen', email: 'sarah.chen@acmegrc.internal', role: 'Head of Cloud Engineering' },
        businessSponsor: { name: 'Vikram Mehta', email: 'vikram.mehta@acmegrc.internal', department: 'Technology Infrastructure' },
        procurementOwner: { name: 'Michael Tan', email: 'procurement@acmegrc.internal' },
        securityContact: { name: 'AWS Security Operations', email: 'aws-security@amazon.com' },
        privacyOfficer: { name: 'AWS Global Privacy Office', email: 'privacypolicy@amazon.com' },
        contractSignatory: { name: 'Elena Rostova', email: 'elena.cro@acmegrc.internal' }
      }
    },
    relationship: {
      servicesProvidedSummary: 'Core Hyperscale Infrastructure: Aurora PostgreSQL DB, EKS Kubernetes, KMS Encryption, S3 Vault, Direct VPC Peering',
      businessFunctionsSupported: ['Production Hosting', 'Core Banking & Ledger', 'Data Backup & Archival', 'Security Telemetry Ingestion'],
      criticalityTier: 'TIER_1_STRATEGIC_CRITICAL',
      operationalDependencies: ['Core Web Application', 'Customer Database', 'API Gateway'],
      criticalBusinessServicesAffected: ['CBS-01: Real-Time Payment Settlement', 'CBS-02: Customer Identity & Auth'],
      geographicServiceLocations: ['ap-southeast-1 (Singapore)', 'eu-central-1 (Frankfurt)'],
      serviceCommencementDate: '2022-03-01',
      contractExpiryDate: '2027-03-01',
      renewalNoticePeriodDays: 90,
      exitStrategyDocumented: true,
      exitTransitionPeriodDays: 180,
      alternativeSupplierAvailable: true,
      alternativeSupplierNames: ['Google Cloud Platform (GCP)', 'Microsoft Azure'],
      substitutabilityRating: 'HIGH_FRICTION_LOCK_IN'
    },
    technologyAndData: {
      systemsAndApplicationsAccessed: ['AWS Management Console', 'Terraform IAM Roles', 'CloudTrail Audit Stream'],
      dataClassificationsProcessed: ['RESTRICTED_CUSTOMER_PII', 'FINANCIAL_TRANSACTIONAL', 'CONFIDENTIAL_IP', 'INTERNAL_BUSINESS'],
      personalDataInvolvement: true,
      specialCategoryOrSensitiveData: true,
      hostingEnvironment: 'AWS',
      privilegedAccessGranted: true,
      privilegedAccessDetails: 'Root KMS Key custodianship and AWS Organization Master Account management',
      networkConnectivityType: 'DIRECT_PEERING_VPN',
      apiIntegrationsActive: ['AWS Security Hub', 'AWS Config', 'AWS CloudWatch', 'AWS IAM Access Analyzer'],
      primaryStorageLocations: ['Singapore (ap-southeast-1)', 'Frankfurt (eu-central-1)'],
      crossBorderTransfers: false,
      crossBorderTransferMechanisms: ['SCC_2021_914'],
      directSubprocessors: ['Equinix Singapore Data Centers', 'Intel Hardware Services'],
      dataRetentionPeriod: '7 Years post contract termination (Statutory audit mandate)',
      dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE'
    },
    assuranceProfile: {
      certifications: [
        {
          standard: 'ISO_27001_2022',
          certificateNumber: 'BSI-IS-688921',
          accreditationBody: 'BSI Assurance UK',
          scopeSummary: 'All AWS Global Cloud Infrastructure Regions and Managed Services',
          validFrom: '2024-05-15',
          validTo: '2027-05-14',
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          isScopeMatchingServices: true
        },
        {
          standard: 'ISO_27701_2019',
          certificateNumber: 'BSI-PI-710432',
          accreditationBody: 'BSI Assurance UK',
          scopeSummary: 'Privacy Information Management System for AWS Cloud Compute and Storage',
          validFrom: '2024-06-01',
          validTo: '2027-05-31',
          assuranceTier: 'CONTROL_IMPLEMENTATION_VERIFIED',
          sha256Seal: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          isScopeMatchingServices: true
        }
      ],
      socReports: [
        {
          reportType: 'SOC_2_TYPE_2',
          trustServicesCriteria: ['SECURITY', 'AVAILABILITY', 'CONFIDENTIALITY', 'PRIVACY'],
          auditingFirm: 'Ernst & Young LLP (EY)',
          reportingPeriodStart: '2025-01-01',
          reportingPeriodEnd: '2025-12-31',
          auditorOpinion: 'UNQUALIFIED_CLEAN',
          csoUsIdentified: ['CSOU-01: Customer must enable MFA on root credentials', 'CSOU-02: Customer must enforce TLS 1.3 encryption on S3 buckets'],
          csoUsImplementedByUs: true,
          bridgeLetterObtained: true,
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
        }
      ],
      penetrationTesting: {
        lastTestDate: '2025-11-20',
        nextDueTestDate: '2026-11-20',
        testedByThirdParty: true,
        testingFirm: 'NCC Group',
        remediationOfCriticalFindingsConfirmed: true
      },
      bcpDrTesting: {
        lastExerciseDate: '2026-02-10',
        rtoCommittedHours: 1,
        rpoCommittedHours: 0.1,
        testOutcome: 'PASS'
      },
      securityPoliciesReceived: true,
      privacyNoticeCompliant: true,
      incidentResponseSlaHours: 1
    },
    latestRiskSnapshot: {
      snapshotId: 'SNP-VND-001-2026Q3',
      tenantId: 'tenant-acme-corp',
      vendorId: 'vnd-aws-001',
      methodologyVersion: '2026.1-TPRM-Enterprise',
      matrixDimension: '5X5',
      calculatedAt: '2026-09-15T00:00:00Z',
      assessedBy: 'Principal TPRM Architect',
      factorBreakdown: [
        { factorId: 'F1', factorName: 'Information Security & Cloud Hardening', factorCategory: 'INFOSEC', weight: 0.15, rawScore: 4, assessedRationale: 'Hyperscale AWS controls with automated continuous IAM/WAF compliance.', groundingEvidenceIds: ['EV-TPRM-AWS-001'] },
        { factorId: 'F2', factorName: 'Customer PII & Confidential Data Storage', factorCategory: 'PRIVACY_PII', weight: 0.15, rawScore: 5, assessedRationale: 'Stores all primary databases containing customer PII and transaction records.', groundingEvidenceIds: ['EV-TPRM-AWS-002'] },
        { factorId: 'F3', factorName: 'Regulatory Compliance (MAS / DPDP)', factorCategory: 'REGULATORY', weight: 0.10, rawScore: 4, assessedRationale: 'Subject to MAS Technology Risk Management Notice 658 outsourcing guidelines.', groundingEvidenceIds: ['EV-TPRM-AWS-003'] },
        { factorId: 'F4', factorName: 'Operational Resilience & Multi-AZ DR', factorCategory: 'RESILIENCE_BCP', weight: 0.10, rawScore: 5, assessedRationale: 'Core operational backbone; disruption causes immediate CBS outage.', groundingEvidenceIds: ['EV-TPRM-AWS-004'] },
        { factorId: 'F5', factorName: 'Financial Viability & Market Standing', factorCategory: 'FINANCIAL_VIABILITY', weight: 0.05, rawScore: 1, assessedRationale: 'Market cap > $1.8T; lowest viability risk.', groundingEvidenceIds: [] },
        { factorId: 'F6', factorName: 'Architecture & Interoperability', factorCategory: 'ARCHITECTURE_TECH', weight: 0.05, rawScore: 3, assessedRationale: 'Terraform Infrastructure as Code with multi-region replication.', groundingEvidenceIds: [] },
        { factorId: 'F7', factorName: 'Privileged Access & Key Management', factorCategory: 'PRIVILEGE_ACCESS', weight: 0.10, rawScore: 5, assessedRationale: 'KMS customer master key management with HSM backing.', groundingEvidenceIds: [] },
        { factorId: 'F8', factorName: 'Jurisdiction & Cross-Border Sovereign Data', factorCategory: 'GEOGRAPHIC_JURISDICTION', weight: 0.05, rawScore: 2, assessedRationale: 'Data residency constrained strictly to Singapore (ap-southeast-1).', groundingEvidenceIds: [] },
        { factorId: 'F9', factorName: 'Fourth-Party Subprocessor Exposure', factorCategory: 'FOURTH_PARTY_SUPPLY_CHAIN', weight: 0.05, rawScore: 3, assessedRationale: 'Equinix colocation and Tier-1 fiber carrier dependencies.', groundingEvidenceIds: [] },
        { factorId: 'F10', factorName: 'Single Point of Failure Concentration', factorCategory: 'CONCENTRATION', weight: 0.05, rawScore: 5, assessedRationale: '6 out of 9 enterprise vendors run downstream on AWS.', groundingEvidenceIds: [] },
        { factorId: 'F11', factorName: 'AI Model Safety & Data Isolation', factorCategory: 'AI_GOVERNANCE', weight: 0.05, rawScore: 2, assessedRationale: 'Bedrock VPC private endpoints configured with zero customer data retention.', groundingEvidenceIds: [] },
        { factorId: 'F12', factorName: 'Business Criticality to Core Operations', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.10, rawScore: 5, assessedRationale: 'Tier-1 Strategic Critical supplier.', groundingEvidenceIds: [] }
      ],
      inherentLikelihood: 4,
      inherentImpact: 5,
      inherentRiskScore: 20,
      inherentRiskLevel: 'CRITICAL',
      controlDesignScore: 98,
      controlOperatingScore: 95,
      evidenceFreshnessScore: 100,
      combinedControlEffectiveness: 96,
      residualLikelihood: 1,
      residualImpact: 4,
      residualRiskScore: 4,
      residualRiskLevel: 'LOW',
      isResidualHigherThanInherent: false,
      riskAppetiteThreshold: 8,
      isOutsideAppetite: false,
      confidenceScorePercent: 98,
      evidenceCompletenessPercent: 100,
      scoringExplanation: 'Inherent risk score is 20 (Critical) due to full database access and core banking dependencies. Strong mitigations (ISO 27001, SOC 2 Type II clean opinion, Multi-AZ failover, 100% MFA) reduce residual risk score to 4 (Low), well within risk appetite (8).',
      topRiskContributors: ['Critical Data Volume', 'Single Point of Failure Concentration', 'Privileged KMS Custodianship']
    },
    activeAssessments: [
      {
        id: 'ASM-AWS-2026',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-aws-001',
        templateCode: 'MAS_TRM_OUTSOURCING_SEC12',
        title: 'Annual MAS TRM Critical Service Provider Due Diligence (AWS)',
        assessmentType: 'ANNUAL_REASSESSMENT',
        status: 'COMPLETED_SCORED',
        dispatchedAt: '2026-08-01T00:00:00Z',
        dueDate: '2026-09-01T00:00:00Z',
        submittedAt: '2026-08-15T14:20:00Z',
        reviewedAt: '2026-08-20T10:00:00Z',
        leadAssessor: 'Principal TPRM Lead',
        overallScorePercent: 98,
        totalQuestions: 9,
        answeredQuestions: 9,
        mandatoryUnansweredCount: 0,
        evidenceItemsProvidedCount: 4,
        findingsCount: 0,
        version: 1,
        isSampleOrDemo: false,
        responses: [
          { questionId: 'Q-SEC-01', questionCode: 'SEC-ISMS-01', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'ISO 27001:2022 certified globally by BSI Assurance UK.', attachedEvidenceIds: ['EV-TPRM-AWS-001'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-SEC-02', questionCode: 'SEC-SOC2-02', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'SOC 2 Type II report available under NDA. Unqualified opinion issued by EY.', attachedEvidenceIds: ['EV-TPRM-AWS-002'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-IAM-01', questionCode: 'IAM-MFA-01', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'Hardware FIDO2 WebAuthn mandatory for AWS internal engineers accessing control plane.', attachedEvidenceIds: ['EV-TPRM-AWS-002'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-PRV-01', questionCode: 'PRV-DPDP-01', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'AWS GDPR and DPDP Data Processing Addendum incorporated into enterprise agreement.', attachedEvidenceIds: ['EV-TPRM-AWS-003'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-PRV-02', questionCode: 'PRV-RES-02', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'All customer data pinned to ap-southeast-1 Singapore.', attachedEvidenceIds: ['EV-TPRM-AWS-003'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-BCP-01', questionCode: 'BCP-RTO-01', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'Aurora Multi-AZ cross-region failover tested with RTO < 60s and RPO = 0.', attachedEvidenceIds: ['EV-TPRM-AWS-004'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-VULN-01', questionCode: 'VULN-PENTEST-01', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'Annual continuous penetration testing conducted by NCC Group and internal red team.', attachedEvidenceIds: ['EV-TPRM-AWS-002'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-SUB-01', questionCode: 'SUB-NOTIF-01', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'Subprocessor directory published with RSS update feed and 30-day email notices.', attachedEvidenceIds: ['EV-TPRM-AWS-003'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 },
          { questionId: 'Q-AI-01', questionCode: 'AI-SAFETY-01', vendorAnswer: 'YES_FULL_COMPLIANCE', vendorComments: 'Amazon Bedrock guarantees zero customer prompt data retention or model training.', attachedEvidenceIds: ['EV-TPRM-AWS-003'], reviewerStatus: 'ACCEPTED', evaluatedScorePercent: 100 }
        ]
      }
    ],
    activeContracts: [
      {
        id: 'CTR-AWS-2022',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-aws-001',
        contractReference: 'MSA-AWS-SG-2022-09',
        title: 'AWS Enterprise Customer Agreement & Master Financial Addendum',
        contractType: 'MASTER_SERVICES_AGREEMENT',
        status: 'ACTIVE',
        effectiveDate: '2022-03-01',
        expiryDate: '2027-03-01',
        renewalNoticePeriodDays: 90,
        autoRenew: true,
        daysUntilExpiry: 180,
        governingLaw: 'Singapore Law',
        securityClausesSummary: 'Comprehensive security commitments aligned with ISO 27001, SOC 2, and MAS Notice 658.',
        dpaArticle28Compliant: true,
        dpdpSection8Compliant: true,
        incidentNotificationHoursSla: 1,
        auditAndInspectionRights: 'ANNUAL_ON_SITE',
        subprocessorApprovalRequirement: '30_DAYS_NOTICE',
        dataReturnAndDeletionCommitmentDays: 30,
        slaAvailabilityPercent: 99.99,
        breachRemediesDefined: true,
        exitAssistanceObligation: true,
        contractDocumentSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        verifiedByLegal: true
      }
    ],
    evidenceItems: [
      {
        id: 'EV-TPRM-AWS-001',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-aws-001',
        evidenceCode: 'EV-TPRM-AWS-001',
        category: 'ISO_CERT',
        title: 'AWS ISO/IEC 27001:2022 Global Certificate (BSI)',
        fileName: 'AWS_ISO_27001_2022_BSI_Certificate.pdf',
        fileSizeBytes: 2451000,
        mimeType: 'application/pdf',
        sha256ContentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        provenanceSource: 'AUDITOR_DIRECT_RECEIPT',
        collectionTimestamp: '2026-08-05T10:00:00Z',
        validFrom: '2024-05-15',
        validTo: '2027-05-14',
        isExpired: false,
        daysUntilExpiry: 245,
        reviewStatus: 'ACCEPTED',
        reviewedBy: 'Senior Auditor (Karthik J)',
        reviewedAt: '2026-08-06T14:30:00Z',
        assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
        linkedAssessmentId: 'ASM-AWS-2026',
        linkedQuestionCodes: ['SEC-ISMS-01'],
        linkedControlIds: ['CTRL-TPRM-01', 'A.5.19'],
        linkedRiskIds: ['RSK-TPRM-001'],
        extractedMetadataSummary: 'Valid through May 2027. Covers all AWS compute, storage, and networking services.',
        humanVerificationConfirmed: true
      },
      {
        id: 'EV-TPRM-AWS-002',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-aws-001',
        evidenceCode: 'EV-TPRM-AWS-002',
        category: 'SOC_REPORT',
        title: 'AWS SOC 2 Type II Report (Security, Availability & Confidentiality)',
        fileName: 'AWS_SOC2_Type2_Report_2025.pdf',
        fileSizeBytes: 8940000,
        mimeType: 'application/pdf',
        sha256ContentHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        provenanceSource: 'CUSTOMER_INGEST',
        collectionTimestamp: '2026-08-05T10:00:00Z',
        validFrom: '2025-01-01',
        validTo: '2026-12-31',
        isExpired: false,
        daysUntilExpiry: 82,
        reviewStatus: 'ACCEPTED',
        reviewedBy: 'Lead TPRM Assessor',
        reviewedAt: '2026-08-07T11:15:00Z',
        assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
        linkedAssessmentId: 'ASM-AWS-2026',
        linkedQuestionCodes: ['SEC-SOC2-02', 'IAM-MFA-01', 'VULN-PENTEST-01'],
        linkedControlIds: ['CTRL-TPRM-01', 'A.5.21', 'SOC2-CC9.2'],
        linkedRiskIds: ['RSK-TPRM-001'],
        extractedMetadataSummary: 'Unqualified auditor opinion from EY. All CSOU controls confirmed implemented on our side.',
        humanVerificationConfirmed: true
      }
    ],
    monitoringSignals: [
      {
        id: 'SIG-AWS-01',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-aws-001',
        vendorName: 'Amazon Web Services (AWS)',
        category: 'SECURITY_RATING_CHANGE',
        sourceAttribution: 'SECURITY_SCORECARD_API',
        severity: 'INFO',
        eventTimestamp: '2026-09-28T04:12:00Z',
        receivedTimestamp: '2026-09-28T04:15:22Z',
        headline: 'AWS Perimeter Security Rating Re-affirmed at 98/100 (A Rating)',
        details: 'Automated external scan verified valid TLS 1.3 endpoints, zero exposed management ports, and full SPF/DMARC reject policies.',
        observedEvidenceSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        isActionable: false,
        reassessmentTriggered: false,
        status: 'ACKNOWLEDGED'
      }
    ],
    findings: [],
    regulatoryMappings: MASTER_TPRM_REGULATORY_MAPPINGS,
    createdAt: '2022-03-01T00:00:00Z',
    updatedAt: '2026-09-28T04:15:22Z',
    version: 14
  },
  {
    id: 'vnd-okta-002',
    tenantId: 'tenant-acme-corp',
    vendorCode: 'VND-002',
    lifecycleStatus: 'CONTINUOUS_MONITORING',
    approvalDecision: 'APPROVED',
    approvedBy: 'CISO (Sarah Jenkins)',
    approvedAt: '2026-02-10T14:00:00Z',
    profile: {
      legalName: 'Okta Identity Singapore Pte Ltd',
      tradingName: 'Okta Identity Cloud',
      vendorIdentifier: 'VND-OKTA-002',
      taxIdentifier: 'UEN-201829104M',
      legalEntityJurisdiction: 'Singapore (SG)',
      headquartersAddress: '1 Raffles Place, #28-02 One Raffles Place, Singapore 048616',
      industryCategory: 'MANAGED_SECURITY_MSSP',
      websiteUrl: 'https://www.okta.com',
      keyContacts: {
        relationshipOwner: { name: 'Alex Kumar', email: 'alex.kumar@acmegrc.internal', role: 'Director of Identity & IAM' },
        businessSponsor: { name: 'Sarah Jenkins', email: 'sarah.ciso@acmegrc.internal', department: 'Enterprise Security' },
        procurementOwner: { name: 'Michael Tan', email: 'procurement@acmegrc.internal' },
        securityContact: { name: 'Okta Security Incident Response', email: 'security@okta.com' },
        privacyOfficer: { name: 'Okta Privacy Counsel', email: 'privacy@okta.com' },
        contractSignatory: { name: 'Elena Rostova', email: 'elena.cro@acmegrc.internal' }
      }
    },
    relationship: {
      servicesProvidedSummary: 'Enterprise Workforce Single Sign-On (SSO), Adaptive Risk-Based MFA, FastPass Biometrics, and Directory Sync',
      businessFunctionsSupported: ['Workforce Identity & Access Management', 'Privileged Session Governance', 'Zero Trust Device Trust'],
      criticalityTier: 'TIER_1_STRATEGIC_CRITICAL',
      operationalDependencies: ['Employee Login', 'Admin Console Access', 'Internal VPN Gateways'],
      criticalBusinessServicesAffected: ['CBS-02: Customer Identity & Auth', 'CBS-03: Internal Operations Access'],
      geographicServiceLocations: ['ap-southeast-1 (Singapore)', 'us-east-1 (Virginia)'],
      serviceCommencementDate: '2023-01-15',
      contractExpiryDate: '2027-01-15',
      renewalNoticePeriodDays: 60,
      exitStrategyDocumented: true,
      exitTransitionPeriodDays: 90,
      alternativeSupplierAvailable: true,
      alternativeSupplierNames: ['Microsoft Entra ID', 'Ping Identity'],
      substitutabilityRating: 'MODERATE_EFFORT'
    },
    technologyAndData: {
      systemsAndApplicationsAccessed: ['Workforce User Directory', 'SCIM Provisioning Webhooks', 'System Admin Portals'],
      dataClassificationsProcessed: ['RESTRICTED_CUSTOMER_PII', 'INTERNAL_BUSINESS'],
      personalDataInvolvement: true,
      specialCategoryOrSensitiveData: false,
      hostingEnvironment: 'AWS',
      privilegedAccessGranted: true,
      privilegedAccessDetails: 'Global Identity Provider issuing SAML/OIDC tokens for all enterprise systems',
      networkConnectivityType: 'PUBLIC_INTERNET_TLS13',
      apiIntegrationsActive: ['Okta System Log API', 'Event Hook Webhook', 'SCIM API'],
      primaryStorageLocations: ['Singapore (ap-southeast-1)'],
      crossBorderTransfers: false,
      crossBorderTransferMechanisms: ['SCC_2021_914'],
      directSubprocessors: ['AWS US-East', 'Cloudflare CDN'],
      dataRetentionPeriod: '30 Days post account decommissioning',
      dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE'
    },
    assuranceProfile: {
      certifications: [
        {
          standard: 'ISO_27001_2022',
          certificateNumber: 'IS-739201',
          accreditationBody: 'A-LIGN Compliance',
          scopeSummary: 'Okta Identity Cloud SaaS and Workforce Identity Products',
          validFrom: '2024-04-01',
          validTo: '2027-03-31',
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'b4c6e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852',
          isScopeMatchingServices: true
        }
      ],
      socReports: [
        {
          reportType: 'SOC_2_TYPE_2',
          trustServicesCriteria: ['SECURITY', 'AVAILABILITY', 'CONFIDENTIALITY', 'PRIVACY'],
          auditingFirm: 'PricewaterhouseCoopers LLP (PwC)',
          reportingPeriodStart: '2025-01-01',
          reportingPeriodEnd: '2025-12-31',
          auditorOpinion: 'UNQUALIFIED_CLEAN',
          csoUsIdentified: ['CSOU-01: Admin must require MFA on Okta Admin Portal', 'CSOU-02: Organization must audit session timeouts'],
          csoUsImplementedByUs: true,
          bridgeLetterObtained: true,
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'c591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
        }
      ],
      penetrationTesting: {
        lastTestDate: '2025-12-01',
        nextDueTestDate: '2026-12-01',
        testedByThirdParty: true,
        testingFirm: 'Bishop Fox',
        remediationOfCriticalFindingsConfirmed: true
      },
      bcpDrTesting: {
        lastExerciseDate: '2026-01-20',
        rtoCommittedHours: 2,
        rpoCommittedHours: 0.5,
        testOutcome: 'PASS'
      },
      securityPoliciesReceived: true,
      privacyNoticeCompliant: true,
      incidentResponseSlaHours: 1
    },
    latestRiskSnapshot: {
      snapshotId: 'SNP-VND-002-2026Q3',
      tenantId: 'tenant-acme-corp',
      vendorId: 'vnd-okta-002',
      methodologyVersion: '2026.1-TPRM-Enterprise',
      matrixDimension: '5X5',
      calculatedAt: '2026-09-20T00:00:00Z',
      assessedBy: 'Principal TPRM Architect',
      factorBreakdown: [
        { factorId: 'F1', factorName: 'Information Security & Cloud Hardening', factorCategory: 'INFOSEC', weight: 0.15, rawScore: 4, assessedRationale: 'Robust zero trust architecture with SOC 2 Type II and FedRAMP High certification.', groundingEvidenceIds: [] },
        { factorId: 'F2', factorName: 'Customer PII & Confidential Data Storage', factorCategory: 'PRIVACY_PII', weight: 0.15, rawScore: 4, assessedRationale: 'Processes workforce credentials, emails, and device identifiers.', groundingEvidenceIds: [] },
        { factorId: 'F3', factorName: 'Regulatory Compliance (MAS / DPDP)', factorCategory: 'REGULATORY', weight: 0.10, rawScore: 4, assessedRationale: 'Core IAM governance under MAS TRM Sec 8 and Sec 12.', groundingEvidenceIds: [] },
        { factorId: 'F4', factorName: 'Operational Resilience & Multi-AZ DR', factorCategory: 'RESILIENCE_BCP', weight: 0.10, rawScore: 4, assessedRationale: 'Multi-region active-active identity service (99.99% SLA).', groundingEvidenceIds: [] },
        { factorId: 'F5', factorName: 'Financial Viability & Market Standing', factorCategory: 'FINANCIAL_VIABILITY', weight: 0.05, rawScore: 2, assessedRationale: 'Publicly traded NYSE company with stable ARR.', groundingEvidenceIds: [] },
        { factorId: 'F6', factorName: 'Architecture & Interoperability', factorCategory: 'ARCHITECTURE_TECH', weight: 0.05, rawScore: 4, assessedRationale: 'Standard SAML 2.0 / OIDC with automated SCIM user lifecycle management.', groundingEvidenceIds: [] },
        { factorId: 'F7', factorName: 'Privileged Access & Key Management', factorCategory: 'PRIVILEGE_ACCESS', weight: 0.10, rawScore: 5, assessedRationale: 'Issues authentication tokens for all corporate and production systems.', groundingEvidenceIds: [] },
        { factorId: 'F8', factorName: 'Jurisdiction & Cross-Border Sovereign Data', factorCategory: 'GEOGRAPHIC_JURISDICTION', weight: 0.05, rawScore: 2, assessedRationale: 'Singapore data cell active with EU data residency option.', groundingEvidenceIds: [] },
        { factorId: 'F9', factorName: 'Fourth-Party Subprocessor Exposure', factorCategory: 'FOURTH_PARTY_SUPPLY_CHAIN', weight: 0.05, rawScore: 3, assessedRationale: 'AWS US-East and Cloudflare edge dependencies.', groundingEvidenceIds: [] },
        { factorId: 'F10', factorName: 'Single Point of Failure Concentration', factorCategory: 'CONCENTRATION', weight: 0.05, rawScore: 4, assessedRationale: 'Single SSO gateway for all internal workforce users.', groundingEvidenceIds: [] },
        { factorId: 'F11', factorName: 'AI Model Safety & Data Isolation', factorCategory: 'AI_GOVERNANCE', weight: 0.05, rawScore: 1, assessedRationale: 'AI Risk Engine used internally without customer prompt training.', groundingEvidenceIds: [] },
        { factorId: 'F12', factorName: 'Business Criticality to Core Operations', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.10, rawScore: 5, assessedRationale: 'Tier-1 Critical Identity Gateway.', groundingEvidenceIds: [] }
      ],
      inherentLikelihood: 4,
      inherentImpact: 5,
      inherentRiskScore: 20,
      inherentRiskLevel: 'CRITICAL',
      controlDesignScore: 95,
      controlOperatingScore: 92,
      evidenceFreshnessScore: 100,
      combinedControlEffectiveness: 94,
      residualLikelihood: 1,
      residualImpact: 4,
      residualRiskScore: 4,
      residualRiskLevel: 'LOW',
      isResidualHigherThanInherent: false,
      riskAppetiteThreshold: 8,
      isOutsideAppetite: false,
      confidenceScorePercent: 96,
      evidenceCompletenessPercent: 100,
      scoringExplanation: 'Inherent risk score is 20 (Critical) because Okta is the master authentication gateway for all systems. Mitigating controls (FedRAMP High, SOC 2 Type II, WebAuthn Passkeys, Multi-Region Active-Active) reduce residual score to 4 (Low).',
      topRiskContributors: ['Privileged Authentication Tokens', 'Master Workforce User Directory', 'Cloudflare Edge Dependency']
    },
    activeAssessments: [],
    activeContracts: [],
    evidenceItems: [],
    monitoringSignals: [],
    findings: [],
    regulatoryMappings: MASTER_TPRM_REGULATORY_MAPPINGS,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
    version: 8
  },
  {
    id: 'vnd-stripe-003',
    tenantId: 'tenant-acme-corp',
    vendorCode: 'VND-003',
    lifecycleStatus: 'CONTINUOUS_MONITORING',
    approvalDecision: 'APPROVED',
    approvedBy: 'Head of FinOps (David Lim)',
    approvedAt: '2026-01-10T11:00:00Z',
    profile: {
      legalName: 'Stripe Payments Singapore Pte Ltd',
      tradingName: 'Stripe Payments',
      vendorIdentifier: 'VND-STRIPE-003',
      taxIdentifier: 'UEN-201502481Z',
      legalEntityJurisdiction: 'Singapore (SG)',
      headquartersAddress: '8 Marina View, #40-01 Asia Square Tower 1, Singapore 018960',
      industryCategory: 'PAYMENT_GATEWAY_FINTECH',
      websiteUrl: 'https://stripe.com/sg',
      keyContacts: {
        relationshipOwner: { name: 'David Lim', email: 'david.lim@acmegrc.internal', role: 'Head of FinOps & Billing' },
        businessSponsor: { name: 'Rachel Wong', email: 'rachel.cfo@acmegrc.internal', department: 'Finance & Treasury' },
        procurementOwner: { name: 'Michael Tan', email: 'procurement@acmegrc.internal' },
        securityContact: { name: 'Stripe Security Team', email: 'security@stripe.com' },
        privacyOfficer: { name: 'Stripe DPO', email: 'dpo@stripe.com' },
        contractSignatory: { name: 'Elena Rostova', email: 'elena.cro@acmegrc.internal' }
      }
    },
    relationship: {
      servicesProvidedSummary: 'Payment Ingestion, Tokenized Card Acquiring, Fraud Prevention (Stripe Radar), and Statutory Tax Settlement',
      businessFunctionsSupported: ['Customer Payment Processing', 'Subscription Billing', 'PCI-DSS Tokenization'],
      criticalityTier: 'TIER_1_STRATEGIC_CRITICAL',
      operationalDependencies: ['Checkout Workflow', 'Card Vaulting', 'Webhook Settlement Processing'],
      criticalBusinessServicesAffected: ['CBS-01: Real-Time Payment Settlement'],
      geographicServiceLocations: ['Singapore (SG)', 'Global Banking Rails'],
      serviceCommencementDate: '2023-06-01',
      contractExpiryDate: '2026-12-31',
      renewalNoticePeriodDays: 60,
      exitStrategyDocumented: true,
      exitTransitionPeriodDays: 60,
      alternativeSupplierAvailable: true,
      alternativeSupplierNames: ['Adyen Singapore', 'Checkout.com'],
      substitutabilityRating: 'MODERATE_EFFORT'
    },
    technologyAndData: {
      systemsAndApplicationsAccessed: ['Stripe Merchant Dashboard', 'Billing Webhook API', 'PCI-DSS Token Vault'],
      dataClassificationsProcessed: ['RESTRICTED_CUSTOMER_PII', 'FINANCIAL_TRANSACTIONAL'],
      personalDataInvolvement: true,
      specialCategoryOrSensitiveData: true,
      hostingEnvironment: 'AWS',
      privilegedAccessGranted: false,
      networkConnectivityType: 'PUBLIC_INTERNET_TLS13',
      apiIntegrationsActive: ['Stripe Charges API', 'Stripe Subscriptions API', 'Stripe Radar Webhook'],
      primaryStorageLocations: ['Singapore', 'United States'],
      crossBorderTransfers: true,
      crossBorderTransferMechanisms: ['SCC_2021_914'],
      directSubprocessors: ['Visa Global Network', 'Mastercard Network', 'AWS'],
      dataRetentionPeriod: '7 Years post settlement (Statutory MAS / AML mandate)',
      dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE'
    },
    assuranceProfile: {
      certifications: [
        {
          standard: 'PCI_DSS_V4',
          certificateNumber: 'PCI-STRIPE-LEVEL1-2026',
          accreditationBody: 'SecurityMetrics QSA',
          scopeSummary: 'PCI-DSS Level 1 Service Provider Payment Tokenization & Cardholder Data Environment',
          validFrom: '2025-07-01',
          validTo: '2026-06-30',
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'f1a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
          isScopeMatchingServices: true
        }
      ],
      socReports: [
        {
          reportType: 'SOC_1_TYPE_2',
          trustServicesCriteria: ['SECURITY', 'PROCESSING_INTEGRITY'],
          auditingFirm: 'PricewaterhouseCoopers LLP',
          reportingPeriodStart: '2025-01-01',
          reportingPeriodEnd: '2025-12-31',
          auditorOpinion: 'UNQUALIFIED_CLEAN',
          csoUsIdentified: ['CSOU-01: Merchant must verify webhook signatures via HMAC SHA-256'],
          csoUsImplementedByUs: true,
          bridgeLetterObtained: true,
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'd591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
        }
      ],
      penetrationTesting: {
        lastTestDate: '2025-10-15',
        nextDueTestDate: '2026-10-15',
        testedByThirdParty: true,
        testingFirm: 'Include Security',
        remediationOfCriticalFindingsConfirmed: true
      },
      bcpDrTesting: {
        lastExerciseDate: '2026-02-01',
        rtoCommittedHours: 0.5,
        rpoCommittedHours: 0,
        testOutcome: 'PASS'
      },
      securityPoliciesReceived: true,
      privacyNoticeCompliant: true,
      incidentResponseSlaHours: 1
    },
    latestRiskSnapshot: {
      snapshotId: 'SNP-VND-003-2026Q3',
      tenantId: 'tenant-acme-corp',
      vendorId: 'vnd-stripe-003',
      methodologyVersion: '2026.1-TPRM-Enterprise',
      matrixDimension: '5X5',
      calculatedAt: '2026-09-10T00:00:00Z',
      assessedBy: 'Principal TPRM Architect',
      factorBreakdown: [
        { factorId: 'F1', factorName: 'Information Security & Cloud Hardening', factorCategory: 'INFOSEC', weight: 0.15, rawScore: 5, assessedRationale: 'PCI-DSS Level 1 certified environment with end-to-end tokenization.', groundingEvidenceIds: [] },
        { factorId: 'F2', factorName: 'Customer PII & Confidential Data Storage', factorCategory: 'PRIVACY_PII', weight: 0.15, rawScore: 5, assessedRationale: 'Cardholder numbers, billing addresses, and payment transaction metadata.', groundingEvidenceIds: [] },
        { factorId: 'F3', factorName: 'Regulatory Compliance (MAS / DPDP)', factorCategory: 'REGULATORY', weight: 0.10, rawScore: 5, assessedRationale: 'MAS Payment Services Act (PSA) licensed Major Payment Institution.', groundingEvidenceIds: [] },
        { factorId: 'F4', factorName: 'Operational Resilience & Multi-AZ DR', factorCategory: 'RESILIENCE_BCP', weight: 0.10, rawScore: 4, assessedRationale: '99.999% SLA with automated acquirer routing.', groundingEvidenceIds: [] },
        { factorId: 'F5', factorName: 'Financial Viability & Market Standing', factorCategory: 'FINANCIAL_VIABILITY', weight: 0.05, rawScore: 1, assessedRationale: 'Tier-1 global payments unicorn with strong capital reserves.', groundingEvidenceIds: [] },
        { factorId: 'F6', factorName: 'Architecture & Interoperability', factorCategory: 'ARCHITECTURE_TECH', weight: 0.05, rawScore: 4, assessedRationale: 'Idempotent webhook signatures with TLS 1.3 encryption.', groundingEvidenceIds: [] },
        { factorId: 'F7', factorName: 'Privileged Access & Key Management', factorCategory: 'PRIVILEGE_ACCESS', weight: 0.10, rawScore: 3, assessedRationale: 'API key secret rotation enforced every 90 days.', groundingEvidenceIds: [] },
        { factorId: 'F8', factorName: 'Jurisdiction & Cross-Border Sovereign Data', factorCategory: 'GEOGRAPHIC_JURISDICTION', weight: 0.05, rawScore: 3, assessedRationale: 'Global banking settlement with standard EU SCCs.', groundingEvidenceIds: [] },
        { factorId: 'F9', factorName: 'Fourth-Party Subprocessor Exposure', factorCategory: 'FOURTH_PARTY_SUPPLY_CHAIN', weight: 0.05, rawScore: 4, assessedRationale: 'Downstream card networks (Visa/Mastercard) and banking partners.', groundingEvidenceIds: [] },
        { factorId: 'F10', factorName: 'Single Point of Failure Concentration', factorCategory: 'CONCENTRATION', weight: 0.05, rawScore: 4, assessedRationale: 'Primary payment gateway for all B2B subscription charges.', groundingEvidenceIds: [] },
        { factorId: 'F11', factorName: 'AI Model Safety & Data Isolation', factorCategory: 'AI_GOVERNANCE', weight: 0.05, rawScore: 2, assessedRationale: 'Stripe Radar ML models operate on aggregated risk indicators.', groundingEvidenceIds: [] },
        { factorId: 'F12', factorName: 'Business Criticality to Core Operations', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.10, rawScore: 5, assessedRationale: 'Payment collection is critical for business continuity.', groundingEvidenceIds: [] }
      ],
      inherentLikelihood: 4,
      inherentImpact: 5,
      inherentRiskScore: 20,
      inherentRiskLevel: 'CRITICAL',
      controlDesignScore: 99,
      controlOperatingScore: 97,
      evidenceFreshnessScore: 95,
      combinedControlEffectiveness: 97,
      residualLikelihood: 1,
      residualImpact: 3,
      residualRiskScore: 3,
      residualRiskLevel: 'LOW',
      isResidualHigherThanInherent: false,
      riskAppetiteThreshold: 8,
      isOutsideAppetite: false,
      confidenceScorePercent: 99,
      evidenceCompletenessPercent: 100,
      scoringExplanation: 'Inherent risk score is 20 (Critical) due to high-velocity financial transactions and PCI card data. Excellent controls (PCI DSS L1, SOC 1 Type II clean opinion, tokenization) reduce residual risk score to 3 (Low).',
      topRiskContributors: ['Financial Cardholder Data', 'MAS Payment Services Act Regulatory Mandate', 'Acquiring Rails Concentration']
    },
    activeAssessments: [],
    activeContracts: [
      {
        id: 'CTR-STRIPE-2023',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-stripe-003',
        contractReference: 'MSA-STRIPE-SG-2023-06',
        title: 'Stripe Connected Platform Agreement & DPA Addendum',
        contractType: 'MASTER_SERVICES_AGREEMENT',
        status: 'ACTIVE',
        effectiveDate: '2023-06-01',
        expiryDate: '2026-12-31',
        renewalNoticePeriodDays: 60,
        autoRenew: true,
        daysUntilExpiry: 82,
        governingLaw: 'Singapore Law',
        securityClausesSummary: 'PCI-DSS Level 1 compliance warranty, immediate breach notification SLA, and MAS outsourcing audit rights.',
        dpaArticle28Compliant: true,
        dpdpSection8Compliant: true,
        incidentNotificationHoursSla: 2,
        auditAndInspectionRights: 'SOC2_REPORT_ONLY',
        subprocessorApprovalRequirement: '30_DAYS_NOTICE',
        dataReturnAndDeletionCommitmentDays: 30,
        slaAvailabilityPercent: 99.999,
        breachRemediesDefined: true,
        exitAssistanceObligation: true,
        contractDocumentSha256: 'd591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        verifiedByLegal: true
      }
    ],
    evidenceItems: [],
    monitoringSignals: [],
    findings: [],
    regulatoryMappings: MASTER_TPRM_REGULATORY_MAPPINGS,
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
    version: 7
  },
  {
    id: 'vnd-datadog-004',
    tenantId: 'tenant-acme-corp',
    vendorCode: 'VND-004',
    lifecycleStatus: 'REMEDIATION_AND_CAPA',
    approvalDecision: 'CONDITIONALLY_APPROVED',
    approvedBy: 'Lead SecOps (Alex Kumar)',
    approvedAt: '2026-03-01T08:00:00Z',
    profile: {
      legalName: 'Datadog Singapore Pte Ltd',
      tradingName: 'Datadog Observability & SIEM',
      vendorIdentifier: 'VND-DATADOG-004',
      taxIdentifier: 'UEN-201931849D',
      legalEntityJurisdiction: 'Singapore (SG)',
      headquartersAddress: '71 Robinson Road, #14-01, Singapore 068895',
      industryCategory: 'DATA_ANALYTICS_AI',
      websiteUrl: 'https://www.datadoghq.com',
      keyContacts: {
        relationshipOwner: { name: 'Alex Kumar', email: 'alex.kumar@acmegrc.internal', role: 'Lead SecOps Engineer' },
        businessSponsor: { name: 'Sarah Chen', email: 'sarah.chen@acmegrc.internal', department: 'Engineering' },
        procurementOwner: { name: 'Michael Tan', email: 'procurement@acmegrc.internal' },
        securityContact: { name: 'Datadog Security', email: 'security@datadoghq.com' },
        privacyOfficer: { name: 'Datadog Privacy', email: 'privacy@datadoghq.com' },
        contractSignatory: { name: 'Elena Rostova', email: 'elena.cro@acmegrc.internal' }
      }
    },
    relationship: {
      servicesProvidedSummary: 'Cloud Application Performance Monitoring (APM), Distributed Tracing, SIEM Log Ingestion, and Synthetic Testing',
      businessFunctionsSupported: ['Cloud Observability', 'Security Monitoring & Alerting', 'Incident Root Cause Analysis'],
      criticalityTier: 'TIER_2_MAJOR_OPERATIONAL',
      operationalDependencies: ['Production SIEM', 'Alerting PagerDuty Webhooks'],
      criticalBusinessServicesAffected: ['CBS-03: Internal Operations Access'],
      geographicServiceLocations: ['ap-southeast-1 (Singapore)', 'us-east-1 (Virginia)'],
      serviceCommencementDate: '2024-02-01',
      contractExpiryDate: '2027-02-01',
      renewalNoticePeriodDays: 60,
      exitStrategyDocumented: true,
      exitTransitionPeriodDays: 45,
      alternativeSupplierAvailable: true,
      alternativeSupplierNames: ['Dynatrace', 'New Relic'],
      substitutabilityRating: 'MODERATE_EFFORT'
    },
    technologyAndData: {
      systemsAndApplicationsAccessed: ['Kubernetes Cluster Telemetry', 'Application Traces', 'Sanitized Audit Logs'],
      dataClassificationsProcessed: ['CONFIDENTIAL_IP', 'INTERNAL_BUSINESS'],
      personalDataInvolvement: false,
      specialCategoryOrSensitiveData: false,
      hostingEnvironment: 'AWS',
      privilegedAccessGranted: false,
      networkConnectivityType: 'PUBLIC_INTERNET_TLS13',
      apiIntegrationsActive: ['Datadog Agent DaemonSet', 'AWS CloudWatch Metric Stream'],
      primaryStorageLocations: ['Singapore (ap-southeast-1)'],
      crossBorderTransfers: false,
      crossBorderTransferMechanisms: ['SCC_2021_914'],
      directSubprocessors: ['AWS US-East', 'Cloudflare DNS'],
      dataRetentionPeriod: '15 Months (Standard SIEM retention)',
      dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE'
    },
    assuranceProfile: {
      certifications: [
        {
          standard: 'ISO_27001_2022',
          certificateNumber: 'BSI-IS-719384',
          accreditationBody: 'BSI Assurance UK',
          scopeSummary: 'Datadog Global Monitoring and Cloud Platform Services',
          validFrom: '2024-01-01',
          validTo: '2027-01-01',
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'e591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
          isScopeMatchingServices: true
        }
      ],
      socReports: [
        {
          reportType: 'SOC_2_TYPE_2',
          trustServicesCriteria: ['SECURITY', 'AVAILABILITY', 'CONFIDENTIALITY'],
          auditingFirm: 'PricewaterhouseCoopers LLP',
          reportingPeriodStart: '2025-01-01',
          reportingPeriodEnd: '2025-12-31',
          auditorOpinion: 'UNQUALIFIED_CLEAN',
          csoUsIdentified: ['CSOU-01: Customer must mask PII and secret tokens in application logs before forwarding'],
          csoUsImplementedByUs: true,
          bridgeLetterObtained: true,
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'f591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
        }
      ],
      penetrationTesting: {
        lastTestDate: '2025-09-01',
        nextDueTestDate: '2026-09-01',
        testedByThirdParty: true,
        testingFirm: 'NCC Group',
        remediationOfCriticalFindingsConfirmed: true
      },
      bcpDrTesting: {
        lastExerciseDate: '2026-01-15',
        rtoCommittedHours: 4,
        rpoCommittedHours: 1,
        testOutcome: 'PASS'
      },
      securityPoliciesReceived: true,
      privacyNoticeCompliant: true,
      incidentResponseSlaHours: 4
    },
    latestRiskSnapshot: {
      snapshotId: 'SNP-VND-004-2026Q3',
      tenantId: 'tenant-acme-corp',
      vendorId: 'vnd-datadog-004',
      methodologyVersion: '2026.1-TPRM-Enterprise',
      matrixDimension: '5X5',
      calculatedAt: '2026-09-25T00:00:00Z',
      assessedBy: 'Senior TPRM Analyst',
      factorBreakdown: [
        { factorId: 'F1', factorName: 'Information Security & Cloud Hardening', factorCategory: 'INFOSEC', weight: 0.15, rawScore: 4, assessedRationale: 'Good baseline security, but TLS certificate nearing expiration on auxiliary webhook endpoint.', groundingEvidenceIds: [] },
        { factorId: 'F2', factorName: 'Customer PII & Confidential Data Storage', factorCategory: 'PRIVACY_PII', weight: 0.15, rawScore: 2, assessedRationale: 'Log filtering rules actively strip credit card and customer PII before transmission.', groundingEvidenceIds: [] },
        { factorId: 'F3', factorName: 'Regulatory Compliance (MAS / DPDP)', factorCategory: 'REGULATORY', weight: 0.10, rawScore: 3, assessedRationale: 'Log retention compliant with MAS TRM Sec 11 logging guidelines.', groundingEvidenceIds: [] },
        { factorId: 'F4', factorName: 'Operational Resilience & Multi-AZ DR', factorCategory: 'RESILIENCE_BCP', weight: 0.10, rawScore: 3, assessedRationale: '99.9% uptime SLA.', groundingEvidenceIds: [] },
        { factorId: 'F5', factorName: 'Financial Viability & Market Standing', factorCategory: 'FINANCIAL_VIABILITY', weight: 0.05, rawScore: 1, assessedRationale: 'Strong financial position (NASDAQ: DDOG).', groundingEvidenceIds: [] },
        { factorId: 'F6', factorName: 'Architecture & Interoperability', factorCategory: 'ARCHITECTURE_TECH', weight: 0.05, rawScore: 3, assessedRationale: 'OpenTelemetry compatible.', groundingEvidenceIds: [] },
        { factorId: 'F7', factorName: 'Privileged Access & Key Management', factorCategory: 'PRIVILEGE_ACCESS', weight: 0.10, rawScore: 2, assessedRationale: 'Read-only telemetry agent.', groundingEvidenceIds: [] },
        { factorId: 'F8', factorName: 'Jurisdiction & Cross-Border Sovereign Data', factorCategory: 'GEOGRAPHIC_JURISDICTION', weight: 0.05, rawScore: 2, assessedRationale: 'Singapore data center.', groundingEvidenceIds: [] },
        { factorId: 'F9', factorName: 'Fourth-Party Subprocessor Exposure', factorCategory: 'FOURTH_PARTY_SUPPLY_CHAIN', weight: 0.05, rawScore: 3, assessedRationale: 'AWS US-East dependency.', groundingEvidenceIds: [] },
        { factorId: 'F10', factorName: 'Single Point of Failure Concentration', factorCategory: 'CONCENTRATION', weight: 0.05, rawScore: 3, assessedRationale: 'Primary SIEM and alert aggregator.', groundingEvidenceIds: [] },
        { factorId: 'F11', factorName: 'AI Model Safety & Data Isolation', factorCategory: 'AI_GOVERNANCE', weight: 0.05, rawScore: 1, assessedRationale: 'Bits AI Assistant operates within private tenant scope.', groundingEvidenceIds: [] },
        { factorId: 'F12', factorName: 'Business Criticality to Core Operations', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.10, rawScore: 3, assessedRationale: 'Tier-2 Major Operational supplier.', groundingEvidenceIds: [] }
      ],
      inherentLikelihood: 3,
      inherentImpact: 3,
      inherentRiskScore: 9,
      inherentRiskLevel: 'MEDIUM',
      controlDesignScore: 90,
      controlOperatingScore: 78, // Degraded due to expiring cert finding
      evidenceFreshnessScore: 90,
      combinedControlEffectiveness: 82,
      residualLikelihood: 3, // Elevated likelihood until retest passes
      residualImpact: 3,
      residualRiskScore: 9,
      residualRiskLevel: 'MEDIUM',
      isResidualHigherThanInherent: false,
      riskAppetiteThreshold: 8,
      isOutsideAppetite: true, // Score 9 > Threshold 8! Outside appetite
      confidenceScorePercent: 92,
      evidenceCompletenessPercent: 95,
      scoringExplanation: 'Residual risk score remains at 9 (Medium, Outside Appetite Threshold 8) due to active finding FND-VND-2026-004 (Expiring TLS Certificate on auxiliary ingest endpoint). Closure blocked until independent retest passes.',
      topRiskContributors: ['Active Finding: Expiring TLS Certificate', 'Outside Risk Appetite (9 > 8)', 'SIEM Alerting Dependency']
    },
    activeAssessments: [],
    activeContracts: [],
    evidenceItems: [],
    monitoringSignals: [
      {
        id: 'SIG-DATADOG-01',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-datadog-004',
        vendorName: 'Datadog Observability',
        category: 'CERTIFICATE_EXPIRING',
        sourceAttribution: 'SHODAN_SCANNER',
        severity: 'HIGH',
        eventTimestamp: '2026-09-26T12:00:00Z',
        receivedTimestamp: '2026-09-26T12:05:00Z',
        headline: 'Datadog Ingestion TLS Certificate Expiring in 7 Days',
        details: 'Automated TLS scan detected certificate for ingest.datadoghq.com expiring on 2026-10-15. Risk of SIEM ingestion disruption if not renewed.',
        observedEvidenceSha256: '7f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        isActionable: true,
        reassessmentTriggered: true,
        status: 'INVESTIGATING'
      }
    ],
    findings: [
      {
        id: 'FND-VND-2026-004',
        tenantId: 'tenant-acme-corp',
        vendorId: 'vnd-datadog-004',
        vendorName: 'Datadog Singapore Pte Ltd',
        findingCode: 'FND-VND-2026-004',
        title: 'Auxiliary Webhook TLS Certificate Expiring within 7 Days',
        description: 'Automated TPRM monitoring identified that the public TLS certificate on the auxiliary webhook ingestion endpoint will expire in 7 days without automated ACME renewal.',
        severity: 'HIGH',
        category: 'EXPIRED_CERT',
        rootCause: 'Manual certificate renewal schedule misconfigured in supplier external proxy.',
        identifiedDate: '2026-09-26',
        assignedOwner: 'Alex Kumar (Lead SecOps)',
        targetRemediationDate: '2026-10-05',
        status: 'INDEPENDENT_RETESTING',
        correctiveActionPlan: 'Datadog support ticket #89210 escalated; vendor deployed renewed DigiCert 2-year TLS 1.3 certificate.',
        compensatingControls: 'Secondary fallback ingest endpoint configured with active TLS 1.3.',
        remediationEvidenceIds: ['EV-TPRM-DD-CERT-RENEWAL'],
        independentRetestRequired: true,
        retestOutcome: 'PENDING',
        retestNotes: 'Automated network scan scheduled to verify new certificate issuance before verified closure.'
      }
    ],
    regulatoryMappings: MASTER_TPRM_REGULATORY_MAPPINGS,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2026-09-26T12:05:00Z',
    version: 11
  },
  {
    id: 'vnd-github-005',
    tenantId: 'tenant-acme-corp',
    vendorCode: 'VND-005',
    lifecycleStatus: 'CONTINUOUS_MONITORING',
    approvalDecision: 'APPROVED',
    approvedBy: 'VP Engineering (James Thorne)',
    approvedAt: '2026-01-20T10:00:00Z',
    profile: {
      legalName: 'GitHub Inc. (Microsoft Corporation)',
      tradingName: 'GitHub Enterprise Cloud',
      vendorIdentifier: 'VND-GITHUB-005',
      taxIdentifier: 'EIN-26-3849102',
      legalEntityJurisdiction: 'United States (US - Delaware)',
      headquartersAddress: '88 Colin P Kelly Jr St, San Francisco, CA 94107, United States',
      industryCategory: 'DEVELOPER_TOOLS_DEVOPS',
      websiteUrl: 'https://github.com',
      keyContacts: {
        relationshipOwner: { name: 'James Thorne', email: 'james.thorne@acmegrc.internal', role: 'VP Engineering' },
        businessSponsor: { name: 'Sarah Chen', email: 'sarah.chen@acmegrc.internal', department: 'Engineering' },
        procurementOwner: { name: 'Michael Tan', email: 'procurement@acmegrc.internal' },
        securityContact: { name: 'GitHub Security', email: 'security@github.com' },
        privacyOfficer: { name: 'Microsoft Privacy Counsel', email: 'privacy@microsoft.com' },
        contractSignatory: { name: 'Elena Rostova', email: 'elena.cro@acmegrc.internal' }
      }
    },
    relationship: {
      servicesProvidedSummary: 'Source Code Management (SCM), GitHub Actions Enterprise CI/CD, Dependabot Vulnerability Scanning, and Secret Scanning',
      businessFunctionsSupported: ['Software Engineering', 'CI/CD Automated Deployment', 'Security Code Scanning'],
      criticalityTier: 'TIER_1_STRATEGIC_CRITICAL',
      operationalDependencies: ['Source Code Repositories', 'Build Pipelines', 'Artifact Releases'],
      criticalBusinessServicesAffected: ['CBS-03: Internal Operations Access'],
      geographicServiceLocations: ['United States (us-east)', 'Azure Europe'],
      serviceCommencementDate: '2022-01-10',
      contractExpiryDate: '2027-01-10',
      renewalNoticePeriodDays: 60,
      exitStrategyDocumented: true,
      exitTransitionPeriodDays: 90,
      alternativeSupplierAvailable: true,
      alternativeSupplierNames: ['GitLab Enterprise', 'Bitbucket Cloud'],
      substitutabilityRating: 'MODERATE_EFFORT'
    },
    technologyAndData: {
      systemsAndApplicationsAccessed: ['Proprietary Application Source Code', 'CI/CD Deployment Secrets', 'Developer SSH Keys'],
      dataClassificationsProcessed: ['CONFIDENTIAL_IP', 'INTERNAL_BUSINESS'],
      personalDataInvolvement: false,
      specialCategoryOrSensitiveData: false,
      hostingEnvironment: 'AZURE',
      privilegedAccessGranted: true,
      privilegedAccessDetails: 'GitHub Actions OIDC AWS Role Assumption for production container deployments',
      networkConnectivityType: 'PUBLIC_INTERNET_TLS13',
      apiIntegrationsActive: ['GitHub REST API', 'GitHub Webhooks', 'GitHub Advanced Security API'],
      primaryStorageLocations: ['United States (us-east)'],
      crossBorderTransfers: true,
      crossBorderTransferMechanisms: ['SCC_2021_914'],
      directSubprocessors: ['Microsoft Azure Infrastructure'],
      dataRetentionPeriod: '90 Days post repository deletion',
      dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE'
    },
    assuranceProfile: {
      certifications: [
        {
          standard: 'ISO_27001_2022',
          certificateNumber: 'BSI-IS-694821',
          accreditationBody: 'BSI Assurance UK',
          scopeSummary: 'GitHub Enterprise Cloud and Developer Services',
          validFrom: '2024-03-01',
          validTo: '2027-02-28',
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
          isScopeMatchingServices: true
        }
      ],
      socReports: [
        {
          reportType: 'SOC_2_TYPE_2',
          trustServicesCriteria: ['SECURITY', 'AVAILABILITY', 'CONFIDENTIALITY'],
          auditingFirm: 'Deloitte & Touche LLP',
          reportingPeriodStart: '2025-01-01',
          reportingPeriodEnd: '2025-12-31',
          auditorOpinion: 'UNQUALIFIED_CLEAN',
          csoUsIdentified: ['CSOU-01: Organization must enforce SAML SSO and required 2FA for all organization members'],
          csoUsImplementedByUs: true,
          bridgeLetterObtained: true,
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'b1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
        }
      ],
      penetrationTesting: {
        lastTestDate: '2025-11-10',
        nextDueTestDate: '2026-11-10',
        testedByThirdParty: true,
        testingFirm: 'NCC Group',
        remediationOfCriticalFindingsConfirmed: true
      },
      bcpDrTesting: {
        lastExerciseDate: '2026-02-05',
        rtoCommittedHours: 2,
        rpoCommittedHours: 0.5,
        testOutcome: 'PASS'
      },
      securityPoliciesReceived: true,
      privacyNoticeCompliant: true,
      incidentResponseSlaHours: 1
    },
    latestRiskSnapshot: {
      snapshotId: 'SNP-VND-005-2026Q3',
      tenantId: 'tenant-acme-corp',
      vendorId: 'vnd-github-005',
      methodologyVersion: '2026.1-TPRM-Enterprise',
      matrixDimension: '5X5',
      calculatedAt: '2026-09-18T00:00:00Z',
      assessedBy: 'Principal TPRM Architect',
      factorBreakdown: [
        { factorId: 'F1', factorName: 'Information Security & Cloud Hardening', factorCategory: 'INFOSEC', weight: 0.15, rawScore: 4, assessedRationale: 'Microsoft Enterprise security with mandatory branch protection and signed commits.', groundingEvidenceIds: [] },
        { factorId: 'F2', factorName: 'Customer PII & Confidential Data Storage', factorCategory: 'PRIVACY_PII', weight: 0.15, rawScore: 3, assessedRationale: 'No customer PII stored; contains core intellectual property source code.', groundingEvidenceIds: [] },
        { factorId: 'F3', factorName: 'Regulatory Compliance (MAS / DPDP)', factorCategory: 'REGULATORY', weight: 0.10, rawScore: 4, assessedRationale: 'Source code escrow and change management governance under MAS TRM Sec 10.', groundingEvidenceIds: [] },
        { factorId: 'F4', factorName: 'Operational Resilience & Multi-AZ DR', factorCategory: 'RESILIENCE_BCP', weight: 0.10, rawScore: 4, assessedRationale: 'Azure multi-region active replication.', groundingEvidenceIds: [] },
        { factorId: 'F5', factorName: 'Financial Viability & Market Standing', factorCategory: 'FINANCIAL_VIABILITY', weight: 0.05, rawScore: 1, assessedRationale: 'Backed by Microsoft Corporation.', groundingEvidenceIds: [] },
        { factorId: 'F6', factorName: 'Architecture & Interoperability', factorCategory: 'ARCHITECTURE_TECH', weight: 0.05, rawScore: 5, assessedRationale: 'Industry standard Git protocol with automated Webhook integration.', groundingEvidenceIds: [] },
        { factorId: 'F7', factorName: 'Privileged Access & Key Management', factorCategory: 'PRIVILEGE_ACCESS', weight: 0.10, rawScore: 5, assessedRationale: 'OIDC AWS IAM role assumption for deployment credentials.', groundingEvidenceIds: [] },
        { factorId: 'F8', factorName: 'Jurisdiction & Cross-Border Sovereign Data', factorCategory: 'GEOGRAPHIC_JURISDICTION', weight: 0.05, rawScore: 2, assessedRationale: 'US hosted with EU data residency option.', groundingEvidenceIds: [] },
        { factorId: 'F9', factorName: 'Fourth-Party Subprocessor Exposure', factorCategory: 'FOURTH_PARTY_SUPPLY_CHAIN', weight: 0.05, rawScore: 3, assessedRationale: 'Azure cloud infrastructure dependency.', groundingEvidenceIds: [] },
        { factorId: 'F10', factorName: 'Single Point of Failure Concentration', factorCategory: 'CONCENTRATION', weight: 0.05, rawScore: 4, assessedRationale: 'Primary source code repository for all production releases.', groundingEvidenceIds: [] },
        { factorId: 'F11', factorName: 'AI Model Safety & Data Isolation', factorCategory: 'AI_GOVERNANCE', weight: 0.05, rawScore: 2, assessedRationale: 'GitHub Copilot Enterprise configured with public code block matching and zero retention.', groundingEvidenceIds: [] },
        { factorId: 'F12', factorName: 'Business Criticality to Core Operations', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.10, rawScore: 5, assessedRationale: 'Tier-1 Critical Developer Tool.', groundingEvidenceIds: [] }
      ],
      inherentLikelihood: 4,
      inherentImpact: 4,
      inherentRiskScore: 16,
      inherentRiskLevel: 'HIGH',
      controlDesignScore: 96,
      controlOperatingScore: 94,
      evidenceFreshnessScore: 98,
      combinedControlEffectiveness: 96,
      residualLikelihood: 1,
      residualImpact: 3,
      residualRiskScore: 3,
      residualRiskLevel: 'LOW',
      isResidualHigherThanInherent: false,
      riskAppetiteThreshold: 8,
      isOutsideAppetite: false,
      confidenceScorePercent: 97,
      evidenceCompletenessPercent: 100,
      scoringExplanation: 'Inherent risk score is 16 (High) due to proprietary intellectual property and automated CI/CD deployment credentials. Robust safeguards (ISO 27001, SOC 2, OIDC Short-Lived Tokens, Secret Scanning) reduce residual risk score to 3 (Low).',
      topRiskContributors: ['Proprietary IP Source Code', 'CI/CD Deployment Role Assumption', 'Azure Downstream Dependency']
    },
    activeAssessments: [],
    activeContracts: [],
    evidenceItems: [],
    monitoringSignals: [],
    findings: [],
    regulatoryMappings: MASTER_TPRM_REGULATORY_MAPPINGS,
    createdAt: '2022-01-10T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
    version: 9
  },
  {
    id: 'vnd-anthropic-007',
    tenantId: 'tenant-acme-corp',
    vendorCode: 'VND-007',
    lifecycleStatus: 'RISK_EVALUATION',
    approvalDecision: 'PENDING_EXECUTIVE_APPROVAL',
    profile: {
      legalName: 'Anthropic PBC',
      tradingName: 'Anthropic Claude Enterprise',
      vendorIdentifier: 'VND-ANTHROPIC-007',
      taxIdentifier: 'EIN-86-2918401',
      legalEntityJurisdiction: 'United States (US - Delaware)',
      headquartersAddress: '548 Market St, PMB 90812, San Francisco, CA 94104, United States',
      industryCategory: 'DATA_ANALYTICS_AI',
      websiteUrl: 'https://www.anthropic.com',
      keyContacts: {
        relationshipOwner: { name: 'Karthik J', email: 'karthik.ai@acmegrc.internal', role: 'Chief AI Architect' },
        businessSponsor: { name: 'Elena Rostova', email: 'elena.cro@acmegrc.internal', department: 'Enterprise Risk & AI' },
        procurementOwner: { name: 'Michael Tan', email: 'procurement@acmegrc.internal' },
        securityContact: { name: 'Anthropic Security', email: 'security@anthropic.com' },
        privacyOfficer: { name: 'Anthropic Privacy Team', email: 'privacy@anthropic.com' },
        contractSignatory: { name: 'Elena Rostova', email: 'elena.cro@acmegrc.internal' }
      }
    },
    relationship: {
      servicesProvidedSummary: 'Enterprise Claude 3.5 Sonnet / Haiku LLM API for automated GRC evidence analysis, policy drafting, and regulatory cross-mapping',
      businessFunctionsSupported: ['GRC AI Assistant', 'Audit Evidence Summarization', 'Contract Obligation Extraction'],
      criticalityTier: 'TIER_2_MAJOR_OPERATIONAL',
      operationalDependencies: ['AI Risk Intelligence Copilot'],
      criticalBusinessServicesAffected: ['CBS-03: Internal Operations Access'],
      geographicServiceLocations: ['United States (AWS us-east-1 / Bedrock)'],
      serviceCommencementDate: '2026-08-01',
      contractExpiryDate: '2027-08-01',
      renewalNoticePeriodDays: 30,
      exitStrategyDocumented: true,
      exitTransitionPeriodDays: 30,
      alternativeSupplierAvailable: true,
      alternativeSupplierNames: ['OpenAI Azure', 'Google Vertex AI Gemini'],
      substitutabilityRating: 'COMMODITY_DROP_IN'
    },
    technologyAndData: {
      systemsAndApplicationsAccessed: ['Anthropic Enterprise API via AWS Bedrock Private VPC'],
      dataClassificationsProcessed: ['CONFIDENTIAL_IP', 'INTERNAL_BUSINESS'],
      personalDataInvolvement: false,
      specialCategoryOrSensitiveData: false,
      hostingEnvironment: 'AWS',
      privilegedAccessGranted: false,
      networkConnectivityType: 'PUBLIC_INTERNET_TLS13',
      apiIntegrationsActive: ['Anthropic Messages API'],
      primaryStorageLocations: ['United States (AWS Bedrock / Anthropic)'],
      crossBorderTransfers: true,
      crossBorderTransferMechanisms: ['SCC_2021_914'],
      directSubprocessors: ['Amazon Web Services (AWS)', 'Google Cloud Platform (GCP)'],
      dataRetentionPeriod: 'Zero Data Retention (ZDR) enforced',
      dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE'
    },
    assuranceProfile: {
      certifications: [
        {
          standard: 'ISO_27001_2022',
          certificateNumber: 'A-LIGN-IS-2025',
          accreditationBody: 'A-LIGN Compliance',
          scopeSummary: 'Anthropic API and Model Training Infrastructure',
          validFrom: '2025-01-01',
          validTo: '2028-01-01',
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'c1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
          isScopeMatchingServices: true
        }
      ],
      socReports: [
        {
          reportType: 'SOC_2_TYPE_2',
          trustServicesCriteria: ['SECURITY', 'CONFIDENTIALITY', 'PRIVACY'],
          auditingFirm: 'A-LIGN Compliance',
          reportingPeriodStart: '2025-01-01',
          reportingPeriodEnd: '2025-12-31',
          auditorOpinion: 'UNQUALIFIED_CLEAN',
          csoUsIdentified: ['CSOU-01: Customer must protect API keys and transmit data over TLS 1.3 only'],
          csoUsImplementedByUs: true,
          bridgeLetterObtained: true,
          assuranceTier: 'CONTROL_OPERATING_EFFECTIVENESS_TESTED',
          sha256Seal: 'd1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
        }
      ],
      penetrationTesting: {
        lastTestDate: '2025-12-15',
        nextDueTestDate: '2026-12-15',
        testedByThirdParty: true,
        testingFirm: 'Bishop Fox',
        remediationOfCriticalFindingsConfirmed: true
      },
      bcpDrTesting: {
        lastExerciseDate: '2026-01-10',
        rtoCommittedHours: 4,
        rpoCommittedHours: 0,
        testOutcome: 'PASS'
      },
      securityPoliciesReceived: true,
      privacyNoticeCompliant: true,
      incidentResponseSlaHours: 2
    },
    latestRiskSnapshot: {
      snapshotId: 'SNP-VND-007-2026Q3',
      tenantId: 'tenant-acme-corp',
      vendorId: 'vnd-anthropic-007',
      methodologyVersion: '2026.1-TPRM-Enterprise',
      matrixDimension: '5X5',
      calculatedAt: '2026-09-22T00:00:00Z',
      assessedBy: 'Chief AI Architect',
      factorBreakdown: [
        { factorId: 'F1', factorName: 'Information Security & Cloud Hardening', factorCategory: 'INFOSEC', weight: 0.15, rawScore: 4, assessedRationale: 'SOC 2 Type II certified and AWS Bedrock private networking.', groundingEvidenceIds: [] },
        { factorId: 'F2', factorName: 'Customer PII & Confidential Data Storage', factorCategory: 'PRIVACY_PII', weight: 0.15, rawScore: 2, assessedRationale: 'Zero Data Retention policy; PII sanitization pre-filter active.', groundingEvidenceIds: [] },
        { factorId: 'F3', factorName: 'Regulatory Compliance (MAS / DPDP)', factorCategory: 'REGULATORY', weight: 0.10, rawScore: 3, assessedRationale: 'ISO 42001 AI Risk Management and MAS FEAT AI Governance principles.', groundingEvidenceIds: [] },
        { factorId: 'F4', factorName: 'Operational Resilience & Multi-AZ DR', factorCategory: 'RESILIENCE_BCP', weight: 0.10, rawScore: 3, assessedRationale: 'Multi-region AWS Bedrock failover to GCP Vertex.', groundingEvidenceIds: [] },
        { factorId: 'F5', factorName: 'Financial Viability & Market Standing', factorCategory: 'FINANCIAL_VIABILITY', weight: 0.05, rawScore: 2, assessedRationale: 'Well-capitalized frontier AI lab.', groundingEvidenceIds: [] },
        { factorId: 'F6', factorName: 'Architecture & Interoperability', factorCategory: 'ARCHITECTURE_TECH', weight: 0.05, rawScore: 4, assessedRationale: 'Stateless JSON REST API.', groundingEvidenceIds: [] },
        { factorId: 'F7', factorName: 'Privileged Access & Key Management', factorCategory: 'PRIVILEGE_ACCESS', weight: 0.10, rawScore: 2, assessedRationale: 'No backend database access; stateless inference API.', groundingEvidenceIds: [] },
        { factorId: 'F8', factorName: 'Jurisdiction & Cross-Border Sovereign Data', factorCategory: 'GEOGRAPHIC_JURISDICTION', weight: 0.05, rawScore: 3, assessedRationale: 'US inference processing under Standard Contractual Clauses.', groundingEvidenceIds: [] },
        { factorId: 'F9', factorName: 'Fourth-Party Subprocessor Exposure', factorCategory: 'FOURTH_PARTY_SUPPLY_CHAIN', weight: 0.05, rawScore: 4, assessedRationale: 'Relies on AWS & GCP GPU compute infrastructure.', groundingEvidenceIds: [] },
        { factorId: 'F10', factorName: 'Single Point of Failure Concentration', factorCategory: 'CONCENTRATION', weight: 0.05, rawScore: 2, assessedRationale: 'Interchangeable with OpenAI and Google Gemini.', groundingEvidenceIds: [] },
        { factorId: 'F11', factorName: 'AI Model Safety & Data Isolation', factorCategory: 'AI_GOVERNANCE', weight: 0.05, rawScore: 2, assessedRationale: 'Formal contractual guarantee: customer data never used for model training.', groundingEvidenceIds: [] },
        { factorId: 'F12', factorName: 'Business Criticality to Core Operations', factorCategory: 'BUSINESS_CRITICALITY', weight: 0.10, rawScore: 3, assessedRationale: 'Tier-2 Major Operational tool for productivity.', groundingEvidenceIds: [] }
      ],
      inherentLikelihood: 3,
      inherentImpact: 3,
      inherentRiskScore: 9,
      inherentRiskLevel: 'MEDIUM',
      controlDesignScore: 94,
      controlOperatingScore: 92,
      evidenceFreshnessScore: 100,
      combinedControlEffectiveness: 94,
      residualLikelihood: 1,
      residualImpact: 2,
      residualRiskScore: 2,
      residualRiskLevel: 'LOW',
      isResidualHigherThanInherent: false,
      riskAppetiteThreshold: 8,
      isOutsideAppetite: false,
      confidenceScorePercent: 95,
      evidenceCompletenessPercent: 100,
      scoringExplanation: 'Inherent risk score is 9 (Medium) due to third-party LLM processing of enterprise unstructured text. Zero Data Retention (ZDR), AWS Bedrock PrivateLink, and ISO 42001 governance mitigate residual risk score to 2 (Low).',
      topRiskContributors: ['Prompt Injection Defense', 'Zero Data Retention Verification', 'Cross-Border US Inference']
    },
    activeAssessments: [],
    activeContracts: [],
    evidenceItems: [],
    monitoringSignals: [],
    findings: [],
    regulatoryMappings: MASTER_TPRM_REGULATORY_MAPPINGS,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z',
    version: 3
  }
];

// ============================================================================
// 6. 17-STAGE PERMITTED STATE TRANSITION MATRIX
// ============================================================================

export const PERMITTED_LIFECYCLE_TRANSITIONS: Record<VendorLifecycleStatus, VendorLifecycleStatus[]> = {
  VENDOR_DISCOVERY: ['BUSINESS_SPONSORSHIP', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  BUSINESS_SPONSORSHIP: ['VENDOR_REGISTRATION', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  VENDOR_REGISTRATION: ['INHERENT_RISK_CLASSIFICATION', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  INHERENT_RISK_CLASSIFICATION: ['RISK_BASED_DUE_DILIGENCE', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  RISK_BASED_DUE_DILIGENCE: ['EVIDENCE_COLLECTION_VERIFICATION', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  EVIDENCE_COLLECTION_VERIFICATION: ['CONTROL_ASSESSMENT', 'RISK_BASED_DUE_DILIGENCE', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  CONTROL_ASSESSMENT: ['RISK_EVALUATION', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  RISK_EVALUATION: ['APPROVAL_OR_CONDITIONAL_APPROVAL', 'REMEDIATION_AND_CAPA', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  APPROVAL_OR_CONDITIONAL_APPROVAL: ['CONTRACT_SERVICE_ACTIVATION', 'REMEDIATION_AND_CAPA', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  CONTRACT_SERVICE_ACTIVATION: ['CONTINUOUS_MONITORING', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  CONTINUOUS_MONITORING: ['RISK_EVENT_DETECTION', 'RISK_REASSESSMENT', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  RISK_EVENT_DETECTION: ['RISK_REASSESSMENT', 'REMEDIATION_AND_CAPA', 'CONTINUOUS_MONITORING'],
  RISK_REASSESSMENT: ['REMEDIATION_AND_CAPA', 'APPROVAL_OR_CONDITIONAL_APPROVAL', 'CONTINUOUS_MONITORING', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  REMEDIATION_AND_CAPA: ['INDEPENDENT_RETESTING', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  INDEPENDENT_RETESTING: ['RESIDUAL_RISK_EVALUATION', 'REMEDIATION_AND_CAPA'],
  RESIDUAL_RISK_EVALUATION: ['CONTINUOUS_MONITORING', 'APPROVAL_OR_CONDITIONAL_APPROVAL', 'RENEWAL_SUSPENSION_OFFBOARDING'],
  RENEWAL_SUSPENSION_OFFBOARDING: ['VENDOR_DISCOVERY', 'CONTINUOUS_MONITORING']
};
