-- ============================================================================
-- SKANDA CANONICAL GRC ENTERPRISE SCHEMA (MIGRATION 001)
-- Path: server/db/migrations/001_canonical_schema.sql
-- 
-- Defines canonical GRC objects with UUID primary keys, foreign key constraints,
-- optimistic concurrency versioning, audit metadata, and soft deletion.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENTERPRISE HIERARCHY & MULTI-TENANCY
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code VARCHAR(64) UNIQUE NOT NULL, -- e.g. 'tenant-acme-corp'
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  industry_type VARCHAR(128) NOT NULL,
  country VARCHAR(64) NOT NULL,
  subscription_tier VARCHAR(64) DEFAULT 'ENTERPRISE',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  org_code VARCHAR(64) NOT NULL,
  legal_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  country VARCHAR(64) NOT NULL,
  industry VARCHAR(128) NOT NULL,
  scope_statement TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_org_code UNIQUE (tenant_id, org_code)
);

CREATE INDEX IF NOT EXISTS idx_organizations_tenant ON organizations(tenant_id);

CREATE TABLE IF NOT EXISTS business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  unit_code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  head_of_unit VARCHAR(255),
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_unit_code UNIQUE (tenant_id, unit_code)
);

CREATE INDEX IF NOT EXISTS idx_business_units_tenant ON business_units(tenant_id);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
  asset_code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(64) NOT NULL, -- CLOUD_RESOURCE, DATABASE, SERVER, APPLICATION, SAAS
  criticality VARCHAR(32) DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
  owner VARCHAR(255) NOT NULL,
  environment VARCHAR(32) DEFAULT 'PRODUCTION',
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_asset_code UNIQUE (tenant_id, asset_code)
);

CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets(tenant_id);

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  service_category VARCHAR(128) NOT NULL,
  tier VARCHAR(32) DEFAULT 'TIER_1', -- TIER_1 (Critical), TIER_2, TIER_3
  soc2_status VARCHAR(64) DEFAULT 'VALID_REPORT',
  dpa_executed BOOLEAN DEFAULT true,
  risk_rating VARCHAR(32) DEFAULT 'MEDIUM',
  owner VARCHAR(255) NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_vendor_code UNIQUE (tenant_id, vendor_code)
);

CREATE INDEX IF NOT EXISTS idx_vendors_tenant ON vendors(tenant_id);

-- ----------------------------------------------------------------------------
-- 2. COMPLIANCE PROGRAMS, FRAMEWORKS & REQUIREMENTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  program_code VARCHAR(64) NOT NULL, -- e.g. 'PROG-SEC-01'
  name VARCHAR(255) NOT NULL,
  program_type VARCHAR(64) NOT NULL, -- INFORMATION_SECURITY, PRIVACY_DATA_PROTECTION, AI_GOVERNANCE, etc.
  description TEXT,
  executive_sponsor VARCHAR(255) NOT NULL,
  program_lead VARCHAR(255) NOT NULL,
  framework_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  target_certification_date DATE,
  next_audit_date DATE,
  metrics JSONB DEFAULT '{}'::jsonb,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_program_code UNIQUE (tenant_id, program_code)
);

CREATE INDEX IF NOT EXISTS idx_compliance_programs_tenant ON compliance_programs(tenant_id);

CREATE TABLE IF NOT EXISTS frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_code VARCHAR(64) UNIQUE NOT NULL, -- e.g. 'ISO_27001_2022'
  name VARCHAR(255) NOT NULL,
  version_label VARCHAR(64) NOT NULL,
  description TEXT,
  total_requirements INT NOT NULL DEFAULT 0,
  is_global BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  framework_code VARCHAR(64) NOT NULL,
  requirement_code VARCHAR(64) NOT NULL, -- e.g. 'A.5.15'
  section VARCHAR(128) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  guidance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_framework_req_code UNIQUE (framework_code, requirement_code)
);

CREATE INDEX IF NOT EXISTS idx_requirements_framework ON requirements(framework_code);

-- ----------------------------------------------------------------------------
-- 3. GLOBAL CONTROLS, TENANT IMPLEMENTATIONS & CONTROL TESTING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS global_control_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_code VARCHAR(64) UNIQUE NOT NULL, -- e.g. 'CTRL-088'
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(64) NOT NULL, -- ACCESS_CONTROL, CRYPTOGRAPHY, INFRASTRUCTURE, etc.
  control_type VARCHAR(32) NOT NULL, -- PREVENTIVE, DETECTIVE, CORRECTIVE
  standard_testing_procedure TEXT NOT NULL,
  default_testing_frequency VARCHAR(32) DEFAULT 'CONTINUOUS',
  framework_mappings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_control_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  control_definition_id UUID REFERENCES global_control_definitions(id) ON DELETE SET NULL,
  control_code VARCHAR(64) NOT NULL,
  title VARCHAR(500) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  technical_custodian VARCHAR(255) NOT NULL,
  scope_asset_ids JSONB DEFAULT '[]'::jsonb,
  implementation_status VARCHAR(32) DEFAULT 'IMPLEMENTED', -- IMPLEMENTED, PARTIALLY_IMPLEMENTED, PLANNED, NOT_APPLICABLE
  implementation_details TEXT NOT NULL,
  operating_environment VARCHAR(64) DEFAULT 'PRODUCTION',
  effectiveness_rating VARCHAR(32) DEFAULT 'EFFECTIVE', -- EFFECTIVE, PARTIALLY_EFFECTIVE, DEFICIENT, NOT_TESTED
  testing_frequency VARCHAR(32) DEFAULT 'CONTINUOUS',
  last_tested_at TIMESTAMPTZ,
  next_test_due_date DATE NOT NULL,
  active_exception_id VARCHAR(64),
  linked_evidence_ids JSONB DEFAULT '[]'::jsonb,
  linked_risk_ids JSONB DEFAULT '[]'::jsonb,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_control_code UNIQUE (tenant_id, control_code)
);

CREATE INDEX IF NOT EXISTS idx_tenant_controls_tenant ON tenant_control_implementations(tenant_id);

CREATE TABLE IF NOT EXISTS control_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  control_implementation_id UUID NOT NULL REFERENCES tenant_control_implementations(id) ON DELETE CASCADE,
  control_code VARCHAR(64) NOT NULL,
  test_code VARCHAR(64) NOT NULL, -- e.g. 'TEST-2026-Q3-088'
  test_title VARCHAR(500) NOT NULL,
  test_objective TEXT NOT NULL,
  test_procedure TEXT NOT NULL,
  test_type VARCHAR(64) DEFAULT 'HYBRID_SAMPLE', -- AUTOMATED_TELEMETRY, MANUAL_INSPECTION, HYBRID_SAMPLE
  tester VARCHAR(255) NOT NULL,
  tester_role VARCHAR(64) NOT NULL, -- FIRST_LINE_OPS, SECOND_LINE_RISK, THIRD_LINE_INTERNAL_AUDIT, EXTERNAL_AUDITOR
  population_size INT NOT NULL,
  sample_size INT NOT NULL,
  sampling_method VARCHAR(64) DEFAULT 'RANDOM',
  testing_period_start DATE NOT NULL,
  testing_period_end DATE NOT NULL,
  test_result VARCHAR(32) NOT NULL, -- PASS, PARTIAL, FAIL, NOT_TESTED
  effectiveness VARCHAR(32) NOT NULL, -- EFFECTIVE, PARTIALLY_EFFECTIVE, DEFICIENT, NOT_TESTED
  deficiencies_identified JSONB DEFAULT '[]'::jsonb,
  exceptions_noted_count INT DEFAULT 0,
  evidence_ids JSONB DEFAULT '[]'::jsonb,
  findings_generated_ids JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(32) DEFAULT 'SIGNED_OFF', -- SCHEDULED, FIELDWORK_IN_PROGRESS, UNDER_REVIEW, SIGNED_OFF
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_test_code UNIQUE (tenant_id, test_code)
);

CREATE INDEX IF NOT EXISTS idx_control_tests_tenant ON control_tests(tenant_id);

-- ----------------------------------------------------------------------------
-- 4. EVIDENCE & EVIDENCE ASSERTIONS (CRYPTOGRAPHIC TRACEABILITY)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  evidence_code VARCHAR(64) NOT NULL, -- e.g. 'EV-2026-001'
  name VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_type VARCHAR(128) NOT NULL,
  storage_url TEXT NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL, -- Cryptographic integrity hash
  source_type VARCHAR(64) DEFAULT 'AUTOMATED_TELEMETRY',
  owner VARCHAR(255) NOT NULL,
  verification_status VARCHAR(32) DEFAULT 'VERIFIED', -- VERIFIED, PENDING_REVIEW, REJECTED
  verified_by VARCHAR(255),
  verified_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ NOT NULL,
  is_expired BOOLEAN DEFAULT false,
  ai_metadata JSONB DEFAULT '{}'::jsonb,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_evidence_code UNIQUE (tenant_id, evidence_code)
);

CREATE INDEX IF NOT EXISTS idx_evidence_tenant ON evidence(tenant_id);

CREATE TABLE IF NOT EXISTS evidence_assertions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  assertion_code VARCHAR(64) NOT NULL, -- e.g. 'ASSERT-2026-001'
  evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
  evidence_code VARCHAR(64) NOT NULL,
  control_implementation_id UUID REFERENCES tenant_control_implementations(id) ON DELETE CASCADE,
  control_code VARCHAR(64) NOT NULL,
  control_test_id UUID REFERENCES control_tests(id) ON DELETE SET NULL,
  requirement_code VARCHAR(64) NOT NULL,
  framework_code VARCHAR(64) NOT NULL,
  compliance_program_id VARCHAR(64) NOT NULL,
  assertion_statement TEXT NOT NULL,
  assertion_status VARCHAR(32) DEFAULT 'VERIFIED_VALID', -- VERIFIED_VALID, PENDING_AUDITOR_SAMPLE, EXPIRED, REJECTED
  asserted_by VARCHAR(255) NOT NULL,
  asserted_at TIMESTAMPTZ DEFAULT NOW(),
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_assertion_code UNIQUE (tenant_id, assertion_code)
);

CREATE INDEX IF NOT EXISTS idx_evidence_assertions_tenant ON evidence_assertions(tenant_id);

-- ----------------------------------------------------------------------------
-- 5. RISKS, FINDINGS & CAPA REMEDIATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  risk_code VARCHAR(64) NOT NULL, -- e.g. 'RSK-001'
  title VARCHAR(500) NOT NULL,
  category VARCHAR(64) NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  threat_description TEXT NOT NULL,
  vulnerability_description TEXT NOT NULL,
  inherent_likelihood INT NOT NULL, -- 1 to 5
  inherent_impact INT NOT NULL,     -- 1 to 5
  inherent_score INT NOT NULL,      -- Likelihood * Impact
  residual_likelihood INT NOT NULL,
  residual_impact INT NOT NULL,
  residual_score INT NOT NULL,
  risk_level VARCHAR(32) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  treatment_strategy VARCHAR(32) DEFAULT 'MITIGATE', -- MITIGATE, ACCEPT, TRANSFER, AVOID
  risk_owner VARCHAR(255) NOT NULL,
  due_date DATE,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_risk_code UNIQUE (tenant_id, risk_code)
);

CREATE INDEX IF NOT EXISTS idx_risks_tenant ON risks(tenant_id);

CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  audit_code VARCHAR(64) NOT NULL, -- e.g. 'AUD-2026-001'
  title VARCHAR(500) NOT NULL,
  audit_type VARCHAR(64) NOT NULL, -- INTERNAL_AUDIT, EXTERNAL_CERTIFICATION, REGULATORY_INSPECTION
  lead_auditor VARCHAR(255) NOT NULL,
  scope_summary TEXT NOT NULL,
  framework_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(32) DEFAULT 'IN_PROGRESS', -- PLANNED, IN_PROGRESS, REPORT_PENDING, COMPLETED
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_audit_code UNIQUE (tenant_id, audit_code)
);

CREATE INDEX IF NOT EXISTS idx_audits_tenant ON audits(tenant_id);

CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
  finding_code VARCHAR(64) NOT NULL, -- e.g. 'FND-001'
  title VARCHAR(500) NOT NULL,
  severity VARCHAR(32) NOT NULL, -- MAJOR_NC, MINOR_NC, OBSERVATION, OPPORTUNITY_FOR_IMPROVEMENT
  description TEXT NOT NULL,
  root_cause_analysis TEXT,
  related_control_code VARCHAR(64),
  related_requirement_code VARCHAR(64),
  identified_by VARCHAR(255) NOT NULL,
  status VARCHAR(32) DEFAULT 'OPEN', -- OPEN, REMEDIATING, VERIFICATION_PENDING, CLOSED_VERIFIED
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_finding_code UNIQUE (tenant_id, finding_code)
);

CREATE INDEX IF NOT EXISTS idx_findings_tenant ON findings(tenant_id);

CREATE TABLE IF NOT EXISTS capa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
  capa_code VARCHAR(64) NOT NULL, -- e.g. 'CAPA-003'
  title VARCHAR(500) NOT NULL,
  action_plan TEXT NOT NULL,
  assignee VARCHAR(255) NOT NULL,
  approver VARCHAR(255) NOT NULL,
  priority VARCHAR(32) DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
  due_date DATE NOT NULL,
  closure_evidence_id UUID REFERENCES evidence(id) ON DELETE SET NULL,
  closure_notes TEXT,
  status VARCHAR(32) DEFAULT 'IN_PROGRESS', -- ASSIGNED, IN_PROGRESS, PENDING_VERIFICATION, EFFECTIVE_CLOSED
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_capa_code UNIQUE (tenant_id, capa_code)
);

CREATE INDEX IF NOT EXISTS idx_capa_tenant ON capa(tenant_id);

-- ----------------------------------------------------------------------------
-- 6. EXCEPTIONS & UNIVERSAL WORKFLOW TASKS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  exception_code VARCHAR(64) NOT NULL, -- e.g. 'EXC-2026-088'
  title VARCHAR(500) NOT NULL,
  business_justification TEXT NOT NULL,
  related_control_id VARCHAR(64) NOT NULL,
  related_requirement_code VARCHAR(64) NOT NULL,
  affected_asset_ids JSONB DEFAULT '[]'::jsonb,
  inherent_risk_score INT NOT NULL,
  compensating_controls TEXT NOT NULL,
  residual_risk_score INT NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  department VARCHAR(128) NOT NULL,
  requested_date DATE NOT NULL,
  approved_by VARCHAR(255),
  approval_date TIMESTAMPTZ,
  expiry_date DATE NOT NULL,
  review_date DATE NOT NULL,
  status VARCHAR(32) DEFAULT 'APPROVED', -- DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, EXPIRED, CLOSED
  supporting_evidence_ids JSONB DEFAULT '[]'::jsonb,
  remediation_plan_upon_expiry TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_exception_code UNIQUE (tenant_id, exception_code)
);

CREATE INDEX IF NOT EXISTS idx_exceptions_tenant ON exceptions(tenant_id);

CREATE TABLE IF NOT EXISTS workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_code VARCHAR(64) NOT NULL, -- e.g. 'WF-TSK-101'
  entity_type VARCHAR(64) NOT NULL, -- RISK_TREATMENT, CAPA_REMEDIATION, EVIDENCE_VERIFICATION, EXCEPTION_APPROVAL, etc.
  entity_id VARCHAR(64) NOT NULL,
  entity_code VARCHAR(64) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  assignee VARCHAR(255) NOT NULL,
  assignee_role VARCHAR(64) NOT NULL,
  approver VARCHAR(255),
  reviewer VARCHAR(255),
  priority VARCHAR(32) DEFAULT 'HIGH',
  state VARCHAR(32) DEFAULT 'ASSIGNED', -- DRAFT, ASSIGNED, IN_PROGRESS, PENDING_APPROVAL, APPROVED, REJECTED, ESCALATED, CLOSED
  due_date TIMESTAMPTZ NOT NULL,
  is_escalated BOOLEAN DEFAULT false,
  audit_trail JSONB DEFAULT '[]'::jsonb,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tenant_task_code UNIQUE (tenant_id, task_code)
);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_tenant ON workflow_tasks(tenant_id);

-- ----------------------------------------------------------------------------
-- 7. AUDIT LOGS & TRANSACTIONAL OUTBOX
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action VARCHAR(128) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  actor VARCHAR(255) NOT NULL,
  actor_role VARCHAR(64) NOT NULL,
  actor_ip VARCHAR(64),
  previous_state JSONB,
  new_state JSONB,
  reason TEXT,
  request_id VARCHAR(64),
  correlation_id VARCHAR(64),
  result VARCHAR(32) DEFAULT 'SUCCESS', -- SUCCESS, FAILURE, DENIED
  integrity_hash VARCHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_time ON audit_logs(tenant_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type VARCHAR(128) NOT NULL,
  aggregate_type VARCHAR(64) NOT NULL,
  aggregate_id VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  published_status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, PUBLISHED, FAILED
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(published_status, created_at);
