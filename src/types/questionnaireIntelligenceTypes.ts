// ============================================================================
// SKANDA SECURITY QUESTIONNAIRE INTELLIGENCE ENGINE: CANONICAL TYPE MODEL
// Path: src/types/questionnaireIntelligenceTypes.ts
//
// Domain model for inbound security / vendor / customer / due-diligence
// questionnaires. Distinct from onboardingTypes (internal certification intake).
//
// Design invariants encoded here:
//  - Every generated answer carries evidence citations + sufficiency state.
//  - No state may move to APPROVED without a recorded human approval.
//  - No answer may be published externally without disclosure authorisation.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. INGESTION
// ---------------------------------------------------------------------------

export type QuestionnaireSourceFormat = 'XLSX' | 'CSV' | 'DOCX' | 'PDF';

export type ExtractionConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNREADABLE';

export interface SourceArtifactRef {
  artifactId: string;
  fileName: string;
  format: QuestionnaireSourceFormat;
  fileSizeBytes: number;
  mimeType: string;
  sha256ContentHash: string;
  storedLocator: string;
  uploadedBy: string;
  uploadedAt: string;
}

/** Exact location in the uploaded artifact from which a question was read. */
export interface SourceLocation {
  worksheet?: string;
  worksheetIndex?: number;
  rowNumber?: number;
  sectionLabel?: string;
  questionRef?: string;
  /** Cell reference (A1 notation) holding the question text. */
  questionCell?: string;
  /** Cell reference holding the mapped response field. May be null when unresolved. */
  responseCell?: string;
  pageNumber?: number;
  tableIndex?: number;
  paragraphIndex?: number;
  /** Raw fragment retained for reviewer correction and audit. */
  rawFragment?: string;
}

export type QuestionResponseType =
  | 'YES_NO'
  | 'YES_NO_PARTIAL'
  | 'MULTIPLE_CHOICE'
  | 'MULTI_SELECT'
  | 'TEXT'
  | 'NUMERIC'
  | 'DATE'
  | 'EVIDENCE_ATTACHMENT'
  | 'NOT_APPLICABLE_WITH_JUSTIFICATION'
  | 'UNKNOWN_FREE_FORM';

export interface ColumnMapping {
  worksheet: string;
  questionColumn: string;
  responseColumn: string | null;
  questionIdColumn?: string | null;
  sectionColumn?: string | null;
  mandatoryColumn?: string | null;
  instructionColumn?: string | null;
  evidenceColumn?: string | null;
  commentColumn?: string | null;
  headerRow: number;
  /** 0..1 heuristic confidence; reviewer may override. */
  confidence: number;
  /** Human-readable reasons the mapping was selected or flagged. */
  rationale: string[];
  ambiguous: boolean;
  ambiguousReason?: string;
  /** True when this mapping was set by a human reviewer rather than inference. */
  humanConfirmed: boolean;
}

export interface ExtractedQuestion {
  id: string;
  questionnaireId: string;
  tenantId: string;
  sectionName: string;
  sectionOrder: number;
  /** Identifier as printed in the source document (may be null). */
  questionIdentifier: string | null;
  originalText: string;
  order: number;
  responseType: QuestionResponseType;
  answerOptions: string[];
  mandatory: boolean;
  instructions?: string;
  existingResponse?: string;
  evidenceRequirement?: string;
  comments?: string;
  sourceLocation: SourceLocation;
  /** 0..100 heuristic extraction confidence (estimate, not a probability). */
  extractionConfidence: number;
  confidenceBand: ExtractionConfidenceBand;
  extractionWarnings: string[];
  requiresHumanCorrection: boolean;
}

export interface ExtractionSummary {
  sourceArtifact: SourceArtifactRef;
  format: QuestionnaireSourceFormat;
  documentsDetected: number;
  worksheetsProcessed: string[];
  worksheetsPreservedUnmodified: string[];
  questionsExtracted: number;
  questionsRequiringCorrection: number;
  ambiguousStructures: string[];
  unmappedResponseFields: number;
  unreadableRegions: string[];
  warnings: string[];
  columnMappings: ColumnMapping[];
  detectedTitle?: string;
  detectedRequestingOrganization?: string;
  detectedQuestionnaireIdentifier?: string;
  extractionConfidence: number;
  confidenceBand: ExtractionConfidenceBand;
  /** Never claim perfect extraction without measurement. */
  accuracyDisclaimer: string;
}

export interface RawIngestedQuestion {
  sectionName: string;
  sectionOrder: number;
  questionIdentifier: string | null;
  originalText: string;
  order: number;
  answerOptions: string[];
  mandatory: boolean;
  instructions?: string;
  existingResponse?: string;
  evidenceRequirement?: string;
  comments?: string;
  sourceLocation: SourceLocation;
  warnings: string[];
}

export interface RawIngestionResult {
  questions: RawIngestedQuestion[];
  columnMappings: ColumnMapping[];
  summary: Omit<ExtractionSummary, 'sourceArtifact' | 'questionsExtracted' | 'questionsRequiringCorrection' | 'accuracyDisclaimer'>;
}

// ---------------------------------------------------------------------------
// 2. QUESTION INTELLIGENCE
// ---------------------------------------------------------------------------

export type QuestionCategory =
  | 'INFORMATION_SECURITY'
  | 'IDENTITY_AND_ACCESS_MANAGEMENT'
  | 'PRIVILEGED_ACCESS'
  | 'NETWORK_SECURITY'
  | 'CLOUD_SECURITY'
  | 'VULNERABILITY_MANAGEMENT'
  | 'INCIDENT_RESPONSE'
  | 'BUSINESS_CONTINUITY'
  | 'DISASTER_RECOVERY'
  | 'ENCRYPTION'
  | 'KEY_MANAGEMENT'
  | 'DATA_PROTECTION'
  | 'PRIVACY'
  | 'DATA_RETENTION'
  | 'DATA_DELETION'
  | 'SECURE_DEVELOPMENT'
  | 'LOGGING_AND_MONITORING'
  | 'ASSET_MANAGEMENT'
  | 'THIRD_PARTY_RISK'
  | 'PHYSICAL_SECURITY'
  | 'HUMAN_RESOURCES_SECURITY'
  | 'AI_GOVERNANCE'
  | 'REGULATORY_COMPLIANCE'
  | 'CERTIFICATIONS'
  | 'ORGANIZATIONAL_INFORMATION';

/** A single independently answerable claim inside a (possibly multi-part) question. */
export interface AnswerableClaim {
  claimId: string;
  claimText: string;
  category: QuestionCategory;
  /** True when this claim must be confirmed by a human owner before use. */
  requiresOwnerConfirmation: boolean;
  specialistRole?: string;
}

export interface RequirementAnalysis {
  id: string;
  questionnaireId: string;
  questionId: string;
  tenantId: string;
  originalWording: string;
  normalizedInterpretation: string;
  primaryCategory: QuestionCategory;
  secondaryCategories: QuestionCategory[];
  underlyingRequirement: string;
  expectedResponseType: QuestionResponseType;
  frameworkMappings: Array<{ frameworkCode: string; requirementCode: string; label: string }>;
  relevantControlCodes: string[];
  requiredEvidenceKinds: string[];
  applicabilityConditions: string[];
  isMultiPart: boolean;
  claims: AnswerableClaim[];
  clarificationNeeded: boolean;
  clarificationReason?: string;
  specialistApprovalRequired: boolean;
  specialistRole?: string;
  /** 0..100 heuristic classification confidence (documented estimate). */
  classificationConfidence: number;
  classificationMethod: string;
  /** Shared knowledge record key for semantically equivalent questions. */
  knowledgeKey: string;
}

// ---------------------------------------------------------------------------
// 3. EVIDENCE RETRIEVAL & PROVENANCE
// ---------------------------------------------------------------------------

export type EvidenceSourceType =
  | 'APPROVED_POLICY'
  | 'APPROVED_PROCEDURE'
  | 'SECURITY_STANDARD'
  | 'FRAMEWORK_REQUIREMENT'
  | 'CONTROL_DEFINITION'
  | 'CONTROL_IMPLEMENTATION'
  | 'CONTROL_TEST_RESULT'
  | 'EVIDENCE_RECORD'
  | 'EVIDENCE_ASSERTION'
  | 'RISK_ASSESSMENT'
  | 'FINDING'
  | 'CAPA_RECORD'
  | 'CERTIFICATION'
  | 'APPROVED_ORGANIZATIONAL_FACT'
  | 'APPROVED_PRIOR_ANSWER'
  | 'APPROVED_TRUST_CENTER_DISCLOSURE'
  | 'REGULATORY_SOURCE';

export interface EvidenceCitation {
  citationId: string;
  sourceId: string;
  sourceType: EvidenceSourceType;
  sourceTitle: string;
  sourceVersion: string;
  sourceLocation: string;
  evidenceOwner: string;
  /** Status as recorded in SKANDA (APPROVED, VERIFIED, PENDING, EXPIRED, DRAFT...). */
  sourceStatus: string;
  collectedAt?: string;
  expiresAt?: string;
  freshnessStatus: 'CURRENT' | 'DUE_SOON' | 'STALE' | 'EXPIRED' | 'UNKNOWN';
  freshnessDaysRemaining?: number;
  organizationalScope: string[];
  applicableControlCode?: string;
  applicableFrameworkCode?: string;
  retrievedAt: string;
  /** Reliability weight used by the sufficiency classifier. */
  sourceReliability: 'PRIMARY_VERIFIED' | 'APPROVED_DOCUMENT' | 'SECONDARY' | 'LOW_CONFIDENCE';
  /** A policy alone never proves a control operates. */
  provesOperatingEffectiveness: boolean;
  excerpt: string;
}

export interface RetrievalQuery {
  tenantId: string;
  questionId: string;
  normalizedRequirement: string;
  categories: QuestionCategory[];
  controlCodes: string[];
  frameworkCodes: string[];
  requiredEvidenceKinds: string[];
  organizationalScope?: string[];
  /** Deterministic evaluation clock (ISO). Required for reproducible freshness. */
  asOf: string;
}

export interface RetrievalResult {
  citations: EvidenceCitation[];
  /** Human-readable reasons sources were included/excluded. */
  retrievalTrace: string[];
  appliedFilters: string[];
  degradedSources: Array<{ sourceType: EvidenceSourceType; reason: string }>;
  partialFailure: boolean;
}

// ---------------------------------------------------------------------------
// 4. CLAIM VALIDATION
// ---------------------------------------------------------------------------

export type ClaimSupportState =
  | 'SUPPORTED_BY_CURRENT_EVIDENCE'
  | 'PARTIALLY_SUPPORTED'
  | 'CONTRADICTED_BY_EVIDENCE'
  | 'SUPPORTED_BY_APPROVED_FACT'
  | 'SUPPORTED_BY_POLICY_ONLY'
  | 'UNSUPPORTED'
  | 'EXPIRED_OR_STALE'
  | 'OUTSIDE_AVAILABLE_SCOPE'
  | 'AWAITING_HUMAN_VERIFICATION';

export interface ValidatedClaim {
  claimId: string;
  claimText: string;
  supportState: ClaimSupportState;
  supportingCitationIds: string[];
  contradictingCitationIds: string[];
  missingEvidence: string[];
  explanation: string;
}

export interface ClaimValidationResult {
  claims: ValidatedClaim[];
  /** True when any claim is contradicted or unsupported — overrides any score. */
  hasCriticalUnsupportedClaim: boolean;
  hasContradiction: boolean;
  worstState: ClaimSupportState;
}

// ---------------------------------------------------------------------------
// 5. ANSWER DRAFT
// ---------------------------------------------------------------------------

export type AnswerDisposition =
  | 'VERIFIED_YES'
  | 'VERIFIED_NO'
  /**
   * Extension used ONLY for open-ended questions (text / numeric / date /
   * evidence-attachment) whose evidence-backed statement is fully verified.
   * Present so an open question is never misrepresented as a literal "Yes".
   */
  | 'VERIFIED_OPEN_RESPONSE'
  | 'PARTIALLY_IMPLEMENTED'
  | 'NOT_APPLICABLE_WITH_JUSTIFICATION'
  | 'UNKNOWN'
  | 'INSUFFICIENT_EVIDENCE'
  | 'AWAITING_OWNER_CONFIRMATION'
  | 'REQUIRES_SPECIALIST_REVIEW';

export type EvidenceSufficiency =
  | 'SUFFICIENT'
  | 'PARTIAL'
  | 'INSUFFICIENT'
  | 'CONTRADICTED'
  | 'NOT_APPLICABLE';

export type AnswerStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'BLOCKED_UNSUPPORTED'
  /**
   * Set by the continuous-assurance engine when a source the answer depends on
   * changed (control state, control test, evidence freshness/revocation,
   * superseded policy, integration health, scope, or approval validity).
   * The previously approved wording is preserved, the answer is no longer
   * exportable as approved, and it must pass a fresh review.
   */
  | 'REVALIDATION_REQUIRED';

export interface MissingInformationItem {
  kind:
    | 'MISSING_EVIDENCE'
    | 'MISSING_ORGANIZATIONAL_FACT'
    | 'EXPIRED_EVIDENCE'
    | 'OWNER_CONFIRMATION'
    | 'SPECIALIST_INTERPRETATION'
    | 'UNAPPROVED_POLICY'
    | 'CUSTOMER_SPECIFIC_CONFIRMATION';
  detail: string;
  requiredFromRole: string;
  /** Existing SKANDA record this gap can attach to, when one exists. */
  linkedControlCode?: string;
  linkedRiskId?: string;
  linkedFindingId?: string;
}

export interface AnswerDraft {
  id: string;
  tenantId: string;
  questionnaireId: string;
  questionId: string;
  requirementId: string;
  version: number;
  /** Concise customer-facing wording. Empty when no safe answer can be produced. */
  customerFacingResponse: string;
  /** Detailed internal explanation, including limitations. */
  internalExplanation: string;
  disposition: AnswerDisposition;
  sufficiency: EvidenceSufficiency;
  citations: EvidenceCitation[];
  controlReferences: string[];
  frameworkReferences: string[];
  organizationalScope: string[];
  evidenceFreshnessSummary: string;
  /** 0..100 heuristic estimate. Explicitly NOT a probability. */
  confidenceEstimate: number;
  confidenceBasis: string;
  missingInformation: MissingInformationItem[];
  contradictionWarnings: string[];
  suggestedNextAction: string;
  requiredReviewerRole: string;
  status: AnswerStatus;
  generatedAt: string;
  generatedBy: 'SKANDA_DRAFT_ENGINE' | 'HUMAN';
  /** Set when a human last edited the wording; used for separation-of-duties checks. */
  lastEditedBy?: string;
  /** Retained for version history when a draft is revised. */
  previousResponse?: string;
  previousStatus?: AnswerStatus;
  /** Set when the draft engine refused to assert support. */
  refusalReason?: string;
  unsupportedAssertionsRemoved: string[];
  /** Guard against prompt injection embedded in the imported questionnaire. */
  untrustedContentFlags: string[];
}

export interface AnswerExplanation {
  answerDraftId: string;
  whyThisAnswer: string[];
  whatEvidenceIsMissing: string[];
  whatChangedSincePreviousAnswer: string[];
  limitations: string[];
}

// ---------------------------------------------------------------------------
// 6. REVIEW & APPROVAL
// ---------------------------------------------------------------------------

export type ReviewAction =
  | 'SUBMIT_FOR_REVIEW'
  | 'APPROVE'
  | 'REJECT'
  | 'REQUEST_CHANGES'
  | 'REQUEST_INFORMATION'
  | 'REASSIGN'
  | 'EDIT_DRAFT'
  | 'SUPERSEDE';

export interface AnswerReview {
  id: string;
  tenantId: string;
  questionnaireId: string;
  answerDraftId: string;
  questionId: string;
  action: ReviewAction;
  actorEmail: string;
  actorRole: string;
  comment?: string;
  assignedToRole?: string;
  assignedToEmail?: string;
  previousStatus: AnswerStatus;
  newStatus: AnswerStatus;
  at: string;
}

export interface AnswerApproval {
  id: string;
  tenantId: string;
  questionnaireId: string;
  answerDraftId: string;
  questionId: string;
  approvedByEmail: string;
  approvedByRole: string;
  approvalScope: string[];
  approvedAt: string;
  /** sha256 of the approved customer-facing text — tamper evidence. */
  approvedContentHash: string;
  /** True when the approver is the same actor that generated the draft. */
  generatorApprovedOwnDraft: boolean;
  materialClaimClass: 'SECURITY' | 'PRIVACY' | 'REGULATORY' | 'CERTIFICATION' | 'CONTRACTUAL' | 'GENERAL';
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// 7. ANSWER LIBRARY (GOVERNED REUSE)
// ---------------------------------------------------------------------------

export type ReuseDecision =
  | 'REUSE_AUTHORIZED'
  | 'REVALIDATION_REQUIRED'
  | 'REUSE_DENIED';

export interface GovernedAnswerLibraryEntry {
  id: string;
  tenantId: string;
  canonicalQuestion: string;
  normalizedRequirement: string;
  approvedAnswer: string;
  category: QuestionCategory;
  frameworkMappings: string[];
  controlReferences: string[];
  evidenceReferenceIds: string[];
  organizationalScope: string[];
  productOrServiceScope: string[];
  businessUnit: string;
  approvalStatus: 'APPROVED' | 'PENDING_REVALIDATION' | 'EXPIRED' | 'REVOKED';
  approvedBy: string;
  approvedAt: string;
  lastValidatedAt: string;
  reviewDueAt: string;
  version: number;
  versionHistory: Array<{ version: number; approvedAnswer: string; changedBy: string; changedAt: string; reason: string }>;
  knownLimitations: string[];
  customerSpecificRestrictions: string[];
  evidenceFreshnessAtApproval: 'CURRENT' | 'DUE_SOON' | 'STALE' | 'UNKNOWN';
}

export interface ReuseEvaluation {
  decision: ReuseDecision;
  entryId: string;
  checks: Array<{ check: string; passed: boolean; detail: string }>;
  failedChecks: string[];
  rationale: string;
}

// ---------------------------------------------------------------------------
// 8. GAPS & REMEDIATION LINKAGE
// ---------------------------------------------------------------------------

export type GapType =
  | 'MISSING_EVIDENCE'
  | 'EXPIRED_EVIDENCE'
  | 'MISSING_ORGANIZATIONAL_FACT'
  | 'CONTROL_NOT_IMPLEMENTED'
  | 'CONTROL_PARTIALLY_IMPLEMENTED'
  | 'FAILED_CONTROL_TEST'
  | 'CONTRADICTORY_RECORDS'
  | 'UNAPPROVED_POLICY'
  | 'UNAVAILABLE_INTEGRATION'
  | 'CUSTOMER_SPECIFIC_CONFIRMATION_REQUIRED'
  | 'SPECIALIST_INTERPRETATION_REQUIRED'
  | 'MANDATORY_UNANSWERED';

/**
 * A questionnaire answer gap is NOT a confirmed control deficiency.
 * Only CONFIRMED_CONTROL_DEFICIENCY / VERIFIED_CONTROL_TEST_FAILURE may create
 * remediation records, and only when the linkage is verified.
 */
export type GapClassification =
  | 'QUESTIONNAIRE_ANSWER_GAP'
  | 'MISSING_EVIDENCE_SIGNAL'
  | 'CONFIRMED_CONTROL_DEFICIENCY'
  | 'VERIFIED_CONTROL_TEST_FAILURE'
  | 'REMEDIATION_ACTION';

export interface QuestionnaireGap {
  id: string;
  tenantId: string;
  questionnaireId: string;
  questionId: string;
  answerDraftId?: string;
  gapType: GapType;
  classification: GapClassification;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  detail: string;
  requiredFromRole: string;
  linkedControlCode?: string;
  linkedRiskId?: string;
  linkedFindingId?: string;
  linkedCapaId?: string;
  remediationCreated: boolean;
  remediationSuppressedReason?: string;
  detectedAt: string;
  status: 'OPEN' | 'OWNER_NOTIFIED' | 'RESOLVED' | 'ACCEPTED_RISK';
}

// ---------------------------------------------------------------------------
// 9. EXPORT
// ---------------------------------------------------------------------------

export interface ExportPreflightFinding {
  severity: 'BLOCKING' | 'WARNING' | 'INFO';
  code: string;
  detail: string;
  questionId?: string;
}

export interface ExportPreflightResult {
  canExport: boolean;
  requiresExceptionApproval: boolean;
  findings: ExportPreflightFinding[];
  mandatoryUnanswered: string[];
  unapprovedResponses: string[];
  unsupportedMaterialClaims: string[];
  expiredEvidence: string[];
  unresolvedContradictions: string[];
  missingRequiredAttachments: string[];
  disclosureRisks: string[];
}

export interface QuestionnaireExport {
  id: string;
  tenantId: string;
  questionnaireId: string;
  format: QuestionnaireSourceFormat;
  generatedAt: string;
  generatedBy: string;
  sha256Digest: string;
  storageLocator: string;
  fileName: string;
  preflight: ExportPreflightResult;
  approvedExceptionId?: string;
  questionsPopulated: number;
  questionsLeftUnresolvedAndVisible: number;
  unrelatedContentPreserved: boolean;
  validation: {
    fileReadable: boolean;
    worksheetCount: number;
    questionsOrderPreserved: boolean;
    responseCellsMatchPlan: boolean;
    notes: string[];
  };
}

// ---------------------------------------------------------------------------
// 10. QUESTIONNAIRE AGGREGATE
// ---------------------------------------------------------------------------

export type QuestionnaireStatus =
  | 'IMPORTED'
  | 'EXTRACTING'
  | 'EXTRACTION_REVIEW'
  | 'ANALYZING'
  | 'DRAFTING'
  | 'IN_REVIEW'
  | 'READY_FOR_EXPORT'
  | 'EXPORTED'
  | 'CLOSED'
  | 'FAILED';

export interface Questionnaire {
  id: string;
  tenantId: string;
  title: string;
  requestingOrganization: string;
  questionnaireIdentifier: string;
  format: QuestionnaireSourceFormat;
  status: QuestionnaireStatus;
  sourceArtifact: SourceArtifactRef;
  extractionSummary?: ExtractionSummary;
  sectionOrder: string[];
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  /** Ingestion/lifecycle state machine history. */
  statusHistory: Array<{ status: QuestionnaireStatus; at: string; actor: string; note?: string }>;
  /** Idempotency key so retried imports never duplicate records. */
  idempotencyKey: string;
}

export type QuestionnaireAuditAction =
  | 'QUESTIONNAIRE_IMPORTED'
  | 'EXTRACTION_COMPLETED'
  | 'MAPPING_CORRECTED'
  | 'ANALYSIS_COMPLETED'
  | 'DRAFT_GENERATED'
  | 'DRAFT_EDITED'
  | 'REVIEW_ACTION'
  | 'ANSWER_APPROVED'
  | 'ANSWER_REJECTED'
  | 'ANSWER_SUPERSEDED'
  | 'GAP_DETECTED'
  | 'REMEDIATION_LINKED'
  | 'EXPORT_PREFLIGHT_BLOCKED'
  | 'QUESTIONNAIRE_EXPORTED'
  | 'EXPORT_AUTHORIZED_WITH_EXCEPTION'
  | 'DISCLOSURE_AUTHORIZED'
  | 'DISCLOSURE_WITHDRAWN'
  | 'UNAUTHORIZED_ATTEMPT'
  | 'ANSWER_REUSED'
  | 'ANSWER_REVALIDATION_REQUESTED'
  | 'SOURCE_CHANGE_INGESTED'
  | 'SOURCE_CHANGE_REPLAYED'
  | 'JOB_ATTEMPT_FAILED';

export interface QuestionnaireAuditEvent {
  id: string;
  tenantId: string;
  questionnaireId: string;
  action: QuestionnaireAuditAction;
  actorEmail: string;
  actorRole: string;
  entityType: 'QUESTIONNAIRE' | 'QUESTION' | 'ANSWER' | 'GAP' | 'EXPORT' | 'DISCLOSURE' | 'JOB';
  entityId: string;
  summary: string;
  details?: Record<string, any>;
  at: string;
}

// ---------------------------------------------------------------------------
// 11. TRUST CENTER DISCLOSURE
// ---------------------------------------------------------------------------

export type DisclosureStatus = 'DRAFT' | 'PENDING_AUTHORIZATION' | 'AUTHORIZED' | 'WITHDRAWN' | 'EXPIRED';

export interface TrustCenterDisclosure {
  id: string;
  tenantId: string;
  title: string;
  category:
    | 'CERTIFICATIONS'
    | 'SECURITY_POLICY_SUMMARY'
    | 'CONTROL_SUMMARY'
    | 'PRIVACY_STATEMENT'
    | 'DATA_PROCESSING'
    | 'SUBPROCESSORS'
    | 'BUSINESS_CONTINUITY'
    | 'AUDIT_SUMMARY'
    | 'AI_GOVERNANCE'
    | 'APPROVED_QUESTIONNAIRE_RESPONSE';
  /** Customer-facing text. Only populated from approved internal sources. */
  publicContent: string;
  internalSourceIds: string[];
  /** Never auto-published: a named human must authorise disclosure. */
  status: DisclosureStatus;
  authorizedBy?: string;
  authorizedByRole?: string;
  authorizedAt?: string;
  version: number;
  effectiveFrom?: string;
  expiresAt?: string;
  withdrawnAt?: string;
  withdrawalReason?: string;
  auditHistory: Array<{ at: string; actor: string; action: string; detail: string }>;
}

// ---------------------------------------------------------------------------
// 12. BACKGROUND JOBS
// ---------------------------------------------------------------------------

export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'PARTIALLY_SUCCEEDED' | 'CANCELLED';

export interface QuestionnaireJob {
  id: string;
  tenantId: string;
  questionnaireId: string;
  kind: 'IMPORT' | 'EXTRACT' | 'ANALYZE' | 'GENERATE_DRAFTS' | 'EXPORT';
  status: JobStatus;
  idempotencyKey: string;
  attempt: number;
  maxAttempts: number;
  progress: { processed: number; total: number; failed: number };
  errors: Array<{ item: string; message: string }>;
  startedAt: string;
  finishedAt?: string;
}

// ---------------------------------------------------------------------------
// 13. CONTINUOUS ASSURANCE & REVALIDATION
// ---------------------------------------------------------------------------

/** Upstream SKANDA record kinds an answer claim can depend on. */
export type AssuranceSourceKind =
  | 'CONTROL'
  | 'CONTROL_TEST'
  | 'EVIDENCE'
  | 'POLICY'
  | 'RISK_OR_EXCEPTION'
  | 'INTEGRATION'
  | 'APPROVAL'
  | 'SCOPE'
  | 'FRAMEWORK_REQUIREMENT';

/** Deterministic change kinds reported by monitoring or reconciliation. */
export type SourceChangeKind =
  | 'CONTROL_STATE_CHANGED'
  | 'CONTROL_TEST_FAILED'
  | 'EVIDENCE_EXPIRED'
  | 'EVIDENCE_SUPERSEDED'
  | 'POLICY_SUPERSEDED'
  | 'EXCEPTION_RAISED'
  | 'CONNECTOR_UNHEALTHY'
  | 'INTEGRATION_DISCONNECTED'
  | 'APPROVAL_EXPIRED'
  | 'SCOPE_CHANGED'
  | 'FRAMEWORK_REQUIREMENT_CHANGED';

/**
 * How a change was observed. Scheduled polling is reconciliation, not
 * instantaneous event delivery, and is never labelled real-time.
 */
export type MonitoringMode = 'EVENT_DRIVEN' | 'SCHEDULED_POLLING' | 'MANUAL_REFRESH';

export type SourceChangeStatus =
  | 'PENDING'
  | 'PROCESSED'
  | 'NO_DEPENDENTS'
  | 'DUPLICATE_SUPPRESSED'
  | 'REJECTED'
  | 'DEAD_LETTER';

/**
 * One answer's dependency on upstream assurance sources. Together these records
 * form the graph answer -> claim -> control / test / evidence / policy /
 * integration / approval / scope.
 */
export interface AnswerAssuranceDependency {
  id: string;
  tenantId: string;
  questionnaireId: string;
  questionId: string;
  answerDraftId: string;
  /** Answer status at the moment the dependency was registered. */
  answerStatusAtLink: AnswerStatus;
  claimIds: string[];
  controlCodes: string[];
  controlTestIds: string[];
  evidenceReferenceIds: string[];
  policyIds: string[];
  frameworkRequirementCodes: string[];
  integrationIds: string[];
  riskIds: string[];
  approvalId?: string;
  organizationalScope: string[];
  requiredReviewerRole: string;
  /** Last state SKANDA observed for the primary source of each dependency. */
  lastKnownSourceState: string;
  lastKnownSourceObservedAt: string;
  /** Four distinct clocks — never conflated into one "last checked" value. */
  sourceObservedAt: string;
  collectedAt: string;
  evaluatedAt: string;
  lastVerifiedAt: string;
  status: 'CURRENT' | 'REVALIDATION_REQUIRED' | 'SUPERSEDED';
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** A monotonic change notification about an upstream assurance source. */
export interface SourceChangeRecord {
  id: string;
  tenantId: string;
  monitoringMode: MonitoringMode;
  kind: SourceChangeKind;
  sourceKind: AssuranceSourceKind;
  sourceId: string;
  resourceScope: string[];
  previousState?: string;
  newState?: string;
  detail: string;
  observedBy: string;
  sourceObservedAt: string;
  receivedAt: string;
  collectedAt: string;
  correlationId: string;
  idempotencyKey: string;
  payloadDigest: string;
  status: SourceChangeStatus;
  attempts: number;
  maxAttempts: number;
  /**
   * How many times an identical notification (same idempotency key) was
   * re-delivered. Counted on the original record so retries are provably
   * suppressed without violating the unique constraint.
   */
  duplicateAttempts: number;
  lastError?: string;
  processingLatencyMs?: number;
  impactedDependencyIds: string[];
  revalidationEventIds: string[];
  createdAt: string;
  updatedAt: string;
}

/** A claim-level impact statement attached to a revalidation event. */
export interface ImpactedClaimSummary {
  claimId: string;
  claimText: string;
  impact: 'DIRECT' | 'SHARED_SOURCE';
  reason: string;
}

/**
 * An explicit, version-preserving revalidation request for one answer.
 * Approved wording is never rewritten: it is retained verbatim for the reviewer.
 */
export interface AnswerRevalidationEvent {
  id: string;
  tenantId: string;
  questionnaireId: string;
  questionId: string;
  answerDraftId: string;
  dependencyId: string;
  sourceChangeId: string;
  triggerKind: SourceChangeKind;
  monitoringMode: MonitoringMode;
  triggerSourceKind: AssuranceSourceKind;
  triggerSourceId: string;
  reason: string;
  whatChanged: string[];
  assuranceState: 'STALE' | 'UNKNOWN';
  previousStatus: AnswerStatus;
  newStatus: AnswerStatus;
  previousAnswerVersion: number;
  newAnswerVersion: number;
  preservedApprovedText: string;
  approvedTextPreserved: boolean;
  previousApprovalId?: string;
  approvalInvalidated: boolean;
  impactedClaims: ImpactedClaimSummary[];
  requiredReviewerRole: string;
  routedToRoles: string[];
  libraryEntryId?: string;
  libraryEntryStatus?: 'PENDING_REVALIDATION';
  sourceObservedAt: string;
  collectedAt: string;
  evaluatedAt: string;
  lastVerifiedAt: string;
  notificationDedupeKey: string;
  notificationSuppressed: boolean;
  createdAt: string;
}

/** A reviewer-facing row combining a revalidation event with its dependency. */
export interface RevalidationQueueItem {
  revalidationEventId: string;
  questionnaireId: string;
  questionId: string;
  answerDraftId: string;
  answerStatus: AnswerStatus;
  triggerKind: SourceChangeKind;
  monitoringMode: MonitoringMode;
  triggerSourceKind: AssuranceSourceKind;
  triggerSourceId: string;
  reason: string;
  whatChanged: string[];
  assuranceState: 'STALE' | 'UNKNOWN';
  requiredReviewerRole: string;
  approvedTextPreserved: boolean;
  sourceObservedAt: string;
  collectedAt: string;
  evaluatedAt: string;
  lastVerifiedAt: string;
  ageMs: number;
}

/**
 * Observation of an upstream source used by scheduled reconciliation. Compared
 * against each dependency's last known source state so a missed event or an
 * outage is detected rather than silently assumed healthy.
 */
export interface UpstreamSourceState {
  sourceKind: AssuranceSourceKind;
  sourceId: string;
  state: 'OK' | 'FAILED' | 'EXPIRED' | 'UNHEALTHY' | 'DISCONNECTED' | 'SUPERSEDED' | 'CHANGED';
  observedAt: string;
  detail?: string;
  resourceScope?: string[];
}

/**
 * Operational metrics derived from authoritative records (never fabricated).
 * `null` means "not measurable from the stored records" and is reported as
 * unknown rather than as zero.
 */
export interface QuestionnaireObservabilityMetrics {
  generatedAt: string;
  storageType: 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE';
  /**
   * How many questionnaires the claim/pipeline counters below were derived from.
   * Reported explicitly so a partial scan is never presented as a complete one.
   */
  questionnaireCoverage: number;
  sourceChanges: {
    received: number;
    processed: number;
    noDependents: number;
    duplicatesSuppressed: number;
    rejected: number;
    deadLettered: number;
    pending: number;
    avgProcessingLatencyMs: number | null;
  };
  revalidation: {
    events: number;
    openQueue: number;
    suppressedNotifications: number;
    distinctAnswers: number;
    distinctQuestionnaires: number;
    oldestOpenAt: string | null;
  };
  dependencies: {
    total: number;
    current: number;
    revalidationRequired: number;
    superseded: number;
  };
  claims: {
    unsupported: number;
    partiallySupported: number;
    contradicted: number;
    staleOrExpiredEvidenceCitations: number;
  };
  pipeline: {
    importFailures: number;
    failedJobs: number;
    exportPreflightBlocks: number;
    openGaps: number;
  };
  monitoring: {
    eventDrivenChanges: number;
    scheduledPolls: number;
    manualRefreshes: number;
    lastReconciliationAt: string | null;
  };
}

// ---------------------------------------------------------------------------
// 14. API DTOs
// ---------------------------------------------------------------------------

export interface QuestionnaireWorkspaceView {
  questionnaire: Questionnaire;
  questions: Array<{
    question: ExtractedQuestion;
    requirement: RequirementAnalysis | null;
    answer: AnswerDraft | null;
    gaps: QuestionnaireGap[];
    reviews: AnswerReview[];
    approval: AnswerApproval | null;
  }>;
  completion: {
    total: number;
    drafted: number;
    approved: number;
    blocked: number;
    mandatoryUnanswered: number;
    openGaps: number;
  };
}
