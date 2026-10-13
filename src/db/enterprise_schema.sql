-- ============================================================================
-- SKANDA ENTERPRISE GRC: AUTHORITATIVE POSTGRESQL RELATIONAL SCHEMA (v3.0)
-- File: src/db/enterprise_schema.sql
--
-- Clean Architecture & Domain-Driven Design for Enterprise GRC & Continuous Compliance
-- Compliance Engine: Source Systems -> Connectors -> Ingestion -> Normalization ->
--   Validation -> Evidence Repository -> Control Evaluation -> Compliance Assessment ->
--   Risk Engine -> Findings -> Remediation -> Continuous Monitoring -> Executive Reporting
--
-- Standards Supported:
-- ISO/IEC 27001:2022, ISO/IEC 27701:2019, ISO/IEC 42001:2023, ISO 22301, ISO 31000,
-- MAS TRM Guidelines, MAS Notice 644/655, SOC 2 Type II, NIST CSF, PCI DSS v4,
-- India DPDP Act 2023, GDPR, CIS Controls v8.
-- ============================================================================

-- PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. MULTI-TENANCY & ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  industry_type VARCHAR(128) NOT NULL,
  country VARCHAR(64) NOT NULL,
  onboarding_phase INT DEFAULT 1,
  selected_frameworks JSONB DEFAULT '["ISO/IEC 27001:2022"]'::jsonb,
  subscription_tier VARCHAR(64) DEFAULT 'ENTERPRISE',
  is_demo BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  legal_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(128),
  country VARCHAR(64) NOT NULL,
  industry VARCHAR(128) NOT NULL,
  headquarters_address JSONB DEFAULT '{}'::jsonb,
  scope_statement TEXT NOT NULL,
  owner_user_id VARCHAR(64),
  status VARCHAR(32) DEFAULT 'ACTIVE',
  configuration_status VARCHAR(64) DEFAULT 'CONFIGURED',
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_tenant ON organizations(tenant_id);

-- ============================================================================
-- 2. USERS & ACCESS CONTROL (RBAC/ABAC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(64) NOT NULL, -- SuperAdmin, CISO, LeadAuditor, ComplianceOfficer, ControlOwner, Auditor, Reader
  department VARCHAR(128),
  mfa_enabled BOOLEAN DEFAULT true,
  mfa_method VARCHAR(64) DEFAULT 'TOTP_WEBAUTHN',
  status VARCHAR(32) DEFAULT 'ACTIVE',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_email UNIQUE (tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- ============================================================================
-- 3. ORGANIZATIONAL CONTEXT: DEPARTMENTS & BUSINESS PROCESSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(255) NOT NULL,
  head_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  target_readiness_score NUMERIC(5, 2) DEFAULT 85.00,
  current_readiness_score NUMERIC(5, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_dept_code UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS business_processes (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  criticality VARCHAR(32) DEFAULT 'HIGH', -- Critical, High, Medium, Low
  rto_hours NUMERIC(6, 2) DEFAULT 4.00,  -- Recovery Time Objective
  rpo_hours NUMERIC(6, 2) DEFAULT 1.00,  -- Recovery Point Objective
  is_mas_critical_system BOOLEAN DEFAULT false,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_proc_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_proc_tenant ON business_processes(tenant_id);

-- ============================================================================
-- 4. CMDB: ASSETS, APPLICATIONS, INFRASTRUCTURE & DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL, -- Server, CloudService, Database, Application, Repository, Endpoint, NetworkDevice
  classification VARCHAR(32) DEFAULT 'Confidential', -- Secret, Confidential, Internal, Public
  business_process_id VARCHAR(64) REFERENCES business_processes(id) ON DELETE SET NULL,
  business_service VARCHAR(255),
  owner_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  custodian VARCHAR(128),
  cloud_provider VARCHAR(64), -- AWS, Azure, GCP, Cloudflare, OnPremise
  region VARCHAR(64),
  criticality VARCHAR(32) DEFAULT 'High', -- Critical, High, Medium, Low
  status VARCHAR(32) DEFAULT 'Active',
  ip_addresses TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_asset_code UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_assets_tenant ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assets_criticality ON assets(tenant_id, criticality);

CREATE TABLE IF NOT EXISTS data_assets (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  data_type VARCHAR(128) NOT NULL, -- Customer PII, Payment Credentials, Employee HR, Source Code, AI Model Weights
  classification VARCHAR(32) DEFAULT 'Confidential',
  data_format VARCHAR(64) DEFAULT 'Structured DB',
  storage_location VARCHAR(255) NOT NULL,
  retention_years INT DEFAULT 7,
  encryption_at_rest BOOLEAN DEFAULT true,
  encryption_in_transit BOOLEAN DEFAULT true,
  legal_basis VARCHAR(128) DEFAULT 'Contractual Necessity',
  contains_pii BOOLEAN DEFAULT false,
  contains_financial BOOLEAN DEFAULT false,
  owner_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  asset_id VARCHAR(64) REFERENCES assets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_assets_tenant ON data_assets(tenant_id);

-- ============================================================================
-- 5. THIRD-PARTY RISK: VENDORS & SUPPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(32) DEFAULT 'Tier 1', -- Tier 1 (Critical), Tier 2 (Significant), Tier 3 (Tactical)
  service_provided VARCHAR(255) NOT NULL,
  criticality VARCHAR(32) DEFAULT 'High',
  risk_score NUMERIC(5, 2) DEFAULT 45.00,
  due_diligence_status VARCHAR(64) DEFAULT 'Verified', -- Pending, In Progress, Verified, Rejected
  soc2_available BOOLEAN DEFAULT true,
  iso27001_certified BOOLEAN DEFAULT true,
  dpa_signed BOOLEAN DEFAULT true,
  contract_end_date DATE,
  last_assessment_date DATE,
  next_assessment_due DATE,
  contact_email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_tenant ON vendors(tenant_id);

-- ============================================================================
-- 6. COMPLIANCE FRAMEWORKS & REQUIREMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(32) NOT NULL,
  authority VARCHAR(64) NOT NULL, -- ISO_IEC, AICPA, MAS_SINGAPORE, NIST, EUROPEAN_UNION, INDIA_MEITY
  category VARCHAR(64) NOT NULL,
  description TEXT,
  official_reference_url VARCHAR(512),
  total_clauses_count INT DEFAULT 0,
  total_controls_count INT DEFAULT 0,
  surveillance_cycle_months INT DEFAULT 12,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id VARCHAR(64) PRIMARY KEY,
  framework_id VARCHAR(64) NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  framework_code VARCHAR(64) NOT NULL,
  requirement_code VARCHAR(64) NOT NULL,
  clause_number VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  requirement_text TEXT NOT NULL,
  type VARCHAR(64) NOT NULL, -- MANAGEMENT_SYSTEM_CLAUSE, OPERATIONAL_CONTROL, STATUTORY_MANDATE
  mandatory BOOLEAN DEFAULT true,
  freshness_sla_days INT DEFAULT 365,
  risk_significance VARCHAR(32) DEFAULT 'HIGH',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_framework_req UNIQUE (framework_code, requirement_code)
);

-- ============================================================================
-- 7. MASTER CONTROLS & CROSS-FRAMEWORK MAPPINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS controls (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  control_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(64) NOT NULL, -- Organizational, People, Physical, Technological
  control_type VARCHAR(64) DEFAULT 'Preventive', -- Preventive, Detective, Corrective
  security_properties TEXT[] DEFAULT ARRAY['Confidentiality', 'Integrity', 'Availability']::TEXT[],
  implementation_status VARCHAR(64) DEFAULT 'Implemented', -- Not Started, In Progress, Implemented, Monitored, Audited
  effectiveness VARCHAR(64) DEFAULT 'Effective', -- Effective, Operating — Minor Gap, Ineffective, Not Tested
  maturity_level INT DEFAULT 3, -- 1 to 5
  owner_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  responsible_department VARCHAR(128) NOT NULL,
  monitoring_frequency VARCHAR(32) DEFAULT 'Continuous',
  evidence_collection_sla_days INT DEFAULT 90,
  is_automated BOOLEAN DEFAULT false,
  is_key_control BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_control UNIQUE (tenant_id, control_code)
);

CREATE INDEX IF NOT EXISTS idx_controls_tenant ON controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_controls_status ON controls(tenant_id, implementation_status);

CREATE TABLE IF NOT EXISTS control_framework_mappings (
  id VARCHAR(64) PRIMARY KEY,
  control_id VARCHAR(64) NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  framework_code VARCHAR(64) NOT NULL,
  requirement_code VARCHAR(64) NOT NULL,
  mapping_rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_control_mapping UNIQUE (control_id, framework_code, requirement_code)
);

-- ============================================================================
-- 8. ENTERPRISE RISK ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  risk_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL, -- Information Security, Compliance, Operational, Cyber Attack, Third Party, AI Governance
  linked_asset_id VARCHAR(64) REFERENCES assets(id) ON DELETE SET NULL,
  linked_process_id VARCHAR(64) REFERENCES business_processes(id) ON DELETE SET NULL,
  department VARCHAR(128) NOT NULL,
  threat_description TEXT NOT NULL,
  vulnerability_description TEXT NOT NULL,
  business_impact TEXT,
  likelihood INT NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  impact INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
  inherent_score INT GENERATED ALWAYS AS (likelihood * impact) STORED,
  mitigating_control_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  residual_likelihood INT NOT NULL CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_impact INT NOT NULL CHECK (residual_impact BETWEEN 1 AND 5),
  residual_score INT GENERATED ALWAYS AS (residual_likelihood * residual_impact) STORED,
  appetite_threshold INT DEFAULT 9,
  treatment_option VARCHAR(32) DEFAULT 'Mitigate', -- Mitigate, Accept, Transfer, Avoid
  treatment_owner VARCHAR(128) NOT NULL,
  target_remediation_date DATE NOT NULL,
  status VARCHAR(32) DEFAULT 'Identified', -- Identified, Assessing, Mitigating, Accepted, Closed
  review_date DATE,
  escalated_to_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_risk_code UNIQUE (tenant_id, risk_code)
);

CREATE INDEX IF NOT EXISTS idx_risks_tenant_score ON risks(tenant_id, residual_score);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(tenant_id, status);

-- ============================================================================
-- 9. EVIDENCE REPOSITORY & CRYPTOGRAPHIC LEDGER
-- ============================================================================

CREATE TABLE IF NOT EXISTS evidence (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  control_id VARCHAR(64) REFERENCES controls(id) ON DELETE SET NULL,
  control_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  file_type VARCHAR(128) DEFAULT 'application/pdf',
  storage_uri VARCHAR(512),
  sha256_hash VARCHAR(64) NOT NULL,
  classification VARCHAR(32) DEFAULT 'Confidential',
  source_connector VARCHAR(64) DEFAULT 'Manual Upload', -- Manual, AWS, Azure, GitHub, Okta, SIEM
  version VARCHAR(32) DEFAULT 'v1.0',
  status VARCHAR(32) DEFAULT 'Pending Review', -- Requested, Collected, Processing, Pending Review, Verified, Rejected, Expired, Archived
  uploaded_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  uploaded_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  retention_period_years INT DEFAULT 3,
  reviewed_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  verification_notes TEXT,
  is_worm_verified BOOLEAN DEFAULT false,
  chain_of_custody JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_tenant_control ON evidence(tenant_id, control_code);
CREATE INDEX IF NOT EXISTS idx_evidence_hash ON evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(tenant_id, status);

-- ============================================================================
-- 10. FINDINGS & NONCONFORMITIES (CAPA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS findings (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  finding_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  severity VARCHAR(32) NOT NULL, -- Major NC, Minor NC, OFI (Opportunity for Improvement), Observation
  type VARCHAR(64) DEFAULT 'Non-Conformity',
  status VARCHAR(32) DEFAULT 'Open', -- Open, In Remediation, Verification Pending, Closed Verified
  assigned_to_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  control_id VARCHAR(64) REFERENCES controls(id) ON DELETE SET NULL,
  control_code VARCHAR(64) NOT NULL,
  framework_code VARCHAR(64) DEFAULT 'ISO/IEC 27001:2022',
  description TEXT NOT NULL,
  root_cause TEXT,
  remediation_plan TEXT,
  sla_days INT DEFAULT 30,
  target_date DATE NOT NULL,
  closure_date DATE,
  verified_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  evidence_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_finding_code UNIQUE (tenant_id, finding_code)
);

CREATE INDEX IF NOT EXISTS idx_findings_tenant_status ON findings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(tenant_id, severity);

-- ============================================================================
-- 11. SECURITY & POLICY EXCEPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_exceptions (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  exception_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  business_justification TEXT NOT NULL,
  compensating_controls TEXT NOT NULL,
  residual_risk_level VARCHAR(32) DEFAULT 'Medium',
  requested_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  approved_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  approval_status VARCHAR(32) DEFAULT 'Pending Approval', -- Pending Approval, Approved, Rejected, Expired, Revoked
  approved_at TIMESTAMPTZ,
  expiration_date DATE NOT NULL,
  re_evaluation_frequency VARCHAR(32) DEFAULT 'Quarterly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_exception UNIQUE (tenant_id, exception_code)
);

CREATE INDEX IF NOT EXISTS idx_exceptions_tenant ON security_exceptions(tenant_id);

-- ============================================================================
-- 12. CONNECTORS & INTEGRATIONS (TELEMETRY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS connectors (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider VARCHAR(64) NOT NULL, -- AWS, Azure, EntraID, GitHub, Okta, CrowdStrike, Datadog, Jira
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL, -- Cloud Infrastructure, Identity & Access, Source Control, Endpoint, SIEM
  connection_status VARCHAR(32) DEFAULT 'AWAITING_CONFIG', -- CONNECTED, DEGRADED, DISCONNECTED, AWAITING_CONFIG
  auth_type VARCHAR(32) DEFAULT 'API_KEY', -- API_KEY, OAUTH2, IAM_ROLE, WEBHOOK
  endpoint_url VARCHAR(512),
  last_sync_at TIMESTAMPTZ,
  last_error_message TEXT,
  target_controls TEXT[] DEFAULT ARRAY[]::TEXT[],
  health_score NUMERIC(5, 2) DEFAULT 0.00,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_provider UNIQUE (tenant_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_connectors_tenant ON connectors(tenant_id);

-- ============================================================================
-- 13. TELEMETRY EVENTS & CONTINUOUS EVALUATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS telemetry_events (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  connector_id VARCHAR(64) REFERENCES connectors(id) ON DELETE SET NULL,
  source VARCHAR(128) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  severity VARCHAR(32) DEFAULT 'INFO', -- CRITICAL, HIGH, MEDIUM, LOW, INFO
  summary TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  hmac_status VARCHAR(32) DEFAULT 'UNSIGNED', -- VERIFIED, UNSIGNED, MISMATCH
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_status VARCHAR(32) DEFAULT 'PROCESSED',
  auto_evidence_id VARCHAR(64) REFERENCES evidence(id) ON DELETE SET NULL,
  drift_detected BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_telemetry_tenant_time ON telemetry_events(tenant_id, ingested_at DESC);

-- ============================================================================
-- 14. CRYPTOGRAPHIC AUDIT LOGS (TAMPER-EVIDENT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor VARCHAR(255) NOT NULL,
  actor_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(64) NOT NULL, -- CREATE, UPDATE, DELETE, VERIFY, SIGN_OFF, EXPORT, CONTEXT_SWITCH
  entity_type VARCHAR(64) NOT NULL, -- TENANT, CONTROL, RISK, EVIDENCE, FINDING, POLICY, EXCEPTION
  entity_id VARCHAR(64),
  details TEXT NOT NULL,
  ip_address VARCHAR(45) DEFAULT '127.0.0.1',
  user_agent VARCHAR(255),
  prev_integrity_hash VARCHAR(64),
  integrity_hash VARCHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON audit_logs(tenant_id, timestamp DESC);
