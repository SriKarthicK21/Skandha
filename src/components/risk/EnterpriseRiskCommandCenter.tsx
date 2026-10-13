import React from 'react';
import {
  Flame,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Layers,
  Sparkles,
  ArrowUpRight,
  Clock,
  Building2,
  Activity,
  CheckCircle2,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { EnterpriseRiskRecord, ExecutiveRiskCommandSummary } from '../../types/enterpriseRiskTypes';

interface EnterpriseRiskCommandCenterProps {
  summary: ExecutiveRiskCommandSummary;
  onSelectRisk: (risk: EnterpriseRiskRecord) => void;
  onOpenExplainability: (risk: EnterpriseRiskRecord, tab: 'why' | 'what-changed' | 'next-action') => void;
  onNavigateTab: (tab: string) => void;
}

export const EnterpriseRiskCommandCenter: React.FC<EnterpriseRiskCommandCenterProps> = ({
  summary,
  onSelectRisk,
  onOpenExplainability,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Active Risks</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{summary.totalActiveRisks}</span>
            <span className="text-xs text-rose-400 font-medium">({summary.criticalRisksCount} Critical)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">ISO 31000 & 27005 Grounded</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Outside Appetite</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${summary.outsideAppetiteCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {summary.outsideAppetiteCount}
            </span>
            <span className="text-xs text-slate-400">Breaches</span>
          </div>
          <button
            onClick={() => onNavigateTab('appetite')}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 text-left"
          >
            Review Appetite Queue <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Risk Velocity</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-400 font-mono">{summary.increasingVelocityCount}</span>
            <span className="text-xs text-slate-400">Increasing</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Event-Driven Telemetry</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Avg Control Effectiveness</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{summary.averageControlEffectivenessPercent}%</span>
            <span className="text-xs text-slate-400">Validated</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Evidence & Automated Checks</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Annual Loss Expectancy</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-blue-400 font-mono">
              ${(summary.totalAnnualLossExpectancyUSD / 1000).toFixed(0)}K
            </span>
            <span className="text-xs text-slate-400">/Year (ALE)</span>
          </div>
          <button
            onClick={() => onNavigateTab('quantitative')}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 text-left"
          >
            FAIR Loss Simulator <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Max Financial Exposure</span>
            <AlertOctagon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-purple-400 font-mono">
              ${(summary.totalAssessedFinancialExposureUSD / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs text-slate-400">USD (SLE)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">90% Statistical Confidence</div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID: TOP RISK DRIVERS & EXPOSED BUSINESS SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP RISK DRIVERS (2 COLUMNS) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                Enterprise Top Risk Drivers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prioritized by residual risk score, appetite breaches, and telemetry drift.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('register')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20"
            >
              View Full Risk Register <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {summary.topRiskDrivers.map((risk) => {
              const isBreach = risk.isOutsideAppetite;
              const severityColor =
                risk.residualRiskScore >= 16
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : risk.residualRiskScore >= 10
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : risk.residualRiskScore >= 5
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

              return (
                <div
                  key={risk.id}
                  className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {risk.riskCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 bg-slate-700/40 px-2 py-0.5 rounded">
                          {risk.category}
                        </span>
                        {isBreach && (
                          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> APPETITE BREACH
                          </span>
                        )}
                      </div>
                      <h4
                        onClick={() => onSelectRisk(risk)}
                        className="text-sm font-semibold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                      >
                        {risk.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{risk.riskStatement}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${severityColor}`}>
                        Residual: {risk.residualRiskScore}/25 ({risk.residualLevel})
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1">Inherent: {risk.inherentRiskScore}/25</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/40 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <div className="flex items-center gap-4">
                      <span>Owner: <strong className="text-slate-300">{risk.riskOwner}</strong></span>
                      <span>Controls: <strong className="text-slate-300">{risk.currentControlEffectivenessPercent}% Eff.</strong></span>
                      {risk.quantitativeAnalysis && (
                        <span>ALE: <strong className="text-blue-400">${(risk.quantitativeAnalysis.annualLossExpectancyUSD / 1000).toFixed(0)}K</strong></span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenExplainability(risk, 'why')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                      >
                        Show Me Why
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => onOpenExplainability(risk, 'what-changed')}
                        className="text-xs text-slate-400 hover:text-slate-300 font-medium hover:underline"
                      >
                        What Changed
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => onOpenExplainability(risk, 'next-action')}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline"
                      >
                        Next Action
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUSINESS SERVICES BLAST RADIUS (1 COLUMN) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Business Services Blast Radius
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Service criticality vs. active risk exposure.
            </p>
          </div>

          <div className="space-y-3">
            {summary.topExposedBusinessServices.map((svc) => {
              const isHighExposure = svc.maxResidualScore >= 10;
              return (
                <div
                  key={svc.serviceId}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white line-clamp-1">{svc.serviceName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                        svc.criticality === 'TIER_1_MISSION_CRITICAL'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      }`}
                    >
                      {svc.criticality === 'TIER_1_MISSION_CRITICAL' ? 'TIER 1' : 'TIER 2'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Active Linked Risks: <strong className="text-slate-200">{svc.activeRisksCount}</strong></span>
                    <span className={isHighExposure ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                      Max Score: {svc.maxResidualScore}/25
                    </span>
                  </div>

                  <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        svc.maxResidualScore >= 16
                          ? 'bg-rose-500'
                          : svc.maxResidualScore >= 10
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (svc.maxResidualScore / 25) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('copilot')}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Ask AI Risk Copilot for Impact Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
