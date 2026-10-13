/**
 * SKANDA ENTERPRISE THIRD-PARTY RISK INTELLIGENCE & CONTINUOUS ASSURANCE DOMAIN MODEL
 * Path: src/types/tprmTypes.ts
 * 
 * Enterprise Canonical Architecture for TPRM:
 * 1. 17-Stage Vendor Lifecycle State Machine
 * 2. Vendor 360 Entity Model (Profile, Relationship, Data/Tech, Assurance, Lifecycle)
 * 3. 14-Factor Versioned Risk Scoring Methodology & Matrices (3x3, 4x4, 5x5)
 * 4. Risk-Based Due Diligence & Dynamic Questionnaire Engine
 * 5. Evidence Intelligence & Assurance Tiers (Document -> Design -> Implementation -> Operating Effectiveness)
 * 6. Continuous Monitoring, Signal Ingestion & Reassessment Triggers
 * 7. Fourth-Party Dependencies & Concentration Risk Graph
 * 8. Contract Obligations, SLAs & DPA/SCC Regulatory Compliance
 * 9. Findings & CAPA Remediation with Mandatory Retest Verification
 * 10. Regulatory Mappings (ISO 27001, ISO 27701, SOC 2, MAS TRM, India DPDP Act)
 */

import { StandardFrameworkCode } from './grcCoreTypes';

// ============================================================================
// 1. 17-STAGE VENDOR LIFECYCLE ENUM & STATE MACHINE
// ============================================================================

export type VendorLifecycleStatus =
  | 'VENDOR_DISCOVERY'
  | 'BUSINESS_SPONSORSHIP'
  | 'VENDOR_REGISTRATION'
  | 'INHERENT_RISK_CLASSIFICATION'
  | 'RISK_BASED_DUE_DILIGENCE'
  | 'EVIDENCE_COLLECTION_VERIFICATION'
  | 'CONTROL_ASSESSMENT'
  | 'RISK_EVALUATION'
  | 'APPROVAL_OR_CONDITIONAL_APPROVAL'
  | 'CONTRACT_SERVICE_ACTIVATION'
  | 'CONTINUOUS_MONITORING'
  | 'RISK_EVENT_DETECTION'
  | 'RISK_REASSESSMENT'
  | 'REMEDIATION_AND_CAPA'
  | 'INDEPENDENT_RETESTING'
  | 'RESIDUAL_RISK_EVALUATION'
  | 'RENEWAL_SUSPENSION_OFFBOARDING';

export type VendorApprovalDecision =
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REJECTED'
  | 'ESCALATED_TO_CRO'
  | 'PENDING_EXECUTIVE_APPROVAL';

export type VendorCriticalityTier =
  | 'TIER_1_STRATEGIC_CRITICAL'   // High operational dependency, core business service, sensitive PII/financial
  | 'TIER_2_MAJOR_OPERATIONAL'    // Substantial operational impact, internal data
  | 'TIER_3_TACTICAL_SUPPORT'     // Moderate impact, limited systems access
  | 'TIER_4_COMMODITY_LOW_RISK';  // Off-the-shelf, public data only

// ============================================================================
// 2. ASSURANCE TIERS (CRITICAL SEPARATION OF AUDIT PROOFS)
// ============================================================================

export type AssuranceTier =
  | 'DOCUMENT_EXISTS'                      // Document uploaded/present
  | 'DOCUMENT_REVIEWED'                    // Reviewed by 1st/2nd line analyst
  | 'CONTROL_DESIGN_ASSESSED'              // Control design adequacy verified
  | 'CONTROL_IMPLEMENTATION_VERIFIED'      // Technical implementation proven
  | 'CONTROL_OPERATING_EFFECTIVENESS_TESTED'; // Sample/telemetry proves operating effectiveness

// ============================================================================
// 3. VENDOR 360 DOMAIN MODEL
// ============================================================================

export interface VendorOrganizationProfile {
  legalName: string;
  tradingName?: string;
  vendorIdentifier: string; // e.g. VND-AWS-001
  taxIdentifier?: string; // EIN / GST / UEN
  legalEntityJurisdiction: string; // Country / State
  headquartersAddress: string;
  industryCategory:
    | 'CLOUD_INFRASTRUCTURE'
    | 'SAAS_COLLABORATION'
    | 'PAYMENT_GATEWAY_FINTECH'
    | 'MANAGED_SECURITY_MSSP'
    | 'DEVELOPER_TOOLS_DEVOPS'
    | 'DATA_ANALYTICS_AI'
    | 'HR_WORKFORCE_MGMT'
    | 'LEGAL_COMPLIANCE'
    | 'TELECOMMUNICATIONS'
    | 'FACILITIES_DATA_CENTER';
  websiteUrl: string;
  keyContacts: {
    relationshipOwner: { name: string; email: string; role: string };
    businessSponsor: { name: string; email: string; department: string };
    procurementOwner: { name: string; email: string };
    securityContact: { name: string; email: string; phone?: string };
    privacyOfficer: { name: string; email: string };
    contractSignatory: { name: string; email: string };
  };
}

export interface VendorBusinessRelationship {
  servicesProvidedSummary: string;
  businessFunctionsSupported: string[];
  criticalityTier: VendorCriticalityTier;
  operationalDependencies: string[];
  criticalBusinessServicesAffected: string[]; // Ties to BIA and MAS Critical Systems
  geographicServiceLocations: string[]; // Data centers / Support regions
  serviceCommencementDate: string;
  contractExpiryDate: string;
  renewalNoticePeriodDays: number;
  exitStrategyDocumented: boolean;
  exitTransitionPeriodDays: number;
  alternativeSupplierAvailable: boolean;
  alternativeSupplierNames: string[];
  substitutabilityRating: 'HIGH_FRICTION_LOCK_IN' | 'MODERATE_EFFORT' | 'COMMODITY_DROP_IN';
}

export interface VendorTechnologyAndData {
  systemsAndApplicationsAccessed: string[];
  dataClassificationsProcessed: Array<
    'RESTRICTED_CUSTOMER_PII' | 'FINANCIAL_TRANSACTIONAL' | 'CONFIDENTIAL_IP' | 'INTERNAL_BUSINESS' | 'PUBLIC'
  >;
  personalDataInvolvement: boolean;
  specialCategoryOrSensitiveData: boolean; // Biometrics, healthcare, payment card
  hostingEnvironment: 'AWS' | 'AZURE' | 'GCP' | 'ON_PREMISE_COLO' | 'HYBRID_MULTI_CLOUD' | 'OTHER';
  privilegedAccessGranted: boolean;
  privilegedAccessDetails?: string;
  networkConnectivityType: 'DIRECT_PEERING_VPN' | 'PUBLIC_INTERNET_TLS13' | 'PRIVATE_LINK' | 'NONE';
  apiIntegrationsActive: string[];
  primaryStorageLocations: string[]; // Jurisdictions
  crossBorderTransfers: boolean;
  crossBorderTransferMechanisms: Array<'SCC_2021_914' | 'DPDP_APPROVED_JURISDICTION' | 'ADEQUACY_DECISION' | 'BCR'>;
  directSubprocessors: string[]; // List of 4th parties
  dataRetentionPeriod: string;
  dataDeletionAssuranceMechanism: 'CRYPTOGRAPHIC_ERASURE_CERTIFICATE' | 'PHYSICAL_DESTRUCTION_LOG' | 'CONTRACTUAL_WARRANTY';
}

export interface VendorAssuranceProfile {
  certifications: Array<{
    standard: 'ISO_27001_2022' | 'ISO_27701_2019' | 'ISO_42001_2023' | 'ISO_22301' | 'PCI_DSS_V4' | 'FEDRAMP_HIGH';
    certificateNumber: string;
    accreditationBody: string;
    scopeSummary: string;
    validFrom: string;
    validTo: string;
    assuranceTier: AssuranceTier;
    sha256Seal: string;
    isScopeMatchingServices: boolean;
  }>;
  socReports: Array<{
    reportType: 'SOC_1_TYPE_2' | 'SOC_2_TYPE_2' | 'SOC_3';
    trustServicesCriteria: Array<'SECURITY' | 'AVAILABILITY' | 'CONFIDENTIALITY' | 'PROCESSING_INTEGRITY' | 'PRIVACY'>;
    auditingFirm: string;
    reportingPeriodStart: string;
    reportingPeriodEnd: string;
    auditorOpinion: 'UNQUALIFIED_CLEAN' | 'QUALIFIED' | 'ADVERSE' | 'DISCLAIMER';
    csoUsIdentified: string[]; // Complementary User Entity Controls
    csoUsImplementedByUs: boolean;
    bridgeLetterObtained: boolean;
    assuranceTier: AssuranceTier;
    sha256Seal: string;
  }>;
  penetrationTesting: {
    lastTestDate: string;
    nextDueTestDate: string;
    testedByThirdParty: boolean;
    testingFirm: string;
    remediationOfCriticalFindingsConfirmed: boolean;
  };
  bcpDrTesting: {
    lastExerciseDate: string;
    rtoCommittedHours: number;
    rpoCommittedHours: number;
    testOutcome: 'PASS' | 'PARTIAL_FAIL' | 'UNTESTED';
  };
  securityPoliciesReceived: boolean;
  privacyNoticeCompliant: boolean;
  incidentResponseSlaHours: number; // e.g., 2 hours for critical breach
}

// ============================================================================
// 4. 14-DIMENSIONAL RISK METHODOLOGY & SCORING MODEL
// ============================================================================

export type RiskMatrixDimension = '3X3' | '4X4' | '5X5';

export interface TprmRiskFactorEvaluation {
  factorId: string;
  factorName: string;
  factorCategory:
    | 'INFOSEC'
    | 'PRIVACY_PII'
    | 'REGULATORY'
    | 'RESILIENCE_BCP'
    | 'FINANCIAL_VIABILITY'
    | 'ARCHITECTURE_TECH'
    | 'PRIVILEGE_ACCESS'
    | 'GEOGRAPHIC_JURISDICTION'
    | 'FOURTH_PARTY_SUPPLY_CHAIN'
    | 'CONCENTRATION'
    | 'AI_GOVERNANCE'
    | 'BUSINESS_CRITICALITY'
    | 'EXIT_SUBSTITUTABILITY'
    | 'ACTIVE_INCIDENTS';
  weight: number; // 0.0 - 1.0 (sums to 1.0 across active factors)
  rawScore: number; // 1 to 5 scale
  assessedRationale: string;
  groundingEvidenceIds: string[];
}

export interface TprmRiskSnapshot {
  snapshotId: string;
  tenantId: string;
  vendorId: string;
  methodologyVersion: string;
  matrixDimension: RiskMatrixDimension;
  calculatedAt: string;
  assessedBy: string;

  // Factor Breakdown (14 dimensions)
  factorBreakdown: TprmRiskFactorEvaluation[];

  // Inherent Risk
  inherentLikelihood: number; // 1-5
  inherentImpact: number;     // 1-5
  inherentRiskScore: number;  // 1-25 (or scaled)
  inherentRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Mitigating Control Effectiveness
  controlDesignScore: number;      // 0-100%
  controlOperatingScore: number;   // 0-100%
  evidenceFreshnessScore: number;  // 0-100%
  combinedControlEffectiveness: number; // 0-100%

  // Residual Risk
  residualLikelihood: number; // 1-5
  residualImpact: number;     // 1-5
  residualRiskScore: number;  // 1-25
  residualRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Unclamped Residual Surge Detection
  isResidualHigherThanInherent: boolean;
  residualSurgeReason?: string; // e.g. "Active unmitigated critical vulnerability or DPA violation"

  // Appetite & Quality Indicators
  riskAppetiteThreshold: number; // e.g. 8 (scores > 8 outside appetite)
  isOutsideAppetite: boolean;
  confidenceScorePercent: number; // 0-100%
  evidenceCompletenessPercent: number; // 0-100%

  // Scoring Explanations & Delta Lineage
  scoringExplanation: string;
  topRiskContributors: string[];
  previousSnapshotId?: string;
  deltaFromPrevious?: {
    scoreChange: number;
    primaryDrivers: string[];
  };
}

export interface TprmMethodology {
  id: string;
  version: string;
  name: string;
  matrixDimension: RiskMatrixDimension;
  isDefault: boolean;
  factorWeights: Record<string, number>;
  likelihoodScale: Array<{ level: number; label: string; description: string }>;
  impactScale: Array<{ level: number; label: string; description: string }>;
  severityBands: Array<{ min: number; max: number; label: string; color: string }>;
  appetitePolicy: string;
  approvedBy: string;
  effectiveDate: string;
}

// ============================================================================
// 5. DYNAMIC RISK-BASED DUE DILIGENCE & QUESTIONNAIRES
// ============================================================================

export type QuestionnaireFrameworkType =
  | 'SIG_FULL_V2026'
  | 'SIG_LITE_ANNEX_A'
  | 'CSA_CAIQ_V4'
  | 'MAS_TRM_OUTSOURCING_SEC12'
  | 'DPDP_PROCESSOR_DILIGENCE'
  | 'AI_VENDOR_SAFETY_ISO42001'
  | 'CUSTOM_ENTERPRISE_TPRM';

export interface TprmAssessmentQuestion {
  id: string;
  category:
    | 'INFORMATION_SECURITY'
    | 'PRIVACY_DATA_PROTECTION'
    | 'CLOUD_INFRASTRUCTURE'
    | 'IDENTITY_ACCESS_MGMT'
    | 'VULNERABILITY_MGMT'
    | 'INCIDENT_RESPONSE'
    | 'BCP_DR_RESILIENCE'
    | 'SECURE_SDLC'
    | 'ENCRYPTION_KEY_MGMT'
    | 'DATA_RESIDENCY'
    | 'AI_GOVERNANCE'
    | 'FOURTH_PARTY_SUBPROCESSORS'
    | 'FINANCIAL_VIABILITY'
    | 'CONTRACTUAL_SECURITY';
  questionCode: string; // e.g. "SEC-IAM-01"
  questionText: string;
  guidanceText: string;
  isMandatory: boolean;
  conditionalTriggerField?: string; // e.g. "personalDataInvolvement === true"
  weight: number; // 1-10
  mappedControlIds: string[]; // e.g. ["A.5.19", "A.8.5", "MAS-TRM-12.2"]
  evidenceRequired: boolean;
  allowedEvidenceTypes: string[];
}

export interface TprmAssessmentResponse {
  questionId: string;
  questionCode: string;
  vendorAnswer: 'YES_FULL_COMPLIANCE' | 'PARTIAL_COMPLIANCE' | 'NO_PLANNED' | 'NOT_APPLICABLE';
  vendorComments: string;
  attachedEvidenceIds: string[];
  reviewerStatus: 'ACCEPTED' | 'REJECTED' | 'FURTHER_CLARIFICATION_REQUIRED';
  reviewerComments?: string;
  findingGeneratedId?: string;
  evaluatedScorePercent: number; // 0, 50, 100
}

export interface TprmVendorAssessment {
  id: string;
  tenantId: string;
  vendorId: string;
  templateCode: QuestionnaireFrameworkType;
  title: string;
  assessmentType: 'INITIAL_ONBOARDING' | 'ANNUAL_REASSESSMENT' | 'TRIGGERED_BY_INCIDENT' | 'CONTRACT_RENEWAL';
  status:
    | 'DRAFT'
    | 'DISPATCHED_TO_VENDOR'
    | 'VENDOR_IN_PROGRESS'
    | 'SUBMITTED_FOR_REVIEW'
    | 'UNDER_AUDIT_REVIEW'
    | 'REVISION_REQUESTED'
    | 'COMPLETED_SCORED'
    | 'REJECTED';
  dispatchedAt: string;
  dueDate: string;
  submittedAt?: string;
  reviewedAt?: string;
  leadAssessor: string;
  overallScorePercent: number;
  totalQuestions: number;
  answeredQuestions: number;
  mandatoryUnansweredCount: number;
  evidenceItemsProvidedCount: number;
  findingsCount: number;
  responses: TprmAssessmentResponse[];
  version: number;
  isSampleOrDemo: boolean;
}

// ============================================================================
// 6. EVIDENCE FABRIC INTEGRATION FOR TPRM
// ============================================================================

export interface TprmEvidenceItem {
  id: string;
  tenantId: string;
  vendorId: string;
  evidenceCode: string; // e.g. "EV-TPRM-AWS-001"
  category: 'SOC_REPORT' | 'ISO_CERT' | 'PENTEST_EXEC_SUMMARY' | 'DPA_AGREEMENT' | 'BCP_TEST_REPORT' | 'SECURITY_POLICY';
  title: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256ContentHash: string;
  provenanceSource: 'VENDOR_PORTAL_UPLOAD' | 'INTEGRATION_SYNC' | 'AUDITOR_DIRECT_RECEIPT' | 'CUSTOMER_INGEST';
  collectionTimestamp: string;
  validFrom: string;
  validTo: string;
  isExpired: boolean;
  daysUntilExpiry: number;
  reviewStatus: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';
  reviewedBy?: string;
  reviewedAt?: string;
  assuranceTier: AssuranceTier;
  linkedAssessmentId?: string;
  linkedQuestionCodes: string[];
  linkedControlIds: string[];
  linkedRiskIds: string[];
  extractedMetadataSummary?: string;
  humanVerificationConfirmed: boolean;
}

// ============================================================================
// 7. CONTINUOUS MONITORING & SIGNAL INGESTION
// ============================================================================

export type MonitoringSignalCategory =
  | 'SECURITY_RATING_CHANGE'
  | 'CVE_VULNERABILITY_EXPOSURE'
  | 'PUBLIC_BREACH_NOTIFICATION'
  | 'CERTIFICATE_EXPIRING'
  | 'SANCTIONS_REGULATORY_CHANGE'
  | 'OWNERSHIP_M_AND_A_CHANGE'
  | 'SUBPROCESSOR_MODIFICATION'
  | 'SLA_SERVICE_DEGRADATION'
  | 'CONTRACT_RENEWAL_ALERT'
  | 'AUDIT_ACTION_OVERDUE';

export interface TprmMonitoringSignal {
  id: string;
  tenantId: string;
  vendorId: string;
  vendorName: string;
  category: MonitoringSignalCategory;
  sourceAttribution: 'SECURITY_SCORECARD_API' | 'BITSIGHT_FEED' | 'SHODAN_SCANNER' | 'NVD_CVE_WATCH' | 'CERT_TRANSPARENCY' | 'MANUAL_INTEL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  eventTimestamp: string;
  receivedTimestamp: string;
  headline: string;
  details: string;
  observedEvidenceSha256?: string;
  isActionable: boolean;
  reassessmentTriggered: boolean;
  status: 'NEW_UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'REMEDIATED' | 'FALSE_POSITIVE' | 'DISMISSED';
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface TprmConnectorHealth {
  connectorId: string;
  connectorName: string;
  category: string;
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'NOT_LIVE_VALIDATED' | 'SYNCING' | 'ERROR';
  lastSyncTimestamp: string;
  dataFreshnessMinutes: number;
  totalEventsIngested: number;
  deadLetterCount: number;
}

// ============================================================================
// 8. FOURTH-PARTY & CONCENTRATION RISK
// ============================================================================

export interface FourthPartyNode {
  id: string;
  name: string;
  serviceCategory: string;
  jurisdiction: string;
  isKnownDownstreamDependency: boolean; // false = 'UNKNOWN'
  directVendorsCount: number; // Number of our 3rd-party vendors relying on this 4th-party
  dependentVendorIds: string[];
  concentrationRiskRating: 'HIGH_SYSTEMIC' | 'ELEVATED' | 'MODERATE' | 'NEGLIGIBLE';
  singlePointOfFailureFlag: boolean;
  failoverPlanDocumented: boolean;
  exitSubstitutabilityDifficulty: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface ConcentrationRiskSummary {
  hyperscaleCloudConcentration: Array<{ cloudProvider: string; vendorCount: number; percentage: number }>;
  geographicJurisdictionConcentration: Array<{ country: string; vendorCount: number }>;
  singlePointsOfFailureCount: number;
  unmappedUnknownDependenciesCount: number;
  overallSupplyChainResilienceIndex: number; // 0 - 100
}

// ============================================================================
// 9. CONTRACT, SLA & DPA INTELLIGENCE
// ============================================================================

export interface TprmContractRecord {
  id: string;
  tenantId: string;
  vendorId: string;
  contractReference: string; // e.g. "MSA-2026-AWS-01"
  title: string;
  contractType: 'MASTER_SERVICES_AGREEMENT' | 'DPA_SCC' | 'SLA_ADDENDUM' | 'ORDER_FORM' | 'NDA';
  status: 'ACTIVE' | 'UNDER_RENEWAL' | 'TERMINATING' | 'DRAFT';
  effectiveDate: string;
  expiryDate: string;
  renewalNoticePeriodDays: number;
  autoRenew: boolean;
  daysUntilExpiry: number;
  governingLaw: string;

  // Key Obligation Clauses (tracked with page/section provenance)
  securityClausesSummary: string;
  dpaArticle28Compliant: boolean;
  dpdpSection8Compliant: boolean;
  incidentNotificationHoursSla: number; // e.g. 24h
  auditAndInspectionRights: 'ANNUAL_ON_SITE' | 'SOC2_REPORT_ONLY' | 'UNRESTRICTED' | 'NO_RIGHTS';
  subprocessorApprovalRequirement: 'PRIOR_WRITTEN_CONSENT' | '30_DAYS_NOTICE' | 'GENERAL_AUTHORIZATION';
  dataReturnAndDeletionCommitmentDays: number;
  slaAvailabilityPercent: number; // e.g. 99.99
  breachRemediesDefined: boolean;
  exitAssistanceObligation: boolean;
  contractDocumentSha256?: string;
  verifiedByLegal: boolean;
}

// ============================================================================
// 10. FINDINGS, CAPA & CLOSED-LOOP REMEDIATION
// ============================================================================

export interface TprmFindingItem {
  id: string;
  tenantId: string;
  vendorId: string;
  vendorName: string;
  findingCode: string; // e.g. "FND-VND-2026-004"
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'SECURITY_GAP' | 'DPA_NON_COMPLIANCE' | 'EXPIRED_CERT' | 'UNTESTED_BCP' | 'SUBPROCESSOR_UNAUTHORIZED';
  rootCause: string;
  sourceAssessmentId?: string;
  sourceQuestionCode?: string;
  identifiedDate: string;
  assignedOwner: string;
  targetRemediationDate: string;
  status:
    | 'OPEN'
    | 'REMEDIATION_PLAN_SUBMITTED'
    | 'REMEDIATION_IN_PROGRESS'
    | 'EVIDENCE_SUBMITTED'
    | 'INDEPENDENT_RETESTING'
    | 'RETEST_FAILED'
    | 'PENDING_CLOSURE_APPROVAL'
    | 'VERIFIED_CLOSED'
    | 'RISK_ACCEPTED_WITH_EXCEPTION';

  // Remediation Action & Retest Verification
  correctiveActionPlan: string;
  compensatingControls: string;
  remediationEvidenceIds: string[];
  independentRetestRequired: boolean;
  retestOutcome?: 'PASS' | 'FAIL' | 'PENDING';
  retestedBy?: string;
  retestedAt?: string;
  retestNotes?: string;
  
  // Closure & Acceptance
  closedBy?: string;
  closedAt?: string;
  riskAcceptanceApprovedBy?: string;
  riskAcceptanceExpiryDate?: string;
  linkedCapaId?: string;
}

// ============================================================================
// 11. REGULATORY FRAMEWORK MAPPINGS (CANONICAL GRC INTEGRATION)
// ============================================================================

export interface TprmRegulatoryRequirementMapping {
  frameworkCode: StandardFrameworkCode | string;
  frameworkVersion: string;
  requirementCode: string; // e.g. "A.5.19"
  requirementTitle: string;
  sectionCode: string;
  mappingType: 'EXPLICIT_REGULATORY_MANDATE' | 'CONTRACTUAL_OBLIGATION' | 'RECOMMENDED_PRACTICE';
  mappingRationale: string;
  confidenceScore: number; // 0.0 - 1.0
  unifiedControlId: string; // CTRL-TPRM-01
  governingJurisdiction: string;
}

// ============================================================================
// 12. MASTER UNIFIED VENDOR ENTITY
// ============================================================================

export interface MasterVendorRecord {
  id: string; // e.g. "vnd-aws-001"
  vendorId?: string; // Alias for id
  tenantId: string;
  vendorCode: string; // e.g. "VND-001"
  lifecycleStatus: VendorLifecycleStatus;
  approvalDecision: VendorApprovalDecision;
  approvedBy?: string;
  approvedAt?: string;
  profile: VendorOrganizationProfile;
  relationship: VendorBusinessRelationship;
  technologyAndData: VendorTechnologyAndData;
  assuranceProfile: VendorAssuranceProfile;
  latestRiskSnapshot: TprmRiskSnapshot;
  activeAssessments: TprmVendorAssessment[];
  activeContracts: TprmContractRecord[];
  evidenceItems: TprmEvidenceItem[];
  monitoringSignals: TprmMonitoringSignal[];
  findings: TprmFindingItem[];
  regulatoryMappings: TprmRegulatoryRequirementMapping[];
  createdAt: string;
  updatedAt: string;
  version: number;
}
