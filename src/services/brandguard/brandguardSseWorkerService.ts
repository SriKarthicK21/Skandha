// Skanda BrandGuard — Real-Time WebSocket / SSE Ingestion Worker Simulator
// Simulates server-side streaming worker performing wire-speed bloom filtering,
// Levenshtein / homoglyph pruning, and push-based SSE alerts before hitting the client.

import { BrandProfile } from '../../types/brandguard';

export interface SseIngestionEvent {
  eventId: string;
  timestamp: string;
  sourceStream: 'CERTIFICATE_TRANSPARENCY_OAK' | 'CRTX_GOOGLE_ARGON' | 'ACTIVE_DNS_PDNS_FEED' | 'DARK_WEB_IRC_GATEWAY';
  rawCandidate: string;
  bloomFilterPassed: boolean;
  levenshteinDistance: number;
  homoglyphMatchRatio: number;
  processingLatencyMs: number;
  verdict: 'DROPPED_BENIGN_NOISE' | 'PRUNED_IRRELEVANT' | 'ESCALATED_HIGH_PROBABILITY_CLONE';
  targetBrandMatch: string;
}

export type SseCallback = (event: SseIngestionEvent) => void;

export class BrandGuardSseWorkerService {
  private static subscribers: Set<SseCallback> = new Set();
  private static isStreaming = false;
  private static intervalHandle: any = null;
  private static simulatedEvents: SseIngestionEvent[] = [];

  public static startSseStream(brandProfile: BrandProfile, onEvent: SseCallback): () => void {
    this.subscribers.add(onEvent);

    if (!this.isStreaming) {
      this.isStreaming = true;
      this.intervalHandle = setInterval(() => {
        const event = this.generateSyntheticSseEvent(brandProfile);
        this.simulatedEvents.unshift(event);
        if (this.simulatedEvents.length > 80) this.simulatedEvents.pop();
        
        this.subscribers.forEach(cb => cb(event));
      }, 3500);
    }

    return () => {
      this.subscribers.delete(onEvent);
      if (this.subscribers.size === 0 && this.intervalHandle) {
        clearInterval(this.intervalHandle);
        this.isStreaming = false;
      }
    };
  }

  public static getRecentWorkerEvents(): SseIngestionEvent[] {
    return [...this.simulatedEvents];
  }

  private static generateSyntheticSseEvent(brandProfile: BrandProfile): SseIngestionEvent {
    const primaryBrand = brandProfile.brandNames?.[0] || brandProfile.organizationName || 'Enterprise';
    const clean = primaryBrand.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';
    const candidates = [
      { domain: `${clean}-custody-login.com`, brand: primaryBrand, verdict: 'ESCALATED_HIGH_PROBABILITY_CLONE', dist: 1, homoglyph: 0.94, bloom: true },
      { domain: 'skanda-grc-portal-auth.net', brand: 'Skanda GRC', verdict: 'ESCALATED_HIGH_PROBABILITY_CLONE', dist: 2, homoglyph: 0.88, bloom: true },
      { domain: 'random-unrelated-blog-xyz.org', brand: 'None', verdict: 'DROPPED_BENIGN_NOISE', dist: 8, homoglyph: 0.05, bloom: false },
      { domain: `${clean}-recovery.io`, brand: primaryBrand, verdict: 'ESCALATED_HIGH_PROBABILITY_CLONE', dist: 1, homoglyph: 0.96, bloom: true },
      { domain: 'security-general-news-bulletin.com', brand: 'None', verdict: 'PRUNED_IRRELEVANT', dist: 5, homoglyph: 0.22, bloom: true },
      { domain: `а${clean.slice(1)}-vip.cc`, brand: primaryBrand, verdict: 'ESCALATED_HIGH_PROBABILITY_CLONE', dist: 0, homoglyph: 0.99, bloom: true }
    ];

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const streams: SseIngestionEvent['sourceStream'][] = [
      'CERTIFICATE_TRANSPARENCY_OAK',
      'CRTX_GOOGLE_ARGON',
      'ACTIVE_DNS_PDNS_FEED',
      'DARK_WEB_IRC_GATEWAY'
    ];

    return {
      eventId: `SSE-${Date.now().toString().slice(-6)}-${Math.random().toString(16).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      sourceStream: streams[Math.floor(Math.random() * streams.length)],
      rawCandidate: pick.domain,
      bloomFilterPassed: pick.bloom,
      levenshteinDistance: pick.dist,
      homoglyphMatchRatio: pick.homoglyph,
      processingLatencyMs: Math.floor(Math.random() * 8) + 2, // 2-10ms wire-speed
      verdict: pick.verdict as any,
      targetBrandMatch: pick.brand
    };
  }
}
