import { ControlItem } from '../types';

export type PerformanceStatus = 'Implemented' | 'Partially Implemented' | 'Planned';

export interface PerformanceStatusConfig {
  label: PerformanceStatus;
  color: string;
  fillColor: string;
  lightBg: string;
  darkBg: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  accentGradient: string;
  description: string;
  shortDesc: string;
}

export const PERFORMANCE_STATUS_CONFIG: Record<PerformanceStatus, PerformanceStatusConfig> = {
  'Implemented': {
    label: 'Implemented',
    color: '#10B981', // emerald-500
    fillColor: '#10B981',
    lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    darkBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    accentGradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    description: 'Fully operational, continuously monitored, or formally auditor-verified safeguards',
    shortDesc: 'Operational & Audited'
  },
  'Partially Implemented': {
    label: 'Partially Implemented',
    color: '#F59E0B', // amber-500
    fillColor: '#F59E0B',
    lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    darkBg: 'bg-amber-950/40 text-amber-300 border-amber-800/80',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800',
    accentGradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    description: 'Active remediation underway; operational safeguard deployed in partial capacity',
    shortDesc: 'Remediation In Progress'
  },
  'Planned': {
    label: 'Planned',
    color: '#6366F1', // indigo-500
    fillColor: '#6366F1',
    lightBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    darkBg: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/80',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500',
    badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
    accentGradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
    description: 'Roadmapped for future implementation, scheduled milestone, or defensible exclusion',
    shortDesc: 'Roadmapped / Scheduled'
  }
};

/**
 * Normalizes any control implementationStatus into one of the 3 requested categories:
 * - Implemented
 * - Partially Implemented
 * - Planned
 */
export function getControlPerformanceStatus(status?: string): PerformanceStatus {
  if (!status) return 'Planned';
  const clean = status.trim().toLowerCase();

  if (
    clean === 'implemented' ||
    clean === 'audited' ||
    clean === 'monitored' ||
    clean === 'operational'
  ) {
    return 'Implemented';
  }

  if (
    clean === 'partially implemented' ||
    clean === 'in progress' ||
    clean === 'in-progress' ||
    clean === 'underway' ||
    clean === 'partial'
  ) {
    return 'Partially Implemented';
  }

  if (
    clean === 'planned' ||
    clean === 'not started' ||
    clean === 'not-started' ||
    clean === 'gap identified' ||
    clean === 'pending'
  ) {
    return 'Planned';
  }

  return 'Planned';
}

export interface ThemePerformanceBreakdown {
  themeKey: 'Organizational' | 'People' | 'Physical' | 'Technological';
  clause: string;
  total: number;
  implemented: number;
  partiallyImplemented: number;
  planned: number;
  completionRate: number;
}

export interface DoughnutChartSlice {
  name: PerformanceStatus;
  value: number;
  percent: number;
  color: string;
  fill: string;
  description: string;
}

export interface ControlPerformanceSummary {
  totalControls: number;
  implementedCount: number;
  implementedPercent: number;
  partiallyImplementedCount: number;
  partiallyImplementedPercent: number;
  plannedCount: number;
  plannedPercent: number;
  chartData: DoughnutChartSlice[];
  themeBreakdowns: ThemePerformanceBreakdown[];
  auditReadinessScore: number;
  targetMet: boolean;
}

const THEME_DEFS: { key: 'Organizational' | 'People' | 'Physical' | 'Technological'; clause: string }[] = [
  { key: 'Organizational', clause: 'Annex A.5' },
  { key: 'People', clause: 'Annex A.6' },
  { key: 'Physical', clause: 'Annex A.7' },
  { key: 'Technological', clause: 'Annex A.8' }
];

/**
 * Calculates comprehensive performance metrics across ISO 27001:2022 controls
 */
export function calculateControlPerformance(controls: ControlItem[]): ControlPerformanceSummary {
  // Filter for ISO 27001 Annex A controls (93 controls catalogue)
  const iso27001Controls = controls.filter(
    c => (!c.framework || c.framework.includes('27001')) && !c.framework?.includes('42001')
  );

  const effectiveControls = iso27001Controls.length > 0 ? iso27001Controls : controls;
  const total = effectiveControls.length || 93;

  let imp = 0;
  let partial = 0;
  let planned = 0;

  effectiveControls.forEach(ctrl => {
    const perf = getControlPerformanceStatus(ctrl.implementationStatus);
    if (perf === 'Implemented') imp++;
    else if (perf === 'Partially Implemented') partial++;
    else planned++;
  });

  const impPct = total > 0 ? Math.round((imp / total) * 1000) / 10 : 0;
  const partialPct = total > 0 ? Math.round((partial / total) * 1000) / 10 : 0;
  const plannedPct = total > 0 ? Math.max(0, Math.round((100 - impPct - partialPct) * 10) / 10) : 0;

  const chartData: DoughnutChartSlice[] = [
    {
      name: 'Implemented',
      value: imp,
      percent: impPct,
      color: PERFORMANCE_STATUS_CONFIG['Implemented'].color,
      fill: PERFORMANCE_STATUS_CONFIG['Implemented'].fillColor,
      description: PERFORMANCE_STATUS_CONFIG['Implemented'].description
    },
    {
      name: 'Partially Implemented',
      value: partial,
      percent: partialPct,
      color: PERFORMANCE_STATUS_CONFIG['Partially Implemented'].color,
      fill: PERFORMANCE_STATUS_CONFIG['Partially Implemented'].fillColor,
      description: PERFORMANCE_STATUS_CONFIG['Partially Implemented'].description
    },
    {
      name: 'Planned',
      value: planned,
      percent: plannedPct,
      color: PERFORMANCE_STATUS_CONFIG['Planned'].color,
      fill: PERFORMANCE_STATUS_CONFIG['Planned'].fillColor,
      description: PERFORMANCE_STATUS_CONFIG['Planned'].description
    }
  ];

  // Calculate Theme Breakdowns
  const themeBreakdowns: ThemePerformanceBreakdown[] = THEME_DEFS.map(def => {
    const list = effectiveControls.filter(
      c => c.category?.toLowerCase() === def.key.toLowerCase()
    );
    const themeTotal = list.length || 1;
    let tImp = 0;
    let tPartial = 0;
    let tPlanned = 0;

    list.forEach(c => {
      const p = getControlPerformanceStatus(c.implementationStatus);
      if (p === 'Implemented') tImp++;
      else if (p === 'Partially Implemented') tPartial++;
      else tPlanned++;
    });

    const completionRate = Math.round((tImp / themeTotal) * 100);

    return {
      themeKey: def.key,
      clause: def.clause,
      total: list.length,
      implemented: tImp,
      partiallyImplemented: tPartial,
      planned: tPlanned,
      completionRate
    };
  });

  // Audit readiness score is weighted: Implemented (100%), Partially Implemented (50%), Planned (0%)
  const readiness = total > 0 ? Math.round(((imp + partial * 0.5) / total) * 100) : 0;

  return {
    totalControls: total,
    implementedCount: imp,
    implementedPercent: impPct,
    partiallyImplementedCount: partial,
    partiallyImplementedPercent: partialPct,
    plannedCount: planned,
    plannedPercent: plannedPct,
    chartData,
    themeBreakdowns,
    auditReadinessScore: readiness,
    targetMet: impPct >= 75
  };
}
