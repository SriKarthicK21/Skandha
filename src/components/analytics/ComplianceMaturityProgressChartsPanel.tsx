import React, { useState } from 'react';
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
  Brain,
  Layers,
  Target,
  FileCheck2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DomainMaturityItem, TrendIndicator } from './ComplianceMaturityScorecard';

export interface ComplianceMaturityProgressChartsPanelProps {
  activeDataset: DomainMaturityItem[];
  historicalTrend?: Array<{
    month: string;
    overall: number;
    iso27001: number;
    iso42001: number;
    evidenceVerificationRate: number;
    openFindings: number;
    keyMilestone: string;
  }>;
  overallIso27001: number;
  overallIso42001: number;
  benchmarkThreshold?: number;
  className?: string;
}

export const ComplianceMaturityProgressChartsPanel: React.FC<ComplianceMaturityProgressChartsPanelProps> = ({
  activeDataset,
  historicalTrend,
  overallIso27001,
  overallIso42001,
  benchmarkThreshold = 85,
  className = ''
}) => {
  const [chartMode, setChartMode] = useState<'area' | 'line'>('area');

  const defaultHistory = [
    { month: 'Apr 26', overall: 78.2, iso27001: 76.5, iso42001: 52.0, evidenceRate: 74, openFindings: 14, milestone: 'Q1 Gap Assessment Baseline' },
    { month: 'May 26', overall: 82.5, iso27001: 81.0, iso42001: 59.4, evidenceRate: 81, openFindings: 10, milestone: 'Telemetry Collectors Online' },
    { month: 'Jun 26', overall: 86.8, iso27001: 85.2, iso42001: 67.5, evidenceRate: 88, openFindings: 6, milestone: 'Passed Q2 Audit Cycle' },
    { month: 'Jul 26', overall: 89.4, iso27001: 89.0, iso42001: 74.8, evidenceRate: 91, openFindings: 4, milestone: 'AISIA Risk Protocol Ratified' },
    { month: 'Aug 26', overall: 91.2, iso27001: 91.5, iso42001: 80.2, evidenceRate: 94, openFindings: 3, milestone: 'CI/CD Red Teaming Gates Active' },
    { month: 'Sep 26', overall: 93.0, iso27001: 93.2, iso42001: 84.5, evidenceRate: 96, openFindings: 1, milestone: 'Stage 1 Readiness Achieved' }
  ];

  const chartData = historicalTrend
    ? historicalTrend.map(h => ({
        month: h.month,
        overall: h.overall,
        iso27001: h.iso27001,
        iso42001: h.iso42001,
        evidenceRate: h.evidenceVerificationRate,
        openFindings: h.openFindings,
        milestone: h.keyMilestone
      }))
    : defaultHistory;

  return (
    <div className={`bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] rounded-2xl p-4 sm:p-6 shadow-sm space-y-6 ${className}`} id="maturity-progress-charts-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--skanda-border)] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Maturity Progress Trajectory & Velocity Trends
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              6-Month Audited Cohort
            </span>
          </div>
          <p className="text-xs text-[var(--skanda-text-muted)] mt-1">
            Tracking longitudinal progress toward the 85% external registrar threshold and evidence freshness rate.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center bg-[var(--skanda-bg-primary)] p-1 rounded-xl border border-[var(--skanda-border)] text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('area')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartMode === 'area' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Area Trend
          </button>
          <button
            type="button"
            onClick={() => setChartMode('line')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartMode === 'line' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Line Progression
          </button>
        </div>
      </div>

      {/* Grid: 6-Month Chart + Comparative Dimension Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recharts Trajectory (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              6-Month Multi-Framework Trajectory
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ISO 27001
              </span>
              <span className="text-purple-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                ISO 42001
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-0.5 bg-amber-400" />
                85% Target
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full bg-[var(--skanda-bg-primary)] p-3 rounded-xl border border-[var(--skanda-border)]">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad27k" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="grad42k" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[40, 100]} stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                    formatter={(val: any, name: any) => [`${val}%`, name === 'iso27001' ? 'ISO 27001' : name === 'iso42001' ? 'ISO 42001' : name]}
                  />
                  <ReferenceLine
                    y={benchmarkThreshold}
                    stroke="#F59E0B"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: '85% Target', position: 'insideTopRight', fill: '#F59E0B', fontSize: 10 }}
                  />
                  <Area type="monotone" dataKey="iso27001" stroke="#10B981" strokeWidth={2.5} fill="url(#grad27k)" name="ISO 27001" />
                  <Area type="monotone" dataKey="iso42001" stroke="#A855F7" strokeWidth={2.5} fill="url(#grad42k)" name="ISO 42001" />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis domain={[40, 100]} stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <ReferenceLine
                    y={benchmarkThreshold}
                    stroke="#F59E0B"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: '85% Target', position: 'insideTopRight', fill: '#F59E0B', fontSize: 10 }}
                  />
                  <Line type="monotone" dataKey="iso27001" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} name="ISO 27001" />
                  <Line type="monotone" dataKey="iso42001" stroke="#A855F7" strokeWidth={2.5} dot={{ fill: '#A855F7', r: 3 }} name="ISO 42001" />
                  <Line type="monotone" dataKey="overall" stroke="#38BDF8" strokeWidth={2} strokeDasharray="3 3" dot={{ fill: '#38BDF8', r: 2.5 }} name="Composite" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] shadow-xs transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/30 dark:hover:shadow-black/60 hover:border-slate-400 dark:hover:border-slate-600 cursor-default">
              <span className="text-[10px] text-slate-400 block">6-Mo Growth Velocity</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-emerald-400 font-mono">93.0%</span>
                <TrendIndicator delta={16.7} size="xs" variant="pill" />
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] shadow-xs transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/30 dark:hover:shadow-black/60 hover:border-slate-400 dark:hover:border-slate-600 cursor-default">
              <span className="text-[10px] text-slate-400 block">Evidence Verification</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-sky-400 font-mono">96%</span>
                <TrendIndicator delta={2.4} size="xs" variant="pill" />
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] shadow-xs transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/30 dark:hover:shadow-black/60 hover:border-slate-400 dark:hover:border-slate-600 cursor-default">
              <span className="text-[10px] text-slate-400 block">Open CAPAs / Gaps</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-amber-400 font-mono">1 Active</span>
                <TrendIndicator delta={-2.0} size="xs" variant="pill" label="closed" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Comparative Dimensional Progress Bars (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Dimension Progress vs 85% Benchmark
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Target: 85%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--skanda-bg-primary)] border border-[var(--skanda-border)] space-y-3.5 max-h-[345px] overflow-y-auto">
            {activeDataset.slice(0, 7).map((dim) => {
              const isPassing = dim.iso27001Score >= 85 && dim.iso42001Score >= 85;

              return (
                <div key={dim.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPassing ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span className="font-semibold text-white truncate max-w-[170px]" title={dim.domainName}>
                        {dim.shortLabel}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <span className="text-emerald-400">{dim.iso27001Score}%</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-purple-400">{dim.iso42001Score}%</span>
                    </div>
                  </div>

                  {/* Dual Bar Progress */}
                  <div className="space-y-1">
                    {/* ISO 27001 */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${dim.iso27001Score}%` }}
                      />
                      {/* 85% marker */}
                      <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-amber-400/70" />
                    </div>

                    {/* ISO 42001 */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${dim.iso42001Score}%` }}
                      />
                      {/* 85% marker */}
                      <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-amber-400/70" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
