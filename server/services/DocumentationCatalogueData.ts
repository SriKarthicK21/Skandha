// ============================================================================
// SKANDA ENTERPRISE GRC: DOCUMENTATION CATALOGUE & TEMPLATE INTELLIGENCE
// Path: server/services/DocumentationCatalogueData.ts
//
// Fulfills Phase 47: Enterprise Documentation Catalogue & Template Intelligence
// Supporting 10 Document Hierarchy Levels:
// A. Policies (POLICY)
// B. Procedures (PROCEDURE)
// C. Standards (STANDARD)
// D. Standard Operating Procedures (SOP)
// E. Guidelines (GUIDELINE)
// F. Work Instructions (WORK_INSTRUCTION)
// G. Forms and Checklists (FORM_CHECKLIST)
// H. Registers and Logs (REGISTER_LOG)
// I. Implementation Plans (IMPLEMENTATION_PLAN)
// J. Management Review Packs (MANAGEMENT_REVIEW_PACK)
//
// Supporting 3 Generation Modes:
// - Mode A: Blank Template with completion guidance and explicit placeholders
// - Mode B: Completed Model Sample with substantive illustrative content
// - Mode C: Tailor for Organization merging verified context without fact invention
// ============================================================================

import {
  DocumentHierarchyLevel,
  EnterpriseConsultingDocument,
  DocumentationContextQuestionnaire,
  DocumentControlMetadata,
  StatementProvenanceType
} from './EnterpriseDocumentationEngine.js';
import { DocumentType } from './PolicyGovernanceEngine.js';

// ============================================================================
// 1. DATA CONTRACTS & INTERFACES
// ============================================================================

export type CatalogueDomain =
  | 'INFORMATION_SECURITY'
  | 'PRIVACY_AND_DATA_PROTECTION'
  | 'ENTERPRISE_RISK'
  | 'COMPLIANCE_AND_AUDIT'
  | 'TECHNOLOGY_AND_ENGINEERING'
  | 'OPERATIONS'
  | 'THIRD_PARTY_RISK';

export type MappingProvenance =
  | 'VERIFIED_SOURCE_MAPPING'
  | 'SOURCE_DERIVED_MAPPING'
  | 'HUMAN_APPROVED_MAPPING'
  | 'PROPOSED_MAPPING'
  | 'UNVERIFIED_MAPPING';

export interface FrameworkRequirementMapping {
  frameworkCode: string; // e.g. 'ISO_27001_2022', 'SOC_2_TYPE_2', 'NIST_CSF_2_0', 'DPDP_ACT_2023', 'GDPR', 'MAS_TRM_2021'
  clauseOrControl: string; // e.g. 'A.5.15 Access Control', 'Clause 9.3 Management Review'
  provenance: MappingProvenance;
  distinctionType: 'SOURCE_REQUIREMENT' | 'SKANDA_INTERPRETATION' | 'RECOMMENDED_PRACTICE' | 'ORGANIZATIONAL_DECISION';
  evidenceTypeRequired: string;
  assuranceLimitationNotice: string;
}

export interface CatalogueTemplateMetadata {
  id: string; // Stable ID, e.g. 'TMPL-POL-SEC-001'
  title: string;
  documentType: DocumentType;
  hierarchyLevel: DocumentHierarchyLevel;
  version: string;
  domain: CatalogueDomain;
  category: string;
  intendedPurpose: string;
  applicabilityConditions: string[];
  requiredOrganizationalInputs: string[];
  optionalOrganizationalInputs: string[];
  requiredSections: string[];
  conditionalSections: Array<{ section: string; condition: string }>;
  relatedFrameworks: FrameworkRequirementMapping[];
  relatedControlsAndEvidenceTypes: Array<{ controlCode: string; evidenceType: string }>;
  ownerAndReviewerRoles: {
    defaultOwnerRole: string;
    defaultReviewerRole: string;
    approverRole: string;
  };
  qualityRules: string[];
  outputFormatSupport: Array<'DOCX' | 'HTML' | 'MARKDOWN'>;
  versionHistory: Array<{ version: string; date: string; summary: string }>;
  reviewAndRetirementStatus: 'ACTIVE' | 'UNDER_REVIEW' | 'DEPRECATED' | 'RETIRED';
  contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE' | 'SCAFFOLD_TEMPLATE_AVAILABLE';
}

export interface CatalogueFilterParams {
  search?: string;
  documentType?: DocumentType | 'ALL';
  domain?: CatalogueDomain | 'ALL';
  framework?: string;
  contentDepth?: 'ALL' | 'SUBSTANTIVE_MODEL_AVAILABLE' | 'SCAFFOLD_TEMPLATE_AVAILABLE';
  status?: string;
}

// ============================================================================
// 2. INITIAL PRIORITY CATALOGUE (56 ENTRIES)
// ============================================================================

export const ENTERPRISE_CATALOGUE_REGISTRY: CatalogueTemplateMetadata[] = [
  // --------------------------------------------------------------------------
  // PART 1: INFORMATION SECURITY POLICIES (18 ENTRIES)
  // --------------------------------------------------------------------------
  {
    id: 'TMPL-POL-SEC-001',
    title: 'Information Security Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.1',
    domain: 'INFORMATION_SECURITY',
    category: 'Governance & Management Direction',
    intendedPurpose: 'Establish foundational management commitment, accountability structure, and mandatory baseline security directives across the enterprise.',
    applicabilityConditions: ['All operating legal entities', 'All personnel and contractors', 'All corporate systems and cloud environments'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'organizationProfile.headquartersLocation', 'keyRolesAndDelegations.ismsOwnerOrCisoRole', 'approvalThresholdsAndRules.policyApprovalAuthority'],
    optionalOrganizationalInputs: ['organizationProfile.tradeName', 'scopeDefinition.excludedEntitiesOrFunctions'],
    requiredSections: ['1. Purpose', '2. Scope and Applicability', '3. Terms and Definitions', '4. Policy Objectives', '5. Governance and Accountability', '6. Mandatory Policy Requirements', '7. Risk Ownership and Exceptions', '8. Compliance Monitoring and Enforcement', '9. Review and Change Control'],
    conditionalSections: [{ section: 'Financial Cloud Safeguards', condition: 'When operating in regulated financial sector' }],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 5.1, 5.2, 5.3, Annex A.5.1',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Approved policy document, board minutes, distribution acknowledgement logs',
        assuranceLimitationNotice: 'An approved policy establishes mandatory intent; it does not constitute proof of operational compliance.'
      },
      {
        frameworkCode: 'SOC_2_TYPE_2',
        clauseOrControl: 'CC1.1, CC1.2, CC2.1',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Management sign-off and annual policy review records',
        assuranceLimitationNotice: 'Existence of governance documentation does not prove absence of control deviations.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.1', evidenceType: 'Policy Approval Record & Distribution Log' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Chief Information Security Officer (CISO)', defaultReviewerRole: 'Internal Audit & GRC Lead', approverRole: 'Board of Directors / Chief Executive Officer' },
    qualityRules: ['Mandatory single document owner', 'Zero unresolved placeholders in published state', 'Explicit assurance limitations declared'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.1', date: '2026-10-11', summary: 'Added explicit assurance limitations and OpenXML compliance.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-002',
    title: 'Access Control Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Access Management & Security Architecture',
    intendedPurpose: 'Define mandatory access control rules, principle of least privilege, dual authorization for sensitive roles, and mandatory multi-factor authentication.',
    applicabilityConditions: ['All digital systems, databases, cloud platforms, and physical facilities hosting data assets'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.identityProvider', 'keyRolesAndDelegations.ismsOwnerOrCisoRole'],
    optionalOrganizationalInputs: ['operatingModel.cloudInfrastructure'],
    requiredSections: ['1. Purpose', '2. Scope', '3. Definitions', '4. Principles of Access Control', '5. Authentication Directives', '6. Privileged Access Directives', '7. Exceptions', '8. Enforcement'],
    conditionalSections: [{ section: 'Biometric Controls', condition: 'When biometric physical access control systems are deployed' }],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.15, A.5.18, A.8.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Access control policy approval, MFA enforcement reports',
        assuranceLimitationNotice: 'Policy directives require automated IAM enforcement logs for verification.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.15', evidenceType: 'Approved Access Control Policy' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Identity & Access Management', defaultReviewerRole: 'Security Architecture Lead', approverRole: 'Chief Information Security Officer (CISO)' },
    qualityRules: ['Must prohibit shared accounts except break-glass', 'Must define MFA as non-negotiable for external/privileged access'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Initial enterprise baseline.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-003',
    title: 'Identity and Access Management Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Identity & Access Governance',
    intendedPurpose: 'Govern lifecycle of digital identities, credential issuance, authoritative directory integration, and federated identity protocols.',
    applicabilityConditions: ['All employee, contractor, system, and service identities within corporate directory'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.identityProvider', 'operatingModel.hrisPlatform'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Identity Lifecycle Mandates', '4. Directory Authority', '5. Service Accounts', '6. Account Deprovisioning', '7. Audit'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.16, A.5.17',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'SSO/IdP architecture documentation, lifecycle rule configuration',
        assuranceLimitationNotice: 'Automated identity sync requires continuous SCIM webhook logs for operational assurance.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.16', evidenceType: 'IdP Master Configuration Record' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Infrastructure & IAM', defaultReviewerRole: 'Security Reviewer', approverRole: 'CISO' },
    qualityRules: ['Must bind authoritative HRIS as single source of truth for workforce identity'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline policy creation.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-004',
    title: 'Asset Management Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Asset Governance & Custody',
    intendedPurpose: 'Mandate comprehensive inventorying, ownership assignment, classification, and acceptable disposal of all information assets.',
    applicabilityConditions: ['All hardware, virtual instances, serverless functions, databases, and digital information assets'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.cloudInfrastructure'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Asset Inventory Directives', '4. Asset Ownership Rules', '5. Acceptable Custody', '6. Asset Return & Disposal'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.9, A.5.10, A.5.14',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Active CMDB / Asset inventory export with named asset owners',
        assuranceLimitationNotice: 'An asset list does not prove physical possession without periodic reconciliation audits.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.9', evidenceType: 'Approved CMDB Register & Asset Policy' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of IT Assets & Operations', defaultReviewerRole: 'Internal Audit', approverRole: 'CISO' },
    qualityRules: ['Every asset must have a designated human or role owner'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline asset policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-005',
    title: 'Information Classification and Handling Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Data Governance & Protection',
    intendedPurpose: 'Establish a 4-tier data classification schema (Public, Internal, Confidential, Restricted) and mandatory handling, encryption, and transmission controls.',
    applicabilityConditions: ['All data created, processed, stored, or transmitted by enterprise applications and staff'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Classification Schema', '4. Labeling Directives', '5. Handling & Storage Rules', '6. Transmission Encryption', '7. Declassification'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.12, A.5.13',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Data classification schema documentation, automated labeling rules',
        assuranceLimitationNotice: 'Classification tags indicate assigned sensitivity, not actual data protection efficacy.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.12', evidenceType: 'Approved Classification Standard' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Chief Data Officer / CISO', defaultReviewerRole: 'Legal & Compliance', approverRole: 'Executive Risk Committee' },
    qualityRules: ['Schema must clearly define Restricted data including customer PII and cryptographic keys'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Initial classification framework.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-006',
    title: 'Acceptable Use Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Personnel & Workplace Security',
    intendedPurpose: 'Govern permissible and prohibited use of organizational computing resources, networks, email, internet, and communication tools.',
    applicabilityConditions: ['All personnel, third-party contractors, and vendors utilizing corporate endpoints or credentials'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Permitted Use', '4. Prohibited Activities', '5. Privacy Expectations & Monitoring', '6. Disciplinary Consequences'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.10, A.6.2, A.6.4',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Signed acceptable use agreements, electronic onboarding acknowledgements',
        assuranceLimitationNotice: 'Signed acknowledgement does not prevent insider malfeasance without technical telemetry.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.10', evidenceType: 'Acceptable Use Acknowledgement Register' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Chief Human Resources Officer & CISO', defaultReviewerRole: 'Legal Counsel', approverRole: 'CEO' },
    qualityRules: ['Must explicitly outline employer monitoring rights under applicable jurisdictional laws'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Enterprise acceptable use baseline.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-007',
    title: 'Cryptography and Key Management Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Cryptographic Architecture',
    intendedPurpose: 'Mandate approved encryption algorithms (AES-256, RSA-3072+, TLS 1.3), key generation standards, rotation cadences, and secure destruction.',
    applicabilityConditions: ['All systems encrypting data at rest, data in transit, and digital signature engines'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.cloudInfrastructure'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Approved Cryptographic Algorithms', '4. Key Lifecycle Management', '5. Key Custodianship & Separation', '6. Compromise Response'],
    conditionalSections: [{ section: 'Post-Quantum Preparedness', condition: 'When handling cryptographic data with > 5 year retention' }],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.24',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'KMS rotation configuration, TLS cipher suite audit reports',
        assuranceLimitationNotice: 'Declared algorithm compliance does not guarantee correct software implementation.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.24', evidenceType: 'Cloud KMS Key Rotation Ledger' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Security Engineering', defaultReviewerRole: 'Cryptographic Architect', approverRole: 'CISO' },
    qualityRules: ['Prohibit legacy algorithms (DES, 3DES, MD5, SHA-1, RC4)', 'Mandate annual automated key rotation'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline cryptographic policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-008',
    title: 'Secure Configuration Policy',
    documentType: 'STANDARD',
    hierarchyLevel: 'LEVEL_3_TECHNICAL_STANDARD',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Technical Controls & Hardening',
    intendedPurpose: 'Mandate secure configuration baselines (CIS Benchmarks, DISA STIGs) across operating systems, cloud tenancies, containers, and network gear.',
    applicabilityConditions: ['All compute, container, network, and cloud resources'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.cloudInfrastructure'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Baseline Standards Mandate', '4. Configuration Auditing', '5. Drift Detection & Remediation', '6. Exemption Approvals'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.9',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Golden image templates, CSPM configuration compliance reports',
        assuranceLimitationNotice: 'Baseline checklists require continuous CSPM scan telemetry for ongoing assurance.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.9', evidenceType: 'CSPM Hardening Benchmark Report' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Principal Cloud Architect', defaultReviewerRole: 'DevSecOps Lead', approverRole: 'CISO' },
    qualityRules: ['Prohibit default vendor passwords and unencrypted protocols'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline configuration policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-009',
    title: 'Vulnerability Management Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Threat & Vulnerability Management',
    intendedPurpose: 'Establish mandatory cadences for vulnerability scanning, penetration testing, vulnerability severity rating (CVSS v3.1/v4.0), and remediation SLAs.',
    applicabilityConditions: ['All production, staging, development, and third-party SaaS integration points'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'serviceLevelCommitments.standardAccessDays'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Scanning Mandates', '4. CVSS Rating Thresholds', '5. Remediation SLAs by Severity', '6. Zero-Day Protocols', '7. Exceptions'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.8',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'ORGANIZATIONAL_DECISION',
        evidenceTypeRequired: 'Scanner scheduling logs, vulnerability remediation dashboards',
        assuranceLimitationNotice: 'Zero vulnerabilities on scan date does not preclude newly disclosed zero-day exploits; remediation SLOs represent organization-approved targets.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.8', evidenceType: 'Vulnerability Management SLO Report' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Vulnerability Management Lead', defaultReviewerRole: 'Security Reviewer', approverRole: 'CISO' },
    qualityRules: ['Remediation targets must be risk-adjusted and formally approved by CISO', 'Vulnerability waivers must specify compensating controls and expiry date'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline vulnerability management policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-010',
    title: 'Logging and Monitoring Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Telemetry & Detection',
    intendedPurpose: 'Mandate centralized collection, time synchronization (NTP), immutable storage, and SIEM monitoring of security audit logs.',
    applicabilityConditions: ['All servers, cloud control planes, identity systems, firewalls, and production application workloads'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.siemAndLoggingPlatform', 'evidenceAndRecordsRetention.accessLogRetentionDays'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Mandatory Log Event Types', '4. Time Synchronization', '5. Tamper-Proof Storage & WORM', '6. Retention Directives', '7. Alerting & SIEM Rules'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.15, A.8.16, A.8.17',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'SIEM ingestion metrics, NTP audit configuration, immutable bucket retention settings',
        assuranceLimitationNotice: 'Log generation does not prove threat detection without validated correlation rules.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.15', evidenceType: 'SIEM Log Ingestion Pipeline Audit' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'SOC Lead', defaultReviewerRole: 'Security Engineering Lead', approverRole: 'CISO' },
    qualityRules: ['Logs must be retained for minimum 365 days', 'Log tampering protection must be enabled'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline logging policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-011',
    title: 'Incident Management Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Incident Response Governance',
    intendedPurpose: 'Establish mandatory incident reporting, severity classification (SEV-1 to SEV-4), response team structure (CSIRT), and statutory breach notification deadlines.',
    applicabilityConditions: ['All enterprise operations, cloud environments, and third-party processing touchpoints'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.ismsOwnerOrCisoRole', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Incident Definitions & Severity Levels', '4. CSIRT Roles & Authority', '5. Statutory Notification Deadlines', '6. Evidence Preservation', '7. Post-Incident Review'],
    conditionalSections: [{ section: 'Financial Regulator Notification', condition: 'When operating in MAS/RBI regulated jurisdictions' }],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.24, A.5.25, A.5.26, A.5.27',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Incident register, severity classification guide, CSIRT charter',
        assuranceLimitationNotice: 'Policy document does not guarantee response speed without tabletop exercise verification.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.24', evidenceType: 'Incident Response Policy & CSIRT Charter' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Incident Response & SOC', defaultReviewerRole: 'Legal & Regulatory Counsel', approverRole: 'CISO & General Counsel' },
    qualityRules: ['Must include CERT-In 6-hour, GDPR 72-hour, and MAS 1-hour notification matrices where applicable'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline incident management policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-012',
    title: 'Backup and Recovery Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Resilience & Business Continuity',
    intendedPurpose: 'Define mandatory backup frequencies, immutable snapshots, offsite replication, encryption, and quarterly restore verification testing.',
    applicabilityConditions: ['All critical databases, virtual machines, persistent volumes, and configuration repositories'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.cloudInfrastructure'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Backup Frequencies & Retention', '4. Immutable Backups against Ransomware', '5. Encryption Directives', '6. Mandatory Restoration Drills'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.13',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Cloud backup policy schedule, immutable vault lock configuration',
        assuranceLimitationNotice: 'Backup presence does not ensure recoverability without verified restore drill evidence.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.13', evidenceType: 'Cloud Backup Schedule Configuration' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Site Reliability Engineering', defaultReviewerRole: 'Business Continuity Lead', approverRole: 'CISO' },
    qualityRules: ['Must specify RPO and RTO for critical workloads', 'Must require immutable backup vault'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline backup policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-013',
    title: 'Business Continuity Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Resilience & Continuity',
    intendedPurpose: 'Establish organizational commitment to resilience, Business Impact Analysis (BIA) execution, disaster recovery invocation thresholds, and crisis communication.',
    applicabilityConditions: ['All corporate operations, customer-facing SaaS services, and tier-1 dependencies'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.executiveSponsorRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. BIA Directives', '4. Crisis Management Team (CMT)', '5. Invocation Thresholds', '6. Annual Exercise Mandates'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.29, A.5.30',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'BIA reports, CMT structure charter, annual exercise schedule',
        assuranceLimitationNotice: 'Continuity policies require post-exercise corrective action reports for validation.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.29', evidenceType: 'Approved Business Continuity Policy' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Enterprise Resilience', defaultReviewerRole: 'Risk Committee', approverRole: 'CEO & Board of Directors' },
    qualityRules: ['Annual live DR drill is non-negotiable for Tier-1 services'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline business continuity policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-014',
    title: 'Supplier Security Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Supply Chain & Vendor Risk',
    intendedPurpose: 'Govern vendor lifecycle risk, pre-contract security assessments, mandatory security contractual clauses, ongoing monitoring, and exit handback.',
    applicabilityConditions: ['All third-party vendors, SaaS tools, outsourced service providers, and cloud hosting partners'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.ismsOwnerOrCisoRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Vendor Risk Tiers', '4. Pre-Contract Due Diligence', '5. Mandatory Contractual Clauses', '6. Continuous Monitoring', '7. Termination & De-Provisioning'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.19, A.5.20, A.5.21, A.5.22',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Vendor risk assessment reports, executed security addenda',
        assuranceLimitationNotice: 'Vendor questionnaires reflect self-reported compliance without independent SOC 2 / ISO audit verification.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.19', evidenceType: 'Supplier Risk Management Policy' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Third-Party Risk Management', defaultReviewerRole: 'Procurement & Legal', approverRole: 'CISO' },
    qualityRules: ['Mandate SOC 2 Type II or ISO 27001 certificate for Tier-1 SaaS vendors'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline supplier security policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-015',
    title: 'Secure Development Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Software Security & SDLC',
    intendedPurpose: 'Establish mandatory DevSecOps practices: threat modeling, SAST/DAST/SCA tooling, peer code review, secrets management, and separation of environments.',
    applicabilityConditions: ['All internally engineered software, APIs, mobile applications, and infrastructure-as-code'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.codeRepositories'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Secure SDLC Principles', '4. Security Testing Gates in CI/CD', '5. Open Source & SCA Management', '6. Environment Separation', '7. Secrets Hygiene'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.25, A.8.26, A.8.27, A.8.28, A.8.31',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'CI/CD pipeline configuration, SAST gating rules, pull request approval ledgers',
        assuranceLimitationNotice: 'Automated SAST scans do not detect business logic security flaws.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.25', evidenceType: 'Secure Development Policy & Pipeline Baseline' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of Application Security', defaultReviewerRole: 'VP of Engineering', approverRole: 'CISO' },
    qualityRules: ['Mandatory peer code review and branch protection on all release branches'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline secure engineering policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-016',
    title: 'Change Management Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'IT Service & Change Governance',
    intendedPurpose: 'Ensure all changes to production infrastructure and applications are logged, risk-assessed, tested, authorized by CAB, and reversable via rollback plans.',
    applicabilityConditions: ['All production environments, cloud tenancies, database schemas, and networking fabrics'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.ticketingAndItsmSystem'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Change Categorization (Standard, Normal, Emergency)', '4. Change Advisory Board (CAB)', '5. Rollback Plans & Testing', '6. Post-Implementation Review'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.32',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'CAB meeting records, approved Jira change tickets, automated change deployment logs',
        assuranceLimitationNotice: 'Approved tickets do not verify that code deployed matched what was tested without commit-hash audit.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.32', evidenceType: 'Change Management CAB Charter' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of IT Operations & Service Management', defaultReviewerRole: 'Quality & Release Lead', approverRole: 'CISO & VP Engineering' },
    qualityRules: ['Every production change must have an automated or documented rollback plan'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline change policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-017',
    title: 'Remote Working Policy',
    documentType: 'GUIDELINE',
    hierarchyLevel: 'LEVEL_5_GUIDELINE',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Endpoint & Distributed Workforce',
    intendedPurpose: 'Establish security requirements for remote, hybrid, and traveling staff: MDM-enforced endpoints, disk encryption, VPN/ZTNA, clean desk, and physical security.',
    applicabilityConditions: ['All employees and contractors accessing enterprise resources outside corporate physical perimeters'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Managed Device Mandate', '4. Secure Connectivity (ZTNA/VPN)', '5. Physical & Visual Privacy', '6. Loss & Theft Reporting'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.6.7',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'MDM compliance dashboard, ZTNA connection telemetry',
        assuranceLimitationNotice: 'MDM compliance does not verify physical perimeter security in home environments.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.6.7', evidenceType: 'Remote Working Security Directive' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Head of IT Endpoints & Infrastructure', defaultReviewerRole: 'HR Lead', approverRole: 'CISO' },
    qualityRules: ['BYOD prohibited for accessing Tier-1 confidential data unless using managed VDI'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline remote working policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-POL-SEC-018',
    title: 'Data Retention and Disposal Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Data Governance & Compliance',
    intendedPurpose: 'Establish statutory retention periods across records (tax, audit, telemetry, personal data) and mandate secure cryptographic/physical purging at end of life.',
    applicabilityConditions: ['All databases, backups, physical archives, and cloud storage volumes'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'evidenceAndRecordsRetention.defaultRecordRetentionYears', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Retention Schedules by Data Category', '4. Legal Hold Overrides', '5. Secure Disposal Standards (NIST SP 800-88)', '6. Disposal Certification'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.33, A.8.10',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Retention schedule matrix, automated S3 lifecycle rules, secure wipe certificates',
        assuranceLimitationNotice: 'Retention policies require cryptographic deletion logs to verify erasure.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.33', evidenceType: 'Data Retention Schedule Master Matrix' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'General Counsel & Data Protection Officer', defaultReviewerRole: 'CISO', approverRole: 'Board Audit Committee' },
    qualityRules: ['Must include explicit legal hold mechanism that suspends automated deletion during investigations'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline retention policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },

  // --------------------------------------------------------------------------
  // PART 2: OPERATIONAL PROCEDURES (20 ENTRIES)
  // --------------------------------------------------------------------------
  {
    id: 'TMPL-PROC-IAM-001',
    title: 'User Access Provisioning and Modification Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.1',
    domain: 'INFORMATION_SECURITY',
    category: 'Identity & Access Management',
    intendedPurpose: 'Provide sequential 9-gate operational procedure for requesting, approving, provisioning, and independently verifying user access entitlements.',
    applicabilityConditions: ['All user access requests for corporate directories, cloud workloads, and production applications'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.identityProvider', 'operatingModel.ticketingAndItsmSystem', 'approvalThresholdsAndRules.standardUserAccessApprover', 'serviceLevelCommitments.standardAccessDays'],
    optionalOrganizationalInputs: ['serviceLevelCommitments.privilegedAccessHours'],
    requiredSections: ['1. Purpose', '2. Scope', '3. Terms & Definitions', '4. Prerequisites', '5. Roles & Boundaries', '6. Inputs & Required Records', '7. Procedure Steps & Operational Gates', '8. Decision Rules & Exceptions', '9. Service Levels', '10. Evidence & Retention', '11. Monitoring', '12. Failure Handling', '13. Related Docs', '14. Change Control'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.15, A.5.16, A.5.18',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Jira ticket audit trail, Okta automated audit event logs, independent verification timestamp',
        assuranceLimitationNotice: 'Operational procedure verification requires sampling live provisioning tickets during internal audit.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.18', evidenceType: 'Access Provisioning Ticket & Verification Record' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Lead IAM Operations Engineer', defaultReviewerRole: 'Security Reviewer', approverRole: 'CISO / Head of Security Operations' },
    qualityRules: ['Every step must have Exit Criteria and Failure Mode', 'RACI must have single accountability per row', 'Landscape orientation for procedure table'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.1', date: '2026-10-11', summary: 'Added 6-column landscape layout and rigorous quality gates.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-IAM-002',
    title: 'User Access Revocation Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Identity & Access Management',
    intendedPurpose: 'Define operational steps and SLAs for immediate deprovisioning of all logical and physical access upon employee or contractor offboarding or termination.',
    applicabilityConditions: ['Voluntary resignations, involuntary terminations, and contractor contract conclusions'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.identityProvider', 'operatingModel.hrisPlatform'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Trigger & Prerequisites', '4. Roles & Boundaries', '5. Sequential Operational Gates', '6. Decision Rules (Friendly vs Hostile Termination)', '7. SLAs', '8. Evidence Retention'],
    conditionalSections: [{ section: 'Hostile Termination Protocol', condition: 'Immediate revoking prior to employee exit interview' }],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.16, A.6.5',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'HRIS offboarding timestamp, IdP account suspension log, token revocation event',
        assuranceLimitationNotice: 'Revocation logs confirm directory deactivation; manual SaaS orphaned accounts require discovery testing.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.6.5', evidenceType: 'Deprovisioning Audit Ledger' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'IAM Operations Lead', defaultReviewerRole: 'HR Operations', approverRole: 'CISO' },
    qualityRules: ['Involuntary termination SLA must be <= 15 minutes', 'Must mandate session token invalidation'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline access revocation procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-IAM-003',
    title: 'Periodic Access Review Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Identity & Access Management',
    intendedPurpose: 'Provide end-to-end process for quarterly user access recertification, system owner sign-off, entitlement revocation, and auditor evidence pack generation.',
    applicabilityConditions: ['All privileged roles, critical applications, and quarterly enterprise-wide reviews'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.identityProvider'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Review Cadence & Scope Selection', '4. Reviewer Responsibilities', '5. Campaign Execution Steps', '6. Revocation of Unapproved Access', '7. Evidence Archival'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.18',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Campaign launch records, reviewer sign-off stamps, remediation tickets for revoked access',
        assuranceLimitationNotice: 'Manager approval proves review was conducted; does not prove manager understood technical permissions.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.18', evidenceType: 'Quarterly Access Recertification Pack' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'GRC Lead', defaultReviewerRole: 'System Owners', approverRole: 'CISO' },
    qualityRules: ['Review campaigns must achieve 100% completion before closeout'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline access review procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-IAM-004',
    title: 'Privileged Access Management Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Identity & Access Management',
    intendedPurpose: 'Specify just-in-time (JIT) elevation, dual authorization, PAM vaulting, session recording, and break-glass emergency procedures for domain and cloud admins.',
    applicabilityConditions: ['All cloud root/IAM accounts, domain admins, database superusers, and production bastion hosts'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'approvalThresholdsAndRules.privilegedAccessApprover', 'serviceLevelCommitments.privilegedAccessHours'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Privileged Role Inventory', '4. Just-in-Time Elevation Gates', '5. Session Recording Mandates', '6. Break-Glass Procedure', '7. Retrospective Audits'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'PAM session recordings, dual-authorization approval records, break-glass alarm logs',
        assuranceLimitationNotice: 'PAM logs prove elevation event was recorded; requires secondary log review for command legitimacy.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.2', evidenceType: 'PAM Elevation & Session Audit Log' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Principal Cloud Infrastructure Engineer', defaultReviewerRole: 'SOC Lead', approverRole: 'CISO' },
    qualityRules: ['Standing root or admin privileges prohibited; maximum elevation window 4 hours'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline PAM procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-INC-001',
    title: 'Information Security Incident Management Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Incident Response & SOC Operations',
    intendedPurpose: 'Provide actionable, numbered operational steps for Detect, Triage, Containment, Eradication, Recovery, Evidence Custody, and Post-Incident CAPA.',
    applicabilityConditions: ['All confirmed information security incidents and data breach notifications'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.ticketingAndItsmSystem', 'keyRolesAndDelegations.ismsOwnerOrCisoRole', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Incident Intake & Triage', '4. CSIRT Mobilization', '5. Containment & Forensics Gates', '6. Statutory Regulatory Breach Notifications', '7. Eradication & Recovery', '8. Evidence Chain of Custody', '9. Post-Incident CAPA'],
    conditionalSections: [{ section: 'Ransomware Protocol', condition: 'When extortion or ransomware attack is identified' }],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.24, A.5.25, A.5.26, A.5.28',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Incident timeline log, forensic image hash, post-mortem CAPA report',
        assuranceLimitationNotice: 'Post-mortem report reflects declared findings; forensic completeness depends on preserved volatile memory.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.24', evidenceType: 'Incident Response Timeline & Post-Mortem Pack' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Lead Incident Commander', defaultReviewerRole: 'Legal & Risk Counsel', approverRole: 'CISO' },
    qualityRules: ['Every gate defines Exit Criteria and Evidence Produced', 'Must include chain-of-custody logging'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline incident response operational procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-VULN-001',
    title: 'Vulnerability Assessment and Remediation Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'Threat & Vulnerability Management',
    intendedPurpose: 'Define operational steps for recurring vulnerability scanning, false positive validation, engineering assignment, patch verification, and retesting.',
    applicabilityConditions: ['All operating environments and application endpoints'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.ticketingAndItsmSystem'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Scan Orchestration', '4. Triage & De-duplication', '5. Remediation Assignment & SLAs', '6. Verification & Retesting', '7. Exception Waivers'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.8',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Scan export files, Jira patch tickets with deployment timestamps, re-scan clean verification',
        assuranceLimitationNotice: 'A clean scan proves remediation of known CVEs; does not verify resilience against 0-days.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.8', evidenceType: 'Vulnerability Scan & Retest Ticket Report' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Vulnerability Remediation Engineer', defaultReviewerRole: 'DevSecOps Lead', approverRole: 'CISO' },
    qualityRules: ['Retest must be performed using same tool and parameters as original detection'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline vulnerability assessment procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-PATCH-001',
    title: 'Patch Management Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'OPERATIONS',
    category: 'Infrastructure & System Maintenance',
    intendedPurpose: 'Provide step-by-step workflow for vendor advisory tracking, staging validation, automated rollout rings, and rollback triggers for OS and package patches.',
    applicabilityConditions: ['All servers, container base images, and managed employee endpoints'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.cloudInfrastructure'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Advisory Ingestion', '4. Staging Ring Testing', '5. Production Rollout Rings', '6. Failed Patch Rollback', '7. Patch Compliance Reporting'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.19',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Patch management dashboard, fleet version compliance export',
        assuranceLimitationNotice: 'Patch deployment logs verify package installation, not system behavioral stability.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.19', evidenceType: 'Fleet Patch Compliance Report' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Systems Engineering Lead', defaultReviewerRole: 'Quality Assurance Lead', approverRole: 'Head of Infrastructure' },
    qualityRules: ['Mandate staging deployment for minimum 24 hours prior to broad production release'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline patch management procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-CHG-001',
    title: 'Change Management Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'OPERATIONS',
    category: 'IT Service Management',
    intendedPurpose: 'Govern operational submission of change requests, CAB review, peer testing approval, execution windows, and post-change sign-off.',
    applicabilityConditions: ['All production software releases and infrastructure modifications'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.ticketingAndItsmSystem'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Change Ticket Submission', '4. Risk & Impact Scoring', '5. CAB Review & Approval', '6. Implementation & Backout Execution', '7. PIR Sign-Off'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.32',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Jira Change Request ticket history, CAB meeting notes, production deploy logs',
        assuranceLimitationNotice: 'Closed tickets prove procedure was followed; does not verify absence of operational bugs.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.32', evidenceType: 'Closed Production Change Record' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Change Manager', defaultReviewerRole: 'CAB Chair', approverRole: 'VP of Engineering' },
    qualityRules: ['Change tickets must be approved prior to implementation start time'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline change management procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-BKP-001',
    title: 'Backup Restoration Testing Procedure',
    documentType: 'SOP',
    hierarchyLevel: 'LEVEL_4_SOP',
    version: '1.0',
    domain: 'OPERATIONS',
    category: 'Data Continuity & Disaster Recovery',
    intendedPurpose: 'Define operational steps for executing quarterly restore drills from cold and immutable backups to an isolated sandbox, checking data integrity and timing.',
    applicabilityConditions: ['All production databases and core storage volumes'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.cloudInfrastructure'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Sandbox Isolation Setup', '4. Snapshot Retrieval', '5. Database Restore Execution', '6. Data Consistency & Row-Count Verification', '7. Tear-down & Audit Report'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.13',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Restoration test run logs, checksum verification report, RTO achievement log',
        assuranceLimitationNotice: 'Test in sandbox proves snapshot integrity; does not prove network capacity during full datacenter outage.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.13', evidenceType: 'Quarterly Backup Restore Test Evidence Pack' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Database Reliability Engineer', defaultReviewerRole: 'Security Reviewer', approverRole: 'Head of Infrastructure' },
    qualityRules: ['Must measure and record actual RTO achieved against approved target'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline backup testing procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-BCP-001',
    title: 'Business Continuity Activation Procedure',
    documentType: 'SOP',
    hierarchyLevel: 'LEVEL_4_SOP',
    version: '1.0',
    domain: 'OPERATIONS',
    category: 'Resilience & Crisis Management',
    intendedPurpose: 'Provide actionable operational steps for mobilizing the Crisis Management Team (CMT), assessing disruption severity, activating alternate workflows, and internal/external comms.',
    applicabilityConditions: ['Facility loss, regional power disruption, primary cloud region outage, pandemic event'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.executiveSponsorRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Crisis Declaration Criteria', '4. CMT Assembly & Command Center', '5. Workload Redistribution Gates', '6. Stakeholder Communications', '7. Stand-Down & Debrief'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.29, A.5.30',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Activation meeting minutes, mass-communication dispatch logs, incident debrief record',
        assuranceLimitationNotice: 'Procedure outlines command structure; real crisis execution depends on staff safety and network availability.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.29', evidenceType: 'BCP Activation Drill Report' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Crisis Coordinator', defaultReviewerRole: 'Operations Lead', approverRole: 'Executive Crisis Lead' },
    qualityRules: ['All communication templates must be pre-drafted and legally reviewed'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline BCP activation procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-DR-001',
    title: 'Disaster Recovery Invocation Procedure',
    documentType: 'SOP',
    hierarchyLevel: 'LEVEL_4_SOP',
    version: '1.0',
    domain: 'TECHNOLOGY_AND_ENGINEERING',
    category: 'Technical Resilience & Cloud DR',
    intendedPurpose: 'Define technical runbook steps for DNS failover, secondary cloud region spin-up, read-replica database promotion, smoke testing, and cutover.',
    applicabilityConditions: ['Catastrophic primary cloud region failure or complete infrastructure outage'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.cloudInfrastructure'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Technical Invocation Authority', '4. DNS & Traffic Rerouting', '5. Database Promotion Gates', '6. Worker Fleet Initialization', '7. Health Verification', '8. Fallback Protocols'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.14',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'DNS cutover audit logs, Terraform execution logs, end-to-end synthetic health checks',
        assuranceLimitationNotice: 'Synthetic testing confirms technical plumbing; real disaster involves unpredictable edge-case traffic.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.14', evidenceType: 'Cloud DR Invocation Test Record' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Principal Cloud Architect', defaultReviewerRole: 'Security Reviewer', approverRole: 'VP of Engineering' },
    qualityRules: ['Must include explicit fall-back / fail-back steps once primary region recovers'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline DR procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-TPRM-001',
    title: 'Supplier Due Diligence Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'THIRD_PARTY_RISK',
    category: 'Vendor Onboarding & Assessment',
    intendedPurpose: 'Provide standardized steps for vendor onboarding: collecting questionnaires (SIG/CAIQ), reviewing SOC 2 reports, evaluating data transfers, and scoring residual risk.',
    applicabilityConditions: ['All newly proposed vendor, software, and contractor agreements'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.ismsOwnerOrCisoRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Intake & Categorization', '4. Security Questionnaire & SOC 2 Audit Review', '5. Data Flow & Subprocessor Analysis', '6. Risk Scoring & Recommendations', '7. Contract Security Addendum Sign-Off'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.19, A.5.20',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Completed TPRM risk assessment dossier, vendor SOC 2 review notes, executed DPA',
        assuranceLimitationNotice: 'Due diligence reflects point-in-time assessment; continuous posture monitoring required.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.19', evidenceType: 'Vendor Due Diligence Review Dossier' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Third-Party Risk Analyst', defaultReviewerRole: 'Procurement Specialist', approverRole: 'CISO' },
    qualityRules: ['Tier-1 vendors must not be approved without review of active SOC 2 Type II or ISO 27001 certificate'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline supplier due diligence procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-TPRM-002',
    title: 'Supplier Risk Assessment Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'THIRD_PARTY_RISK',
    category: 'Ongoing Vendor Monitoring',
    intendedPurpose: 'Establish annual recurring security re-assessments, dark web leak monitoring, SLA compliance tracking, and corrective action workflows for active vendors.',
    applicabilityConditions: ['All Tier-1 and Tier-2 active suppliers in the vendor register'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Annual Review Cadence', '4. Continuous Posture Signal Evaluation', '5. Re-Assessment Gates', '6. Remediation Management & Handback'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.5.21, A.5.22',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Annual vendor re-assessment sign-off record, security scorecards',
        assuranceLimitationNotice: 'External security rating scores indicate surface posture; do not prove internal control operation.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.21', evidenceType: 'Annual Supplier Posture Evaluation Pack' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'TPRM Lead', defaultReviewerRole: 'IT Sourcing Lead', approverRole: 'CISO' },
    qualityRules: ['Failed vendor re-assessment must trigger formal 30-day corrective action plan or phase-out'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline vendor risk assessment procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-EXC-001',
    title: 'Security Exception and Risk Acceptance Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'ENTERPRISE_RISK',
    category: 'Risk Governance & Policy Exceptions',
    intendedPurpose: 'Provide controlled, auditable workflow for requesting, evaluating, authorizing, and expiring deviations from mandatory security policies.',
    applicabilityConditions: ['Any temporary technical limitation or business requirement preventing compliance with security policies'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'approvalThresholdsAndRules.emergencyWaiverApprover'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Exception Request Submission', '4. Compensating Control Evaluation', '5. Authorization Authority by Residual Risk', '6. Expiry & Re-evaluation (Max 1 Year)', '7. Exception Register Archival'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 6.1.3, Annex A.5.1',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Approved Risk Acceptance Record in register with compensating controls and expiry date',
        assuranceLimitationNotice: 'An approved waiver documents accepted residual risk; does not mitigate vulnerability.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.5.1', evidenceType: 'Formally Approved Exception Dossier' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'GRC Risk Officer', defaultReviewerRole: 'Security Reviewer', approverRole: 'CISO (High Risk) / CEO (Critical Risk)' },
    qualityRules: ['Indefinite or permanent exceptions strictly prohibited; maximum validity 365 days', 'Compensating controls mandatory'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline security exception procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-CAPA-001',
    title: 'Corrective Action and Retesting Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'Audit Assurance & Remediation',
    intendedPurpose: 'Define operational lifecycle for logging audit nonconformities, performing root cause analysis (5-Whys), assigning remediation owners, and executing independent retesting.',
    applicabilityConditions: ['All internal audit findings, external ISO certification findings, SOC 2 exceptions, and regulatory observations'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.internalAuditorRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Nonconformity Registration', '4. Root Cause Analysis (5-Whys)', '5. Remediation Plan Sign-Off', '6. Independent Retesting Gates', '7. Formal Close-Out'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 10.1, 10.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'CAPA closure ticket with retest evidence and auditor sign-off',
        assuranceLimitationNotice: 'Closed CAPA proves tested fix was implemented; does not guarantee issue will never recur.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '10.1', evidenceType: 'Auditor-Signed CAPA Retest Record' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Internal Audit Lead', defaultReviewerRole: 'Process Owner', approverRole: 'CISO & Audit Committee' },
    qualityRules: ['Closure requires independent verification by auditor who did not write the remediation code'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline CAPA operational procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-EVID-001',
    title: 'Evidence Collection and Validation Procedure',
    documentType: 'WORK_INSTRUCTION',
    hierarchyLevel: 'LEVEL_4_WORK_INSTRUCTION',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'Audit Preparation & Assurance',
    intendedPurpose: 'Establish protocol for capturing, hashing, and storing immutable audit evidence: screenshot parameters, system export requirements, tamper-proofing, and auditor handoff.',
    applicabilityConditions: ['All evidence gathered for ISO 27001, SOC 2, HIPAA, and internal audits'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'evidenceAndRecordsRetention.evidenceStorageVault'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Evidence Integrity Standards', '4. Minimum Metadata (URL, Timestamp, Operator)', '5. Cryptographic Hashing (SHA-256)', '6. Upload to WORM Vault', '7. Verification by Lead Auditor'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 7.5.3, 9.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'SHA-256 hashed evidence artifacts with immutable object metadata',
        assuranceLimitationNotice: 'Evidence proves state at sample timestamp; does not represent continuous operating effectiveness.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '7.5.3', evidenceType: 'Evidence Custody Ledger & Hash Manifest' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Audit Readiness Specialist', defaultReviewerRole: 'Lead Internal Auditor', approverRole: 'GRC Director' },
    qualityRules: ['Every evidence file must have SHA-256 digest recorded in custody ledger'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline evidence collection procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-INV-001',
    title: 'Security Event Investigation Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'INFORMATION_SECURITY',
    category: 'SOC Operations & Threat Hunting',
    intendedPurpose: 'Provide operational workflow for analyzing SIEM alerts, determining true vs false positives, pivot queries, endpoint forensics, and escalation to incident status.',
    applicabilityConditions: ['All SOC tier-1 and tier-2 alert triage operations'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'operatingModel.siemAndLoggingPlatform'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Alert Ingestion & Queue', '4. Triage Checklist', '5. Forensic Pivot Workflows', '6. False Positive Tuning', '7. Escalation to CSIRT'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.8.16, A.5.25',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'SOC triage ticket history, query execution logs, alert disposition audit trail',
        assuranceLimitationNotice: 'Triage documentation verifies alert was handled; does not detect evasion tactics.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.8.16', evidenceType: 'SOC Alert Triage & Investigation Ticket' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Senior SOC Analyst', defaultReviewerRole: 'SOC Manager', approverRole: 'CISO' },
    qualityRules: ['Must specify maximum triage SLA by alert priority (P1 <= 15m, P2 <= 1h)'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline investigation procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-DSR-001',
    title: 'Data Subject Request Handling Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Operations & Data Rights',
    intendedPurpose: 'Define operational steps for receiving, verifying identity, querying systems, extracting, rectifying, or erasing personal data under DPDP Act 2023 & GDPR.',
    applicabilityConditions: ['All data subject access, correction, erasure, and grievance requests'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Request Intake Channels', '4. Identity Verification Gates', '5. Data Discovery Across Databases', '6. Redaction of Third-Party Data', '7. Secure Delivery / Erasure Confirmation', '8. Statutory Timelines'],
    conditionalSections: [{ section: 'DPDP Consent Withdrawal', condition: 'When handling Data Principal requests under India DPDP Act 2023' }],
    relatedFrameworks: [
      {
        frameworkCode: 'DPDP_ACT_2023',
        clauseOrControl: 'Section 11, 12, 13',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'DSR ticket audit trail, identity verification hash, automated extraction archive hash',
        assuranceLimitationNotice: 'DSR completion proves database query returned results; does not verify unindexed dark data.'
      },
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 15, 16, 17, 18, 20',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Article 15 disclosure record, 30-day delivery confirmation timestamp',
        assuranceLimitationNotice: 'Erasure confirmation logs prove deletion in active databases; backups age out per retention policy.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'DPDP-SEC-12', evidenceType: 'Data Principal Rights Fulfillment Dossier' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Privacy Operations Manager', defaultReviewerRole: 'Data Protection Officer (DPO)', approverRole: 'General Counsel & DPO' },
    qualityRules: ['Statutory turnaround must not exceed 30 days', 'Strict identity verification before releasing data'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline DSR procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-BREACH-001',
    title: 'Personal Data Breach Assessment Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Incidents & Regulatory Reporting',
    intendedPurpose: 'Provide methodology for assessing risk to data subjects/principals (Likelihood x Severity of harm), deciding regulatory notification thresholds, and drafting notices.',
    applicabilityConditions: ['Any unauthorized access, disclosure, alteration, loss, or destruction of personal data'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Triage & Thresholds', '4. Harm Assessment Matrix', '5. Supervisory Authority Notification Decision Gates', '6. Individual Notification Gates', '7. Evidence Archival'],
    conditionalSections: [{ section: 'Data Protection Board of India Reporting', condition: 'When handling breach affecting Indian Data Principals under DPDP Act 2023' }],
    relatedFrameworks: [
      {
        frameworkCode: 'DPDP_ACT_2023',
        clauseOrControl: 'Section 8(6)',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Breach assessment dossier, DPBI notification receipt, Data Principal notification copy',
        assuranceLimitationNotice: 'Breach assessment documents risk determination; regulator retains ultimate decision authority.'
      },
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 33, 34',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: '72-hour supervisory authority notification dispatch record, risk rationale record',
        assuranceLimitationNotice: 'Assessment record proves rationale for non-notification if risk to rights is low.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'GDPR-ART-33', evidenceType: 'Personal Data Breach Assessment & Notice Pack' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Data Protection Officer (DPO)', defaultReviewerRole: 'CISO & Incident Commander', approverRole: 'Executive Committee & General Counsel' },
    qualityRules: ['Must evaluate risk within 24 hours of breach confirmation to meet statutory notification clocks'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline personal data breach assessment procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-DISP-001',
    title: 'Secure Asset Disposal Procedure',
    documentType: 'WORK_INSTRUCTION',
    hierarchyLevel: 'LEVEL_4_WORK_INSTRUCTION',
    version: '1.0',
    domain: 'OPERATIONS',
    category: 'Hardware & Media Sanitization',
    intendedPurpose: 'Provide operational steps for sanitizing, degaussing, shredding, and certifying disposal of physical media, hard drives, and retired corporate laptops per NIST SP 800-88.',
    applicabilityConditions: ['Decommissioning of physical laptops, mobile devices, servers, and storage media'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Asset De-registration in CMDB', '4. Sanitization Methods by Media Type', '5. Physical Destruction Requirements', '6. Certificate of Destruction Archival'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Annex A.7.14, A.8.10',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Certified vendor certificate of destruction with drive serial numbers',
        assuranceLimitationNotice: 'Vendor certificate proves receipt and destruction; relies on vendor chain of custody.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'A.7.14', evidenceType: 'Serialized Certificate of Destruction' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'IT Asset Manager', defaultReviewerRole: 'Facilities & Security Lead', approverRole: 'CISO' },
    qualityRules: ['Every wiped drive must be tracked by manufacturer serial number on certificate'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline secure asset disposal procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },

  // --------------------------------------------------------------------------
  // PART 3: PRIVACY AND REGULATORY DOCUMENTS (8 ENTRIES)
  // --------------------------------------------------------------------------
  {
    id: 'TMPL-POL-PRV-001',
    title: 'Privacy Governance Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Management & Compliance',
    intendedPurpose: 'Establish enterprise privacy governance, core privacy principles (Lawfulness, Fairness, Transparency, Purpose Limitation, Storage Limitation), and DPO mandate under DPDP Act & GDPR.',
    applicabilityConditions: ['All personal data processed across employee, customer, prospect, and partner populations'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Core Privacy Principles', '4. Data Protection Officer (DPO) Charter', '5. Lawful Bases for Processing', '6. Cross-Border Data Transfers', '7. Privacy by Design Mandates', '8. Governance & Auditing'],
    conditionalSections: [{ section: 'Consent Manager Directives', condition: 'Under India DPDP Act 2023 requirements' }],
    relatedFrameworks: [
      {
        frameworkCode: 'DPDP_ACT_2023',
        clauseOrControl: 'Section 4, 6, 7, 8, 9, 10',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Approved privacy policy, consent notice templates, DPO appointment resolution',
        assuranceLimitationNotice: 'Policy directives establish governance; technical consent enforcement requires telemetry verification.'
      },
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 5, 24, 37, 38, 39',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Board approval record, published public privacy notice, DPO contact registration',
        assuranceLimitationNotice: 'Published policy proves transparency compliance; does not prove downstream vendor compliance.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'PRIV-GOV-01', evidenceType: 'Approved Privacy Governance Policy' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Data Protection Officer (DPO)', defaultReviewerRole: 'General Counsel', approverRole: 'Board of Directors / CEO' },
    qualityRules: ['Must clearly distinguish Data Fiduciary / Controller vs Data Processor roles'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Enterprise privacy governance baseline.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-PRV-002',
    title: 'Personal Data Retention and Disposal Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Operations',
    intendedPurpose: 'Provide operational workflow for automated data tiering, database purging scripts, tombstoning, and anonymization of personal data upon retention expiry.',
    applicabilityConditions: ['All production databases and analytics warehouses storing personal data'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'evidenceAndRecordsRetention.defaultRecordRetentionYears'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Retention Expiry Detection', '4. Legal Hold Check', '5. Anonymization vs Purging Protocols', '6. Production Database Execution', '7. Deletion Verification Audit'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 5(1)(e), 17',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Automated retention job logs, database deletion count metrics',
        assuranceLimitationNotice: 'Job logs prove SQL DELETE was executed; does not verify cold offsite disaster recovery tape state.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'GDPR-ART-5', evidenceType: 'Automated Purge Execution Log' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Data Engineering Lead', defaultReviewerRole: 'DPO', approverRole: 'General Counsel' },
    qualityRules: ['Must verify legal hold database before triggering deletion queries'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline personal data retention procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-PRV-003',
    title: 'Data Subject Request Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Operations',
    intendedPurpose: 'Operational procedure for validating Data Principal identity, coordinating across microservices, generating machine-readable exports (JSON/CSV), and auditing DSR queues.',
    applicabilityConditions: ['Customer, employee, and partner data subject requests'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Intake & Authentication', '4. Orchestration Across Data Stores', '5. Redaction of Third Parties', '6. Secure Export Transmission', '7. SLA Tracking'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'DPDP_ACT_2023',
        clauseOrControl: 'Section 11, 12',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'DSR workflow ticket, hash of delivered package, timestamped delivery confirmation',
        assuranceLimitationNotice: 'Delivered package contains discovered records; relies on completeness of data mapping.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'DPDP-SEC-11', evidenceType: 'DSR Ticket History Record' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Privacy Operations Lead', defaultReviewerRole: 'DPO', approverRole: 'Legal Counsel' },
    qualityRules: ['Turnaround must adhere to 30-day statutory limit'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline DSR operational procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-PRV-004',
    title: 'Personal Data Breach Response Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Incident Management',
    intendedPurpose: 'Detail exact escalation gates between technical CSIRT and Data Protection Officer, statutory notice drafting, regulatory communication channels, and impacted subject outreach.',
    applicabilityConditions: ['All security events involving potential personal data compromise'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'organizationProfile.jurisdictions'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. CSIRT-to-DPO Handshake', '4. Harm Evaluation Criteria', '5. Board Notification Gates', '6. Supervisory Authority Notification Steps', '7. Public Communication'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'DPDP_ACT_2023',
        clauseOrControl: 'Section 8(6)',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'DPBI notification receipt, impacted user email dispatch logs',
        assuranceLimitationNotice: 'Notification logs verify dispatch; does not verify delivery receipt by individuals.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'DPDP-SEC-8-6', evidenceType: 'Regulatory Breach Notification Record' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'DPO', defaultReviewerRole: 'Head of Communications', approverRole: 'CEO & General Counsel' },
    qualityRules: ['Must specify immediate notification to DPO within 2 hours of breach confirmation'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline breach response procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-PRV-005',
    title: 'Privacy Impact Assessment Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Engineering & Architecture',
    intendedPurpose: 'Define screening questions, trigger criteria, consultation gates, and risk mitigation requirements for new product features and AI processing involving personal data.',
    applicabilityConditions: ['All new software features, AI deployments, vendor integrations, or biometric processing'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. PIA Screening Questionnaire', '4. Threshold Triggers (High Risk)', '5. Assessment Workflow', '6. Technical Mitigation Gates', '7. DPO Approval & Sign-Off'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 35',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Completed DPIA report with DPO formal opinion and risk sign-off',
        assuranceLimitationNotice: 'Approved DPIA reflects planned architecture; requires post-launch audit to verify implemented controls.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'GDPR-ART-35', evidenceType: 'Signed DPIA Document' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Privacy Architect', defaultReviewerRole: 'Product Lead', approverRole: 'DPO' },
    qualityRules: ['Mandatory for all AI models trained on personal data'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline PIA operational procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SCAFFOLD_TEMPLATE_AVAILABLE'
  },
  {
    id: 'TMPL-REG-ROPA-001',
    title: 'Processing Activity Register',
    documentType: 'REGISTER_LOG',
    hierarchyLevel: 'LEVEL_5_REGISTER_LOG',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Regulatory Registers & RoPA',
    intendedPurpose: 'Provide structured, auditable Article 30 / Section 8 Register of Processing Activities (RoPA): processing purposes, data categories, recipients, cross-border transfers, and retention.',
    applicabilityConditions: ['All enterprise business units collecting or processing personal data'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'scopeDefinition.inScopeServicesAndProducts'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Document Control', '2. Processing Activity Directory Table', '3. Lawful Basis Matrix', '4. Third-Party Disclosures & International Transfers', '5. Technical & Organizational Safeguards', '6. Annual Audit Attestation'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 30',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Validated RoPA spreadsheet/register with annual business unit sign-offs',
        assuranceLimitationNotice: 'RoPA captures documented data flows; shadow-IT data pipelines require automated API discovery.'
      },
      {
        frameworkCode: 'DPDP_ACT_2023',
        clauseOrControl: 'Section 8',
        provenance: 'SOURCE_DERIVED_MAPPING',
        distinctionType: 'SKANDA_INTERPRETATION',
        evidenceTypeRequired: 'Data fiduciary inventory of processed personal data',
        assuranceLimitationNotice: 'Fiduciary register must reflect verified purpose specifications.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'GDPR-ART-30', evidenceType: 'Official Article 30 RoPA Register' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'DPO & Privacy Lead', defaultReviewerRole: 'Business Unit Leads', approverRole: 'General Counsel' },
    qualityRules: ['Must enumerate specific lawful basis for every business process', 'Must record cross-border destinations'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline RoPA register template.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-REG-BREACH-001',
    title: 'Personal Data Breach Register',
    documentType: 'REGISTER_LOG',
    hierarchyLevel: 'LEVEL_5_REGISTER_LOG',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Regulatory Registers & Incident Ledgers',
    intendedPurpose: 'Maintain permanent, immutable internal ledger of all personal data breach incidents (notified and non-notified), facts, effects, and corrective actions taken.',
    applicabilityConditions: ['All security events involving personal data, regardless of notification status'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Register Control', '2. Breach Incident Table', '3. Severity & Harm Classification', '4. Regulatory Reporting Audit Ledger', '5. Remediation Status Tracking'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 33(5)',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Permanent internal breach log showing facts, effects, and remediation',
        assuranceLimitationNotice: 'Article 33(5) log is mandatory for supervisory inspection even if no external notification was required.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'GDPR-ART-33-5', evidenceType: 'Internal Data Breach Ledger' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'DPO', defaultReviewerRole: 'SOC Lead', approverRole: 'CISO & DPO' },
    qualityRules: ['Every entry must document reasoning if supervisory authority was NOT notified'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline breach register template.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-FORM-DPIA-001',
    title: 'Data Protection Impact Assessment Template',
    documentType: 'FORM_CHECKLIST',
    hierarchyLevel: 'LEVEL_5_FORM_CHECKLIST',
    version: '1.0',
    domain: 'PRIVACY_AND_DATA_PROTECTION',
    category: 'Privacy Assessments & Forms',
    intendedPurpose: 'Provide structured DPIA questionnaire covering systemic data flows, necessity and proportionality, privacy risks to data principals, mitigations, and DPO sign-off.',
    applicabilityConditions: ['High-risk processing, automated profiling, large-scale sensitive data processing, biometric systems'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Project & System Overview', '2. Description of Processing & Data Flows', '3. Assessment of Necessity & Proportionality', '4. Risk Identification Matrix', '5. Technical & Organizational Measures', '6. DPO Formal Opinion', '7. Residual Risk Approval'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'GDPR',
        clauseOrControl: 'Article 35',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Completed, signed DPIA form with documented mitigations',
        assuranceLimitationNotice: 'Completed form documents intent; must be audited post-implementation.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: 'GDPR-ART-35', evidenceType: 'Executed DPIA Assessment Document' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Privacy Architect', defaultReviewerRole: 'Engineering Lead', approverRole: 'DPO' },
    qualityRules: ['Must assess necessity and proportionality separately from technical security'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline DPIA template.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },

  // --------------------------------------------------------------------------
  // PART 4: RISK AND ASSURANCE DOCUMENTS (10 ENTRIES)
  // --------------------------------------------------------------------------
  {
    id: 'TMPL-POL-RSK-001',
    title: 'Enterprise Risk Management Policy',
    documentType: 'POLICY',
    hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
    version: '1.0',
    domain: 'ENTERPRISE_RISK',
    category: 'Risk Governance & Appetite',
    intendedPurpose: 'Establish organizational risk management framework: 3 Lines of Defense (3LoD), risk appetite boundaries, likelihood/impact scoring criteria, and treatment mandates.',
    applicabilityConditions: ['All enterprise business units, products, technologies, and third-party partnerships'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.executiveSponsorRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Risk Governance & 3LoD Structure', '4. Risk Appetite Statement', '5. Likelihood & Impact 5x5 Matrix', '6. Risk Treatment Strategies (Mitigate, Transfer, Avoid, Accept)', '7. Reporting to Board'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 6.1.1, 6.1.2, 6.1.3',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Approved ERM policy, Board Risk Committee minutes',
        assuranceLimitationNotice: 'Policy defines risk methodology; does not guarantee risks are fully identified without comprehensive register.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '6.1.2', evidenceType: 'Approved Risk Management Framework' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Chief Risk Officer (CRO) / CISO', defaultReviewerRole: 'Risk Committee', approverRole: 'Board Audit & Risk Committee' },
    qualityRules: ['Must define quantitative/qualitative boundaries for Critical, High, Medium, Low risk'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline enterprise risk policy.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-RSK-001',
    title: 'Risk Assessment Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'ENTERPRISE_RISK',
    category: 'Risk Methodology & Operations',
    intendedPurpose: 'Provide operational workflow for risk identification, threat/vulnerability asset mapping, inherent scoring, control evaluation, residual scoring, and register update.',
    applicabilityConditions: ['Annual enterprise risk assessments, major system changes, and new product launches'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Assessment Triggers', '4. Threat-Asset Identification Gates', '5. Inherent Risk Scoring (Likelihood x Impact)', '6. Control Effectiveness Evaluation', '7. Residual Risk Calculation', '8. Register Update'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 6.1.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Completed risk assessment working papers, risk scoring sheets',
        assuranceLimitationNotice: 'Scoring reflects subjective expert consensus; requires empirical incident data validation.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '6.1.2', evidenceType: 'Completed Risk Assessment Working Papers' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Senior Risk Analyst', defaultReviewerRole: 'Risk Owners', approverRole: 'CRO / CISO' },
    qualityRules: ['Every risk must identify a named human Risk Owner in management'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline risk assessment procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PLAN-RTP-001',
    title: 'Risk Treatment Plan Template',
    documentType: 'IMPLEMENTATION_PLAN',
    hierarchyLevel: 'LEVEL_5_IMPLEMENTATION_PLAN',
    version: '1.0',
    domain: 'ENTERPRISE_RISK',
    category: 'Risk Treatment & Action Plans',
    intendedPurpose: 'Provide auditable plan matching identified risks with ISO 27001 Annex A controls, assigned implementation owners, target dates, budget, and residual verification.',
    applicabilityConditions: ['All risks with residual score exceeding organizational risk appetite threshold'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Plan Executive Summary', '2. Risk Treatment Register Table', '3. Annex A Control Alignment', '4. Resource & Budget Allocation', '5. Milestone Tracking Schedule', '6. Risk Owner Attestation'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 6.1.3, 6.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Approved Risk Treatment Plan signed by Risk Owners and CISO',
        assuranceLimitationNotice: 'A treatment plan documents committed actions; does not reduce risk until controls are implemented.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '6.1.3', evidenceType: 'Formally Approved Risk Treatment Plan' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Risk Treatment Coordinator', defaultReviewerRole: 'Control Owners', approverRole: 'CISO & Risk Committee' },
    qualityRules: ['Every treatment action must specify target completion date and measurable verification test'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline RTP template.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-FORM-RSKACC-001',
    title: 'Risk Acceptance Record',
    documentType: 'FORM_CHECKLIST',
    hierarchyLevel: 'LEVEL_5_FORM_CHECKLIST',
    version: '1.0',
    domain: 'ENTERPRISE_RISK',
    category: 'Risk Governance & Forms',
    intendedPurpose: 'Provide formal sign-off document when an executive authorizes acceptance of residual risk exceeding normal tolerance: rationale, compensating controls, and expiry.',
    applicabilityConditions: ['Any business or technical risk where mitigation is infeasible or disproportionately costly'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Risk Identification & Current Metrics', '2. Business Justification for Non-Remediation', '3. Compensating Controls In Place', '4. Financial & Regulatory Impact Analysis', '5. Expiry Date & Re-Evaluation Schedule', '6. Executive Signatures'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 6.1.3',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Executed Risk Acceptance Record signed by accountable business executive',
        assuranceLimitationNotice: 'Risk acceptance documents authorized assumption of liability; does not reduce vulnerability.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '6.1.3', evidenceType: 'Executive Risk Acceptance Dossier' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Risk Owner (VP Level)', defaultReviewerRole: 'CISO', approverRole: 'Chief Executive Officer / Board' },
    qualityRules: ['Acceptance must expire within 12 months', 'Compensating controls must be verified by CISO'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline risk acceptance form.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-AUD-001',
    title: 'Control Testing Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'Internal Audit & Testing Operations',
    intendedPurpose: 'Define operational steps for sampling methodology (AICPA / IIA standards), test of design (ToD), test of operating effectiveness (ToE), workpaper documentation, and deviations.',
    applicabilityConditions: ['All internal control testing cycles across ISO 27001 and SOC 2 domains'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.internalAuditorRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Population & Sampling Rules (Attribute Sampling)', '4. Test of Design (ToD) Workflow', '5. Test of Effectiveness (ToE) Workflow', '6. Exception Documentation', '7. Workpaper Archival'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 9.1, 9.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Completed audit test workpapers with sample population lists and testing results',
        assuranceLimitationNotice: 'Sample-based testing provides reasonable assurance; does not test 100% of transactions.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '9.2', evidenceType: 'Control Testing Workpaper Package' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Lead Internal IT Auditor', defaultReviewerRole: 'Control Owners', approverRole: 'Head of Internal Audit' },
    qualityRules: ['Sampling size must follow formal statistical criteria based on frequency of control execution'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline control testing procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PROC-AUD-002',
    title: 'Internal Audit Procedure',
    documentType: 'PROCEDURE',
    hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'Audit Governance & Execution',
    intendedPurpose: 'Provide end-to-end audit process: annual audit plan development, audit charter, opening meetings, fieldwork, closing meetings, draft report review, and management responses.',
    applicabilityConditions: ['All scheduled internal ISMS, privacy, and compliance audits'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.internalAuditorRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Purpose', '2. Scope', '3. Annual Audit Planning & Risk Ranking', '4. Engagement Charter & Opening Meeting', '5. Fieldwork & Evidence Gathering', '6. Closing Meeting & Draft Findings', '7. Final Report & Management Response'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 9.2',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Annual audit schedule, approved audit engagement charter, signed final audit report',
        assuranceLimitationNotice: 'Audit report represents independent assessment at conclusion date; subject to management response completion.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '9.2', evidenceType: 'Final Internal Audit Report Pack' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Director of Internal Audit', defaultReviewerRole: 'Audited Department Leads', approverRole: 'Audit Committee & CEO' },
    qualityRules: ['Auditors must be independent of the operational processes being audited (Segregation of Duties)'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline internal audit procedure.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-REG-FIND-001',
    title: 'Audit Findings Register',
    documentType: 'REGISTER_LOG',
    hierarchyLevel: 'LEVEL_5_REGISTER_LOG',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'Audit Findings & Registers',
    intendedPurpose: 'Maintain central repository of all audit findings, nonconformities, observations, opportunities for improvement (OFI), target dates, and verification status.',
    applicabilityConditions: ['All internal and external audits across all enterprise domains'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Register Metadata', '2. Audit Findings Master Table', '3. Severity Distribution (Major NC, Minor NC, OFI)', '4. Overdue Tracking', '5. Re-Test Verification Sign-Offs'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 9.2, 10.1',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Active findings register spreadsheet/table with verified remediation stamps',
        assuranceLimitationNotice: 'Findings register tracks reported issues; does not guarantee un-audited areas are free of nonconformities.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '10.1', evidenceType: 'Central Audit Findings Register' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Audit Operations Coordinator', defaultReviewerRole: 'Internal Audit Lead', approverRole: 'Head of Internal Audit' },
    qualityRules: ['Major nonconformities must be escalated to CEO within 48 hours'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline findings register.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-PLAN-CAPA-001',
    title: 'Corrective Action Plan',
    documentType: 'IMPLEMENTATION_PLAN',
    hierarchyLevel: 'LEVEL_5_IMPLEMENTATION_PLAN',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'Remediation Plans',
    intendedPurpose: 'Document specific remediation tasks, milestones, responsible engineers, resource allocation, and re-test acceptance criteria for high-severity audit issues.',
    applicabilityConditions: ['Any Major or Minor nonconformity identified during audit or incident review'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Finding Summary & Root Cause', '2. Detailed Remediation Milestones', '3. Responsible Engineers & Budget', '4. Target Completion Timetable', '5. Verification Test Specification', '6. Auditor Close-Out Stamp'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 10.1',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Signed CAPA implementation plan with verified evidence attachments',
        assuranceLimitationNotice: 'Plan completion confirms technical fix; ongoing control effectiveness requires follow-up audit.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '10.1', evidenceType: 'Approved CAPA Milestone Document' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'Remediation Action Owner', defaultReviewerRole: 'Internal Auditor', approverRole: 'CISO' },
    qualityRules: ['Milestone deadlines must not be extended without formal change request to audit committee'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline CAPA plan template.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-REV-MGMT-001',
    title: 'Management Review Pack',
    documentType: 'MANAGEMENT_REVIEW_PACK',
    hierarchyLevel: 'LEVEL_5_MANAGEMENT_REVIEW_PACK',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'Executive Governance & ISO Clause 9.3',
    intendedPurpose: 'Assemble comprehensive ISO/IEC 27001:2022 Clause 9.3 executive review pack: previous actions, external/internal context changes, ISMS performance, audit results, resources, and decisions.',
    applicabilityConditions: ['Mandatory annual or semi-annual executive management review of the ISMS'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'keyRolesAndDelegations.executiveSponsorRole', 'keyRolesAndDelegations.ismsOwnerOrCisoRole'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Executive Summary & Meeting Details', '2. Status of Actions from Previous Reviews', '3. Changes in External & Internal Issues', '4. Information Security Objectives Achievement', '5. Nonconformities & Corrective Actions', '6. Monitoring & Measurement Results', '7. Audit Findings Summary', '8. Threat Landscape & Vulnerabilities', '9. Resource Adequacy & Budget Decisions', '10. Executive Decisions & Sign-Off'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 9.3',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Signed Management Review Meeting Minutes and Executive Decision Pack',
        assuranceLimitationNotice: 'Management review records verify executive review occurred; does not prove continuous operating effectiveness.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '9.3', evidenceType: 'Signed Management Review Meeting Minutes' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'CISO / Head of Information Security', defaultReviewerRole: 'Internal Audit & GRC Lead', approverRole: 'Chief Executive Officer (CEO)' },
    qualityRules: ['Must cover all 7 mandatory Clause 9.3 input topics and produce explicit decisions on improvement'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Baseline ISO 27001 Clause 9.3 Management Review Pack.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  },
  {
    id: 'TMPL-REV-SOA-001',
    title: 'Statement of Applicability Support Template',
    documentType: 'MANAGEMENT_REVIEW_PACK',
    hierarchyLevel: 'LEVEL_5_MANAGEMENT_REVIEW_PACK',
    version: '1.0',
    domain: 'COMPLIANCE_AND_AUDIT',
    category: 'ISO 27001 Core Deliverables',
    intendedPurpose: 'Provide complete ISO/IEC 27001:2022 Annex A (Controls A.5.1 to A.8.34) Statement of Applicability (SoA) matrix: applicability, inclusion/exclusion justification, implementation status, and evidence.',
    applicabilityConditions: ['Mandatory for all organizations seeking or maintaining ISO/IEC 27001:2022 certification'],
    requiredOrganizationalInputs: ['organizationProfile.legalEntityName', 'scopeDefinition.inScopeServicesAndProducts'],
    optionalOrganizationalInputs: [],
    requiredSections: ['1. Document Control & Scope Alignment', '2. SoA Methodology & Inclusion Criteria', '3. Organizational Controls Matrix (A.5.1 - A.5.37)', '4. People Controls Matrix (A.6.1 - A.6.8)', '5. Physical Controls Matrix (A.7.1 - A.7.14)', '6. Technological Controls Matrix (A.8.1 - A.8.34)', '7. Exclusions Justification Summary', '8. Executive Attestation'],
    conditionalSections: [],
    relatedFrameworks: [
      {
        frameworkCode: 'ISO_27001_2022',
        clauseOrControl: 'Clause 6.1.3(d)',
        provenance: 'VERIFIED_SOURCE_MAPPING',
        distinctionType: 'SOURCE_REQUIREMENT',
        evidenceTypeRequired: 'Approved Statement of Applicability with justification for all 93 controls',
        assuranceLimitationNotice: 'SoA documents applicability and declared implementation; certification body audits operational evidence.'
      }
    ],
    relatedControlsAndEvidenceTypes: [{ controlCode: '6.1.3(d)', evidenceType: 'Official ISO/IEC 27001:2022 Statement of Applicability' }],
    ownerAndReviewerRoles: { defaultOwnerRole: 'CISO / ISO Implementer Lead', defaultReviewerRole: 'Lead Auditor', approverRole: 'Executive Committee & Board' },
    qualityRules: ['Every single one of the 93 controls must have explicit inclusion or exclusion justification'],
    outputFormatSupport: ['DOCX', 'HTML', 'MARKDOWN'],
    versionHistory: [{ version: '1.0', date: '2026-10-11', summary: 'Complete ISO/IEC 27001:2022 93-control SoA master template.' }],
    reviewAndRetirementStatus: 'ACTIVE',
    contentDepth: 'SUBSTANTIVE_MODEL_AVAILABLE'
  }
];
