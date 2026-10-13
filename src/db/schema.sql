-- ============================================================================
-- SKANDA GRC: Continuous Compliance Monitoring Database Schema Extensions (PostgreSQL 14+)
-- File: src/db/schema.sql
--
-- Authoritative Relational DDL for Continuous Compliance Monitoring
-- Covers:
-- 1. compliance_frameworks      - Multi-framework catalogs (ISO 27001, ISO 27701, SOC 2, MAS TRM)
-- 2. compliance_requirements    - Standard clauses, mandates, audit criteria, and evidence SLAs
-- 3. continuous_controls        - Common controls hub, cross-framework crosswalks, ownership
-- 4. continuous_evaluations     - Telemetry snapshots, operating effectiveness, and audit trails
-- 5. automated_control_tests    - CI/CD, cloud, IAM, and SIEM synthetic verification tests
-- 6. continuous_evidence        - Cryptographic SHA-256 artifacts, WORM URIs, and decay curves
-- 7. certification_lifecycles   - 3-Year accredited ISO 27001 cycle, Surveillance Year 1 & 2, Cl 9.2/9.3
-- 8. compliance_drift_events    - Autonomous drift alerts, severity, root causes, CAPA sync
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. FRAMEWORKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(32) NOT NULL,
  authority VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  description TEXT,
  official_reference_url VARCHAR(512),
  total_clauses_count INT DEFAULT 0,
  total_controls_count INT DEFAULT 0,
  surveillance_cycle_months INT DEFAULT 12,
  accreditation_required BOOLEAN DEFAULT true,
  statement_of_applicability_mandatory BOOLEAN DEFAULT false,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  applicable_jurisdictions JSONB DEFAULT '[]'::jsonb,
  supported_certification_bodies JSONB DEFAULT '[]'::jsonb,
  domains JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE compliance_frameworks IS 'Authoritative regulatory standards, industry benchmarks, and certification frameworks.';
COMMENT ON COLUMN compliance_frameworks.code IS 'Standard designation code (e.g. ISO/IEC 27001:2022)';
COMMENT ON COLUMN compliance_frameworks.surveillance_cycle_months IS 'Surveillance audit cycle frequency in months (default: 12)';

-- ============================================================================
-- 2. REQUIREMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id VARCHAR(64) PRIMARY KEY,
  framework_id VARCHAR(64) REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  framework_code VARCHAR(64) NOT NULL,
  requirement_code VARCHAR(64) NOT NULL,
  parent_requirement_id VARCHAR(64),
  clause_number VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  requirement_text TEXT NOT NULL,
  type VARCHAR(64) NOT NULL,
  mandatory BOOLEAN DEFAULT true,
  audit_criteria JSONB DEFAULT '[]'::jsonb,
  evidence_guidance TEXT,
  default_monitoring_frequency VARCHAR(32) NOT NULL,
  freshness_sla_days INT DEFAULT 365,
  mapped_control_ids JSONB DEFAULT '[]'::jsonb,
  risk_significance VARCHAR(32) DEFAULT 'HIGH',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_framework_req UNIQUE(framework_code, requirement_code)
);

COMMENT ON TABLE compliance_requirements IS 'Individual framework clauses, statutory mandates, and audit criteria.';
COMMENT ON COLUMN compliance_requirements.freshness_sla_days IS 'Maximum age in days before evidence decays to Stale/Expired';

-- ============================================================================
-- 3. CONTROLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS continuous_controls (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(64) NOT NULL,
  primary_framework_id VARCHAR(64) REFERENCES compliance_frameworks(id),
  clause_or_annex VARCHAR(64) NOT NULL,
  cross_framework_mappings JSONB DEFAULT '[]'::jsonb,
  control_type TEXT[] NOT NULL,
  security_properties TEXT[] NOT NULL,
  cybersecurity_concepts TEXT[] NOT NULL,
  security_domains TEXT[] NOT NULL,
  control_owner VARCHAR(128) NOT NULL,
  responsible_department VARCHAR(128) NOT NULL,
  default_monitoring_frequency VARCHAR(32) NOT NULL,
  evidence_collection_sla_days INT DEFAULT 90,
  is_continuous_monitoring_enabled BOOLEAN DEFAULT true,
  automated_test_capable BOOLEAN DEFAULT false,
  requires_documented_procedure BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_control UNIQUE(tenant_id, control_code)
);

COMMENT ON TABLE continuous_controls IS 'Organizational, technical, and physical controls with continuous telemetry support.';
COMMENT ON COLUMN continuous_controls.requires_documented_procedure IS 'Enforces ISO/IEC 27001:2022 Annex A 5.37 documented operating procedure check';

-- ============================================================================
-- 4. EVALUATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS continuous_evaluations (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_id VARCHAR(64) REFERENCES continuous_controls(id) ON DELETE CASCADE,
  control_code VARCHAR(64) NOT NULL,
  framework_code VARCHAR(64) NOT NULL,
  overall_status VARCHAR(64) NOT NULL,
  implementation_status VARCHAR(32) NOT NULL,
  operating_effectiveness_status VARCHAR(32) NOT NULL,
  monitoring_frequency VARCHAR(32) NOT NULL,
  last_evaluated_at TIMESTAMPTZ NOT NULL,
  next_evaluation_due_at TIMESTAMPTZ NOT NULL,
  evaluation_cycle_id VARCHAR(64) NOT NULL,
  evaluator_id VARCHAR(128) NOT NULL,
  evaluator_type VARCHAR(64) NOT NULL,
  evidence_freshness_status VARCHAR(32) NOT NULL,
  evidence_ids JSONB DEFAULT '[]'::jsonb,
  automated_test_ids JSONB DEFAULT '[]'::jsonb,
  mapped_risk_ids JSONB DEFAULT '[]'::jsonb,
  mapped_capa_ids JSONB DEFAULT '[]'::jsonb,
  has_active_exception BOOLEAN DEFAULT false,
  exception_details JSONB,
  drift_detected BOOLEAN DEFAULT false,
  drift_reason TEXT,
  telemetry_metrics JSONB DEFAULT '{}'::jsonb,
  evaluation_audit_trail JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE continuous_evaluations IS 'Point-in-time and continuous evaluation snapshots of control operating effectiveness.';

-- ============================================================================
-- 5. AUTOMATED TESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS automated_control_tests (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  control_id VARCHAR(64),
  test_name VARCHAR(255) NOT NULL,
  description TEXT,
  source_system VARCHAR(128) NOT NULL,
  integration_type VARCHAR(64) NOT NULL,
  execution_frequency VARCHAR(32) NOT NULL,
  metric_type VARCHAR(64) NOT NULL,
  threshold_expression TEXT NOT NULL,
  last_executed_at TIMESTAMPTZ NOT NULL,
  next_execution_due_at TIMESTAMPTZ NOT NULL,
  current_status VARCHAR(32) NOT NULL,
  latest_metric_value TEXT NOT NULL,
  latest_threshold TEXT NOT NULL,
  latest_failure_reason TEXT,
  evidence_generated_id VARCHAR(64),
  evidence_generated_sha256 VARCHAR(64),
  test_owner VARCHAR(128) NOT NULL,
  execution_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE automated_control_tests IS 'Synthetic tests, cloud telemetry verifiers, and IAM/SIEM check runners.';

-- ============================================================================
-- 6. CONTINUOUS EVIDENCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS continuous_evidence (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  control_title VARCHAR(255) NOT NULL,
  evidence_title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  mime_type VARCHAR(128) NOT NULL,
  storage_uri VARCHAR(512) NOT NULL,
  department VARCHAR(128) NOT NULL,
  uploaded_by VARCHAR(128) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  collection_frequency VARCHAR(32) NOT NULL,
  sla_max_days INT NOT NULL,
  age_in_days INT NOT NULL,
  sla_remaining_days INT NOT NULL,
  freshness_status VARCHAR(32) NOT NULL,
  freshness_score INT NOT NULL,
  sha256_hash CHAR(64) NOT NULL,
  tamper_evident_verified BOOLEAN DEFAULT true,
  digital_signature_id VARCHAR(128),
  annex_a_5_37_compliant BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_by VARCHAR(128),
  verified_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  decay_audit_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE continuous_evidence IS 'Immutable evidence repository with SHA-256 cryptographic verification and SLA decay tracking.';
COMMENT ON COLUMN continuous_evidence.sha256_hash IS 'Cryptographic hash computed at ingest for tamper-evident verification';

-- ============================================================================
-- 7. CERTIFICATION LIFECYCLE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS certification_lifecycles (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) UNIQUE NOT NULL,
  framework_code VARCHAR(64) NOT NULL,
  standard VARCHAR(64) NOT NULL,
  certification_status VARCHAR(64) NOT NULL,
  certification_body VARCHAR(255) NOT NULL,
  accreditation_body VARCHAR(255) NOT NULL,
  certificate_number VARCHAR(128) NOT NULL,
  scope_statement TEXT NOT NULL,
  physical_sites_included JSONB DEFAULT '[]'::jsonb,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  validity_period_years INT DEFAULT 3,
  surveillance_year1_date DATE NOT NULL,
  surveillance_year1_status VARCHAR(32) NOT NULL,
  surveillance_year2_date DATE NOT NULL,
  surveillance_year2_status VARCHAR(32) NOT NULL,
  recertification_date DATE NOT NULL,
  recertification_status VARCHAR(32) NOT NULL,
  last_internal_audit_date DATE NOT NULL,
  next_internal_audit_date DATE NOT NULL,
  last_management_review_date DATE NOT NULL,
  next_management_review_date DATE NOT NULL,
  lead_auditor_name VARCHAR(128) NOT NULL,
  cb_client_manager VARCHAR(128) NOT NULL,
  certification_conditions JSONB DEFAULT '[]'::jsonb,
  calculated_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE certification_lifecycles IS 'Tracks mandatory 3-year accredited ISO/IEC 27001 lifecycle, Surveillance Year 1 & 2, and management reviews.';

-- ============================================================================
-- 8. COMPLIANCE DRIFT EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_drift_events (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  framework_code VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  control_title VARCHAR(255) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  drift_type VARCHAR(64) NOT NULL,
  trigger_source VARCHAR(64) NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL,
  root_cause TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  assigned_owner VARCHAR(128) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  affected_risk_ids JSONB DEFAULT '[]'::jsonb,
  capa_id VARCHAR(64),
  status VARCHAR(32) DEFAULT 'OPEN',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(128),
  audit_trail JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE compliance_drift_events IS 'Real-time telemetry anomalies, SLA decay breaches, and automated test failure events.';

-- ============================================================================
-- PERFORMANCE & COMPLIANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_controls_tenant ON continuous_controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_controls_category ON continuous_controls(category);
CREATE INDEX IF NOT EXISTS idx_controls_continuous ON continuous_controls(tenant_id, is_continuous_monitoring_enabled);

CREATE INDEX IF NOT EXISTS idx_evaluations_tenant_status ON continuous_evaluations(tenant_id, overall_status);
CREATE INDEX IF NOT EXISTS idx_evaluations_drift ON continuous_evaluations(tenant_id, drift_detected);
CREATE INDEX IF NOT EXISTS idx_evaluations_control ON continuous_evaluations(control_id);

CREATE INDEX IF NOT EXISTS idx_evidence_tenant_freshness ON continuous_evidence(tenant_id, freshness_status);
CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON continuous_evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_control ON continuous_evidence(control_code);

CREATE INDEX IF NOT EXISTS idx_tests_tenant_status ON automated_control_tests(tenant_id, current_status);
CREATE INDEX IF NOT EXISTS idx_tests_control_code ON automated_control_tests(control_code);

CREATE INDEX IF NOT EXISTS idx_drift_tenant_status ON compliance_drift_events(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_drift_severity ON compliance_drift_events(severity);
CREATE INDEX IF NOT EXISTS idx_drift_control ON compliance_drift_events(control_code);

CREATE INDEX IF NOT EXISTS idx_cert_tenant ON certification_lifecycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cert_status ON certification_lifecycles(certification_status);
