// ============================================================================
// SKANDA LIVE MONITORING & CONTINUOUS COMPLIANCE WORKSPACE
// Path: src/components/live-monitoring/LiveMonitoringWorkspace.tsx
//
// Reads authoritative pipeline records only. There is no mock-data path: when
// the API is unavailable the workspace states that plainly and stays empty
// rather than inventing compliance state.
//
// The three status families are deliberately kept apart:
//   * compliance status  COMPLIANT / NON_COMPLIANT / PARTIALLY_COMPLIANT / UNKNOWN / STALE / NOT_APPLICABLE
//   * monitoring health  HEALTHY / DEGRADED / FAILING / DISCONNECTED / AUTHENTICATION_FAILED
//   * integration maturity, which is separate from both
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Cloud, Database, Download, FileSearch, GitBranch,
  History, Loader2, Lock, Plug, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck, Upload, XCircle
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { PageHeader } from '../common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge, StatusBadgeType } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  GitHubCollectionView,
  LiveMonitoringApiError,
  MonitoringHealthView,
  MonitoringRuleView,
  SessionBootstrap,
  liveMonitoringApi
} from '../../services/liveMonitoring/liveMonitoringApiClient';
import {
  ControlMonitoringState,
  ControlStateTransition,
  IntegrationHealthSnapshot,
  MonitoringDeadLetterRecord,
  MonitoringFindingLink,
  MonitoringFreshness,
  MonitoringIntegration,
  MonitoringOverview,
  SecuritySignal
} from '../../types/liveMonitoringTypes';

type TabId = 'OVERVIEW' | 'DRIFT' | 'INTEGRATIONS' | 'FRESHNESS' | 'REMEDIATION' | 'PIPELINE';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'OVERVIEW', label: 'Live monitoring overview' },
  { id: 'DRIFT', label: 'Control drift' },
  { id: 'INTEGRATIONS', label: 'Integration health' },
  { id: 'FRESHNESS', label: 'Evidence freshness' },
  { id: 'REMEDIATION', label: 'Remediation & recovery' },
  { id: 'PIPELINE', label: 'Pipeline & dead letters' }
];

/** Maps the portal role onto the server role vocabulary used for token claims. */
function monitoringRoleForPortalRole(role: string | undefined): string {
  const normalized = (role || '').toUpperCase();
  if (normalized.includes('SUPER') || normalized.includes('PLATFORM') || normalized.includes('ADMIN')) return 'PLATFORM_ADMIN';
  if (normalized.includes('CISO') || normalized.includes('COMPLIANCE') || normalized.includes('GRC')) return 'CISO';
  if (normalized.includes('CONTROL')) return 'CONTROL_OWNER';
  return 'AUDITOR';
}

function statusBadgeType(status: string): StatusBadgeType {
  switch (status) {
    case 'COMPLIANT':
    case 'HEALTHY':
    case 'MONITORING_ACTIVE':
    case 'CLOSED_VERIFIED':
    case 'PROCESSED':
      return 'compliant';
    case 'NON_COMPLIANT':
    case 'FAILING':
    case 'AUTHENTICATION_FAILED':
    case 'CRITICAL':
      return 'non-compliant';
    case 'PARTIALLY_COMPLIANT':
    case 'DEGRADED':
    case 'REOPENED':
    case 'STALE':
    case 'HIGH':
      return 'medium';
    case 'MEDIUM':
      return 'medium';
    case 'LOW':
      return 'low';
    case 'UNKNOWN':
    case 'NOT_EVALUATED':
    case 'AWAITING_RETEST':
    case 'QUEUED':
    case 'RECEIVED':
      return 'pending';
    case 'REMEDIATION_IN_PROGRESS':
      return 'in-progress';
    default:
      return 'info';
  }
}

function Metric({ label, value, tone = 'neutral', hint }: { label: string; value: React.ReactNode; tone?: string; hint?: string }) {
  const toneClass =
    tone === 'good'
      ? 'text-[#047857] dark:text-[#6EE7B7]'
      : tone === 'bad'
        ? 'text-[#B91C1C] dark:text-[#FCA5A5]'
        : tone === 'warn'
          ? 'text-[#B45309] dark:text-[#FCD34D]'
          : 'text-[#0F172A] dark:text-[#F8FAFC]';
  return (
    <div className="rounded-xl border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#111827] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#94A3B8]">{label}</p>
      <p className={`text-lg font-bold ${toneClass}`}>{value}</p>
      {hint && <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

function formatWhen(value?: string): string {
  if (!value) return 'never';
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return 'unknown';
  const minutes = Math.round((Date.now() - parsed) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export const LiveMonitoringWorkspace: React.FC = () => {
  const { currentUser, currentRole, currentTenantId } = useGRC();

  const bootstrap: SessionBootstrap = useMemo(
    () => ({
      email: currentUser?.email || 'monitoring@skanda.local',
      role: monitoringRoleForPortalRole(currentRole),
      tenantId: currentTenantId || 'tenant_default'
    }),
    [currentUser?.email, currentRole, currentTenantId]
  );

  const canOperate = bootstrap.role !== 'AUDITOR';

  const [tab, setTab] = useState<TabId>('OVERVIEW');
  const [sessionState, setSessionState] = useState<'PENDING' | 'READY' | 'UNAVAILABLE'>('PENDING');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [storageType, setStorageType] = useState<string>('');
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [integrations, setIntegrations] = useState<MonitoringIntegration[]>([]);
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealthSnapshot[]>([]);
  const [controls, setControls] = useState<ControlMonitoringState[]>([]);
  const [drift, setDrift] = useState<ControlStateTransition[]>([]);
  const [freshness, setFreshness] = useState<Array<{ state: ControlMonitoringState; freshness: MonitoringFreshness }>>([]);
  const [findings, setFindings] = useState<MonitoringFindingLink[]>([]);
  const [signals, setSignals] = useState<SecuritySignal[]>([]);
  const [deadLetters, setDeadLetters] = useState<MonitoringDeadLetterRecord[]>([]);
  const [rules, setRules] = useState<MonitoringRuleView[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepos, setGithubRepos] = useState('');
  const [lastCollection, setLastCollection] = useState<GitHubCollectionView | null>(null);
  const [justificationDraft, setJustificationDraft] = useState<Record<string, string>>({});

  const refreshAll = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!options.silent) setBusy('Loading authoritative monitoring records…');
      try {
        const health = await liveMonitoringApi.health(bootstrap);
        setStorageType(health.storageType);
        const [overviewData, integrationData, controlData, driftData, freshnessData, findingData, signalData, deadLetterData, ruleData] =
          await Promise.all([
            liveMonitoringApi.overview(bootstrap),
            liveMonitoringApi.integrations(bootstrap),
            liveMonitoringApi.controls(bootstrap),
            liveMonitoringApi.drift(bootstrap, 100),
            liveMonitoringApi.freshness(bootstrap),
            liveMonitoringApi.findings(bootstrap, { limit: 200 }),
            liveMonitoringApi.signals(bootstrap, { limit: 50 }),
            liveMonitoringApi.deadLetters(bootstrap, 100),
            liveMonitoringApi.rules(bootstrap)
          ]);

        setOverview(overviewData);
        setIntegrations(integrationData.integrations);
        setIntegrationHealth(integrationData.health);
        setControls(controlData);
        setDrift(driftData);
        setFreshness(freshnessData);
        setFindings(findingData);
        setSignals(signalData.items);
        setDeadLetters(deadLetterData);
        setRules(ruleData);
        setSessionState('READY');
        setSessionError(null);
      } catch (err: any) {
        if (err instanceof LiveMonitoringApiError && (err.status === 401 || err.status === 404)) {
          setSessionState('UNAVAILABLE');
          setSessionError(
            'No verified session is available. The development session endpoint refuses to issue tokens in production, ' +
              'where the platform identity provider must supply them.'
          );
        } else {
          setError(err?.message || 'The monitoring API could not be reached.');
          setSessionState('UNAVAILABLE');
        }
      } finally {
        if (!options.silent) setBusy(null);
      }
    },
    [bootstrap]
  );

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const act = useCallback(
    async (label: string, action: () => Promise<string>) => {
      setBusy(label);
      setError(null);
      try {
        const message = await action();
        setNotice(message);
        await refreshAll({ silent: true });
      } catch (err: any) {
        setError(err?.message || 'The operation failed.');
      } finally {
        setBusy(null);
      }
    },
    [refreshAll]
  );

  const ruleById = useMemo(() => new Map(rules.map(rule => [rule.id, rule])), [rules]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (sessionState === 'PENDING' && !overview) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#111827] px-4 py-3 text-xs text-[#475569] dark:text-[#CBD5E1]">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading authoritative monitoring records…
      </div>
    );
  }

  return (
    <div className="space-y-4" id="live-monitoring-workspace">
      <PageHeader
        id="live-monitoring-page-header"
        category="Continuous Assurance"
        categoryIcon={Activity}
        title="Live Monitoring & Continuous Compliance"
        description="Canonical provider signals, deterministic control evaluation, drift detection, evidence provenance and deduplicated findings. Compliance state is read from authoritative records only."
        badges={[
          { label: storageType ? `STORAGE: ${storageType.replace(/_/g, ' ')}` : 'STORAGE: UNKNOWN', variant: storageType === 'POSTGRESQL_RELATIONAL' ? 'emerald' : 'amber' },
          { label: `ROLE: ${bootstrap.role}`, variant: 'slate', icon: Lock },
          { label: canOperate ? 'OPERATIONS PERMITTED' : 'READ ONLY', variant: canOperate ? 'indigo' : 'slate' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 xl:max-w-2xl xl:justify-end">
            <Button variant="secondary" icon={RefreshCw} onClick={() => void refreshAll()} disabled={Boolean(busy)}>
              Refresh
            </Button>
            <Button
              variant="secondary"
              icon={FileSearch}
              onClick={() =>
                void act('Sweeping freshness…', async () => {
                  const result = await liveMonitoringApi.sweepFreshness(bootstrap);
                  return `Freshness sweep complete: ${result.staled} control(s) became STALE, ${result.unknown} became UNKNOWN.`;
                })
              }
              disabled={!canOperate || Boolean(busy)}
            >
              Sweep freshness
            </Button>
            <Button
              variant="secondary"
              icon={GitBranch}
              onClick={() =>
                void act('Processing queued observations…', async () => {
                  const result = await liveMonitoringApi.processJobs(bootstrap, 50);
                  return `Worker run: ${result.succeeded} succeeded, ${result.retried} retried, ${result.deadLettered} dead-lettered, ${result.skippedIdempotent} skipped as already processed.`;
                })
              }
              disabled={!canOperate || Boolean(busy)}
            >
              Process queue
            </Button>
          </div>
        }
      />

      {busy && (
        <div className="flex items-center gap-2 rounded-xl border border-[#BFDBFE] dark:border-[#1E40AF] bg-[#EFF6FF] dark:bg-[#172554] px-4 py-2 text-xs text-[#1D4ED8] dark:text-[#BFDBFE]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {busy}
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] dark:border-[#991B1B] bg-[#FEF2F2] dark:bg-[#450A0A] px-4 py-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="break-words">{error}</p>
          <button className="ml-auto text-[11px] underline shrink-0" onClick={() => setError(null)}>
            dismiss
          </button>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-[#A7F3D0] dark:border-[#065F46] bg-[#ECFDF5] dark:bg-[#052E2B] px-4 py-3 text-xs text-[#047857] dark:text-[#6EE7B7]">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="break-words">{notice}</p>
          <button className="ml-auto text-[11px] underline shrink-0" onClick={() => setNotice(null)}>
            dismiss
          </button>
        </div>
      )}
      {sessionState === 'UNAVAILABLE' && sessionError && (
        <div className="flex items-start gap-2 rounded-xl border border-[#FDE68A] dark:border-[#78350F] bg-[#FFFBEB] dark:bg-[#451A03] px-4 py-3 text-xs text-[#B45309] dark:text-[#FCD34D]">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="break-words">{sessionError}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-1 rounded-xl border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#111827] p-1">
        {TABS.map(entry => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-current={tab === entry.id}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
              tab === entry.id
                ? 'bg-[#0F2747] text-white dark:bg-[#2563EB]'
                : 'text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/* ------------------------------- OVERVIEW ------------------------------ */}
      {tab === 'OVERVIEW' && overview && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="Integrations monitoring" value={overview.integrations.monitoringActive} tone="good" hint={`${overview.integrations.total} registered`} />
            <Metric label="Degraded / failing" value={`${overview.integrations.degraded} / ${overview.integrations.failing}`} tone={overview.integrations.failing > 0 ? 'bad' : 'warn'} />
            <Metric label="Auth failed" value={overview.integrations.authenticationFailed} tone={overview.integrations.authenticationFailed > 0 ? 'bad' : 'neutral'} />
            <Metric label="Disconnected" value={overview.integrations.disconnected} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="Compliant controls" value={overview.controls.compliant} tone="good" hint={`of ${overview.controls.total} evaluated`} />
            <Metric label="Non-compliant" value={overview.controls.nonCompliant} tone={overview.controls.nonCompliant > 0 ? 'bad' : 'neutral'} />
            <Metric label="Partially compliant" value={overview.controls.partiallyCompliant} tone="warn" />
            <Metric label="Unknown" value={overview.controls.unknown} tone="warn" hint="cannot be verified" />
            <Metric label="Stale" value={overview.controls.stale} tone="warn" hint="evidence expired" />
            <Metric label="Not evaluated" value={overview.controls.notEvaluated} />
            <Metric label="Not applicable" value={overview.controls.notApplicable} />
            <Metric label="Open findings" value={overview.findings.open} tone={overview.findings.open > 0 ? 'warn' : 'neutral'} hint={`${overview.findings.overdue} overdue`} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="Signals received" value={overview.pipeline.signalsReceived} />
            <Metric label="Signals processed" value={overview.pipeline.signalsProcessed} tone="good" />
            <Metric label="Duplicates suppressed" value={overview.pipeline.duplicatesSuppressed} />
            <Metric label="Rejected" value={overview.pipeline.signalsRejected} tone={overview.pipeline.signalsRejected > 0 ? 'warn' : 'neutral'} />
            <Metric label="Dead-lettered" value={overview.pipeline.deadLettered} tone={overview.pipeline.deadLettered > 0 ? 'bad' : 'good'} />
            <Metric
              label="Avg processing latency"
              value={overview.pipeline.averageProcessingLatencyMs !== undefined ? `${overview.pipeline.averageProcessingLatencyMs} ms` : 'n/a'}
            />
            <Metric label="Awaiting retest" value={overview.findings.awaitingRetest} tone="warn" />
            <Metric label="Verified recoveries" value={overview.findings.closedVerified} tone="good" />
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-[#E2E8F0] dark:border-[#273449] bg-[#F8FAFC] dark:bg-[#0B1220] px-4 py-3 text-[11px] text-[#475569] dark:text-[#94A3B8]">
            <History className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>{overview.latencyDisclaimer}</p>
          </div>

          <Card>
            <CardHeader icon={Activity} title="Monitoring state semantics" subtitle="How each status is decided — no status is inferred from absent data" />
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#475569] dark:text-[#CBD5E1]">
              <p><strong>COMPLIANT</strong> — the versioned rule evaluated true against current observed facts.</p>
              <p><strong>NON_COMPLIANT</strong> — the rule evaluated false against current observed facts.</p>
              <p><strong>PARTIALLY_COMPLIANT</strong> — only part of the required condition set is present.</p>
              <p><strong>UNKNOWN</strong> — the provider returned no usable value, so no verdict is asserted.</p>
              <p><strong>STALE</strong> — no observation within the control's freshness threshold; the last known verdict is kept separately.</p>
              <p><strong>NOT_EVALUATED</strong> — no evaluation has been attempted for this control and resource.</p>
              <p><strong>NOT_APPLICABLE</strong> — the applicability engine excluded this control from the organization's scope.</p>
              <p><strong>MONITORING_FAILURE</strong> — the platform could not reach the provider; this is not a control failure.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* -------------------------------- DRIFT -------------------------------- */}
      {tab === 'DRIFT' && (
        <Card>
          <CardHeader
            icon={ShieldAlert}
            title="Control state transitions"
            subtitle={`${drift.length} recorded transition(s) — every change carries its trigger, rule version and evidence`}
          />
          <CardContent className="space-y-2">
            {drift.length === 0 && (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                No state transitions have been recorded yet. Transitions appear here as soon as an observation changes a
                control's evaluated state.
              </p>
            )}
            {drift.map(transition => (
              <div
                key={transition.id}
                className="rounded-xl border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={statusBadgeType(transition.previousStatus)} size="sm">{transition.previousStatus}</Badge>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">→</span>
                  <Badge status={statusBadgeType(transition.newStatus)} size="sm">{transition.newStatus}</Badge>
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{transition.controlCode}</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{transition.resourceRef}</span>
                  <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {transition.triggerKind.replace(/_/g, ' ')} · {formatWhen(transition.evaluatedAt)}
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] break-words">{transition.reason}</p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Rule {transition.ruleId}@{transition.ruleVersion}
                  {transition.evidenceId ? ` · evidence ${transition.evidenceId}` : ' · no evidence reference'}
                  {transition.notificationId ? ` · notification ${transition.notificationId}` : ''}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------- INTEGRATIONS ---------------------------- */}
      {tab === 'INTEGRATIONS' && (
        <div className="space-y-4">
          <Card>
            <CardHeader
              icon={Plug}
              title="Integration health"
              subtitle="Connection health is reported separately from compliance status: an unreachable provider is never a control failure"
            />
            <CardContent className="space-y-2">
              {integrationHealth.length === 0 && (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No integrations are registered for this tenant yet.</p>
              )}
              {integrationHealth.map(entry => (
                <div key={entry.integrationId} className="rounded-xl border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-[#64748B]" />
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{entry.displayName}</span>
                    <Badge status={statusBadgeType(entry.maturityState)} size="sm">{entry.maturityState}</Badge>
                    <Badge status={statusBadgeType(entry.healthState)} size="sm">{entry.healthState}</Badge>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{entry.monitoringMode.replace(/_/g, ' ')}</span>
                    <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      last success {formatWhen(entry.lastSuccessfulSyncAt)} · failures {entry.consecutiveFailureCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                    <span>received {entry.eventThroughput.received}</span>
                    <span>processed {entry.eventThroughput.processed}</span>
                    <span>duplicates {entry.eventThroughput.duplicatesSuppressed}</span>
                    <span>rejected {entry.eventThroughput.rejected}</span>
                    <span>dead-lettered {entry.eventThroughput.deadLettered}</span>
                    <span>error rate {entry.errorRatePercent}%</span>
                  </div>
                  {entry.lastError && (
                    <p className="text-[11px] text-[#B91C1C] dark:text-[#FCA5A5] break-words">Last error: {entry.lastError}</p>
                  )}
                  {entry.staleDataWarnings.length > 0 && (
                    <div className="text-[11px] text-[#B45309] dark:text-[#FCD34D]">
                      {entry.staleDataWarnings.map((warning, index) => (
                        <p key={index}>{warning}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              icon={GitBranch}
              title="GitHub collection pass"
              subtitle="Performs real API reads. Facts the credential cannot observe stay UNKNOWN and are listed with the reason."
            />
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                  Owner / organisation
                  <input
                    value={githubOwner}
                    onChange={event => setGithubOwner(event.target.value)}
                    placeholder="acme-corp"
                    className="mt-1 block h-9 w-56 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-2 text-xs"
                  />
                </label>
                <label className="text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                  Repositories (comma separated)
                  <input
                    value={githubRepos}
                    onChange={event => setGithubRepos(event.target.value)}
                    placeholder="acme-corp/payments-api, acme-corp/web"
                    className="mt-1 block h-9 w-80 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-2 text-xs"
                  />
                </label>
                <Button
                  variant="primary"
                  icon={Upload}
                  disabled={!canOperate || Boolean(busy) || !githubOwner || !githubRepos.trim()}
                  onClick={() =>
                    void act('Collecting from GitHub…', async () => {
                      const result = await liveMonitoringApi.collectGithub(bootstrap, {
                        owner: githubOwner.trim(),
                        repositories: githubRepos
                          .split(',')
                          .map(value => value.trim())
                          .filter(Boolean)
                      });
                      setLastCollection(result);
                      return (
                        `GitHub collection: ${result.signalsIngested} new observation(s), ` +
                        `${result.duplicatesSuppressed} duplicate(s) suppressed, ${result.rejected} rejected, ` +
                        `${result.unavailableFacts.length} fact(s) unreadable with the current credential.`
                      );
                    })
                  }
                >
                  Run collection
                </Button>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Credential comes from the server environment (SKANDA_GITHUB_MONITORING_TOKEN); it is never entered here.
                </span>
              </div>

              {lastCollection && (
                <div className="rounded-xl border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 text-[11px] text-[#475569] dark:text-[#CBD5E1] space-y-1">
                  <p>
                    authenticated: {String(lastCollection.authenticated)} · requests {lastCollection.requests.succeeded}/
                    {lastCollection.requests.total} succeeded · latency {lastCollection.latencyMs}ms
                  </p>
                  {lastCollection.unavailableFacts.length > 0 && (
                    <div>
                      <p className="font-semibold">Unavailable facts (evaluated as UNKNOWN):</p>
                      {lastCollection.unavailableFacts.map((fact, index) => (
                        <p key={index}>· {fact.fact}: {fact.reason}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------ FRESHNESS ------------------------------ */}
      {tab === 'FRESHNESS' && (
        <Card>
          <CardHeader
            icon={Database}
            title="Evidence freshness"
            subtitle="A control is never presented as current compliance once its evidence has expired"
          />
          <CardContent className="space-y-2">
            {freshness.length === 0 && (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No control states are recorded for this tenant yet.</p>
            )}
            {freshness.map(entry => (
              <div key={entry.state.id} className="rounded-xl border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{entry.state.controlCode}</span>
                  <Badge status={statusBadgeType(entry.state.status)} size="sm">{entry.state.status}</Badge>
                  {entry.freshness.presentationRule !== 'CURRENT' && (
                    <Badge status={statusBadgeType('STALE')} size="sm">{entry.freshness.presentationRule.replace(/_/g, ' ')}</Badge>
                  )}
                  {entry.state.monitoringFailure && (
                    <Badge status={statusBadgeType('DEGRADED')} size="sm">MONITORING FAILURE</Badge>
                  )}
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{entry.state.resourceRef}</span>
                  <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    last collected {formatWhen(entry.freshness.lastSuccessfulCollectionAt)}
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                  expected interval {entry.freshness.expectedCollectionIntervalSeconds}s · threshold {entry.freshness.freshnessThresholdSeconds}s ·
                  age {entry.freshness.ageSeconds !== undefined ? `${entry.freshness.ageSeconds}s` : 'no data'} ·
                  last known verdict {entry.state.lastKnownStatus}
                </p>
                {entry.state.monitoringFailureReason && (
                  <p className="text-[11px] text-[#B45309] dark:text-[#FCD34D] break-words">
                    Monitoring failure ({entry.state.failureKind}): {entry.state.monitoringFailureReason}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------- REMEDIATION ----------------------------- */}
      {tab === 'REMEDIATION' && (
        <Card>
          <CardHeader
            icon={ShieldCheck}
            title="Findings, retest and verified recovery"
            subtitle="Recovery is only closed after a successful retest; a failing retest reopens the finding"
          />
          <CardContent className="space-y-3">
            {findings.length === 0 && (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                No monitoring findings exist for this tenant. Findings appear when a deterministic rule evaluates false
                against a current observation.
              </p>
            )}
            {findings.map(link => {
              const rule = ruleById.get(link.ruleId);
              const satisfiedValue = rule?.expectedValue ?? true;
              return (
                <div key={link.id} className="rounded-xl border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B45309]" />
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{link.controlCode}</span>
                    <Badge status={statusBadgeType(link.domainFindingStatus)} size="sm">{link.domainFindingStatus.replace(/_/g, ' ')}</Badge>
                    <Badge status={statusBadgeType(link.severity)} size="sm">{link.severity}</Badge>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{link.resourceRef}</span>
                    <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      first {formatWhen(link.firstDetectedAt)} · {link.occurrenceCount} observation(s) · reopened {link.reopenedCount}×
                    </span>
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                    Rule {link.ruleId}@{link.ruleVersion} · canonical finding {link.canonicalFindingId} · evidence {link.evidenceIds.length} record(s)
                    {link.verifiedRecoveredAt ? ` · verified recovered ${formatWhen(link.verifiedRecoveredAt)}` : ''}
                  </p>
                  {rule && (
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Expected: {rule.expectedCondition}
                      {rule.remediationGuidance ? ` · Remediation: ${rule.remediationGuidance}` : ''}
                    </p>
                  )}
                  {link.domainFindingStatus !== 'CLOSED_VERIFIED' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={RotateCcw}
                        disabled={!canOperate || Boolean(busy)}
                        onClick={() =>
                          void act('Recording retest…', async () => {
                            const result = await liveMonitoringApi.retest(bootstrap, link.dedupKey, satisfiedValue);
                            return result.detail;
                          })
                        }
                      >
                        Retest with expected conditions
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={AlertTriangle}
                        disabled={!canOperate || Boolean(busy)}
                        onClick={() =>
                          void act('Recording failing retest…', async () => {
                            const absent = Array.isArray(satisfiedValue) ? [] : null;
                            const result = await liveMonitoringApi.retest(bootstrap, link.dedupKey, absent);
                            return result.detail;
                          })
                        }
                      >
                        Retest as still failing
                      </Button>
                      <input
                        value={justificationDraft[link.id] || ''}
                        onChange={event => setJustificationDraft(prev => ({ ...prev, [link.id]: event.target.value }))}
                        placeholder="Audited justification to close without verified recovery"
                        className="h-8 flex-1 min-w-[240px] rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-2 text-[11px]"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={XCircle}
                        disabled={!canOperate || Boolean(busy) || (justificationDraft[link.id] || '').trim().length < 10}
                        onClick={() =>
                          void act('Closing without verification…', async () => {
                            const result = await liveMonitoringApi.closeWithoutVerification(
                              bootstrap,
                              link.dedupKey,
                              justificationDraft[link.id]
                            );
                            return result.detail;
                          })
                        }
                      >
                        Close without verification
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ------------------------------- PIPELINE ------------------------------ */}
      {tab === 'PIPELINE' && (
        <div className="space-y-4">
          <Card>
            <CardHeader icon={Activity} title="Recent signals" subtitle={`${signals.length} observation(s) in processing order`} />
            <CardContent className="space-y-1.5">
              {signals.length === 0 && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No signals have been ingested yet.</p>}
              {signals.map(signal => (
                <div key={signal.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-1.5">
                  <Badge status={statusBadgeType(signal.processingStatus === 'PROCESSED' ? 'COMPLIANT' : 'PENDING')} size="sm">
                    {signal.processingStatus}
                  </Badge>
                  <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{signal.signalType}</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{signal.provider} · {signal.resourceRef}</span>
                  <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">observed {formatWhen(signal.sourceObservedAt)}</span>
                  {signal.rejectionReason && (
                    <p className="w-full text-[11px] text-[#B45309] dark:text-[#FCD34D]">Rejected: {signal.rejectionReason}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              icon={AlertTriangle}
              title="Dead letters"
              subtitle="Failures that exhausted their retry budget. Replay re-queues the original payload under a new idempotency key."
            />
            <CardContent className="space-y-2">
              {deadLetters.length === 0 && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No dead-lettered work.</p>}
              {deadLetters.map(record => (
                <div key={record.id} className="rounded-xl border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={statusBadgeType(record.status === 'DEAD_LETTER' ? 'FAILING' : 'COMPLIANT')} size="sm">{record.status}</Badge>
                    <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{record.jobType}</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      attempts {record.attemptCount} · dead-lettered {formatWhen(record.deadLetteredAt)}
                    </span>
                    {record.replayAttemptIds.length > 0 && (
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">replayed as {record.replayAttemptIds.join(', ')}</span>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Download}
                      disabled={!canOperate || Boolean(busy) || record.status !== 'DEAD_LETTER'}
                      onClick={() =>
                        void act('Replaying dead letter…', async () => {
                          const result = await liveMonitoringApi.replayDeadLetter(bootstrap, record.id);
                          return result.detail;
                        })
                      }
                    >
                      Replay
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#B91C1C] dark:text-[#FCA5A5] break-words">{record.failureReason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              icon={GitBranch}
              title="Registered evaluation rules"
              subtitle="Deterministic rules and their versions; AI never overrides these verdicts"
            />
            <CardContent className="space-y-1.5">
              {rules.map(rule => (
                <div key={rule.id} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-1.5 text-[11px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{rule.controlCode}</span>
                    <span className="text-[#475569] dark:text-[#CBD5E1]">{rule.name}</span>
                    <Badge status={statusBadgeType(rule.failureSeverity === 'CRITICAL' ? 'NON_COMPLIANT' : 'PARTIALLY_COMPLIANT')} size="sm">
                      {rule.failureSeverity}
                    </Badge>
                    <span className="ml-auto text-[#64748B] dark:text-[#94A3B8]">
                      {rule.id}@{rule.version} · {rule.frameworkCodes.join(', ')}
                      {rule.slaDays ? ` · ${rule.slaDays}d target` : ''}
                    </span>
                  </div>
                  <p className="text-[#64748B] dark:text-[#94A3B8] break-words">Expected: {rule.expectedCondition}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls tab content is folded into overview tiles + freshness; the raw
          evaluated control list is available for drill-down below the tabs. */}
      {tab !== 'OVERVIEW' && controls.length > 0 && (
        <Card>
          <CardHeader icon={Database} title="Evaluated controls" subtitle={`${controls.length} control/resource state(s) for this tenant`} />
          <CardContent className="space-y-1.5">
            {controls.map(state => (
              <div key={state.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-1.5">
                <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{state.controlCode}</span>
                <Badge status={statusBadgeType(state.status)} size="sm">{state.status}</Badge>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{state.resourceRef}</span>
                <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  {state.failureKind.replace(/_/g, ' ')} · last evaluated {formatWhen(state.lastEvaluatedAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveMonitoringWorkspace;
