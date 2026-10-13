// ============================================================================
// SKANDA Enterprise GRC — Phase 12 REST API Router
// Path: server/phase12ApiRoutes.ts
//
// Endpoints:
// 1. /api/v1/integrations           (Connector Management & Capabilities)
// 2. /api/v1/telemetry              (Ingestion Engine & Webhook Intake)
// 3. /api/v1/observations           (Normalized Telemetry Observations)
// 4. /api/v1/control-evaluations    (Continuous Control Testing & Drift)
// 5. /api/v1/evidence-harvesting    (Freshness & Automated Harvesting)
// 6. /api/v1/vendor-monitoring      (TPRM Automated Scanning & Risk)
// 7. /api/v1/scans                  (Authorized External Attack Surface Scans)
// ============================================================================

import { Router, Request, Response } from 'express';
import { telemetryIngestionPipeline } from './services/TelemetryIngestionPipeline';
import { TprmScanningService } from './services/TprmScanningService';
import { continuousComplianceEngine } from './services/ContinuousComplianceEngine';
import { GrcConnector, ConnectorStatus, TruthStatus } from '../src/types/telemetryTypes';

export const phase12Router = Router();
const tprmService = TprmScanningService.getInstance();

// ----------------------------------------------------------------------------
// 1. INTEGRATIONS & CONNECTOR MANAGEMENT (/api/v1/integrations)
// ----------------------------------------------------------------------------

phase12Router.get('/integrations', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const connectors = telemetryIngestionPipeline.getAllConnectors();

  const formatted: GrcConnector[] = connectors.map(c => {
    const creds = c.getCredentialConfig();
    return {
      id: c.id,
      tenantId,
      provider: c.provider,
      name: c.name,
      category: c.category,
      description: `${c.name} connector streaming over ${c.protocol}`,
      status: (creds.isConfigured ? 'CONNECTED' : 'NOT_CONFIGURED') as ConnectorStatus,
      truthStatus: c.truthStatus,
      endpointUrl: creds.endpointUrl,
      authType: creds.authType as any,
      roleArn: creds.roleArn,
      externalId: creds.externalId,
      clientId: creds.clientId,
      maskedSecret: creds.clientSecretMasked || creds.apiTokenMasked,
      isReadOnly: c.isReadOnly,
      syncFrequencyMinutes: creds.syncFrequencyMinutes || 15,
      recordsHarvestedTotal: creds.isConfigured ? 142 : 0,
      activeDriftCount: 0,
      permissionsRequired: c.getPermissions(),
      capabilities: c.getCapabilities(),
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    };
  });

  res.json({
    success: true,
    count: formatted.length,
    data: formatted
  });
});

phase12Router.get('/integrations/:connectorId', (req: Request, res: Response) => {
  const { connectorId } = req.params;
  const connector = telemetryIngestionPipeline.getConnector(connectorId);
  if (!connector) {
    res.status(404).json({ success: false, error: `Connector '${connectorId}' not found.` });
    return;
  }

  res.json({
    success: true,
    data: {
      id: connector.id,
      provider: connector.provider,
      name: connector.name,
      category: connector.category,
      protocol: connector.protocol,
      truthStatus: connector.truthStatus,
      capabilities: connector.getCapabilities(),
      permissions: connector.getPermissions(),
      credentials: connector.getCredentialConfig()
    }
  });
});

phase12Router.post('/integrations/:connectorId/test', async (req: Request, res: Response) => {
  const { connectorId } = req.params;
  const connector = telemetryIngestionPipeline.getConnector(connectorId);
  if (!connector) {
    res.status(404).json({ success: false, error: `Connector '${connectorId}' not found.` });
    return;
  }

  const result = await connector.validateConnection();
  res.json({ success: result.success, data: result });
});

phase12Router.post('/integrations/:connectorId/sync', async (req: Request, res: Response) => {
  const { connectorId } = req.params;
  const tenantId = (req.body.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const connector = telemetryIngestionPipeline.getConnector(connectorId);
  if (!connector) {
    res.status(404).json({ success: false, error: `Connector '${connectorId}' not found.` });
    return;
  }

  const syncResult = await connector.pullTelemetry(tenantId);
  res.json({ success: syncResult.success, data: syncResult });
});

phase12Router.post('/integrations/:connectorId/disconnect', async (req: Request, res: Response) => {
  const { connectorId } = req.params;
  const connector = telemetryIngestionPipeline.getConnector(connectorId);
  if (!connector) {
    res.status(404).json({ success: false, error: `Connector '${connectorId}' not found.` });
    return;
  }

  const result = await connector.disconnect();
  res.json({ success: result.success, message: result.message });
});

// ----------------------------------------------------------------------------
// 2. TELEMETRY INGESTION & WEBHOOKS (/api/v1/telemetry)
// ----------------------------------------------------------------------------

phase12Router.post('/telemetry/webhook/:connectorId', async (req: Request, res: Response) => {
  const { connectorId } = req.params;
  const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string) || 'tenant-acme';
  const signature = req.headers['x-hub-signature-256'] as string;
  const rawPayload = req.body;

  const result = await telemetryIngestionPipeline.ingestWebhookEvent(
    tenantId,
    connectorId,
    rawPayload,
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.status(202).json(result);
});

phase12Router.post('/telemetry/run-cycle', async (req: Request, res: Response) => {
  const tenantId = (req.body.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const triggerReason = req.body.reason || 'MANUAL_TRIGGER';

  const summary = await telemetryIngestionPipeline.executeIngestionCycle(tenantId, triggerReason);
  res.json({ success: true, data: summary });
});

phase12Router.get('/telemetry/summary', (req: Request, res: Response) => {
  const summary = telemetryIngestionPipeline.getLastRunSummary();
  res.json({ success: true, data: summary });
});

// ----------------------------------------------------------------------------
// 3. TELEMETRY OBSERVATIONS (/api/v1/observations)
// ----------------------------------------------------------------------------

phase12Router.get('/observations', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const source = req.query.source as string;
  const severity = req.query.severity as string;
  const status = req.query.status as string;

  let observations = telemetryIngestionPipeline.getObservationsForTenant(tenantId);

  if (source) {
    observations = observations.filter(o => o.sourceSystem.toLowerCase().includes(source.toLowerCase()));
  }
  if (severity) {
    observations = observations.filter(o => o.severity.toLowerCase() === severity.toLowerCase());
  }
  if (status) {
    observations = observations.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    count: observations.length,
    data: observations
  });
});

// ----------------------------------------------------------------------------
// 4. CONTROL EVALUATIONS & DRIFT (/api/v1/control-evaluations)
// ----------------------------------------------------------------------------

phase12Router.get('/control-evaluations', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const evaluations = continuousComplianceEngine.getEvaluationsForTenant(tenantId);

  res.json({
    success: true,
    count: evaluations.length,
    data: evaluations
  });
});

phase12Router.get('/control-evaluations/drift', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const driftEvents = continuousComplianceEngine.getDriftEventsForTenant(tenantId);

  res.json({
    success: true,
    count: driftEvents.length,
    data: driftEvents
  });
});

// ----------------------------------------------------------------------------
// 5. CONTINUOUS EVIDENCE HARVESTING (/api/v1/evidence-harvesting)
// ----------------------------------------------------------------------------

phase12Router.get('/evidence-harvesting/status', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const summary = continuousComplianceEngine.getSummaryForTenant(tenantId);

  res.json({
    success: true,
    data: {
      tenantId,
      freshnessScore: summary.surveillanceReadinessScore,
      freshnessTrend: '+2.4%',
      currentCount: summary.effectiveControlsCount,
      expiringSoonCount: summary.evidenceMissingCount,
      expiredCount: summary.evidenceExpiredCount,
      lastHarvestTimestamp: new Date().toISOString()
    }
  });
});

// ----------------------------------------------------------------------------
// 6. VENDOR MONITORING & TPRM (/api/v1/vendor-monitoring)
// ----------------------------------------------------------------------------

phase12Router.get('/vendor-monitoring/observations', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const observations = tprmService.getObservationsForTenant(tenantId);

  res.json({
    success: true,
    count: observations.length,
    data: observations
  });
});

phase12Router.post('/vendor-monitoring/authorize-domain', (req: Request, res: Response) => {
  const tenantId = (req.body.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const { domain, authorizedBy } = req.body;

  if (!domain || !authorizedBy) {
    res.status(400).json({ success: false, error: 'domain and authorizedBy are required.' });
    return;
  }

  const result = tprmService.authorizeDomain(tenantId, domain, authorizedBy);
  res.json(result);
});

// ----------------------------------------------------------------------------
// 7. EXTERNAL ATTACK SURFACE SCANS (/api/v1/scans)
// ----------------------------------------------------------------------------

phase12Router.post('/scans/execute', async (req: Request, res: Response) => {
  const tenantId = (req.body.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const { vendorId, vendorName, domain, authorizedBy, scanScope } = req.body;

  if (!vendorId || !domain || !authorizedBy) {
    res.status(400).json({
      success: false,
      error: 'vendorId, domain, and authorizedBy are mandatory parameters.'
    });
    return;
  }

  const result = await tprmService.executeVendorScan(
    tenantId,
    vendorId,
    vendorName || domain,
    domain,
    authorizedBy,
    scanScope || 'FULL_SURFACE'
  );

  res.json({
    success: result.job.status === 'COMPLETED',
    data: result
  });
});

phase12Router.get('/scans/jobs', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme';
  const jobs = tprmService.getScanJobsForTenant(tenantId);

  res.json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});
