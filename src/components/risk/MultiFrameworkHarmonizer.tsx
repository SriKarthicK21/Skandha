import React, { useState, useMemo } from 'react';
import { RiskRecord } from '../../types';
import { useGRC } from '../../context/GRCContext';
import {
  Shield,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Cpu,
  Building2,
  Globe2,
  ArrowRight,
  BookOpen,
  FileCheck2,
  Lock,
  ArrowUpRight
} from 'lucide-react';

interface MultiFrameworkHarmonizerProps {
  risks: RiskRecord[];
  onSelectRisk: (risk: RiskRecord) => void;
}

export const MultiFrameworkHarmonizer: React.FC<MultiFrameworkHarmonizerProps> = ({
  risks,
  onSelectRisk
}) => {
  const { currentTenant } = useGRC();
  const [selectedFrameworkFilter, setSelectedFrameworkFilter] = useState<'ALL' | 'ISO27001' | 'ISO42001' | 'MASTRM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
      if (selectedDept !== 'all' && r.department !== selectedDept) return false;
      if (selectedFrameworkFilter === 'ISO27001' && (!r.frameworkMappings?.iso27001Controls || r.frameworkMappings.iso27001Controls.length === 0)) return false;
      if (selectedFrameworkFilter === 'ISO42001' && (!r.frameworkMappings?.iso42001Controls || r.frameworkMappings.iso42001Controls.length === 0)) return false;
      if (selectedFrameworkFilter === 'MASTRM') {
        const hasSecs = (r.frameworkMappings?.masTrmSections?.length || 0) > 0;
        const hasReqs = (r.frameworkMappings?.masTrmRequirementIds?.length || 0) > 0;
        if (!hasSecs && !hasReqs) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchCode = r.riskCode.toLowerCase().includes(q);
        const matchISO27 = r.frameworkMappings?.iso27001Controls?.some(c => c.toLowerCase().includes(q));
        const matchISO42 = r.frameworkMappings?.iso42001Controls?.some(c => c.toLowerCase().includes(q));
        const matchMAS = r.frameworkMappings?.masTrmSections?.some(c => c.toLowerCase().includes(q));
        const matchMASReq = r.frameworkMappings?.masTrmRequirementIds?.some(c => c.toLowerCase().includes(q));
        return matchTitle || matchCode || matchISO27 || matchISO42 || matchMAS || matchMASReq;
      }
      return true;
    });
  }, [risks, selectedFrameworkFilter, searchQuery, selectedDept]);

  // Harmonization Statistics
  const totalRisks = risks.length;
  const iso27001Count = risks.filter(r => r.frameworkMappings?.iso27001Controls && r.frameworkMappings.iso27001Controls.length > 0).length;
  const iso42001Count = risks.filter(r => r.frameworkMappings?.iso42001Controls && r.frameworkMappings.iso42001Controls.length > 0).length;
  const masTrmCount = risks.filter(r => 
    (r.frameworkMappings?.masTrmSections && r.frameworkMappings.masTrmSections.length > 0) ||
    (r.frameworkMappings?.masTrmRequirementIds && r.frameworkMappings.masTrmRequirementIds.length > 0)
  ).length;
  const tripleMappedCount = risks.filter(r => 
    r.frameworkMappings?.iso27001Controls?.length && 
    r.frameworkMappings?.iso42001Controls?.length && 
    (r.frameworkMappings?.masTrmSections?.length || r.frameworkMappings?.masTrmRequirementIds?.length)
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Harmonizer Overview Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-lg border border-indigo-800 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tri-Framework Crosswalk Harmonizer</span>
              </span>
              <span className="text-xs text-slate-400">
                Single Risk Treatment → Triple Standard Compliance
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Multi-Standard Crosswalk Harmonization Matrix
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Demonstrates how addressing individual threat vectors simultaneously satisfies controls across{' '}
              <strong className="text-sky-300">ISO/IEC 27001:2022 (ISMS)</strong>,{' '}
              <strong className="text-purple-300">ISO/IEC 42001:2023 (AIMS)</strong>, and{' '}
              <strong className="text-emerald-300">MAS Technology Risk Management Guidelines (2021)</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono text-indigo-400">{tripleMappedCount} / {totalRisks}</div>
              <div className="text-[10px] text-slate-400">Triple-Mapped Risks</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400">
                {totalRisks > 0 ? Math.round((tripleMappedCount / totalRisks) * 100) : 0}%
              </div>
              <div className="text-[10px] text-slate-400">Unified Synergy</div>
            </div>
          </div>
        </div>

        {/* Framework Crosswalk Badges */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/60 border border-sky-900/40">
            <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">ISO/IEC 27001:2022 Annex A</div>
              <div className="text-[11px] text-sky-400 font-mono font-semibold">{iso27001Count} of {totalRisks} Risks Mapped ({totalRisks > 0 ? Math.round((iso27001Count / totalRisks) * 100) : 0}%)</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/60 border border-purple-900/40">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">ISO/IEC 42001:2023 AIMS AI</div>
              <div className="text-[11px] text-purple-400 font-mono font-semibold">{iso42001Count} of {totalRisks} Risks Mapped ({totalRisks > 0 ? Math.round((iso42001Count / totalRisks) * 100) : 0}%)</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/60 border border-emerald-900/40">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">MAS TRM 2021 & Notice 644</div>
              <div className="text-[11px] text-emerald-400 font-mono font-semibold">{masTrmCount} of {totalRisks} Risks Mapped ({totalRisks > 0 ? Math.round((masTrmCount / totalRisks) * 100) : 0}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Framework Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crosswalk by title, RSK code, or control (e.g. A.5.15, TRM 5.1)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Framework Filter Buttons */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setSelectedFrameworkFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedFrameworkFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Tri-Frameworks ({risks.length})
          </button>
          <button
            onClick={() => setSelectedFrameworkFilter('ISO27001')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedFrameworkFilter === 'ISO27001'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ISO 27001 ({iso27001Count})
          </button>
          <button
            onClick={() => setSelectedFrameworkFilter('ISO42001')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedFrameworkFilter === 'ISO42001'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ISO 42001 ({iso42001Count})
          </button>
          <button
            onClick={() => setSelectedFrameworkFilter('MASTRM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedFrameworkFilter === 'MASTRM'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MAS TRM ({masTrmCount})
          </button>
        </div>
      </div>

      {/* 3. Crosswalk Table & Card Grid */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-300">No risks match the active crosswalk filter.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the search query or framework selection.</p>
          </div>
        ) : (
          filteredRisks.map((risk) => {
            const iso27 = risk.frameworkMappings?.iso27001Controls || [];
            const iso42 = risk.frameworkMappings?.iso42001Controls || [];
            const mas = risk.frameworkMappings?.masTrmSections || [];
            const masReqs = risk.frameworkMappings?.masTrmRequirementIds || [];
            const effectiveness = risk.controlEffectiveness || 90;

            return (
              <div
                key={risk.id}
                onClick={() => onSelectRisk(risk)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-start space-x-3">
                    <span className="font-mono font-bold text-xs text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800 shrink-0">
                      {risk.riskCode}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {risk.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                        <span>{risk.category}</span>
                        <span>•</span>
                        <span>{risk.department}</span>
                        <span>•</span>
                        <span className="text-slate-300">{risk.linkedItem}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-semibold">Control Effectiveness</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{effectiveness}% Effective</span>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Crosswalk Mapping Chips Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {/* ISO 27001 Mapping */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-sky-950 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>ISO 27001:2022</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{iso27.length} Controls</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {iso27.length > 0 ? (
                        iso27.map(c => (
                          <span key={c} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Not explicitly mapped</span>
                      )}
                    </div>
                  </div>

                  {/* ISO 42001 Mapping */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-950 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1">
                        <Cpu className="w-3 h-3" />
                        <span>ISO 42001:2023 AIMS</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{iso42.length} Controls</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {iso42.length > 0 ? (
                        iso42.map(c => (
                          <span key={c} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">General IT Control</span>
                      )}
                    </div>
                  </div>

                  {/* MAS TRM Mapping */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-950 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                        <Building2 className="w-3 h-3" />
                        <span>MAS TRM (Singapore)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{masReqs.length + mas.length} Linked</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {masReqs.map(c => (
                        <span key={c} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800" title={`Mapped MAS TRM Requirement: ${c}`}>
                          {c}
                        </span>
                      ))}
                      {mas.map(c => (
                        <span key={c} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800" title={`MAS Section Tag: ${c}`}>
                          {c}
                        </span>
                      ))}
                      {masReqs.length === 0 && mas.length === 0 && (
                        <span className="text-[10px] text-slate-500 italic">Standard Baseline</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mitigation summary */}
                <div className="mt-3 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="truncate pr-2">
                    <strong className="text-slate-300">Mitigation Control:</strong> {risk.mitigationControl}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-400 shrink-0 flex items-center space-x-0.5 group-hover:underline">
                    <span>Inspect Evidence</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
