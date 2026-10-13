export interface MonthOverMonthDataPoint {
  month: string;
  year: number;
  fullDate: string;
  date?: string;
  value: number;
  previousValue?: number;
  delta?: number;
  deltaFormatted?: string;
  isImprovement: boolean;
  statusLabel?: string;
  milestone?: string;
}

export interface MetricMoMSummary {
  id: string;
  name: string;
  shortLabel: string;
  unit: string;
  currentValue: number;
  previousMonthValue: number;
  momDelta: number;
  momDeltaFormatted: string;
  momPercentageChange: number;
  sixMonthTotalChange: number;
  isImprovement: boolean;
  invertColor?: boolean;
  themeColor: 'emerald' | 'rose' | 'indigo' | 'sky' | 'amber' | 'purple' | 'slate';
  targetBenchmark: string;
  history: MonthOverMonthDataPoint[];
}

/**
 * Standard 6-Month Month-Over-Month dataset for SKANDA's key compliance metrics (Apr 2026 - Sep 2026)
 * Reflecting verifiable enterprise compliance progression leading to Stage 2 readiness.
 */
export const MOM_COMPLIANCE_METRICS: Record<string, MetricMoMSummary> = {
  compliance_health: {
    id: 'compliance_health',
    name: 'Overall Compliance Health',
    shortLabel: 'Compliance Health',
    unit: '%',
    currentValue: 96.4,
    previousMonthValue: 95.8,
    momDelta: 0.6,
    momDeltaFormatted: '+0.6%',
    momPercentageChange: 0.63,
    sixMonthTotalChange: 7.2,
    isImprovement: true,
    invertColor: false,
    themeColor: 'indigo',
    targetBenchmark: '≥ 90.0% (Stage 2 Threshold)',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 89.2, isImprovement: true, milestone: 'Q1 Gap Closure Initiated' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 91.0, previousValue: 89.2, delta: 1.8, deltaFormatted: '+1.8%', isImprovement: true, milestone: 'Information Security Policy Signed' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 92.8, previousValue: 91.0, delta: 1.8, deltaFormatted: '+1.8%', isImprovement: true, milestone: 'Q2 Surveillance Audit Passed' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 94.5, previousValue: 92.8, delta: 1.7, deltaFormatted: '+1.7%', isImprovement: true, milestone: 'Cloud Access Reviews Completed' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 95.8, previousValue: 94.5, delta: 1.3, deltaFormatted: '+1.3%', isImprovement: true, milestone: 'Annex A Technical Controls Validated' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 96.4, previousValue: 95.8, delta: 0.6, deltaFormatted: '+0.6%', isImprovement: true, milestone: 'Stage 2 Pre-Audit Lockout' }
    ]
  },
  controls_effective: {
    id: 'controls_effective',
    name: 'Control Operational Effectiveness',
    shortLabel: 'Controls Effective',
    unit: '%',
    currentValue: 95.0,
    previousMonthValue: 93.8,
    momDelta: 1.2,
    momDeltaFormatted: '+1.2%',
    momPercentageChange: 1.28,
    sixMonthTotalChange: 10.0,
    isImprovement: true,
    invertColor: false,
    themeColor: 'emerald',
    targetBenchmark: '≥ 90.0% (Annex A Standard)',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 85.0, isImprovement: true, milestone: '79 / 93 Verified' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 87.5, previousValue: 85.0, delta: 2.5, deltaFormatted: '+2.5%', isImprovement: true, milestone: '81 / 93 Verified' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 90.0, previousValue: 87.5, delta: 2.5, deltaFormatted: '+2.5%', isImprovement: true, milestone: '84 / 93 Verified' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 92.2, previousValue: 90.0, delta: 2.2, deltaFormatted: '+2.2%', isImprovement: true, milestone: '86 / 93 Verified' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 93.8, previousValue: 92.2, delta: 1.6, deltaFormatted: '+1.6%', isImprovement: true, milestone: '87 / 93 Verified' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 95.0, previousValue: 93.8, delta: 1.2, deltaFormatted: '+1.2%', isImprovement: true, milestone: '88 / 93 Verified' }
    ]
  },
  open_findings: {
    id: 'open_findings',
    name: 'Open Audit Non-Conformities & CAPA',
    shortLabel: 'Open Findings',
    unit: 'items',
    currentValue: 1,
    previousMonthValue: 3,
    momDelta: -2,
    momDeltaFormatted: '-2',
    momPercentageChange: -66.7,
    sixMonthTotalChange: -8,
    isImprovement: true,
    invertColor: true,
    themeColor: 'amber',
    targetBenchmark: '0 Major, ≤ 3 Minor',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 9, isImprovement: false, milestone: 'Internal Audit Non-Conformities' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 7, previousValue: 9, delta: -2, deltaFormatted: '-2', isImprovement: true, milestone: '2 Major NCs Remediated' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 5, previousValue: 7, delta: -2, deltaFormatted: '-2', isImprovement: true, milestone: 'Vendor Risk CAPA Closed' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 4, previousValue: 5, delta: -1, deltaFormatted: '-1', isImprovement: true, milestone: 'KMS Key Rotation Fixed' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 3, previousValue: 4, delta: -1, deltaFormatted: '-1', isImprovement: true, milestone: 'Access Drift Corrected' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 1, previousValue: 3, delta: -2, deltaFormatted: '-2', isImprovement: true, milestone: 'Only 1 Minor OFI Remaining' }
    ]
  },
  audit_readiness: {
    id: 'audit_readiness',
    name: 'Accreditation & Audit Readiness',
    shortLabel: 'Audit Readiness',
    unit: '%',
    currentValue: 98.0,
    previousMonthValue: 95.5,
    momDelta: 2.5,
    momDeltaFormatted: '+2.5%',
    momPercentageChange: 2.62,
    sixMonthTotalChange: 20.0,
    isImprovement: true,
    invertColor: false,
    themeColor: 'purple',
    targetBenchmark: '≥ 95.0% (Stage 2 Qualified)',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 78.0, isImprovement: true, milestone: 'Scope Definition Approved' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 83.5, previousValue: 78.0, delta: 5.5, deltaFormatted: '+5.5%', isImprovement: true, milestone: 'Stage 1 Documentation Complete' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 88.0, previousValue: 83.5, delta: 4.5, deltaFormatted: '+4.5%', isImprovement: true, milestone: 'Pre-Audit Rehearsal #1' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 92.5, previousValue: 88.0, delta: 4.5, deltaFormatted: '+4.5%', isImprovement: true, milestone: 'Mock Auditor Walkthrough' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 95.5, previousValue: 92.5, delta: 3.0, deltaFormatted: '+3.0%', isImprovement: true, milestone: 'Stage 2 Ready Qualification' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 98.0, previousValue: 95.5, delta: 2.5, deltaFormatted: '+2.5%', isImprovement: true, milestone: 'Final Audit Pack Sealed' }
    ]
  },
  framework_alignment: {
    id: 'framework_alignment',
    name: 'Multi-Framework Harmonization',
    shortLabel: 'Framework Alignment',
    unit: '%',
    currentValue: 96.4,
    previousMonthValue: 94.2,
    momDelta: 2.2,
    momDeltaFormatted: '+2.2%',
    momPercentageChange: 2.34,
    sixMonthTotalChange: 15.4,
    isImprovement: true,
    invertColor: false,
    themeColor: 'sky',
    targetBenchmark: '≥ 85.0% Cross-Standard Overlap',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 81.0, isImprovement: true, milestone: 'ISO 27001 to SOC 2 Crosswalk' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 85.2, previousValue: 81.0, delta: 4.2, deltaFormatted: '+4.2%', isImprovement: true, milestone: 'MAS TRM 14-Domain Mapping' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 88.5, previousValue: 85.2, delta: 3.3, deltaFormatted: '+3.3%', isImprovement: true, milestone: 'ISO 42001 AI Controls Mapped' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 91.8, previousValue: 88.5, delta: 3.3, deltaFormatted: '+3.3%', isImprovement: true, milestone: 'GDPR / DPDP Privacy Overlay' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 94.2, previousValue: 91.8, delta: 2.4, deltaFormatted: '+2.4%', isImprovement: true, milestone: '82% Evidence Reuse Validated' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 96.4, previousValue: 94.2, delta: 2.2, deltaFormatted: '+2.2%', isImprovement: true, milestone: 'Universal GRC Matrix Unified' }
    ]
  },
  evidence_coverage: {
    id: 'evidence_coverage',
    name: 'Evidence Vault Integrity & Freshness',
    shortLabel: 'Evidence Coverage',
    unit: '%',
    currentValue: 94.0,
    previousMonthValue: 92.8,
    momDelta: 1.2,
    momDeltaFormatted: '+1.2%',
    momPercentageChange: 1.29,
    sixMonthTotalChange: 11.5,
    isImprovement: true,
    invertColor: false,
    themeColor: 'emerald',
    targetBenchmark: '≥ 90.0% Fresh (< 90 Days)',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 82.5, isImprovement: true, milestone: '940 Hashes Registered' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 85.8, previousValue: 82.5, delta: 3.3, deltaFormatted: '+3.3%', isImprovement: true, milestone: 'AWS & Azure Collector Linked' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 89.0, previousValue: 85.8, delta: 3.2, deltaFormatted: '+3.2%', isImprovement: true, milestone: 'GitLab CI Evidence Stream' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 91.2, previousValue: 89.0, delta: 2.2, deltaFormatted: '+2.2%', isImprovement: true, milestone: '1,120 Cryptographic Hashes' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 92.8, previousValue: 91.2, delta: 1.6, deltaFormatted: '+1.6%', isImprovement: true, milestone: 'Automatic Quarterly Re-verification' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 94.0, previousValue: 92.8, delta: 1.2, deltaFormatted: '+1.2%', isImprovement: true, milestone: '1,284 Hashes Verified Tamper-Proof' }
    ]
  },
  risk_exposure: {
    id: 'risk_exposure',
    name: 'Enterprise Residual Risk Score',
    shortLabel: 'Risk Exposure',
    unit: '/10',
    currentValue: 3.2,
    previousMonthValue: 3.5,
    momDelta: -0.3,
    momDeltaFormatted: '-0.3',
    momPercentageChange: -8.57,
    sixMonthTotalChange: -1.6,
    isImprovement: true,
    invertColor: true,
    themeColor: 'emerald',
    targetBenchmark: '≤ 4.0 (Board Risk Tolerance)',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 4.8, isImprovement: false, milestone: '8 High Residual Risks' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 4.5, previousValue: 4.8, delta: -0.3, deltaFormatted: '-0.3', isImprovement: true, milestone: 'MFA Enforced Enterprise-Wide' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 4.1, previousValue: 4.5, delta: -0.4, deltaFormatted: '-0.4', isImprovement: true, milestone: 'Third-Party Vendor Tiering' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 3.8, previousValue: 4.1, delta: -0.3, deltaFormatted: '-0.3', isImprovement: true, milestone: 'Critical Vulnerabilities Patched' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 3.5, previousValue: 3.8, delta: -0.3, deltaFormatted: '-0.3', isImprovement: true, milestone: 'Zero Critical Risks Achieved' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 3.2, previousValue: 3.5, delta: -0.3, deltaFormatted: '-0.3', isImprovement: true, milestone: 'Within Board Appetite Ceiling' }
    ]
  },
  tasks_due: {
    id: 'tasks_due',
    name: 'Remediation Task Backlog',
    shortLabel: 'Tasks Due',
    unit: 'tasks',
    currentValue: 2,
    previousMonthValue: 3,
    momDelta: -1,
    momDeltaFormatted: '-1',
    momPercentageChange: -33.3,
    sixMonthTotalChange: -6,
    isImprovement: true,
    invertColor: true,
    themeColor: 'emerald',
    targetBenchmark: '0 Overdue SLAs',
    history: [
      { month: 'Apr', year: 2026, date: '30 Apr 2026', fullDate: 'Apr 2026', value: 8, isImprovement: false, milestone: 'Initial Roadmap Launch' },
      { month: 'May', year: 2026, date: '31 May 2026', fullDate: 'May 2026', value: 7, previousValue: 8, delta: -1, deltaFormatted: '-1', isImprovement: true, milestone: 'DPIA Guidelines Published' },
      { month: 'Jun', year: 2026, date: '30 Jun 2026', fullDate: 'Jun 2026', value: 6, previousValue: 7, delta: -1, deltaFormatted: '-1', isImprovement: true, milestone: 'BCP Tabletop Drill Run' },
      { month: 'Jul', year: 2026, date: '31 Jul 2026', fullDate: 'Jul 2026', value: 4, previousValue: 6, delta: -2, deltaFormatted: '-2', isImprovement: true, milestone: 'SIEM Log Forwarding Fixed' },
      { month: 'Aug', year: 2026, date: '31 Aug 2026', fullDate: 'Aug 2026', value: 3, previousValue: 4, delta: -1, deltaFormatted: '-1', isImprovement: true, milestone: 'Pen-test Retest Cleared' },
      { month: 'Sep', year: 2026, date: '14 Sep 2026', fullDate: 'Sep 2026', value: 2, previousValue: 3, delta: -1, deltaFormatted: '-1', isImprovement: true, milestone: '0 Overdue Tasks' }
    ]
  }
};

/**
 * Helper to fetch or dynamically synthesize MoM data points when dynamic inputs are provided
 */
export function getMoMDataForMetric(
  metricId: string,
  dynamicCurrentValue?: number
): MetricMoMSummary {
  const base = MOM_COMPLIANCE_METRICS[metricId] || MOM_COMPLIANCE_METRICS.compliance_health;
  if (dynamicCurrentValue === undefined || dynamicCurrentValue === base.currentValue) {
    return base;
  }

  // If a live dynamic value is passed (e.g. from context counts), adjust the latest point
  const updatedHistory = [...base.history];
  const lastIndex = updatedHistory.length - 1;
  const lastPoint = updatedHistory[lastIndex];
  const prevPoint = updatedHistory[lastIndex - 1];

  const prevVal = prevPoint ? prevPoint.value : base.previousMonthValue;
  const delta = Number((dynamicCurrentValue - prevVal).toFixed(1));
  const isImprovement = base.invertColor ? delta <= 0 : delta >= 0;

  updatedHistory[lastIndex] = {
    ...lastPoint,
    date: '14 Sep 2026',
    value: dynamicCurrentValue,
    previousValue: prevVal,
    delta,
    deltaFormatted: `${delta > 0 ? '+' : ''}${delta}${base.unit === '%' ? '%' : ''}`,
    isImprovement
  };

  return {
    ...base,
    currentValue: dynamicCurrentValue,
    momDelta: delta,
    momDeltaFormatted: `${delta > 0 ? '+' : ''}${delta}${base.unit === '%' ? '%' : ''}`,
    isImprovement,
    history: updatedHistory
  };
}

/**
 * Generates an array of numeric values from a metric's MoM history
 */
export function getMoMValues(metricId: string): number[] {
  const metric = MOM_COMPLIANCE_METRICS[metricId];
  return metric ? metric.history.map(h => h.value) : [88, 90, 92, 94, 95, 96.4];
}
