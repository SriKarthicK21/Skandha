/**
 * Safe Storage Utility
 * Wraps browser localStorage with quota management, automatic cache pruning,
 * and an in-memory fallback store to prevent DOMException: QuotaExceededError.
 */

const memoryStore = new Map<string, string>();

/**
 * List of prefixes or substrings of non-critical, regenerable caches
 * that can be safely evicted when storage quota is reached.
 */
const PRUNABLE_KEY_PATTERNS = [
  'skanda_brandguard_ct_logs',
  'skanda_brandguard_last_sweep',
  'skanda_brandguard_clusters_v1',
  'skanda_brandguard_leaked_creds_v1',
  'skanda_brandguard_code_leaks_v1',
  'skanda_brandguard_receipts_v1',
  'skanda_brandguard_easm_subdomains_v1',
  'skanda_brandguard_deepfake_alerts_v1',
  'skanda_brandguard_safebrowsing_submissions',
  'skanda_brandguard_takedown_slas',
  '_logo_monitoring_jobs',
  '_logo_monitoring_matches',
  '_logo_monitoring_cases',
  '_logo_monitoring_takedowns',
  '_audit_trail_cache',
  '_telemetry_cache'
];

/**
 * Prunes non-essential keys from localStorage when quota is near or exceeded.
 */
export function pruneNonEssentialKeys(): number {
  let freedCount = 0;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const isPrunable = PRUNABLE_KEY_PATTERNS.some(pattern => key.includes(pattern));
      if (isPrunable) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
        freedCount++;
      } catch {
        // Ignore
      }
    });

    if (freedCount > 0) {
      console.warn(`[safeStorage] Pruned ${freedCount} non-critical cache keys to recover localStorage quota.`);
    }
  } catch (e) {
    console.warn('[safeStorage] Error during storage pruning:', e);
  }
  return freedCount;
}

/**
 * Safely get an item from localStorage or in-memory fallback.
 */
export function safeGetItem(key: string): string | null {
  try {
    const val = localStorage.getItem(key);
    if (val !== null) {
      return val;
    }
  } catch {
    // localStorage might be disabled or restricted
  }
  return memoryStore.get(key) ?? null;
}

/**
 * Safely set an item in localStorage, falling back to memory if quota is exceeded.
 * Never throws QuotaExceededError.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    // Keep memory fallback in sync or clean it up
    memoryStore.delete(key);
    return true;
  } catch (err: unknown) {
    // Check if error is QuotaExceededError
    const isQuotaError =
      err instanceof Error &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.message?.toLowerCase().includes('quota') ||
        ('code' in err && (err as { code: number }).code === 22));

    if (isQuotaError) {
      // Attempt to free space by pruning transient keys
      const freed = pruneNonEssentialKeys();
      if (freed > 0) {
        try {
          localStorage.setItem(key, value);
          memoryStore.delete(key);
          return true;
        } catch {
          // Still failed, fall back to memory
        }
      }
    }

    // Fall back to in-memory store so React never crashes
    console.warn(`[safeStorage] localStorage quota reached or write blocked. Saving "${key}" to in-memory fallback.`);
    memoryStore.set(key, value);
    return false;
  }
}

/**
 * Safely remove an item from localStorage and memory fallback.
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
  memoryStore.delete(key);
}

/**
 * Safely parse JSON with a default fallback
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Drop-in safeStorage interface mimicking standard Storage API
 */
export const safeStorage = {
  getItem: safeGetItem,
  setItem: safeSetItem,
  removeItem: safeRemoveItem,
  clear: () => {
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
    memoryStore.clear();
  }
};
