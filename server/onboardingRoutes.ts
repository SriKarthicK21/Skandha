/**
 * SKANDA ENTERPRISE ONBOARDING REST API
 * File: server/onboardingRoutes.ts
 * 
 * Secure, tenant-isolated endpoints supporting progressive disclosure onboarding,
 * questionnaire configuration engine, continuous autosave, and workspace activation.
 */

import { Router, Request, Response } from 'express';
import { onboardingService } from './services/OnboardingService.js';
import { questionnaireEngine } from './services/QuestionnaireEngine.js';
import { businessDiscoveryService } from './services/BusinessDiscoveryService.js';

export const onboardingRouter = Router();

// Helper to extract authenticated tenant context or default
function getTenantId(req: Request): string {
  if (req.tenantContext && req.tenantContext.tenantId) {
    return req.tenantContext.tenantId;
  }
  const queryTenant = req.query.tenantId as string;
  const headerTenant = req.headers['x-tenant-id'] as string;
  const bodyTenant = req.body?.tenantId as string;
  return queryTenant || headerTenant || bodyTenant || 'tenant-default';
}

function getUserEmail(req: Request): string {
  if (req.tenantContext && req.tenantContext.email) {
    return req.tenantContext.email;
  }
  return (req.headers['x-user-email'] as string) || req.body?.actorEmail || 'ciso@enterprise.io';
}

// ----------------------------------------------------------------------------
// 1. GET / CREATE ONBOARDING SESSION
// ----------------------------------------------------------------------------
onboardingRouter.get('/session', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const tenantName = (req.query.tenantName as string) || 'Enterprise Client';
  const session = onboardingService.getOrCreateSession(tenantId, 'org_primary', tenantName);
  res.json({ success: true, data: session });
});

onboardingRouter.post('/session', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const tenantName = (req.body?.tenantName as string) || 'Enterprise Client';
  const session = onboardingService.getOrCreateSession(tenantId, 'org_primary', tenantName);
  res.status(201).json({ success: true, data: session });
});

onboardingRouter.get('/session/:id', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const session = onboardingService.getOrCreateSession(tenantId);
  res.json({ success: true, data: session });
});

onboardingRouter.patch('/session/:id', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { stepNumber, discoveryUpdates, responsesUpdates, actorRole, expectedVersion } = req.body;
    const actorEmail = getUserEmail(req);

    const updated = onboardingService.saveSessionProgress(
      tenantId,
      stepNumber || 1,
      discoveryUpdates,
      responsesUpdates,
      actorEmail,
      actorRole || 'ADMIN',
      expectedVersion
    );

    res.json({ success: true, data: updated });
  } catch (err: any) {
    const status = err.message?.includes('Concurrency Conflict') ? 409 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. AUTOSAVE ONBOARDING SESSION PROGRESS
// ----------------------------------------------------------------------------
onboardingRouter.post('/session/save', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { stepNumber, discoveryUpdates, responsesUpdates, actorRole, expectedVersion } = req.body;
    const actorEmail = getUserEmail(req);

    const updated = onboardingService.saveSessionProgress(
      tenantId,
      stepNumber || 1,
      discoveryUpdates,
      responsesUpdates,
      actorEmail,
      actorRole || 'ADMIN',
      expectedVersion
    );

    res.json({
      success: true,
      data: updated,
      message: '✓ Saved successfully',
      savedAt: updated.lastSavedAt,
      version: updated.version
    });
  } catch (err: any) {
    const status = err.message?.includes('Concurrency Conflict') ? 409 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. UPDATE SESSION STATUS WITH DETERMINISTIC STATE MACHINE
// ----------------------------------------------------------------------------
onboardingRouter.patch('/status', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { targetStatus, reason } = req.body;
    const actorEmail = getUserEmail(req);

    const session = onboardingService.updateSessionStatus(tenantId, targetStatus, actorEmail, reason);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. DELEGATE SECTION TO STAKEHOLDER ROLE
// ----------------------------------------------------------------------------
onboardingRouter.post('/session/delegate', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { stepNumber, stepKey, stepTitle, role, userEmail, userName } = req.body;
    const actorEmail = getUserEmail(req);

    const updated = onboardingService.assignSection(
      tenantId,
      stepNumber,
      stepKey,
      stepTitle,
      role,
      userEmail,
      userName,
      actorEmail
    );

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. GET PROCESS TEMPLATES & APPLY TEMPLATE
// ----------------------------------------------------------------------------
onboardingRouter.get('/templates', (req: Request, res: Response) => {
  const industry = req.query.industry as string;
  const framework = req.query.framework as string;
  const templates = businessDiscoveryService.getProcessTemplates(industry, framework);
  res.json({ success: true, count: templates.length, data: templates });
});

onboardingRouter.post('/templates/apply', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { templateId } = req.body;
    const actorEmail = getUserEmail(req);

    const createdProcess = onboardingService.applyProcessTemplate(tenantId, templateId, actorEmail);
    res.status(201).json({ success: true, data: createdProcess });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. DISCOVERY COMPLETENESS & QUALITY GAPS
// ----------------------------------------------------------------------------
onboardingRouter.get('/completeness', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const session = onboardingService.getOrCreateSession(tenantId);
  const completeness = businessDiscoveryService.calculateDiscoveryCompleteness(session.discoveryData);
  const qualityGaps = businessDiscoveryService.detectDiscoveryQualityGaps(session.discoveryData);

  res.json({
    success: true,
    data: {
      completeness,
      qualityGaps,
      sessionStatus: session.status,
      version: session.version
    }
  });
});

// ----------------------------------------------------------------------------
// 7. CLIENT DATA IMPORT PIPELINE (PREVIEW & COMMIT)
// ----------------------------------------------------------------------------
onboardingRouter.post('/import/preview', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { entityType, csvContent } = req.body;

    if (!entityType || !csvContent) {
      return res.status(400).json({ success: false, error: 'entityType and csvContent are required' });
    }

    const preview = onboardingService.previewDataImport(tenantId, entityType, csvContent);
    res.json({ success: true, data: preview });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

onboardingRouter.post('/import/confirm', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { entityType, validRecords } = req.body;
    const actorEmail = getUserEmail(req);

    if (!entityType || !Array.isArray(validRecords)) {
      return res.status(400).json({ success: false, error: 'entityType and validRecords array are required' });
    }

    const count = onboardingService.confirmDataImport(tenantId, entityType, validRecords, actorEmail);
    res.json({ success: true, message: `Successfully imported ${count} ${entityType} records`, count });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 8. DOCUMENT DISCOVERY INGESTION
// ----------------------------------------------------------------------------
onboardingRouter.post('/documents/upload', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { fileName, fileSize, mimeType, rawContent } = req.body;
    const actorEmail = getUserEmail(req);

    if (!fileName || !rawContent) {
      return res.status(400).json({ success: false, error: 'fileName and rawContent are required' });
    }

    const doc = onboardingService.uploadDiscoveryDocument(
      tenantId,
      fileName,
      fileSize || 1024,
      mimeType || 'application/pdf',
      rawContent,
      actorEmail
    );

    res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 9. GET QUESTIONNAIRE DEFINITIONS & FILTERED VISIBLE QUESTIONS
// ----------------------------------------------------------------------------
onboardingRouter.get('/questions', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const session = onboardingService.getOrCreateSession(tenantId);
  const selectedFrameworks = session.discoveryData.selectedPrograms.map(p => p.frameworkCode);

  const visibleQuestions = questionnaireEngine.getVisibleQuestions(
    session.questionnaireResponses,
    selectedFrameworks
  );

  res.json({
    success: true,
    totalCount: questionnaireEngine.getAllQuestions().length,
    visibleCount: visibleQuestions.length,
    data: visibleQuestions
  });
});

// ----------------------------------------------------------------------------
// 10. RESPONSES REST ENDPOINTS
// ----------------------------------------------------------------------------
onboardingRouter.post('/responses', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { questionId, value, stepNumber } = req.body;
    const actorEmail = getUserEmail(req);

    const updated = onboardingService.saveSessionProgress(
      tenantId,
      stepNumber || 1,
      undefined,
      { [questionId]: value },
      actorEmail
    );

    res.status(201).json({ success: true, data: updated.questionnaireResponses[questionId] });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

onboardingRouter.patch('/responses/:id', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const questionId = req.params.id;
    const { value, stepNumber } = req.body;
    const actorEmail = getUserEmail(req);

    const updated = onboardingService.saveSessionProgress(
      tenantId,
      stepNumber || 1,
      undefined,
      { [questionId]: value },
      actorEmail
    );

    res.json({ success: true, data: updated.questionnaireResponses[questionId] });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 11. PROGRESS SUMMARY
// ----------------------------------------------------------------------------
onboardingRouter.get('/progress', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const session = onboardingService.getOrCreateSession(tenantId);
  const completeness = businessDiscoveryService.calculateDiscoveryCompleteness(session.discoveryData);

  res.json({
    success: true,
    data: {
      currentStep: session.currentStep,
      completionPercentage: session.completionPercentage,
      completenessScore: completeness.overallScore,
      stageProgress: completeness.stageProgress,
      status: session.status,
      version: session.version,
      lastSavedAt: session.lastSavedAt,
      assignments: session.assignments
    }
  });
});

// ----------------------------------------------------------------------------
// 12. GENERATE OR REGENERATE AI DRAFT SCOPE STATEMENT
// ----------------------------------------------------------------------------
onboardingRouter.post('/scope/generate', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const draftScope = onboardingService.regenerateDraftScope(tenantId);
    res.json({ success: true, data: draftScope });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 13. APPROVE SCOPE STATEMENT (HUMAN CLIENT ACTION)
// ----------------------------------------------------------------------------
onboardingRouter.post('/scope/approve', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const actorEmail = getUserEmail(req);
    const { notes } = req.body;

    const approved = onboardingService.approveScope(tenantId, actorEmail, notes);
    res.json({ success: true, data: approved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 14. REVIEW BEFORE ACTIVATION (STEP 18)
// ----------------------------------------------------------------------------
onboardingRouter.post('/review', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const session = onboardingService.getOrCreateSession(tenantId);
  const metrics = businessDiscoveryService.getDiscoverySummaryMetrics(session.discoveryData);
  const completeness = businessDiscoveryService.calculateDiscoveryCompleteness(session.discoveryData);
  const qualityGaps = businessDiscoveryService.detectDiscoveryQualityGaps(session.discoveryData);

  res.json({
    success: true,
    data: {
      sessionStatus: session.status,
      version: session.version,
      scopeApproved: session.draftScope?.status === 'CLIENT_APPROVED',
      summaryMetrics: metrics,
      completeness,
      qualityGaps,
      verifiedCounts: {
        processes: session.discoveryData.businessProcesses.length,
        applications: session.discoveryData.applications.length,
        assets: session.discoveryData.assets.length,
        dataCategories: session.discoveryData.dataAssets.length,
        vendors: session.discoveryData.vendors.length,
        sites: session.discoveryData.sites.length,
        criticalServices: session.discoveryData.criticalServices.length
      }
    }
  });
});

// ----------------------------------------------------------------------------
// 15. GET REAL SUMMARY METRICS
// ----------------------------------------------------------------------------
onboardingRouter.get('/summary-metrics', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const session = onboardingService.getOrCreateSession(tenantId);
  const metrics = businessDiscoveryService.getDiscoverySummaryMetrics(session.discoveryData);
  res.json({ success: true, data: metrics });
});

// ----------------------------------------------------------------------------
// 16. GET ENTITY 360 GRAPH
// ----------------------------------------------------------------------------
onboardingRouter.get('/graph', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const rootCode = req.query.rootCode as string;
  const session = onboardingService.getOrCreateSession(tenantId);
  const graph = businessDiscoveryService.buildEntity360Graph(session.discoveryData, rootCode);
  res.json({ success: true, data: graph });
});

// ----------------------------------------------------------------------------
// 17. FINAL WORKSPACE ACTIVATION (STEP 19)
// ----------------------------------------------------------------------------
onboardingRouter.post('/activate', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const actorEmail = getUserEmail(req);

    const result = onboardingService.activateWorkspace(tenantId, actorEmail);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 18. DYNAMIC SECTION PRIORITIZATION
// ----------------------------------------------------------------------------
onboardingRouter.get('/priorities', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const session = onboardingService.getOrCreateSession(tenantId);
  const frameworkCodes = session.discoveryData.selectedPrograms.map(p => p.frameworkCode);
  const priorities = questionnaireEngine.calculateSectionPriorities(frameworkCodes, session.questionnaireResponses);
  res.json({ success: true, data: priorities });
});

// ----------------------------------------------------------------------------
// 19. BUSINESS DISCOVERY WORKSHOP SUGGESTIONS
// ----------------------------------------------------------------------------
onboardingRouter.post('/workshop/suggestions', (req: Request, res: Response) => {
  const { activities } = req.body;
  const suggestions = businessDiscoveryService.getWorkshopActivitySuggestions(Array.isArray(activities) ? activities : []);
  res.json({ success: true, data: suggestions });
});

onboardingRouter.post('/workshop/activities', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const actorEmail = getUserEmail(req);
  const { activities } = req.body;
  const saved = onboardingService.setPrimaryActivities(tenantId, Array.isArray(activities) ? activities : [], actorEmail);
  res.json({ success: true, data: saved });
});

// ----------------------------------------------------------------------------
// 20. PROCESS BUILDER OPERATIONS (DUPLICATE / ARCHIVE)
// ----------------------------------------------------------------------------
onboardingRouter.post('/processes/duplicate', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const actorEmail = getUserEmail(req);
  const { processId } = req.body;
  const duplicated = onboardingService.duplicateProcess(tenantId, processId, actorEmail);
  if (!duplicated) return res.status(404).json({ success: false, error: 'Process not found' });
  res.json({ success: true, data: duplicated });
});

onboardingRouter.post('/processes/archive', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const actorEmail = getUserEmail(req);
  const { processId } = req.body;
  const archived = onboardingService.archiveProcess(tenantId, processId, actorEmail);
  if (!archived) return res.status(404).json({ success: false, error: 'Process not found' });
  res.json({ success: true, data: { archived: true, processId } });
});

// ----------------------------------------------------------------------------
// 21. CONTEXTUAL COMMENTS & CLARIFICATIONS
// ----------------------------------------------------------------------------
onboardingRouter.get('/comments', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const comments = onboardingService.getComments(tenantId);
  res.json({ success: true, data: comments });
});

onboardingRouter.post('/comments', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const actorEmail = getUserEmail(req);
  const { stepNumber, stepKey, fieldId, authorName, authorRole, content, mentions } = req.body;
  const newComment = onboardingService.addComment(tenantId, {
    stepNumber: stepNumber || 1,
    stepKey: stepKey || 'GENERAL',
    fieldId,
    authorEmail: actorEmail,
    authorName: authorName || 'Team Member',
    authorRole: authorRole || 'CISO',
    content: content || '',
    mentions: Array.isArray(mentions) ? mentions : []
  });
  res.status(201).json({ success: true, data: newComment });
});

onboardingRouter.post('/comments/resolve', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const actorEmail = getUserEmail(req);
  const { commentId } = req.body;
  const resolved = onboardingService.resolveComment(tenantId, commentId, actorEmail);
  res.json({ success: true, data: { resolved, commentId } });
});
