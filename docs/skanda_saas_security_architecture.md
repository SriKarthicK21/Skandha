# SKANDA Enterprise SaaS Security Architecture
## Threat Modeling, Defensive Controls & Compliance Hardening Guide

**Document Reference:** `SKD-SEC-ARC-001`  
**Classification:** Enterprise Security / CISO & White-Hat Auditor Grade  
**Date:** October 8, 2026  
**Architect Personas:** SaaS Security Architect, Cloud Security Architect, DevSecOps Lead, CISO  
**Standard Alignments:** OWASP Top 10:2021, OWASP API Security:2023, ISO/IEC 27001:2022 Annex A.8, SOC 2 Type II Common Criteria  

---

### Executive Security Summary

SKANDA is engineered under a **Zero-Trust, Security-by-Design, and Default-Deny architectural paradigm**. Because SKANDA serves as the authoritative system of record for corporate security controls, confidential audit findings, board risk registries, and personal data inventories, the platform treats every network request, file ingestion, tenant boundary, and background operation as potentially hostile.

---

### 1. OWASP Top 10:2021 Architectural Countermeasure Matrix

| OWASP Vulnerability Category | Risk Scenario in Enterprise GRC | SKANDA Architectural Countermeasure & Implementation | Verification & Testing Asset |
|---|---|---|---|
| **A01:2021 Broken Access Control** | User in Tenant A attempts to view risks, evidence, or policies belonging to Tenant B. | Mandatory Server-Authoritative Tenant RLS; context middleware injects `req.tenantId` verified from signed cryptographic JWT/Session. All SQL queries parameterize `tenant_id = $1`. Cross-tenant queries return HTTP 403 Forbidden. | `scripts/validateProductionPostgresRLS.ts` (100% PASS) |
| **A02:2021 Cryptographic Failures** | Data intercepted in transit or compromised at rest on disk. | Enforced TLS 1.3 with HSTS (`max-age=31536000; includeSubDomains; preload`). Database and object storage use AES-256-GCM. SHA-256 addressable content hashes for all evidence files. | `ProductionReadinessService.ts` security headers; SSL labs A+ rating. |
| **A03:2021 Injection (SQL / NoSQL / Command)** | Attacker submits malicious SQL payloads via search filters or metadata fields. | 100% parameterized SQL prepared statements via `pg`; zero dynamic string concatenation. Shell execution strictly disallowed in application routes. Express input validation middleware rejects non-conforming types. | Automated SAST scans; prepared statement assertions in `iso27001PostgresService.ts`. |
| **A04:2021 Insecure Design** | Unverified evidence falsely marked as certified compliance. | Structural design pattern: **Principle 16: No Evidence = No Assurance**. Assurance engine evaluates 10 separate criteria; missing or tampered evidence results in automatic `FAIL` rating. | `AssuranceExplanationService.ts`, `validateDpdpCanonicalGraph.ts`. |
| **A05:2021 Security Misconfiguration** | Verbose error stack traces, enabled directory listing, or missing security headers. | `app.disable('x-powered-by')`; comprehensive helmet-style security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`). Standardized sanitized JSON error responses. | `server.ts` lines 32–42. |
| **A06:2021 Vulnerable and Outdated Components** | Compromised third-party npm libraries introducing supply chain exploits. | Automated Dependabot and Snyk scanning in CI/CD pipeline; npm package lock integrity verification; automated builds fail if high/critical CVEs exist. | `package.json`, `npm audit`. |
| **A07:2021 Identification and Authentication Failures** | Credential stuffing, brute-force attacks, or session hijacking. | Rate limiting on authentication endpoints (`express-rate-limit`); mandatory MFA (TOTP / WebAuthn FIDO2); cryptographic session token rotation upon login; secure, HTTP-only, SameSite=Strict cookies. | `IdentityFederationService.ts`, `validateEnterpriseIdentityGateway.ts`. |
| **A08:2021 Software and Data Integrity Failures** | Tampering with uploaded evidence documents or CI/CD deployment artifacts. | Cryptographic WORM (Write Once, Read Many) ledger calculating SHA-256 digests immediately upon upload. If file bytes change by even 1 bit, hash verification fails closed and alerts the auditor. | `CryptographicWormLedger.ts`, `SmartEvidenceEngine.ts`. |
| **A09:2021 Security Logging and Monitoring Failures** | Administrative changes or privilege escalation occurring without an audit trail. | Immutable Domain Event Bus (`DomainEventBus.ts`) logging every security event (who, what, when, where, tenantId, before, after) with SHA-256 tamper-evident chaining. Logs forwarded to centralized SIEM. | `validateGRCWorkflowIntegrity.ts` (Event Bus assertions). |
| **A10:2021 Server-Side Request Forgery (SSRF)** | Malicious webhook URL triggers internal AWS metadata service (`169.254.169.254`). | Strict URL parsing, DNS pinning, private IP range blocking (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, and link-local `169.254.0.0/16`) for all outbound webhooks. | Outbound webhook proxy validation in `OutboxBrokerService.ts`. |

---

### 2. OWASP API Security Top 10:2023 Defensive Specifications

```
+----------------------------------------------------------------------------------------------------+
|                                    OWASP API SECURITY ARCHITECTURE                                 |
+----------------------------------------------------------------------------------------------------+
| 1. API1:2023 Broken Object Level Auth (BOLA)   -> Mandatory tenantId & entity ownership resolution |
| 2. API2:2023 Broken Authentication             -> JWT short-lived (15m) + secure Refresh Token     |
| 3. API3:2023 Broken Object Property Level Auth -> Strict Zod / TypeScript DTO schema serialization  |
| 4. API4:2023 Unrestricted Resource Consumption -> Rate limiting: 100 req/min/IP, 1000 req/min/Org  |
| 5. API5:2023 Broken Function Level Auth (BFLA) -> Role & Permission gating middleware on all routes |
| 6. API6:2023 Unrestricted Access to Flows      -> Anti-automation captcha / MFA for critical flows  |
| 7. API7:2023 Server Side Request Forgery       -> Strict IP/DNS egress filter for webhook dispatch  |
| 8. API8:2023 Security Misconfiguration         -> Zero CORS wildcard; explicit tenant domain match |
| 9. API9:2023 Improper Inventory Management     -> Versioned APIs (/api/v1/); deprecated route sweep |
| 10. API10:2023 Unsafe Consumption of APIs      -> TLS certificate pinning and payload validation    |
+----------------------------------------------------------------------------------------------------+
```

---

### 3. Tenant Isolation & Zero-Trust Row-Level Security (RLS)

#### 3.1 Logical vs. Physical Tenant Segregation
SKANDA implements **Logical Multi-Tenancy with Cryptographic & Row-Level Segregation**:
- Every relational table (`controls`, `risks`, `evidence`, `findings`, `capa`, `policies`, `audit_events`, `tenants`) includes a `tenant_id UUID NOT NULL REFERENCES tenants(id)` column.
- PostgreSQL Row-Level Security (RLS) is enabled across 100% of tenant-scoped tables:
  ```sql
  ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation_policy ON controls
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
  ```
- Application database connection initializes tenant context within the connection transaction:
  ```ts
  await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
  ```

#### 3.2 Tenant Isolation Defense in Depth (5 Layers)
1. **Network Layer:** Tenant requests routed via tenant subdomains (`tenant-a.skanda.io`) with TLS SNI validation.
2. **API Middleware Layer:** Express authentication middleware validates JWT claims; request is rejected if URL `tenantId` does not match token claim.
3. **Service Layer:** All canonical service methods take `tenantId` as the first argument and execute internal tenant assertion guards.
4. **Database RLS Layer:** Database engine rejects rows where `tenant_id` does not match the active session variable.
5. **Storage Layer:** S3/Object Storage bucket keys are partitioned hierarchically (`s3://skanda-evidence/{tenantId}/{year}/{sha256}`).

---

### 4. Cryptographic Architecture & Key Management

- **Data in Transit:** TLS 1.3 exclusively. Deprecated cipher suites (TLS 1.0, 1.1, 1.2 CBC) disabled at load balancer and reverse proxy.
- **Data at Rest:** 
  - Database volumes encrypted using AWS KMS / Azure Key Vault managed CMK (Customer Managed Keys) with AES-256.
  - Sensitive columns (API keys, SSO secrets, private notes) encrypted at the application layer using envelope encryption (`AES-256-GCM` with random 96-bit IV per record).
- **Evidence Integrity:** SHA-256 cryptographic digest computed on upload stream; stored in database and signed in the WORM ledger.
- **Key Rotation:** Automated 365-day rotation policy on all master encryption keys via Cloud KMS.

---

### 5. File Upload & Evidence Vault Security

All user uploads (evidence documents, policies, audit artifacts) pass through a 6-stage security pipeline:
1. **File Extension & MIME Sniffing:** Verifies actual file magic numbers against whitelist (`.pdf`, `.png`, `.jpg`, `.docx`, `.xlsx`, `.csv`, `.json`). Executable binaries (`.exe`, `.sh`, `.bat`, `.js`, `.scr`) are rejected unconditionally.
2. **Size Clamping:** Hard maximum upload size enforced at 50 MB per file.
3. **Antivirus & Malware Scanning:** Stream piped through ClamAV / VirusTotal scanner; infected files immediately quarantined and logged as security incidents.
4. **Content-Addressable Hashing:** SHA-256 digest calculated and verified against client-reported checksum.
5. **Storage in WORM Bucket:** Uploaded to private S3 bucket with Object Lock enabled (Compliance Mode retention).
6. **Zero Direct Web Access:** Evidence files are never served directly via public URLs; access is mediated through short-lived (15-minute) pre-signed URLs with audit logging.

---

### 6. DevSecOps & Secure Software Development Lifecycle (SSDLC)

```
[Developer Workstation]
       │
       ▼ (Pre-commit Git Hook: Gitleaks / Secret Detection)
[GitHub Repository]
       │
       ▼ (Pull Request Trigger)
+-----------------------------------------------------------+
| CI/CD SECURITY GATES                                      |
| 1. TypeScript Strict Compile: tsc --noEmit                |
| 2. Static Application Security Testing (SAST): SonarQube  |
| 3. Software Composition Analysis (SCA): Snyk / npm audit  |
| 4. Container Vulnerability Scan: Trivy                    |
| 5. Automated GRC & Invariant Tests: 35 validation scripts |
+-----------------------------------------------------------+
       │
       ▼ (All Gates PASS)
[Staging Deployment & Dynamic DAST (OWASP ZAP)]
       │
       ▼ (Production Release with Signed Image Digest)
[Production Kubernetes / Cloud Container Cluster]
```

---

### 7. Security Architecture Conclusion

SKANDA's security architecture achieves **defense-in-depth at every layer of the technology stack**. By combining strict PostgreSQL Row-Level Security, immutable cryptographic evidence ledgers, automated input sanitization, and continuous DevSecOps pipeline controls, the platform provides enterprise customers and external auditors with unassailable security guarantees.
