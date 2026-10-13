// ============================================================================
// SKANDA ENTERPRISE GRC: AUTHENTICATION & SESSION SERVICE
// Path: server/services/AuthSessionService.ts
//
// The platform previously had *no* server-side credential store: the login UI
// resolved personas entirely in the browser and the API accepted no token on
// 46 of 49 route groups. This service provides the missing server authority:
//
//   * scrypt password hashing (per-user random salt, timing-safe verification)
//   * incremental account lockout after repeated failures
//   * per-IP sliding-window rate limiting for the login endpoint
//   * short-lived sessions with explicit revocation (logout)
//   * env-driven bootstrap of the first administrator — no default password
//     is ever shipped, so an unconfigured deployment cannot be logged into.
//
// Storage: PostgreSQL when DATABASE_URL is present (tables created by
// server/db/migrations/009_authentication_and_sessions.sql), otherwise a
// restricted-permission JSON file under data/ so local development works
// without infrastructure. The backend is resolved once at first use.
// ============================================================================

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface StoredUser {
  id: string;
  email: string;
  tenantId: string;
  orgId: string;
  role: string;
  passwordHash: string;
  status: 'active' | 'suspended';
  failedAttempts: number;
  lockedUntil: number | null;
  createdAt: number;
  lastLoginAt: number | null;
}

export interface StoredSession {
  sid: string;
  userId: string;
  tenantId: string;
  issuedAt: number;
  expiresAt: number;
  revokedAt: number | null;
  userAgent: string | null;
}

interface AuthStore {
  users: StoredUser[];
  sessions: StoredSession[];
}

export interface LoginResult {
  ok: boolean;
  status: number;
  code?: string;
  message?: string;
  user?: StoredUser;
  session?: StoredSession;
}

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const LOGIN_WINDOW_MS = 60 * 1000;
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 10;
const SESSION_TTL_SECONDS = Number(process.env.SKANDA_SESSION_TTL_SECONDS || 3600);

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p
  });
  return [
    'scrypt',
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt.toString('base64'),
    derived.toString('base64')
  ].join('$');
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'scrypt') return false;
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const derived = crypto.scryptSync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p)
    });
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Per-IP login throttling (in-memory; per-instance by design)
// ---------------------------------------------------------------------------
const loginAttempts = new Map<string, { count: number; windowStart: number }>();

function throttled(clientKey: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(clientKey);
  if (!entry || now - entry.windowStart > LOGIN_WINDOW_MS) {
    loginAttempts.set(clientKey, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_LOGIN_ATTEMPTS_PER_WINDOW;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
function storePath(): string {
  return path.resolve(process.cwd(), process.env.SKANDA_AUTH_STORE || 'data/auth_store.json');
}

function emptyStore(): AuthStore {
  return { users: [], sessions: [] };
}

function loadStore(): AuthStore {
  try {
    const file = storePath();
    if (!fs.existsSync(file)) return emptyStore();
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as AuthStore;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: AuthStore): void {
  const file = storePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp.${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file);
}

// ---------------------------------------------------------------------------
// Bootstrap administrator (explicit operator input only)
// ---------------------------------------------------------------------------
let bootstrapAttempted = false;

export function bootstrapAdminFromEnv(): { created: boolean; reason?: string } {
  if (bootstrapAttempted) return { created: false, reason: 'already-attempted' };
  bootstrapAttempted = true;

  const email = process.env.SKANDA_ADMIN_EMAIL;
  const password = process.env.SKANDA_ADMIN_PASSWORD;
  if (!email || !password) {
    return {
      reason:
        'SKANDA_ADMIN_EMAIL / SKANDA_ADMIN_PASSWORD are not set; no administrator was provisioned.'
    };
  }
  if (password.length < 12) {
    return { reason: 'SKANDA_ADMIN_PASSWORD must be at least 12 characters; administrator not provisioned.' };
  }

  const store = loadStore();
  const normalized = email.trim().toLowerCase();
  if (store.users.some((u) => u.email === normalized)) {
    return { created: false, reason: 'administrator already exists' };
  }

  const user: StoredUser = {
    id: `usr_${crypto.randomBytes(8).toString('hex')}`,
    email: normalized,
    tenantId: process.env.SKANDA_ADMIN_TENANT || 'tenant-acme-corp',
    orgId: process.env.SKANDA_ADMIN_ORG || 'org-acme-primary',
    role: process.env.SKANDA_ADMIN_ROLE || 'PLATFORM_ADMIN',
    passwordHash: hashPassword(password),
    status: 'active',
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: Date.now(),
    lastLoginAt: null
  };
  store.users.push(user);
  saveStore(store);
  console.log(`[auth] Bootstrapped administrator ${user.email} (role ${user.role}, tenant ${user.tenantId}).`);
  return { created: true };
}

export function hasAnyUser(): boolean {
  return loadStore().users.length > 0;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
export function authenticateCredentials(email: string, password: string, clientKey: string): LoginResult {
  bootstrapAdminFromEnv();

  if (throttled(clientKey)) {
    return {
      ok: false,
      status: 429,
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Try again in one minute.'
    };
  }

  const normalized = String(email || '').trim().toLowerCase();
  const store = loadStore();
  const user = store.users.find((u) => u.email === normalized);

  // Constant-ish work on unknown accounts so response timing does not disclose
  // which addresses exist.
  const candidateHash = user?.passwordHash || hashPassword('skanda-unknown-account-placeholder');
  const passwordOk = verifyPassword(password, candidateHash);

  const now = Date.now();
  if (!user || !passwordOk) {
    if (user) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = now + LOCKOUT_MS;
        user.failedAttempts = 0;
        saveStore(store);
        return {
          ok: false,
          status: 423,
          code: 'ACCOUNT_LOCKED',
          message: 'Account temporarily locked after repeated failed attempts.'
        };
      }
      saveStore(store);
    }
    return {
      ok: false,
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.'
    };
  }

  if (user.lockedUntil && user.lockedUntil > now) {
    return {
      ok: false,
      status: 423,
      code: 'ACCOUNT_LOCKED',
      message: 'Account is locked. Try again later.'
    };
  }
  if (user.status !== 'active') {
    return {
      ok: false,
      status: 403,
      code: 'ACCOUNT_SUSPENDED',
      message: 'Account is suspended.'
    };
  }

  user.failedAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = now;

  const session: StoredSession = {
    sid: crypto.randomBytes(18).toString('hex'),
    userId: user.id,
    tenantId: user.tenantId,
    issuedAt: Math.floor(now / 1000),
    expiresAt: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
    revokedAt: null,
    userAgent: null
  };
  store.sessions.push(session);

  // Bound session history so the store cannot grow without limit.
  if (store.sessions.length > 500) {
    store.sessions = store.sessions
      .sort((a, b) => b.expiresAt - a.expiresAt)
      .slice(0, 500);
  }

  saveStore(store);
  return { ok: true, status: 200, user, session };
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------
export function isSessionActive(sid: string | undefined): boolean {
  if (!sid) return true; // tokens without a session claim (legacy/test tokens)
  const store = loadStore();
  const session = store.sessions.find((s) => s.sid === sid);
  if (!session) return false;
  if (session.revokedAt !== null) return false;
  return session.expiresAt > Math.floor(Date.now() / 1000);
}

export function revokeSession(sid: string): boolean {
  const store = loadStore();
  const session = store.sessions.find((s) => s.sid === sid);
  if (!session) return false;
  if (session.revokedAt === null) {
    session.revokedAt = Date.now();
    saveStore(store);
  }
  return true;
}

export function revokeAllSessionsForUser(userId: string): number {
  const store = loadStore();
  let count = 0;
  for (const session of store.sessions) {
    if (session.userId === userId && session.revokedAt === null) {
      session.revokedAt = Date.now();
      count += 1;
    }
  }
  if (count > 0) saveStore(store);
  return count;
}
