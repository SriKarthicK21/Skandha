// ============================================================================
// SKANDA SECURITY QUESTIONNAIRE INTELLIGENCE: API ROUTES
// Path: server/questionnaireIntelligenceRoutes.ts
//
// Mounted at /api/v1/questionnaires and /api/questionnaires.
//
// Every data route requires a cryptographically verified Bearer token
// (authenticateTenant), and the tenant identity used for every repository and
// retrieval call is taken from verified token claims — never from the request
// body, query string or a client-supplied header.
//
// Approval and export are additionally gated by granular permissions enforced on
// the server; the client cannot promote an answer to APPROVED by sending a flag.
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authenticateTenant, signJwtToken, getDefaultPermissionsForRole } from './middleware/authMiddleware.js';
import { requirePermission } from './middleware/rbacMiddleware.js';
import {
  getQuestionnaireIntelligenceService,
  ServiceActor,
  WorkflowPolicy
} from './services/QuestionnaireIntelligenceService.js';
import { AnswerStatus, ReviewAction, QuestionnaireGap } from '../src/types/questionnaireIntelligenceTypes.js';
import { MAX_QUESTIONNAIRE_FILE_BYTES } from '../src/services/questionnaire/questionnaireArtifactStore.js';
import { enterpriseAuditService } from './services/EnterpriseAuditService.js';

export const questionnaireIntelligenceRouter = Router();

function actorFrom(req: Request): ServiceActor {
  const context = req.tenantContext;
  if (!context) {
    throw Object.assign(new Error('Unauthenticated request.'), { statusCode: 401, code: 'UNAUTHENTICATED' });
  }
  return {
    email: context.email,
    role: context.role,
    permissions: context.permissions || getDefaultPermissionsForRole(context.role),
    isPlatformAdmin: Boolean(context.isPlatformAdmin)
  };
}

/** Uniform error responder; never leaks stack traces to the client. */
function respondError(res: Response, err: any): void {
  const statusCode = err && typeof err.statusCode === 'number' ? err.statusCode : 500;
  const payload: Record<string, any> = {
    success: false,
    error: err && err.message ? err.message : 'Unexpected error',
    code: err && err.code ? err.code : 'INTERNAL_ERROR'
  };
  if (err && err.preflight) payload.preflight = err.preflight;
  res.status(statusCode).json(payload);
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      await handler(req, res);
    } catch (err: any) {
      respondError(res, err);
    }
  };
}

// ============================================================================
// DEVELOPMENT SESSION TOKEN (NEVER AVAILABLE IN PRODUCTION)
// ============================================================================
/**
 * The repository's existing UI has no token-issuing endpoint, so the browser
 * client could not otherwise call an authenticated route. This endpoint issues a
 * short-lived signed token for the local development/demo environment ONLY, it
 * refuses to run when NODE_ENV=production, and it mirrors the existing
 * `x-skanda-dev-test` convention in authMiddleware.
 *
 * In production the platform identity provider (or SSO/SCIM federation) must
 * issue the token; the questionnaire routes then enforce it unchanged.
 */
questionnaireIntelligenceRouter.post('/dev/session-token', (req: Request, res: Response) => {
  if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
    res.status(404).json({ success: false, error: 'Not found', code: 'NOT_FOUND' });
    return;
  }

  const { email, role, tenantId } = req.body || {};
  if (!email || !role || !tenantId) {
    res.status(422).json({
      success: false,
      error: 'email, role and tenantId are required to mint a development session token.',
      code: 'INVALID_REQUEST'
    });
    return;
  }

  const token = signJwtToken(
    {
      userId: String(email),
      email: String(email),
      tenantId: String(tenantId),
      orgId: 'org_primary',
      role: String(role),
      permissions: getDefaultPermissionsForRole(String(role))
    },
    3600
  );

  res.json({
    success: true,
    data: {
      token,
      tokenType: 'Bearer',
      expiresInSeconds: 3600,
      tenantId: String(tenantId),
      role: String(role),
      permissions: getDefaultPermissionsForRole(String(role)),
      environment: 'DEVELOPMENT'
    }
  });
});

// All routes below require a verified bearer token.
questionnaireIntelligenceRouter.use(authenticateTenant);

// ============================================================================
// HEALTH
// ============================================================================
questionnaireIntelligenceRouter.get(
  '/health',
  asyncRoute(async (req, res) => {
    const service = getQuestionnaireIntelligenceService();
    const health = await service.health();
    res.json({ success: true, data: { ...health, tenantId: req.tenantContext!.tenantId } });
  })
);

// ============================================================================
// GOVERNED ANSWER LIBRARY (declared before /:id so the static path wins)
// ============================================================================
questionnaireIntelligenceRouter.get(
  '/library/entries',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const entries = await getQuestionnaireIntelligenceService().listLibrary(req.tenantContext!.tenantId);
    res.json({ success: true, count: entries.length, data: entries });
  })
);

questionnaireIntelligenceRouter.post(
  '/library/from-draft',
  requirePermission('questionnaire.library.manage'),
  asyncRoute(async (req, res) => {
    const entry = await getQuestionnaireIntelligenceService().approveIntoLibrary({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      draftId: String(req.body.draftId || ''),
      productOrServiceScope: req.body.productOrServiceScope,
      businessUnit: req.body.businessUnit,
      reviewDueAt: String(req.body.reviewDueAt || new Date(Date.now() + 365 * 86400000).toISOString()),
      reason: req.body.reason
    });
    res.status(201).json({ success: true, data: entry });
  })
);

questionnaireIntelligenceRouter.post(
  '/library/:entryId/revalidate',
  requirePermission('questionnaire.library.manage'),
  asyncRoute(async (req, res) => {
    const entry = await getQuestionnaireIntelligenceService().revalidateLibraryEntry({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      entryId: String(req.params.entryId),
      reason: String(req.body.reason || 'Revalidation requested by reviewer.')
    });
    res.json({ success: true, data: entry });
  })
);

// ============================================================================
// TRUST CENTER DISCLOSURES
// ============================================================================
questionnaireIntelligenceRouter.get(
  '/disclosures/published',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const disclosures = await getQuestionnaireIntelligenceService().listPublishedDisclosures(req.tenantContext!.tenantId);
    res.json({ success: true, count: disclosures.length, data: disclosures });
  })
);

questionnaireIntelligenceRouter.get(
  '/disclosures',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const disclosures = await getQuestionnaireIntelligenceService().listDisclosures(req.tenantContext!.tenantId);
    res.json({ success: true, count: disclosures.length, data: disclosures });
  })
);

questionnaireIntelligenceRouter.post(
  '/disclosures',
  requirePermission('questionnaire.disclose'),
  asyncRoute(async (req, res) => {
    const disclosure = await getQuestionnaireIntelligenceService().proposeDisclosure({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      draftId: req.body.draftId ? String(req.body.draftId) : undefined,
      title: String(req.body.title || ''),
      category: req.body.category,
      publicContent: req.body.publicContent,
      internalSourceIds: req.body.internalSourceIds,
      expiresAt: req.body.expiresAt
    });
    res.status(201).json({
      success: true,
      data: disclosure,
      note: 'Disclosure created in PENDING_AUTHORIZATION. It is not published until an authorized user explicitly authorizes it.'
    });
  })
);

questionnaireIntelligenceRouter.post(
  '/disclosures/:disclosureId/authorize',
  requirePermission('questionnaire.disclose'),
  asyncRoute(async (req, res) => {
    const disclosure = await getQuestionnaireIntelligenceService().authorizeDisclosure({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      disclosureId: String(req.params.disclosureId),
      expiresAt: req.body.expiresAt
    });
    res.json({ success: true, data: disclosure });
  })
);

questionnaireIntelligenceRouter.post(
  '/disclosures/:disclosureId/withdraw',
  requirePermission('questionnaire.disclose'),
  asyncRoute(async (req, res) => {
    const disclosure = await getQuestionnaireIntelligenceService().withdrawDisclosure({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      disclosureId: String(req.params.disclosureId),
      reason: String(req.body.reason || 'Withdrawn by the disclosure owner.')
    });
    res.json({ success: true, data: disclosure });
  })
);

// ============================================================================
// APPROVED ORGANIZATIONAL FACTS
// ============================================================================
questionnaireIntelligenceRouter.get(
  '/org-facts',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const facts = await getQuestionnaireIntelligenceService().listOrgFacts(req.tenantContext!.tenantId);
    res.json({ success: true, count: facts.length, data: facts });
  })
);

questionnaireIntelligenceRouter.post(
  '/org-facts',
  requirePermission('questionnaire.orgfacts.manage'),
  asyncRoute(async (req, res) => {
    const fact = await getQuestionnaireIntelligenceService().saveOrgFact({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      fact: {
        id: req.body.id,
        title: String(req.body.title || ''),
        statement: String(req.body.statement || ''),
        value: req.body.value,
        category: String(req.body.category || 'GENERAL'),
        expiresAt: req.body.expiresAt,
        affectsClaimCode: req.body.affectsClaimCode,
        controlCode: req.body.controlCode,
        organizationalScope: req.body.organizationalScope || []
      }
    });
    res.status(201).json({ success: true, data: fact });
  })
);

questionnaireIntelligenceRouter.delete(
  '/org-facts/:factId',
  requirePermission('questionnaire.orgfacts.manage'),
  asyncRoute(async (req, res) => {
    const deleted = await getQuestionnaireIntelligenceService().deleteOrgFact(
      req.tenantContext!.tenantId,
      actorFrom(req),
      String(req.params.factId)
    );
    res.json({ success: true, deleted });
  })
);

// ============================================================================
// DRAFTS (stateless draft-scoped operations)
// ============================================================================
questionnaireIntelligenceRouter.patch(
  '/drafts/:draftId',
  requirePermission('questionnaire.review'),
  asyncRoute(async (req, res) => {
    const draft = await getQuestionnaireIntelligenceService().editDraft({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      draftId: String(req.params.draftId),
      customerFacingResponse: req.body.customerFacingResponse,
      internalExplanation: req.body.internalExplanation
    });
    res.json({ success: true, data: draft });
  })
);

questionnaireIntelligenceRouter.post(
  '/drafts/:draftId/review',
  requirePermission('questionnaire.review'),
  asyncRoute(async (req, res) => {
    const action = String(req.body.action || '') as ReviewAction;
    const allowedActions: ReviewAction[] = [
      'SUBMIT_FOR_REVIEW',
      'APPROVE',
      'REJECT',
      'REQUEST_CHANGES',
      'REQUEST_INFORMATION',
      'REASSIGN',
      'SUPERSEDE'
    ];
    if (!allowedActions.includes(action)) {
      res.status(422).json({ success: false, error: `Unsupported review action "${action}".`, code: 'INVALID_ACTION' });
      return;
    }

    const result = await getQuestionnaireIntelligenceService().reviewAction({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      draftId: String(req.params.draftId),
      action,
      comment: req.body.comment,
      assignedToRole: req.body.assignedToRole,
      assignedToEmail: req.body.assignedToEmail,
      selfApprovalJustification: req.body.selfApprovalJustification,
      organizationalScope: req.body.organizationalScope,
      approvalExpiresAt: req.body.approvalExpiresAt
    });
    res.json({ success: true, data: result });
  })
);

questionnaireIntelligenceRouter.get(
  '/drafts/:draftId/explain',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const result = await getQuestionnaireIntelligenceService().explainDraft(
      req.tenantContext!.tenantId,
      String(req.params.draftId)
    );
    res.json({ success: true, data: result });
  })
);

// ============================================================================
// GAPS
// ============================================================================
questionnaireIntelligenceRouter.patch(
  '/gaps/:gapId',
  requirePermission('questionnaire.review'),
  asyncRoute(async (req, res) => {
    const status = String(req.body.status || '') as QuestionnaireGap['status'];
    const allowed: QuestionnaireGap['status'][] = ['OPEN', 'OWNER_NOTIFIED', 'RESOLVED', 'ACCEPTED_RISK'];
    if (!allowed.includes(status)) {
      res.status(422).json({ success: false, error: `Unsupported gap status "${status}".`, code: 'INVALID_STATUS' });
      return;
    }
    const gap = await getQuestionnaireIntelligenceService().updateGapStatus({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      gapId: String(req.params.gapId),
      status
    });
    res.json({ success: true, data: gap });
  })
);

// ============================================================================
// CONTINUOUS ASSURANCE & REVALIDATION
// Declared before the dynamic `/:questionnaireId` routes so the static paths win.
// Ingestion and replay require a reviewer permission: they decide whether a
// customer-facing assurance claim may still be made.
// ============================================================================
questionnaireIntelligenceRouter.get(
  '/assurance/dependencies',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const dependencies = await getQuestionnaireIntelligenceService().assuranceDependencies({
      tenantId: req.tenantContext!.tenantId,
      questionnaireId: req.query.questionnaireId ? String(req.query.questionnaireId) : undefined
    });
    res.json({ success: true, count: dependencies.length, data: dependencies });
  })
);

questionnaireIntelligenceRouter.get(
  '/assurance/revalidation-queue',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const queue = await getQuestionnaireIntelligenceService().assuranceRevalidationQueue({
      tenantId: req.tenantContext!.tenantId,
      questionnaireId: req.query.questionnaireId ? String(req.query.questionnaireId) : undefined
    });
    res.json({ success: true, count: queue.length, data: queue });
  })
);

questionnaireIntelligenceRouter.get(
  '/assurance/changes',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const changes = await getQuestionnaireIntelligenceService().assuranceSourceChanges({
      tenantId: req.tenantContext!.tenantId,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    });
    res.json({ success: true, count: changes.length, data: changes });
  })
);

/**
 * Event-driven ingestion of an upstream monitoring change. The tenant is taken
 * from verified token claims; a tenant id in the body is ignored.
 */
questionnaireIntelligenceRouter.post(
  '/assurance/source-change',
  requirePermission('questionnaire.review'),
  asyncRoute(async (req, res) => {
    const outcome = await getQuestionnaireIntelligenceService().ingestAssuranceSourceChange({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      change: {
        kind: req.body.kind,
        sourceKind: req.body.sourceKind,
        sourceId: req.body.sourceId !== undefined ? String(req.body.sourceId) : '',
        resourceScope: Array.isArray(req.body.resourceScope) ? req.body.resourceScope.map(String) : undefined,
        previousState: req.body.previousState !== undefined ? String(req.body.previousState) : undefined,
        newState: req.body.newState !== undefined ? String(req.body.newState) : undefined,
        detail: req.body.detail !== undefined ? String(req.body.detail) : undefined,
        sourceObservedAt: req.body.sourceObservedAt !== undefined ? String(req.body.sourceObservedAt) : undefined,
        correlationId: req.body.correlationId !== undefined ? String(req.body.correlationId) : undefined,
        idempotencyKey: req.body.idempotencyKey !== undefined ? String(req.body.idempotencyKey) : undefined,
        monitoringMode: 'EVENT_DRIVEN'
      }
    });

    // 422 for a change that could not be trusted: it was recorded, not applied.
    const status = outcome.change.status === 'REJECTED' ? 422 : outcome.change.status === 'DEAD_LETTER' ? 500 : 202;
    res.status(status).json({
      success: outcome.change.status !== 'REJECTED' && outcome.change.status !== 'DEAD_LETTER',
      data: {
        changeId: outcome.change.id,
        changeStatus: outcome.change.status,
        duplicateSuppressed: outcome.duplicateSuppressed,
        impactedAnswers: outcome.impactedAnswers,
        notificationsSuppressed: outcome.notificationsSuppressed,
        revalidations: outcome.revalidations,
        lastError: outcome.change.lastError
      }
    });
  })
);

questionnaireIntelligenceRouter.post(
  '/assurance/source-change/:changeId/replay',
  requirePermission('questionnaire.review'),
  asyncRoute(async (req, res) => {
    const outcome = await getQuestionnaireIntelligenceService().replayAssuranceSourceChange({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      changeId: String(req.params.changeId)
    });
    res.json({
      success: true,
      data: {
        changeId: outcome.change.id,
        changeStatus: outcome.change.status,
        duplicateSuppressed: outcome.duplicateSuppressed,
        impactedAnswers: outcome.impactedAnswers,
        revalidations: outcome.revalidations.length
      }
    });
  })
);

/**
 * Periodic reconciliation (scheduled polling or manual refresh). The caller
 * supplies the provider observations it read; anything it could not read is
 * reported back as unobserved rather than assumed healthy.
 */
questionnaireIntelligenceRouter.post(
  '/assurance/reconcile',
  requirePermission('questionnaire.review'),
  asyncRoute(async (req, res) => {
    const mode = String(req.body.monitoringMode || 'MANUAL_REFRESH').toUpperCase();
    if (mode !== 'SCHEDULED_POLLING' && mode !== 'MANUAL_REFRESH') {
      res.status(422).json({
        success: false,
        error: 'monitoringMode must be SCHEDULED_POLLING or MANUAL_REFRESH; event delivery is not reconciliation.',
        code: 'INVALID_MONITORING_MODE'
      });
      return;
    }
    if (!Array.isArray(req.body.sourceStates)) {
      res.status(422).json({
        success: false,
        error: 'sourceStates must be an array of { sourceKind, sourceId, state, observedAt } observations.',
        code: 'INVALID_REQUEST'
      });
      return;
    }

    const result = await getQuestionnaireIntelligenceService().reconcileAssurance({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      monitoringMode: mode,
      questionnaireId: req.body.questionnaireId ? String(req.body.questionnaireId) : undefined,
      sourceStates: req.body.sourceStates.map((s: any) => ({
        sourceKind: s.sourceKind,
        sourceId: String(s.sourceId || ''),
        state: s.state,
        observedAt: String(s.observedAt || ''),
        detail: s.detail ? String(s.detail) : undefined,
        resourceScope: Array.isArray(s.resourceScope) ? s.resourceScope.map(String) : undefined
      }))
    });

    res.json({
      success: true,
      data: {
        monitoringMode: mode,
        polled: result.polled,
        revalidationsRaised: result.revalidationsRaised,
        unobservedDependencies: result.unobservedDependencies,
        unobservedCount: result.unobservedDependencies.length,
        changes: result.changes.map(c => ({
          changeId: c.change.id,
          changeStatus: c.change.status,
          kind: c.change.kind,
          sourceId: c.change.sourceId,
          impactedAnswers: c.impactedAnswers,
          duplicateSuppressed: c.duplicateSuppressed
        }))
      }
    });
  })
);

/** Operational metrics derived from stored records (never from the client). */
questionnaireIntelligenceRouter.get(
  '/assurance/metrics',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const metrics = await getQuestionnaireIntelligenceService().assuranceMetrics({
      tenantId: req.tenantContext!.tenantId
    });
    res.json({ success: true, data: metrics });
  })
);

// ============================================================================
// QUESTIONNAIRE COLLECTION
// ============================================================================
questionnaireIntelligenceRouter.get(
  '/',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const service = getQuestionnaireIntelligenceService();
    const page = await service.getStore().listQuestionnaires(req.tenantContext!.tenantId, {
      limit: req.query.limit ? Number(req.query.limit) : 25,
      offset: req.query.offset ? Number(req.query.offset) : 0,
      status: req.query.status ? String(req.query.status) : undefined,
      search: req.query.search ? String(req.query.search) : undefined
    });
    res.json({ success: true, ...page, data: page.items });
  })
);

/**
 * Import. Accepts the file as base64 JSON (`contentBase64`) or as a raw body
 * with `x-file-name`. The original artifact is stored immutably and hashed.
 */
questionnaireIntelligenceRouter.post(
  '/import',
  requirePermission('questionnaire.import'),
  asyncRoute(async (req, res) => {
    const fileName = String(req.body.fileName || req.headers['x-file-name'] || '');
    let buffer: Buffer;

    if (req.body.contentBase64) {
      buffer = Buffer.from(String(req.body.contentBase64), 'base64');
    } else if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      buffer = req.body;
    } else {
      buffer = Buffer.alloc(0);
    }

    if (buffer.length === 0) {
      res.status(422).json({
        success: false,
        error: 'No file content supplied. Provide `contentBase64` in a JSON body or a raw request body.',
        code: 'EMPTY_UPLOAD'
      });
      return;
    }
    if (buffer.length > MAX_QUESTIONNAIRE_FILE_BYTES) {
      res.status(413).json({
        success: false,
        error: `File exceeds the ${Math.round(MAX_QUESTIONNAIRE_FILE_BYTES / (1024 * 1024))} MB ceiling.`,
        code: 'FILE_TOO_LARGE'
      });
      return;
    }

    const result = await getQuestionnaireIntelligenceService().importQuestionnaire({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      fileName,
      mimeType: req.body.mimeType || (req.headers['content-type'] as string) || undefined,
      buffer,
      idempotencyKey: req.body.idempotencyKey ? String(req.body.idempotencyKey) : undefined
    });

    res.status(201).json({
      success: true,
      data: {
        questionnaire: result.questionnaire,
        extractionSummary: result.summary,
        questionsRequiringCorrection: result.corrections,
        idempotentReplay: result.idempotentReplay
      }
    });
  })
);

// ============================================================================
// QUESTIONNAIRE-SCOPED OPERATIONS
// ============================================================================
questionnaireIntelligenceRouter.get(
  '/:questionnaireId',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const workspace = await getQuestionnaireIntelligenceService().getWorkspace(
      req.tenantContext!.tenantId,
      String(req.params.questionnaireId)
    );
    res.json({ success: true, data: workspace });
  })
);

questionnaireIntelligenceRouter.get(
  '/:questionnaireId/questions',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const service = getQuestionnaireIntelligenceService();
    await service.getQuestionnaire(req.tenantContext!.tenantId, String(req.params.questionnaireId));
    const page = await service.getStore().listQuestions(req.tenantContext!.tenantId, String(req.params.questionnaireId), {
      limit: req.query.limit ? Number(req.query.limit) : 100,
      offset: req.query.offset ? Number(req.query.offset) : 0
    });
    res.json({ success: true, ...page, data: page.items });
  })
);

questionnaireIntelligenceRouter.post(
  '/:questionnaireId/mapping',
  requirePermission('questionnaire.mapping'),
  asyncRoute(async (req, res) => {
    const questionnaire = await getQuestionnaireIntelligenceService().correctColumnMapping({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      questionnaireId: String(req.params.questionnaireId),
      worksheet: String(req.body.worksheet || ''),
      patch: {
        questionColumn: req.body.questionColumn !== undefined ? String(req.body.questionColumn) : undefined,
        responseColumn:
          req.body.responseColumn === null
            ? null
            : req.body.responseColumn !== undefined
              ? String(req.body.responseColumn)
              : undefined,
        headerRow: req.body.headerRow !== undefined ? Number(req.body.headerRow) : undefined,
        sectionColumn:
          req.body.sectionColumn === null
            ? null
            : req.body.sectionColumn !== undefined
              ? String(req.body.sectionColumn)
              : undefined
      }
    });
    res.json({ success: true, data: questionnaire });
  })
);

questionnaireIntelligenceRouter.post(
  '/:questionnaireId/analyze',
  requirePermission('questionnaire.analyze'),
  asyncRoute(async (req, res) => {
    const result = await getQuestionnaireIntelligenceService().analyze({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      questionnaireId: String(req.params.questionnaireId),
      organizationalScope: req.body.organizationalScope,
      policy: (req.body.policy || {}) as Partial<WorkflowPolicy>,
      asOf: req.body.asOf
    });

    const outcomes = result.outcomes.map(o => ({
      questionId: o.questionId,
      error: o.error,
      primaryCategory: o.analysis?.primaryCategory,
      disposition: o.draft?.disposition,
      sufficiency: o.draft?.sufficiency,
      status: o.draft?.status,
      confidenceEstimate: o.draft?.confidenceEstimate,
      citations: o.draft?.citations.length ?? 0,
      gaps: o.gaps.length,
      reusedLibraryEntryId: o.reusedLibraryEntryId,
      reuseDecision: o.reuseDecision
    }));

    // A failed job is reported as a failure, never as a success. The per-item
    // outcomes travel with the failure so the reviewer can act on the questions
    // that were processed before the job aborted.
    if (result.job.status === 'FAILED') {
      res.status(502).json({
        success: false,
        error: `Analysis job ${result.job.id} FAILED: ${result.job.progress.failed} of ${result.job.progress.total} questions could not be processed.`,
        code: 'ANALYSIS_JOB_FAILED',
        data: { job: result.job, outcomes }
      });
      return;
    }
    res.json({ success: true, data: { job: result.job, outcomes } });
  })
);

questionnaireIntelligenceRouter.get(
  '/:questionnaireId/gaps',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const gaps = await getQuestionnaireIntelligenceService().listGaps(
      req.tenantContext!.tenantId,
      String(req.params.questionnaireId),
      req.query.status ? String(req.query.status) : undefined
    );
    res.json({ success: true, count: gaps.length, data: gaps });
  })
);

questionnaireIntelligenceRouter.get(
  '/:questionnaireId/drafts',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const service = getQuestionnaireIntelligenceService();
    await service.getQuestionnaire(req.tenantContext!.tenantId, String(req.params.questionnaireId));
    const drafts = await service.getStore().listDrafts(req.tenantContext!.tenantId, String(req.params.questionnaireId));
    res.json({ success: true, count: drafts.length, data: drafts });
  })
);

questionnaireIntelligenceRouter.post(
  '/:questionnaireId/export/preflight',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const preflight = await getQuestionnaireIntelligenceService().exportPreflight({
      tenantId: req.tenantContext!.tenantId,
      questionnaireId: String(req.params.questionnaireId),
      policy: req.body.policy,
      approvedExceptionId: req.body.approvedExceptionId,
      approvedExceptionReason: req.body.approvedExceptionReason
    });
    res.json({ success: true, data: preflight });
  })
);

questionnaireIntelligenceRouter.post(
  '/:questionnaireId/export',
  requirePermission('questionnaire.export'),
  asyncRoute(async (req, res) => {
    const result = await getQuestionnaireIntelligenceService().exportQuestionnaire({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      questionnaireId: String(req.params.questionnaireId),
      policy: req.body.policy,
      approvedExceptionId: req.body.approvedExceptionId,
      approvedExceptionReason: req.body.approvedExceptionReason
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.record.fileName.replace(/"/g, '')}"`
    );
    res.setHeader('X-Skanda-Export-Id', result.record.id);
    res.setHeader('X-Skanda-Export-Sha256', result.record.sha256Digest);
    res.setHeader('X-Skanda-Questions-Unresolved', String(result.record.questionsLeftUnresolvedAndVisible));
    res.send(result.artifact);
  })
);

questionnaireIntelligenceRouter.get(
  '/:questionnaireId/exports',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const exportsList = await getQuestionnaireIntelligenceService().listExports(
      req.tenantContext!.tenantId,
      String(req.params.questionnaireId)
    );
    res.json({ success: true, count: exportsList.length, data: exportsList });
  })
);

questionnaireIntelligenceRouter.get(
  '/:questionnaireId/audit',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const service = getQuestionnaireIntelligenceService();
    // Ownership is asserted first so a foreign questionnaire id cannot be
    // probed for existence through an empty (rather than 404) audit response.
    await service.getQuestionnaire(req.tenantContext!.tenantId, String(req.params.questionnaireId));
    const events = await service.listAuditEvents(
      req.tenantContext!.tenantId,
      String(req.params.questionnaireId),
      req.query.limit ? Number(req.query.limit) : 200
    );
    res.json({ success: true, count: events.length, data: events });
  })
);

questionnaireIntelligenceRouter.get(
  '/:questionnaireId/audit/verify',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const service = getQuestionnaireIntelligenceService();
    await service.getQuestionnaire(req.tenantContext!.tenantId, String(req.params.questionnaireId));
    const result = await service.verifyAuditChain(
      req.tenantContext!.tenantId,
      String(req.params.questionnaireId)
    );
    res.json({ success: true, data: result });
  })
);

questionnaireIntelligenceRouter.get(
  '/:questionnaireId/jobs/:jobId',
  requirePermission('questionnaire.read'),
  asyncRoute(async (req, res) => {
    const job = await getQuestionnaireIntelligenceService().getJob(
      req.tenantContext!.tenantId,
      String(req.params.jobId)
    );
    if (!job || job.questionnaireId !== String(req.params.questionnaireId)) {
      res.status(404).json({ success: false, error: 'Job not found for this tenant.', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, data: job });
  })
);

questionnaireIntelligenceRouter.post(
  '/:questionnaireId/delete',
  requirePermission('questionnaire.orgfacts.manage'),
  asyncRoute(async (req, res) => {
    if (String(req.body.confirmation || '') !== 'DELETE') {
      res.status(422).json({
        success: false,
        error: 'Destructive operation requires confirmation: set `confirmation` to "DELETE".',
        code: 'CONFIRMATION_REQUIRED'
      });
      return;
    }
    const result = await getQuestionnaireIntelligenceService().deleteQuestionnaire({
      tenantId: req.tenantContext!.tenantId,
      actor: actorFrom(req),
      questionnaireId: String(req.params.questionnaireId)
    });
    res.json({ success: true, data: result });
  })
);

/** Safe concurrency guard helper used by the UI when generating new request ids. */
questionnaireIntelligenceRouter.get('/meta/request-id', (_req: Request, res: Response) => {
  res.json({ success: true, data: { requestId: crypto.randomBytes(8).toString('hex') } });
});

void enterpriseAuditService;

export default questionnaireIntelligenceRouter;
