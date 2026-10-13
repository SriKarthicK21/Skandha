# SKANDA Enterprise Product Roadmap & Execution Master Plan
## Structured Multi-Phase Engineering, Productization & Market Launch Plan

**Document Reference:** `SKD-RDM-EXE-001`  
**Classification:** Enterprise Strategic Engineering Plan  
**Date:** October 8, 2026  
**Architect Personas:** Chief Enterprise Architect, CISO, Head of Product, DevSecOps Lead, Lead ISO Implementer  

---

### Executive Roadmap Overview

This roadmap defines the disciplined, sequential execution plan to transition SKANDA from its validated **Enterprise Beta** state to a **Production Candidate** and ultimately a commercial **Best-in-Class SaaS Operating Platform**.

In strict accordance with the **Execution Rule (Analyze → Report → Prioritize → Propose Architecture → Implement High-Priority Gaps)**, phases are sequenced by operational dependency: Production Blockers (Phase A) and Enterprise Security (Phase B) precede Commercial Scale (Phase C) and Market Launch (Phase H).

---

### Phase Breakdown & Detailed Specifications

```
  [ PHASE A: PRODUCTION BLOCKERS ] ──▶ [ PHASE B: ENTERPRISE SECURITY ]
                 │                                    │
                 ▼                                    ▼
  [ PHASE C: SaaS INFRASTRUCTURE ] ──▶ [ PHASE D: GRC MATURITY ]
                 │                                    │
                 ▼                                    ▼
  [ PHASE E: CUSTOMER EXPERIENCE ] ──▶ [ PHASE F: AI GOVERNANCE ]
                 │                                    │
                 ▼                                    ▼
  [ PHASE G: PERFORMANCE OPTIMIZATION ] ──▶ [ PHASE H: MARKET LAUNCH ]
```

---

#### PHASE A — PRODUCTION BLOCKERS (Weeks 1–2)

- **Objective:** Eliminate in-memory persistence fallbacks in production tier; enforce live clustered PostgreSQL and cloud secrets management.
- **Dependencies:** Managed PostgreSQL 16 cluster, Cloud KMS.
- **Files Affected:** `server.ts`, `server/services/iso27001PostgresService.ts`, `server/db/`, `server/config/secrets.ts`.
- **Services Involved:** `DataMigrationService`, `iso27001PostgresService`, `ProductionReadinessService`.
- **Database Changes:** Enforce strict foreign key constraints, connection pooling (`pg.Pool`), and automated RLS verification on boot.
- **APIs Affected:** All `/api/v1/` routes; health probe `/api/health` asserts database connection.
- **UI Impacts:** Zero UI change; transparent to end-users.
- **Validation Tests:** `scripts/validateProductionPostgresRLS.ts`, `scripts/validateDatabaseBackupRestore.ts`.
- **Acceptance Criteria:** Application fails fast on boot if `NODE_ENV === 'production'` and live PostgreSQL is unreachable. Zero in-memory state fallbacks permitted in production mode.
- **Risk & Mitigation:** Potential connection exhaustion under load; mitigated via connection pool tuning (`max: 20`, idle timeout 30s).
- **Owner Persona:** Cloud Security / Database Architect.
- **Estimated Complexity:** Medium.

---

#### PHASE B — ENTERPRISE SECURITY & IDENTITY (Weeks 3–4)

- **Objective:** Complete automated enterprise identity lifecycle management via SCIM 2.0 and time-bound external auditor clean room tokens.
- **Dependencies:** Phase A completed; RFC 7643/7644 schemas.
- **Files Affected:** `server/services/IdentityFederationService.ts`, `server/apiV1Routes.ts`, `src/types/identityTypes.ts`.
- **Services Involved:** `IdentityFederationService`, `EnterpriseAuditService`.
- **Database Changes:** Create `scim_tokens`, `scim_users`, `auditor_guest_sessions` tables.
- **APIs Affected:** Add `GET/POST/PUT/PATCH/DELETE /api/scim/v2/Users`, `GET/POST /api/scim/v2/Groups`, `POST /api/v1/audit/guest-token`.
- **UI Impacts:** Added SCIM token generator in `SettingsUsersModule.tsx`; Auditor Guest invitation modal in `InternalAuditModule.tsx`.
- **Validation Tests:** `scripts/validateEnterpriseIdentityGateway.ts`.
- **Acceptance Criteria:** Okta/Entra ID automated user provisioning, deactivation (`active: false`), and role synchronization functional. Auditor clean room tokens enforce strict read-only scope with expiration.
- **Risk & Mitigation:** Cross-tenant privilege escalation; mitigated by strict tenant token signing and RLS enforcement.
- **Owner Persona:** SaaS Security Architect.
- **Estimated Complexity:** Medium-High.

---

#### PHASE C — SaaS INFRASTRUCTURE & BILLING (Weeks 5–6)

- **Objective:** Wire live Stripe billing webhooks, automated subscription tier enforcement, and OpenTelemetry distributed tracing.
- **Dependencies:** Stripe account keys, OpenTelemetry collector.
- **Files Affected:** `server/services/ClientPilotLifecycleService.ts`, `server/apiV1Routes.ts`, `src/services/saas/subscriptionService.ts`.
- **Services Involved:** `ClientPilotLifecycleService`, `TelemetryObservabilityService`.
- **Database Changes:** Create `subscription_invoices`, `tenant_usage_meters` tables.
- **APIs Affected:** Add `/api/v1/billing/webhook`, `/api/v1/billing/invoices`, `/api/v1/billing/portal-session`.
- **UI Impacts:** Live plan usage meters, automated upgrade prompts, and invoice download drawer in `EnterpriseSaaSHub.tsx`.
- **Validation Tests:** `scripts/validateEnterpriseSaaSModel.ts`.
- **Acceptance Criteria:** Webhook events (`customer.subscription.updated`, `invoice.payment_succeeded`) mutate tenant limits in database with zero manual intervention.
- **Risk & Mitigation:** Webhook replay or forgery; mitigated by Stripe cryptographic signature verification (`stripe.webhooks.constructEvent`).
- **Owner Persona:** Enterprise Product Strategist.
- **Estimated Complexity:** Medium.

---

#### PHASE D — GRC MATURITY & CLOUD TELEMETRY (Weeks 7–8)

- **Objective:** Deploy pre-built agentless cloud connectors for AWS, Azure, GCP, and GitHub; automate drift notification webhooks.
- **Dependencies:** Cloud API IAM roles (AWS AssumeRole, Azure App Registration).
- **Files Affected:** `server/connectors/`, `server/services/TelemetryIngestionPipeline.ts`, `server/services/ContinuousComplianceEngine.ts`.
- **Services Involved:** `TelemetryIngestionPipeline`, `ContinuousComplianceEngine`, `OutboxBrokerService`.
- **Database Changes:** Add `cloud_connectors`, `drift_alert_subscriptions` tables.
- **APIs Affected:** `/api/v1/connectors/aws/sync`, `/api/v1/connectors/github/sync`, `/api/v1/telemetry/drift-alerts`.
- **UI Impacts:** Cloud connector configuration cards in `ContinuousEvidenceWorkspace.tsx`; drift alert subscription drawer.
- **Validation Tests:** `scripts/validatePhase12ContinuousCompliance.ts`.
- **Acceptance Criteria:** Automated daily scan pulls AWS Security Hub findings and GitHub branch protection status, binding them directly to Annex A controls with SHA-256 evidence digests.
- **Risk & Mitigation:** Excessive cloud API polling costs; mitigated via scheduled batch polling (every 6 or 24 hours).
- **Owner Persona:** Cloud Security Architect.
- **Estimated Complexity:** High.

---

#### PHASE E — CUSTOMER EXPERIENCE & WORKSPACE POLISH (Weeks 9–10)

- **Objective:** Implement URL search parameter binding (`useSearchParams`), user-saved filter presets, and persistent table state across all workspaces.
- **Dependencies:** Phase D completed.
- **Files Affected:** `src/components/grc/MappingExplorer.tsx`, `src/components/workspaces/ControlsEvidenceWorkspace.tsx`, `src/components/common/StandardCards.tsx`.
- **Services Involved:** `grcNavigationService`.
- **Database Changes:** Add `user_saved_views` table.
- **APIs Affected:** `/api/v1/users/saved-views`.
- **UI Impacts:** "Save View" button on table headers; deep-linkable URLs with active filters; breadcrumb navigation restoration.
- **Validation Tests:** `scripts/validateCommandCentreNavigation.ts`, `scripts/validatePhase8EnterpriseUsability.ts`.
- **Acceptance Criteria:** Users can share exact table views (including active filters, sorting, and pagination) via URL. Navigating between workspaces preserves filter state.
- **Risk & Mitigation:** URL parameter length blowout; mitigated by compact parameter encoding.
- **Owner Persona:** UI/UX Lead.
- **Estimated Complexity:** Low-Medium.

---

#### PHASE F — AI GOVERNANCE & SOURCE PROVENANCE (Weeks 11–12)

- **Objective:** Harden AI Copilot source citation drill-downs, confidence calibration, and mandatory human sign-off audit trails.
- **Dependencies:** Gemini GenAI client.
- **Files Affected:** `server/services/PolicyGovernanceEngine.ts`, `src/components/ai/AICopilotWidget.tsx`, `server/geminiAiChatRoutes.ts`.
- **Services Involved:** `PolicyGovernanceEngine`, `OrganizationalDiscoveryEngine`.
- **Database Changes:** Add `ai_audit_logs` table recording model version, prompt hash, confidence score, source document IDs, and human approver ID.
- **APIs Affected:** `/api/v1/ai/generate-policy`, `/api/v1/ai/explain-risk`.
- **UI Impacts:** Interactive source badge popup showing exact clause references and confidence level; mandatory "Approve as Authoritative" modal.
- **Validation Tests:** `scripts/validatePhase14PolicyLifecycle.ts`.
- **Acceptance Criteria:** AI output explicitly displays sources and confidence score; AI output cannot be marked `AUTHORITATIVE` or `PUBLISHED` without human signature.
- **Risk & Mitigation:** Hallucinated statutory references; mitigated by strict RAG grounding against `standardsKnowledgeService.ts`.
- **Owner Persona:** AI Governance Architect / Privacy Architect.
- **Estimated Complexity:** Medium.

---

#### PHASE G — PERFORMANCE & BUNDLE OPTIMIZATION (Weeks 13–14)

- **Objective:** Code-split client bundle, reducing entry chunk size below 600 kB; virtualize large data tables (500+ rows).
- **Dependencies:** Vite, Rollup configuration.
- **Files Affected:** `src/App.tsx`, `vite.config.ts`, `src/components/ui/premium/PremiumTable.tsx`.
- **Services Involved:** Frontend build pipeline.
- **Database Changes:** None.
- **APIs Affected:** None.
- **UI Impacts:** Smooth route transitions with skeleton loaders; instantaneous scrolling on 1,000+ item evidence lists.
- **Validation Tests:** Production build audit (`npm run build`), Lighthouse performance score > 90.
- **Acceptance Criteria:** Total initial JavaScript load reduced from 14.2 MB to < 1.2 MB total (initial entry chunk < 600 kB gzip). Zero visual regressions.
- **Risk & Mitigation:** Dynamic import chunk loading flicker; mitigated by tailored `Suspense` skeleton placeholders.
- **Owner Persona:** Senior Full-Stack Engineer.
- **Estimated Complexity:** Medium.

---

#### PHASE H — MARKET LAUNCH & CUSTOMER TRUST CENTER (Weeks 15–16)

- **Objective:** Launch public Customer Trust Center (`trust.skanda.io`); release automated SOC 2 / ISO 27001 readiness reports; initiate commercial customer pilots.
- **Dependencies:** All prior phases completed.
- **Files Affected:** `src/components/trust/`, `src/services/presentationDeckGenerator.ts`, `docs/skanda_trust_architecture.md`.
- **Services Involved:** `AuditorDigitalBinderService`, `DisasterRecoveryService`.
- **Database Changes:** Add `trust_center_configs`, `nda_attestation_requests` tables.
- **APIs Affected:** `/api/v1/trust/overview`, `/api/v1/trust/request-access`.
- **UI Impacts:** Public-facing Trust Center portal displaying real-time security posture, subprocessors, compliance badges, and automated NDA gating.
- **Validation Tests:** `scripts/validatePhase10EnterpriseLaunch.ts`.
- **Acceptance Criteria:** Enterprise prospects can self-serve standard security documentation under click-wrap NDA; customer auditors can verify real-time platform assurance.
- **Risk & Mitigation:** Unintentional exposure of confidential architecture; mitigated by strict public vs. NDA-gated asset classification.
- **Owner Persona:** CISO / Commercial Director.
- **Estimated Complexity:** Medium.

---

### Roadmap Summary Timeline & Milestones

| Milestone Target | Phase Focus | Key Deliverable | Exit Criteria |
|---|---|---|---|
| **Month 1** | Phases A & B | Production DB & SCIM 2.0 Identity | Clustered PostgreSQL mandatory in prod; SCIM JIT lifecycle validated. |
| **Month 2** | Phases C & D | Stripe Billing & Agentless Cloud Telemetry | Live subscription webhook reconciliation; AWS/Azure telemetry ingestion. |
| **Month 3** | Phases E & F | UX Deep Linking & Source-Grounded AI | Persistent URL search params; AI confidence drill-downs & approval gates. |
| **Month 4** | Phases G & H | Code Splitting & Public Trust Center | Entry bundle < 600 kB; public Trust Center live; commercial launch. |
