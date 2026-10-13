import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  FileText,
  Sparkles,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  Shield,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  FRAMEWORK_REQUIREMENTS_SPECS,
  GRANULAR_REQUIREMENTS,
  FrameworkRequirementSpec,
  GranularRequirement,
  isModuleAllowed
} from '../../utils/frameworkVisibility';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const Phase3DocGeneration: React.FC<Props> = ({ onComplete, onBack }) => {
  const { currentTenant, savePhase3FrameworkAndGenerate } = useGRC();

  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(
    currentTenant?.selectedFrameworks && currentTenant.selectedFrameworks.length > 0
      ? currentTenant.selectedFrameworks
      : ['ISO/IEC 27001:2022']
  );

  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(() => {
    if (currentTenant?.selectedFrameworkRequirements && currentTenant.selectedFrameworkRequirements.length > 0) {
      return currentTenant.selectedFrameworkRequirements;
    }
    // Default: all granular requirements for initially active frameworks
    const activeFrameworks = currentTenant?.selectedFrameworks || ['ISO/IEC 27001:2022'];
    const activeSpecs = FRAMEWORK_REQUIREMENTS_SPECS.filter(spec =>
      activeFrameworks.some(
        f =>
          f.toLowerCase().includes(spec.shortTitle.toLowerCase().slice(0, 5)) ||
          f.toLowerCase() === spec.code.toLowerCase() ||
          (spec.key === 'ISO_27001' && (f.includes('27001') || f.includes('ISMS'))) ||
          (spec.key === 'ISO_42001' && (f.includes('42001') || f.includes('AIMS'))) ||
          (spec.key === 'MAS_TRM' && (f.includes('MAS') || f.includes('TRM'))) ||
          (spec.key === 'DPDP' && (f.includes('DPDP') || f.includes('27701'))) ||
          (spec.key === 'BRANDGUARD' && (f.includes('BrandGuard') || f.includes('Attack')))
      )
    );
    return activeSpecs.flatMap(s => s.granularRequirements.map(r => r.id));
  });

  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    ISO_27001: true,
    ISO_42001: true,
    MAS_TRM: false,
    DPDP: false
  });
  const [selectedDocPreview, setSelectedDocPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isSpecSelected = (spec: FrameworkRequirementSpec) => {
    return selectedFrameworks.some(
      f =>
        f.toLowerCase().includes(spec.shortTitle.toLowerCase().slice(0, 5)) ||
        f.toLowerCase() === spec.code.toLowerCase() ||
        (spec.key === 'ISO_27001' && (f.includes('27001') || f.includes('ISMS'))) ||
        (spec.key === 'ISO_42001' && (f.includes('42001') || f.includes('AIMS'))) ||
        (spec.key === 'MAS_TRM' && (f.includes('MAS') || f.includes('TRM'))) ||
        (spec.key === 'DPDP' && (f.includes('DPDP') || f.includes('27701'))) ||
        (spec.key === 'BRANDGUARD' && (f.includes('BrandGuard') || f.includes('Attack')))
    );
  };

  const toggleFramework = (spec: FrameworkRequirementSpec) => {
    const code = spec.code;
    const exists = isSpecSelected(spec);

    if (exists) {
      if (selectedFrameworks.length <= 1) return; // Must keep at least one framework
      setSelectedFrameworks(prev =>
        prev.filter(
          c =>
            c.toLowerCase() !== code.toLowerCase() &&
            !c.toLowerCase().includes(spec.shortTitle.toLowerCase().slice(0, 5))
        )
      );
      // Remove its requirements from selectedRequirements
      const specReqIds = new Set(spec.granularRequirements.map(r => r.id));
      setSelectedRequirements(prev => prev.filter(id => !specReqIds.has(id)));
    } else {
      setSelectedFrameworks(prev => [...prev, code]);
      // Add all its granular requirements by default
      const specReqIds = spec.granularRequirements.map(r => r.id);
      setSelectedRequirements(prev => Array.from(new Set([...prev, ...specReqIds])));
    }
  };

  const toggleGranularRequirement = (reqId: string, spec: FrameworkRequirementSpec, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRequirements(prev => {
      const exists = prev.includes(reqId);
      if (exists) {
        // Ensure at least one requirement remains for an active framework
        const otherSelectedInSpec = spec.granularRequirements.filter(
          r => r.id !== reqId && prev.includes(r.id)
        );
        if (otherSelectedInSpec.length === 0) {
          // If unchecking the last requirement, keep it or inform user
          return prev;
        }
        return prev.filter(id => id !== reqId);
      } else {
        return [...prev, reqId];
      }
    });
  };

  const toggleExpand = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDetails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      savePhase3FrameworkAndGenerate(selectedFrameworks, selectedRequirements);
      setIsGenerating(false);
    }, 600);
  };

  const handleProceedToPhase4 = () => {
    // Automatically commit framework & requirement choices
    savePhase3FrameworkAndGenerate(selectedFrameworks, selectedRequirements);
    onComplete();
  };

  const docs = currentTenant?.generatedDocs || [];
  const activePreviewDoc = docs.find(d => d.id === selectedDocPreview) || docs[0];

  // Dynamic modules count calculation
  const allFrameworkModules = useMemo(() => {
    const set = new Set<string>();
    FRAMEWORK_REQUIREMENTS_SPECS.forEach(s => {
      s.unlockedModules.forEach(m => set.add(m.id));
    });
    return Array.from(set);
  }, []);

  const enabledModulesCount = useMemo(() => {
    return allFrameworkModules.filter(modId =>
      isModuleAllowed(modId, selectedFrameworks, selectedRequirements)
    ).length;
  }, [allFrameworkModules, selectedFrameworks, selectedRequirements]);

  const hiddenModulesCount = useMemo(() => {
    return allFrameworkModules.length - enabledModulesCount;
  }, [allFrameworkModules.length, enabledModulesCount]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800">
              Phase 3 of 4: Framework Scoping & Operational Requirements
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              What does your organization actually require?
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Select the compliance standards and customize the specific operational requirements for your organization.
              Skanda dynamically configures your control workbenches and policies,
              while <strong>automatically hiding non-applicable modules</strong> from your sidebar navigation to eliminate clutter.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Live Scope Counter Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">
                {selectedFrameworks.length} Framework{selectedFrameworks.length === 1 ? '' : 's'} Selected
              </span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="text-slate-400">
              <strong className="text-indigo-300">{selectedRequirements.length}</strong> Requirements Active
            </div>
            <span className="text-slate-600">•</span>
            <div className="text-slate-400">
              <strong className="text-white">{enabledModulesCount}</strong> Workbenches in Sidebar
            </div>
            <span className="text-slate-600">•</span>
            <div className="text-slate-400">
              <strong className="text-amber-400">{hiddenModulesCount}</strong> Non-applicable Modules Hidden
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/40 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            id="btn-trigger-docgen"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>{isGenerating ? 'Synthesizing Artefacts...' : 'Generate Policies & Lock Framework Scope'}</span>
          </button>
        </div>
      </div>

      {/* Framework Requirements Detailed Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span>Available Frameworks & Specific Requirements</span>
            <span className="text-[10px] text-slate-400 font-normal">
              (Click card to toggle framework; expand to customize specific granular requirements)
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {FRAMEWORK_REQUIREMENTS_SPECS.map(spec => {
            const selected = isSpecSelected(spec);
            const isExpanded = expandedDetails[spec.key] ?? false;

            return (
              <div
                key={spec.key}
                onClick={() => toggleFramework(spec)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selected
                    ? 'bg-slate-900/90 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 opacity-75'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${spec.badgeColor}`}>
                        {spec.badge}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">{spec.code}</span>
                      {spec.isPrimary && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                          Recommended Base
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{spec.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{spec.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(spec.key, e)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition flex items-center space-x-1 text-[11px]"
                      title="Inspect actual requirements"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Requirements'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        selected
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                          : 'border border-slate-600 bg-slate-800/60 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Requirements & Unlocked Modules Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs">
                    {/* What this framework actually requires overview */}
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="font-semibold text-slate-200 flex items-center space-x-1.5 text-[11px]">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>What {spec.shortTitle} Actually Requires from Your Organization:</span>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {spec.whatIsActuallyRequired.map((req, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-[11px] text-slate-300">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Granular Requirements Customizer */}
                    {selected && spec.granularRequirements.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-900/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-200 flex items-center space-x-1.5 text-[11px]">
                            <Sliders className="w-3.5 h-3.5 text-sky-400" />
                            <span>Select Specific Requirements for {spec.shortTitle}:</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Unchecking an item hides its associated modules from your sidebar
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          {spec.granularRequirements.map(req => {
                            const isReqActive = selectedRequirements.includes(req.id);

                            return (
                              <div
                                key={req.id}
                                onClick={(e) => toggleGranularRequirement(req.id, spec, e)}
                                className={`p-2.5 rounded-lg border transition flex items-start space-x-2.5 ${
                                  isReqActive
                                    ? 'bg-slate-900/90 border-indigo-500/50 text-slate-200'
                                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:border-slate-700'
                                }`}
                              >
                                <div className="pt-0.5 shrink-0">
                                  {isReqActive ? (
                                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-600" />
                                  )}
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1 text-left">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/60">
                                      {req.code}
                                    </span>
                                    <span className="font-semibold text-[11px] truncate">
                                      {req.title}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-tight">
                                    {req.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Unlocked modules tags */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                        <span>Associated Workbenches & Navigation Items ({spec.unlockedModules.length}):</span>
                        <span className={selected ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {selected ? '✓ Dynamic filtering active in sidebar' : 'Hidden from sidebar when framework unselected'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {spec.unlockedModules.map(mod => {
                          const isModVisible = isModuleAllowed(mod.id, selectedFrameworks, selectedRequirements);

                          return (
                            <span
                              key={mod.id}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                                isModVisible
                                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
                                  : 'bg-slate-800/30 text-slate-600 border border-slate-800 line-through'
                              }`}
                            >
                              {mod.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Artefacts Suite */}
      {docs.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white">
                Generated Compliance Artefacts Pack ({docs.length} Documents)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Auditor-Grade (Standards and Training Rigor)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Doc List */}
            <div className="lg:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {docs.map(doc => {
                const isSelected = (activePreviewDoc && activePreviewDoc.id === doc.id) || false;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocPreview(doc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/60 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-400">
                            {doc.docCode}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {doc.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span>v{doc.version}</span>
                          <span>•</span>
                          <span>{doc.effectiveDate}</span>
                        </div>
                      </div>
                      <Eye className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Preview Modal */}
            <div className="lg:col-span-7 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col h-[460px]">
              {activePreviewDoc ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-sky-400">
                          {activePreviewDoc.docCode}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {activePreviewDoc.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Category: {activePreviewDoc.category} | Effective Date: {activePreviewDoc.effectiveDate}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-400 text-[10px] font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>{activePreviewDoc.status}</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto py-3 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {activePreviewDoc.content}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Approver: {activePreviewDoc.approver}</span>
                    <span className="text-amber-400">Locked until MoU signed</span>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Select a document to preview content.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scope & SoA</span>
        </button>
        <button
          onClick={handleProceedToPhase4}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-900/30 flex items-center space-x-1.5 cursor-pointer"
          id="btn-proceed-phase4"
        >
          <span>Proceed to Phase 4 (Digital MoU Execution)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
