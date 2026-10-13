# SKANDA Live Monitoring & Continuous Compliance — Implementation Report

Phase: LIVE MONITORING AND CONTINUOUS COMPLIANCE ENGINE
Date: 2026-10-12
Environment: local development (`tsx server.ts`, port 3000, no `DATABASE_URL`)

---

## 1. Executive verdict

One complete continuous-monitoring workflow is implemented and was verified end to end,
including against the **live GitHub REST API**:

```
provider observation -> canonical signal -> durable queue -> deterministic evaluation
   -> evidence artefact (SHA-256 + WORM seal) -> control state + explicit transition
   -> deduplicated canonical finding -> retest -> verified recovery / reopening
   -> freshness sweep (STALE / UNKNOWN)
```

* Automated suite: **53 assertions passed, 0 failed, 0 skipped** (`npx tsx scripts/validateLiveMonitoringPipeline.ts`, exit 0).
* Live provider verification: **passed** against `api.github.com` (5 real requests, 5 canonical signals, honest UNKNOWN for unreadable facts, and one real NON_COMPLIANT detection from live data).
* TypeScript typecheck: **0 errors** (exit 0). Production build: **exit 0**.
* PostgreSQL and RLS are **NOT verified** — no database is available in this environment (BLOCKED_BY_INFRASTRUCTURE).
* Only **one** connector is genuinely live (GitHub). Entra ID / AWS / Azure remain fixture-based in the pre-existing fabric.

The pipeline is not a mock: it writes real records, detects real drift, and refuses to report
compliance it could not observe.

---

## 2. Existing components reused (not replaced)

| Capability | Canonical implementation reused | How it is used |
|---|---|---|
| GRC record store | `server/repositories/GrcRepositoryFactory.ts` → `JsonGrcRepository` / `PostgresGrcRepository` | Findings and evidence are written through the canonical `findings` / `evidence` repositories; they appear in the existing GRC register |
| Evidence integrity | `server/services/CryptographicWormLedger.ts` (`recordEvidenceBlock`) | Each evaluation digest is sealed into the existing WORM ledger; `isWormVerified` is set only when the ledger seals successfully |
| Domain events | `src/services/canonical/DomainEventBus.ts` | Telemetry/notification domain events, same vocabulary as the telemetry pipeline |
| AuthN / AuthZ | `server/middleware/authMiddleware.ts`, `rbacMiddleware.ts` | `authenticateTenant` + `requirePermission('control.read' | 'control.manage' | 'capa.manage' | 'capa.close')` |
| Migrations | `server/db/migrations/00{1..6}_*.sql` conventions | New migration 007 follows the same tenant-text + `record JSONB` storage strategy |
| Repository pattern | `server/repositories/QuestionnaireRepository.ts` | Interface + durable JSON + PostgreSQL + factory, with production refusing non-durable storage |
| Validation-suite pattern | `scripts/validateSecurityQuestionnaireIntelligence.ts` | Harness, PASS/FAIL accounting, isolated temp storage, exit codes |

Explicitly **not** duplicated: `ContinuousComplianceEngine`, `TelemetryIngestionPipeline`,
`ComplianceEvaluationEngine`, `EvidenceIntelligenceFabricEngine`, the outbox
(`OutboxBrokerService`), and the legacy connector registry were left in place. The new pipeline
feeds them rather than forking them (see §21 for the overlap that remains).

---

## 3. Files created

| File | Purpose |
|---|---|
| `src/types/liveMonitoringTypes.ts` | Shared canonical domain model (maturity, health, signal, evaluation, state, transition, finding link, job, projections) with documented status semantics |
| `server/db/migrations/007_live_monitoring_pipeline.sql` | 8 durable tables + indexes + per-tenant RLS policies |
| `server/repositories/LiveMonitoringRepository.ts` | `IMonitoringDataStore` + `DurableJsonMonitoringRepository` + `PostgresMonitoringRepository` + factory; DB-enforced idempotency, job lease reclamation, backoff helper |
| `server/services/liveMonitoring/signalNormalization.ts` | Validation, canonical mapping, idempotency/CorrelationId derivation, payload digest, secret redaction, cross-tenant claim rejection |
| `server/services/liveMonitoring/controlEvaluationRules.ts` | 10 versioned deterministic rules (ISO 27001:2022 A.5.17/A.5.18/A.8.2/A.8.5/A.8.8/A.8.20/A.8.24/A.8.28/A.8.32), operator engine, freshness policy, transition classification |
| `server/services/liveMonitoring/LiveMonitoringPipeline.ts` | Orchestrator: ingestion, durable processing, evidence, state, transitions, finding lifecycle, retest, freshness sweep, replay, notification policy, dashboard projections |
| `server/connectors/GitHubMonitoringConnector.ts` | Real GitHub REST client: conditional requests, pagination, rate-limit handling, bounded retries, checkpoints, least-privilege scopes |
| `server/liveMonitoringRoutes.ts` | Authenticated REST surface (`/api/v1/live-monitoring` + `/api/live-monitoring`) |
| `src/services/liveMonitoring/liveMonitoringApiClient.ts` | Browser client (bearer token; tenant id never sent) |
| `src/components/live-monitoring/LiveMonitoringWorkspace.tsx` | Command Centre workspace: overview, drift, integration health, freshness, remediation, pipeline/dead letters |
| `scripts/validateLiveMonitoringPipeline.ts` | 53-assertion acceptance suite |
| `scripts/verifyLiveGitHubConnector.ts` | Live provider verification against `api.github.com` |
| `src/lib/nodeStubs/crypto.ts` | Browser shim for Node `crypto` (see §6 defect 7) |

## 4. Files modified

| File | Change |
|---|---|
| `server.ts` | Import + mount `liveMonitoringRouter` on `/api/v1/live-monitoring` and `/api/live-monitoring` |
| `src/App.tsx` | Lazy `LiveMonitoringWorkspace`; module ids `live_monitoring`/`monitoring_drift`/`continuous_monitoring` added to the universal + always-permitted gates and to the module switch |
| `src/components/layout/Sidebar.tsx` | New Compliance sub-item "Live Monitoring & Drift" |
| `src/utils/rbacPermissions.ts` | Live monitoring is general-access (read); mutations stay server-enforced |
| `server/repositories/GrcRepositoryFactory.ts` | Exported the factory class so the validation suite can inject an isolated store |
| `vite.config.ts` | `crypto` alias to the browser shim (and the earlier `pg` alias) |
| `src/lib/nodeStubs/browserEnv.ts`, `src/lib/nodeStubs/pg.ts`, `src/main.tsx` | Earlier in this engagement: browser-safe `process` global and `pg` stub that fixed the blank-page crash |
| `src/components/questionnaire/SecurityQuestionnaireWorkspace.tsx` | Header action block capped so the title/description are not squeezed into a one-word column |

## 5. Architecture changes

* A **durable signal-and-decision layer** was added in front of the existing compliance engines:
  provider observation → validated canonical signal (idempotency key unique per tenant) → durable
  job → deterministic evaluation → evidence → control state → transition → finding.
* **Compliance state is stored per (control, resource)** with the last known verdict retained
  separately, so staleness and monitoring failures cannot masquerade as compliance.
* **Monitoring health is modelled separately** from compliance status and from integration
  maturity, exactly as the brief requires.
* Postgres remains authoritative whenever `DATABASE_URL` exists; the factory refuses non-durable
  storage in production rather than silently degrading.

## 6. Defects found during verification (and fixed)

| # | Defect | Impact | Fix |
|---|---|---|---|
| 1 | An **empty condition list** was treated as missing data | Drift was reported as UNKNOWN instead of NON_COMPLIANT; no finding was raised | Only `null`/`undefined` mean missing data; an empty list is a real observation |
| 2 | Pagination stopped when the item budget filled | Alerts were silently dropped | A full page always triggers the next request; truncation is reported |
| 3 | Anonymous HTTP 401 on authenticated-only endpoints aborted the whole collection, and a 401 was conflated with "protection absent" | Branch protection was reported as a *failure* when it was merely *unreadable*; the live run crashed | 401 without a credential → UNKNOWN + unavailable fact; 404 → genuine absence; 401 with a credential → authentication failure |
| 4 | Reconciliation/retest evaluations lost integration attribution | Monitoring failures could not be scoped to their integration | Integration id is inherited from the existing control state |
| 5 | A job left RUNNING by an interrupted process was never reclaimed | Stranded work after a crash | Added a 5-minute lease; expired leases are reclaimable (validated) |
| 6 | Routes never ran `authenticateTenant` | Every endpoint returned 401 | Middleware mounted after the public dev-token route, before all protected routes |
| 7 | **Pre-existing app-wide crash**: `server/services/regulatory/MASRegulatoryIngestionService.ts` is evaluated in the browser and calls `crypto.randomBytes` in its constructor | The entire shell hit the error boundary and rendered no workspace | `crypto` aliased to a browser shim: secure randomness via WebCrypto; synchronous hashing fails loudly instead of producing a fake digest |

## 7. Connector implementations

| Connector | State | Notes |
|---|---|---|
| GitHub (`GitHubMonitoringConnector`) | **IMPLEMENTED_AND_TESTED (fixture HTTP) + LIVELY VERIFIED (anonymous)** | Real `api.github.com` calls; conditional requests (ETag/304), `page`/`per_page` pagination, `x-ratelimit-*` and `retry-after` handling, bounded exponential retries, per-endpoint checkpoints, read-only endpoints only |
| GitHub authenticated collection (org 2FA, branch protection, Dependabot) | **BLOCKED_BY_INFRASTRUCTURE** | Requires `SKANDA_GITHUB_MONITORING_TOKEN`; without it those facts are recorded as UNKNOWN with reasons |
| Entra ID / AWS / Azure / scanners | **MOCK_OR_PLACEHOLDER (pre-existing)** | `server/connectors/TelemetryConnectors.ts` returns fixtures. Not used by the new pipeline and not claimed as live |

Capabilities are declared per integration (`supportsWebhookPush`, `supportsPagination`,
`documentedRateLimitPerMinute`, `requestedScopes`) rather than assumed.

## 8. Supported monitoring modes

EVENT_DRIVEN (webhook ingestion with HMAC verification), SCHEDULED_POLLING (interval per
integration), PERIODIC_RECONCILIATION (`/reconcile`, `evaluateFacts` with
`evaluatedFromReconciliation`), and MANUAL_ONLY. Every projection carries an explicit latency
disclaimer stating that dashboard refresh frequency is not source monitoring frequency.

## 9. Signal schema

`SecuritySignal` in `src/types/liveMonitoringTypes.ts`: id, tenant, integration/connector/provider,
provider event id + type, canonical signal type (15 values), canonical entity type/id, resource
ref + scope, observed state, previous state, **source observed-at** (provider time) and SKANDA
ingested-at, source revision, severity, provenance (source event reference, payload SHA-256,
signature verification result, raw payload preserved), correlation id, idempotency key,
processing status, provider fields (credential-like keys redacted), evaluated control ids,
rejection reason.

## 10. Control evaluation rules

Ten versioned rules (listed in §3) with explicit operators (`IS_TRUE`, `CONTAINS_ALL`,
`LESS_OR_EQUAL`, `WITHIN_SLA_DAYS`, …), each carrying expected condition, failure explanation,
remediation guidance, failure severity, SLA days and `pointInTimeObservation`. Verdicts:
COMPLIANT, NON_COMPLIANT, PARTIALLY_COMPLIANT (partial condition set), UNKNOWN (no usable fact),
NOT_APPLICABLE, NOT_EVALUATED, STALE. AI is not in the decision path.

## 11. Drift detection behaviour

Every change is classified (`FIRST_OBSERVATION`, `DRIFT_INTRODUCED`, `DEGRADED`, `RECOVERED`,
`STATE_UNKNOWN`, `NO_CHANGE`) and persisted as a `ControlStateTransition` carrying previous/new
status, trigger kind, triggering signal, rule + version, evidence id, evaluation time, reason and
finding id. `NO_CHANGE` produces no transition, no finding and no notification.

## 12. Evidence provenance

Each evaluation creates an Evidence Fabric record with a deterministic SHA-256 digest over
(rule, version, control, resource, observed facts, actual condition, result, source observed-at,
source payload digest), source connector, collection timestamp, chain of custody, 7-year
retention, and a WORM ledger seal. `isWormVerified` is true only when the ledger sealed
successfully, and the ledger's `verifyLedgerIntegrity()` result matched the claim in the suite.
Sources of observation vs evidence artefacts vs evaluations vs findings vs assurance conclusions
are distinct records.

## 13. Freshness handling

Per-control `expectedCollectionIntervalSeconds` and `freshnessThresholdSeconds`; the freshness
projection returns age, staleness and a **presentation rule** (`CURRENT`,
`STALE_SHOW_LAST_KNOWN`, `UNKNOWN_NO_DATA`). The sweep moves expired controls to STALE with the
last known verdict retained separately; controls never observed become UNKNOWN. **Control failure
and monitoring failure are different states** (`failureKind`: `CONTROL_FAILURE` /
`MONITORING_FAILURE` / `EVIDENCE_GAP`), with different reasons and remediation paths.

## 14. Finding and remediation lifecycle

Deduplication key = `controlId|resourceRef|ruleId` (unique per tenant in the database). A
persisting violation increments `occurrenceCount` and updates the same canonical finding (no
duplicates). Recovery observed → `AWAITING_RETEST` + canonical status `Verification Pending`
(never auto-closed). Retest COMPLIANT → `CLOSED_VERIFIED` with `verifiedRecoveredAt`, canonical
`Closed Verified`, verifying actor recorded. Retest failing → `REOPENED` + canonical `Open`.
Closure without verified recovery requires an audited justification (≥10 characters) and is
recorded as `CLOSED_UNVERIFIED`, distinct from verified recovery; a verified finding cannot be
downgraded (validated). Owners/due dates use rule SLA days, not a universal SLA.

## 15. Dashboard and notification changes

`LiveMonitoringWorkspace` (new Command Centre workspace, Compliance → "Live Monitoring & Drift")
reads only authoritative API records: overview tiles, drift table, integration health (maturity vs
health vs last sync vs error vs stale warnings), evidence freshness, remediation with retest /
close-without-verification / justification, pipeline signals and dead letters with controlled
replay, and the versioned rule registry with expected conditions.

**Why a new workspace rather than editing `ContinuousComplianceModule`:** that 2 416-line legacy
module renders workspace-local fixture data and does not read authoritative monitoring records;
the brief requires dashboard state to come from authoritative records, so a new view was added
alongside the existing Command Centre navigation instead of re-pointing the legacy module.

Notifications: policy decides notify/suppress by classification and severity (fires on state
change, suppresses repeated polling), with an in-app domain event and the notification id recorded
on the transition.

## 16. Security and tenant isolation results

* Tenant identity comes **only** from verified JWT claims (`authenticateTenant`); no endpoint
  accepts a tenant from the body, query or headers.
* Inbound payloads claiming another tenant are **rejected** (validated).
* Repository methods are tenant-scoped; cross-tenant reads returned `null` (validated), and one
  tenant cannot post observations against another tenant's integration id (validated).
* Webhook deliveries require a verified HMAC SHA-256 signature when received over an untrusted
  channel (validated); unverified deliveries are refused before normalization.
* Least privilege: GitHub scopes requested are `read:org`, repository read, `security_events` read;
  all endpoints used are read-only.
* Credentials are never stored on the integration (only the environment variable **name**) and
  never logged; payload keys matching token/secret/password/authorization patterns are redacted
  before persistence; oversized payloads (>256 KiB) are rejected.
* Malformed payloads (invalid timestamp, non-evaluable nested state) are rejected with reasons.
* RLS DDL (including `FORCE ROW LEVEL SECURITY`) exists for all 8 tables — **not executed or
  verified against a live PostgreSQL instance in this environment.**

## 17–18. Exact commands, outcomes, typecheck and build

| Command | Outcome |
|---|---|
| `npx tsx scripts/validateLiveMonitoringPipeline.ts` | **53 passed, 0 failed, 0 skipped — exit 0** |
| `npx tsx scripts/verifyLiveGitHubConnector.ts octocat/Hello-World` | **exit 0**; live API: 5 requests succeeded, 5 signals, 4 facts honestly UNKNOWN, 1 real NON_COMPLIANT (absent CODEOWNERS) |
| `node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc --noEmit` | **exit 0, 0 errors** (full project: src, server, scripts) |
| `npm run build` | **exit 0** (vite 38.8s; `dist/assets/index-*.js` 6.32 MB, `dist/server.cjs` 3.1 MB) |
| `npm run dev` + HTTP E2E (`curl`) | dev token → `/health` 200 → `/overview` 200 → GitHub collect (5 real requests, 5 signals) → `/controls` 5 states → `/findings` 1 → `/drift` 9 transitions |
| Browser verification (Preview) | Workspace renders; a collection run **from the UI** ingested 5 observations; dashboard reconciled to 1 NON_COMPLIANT, 4 UNKNOWN, 1 open finding, 5 signals processed, 295 ms average latency |

## 19. Live database verification status

**BLOCKED_BY_INFRASTRUCTURE.** No `DATABASE_URL` and no PostgreSQL instance are available. The
PostgreSQL repository implementation and migration 007 are written but have never been executed.
Consequently: RLS is **not** verified, cross-tenant isolation is verified only at the repository
(JSON) and HTTP layers, and the pipeline currently runs on the durable JSON store
(`STORAGE: JSON DURABLE` shown in the UI). JSON storage is explicitly rejected in production
unless `SKANDA_ALLOW_JSON_PERSISTENCE=true` is set as an accepted degradation.

## 20. Live provider verification status

**Verified for GitHub anonymous reads** (real HTTPS, real pagination/rate-limit/ETag code paths,
real evaluation of real facts). **Unverified for authenticated GitHub reads** and for all other
providers, because no provider credentials exist in this environment. Nothing is fabricated: when
a fact cannot be read, the control is UNKNOWN with the reason recorded.

## 21. Remaining mocks and placeholders

| Item | Classification |
|---|---|
| `server/connectors/TelemetryConnectors.ts` (11 connectors) | MOCK_OR_PLACEHOLDER (pre-existing; not used by the new pipeline) |
| Authenticated GitHub facts (org 2FA, branch protection, Dependabot) | BLOCKED_BY_INFRASTRUCTURE |
| Email / Teams / Slack notification delivery | PARTIALLY_IMPLEMENTED (policy + in-app event only; no channel provider) |
| Risk recalculation from findings (`relatedRiskIds`) | NOT_IMPLEMENTED |
| Automated remediation task creation / owner assignment | NOT_IMPLEMENTED (finding is created with severity, SLA and target date; owner remains unassigned) |
| Other real integrations (Entra ID, AWS, Azure, a vulnerability scanner) | NOT_IMPLEMENTED |
| Legacy fixture path in `TelemetryIngestionPipeline` / `ContinuousComplianceEngine` | PARTIALLY_IMPLEMENTED (still pollutes with fixture connectors; see §22) |

## 22. Known defects and limitations

1. **Two ingestion paths coexist.** The pre-existing `TelemetryIngestionPipeline` still polls 11
   fixture connectors every 30 s into in-memory maps and calls `executeScheduledSweep`. It is not
   wired to the new pipeline and still reports fixture data. Consolidating it (or disabling its
   fixture connectors by default) is the highest-value follow-up.
2. **WORM ledger is in-memory**; seals do not survive a process restart.
3. **Durable JSON store** is single-writer and unsuitable for multi-instance production.
4. **An integration with an unreadable credential shows maturity `AUTHENTICATION_PENDING` while
   health is `HEALTHY`** — accurate (transport healthy, credential absent) but the pairing can
   confuse; the maturity/health separation is intentional.
5. **`INTEGRATIONS MONITORING 0` while `1 registered`** — `monitoringActive` counts only
   `MONITORING_ACTIVE` maturity; anonymous-only integrations are not counted as actively
   monitoring by design.
6. **Latency is not benchmarked end to end.** Only average processing latency (295 ms observed
   for five signals on this machine) is measured; no provider-to-decision latency target is
   claimed.
7. **Live HMR is broken in this environment** (the CSP in `index.html` refuses
   `ws://localhost:24678`), so client edits need a manual reload; server-side edits require a
   server restart.

## 23. Remaining infrastructure dependencies

* PostgreSQL (`DATABASE_URL`) + a migration run of 001–007 to make the pipeline production-viable,
  exercise the PostgreSQL repository, and verify RLS with real roles.
* A GitHub token with `read:org` + `security_events` read scopes (via the secret manager or
  `SKANDA_GITHUB_MONITORING_TOKEN`) to verify the authenticated facts.
* Notification channel providers (SMTP/Teams/Slack) to move from in-app events to delivery.
* No queue or cache dependency was added: durability uses the existing PostgreSQL/JSON storage and
  the existing outbox domain events, as required.

## 24. Recommended next implementation phase

1. Wire the new pipeline to the pre-existing scheduled engine and disable its fixture connectors
   so exactly one ingestion path remains.
2. Stand up PostgreSQL, run migrations 001–007, execute the PostgreSQL repository against it and
   extend the suite with live RLS isolation tests (two tenants, real roles).
3. Add a second real integration (Microsoft Entra ID MFA/privileged-role rules already exist in the
   rule registry) using the same connector contract.
4. Implement remediation task creation/assignment and risk recalculation linkage through the
   existing CAPA and risk services.
5. Implement notification channel delivery with recorded delivery state.

---

### Honesty statement

No connector is reported as live unless it made real provider calls (GitHub only). No control is
reported as continuously monitored unless the pipeline evaluated it from a real observation.
UNKNOWN and STALE are never reported as compliant. Database-level isolation is reported as
unverified because no database was available. No test was weakened, skipped or stubbed to produce
these results; the 53 assertions and the live verification script are included in the repository.
