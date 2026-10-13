import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Layers,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  ISO27001_2022_TUV_MATRIX,
  TUVLeadAuditorControlEntry
} from '../../data/iso27001_2022_tuv_matrix';
import { formatTuvSoaMatrixMarkdown } from '../../services/iso27001Templates/riskAndSoaTemplates';

export interface TuvSoaMatrixViewProps {
  companyName: string;
  cisoName?: string;
  effectiveDate?: string;
  theme?: 'light' | 'dark' | 'midnight' | string;
}

export const TuvSoaMatrixView: React.FC<TuvSoaMatrixViewProps> = ({
  companyName,
  cisoName = 'Dr. Alexis Vance (CISO)',
  effectiveDate = '15 January 2026',
  theme = 'dark'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState<'All' | 'Organizational' | 'People' | 'Physical' | 'Technological'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Applicable' | 'Excluded' | 'New2022'>('All');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [expandedControlCode, setExpandedControlCode] = useState<string | null>(null);

  // Filtered controls computation
  const filteredControls = useMemo(() => {
    return ISO27001_2022_TUV_MATRIX.filter(c => {
      // Theme filter
      const matchesTheme = themeFilter === 'All' || c.theme === themeFilter;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'Applicable') matchesStatus = c.defaultApplicable;
      if (statusFilter === 'Excluded') matchesStatus = !c.defaultApplicable;
      if (statusFilter === 'New2022') matchesStatus = c.isNewIn2022;

      // Search filter
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesSearch =
          c.controlCode.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.riskId.toLowerCase().includes(q) ||
          c.legalRequirements.toLowerCase().includes(q) ||
          c.governingSop.toLowerCase().includes(q) ||
          c.artifactEvidence.toLowerCase().includes(q) ||
          (c.exclusionJustification && c.exclusionJustification.toLowerCase().includes(q));
      }

      return matchesTheme && matchesStatus && matchesSearch;
    });
  }, [themeFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = ISO27001_2022_TUV_MATRIX.length;
    const applicable = ISO27001_2022_TUV_MATRIX.filter(c => c.defaultApplicable).length;
    const excluded = total - applicable;
    const newIn2022 = ISO27001_2022_TUV_MATRIX.filter(c => c.isNewIn2022).length;
    return { total, applicable, excluded, newIn2022 };
  }, []);

  // Copy Full Markdown Table
  const handleCopyMarkdown = () => {
    const md = formatTuvSoaMatrixMarkdown(companyName);
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2200);
  };

  // Download CSV Table
  const handleDownloadCsv = () => {
    const headers = [
      'Control Code',
      'Control Title',
      'Theme',
      'Applicability Status',
      'Tier 1 Specific Risk ID & Justification',
      'Tier 2 Legal, Statutory & Contractual Mandates',
      'Governing Policy & SOP Reference',
      'Auditable Artifact Evidence',
      'Auditor Verification Method',
      'New in ISO 27001:2022'
    ];

    const cleanCsvField = (field: string) => `"${field.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

    const rows = ISO27001_2022_TUV_MATRIX.map(c => [
      cleanCsvField(c.controlCode),
      cleanCsvField(c.title),
      cleanCsvField(c.theme),
      cleanCsvField(c.defaultApplicable ? 'APPLICABLE (Implemented)' : 'EXCLUDED (Defensible Rationale)'),
      cleanCsvField(c.exclusionJustification ? `EXCLUSION: ${c.exclusionJustification}` : c.riskId),
      cleanCsvField(c.legalRequirements),
      cleanCsvField(c.governingSop),
      cleanCsvField(c.artifactEvidence),
      cleanCsvField(c.auditorVerificationMethod),
      cleanCsvField(c.isNewIn2022 ? 'Yes (New in 2022)' : 'No')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ISO27001_2022_TUV_SOA_6_COLUMN_MATRIX.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. TÜV SÜD / LEAD AUDITOR STATEMENT OF APPLICABILITY HEADER BANNER */}
      <div
        className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm ${
          theme === 'light'
            ? 'bg-gradient-to-r from-purple-50/80 via-white to-purple-50/40 border-purple-200 text-slate-900'
            : 'bg-gradient-to-r from-[#170e28] via-[#101426] to-[#0d1527] border-purple-500/30 text-slate-100'
        }`}
      >
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              <span>TÜV Lead Auditor Statement of Applicability (SoA) Master Register</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Clause 6.1.3 d) Certified
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
              6-Column TÜV Specification
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
              93 / 93 Controls Mapped
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>DOC-SOA-03:</span>
              <span>ISO/IEC 27001:2022 Statement of Applicability Control Register</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Full 6-column TÜV SÜD / BSI accreditation matrix. Every single Annex A control is justified across two rigorous dimensions: <strong>Tier 1 Risk ID linkage</strong> and <strong>Tier 2 Statutory/Contractual obligations</strong>, cross-referenced to governing operational SOPs and auditable evidence records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <strong className="text-slate-200">Executive Approver:</strong>
              <span className="text-indigo-300">{cisoName} & CEO</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <strong className="text-slate-200">Effective Date:</strong>
              <span className="text-emerald-400">{effectiveDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <strong className="text-slate-200">Sampling Standard:</strong>
              <span className="text-amber-400">ISO 19011:2018 §B.3</span>
            </span>
          </div>
        </div>

        {/* Action Buttons: Copy Markdown & Export CSV */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMarkdown ? 'Markdown Copied!' : 'Copy 6-Col Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* 2. STATS & TWO-TIER COMPLIANCE READINESS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => {
            setThemeFilter('All');
            setStatusFilter('All');
          }}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            themeFilter === 'All' && statusFilter === 'All'
              ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Evaluated</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono">{stats.total}</div>
          <div className="text-xs text-purple-400 font-semibold">100% Annex A Coverage</div>
          <p className="text-[10px] text-slate-400 mt-1">Four themes harmonized</p>
        </div>

        <div
          onClick={() => setStatusFilter('Applicable')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            statusFilter === 'Applicable'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Applicable</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{stats.applicable}</div>
          <div className="text-xs text-emerald-400 font-semibold">Implemented Controls</div>
          <p className="text-[10px] text-slate-400 mt-1">Verified with technical evidence</p>
        </div>

        <div
          onClick={() => setStatusFilter('Excluded')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            statusFilter === 'Excluded'
              ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Exclusions</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{stats.excluded}</div>
          <div className="text-xs text-amber-400 font-semibold">Defensible Rationale</div>
          <p className="text-[10px] text-slate-400 mt-1">Cloud Shared Responsibility</p>
        </div>

        <div
          onClick={() => setStatusFilter('New2022')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            statusFilter === 'New2022'
              ? 'bg-sky-950/40 border-sky-500/60 ring-1 ring-sky-500/30'
              : theme === 'light'
              ? 'bg-white border-slate-200 hover:bg-slate-50'
              : 'bg-[#0D1527] border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">2022 Revision</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 font-mono">{stats.newIn2022}</div>
          <div className="text-xs text-sky-400 font-semibold">11 New 2022 Controls</div>
          <p className="text-[10px] text-slate-400 mt-1">Threat Intel, Cloud, DLP, SAST</p>
        </div>
      </div>

      {/* 3. FILTER AND SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Theme Filters */}
          {(['All', 'Organizational', 'People', 'Physical', 'Technological'] as const).map(themeName => (
            <button
              key={themeName}
              onClick={() => setThemeFilter(themeName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                themeFilter === themeName
                  ? 'bg-purple-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {themeName === 'All' ? 'All 4 Themes (93)' : `${themeName}`}
            </button>
          ))}

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Status Filters */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'New2022' ? 'All' : 'New2022')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center space-x-1 ${
              statusFilter === 'New2022'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>11 New 2022</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'Excluded' ? 'All' : 'Excluded')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              statusFilter === 'Excluded'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <span>5 Excluded</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search control, risk, statute, SOP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {/* 4. FULL 6-COLUMN TÜV LEAD AUDITOR MASTER TABLE */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
        }`}
      >
        <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              TÜV Lead Auditor 6-Column Matrix (Showing {filteredControls.length} of 93 Controls)
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            ISO/IEC 27001:2022 §6.1.3 d) & Annex A
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-60">1. Annex A Control ID & Title</th>
                <th className="p-3.5 w-36 text-center">2. Applicability & Status</th>
                <th className="p-3.5 min-w-[220px]">3. Tier 1: Risk ID & Justification</th>
                <th className="p-3.5 min-w-[200px]">4. Tier 2: Legal & Statutory Mandates</th>
                <th className="p-3.5 min-w-[190px]">5. Governing Policy & SOP Reference</th>
                <th className="p-3.5 min-w-[230px]">6. Auditable Evidence Record & Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {filteredControls.map((c, idx) => {
                const isExpanded = expandedControlCode === c.controlCode;
                return (
                  <React.Fragment key={c.controlCode}>
                    <tr
                      className={`hover:bg-slate-900/50 transition cursor-pointer ${
                        !c.defaultApplicable ? 'bg-amber-950/10' : ''
                      }`}
                      onClick={() => setExpandedControlCode(isExpanded ? null : c.controlCode)}
                    >
                      {/* Column 1: Control Code, Title, Badges */}
                      <td className="p-3.5 align-top space-y-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-sm text-indigo-400">
                            {c.controlCode}
                          </span>
                          {c.isNewIn2022 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              NEW 2022
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-200 leading-snug">{c.title}</div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                            {c.theme}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Applicability Status */}
                      <td className="p-3.5 align-top text-center">
                        {c.defaultApplicable ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>APPLICABLE</span>
                            </span>
                            <div className="text-[10px] font-mono text-slate-400">
                              {c.defaultStatus}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>EXCLUDED</span>
                            </span>
                            <div className="text-[9px] font-mono text-amber-400/90 font-semibold">
                              Defensible
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Tier 1 Specific Risk ID & Assessment Justification */}
                      <td className="p-3.5 align-top space-y-1 text-slate-300 text-[11px] leading-relaxed">
                        {c.exclusionJustification ? (
                          <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[11px]">
                            <strong className="block text-[10px] uppercase font-bold text-amber-400 mb-0.5">
                              Defensible Cloud Exclusion Defense:
                            </strong>
                            {c.exclusionJustification}
                          </div>
                        ) : (
                          <div>
                            <span className="font-mono font-bold text-purple-400 block mb-0.5">
                              {c.riskId.split(':')[0]}
                            </span>
                            <p className="text-slate-300 text-[11px]">
                              {c.riskId.substring(c.riskId.indexOf(':') + 1).trim()}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Column 4: Tier 2 Legal, Statutory & Contractual Mandates */}
                      <td className="p-3.5 align-top text-slate-300 text-[11px] leading-relaxed">
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-[10px] text-sky-300">
                          {c.legalRequirements}
                        </div>
                      </td>

                      {/* Column 5: Governing Policy & SOP Reference */}
                      <td className="p-3.5 align-top text-slate-300 text-[11px] leading-relaxed space-y-1">
                        <div className="font-semibold text-slate-200">
                          {c.governingSop}
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-indigo-400 font-mono">
                          <BookOpen className="w-3 h-3" />
                          <span>Binding ISMS Standard</span>
                        </div>
                      </td>

                      {/* Column 6: Auditable Evidence Record & Method */}
                      <td className="p-3.5 align-top space-y-1 text-slate-300 text-[11px] leading-relaxed">
                        <div className="font-mono text-[10px] text-emerald-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 break-words">
                          {c.artifactEvidence}
                        </div>
                        <div className="flex items-center space-x-2 pt-0.5 text-[10px] font-mono">
                          <span className="text-slate-400">Method:</span>
                          <span className="px-1.5 py-0.2 rounded font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                            {c.auditorVerificationMethod}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Lead Auditor Inspection Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-slate-800">
                        <td colSpan={6} className="p-4">
                          <div className="p-4 rounded-xl bg-[#070b16] border border-purple-800/40 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                  TÜV Lead Auditor Detailed Workpaper ({c.controlCode} - {c.title})
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">
                                Conformance Status: {c.defaultApplicable ? 'CERTIFIED CONFORMING' : 'DEFENSIBLY EXCLUDED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">
                                  Tier 1 Risk Rationale
                                </span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">{c.riskId}</p>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">
                                  Tier 2 Statutory Citation
                                </span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">{c.legalRequirements}</p>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                                  Auditor Sampling Workpaper
                                </span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  Sampling Method: <strong className="text-emerald-300">{c.auditorVerificationMethod}</strong> pursuant to ISO 19011:2018 §B.3. Artifacts must be verified in read-only WORM storage vaults.
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TuvSoaMatrixView;
