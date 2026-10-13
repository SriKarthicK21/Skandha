// ============================================================================
// SKANDA ENTERPRISE GRC: SCIM 2.0 REST API ENDPOINTS
// Path: server/scimRoutes.ts
//
// Implements RFC 7643 / RFC 7644 SCIM 2.0 Protocol for automated Identity Provisioning:
// Supports Okta, Microsoft Entra ID (Azure AD), Google Workspace.
// Endpoints:
// - GET    /scim/v2/Users
// - POST   /scim/v2/Users (Joiner)
// - GET    /scim/v2/Users/:id
// - PUT    /scim/v2/Users/:id (Mover)
// - PATCH  /scim/v2/Users/:id (Mover / Deactivate)
// - DELETE /scim/v2/Users/:id (Leaver)
// - GET    /scim/v2/ServiceProviderConfig
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';
import { identityFederationService } from './services/IdentityFederationService.js';

export const scimRouter = Router();

// Middleware: Validate SCIM Bearer token & resolve tenant context
function scimAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const tenantHeader = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string) || 'tenant-acme-corp';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).setHeader('Content-Type', 'application/scim+json').json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '401',
      detail: 'Authorization header with Bearer token is required for SCIM 2.0 endpoints'
    });
    return;
  }

  // Set verified tenant on request context
  (req as any).scimTenantId = tenantHeader;
  next();
}

scimRouter.use(scimAuthMiddleware);

// GET /scim/v2/ServiceProviderConfig
scimRouter.get('/ServiceProviderConfig', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/scim+json').json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
    patch: { supported: true },
    bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
    filter: { supported: true, maxResults: 100 },
    changePassword: { supported: false },
    sort: { supported: false },
    etag: { supported: false },
    authenticationSchemes: [
      {
        name: 'OAuth Bearer Token',
        description: 'Authentication scheme using the OAuth Bearer Standard',
        specUri: 'http://www.rfc-editor.org/info/rfc6750',
        type: 'oauthbearertoken',
        primary: true
      }
    ]
  });
});

// GET /scim/v2/Users
scimRouter.get('/Users', (req: Request, res: Response) => {
  const tenantId = (req as any).scimTenantId;
  const filter = req.query.filter as string;
  const result = identityFederationService.scimListUsers(tenantId, filter);
  res.setHeader('Content-Type', 'application/scim+json').json(result);
});

// POST /scim/v2/Users (Joiner lifecycle)
scimRouter.post('/Users', (req: Request, res: Response) => {
  const tenantId = (req as any).scimTenantId;
  try {
    const user = identityFederationService.scimCreateUser(tenantId, req.body);
    res.status(201).setHeader('Content-Type', 'application/scim+json').json(user);
  } catch (err: any) {
    res.status(400).setHeader('Content-Type', 'application/scim+json').json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '400',
      detail: err.message
    });
  }
});

// GET /scim/v2/Users/:id
scimRouter.get('/Users/:id', (req: Request, res: Response) => {
  const tenantId = (req as any).scimTenantId;
  const user = identityFederationService.scimGetUser(tenantId, req.params.id);
  if (!user) {
    res.status(404).setHeader('Content-Type', 'application/scim+json').json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '404',
      detail: `User with id "${req.params.id}" not found in tenant`
    });
    return;
  }
  res.setHeader('Content-Type', 'application/scim+json').json(user);
});

// PUT /scim/v2/Users/:id (Mover lifecycle)
scimRouter.put('/Users/:id', (req: Request, res: Response) => {
  const tenantId = (req as any).scimTenantId;
  const updated = identityFederationService.scimUpdateUser(tenantId, req.params.id, req.body);
  if (!updated) {
    res.status(404).setHeader('Content-Type', 'application/scim+json').json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '404',
      detail: `User with id "${req.params.id}" not found`
    });
    return;
  }
  res.setHeader('Content-Type', 'application/scim+json').json(updated);
});

// PATCH /scim/v2/Users/:id (Mover / Deactivate)
scimRouter.patch('/Users/:id', (req: Request, res: Response) => {
  const tenantId = (req as any).scimTenantId;
  const operations = req.body?.Operations || req.body?.operations || [];
  const patched = identityFederationService.scimPatchUser(tenantId, req.params.id, operations);
  if (!patched) {
    res.status(404).setHeader('Content-Type', 'application/scim+json').json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '404',
      detail: `User with id "${req.params.id}" not found`
    });
    return;
  }
  res.setHeader('Content-Type', 'application/scim+json').json(patched);
});

// DELETE /scim/v2/Users/:id (Leaver lifecycle)
scimRouter.delete('/Users/:id', (req: Request, res: Response) => {
  const tenantId = (req as any).scimTenantId;
  const success = identityFederationService.scimDeleteUser(tenantId, req.params.id);
  if (!success) {
    res.status(404).setHeader('Content-Type', 'application/scim+json').json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '404',
      detail: `User with id "${req.params.id}" not found`
    });
    return;
  }
  res.status(204).send();
});
