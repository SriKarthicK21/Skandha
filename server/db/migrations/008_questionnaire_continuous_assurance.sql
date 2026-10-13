-- ============================================================================
-- SKANDA QUESTIONNAIRE CONTINUOUS ASSURANCE SCHEMA (MIGRATION 008)
-- Path: server/db/migrations/008_questionnaire_continuous_assurance.sql
--
-- Purpose: make a questionnaire answer a LIVING assurance artifact. Once an
-- answer cites evidence, a control or an approval, SKANDA records that
-- dependency so a later change in the underlying fact can be detected and the
-- answer routed for revalidation — instead of the answer silently becoming
-- untrue.
--
-- Dependency graph stored here:
--   answer -> claim -> control / control test / evidence / policy /
--                     integration / risk-or-exception / approval / scope
--
-- Same storage strategy as migration 006: explicit relational columns for the
-- fields the platform constrains, filters and enforces tenant relationships on,
-- plus a `record JSONB` column holding the complete canonical domain object.
--
-- Tables:
--   1. answer_assurance_dependencies    (dependency graph edges + clocks)
--   2. monitoring_source_change_events  (durable, idempotent change inbox)
--   3. answer_revalidation_events       (version-preserving revalidation record)
--   4. Row Level Security per tenant
--
-- Tenant identity note: tenant identity is carried as text
-- (e.g. 'tenant-acme-corp'), matching the verified JWT claim used by
-- server/middleware/authMiddleware.ts. RLS compares the text session variable
-- rather than casting to UUID, exactly as migration 006 does.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. ANSWER DRAFT STATE: add REVALIDATION_REQUIRED
-- ----------------------------------------------------------------------------
-- Migration 006 constrained answer_drafts.status to the original lifecycle. The
-- continuous-assurance engine adds REVALIDATION_REQUIRED, so the constraint is
-- widened here. Because the answer is no longer APPROVED, the existing export
-- preflight (which only releases APPROVED responses) blocks it automatically.
ALTER TABLE answer_drafts DROP CONSTRAINT IF EXISTS answer_drafts_status_check;
ALTER TABLE answer_drafts ADD CONSTRAINT answer_drafts_status_check CHECK (status IN (
  'DRAFT','GENERATED','IN_REVIEW','CHANGES_REQUESTED','APPROVED','REJECTED','SUPERSEDED','BLOCKED_UNSUPPORTED','REVALIDATION_REQUIRED'
));

-- ----------------------------------------------------------------------------
-- 1. ANSWER ASSURANCE DEPENDENCIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer_assurance_dependencies (
  id VARCHAR(200) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_id VARCHAR(128) NOT NULL,
  answer_draft_id VARCHAR(160) NOT NULL,
  answer_status_at_link VARCHAR(32) NOT NULL,
  required_reviewer_role VARCHAR(96) NOT NULL DEFAULT '',
  -- Distinct clocks, stored separately on purpose: an answer is not revised
  -- merely because it was re-read.
  source_observed_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL CHECK (status IN ('CURRENT','REVALIDATION_REQUIRED','SUPERSEDED')),
  version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One live dependency row per answer per version of that answer.
  CONSTRAINT uq_assurance_dependency_answer UNIQUE (answer_draft_id)
);

CREATE INDEX IF NOT EXISTS idx_assurance_dep_tenant_questionnaire
  ON answer_assurance_dependencies(tenant_id, questionnaire_id, status);
CREATE INDEX IF NOT EXISTS idx_assurance_dep_tenant_draft
  ON answer_assurance_dependencies(tenant_id, answer_draft_id);

-- ----------------------------------------------------------------------------
-- 2. MONITORING SOURCE CHANGE EVENTS (durable inbox)
-- ----------------------------------------------------------------------------
-- A retried or replayed change notification must never produce a second
-- revalidation, so the idempotency key is a database-level unique constraint and
-- not merely an application check.
CREATE TABLE IF NOT EXISTS monitoring_source_change_events (
  id VARCHAR(160) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
  monitoring_mode VARCHAR(32) NOT NULL CHECK (monitoring_mode IN ('EVENT_DRIVEN','SCHEDULED_POLLING','MANUAL_REFRESH')),
  kind VARCHAR(64) NOT NULL,
  source_kind VARCHAR(32) NOT NULL CHECK (source_kind IN (
    'CONTROL','CONTROL_TEST','EVIDENCE','POLICY','RISK_OR_EXCEPTION','INTEGRATION','APPROVAL','SCOPE','FRAMEWORK_REQUIREMENT'
  )),
  source_id VARCHAR(255) NOT NULL,
  correlation_id VARCHAR(128) NOT NULL DEFAULT '',
  idempotency_key VARCHAR(512) NOT NULL,
  payload_digest CHAR(64) NOT NULL,
  source_observed_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN (
    'PENDING','PROCESSED','NO_DEPENDENTS','DUPLICATE_SUPPRESSED','REJECTED','DEAD_LETTER'
  )),
  attempts INT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INT NOT NULL DEFAULT 3 CHECK (max_attempts >= 1),
  processing_latency_ms INT CHECK (processing_latency_ms IS NULL OR processing_latency_ms >= 0),
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_source_change_idempotency UNIQUE (tenant_id, idempotency_key),
  -- A dead letter must carry the reason it could not be processed.
  CONSTRAINT ck_source_change_dead_letter_reason
    CHECK (status <> 'DEAD_LETTER' OR (record -> 'lastError') IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_source_change_tenant_status
  ON monitoring_source_change_events(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_change_tenant_source
  ON monitoring_source_change_events(tenant_id, source_kind, source_id);

-- ----------------------------------------------------------------------------
-- 3. ANSWER REVALIDATION EVENTS
-- ----------------------------------------------------------------------------
-- Hardware-level guarantee that replaying the same change for the same answer
-- cannot create a duplicate revalidation record (or a duplicate notification).
CREATE TABLE IF NOT EXISTS answer_revalidation_events (
  id VARCHAR(200) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_id VARCHAR(128) NOT NULL,
  answer_draft_id VARCHAR(160) NOT NULL,
  dependency_id VARCHAR(200) NOT NULL,
  source_change_id VARCHAR(160) NOT NULL,
  trigger_kind VARCHAR(64) NOT NULL,
  monitoring_mode VARCHAR(32) NOT NULL,
  trigger_source_kind VARCHAR(32) NOT NULL,
  trigger_source_id VARCHAR(255) NOT NULL,
  assurance_state VARCHAR(16) NOT NULL CHECK (assurance_state IN ('STALE','UNKNOWN')),
  previous_status VARCHAR(32) NOT NULL,
  new_status VARCHAR(32) NOT NULL,
  previous_answer_version INT NOT NULL DEFAULT 1 CHECK (previous_answer_version >= 1),
  new_answer_version INT NOT NULL DEFAULT 1 CHECK (new_answer_version >= 1),
  approved_text_preserved BOOLEAN NOT NULL DEFAULT true,
  approval_invalidated BOOLEAN NOT NULL DEFAULT true,
  notification_dedupe_key VARCHAR(512) NOT NULL,
  notification_suppressed BOOLEAN NOT NULL DEFAULT false,
  source_observed_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Same change, same answer = one revalidation record (replay safety).
  CONSTRAINT uq_revalidation_change_answer UNIQUE (source_change_id, answer_draft_id)
);

CREATE INDEX IF NOT EXISTS idx_revalidation_tenant_questionnaire
  ON answer_revalidation_events(tenant_id, questionnaire_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revalidation_tenant_answer
  ON answer_revalidation_events(tenant_id, answer_draft_id);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY PER TENANT
-- ----------------------------------------------------------------------------
-- FORCE ROW LEVEL SECURITY ensures the policies also apply to the table owner,
-- so an application-level role cannot bypass tenant isolation.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'answer_assurance_dependencies',
    'monitoring_source_change_events',
    'answer_revalidation_events'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (tenant_id = get_current_tenant_id_text() OR is_platform_admin_text())',
      t || '_tenant_select', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_modify', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (tenant_id = get_current_tenant_id_text() OR is_platform_admin_text()) '
      'WITH CHECK (tenant_id = get_current_tenant_id_text() OR is_platform_admin_text())',
      t || '_tenant_modify', t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 5. RETENTION / DELETION BEHAVIOUR
-- ----------------------------------------------------------------------------
-- Dependencies and revalidation events cascade with their questionnaire: they
-- are derived assurance data. The audit trail for the same actions lives in
-- questionnaire_audit_events (explicitly removed by the deletion workflow so
-- deletion stays auditable) and is mirrored into EnterpriseAuditService, which
-- is never deleted with the questionnaire.
CREATE INDEX IF NOT EXISTS idx_revalidation_retention ON answer_revalidation_events(tenant_id, created_at);
