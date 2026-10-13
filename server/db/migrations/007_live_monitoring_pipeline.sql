-- ============================================================================
-- SKANDA LIVE MONITORING & CONTINUOUS COMPLIANCE PIPELINE (MIGRATION 007)
-- Path: server/db/migrations/007_live_monitoring_pipeline.sql
--
-- Purpose: durable storage for the continuous monitoring pipeline that closes
-- the gap between scheduled/manual compliance checking and mature continuous
-- compliance platforms.
--
-- Storage strategy (consistent with migrations 001–006):
--   Explicit relational columns for the fields the platform filters, orders,
--   deduplicates and enforces tenant relationships on, PLUS a `record JSONB`
--   column holding the complete canonical TypeScript domain object so the
--   durable JSON store and PostgreSQL round-trip losslessly.
--
-- Tenant identity note: like migration 006, tenant identity is carried as the
-- TEXT claim used by server/middleware/authMiddleware.ts (e.g. 'tenant-acme')
-- rather than a UUID, so RLS uses get_current_tenant_id_text().
--
-- Tables:
--   1.  monitoring_integrations       (verified connector registration + health + checkpoint)
--   2.  monitoring_signals            (canonical security signals, idempotent)
--   3.  monitoring_jobs               (durable queue with retry/backoff/DLQ handoff)
--   4.  monitoring_dead_letters       (bounded-retry failures awaiting controlled replay)
--   5.  control_evaluations           (deterministic rule evaluation records)
--   6.  control_monitoring_states     (current continuous compliance state per control+resource)
--   7.  control_state_transitions     (explicit drift / recovery history)
--   8.  monitoring_finding_links      (finding deduplication against canonical findings)
--   9.  Row Level Security per tenant
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TENANT SESSION CONTEXT (defined in 006; recreated defensively for standalone runs)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_tenant_id_text() RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------------------------
-- 1. MONITORING INTEGRATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_integrations (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  connector_id VARCHAR(128) NOT NULL,
  provider VARCHAR(128) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  environment VARCHAR(32) NOT NULL DEFAULT 'PRODUCTION',
  monitoring_mode VARCHAR(64) NOT NULL DEFAULT 'SCHEDULED_POLLING',
  maturity_state VARCHAR(64) NOT NULL DEFAULT 'CATALOG_ONLY',
  health_state VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN',
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  credential_reference VARCHAR(255),
  granted_scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  resource_scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  poll_interval_seconds INT NOT NULL DEFAULT 900,
  freshness_threshold_seconds INT NOT NULL DEFAULT 3600,
  checkpoint JSONB DEFAULT '{}'::jsonb,
  last_successful_sync_at TIMESTAMPTZ,
  last_failed_sync_at TIMESTAMPTZ,
  last_error TEXT,
  consecutive_failure_count INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  disconnected_at TIMESTAMPTZ,
  credential_revoked_at TIMESTAMPTZ,
  record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT monitoring_integrations_tenant_connector_unique UNIQUE (tenant_id, connector_id)
);

CREATE INDEX IF NOT EXISTS idx_monitoring_integrations_tenant ON monitoring_integrations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_integrations_health ON monitoring_integrations (tenant_id, health_state);

-- ---------------------------------------------------------------------------
-- 2. MONITORING SIGNALS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_signals (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  integration_id VARCHAR(128) NOT NULL,
  connector_id VARCHAR(128) NOT NULL,
  provider VARCHAR(128) NOT NULL,
  provider_event_id VARCHAR(255) NOT NULL,
  provider_event_type VARCHAR(128) NOT NULL,
  signal_type VARCHAR(64) NOT NULL,
  canonical_entity_type VARCHAR(32) NOT NULL,
  canonical_entity_id VARCHAR(255),
  resource_ref VARCHAR(512) NOT NULL,
  observed_state JSONB,
  previous_state JSONB,
  source_observed_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_revision VARCHAR(255),
  severity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
  correlation_id VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  processing_status VARCHAR(64) NOT NULL DEFAULT 'RECEIVED',
  source_event_sha256 VARCHAR(64),
  evaluated_control_ids JSONB DEFAULT '[]'::jsonb,
  rejection_reason TEXT,
  record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Duplicate suppression is enforced by the database, not only in memory.
  CONSTRAINT monitoring_signals_idempotency_unique UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_monitoring_signals_tenant_ingested ON monitoring_signals (tenant_id, ingested_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_signals_status ON monitoring_signals (tenant_id, processing_status);
CREATE INDEX IF NOT EXISTS idx_monitoring_signals_resource ON monitoring_signals (tenant_id, resource_ref);

-- ---------------------------------------------------------------------------
-- 3. MONITORING JOBS (DURABLE QUEUE)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_jobs (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  job_type VARCHAR(64) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  correlation_id VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  record JSONB,
  CONSTRAINT monitoring_jobs_idempotency_unique UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_claimable
  ON monitoring_jobs (tenant_id, status, next_attempt_at);

-- ---------------------------------------------------------------------------
-- 4. MONITORING DEAD LETTERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_dead_letters (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  job_id VARCHAR(128) NOT NULL,
  job_type VARCHAR(64) NOT NULL,
  correlation_id VARCHAR(128),
  failure_reason TEXT NOT NULL,
  payload JSONB NOT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  dead_lettered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(32) NOT NULL DEFAULT 'DEAD_LETTER',
  replayed_at TIMESTAMPTZ,
  replay_attempt_ids JSONB DEFAULT '[]'::jsonb,
  record JSONB
);

CREATE INDEX IF NOT EXISTS idx_monitoring_dead_letters_tenant ON monitoring_dead_letters (tenant_id, dead_lettered_at DESC);

-- ---------------------------------------------------------------------------
-- 5. CONTROL EVALUATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS control_evaluations (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  signal_id VARCHAR(128) NOT NULL,
  integration_id VARCHAR(128),
  control_id VARCHAR(128) NOT NULL,
  control_code VARCHAR(128) NOT NULL,
  control_version VARCHAR(32) NOT NULL,
  rule_id VARCHAR(128) NOT NULL,
  rule_version VARCHAR(32) NOT NULL,
  resource_ref VARCHAR(512) NOT NULL,
  result VARCHAR(32) NOT NULL,
  expected_condition TEXT,
  actual_condition TEXT,
  reason TEXT,
  failure_explanation TEXT,
  remediation_guidance TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_observed_at TIMESTAMPTZ,
  evidence_id VARCHAR(128),
  evaluated_from_reconciliation BOOLEAN NOT NULL DEFAULT false,
  record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_control_evaluations_tenant_control ON control_evaluations (tenant_id, control_id, evaluated_at DESC);

-- ---------------------------------------------------------------------------
-- 6. CONTROL MONITORING STATES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS control_monitoring_states (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  control_id VARCHAR(128) NOT NULL,
  control_code VARCHAR(128) NOT NULL,
  control_version VARCHAR(32) NOT NULL,
  rule_id VARCHAR(128) NOT NULL,
  rule_version VARCHAR(32) NOT NULL,
  resource_ref VARCHAR(512) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'NOT_EVALUATED',
  last_known_status VARCHAR(32) NOT NULL DEFAULT 'NOT_EVALUATED',
  last_signal_id VARCHAR(128),
  last_evaluation_id VARCHAR(128),
  last_successful_collection_at TIMESTAMPTZ,
  last_source_observation_at TIMESTAMPTZ,
  last_evaluated_at TIMESTAMPTZ,
  expected_collection_interval_seconds INT NOT NULL DEFAULT 900,
  freshness_threshold_seconds INT NOT NULL DEFAULT 3600,
  is_stale BOOLEAN NOT NULL DEFAULT false,
  monitoring_failure BOOLEAN NOT NULL DEFAULT false,
  monitoring_failure_reason TEXT,
  failure_kind VARCHAR(32) NOT NULL DEFAULT 'NONE',
  open_finding_id VARCHAR(128),
  consecutive_failure_count INT NOT NULL DEFAULT 0,
  record JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT control_monitoring_states_unique UNIQUE (tenant_id, rule_id, resource_ref)
);

CREATE INDEX IF NOT EXISTS idx_control_monitoring_states_status ON control_monitoring_states (tenant_id, status);

-- ---------------------------------------------------------------------------
-- 7. CONTROL STATE TRANSITIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS control_state_transitions (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  control_id VARCHAR(128) NOT NULL,
  control_code VARCHAR(128) NOT NULL,
  resource_ref VARCHAR(512) NOT NULL,
  previous_status VARCHAR(32) NOT NULL,
  new_status VARCHAR(32) NOT NULL,
  trigger_kind VARCHAR(32) NOT NULL,
  trigger_signal_id VARCHAR(128),
  rule_id VARCHAR(128) NOT NULL,
  rule_version VARCHAR(32) NOT NULL,
  evidence_id VARCHAR(128),
  source_observed_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL,
  finding_id VARCHAR(128),
  notification_id VARCHAR(128),
  record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_control_state_transitions_tenant ON control_state_transitions (tenant_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_control_state_transitions_control ON control_state_transitions (tenant_id, control_id, resource_ref);

-- ---------------------------------------------------------------------------
-- 8. MONITORING FINDING LINKS (DEDUPLICATION)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_finding_links (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(128) NOT NULL,
  dedup_key VARCHAR(512) NOT NULL,
  control_id VARCHAR(128) NOT NULL,
  control_code VARCHAR(128) NOT NULL,
  resource_ref VARCHAR(512) NOT NULL,
  rule_id VARCHAR(128) NOT NULL,
  rule_version VARCHAR(32) NOT NULL,
  canonical_finding_id VARCHAR(128) NOT NULL,
  domain_finding_status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  severity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  occurrence_count INT NOT NULL DEFAULT 1,
  last_signal_id VARCHAR(128),
  evidence_ids JSONB DEFAULT '[]'::jsonb,
  owner_email VARCHAR(255),
  remediation_task_id VARCHAR(128),
  awaiting_retest_since TIMESTAMPTZ,
  retest_signal_id VARCHAR(128),
  verified_recovered_at TIMESTAMPTZ,
  reopened_count INT NOT NULL DEFAULT 0,
  record JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One finding per (control, resource, rule) while the condition persists.
  CONSTRAINT monitoring_finding_links_dedup_unique UNIQUE (tenant_id, dedup_key)
);

CREATE INDEX IF NOT EXISTS idx_monitoring_finding_links_status ON monitoring_finding_links (tenant_id, domain_finding_status);

-- ---------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'monitoring_integrations',
    'monitoring_signals',
    'monitoring_jobs',
    'monitoring_dead_letters',
    'control_evaluations',
    'control_monitoring_states',
    'control_state_transitions',
    'monitoring_finding_links'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', t || '_tenant_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (get_current_tenant_id_text() IS NOT NULL AND tenant_id = get_current_tenant_id_text());',
      t || '_tenant_select', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', t || '_tenant_insert', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (get_current_tenant_id_text() IS NOT NULL AND tenant_id = get_current_tenant_id_text());',
      t || '_tenant_insert', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', t || '_tenant_update', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (get_current_tenant_id_text() IS NOT NULL AND tenant_id = get_current_tenant_id_text()) WITH CHECK (tenant_id = get_current_tenant_id_text());',
      t || '_tenant_update', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', t || '_tenant_delete', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (get_current_tenant_id_text() IS NOT NULL AND tenant_id = get_current_tenant_id_text());',
      t || '_tenant_delete', t
    );
  END LOOP;
END $$;

-- Platform administrators keep read visibility for operational support.
-- (Set app.is_platform_admin = 'true' in an audited maintenance session only.)
