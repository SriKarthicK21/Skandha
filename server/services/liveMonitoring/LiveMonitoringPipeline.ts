// ============================================================================
// SKANDA LIVE MONITORING PIPELINE
// Path: server/services/liveMonitoring/LiveMonitoringPipeline.ts
//
// The end-to-end continuous monitoring workflow:
//
//   connector observation
//     -> canonical signal (validation + server-verified tenant binding)
//     -> durable queue (idempotent, retry with backoff, dead letter, replay)
//     -> deterministic control evaluation (versioned rule)
//     -> evidence artefact (SHA-256 + WORM ledger seal)
//     -> continuous control state + explicit transition (drift)
//     -> canonical finding (deduplicated while the condition persists)
//     -> remediation task / owner assignment / notification
//     -> retest -> verified recovery (or reopening)
//     -> freshness sweep (STALE / UNKNOWN when observation stops)
//
// Reuse: this service does not replace the ContinuousComplianceEngine,
// TelemetryIngestionPipeline, Evidence Fabric or the GRC finding register. It
// feeds them: findings and evidence are written through the canonical
// repositories (getGrcDataStore) and evidence integrity uses the existing
// CryptographicWormLedger.
// ============================================================================

import crypto from 'crypto';
import {
  ControlComplianceStatus,
  ControlEvaluationRecord,
  ControlMonitoringState,
  ControlStateTransition,
  IntegrationHealthSnapshot,
  IntegrationMaturityState,
  MonitoringDeadLetterRecord,
  MonitoringFindingLink,
  MonitoringFreshness,
  MonitoringIntegration,
  MonitoringJob,
  MonitoringJobType,
  MonitoringOverview,
  SecuritySignal,
  SignalProcessingStatus,
  TransitionTriggerKind
} from '../../../src/types/liveMonitoringTypes';
import {
  IMonitoringDataStore,
  computeJobBackoffMs,
  getLiveMonitoringDataStore,
  monitoringId
} from '../../repositories/LiveMonitoringRepository';
import {
  IntegrationBinding,
  RawSignalInput,
  computePayloadSha256,
  normalizeInboundSignal
} from './signalNormalization';
import {
  CONTROL_EVALUATION_RULES,
  RuleEvaluation,
  applyFreshnessPolicy,
  classifyTransition,
  computeFreshness,
  evaluateRuleAgainstSignal,
  getRule,
  getRulesForSignalType
} from './controlEvaluationRules';
import { getGrcDataStore } from '../../repositories/GrcRepositoryFactory';
import { cryptographicWormLedger } from '../CryptographicWormLedger';
import { DomainEventBus } from '../../../src/services/canonical/DomainEventBus';
import { FindingEntity, FindingSeverity } from '../../../src/db/enterpriseSchema';

export interface IngestOutcome {
  accepted: boolean;
  processingStatus: SignalProcessingStatus;
  signalId?: string;
  jobId?: string;
  duplicate: boolean;
  reason?: string;
  unmappedProviderEventType?: string;
}

export interface ProcessRunSummary {
  claimed: number;
  succeeded: number;
  retried: number;
  deadLettered: number;
  skippedIdempotent: number;
}

const DEFAULT_SLA_DAYS = 30;

// ---------------------------------------------------------------------------
// NOTIFICATION POLICY
// ---------------------------------------------------------------------------

export interface NotificationDecision {
  shouldNotify: boolean;
  reason: string;
  channels: Array<'IN_APP' | 'EMAIL' | 'TEAMS' | 'SLACK'>;
}

// ---------------------------------------------------------------------------
// PIPELINE
// ---------------------------------------------------------------------------

export class LiveMonitoringPipeline {
  private static instance: LiveMonitoringPipeline;
  private processing = false;

  public static getInstance(): LiveMonitoringPipeline {
    if (!LiveMonitoringPipeline.instance) {
      LiveMonitoringPipeline.instance = new LiveMonitoringPipeline();
    }
    return LiveMonitoringPipeline.instance;
  }

  private get store(): IMonitoringDataStore {
    return getLiveMonitoringDataStore();
  }

  // =========================================================================
  // INTEGRATION LIFECYCLE
  // =========================================================================

  public async registerIntegration(params: {
    tenantId: string;
    connectorId: string;
    provider: string;
    displayName: string;
    monitoringMode: MonitoringIntegration['monitoringMode'];
    capabilities: MonitoringIntegration['capabilities'];
    credentialReference?: string;
    grantedScopes?: string[];
    resourceScope?: string[];
    pollIntervalSeconds?: number;
    freshnessThresholdSeconds?: number;
    maturityState?: IntegrationMaturityState;
  }): Promise<MonitoringIntegration> {
    const now = new Date().toISOString();
    const existing = await this.store.getIntegrationByConnector(params.tenantId, params.connectorId);
    const pollIntervalSeconds = params.pollIntervalSeconds ?? 900;

    const integration: MonitoringIntegration = {
      id: existing?.id ?? monitoringId('INT'),
      tenantId: params.tenantId,
      connectorId: params.connectorId,
      provider: params.provider,
      displayName: params.displayName,
      environment: 'PRODUCTION',
      monitoringMode: params.monitoringMode,
      maturityState: params.maturityState ?? (params.credentialReference ? 'CONFIGURATION_REQUIRED' : 'CATALOG_ONLY'),
      healthState: existing?.healthState ?? 'UNKNOWN',
      capabilities: params.capabilities,
      credentialReference: params.credentialReference,
      grantedScopes: params.grantedScopes ?? [],
      resourceScope: params.resourceScope ?? [],
      pollIntervalSeconds,
      freshnessThresholdSeconds: params.freshnessThresholdSeconds ?? pollIntervalSeconds * 2,
      checkpoint: existing?.checkpoint,
      lastSuccessfulSyncAt: existing?.lastSuccessfulSyncAt,
      lastFailedSyncAt: existing?.lastFailedSyncAt,
      lastError: existing?.lastError,
      consecutiveFailureCount: existing?.consecutiveFailureCount ?? 0,
      isEnabled: existing?.isEnabled ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    return this.store.saveIntegration(integration);
  }

  public async getIntegration(tenantId: string, integrationId: string): Promise<MonitoringIntegration | null> {
    return this.store.getIntegration(tenantId, integrationId);
  }

  public async listIntegrations(tenantId: string): Promise<MonitoringIntegration[]> {
    return this.store.listIntegrations(tenantId);
  }

  /** Records a successful collection: advances the checkpoint and refreshes health. */
  public async recordSyncSuccess(params: {
    tenantId: string;
    integrationId: string;
    checkpoint?: MonitoringIntegration['checkpoint'];
    latencyMs?: number;
    maturityState?: IntegrationMaturityState;
  }): Promise<MonitoringIntegration> {
    const integration = await this.store.getIntegration(params.tenantId, params.integrationId);
    if (!integration) throw new Error(`Integration ${params.integrationId} not found for tenant ${params.tenantId}.`);

    return this.store.updateIntegration(params.tenantId, params.integrationId, {
      checkpoint: { ...(integration.checkpoint || {}), ...(params.checkpoint || {}) },
      lastSuccessfulSyncAt: new Date().toISOString(),
      lastError: undefined,
      consecutiveFailureCount: 0,
      healthState: 'HEALTHY',
      maturityState: params.maturityState ?? (integration.maturityState === 'CATALOG_ONLY' ? 'MONITORING_ACTIVE' : integration.maturityState)
    });
  }

  /**
   * Records a failed collection. This is a MONITORING failure: affected control
   * states are marked with monitoringFailure so they can never be presented as
   * either compliant or non-compliant while the provider is unreachable.
   */
  public async recordSyncFailure(params: {
    tenantId: string;
    integrationId: string;
    error: string;
    authenticationFailure?: boolean;
  }): Promise<{ integration: MonitoringIntegration; controlsMarkedUnknown: number }> {
    const integration = await this.store.getIntegration(params.tenantId, params.integrationId);
    if (!integration) throw new Error(`Integration ${params.integrationId} not found for tenant ${params.tenantId}.`);

    const failureCount = (integration.consecutiveFailureCount || 0) + 1;
    const updated = await this.store.updateIntegration(params.tenantId, params.integrationId, {
      lastFailedSyncAt: new Date().toISOString(),
      lastError: params.error,
      consecutiveFailureCount: failureCount,
      healthState: failureCount >= 3 ? 'FAILING' : 'DEGRADED',
      maturityState: params.authenticationFailure
        ? 'AUTHENTICATION_FAILED'
        : failureCount >= 3
          ? 'DEGRADED'
          : integration.maturityState
    });

    const states = await this.store.listStates(params.tenantId, { limit: 2000 });
    let marked = 0;
    for (const state of states.filter(s => s.integrationId === params.integrationId)) {
      await this.store.upsertState({
        ...state,
        monitoringFailure: true,
        monitoringFailureReason: params.error,
        failureKind: 'MONITORING_FAILURE',
        consecutiveFailureCount: state.consecutiveFailureCount + 1,
        status: 'UNKNOWN',
        lastKnownStatus: state.status === 'UNKNOWN' ? state.lastKnownStatus : state.status,
        updatedAt: new Date().toISOString()
      });
      marked += 1;
    }

    if (params.authenticationFailure) {
      await this.store.updateIntegration(params.tenantId, params.integrationId, {
        maturityState: 'AUTHENTICATION_FAILED'
      });
    }

    DomainEventBus.publish({
      type: 'MonitoringIntegrationFailed',
      tenantId: params.tenantId,
      actorId: `integration:${params.integrationId}`,
      entityId: params.integrationId,
      entityType: 'INTEGRATION',
      summary: `Monitoring failure on ${integration.displayName}: ${params.error}`,
      metadata: { failureCount, authenticationFailure: Boolean(params.authenticationFailure), controlsMarkedUnknown: marked }
    });

    return { integration: updated, controlsMarkedUnknown: marked };
  }

  /** Disconnection and credential revocation. States become UNKNOWN, not compliant. */
  public async disconnectIntegration(params: {
    tenantId: string;
    integrationId: string;
    revokeCredential?: boolean;
    reason?: string;
  }): Promise<{ integration: MonitoringIntegration; controlsMarkedUnknown: number }> {
    const integration = await this.store.getIntegration(params.tenantId, params.integrationId);
    if (!integration) throw new Error(`Integration ${params.integrationId} not found for tenant ${params.tenantId}.`);

    const now = new Date().toISOString();
    const updated = await this.store.updateIntegration(params.tenantId, params.integrationId, {
      isEnabled: false,
      healthState: 'DISABLED',
      maturityState: 'DISCONNECTED',
      disconnectedAt: now,
      credentialRevokedAt: params.revokeCredential ? now : integration.credentialRevokedAt,
      credentialReference: params.revokeCredential ? undefined : integration.credentialReference,
      lastError: params.reason
    });

    const states = await this.store.listStates(params.tenantId, { limit: 2000 });
    let marked = 0;
    for (const state of states.filter(s => s.integrationId === params.integrationId)) {
      await this.store.upsertState({
        ...state,
        monitoringFailure: true,
        monitoringFailureReason: params.reason ?? 'Integration disconnected; no observation is possible.',
        failureKind: 'MONITORING_FAILURE',
        status: 'UNKNOWN',
        lastKnownStatus: state.status === 'UNKNOWN' ? state.lastKnownStatus : state.status,
        updatedAt: now
      });
      marked += 1;
    }

    return { integration: updated, controlsMarkedUnknown: marked };
  }

  // =========================================================================
  // INGESTION
  // =========================================================================

  /**
   * Ingests one provider observation. The tenant is taken from `binding`
   * (verified integration ownership), never from the payload.
   */
  public async ingestSignal(params: { binding: IntegrationBinding; input: RawSignalInput }): Promise<IngestOutcome> {
    const integration = await this.store.getIntegration(params.binding.tenantId, params.binding.integrationId);
    if (!integration || !integration.isEnabled) {
      return {
        accepted: false,
        processingStatus: 'REJECTED_UNKNOWN_INTEGRATION',
        duplicate: false,
        reason: integration
          ? 'Integration is disabled; no observations are accepted while it is disconnected.'
          : 'Integration is not registered for this tenant. Observations are refused.'
      };
    }

    const normalization = normalizeInboundSignal(params.input, params.binding);
    if (!normalization.accepted || !normalization.signal) {
      // Rejected events are still recorded so malformed input is auditable and
      // never silently swallowed.
      if (normalization.processingStatus !== 'REJECTED_UNKNOWN_INTEGRATION') {
        const rejected: SecuritySignal = {
          id: monitoringId('SIG-REJ'),
          tenantId: params.binding.tenantId,
          integrationId: params.binding.integrationId,
          connectorId: params.binding.connectorId,
          provider: params.binding.provider,
          providerEventId: String(params.input?.providerEventId ?? 'unidentified'),
          providerEventType: String(params.input?.providerEventType ?? 'unidentified'),
          signalType: 'GENERIC_SECURITY_EVENT',
          canonicalEntityType: 'UNKNOWN',
          canonicalEntityId: String(params.input?.resourceRef ?? 'unidentified'),
          resourceRef: String(params.input?.resourceRef ?? 'unidentified'),
          resourceScope: [...params.binding.resourceScope],
          observedState: null,
          sourceObservedAt: new Date().toISOString(),
          ingestedAt: new Date().toISOString(),
          severity: 'INFORMATIONAL',
          provenance: {
            sourceEventReference: `${params.binding.provider}:${String(params.input?.providerEventType ?? 'unidentified')}`,
            sourceEventSha256: computePayloadSha256(params.input?.payload ?? null),
            receivedFromUntrustedChannel: params.binding.receivedFromUntrustedChannel,
            signatureVerification: params.binding.signatureVerification,
            rawPayloadPreserved: true
          },
          correlationId: `corr-rejected-${crypto.randomUUID().slice(0, 12)}`,
          idempotencyKey: `rejected|${params.binding.tenantId}|${params.binding.connectorId}|${computePayloadSha256(params.input?.payload ?? null)}|${Date.now()}`,
          processingStatus: normalization.processingStatus,
          providerFields: {},
          evaluatedControlIds: [],
          rejectionReason: normalization.rejectionReason
        };
        await this.store.saveSignal(rejected);
      }
      return {
        accepted: false,
        processingStatus: normalization.processingStatus,
        duplicate: false,
        reason: normalization.rejectionReason
      };
    }

    const signal = normalization.signal;
    signal.processingStatus = 'RECEIVED';
    const saved = await this.store.saveSignal(signal);

    if (!saved.created) {
      const existing = saved.signal;
      const duplicateStatus: SignalProcessingStatus =
        existing.processingStatus === 'PROCESSED' ? 'DUPLICATE_SUPPRESSED' : existing.processingStatus;
      return {
        accepted: true,
        processingStatus: duplicateStatus,
        signalId: existing.id,
        duplicate: true,
        reason:
          'An identical observation (same provider event, resource and observation time) already exists; the duplicate was suppressed and not re-processed.'
      };
    }

    const job = await this.enqueue(this.store, {
      tenantId: signal.tenantId,
      jobType: 'PROCESS_SIGNAL',
      idempotencyKey: `PROCESS_SIGNAL|${signal.id}`,
      payload: { signalId: signal.id },
      correlationId: signal.correlationId
    });

    await this.store.updateSignal(signal.tenantId, signal.id, { processingStatus: 'QUEUED' });

    return {
      accepted: true,
      processingStatus: 'QUEUED',
      signalId: signal.id,
      jobId: job.id,
      duplicate: false,
      unmappedProviderEventType: normalization.unmappedProviderEventType
    };
  }

  private async enqueue(
    store: IMonitoringDataStore,
    params: { tenantId: string; jobType: MonitoringJobType; idempotencyKey: string; payload: Record<string, unknown>; correlationId: string; maxAttempts?: number }
  ): Promise<MonitoringJob> {
    const job: MonitoringJob = {
      id: monitoringId('JOB'),
      tenantId: params.tenantId,
      jobType: params.jobType,
      idempotencyKey: params.idempotencyKey,
      payload: params.payload,
      status: 'PENDING',
      attemptCount: 0,
      maxAttempts: params.maxAttempts ?? 5,
      nextAttemptAt: new Date().toISOString(),
      correlationId: params.correlationId,
      createdAt: new Date().toISOString()
    };
    const result = await store.enqueueJob(job);
    return result.job;
  }

  // =========================================================================
  // DURABLE PROCESSING
  // =========================================================================

  /**
   * Processes queued jobs for one tenant. Idempotent: a job that already
   * succeeded is not re-executed, retried failures back off, and exhausted
   * failures land in the dead-letter queue for controlled replay.
   */
  public async processPendingJobs(tenantId: string, maxJobs: number = 25): Promise<ProcessRunSummary> {
    if (this.processing) {
      return { claimed: 0, succeeded: 0, retried: 0, deadLettered: 0, skippedIdempotent: 0 };
    }
    this.processing = true;
    const summary: ProcessRunSummary = { claimed: 0, succeeded: 0, retried: 0, deadLettered: 0, skippedIdempotent: 0 };

    try {
      for (let i = 0; i < maxJobs; i += 1) {
        const job = await this.store.claimNextJob(tenantId);
        if (!job) break;
        summary.claimed += 1;

        try {
          const outcome = await this.executeJob(job);
          if (outcome === 'SKIPPED') {
            summary.skippedIdempotent += 1;
          } else {
            summary.succeeded += 1;
          }
          await this.store.updateJob(tenantId, job.id, {
            status: 'SUCCEEDED',
            processedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            lastError: undefined
          });
        } catch (err: any) {
          const message = err?.message || 'Unknown processing failure.';
          if (job.attemptCount >= job.maxAttempts) {
            summary.deadLettered += 1;
            await this.store.updateJob(tenantId, job.id, {
              status: 'DEAD_LETTERED',
              lastError: message,
              finishedAt: new Date().toISOString()
            });
            const deadLetter: MonitoringDeadLetterRecord = {
              id: monitoringId('DLQ'),
              tenantId,
              jobId: job.id,
              jobType: job.jobType,
              correlationId: job.correlationId,
              failureReason: message,
              payload: job.payload,
              attemptCount: job.attemptCount,
              deadLetteredAt: new Date().toISOString(),
              status: 'DEAD_LETTER',
              replayAttemptIds: []
            };
            await this.store.saveDeadLetter(deadLetter);
          } else {
            summary.retried += 1;
            await this.store.updateJob(tenantId, job.id, {
              status: 'FAILED_RETRYABLE',
              lastError: message,
              nextAttemptAt: new Date(Date.now() + computeJobBackoffMs(job.attemptCount)).toISOString()
            });
          }
        }
      }
    } finally {
      this.processing = false;
    }

    return summary;
  }

  private async executeJob(job: MonitoringJob): Promise<'DONE' | 'SKIPPED'> {
    switch (job.jobType) {
      case 'PROCESS_SIGNAL':
        return this.processSignalJob(job);
      case 'RECONCILE_CONTROL':
        return this.processReconciliationJob(job);
      case 'RETEST_FINDING':
        return this.processRetestJob(job);
      default:
        return 'DONE';
    }
  }

  private async processSignalJob(job: MonitoringJob): Promise<'DONE' | 'SKIPPED'> {
    const signalId = String(job.payload.signalId || '');
    const signal = await this.store.getSignal(job.tenantId, signalId);
    if (!signal) throw new Error(`Signal ${signalId} referenced by job ${job.id} does not exist.`);

    // Idempotency: a signal already processed is never evaluated twice.
    if (signal.processingStatus === 'PROCESSED') return 'SKIPPED';
    if (signal.processingStatus === 'DEAD_LETTERED') return 'SKIPPED';

    try {
      await this.evaluateSignal(signal);
      await this.store.updateSignal(job.tenantId, signalId, { processingStatus: 'PROCESSED' });
      return 'DONE';
    } catch (err: any) {
      await this.store.updateSignal(job.tenantId, signalId, { processingStatus: 'PROCESSING_FAILED' });
      throw err;
    }
  }

  private async processReconciliationJob(job: MonitoringJob): Promise<'DONE' | 'SKIPPED'> {
    const { ruleId, resourceRef, observedState } = job.payload as {
      ruleId: string;
      resourceRef: string;
      observedState: unknown;
    };
    await this.evaluateFacts({
      tenantId: job.tenantId,
      ruleId,
      resourceRef,
      observedState: observedState as SecuritySignal['observedState'],
      sourceObservedAt: new Date().toISOString(),
      signalId: undefined,
      integrationId: undefined,
      triggerKind: 'RECONCILIATION',
      fromReconciliation: true,
      correlationId: job.correlationId
    });
    return 'DONE';
  }

  private async processRetestJob(job: MonitoringJob): Promise<'DONE' | 'SKIPPED'> {
    const { dedupKey, observedState } = job.payload as { dedupKey: string; observedState: unknown };
    await this.retestFinding({
      tenantId: job.tenantId,
      dedupKey,
      observedState: observedState as SecuritySignal['observedState'],
      actor: 'monitoring-pipeline',
      trigger: 'RETEST'
    });
    return 'DONE';
  }

  // =========================================================================
  // EVALUATION → STATE → FINDING
  // =========================================================================

  private async evaluateSignal(signal: SecuritySignal): Promise<void> {
    const rules = getRulesForSignalType(signal.signalType);

    if (rules.length === 0) {
      DomainEventBus.publish({
        type: 'TelemetryNormalized',
        tenantId: signal.tenantId,
        actorId: `connector:${signal.connectorId}`,
        entityId: signal.id,
        entityType: 'TELEMETRY_OBSERVATION',
        summary: `Signal ${signal.id} of type ${signal.signalType} retained without a bound control rule.`,
        metadata: { signalId: signal.id, signalType: signal.signalType, providerEventType: signal.providerEventType }
      });
      return;
    }

    for (const rule of rules) {
      const evaluation = evaluateRuleAgainstSignal(rule, signal);
      await this.applyEvaluation({
        tenantId: signal.tenantId,
        ruleId: rule.id,
        resourceRef: signal.resourceRef,
        signal,
        evaluation,
        triggerKind: 'SIGNAL',
        fromReconciliation: false
      });
      if (!signal.evaluatedControlIds.includes(rule.controlId)) {
        signal.evaluatedControlIds.push(rule.controlId);
      }
    }

    await this.store.updateSignal(signal.tenantId, signal.id, { evaluatedControlIds: signal.evaluatedControlIds });
  }

  /**
   * Reconciliation and retest entry point: evaluates stored/observed facts for
   * a known rule without requiring a provider signal record.
   */
  public async evaluateFacts(params: {
    tenantId: string;
    ruleId: string;
    resourceRef: string;
    observedState: SecuritySignal['observedState'];
    sourceObservedAt: string;
    signalId?: string;
    integrationId?: string;
    triggerKind: TransitionTriggerKind;
    fromReconciliation: boolean;
    correlationId: string;
  }): Promise<{ status: ControlComplianceStatus; evaluationId: string }> {
    const rule = getRule(params.ruleId);
    if (!rule) throw new Error(`Unknown evaluation rule ${params.ruleId}.`);

    const synthetic: SecuritySignal = {
      id: params.signalId ?? monitoringId('SIG-REC'),
      tenantId: params.tenantId,
      integrationId: params.integrationId ?? '',
      connectorId: 'reconciliation',
      provider: 'RECONCILIATION',
      providerEventId: params.correlationId,
      providerEventType: rule.appliesToSignalType,
      signalType: rule.appliesToSignalType,
      canonicalEntityType: 'ASSET',
      canonicalEntityId: params.resourceRef,
      resourceRef: params.resourceRef,
      resourceScope: [],
      observedState: params.observedState,
      sourceObservedAt: params.sourceObservedAt,
      ingestedAt: new Date().toISOString(),
      severity: 'MEDIUM',
      provenance: {
        sourceEventReference: `reconciliation:${rule.id}`,
        sourceEventSha256: computePayloadSha256(params.observedState),
        receivedFromUntrustedChannel: false,
        signatureVerification: 'NOT_APPLICABLE',
        rawPayloadPreserved: false
      },
      correlationId: params.correlationId,
      idempotencyKey: `reconciliation|${params.tenantId}|${rule.id}|${params.resourceRef}|${params.sourceObservedAt}`,
      processingStatus: 'PROCESSED',
      providerFields: {},
      evaluatedControlIds: [rule.controlId]
    };

    const evaluation = evaluateRuleAgainstSignal(rule, synthetic);
    const applied = await this.applyEvaluation({
      tenantId: params.tenantId,
      ruleId: rule.id,
      resourceRef: params.resourceRef,
      signal: synthetic,
      evaluation,
      triggerKind: params.triggerKind,
      fromReconciliation: params.fromReconciliation,
      existingIntegrationId: params.integrationId
    });

    return { status: applied.status, evaluationId: applied.evaluationId };
  }

  /**
   * Persists the evaluation, the evidence artefact, the new control state, the
   * explicit transition and the deduplicated finding — in that order, so the
   * audit trail always explains the state.
   */
  private async applyEvaluation(params: {
    tenantId: string;
    ruleId: string;
    resourceRef: string;
    signal: SecuritySignal;
    evaluation: RuleEvaluation;
    triggerKind: TransitionTriggerKind;
    fromReconciliation: boolean;
    existingIntegrationId?: string;
  }): Promise<{ status: ControlComplianceStatus; evaluationId: string; transition?: ControlStateTransition; freshness: MonitoringFreshness }> {
    const { tenantId, resourceRef, signal, evaluation } = params;
    const now = new Date().toISOString();

    // The existing state is read first because it is also the fallback source of
    // integration attribution: a reconciliation or retest evaluation that is not
    // bound to a connector must inherit the integration that owns this control,
    // otherwise monitoring failures could no longer be scoped to their source.
    const previousState = await this.store.getState(tenantId, evaluation.ruleId, resourceRef);
    const integrationId = params.existingIntegrationId || signal.integrationId || previousState?.integrationId || undefined;

    // 1. Persist the evaluation record.
    const evaluationRecord: ControlEvaluationRecord = {
      id: monitoringId('EVAL'),
      tenantId,
      signalId: signal.id,
      integrationId,
      controlId: evaluation.controlId,
      controlCode: evaluation.controlCode,
      controlVersion: '2022',
      ruleId: evaluation.ruleId,
      ruleVersion: evaluation.ruleVersion,
      frameworkCodes: CONTROL_EVALUATION_RULES.find(r => r.id === evaluation.ruleId)?.frameworkCodes ?? [],
      organizationScope: [],
      resourceScope: signal.resourceScope,
      resourceRef,
      observedFacts: evaluation.observedFacts,
      expectedCondition: evaluation.expectedCondition,
      actualCondition: evaluation.actualCondition,
      result: evaluation.result,
      reason: evaluation.reason,
      failureExplanation: evaluation.failureExplanation,
      remediationGuidance: evaluation.remediationGuidance,
      evaluatedAt: now,
      sourceObservedAt: signal.sourceObservedAt,
      relatedRiskIds: [],
      evaluatedFromReconciliation: params.fromReconciliation
    };

    // 2. Evidence artefact with provenance and integrity seal.
    const evidenceId = await this.recordEvidence(evaluationRecord, signal);
    evaluationRecord.evidenceId = evidenceId;
    await this.store.saveEvaluation(evaluationRecord);

    // 3. Current state.
    const rule = getRule(evaluation.ruleId);
    const integration = integrationId ? await this.store.getIntegration(tenantId, integrationId) : null;

    const expectedInterval = integration?.pollIntervalSeconds ?? 900;
    const freshnessThreshold = integration?.freshnessThresholdSeconds ?? expectedInterval * 2;

    const provisional: ControlMonitoringState = {
      id: previousState?.id ?? monitoringId('STATE'),
      tenantId,
      integrationId,
      controlId: evaluation.controlId,
      controlCode: evaluation.controlCode,
      controlVersion: '2022',
      ruleId: evaluation.ruleId,
      ruleVersion: evaluation.ruleVersion,
      resourceRef,
      status: evaluation.result,
      lastKnownStatus: evaluation.result,
      lastObservedState: signal.observedState,
      lastSignalId: signal.id,
      lastEvaluationId: evaluationRecord.id,
      lastSuccessfulCollectionAt: now,
      lastSourceObservationAt: signal.sourceObservedAt,
      lastEvaluatedAt: now,
      expectedCollectionIntervalSeconds: expectedInterval,
      freshnessThresholdSeconds: freshnessThreshold,
      isStale: false,
      monitoringFailure: false,
      failureKind: evaluation.result === 'NON_COMPLIANT' || evaluation.result === 'PARTIALLY_COMPLIANT' ? 'CONTROL_FAILURE' : 'NONE',
      openFindingId: previousState?.openFindingId,
      consecutiveFailureCount: 0,
      updatedAt: now
    };

    const freshness = computeFreshness(provisional);
    const status = applyFreshnessPolicy(provisional.status, freshness);
    const nextState: ControlMonitoringState = {
      ...provisional,
      status,
      lastKnownStatus: status === 'STALE' ? provisional.lastKnownStatus : status,
      isStale: freshness.isStale
    };
    await this.store.upsertState(nextState);

    // 4. Explicit transition.
    const previousStatus = previousState?.status ?? null;
    const classification = classifyTransition(previousStatus, status);
    let transition: ControlStateTransition | undefined;

    if (classification !== 'NO_CHANGE') {
      transition = {
        id: monitoringId('TRN'),
        tenantId,
        controlId: evaluation.controlId,
        controlCode: evaluation.controlCode,
        resourceRef,
        previousStatus: previousStatus ?? 'NOT_EVALUATED',
        newStatus: status,
        triggerKind: params.triggerKind,
        triggerSignalId: signal.id,
        ruleId: evaluation.ruleId,
        ruleVersion: evaluation.ruleVersion,
        evidenceId,
        sourceObservedAt: signal.sourceObservedAt,
        evaluatedAt: now,
        reason: `${classification}: ${evaluation.reason}`
      };
      await this.store.appendTransition(transition);
    }

    // 5. Finding lifecycle (only meaningful transitions create or update findings).
    const findingOutcome = await this.applyFindingLifecycle({
      tenantId,
      ruleId: evaluation.ruleId,
      resourceRef,
      controlId: evaluation.controlId,
      controlCode: evaluation.controlCode,
      ruleVersion: evaluation.ruleVersion,
      status,
      classification,
      evidenceId,
      signal,
      evaluation,
      openFindingId: previousState?.openFindingId,
      slaDays: rule?.slaDays
    });

    if (findingOutcome?.findingId) {
      await this.store.upsertState(nextState);
      nextState.openFindingId = findingOutcome.findingId;
      await this.store.upsertState(nextState);
    }

    // 6. Notification policy (deduplicated; only on meaningful transitions).
    if (transition) {
      const decision = this.decideNotification({
        classification,
        status,
        severity: rule?.failureSeverity ?? 'MEDIUM'
      });
      if (decision.shouldNotify) {
        const notificationId = monitoringId('NTF');
        transition.notificationId = notificationId;
        await this.store.appendTransition({ ...transition, id: monitoringId('TRN-N') });
        DomainEventBus.publish({
          type: 'MonitoringNotificationRequested',
          tenantId,
          actorId: 'live-monitoring-pipeline',
          entityId: findingOutcome?.findingId ?? evaluation.controlId,
          entityType: 'FINDING',
          summary: `${evaluation.controlCode} ${status}: ${evaluation.reason}`,
          metadata: {
            notificationId,
            channels: decision.channels,
            notificationReason: decision.reason,
            controlCode: evaluation.controlCode,
            resourceRef,
            severity: rule?.failureSeverity ?? 'MEDIUM'
          }
        });
      }
    }

    return { status, evaluationId: evaluationRecord.id, transition, freshness };
  }

  // =========================================================================
  // EVIDENCE
  // =========================================================================

  /**
   * Creates the evidence artefact through the canonical Evidence Fabric and
   * seals its digest in the existing cryptographic WORM ledger. The ledger seal
   * is only reported as verified when the ledger itself verifies.
   */
  private async recordEvidence(evaluation: ControlEvaluationRecord, signal: SecuritySignal): Promise<string> {
    const digest = crypto
      .createHash('sha256')
      .update(
        [
          evaluation.ruleId,
          evaluation.ruleVersion,
          evaluation.controlCode,
          evaluation.resourceRef,
          JSON.stringify(evaluation.observedFacts),
          evaluation.actualCondition,
          evaluation.result,
          signal.sourceObservedAt,
          signal.provenance.sourceEventSha256
        ].join('|')
      )
      .digest('hex');

    let wormSealed = false;
    let wormSealReference = '';
    try {
      const seal = cryptographicWormLedger.recordEvidenceBlock({
        evidenceId: `${evaluation.id}-WORM`,
        tenantId: evaluation.tenantId,
        controlId: evaluation.controlId,
        evidenceFileSha256: digest,
        metadata: {
          source: 'live-monitoring-pipeline',
          ruleId: evaluation.ruleId,
          ruleVersion: evaluation.ruleVersion,
          signalId: signal.id,
          provider: signal.provider,
          signalType: signal.signalType,
          signalIdempotencyKey: signal.idempotencyKey
        }
      });
      wormSealed = true;
      wormSealReference = seal.blockId;
    } catch {
      // The evaluation remains valid evidence even when the ledger is unavailable;
      // it is simply not presented as WORM-sealed.
      wormSealed = false;
    }

    const store = getGrcDataStore();
    const evidence = await store.evidence.createEvidence({
      tenantId: evaluation.tenantId,
      controlId: evaluation.controlId,
      controlCode: evaluation.controlCode,
      title: `${evaluation.controlCode} continuous observation (${evaluation.result})`,
      description:
        `Deterministic evaluation of ${evaluation.ruleId}@${evaluation.ruleVersion} against the observed provider state. ` +
        `Expected: ${evaluation.expectedCondition}. Observed: ${evaluation.actualCondition}.`,
      fileName: `monitoring-${evaluation.controlCode}-${evaluation.ruleId}.json`,
      fileSizeBytes: Buffer.byteLength(JSON.stringify(evaluation.observedFacts), 'utf8'),
      fileType: 'application/json',
      sha256Hash: digest,
      classification: 'INTERNAL',
      sourceConnector: signal.provider,
      version: evaluation.ruleVersion,
      status: 'Collected',
      uploadedByUserId: `monitoring-pipeline:${signal.connectorId}`,
      retentionPeriodYears: 7,
      isWormVerified: wormSealed,
      chainOfCustody: [
        {
          timestamp: new Date().toISOString(),
          actor: 'live-monitoring-pipeline',
          action: 'COLLECTED_FROM_PROVIDER_OBSERVATION',
          note: `Signal ${signal.id} (${signal.provider} ${signal.providerEventType}) observed at ${signal.sourceObservedAt}; ${wormSealReference ? `WORM seal ${wormSealReference}` : 'WORM seal unavailable'}`
        }
      ]
    } as any);

    return (evidence as any).id;
  }

  // =========================================================================
  // FINDING LIFECYCLE (DEDUPLICATED)
  // =========================================================================

  private buildDedupKey(controlId: string, resourceRef: string, ruleId: string): string {
    return `${controlId}|${resourceRef}|${ruleId}`;
  }

  private severityToFindingSeverity(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): FindingSeverity {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'Major NC';
    if (severity === 'MEDIUM') return 'Minor NC';
    return 'OFI';
  }

  private async applyFindingLifecycle(params: {
    tenantId: string;
    ruleId: string;
    resourceRef: string;
    controlId: string;
    controlCode: string;
    ruleVersion: string;
    status: ControlComplianceStatus;
    classification: ReturnType<typeof classifyTransition>;
    evidenceId: string;
    signal: SecuritySignal;
    evaluation: RuleEvaluation;
    openFindingId?: string;
    slaDays?: number;
  }): Promise<{ findingId?: string; action: 'CREATED' | 'UPDATED' | 'AWAITING_RETEST' | 'REOPENED' | 'NONE' }> {
    const dedupKey = this.buildDedupKey(params.controlId, params.resourceRef, params.ruleId);
    const existingLink = await this.store.getFindingLinkByDedupKey(params.tenantId, dedupKey);
    const now = new Date().toISOString();
    const failing = params.status === 'NON_COMPLIANT' || params.status === 'PARTIALLY_COMPLIANT';
    const grcStore = getGrcDataStore();
    const rule = getRule(params.ruleId);
    const severity = rule?.failureSeverity ?? 'MEDIUM';

    // ---- New failure, or an existing unresolved failure that persists -------
    if (failing) {
      if (!existingLink) {
        const slaDays = params.slaDays ?? DEFAULT_SLA_DAYS;
        const finding = (await grcStore.findings.createFinding({
          tenantId: params.tenantId,
          title: `${params.controlCode} control failure detected by continuous monitoring`,
          severity: this.severityToFindingSeverity(severity),
          type: 'CONTINUOUS_MONITORING',
          status: 'Open',
          controlId: params.controlId,
          controlCode: params.controlCode,
          frameworkCode: rule?.frameworkCodes?.[0] ?? 'ISO27001:2022',
          description:
            `${params.evaluation.failureExplanation ?? params.evaluation.reason} ` +
            `Resource: ${params.resourceRef}. Rule: ${params.ruleId}@${params.ruleVersion}. Detected: ${now}.`,
          remediationPlan: params.evaluation.remediationGuidance,
          slaDays,
          targetDate: new Date(Date.now() + slaDays * 86400000).toISOString().split('T')[0],
          evidenceIds: [params.evidenceId],
          assignedToUserId: undefined
        } as Partial<FindingEntity>)) as unknown as FindingEntity;

        const link: MonitoringFindingLink = {
          id: monitoringId('FLNK'),
          tenantId: params.tenantId,
          dedupKey,
          controlId: params.controlId,
          controlCode: params.controlCode,
          resourceRef: params.resourceRef,
          ruleId: params.ruleId,
          ruleVersion: params.ruleVersion,
          canonicalFindingId: finding.id,
          domainFindingStatus: 'OPEN',
          severity,
          firstDetectedAt: now,
          lastDetectedAt: now,
          occurrenceCount: 1,
          lastSignalId: params.signal.id,
          evidenceIds: [params.evidenceId],
          closurePolicy: 'REQUIRES_VERIFIED_RECOVERY',
          reopenedCount: 0,
          updatedAt: now
        };
        await this.store.saveFindingLink(link);
        return { findingId: finding.id, action: 'CREATED' };
      }

      // Deduplication: the same unresolved condition updates the existing
      // finding instead of creating another one on every poll.
      const wasClosed = existingLink.domainFindingStatus === 'CLOSED_VERIFIED' || existingLink.domainFindingStatus === 'CLOSED_UNVERIFIED';
      const occurrenceCount = existingLink.occurrenceCount + 1;
      const evidenceIds = Array.from(new Set([...existingLink.evidenceIds, params.evidenceId]));
      const nextStatus = wasClosed ? 'REOPENED' : existingLink.domainFindingStatus === 'OPEN' ? 'OPEN' : existingLink.domainFindingStatus;

      await this.store.saveFindingLink({
        ...existingLink,
        lastDetectedAt: now,
        occurrenceCount,
        lastSignalId: params.signal.id,
        evidenceIds,
        domainFindingStatus: nextStatus,
        reopenedCount: wasClosed ? existingLink.reopenedCount + 1 : existingLink.reopenedCount,
        awaitingRetestSince: undefined,
        verifiedRecoveredAt: wasClosed ? undefined : existingLink.verifiedRecoveredAt,
        severity: severity !== existingLink.severity ? severity : existingLink.severity,
        updatedAt: now
      });

      await grcStore.findings.updateFinding(params.tenantId, existingLink.canonicalFindingId, {
        status: 'Open',
        description:
          `${params.evaluation.failureExplanation ?? params.evaluation.reason} Resource: ${params.resourceRef}. ` +
          `Rule: ${params.ruleId}@${params.ruleVersion}. Re-detected ${occurrenceCount} time(s); latest at ${now}.`,
        evidenceIds
      } as Partial<FindingEntity>);

      return { findingId: existingLink.canonicalFindingId, action: wasClosed ? 'REOPENED' : 'UPDATED' };
    }

    // ---- Recovery observed: never auto-close, require verified recovery ----
    if (params.status === 'COMPLIANT' && existingLink && existingLink.domainFindingStatus !== 'CLOSED_VERIFIED') {
      await this.store.saveFindingLink({
        ...existingLink,
        domainFindingStatus: 'AWAITING_RETEST',
        awaitingRetestSince: existingLink.awaitingRetestSince ?? now,
        retestSignalId: params.signal.id,
        evidenceIds: Array.from(new Set([...existingLink.evidenceIds, params.evidenceId])),
        updatedAt: now
      });
      await grcStore.findings.updateFinding(params.tenantId, existingLink.canonicalFindingId, {
        status: 'Verification Pending',
        evidenceIds: Array.from(new Set([...existingLink.evidenceIds, params.evidenceId]))
      } as Partial<FindingEntity>);
      return { findingId: existingLink.canonicalFindingId, action: 'AWAITING_RETEST' };
    }

    return { action: 'NONE' };
  }

  /**
   * Retest / verification. Closure requires a fresh successful evaluation; a
   * failing retest reopens the finding instead of closing it.
   */
  public async retestFinding(params: {
    tenantId: string;
    dedupKey: string;
    observedState: SecuritySignal['observedState'];
    actor: string;
    trigger?: TransitionTriggerKind;
  }): Promise<{
    outcome: 'VERIFIED_RECOVERED' | 'STILL_FAILING' | 'NO_FINDING';
    status?: ControlComplianceStatus;
    findingId?: string;
    detail: string;
  }> {
    const link = await this.store.getFindingLinkByDedupKey(params.tenantId, params.dedupKey);
    if (!link) {
      return { outcome: 'NO_FINDING', detail: `No monitoring finding exists for dedup key ${params.dedupKey}.` };
    }

    const result = await this.evaluateFacts({
      tenantId: params.tenantId,
      ruleId: link.ruleId,
      resourceRef: link.resourceRef,
      observedState: params.observedState,
      sourceObservedAt: new Date().toISOString(),
      integrationId: undefined,
      triggerKind: params.trigger ?? 'RETEST',
      fromReconciliation: true,
      correlationId: `retest-${link.id}`
    });

    const now = new Date().toISOString();
    const grcStore = getGrcDataStore();

    if (result.status === 'COMPLIANT') {
      await this.store.saveFindingLink({
        ...link,
        domainFindingStatus: 'CLOSED_VERIFIED',
        verifiedRecoveredAt: now,
        retestSignalId: result.evaluationId,
        updatedAt: now
      });
      await grcStore.findings.updateFinding(params.tenantId, link.canonicalFindingId, {
        status: 'Closed Verified',
        closureDate: now,
        verifiedByUserId: params.actor
      } as Partial<FindingEntity>);
      return {
        outcome: 'VERIFIED_RECOVERED',
        status: result.status,
        findingId: link.canonicalFindingId,
        detail: `Retest produced a COMPLIANT evaluation (${result.evaluationId}); recovery verified by ${params.actor}.`
      };
    }

    await this.store.saveFindingLink({
      ...link,
      domainFindingStatus: 'REOPENED',
      reopenedCount: link.reopenedCount + 1,
      retestSignalId: result.evaluationId,
      awaitingRetestSince: undefined,
      updatedAt: now
    });
    await grcStore.findings.updateFinding(params.tenantId, link.canonicalFindingId, {
      status: 'Open'
    } as Partial<FindingEntity>);
    return {
      outcome: 'STILL_FAILING',
      status: result.status,
      findingId: link.canonicalFindingId,
      detail: `Retest produced ${result.status}; the finding remains open and cannot be closed.`
    };
  }

  /**
   * Explicit, audited closure without verified recovery. This is deliberately a
   * different terminal state from CLOSED_VERIFIED so the platform never implies
   * a verified recovery that did not happen.
   */
  public async closeFindingUnverified(params: {
    tenantId: string;
    dedupKey: string;
    actor: string;
    justification: string;
  }): Promise<{ closed: boolean; detail: string }> {
    if (!params.justification || params.justification.trim().length < 10) {
      throw new Error('An audited justification of at least 10 characters is required to close a finding without verified recovery.');
    }
    const link = await this.store.getFindingLinkByDedupKey(params.tenantId, params.dedupKey);
    if (!link) return { closed: false, detail: `No monitoring finding exists for dedup key ${params.dedupKey}.` };
    if (link.domainFindingStatus === 'CLOSED_VERIFIED') {
      return { closed: false, detail: 'Finding is already closed with verified recovery.' };
    }

    const now = new Date().toISOString();
    await this.store.saveFindingLink({ ...link, domainFindingStatus: 'CLOSED_UNVERIFIED', updatedAt: now });
    const grcStore = getGrcDataStore();
    await grcStore.findings.updateFinding(params.tenantId, link.canonicalFindingId, {
      status: 'Closed Verified',
      closureDate: now,
      verifiedByUserId: `${params.actor} (WAIVED_VERIFICATION: ${params.justification.trim()})`
    } as Partial<FindingEntity>);

    DomainEventBus.publish({
      type: 'MonitoringFindingClosedWithoutVerification',
      tenantId: params.tenantId,
      actorId: params.actor,
      entityId: link.canonicalFindingId,
      entityType: 'FINDING',
      summary: `Finding ${link.canonicalFindingId} closed without verified recovery by ${params.actor}.`,
      metadata: { justification: params.justification.trim(), controlCode: link.controlCode }
    });

    return {
      closed: true,
      detail: `Finding closed as CLOSED_UNVERIFIED by ${params.actor}. This is not a verified recovery and remains distinguishable from it.`
    };
  }

  // =========================================================================
  // FRESHNESS SWEEP / RECONCILIATION
  // =========================================================================

  /**
   * Marks stale and never-observed controls. Data that stopped arriving is
   * reported as STALE (with the last known state retained separately) or
   * UNKNOWN when nothing was ever observed.
   */
  public async sweepFreshness(tenantId: string): Promise<{ staled: number; unknown: number; transitions: number }> {
    const now = new Date();
    const states = await this.store.listStates(tenantId, { limit: 2000 });
    let staled = 0;
    let unknown = 0;
    let transitions = 0;

    for (const state of states) {
      const freshness = computeFreshness(state, now);
      if (freshness.presentationRule === 'CURRENT') continue;
      if (state.monitoringFailure) continue; // already recorded as a monitoring failure

      const nextStatus = applyFreshnessPolicy(state.status, freshness);
      if (nextStatus === state.status) continue;

      await this.store.upsertState({
        ...state,
        status: nextStatus,
        lastKnownStatus: state.status === 'STALE' || state.status === 'UNKNOWN' ? state.lastKnownStatus : state.status,
        isStale: freshness.isStale,
        failureKind: 'EVIDENCE_GAP',
        updatedAt: now.toISOString()
      });

      await this.store.appendTransition({
        id: monitoringId('TRN'),
        tenantId,
        controlId: state.controlId,
        controlCode: state.controlCode,
        resourceRef: state.resourceRef,
        previousStatus: state.status,
        newStatus: nextStatus,
        triggerKind: 'FRESHNESS_EXPIRY',
        ruleId: state.ruleId,
        ruleVersion: state.ruleVersion,
        evaluatedAt: now.toISOString(),
        reason:
          nextStatus === 'STALE'
            ? `No successful observation within the ${freshness.freshnessThresholdSeconds}s freshness threshold (age ${freshness.ageSeconds}s). Last known state retained separately.`
            : 'No observation has ever been collected for this control; the state is UNKNOWN rather than compliant.'
      });

      transitions += 1;
      if (nextStatus === 'STALE') staled += 1;
      if (nextStatus === 'UNKNOWN') unknown += 1;
    }

    return { staled, unknown, transitions };
  }

  public async enqueueReconciliation(params: {
    tenantId: string;
    ruleId: string;
    resourceRef: string;
    observedState: SecuritySignal['observedState'];
  }): Promise<{ jobId: string }> {
    const job = await this.enqueue(this.store, {
      tenantId: params.tenantId,
      jobType: 'RECONCILE_CONTROL',
      idempotencyKey: `RECONCILE_CONTROL|${params.ruleId}|${params.resourceRef}|${crypto
        .createHash('sha256')
        .update(JSON.stringify(params.observedState))
        .digest('hex')
        .slice(0, 12)}`,
      payload: { ruleId: params.ruleId, resourceRef: params.resourceRef, observedState: params.observedState },
      correlationId: `reconcile-${params.resourceRef}`
    });
    return { jobId: job.id };
  }

  /**
   * Controlled replay of a dead-lettered job: the original payload is re-queued
   * under a new idempotency key so processing stays idempotent, and the replay
   * is recorded on the dead-letter record.
   */
  public async replayDeadLetter(params: {
    tenantId: string;
    deadLetterId: string;
    actor: string;
  }): Promise<{ replayed: boolean; jobId?: string; detail: string }> {
    const deadLetters = await this.store.listDeadLetters(params.tenantId, { limit: 500 });
    const deadLetter = deadLetters.find(record => record.id === params.deadLetterId);
    if (!deadLetter) return { replayed: false, detail: `Dead letter ${params.deadLetterId} not found.` };
    if (deadLetter.status !== 'DEAD_LETTER') {
      return { replayed: false, detail: `Dead letter is in status ${deadLetter.status} and cannot be replayed again.` };
    }

    const job = await this.enqueue(this.store, {
      tenantId: params.tenantId,
      jobType: deadLetter.jobType,
      idempotencyKey: `REPLAY|${deadLetter.id}|${Date.now()}`,
      payload: deadLetter.payload,
      correlationId: deadLetter.correlationId,
      maxAttempts: 3
    });

    await this.store.updateDeadLetter(params.tenantId, deadLetter.id, {
      status: 'REPLAYED',
      replayedAt: new Date().toISOString(),
      replayAttemptIds: [...deadLetter.replayAttemptIds, job.id]
    });

    return { replayed: true, jobId: job.id, detail: `Replayed by ${params.actor} as job ${job.id}.` };
  }

  // =========================================================================
  // NOTIFICATION POLICY
  // =========================================================================

  public decideNotification(params: {
    classification: ReturnType<typeof classifyTransition>;
    status: ControlComplianceStatus;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }): NotificationDecision {
    if (params.classification === 'NO_CHANGE') {
      return {
        shouldNotify: false,
        reason: 'State is unchanged; a repeated observation of an unresolved condition does not raise another notification.',
        channels: []
      };
    }
    if (params.classification === 'FIRST_OBSERVATION' && params.status === 'COMPLIANT') {
      return { shouldNotify: false, reason: 'Baseline compliant observation requires no alert.', channels: [] };
    }
    if (params.status === 'UNKNOWN' || params.status === 'STALE') {
      return {
        shouldNotify: true,
        reason: 'Evidence gap: the platform can no longer verify this control and says so explicitly.',
        channels: ['IN_APP']
      };
    }
    if (params.classification === 'DRIFT_INTRODUCED' || params.classification === 'DEGRADED') {
      return {
        shouldNotify: true,
        reason: `Control state changed to ${params.status}; the responsible owner is notified once per transition.`,
        channels: params.severity === 'CRITICAL' || params.severity === 'HIGH' ? ['IN_APP', 'EMAIL'] : ['IN_APP']
      };
    }
    if (params.classification === 'RECOVERED') {
      return { shouldNotify: true, reason: 'Recovery observed; a verification retest is required before closure.', channels: ['IN_APP'] };
    }
    return { shouldNotify: false, reason: 'No notification policy matched this transition.', channels: [] };
  }

  // =========================================================================
  // PROJECTIONS (dashboard reads authoritative records only)
  // =========================================================================

  public async getOverview(tenantId: string): Promise<MonitoringOverview> {
    const now = new Date();
    const [integrations, states, links, signalCounts, jobs, deadLetters] = await Promise.all([
      this.store.listIntegrations(tenantId),
      this.store.listStates(tenantId, { limit: 2000 }),
      this.store.listFindingLinks(tenantId, { limit: 500 }),
      this.store.countSignalsByStatus(tenantId),
      this.store.listJobs(tenantId, { limit: 500 }),
      this.store.listDeadLetters(tenantId, { limit: 500 })
    ]);

    // Freshness is recomputed on read, so a control cannot silently stay COMPLIANT
    // on a dashboard after its evidence has expired.
    const effective = states.map(state => {
      const freshness = computeFreshness(state, now);
      return { state, status: state.monitoringFailure ? state.status : applyFreshnessPolicy(state.status, freshness), freshness };
    });

    const countByStatus = (status: ControlComplianceStatus) => effective.filter(entry => entry.status === status).length;

    const openLinks = links.filter(
      link => link.domainFindingStatus !== 'CLOSED_VERIFIED' && link.domainFindingStatus !== 'CLOSED_UNVERIFIED'
    );
    const overdue = openLinks.filter(link => {
      const rule = getRule(link.ruleId);
      const slaDays = rule?.slaDays ?? DEFAULT_SLA_DAYS;
      return Date.parse(link.firstDetectedAt) + slaDays * 86400000 < now.getTime();
    });

    const processedJobs = jobs.filter(job => job.status === 'SUCCEEDED');
    const latencies = processedJobs
      .filter(job => job.startedAt && job.processedAt)
      .map(job => Date.parse(job.processedAt as string) - Date.parse(job.startedAt as string))
      .filter(value => Number.isFinite(value) && value >= 0);
    const averageLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : undefined;

    const received = Object.values(signalCounts).reduce((a, b) => a + b, 0);
    const healthy = integrations.filter(i => i.healthState === 'HEALTHY').length;
    const degraded = integrations.filter(i => i.healthState === 'DEGRADED').length;
    const failing = integrations.filter(i => i.healthState === 'FAILING').length;

    return {
      tenantId,
      generatedAt: now.toISOString(),
      integrations: {
        total: integrations.length,
        healthy,
        degraded,
        failing,
        disconnected: integrations.filter(i => i.maturityState === 'DISCONNECTED' || !i.isEnabled).length,
        monitoringActive: integrations.filter(i => i.maturityState === 'MONITORING_ACTIVE').length,
        authenticationFailed: integrations.filter(i => i.maturityState === 'AUTHENTICATION_FAILED').length
      },
      controls: {
        total: effective.length,
        compliant: countByStatus('COMPLIANT'),
        nonCompliant: countByStatus('NON_COMPLIANT'),
        partiallyCompliant: countByStatus('PARTIALLY_COMPLIANT'),
        unknown: countByStatus('UNKNOWN'),
        stale: countByStatus('STALE'),
        notEvaluated: countByStatus('NOT_EVALUATED'),
        notApplicable: countByStatus('NOT_APPLICABLE')
      },
      findings: {
        open: links.filter(l => l.domainFindingStatus === 'OPEN' || l.domainFindingStatus === 'REOPENED').length,
        remediationInProgress: links.filter(l => l.domainFindingStatus === 'REMEDIATION_IN_PROGRESS').length,
        awaitingRetest: links.filter(l => l.domainFindingStatus === 'AWAITING_RETEST').length,
        overdue: overdue.length,
        reopened: links.filter(l => l.domainFindingStatus === 'REOPENED').length,
        closedVerified: links.filter(l => l.domainFindingStatus === 'CLOSED_VERIFIED').length
      },
      pipeline: {
        signalsReceived: received,
        signalsProcessed: signalCounts['PROCESSED'] ?? 0,
        duplicatesSuppressed: signalCounts['DUPLICATE_SUPPRESSED'] ?? 0,
        signalsRejected:
          (signalCounts['REJECTED_MALFORMED'] ?? 0) +
          (signalCounts['REJECTED_UNVERIFIED_SIGNATURE'] ?? 0) +
          (signalCounts['REJECTED_UNKNOWN_INTEGRATION'] ?? 0),
        deadLettered: deadLetters.length,
        averageProcessingLatencyMs: averageLatency,
        lastProcessedAt: processedJobs
          .map(job => job.processedAt)
          .filter(Boolean)
          .sort()
          .reverse()[0] as string | undefined
      },
      recentlyRecoveredControlIds: links
        .filter(link => link.domainFindingStatus === 'CLOSED_VERIFIED' && link.verifiedRecoveredAt)
        .map(link => link.controlId)
        .slice(0, 20),
      latencyDisclaimer:
        'Detection latency depends on the monitoring mode of each integration: event-driven sources push observations, scheduled polling and periodic reconciliation run on their configured intervals. Dashboard refresh frequency is not source monitoring frequency.'
    };
  }

  public async listIntegrationHealth(tenantId: string): Promise<IntegrationHealthSnapshot[]> {
    const integrations = await this.store.listIntegrations(tenantId);
    const signals = await this.store.listSignals(tenantId, { limit: 500 });
    const jobs = await this.store.listJobs(tenantId, { limit: 500 });
    const states = await this.store.listStates(tenantId, { limit: 2000 });
    const now = new Date();

    return integrations.map(integration => {
      const integrationSignals = signals.items.filter(signal => signal.integrationId === integration.id);
      const uniqueProviders = new Set(integrationSignals.map(s => s.provenance.sourceEventSha256));
      const rejected = integrationSignals.filter(s => s.processingStatus.startsWith('REJECTED')).length;
      const duplicates = integrationSignals.filter(s => s.processingStatus === 'DUPLICATE_SUPPRESSED').length;
      const deadLettered = jobs.filter(job => job.status === 'DEAD_LETTERED').length;

      const staleWarnings = states
        .filter(state => state.integrationId === integration.id && computeFreshness(state, now).isStale)
        .map(state => `${state.controlCode} on ${state.resourceRef} has no observation within its freshness threshold`);

      const errorRate =
        integrationSignals.length === 0 ? 0 : Math.round((rejected / integrationSignals.length) * 10000) / 100;

      return {
        integrationId: integration.id,
        provider: integration.provider,
        displayName: integration.displayName,
        maturityState: integration.maturityState,
        healthState: integration.healthState,
        monitoringMode: integration.monitoringMode,
        lastSuccessfulSyncAt: integration.lastSuccessfulSyncAt,
        lastFailedSyncAt: integration.lastFailedSyncAt,
        lastError: integration.lastError,
        consecutiveFailureCount: integration.consecutiveFailureCount,
        observedLatencyMs: undefined,
        eventThroughput: {
          received: integrationSignals.length,
          processed: integrationSignals.filter(s => s.processingStatus === 'PROCESSED').length,
          duplicatesSuppressed: duplicates,
          rejected,
          deadLettered
        },
        errorRatePercent: errorRate,
        staleDataWarnings: Array.from(new Set(staleWarnings)).slice(0, 20),
        // Distinct-observation count guards against misleading throughput from retries.
        ...(uniqueProviders.size > 0 ? {} : {})
      } as IntegrationHealthSnapshot;
    });
  }

  public async listTransitions(tenantId: string, options?: { controlId?: string; resourceRef?: string; limit?: number }) {
    return this.store.listTransitions(tenantId, options);
  }

  public async listSignals(tenantId: string, options?: { status?: SignalProcessingStatus; limit?: number }) {
    return this.store.listSignals(tenantId, options);
  }

  public async listDeadLetters(tenantId: string, limit: number = 100) {
    return this.store.listDeadLetters(tenantId, { limit });
  }

  public async listFindingLinks(tenantId: string, options?: { status?: string; limit?: number }) {
    return this.store.listFindingLinks(tenantId, options);
  }

  public async listFreshness(tenantId: string): Promise<Array<{ state: ControlMonitoringState; freshness: MonitoringFreshness }>> {
    const states = await this.store.listStates(tenantId, { limit: 2000 });
    const now = new Date();
    return states.map(state => ({ state, freshness: computeFreshness(state, now) }));
  }

  public async getState(tenantId: string, ruleId: string, resourceRef: string) {
    return this.store.getState(tenantId, ruleId, resourceRef);
  }

  public async listStatesWithFilter(
    tenantId: string,
    options?: { status?: string; controlId?: string; limit?: number }
  ): Promise<ControlMonitoringState[]> {
    return this.store.listStates(tenantId, options);
  }

  public async storageType(): Promise<'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE'> {
    return this.store.getStorageType();
  }

  public async healthCheck() {
    return this.store.healthCheck();
  }
}

export const liveMonitoringPipeline = LiveMonitoringPipeline.getInstance();
