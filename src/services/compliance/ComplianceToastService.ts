// ============================================================================
// SKANDA GRC — Compliance Toast Notification Service
// Path: src/services/compliance/ComplianceToastService.ts
//
// Real-time enterprise UI toast alert service that monitors continuous
// compliance drift events and breaches. Seamlessly connects to:
// 1. ContinuousComplianceEngine observer callbacks
// 2. DOM CustomEvents ('skanda:compliance-drift', 'skanda:compliance-drift-breach')
// 3. React ToastProvider / useToast UI container
// ============================================================================

import {
  ComplianceDriftEvent,
  DriftSeverity
} from '../../types/continuousCompliance';
import {
  SKANDA_COMPLIANCE_DRIFT_EVENT,
  SKANDA_COMPLIANCE_BREACH_EVENT,
  ComplianceDriftCustomEventDetail,
  ComplianceBreachCustomEventDetail,
  continuousComplianceEngine,
  ContinuousComplianceEngine
} from './ContinuousComplianceEngine';

export interface ToastActionDefinition {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface ComplianceToastPayload {
  title: string;
  message?: string;
  description?: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  severity?: DriftSeverity;
  controlCode?: string;
  badgeText?: string;
  action?: ToastActionDefinition;
  secondaryAction?: ToastActionDefinition;
  metadata?: Record<string, any>;
}

export interface ComplianceToastAlertConfig {
  /** Master switch to enable/disable compliance breach toasts */
  enabled: boolean;
  /** Play subtle synth audio chime on breach detection */
  enableSound: boolean;
  /** Minimum severity filter to alert */
  minSeverity: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Time window in ms to suppress duplicate toasts for identical control breaches */
  deduplicationWindowMs: number;
  /** Auto-dismiss durations per severity tier */
  autoDismissDurations: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

export const DEFAULT_COMPLIANCE_TOAST_CONFIG: ComplianceToastAlertConfig = {
  enabled: true,
  enableSound: true,
  minSeverity: 'ALL',
  deduplicationWindowMs: 12000,
  autoDismissDurations: {
    CRITICAL: 8000,
    HIGH: 6500,
    MEDIUM: 5000,
    LOW: 4000
  }
};

type ToastHandler = (toast: ComplianceToastPayload) => void;

/**
 * Enterprise Toast Notification Service for Compliance Breaches & Drift Detection
 */
export class ComplianceToastService {
  private config: ComplianceToastAlertConfig = { ...DEFAULT_COMPLIANCE_TOAST_CONFIG };
  private toastHandlers: Set<ToastHandler> = new Set();
  private recentBreachCache: Map<string, number> = new Map();
  private isListeningToWindow: boolean = false;
  private engineUnsubscribe: (() => void) | null = null;
  private windowCleanupCallbacks: Array<() => void> = [];

  constructor(config?: Partial<ComplianceToastAlertConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Registers a UI toast handler callback (typically supplied by React ToastProvider).
   * Returns an unregister function.
   */
  public registerToastHandler(handler: ToastHandler): () => void {
    this.toastHandlers.add(handler);
    return () => {
      this.toastHandlers.delete(handler);
    };
  }

  /**
   * Updates service configuration
   */
  public updateConfig(newConfig: Partial<ComplianceToastAlertConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ComplianceToastAlertConfig {
    return { ...this.config };
  }

  /**
   * Dispatches a formatted compliance breach notification toast to all registered UI handlers.
   */
  public notifyDriftBreach(
    drift: ComplianceDriftEvent,
    options?: {
      onReview?: () => void;
      suppressSound?: boolean;
    }
  ): boolean {
    if (!this.config.enabled) return false;

    // Severity filtering
    if (!this.matchesMinSeverity(drift.severity)) {
      return false;
    }

    // Deduplication check: prevent toast flood for the same control code within deduplicationWindowMs
    const cacheKey = `${drift.controlCode}_${drift.driftType}_${drift.severity}`;
    const now = Date.now();
    const lastAlertTime = this.recentBreachCache.get(cacheKey);

    if (lastAlertTime && now - lastAlertTime < this.config.deduplicationWindowMs) {
      return false; // Suppress duplicate
    }
    this.recentBreachCache.set(cacheKey, now);

    // Clean up stale cache items
    if (this.recentBreachCache.size > 100) {
      for (const [key, time] of this.recentBreachCache.entries()) {
        if (now - time > 60000) {
          this.recentBreachCache.delete(key);
        }
      }
    }

    // Determine visual style & duration
    const type = drift.severity === 'CRITICAL' || drift.severity === 'HIGH' ? 'error' : 'warning';
    const duration = this.config.autoDismissDurations[drift.severity] || 5000;

    // Play subtle audio alert if enabled
    if (this.config.enableSound && !options?.suppressSound) {
      this.playAlertChime(drift.severity);
    }

    const title = `Compliance Breach: [${drift.controlCode}]`;
    const message = `${drift.controlTitle} — ${drift.rootCause || 'Operating effectiveness decayed below continuous compliance threshold.'}`;

    const defaultAction: ToastActionDefinition = {
      label: 'Review Control',
      onClick: () => {
        if (options?.onReview) {
          options.onReview();
        } else {
          this.triggerUIModuleNavigation('continuous_compliance', drift.controlCode);
        }
      },
      primary: true
    };

    const payload: ComplianceToastPayload = {
      title,
      message,
      description: drift.recommendedAction ? `Action: ${drift.recommendedAction}` : undefined,
      type,
      duration,
      severity: drift.severity,
      controlCode: drift.controlCode,
      badgeText: drift.severity,
      action: defaultAction,
      metadata: {
        driftId: drift.id,
        driftType: drift.driftType,
        dueDate: drift.dueDate,
        tenantId: drift.tenantId
      }
    };

    this.dispatchToHandlers(payload);
    return true;
  }

  /**
   * Notifies about multiple detected drifts in a single evaluation sweep.
   * Emits high-level summary alert or individual breach alerts.
   */
  public notifyBatchDrifts(
    drifts: ComplianceDriftEvent[],
    options?: { onReview?: () => void }
  ): void {
    if (!this.config.enabled || drifts.length === 0) return;

    if (drifts.length === 1) {
      this.notifyDriftBreach(drifts[0], options);
      return;
    }

    const criticals = drifts.filter(d => d.severity === 'CRITICAL');
    const highs = drifts.filter(d => d.severity === 'HIGH');
    const mediums = drifts.filter(d => d.severity === 'MEDIUM');

    // For any CRITICAL breaches, emit individual alerts
    criticals.forEach(c => this.notifyDriftBreach(c, { ...options, suppressSound: true }));

    // Emit consolidated batch toast
    const title = `🚨 Compliance Drift: ${drifts.length} Breaches Detected`;
    const summaryParts: string[] = [];
    if (criticals.length > 0) summaryParts.push(`${criticals.length} Critical`);
    if (highs.length > 0) summaryParts.push(`${highs.length} High`);
    if (mediums.length > 0) summaryParts.push(`${mediums.length} Medium`);

    const message = `Automated telemetry detected ${drifts.length} control regressions (${summaryParts.join(', ')}). Continuous audit SLA deadline triggered.`;

    if (this.config.enableSound) {
      this.playAlertChime(criticals.length > 0 ? 'CRITICAL' : 'HIGH');
    }

    const payload: ComplianceToastPayload = {
      title,
      message,
      type: criticals.length > 0 || highs.length > 0 ? 'error' : 'warning',
      duration: 8000,
      badgeText: `${drifts.length} DRIFTS`,
      action: {
        label: 'Inspect All in Engine',
        onClick: () => {
          if (options?.onReview) {
            options.onReview();
          } else {
            this.triggerUIModuleNavigation('continuous_compliance');
          }
        },
        primary: true
      },
      metadata: {
        totalCount: drifts.length,
        criticalCount: criticals.length,
        highCount: highs.length
      }
    };

    this.dispatchToHandlers(payload);
  }

  /**
   * Begins automatically listening to:
   * 1. Window DOM CustomEvents ('skanda:compliance-drift', 'skanda:compliance-drift-breach')
   * 2. ContinuousComplianceEngine observer callbacks
   */
  public startAutoListening(engine: ContinuousComplianceEngine = continuousComplianceEngine): () => void {
    this.stopAutoListening();

    // 1. Subscribe to ContinuousComplianceEngine observer
    this.engineUnsubscribe = engine.onDriftDetected(newDrifts => {
      this.notifyBatchDrifts(newDrifts);
    });

    // 2. Subscribe to window CustomEvents for browser-wide event bus decoupling
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const breachHandler = (e: Event) => {
        const customEvt = e as CustomEvent<ComplianceBreachCustomEventDetail>;
        if (customEvt.detail?.drift) {
          this.notifyDriftBreach(customEvt.detail.drift);
        }
      };

      const aggregateHandler = (e: Event) => {
        const customEvt = e as CustomEvent<ComplianceDriftCustomEventDetail>;
        if (customEvt.detail?.drifts && customEvt.detail.drifts.length > 1) {
          // Handled by individual breach events or batch
        }
      };

      window.addEventListener(SKANDA_COMPLIANCE_BREACH_EVENT, breachHandler);
      window.addEventListener(SKANDA_COMPLIANCE_DRIFT_EVENT, aggregateHandler);
      this.isListeningToWindow = true;

      this.windowCleanupCallbacks.push(() => {
        window.removeEventListener(SKANDA_COMPLIANCE_BREACH_EVENT, breachHandler);
        window.removeEventListener(SKANDA_COMPLIANCE_DRIFT_EVENT, aggregateHandler);
      });
    }

    return () => this.stopAutoListening();
  }

  /**
   * Halts automatic listening
   */
  public stopAutoListening(): void {
    if (this.engineUnsubscribe) {
      this.engineUnsubscribe();
      this.engineUnsubscribe = null;
    }

    this.windowCleanupCallbacks.forEach(cleanup => {
      try {
        cleanup();
      } catch (e) {
        console.error('[ComplianceToastService] Error during cleanup:', e);
      }
    });
    this.windowCleanupCallbacks = [];
    this.isListeningToWindow = false;
  }

  /**
   * Clears the deduplication cache
   */
  public clearDeduplicationCache(): void {
    this.recentBreachCache.clear();
  }

  /**
   * Simulates a real-time compliance breach alert (ideal for verifying UI toasts, demo drills, and audits)
   */
  public simulateBreachAlert(severity: DriftSeverity = 'CRITICAL'): ComplianceDriftEvent {
    const mockDrift: ComplianceDriftEvent = {
      id: `sim-drift-${Date.now()}`,
      tenantId: 'tenant-default',
      controlCode: severity === 'CRITICAL' ? 'A.8.8' : 'MAS-TRM-8.1',
      controlTitle:
        severity === 'CRITICAL'
          ? 'Management of Technical Vulnerabilities'
          : 'Privileged Access Security & Multi-Factor Enforcement',
      driftType: severity === 'CRITICAL' ? 'EVIDENCE_DECAY' : 'AUTOMATED_TEST_FAILURE',
      severity,
      detectedAt: new Date().toISOString(),
      rootCause:
        severity === 'CRITICAL'
          ? 'Quarterly vulnerability assessment evidence expired past regulatory SLA threshold (92 days age).'
          : 'Automated test suite telemetry failed: 2 service accounts detected with unrotated API keys.',
      recommendedAction:
        severity === 'CRITICAL'
          ? 'Trigger automated SAST/DAST re-scan and upload signed remediation confirmation.'
          : 'Revoke and rotate service account secrets immediately via Azure Key Vault / AWS KMS.',
      assignedOwner: 'SecOps Team Lead',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      affectedRiskIds: ['RSK-VULN-01', 'RSK-ACCESS-02'],
      capaId: `capa-${Date.now()}`,
      status: 'OPEN'
    };

    // Temporarily bypass deduplication for on-demand simulation
    const cacheKey = `${mockDrift.controlCode}_${mockDrift.driftType}_${mockDrift.severity}`;
    this.recentBreachCache.delete(cacheKey);

    // Also emit custom event on engine so all subscribers receive it
    continuousComplianceEngine.emitCustomDriftEvent(mockDrift);

    return mockDrift;
  }

  // ==========================================================================
  // Private Utilities
  // ==========================================================================

  private dispatchToHandlers(payload: ComplianceToastPayload): void {
    if (this.toastHandlers.size === 0) {
      console.warn(
        '[ComplianceToastService] Compliance breach detected but no active UI toast handlers registered:',
        payload.title
      );
      return;
    }

    this.toastHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (err) {
        console.error('[ComplianceToastService] Failed to dispatch toast to handler:', err);
      }
    });
  }

  private matchesMinSeverity(severity: DriftSeverity): boolean {
    if (this.config.minSeverity === 'ALL') return true;
    const order: Record<DriftSeverity, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    const minOrder: Record<string, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };

    return (order[severity] || 0) >= (minOrder[this.config.minSeverity] || 1);
  }

  /**
   * Synthesizes a subtle, non-intrusive Web Audio API notification chime
   */
  private playAlertChime(severity: DriftSeverity): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const isCritical = severity === 'CRITICAL';
      const isHigh = severity === 'HIGH';

      osc.type = isCritical ? 'sawtooth' : isHigh ? 'triangle' : 'sine';
      const baseFreq = isCritical ? 880 : isHigh ? 659.25 : 523.25;

      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      if (isCritical) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
      } else if (isHigh) {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15);
      }

      const volume = isCritical ? 0.08 : 0.05;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + (isCritical ? 0.45 : 0.3)
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (isCritical ? 0.5 : 0.35));
    } catch {
      // Audio playback fails silently if browser policy blocks autoplay
    }
  }

  /**
   * Dispatches a navigation or module switch intent across SKANDA UI
   */
  private triggerUIModuleNavigation(moduleId: string, controlCode?: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(
        new CustomEvent('skanda:navigate-module', {
          detail: {
            moduleId,
            tab: 'engine',
            controlCode,
            timestamp: new Date().toISOString()
          },
          bubbles: true
        })
      );
    } catch (e) {
      console.error('[ComplianceToastService] Navigation event error:', e);
    }
  }
}

// ----------------------------------------------------------------------------
// Export Singleton Instance & Factory
// ----------------------------------------------------------------------------

export const complianceToastService = new ComplianceToastService();

export function createComplianceToastService(
  config?: Partial<ComplianceToastAlertConfig>
): ComplianceToastService {
  return new ComplianceToastService(config);
}
