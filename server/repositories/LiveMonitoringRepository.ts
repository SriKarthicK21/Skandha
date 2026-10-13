// ============================================================================
// SKANDA LIVE MONITORING: PERSISTENCE REPOSITORY
// Path: server/repositories/LiveMonitoringRepository.ts
//
// Durable store for the live monitoring pipeline: integrations, canonical
// signals, the job queue, dead letters, control evaluations, continuous
// control states, state transitions and finding-deduplication links.
//
// Design notes (deliberate, mirroring server/repositories/QuestionnaireRepository.ts):
//   1. One interface, two implementations, one factory. PostgreSQL is used
//      whenever DATABASE_URL is present; otherwise a durable JSON store keeps
//      the pipeline functional in development while remaining honestly labelled
//      as degraded persistence (JSON_DURABLE).
//   2. Every operation is tenant-scoped and asserts a tenant id. Cross-tenant
//      reads are impossible through this interface: no method can address a
//      record without the caller's tenant id.
//   3. Duplicate suppression and job idempotency are enforced by the store
//      (unique constraint in PostgreSQL, key check in the JSON store) rather
//      than by an in-memory Set, so a process restart cannot re-process a
//      signal or re-open a finding.
// ============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import {
  MonitoringIntegration,
  SecuritySignal,
  MonitoringJob,
  MonitoringJobStatus,
  MonitoringJobType,
  MonitoringDeadLetterRecord,
  ControlEvaluationRecord,
  ControlMonitoringState,
  ControlStateTransition,
  MonitoringFindingLink,
  SignalProcessingStatus
} from '../../src/types/liveMonitoringTypes';

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface IMonitoringDataStore {
  // Integrations
  saveIntegration(integration: MonitoringIntegration): Promise<MonitoringIntegration>;
  getIntegration(tenantId: string, integrationId: string): Promise<MonitoringIntegration | null>;
  getIntegrationByConnector(tenantId: string, connectorId: string): Promise<MonitoringIntegration | null>;
  listIntegrations(tenantId: string): Promise<MonitoringIntegration[]>;
  updateIntegration(tenantId: string, integrationId: string, patch: Partial<MonitoringIntegration>): Promise<MonitoringIntegration>;

  // Signals
  /** Returns created=false when the idempotency key already exists. */
  saveSignal(signal: SecuritySignal): Promise<{ created: boolean; signal: SecuritySignal }>;
  getSignal(tenantId: string, signalId: string): Promise<SecuritySignal | null>;
  getSignalByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<SecuritySignal | null>;
  listSignals(
    tenantId: string,
    options?: { status?: SignalProcessingStatus; integrationId?: string; limit?: number; offset?: number }
  ): Promise<Paginated<SecuritySignal>>;
  updateSignal(tenantId: string, signalId: string, patch: Partial<SecuritySignal>): Promise<SecuritySignal>;
  countSignalsByStatus(tenantId: string): Promise<Record<string, number>>;

  // Jobs
  enqueueJob(job: MonitoringJob): Promise<{ created: boolean; job: MonitoringJob }>;
  claimNextJob(tenantId: string, now?: Date): Promise<MonitoringJob | null>;
  getJob(tenantId: string, jobId: string): Promise<MonitoringJob | null>;
  updateJob(tenantId: string, jobId: string, patch: Partial<MonitoringJob>): Promise<MonitoringJob>;
  listJobs(tenantId: string, options?: { status?: MonitoringJobStatus; jobType?: MonitoringJobType; limit?: number }): Promise<MonitoringJob[]>;

  // Dead letters
  saveDeadLetter(record: MonitoringDeadLetterRecord): Promise<MonitoringDeadLetterRecord>;
  listDeadLetters(tenantId: string, options?: { status?: MonitoringDeadLetterRecord['status']; limit?: number }): Promise<MonitoringDeadLetterRecord[]>;
  updateDeadLetter(tenantId: string, id: string, patch: Partial<MonitoringDeadLetterRecord>): Promise<MonitoringDeadLetterRecord>;

  // Evaluations
  saveEvaluation(record: ControlEvaluationRecord): Promise<ControlEvaluationRecord>;
  getEvaluation(tenantId: string, evaluationId: string): Promise<ControlEvaluationRecord | null>;
  listEvaluations(tenantId: string, options?: { controlId?: string; resourceRef?: string; limit?: number }): Promise<ControlEvaluationRecord[]>;

  // Continuous control states
  upsertState(state: ControlMonitoringState): Promise<ControlMonitoringState>;
  getState(tenantId: string, ruleId: string, resourceRef: string): Promise<ControlMonitoringState | null>;
  listStates(tenantId: string, options?: { status?: string; controlId?: string; limit?: number }): Promise<ControlMonitoringState[]>;

  // Transitions
  appendTransition(transition: ControlStateTransition): Promise<ControlStateTransition>;
  listTransitions(tenantId: string, options?: { controlId?: string; resourceRef?: string; limit?: number }): Promise<ControlStateTransition[]>;

  // Finding deduplication links
  saveFindingLink(link: MonitoringFindingLink): Promise<MonitoringFindingLink>;
  getFindingLinkByDedupKey(tenantId: string, dedupKey: string): Promise<MonitoringFindingLink | null>;
  listFindingLinks(tenantId: string, options?: { status?: string; limit?: number }): Promise<MonitoringFindingLink[]>;
  updateFindingLink(tenantId: string, id: string, patch: Partial<MonitoringFindingLink>): Promise<MonitoringFindingLink>;

  getStorageType(): 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE';
  healthCheck(): Promise<{ healthy: boolean; detail: string }>;
}

// ---------------------------------------------------------------------------
// SHARED HELPERS
// ---------------------------------------------------------------------------

function assertTenantId(tenantId: string): void {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('A tenant id is required for every live monitoring data operation.');
  }
}

function paginate<T>(items: T[], options?: { limit?: number; offset?: number }): Paginated<T> {
  const limit = Math.max(1, Math.min(options?.limit ?? 50, 500));
  const offset = Math.max(0, options?.offset ?? 0);
  return { items: items.slice(offset, offset + limit), total: items.length, limit, offset };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Backoff schedule for retryable job failures (bounded, deterministic). */
export function computeJobBackoffMs(attemptCount: number): number {
  const base = 1000;
  const capped = Math.min(attemptCount, 6);
  return base * Math.pow(2, capped);
}

/**
 * How long a claimed job may stay RUNNING before another worker may reclaim it.
 * This is what makes processing survive a process restart.
 */
export const DEFAULT_JOB_LEASE_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// DURABLE JSON IMPLEMENTATION
// ---------------------------------------------------------------------------

type JsonCollection =
  | 'integrations'
  | 'signals'
  | 'jobs'
  | 'deadLetters'
  | 'evaluations'
  | 'states'
  | 'transitions'
  | 'findingLinks';

interface JsonState {
  schemaVersion: number;
  data: Record<JsonCollection, any[]>;
}

const EMPTY_STATE: JsonState = {
  schemaVersion: 1,
  data: {
    integrations: [],
    signals: [],
    jobs: [],
    deadLetters: [],
    evaluations: [],
    states: [],
    transitions: [],
    findingLinks: []
  }
};

export class DurableJsonMonitoringRepository implements IMonitoringDataStore {
  private readonly filePath: string;

  constructor(customPath?: string) {
    this.filePath = customPath || path.join(process.cwd(), 'data', 'live_monitoring_store.json');
    this.ensureFile();
  }

  private ensureFile(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(EMPTY_STATE, null, 2), 'utf8');
    }
  }

  private load(): JsonState {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as JsonState;
      if (!parsed || typeof parsed !== 'object' || !parsed.data) return clone(EMPTY_STATE);
      for (const key of Object.keys(EMPTY_STATE.data) as JsonCollection[]) {
        if (!Array.isArray(parsed.data[key])) parsed.data[key] = [];
      }
      return parsed;
    } catch {
      return clone(EMPTY_STATE);
    }
  }

  private commit(state: JsonState): void {
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tmp, this.filePath);
  }

  private insert(collection: JsonCollection, record: any): void {
    const state = this.load();
    if (state.data[collection].some(existing => existing.id === record.id)) {
      state.data[collection] = state.data[collection].map(existing =>
        existing.id === record.id ? record : existing
      );
    } else {
      state.data[collection].push(record);
    }
    this.commit(state);
  }

  private patch(collection: JsonCollection, id: string, patchFn: (record: any) => any): any | null {
    const state = this.load();
    const index = state.data[collection].findIndex(record => record.id === id);
    if (index < 0) return null;
    const updated = patchFn(state.data[collection][index]);
    state.data[collection][index] = updated;
    this.commit(state);
    return updated;
  }

  private find<T>(collection: JsonCollection, predicate: (record: any) => boolean): T | null {
    const found = this.load().data[collection].find(predicate);
    return found ? (clone(found) as T) : null;
  }

  private filter<T>(collection: JsonCollection, predicate: (record: any) => boolean): T[] {
    return clone(this.load().data[collection].filter(predicate)) as T[];
  }

  // ---------------------------- Integrations ------------------------------
  async saveIntegration(integration: MonitoringIntegration): Promise<MonitoringIntegration> {
    assertTenantId(integration.tenantId);
    this.insert('integrations', clone(integration));
    return integration;
  }

  async getIntegration(tenantId: string, integrationId: string): Promise<MonitoringIntegration | null> {
    assertTenantId(tenantId);
    return this.find<MonitoringIntegration>('integrations', r => r.id === integrationId && r.tenantId === tenantId);
  }

  async getIntegrationByConnector(tenantId: string, connectorId: string): Promise<MonitoringIntegration | null> {
    assertTenantId(tenantId);
    return this.find<MonitoringIntegration>('integrations', r => r.connectorId === connectorId && r.tenantId === tenantId);
  }

  async listIntegrations(tenantId: string): Promise<MonitoringIntegration[]> {
    assertTenantId(tenantId);
    return this.filter<MonitoringIntegration>('integrations', r => r.tenantId === tenantId);
  }

  async updateIntegration(tenantId: string, integrationId: string, patch: Partial<MonitoringIntegration>): Promise<MonitoringIntegration> {
    assertTenantId(tenantId);
    const updated = this.patch('integrations', integrationId, record =>
      record.tenantId === tenantId ? { ...record, ...patch, updatedAt: new Date().toISOString() } : record
    );
    if (!updated || updated.tenantId !== tenantId) throw new Error(`Integration ${integrationId} not found for tenant ${tenantId}.`);
    return updated;
  }

  // ------------------------------- Signals --------------------------------
  async saveSignal(signal: SecuritySignal): Promise<{ created: boolean; signal: SecuritySignal }> {
    assertTenantId(signal.tenantId);
    const state = this.load();
    const existing = state.data.signals.find(
      r => r.tenantId === signal.tenantId && r.idempotencyKey === signal.idempotencyKey
    );
    if (existing) return { created: false, signal: clone(existing) as SecuritySignal };
    state.data.signals.push(clone(signal));
    this.commit(state);
    return { created: true, signal };
  }

  async getSignal(tenantId: string, signalId: string): Promise<SecuritySignal | null> {
    assertTenantId(tenantId);
    return this.find<SecuritySignal>('signals', r => r.id === signalId && r.tenantId === tenantId);
  }

  async getSignalByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<SecuritySignal | null> {
    assertTenantId(tenantId);
    return this.find<SecuritySignal>('signals', r => r.idempotencyKey === idempotencyKey && r.tenantId === tenantId);
  }

  async listSignals(
    tenantId: string,
    options?: { status?: SignalProcessingStatus; integrationId?: string; limit?: number; offset?: number }
  ): Promise<Paginated<SecuritySignal>> {
    assertTenantId(tenantId);
    const items = this.filter<SecuritySignal>(
      'signals',
      r =>
        r.tenantId === tenantId &&
        (!options?.status || r.processingStatus === options.status) &&
        (!options?.integrationId || r.integrationId === options.integrationId)
    );
    return paginate(items.reverse(), options);
  }

  async updateSignal(tenantId: string, signalId: string, patch: Partial<SecuritySignal>): Promise<SecuritySignal> {
    assertTenantId(tenantId);
    const updated = this.patch('signals', signalId, record =>
      record.tenantId === tenantId ? { ...record, ...patch } : record
    );
    if (!updated || updated.tenantId !== tenantId) throw new Error(`Signal ${signalId} not found for tenant ${tenantId}.`);
    return updated;
  }

  async countSignalsByStatus(tenantId: string): Promise<Record<string, number>> {
    assertTenantId(tenantId);
    const counts: Record<string, number> = {};
    for (const signal of this.filter<SecuritySignal>('signals', r => r.tenantId === tenantId)) {
      counts[signal.processingStatus] = (counts[signal.processingStatus] || 0) + 1;
    }
    return counts;
  }

  // -------------------------------- Jobs ----------------------------------
  async enqueueJob(job: MonitoringJob): Promise<{ created: boolean; job: MonitoringJob }> {
    assertTenantId(job.tenantId);
    const state = this.load();
    const existing = state.data.jobs.find(r => r.tenantId === job.tenantId && r.idempotencyKey === job.idempotencyKey);
    if (existing) return { created: false, job: clone(existing) as MonitoringJob };
    state.data.jobs.push(clone(job));
    this.commit(state);
    return { created: true, job };
  }

  async claimNextJob(tenantId: string, now: Date = new Date(), leaseMs: number = DEFAULT_JOB_LEASE_MS): Promise<MonitoringJob | null> {
    assertTenantId(tenantId);
    const state = this.load();
    const claimable = state.data.jobs
      .filter(r => {
        if (r.tenantId !== tenantId) return false;
        // A job left RUNNING by an interrupted process is reclaimed once its
        // lease expires, so a crash cannot silently strand work.
        const abandoned = r.status === 'RUNNING' && r.startedAt && now.getTime() - Date.parse(r.startedAt) > leaseMs;
        if (r.status !== 'PENDING' && r.status !== 'FAILED_RETRYABLE' && !abandoned) return false;
        return !r.nextAttemptAt || new Date(r.nextAttemptAt).getTime() <= now.getTime();
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (claimable.length === 0) return null;

    const claimed = claimable[0];
    claimed.status = 'RUNNING';
    claimed.attemptCount = (claimed.attemptCount || 0) + 1;
    claimed.startedAt = now.toISOString();
    state.data.jobs = state.data.jobs.map((r: any) => (r.id === claimed.id ? claimed : r));
    this.commit(state);
    return clone(claimed) as MonitoringJob;
  }

  async getJob(tenantId: string, jobId: string): Promise<MonitoringJob | null> {
    assertTenantId(tenantId);
    return this.find<MonitoringJob>('jobs', r => r.id === jobId && r.tenantId === tenantId);
  }

  async updateJob(tenantId: string, jobId: string, patch: Partial<MonitoringJob>): Promise<MonitoringJob> {
    assertTenantId(tenantId);
    const updated = this.patch('jobs', jobId, record => (record.tenantId === tenantId ? { ...record, ...patch } : record));
    if (!updated || updated.tenantId !== tenantId) throw new Error(`Job ${jobId} not found for tenant ${tenantId}.`);
    return updated;
  }

  async listJobs(
    tenantId: string,
    options?: { status?: MonitoringJobStatus; jobType?: MonitoringJobType; limit?: number }
  ): Promise<MonitoringJob[]> {
    assertTenantId(tenantId);
    const items = this.filter<MonitoringJob>(
      'jobs',
      r =>
        r.tenantId === tenantId &&
        (!options?.status || r.status === options.status) &&
        (!options?.jobType || r.jobType === options.jobType)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.slice(0, options?.limit ?? 200);
  }

  // ----------------------------- Dead letters -----------------------------
  async saveDeadLetter(record: MonitoringDeadLetterRecord): Promise<MonitoringDeadLetterRecord> {
    assertTenantId(record.tenantId);
    this.insert('deadLetters', clone(record));
    return record;
  }

  async listDeadLetters(
    tenantId: string,
    options?: { status?: MonitoringDeadLetterRecord['status']; limit?: number }
  ): Promise<MonitoringDeadLetterRecord[]> {
    assertTenantId(tenantId);
    const items = this.filter<MonitoringDeadLetterRecord>(
      'deadLetters',
      r => r.tenantId === tenantId && (!options?.status || r.status === options.status)
    ).sort((a, b) => new Date(b.deadLetteredAt).getTime() - new Date(a.deadLetteredAt).getTime());
    return items.slice(0, options?.limit ?? 200);
  }

  async updateDeadLetter(tenantId: string, id: string, patch: Partial<MonitoringDeadLetterRecord>): Promise<MonitoringDeadLetterRecord> {
    assertTenantId(tenantId);
    const updated = this.patch('deadLetters', id, record => (record.tenantId === tenantId ? { ...record, ...patch } : record));
    if (!updated || updated.tenantId !== tenantId) throw new Error(`Dead letter ${id} not found for tenant ${tenantId}.`);
    return updated;
  }

  // ----------------------------- Evaluations ------------------------------
  async saveEvaluation(record: ControlEvaluationRecord): Promise<ControlEvaluationRecord> {
    assertTenantId(record.tenantId);
    this.insert('evaluations', clone(record));
    return record;
  }

  async getEvaluation(tenantId: string, evaluationId: string): Promise<ControlEvaluationRecord | null> {
    assertTenantId(tenantId);
    return this.find<ControlEvaluationRecord>('evaluations', r => r.id === evaluationId && r.tenantId === tenantId);
  }

  async listEvaluations(
    tenantId: string,
    options?: { controlId?: string; resourceRef?: string; limit?: number }
  ): Promise<ControlEvaluationRecord[]> {
    assertTenantId(tenantId);
    const items = this.filter<ControlEvaluationRecord>(
      'evaluations',
      r =>
        r.tenantId === tenantId &&
        (!options?.controlId || r.controlId === options.controlId) &&
        (!options?.resourceRef || r.resourceRef === options.resourceRef)
    ).sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
    return items.slice(0, options?.limit ?? 200);
  }

  // ------------------------------- States ---------------------------------
  async upsertState(state: ControlMonitoringState): Promise<ControlMonitoringState> {
    assertTenantId(state.tenantId);
    const existing = await this.getState(state.tenantId, state.ruleId, state.resourceRef);
    if (existing) {
      return this.patch('states', existing.id, record => ({ ...record, ...state, id: existing.id }));
    }
    this.insert('states', clone(state));
    return state;
  }

  async getState(tenantId: string, ruleId: string, resourceRef: string): Promise<ControlMonitoringState | null> {
    assertTenantId(tenantId);
    return this.find<ControlMonitoringState>(
      'states',
      r => r.tenantId === tenantId && r.ruleId === ruleId && r.resourceRef === resourceRef
    );
  }

  async listStates(
    tenantId: string,
    options?: { status?: string; controlId?: string; limit?: number }
  ): Promise<ControlMonitoringState[]> {
    assertTenantId(tenantId);
    const items = this.filter<ControlMonitoringState>(
      'states',
      r =>
        r.tenantId === tenantId &&
        (!options?.status || r.status === options.status) &&
        (!options?.controlId || r.controlId === options.controlId)
    );
    return items.slice(0, options?.limit ?? 500);
  }

  // ----------------------------- Transitions ------------------------------
  async appendTransition(transition: ControlStateTransition): Promise<ControlStateTransition> {
    assertTenantId(transition.tenantId);
    this.insert('transitions', clone(transition));
    return transition;
  }

  async listTransitions(
    tenantId: string,
    options?: { controlId?: string; resourceRef?: string; limit?: number }
  ): Promise<ControlStateTransition[]> {
    assertTenantId(tenantId);
    const items = this.filter<ControlStateTransition>(
      'transitions',
      r =>
        r.tenantId === tenantId &&
        (!options?.controlId || r.controlId === options.controlId) &&
        (!options?.resourceRef || r.resourceRef === options.resourceRef)
    ).sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
    return items.slice(0, options?.limit ?? 200);
  }

  // ---------------------------- Finding links -----------------------------
  async saveFindingLink(link: MonitoringFindingLink): Promise<MonitoringFindingLink> {
    assertTenantId(link.tenantId);
    const state = this.load();
    const existingIndex = state.data.findingLinks.findIndex(
      r => r.tenantId === link.tenantId && r.dedupKey === link.dedupKey
    );
    if (existingIndex >= 0) {
      state.data.findingLinks[existingIndex] = clone(link);
    } else {
      state.data.findingLinks.push(clone(link));
    }
    this.commit(state);
    return link;
  }

  async getFindingLinkByDedupKey(tenantId: string, dedupKey: string): Promise<MonitoringFindingLink | null> {
    assertTenantId(tenantId);
    return this.find<MonitoringFindingLink>('findingLinks', r => r.tenantId === tenantId && r.dedupKey === dedupKey);
  }

  async listFindingLinks(tenantId: string, options?: { status?: string; limit?: number }): Promise<MonitoringFindingLink[]> {
    assertTenantId(tenantId);
    const items = this.filter<MonitoringFindingLink>(
      'findingLinks',
      r => r.tenantId === tenantId && (!options?.status || r.domainFindingStatus === options.status)
    ).sort((a, b) => new Date(b.lastDetectedAt).getTime() - new Date(a.lastDetectedAt).getTime());
    return items.slice(0, options?.limit ?? 200);
  }

  async updateFindingLink(tenantId: string, id: string, patch: Partial<MonitoringFindingLink>): Promise<MonitoringFindingLink> {
    assertTenantId(tenantId);
    const updated = this.patch('findingLinks', id, record =>
      record.tenantId === tenantId ? { ...record, ...patch, updatedAt: new Date().toISOString() } : record
    );
    if (!updated || updated.tenantId !== tenantId) throw new Error(`Finding link ${id} not found for tenant ${tenantId}.`);
    return updated;
  }

  getStorageType(): 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE' {
    return 'JSON_DURABLE';
  }

  async healthCheck(): Promise<{ healthy: boolean; detail: string }> {
    try {
      const state = this.load();
      return {
        healthy: true,
        detail: `Durable JSON monitoring store at ${this.filePath} (${state.data.signals.length} signals, ${state.data.jobs.length} jobs). Not suitable for multi-writer production use.`
      };
    } catch (err: any) {
      return { healthy: false, detail: `Monitoring JSON store unreadable: ${err.message}` };
    }
  }
}

// ---------------------------------------------------------------------------
// POSTGRESQL IMPLEMENTATION
// ---------------------------------------------------------------------------

export class PostgresMonitoringRepository implements IMonitoringDataStore {
  private pool: pg.Pool;

  constructor(databaseUrl: string) {
    this.pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
  }

  private async withClient<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }

  /**
   * Every statement runs inside a transaction whose session variables satisfy the
   * row-level security policies from migration 007, in addition to the explicit
   * tenant predicate on each statement.
   */
  private async withTenant<T>(tenantId: string, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    assertTenantId(tenantId);
    return this.withClient(async client => {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
      await client.query("SELECT set_config('app.is_platform_admin', 'false', true)");
      try {
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        try {
          await client.query('ROLLBACK');
        } catch {
          /* connection already unusable */
        }
        throw err;
      }
    });
  }

  private rowToRecord<T>(row: any): T {
    return (row?.record ? (typeof row.record === 'string' ? JSON.parse(row.record) : row.record) : null) as T;
  }

  // ---------------------------- Integrations ------------------------------
  async saveIntegration(integration: MonitoringIntegration): Promise<MonitoringIntegration> {
    return this.withTenant(integration.tenantId, async client => {
      await client.query(
        `INSERT INTO monitoring_integrations (
           id, tenant_id, connector_id, provider, display_name, environment, monitoring_mode, maturity_state,
           health_state, capabilities, credential_reference, granted_scopes, resource_scope, poll_interval_seconds,
           freshness_threshold_seconds, checkpoint, last_successful_sync_at, last_failed_sync_at, last_error,
           consecutive_failure_count, is_enabled, disconnected_at, credential_revoked_at, record, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW())
         ON CONFLICT (tenant_id, connector_id) DO UPDATE SET
           provider = EXCLUDED.provider, display_name = EXCLUDED.display_name, monitoring_mode = EXCLUDED.monitoring_mode,
           maturity_state = EXCLUDED.maturity_state, health_state = EXCLUDED.health_state, capabilities = EXCLUDED.capabilities,
           credential_reference = EXCLUDED.credential_reference, granted_scopes = EXCLUDED.granted_scopes,
           resource_scope = EXCLUDED.resource_scope, poll_interval_seconds = EXCLUDED.poll_interval_seconds,
           freshness_threshold_seconds = EXCLUDED.freshness_threshold_seconds, checkpoint = EXCLUDED.checkpoint,
           last_successful_sync_at = EXCLUDED.last_successful_sync_at, last_failed_sync_at = EXCLUDED.last_failed_sync_at,
           last_error = EXCLUDED.last_error, consecutive_failure_count = EXCLUDED.consecutive_failure_count,
           is_enabled = EXCLUDED.is_enabled, disconnected_at = EXCLUDED.disconnected_at,
           credential_revoked_at = EXCLUDED.credential_revoked_at, record = EXCLUDED.record, updated_at = NOW()`,
        [
          integration.id, integration.tenantId, integration.connectorId, integration.provider, integration.displayName,
          integration.environment, integration.monitoringMode, integration.maturityState, integration.healthState,
          JSON.stringify(integration.capabilities), integration.credentialReference ?? null,
          JSON.stringify(integration.grantedScopes), JSON.stringify(integration.resourceScope),
          integration.pollIntervalSeconds, integration.freshnessThresholdSeconds, JSON.stringify(integration.checkpoint ?? {}),
          integration.lastSuccessfulSyncAt ?? null, integration.lastFailedSyncAt ?? null, integration.lastError ?? null,
          integration.consecutiveFailureCount, integration.isEnabled, integration.disconnectedAt ?? null,
          integration.credentialRevokedAt ?? null, JSON.stringify(integration)
        ]
      );
      return integration;
    });
  }

  async getIntegration(tenantId: string, integrationId: string): Promise<MonitoringIntegration | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(`SELECT record FROM monitoring_integrations WHERE tenant_id = $1 AND id = $2`, [tenantId, integrationId]);
      return res.rows[0] ? this.rowToRecord<MonitoringIntegration>(res.rows[0]) : null;
    });
  }

  async getIntegrationByConnector(tenantId: string, connectorId: string): Promise<MonitoringIntegration | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(`SELECT record FROM monitoring_integrations WHERE tenant_id = $1 AND connector_id = $2`, [tenantId, connectorId]);
      return res.rows[0] ? this.rowToRecord<MonitoringIntegration>(res.rows[0]) : null;
    });
  }

  async listIntegrations(tenantId: string): Promise<MonitoringIntegration[]> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(`SELECT record FROM monitoring_integrations WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]);
      return res.rows.map((row: any) => this.rowToRecord<MonitoringIntegration>(row));
    });
  }

  async updateIntegration(tenantId: string, integrationId: string, patch: Partial<MonitoringIntegration>): Promise<MonitoringIntegration> {
    const existing = await this.getIntegration(tenantId, integrationId);
    if (!existing) throw new Error(`Integration ${integrationId} not found for tenant ${tenantId}.`);
    return this.saveIntegration({ ...existing, ...patch, updatedAt: new Date().toISOString() });
  }

  // ------------------------------ Signals ---------------------------------
  async saveSignal(signal: SecuritySignal): Promise<{ created: boolean; signal: SecuritySignal }> {
    return this.withTenant(signal.tenantId, async client => {
      const res = await client.query(
        `INSERT INTO monitoring_signals (
           id, tenant_id, integration_id, connector_id, provider, provider_event_id, provider_event_type, signal_type,
           canonical_entity_type, canonical_entity_id, resource_ref, observed_state, previous_state, source_observed_at,
           ingested_at, source_revision, severity, correlation_id, idempotency_key, processing_status,
           source_event_sha256, evaluated_control_ids, rejection_reason, record, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW())
         ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
         RETURNING id`,
        [
          signal.id, signal.tenantId, signal.integrationId, signal.connectorId, signal.provider, signal.providerEventId,
          signal.providerEventType, signal.signalType, signal.canonicalEntityType, signal.canonicalEntityId,
          signal.resourceRef, JSON.stringify(signal.observedState), JSON.stringify(signal.previousState ?? null),
          signal.sourceObservedAt, signal.ingestedAt, signal.sourceRevision ?? null, signal.severity,
          signal.correlationId, signal.idempotencyKey, signal.processingStatus,
          signal.provenance.sourceEventSha256, JSON.stringify(signal.evaluatedControlIds),
          signal.rejectionReason ?? null, JSON.stringify(signal)
        ]
      );
      if (res.rowCount === 0) {
        const existing = await client.query(
          `SELECT record FROM monitoring_signals WHERE tenant_id = $1 AND idempotency_key = $2`,
          [signal.tenantId, signal.idempotencyKey]
        );
        return { created: false, signal: this.rowToRecord<SecuritySignal>(existing.rows[0]) };
      }
      return { created: true, signal };
    });
  }

  async getSignal(tenantId: string, signalId: string): Promise<SecuritySignal | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(`SELECT record FROM monitoring_signals WHERE tenant_id = $1 AND id = $2`, [tenantId, signalId]);
      return res.rows[0] ? this.rowToRecord<SecuritySignal>(res.rows[0]) : null;
    });
  }

  async getSignalByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<SecuritySignal | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(
        `SELECT record FROM monitoring_signals WHERE tenant_id = $1 AND idempotency_key = $2`,
        [tenantId, idempotencyKey]
      );
      return res.rows[0] ? this.rowToRecord<SecuritySignal>(res.rows[0]) : null;
    });
  }

  async listSignals(
    tenantId: string,
    options?: { status?: SignalProcessingStatus; integrationId?: string; limit?: number; offset?: number }
  ): Promise<Paginated<SecuritySignal>> {
    return this.withTenant(tenantId, async client => {
      const limit = Math.max(1, Math.min(options?.limit ?? 50, 500));
      const offset = Math.max(0, options?.offset ?? 0);
      const where: string[] = ['tenant_id = $1'];
      const params: unknown[] = [tenantId];
      if (options?.status) {
        params.push(options.status);
        where.push(`processing_status = $${params.length}`);
      }
      if (options?.integrationId) {
        params.push(options.integrationId);
        where.push(`integration_id = $${params.length}`);
      }
      const countRes = await client.query(`SELECT COUNT(*)::int AS total FROM monitoring_signals WHERE ${where.join(' AND ')}`, params);
      params.push(limit, offset);
      const res = await client.query(
        `SELECT record FROM monitoring_signals WHERE ${where.join(' AND ')} ORDER BY ingested_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );
      return {
        items: res.rows.map((row: any) => this.rowToRecord<SecuritySignal>(row)),
        total: countRes.rows[0]?.total ?? 0,
        limit,
        offset
      };
    });
  }

  async updateSignal(tenantId: string, signalId: string, patch: Partial<SecuritySignal>): Promise<SecuritySignal> {
    const existing = await this.getSignal(tenantId, signalId);
    if (!existing) throw new Error(`Signal ${signalId} not found for tenant ${tenantId}.`);
    const merged = { ...existing, ...patch };
    return this.withTenant(tenantId, async client => {
      await client.query(
        `UPDATE monitoring_signals SET processing_status = $3, evaluated_control_ids = $4, rejection_reason = $5,
           observed_state = $6, record = $7, updated_at = NOW()
         WHERE tenant_id = $1 AND id = $2`,
        [
          tenantId, signalId, merged.processingStatus, JSON.stringify(merged.evaluatedControlIds),
          merged.rejectionReason ?? null, JSON.stringify(merged.observedState), JSON.stringify(merged)
        ]
      );
      return merged;
    });
  }

  async countSignalsByStatus(tenantId: string): Promise<Record<string, number>> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(
        `SELECT processing_status, COUNT(*)::int AS count FROM monitoring_signals WHERE tenant_id = $1 GROUP BY processing_status`,
        [tenantId]
      );
      const counts: Record<string, number> = {};
      for (const row of res.rows) counts[row.processing_status] = row.count;
      return counts;
    });
  }

  // -------------------------------- Jobs ----------------------------------
  async enqueueJob(job: MonitoringJob): Promise<{ created: boolean; job: MonitoringJob }> {
    return this.withTenant(job.tenantId, async client => {
      const res = await client.query(
        `INSERT INTO monitoring_jobs (
           id, tenant_id, job_type, idempotency_key, payload, status, attempt_count, max_attempts,
           next_attempt_at, last_error, correlation_id, created_at, record
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
         RETURNING id`,
        [
          job.id, job.tenantId, job.jobType, job.idempotencyKey, JSON.stringify(job.payload), job.status,
          job.attemptCount, job.maxAttempts, job.nextAttemptAt ?? new Date().toISOString(), job.lastError ?? null,
          job.correlationId, job.createdAt, JSON.stringify(job)
        ]
      );
      if (res.rowCount === 0) {
        const existing = await client.query(
          `SELECT record FROM monitoring_jobs WHERE tenant_id = $1 AND idempotency_key = $2`,
          [job.tenantId, job.idempotencyKey]
        );
        return { created: false, job: this.rowToRecord<MonitoringJob>(existing.rows[0]) };
      }
      return { created: true, job };
    });
  }

  async claimNextJob(
    tenantId: string,
    now: Date = new Date(),
    leaseMs: number = DEFAULT_JOB_LEASE_MS
  ): Promise<MonitoringJob | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(
        `WITH candidate AS (
           SELECT id FROM monitoring_jobs
           WHERE tenant_id = $1
             AND next_attempt_at <= $2
             AND (
               status IN ('PENDING','FAILED_RETRYABLE')
               -- Reclaim work stranded by an interrupted process.
               OR (status = 'RUNNING' AND started_at < $2::timestamptz - ($3::int * INTERVAL '1 millisecond'))
             )
           ORDER BY created_at ASC
           LIMIT 1
           FOR UPDATE SKIP LOCKED
         )
         UPDATE monitoring_jobs j
         SET status = 'RUNNING', attempt_count = j.attempt_count + 1, started_at = $2
         FROM candidate c
         WHERE j.id = c.id
         RETURNING j.record`,
        [tenantId, now.toISOString(), leaseMs]
      );
      return res.rows[0] ? this.rowToRecord<MonitoringJob>(res.rows[0]) : null;
    });
  }

  async getJob(tenantId: string, jobId: string): Promise<MonitoringJob | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(`SELECT record FROM monitoring_jobs WHERE tenant_id = $1 AND id = $2`, [tenantId, jobId]);
      return res.rows[0] ? this.rowToRecord<MonitoringJob>(res.rows[0]) : null;
    });
  }

  async updateJob(tenantId: string, jobId: string, patch: Partial<MonitoringJob>): Promise<MonitoringJob> {
    const existing = await this.getJob(tenantId, jobId);
    if (!existing) throw new Error(`Job ${jobId} not found for tenant ${tenantId}.`);
    const merged = { ...existing, ...patch };
    return this.withTenant(tenantId, async client => {
      await client.query(
        `UPDATE monitoring_jobs SET status = $3, attempt_count = $4, max_attempts = $5, next_attempt_at = $6,
           last_error = $7, started_at = $8, finished_at = $9, record = $10
         WHERE tenant_id = $1 AND id = $2`,
        [
          tenantId, jobId, merged.status, merged.attemptCount, merged.maxAttempts,
          merged.nextAttemptAt ?? null, merged.lastError ?? null, merged.startedAt ?? null,
          merged.finishedAt ?? null, JSON.stringify(merged)
        ]
      );
      return merged;
    });
  }

  async listJobs(
    tenantId: string,
    options?: { status?: MonitoringJobStatus; jobType?: MonitoringJobType; limit?: number }
  ): Promise<MonitoringJob[]> {
    return this.withTenant(tenantId, async client => {
      const where: string[] = ['tenant_id = $1'];
      const params: unknown[] = [tenantId];
      if (options?.status) {
        params.push(options.status);
        where.push(`status = $${params.length}`);
      }
      if (options?.jobType) {
        params.push(options.jobType);
        where.push(`job_type = $${params.length}`);
      }
      params.push(Math.max(1, Math.min(options?.limit ?? 200, 1000)));
      const res = await client.query(
        `SELECT record FROM monitoring_jobs WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT $${params.length}`,
        params
      );
      return res.rows.map((row: any) => this.rowToRecord<MonitoringJob>(row));
    });
  }

  // ----------------------------- Dead letters -----------------------------
  async saveDeadLetter(record: MonitoringDeadLetterRecord): Promise<MonitoringDeadLetterRecord> {
    return this.withTenant(record.tenantId, async client => {
      await client.query(
        `INSERT INTO monitoring_dead_letters (
           id, tenant_id, job_id, job_type, correlation_id, failure_reason, payload, attempt_count,
           dead_lettered_at, status, replayed_at, replay_attempt_ids, record
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, replayed_at = EXCLUDED.replayed_at,
           replay_attempt_ids = EXCLUDED.replay_attempt_ids, record = EXCLUDED.record`,
        [
          record.id, record.tenantId, record.jobId, record.jobType, record.correlationId, record.failureReason,
          JSON.stringify(record.payload), record.attemptCount, record.deadLetteredAt, record.status,
          record.replayedAt ?? null, JSON.stringify(record.replayAttemptIds ?? []), JSON.stringify(record)
        ]
      );
      return record;
    });
  }

  async listDeadLetters(
    tenantId: string,
    options?: { status?: MonitoringDeadLetterRecord['status']; limit?: number }
  ): Promise<MonitoringDeadLetterRecord[]> {
    return this.withTenant(tenantId, async client => {
      const params: unknown[] = [tenantId];
      let where = 'tenant_id = $1';
      if (options?.status) {
        params.push(options.status);
        where += ` AND status = $${params.length}`;
      }
      params.push(Math.max(1, Math.min(options?.limit ?? 200, 1000)));
      const res = await client.query(
        `SELECT record FROM monitoring_dead_letters WHERE ${where} ORDER BY dead_lettered_at DESC LIMIT $${params.length}`,
        params
      );
      return res.rows.map((row: any) => this.rowToRecord<MonitoringDeadLetterRecord>(row));
    });
  }

  async updateDeadLetter(tenantId: string, id: string, patch: Partial<MonitoringDeadLetterRecord>): Promise<MonitoringDeadLetterRecord> {
    const existing = (await this.listDeadLetters(tenantId, { limit: 1000 })).find(record => record.id === id);
    if (!existing) throw new Error(`Dead letter ${id} not found for tenant ${tenantId}.`);
    return this.saveDeadLetter({ ...existing, ...patch });
  }

  // ----------------------------- Evaluations ------------------------------
  async saveEvaluation(record: ControlEvaluationRecord): Promise<ControlEvaluationRecord> {
    return this.withTenant(record.tenantId, async client => {
      await client.query(
        `INSERT INTO control_evaluations (
           id, tenant_id, signal_id, integration_id, control_id, control_code, control_version, rule_id, rule_version,
           resource_ref, result, expected_condition, actual_condition, reason, failure_explanation,
           remediation_guidance, evaluated_at, source_observed_at, evidence_id, evaluated_from_reconciliation, record
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         ON CONFLICT (id) DO NOTHING`,
        [
          record.id, record.tenantId, record.signalId, record.integrationId ?? null, record.controlId, record.controlCode,
          record.controlVersion, record.ruleId, record.ruleVersion, record.resourceRef, record.result,
          record.expectedCondition, record.actualCondition, record.reason, record.failureExplanation ?? null,
          record.remediationGuidance ?? null, record.evaluatedAt, record.sourceObservedAt, record.evidenceId ?? null,
          record.evaluatedFromReconciliation, JSON.stringify(record)
        ]
      );
      return record;
    });
  }

  async getEvaluation(tenantId: string, evaluationId: string): Promise<ControlEvaluationRecord | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(`SELECT record FROM control_evaluations WHERE tenant_id = $1 AND id = $2`, [tenantId, evaluationId]);
      return res.rows[0] ? this.rowToRecord<ControlEvaluationRecord>(res.rows[0]) : null;
    });
  }

  async listEvaluations(
    tenantId: string,
    options?: { controlId?: string; resourceRef?: string; limit?: number }
  ): Promise<ControlEvaluationRecord[]> {
    return this.withTenant(tenantId, async client => {
      const params: unknown[] = [tenantId];
      let where = 'tenant_id = $1';
      if (options?.controlId) {
        params.push(options.controlId);
        where += ` AND control_id = $${params.length}`;
      }
      if (options?.resourceRef) {
        params.push(options.resourceRef);
        where += ` AND resource_ref = $${params.length}`;
      }
      params.push(Math.max(1, Math.min(options?.limit ?? 200, 1000)));
      const res = await client.query(
        `SELECT record FROM control_evaluations WHERE ${where} ORDER BY evaluated_at DESC LIMIT $${params.length}`,
        params
      );
      return res.rows.map((row: any) => this.rowToRecord<ControlEvaluationRecord>(row));
    });
  }

  // ------------------------------- States ---------------------------------
  async upsertState(state: ControlMonitoringState): Promise<ControlMonitoringState> {
    return this.withTenant(state.tenantId, async client => {
      await client.query(
        `INSERT INTO control_monitoring_states (
           id, tenant_id, control_id, control_code, control_version, rule_id, rule_version, resource_ref, status,
           last_known_status, last_signal_id, last_evaluation_id, last_successful_collection_at,
           last_source_observation_at, last_evaluated_at, expected_collection_interval_seconds,
           freshness_threshold_seconds, is_stale, monitoring_failure, monitoring_failure_reason, failure_kind,
           open_finding_id, consecutive_failure_count, record, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW())
         ON CONFLICT (tenant_id, rule_id, resource_ref) DO UPDATE SET
           status = EXCLUDED.status, last_known_status = EXCLUDED.last_known_status, last_signal_id = EXCLUDED.last_signal_id,
           last_evaluation_id = EXCLUDED.last_evaluation_id, last_successful_collection_at = EXCLUDED.last_successful_collection_at,
           last_source_observation_at = EXCLUDED.last_source_observation_at, last_evaluated_at = EXCLUDED.last_evaluated_at,
           expected_collection_interval_seconds = EXCLUDED.expected_collection_interval_seconds,
           freshness_threshold_seconds = EXCLUDED.freshness_threshold_seconds, is_stale = EXCLUDED.is_stale,
           monitoring_failure = EXCLUDED.monitoring_failure, monitoring_failure_reason = EXCLUDED.monitoring_failure_reason,
           failure_kind = EXCLUDED.failure_kind, open_finding_id = EXCLUDED.open_finding_id,
           consecutive_failure_count = EXCLUDED.consecutive_failure_count, record = EXCLUDED.record, updated_at = NOW()`,
        [
          state.id, state.tenantId, state.controlId, state.controlCode, state.controlVersion, state.ruleId, state.ruleVersion,
          state.resourceRef, state.status, state.lastKnownStatus, state.lastSignalId ?? null, state.lastEvaluationId ?? null,
          state.lastSuccessfulCollectionAt ?? null, state.lastSourceObservationAt ?? null, state.lastEvaluatedAt ?? null,
          state.expectedCollectionIntervalSeconds, state.freshnessThresholdSeconds, state.isStale, state.monitoringFailure,
          state.monitoringFailureReason ?? null, state.failureKind, state.openFindingId ?? null,
          state.consecutiveFailureCount, JSON.stringify(state)
        ]
      );
      return state;
    });
  }

  async getState(tenantId: string, ruleId: string, resourceRef: string): Promise<ControlMonitoringState | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(
        `SELECT record FROM control_monitoring_states WHERE tenant_id = $1 AND rule_id = $2 AND resource_ref = $3`,
        [tenantId, ruleId, resourceRef]
      );
      return res.rows[0] ? this.rowToRecord<ControlMonitoringState>(res.rows[0]) : null;
    });
  }

  async listStates(
    tenantId: string,
    options?: { status?: string; controlId?: string; limit?: number }
  ): Promise<ControlMonitoringState[]> {
    return this.withTenant(tenantId, async client => {
      const params: unknown[] = [tenantId];
      let where = 'tenant_id = $1';
      if (options?.status) {
        params.push(options.status);
        where += ` AND status = $${params.length}`;
      }
      if (options?.controlId) {
        params.push(options.controlId);
        where += ` AND control_id = $${params.length}`;
      }
      params.push(Math.max(1, Math.min(options?.limit ?? 500, 2000)));
      const res = await client.query(
        `SELECT record FROM control_monitoring_states WHERE ${where} ORDER BY updated_at DESC LIMIT $${params.length}`,
        params
      );
      return res.rows.map((row: any) => this.rowToRecord<ControlMonitoringState>(row));
    });
  }

  // ----------------------------- Transitions ------------------------------
  async appendTransition(transition: ControlStateTransition): Promise<ControlStateTransition> {
    return this.withTenant(transition.tenantId, async client => {
      await client.query(
        `INSERT INTO control_state_transitions (
           id, tenant_id, control_id, control_code, resource_ref, previous_status, new_status, trigger_kind,
           trigger_signal_id, rule_id, rule_version, evidence_id, source_observed_at, evaluated_at, reason,
           finding_id, notification_id, record
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (id) DO NOTHING`,
        [
          transition.id, transition.tenantId, transition.controlId, transition.controlCode, transition.resourceRef,
          transition.previousStatus, transition.newStatus, transition.triggerKind, transition.triggerSignalId ?? null,
          transition.ruleId, transition.ruleVersion, transition.evidenceId ?? null,
          transition.sourceObservedAt ?? null, transition.evaluatedAt, transition.reason,
          transition.findingId ?? null, transition.notificationId ?? null, JSON.stringify(transition)
        ]
      );
      return transition;
    });
  }

  async listTransitions(
    tenantId: string,
    options?: { controlId?: string; resourceRef?: string; limit?: number }
  ): Promise<ControlStateTransition[]> {
    return this.withTenant(tenantId, async client => {
      const params: unknown[] = [tenantId];
      let where = 'tenant_id = $1';
      if (options?.controlId) {
        params.push(options.controlId);
        where += ` AND control_id = $${params.length}`;
      }
      if (options?.resourceRef) {
        params.push(options.resourceRef);
        where += ` AND resource_ref = $${params.length}`;
      }
      params.push(Math.max(1, Math.min(options?.limit ?? 200, 1000)));
      const res = await client.query(
        `SELECT record FROM control_state_transitions WHERE ${where} ORDER BY evaluated_at DESC LIMIT $${params.length}`,
        params
      );
      return res.rows.map((row: any) => this.rowToRecord<ControlStateTransition>(row));
    });
  }

  // ---------------------------- Finding links -----------------------------
  async saveFindingLink(link: MonitoringFindingLink): Promise<MonitoringFindingLink> {
    return this.withTenant(link.tenantId, async client => {
      await client.query(
        `INSERT INTO monitoring_finding_links (
           id, tenant_id, dedup_key, control_id, control_code, resource_ref, rule_id, rule_version,
           canonical_finding_id, domain_finding_status, severity, first_detected_at, last_detected_at,
           occurrence_count, last_signal_id, evidence_ids, owner_email, remediation_task_id,
           awaiting_retest_since, retest_signal_id, verified_recovered_at, reopened_count, record, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,NOW())
         ON CONFLICT (tenant_id, dedup_key) DO UPDATE SET
           canonical_finding_id = EXCLUDED.canonical_finding_id, domain_finding_status = EXCLUDED.domain_finding_status,
           severity = EXCLUDED.severity, last_detected_at = EXCLUDED.last_detected_at,
           occurrence_count = EXCLUDED.occurrence_count, last_signal_id = EXCLUDED.last_signal_id,
           evidence_ids = EXCLUDED.evidence_ids, owner_email = EXCLUDED.owner_email,
           remediation_task_id = EXCLUDED.remediation_task_id, awaiting_retest_since = EXCLUDED.awaiting_retest_since,
           retest_signal_id = EXCLUDED.retest_signal_id, verified_recovered_at = EXCLUDED.verified_recovered_at,
           reopened_count = EXCLUDED.reopened_count, record = EXCLUDED.record, updated_at = NOW()`,
        [
          link.id, link.tenantId, link.dedupKey, link.controlId, link.controlCode, link.resourceRef, link.ruleId,
          link.ruleVersion, link.canonicalFindingId, link.domainFindingStatus, link.severity, link.firstDetectedAt,
          link.lastDetectedAt, link.occurrenceCount, link.lastSignalId ?? null, JSON.stringify(link.evidenceIds),
          link.ownerEmail ?? null, link.remediationTaskId ?? null, link.awaitingRetestSince ?? null,
          link.retestSignalId ?? null, link.verifiedRecoveredAt ?? null, link.reopenedCount, JSON.stringify(link)
        ]
      );
      return link;
    });
  }

  async getFindingLinkByDedupKey(tenantId: string, dedupKey: string): Promise<MonitoringFindingLink | null> {
    return this.withTenant(tenantId, async client => {
      const res = await client.query(
        `SELECT record FROM monitoring_finding_links WHERE tenant_id = $1 AND dedup_key = $2`,
        [tenantId, dedupKey]
      );
      return res.rows[0] ? this.rowToRecord<MonitoringFindingLink>(res.rows[0]) : null;
    });
  }

  async listFindingLinks(tenantId: string, options?: { status?: string; limit?: number }): Promise<MonitoringFindingLink[]> {
    return this.withTenant(tenantId, async client => {
      const params: unknown[] = [tenantId];
      let where = 'tenant_id = $1';
      if (options?.status) {
        params.push(options.status);
        where += ` AND domain_finding_status = $${params.length}`;
      }
      params.push(Math.max(1, Math.min(options?.limit ?? 200, 1000)));
      const res = await client.query(
        `SELECT record FROM monitoring_finding_links WHERE ${where} ORDER BY last_detected_at DESC LIMIT $${params.length}`,
        params
      );
      return res.rows.map((row: any) => this.rowToRecord<MonitoringFindingLink>(row));
    });
  }

  async updateFindingLink(tenantId: string, id: string, patch: Partial<MonitoringFindingLink>): Promise<MonitoringFindingLink> {
    const existing = (await this.listFindingLinks(tenantId, { limit: 1000 })).find(link => link.id === id);
    if (!existing) throw new Error(`Finding link ${id} not found for tenant ${tenantId}.`);
    return this.saveFindingLink({ ...existing, ...patch, updatedAt: new Date().toISOString() });
  }

  getStorageType(): 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE' {
    return 'POSTGRESQL_RELATIONAL';
  }

  async healthCheck(): Promise<{ healthy: boolean; detail: string }> {
    try {
      return await this.withClient(async client => {
        const res = await client.query('SELECT COUNT(*)::int AS count FROM monitoring_signals') as pg.QueryResult<{ count: number }>;
        return { healthy: true, detail: `PostgreSQL monitoring store reachable (${res.rows[0]?.count ?? 0} signals).` };
      });
    } catch (err: any) {
      return { healthy: false, detail: `PostgreSQL monitoring store unavailable: ${err.message}` };
    }
  }
}

// ---------------------------------------------------------------------------
// FACTORY
// ---------------------------------------------------------------------------

export class LiveMonitoringRepositoryFactory {
  private static instance: IMonitoringDataStore | null = null;

  public static getInstance(): IMonitoringDataStore {
    if (!LiveMonitoringRepositoryFactory.instance) {
      const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
      const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
      const allowJsonInProduction = process.env.SKANDA_ALLOW_JSON_PERSISTENCE === 'true';

      if (hasDatabaseUrl) {
        console.log('[LiveMonitoringRepositoryFactory] DATABASE_URL detected: using PostgresMonitoringRepository');
        LiveMonitoringRepositoryFactory.instance = new PostgresMonitoringRepository(process.env.DATABASE_URL!);
      } else if (isProduction && !allowJsonInProduction) {
        throw new Error(
          'Production live monitoring persistence requires DATABASE_URL. Continuous monitoring cannot run on non-durable storage. ' +
            'Set SKANDA_ALLOW_JSON_PERSISTENCE=true only for an explicitly accepted degraded deployment.'
        );
      } else {
        console.log('[LiveMonitoringRepositoryFactory] No DATABASE_URL: using DurableJsonMonitoringRepository');
        LiveMonitoringRepositoryFactory.instance = new DurableJsonMonitoringRepository();
      }
    }
    return LiveMonitoringRepositoryFactory.instance;
  }

  public static setInstanceForTesting(store: IMonitoringDataStore | null): void {
    LiveMonitoringRepositoryFactory.instance = store;
  }
}

export const getLiveMonitoringDataStore = (): IMonitoringDataStore => LiveMonitoringRepositoryFactory.getInstance();

/** Deterministic identifier helper (readable prefix + random suffix). */
export function monitoringId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}
