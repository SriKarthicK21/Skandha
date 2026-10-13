// SKANDA GRC — Continuous ISO Compliance Monitoring Core Types
// Production-ready data contracts for Post-Certification ISMS Operations,
// Automated Control Testing, Evidence Freshness, Drift Detection, and Audit Readiness.

export type ContinuousComplianceControlStatus =
  | 'Not Assessed'
  | 'Not Applicable — Approved'
  | 'Planned'
  | 'In Progress'
  | 'Implemented'
  | 'Operating Effectiveness Pending'
  | 'Effective'
  | 'Ineffective'
  | 'Evidence Expired'
  | 'Evidence Missing'
  | 'Nonconforming'
  | 'Exception Approved'
  | 'Remediation Required';

export type MonitoringFrequency =
  | 'Continuous'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Bi-Annual'
  | 'Annual'
  | 'Event-Driven';

export type EvidenceFreshnessRating =
  | 'Fresh'
  | 'Aging'
  | 'Stale'
  | 'Expired'
  | 'Missing';

export type AutomatedTestStatus =
  | 'PASS'
  | 'FAIL'
  | 'WARNING'
  | 'ERROR';

export type DriftSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type DriftType =
  | 'EVIDENCE_DECAY'
  | 'AUTOMATED_TEST_FAILURE'
  | 'CAPA_SLA_BREACH'
  | 'POLICY_EXPIRED'
  | 'UNMAPPED_ASSET'
  | 'ACCESS_REVIEW_MISSED'
  | 'BACKUP_RESTORE_FAILED'
  | 'VULNERABILITY_SLA_BREACH'
  | 'SCOPE_DRIFT';

export interface ContinuousControlEvaluation {
  id: string;
  tenantId: string;
  controlCode: string; // e.g. "A.5.15", "A.8.8", "Cl.9.2"
  framework: string; // "ISO/IEC 27001:2022"
  clauseOrAnnex: string;
  title: string;
  description: string;
  category: 'Organizational' | 'People' | 'Physical' | 'Technological';
  controlOwner: string;
  responsibleDepartment: string;
  applicabilityStatus: 'Applicable' | 'Not Applicable — Justified';
  implementationStatus: 'Not Started' | 'In Progress' | 'Implemented';
  operatingEffectivenessStatus: 'Effective' | 'Ineffective' | 'Pending Verification';
  overallStatus: ContinuousComplianceControlStatus;
  monitoringFrequency: MonitoringFrequency;
  lastEvaluated: string;
  nextEvaluationDue: string;
  lastEvidenceDate: string | null;
  evidenceFreshnessStatus: EvidenceFreshnessRating;
  evidenceIds: string[];
  mappedRiskIds: string[];
  mappedCapaIds: string[];
  automatedTestIds: string[];
  hasActiveException: boolean;
  exceptionReason?: string;
  exceptionApprovedBy?: string;
  exceptionExpiryDate?: string;
  driftDetected: boolean;
  driftReason?: string;
  evaluationHistory: Array<{
    evaluatedAt: string;
    status: ContinuousComplianceControlStatus;
    evaluator: string;
    notes: string;
  }>;
}

export interface AutomatedControlTest {
  id: string;
  tenantId: string;
  controlCode: string;
  testName: string;
  description: string;
  sourceSystem: string;
  executionFrequency: MonitoringFrequency;
  lastExecuted: string;
  nextExecution: string;
  status: AutomatedTestStatus;
  metricValue: string;
  threshold: string;
  failureReason?: string;
  evidenceGeneratedId?: string;
  evidenceGeneratedSha256?: string;
  testOwner: string;
  rawPayload?: Record<string, any>;
  history: Array<{
    timestamp: string;
    status: AutomatedTestStatus;
    metricValue: string;
  }>;
}

export interface CertificationLifecycle {
  tenantId: string;
  standard: 'ISO/IEC 27001:2022';
  certificationStatus:
    | 'Certified — Active'
    | 'Under Surveillance'
    | 'Recertification Pending'
    | 'Pre-Certification Readiness'
    | 'Suspended';
  certificationBody: string; // e.g. "BSI Assurance UK (UKAS Accreditation 0003)"
  certificateNumber: string; // e.g. "ISMS 749281-2024-SKD"
  scopeStatement: string;
  issueDate: string;
  expiryDate: string;
  surveillanceYear1Date: string;
  surveillanceYear1Status: 'Scheduled' | 'Fieldwork' | 'Passed' | 'Overdue';
  surveillanceYear2Date: string;
  surveillanceYear2Status: 'Scheduled' | 'Fieldwork' | 'Passed' | 'Pending';
  recertificationDate: string;
  recertificationStatus: 'Planned' | 'Pending';
  certificationConditions: string[];
  lastInternalAuditDate: string;
  nextInternalAuditDate: string;
  lastManagementReviewDate: string;
  nextManagementReviewDate: string;
  leadAuditor: string;
  cbClientManager: string;
  calculatedMetrics: {
    daysUntilSurveillance1: number;
    daysUntilSurveillance2: number;
    daysUntilRecertification: number;
    daysUntilCertificateExpiry: number;
    daysSinceInternalAudit: number;
    daysSinceManagementReview: number;
    internalAuditOverdue: boolean;
    managementReviewOverdue: boolean;
    surveillanceOverdue: boolean;
    certificationRiskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  };
}

export interface ComplianceDriftEvent {
  id: string;
  tenantId: string;
  controlCode: string;
  controlTitle: string;
  severity: DriftSeverity;
  driftType: DriftType;
  detectedAt: string;
  rootCause: string;
  recommendedAction: string;
  assignedOwner: string;
  dueDate: string;
  affectedRiskIds: string[];
  capaId?: string;
  status: 'OPEN' | 'IN_REMEDIATION' | 'VERIFICATION_PENDING' | 'RESOLVED';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditReadinessPackage {
  id: string;
  tenantId: string;
  auditType:
    | 'SURVEILLANCE_YEAR_1'
    | 'SURVEILLANCE_YEAR_2'
    | 'RECERTIFICATION'
    | 'INTERNAL_AUDIT'
    | 'CUSTOMER_AUDIT'
    | 'REGULATORY_INSPECTION';
  generatedAt: string;
  generatedBy: string;
  totalControls: number;
  effectiveControls: number;
  ineffectiveControls: number;
  readinessScore: number; // 0 - 100
  unresolvedNonconformitiesCount: number;
  manifestHash: string; // SHA-256 of entire evidence bundle
  evidenceManifest: Array<{
    controlCode: string;
    controlTitle: string;
    evidenceId: string;
    evidenceTitle: string;
    freshness: string;
    sha256: string;
    verified: boolean;
    lastReviewed: string;
  }>;
  auditorAccessToken?: string;
  packageStatus: 'VALIDATED' | 'SEALED' | 'DRIFT_ALERT';
}

export interface ContinuousComplianceSummary {
  overallComplianceScore: number;
  totalApplicableControls: number;
  effectiveControlsCount: number;
  ineffectiveControlsCount: number;
  operatingPendingCount: number;
  evidenceExpiredCount: number;
  evidenceMissingCount: number;
  activeDriftEventsCount: number;
  criticalDriftCount: number;
  failedAutomatedTestsCount: number;
  openMajorNCCount: number;
  openMinorNCCount: number;
  overdueCapaCount: number;
  evidenceVerificationRate: number;
  surveillanceReadinessScore: number;
  lastContinuousScanTimestamp: string;
}

export type EngineSchedulerStatus = 'RUNNING' | 'PAUSED' | 'IDLE' | 'ERROR';

export interface ContinuousComplianceEngineConfig {
  tenantId: string;
  pollingIntervalMs: number; // e.g. 30000 ms (30 seconds)
  enabled: boolean;
  autoDriftDetectionEnabled: boolean;
  autoTriggerRemediationRecommendations: boolean;
  notifyOnCriticalDrift: boolean;
}

export interface ContinuousComplianceEngineRunLog {
  runId: string;
  timestamp: string;
  durationMs: number;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  controlsEvaluated: number;
  evidenceFreshnessChecked: number;
  freshCount: number;
  agingCount: number;
  staleCount: number;
  expiredCount: number;
  missingCount: number;
  driftsDetected: number;
  newDriftEvents: string[];
  automatedTestsChecked: number;
  details: string;
}

export interface ContinuousComplianceEngineStatus {
  schedulerStatus: EngineSchedulerStatus;
  pollingIntervalMs: number;
  autoDriftDetectionEnabled: boolean;
  lastRunTimestamp: string | null;
  nextRunTimestamp: string | null;
  totalRunsCount: number;
  activeDriftsCount: number;
  controlsMonitoredCount: number;
  evidenceMonitoredCount: number;
  lastRunLog: ContinuousComplianceEngineRunLog | null;
  recentLogs: ContinuousComplianceEngineRunLog[];
}

// ----------------------------------------------------------------------------
// Database Schema Extensions Re-export
// ----------------------------------------------------------------------------
export * from './complianceSchema';
