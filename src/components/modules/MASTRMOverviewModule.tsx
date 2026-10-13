import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  FileText,
  Layers,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  BookOpen,
  Scale,
  Hash,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { FrameworkDomain, RegulatoryRequirement } from '../../types/regulatoryTypes';
import { PageContainer } from '../layout/PageContainer';

export const MASTRMOverviewModule: React.FC = () => {
  const {
    masDomains,
    masRequirements,
    frameworkDefinitions,
    regulatorySources,
    masAssessments,
    currentTenant,
    setActiveModule,
    setSelectedFramework
  } = useGRC();

  const [selectedDomain, setSelectedDomain] = useState<FrameworkDomain | null>(masDomains[0] || null);
  const [selectedRequirement, setSelectedRequirement] = useState<RegulatoryRequirement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  const masFramework = frameworkDefinitions.find(f => f.id === 'FW-MAS-TRM');
  const masSource = regulatorySources.find(s => s.id === 'SRC-MAS-TRM-2021');

  // Filter requirements
  const domainRequirements = masRequirements.filter(r => {
    if (selectedDomain && r.domainId !== selectedDomain.id) return false;
    if (filterCriticalOnly && !r.criticalSystemsMandate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.requirementCode.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.statement.toLowerCase().includes(q) ||
        r.domainName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageContainer id="mas-trm-overview-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border border-rose-900/40 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Monetary Authority of Singapore (MAS)
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Mandatory Guidelines (Jan 2021 / 2024 Update)
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Legally Enforced
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              MAS Technology Risk Management (TRM) Guidelines
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Authoritative statutory risk management framework issued by the Monetary Authority of Singapore (MAS) setting out mandatory risk governance, cyber resilience, secure SDLC, cryptographic controls, critical system availability (RTO &le; 4h, RPO &le; 1h), and 1-hour regulatory incident notification.
            </p>
          </div>

          {/* Quick Actions & Metrics */}
          <div className="flex flex-wrap lg:flex-col gap-3 min-w-[220px]">
            <button
              onClick={() => setActiveModule('mas_assessment_workbench')}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Open Assessment Workbench
            </button>
            <button
              onClick={() => setActiveModule('cross_framework_crosswalk')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              View ISO/NIST Crosswalk
            </button>
          </div>
        </div>

        {/* Framework Meta Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block">Total Domains</span>
            <span className="text-base font-bold text-white">15 Domains</span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Requirements</span>
            <span className="text-base font-bold text-white">86 Requirements</span>
          </div>
          <div>
            <span className="text-slate-400 block">Mandatory SLA</span>
            <span className="text-base font-bold text-rose-400">1-Hr Incident SLA</span>
          </div>
          <div>
            <span className="text-slate-400 block">System Availability</span>
            <span className="text-base font-bold text-amber-400">RTO &le; 4h | RPO &le; 1h</span>
          </div>
          <div>
            <span className="text-slate-400 block">Jurisdiction</span>
            <span className="text-base font-bold text-slate-200">Singapore (MAS)</span>
          </div>
          <div>
            <span className="text-slate-400 block">Audited Tenant</span>
            <span className="text-base font-bold text-emerald-400">{organizationService.getOrganizationName(currentTenant, 'Licensed Financial Institution')}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: 15 Domains Sidebar + Requirements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 15 Domains List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-400" />
                15 TRM Domains
              </h2>
              <span className="text-xs text-slate-400">MAS 2021 Standard</span>
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {masDomains.map((dom) => {
                const isSelected = selectedDomain?.id === dom.id;
                const domainReqs = masRequirements.filter(r => r.domainId === dom.id);
                
                return (
                  <button
                    key={dom.id}
                    onClick={() => {
                      setSelectedDomain(dom);
                      setSelectedRequirement(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/50 text-white shadow-md shadow-rose-950/30'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {dom.domainNumber}
                        </span>
                        <span className="text-xs font-semibold line-clamp-1">{dom.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 pl-7">
                        {dom.objectivesSummary}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 pl-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        dom.criticality === 'CRITICAL' 
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/50' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {dom.criticality}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {domainReqs.length} reqs
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legal Document Provenance Card */}
          {masSource && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Scale className="w-4 h-4 text-rose-400" />
                <span>Statutory Authority Provenance</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {masSource.summary}
              </p>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document No:</span>
                  <span className="text-slate-300 font-mono">{masSource.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SHA-256 Checksum:</span>
                  <span className="text-slate-400 font-mono text-[10px] truncate max-w-[140px]">
                    {masSource.checksumSHA256}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Portal:</span>
                  <a
                    href={masSource.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                  >
                    MAS Singapore <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Selected Domain Details & Requirements Explorer */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDomain && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                      Domain {selectedDomain.domainNumber}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      selectedDomain.criticality === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {selectedDomain.criticality} CRITICALITY ({selectedDomain.weightPercentage}% weight)
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {selectedDomain.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedDomain.description}
                  </p>
                </div>

                <button
                  onClick={() => setActiveModule('mas_assessment_workbench')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start"
                >
                  Evaluate Controls <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search requirement code or title..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={filterCriticalOnly}
                      onChange={(e) => setFilterCriticalOnly(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500"
                    />
                    <span>Critical Systems Only</span>
                  </label>
                  <span className="text-slate-500 text-[11px]">
                    Showing {domainRequirements.length} requirements
                  </span>
                </div>
              </div>

              {/* Requirements Cards */}
              <div className="space-y-3">
                {domainRequirements.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800 text-slate-400 text-xs">
                    No requirements match the active filter.
                  </div>
                ) : (
                  domainRequirements.map((req) => {
                    const isExpanded = selectedRequirement?.id === req.id;
                    const assessment = masAssessments.find(a => a.requirementCode === req.requirementCode);

                    return (
                      <div
                        key={req.id}
                        className={`rounded-lg border transition-all ${
                          isExpanded
                            ? 'bg-slate-950 border-rose-500/50 shadow-lg'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => setSelectedRequirement(isExpanded ? null : req)}
                          className="p-4 flex items-start justify-between gap-4 cursor-pointer"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-slate-800 text-rose-400 font-mono text-xs font-bold rounded border border-slate-700">
                                {req.requirementCode}
                              </span>
                              {req.criticalSystemsMandate && (
                                <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 text-[10px] font-semibold rounded border border-rose-800/60 flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-rose-400" />
                                  Critical Systems Mandate
                                </span>
                              )}
                              {req.slaRequirement && (
                                <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 text-[10px] font-semibold rounded border border-amber-800/60 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  {req.slaRequirement}
                                </span>
                              )}
                              {assessment && (
                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                                  assessment.complianceStatus === 'COMPLIANT'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                                    : assessment.complianceStatus === 'PARTIALLY_COMPLIANT'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                                    : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                                }`}>
                                  {assessment.complianceStatus}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-semibold text-white">
                              {req.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                              {req.statement}
                            </p>
                          </div>

                          <button className="text-slate-400 hover:text-white p-1">
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </div>

                        {/* Expanded Requirement Deep-Dive */}
                        {isExpanded && (
                          <div className="p-4 pt-0 space-y-4 border-t border-slate-800/80 mt-2 text-xs">
                            {/* Intent and Guidance */}
                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                                MAS Supervisory Intent & Guidance
                              </span>
                              <p className="text-slate-300 text-xs leading-relaxed">
                                {req.intentAndGuidance}
                              </p>
                              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                                Source Reference: {req.regulatorySourceRef}
                              </div>
                            </div>

                            {/* Control Objectives & Test Procedures */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  Mandatory Control Objectives
                                </span>
                                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                                  {req.controlObjectives.map((obj, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                      <span>{obj}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                                  Auditor Test Procedures
                                </span>
                                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                                  {req.testProcedures.map((proc, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                                      <span>{proc}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Evidence & Crosswalk mapping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                  Required Evidence Artefacts
                                </span>
                                <div className="space-y-1">
                                  {req.evidenceRequirements.map((ev, i) => (
                                    <div key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-2">
                                      <FileText className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span className="truncate">{ev}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                  Multi-Framework Crosswalk Equivalents
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {req.crossFrameworkMappings.iso27001?.map(iso => (
                                    <span key={iso} className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300 text-[10px] font-mono">
                                      ISO 27001: {iso}
                                    </span>
                                  ))}
                                  {req.crossFrameworkMappings.nistCsf?.map(nist => (
                                    <span key={nist} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px] font-mono">
                                      NIST: {nist}
                                    </span>
                                  ))}
                                  {req.crossFrameworkMappings.soc2Criteria?.map(soc => (
                                    <span key={soc} className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-[10px] font-mono">
                                      SOC 2: {soc}
                                    </span>
                                  ))}
                                  {req.crossFrameworkMappings.pciDss?.map(pci => (
                                    <span key={pci} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono">
                                      PCI DSS: {pci}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Evaluation CTA Button */}
                            <div className="pt-2 flex justify-end gap-2">
                              <button
                                onClick={() => setActiveModule('mas_assessment_workbench')}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Record Test Evaluation in Workbench
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
