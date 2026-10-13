-- ============================================================================
-- SKANDA ENTERPRISE GRC: POLICY GOVERNANCE & INTELLIGENCE SCHEMA (MIGRATION 005)
-- Path: server/db/migrations/005_enterprise_policy_governance.sql
-- 
-- Defines canonical tables for Enterprise Policy Governance & Continuous Assurance:
-- 1. policy_documents (Policy 360 master table, lifecycle, owners, review cadence)
-- 2. policy_versions (Immutable version ledger, canonical content, SHA-256 seal)
-- 3. policy_approval_rules (Configurable tenant approval matrix by domain & document type)
-- 4. policy_approval_decisions (Auditable approval sign-off ledger with Segregation of Duties)
-- 5. policy_acknowledgement_campaigns (Mandatory policy acknowledgement campaigns)
-- 6. policy_acknowledgement_records (HMAC-signed employee electronic signatures)
-- 7. policy_implementation_plans (Operational tasks linking policy requirements to owners)
-- 8. policy_expected_evidence_specs (Expected evidence artifacts, harvesting cadences)
-- 9. policy_governance_review_tasks (Review tasks triggered by regulatory change, watchdog, or incident)
-- 10. policy_conflicts_and_drifts (Detected contradictions, outdated frameworks, control drift)
-- 11. Row-Level Security (RLS) enforcement per tenant
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. POLICY DOCUMENTS MASTER REGISTER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_documents (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL, -- POLICY, PROCEDURE, SOP, STANDARD, GUIDELINE, WORK_INSTRUCTION
  department_id VARCHAR(64),
  department_name VARCHAR(128),
  process_id VARCHAR(64),
  process_name VARCHAR(128),
  framework_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_version VARCHAR(32) NOT NULL DEFAULT '1.0.0-DRAFT',
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- DRAFT, IN_REVIEW, PENDING_APPROVAL, APPROVED, PUBLISHED, SUPERSEDED, ARCHIVED, WITHDRAWN, IMPACTED_BY_CHANGE
  owner_email VARCHAR(255) NOT NULL,
  owner_role VARCHAR(128) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_role VARCHAR(128) NOT NULL,
  review_cadence VARCHAR(32) NOT NULL DEFAULT 'ANNUAL', -- ANNUAL, SEMI_ANNUAL, QUARTERLY, BIENNIAL
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ NOT NULL,
  review_status VARCHAR(32) NOT NULL DEFAULT 'CURRENT', -- CURRENT, DUE_SOON, OVERDUE, REVIEW_BLOCKED
  effective_date TIMESTAMPTZ,
  content JSONB NOT NULL,
  linked_control_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_risk_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  mandatory_acknowledgement BOOLEAN NOT NULL DEFAULT true,
  acknowledgement_campaign_id VARCHAR(64),
  acknowledgement_rate INT NOT NULL DEFAULT 0,
  implementation_plan_id VARCHAR(64),
  implementation_score INT NOT NULL DEFAULT 0,
  sha256_digest VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_policy_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_policy_docs_tenant ON policy_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_docs_status ON policy_documents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_policy_docs_review ON policy_documents(tenant_id, next_review_date);

-- ----------------------------------------------------------------------------
-- 2. POLICY VERSIONS (IMMUTABLE WORM-STYLE REVISION LEDGER)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_versions (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
  version VARCHAR(32) NOT NULL,
  change_summary TEXT NOT NULL,
  changed_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  reason_for_change TEXT NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_role VARCHAR(128) NOT NULL,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  sha256_digest VARCHAR(64) NOT NULL,
  effective_date TIMESTAMPTZ,
  canonical_content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_policy_version_record UNIQUE (document_id, version)
);

CREATE INDEX IF NOT EXISTS idx_policy_versions_doc ON policy_versions(document_id, version);

-- ----------------------------------------------------------------------------
-- 3. POLICY APPROVAL MATRIX RULES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_approval_rules (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type VARCHAR(32) NOT NULL,
  department_domain VARCHAR(64) NOT NULL, -- SECURITY, HR, IT, PRIVACY, AI, FINANCE, LEGAL, GLOBAL
  authorized_approver_role VARCHAR(128) NOT NULL,
  authorized_approver_email VARCHAR(255),
  escalation_approver_role VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_approval_rules_tenant ON policy_approval_rules(tenant_id, document_type, department_domain);

-- ----------------------------------------------------------------------------
-- 4. POLICY APPROVAL DECISIONS (AUDIT TRAIL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_approval_decisions (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
  document_version VARCHAR(32) NOT NULL,
  approver_email VARCHAR(255) NOT NULL,
  approver_role VARCHAR(128) NOT NULL,
  decision VARCHAR(32) NOT NULL, -- APPROVED, REJECTED, CONDITIONAL
  comments TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version_sha256_digest VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_policy_approval_decisions ON policy_approval_decisions(document_id, decided_at DESC);

-- ----------------------------------------------------------------------------
-- 5. POLICY ACKNOWLEDGEMENT CAMPAIGNS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_acknowledgement_campaigns (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
  document_code VARCHAR(64) NOT NULL,
  document_title VARCHAR(255) NOT NULL,
  document_version VARCHAR(32) NOT NULL,
  target_scope VARCHAR(32) NOT NULL DEFAULT 'ALL_EMPLOYEES',
  target_department_id VARCHAR(64),
  target_role VARCHAR(128),
  due_date TIMESTAMPTZ NOT NULL,
  total_required INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  viewed_count INT NOT NULL DEFAULT 0,
  acknowledged_count INT NOT NULL DEFAULT 0,
  overdue_count INT NOT NULL DEFAULT 0,
  exempted_count INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_ack_campaigns ON policy_acknowledgement_campaigns(tenant_id, document_id, status);

-- ----------------------------------------------------------------------------
-- 6. POLICY ACKNOWLEDGEMENT RECORDS (HMAC-SEALED ELECTRONIC SIGNATURES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_acknowledgement_records (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id VARCHAR(64) NOT NULL REFERENCES policy_acknowledgement_campaigns(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
  document_version VARCHAR(32) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(128) NOT NULL,
  department VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACKNOWLEDGED',
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method VARCHAR(64) NOT NULL DEFAULT 'ELECTRONIC_SIGNATURE',
  ip_address VARCHAR(64),
  audit_signature VARCHAR(64) NOT NULL,
  CONSTRAINT uq_policy_user_campaign_ack UNIQUE (campaign_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_policy_ack_records_campaign ON policy_acknowledgement_records(campaign_id);
CREATE INDEX IF NOT EXISTS idx_policy_ack_records_user ON policy_acknowledgement_records(tenant_id, user_email);

-- ----------------------------------------------------------------------------
-- 7. POLICY IMPLEMENTATION PLANS & TASKS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_implementation_plans (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
  document_code VARCHAR(64) NOT NULL,
  document_title VARCHAR(255) NOT NULL,
  overall_score INT NOT NULL DEFAULT 20,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'PLANNED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_impl_plans ON policy_implementation_plans(tenant_id, document_id);

-- ----------------------------------------------------------------------------
-- 8. EXPECTED EVIDENCE SPECIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_expected_evidence_specs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
  control_code VARCHAR(64) NOT NULL,
  evidence_title VARCHAR(255) NOT NULL,
  owner_role VARCHAR(128) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  generation_cadence VARCHAR(32) NOT NULL DEFAULT 'ANNUAL',
  retention_days INT NOT NULL DEFAULT 365,
  harvest_method VARCHAR(64) NOT NULL DEFAULT 'MANUAL_UPLOAD',
  current_availability VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
  last_harvested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_evidence_specs ON policy_expected_evidence_specs(tenant_id, document_id);

-- ----------------------------------------------------------------------------
-- 9. GOVERNANCE REVIEW TASKS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_governance_review_tasks (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
  document_code VARCHAR(64) NOT NULL,
  trigger_type VARCHAR(64) NOT NULL, -- REGULATORY_CHANGE, SCHEDULED_CADENCE, INCIDENT_OCCURRED, CONTROL_TEST_FAILED, AUDIT_FINDING
  trigger_source TEXT NOT NULL,
  responsible_owner VARCHAR(255) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  relevant_evidence_specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposed_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
  approval_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING_REVIEW',
  closure_decision TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_review_tasks ON policy_governance_review_tasks(tenant_id, status);

-- ----------------------------------------------------------------------------
-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_approval_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgement_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_implementation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_expected_evidence_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_governance_review_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_docs_tenant_isolation ON policy_documents;
CREATE POLICY policy_docs_tenant_isolation ON policy_documents
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_versions_tenant_isolation ON policy_versions;
CREATE POLICY policy_versions_tenant_isolation ON policy_versions
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_approval_rules_tenant_isolation ON policy_approval_rules;
CREATE POLICY policy_approval_rules_tenant_isolation ON policy_approval_rules
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_approval_decisions_tenant_isolation ON policy_approval_decisions;
CREATE POLICY policy_approval_decisions_tenant_isolation ON policy_approval_decisions
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_ack_campaigns_tenant_isolation ON policy_acknowledgement_campaigns;
CREATE POLICY policy_ack_campaigns_tenant_isolation ON policy_acknowledgement_campaigns
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_ack_records_tenant_isolation ON policy_acknowledgement_records;
CREATE POLICY policy_ack_records_tenant_isolation ON policy_acknowledgement_records
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_impl_plans_tenant_isolation ON policy_implementation_plans;
CREATE POLICY policy_impl_plans_tenant_isolation ON policy_implementation_plans
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_evidence_specs_tenant_isolation ON policy_expected_evidence_specs;
CREATE POLICY policy_evidence_specs_tenant_isolation ON policy_expected_evidence_specs
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS policy_review_tasks_tenant_isolation ON policy_governance_review_tasks;
CREATE POLICY policy_review_tasks_tenant_isolation ON policy_governance_review_tasks
  FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_platform_admin())
  WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin());

-- ----------------------------------------------------------------------------
-- 11. STORAGE-LEVEL WORM IMMUTABILITY TRIGGER FOR HISTORICAL POLICY VERSIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_policy_version_mutation() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'WORM Violation: policy_versions records are strictly append-only and cannot be updated.';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'WORM Violation: policy_versions records are strictly append-only and cannot be deleted.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_worm_policy_versions ON policy_versions;
CREATE TRIGGER trg_worm_policy_versions
  BEFORE UPDATE OR DELETE ON policy_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_policy_version_mutation();

