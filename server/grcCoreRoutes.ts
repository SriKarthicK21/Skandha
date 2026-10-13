import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { FrameworkLibrary } from '../src/services/grc/FrameworkLibrary';
import { UnifiedControlLibrary } from '../src/services/grc/UnifiedControlLibrary';
import { MappingExplorerEngine } from '../src/services/grc/MappingExplorerEngine';
import { ConfigurableRiskEngine } from '../src/services/grc/ConfigurableRiskEngine';
import { SmartEvidenceEngine } from '../src/services/grc/SmartEvidenceEngine';
import { AuditRemediationEngine } from '../src/services/grc/AuditRemediationEngine';
import { ExtendedGrcEngines } from '../src/services/grc/ExtendedGrcEngines';
import { NextBestActionEngine } from '../src/services/grc/NextBestActionEngine';

export const grcCoreRouter = Router();

// ==========================================
// 1. FRAMEWORKS & REQUIREMENTS
// ==========================================
grcCoreRouter.get('/frameworks', (_req: Request, res: Response) => {
  const frameworks = FrameworkLibrary.getAllFrameworks();
  res.json({ success: true, count: frameworks.length, data: frameworks });
});

grcCoreRouter.get('/frameworks/:code', (req: Request, res: Response) => {
  const fw = FrameworkLibrary.getFrameworkByCode(req.params.code);
  if (!fw) return res.status(404).json({ success: false, error: 'Framework not found' });
  res.json({ success: true, data: fw });
});

grcCoreRouter.get('/frameworks/:code/requirements', (req: Request, res: Response) => {
  const reqs = FrameworkLibrary.getRequirementsForFramework(req.params.code);
  res.json({ success: true, count: reqs.length, data: reqs });
});

// ==========================================
// 2. UNIFIED CONTROLS
// ==========================================
grcCoreRouter.get('/controls', (req: Request, res: Response) => {
  const { frameworkCode } = req.query;
  const controls = frameworkCode 
    ? UnifiedControlLibrary.getControlsForFramework(frameworkCode as string)
    : UnifiedControlLibrary.getAllControls();
  res.json({ success: true, count: controls.length, data: controls });
});

grcCoreRouter.get('/controls/:id', (req: Request, res: Response) => {
  const control = UnifiedControlLibrary.getControlById(req.params.id);
  if (!control) return res.status(404).json({ success: false, error: 'Control not found' });
  res.json({ success: true, data: control });
});

// ==========================================
// 3. CROSS-FRAMEWORK MAPPING & 360 GRAPH
// ==========================================
grcCoreRouter.get('/mapping/matrix', (_req: Request, res: Response) => {
  const matrix = MappingExplorerEngine.getHarmonizationMatrix();
  res.json({ success: true, count: matrix.length, data: matrix });
});

grcCoreRouter.get('/mapping/360/:entityId', (req: Request, res: Response) => {
  const { entityType } = req.query;
  const graph = MappingExplorerEngine.get360GraphForEntity(req.params.entityId, entityType as string);
  res.json({ success: true, data: graph });
});

// ==========================================
// 4. CONFIGURABLE RISK ENGINE
// ==========================================
grcCoreRouter.get('/risks', (req: Request, res: Response) => {
  const { dimension = '5x5' } = req.query;
  const risks = ConfigurableRiskEngine.getAllRisks();
  const matrixConfig = ConfigurableRiskEngine.getMatrixConfig(dimension as any);
  res.json({ success: true, matrixConfig, count: risks.length, data: risks });
});

grcCoreRouter.post('/risks', (req: Request, res: Response) => {
  try {
    const risk = req.body;
    const updated = ConfigurableRiskEngine.upsertRisk(risk);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. SMART EVIDENCE HUB
// ==========================================
grcCoreRouter.get('/evidence', (_req: Request, res: Response) => {
  const evidence = SmartEvidenceEngine.getAllEvidence();
  res.json({ success: true, count: evidence.length, data: evidence });
});

grcCoreRouter.post('/evidence/upload', (req: Request, res: Response) => {
  try {
    const { fileName, fileSize, fileType, snippet, owner } = req.body;
    const item = SmartEvidenceEngine.processSmartUpload(
      {
        name: fileName || 'uploaded_evidence.pdf',
        size: fileSize || 524288,
        type: fileType || 'application/pdf',
        contentSnippet: snippet
      },
      owner || 'CISO Office'
    );
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. AUDIT, ASSESSMENTS, FINDINGS & CAPA
// ==========================================
grcCoreRouter.get('/assessments', (_req: Request, res: Response) => {
  const assessments = AuditRemediationEngine.getAllAssessments();
  res.json({ success: true, count: assessments.length, data: assessments });
});

grcCoreRouter.get('/audits', (_req: Request, res: Response) => {
  const audits = AuditRemediationEngine.getAllAudits();
  res.json({ success: true, count: audits.length, data: audits });
});

grcCoreRouter.get('/findings', (_req: Request, res: Response) => {
  const findings = AuditRemediationEngine.getAllFindings();
  res.json({ success: true, count: findings.length, data: findings });
});

grcCoreRouter.get('/capa', (_req: Request, res: Response) => {
  const capas = AuditRemediationEngine.getAllCapas();
  res.json({ success: true, count: capas.length, data: capas });
});

grcCoreRouter.post('/capa/:id/verify', (req: Request, res: Response) => {
  const { status = 'EFFECTIVE_CLOSED', closureEvidenceId } = req.body;
  const updated = AuditRemediationEngine.updateCapaStatus(req.params.id, status, closureEvidenceId);
  if (!updated) return res.status(404).json({ success: false, error: 'CAPA not found' });
  res.json({ success: true, data: updated });
});

// ==========================================
// 7. CISO NEXT BEST ACTIONS
// ==========================================
grcCoreRouter.get('/next-best-actions', (_req: Request, res: Response) => {
  const actions = NextBestActionEngine.computeNextBestActions();
  res.json({ success: true, count: actions.length, data: actions });
});

// ==========================================
// 8. EXTENDED GRC (TPRM, Privacy, BIA, Policies, Vulns)
// ==========================================
grcCoreRouter.get('/tprm/vendors', (_req: Request, res: Response) => {
  res.json({ success: true, data: ExtendedGrcEngines.getVendors() });
});

grcCoreRouter.get('/privacy/ropa', (_req: Request, res: Response) => {
  res.json({ success: true, data: ExtendedGrcEngines.getPrivacyActivities() });
});

grcCoreRouter.get('/bia', (_req: Request, res: Response) => {
  res.json({ success: true, data: ExtendedGrcEngines.getBiaRecords() });
});

grcCoreRouter.get('/policies', (_req: Request, res: Response) => {
  res.json({ success: true, data: ExtendedGrcEngines.getPolicies() });
});

grcCoreRouter.get('/vulnerabilities', (_req: Request, res: Response) => {
  res.json({ success: true, data: ExtendedGrcEngines.getVulnerabilities() });
});
