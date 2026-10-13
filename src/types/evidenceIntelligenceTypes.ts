/**
 * SKANDA Enterprise GRC & Continuous Assurance Platform
 * Canonical Types for Evidence Intelligence & Autonomous Evidence Automation Fabric
 * 
 * Invariants:
 * 1. ZERO FABRICATION - Evidence represents deterministic, verifiable facts from authentic sources.
 * 2. EVIDENCE != IMPLEMENTATION != OPERATING EFFECTIVENESS != CONTINUOUS ASSURANCE.
 * 3. 1 ARTIFACT -> MULTI-FRAMEWORK REUSE - A single verified harvest satisfies ISO 27001, SOC 2, MAS TRM, DPDP, and NIST.
 * 4. CRYPTOGRAPHIC WORM NON-REPUDIATION - Every evidence object has SHA-256 content hashes, parent hashes, and Merkle proofs.
 * 5. CLOSED-LOOP LINEAGE - Full traceability from Source -> Normalized Data -> Test -> CAPA -> Retest -> Assurance.
 */

import { IntegrationProviderId, AutomatedCheckDomain } from './integrationFabricTypes';

// ============================================================================
// 1. EVIDENCE CATEGORIES & TYPES
// ============================================================================

export type EvidenceCategory =
  | 'DESIGN_EFFECTIVENESS'      // Policies, SOPs, Architectural Diagrams, Data Flow Diagrams
  | 'OPERATING_EFFECTIVENESS'   // Point-in-time Configurations, Access Reviews, Vulnerability Scans, Tickets
  | 'CONTINUOUS_ASSURANCE';     // Real-time Telemetry, Streamed SIEM Logs, Automated Check Runs, Continuous CSPM

export type EnterpriseEvidenceType =
  | 'DOCUMENT'
  | 'POLICY'
  | 'PROCEDURE'
  | 'SOP'
  | 'SCREENSHOT'
  | 'CONFIGURATION'
  | 'LOG'
  | 'AUDIT_LOG'
  | 'SYSTEM_REPORT'
  | 'CLOUD_CONFIGURATION'
  | 'IAM_CONFIGURATION'
  | 'IDENTITY_RECORD'
  | 'HR_RECORD'
  | 'TRAINING_RECORD'
  | 'VULNERABILITY_REPORT'
  | 'PENETRATION_TEST'
  | 'BACKUP_REPORT'
  | 'DR_TEST'
  | 'INCIDENT_RECORD'
  | 'TICKET'
  | 'CHANGE_RECORD'
  | 'ACCESS_REVIEW'
  | 'RISK_ASSESSMENT'
  | 'VENDOR_ASSESSMENT'
  | 'CONTRACT'
  | 'DPA'
  | 'CONSENT_RECORD'
  | 'DSR_RECORD'
  | 'RETENTION_RECORD'
  | 'DELETION_RECORD'
  | 'TELEMETRY'
  | 'API_RESPONSE'
  | 'DATABASE_RECORD'
  | 'SOURCE_CODE_RESULT'
  | 'CI_CD_RESULT'
  | 'SECURITY_SCAN'
  | 'SIEM_EVENT'
  | 'ENDPOINT_TELEMETRY'
  | 'NETWORK_CONFIGURATION'
  | 'ASSET_INVENTORY'
  | 'AI_GOVERNANCE_RECORD'
  | 'REGULATORY_SOURCE'
  | 'OTHER';

export type EvidenceSourceType =
  | 'INTEGRATION_CONNECTOR'
  | 'AGENT_TELEMETRY'
  | 'API_WEBHOOK'
  | 'DATABASE_EXPORT'
  | 'MANUAL_UPLOAD'
  | 'EXTERNAL_AUDIT_FEED'
  | 'INTERNAL_PROCESS';

export type EvidenceCollectionMethod =
  | 'AUTOMATED_API_PULL'
  | 'STREAMING_WEBHOOK'
  | 'SCHEDULED_BATCH_HARVEST'
  | 'EVENT_TRIGGERED_HARVEST'
  | 'AGENT_DIRECT_STREAM'
  | 'MANUAL_UPLOAD';

export type EvidenceFreshnessPolicy =
  | 'REAL_TIME'        // Telemetry heartbeats (< 1h)
  | '1_HOUR'
  | '6_HOURS'
  | '24_HOURS'         // Daily CSPM, backups, agent health (< 24h)
  | '7_DAYS'          // SAST scans, weekly vulnerability sweeps (< 7d)
  | '30_DAYS'         // Access reviews, user entitlement reconciliations (< 30d)
  | '90_DAYS'         // Quarterly firewall reviews, penetration tests (< 90d)
  | '180_DAYS'        // Bi-annual disaster recovery simulations (< 180d)
  | '365_DAYS'        // Annual policies, security awareness trainings (< 365d)
  | 'EVENT_BASED'     // Change records, incident post-mortems
  | 'AUDIT_PERIOD'    // Fixed audit cycle attestation
  | 'CUSTOM';

export type EvidenceFreshnessState =
  | 'CURRENT'
  | 'AGING'
  | 'STALE'
  | 'EXPIRED'
  | 'MISSING'
  | 'PENDING_COLLECTION'
  | 'COLLECTION_FAILED'
  | 'NOT_APPLICABLE';

export type EvidenceValidationStatus =
  | 'VALID'
  | 'PARTIALLY_VALID'
  | 'INVALID'
  | 'TAMPERED'
  | 'INCOMPLETE'
  | 'DUPLICATE'
  | 'STALE'
  | 'UNVERIFIED';

export type EvidenceSufficiencyState =
  | 'SUFFICIENT'
  | 'PARTIALLY_SUFFICIENT'
  | 'INSUFFICIENT'
  | 'MISSING'
  | 'CONFLICTING'
  | 'REQUIRES_REVIEW';

export type EvidenceReviewStatus =
  | 'NEW'
  | 'AUTO_VALIDATED'
  | 'REQUIRES_REVIEW'
  | 'MAPPED'
  | 'READY_FOR_TEST'
  | 'INSUFFICIENT'
  | 'REJECTED'
  | 'AUDITOR_ACCEPTED';

export type EvidenceIntegrityStatus =
  | 'VALID'
  | 'TAMPERED'
  | 'UNVERIFIED';

export type EvidenceAuthenticityStatus =
  | 'SOURCE_VERIFIED'
  | 'AGENT_VERIFIED'
  | 'HUMAN_ATTESTED'
  | 'UNVERIFIED_THIRD_PARTY';

// ============================================================================
// 2. CANONICAL EVIDENCE OBJECT MODEL
// ============================================================================

export interface EvidenceObject {
  id: string;
  tenantId: string;
  customerId: string;
  sourceType: EvidenceSourceType;
  sourceSystem: string;
  integrationId: string;
  integrationProvider: IntegrationProviderId;
  collectionMethod: EvidenceCollectionMethod;

  evidenceCode?: string;
  evidenceType: EnterpriseEvidenceType;
  evidenceCategory: EvidenceCategory;
  evidenceSubType: string;

  title: string;
  description: string;

  rawSourceReference: string;
  sourceObjectId: string;
  sourceUrl?: string;
  sourcePath?: string;

  collectedAt: string;
  observedAt: string;
  lastVerifiedAt?: string;
  validFrom: string;
  validUntil: string;

  freshnessPolicy: EvidenceFreshnessPolicy;
  freshnessStatus: EvidenceFreshnessState;
  expectedMaxAgeHours: number;

  hashAlgorithm: 'SHA-256' | 'SHA-512';
  contentHash: string;
  previousVersionHash?: string;
  versionNumber: number;

  integrityStatus: EvidenceIntegrityStatus;

  classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'INTERNAL' | 'PUBLIC';
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dataClassification: 'PII' | 'FINANCIAL' | 'SECURITY_TELEMETRY' | 'BUSINESS_CONFIDENTIAL' | 'PUBLIC';

  ownerId: string;
  collectorId: string;

  reviewStatus: EvidenceReviewStatus;
  reviewerId?: string;
  reviewedAt?: string;

  validationStatus: EvidenceValidationStatus;
  validationScore: number; // 0.00 to 1.00
  validationNotes?: string[];

  authenticityStatus: EvidenceAuthenticityStatus;

  // Cross-graph Lineage Mappings
  controlIds: string[];
  requirementIds: string[];
  frameworkIds: string[];
  riskIds: string[];
  policyIds: string[];
  processIds: string[];
  assetIds: string[];
  userIds: string[];

  // Downstream Assurance Hooks
  testIds: string[];
  generatedByCheckId?: string;
  findingIds: string[];
  capaIds: string[];
  assuranceIds: string[];

  // Storage & WORM
  retentionPolicy: string;
  retentionUntil: string;
  storageLocation: string;
  wormObjectId?: string;
  wormMerkleRoot?: string;
  fileSizeBytes: number;
  mimeType: string;
  rawPayloadPreview?: string;

  // Deduplication & Lineage
  canonicalEvidenceId?: string;
  duplicateOfId?: string;
  versionOfId?: string;
  supersedesId?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 3. EVIDENCE VERSIONING & AUDIT LOGS
// ============================================================================

export interface EvidenceVersion {
  id: string;
  evidenceId: string;
  tenantId: string;
  versionNumber: number;
  contentHash: string;
  previousVersionHash?: string;
  collectedAt: string;
  collectorId: string;
  sourceProvider: IntegrationProviderId;
  changeSummary: string;
  diffPayloadSnippet?: string;
  fileSizeBytes: number;
  validationScore: number;
  createdAt: string;
}

// ============================================================================
// 4. COLLECTION JOBS & AUTOMATION RULES
// ============================================================================

export type CollectionJobStatus =
  | 'SCHEDULED'
  | 'RUNNING'
  | 'COLLECTED'
  | 'PARTIALLY_COLLECTED'
  | 'COLLECTION_FAILED'
  | 'AUTHENTICATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'SOURCE_UNAVAILABLE'
  | 'PARSER_FAILED'
  | 'VALIDATION_FAILED'
  | 'COMPLETED';

export interface EvidenceCollectionJob {
  id: string;
  tenantId: string;
  integrationId: string;
  provider: IntegrationProviderId;
  jobType: 'SCHEDULED' | 'EVENT_DRIVEN' | 'MANUAL_ON_DEMAND' | 'RETEST_HARVEST';
  targetEvidenceCodes: string[];
  status: CollectionJobStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  itemsDiscovered: number;
  itemsCollected: number;
  itemsRejected: number;
  itemsDuplicated: number;
  itemsValidated: number;
  errorMessage?: string;
  retryCount: number;
  triggeredBy: string;
}

export interface EvidenceAutomationRule {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerEvent: string; // e.g. 'IAM_USER_CREATED', 'S3_BUCKET_UPDATED', 'SCHEDULE_DAILY_0200'
  sourceProvider: IntegrationProviderId;
  conditionExpression: string; // e.g. 'payload.mfaEnabled === false'
  targetEvidenceType: EnterpriseEvidenceType;
  targetEvidenceCategory: EvidenceCategory;
  freshnessPolicy: EvidenceFreshnessPolicy;
  validityDurationDays: number;
  autoMapControlIds: string[];
  autoMapRequirementIds: string[];
  autoMapFrameworkIds: string[];
  triggerCheckId?: string;
  escalationSlaHours: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 5. EVIDENCE RELEVANCE & SUFFICIENCY
// ============================================================================

export interface EvidenceRelevanceScore {
  evidenceId: string;
  overallScore: number; // 0 - 100
  sourceReliabilityScore: number; // 0 - 20
  authenticityScore: number; // 0 - 20
  freshnessScore: number; // 0 - 20
  completenessScore: number; // 0 - 20
  mappingConfidenceScore: number; // 0 - 20
  scoringBreakdown: string[];
}

export interface ControlEvidenceSufficiency {
  controlId: string;
  controlCode: string;
  controlTitle: string;
  sufficiencyState: EvidenceSufficiencyState;
  requiredEvidenceCategories: EvidenceCategory[];
  presentEvidenceCategories: EvidenceCategory[];
  hasDesignEvidence: boolean;
  hasOperatingEvidence: boolean;
  hasContinuousTelemetry: boolean;
  hasPassingTestResult: boolean;
  sufficiencyScore: number; // 0 - 100
  missingRequirements: string[];
  evidenceIds: string[];
}

// ============================================================================
// 6. EVIDENCE CONFLICT DETECTION
// ============================================================================

export interface EvidenceConflictRecord {
  id: string;
  tenantId: string;
  controlId: string;
  conflictType: 'DESIGN_VS_OPERATING' | 'OPERATING_VS_TELEMETRY' | 'TIMESTAMP_CONTRADICTION' | 'MULTI_SOURCE_DIVERGENCE';
  title: string;
  description: string;
  designEvidenceId?: string;
  designEvidenceSummary?: string;
  operatingEvidenceId: string;
  operatingEvidenceSummary: string;
  detectedAt: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  resolutionStatus: 'OPEN' | 'INVESTIGATING' | 'RESOLVED_BY_CAPA' | 'ACCEPTED_EXCEPTION';
  recommendedAction: string;
}

// ============================================================================
// 7. EVIDENCE LINEAGE & GRAPH
// ============================================================================

export interface EvidenceLineageNode {
  id: string;
  type: 'SOURCE' | 'INTEGRATION' | 'JOB' | 'RAW_DATA' | 'NORMALIZED_OBJECT' | 'EVIDENCE_OBJECT' | 'CONTROL' | 'REQUIREMENT' | 'FRAMEWORK' | 'CHECK' | 'TEST_RESULT' | 'FINDING' | 'CAPA' | 'ASSURANCE' | 'AUDIT_PACKAGE';
  label: string;
  timestamp: string;
  status: string;
  metadata: Record<string, any>;
}

export interface EvidenceLineageEdge {
  from: string;
  to: string;
  relationship: string; // 'HARVESTED_BY' | 'NORMALIZED_INTO' | 'MAPPED_TO' | 'EVALUATED_BY' | 'PRODUCED_FINDING' | 'RESOLVED_BY'
}

export interface EvidenceLineageGraph {
  evidenceId: string;
  nodes: EvidenceLineageNode[];
  edges: EvidenceLineageEdge[];
}

// ============================================================================
// 8. AUDIT EVIDENCE PACKAGE & BLAST RADIUS
// ============================================================================

export interface EvidenceAuditPackage {
  id: string;
  tenantId: string;
  packageCode: string;
  title: string;
  frameworkId: string;
  auditCycle: string;
  compiledAt: string;
  compiledBy: string;
  merkleRootHash: string;
  wormLedgerBlockHeight: number;
  wormAuditSeal: string;
  evidenceCount: number;
  controlsCoveredCount: number;
  requirementsSatisfiedCount: number;
  passingTestsCount: number;
  openFindingsCount: number;
  evidenceItems: EvidenceObject[];
  lineageHash: string;
  packageStatus: 'SEALED_IMMUTABLE' | 'DRAFT' | 'AUDITOR_EXPORTED';
}

export interface EvidenceFailureBlastRadius {
  failedEvidenceId?: string;
  failedIntegrationId?: string;
  failureReason: string;
  impactedControls: { controlId: string; title: string; previousAssurance: string; newAssurance: string }[];
  impactedRequirements: { requirementCode: string; framework: string }[];
  impactedFrameworks: string[];
  impactedActiveAudits: string[];
  assuranceDowngradeSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  calculatedAt: string;
}

// ============================================================================
// 9. EVIDENCE FABRIC ANALYTICS & SUMMARY
// ============================================================================

export interface EvidenceAnalyticsSummary {
  tenantId: string;
  totalEvidenceCount: number;
  automatedEvidenceCount: number;
  manualEvidenceCount: number;
  automationCoveragePercent: number;
  freshEvidenceCount: number;
  agingEvidenceCount: number;
  staleEvidenceCount: number;
  expiredEvidenceCount: number;
  tamperedEvidenceCount: number;
  freshnessPercent: number;
  validatedEvidenceCount: number;
  validationPassPercent: number;
  evidenceReusePercent: number; // e.g. 78% of evidence satisfies >1 framework
  activeConflictsCount: number;
  controlsWithContinuousAssurancePercent: number;
  controlsWithoutEvidenceCount: number;
  averageCollectionDurationMs: number;
  totalStorageBytes: number;
  wormSealedBlocksCount: number;
  lastSyncTimestamp: string;
}

// ============================================================================
// 10. AI EVIDENCE COPILOT TAXONOMY
// ============================================================================

export type AIEvidenceProvenance =
  | 'DIRECT_SOURCE'
  | 'SOURCE_DERIVED'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDATION'
  | 'UNKNOWN';

export interface AIEvidenceCopilotQuery {
  query: string;
  tenantId: string;
  focusEvidenceId?: string;
  focusControlId?: string;
  focusFramework?: string;
}

export interface AIEvidenceCopilotResponse {
  answer: string;
  provenance: AIEvidenceProvenance;
  groundedEvidenceIds: string[];
  groundedControlIds: string[];
  sourceCitations: {
    sourceProvider: string;
    sourceObjectId: string;
    collectedAt: string;
    hash: string;
  }[];
  detectedGaps: string[];
  recommendedActions: string[];
  timestamp: string;
}

// ============================================================================
// 11. CONNECTOR EVIDENCE MATURITY & ENVIRONMENT TIERS
// ============================================================================

export type ConnectorEvidenceMaturity =
  | 'CATALOG_ONLY'
  | 'ADAPTER_IMPLEMENTED'
  | 'AUTHENTICATION_IMPLEMENTED'
  | 'AUTHENTICATION_VERIFIED'
  | 'LIVE_SOURCE_CONNECTED'
  | 'LIVE_DATA_RECEIVED'
  | 'DATA_NORMALIZED'
  | 'AUTOMATED_CHECK_VERIFIED'
  | 'EVIDENCE_GENERATION_VERIFIED'
  | 'EVIDENCE_VALIDATION_VERIFIED'
  | 'CONTINUOUS_COLLECTION_VERIFIED'
  | 'CONTROL_MAPPING_VERIFIED'
  | 'ASSURANCE_MAPPING_VERIFIED'
  | 'PRODUCTION_VERIFIED';

export type ProductionEnvironmentTier =
  | 'SIMULATION'
  | 'TEST_ENVIRONMENT'
  | 'LIVE_CONNECTOR'
  | 'PRODUCTION_VERIFIED_CONNECTOR'
  | 'PRODUCTION_VERIFIED_EVIDENCE';

// ============================================================================
// 12. SOURCE TRUST & CONFIDENCE SCORING
// ============================================================================

export type SourceTrustLevel =
  | 'TRUSTED'            // Official signed API, mTLS, hardened IAM assume-role (90-100)
  | 'VERIFIED'           // Standard authenticated OAuth 2.0 / API key with valid SSL (75-89)
  | 'PARTIALLY_VERIFIED'  // Validated payload, but self-signed or intermediate proxy (50-74)
  | 'UNVERIFIED'         // Unauthenticated webhook or third-party untrusted feed (25-49)
  | 'UNTRUSTED';         // Malformed, unauthenticated, or signature mismatch (<25)

export interface EvidenceConfidenceScore {
  evidenceId: string;
  confidenceGrade: 'HIGH' | 'MEDIUM' | 'LOW' | 'REQUIRES_REVIEW';
  sourceTrustLevel: SourceTrustLevel;
  sourceTrustScore: number;       // 0 - 20
  authenticityScore: number;      // 0 - 20
  integrityScore: number;         // 0 - 20
  freshnessScore: number;         // 0 - 20
  completenessScore: number;      // 0 - 20
  totalScore: number;             // 0 - 100
  scoringBreakdown: string[];
}

// ============================================================================
// 13. SCHEMA DRIFT DETECTION ENGINE
// ============================================================================

export type SchemaDriftType =
  | 'NEW_FIELD'
  | 'REMOVED_FIELD'
  | 'TYPE_MISMATCH'
  | 'ENUM_CHANGE'
  | 'STRUCTURAL_CHANGE'
  | 'VERSION_DEPRECATION';

export interface SchemaDriftRecord {
  id: string;
  tenantId: string;
  provider: IntegrationProviderId;
  detectedAt: string;
  driftType: SchemaDriftType;
  fieldPath: string;
  expectedSchemaSummary: string;
  receivedPayloadSnippet: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mitigationState: 'ACTIVE_BLOCK' | 'INVESTIGATING' | 'SCHEMA_ADAPTED' | 'DISMISSED';
  impactedChecks: string[];
  impactedControls: string[];
  mitigationNotes?: string;
}

// ============================================================================
// 14. CONNECTOR PRODUCTION CERTIFICATION & WAVE 1
// ============================================================================

export type ConnectorCertificationStatus =
  | 'NOT_CERTIFIED'
  | 'ENGINEERING_CERTIFIED'
  | 'LIVE_SOURCE_CERTIFIED'
  | 'EVIDENCE_CERTIFIED'
  | 'ASSURANCE_CERTIFIED'
  | 'PRODUCTION_CERTIFIED';

export interface ConnectorCertificationRecord {
  providerId: IntegrationProviderId;
  displayName: string;
  category: string;
  connectorVersion: string;
  maturityLevel: ConnectorEvidenceMaturity;
  environmentTier: ProductionEnvironmentTier;
  certificationStatus: ConnectorCertificationStatus;
  authVerified: boolean;
  liveDataVerified: boolean;
  normalizedVerified: boolean;
  checksVerified: boolean;
  evidenceVerified: boolean;
  continuousMonitoringVerified: boolean;
  assuranceImpactVerified: boolean;
  liveValidationRequired: boolean;
  lastCertifiedAt: string;
  certifiedBy: string;
  supportedEvidenceCodes: string[];
}

// ============================================================================
// 15. DISAGGREGATED TRANSPARENT AUTOMATION METRICS
// ============================================================================

export interface DiscreteAutomationMetrics {
  tenantId: string;
  collectionAutomationPercent: number;    // Automated collectors / Total required
  validationAutomationPercent: number;    // Auto-validated items / Total items
  mappingAutomationPercent: number;       // Auto-mapped controls / Total controls
  testingAutomationPercent: number;       // Automated machine checks / Total tests
  refreshAutomationPercent: number;       // Auto-scheduled refresh / Total policies
  remediationAutomationPercent: number;   // Auto-generated 5-Whys CAPA / Total findings
  assuranceAutomationPercent: number;     // Continuous telemetry driven / Total assurance
  overallEvidenceAutomationCoveragePercent: number;
  calculatedAt: string;
}

// ============================================================================
// 16. EVIDENCE DOMAIN EVENTS
// ============================================================================

export type EvidenceDomainEventType =
  | 'EvidenceCollectionStarted'
  | 'EvidenceCollected'
  | 'EvidenceNormalized'
  | 'EvidenceValidated'
  | 'EvidenceRejected'
  | 'EvidenceDuplicated'
  | 'EvidenceExpired'
  | 'EvidenceTampered'
  | 'EvidenceMapped'
  | 'EvidenceTested'
  | 'EvidenceTestFailed'
  | 'EvidenceRefreshed'
  | 'EvidenceConflictDetected'
  | 'EvidenceAssuranceChanged'
  | 'SchemaDriftDetected';

export interface EvidenceDomainEvent {
  eventId: string;
  tenantId: string;
  eventType: EvidenceDomainEventType;
  timestamp: string;
  entityId: string;
  actor: string;
  source: string;
  correlationId: string;
  payloadSummary: string;
  sha256Digest: string;
}

