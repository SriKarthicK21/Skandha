// ============================================================================
// SKANDA ENTERPRISE GRC: POLICY GOVERNANCE & INTELLIGENCE REST ROUTER
// Path: server/policyGovernanceRoutes.ts
//
// Exposes enterprise REST APIs for:
// - Document Register & Version Lifecycle Management
// - Unified Policy Experience Aggregate Model (/policies/:id/experience)
// - 12-Dimension Policy Quality Intelligence & Assurance Evaluation
// - AI-Assisted Policy Implementation with Statement-Level Source Traceability
// - Approval Matrix Evaluation & Segregation of Duties Enforcement
// - Publication Quality Gate & Immutable WORM Hashes
// - Acknowledgement Campaigns & Electronic Signature Ledgers
// - Implementation Plans & Expected Evidence Tracking
// - Review Calendar Cadence & Overdue Schedules
// - Document Conflict, Drift & Duplication Detection
// - Regulatory Change Impact Assessment & Governance Review Tasks
// - Auditor Digital Governance Pack Generation
// ============================================================================

import express, { Request, Response } from 'express';
import { policyGovernanceEngine } from './services/PolicyGovernanceEngine.js';
import { policyQualityEngine } from './services/PolicyQualityEngine.js';
import { policyAiGeneratorService } from './services/PolicyAiGeneratorService.js';
import { policyDuplicationEngine } from './services/PolicyDuplicationEngine.js';
import { policyRegulatoryImpactService } from './services/PolicyRegulatoryImpactService.js';
import { enterpriseDocumentationEngine } from './services/EnterpriseDocumentationEngine.js';

export const policyGovernanceRouter = express.Router();

function getTenantId(req: Request): string {
  if (req.tenantContext?.tenantId) {
    const clientHeader = req.headers['x-tenant-id'] as string;
    if (clientHeader && clientHeader !== req.tenantContext.tenantId) {
      console.warn(`[SECURITY WARNING] Tenant spoofing attempt detected: Client header '${clientHeader}' does not match server-authenticated tenant '${req.tenantContext.tenantId}'`);
    }
    return req.tenantContext.tenantId;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('UNAUTHORIZED_TENANT: Request lacks verified server-side tenant authentication context.');
  }
  return (req.headers['x-tenant-id'] as string) || 'SKANDA-DEMO-ENTERPRISE';
}

function getActor(req: Request): { email: string; role: string } {
  if (req.tenantContext?.email && req.tenantContext?.role) {
    return {
      email: req.tenantContext.email,
      role: req.tenantContext.role
    };
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('UNAUTHORIZED_ACTOR: Request lacks verified server-side user authentication context.');
  }
  return {
    email: (req.headers['x-user-email'] as string) || 'ciso@skanda.enterprise.com',
    role: (req.headers['x-user-role'] as string) || 'CISO'
  };
}

// ----------------------------------------------------------------------------
// 1. UNIFIED POLICY EXPERIENCE AGGREGATE ENDPOINT
// ----------------------------------------------------------------------------
policyGovernanceRouter.get(['/policies/:id/experience', '/documents/:id/experience', '/experience/:id'], (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const actor = getActor(req);
    const experience = policyGovernanceEngine.getPolicyExperience(req.params.id, actor.email, actor.role, tenantId);
    res.json({ success: true, data: experience });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 2. DOCUMENT REGISTER & METRICS
// ----------------------------------------------------------------------------
policyGovernanceRouter.get('/documents', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const docs = policyGovernanceEngine.getDocuments(tenantId);
  res.json({ success: true, count: docs.length, data: docs });
});

policyGovernanceRouter.get('/metrics', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const metrics = policyGovernanceEngine.getDocumentGovernanceMetrics(tenantId);
  res.json({ success: true, data: metrics });
});

policyGovernanceRouter.get('/documents/:id', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const doc = policyGovernanceEngine.getDocument(req.params.id, tenantId);
  if (!doc) {
    return res.status(404).json({ success: false, error: `Document ${req.params.id} not found.` });
  }
  res.json({ success: true, data: doc });
});

policyGovernanceRouter.post('/documents', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const doc = policyGovernanceEngine.createDocument({
      tenantId,
      ...req.body
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. AI-ASSISTED POLICY GENERATION WORKSPACE
// ----------------------------------------------------------------------------
policyGovernanceRouter.post('/generate', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const draft = policyAiGeneratorService.generatePolicyDraft({
      tenantId,
      ...req.body
    });
    res.json({ success: true, data: draft });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. POLICY QUALITY INTELLIGENCE ENGINE (12 DIMENSIONS)
// ----------------------------------------------------------------------------
policyGovernanceRouter.post('/quality-audit', (req: Request, res: Response) => {
  try {
    const evaluation = policyQualityEngine.evaluatePolicy(req.body);
    res.json({ success: true, data: evaluation });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. VERSION CONTROL & SIDE-BY-SIDE DIFF
// ----------------------------------------------------------------------------
policyGovernanceRouter.get('/documents/:id/compare', (req: Request, res: Response) => {
  try {
    const v1 = (req.query.v1 as string) || '1.0.0';
    const v2 = (req.query.v2 as string) || '1.1.0';
    const comparison = policyGovernanceEngine.compareDocumentVersions(req.params.id, v1, v2);
    res.json({ success: true, data: comparison });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documents/:id/versions', (req: Request, res: Response) => {
  try {
    const doc = policyGovernanceEngine.createNewDocumentVersion({
      documentId: req.params.id,
      ...req.body
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. REVIEW & APPROVAL WORKFLOW
// ----------------------------------------------------------------------------
policyGovernanceRouter.post('/documents/:id/review', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const actor = getActor(req);

    // Verify document belongs to tenant
    const existingDoc = policyGovernanceEngine.getDocument(req.params.id, tenantId);
    if (!existingDoc) {
      return res.status(404).json({ success: false, error: `Document ${req.params.id} not found in tenant ${tenantId}.` });
    }

    const doc = policyGovernanceEngine.submitForReview(
      req.params.id,
      actor.email,
      actor.role
    );
    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documents/:id/approve', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const actor = getActor(req);
    const { approvalComment } = req.body;

    // Verify document belongs to tenant
    const existingDoc = policyGovernanceEngine.getDocument(req.params.id, tenantId);
    if (!existingDoc) {
      return res.status(404).json({ success: false, error: `Document ${req.params.id} not found in tenant ${tenantId}.` });
    }

    const doc = policyGovernanceEngine.approveDocument({
      documentId: req.params.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      approvalComment: approvalComment || 'Formally approved based on compliance verification.'
    });

    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documents/:id/reject', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const actor = getActor(req);
    const { rejectionReason } = req.body;

    // Verify document belongs to tenant
    const existingDoc = policyGovernanceEngine.getDocument(req.params.id, tenantId);
    if (!existingDoc) {
      return res.status(404).json({ success: false, error: `Document ${req.params.id} not found in tenant ${tenantId}.` });
    }

    const doc = policyGovernanceEngine.rejectDocument({
      documentId: req.params.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      rejectionReason: rejectionReason || 'Document requires adjustments before sign-off.'
    });
    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 7. PUBLICATION QUALITY GATE
// ----------------------------------------------------------------------------
policyGovernanceRouter.post('/documents/:id/publish', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const actor = getActor(req);
    const { effectiveDate } = req.body;

    // Verify document belongs to tenant
    const existingDoc = policyGovernanceEngine.getDocument(req.params.id, tenantId);
    if (!existingDoc) {
      return res.status(404).json({ success: false, error: `Document ${req.params.id} not found in tenant ${tenantId}.` });
    }

    const result = policyGovernanceEngine.publishDocument({
      documentId: req.params.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      effectiveDate
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 8. ACKNOWLEDGEMENTS & ELECTRONIC SIGNATURES
// ----------------------------------------------------------------------------
policyGovernanceRouter.post('/acknowledgements/record', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { campaignId, userEmail, userName, userRole, department, ipAddress } = req.body;
    if (!campaignId || !userEmail) {
      return res.status(400).json({ success: false, error: 'campaignId and userEmail are required.' });
    }

    const record = policyGovernanceEngine.recordUserAcknowledgement({
      tenantId,
      campaignId,
      userEmail,
      userName: userName || userEmail.split('@')[0],
      userRole: userRole || 'EMPLOYEE',
      department: department || 'General',
      ipAddress
    });

    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 9. DUPLICATION & CONTRADICTION SCANNER
// ----------------------------------------------------------------------------
policyGovernanceRouter.post('/duplicate-check', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const docs = policyGovernanceEngine.getDocuments(tenantId);
    const result = policyDuplicationEngine.scanCatalogForDuplications(tenantId, docs as any);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 10. REGULATORY CHANGE IMPACT & REVIEW TASKS
// ----------------------------------------------------------------------------
policyGovernanceRouter.post('/regulatory-impact', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const docs = policyGovernanceEngine.getDocuments(tenantId);
    const assessment = policyRegulatoryImpactService.assessRegulatoryChangeImpact({
      tenantId,
      changeEvent: req.body.changeEvent,
      documents: docs
    });
    res.json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.get('/review-tasks', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const tasks = policyRegulatoryImpactService.getReviewTasks(tenantId);
  res.json({ success: true, count: tasks.length, data: tasks });
});

policyGovernanceRouter.post('/review-tasks/:id/complete', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const task = policyRegulatoryImpactService.completeReviewTask({
      taskId: req.params.id,
      closureDecision: req.body.closureDecision || 'Review completed with no structural amendments required.',
      actorEmail: actor.email
    });
    res.json({ success: true, data: task });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 11. REVIEW CALENDAR & AUDIT PACK
// ----------------------------------------------------------------------------
policyGovernanceRouter.get('/calendar', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const calendar = policyGovernanceEngine.evaluateReviewCalendar(tenantId);
  res.json({ success: true, count: calendar.length, data: calendar });
});

policyGovernanceRouter.get('/audit-pack', (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const pack = policyGovernanceEngine.assembleAuditorGovernancePack(tenantId);
  res.json({ success: true, data: pack });
});

policyGovernanceRouter.post('/audit-pack/verify', (req: Request, res: Response) => {
  try {
    const isValid = policyGovernanceEngine.verifyAuditorPackDigest(req.body);
    res.json({ success: true, isValid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 12. ENTERPRISE DOCUMENTATION ENGINE (TEMPLATES, MODELS, TAILORING, EXPORT)
// ----------------------------------------------------------------------------
policyGovernanceRouter.get('/documentation/catalogue', (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string | undefined,
      documentType: req.query.documentType as any,
      domain: req.query.domain as any,
      framework: req.query.framework as string | undefined,
      contentDepth: req.query.contentDepth as any,
      status: req.query.status as string | undefined
    };
    const catalogue = enterpriseDocumentationEngine.getCatalogue(filters);
    res.json({ success: true, count: catalogue.length, data: catalogue });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.get('/documentation/catalogue/:id', (req: Request, res: Response) => {
  try {
    const template = enterpriseDocumentationEngine.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: `Template '${req.params.id}' not found in catalogue.` });
    }
    res.json({ success: true, data: template });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documentation/catalogue/:id/generate', (req: Request, res: Response) => {
  try {
    const { mode, questionnaire, strict } = req.body;
    const templateId = req.params.id;
    const tenantId = getTenantId(req);

    const q = questionnaire ? { ...questionnaire, tenantId } : undefined;
    const doc = enterpriseDocumentationEngine.generateDocument(templateId, mode || 'MODEL', q, strict);
    doc.tenantId = tenantId;

    const scorecard = enterpriseDocumentationEngine.evaluateConsultingQuality(doc);
    res.json({ success: true, data: { document: doc, scorecard } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
policyGovernanceRouter.get('/documentation/templates', (_req: Request, res: Response) => {
  const templates = [
    enterpriseDocumentationEngine.getBlankPolicyTemplate(),
    enterpriseDocumentationEngine.getBlankProcedureTemplate()
  ];
  res.json({ success: true, count: templates.length, data: templates });
});

policyGovernanceRouter.get('/documentation/models', (_req: Request, res: Response) => {
  const models = [
    enterpriseDocumentationEngine.getModelInformationSecurityPolicy(),
    enterpriseDocumentationEngine.getModelUserAccessProcedure()
  ];
  res.json({ success: true, count: models.length, data: models });
});

policyGovernanceRouter.get('/documentation/models/:id', (req: Request, res: Response) => {
  const id = req.params.id.toUpperCase();
  if (id.includes('ISMS-POL-001') || id.includes('POL')) {
    return res.json({ success: true, data: enterpriseDocumentationEngine.getModelInformationSecurityPolicy() });
  }
  if (id.includes('ISMS-PROC-IAM-001') || id.includes('PROC') || id.includes('IAM')) {
    return res.json({ success: true, data: enterpriseDocumentationEngine.getModelUserAccessProcedure() });
  }
  res.status(404).json({ success: false, error: `Model sample ${req.params.id} not found.` });
});

policyGovernanceRouter.post('/documentation/tailor', (req: Request, res: Response) => {
  try {
    const { templateId, questionnaire, strict } = req.body;
    if (!questionnaire) {
      return res.status(400).json({ success: false, error: 'Organizational context questionnaire is required.' });
    }

    // Strict validation prevents fact fabrication by enforcing verified organizational facts
    if (strict) {
      const missingFields: string[] = [];
      if (!questionnaire.organizationProfile?.legalEntityName?.trim()) missingFields.push('organizationProfile.legalEntityName');
      if (!questionnaire.organizationProfile?.headquartersLocation?.trim()) missingFields.push('organizationProfile.headquartersLocation');
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `MISSING_QUESTIONNAIRE_DATA: Tailoring requires verified organizational facts. Missing mandatory fields: ${missingFields.join(', ')}`
        });
      }
    }

    let baseDoc = enterpriseDocumentationEngine.getModelUserAccessProcedure();
    if (templateId === 'TMPL-POL-BLANK' || templateId === 'POLICY') {
      baseDoc = enterpriseDocumentationEngine.getBlankPolicyTemplate();
    } else if (templateId === 'TMPL-PROC-BLANK' || templateId === 'PROCEDURE') {
      baseDoc = enterpriseDocumentationEngine.getBlankProcedureTemplate();
    } else if (templateId === 'ISMS-POL-001') {
      baseDoc = enterpriseDocumentationEngine.getModelInformationSecurityPolicy();
    }

    const tailored = enterpriseDocumentationEngine.tailorDocument(baseDoc, questionnaire);
    const scorecard = enterpriseDocumentationEngine.evaluateConsultingQuality(tailored);

    res.json({ success: true, data: { document: tailored, scorecard } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documentation/diff', (req: Request, res: Response) => {
  try {
    const { documentA, documentB } = req.body;
    if (!documentA || !documentB) {
      return res.status(400).json({ success: false, error: 'Both documentA and documentB are required for version comparison.' });
    }
    const diff = enterpriseDocumentationEngine.diffDocuments(documentA, documentB);
    res.json({ success: true, data: diff });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documentation/evaluate-quality', (req: Request, res: Response) => {
  try {
    const { document } = req.body;
    if (!document) {
      return res.status(400).json({ success: false, error: 'Document payload is required.' });
    }
    const scorecard = enterpriseDocumentationEngine.evaluateConsultingQuality(document);
    res.json({ success: true, data: scorecard });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documentation/promote-to-governance', (req: Request, res: Response) => {
  try {
    const { document } = req.body;
    if (!document) {
      return res.status(400).json({ success: false, error: 'Document payload is required.' });
    }
    const tenantId = getTenantId(req);
    const actor = getActor(req);

    // Cross-tenant tampering defense
    if (document.tenantId && document.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        error: `CROSS_TENANT_FORBIDDEN: Document tenant '${document.tenantId}' does not match authenticated session tenant '${tenantId}'.`
      });
    }
    document.tenantId = tenantId;

    // RBAC: Promotion to authoritative governance lifecycle requires governance role
    const authorizedRoles = ['CISO', 'GRC_LEAD', 'SECURITY_OFFICER', 'PLATFORM_ADMIN'];
    if (!authorizedRoles.includes(actor.role.toUpperCase())) {
      return res.status(403).json({
        success: false,
        error: `UNAUTHORIZED_PROMOTION: Role '${actor.role}' is not authorized to promote documents into the authoritative governance register. Required roles: ${authorizedRoles.join(', ')}`
      });
    }

    const govDoc = enterpriseDocumentationEngine.promoteToGovernanceDocument(
      document,
      actor.email,
      actor.role
    );
    res.status(201).json({ success: true, data: govDoc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documentation/export/markdown', (req: Request, res: Response) => {
  try {
    const { document } = req.body;
    const md = enterpriseDocumentationEngine.exportToMarkdown(document);
    res.json({ success: true, markdown: md });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documentation/export/html', (req: Request, res: Response) => {
  try {
    const { document } = req.body;
    const html = enterpriseDocumentationEngine.exportToPrintReadyHtml(document);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

policyGovernanceRouter.post('/documentation/export/docx', async (req: Request, res: Response) => {
  try {
    const { document } = req.body;
    const buffer = await enterpriseDocumentationEngine.exportToDocx(document);
    const filename = `${document?.metadata?.documentId || 'document'}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
