import React, { useState } from 'react';
import {
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  ShieldCheck,
  Award,
  Flame,
  CreditCard,
  Building2,
  Search,
  Download,
  Share2,
  Sparkles,
  Zap,
  Info,
  SlidersHorizontal,
  BarChart3,
  PieChart,
  Table,
  Eye,
  Check,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { CrossFrameworkMappingRule } from '../../types/regulatoryTypes';
import { TriHarmonizationSideBySideView } from '../crosswalk/TriHarmonizationSideBySideView';
import { PageContainer } from '../layout/PageContainer';

export const CrossFrameworkCrosswalkModule: React.FC = () => {
  const { crossFrameworkMappings, frameworkDefinitions, masRequirements, controls, setActiveModule } = useGRC();

  // Module top-level tabs
  const [activeModuleTab, setActiveModuleTab] = useState<'sideBySide' | 'rules' | 'analytics'>('sideBySide');

  // Rule-by-rule view states
  const [sourceFramework, setSourceFramework] = useState<string>('ALL');
  const [targetFilter, setTargetFilter] = useState<string>('ISO/IEC 27001:2022');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rules mappings
  const filteredMappings = crossFrameworkMappings.filter(m => {
    if (sourceFramework !== 'ALL' && m.sourceFramework !== sourceFramework) return false;
    if (targetFilter !== 'ALL' && m.targetFramework !== targetFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.sourceFramework.toLowerCase().includes(q) ||
        m.sourceRequirementCode.toLowerCase().includes(q) ||
        m.sourceRequirementTitle.toLowerCase().includes(q) ||
        m.targetControlOrClauseCode.toLowerCase().includes(q) ||
        m.targetTitle.toLowerCase().includes(q) ||
        m.justificationNotes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportRuleCSV = () => {
    const headers = ['Source Framework', 'Source Code', 'Source Title', 'Target Framework', 'Target Code', 'Target Title', 'Mapping Type', 'Confidence', 'Evidence Reusability', 'Justification'];
    const rows = filteredMappings.map(m => [
      `"${m.sourceFramework}"`,
      `"${m.sourceRequirementCode}"`,
      `"${m.sourceRequirementTitle}"`,
      `"${m.targetFramework}"`,
      `"${m.targetControlOrClauseCode}"`,
      `"${m.targetTitle}"`,
      `"${m.mappingType}"`,
      `${m.confidenceScore}%`,
      `"${m.evidenceReusability}"`,
      `"${m.justificationNotes.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Apex_GRC_MultiStandard_Crosswalk_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer id="cross-framework-crosswalk-module">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveModuleTab('sideBySide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModuleTab === 'sideBySide'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-sky-300" />
            <span>Side-by-Side Tri-Harmonization Dashboard</span>
            <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-200 text-[10px] font-mono border border-sky-800">
              ISO 27001 ↔ MAS TRM
            </span>
          </button>

          <button
            onClick={() => setActiveModuleTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModuleTab === 'rules'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Multi-Standard Rule Crosswalk</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 text-[10px] font-mono">
              {crossFrameworkMappings.length} Rules
            </span>
          </button>

          <button
            onClick={() => setActiveModuleTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeModuleTab === 'analytics'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Harmonization Analytics & Synergies</span>
          </button>
        </div>

        <button
          onClick={() => setActiveModule('iso_mas_improvements')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Notice 644/655 & 11 Controls Hub</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeModuleTab === 'sideBySide' && (
        <TriHarmonizationSideBySideView />
      )}

      {activeModuleTab === 'rules' && (
        <div className="space-y-6">
          {/* Rules Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Cross-Standard Semantic Rule Library
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    82.4% Direct Evidence Reuse
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Multi-Standard Rule-by-Rule Crosswalk Matrix
                </h1>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Granular semantic crosswalk engine connecting MAS TRM Guidelines with ISO/IEC 27001:2022, NIST CSF 2.0, SOC 2 Type II, and PCI DSS v4.0.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportRuleCSV}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  Export Rules CSV
                </button>
              </div>
            </div>

            {/* Efficiency Value Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Audit Overhead Reduction</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-emerald-400">68%</span>
                  <span className="text-[11px] text-slate-400">fewer duplicated audits</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Evidence Reusability Ratio</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-sky-400">82.4%</span>
                  <span className="text-[11px] text-slate-400">cross-standard coverage</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Estimated Hours Saved / Cycle</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-amber-400">340+ Hours</span>
                  <span className="text-[11px] text-slate-400">per tenant audit window</span>
                </div>
              </div>
            </div>
          </div>

          {/* Source & Target Framework Tabs & Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            {/* Source Framework Selector */}
            <div className="flex flex-wrap items-center gap-2 text-xs border-b border-slate-800/80 pb-3">
              <span className="text-slate-400 font-semibold uppercase text-[11px] mr-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-400" />
                Source Standard:
              </span>
              {[
                { id: 'ALL', label: 'All Sources' },
                { id: 'MAS Notice 655 (Cyber Hygiene)', label: 'MAS Notice 655 (Cyber Hygiene)', badge: '6 Mandates', highlight: true },
                { id: 'MAS TRM 2021', label: 'MAS TRM 2021' },
                { id: 'ISO/IEC 42001:2023', label: 'ISO 42001:2023 (AI)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSourceFramework(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    sourceFramework === tab.id
                      ? tab.highlight
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                        : 'bg-rose-600/90 text-white shadow-md'
                      : tab.highlight
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/40 border border-rose-800/60'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      sourceFramework === tab.id ? 'bg-white/20 text-white' : 'bg-rose-900/60 text-rose-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Target Standard and Search Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-slate-400 font-semibold uppercase text-[11px] mr-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Target Standard:
                </span>
                {[
                  { id: 'ALL', label: 'All Targets' },
                  { id: 'ISO/IEC 27001:2022', label: 'ISO 27001:2022' },
                  { id: 'NIST CSF 2.0', label: 'NIST CSF 2.0' },
                  { id: 'SOC 2 Type II', label: 'SOC 2 Type II' },
                  { id: 'PCI DSS v4.0', label: 'PCI DSS v4.0' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTargetFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      targetFilter === tab.id
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crosswalk rules..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Crosswalk Mapping Matrix Cards */}
          <div className="space-y-3">
            {filteredMappings.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No crosswalk rules matched the selected filter.
              </div>
            ) : (
              filteredMappings.map((map) => {
                return (
                  <div
                    key={map.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-all"
                  >
                    {/* Header Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-950 text-slate-300 font-mono text-[10px] rounded border border-slate-800">
                          Rule ID: {map.id}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          map.mappingType === 'EXACT_EQUIVALENT'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                            : map.mappingType === 'SUPERSET'
                            ? 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                        }`}>
                          {map.mappingType}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-950 text-emerald-400 font-mono text-[10px] font-semibold rounded border border-slate-800">
                          {map.confidenceScore}% Confidence
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Verified by: <strong className="text-slate-200">{map.verifiedBy}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Mapping Pair Visual Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Source Standard (MAS TRM) */}
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            Source: {map.sourceFramework}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold text-[10px]">
                            {map.sourceRequirementCode}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">
                          {map.sourceRequirementTitle}
                        </h3>
                      </div>

                      {/* Target Standard */}
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-sky-400 font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Target: {map.targetFramework}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono font-bold text-[10px]">
                            {map.targetControlOrClauseCode}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">
                          {map.targetTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Justification and Evidence Reusability Strip */}
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-sky-400" />
                          Semantic Harmonization Rationale:
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono">
                          Evidence Reusability: <strong className="text-emerald-400">{map.evidenceReusability}</strong>
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {map.justificationNotes}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeModuleTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Internal Controls
              </span>
              <div className="text-2xl font-bold text-white">
                {controls?.length || 10} Controls
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                100% Mapped to ISO 27001 & MAS
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Direct Evidence Reuse
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                82.4%
              </div>
              <div className="text-xs text-slate-400">
                Zero duplicated artifact collection
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                MAS Specific SLA Deltas
              </span>
              <div className="text-2xl font-bold text-rose-400">
                2 Controls
              </div>
              <div className="text-xs text-slate-400">
                1-Hour Notice & RTO &lt;= 4h
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Audit Cycle Cost Reduction
              </span>
              <div className="text-2xl font-bold text-sky-400">
                $48,500
              </div>
              <div className="text-xs text-slate-400">
                Estimated external auditor savings
              </div>
            </div>
          </div>

          {/* Domain-by-Domain Harmonization Coverage Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Domain Harmonization & Dual-Compliance Coverage
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown of internal control alignment across ISO/IEC 27001:2022 and MAS TRM 2021 domains
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 font-mono text-xs font-bold border border-emerald-800">
                Overall Alignment: 94.6%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { domain: 'Executive Governance & Policy (MAS 3.0 ↔ ISO Clause 5)', score: 98, status: 'Full Synergy', reuse: '100%' },
                { domain: 'Access Control & Privileged Access (MAS 8.0 ↔ ISO A.5.15 / A.8.2)', score: 96, status: 'Full Synergy', reuse: '100%' },
                { domain: 'Cryptographic Controls & Key Lifecycle (MAS 9.0 ↔ ISO A.8.24)', score: 95, status: 'Full Synergy', reuse: '100%' },
                { domain: 'Incident Response & 1-Hr SLA (MAS 14.0 ↔ ISO A.5.24)', score: 92, status: 'Extended SLA Delta', reuse: '85%' },
                { domain: 'Disaster Recovery & Availability (MAS 15.0 ↔ ISO A.5.29)', score: 94, status: 'Extended SLA Delta', reuse: '90%' },
                { domain: 'Secure SDLC & Automated Quality Gates (MAS 6.0 ↔ ISO A.8.25)', score: 95, status: 'Full Synergy', reuse: '100%' },
                { domain: 'Third-Party & Cloud Outsourcing (MAS 7.0 ↔ ISO A.5.19)', score: 94, status: 'Full Synergy', reuse: '100%' },
                { domain: 'Vulnerability Management & VA/PT (MAS 17.0 ↔ ISO A.8.8)', score: 97, status: 'Full Synergy', reuse: '100%' },
                { domain: 'Network Security & Microsegmentation (MAS 11.0 ↔ ISO A.8.20)', score: 96, status: 'Full Synergy', reuse: '100%' },
                { domain: 'Cybersecurity Awareness Training (MAS 5.0 ↔ ISO A.6.3)', score: 95, status: 'Full Synergy', reuse: '100%' }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{item.domain}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Evidence Reuse: <strong className="text-emerald-400">{item.reuse}</strong></span>
                      <span className="font-mono font-bold text-sky-400">{item.score}% Match</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
