import React, { useState } from 'react';
import {
  FileText,
  XCircle,
  Download,
  FileDown,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  Building,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Eye,
  Columns
} from 'lucide-react';
import { ControlItem, TenantCompany } from '../../types';
import {
  ISO27001_2022_93_MASTER,
  getSoAThemeSummary
} from '../../data/iso27001_2022_masterControls';
import { generateLeadAuditorSoAMatrix } from '../../data/leadAuditorStandardEngine';
import { LeadAuditorDossierModal } from '../documents/LeadAuditorDossierModal';

interface SoADocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  controls: ControlItem[];
  tenant: TenantCompany | null;
  onExportPDF: () => void;
  onExportCSV: () => void;
  isExportingPDF: boolean;
}

export const SoADocumentPreviewModal: React.FC<SoADocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  controls,
  tenant,
  onExportPDF,
  onExportCSV,
  isExportingPDF
}) => {
  if (!isOpen || !tenant) return null;

  const [activeTab, setActiveTab] = useState<'cover' | 'register' | 'auditor_6col' | 'exclusions' | 'crosswalk'>('cover');
  const [themeTab, setThemeTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditorDossierOpen, setIsAuditorDossierOpen] = useState(false);

  // Generate the 6-column lead auditor matrix
  const leadAuditorRows = generateLeadAuditorSoAMatrix(controls, tenant);

  // Exactly the 93 ISO 27001:2022 controls
  const isoControls = controls.filter(
    c => (!c.framework || c.framework.includes('27001')) && !c.framework?.includes('42001')
  );

  const totalControls = isoControls.length;
  const applicableControls = isoControls.filter(c => c.applicable);
  const excludedControls = isoControls.filter(c => !c.applicable);
  const implementedControls = isoControls.filter(
    c =>
      c.applicable &&
      (c.implementationStatus === 'Implemented' ||
        c.implementationStatus === 'Audited' ||
        c.implementationStatus === 'Monitored')
  );
  const inProgressControls = isoControls.filter(
    c => c.applicable && c.implementationStatus === 'In Progress'
  );
  const notStartedControls = isoControls.filter(
    c => c.applicable && c.implementationStatus === 'Not Started'
  );

  const implementationRate =
    applicableControls.length > 0
      ? Math.round((implementedControls.length / applicableControls.length) * 100)
      : 0;

  const themeSummaries = getSoAThemeSummary(isoControls);

  const baselineVersion = 'v2.4 (2026 Audit Baseline)';
  const approvalDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const filteredRegister = isoControls.filter(c => {
    const matchesTheme = themeTab === 'All' || c.category.toLowerCase().includes(themeTab.toLowerCase());
    const matchesSearch =
      c.controlCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.justification || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.responsibleDepartment || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl my-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800">
                  ISO/IEC 27001:2022
                </span>
                <span className="text-xs text-slate-400">Formal Statement of Applicability (Clause 6.1.3 d)</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {tenant.name} — Formal Audit SoA Document
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <FileDown className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-bounce' : ''}`} />
              <span>{isExportingPDF ? 'Building PDF...' : 'Download Official PDF'}</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Navigation Tabs */}
        <div className="flex items-center space-x-1 px-4 pt-2 bg-slate-950 border-b border-slate-800/80 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'cover'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Executive Cover & Attestation</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full 93-Control Register</span>
          </button>

          <button
            onClick={() => setActiveTab('auditor_6col')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'auditor_6col'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-sky-400" />
            <span className="flex items-center space-x-1.5">
              <span>6-Col Lead Auditor Matrix</span>
              <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 text-[10px] font-mono border border-sky-800">
                TÜV Standard
              </span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('exclusions')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'exclusions'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Exclusions Matrix ({excludedControls.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('crosswalk')}
            className={`px-3 py-2 border-b-2 font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'crosswalk'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>2022 Transition & 11 New Controls</span>
          </button>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900 text-slate-200 space-y-6">
          {/* TAB 1: EXECUTIVE COVER & FORMAL SIGN-OFF */}
          {activeTab === 'cover' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              {/* Document Cover Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-widest text-indigo-400 font-black">
                    Official ISMS Management Artifact
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Baseline: <span className="text-white font-bold">{baselineVersion}</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Statement of Applicability (SoA)
                  </h1>
                  <p className="text-sm text-slate-300 mt-1">
                    Information Security Management System (ISMS) in conformity with ISO/IEC 27001:2022
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Organization</div>
                    <div className="text-sm font-bold text-white mt-0.5">{tenant.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">ISMS Scope</div>
                    <div className="text-sm font-bold text-white mt-0.5">{tenant.industryType || tenant.registeredCategory} Platform</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Date of Attestation</div>
                    <div className="text-sm font-bold text-white mt-0.5">{approvalDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Mandatory Clause</div>
                    <div className="text-sm font-bold text-indigo-400 mt-0.5">ISO 27001 Cl. 6.1.3 d</div>
                  </div>
                </div>
              </div>

              {/* Executive Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Annex A Controls</div>
                  <div className="text-2xl font-black text-white">{totalControls}</div>
                  <div className="text-[10px] text-slate-400">All 4 ISO Themes</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">In-Scope (Applicable)</div>
                  <div className="text-2xl font-black text-emerald-400">{applicableControls.length}</div>
                  <div className="text-[10px] text-slate-400">Active safeguards</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Justified Exclusions</div>
                  <div className="text-2xl font-black text-amber-400">{excludedControls.length}</div>
                  <div className="text-[10px] text-slate-400">Defensible rationales</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Implementation Rate</div>
                  <div className="text-2xl font-black text-indigo-400">{implementationRate}%</div>
                  <div className="text-[10px] text-slate-400">{implementedControls.length} fully verified</div>
                </div>
              </div>

              {/* Theme Breakdown Matrix */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Annex A 4-Theme Applicability Distribution
                  </h3>
                  <span className="text-[11px] text-slate-400">Clause 6.1.3 d Comprehensive Mapping</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="p-2.5">Theme / Domain</th>
                        <th className="p-2.5 text-center">Total</th>
                        <th className="p-2.5 text-center">In-Scope</th>
                        <th className="p-2.5 text-center">Excluded</th>
                        <th className="p-2.5 text-center">Implemented</th>
                        <th className="p-2.5 text-right">Readiness %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {themeSummaries.map(t => (
                        <tr key={t.theme} className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span>{t.theme} Controls</span>
                          </td>
                          <td className="p-2.5 text-center font-mono">{t.total}</td>
                          <td className="p-2.5 text-center font-mono text-emerald-400">{t.applicableCount}</td>
                          <td className="p-2.5 text-center font-mono text-amber-400">{t.excludedCount}</td>
                          <td className="p-2.5 text-center font-mono text-indigo-300">{t.implementedCount}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                            {t.implementationRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formal Declaration & Management Sign-Off Block */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Formal Management Attestation & Sign-Off Block
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In accordance with ISO/IEC 27001:2022 Clauses 5.1 (Leadership) and 6.1.3 d) (Information security risk treatment), the undersigned leadership formally adopts and authorizes this Statement of Applicability as the authoritative baseline for all organizational controls, risk treatment plans, and internal/external audits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400">CISO / ISMS Lead Implementer</div>
                    <div className="h-10 border-b border-dashed border-slate-700 flex items-end pb-1 font-serif italic text-sm text-indigo-300">
                      Dr. Richard Vance, CISSP, CISM
                    </div>
                    <div className="text-[11px] text-slate-300">Chief Information Security Officer</div>
                    <div className="text-[10px] text-slate-500">Date: {approvalDate} • Attested via SKANDA Key Vault</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Chief Executive Officer / Managing Director</div>
                    <div className="h-10 border-b border-dashed border-slate-700 flex items-end pb-1 font-serif italic text-sm text-indigo-300">
                      Elena Rostova, CEO
                    </div>
                    <div className="text-[11px] text-slate-300">Executive Board Representative</div>
                    <div className="text-[10px] text-slate-500">Date: {approvalDate} • Attested via SKANDA Key Vault</div>
                  </div>
                </div>

                {/* Cryptographic Seal */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cryptographic Baseline Seal:</span>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-300">
                    SHA-256: {tenant.soaBaselineHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL 93 CONTROLS AUDIT REGISTER */}
          {activeTab === 'register' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Theme Selector & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto w-full sm:w-auto">
                  {['All', 'Organizational', 'People', 'Physical', 'Technological'].map(th => (
                    <button
                      key={th}
                      onClick={() => setThemeTab(th)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        themeTab === th
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search 93 controls..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Controls Detailed Register List */}
              <div className="space-y-2">
                {filteredRegister.map(ctrl => {
                  const meta = ISO27001_2022_93_MASTER.find(m => m.controlCode === ctrl.controlCode);
                  return (
                    <div
                      key={ctrl.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
                            {ctrl.controlCode}
                          </span>
                          <span className="text-xs font-bold text-white">{ctrl.title}</span>
                          {meta?.isNewIn2022 && (
                            <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800 px-1.5 py-0.2 rounded">
                              NEW 2022
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                            {ctrl.category}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              ctrl.applicable
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {ctrl.applicable ? 'In-Scope' : 'Excluded'}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              ctrl.implementationStatus === 'Implemented' || ctrl.implementationStatus === 'Audited'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : ctrl.implementationStatus === 'In Progress'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {ctrl.implementationStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="font-semibold text-slate-400 mr-1.5">Formal Justification:</span>
                        <span>{ctrl.justification || 'Baseline mandatory control as evaluated by ISMS risk assessment.'}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                        <div>
                          Owner: <span className="text-slate-300">{ctrl.responsibleDepartment}</span>
                          {ctrl.remediationOwner && (
                            <span> ({ctrl.remediationOwner})</span>
                          )}
                        </div>
                        {ctrl.mappedRiskCodes && ctrl.mappedRiskCodes.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span>Linked Risks:</span>
                            {ctrl.mappedRiskCodes.map(rc => (
                              <span key={rc} className="font-mono text-[10px] text-indigo-300 bg-indigo-950 px-1 py-0.2 rounded border border-indigo-900">
                                {rc}
                              </span>
                            ))}
                          </div>
                        )}
                        {meta?.iso2013Mapping && (
                          <div className="text-[10px] text-slate-500">
                            ISO 27001:2013 Ref: {meta.iso2013Mapping}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: 6-COLUMN LEAD AUDITOR REGISTER (TÜV / BSI GOLD STANDARD) */}
          {activeTab === 'auditor_6col' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      TÜV / BSI Stage 1 & Stage 2 Defensible 6-Column Control Matrix
                    </span>
                    <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 font-mono">
                      Clause 6.1.3 d
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Maps each control across two-tier justification (Risk ID + Statutory mandate), governing procedure, auditable evidence records, and verification method.
                  </p>
                </div>

                <button
                  onClick={() => setIsAuditorDossierOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shrink-0 shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Full Lead Auditor Dossier</span>
                </button>
              </div>

              {/* Theme & Search Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-1">
                  {['All', 'Organizational', 'People', 'Physical', 'Technological'].map(th => (
                    <button
                      key={th}
                      onClick={() => setThemeTab(th)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        themeTab === th
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search controls, risks, policies..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* The 6-Column Lead Auditor Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-[18%]">1. Annex A Control & Theme</th>
                      <th className="p-3 w-[12%] text-center">2. Applicability & Status</th>
                      <th className="p-3 w-[24%]">3. Risk ID & Justification</th>
                      <th className="p-3 w-[16%]">4. Legal & Statutory Mandate</th>
                      <th className="p-3 w-[15%]">5. Governing Policy / SOP</th>
                      <th className="p-3 w-[15%]">6. Auditable Evidence Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {leadAuditorRows
                      .filter(row => {
                        const matchesTheme = themeTab === 'All' || row.theme === themeTab;
                        const matchesSearch =
                          row.controlCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.justification.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.legalOrContractualMandate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.governingPolicyOrSOP.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          row.auditableEvidenceArtifact.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesTheme && matchesSearch;
                      })
                      .map(row => (
                        <tr key={row.controlCode} className="hover:bg-slate-900">
                          <td className="p-3 space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                                {row.controlCode}
                              </span>
                              {row.isNewIn2022 && (
                                <span className="text-[9px] font-bold text-purple-300 bg-purple-950 border border-purple-800 px-1 rounded">
                                  NEW 2022
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-white text-xs">{row.title}</div>
                            <div className="text-[10px] text-slate-400">{row.theme} Controls</div>
                          </td>

                          <td className="p-3 text-center space-y-1.5">
                            <div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                  row.applicable
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}
                              >
                                {row.applicable ? 'Applicable' : 'Excluded'}
                              </span>
                            </div>
                            <div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border inline-block ${
                                  row.implementationStatus === 'Implemented'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : row.implementationStatus === 'Partially Implemented'
                                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {row.implementationStatus}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {row.responsibleDepartment}
                            </div>
                          </td>

                          <td className="p-3 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="text-slate-500 font-semibold">Risk Ref:</span>
                              {row.linkedRiskIds.map(rId => (
                                <span key={rId} className="font-mono text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/60">
                                  {rId}
                                </span>
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {row.justification}
                            </p>
                          </td>

                          <td className="p-3 space-y-1">
                            <span className="text-[11px] text-slate-300 leading-relaxed block">
                              {row.legalOrContractualMandate}
                            </span>
                          </td>

                          <td className="p-3 space-y-1">
                            <span className="font-mono text-[11px] text-indigo-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 block">
                              {row.governingPolicyOrSOP}
                            </span>
                          </td>

                          <td className="p-3 space-y-1">
                            <div className="font-mono text-[11px] text-emerald-400 flex items-center space-x-1">
                              <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[160px]" title={row.auditableEvidenceArtifact}>
                                {row.auditableEvidenceArtifact}
                              </span>
                            </div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 inline-block">
                              Method: {row.verificationMethod}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FORMAL EXCLUSIONS REGISTER */}
          {activeTab === 'exclusions' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>ISO 27001 Clause 6.1.3 d Formal Exclusions Dossier</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  During Stage 1 and Stage 2 certification audits, external auditors meticulously review each excluded Annex A control to confirm that exclusions are defensible, do not compromise the organization's ability to satisfy information security requirements, and are accompanied by valid rationale.
                </p>
              </div>

              <div className="space-y-3">
                {excludedControls.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
                    No controls currently excluded. All 93 controls are in-scope.
                  </div>
                ) : (
                  excludedControls.map(ctrl => {
                    const meta = ISO27001_2022_93_MASTER.find(m => m.controlCode === ctrl.controlCode);
                    return (
                      <div
                        key={ctrl.id}
                        className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                              {ctrl.controlCode}
                            </span>
                            <span className="text-xs font-bold text-white">{ctrl.title}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                              {ctrl.category}
                            </span>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Formal Exclusion
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-amber-400">
                            Auditor-Defensible Exclusion Rationale:
                          </div>
                          <p className="leading-relaxed">
                            {ctrl.justification || 'Exclusion evaluated under Clause 6.1.2 risk assessment.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div>
                            Responsible Domain: <span className="text-slate-300">{ctrl.responsibleDepartment}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            Compensating Assurance: CSP Attestations / SOC 2 Type II
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 2022 TRANSITION & 11 NEW CONTROLS */}
          {activeTab === 'crosswalk' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60 text-purple-200 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>The 11 New Controls in ISO/IEC 27001:2022</span>
                </div>
                <p className="text-[11px] text-purple-200/90 leading-relaxed">
                  ISO/IEC 27001:2022 introduced 11 completely new controls addressing modern cyber threats, cloud services, data privacy, and threat intelligence. Organizations transitioning from the 2013 standard must formally document their applicability in the SoA.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ISO27001_2022_93_MASTER.filter(m => m.isNewIn2022).map(newCtrl => {
                  const stateCtrl = isoControls.find(c => c.controlCode === newCtrl.controlCode);
                  return (
                    <div
                      key={newCtrl.controlCode}
                      className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                            {newCtrl.controlCode}
                          </span>
                          <span className="text-xs font-bold text-white">{newCtrl.title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            stateCtrl?.applicable
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {stateCtrl?.applicable ? 'In-Scope' : 'Excluded'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2">{newCtrl.description}</p>

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                        <span>Theme: {newCtrl.theme}</span>
                        <span>Concept: {newCtrl.cybersecurityConcept}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ISO/IEC 27001:2022 Clause 6.1.3 d Compliant Document</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close Preview
          </button>
        </div>
      </div>

      {/* TÜV / BSI Lead Auditor Full Dossier Modal */}
      {isAuditorDossierOpen && (
        <LeadAuditorDossierModal
          isOpen={isAuditorDossierOpen}
          onClose={() => setIsAuditorDossierOpen(false)}
          tenant={tenant}
          controls={controls}
          initialTab="soa"
        />
      )}
    </div>
  );
};
