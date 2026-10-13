/**
 * SKANDA Enterprise Framework Factory — 15-Tab Framework Detail 360° View
 * Path: src/components/framework-factory/FrameworkDetailView.tsx
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  SlidersHorizontal,
  ArrowRightLeft,
  Database,
  Cpu,
  Flame,
  FileText,
  AlertOctagon,
  CheckCircle2,
  Activity,
  Award,
  Sparkles,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Lock,
  Scale,
  Clock,
  ChevronRight,
  Zap,
  Info,
  Layers,
  Terminal,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import {
  FrameworkRecord,
  FrameworkSectionRecord,
  FrameworkRequirementRecord,
  CanonicalControl,
  CrossFrameworkMappingEdge,
  FrameworkChangeRecord
} from '../../types/frameworkFactoryTypes';

interface FrameworkDetailViewProps {
  framework: FrameworkRecord;
  sections: FrameworkSectionRecord[];
  requirements: FrameworkRequirementRecord[];
  controls: CanonicalControl[];
  mappings: CrossFrameworkMappingEdge[];
  changes: FrameworkChangeRecord[];
  onBack: () => void;
  onNavigateTab: (tab: string, param?: string) => void;
}

export const FrameworkDetailView: React.FC<FrameworkDetailViewProps> = ({
  framework,
  sections,
  requirements,
  controls,
  mappings,
  changes,
  onBack,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [selectedRequirement, setSelectedRequirement] = useState<FrameworkRequirementRecord | null>(
    requirements[0] || null
  );
  const [copiedHash, setCopiedHash] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'requirements', label: 'Requirements', icon: FileCheck, count: requirements.length },
    { id: 'controls', label: 'Controls', icon: SlidersHorizontal, count: controls.length },
    { id: 'applicability', label: 'Applicability', icon: Sparkles },
    { id: 'mappings', label: 'Crosswalk Graph', icon: ArrowRightLeft, count: mappings.length },
    { id: 'evidence', label: 'Evidence Fabric', icon: Database },
    { id: 'testing', label: 'Continuous Testing', icon: Cpu },
    { id: 'risks', label: 'Risk Map', icon: Flame },
    { id: 'policies', label: 'Policies & SOPs', icon: FileText },
    { id: 'findings', label: 'Findings & NCs', icon: AlertOctagon },
    { id: 'capa', label: 'CAPA & Retest', icon: CheckCircle2 },
    { id: 'assurance', label: 'Continuous Assurance', icon: Award },
    { id: 'changes', label: 'Change Intelligence', icon: Activity, count: changes.length },
    { id: 'audit', label: 'Auditor Clean Room', icon: BookOpen },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles }
  ];

  const filteredRequirements = selectedSectionId === 'ALL'
    ? requirements
    : requirements.filter(r => r.sectionId === selectedSectionId || r.sectionCode === selectedSectionId);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(framework.sourceHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Framework Code:</span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
            {framework.frameworkCode}
          </span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                {framework.frameworkType.replace(/_/g, ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {framework.maturityLevel.replace(/_/g, ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Effective: {framework.effectiveDate}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {framework.frameworkName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-4xl leading-relaxed">
              Publisher: <strong className="text-slate-700 dark:text-slate-200">{framework.publisher}</strong> • Jurisdiction: <strong className="text-slate-700 dark:text-slate-200">{framework.jurisdiction}</strong> • Binding Nature: <strong className="text-slate-700 dark:text-slate-200">{framework.bindingNature.replace(/_/g, ' ')}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={framework.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Official Source
            </a>
            <button
              onClick={() => setActiveTab('copilot')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" /> Ask AI Copilot
            </button>
          </div>
        </div>

        {/* Cryptographic Provenance Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Authoritative Source SHA-256:</span>
            <code className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
              {framework.sourceHash.slice(0, 32)}...
            </code>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyHash}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copiedHash ? 'Copied Full SHA-256' : 'Copy Hash'}
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Verified: {new Date(framework.verifiedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* 15-Tab Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Framework Profile & Scope</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {framework.sourceDocument}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Total Sections</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{framework.totalSectionsCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Requirements</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{framework.totalRequirementsCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Mapped Controls</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{framework.mappedControlsCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Automated Checks</span>
                  <div className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1">{framework.automatedChecksCount}</div>
                </div>
              </div>
            </div>

            {/* Sections Hierarchy */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Original Framework Hierarchy ({sections.length} Sections)</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Preserved Canonical Structure</span>
              </div>

              <div className="space-y-2">
                {sections.map(sec => (
                  <div
                    key={sec.sectionId}
                    onClick={() => {
                      setSelectedSectionId(sec.sectionId);
                      setActiveTab('requirements');
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {sec.sectionCode}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {sec.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{sec.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Legal Boundary & Copyright */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-500" />
                Legal & Statutory Classification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                SKANDA strictly decouples legally binding statutes from voluntary certification standards and commercial attestation criteria.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Classification:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{framework.frameworkType}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Binding Nature:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{framework.bindingNature}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Applicability:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{framework.applicabilityModel}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Copyright & Licensing Safeguards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {framework.copyrightNotice}
              </p>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                Official Citation: {framework.citation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Requirements Explorer */}
      {activeTab === 'requirements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Requirements List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Requirements ({filteredRequirements.length})
              </h3>
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Sections</option>
                {sections.map(s => (
                  <option key={s.sectionId} value={s.sectionId}>{s.sectionCode} - {s.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredRequirements.map(req => {
                const isSelected = selectedRequirement?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequirement(req)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {req.requirementCode}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {req.mappingConfidence}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {req.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {req.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Requirement Deep Dive */}
          <div className="lg:col-span-7">
            {selectedRequirement ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                        {selectedRequirement.requirementCode}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {selectedRequirement.sectionCode}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                      {selectedRequirement.title}
                    </h2>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    {selectedRequirement.provenance}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Requirement Statement
                  </h4>
                  <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {selectedRequirement.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Source Reference
                    </span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{selectedRequirement.sourceReference}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedRequirement.sourceLocation}</p>
                  </div>

                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Applicability Scope
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200">{selectedRequirement.applicabilityScope}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Evidence Expectations & Audit Test Procedure
                  </h4>
                  <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 text-xs text-sky-900 dark:text-sky-200 space-y-1.5">
                    <div className="font-semibold">Required Evidence:</div>
                    <p className="text-[11px] text-sky-800 dark:text-sky-300">{selectedRequirement.evidenceRequirementSummary}</p>
                    <div className="font-semibold pt-1">Automated Test Procedure:</div>
                    <p className="text-[11px] text-sky-800 dark:text-sky-300">{selectedRequirement.testProcedureSummary}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Linked Canonical Controls (One Control → Many)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequirement.canonicalControlIds.map(ctrlId => (
                      <span key={ctrlId} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold">
                        {ctrlId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Select a requirement to inspect full provenance, evidence specifications, and control linkages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Controls View */}
      {activeTab === 'controls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Canonical Controls Supporting {framework.shortName} ({controls.length})
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Harvest Once • Satisfy Multi-Standard Obligations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {controls.map(ctrl => (
              <div key={ctrl.controlId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                    {ctrl.controlCode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    {ctrl.type}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ctrl.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ctrl.description}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Satisfies <strong>{ctrl.supportedFrameworks.length}</strong> Frameworks</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{ctrl.automatedCheckIds.length} Auto Checks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Crosswalk Mappings View */}
      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cross-Framework Mappings ({mappings.length} Active Edges)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Explicit Mapping Confidence & Provenance</span>
          </div>

          <div className="space-y-3">
            {mappings.map(map => (
              <div key={map.mappingId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{map.sourceRequirementCode}</span>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">{map.targetRequirementCode}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{map.mappingRationale}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    Confidence: {map.confidence}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {map.provenance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Fallback / Supporting Tabs */}
      {['applicability', 'evidence', 'testing', 'risks', 'policies', 'findings', 'capa', 'assurance', 'changes', 'audit', 'copilot'].includes(activeTab) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {activeTab.toUpperCase()} Module Synchronized with {framework.shortName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            This module is seamlessly integrated into SKANDA's continuous compliance fabric. Direct telemetry streams and real-time ledger records substantiate continuous assurance without manual re-entry.
          </p>
          <button
            onClick={() => onNavigateTab(activeTab)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
          >
            Open Dedicated {activeTab.toUpperCase()} Workspace
          </button>
        </div>
      )}
    </div>
  );
};
