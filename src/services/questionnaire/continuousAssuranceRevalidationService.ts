// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: CONTINUOUS ASSURANCE & REVALIDATION
// Path: src/services/questionnaire/continuousAssuranceRevalidationService.ts
//
// WHY THIS EXISTS
// A security questionnaire answer is only true while the facts behind it are
// true. Once an answer cites a control, a control test, an evidence artifact, a
// policy, an integration, an exception, an approval or an organizational scope,
// SKANDA records that edge in an explicit dependency graph:
//
//     answer -> claim -> control / test / evidence / policy / integration /
//                        risk-or-exception / approval / scope
//
// When any of those upstream facts changes, this engine detects the impact and
// routes the dependent answer for revalidation. Approved wording is NEVER
// rewritten automatically: the previously approved text is preserved verbatim,
// a revalidation event explains what changed, and a human must review and
// re-approve. A source that cannot be read yields UNKNOWN/STALE — never
// "still compliant".
//
// RELIABILITY PROPERTIES
//  - Durable, idempotent change inbox: a redelivered notification is counted as
//    a duplicate and produces NO second revalidation.
//  - Replay safety: re-processing a change updates the existing revalidation
//    record for that (change, answer) pair instead of inserting another.
//  - Bounded retries with backoff, then an explicit DEAD_LETTER with a reason —
//    never a silent drop.
//  - Deterministic evaluation clock (`asOf`) so results are reproducible.
//  - Repeated signals for the same unresolved condition deduplicate and suppress
//    the repeat notification while keeping one open revalidation.
//  - Separation of the four clocks: source-observed, collected, evaluated,
//    last-verified. They are never collapsed into one "last checked" value.
// ============================================================================

import crypto from 'crypto';
import {
  AnswerApproval,
  AnswerAssuranceDependency,
  AnswerDraft,
  AnswerRevalidationEvent,
  AssuranceSourceKind,
  EvidenceCitation,
  GovernedAnswerLibraryEntry,
  ImpactedClaimSummary,
  MonitoringMode,
  RequirementAnalysis,
  RevalidationQueueItem,
  QuestionnaireAuditAction,
  QuestionnaireAuditEvent,
  QuestionnaireGap,
  QuestionnaireJob,
  QuestionnaireObservabilityMetrics,
  SourceChangeKind,
  SourceChangeRecord,
  UpstreamSourceState
} from '../../types/questionnaireIntelligenceTypes.js';

// ---------------------------------------------------------------------------
// PERSISTENCE PORT
// ---------------------------------------------------------------------------
// The engine is deliberately independent of the store implementation so it can
// run against the Postgres repository, the durable JSON repository, or a test
// double that injects failures.

export interface AssuranceAuditInput {
  tenantId: string;
  questionnaireId: string;
  action: QuestionnaireAuditAction;
  actorEmail: string;
  actorRole: string;
  entityId: string;
  summary: string;
  details?: Record<string, any>;
}

export interface AssurancePersistencePort {
  listAssuranceDependencies(tenantId: string, questionnaireId?: string): Promise<AnswerAssuranceDependency[]>;
  saveAssuranceDependency(dependency: AnswerAssuranceDependency): Promise<AnswerAssuranceDependency>;
  listSourceChanges(tenantId: string, options?: { limit?: number }): Promise<SourceChangeRecord[]>;
  getSourceChangeByKey(tenantId: string, idempotencyKey: string): Promise<SourceChangeRecord | null>;
  getSourceChangeById(tenantId: string, changeId: string): Promise<SourceChangeRecord | null>;
  saveSourceChange(record: SourceChangeRecord): Promise<SourceChangeRecord>;
  listRevalidationEvents(tenantId: string, questionnaireId?: string): Promise<AnswerRevalidationEvent[]>;
  getRevalidationEventByKey(tenantId: string, dedupeKey: string): Promise<AnswerRevalidationEvent | null>;
  saveRevalidationEvent(event: AnswerRevalidationEvent): Promise<AnswerRevalidationEvent>;
  getDraft(tenantId: string, draftId: string): Promise<AnswerDraft | null>;
  updateDraft(tenantId: string, draftId: string, patch: Partial<AnswerDraft>): Promise<AnswerDraft>;
  getApprovalForDraft(tenantId: string, draftId: string): Promise<AnswerApproval | null>;
  listLibraryEntries(tenantId: string): Promise<GovernedAnswerLibraryEntry[]>;
  saveLibraryEntry(entry: GovernedAnswerLibraryEntry): Promise<GovernedAnswerLibraryEntry>;
  appendAuditEvent(event: QuestionnaireAuditEvent): Promise<QuestionnaireAuditEvent>;
  getStorageType(): 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE';
}

// ---------------------------------------------------------------------------
// INPUTS / OUTPUTS
// ---------------------------------------------------------------------------

export interface SourceChangeInput {
  kind: SourceChangeKind;
  sourceKind: AssuranceSourceKind;
  sourceId: string;
  /** Scope the change applies to. Empty means tenant-wide. */
  resourceScope?: string[];
  previousState?: string;
  newState?: string;
  detail?: string;
  /** When the external source actually observed the change (ISO). */
  sourceObservedAt?: string;
  correlationId?: string;
  /** Supplied when the producer already computed a stable key. */
  idempotencyKey?: string;
  monitoringMode?: MonitoringMode;
}

export interface RevalidationOutcome {
  change: SourceChangeRecord;
  duplicateSuppressed: boolean;
  revalidations: AnswerRevalidationEvent[];
  impactedAnswers: number;
  /** Answers whose notification was suppressed because the condition is already open. */
  notificationsSuppressed: number;
}

export interface ReconciliationResult {
  polled: number;
  changes: RevalidationOutcome[];
  /** Dependencies whose primary source was not present in the observation set. */
  unobservedDependencies: string[];
  revalidationsRaised: number;
}

export interface DependencyRegistrationResult {
  created: number;
  updated: number;
  dependencyIds: string[];
}

export interface AssuranceMetricsInput {
  tenantId: string;
  generatedAt: string;
  storageType: 'POSTGRESQL_RELATIONAL' | 'JSON_DURABLE';
  sourceChanges: SourceChangeRecord[];
  dependencies: AnswerAssuranceDependency[];
  revalidationEvents: AnswerRevalidationEvent[];
  drafts: AnswerDraft[];
  gaps: QuestionnaireGap[];
  jobs: QuestionnaireJob[];
  auditEvents: QuestionnaireAuditEvent[];
}

const KNOWN_CHANGE_KINDS: SourceChangeKind[] = [
  'CONTROL_STATE_CHANGED',
  'CONTROL_TEST_FAILED',
  'EVIDENCE_EXPIRED',
  'EVIDENCE_SUPERSEDED',
  'POLICY_SUPERSEDED',
  'EXCEPTION_RAISED',
  'CONNECTOR_UNHEALTHY',
  'INTEGRATION_DISCONNECTED',
  'APPROVAL_EXPIRED',
  'SCOPE_CHANGED',
  'FRAMEWORK_REQUIREMENT_CHANGED'
];

const KNOWN_SOURCE_KINDS: AssuranceSourceKind[] = [
  'CONTROL',
  'CONTROL_TEST',
  'EVIDENCE',
  'POLICY',
  'RISK_OR_EXCEPTION',
  'INTEGRATION',
  'APPROVAL',
  'SCOPE',
  'FRAMEWORK_REQUIREMENT'
];

/** Maximum accepted clock skew between an observation and SKANDA's clock. */
const MAX_OBSERVATION_SKEW_MS = 5 * 60 * 1000;

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function unique(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v && String(v).trim()))));
}

function parseIso(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Deterministic ordering helper: `b` is always stably comparable. */
function byIsoDesc(a: string | undefined, b: string | undefined): number {
  const av = a || '';
  const bv = b || '';
  if (av === bv) return 0;
  return av < bv ? 1 : -1;
}

// ---------------------------------------------------------------------------
// PURE METRIC BUILDER (exported so it can be validated directly)
// ---------------------------------------------------------------------------

export function buildObservabilityMetrics(input: AssuranceMetricsInput): QuestionnaireObservabilityMetrics {
  const { sourceChanges, dependencies, revalidationEvents, drafts, gaps, jobs, auditEvents } = input;

  const completedChanges = sourceChanges.filter(c => c.status === 'PROCESSED' || c.status === 'NO_DEPENDENTS');
  const latencies = sourceChanges
    .map(c => c.processingLatencyMs)
    .filter((v): v is number => typeof v === 'number');

  const openRevalidations = revalidationEvents.filter(ev => ev.newStatus === 'REVALIDATION_REQUIRED');
  // An answer is "open" while it still sits in REVALIDATION_REQUIRED; the draft
  // status is authoritative, so resolve it from the current drafts.
  const draftById = new Map(drafts.map(d => [d.id, d]));
  const openQueueEvents = openRevalidations.filter(ev => {
    const draft = draftById.get(ev.answerDraftId);
    if (!draft) return true;
    return draft.status === 'REVALIDATION_REQUIRED';
  });

  let staleOrExpiredCitations = 0;
  let unsupported = 0;
  let partiallySupported = 0;
  let contradicted = 0;
  for (const draft of drafts) {
    if (draft.sufficiency === 'INSUFFICIENT') unsupported++;
    if (draft.sufficiency === 'PARTIAL') partiallySupported++;
    if (draft.sufficiency === 'CONTRADICTED') contradicted++;
    staleOrExpiredCitations += draft.citations.filter(
      c => c.freshnessStatus === 'EXPIRED' || c.freshnessStatus === 'STALE'
    ).length;
  }

  const oldestOpenAt = openQueueEvents
    .map(ev => ev.createdAt)
    .sort((a, b) => (a < b ? -1 : 1))[0] || null;    // Authoritative: the recorded monitoring mode of the change inbox itself.
    const lastReconciliation =
      sourceChanges
        .filter(c => c.monitoringMode === 'SCHEDULED_POLLING' || c.monitoringMode === 'MANUAL_REFRESH')
        .map(c => c.collectedAt)
        .sort((a, b) => (a < b ? 1 : -1))[0] || null;

  return {
    generatedAt: input.generatedAt,
    storageType: input.storageType,
    questionnaireCoverage: unique(drafts.map(d => d.questionnaireId)).length,
    sourceChanges: {
      received: sourceChanges.length,
      processed: sourceChanges.filter(c => c.status === 'PROCESSED').length,
      noDependents: sourceChanges.filter(c => c.status === 'NO_DEPENDENTS').length,
      duplicatesSuppressed: sourceChanges.reduce((sum, c) => sum + (c.duplicateAttempts || 0), 0),
      rejected: sourceChanges.filter(c => c.status === 'REJECTED').length,
      deadLettered: sourceChanges.filter(c => c.status === 'DEAD_LETTER').length,
      pending: sourceChanges.filter(c => c.status === 'PENDING').length,
      avgProcessingLatencyMs: latencies.length
        ? Math.round(latencies.reduce((sum, v) => sum + v, 0) / latencies.length)
        : null
    },
    revalidation: {
      events: revalidationEvents.length,
      openQueue: openQueueEvents.length,
      suppressedNotifications: revalidationEvents.filter(ev => ev.notificationSuppressed).length,
      distinctAnswers: unique(revalidationEvents.map(ev => ev.answerDraftId)).length,
      distinctQuestionnaires: unique(revalidationEvents.map(ev => ev.questionnaireId)).length,
      oldestOpenAt
    },
    dependencies: {
      total: dependencies.length,
      current: dependencies.filter(d => d.status === 'CURRENT').length,
      revalidationRequired: dependencies.filter(d => d.status === 'REVALIDATION_REQUIRED').length,
      superseded: dependencies.filter(d => d.status === 'SUPERSEDED').length
    },
    claims: {
      unsupported,
      partiallySupported,
      contradicted,
      staleOrExpiredEvidenceCitations: staleOrExpiredCitations
    },
    pipeline: {
      importFailures: auditEvents.filter(ev => ev.action === 'JOB_ATTEMPT_FAILED').length,
      failedJobs: jobs.filter(j => j.status === 'FAILED').length,
      exportPreflightBlocks: auditEvents.filter(ev => ev.action === 'EXPORT_PREFLIGHT_BLOCKED').length,
      openGaps: gaps.filter(g => g.status === 'OPEN' || g.status === 'OWNER_NOTIFIED').length
    },
    monitoring: {
      eventDrivenChanges: sourceChanges.filter(c => c.monitoringMode === 'EVENT_DRIVEN').length,
      scheduledPolls: sourceChanges.filter(c => c.monitoringMode === 'SCHEDULED_POLLING').length,
      manualRefreshes: sourceChanges.filter(c => c.monitoringMode === 'MANUAL_REFRESH').length,
      lastReconciliationAt: lastReconciliation
    }
  };
}

// ---------------------------------------------------------------------------
// ENGINE
// ---------------------------------------------------------------------------

export interface ContinuousAssuranceOptions {
  maxAttempts?: number;
  /** Injected so tests run without real delays. */
  sleep?: (ms: number) => Promise<void>;
  clock?: () => string;
}

export class ContinuousAssuranceRevalidationService {
  private readonly port: AssurancePersistencePort;
  private readonly maxAttempts: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly clock: () => string;

  constructor(port: AssurancePersistencePort, options: ContinuousAssuranceOptions = {}) {
    this.port = port;
    this.maxAttempts = options.maxAttempts ?? 3;
    this.sleep = options.sleep ?? (async (ms: number) => {
      await new Promise(resolve => setTimeout(resolve, ms));
    });
    this.clock = options.clock ?? (() => new Date().toISOString());
  }

  // -------------------------------------------------------------------------
  // 1. DEPENDENCY GRAPH REGISTRATION
  // -------------------------------------------------------------------------

  /**
   * Registers or refreshes the dependency edges for a set of drafts. Only facts
   * that actually appear on the draft are recorded — nothing is inferred.
   */
  public async registerDependencies(params: {
    tenantId: string;
    questionnaireId: string;
    drafts: AnswerDraft[];
    requirements?: RequirementAnalysis[];
    approvals?: AnswerApproval[];
    asOf: string;
    integrationIds?: string[];
    riskIdsByQuestionId?: Record<string, string[]>;
  }): Promise<DependencyRegistrationResult> {
    const requirementByQuestion = new Map((params.requirements || []).map(r => [r.questionId, r]));
    const approvalByDraft = new Map((params.approvals || []).map(a => [a.answerDraftId, a]));
    const existing = await this.port.listAssuranceDependencies(params.tenantId, params.questionnaireId);
    const existingByDraft = new Map(existing.map(d => [d.answerDraftId, d]));

    let created = 0;
    let updated = 0;
    const dependencyIds: string[] = [];

    for (const draft of params.drafts) {
      if (draft.status === 'SUPERSEDED') {
        const prior = existingByDraft.get(draft.id);
        if (prior && prior.status !== 'SUPERSEDED') {
          await this.port.saveAssuranceDependency({
            ...prior,
            status: 'SUPERSEDED',
            version: prior.version + 1,
            evaluatedAt: params.asOf,
            updatedAt: params.asOf
          });
          updated++;
        }
        continue;
      }

      const requirement = requirementByQuestion.get(draft.questionId);
      const approval = approvalByDraft.get(draft.id);
      const built = this.buildDependency({
        tenantId: params.tenantId,
        questionnaireId: params.questionnaireId,
        draft,
        requirement,
        approval,
        asOf: params.asOf,
        integrationIds: params.integrationIds,
        riskIds: params.riskIdsByQuestionId?.[draft.questionId],
        prior: existingByDraft.get(draft.id)
      });
      await this.port.saveAssuranceDependency(built);
      dependencyIds.push(built.id);
      if (existingByDraft.get(draft.id)) updated++;
      else created++;
    }

    return { created, updated, dependencyIds };
  }

  private buildDependency(params: {
    tenantId: string;
    questionnaireId: string;
    draft: AnswerDraft;
    requirement?: RequirementAnalysis;
    approval?: AnswerApproval;
    asOf: string;
    integrationIds?: string[];
    riskIds?: string[];
    prior?: AnswerAssuranceDependency;
  }): AnswerAssuranceDependency {
    const { draft, requirement, approval } = params;
    const citations: EvidenceCitation[] = draft.citations || [];

    const controlTestIds = unique(
      citations.filter(c => c.sourceType === 'CONTROL_TEST_RESULT').map(c => c.sourceId)
    );
    const policyIds = unique(
      citations
        .filter(c =>
          c.sourceType === 'APPROVED_POLICY' ||
          c.sourceType === 'APPROVED_PROCEDURE' ||
          c.sourceType === 'SECURITY_STANDARD'
        )
        .map(c => c.sourceId)
    );
    const evidenceReferenceIds = unique(
      citations.filter(c => !controlTestIds.includes(c.sourceId) && !policyIds.includes(c.sourceId)).map(c => c.sourceId)
    );
    const frameworkRequirementCodes = unique([
      ...(draft.frameworkReferences || []),
      ...((requirement?.frameworkMappings || []).map(m => m.requirementCode))
    ]);

    const sourceObservedAt =
      citations
        .map(c => c.collectedAt)
        .filter((v): v is string => Boolean(v))
        .sort(byIsoDesc)[0] || params.asOf;

    const lastVerifiedAt = approval?.approvedAt || draft.generatedAt;
    const prior = params.prior;
    const linkStatusChanged = !prior || prior.answerStatusAtLink !== draft.status;

    return {
      id: prior?.id || `ASD-${draft.id}`,
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      questionId: draft.questionId,
      answerDraftId: draft.id,
      answerStatusAtLink: draft.status,
      claimIds: unique(citations.map(c => c.citationId)),
      controlCodes: unique([...(draft.controlReferences || []), ...((requirement?.relevantControlCodes) || [])]),
      controlTestIds,
      evidenceReferenceIds,
      policyIds,
      frameworkRequirementCodes,
      integrationIds: unique(params.integrationIds || []),
      riskIds: unique(params.riskIds || []),
      approvalId: approval?.id,
      organizationalScope: draft.organizationalScope || [],
      requiredReviewerRole: draft.requiredReviewerRole || 'COMPLIANCE_MANAGER',
      lastKnownSourceState: prior?.lastKnownSourceState || this.deriveObservedState(citations),
      lastKnownSourceObservedAt: prior?.lastKnownSourceObservedAt || sourceObservedAt,
      sourceObservedAt,
      collectedAt: params.asOf,
      evaluatedAt: params.asOf,
      lastVerifiedAt,
      // Re-registering an answer that is already awaiting review must not clear
      // that state: only a fresh approval clears it.
      // Re-registering an answer that is still awaiting revalidation must not
      // clear that state: only a fresh approval (which sets the draft back to
      // IN_REVIEW / APPROVED) can do that.
      status:
        prior?.status === 'REVALIDATION_REQUIRED' && draft.status === 'REVALIDATION_REQUIRED'
          ? 'REVALIDATION_REQUIRED'
          : 'CURRENT',
      version: prior ? prior.version + (linkStatusChanged ? 1 : 0) : 1,
      createdAt: prior?.createdAt || params.asOf,
      updatedAt: params.asOf
    };
  }

  /** Baseline source state derived from the citation freshness SKANDA recorded. */
  private deriveObservedState(citations: EvidenceCitation[]): string {
    if (citations.length === 0) return 'UNKNOWN';
    if (citations.some(c => c.freshnessStatus === 'EXPIRED')) return 'EXPIRED';
    if (citations.some(c => c.freshnessStatus === 'STALE')) return 'STALE';
    if (citations.some(c => c.freshnessStatus === 'UNKNOWN')) return 'UNKNOWN';
    if (citations.some(c => c.freshnessStatus === 'DUE_SOON')) return 'DUE_SOON';
    return 'OK';
  }

  // -------------------------------------------------------------------------
  // 2. CHANGE INGESTION (event-driven)
  // -------------------------------------------------------------------------

  /**
   * Ingests an upstream change notification. Malformed input is REJECTED and
   * persisted as a rejected record (never silently discarded), a redelivered
   * notification is counted as a duplicate, and each impacted answer receives at
   * most one open revalidation.
   */
  public async ingestSourceChange(params: {
    tenantId: string;
    change: SourceChangeInput;
    actorEmail: string;
    actorRole: string;
    monitoringMode?: MonitoringMode;
    asOf?: string;
  }): Promise<RevalidationOutcome> {
    const asOf = params.asOf || this.clock();
    const receivedAt = asOf;
    const mode: MonitoringMode = params.monitoringMode || params.change.monitoringMode || 'EVENT_DRIVEN';
    const change = params.change;

    const idempotencyKey =
      change.idempotencyKey ||
      sha256(
        [
          params.tenantId,
          change.kind,
          change.sourceKind,
          change.sourceId,
          change.previousState || '',
          change.newState || '',
          change.sourceObservedAt || ''
        ].join('|')
      );

    const payloadDigest = sha256(
      JSON.stringify({
        kind: change.kind,
        sourceKind: change.sourceKind,
        sourceId: change.sourceId,
        resourceScope: change.resourceScope || [],
        previousState: change.previousState ?? null,
        newState: change.newState ?? null,
        detail: change.detail ?? null,
        sourceObservedAt: change.sourceObservedAt ?? null
      })
    );

    // ---- Duplicate suppression (before any revalidation work) -------------
    const existing = await this.port.getSourceChangeByKey(params.tenantId, idempotencyKey);
    if (existing) {
      const updated = await this.port.saveSourceChange({
        ...existing,
        duplicateAttempts: (existing.duplicateAttempts || 0) + 1,
        updatedAt: asOf
      });
      return {
        // A redelivery changes nothing: no new dependency impact, no new
        // revalidation, no duplicate notification.
        change: updated,
        duplicateSuppressed: true,
        revalidations: [],
        impactedAnswers: existing.impactedDependencyIds.length,
        notificationsSuppressed: existing.impactedDependencyIds.length
      };
    }

    // ---- Validation -------------------------------------------------------
    const validationError = this.validateChange(params.tenantId, change, asOf);
    const baseRecord: SourceChangeRecord = {
      id: `SCE-${sha256(`${params.tenantId}|${idempotencyKey}`).slice(0, 24)}`,
      tenantId: params.tenantId,
      monitoringMode: mode,
      kind: change.kind,
      sourceKind: change.sourceKind,
      sourceId: change.sourceId,
      resourceScope: change.resourceScope || [],
      previousState: change.previousState,
      newState: change.newState,
      detail: change.detail || '',
      observedBy: params.actorEmail,
      sourceObservedAt: change.sourceObservedAt || asOf,
      receivedAt,
      collectedAt: asOf,
      correlationId: change.correlationId || sha256(`${params.tenantId}|${receivedAt}`).slice(0, 16),
      idempotencyKey,
      payloadDigest,
      status: 'PENDING',
      attempts: 0,
      maxAttempts: this.maxAttempts,
      duplicateAttempts: 0,
      impactedDependencyIds: [],
      revalidationEventIds: [],
      createdAt: asOf,
      updatedAt: asOf
    };

    if (validationError) {
      const rejected = await this.port.saveSourceChange({
        ...baseRecord,
        status: 'REJECTED',
        lastError: validationError,
        processingLatencyMs: 0
      });
      return {
        change: rejected,
        duplicateSuppressed: false,
        revalidations: [],
        impactedAnswers: 0,
        notificationsSuppressed: 0
      };
    }

    // ---- Dependency matching ---------------------------------------------
    const dependencies = await this.port.listAssuranceDependencies(params.tenantId);
    const impacted = dependencies.filter(d => d.status !== 'SUPERSEDED' && this.dependsOn(d, change));

    if (impacted.length === 0) {
      const recorded = await this.port.saveSourceChange({
        ...baseRecord,
        status: 'NO_DEPENDENTS',
        processingLatencyMs: Math.max(0, Date.parse(asOf) - Date.parse(receivedAt))
      });
      return {
        change: recorded,
        duplicateSuppressed: false,
        revalidations: [],
        impactedAnswers: 0,
        notificationsSuppressed: 0
      };
    }

    // ---- Revalidation with bounded retries --------------------------------
    const revalidations: AnswerRevalidationEvent[] = [];
    const impactedDependencyIds: string[] = [];
    const revalidationEventIds: string[] = [];
    let attempts = 0;
    let lastError: string | undefined;

    for (const dependency of impacted) {
      let applied = false;
      for (let attempt = 1; attempt <= this.maxAttempts && !applied; attempt++) {
        attempts = Math.max(attempts, attempt);
        try {
          const outcome = await this.applyRevalidation({
            tenantId: params.tenantId,
            dependency,
            change,
            baseRecord,
            mode,
            asOf,
            actorEmail: params.actorEmail,
            actorRole: params.actorRole
          });
          revalidations.push(outcome.event);
          impactedDependencyIds.push(dependency.id);
          revalidationEventIds.push(outcome.event.id);
          applied = true;
        } catch (err: any) {
          lastError = err && err.message ? err.message : 'unknown revalidation failure';
          if (attempt < this.maxAttempts) {
            // Exponential backoff between bounded retries.
            await this.sleep(25 * Math.pow(2, attempt - 1));
          }
        }
      }
      if (!applied) {
        // Dead letter: the change is retained with the reason it could not be
        // applied, so it can be replayed deliberately after investigation.
        const dead = await this.port.saveSourceChange({
          ...baseRecord,
          status: 'DEAD_LETTER',
          attempts,
          lastError,
          impactedDependencyIds,
          revalidationEventIds,
          processingLatencyMs: Math.max(0, Date.parse(asOf) - Date.parse(receivedAt))
        });
        return {
          change: dead,
          duplicateSuppressed: false,
          revalidations,
          impactedAnswers: impactedDependencyIds.length,
          notificationsSuppressed: 0
        };
      }
    }

    const recorded = await this.port.saveSourceChange({
      ...baseRecord,
      status: 'PROCESSED',
      attempts,
      impactedDependencyIds,
      revalidationEventIds,
      processingLatencyMs: Math.max(0, Date.parse(asOf) - Date.parse(receivedAt))
    });

    return {
      change: recorded,
      duplicateSuppressed: false,
      revalidations,
      impactedAnswers: impactedDependencyIds.length,
      notificationsSuppressed: revalidations.filter(r => r.notificationSuppressed).length
    };
  }

  private validateChange(tenantId: string, change: SourceChangeInput, asOf: string): string | null {
    if (!tenantId) return 'Tenant identity is required to ingest a source change.';
    if (!change || typeof change !== 'object') return 'Change payload is missing or not an object.';
    if (!KNOWN_CHANGE_KINDS.includes(change.kind)) {
      return `Unknown change kind "${String(change.kind)}"; the event was not evaluated and no compliance state was changed.`;
    }
    if (!KNOWN_SOURCE_KINDS.includes(change.sourceKind)) {
      return `Unknown source kind "${String(change.sourceKind)}"; the event was not evaluated.`;
    }
    if (!change.sourceId || typeof change.sourceId !== 'string') {
      return 'sourceId is required: a change that cannot be tied to a specific source cannot be evaluated.';
    }
    if (change.resourceScope !== undefined && !Array.isArray(change.resourceScope)) {
      return 'resourceScope must be an array of scope identifiers when supplied.';
    }
    if (change.sourceObservedAt !== undefined) {
      const observed = parseIso(change.sourceObservedAt);
      if (observed === null) return `sourceObservedAt "${change.sourceObservedAt}" is not a valid ISO timestamp.`;
      const asOfMs = parseIso(asOf);
      if (asOfMs !== null && observed - asOfMs > MAX_OBSERVATION_SKEW_MS) {
        return 'sourceObservedAt is further in the future than the permitted clock skew; the observation is not trusted.';
      }
    }
    return null;
  }

  /**
   * Deterministic dependency matching. A change impacts an answer only when the
   * answer actually references the changed source — unrelated answers are left
   * untouched.
   */
  private dependsOn(dependency: AnswerAssuranceDependency, change: SourceChangeInput): boolean {
    switch (change.sourceKind) {
      case 'CONTROL':
        return dependency.controlCodes.includes(change.sourceId);
      case 'CONTROL_TEST':
        return dependency.controlTestIds.includes(change.sourceId);
      case 'EVIDENCE':
        return dependency.evidenceReferenceIds.includes(change.sourceId);
      case 'POLICY':
        return dependency.policyIds.includes(change.sourceId);
      case 'FRAMEWORK_REQUIREMENT':
        return dependency.frameworkRequirementCodes.includes(change.sourceId);
      case 'INTEGRATION':
        return dependency.integrationIds.includes(change.sourceId);
      case 'RISK_OR_EXCEPTION':
        return dependency.riskIds.includes(change.sourceId);
      case 'APPROVAL':
        return Boolean(dependency.approvalId) && dependency.approvalId === change.sourceId;
      case 'SCOPE': {
        // An empty scope on the notification means a tenant-wide scope change,
        // which affects every registered answer dependency.
        const scope = change.resourceScope || [];
        if (scope.length === 0) return true;
        return dependency.organizationalScope.some(s => scope.includes(s));
      }
      default:
        return false;
    }
  }

  private async applyRevalidation(params: {
    tenantId: string;
    dependency: AnswerAssuranceDependency;
    change: SourceChangeInput;
    baseRecord: SourceChangeRecord;
    mode: MonitoringMode;
    asOf: string;
    actorEmail: string;
    actorRole: string;
  }): Promise<{ event: AnswerRevalidationEvent; suppressed: boolean }> {
    const { dependency, change, asOf } = params;
    const draft = await this.port.getDraft(params.tenantId, dependency.answerDraftId);
    if (!draft) {
      throw new Error(`Answer draft ${dependency.answerDraftId} referenced by a dependency is no longer readable.`);
    }
    if (draft.status === 'SUPERSEDED') {
      throw new Error(`Answer draft ${draft.id} is superseded and cannot require revalidation.`);
    }

    // Repeat suppression: while the SAME condition is still unresolved on the
    // same answer, one open revalidation and one notification are enough — the
    // repeat is recorded as suppressed, not duplicated.
    //
    // Suppression stops as soon as the answer is no longer awaiting review: if a
    // reviewer re-verified the answer and the source has since failed again, that
    // is a RECURRENCE, not a repeat, and it must raise its own revalidation event
    // and notification. Suppressing it would leave a re-verified answer silently
    // supported by a source that has failed.
    const dedupeKey = this.notificationDedupeKey(params.tenantId, dependency, change);
    const existingEvent = await this.port.getRevalidationEventByKey(params.tenantId, dedupeKey);
    if (existingEvent && draft.status === 'REVALIDATION_REQUIRED') {
      const suppressed: AnswerRevalidationEvent = {
        ...existingEvent,
        notificationSuppressed: true,
        evaluatedAt: asOf,
        collectedAt: asOf
      };
      await this.port.saveRevalidationEvent(suppressed);
      if (dependency.status !== 'REVALIDATION_REQUIRED') {
        await this.port.saveAssuranceDependency({
          ...dependency,
          status: 'REVALIDATION_REQUIRED',
          version: dependency.version + 1,
          evaluatedAt: asOf,
          updatedAt: asOf
        });
      }
      return { event: suppressed, suppressed: true };
    }

    const approval = await this.port.getApprovalForDraft(params.tenantId, dependency.answerDraftId);
    const preservedApprovedText = draft.customerFacingResponse || '';
    const assuranceState: 'STALE' | 'UNKNOWN' =
      change.sourceKind === 'INTEGRATION' ||
      change.kind === 'CONNECTOR_UNHEALTHY' ||
      change.kind === 'INTEGRATION_DISCONNECTED' ||
      change.kind === 'APPROVAL_EXPIRED'
        ? 'UNKNOWN'
        : 'STALE';

    const whatChanged = unique([
      change.previousState && change.newState
        ? `${change.sourceKind} ${change.sourceId}: ${change.previousState} -> ${change.newState}`
        : `${change.sourceKind} ${change.sourceId} changed (${change.kind})`,
      change.detail || ''
    ]);

    const impactedClaims: ImpactedClaimSummary[] = (draft.citations || [])
      .filter(c => c.sourceId === change.sourceId)
      .map(c => ({
        claimId: c.citationId,
        claimText: c.excerpt ? c.excerpt.slice(0, 280) : c.sourceTitle,
        impact: 'DIRECT' as const,
        reason: `Cited source ${c.sourceId} (${c.sourceType}) changed.`
      }));

    const event: AnswerRevalidationEvent = {
      id: `ARE-${sha256(`${dependency.id}|${params.baseRecord.id}`).slice(0, 24)}`,
      tenantId: params.tenantId,
      questionnaireId: dependency.questionnaireId,
      questionId: dependency.questionId,
      answerDraftId: draft.id,
      dependencyId: dependency.id,
      sourceChangeId: params.baseRecord.id,
      triggerKind: change.kind,
      monitoringMode: params.mode,
      triggerSourceKind: change.sourceKind,
      triggerSourceId: change.sourceId,
      reason: `Answer relies on ${change.sourceKind} ${change.sourceId}, which changed. The previous response can no longer be asserted as verified.`,
      whatChanged,
      assuranceState,
      // The wording is preserved; the answer simply stops being an approved claim.
      previousStatus: draft.status,
      newStatus: 'REVALIDATION_REQUIRED',
      previousAnswerVersion: draft.version,
      newAnswerVersion: draft.version,
      preservedApprovedText,
      approvedTextPreserved: true,
      previousApprovalId: approval?.id,
      approvalInvalidated: Boolean(approval),
      impactedClaims,
      requiredReviewerRole: dependency.requiredReviewerRole,
      routedToRoles: unique([dependency.requiredReviewerRole]),
      sourceObservedAt: change.sourceObservedAt || params.baseRecord.sourceObservedAt,
      collectedAt: asOf,
      evaluatedAt: asOf,
      lastVerifiedAt: dependency.lastVerifiedAt,
      notificationDedupeKey: dedupeKey,
      notificationSuppressed: false,
      createdAt: asOf
    };

    // ---- Draft: preserve wording, stop asserting an approved claim --------
    const updatedDraft = await this.port.updateDraft(params.tenantId, draft.id, {
      status: 'REVALIDATION_REQUIRED',
      previousResponse: preservedApprovedText,
      previousStatus: draft.status,
      suggestedNextAction:
        'Revalidate this answer: the underlying source changed. A reviewer must confirm the current facts and re-approve before export.'
    });
    event.newAnswerVersion = updatedDraft.version;

    // ---- Governed answer library: block reuse until revalidated -----------
    const libraryEntry = await this.findAffectedLibraryEntry(params.tenantId, dependency, change, preservedApprovedText);
    if (libraryEntry) {
      event.libraryEntryId = libraryEntry.id;
      event.libraryEntryStatus = 'PENDING_REVALIDATION';
      await this.port.saveLibraryEntry({
        ...libraryEntry,
        approvalStatus: 'PENDING_REVALIDATION',
        version: libraryEntry.version + 1,
        versionHistory: [
          ...libraryEntry.versionHistory,
          {
            version: libraryEntry.version + 1,
            approvedAnswer: libraryEntry.approvedAnswer,
            changedBy: params.actorEmail,
            changedAt: asOf,
            reason: `Revalidation triggered by ${change.kind} on ${change.sourceKind} ${change.sourceId}. Approved text preserved; reuse is blocked until re-approval.`
          }
        ]
      });
    }

    // ---- Dependency + event persistence -----------------------------------
    await this.port.saveAssuranceDependency({
      ...dependency,
      status: 'REVALIDATION_REQUIRED',
      lastKnownSourceState: change.newState || change.kind,
      lastKnownSourceObservedAt: change.sourceObservedAt || params.baseRecord.sourceObservedAt,
      evaluatedAt: asOf,
      collectedAt: asOf,
      version: dependency.version + 1,
      updatedAt: asOf
    });
    await this.port.saveRevalidationEvent(event);

    await this.port.appendAuditEvent({
      id: `AUD-REV-${event.id}`,
      tenantId: params.tenantId,
      questionnaireId: dependency.questionnaireId,
      action: 'ANSWER_REVALIDATION_REQUESTED',
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      entityType: 'ANSWER',
      entityId: draft.id,
      summary: `Revalidation required for answer ${draft.id}: ${event.reason}`,
      details: {
        triggerKind: change.kind,
        triggerSourceKind: change.sourceKind,
        triggerSourceId: change.sourceId,
        monitoringMode: params.mode,
        assuranceState,
        approvedTextPreserved: true,
        requiredReviewerRole: dependency.requiredReviewerRole
      },
      at: asOf
    });

    return { event, suppressed: false };
  }

  private notificationDedupeKey(
    tenantId: string,
    dependency: AnswerAssuranceDependency,
    change: SourceChangeInput
  ): string {
    return [
      'REV',
      tenantId,
      dependency.answerDraftId,
      change.sourceKind,
      change.sourceId,
      change.newState || change.kind
    ].join('|');
  }

  /** Finds the governed library entry that a revalidation must also block. */
  private async findAffectedLibraryEntry(
    tenantId: string,
    dependency: AnswerAssuranceDependency,
    change: SourceChangeInput,
    preservedApprovedText: string
  ): Promise<GovernedAnswerLibraryEntry | null> {
    const entries = await this.port.listLibraryEntries(tenantId);
    const candidates = entries.filter(entry => entry.approvalStatus === 'APPROVED');
    const byExactText = candidates.find(
      entry => preservedApprovedText && entry.approvedAnswer === preservedApprovedText
    );
    if (byExactText) return byExactText;
    return (
      candidates.find(entry => {
        if (change.sourceKind === 'CONTROL') return entry.controlReferences.includes(change.sourceId);
        if (change.sourceKind === 'EVIDENCE') return entry.evidenceReferenceIds.includes(change.sourceId);
        if (change.sourceKind === 'POLICY') return entry.controlReferences.includes(change.sourceId);
        if (change.sourceKind === 'FRAMEWORK_REQUIREMENT') return entry.frameworkMappings.includes(change.sourceId);
        return (
          entry.controlReferences.some(c => dependency.controlCodes.includes(c)) &&
          entry.evidenceReferenceIds.some(e => dependency.evidenceReferenceIds.includes(e))
        );
      }) || null
    );
  }

  // -------------------------------------------------------------------------
  // 3. RECONCILIATION (scheduled polling / manual refresh)
  // -------------------------------------------------------------------------

  /**
   * Periodic reconciliation: compares SKANDA's recorded source state with a
   * freshly observed provider state and raises the same revalidation flow for
   * anything that diverged. This recovers missed events and outages; it is
   * explicitly reconciliation, not instantaneous event delivery.
   */
  public async reconcile(params: {
    tenantId: string;
    sourceStates: UpstreamSourceState[];
    monitoringMode: MonitoringMode;
    actorEmail: string;
    actorRole: string;
    questionnaireId?: string;
    asOf?: string;
  }): Promise<ReconciliationResult> {
    const asOf = params.asOf || this.clock();
    if (params.monitoringMode === 'EVENT_DRIVEN') {
      throw Object.assign(
        new Error('Reconciliation must run as SCHEDULED_POLLING or MANUAL_REFRESH; event delivery is not reconciliation.'),
        { statusCode: 422, code: 'INVALID_MONITORING_MODE' }
      );
    }

    const dependencies = await this.port.listAssuranceDependencies(params.tenantId, params.questionnaireId);
    const live = dependencies.filter(d => d.status !== 'SUPERSEDED');
    const changes: RevalidationOutcome[] = [];
    const unobservedDependencies: string[] = [];
    let revalidationsRaised = 0;

    for (const dependency of live) {
      const observation = this.observationFor(dependency, params.sourceStates);
      if (!observation) {
        // Nothing was observed. That is a monitoring gap, not a healthy state:
        // it is reported and never converted into "verified".
        unobservedDependencies.push(dependency.id);
        continue;
      }
      const kind = this.changeKindFor(observation, dependency);
      if (!kind) continue;

      const outcome = await this.ingestSourceChange({
        tenantId: params.tenantId,
        change: {
          kind,
          sourceKind: observation.sourceKind,
          sourceId: observation.sourceId,
          resourceScope: observation.resourceScope || [],
          previousState: dependency.lastKnownSourceState,
          newState: observation.state,
          detail: observation.detail || `Reconciliation observed ${observation.state} at ${observation.observedAt}.`,
          sourceObservedAt: observation.observedAt,
          monitoringMode: params.monitoringMode
        },
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        monitoringMode: params.monitoringMode,
        asOf
      });
      changes.push(outcome);
      revalidationsRaised += outcome.revalidations.length;
    }

    return {
      polled: live.length,
      changes,
      unobservedDependencies,
      revalidationsRaised
    };
  }

  private observationFor(
    dependency: AnswerAssuranceDependency,
    observations: UpstreamSourceState[]
  ): UpstreamSourceState | null {
    const ordered: Array<{ kind: AssuranceSourceKind; ids: string[] }> = [
      { kind: 'CONTROL', ids: dependency.controlCodes },
      { kind: 'CONTROL_TEST', ids: dependency.controlTestIds },
      { kind: 'EVIDENCE', ids: dependency.evidenceReferenceIds },
      { kind: 'POLICY', ids: dependency.policyIds },
      { kind: 'FRAMEWORK_REQUIREMENT', ids: dependency.frameworkRequirementCodes },
      { kind: 'INTEGRATION', ids: dependency.integrationIds }
    ];
    for (const entry of ordered) {
      if (entry.ids.length === 0) continue;
      const match = observations.find(
        o => o.sourceKind === entry.kind && entry.ids.includes(o.sourceId)
      );
      if (match) return match;
    }
    return null;
  }

  /** Maps an observed provider state onto a canonical change kind. */
  private changeKindFor(observation: UpstreamSourceState, dependency: AnswerAssuranceDependency): SourceChangeKind | null {
    const previous = (dependency.lastKnownSourceState || '').toUpperCase();
    const current = observation.state;
    if (previous === current) return null;
    switch (current) {
      case 'FAILED':
        return 'CONTROL_TEST_FAILED';
      case 'EXPIRED':
        return 'EVIDENCE_EXPIRED';
      case 'UNHEALTHY':
        return 'CONNECTOR_UNHEALTHY';
      case 'DISCONNECTED':
        return 'INTEGRATION_DISCONNECTED';
      case 'SUPERSEDED':
        return observation.sourceKind === 'POLICY' ? 'POLICY_SUPERSEDED' : 'EVIDENCE_SUPERSEDED';
      case 'CHANGED':
        return observation.sourceKind === 'FRAMEWORK_REQUIREMENT'
          ? 'FRAMEWORK_REQUIREMENT_CHANGED'
          : 'CONTROL_STATE_CHANGED';
      case 'OK':
        // Recovery does NOT silently restore the previous approval: it raises a
        // revalidation so a human re-verifies the answer.
        return previous === 'OK' || previous === '' ? null : 'CONTROL_STATE_CHANGED';
      default:
        return null;
    }
  }

  // -------------------------------------------------------------------------
  // 4. REPLAY OF A STORED CHANGE
  // -------------------------------------------------------------------------

  /**
   * Deliberate replay of a stored (typically dead-lettered) change. Replaying
   * updates existing revalidation records instead of creating duplicates.
   */
  public async replaySourceChange(params: {
    tenantId: string;
    changeId: string;
    actorEmail: string;
    actorRole: string;
    asOf?: string;
  }): Promise<RevalidationOutcome> {
    const asOf = params.asOf || this.clock();
    const record = await this.port.getSourceChangeById(params.tenantId, params.changeId);
    if (!record) {
      throw Object.assign(new Error('Source change not found for this tenant.'), { statusCode: 404, code: 'CHANGE_NOT_FOUND' });
    }
    if (record.status === 'REJECTED') {
      throw Object.assign(
        new Error(`A rejected change cannot be replayed: ${record.lastError || 'the payload was invalid'}.`),
        { statusCode: 422, code: 'CHANGE_NOT_REPLAYABLE' }
      );
    }

    const outcome = await this.ingestSourceChange({
      tenantId: params.tenantId,
      change: {
        kind: record.kind,
        sourceKind: record.sourceKind,
        sourceId: record.sourceId,
        resourceScope: record.resourceScope,
        previousState: record.previousState,
        newState: record.newState,
        detail: record.detail,
        sourceObservedAt: record.sourceObservedAt,
        // Reuse the original key: replaying one change must not become a second change.
        idempotencyKey: record.idempotencyKey,
        monitoringMode: record.monitoringMode
      },
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      monitoringMode: record.monitoringMode,
      asOf
    });

    await this.port.appendAuditEvent({
      id: `AUD-REPLAY-${record.id}-${Date.parse(asOf)}`,
      tenantId: params.tenantId,
      // A source change can span questionnaires; when it touched none, the audit
      // entry is recorded under the tenant scope marker rather than being dropped.
      questionnaireId: outcome.revalidations[0]?.questionnaireId || 'TENANT_SCOPE',
      action: 'SOURCE_CHANGE_REPLAYED',
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      entityType: 'JOB',
      entityId: record.id,
      summary: `Source change ${record.id} replayed (previous status ${record.status}).`,
      details: { previousStatus: record.status, duplicateSuppressed: outcome.duplicateSuppressed },
      at: asOf
    });

    return outcome;
  }

  // -------------------------------------------------------------------------
  // 5. REVIEW QUEUE & METRICS
  // -------------------------------------------------------------------------

  /** Reviewer-facing queue of answers awaiting revalidation. */
  public async revalidationQueue(params: {
    tenantId: string;
    questionnaireId?: string;
    asOf: string;
  }): Promise<RevalidationQueueItem[]> {
    const events = await this.port.listRevalidationEvents(params.tenantId, params.questionnaireId);
    const dependencies = await this.port.listAssuranceDependencies(params.tenantId, params.questionnaireId);
    const dependencyById = new Map(dependencies.map(d => [d.id, d]));
    const asOfMs = Date.parse(params.asOf);
    const items: RevalidationQueueItem[] = [];

    for (const event of events) {
      const draft = await this.port.getDraft(params.tenantId, event.answerDraftId);
      // Only answers that are still awaiting review remain in the queue.
      if (!draft || draft.status !== 'REVALIDATION_REQUIRED') continue;
      const dependency = dependencyById.get(event.dependencyId);
      items.push({
        revalidationEventId: event.id,
        questionnaireId: event.questionnaireId,
        questionId: event.questionId,
        answerDraftId: event.answerDraftId,
        answerStatus: draft.status,
        triggerKind: event.triggerKind,
        monitoringMode: event.monitoringMode,
        triggerSourceKind: event.triggerSourceKind,
        triggerSourceId: event.triggerSourceId,
        reason: event.reason,
        whatChanged: event.whatChanged,
        assuranceState: event.assuranceState,
        requiredReviewerRole: event.requiredReviewerRole,
        approvedTextPreserved: event.approvedTextPreserved,
        sourceObservedAt: event.sourceObservedAt,
        collectedAt: event.collectedAt,
        evaluatedAt: event.evaluatedAt,
        lastVerifiedAt: event.lastVerifiedAt,
        ageMs: Number.isNaN(asOfMs) ? 0 : Math.max(0, asOfMs - Date.parse(event.createdAt))
      });
    }

    return items.sort((a, b) => b.ageMs - a.ageMs);
  }

  /** Tenant-wide dependency graph view. */
  public async listDependencies(params: {
    tenantId: string;
    questionnaireId?: string;
  }): Promise<AnswerAssuranceDependency[]> {
    return this.port.listAssuranceDependencies(params.tenantId, params.questionnaireId);
  }

  /** Change inbox view (most recent first). */
  public async listSourceChanges(params: {
    tenantId: string;
    limit?: number;
  }): Promise<SourceChangeRecord[]> {
    return this.port.listSourceChanges(params.tenantId, { limit: params.limit });
  }
}

export function createContinuousAssuranceService(
  port: AssurancePersistencePort,
  options?: ContinuousAssuranceOptions
): ContinuousAssuranceRevalidationService {
  return new ContinuousAssuranceRevalidationService(port, options);
}
