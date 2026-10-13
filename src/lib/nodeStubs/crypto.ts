// ============================================================================
// BROWSER SHIM FOR NODE `crypto`
// Path: src/lib/nodeStubs/crypto.ts
//
// Vite replaces Node built-ins in the browser with an "externalized" proxy that
// throws on ANY property access:
//
//   Error: Module "crypto" has been externalized for browser compatibility.
//   Cannot access "crypto.randomBytes" in client code.
//
// Several SKANDA server modules (for example
// server/services/regulatory/MASRegulatoryIngestionService.ts, whose singleton is
// instantiated at module scope) are also imported by client workspaces, so that
// throw happens while the application shell is rendering and takes down the whole
// page.
//
// This shim keeps the parts that a browser CAN do correctly — cryptographically
// secure random bytes and UUIDs, both available synchronously through
// window.crypto.getRandomValues — and fails loudly, with an actionable message,
// for the parts it cannot (synchronous hashing/HMAC/KDF). Those are integrity
// operations that belong on the server; returning a plausible-looking digest from
// the browser would be worse than failing.
//
// vite.config.ts aliases `crypto` to this module for the browser build only.
// The Express server (server.ts) keeps the real Node implementation.
// ============================================================================

class BrowserRandomBytes extends Uint8Array {
  toString(encoding?: string): string {
    if (encoding === 'hex') {
      let out = '';
      for (let i = 0; i < this.length; i += 1) {
        out += this[i].toString(16).padStart(2, '0');
      }
      return out;
    }
    if (encoding === 'base64') {
      let binary = '';
      for (let i = 0; i < this.length; i += 1) binary += String.fromCharCode(this[i]);
      return btoa(binary);
    }
    return Array.from(this).join(',');
  }

  toJSON(): number[] {
    return Array.from(this);
  }

  equals(other: unknown): boolean {
    return other instanceof Uint8Array && other.length === this.length && other.every((value, index) => value === this[index]);
  }
}

function requireWebCrypto(): Crypto {
  const webCrypto = (globalThis as any).crypto as Crypto | undefined;
  if (!webCrypto || typeof webCrypto.getRandomValues !== 'function') {
    throw new Error(
      '[SKANDA] No Web Crypto implementation is available in this browser, so secure random values cannot be produced. ' +
        'Generate identifiers on the server instead.'
    );
  }
  return webCrypto;
}

/** Cryptographically secure random bytes, matching Node's synchronous API. */
export function randomBytes(size: number): BrowserRandomBytes {
  const bytes = new BrowserRandomBytes(Math.max(0, Math.floor(size)));
  requireWebCrypto().getRandomValues(bytes);
  return bytes;
}

export function randomFillSync<T extends Uint8Array>(buffer: T): T {
  requireWebCrypto().getRandomValues(buffer);
  return buffer;
}

export function randomInt(min: number, max?: number): number {
  const low = max === undefined ? 0 : Math.floor(min);
  const high = max === undefined ? Math.floor(min) : Math.floor(max);
  if (high <= low) return low;
  const range = high - low;
  const bytes = new Uint32Array(1);
  requireWebCrypto().getRandomValues(bytes);
  return low + (bytes[0] % range);
}

export function randomUUID(): string {
  const webCrypto = requireWebCrypto() as Crypto & { randomUUID?: () => string };
  if (typeof webCrypto.randomUUID === 'function') return webCrypto.randomUUID();
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function serverOnly(operation: string): never {
  throw new Error(
    `[SKANDA] crypto.${operation} is a server-side integrity operation and cannot be executed in a browser. ` +
      'Move this call behind an /api endpoint; the Express server (server.ts) runs the real Node crypto implementation.'
  );
}

export function createHash(_algorithm?: string): any {
  return serverOnly('createHash');
}

export function createHmac(_algorithm?: string, _key?: unknown): any {
  return serverOnly('createHmac');
}

export function pbkdf2Sync(): any {
  return serverOnly('pbkdf2Sync');
}

export function scryptSync(): any {
  return serverOnly('scryptSync');
}

export function sign(): any {
  return serverOnly('sign');
}

export function verify(): any {
  return serverOnly('verify');
}

export function timingSafeEqual(): any {
  return serverOnly('timingSafeEqual');
}

/** Web Crypto remains available for the genuinely asynchronous browser flows. */
export const webcrypto: Crypto = (globalThis as any).crypto;

export const constants = {
  RSA_PKCS1_PADDING: 1,
  RSA_PKCS1_OAEP_PADDING: 4
};

const cryptoShim = {
  randomBytes,
  randomFillSync,
  randomInt,
  randomUUID,
  createHash,
  createHmac,
  pbkdf2Sync,
  scryptSync,
  sign,
  verify,
  timingSafeEqual,
  webcrypto,
  constants
};

export default cryptoShim;
