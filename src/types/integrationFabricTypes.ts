/**
 * SKANDA Enterprise GRC & Continuous Assurance Platform
 * Core Integration Fabric, Normalized Entity Graph, Automated Checks & Evidence Types
 * 
 * Invariants:
 * 1. ONE CANONICAL ARCHITECTURE - Extends Canonical Control 360 and Assurance services.
 * 2. NON-FABRICATION - NOT_CONFIGURED evaluates to NOT_CONFIGURED, never COMPLIANT.
 * 3. NORMALIZATION FIRST - Raw connector payloads normalize into canonical SKANDA Identity & Asset graphs.
 * 4. ONE CHECK -> MULTI-FRAMEWORK - 1 Automated check satisfies multiple statutory standards simultaneously.
 * 5. CLOSED-LOOP RETEST - Findings & CAPAs cannot close without verified evidence and a passing retest.
 */

// ============================================================================
// 1. INTEGRATION CATEGORIES & PROVIDER IDENTIFIERS (15 CATEGORIES)
// ============================================================================

export type IntegrationCategory =
  | 'CLOUD'
  | 'IDENTITY'
  | 'HR'
  | 'DEVICE_MDM'
  | 'SECURITY_EDR'
  | 'VULNERABILITY'
  | 'CODE_DEVSECOPS'
  | 'ITSM'
  | 'INCIDENT_MANAGEMENT'
  | 'OBSERVABILITY'
  | 'COLLABORATION'
  | 'BACKUP_DR'
  | 'DLP_DATA_SECURITY'
  | 'SIEM'
  | 'TPRM';

export type IntegrationProviderId =
  // Cloud
  | 'AWS'
  | 'AWS_ORGANIZATIONS'
  | 'AZURE'
  | 'AZURE_GOVERNMENT'
  | 'GCP'
  | 'ORACLE_CLOUD'
  // Identity
  | 'MICROSOFT_ENTRA_ID'
  | 'OKTA'
  | 'GOOGLE_WORKSPACE_IAM'
  | 'PING_IDENTITY'
  | 'AUTH0'
  // HR
  | 'WORKDAY'
  | 'BAMBOOHR'
  | 'ADP'
  | 'ZOHO_PEOPLE'
  | 'ORACLE_HCM'
  | 'SAP_SUCCESSFACTORS'
  // Device / MDM
  | 'MICROSOFT_INTUNE'
  | 'JAMF'
  | 'KANDJI'
  // Security / EDR
  | 'CROWDSTRIKE'
  | 'MICROSOFT_DEFENDER'
  | 'SENTINELONE'
  | 'TRELLIX'
  | 'WAZUH'
  // Vulnerability
  | 'TENABLE'
  | 'QUALYS'
  | 'RAPID7'
  // Code / DevSecOps
  | 'GITHUB'
  | 'GITLAB'
  | 'BITBUCKET'
  | 'AZURE_DEVOPS'
  | 'JENKINS'
  | 'SONARQUBE'
  // ITSM
  | 'SERVICENOW'
  | 'JIRA'
  | 'ZENDESK'
  // Incident Management
  | 'PAGERDUTY'
  | 'OPSGENIE'
  | 'INCIDENT_IO'
  | 'ZENDUTY'
  // Observability
  | 'DATADOG'
  | 'SPLUNK'
  | 'CLOUDWATCH'
  | 'AZURE_MONITOR'
  // Collaboration
  | 'SLACK'
  | 'MICROSOFT_TEAMS'
  | 'GOOGLE_WORKSPACE'
  // Backup / DR
  | 'AWS_BACKUP'
  | 'VEEAM'
  | 'COMMVAULT'
  | 'COHESITY'
  | 'RUBRIK'
  // DLP / Data Security
  | 'MICROSOFT_PURVIEW'
  | 'TRELLIX_DLP'
  | 'SYMANTEC_DLP'
  // SIEM
  | 'MICROSOFT_SENTINEL'
  | 'SPLUNK_SIEM'
  | 'ELASTIC_SIEM'
  | 'SUMO_LOGIC'
  // TPRM
  | 'SECURITY_SCORECARD'
  | 'BITSIGHT'
  | 'PANORAYS'
  | 'PREVALENT'
  // Custom / Internal
  | 'CUSTOM_INTERNAL'
  | 'OTHER';

export type IntegrationCapability =
  | 'ASSET_DISCOVERY'
  | 'IDENTITY_DISCOVERY'
  | 'USER_ACCESS_GOVERNANCE'
  | 'CONFIGURATION_ASSURANCE'
  | 'TELEMETRY_STREAM'
  | 'AUTOMATED_EVIDENCE_GENERATION'
  | 'VULNERABILITY_ASSESSMENT'
  | 'CHANGE_MANAGEMENT_CAB'
  | 'INCIDENT_DRIFT_ALERTING'
  | 'LOG_ARCHIVE_INSPECTION'
  | 'BACKUP_IMMUTABILITY_VERIFICATION'
  | 'DLP_POLICY_VERIFICATION'
  | 'VENDOR_RISK_CONTINUOUS_SCORING';

export type IntegrationConnectionStatus =
  | 'NOT_CONFIGURED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DEGRADED'
  | 'STALE'
  | 'AUTHENTICATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'SOURCE_UNAVAILABLE'
  | 'PARSER_FAILED'
  | 'DISCONNECTED'
  | 'REAUTH_REQUIRED'
  | 'NOT_IMPLEMENTED';

export type IntegrationHealthGrade =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'STALE'
  | 'FAILED'
  | 'NOT_CONFIGURED'
  | 'REAUTH_REQUIRED';

export type AuthenticationType =
  | 'OAUTH2_AUTHORIZATION_CODE'
  | 'OAUTH2_CLIENT_CREDENTIALS'
  | 'API_KEY_VAULT'
  | 'AWS_IAM_ROLE_ASSUME'
  | 'AZURE_SERVICE_PRINCIPAL'
  | 'GCP_SERVICE_ACCOUNT_KEY'
  | 'MTLS_CERTIFICATE'
  | 'WEBHOOK_HMAC_SECRET';

// ============================================================================
// 2. INTEGRATION DEFINITION & METADATA
// ============================================================================

export interface IntegrationDefinition {
  id: string;
  tenantId: string;
  provider: IntegrationProviderId;
  category: IntegrationCategory;
  displayName: string;
  version: string;
  description: string;
  capabilities: IntegrationCapability[];
  authenticationType: AuthenticationType;
  requiredScopes: string[];
  requiredPermissions: string[];
  supportedFrameworks: string[];
  supportedControls: string[];
  healthStatus: IntegrationHealthGrade;
  connectionStatus: IntegrationConnectionStatus;
  lastSyncAt: string | null;
  lastSuccessfulSyncAt: string | null;
  lastFailureAt: string | null;
  lastFailureReason?: string;
  rateLimitStatus: {
    limitPerMinute: number;
    currentUsage: number;
    resetsAt: string;
    isThrottled: boolean;
  };
  metrics: {
    apiLatencyMs: number;
    successRate30Days: number;
    dataFreshnessMinutes: number;
    discoveredAssetsCount: number;
    discoveredIdentitiesCount: number;
    generatedEvidenceCount: number;
    executedChecksCount: number;
  };
  configuration: Record<string, any>;
  isImplemented: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationHealthMetrics {
  connectionStatus: IntegrationConnectionStatus;
  healthGrade: IntegrationHealthGrade;
  lastSuccessfulSyncAt: string | null;
  lastFailedSyncAt: string | null;
  lastSyncErrorMessage?: string;
  apiLatencyMs: number;
  apiSuccessRate30Days: number;
  rateLimitUsagePercent: number;
  dataFreshnessMinutes: number;
  assetsDiscoveredCount: number;
  identitiesDiscoveredCount: number;
  evidenceItemsCollectedTotal: number;
  activeDriftSignalsCount: number;
}

// ============================================================================
// 3. NORMALIZED SKANDA ENTITY GRAPH & IDENTITY RESOLUTION
// ============================================================================

export type CanonicalEntityType =
  | 'IDENTITY'
  | 'ASSET'
  | 'APPLICATION'
  | 'REPOSITORY'
  | 'DEVICE'
  | 'CLOUD_ACCOUNT'
  | 'DATABASE'
  | 'SERVICE'
  | 'VENDOR'
  | 'POLICY'
  | 'CONFIGURATION'
  | 'SECURITY_FINDING'
  | 'INCIDENT'
  | 'VULNERABILITY'
  | 'BACKUP_JOB'
  | 'EVIDENCE_SOURCE';

export interface BaseNormalizedEntity {
  id: string;
  tenantId: string;
  entityType: CanonicalEntityType;
  sourceProvider: IntegrationProviderId;
  sourceObjectId: string;
  sourceVersion?: string;
  name: string;
  discoveredAt: string;
  lastSeenAt: string;
  lastUpdatedAt: string;
  confidenceScore: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DISPUTED';
  metadata: Record<string, any>;
}

export interface SkandaIdentity extends BaseNormalizedEntity {
  entityType: 'IDENTITY';
  primaryEmail: string;
  fullName: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  managerEmail?: string;
  employmentStatus: 'FULL_TIME' | 'CONTRACTOR' | 'INTERN' | 'TERMINATED';
  mfaEnforced: boolean;
  isPrivileged: boolean;
  isDormant: boolean;
  lastLoginAt?: string;
  boundRoles: string[];
  boundGroups: string[];
  linkedProviderAccounts: Array<{
    provider: IntegrationProviderId;
    providerUserId: string;
    username: string;
    matchedBy: 'EMAIL' | 'EMPLOYEE_ID' | 'SSO_ID' | 'MANUAL_MERGE';
    confidence: number;
  }>;
}

export interface SkandaAsset extends BaseNormalizedEntity {
  entityType: 'ASSET';
  assetCategory: 'COMPUTE' | 'STORAGE' | 'DATABASE' | 'NETWORKING' | 'SERVERLESS' | 'CONTAINER' | 'ENDPOINT';
  cloudProvider?: IntegrationProviderId;
  cloudRegion?: string;
  cloudArnOrId: string;
  criticalityTier: 'TIER_1_CRITICAL' | 'TIER_2_HIGH' | 'TIER_3_MEDIUM' | 'TIER_4_LOW';
  isInternetFacing: boolean;
  isEncryptedAtRest: boolean;
  isEncryptedInTransit: boolean;
  backupConfigured: boolean;
  ownerEmail?: string;
  tags: Record<string, string>;
  boundControlCodes: string[];
}

export interface EntityResolutionMergeRecord {
  mergeId: string;
  tenantId: string;
  canonicalIdentityId: string;
  mergedProvider: IntegrationProviderId;
  mergedProviderUserId: string;
  matchedBy: 'EXACT_EMAIL' | 'EMPLOYEE_ID' | 'MANUAL_ADMIN_MERGE' | 'SSO_FEDERATION_CLAIM';
  mergedBy: string;
  mergedAt: string;
  confidenceScore: number;
  auditTrailNotes: string;
}

// ============================================================================
// 4. AUTOMATED COMPLIANCE CHECK LIBRARY & EXECUTION
// ============================================================================

export type AutomatedCheckDomain =
  | 'IDENTITY_ACCESS'
  | 'CLOUD_INFRASTRUCTURE'
  | 'ENDPOINT_MDM'
  | 'DEVSECOPS_CODE'
  | 'VULNERABILITY_MANAGEMENT'
  | 'HR_PEOPLE_LIFECYCLE'
  | 'BACKUP_DISASTER_RECOVERY'
  | 'SECURITY_INCIDENT_SIEM'
  | 'DATA_PROTECTION_DLP'
  | 'THIRD_PARTY_RISK';

export type CheckExecutionVerdict =
  | 'PASS'
  | 'FAIL'
  | 'PARTIAL'
  | 'ERROR'
  | 'NOT_TESTED'
  | 'NOT_APPLICABLE'
  | 'REVIEW_REQUIRED'
  | 'CHECK_UNAVAILABLE';

export interface AutomatedComplianceCheckDefinition {
  checkId: string;
  version: string;
  domain: AutomatedCheckDomain;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  primarySourceProvider: IntegrationProviderId;
  supportedProviders: IntegrationProviderId[];
  inputEntityTypes: CanonicalEntityType[];
  executionLogicDescription: string;
  expectedState: string;
  remediationSlaHours: number;
  targetControlCodes: string[];
  mappedFrameworkRequirements: Array<{
    frameworkCode: string;
    requirementCode: string;
    clauseTitle: string;
  }>;
  executionCadence: 'CONTINUOUS_EVENT_DRIVEN' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  isActive: boolean;
}

export interface CheckExecutionResult {
  executionId: string;
  tenantId: string;
  checkId: string;
  checkTitle: string;
  verdict: CheckExecutionVerdict;
  executedAt: string;
  executionDurationMs: number;
  sourceProvider: IntegrationProviderId;
  totalEntitiesEvaluated: number;
  passingEntitiesCount: number;
  failingEntitiesCount: number;
  failingEntityIds: string[];
  details: string;
  rawTelemetrySnippet?: string;
  generatedEvidenceId?: string;
  impactedControlCodes: string[];
  impactedFrameworkCodes: string[];
}

// ============================================================================
// 5. EVIDENCE FABRIC & FRESHNESS LIFECYCLE
// ============================================================================

export type EvidenceFreshnessState =
  | 'CURRENT'
  | 'STALE'
  | 'EXPIRED'
  | 'MISSING'
  | 'TAMPERED'
  | 'PENDING_REVIEW'
  | 'REJECTED';

export type EvidenceCollectionMethod =
  | 'AUTOMATED_API_PULL'
  | 'EVENT_STREAM_WEBHOOK'
  | 'SCHEDULED_INTEGRATION_SYNC'
  | 'STATIC_DOCUMENT_UPLOAD'
  | 'SYSTEM_INSPECTION_AUDIT';

export interface FreshnessPolicy {
  policyDomain: AutomatedCheckDomain;
  expectedMaxAgeHours: number;
  warningThresholdHours: number;
  description: string;
}

export interface FabricEvidenceRecord {
  id: string;
  tenantId: string;
  evidenceCode: string;
  title: string;
  description: string;
  sourceProvider: IntegrationProviderId;
  collectionMethod: EvidenceCollectionMethod;
  sourceObjectId: string;
  sha256Digest: string;
  payloadSizeInBytes: number;
  mimeType: string;
  rawJsonPayloadSnippet: string;
  collectedAt: string;
  lastVerifiedAt: string;
  validFrom: string;
  validUntil: string;
  freshnessState: EvidenceFreshnessState;
  targetControlCodes: string[];
  mappedRequirementCodes: string[];
  mappedFrameworkCodes: string[];
  associatedAssetIds: string[];
  associatedIdentityIds: string[];
  generatedByCheckId?: string;
  reviewStatus: 'AUTO_VALIDATED' | 'AUDITOR_VERIFIED' | 'PENDING_AUDIT' | 'REJECTED';
  confidenceScore: number;
}

// ============================================================================
// 6. CONTINUOUS DRIFT, TASK AUTOMATION & 5-WHYS RETEST REMEDIATION
// ============================================================================

export interface ContinuousDriftEvent {
  eventId: string;
  tenantId: string;
  eventType: 'CHECK_FAILED' | 'INTEGRATION_DEGRADED' | 'EVIDENCE_EXPIRED' | 'UNAUTHORIZED_DRIFT';
  checkId: string;
  controlCode: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  details: Record<string, any>;
  affectedFrameworks: string[];
  affectedAssets: string[];
  affectedIdentities: string[];
  autoGeneratedTaskId?: string;
  autoGeneratedCapaId?: string;
}

export interface FabricComplianceTask {
  id: string;
  tenantId: string;
  taskCode: string;
  title: string;
  description: string;
  triggerSource: 'AUTOMATED_CHECK_FAILURE' | 'EVIDENCE_STALE' | 'INTEGRATION_ERROR' | 'REGULATORY_CHANGE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';
  assignedOwner: string;
  currentEscalationTier: 'TIER_1_OWNER' | 'TIER_2_MANAGER' | 'TIER_3_COMPLIANCE_LEAD' | 'TIER_4_CISO' | 'TIER_5_BOARD';
  createdAt: string;
  dueDate: string;
  slaHoursTotal: number;
  slaHoursRemaining: number;
  isOverdue: boolean;
  escalationCount: number;
  targetControlCode?: string;
  targetCheckId?: string;
  attachedEvidenceIds: string[];
}

export interface FabricFiveWhysCapaRemediation {
  id: string;
  tenantId: string;
  capaCode: string;
  findingId: string;
  findingTitle: string;
  controlCode: string;
  triggeredByCheckId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rootCauseAnalysis: {
    why1: string;
    why2: string;
    why3: string;
    why4: string;
    why5: string;
    rootCauseCategory: 'POLICY_GAP' | 'TOOLING_MISCONFIGURATION' | 'IAM_ORPHAN' | 'HUMAN_ERROR' | 'PROCESS_BYPASS';
  };
  correctiveActionPlan: string;
  preventiveActionPlan: string;
  assignedOwner: string;
  targetCompletionDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'REMEDIATION_SUBMITTED' | 'RETEST_SCHEDULED' | 'EFFECTIVE_CLOSED';
  retestRequired: boolean;
  retestMethod: 'AUTOMATED_TELEMETRY' | 'EMPIRICAL_AUDIT';
  retestResult?: 'PASS' | 'FAIL';
  retestedBy?: string;
  retestedAt?: string;
  closureEvidenceIds: string[];
  closureApprovedBy?: string;
  closureApprovedAt?: string;
}

// ============================================================================
// 7. REAL-TIME COMPLIANCE POSTURE & COMMAND CENTER
// ============================================================================

export type FabricPostureGrade =
  | 'STRONG'
  | 'MANAGED'
  | 'PARTIALLY_MANAGED'
  | 'AT_RISK'
  | 'INSUFFICIENT_ASSURANCE'
  | 'NO_ASSURANCE';

export interface FabricCommandCenterSummary {
  tenantId: string;
  organizationName: string;
  overallPostureGrade: FabricPostureGrade;
  controlAssuranceCoveragePercent: number;
  totalIntegrationsConfigured: number;
  healthyIntegrationsCount: number;
  degradedIntegrationsCount: number;
  totalAutomatedChecks: number;
  passingChecksCount: number;
  failingChecksCount: number;
  unavailableChecksCount: number;
  totalEvidenceArtifacts: number;
  freshEvidencePercent: number;
  staleEvidencePercent: number;
  totalCanonicalIdentities: number;
  totalCanonicalAssets: number;
  openFindingsCount: number;
  overdueTasksCount: number;
  activeCapasCount: number;
  frameworkReadinessBreakdown: Array<{
    frameworkCode: string;
    frameworkName: string;
    readinessPercent: number;
    rating: 'AUDIT_READY' | 'MINOR_GAPS' | 'SUBSTANTIAL_REMEDIATION_NEEDED';
    passingChecksCount: number;
    failingChecksCount: number;
  }>;
  criticalActionItems: Array<{
    id: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    title: string;
    impactDescription: string;
    affectedFrameworks: string[];
    assignedOwner: string;
    actionType: 'TRIGGER_CHECK' | 'ATTACH_EVIDENCE' | 'RETEST_CAPA' | 'REAUTH_CONNECTOR';
  }>;
}

// ============================================================================
// 8. 7-LAYER GROUNDED AI COPILOT QUERY & TAXONOMY
// ============================================================================

export type AICopilotTaxonomy =
  | 'DIRECT_SOURCE'
  | 'SOURCE_DERIVED'
  | 'OSA_MAPPING'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDED_CONTROL'
  | 'CUSTOMER_DATA'
  | 'UNKNOWN';

export interface AICopilotFabricQuery {
  tenantId: string;
  query: string;
  contextFramework?: string;
  targetControlCode?: string;
}

export interface AICopilotFabricResponse {
  answer: string;
  classification: AICopilotTaxonomy;
  confidenceScore: number;
  isAuthoritative: boolean;
  citations: Array<{
    sourceAuthority: string;
    documentTitle: string;
    sectionOrClause: string;
  }>;
  groundedDataTrace?: {
    evaluatedChecksCount: number;
    evaluatedEvidenceCount: number;
    failingChecks: string[];
    failingControls: string[];
  };
  recommendedActions: Array<{
    actionTitle: string;
    actionType: string;
    targetEntityId?: string;
  }>;
  generatedAt: string;
}
