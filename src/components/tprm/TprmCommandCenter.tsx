/**
 * SKANDA ENTERPRISE TPRM EXECUTIVE COMMAND CENTER
 * Path: src/components/tprm/TprmCommandCenter.tsx
 */

import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  Clock,
  Layers,
  FileCheck2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
  Server,
  Zap,
  Globe2
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';

export const TprmCommandCenter: React.FC = () => {
  const { theme } = useGRC();
  const {
    vendors,
    metrics,
    concentrationSummary,
    setSelectedVendorId,
    setActiveTab
  } = useTprmStore();

  const isLight = theme === 'light';

  // Computed metrics
  const criticalVendors = vendors.filter(v => v.relationship.criticalityTier === 'TIER_1_STRATEGIC_CRITICAL');
  const outsideAppetiteVendors = vendors.filter(v => v.latestRiskSnapshot.isOutsideAppetite);
  const expiringContracts = vendors.filter(v => v.activeContracts.some(c => c.daysUntilExpiry <= 90));

  return (
    <div className="space-y-6">
      {/* 1. Top Executive Banner */}
      <div
        className={`p-6 rounded-2xl border shadow-sm transition-colors ${
          isLight
            ? 'bg-gradient-to-r from-sky-50/90 via-indigo-50/50 to-white border-slate-200'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-sky-500/15 text-sky-400 border-sky-500/30">
                Continuous Assurance OS • 14-Factor Risk Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Methodology: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>5x5 Matrix (2026.1-Enterprise)</strong>
              </span>
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Third-Party Risk Intelligence Command Center
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Continuous real-time posture across {vendors.length} enterprise suppliers, DPA regulatory adherence, 4th-party concentration blast radius, and automated telemetry reassessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('monitoring')}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Telemetry Stream</span>
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                isLight ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              Methodology Studio
            </button>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/80">
          <div
            onClick={() => setActiveTab('vendor_360')}
            className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Active Suppliers</span>
            <div className="text-xl font-black text-sky-500 mt-1">{vendors.length}</div>
            <span className="text-[10px] text-slate-400">100% In Inventory</span>
          </div>

          <div
            onClick={() => setActiveTab('vendor_360')}
            className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tier-1 Critical Vendors</span>
            <div className="text-xl font-black text-rose-500 mt-1">{metrics.criticalTierVendorsCount}</div>
            <span className="text-[10px] text-slate-400">Direct Core Banking</span>
          </div>

          <div
            onClick={() => setActiveTab('findings')}
            className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Outside Risk Appetite</span>
            <div className="text-xl font-black text-amber-500 mt-1">{metrics.vendorsOutsideAppetiteCount}</div>
            <span className="text-[10px] text-slate-400">Threshold: Score &gt; 8</span>
          </div>

          <div
            onClick={() => setActiveTab('findings')}
            className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Open CAPA Findings</span>
            <div className="text-xl font-black text-indigo-400 mt-1">{metrics.openFindingsCount}</div>
            <span className="text-[10px] text-slate-400">Retest Gate Enforced</span>
          </div>

          <div
            onClick={() => setActiveTab('contracts')}
            className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Renewals &le; 90 Days</span>
            <div className="text-xl font-black text-emerald-500 mt-1">{metrics.activeContractsExpiringIn90Days}</div>
            <span className="text-[10px] text-slate-400">DPA & SLA Audited</span>
          </div>

          <div
            onClick={() => setActiveTab('fourth_party')}
            className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Supply Chain Resilience</span>
            <div className="text-xl font-black text-teal-400 mt-1">{concentrationSummary.overallSupplyChainResilienceIndex}%</div>
            <span className="text-[10px] text-slate-400">Concentration Index</span>
          </div>
        </div>
      </div>

      {/* 2. Main Executive Grid: Inherent vs Residual Distribution & Concentration Blast Radius */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inherent vs Residual Posture Card */}
        <div
          className={`p-5 rounded-2xl border space-y-4 lg:col-span-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                14-Factor Vendor Risk Posture Ledger
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Avg Control Mitigating Effectiveness: <strong className="text-emerald-400">{metrics.averageControlEffectiveness}%</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`text-[11px] uppercase font-bold border-b ${
                  isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <tr>
                  <th className="p-3">Vendor / Entity</th>
                  <th className="p-3">Criticality Tier</th>
                  <th className="p-3">Inherent Risk</th>
                  <th className="p-3">Mitigation Score</th>
                  <th className="p-3">Residual Risk</th>
                  <th className="p-3">Appetite Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                {vendors.map(v => (
                  <tr
                    key={v.id}
                    onClick={() => {
                      setSelectedVendorId(v.id);
                      setActiveTab('vendor_360');
                    }}
                    className="hover:bg-slate-500/5 transition cursor-pointer"
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{v.profile.legalName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{v.profile.industryCategory} • {v.vendorCode}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          v.relationship.criticalityTier === 'TIER_1_STRATEGIC_CRITICAL'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        }`}
                      >
                        {v.relationship.criticalityTier === 'TIER_1_STRATEGIC_CRITICAL' ? 'Tier-1 Critical' : 'Tier-2 Major'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-400">
                      {v.latestRiskSnapshot.inherentRiskScore} / 25
                    </td>
                    <td className="p-3 font-mono text-emerald-400">
                      {v.latestRiskSnapshot.combinedControlEffectiveness}%
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span
                        className={
                          v.latestRiskSnapshot.residualRiskScore > 8
                            ? 'text-amber-400 font-black'
                            : 'text-emerald-400'
                        }
                      >
                        {v.latestRiskSnapshot.residualRiskScore} / 25
                      </span>
                    </td>
                    <td className="p-3">
                      {v.latestRiskSnapshot.isOutsideAppetite ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center space-x-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Outside Appetite</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center space-x-1 w-max">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Within Appetite</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-xs text-sky-400 hover:underline font-bold">
                        Vendor 360 &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hyperscaler & Fourth-Party Concentration Blast Radius */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-indigo-500" />
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Downstream Concentration
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('fourth_party')}
              className="text-[11px] text-sky-400 hover:underline font-semibold"
            >
              View Graph
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Systemic exposure where multiple critical SaaS vendors rely on common hyperscale infrastructure.
          </p>

          <div className="space-y-3">
            {concentrationSummary.hyperscaleCloudConcentration.map(c => (
              <div
                key={c.cloudProvider}
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">{c.cloudProvider} Infrastructure</span>
                  <span className="font-mono text-slate-400">{c.vendorCount} Vendors ({c.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.percentage > 50 ? 'bg-rose-500' : c.percentage > 30 ? 'bg-amber-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actionable Alerts Box */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Concentration Notice (MAS TRM Sec 12)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              6 out of {vendors.length} vendors depend downstream on AWS EMEA/US. Secondary failover plan validated in DR Runbook BCP-2026-01.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
