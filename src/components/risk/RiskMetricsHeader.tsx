import React from 'react';
import { RiskRecord } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Radio,
  Award,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface RiskMetricsHeaderProps {
  risks: RiskRecord[];
  onFilterCritical: () => void;
  onFilterAppetite: () => void;
  onFilterEscalated: () => void;
  onNavigateTab?: (tab: 'heatmap' | 'comparison' | 'harmonizer' | 'telemetry' | 'register') => void;
}

export const RiskMetricsHeader: React.FC<RiskMetricsHeaderProps> = ({
  risks,
  onFilterCritical,
  onFilterAppetite,
  onFilterEscalated,
  onNavigateTab
}) => {
  const totalRisks = risks.length;

  const criticalInherent = risks.filter(r => r.inherentScore >= 16).length;
  const criticalResidual = risks.filter(r => r.residualScore >= 16).length;

  const inAppetiteResidual = risks.filter(r => r.residualScore <= 4).length;
  const inAppetitePct = totalRisks > 0 ? Math.round((inAppetiteResidual / totalRisks) * 100) : 100;

  const escalatedCount = risks.filter(r => r.escalatedToSuperAdmin).length;

  const totalInherentScore = risks.reduce((acc, r) => acc + r.inherentScore, 0);
  const totalResidualScore = risks.reduce((acc, r) => acc + r.residualScore, 0);

  const avgInherent = totalRisks > 0 ? (totalInherentScore / totalRisks).toFixed(1) : '0';
  const avgResidual = totalRisks > 0 ? (totalResidualScore / totalRisks).toFixed(1) : '0';
  const avgReduction = parseFloat(avgInherent) > 0
    ? Math.round(((parseFloat(avgInherent) - parseFloat(avgResidual)) / parseFloat(avgInherent)) * 100)
    : 0;

  // New Metrics
  const executiveAcceptedCount = risks.filter(r => r.executiveAcceptance?.status === 'Accepted').length;
  const tripleMappedCount = risks.filter(r => 
    r.frameworkMappings?.iso27001Controls?.length && 
    r.frameworkMappings?.iso42001Controls?.length && 
    r.frameworkMappings?.masTrmSections?.length
  ).length;
  const activeTelemetryCount = risks.reduce((acc, r) => 
    acc + (r.telemetrySignals || []).filter(s => s.active).length, 0
  );

  return (
    <div className="space-y-3">
      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* 1. Total Risks Evaluated */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Profile</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-white">{totalRisks}</span>
              <span
                className="inline-flex items-center space-x-0.5 px-1 py-0.2 rounded font-mono text-[9.5px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 leading-none shrink-0"
                title="Profile expanded with 1 newly identified risk"
              >
                <TrendingUp className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                <span>+1</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Categorized ISO/MAS Risks</div>
          </div>
        </div>

        {/* 2. Critical Threat Mitigation */}
        <div
          onClick={onFilterCritical}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 flex flex-col justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Critical Threats</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-2">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold font-mono text-rose-400">{criticalResidual}</span>
                <span
                  className="inline-flex items-center space-x-0.5 px-1 py-0.2 rounded font-mono text-[9.5px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 leading-none shrink-0"
                  title="Critical risks reduced by 2 following PAM & IAM treatments"
                >
                  <TrendingDown className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <span>-2</span>
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono line-through">from {criticalInherent}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{criticalInherent - criticalResidual} neutralized to appetite</span>
            </div>
          </div>
        </div>

        {/* 3. Within Risk Appetite */}
        <div
          onClick={onFilterAppetite}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 flex flex-col justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">In Risk Appetite</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">{inAppetitePct}%</span>
              <span
                className="inline-flex items-center space-x-0.5 px-1 py-0.2 rounded font-mono text-[9.5px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 leading-none shrink-0"
                title="In-appetite ratio improved +6.2%"
              >
                <TrendingUp className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                <span>+6.2%</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {inAppetiteResidual} / {totalRisks} in safe threshold (≤4)
            </div>
          </div>
        </div>

        {/* 4. Average Residual Risk Reduction */}
        <div
          onClick={onFilterEscalated}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Mitigation Velocity</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-white">-{avgReduction}%</span>
              <span
                className="inline-flex items-center space-x-0.5 px-1 py-0.2 rounded font-mono text-[9.5px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 leading-none shrink-0"
                title="Residual risk reduction velocity improved"
              >
                <TrendingDown className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                <span>-12%</span>
              </span>
              <span className="text-[10px] text-slate-400">({avgInherent} → {avgResidual})</span>
            </div>
            <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
              {escalatedCount} Escalated to Super Admin
            </div>
          </div>
        </div>
      </div>

      {/* Secondary ISO Implementer Capabilities Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Clause 6.1.3 Executive Acceptance */}
        <div
          onClick={() => onNavigateTab?.('register')}
          className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-amber-950/20 border border-slate-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>Clause 6.1.3 Sign-offs</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
                  {executiveAcceptedCount} Formal Approvals
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Digital CISO / Board Acceptance Log</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
        </div>

        {/* Tri-Framework Harmonizer */}
        <div
          onClick={() => onNavigateTab?.('harmonizer')}
          className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/20 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>Tri-Framework Harmonizer</span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800">
                  {tripleMappedCount} / {totalRisks} Synced
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">ISO 27001 + ISO 42001 + MAS TRM</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
        </div>

        {/* Live Telemetry Pulse Feed */}
        <div
          onClick={() => onNavigateTab?.('telemetry')}
          className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-rose-950/20 border border-slate-800 hover:border-rose-500/40 cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0 relative">
              <Radio className="w-4 h-4" />
              {activeTelemetryCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>CCM Telemetry Stream</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  activeTelemetryCount > 0
                    ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {activeTelemetryCount} Active Alerts
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">AWS, CrowdStrike, GitHub & Okta</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
        </div>
      </div>
    </div>
  );
};
