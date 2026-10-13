// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 13 DISCOVERY & SME INTERVIEW REST ROUTER
// Path: server/discoveryRoutes.ts
//
// Exposes enterprise REST APIs for:
// - SME Interview Planning & Lifecycle Management
// - Question Generation & Response Autosave
// - Documentation Readiness Scoring & Gating
// - Authoritative Document Generation with Granular Provenance
// - Source Conflict Detection & Resolution
// - Organizational Change Impact Analysis
// - Command Centre Discovery Metrics
// ============================================================================

import express, { Request, Response } from 'express';
import { organizationalDiscoveryEngine } from './services/OrganizationalDiscoveryEngine.js';

export const discoveryRouter = express.Router();

// Helper to extract session tenant
function getTenantId(req: Request): string {
  return (req.headers['x-tenant-id'] as string) || 'SKANDA-DEMO-ENTERPRISE';
}

// ----------------------------------------------------------------------------
// 1. DISCOVERY DEPARTMENTS & COMMAND CENTRE METRICS
// ----------------------------------------------------------------------------
discoveryRouter.get('/departments', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const departments = organizationalDiscoveryEngine.discoverDepartments(tenantId);
  res.json({ success: true, count: departments.length, data: departments });
});

discoveryRouter.get('/metrics', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const metrics = organizationalDiscoveryEngine.getDiscoveryCommandCentreMetrics(tenantId);
  res.json({ success: true, data: metrics });
});

// ----------------------------------------------------------------------------
// 2. INTERVIEW SESSIONS & QUESTIONS
// ----------------------------------------------------------------------------
discoveryRouter.post('/interviews', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { planId, leadInterviewer, participants } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId is required.' });
    }

    const session = organizationalDiscoveryEngine.createInterviewSession({
      planId,
      tenantId,
      leadInterviewer: leadInterviewer || 'grc.lead@acmefintech.io',
      participants: participants || []
    });

    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

discoveryRouter.get('/interviews/:id', (req: Request, res: Response) => {
  const session = organizationalDiscoveryEngine.getInterviewSession(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: `Interview session ${req.params.id} not found.` });
  }
  res.json({ success: true, data: session });
});

discoveryRouter.post('/interviews/:id/responses', (req: Request, res: Response) => {
  try {
    const { questionId, responseText, answeredBy, answeredByRole } = req.body;
    if (!questionId || !responseText) {
      return res.status(400).json({ success: false, error: 'questionId and responseText are required.' });
    }

    const result = organizationalDiscoveryEngine.saveInterviewResponse({
      sessionId: req.params.id,
      questionId,
      responseText,
      answeredBy: answeredBy || 'rachel.green@acmefintech.io',
      answeredByRole: answeredByRole || 'HR Operations Manager'
    });

    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

discoveryRouter.post('/interviews/:id/complete', (req: Request, res: Response) => {
  try {
    const { validatorEmail } = req.body;
    const session = organizationalDiscoveryEngine.completeInterviewSession(
      req.params.id,
      validatorEmail || 'ciso@acmefintech.io'
    );
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. DOCUMENTATION READINESS & PROVENANCE
// ----------------------------------------------------------------------------
discoveryRouter.get('/readiness/:processId', (req: Request, res: Response) => {
  const docType = (req.query.docType as any) || 'POLICY';
  const readiness = organizationalDiscoveryEngine.calculateDocumentationReadiness(req.params.processId, docType);
  res.json({ success: true, data: readiness });
});

discoveryRouter.post('/documentation/generate', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { processId, docType, title, requestedBy } = req.body;

    if (!processId || !docType || !title) {
      return res.status(400).json({ success: false, error: 'processId, docType, and title are required.' });
    }

    const doc = organizationalDiscoveryEngine.generateAuthoritativeDocument({
      tenantId,
      processId,
      docType,
      title,
      requestedBy: requestedBy || 'ciso@acmefintech.io'
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

discoveryRouter.get('/documentation/:documentId/provenance', (req: Request, res: Response) => {
  const doc = organizationalDiscoveryEngine.getDocument(req.params.documentId);
  if (!doc) {
    return res.status(404).json({ success: false, error: `Document ${req.params.documentId} not found.` });
  }
  res.json({ success: true, documentId: doc.id, sha256Digest: doc.sha256Digest, provenance: doc.provenance });
});

discoveryRouter.post('/documentation/:documentId/transition', (req: Request, res: Response) => {
  try {
    const { targetStatus, actorEmail, actorRole, rejectionReason } = req.body;
    if (!targetStatus || !actorRole) {
      return res.status(400).json({ success: false, error: 'targetStatus and actorRole are required.' });
    }

    const doc = organizationalDiscoveryEngine.transitionDocumentStatus({
      documentId: req.params.documentId,
      targetStatus,
      actorEmail: actorEmail || 'ciso@acmefintech.io',
      actorRole,
      rejectionReason
    });

    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. CONFLICT DETECTION & DOCUMENT IMPACT ANALYSIS
// ----------------------------------------------------------------------------
discoveryRouter.post('/conflicts/detect', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { processId, controlCode, interviewClaim, telemetryClaim, actor } = req.body;

  const conflict = organizationalDiscoveryEngine.detectSourceConflicts({
    tenantId,
    processId: processId || 'PROC-HR-001',
    controlCode: controlCode || 'A.5.15',
    interviewClaim: interviewClaim || 'MFA is enabled for all users.',
    telemetryClaim: telemetryClaim || '3 privileged users have MFA disabled.',
    actor: actor || 'HR Manager'
  });

  res.json({ success: true, conflictDetected: !!conflict, data: conflict });
});

discoveryRouter.post('/impact/analyze', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const { changedProcessId, changeDescription, triggerActor } = req.body;

  const report = organizationalDiscoveryEngine.triggerDocumentImpactAnalysis({
    tenantId,
    changedProcessId: changedProcessId || 'PROC-HR-001',
    changeDescription: changeDescription || 'Modified onboarding approval workflow to require dual manager sign-off.',
    triggerActor: triggerActor || 'HR Operations Head'
  });

  res.json({ success: true, data: report });
});
