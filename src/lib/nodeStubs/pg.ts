// ============================================================================
// BROWSER STUB FOR `pg` (node-postgres)
// Path: src/lib/nodeStubs/pg.ts
//
// `pg` is a Node-only dependency. Several SKANDA server modules (for example
// server/repositories/PolicyRepository.ts) are also imported by client-side
// workspaces, so the browser module graph can reach `pg` during Vite's
// dependency pre-bundling. `pg` executes Buffer-dependent code at import time,
// which throws `ReferenceError: Buffer is not defined` while the entry module
// is evaluating — React never mounts and the whole application renders blank.
//
// vite.config.ts aliases `pg` to this module for the browser build only; the
// Express server (server.ts) keeps the real driver because it does not read
// that configuration.
//
// The stub is deliberately permissive at import time (importing it must never
// throw) and loud at use time: any attempt to open a database connection from
// the browser fails immediately with an explanatory error rather than silently
// pretending to work.
// ============================================================================

function browserOnlyError(detail: string): never {
  throw new Error(
    `[SKANDA] The PostgreSQL client ("pg") cannot run in a browser. Attempted use: ${detail}. ` +
      'Database access belongs to the Express server (server.ts); browser code must call the /api endpoints instead.'
  );
}

/** A callable/constructable stub that fails loudly when actually used. */
function throwingStub(detail: string): (...args: unknown[]) => never {
  return () => browserOnlyError(detail);
}

/**
 * Type-parser registration is harmless in a browser, so `pg.types.*` calls are
 * absorbed as no-ops instead of failing: a module that configures parsers at
 * import time must still be importable.
 */
const typesStub = new Proxy({} as Record<string, unknown>, {
  get: () => () => undefined,
  set: () => true,
  has: () => true
});

export const Pool = throwingStub('new pg.Pool(...)');
export const Client = throwingStub('new pg.Client(...)');
export const Query = throwingStub('new pg.Query(...)');
export const types = typesStub;
export const defaults = {};

const pgStub = {
  Pool,
  Client,
  Query,
  types,
  defaults
};

export default pgStub;
