-- ============================================================================
-- SKANDA ENTERPRISE TPRM & CONTINUOUS ASSURANCE SCHEMA (MIGRATION 004)
-- Path: server/db/migrations/004_enterprise_tprm_continuous_assurance.sql
-- 
-- Defines full canonical tables for Third-Party Risk Intelligence:
-- 1. tprm_vendors (Vendor 360, 17-stage state machine, assurance profiles)
-- 2. tprm_risk_snapshots (Immutable 14-factor risk historical ledger)
-- 3. tprm_assessments (Dynamic risk-based due diligence questionnaires & responses)
-- 4. tprm_contracts (DPA, SCCs, SLA tracking, renewal notices)
-- 5. tprm_findings (Closed-loop findings with mandatory independent retesting)
-- 6. tprm_monitoring_signals (Continuous telemetry signal ingestion & idempotency)
-- 7. tprm_fourth_party_nodes (Multi-tier concentration & blast radius graph)
-- 8. Row-Level Security (RLS) enforcement per tenant
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TPRM VENDORS MASTER TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tprm_vendors (
  id VARCHAR(64) PRIMARY KEY, -- e.g. 'vnd-aws-001'
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_code VARCHAR(64) NOT NULL, -- e.g. 'VND-001'
  lifecycle_status VARCHAR(64) NOT NULL DEFAULT 'VENDOR_REGISTRATION',
  approval_decision VARCHAR(64) NOT NULL DEFAULT 'PENDING_EXECUTIVE_APPROVAL',
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  
  -- Profile & Business Relationship (JSONB structures for flexible enterprise attributes)
  profile JSONB NOT NULL,
  relationship JSONB NOT NULL,
  technology_and_data JSONB NOT NULL,
  assurance_profile JSONB NOT NULL,
  
  -- Denormalized Risk Cache
  current_inherent_risk_score INT NOT NULL DEFAULT 9,
  current_residual_risk_score INT NOT NULL DEFAULT 6,
  is_outside_risk_appetite BOOLEAN DEFAULT false,
  
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_tprm_tenant_vendor_code UNIQUE (tenant_id, vendor_code)
);

CREATE INDEX IF NOT EXISTS idx_tprm_vendors_tenant ON tprm_vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tprm_vendors_lifecycle ON tprm_vendors(tenant_id, lifecycle_status);

-- ----------------------------------------------------------------------------
-- 2. TPRM RISK SNAPSHOTS (IMMUTABLE AUDIT TRAIL)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tprm_risk_snapshots (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id VARCHAR(64) NOT NULL REFERENCES tprm_vendors(id) ON DELETE CASCADE,
  methodology_version VARCHAR(64) NOT NULL DEFAULT '2026.1-TPRM-Enterprise',
  matrix_dimension VARCHAR(16) NOT NULL DEFAULT '5X5',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assessed_by VARCHAR(255) NOT NULL,
  
  factor_breakdown JSONB NOT NULL,
  inherent_likelihood INT NOT NULL,
  inherent_impact INT NOT NULL,
  inherent_risk_score INT NOT NULL,
  inherent_risk_level VARCHAR(32) NOT NULL,
  
  control_design_score INT NOT NULL,
  control_operating_score INT NOT NULL,
  evidence_freshness_score INT NOT NULL,
  combined_control_effectiveness INT NOT NULL,
  
  residual_likelihood INT NOT NULL,
  residual_impact INT NOT NULL,
  residual_risk_score INT NOT NULL,
  residual_risk_level VARCHAR(32) NOT NULL,
  
  is_residual_higher_than_inherent BOOLEAN DEFAULT false,
  residual_surge_reason TEXT,
  risk_appetite_threshold INT NOT NULL DEFAULT 8,
  is_outside_appetite BOOLEAN DEFAULT false,
  
  confidence_score_percent INT NOT NULL DEFAULT 90,
  evidence_completeness_percent INT NOT NULL DEFAULT 90,
  scoring_explanation TEXT NOT NULL,
  top_risk_contributors JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tprm_snapshots_vendor ON tprm_risk_snapshots(tenant_id, vendor_id, calculated_at DESC);

-- ----------------------------------------------------------------------------
-- 3. TPRM ASSESSMENTS & QUESTIONNAIRES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tprm_assessments (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id VARCHAR(64) NOT NULL REFERENCES tprm_vendors(id) ON DELETE CASCADE,
  template_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  assessment_type VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'UNDER_AUDIT_REVIEW',
  
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  lead_assessor VARCHAR(255) NOT NULL,
  
  overall_score_percent INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  answered_questions INT NOT NULL DEFAULT 0,
  mandatory_unanswered_count INT NOT NULL DEFAULT 0,
  evidence_items_provided_count INT NOT NULL DEFAULT 0,
  findings_count INT NOT NULL DEFAULT 0,
  
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tprm_assessments_vendor ON tprm_assessments(tenant_id, vendor_id);

-- ----------------------------------------------------------------------------
-- 4. TPRM CONTRACTS & DPA REGISTRY
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tprm_contracts (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id VARCHAR(64) NOT NULL REFERENCES tprm_vendors(id) ON DELETE CASCADE,
  contract_reference VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  contract_type VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'ACTIVE',
  
  effective_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  renewal_notice_period_days INT NOT NULL DEFAULT 60,
  auto_renew BOOLEAN DEFAULT false,
  governing_law VARCHAR(128) NOT NULL DEFAULT 'Singapore Law',
  
  security_clauses_summary TEXT,
  dpa_article28_compliant BOOLEAN DEFAULT true,
  dpdp_section8_compliant BOOLEAN DEFAULT true,
  incident_notification_hours_sla INT NOT NULL DEFAULT 24,
  audit_rights VARCHAR(64) DEFAULT 'ANNUAL_ON_SITE',
  sla_availability_percent NUMERIC(5,3) DEFAULT 99.99,
  contract_document_sha256 VARCHAR(64),
  verified_by_legal BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tprm_contracts_vendor ON tprm_contracts(tenant_id, vendor_id);

-- ----------------------------------------------------------------------------
-- 5. TPRM FINDINGS & CLOSED-LOOP CAPA RETESTING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tprm_findings (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id VARCHAR(64) NOT NULL REFERENCES tprm_vendors(id) ON DELETE CASCADE,
  finding_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',
  category VARCHAR(64) NOT NULL,
  root_cause TEXT,
  
  identified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_owner VARCHAR(255) NOT NULL,
  target_remediation_date DATE NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'OPEN',
  
  corrective_action_plan TEXT,
  compensating_controls TEXT,
  remediation_evidence_ids JSONB DEFAULT '[]'::jsonb,
  independent_retest_required BOOLEAN DEFAULT true,
  retest_outcome VARCHAR(32),
  retested_by VARCHAR(255),
  retested_at TIMESTAMPTZ,
  retest_notes TEXT,
  
  closed_by VARCHAR(255),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tprm_findings_vendor ON tprm_findings(tenant_id, vendor_id, status);

-- ----------------------------------------------------------------------------
-- 6. TPRM CONTINUOUS MONITORING SIGNALS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tprm_monitoring_signals (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id VARCHAR(64) NOT NULL REFERENCES tprm_vendors(id) ON DELETE CASCADE,
  category VARCHAR(64) NOT NULL,
  source_attribution VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  headline VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  observed_evidence_sha256 VARCHAR(64),
  is_actionable BOOLEAN DEFAULT true,
  reassessment_triggered BOOLEAN DEFAULT false,
  status VARCHAR(64) NOT NULL DEFAULT 'NEW_UNACKNOWLEDGED',
  
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tprm_signals_vendor ON tprm_monitoring_signals(tenant_id, vendor_id, event_timestamp DESC);

-- ----------------------------------------------------------------------------
-- 7. TPRM FOURTH-PARTY NODES (CONCENTRATION GRAPH)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tprm_fourth_party_nodes (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for global catalog
  name VARCHAR(255) NOT NULL,
  service_category VARCHAR(128) NOT NULL,
  jurisdiction VARCHAR(128) NOT NULL,
  is_known_downstream_dependency BOOLEAN DEFAULT true,
  concentration_risk_rating VARCHAR(32) DEFAULT 'MODERATE',
  single_point_of_failure_flag BOOLEAN DEFAULT false,
  failover_plan_documented BOOLEAN DEFAULT true,
  exit_substitutability_difficulty VARCHAR(32) DEFAULT 'MODERATE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) ENFORCEMENT
-- ----------------------------------------------------------------------------

ALTER TABLE tprm_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tprm_risk_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tprm_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tprm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tprm_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tprm_monitoring_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tprm_vendors_tenant_isolation ON tprm_vendors;
CREATE POLICY tprm_vendors_tenant_isolation ON tprm_vendors
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS tprm_risk_snapshots_tenant_isolation ON tprm_risk_snapshots;
CREATE POLICY tprm_risk_snapshots_tenant_isolation ON tprm_risk_snapshots
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS tprm_assessments_tenant_isolation ON tprm_assessments;
CREATE POLICY tprm_assessments_tenant_isolation ON tprm_assessments
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS tprm_contracts_tenant_isolation ON tprm_contracts;
CREATE POLICY tprm_contracts_tenant_isolation ON tprm_contracts
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS tprm_findings_tenant_isolation ON tprm_findings;
CREATE POLICY tprm_findings_tenant_isolation ON tprm_findings
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS tprm_monitoring_signals_tenant_isolation ON tprm_monitoring_signals;
CREATE POLICY tprm_monitoring_signals_tenant_isolation ON tprm_monitoring_signals
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
