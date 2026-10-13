/**
 * SKANDA ENTERPRISE RISK INTELLIGENCE & CONTINUOUS RISK ASSURANCE OS
 * REST API Endpoints & Tenant-Isolated Routes
 */

import { Router, Request, Response } from 'express';
import { EnterpriseRiskIntelligenceEngine } from './services/regulatory/EnterpriseRiskIntelligenceEngine';

export const enterpriseRiskRouter = Router();
const riskEngine = EnterpriseRiskIntelligenceEngine.getInstance();

const getTenantId = (req: Request): string => {
  return (
    (req.headers['x-tenant-id'] as string) ||
    (req.query.tenantId as string) ||
    '11111111-1111-4111-8111-111111111111'
  );
};

// ============================================================================
// 1. RISK REGISTER & FILTERING
// ============================================================================

enterpriseRiskRouter.get('/register', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { category, status, outsideAppetiteOnly, velocity, businessServiceId, search } = req.query;

    const risks = riskEngine.getEnterpriseRisks(tenantId, {
      category: category as string,
      status: status as string,
      outsideAppetiteOnly: outsideAppetiteOnly === 'true',
      velocity: velocity as any,
      businessServiceId: businessServiceId as string,
      search: search as string
    });

    res.json({
      success: true,
      tenantId,
      totalCount: risks.length,
      data: risks
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2. EXECUTIVE RISK COMMAND CENTRE KPI SUMMARY
// ============================================================================

enterpriseRiskRouter.get('/summary', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const summary = riskEngine.getExecutiveCommandSummary(tenantId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 3. MASTER CATALOGS (BUSINESS SERVICES, THREATS, APPETITE)
// ============================================================================

enterpriseRiskRouter.get('/business-services', (req: Request, res: Response) => {
  try {
    const services = riskEngine.getBusinessServices();
    res.json({ success: true, count: services.length, data: services });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.get('/threat-scenarios', (req: Request, res: Response) => {
  try {
    const threats = riskEngine.getThreatScenarios();
    res.json({ success: true, count: threats.length, data: threats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.get('/appetite-thresholds', (req: Request, res: Response) => {
  try {
    const thresholds = riskEngine.getAppetiteThresholds();
    res.json({ success: true, count: thresholds.length, data: thresholds });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. RISK DETAIL & EXPLAINABILITY (SHOW ME WHY, WHAT CHANGED, NEXT ACTION)
// ============================================================================

enterpriseRiskRouter.get('/detail/:id', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const risk = riskEngine.getEnterpriseRiskById(tenantId, req.params.id);
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk record not found or tenant access denied.' });
    }
    res.json({ success: true, data: risk });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.get('/detail/:id/why', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const explanation = riskEngine.getShowMeWhy(tenantId, req.params.id);
    res.json({ success: true, data: explanation });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.get('/detail/:id/what-changed', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const whatChanged = riskEngine.getShowMeWhatChanged(tenantId, req.params.id);
    res.json({ success: true, data: whatChanged });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.get('/detail/:id/next-action', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const nextAction = riskEngine.getShowMeNextAction(tenantId, req.params.id);
    res.json({ success: true, data: nextAction });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 5. RISK CREATION & MUTATION
// ============================================================================

enterpriseRiskRouter.post('/create', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req.headers['x-user-id'] as string) || 'Lead Risk Architect';
    const newRisk = riskEngine.createRisk(tenantId, req.body, userId);
    res.status(201).json({ success: true, data: newRisk });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. EXECUTIVE RISK ACCEPTANCE (WITH SEGREGATION OF DUTIES)
// ============================================================================

enterpriseRiskRouter.post('/detail/:id/accept', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const result = riskEngine.processRiskAcceptance(tenantId, req.params.id, req.body);
    if (!result.success) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 7. EVENT-DRIVEN RECALCULATION
// ============================================================================

enterpriseRiskRouter.post('/events/trigger', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const eventPayload = {
      ...req.body,
      tenantId
    };
    const result = riskEngine.handleRecalculationEvent(eventPayload);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 8. AI RISK COPILOT
// ============================================================================

enterpriseRiskRouter.post('/copilot', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const query = {
      tenantId,
      userId: (req.headers['x-user-id'] as string) || 'USR-ANON',
      question: req.body.question,
      scopeRiskId: req.body.scopeRiskId,
      scopeBusinessServiceId: req.body.scopeBusinessServiceId,
      userRole: (req.headers['x-user-role'] as string) || 'CISO'
    };
    const response = riskEngine.askRiskCopilot(query);
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// PHASE 33: VALIDATION, CALIBRATION, TREATMENT & DECISION SUPPORT ENDPOINTS
// ============================================================================

// 9. REPLAY ENGINE
enterpriseRiskRouter.post('/replay/:snapshotId', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const replayReport = riskEngine.replayRiskAssessment(tenantId, req.params.snapshotId);
    res.json({ success: true, data: replayReport });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// 10. FAIR SENSITIVITY ANALYSIS
enterpriseRiskRouter.post('/sensitivity/:id', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { variable, range } = req.body;
    const result = riskEngine.runSensitivityAnalysis(tenantId, req.params.id, variable, range);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 11. TREATMENT RETEST VERIFICATION
enterpriseRiskRouter.post('/treatment/verify', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { treatmentId, verificationData } = req.body;
    const result = riskEngine.verifyTreatmentPlan(tenantId, treatmentId, verificationData);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 12. LIVE CONNECTOR MATURITY LEDGER
enterpriseRiskRouter.get('/connectors/maturity', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const maturityList = riskEngine.getLiveConnectorMaturity(tenantId);
    res.json({ success: true, count: maturityList.length, data: maturityList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. DEAD LETTER QUEUE & RETRIES
enterpriseRiskRouter.get('/dead-letter', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const dlq = riskEngine.getDeadLetterQueue(tenantId);
    res.json({ success: true, count: dlq.length, data: dlq });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.post('/dead-letter/:id/retry', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const result = riskEngine.retryDeadLetterEvent(tenantId, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 14. EXECUTIVE DECISION SUPPORT QUEUE & ACTIONS
enterpriseRiskRouter.get('/decision-queue', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const queue = riskEngine.getExecutiveDecisionQueue(tenantId);
    res.json({ success: true, count: queue.length, data: queue });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.post('/decision-queue/:id/action', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { action, decidedBy, justification } = req.body;
    const result = riskEngine.executeExecutiveDecision(tenantId, req.params.id, action, decidedBy || 'Chief Risk Officer', justification || 'Executive review action taken');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 15. RISK METHODOLOGY GOVERNANCE
enterpriseRiskRouter.get('/methodologies', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const methodologies = riskEngine.getMethodologies(tenantId);
    res.json({ success: true, count: methodologies.length, data: methodologies });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.get('/methodologies/:id', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const methodology = riskEngine.getMethodologyById(tenantId, req.params.id);
    if (!methodology) {
      return res.status(404).json({ success: false, error: 'Methodology not found' });
    }
    res.json({ success: true, data: methodology });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseRiskRouter.post('/methodologies/custom', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const newMethodology = riskEngine.registerCustomMethodology(tenantId, req.body);
    res.status(201).json({ success: true, data: newMethodology });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 16. PRODUCTION OBSERVABILITY & METRICS
enterpriseRiskRouter.get('/observability', (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const metrics = riskEngine.getObservabilityMetrics(tenantId);
    res.json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default enterpriseRiskRouter;

