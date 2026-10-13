-- ============================================================================
-- SKANDA POSTGRESQL ROW-LEVEL SECURITY (RLS) POLICIES (MIGRATION 002)
-- Path: server/db/migrations/002_rls_policies.sql
-- 
-- Enforces absolute database-level multi-tenant isolation.
-- Guarantees that Tenant A cannot SELECT, INSERT, UPDATE, or DELETE records
-- belonging to Tenant B, even in the presence of application-level bugs.
--
-- Session Context Variables:
--   SET LOCAL app.current_tenant_id = '<tenant_uuid>';
--   SET LOCAL app.is_platform_admin = 'false'; -- or 'true' for superadmin operations
-- ============================================================================

-- Function to safely extract tenant_id from session context
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if the session is authenticated as Platform Admin
CREATE OR REPLACE FUNCTION is_platform_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.is_platform_admin', true) = 'true';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- ----------------------------------------------------------------------------
-- 1. TENANTS TABLE RLS
-- ----------------------------------------------------------------------------
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_self_isolation_select ON tenants;
CREATE POLICY tenant_self_isolation_select ON tenants
  FOR SELECT
  USING (
    id = get_current_tenant_id()
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS tenant_self_isolation_mod ON tenants;
CREATE POLICY tenant_self_isolation_mod ON tenants
  FOR ALL
  USING (
    id = get_current_tenant_id()
    OR is_platform_admin()
  )
  WITH CHECK (
    id = get_current_tenant_id()
    OR is_platform_admin()
  );

-- ----------------------------------------------------------------------------
-- 2. ENTERPRISE STRUCTURE (ORGANIZATIONS, BUSINESS UNITS, ASSETS, VENDORS)
-- ----------------------------------------------------------------------------

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS organizations_tenant_isolation ON organizations;
CREATE POLICY organizations_tenant_isolation ON organizations
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Business Units
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_units FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_units_tenant_isolation ON business_units;
CREATE POLICY business_units_tenant_isolation ON business_units
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assets_tenant_isolation ON assets;
CREATE POLICY assets_tenant_isolation ON assets
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vendors_tenant_isolation ON vendors;
CREATE POLICY vendors_tenant_isolation ON vendors
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- ----------------------------------------------------------------------------
-- 3. COMPLIANCE PROGRAMS & GOVERNANCE
-- ----------------------------------------------------------------------------

-- Compliance Programs
ALTER TABLE compliance_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_programs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS compliance_programs_tenant_isolation ON compliance_programs;
CREATE POLICY compliance_programs_tenant_isolation ON compliance_programs
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Tenant Control Implementations
ALTER TABLE tenant_control_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_control_implementations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_controls_isolation ON tenant_control_implementations;
CREATE POLICY tenant_controls_isolation ON tenant_control_implementations
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Control Tests
ALTER TABLE control_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_tests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS control_tests_tenant_isolation ON control_tests;
CREATE POLICY control_tests_tenant_isolation ON control_tests
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- ----------------------------------------------------------------------------
-- 4. EVIDENCE & EVIDENCE ASSERTIONS
-- ----------------------------------------------------------------------------

-- Evidence
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS evidence_tenant_isolation ON evidence;
CREATE POLICY evidence_tenant_isolation ON evidence
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Evidence Assertions
ALTER TABLE evidence_assertions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_assertions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS evidence_assertions_tenant_isolation ON evidence_assertions;
CREATE POLICY evidence_assertions_tenant_isolation ON evidence_assertions
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- ----------------------------------------------------------------------------
-- 5. RISKS, AUDITS, FINDINGS & CAPA
-- ----------------------------------------------------------------------------

-- Risks
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS risks_tenant_isolation ON risks;
CREATE POLICY risks_tenant_isolation ON risks
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Audits
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audits_tenant_isolation ON audits;
CREATE POLICY audits_tenant_isolation ON audits
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Findings
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS findings_tenant_isolation ON findings;
CREATE POLICY findings_tenant_isolation ON findings
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- CAPA
ALTER TABLE capa ENABLE ROW LEVEL SECURITY;
ALTER TABLE capa FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS capa_tenant_isolation ON capa;
CREATE POLICY capa_tenant_isolation ON capa
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- ----------------------------------------------------------------------------
-- 6. EXCEPTIONS & WORKFLOW TASKS
-- ----------------------------------------------------------------------------

-- Exceptions
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS exceptions_tenant_isolation ON exceptions;
CREATE POLICY exceptions_tenant_isolation ON exceptions
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Workflow Tasks
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_tasks_tenant_isolation ON workflow_tasks;
CREATE POLICY workflow_tasks_tenant_isolation ON workflow_tasks
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- ----------------------------------------------------------------------------
-- 7. AUDIT LOGS & TRANSACTIONAL OUTBOX
-- ----------------------------------------------------------------------------

-- Audit Logs (Write and Read restricted by Tenant)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- Outbox Events
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS outbox_events_tenant_isolation ON outbox_events;
CREATE POLICY outbox_events_tenant_isolation ON outbox_events
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- ============================================================================
-- END OF MIGRATION 002
-- ============================================================================
