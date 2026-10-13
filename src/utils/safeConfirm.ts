/**
 * Safe confirm helper that guards against sandboxed iframe restrictions
 * where window.confirm might throw a DOMException or be blocked.
 */
export function safeConfirm(message: string, fallback: boolean = true): boolean {
  try {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(message);
    }
  } catch {
    // In restricted iframe environments where confirm is disabled/throws DOMException
    return fallback;
  }
  return fallback;
}

/**
 * Safe alert helper that guards against sandboxed iframe restrictions
 * where window.alert might throw a DOMException or be blocked.
 */
export function safeAlert(message: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message);
    } else {
      console.info('[SKANDA Notice]', message);
    }
  } catch {
    console.info('[SKANDA Notice]', message);
  }
}

