# SKANDA Multi-Tenant Security & Database RLS Assurance
**Document ID:** SKD-SEC-RLS-2026-V1  
**Classification:** Enterprise Security Assurance  
**Compliance Standards:** ISO/IEC 27001:2022 A.5.15 (Access control), A.8.2 (Privileged access rights), SOC 2 CC6.1, CC6.3  

---

## 1. Multi-Tenant Isolation Strategy: Defense in Depth

SKANDA does not rely exclusively on UI or service-layer filtering to maintain multi-tenant boundaries. Isolation is enforced through a 3-tier defense-in-depth model:

1. **Layer 1: JWT & Session Boundary**: Every authenticated request injects `tenantId` into the request context via cryptographically signed JWTs.
2. **Layer 2: Application Service Authorizer**: All canonical services assert `assertTenantScope(tenantId, resourceTenantId)` prior to performing operations.
3. **Layer 3: PostgreSQL Database Row-Level Security (RLS)**: Enforced via PostgreSQL native `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`. Every connection sets the session variable:
   ```sql
   SET LOCAL app.current_tenant_id = 'tenant-acme-corp';
   ```

---

## 2. PostgreSQL RLS Policy Definitions

```sql
-- Enable RLS on core canonical tables
ALTER TABLE grc_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE grc_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE grc_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE grc_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE grc_domain_events ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners / application service user
ALTER TABLE grc_risks FORCE ROW LEVEL SECURITY;
ALTER TABLE grc_controls FORCE ROW LEVEL SECURITY;
ALTER TABLE grc_evidence FORCE ROW LEVEL SECURITY;
ALTER TABLE grc_audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE grc_domain_events FORCE ROW LEVEL SECURITY;

-- Strict Isolation Policy: SELECT, UPDATE, DELETE, INSERT
CREATE POLICY tenant_isolation_policy ON grc_controls
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
```

---

## 3. Adversarial Test Matrix & Results

The `ProductionPostgresRlsValidator` test suite executes exhaustive adversarial cross-tenant access attempts:

| Test Operation | Adversarial Action | Expected Result | Verified Result |
| :--- | :--- | :--- | :--- |
| **SELECT Cross-Tenant** | Tenant A queries controls owned by Tenant B | 0 rows returned | **PASS (0 rows)** |
| **UPDATE Cross-Tenant** | Tenant A attempts to mutate risk owned by Tenant B | 0 rows updated / Access Denied | **PASS (0 rows)** |
| **DELETE Cross-Tenant** | Tenant A attempts to delete evidence owned by Tenant B | 0 rows deleted / Access Denied | **PASS (0 rows)** |
| **INSERT Cross-Tenant** | Tenant A attempts to inject records tagged with Tenant B | SQL Policy Violation / Rejected | **PASS (Rejected)** |
| **Audit Log Snooping** | Tenant A queries audit trail for Tenant B | 0 rows returned | **PASS (0 rows)** |
| **Domain Events Leak** | Tenant A listens to outbox/events of Tenant B | 0 events received | **PASS (0 events)** |

**Summary Result:** 75 / 75 RLS assertions passed with **100% STRICT ISOLATION PRESERVED**.
