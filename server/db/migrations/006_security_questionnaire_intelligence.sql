-- ============================================================================
-- SKANDA SECURITY QUESTIONNAIRE INTELLIGENCE SCHEMA (MIGRATION 006)
-- Path: server/db/migrations/006_security_questionnaire_intelligence.sql
--
-- Storage strategy (documented deliberately):
--   Each aggregate carries explicit relational columns for the fields the
--   platform filters, orders, constrains and enforces tenant relationships on
--   (id, tenant_id, questionnaire_id, status, order, hashes, timestamps) PLUS a
--   `record JSONB` column holding the complete domain object. This gives
--   relational integrity and index performance while guaranteeing lossless
--   round-tripping of the canonical TypeScript domain model.
--
-- Tables:
--   1.  questionnaires                  (import aggregate + lifecycle history)
--   2.  questionnaire_questions         (extracted questions, order preserving)
--   3.  question_requirements           (classification + answerable claims)
--   4.  answer_drafts                   (versioned generated/edited answers)
--   5.  answer_reviews                  (review workflow actions)
--   6.  answer_approvals                (server-recorded human approvals)
--   7.  questionnaire_gaps              (answer gaps, evidence signals, deficiencies)
--   8.  questionnaire_exports           (generated artifacts + preflight result)
--   9.  questionnaire_audit_events      (chained questionnaire audit history)
--   10. answer_library_entries          (governed reusable approved answers)
--   11. trust_center_disclosures        (authorised external disclosures)
--   12. approved_organizational_facts   (governed organizational facts)
--   13. questionnaire_jobs              (idempotent background processing)
--   14. Row Level Security per tenant
--
-- Tenant identity note: the platform carries tenant identity as a string
-- (e.g. 'tenant-acme-corp'), matching the JWT claim used by
-- server/middleware/authMiddleware.ts. RLS therefore compares the text session
-- variable rather than casting to UUID.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TENANT SESSION CONTEXT (text form; complements migration 002's UUID helper)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_tenant_id_text() RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_platform_admin_text() RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.is_platform_admin', true) = 'true';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- ----------------------------------------------------------------------------
-- 1. QUESTIONNAIRES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questionnaires (
  id VARCHAR(96) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
  title VARCHAR(512) NOT NULL,
  requesting_organization VARCHAR(512) NOT NULL DEFAULT '',
  questionnaire_identifier VARCHAR(255) NOT NULL DEFAULT '',
  source_format VARCHAR(8) NOT NULL CHECK (source_format IN ('XLSX', 'CSV', 'DOCX', 'PDF')),
  status VARCHAR(32) NOT NULL CHECK (status IN (
    'IMPORTED','EXTRACTING','EXTRACTION_REVIEW','ANALYZING','DRAFTING','IN_REVIEW',
    'READY_FOR_EXPORT','EXPORTED','CLOSED','FAILED'
  )),
  question_count INT NOT NULL DEFAULT 0 CHECK (question_count >= 0),
  idempotency_key VARCHAR(255) NOT NULL,
  source_sha256 CHAR(64) NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_questionnaire_idempotency UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_questionnaires_tenant_status ON questionnaires(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_questionnaires_tenant_created ON questionnaires(tenant_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. EXTRACTED QUESTIONS (order preserving; one row per source question)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_questions (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_order INT NOT NULL CHECK (question_order >= 1),
  mandatory BOOLEAN NOT NULL DEFAULT false,
  requires_human_correction BOOLEAN NOT NULL DEFAULT false,
  extraction_confidence INT NOT NULL DEFAULT 0 CHECK (extraction_confidence BETWEEN 0 AND 100),
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevents duplicate questions when an import job is retried.
  CONSTRAINT uq_question_order UNIQUE (questionnaire_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_questions_tenant_questionnaire ON questionnaire_questions(tenant_id, questionnaire_id, question_order);
CREATE INDEX IF NOT EXISTS idx_questions_correction_needed ON questionnaire_questions(tenant_id, requires_human_correction);

-- ----------------------------------------------------------------------------
-- 3. QUESTION REQUIREMENTS (classification result)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS question_requirements (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_id VARCHAR(128) NOT NULL,
  primary_category VARCHAR(64) NOT NULL,
  is_multi_part BOOLEAN NOT NULL DEFAULT false,
  specialist_approval_required BOOLEAN NOT NULL DEFAULT false,
  classification_confidence INT NOT NULL DEFAULT 0 CHECK (classification_confidence BETWEEN 0 AND 100),
  knowledge_key VARCHAR(512) NOT NULL,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_requirement_question UNIQUE (question_id)
);

CREATE INDEX IF NOT EXISTS idx_requirements_tenant_questionnaire ON question_requirements(tenant_id, questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_requirements_knowledge_key ON question_requirements(tenant_id, knowledge_key);

-- ----------------------------------------------------------------------------
-- 4. ANSWER DRAFTS (versioned; previous wording retained)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer_drafts (
  id VARCHAR(160) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_id VARCHAR(128) NOT NULL,
  version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
  status VARCHAR(32) NOT NULL CHECK (status IN (
    'DRAFT','GENERATED','IN_REVIEW','CHANGES_REQUESTED','APPROVED','REJECTED','SUPERSEDED','BLOCKED_UNSUPPORTED'
  )),
  disposition VARCHAR(40) NOT NULL,
  sufficiency VARCHAR(20) NOT NULL CHECK (sufficiency IN ('SUFFICIENT','PARTIAL','INSUFFICIENT','CONTRADICTED','NOT_APPLICABLE')),
  confidence_estimate INT NOT NULL DEFAULT 0 CHECK (confidence_estimate BETWEEN 0 AND 100),
  generated_at TIMESTAMPTZ NOT NULL,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drafts_tenant_questionnaire ON answer_drafts(tenant_id, questionnaire_id, status);
CREATE INDEX IF NOT EXISTS idx_drafts_question ON answer_drafts(tenant_id, question_id);

-- ----------------------------------------------------------------------------
-- 5. ANSWER REVIEWS (workflow actions with full actor attribution)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer_reviews (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  answer_draft_id VARCHAR(160) NOT NULL,
  question_id VARCHAR(128) NOT NULL,
  action VARCHAR(32) NOT NULL CHECK (action IN (
    'SUBMIT_FOR_REVIEW','APPROVE','REJECT','REQUEST_CHANGES','REQUEST_INFORMATION','REASSIGN','EDIT_DRAFT','SUPERSEDE'
  )),
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(128) NOT NULL,
  previous_status VARCHAR(32) NOT NULL,
  new_status VARCHAR(32) NOT NULL,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_tenant_questionnaire ON answer_reviews(tenant_id, questionnaire_id, created_at);

-- ----------------------------------------------------------------------------
-- 6. ANSWER APPROVALS (server-recorded; material claims need a reviewer role)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer_approvals (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  answer_draft_id VARCHAR(160) NOT NULL,
  question_id VARCHAR(128) NOT NULL,
  approved_by_email VARCHAR(255) NOT NULL,
  approved_by_role VARCHAR(128) NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL,
  approved_content_hash CHAR(64) NOT NULL,
  material_claim_class VARCHAR(24) NOT NULL CHECK (material_claim_class IN (
    'SECURITY','PRIVACY','REGULATORY','CERTIFICATION','CONTRACTUAL','GENERAL'
  )),
  generator_approved_own_draft BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_approval_draft UNIQUE (answer_draft_id),
  -- Material claims may never be approved by a read-only/automation actor, and
  -- the approved content hash is mandatory evidence of what was approved.
  CONSTRAINT chk_approval_material_role CHECK (
    material_claim_class = 'GENERAL'
    OR approved_by_role NOT IN ('READ_ONLY','READ ONLY','SYSTEM','DRAFT_ENGINE','AUTOMATION')
  ),
  CONSTRAINT chk_approval_hash_present CHECK (length(approved_content_hash) = 64)
);

CREATE INDEX IF NOT EXISTS idx_approvals_tenant_questionnaire ON answer_approvals(tenant_id, questionnaire_id);

-- ----------------------------------------------------------------------------
-- 7. QUESTIONNAIRE GAPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_gaps (
  id VARCHAR(200) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_id VARCHAR(128) NOT NULL,
  gap_type VARCHAR(48) NOT NULL,
  classification VARCHAR(40) NOT NULL CHECK (classification IN (
    'QUESTIONNAIRE_ANSWER_GAP','MISSING_EVIDENCE_SIGNAL','CONFIRMED_CONTROL_DEFICIENCY',
    'VERIFIED_CONTROL_TEST_FAILURE','REMEDIATION_ACTION'
  )),
  severity VARCHAR(12) NOT NULL CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  status VARCHAR(24) NOT NULL CHECK (status IN ('OPEN','OWNER_NOTIFIED','RESOLVED','ACCEPTED_RISK')),
  remediation_created BOOLEAN NOT NULL DEFAULT false,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gaps_tenant_questionnaire ON questionnaire_gaps(tenant_id, questionnaire_id, status);
CREATE INDEX IF NOT EXISTS idx_gaps_classification ON questionnaire_gaps(tenant_id, classification);

-- ----------------------------------------------------------------------------
-- 8. QUESTIONNAIRE EXPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_exports (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  format VARCHAR(8) NOT NULL CHECK (format IN ('XLSX','CSV','DOCX','PDF')),
  sha256_digest CHAR(64) NOT NULL,
  storage_locator TEXT NOT NULL,
  generated_by VARCHAR(255) NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  approved_exception_id VARCHAR(128),
  questions_populated INT NOT NULL DEFAULT 0 CHECK (questions_populated >= 0),
  questions_unresolved INT NOT NULL DEFAULT 0 CHECK (questions_unresolved >= 0),
  unrelated_content_preserved BOOLEAN NOT NULL DEFAULT false,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exports_tenant_questionnaire ON questionnaire_exports(tenant_id, questionnaire_id, generated_at DESC);

-- ----------------------------------------------------------------------------
-- 9. QUESTIONNAIRE AUDIT EVENTS (chained integrity hash)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_audit_events (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(32) NOT NULL,
  entity_id VARCHAR(200) NOT NULL,
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(128) NOT NULL,
  at TIMESTAMPTZ NOT NULL,
  previous_hash CHAR(64) NOT NULL,
  integrity_hash CHAR(64) NOT NULL,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_q_audit_tenant ON questionnaire_audit_events(tenant_id, questionnaire_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_q_audit_action ON questionnaire_audit_events(tenant_id, action);

-- ----------------------------------------------------------------------------
-- 10. GOVERNED ANSWER LIBRARY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer_library_entries (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  category VARCHAR(64) NOT NULL,
  knowledge_key VARCHAR(512) NOT NULL,
  approval_status VARCHAR(24) NOT NULL CHECK (approval_status IN ('APPROVED','PENDING_REVALIDATION','EXPIRED','REVOKED')),
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- An entry may only be APPROVED when an approver and approval time exist.
  CONSTRAINT chk_library_approved_requires_approver CHECK (
    approval_status <> 'APPROVED' OR (approved_by IS NOT NULL AND approved_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_library_tenant_status ON answer_library_entries(tenant_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_library_tenant_knowledge ON answer_library_entries(tenant_id, knowledge_key);

-- ----------------------------------------------------------------------------
-- 11. TRUST CENTER DISCLOSURES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trust_center_disclosures (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  title VARCHAR(512) NOT NULL,
  category VARCHAR(48) NOT NULL,
  status VARCHAR(28) NOT NULL CHECK (status IN ('DRAFT','PENDING_AUTHORIZATION','AUTHORIZED','WITHDRAWN','EXPIRED')),
  version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
  authorized_by VARCHAR(255),
  authorized_by_role VARCHAR(128),
  authorized_at TIMESTAMPTZ,
  effective_from TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Enforces "no authorized disclosure -> no external publication" at the
  -- database level: nothing may be AUTHORIZED without a named authoriser.
  CONSTRAINT chk_disclosure_requires_authorizer CHECK (
    status <> 'AUTHORIZED' OR (authorized_by IS NOT NULL AND authorized_at IS NOT NULL)
  ),
  CONSTRAINT chk_disclosure_withdrawal CHECK (
    status <> 'WITHDRAWN' OR withdrawn_at IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_disclosures_tenant_status ON trust_center_disclosures(tenant_id, status);

-- ----------------------------------------------------------------------------
-- 12. APPROVED ORGANIZATIONAL FACTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approved_organizational_facts (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  title VARCHAR(512) NOT NULL,
  category VARCHAR(64) NOT NULL,
  fact_value JSONB NOT NULL,
  approved_by VARCHAR(255) NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  control_code VARCHAR(64),
  record JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_facts_tenant ON approved_organizational_facts(tenant_id, category);

-- ----------------------------------------------------------------------------
-- 13. QUESTIONNAIRE JOBS (idempotent background processing)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questionnaire_jobs (
  id VARCHAR(128) PRIMARY KEY,
  tenant_id VARCHAR(96) NOT NULL,
  questionnaire_id VARCHAR(96) NOT NULL,
  kind VARCHAR(24) NOT NULL CHECK (kind IN ('IMPORT','EXTRACT','ANALYZE','GENERATE_DRAFTS','EXPORT')),
  status VARCHAR(24) NOT NULL CHECK (status IN ('QUEUED','RUNNING','SUCCEEDED','FAILED','PARTIALLY_SUCCEEDED','CANCELLED')),
  idempotency_key VARCHAR(255) NOT NULL,
  attempt INT NOT NULL DEFAULT 1 CHECK (attempt >= 1),
  max_attempts INT NOT NULL DEFAULT 3,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  record JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A retried job with the same key updates the existing row instead of
  -- crashing or duplicating work.
  CONSTRAINT uq_job_idempotency UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant_questionnaire ON questionnaire_jobs(tenant_id, questionnaire_id, status);

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'questionnaires',
    'questionnaire_questions',
    'question_requirements',
    'answer_drafts',
    'answer_reviews',
    'answer_approvals',
    'questionnaire_gaps',
    'questionnaire_exports',
    'questionnaire_audit_events',
    'answer_library_entries',
    'trust_center_disclosures',
    'approved_organizational_facts',
    'questionnaire_jobs'
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
-- 15. RETENTION / DELETION BEHAVIOUR
-- ----------------------------------------------------------------------------
-- Deleting a questionnaire cascades to questions, requirements, drafts, reviews,
-- approvals, gaps, exports and jobs (all declared ON DELETE CASCADE).
-- questionnaire_audit_events intentionally has NO database-level cascade: the
-- domain deletion workflow removes it explicitly so deletion stays auditable,
-- and every action is ALSO mirrored into the platform audit trail
-- (EnterpriseAuditService), which is not deleted with the questionnaire.
CREATE INDEX IF NOT EXISTS idx_q_audit_retention ON questionnaire_audit_events(tenant_id, at);
