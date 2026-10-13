// ============================================================================
// SKANDA ENTERPRISE GRC: MAS TRM CONTINUOUS ASSURANCE OS CONTRACTS
// Path: src/types/masTrmContinuousAssuranceTypes.ts
//
// Phase 25: Continuous Compliance Monitoring, Control Effectiveness & Executive Assurance
// Enforces:
//  - One Canonical Graph (MAS Source -> Version -> Clause -> Req -> Control -> Risk -> Policy -> Evidence -> Test -> Finding -> CAPA -> Retest -> Assurance)
//  - 3-Way Decoupling: Design Effectiveness != Operating Effectiveness != Continuous Assurance
//  - Deterministic 5-State Control Assurance (FULL, LIMITED, CONDITIONAL, AT_RISK, NO_ASSURANCE)
//  - Live Continuous Signals (IAM, PAM MFA, Backup, DR, CSPM, EDR, Vulnerability, TPRM)
//  - Negative Assurance Invariants (No evidence/stale/failed/open finding/overdue CAPA -> No Full Assurance)
//  - Event-Driven Incremental Reassessment & Regulatory Change Integration
//  - Multi-Tenant Isolation & Zero Data Leakage
// ============================================================================

import {
  FinancialInstitutionType,
  ImpactLevel,
  RegulatoryFamily,
  SourceClassification
} from './masRegulatoryIntelligenceTypes';
import {
  MasTrmClause,
  MasTrmMaturityLevel
} from './masTrmStructuredTypes';

// ============================================================================
// 1. ASSURANCE & EFFECTIVENESS ENUMS
// ============================================================================

export type MasTrmContinuousPosture =
  | 'STRONG'
  | 'MANAGED'
  | 'PARTIALLY_MANAGED'
  | 'AT_RISK'
  | 'INSUFFICIENT_ASSURANCE';

export type MasTrmControlAssuranceState =
  | 'FULL_ASSURANCE'
  | 'LIMITED_ASSURANCE'
  | 'CONDITIONAL_ASSURANCE'
  | 'AT_RISK'
  | 'NO_ASSURANCE'
  | 'ASSURANCE_REVIEW_REQUIRED';

export type MasTrmDesignEffectiveness =
  | 'EFFECTIVE'
  | 'PARTIALLY_EFFECTIVE'
  | 'INEFFECTIVE'
  | 'NOT_TESTED';

export type MasTrmOperatingEffectiveness =
  | 'EFFECTIVE'
  | 'PARTIALLY_EFFECTIVE'
  | 'INEFFECTIVE'
  | 'FAILED'
  | 'NOT_TESTED';

export type MasTrmEvidenceFreshnessStatus =
  | 'CURRENT'
  | 'STALE'
  | 'EXPIRED'
  | 'MISSING'
  | 'TAMPERED'
  | 'PENDING_REVIEW';

export type MasTrmControlHealthStatus =
  | 'HEALTHY'
  | 'AT_RISK'
  | 'INEFFECTIVE'
  | 'NOT_TESTED'
  | 'STALE'
  | 'EXCEPTIONED'
  | 'NOT_APPLICABLE';

export type AssuranceConfidenceLevel =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNKNOWN';

export type SignalConnectorType =
  | 'IAM'
  | 'PAM_MFA'
  | 'VULNERABILITY_SCAN'
  | 'ENDPOINT_EDR'
  | 'CLOUD_CSPM'
  | 'BACKUP_IMMUTABLE'
  | 'DR_ORCHESTRATION'
  | 'SIEM_INCIDENT'
  | 'TPRM_ASSESSMENT'
  | 'POLICY_ACK'
  | 'TRAINING_LMS'
  | 'CONFIG_DRIFT'
  | 'ACCESS_REVIEW'
  | 'PEN_TEST'
  | 'AUDIT_TRACKING';

export type SignalConnectorStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'DEGRADED'
  | 'ERROR';

export type ReassessmentTriggerCategory =
  | 'REGULATION_CHANGED'
  | 'CONTROL_CHANGED'
  | 'EVIDENCE_EXPIRED'
  | 'EVIDENCE_CHANGED'
  | 'TEST_FAILED'
  | 'FINDING_OPENED'
  | 'CAPA_OVERDUE'
  | 'EXCEPTION_EXPIRED'
  | 'TELEMETRY_DRIFT'
  | 'OWNER_CHANGED'
  | 'APPLICABILITY_CHANGED'
  | 'RETEST_PASSED'
  | 'MANUAL_REFRESH';

export type CopilotTaxonomyClassification =
  | 'DIRECT_SOURCE'
  | 'SOURCE_DERIVED'
  | 'OSA_MAPPING'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDED_CONTROL'
  | 'CUSTOMER_DATA'
  | 'UNKNOWN';

// ============================================================================
// 2. LIVE TELEMETRY SIGNALS & AUTOMATED TESTING CONTRACTS
// ============================================================================

export interface ContinuousAssuranceSignal {
  signalId: string;
  tenantId: string;
  connectorType: SignalConnectorType;
  connectorName: string;
  status: SignalConnectorStatus;
  lastHeartbeatAt: string;
  targetControlCode: string;
  signalPayload: Record<string, any>;
  signalSeverity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  anomalyDetected: boolean;
  driftDetails?: string;
}

export interface AutomatedControlTestSpec {
  testId: string;
  controlCode: string;
  testName: string;
  dataSource: string;
  frequency: 'CONTINUOUS' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  lastRunAt: string;
  nextRunAt: string;
  result: 'PASS' | 'FAIL' | 'WARNING' | 'SKIPPED';
  failureReason?: string;
  evidenceArtifactId?: string;
  executionLatencyMs: number;
}

export interface NegativeAssuranceCondition {
  conditionId: string;
  controlCode: string;
  category:
    | 'NO_EVIDENCE'
    | 'STALE_EVIDENCE'
    | 'EXPIRED_EVIDENCE'
    | 'TAMPERED_EVIDENCE'
    | 'FAILED_CONTROL_TEST'
    | 'OPEN_FINDING'
    | 'OVERDUE_CAPA'
    | 'EXPIRED_EXCEPTION'
    | 'UNRESOLVED_RISK'
    | 'TELEMETRY_DRIFT'
    | 'MISSING_OWNER'
    | 'TEST_OVERDUE'
    | 'DISCONNECTED_SOURCE';
  description: string;
  detectedAt: string;
  blocksFullAssurance: true;
  remediationHint: string;
}

// ============================================================================
// 3. CONTINUOUS CONTROL ASSURANCE MODEL
// ============================================================================

export interface MasTrmContinuousControlAssurance {
  controlCode: string;
  controlTitle: string;
  clauseNumber: number;
  clauseTitle: string;
  requirementId: string;
  requirementSection: string;
  applicable: boolean;
  implementationStatus: 'IMPLEMENTED' | 'OPERATING' | 'IN_PROGRESS' | 'NOT_STARTED' | 'NOT_APPLICABLE';
  designEffectiveness: MasTrmDesignEffectiveness;
  operatingEffectiveness: MasTrmOperatingEffectiveness;
  controlHealth: MasTrmControlHealthStatus;
  assuranceState: MasTrmControlAssuranceState;
  confidenceLevel: AssuranceConfidenceLevel;
  confidenceRationale: string;
  evidenceFreshness: MasTrmEvidenceFreshnessStatus;
  evidenceCount: number;
  lastTestedAt: string;
  nextTestDueAt: string;
  lastTestResult: 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_TESTED';
  openFindingsCount: number;
  overdueCapasCount: number;
  activeExceptionsCount: number;
  expiredExceptionsCount: number;
  hasTelemetryDrift: boolean;
  signalConnectorStatus: SignalConnectorStatus;
  negativeConditions: NegativeAssuranceCondition[];
  mitigatedRiskCodes: string[];
  mappedPolicyCodes: string[];
  mappedVendorIds: string[];
  lastReassessedAt: string;
  reassessmentTrigger: string;
}

export interface MasTrmClauseContinuousPosture {
  clauseNumber: number;
  clauseTitle: string;
  applicableRequirementsCount: number;
  totalControlsCount: number;
  implementedControlsCount: number;
  effectiveControlsCount: number;
  atRiskControlsCount: number;
  noAssuranceControlsCount: number;
  openFindingsCount: number;
  overdueCapasCount: number;
  clauseAssuranceState: MasTrmControlAssuranceState;
  readinessRate: number; // 0 to 100
}

// ============================================================================
// 4. EXECUTIVE COMMAND CENTER & BOARD ASSURANCE REPORT
// ============================================================================

export interface MasTrmExecutiveCommandCenter {
  tenantId: string;
  overallPosture: MasTrmContinuousPosture;
  overallPostureScore: number; // 0 to 100
  totalApplicableControls: number;
  fullAssuranceControlsCount: number;
  limitedAssuranceControlsCount: number;
  conditionalAssuranceControlsCount: number;
  atRiskControlsCount: number;
  noAssuranceControlsCount: number;
  assuranceReviewRequiredCount: number;
  evidenceFreshnessRate: number; // 0.00 to 1.00
  testingCurrentRate: number; // 0.00 to 1.00
  openCriticalFindingsCount: number;
  overdueCapasCount: number;
  expiredExceptionsCount: number;
  thirdPartyVendorsAtRiskCount: number;
  criticalResilienceControlsHealthy: boolean;
  clausePostures: MasTrmClauseContinuousPosture[];
  trends30Days: { date: string; postureScore: number; atRiskCount: number }[];
  trends90Days: { date: string; postureScore: number; atRiskCount: number }[];
  trends12Months: { date: string; postureScore: number; atRiskCount: number }[];
  topBoardActions: {
    id: string;
    title: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    owner: string;
    deadline: string;
    relatedClause: number;
  }[];
  upcomingRegulatoryMilestones: {
    noticeNumber: string;
    title: string;
    effectiveDate: string;
    daysRemaining: number;
    targetSector: string;
  }[];
  lastRecalculatedAt: string;
}

export interface MasTrmBoardAssuranceReport {
  reportId: string;
  tenantId: string;
  institutionName: string;
  institutionType: FinancialInstitutionType;
  generatedAt: string;
  reportingPeriod: string;
  executiveSummary: string;
  overallPosture: MasTrmContinuousPosture;
  overallPostureScore: number;
  materialTechRisksSummary: string;
  criticalControlsPosture: string;
  majorRegulatoryChanges: string[];
  topOpenFindings: {
    findingId: string;
    title: string;
    severity: ImpactLevel;
    controlCode: string;
    daysOpen: number;
  }[];
  overdueCapas: {
    capaId: string;
    title: string;
    owner: string;
    daysOverdue: number;
    targetDueDate: string;
  }[];
  tprmVendorRiskSummary: string;
  resilience4HourRtoPosture: string;
  cyberSecurityAssessmentStatus: string;
  activeExceptionsCount: number;
  requiredBoardActions: string[];
  assuranceLimitationNotice: string;
  cryptographicSignature: string;
}

// ============================================================================
// 5. TRACEABILITY & REASONING (SHOW ME WHY & SHOW ME WHAT CHANGED)
// ============================================================================

export interface MasTrmShowMeWhy14StageTrace {
  controlCode: string;
  controlTitle: string;
  stage1_regulatorySource: {
    authority: string;
    documentTitle: string;
    publicationDate: string;
    officialUrl: string;
    sha256Digest: string;
  };
  stage2_regulatoryVersion: {
    versionId: string;
    effectiveDate: string;
    currentStatus: string;
    statutoryAct: string;
  };
  stage3_clause: {
    clauseNumber: number;
    clauseTitle: string;
    officialPageRange: string;
  };
  stage4_requirement: {
    requirementId: string;
    sectionCode: string;
    title: string;
    statutoryText: string;
    mandatory: boolean;
  };
  stage5_controlObjective: {
    objectiveCode: string;
    statement: string;
  };
  stage6_canonicalControl: {
    canonicalCode: string;
    title: string;
    implementationStatus: string;
    ownerRole: string;
  };
  stage7_risk: {
    riskCode: string;
    riskTitle: string;
    inherentScore: number;
    residualScore: number;
    treatmentPlan: string;
  };
  stage8_policy: {
    policyCode: string;
    title: string;
    status: string;
    reviewRequired: boolean;
  };
  stage9_process: {
    processCode: string;
    title: string;
    owner: string;
  };
  stage10_evidence: {
    evidenceId: string;
    title: string;
    freshnessStatus: MasTrmEvidenceFreshnessStatus;
    sha256Digest: string;
    expiresAt: string;
    lastVerifiedAt: string;
  };
  stage11_controlTest: {
    testId: string;
    testMethod: string;
    sampleSize: string;
    executedAt: string;
    tester: string;
  };
  stage12_testResult: {
    result: string;
    designEffectiveness: MasTrmDesignEffectiveness;
    operatingEffectiveness: MasTrmOperatingEffectiveness;
    exceptionsFound: number;
  };
  stage13_findingAndCapa: {
    findingId?: string;
    severity?: string;
    capaId?: string;
    retestStatus?: string;
  };
  stage14_finalAssurance: {
    assuranceState: MasTrmControlAssuranceState;
    confidenceLevel: AssuranceConfidenceLevel;
    rationale: string;
    negativeConditionsCount: number;
  };
}

export interface MasTrmShowMeWhatChangedDiff {
  diffId: string;
  controlCode: string;
  timestamp: string;
  previousAssurance: MasTrmControlAssuranceState;
  currentAssurance: MasTrmControlAssuranceState;
  transitionReason: string;
  triggerCategory: ReassessmentTriggerCategory;
  deltaDetails: string;
  actionRequired: string;
}

// ============================================================================
// 6. AI CONTINUOUS ASSURANCE COPILOT
// ============================================================================

export interface AICopilotAssuranceQuery {
  tenantId: string;
  query: string;
  focusedControlCode?: string;
  focusedClauseNumber?: number;
}

export interface AICopilotAssuranceResponse {
  answer: string;
  authority: string;
  sourceClassification: CopilotTaxonomyClassification;
  confidenceLevel: AssuranceConfidenceLevel;
  confidenceScore: number; // 0.0 to 1.0
  officialCitation: string;
  sectionReference: string;
  documentHash: string;
  currentAssuranceState?: MasTrmControlAssuranceState;
  identifiedEvidenceGaps?: string[];
  recommendedTestingSteps?: string[];
  skandaRecommendedControls?: string[];
  customerDataCitations?: string[];
  interpretationNote?: string;
}
