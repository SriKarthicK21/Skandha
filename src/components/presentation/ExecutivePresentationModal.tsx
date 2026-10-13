import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Presentation,
  Download,
  FileText,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  BarChart3,
  Users,
  Target,
  Clock,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  Building2,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import {
  PresentationDeckGenerator,
  PRESENTATION_SLIDES,
  PresentationMetadata
} from '../../services/presentationDeckGenerator';

interface ExecutivePresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutivePresentationModal: React.FC<ExecutivePresentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentTenant } = useGRC();

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [selectedAudience, setSelectedAudience] = useState<PresentationMetadata['audience']>(
    'Executive Board / C-Level'
  );
  const [leadPresenter, setLeadPresenter] = useState<string>('Chief Information Security Officer (CISO)');
  const [presenterTitle, setPresenterTitle] = useState<string>('Head of Information Security & Compliance');
  const [isGeneratingPPT, setIsGeneratingPPT] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeSlide = PRESENTATION_SLIDES[currentSlideIndex];

  const metadata: PresentationMetadata = useMemo(() => ({
    organizationName: currentTenant?.name || 'Skanda Technologies Inc.',
    leadPresenter,
    presenterTitle,
    audience: selectedAudience,
    dateStr: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    complianceScore: (currentTenant && !currentTenant.isDemo && currentTenant.soaBaselineLocked && currentTenant.readinessScore) ? currentTenant.readinessScore : undefined
  }), [currentTenant, leadPresenter, presenterTitle, selectedAudience]);

  const handleDownloadPPT = async () => {
    try {
      setIsGeneratingPPT(true);
      await PresentationDeckGenerator.generatePowerPointDeck(metadata);
    } catch (error) {
      console.error('Failed to generate PowerPoint deck:', error);
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPDF(true);
      PresentationDeckGenerator.exportPdfPresentationDeck(metadata);
    } catch (error) {
      console.error('Failed to generate PDF deck:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopySpeakerScript = () => {
    const fullScript = PRESENTATION_SLIDES.map(s => {
      return `### Slide ${s.slideNumber}: ${s.title}\n**Category**: ${s.category}\n**Subtitle**: ${s.subtitle}\n\n**Key Takeaways**:\n${s.keyTakeaways.map(k => `- ${k}`).join('\n')}\n\n**Verified Metrics**:\n${s.metrics.map(m => `- ${m.label}: ${m.value} (${m.detail})`).join('\n')}\n\n**Presenter Speaking Script**:\n"${s.speakerNotes}"\n\n---\n`;
    }).join('\n');

    const header = `# Skanda GRC — Executive & Client Presentation Master Deck\n**Target Audience**: ${selectedAudience}\n**Entity**: ${metadata.organizationName}\n**Presenter**: ${leadPresenter} (${presenterTitle})\n**Date**: ${metadata.dateStr}\n\n=======================================================\n\n`;

    navigator.clipboard.writeText(header + fullScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleCopyClientMemo = () => {
    const memo = `# Executive Client Brief: Skanda 5 High-Level GRC Platform
**Enterprise Prospect / Partner Briefing Document**
Prepared for: ${metadata.organizationName}
Date: ${metadata.dateStr}

## 1. Executive Summary
Skanda GRC is an enterprise-grade Governance, Risk, and Compliance SaaS platform engineered to unify fragmented cybersecurity, AI safety, and financial regulations into a single autonomous operational engine. 

## 2. Core Frameworks Covered
- **ISO/IEC 27001:2022**: Information Security Management System (ISMS) across all 93 controls and mandatory clauses 4–10.
- **ISO/IEC 42001:2023**: Artificial Intelligence Management System (AIMS) with automated AI System Impact Assessments (AI-SIA) and third-party LLM zero-data-retention verification.
- **MAS TRM Guidelines**: Monetary Authority of Singapore Technology Risk Management standards for cyber hygiene, dual-control, and API security.
- **India DPDP Act 2023**: Comprehensive personal data protection, consent governance, and DPO oversight.
- **SOC 2 Type II Crosswalks**: Continuous control monitoring with zero-duplicate-testing mapping.

## 3. Key Business Value & ROI
- **70% Reduction** in annual audit preparation overhead.
- **68% Efficiency Gain** via Tri-Harmonization Crosswalks (test once, satisfy multiple standards).
- **$350,000+ Annual Cost Savings** by eliminating costly external advisory and manual screenshot gathering.
- **100% Recertification Pass Rate** across accredited bodies (BSI, TÜV SÜD, DNV).

## 4. Key Differentiators
1. **Bayesian Compliance Projection**: Deterministic statistical probability modeling that forecasts audit pass likelihood (calibrated at 96.8% base pass confidence) with zero-major-non-conformity enforcement.
2. **Skanda BrandGuard™**: Autonomous external threat intelligence monitoring dark web credential leaks, rogue phishing domains, and brand abuse.
3. **Cryptographic Evidence Vault**: SHA-256 tamper-evident artifact hashing with automated 90-day freshness SLA monitoring.

## 5. Implementation Roadmap
- **Week 1**: Automated Cloud Discovery & Baseline Ingestion
- **Week 2**: AI-SIA Impact Evaluation & Statement of Applicability Lock
- **Week 3**: Cryptographic Evidence Vault Hashing & Simulated Dry Run
- **Week 4**: External Auditor Dossier Sign-Off & Stage 1/2 Readiness

For live demo inquiries and executive access, contact: compliance@skanda.io
`;

    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none border-none'
            : 'w-full max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Executive Presentation & Client Pitch Deck
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  16:9 Widescreen Master
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ready-to-present briefing deck for enterprise leadership, board meetings, and client marketing proposals.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Download PPT */}
            <button
              onClick={handleDownloadPPT}
              disabled={isGeneratingPPT}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
              title="Download editable 16:9 PowerPoint (.pptx) file with styled shapes, stat cards, and speaker notes"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPPT ? 'Generating PPTX...' : 'Download PPTX'}</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
              title="Download executive landscape PDF slide deck"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Copy Script */}
            <button
              onClick={handleCopySpeakerScript}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Copy complete presenter script to clipboard"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied Script!' : 'Copy Script'}</span>
            </button>

            {/* Copy Client Memo */}
            <button
              onClick={handleCopyClientMemo}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Copy executive 1-pager memo for clients"
            >
              {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
              <span>{copiedMemo ? 'Copied Memo!' : 'Client Memo'}</span>
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close Presentation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presentation Metadata Customizer Bar */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-medium">Audience Track:</span>
            {(['Executive Board / C-Level', 'Enterprise Clients / Prospective Buyers', 'Audit Committee', 'Internal Stakeholders'] as PresentationMetadata['audience'][]).map(aud => (
              <button
                key={aud}
                onClick={() => setSelectedAudience(aud)}
                className={`px-2.5 py-1 rounded-md transition font-medium text-[11px] cursor-pointer ${
                  selectedAudience === aud
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {aud}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>Presenter:</span>
            <input
              type="text"
              value={leadPresenter}
              onChange={e => setLeadPresenter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-white text-[11px] focus:outline-hidden focus:border-indigo-500 w-44"
              placeholder="Presenter Name / Title"
            />
          </div>
        </div>

        {/* Main Presentation Stage */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between">
          <div className="bg-slate-950 rounded-2xl border border-slate-800/90 shadow-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500" />

            {/* Slide Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2.5 py-0.5 rounded-full">
                  {activeSlide.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Slide {activeSlide.slideNumber} of {PRESENTATION_SLIDES.length}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {activeSlide.title}
              </h1>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                {activeSlide.subtitle}
              </p>
              <div className="h-px bg-slate-800 my-4" />
            </div>

            {/* Slide Body: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
              {/* Left Column: Takeaways & Pillars (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2.5 flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Strategic Executive Takeaways</span>
                  </h3>
                  <ul className="space-y-2">
                    {activeSlide.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Core Pillars Box */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  {activeSlide.bulletPoints.map((bp, bpIdx) => (
                    <div key={bpIdx} className="text-xs">
                      <span className="font-bold text-sky-400">{bp.header}: </span>
                      <span className="text-slate-300">{bp.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Verified Metrics Cards (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center space-x-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Key Verified Metrics</span>
                </h3>

                <div className="space-y-2.5">
                  {activeSlide.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xs"
                    >
                      <div className="flex items-baseline justify-between">
                        <span
                          className={`text-xl font-black ${
                            mIdx === 0
                              ? 'text-sky-400'
                              : mIdx === 1
                              ? 'text-emerald-400'
                              : 'text-indigo-400'
                          }`}
                        >
                          {m.value}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Verified
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">{m.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Skanda 5 High-Level GRC Platform • {metadata.organizationName}</span>
              </div>
              <div className="font-mono text-indigo-400 uppercase font-bold tracking-wider">
                Audience: {metadata.audience}
              </div>
            </div>
          </div>

          {/* Expandable Speaker Notes & Talking Points */}
          <div className="mt-4 bg-slate-950/60 rounded-xl border border-slate-800 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Speaker Talking Script (Slide {activeSlide.slideNumber})
                </span>
              </div>
              <button
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                {showSpeakerNotes ? 'Hide Script' : 'Show Script'}
              </button>
            </div>

            {showSpeakerNotes && (
              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 italic font-sans">
                "{activeSlide.speakerNotes}"
              </p>
            )}
          </div>
        </div>

        {/* Slide Navigation Bar */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentSlideIndex(Math.min(PRESENTATION_SLIDES.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slide Dots / Thumbnails */}
          <div className="hidden sm:flex items-center space-x-1.5 overflow-x-auto max-w-md py-1">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.slideNumber}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-7 h-7 rounded-md text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50 ring-2 ring-indigo-400'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
                title={`Jump to Slide ${s.slideNumber}: ${s.title}`}
              >
                {s.slideNumber}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Use arrow keys or click slide numbers to navigate
          </div>
        </div>
      </div>
    </div>
  );
};
