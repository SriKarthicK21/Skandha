export type AuditPeriodKey = 'Q2_2026' | 'Q1_2026' | 'H2_2025';

export interface AuditPeriodOption {
  id: AuditPeriodKey;
  label: string;
  shortLabel: string;
  date: string;
  type: 'surveillance' | 'internal' | 'certification';
  badge: string;
}

export const AUDIT_PERIODS: AuditPeriodOption[] = [
  {
    id: 'Q2_2026',
    label: 'Q2 2026 Surveillance Audit (Last Cycle)',
    shortLabel: 'Q2 2026 (Last Audit)',
    date: 'Jun 2026',
    type: 'surveillance',
    badge: 'Surveillance Cycle 1'
  },
  {
    id: 'Q1_2026',
    label: 'Q1 2026 Internal Audit & Gap Analysis',
    shortLabel: 'Q1 2026 (Internal)',
    date: 'Mar 2026',
    type: 'internal',
    badge: 'Internal Audit'
  },
  {
    id: 'H2_2025',
    label: 'H2 2025 Initial Certification Baseline',
    shortLabel: 'H2 2025 (Initial)',
    date: 'Nov 2025',
    type: 'certification',
    badge: 'Accredited Baseline'
  }
];

export interface FrameworkComplianceItem {
  id: string;
  name: string;
  code: string;
  standardVersion: string;
  jurisdiction: string;
  executiveScore: number;
  operationalScore: number;
  previousScores: Record<AuditPeriodKey, { executive: number; operational: number }>;
  status: string;
  targetDate: string;
  iconName: 'ShieldCheck' | 'Cpu' | 'Building2' | 'Lock' | 'FileCheck2' | 'Shield' | 'Layers' | 'Globe2';
  color: string;
  bgColor: string;
  lightColor: string;
  lightBgColor: string;
  totalControls: number;
  testedControls: number;
  evidencePct: number;
  openFindings: number;
  criticalFindings: number;
  targetModuleId: string;
}

export const MASTER_FRAMEWORK_COMPLIANCE_ITEMS: FrameworkComplianceItem[] = [
  {
    id: 'iso_27001',
    name: 'ISO/IEC 27001:2022 ISMS',
    code: 'ISO 27001',
    standardVersion: '2022 Edition • 93 Annex A Controls',
    jurisdiction: 'Global (ISO/IEC)',
    executiveScore: 96.4,
    operationalScore: 74.0,
    previousScores: {
      Q2_2026: { executive: 91.0, operational: 69.8 },
      Q1_2026: { executive: 84.5, operational: 62.0 },
      H2_2025: { executive: 72.0, operational: 51.5 }
    },
    status: 'Stage 1 & 2 Ready',
    targetDate: 'Nov 2026',
    iconName: 'ShieldCheck',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10 border-sky-500/30',
    lightColor: 'text-sky-700',
    lightBgColor: 'bg-sky-50 border-sky-200',
    totalControls: 93,
    testedControls: 85,
    evidencePct: 87,
    openFindings: 1,
    criticalFindings: 0,
    targetModuleId: 'iso27001_dashboard'
  },
  {
    id: 'mas_trm',
    name: 'MAS TRM Guidelines (Singapore)',
    code: 'MAS TRM',
    standardVersion: '2024 Guidelines • Notices 644/655',
    jurisdiction: 'Singapore (MAS)',
    executiveScore: 94.0,
    operationalScore: 82.0,
    previousScores: {
      Q2_2026: { executive: 86.2, operational: 74.2 },
      Q1_2026: { executive: 78.0, operational: 66.0 },
      H2_2025: { executive: 64.5, operational: 52.0 }
    },
    status: 'Critical Systems Compliant',
    targetDate: 'Active Scope',
    iconName: 'Building2',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/30',
    lightColor: 'text-rose-700',
    lightBgColor: 'bg-rose-50 border-rose-200',
    totalControls: 114,
    testedControls: 101,
    evidencePct: 84,
    openFindings: 1,
    criticalFindings: 0,
    targetModuleId: 'mas_dashboard'
  },
  {
    id: 'soc_2',
    name: 'SOC 2 Type II (Security/Conf)',
    code: 'SOC 2',
    standardVersion: 'Trust Services Criteria (TSC 2017)',
    jurisdiction: 'United States (AICPA)',
    executiveScore: 92.8,
    operationalScore: 68.0,
    previousScores: {
      Q2_2026: { executive: 86.3, operational: 63.0 },
      Q1_2026: { executive: 79.2, operational: 54.0 },
      H2_2025: { executive: 68.0, operational: 42.0 }
    },
    status: 'Observation Window Active',
    targetDate: 'Dec 2026',
    iconName: 'Lock',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    lightColor: 'text-emerald-700',
    lightBgColor: 'bg-emerald-50 border-emerald-200',
    totalControls: 64,
    testedControls: 51,
    evidencePct: 71,
    openFindings: 2,
    criticalFindings: 1,
    targetModuleId: 'control_library'
  },
  {
    id: 'iso_42001',
    name: 'ISO/IEC 42001:2023 AIMS',
    code: 'ISO 42001',
    standardVersion: '2023 Edition • AI Risk Management',
    jurisdiction: 'Global (ISO/IEC)',
    executiveScore: 88.5,
    operationalScore: 31.0,
    previousScores: {
      Q2_2026: { executive: 76.5, operational: 20.0 },
      Q1_2026: { executive: 62.0, operational: 10.0 },
      H2_2025: { executive: 45.0, operational: 0.0 }
    },
    status: 'SoA Ratified & Auditable',
    targetDate: 'Jan 2027',
    iconName: 'Cpu',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    lightColor: 'text-purple-700',
    lightBgColor: 'bg-purple-50 border-purple-200',
    totalControls: 38,
    testedControls: 16,
    evidencePct: 28,
    openFindings: 7,
    criticalFindings: 3,
    targetModuleId: 'iso42001_dashboard'
  },
  {
    id: 'gdpr',
    name: 'Global Privacy (EU GDPR / DPDPA)',
    code: 'Privacy Regs',
    standardVersion: 'EU GDPR Art 32 & India DPDPA',
    jurisdiction: 'European Union & India',
    executiveScore: 91.2,
    operationalScore: 60.0,
    previousScores: {
      Q2_2026: { executive: 88.0, operational: 60.0 },
      Q1_2026: { executive: 82.5, operational: 54.0 },
      H2_2025: { executive: 70.0, operational: 45.0 }
    },
    status: 'DPA Attested & Compliant',
    targetDate: 'Ongoing Scope',
    iconName: 'FileCheck2',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    lightColor: 'text-amber-700',
    lightBgColor: 'bg-amber-50 border-amber-200',
    totalControls: 88,
    testedControls: 65,
    evidencePct: 63,
    openFindings: 3,
    criticalFindings: 0,
    targetModuleId: 'data_information'
  },
  {
    id: 'iso_27701',
    name: 'ISO/IEC 27701:2019 PIMS',
    code: 'ISO 27701',
    standardVersion: '2019 Edition • Privacy Information',
    jurisdiction: 'Global (ISO/IEC)',
    executiveScore: 85.2,
    operationalScore: 52.0,
    previousScores: {
      Q2_2026: { executive: 81.1, operational: 47.9 },
      Q1_2026: { executive: 74.0, operational: 40.0 },
      H2_2025: { executive: 60.0, operational: 30.0 }
    },
    status: 'PIMS Scoping Aligned',
    targetDate: 'Feb 2027',
    iconName: 'Shield',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    lightColor: 'text-blue-700',
    lightBgColor: 'bg-blue-50 border-blue-200',
    totalControls: 49,
    testedControls: 32,
    evidencePct: 54,
    openFindings: 4,
    criticalFindings: 0,
    targetModuleId: 'iso27701_pims'
  },
  {
    id: 'dpdpa',
    name: 'India DPDPA 2023',
    code: 'DPDPA',
    standardVersion: 'Digital Personal Data Protection Act',
    jurisdiction: 'India (DPB)',
    executiveScore: 82.5,
    operationalScore: 45.0,
    previousScores: {
      Q2_2026: { executive: 77.5, operational: 40.0 },
      Q1_2026: { executive: 70.0, operational: 32.0 },
      H2_2025: { executive: 55.0, operational: 20.0 }
    },
    status: 'Consent Architecture Active',
    targetDate: 'Mar 2027',
    iconName: 'Layers',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/30',
    lightColor: 'text-indigo-700',
    lightBgColor: 'bg-indigo-50 border-indigo-200',
    totalControls: 35,
    testedControls: 22,
    evidencePct: 48,
    openFindings: 2,
    criticalFindings: 0,
    targetModuleId: 'dpdp_compliance'
  },
  {
    id: 'ndpr',
    name: 'Nigeria NDPR / NDPA',
    code: 'NDPR',
    standardVersion: 'Nigeria Data Protection Act',
    jurisdiction: 'Nigeria (NDPC)',
    executiveScore: 87.0,
    operationalScore: 58.0,
    previousScores: {
      Q2_2026: { executive: 84.2, operational: 55.2 },
      Q1_2026: { executive: 78.0, operational: 48.0 },
      H2_2025: { executive: 65.0, operational: 35.0 }
    },
    status: 'NDPC Audit Filed',
    targetDate: 'Dec 2026',
    iconName: 'Globe2',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/30',
    lightColor: 'text-teal-700',
    lightBgColor: 'bg-teal-50 border-teal-200',
    totalControls: 40,
    testedControls: 28,
    evidencePct: 60,
    openFindings: 1,
    criticalFindings: 0,
    targetModuleId: 'data_information'
  }
];

export interface CalculatedTrend {
  currentScore: number;
  previousScore: number;
  delta: number; // e.g. 5.4 or -1.5
  percentChange: number; // relative change e.g. 5.9%
  direction: 'up' | 'down' | 'flat';
  deltaFormatted: string; // e.g. "+5.4%" or "-1.5%"
  percentChangeFormatted: string; // e.g. "+5.9%"
  periodOption: AuditPeriodOption;
}

/**
 * Calculates compliance trend metrics comparing current score to previous audit period.
 */
export function calculateComplianceTrend(
  currentScore: number,
  previousScore: number,
  periodOption: AuditPeriodOption
): CalculatedTrend {
  const delta = Number((currentScore - previousScore).toFixed(1));
  const percentChange = previousScore > 0
    ? Number((((currentScore - previousScore) / previousScore) * 100).toFixed(1))
    : 0;

  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (delta > 0.05) {
    direction = 'up';
  } else if (delta < -0.05) {
    direction = 'down';
  }

  const deltaFormatted = `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
  const percentChangeFormatted = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  return {
    currentScore,
    previousScore,
    delta,
    percentChange,
    direction,
    deltaFormatted,
    percentChangeFormatted,
    periodOption
  };
}

/**
 * Returns framework items formatted with calculated trend metrics for the requested audit period.
 */
export function getFrameworksWithCalculatedTrends(
  periodId: AuditPeriodKey = 'Q2_2026',
  scoreType: 'executive' | 'operational' = 'executive'
) {
  const periodOption = AUDIT_PERIODS.find(p => p.id === periodId) || AUDIT_PERIODS[0];

  return MASTER_FRAMEWORK_COMPLIANCE_ITEMS.map(fw => {
    const currentScore = scoreType === 'executive' ? fw.executiveScore : fw.operationalScore;
    const prevScore = scoreType === 'executive'
      ? fw.previousScores[periodId].executive
      : fw.previousScores[periodId].operational;

    const trend = calculateComplianceTrend(currentScore, prevScore, periodOption);

    return {
      ...fw,
      currentScore,
      previousScore: prevScore,
      trend
    };
  });
}
