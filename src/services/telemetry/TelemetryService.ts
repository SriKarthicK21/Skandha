/**
 * SKANDA Enterprise GRC — Telemetry & Integrations Frontend Service
 * Path: src/services/telemetry/TelemetryService.ts
 */

import {
  GrcConnector,
  TelemetryObservation,
  VendorSecurityObservation,
  ContinuousComplianceSummary,
  ExternalScanJob
} from '../../types/telemetryTypes';

export class TelemetryService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'x-tenant-id': 'tenant-acme',
      ...options.headers
    };

    const res = await fetch(endpoint, { credentials: 'omit', ...options, headers });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  public static async getIntegrations(tenantId: string = 'tenant-acme'): Promise<GrcConnector[]> {
    try {
      return await this.request<GrcConnector[]>(`/api/v1/integrations?tenantId=${tenantId}`);
    } catch {
      // Fallback in-memory catalog if dev server offline
      return this.getMockConnectors(tenantId);
    }
  }

  public static async testConnection(connectorId: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return await this.request<{ success: boolean; latencyMs: number; message: string }>(
      `/api/v1/integrations/${connectorId}/test`,
      { method: 'POST' }
    );
  }

  public static async syncConnector(connectorId: string, tenantId: string = 'tenant-acme'): Promise<any> {
    return await this.request<any>(
      `/api/v1/integrations/${connectorId}/sync`,
      { method: 'POST', body: JSON.stringify({ tenantId }) }
    );
  }

  public static async getObservations(
    tenantId: string = 'tenant-acme',
    filters?: { source?: string; severity?: string; status?: string }
  ): Promise<TelemetryObservation[]> {
    try {
      const params = new URLSearchParams({ tenantId, ...(filters || {}) });
      return await this.request<TelemetryObservation[]>(`/api/v1/observations?${params.toString()}`);
    } catch {
      return this.getMockObservations(tenantId);
    }
  }

  public static async getVendorObservations(tenantId: string = 'tenant-acme'): Promise<VendorSecurityObservation[]> {
    try {
      return await this.request<VendorSecurityObservation[]>(`/api/v1/vendor-monitoring/observations?tenantId=${tenantId}`);
    } catch {
      return this.getMockVendorObservations(tenantId);
    }
  }

  public static async executeVendorScan(
    tenantId: string,
    vendorId: string,
    domain: string,
    authorizedBy: string
  ): Promise<{ job: ExternalScanJob; observations: VendorSecurityObservation[] }> {
    return await this.request<{ job: ExternalScanJob; observations: VendorSecurityObservation[] }>(
      '/api/v1/scans/execute',
      {
        method: 'POST',
        body: JSON.stringify({ tenantId, vendorId, domain, authorizedBy })
      }
    );
  }

  public static async authorizeVendorDomain(
    tenantId: string,
    domain: string,
    authorizedBy: string
  ): Promise<{ success: boolean; message: string }> {
    return await this.request<{ success: boolean; message: string }>(
      '/api/v1/vendor-monitoring/authorize-domain',
      {
        method: 'POST',
        body: JSON.stringify({ tenantId, domain, authorizedBy })
      }
    );
  }

  public static async getContinuousComplianceSummary(tenantId: string = 'tenant-acme'): Promise<ContinuousComplianceSummary> {
    return {
      tenantId,
      lastUpdated: new Date().toISOString(),
      controlsMonitoredCount: 72,
      controlsPassingCount: 68,
      controlsDriftingCount: 3,
      controlsFailedCount: 1,
      evidenceFreshnessPercentage: 94,
      evidenceCurrentCount: 42,
      evidenceExpiringCount: 3,
      evidenceExpiredCount: 1,
      activeConnectorsCount: 6,
      healthyConnectorsCount: 6,
      warningConnectorsCount: 0,
      failedConnectorsCount: 0,
      openTelemetryObservationsCount: 14,
      activeDriftAlerts: [
        {
          controlId: 'CTRL-IAM-01',
          controlCode: 'CTRL-IAM-01',
          controlTitle: 'Privileged Account Multi-Factor Authentication',
          frameworkCode: 'ISO 27001 A.5.15',
          driftType: 'MFA_EXEMPTION_DETECTED',
          severity: 'HIGH',
          detectedAt: '10:42 AM',
          reason: '3 privileged accounts flagged without hardware token / WebAuthn MFA in Entra ID.',
          sourceSystem: 'Microsoft Entra ID',
          impactedRiskId: 'RSK-014',
          nbaId: 'NBA-001'
        },
        {
          controlId: 'CTRL-ENC-02',
          controlCode: 'CTRL-ENC-02',
          controlTitle: 'Database Storage Cryptographic Encryption at Rest',
          frameworkCode: 'MAS TRM Sec 11.2',
          driftType: 'UNENCRYPTED_SNAPSHOT',
          severity: 'MEDIUM',
          detectedAt: '08:15 AM',
          reason: 'AWS RDS unencrypted snapshot found in dev region.',
          sourceSystem: 'AWS Security Hub',
          impactedRiskId: 'RSK-008',
          nbaId: 'NBA-004'
        }
      ]
    };
  }

  // Fallbacks for offline demo rendering
  private static getMockConnectors(tenantId: string): GrcConnector[] {
    return [
      {
        id: 'conn-aws-sec-hub',
        tenantId,
        provider: 'AWS_SECURITY_HUB',
        name: 'AWS Security Hub & CSPM',
        category: 'CLOUD_INFRASTRUCTURE',
        description: 'AWS Security Hub connector streaming over STS AssumeRole',
        status: 'CONNECTED',
        truthStatus: 'CONFIGURED',
        authType: 'AWS_ASSUME_ROLE',
        roleArn: 'arn:aws:iam::566728183327:role/skanda-compliance-audit-readonly',
        isReadOnly: true,
        syncFrequencyMinutes: 15,
        lastSyncAt: new Date(Date.now() - 3 * 60000).toISOString(),
        nextSyncAt: new Date(Date.now() + 12 * 60000).toISOString(),
        lastSyncStatus: 'SUCCESS',
        recordsHarvestedTotal: 12430,
        activeDriftCount: 0,
        permissionsRequired: [
          { permission: 'securityhub:GetFindings', scope: 'Default Hub', purpose: 'Read CIS findings', isReadOnly: true, requiredFor: ['Continuous Evidence'] }
        ],
        capabilities: { supportsAssetDiscovery: true, supportsContinuousEvidence: true, supportsControlTesting: true, supportsVulnerabilityIngest: true, supportsWebhookStreaming: true },
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'conn-entra-id',
        tenantId,
        provider: 'MICROSOFT_ENTRA_ID',
        name: 'Microsoft Entra ID (Azure AD)',
        category: 'IDENTITY_ACCESS',
        description: 'Microsoft Entra ID streaming over Microsoft Graph API',
        status: 'CONNECTED',
        truthStatus: 'CONFIGURED',
        authType: 'AZURE_SERVICE_PRINCIPAL',
        clientId: '8f93e2b1-4c5a-4e89-b1d2-3a5c7e9f0a2b',
        isReadOnly: true,
        syncFrequencyMinutes: 15,
        lastSyncAt: new Date(Date.now() - 6 * 60000).toISOString(),
        nextSyncAt: new Date(Date.now() + 9 * 60000).toISOString(),
        lastSyncStatus: 'SUCCESS',
        recordsHarvestedTotal: 4201,
        activeDriftCount: 1,
        permissionsRequired: [
          { permission: 'User.Read.All', scope: 'Microsoft Graph', purpose: 'Audit directory accounts', isReadOnly: true, requiredFor: ['Access Control'] }
        ],
        capabilities: { supportsAssetDiscovery: true, supportsContinuousEvidence: true, supportsControlTesting: true, supportsVulnerabilityIngest: false, supportsWebhookStreaming: true },
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'conn-github',
        tenantId,
        provider: 'GITHUB',
        name: 'GitHub Enterprise Gate',
        category: 'SOURCE_CODE_DEVOPS',
        description: 'GitHub branch protection, Dependabot & CodeQL gate',
        status: 'CONNECTED',
        truthStatus: 'CONFIGURED',
        authType: 'WEBHOOK_HMAC',
        isReadOnly: true,
        syncFrequencyMinutes: 30,
        lastSyncAt: new Date(Date.now() - 14 * 60000).toISOString(),
        nextSyncAt: new Date(Date.now() + 16 * 60000).toISOString(),
        lastSyncStatus: 'SUCCESS',
        recordsHarvestedTotal: 890,
        activeDriftCount: 0,
        permissionsRequired: [
          { permission: 'repo:status', scope: 'skanda-enterprise/*', purpose: 'Verify branch protection', isReadOnly: true, requiredFor: ['SDLC Security'] }
        ],
        capabilities: { supportsAssetDiscovery: true, supportsContinuousEvidence: true, supportsControlTesting: true, supportsVulnerabilityIngest: true, supportsWebhookStreaming: true },
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private static getMockObservations(tenantId: string): TelemetryObservation[] {
    return [
      {
        id: 'OBS-2026-00091',
        tenantId,
        connectorId: 'conn-entra-id',
        connectorProvider: 'MICROSOFT_ENTRA_ID',
        sourceSystem: 'Microsoft Entra ID',
        externalId: 'usr-obj-98214',
        observedAt: new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        correlationId: 'corr-091',
        idempotencyKey: 'idemp-091',
        rawCategory: 'MFA_REGISTRATION_STATUS',
        normalizedCategory: 'MFA_ENFORCEMENT',
        severity: 'HIGH',
        confidence: 0.98,
        title: '3 Privileged Administrator Accounts Lack FIDO2/WebAuthn MFA',
        description: 'Continuous telemetry flagged 3 break-glass/admin identities missing enforced MFA tokens.',
        rawPayload: { accountsFlagged: ['admin.backup@skanda.io', 'svc.db@skanda.io', 'devops.lead@skanda.io'] },
        payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        canonicalEntityType: 'USER',
        canonicalEntityId: 'USR-SEC-ADMINS',
        matchConfidence: 0.96,
        isAmbiguousMatch: false,
        evaluatedControlIds: ['CTRL-IAM-01'],
        complianceResult: 'FAIL',
        driftDetected: true,
        previousComplianceResult: 'PASS',
        driftReason: 'MFA enforcement policy disabled for temporary staging admin window.',
        status: 'OPEN',
        humanReviewRequired: true
      }
    ];
  }

  private static getMockVendorObservations(tenantId: string): VendorSecurityObservation[] {
    return [
      {
        id: 'VND-OBS-2026-041',
        tenantId,
        vendorId: 'VND-003',
        vendorName: 'Databricks Analytics Cloud',
        scannedDomain: 'databricks.com',
        authorizedAt: '2026-10-01T00:00:00Z',
        authorizedBy: 'ciso@skanda.io',
        scanTimestamp: new Date().toISOString(),
        scanType: 'EXTERNAL_TLS_SSL',
        findingType: 'TLS_CERTIFICATE_EXPIRING',
        severity: 'HIGH',
        score: 65,
        details: 'TLS Certificate for api.databricks.com will expire in 7 days.',
        evidenceSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        impactOnVendorRisk: 'INCREASED',
        previousVendorRiskLevel: 'MEDIUM',
        newVendorRiskLevel: 'HIGH',
        status: 'ACTIVE'
      }
    ];
  }
}
