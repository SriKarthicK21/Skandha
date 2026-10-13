/**
 * KPI Alert Threshold Utilities & Configuration for SKANDA Executive Command Center
 * 
 * Manages configurable critical alert thresholds (default 85%) for KPI metric cards.
 * When a key metric drops below this threshold, a subtle pulsing glow border animation
 * and executive beacon are activated to draw immediate leadership attention.
 */

export interface KPIAlertThresholdConfig {
  /** Critical threshold percentage below which cards trigger pulsing alert (default: 85) */
  criticalThreshold: number;
  /** Warning threshold percentage (default: 90) */
  warningThreshold: number;
  /** Whether the subtle pulsing glow animation is enabled (default: true) */
  isPulsingEnabled: boolean;
}

export const DEFAULT_KPI_ALERT_CONFIG: KPIAlertThresholdConfig = {
  criticalThreshold: 85,
  warningThreshold: 90,
  isPulsingEnabled: true
};

/** Preset critical threshold options for fast executive switching */
export const THRESHOLD_PRESETS = [
  { value: 75, label: '75% (Relaxed)', description: 'Flags severe compliance failures only' },
  { value: 80, label: '80% (Moderate)', description: 'Standard industry tolerance baseline' },
  { value: 85, label: '85% (Executive Recommended)', description: 'Rigorous MAS TRM & ISO 27001 posture' },
  { value: 90, label: '90% (Strict)', description: 'Zero-tolerance surveillance audit threshold' },
  { value: 95, label: '95% (High Assurance)', description: 'Critical infrastructure target' }
];

/**
 * Parses numeric score from any standard metric string or number representation
 * e.g., "95.2%" -> 95.2, "71%" -> 71, 87 -> 87, "88 / 93" -> 94.6
 */
export function parseMetricNumericValue(val: string | number | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  const str = String(val).trim();

  // Fraction format: "88 / 93" or "88/93"
  const fractionMatch = str.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den > 0) return Math.round((num / den) * 1000) / 10;
  }

  // Percentage or standard decimal: "95.2%", "71%", "3.2 / 10"
  const cleaned = str.replace(/[^0-9.-]/g, '');
  if (!cleaned) return null;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Determines whether a metric has breached the critical threshold
 */
export function isMetricCritical(
  value: string | number | undefined | null,
  criticalThreshold: number = DEFAULT_KPI_ALERT_CONFIG.criticalThreshold,
  options?: { inverted?: boolean; isPercentage?: boolean }
): boolean {
  const numeric = parseMetricNumericValue(value);
  if (numeric === null) return false;

  // If inverted (e.g. critical risks count, where higher is worse)
  if (options?.inverted) {
    // For inverted counts: e.g. critical risks count > 0 is critical
    return numeric > 0;
  }

  // Standard percentage or score metric: below critical threshold triggers alert
  return numeric < criticalThreshold;
}

/**
 * Loads the saved KPI Alert Threshold configuration for the tenant from local storage
 */
export function getStoredKPIAlertConfig(tenantId?: string): KPIAlertThresholdConfig {
  try {
    const key = `skanda_kpi_alert_thresholds_${tenantId || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        criticalThreshold: typeof parsed.criticalThreshold === 'number' ? parsed.criticalThreshold : 85,
        warningThreshold: typeof parsed.warningThreshold === 'number' ? parsed.warningThreshold : 90,
        isPulsingEnabled: typeof parsed.isPulsingEnabled === 'boolean' ? parsed.isPulsingEnabled : true
      };
    }
  } catch (err) {
    console.warn('Failed to read KPI alert configuration from storage:', err);
  }
  return DEFAULT_KPI_ALERT_CONFIG;
}

/**
 * Persists the KPI Alert Threshold configuration for the tenant to local storage
 */
export function saveStoredKPIAlertConfig(config: KPIAlertThresholdConfig, tenantId?: string): void {
  try {
    const key = `skanda_kpi_alert_thresholds_${tenantId || 'default'}`;
    localStorage.setItem(key, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save KPI alert configuration to storage:', err);
  }
}
