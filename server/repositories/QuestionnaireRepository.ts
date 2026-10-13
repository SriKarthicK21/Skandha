// ============================================================================
// SKANDA SECURITY QUESTIONNAIRE INTELLIGENCE: PERSISTENCE REPOSITORY
// Path: server/repositories/QuestionnaireRepository.ts
//
// Two interchangeable implementations behind one interface:
//   1. PostgresQuestionnaireRepository  — used whenever DATABASE_URL is set.
//      Row Level Security is enforced by migration 006 in addition to the
//      explicit tenant_id predicates used by every query.
//   2. DurableJsonQuestionnaireRepository — atomic-write JSON fallback for
//      local development and test. It is NOT an in-memory Map: records survive
//      process restarts and every read is tenant-scoped.
//
// In NODE_ENV=production a durable store is mandatory (see PostgresConnectionManager);
// the JSON fallback is refused for the questionnaire domain in production unless
// SKANDA_ALLOW_JSON_PERSISTENCE=true is explicitly set.
// ============================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import {
  AnswerApproval,
  AnswerAssuranceDependency,
  AnswerDraft,
  AnswerRevalidationEvent,
  ExtractedQuestion,
  GovernedAnswerLibraryEntry,
  Questionnaire,
  QuestionnaireAuditEvent,
  QuestionnaireExport,
  QuestionnaireGap,
  QuestionnaireJob,
  RequirementAnalysis,
  SourceChangeRecord,
  SourceChangeStatus,
  TrustCenterDisclosure
} from '../../src/types/questionnaireIntelligenceTypes.js';
import { AnswerReview } from '../../src/types/questionnaireIntelligenceTypes.js';
import { enterpriseAuditService } from '../services/EnterpriseAuditService.js';

export interface ApprovedOrganizationalFact {
  id: string;
  tenantId: string;
  title: string;
  statement: string;
  value: boolean | string | number;
  category: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt?: string;
  affectsClaimCode?: string;
  controlCode?: string;
  organizationalScope: string[];
}

export interface QuestionnaireListOptions {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface IQuestionnaireDataStore {
  // Questionnaire aggregate
  saveQuestionnaire(questionnaire: Questionnaire): Promise<Questionnaire>;
  getQuestionnaire(tenantId: string, id: string): Promise<Questionnaire | null>;
  listQuestionnaires(tenantId: string, options?: QuestionnaireListOptions): Promise<Paginated<Questionnaire>>;

  // Questions
  upsertQuestions(tenantId: string, questionnaireId: string, questions: ExtractedQuestion[]): Promise<number>;
  listQuestions(tenantId: string, questionnaireId: string, options?: { limit?: number; offset?: number }): Promise<Paginated<ExtractedQuestion>>;
  getQuestion(tenantId: string, questionId: string): Promise<ExtractedQuestion | null>;
  deleteQuestionsForQuestionnaire(tenantId: string, questionnaireId: string): Promise<number>;

  // Requirements
  upsertRequirements(tenantId: string, requirements: RequirementAnalysis[]): Promise<number>;
  listRequirements(tenantId: string, questionnaireId: string): Promise<RequirementAnalysis[]>;
  getRequirementForQuestion(tenantId: string, questionId: string): Promise<RequirementAnalysis | null>;

  // Drafts (versioned)
  saveDraft(draft: AnswerDraft): Promise<AnswerDraft>;
  getDraft(tenantId: string, draftId: string): Promise<AnswerDraft | null>;
  getLatestDraftForQuestion(tenantId: string, questionId: string): Promise<AnswerDraft | null>;
  listDrafts(tenantId: string, questionnaireId: string): Promise<AnswerDraft[]>;
  updateDraft(tenantId: string, draftId: string, patch: Partial<AnswerDraft>): Promise<AnswerDraft>;

  // Reviews & approvals
  saveReview(review: AnswerReview): Promise<AnswerReview>;
  listReviews(tenantId: string, questionnaireId: string): Promise<AnswerReview[]>;
  saveApproval(approval: AnswerApproval): Promise<AnswerApproval>;
  listApprovals(tenantId: string, questionnaireId: string): Promise<AnswerApproval[]>;
  getApprovalForDraft(tenantId: string, draftId: string): Promise<AnswerApproval | null>;

  // Gaps
  upsertGaps(gaps: QuestionnaireGap[]): Promise<number>;
  listGaps(tenantId: string, questionnaireId: string, options?: { status?: string }): Promise<QuestionnaireGap[]>;
  updateGap(tenantId: string, gapId: string, patch: Partial<QuestionnaireGap>): Promise<QuestionnaireGap>;

  // Exports
  saveExport(record: QuestionnaireExport): Promise<QuestionnaireExport>;
  listExports(tenantId: string, questionnaireId: string): Promise<QuestionnaireExport[]>;

  // Audit
  appendAuditEvent(event: QuestionnaireAuditEvent): Promise<QuestionnaireAuditEvent>;
  listAuditEvents(tenantId: string, questionnaireId: string, limit?: number): Promise<QuestionnaireAuditEvent[]>;

  // Governed answer library
  listLibraryEntries(tenantId: string): Promise<GovernedAnswerLibraryEntry[]>;
  saveLibraryEntry(entry: GovernedAnswerLibraryEntry): Promise<GovernedAnswerLibraryEntry>;

  // Trust Center disclosures
  listDisclosures(tenantId: string): Promise<TrustCenterDisclosure[]>;
  saveDisclosure(disclosure: TrustCenterDisclosure): Promise<TrustCenterDisclosure>;

  // Approved organizational facts
  listOrgFacts(tenantId: string): Promise<ApprovedOrganizationalFact[]>;
  saveOrgFact(fact: ApprovedOrganizationalFact): Promise<ApprovedOrganizationalFact>;
  deleteOrgFact(tenantId: string, factId: string): Promise<boolean>;

  // Jobs
  saveJob(job: QuestionnaireJob): Promise<QuestionnaireJob>;
  getJobByKey(tenantId: string, idempotencyKey: string): Promise<QuestionnaireJob | null>;
  getJobById(tenantId: string, jobId: string): Promise<QuestionnaireJob | null>;
  listJobs(tenantId: string, questionnaireId: string): Promise<QuestionnaireJob[]>;

  // -- Continuous assurance: dependency graph, change inbox, revalidation --
  saveAssuranceDependency(dependency: AnswerAssuranceDependency): Promise<AnswerAssuranceDependency>;
  listAssuranceDependencies(
    tenantId: string,
    questionnaireId?: string
  ): Promise<AnswerAssuranceDependency[]>;
  getAssuranceDependencyForAnswer(
    tenantId: string,
    answerDraftId: string
  ): Promise<AnswerAssuranceDependency | null>;
  saveSourceChange(record: SourceChangeRecord): Promise<SourceChangeRecord>;
  getSourceChangeByKey(tenantId: string, idempotencyKey: string): Promise<SourceChangeRecord | null>;
  getSourceChangeById(tenantId: string, changeId: string): Promise<SourceChangeRecord | null>;
  listSourceChanges(
    tenantId: string,
    options?: { status?: SourceChangeStatus; limit?: number }
  ): Promise<SourceChangeRecord[]>;
  saveRevalidationEvent(event: AnswerRevalidationEvent): Promise<AnswerRevalidationEvent>;
  getRevalidationEventByKey(
    tenantId: string,
    dedupeKey: string
  ): Promise<AnswerRevalidationEvent | null>;
  listRevalidationEvents(
    tenantId: string,
    questionnaireId?: string
  ): Promise<AnswerRevalidationEvent[]>;

  // Deletion / retention
  deleteQuestionnaire(tenantId: string, questionnaireId: string): Promise<{ deleted: boolean; cascaded: Record<string, number> }>;

  getStorageType(): 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE';
  healthCheck(): Promise<{ healthy: boolean; detail: string }>;
}

// ---------------------------------------------------------------------------
// SHARED HELPERS
// ---------------------------------------------------------------------------

function assertTenantId(tenantId: string): void {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('Tenant id is required for every questionnaire data operation.');
  }
}

function paginate<T>(items: T[], options?: { limit?: number; offset?: number }): Paginated<T> {
  const limit = Math.max(1, Math.min(options?.limit ?? 50, 500));
  const offset = Math.max(0, options?.offset ?? 0);
  return { items: items.slice(offset, offset + limit), total: items.length, limit, offset };
}

/** Audit-chain hash for the questionnaire audit history (tamper evidence). */
export function computeAuditEventHash(previousHash: string, event: QuestionnaireAuditEvent): string {
  return crypto
    .createHash('sha256')
    .update(
      `${previousHash}|${event.tenantId}|${event.questionnaireId}|${event.action}|${event.entityId}|${event.actorEmail}|${event.at}|${event.summary}`
    )
    .digest('hex');
}

// ---------------------------------------------------------------------------
// DURABLE JSON IMPLEMENTATION
// ---------------------------------------------------------------------------

type JsonCollection =
  | 'questionnaires'
  | 'questions'
  | 'requirements'
  | 'drafts'
  | 'reviews'
  | 'approvals'
  | 'gaps'
  | 'exports'
  | 'auditEvents'
  | 'libraryEntries'
  | 'disclosures'
  | 'orgFacts'
  | 'jobs'
  | 'assuranceDependencies'
  | 'sourceChanges'
  | 'revalidationEvents';

interface JsonState {
  schemaVersion: number;
  auditChainHead: string;
  data: Record<JsonCollection, any[]>;
}

const EMPTY_STATE: JsonState = {
  schemaVersion: 1,
  auditChainHead: '0'.repeat(64),
  data: {
    questionnaires: [],
    questions: [],
    requirements: [],
    drafts: [],
    reviews: [],
    approvals: [],
    gaps: [],
    exports: [],
    auditEvents: [],
    libraryEntries: [],
    disclosures: [],
    orgFacts: [],
    jobs: [],
    assuranceDependencies: [],
    sourceChanges: [],
    revalidationEvents: []
  }
};

export class DurableJsonQuestionnaireRepository implements IQuestionnaireDataStore {
  private readonly filePath: string;

  constructor(customPath?: string) {
    this.filePath = customPath || path.join(process.cwd(), 'data', 'questionnaire_intelligence_store.json');
    this.ensureFile();
  }

  private ensureFile(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(EMPTY_STATE, null, 2), 'utf8');
    }
  }

  private load(): JsonState {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as JsonState;
      if (!parsed || typeof parsed !== 'object' || !parsed.data) return JSON.parse(JSON.stringify(EMPTY_STATE));
      for (const key of Object.keys(EMPTY_STATE.data) as JsonCollection[]) {
        if (!Array.isArray(parsed.data[key])) parsed.data[key] = [];
      }
      if (!parsed.auditChainHead) parsed.auditChainHead = '0'.repeat(64);
      return parsed;
    } catch {
      return JSON.parse(JSON.stringify(EMPTY_STATE));
    }
  }

  /** Atomic write via temp file + rename so a crash cannot corrupt the store. */
  private persist(state: JsonState): void {
    const tmp = `${this.filePath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tmp, this.filePath);
  }

  private collection<T>(state: JsonState, collection: JsonCollection, tenantId: string): T[] {
    return (state.data[collection] as any[]).filter(row => row.tenantId === tenantId) as T[];
  }

  private upsert(state: JsonState, collection: JsonCollection, record: any, key: string = 'id'): void {
    const rows = state.data[collection] as any[];
    const index = rows.findIndex(row => row[key] === record[key] && row.tenantId === record.tenantId);
    if (index >= 0) rows[index] = record;
    else rows.push(record);
  }

  async saveQuestionnaire(questionnaire: Questionnaire): Promise<Questionnaire> {
    assertTenantId(questionnaire.tenantId);
    const state = this.load();
    this.upsert(state, 'questionnaires', { ...questionnaire, updatedAt: new Date().toISOString() });
    this.persist(state);
    return questionnaire;
  }

  async getQuestionnaire(tenantId: string, id: string): Promise<Questionnaire | null> {
    assertTenantId(tenantId);
    return this.collection<Questionnaire>(this.load(), 'questionnaires', tenantId).find(q => q.id === id) || null;
  }

  async listQuestionnaires(tenantId: string, options?: QuestionnaireListOptions): Promise<Paginated<Questionnaire>> {
    assertTenantId(tenantId);
    let items = this.collection<Questionnaire>(this.load(), 'questionnaires', tenantId);
    if (options?.status) items = items.filter(q => q.status === options.status);
    if (options?.search) {
      const needle = options.search.toLowerCase();
      items = items.filter(
        q =>
          q.title.toLowerCase().includes(needle) ||
          q.requestingOrganization.toLowerCase().includes(needle) ||
          q.questionnaireIdentifier.toLowerCase().includes(needle)
      );
    }
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return paginate(items, options);
  }

  async upsertQuestions(tenantId: string, questionnaireId: string, questions: ExtractedQuestion[]): Promise<number> {
    assertTenantId(tenantId);
    const state = this.load();
    const existing = state.data.questions as any[];
    let written = 0;
    for (const question of questions) {
      const record = { ...question, tenantId, questionnaireId };
      // Idempotency: (questionnaireId, order) uniquely identifies a question, so
      // a retried import replaces rather than duplicates.
      const index = existing.findIndex(
        row => row.tenantId === tenantId && row.questionnaireId === questionnaireId && row.order === question.order
      );
      if (index >= 0) {
        // Preserve the original row id so answers keep pointing at the same question.
        record.id = existing[index].id;
        existing[index] = record;
      } else {
        existing.push(record);
      }
      written++;
    }
    this.persist(state);
    return written;
  }

  async listQuestions(
    tenantId: string,
    questionnaireId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Paginated<ExtractedQuestion>> {
    assertTenantId(tenantId);
    const items = this.collection<ExtractedQuestion>(this.load(), 'questions', tenantId)
      .filter(q => q.questionnaireId === questionnaireId)
      .sort((a, b) => a.order - b.order);
    return paginate(items, options);
  }

  async getQuestion(tenantId: string, questionId: string): Promise<ExtractedQuestion | null> {
    assertTenantId(tenantId);
    return this.collection<ExtractedQuestion>(this.load(), 'questions', tenantId).find(q => q.id === questionId) || null;
  }

  async deleteQuestionsForQuestionnaire(tenantId: string, questionnaireId: string): Promise<number> {
    assertTenantId(tenantId);
    const state = this.load();
    const before = state.data.questions.length;
    state.data.questions = (state.data.questions as any[]).filter(
      row => !(row.tenantId === tenantId && row.questionnaireId === questionnaireId)
    );
    this.persist(state);
    return before - state.data.questions.length;
  }

  async upsertRequirements(tenantId: string, requirements: RequirementAnalysis[]): Promise<number> {
    assertTenantId(tenantId);
    const state = this.load();
    for (const requirement of requirements) {
      this.upsert(state, 'requirements', { ...requirement, tenantId });
    }
    this.persist(state);
    return requirements.length;
  }

  async listRequirements(tenantId: string, questionnaireId: string): Promise<RequirementAnalysis[]> {
    assertTenantId(tenantId);
    return this.collection<RequirementAnalysis>(this.load(), 'requirements', tenantId).filter(
      r => r.questionnaireId === questionnaireId
    );
  }

  async getRequirementForQuestion(tenantId: string, questionId: string): Promise<RequirementAnalysis | null> {
    assertTenantId(tenantId);
    return (
      this.collection<RequirementAnalysis>(this.load(), 'requirements', tenantId).find(r => r.questionId === questionId) || null
    );
  }

  async saveDraft(draft: AnswerDraft): Promise<AnswerDraft> {
    assertTenantId(draft.tenantId);
    const state = this.load();
    const rows = state.data.drafts as any[];
    const existingIndex = rows.findIndex(row => row.id === draft.id && row.tenantId === draft.tenantId);
    if (existingIndex >= 0) {
      const previous = rows[existingIndex];
      // Version history is preserved by incrementing, never overwriting silently.
      rows[existingIndex] = {
        ...draft,
        version: Math.max(draft.version, (previous.version || 1) + (previous.customerFacingResponse !== draft.customerFacingResponse ? 1 : 0)),
        previousResponse: previous.customerFacingResponse,
        previousStatus: previous.status
      };
    } else {
      rows.push(draft);
    }
    this.persist(state);
    return draft;
  }

  async getDraft(tenantId: string, draftId: string): Promise<AnswerDraft | null> {
    assertTenantId(tenantId);
    return this.collection<AnswerDraft>(this.load(), 'drafts', tenantId).find(d => d.id === draftId) || null;
  }

  async getLatestDraftForQuestion(tenantId: string, questionId: string): Promise<AnswerDraft | null> {
    assertTenantId(tenantId);
    const drafts = this.collection<AnswerDraft>(this.load(), 'drafts', tenantId)
      .filter(d => d.questionId === questionId)
      .sort((a, b) => (a.generatedAt < b.generatedAt ? 1 : -1));
    return drafts[0] || null;
  }

  async listDrafts(tenantId: string, questionnaireId: string): Promise<AnswerDraft[]> {
    assertTenantId(tenantId);
    return this.collection<AnswerDraft>(this.load(), 'drafts', tenantId).filter(d => d.questionnaireId === questionnaireId);
  }

  async updateDraft(tenantId: string, draftId: string, patch: Partial<AnswerDraft>): Promise<AnswerDraft> {
    assertTenantId(tenantId);
    const state = this.load();
    const rows = state.data.drafts as any[];
    const index = rows.findIndex(row => row.tenantId === tenantId && row.id === draftId);
    if (index === -1) throw new Error(`Answer draft ${draftId} was not found for this tenant.`);
    rows[index] = { ...rows[index], ...patch };
    this.persist(state);
    return rows[index];
  }

  async saveReview(review: AnswerReview): Promise<AnswerReview> {
    assertTenantId(review.tenantId);
    const state = this.load();
    this.upsert(state, 'reviews', review);
    this.persist(state);
    return review;
  }

  async listReviews(tenantId: string, questionnaireId: string): Promise<AnswerReview[]> {
    assertTenantId(tenantId);
    return this.collection<AnswerReview>(this.load(), 'reviews', tenantId)
      .filter(r => r.questionnaireId === questionnaireId)
      .sort((a, b) => (a.at < b.at ? -1 : 1));
  }

  async saveApproval(approval: AnswerApproval): Promise<AnswerApproval> {
    assertTenantId(approval.tenantId);
    const state = this.load();
    this.upsert(state, 'approvals', approval);
    this.persist(state);
    return approval;
  }

  async listApprovals(tenantId: string, questionnaireId: string): Promise<AnswerApproval[]> {
    assertTenantId(tenantId);
    return this.collection<AnswerApproval>(this.load(), 'approvals', tenantId).filter(
      a => a.questionnaireId === questionnaireId
    );
  }

  async getApprovalForDraft(tenantId: string, draftId: string): Promise<AnswerApproval | null> {
    assertTenantId(tenantId);
    const approvals = this.collection<AnswerApproval>(this.load(), 'approvals', tenantId).filter(
      a => a.answerDraftId === draftId
    );
    if (approvals.length === 0) return null;
    // An answer can be approved more than once (approve -> revalidate ->
    // re-approve). The CURRENT approval is the most recent record: returning the
    // first one made a re-verified answer resolve to its stale approval.
    // Earlier approvals remain in history; they are simply not "the" approval.
    return [...approvals].sort((a, b) =>
      a.approvedAt < b.approvedAt ? 1 : a.approvedAt > b.approvedAt ? -1 : 0
    )[0];
  }

  async upsertGaps(gaps: QuestionnaireGap[]): Promise<number> {
    const state = this.load();
    for (const gap of gaps) {
      assertTenantId(gap.tenantId);
      // Gap ids are content-addressed, so a retried job updates rather than duplicates.
      this.upsert(state, 'gaps', gap);
    }
    this.persist(state);
    return gaps.length;
  }

  async listGaps(tenantId: string, questionnaireId: string, options?: { status?: string }): Promise<QuestionnaireGap[]> {
    assertTenantId(tenantId);
    let items = this.collection<QuestionnaireGap>(this.load(), 'gaps', tenantId).filter(
      g => g.questionnaireId === questionnaireId
    );
    if (options?.status) items = items.filter(g => g.status === options.status);
    return items;
  }

  async updateGap(tenantId: string, gapId: string, patch: Partial<QuestionnaireGap>): Promise<QuestionnaireGap> {
    assertTenantId(tenantId);
    const state = this.load();
    const rows = state.data.gaps as any[];
    const index = rows.findIndex(row => row.tenantId === tenantId && row.id === gapId);
    if (index === -1) throw new Error(`Gap ${gapId} was not found for this tenant.`);
    rows[index] = { ...rows[index], ...patch };
    this.persist(state);
    return rows[index];
  }

  async saveExport(record: QuestionnaireExport): Promise<QuestionnaireExport> {
    assertTenantId(record.tenantId);
    const state = this.load();
    this.upsert(state, 'exports', record);
    this.persist(state);
    return record;
  }

  async listExports(tenantId: string, questionnaireId: string): Promise<QuestionnaireExport[]> {
    assertTenantId(tenantId);
    return this.collection<QuestionnaireExport>(this.load(), 'exports', tenantId)
      .filter(e => e.questionnaireId === questionnaireId)
      .sort((a, b) => (a.generatedAt < b.generatedAt ? 1 : -1));
  }

  async appendAuditEvent(event: QuestionnaireAuditEvent): Promise<QuestionnaireAuditEvent> {
    assertTenantId(event.tenantId);
    const state = this.load();
    // The questionnaire audit chain is per (tenant, questionnaire) so that a
    // filtered history can be verified independently of unrelated records.
    const priorForQuestionnaire = (state.data.auditEvents as any[])
      .filter(row => row.tenantId === event.tenantId && row.questionnaireId === event.questionnaireId)
      .pop();
    const previousHash = priorForQuestionnaire?.integrityHash || '0'.repeat(64);
    const record = { ...event, previousHash, integrityHash: computeAuditEventHash(previousHash, event) };
    state.data.auditEvents.push(record);
    state.auditChainHead = record.integrityHash;
    this.persist(state);
    // Mirror into the platform audit trail so questionnaire actions appear in the
    // tenant's single audit history.
    try {
      enterpriseAuditService.recordAuditLog({
        tenantId: event.tenantId,
        action: event.action,
        entity: event.entityType,
        entityId: event.entityId,
        actor: event.actorEmail,
        actorRole: event.actorRole,
        result: 'SUCCESS',
        newState: { summary: event.summary, details: event.details }
      });
    } catch {
      // The primary questionnaire audit history is authoritative; platform mirroring
      // failure must not lose the record.
    }
    return record as QuestionnaireAuditEvent;
  }

  async listAuditEvents(tenantId: string, questionnaireId: string, limit = 500): Promise<QuestionnaireAuditEvent[]> {
    assertTenantId(tenantId);
    return this.collection<QuestionnaireAuditEvent>(this.load(), 'auditEvents', tenantId)
      .filter(e => e.questionnaireId === questionnaireId)
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, limit);
  }

  async listLibraryEntries(tenantId: string): Promise<GovernedAnswerLibraryEntry[]> {
    assertTenantId(tenantId);
    return this.collection<GovernedAnswerLibraryEntry>(this.load(), 'libraryEntries', tenantId);
  }

  async saveLibraryEntry(entry: GovernedAnswerLibraryEntry): Promise<GovernedAnswerLibraryEntry> {
    assertTenantId(entry.tenantId);
    const state = this.load();
    this.upsert(state, 'libraryEntries', entry);
    this.persist(state);
    return entry;
  }

  async listDisclosures(tenantId: string): Promise<TrustCenterDisclosure[]> {
    assertTenantId(tenantId);
    return this.collection<TrustCenterDisclosure>(this.load(), 'disclosures', tenantId);
  }

  async saveDisclosure(disclosure: TrustCenterDisclosure): Promise<TrustCenterDisclosure> {
    assertTenantId(disclosure.tenantId);
    const state = this.load();
    this.upsert(state, 'disclosures', disclosure);
    this.persist(state);
    return disclosure;
  }

  async listOrgFacts(tenantId: string): Promise<ApprovedOrganizationalFact[]> {
    assertTenantId(tenantId);
    return this.collection<ApprovedOrganizationalFact>(this.load(), 'orgFacts', tenantId);
  }

  async saveOrgFact(fact: ApprovedOrganizationalFact): Promise<ApprovedOrganizationalFact> {
    assertTenantId(fact.tenantId);
    const state = this.load();
    this.upsert(state, 'orgFacts', fact);
    this.persist(state);
    return fact;
  }

  async deleteOrgFact(tenantId: string, factId: string): Promise<boolean> {
    assertTenantId(tenantId);
    const state = this.load();
    const before = state.data.orgFacts.length;
    state.data.orgFacts = (state.data.orgFacts as any[]).filter(
      row => !(row.tenantId === tenantId && row.id === factId)
    );
    this.persist(state);
    return before !== state.data.orgFacts.length;
  }

  async saveJob(job: QuestionnaireJob): Promise<QuestionnaireJob> {
    assertTenantId(job.tenantId);
    const state = this.load();
    const rows = state.data.jobs as any[];
    const index = rows.findIndex(
      row => row.tenantId === job.tenantId && (row.id === job.id || (row.idempotencyKey === job.idempotencyKey && job.idempotencyKey))
    );
    if (index >= 0) rows[index] = { ...rows[index], ...job, id: rows[index].id };
    else rows.push(job);
    this.persist(state);
    return job;
  }

  async getJobByKey(tenantId: string, idempotencyKey: string): Promise<QuestionnaireJob | null> {
    assertTenantId(tenantId);
    if (!idempotencyKey) return null;
    return (
      this.collection<QuestionnaireJob>(this.load(), 'jobs', tenantId).find(j => j.idempotencyKey === idempotencyKey) || null
    );
  }

  async getJobById(tenantId: string, jobId: string): Promise<QuestionnaireJob | null> {
    assertTenantId(tenantId);
    return this.collection<QuestionnaireJob>(this.load(), 'jobs', tenantId).find(j => j.id === jobId) || null;
  }

  async listJobs(tenantId: string, questionnaireId: string): Promise<QuestionnaireJob[]> {
    assertTenantId(tenantId);
    return this.collection<QuestionnaireJob>(this.load(), 'jobs', tenantId).filter(
      j => j.questionnaireId === questionnaireId
    );
  }

  async saveAssuranceDependency(
    dependency: AnswerAssuranceDependency
  ): Promise<AnswerAssuranceDependency> {
    assertTenantId(dependency.tenantId);
    const state = this.load();
    const rows = state.data.assuranceDependencies as any[];
    // One live dependency row per answer draft: relinking must not fork the graph.
    const index = rows.findIndex(
      row => row.tenantId === dependency.tenantId && row.answerDraftId === dependency.answerDraftId
    );
    if (index >= 0) rows[index] = { ...rows[index], ...dependency, id: rows[index].id };
    else rows.push(dependency);
    this.persist(state);
    return dependency;
  }

  async listAssuranceDependencies(
    tenantId: string,
    questionnaireId?: string
  ): Promise<AnswerAssuranceDependency[]> {
    assertTenantId(tenantId);
    const rows = this.collection<AnswerAssuranceDependency>(
      this.load(),
      'assuranceDependencies',
      tenantId
    );
    return questionnaireId ? rows.filter(r => r.questionnaireId === questionnaireId) : rows;
  }

  async getAssuranceDependencyForAnswer(
    tenantId: string,
    answerDraftId: string
  ): Promise<AnswerAssuranceDependency | null> {
    assertTenantId(tenantId);
    return (
      this.collection<AnswerAssuranceDependency>(this.load(), 'assuranceDependencies', tenantId).find(
        r => r.answerDraftId === answerDraftId
      ) || null
    );
  }

  async saveSourceChange(record: SourceChangeRecord): Promise<SourceChangeRecord> {
    assertTenantId(record.tenantId);
    const state = this.load();
    const rows = state.data.sourceChanges as any[];
    const index = rows.findIndex(
      row =>
        row.tenantId === record.tenantId &&
        (row.id === record.id || row.idempotencyKey === record.idempotencyKey)
    );
    if (index >= 0) rows[index] = { ...rows[index], ...record, id: rows[index].id };
    else rows.push(record);
    this.persist(state);
    return record;
  }

  async getSourceChangeByKey(tenantId: string, idempotencyKey: string): Promise<SourceChangeRecord | null> {
    assertTenantId(tenantId);
    if (!idempotencyKey) return null;
    return (
      this.collection<SourceChangeRecord>(this.load(), 'sourceChanges', tenantId).find(
        r => r.idempotencyKey === idempotencyKey
      ) || null
    );
  }

  async getSourceChangeById(tenantId: string, changeId: string): Promise<SourceChangeRecord | null> {
    assertTenantId(tenantId);
    return (
      this.collection<SourceChangeRecord>(this.load(), 'sourceChanges', tenantId).find(
        r => r.id === changeId
      ) || null
    );
  }

  async listSourceChanges(
    tenantId: string,
    options?: { status?: SourceChangeStatus; limit?: number }
  ): Promise<SourceChangeRecord[]> {
    assertTenantId(tenantId);
    let rows = this.collection<SourceChangeRecord>(this.load(), 'sourceChanges', tenantId).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
    if (options?.status) rows = rows.filter(r => r.status === options.status);
    return options?.limit ? rows.slice(0, options.limit) : rows;
  }

  async saveRevalidationEvent(event: AnswerRevalidationEvent): Promise<AnswerRevalidationEvent> {
    assertTenantId(event.tenantId);
    const state = this.load();
    const rows = state.data.revalidationEvents as any[];
    const index = rows.findIndex(
      row =>
        row.tenantId === event.tenantId &&
        (row.id === event.id ||
          (row.sourceChangeId === event.sourceChangeId && row.answerDraftId === event.answerDraftId))
    );
    if (index >= 0) rows[index] = { ...rows[index], ...event, id: rows[index].id };
    else rows.push(event);
    this.persist(state);
    return event;
  }

  async getRevalidationEventByKey(
    tenantId: string,
    dedupeKey: string
  ): Promise<AnswerRevalidationEvent | null> {
    assertTenantId(tenantId);
    if (!dedupeKey) return null;
    return (
      this.collection<AnswerRevalidationEvent>(this.load(), 'revalidationEvents', tenantId).find(
        r => r.notificationDedupeKey === dedupeKey
      ) || null
    );
  }

  async listRevalidationEvents(
    tenantId: string,
    questionnaireId?: string
  ): Promise<AnswerRevalidationEvent[]> {
    assertTenantId(tenantId);
    const rows = this.collection<AnswerRevalidationEvent>(this.load(), 'revalidationEvents', tenantId).sort(
      (a, b) => (a.createdAt < b.createdAt ? 1 : -1)
    );
    return questionnaireId ? rows.filter(r => r.questionnaireId === questionnaireId) : rows;
  }

  async deleteQuestionnaire(
    tenantId: string,
    questionnaireId: string
  ): Promise<{ deleted: boolean; cascaded: Record<string, number> }> {
    assertTenantId(tenantId);
    const state = this.load();
    const cascaded: Record<string, number> = {};
    const questionnaireExists = (state.data.questionnaires as any[]).some(
      row => row.tenantId === tenantId && row.id === questionnaireId
    );
    if (!questionnaireExists) return { deleted: false, cascaded };

    const shouldDelete = (row: any) => row.tenantId === tenantId && row.questionnaireId === questionnaireId;
    for (const collection of Object.keys(state.data) as JsonCollection[]) {
      if (collection === 'questionnaires') {
        const before = state.data.questionnaires.length;
        state.data.questionnaires = (state.data.questionnaires as any[]).filter(
          row => !(row.tenantId === tenantId && row.id === questionnaireId)
        );
        cascaded.questionnaires = before - state.data.questionnaires.length;
        continue;
      }
      if (collection === 'libraryEntries' || collection === 'disclosures' || collection === 'orgFacts') continue;
      const before = (state.data[collection] as any[]).length;
      (state.data[collection] as any[]) = (state.data[collection] as any[]).filter(row => !shouldDelete(row));
      cascaded[collection] = before - (state.data[collection] as any[]).length;
    }
    this.persist(state);
    return { deleted: true, cascaded };
  }

  getStorageType(): 'JSON_DURABLE' {
    return 'JSON_DURABLE';
  }

  async healthCheck(): Promise<{ healthy: boolean; detail: string }> {
    try {
      const state = this.load();
      return {
        healthy: true,
        detail: `Durable JSON store readable at ${this.filePath} with ${state.data.questionnaires.length} questionnaire row(s).`
      };
    } catch (err: any) {
      return { healthy: false, detail: `Durable JSON store unreadable: ${err.message}` };
    }
  }
}

// ---------------------------------------------------------------------------
// POSTGRESQL IMPLEMENTATION
// ---------------------------------------------------------------------------

/**
 * Each aggregate is persisted with explicit relational identity/tenant/query
 * columns plus the full domain record in `record JSONB`, so application objects
 * round-trip losslessly while tenant relationships and indexes stay relational.
 * Migration 006 defines the tables, constraints, indexes and RLS policies.
 */
export class PostgresQuestionnaireRepository implements IQuestionnaireDataStore {
  private pool: pg.Pool;

  constructor(databaseUrl: string) {
    this.pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
  }

  private tableFor(collection: JsonCollection): string {
    const map: Record<JsonCollection, string> = {
      questionnaires: 'questionnaires',
      questions: 'questionnaire_questions',
      requirements: 'question_requirements',
      drafts: 'answer_drafts',
      reviews: 'answer_reviews',
      approvals: 'answer_approvals',
      gaps: 'questionnaire_gaps',
      exports: 'questionnaire_exports',
      auditEvents: 'questionnaire_audit_events',
      libraryEntries: 'answer_library_entries',
      disclosures: 'trust_center_disclosures',
      orgFacts: 'approved_organizational_facts',
      jobs: 'questionnaire_jobs',
      assuranceDependencies: 'answer_assurance_dependencies',
      sourceChanges: 'monitoring_source_change_events',
      revalidationEvents: 'answer_revalidation_events'
    };
    return map[collection];
  }

  private async query<T = any>(tenantId: string, sql: string, params: any[] = []): Promise<T[]> {
    assertTenantId(tenantId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Database-level isolation in addition to the explicit tenant predicate.
      await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
      await client.query("SELECT set_config('app.is_platform_admin', 'false', true)");
      const result = await client.query(sql, params);
      await client.query('COMMIT');
      return result.rows as T[];
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* connection already unusable */
      }
      throw err;
    } finally {
      client.release();
    }
  }

  private async upsertRecord(
    tenantId: string,
    collection: JsonCollection,
    id: string,
    record: any,
    extra: { questionnaireId?: string; order?: number; status?: string } = {}
  ): Promise<void> {
    const table = this.tableFor(collection);
    const columns = ['id', 'tenant_id', 'record', 'updated_at'];
    const values: any[] = [id, tenantId, JSON.stringify(record), new Date().toISOString()];
    if (extra.questionnaireId) {
      columns.splice(2, 0, 'questionnaire_id');
      values.splice(2, 0, extra.questionnaireId);
    }
    if (extra.order !== undefined) {
      columns.splice(3, 0, 'question_order');
      values.splice(3, 0, extra.order);
    }
    if (extra.status) {
      columns.push('status');
      values.push(extra.status);
    }
    const placeholders = values.map((_v, i) => `$${i + 1}`).join(', ');
    const updateAssignments = columns
      .filter(c => c !== 'id' && c !== 'tenant_id')
      .map(c => `${c} = EXCLUDED.${c}`)
      .join(', ');
    await this.query(
      tenantId,
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${updateAssignments}`,
      values
    );
  }

  private async selectRecords<T>(tenantId: string, collection: JsonCollection, extraSql = '', extraParams: any[] = []): Promise<T[]> {
    const table = this.tableFor(collection);
    const rows = await this.query<any>(
      tenantId,
      `SELECT record FROM ${table} WHERE tenant_id = $1 ${extraSql}`,
      [tenantId, ...extraParams]
    );
    return rows.map(r => r.record as T);
  }

  async saveQuestionnaire(questionnaire: Questionnaire): Promise<Questionnaire> {
    await this.upsertRecord(questionnaire.tenantId, 'questionnaires', questionnaire.id, questionnaire, {
      status: questionnaire.status
    });
    return questionnaire;
  }

  async getQuestionnaire(tenantId: string, id: string): Promise<Questionnaire | null> {
    const rows = await this.selectRecords<Questionnaire>(tenantId, 'questionnaires', 'AND id = $2', [id]);
    return rows[0] || null;
  }

  async listQuestionnaires(tenantId: string, options?: QuestionnaireListOptions): Promise<Paginated<Questionnaire>> {
    const rows = await this.selectRecords<Questionnaire>(tenantId, 'questionnaires', 'ORDER BY created_at DESC');
    let items = rows;
    if (options?.status) items = items.filter(q => q.status === options.status);
    if (options?.search) {
      const needle = options.search.toLowerCase();
      items = items.filter(q => q.title.toLowerCase().includes(needle) || q.requestingOrganization.toLowerCase().includes(needle));
    }
    return paginate(items, options);
  }

  async upsertQuestions(tenantId: string, questionnaireId: string, questions: ExtractedQuestion[]): Promise<number> {
    for (const question of questions) {
      await this.upsertRecord(tenantId, 'questions', question.id, { ...question, tenantId, questionnaireId }, {
        questionnaireId,
        order: question.order
      });
    }
    return questions.length;
  }

  async listQuestions(
    tenantId: string,
    questionnaireId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Paginated<ExtractedQuestion>> {
    const rows = await this.selectRecords<ExtractedQuestion>(
      tenantId,
      'questions',
      'AND questionnaire_id = $2 ORDER BY question_order ASC',
      [questionnaireId]
    );
    return paginate(rows, options);
  }

  async getQuestion(tenantId: string, questionId: string): Promise<ExtractedQuestion | null> {
    const rows = await this.selectRecords<ExtractedQuestion>(tenantId, 'questions', 'AND id = $2', [questionId]);
    return rows[0] || null;
  }

  async deleteQuestionsForQuestionnaire(tenantId: string, questionnaireId: string): Promise<number> {
    const table = this.tableFor('questions');
    const rows = await this.query(
      tenantId,
      `DELETE FROM ${table} WHERE tenant_id = $1 AND questionnaire_id = $2 RETURNING id`,
      [tenantId, questionnaireId]
    );
    return rows.length;
  }

  async upsertRequirements(tenantId: string, requirements: RequirementAnalysis[]): Promise<number> {
    for (const requirement of requirements) {
      await this.upsertRecord(tenantId, 'requirements', requirement.id, { ...requirement, tenantId }, {
        questionnaireId: requirement.questionnaireId
      });
    }
    return requirements.length;
  }

  async listRequirements(tenantId: string, questionnaireId: string): Promise<RequirementAnalysis[]> {
    return this.selectRecords<RequirementAnalysis>(tenantId, 'requirements', 'AND questionnaire_id = $2', [questionnaireId]);
  }

  async getRequirementForQuestion(tenantId: string, questionId: string): Promise<RequirementAnalysis | null> {
    const rows = await this.selectRecords<RequirementAnalysis>(tenantId, 'requirements');
    return rows.find(r => r.questionId === questionId) || null;
  }

  async saveDraft(draft: AnswerDraft): Promise<AnswerDraft> {
    await this.upsertRecord(draft.tenantId, 'drafts', draft.id, draft, {
      questionnaireId: draft.questionnaireId,
      status: draft.status
    });
    return draft;
  }

  async getDraft(tenantId: string, draftId: string): Promise<AnswerDraft | null> {
    const rows = await this.selectRecords<AnswerDraft>(tenantId, 'drafts', 'AND id = $2', [draftId]);
    return rows[0] || null;
  }

  async getLatestDraftForQuestion(tenantId: string, questionId: string): Promise<AnswerDraft | null> {
    const rows = await this.selectRecords<AnswerDraft>(tenantId, 'drafts');
    return rows.filter(d => d.questionId === questionId).sort((a, b) => (a.generatedAt < b.generatedAt ? 1 : -1))[0] || null;
  }

  async listDrafts(tenantId: string, questionnaireId: string): Promise<AnswerDraft[]> {
    return this.selectRecords<AnswerDraft>(tenantId, 'drafts', 'AND questionnaire_id = $2', [questionnaireId]);
  }

  async updateDraft(tenantId: string, draftId: string, patch: Partial<AnswerDraft>): Promise<AnswerDraft> {
    const existing = await this.getDraft(tenantId, draftId);
    if (!existing) throw new Error(`Answer draft ${draftId} was not found for this tenant.`);
    const updated = { ...existing, ...patch };
    await this.saveDraft(updated);
    return updated;
  }

  async saveReview(review: AnswerReview): Promise<AnswerReview> {
    await this.upsertRecord(review.tenantId, 'reviews', review.id, review, { questionnaireId: review.questionnaireId });
    return review;
  }

  async listReviews(tenantId: string, questionnaireId: string): Promise<AnswerReview[]> {
    const rows = await this.selectRecords<AnswerReview>(tenantId, 'reviews', 'AND questionnaire_id = $2', [questionnaireId]);
    return rows.sort((a, b) => (a.at < b.at ? -1 : 1));
  }

  async saveApproval(approval: AnswerApproval): Promise<AnswerApproval> {
    await this.upsertRecord(approval.tenantId, 'approvals', approval.id, approval, {
      questionnaireId: approval.questionnaireId
    });
    return approval;
  }

  async listApprovals(tenantId: string, questionnaireId: string): Promise<AnswerApproval[]> {
    return this.selectRecords<AnswerApproval>(tenantId, 'approvals', 'AND questionnaire_id = $2', [questionnaireId]);
  }

  async getApprovalForDraft(tenantId: string, draftId: string): Promise<AnswerApproval | null> {
    const rows = await this.selectRecords<AnswerApproval>(tenantId, 'approvals');
    const forDraft = rows.filter(a => a.answerDraftId === draftId);
    if (forDraft.length === 0) return null;
    // The current approval is the most recent one: an answer may be approved,
    // revalidated and approved again, and the stale record must not win.
    return [...forDraft].sort((a, b) =>
      a.approvedAt < b.approvedAt ? 1 : a.approvedAt > b.approvedAt ? -1 : 0
    )[0];
  }

  async upsertGaps(gaps: QuestionnaireGap[]): Promise<number> {
    for (const gap of gaps) {
      // `ON CONFLICT (id) DO UPDATE` plus content-addressed ids make this idempotent.
      await this.upsertRecord(gap.tenantId, 'gaps', gap.id, gap, {
        questionnaireId: gap.questionnaireId,
        status: gap.status
      });
    }
    return gaps.length;
  }

  async listGaps(tenantId: string, questionnaireId: string, options?: { status?: string }): Promise<QuestionnaireGap[]> {
    let rows = await this.selectRecords<QuestionnaireGap>(tenantId, 'gaps', 'AND questionnaire_id = $2', [questionnaireId]);
    if (options?.status) rows = rows.filter(g => g.status === options.status);
    return rows;
  }

  async updateGap(tenantId: string, gapId: string, patch: Partial<QuestionnaireGap>): Promise<QuestionnaireGap> {
    const rows = await this.selectRecords<QuestionnaireGap>(tenantId, 'gaps', 'AND id = $2', [gapId]);
    if (!rows[0]) throw new Error(`Gap ${gapId} was not found for this tenant.`);
    const updated = { ...rows[0], ...patch };
    await this.upsertRecord(tenantId, 'gaps', gapId, updated, {
      questionnaireId: updated.questionnaireId,
      status: updated.status
    });
    return updated;
  }

  async saveExport(record: QuestionnaireExport): Promise<QuestionnaireExport> {
    await this.upsertRecord(record.tenantId, 'exports', record.id, record, { questionnaireId: record.questionnaireId });
    return record;
  }

  async listExports(tenantId: string, questionnaireId: string): Promise<QuestionnaireExport[]> {
    const rows = await this.selectRecords<QuestionnaireExport>(tenantId, 'exports', 'AND questionnaire_id = $2', [
      questionnaireId
    ]);
    return rows.sort((a, b) => (a.generatedAt < b.generatedAt ? 1 : -1));
  }

  async appendAuditEvent(event: QuestionnaireAuditEvent): Promise<QuestionnaireAuditEvent> {
    const previous = await this.selectRecords<QuestionnaireAuditEvent>(
      event.tenantId,
      'auditEvents',
      'AND questionnaire_id = $2 ORDER BY created_at DESC LIMIT 1',
      [event.questionnaireId]
    );
    const previousHash = (previous[0] as any)?.integrityHash || '0'.repeat(64);
    const record = { ...event, previousHash, integrityHash: computeAuditEventHash(previousHash, event) };
    await this.upsertRecord(event.tenantId, 'auditEvents', event.id, record, { questionnaireId: event.questionnaireId });
    try {
      enterpriseAuditService.recordAuditLog({
        tenantId: event.tenantId,
        action: event.action,
        entity: event.entityType,
        entityId: event.entityId,
        actor: event.actorEmail,
        actorRole: event.actorRole,
        result: 'SUCCESS',
        newState: { summary: event.summary, details: event.details }
      });
    } catch {
      /* platform mirror is best-effort */
    }
    return record as QuestionnaireAuditEvent;
  }

  async listAuditEvents(tenantId: string, questionnaireId: string, limit = 500): Promise<QuestionnaireAuditEvent[]> {
    const rows = await this.selectRecords<QuestionnaireAuditEvent>(
      tenantId,
      'auditEvents',
      'AND questionnaire_id = $2 ORDER BY created_at DESC LIMIT $3',
      [questionnaireId, limit]
    );
    return rows;
  }

  async listLibraryEntries(tenantId: string): Promise<GovernedAnswerLibraryEntry[]> {
    return this.selectRecords<GovernedAnswerLibraryEntry>(tenantId, 'libraryEntries');
  }

  async saveLibraryEntry(entry: GovernedAnswerLibraryEntry): Promise<GovernedAnswerLibraryEntry> {
    await this.upsertRecord(entry.tenantId, 'libraryEntries', entry.id, entry);
    return entry;
  }

  async listDisclosures(tenantId: string): Promise<TrustCenterDisclosure[]> {
    return this.selectRecords<TrustCenterDisclosure>(tenantId, 'disclosures');
  }

  async saveDisclosure(disclosure: TrustCenterDisclosure): Promise<TrustCenterDisclosure> {
    await this.upsertRecord(disclosure.tenantId, 'disclosures', disclosure.id, disclosure, { status: disclosure.status });
    return disclosure;
  }

  async listOrgFacts(tenantId: string): Promise<ApprovedOrganizationalFact[]> {
    return this.selectRecords<ApprovedOrganizationalFact>(tenantId, 'orgFacts');
  }

  async saveOrgFact(fact: ApprovedOrganizationalFact): Promise<ApprovedOrganizationalFact> {
    await this.upsertRecord(fact.tenantId, 'orgFacts', fact.id, fact);
    return fact;
  }

  async deleteOrgFact(tenantId: string, factId: string): Promise<boolean> {
    const table = this.tableFor('orgFacts');
    const rows = await this.query(tenantId, `DELETE FROM ${table} WHERE tenant_id = $1 AND id = $2 RETURNING id`, [
      tenantId,
      factId
    ]);
    return rows.length > 0;
  }

  async saveJob(job: QuestionnaireJob): Promise<QuestionnaireJob> {
    await this.upsertRecord(job.tenantId, 'jobs', job.id, job, {
      questionnaireId: job.questionnaireId,
      status: job.status
    });
    return job;
  }

  async getJobByKey(tenantId: string, idempotencyKey: string): Promise<QuestionnaireJob | null> {
    if (!idempotencyKey) return null;
    const rows = await this.selectRecords<QuestionnaireJob>(tenantId, 'jobs');
    return rows.find(j => j.idempotencyKey === idempotencyKey) || null;
  }

  async getJobById(tenantId: string, jobId: string): Promise<QuestionnaireJob | null> {
    const rows = await this.selectRecords<QuestionnaireJob>(tenantId, 'jobs', 'AND id = $2', [jobId]);
    return rows[0] || null;
  }

  async listJobs(tenantId: string, questionnaireId: string): Promise<QuestionnaireJob[]> {
    return this.selectRecords<QuestionnaireJob>(tenantId, 'jobs', 'AND questionnaire_id = $2', [questionnaireId]);
  }

  async saveAssuranceDependency(
    dependency: AnswerAssuranceDependency
  ): Promise<AnswerAssuranceDependency> {
    assertTenantId(dependency.tenantId);
    await this.upsertRecord(
      dependency.tenantId,
      'assuranceDependencies',
      dependency.id,
      dependency,
      { questionnaireId: dependency.questionnaireId, status: dependency.status }
    );
    return dependency;
  }

  async listAssuranceDependencies(
    tenantId: string,
    questionnaireId?: string
  ): Promise<AnswerAssuranceDependency[]> {
    const rows = questionnaireId
      ? await this.selectRecords<AnswerAssuranceDependency>(
          tenantId,
          'assuranceDependencies',
          'AND questionnaire_id = $2',
          [questionnaireId]
        )
      : await this.selectRecords<AnswerAssuranceDependency>(tenantId, 'assuranceDependencies');
    return rows;
  }

  async getAssuranceDependencyForAnswer(
    tenantId: string,
    answerDraftId: string
  ): Promise<AnswerAssuranceDependency | null> {
    const rows = await this.selectRecords<AnswerAssuranceDependency>(tenantId, 'assuranceDependencies');
    return rows.find(r => r.answerDraftId === answerDraftId) || null;
  }

  async saveSourceChange(record: SourceChangeRecord): Promise<SourceChangeRecord> {
    assertTenantId(record.tenantId);
    await this.upsertRecord(record.tenantId, 'sourceChanges', record.id, record, {
      status: record.status
    });
    return record;
  }

  async getSourceChangeByKey(tenantId: string, idempotencyKey: string): Promise<SourceChangeRecord | null> {
    if (!idempotencyKey) return null;
    const rows = await this.selectRecords<SourceChangeRecord>(tenantId, 'sourceChanges');
    return rows.find(r => r.idempotencyKey === idempotencyKey) || null;
  }

  async getSourceChangeById(tenantId: string, changeId: string): Promise<SourceChangeRecord | null> {
    const rows = await this.selectRecords<SourceChangeRecord>(tenantId, 'sourceChanges', 'AND id = $2', [changeId]);
    return rows[0] || null;
  }

  async listSourceChanges(
    tenantId: string,
    options?: { status?: SourceChangeStatus; limit?: number }
  ): Promise<SourceChangeRecord[]> {
    const rows = await this.selectRecords<SourceChangeRecord>(
      tenantId,
      'sourceChanges',
      'ORDER BY created_at DESC'
    );
    const filtered = options?.status ? rows.filter(r => r.status === options.status) : rows;
    return options?.limit ? filtered.slice(0, options.limit) : filtered;
  }

  async saveRevalidationEvent(event: AnswerRevalidationEvent): Promise<AnswerRevalidationEvent> {
    assertTenantId(event.tenantId);
    await this.upsertRecord(event.tenantId, 'revalidationEvents', event.id, event, {
      questionnaireId: event.questionnaireId,
      status: event.newStatus
    });
    return event;
  }

  async getRevalidationEventByKey(
    tenantId: string,
    dedupeKey: string
  ): Promise<AnswerRevalidationEvent | null> {
    if (!dedupeKey) return null;
    const rows = await this.selectRecords<AnswerRevalidationEvent>(tenantId, 'revalidationEvents');
    return rows.find(r => r.notificationDedupeKey === dedupeKey) || null;
  }

  async listRevalidationEvents(
    tenantId: string,
    questionnaireId?: string
  ): Promise<AnswerRevalidationEvent[]> {
    const rows = questionnaireId
      ? await this.selectRecords<AnswerRevalidationEvent>(tenantId, 'revalidationEvents', 'AND questionnaire_id = $2', [
          questionnaireId
        ])
      : await this.selectRecords<AnswerRevalidationEvent>(tenantId, 'revalidationEvents');
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async deleteQuestionnaire(
    tenantId: string,
    questionnaireId: string
  ): Promise<{ deleted: boolean; cascaded: Record<string, number> }> {
    const cascaded: Record<string, number> = {};
    const childTables: JsonCollection[] = [
      'questions',
      'requirements',
      'drafts',
      'reviews',
      'approvals',
      'gaps',
      'exports',
      'auditEvents',
      'jobs',
      'assuranceDependencies',
      'revalidationEvents'
    ];
    for (const collection of childTables) {
      const table = this.tableFor(collection);
      const rows = await this.query(
        tenantId,
        `DELETE FROM ${table} WHERE tenant_id = $1 AND questionnaire_id = $2 RETURNING id`,
        [tenantId, questionnaireId]
      );
      cascaded[collection] = rows.length;
    }
    const deletedRows = await this.query(
      tenantId,
      `DELETE FROM questionnaires WHERE tenant_id = $1 AND id = $2 RETURNING id`,
      [tenantId, questionnaireId]
    );
    cascaded.questionnaires = deletedRows.length;
    return { deleted: deletedRows.length > 0, cascaded };
  }

  getStorageType(): 'POSTGRESQL_RELATIONAL' {
    return 'POSTGRESQL_RELATIONAL';
  }

  async healthCheck(): Promise<{ healthy: boolean; detail: string }> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return { healthy: true, detail: 'PostgreSQL pool reachable.' };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return { healthy: false, detail: `PostgreSQL unreachable: ${err.message}` };
    }
  }
}

// ---------------------------------------------------------------------------
// FACTORY
// ---------------------------------------------------------------------------

export class QuestionnaireRepositoryFactory {
  private static instance: IQuestionnaireDataStore | null = null;

  public static getInstance(): IQuestionnaireDataStore {
    if (!QuestionnaireRepositoryFactory.instance) {
      const isProduction = process.env.NODE_ENV === 'production';
      const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
      const allowJsonInProduction = process.env.SKANDA_ALLOW_JSON_PERSISTENCE === 'true';

      if (hasDatabaseUrl) {
        console.log('[QuestionnaireRepositoryFactory] DATABASE_URL detected: using PostgresQuestionnaireRepository');
        QuestionnaireRepositoryFactory.instance = new PostgresQuestionnaireRepository(process.env.DATABASE_URL!);
      } else if (isProduction && !allowJsonInProduction) {
        throw new Error(
          'Production questionnaire persistence requires DATABASE_URL. Set SKANDA_ALLOW_JSON_PERSISTENCE=true only for an explicitly accepted degraded deployment.'
        );
      } else {
        console.log('[QuestionnaireRepositoryFactory] No DATABASE_URL: using DurableJsonQuestionnaireRepository');
        QuestionnaireRepositoryFactory.instance = new DurableJsonQuestionnaireRepository();
      }
    }
    return QuestionnaireRepositoryFactory.instance;
  }

  public static setInstanceForTesting(store: IQuestionnaireDataStore | null): void {
    QuestionnaireRepositoryFactory.instance = store;
  }
}

export const getQuestionnaireDataStore = (): IQuestionnaireDataStore => QuestionnaireRepositoryFactory.getInstance();
