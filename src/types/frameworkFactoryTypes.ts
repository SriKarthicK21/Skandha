/**
 * SKANDA Enterprise Framework Factory Type Definitions
 * Path: src/types/frameworkFactoryTypes.ts
 * 
 * Invariants:
 * 1. ZERO FABRICATION - Real framework structures, statutory citations, official publisher metadata, and non-falsified mappings.
 * 2. LEGAL BOUNDARY DECOUPLING - Regulation ≠ Standard ≠ Guideline ≠ Attestation ≠ Certification.
 * 3. EXPLICIT MAPPING CONFIDENCE - EXACT, STRONG, PARTIAL, CONCEPTUAL, NOT_MAPPED, CONFLICTING with provenance tags.
 * 4. ONE CONTROL -> MANY FRAMEWORKS - Harvest/implement once, satisfy multiple framework obligations without data duplication.
 * 5. 7-LEVEL MATURITY MODEL - LEVEL_0_CATALOG_ONLY to LEVEL_6_PRODUCTION_VERIFIED.
 */

// ============================================================================
// 1. FRAMEWORK CLASSIFICATION & LEGAL BOUNDARIES
// ============================================================================

export type FrameworkClassification =
  | 'INTERNATIONAL_STANDARD'
  | 'CERTIFICATION_STANDARD'
  | 'ATTESTATION_FRAMEWORK'
  | 'REGULATION'
  | 'REGULATORY_NOTICE'
  | 'REGULATORY_GUIDELINE'
  | 'CYBERSECURITY_FRAMEWORK'
  | 'PRIVACY_FRAMEWORK'
  | 'AI_GOVERNANCE_FRAMEWORK'
  | 'PAYMENT_SECURITY_STANDARD'
  | 'CLOUD_SECURITY_STANDARD'
  | 'HEALTHCARE_STANDARD'
  | 'INDUSTRY_FRAMEWORK'
  | 'NATIONAL_FRAMEWORK'
  | 'CUSTOMER_FRAMEWORK'
  | 'CONTRACTUAL_FRAMEWORK';

export type FrameworkLegalNature =
  | 'LEGALLY_BINDING_STATUTE'
  | 'BINDING_REGULATORY_NOTICE'
  | 'NON_BINDING_GUIDELINE'
  | 'VOLUNTARY_INTERNATIONAL_STANDARD'
  | 'THIRD_PARTY_ATTESTATION_CRITERIA'
  | 'CONTRACTUAL_OBLIGATION'
  | 'INDUSTRY_BENCHMARK';

export type FrameworkStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMING_INTO_FORCE'
  | 'SUPERSEDED'
  | 'RETIRED'
  | 'UNDER_REVIEW'
  | 'SOURCE_UNAVAILABLE'
  | 'VERIFICATION_REQUIRED';

export type FrameworkVerificationStatus =
  | 'SOURCE_VERIFIED'
  | 'CONTENT_EXTRACTED'
  | 'CONTENT_HUMAN_VERIFIED'
  | 'MAPPING_REVIEWED'
  | 'APPLICABILITY_VERIFIED'
  | 'SOURCE_NOT_VERIFIED';

export type FrameworkMaturityLevel =
  | 'LEVEL_0_CATALOG_ONLY'
  | 'LEVEL_1_SOURCE_VERIFIED'
  | 'LEVEL_2_STRUCTURED'
  | 'LEVEL_3_MAPPED'
  | 'LEVEL_4_AUTOMATED'
  | 'LEVEL_5_CONTINUOUSLY_ASSURED'
  | 'LEVEL_6_PRODUCTION_VERIFIED';

export type MappingConfidenceLevel =
  | 'EXACT'
  | 'STRONG'
  | 'PARTIAL'
  | 'CONCEPTUAL'
  | 'NOT_MAPPED'
  | 'CONFLICTING'
  | 'REQUIRES_REVIEW';

export type MappingProvenance =
  | 'OFFICIAL_MAPPING'
  | 'THIRD_PARTY_MAPPING'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDATION'
  | 'UNKNOWN';

export type SourceProvenanceTier =
  | 'DIRECT_SOURCE'
  | 'OFFICIAL_SOURCE'
  | 'SOURCE_DERIVED'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDATION'
  | 'THIRD_PARTY_MAPPING'
  | 'UNKNOWN';

// ============================================================================
// 2. FRAMEWORK REGISTRY & CORE ENTITIES
// ============================================================================

export interface FrameworkRecord {
  frameworkId: string;
  frameworkCode: string; // e.g. "ISO_27001_2022", "PCI_DSS_V4_0_1"
  frameworkName: string;
  shortName: string;
  frameworkType: FrameworkClassification;
  publisher: string;
  jurisdiction: string;
  region: string;
  country?: string;
  industryOverlays: string[]; // e.g. ["FINTECH", "BANKING", "HEALTHCARE", "SAAS", "ALL"]
  version: string;
  effectiveDate: string;
  supersededDate?: string;
  status: FrameworkStatus;
  sourceUrl: string;
  sourceDocument: string;
  sourceHash: string; // SHA-256 of authoritative standard publication or canonical structure
  retrievedAt: string;
  verifiedAt: string;
  verificationStatus: FrameworkVerificationStatus;
  bindingNature: FrameworkLegalNature;
  applicabilityModel: 'MANDATORY_REGULATORY' | 'VOLUNTARY_CERTIFICATION' | 'COMMERCIAL_ATTESTATION' | 'CONTRACTUAL';
  language: string;
  officiality: 'OFFICIAL_STATUTORY' | 'OFFICIAL_STANDARD' | 'INDUSTRY_DE_FACTO' | 'CUSTOM_ENTERPRISE';
  maturityLevel: FrameworkMaturityLevel;
  totalSectionsCount: number;
  totalRequirementsCount: number;
  mappedControlsCount: number;
  automatedChecksCount: number;
  evidenceCoveragePercent: number;
  automationCoveragePercent: number;
  assuranceCoveragePercent: number;
  tags: string[];
  isCustom: boolean;
  tenantId?: string; // If custom framework, scoped to tenant
  copyrightNotice: string;
  citation: string;
}

export interface FrameworkVersionRecord {
  versionId: string;
  frameworkId: string;
  versionNumber: string;
  releaseDate: string;
  effectiveDate: string;
  sunsetDate?: string;
  supersededByVersionId?: string;
  changelogSummary: string;
  isCurrent: boolean;
  status: FrameworkStatus;
  migrationGuideAvailable: boolean;
}

export interface FrameworkSectionRecord {
  sectionId: string;
  frameworkId: string;
  versionId: string;
  sectionCode: string; // e.g. "Clause 5", "A.8", "Req 3"
  title: string;
  description: string;
  parentSectionId?: string;
  orderIndex: number;
}

export interface FrameworkRequirementRecord {
  id: string;
  frameworkId: string;
  frameworkCode: string;
  versionId: string;
  sectionId: string;
  sectionCode: string;
  requirementCode: string; // e.g. "A.5.15", "CC6.1", "AC-2", "PCI-3.4"
  title: string;
  description: string;
  sourceReference: string;
  sourceLocation: string;
  pageReference?: string;
  mandatory: boolean;
  bindingNature: FrameworkLegalNature;
  applicabilityScope: string;
  effectiveDate: string;
  supersededDate?: string;
  parentRequirementId?: string;
  childRequirementIds: string[];
  controlObjectiveIds: string[];
  mappingConfidence: MappingConfidenceLevel;
  canonicalControlIds: string[];
  evidenceRequirementSummary: string;
  testProcedureSummary: string;
  provenance: SourceProvenanceTier;
}

export interface CanonicalControl {
  controlId: string; // e.g. "CTRL-MFA-01", "CTRL-ENC-01"
  controlCode: string;
  title: string;
  description: string;
  domain: 'ACCESS_CONTROL' | 'CRYPTOGRAPHY' | 'NETWORK_SECURITY' | 'INCIDENT_RESPONSE' | 'GOVERNANCE' | 'PRIVACY' | 'AI_GOVERNANCE' | 'THIRD_PARTY_RISK' | 'BUSINESS_CONTINUITY' | 'ASSET_MANAGEMENT' | 'VULNERABILITY_MGMT' | 'LOGGING_MONITORING';
  type: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
  implementationGuidance: string;
  mappedRequirementCount: number;
  automatedCheckIds: string[];
  evidenceTypeCodes: string[];
  supportedFrameworks: string[];
}

export interface CrossFrameworkMappingEdge {
  mappingId: string;
  canonicalControlId: string;
  sourceFrameworkId: string;
  sourceRequirementCode: string;
  targetFrameworkId: string;
  targetRequirementCode: string;
  confidence: MappingConfidenceLevel;
  provenance: MappingProvenance;
  mappingRationale: string;
  verifiedBy: string;
  verifiedAt: string;
}

// ============================================================================
// 3. DYNAMIC APPLICABILITY & DISCOVERY
// ============================================================================

export interface TenantProfileForApplicability {
  tenantId: string;
  country: string;
  jurisdictions: string[];
  industry: string[];
  businessModel: 'B2B_SAAS' | 'FINTECH_BANKING' | 'HEALTHCARE_PROVIDER' | 'ECOMMERCE' | 'AI_PRODUCT' | 'ENTERPRISE_CORE' | 'CRITICAL_INFRASTRUCTURE';
  companySize: 'STARTUP' | 'GROWTH' | 'MID_MARKET' | 'ENTERPRISE' | 'GLOBAL_SYSTEMIC';
  revenueBracket?: string;
  employeeCount: number;
  dataTypesHandled: Array<
    | 'PERSONAL_DATA'
    | 'SENSITIVE_PERSONAL_DATA'
    | 'FINANCIAL_RECORDS'
    | 'PAYMENT_CARD_DATA'
    | 'PROTECTED_HEALTH_INFORMATION'
    | 'AI_TRAINING_CORPUS'
    | 'CRITICAL_INFRASTRUCTURE_TELEMETRY'
    | 'PUBLIC_SECTOR_DATA'
  >;
  usesAI: boolean;
  aiSystemClassification?: 'HIGH_RISK_EU_AI_ACT' | 'GENERAL_PURPOSE_AI' | 'LOW_MINIMAL_RISK' | 'NONE';
  usesCloud: boolean;
  cloudProviders: string[]; // ["AWS", "AZURE", "GCP"]
  processesPayments: boolean;
  handlesHealthcare: boolean;
  hasBankingLicense: boolean;
  criticalInfrastructureSector?: string;
  customerContractRequirements: string[];
  regulatoryLicenses: string[];
}

export interface FrameworkApplicabilityResult {
  frameworkId: string;
  frameworkCode: string;
  frameworkName: string;
  isApplicable: boolean;
  applicabilityReason: string;
  triggerFactors: string[];
  mandatoryLegalBasis?: string;
  recommendedImplementationPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'OPTIONAL' | 'NOT_APPLICABLE';
  confidenceScore: number; // 0 - 100
  matchingRuleId: string;
}

// ============================================================================
// 4. FRAMEWORK BUNDLE ENGINE
// ============================================================================

export type FrameworkBundleCategory =
  | 'STARTUP_SECURITY'
  | 'FINTECH_SECURITY'
  | 'AI_COMPANY'
  | 'HEALTHCARE'
  | 'GLOBAL_PRIVACY'
  | 'CRITICAL_INFRASTRUCTURE'
  | 'ENTERPRISE_INTEGRATED'
  | 'CUSTOM';

export interface FrameworkBundle {
  bundleId: string;
  bundleCode: string;
  bundleName: string;
  description: string;
  category: FrameworkBundleCategory;
  frameworkCodes: string[];
  targetAudience: string;
  isStandard: boolean;
  estimatedEffortMonths: number;
  synergyMultiplierPercent: number; // Percentage of effort reduced via control reuse
  curatedBy: string;
}

// ============================================================================
// 5. CONTROL REUSE & HARVEST-ONCE METRICS
// ============================================================================

export interface FrameworkReuseMetrics {
  tenantId: string;
  totalActiveFrameworks: number;
  totalActiveRequirements: number;
  uniqueCanonicalControlsUsed: number;
  controlReusePercent: number;
  evidenceReusePercent: number;
  testReusePercent: number;
  policyReusePercent: number;
  automationReusePercent: number;
  satisfiedRequirementsCount: number;
  topReusedControls: Array<{
    controlCode: string;
    title: string;
    supportedFrameworkCount: number;
    supportedFrameworks: string[];
  }>;
}

// ============================================================================
// 6. FRAMEWORK INGESTION PIPELINE
// ============================================================================

export type IngestionSourceFormat =
  | 'PDF'
  | 'HTML'
  | 'API_JSON'
  | 'OFFICIAL_XML'
  | 'STRUCTURED_CSV'
  | 'STRUCTURED_CATALOG'
  | 'MANUAL_CONTROLLED';

export type IngestionPipelineStage =
  | 'SOURCE'
  | 'RETRIEVE'
  | 'HASH'
  | 'PARSE'
  | 'STRUCTURE'
  | 'CLASSIFY'
  | 'NORMALIZE'
  | 'VERSION'
  | 'HUMAN_REVIEW'
  | 'PUBLISH'
  | 'MAP'
  | 'ASSURE';

export interface FrameworkIngestionJob {
  jobId: string;
  frameworkCode: string;
  sourceFormat: IngestionSourceFormat;
  sourceUrl: string;
  sourceHash: string;
  stage: IngestionPipelineStage;
  status: 'PENDING' | 'IN_PROGRESS' | 'AWAITING_REVIEW' | 'COMPLETED' | 'REJECTED';
  extractedRequirementsCount: number;
  extractedSectionsCount: number;
  parsingErrors: string[];
  reviewer?: string;
  reviewerNotes?: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// 7. FRAMEWORK VERSION MIGRATION & "WHAT CHANGED?"
// ============================================================================

export interface FrameworkMigrationPlan {
  migrationId: string;
  sourceFrameworkCode: string;
  sourceVersion: string;
  targetFrameworkCode: string;
  targetVersion: string;
  title: string;
  description: string;
  addedRequirements: Array<{ code: string; title: string; notes: string }>;
  removedRequirements: Array<{ code: string; title: string; rationale: string }>;
  modifiedRequirements: Array<{ code: string; title: string; changeSummary: string; structuralImpact: 'MINOR' | 'MODERATE' | 'MAJOR' }>;
  newControlsRequired: string[];
  deprecatedControls: string[];
  evidenceImpactSummary: string;
  testingImpactSummary: string;
  policyImpactSummary: string;
  estimatedTransitionWeeks: number;
}

// ============================================================================
// 8. FRAMEWORK COMPARISON ENGINE
// ============================================================================

export interface FrameworkComparisonMatrix {
  comparisonId: string;
  frameworkACode: string;
  frameworkAName: string;
  frameworkBCode: string;
  frameworkBName: string;
  purposeComparison: string;
  natureComparison: string;
  jurisdictionComparison: string;
  scopeComparison: string;
  requirementCountA: number;
  requirementCountB: number;
  overlappingControlsCount: number;
  controlOverlapPercent: number;
  evidenceOverlapPercent: number;
  certificationVsAttestationComparison: string;
  keyDifferences: string[];
  sharedDomainStrengths: string[];
}

// ============================================================================
// 9. FRAMEWORK CHANGE INTELLIGENCE & BLAST RADIUS
// ============================================================================

export interface FrameworkChangeRecord {
  changeId: string;
  frameworkCode: string;
  frameworkName: string;
  version: string;
  detectedAt: string;
  natureOfChange: 'REGULATORY_UPDATE' | 'NEW_EDITION' | 'INTERPRETATIVE_GUIDANCE' | 'ENFORCEMENT_CHANGE';
  headline: string;
  effectiveDate: string;
  impactMap: {
    affectedRequirementIds: string[];
    affectedControlIds: string[];
    affectedPolicyIds: string[];
    affectedEvidenceIds: string[];
    affectedCheckIds: string[];
    affectedAuditIds: string[];
    assuranceImpactSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

// ============================================================================
// 10. REUSABLE CHECK PACKS
// ============================================================================

export interface FrameworkCheckPack {
  packId: string;
  packCode: string;
  packName: string;
  domain: string;
  checkIds: string[];
  supportedFrameworkCodes: string[];
  supportedFrameworks?: string[];
  description: string;
}

// ============================================================================
// 11. AI FRAMEWORK COPILOT
// ============================================================================

export interface AIFrameworkQuery {
  tenantId: string;
  query: string;
  frameworkCodes?: string[];
}

export interface AIFrameworkResponse {
  answer: string;
  provenance: SourceProvenanceTier;
  groundedRequirementCodes: string[];
  groundedControlCodes: string[];
  sourceCitations: Array<{
    frameworkCode: string;
    requirementCode: string;
    officialPublisher: string;
    citation: string;
  }>;
  detectedGaps: string[];
  recommendedActions: string[];
  timestamp: string;
}

// ============================================================================
// 12. FRAMEWORK GAP ANALYSIS & ASSESSMENT
// ============================================================================

export type FrameworkGapStatus =
  | 'NOT_STARTED'
  | 'PLANNED'
  | 'IMPLEMENTED'
  | 'PARTIALLY_ASSURED'
  | 'ASSURED'
  | 'AT_RISK'
  | 'NOT_APPLICABLE';

export interface FrameworkRequirementGapState {
  requirementId: string;
  requirementCode: string;
  title: string;
  mandatory: boolean;
  status: FrameworkGapStatus;
  mappedControlIds: string[];
  availableEvidenceCount: number;
  missingEvidenceTypes: string[];
  testsPassingCount: number;
  testsFailingCount: number;
  openFindingsCount: number;
  assuranceGrade: 'FULL_ASSURANCE' | 'CONTINUOUS_ASSURANCE' | 'LIMITED_ASSURANCE' | 'NO_ASSURANCE';
}

export interface FrameworkAssessmentSummary {
  tenantId: string;
  frameworkCode: string;
  frameworkName: string;
  version: string;
  totalRequirements: number;
  applicableRequirements: number;
  implementedControls: number;
  evidenceAvailablePercent: number;
  testsPassingPercent: number;
  openFindings: number;
  openCapas: number;
  overallMaturityScore: number; // 0.0 - 5.0
  gapStatus: FrameworkGapStatus;
  assessedAt: string;
}
