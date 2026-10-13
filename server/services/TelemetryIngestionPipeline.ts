// ============================================================================
// SKANDA Enterprise GRC — Telemetry Ingestion Pipeline Coordinator
// Path: server/services/TelemetryIngestionPipeline.ts
//
// Phase 12: Live Cloud Telemetry, Automated TPRM Scanning & Continuous Evidence
// ============================================================================

import crypto from 'crypto';
import {
  ITelemetryConnector,
  CanonicalComplianceEvidence,
  ConnectorSyncResult
} from '../connectors/ITelemetryConnector';
import {
  AwsSecurityHubConnector,
  MicrosoftEntraIdConnector,
  GitHubGateConnector,
  AzureDefenderConnector,
  JiraServiceDeskConnector,
  MicrosoftSentinelConnector,
  OktaScimConnector,
  ServiceNowCmdbConnector,
  QualysVulnerabilityConnector,
  TenableIoConnector,
  DefenderForEndpointConnector
} from '../connectors/TelemetryConnectors';
import {
  TelemetryObservation,
  ConnectorProvider
} from '../../src/types/telemetryTypes';
import { cryptographicWormLedger } from './CryptographicWormLedger';
import { continuousComplianceEngine } from './ContinuousComplianceEngine';
import { DomainEventBus } from '../../src/services/canonical/DomainEventBus';
import { OutboxBrokerService } from './OutboxBrokerService';

export interface IngestionRunSummary {
  runId: string;
  timestamp: string;
  totalConnectorsPolled: number;
  successfulConnectors: number;
  failedConnectors: number;
  totalPacketsIngested: number;
  observationsHarvested: number;
  evidenceItemsCommitted: number;
  wormBlockHeight: number;
  wormMerkleRoot: string;
  driftEventsRaised: number;
  connectorsSummary: Array<{
    id: string;
    name: string;
    provider: ConnectorProvider;
    status: string;
    latencyMs: number;
    packetsIngested: number;
    error?: string;
  }>;
}

export class TelemetryIngestionPipeline {
  private static instance: TelemetryIngestionPipeline;
  private connectors: Map<string, ITelemetryConnector> = new Map();
  private observationsStore: Map<string, TelemetryObservation[]> = new Map(); // tenantId -> observations
  private idempotencyCache: Set<string> = new Set(); // tenantId:idempotencyKey
  private lastRunSummary: IngestionRunSummary | null = null;
  private isIngesting = false;
  private autoIngestInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Register enterprise connectors
    this.registerConnector(new AwsSecurityHubConnector());
    this.registerConnector(new MicrosoftEntraIdConnector());
    this.registerConnector(new GitHubGateConnector());
    this.registerConnector(new AzureDefenderConnector());
    this.registerConnector(new JiraServiceDeskConnector());
    this.registerConnector(new MicrosoftSentinelConnector());
    this.registerConnector(new OktaScimConnector());
    this.registerConnector(new ServiceNowCmdbConnector());
    this.registerConnector(new QualysVulnerabilityConnector());
    this.registerConnector(new TenableIoConnector());
    this.registerConnector(new DefenderForEndpointConnector());
  }

  public static getInstance(): TelemetryIngestionPipeline {
    if (!TelemetryIngestionPipeline.instance) {
      TelemetryIngestionPipeline.instance = new TelemetryIngestionPipeline();
    }
    return TelemetryIngestionPipeline.instance;
  }

  public registerConnector(connector: ITelemetryConnector): void {
    this.connectors.set(connector.id, connector);
  }

  public getConnector(id: string): ITelemetryConnector | undefined {
    return this.connectors.get(id);
  }

  public getAllConnectors(): ITelemetryConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Starts background ingestion scheduler (runs every 30s)
   */
  public startPipeline(intervalMs: number = 30000): void {
    if (this.autoIngestInterval) {
      clearInterval(this.autoIngestInterval);
    }
    this.autoIngestInterval = setInterval(() => {
      this.executeIngestionCycle('tenant-acme', 'SCHEDULED_PIPELINE').catch(err => {
        console.error('[TelemetryIngestionPipeline] Ingestion cycle failed:', err);
      });
    }, intervalMs);

    // Initial baseline pass
    setImmediate(() => {
      this.executeIngestionCycle('tenant-acme', 'INITIAL_STARTUP').catch(console.error);
    });
  }

  /**
   * Core Ingestion Cycle:
   * 1. Pulls telemetry from all registered connectors
   * 2. Deduplicates with Idempotency Cache
   * 3. Normalizes into Canonical Observations & Evidence
   * 4. Evaluates Controls & Detects Drift
   * 5. Emits Domain Events & Outbox Records
   * 6. Commits into Cryptographic WORM Ledger
   */
  public async executeIngestionCycle(
    tenantId: string = 'tenant-acme',
    triggerReason: string = 'ON_DEMAND'
  ): Promise<IngestionRunSummary> {
    if (this.isIngesting) {
      if (this.lastRunSummary) return this.lastRunSummary;
    }

    this.isIngesting = true;
    const runId = `pipe-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    const collectedEvidence: CanonicalComplianceEvidence[] = [];
    const collectedObservations: TelemetryObservation[] = [];
    let totalPackets = 0;
    let successfulCount = 0;
    let failedCount = 0;
    let totalDriftEvents = 0;
    const connectorsSummary: IngestionRunSummary['connectorsSummary'] = [];

    for (const connector of this.connectors.values()) {
      try {
        const valRes = await connector.validateConnection();
        if (!valRes.success) {
          failedCount++;
          connectorsSummary.push({
            id: connector.id,
            name: connector.name,
            provider: connector.provider,
            status: valRes.authStatus,
            latencyMs: valRes.latencyMs,
            packetsIngested: 0,
            error: valRes.message
          });
          continue;
        }

        const pullRes: ConnectorSyncResult = await connector.pullTelemetry(tenantId);
        if (pullRes.success) {
          // Idempotent processing of observations
          for (const obs of pullRes.observations || []) {
            const cacheKey = `${tenantId}:${obs.idempotencyKey}`;
            if (!this.idempotencyCache.has(cacheKey)) {
              this.idempotencyCache.add(cacheKey);
              collectedObservations.push(obs);

              // Publish TelemetryNormalized event
              DomainEventBus.publish({
                type: 'TelemetryNormalized',
                tenantId,
                actorId: `connector:${connector.id}`,
                entityId: obs.id,
                entityType: 'TELEMETRY_OBSERVATION',
                summary: `Normalized telemetry from ${connector.name}: ${obs.title}`,
                metadata: {
                  observationId: obs.id,
                  provider: obs.connectorProvider,
                  severity: obs.severity,
                  canonicalEntityId: obs.canonicalEntityId,
                  evaluatedControlIds: obs.evaluatedControlIds
                }
              });

              // Check for drift
              if (obs.driftDetected) {
                totalDriftEvents++;
                DomainEventBus.publish({
                  type: 'ControlDriftDetected',
                  tenantId,
                  actorId: `connector:${connector.id}`,
                  entityId: obs.evaluatedControlIds[0] || 'UNKNOWN_CONTROL',
                  entityType: 'CONTROL',
                  summary: `Drift detected on control ${obs.evaluatedControlIds[0]}: ${obs.title}`,
                  metadata: {
                    observationId: obs.id,
                    reason: obs.driftReason || obs.description
                  }
                });
              }
            }
          }

          if (pullRes.evidenceRecords && pullRes.evidenceRecords.length > 0) {
            collectedEvidence.push(...pullRes.evidenceRecords);
          }
          totalPackets += pullRes.packetsIngested;
          successfulCount++;
          connectorsSummary.push({
            id: connector.id,
            name: connector.name,
            provider: connector.provider,
            status: 'HEALTHY',
            latencyMs: valRes.latencyMs,
            packetsIngested: pullRes.packetsIngested
          });
        } else {
          failedCount++;
          connectorsSummary.push({
            id: connector.id,
            name: connector.name,
            provider: connector.provider,
            status: 'FAILED',
            latencyMs: valRes.latencyMs,
            packetsIngested: 0,
            error: pullRes.error || 'Pull returned unsuccessful status'
          });
        }
      } catch (err: any) {
        failedCount++;
        connectorsSummary.push({
          id: connector.id,
          name: connector.name,
          provider: connector.provider,
          status: 'ERROR',
          latencyMs: 0,
          packetsIngested: 0,
          error: err.message
        });
      }
    }

    // Append to in-memory observations store for tenant
    if (!this.observationsStore.has(tenantId)) {
      this.observationsStore.set(tenantId, []);
    }
    this.observationsStore.get(tenantId)!.push(...collectedObservations);

    // Commit evidence batch to WORM Ledger
    let blockHeight = 0;
    let merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';
    if (collectedEvidence.length > 0) {
      try {
        const commitRes = await cryptographicWormLedger.commitBatch(collectedEvidence);
        blockHeight = commitRes.blockHeight;
        merkleRoot = commitRes.merkleRoot;
      } catch (e) {
        console.warn('[TelemetryIngestionPipeline] WORM Ledger commit skipped:', e);
      }
    }

    // Trigger downstream ContinuousComplianceEngine
    try {
      continuousComplianceEngine.executeScheduledSweep(tenantId);
    } catch {
      // Background non-blocking
    }

    this.lastRunSummary = {
      runId,
      timestamp,
      totalConnectorsPolled: this.connectors.size,
      successfulConnectors: successfulCount,
      failedConnectors: failedCount,
      totalPacketsIngested: totalPackets,
      observationsHarvested: collectedObservations.length,
      evidenceItemsCommitted: collectedEvidence.length,
      wormBlockHeight: blockHeight,
      wormMerkleRoot: merkleRoot,
      driftEventsRaised: totalDriftEvents,
      connectorsSummary
    };

    this.isIngesting = false;
    return this.lastRunSummary;
  }

  /**
   * Ingest a single raw webhook event with HMAC validation and deduplication
   */
  public async ingestWebhookEvent(
    tenantId: string,
    connectorId: string,
    rawPayload: Record<string, any>,
    signatureHeader?: string,
    secret?: string
  ): Promise<{ success: boolean; observation?: TelemetryObservation; message: string }> {
    // 1. Webhook Signature Verification if secret is configured
    if (secret && signatureHeader) {
      const computedSig = crypto.createHmac('sha256', secret).update(JSON.stringify(rawPayload)).digest('hex');
      const expectedSig = signatureHeader.replace(/^sha256=/, '');
      if (computedSig !== expectedSig) {
        return { success: false, message: 'Invalid HMAC SHA-256 signature. Webhook rejected.' };
      }
    }

    const now = new Date().toISOString();
    const externalId = rawPayload.resourceId || rawPayload.id || `raw-${Date.now()}`;
    const idempotencyKey = `${tenantId}:${connectorId}:${externalId}:${crypto.createHash('md5').update(JSON.stringify(rawPayload)).digest('hex')}`;

    if (this.idempotencyCache.has(idempotencyKey)) {
      return { success: true, message: 'Duplicate webhook event received. Deduplicated safely without re-processing.' };
    }
    this.idempotencyCache.add(idempotencyKey);

    // 2. Normalization
    const obs: TelemetryObservation = {
      id: `OBS-WH-${Date.now()}`,
      tenantId,
      connectorId,
      connectorProvider: 'CUSTOM_WEBHOOK',
      sourceSystem: rawPayload.source || 'External Webhook',
      externalId,
      observedAt: rawPayload.timestamp || now,
      receivedAt: now,
      correlationId: `corr-wh-${Date.now()}`,
      idempotencyKey,
      rawCategory: rawPayload.category || 'GENERIC_SECURITY_EVENT',
      normalizedCategory: 'CONFIGURATION_DRIFT',
      severity: rawPayload.severity || 'MEDIUM',
      confidence: 0.95,
      title: rawPayload.title || 'Inbound Webhook Security Observation',
      description: rawPayload.description || 'Processed inbound continuous compliance telemetry.',
      rawPayload,
      payloadHash: crypto.createHash('sha256').update(JSON.stringify(rawPayload)).digest('hex'),
      canonicalEntityType: 'ASSET',
      canonicalEntityId: rawPayload.assetId,
      matchConfidence: rawPayload.assetId ? 0.95 : 0.65,
      isAmbiguousMatch: !rawPayload.assetId,
      evaluatedControlIds: rawPayload.controlIds || ['CTRL-GEN-01'],
      complianceResult: rawPayload.complianceResult || 'PASS',
      driftDetected: rawPayload.driftDetected || false,
      status: 'OPEN',
      humanReviewRequired: !rawPayload.assetId
    };

    if (!this.observationsStore.has(tenantId)) {
      this.observationsStore.set(tenantId, []);
    }
    this.observationsStore.get(tenantId)!.push(obs);

    // Emit event
    DomainEventBus.publish({
      type: 'TelemetryReceived',
      tenantId,
      actorId: `webhook:${connectorId}`,
      entityId: obs.id,
      entityType: 'TELEMETRY_OBSERVATION',
      summary: `Inbound webhook ingested observation ${obs.id}`,
      metadata: { observationId: obs.id, title: obs.title }
    });

    return { success: true, observation: obs, message: 'Webhook observation ingested and normalized successfully.' };
  }

  public getObservationsForTenant(tenantId: string): TelemetryObservation[] {
    return this.observationsStore.get(tenantId) || [];
  }

  public getLastRunSummary(): IngestionRunSummary | null {
    return this.lastRunSummary;
  }
}

export const telemetryIngestionPipeline = TelemetryIngestionPipeline.getInstance();
