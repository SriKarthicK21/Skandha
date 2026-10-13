// ============================================================================
// SKANDA ENTERPRISE GRC: AUTHENTICATION ROUTES
// Path: server/authRoutes.ts
//
// Issues and revokes real server-signed sessions (HS256 JWT + revocable `sid`
// claim). The frontend previously completed "login" entirely in the browser;
// these endpoints make the server the authority for who is signed in.
//
//   POST /api/v1/auth/login     { email, password } -> { token, user, expiresIn }
//   POST /api/v1/auth/logout    (Bearer token)       -> { success: true, revoked }
//   GET  /api/v1/auth/session   (Bearer token)       -> { authenticated, user, permissions }
//   GET  /api/v1/auth/bootstrap-status               -> { administratorConfigured }
//
// These routes are intentionally registered *before* the global auth gate:
// obtaining a token cannot itself require a token. The login endpoint is also
// rate-limited per client address inside AuthSessionService.
// ============================================================================

import { Router, Request, Response } from 'express';
import { signJwtToken, getSessionIdFromToken } from './middleware/authMiddleware.js';
import {
  authenticateCredentials,
  bootstrapAdminFromEnv,
  hasAnyUser,
  revokeSession
} from './services/AuthSessionService.js';

export const authRouter = Router();

const SESSION_TTL_SECONDS = Number(process.env.SKANDA_SESSION_TTL_SECONDS || 3600);

authRouter.post('/login', (req: Request, res: Response) => {
  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    res.status(400).json({
      success: false,
      code: 'MISSING_CREDENTIALS',
      error: 'Email and password are required.'
    });
    return;
  }
  if (email.length > 254 || password.length > 256) {
    res.status(400).json({
      success: false,
      code: 'INVALID_CREDENTIALS_SHAPE',
      error: 'Credential payload exceeds accepted limits.'
    });
    return;
  }

  const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
  const result = authenticateCredentials(email, password, clientKey);

  if (!result.ok || !result.user || !result.session) {
    // Never discloses whether the address exists.
    res.status(result.status).json({
      success: false,
      code: result.code || 'AUTH_FAILED',
      error: result.message || 'Authentication failed.'
    });
    return;
  }

  const { user, session } = result;
  const token = signJwtToken(
    {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      orgId: user.orgId,
      role: user.role
    },
    SESSION_TTL_SECONDS,
    { sid: session.sid }
  );

  console.log(
    `[auth] LOGIN ok user=${user.email} tenant=${user.tenantId} role=${user.role} ip=${clientKey} sid=${session.sid.slice(0, 8)}…`
  );

  res.status(200).json({
    success: true,
    token,
    tokenType: 'Bearer',
    expiresIn: SESSION_TTL_SECONDS,
    user: {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      orgId: user.orgId,
      role: user.role
    }
  });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
  const sid = getSessionIdFromToken(token);
  const revoked = sid ? revokeSession(sid) : false;
  console.log(
    `[auth] LOGOUT ip=${req.ip || '-'} sid=${sid ? sid.slice(0, 8) + '…' : 'none'} revoked=${revoked}`
  );
  res.status(200).json({ success: true, revoked });
});

authRouter.get('/session', (req: Request, res: Response) => {
  const ctx = req.tenantContext;
  if (!ctx) {
    res.status(401).json({ success: false, code: 'UNAUTHENTICATED', error: 'No active session.' });
    return;
  }
  res.status(200).json({
    success: true,
    authenticated: true,
    user: {
      id: ctx.userId,
      email: ctx.email,
      tenantId: ctx.tenantId,
      orgId: ctx.orgId,
      role: ctx.role
    },
    permissions: ctx.permissions,
    expiresAt: ctx.tokenExpiresAt
  });
});

authRouter.get('/bootstrap-status', (_req: Request, res: Response) => {
  bootstrapAdminFromEnv();
  res.status(200).json({
    success: true,
    administratorConfigured: hasAnyUser()
  });
});

export default authRouter;
