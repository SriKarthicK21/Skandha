// ============================================================================
// SKANDA LIVE MONITORING: BROWSER API CLIENT
// Path: src/services/liveMonitoring/liveMonitoringApiClient.ts
//
// Speaks to the JWT-protected /api/v1/live-monitoring routes. Tenant identity is
// derived server-side from verified token claims, so this client never sends a
// tenant id.
//
// Development bootstrap: the platform currently has no browser-facing token
// issuing endpoint, so a DEVELOPMENT-ONLY session token endpoint is used. It
// returns 404 when NODE_ENV=production, in which case the platform identity
// provider must supply the token.
// ============================================================================

import {
  IntegrationHealthSnapshot,
  MonitoringDeadLetterRecord,
  MonitoringFindingLink,
  MonitoringFreshness,
  MonitoringIntegration,
  MonitoringJobStatus,
  MonitoringOverview,
  SecuritySignal,
  ControlMonitoringState,
  ControlStateTransition
} from '../../types/liveMonitoringTypes';

export const LIVE_MONITORING_API_BASE = '/api/v1/live-monitoring';

const TOKEN_STORAGE_KEY = 'skanda.livemonitoring.session';

export interface SessionBootstrap {
  email: string;
  role: string;
  tenantId: string;
}

interface CachedSession {
  token: string;
  expiresAt: number;
  tenantId: string;
  role: string;
}

export class LiveMonitoringApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly detail?: any;

  constructor(status: number, code: string, message: string, detail?: any) {
    super(message);
    this.name = 'LiveMonitoringApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

function readSession(): CachedSession | null {
  try {
    const raw = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedSession;
    if (!parsed.token || Date.now() > parsed.expiresAt - 30_000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: CachedSession): void {
  try {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable: the token is used for this call only */
  }
}

export async function ensureMonitoringSession(bootstrap: SessionBootstrap): Promise<string | null> {
  const existing = readSession();
  if (existing && existing.tenantId === bootstrap.tenantId && existing.role === bootstrap.role) {
    return existing.token;
  }

  try {
    const res = await fetch(`${LIVE_MONITORING_API_BASE}/dev/session-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bootstrap)
    });
    if (!res.ok) return null;
    const body = await res.json();
    const data = body?.data;
    if (!data?.token) return null;
    writeSession({
      token: data.token,
      expiresAt: Date.now() + (Number(data.expiresInSeconds) || 3600) * 1000,
      tenantId: String(data.tenantId),
      role: String(data.role)
    });
    return data.token;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: any; bootstrap: SessionBootstrap }
): Promise<T> {
  const token = await ensureMonitoringSession(options.bootstrap);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${LIVE_MONITORING_API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) {
    throw new LiveMonitoringApiError(
      res.status,
      payload.error || 'HTTP_ERROR',
      payload.message || payload.error || `Request failed with status ${res.status}`,
      payload.data
    );
  }
  return (payload.data !== undefined ? payload.data : payload) as T;
}

// ---------------------------------------------------------------------------
// DTOs mirroring the server projections
// ---------------------------------------------------------------------------

export interface MonitoringRuleView {
  id: string;
  version: string;
  name: string;
  controlCode: string;
  controlId: string;
  frameworkCodes: string[];
  signalType: string;
  expectedCondition: string;
  failureExplanation: string;
  remediationGuidance: string;
  failureSeverity: string;
  slaDays: number | null;
  pointInTimeObservation: boolean;
  expectedValue: unknown;
}

export interface MonitoringHealthView {
  pipeline: string;
  serviceHealth: { healthy: boolean; detail: string };
  storageType: 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE';
  checkedAt: string;
}

export interface PendingJobSummary {
  claimed: number;
  succeeded: number;
  retried: number;
  deadLettered: number;
  skippedIdempotent: number;
}

export interface GitHubCollectionView {
  integrationId: string;
  authenticated: boolean;
  requests: { total: number; succeeded: number; notModified: number; rateLimited: number; authenticationMissing: number; failed: number };
  signalsIngested: number;
  duplicatesSuppressed: number;
  rejected: number;
  unavailableFacts: Array<{ fact: string; reason: string }>;
  latencyMs: number;
  processing: PendingJobSummary;
}

// ---------------------------------------------------------------------------
// CLIENT
// ---------------------------------------------------------------------------

export const liveMonitoringApi = {
  health: (bootstrap: SessionBootstrap) => request<MonitoringHealthView>('/health', { bootstrap }),

  rules: (bootstrap: SessionBootstrap) => request<MonitoringRuleView[]>('/rules', { bootstrap }),

  overview: (bootstrap: SessionBootstrap) => request<MonitoringOverview>('/overview', { bootstrap }),

  integrations: (bootstrap: SessionBootstrap) =>
    request<{ integrations: MonitoringIntegration[]; health: IntegrationHealthSnapshot[] }>('/integrations', { bootstrap }),

  registerIntegration: (bootstrap: SessionBootstrap, body: Record<string, unknown>) =>
    request<{ integration: MonitoringIntegration }>('/integrations', { method: 'POST', body, bootstrap }),

  disconnectIntegration: (
    bootstrap: SessionBootstrap,
    integrationId: string,
    body: { revokeCredential?: boolean; reason?: string }
  ) =>
    request<{ integration: MonitoringIntegration; controlsMarkedUnknown: number }>(
      `/integrations/${encodeURIComponent(integrationId)}/disconnect`,
      { method: 'POST', body, bootstrap }
    ),

  signals: (bootstrap: SessionBootstrap, params: { status?: string; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<{ items: SecuritySignal[]; total: number; limit: number; offset: number }>(`/signals${suffix}`, { bootstrap });
  },

  ingestSignal: (bootstrap: SessionBootstrap, body: Record<string, unknown>) =>
    request<{ outcome: any; processing: PendingJobSummary }>('/signals', { method: 'POST', body, bootstrap }),

  processJobs: (bootstrap: SessionBootstrap, maxJobs = 25) =>
    request<PendingJobSummary>('/jobs/process', { method: 'POST', body: { maxJobs }, bootstrap }),

  deadLetters: (bootstrap: SessionBootstrap, limit = 100) =>
    request<MonitoringDeadLetterRecord[]>(`/dead-letters?limit=${limit}`, { bootstrap }),

  replayDeadLetter: (bootstrap: SessionBootstrap, deadLetterId: string) =>
    request<{ replayed: boolean; jobId?: string; detail: string }>(
      `/dead-letters/${encodeURIComponent(deadLetterId)}/replay`,
      { method: 'POST', bootstrap }
    ),

  controls: (bootstrap: SessionBootstrap, params: { status?: string; controlId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.controlId) query.set('controlId', params.controlId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<ControlMonitoringState[]>(`/controls${suffix}`, { bootstrap });
  },

  drift: (bootstrap: SessionBootstrap, limit = 100) =>
    request<ControlStateTransition[]>(`/drift?limit=${limit}`, { bootstrap }),

  freshness: (bootstrap: SessionBootstrap) =>
    request<Array<{ state: ControlMonitoringState; freshness: MonitoringFreshness }>>('/freshness', { bootstrap }),

  sweepFreshness: (bootstrap: SessionBootstrap) =>
    request<{ staled: number; unknown: number; transitions: number }>('/freshness/sweep', { method: 'POST', bootstrap }),

  reconcile: (
    bootstrap: SessionBootstrap,
    body: { ruleId: string; resourceRef: string; observedState: unknown }
  ) => request<{ jobId: string; processing: PendingJobSummary }>('/reconcile', { method: 'POST', body, bootstrap }),

  findings: (bootstrap: SessionBootstrap, params: { status?: string; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<MonitoringFindingLink[]>(`/findings${suffix}`, { bootstrap });
  },

  retest: (bootstrap: SessionBootstrap, dedupKey: string, observedState: unknown) =>
    request<{ outcome: string; status?: string; findingId?: string; detail: string }>(
      `/findings/${encodeURIComponent(dedupKey)}/retest`,
      { method: 'POST', body: { observedState }, bootstrap }
    ),

  closeWithoutVerification: (bootstrap: SessionBootstrap, dedupKey: string, justification: string) =>
    request<{ closed: boolean; detail: string }>(
      `/findings/${encodeURIComponent(dedupKey)}/close-without-verification`,
      { method: 'POST', body: { justification }, bootstrap }
    ),

  collectGithub: (
    bootstrap: SessionBootstrap,
    body: { owner: string; repositories: string[]; tokenEnvVar?: string; integrationId?: string }
  ) => request<GitHubCollectionView>('/connectors/github/collect', { method: 'POST', body, bootstrap }),

  githubHealth: (bootstrap: SessionBootstrap, owner: string) =>
    request<{
      status: string;
      latencyMs: number;
      authenticated: boolean;
      rateLimitRemaining?: number;
      detail: string;
      permissions: Array<{ scope: string; purpose: string; isReadOnly: boolean }>;
      capabilities: Record<string, unknown>;
    }>(`/connectors/github/health?owner=${encodeURIComponent(owner)}`, { bootstrap })
};

export type { MonitoringJobStatus };
