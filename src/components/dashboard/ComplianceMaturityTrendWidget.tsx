import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Cpu,
  Building2,
  Lock,
  FileCheck2,
  Calendar,
  Download,
  Filter,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  Activity,
  Target,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MetricInfoTooltip } from '../common/Tooltip';

export interface MonthlyComplianceMaturityData {
  month: string;
  monthIndex: number;
  label: string;
  dateRange: string;
  overall: number;
  iso27001: number;
  iso42001: number;
  masTrm: number;
  soc2: number;
  privacy: number;
  maturityLevel: string;
  maturityTier: 1 | 2 | 3 | 4 | 5;
  activeControlsTested: number;
  totalControls: number;
  evidenceVerificationRate: number;
  openFindings: number;
  keyMilestone: string;
  milestoneType: 'baseline' | 'automation' | 'audit' | 'governance' | 'remediation' | 'certification';
  auditorSignoff: string;
}

export const SIX_MONTH_MATURITY_DATA: MonthlyComplianceMaturityData[] = [
  {
    month: 'Apr 2026',
    monthIndex: 0,
    label: 'Apr 26',
    dateRange: 'Apr 1 - Apr 30, 2026',
    overall: 78.2,
    iso27001: 76.5,
    iso42001: 52.0,
    masTrm: 81.0,
    soc2: 72.0,
    privacy: 70.5,
    maturityLevel: 'Level 4: Quantitatively Managed',
    maturityTier: 4,
    activeControlsTested: 118,
    totalControls: 235,
    evidenceVerificationRate: 74,
    openFindings: 14,
    keyMilestone: 'Q1 Gap Assessment Baseline established across 93 Annex A controls.',
    milestoneType: 'baseline',
    auditorSignoff: 'Internal Audit Lead'
  },
  {
    month: 'May 2026',
    monthIndex: 1,
    label: 'May 26',
    dateRange: 'May 1 - May 31, 2026',
    overall: 82.5,
    iso27001: 81.0,
    iso42001: 59.4,
    masTrm: 84.2,
    soc2: 76.5,
    privacy: 75.0,
    maturityLevel: 'Level 4: Quantitatively Managed',
    maturityTier: 4,
    activeControlsTested: 142,
    totalControls: 235,
    evidenceVerificationRate: 81,
    openFindings: 10,
    keyMilestone: 'Continuous telemetry collectors & cloud IAM compliance APIs deployed.',
    milestoneType: 'automation',
    auditorSignoff: 'SecOps Infrastructure Lead'
  },
  {
    month: 'Jun 2026',
    monthIndex: 2,
    label: 'Jun 26',
    dateRange: 'Jun 1 - Jun 30, 2026',
    overall: 86.8,
    iso27001: 85.2,
    iso42001: 67.5,
    masTrm: 87.5,
    soc2: 81.2,
    privacy: 80.2,
    maturityLevel: 'Level 4: Quantitatively Managed',
    maturityTier: 4,
    activeControlsTested: 168,
    totalControls: 235,
    evidenceVerificationRate: 88,
    openFindings: 6,
    keyMilestone: 'Passed Q2 Surveillance Audit Cycle with zero major non-conformities.',
    milestoneType: 'audit',
    auditorSignoff: 'Lead External Auditor (BSI)'
  },
  {
    month: 'Jul 2026',
    monthIndex: 3,
    label: 'Jul 26',
    dateRange: 'Jul 1 - Jul 31, 2026',
    overall: 89.4,
    iso27001: 89.0,
    iso42001: 74.8,
    masTrm: 90.0,
    soc2: 85.8,
    privacy: 84.1,
    maturityLevel: 'Level 4: Quantitatively Managed',
    maturityTier: 4,
    activeControlsTested: 192,
    totalControls: 235,
    evidenceVerificationRate: 91,
    openFindings: 4,
    keyMilestone: 'ISO/IEC 42001 AIMS Statement of Applicability ratified by Board.',
    milestoneType: 'governance',
    auditorSignoff: 'Executive CISO / CRO'
  },
  {
    month: 'Aug 2026',
    monthIndex: 4,
    label: 'Aug 26',
    dateRange: 'Aug 1 - Aug 31, 2026',
    overall: 93.2,
    iso27001: 92.5,
    iso42001: 81.2,
    masTrm: 92.4,
    soc2: 89.5,
    privacy: 88.0,
    maturityLevel: 'Level 5: Optimizing',
    maturityTier: 5,
    activeControlsTested: 214,
    totalControls: 235,
    evidenceVerificationRate: 95,
    openFindings: 2,
    keyMilestone: 'Accelerated CAPA closure sprint; resolved 12 residual audit findings.',
    milestoneType: 'remediation',
    auditorSignoff: 'Audit & Remediation Committee'
  },
  {
    month: 'Sep 2026',
    monthIndex: 5,
    label: 'Sep 26',
    dateRange: 'Sep 1 - Sep 30, 2026 (Current)',
    overall: 96.4,
    iso27001: 96.4,
    iso42001: 88.5,
    masTrm: 94.0,
    soc2: 92.8,
    privacy: 91.2,
    maturityLevel: 'Level 5: Optimizing',
    maturityTier: 5,
    activeControlsTested: 228,
    totalControls: 235,
    evidenceVerificationRate: 98,
    openFindings: 1,
    keyMilestone: 'Stage 1 & 2 accredited recertification readiness achieved at 96.4%.',
    milestoneType: 'certification',
    auditorSignoff: 'Chief Assurance Officer'
  }
];

interface FrameworkToggleConfig {
  id: string;
  dataKey: keyof MonthlyComplianceMaturityData;
  name: string;
  shortName: string;
  color: string;
  strokeDash?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FRAMEWORK_CONFIGS: FrameworkToggleConfig[] = [
  {
    id: 'overall',
    dataKey: 'overall',
    name: 'Overall GRC Maturity Index',
    shortName: 'Overall GRC',
    color: 'var(--skanda-brand)', // Primary Brand Color
    icon: Award
  },
  {
    id: 'iso27001',
    dataKey: 'iso27001',
    name: 'ISO/IEC 27001:2022 ISMS',
    shortName: 'ISO 27001',
    color: '#38BDF8', // Sky Blue
    icon: ShieldCheck
  },
  {
    id: 'iso42001',
    dataKey: 'iso42001',
    name: 'ISO/IEC 42001:2023 AIMS',
    shortName: 'ISO 42001',
    color: '#A78BFA', // Light Violet
    icon: Cpu
  },
  {
    id: 'masTrm',
    dataKey: 'masTrm',
    name: 'MAS TRM (Singapore)',
    shortName: 'MAS TRM',
    color: '#F43F5E', // Rose
    icon: Building2
  },
  {
    id: 'soc2',
    dataKey: 'soc2',
    name: 'SOC 2 Type II Security',
    shortName: 'SOC 2',
    color: '#34D399', // Emerald
    icon: Lock
  },
  {
    id: 'privacy',
    dataKey: 'privacy',
    name: 'Global Privacy (GDPR / DPDPA)',
    shortName: 'Privacy Regs',
    color: '#F59E0B', // Amber
    icon: FileCheck2
  }
];

interface CompactMultiFrameworkTooltipProps {
  active?: boolean;
  payload?: readonly any[];
  visibleFrameworks: Record<string, boolean>;
}

const CompactMultiFrameworkTooltip: React.FC<CompactMultiFrameworkTooltipProps> = ({
  active,
  payload,
  visibleFrameworks,
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as MonthlyComplianceMaturityData;

  const frameworksList = [
    { key: 'overall', name: 'Overall GRC', val: data.overall, color: '#8B5CF6' },
    { key: 'iso27001', name: 'ISO 27001', val: data.iso27001, color: '#38BDF8' },
    { key: 'iso42001', name: 'ISO 42001', val: data.iso42001, color: '#A78BFA' },
    { key: 'masTrm', name: 'MAS TRM', val: data.masTrm, color: '#F43F5E' },
    { key: 'soc2', name: 'SOC 2', val: data.soc2, color: '#34D399' },
    { key: 'privacy', name: 'Privacy Regs', val: data.privacy, color: '#F59E0B' },
  ];

  return (
    <div className="bg-[#0B101E]/95 backdrop-blur-md border border-[#243047] p-2.5 rounded-lg shadow-2xl text-xs space-y-1.5 font-mono min-w-[190px] max-w-[220px] pointer-events-none select-none">
      <div className="flex items-center justify-between border-b border-[#1B2639] pb-1 gap-2">
        <span className="text-white font-bold text-xs tracking-tight">{data.month}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {data.overall}% Score
        </span>
      </div>
      <div className="space-y-1 text-[11px]">
        {frameworksList.map(fw => {
          if (!visibleFrameworks[fw.key]) return null;
          return (
            <div key={fw.key} className="flex justify-between items-center">
              <span className="flex items-center space-x-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 ring-1 ring-white/20"
                  style={{ backgroundColor: fw.color }}
                />
                <span className="text-slate-300 font-medium">{fw.name}:</span>
              </span>
              <span className="font-bold text-white font-mono">{fw.val}%</span>
            </div>
          );
        })}
      </div>
      {data.keyMilestone && (
        <div className="pt-1 border-t border-[#1B2639] text-[10px] text-slate-400 font-mono truncate" title={data.keyMilestone}>
          <span className="text-slate-500 font-medium mr-1">Milestone:</span>{data.keyMilestone}
        </div>
      )}
    </div>
  );
};

const CompactOverallBandTooltip: React.FC<{ active?: boolean; payload?: readonly any[] }> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as MonthlyComplianceMaturityData;

  const metrics = [
    { label: 'Maturity Level', val: data.maturityLevel, color: '#8B5CF6' },
    { label: 'Controls Tested', val: `${data.activeControlsTested} / ${data.totalControls}`, color: '#38BDF8' },
    { label: 'Evidence Verified', val: `${data.evidenceVerificationRate}%`, color: '#34D399' },
    { label: 'Open Findings', val: data.openFindings, color: '#F43F5E' },
  ];

  return (
    <div className="bg-[#0B101E]/95 backdrop-blur-md border border-[#243047] p-2.5 rounded-lg shadow-2xl text-xs space-y-1.5 font-mono min-w-[190px] max-w-[220px] pointer-events-none select-none">
      <div className="flex items-center justify-between border-b border-[#1B2639] pb-1 gap-2">
        <span className="text-white font-bold text-xs tracking-tight">{data.month}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {data.overall}% Score
        </span>
      </div>
      <div className="space-y-1 text-[11px]">
        {metrics.map(m => (
          <div key={m.label} className="flex justify-between items-center">
            <span className="flex items-center space-x-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 ring-1 ring-white/20"
                style={{ backgroundColor: m.color }}
              />
              <span className="text-slate-300 font-medium">{m.label}:</span>
            </span>
            <span className="font-bold text-white font-mono">{m.val}</span>
          </div>
        ))}
      </div>
      {data.keyMilestone && (
        <div className="pt-1 border-t border-[#1B2639] text-[10px] text-slate-400 font-mono truncate" title={data.keyMilestone}>
          <span className="text-slate-500 font-medium mr-1">Milestone:</span>{data.keyMilestone}
        </div>
      )}
    </div>
  );
};

const CompactControlsVelocityTooltip: React.FC<{ active?: boolean; payload?: readonly any[] }> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as MonthlyComplianceMaturityData;

  const metrics = [
    { label: 'Controls Tested', val: `${data.activeControlsTested} / ${data.totalControls}`, color: '#8B5CF6' },
    { label: 'Evidence Freshness', val: `${data.evidenceVerificationRate}%`, color: '#34D399' },
    { label: 'Open Remediations', val: data.openFindings, color: '#F43F5E' },
  ];

  return (
    <div className="bg-[#0B101E]/95 backdrop-blur-md border border-[#243047] p-2.5 rounded-lg shadow-2xl text-xs space-y-1.5 font-mono min-w-[190px] max-w-[220px] pointer-events-none select-none">
      <div className="flex items-center justify-between border-b border-[#1B2639] pb-1 gap-2">
        <span className="text-white font-bold text-xs tracking-tight">{data.month}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Velocity
        </span>
      </div>
      <div className="space-y-1 text-[11px]">
        {metrics.map(m => (
          <div key={m.label} className="flex justify-between items-center">
            <span className="flex items-center space-x-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 ring-1 ring-white/20"
                style={{ backgroundColor: m.color }}
              />
              <span className="text-slate-300 font-medium">{m.label}:</span>
            </span>
            <span className="font-bold text-white font-mono">{m.val}</span>
          </div>
        ))}
      </div>
      {data.keyMilestone && (
        <div className="pt-1 border-t border-[#1B2639] text-[10px] text-slate-400 font-mono truncate" title={data.keyMilestone}>
          <span className="text-slate-500 font-medium mr-1">Milestone:</span>{data.keyMilestone}
        </div>
      )}
    </div>
  );
};

interface ComplianceMaturityTrendWidgetProps {
  onNavigateModule?: (moduleId: string) => void;
  className?: string;
}

export const ComplianceMaturityTrendWidget: React.FC<ComplianceMaturityTrendWidgetProps> = ({
  onNavigateModule,
  className = ''
}) => {
  const { theme } = useGRC();

  const [activeViewMode, setActiveViewMode] = useState<'MULTI_FRAMEWORK' | 'OVERALL_BAND' | 'CONTROLS_VELOCITY'>('MULTI_FRAMEWORK');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // Default to latest (Sep 2026)
  const [visibleFrameworks, setVisibleFrameworks] = useState<Record<string, boolean>>({
    overall: true,
    iso27001: true,
    iso42001: true,
    masTrm: true,
    soc2: true,
    privacy: true
  });

  const toggleFramework = (id: string) => {
    setVisibleFrameworks(prev => {
      // Don't allow unselecting all
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (activeCount <= 1 && prev[id]) return prev;
      return { ...prev, [id]: !prev[id] };
    });
  };

  const selectOnlyFramework = (id: string) => {
    setVisibleFrameworks({
      overall: id === 'overall',
      iso27001: id === 'iso27001',
      iso42001: id === 'iso42001',
      masTrm: id === 'masTrm',
      soc2: id === 'soc2',
      privacy: id === 'privacy'
    });
  };

  const selectAllFrameworks = () => {
    setVisibleFrameworks({
      overall: true,
      iso27001: true,
      iso42001: true,
      masTrm: true,
      soc2: true,
      privacy: true
    });
  };

  // Selected Month Dossier
  const activeMonthData = useMemo(() => {
    return SIX_MONTH_MATURITY_DATA[selectedMonthIndex] || SIX_MONTH_MATURITY_DATA[5];
  }, [selectedMonthIndex]);

  // Overall calculations across 6 months
  const startScore = SIX_MONTH_MATURITY_DATA[0].overall;
  const currentScore = SIX_MONTH_MATURITY_DATA[5].overall;
  const netGain = parseFloat((currentScore - startScore).toFixed(1));
  const avgMonthlyVelocity = parseFloat((netGain / 5).toFixed(2));

  // Export 6-Month Data to CSV
  const handleExportCsv = () => {
    const headers = [
      'Month',
      'Overall Score (%)',
      'ISO 27001 (%)',
      'ISO 42001 (%)',
      'MAS TRM (%)',
      'SOC 2 (%)',
      'Privacy (%)',
      'Maturity Level',
      'Controls Tested',
      'Total Controls',
      'Evidence Rate (%)',
      'Open Findings',
      'Key Milestone',
      'Auditor Signoff'
    ];

    const rows = SIX_MONTH_MATURITY_DATA.map(d => [
      `"${d.month}"`,
      d.overall,
      d.iso27001,
      d.iso42001,
      d.masTrm,
      d.soc2,
      d.privacy,
      `"${d.maturityLevel}"`,
      d.activeControlsTested,
      d.totalControls,
      `${d.evidenceVerificationRate}%`,
      d.openFindings,
      `"${d.keyMilestone.replace(/"/g, '""')}"`,
      `"${d.auditorSignoff}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `compliance_maturity_trend_6_months_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`border border-[var(--skanda-border)] bg-[var(--skanda-bg-elevated)] rounded-2xl p-5 shadow-xl space-y-5 transition-colors ${className}`}
    >
      {/* 1. Header Toolbar & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[var(--skanda-border)]">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h2 className={`text-sm sm:text-base font-bold tracking-tight flex items-center space-x-2 ${
              theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'
            }`}>
              <TrendingUp className={`w-4 h-4 shrink-0 ${theme === 'light' ? 'text-indigo-600' : 'text-[#8B5CF6]'}`} />
              <span>Compliance Maturity Score Trends (Last 6 Months)</span>
            </h2>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
              theme === 'light'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
            }`}>
              +{netGain}% 6-Month Gain
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              theme === 'light'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
            }`}>
              Level 5: Optimizing
            </span>
            <MetricInfoTooltip
              title="6-Month Maturity Trajectory Engine"
              badge="Accredited Telemetry"
              content="Visualizes continuous compliance maturity index progression over the preceding 6 months across multi-standard frameworks, tracking control verification rate and audit readiness."
              formula="Maturity Index = Weighted Average(Controls Tested / In-Scope Controls) × Evidence Verification Assurance"
              benchmark="≥90.0% = Level 5 (Optimizing) | 75.0% - 89.9% = Level 4 (Managed) | <60.0% = High Audit Risk"
              position="bottom"
            />
          </div>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-[#A7B0C0]'}`}>
            Chronological maturity progression from Q1 baseline (Apr 2026) to pre-certification readiness (Sep 2026) across 235 controls.
          </p>
        </div>

        {/* View Mode Switcher & Export */}
        <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
          <div className={`flex items-center p-0.5 rounded-xl border text-xs ${
            theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#080D1A] border-[#1B2639]'
          }`}>
            <button
              onClick={() => setActiveViewMode('MULTI_FRAMEWORK')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeViewMode === 'MULTI_FRAMEWORK'
                  ? theme === 'light' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-[#7C3AED] text-white shadow-xs'
                  : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-[#7F8BA3] hover:text-[#FFFFFF]'
              }`}
            >
              Multi-Framework
            </button>
            <button
              onClick={() => setActiveViewMode('OVERALL_BAND')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeViewMode === 'OVERALL_BAND'
                  ? theme === 'light' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-[#7C3AED] text-white shadow-xs'
                  : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-[#7F8BA3] hover:text-[#FFFFFF]'
              }`}
            >
              Overall & Band
            </button>
            <button
              onClick={() => setActiveViewMode('CONTROLS_VELOCITY')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeViewMode === 'CONTROLS_VELOCITY'
                  ? theme === 'light' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-[#7C3AED] text-white shadow-xs'
                  : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-[#7F8BA3] hover:text-[#FFFFFF]'
              }`}
            >
              Controls Velocity
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#F8FAFC] border-[#243047]'
            }`}
            title="Download 6-month historical compliance score ledger as CSV"
          >
            <Download className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-indigo-600' : 'text-[#A78BFA]'}`} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Key Maturity Scorecards (4 Mini-Metric Blocks - Unified Enterprise Cards with Internal Grid Alignment) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Current Maturity Score */}
        <div className="p-3.5 rounded-xl border border-[var(--skanda-border)] bg-[var(--skanda-bg-elevated)] grid grid-rows-[auto_1fr_auto] gap-2.5 transition-all duration-150 ease-out hover:shadow-lg hover:-translate-y-0.5">
          {/* Header Row: Icon and Title */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
              theme === 'light'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider block font-mono truncate text-[var(--skanda-text-secondary)]">
              Current Maturity
            </span>
          </div>

          {/* Metric, Trend Indicator & Sub-label Grid */}
          <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 my-auto min-w-0">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none text-[var(--skanda-text-heading)] truncate">
              96.4%
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border whitespace-nowrap leading-none justify-self-end ${
              theme === 'light'
                ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                : 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40'
            }`}>
              Grade A+
            </span>
            <span className="col-span-2 text-sm font-mono block truncate text-[var(--skanda-text-muted)] mt-0.5">
              Level 5: Optimizing Status
            </span>
          </div>

          {/* Micro Progress Track */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden self-end ${
            theme === 'light' ? 'bg-slate-100 border border-slate-200/70' : 'bg-slate-900 border border-slate-800'
          }`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: '96.4%' }}
            />
          </div>
        </div>

        {/* Card 2: 6-Month Net Trajectory */}
        <div className="p-3.5 rounded-xl border border-[var(--skanda-border)] bg-[var(--skanda-bg-elevated)] grid grid-rows-[auto_1fr_auto] gap-2.5 transition-all duration-150 ease-out hover:shadow-lg hover:-translate-y-0.5">
          {/* Header Row: Icon and Title */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
              theme === 'light'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider block font-mono truncate text-[var(--skanda-text-secondary)]">
              6-Month Net Trajectory
            </span>
          </div>

          {/* Metric, Trend Indicator & Sub-label Grid */}
          <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 my-auto min-w-0">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none text-[var(--skanda-text-heading)] truncate">
              +{netGain}%
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border whitespace-nowrap leading-none justify-self-end ${
              theme === 'light'
                ? 'text-indigo-800 bg-indigo-50 border-indigo-300'
                : 'text-indigo-300 bg-indigo-950/80 border-indigo-500/40'
            }`}>
              +{avgMonthlyVelocity}%/mo
            </span>
            <span className="col-span-2 text-sm font-mono block truncate text-[var(--skanda-text-muted)] mt-0.5">
              Baseline 78.2% (Apr 2026)
            </span>
          </div>

          {/* Micro Progress Track */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden self-end ${
            theme === 'light' ? 'bg-slate-100 border border-slate-200/70' : 'bg-slate-900 border border-slate-800'
          }`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400"
              style={{ width: '82%' }}
            />
          </div>
        </div>

        {/* Card 3: Fastest Advancing Standard */}
        <div className="p-3.5 rounded-xl border border-[var(--skanda-border)] bg-[var(--skanda-bg-elevated)] grid grid-rows-[auto_1fr_auto] gap-2.5 transition-all duration-150 ease-out hover:shadow-lg hover:-translate-y-0.5">
          {/* Header Row: Icon and Title */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
              theme === 'light'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            }`}>
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider block font-mono truncate text-[var(--skanda-text-secondary)]">
              Fastest Advancing Standard
            </span>
          </div>

          {/* Metric, Trend Indicator & Sub-label Grid */}
          <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 my-auto min-w-0">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none text-[var(--skanda-text-heading)] truncate">
              ISO 42001
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border whitespace-nowrap leading-none justify-self-end ${
              theme === 'light'
                ? 'text-purple-800 bg-purple-50 border-purple-300'
                : 'text-purple-300 bg-purple-950/80 border-purple-500/40'
            }`}>
              +36.5%
            </span>
            <span className="col-span-2 text-sm font-mono block truncate text-[var(--skanda-text-muted)] mt-0.5">
              AI Governance (52% → 88.5%)
            </span>
          </div>

          {/* Micro Progress Track */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden self-end ${
            theme === 'light' ? 'bg-slate-100 border border-slate-200/70' : 'bg-slate-900 border border-slate-800'
          }`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
              style={{ width: '88.5%' }}
            />
          </div>
        </div>

        {/* Card 4: Target Benchmark */}
        <div className="p-3.5 rounded-xl border border-[var(--skanda-border)] bg-[var(--skanda-bg-elevated)] grid grid-rows-[auto_1fr_auto] gap-2.5 transition-all duration-150 ease-out hover:shadow-lg hover:-translate-y-0.5">
          {/* Header Row: Icon and Title */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
              theme === 'light'
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-teal-500/15 text-teal-400 border-teal-500/30'
            }`}>
              <Target className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider block font-mono truncate text-[var(--skanda-text-secondary)]">
              Target Benchmark
            </span>
          </div>

          {/* Metric, Trend Indicator & Sub-label Grid */}
          <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 gap-y-1 my-auto min-w-0">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none text-[var(--skanda-text-heading)] truncate">
              ≥ 90.0%
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border whitespace-nowrap leading-none justify-self-end ${
              theme === 'light'
                ? 'text-teal-800 bg-teal-50 border-teal-300'
                : 'text-teal-300 bg-teal-950/80 border-teal-500/40'
            }`}>
              Surpassed
            </span>
            <span className="col-span-2 text-sm font-mono block truncate text-[var(--skanda-text-muted)] mt-0.5">
              Crossed threshold Jul 2026
            </span>
          </div>

          {/* Micro Progress Track */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden self-end ${
            theme === 'light' ? 'bg-slate-100 border border-slate-200/70' : 'bg-slate-900 border border-slate-800'
          }`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Framework Filter Toggle Bar */}
      {activeViewMode === 'MULTI_FRAMEWORK' && (
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-1 border-t ${
          theme === 'light' ? 'border-slate-200/80' : 'border-[#1B2639]'
        }`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-mono mr-1 flex items-center space-x-1 ${
              theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'
            }`}>
              <Filter className={`w-3 h-3 ${theme === 'light' ? 'text-indigo-500' : 'text-[#8B5CF6]'}`} />
              <span>Frameworks:</span>
            </span>
            {FRAMEWORK_CONFIGS.map(fw => {
              const isVisible = visibleFrameworks[fw.id];
              const Icon = fw.icon;
              return (
                <button
                  key={fw.id}
                  onClick={() => toggleFramework(fw.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition flex items-center space-x-1.5 cursor-pointer border ${
                    isVisible
                      ? theme === 'light'
                        ? 'bg-white shadow-2xs border-slate-300 text-slate-800'
                        : 'bg-[#111A2C] border-[#243047] text-[#FFFFFF] shadow-2xs'
                      : theme === 'light'
                        ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 hover:opacity-80'
                        : 'bg-[#080D1A] text-[#566176] border-[#1B2639] opacity-60 hover:opacity-80'
                  }`}
                  title={`Click to toggle ${fw.name} on the line graph`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: fw.color }}
                  />
                  <Icon className={`w-3 h-3 ${theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'}`} />
                  <span>{fw.shortName}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <button
              onClick={selectAllFrameworks}
              className={`text-[11px] font-mono font-semibold hover:underline px-1.5 py-0.5 cursor-pointer ${
                theme === 'light' ? 'text-indigo-600' : 'text-[#8B5CF6] hover:text-[#A78BFA]'
              }`}
            >
              Select All
            </button>
            <span className={theme === 'light' ? 'text-slate-300' : 'text-[#243047]'}>|</span>
            <button
              onClick={() => selectOnlyFramework('overall')}
              className={`text-[11px] font-mono font-semibold hover:underline px-1.5 py-0.5 cursor-pointer ${
                theme === 'light' ? 'text-indigo-600' : 'text-[#8B5CF6] hover:text-[#A78BFA]'
              }`}
            >
              Overall Only
            </button>
          </div>
        </div>
      )}

      {/* 4. RECHARTS LINE GRAPH CANVAS */}
      <div className="w-full h-80 sm:h-96 p-3 sm:p-4 rounded-xl border border-[var(--skanda-border)] bg-[var(--skanda-bg-secondary)] relative shadow-xs">
        <ResponsiveContainer width="100%" height="100%">
          {activeViewMode === 'OVERALL_BAND' ? (
            <AreaChart
              data={SIX_MONTH_MATURITY_DATA}
              margin={{ top: 15, right: 25, left: -5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="maturityScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--skanda-brand)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--skanda-brand)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--skanda-chart-grid)"
                opacity={0.15}
              />
              <XAxis
                dataKey="month"
                stroke={theme === 'light' ? '#64748B' : '#7F8BA3'}
                axisLine={{ stroke: 'var(--skanda-chart-grid)' }}
                tick={{ fill: theme === 'light' ? '#64748B' : '#7F8BA3', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke={theme === 'light' ? '#64748B' : '#7F8BA3'}
                axisLine={{ stroke: 'var(--skanda-chart-grid)' }}
                tick={{ fill: theme === 'light' ? '#64748B' : '#7F8BA3', fontSize: 11 }}
                tickLine={false}
                domain={[50, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => (
                  <CompactOverallBandTooltip active={active} payload={payload} />
                )}
              />
              <ReferenceLine
                y={90}
                stroke="#4FD1B5"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Target Benchmark (90%)',
                  fill: '#4FD1B5',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              <ReferenceLine
                y={75}
                stroke="#38BDF8"
                strokeDasharray="4 4"
                label={{
                  value: '75% Baseline (Level 4 Managed)',
                  fill: '#38BDF8',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="var(--skanda-brand)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#maturityScoreGradient)"
                name="Overall GRC Maturity Index"
                activeDot={{ r: 6, fill: 'var(--skanda-brand)', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : activeViewMode === 'CONTROLS_VELOCITY' ? (
            <LineChart
              data={SIX_MONTH_MATURITY_DATA}
              margin={{ top: 15, right: 25, left: -5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--skanda-chart-grid)"
                opacity={0.15}
              />
              <XAxis
                dataKey="month"
                stroke={theme === 'light' ? '#64748B' : '#7F8BA3'}
                axisLine={{ stroke: 'var(--skanda-chart-grid)' }}
                tick={{ fill: theme === 'light' ? '#64748B' : '#7F8BA3', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke={theme === 'light' ? '#64748B' : '#7F8BA3'}
                axisLine={{ stroke: 'var(--skanda-chart-grid)' }}
                tick={{ fill: theme === 'light' ? '#64748B' : '#7F8BA3', fontSize: 11 }}
                tickLine={false}
                domain={[0, 240]}
                unit=" ctrl"
              />
              <Tooltip
                content={({ active, payload }) => (
                  <CompactControlsVelocityTooltip active={active} payload={payload} />
                )}
              />
              <ReferenceLine
                y={235}
                stroke="var(--skanda-brand)"
                strokeDasharray="4 4"
                label={{
                  value: 'Total In-Scope Controls (235)',
                  fill: 'var(--skanda-brand)',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              <Line
                type="monotone"
                dataKey="activeControlsTested"
                stroke="var(--skanda-brand)"
                strokeWidth={3}
                name="Controls Tested"
                dot={{ r: 4, fill: 'var(--skanda-brand)' }}
                activeDot={{ r: 6, fill: 'var(--skanda-brand)', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={SIX_MONTH_MATURITY_DATA}
              margin={{ top: 15, right: 25, left: -5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--skanda-chart-grid)"
                opacity={0.15}
              />
              <XAxis
                dataKey="month"
                stroke={theme === 'light' ? '#64748B' : '#7F8BA3'}
                axisLine={{ stroke: 'var(--skanda-chart-grid)' }}
                tick={{ fill: theme === 'light' ? '#64748B' : '#7F8BA3', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke={theme === 'light' ? '#64748B' : '#7F8BA3'}
                axisLine={{ stroke: 'var(--skanda-chart-grid)' }}
                tick={{ fill: theme === 'light' ? '#64748B' : '#7F8BA3', fontSize: 11 }}
                tickLine={false}
                domain={[45, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => (
                  <CompactMultiFrameworkTooltip
                    active={active}
                    payload={payload}
                    visibleFrameworks={visibleFrameworks}
                  />
                )}
              />
              <ReferenceLine
                y={90}
                stroke="#4FD1B5"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Target Benchmark (90%)',
                  fill: '#4FD1B5',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              {/* Overall GRC Line */}
              {visibleFrameworks.overall && (
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="var(--skanda-brand)"
                  strokeWidth={3}
                  name="Overall GRC"
                  dot={{ r: 3.5, fill: 'var(--skanda-brand)', stroke: 'var(--skanda-bg-secondary)', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: 'var(--skanda-brand)', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}
              {/* ISO 27001 */}
              {visibleFrameworks.iso27001 && (
                <Line
                  type="monotone"
                  dataKey="iso27001"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  name="ISO 27001"
                  dot={{ r: 2.5, fill: '#38BDF8' }}
                  activeDot={{ r: 5, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}
              {/* ISO 42001 */}
              {visibleFrameworks.iso42001 && (
                <Line
                  type="monotone"
                  dataKey="iso42001"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  name="ISO 42001"
                  dot={{ r: 2.5, fill: '#A78BFA' }}
                  activeDot={{ r: 5, fill: '#A78BFA', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}
              {/* MAS TRM */}
              {visibleFrameworks.masTrm && (
                <Line
                  type="monotone"
                  dataKey="masTrm"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  name="MAS TRM"
                  dot={{ r: 2.5, fill: '#F43F5E' }}
                  activeDot={{ r: 5, fill: '#F43F5E', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}
              {/* SOC 2 */}
              {visibleFrameworks.soc2 && (
                <Line
                  type="monotone"
                  dataKey="soc2"
                  stroke="#34D399"
                  strokeWidth={2}
                  name="SOC 2"
                  dot={{ r: 2.5, fill: '#34D399' }}
                  activeDot={{ r: 5, fill: '#34D399', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}
              {/* Privacy */}
              {visibleFrameworks.privacy && (
                <Line
                  type="monotone"
                  dataKey="privacy"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Privacy Regs"
                  dot={{ r: 2.5, fill: '#F59E0B' }}
                  activeDot={{ r: 5, fill: '#F59E0B', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 5. Interactive Monthly Timeline Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
            theme === 'light' ? 'text-slate-600' : 'text-[#7F8BA3]'
          }`}>
            6-Month Milestone Ledger (Click Month to Inspect)
          </span>
          <span className={`text-[11px] font-mono ${
            theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'
          }`}>
            Selected: <strong className={theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}>{activeMonthData.month}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SIX_MONTH_MATURITY_DATA.map((item, idx) => {
            const isSelected = idx === selectedMonthIndex;
            const deltaPrev = idx > 0 ? parseFloat((item.overall - SIX_MONTH_MATURITY_DATA[idx - 1].overall).toFixed(1)) : null;

            return (
              <button
                key={item.month}
                onClick={() => setSelectedMonthIndex(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? theme === 'light'
                      ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-[#111A2C] border-[#8B5CF6] shadow-sm ring-1 ring-[#8B5CF6]'
                    : theme === 'light'
                      ? 'bg-white hover:bg-slate-50 border-slate-200'
                      : 'bg-[#0D1424] hover:bg-[#111A2C] border-[#1B2639]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${
                    isSelected
                      ? theme === 'light' ? 'text-indigo-950 font-bold' : 'text-[#FFFFFF] font-bold'
                      : theme === 'light' ? 'text-slate-900 font-semibold' : 'text-[#F8FAFC]'
                  }`}>
                    {item.month}
                  </span>
                  {deltaPrev !== null && (
                    <span className="text-[10px] font-mono font-bold text-[#22C55E]">
                      +{deltaPrev}%
                    </span>
                  )}
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className={`text-base font-black font-mono ${
                    isSelected
                      ? theme === 'light' ? 'text-indigo-600' : 'text-[#A78BFA]'
                      : theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'
                  }`}>
                    {item.overall}%
                  </span>
                  <span className={`text-[10px] font-mono ${
                    theme === 'light' ? 'text-slate-400' : 'text-[#7F8BA3]'
                  }`}>score</span>
                </div>
                <p className={`text-[10px] line-clamp-2 mt-1 leading-tight ${
                  isSelected
                    ? theme === 'light' ? 'text-indigo-900 font-medium' : 'text-[#F8FAFC] font-medium'
                    : theme === 'light' ? 'text-slate-500' : 'text-[#A7B0C0]'
                }`}>
                  {item.keyMilestone}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Selected Month Detailed Governance Dossier */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200 text-slate-800'
            : 'bg-[#0D1424] border-[#1B2639] text-[#F8FAFC]'
        }`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 mb-2.5 border-b gap-2 ${
          theme === 'light' ? 'border-slate-200' : 'border-[#1B2639]'
        }`}>
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 shrink-0 ${theme === 'light' ? 'text-indigo-600' : 'text-[#8B5CF6]'}`} />
            <h3 className={`text-xs sm:text-sm font-bold ${
              theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'
            }`}>
              {activeMonthData.month} Governance Dossier & Audit Validation
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              theme === 'light'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
            }`}>
              {activeMonthData.dateRange}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className={theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'}>Auditor Signoff:</span>
            <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-[#FFFFFF]'}`}>
              {activeMonthData.auditorSignoff}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className={`text-[10px] uppercase font-bold block mb-1 font-mono ${
              theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'
            }`}>
              Audit Milestone Achieved
            </span>
            <p className={`font-medium leading-relaxed ${
              theme === 'light' ? 'text-slate-700' : 'text-[#A7B0C0]'
            }`}>
              {activeMonthData.keyMilestone}
            </p>
          </div>

          <div>
            <span className={`text-[10px] uppercase font-bold block mb-1 font-mono ${
              theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'
            }`}>
              Operational Implementation
            </span>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'}>Controls Tested:</span>
                <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}`}>
                  {activeMonthData.activeControlsTested} / {activeMonthData.totalControls}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'}>Evidence Verification:</span>
                <span className="font-bold text-[#22C55E]">{activeMonthData.evidenceVerificationRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'}>Open NCs / Findings:</span>
                <span className={`font-bold ${theme === 'light' ? 'text-rose-600' : 'text-[#F43F5E]'}`}>
                  {activeMonthData.openFindings}
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className={`text-[10px] uppercase font-bold block mb-1 font-mono ${
              theme === 'light' ? 'text-slate-500' : 'text-[#7F8BA3]'
            }`}>
              Framework Maturity Breakdown
            </span>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              <div className={`flex justify-between p-1.5 rounded border ${
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-[#111A2C] border-[#1B2639]'
              }`}>
                <span className={theme === 'light' ? 'text-sky-600' : 'text-[#38BDF8]'}>ISO 27001:</span>
                <strong className={theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}>{activeMonthData.iso27001}%</strong>
              </div>
              <div className={`flex justify-between p-1.5 rounded border ${
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-[#111A2C] border-[#1B2639]'
              }`}>
                <span className={theme === 'light' ? 'text-purple-600' : 'text-[#A78BFA]'}>ISO 42001:</span>
                <strong className={theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}>{activeMonthData.iso42001}%</strong>
              </div>
              <div className={`flex justify-between p-1.5 rounded border ${
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-[#111A2C] border-[#1B2639]'
              }`}>
                <span className={theme === 'light' ? 'text-rose-600' : 'text-[#F43F5E]'}>MAS TRM:</span>
                <strong className={theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}>{activeMonthData.masTrm}%</strong>
              </div>
              <div className={`flex justify-between p-1.5 rounded border ${
                theme === 'light'
                  ? 'bg-white border-slate-200'
                  : 'bg-[#111A2C] border-[#1B2639]'
              }`}>
                <span className={theme === 'light' ? 'text-emerald-600' : 'text-[#34D399]'}>SOC 2:</span>
                <strong className={theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}>{activeMonthData.soc2}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Footer CMMI Maturity Scale Benchmark Legend */}
      <div
        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2 ${
          theme === 'light'
            ? 'bg-indigo-50/50 border-indigo-200/80 text-indigo-950'
            : 'bg-[#0D1424] border-[#1B2639] text-[#A7B0C0]'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Sparkles className={`w-4 h-4 shrink-0 ${theme === 'light' ? 'text-indigo-600' : 'text-[#8B5CF6]'}`} />
          <span>
            <strong className={theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'}>GRC CMMI Maturity Scale:</strong> Level 5: Optimizing (&ge;90%) &bull; Level 4: Quantitatively Managed (75-89%) &bull; Level 3: Defined (60-74%)
          </span>
        </div>
        {onNavigateModule && (
          <button
            onClick={() => onNavigateModule('analytics')}
            className={`inline-flex items-center space-x-1 font-bold hover:underline cursor-pointer shrink-0 ${
              theme === 'light' ? 'text-indigo-600 hover:text-indigo-800' : 'text-[#8B5CF6] hover:text-[#A78BFA]'
            }`}
          >
            <span>Deep-Dive Analytics</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
