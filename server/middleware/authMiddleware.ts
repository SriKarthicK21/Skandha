// ============================================================================
// SKANDA ENTERPRISE GRC: SERVER-SIDE JWT & TENANT CONTEXT MIDDLEWARE
// Path: server/middleware/authMiddleware.ts
//
// Eliminates client-supplied tenant authority (headers/query parameters).
// Enforces cryptographic JWT verification (HMAC-SHA256, Issuer, Audience, Expiry),
// extracts authenticated tenant context, and establishes secure session isolation.
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { isSessionActive } from '../services/AuthSessionService.js';

export interface TenantSecurityContext {
  userId: string;
  email: string;
  tenantId: string;
  orgId: string;
  role: string;
  permissions: string[];
  isPlatformAdmin: boolean;
  tokenIssuedAt: number;
  tokenExpiresAt: number;
}

// Extend Express Request interface to include tenantContext
declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantSecurityContext;
      user?: {
        id: string;
        email: string;
        role: string;
        tenantId: string;
      };
    }
  }
}

// Secret Configuration
//
// PRODUCTION RULE: there is deliberately no hardcoded signing key. A baked-in
// default lets anyone who reads the source forge an administrative token for
// any tenant, so when NODE_ENV=production the process refuses to start unless
// an operator-supplied JWT_SECRET (>= 32 chars) is present.
//
// DEV/TEST: the secret is generated once per checkout and persisted to
// data/.dev-jwt-secret (0600) so tokens survive restarts and separate test
// processes agree on the key, while never being a shared, guessable literal.
const JWT_ISSUER = process.env.JWT_ISSUER || 'skanda-grc-auth';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'skanda-grc-api';
const MIN_SECRET_LENGTH = 32;

function resolveJwtSecret(): string {
  const configured = process.env.JWT_SECRET;
  if (configured && configured.length >= MIN_SECRET_LENGTH) {
    return configured;
  }
  if (process.env.NODE_ENV === 'production') {
    if (!configured) {
      throw new Error(
        'FATAL: JWT_SECRET is not set. Refusing to boot in production without an ' +
        'operator-managed signing secret (generate 32+ random bytes).'
      );
    }
    throw new Error(
      `FATAL: JWT_SECRET is only ${configured.length} characters; ` +
      `production requires at least ${MIN_SECRET_LENGTH}.`
    );
  }
  if (configured) {
    console.warn('[auth] JWT_SECRET is shorter than 32 characters; acceptable for development only.');
    return configured;
  }
  return persistDevSecret();
}

function persistDevSecret(): string {
  try {
    const dir = path.resolve(process.cwd(), 'data');
    const file = path.join(dir, '.dev-jwt-secret');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(file)) {
      const existing = fs.readFileSync(file, 'utf8').trim();
      if (existing.length >= MIN_SECRET_LENGTH) return existing;
    }
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(file, generated, { mode: 0o600 });
    console.warn('[auth] Generated a development-only JWT secret at data/.dev-jwt-secret. Never use in production.');
    return generated;
  } catch {
    // Read-only or exotic filesystem: fall back to a process-local secret.
    return crypto.randomBytes(48).toString('hex');
  }
}

const JWT_SECRET = resolveJwtSecret();

// Base64Url helpers
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Signs a standard JWT with HMAC-SHA256
 */
export function signJwtToken(
  payload: {
    userId: string;
    email: string;
    tenantId: string;
    orgId?: string;
    role: string;
    permissions?: string[];
  },
  expiresInSeconds: number = 3600, // 1 hour default
  options?: { sid?: string } // revocable session id
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const claims = {
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    sub: payload.userId,
    email: payload.email,
    tenantId: payload.tenantId,
    orgId: payload.orgId || 'org_primary',
    role: payload.role,
    permissions: payload.permissions || getDefaultPermissionsForRole(payload.role),
    iat: now,
    nbf: now - 5, // 5s clock skew allowance
    exp: now + expiresInSeconds,
    ...(options?.sid ? { sid: options.sid } : {})
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaims = base64UrlEncode(JSON.stringify(claims));
  const signatureInput = `${encodedHeader}.${encodedClaims}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

/**
 * Cryptographically verifies JWT signature, issuer, audience, and expiry
 */
export function verifyJwtToken(token: string): { valid: boolean; claims?: any; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const [encodedHeader, encodedClaims, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedClaims}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      return { valid: false, error: 'Cryptographic signature verification failed' };
    }

    const header = JSON.parse(base64UrlDecode(encodedHeader));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return { valid: false, error: 'Unsupported JWT algorithm or format' };
    }

    const claims = JSON.parse(base64UrlDecode(encodedClaims));
    const now = Math.floor(Date.now() / 1000);

    // Validate Issuer
    if (claims.iss !== JWT_ISSUER) {
      return { valid: false, error: `Invalid issuer: expected ${JWT_ISSUER}` };
    }

    // Validate Audience
    if (claims.aud !== JWT_AUDIENCE) {
      return { valid: false, error: `Invalid audience: expected ${JWT_AUDIENCE}` };
    }

    // Validate Expiry
    if (claims.exp && claims.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    // Validate Not Before
    if (claims.nbf && claims.nbf > now) {
      return { valid: false, error: 'Token not yet valid' };
    }

    return { valid: true, claims };
  } catch (err: any) {
    return { valid: false, error: `Token parsing error: ${err.message}` };
  }
}

/**
 * Questionnaire Intelligence permissions, layered onto the baseline role map.
 *
 * Approval authority is deliberately narrower than authoring authority: the
 * actor that drafts or edits response wording does not automatically obtain
 * `questionnaire.approve`, and external disclosure (`questionnaire.disclose`)
 * is limited to accountable roles.
 */
export function getQuestionnairePermissionsForRole(role: string): string[] {
  const normalizedRole = role.toUpperCase();
  const READ = ['questionnaire.read'];
  const AUTHORING = [...READ, 'questionnaire.import', 'questionnaire.mapping', 'questionnaire.analyze', 'questionnaire.review'];
  const FULL = [...AUTHORING, 'questionnaire.approve', 'questionnaire.export', 'questionnaire.library.manage', 'questionnaire.orgfacts.manage'];

  switch (normalizedRole) {
    case 'PLATFORM_ADMIN':
    case 'PLATFORM ADMIN':
      return [...FULL, 'questionnaire.disclose'];
    case 'CISO':
    case 'TENANT_ADMIN':
    case 'TENANT ADMIN':
      return [...FULL, 'questionnaire.disclose'];
    case 'GRC_MANAGER':
    case 'GRC MANAGER':
    case 'COMPLIANCE_MANAGER':
    case 'COMPLIANCE MANAGER':
      return FULL;
    case 'RISK_OWNER':
    case 'RISK OWNER':
    case 'CONTROL_OWNER':
    case 'CONTROL OWNER':
      // Contributors may prepare and submit responses but not approve them.
      return AUTHORING;
    case 'AUDITOR':
    case 'READ_ONLY':
    case 'READ ONLY':
    case 'EXECUTIVE':
    default:
      return READ;
  }
}

/**
 * Maps standard enterprise GRC roles to baseline granular permissions
 */
export function getDefaultPermissionsForRole(role: string): string[] {
  const base = getBasePermissionsForRole(role);
  return Array.from(new Set([...base, ...getQuestionnairePermissionsForRole(role)]));
}

function getBasePermissionsForRole(role: string): string[] {
  const normalizedRole = role.toUpperCase();
  switch (normalizedRole) {
    case 'PLATFORM_ADMIN':
    case 'PLATFORM ADMIN':
      return [
        'tenant.manage', 'tenant.read',
        'risk.read', 'risk.create', 'risk.update', 'risk.accept',
        'control.read', 'control.manage', 'control.test',
        'evidence.read', 'evidence.upload', 'evidence.verify',
        'audit.read', 'audit.manage',
        'capa.read', 'capa.manage', 'capa.close',
        'soa.read', 'soa.approve',
        'exception.create', 'exception.approve',
        'report.read', 'report.export', 'admin.all'
      ];
    case 'CISO':
    case 'TENANT_ADMIN':
    case 'TENANT ADMIN':
      return [
        'risk.read', 'risk.create', 'risk.update', 'risk.accept',
        'control.read', 'control.manage', 'control.test',
        'evidence.read', 'evidence.upload', 'evidence.verify',
        'audit.read', 'audit.manage',
        'capa.read', 'capa.manage', 'capa.close',
        'soa.read', 'soa.approve',
        'exception.create', 'exception.approve',
        'report.read', 'report.export'
      ];
    case 'GRC_MANAGER':
    case 'GRC MANAGER':
    case 'COMPLIANCE_MANAGER':
    case 'COMPLIANCE MANAGER':
      return [
        'risk.read', 'risk.create', 'risk.update',
        'control.read', 'control.manage', 'control.test',
        'evidence.read', 'evidence.upload', 'evidence.verify',
        'audit.read', 'audit.manage',
        'capa.read', 'capa.manage', 'capa.close',
        'soa.read',
        'exception.create',
        'report.read', 'report.export'
      ];
    case 'RISK_OWNER':
    case 'RISK OWNER':
      return [
        'risk.read', 'risk.create', 'risk.update',
        'control.read',
        'evidence.read', 'evidence.upload',
        'capa.read', 'capa.manage',
        'exception.create',
        'report.read'
      ];
    case 'CONTROL_OWNER':
    case 'CONTROL OWNER':
      return [
        'risk.read',
        'control.read', 'control.manage', 'control.test',
        'evidence.read', 'evidence.upload',
        'capa.read', 'capa.manage',
        'exception.create',
        'report.read'
      ];
    case 'AUDITOR':
      return [
        'risk.read',
        'control.read',
        'evidence.read', 'evidence.verify',
        'audit.read',
        'capa.read',
        'soa.read',
        'report.read', 'report.export'
      ];
    case 'READ_ONLY':
    case 'READ ONLY':
    case 'EXECUTIVE':
    default:
      return [
        'risk.read',
        'control.read',
        'evidence.read',
        'audit.read',
        'capa.read',
        'soa.read',
        'report.read'
      ];
  }
}

/**
 * Returns the revocable session id carried by a token, but only after the
 * token itself has been cryptographically verified.
 */
export function getSessionIdFromToken(token: string): string | undefined {
  const verification = verifyJwtToken(token);
  if (!verification.valid || !verification.claims) return undefined;
  return typeof verification.claims.sid === 'string' ? verification.claims.sid : undefined;
}

/**
 * Server-Side Authentication & Tenant Context Middleware
 * Enforces cryptographic token validation and extracts tenant claims.
 * Completely blocks any client attempt to spoof tenant via x-tenant-id or query params.
 */
export function authenticateTenant(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Development-only escape hatch. Previously this fired whenever NODE_ENV
    // was merely *unset*, which silently allowed any anonymous caller to pick
    // an arbitrary tenant with one public header. It now requires an explicit
    // operator opt-in AND a non-production runtime, and is unreachable in
    // production regardless of configuration.
    const isProd = process.env.NODE_ENV === 'production';
    const devBypass =
      !isProd &&
      process.env.SKANDA_DEV_AUTH_BYPASS === '1' &&
      req.headers['x-skanda-dev-test'] === 'true';

    if (devBypass && process.env.SKANDA_DEV_AUTH_BYPASS_WARNED !== '1') {
      process.env.SKANDA_DEV_AUTH_BYPASS_WARNED = '1';
      console.warn(
        '[auth] SKANDA_DEV_AUTH_BYPASS=1: unauthenticated requests receive a synthetic tenant context. ' +
        'Never enable this outside local development.'
      );
    }

    if (devBypass) {
      const devTenant = (req.headers['x-tenant-id'] as string) || 'tenant-acme-corp';
      req.tenantContext = {
        userId: 'dev-user-001',
        email: 'admin@acme-corp.com',
        tenantId: devTenant,
        orgId: 'org-acme-primary',
        role: 'CISO',
        permissions: getDefaultPermissionsForRole('CISO'),
        isPlatformAdmin: false,
        tokenIssuedAt: Math.floor(Date.now() / 1000),
        tokenExpiresAt: Math.floor(Date.now() / 1000) + 3600
      };
      req.user = {
        id: req.tenantContext.userId,
        email: req.tenantContext.email,
        role: req.tenantContext.role,
        tenantId: req.tenantContext.tenantId
      };
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid cryptographic Bearer token required. Client-supplied tenant headers are disallowed.',
      code: 'AUTH_TOKEN_MISSING'
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const verification = verifyJwtToken(token);

  if (!verification.valid || !verification.claims) {
    res.status(401).json({
      success: false,
      error: `Authentication failed: ${verification.error}`,
      code: 'AUTH_TOKEN_INVALID'
    });
    return;
  }

  const claims = verification.claims;

  // A valid signature is not enough: the session may have been revoked by
  // logout, account suspension, or an administrative action.
  if (!isSessionActive(typeof claims.sid === 'string' ? claims.sid : undefined)) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed: session has been revoked or has expired.',
      code: 'SESSION_REVOKED'
    });
    return;
  }

  const isPlatformAdmin = claims.role?.toUpperCase() === 'PLATFORM_ADMIN';

  // Securely construct context STRICTLY from claims
  req.tenantContext = {
    userId: claims.sub,
    email: claims.email,
    tenantId: claims.tenantId,
    orgId: claims.orgId,
    role: claims.role,
    permissions: claims.permissions || getDefaultPermissionsForRole(claims.role),
    isPlatformAdmin,
    tokenIssuedAt: claims.iat,
    tokenExpiresAt: claims.exp
  };

  req.user = {
    id: claims.sub,
    email: claims.email,
    role: claims.role,
    tenantId: claims.tenantId
  };

  // Client-supplied tenant spoofing check
  const headerTenant = req.headers['x-tenant-id'] as string;
  const queryTenant = req.query.tenantId as string;

  if (!isPlatformAdmin) {
    if (headerTenant && headerTenant !== claims.tenantId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Cannot access tenant context different from authenticated token claims.',
        code: 'TENANT_SPOOFING_BLOCKED'
      });
      return;
    }
    if (queryTenant && queryTenant !== claims.tenantId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Cannot access tenant context different from authenticated token claims.',
        code: 'TENANT_SPOOFING_BLOCKED'
      });
      return;
    }
  }

  next();
}
