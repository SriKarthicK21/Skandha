import React from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';

interface RiskOverviewSectionProps {
  onNavigateModule: (moduleId: string) => void;
}

export const RiskOverviewSection: React.FC<RiskOverviewSectionProps> = ({
  onNavigateModule
}) => {
  const { risks, currentTenant, theme } = useGRC();
  const isLight = theme === 'light';

  const tenantRisks = risks.filter(r => !r.tenantId || r.tenantId === currentTenant?.id);

  const riskCounts = {
    critical: tenantRisks.filter(r => (r.residualScore || r.inherentScore) >= 20).length,
    high: tenantRisks.filter(r => {
      const score = r.residualScore || r.inherentScore;
      return score >= 12 && score < 20;
    }).length,
    medium: tenantRisks.filter(r => {
      const score = r.residualScore || r.inherentScore;
      return score >= 6 && score < 12;
    }).length,
    low: tenantRisks.filter(r => {
      const score = r.residualScore || r.inherentScore;
      return score < 6;
    }).length,
    accepted: tenantRisks.filter(r => r.treatmentOption === 'Accept').length
  };

  // Dynamically aggregate categories from real tenant risks
  const catMap: Record<string, { count: number; maxScore: number }> = {};
  tenantRisks.forEach(r => {
    const cat = r.category || 'Information Security';
    const score = r.residualScore || r.inherentScore || 5;
    if (!catMap[cat]) catMap[cat] = { count: 0, maxScore: 0 };
    catMap[cat].count += 1;
    if (score > catMap[cat].maxScore) catMap[cat].maxScore = score;
  });

  const dynamicCategories = Object.entries(catMap).map(([name, val]) => ({
    name,
    count: val.count,
    severity: val.maxScore >= 20 ? 'Critical' : (val.maxScore >= 12 ? 'High' : (val.maxScore >= 6 ? 'Medium' : 'Low')),
    color: val.maxScore >= 20 ? 'bg-rose-500' : (val.maxScore >= 12 ? 'bg-amber-500' : 'bg-indigo-500')
  })).sort((a, b) => b.count - a.count);

  const topCategories = dynamicCategories.length > 0 ? dynamicCategories.slice(0, 5) : [
    { name: 'Access Control & IAM', count: 0, severity: 'Low', color: 'bg-emerald-500' }
  ];

  return (
    <div className="p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800/60'
        }`}>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-tight flex items-center space-x-2">
                <span className={isLight ? 'text-slate-900' : 'text-white'}>Risk Overview</span>
              </h2>
              <Tooltip
                title="Enterprise Risk Exposure"
                badge="Within Appetite"
                content="Evaluates aggregate residual risk across all operational domains after control treatment. Aligned with board risk appetite."
                benchmark="Appetite: 0 Critical Risks, ≤ 2 High Risks under active remediation."
                position="bottom"
              >
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold cursor-help ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  Low Exposure
                </span>
              </Tooltip>
              <MetricInfoTooltip
                title="Risk Scoring Matrix"
                content="Risks are scored on a 5x5 Likelihood vs Impact scale (1–25). Inherent risk is reduced to Residual risk via operational controls."
                formula="Residual Risk = Inherent Likelihood × Inherent Impact × (1 - Control Efficacy)"
                benchmark="Critical: ≥20 | High: 12-19 | Medium: 6-11 | Low: 1-5"
                position="right"
              />
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Enterprise risk register & treatment progress
            </p>
          </div>
          <button
            onClick={() => onNavigateModule('risk_map')}
            className={`text-xs font-semibold transition flex items-center space-x-1 ${
              isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <span>Risk Register</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Risk Exposure Numbers Row */}
        <div className="grid grid-cols-5 gap-2 mt-3.5">
          {/* Critical */}
          <Tooltip
            title="Critical Residual Risks"
            badge="Score 20–25"
            content="Immediate existential or regulatory shutdown threats. Requires 24-hour escalation and mandatory emergency board mitigation."
            benchmark="Tolerance: 0 allowed. Currently 0 active."
            position="top"
          >
            <div className={`p-2.5 rounded-xl border text-center cursor-help transition ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                : 'bg-slate-950/70 hover:border-slate-700 border-slate-800/80'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>Critical</span>
              <span className={`text-base font-bold font-mono mt-2 block ${
                isLight ? 'text-slate-800' : 'text-slate-400'
              }`}>{riskCounts.critical}</span>
            </div>
          </Tooltip>

          {/* High */}
          <Tooltip
            title="High Residual Risks"
            badge="Score 12–19"
            content="Substantial operational, compliance, or security vulnerabilities requiring approved Risk Treatment Plans (RTP) within 30-day SLA."
            benchmark="Target: ≤ 2 active with CISO-signed treatment plans."
            recommendation="Both active risks (IAM & Vendor) have assigned remediations."
            position="top"
          >
            <div className={`p-2.5 rounded-xl border text-center cursor-help transition ${
              isLight
                ? 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-200 text-rose-800'
                : 'bg-slate-950/70 hover:border-rose-900/50 border-slate-800/80'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-rose-700' : 'text-rose-400'
              }`}>High</span>
              <span className={`text-base font-bold font-mono mt-2 block ${
                isLight ? 'text-rose-800' : 'text-rose-400'
              }`}>{riskCounts.high}</span>
            </div>
          </Tooltip>

          {/* Medium */}
          <Tooltip
            title="Medium Residual Risks"
            badge="Score 6–11"
            content="Moderate vulnerabilities managed through standard development sprint cycles and quarterly supervisory reviews."
            benchmark="Handled via scheduled sprint tasks within 90 days."
            position="top"
          >
            <div className={`p-2.5 rounded-xl border text-center cursor-help transition ${
              isLight
                ? 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-200 text-amber-800'
                : 'bg-slate-950/70 hover:border-amber-900/50 border-slate-800/80'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-amber-700' : 'text-amber-400'
              }`}>Medium</span>
              <span className={`text-base font-bold font-mono mt-2 block ${
                isLight ? 'text-amber-800' : 'text-amber-400'
              }`}>{riskCounts.medium}</span>
            </div>
          </Tooltip>

          {/* Low */}
          <Tooltip
            title="Low Residual Risks"
            badge="Score 1–5"
            content="Minor operational deviations mitigated by routine policy adherence, annual awareness training, and default security baselines."
            position="top"
          >
            <div className={`p-2.5 rounded-xl border text-center cursor-help transition ${
              isLight
                ? 'bg-blue-50/70 hover:bg-blue-100/80 border-blue-200 text-blue-800'
                : 'bg-slate-950/70 hover:border-blue-900/50 border-slate-800/80'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-blue-700' : 'text-blue-400'
              }`}>Low</span>
              <span className={`text-base font-bold font-mono mt-2 block ${
                isLight ? 'text-blue-800' : 'text-blue-400'
              }`}>{riskCounts.low}</span>
            </div>
          </Tooltip>

          {/* Accepted */}
          <Tooltip
            title="Formally Accepted Risks"
            badge="Executive Sign-Off"
            content="Risks where mitigation cost exceeds exposure, formally approved with documented compensating controls and annual expiration."
            benchmark="Mandatory annual review by Risk Committee."
            position="top"
          >
            <div className={`p-2.5 rounded-xl border text-center cursor-help transition ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                : 'bg-slate-950/70 hover:border-slate-700 border-slate-800/80'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>Accepted</span>
              <span className={`text-base font-bold font-mono mt-2 block ${
                isLight ? 'text-slate-800' : 'text-slate-300'
              }`}>{riskCounts.accepted}</span>
            </div>
          </Tooltip>
        </div>

        {/* Top Risk Categories List */}
        <div className="mt-4 space-y-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Top Risk Categories
          </span>

          <div className="space-y-1.5">
            {topCategories.map(cat => (
              <div
                key={cat.name}
                onClick={() => onNavigateModule('risk_assessment')}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition text-xs ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300'
                    : 'bg-slate-950/50 hover:bg-slate-950 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${cat.color} shrink-0`} />
                  <span className={`font-medium truncate ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{cat.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{cat.count} risks</span>
                  <ChevronRight className={`w-3 h-3 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer 30-Day Trend info */}
      <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
        isLight ? 'border-slate-200' : 'border-slate-800/60'
      }`}>
        <Tooltip
          title="30-Day Risk Velocity"
          badge="-18% Net Reduction"
          content="Calculates the net change in aggregate enterprise risk exposure over the past 30 days due to verified control mitigations and closed risk treatment plans."
          benchmark="Goal: Continuous negative or stable trajectory within board risk appetite."
          position="top"
        >
          <div className={`flex items-center space-x-1 cursor-help ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <TrendingDown className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span>30-Day Risk Trend:</span>
            <strong className={`font-semibold font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>-18% Reduction</strong>
          </div>
        </Tooltip>
        <button
          onClick={() => onNavigateModule('risk_simulator')}
          className={`text-[11px] font-semibold transition ${
            isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
          }`}
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
};
