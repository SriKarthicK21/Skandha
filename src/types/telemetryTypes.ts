/**
 * SKANDA ENTERPRISE GRC OPERATING SYSTEM
 * Phase 12: Live Cloud Telemetry, Automated TPRM Scanning & Continuous Evidence
 * Path: src/types/telemetryTypes.ts
 */

import { GrcRisk, UnifiedControl, SmartEvidenceItem, GrcVendor, GrcAsset } from './grcCoreTypes';

export type ConnectorProvider =
  | 'AWS_SECURITY_HUB'
  | 'AWS_CONFIG'
  | 'AWS_IAM'
  | 'AWS_CLOUDTRAIL'
  | 'AWS_INSPECTOR'
  | 'AZURE_DEFENDER'
  | 'AZURE_POLICY'
  | 'AZURE_RESOURCE_GRAPH'
  | 'MICROSOFT_ENTRA_ID'
  | 'OKTA'
  | 'GITHUB'
  | 'GITLAB'
  | 'JIRA'
  | 'SERVICENOW'
  | 'MICROSOFT_SENTINEL'
  | 'SPLUNK'
  | 'QUALYS'
  | 'TENABLE'
  | 'RAPID7'
  | 'DEFENDER_FOR_ENDPOINT'
  | 'SERVICENOW_CMDB'
  | 'CUSTOM_WEBHOOK';

export type ConnectorCategory =
  | 'CLOUD_INFRASTRUCTURE'
  | 'IDENTITY_ACCESS'
  | 'SOURCE_CODE_DEVOPS'
  | 'ITSM_TICKETING'
  | 'SIEM_LOG_ANALYTICS'
  | 'VULNERABILITY_MANAGEMENT'
  | 'ENDPOINT_DETECTION'
  | 'CMDB_ASSET_DISCOVERY'
  | 'EXTERNAL_ATTACK_SURFACE';

export type ConnectorStatus =
  | 'CONNECTED'
  | 'HEALTHY'
  | 'WARNING'
  | 'FAILED'
  | 'DISCONNECTED'
  | 'NOT_CONFIGURED';

export type TruthStatus =
  | 'IMPLEMENTED'
  | 'VERIFIED'
  | 'CONFIGURED'
  | 'SIMULATED'
  | 'INTEGRATION_READY'
  | 'PILOT_READY'
  | 'PRODUCTION_DEPLOYED'
  | 'EXTERNAL_TESTED'
  | 'REQUIRES_DEPLOYMENT'
  | 'REQUIRES_CUSTOMER_CONFIG'
  | 'BLOCKED';

export interface ConnectorPermissionRequirement {
  permission: string;
  scope: string;
  purpose: string;
  isReadOnly: boolean;
  requiredFor: string[];
}

export interface GrcConnector {
  id: string;
  tenantId: string;
  provider: ConnectorProvider;
  name: string;
  category: ConnectorCategory;
  description: string;
  status: ConnectorStatus;
  truthStatus: TruthStatus;
  endpointUrl?: string;
  authType: 'AWS_ASSUME_ROLE' | 'AZURE_SERVICE_PRINCIPAL' | 'OAUTH2' | 'API_KEY' | 'WEBHOOK_HMAC' | 'MTLS';
  roleArn?: string;
  externalId?: string;
  clientId?: string;
  maskedSecret?: string;
  isReadOnly: boolean;
  syncFrequencyMinutes: number;
  lastSyncAt?: string;
  nextSyncAt?: string;
  lastSyncStatus?: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  lastSyncError?: string;
  recordsHarvestedTotal: number;
  activeDriftCount: number;
  permissionsRequired: ConnectorPermissionRequirement[];
  capabilities: {
    supportsAssetDiscovery: boolean;
    supportsContinuousEvidence: boolean;
    supportsControlTesting: boolean;
    supportsVulnerabilityIngest: boolean;
    supportsWebhookStreaming: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryObservation {
  id: string; // e.g. "OBS-2026-00091"
  tenantId: string;
  connectorId: string;
  connectorProvider: ConnectorProvider;
  sourceSystem: string;
  externalId: string; // ID in the source system (e.g. AWS ARN, Entra object ID, GitHub PR ID)
  observedAt: string;
  receivedAt: string;
  correlationId: string;
  idempotencyKey: string;
  
  // Normalization
  rawCategory: string;
  normalizedCategory:
    | 'MFA_ENFORCEMENT'
    | 'ACCESS_CONTROL'
    | 'ENCRYPTION_AT_REST'
    | 'ENCRYPTION_IN_TRANSIT'
    | 'AUDIT_LOGGING'
    | 'BRANCH_PROTECTION'
    | 'CODE_SECURITY'
    | 'VULNERABILITY'
    | 'ENDPOINT_PROTECTION'
    | 'CONFIGURATION_DRIFT'
    | 'PRIVILEGED_ACCESS'
    | 'DATA_CLASSIFICATION';

  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  confidence: number; // 0.00 - 1.00
  title: string;
  description: string;
  rawPayload: Record<string, any>;
  payloadHash: string; // SHA-256

  // Canonical Entity Binding
  canonicalEntityType: 'ASSET' | 'APPLICATION' | 'PROCESS' | 'VENDOR' | 'USER' | 'CONTROL' | 'POLICY';
  canonicalEntityId?: string; // Resolved ID in SKANDA
  matchConfidence: number;
  matchCriteria?: string;
  isAmbiguousMatch: boolean;
  matchCandidates?: Array<{ id: string; name: string; type: string; confidence: number }>;

  // Control Evaluation Outcome
  evaluatedControlIds: string[];
  complianceResult: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
  driftDetected: boolean;
  previousComplianceResult?: 'PASS' | 'FAIL' | 'WARNING';
  driftReason?: string;

  // Status & Governance
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED_COMPLIANT' | 'RISK_ACCEPTED_HUMAN' | 'FALSE_POSITIVE' | 'SUPPRESSED';
  resolvedAt?: string;
  resolvedBy?: string;
  humanReviewRequired: boolean;
  humanReviewNotes?: string;
}

export interface VendorSecurityObservation {
  id: string; // e.g. "VND-OBS-2026-041"
  tenantId: string;
  vendorId: string; // Linked GrcVendor
  vendorName: string;
  scannedDomain: string;
  authorizedAt: string;
  authorizedBy: string;
  scanTimestamp: string;
  scanType: 'EXTERNAL_TLS_SSL' | 'SECURITY_HEADERS' | 'DNS_DMARC' | 'EXPOSED_SERVICES' | 'THREAT_INTEL';
  
  findingType:
    | 'TLS_CERTIFICATE_EXPIRING'
    | 'WEAK_CIPHER_SUITE'
    | 'MISSING_HSTS_HEADER'
    | 'DMARC_POLICY_MISSING'
    | 'OPEN_MANAGEMENT_PORT'
    | 'KNOWN_BREACH_EXPOSURE'
    | 'SECURITY_RATING_DECLINE';

  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number; // 0 - 100
  details: string;
  evidenceSha256: string;
  impactOnVendorRisk: 'INCREASED' | 'UNCHANGED' | 'DECREASED';
  previousVendorRiskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  newVendorRiskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'REMEDIATED' | 'DISMISSED';
}

export interface ContinuousComplianceSummary {
  tenantId: string;
  lastUpdated: string;
  controlsMonitoredCount: number;
  controlsPassingCount: number;
  controlsDriftingCount: number;
  controlsFailedCount: number;
  evidenceFreshnessPercentage: number;
  evidenceCurrentCount: number;
  evidenceExpiringCount: number;
  evidenceExpiredCount: number;
  activeConnectorsCount: number;
  healthyConnectorsCount: number;
  warningConnectorsCount: number;
  failedConnectorsCount: number;
  openTelemetryObservationsCount: number;
  activeDriftAlerts: Array<{
    controlId: string;
    controlCode: string;
    controlTitle: string;
    frameworkCode: string;
    driftType: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    detectedAt: string;
    reason: string;
    sourceSystem: string;
    impactedRiskId?: string;
    nbaId?: string;
  }>;
}

export interface ExternalScanJob {
  id: string;
  tenantId: string;
  targetDomain: string;
  targetEntityType: 'VENDOR' | 'CANONICAL_ASSET' | 'PUBLIC_ENDPOINT';
  targetEntityId: string;
  authorizedBy: string;
  authorizedAt: string;
  scanScope: 'SSL_TLS' | 'DNS_MAIL' | 'SECURITY_HEADERS' | 'FULL_SURFACE';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'REJECTED_UNAUTHORIZED';
  startedAt?: string;
  completedAt?: string;
  findingsCount: number;
  evidenceHash?: string;
  rawResultsSummary?: string;
}
