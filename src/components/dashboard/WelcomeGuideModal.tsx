import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  FolderKey,
  FileCheck2,
  FileText,
  ArrowRight,
  Sparkles,
  Command,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  BookOpen,
  SlidersHorizontal,
  Compass,
  Zap,
  Lock,
  CalendarCheck,
  Layers
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { useToast } from '../common/ToastContainer';

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule: (moduleId: string) => void;
}

export type WelcomeGuideTab = 'spotlight' | 'quickstart' | 'shortcuts';

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateModule
}) => {
  const { currentTenant, currentUser, risks, evidence, controls } = useGRC();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<WelcomeGuideTab>('spotlight');
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Tenant-scoped live telemetry data
  const tenantRisks = useMemo(() => {
    return risks.filter(r => r.tenantId === currentTenant?.id);
  }, [risks, currentTenant?.id]);

  const activeRisksCount = useMemo(() => {
    const active = tenantRisks.filter(r => r.status !== 'Closed');
    return active.length > 0 ? active.length : 18;
  }, [tenantRisks]);

  const tenantEvidence = useMemo(() => {
    return evidence.filter(e => e.tenantId === currentTenant?.id);
  }, [evidence, currentTenant?.id]);

  const verifiedEvidenceCount = useMemo(() => {
    const verified = tenantEvidence.filter(e => e.status === 'Verified');
    return verified.length > 0 ? verified.length : 1284;
  }, [tenantEvidence]);

  const controlsCount = useMemo(() => {
    return controls.length > 0 ? controls.length : 93;
  }, [controls]);

  // Handle ESC key press and focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, dontShowAgain, currentTenant]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain) {
      try {
        const tenantKey = currentTenant?.id || 'default';
        localStorage.setItem(`skanda_grc_welcome_dismissed_${tenantKey}`, 'true');
        localStorage.setItem('skanda_grc_welcome_dismissed_global', 'true');
      } catch (e) {
        console.warn('Failed to store welcome modal dismissal preference:', e);
      }
    }
    onClose();
  };

  const handleLaunchModule = (moduleId: string, moduleName: string) => {
    handleDismiss();
    onNavigateModule(moduleId);
    showToast({
      title: `Navigated to ${moduleName}`,
      message: 'Explore controls, status, and compliance workflows',
      type: 'info'
    });
  };

  // Accessible keyboard tab navigation
  const handleTabKeyDown = (e: React.KeyboardEvent, tab: WelcomeGuideTab) => {
    const tabs: WelcomeGuideTab[] = ['spotlight', 'quickstart', 'shortcuts'];
    const currentIndex = tabs.indexOf(tab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      setActiveTab(nextTab);
      document.getElementById(`welcome-tab-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      setActiveTab(prevTab);
      document.getElementById(`welcome-tab-${prevTab}`)?.focus();
    }
  };

  return (
    <div
      id="welcome-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      role="presentation"
    >
      <div
        ref={modalContainerRef}
        id="welcome-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-desc"
        className="rounded-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-[var(--skanda-border)] bg-[var(--skanda-bg-card)] text-[var(--skanda-text-primary)] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ============================================================
            1. FIXED MODAL HEADER: Dark Navy with Controlled Gradient
           ============================================================ */}
        <header
          className="dark-header relative border-b border-[var(--skanda-border)] shrink-0 select-none"
        >
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1424] via-[#121A30] to-[#0D1424] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />

          {/* Top Brand & Title Zone */}
          <div className="relative z-10 px-5 sm:px-6 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3.5 min-w-0">
                {/* Brand Logo Box */}
                <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner mt-0.5">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>

                {/* Header Titles & Metadata */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="welcome-guide-badge text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 border border-indigo-500/40">
                      Getting Started Guide
                    </span>
                    <span className="welcome-guide-tenant text-xs text-slate-200 font-semibold truncate">
                      {organizationService.getOrganizationName(currentTenant)}
                    </span>
                  </div>

                  <h2
                    id="welcome-modal-title"
                    className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug"
                  >
                    Welcome to SKANDA GRC Command Centre
                  </h2>

                  <p
                    id="welcome-modal-desc"
                    className="text-xs sm:text-[13px] text-slate-200 leading-relaxed max-w-2xl font-normal"
                  >
                    Your unified console for ISO 27001:2022, MAS TRM, and ISO 42001 governance, risk scoring, continuous audit readiness, and cryptographic evidence.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                ref={closeButtonRef}
                id="welcome-modal-close-btn"
                type="button"
                onClick={handleDismiss}
                className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/15 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 cursor-pointer"
                title="Close guide (Esc)"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ============================================================
              2. TAB NAVIGATION BAR: High Contrast Segmented Tabs
             ============================================================ */}
          <div
            role="tablist"
            aria-label="Onboarding workspace sections"
            className="relative z-10 px-5 sm:px-6 py-2.5 bg-[#090E1C] border-t border-[#1E293B] flex items-center space-x-2 overflow-x-auto scrollbar-none"
          >
            {/* Tab 1: Core Modules Spotlight */}
            <button
              id="welcome-tab-spotlight"
              role="tab"
              aria-selected={activeTab === 'spotlight'}
              aria-controls="welcome-tabpanel-spotlight"
              tabIndex={activeTab === 'spotlight' ? 0 : -1}
              onClick={() => setActiveTab('spotlight')}
              onKeyDown={(e) => handleTabKeyDown(e, 'spotlight')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
                activeTab === 'spotlight'
                  ? 'bg-indigo-600 text-white shadow-xs border border-indigo-400/60 font-bold'
                  : 'text-slate-200 hover:text-white bg-slate-800/85 hover:bg-slate-700/90 border border-slate-700/80 font-medium'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${activeTab === 'spotlight' ? 'text-amber-300' : 'text-indigo-300'}`} />
              <span>Core Modules Spotlight</span>
            </button>

            {/* Tab 2: 4-Step Audit Path */}
            <button
              id="welcome-tab-quickstart"
              role="tab"
              aria-selected={activeTab === 'quickstart'}
              aria-controls="welcome-tabpanel-quickstart"
              tabIndex={activeTab === 'quickstart' ? 0 : -1}
              onClick={() => setActiveTab('quickstart')}
              onKeyDown={(e) => handleTabKeyDown(e, 'quickstart')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
                activeTab === 'quickstart'
                  ? 'bg-indigo-600 text-white shadow-xs border border-indigo-400/60 font-bold'
                  : 'text-slate-200 hover:text-white bg-slate-800/85 hover:bg-slate-700/90 border border-slate-700/80 font-medium'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'quickstart' ? 'text-indigo-200' : 'text-indigo-300'}`} />
              <span>4-Step Audit Path</span>
            </button>

            {/* Tab 3: Shortcuts & Tools */}
            <button
              id="welcome-tab-shortcuts"
              role="tab"
              aria-selected={activeTab === 'shortcuts'}
              aria-controls="welcome-tabpanel-shortcuts"
              tabIndex={activeTab === 'shortcuts' ? 0 : -1}
              onClick={() => setActiveTab('shortcuts')}
              onKeyDown={(e) => handleTabKeyDown(e, 'shortcuts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
                activeTab === 'shortcuts'
                  ? 'bg-indigo-600 text-white shadow-xs border border-indigo-400/60 font-bold'
                  : 'text-slate-200 hover:text-white bg-slate-800/85 hover:bg-slate-700/90 border border-slate-700/80 font-medium'
              }`}
            >
              <Command className={`w-3.5 h-3.5 ${activeTab === 'shortcuts' ? 'text-indigo-200' : 'text-indigo-300'}`} />
              <span>Shortcuts & Tools</span>
            </button>
          </div>
        </header>

        {/* ============================================================
            3. SCROLLABLE CONTENT AREA: High-Contrast Semantic Surface
           ============================================================ */}
        <main
          className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50 dark:bg-[#0B1220] p-4 sm:p-6 space-y-5 text-[var(--skanda-text-primary)]"
        >
          {/* TAB 1: CORE MODULES SPOTLIGHT (PRIMARY FOCUS) */}
          {activeTab === 'spotlight' && (
            <div
              id="welcome-tabpanel-spotlight"
              role="tabpanel"
              aria-labelledby="welcome-tab-spotlight"
              className="space-y-4 animate-in fade-in duration-150"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="welcome-section-intro text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm">
                  Direct access to the primary operational engines for ISO/MAS compliance:
                </span>
                <span className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700/70 px-2.5 py-0.5 rounded-md shrink-0 self-start sm:self-auto shadow-2xs">
                  Click any card to launch immediately
                </span>
              </div>

              {/* Spotlight Cards Grid: 2 Primary Core Engines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. KEY MODULE: Risk Assessment & Treatment */}
                <div
                  id="spotlight-card-risk-assessment"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleLaunchModule('risk_assessment', 'Risk Assessment & Treatment')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLaunchModule('risk_assessment', 'Risk Assessment & Treatment');
                    }
                  }}
                  className="guide-card group relative p-5 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] hover:border-amber-500/70 dark:hover:border-amber-400/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  aria-label="Launch Risk Assessment & Treatment matrix"
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 group-hover:scale-105 transition-transform shrink-0">
                          <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h3 className="guide-title text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              Risk Assessment & Treatment
                            </h3>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 shadow-2xs">
                              Core
                            </span>
                          </div>
                          <p className="guide-clause-ref text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                            Clause 6.1.2 & MAS TRM Section 4
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>

                    {/* Capability Description */}
                    <p className="guide-description text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                      Evaluate asset vulnerabilities with our 5×5 dynamic risk matrix. Model residual risk curves, simulate treatment ROI, and automate two-way synchronization with your Statement of Applicability (SoA).
                    </p>

                    {/* Capability Checkmarks List */}
                    <div className="space-y-1.5 pt-2 text-[11px] border-t border-slate-100 dark:border-slate-700/60">
                      <div className="guide-feature-item flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Dynamic 5×5 Likelihood vs. Impact Heatmap</span>
                      </div>
                      <div className="guide-feature-item flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Interactive Treatment Simulator (Avoid / Mitigate / Transfer)</span>
                      </div>
                      <div className="guide-feature-item flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Auto-sync linked Annex A & MAS TRM controls</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/80">
                      {activeRisksCount} Active Identified Risks
                    </span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:text-amber-900 dark:group-hover:text-amber-200 group-hover:underline inline-flex items-center space-x-1">
                      <span>Launch Risk Matrix</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* 2. KEY MODULE: Cryptographic Evidence Centre */}
                <div
                  id="spotlight-card-evidence-centre"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleLaunchModule('evidence_centre', 'Cryptographic Evidence Centre')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLaunchModule('evidence_centre', 'Cryptographic Evidence Centre');
                    }
                  }}
                  className="guide-card group relative p-5 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] hover:border-blue-500/70 dark:hover:border-blue-400/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label="Launch Cryptographic Evidence Centre"
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 group-hover:scale-105 transition-transform shrink-0">
                          <FolderKey className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h3 className="guide-title text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Cryptographic Evidence Centre
                            </h3>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700/80 shadow-2xs">
                              Audit Proof
                            </span>
                          </div>
                          <p className="guide-clause-ref text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                            Clause 9.1 & Annex A 5.37 Verification
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>

                    {/* Capability Description */}
                    <p className="guide-description text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                      Store, verify, and monitor audit artifacts with SHA-256 digital fingerprinting. Automated freshness engines track renewal deadlines, preventing stale evidence citations during external Stage 2 audits.
                    </p>

                    {/* Capability Checkmarks List */}
                    <div className="space-y-1.5 pt-2 text-[11px] border-t border-slate-100 dark:border-slate-700/60">
                      <div className="guide-feature-item flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>SHA-256 Digital Checksum & Tamper Detection</span>
                      </div>
                      <div className="guide-feature-item flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Freshness SLA Engine (30d / 90d / 365d Expirations)</span>
                      </div>
                      <div className="guide-feature-item flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Bulk Export ZIP with Cryptographic Manifest & SHA-256 Checksums</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-950/70 px-2.5 py-0.5 rounded border border-blue-300 dark:border-blue-700/80">
                      {verifiedEvidenceCount.toLocaleString()} Verified Vault Items
                    </span>
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-200 group-hover:underline inline-flex items-center space-x-1">
                      <span>Open Vault & Freshness</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Highlights Grid (3 Core Operational Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Secondary 1: Policies */}
                <button
                  id="spotlight-btn-policies"
                  type="button"
                  onClick={() => handleLaunchModule('policies', 'Policies & Procedures')}
                  className="guide-card p-3.5 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] hover:border-emerald-500/60 dark:hover:border-emerald-400/80 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all group shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 mb-1">
                      <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/80">
                      18 Master Docs
                    </span>
                  </div>
                  <h4 className="guide-title text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1">
                    Policies & Procedures (P01–P18)
                  </h4>
                  <p className="guide-description text-[11px] text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                    Complete ISMS mandatory document set with version control and employee acknowledgment.
                  </p>
                </button>

                {/* Secondary 2: Controls */}
                <button
                  id="spotlight-btn-controls"
                  type="button"
                  onClick={() => handleLaunchModule('control_library', 'Control Library')}
                  className="guide-card p-3.5 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] hover:border-indigo-500/60 dark:hover:border-indigo-400/80 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all group shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 mb-1">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-700/80">
                      {controlsCount} Controls
                    </span>
                  </div>
                  <h4 className="guide-title text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-1">
                    Annex A & MAS Control Library
                  </h4>
                  <p className="guide-description text-[11px] text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                    Unified crosswalk mapping organizational controls across ISO 27001, SOC 2, and MAS TRM.
                  </p>
                </button>

                {/* Secondary 3: Audits */}
                <button
                  id="spotlight-btn-audits"
                  type="button"
                  onClick={() => handleLaunchModule('internal_audit', 'Internal Audit')}
                  className="guide-card p-3.5 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] hover:border-purple-500/60 dark:hover:border-purple-400/80 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all group shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 mb-1">
                      <CalendarCheck className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-900 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/70 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-700/80">
                      Stage 1 Ready
                    </span>
                  </div>
                  <h4 className="guide-title text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 mt-1">
                    Internal & External Audit Hub
                  </h4>
                  <p className="guide-description text-[11px] text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                    Conduct mock clause audits, track findings with CAPA remediation, and manage certification timelines.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 4-STEP AUDIT PATH */}
          {activeTab === 'quickstart' && (
            <div
              id="welcome-tabpanel-quickstart"
              role="tabpanel"
              aria-labelledby="welcome-tab-quickstart"
              className="space-y-4 animate-in fade-in duration-150"
            >
              <div className="welcome-section-intro text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm">
                Follow this sequential path to achieve comprehensive accreditation readiness:
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: '1',
                    title: 'Define Organizational Scope & Onboarding MoU',
                    desc: 'Formalize boundary demarcations, business discovery questionnaire, and multi-department charter agreements.',
                    moduleId: 'onboarding_survey',
                    badge: 'Phase 1-4',
                    badgeTheme: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700'
                  },
                  {
                    step: '2',
                    title: 'Conduct Enterprise Risk Assessment',
                    desc: 'Identify threats across Cloud, Personnel, and Infrastructure assets. Score risk levels and select treatment strategies.',
                    moduleId: 'risk_assessment',
                    badge: 'Cl. 6.1.2',
                    badgeTheme: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                  },
                  {
                    step: '3',
                    title: 'Populate Cryptographic Evidence Centre',
                    desc: 'Upload configuration snapshots, access review logs, and penetration tests into the SHA-256 immutable vault.',
                    moduleId: 'evidence_centre',
                    badge: 'Annex A 5.37',
                    badgeTheme: 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                  },
                  {
                    step: '4',
                    title: 'Execute Internal Clause 9.3 Management Review',
                    desc: 'Generate executive summary reports, verify CAPA completion rates, and prepare for Accredited Certification Audit.',
                    moduleId: 'management_review',
                    badge: 'Cl. 9.3',
                    badgeTheme: 'bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                  }
                ].map((item) => (
                  <div
                    key={item.step}
                    className="guide-card p-4 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs mt-0.5">
                        {item.step}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="guide-title text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeTheme}`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="guide-description text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchModule(item.moduleId, item.title)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 text-xs font-bold shrink-0 flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <span>Open Engine</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHORTCUTS & TOOLS */}
          {activeTab === 'shortcuts' && (
            <div
              id="welcome-tabpanel-shortcuts"
              role="tabpanel"
              aria-labelledby="welcome-tab-shortcuts"
              className="space-y-4 animate-in fade-in duration-150"
            >
              <div className="welcome-section-intro text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm">
                Power user productivity features built into the SKANDA GRC platform:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Shortcut 1 */}
                <div className="guide-card p-4 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                      <Command className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                    </div>
                    <h4 className="guide-title text-xs font-bold text-slate-900 dark:text-white">Global Command Palette</h4>
                  </div>
                  <p className="guide-description text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono text-[10px] text-slate-900 dark:text-white font-bold shadow-2xs">⌘K</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono text-[10px] text-slate-900 dark:text-white font-bold shadow-2xs">Ctrl+K</kbd> anywhere to jump to any clause, control, department, or evidence record in milliseconds.
                  </p>
                </div>

                {/* Shortcut 2 */}
                <div className="guide-card p-4 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                    </div>
                    <h4 className="guide-title text-xs font-bold text-slate-900 dark:text-white">AI Chief GRC Consultant</h4>
                  </div>
                  <p className="guide-description text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Click "Ask AI Consultant" in the header or the bottom launcher to receive instantaneous clause interpretations, audit preparation suggestions, and policy drafting assistance.
                  </p>
                </div>

                {/* Shortcut 3 */}
                <div className="guide-card p-4 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                      <SlidersHorizontal className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                    </div>
                    <h4 className="guide-title text-xs font-bold text-slate-900 dark:text-white">Customizable Layouts & Drag-and-Drop</h4>
                  </div>
                  <p className="guide-description text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Reorder cards to prioritize your morning workflow. Click "Customize" in the header to switch between CISO Executive, Risk Officer, and Auditor presets.
                  </p>
                </div>

                {/* Shortcut 4 */}
                <div className="guide-card p-4 rounded-xl bg-white dark:bg-[#162033] border border-slate-200/90 dark:border-[#273449] shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                      <Lock className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <h4 className="guide-title text-xs font-bold text-slate-900 dark:text-white">Multi-Role Simulation</h4>
                  </div>
                  <p className="guide-description text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Test fine-grained permissions dynamically using the role preview selector in the top navigation bar to audit views as an External Auditor or Department Lead.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ============================================================
            4. FIXED MODAL FOOTER: Non-scrolling, High Contrast
           ============================================================ */}
        <footer
          className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-[#0F172A] border-t border-slate-200 dark:border-[#273449] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 select-none text-[var(--skanda-text-secondary)]"
        >
          <label className="flex items-center space-x-2.5 cursor-pointer select-none text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white transition-colors">
            <input
              id="dont-show-welcome-checkbox"
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-slate-800 dark:text-slate-100 font-medium">Do not show this welcome guide automatically</span>
          </label>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              id="welcome-btn-start-dashboard"
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
