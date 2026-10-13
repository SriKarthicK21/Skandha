// ============================================================================
// SKANDA SECURITY QUESTIONNAIRE INTELLIGENCE: APPLICATION SERVICE
// Path: server/services/QuestionnaireIntelligenceService.ts
//
// Orchestrates the complete end-to-end workflow:
//   import -> extract -> map -> analyze -> draft -> gap -> review -> approve
//   -> export -> audit history -> governed reuse -> Trust Center disclosure
//
// This service is transport-agnostic so the HTTP routes and the automated
// validation suite exercise exactly the same code path.
//
// Approval is enforced HERE, server-side. Nothing in the request body can
// promote an answer to APPROVED without an approval record produced by this
// service after permission, state-transition and separation-of-duties checks.
// ============================================================================

import crypto from 'crypto';
import {
  AnswerApproval,
  AnswerDraft,
  AnswerReview,
  AnswerStatus,
  ExtractedQuestion,
  GovernedAnswerLibraryEntry,
  Questionnaire,
  QuestionnaireAuditEvent,
  QuestionnaireExport,
  QuestionnaireGap,
  QuestionnaireJob,
  QuestionnaireObservabilityMetrics,
  QuestionnaireSourceFormat,
  RevalidationQueueItem,
  RequirementAnalysis,
  ReviewAction,
  SourceChangeRecord,
  TrustCenterDisclosure,
  UpstreamSourceState
} from '../../src/types/questionnaireIntelligenceTypes.js';
import {
  buildObservabilityMetrics,
  ContinuousAssuranceRevalidationService,
  ReconciliationResult,
  RevalidationOutcome,
  SourceChangeInput
} from '../../src/services/questionnaire/continuousAssuranceRevalidationService.js';
import {
  ApprovedOrganizationalFact,
  computeAuditEventHash,
  getQuestionnaireDataStore,
  IQuestionnaireDataStore
} from '../repositories/QuestionnaireRepository.js';
import { questionnaireImportService, validateUpload } from '../../src/services/questionnaire/questionnaireImportService.js';
import { questionClassifierService, classifyMaterialClaim } from '../../src/services/questionnaire/questionClassifierService.js';
import { evidenceRetrievalService, LoadedKnowledge } from '../../src/services/questionnaire/evidenceRetrievalService.js';
import { claimValidationService } from '../../src/services/questionnaire/claimValidationService.js';
import { answerGenerationService } from '../../src/services/questionnaire/answerGenerationService.js';
import { questionnaireIntelligencePipeline } from '../../src/services/questionnaire/questionnaireIntelligencePipeline.js';
import { GovernedAnswerLibraryService } from '../../src/services/questionnaire/governedAnswerLibraryService.js';
import { TrustCenterDisclosureService } from '../../src/services/questionnaire/trustCenterDisclosureService.js';
import {
  ExportPolicy,
  questionnaireExportService
} from '../../src/services/questionnaire/questionnaireExportService.js';
import { getQuestionnaireArtifactStore, MAX_QUESTIONNAIRE_FILE_BYTES } from '../../src/services/questionnaire/questionnaireArtifactStore.js';
import { buildKnowledgeSources } from './QuestionnaireKnowledgeSource.js';
import { normalizeText } from '../../src/services/questionnaire/ooxml/xmlUtils.js';

export interface ServiceActor {
  email: string;
  role: string;
  permissions: string[];
  isPlatformAdmin: boolean;
}

export interface WorkflowPolicy {
  /** Require an approval record before a response may be exported. */
  requireApprovalForAllResponses: boolean;
  /** Authorise reuse of an unexpired approved library answer without re-approval. */
  allowReuseWithoutReApproval: boolean;
  /** Allow remediation (CAPA) records to be created from verified deficiency signals. */
  allowRemediationCreation: boolean;
  /** Material claim classes that mandate human review. */
  requireReviewForMaterialClaims: boolean;
}

export const DEFAULT_WORKFLOW_POLICY: WorkflowPolicy = {
  requireApprovalForAllResponses: true,
  allowReuseWithoutReApproval: false,
  allowRemediationCreation: false,
  requireReviewForMaterialClaims: true
};

/** Valid answer-state transitions. Any other transition is rejected. */
const ALLOWED_TRANSITIONS: Record<AnswerStatus, AnswerStatus[]> = {
  DRAFT: ['IN_REVIEW', 'GENERATED', 'SUPERSEDED'],
  GENERATED: ['IN_REVIEW', 'DRAFT', 'SUPERSEDED'],
  IN_REVIEW: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'DRAFT', 'SUPERSEDED'],
  CHANGES_REQUESTED: ['IN_REVIEW', 'DRAFT', 'GENERATED', 'SUPERSEDED'],
  APPROVED: ['SUPERSEDED'],
  REJECTED: ['DRAFT', 'IN_REVIEW', 'SUPERSEDED'],
  SUPERSEDED: [],
  // A blocked draft is normally routed for review. It may also be approved as
  // the final answer, but only as an honest non-assertion and only with an
  // explicit justification recorded in the approval (enforced below), so an
  // unsupported assurance claim can never be released under the same rule.
  BLOCKED_UNSUPPORTED: ['IN_REVIEW', 'DRAFT', 'SUPERSEDED', 'APPROVED'],
  // Entered by the continuous-assurance engine when an underlying source
  // changed. APPROVED is deliberately ABSENT: a revalidation can never be
  // approved in one step, so a stale approval cannot be silently reused. The
  // reviewer must submit it for review again (SUBMIT_FOR_REVIEW -> IN_REVIEW)
  // before a new approval record can be created.
  REVALIDATION_REQUIRED: ['IN_REVIEW', 'CHANGES_REQUESTED', 'REJECTED', 'SUPERSEDED', 'DRAFT']
};

export class QuestionnaireIntelligenceService {
  private readonly store: IQuestionnaireDataStore;
  private readonly libraryService: GovernedAnswerLibraryService;
  private readonly disclosureService: TrustCenterDisclosureService;
  private readonly runningJobs = new Set<string>();
  private assuranceService: ContinuousAssuranceRevalidationService | null = null;

  constructor(store?: IQuestionnaireDataStore) {
    this.store = store || getQuestionnaireDataStore();
    this.libraryService = new GovernedAnswerLibraryService({
      listEntries: tenantId => this.store.listLibraryEntries(tenantId),
      saveEntry: entry => this.store.saveLibraryEntry(entry)
    });
    this.disclosureService = new TrustCenterDisclosureService({
      listDisclosures: tenantId => this.store.listDisclosures(tenantId),
      saveDisclosure: disclosure => this.store.saveDisclosure(disclosure)
    });
  }

  public getStore(): IQuestionnaireDataStore {
    return this.store;
  }

  /**
   * Continuous-assurance engine bound to this service's store, so the change
   * inbox, dependency graph and revalidation events are durable and every write
   * is tenant-scoped by the repository itself.
   */
  private getAssuranceService(): ContinuousAssuranceRevalidationService {
    if (!this.assuranceService) {
      this.assuranceService = new ContinuousAssuranceRevalidationService({
        listAssuranceDependencies: (tenantId, questionnaireId) =>
          this.store.listAssuranceDependencies(tenantId, questionnaireId),
        saveAssuranceDependency: dependency => this.store.saveAssuranceDependency(dependency),
        listSourceChanges: (tenantId, options) => this.store.listSourceChanges(tenantId, options),
        getSourceChangeByKey: (tenantId, key) => this.store.getSourceChangeByKey(tenantId, key),
        getSourceChangeById: (tenantId, id) => this.store.getSourceChangeById(tenantId, id),
        saveSourceChange: record => this.store.saveSourceChange(record),
        listRevalidationEvents: (tenantId, questionnaireId) =>
          this.store.listRevalidationEvents(tenantId, questionnaireId),
        getRevalidationEventByKey: (tenantId, key) => this.store.getRevalidationEventByKey(tenantId, key),
        saveRevalidationEvent: event => this.store.saveRevalidationEvent(event),
        getDraft: (tenantId, draftId) => this.store.getDraft(tenantId, draftId),
        updateDraft: (tenantId, draftId, patch) => this.store.updateDraft(tenantId, draftId, patch),
        getApprovalForDraft: (tenantId, draftId) => this.store.getApprovalForDraft(tenantId, draftId),
        listLibraryEntries: tenantId => this.store.listLibraryEntries(tenantId),
        saveLibraryEntry: entry => this.store.saveLibraryEntry(entry),
        appendAuditEvent: event => this.store.appendAuditEvent(event),
        getStorageType: () => this.store.getStorageType()
      });
    }
    return this.assuranceService;
  }

  /**
   * Registers/refreshes the dependency edges (answer -> claim -> control / test /
   * evidence / policy / integration / approval / scope) for one questionnaire.
   * Called after drafting and after every review action so an approval binds to
   * the answer it actually approved.
   */
  public async registerAssuranceDependencies(params: {
    tenantId: string;
    questionnaireId: string;
    asOf?: string;
  }): Promise<{ created: number; updated: number; dependencyIds: string[] }> {
    const asOf = params.asOf || new Date().toISOString();
    const drafts = await this.store.listDrafts(params.tenantId, params.questionnaireId);
    const requirements = await this.store.listRequirements(params.tenantId, params.questionnaireId);
    const approvals = await this.store.listApprovals(params.tenantId, params.questionnaireId);
    return this.getAssuranceService().registerDependencies({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      drafts,
      requirements,
      approvals,
      asOf
    });
  }

  // -------------------------------------------------------------------------
  // IMPORT
  // -------------------------------------------------------------------------

  public async importQuestionnaire(params: {
    tenantId: string;
    actor: ServiceActor;
    fileName: string;
    mimeType?: string;
    buffer: Buffer;
    organizationalScope?: string[];
    /** Allows a caller to supply a stable key so a retried upload is idempotent. */
    idempotencyKey?: string;
  }): Promise<{ questionnaire: Questionnaire; summary: any; corrections: number; idempotentReplay: boolean }> {
    const validation = validateUpload({
      fileName: params.fileName,
      mimeType: params.mimeType,
      buffer: params.buffer,
      maxBytes: MAX_QUESTIONNAIRE_FILE_BYTES
    });

    if (!validation.valid || !validation.format) {
      throw Object.assign(new Error(validation.errors.join(' ')), { statusCode: 422, code: 'IMPORT_VALIDATION_FAILED' });
    }

    const sha256 = crypto.createHash('sha256').update(params.buffer).digest('hex');
    const idempotencyKey = params.idempotencyKey || `import:${sha256}`;

    // Idempotency: a retried import must not create a second questionnaire.
    const existingByKey = await this.store.listQuestionnaires(params.tenantId, { limit: 500 });
    const existing = existingByKey.items.find(q => q.idempotencyKey === idempotencyKey);
    if (existing) {
      const questions = await this.store.listQuestions(params.tenantId, existing.id, { limit: 500 });
      return {
        questionnaire: existing,
        summary: existing.extractionSummary,
        corrections: questions.items.filter(q => q.requiresHumanCorrection).length,
        idempotentReplay: true
      };
    }

    const questionnaireId = `QST-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const stored = getQuestionnaireArtifactStore().saveSource(params.tenantId, params.fileName, params.buffer);

    const raw = await questionnaireImportService.ingest({
      tenantId: params.tenantId,
      questionnaireId,
      fileName: params.fileName,
      mimeType: params.mimeType,
      buffer: params.buffer
    });

    const questions = questionnaireImportService.materialize({
      tenantId: params.tenantId,
      questionnaireId,
      raw: raw.questions
    });

    const detectedTitle = raw.summary.detectedTitle;
    const sourceArtifact = {
      artifactId: stored.artifactId,
      fileName: stored.fileName,
      format: validation.format,
      fileSizeBytes: stored.fileSizeBytes,
      mimeType: params.mimeType || 'application/octet-stream',
      sha256ContentHash: stored.sha256ContentHash,
      storedLocator: stored.storageLocator,
      uploadedBy: params.actor.email,
      uploadedAt: new Date().toISOString()
    };

    const extractionSummary = {
      ...raw.summary,
      sourceArtifact,
      questionsExtracted: questions.length,
      questionsRequiringCorrection: questions.filter(q => q.requiresHumanCorrection).length,
      accuracyDisclaimer:
        'Extraction confidence is a heuristic estimate, not a measured accuracy rate. Unreadable or ambiguous content is reported and requires reviewer correction.'
    };

    const sectionOrder: string[] = [];
    for (const question of questions) {
      if (!sectionOrder.includes(question.sectionName)) sectionOrder.push(question.sectionName);
    }

    const questionnaire: Questionnaire = {
      id: questionnaireId,
      tenantId: params.tenantId,
      title: detectedTitle || raw.summary.detectedTitle || params.fileName.replace(/\.[A-Za-z0-9]+$/, ''),
      requestingOrganization: raw.summary.detectedRequestingOrganization || 'Not stated in the questionnaire',
      questionnaireIdentifier: raw.summary.detectedQuestionnaireIdentifier || '',
      format: validation.format,
      status: 'IMPORTED',
      sourceArtifact,
      extractionSummary: extractionSummary as any,
      sectionOrder,
      questionCount: questions.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: params.actor.email,
      version: 1,
      statusHistory: [
        { status: 'IMPORTED', at: new Date().toISOString(), actor: params.actor.email, note: `Imported ${params.fileName}` }
      ],
      idempotencyKey
    };

    await this.store.saveQuestionnaire(questionnaire);
    await this.store.upsertQuestions(params.tenantId, questionnaireId, questions);
    await this.store.saveJob({
      id: `JOB-${questionnaireId}-IMPORT`,
      tenantId: params.tenantId,
      questionnaireId,
      kind: 'IMPORT',
      status: 'SUCCEEDED',
      idempotencyKey: `import-job:${idempotencyKey}`,
      attempt: 1,
      maxAttempts: 1,
      progress: { processed: questions.length, total: questions.length, failed: 0 },
      errors: [],
      startedAt: questionnaire.createdAt,
      finishedAt: new Date().toISOString()
    });

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId,
      action: 'QUESTIONNAIRE_IMPORTED',
      actor: params.actor,
      entityType: 'QUESTIONNAIRE',
      entityId: questionnaireId,
      summary: `Imported ${params.fileName} (${validation.format}); extracted ${questions.length} question(s).`,
      details: {
        sha256: stored.sha256ContentHash,
        ambiguousStructures: raw.summary.ambiguousStructures.length,
        warnings: raw.summary.warnings.length,
        confidence: raw.summary.extractionConfidence
      }
    });

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId,
      action: 'EXTRACTION_COMPLETED',
      actor: params.actor,
      entityType: 'QUESTIONNAIRE',
      entityId: questionnaireId,
      summary: `Extraction summary recorded. ${questions.filter(q => q.requiresHumanCorrection).length} question(s) flagged for human correction.`,
      details: { columnMappings: raw.summary.columnMappings }
    });

    return {
      questionnaire,
      summary: extractionSummary,
      corrections: questions.filter(q => q.requiresHumanCorrection).length,
      idempotentReplay: false
    };
  }

  // -------------------------------------------------------------------------
  // READ
  // -------------------------------------------------------------------------

  public async getQuestionnaire(tenantId: string, questionnaireId: string): Promise<Questionnaire> {
    const questionnaire = await this.store.getQuestionnaire(tenantId, questionnaireId);
    if (!questionnaire) {
      throw Object.assign(new Error('Questionnaire not found for this tenant.'), { statusCode: 404, code: 'NOT_FOUND' });
    }
    return questionnaire;
  }

  public async getWorkspace(tenantId: string, questionnaireId: string) {
    const questionnaire = await this.getQuestionnaire(tenantId, questionnaireId);
    const [questions, requirements, drafts, gaps, reviews, approvals] = await Promise.all([
      this.store.listQuestions(tenantId, questionnaireId, { limit: 500 }),
      this.store.listRequirements(tenantId, questionnaireId),
      this.store.listDrafts(tenantId, questionnaireId),
      this.store.listGaps(tenantId, questionnaireId),
      this.store.listReviews(tenantId, questionnaireId),
      this.store.listApprovals(tenantId, questionnaireId)
    ]);

    const requirementByQuestion = new Map(requirements.map(r => [r.questionId, r]));
    const draftByQuestion = new Map<string, AnswerDraft>();
    for (const draft of drafts) {
      const current = draftByQuestion.get(draft.questionId);
      if (!current || draft.generatedAt > current.generatedAt) draftByQuestion.set(draft.questionId, draft);
    }
    const approvalByDraft = new Map(approvals.map(a => [a.answerDraftId, a]));

    const items = questions.items.map(question => {
      const draft = draftByQuestion.get(question.id) || null;
      return {
        question,
        requirement: requirementByQuestion.get(question.id) || null,
        answer: draft,
        gaps: gaps.filter(g => g.questionId === question.id),
        reviews: reviews.filter(r => r.questionId === question.id),
        approval: draft ? approvalByDraft.get(draft.id) || null : null
      };
    });

    const approved = items.filter(i => i.answer?.status === 'APPROVED').length;
    const drafted = items.filter(i => i.answer && i.answer.status !== 'BLOCKED_UNSUPPORTED').length;
    const blocked = items.filter(i => i.answer?.status === 'BLOCKED_UNSUPPORTED').length;
    const mandatoryUnanswered = items.filter(
      i => i.question.mandatory && (!i.answer || i.answer.status !== 'APPROVED')
    ).length;

    return {
      questionnaire,
      questions: items,
      completion: {
        total: items.length,
        drafted,
        approved,
        blocked,
        mandatoryUnanswered,
        openGaps: gaps.filter(g => g.status === 'OPEN').length
      }
    };
  }

  // -------------------------------------------------------------------------
  // MAPPING CORRECTION
  // -------------------------------------------------------------------------

  public async correctColumnMapping(params: {
    tenantId: string;
    actor: ServiceActor;
    questionnaireId: string;
    worksheet: string;
    patch: { questionColumn?: string; responseColumn?: string | null; headerRow?: number; sectionColumn?: string | null };
  }): Promise<Questionnaire> {
    const questionnaire = await this.getQuestionnaire(params.tenantId, params.questionnaireId);
    const summary: any = questionnaire.extractionSummary;
    if (!summary || !Array.isArray(summary.columnMappings)) {
      throw Object.assign(new Error('This questionnaire has no column mappings to correct.'), { statusCode: 422 });
    }

    const mapping = summary.columnMappings.find((m: any) => m.worksheet === params.worksheet);
    if (!mapping) {
      throw Object.assign(new Error(`No mapping exists for worksheet "${params.worksheet}".`), { statusCode: 404 });
    }

    const before = { ...mapping };
    if (params.patch.questionColumn !== undefined) mapping.questionColumn = params.patch.questionColumn;
    if (params.patch.responseColumn !== undefined) mapping.responseColumn = params.patch.responseColumn;
    if (params.patch.headerRow !== undefined) mapping.headerRow = params.patch.headerRow;
    if (params.patch.sectionColumn !== undefined) mapping.sectionColumn = params.patch.sectionColumn;
    mapping.humanConfirmed = true;
    mapping.confidence = 100;
    mapping.ambiguous = false;
    mapping.ambiguousReason = undefined;
    mapping.rationale = [...(mapping.rationale || []), 'Mapping confirmed by a human reviewer.'];

    // Re-bind response cell locations for the affected questions.
    const questions = await this.store.listQuestions(params.tenantId, params.questionnaireId, { limit: 500 });
    const affected = questions.items.filter(q => q.sourceLocation.worksheet === params.worksheet);
    for (const question of affected) {
      const row = question.sourceLocation.rowNumber;
      if (!row) continue;
      if (params.patch.responseColumn) {
        question.sourceLocation.responseCell = `${params.patch.responseColumn}${row}`;
      } else if (params.patch.responseColumn === null) {
        question.sourceLocation.responseCell = undefined;
      }
      if (params.patch.questionColumn) {
        question.sourceLocation.questionCell = `${params.patch.questionColumn}${row}`;
      }
    }
    await this.store.upsertQuestions(params.tenantId, params.questionnaireId, affected);

    const updated: Questionnaire = {
      ...questionnaire,
      extractionSummary: summary,
      version: questionnaire.version + 1,
      updatedAt: new Date().toISOString(),
      status: questionnaire.status === 'IMPORTED' ? 'EXTRACTION_REVIEW' : questionnaire.status
    };
    await this.store.saveQuestionnaire(updated);

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      action: 'MAPPING_CORRECTED',
      actor: params.actor,
      entityType: 'QUESTIONNAIRE',
      entityId: params.questionnaireId,
      summary: `Column mapping corrected for worksheet "${params.worksheet}".`,
      details: { before, after: mapping, questionsRebooked: affected.length }
    });

    return updated;
  }

  // -------------------------------------------------------------------------
  // ANALYSIS
  // -------------------------------------------------------------------------

  public async analyze(params: {
    tenantId: string;
    actor: ServiceActor;
    questionnaireId: string;
    organizationalScope?: string[];
    policy?: Partial<WorkflowPolicy>;
    sync?: boolean;
    asOf?: string;
  }): Promise<{ job: QuestionnaireJob; outcomes: any[] }> {
    const questionnaire = await this.getQuestionnaire(params.tenantId, params.questionnaireId);
    const policy: WorkflowPolicy = { ...DEFAULT_WORKFLOW_POLICY, ...(params.policy || {}) };
    const asOf = params.asOf || new Date().toISOString();
    const idempotencyKey = `analyze:${params.questionnaireId}:${questionnaire.version}:${params.organizationalScope?.join('|') || 'default'}`;

    const job: QuestionnaireJob = {
      id: `JOB-${params.questionnaireId}-ANALYZE-${Date.now().toString(36)}`,
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      kind: 'GENERATE_DRAFTS',
      status: 'RUNNING',
      idempotencyKey,
      attempt: 1,
      maxAttempts: 3,
      progress: { processed: 0, total: questionnaire.questionCount, failed: 0 },
      errors: [],
      startedAt: asOf
    };
    await this.store.saveJob(job);

    const questions = await this.store.listQuestions(params.tenantId, params.questionnaireId, { limit: 1000 });

    let knowledge: LoadedKnowledge;
    try {
      knowledge = await evidenceRetrievalService.loadKnowledge({
        tenantId: params.tenantId,
        providers: buildKnowledgeSources()
      });
    } catch (err: any) {
      const failed: QuestionnaireJob = {
        ...job,
        status: 'FAILED',
        errors: [{ item: 'knowledge-source-load', message: err.message }],
        finishedAt: new Date().toISOString()
      };
      await this.store.saveJob(failed);
      await this.audit({
        tenantId: params.tenantId,
        questionnaireId: params.questionnaireId,
        action: 'JOB_ATTEMPT_FAILED',
        actor: params.actor,
        entityType: 'JOB',
        entityId: job.id,
        summary: `Analysis failed while loading knowledge sources: ${err.message}`,
        details: { idempotencyKey }
      });
      // Never report success when the underlying processing failed.
      throw Object.assign(new Error(`Analysis failed: ${err.message}`), { statusCode: 502, code: 'KNOWLEDGE_LOAD_FAILED' });
    }

    const result = await questionnaireIntelligencePipeline.process({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      questions: questions.items,
      knowledge,
      organizationalScope: params.organizationalScope || [],
      asOf,
      allowRemediationCreation: policy.allowRemediationCreation,
      allowReuseWithoutReApproval: policy.allowReuseWithoutReApproval,
      libraryService: new GovernedAnswerLibraryService({
        listEntries: tenantId => this.store.listLibraryEntries(tenantId),
        saveEntry: entry => this.store.saveLibraryEntry(entry)
      })
    });

    // Persist requirements, drafts and gaps.
    const requirements = result.outcomes.map(o => o.analysis).filter(Boolean) as RequirementAnalysis[];
    await this.store.upsertRequirements(params.tenantId, requirements);

    const allGaps: QuestionnaireGap[] = [];
    for (const outcome of result.outcomes) {
      if (outcome.draft) {
        const existing = await this.store.getLatestDraftForQuestion(params.tenantId, outcome.questionId);
        // An approved answer must never be silently replaced. A draft awaiting
        // revalidation is protected for the same reason: its preserved approved
        // wording is what a human reviewer has to re-verify.
        const draft =
          existing && (existing.status === 'APPROVED' || existing.status === 'REVALIDATION_REQUIRED')
            ? existing
            : outcome.draft;
        await this.store.saveDraft({ ...draft, tenantId: params.tenantId, questionnaireId: params.questionnaireId });
      }
      allGaps.push(...outcome.gaps);
    }
    if (allGaps.length > 0) await this.store.upsertGaps(allGaps);

    const failedOutcomes = result.outcomes.filter(o => o.error);
    const finishedJob: QuestionnaireJob = {
      ...job,
      status: failedOutcomes.length === 0 ? 'SUCCEEDED' : failedOutcomes.length === result.outcomes.length ? 'FAILED' : 'PARTIALLY_SUCCEEDED',
      progress: { processed: result.processed, total: result.outcomes.length, failed: result.failed },
      errors: failedOutcomes.map(o => ({ item: o.questionId, message: o.error || 'unknown error' })),
      finishedAt: new Date().toISOString()
    };
    await this.store.saveJob(finishedJob);

    const updatedQuestionnaire: Questionnaire = {
      ...questionnaire,
      status: finishedJob.status === 'FAILED' ? 'FAILED' : 'DRAFTING',
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...questionnaire.statusHistory,
        {
          status: finishedJob.status === 'FAILED' ? 'FAILED' : 'DRAFTING',
          at: finishedJob.finishedAt!,
          actor: params.actor.email,
          note: `Analysis job ${job.id} ${finishedJob.status}.`
        }
      ]
    };
    await this.store.saveQuestionnaire(updatedQuestionnaire);

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      action: 'ANALYSIS_COMPLETED',
      actor: params.actor,
      entityType: 'QUESTIONNAIRE',
      entityId: params.questionnaireId,
      summary: `Analysis ${finishedJob.status}: ${result.processed} question(s) processed, ${result.failed} failed, ${allGaps.length} gap(s) recorded.`,
      details: {
        knowledgeSourceTrace: knowledge.retrievalTrace,
        degradedSources: knowledge.degradedSources,
        partialFailure: knowledge.partialFailure,
        foreignTenantRecordsDropped: knowledge.foreignTenantRecordsDropped
      }
    });

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      action: 'DRAFT_GENERATED',
      actor: params.actor,
      entityType: 'ANSWER',
      entityId: params.questionnaireId,
      summary: `${result.outcomes.filter(o => o.draft).length} answer draft(s) generated; ${
        result.outcomes.filter(o => o.draft && o.draft.status === 'BLOCKED_UNSUPPORTED').length
      } blocked for insufficient evidence.`,
      details: {
        reusedFromLibrary: result.outcomes.filter(o => o.reusedLibraryEntryId).length
      }
    });

    // Register the assurance dependency graph for the freshly drafted answers so
    // a later source change can be traced back to the claims it affects.
    try {
      await this.registerAssuranceDependencies({
        tenantId: params.tenantId,
        questionnaireId: params.questionnaireId,
        asOf
      });
    } catch (err: any) {
      // Dependency registration is not allowed to fail the drafting run, but it
      // must never fail silently either.
      console.error(
        `[QuestionnaireIntelligence] Dependency registration failed for ${params.questionnaireId}: ${err.message}`
      );
      await this.audit({
        tenantId: params.tenantId,
        questionnaireId: params.questionnaireId,
        action: 'JOB_ATTEMPT_FAILED',
        actor: params.actor,
        entityType: 'JOB',
        entityId: job.id,
        summary: `Assurance dependency registration failed: ${err.message}. Answers were drafted but are not yet linked to their sources.`,
        details: { stage: 'ASSURANCE_DEPENDENCY_REGISTRATION' }
      });
    }

    return { job: finishedJob, outcomes: result.outcomes };
  }

  // -------------------------------------------------------------------------
  // REVIEW / APPROVAL
  // -------------------------------------------------------------------------

  public async editDraft(params: {
    tenantId: string;
    actor: ServiceActor;
    draftId: string;
    customerFacingResponse?: string;
    internalExplanation?: string;
  }): Promise<AnswerDraft> {
    const draft = await this.store.getDraft(params.tenantId, params.draftId);
    if (!draft) throw Object.assign(new Error('Answer draft not found for this tenant.'), { statusCode: 404 });

    if (['APPROVED', 'SUPERSEDED'].includes(draft.status)) {
      throw Object.assign(
        new Error(
          `A draft in status ${draft.status} is immutable. Create a superseding draft instead of editing an approved answer.`
        ),
        { statusCode: 409, code: 'ILLEGAL_STATE_TRANSITION' }
      );
    }

    const updated = await this.store.updateDraft(params.tenantId, params.draftId, {
      customerFacingResponse:
        params.customerFacingResponse !== undefined ? params.customerFacingResponse : draft.customerFacingResponse,
      internalExplanation:
        params.internalExplanation !== undefined ? params.internalExplanation : draft.internalExplanation,
      generatedBy: 'HUMAN',
      version: draft.version + 1,
      lastEditedBy: params.actor.email,
      status: draft.status === 'GENERATED' ? 'DRAFT' : draft.status
    } as Partial<AnswerDraft>);

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: draft.questionnaireId,
      action: 'DRAFT_EDITED',
      actor: params.actor,
      entityType: 'ANSWER',
      entityId: draft.id,
      summary: `Draft edited by a human reviewer (version ${updated.version}).`,
      details: { previousResponse: draft.customerFacingResponse, newResponse: updated.customerFacingResponse }
    });

    return updated;
  }

  public async reviewAction(params: {
    tenantId: string;
    actor: ServiceActor;
    draftId: string;
    action: ReviewAction;
    comment?: string;
    assignedToRole?: string;
    assignedToEmail?: string;
    selfApprovalJustification?: string;
    organizationalScope?: string[];
    approvalExpiresAt?: string;
  }): Promise<{ draft: AnswerDraft; review: AnswerReview; approval?: AnswerApproval }> {
    const draft = await this.store.getDraft(params.tenantId, params.draftId);
    if (!draft) throw Object.assign(new Error('Answer draft not found for this tenant.'), { statusCode: 404 });

    const requirement = await this.store.getRequirementForQuestion(params.tenantId, draft.questionId);
    const materialClass = requirement
      ? classifyMaterialClaim(
          [requirement.primaryCategory, ...requirement.secondaryCategories],
          requirement.originalWording
        )
      : 'GENERAL';

    const targetStatus: AnswerStatus = this.targetStatusFor(params.action);

    // ---- Authorization is evaluated BEFORE state-machine details ----------
    // An unauthorised actor must not learn anything about the current state, and
    // must never be able to reach the approval branch by sending a flag.
    if (params.action === 'APPROVE' && !params.actor.permissions.includes('questionnaire.approve') && !params.actor.isPlatformAdmin) {
      await this.audit({
        tenantId: params.tenantId,
        questionnaireId: draft.questionnaireId,
        action: 'UNAUTHORIZED_ATTEMPT',
        actor: params.actor,
        entityType: 'ANSWER',
        entityId: draft.id,
        summary: `Unauthorised approval attempt on draft ${draft.id}.`,
        details: { permissions: params.actor.permissions }
      });
      throw Object.assign(new Error("Forbidden: missing required permission 'questionnaire.approve'."), {
        statusCode: 403,
        code: 'PERMISSION_DENIED'
      });
    }

    // ---- Server-side state machine enforcement ----------------------------
    const allowed = ALLOWED_TRANSITIONS[draft.status] || [];
    if (!allowed.includes(targetStatus)) {
      throw Object.assign(
        new Error(
          `Invalid answer-state transition: ${draft.status} -> ${targetStatus} is not permitted (action ${params.action}).`
        ),
        { statusCode: 422, code: 'ILLEGAL_STATE_TRANSITION' }
      );
    }

    if (params.action === 'APPROVE') {
      if (draft.status === 'BLOCKED_UNSUPPORTED' && !params.selfApprovalJustification) {
        throw Object.assign(
          new Error(
            'This draft was blocked for insufficient evidence and cannot be approved without an explicit justification recorded in the approval.'
          ),
          { statusCode: 422, code: 'UNSUPPORTED_APPROVAL_REQUIRES_JUSTIFICATION' }
        );
      }

      const generatorApprovedOwnDraft = Boolean(draft.lastEditedBy && draft.lastEditedBy === params.actor.email);
      const material =
        materialClass === 'SECURITY' ||
        materialClass === 'PRIVACY' ||
        materialClass === 'REGULATORY' ||
        materialClass === 'CERTIFICATION' ||
        materialClass === 'CONTRACTUAL';

      // Separation of duties: for material claims, the person who authored the
      // wording may not silently approve it. An explicit, audited justification
      // is required and the approval is permanently flagged.
      if (material && generatorApprovedOwnDraft && !params.selfApprovalJustification) {
        throw Object.assign(
          new Error(
            `Separation of duties: this material (${materialClass}) claim was last edited by ${params.actor.email}. A different approver is required, or an explicit self-approval justification must be recorded.`
          ),
          { statusCode: 422, code: 'SEGREGATION_OF_DUTIES_VIOLATION' }
        );
      }

      if (['READ_ONLY', 'AUTOMATION', 'SYSTEM', 'DRAFT_ENGINE'].includes(params.actor.role.toUpperCase())) {
        throw Object.assign(new Error('This role may not approve security or compliance claims.'), {
          statusCode: 403,
          code: 'ROLE_CANNOT_APPROVE'
        });
      }

      const approval: AnswerApproval = {
        id: `APR-${draft.id}-${Date.now().toString(36)}`,
        tenantId: params.tenantId,
        questionnaireId: draft.questionnaireId,
        answerDraftId: draft.id,
        questionId: draft.questionId,
        approvedByEmail: params.actor.email,
        approvedByRole: params.actor.role,
        approvalScope: params.organizationalScope || draft.organizationalScope,
        approvedAt: new Date().toISOString(),
        approvedContentHash: crypto.createHash('sha256').update(draft.customerFacingResponse).digest('hex'),
        generatorApprovedOwnDraft,
        materialClaimClass: materialClass,
        expiresAt: params.approvalExpiresAt
      };
      await this.store.saveApproval(approval);
    }

    const updatedDraft = await this.store.updateDraft(params.tenantId, draft.id, { status: targetStatus });

    const review: AnswerReview = {
      id: `REV-${draft.id}-${Date.now().toString(36)}`,
      tenantId: params.tenantId,
      questionnaireId: draft.questionnaireId,
      answerDraftId: draft.id,
      questionId: draft.questionId,
      action: params.action,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      comment: params.comment,
      assignedToRole: params.assignedToRole,
      assignedToEmail: params.assignedToEmail,
      previousStatus: draft.status,
      newStatus: targetStatus,
      at: new Date().toISOString()
    };
    await this.store.saveReview(review);

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: draft.questionnaireId,
      action: params.action === 'APPROVE' ? 'ANSWER_APPROVED' : params.action === 'REJECT' ? 'ANSWER_REJECTED' : 'REVIEW_ACTION',
      actor: params.actor,
      entityType: 'ANSWER',
      entityId: draft.id,
      summary: `${params.action} on draft ${draft.id}: ${draft.status} -> ${targetStatus}.`,
      details: {
        comment: params.comment,
        materialClaimClass: materialClass,
        selfApprovalJustification: params.selfApprovalJustification,
        assignedToRole: params.assignedToRole
      }
    });

    // Refresh the assurance dependency graph: an approval binds to the answer it
    // approved, and re-approving an answer clears its revalidation requirement.
    await this.registerAssuranceDependencies({
      tenantId: params.tenantId,
      questionnaireId: draft.questionnaireId
    });

    const approval = params.action === 'APPROVE' ? await this.store.getApprovalForDraft(params.tenantId, draft.id) : undefined;
    return { draft: updatedDraft, review, approval: approval || undefined };
  }

  private targetStatusFor(action: ReviewAction): AnswerStatus {
    switch (action) {
      case 'APPROVE':
        return 'APPROVED';
      case 'REJECT':
        return 'REJECTED';
      case 'REQUEST_CHANGES':
      case 'REQUEST_INFORMATION':
      case 'REASSIGN':
        return 'CHANGES_REQUESTED';
      case 'SUBMIT_FOR_REVIEW':
        return 'IN_REVIEW';
      case 'EDIT_DRAFT':
        return 'DRAFT';
      case 'SUPERSEDE':
        return 'SUPERSEDED';
      default:
        return 'IN_REVIEW';
    }
  }

  public async explainDraft(tenantId: string, draftId: string) {
    const draft = await this.store.getDraft(tenantId, draftId);
    if (!draft) throw Object.assign(new Error('Answer draft not found for this tenant.'), { statusCode: 404 });
    const previous = await this.store.listLibraryEntries(tenantId);
    const requirement = await this.store.getRequirementForQuestion(tenantId, draft.questionId);
    const matching = requirement
      ? previous.find(e => e.normalizedRequirement === requirement.normalizedInterpretation)
      : undefined;
    const explanation = answerGenerationService.explain(draft, matching?.approvedAnswer);
    return { draft, explanation };
  }

  // -------------------------------------------------------------------------
  // GAPS
  // -------------------------------------------------------------------------

  public async listGaps(tenantId: string, questionnaireId: string, status?: string) {
    await this.getQuestionnaire(tenantId, questionnaireId);
    return this.store.listGaps(tenantId, questionnaireId, status ? { status } : undefined);
  }

  public async updateGapStatus(params: {
    tenantId: string;
    actor: ServiceActor;
    gapId: string;
    status: QuestionnaireGap['status'];
  }): Promise<QuestionnaireGap> {    const updated = await this.store.updateGap(params.tenantId, params.gapId, { status: params.status });
    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: updated.questionnaireId,
      action: 'GAP_DETECTED',
      actor: params.actor,
      entityType: 'GAP',
      entityId: updated.id,
      summary: `Gap ${updated.id} moved to ${params.status}.`,
      details: { gapType: updated.gapType, classification: updated.classification }
    });
    return updated;
  }

  // -------------------------------------------------------------------------
  // EXPORT
  // -------------------------------------------------------------------------

  public async exportPreflight(params: {
    tenantId: string;
    questionnaireId: string;
    policy?: Partial<ExportPolicy>;
    approvedExceptionId?: string;
    approvedExceptionReason?: string;
  }) {
    const workspace = await this.getWorkspace(params.tenantId, params.questionnaireId);
    const drafts = workspace.questions.map(q => q.answer).filter(Boolean) as AnswerDraft[];
    const approvals = await this.store.listApprovals(params.tenantId, params.questionnaireId);
    const gaps = await this.store.listGaps(params.tenantId, params.questionnaireId);
    return questionnaireExportService.buildPreflight({
      questions: workspace.questions.map(q => q.question),
      drafts,
      approvals,
      gaps,
      asOf: new Date().toISOString(),
      policy: params.policy,
      approvedExceptionId: params.approvedExceptionId,
      approvedExceptionReason: params.approvedExceptionReason
    });
  }

  public async exportQuestionnaire(params: {
    tenantId: string;
    actor: ServiceActor;
    questionnaireId: string;
    policy?: Partial<ExportPolicy>;
    approvedExceptionId?: string;
    approvedExceptionReason?: string;
  }): Promise<{ record: QuestionnaireExport; artifact: Buffer }> {
    if (!params.actor.permissions.includes('questionnaire.export') && !params.actor.isPlatformAdmin) {
      throw Object.assign(new Error("Forbidden: missing required permission 'questionnaire.export'."), {
        statusCode: 403,
        code: 'PERMISSION_DENIED'
      });
    }

    const questionnaire = await this.getQuestionnaire(params.tenantId, params.questionnaireId);
    const workspace = await this.getWorkspace(params.tenantId, params.questionnaireId);
    const drafts = workspace.questions.map(q => q.answer).filter(Boolean) as AnswerDraft[];
    const approvals = await this.store.listApprovals(params.tenantId, params.questionnaireId);
    const gaps = await this.store.listGaps(params.tenantId, params.questionnaireId);

    const preflight = questionnaireExportService.buildPreflight({
      questions: workspace.questions.map(q => q.question),
      drafts,
      approvals,
      gaps,
      asOf: new Date().toISOString(),
      policy: params.policy,
      approvedExceptionId: params.approvedExceptionId,
      approvedExceptionReason: params.approvedExceptionReason
    });

    if (!preflight.canExport) {
      await this.audit({
        tenantId: params.tenantId,
        questionnaireId: params.questionnaireId,
        action: 'EXPORT_PREFLIGHT_BLOCKED',
        actor: params.actor,
        entityType: 'EXPORT',
        entityId: params.questionnaireId,
        summary: `Export blocked by ${preflight.findings.filter(f => f.severity === 'BLOCKING').length} blocking finding(s).`,
        details: { findings: preflight.findings }
      });
      throw Object.assign(new Error('Export blocked by preflight validation.'), {
        statusCode: 422,
        code: 'EXPORT_BLOCKED',
        preflight
      });
    }

    const artifactRead = getQuestionnaireArtifactStore().readVerified(
      params.tenantId,
      questionnaire.sourceArtifact.storedLocator,
      questionnaire.sourceArtifact.sha256ContentHash
    );
    if (!artifactRead.verified) {
      throw Object.assign(new Error(`Source artifact integrity check failed: ${artifactRead.reason}`), {
        statusCode: 409,
        code: 'SOURCE_ARTIFACT_UNVERIFIED'
      });
    }

    const { record, artifact } = await questionnaireExportService.buildExport({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      title: questionnaire.title,
      format: questionnaire.format as QuestionnaireSourceFormat,
      sourceBuffer: artifactRead.buffer,
      sourceFileName: questionnaire.sourceArtifact.fileName,
      sourceSha256: questionnaire.sourceArtifact.sha256ContentHash,
      questions: workspace.questions.map(q => q.question),
      drafts,
      approvals,
      preflight,
      generatedBy: params.actor.email,
      asOf: new Date().toISOString(),
      approvedExceptionId: params.approvedExceptionId
    });

    await this.store.saveExport(record);

    const updated: Questionnaire = {
      ...questionnaire,
      status: 'EXPORTED',
      updatedAt: new Date().toISOString(),
      version: questionnaire.version + 1,
      statusHistory: [
        ...questionnaire.statusHistory,
        { status: 'EXPORTED', at: record.generatedAt, actor: params.actor.email, note: `Exported ${record.fileName}` }
      ]
    };
    await this.store.saveQuestionnaire(updated);

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      action: params.approvedExceptionId ? 'EXPORT_AUTHORIZED_WITH_EXCEPTION' : 'QUESTIONNAIRE_EXPORTED',
      actor: params.actor,
      entityType: 'EXPORT',
      entityId: record.id,
      summary: `Exported ${record.fileName}: ${record.questionsPopulated} response(s) populated, ${record.questionsLeftUnresolvedAndVisible} left unresolved and visible.`,
      details: {
        sha256: record.sha256Digest,
        validation: record.validation,
        approvedExceptionId: params.approvedExceptionId,
        preflightFindings: preflight.findings
      }
    });

    return { record, artifact };
  }

  // -------------------------------------------------------------------------
  // GOVERNED ANSWER LIBRARY
  // -------------------------------------------------------------------------

  public async listLibrary(tenantId: string): Promise<GovernedAnswerLibraryEntry[]> {
    return this.store.listLibraryEntries(tenantId);
  }

  public async approveIntoLibrary(params: {
    tenantId: string;
    actor: ServiceActor;
    draftId: string;
    productOrServiceScope?: string[];
    businessUnit?: string;
    reviewDueAt: string;
    reason?: string;
  }): Promise<GovernedAnswerLibraryEntry> {
    const draft = await this.store.getDraft(params.tenantId, params.draftId);
    if (!draft) throw Object.assign(new Error('Answer draft not found for this tenant.'), { statusCode: 404 });
    const approval = await this.store.getApprovalForDraft(params.tenantId, draft.id);
    if (!approval) {
      throw Object.assign(
        new Error('Only an approved answer with a recorded approval may enter the governed answer library.'),
        { statusCode: 422, code: 'APPROVAL_REQUIRED' }
      );
    }
    if (approval.approvedContentHash !== crypto.createHash('sha256').update(draft.customerFacingResponse).digest('hex')) {
      throw Object.assign(
        new Error('The answer text changed after approval; re-approval is required before it can enter the answer library.'),
        { statusCode: 409, code: 'APPROVED_CONTENT_CHANGED' }
      );
    }
    const requirement = await this.store.getRequirementForQuestion(params.tenantId, draft.questionId);
    if (!requirement) {
      throw Object.assign(new Error('Requirement analysis is missing for this answer.'), { statusCode: 422 });
    }

    const entry = await this.libraryService.storeApprovedAnswer({
      tenantId: params.tenantId,
      canonicalQuestion: requirement.normalizedInterpretation || requirement.originalWording,
      normalizedRequirement: requirement.normalizedInterpretation,
      approvedAnswer: draft.customerFacingResponse,
      category: requirement.primaryCategory,
      frameworkMappings: requirement.frameworkMappings.map(m => `${m.frameworkCode} ${m.requirementCode}`),
      controlReferences: draft.controlReferences,
      evidenceReferenceIds: draft.citations.map(c => c.sourceId),
      organizationalScope: draft.organizationalScope,
      productOrServiceScope: params.productOrServiceScope || [],
      businessUnit: params.businessUnit || 'organization',
      approvedBy: approval.approvedByEmail,
      approvedAt: approval.approvedAt,
      reviewDueAt: params.reviewDueAt,
      knownLimitations: draft.missingInformation.map(m => m.detail),
      customerSpecificRestrictions: [],
      evidenceFreshnessAtApproval: draft.citations.every(c => c.freshnessStatus === 'CURRENT') ? 'CURRENT' : 'STALE',
      reason: params.reason
    });

    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: draft.questionnaireId,
      action: 'ANSWER_REUSED',
      actor: params.actor,
      entityType: 'ANSWER',
      entityId: entry.id,
      summary: `Approved answer added to the governed library as ${entry.id} (v${entry.version}).`,
      details: { sourceDraftId: draft.id, category: entry.category }
    });

    return entry;
  }

  public async revalidateLibraryEntry(params: {
    tenantId: string;
    actor: ServiceActor;
    entryId: string;
    reason: string;
  }): Promise<GovernedAnswerLibraryEntry> {
    const entries = await this.store.listLibraryEntries(params.tenantId);
    const entry = entries.find(e => e.id === params.entryId);
    if (!entry) throw Object.assign(new Error('Library entry not found for this tenant.'), { statusCode: 404 });
    const updated = await this.libraryService.markForRevalidation({
      entry,
      reason: params.reason,
      actor: params.actor.email,
      at: new Date().toISOString()
    });
    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: 'library',
      action: 'ANSWER_REVALIDATION_REQUESTED',
      actor: params.actor,
      entityType: 'ANSWER',
      entityId: entry.id,
      summary: `Revalidation requested for library entry ${entry.id}: ${params.reason}`,
      details: {}
    });
    return updated;
  }

  // -------------------------------------------------------------------------
  // TRUST CENTER DISCLOSURES
  // -------------------------------------------------------------------------

  public async listDisclosures(tenantId: string): Promise<TrustCenterDisclosure[]> {
    return this.store.listDisclosures(tenantId);
  }

  public async listPublishedDisclosures(tenantId: string): Promise<TrustCenterDisclosure[]> {
    return this.disclosureService.listPublished({ tenantId, asOf: new Date().toISOString() });
  }

  public async proposeDisclosure(params: {
    tenantId: string;
    actor: ServiceActor;
    draftId?: string;
    title: string;
    category?: TrustCenterDisclosure['category'];
    publicContent?: string;
    internalSourceIds?: string[];
    expiresAt?: string;
  }): Promise<TrustCenterDisclosure> {
    let proposal;
    if (params.draftId) {
      const draft = await this.store.getDraft(params.tenantId, params.draftId);
      if (!draft) throw Object.assign(new Error('Answer draft not found for this tenant.'), { statusCode: 404 });
      const approval = await this.store.getApprovalForDraft(params.tenantId, draft.id);
      if (!approval) {
        throw Object.assign(new Error('Only an approved answer may be proposed for disclosure.'), {
          statusCode: 422,
          code: 'APPROVAL_REQUIRED'
        });
      }
      proposal = this.disclosureService.proposeFromApprovedAnswer({
        draft,
        approval,
        title: params.title,
        expiresAt: params.expiresAt
      });
    } else {
      if (!params.publicContent) {
        throw Object.assign(new Error('publicContent is required when proposing a disclosure without an answer draft.'), {
          statusCode: 422
        });
      }
      proposal = {
        title: params.title,
        category: params.category || 'SECURITY_POLICY_SUMMARY',
        publicContent: normalizeText(params.publicContent),
        internalSourceIds: params.internalSourceIds || [],
        expiresAt: params.expiresAt
      };
    }

    const { disclosure, validation } = await this.disclosureService.createProposal({
      tenantId: params.tenantId,
      proposal,
      actor: params.actor.email,
      asOf: new Date().toISOString()
    });

    if (!validation.valid) {
      throw Object.assign(new Error(`Disclosure proposal rejected: ${validation.errors.join(' ')}`), {
        statusCode: 422,
        code: 'DISCLOSURE_INVALID'
      });
    }

    return disclosure;
  }

  public async authorizeDisclosure(params: {
    tenantId: string;
    actor: ServiceActor;
    disclosureId: string;
    expiresAt?: string;
  }): Promise<TrustCenterDisclosure> {
    const disclosure = await this.disclosureService.authorize({
      tenantId: params.tenantId,
      disclosureId: params.disclosureId,
      actor: params.actor.email,
      actorRole: params.actor.role,
      asOf: new Date().toISOString(),
      expiresAt: params.expiresAt
    });
    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: 'trust-center',
      action: 'DISCLOSURE_AUTHORIZED',
      actor: params.actor,
      entityType: 'DISCLOSURE',
      entityId: disclosure.id,
      summary: `Disclosure ${disclosure.id} authorised for external publication.`,
      details: { category: disclosure.category, expiresAt: disclosure.expiresAt }
    });
    return disclosure;
  }

  public async withdrawDisclosure(params: {
    tenantId: string;
    actor: ServiceActor;
    disclosureId: string;
    reason: string;
  }): Promise<TrustCenterDisclosure> {
    const disclosure = await this.disclosureService.withdraw({
      tenantId: params.tenantId,
      disclosureId: params.disclosureId,
      actor: params.actor.email,
      reason: params.reason,
      asOf: new Date().toISOString()
    });
    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: 'trust-center',
      action: 'DISCLOSURE_WITHDRAWN',
      actor: params.actor,
      entityType: 'DISCLOSURE',
      entityId: disclosure.id,
      summary: `Disclosure ${disclosure.id} withdrawn: ${params.reason}`,
      details: {}
    });
    return disclosure;
  }

  // -------------------------------------------------------------------------
  // ORGANIZATIONAL FACTS
  // -------------------------------------------------------------------------

  public async listOrgFacts(tenantId: string): Promise<ApprovedOrganizationalFact[]> {
    return this.store.listOrgFacts(tenantId);
  }

  public async saveOrgFact(params: {
    tenantId: string;
    actor: ServiceActor;
    fact: Omit<ApprovedOrganizationalFact, 'id' | 'tenantId' | 'approvedBy' | 'approvedAt'> & { id?: string };
  }): Promise<ApprovedOrganizationalFact> {
    const record: ApprovedOrganizationalFact = {
      ...params.fact,
      id: params.fact.id || `FACT-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
      tenantId: params.tenantId,
      approvedBy: params.actor.email,
      approvedAt: new Date().toISOString()
    };
    await this.store.saveOrgFact(record);
    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: 'org-facts',
      action: 'ANSWER_REUSED',
      actor: params.actor,
      entityType: 'ANSWER',
      entityId: record.id,
      summary: `Approved organizational fact recorded: ${record.title}`,
      details: { category: record.category }
    });
    return record;
  }

  public async deleteOrgFact(tenantId: string, actor: ServiceActor, factId: string): Promise<boolean> {
    const deleted = await this.store.deleteOrgFact(tenantId, factId);
    if (deleted) {
      await this.audit({
        tenantId,
        questionnaireId: 'org-facts',
        action: 'ANSWER_REVALIDATION_REQUESTED',
        actor,
        entityType: 'ANSWER',
        entityId: factId,
        summary: `Approved organizational fact ${factId} withdrawn; answers relying on it must be revalidated.`,
        details: {}
      });
    }
    return deleted;
  }

  // -------------------------------------------------------------------------
  // JOBS / AUDIT / RETENTION
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // CONTINUOUS ASSURANCE & REVALIDATION
  // -------------------------------------------------------------------------

  /**
   * Only a reviewer (or platform admin) may assert that an underlying source
   * changed or replay a monitoring change: revalidation directly affects whether
   * customer-facing assurance claims may still be made.
   */
  private assertAssuranceActor(actor: ServiceActor, action: string): void {
    const allowed =
      actor.isPlatformAdmin ||
      actor.permissions.includes('questionnaire.review') ||
      actor.permissions.includes('questionnaire.approve');
    if (!allowed) {
      throw Object.assign(
        new Error(`Forbidden: '${action}' requires the questionnaire.review permission.`),
        { statusCode: 403, code: 'PERMISSION_DENIED' }
      );
    }
  }

  /** Ingest an upstream monitoring change and revalidate every dependent answer. */
  public async ingestAssuranceSourceChange(params: {
    tenantId: string;
    actor: ServiceActor;
    change: SourceChangeInput;
    asOf?: string;
  }): Promise<RevalidationOutcome> {
    this.assertAssuranceActor(params.actor, 'ingest a monitoring source change');
    const outcome = await this.getAssuranceService().ingestSourceChange({
      tenantId: params.tenantId,
      change: params.change,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      monitoringMode: 'EVENT_DRIVEN',
      asOf: params.asOf
    });

    // One audit entry per impacted questionnaire, so an operator can see the
    // monitoring change in the same history as the answer it affected.
    for (const questionnaireId of Array.from(
      new Set(outcome.revalidations.map(r => r.questionnaireId))
    )) {
      await this.audit({
        tenantId: params.tenantId,
        questionnaireId,
        action: 'SOURCE_CHANGE_INGESTED',
        actor: params.actor,
        entityType: 'QUESTIONNAIRE',
        entityId: questionnaireId,
        summary: `Monitoring change ${outcome.change.id} (${outcome.change.kind} on ${outcome.change.sourceKind} ${outcome.change.sourceId}) revalidated ${
          outcome.revalidations.filter(r => r.questionnaireId === questionnaireId).length
        } answer(s).`,
        details: {
          changeId: outcome.change.id,
          changeStatus: outcome.change.status,
          monitoringMode: outcome.change.monitoringMode,
          correlationId: outcome.change.correlationId,
          duplicateSuppressed: outcome.duplicateSuppressed
        }
      });
    }

    return outcome;
  }

  /** Reviewer queue of answers that must be re-verified. */
  public async assuranceRevalidationQueue(params: {
    tenantId: string;
    questionnaireId?: string;
    asOf?: string;
  }): Promise<RevalidationQueueItem[]> {
    return this.getAssuranceService().revalidationQueue({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      asOf: params.asOf || new Date().toISOString()
    });
  }

  /** The explicit dependency graph (answer -> claim -> upstream source). */
  public async assuranceDependencies(params: { tenantId: string; questionnaireId?: string }) {
    return this.getAssuranceService().listDependencies(params);
  }

  /** The durable monitoring change inbox. */
  public async assuranceSourceChanges(params: { tenantId: string; limit?: number }): Promise<SourceChangeRecord[]> {
    return this.getAssuranceService().listSourceChanges(params);
  }

  /**
   * Deliberate replay of a stored change (typically a dead letter). Replay is
   * idempotent: it updates existing revalidation records instead of duplicating.
   */
  public async replayAssuranceSourceChange(params: {
    tenantId: string;
    actor: ServiceActor;
    changeId: string;
    asOf?: string;
  }): Promise<RevalidationOutcome> {
    this.assertAssuranceActor(params.actor, 'replay a monitoring source change');
    return this.getAssuranceService().replaySourceChange({
      tenantId: params.tenantId,
      changeId: params.changeId,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      asOf: params.asOf
    });
  }

  /**
   * Periodic reconciliation: compares provider-observed state with SKANDA's
   * recorded state, recovering changes whose events were missed. Sources that
   * were not observed are reported, never assumed healthy.
   */
  public async reconcileAssurance(params: {
    tenantId: string;
    actor: ServiceActor;
    sourceStates: UpstreamSourceState[];
    monitoringMode: 'SCHEDULED_POLLING' | 'MANUAL_REFRESH';
    questionnaireId?: string;
    asOf?: string;
  }): Promise<ReconciliationResult> {
    this.assertAssuranceActor(params.actor, 'run a monitoring reconciliation');
    return this.getAssuranceService().reconcile({
      tenantId: params.tenantId,
      sourceStates: params.sourceStates,
      monitoringMode: params.monitoringMode,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      questionnaireId: params.questionnaireId,
      asOf: params.asOf
    });
  }

  /**
   * Operational metrics derived from stored records. The claim and pipeline
   * counters cover the questionnaires enumerated for this call; the number is
   * reported alongside them so a partial scan is never mistaken for a full one.
   */
  public async assuranceMetrics(params: { tenantId: string; asOf?: string }): Promise<QuestionnaireObservabilityMetrics> {
    const assurance = this.getAssuranceService();
    const asOf = params.asOf || new Date().toISOString();
    const [sourceChanges, dependencies, revalidationEvents] = await Promise.all([
      assurance.listSourceChanges({ tenantId: params.tenantId }),
      assurance.listDependencies({ tenantId: params.tenantId }),
      this.store.listRevalidationEvents(params.tenantId)
    ]);

    // Bounded enumeration (the JSON store re-reads its file per call, so an
    // unbounded sweep would be O(questionnaires) full file reads).
    const QUESTIONNAIRE_SCAN_LIMIT = 25;
    const page = await this.store.listQuestionnaires(params.tenantId, { limit: QUESTIONNAIRE_SCAN_LIMIT });
    const drafts: AnswerDraft[] = [];
    const gaps: QuestionnaireGap[] = [];
    const jobs: QuestionnaireJob[] = [];
    const auditEvents: QuestionnaireAuditEvent[] = [];
    for (const questionnaire of page.items) {
      drafts.push(...(await this.store.listDrafts(params.tenantId, questionnaire.id)));
      gaps.push(...(await this.store.listGaps(params.tenantId, questionnaire.id)));
      jobs.push(...(await this.store.listJobs(params.tenantId, questionnaire.id)));
      auditEvents.push(...(await this.store.listAuditEvents(params.tenantId, questionnaire.id, 500)));
    }

    return buildObservabilityMetrics({
      tenantId: params.tenantId,
      generatedAt: asOf,
      storageType: this.store.getStorageType(),
      sourceChanges,
      dependencies,
      revalidationEvents,
      drafts,
      gaps,
      jobs,
      auditEvents
    });
  }

  public async getJob(tenantId: string, jobId: string): Promise<QuestionnaireJob | null> {
    return this.store.getJobById(tenantId, jobId);
  }

  public async listAuditEvents(tenantId: string, questionnaireId: string, limit?: number) {
    return this.store.listAuditEvents(tenantId, questionnaireId, limit);
  }

  public async listExports(tenantId: string, questionnaireId: string) {
    await this.getQuestionnaire(tenantId, questionnaireId);
    return this.store.listExports(tenantId, questionnaireId);
  }

  public async deleteQuestionnaire(params: { tenantId: string; actor: ServiceActor; questionnaireId: string }) {
    await this.getQuestionnaire(params.tenantId, params.questionnaireId);
    await this.audit({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      action: 'UNAUTHORIZED_ATTEMPT',
      actor: params.actor,
      entityType: 'QUESTIONNAIRE',
      entityId: params.questionnaireId,
      summary: 'Questionnaire deletion requested (retention workflow). Audit history of this action is retained in the platform trail.',
      details: {}
    });
    return this.store.deleteQuestionnaire(params.tenantId, params.questionnaireId);
  }

  public async health() {
    const storeHealth = await this.store.healthCheck();
    return {
      storageType: this.store.getStorageType(),
      storage: storeHealth,
      runningJobs: this.runningJobs.size
    };
  }

  // -------------------------------------------------------------------------
  // AUDIT HELPER
  // -------------------------------------------------------------------------

  private async audit(params: {
    tenantId: string;
    questionnaireId: string;
    action: QuestionnaireAuditEvent['action'];
    actor: ServiceActor;
    entityType: QuestionnaireAuditEvent['entityType'];
    entityId: string;
    summary: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const event: QuestionnaireAuditEvent = {
      id: `QAE-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      action: params.action,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      entityType: params.entityType,
      entityId: params.entityId,
      summary: params.summary,
      details: params.details,
      at: new Date().toISOString()
    };
    try {
      await this.store.appendAuditEvent(event);
    } catch (err: any) {
      // Audit failure must not silently pass: it is logged loudly and surfaced.
      console.error(
        `[QuestionnaireIntelligence] AUDIT WRITE FAILURE for ${params.action} on ${params.entityId}: ${err.message}`
      );
      throw Object.assign(new Error(`Audit history could not be recorded: ${err.message}`), {
        statusCode: 500,
        code: 'AUDIT_WRITE_FAILED'
      });
    }
  }

  /**
   * Verifies the questionnaire audit hash chain.
   *
   * The chain is global to the store (a single moving head), so verification
   * checks two things for the events belonging to this questionnaire:
   *   1. each event links to the previous event's integrity hash, and
   *   2. each event's integrity hash is reproducible from its own content.
   */
  public async verifyAuditChain(tenantId: string, questionnaireId: string): Promise<{ valid: boolean; brokenAt?: string }> {
    const events = (await this.store.listAuditEvents(tenantId, questionnaireId, 1000)) as any[];
    const chronological = [...events].reverse();

    for (let i = 0; i < chronological.length; i++) {
      const event = chronological[i];
      const recomputed = computeAuditEventHash(event.previousHash || '0'.repeat(64), event);
      if (event.integrityHash && recomputed !== event.integrityHash) {
        return { valid: false, brokenAt: event.id };
      }
      if (i > 0 && event.previousHash !== chronological[i - 1].integrityHash) {
        return { valid: false, brokenAt: event.id };
      }
    }
    return { valid: true };
  }
}

let singleton: QuestionnaireIntelligenceService | null = null;

export function getQuestionnaireIntelligenceService(): QuestionnaireIntelligenceService {
  if (!singleton) singleton = new QuestionnaireIntelligenceService();
  return singleton;
}
