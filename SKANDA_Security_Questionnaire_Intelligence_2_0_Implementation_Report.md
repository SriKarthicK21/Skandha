# SKANDA — Security Questionnaire Intelligence 2.0
## Continuous-Assurance Implementation & Verification Report

Date: 2026-10-12
Repository: `skanda-6-high-level-grc-portal` (Express + Vite/React 19, PostgreSQL/durable-JSON dual persistence)
Scope of this report: the increment implemented in this pass — **Phase E (continuous assurance and revalidation)**, **Phase N (observability)** and the corresponding **UI, API, migration and tests** — on top of the questionnaire intelligence engine already present in the repository.

---

## 1. Executive verdict

The questionnaire engine can now prove that an answer is still true. Every answered question is bound to the upstream facts it depends on (`answer -> claim -> control / control test / evidence / policy / integration / risk-or-exception / approval / scope`). When one of those facts changes, the engine detects the impact, **preserves the approved wording**, moves the answer to `REVALIDATION_REQUIRED`, invalidates (but retains) the stale approval, blocks governed reuse and export, and routes the answer to the responsible reviewer. A recurrence *after* re-verification notifies again; a repeat of the *same unresolved* condition does not.

Verdict: **the continuous-assurance and revalidation slice is implemented and verified at the code, service, HTTP and browser-UI levels.** Database-level isolation remains **unverified** because no PostgreSQL instance is available in this environment, and no live external SaaS connector is claimed.

### Release status (claimed only where the specific evidence exists)

| Status | Result | Evidence |
|---|---|---|
| `CODE_SYNTAX_VERIFIED` | **YES** | `npx tsc --noEmit` → exit 0, 0 errors |
| `BUILD_ARTIFACT_VERIFIED` | **YES** | `npm run build` → exit 0 (Vite client build + `dist/server.cjs`) |
| `UNIT_TEST_VERIFIED` | **YES** | `npx tsx scripts/validateSecurityQuestionnaireIntelligence.ts` → **230/230 passed, exit 0** |
| `INTEGRATION_TEST_VERIFIED` | **YES (in-process + HTTP)** | Same suite drives service + durable repository; `npx tsx scratch/http_e2e_continuous_assurance.ts` → **44/44 passed, exit 0** against a running server |
| `TENANT_ISOLATION_TEST_VERIFIED` | **YES at application layer only** | Repository tenant scoping, verified-claim tenant binding, cross-tenant denial assertions (43a–43e, 9a–9b) |
| `DATABASE_MIGRATION_VERIFIED` | **NO — BLOCKED_BY_INFRASTRUCTURE** | Migration 008 is statically validated (S6–S12) but has never been executed; RLS is unproven |
| `LIVE_CONNECTOR_VERIFIED` | **NO — not claimed** | No external provider credentials were used or available |
| `DOCUMENT_EXPORT_RENDER_VERIFIED` | **PARTIAL** | Round-trip OOXML/CSV export assertions pass in-process; the generated workbook was not opened in Excel |
| `STAGING_VERIFIED` / `PRODUCTION_VERIFIED` | **NO** | No staging or production deployment was performed |

---

## 2. Existing components reused (canonical, not duplicated)

| Concern | Reused component |
|---|---|
| Answer state machine, approvals, separation of duties | `server/services/QuestionnaireIntelligenceService.ts` |
| Claim statuses and deterministic rules | `src/services/questionnaire/claimValidationService.ts`, `answerGenerationService.ts` |
| Evidence retrieval / provenance / freshness | `evidenceRetrievalService.ts`, `canonical` evidence + control services via `QuestionnaireKnowledgeSource.ts` |
| Governed answer library | `governedAnswerLibraryService.ts` |
| Export preflight + artifact sealing | `questionnaireExportService.ts`, `questionnaireArtifactStore.ts` |
| Gaps → findings/CAPA linkage | `gapDetectionService.ts` (classification gate unchanged) |
| Trust Center disclosures | `trustCenterDisclosureService.ts` |
| Audit trail + hash chain, platform audit mirror | `EnterpriseAuditService.ts` via the questionnaire repository |
| Persistence pattern | `IQuestionnaireDataStore` with durable-JSON + PostgreSQL implementations |
| Authn/authz | `authenticateTenant` (verified JWT claims), `requirePermission` |
| Design system | `PageHeader`, `Card`, `Badge`, `Button`, `EmptyState` |

No second compliance engine, evidence engine, risk engine or integration fabric was introduced. **AI is not in the trust path:** the questionnaire engine contains no LLM/provider call (verified by inspection — no `@google/genai`/Gemini/OpenAI usage in `src/services/questionnaire/*`, the service or the routes); verification is deterministic.

---

## 3. Files created and modified in this pass

**Created**

- [008_questionnaire_continuous_assurance.sql](server/db/migrations/008_questionnaire_continuous_assurance.sql) — dependency graph, change inbox, revalidation events, RLS, status-constraint widening
- [continuousAssuranceRevalidationService.ts](src/services/questionnaire/continuousAssuranceRevalidationService.ts) — the engine (+ pure metrics builder)
- [http_e2e_continuous_assurance.ts](scratch/http_e2e_continuous_assurance.ts) — HTTP end-to-end verification of the authenticated surface

**Modified**

- [questionnaireIntelligenceTypes.ts](src/types/questionnaireIntelligenceTypes.ts) — `REVALIDATION_REQUIRED` status, assurance/dependency/change/revalidation/metrics types
- [QuestionnaireRepository.ts](server/repositories/QuestionnaireRepository.ts) — assurance collections for both stores; approval-resolution defect fix
- [QuestionnaireIntelligenceService.ts](server/services/QuestionnaireIntelligenceService.ts) — dependency registration hooks, assurance API, state-machine rules
- [questionnaireIntelligenceRoutes.ts](server/questionnaireIntelligenceRoutes.ts) — six authenticated assurance/metrics routes
- [questionnaireApiClient.ts](src/services/questionnaire/questionnaireApiClient.ts) — client methods for the new surface
- [SecurityQuestionnaireWorkspace.tsx](src/components/questionnaire/SecurityQuestionnaireWorkspace.tsx) — "Continuous assurance" workspace tab
- [validateSecurityQuestionnaireIntelligence.ts](scripts/validateSecurityQuestionnaireIntelligence.ts) — 90 new assertions (suite grew from 140 to 230)

---

## 4. Data model and API changes

### Migration 008 (`008_questionnaire_continuous_assurance.sql`)

| Table | Purpose | Key constraints |
|---|---|---|
| `answer_assurance_dependencies` | one row per answer: the upstream sources it depends on, the reviewer role, and the four clocks | `UNIQUE (answer_draft_id)`, RLS |
| `monitoring_source_change_events` | durable change inbox (event-driven, scheduled and manual) | `UNIQUE (tenant_id, idempotency_key)` — duplicate delivery is prevented by the database, not just the app; `CHECK` that a dead letter carries its reason |
| `answer_revalidation_events` | version-preserving revalidation record | `UNIQUE (source_change_id, answer_draft_id)` — replay cannot create a second row |

All three tables: `ENABLE` + `FORCE ROW LEVEL SECURITY` with tenant policies (same convention as migration 006), and `ON DELETE CASCADE` from `questionnaires`. Migration 008 also **widens the `answer_drafts.status` CHECK constraint** to admit `REVALIDATION_REQUIRED`.

### New API surface (all under `/api/v1/questionnaires`, all requiring a verified bearer token)

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/assurance/dependencies` | `questionnaire.read` | dependency graph (tenant/questionnaire scoped) |
| GET | `/assurance/revalidation-queue` | `questionnaire.read` | reviewer queue |
| GET | `/assurance/changes` | `questionnaire.read` | durable change inbox |
| GET | `/assurance/metrics` | `questionnaire.read` | observability metrics |
| POST | `/assurance/source-change` | `questionnaire.review` | event-driven change ingestion (`202` accepted, `422` rejected, `500` dead letter) |
| POST | `/assurance/source-change/:changeId/replay` | `questionnaire.review` | deliberate replay |
| POST | `/assurance/reconcile` | `questionnaire.review` | scheduled polling / manual refresh against observed provider state |

Tenant identity is taken from the verified token only; a `tenantId` in the body is ignored and a mismatched `x-tenant-id` header is refused (403).

---

## 5. Continuous-assurance semantics (the rules that were implemented)

- **Dependency graph.** Registered when answers are drafted and refreshed on every review action, so an approval binds to the answer it approved. Only facts actually present on the draft are recorded — nothing is inferred.
- **Four clocks kept distinct:** `sourceObservedAt` (provider observation), `collectedAt` (SKANDA read it), `evaluatedAt` (rule evaluation), `lastVerifiedAt` (last successful human verification).
- **Changed source ⇒ no assurance claim.** A changed source yields `assuranceState = STALE` (evidence/control/test/policy/scope) or `UNKNOWN` (integration unhealthy/disconnected, approval expired). It never yields "still compliant".
- **Wording is never rewritten.** The previously approved text is preserved verbatim (`customerFacingResponse` unchanged, version unchanged, `previousResponse`/`previousStatus` retained), and the revalidation event records `approvedTextPreserved: true`.
- **Stale approvals are invalidated, not reused.** The approval record is retained for audit, referenced as `previousApprovalId`, and `REVALIDATION_REQUIRED -> APPROVED` is refused by the state machine, so re-approval is impossible in one step.
- **Re-approval produces a new approval record**; the current approval resolves to the most recent one.
- **Duplicate delivery** (same idempotency key) is counted on the original record and produces no new revalidation.
- **Repeat signal for the same unresolved condition** opens one revalidation and suppresses the repeat notification.
- **Recurrence after re-verification notifies again** — suppression stops as soon as the answer is no longer awaiting review, so a fresh failure cannot hide behind an earlier suppression.
- **Replay is idempotent**; a rejected change cannot be replayed blindly.
- **Bounded retries (3 attempts, backoff) then DEAD_LETTER with the reason**, never a silent drop.
- **Reconciliation** compares observed provider state with recorded state and reports sources it could **not** observe as unobserved — never as healthy. `EVENT_DRIVEN` is refused as a reconciliation mode.
- **Governed reuse** is downgraded to `PENDING_REVALIDATION` with a versioned reason while the approved library text is preserved.

### Claim-verification rules, with examples

Statuses (extended, deterministic): `SUPPORTED_BY_CURRENT_EVIDENCE`, `PARTIALLY_SUPPORTED`, `CONTRADICTED_BY_EVIDENCE`, `SUPPORTED_BY_APPROVED_FACT`, `SUPPORTED_BY_POLICY_ONLY`, `UNSUPPORTED`, `EXPIRED_OR_STALE`, `OUTSIDE_AVAILABLE_SCOPE`, `AWAITING_HUMAN_VERIFICATION`; answer dispositions include `AWAITING_OWNER_CONFIRMATION` and `INSUFFICIENT_EVIDENCE`.

1. *"Is MFA enforced for all administrative accounts?"* with a current, verified control test → `SUPPORTED_BY_CURRENT_EVIDENCE` → `VERIFIED_YES`.
2. Same question, evidence whose `expiresAt` has passed → `EXPIRED_OR_STALE` → `AWAITING_OWNER_CONFIRMATION`, plus a revalidation trigger (`ASSERTION REMOVED`).
3. Same question, policy document only → `SUPPORTED_BY_POLICY_ONLY` → `INSUFFICIENT_EVIDENCE`; the response text states the source does not verify the claim.

Newly added rule (this pass): once such an answer is **approved**, a later change to any cited source turns it into `REVALIDATION_REQUIRED` with `STALE`/`UNKNOWN` assurance and a routed review — the approval does not survive the change.

---

## 6. Capability status matrix (A–O, honest classification)

| Spec area | Capability | Status | Evidence / limitation |
|---|---|---|---|
| A | XLSX / CSV / DOCX / PDF import, source coordinates, limits, safe parsing, formula/macro safety | **IMPLEMENTED_AND_TESTED** | Suite 1a–7c, 18a–18h, 19a–19b, 29a–29c, 30a–30d (malformed uploads 422, size ceiling, formula-injection neutralised, source ordering preserved) |
| B | Question understanding, domain/framework classification, claim decomposition, ambiguity clarification | **IMPLEMENTED_AND_TESTED** | Suite 6a–6f, 7a–7b (multi-part decomposition, clarification flag) |
| C | Evidence-grounded answers: authorized retrieval only, per-claim citations, no fabricated citations | **IMPLEMENTED_AND_TESTED** | Suite 8a–8c, 9a–9g, 12a–12e, 16a–16h (cross-tenant records dropped, policy-only never asserts a claim) |
| D | Claim-level verification statuses, deterministic rules, scope/freshness/approval/expiry | **IMPLEMENTED_AND_TESTED** | Suite 10a–10c, 11a–11d, 14a–14b; extended by this pass (§5) |
| E | Continuous assurance: dependency graph, revalidation triggers, version preservation, idempotency/replay/dead-letter, modes, four clocks | **IMPLEMENTED_AND_TESTED** (this pass) | Suite 31a–47a; HTTP 6a–7d; UI verified |
| — | Migration/RLS assertions for the new tables | **PARTIALLY_IMPLEMENTED** (static only) | Suite S6–S12; live RLS **not run** |
| F | Governed answer library: reuse checks on scope/freshness/control state/approvals, downgrade on stale | **IMPLEMENTED_AND_TESTED** | Suite 13a–13d, 14a–14b, 46a–46e (entry → `PENDING_REVALIDATION`, wording preserved) |
| G | Gaps, contradictions, overstatement detection, specialist routing, finding/CAPA linkage | **IMPLEMENTED_AND_TESTED** for detection and linkage; **PARTIALLY_IMPLEMENTED** for remediation creation (gated, default off) | Suite 11a–11f, 12a–12e, 21a–21e, 27a–27b |
| H | Human review/approval states, server-side RBAC, separation of duties, state-machine enforcement | **IMPLEMENTED_AND_TESTED** | Suite 15g, 20a–20e, 25a–25b, 26a–26b, 34a, 44a–44b (`REVALIDATION_REQUIRED → APPROVED` refused) |
| I | Trust Center disclosures: authorization, withdrawal, expiry, no internal leakage | **IMPLEMENTED_AND_TESTED** | Suite 22a–22g, 23a–23c, S3 (DB-level authorizer constraint) |
| J–L (provider/AI/security posture) | Deterministic engine with no model in the trust path; provider configuration not required for this feature | **IMPLEMENTED_AND_TESTED** for the deterministic path; **NOT_IMPLEMENTED** for any model-assisted drafting | No LLM/provider call exists in `src/services/questionnaire/*`, the service or the routes |
| M | Premium UX: inbox, workspace, claim/evidence panel, lifecycle states, revalidation view | **IMPLEMENTED_AND_TESTED**; revalidation view added this pass | Browser verification (queue, metrics, dependency graph, change inbox render from server data) |
| N | Observability: structured metrics, coverage disclosure, never-fabricated counters | **IMPLEMENTED_AND_TESTED** (this pass) | Suite 42a–42k; HTTP 8a–8g |
| O | Tests: positive/negative/boundary/authorization/tenant isolation | **IMPLEMENTED_AND_TESTED** | 230 in-process assertions + 44 HTTP assertions |

### Freshness, findings, remediation, dashboard, notifications

| Area | Status |
|---|---|
| Evidence freshness (expiry/staleness per citation and per dependency) | **IMPLEMENTED_AND_TESTED** |
| Finding creation without duplication | **IMPLEMENTED_AND_TESTED** (gap/finding dedup by content-addressed id, unchanged) |
| Remediation/CAPA from questionnaire gaps | **PARTIALLY_IMPLEMENTED** — only `CONFIRMED_CONTROL_DEFICIENCY` / `VERIFIED_CONTROL_TEST_FAILURE` create remediation, gated by `allowRemediationCreation` (default off) |
| Retest / verified recovery of *questionnaire* answers | **IMPLEMENTED_AND_TESTED** (re-review path, new approval, dependency returns to `CURRENT`, leaves the queue) |
| Dashboard | **IMPLEMENTED_AND_TESTED** — "Continuous assurance" tab in the existing questionnaire workspace; no frontend-computed status |
| Notifications | **PARTIALLY_IMPLEMENTED** — dedup, suppression and routing (`routedToRoles`, `requiredReviewerRole`) are recorded; delivery to email/Teams/Slack is **NOT_IMPLEMENTED** in this feature |
| Risk recalculation | **NOT_IMPLEMENTED** for questionnaire answers (no invented likelihood/impact) |

---

## 7. Exact commands and outcomes

```
npx tsx scripts/validateSecurityQuestionnaireIntelligence.ts
  → ASSERTIONS EVALUATED 230 · PASSED 230 · FAILED 0 · exit 0
  → run 3 consecutive times: 230/230 each time (deterministic)

npx tsx scratch/http_e2e_continuous_assurance.ts     (BASE_URL=http://localhost:3123)
  → ASSERTIONS EVALUATED 44 · PASSED 44 · FAILED 0 · exit 0

npx tsc --noEmit
  → exit 0, 0 errors

npm run build
  → exit 0 (Vite build 31.15s; dist/server.cjs 3.2mb)
```

Exit codes were captured directly (`PIPESTATUS`), so a filtered pipeline was never mistaken for a passing check.

### What the 230 assertions cover (feature-relevant highlights)

Dependency registration and clocks (31a–31g); change → revalidation with preserved wording (32a–32m); export blocked while revalidation is required (33a); one-step re-approval refused (34a); re-review restores the answer, the dependency, the queue and a NEW approval (35a–35d); recurrence notifies while repeats do not (35e–35h, 37a–37e); duplicate delivery suppression (36a–36b); unrelated and malformed changes (38a–38f); replay safety (39a–39b); bounded retry → dead letter (40a–40c); reconciliation modes and unobserved sources (41a–41d); metrics derived from records (42a–42k); cross-tenant isolation of the assurance domain (43a–43e, 43ca–43cb); authorization (44a–44b); audit trail and queue content (45a–45e); governed reuse blocked until revalidated (46a–46e); expired evidence yields STALE (47a); migration 008 static schema/RLS/constraint validation (S6–S12).

### Browser-UI verification

Verified in the running application (not by reading code): the "Continuous assurance" tab renders the revalidation queue, the report/reconcile form, the pipeline metrics, the dependency graph and the change inbox from **server data**. With a questionnaire for the active tenant, the queue showed the impacted answer with `STALE`, `EVENT DRIVEN`, trigger source, all four clocks and "previous approved wording preserved"; metrics showed `Changes received 1 · Processed 1 · Open revalidations 2 · Dependencies 2 · Storage: JSON_DURABLE · coverage 1 questionnaire(s)`; the inbox showed the `SCOPE CHANGED / PROCESSED` record with attempts, duplicates, impacted answers and latency. Screenshot captured during verification.

---

## 8. Security and tenant isolation

- Server-verified tenant identity only; body/header tenant values cannot cross tenants (403 on mismatch, tested over HTTP).
- Every repository read/write is tenant-scoped; assurance rows carry `tenant_id` and cascade with their questionnaire.
- Permissions enforced server-side and again in the service layer: reporting a change, replaying and reconciling require `questionnaire.review` (a read-only actor is refused 403); reading the queue requires only `questionnaire.read`.
- Malformed/unknown/future-dated observations are rejected and recorded — never evaluated.
- Export cannot release an answer that must be revalidated (`APPROVED`-only release plus the new status).
- **Not verified:** PostgreSQL RLS. The migration is statically validated only. In-memory/JSON isolation is **not** proof of database isolation.

---

## 9. Defects found by this verification and fixed

1. **`getApprovalForDraft` returned the oldest approval.** After re-verification an answer resolved to its superseded approval record. Fixed in both stores to return the most recent approval (history retained).
2. **Repeat suppression left an inconsistent state.** A suppressed repeat updated the dependency but not the answer, leaving an approved answer under a revalidation-required dependency (and invisible to the queue). Fixed: suppression only applies while the answer is genuinely still awaiting review.
3. **Suppression swallowed recurrences.** A source that failed again *after* the answer was re-verified was treated as a repeat, silently leaving a re-verified answer supported by a failed source. Fixed: recurrence raises its own event and notification.
4. **Re-analysis could overwrite an answer awaiting revalidation**, destroying the preserved approved text. Fixed by extending the existing "never replace an approved draft" guard to `REVALIDATION_REQUIRED`.

Two additional failures during verification were **test-fixture bugs, not product defects**, and were corrected as such: a repeat signal that used a different `newState` (therefore a different dedupe key) and a preflight call issued as `GET` when the route is `POST`.

---

## 10. Remaining mocks, placeholders and limitations

- **Storage in this environment is the durable JSON repository** (`STORAGE: JSON_DURABLE`), not PostgreSQL. The Postgres implementation of the new collections is written but **unexecuted**.
- **No live external connector** is involved in this feature. Provider observations are asserted by an authenticated reviewer/monitor or a reconciliation job; the engine does not fabricate telemetry.
- **Notification delivery** (email/Teams/Slack) is not implemented here; routing, dedup and suppression are.
- **Metrics coverage is bounded** (claim/pipeline counters cover the questionnaires enumerated for the call; the count is reported as `questionnaireCoverage` rather than implied to be complete).
- **A tenant-wide scope change** (`sourceKind: SCOPE` with no `resourceScope`) intentionally impacts every registered dependency; that is documented behaviour, not a heuristic.
- The pre-existing 11 fixture telemetry connectors in the wider platform remain untouched and are not part of this feature.
- A transient Windows `EPERM` was observed once on the JSON store's atomic rename under heavy write load; it did not reproduce in three subsequent runs.

---

## 11. Remaining infrastructure dependencies

| Dependency | Why it is needed |
|---|---|
| PostgreSQL instance with migrations 001–008 applied | to verify RLS, `FORCE ROW LEVEL SECURITY`, the unique idempotency constraints and the widened draft-status constraint in a real database |
| Notification provider credentials | to turn recorded routing/dedup into actual delivery |
| A real monitoring source (e.g. an identity/cloud/SCM connector) | to feed `source-change` from live provider events rather than from reconciled observation |

---

## 12. Recommended next implementation phase

1. **Run migration 008 (and 001–007) against a real PostgreSQL instance** and prove tenant isolation with two tenants and the application database role — the single largest unverified claim.
2. **Promote the reconciliation calls into a scheduled job** driven by the existing background scheduler, submitting real connector observations (the platform already has connector infrastructure and a telemetry pipeline).
3. **Wire notifications** to the existing notification service so suppressed-vs-delivered behaviour is observable end to end.
4. **Surface revalidation in the answer workspace** (inline banner with "what changed" and a one-click re-verify), reducing reviewer friction.
5. **Feed control-state changes from the continuous-monitoring pipeline** built in the previous phase (control evaluation results → `source-change`), closing the loop between monitoring and customer-facing assurance claims.
