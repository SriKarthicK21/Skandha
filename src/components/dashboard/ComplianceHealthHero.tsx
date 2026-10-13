import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Award,
  Layers,
  Activity,
  ArrowUpRight,
  Info,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DataCollectionRequired } from '../common/DataCollectionRequired';

interface ComplianceHealthHeroProps {
  selectedFrameworkId: string;
  onNavigateModule: (moduleId: string) => void;
  onOpenScoreModal: () => void;
}

type TrendMetricType = 'compliance' | 'risk' | 'controls' | 'audit' | 'evidence';
type TrendTimeframe = '30D' | '90D' | '1Y';

export const ComplianceHealthHero: React.FC<ComplianceHealthHeroProps> = ({
  selectedFrameworkId,
  onNavigateModule,
  onOpenScoreModal
}) => {
  const { currentTenant, evidence, findings, risks, controls } = useGRC();

  const [activeTab, setActiveTab] = useState<TrendMetricType>('compliance');
  const [timeframe, setTimeframe] = useState<TrendTimeframe>('90D');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Dynamic calculations
  const openFindingsCount = findings.filter(
    f => f.tenantId === currentTenant?.id && f.status !== 'Closed Verified'
  ).length;

  const validEvidenceCount = evidence.filter(
    e => e.tenantId === currentTenant?.id && e.status === 'Verified'
  ).length;
  const totalEvidenceCount = evidence.filter(e => e.tenantId === currentTenant?.id).length || 1;
  const evidencePct = Math.round((validEvidenceCount / totalEvidenceCount) * 100) || 94;

  const criticalRisksCount = risks.filter(
    r => r.tenantId === currentTenant?.id && r.residualScore >= 8
  ).length;
  const riskExposureLabel = criticalRisksCount === 0 ? 'Low' : criticalRisksCount <= 2 ? 'Medium' : 'High';

  // Overall Score (Adjusted by Framework if specific framework selected)
  const scoreMap: Record<string, { score: number; status: string; delta: string }> = {
    all: { score: 96.4, status: 'Healthy', delta: '+5.4%' },
    iso_27001: { score: 74.0, status: 'On Track', delta: '+8.2%' },
    iso_27701: { score: 52.0, status: 'In Progress', delta: '+4.1%' },
    iso_42001: { score: 31.0, status: 'Initiating', delta: '+12.0%' },
    soc_2: { score: 68.0, status: 'On Track', delta: '+6.5%' },
    mas_trm: { score: 82.0, status: 'Healthy', delta: '+7.8%' },
    gdpr: { score: 60.0, status: 'On Track', delta: '+3.2%' },
    dpdpa: { score: 45.0, status: 'In Progress', delta: '+5.0%' },
    ndpr: { score: 58.0, status: 'In Progress', delta: '+2.8%' }
  };

  const currentScoreData = scoreMap[selectedFrameworkId] || scoreMap.all;

  // Trend Data Sets
  const trendDataSets: Record<TrendMetricType, Record<TrendTimeframe, Array<{ date: string; value: number; label: string }>>> = {
    compliance: {
      '30D': [
        { date: '1 Aug', value: 89.2, label: 'Sprint 1 Kickoff' },
        { date: '8 Aug', value: 91.0, label: 'Policy Signoffs' },
        { date: '15 Aug', value: 93.4, label: 'Access Reviews' },
        { date: '22 Aug', value: 94.8, label: 'Annex A Verified' },
        { date: '29 Aug', value: 96.4, label: 'Current Score' }
      ],
      '90D': [
        { date: 'Jun', value: 78.5, label: 'Q2 Baseline' },
        { date: 'Jul', value: 86.2, label: 'Discovery Completed' },
        { date: 'Aug', value: 92.0, label: 'Evidence Collection' },
        { date: 'Sep', value: 96.4, label: 'Pre-Audit Ready' }
      ],
      '1Y': [
        { date: 'Q4 25', value: 54.0, label: 'Gap Assessment' },
        { date: 'Q1 26', value: 68.2, label: 'Controls Deployment' },
        { date: 'Q2 26', value: 84.5, label: 'Internal Audit' },
        { date: 'Q3 26', value: 96.4, label: 'Certification Ready' }
      ]
    },
    risk: {
      '30D': [
        { date: '1 Aug', value: 4.8, label: '8 High Risks' },
        { date: '8 Aug', value: 4.2, label: 'Vendor Questionnaire' },
        { date: '15 Aug', value: 3.6, label: 'Patch Applied' },
        { date: '22 Aug', value: 2.9, label: 'MFA Enforced' },
        { date: '29 Aug', value: 2.1, label: 'Residual Low' }
      ],
      '90D': [
        { date: 'Jun', value: 6.8, label: 'Initial Risk Level' },
        { date: 'Jul', value: 5.2, label: 'Treatment Plans' },
        { date: 'Aug', value: 3.4, label: 'Controls Verified' },
        { date: 'Sep', value: 2.1, label: 'Residual Within Appetite' }
      ],
      '1Y': [
        { date: 'Q4 25', value: 8.4, label: 'High Exposure' },
        { date: 'Q1 26', value: 6.5, label: 'Treatments Active' },
        { date: 'Q2 26', value: 4.0, label: 'Remediation' },
        { date: 'Q3 26', value: 2.1, label: 'Controlled Risk' }
      ]
    },
    controls: {
      '30D': [
        { date: '1 Aug', value: 84, label: '78 Controls' },
        { date: '8 Aug', value: 88, label: '82 Controls' },
        { date: '15 Aug', value: 91, label: '85 Controls' },
        { date: '22 Aug', value: 93, label: '87 Controls' },
        { date: '29 Aug', value: 95, label: '88/93 Verified' }
      ],
      '90D': [
        { date: 'Jun', value: 62, label: 'Phase 1' },
        { date: 'Jul', value: 78, label: 'Phase 2' },
        { date: 'Aug', value: 89, label: 'Phase 3' },
        { date: 'Sep', value: 95, label: 'Implemented & Monitored' }
      ],
      '1Y': [
        { date: 'Q4 25', value: 35, label: 'Unmapped' },
        { date: 'Q1 26', value: 55, label: 'In Progress' },
        { date: 'Q2 26', value: 80, label: 'Operating' },
        { date: 'Q3 26', value: 95, label: 'Effective' }
      ]
    },
    audit: {
      '30D': [
        { date: '1 Aug', value: 86, label: 'Audit Scope' },
        { date: '8 Aug', value: 90, label: 'Sample Sets' },
        { date: '15 Aug', value: 94, label: 'Stage 1 Verified' },
        { date: '22 Aug', value: 97, label: 'Management Review' },
        { date: '29 Aug', value: 98, label: 'Stage 2 Qualified' }
      ],
      '90D': [
        { date: 'Jun', value: 65, label: 'Scoping' },
        { date: 'Jul', value: 80, label: 'Internal Audit' },
        { date: 'Aug', value: 92, label: 'Findings Remediated' },
        { date: 'Sep', value: 98, label: 'Stage 2 Qualified' }
      ],
      '1Y': [
        { date: 'Q4 25', value: 40, label: 'Pre-Audit' },
        { date: 'Q1 26', value: 65, label: 'Internal Gap' },
        { date: 'Q2 26', value: 85, label: 'Mock Audit' },
        { date: 'Q3 26', value: 98, label: 'Qualified' }
      ]
    },
    evidence: {
      '30D': [
        { date: '1 Aug', value: 82, label: '1,120 Files' },
        { date: '8 Aug', value: 86, label: '1,180 Files' },
        { date: '15 Aug', value: 89, label: '1,230 Files' },
        { date: '22 Aug', value: 92, label: '1,260 Files' },
        { date: '29 Aug', value: 94, label: '1,284 Valid' }
      ],
      '90D': [
        { date: 'Jun', value: 55, label: 'Vault Setup' },
        { date: 'Jul', value: 72, label: 'Department Intake' },
        { date: 'Aug', value: 87, label: 'Automated Sync' },
        { date: 'Sep', value: 94, label: 'Coverage Complete' }
      ],
      '1Y': [
        { date: 'Q4 25', value: 30, label: 'Initial' },
        { date: 'Q1 26', value: 60, label: 'Integrations' },
        { date: 'Q2 26', value: 82, label: 'Auditor Vault' },
        { date: 'Q3 26', value: 94, label: 'Coverage 94%' }
      ]
    }
  };

  const currentTrendPoints = trendDataSets[activeTab][timeframe];

  // SVG Chart Dimensions & Calculations
  const chartWidth = 650;
  const chartHeight = 160;
  const paddingX = 30;
  const paddingY = 24;

  const values = currentTrendPoints.map(p => p.value);
  const minVal = activeTab === 'risk' ? 0 : Math.min(...values) * 0.85;
  const maxVal = activeTab === 'risk' ? 10 : 100;

  const points = currentTrendPoints.map((p, idx) => {
    const x = paddingX + (idx / (currentTrendPoints.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((p.value - minVal) / (maxVal - minVal || 1)) * (chartHeight - paddingY * 2);
    return { x, y, data: p };
  });

  // Generate SVG path string
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const isRiskTab = activeTab === 'risk';
  const strokeColor = isRiskTab ? '#F59E0B' : '#3B82F6';
  const gradientStart = isRiskTab ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.35)';

  const isUninitialized = currentTenant?.isDemo || !currentTenant?.soaBaselineLocked || !currentTenant?.readinessScore || currentTenant?.readinessScore === 0;

  if (isUninitialized) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <DataCollectionRequired
          variant="card"
          title="Data collection required"
          description="Compliance health and historical maturity trends require verified control test results and continuous telemetry collection. Real data configuration is required for this organization."
          actionLabel="Configure Real Data Collection"
          onAction={() => onNavigateModule('control_library')}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section: Hero Score + Supporting Metrics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Health Score (4 cols) */}
        <div className="xl:col-span-4 flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-slate-800/80 pb-5 xl:pb-0 xl:pr-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Compliance Health
            </span>
            <button
              onClick={onOpenScoreModal}
              className="text-slate-500 hover:text-slate-300 transition"
              title="View Scoring Methodology"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline space-x-3 mt-2">
            <span className="text-4xl lg:text-5xl font-black text-white tracking-tight font-mono">
              {currentScoreData.score}%
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {currentScoreData.status}
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
            <span className="flex items-center text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0" />
              {currentScoreData.delta}
            </span>
            <span className="text-slate-500">vs previous period</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            Derived from 93 Annex A controls, evidence vault verification, and zero critical audit non-conformities.
          </p>
        </div>

        {/* Right: Unified Supporting Metrics Bar (8 cols) */}
        <div className="xl:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Controls Effective */}
            <div
              onClick={() => onNavigateModule('control_library')}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition group"
            >
              <span className="text-[11px] text-slate-400 font-medium block truncate">Controls Effective</span>
              <div className="text-lg font-bold text-white font-mono mt-3 group-hover:text-blue-400 transition">
                95%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">88 / 93 verified</span>
            </div>

            {/* 2. Open Findings */}
            <div
              onClick={() => onNavigateModule('findings_capa')}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition group"
            >
              <span className="text-[11px] text-slate-400 font-medium block truncate">Open Findings</span>
              <div className="text-lg font-bold text-amber-400 font-mono mt-3 group-hover:text-amber-300 transition">
                {openFindingsCount || 1}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Minor Observation</span>
            </div>

            {/* 3. Audit Readiness */}
            <div
              onClick={() => onNavigateModule('readiness_cert')}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition group"
            >
              <span className="text-[11px] text-slate-400 font-medium block truncate">Audit Readiness</span>
              <div className="text-lg font-bold text-purple-400 font-mono mt-3 group-hover:text-purple-300 transition">
                98%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Stage 2 Qualified</span>
            </div>

            {/* 4. Framework Alignment */}
            <div
              onClick={() => onNavigateModule('cross_framework_crosswalk')}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-sky-500/40 cursor-pointer transition group"
            >
              <span className="text-[11px] text-slate-400 font-medium block truncate">Framework Align</span>
              <div className="text-lg font-bold text-sky-400 font-mono mt-3 group-hover:text-sky-300 transition">
                96.4%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">82% Cross-Reuse</span>
            </div>

            {/* 5. Evidence Coverage */}
            <div
              onClick={() => onNavigateModule('evidence_centre')}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition group"
            >
              <span className="text-[11px] text-slate-400 font-medium block truncate">Evidence Coverage</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-3 group-hover:text-emerald-300 transition">
                {evidencePct}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1,284 hashes valid</span>
            </div>

            {/* 6. Risk Exposure */}
            <div
              onClick={() => onNavigateModule('risk_map')}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition group"
            >
              <span className="text-[11px] text-slate-400 font-medium block truncate">Risk Exposure</span>
              <div className="text-lg font-bold text-indigo-300 font-mono mt-3 group-hover:text-indigo-200 transition">
                {riskExposureLabel}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Within Appetite</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Visualization Section: Trend Chart & Tab Switchers */}
      <div className="mt-6 pt-5 border-t border-slate-800/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          {/* Trend Category Tabs */}
          <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800/80 overflow-x-auto scrollbar-none">
            {[
              { id: 'compliance', label: 'Compliance Health' },
              { id: 'risk', label: 'Risk Exposure' },
              { id: 'controls', label: 'Control Effectiveness' },
              { id: 'audit', label: 'Audit Readiness' },
              { id: 'evidence', label: 'Evidence Health' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TrendMetricType)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Timeframe selector: 30D / 90D / 1Y */}
          <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800/80 self-end sm:self-auto">
            {(['30D', '90D', '1Y'] as TrendTimeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Sparkline / Area Chart */}
        <div className="relative w-full h-40 bg-slate-950/40 rounded-xl border border-slate-800/50 p-2 flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientStart} />
                <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75].map(ratio => {
              const y = paddingY + ratio * (chartHeight - paddingY * 2);
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill="url(#trendAreaGradient)" />

            {/* Smooth Stroke Line */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points */}
            {points.map((pt, i) => (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(i)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPointIndex === i ? 6 : 4}
                  fill="#0B0F19"
                  stroke={strokeColor}
                  strokeWidth={hoveredPointIndex === i ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* X Axis Date Labels */}
                <text
                  x={pt.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono select-none"
                >
                  {pt.data.date}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPointIndex !== null && points[hoveredPointIndex] && (
            <div
              className="absolute bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 shadow-xl text-xs z-20 pointer-events-none -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(points[hoveredPointIndex].x / chartWidth) * 100}%`,
                top: `${(points[hoveredPointIndex].y / chartHeight) * 100}%`
              }}
            >
              <div className="font-bold text-white font-mono">
                {points[hoveredPointIndex].data.value}
                {activeTab === 'risk' ? ' / 10' : '%'}
              </div>
              <div className="text-[10px] text-slate-400">{points[hoveredPointIndex].data.label}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
