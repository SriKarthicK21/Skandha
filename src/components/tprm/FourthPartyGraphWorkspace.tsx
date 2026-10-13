/**
 * SKANDA ENTERPRISE FOURTH-PARTY & CONCENTRATION RISK WORKSPACE
 * Path: src/components/tprm/FourthPartyGraphWorkspace.tsx
 */

import React, { useState } from 'react';
import {
  Network,
  Server,
  AlertTriangle,
  ShieldAlert,
  Layers,
  ArrowRight,
  Database,
  Building,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { FourthPartyNode } from '../../types/tprmTypes';

export const FourthPartyGraphWorkspace: React.FC = () => {
  const { theme } = useGRC();
  const { vendors, fourthPartyNodes, concentrationSummary, setSelectedVendorId, setActiveTab } = useTprmStore();

  const [selectedNode, setSelectedNode] = useState<FourthPartyNode | null>(fourthPartyNodes[0] || null);

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-indigo-500/15 text-indigo-400 border-indigo-500/30">
                Multi-Tier Supply Chain Governance
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Overall Resilience Index: <strong className="text-teal-400">{concentrationSummary.overallSupplyChainResilienceIndex}%</strong>
              </span>
            </div>
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Fourth-Party Dependency Graph & Systemic Concentration Risk
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Track hidden multi-tier dependencies (Your Organization &rarr; Direct Vendors &rarr; Subprocessors &rarr; Cloud Providers &rarr; Critical Downstream Dependencies).
            </p>
          </div>
        </div>

        {/* 4 Concentration Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Single Points of Failure</span>
            <div className="text-lg font-black text-rose-500 mt-0.5">{concentrationSummary.singlePointsOfFailureCount} Infrastructure Nodes</div>
            <span className="text-[10px] text-slate-400">AWS & Visa/MC Rails</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">AWS Cloud Concentration</span>
            <div className="text-lg font-black text-amber-500 mt-0.5">
              {concentrationSummary.hyperscaleCloudConcentration.find(c => c.cloudProvider === 'AWS')?.percentage || 67}%
            </div>
            <span className="text-[10px] text-slate-400">6 of 9 vendors hosted on AWS</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Unmapped Dependencies</span>
            <div className="text-lg font-black text-indigo-400 mt-0.5">{concentrationSummary.unmappedUnknownDependenciesCount} Unknown</div>
            <span className="text-[10px] text-slate-400">Explicitly flagged as UNKNOWN</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Failover Plan Verified</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">100% Core Services</div>
            <span className="text-[10px] text-slate-400">Multi-AZ & Cross-Region DR</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Supply Chain Graph & Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph / Node Directory */}
        <div
          className={`p-5 rounded-2xl border space-y-4 lg:col-span-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-sky-400" />
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Downstream 4th-Party Nodes & Concentration Heatmap
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Click node for blast radius inspection</span>
          </div>

          <div className="space-y-3">
            {fourthPartyNodes.map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
                  selectedNode?.id === node.id
                    ? 'border-sky-500 bg-sky-500/10 shadow-md'
                    : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{node.name}</h4>
                      {node.singlePointOfFailureFlag && (
                        <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          SINGLE POINT OF FAILURE
                        </span>
                      )}
                      {!node.isKnownDownstreamDependency && (
                        <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                          UNKNOWN DEPENDENCY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{node.serviceCategory} • {node.jurisdiction}</p>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded font-bold border shrink-0 ${
                      node.concentrationRiskRating === 'HIGH_SYSTEMIC'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    {node.concentrationRiskRating.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">
                    Directly Connected Enterprise Vendors: <strong className="text-sky-400">{node.directVendorsCount}</strong>
                  </span>
                  <span className="text-slate-400 font-mono">
                    Exit Substitutability: <strong className="text-amber-400">{node.exitSubstitutabilityDifficulty}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node Inspector & Blast Radius Details */}
        {selectedNode && (
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2 border-b pb-3 border-slate-700/60">
              <Server className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Blast Radius Inspector
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">{selectedNode.name}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Service Function:</span>
                <span className="text-slate-300">{selectedNode.serviceCategory}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Jurisdiction / Colocation:</span>
                <span className="text-slate-300 font-mono">{selectedNode.jurisdiction}</span>
              </div>

              <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-sky-400 block">Upstream Impacted Direct Vendors:</span>
                <div className="space-y-1">
                  {vendors
                    .filter(v => selectedNode.dependentVendorIds.includes(v.id))
                    .map(v => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVendorId(v.id);
                          setActiveTab('vendor_360');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-white flex items-center justify-between cursor-pointer"
                      >
                        <span>{v.profile.legalName}</span>
                        <span className="text-[10px] text-sky-400 font-mono">{v.relationship.criticalityTier === 'TIER_1_STRATEGIC_CRITICAL' ? 'Tier-1' : 'Tier-2'} &rarr;</span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Failover Plan & Multi-Region DR:</span>
                <span className={`font-bold ${selectedNode.failoverPlanDocumented ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedNode.failoverPlanDocumented ? '✓ Fully Documented & Tested' : '⚠️ No Failover Plan (Action Required)'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
