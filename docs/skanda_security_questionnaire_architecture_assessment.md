# SKANDA — Security Questionnaire Intelligence Engine
## Pre-Implementation Architecture Assessment & Acceptance Criteria

Date: 2026-10-12
Scope: Repository `skanda-6-high-level-grc-portal` (Express + Vite/React 19 + PostgreSQL/JSON dual persistence)

---

## 1. Discovery Method

Inspected: `server.ts` (route mounting), `server/*Routes.ts`, `server/services/*`, `server/repositories/*`,
`server/db/migrations/*`, `server/middleware/*`, `src/services/**`, `src/components/**`, `src/stores/**`,
`data/*.json`, `scripts/validate*.ts`, `package.json`, `tsconfig.json`.

State labels used: A = Implemented & verified · B = Implemented, insufficiently tested ·
C = Partially implemented · D = Placeholder/mock · E = Missing.

---

## 2. Relevant Existing Components

| Component | Path | State | Notes / evidence |
|---|---|---|---|
| Server-side JWT + tenant context | `server/middleware/authMiddleware.ts` | **A** | HS256 verify, iss/aud/exp/nbf checks, constant-time compare, blocks `x-tenant-id`/`?tenantId` spoofing. |
| RBAC + object-level authz | `server/middleware/rbacMiddleware.ts` | **A** | `requireRole`, `requirePermission`, `authorizeTenantObject`, `validateOptimisticVersion`. |
| Canonical GRC router (reference wiring) | `server/canonicalGrcRoutes.ts` | **A** | Only router that actually applies `authenticateTenant`. Pattern to follow. |
| Audit trail + SHA-256 chain + outbox | `server/services/EnterpriseAuditService.ts` | **B** | Chain + `verifyAuditChainIntegrity`. In-memory store; DB-backed audit persistence not present. |
| GRC repository abstraction | `server/repositories/{types,JsonGrcRepository,PostgresGrcRepository,GrcRepositoryFactory}.ts` | **C** | Interface + JSON impl are real; Postgres impl is thin; factory picks by `DATABASE_URL`. |
| Policy persistence (dual-mode) | `server/repositories/PolicyRepository.ts` | **A** | Durable atomic JSON fallback + Postgres path, fails fast in production. **Best pattern to copy.** |
| Migrations 001–005 + RLS | `server/db/migrations/*.sql` | **B** | Real DDL incl. RLS policies and `tenants` FK. Loaded by dedicated scripts; no live DB in this environment. |
| `QuestionnaireEngine` | `server/services/QuestionnaireEngine.ts` | **C (wrong domain)** | Configuration-driven **onboarding/intake** question set (fields 1.01–9.01) bound to `orgProfile.*` canonical targets. It is NOT a customer/vendor security questionnaire engine. Not extended for external questionnaires — the domains, lifecycles, and evidence semantics are different. Reused conceptually (conditional visibility), not code. |
| TPRM vendor lifecycle | `server/tprmRoutes.ts`, `src/services/grc/TprmIntelligenceEngine.ts` | **B** | Real 17-stage lifecycle + 14-factor risk engine; but persistence is an **in-memory `Map`** (state label **D** for persistence). |
| Document extraction / sanitization | `server/services/DocumentExtractionService.ts` | **B** | Magic-number sniffing, size ceiling, prompt-injection regex sanitization, SHA-256. Adapters are heuristic/metadata-shaped rather than true XLSX/DOCX grid parsing. |
| Evidence pipeline / secure storage | `server/services/SecureEvidenceService.ts`, `SecureEvidencePipelineService.ts` | **B** | Signed-URL and storage abstractions. |
| Canonical controls + testing | `src/services/canonical/ControlTestingService.ts` | **B** | Real control definitions, tenant implementations, test records, framework mappings. Excellent retrieval source. |
| Canonical evidence assertions | `src/services/canonical/CanonicalEvidenceService.ts` | **B** | Evidence → assertion → control traceability chain. Strong provenance substrate. |
| Evidence freshness | `src/services/evidenceFreshnessService.ts` | **B** | `calculateEvidenceFreshness` — reusable for staleness/expiry. |
| Trust Center | `src/components/trust/CustomerTrustCenterModal.tsx` | **D** | UI-only modal with hardcoded disclosure text. No persistence, no authorization, no lifecycle. |
| XLSX / DOCX parsing libs | `package.json` | **E** | No `xlsx`, `exceljs`, `mammoth`, `pdf-parse`, `papaparse`, `zod`. `jszip` 3.10.2 **is** installed and used in 9 modules/scripts. |
| PDF text extraction | — | **E** | No PDF library. |
| Design system | `src/components/ui/index.ts`, `src/components/common/*` | **A** | `Badge`, `Button`, `Card`, `DataTable`, `Modal`, `KPICard`, `PageHeader`, `SlideOverDrawer`, lucide-react icons, Tailwind v4 tokens. |
| Navigation | `src/components/layout/Sidebar.tsx`, `src/App.tsx` (`renderModule` switch) | **A** | Nav groups with `{id,label}` children; module rendered by `switch (activeModule)`. |
| Validation harness | `scripts/validate*.ts` (~60 scripts) | **A** | `tsx` scripts with `assert()` counters, `process.exit(1)` on failure. Convention adopted verbatim. |

### Critical environment findings

1. **No live PostgreSQL.** `DATABASE_URL` is empty and `psql` is not installed. Live RLS/DB isolation **cannot** be validated here. This will be reported as `BLOCKED_BY_INFRASTRUCTURE`, never as a pass.
2. **No spreadsheet/document libraries.** Implementation must be dependency-free. `jszip` is already a project dependency, therefore XLSX and DOCX will be parsed and generated directly from their OOXML (ZIP + XML) structure using `jszip` — giving full control over preserving unrelated worksheets, cells, and formulas for round-trip export.

### Decisions

- **Do not build a second onboarding engine.** A new, distinct `SecurityQuestionnaire` domain is created because the existing engine models *internal certification intake*, while this feature models *inbound external questionnaires with evidence-backed, approval-gated responses*. Documented technical reason: differing lifecycle (`QuestionnaireEngine` has no import, no evidence retrieval, no approval, no export).
- **Do not use an in-memory Map as production persistence.** A dedicated repository with a PostgreSQL implementation (migration 006 + RLS) and a durable atomic-WRITE JSON fallback follows `PolicyRepository`.
- **Reuse, don't duplicate:** controls (`ControlTestingService`), evidence assertions (`CanonicalEvidenceService`), policies (`PolicyRepository`), audit (`EnterpriseAuditService`), authz middleware, and the design system.

---

## 3. Acceptance Criteria

| # | Criterion | Verification method |
|---|---|---|
| 1 | Upload XLSX or CSV questionnaire (size/type validated, SHA-256 recorded) | validation script + API |
| 2 | Review extracted questions with worksheet/section/order preserved | assertion on ordering |
| 3 | Correct ambiguous response-field mapping | mapping preview + override test |
| 4 | Generate answer drafts from authorised tenant knowledge only | retrieval provenance test |
| 5 | Inspect evidence citation for every draft | citation integrity test |
| 6 | Detect missing evidence and contradictions | gap + contradiction tests |
| 7 | Route answers for review (role-based) | review workflow test |
| 8 | Approve/reject server-side only | unauthorised approval → 403 test |
| 9 | Export without losing questions or overwriting unrelated source content | round-trip diff test |
| 10 | Inspect answer + approval history (versioned) | version history test |
| 11 | Tenant isolation across API, repository, retrieval, export | cross-tenant denial tests |

**Core principle enforced in code:** no evidence → no unsupported assurance claim; no approval → no claim of
human approval; no live verification → no claim of live verification; no authorised disclosure → no external publication.
