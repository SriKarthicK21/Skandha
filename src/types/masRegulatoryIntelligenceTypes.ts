// ============================================================================
// SKANDA ENTERPRISE GRC: MAS LIVE REGULATORY INTELLIGENCE CONTRACTS
// Path: src/types/masRegulatoryIntelligenceTypes.ts
//
// Phase 23.3: Canonical Regulatory Instrument Model & Provenance Intelligence
// Aligned with official Monetary Authority of Singapore (MAS) publications:
// Banking Act (Cap. 19), FSM Act 2022, MAS TRM Guidelines 2021, Cyber Hygiene Notices,
// MAS Notice 658 (Bank Outsourcing), MAS AI Guidelines / FEAT Governance
// ============================================================================

export type RegulatoryAuthority = 'MAS' | 'HKMA' | 'FCA' | 'RBI' | 'FED' | 'ASIC';

export type SourceHealthStatus =
  | 'HEALTHY'
  | 'STALE'
  | 'UNAVAILABLE'
  | 'RETRIEVAL_FAILED'
  | 'PARSE_FAILED'
  | 'HASH_CHANGED'
  | 'VERIFICATION_REQUIRED'
  | 'AUTHENTICATION_FAILURE'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export type ParserHealthStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'UNKNOWN';

export type RegulatoryFamily =
  | 'TECHNOLOGY_RISK_MANAGEMENT'
  | 'TECHNOLOGY_RISK'
  | 'CYBER_HYGIENE'
  | 'THIRD_PARTY_RISK'
  | 'OUTSOURCING'
  | 'OPERATIONAL_RESILIENCE'
  | 'ARTIFICIAL_INTELLIGENCE'
  | 'PAYMENT_SERVICES'
  | 'DATA_PROTECTION';

export type InstrumentType =
  | 'ACT'
  | 'REGULATION'
  | 'NOTICE'
  | 'GUIDELINE'
  | 'FAQ'
  | 'CIRCULAR'
  | 'CONSULTATION_PAPER'
  | 'RESPONSE_TO_FEEDBACK'
  | 'INFORMATION_PAPER'
  | 'ADVISORY'
  | 'DIRECTIVE';

export type BindingNature =
  | 'BINDING'
  | 'SUPERVISORY_EXPECTATION'
  | 'NON_BINDING_GUIDANCE'
  | 'CONSULTATIVE'
  | 'INFORMATIONAL'
  | 'HISTORICAL';

export type RegulatoryStatus =
  | 'NOT_YET_PUBLISHED'
  | 'PUBLISHED_NOT_EFFECTIVE'
  | 'COMING_INTO_FORCE'
  | 'ACTIVE'
  | 'AMENDED'
  | 'SUPERSEDED'
  | 'CANCELLED'
  | 'HISTORICAL'
  | 'PROPOSED'
  | 'CONSULTATION'
  | 'GUIDANCE'
  | 'FAQ'
  | 'NOT_YET_EFFECTIVE';

export type FinancialInstitutionType =
  | 'BANK'
  | 'DIRECT_INSURER'
  | 'INSURER'
  | 'INSURANCE_AGENT'
  | 'INSURANCE_BROKER'
  | 'CREDIT_CARD_ISSUER'
  | 'FINANCE_COMPANY'
  | 'MERCHANT_BANK'
  | 'PAYMENT_SERVICE_PROVIDER'
  | 'DIGITAL_TOKEN_SERVICE'
  | 'MONEY_BROKER'
  | 'CREDIT_BUREAU'
  | 'CAPITAL_MARKETS_SERVICES'
  | 'FINANCIAL_ADVISER'
  | 'TRUST_COMPANY'
  | 'ALL_FINANCIAL_INSTITUTIONS';

export type ApplicabilityStatus =
  | 'APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'CONDITIONAL'
  | 'REQUIRES_REVIEW'
  | 'HISTORICAL'
  | 'NOT_YET_EFFECTIVE'
  | 'COMING_INTO_FORCE';

export type ChangeEventType =
  | 'NEW'
  | 'MODIFIED'
  | 'REMOVED'
  | 'RENAMED'
  | 'EFFECTIVE_DATE_CHANGED'
  | 'APPLICABILITY_CHANGED'
  | 'STATUS_CHANGED'
  | 'SUPERSEDED'
  | 'NEW_INTERPRETATION'
  | 'NEW_NOTICE'
  | 'NOTICE_AMENDED'
  | 'NOTICE_CANCELLED'
  | 'NOTICE_SUPERSEDED'
  | 'NEW_REQUIREMENT'
  | 'REQUIREMENT_CHANGED'
  | 'FAQ_UPDATED'
  | 'GUIDANCE_UPDATED'
  | 'CONSULTATION_PUBLISHED';

export type RegulatoryDomainEventType =
  | 'REGULATORY_SOURCE_RETRIEVED'
  | 'REGULATORY_SOURCE_FAILED'
  | 'REGULATORY_VERSION_DETECTED'
  | 'REGULATORY_CONTENT_CHANGED'
  | 'REGULATORY_VERSION_VERIFIED'
  | 'REGULATORY_REQUIREMENT_CHANGED'
  | 'REGULATORY_EFFECTIVE_DATE_CHANGED'
  | 'REGULATORY_APPLICABILITY_CHANGED'
  | 'REGULATORY_IMPACT_IDENTIFIED'
  | 'REGULATORY_CUSTOMER_ACTION_REQUIRED'
  | 'REGULATORY_REVIEW_COMPLETED';

export type ImpactLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type RequirementType =
  | 'MANDATORY_OBLIGATION'
  | 'SUPERVISORY_PRINCIPLE'
  | 'REPORTING_OBLIGATION'
  | 'PROHIBITION'
  | 'RECOMMENDATION';

export type SourceClassification =
  | 'DIRECT_SOURCE'
  | 'SOURCE_DERIVED'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDED_CONTROL'
  | 'UNKNOWN';

export type VerificationStatus =
  | 'ENGINEERING_VERIFIED'
  | 'SOURCE_VERIFIED'
  | 'CONTENT_EXTRACTED'
  | 'CONTENT_VERIFIED'
  | 'APPLICABILITY_VERIFIED'
  | 'INTERPRETATION_REVIEWED'
  | 'LIVE_SOURCE_VERIFIED'
  | 'REGULATORY_CHANGE_VERIFIED'
  | 'VERIFIED_REGULATORY_VERSION'
  | 'PRODUCTION_CANDIDATE'
  | 'GO_LIVE_READY'
  | 'PARTIALLY_VERIFIED'
  | 'NOT_VERIFIED'
  | 'BLOCKED'
  | 'OFFICIALLY_VERIFIED'
  | 'MAS_AUTHORITATIVE_SOURCE'
  | 'PROPOSED_DRAFT'
  | 'UNVERIFIED';

export type ReviewGateStatus =
  | 'REGULATORY_REVIEW_REQUIRED'
  | 'VERIFIED_REGULATORY_VERSION'
  | 'REJECTED';

export interface RegulatoryRequirement {
  requirementId: string;
  instrumentId?: string;
  versionId?: string;
  sourcePage?: string;
  sourceSection?: string;
  sourceParagraph?: string;
  requirementText?: string;
  requirementType?: RequirementType;
  bindingNature?: BindingNature;
  applicability?: {
    entityTypes?: FinancialInstitutionType[];
    requiresCriticalSystems?: boolean;
    requiresCloudUsage?: boolean;
    requiresOnlineServices?: boolean;
    requiresOutsourcing?: boolean;
    requiresGenAIOrLLMs?: boolean;
  };
  effectiveFrom?: string;
  effectiveTo?: string;
  interpretation?: string;
  interpretationConfidence?: number;
  sourceClassification?: SourceClassification;
  skandaRecommendedControls?: string[];

  // Field backward compatibility
  sectionCode: string; // e.g. "Section 4.1", "Clause 4(a)"
  title: string;
  description: string;
  mandatory: boolean;
  effectiveDate: string;
  applicabilityCriteria?: {
    entityTypes?: FinancialInstitutionType[];
    requiresCriticalSystems?: boolean;
    requiresCloudUsage?: boolean;
    requiresOnlineServices?: boolean;
    requiresOutsourcing?: boolean;
    requiresGenAIOrLLMs?: boolean;
  };
  mappedControlCodes: string[]; // Maps to Canonical GRC Controls, e.g. ['MAS-TRM-8.1', 'CTRL-IAM-01']
  mappedPolicyCodes: string[];  // e.g. ['POL-SEC-01', 'POL-IAM-02']
  mappedRiskCodes: string[];    // e.g. ['RSK-CYBER-01', 'RSK-OPS-03']
  mappedProcesses?: string[];
  mappedEvidenceTypes?: string[];
  mappedTests?: string[];
  mappedFindings?: string[];
  mappedCAPAs?: string[];
  mappedOwners?: string[];
}

export interface RegulatoryVersion {
  regulator?: string;
  jurisdiction?: string;
  instrumentId?: string;
  instrumentNumber?: string;
  instrumentType?: InstrumentType;
  bindingNature?: BindingNature;
  issuingAuthority?: string;
  publicationDate?: string;
  expiryDate?: string;
  sourceDocumentHash?: string;
  verificationMethod?: string;
  sourceDocumentVersion?: string;
  sourcePageReferences?: string[];
  predecessor?: string;
  successor?: string;

  versionId: string;
  noticeId: string;
  noticeNumber: string; // e.g. "FSM-N05", "FSM-N06", "MAS Notice 658", "TRMN 644", "CHN 655"
  officialDocumentTitle: string;
  versionTitle: string;
  authority: RegulatoryAuthority;
  regulatoryFamily: RegulatoryFamily;
  sector: string;
  FIType: FinancialInstitutionType;
  entityType: FinancialInstitutionType;
  status: RegulatoryStatus;
  publishedDate: string;
  effectiveDate: string;
  supersededDate?: string;
  sourceUrl: string;
  documentHash: string; // SHA-256 of official document artifact
  retrievedAt: string;
  verifiedAt: string;
  verificationStatus: VerificationStatus;
  contentHash: string;
  predecessorVersionId?: string;
  successorVersionId?: string;
  previousVersionId?: string;
  changeType?: 'INITIAL_PROMULGATION' | 'MAJOR_REVISION' | 'STATUTORY_AMENDMENT' | 'EDITORIAL' | 'SUPERSEDED_BY_REVISION';
  changeSummary?: string;
  predecessorNoticeNumber?: string;
  successorNoticeNumber?: string; // For superseded notices (e.g. TRMN 644 -> FSM-N05, CHN 655 -> FSM-N06)
  requirements: RegulatoryRequirement[];
}

export interface RegulatoryNotice360 {
  regulator?: string;
  jurisdiction?: string;
  instrumentId?: string;
  instrumentNumber?: string;
  instrumentType?: InstrumentType;
  bindingNature?: BindingNature;
  issuingAuthority?: string;
  publicationDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  supersededDate?: string;
  sourceDocumentHash?: string;
  retrievedAt?: string;
  verifiedAt?: string;
  verificationStatus?: VerificationStatus;
  verificationMethod?: string;
  sourceDocumentVersion?: string;
  sourcePageReferences?: string[];
  predecessor?: string;
  successor?: string;

  noticeId: string;
  noticeNumber: string;
  title: string;
  officialDocumentTitle?: string;
  shortTitle: string;
  authority: RegulatoryAuthority;
  family: RegulatoryFamily;
  targetSector: string;
  governingAct: string; // e.g. "Banking Act (Cap. 19)", "Financial Services and Markets Act 2022"
  currentStatus: RegulatoryStatus;
  isHistorical: boolean;
  predecessorNoticeId?: string;
  predecessorNoticeNumber?: string;
  successorNoticeId?: string;
  successorNoticeNumber?: string;
  officialSourceUrl: string;
  lastRetrievedAt: string;
  currentVersionId: string;
  currentVersion: RegulatoryVersion;
  historicalVersions: RegulatoryVersion[];
  applicableEntityTypes: FinancialInstitutionType[];
  totalRequirementsCount: number;
  mandatoryRequirementsCount: number;
  mappedCanonicalControlsCount: number;
  mappedPoliciesCount: number;
  mappedRisksCount: number;
}

export interface CustomerFinancialProfile {
  tenantId: string;
  institutionName: string;
  institutionType: FinancialInstitutionType;
  licenceType: string; // e.g. "Full Bank", "Wholesale Bank", "Major Payment Institution (MPI)", "CMS Licence"
  sector: 'BANKING' | 'WEALTH_MANAGEMENT' | 'INSURANCE' | 'PAYMENTS' | 'CAPITAL_MARKETS' | 'DIGITAL_ASSETS';
  operatesCriticalSystems: boolean;
  criticalSystemsList?: string[];
  usesPublicCloud: boolean;
  cloudProviders?: ('AWS' | 'AZURE' | 'GCP' | 'ALIBABA')[];
  providesOnlineFinancialServices: boolean;
  operatesCustomerFacingApis: boolean;
  usesGenAIOrLLMs: boolean;
  hasOutsourcedMaterialServices: boolean;
}

export interface TenantNoticeApplicability {
  tenantId: string;
  noticeId: string;
  noticeNumber: string;
  title: string;
  applicabilityStatus: ApplicabilityStatus;
  applicabilityRationale: string;
  evaluationTimestamp: string;
  evaluatedCriteria: {
    institutionTypeMatched: boolean;
    licenceTypeMatched: boolean;
    criticalSystemsTriggered: boolean;
    cloudUsageTriggered: boolean;
    onlineServicesTriggered: boolean;
  };
  applicableRequirementsCount: number;
  actionRequired: boolean;
}

export interface RequirementDiff {
  requirementId: string;
  sectionCode: string;
  title: string;
  diffType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
  oldText?: string;
  newText?: string;
  impactLevel: ImpactLevel;
  affectedControls: string[];
  affectedPolicies: string[];
  affectedRisks: string[];
  affectedEvidenceTypes: string[];
  affectedProcesses?: string[];
  affectedTests?: string[];
  affectedFindings?: string[];
  affectedCAPAs?: string[];
  affectedOwners?: string[];
}

export interface RegulatoryChangeEvent {
  eventId: string;
  noticeId: string;
  noticeNumber: string;
  title: string;
  authority: RegulatoryAuthority;
  family: RegulatoryFamily;
  eventType: ChangeEventType;
  publishedDate: string;
  effectiveDate: string;
  oldVersionId?: string;
  newVersionId: string;
  changeSummary: string;
  impactLevel: ImpactLevel;
  affectedEntityTypes: FinancialInstitutionType[];
  requirementDiffs: RequirementDiff[];
  sourceUrl: string;
  documentSha256: string;
  detectedAt: string;
  effectiveAt?: string;
  impactScope?: string;
  source?: string;
  acknowledgedByTenants?: string[];
}

export interface BlastRadiusTrace {
  requirementId: string;
  affectedControls: string[];
  affectedRisks: string[];
  affectedPolicies: string[];
  affectedProcesses: string[];
  affectedEvidence: string[];
  affectedTests: string[];
  affectedFindings: string[];
  affectedCAPAs: string[];
  affectedOwners: string[];
}

export interface ProvenanceWhyTrace {
  tenantId: string;
  institutionProfile: {
    institutionName: string;
    institutionType: FinancialInstitutionType;
    licenceType: string;
  };
  fiClassification: FinancialInstitutionType;
  regulatoryFamily: RegulatoryFamily;
  instrumentId: string;
  instrumentNumber: string;
  instrumentTitle: string;
  instrumentType: InstrumentType;
  versionId: string;
  officialSourceUrl: string;
  sourceDocumentHash: string;
  publicationDate: string;
  effectiveDate: string;
  bindingNature: BindingNature;
  verificationStatus: VerificationStatus;
  requirementId: string;
  requirementText: string;
  sourceClassification: SourceClassification;
  applicabilityRule: string;
  affectedControls: string[];
  fullLineageChain: string[];
}

export interface TenantImpactAssessment {
  assessmentId: string;
  tenantId: string;
  eventId: string;
  noticeId: string;
  noticeNumber: string;
  noticeTitle: string;
  assessedAt: string;
  overallImpactLevel: ImpactLevel;
  applicabilityDecision: ApplicabilityStatus;
  applicabilityReason: string;
  affectedControlsCount: number;
  affectedPoliciesCount: number;
  affectedRisksCount: number;
  affectedEvidenceCount: number;
  affectedControlCodes: string[];
  affectedPolicyCodes: string[];
  affectedRiskCodes: string[];
  affectedProcesses: string[];
  affectedEvidence: string[];
  affectedTests: string[];
  affectedFindings: string[];
  affectedCAPAs: string[];
  affectedOwners: string[];
  blastRadiusTraces?: BlastRadiusTrace[];
  requiredRemediationActions: {
    actionId: string;
    title: string;
    description: string;
    targetType: 'CONTROL_REASSESSMENT' | 'POLICY_UPDATE' | 'EVIDENCE_REFRESH' | 'RISK_TREATMENT' | 'SME_INTERVIEW' | 'PROCESS_REVISION' | 'TEST_EXECUTION' | 'CAPA_CREATION';
    targetCode: string;
    assignedRole: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate: string;
  }[];
  regulatoryAssurancePosture: 'ALIGNED' | 'ACTION_REQUIRED' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
}

export interface RegulatoryWatchSubscription {
  subscriptionId: string;
  tenantId: string;
  subscribedBy: string;
  watchNoticeIds: string[];
  watchFamilies: RegulatoryFamily[];
  watchEntityTypes: FinancialInstitutionType[];
  minAlertLevel: ImpactLevel;
  emailNotificationsEnabled: boolean;
  webhookStreamingEnabled: boolean;
  createdAt: string;
}

export interface AIRegulatoryCopilotQuery {
  tenantId: string;
  query: string;
  focusedNoticeNumber?: string;
  includeHistorical?: boolean;
}

export interface AIRegulatoryCopilotResponse {
  answer: string;
  authority: RegulatoryAuthority;
  sourceNoticeNumber: string;
  sourceNoticeTitle: string;
  versionId: string;
  sectionReference: string;
  officialSourceUrl: string;
  documentHash: string;
  confidenceScore: number; // 0.00 to 1.00
  applicabilityStatus: ApplicabilityStatus;
  lastVerifiedAt: string;
  sourceClassification: SourceClassification;
  skandaRecommendedControls?: string[];
  interpretationNote?: string;
  relatedCanonicalControls: string[];
  relatedCanonicalPolicies: string[];
}

export interface RegulatorySourceMetadata {
  sourceId: string;
  authority: RegulatoryAuthority;
  authorityFullName: string;
  baseUrl: string;
  lastSyncTimestamp: string;
  syncFrequencyHours: number;
  syncStatus: 'HEALTHY' | 'SYNCING' | 'DEGRADED';
  totalNoticesIndexed: number;
  activeNoticesCount: number;
  historicalNoticesCount: number;
  consultationsCount: number;
  guidelinesCount: number;
  sha256VerificationPassed: boolean;
}

export interface MonitoredSourceRegistryEntry {
  sourceId: string;
  regulator: RegulatoryAuthority;
  jurisdiction: string;
  sourceType: InstrumentType;
  officialUrl: string;
  sourceName: string;
  expectedContentType: string;
  pollingFrequency: string; // e.g. "EVERY_6_HOURS"
  lastSuccessfulRetrieval: string;
  lastFailedRetrieval?: string;
  lastContentChange: string;
  lastVerification: string;
  currentHash: string;
  previousHash?: string;
  currentVersion: string;
  previousVersion?: string;
  sourceHealth: SourceHealthStatus;
  parserHealth: ParserHealthStatus;
  verificationStatus: VerificationStatus;
  nextScheduledCheck: string;
  retryCount: number;
  lastError?: string;
  allowedDomains: string[];
  maxSizeBytes: number;
  isSimulated?: boolean;
}

export interface RegulatoryReviewGate {
  reviewId: string;
  noticeNumber: string;
  candidateVersionId: string;
  candidateHash: string;
  sourceUrl: string;
  status: ReviewGateStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  checklist: {
    officialSourceVerified: boolean;
    versionLineageVerified: boolean;
    requirementExtractionVerified: boolean;
    effectiveDateVerified: boolean;
    bindingNatureVerified: boolean;
    applicabilityVerified: boolean;
    controlMappingVerified: boolean;
  };
  createdAt: string;
}

export interface RegulatoryAlert {
  alertId: string;
  tenantId: string;
  regulatoryVersionId: string;
  instrumentId: string;
  noticeNumber: string;
  title: string;
  description: string;
  severity: ImpactLevel;
  calculatedAt: string;
  effectiveDateProximityDays: number;
  affectedControlsCount: number;
  regulatoryForce: BindingNature;
  sectorApplicable: boolean;
  isAcknowledged: boolean;
  actionRequired: boolean;
  createdDate: string;
}

export interface RegulatoryCalendarItem {
  itemId: string;
  instrumentId: string;
  noticeNumber: string;
  title: string;
  family: RegulatoryFamily;
  fiType: FinancialInstitutionType;
  publishedDate: string;
  effectiveDate: string;
  supersededDate?: string;
  status: RegulatoryStatus;
  bindingNature: BindingNature;
  officialSourceUrl: string;
  daysUntilEffective: number;
}

export interface RegulatorySourceTelemetryMetrics {
  regulatory_source_success_rate: number;
  regulatory_source_freshness_hours: number;
  regulatory_change_detection_latency_ms: number;
  regulatory_verification_latency_ms: number;
  regulatory_impact_latency_ms: number;
  regulatory_notification_latency_ms: number;
  total_sources_monitored: number;
  healthy_sources_count: number;
  stale_sources_count: number;
  unavailable_sources_count: number;
  verification_required_count: number;
}

export type DrillScenarioType =
  | 'NEW_VERSION_DETECTION'
  | 'HUMAN_APPROVAL_WORKFLOW'
  | 'REQUIREMENT_DIFF_EXTRACTION'
  | 'EFFECTIVE_DATE_EVALUATION'
  | 'MULTI_FI_APPLICABILITY'
  | 'CUSTOMER_BLAST_RADIUS'
  | 'CUSTOMER_ALERT_GENERATION'
  | 'NO_ALERT_BEFORE_APPROVAL'
  | 'SOURCE_FAILURE_HANDLING'
  | 'PARSER_FAILURE_HANDLING'
  | 'HASH_CHANGE_DETECTION'
  | 'DUPLICATE_INGESTION_IDEMPOTENCY'
  | 'TENANT_ISOLATION_ASSURANCE'
  | 'AI_COPILOT_GROUNDING'
  | 'SHOW_ME_WHY_PROVENANCE'
  | 'SHOW_ME_WHAT_CHANGED_DIFF'
  | 'TAMPER_EVIDENT_AUDIT_TRAIL'
  | 'OUTAGE_RECOVERY_LIFECYCLE'
  | 'SCHEDULER_IDEMPOTENCY'
  | 'ROLLBACK_SAFETY_ON_REJECTION'
  | 'SECURITY_SSRF_PROBE';

export interface DrillStageResult {
  stageNumber: number;
  stageName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  details: string;
  artifacts?: Record<string, any>;
}

export interface ControlledChangeDrillSpec {
  drillId: string;
  drillTitle: string;
  scenarioType: DrillScenarioType;
  noticeNumber: string;
  baseVersionId: string;
  candidateVersionId: string;
  simulatedPublicationDate: string;
  simulatedEffectiveDate: string;
  simulatedDocumentHash: string;
  simulatedContent: string;
  reviewer: string;
  reviewerRole: string;
  isApprovalExpected: boolean;
  rejectionReason?: string;
  targetTenantProfile: CustomerFinancialProfile;
  expectedApplicability: ApplicabilityStatus;
  expectedImpactLevel: ImpactLevel;
  modifiedRequirements: Array<{
    requirementId: string;
    sectionCode: string;
    title: string;
    diffType: 'ADDED' | 'MODIFIED' | 'REMOVED' | 'UNCHANGED';
    oldText?: string;
    newText?: string;
    mandatory: boolean;
    mappedControls: string[];
    mappedPolicies: string[];
    mappedRisks: string[];
  }>;
}

export interface ControlledDrillExecutionReport {
  drillId: string;
  drillTitle: string;
  scenarioType: DrillScenarioType;
  classification: 'ENGINEERING_SIMULATION';
  executedAt: string;
  totalDurationMs: number;
  overallStatus: 'PASSED' | 'FAILED';
  stages: DrillStageResult[];
  summary: {
    sourceVerified: boolean;
    hashComputed: string;
    candidateStaged: boolean;
    reviewStatus: string;
    diffsProduced: number;
    effectiveDateStatus: RegulatoryStatus;
    applicabilityResolved: ApplicabilityStatus;
    affectedControlsCount: number;
    alertsEmitted: number;
    remediationTasksCreated: number;
    auditEventsRecorded: number;
    tenantIsolated: boolean;
  };
}


