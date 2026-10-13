/**
 * SKANDA Enterprise Framework Factory — Framework Command Center
 * Path: src/components/framework-factory/FrameworkCommandCenterView.tsx
 */

import React from 'react';
import {
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Cpu,
  Database,
  Search,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  Award,
  BookOpen,
  FileCheck,
  Scale
} from 'lucide-react';
import { FrameworkRecord, FrameworkChangeRecord, FrameworkReuseMetrics } from '../../types/frameworkFactoryTypes';

interface FrameworkCommandCenterViewProps {
  frameworks: FrameworkRecord[];
  changes: FrameworkChangeRecord[];
  reuseMetrics: FrameworkReuseMetrics;
  onNavigateTab: (tab: string, param?: string) => void;
  onSelectFramework: (frameworkCode: string) => void;
}

export const FrameworkCommandCenterView: React.FC<FrameworkCommandCenterViewProps> = ({
  frameworks,
  changes,
  reuseMetrics,
  onNavigateTab,
  onSelectFramework
}) => {
  const activeFrameworks = frameworks.filter(f => f.status === 'ACTIVE');
  const certifiedFrameworks = frameworks.filter(f => f.maturityLevel === 'LEVEL_6_PRODUCTION_VERIFIED');
  const continuouslyAssured = frameworks.filter(f => f.maturityLevel === 'LEVEL_5_CONTINUOUSLY_ASSURED' || f.maturityLevel === 'LEVEL_6_PRODUCTION_VERIFIED');
  const totalRequirements = frameworks.reduce((acc, f) => acc + f.totalRequirementsCount, 0);
  const totalControls = frameworks.reduce((acc, f) => acc + f.mappedControlsCount, 0);
  const totalAutomated = frameworks.reduce((acc, f) => acc + f.automatedChecksCount, 0);

  const avgEvidenceCoverage = Math.round(
    frameworks.reduce((acc, f) => acc + f.evidenceCoveragePercent, 0) / (frameworks.length || 1)
  );
  const avgAutomationCoverage = Math.round(
    frameworks.reduce((acc, f) => acc + f.automationCoveragePercent, 0) / (frameworks.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Enterprise Framework Operating System */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              SKANDA ENTERPRISE FRAMEWORK FACTORY • CANONICAL GRAPH OS
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Continuous Framework Ingestion, Harmonization & Assurance
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unified compliance graph linking <span className="text-cyan-300 font-semibold">{frameworks.length} Frameworks</span> across International Standards, Financial Regulations, AI Governance, and Cloud Security into a single <span className="text-indigo-300 font-semibold">One Control — Many Obligations</span> continuous assurance operating system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('copilot')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              Launch AI Copilot
            </button>
            <button
              onClick={() => onNavigateTab('marketplace')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-slate-300" />
              Explore Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* High-Density KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalogued</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{frameworks.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {activeFrameworks.length} Active in Stack
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-400 dark:hover:border-cyan-500 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Requirements</span>
            <FileCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalRequirements}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            100% Zero-Fabricated
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Control Reuse</span>
            <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{reuseMetrics.controlReusePercent}%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Implement Once • Satisfy Many
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-400 dark:hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Evidence Cov.</span>
            <Database className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{avgEvidenceCoverage}%</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
            {reuseMetrics.evidenceReusePercent}% Cross-Reusability
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-400 dark:hover:border-sky-500 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Telemetry Scans</span>
            <Cpu className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalAutomated}</div>
          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1">
            {avgAutomationCoverage}% Auto-Assurance
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Maturity L5/L6</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{continuouslyAssured.length}</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            Continuous Assurance
          </div>
        </div>
      </div>

      {/* Main Content Grid: Active Frameworks Portfolio & Regulatory News Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Frameworks Stack */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Framework Portfolio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Harmonized enterprise security and regulatory baselines</p>
            </div>
            <button
              onClick={() => onNavigateTab('marketplace')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              View Full Catalog ({frameworks.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {frameworks.slice(0, 8).map(fw => {
              const isStatute = fw.frameworkType === 'REGULATION' || fw.bindingNature === 'LEGALLY_BINDING_STATUTE';
              const isStandard = fw.frameworkType === 'CERTIFICATION_STANDARD' || fw.frameworkType === 'INTERNATIONAL_STANDARD';
              const isAttestation = fw.frameworkType === 'ATTESTATION_FRAMEWORK';

              return (
                <div
                  key={fw.frameworkId}
                  onClick={() => onSelectFramework(fw.frameworkCode)}
                  className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-200/50 dark:border-indigo-800/50">
                        {fw.frameworkCode.slice(0, 3)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {fw.shortName}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {fw.publisher}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                      isStatute
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/40'
                        : isStandard
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300/40'
                        : isAttestation
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                        : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300/40'
                    }`}>
                      {fw.frameworkType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 my-2 border-y border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-600 dark:text-slate-300 block">Reqs</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{fw.totalRequirementsCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-300 block">Controls</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{fw.mappedControlsCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-300 block">Assurance</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fw.assuranceCoveragePercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {fw.maturityLevel.replace('LEVEL_', 'L').replace('_', ' ')}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Inspect 360° <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Change Intelligence Ticker & Quick Actions */}
        <div className="space-y-6">
          {/* Change Intelligence Live Stream */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Intelligence</h3>
              </div>
              <button
                onClick={() => onNavigateTab('changes')}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Impact Map
              </button>
            </div>

            <div className="space-y-3">
              {changes.map(chg => (
                <div key={chg.changeId} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {chg.natureOfChange.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">{chg.effectiveDate}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                    {chg.headline}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>{chg.impactMap.affectedRequirementIds.length} Reqs Affected</span>
                    <span>•</span>
                    <span>{chg.impactMap.affectedControlIds.length} Controls Impacted</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('crosswalk')}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800/80 border border-indigo-200/60 dark:border-slate-700 text-left flex items-center justify-between hover:border-indigo-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Cross-Framework Graph</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Map controls across ISO, SOC 2, NIST, PCI & MAS</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => onNavigateTab('compare')}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/80 border border-purple-200/60 dark:border-slate-700 text-left flex items-center justify-between hover:border-purple-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Framework Comparison Matrix</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Side-by-side legal vs standard overlap analysis</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => onNavigateTab('migration')}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-200/60 dark:border-slate-700 text-left flex items-center justify-between hover:border-emerald-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Version Migration & &ldquo;What Changed?&rdquo;</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">ISO 2013→2022, NIST 1.1→2.0, PCI 3.2.1→4.0.1</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
