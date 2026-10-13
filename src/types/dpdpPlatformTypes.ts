// ============================================================================
// SKANDA ENTERPRISE GRC: CANONICAL DPDP PRIVACY PLATFORM TYPES (PHASE DPDP-2)
// Path: src/types/dpdpPlatformTypes.ts
//
// Authoritative Regulatory & Architectural Type System for:
// - Digital Personal Data Protection Act, 2023 (DPDP Act)
// - Digital Personal Data Protection Rules, 2025 (Notified 13-Nov-2025)
// - CERT-In Cybersecurity Directions, 2022 (6-Hour Incident Reporting)
// - Sectoral Regulatory Overlays (RBI, SEBI CSCRF, IRDAI, PMLA 2002)
// ============================================================================

export type DpdpCommencementStatus =
  | 'IN_FORCE'
  | 'COMING_INTO_FORCE'
  | 'NOT_YET_EFFECTIVE'
  | 'CUSTOMER_ADOPTED'
  | 'NOT_APPLICABLE'
  | 'UNDER_REVIEW';

export type RegulatorySource =
  | 'DPDP_ACT_2023'
  | 'DPDP_RULES_2025'
  | 'CERT_IN_DIRECTIONS_2022'
  | 'RBI_MASTER_DIRECTIONS'
  | 'SEBI_CSCRF'
  | 'IRDAI_CYBER_2023'
  | 'PMLA_2002'
  | 'MEITY_GUIDELINES'
  | 'CONTRACTUAL_AGREEMENT'
  | 'INTERNAL_POLICY';

export type SectorOverlayCategory =
  | 'FINTECH_BANKING'
  | 'SECURITIES_CAPITAL_MARKETS'
  | 'INSURANCE'
  | 'HEALTHCARE'
  | 'TELECOM'
  | 'E_COMMERCE'
  | 'CROSS_INDUSTRY_ENTERPRISE';

export type DpdpDataCategory =
  | 'IDENTITY_CONTACT'
  | 'FINANCIAL_TRANSACTIONAL'
  | 'EMPLOYMENT_HR'
  | 'BEHAVIORAL_TELEMETRY'
  | 'HEALTH_BIOMETRIC'
  | 'CHILDREN_DATA'
  | 'LEGAL_REGULATORY'
  | 'COMMUNICATIONS';

export type DpdpDataPrincipalCategory =
  | 'CUSTOMER_USER'
  | 'WORKFORCE_EMPLOYEE'
  | 'JOB_APPLICANT'
  | 'CHILD_UNDER_18'
  | 'PERSON_WITH_DISABILITY'
  | 'VENDOR_CONTRACTOR'
  | 'WEBSITE_VISITOR';

export type DpdpProcessingBasis =
  | 'CONSENT'
  | 'LEGITIMATE_USES_EMPLOYMENT'
  | 'LEGITIMATE_USES_LEGAL_OBLIGATION'
  | 'LEGITIMATE_USES_MEDICAL_EMERGENCY'
  | 'LEGITIMATE_USES_STATE_BENEFITS'
  | 'LEGITIMATE_USES_VOLUNTARY_PROVISION';

export type DpdpRightType =
  | 'RIGHT_TO_ACCESS'
  | 'RIGHT_TO_CORRECTION'
  | 'RIGHT_TO_COMPLETION'
  | 'RIGHT_TO_UPDATING'
  | 'RIGHT_TO_ERASURE'
  | 'RIGHT_TO_GRIEVANCE_REDRESSAL'
  | 'RIGHT_TO_NOMINATE';

export type DpdpRightRequestStatus =
  | 'RECEIVED'
  | 'IDENTITY_VERIFIED'
  | 'SCOPING'
  | 'SYSTEM_DISCOVERY'
  | 'EXECUTION_IN_PROGRESS'
  | 'AUDIT_VERIFIED'
  | 'COMMUNICATED_TO_PRINCIPAL'
  | 'CLOSED_FULFILLED'
  | 'CLOSED_REJECTED_LAWFUL_BASIS';

export type DpdpConsentState =
  | 'GIVEN'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'RESTRICTED'
  | 'UNDER_REVIEW';

export type DpdpProcessorRiskTier =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type DpdpIncidentSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

// ============================================================================
// 1. REGULATORY REQUIREMENT & EFFECTIVE-DATE MODEL
// ============================================================================

export interface DpdpRequirement {
  id: string; // e.g. "DPDP-ACT-SEC-06-01", "DPDP-RULE-2025-R07"
  source: RegulatorySource;
  sectionOrRuleNumber: string; // e.g. "Section 6(1)", "Rule 7(1)"
  title: string;
  officialText: string;
  implementationObjective: string;
  version: string;
  notifiedDate: string; // e.g. "2025-11-13"
  effectiveDate: string; // Statutory commencement date
  commencementStatus: DpdpCommencementStatus;
  currentStatus: DpdpCommencementStatus;
  futureStatus?: DpdpCommencementStatus;
  futureEffectiveDate?: string;
  isLegallyEnforceableCurrently: boolean;
  sectorOverlays?: SectorOverlayCategory[];
  customerAdoptionStatus: 'MANDATORY_ENFORCED' | 'EARLY_ADOPTION' | 'IN_TRANSITION' | 'EXEMPTED';
  applicability: string[];
  mappedControlCodes: string[];
  evidenceRequirements: string[];
  testProcedure: string;
  ownerRole: string;
  assuranceStatus: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'UNTESTED' | 'FULLY_VERIFIED' | 'SUBSTANTIALLY_VERIFIED';
  lastEvaluatedAt?: string;
  changeHistory: { date: string; changeNote: string; author: string }[];
  // Backward-compatibility alias fields for existing workspaces
  sectionReference?: string;
  applicabilityStatus?: string;
  officialCommencementDate?: string;
  mappedControlIds?: string[];
  evidenceRequirementIds?: string[];
  testProcedureId?: string;
  testProcedureDescription?: string;
  assuranceScore?: number;
}

// ============================================================================
// 2. INCIDENT OBLIGATION CLOCK MODEL
// ============================================================================

export type IncidentObligationClockType =
  | 'CERT_IN_CYBER_REPORTING'
  | 'DPDP_RULE7_BOARD_NOTIFICATION'
  | 'DPDP_RULE7_PRINCIPAL_NOTIFICATION'
  | 'RBI_INCIDENT_REPORTING'
  | 'SEBI_INCIDENT_REPORTING'
  | 'IRDAI_INCIDENT_REPORTING'
  | 'CONTRACTUAL_CUSTOMER_SLA'
  | 'INTERNAL_CISO_ESCALATION';

export interface IncidentObligationClock {
  id: string;
  incidentId: string;
  obligationType: IncidentObligationClockType;
  title: string;
  basisLegalSource: string; // e.g., "CERT-In Directions 2022, Para 6(ii)" vs "DPDP Rules 2025, Rule 7(1)"
  statutoryWindowHours: number; // 6 for CERT-In, 72 for Sector, 24 for Contract
  triggeredAt: string;
  deadlineTimestamp: string;
  isApplicable: boolean;
  inapplicabilityRationale?: string;
  isCommencedLegally: boolean; // Phased commencement gate
  owner: string;
  status: 'NOT_STARTED' | 'TRIAGING' | 'NOTIFIED_ON_TIME' | 'SLA_BREACHED' | 'EXEMPTED_CONFIRMED';
  completedAt?: string;
  evidenceArtifactId?: string;
  submissionReferenceNumber?: string;
}

// ============================================================================
// 3. SECTORAL REGULATORY OVERLAY MODEL
// ============================================================================

export interface RegulatorySectorOverlayRule {
  id: string;
  sector: SectorOverlayCategory;
  authority: 'DPBI' | 'CERT-In' | 'RBI' | 'SEBI' | 'IRDAI' | 'FIU-IND_PMLA' | 'CUSTOM';
  frameworkCode: string;
  ruleReference: string;
  ruleCategory: 'RETENTION' | 'DATA_LOCALIZATION' | 'INCIDENT_REPORTING' | 'AUDIT_FREQUENCY' | 'ACCESS_GOVERNANCE';
  mandateSummary: string;
  effectiveRetentionPeriodMonths?: number;
  priorityRank: number; // Higher overrides lower in synthesis
  conflictResolutionStrategy: 'LONGEST_MANDATORY_PERIOD' | 'STRICTEST_SAFEGUARD' | 'STATUTORY_PREEMPTION';
}

export interface EffectiveRetentionSynthesis {
  personalDataElementId: string;
  personalDataElementName: string;
  purposeId: string;
  dpdpBaseRetentionMonths: number;
  sectorOverlayMandates: {
    authority: string;
    rule: string;
    requiredMonths: number;
    statutoryBasis: string;
  }[];
  contractualMandates: {
    customer: string;
    requiredMonths: number;
  }[];
  hasActiveLegalHold: boolean;
  legalHoldReference?: string;
  effectiveRetentionMonths: number;
  effectiveRuleRationale: string;
  isEligibleForDeletion: boolean;
  blockedReasons: string[];
  owner: string;
  nextReviewDate: string;
  evidenceId: string;
}

// ============================================================================
// 4. CROSS-BORDER TRANSFER GOVERNANCE (NON-BLANKET LOCALIZATION)
// ============================================================================

export type CrossBorderDecision = 'ALLOWED' | 'REVIEW_REQUIRED' | 'RESTRICTED' | 'NOT_APPLICABLE';

export interface CrossBorderTransferEvaluation {
  transferId: string;
  tenantId: string;
  sourceCountry: string;
  destinationCountry: string;
  dataCategory: DpdpDataCategory;
  processingPurposeId: string;
  processorId: string;
  subProcessorId?: string;
  dpdpSection16GovernmentNegativeListRestricted: boolean;
  sectorRequirementApplies: boolean;
  sectorMandateDetails?: string;
  contractualRestrictionsExist: boolean;
  customerPolicyPermitted: boolean;
  transferDecision: CrossBorderDecision;
  decisionRationale: string;
  safeguardsActive: string[];
  lastEvaluatedAt: string;
  evidenceId: string;
}

// ============================================================================
// 5. PERSONAL DATA INVENTORY
// ============================================================================

export interface DpdpPersonalDataElement {
  id: string;
  tenantId: string;
  name: string;
  category: DpdpDataCategory;
  dataType: 'STRING' | 'NUMBER' | 'ENCRYPTED_BLOB' | 'BIOMETRIC' | 'DOCUMENT';
  dataPrincipalCategory: DpdpDataPrincipalCategory;
  isSensitivePersonalData: boolean;
  isChildrenData: boolean;
  collectionSource: string;
  processingSystems: string[];
  storageLocations: string[];
  processingActivityIds: string[];
  purposeIds: string[];
  recipientProcessors: string[];
  retentionRuleId: string;
  deletionMechanism: 'HARD_DELETE_AUTOMATED' | 'CRYPTO_SHRED' | 'MANUAL_DECOMMISSION';
  securityControls: string[];
  noticeId: string;
  consentRequired: boolean;
  lawfulBasis: DpdpProcessingBasis;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  owner: string;
  classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'INTERNAL';
  discoveryStatus: 'VERIFIED_ACTIVE' | 'DRIFT_DETECTED' | 'DISCONTINUED';
  lastVerifiedAt: string;
  evidenceId: string;
  dataLineage: {
    source: string;
    flowStages: string[];
    destination: string;
    encryptionActive: boolean;
  };
}

// ============================================================================
// 6. PROCESSING ACTIVITY REGISTER (RoPA)
// ============================================================================

export interface DpdpProcessingActivity {
  id: string;
  tenantId: string;
  name: string;
  businessPurpose: string;
  personalDataElementIds: string[];
  dataPrincipalCategories: DpdpDataPrincipalCategory[];
  collectionSource: string;
  processingSystems: string[];
  storageLocations: string[];
  processorIds: string[];
  subProcessorIds: string[];
  noticeId: string;
  applicableBasis: DpdpProcessingBasis;
  retentionRuleId: string;
  deletionRule: string;
  securityControls: string[];
  riskIds: string[];
  owner: string;
  reviewFrequencyDays: number;
  lastReviewedAt: string;
  nextReviewDate: string;
  evidenceIds: string[];
  status: 'ACTIVE_APPROVED' | 'PENDING_DPO_REVIEW' | 'FLAGGED_ANOMALY';
  dpiaRequired: boolean;
  dpiaScore?: number;
}

// ============================================================================
// 7. PURPOSE GOVERNANCE REGISTRY
// ============================================================================

export interface DpdpPurposeEntry {
  id: string;
  tenantId: string;
  purposeCode: string;
  name: string;
  description: string;
  isSpecificAndItemized: boolean;
  associatedActivityIds: string[];
  associatedDataElementIds: string[];
  noticeId: string;
  lawfulBasis: DpdpProcessingBasis;
  retentionPeriodMonths: number;
  status: 'ACTIVE_COMPLIANT' | 'REVIEW_REQUIRED' | 'ORPHANED_FLAGGED';
  anomalyFlags: string[];
}

// ============================================================================
// 8. PRIVACY NOTICE STUDIO
// ============================================================================

export interface DpdpPrivacyNoticeVersion {
  version: string;
  publishedAt: string;
  effectiveDate: string;
  changeSummary: string;
  contentHash: string;
  approvedByDpo: string;
}

export interface DpdpPrivacyNotice {
  id: string;
  tenantId: string;
  title: string;
  noticeCode: string;
  supportedLanguages: string[];
  currentVersion: string;
  itemizedDataElements: string[];
  specifiedPurposes: string[];
  processingDescription: string;
  rightsInformationText: string;
  withdrawalMechanismText: string;
  grievanceRedressalOfficerContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
    postalAddress: string;
    responseSlaDays: number;
  };
  consentManagerIntegrationUrl?: string;
  publicationUrl: string;
  status: 'PUBLISHED_ACTIVE' | 'DRAFT' | 'UNDER_DPO_REVIEW' | 'ARCHIVED';
  readabilityScore: {
    fleschReadingEase: number;
    plainLanguageCertified: boolean;
  };
  versionHistory: DpdpPrivacyNoticeVersion[];
}

// ============================================================================
// 9. CONSENT LIFECYCLE MODEL
// ============================================================================

export interface DpdpConsentRecord {
  id: string;
  tenantId: string;
  dataPrincipalId: string;
  dataPrincipalEmailMasked: string;
  purposeId: string;
  personalDataElementIds: string[];
  noticeVersion: string;
  consentState: DpdpConsentState;
  grantedAt: string;
  sourceChannel: 'WEB_MODAL' | 'MOBILE_APP_OPT_IN' | 'CONSENT_MANAGER_API' | 'WRITTEN_AGREEMENT';
  ipAddressMasked: string;
  consentArtifactSha256: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  downstreamRestrictionStatus: 'NOT_APPLICABLE' | 'RESTRICTION_ENFORCED' | 'PENDING_SYSTEM_SYNC';
  downstreamSystemsNotified: string[];
}

// ============================================================================
// 10. DATA PRINCIPAL RIGHTS (DSR) & BLAST RADIUS
// ============================================================================

export interface DsrBlastRadius {
  dsrRequestId: string;
  dataPrincipalName: string;
  affectedRecordsCount: number;
  affectedDataElementIds: string[];
  affectedSystems: {
    systemName: string;
    location: string;
    status: 'PENDING' | 'DISCOVERED' | 'EXECUTED';
  }[];
  affectedProcessors: {
    processorId: string;
    name: string;
    propagationStatus: 'DISPATCHED' | 'ACKNOWLEDGED' | 'COMPLETED';
    evidenceId?: string;
  }[];
  affectedSubProcessors: {
    subProcessorId: string;
    name: string;
    propagationStatus: 'DISPATCHED' | 'COMPLETED';
  }[];
  completionPercentage: number;
  remainingWorkSummary: string;
  statutorySlaDaysRemaining: number;
  slaRiskLevel: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL_OVERDUE';
  evidenceChainHash: string;
  communicationLedger: {
    timestamp: string;
    channel: string;
    recipient: string;
    subject: string;
    deliveryProofId: string;
  }[];
}

export interface DpdpRightRequest {
  id: string;
  tenantId: string;
  requestType: DpdpRightType;
  dataPrincipalName: string;
  dataPrincipalEmailMasked: string;
  isIdentityVerified: boolean;
  verificationMethod: 'DIGILOCKER_OTP' | 'GOVT_ID_OIDC' | 'EMAIL_2FA_TOKEN';
  receivedAt: string;
  dueDate: string;
  assignedOwner: string;
  status: DpdpRightRequestStatus;
  affectedSystems: string[];
  affectedDataElementIds: string[];
  scopingNotes: string;
  executionEvidenceIds: string[];
  blastRadius?: DsrBlastRadius;
  communicationsLog: {
    timestamp: string;
    sender: string;
    channel: 'EMAIL' | 'SMS' | 'PORTAL';
    messageSummary: string;
  }[];
  closureReason?: 'FULFILLED_IN_FULL' | 'REJECTED_EXEMPTION_APPLIES' | 'WITHDRAWN_BY_PRINCIPAL';
  closedAt?: string;
  auditTrailHash: string;
}

// ============================================================================
// 11. RETENTION & DELETION ORCHESTRATION ENGINE
// ============================================================================

export interface DpdpRetentionRule {
  id: string;
  tenantId: string;
  name: string;
  purposeId: string;
  retentionPeriodMonths: number;
  triggerEvent: 'ACCOUNT_CLOSURE' | 'CONSENT_WITHDRAWAL' | 'STATUTORY_EXPIRY' | 'INACTIVITY_365D';
  legalRetentionMandate?: string;
  hasActiveLegalHold: boolean;
  legalHoldReference?: string;
  targetSystems: string[];
}

export interface DeletionOrchestrationJob {
  jobId: string;
  tenantId: string;
  targetEntityId: string;
  entityType: 'PERSONAL_DATA_ELEMENT' | 'DATA_PRINCIPAL_RECORDS' | 'EXPIRED_PURPOSE_DATA';
  eligibilityCheckPassed: boolean;
  retentionCheckStatus: 'RETENTION_ELAPSED' | 'RETENTION_ACTIVE';
  legalHoldBlocked: boolean;
  legalHoldDetails?: {
    holdId: string;
    courtMatter: string;
    custodian: string;
  };
  sectorOverlayBlocked: boolean;
  sectorOverlayDetails?: string;
  processorPropagations: {
    processorId: string;
    processorName: string;
    acknowledged: boolean;
    purgedRecords: number;
    proofSha256?: string;
  }[];
  subProcessorPropagations: {
    subProcessorId: string;
    subProcessorName: string;
    purgedRecords: number;
  }[];
  executedPurgeMethod: 'HARD_DELETE_DATABASE' | 'CRYPTO_KEY_PURGE' | 'MASK_ANONYMIZE';
  recordsPurgedTotal: number;
  reconciliationStatus: 'RECONCILED_EXACT' | 'DISCREPANCY_DETECTED' | 'BLOCKED_ABORTED';
  cryptographicEvidenceSha256: string;
  deletionCertificateIssuedBy: string;
  executedAt?: string;
  blockedRationale?: {
    reason: string;
    source: string;
    owner: string;
    nextReviewDate: string;
    evidenceId: string;
  };
}

export interface DpdpDeletionExecutionJob {
  id: string;
  tenantId: string;
  retentionRuleId: string;
  dataPrincipalId?: string;
  targetSystems: string[];
  scheduledDate: string;
  executedDate?: string;
  recordsPurgedCount: number;
  deletionMethod: 'HARD_DELETE_DATABASE' | 'CRYPTO_KEY_PURGE' | 'MASK_ANONYMIZE';
  verifiedByDpo: boolean;
  cryptographicDeletionProofSha256: string;
  status: 'SCHEDULED' | 'BLOCKED_BY_LEGAL_HOLD' | 'EXECUTED_VERIFIED' | 'FAILED_RETRY';
}

// ============================================================================
// 12. PROCESSOR PRIVACY 360
// ============================================================================

export interface DpdpProcessorSubProcessor {
  id: string;
  subProcessorId?: string;
  name: string;
  subProcessorName?: string;
  country: string;
  jurisdiction?: string;
  serviceDescription: string;
  role?: string;
  adequacyApproved: boolean;
  fiduciaryApprovalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  dpaBackToBackStatus?: 'EXECUTED' | 'MISSING' | 'IN_REVIEW';
}

export interface DpdpProcessorProfile {
  id: string;
  processorId?: string;
  tenantId: string;
  name: string;
  processorName?: string;
  servicesProvided: string[];
  dataElementIdsShared: string[];
  personalDataCategories?: string[];
  processingPurposeIds: string[];
  processingLocations: string[];
  storageLocations?: string[];
  systemsHosted?: string[];
  dpaSigned: boolean;
  dpaExecutionStatus?: 'EXECUTED_VALID' | 'EXPIRING_SOON' | 'MISSING_NON_COMPLIANT';
  dpaSignedDate?: string;
  dpaExecutionDate?: string;
  dpaExpiryDate?: string;
  dpaDocumentEvidenceId?: string;
  dpaAgreementReference?: string;
  subProcessors: DpdpProcessorSubProcessor[];
  securityControlsVerified: string[];
  lastSecurityAssessmentDate: string;
  lastAssessmentDate?: string;
  nextAssessmentDue: string;
  nextAssessmentDate?: string;
  openIncidentCount: number;
  riskTier: DpdpProcessorRiskTier;
  riskLevel?: string;
  riskScore: number;
  processorRiskScore?: number;
  reviewStatus?: 'ACTIVE_APPROVED' | 'REVIEW_OVERDUE' | 'PENDING_ASSESSMENT';
  linkedControlIds?: string[];
  evidenceIds?: string[];
  privacyObligations?: string[];
  warningSignals: string[];
}

// ============================================================================
// 13. PRIVACY INCIDENT & MULTI-CLOCK ENGINE
// ============================================================================

export interface DpdpPrivacyIncident {
  id: string;
  tenantId: string;
  title: string;
  discoveredAt: string;
  containedAt?: string;
  affectedDataCategories: DpdpDataCategory[];
  estimatedDataPrincipalsImpacted: number;
  affectedSystems: string[];
  processorInvolvedId?: string;
  rootCauseAnalysis: string;
  severity: DpdpIncidentSeverity;
  // Multi-clock separation
  obligationClocks: IncidentObligationClock[];
  statutoryCertInNotificationRequired: boolean;
  certInNotificationSentAt?: string;
  dpbiBoardNotificationRequired: boolean;
  dpbiNotificationSentAt?: string;
  dataPrincipalNotificationRequired: boolean;
  dataPrincipalNotificationSentAt?: string;
  notificationDecisionRationale: string;
  authorizedByCisoDpo: string;
  containmentEvidenceIds: string[];
  capaRecordId?: string;
  status: 'TRIAGING' | 'CONTAINED' | 'STATUTORY_REPORTED' | 'CLOSED_REMEDIATED' | 'CLOSED_RESOLVED';
  // Backward-compatibility alias fields for existing workspaces
  incidentId?: string;
  dpbiNotified?: boolean;
  detectionTimestamp?: string;
  containmentTimestamp?: string;
  estimatedAffectedPrincipalsCount?: number;
  incidentCommander?: string;
  personalDataCategoriesAffected?: string[];
  dpbiNotificationFormReference?: string;
  dpbiNotificationTimestamp?: string;
  principalsNotified?: boolean;
  correctiveActions?: string[];
  evidenceIds?: string[];
}

// ============================================================================
// 14. SIGNIFICANT DATA FIDUCIARY (SDF) ASSESSMENT
// ============================================================================

export interface DpdpSdfFactorAssessment {
  factor: string;
  evaluatedScore: number;
  thresholdTriggered: boolean;
  rationale: string;
  evidenceId: string;
}

export interface DpdpSdfAssessment {
  id: string;
  tenantId: string;
  assessmentDate: string;
  evaluatedBy: string;
  dpoName: string;
  overallVolumeOfData: string;
  sensitivityProfile: string;
  riskOfHarmScore: number;
  factors: DpdpSdfFactorAssessment[];
  isDesignatedSdf: boolean;
  statutoryObligationsActive: {
    residentDpoAppointed: boolean;
    independentDataAuditorEngaged: boolean;
    periodicDpiaMandated: boolean;
    periodicAlgorithmAuditConducted: boolean;
  };
  approvalStatus: 'DPO_APPROVED' | 'BOARD_RATIFIED' | 'DRAFT';
}

// ============================================================================
// 15. SKANDA PRIVACY POSTURE 8-PILLAR MODEL
// ============================================================================

export interface SkandaPrivacyPostureBreakdown {
  tenantId: string;
  overallPostureScore: number; // 0 to 100
  evaluationMethodology: 'SKANDA Privacy Assurance Methodology v2.0';
  pillars: {
    regulatoryReadiness: { score: number; effectiveCount: number; totalInForce: number };
    operationalReadiness: { score: number; ropasApprovedCount: number; noticeCount: number };
    dataGovernance: { score: number; inventoryElementsCount: number; sensitiveCount: number };
    rightsOperations: { score: number; dsrSlaAdherencePct: number; activeRequests: number };
    processorGovernance: { score: number; dpaCoveragePct: number; unassessedCount: number };
    securitySafeguards: { score: number; verifiedControlsCount: number; encryptionPct: number };
    evidenceAssurance: { score: number; hashVerifiedEvidenceCount: number; gapsCount: number };
    incidentReadiness: { score: number; multiClockSlaPct: number; uncontainedCount: number };
  };
  showMeWhyGroundedLinksCount: number;
  lastCalculatedAt: string;
}

// ============================================================================
// 16. AI PRIVACY COPILOT AUDIT LEDGER
// ============================================================================

export interface CopilotAuditRecord {
  queryId: string;
  tenantId: string;
  modelName: string;
  promptVersion: string;
  regulatoryDatasetVersion: string;
  retrievedRecordIds: { id: string; type: string; title: string; hash?: string }[];
  generatedResponse: string;
  confidenceScore: number;
  reviewerRole: string;
  approvalStatus: 'PENDING_HUMAN_VALIDATION' | 'DPO_VALIDATED';
  timestamp: string;
  humanValidationDisclaimer: 'AI-GENERATED // HUMAN VALIDATION REQUIRED';
}

export interface DpdpCopilotResponse {
  query: string;
  answerMarkdown: string;
  citedRecordIds: { id: string; type: string; title: string }[];
  confidenceScore: number;
  generatedAt: string;
  disclaimer: 'AI-GENERATED // HUMAN VALIDATION REQUIRED';
  auditRecord?: CopilotAuditRecord;
}

// ============================================================================
// 17. REAL-TIME PRIVACY MONITORING SIGNALS & REGULATORY CHANGES
// ============================================================================

export interface DpdpPrivacySignal {
  id: string;
  tenantId: string;
  timestamp: string;
  signalType:
    | 'NEW_PERSONAL_DATA_DISCOVERED'
    | 'UNNOTIFIED_PROCESSING_ACTIVITY'
    | 'PURPOSE_MISMATCH'
    | 'CONSENT_WITHDRAWAL_CASCADE'
    | 'DSR_SLA_AT_RISK'
    | 'RETENTION_PERIOD_ELAPSED'
    | 'PROCESSOR_DPA_EXPIRED'
    | 'CROSS_BORDER_RESTRICTION_FLAG';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  affectedEntityId: string;
  recommendedAction: string;
  isAcknowledged: boolean;
}

export interface DpdpRegulatoryChangeItem {
  id: string;
  notifiedDate: string;
  gazetteReference: string;
  changeSummary: string;
  sourceAuthority: 'MeitY' | 'DPBI' | 'CERT-In';
  impactedRequirementIds: string[];
  impactedControlCodes: string[];
  impactedNoticeIds: string[];
  requiredCustomerAction: string;
  implementationDeadline: string;
  status: 'ANALYZED' | 'ACTION_REQUIRED' | 'IMPLEMENTED_VERIFIED';
}

// Enterprise Interoperability Aliases
export type DPDPRegulatoryRequirement = DpdpRequirement;
export type DPDPPersonalDataElement = DpdpPersonalDataElement;
export type DPDPRoPAActivity = DpdpProcessingActivity;
export type DPDPPurposeEntry = DpdpPurposeEntry;
export type DPDPPrivacyNotice = DpdpPrivacyNotice;
export type DPDPConsentRecord = DpdpConsentRecord;
export type DPDPDataPrincipalRightRequest = DpdpRightRequest;
export type DPDPRetentionSchedule = DpdpRetentionRule;
export type DPDPProcessor360 = DpdpProcessorProfile;
export type DPDPPrivacyIncident = DpdpPrivacyIncident;
export type DPDPSdfAssessment = DpdpSdfAssessment;
export type DPDPPrivacySignal = DpdpPrivacySignal;
export type DPDPRegulatoryChangeItem = DpdpRegulatoryChangeItem;
export type DPDPCopilotResponse = DpdpCopilotResponse;
