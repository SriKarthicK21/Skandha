import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  FileText,
  Sparkles,
  Award,
  ExternalLink,
  Info
} from 'lucide-react';
import { CROSS_FRAMEWORK_REUSE_STATS } from '../../data/masTrmModulesData';
import { PageContainer } from '../layout/PageContainer';

export const CrossFrameworkCrosswalkModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('ALL');

  const stats = CROSS_FRAMEWORK_REUSE_STATS;

  const filteredMappings = stats.sampleCrosswalkMappings.filter(m =>
    m.capability.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.masTrm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.iso27001.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer id="cross-framework-crosswalk-module">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cross-Framework Harmonization Engine
                </span>
                <span className="text-xs text-slate-400">Implement Once. Comply Everywhere.</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Multi-Standard Crosswalk & Evidence Reuse Matrix
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-3xl">
                Unify ISO/IEC 27001:2022, MAS Technology Risk Management Guidelines (2021), SOC 2, NIST CSF 2.0,
                and PCI DSS. Skanda automatically applies a single audit evidence artifact across all bound standards.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
                <span className="text-[11px] text-slate-400 block">Overall Evidence Reuse</span>
                <strong className="text-2xl font-extrabold text-emerald-400">{stats.overallReusePercentage}%</strong>
              </div>
            </div>
          </div>

          {/* Supported Frameworks Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
            {stats.supportedFrameworks.map(fw => (
              <div key={fw.code} className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60 text-center">
                <strong className="text-xs text-white block truncate">{fw.name}</strong>
                <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                  {fw.reusePercentage}% Reused
                </span>
                <span className="text-[10px] text-slate-400">{fw.controlsCount} Controls</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search capability or control mapping..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>135 out of 164 active controls are satisfied by shared evidence.</span>
          </div>
        </div>

        {/* Crosswalk Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">Unified Control Harmonization Matrix</h3>
            <p className="text-xs text-slate-400">
              Each row demonstrates how a single core technical capability fulfills corresponding requirements across multiple standards.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-[11px] font-semibold text-slate-300 border-b border-slate-700 uppercase tracking-wider">
                  <th className="p-3.5">Security / Risk Capability</th>
                  <th className="p-3.5 text-rose-300">MAS TRM 2021</th>
                  <th className="p-3.5 text-sky-300">ISO 27001:2022</th>
                  <th className="p-3.5 text-amber-300">SOC 2 Type II</th>
                  <th className="p-3.5 text-indigo-300">NIST CSF 2.0</th>
                  <th className="p-3.5 text-emerald-300">Evidence Proof Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredMappings.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-white max-w-xs">
                      {row.capability}
                    </td>
                    <td className="p-3.5 text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono text-[11px]">
                        {row.masTrm}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono text-[11px]">
                        {row.iso27001}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-200 font-mono text-[11px]">
                      {row.soc2}
                    </td>
                    <td className="p-3.5 text-slate-200 font-mono text-[11px]">
                      {row.nistCsf}
                    </td>
                    <td className="p-3.5 text-slate-200">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        {row.reuseStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
