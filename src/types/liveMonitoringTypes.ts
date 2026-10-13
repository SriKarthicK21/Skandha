// ============================================================================
// SKANDA Enterprise GRC — Live Monitoring & Continuous Compliance Domain Model
// Path: src/types/liveMonitoringTypes.ts
//
// Shared by the server pipeline (server/services/liveMonitoring/*) and the
// client workspaces, so that an integration maturity value, a control status
// or a signal shown in the UI is the same value the pipeline persisted.
//
// Status semantics are deliberate and documented per type: a compliance state
// must never be inferred from the absence of data, and a monitoring failure
// must never be reported as a control failure.
// ============================================================================

// ---------------------------------------------------------------------------
// INTEGRATION LIFECYCLE
// ---------------------------------------------------------------------------

/**
 * How far an integration has actually progressed. Recorded separately from
 * health: a connector can be CONNECTED and simultaneously FAILING.
 */
export type IntegrationMaturityState =
  | 'CATALOG_ONLY'
  | 'CONFIGURATION_REQUIRED'
  | 'AUTHENTICATION_PENDING'
  | 'CONNECTED'
  | 'INITIAL_SYNC_PENDING'
  | 'INITIAL_SYNC_COMPLETE'
  | 'MONITORING_ACTIVE'
  | 'DEGRADED'
  | 'AUTHENTICATION_FAILED'
  | 'DISCONNECTED';

/** Operational health of the connection itself (never the compliance state). */
export type IntegrationHealthState = 'HEALTHY' | 'DEGRADED' | 'FAILING' | 'UNKNOWN' | 'DISABLED';

/**
 * How observations actually arrive from this provider.
 * EVENT_DRIVEN means the provider pushes events.
 * SCHEDULED_POLLING means SKANDA queries on an interval.
 * PERIODIC_RECONCILIATION compares provider state against recorded state.
 */
export type MonitoringMode =
  | 'EVENT_DRIVEN'
  | 'SCHEDULED_POLLING'
  | 'PERIODIC_RECONCILIATION'
  | 'MANUAL_ONLY';

/** Declared provider capabilities. Absent capabilities are simply not offered. */
export interface ConnectorCapabilityProfile {
  supportsWebhookPush: boolean;
  supportsScheduledPolling: boolean;
  supportsIncrementalSync: boolean;
  supportsPagination: boolean;
  supportsAssetDiscovery: boolean;
  supportsConfigurationState: boolean;
  supportsVulnerabilityFeed: boolean;
  /** Provider-documented request ceiling, when one is known. */
  documentedRateLimitPerMinute?: number;
  /** Provider API scopes/roles that are actually requested (least privilege). */
  requestedScopes: string[];
}

/** A registered integration. Secrets are never stored on this record. */
export interface MonitoringIntegration {
  id: string;
  tenantId: string;
  connectorId: string;
  provider: string;
  displayName: string;
  environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX';
  monitoringMode: MonitoringMode;
  maturityState: IntegrationMaturityState;
  healthState: IntegrationHealthState;
  capabilities: ConnectorCapabilityProfile;
  /** Non-secret reference to where the credential lives (secret manager key). */
  credentialReference?: string;
  /** Least-privilege scopes actually granted to the stored credential. */
  grantedScopes: string[];
  /** Resource scope the credential is allowed to observe. */
  resourceScope: string[];
  pollIntervalSeconds: number;
  freshnessThresholdSeconds: number;
  /** Provider pagination / incremental cursor. Durable across restarts. */
  checkpoint?: {
    cursor?: string;
    etag?: string;
    lastObservationAt?: string;
    pagesProcessed?: number;
  };
  lastSuccessfulSyncAt?: string;
  lastFailedSyncAt?: string;
  lastError?: string;
  consecutiveFailureCount: number;
  isEnabled: boolean;
  disconnectedAt?: string;
  credentialRevokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// CANONICAL SECURITY SIGNAL
// ---------------------------------------------------------------------------

/** Canonical signal types the platform evaluates. Provider events map onto these. */
export type CanonicalSignalType =
  | 'IDENTITY_MFA_STATE'
  | 'IDENTITY_PRIVILEGED_ROLE_GRANT'
  | 'IDENTITY_STALE_ACCOUNT'
  | 'IDENTITY_SSO_ENFORCEMENT'
  | 'REPOSITORY_BRANCH_PROTECTION'
  | 'REPOSITORY_SECRET_SCANNING'
  | 'REPOSITORY_CODE_OWNERSHIP'
  | 'REPOSITORY_MFA_ENFORCEMENT'
  | 'CLOUD_STORAGE_ENCRYPTION'
  | 'CLOUD_PUBLIC_EXPOSURE'
  | 'ENDPOINT_PROTECTION_STATE'
  | 'VULNERABILITY_FINDING'
  | 'VULNERABILITY_SLA_BREACH'
  | 'CONFIGURATION_BASELINE_DRIFT'
  | 'GENERIC_SECURITY_EVENT';

/**
 * Observed state vocabulary. Providers report booleans, lists or counts; the
 * normalizer reduces them to these shapes so evaluation stays deterministic.
 */
export type ObservedStateValue = boolean | number | string | string[] | null;

export type SignalProcessingStatus =
  | 'RECEIVED'
  | 'REJECTED_MALFORMED'
  | 'REJECTED_UNVERIFIED_SIGNATURE'
  | 'REJECTED_UNKNOWN_INTEGRATION'
  | 'DUPLICATE_SUPPRESSED'
  | 'QUEUED'
  | 'PROCESSED'
  | 'PROCESSING_FAILED'
  | 'DEAD_LETTERED';

export interface SignalProvenance {
  /** The raw provider event, or an immutable reference to it. */
  sourceEventReference: string;
  sourceEventSha256: string;
  sourceApiVersion?: string;
  /** True when the payload was accepted from an untrusted channel (webhook). */
  receivedFromUntrustedChannel: boolean;
  /** Signature scheme verified before acceptance, when applicable. */
  signatureVerification?: 'HMAC_SHA256_VERIFIED' | 'NOT_PROVIDED' | 'NOT_APPLICABLE';
  rawPayloadPreserved: boolean;
}

/** The canonical security signal. Everything downstream reads this record. */
export interface SecuritySignal {
  id: string;
  tenantId: string;
  integrationId: string;
  connectorId: string;
  provider: string;
  /** Provider-side identifier for the event or the observed resource revision. */
  providerEventId: string;
  providerEventType: string;
  signalType: CanonicalSignalType;
  /** Canonical SKANDA entity (asset / identity / repository / control owner). */
  canonicalEntityType: 'ASSET' | 'IDENTITY' | 'REPOSITORY' | 'VULNERABILITY' | 'CONTROL_OWNER' | 'UNKNOWN';
  canonicalEntityId: string;
  resourceRef: string;
  resourceScope: string[];
  observedState: ObservedStateValue;
  previousState?: ObservedStateValue;
  /** When the provider observed the state (never when SKANDA received it). */
  sourceObservedAt: string;
  /** When SKANDA accepted the signal. */
  ingestedAt: string;
  sourceRevision?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  provenance: SignalProvenance;
  correlationId: string;
  idempotencyKey: string;
  processingStatus: SignalProcessingStatus;
  /** Provider fields retained verbatim for traceability. */
  providerFields: Record<string, unknown>;
  evaluatedControlIds: string[];
  rejectionReason?: string;
}

// ---------------------------------------------------------------------------
// DETERMINISTIC CONTROL EVALUATION
// ---------------------------------------------------------------------------

/**
 * Compliance status vocabulary.
 *
 * COMPLIANT            the rule evaluated true against current observed facts.
 * NON_COMPLIANT        the rule evaluated false against current observed facts.
 * PARTIALLY_COMPLIANT  the rule's requirement is met for part of the scope only.
 * UNKNOWN              the state cannot be established (missing or unreadable data).
 * NOT_APPLICABLE       the applicability engine excluded the control.
 * NOT_EVALUATED        no evaluation has been attempted yet.
 * STALE               the last successful observation is older than the policy.
 */
export type ControlComplianceStatus =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'UNKNOWN'
  | 'NOT_APPLICABLE'
  | 'NOT_EVALUATED'
  | 'STALE';

export type EvaluationOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'IS_TRUE'
  | 'IS_FALSE'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL'
  | 'CONTAINS_ALL'
  | 'CONTAINS_ANY'
  | 'IS_NOT_EMPTY'
  | 'IS_EMPTY'
  | 'WITHIN_SLA_DAYS';

export interface EvaluationRuleDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  /** Canonical signal this rule consumes. */
  appliesToSignalType: CanonicalSignalType;
  /** Control the rule decides, in the canonical control register. */
  controlId: string;
  controlCode: string;
  frameworkCodes: string[];
  /** Field on the observed state the rule reads. */
  factPath: string;
  operator: EvaluationOperator;
  /** Comparison operand for operators that need one. */
  expected?: ObservedStateValue;
  /** Human-readable expected condition recorded on every evaluation. */
  expectedCondition: string;
  failureExplanation: string;
  remediationGuidance: string;
  /** Default severity when the rule fails. */
  failureSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  /**
   * True only when a single observation is sufficient to assert a continuing
   * state. Rules that are not point-in-time must be reconciled or re-tested.
   */
  pointInTimeObservation: boolean;
  /** Days allowed before a breach of this rule is treated as an SLA breach. */
  slaDays?: number;
}

export interface ControlEvaluationRecord {
  id: string;
  tenantId: string;
  signalId: string;
  integrationId: string;
  controlId: string;
  controlCode: string;
  controlVersion: string;
  ruleId: string;
  ruleVersion: string;
  frameworkCodes: string[];
  organizationScope: string[];
  resourceScope: string[];
  /** The provider resource this evaluation applies to. */
  resourceRef: string;
  observedFacts: Record<string, unknown>;
  expectedCondition: string;
  actualCondition: string;
  result: ControlComplianceStatus;
  reason: string;
  failureExplanation?: string;
  remediationGuidance?: string;
  evaluatedAt: string;
  sourceObservedAt: string;
  evidenceId?: string;
  relatedRiskIds: string[];
  /** True when this evaluation was produced without contacting the provider. */
  evaluatedFromReconciliation: boolean;
}

// ---------------------------------------------------------------------------
// CONTINUOUS STATE, DRIFT AND FINDINGS
// ---------------------------------------------------------------------------

export interface ControlMonitoringState {
  id: string;
  tenantId: string;
  /** Integration whose observation most recently determined this state. */
  integrationId?: string;
  controlId: string;
  controlCode: string;
  controlVersion: string;
  ruleId: string;
  ruleVersion: string;
  resourceRef: string;
  status: ControlComplianceStatus;
  /** The last confirmed compliance status, retained when status is STALE/UNKNOWN. */
  lastKnownStatus: ControlComplianceStatus;
  lastObservedState: ObservedStateValue;
  lastSignalId?: string;
  lastEvaluationId?: string;
  lastSuccessfulCollectionAt?: string;
  lastSourceObservationAt?: string;
  lastEvaluatedAt?: string;
  expectedCollectionIntervalSeconds: number;
  freshnessThresholdSeconds: number;
  isStale: boolean;
  monitoringFailure: boolean;
  monitoringFailureReason?: string;
  /** Distinguishes a monitoring failure from a control failure in the UI. */
  failureKind: 'NONE' | 'CONTROL_FAILURE' | 'MONITORING_FAILURE' | 'EVIDENCE_GAP';
  openFindingId?: string;
  consecutiveFailureCount: number;
  updatedAt: string;
}

export type TransitionTriggerKind = 'SIGNAL' | 'RECONCILIATION' | 'RETEST' | 'MANUAL_REVIEW' | 'FRESHNESS_EXPIRY';

export interface ControlStateTransition {
  id: string;
  tenantId: string;
  controlId: string;
  controlCode: string;
  resourceRef: string;
  previousStatus: ControlComplianceStatus;
  newStatus: ControlComplianceStatus;
  triggerKind: TransitionTriggerKind;
  triggerSignalId?: string;
  ruleId: string;
  ruleVersion: string;
  evidenceId?: string;
  sourceObservedAt?: string;
  evaluatedAt: string;
  reason: string;
  findingId?: string;
  notificationId?: string;
}

export type MonitoringFindingStatus =
  | 'OPEN'
  | 'REMEDIATION_IN_PROGRESS'
  | 'AWAITING_RETEST'
  | 'CLOSED_VERIFIED'
  | 'CLOSED_UNVERIFIED'
  | 'REOPENED';

/**
 * Links a monitoring condition to the canonical SKANDA finding record. The
 * dedupKey guarantees one finding per (control, resource, rule) while the
 * condition persists, so repeated polling never creates duplicate findings.
 */
export interface MonitoringFindingLink {
  id: string;
  tenantId: string;
  dedupKey: string;
  controlId: string;
  controlCode: string;
  resourceRef: string;
  ruleId: string;
  ruleVersion: string;
  /** Canonical FindingEntity id in the GRC store (findings table). */
  canonicalFindingId: string;
  domainFindingStatus: MonitoringFindingStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  firstDetectedAt: string;
  lastDetectedAt: string;
  occurrenceCount: number;
  lastSignalId?: string;
  evidenceIds: string[];
  ownerEmail?: string;
  remediationTaskId?: string;
  awaitingRetestSince?: string;
  retestSignalId?: string;
  verifiedRecoveredAt?: string;
  closurePolicy: 'REQUIRES_VERIFIED_RECOVERY';
  reopenedCount: number;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// DURABLE JOB PROCESSING
// ---------------------------------------------------------------------------

export type MonitoringJobType = 'PROCESS_SIGNAL' | 'RECONCILE_CONTROL' | 'RETEST_FINDING' | 'INGEST_CONNECTOR';

export type MonitoringJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED_RETRYABLE'
  | 'DEAD_LETTERED'
  | 'CANCELLED';

export interface MonitoringJob {
  id: string;
  tenantId: string;
  jobType: MonitoringJobType;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  status: MonitoringJobStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  lastError?: string;
  correlationId: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  processedAt?: string;
}

export interface MonitoringDeadLetterRecord {
  id: string;
  tenantId: string;
  jobId: string;
  jobType: MonitoringJobType;
  correlationId: string;
  failureReason: string;
  payload: Record<string, unknown>;
  attemptCount: number;
  deadLetteredAt: string;
  status: 'DEAD_LETTER' | 'REPLAYED' | 'DISCARDED';
  replayedAt?: string;
  replayAttemptIds: string[];
}

// ---------------------------------------------------------------------------
// FRESHNESS, HEALTH AND DASHBOARD PROJECTIONS
// ---------------------------------------------------------------------------

export interface MonitoringFreshness {
  lastSuccessfulCollectionAt?: string;
  lastSourceObservationAt?: string;
  lastEvaluatedAt?: string;
  expectedCollectionIntervalSeconds: number;
  freshnessThresholdSeconds: number;
  ageSeconds?: number;
  isStale: boolean;
  /** Presenting stale data as current compliance is prohibited. */
  presentationRule: 'CURRENT' | 'STALE_SHOW_LAST_KNOWN' | 'UNKNOWN_NO_DATA';
}

export interface IntegrationHealthSnapshot {
  integrationId: string;
  provider: string;
  displayName: string;
  maturityState: IntegrationMaturityState;
  healthState: IntegrationHealthState;
  monitoringMode: MonitoringMode;
  lastSuccessfulSyncAt?: string;
  lastFailedSyncAt?: string;
  lastError?: string;
  consecutiveFailureCount: number;
  observedLatencyMs?: number;
  eventThroughput: {
    received: number;
    processed: number;
    duplicatesSuppressed: number;
    rejected: number;
    deadLettered: number;
  };
  errorRatePercent: number;
  staleDataWarnings: string[];
}

export interface MonitoringOverview {
  tenantId: string;
  generatedAt: string;
  integrations: {
    total: number;
    healthy: number;
    degraded: number;
    failing: number;
    disconnected: number;
    monitoringActive: number;
    authenticationFailed: number;
  };
  controls: {
    total: number;
    compliant: number;
    nonCompliant: number;
    partiallyCompliant: number;
    unknown: number;
    stale: number;
    notEvaluated: number;
    notApplicable: number;
  };
  findings: {
    open: number;
    remediationInProgress: number;
    awaitingRetest: number;
    overdue: number;
    reopened: number;
    closedVerified: number;
  };
  pipeline: {
    signalsReceived: number;
    signalsProcessed: number;
    duplicatesSuppressed: number;
    signalsRejected: number;
    deadLettered: number;
    averageProcessingLatencyMs?: number;
    lastProcessedAt?: string;
  };
  recentlyRecoveredControlIds: string[];
  /** Explicitly communicates that event-driven sources are not instant. */
  latencyDisclaimer: string;
}
