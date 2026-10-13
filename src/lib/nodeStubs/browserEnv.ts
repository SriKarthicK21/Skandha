// ============================================================================
// BROWSER ENVIRONMENT SHIM FOR NODE GLOBALS
// Path: src/lib/nodeStubs/browserEnv.ts
//
// A number of SKANDA server modules (for example
// server/config/environmentConfig.ts, which builds a singleton at import time)
// are imported by client-side workspaces. Vite already maps Node built-ins such
// as `fs`, `path` and `crypto` to browser-external stubs, but bare Node
// *globals* are not mapped: `process` is undefined in a browser, so a server
// module that reads process.env at import time threw
// `ReferenceError: process is not defined` while the entry module was
// evaluating, and the entire application rendered blank.
//
// This module is imported first in src/main.tsx, so it is evaluated before the
// rest of the application graph. It only defines missing globals; it never
// overrides a real implementation. Anything that actually needs Node runtime
// behaviour (database access, file system work) still fails loudly on use,
// which is the correct outcome for code that belongs on the server.
// ============================================================================

const g = globalThis as unknown as Record<string, unknown>;

if (typeof g.process === 'undefined') {
  g.process = {
    env: {},
    browser: true,
    platform: 'browser',
    version: '',
    argv: [],
    nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
      queueMicrotask(() => fn(...args));
    },
    cwd: () => '/',
    // Server modules occasionally probe these; a safe default avoids a crash
    // during import while remaining obviously non-authoritative.
    stdout: { isTTY: false, columns: 80, write: () => true },
    stderr: { isTTY: false, columns: 80, write: () => true },
    on: () => undefined,
    once: () => undefined,
    off: () => undefined,
    emit: () => false,
    exit: () => undefined
  };
}

export {};
