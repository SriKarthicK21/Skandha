// ============================================================================
// SKANDA GRC — BrandGuard Automated Incident Notification Service
// Path: src/services/brandguard/brandguardNotificationService.ts
//
// Automated notification service that monitors real-time BrandGuard threat
// detections and alerts users via ToastProvider when a high-severity domain
// impersonation incident is detected (typosquatting, homoglyph, phishing, combosquat).
// ============================================================================

import { BrandFinding, BrandFindingSeverity, BrandFindingType } from '../../types/brandguard';

export const SKANDA_BRANDGUARD_ALERT_EVENT = 'skanda:brandguard-domain-alert';

export interface BrandGuardToastAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface BrandGuardToastPayload {
  title: string;
  message?: string;
  description?: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  severity?: BrandFindingSeverity;
  badgeText?: string;
  action?: BrandGuardToastAction;
  secondaryAction?: BrandGuardToastAction;
  metadata?: Record<string, any>;
}

export interface BrandGuardNotificationConfig {
  /** Master switch to enable/disable BrandGuard incident toasts */
  enabled: boolean;
  /** Play distinctive security synthesizer audio chime on high-severity detection */
  enableSound: boolean;
  /** Minimum severity filter (default: HIGH, capturing HIGH and CRITICAL) */
  minSeverity: 'ALL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Time window in ms to suppress duplicate toasts for identical domains */
  deduplicationWindowMs: number;
  /** Auto-dismiss durations per severity tier */
  autoDismissDurations: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    INFORMATIONAL?: number;
  };
}

export const DEFAULT_BRANDGUARD_NOTIFICATION_CONFIG: BrandGuardNotificationConfig = {
  enabled: true,
  enableSound: true,
  minSeverity: 'HIGH',
  deduplicationWindowMs: 25000,
  autoDismissDurations: {
    CRITICAL: 10000,
    HIGH: 8000,
    MEDIUM: 6000,
    LOW: 4000
  }
};

type ToastHandler = (toast: BrandGuardToastPayload) => void;

export class BrandGuardNotificationService {
  private config: BrandGuardNotificationConfig = { ...DEFAULT_BRANDGUARD_NOTIFICATION_CONFIG };
  private toastHandlers: Set<ToastHandler> = new Set();
  private recentDomainAlerts: Map<string, number> = new Map();
  private isListeningToWindow: boolean = false;
  private windowCleanupCallbacks: Array<() => void> = [];

  constructor(config?: Partial<BrandGuardNotificationConfig>) {
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
   * Updates configuration settings
   */
  public updateConfig(newConfig: Partial<BrandGuardNotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): BrandGuardNotificationConfig {
    return { ...this.config };
  }

  /**
   * Evaluates if finding qualifies as a domain impersonation threat
   */
  public isDomainImpersonationIncident(finding: BrandFinding): boolean {
    const impersonationTypes: BrandFindingType[] = [
      'TYPOSQUATTING',
      'HOMOGLYPH_DOMAIN',
      'DOMAIN_IMPERSONATION',
      'PHISHING_BRAND_IMPERSONATION',
      'WEBSITE_IMPERSONATION',
      'FAKE_INVESTMENT',
      'EXECUTIVE_IMPERSONATION'
    ];

    const typeMatch = impersonationTypes.includes(finding.findingType);
    const domainTechnique = !!finding.domainIntel?.domainSquattingTechnique;
    const hasImpersonationDomain = !!finding.targetDomain && finding.targetDomain.length > 3;

    return typeMatch || domainTechnique || hasImpersonationDomain;
  }

  /**
   * Checks if severity meets or exceeds the minimum alert threshold
   */
  public matchesMinSeverity(severity: BrandFindingSeverity): boolean {
    if (this.config.minSeverity === 'ALL') return true;
    if (this.config.minSeverity === 'MEDIUM') {
      return severity === 'MEDIUM' || severity === 'HIGH' || severity === 'CRITICAL';
    }
    if (this.config.minSeverity === 'HIGH') {
      return severity === 'HIGH' || severity === 'CRITICAL';
    }
    if (this.config.minSeverity === 'CRITICAL') {
      return severity === 'CRITICAL';
    }
    return false;
  }

  /**
   * Primary entrypoint: notifies users when BrandGuard detects an incident
   */
  public notifyFinding(
    finding: BrandFinding,
    options?: {
      onInspect?: () => void;
      onRemediate?: () => void;
      suppressSound?: boolean;
    }
  ): boolean {
    if (!this.config.enabled) return false;

    // Must be high-severity domain impersonation
    if (!this.matchesMinSeverity(finding.severity)) {
      return false;
    }
    if (!this.isDomainImpersonationIncident(finding)) {
      return false;
    }

    const domainKey = (finding.targetDomain || finding.id).toLowerCase();
    const now = Date.now();
    const lastAlertTime = this.recentDomainAlerts.get(domainKey);

    // Deduplication check: prevent toast flood for the same domain within deduplicationWindowMs
    if (lastAlertTime && now - lastAlertTime < this.config.deduplicationWindowMs) {
      return false;
    }
    this.recentDomainAlerts.set(domainKey, now);

    // Clean up stale cache
    if (this.recentDomainAlerts.size > 100) {
      for (const [key, time] of this.recentDomainAlerts.entries()) {
        if (now - time > 120000) {
          this.recentDomainAlerts.delete(key);
        }
      }
    }

    // Play subtle audio alert if enabled
    if (this.config.enableSound && !options?.suppressSound) {
      this.playAlertChime(finding.severity);
    }

    const isCritical = finding.severity === 'CRITICAL';
    const technique = finding.domainIntel?.domainSquattingTechnique || 'IMPERSONATION';
    const registrar = finding.domainIntel?.registrar || 'External Registrar';
    const hasMx = !!finding.domainIntel?.emailSecurity?.hasMx;

    const title = `${isCritical ? 'CRITICAL' : 'HIGH'} Brand Impersonation Alert: [${finding.findingCode}]`;
    const message = `Detected rogue domain "${finding.targetDomain}" actively impersonating official corporate brand (${technique}).`;
    const description = `Registrar: ${registrar} | Risk Score: ${finding.riskScore?.totalScore || (isCritical ? 94 : 82)}/100${hasMx ? ' | Active MX Open Relay' : ''}`;

    const payload: BrandGuardToastPayload = {
      title,
      message,
      description,
      type: 'error',
      severity: finding.severity,
      duration: this.config.autoDismissDurations[finding.severity] || 8000,
      badgeText: `${finding.severity} &bull; ${technique}`,
      action: {
        label: 'Inspect & Takedown',
        onClick: () => {
          if (options?.onInspect) {
            options.onInspect();
          } else {
            this.triggerNavigation('brandguard', finding.id);
          }
        },
        primary: true
      },
      secondaryAction: {
        label: 'Open Remediation',
        onClick: () => {
          if (options?.onRemediate) {
            options.onRemediate();
          } else {
            this.triggerNavigation('remediation_desk');
          }
        }
      },
      metadata: {
        findingId: finding.id,
        findingCode: finding.findingCode,
        domain: finding.targetDomain,
        technique,
        severity: finding.severity
      }
    };

    // Dispatch to registered UI toast handlers (ToastProvider)
    this.dispatchToHandlers(payload);

    // Also dispatch browser DOM CustomEvent for decoupled subscribers
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        const customEvent = new CustomEvent(SKANDA_BRANDGUARD_ALERT_EVENT, {
          detail: { finding, payload }
        });
        window.dispatchEvent(customEvent);
      } catch {
        // Fallback for restricted environments
      }
    }

    return true;
  }

  /**
   * Dispatches a generic BrandGuard toast notification
   */
  public showNotification(options: {
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  }): void {
    const toastType = (options.type?.toLowerCase() || 'info') as 'info' | 'success' | 'warning' | 'error';
    const payload: BrandGuardToastPayload = {
      title: options.title,
      message: options.message,
      description: options.message,
      type: toastType,
      duration: 5000,
    };
    this.toastHandlers.forEach((handler) => handler(payload));
  }

  /**
   * Helper to simulate a high-severity impersonation incident (e.g. for user testing or demo)
   */
  public simulateHighSeverityImpersonation(customDomain?: string): BrandFinding {
    const domain = customDomain || `apex-portal-auth-${Math.floor(1000 + Math.random() * 9000)}.com`;
    const finding: BrandFinding = {
      id: `sim_bg_${Date.now()}`,
      tenantId: 'default_tenant',
      findingCode: `BF-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: `High-Risk Phishing Domain Impersonation: ${domain}`,
      findingType: 'TYPOSQUATTING',
      severity: 'CRITICAL',
      status: 'UNDER_INVESTIGATION',
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      targetUrl: `https://${domain}/login/sso`,
      targetDomain: domain,
      owner: 'Cyber Threat Lead',
      logoSimilarityScore: 96,
      brandNameSimilarityScore: 98,
      domainSimilarityScore: 92,
      websiteVisualSimilarityScore: 89,
      overallConfidence: 95,
      riskScore: {
        totalScore: 94,
        severity: 'CRITICAL',
        scoreBreakdown: {
          logoSimilarityPoints: 24,
          brandNameSimilarityPoints: 15,
          domainSimilarityPoints: 14,
          executiveAssociationPoints: 8,
          websiteVisualSimilarityPoints: 9,
          phishingLoginIndicatorsPoints: 15,
          infrastructureRiskPoints: 5,
          reputationContextPoints: 4
        },
        contributingFactors: [
          { factorName: 'Logo Match', pointsAwarded: 24, description: '96% Perceptual Hash match' },
          { factorName: 'SSO Credential Form', pointsAwarded: 15, description: 'Active credential harvester' }
        ]
      },
      domainIntel: {
        domain,
        firstSeenDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrar: 'NameCheap Privacy Shield',
        nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
        resolvedIPs: ['104.21.72.18'],
        asn: 'AS13335',
        asnOrg: 'Cloudflare Edge CDN',
        hostingProvider: 'Cloudflare',
        countryCode: 'US',
        emailSecurity: {
          hasMx: true,
          hasSpf: false,
          hasDmarc: false
        },
        domainSquattingTechnique: 'COMBOSQUATTING'
      },
      webPageAnalysis: {
        url: `https://${domain}/login/sso`,
        domain,
        pageTitle: 'Apex Corporate Access Portal - Login',
        metaDescription: 'Secure Single Sign-On Authentication Gateway',
        visibleTextExcerpt: 'Enter your corporate email credentials and 2FA passcode.',
        ocrExtractedText: 'Apex Corporate Portal SSO Login',
        ocrConfidence: 95,
        screenshotUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
        detectedForms: {
          hasLoginForm: true,
          hasPaymentForm: false,
          hasPasswordInput: true,
          isCredentialHarvesterSuspect: true
        },
        httpMetadata: {
          statusCode: 200,
          redirectChain: [],
          contentLength: 4210
        },
        detectedContactInfo: {
          emails: [],
          phoneNumbers: [],
          telegramLinks: [],
          whatsappLinks: []
        },
        detectedTechnologies: ['Nginx', 'React'],
        sandboxSecurityFlags: {
          ssrfBlocked: true,
          privateIpBlocked: true,
          dnsRebindingProtected: true,
          isolatedExecutionClean: true
        }
      },
      evidence: {
        evidenceId: `evi_${Date.now()}`,
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        timestamp: new Date().toISOString(),
        discoveredUrl: `https://${domain}/login/sso`,
        domain,
        discoveryProvider: 'Skanda Discovery Engine',
        htmlSnapshotLength: 4210,
        screenshotArtifactUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
        ocrTextExcerpt: 'Apex Corporate Portal SSO Login',
        cryptographicSignature: 'ed25519:7c3aed...',
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      },
      isWhitelisted: false,
      decisionHistory: []
    };

    // Emit the notification
    this.notifyFinding(finding);
    return finding;
  }

  /**
   * Starts automatic DOM CustomEvent listener for decoupled BrandGuard detection events
   */
  public startAutoListening(): () => void {
    this.stopAutoListening();

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const alertHandler = (e: Event) => {
        const customEvt = e as CustomEvent<{ finding: BrandFinding }>;
        if (customEvt.detail?.finding) {
          this.notifyFinding(customEvt.detail.finding);
        }
      };

      window.addEventListener('skanda:brandguard-detect-finding', alertHandler);
      this.isListeningToWindow = true;

      this.windowCleanupCallbacks.push(() => {
        window.removeEventListener('skanda:brandguard-detect-finding', alertHandler);
      });
    }

    return () => this.stopAutoListening();
  }

  public stopAutoListening(): void {
    this.windowCleanupCallbacks.forEach(cleanup => {
      try {
        cleanup();
      } catch {
        // Ignore cleanup errors
      }
    });
    this.windowCleanupCallbacks = [];
    this.isListeningToWindow = false;
  }

  private dispatchToHandlers(payload: BrandGuardToastPayload): void {
    this.toastHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (err) {
        console.error('[BrandGuardNotificationService] Error executing toast handler:', err);
      }
    });
  }

  /**
   * Triggers global SPA navigation via custom event
   */
  private triggerNavigation(moduleId: string, findingId?: string): void {
    if (typeof window === 'undefined') return;
    try {
      const event = new CustomEvent('skanda:navigate-module', {
        detail: { moduleId, findingId }
      });
      window.dispatchEvent(event);
    } catch {
      // Fallback
    }
  }

  /**
   * Subtle alert chime using Web Audio API synthesis
   */
  private playAlertChime(severity: BrandFindingSeverity): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';

      const now = ctx.currentTime;
      if (severity === 'CRITICAL') {
        // High-pitched double urgency beep
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(987.77, now + 0.2); // B5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // Elevated warning tone
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(783.99, now + 0.15); // G5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio autoplay policy handled silently
    }
  }
}

// Global Singleton Instance
export const brandGuardNotificationService = new BrandGuardNotificationService();
