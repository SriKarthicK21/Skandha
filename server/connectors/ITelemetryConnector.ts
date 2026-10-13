// ============================================================================
// SKANDA Enterprise GRC — Telemetry Connector Contracts & Data Models
// Path: server/connectors/ITelemetryConnector.ts
//
// Phase 12: Live Cloud Telemetry, Automated TPRM Scanning & Continuous Evidence
// ============================================================================

import {
  ConnectorProvider,
  ConnectorCategory,
  ConnectorStatus,
  TruthStatus,
  ConnectorPermissionRequirement,
  TelemetryObservation
} from '../../src/types/telemetryTypes';

export type ConnectorAuthType =
  | 'AWS_ASSUME_ROLE'
  | 'AZURE_SERVICE_PRINCIPAL'
  | 'OAUTH2_BEARER'
  | 'API_KEY'
  | 'WEBHOOK_HMAC_SHA256'
  | 'MTLS_CLIENT_CERT';

export interface ConnectorCredentialConfig {
  authType: ConnectorAuthType;
  roleArn?: string;
  externalId?: string;
  tenantId?: string;
  clientId?: string;
  clientSecretMasked?: string;
  apiTokenMasked?: string;
  endpointUrl?: string;
  webhookSecretMasked?: string;
  certificateExpiry?: string;
  isConfigured: boolean;
  syncFrequencyMinutes?: number;
}

export interface RawTelemetryEvent {
  eventId: string;
  timestamp: string;
  sourceSystem: string;
  eventType: string;
  payload: Record<string, any>;
  signature?: string;
}

export interface CanonicalComplianceEvidence {
  evidenceId: string;
  sourceId: string;
  sourceType: string;
  ingestionTimestamp: string;
  eventTimestamp: string;
  
  // Normalized Framework Mappings
  controlMappings: {
    iso27001?: string[];   // e.g. ['A.5.17', 'A.8.16']
    soc2?: string[];       // e.g. ['CC6.1', 'CC7.2']
    masTrm?: string[];     // e.g. ['Sec 11.2', 'Sec 13.0']
    nistCsf?: string[];    // e.g. ['PR.AC-1', 'DE.CM-1']
  };

  // Operational Evaluation Metrics
  complianceStatus: 'PASS' | 'FAIL' | 'WARNING';
  testedMetricName: string;
  metricObservedValue: string | number;
  thresholdCriteria: string;
  driftDetected: boolean;
  driftReason?: string;
  
  // Raw Evidence Digest for Cryptographic WORM Verification
  evidenceDigestSha256: string;
  rawPayloadSummary: string;
}

export interface ConnectorCapabilities {
  supportsAssetDiscovery: boolean;
  supportsContinuousEvidence: boolean;
  supportsControlTesting: boolean;
  supportsVulnerabilityIngest: boolean;
  supportsWebhookStreaming: boolean;
}

export interface ConnectorSyncResult {
  success: boolean;
  observations: TelemetryObservation[];
  evidenceRecords: CanonicalComplianceEvidence[];
  packetsIngested: number;
  driftEventsRaised: number;
  error?: string;
}

export interface ITelemetryConnector {
  readonly id: string;
  readonly provider: ConnectorProvider;
  readonly name: string;
  readonly category: ConnectorCategory;
  readonly protocol: string;
  readonly isReadOnly: boolean;
  readonly truthStatus: TruthStatus;

  /**
   * Connect and initialize session with upstream provider
   */
  connect(credentials?: Partial<ConnectorCredentialConfig>): Promise<{ success: boolean; message: string }>;

  /**
   * Terminate connection and revoke active sessions
   */
  disconnect(): Promise<{ success: boolean; message: string }>;

  /**
   * Validates service credentials and verifies IAM policy / OAuth token validity
   */
  validateConnection(): Promise<{
    success: boolean;
    latencyMs: number;
    authStatus: 'AUTHENTICATED' | 'LEASE_EXPIRED' | 'HIGH_LATENCY' | 'NOT_CONFIGURED' | 'FAILED';
    message: string;
  }>;

  /**
   * Periodic healthcheck
   */
  healthCheck(): Promise<{
    status: ConnectorStatus;
    latencyMs: number;
    lastCheckedAt: string;
    details: string;
  }>;

  /**
   * Pulls or ingests latest telemetry, converts to canonical compliance evidence,
   * and maps to ISO 27001 / MAS TRM / SOC 2 controls.
   */
  pullTelemetry(tenantId?: string): Promise<ConnectorSyncResult>;

  /**
   * Discover upstream cloud/IT assets
   */
  discoverAssets?(tenantId: string): Promise<Array<{
    externalId: string;
    name: string;
    type: string;
    cloudProvider: string;
    rawMetadata: Record<string, any>;
  }>>;

  /**
   * Expose connector capabilities
   */
  getCapabilities(): ConnectorCapabilities;

  /**
   * Expose least-privilege permission requirements
   */
  getPermissions(): ConnectorPermissionRequirement[];

  /**
   * Returns current configuration status and sanitized masked credentials
   */
  getCredentialConfig(): ConnectorCredentialConfig;
  
  /**
   * Updates credentials securely
   */
  updateCredentialConfig(config: Partial<ConnectorCredentialConfig>): void;
}
