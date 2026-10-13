/**
 * SKANDA ENTERPRISE RISK OPERATING SYSTEM — PHASE 34
 * Domain Type Definitions & Canonical Contracts
 * Production Integrity, Decision Intelligence & Quantitative Assurance OS
 * Grounded in ISO 31000:2018, ISO/IEC 27005:2022, NIST SP 800-30, FAIR Cyber Risk Quantification & MAS TRM Guidelines
 */

export type EnterpriseRiskCategory =
  | 'Information Security'
  | 'Cybersecurity'
  | 'Privacy & Personal Data'
  | 'Regulatory Compliance'
  | 'Third-Party & Supply Chain'
  | 'Cloud Security'
  | 'Identity & Access Management'
  | 'Vulnerability & Patch Management'
  | 'Business Continuity'
  | 'Disaster Recovery'
  | 'Operational Resilience'
  | 'Data Governance'
  | 'Artificial Intelligence'
  | 'Fraud'
  | 'Financial and Commercial'
  | 'Strategic'
  | 'Reputational'
  | 'Physical Security'
  | 'Legal and Contractual'
  | 'Technology Operations'
  | 'Product Security'
  | 'Project Delivery';

export type RiskVelocityStatus =
  | 'STABLE'
  | 'INCREASING'
  | 'DECREASING'
  | 'VOLATILE'
  | 'NEWLY_DETECTED'
  | 'OVERDUE_REVIEW'
  | 'OUTSIDE_APPETITE'
  | 'INSUFFICIENT_DATA';

export type EnterpriseRiskTreatmentStrategy =
  | 'MITIGATE'
  | 'AVOID'
  | 'TRANSFER'
  | 'ACCEPT';

export type EnterpriseRiskStatus =
  | 'IDENTIFIED'
  | 'ASSESSMENT'
  | 'TREATMENT_IN_PROGRESS'
  | 'RESIDUAL_MONITORED'
  | 'CLOSED'
  | 'ARCHIVED';

export type RiskScoringMethodologyType =
  | 'QUALITATIVE_5X5'
  | 'QUALITATIVE_4X4'
  | 'QUALITATIVE_3X3'
  | 'SEMI_QUANTITATIVE'
  | 'QUANTITATIVE_FAIR'
  | 'SCENARIO_BASED';

export type RiskAssuranceState =
  | 'ASSURED'
  | 'PARTIALLY_ASSURED'
  | 'AT_RISK'
  | 'UNASSURED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'STALE_EVIDENCE'
  | 'REASSESSMENT_REQUIRED'
  | 'ASSURANCE_REVIEW_REQUIRED'
  | 'INSUFFICIENT_DATA';

export type RiskProvenanceTier =
  | 'DIRECT_SOURCE'
  | 'SOURCE_DERIVED'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDATION'
  | 'THIRD_PARTY_MAPPING'
  | 'UNKNOWN';

export type VerificationOperationalState =
  | 'ENGINEERING_VERIFIED'
  | 'SOURCE_VERIFIED'
  | 'INTEGRATION_CONFIGURED'
  | 'LIVE_DATA_VERIFIED'
  | 'RISK_CALCULATION_VERIFIED'
  | 'TENANT_ISOLATION_VERIFIED'
  | 'SECURITY_TESTED'
  | 'OPERATIONALLY_VALIDATED'
  | 'PRODUCTION_CANDIDATE'
  | 'PRODUCTION_VERIFIED';

// ============================================================================
// PHASE 34: 12-TIER CONNECTOR MATURITY LADDER
// ============================================================================

export type ConnectorMaturityTier =
  | 'CATALOG_ONLY'
  | 'ADAPTER_IMPLEMENTED'
  | 'AUTHENTICATION_CONFIGURED'
  | 'AUTHENTICATION_VERIFIED'
  | 'LIVE_RETRIEVAL_VERIFIED'
  | 'NORMALIZATION_VERIFIED'
  | 'AUTOMATED_CHECKS_VERIFIED'
  | 'EVIDENCE_GENERATION_VERIFIED'
  | 'RISK_IMPACT_VERIFIED'
  | 'CONTINUOUS_MONITORING_VERIFIED'
  | 'FAILURE_RECOVERY_VERIFIED'
  | 'PRODUCTION_VERIFIED';

export type RiskEventTriggerType =
  | 'ASSET_CRITICALITY_CHANGED'
  | 'NEW_VULNERABILITY_DETECTED'
  | 'VULNERABILITY_REMEDIATED'
  | 'CONTROL_TEST_FAILED'
  | 'CONTROL_TEST_PASSED'
  | 'EVIDENCE_EXPIRED'
  | 'EVIDENCE_TAMPERED'
  | 'CAPA_OVERDUE'
  | 'CAPA_VERIFIED_CLOSED'
  | 'REGULATORY_REQUIREMENT_CHANGED'
  | 'SUPPLIER_RISK_CHANGED'
  | 'RISK_APPETITE_CHANGED'
  | 'RISK_ACCEPTANCE_EXPIRED'
  | 'BUSINESS_SERVICE_CHANGED'
  | 'RISK_ASSESSMENT_APPROVED'
  | 'TREATMENT_PLAN_COMPLETED'
  | 'TREATMENT_VERIFICATION_FAILED'
  | 'TREATMENT_VERIFICATION_PASSED'
  | 'CONNECTOR_DISCONNECTED'
  | 'CONNECTOR_CREDENTIAL_EXPIRING'
  | 'TELEMETRY_ANOMALY_DETECTED'
  | 'DEAD_LETTER_EVENT_REPLAYED';

// ============================================================================
// PHASE 34: VERSIONED RISK METHODOLOGY REGISTRY
// ============================================================================

export interface QualitativeScaleLevel {
  level: number;
  label: string;
  description: string;
  criteria: string;
  financialThresholdUSD?: number;
}

export interface SeverityBandThreshold {
  minScore: number;
  maxScore: number;
  band: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  color: string;
  actionSlaHours: number;
  requiresBoardEscalation: boolean;
}

export interface RiskMethodologyDefinition {
  id: string; // e.g. "METH-5X5-STD"
  name: string;
  version: string; // e.g. "2026.1-Enterprise"
  matrixDimension: '3X3' | '4X4' | '5X5';
  tenantId?: string; // Tenant specific override or GLOBAL
  isDefault: boolean;
  likelihoodDefinitions: QualitativeScaleLevel[];
  impactDefinitions: QualitativeScaleLevel[];
  severityBands: SeverityBandThreshold[];
  inherentCalculationRule: string; // e.g. "LIKELIHOOD * IMPACT"
  residualCalculationRule: string; // e.g. "RESIDUAL_LIKELIHOOD * RESIDUAL_IMPACT"
  controlEffectivenessWeights: {
    designWeight: number; // 0.0 - 1.0
    operatingWeight: number; // 0.0 - 1.0
    freshnessWeight: number; // 0.0 - 1.0
  };
  riskAppetiteInterpretation: string;
  approvalAuthority: string; // e.g. "Board Risk Committee"
  effectiveDate: string;
  changeHistory: Array<{
    date: string;
    version: string;
    author: string;
    changes: string;
  }>;
  validationStatus: VerificationOperationalState;
}

// ============================================================================
// PHASE 34: CLOSED-LOOP TREATMENT ASSURANCE CONTRACTS
// ============================================================================

export type TreatmentAssuranceState =
  | 'IMPLEMENTATION_COMPLETE'
  | 'RETEST_PASSED'
  | 'RISK_REASSESSED'
  | 'CLOSURE_APPROVED'
  | 'VERIFIED_AND_CLOSED'
  | 'VERIFICATION_FAILED'
  | 'RETEST_PASSED_OUTSIDE_APPETITE';

export interface TreatmentVerificationRecord {
  treatmentId: string;
  riskId: string;
  tenantId: string;
  verifiedBy: string;
  verifiedByRole?: string;
  verificationProcedure: string;
  retestCriteria: string;
  retestPassed: boolean;
  retestEvidenceIds: string[];
  preTreatmentResidualScore: number;
  postTreatmentResidualScore: number;
  preTreatmentALEUSD: number;
  postTreatmentALEUSD: number;
  unmitigatedExposureUSD: number;
  verificationDate: string;
  status: TreatmentAssuranceState;
  closureApproved: boolean;
  closureApprovedBy?: string;
  closureApprovalDate?: string;
  retestRequired: boolean;
  requiresBoardWaiver?: boolean;
  auditExplanation: string;
}

// ============================================================================
// PHASE 34: LIVE CONNECTOR MATURITY & TELEMETRY LEDGER
// ============================================================================

export interface LiveConnectorMaturityRecord {
  connectorId: string;
  name: string;
  provider: string;
  environment: string;
  maturityLevel: ConnectorMaturityTier;
  authStatus: 'CONFIGURED' | 'FAILED' | 'EXPIRING_SOON' | 'NOT_CONFIGURED';
  isLiveValidated: boolean;
  credentialScope: string[];
  lastSuccessfulRetrieval?: string;
  lastFailedRetrieval?: string;
  lastNormalizationResult?: string;
  lastAutomatedCheck?: string;
  lastEvidenceGenerated?: string;
  collectionLatencyMs: number;
  dataCompletenessPercent: number;
  dataFreshnessScore: number;
  errorRatePercent: number;
  affectedEntitiesCount: number;
  risksUpdatedCount: number;
  knownLimitations: string[];
}

// ============================================================================
// PHASE 34: DEAD-LETTER & REPLAY AUDIT LEDGER
// ============================================================================

export interface DeadLetterEventRecord {
  id: string;
  tenantId: string;
  eventId: string;
  correlationId?: string;
  eventType: RiskEventTriggerType | string;
  failedAt: string;
  failureReason: string;
  payload: any;
  status: 'DEAD_LETTER' | 'RETRIED' | 'RESOLVED_MANUAL' | 'DISCARDED';
  retryCount: number;
  maxRetries: number;
  lastRetryTimestamp?: string;
  replayAuditTrail?: Array<{
    attempt: number;
    timestamp: string;
    result: 'SUCCESS' | 'FAILED';
    replayedBy: string;
    reason?: string;
  }>;
}

// ============================================================================
// PHASE 34: EXECUTIVE DECISION INTELLIGENCE & TRIAGE
// ============================================================================

export type ExecutiveDecisionAction =
  | 'ACCEPT'
  | 'REJECT_ACCEPTANCE'
  | 'REQUEST_REASSESSMENT'
  | 'APPROVE_TREATMENT'
  | 'ESCALATE'
  | 'ASSIGN_OWNER'
  | 'REQUEST_EVIDENCE'
  | 'SCHEDULE_REVIEW';

export interface ExecutiveDecisionItem {
  decisionId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  urgencyScore: number; // 0 - 100 explainable score
  riskId: string;
  riskCode: string;
  title: string;
  whyItMatters: string;
  whatChanged: string;
  businessImpact: string;
  sourceEvent?: string;
  supportingEvidence: string[];
  residualRiskScore: number;
  appetiteLimit: number;
  isOutsideAppetite: boolean;
  potentialExposureUSD?: number;
  accountableOwner: string;
  requiredDecision: string;
  availableActions: ExecutiveDecisionAction[];
  dueDate: string;
  verificationStatus: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  decisionAuditLog?: Array<{
    action: ExecutiveDecisionAction;
    decidedBy: string;
    decidedAt: string;
    justification: string;
  }>;
}

// ============================================================================
// PHASE 34: QUANTITATIVE RISK MODEL ASSURANCE (FAIR-GROUNDED)
// ============================================================================

export type QuantitativeInputClassification =
  | 'OBSERVED'
  | 'EXTERNAL_SOURCE'
  | 'EXPERT_ESTIMATE'
  | 'MODEL_ASSUMPTION'
  | 'AI_SUGGESTED'
  | 'UNKNOWN';

export type ProbabilityDistributionType =
  | 'BETA_PERT'
  | 'LOG_NORMAL'
  | 'TRIANGULAR'
  | 'UNIFORM';

export interface QuantitativeAssuranceParameter {
  name: string;
  value: number;
  unit: string;
  currency?: string;
  timeHorizonMonths: number;
  distribution: ProbabilityDistributionType;
  dataSource: string;
  classification: QuantitativeInputClassification;
  assumptionOwner: string;
  confidenceIntervalPercent: number; // e.g. 90%
  uncertaintyPercent: number; // e.g. 15%
  lastReviewedDate: string;
  requiresHumanApproval: boolean;
  isApproved: boolean;
}

export interface QuantitativeLossMagnitude {
  currency: string;
  minLossUSD: number;
  modeLossUSD: number;
  maxLossUSD: number;
  primaryLossUSD: number;
  secondaryLossUSD: number;
  confidenceIntervalPercent: number;
  distributionType?: ProbabilityDistributionType;
  parameters?: QuantitativeAssuranceParameter[];
}

export interface QuantitativeRiskAnalysis {
  isConfigured: boolean;
  threatEventFrequencyPerYear: number;
  vulnerabilitySusceptibilityPercent: number;
  annualLossExpectancyUSD: number;
  singleLossExpectancyUSD: number;
  lossMagnitude: QuantitativeLossMagnitude;
  monteCarloIterations?: number;
  randomSeed?: number;
  estimatedReturnOnSecurityInvestmentUSD?: number;
  assumptions: string[];
  dataQualityTier?: QuantitativeInputClassification | string;
  modelVersion?: string;
  lastSimulatedAt?: string;
}

export interface SensitivityAnalysisResult {
  riskId: string;
  variable: 'THREAT_FREQUENCY' | 'VULNERABILITY_PERCENT' | 'PRIMARY_LOSS_MODE' | 'SECONDARY_LOSS_MODE';
  baseALE: number;
  iterations: Array<{ value: number; simulatedALE: number; deltaPercent: number }>;
  elasticityIndex: number;
  assumptionsEvaluated: string[];
}

// ============================================================================
// PHASE 34: MULTI-DIMENSIONAL RISK APPETITE & TOLERANCE
// ============================================================================

export interface RiskAppetiteThreshold {
  dimension: string; // e.g. 'Cybersecurity', 'Financial Loss', 'Data Privacy', 'Downtime', 'Third-Party'
  maxAcceptableScore: number;
  maxFinancialLossUSD: number;
  maxServiceDowntimeHours: number;
  escalationRole: string; // e.g. 'CRO', 'Board Risk Committee', 'CISO'
  requiresBoardApproval: boolean;
  category: EnterpriseRiskCategory | string;
  appetiteStatement?: string;
  toleranceScore?: number;
}

export interface RiskExecutiveAcceptanceRecord {
  required: boolean;
  status: 'NOT_REQUIRED' | 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  acceptedBy?: string;
  acceptedByRole?: string;
  acceptedAt?: string;
  reviewFrequencyMonths: number;
  expiryDate?: string;
  justification: string;
  compensatingControls: string[];
  boardMeetingRef?: string;
  isExpired?: boolean;
  escalationRequired?: boolean;
}

// ============================================================================
// PHASE 34: EXPLAINABILITY TRIAD & AUDIT RECORD
// ============================================================================

export interface ShowMeWhyExplanation {
  riskId: string;
  scoringMethodology: string;
  matrixDimension: '3X3' | '4X4' | '5X5';
  inherentScoreRationale: string;
  topContributingFactors: string[];
  mitigatingControlsAnalysis: {
    controlId: string;
    controlCode: string;
    title: string;
    designStatus: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'NOT_ASSESSED';
    operatingRating: 'OPERATING_EFFECTIVELY' | 'SIGNIFICANT_DEFICIENCY' | 'MATERIAL_WEAKNESS' | 'UNTESTED';
    operatingEffectivenessPercent: number;
    evidenceFreshness: 'FRESH' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_EVIDENCE';
    riskReductionFactor: number;
    calibratedScore: number;
  }[];
  residualScoreDerivation: string;
  appetiteEvaluation: {
    withinAppetite: boolean;
    appetiteLimit: number;
    currentScore: number;
    variance: number;
  };
  provenance: RiskProvenanceTier;
  isResidualScoreIncreased?: boolean;
  scoreIncreaseDriver?: string;
}

export interface ShowMeWhatChangedExplanation {
  riskId: string;
  previousAssessmentDate: string;
  previousInherentScore: number;
  currentInherentScore: number;
  previousResidualScore: number;
  currentResidualScore: number;
  deltaInherent: number;
  deltaResidual: number;
  methodologyVersion: string;
  changeDrivers: {
    driverType: 'VULNERABILITY' | 'CONTROL_FAILURE' | 'EVIDENCE_EXPIRY' | 'REGULATORY_CHANGE' | 'ASSET_MODIFICATION' | 'SUPPLIER_INCIDENT' | 'TELEMETRY_DRIFT';
    description: string;
    detectedAt: string;
    impactOnScore: string;
  }[];
}

export interface ShowMeNextActionExplanation {
  riskId: string;
  highestValueActions: {
    priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
    actionTitle: string;
    actionType: 'IMPLEMENT_CONTROL' | 'REMEDIATE_VULNERABILITY' | 'REFRESH_EVIDENCE' | 'ESCALATE_TO_CRO' | 'CLOSE_CAPA' | 'INDEPENDENT_RETEST';
    estimatedCostUSD?: number;
    expectedRiskReductionPercent: number;
    accountableOwner: string;
    targetCompletionDate: string;
    verificationCriteria?: string;
  }[];
}

// ============================================================================
// PHASE 34: CANONICAL ENTERPRISE RISK RECORD
// ============================================================================

export interface EnterpriseRiskRecord {
  id: string;
  tenantId: string;
  riskCode: string; // e.g. "RSK-CYBER-001"
  title: string;
  description: string;
  category: EnterpriseRiskCategory;
  subcategory?: string;
  riskScenario: string;
  riskStatement: string;
  businessContext: string;
  
  // Ownership & Accountability
  riskOwner: string;
  riskOwnerEmail?: string;
  accountableExecutive: string;
  businessUnit: string;
  
  // Graph Linkages
  businessServiceIds: string[];
  assetIds: string[];
  supplierIds: string[];
  threatIds: string[];
  vulnerabilityIds: string[];
  requirementIds: string[];
  controlIds: string[];
  evidenceIds: string[];
  findingIds: string[];
  capaIds: string[];
  exceptionIds: string[];
  
  // Scoring & Methodology
  riskMethodology: RiskScoringMethodologyType;
  methodologyVersion: string;
  
  // Inherent Risk
  inherentLikelihood: number;
  inherentImpact: number;
  inherentRiskScore: number;
  inherentLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Controls & Assurance
  currentControlEffectivenessPercent: number;
  controlDesignRating: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'NOT_ASSESSED';
  controlOperatingRating: 'OPERATING_EFFECTIVELY' | 'SIGNIFICANT_DEFICIENCY' | 'MATERIAL_WEAKNESS' | 'UNTESTED';
  
  // Residual Risk
  residualLikelihood: number;
  residualImpact: number;
  residualRiskScore: number;
  residualLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetRiskScore: number;
  isResidualScoreIncreased?: boolean;
  scoreIncreaseDriver?: string;
  
  // Appetite & Velocity
  riskAppetiteScore: number;
  isOutsideAppetite: boolean;
  riskVelocity: RiskVelocityStatus;
  riskTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  confidenceLevelPercent: number;
  dataCompletenessPercent: number;
  
  // Treatment & Remediation
  treatmentStrategy: EnterpriseRiskTreatmentStrategy;
  treatmentPlanDescription: string;
  treatmentPlanBudgetUSD?: number;
  treatmentTargetDate: string;
  treatmentStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFICATION_REQUIRED' | 'DELAYED';
  
  // Governance & Lifecycle
  status: EnterpriseRiskStatus;
  assuranceStatus: RiskAssuranceState;
  executiveAcceptance: RiskExecutiveAcceptanceRecord;
  quantitativeAnalysis?: QuantitativeRiskAnalysis;
  
  // Timestamps & Audit
  lastAssessmentAt: string;
  lastAssessedBy: string;
  nextReviewAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ============================================================================
// PHASE 34: HISTORICAL RISK ASSESSMENT SNAPSHOT
// ============================================================================

export interface RiskAssessmentSnapshot {
  id: string;
  riskId: string;
  tenantId: string;
  snapshotTimestamp: string;
  assessmentReason: 'SCHEDULED_REVIEW' | 'EVENT_TRIGGERED' | 'CONTROL_FAILURE' | 'REGULATORY_CHANGE' | 'MANUAL_OVERRIDE' | 'METHODOLOGY_MIGRATION';
  methodologyId?: string;
  methodologyVersion: string;
  matrixDimension?: '3X3' | '4X4' | '5X5';
  inherentLikelihood: number;
  inherentImpact: number;
  inherentRiskScore: number;
  controlEffectivenessPercent: number;
  residualLikelihood: number;
  residualImpact: number;
  residualRiskScore: number;
  assessedBy: string;
  rationale: string;
  inputsHash: string; // SHA-256 cryptographic signature
  rawInputData?: {
    inherentLikelihood: number;
    inherentImpact: number;
    residualLikelihood: number;
    residualImpact: number;
    controlRatings: Record<string, string>;
    evidenceTimestamps: Record<string, string>;
  };
}

// ============================================================================
// PHASE 34: RISK EVENT RECALCULATION CONTRACT
// ============================================================================

export interface RiskRecalculationEvent {
  id: string;
  tenantId: string;
  correlationId?: string;
  idempotencyKey?: string;
  eventType: RiskEventTriggerType;
  sourceEntityId: string;
  sourceEntityType: 'CONTROL' | 'VULNERABILITY' | 'EVIDENCE' | 'CAPA' | 'REGULATION' | 'SUPPLIER' | 'ASSET' | 'INTEGRATION';
  eventPayload?: any;
  sourceTimestamp?: string;
  ingestionTimestamp?: string;
  occurredAt: string;
  affectedRiskIds?: string[];
  retryCount?: number;
}

// ============================================================================
// PHASE 34: EXECUTIVE RISK COMMAND SUMMARY
// ============================================================================

export interface ExecutiveRiskCommandSummary {
  tenantId: string;
  totalActiveRisks: number;
  criticalRisksCount: number;
  highRisksCount: number;
  mediumRisksCount: number;
  lowRisksCount: number;
  outsideAppetiteCount: number;
  increasingVelocityCount: number;
  overdueReviewCount: number;
  activeTreatmentsCount: number;
  overdueCapasCount: number;
  staleEvidenceRisksCount: number;
  failedControlLinkedRisksCount: number;
  supplierConcentrationRisksCount: number;
  regulatoryImpactedRisksCount: number;
  averageControlEffectivenessPercent: number;
  totalAssessedFinancialExposureUSD: number;
  totalAnnualLossExpectancyUSD: number;
  overallEnterpriseRiskScore: number;
  topRiskDrivers: EnterpriseRiskRecord[];
  topExposedBusinessServices: Array<{
    serviceId: string;
    serviceName: string;
    criticality: string;
    activeRisksCount: number;
    maxResidualScore: number;
  }>;
  observabilityMetrics?: ProductionObservabilityMetrics;
  generatedAt: string;
}

// ============================================================================
// PHASE 34: PRODUCTION OBSERVABILITY METRICS
// ============================================================================

export interface ProductionObservabilityMetrics {
  recalculationLatencyMs: number;
  eventIngestionLatencyMs: number;
  failedEventRatePercent: number;
  duplicateEventRatePercent: number;
  deadLetterQueueDepth: number;
  retrySuccessRatePercent: number;
  staleEvidencePercentage: number;
  failedRetestCount: number;
  unresolvedAppetiteBreaches: number;
  expiredRiskAcceptanceCount: number;
  activeConnectorsCount: number;
  healthyConnectorsCount: number;
  databaseTransactionErrors: number;
  tenantIsolationViolationsBlocked: number;
  lastTelemetryPollTimestamp: string;
}

// ============================================================================
// PHASE 34: AI RISK COPILOT SAFEGUARDS CONTRACT
// ============================================================================

export interface AIRiskCopilotQuery {
  tenantId: string;
  userId: string;
  userRole: string;
  question: string;
  categoryFocus?: string;
  includeQuantitativeFAIR?: boolean;
}

export interface AIRiskCopilotResponse {
  queryId: string;
  question: string;
  answerMarkdown: string;
  provenance: RiskProvenanceTier;
  referencedRiskIds: string[];
  referencedControlIds: string[];
  referencedEvidenceIds: string[];
  supportingAssumptions: string[];
  confidenceScore: number; // 0 - 100
  limitationsDisclosed: string[];
  suggestedFollowUps: string[];
  generatedAt: string;
  guardrailTriggered?: boolean;
}
