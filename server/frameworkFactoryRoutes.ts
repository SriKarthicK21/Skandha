/**
 * SKANDA Enterprise Framework Factory — API Router
 * Path: server/frameworkFactoryRoutes.ts
 * 
 * Endpoints:
 * GET  /api/v1/frameworks
 * GET  /api/v1/frameworks/:id
 * GET  /api/v1/frameworks/:id/versions
 * GET  /api/v1/frameworks/:id/requirements
 * GET  /api/v1/frameworks/:id/controls
 * GET  /api/v1/frameworks/:id/mappings
 * GET  /api/v1/frameworks/:id/applicability
 * GET  /api/v1/frameworks/:id/coverage
 * GET  /api/v1/frameworks/:id/changes
 * GET  /api/v1/frameworks/:id/assurance
 * POST /api/v1/frameworks/import
 * POST /api/v1/frameworks/:id/assess
 * POST /api/v1/frameworks/compare
 * POST /api/v1/frameworks/:id/migrate
 * GET  /api/v1/frameworks/recommendations
 * GET  /api/v1/frameworks/bundles
 * GET  /api/v1/frameworks/impact-map
 * POST /api/v1/frameworks/ai-copilot
 */

import { Router, Request, Response } from 'express';
import { FrameworkFactoryEngine } from './services/regulatory/FrameworkFactoryEngine';
import { TenantProfileForApplicability } from '../src/types/frameworkFactoryTypes';

export const frameworkFactoryRouter = Router();
const engine = FrameworkFactoryEngine.getInstance();

function resolveTenantId(req: Request): string {
  const headerTenant = req.headers['x-tenant-id'] as string;
  const queryTenant = req.query.tenantId as string;
  return headerTenant || queryTenant || (req as any).user?.tenantId || 'tenant-default';
}

// 1. GET /api/v1/frameworks - List and filter framework catalog
frameworkFactoryRouter.get('/', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const { jurisdiction, industry, type, maturityLevel, search, isCustom } = req.query;

  const frameworks = engine.listFrameworks({
    jurisdiction: jurisdiction as string,
    industry: industry as string,
    type: type as string,
    maturityLevel: maturityLevel as string,
    search: search as string,
    tenantId,
    isCustom: isCustom === 'true' ? true : isCustom === 'false' ? false : undefined
  });

  res.json({
    success: true,
    count: frameworks.length,
    frameworks
  });
});

// 2. GET /api/v1/frameworks/bundles - List framework bundles
frameworkFactoryRouter.get('/bundles', (req: Request, res: Response) => {
  const { category } = req.query;
  const bundles = engine.getBundles(category as string);
  res.json({
    success: true,
    count: bundles.length,
    bundles
  });
});

// 3. GET /api/v1/frameworks/recommendations - Dynamic framework recommendations
frameworkFactoryRouter.get('/recommendations', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const profile: TenantProfileForApplicability = {
    tenantId,
    country: (req.query.country as string) || 'SG',
    jurisdictions: req.query.jurisdictions ? (req.query.jurisdictions as string).split(',') : ['SINGAPORE', 'EU', 'US', 'INDIA'],
    industry: req.query.industry ? (req.query.industry as string).split(',') : ['FINTECH', 'SAAS', 'BANKING'],
    businessModel: (req.query.businessModel as any) || 'FINTECH_BANKING',
    companySize: 'ENTERPRISE',
    employeeCount: 250,
    dataTypesHandled: ['PERSONAL_DATA', 'FINANCIAL_RECORDS', 'PAYMENT_CARD_DATA'],
    usesAI: true,
    aiSystemClassification: 'HIGH_RISK_EU_AI_ACT',
    usesCloud: true,
    cloudProviders: ['AWS', 'AZURE'],
    processesPayments: true,
    handlesHealthcare: false,
    hasBankingLicense: true,
    customerContractRequirements: ['SOC 2', 'ISO 27001'],
    regulatoryLicenses: ['MAS Major Payment Institution']
  };

  const results = engine.evaluateApplicability(profile);
  res.json({
    success: true,
    count: results.length,
    recommendations: results
  });
});

// 4. GET /api/v1/frameworks/impact-map - Regulatory change impact map
frameworkFactoryRouter.get('/impact-map', (req: Request, res: Response) => {
  const changes = engine.getRecentChanges();
  res.json({
    success: true,
    count: changes.length,
    changes
  });
});

// 5. POST /api/v1/frameworks/compare - Side-by-side framework comparison
frameworkFactoryRouter.post('/compare', (req: Request, res: Response) => {
  const { frameworkACode, frameworkBCode } = req.body;
  if (!frameworkACode || !frameworkBCode) {
    return res.status(400).json({ success: false, error: 'Both frameworkACode and frameworkBCode are required.' });
  }

  const comparison = engine.compareFrameworks(frameworkACode, frameworkBCode);
  if (!comparison) {
    return res.status(404).json({ success: false, error: 'Comparison matrix not found for the specified pair.' });
  }

  res.json({
    success: true,
    comparison
  });
});

// 6. POST /api/v1/frameworks/ai-copilot - Grounded AI Copilot query
frameworkFactoryRouter.post('/ai-copilot', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const { query, frameworkCodes } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query string is required.' });
  }

  const response = engine.queryCopilot({
    tenantId,
    query,
    frameworkCodes
  });

  res.json({
    success: true,
    copilotResponse: response
  });
});

// 7. POST /api/v1/frameworks/import - Framework Ingestion Factory
frameworkFactoryRouter.post('/import', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const job = engine.submitIngestionJob(req.body);

  res.json({
    success: true,
    message: 'Framework ingestion job submitted successfully into stage pipeline.',
    job
  });
});

// 8. GET /api/v1/frameworks/:id - Framework Detail
frameworkFactoryRouter.get('/:id', (req: Request, res: Response) => {
  const fw = engine.getFrameworkById(req.params.id) || engine.getFrameworkByCode(req.params.id);
  if (!fw) {
    return res.status(404).json({ success: false, error: `Framework ${req.params.id} not found.` });
  }

  res.json({
    success: true,
    framework: fw
  });
});

// 9. GET /api/v1/frameworks/:id/requirements - Framework Requirements
frameworkFactoryRouter.get('/:id/requirements', (req: Request, res: Response) => {
  const { sectionId } = req.query;
  const reqs = engine.getFrameworkRequirements(req.params.id, sectionId as string);
  const sections = engine.getFrameworkSections(req.params.id);

  res.json({
    success: true,
    count: reqs.length,
    sectionsCount: sections.length,
    sections,
    requirements: reqs
  });
});

// 10. GET /api/v1/frameworks/:id/controls - Canonical Controls Mapped
frameworkFactoryRouter.get('/:id/controls', (req: Request, res: Response) => {
  const fw = engine.getFrameworkById(req.params.id) || engine.getFrameworkByCode(req.params.id);
  if (!fw) {
    return res.status(404).json({ success: false, error: `Framework ${req.params.id} not found.` });
  }

  const allControls = engine.getCanonicalControls();
  const mappedControls = allControls.filter(c => c.supportedFrameworks.includes(fw.frameworkCode));

  res.json({
    success: true,
    count: mappedControls.length,
    controls: mappedControls
  });
});

// 11. GET /api/v1/frameworks/:id/mappings - Cross-Framework Mappings
frameworkFactoryRouter.get('/:id/mappings', (req: Request, res: Response) => {
  const mappings = engine.getCrossFrameworkMappings({ frameworkCode: req.params.id });
  res.json({
    success: true,
    count: mappings.length,
    mappings
  });
});

// 12. GET /api/v1/frameworks/:id/applicability - Framework Applicability
frameworkFactoryRouter.get('/:id/applicability', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  const profile: TenantProfileForApplicability = {
    tenantId,
    country: (req.query.country as string) || 'SG',
    jurisdictions: ['SINGAPORE', 'EU', 'US', 'INDIA'],
    industry: ['FINTECH', 'SAAS'],
    businessModel: 'FINTECH_BANKING',
    companySize: 'ENTERPRISE',
    employeeCount: 200,
    dataTypesHandled: ['PERSONAL_DATA', 'FINANCIAL_RECORDS', 'PAYMENT_CARD_DATA'],
    usesAI: true,
    usesCloud: true,
    cloudProviders: ['AWS'],
    processesPayments: true,
    handlesHealthcare: false,
    hasBankingLicense: true,
    customerContractRequirements: ['SOC 2', 'ISO 27001'],
    regulatoryLicenses: ['MAS MPI']
  };

  const all = engine.evaluateApplicability(profile);
  const matched = all.find(r => r.frameworkId === req.params.id || r.frameworkCode === req.params.id);

  res.json({
    success: true,
    applicability: matched || { isApplicable: false, applicabilityReason: 'Not evaluated' }
  });
});

// 13. GET /api/v1/frameworks/:id/coverage - Framework Automation & Evidence Coverage
frameworkFactoryRouter.get('/:id/coverage', (req: Request, res: Response) => {
  const fw = engine.getFrameworkById(req.params.id) || engine.getFrameworkByCode(req.params.id);
  if (!fw) {
    return res.status(404).json({ success: false, error: `Framework ${req.params.id} not found.` });
  }

  res.json({
    success: true,
    frameworkCode: fw.frameworkCode,
    maturityLevel: fw.maturityLevel,
    coverage: {
      evidenceCoveragePercent: fw.evidenceCoveragePercent,
      automationCoveragePercent: fw.automationCoveragePercent,
      assuranceCoveragePercent: fw.assuranceCoveragePercent,
      totalRequirementsCount: fw.totalRequirementsCount,
      mappedControlsCount: fw.mappedControlsCount,
      automatedChecksCount: fw.automatedChecksCount
    }
  });
});

// 14. GET /api/v1/frameworks/:id/changes - Framework Change History
frameworkFactoryRouter.get('/:id/changes', (req: Request, res: Response) => {
  const fw = engine.getFrameworkById(req.params.id) || engine.getFrameworkByCode(req.params.id);
  const allChanges = engine.getRecentChanges();
  const fwChanges = fw ? allChanges.filter(c => c.frameworkCode === fw.frameworkCode) : allChanges;

  res.json({
    success: true,
    count: fwChanges.length,
    changes: fwChanges
  });
});

// 15. GET /api/v1/frameworks/:id/assurance - Framework Continuous Assurance & Gap Assessment
frameworkFactoryRouter.get('/:id/assurance', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  try {
    const assessment = engine.assessFrameworkGaps(tenantId, req.params.id);
    res.json({
      success: true,
      assessment: assessment.summary,
      requirementGaps: assessment.requirementGaps
    });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// 16. POST /api/v1/frameworks/:id/assess - Trigger Framework Assessment
frameworkFactoryRouter.post('/:id/assess', (req: Request, res: Response) => {
  const tenantId = resolveTenantId(req);
  try {
    const assessment = engine.assessFrameworkGaps(tenantId, req.params.id);
    res.json({
      success: true,
      message: `Framework assessment completed for ${req.params.id}`,
      assessment: assessment.summary,
      requirementGaps: assessment.requirementGaps
    });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// 17. POST /api/v1/frameworks/:id/migrate - Framework Version Migration Plan
frameworkFactoryRouter.post('/:id/migrate', (req: Request, res: Response) => {
  const plans = engine.getMigrationPlans();
  const plan = plans.find(p => p.sourceFrameworkCode === req.params.id || p.targetFrameworkCode === req.params.id || p.migrationId === req.params.id);

  if (!plan) {
    return res.status(404).json({ success: false, error: `Migration plan for ${req.params.id} not found.` });
  }

  res.json({
    success: true,
    migrationPlan: plan
  });
});
