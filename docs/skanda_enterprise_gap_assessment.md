# SKANDA Enterprise SaaS Gap Assessment
## Prioritized Enterprise Architecture, Security, Persistence & Assurance Gaps

**Document Reference:** `SKD-GAP-ASS-001`  
**Classification:** Enterprise Strategic / CISO & CTO Grade  
**Assessment Date:** October 8, 2026  
**Auditor Personas:** Chief Enterprise Architect, SaaS Security Architect, CISO, Head of Product  
**Severity Framework:**  
- **P0 — Production Blocker:** Critical architectural, data loss, or security issue that halts commercial multi-tenant production launch.
- **P1 — Enterprise Blocker:** Required by Fortune 500, regulated banks, or external audit bodies before enterprise procurement sign-off.
- **P2 — Important Enhancement:** High-value product, automation, or integration capability needed for standard operational excellence.
- **P3 — Optimization:** Code volume reduction, bundle size optimization, or UX polish.

---

### 1. Gap Summary Register

| Gap ID | Domain | Severity | Title | Current State | Target State | Impact | Owner Persona |
|---|---|---|---|---|---|---|---|
| **GAP-001** | Database | **P0** | Live Managed PostgreSQL Production Enforcement | Dual driver runs in fallback mode when PG credentials are not provisioned in local sandbox. | Mandatory clustered PostgreSQL with active connection pooling (`pg.Pool`), RLS enforcement, and no in-memory data fallback in production tier. | Potential loss of state on container restart if PG is omitted in prod. | Cloud Security / DB Architect |
| **GAP-002** | Security | **P0** | Production Secrets & KMS Integration | Secrets loaded via `.env` file during local development. | Cloud KMS / AWS Secrets Manager / HashiCorp Vault dynamic secret injection with automatic rotation. | Risk of credential leakage in production container images. | DevSecOps Architect |
| **GAP-003** | Performance | **P1** | Frontend Client Bundle Chunking & Lazy Loading | Single bundled JavaScript output is ~14.2 MB minified (~3.4 MB gzip), triggering Vite chunk size warnings. | Dynamic route-level code splitting (`React.lazy()`) for heavy workspaces (D3 heatmaps, Recharts, PPTXGen, JSPDF). | Increased initial load time on mobile or restricted bandwidth networks. | Senior Full-Stack Engineer |
| **GAP-004** | Commercial | **P1** | Live Stripe / Payment Gateway Webhook Reconciliation | Plan tiers and entitlement matrices exist in `saasTypes.ts`, but payment webhooks are simulated. | Automated Stripe billing webhook listener updating tenant entitlement flags, invoice generation, and tier upgrade/downgrade. | Inability to accept automated self-serve or enterprise credit card subscriptions. | Enterprise Product Strategist |
| **GAP-005** | Identity | **P1** | SCIM 2.0 Inbound User Provisioning API | SAML 2.0 & OIDC federated SSO are validated, but automated SCIM user lifecycle endpoints are deferred. | Full SCIM 2.0 endpoint (`/api/scim/v2/Users`, `/api/scim/v2/Groups`) supporting automated Okta/Entra ID Joiner/Mover/Leaver sync. | Manual user onboarding required for enterprise IT admins with 1,000+ users. | SaaS Security Architect |
| **GAP-006** | Integration | **P2** | Automated Cloud Telemetry Ingestion Connectors | Real-time telemetry pipeline accepts sensor JSON payloads, but AWS/Azure cloud connectors require manual API triggers. | Pre-built agentless cloud connectors for AWS Security Hub, Azure Defender, GCP Security Command Center, and GitHub. | Manual evidence upload or scripted telemetry required for infrastructure controls. | Cloud Security Architect |
| **GAP-007** | Assurance | **P2** | External Certified Auditor Digital Clean Room Portal | Clean room UI exists with read-only controls, but requires explicit custom credential provisioning. | Time-bound, self-contained Auditor Guest Magic Links with fine-grained watermarking, immutable view logs, and export controls. | Friction during external Stage 1 & Stage 2 third-party audit sessions. | Lead ISO Auditor |
| **GAP-008** | Observability | **P2** | Distributed OpenTelemetry Tracing Integration | Telemetry service logs performance and errors, but lacks end-to-end distributed tracing spans. | OpenTelemetry (OTel) instrumentation sending traces and metrics to Datadog / Grafana Tempo / AWS X-Ray. | Increased Mean Time to Resolution (MTTR) for complex cross-service transactions. | SaaS Reliability Architect |
| **GAP-009** | UX / Product | **P3** | Saved Views & User Filter Presets in Workspaces | Complex multi-filter tables (Mapping Explorer, Controls Library) reset on navigation. | Persistent URL query parameter binding (`useSearchParams`) and user-saved view bookmarks in localStorage/DB. | Users must re-apply complex filters upon re-entering workspaces. | UI/UX Lead |
| **GAP-010** | Continuous CCM | **P3** | Automated Webhook Notifications for Control Drift | Drift HUD detects drift locally, but email/Slack/Teams dispatch requires explicit trigger. | Automated webhook notification broker dispatching Slack/Teams/Email alerts immediately upon control score drop below threshold. | Delayed stakeholder awareness of out-of-band configuration drift. | DevSecOps Lead |

---

### 2. Deep-Dive Remediation Analysis for P0 & P1 Gaps

#### 2.1 GAP-001 (P0): Live Managed PostgreSQL Production Enforcement
- **Root Cause:** To ensure rapid developer onboarding and sandbox usability, `iso27001PostgresService.ts` and `continuousComplianceDb.ts` were designed with graceful memory/JSON fallbacks.
- **Architectural Risk:** In high-concurrency enterprise deployments with multiple container replicas, in-memory state leads to split-brain data anomalies and loss of tenant audit records.
- **Target Specification:**
  1. Add strict environment check in `server.ts`: If `NODE_ENV === 'production'`, database initialization must fail fast if `DATABASE_URL` is missing or unreachable.
  2. Maintain automated migration verification script `scripts/migrateJsonToPostgres.ts` as a mandatory pre-flight deployment check.
  3. Validate active connection pooling (`pg.Pool` with `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`).

#### 2.2 GAP-002 (P0): Production Secrets & KMS Integration
- **Root Cause:** Development workflows utilize local `.env` files for database URLs and JWT secrets.
- **Architectural Risk:** Accidental leakage of static secrets into container images or logs violates ISO 27001 Control A.8.24 and SOC 2 CC6.1.
- **Target Specification:**
  1. Implement cloud secret provider abstraction in `server/config/secrets.ts`.
  2. Support AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault dynamic retrieval at runtime.
  3. Prohibit raw secret logging; redact all sensitive tokens in error handlers and telemetry streams.

#### 2.3 GAP-003 (P1): Frontend Client Bundle Chunking & Lazy Loading
- **Root Cause:** Heavy client-side libraries (`pptxgenjs`, `jspdf`, `html2canvas`, `d3`, `recharts`) and 40+ workspace modules are currently imported synchronously in `src/App.tsx`.
- **Architectural Risk:** 14.2 MB bundle size creates high Time-to-Interactive (TTI) on remote mobile connections or restricted enterprise proxies.
- **Target Specification:**
  1. Implement `React.lazy()` for all non-essential route workspaces:
     ```tsx
     const RiskWorkspace = React.lazy(() => import('./components/workspaces/RiskWorkspace'));
     const ExecutivePresentationModal = React.lazy(() => import('./components/presentation/ExecutivePresentationModal'));
     const D3RiskHeatmapChart = React.lazy(() => import('./components/risk/D3RiskHeatmapChart'));
     ```
  2. Configure `vite.config.ts` Rollup manual chunks:
     ```ts
     manualChunks: {
       'vendor-react': ['react', 'react-dom'],
       'vendor-charts': ['recharts', 'd3'],
       'vendor-export': ['jspdf', 'pptxgenjs', 'html2canvas'],
       'vendor-icons': ['lucide-react']
     }
     ```
  3. Reduce main entry chunk size below 600 kB.

#### 2.4 GAP-004 (P1): Live Stripe / Payment Gateway Webhook Reconciliation
- **Root Cause:** Commercial entitlement engine (`saasTypes.ts`, `EnterpriseSaaSHub.tsx`) was modeled from an architectural perspective before payment processor integration.
- **Architectural Risk:** Commercial self-service customers cannot execute instant credit card checkout or automated monthly invoice charging.
- **Target Specification:**
  1. Create `/api/v1/billing/webhook` endpoint with Stripe signature verification (`stripe.webhooks.constructEvent`).
  2. Handle events: `customer.subscription.created`, `customer.subscription.updated`, `invoice.payment_succeeded`, `invoice.payment_failed`.
  3. Automatically mutate tenant entitlements (`maxUsers`, `maxControls`, `allowedFrameworks`, `aiTokensPerMonth`) in PostgreSQL.

#### 2.5 GAP-005 (P1): SCIM 2.0 Inbound User Provisioning API
- **Root Cause:** User lifecycle management currently occurs via UI administration (`SettingsUsersModule.tsx`) or JIT provisioning during SAML SSO login.
- **Architectural Risk:** Large enterprises with 5,000+ staff cannot automate instant deprovisioning when employees depart the company, risking unauthorized access (ISO 27001 A.6.5 violation).
- **Target Specification:**
  1. Implement RFC 7643 / RFC 7644 SCIM 2.0 endpoints:
     - `GET /scim/v2/Users`
     - `POST /scim/v2/Users`
     - `PUT /scim/v2/Users/{id}`
     - `PATCH /scim/v2/Users/{id}` (supporting `active: false` deactivation)
     - `DELETE /scim/v2/Users/{id}`
  2. Secure with tenant-scoped SCIM Bearer Tokens with expiration and audit logging.

---

### 3. Gap Prioritization Matrix

```
       HIGH IMPACT
            |
            |   [GAP-001] Live PG Prod Enforce (P0)
            |   [GAP-002] Secrets & KMS (P0)
            |   [GAP-003] Bundle Code-Splitting (P1)
            |   [GAP-004] Stripe Billing Webhooks (P1)
            |   [GAP-005] SCIM 2.0 Lifecycle (P1)
            |
            |   [GAP-006] Agentless Cloud Telemetry (P2)
            |   [GAP-007] Auditor Clean Room Magic Links (P2)
            |   [GAP-008] Distributed OTel Tracing (P2)
            |
            |   [GAP-009] Saved Filter Presets (P3)
            |   [GAP-010] Drift Webhook Notifications (P3)
            |
 LOW IMPACT +---------------------------------------- HIGH EFFORT
```

---

### 4. Enterprise Gap Assessment Conclusion

All identified gaps are **engineering productization and operational hardening steps**, not architectural flaws. The core canonical graph, tenant isolation mechanisms, evidence cryptography, and assurance calculation logic are sound, proven, and fully validated. Executing the P0 and P1 remediations will elevate SKANDA from an Enterprise Beta state into a commercially unstoppable production SaaS platform.
