// ============================================================================
// SKANDA ENTERPRISE GRC: SERVER-SIDE RBAC & OBJECT-LEVEL AUTHORIZATION
// Path: server/middleware/rbacMiddleware.ts
//
// Enforces granular permissions, role hierarchy, object-level tenancy checks,
// and optimistic concurrency validation across all GRC endpoints.
// ============================================================================

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Requires the user to possess at least one of the specified roles
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.tenantContext) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    const userRole = req.tenantContext.role.toUpperCase();
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === userRole || userRole === 'PLATFORM_ADMIN');

    if (!isAllowed) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Insufficient privileges. Required roles: [${allowedRoles.join(', ')}]. Current role: ${req.tenantContext.role}`,
        code: 'INSUFFICIENT_ROLE'
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Requires the user to hold a specific granular permission
 * Examples: 'risk.accept', 'control.manage', 'evidence.verify', 'soa.approve', 'exception.approve', 'capa.close'
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.tenantContext) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    const permissions = req.tenantContext.permissions || [];
    const hasPerm = permissions.includes(permission) || permissions.includes('admin.all') || req.tenantContext.isPlatformAdmin;

    if (!hasPerm) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Missing required permission '${permission}'.`,
        code: 'PERMISSION_DENIED',
        requiredPermission: permission
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Object-Level Authorization Check
 * Prevents cross-tenant access to specific resources.
 * If resource belongs to another tenant, returns 403 or intentionally indistinguishable 404.
 */
export function authorizeTenantObject(
  fetchObjectTenantId: (req: Request) => Promise<string | null | undefined> | string | null | undefined
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.tenantContext) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    if (req.tenantContext.isPlatformAdmin) {
      return next(); // Platform admin has cross-tenant audit authorization
    }

    try {
      const objectTenantId = await fetchObjectTenantId(req);

      if (objectTenantId === null || objectTenantId === undefined) {
        // Resource does not exist
        res.status(404).json({
          success: false,
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
        return;
      }

      if (objectTenantId !== req.tenantContext.tenantId) {
        // Object belongs to another tenant -> return 404 or 403 to prevent enumeration
        res.status(403).json({
          success: false,
          error: 'Access denied: You do not have permission to access or modify this tenant object.',
          code: 'CROSS_TENANT_OBJECT_FORBIDDEN'
        });
        return;
      }

      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Internal authorization evaluation error',
        code: 'AUTHZ_ERROR'
      });
    }
  };
}

/**
 * Middleware: Optimistic Concurrency Conflict Handler (HTTP 409)
 * Protects write operations against stale overwrite races.
 */
export function validateOptimisticVersion(
  getCurrentVersion: (req: Request) => Promise<number | null | undefined> | number | null | undefined
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientSuppliedVersion = req.body?.version;

    // If client provides a version, compare it against the current entity version
    if (clientSuppliedVersion !== undefined && typeof clientSuppliedVersion === 'number') {
      try {
        const currentVersion = await getCurrentVersion(req);
        if (currentVersion !== null && currentVersion !== undefined && currentVersion !== clientSuppliedVersion) {
          res.status(409).json({
            success: false,
            error: `Optimistic concurrency conflict: The resource has been updated by another user. Your version (${clientSuppliedVersion}) is stale. Current version: ${currentVersion}. Please refresh and retry.`,
            code: 'OPTIMISTIC_CONCURRENCY_CONFLICT',
            staleVersion: clientSuppliedVersion,
            currentVersion
          });
          return;
        }
      } catch (err: any) {
        // Continue if check fails
      }
    }

    next();
  };
}
