/**
 * SKANDA ENTERPRISE ASSURANCE INTELLIGENCE & AUDITOR WORKBENCH TYPES
 * Path: src/types/assuranceTypes.ts
 * 
 * Phase 20 Core Domain Models:
 * - Assurance Explanation Dimensions (Implementation, Evidence, Integrity, Freshness, Testing, Findings, CAPA, Retest, Exception, Monitoring)
 * - Transparent & Reproducible Confidence Scoring Model
 * - Bidirectional Evidence Lineage (Upstream & Downstream)
 * - Immutable Control Effectiveness History Timeline
 * - Continuous Compliance Drift Intelligence
 * - Enterprise Assurance Posture & Executive Summaries
 * - Auditor Workbench Workspaces & Cleanroom Isolation
 */

export type AssuranceOverallStatus = 
  | 'EFFECTIVE'
  | 'CONDITIONALLY_EFFECTIVE'
  | 'PARTIALLY_EFFECTIVE'
  | 'DEFICIENT'
  | 'NOT_TESTED';

export type AssuranceDimensionStatus = 
  | 'PASS'
  | 'WARNING'
  | 'FAIL'
  | 'NONE'
  | 'NOT_CONFIGURED';

export type ConfidenceRatingLevel = 
  | 'VERY_HIGH'   // 90 - 100%
  | 'HIGH'        // 75 - 89%
  | 'MODERATE'    // 50 - 74%
  | 'LOW'         // 25 - 49%
  | 'UNRELIABLE'; // 0 - 24%

export type EvidenceFreshnessCategory = 
  | 'CURRENT'
  | 'EXPIRING'
  | 'STALE'
  | 'EXPIRED'
  | 'UNKNOWN';

export interface AssuranceDimensionCheck {
  id: string;
  dimension: 
    | 'IMPLEMENTATION'
    | 'EVIDENCE'
    | 'INTEGRITY'
    | 'FRESHNESS'
    | 'TESTING'
    | 'FINDINGS'
    | 'CAPA'
    | 'RETEST'
    | 'EXCEPTIONS'
    | 'MONITORING'
    | 'OWNERSHIP'
    | 'AUDITABILITY';
  title: string;
  status: AssuranceDimensionStatus;
  summary: string;
  details: string;
  evidenceReference?: string;
  deepLink?: {
    module: string;
    tab?: string;
    entityId: string;
    entityType: string;
  };
  authoritativeRecords: Array<{
    recordId: string;
    recordType: string;
    recordSummary: string;
    timestamp?: string;
  }>;
}

export interface AssuranceConfidenceFactor {
  factorId: string;
  name: string;
  weightPercent: number;
  scorePercent: number;
  weightedScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  rationale: string;
  sourceRecordIds: string[];
}

export interface AssuranceConfidenceBreakdown {
  overallScore: number; // 0 - 100
  confidenceLevel: ConfidenceRatingLevel;
  calculationVersion: string; // e.g. "v2026.4"
  calculationTimestamp: string;
  scoringModelFormula: string;
  responsibleEngine: string;
  factors: AssuranceConfidenceFactor[];
  isReproducible: boolean;
  scoringHash: string; // SHA-256 seal of the score parameters
}

export interface EvidenceLineageChainNode {
  nodeId: string;
  nodeType: 'FRAMEWORK' | 'REQUIREMENT' | 'RISK' | 'CONTROL' | 'POLICY' | 'SOP' | 'IMPLEMENTATION' | 'EVIDENCE' | 'TEST' | 'FINDING' | 'CAPA' | 'RETEST' | 'AUDIT';
  code: string;
  title: string;
  status: string;
  direction: 'UPSTREAM' | 'ROOT' | 'DOWNSTREAM';
  relationship: string;
  sha256Digest?: string;
  owner?: string;
  timestamp?: string;
  details?: Record<string, any>;
}

export interface ControlHistoryTimelineEvent {
  eventId: string;
  timestamp: string;
  periodLabel: string; // e.g. "Q1 2026", "Q2 2026 Fieldwork", "Oct 2026 Retest"
  postureStatus: AssuranceOverallStatus;
  testResult?: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_TESTED';
  actor: string;
  actorRole: string;
  actionSummary: string;
  deficienciesNotedCount: number;
  linkedFindingId?: string;
  linkedCapaId?: string;
  linkedRetestId?: string;
  evidenceIds: string[];
  isHistoricalPreserved: boolean;
}

export interface ControlDriftChangeItem {
  changeId: string;
  detectedAt: string;
  driftType: 
    | 'EVIDENCE_REPLACED'
    | 'EVIDENCE_EXPIRING_SOON'
    | 'OWNER_CHANGED'
    | 'IMPLEMENTATION_MODIFIED'
    | 'CONFIGURATION_DRIFT'
    | 'TEST_STATUS_CHANGED'
    | 'FINDING_OPENED'
    | 'FINDING_CLOSED'
    | 'EXCEPTION_CREATED'
    | 'EXCEPTION_EXPIRED'
    | 'TELEMETRY_ANOMALY';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  previousValue?: string;
  currentValue?: string;
  sourceEventId?: string;
  correlationId?: string;
}

export interface AIAssuranceInsights {
  disclaimer: 'AI-GENERATED / HUMAN VALIDATION REQUIRED';
  confidenceScore: number;
  executiveSummary: string;
  historicalPatternAnalysis: string;
  suggestedAuditorQuestions: string[];
  potentialInconsistenciesNoted: string[];
  recommendedProactiveActions: string[];
  referencedCanonicalRecordIds: string[];
  humanVerified: boolean;
  verifiedBy?: string;
}

export interface ControlAssuranceExplanation {
  controlCode: string;
  controlTitle: string;
  category: string;
  operatingEnvironment: string;
  ownerName: string;
  technicalCustodian: string;
  tenantId: string;
  
  // High-Level Posture
  assuranceStatus: AssuranceOverallStatus;
  statusRationale: string;
  confidence: AssuranceConfidenceBreakdown;
  
  // 10-Point "Show Me Why" Checks
  checks: AssuranceDimensionCheck[];
  
  // Lineage & Traceability
  evidenceLineage: EvidenceLineageChainNode[];
  
  // History & Preserved Retests
  historyTimeline: ControlHistoryTimelineEvent[];
  
  // Continuous Monitoring & Drift
  driftIntelligence: ControlDriftChangeItem[];
  
  // AI Synthesis (Strictly Governed)
  aiInsights?: AIAssuranceInsights;
  
  generatedAt: string;
}

export interface AttentionItem {
  id: string;
  category: 'EXPIRING_EVIDENCE' | 'INTEGRITY_ALERT' | 'FAILED_CONTROL' | 'OPEN_FINDING' | 'OVERDUE_CAPA' | 'EXPIRED_EXCEPTION' | 'TELEMETRY_DRIFT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  controlCode: string;
  entityId: string;
  actionRequired: string;
  dueDate?: string;
}

export interface EnterpriseAssuranceSummary {
  tenantId: string;
  tenantName: string;
  overallEnterprisePosture: AssuranceOverallStatus;
  overallConfidenceScore: number;
  confidenceBreakdown: AssuranceConfidenceFactor[];
  
  controlDistribution: {
    totalControls: number;
    effectiveCount: number;
    conditionallyEffectiveCount: number;
    partiallyEffectiveCount: number;
    deficientCount: number;
    untestedCount: number;
    effectivePercentage: number;
  };
  
  frameworkReadiness: Array<{
    frameworkCode: string;
    frameworkName: string;
    readinessPercent: number;
    status: 'AUDIT_READY' | 'MINOR_GAPS' | 'REMEDIATION_REQUIRED';
    totalRequirements: number;
    compliantRequirements: number;
  }>;
  
  topAttentionItems: AttentionItem[];
  
  generatedAt: string;
  sha256AuditSeal: string;
}

export interface AssuranceExportResult {
  exportId: string;
  tenantId: string;
  format: 'JSON' | 'CSV' | 'TEXT';
  scopeControlCodes: string[];
  generatedAt: string;
  exportedBy: string;
  modelCodeVersion: string;
  sha256MasterSeal: string;
  dataContent: string;
}
