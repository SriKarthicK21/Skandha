/**
 * SKANDA Enterprise Framework Factory — Framework Comparison Engine
 * Path: src/components/framework-factory/FrameworkCompareView.tsx
 */

import React, { useState } from 'react';
import {
  Scale,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { FrameworkRecord, FrameworkComparisonMatrix } from '../../types/frameworkFactoryTypes';

interface FrameworkCompareViewProps {
  frameworks: FrameworkRecord[];
  comparisonMatrices: FrameworkComparisonMatrix[];
  onSelectFramework: (frameworkCode: string) => void;
}

export const FrameworkCompareView: React.FC<FrameworkCompareViewProps> = ({
  frameworks,
  comparisonMatrices,
  onSelectFramework
}) => {
  const [selectedComparisonId, setSelectedComparisonId] = useState<string>(
    comparisonMatrices[0]?.comparisonId || 'COMP-ISO27001-VS-SOC2'
  );

  const activeComparison = comparisonMatrices.find(c => c.comparisonId === selectedComparisonId) || comparisonMatrices[0];

  const fwA = frameworks.find(f => f.frameworkCode === activeComparison?.frameworkACode);
  const fwB = frameworks.find(f => f.frameworkCode === activeComparison?.frameworkBCode);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Framework Comparative Analysis Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Side-by-side structural, legal, and operational comparison. Decouple statutory legal mandates from voluntary standards and attestation criteria.
          </p>
        </div>

        {/* Comparison Pair Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Benchmark Pair:</span>
          <select
            value={selectedComparisonId}
            onChange={e => setSelectedComparisonId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
          >
            {comparisonMatrices.map(comp => (
              <option key={comp.comparisonId} value={comp.comparisonId}>
                {comp.frameworkAName} vs {comp.frameworkBName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards: Side-by-Side Dual Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework A Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-500/30 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              FRAMEWORK A: {activeComparison?.frameworkACode}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {fwA?.jurisdiction || 'Global'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeComparison?.frameworkAName}
          </h3>

          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Total Reqs</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{activeComparison?.requirementCountA}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Type</div>
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{fwA?.frameworkType.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Binding</div>
              <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{fwA?.bindingNature.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>

        {/* Framework B Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-cyan-500/30 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
              FRAMEWORK B: {activeComparison?.frameworkBCode}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {fwB?.jurisdiction || 'United States'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeComparison?.frameworkBName}
          </h3>

          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Total Reqs</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{activeComparison?.requirementCountB}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Type</div>
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{fwB?.frameworkType.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Binding</div>
              <div className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">{fwB?.bindingNature.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Synergies & Overlap Matrix KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Control Overlap</div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {activeComparison?.controlOverlapPercent}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {activeComparison?.overlappingControlsCount} Shared Technical Controls
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Evidence Reusability</div>
          <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
            {activeComparison?.evidenceOverlapPercent}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Zero Duplicate Telemetry Ingestion
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Audit Savings</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ~120 Hours
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Harmonized Pre-Audit Clean Room
          </p>
        </div>
      </div>

      {/* Deep Dive Structural Analysis Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Structural & Governance Dimension Comparison
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
            <div className="font-bold text-slate-700 dark:text-slate-300">Purpose & Governance Goal</div>
            <div className="md:col-span-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeComparison?.purposeComparison}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
            <div className="font-bold text-slate-700 dark:text-slate-300">Legal Nature & Enforceability</div>
            <div className="md:col-span-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeComparison?.natureComparison}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
            <div className="font-bold text-slate-700 dark:text-slate-300">Certification vs Attestation Mechanism</div>
            <div className="md:col-span-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeComparison?.certificationVsAttestationComparison}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
            <div className="font-bold text-slate-700 dark:text-slate-300">Key Differences & Divergence Points</div>
            <div className="md:col-span-2 space-y-1.5 text-slate-600 dark:text-slate-300">
              {activeComparison?.keyDifferences.map((diff, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{diff}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
            <div className="font-bold text-slate-700 dark:text-slate-300">Shared Domain Strengths</div>
            <div className="md:col-span-2 space-y-1.5 text-slate-600 dark:text-slate-300">
              {activeComparison?.sharedDomainStrengths.map((domain, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{domain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
