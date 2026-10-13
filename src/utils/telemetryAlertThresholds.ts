/**
 * Telemetry Alert Threshold Utilities & Configuration for SKANDA Command Center
 *
 * Provides configurable alert thresholds for live data throughput (pkts/min, pkts/sec),
 * network round-trip latency (ms), and packet jitter variance (ms).
 * Evaluates real-time streams and triggers high-visibility visual indicators
 * for breached limits across the Command Center dashboard.
 */

export interface TelemetryAlertThresholdConfig {
  /** Warning latency threshold in milliseconds (default: 25ms) */
  latencyWarningMs: number;
  /** Critical latency threshold in milliseconds (default: 45ms) */
  latencyCriticalMs: number;
  /** Max acceptable jitter variance in milliseconds (default: 4.0ms) */
  maxJitterMs: number;
  /** Minimum acceptable data throughput in packets per minute (default: 150 pkts/min) */
  throughputMinPacketsPerMin: number;
  /** Minimum acceptable data throughput in packets per second (default: 2.5 pkts/sec) */
  throughputMinPacketsPerSec: number;
  /** Whether visual pulsing border & glow animations are enabled for breached limits */
  isVisualPulseEnabled: boolean;
  /** Whether breach alert badges and warning banners are displayed */
  showBreachBanners: boolean;
  /** Whether simulated network stress test is active */
  isSimulatedBreachActive?: boolean;
  /** Audio alert chime on breach */
  enableAudioChime?: boolean;
}

export const DEFAULT_TELEMETRY_ALERT_CONFIG: TelemetryAlertThresholdConfig = {
  latencyWarningMs: 25,
  latencyCriticalMs: 45,
  maxJitterMs: 4.0,
  throughputMinPacketsPerMin: 150,
  throughputMinPacketsPerSec: 2.5,
  isVisualPulseEnabled: true,
  showBreachBanners: true,
  isSimulatedBreachActive: false,
  enableAudioChime: false
};

export interface TelemetrySLAPreset {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  config: Omit<TelemetryAlertThresholdConfig, 'isVisualPulseEnabled' | 'showBreachBanners' | 'isSimulatedBreachActive' | 'enableAudioChime'>;
}

export const TELEMETRY_SLA_PRESETS: TelemetrySLAPreset[] = [
  {
    id: 'strict-financial',
    name: 'Strict Financial & SOC 2 SLA',
    shortLabel: 'Strict (15ms / 220 pkts)',
    description: 'Zero-tolerance posture for banking, payment pipelines, and high-frequency GRC audit sync.',
    config: {
      latencyWarningMs: 15,
      latencyCriticalMs: 30,
      maxJitterMs: 2.5,
      throughputMinPacketsPerMin: 220,
      throughputMinPacketsPerSec: 3.5
    }
  },
  {
    id: 'standard-enterprise',
    name: 'Standard Enterprise SLA (Recommended)',
    shortLabel: 'Enterprise (25ms / 150 pkts)',
    description: 'Balanced compliance telemetry envelope for AWS, GitHub, Okta, and Cloudflare connectors.',
    config: {
      latencyWarningMs: 25,
      latencyCriticalMs: 45,
      maxJitterMs: 4.0,
      throughputMinPacketsPerMin: 150,
      throughputMinPacketsPerSec: 2.5
    }
  },
  {
    id: 'high-volume',
    name: 'High Ingress Stream Volume',
    shortLabel: 'High Volume (35ms / 300 pkts)',
    description: 'Engineered for dense Kubernetes clusters and distributed multi-cloud logging nodes.',
    config: {
      latencyWarningMs: 35,
      latencyCriticalMs: 60,
      maxJitterMs: 5.5,
      throughputMinPacketsPerMin: 300,
      throughputMinPacketsPerSec: 5.0
    }
  },
  {
    id: 'relaxed-dev',
    name: 'Relaxed / Low-Bandwidth Mode',
    shortLabel: 'Relaxed (50ms / 60 pkts)',
    description: 'Tolerant baseline for staging clusters, edge nodes, or intermittent sandbox telemetry.',
    config: {
      latencyWarningMs: 50,
      latencyCriticalMs: 80,
      maxJitterMs: 8.0,
      throughputMinPacketsPerMin: 60,
      throughputMinPacketsPerSec: 1.0
    }
  }
];

export interface TelemetryBreachEvaluation {
  hasBreach: boolean;
  severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  isLatencyWarning: boolean;
  isLatencyCritical: boolean;
  isJitterBreached: boolean;
  isThroughputBreached: boolean;
  breachCount: number;
  breachMessages: string[];
  summaryMessage: string;
}

/**
 * Evaluates current real-time telemetry against user-configured threshold alerts
 */
export function evaluateTelemetryBreaches(
  stats: {
    latencyMs: number;
    jitterMs: number;
    packetsPerMin: number;
    packetsPerSec: number;
    flowSpeed?: 'normal' | 'fast' | 'paused';
  },
  config: TelemetryAlertThresholdConfig = DEFAULT_TELEMETRY_ALERT_CONFIG
): TelemetryBreachEvaluation {
  // If simulated breach is active, inject an alert state for demonstration and testing
  const latency = config.isSimulatedBreachActive ? Math.max(stats.latencyMs, 48) : stats.latencyMs;
  const jitter = config.isSimulatedBreachActive ? Math.max(stats.jitterMs, 6.2) : stats.jitterMs;
  const packetsPerMin = config.isSimulatedBreachActive ? Math.min(stats.packetsPerMin, 110) : stats.packetsPerMin;
  const packetsPerSec = config.isSimulatedBreachActive ? Math.min(stats.packetsPerSec, 1.8) : stats.packetsPerSec;

  const breachMessages: string[] = [];
  const isLatencyCritical = latency >= config.latencyCriticalMs;
  const isLatencyWarning = !isLatencyCritical && latency >= config.latencyWarningMs;
  const isJitterBreached = jitter > config.maxJitterMs;

  // Throughput check (only active when flow is not paused by user)
  const isPaused = stats.flowSpeed === 'paused';
  const isThroughputBreached = !isPaused && (
    packetsPerMin < config.throughputMinPacketsPerMin ||
    packetsPerSec < config.throughputMinPacketsPerSec
  );

  if (isLatencyCritical) {
    breachMessages.push(`Critical Latency: ${latency}ms exceeds critical limit (${config.latencyCriticalMs}ms)`);
  } else if (isLatencyWarning) {
    breachMessages.push(`Elevated Latency: ${latency}ms exceeds warning threshold (${config.latencyWarningMs}ms)`);
  }

  if (isJitterBreached) {
    breachMessages.push(`High Jitter: ±${jitter}ms exceeds variance limit (±${config.maxJitterMs}ms)`);
  }

  if (isThroughputBreached) {
    breachMessages.push(
      `Throughput Low: ${packetsPerMin} pkts/min below minimum target (${config.throughputMinPacketsPerMin} pkts/min)`
    );
  }

  const breachCount = breachMessages.length;
  const hasBreach = breachCount > 0;
  const severity: 'NOMINAL' | 'WARNING' | 'CRITICAL' = isLatencyCritical
    ? 'CRITICAL'
    : breachCount > 0
    ? 'WARNING'
    : 'NOMINAL';

  let summaryMessage = 'All telemetry metrics within custom SLA thresholds.';
  if (isLatencyCritical) {
    summaryMessage = `Critical SLA Breach: Latency (${latency}ms > ${config.latencyCriticalMs}ms)`;
  } else if (isLatencyWarning) {
    summaryMessage = `SLA Warning: Latency elevated (${latency}ms > ${config.latencyWarningMs}ms)`;
  } else if (isThroughputBreached) {
    summaryMessage = `Throughput Warning: Ingress (${packetsPerMin} pkts/min < ${config.throughputMinPacketsPerMin})`;
  } else if (isJitterBreached) {
    summaryMessage = `Jitter Warning: Variance (±${jitter}ms > ±${config.maxJitterMs}ms)`;
  }

  return {
    hasBreach,
    severity,
    isLatencyWarning,
    isLatencyCritical,
    isJitterBreached,
    isThroughputBreached,
    breachCount,
    breachMessages,
    summaryMessage
  };
}

const STORAGE_KEY_PREFIX = 'skanda_telemetry_alert_config';

export function getStoredTelemetryAlertConfig(tenantId?: string): TelemetryAlertThresholdConfig {
  try {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId || 'default'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_TELEMETRY_ALERT_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TELEMETRY_ALERT_CONFIG,
      ...parsed
    };
  } catch (err) {
    console.warn('Failed to parse stored telemetry alert config:', err);
    return { ...DEFAULT_TELEMETRY_ALERT_CONFIG };
  }
}

export function saveStoredTelemetryAlertConfig(
  config: TelemetryAlertThresholdConfig,
  tenantId?: string
): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId || 'default'}`;
    localStorage.setItem(key, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to persist telemetry alert config:', err);
  }
}
