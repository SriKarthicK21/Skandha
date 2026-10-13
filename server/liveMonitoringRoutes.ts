// ============================================================================
// SKANDA LIVE MONITORING API
// Path: server/liveMonitoringRoutes.ts
//
// Every route is tenant-scoped: the tenant identity comes from the verified JWT
// (authenticateTenant) and is never accepted from the request body, query string
// or inferred from a payload. Authorisation uses the platform's existing
// permission vocabulary.
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';
import { authenticateTenant, signJwtToken, getDefaultPermissionsForRole } from './middleware/authMiddleware.js';
import { requirePermission } from './middleware/rbacMiddleware.js';
import { liveMonitoringPipeline } from './services/liveMonitoring/LiveMonitoringPipeline.js';
import { GitHubMonitoringConnector, GITHUB_CONNECTOR_ID } from './connectors/GitHubMonitoringConnector.js';
import { IntegrationBinding } from './services/liveMonitoring/signalNormalization.js';
import { CONTROL_EVALUATION_RULES } from './services/liveMonitoring/controlEvaluationRules.js';

export const liveMonitoringRouter = Router();

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function asyncRoute(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

function requireTenant(req: Request, res: Response): string | null {
  const tenantId = req.tenantContext?.tenantId;
  if (!tenantId) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHENTICATED',
      message: 'A verified tenant identity is required for live monitoring operations.'
    });
    return null;
  }
  return tenantId;
}

function badRequest(res: Response, message: string, code = 'INVALID_REQUEST') {
  res.status(422).json({ success: false, error: code, message });
}

// ---------------------------------------------------------------------------
// DEVELOPMENT SESSION TOKEN
// ---------------------------------------------------------------------------

/**
 * Development-only helper so the workspace can authenticate against a local
 * server without an external identity provider. It is disabled in production.
 */
liveMonitoringRouter.post('/dev/session-token', (req: Request, res: Response) => {
  if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
    res.status(404).json({ success: false, error: 'Not found', code: 'NOT_FOUND' });
    return;
  }

  const { email, role, tenantId } = req.body || {};
  if (!email || !role || !tenantId) {
    badRequest(res, 'email, role and tenantId are required to mint a development session token.');
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

  res.json({ success: true, data: { token, expiresInSeconds: 3600, tenantId: String(tenantId), role: String(role) } });
});

// ---------------------------------------------------------------------------
// AUTHENTICATION BOUNDARY
//
// Everything registered below this line requires a verified JWT. The middleware
// is mounted after the development token route above so that route stays public,
// and before every protected route so that tenant identity can never be absent.
// ---------------------------------------------------------------------------
liveMonitoringRouter.use(authenticateTenant);

// ---------------------------------------------------------------------------
// PIPELINE STATUS & OVERVIEW  (dashboard reads authoritative records)
// ---------------------------------------------------------------------------

liveMonitoringRouter.get(
  '/health',
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const health = await liveMonitoringPipeline.healthCheck();
    res.json({
      success: true,
      data: {
        pipeline: 'LIVE_MONITORING',
        serviceHealth: health,
        storageType: await liveMonitoringPipeline.storageType(),
        checkedAt: new Date().toISOString()
      }
    });
  })
);

/**
 * The versioned rule registry, exposed so the workspace can show the expected
 * condition behind every verdict instead of presenting an unexplained status.
 */
liveMonitoringRouter.get(
  '/rules',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    res.json({
      success: true,
      count: CONTROL_EVALUATION_RULES.length,
      data: CONTROL_EVALUATION_RULES.map(rule => ({
        id: rule.id,
        version: rule.version,
        name: rule.name,
        controlCode: rule.controlCode,
        controlId: rule.controlId,
        frameworkCodes: rule.frameworkCodes,
        signalType: rule.appliesToSignalType,
        expectedCondition: rule.expectedCondition,
        failureExplanation: rule.failureExplanation,
        remediationGuidance: rule.remediationGuidance,
        failureSeverity: rule.failureSeverity,
        slaDays: rule.slaDays ?? null,
        pointInTimeObservation: rule.pointInTimeObservation,
        expectedValue: rule.expected ?? null
      }))
    });
  })
);

liveMonitoringRouter.get(
  '/overview',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const overview = await liveMonitoringPipeline.getOverview(tenantId);
    res.json({ success: true, data: overview });
  })
);

// ---------------------------------------------------------------------------
// INTEGRATIONS
// ---------------------------------------------------------------------------

liveMonitoringRouter.get(
  '/integrations',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const [integrations, health] = await Promise.all([
      liveMonitoringPipeline.listIntegrations(tenantId),
      liveMonitoringPipeline.listIntegrationHealth(tenantId)
    ]);
    res.json({ success: true, count: integrations.length, data: { integrations, health } });
  })
);

liveMonitoringRouter.post(
  '/integrations',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const { connectorId, provider, displayName, monitoringMode, pollIntervalSeconds, resourceScope, credentialReference } =
      req.body || {};

    if (!connectorId || !provider || !displayName) {
      badRequest(res, 'connectorId, provider and displayName are required to register an integration.');
      return;
    }

    const integration = await liveMonitoringPipeline.registerIntegration({
      tenantId,
      connectorId: String(connectorId),
      provider: String(provider),
      displayName: String(displayName),
      monitoringMode: (monitoringMode || 'SCHEDULED_POLLING') as any,
      capabilities: req.body?.capabilities ?? {
        supportsWebhookPush: false,
        supportsScheduledPolling: true,
        supportsIncrementalSync: false,
        supportsPagination: false,
        supportsAssetDiscovery: false,
        supportsConfigurationState: true,
        supportsVulnerabilityFeed: false,
        requestedScopes: []
      },
      credentialReference: credentialReference ? String(credentialReference) : undefined,
      grantedScopes: Array.isArray(req.body?.grantedScopes) ? req.body.grantedScopes.map(String) : [],
      resourceScope: Array.isArray(resourceScope) ? resourceScope.map(String) : [],
      pollIntervalSeconds: Number.isFinite(Number(pollIntervalSeconds)) ? Number(pollIntervalSeconds) : 900
    });

    res.status(201).json({ success: true, data: { integration } });
  })
);

liveMonitoringRouter.post(
  '/integrations/:integrationId/disconnect',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const result = await liveMonitoringPipeline.disconnectIntegration({
      tenantId,
      integrationId: String(req.params.integrationId),
      revokeCredential: req.body?.revokeCredential === true,
      reason: req.body?.reason ? String(req.body.reason) : 'Disconnected by operator.'
    });
    res.json({ success: true, data: result });
  })
);

// ---------------------------------------------------------------------------
// SIGNAL INGESTION
// ---------------------------------------------------------------------------

liveMonitoringRouter.get(
  '/signals',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const page = await liveMonitoringPipeline.listSignals(tenantId, {
      status: req.query.status ? (String(req.query.status) as any) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 50
    });
    res.json({ success: true, count: page.items.length, data: page });
  })
);

/**
 * Ingests one provider observation for a registered integration. The tenant is
 * derived from the authenticated context and the integration record; a tenant
 * identifier inside the payload is treated as untrusted data.
 */
liveMonitoringRouter.post(
  '/signals',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const { integrationId, providerEventId, providerEventType, resourceRef, resourceType, sourceObservedAt, severity, payload } =
      req.body || {};

    if (!integrationId || !providerEventType || !resourceRef) {
      badRequest(res, 'integrationId, providerEventType and resourceRef are required.');
      return;
    }

    const integration = await liveMonitoringPipeline.getIntegration(tenantId, String(integrationId));
    if (!integration) {
      res.status(404).json({
        success: false,
        error: 'INTEGRATION_NOT_FOUND',
        message: 'The integration does not exist for the authenticated tenant.'
      });
      return;
    }

    const binding: IntegrationBinding = {
      tenantId,
      integrationId: integration.id,
      connectorId: integration.connectorId,
      provider: integration.provider,
      resourceScope: integration.resourceScope,
      signatureVerification: 'NOT_APPLICABLE',
      receivedFromUntrustedChannel: false
    };

    const outcome = await liveMonitoringPipeline.ingestSignal({
      binding,
      input: {
        providerEventId: providerEventId ? String(providerEventId) : undefined,
        providerEventType: String(providerEventType),
        resourceRef: String(resourceRef),
        resourceType: resourceType ? String(resourceType) : undefined,
        sourceObservedAt: sourceObservedAt ? String(sourceObservedAt) : undefined,
        severity: severity ? String(severity) : undefined,
        payload
      }
    });

    if (!outcome.accepted) {
      res.status(422).json({ success: false, error: outcome.processingStatus, message: outcome.reason, data: outcome });
      return;
    }

    const processing = await liveMonitoringPipeline.processPendingJobs(tenantId, 10);
    res.status(201).json({ success: true, data: { outcome, processing } });
  })
);

// ---------------------------------------------------------------------------
// DURABLE JOBS, DEAD LETTERS AND REPLAY
// ---------------------------------------------------------------------------

liveMonitoringRouter.post(
  '/jobs/process',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const maxJobs = Number.isFinite(Number(req.body?.maxJobs)) ? Number(req.body.maxJobs) : 25;
    const summary = await liveMonitoringPipeline.processPendingJobs(tenantId, maxJobs);
    res.json({ success: true, data: summary });
  })
);

liveMonitoringRouter.get(
  '/dead-letters',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const records = await liveMonitoringPipeline.listDeadLetters(tenantId, req.query.limit ? Number(req.query.limit) : 100);
    res.json({ success: true, count: records.length, data: records });
  })
);

liveMonitoringRouter.post(
  '/dead-letters/:deadLetterId/replay',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const result = await liveMonitoringPipeline.replayDeadLetter({
      tenantId,
      deadLetterId: String(req.params.deadLetterId),
      actor: req.tenantContext?.email || 'unknown-operator'
    });
    res.status(result.replayed ? 200 : 409).json({ success: result.replayed, data: result });
  })
);

// ---------------------------------------------------------------------------
// CONTINUOUS STATE, DRIFT, FRESHNESS
// ---------------------------------------------------------------------------

liveMonitoringRouter.get(
  '/controls',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const states = await liveMonitoringPipeline.listStatesWithFilter(tenantId, {
      status: req.query.status ? String(req.query.status) : undefined,
      controlId: req.query.controlId ? String(req.query.controlId) : undefined
    });
    res.json({ success: true, count: states.length, data: states });
  })
);

liveMonitoringRouter.get(
  '/drift',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const transitions = await liveMonitoringPipeline.listTransitions(tenantId, {
      controlId: req.query.controlId ? String(req.query.controlId) : undefined,
      resourceRef: req.query.resourceRef ? String(req.query.resourceRef) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 100
    });
    res.json({ success: true, count: transitions.length, data: transitions });
  })
);

liveMonitoringRouter.get(
  '/freshness',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const freshness = await liveMonitoringPipeline.listFreshness(tenantId);
    res.json({ success: true, count: freshness.length, data: freshness });
  })
);

liveMonitoringRouter.post(
  '/freshness/sweep',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const result = await liveMonitoringPipeline.sweepFreshness(tenantId);
    res.json({ success: true, data: result });
  })
);

liveMonitoringRouter.post(
  '/reconcile',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const { ruleId, resourceRef, observedState } = req.body || {};
    if (!ruleId || !resourceRef) {
      badRequest(res, 'ruleId and resourceRef are required for a reconciliation request.');
      return;
    }
    const result = await liveMonitoringPipeline.enqueueReconciliation({
      tenantId,
      ruleId: String(ruleId),
      resourceRef: String(resourceRef),
      observedState: observedState ?? null
    });
    const processing = await liveMonitoringPipeline.processPendingJobs(tenantId, 5);
    res.status(202).json({ success: true, data: { ...result, processing } });
  })
);

// ---------------------------------------------------------------------------
// REMEDIATION, RETEST AND VERIFIED RECOVERY
// ---------------------------------------------------------------------------

liveMonitoringRouter.get(
  '/findings',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const links = await liveMonitoringPipeline.listFindingLinks(tenantId, {
      status: req.query.status ? String(req.query.status) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 100
    });
    res.json({ success: true, count: links.length, data: links });
  })
);

liveMonitoringRouter.post(
  '/findings/:dedupKey/retest',
  requirePermission('capa.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const result = await liveMonitoringPipeline.retestFinding({
      tenantId,
      dedupKey: String(req.params.dedupKey),
      observedState: req.body?.observedState ?? null,
      actor: req.tenantContext?.email || 'unknown-operator',
      trigger: 'RETEST'
    });
    res.json({ success: result.outcome === 'VERIFIED_RECOVERED', data: result });
  })
);

liveMonitoringRouter.post(
  '/findings/:dedupKey/close-without-verification',
  requirePermission('capa.close'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const justification = String(req.body?.justification || '');
    const result = await liveMonitoringPipeline.closeFindingUnverified({
      tenantId,
      dedupKey: String(req.params.dedupKey),
      actor: req.tenantContext?.email || 'unknown-operator',
      justification
    });
    res.status(result.closed ? 200 : 409).json({ success: result.closed, data: result });
  })
);

// ---------------------------------------------------------------------------
// GITHUB CONNECTOR (real provider interaction)
// ---------------------------------------------------------------------------

/**
 * Runs one authenticated (or explicitly anonymous) GitHub collection pass and
 * feeds the resulting observations through the canonical pipeline. Facts that
 * the credential cannot read remain UNKNOWN; nothing is fabricated.
 */
liveMonitoringRouter.post(
  '/connectors/github/collect',
  requirePermission('control.manage'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const { owner, repositories, tokenEnvVar, integrationId } = req.body || {};
    if (!owner || !Array.isArray(repositories)) {
      badRequest(res, 'owner and repositories[] are required to run a GitHub collection pass.');
      return;
    }

    const connector = new GitHubMonitoringConnector({
      owner: String(owner),
      repositories: repositories.map(String),
      tokenEnvVar: tokenEnvVar ? String(tokenEnvVar) : 'SKANDA_GITHUB_MONITORING_TOKEN'
    });

    let integration = integrationId
      ? await liveMonitoringPipeline.getIntegration(tenantId, String(integrationId))
      : await liveMonitoringPipeline.getIntegration(tenantId, GITHUB_CONNECTOR_ID);

    if (!integration) {
      integration = await liveMonitoringPipeline.registerIntegration({
        tenantId,
        connectorId: GITHUB_CONNECTOR_ID,
        provider: 'GITHUB',
        displayName: `GitHub — ${owner}`,
        monitoringMode: 'SCHEDULED_POLLING',
        capabilities: connector.getCapabilities() as any,
        credentialReference: connector.getConfigSummary().tokenEnvVar,
        grantedScopes: connector.requestedScopes,
        resourceScope: repositories.map(String),
        pollIntervalSeconds: 900,
        maturityState: connector.isAuthenticated() ? 'CONNECTED' : 'AUTHENTICATION_PENDING'
      });
    }

    const binding: IntegrationBinding = {
      tenantId,
      integrationId: integration.id,
      connectorId: integration.connectorId,
      provider: integration.provider,
      resourceScope: integration.resourceScope,
      signatureVerification: 'NOT_APPLICABLE',
      receivedFromUntrustedChannel: false
    };

    try {
      const collection = await connector.collect(integration.checkpoint as any);

      const outcomes = [];
      for (const signal of collection.signals) {
        outcomes.push(await liveMonitoringPipeline.ingestSignal({ binding, input: signal }));
      }

      await liveMonitoringPipeline.recordSyncSuccess({
        tenantId,
        integrationId: integration.id,
        checkpoint: collection.checkpoint as any,
        latencyMs: collection.latencyMs
      });

      const processing = await liveMonitoringPipeline.processPendingJobs(tenantId, 25);

      res.json({
        success: true,
        data: {
          integrationId: integration.id,
          authenticated: collection.authenticated,
          requests: collection.requests,
          signalsIngested: outcomes.filter(o => o.accepted && !o.duplicate).length,
          duplicatesSuppressed: outcomes.filter(o => o.duplicate).length,
          rejected: outcomes.filter(o => !o.accepted).length,
          unavailableFacts: collection.unavailableFacts,
          latencyMs: collection.latencyMs,
          processing
        }
      });
    } catch (err: any) {
      if (err?.name === 'GitHubRateLimitError') {
        await liveMonitoringPipeline.recordSyncFailure({ tenantId, integrationId: integration.id, error: err.message });
        res.status(429).json({
          success: false,
          error: 'PROVIDER_RATE_LIMITED',
          message: err.message,
          retryAfterMs: err.retryAfterMs
        });
        return;
      }
      if (err?.name === 'GitHubAuthenticationError') {
        await liveMonitoringPipeline.recordSyncFailure({
          tenantId,
          integrationId: integration.id,
          error: err.message,
          authenticationFailure: true
        });
        res.status(401).json({ success: false, error: 'AUTHENTICATION_FAILED', message: err.message });
        return;
      }
      await liveMonitoringPipeline.recordSyncFailure({ tenantId, integrationId: integration.id, error: err?.message || 'Collection failed.' });
      throw err;
    }
  })
);

liveMonitoringRouter.get(
  '/connectors/github/health',
  requirePermission('control.read'),
  asyncRoute(async (req, res) => {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;
    const connector = new GitHubMonitoringConnector({
      owner: req.query.owner ? String(req.query.owner) : '',
      tokenEnvVar: req.query.tokenEnvVar ? String(req.query.tokenEnvVar) : 'SKANDA_GITHUB_MONITORING_TOKEN'
    });
    const health = await connector.healthCheck();
    res.json({ success: true, data: { ...health, permissions: connector.getPermissions(), capabilities: connector.getCapabilities() } });
  })
);
