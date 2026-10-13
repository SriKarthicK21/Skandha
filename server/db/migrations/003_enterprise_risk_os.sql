-- ============================================================================
-- SKANDA ENTERPRISE RISK OPERATING SYSTEM (MIGRATION 003)
-- Path: server/db/migrations/003_enterprise_risk_os.sql
-- 
-- Defines canonical risk schema, methodology registry, immutable historical
-- snapshot chains, closed-loop treatment verification ledgers, dead-letter
-- queues, executive decision triage, and tenant-bound Row-Level Security (RLS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RISK METHODOLOGIES REGISTRY
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS risk_methodologies (
  id VARCHAR(64) PRIMARY KEY, -- e.g. 'METH-5X5-STD'
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for GLOBAL default
  name VARCHAR(255) NOT NULL,
  version VARCHAR(64) NOT NULL,
  matrix_dimension VARCHAR(16) NOT NULL DEFAULT '5X5', -- '3X3', '4X4', '5X5'
  is_default BOOLEAN DEFAULT false,
  likelihood_definitions JSONB NOT NULL,
  impact_definitions JSONB NOT NULL,
  severity_bands JSONB NOT NULL,
  inherent_calculation_rule VARCHAR(128) NOT NULL DEFAULT 'LIKELIHOOD * IMPACT',
  residual_calculation_rule VARCHAR(128) NOT NULL DEFAULT 'RESIDUAL_LIKELIHOOD * RESIDUAL_IMPACT',
  control_effectiveness_weights JSONB NOT NULL DEFAULT '{"designWeight":1.0,"operatingWeight":1.0,"freshnessWeight":1.0}'::jsonb,
  risk_appetite_interpretation TEXT NOT NULL,
  approval_authority VARCHAR(255) NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_status VARCHAR(64) NOT NULL DEFAULT 'PRODUCTION_VERIFIED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_methodologies_tenant ON risk_methodologies(tenant_id);

-- ----------------------------------------------------------------------------
-- 2. CANONICAL ENTERPRISE RISK REGISTER
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS enterprise_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  risk_code VARCHAR(64) NOT NULL, -- e.g. 'RSK-CYBER-001'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(128) NOT NULL,
  subcategory VARCHAR(128),
  risk_scenario TEXT NOT NULL,
  risk_statement TEXT NOT NULL,
  business_context TEXT,
  
  risk_owner VARCHAR(255) NOT NULL,
  risk_owner_email VARCHAR(255),
  accountable_executive VARCHAR(255) NOT NULL,
  business_unit VARCHAR(128) NOT NULL,
  
  business_service_ids JSONB DEFAULT '[]'::jsonb,
  asset_ids JSONB DEFAULT '[]'::jsonb,
  supplier_ids JSONB DEFAULT '[]'::jsonb,
  threat_ids JSONB DEFAULT '[]'::jsonb,
  vulnerability_ids JSONB DEFAULT '[]'::jsonb,
  requirement_ids JSONB DEFAULT '[]'::jsonb,
  control_ids JSONB DEFAULT '[]'::jsonb,
  evidence_ids JSONB DEFAULT '[]'::jsonb,
  finding_ids JSONB DEFAULT '[]'::jsonb,
  capa_ids JSONB DEFAULT '[]'::jsonb,
  exception_ids JSONB DEFAULT '[]'::jsonb,
  
  risk_methodology VARCHAR(64) NOT NULL DEFAULT 'QUALITATIVE_5X5',
  methodology_version VARCHAR(64) NOT NULL DEFAULT '2026.1-Enterprise',
  methodology_id VARCHAR(64) REFERENCES risk_methodologies(id),
  
  inherent_likelihood INT NOT NULL CHECK (inherent_likelihood >= 1 AND inherent_likelihood <= 5),
  inherent_impact INT NOT NULL CHECK (inherent_impact >= 1 AND inherent_impact <= 5),
  inherent_risk_score INT NOT NULL,
  inherent_level VARCHAR(32) NOT NULL,
  
  current_control_effectiveness_percent INT NOT NULL DEFAULT 70 CHECK (current_control_effectiveness_percent >= 0 AND current_control_effectiveness_percent <= 100),
  control_design_rating VARCHAR(64) NOT NULL DEFAULT 'EFFECTIVE',
  control_operating_rating VARCHAR(64) NOT NULL DEFAULT 'OPERATING_EFFECTIVELY',
  
  residual_likelihood INT NOT NULL CHECK (residual_likelihood >= 1 AND residual_likelihood <= 5),
  residual_impact INT NOT NULL CHECK (residual_impact >= 1 AND residual_impact <= 5),
  residual_risk_score INT NOT NULL,
  residual_level VARCHAR(32) NOT NULL,
  target_risk_score INT NOT NULL DEFAULT 6,
  is_residual_score_increased BOOLEAN DEFAULT false,
  score_increase_driver TEXT,
  
  risk_appetite_score INT NOT NULL DEFAULT 8,
  is_outside_appetite BOOLEAN DEFAULT false,
  risk_velocity VARCHAR(64) NOT NULL DEFAULT 'STABLE',
  risk_trend VARCHAR(32) NOT NULL DEFAULT 'STABLE',
  confidence_level_percent INT NOT NULL DEFAULT 85,
  data_completeness_percent INT NOT NULL DEFAULT 90,
  
  treatment_strategy VARCHAR(64) NOT NULL DEFAULT 'MITIGATE',
  treatment_plan_description TEXT NOT NULL,
  treatment_plan_budget_usd NUMERIC(15, 2) DEFAULT 0,
  treatment_target_date TIMESTAMPTZ,
  treatment_status VARCHAR(64) NOT NULL DEFAULT 'IN_PROGRESS',
  
  status VARCHAR(64) NOT NULL DEFAULT 'TREATMENT_IN_PROGRESS',
  assurance_status VARCHAR(64) NOT NULL DEFAULT 'PARTIALLY_ASSURED',
  executive_acceptance JSONB DEFAULT '{"required":false,"status":"NOT_REQUIRED"}'::jsonb,
  quantitative_analysis JSONB,
  
  last_assessment_at TIMESTAMPTZ DEFAULT NOW(),
  last_assessed_by VARCHAR(255) NOT NULL,
  next_review_at TIMESTAMPTZ,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_enterprise_risks_tenant_code UNIQUE (tenant_id, risk_code)
);

CREATE INDEX IF NOT EXISTS idx_enterprise_risks_tenant ON enterprise_risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_risks_category ON enterprise_risks(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_enterprise_risks_status ON enterprise_risks(tenant_id, status);

-- ----------------------------------------------------------------------------
-- 3. IMMUTABLE HISTORICAL RISK ASSESSMENT SNAPSHOTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS risk_assessment_snapshots (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  risk_id UUID NOT NULL REFERENCES enterprise_risks(id) ON DELETE CASCADE,
  snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assessment_reason VARCHAR(64) NOT NULL,
  methodology_id VARCHAR(64),
  methodology_version VARCHAR(64) NOT NULL,
  matrix_dimension VARCHAR(16) DEFAULT '5X5',
  inherent_likelihood INT NOT NULL,
  inherent_impact INT NOT NULL,
  inherent_risk_score INT NOT NULL,
  control_effectiveness_percent INT NOT NULL,
  residual_likelihood INT NOT NULL,
  residual_impact INT NOT NULL,
  residual_risk_score INT NOT NULL,
  assessed_by VARCHAR(255) NOT NULL,
  rationale TEXT NOT NULL,
  inputs_hash VARCHAR(64) NOT NULL, -- SHA-256 cryptographic seal
  raw_input_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_snapshots_risk ON risk_assessment_snapshots(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_snapshots_tenant ON risk_assessment_snapshots(tenant_id);

-- ----------------------------------------------------------------------------
-- 4. CLOSED-LOOP TREATMENT VERIFICATION LEDGER
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS treatment_verification_ledger (
  treatment_id VARCHAR(128) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  risk_id UUID NOT NULL REFERENCES enterprise_risks(id) ON DELETE CASCADE,
  verified_by VARCHAR(255) NOT NULL,
  verified_by_role VARCHAR(128),
  verification_procedure TEXT NOT NULL,
  retest_criteria TEXT NOT NULL,
  retest_passed BOOLEAN NOT NULL DEFAULT false,
  retest_evidence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  pre_treatment_residual_score INT NOT NULL,
  post_treatment_residual_score INT NOT NULL,
  pre_treatment_ale_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
  post_treatment_ale_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
  unmitigated_exposure_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
  verification_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(64) NOT NULL, -- 'IMPLEMENTATION_COMPLETE', 'RETEST_PASSED', 'VERIFIED_AND_CLOSED', 'VERIFICATION_FAILED'
  closure_approved BOOLEAN NOT NULL DEFAULT false,
  closure_approved_by VARCHAR(255),
  closure_approval_date TIMESTAMPTZ,
  retest_required BOOLEAN NOT NULL DEFAULT false,
  requires_board_waiver BOOLEAN NOT NULL DEFAULT false,
  audit_explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_ledger_tenant ON treatment_verification_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_treatment_ledger_risk ON treatment_verification_ledger(risk_id);

-- ----------------------------------------------------------------------------
-- 5. LIVE CONNECTOR MATURITY & TELEMETRY LEDGER
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS connector_maturity_ledger (
  connector_id VARCHAR(128) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(128) NOT NULL,
  environment VARCHAR(64) NOT NULL DEFAULT 'PRODUCTION',
  maturity_level VARCHAR(64) NOT NULL DEFAULT 'CATALOG_ONLY', -- 12-tier maturity
  auth_status VARCHAR(64) NOT NULL DEFAULT 'CONFIGURED',
  is_live_validated BOOLEAN NOT NULL DEFAULT false,
  credential_scope JSONB DEFAULT '[]'::jsonb,
  last_successful_retrieval TIMESTAMPTZ,
  last_failed_retrieval TIMESTAMPTZ,
  last_normalization_result VARCHAR(128),
  last_automated_check TIMESTAMPTZ,
  last_evidence_generated TIMESTAMPTZ,
  collection_latency_ms INT DEFAULT 0,
  data_completeness_percent INT DEFAULT 0,
  data_freshness_score INT DEFAULT 0,
  error_rate_percent NUMERIC(5, 2) DEFAULT 0.0,
  affected_entities_count INT DEFAULT 0,
  risks_updated_count INT DEFAULT 0,
  known_limitations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connector_maturity_tenant ON connector_maturity_ledger(tenant_id);

-- ----------------------------------------------------------------------------
-- 6. DEAD-LETTER & EVENT REPLAY LEDGER
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS dead_letter_events (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id VARCHAR(128) NOT NULL,
  correlation_id VARCHAR(128),
  event_type VARCHAR(128) NOT NULL,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  failure_reason TEXT NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'DEAD_LETTER', -- 'DEAD_LETTER', 'RETRIED', 'RESOLVED_MANUAL', 'DISCARDED'
  retry_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 3,
  last_retry_timestamp TIMESTAMPTZ,
  replay_audit_trail JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dead_letter_tenant ON dead_letter_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_status ON dead_letter_events(tenant_id, status);

-- ----------------------------------------------------------------------------
-- 7. EXECUTIVE DECISION QUEUE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS executive_decision_queue (
  decision_id VARCHAR(128) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  risk_id UUID NOT NULL REFERENCES enterprise_risks(id) ON DELETE CASCADE,
  risk_code VARCHAR(64) NOT NULL,
  priority VARCHAR(32) NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  urgency_score INT NOT NULL DEFAULT 50, -- 0 - 100
  title VARCHAR(255) NOT NULL,
  why_it_matters TEXT NOT NULL,
  what_changed TEXT NOT NULL,
  business_impact TEXT NOT NULL,
  source_event VARCHAR(128),
  supporting_evidence JSONB DEFAULT '[]'::jsonb,
  residual_risk_score INT NOT NULL,
  appetite_limit INT NOT NULL,
  is_outside_appetite BOOLEAN NOT NULL DEFAULT false,
  potential_exposure_usd NUMERIC(15, 2) DEFAULT 0,
  accountable_owner VARCHAR(255) NOT NULL,
  required_decision TEXT NOT NULL,
  available_actions JSONB NOT NULL DEFAULT '["ACCEPT","REJECT_ACCEPTANCE","REQUEST_REASSESSMENT","APPROVE_TREATMENT","ESCALATE"]'::jsonb,
  due_date DATE NOT NULL,
  verification_status VARCHAR(64) NOT NULL DEFAULT 'PENDING_REVIEW',
  decision_audit_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exec_decision_tenant ON executive_decision_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exec_decision_priority ON executive_decision_queue(tenant_id, priority, urgency_score);

-- ----------------------------------------------------------------------------
-- 8. ROW-LEVEL SECURITY (RLS) POLICIES FOR ENTERPRISE RISK TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE risk_methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_verification_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_maturity_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_decision_queue ENABLE ROW LEVEL SECURITY;

-- Global or Tenant-Specific Methodology Policy
DROP POLICY IF EXISTS risk_methodologies_tenant_isolation ON risk_methodologies;
CREATE POLICY risk_methodologies_tenant_isolation ON risk_methodologies
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id IS NULL OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- Enterprise Risks Policy
DROP POLICY IF EXISTS enterprise_risks_tenant_isolation ON enterprise_risks;
CREATE POLICY enterprise_risks_tenant_isolation ON enterprise_risks
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- Snapshots Policy
DROP POLICY IF EXISTS risk_snapshots_tenant_isolation ON risk_assessment_snapshots;
CREATE POLICY risk_snapshots_tenant_isolation ON risk_assessment_snapshots
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- Treatment Ledger Policy
DROP POLICY IF EXISTS treatment_ledger_tenant_isolation ON treatment_verification_ledger;
CREATE POLICY treatment_ledger_tenant_isolation ON treatment_verification_ledger
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- Connector Maturity Policy
DROP POLICY IF EXISTS connector_maturity_tenant_isolation ON connector_maturity_ledger;
CREATE POLICY connector_maturity_tenant_isolation ON connector_maturity_ledger
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- Dead Letter Events Policy
DROP POLICY IF EXISTS dead_letter_tenant_isolation ON dead_letter_events;
CREATE POLICY dead_letter_tenant_isolation ON dead_letter_events
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- Executive Decision Queue Policy
DROP POLICY IF EXISTS exec_decision_tenant_isolation ON executive_decision_queue;
CREATE POLICY exec_decision_tenant_isolation ON executive_decision_queue
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

