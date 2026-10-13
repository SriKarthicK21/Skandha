import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Download,
  Flame,
  HelpCircle,
  Building2,
  RefreshCw,
  ExternalLink,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  BadgeAlert,
  Sliders,
  Check,
  Info,
  BarChart3,
  Award
} from 'lucide-react';
import { MASRequirementAssessmentRecord, RegulatoryRequirement } from '../../types/regulatoryTypes';
import { MAS_TRM_DOMAINS, MAS_TRM_REQUIREMENTS } from '../../data/masRegulatoryMasterData';
import {
  MASRAGAdvisoryPack,
  RAGEvidenceAlignmentItem,
  buildMASRAGAdvisoryPack,
  queryMASRegulatoryAIAdvisor
} from '../../services/masRAGKnowledgeService';

interface MASRegulatoryAIAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  activeAssessment: MASRequirementAssessmentRecord | null;
  onSelectRequirement?: (reqCode: string) => void;
  onApplyEvidenceAlignment?: (reqCode: string, evidenceItems: RAGEvidenceAlignmentItem[]) => void;
  onAdoptComplianceNarrative?: (reqCode: string, narrativeText: string) => void;
  onCreateCapaFromAdvisor?: (findingData: {
    title: string;
    description: string;
    category: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    masRequirementCode: string;
    remediationPlan: string;
  }) => void;
}

export const MASRegulatoryAIAdvisor: React.FC<MASRegulatoryAIAdvisorProps> = ({
  isOpen,
  onClose,
  activeAssessment,
  onSelectRequirement,
  onApplyEvidenceAlignment,
  onAdoptComplianceNarrative,
  onCreateCapaFromAdvisor
}) => {
  // Selected requirement for RAG inspection
  const [selectedReqCode, setSelectedReqCode] = useState<string>(
    activeAssessment?.requirementCode || 'MAS-TRM-10.2'
  );

  // Domain filter state for 2021 chapters/annexes
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');

  // Active Advisory Tab
  const [activeTab, setActiveTab] = useState<'EXPLAIN' | 'EVIDENCE' | 'AUDIT_TRAPS' | 'COMPENSATING' | 'BENCHMARK' | 'SOURCES'>('EXPLAIN');

  // Query & Custom RAG Inquiry state
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [advisoryPack, setAdvisoryPack] = useState<MASRAGAdvisoryPack | null>(null);
  const [isAIModel, setIsAIModel] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('MAS Regulatory RAG Engine');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize when activeAssessment changes
  useEffect(() => {
    if (activeAssessment?.requirementCode) {
      setSelectedReqCode(activeAssessment.requirementCode);
    }
  }, [activeAssessment?.requirementCode]);

  // Requirement metadata lookup
  const currentReq = useMemo(() => {
    return MAS_TRM_REQUIREMENTS.find(r => r.requirementCode === selectedReqCode) || MAS_TRM_REQUIREMENTS[0];
  }, [selectedReqCode]);

  // Filtered requirements based on selected chapter/domain
  const filteredRequirements = useMemo(() => {
    if (selectedDomainFilter === 'ALL') return MAS_TRM_REQUIREMENTS;
    return MAS_TRM_REQUIREMENTS.filter(r => r.domainNumber === selectedDomainFilter);
  }, [selectedDomainFilter]);

  // Domain lookup
  const currentDomain = useMemo(() => {
    return MAS_TRM_DOMAINS.find(d => d.domainNumber === currentReq.domainNumber) || MAS_TRM_DOMAINS[0];
  }, [currentReq.domainNumber]);

  // Load advisory data whenever selectedReqCode changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    // Immediate authoritative local grounding
    const instantGrounding = buildMASRAGAdvisoryPack(
      selectedReqCode,
      customQuery || undefined,
      activeAssessment?.currentStateSummary
    );
    setAdvisoryPack(instantGrounding);

    // Asynchronously call backend RAG API for Gemini-augmented regulatory intelligence
    queryMASRegulatoryAIAdvisor({
      requirementCode: selectedReqCode,
      requirementTitle: currentReq.title,
      domainNumber: currentReq.domainNumber,
      domainName: currentReq.domainName,
      query: customQuery || undefined,
      currentState: activeAssessment?.currentStateSummary
    }).then(result => {
      if (isMounted && result.advisory) {
        setAdvisoryPack(result.advisory);
        setIsAIModel(result.isAI);
        setModelName(result.model);
        setIsLoading(false);
      }
    }).catch(err => {
      console.warn('RAG Query Error, kept local grounding:', err);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedReqCode, currentReq]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteCustomQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setCustomQuery(queryText);

    try {
      const result = await queryMASRegulatoryAIAdvisor({
        requirementCode: selectedReqCode,
        requirementTitle: currentReq.title,
        domainNumber: currentReq.domainNumber,
        domainName: currentReq.domainName,
        query: queryText,
        currentState: activeAssessment?.currentStateSummary
      });

      if (result.advisory) {
        setAdvisoryPack(result.advisory);
        setIsAIModel(result.isAI);
        setModelName(result.model);
        showToast('RAG response updated with domain-specific compliance advice.');
      }
    } catch (err: any) {
      console.warn('RAG advisor fetch notice:', err?.message || err);
      showToast('Error querying RAG advisor. Local grounding retained.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCitation = () => {
    if (!advisoryPack) return;
    const text = `[MAS TRM Grounding Citation]
Control: ${advisoryPack.requirementCode} - ${advisoryPack.requirementTitle}
Domain: Domain ${advisoryPack.domainNumber}: ${advisoryPack.domainName}
Statutory Reference: ${advisoryPack.statutoryCitations.trmGuidelinesRef}
Notice Mandate: ${advisoryPack.statutoryCitations.masNoticeRef || 'MAS TRM Guidelines'}
${advisoryPack.slaRequirements ? `Statutory SLA: ${advisoryPack.slaRequirements}\n` : ''}
Statutory Intent:
${advisoryPack.complianceExplanation.statutoryIntent}

Supervisory Expectations:
${advisoryPack.complianceExplanation.supervisoryExpectations.map(e => `• ${e}`).join('\n')}

Penalties & Legal Risk:
${advisoryPack.complianceExplanation.penaltiesAndEnforcementRisk}`;

    navigator.clipboard.writeText(text);
    showToast('Authoritative MAS regulatory citation copied to clipboard.');
  };

  const handleApplyAllEvidence = () => {
    if (!advisoryPack || !onApplyEvidenceAlignment) return;
    onApplyEvidenceAlignment(selectedReqCode, advisoryPack.suggestedEvidenceAlignment);
    showToast(`Adopted ${advisoryPack.suggestedEvidenceAlignment.length} recommended evidence artifacts into assessment record!`);
  };

  const handleAdoptNarrative = () => {
    if (!advisoryPack || !onAdoptComplianceNarrative) return;
    const narrative = `${advisoryPack.complianceExplanation.statutoryIntent}\n\nOperating Controls & Supervisory Alignment:\n${advisoryPack.complianceExplanation.supervisoryExpectations.map(s => `- ${s}`).join('\n')}\n\nEvidence Verification: Aligned with ${advisoryPack.suggestedEvidenceAlignment.map(e => e.evidenceTitle).join(', ')}.`;
    onAdoptComplianceNarrative(selectedReqCode, narrative);
    showToast('Compliance explanation adopted into current state evaluation narrative!');
  };

  const handleCreateCapaFinding = () => {
    if (!advisoryPack || !onCreateCapaFromAdvisor) return;
    onCreateCapaFromAdvisor({
      title: `Regulatory Gap in ${advisoryPack.requirementCode}: ${advisoryPack.requirementTitle}`,
      description: `Identified deficiency in control operating effectiveness against ${advisoryPack.statutoryCitations.trmGuidelinesRef} and ${advisoryPack.statutoryCitations.masNoticeRef || 'MAS Notice'}. Missing verified evidence alignment.`,
      category: 'REGULATORY_COMPLIANCE',
      severity: advisoryPack.criticalSystemsMandate ? 'CRITICAL' : 'HIGH',
      masRequirementCode: advisoryPack.requirementCode,
      remediationPlan: advisoryPack.compensatingControlsGuidance.allowableCompensatingMeasures.join('; ')
    });
    showToast('Corrective Action Plan (CAPA) ticket issued with recommended remediation roadmap!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
      <div 
        className="w-full max-w-4xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-rose-950/20 to-slate-950 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  MAS Regulatory AI Advisor
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-rose-400" />
                  MAS TRM Guidelines (January 2021 Edition • 57 Pages)
                </span>
                {isAIModel ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                    Live Model: {modelName}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    Deterministic RAG Engine
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Domain Compliance & Evidence Alignment Advisor
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Retrieval-Augmented Guidance cross-referencing MAS TRM statutory notices, supervisory inspection criteria, and lead auditor evidence requirements.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCitation}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="Copy authoritative regulatory citation to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Citation</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Advisor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Control Quick Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-3 border-t border-slate-800/80">
            <div className="md:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Filter by Chapter / Annex:
              </label>
              <select
                value={selectedDomainFilter}
                onChange={(e) => {
                  setSelectedDomainFilter(e.target.value);
                  const firstInDomain = e.target.value === 'ALL'
                    ? MAS_TRM_REQUIREMENTS[0]
                    : MAS_TRM_REQUIREMENTS.find(r => r.domainNumber === e.target.value);
                  if (firstInDomain) {
                    setSelectedReqCode(firstInDomain.requirementCode);
                    if (onSelectRequirement) onSelectRequirement(firstInDomain.requirementCode);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white font-medium focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option value="ALL">All 15 Chapters & Annexes (January 2021 Edition)</option>
                {MAS_TRM_DOMAINS.map(dom => (
                  <option key={dom.domainNumber} value={dom.domainNumber}>
                    {dom.domainNumber.startsWith('Annex') ? dom.domainNumber : `Ch. ${dom.domainNumber}`} - {dom.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Target MAS TRM Control:
              </label>
              <div className="relative">
                <select
                  value={selectedReqCode}
                  onChange={(e) => {
                    setSelectedReqCode(e.target.value);
                    if (onSelectRequirement) onSelectRequirement(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-3 pr-8 text-xs text-white font-medium focus:outline-none focus:border-rose-500 transition-colors"
                >
                  {filteredRequirements.map(req => (
                    <option key={req.requirementCode} value={req.requirementCode}>
                      {req.requirementCode} - {req.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Statutory Authority Reference:
              </label>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-rose-300 truncate">
                {currentReq.regulatorySourceRef || `MAS TRM Sec ${currentReq.sectionNumber}`}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Control Summary Banner */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 font-mono font-bold border border-rose-800/50">
              {currentReq.requirementCode}
            </span>
            <span className="font-semibold text-white">
              {currentReq.title}
            </span>
            <span className="text-slate-400 text-[11px]">
              (Domain {currentReq.domainNumber}: {currentReq.domainName})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentReq.criticalSystemsMandate && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                Critical Information Systems Mandate
              </span>
            )}
            {activeAssessment && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                activeAssessment.complianceStatus === 'COMPLIANT'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : activeAssessment.complianceStatus === 'PARTIALLY_COMPLIANT'
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-rose-950 text-rose-300 border-rose-800'
              }`}>
                Current: {activeAssessment.complianceStatus} (CMMI L{activeAssessment.maturityLevel})
              </span>
            )}
          </div>
        </div>

        {/* Quick Query Input & Pre-Set Chips */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteCustomQuery(customQuery);
                }}
                placeholder="Ask MAS Advisor anything (e.g. 'What evidence does MAS expect for MFA timeout?', 'How to prove 1-hour SLA?')..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              onClick={() => handleExecuteCustomQuery(customQuery)}
              disabled={isLoading || !customQuery.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>Consult RAG</span>
            </button>
          </div>

          {/* Quick Consultation Chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-slate-500 font-semibold shrink-0">2021 Focus Areas:</span>
            {[
              'API Security & Token Expiry (Sec 6.4)',
              'Data Centre TVRA & Dual Site (Sec 8.5)',
              'Transaction Signing & Soft Tokens (Sec 14.2)',
              'AASE Adversarial Red Teaming (Sec 13.4)',
              'Mobile Anti-Hooking & SSL Pinning (Annex C)',
              'Source Code Escrow & COTS (Sec 5.3)',
              'Notice 655 1-Hour Incident SLA (Sec 12.3)',
              'Supervisory Inspection Traps'
            ].map(chip => (
              <button
                key={chip}
                onClick={() => {
                  setCustomQuery(chip);
                  handleExecuteCustomQuery(chip);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap cursor-pointer transition-colors border border-slate-700/60"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 px-5 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('EXPLAIN')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'EXPLAIN'
                ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Compliance Explanation</span>
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'EVIDENCE'
                ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Suggested Evidence Alignment</span>
            {advisoryPack && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                {advisoryPack.suggestedEvidenceAlignment.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_TRAPS')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'AUDIT_TRAPS'
                ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Lead Auditor Interrogation & Traps</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPENSATING')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'COMPENSATING'
                ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Compensating Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('BENCHMARK')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'BENCHMARK'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Supervisory Benchmark</span>
            {advisoryPack?.industryRegulatoryBenchmark && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                Bank {advisoryPack.industryRegulatoryBenchmark.bankingFindingRate}% / Ins {advisoryPack.industryRegulatoryBenchmark.insuranceFindingRate}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SOURCES')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'SOURCES'
                ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Grounded RAG Sources</span>
          </button>
        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div className="mx-5 mt-3 p-3 bg-emerald-950/90 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading && !advisoryPack ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-xs">Querying MAS Regulatory RAG Knowledge Base...</p>
            </div>
          ) : advisoryPack ? (
            <>
              {/* TAB 1: COMPLIANCE EXPLANATION */}
              {activeTab === 'EXPLAIN' && (
                <div className="space-y-5">
                  {/* Statutory Intent Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          MAS Regulatory Intent & Statutory Rationale
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {advisoryPack.statutoryCitations.trmGuidelinesRef}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
                      {advisoryPack.complianceExplanation.statutoryIntent}
                    </p>

                    {advisoryPack.slaRequirements && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                        <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <strong className="font-semibold">Statutory SLA Mandate: </strong>
                          <span>{advisoryPack.slaRequirements}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supervisory Expectations */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      MAS Supervisory Expectations During On-Site Examinations
                    </h3>

                    <div className="space-y-2">
                      {advisoryPack.complianceExplanation.supervisoryExpectations.map((exp, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Non-Negotiable Statutory Mandates & Notice Citations */}
                  <div className="bg-slate-950 border border-rose-900/50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        Statutory Notice Non-Negotiables ({advisoryPack.statutoryCitations.masNoticeRef || 'Mandatory Cyber Hygiene'})
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        Statutory Notice Mandate
                      </span>
                    </div>

                    <div className="space-y-2">
                      {advisoryPack.complianceExplanation.nonNegotiableMandates.map((mandate, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs text-rose-200">
                          <span className="text-rose-400 font-bold font-mono">[{idx + 1}]</span>
                          <span className="leading-relaxed">{mandate}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80 leading-relaxed">
                      <strong className="text-slate-300">Legal Penalty Risk: </strong>
                      {advisoryPack.complianceExplanation.penaltiesAndEnforcementRisk}
                    </div>
                  </div>

                  {/* Inspector Notes & Action */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <Info className="w-4 h-4 text-amber-400" />
                      <span>On-Site Inspector Focus Notes</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {advisoryPack.complianceExplanation.inspectionFocusNotes}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={handleAdoptNarrative}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-950"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Adopt Narrative into Assessment Current State</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SUGGESTED EVIDENCE ALIGNMENT */}
              {activeTab === 'EVIDENCE' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        Authoritative Evidence Alignment Matrix ({advisoryPack.suggestedEvidenceAlignment.length} Artifacts)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Concrete auditor-ready artifacts required to satisfy both Design Effectiveness and Operating Effectiveness tests for {advisoryPack.requirementCode}.
                      </p>
                    </div>

                    <button
                      onClick={handleApplyAllEvidence}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-950 shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Adopt All Evidence Into Assessment</span>
                    </button>
                  </div>

                  {/* Evidence Cards Grid */}
                  <div className="space-y-3.5">
                    {advisoryPack.suggestedEvidenceAlignment.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-rose-300 border border-slate-800">
                                {item.id}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                                {item.category}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-sky-300 border border-sky-900/40">
                                Dept: {item.department}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white">
                              {item.evidenceTitle}
                            </h4>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start border ${
                            item.priority === 'MANDATORY'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : item.priority === 'HIGH_PRIORITY'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>

                        {/* Audit Verification Procedure */}
                        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                            Auditor Verification Procedure:
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {item.auditVerificationMethod}
                          </p>
                        </div>

                        {/* Format & Retention & Trap */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60">
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                              Format & Cryptographic Retention:
                            </span>
                            <span className="text-slate-300 text-[11px] font-mono">
                              {item.retentionAndFormat}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200">
                            <span className="text-[10px] text-amber-400 font-semibold block uppercase flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Lead Auditor Inspection Trap:
                            </span>
                            <span className="text-[11px]">
                              {item.inspectionTrapAvoidance}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: LEAD AUDITOR INTERROGATION & TRAPS */}
              {activeTab === 'AUDIT_TRAPS' && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-rose-400" />
                      MAS Supervisory Interrogation Defense Simulator
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Actual questions posed by MAS supervisory examiners and independent SOC 2 / ISO 27001 lead auditors during control walkthroughs. Contrast the model compliant defense against fatal audit traps.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {advisoryPack.leadAuditorInterrogation.map((qa, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              Inspection Question #{idx + 1}
                            </span>
                            <span className="text-xs text-slate-400 italic">
                              Context: {qa.interrogationContext}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white pt-1">
                            "{qa.question}"
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Model Compliant Answer */}
                          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Model Compliant Defense (CISO / Risk Lead)</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              "{qa.modelAnswer}"
                            </p>
                          </div>

                          {/* Fatal Audit Trap */}
                          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/60 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Fatal Audit Trap (Common Unprepared Answer)</span>
                            </div>
                            <p className="text-rose-200/90 leading-relaxed text-[11px]">
                              "{qa.fatalAuditTrapAnswer}"
                            </p>
                          </div>
                        </div>

                        {/* Live Demonstration Artifact */}
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start gap-2">
                          <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-300 font-semibold block">
                              Required Live Demonstration Artifact:
                            </strong>
                            <span className="text-slate-400 text-[11px]">
                              {qa.demonstrationArtifact}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: COMPENSATING CONTROLS */}
              {activeTab === 'COMPENSATING' && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        Compensating Controls Architecture for Legacy Constraints
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        Conditional Regulatory Acceptance
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      When financial institutions cannot implement standard technical controls due to legacy architectures, proprietary third-party software, or mainframe constraints, MAS permits compensating controls subject to documented risk acceptance.
                    </p>
                  </div>

                  {/* Constraint Scenario */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Recognized Legacy Technical Constraint:
                      </span>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        {advisoryPack.compensatingControlsGuidance.legacyScenario}
                      </p>
                    </div>

                    {/* Allowable Compensating Measures */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        MAS Acceptable Compensating Measures:
                      </span>
                      {advisoryPack.compensatingControlsGuidance.allowableCompensatingMeasures.map((measure, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{measure}</span>
                        </div>
                      ))}
                    </div>

                    {/* Governance and Approval Standard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Documentation Standard:
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          {advisoryPack.compensatingControlsGuidance.mandatoryDocumentationStandard}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Mandatory Approval Authority:
                        </span>
                        <span className="text-rose-300 font-semibold text-[11px]">
                          {advisoryPack.compensatingControlsGuidance.approvalAuthorityRequired}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={handleCreateCapaFinding}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-950"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Issue CAPA Finding with Compensating Roadmap</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SUPERVISORY BENCHMARK */}
              {activeTab === 'BENCHMARK' && (
                <div className="space-y-6">
                  {(() => {
                    const benchmarkData = advisoryPack.industryRegulatoryBenchmark;
                    if (!benchmarkData) {
                      return (
                        <div className="p-6 text-center text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800">
                          No supervisory benchmark data available for this requirement.
                        </div>
                      );
                    }
                    return (
                      <>
                        {/* Top Metric Highlight Card */}
                        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30 rounded-2xl space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5" />
                                  Industry Technology Risk Study
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  Matched Domain: {benchmarkData.benchmarkCategory}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white tracking-tight">
                                Supervisory Deficiency Benchmark: Banking vs. Insurance
                              </h3>
                            </div>

                            {benchmarkData.isHighestDeficiencyArea && (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 self-start">
                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                #1 Highest Volume Issue Area
                              </span>
                            )}
                            {benchmarkData.isMostCommonIssueArea && (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 self-start">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                Single Most Popular Audit Finding
                              </span>
                            )}
                          </div>

                          {/* Comparative Visual Bars */}
                          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                            <div className="text-xs font-semibold text-slate-300">
                              Percentage of All Reported MAS Inspection Findings Attributed to this Domain:
                            </div>

                            {/* Banking Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-amber-400 font-bold">Commercial Banking Sector</span>
                                <span className="text-amber-300 font-bold">{benchmarkData.bankingFindingRate}% of all findings</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                                  style={{ width: `${(benchmarkData.bankingFindingRate / 35) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* Insurance Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-sky-300 font-bold">Insurance Institutions</span>
                                <span className="text-sky-300 font-bold">{benchmarkData.insuranceFindingRate}% of all findings</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-500"
                                  style={{ width: `${(benchmarkData.insuranceFindingRate / 35) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Auditor Takeaway */}
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed space-y-1">
                            <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              Lead Auditor Advisory Takeaway
                            </div>
                            <p>{benchmarkData.auditTakeaway}</p>
                          </div>
                        </div>

                        {/* Grouped Impact Area & Case Study Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Grouped Impact Area */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/30">
                                  {benchmarkData.matchedImpactAreaId}
                                </span>
                                <span className="text-xs font-bold text-white">
                                  {benchmarkData.matchedImpactAreaName}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                Cost: {benchmarkData.costImpact}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                                Regulatory Evolution & Enforcement Mandate:
                              </span>
                              <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                                {benchmarkData.consultationVsGuidelinesDiff}
                              </p>
                            </div>
                          </div>

                          {/* Applicable Real-World Case Study */}
                          {benchmarkData.applicableCaseStudy && (
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-sky-400" />
                                  <span className="text-xs font-bold text-white">
                                    {benchmarkData.applicableCaseStudy.institutionType}
                                  </span>
                                </div>
                                <span className="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  Empirical Case Study
                                </span>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="font-semibold text-slate-200">
                                  {benchmarkData.applicableCaseStudy.title}
                                </div>
                                <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-900/40 text-sky-100/90 leading-relaxed">
                                  <span className="font-semibold text-sky-300 mr-1">Supervisory Precedent:</span>
                                  {benchmarkData.applicableCaseStudy.coreLesson}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* TAB 6: GROUNDED SOURCES */}
              {activeTab === 'SOURCES' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      Retrieved Statutory Knowledge Chunks (RAG Grounding)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Authoritative legal texts and regulatory documents retrieved for {advisoryPack.requirementCode}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {advisoryPack.retrievedSources.map((source, idx) => (
                      <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                            {source.documentTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-rose-300 border border-slate-800">
                            {source.section}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/80 p-3 rounded border border-slate-800/80">
                          {source.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Target FI Profile: <strong>Commercial Bank (Singapore)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCitation}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Advisory</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Advisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
