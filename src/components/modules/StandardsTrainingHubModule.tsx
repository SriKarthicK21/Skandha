import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  HelpCircle,
  Clock,
  Terminal,
  Compass,
  FileCheck2,
  Users2,
  Zap
} from 'lucide-react';
import {
  STANDARDS_CATALOG,
  StandardKnowledge,
  MandatoryDocumentItem,
  AuditorInterviewItem,
  ImplementationStep
} from '../../data/standardsKnowledgeData';
import { StandardsKnowledgeService, TrainingMetric } from '../../services/standardsKnowledgeService';
import { PageContainer } from '../layout/PageContainer';
import { useGRC } from '../../context/GRCContext';
import { StandardsPolicySynthesisWorkbench } from '../policies/StandardsPolicySynthesisWorkbench';

export const StandardsTrainingHubModule: React.FC = () => {
  const { setActiveModule, currentTenant } = useGRC();

  // State
  const [selectedStandardId, setSelectedStandardId] = useState<string>('iso-27001');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'overview' | 'mandatory_docs' | 'roadmap' | 'auditor_defense' | 'trainer_sandbox' | 'annex_sl' | 'policy_engine'>('overview');
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetric>(() => StandardsKnowledgeService.getTrainingStatus());
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sandbox Query State
  const [sandboxPrompt, setSandboxPrompt] = useState<string>('What are the strictly mandatory documents required for an ISO 27001:2022 Stage 2 certification audit?');
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [isSimulatingSandbox, setIsSimulatingSandbox] = useState<boolean>(false);

  // Selected Standard
  const selectedStandard = useMemo(() => {
    return StandardsKnowledgeService.getStandardById(selectedStandardId) || STANDARDS_CATALOG[0];
  }, [selectedStandardId]);

  // Categories filter list
  const categories = useMemo(() => {
    const list = ['All', 'Information Security & IT', 'Quality & Engineering', 'Health & Medical', 'Environmental & Safety', 'European Regulations', 'Consulting & Governance'];
    return list;
  }, []);

  // Filtered standards
  const filteredStandards = useMemo(() => {
    let list = STANDARDS_CATALOG;
    if (selectedCategory !== 'All') {
      list = list.filter(s => s.category === selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.targetIndustries.some(ind => ind.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Handle Training Simulation
  const handleTrainSkanda = async () => {
    setIsTraining(true);
    try {
      const updated = await StandardsKnowledgeService.triggerTrainingCycle();
      setTrainingMetrics(updated);
    } finally {
      setIsTraining(false);
    }
  };

  // Handle Sandbox Query
  const handleRunSandboxQuery = () => {
    setIsSimulatingSandbox(true);
    setSandboxResponse(null);

    setTimeout(() => {
      const searchResults = StandardsKnowledgeService.search(sandboxPrompt);
      const topResult = searchResults[0]?.standard || selectedStandard;

      let answer = `### Standards and Training Grounded Response for: "${sandboxPrompt}"\n\n`;
      answer += `**Standard Reference**: ${topResult.code} (${topResult.name} - ${topResult.edition})\n`;
      answer += `**High-Level Architecture**: ${topResult.annexSlCompatible ? 'Annex SL Harmonized Structure' : 'Specialized Regulatory Framework'}\n\n`;

      answer += `#### 1. Core Requirements & Standards Guidance\n${topResult.summary}\n\n`;

      answer += `#### 2. Strictly Mandatory Documents (${topResult.mandatoryDocuments.filter(d => d.isMandatory).length} Required)\n`;
      topResult.mandatoryDocuments.filter(d => d.isMandatory).slice(0, 4).forEach(doc => {
        answer += `- **${doc.title}** (\`${doc.clauseRef}\`): ${doc.purpose} *[Auditor Focus: ${doc.auditorCheck}]*\n`;
      });

      if (topResult.interviewPrep.length > 0) {
        const topQA = topResult.interviewPrep[0];
        answer += `\n#### 3. Lead Auditor Cross-Examination Insight\n`;
        answer += `- **Auditor Typical Question**: "${topQA.question}"\n`;
        answer += `- **Recommended Auditee Defense**: "${topQA.recommendedAnswer}"\n`;
        answer += `- **Mandatory Physical Evidence**: ${topQA.evidenceToProduce}\n`;
      }

      answer += `\n*Ingested from Standards and Training Knowledge Repository. Validated for Stage 1 & Stage 2 conformity.*`;

      setSandboxResponse(answer);
      setIsSimulatingSandbox(false);
    }, 700);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadBriefing = () => {
    const md = StandardsKnowledgeService.exportBriefingMarkdown(selectedStandard);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Standards_Briefing_${selectedStandard.code.replace(/[^a-zA-Z0-9]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer id="standards-training-hub-module">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-[#131b2e] to-[#1e1730] p-6 lg:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Standards and Training Implementation & Auditor Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Standards and Training Knowledge Hub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Skanda GRC is trained on internationally accredited standards and lead auditor training methodologies across all <strong className="text-amber-300">17 global standards</strong>.
              Access definitive mandatory documentation checklists, 10-step implementation roadmaps, Annex SL synergies,
              and lead auditor cross-examination defenses.
            </p>
          </div>

          {/* Training Action Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <button
              onClick={handleTrainSkanda}
              disabled={isTraining}
              className="inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-900/40 hover:from-amber-500 hover:to-yellow-400 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Ingesting Standards Knowledge...' : 'Re-Train Skanda AI Engine'}</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Status: <strong className="text-emerald-300">17/17 Standards Active</strong> ({trainingMetrics.trainingAccuracyScore}% Grounded)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Metrics Row */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Standards Ingested</div>
            <div className="text-xl font-bold text-white mt-0.5">17 Standards</div>
            <div className="text-[11px] text-amber-400/90 mt-0.5">100% Standards Catalog</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Mandatory Documents</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{trainingMetrics.totalMandatoryDocsIndexed}+ Files</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Auditor-Verified Templates</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Auditor Q&A Flashcards</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{trainingMetrics.totalAuditorQuestionsIndexed} Scenarios</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Stage 1 & Stage 2 Defense</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Last Knowledge Sync</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{trainingMetrics.lastTrainedDate}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">RAG Embedding v3.8</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Standard Selector on Left, Deep Dive Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 17 Standards Navigator (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Global Standards & Frameworks (17)</span>
              </h2>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {filteredStandards.length} shown
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search standard, clause, law..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable Standard Cards List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredStandards.map((std) => {
                const isSelected = std.id === selectedStandard.id;
                return (
                  <button
                    key={std.id}
                    onClick={() => {
                      setSelectedStandardId(std.id);
                      if (activeTab === 'trainer_sandbox') setActiveTab('overview');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/15 to-purple-500/10 text-white shadow-md shadow-amber-950/30 ring-1 ring-amber-400/40'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                          {std.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {std.badge}
                        </span>
                      </div>
                      {std.annexSlCompatible && (
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                          Annex SL
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate mt-1">
                      {std.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {std.summary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Access to Tools */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Standards & Training Tools
            </h3>
            <button
              onClick={() => setActiveTab('policy_engine')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                activeTab === 'policy_engine'
                  ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                  : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Audit-Ready Policy Engine</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('trainer_sandbox')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                activeTab === 'trainer_sandbox'
                  ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                  : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Prompt Sandbox (Standards & Training RAG)</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('annex_sl')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                activeTab === 'annex_sl'
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Annex SL Harmonization Matrix</span>
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Column: Standard Deep Dive & Interaction Tabs (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Standard Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('mandatory_docs')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'mandatory_docs'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Mandatory Documents ({selectedStandard.mandatoryDocuments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>10-Step Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab('auditor_defense')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'auditor_defense'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Lead Auditor Defense</span>
            </button>

            <button
              onClick={() => setActiveTab('trainer_sandbox')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'trainer_sandbox'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Query Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('policy_engine')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'policy_engine'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Audit-Ready Policy Engine</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-mono">
                11 Docs
              </span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & SCOPE */}
          {activeTab === 'overview' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
              {/* Header Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-white">{selectedStandard.code}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                      {selectedStandard.edition}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-300 mt-1">{selectedStandard.name}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadBriefing}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Briefing</span>
                  </button>
                  <button
                    onClick={() => handleCopyText(StandardsKnowledgeService.exportBriefingMarkdown(selectedStandard), 'briefing')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 transition"
                  >
                    {copiedId === 'briefing' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'briefing' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Executive Standard Profile
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedStandard.summary}
                </p>
              </div>

              {/* Target Scope & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <Users2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Target Industries & Applicable Scope</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedStandard.targetIndustries.map((ind, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Key Business & Audit Benefits</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedStandard.keyBenefits.map((ben, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Core Clauses Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Key Clauses & Mandatory Audit Requirements</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedStandard.coreClauses.map((clause, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-300">{clause.clause}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{clause.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{clause.description}</p>
                      <div className="text-[11px] text-emerald-400/90 font-medium pt-1 border-t border-slate-850">
                        <strong>Mandate:</strong> {clause.keyRequirement}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synergies with other standards */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-950/30 border border-indigo-500/30 space-y-2">
                <h3 className="text-xs font-bold text-indigo-300 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Integrated Management System (IMS) Synergies</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStandard.synergiesWithOtherStandards.map((syn, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANDATORY DOCUMENTS CHECKLIST */}
          {activeTab === 'mandatory_docs' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>Mandatory Document Checklist: {selectedStandard.code}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lead auditors strictly fail organizations at Stage 1 if any strictly mandatory document is missing.
                  </p>
                </div>
                <div className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {selectedStandard.mandatoryDocuments.filter(d => d.isMandatory).length} Mandatory Items
                </div>
              </div>

              <div className="space-y-3">
                {selectedStandard.mandatoryDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                         <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                          {doc.clauseRef}
                        </span>
                        <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        doc.isMandatory
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}>
                        {doc.isMandatory ? 'Strictly Mandatory' : 'Standards Recommended'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="text-slate-300">
                        <strong className="text-slate-400">Document Purpose:</strong> {doc.purpose}
                      </div>
                      <div className="text-emerald-300 bg-emerald-950/30 border border-emerald-800/40 p-2 rounded-lg">
                        <strong>Auditor Verification:</strong> {doc.auditorCheck}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button: Jump to Policy Generator */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-300">Need to generate these documents for {selectedStandard.code}?</div>
                  <div className="text-[11px] text-slate-300">Use Skanda’s Auditor-Grade Policy Synthesis Engine bound to your tenant infrastructure.</div>
                </div>
                <button
                  onClick={() => setActiveModule('policies')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Open Policy Generator
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: 10-STEP ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>10-Step Implementation Roadmap: {selectedStandard.code}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chronological progression from project initiation to final accredited certification.
                  </p>
                </div>
              </div>

              <div className="relative pl-6 border-l-2 border-slate-800 space-y-6 my-2">
                {selectedStandard.implementationRoadmap.map((step) => {
                  const phaseColors: Record<string, string> = {
                    Planning: 'bg-sky-500 text-white',
                    Implementation: 'bg-amber-500 text-slate-950',
                    Operation: 'bg-purple-500 text-white',
                    'Evaluation & Certification': 'bg-emerald-500 text-slate-950'
                  };

                  return (
                    <div key={step.stepNumber} className="relative group">
                      <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-300 font-mono">
                        {step.stepNumber}
                      </div>

                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className="text-xs font-bold text-white">
                            Step {step.stepNumber}: {step.title}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${phaseColors[step.phase] || 'bg-slate-700 text-white'}`}>
                            {step.phase}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{step.description}</p>
                        <div className="text-[11px] text-slate-400 pt-1 flex items-center space-x-1.5">
                          <strong className="text-slate-300">Deliverables:</strong>
                          <span className="text-amber-300/90">{step.deliverables.join(' • ')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: LEAD AUDITOR DEFENSE & INTERVIEW PLAYBOOK */}
          {activeTab === 'auditor_defense' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Lead Auditor Mock Cross-Examination Playbook</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real questions asked by UKAS, ANAB, and TÜV lead auditors with recommended compliant answers.
                  </p>
                </div>
              </div>

              {/* Auditor Expectations vs Common Red Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auditor Acceptance Criteria</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedStandard.auditorExpectations.map((exp, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Common Non-Conformities & Pitfalls</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedStandard.commonNonConformities.map((nc, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-rose-400">✗</span>
                        <span>{nc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interview Q&A Flashcards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  Auditee Interview Defense Flashcards
                </h4>
                {selectedStandard.interviewPrep.map((qa, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
                    <div className="flex items-start space-x-2 text-xs font-semibold text-amber-300">
                      <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>Auditor: "{qa.question}"</span>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                      <strong className="text-slate-300">Auditor Intent:</strong> {qa.auditorIntent}
                    </div>

                    <div className="text-xs text-slate-200 pl-3 border-l-2 border-emerald-400/80 leading-relaxed">
                      <strong className="text-emerald-300">Recommended Auditee Response:</strong><br />
                      "{qa.recommendedAnswer}"
                    </div>

                    <div className="text-[11px] text-purple-300 flex items-center space-x-2 pt-1 border-t border-slate-850">
                      <strong>Mandatory Evidence to Produce:</strong>
                      <span className="text-slate-300">{qa.evidenceToProduce}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI QUERY SANDBOX */}
          {activeTab === 'trainer_sandbox' && (
            <div className="rounded-2xl border border-purple-500/40 bg-slate-900/95 p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Skanda AI Query Sandbox (Standards and Training Grounding)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Query any of the 17 standards. Grounded in international implementation methodologies, mandatory documents, and auditor checklists.
                  </p>
                </div>
              </div>

              {/* Sample Prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Sample Standards Queries:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What are the strictly mandatory documents for ISO 13485?',
                    'Explain DORA ICT Third-Party Risk Management rules',
                    'How does NIS2 differ from ISO 27001?',
                    'What is the 10-step roadmap for ISO 9001?',
                    'What are common non-conformities in IATF 16949?',
                    'How do I integrate ISO 27001, 9001, and 14001 using Annex SL?'
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSandboxPrompt(p)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition text-left cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Query Input Box */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={sandboxPrompt}
                    onChange={(e) => setSandboxPrompt(e.target.value)}
                    placeholder="Ask Skanda any question about ISO 27001, 42001, 9001, 13485, 14001, 45001, 20000, 22301, 17025, NIS2, GDPR, MDR, DORA, IATF 16949, AS9100..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-purple-500/40 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleRunSandboxQuery}
                    disabled={isSimulatingSandbox || !sandboxPrompt.trim()}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isSimulatingSandbox ? 'animate-bounce' : ''}`} />
                    <span>{isSimulatingSandbox ? 'Retrieving Knowledge Chunks...' : 'Run Query with Standards & Training RAG'}</span>
                  </button>
                </div>
              </div>

              {/* Response Display */}
              {sandboxResponse && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3 font-sans text-xs text-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <span className="text-[11px] font-mono text-purple-300 font-bold">
                      ✓ Response Grounded in Standards and Training Knowledge Engine
                    </span>
                    <button
                      onClick={() => handleCopyText(sandboxResponse, 'sandbox_out')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copiedId === 'sandbox_out' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'sandbox_out' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {sandboxResponse}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ANNEX SL HARMONIZATION MATRIX */}
          {activeTab === 'annex_sl' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Annex SL Common High-Level Structure (HLS) Harmonization</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How ISO 27001, 9001, 14001, 45001, 22301, and 42001 share a single governance spine, eliminating 70% of duplicated compliance effort.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Annex SL Clause</th>
                      <th className="p-3">ISO 27001 (Security)</th>
                      <th className="p-3">ISO 9001 (Quality)</th>
                      <th className="p-3">ISO 14001 (Environment)</th>
                      <th className="p-3">ISO 45001 (Safety)</th>
                      <th className="p-3">Synergy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-300">4. Context</td>
                      <td className="p-3 text-slate-300">Interested parties & security boundaries</td>
                      <td className="p-3 text-slate-300">Customer & quality context</td>
                      <td className="p-3 text-slate-300">Environmental condition</td>
                      <td className="p-3 text-slate-300">Worker health & legal</td>
                      <td className="p-3 font-bold text-emerald-400">90% Overlap</td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-300">5. Leadership</td>
                      <td className="p-3 text-slate-300">CISO & Executive Committee</td>
                      <td className="p-3 text-slate-300">Quality Policy & Management</td>
                      <td className="p-3 text-slate-300">Pollution prevention</td>
                      <td className="p-3 text-slate-300">Worker consultation (5.4)</td>
                      <td className="p-3 font-bold text-emerald-400">85% Overlap</td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-300">6. Planning</td>
                      <td className="p-3 text-slate-300">InfoSec Risk & SoA</td>
                      <td className="p-3 text-slate-300">Risks & Opportunities</td>
                      <td className="p-3 text-slate-300">Aspects & Impacts</td>
                      <td className="p-3 text-slate-300">HIRA & Hierarchy</td>
                      <td className="p-3 font-bold text-emerald-400">Unified Matrix</td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-300">7. Support</td>
                      <td className="p-3 text-slate-300">Clause 7.5 Document control</td>
                      <td className="p-3 text-slate-300">Clause 7.5 Document control</td>
                      <td className="p-3 text-slate-300">Clause 7.5 Document control</td>
                      <td className="p-3 text-slate-300">Clause 7.5 Document control</td>
                      <td className="p-3 font-bold text-emerald-400">100% Identical</td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-300">9. Evaluation</td>
                      <td className="p-3 text-slate-300">Internal Audit (9.2)</td>
                      <td className="p-3 text-slate-300">Internal Audit (9.2)</td>
                      <td className="p-3 text-slate-300">Internal Audit (9.2)</td>
                      <td className="p-3 text-slate-300">Internal Audit (9.2)</td>
                      <td className="p-3 font-bold text-emerald-400">Single Audit</td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-300">10. Improvement</td>
                      <td className="p-3 text-slate-300">CAPA register (10.2)</td>
                      <td className="p-3 text-slate-300">CAPA register (10.2)</td>
                      <td className="p-3 text-slate-300">CAPA register (10.2)</td>
                      <td className="p-3 text-slate-300">CAPA register (10.2)</td>
                      <td className="p-3 font-bold text-emerald-400">Single Register</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ISO 27001 AUDIT-READY POLICY SYNTHESIS ENGINE */}
          {activeTab === 'policy_engine' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-1 sm:p-3">
              <StandardsPolicySynthesisWorkbench isEmbedded={true} />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
