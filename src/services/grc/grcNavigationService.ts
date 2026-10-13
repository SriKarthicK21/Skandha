/**
 * SKANDA GRC Unified Navigation & Deep-Linking Service
 * 
 * Provides an enterprise-grade navigation abstraction supporting:
 * PERSPECTIVE -> CONTEXT -> PRIORITY -> GRC ENTITY -> ACTION -> OUTCOME
 * 
 * Capabilities:
 * 1. Deep-linking with URL parameter preservation (module, tab, subTab, framework, filters, entityId)
 * 2. Entity 360° Relational Drawer activation (RSK-xxx, CTRL-xxx, EV-xxx, CAPA-xxx, VND-xxx, etc.)
 * 3. Filter-preserving navigation for operational triage (severity, status, owner, riskLevel)
 * 4. Perspective state persistence across user sessions
 * 5. Browser history integration with back/forward support
 */

export interface GrcNavigationFilterParams {
  severity?: 'critical' | 'high' | 'medium' | 'low' | string;
  status?: 'open' | 'failed' | 'missing' | 'overdue' | 'in_progress' | 'pending_review' | 'verified' | 'closed' | string;
  category?: string;
  owner?: string;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  department?: string;
  auditPeriod?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface GrcNavigationOptions {
  /** Target workspace / module ID */
  module: string;
  /** Primary workspace tab */
  tab?: string;
  /** Secondary sub-tab or view mode */
  subTab?: string;
  /** Framework context (e.g. 'iso27001', 'mas_trm', 'iso42001', 'soc2', 'dpdp') */
  framework?: string;
  /** Entity identifier for deep-linking (e.g. 'RSK-014', 'CTRL-088', 'EV-2026-99', 'CAPA-001') */
  entityId?: string;
  /** Entity domain type ('RISK' | 'CONTROL' | 'EVIDENCE' | 'CAPA' | 'REQUIREMENT' | 'VENDOR' | 'APP' | 'PROCESS' | 'SCOPE') */
  entityType?: string;
  /** Operational filter queries to preserve context */
  filters?: GrcNavigationFilterParams;
  /** Whether to open the Entity 360 Relational Drawer */
  open360?: boolean;
  /** Explicit perspective context */
  perspective?: 'ciso' | 'grc_manager' | 'lead_auditor' | 'board' | 'dpo';
  /** Custom notification or toast message on navigation */
  intentReason?: string;
}

export interface NavigationCoverageItem {
  id: string;
  actionTitle: string;
  sourcePerspective: string;
  targetModule: string;
  targetTab?: string;
  filterContext?: string;
  entityLink?: string;
  expectedOutcome: string;
  status: 'VERIFIED' | 'IMPLEMENTED';
}

const STORAGE_PERSPECTIVE_KEY = 'skanda_user_perspective';

export class GrcNavigationService {
  /**
   * Primary entry point for all SKANDA Command Centre navigation actions.
   */
  public static navigate(options: GrcNavigationOptions | string): void {
    if (typeof window === 'undefined') return;

    let navOpts: GrcNavigationOptions;
    if (typeof options === 'string') {
      navOpts = { module: options };
    } else {
      navOpts = { ...options };
    }

    // 1. If an entityId is provided with open360 flag, dispatch 360 drawer event
    if (navOpts.entityId && (navOpts.open360 || !navOpts.module)) {
      this.openEntity360(navOpts.entityId, navOpts.entityType);
      if (!navOpts.module) return;
    }

    // 2. Build search params to sync with URL
    const searchParams = new URLSearchParams();
    searchParams.set('module', navOpts.module);

    if (navOpts.tab) searchParams.set('tab', navOpts.tab);
    if (navOpts.subTab) searchParams.set('subTab', navOpts.subTab);
    if (navOpts.framework) searchParams.set('framework', navOpts.framework);
    if (navOpts.entityId) searchParams.set('entityId', navOpts.entityId);
    if (navOpts.entityType) searchParams.set('entityType', navOpts.entityType);

    if (navOpts.filters) {
      Object.entries(navOpts.filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.set(k, String(v));
        }
      });
    }

    // 3. Update browser URL without triggering full page reload
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({ grcNavigation: navOpts }, '', newUrl);

    // 4. Dispatch custom GRC navigation event for App.tsx and workspace listeners
    const navEvent = new CustomEvent('skanda:navigate-grc', {
      detail: navOpts
    });
    window.dispatchEvent(navEvent);

    // 5. Also dispatch legacy module navigation event for backward compatibility
    const legacyEvent = new CustomEvent('skanda:navigate-module', {
      detail: {
        moduleId: navOpts.module,
        tab: navOpts.tab,
        framework: navOpts.framework
      }
    });
    window.dispatchEvent(legacyEvent);
  }

  /**
   * Open the SKANDA 360° Relational Graph Drawer for any entity
   */
  public static openEntity360(entityId: string, entityType?: string): void {
    if (typeof window === 'undefined') return;
    const evt = new CustomEvent('skanda:open-360-drawer', {
      detail: { id: entityId, type: entityType }
    });
    window.dispatchEvent(evt);
  }

  /**
   * Parse navigation state directly from URL query parameters (for deep-linking & page reload)
   */
  public static parseUrlNavigation(): GrcNavigationOptions | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const module = params.get('module');
    if (!module) return null;

    const filters: GrcNavigationFilterParams = {};
    const knownKeys = new Set(['module', 'tab', 'subTab', 'framework', 'entityId', 'entityType']);
    params.forEach((value, key) => {
      if (!knownKeys.has(key)) {
        filters[key] = value;
      }
    });

    return {
      module,
      tab: params.get('tab') || undefined,
      subTab: params.get('subTab') || undefined,
      framework: params.get('framework') || undefined,
      entityId: params.get('entityId') || undefined,
      entityType: params.get('entityType') || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    };
  }

  /**
   * Format a normalized URL string from navigation options
   */
  public static buildUrl(options: GrcNavigationOptions): string {
    const searchParams = new URLSearchParams();
    searchParams.set('module', options.module);
    if (options.tab) searchParams.set('tab', options.tab);
    if (options.subTab) searchParams.set('subTab', options.subTab);
    if (options.framework) searchParams.set('framework', options.framework);
    if (options.entityId) searchParams.set('entityId', options.entityId);
    if (options.entityType) searchParams.set('entityType', options.entityType);

    if (options.filters) {
      Object.entries(options.filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.set(k, String(v));
        }
      });
    }

    return `/${options.module}?${searchParams.toString()}`;
  }

  /**
   * Parse a query string into GrcNavigationOptions (Node.js & browser safe)
   */
  public static parseUrlState(queryString: string): GrcNavigationOptions {
    const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
    const module = params.get('module') || 'dashboard';

    const filters: GrcNavigationFilterParams = {};
    const knownKeys = new Set(['module', 'tab', 'subTab', 'framework', 'entityId', 'entityType']);
    params.forEach((value, key) => {
      if (!knownKeys.has(key)) {
        filters[key] = value;
      }
    });

    return {
      module,
      tab: params.get('tab') || undefined,
      subTab: params.get('subTab') || undefined,
      framework: params.get('framework') || undefined,
      entityId: params.get('entityId') || undefined,
      entityType: params.get('entityType') || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    };
  }

  /**
   * Persist user perspective selection
   */
  public static savePerspective(perspective: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_PERSPECTIVE_KEY, perspective);
    } catch (e) {
      console.warn('Failed to persist user perspective:', e);
    }
  }

  /**
   * Load stored perspective selection
   */
  public static getStoredPerspective(defaultPerspective: string = 'ciso'): string {
    if (typeof window === 'undefined') return defaultPerspective;
    try {
      const saved = localStorage.getItem(STORAGE_PERSPECTIVE_KEY);
      if (saved && ['ciso', 'grc_manager', 'lead_auditor', 'board', 'dpo'].includes(saved)) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return defaultPerspective;
  }
}

/**
 * Convenient standalone helper export
 */
export const navigateToGrc = (options: GrcNavigationOptions | string): void => {
  GrcNavigationService.navigate(options);
};
