import React, { useState, useMemo } from 'react';
import { DPDPClauseItem, DPDP_STATUTORY_CLAUSES } from '../../data/dpdpMasterData';
import { useToast } from '../common/ToastContainer';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Download,
  Shield,
  ShieldAlert,
  Award,
  Sparkles,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

export const DPDPClauseAuditChecklist: React.FC = () => {
  const { showToast } = useToast();
  const [clauses, setClauses] = useState<DPDPClauseItem[]>(DPDP_STATUTORY_CLAUSES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sdfOnly, setSdfOnly] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(4); // Default expand Section 4

  // Chapters list
  const chapters = useMemo(() => {
    const list = Array.from(new Set(DPDP_STATUTORY_CLAUSES.map(c => c.chapter)));
    return ['All', ...list];
  }, []);

  // Filtered clauses
  const filteredClauses = useMemo(() => {
    return clauses.filter(c => {
      const matchSearch =
        c.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.statutoryRequirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchChapter = selectedChapter === 'All' || c.chapter === selectedChapter;
      const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;
      const matchSdf = !sdfOnly || c.mandatoryForSdf;

      return matchSearch && matchChapter && matchStatus && matchSdf;
    });
  }, [clauses, searchTerm, selectedChapter, selectedStatus, sdfOnly]);

  // Statistics
  const stats = useMemo(() => {
    const total = clauses.length;
    const compliant = clauses.filter(c => c.status === 'Compliant').length;
    const inProgress = clauses.filter(c => c.status === 'In Progress').length;
    const nonCompliant = clauses.filter(c => c.status === 'Non-Compliant').length;
    const notStarted = clauses.filter(c => c.status === 'Not Started').length;
    const readinessScore = Math.round(((compliant + inProgress * 0.5) / total) * 100);

    return { total, compliant, inProgress, nonCompliant, notStarted, readinessScore };
  }, [clauses]);

  // Update clause status
  const handleUpdateStatus = (secNum: number, newStatus: DPDPClauseItem['status']) => {
    setClauses(prev =>
      prev.map(c => (c.sectionNumber === secNum ? { ...c, status: newStatus } : c))
    );
    showToast({
      title: 'Clause Status Updated',
      description: `Section ${secNum} status updated to ${newStatus}.`,
      type: 'success'
    });
  };

  // Update maturity level
  const handleUpdateMaturity = (secNum: number, level: number) => {
    setClauses(prev =>
      prev.map(c => (c.sectionNumber === secNum ? { ...c, maturityLevel: level } : c))
    );
  };

  // Update evidence ref
  const handleUpdateEvidence = (secNum: number, evidence: string) => {
    setClauses(prev =>
      prev.map(c => (c.sectionNumber === secNum ? { ...c, evidenceRef: evidence } : c))
    );
  };

  // Export CSV Report
  const exportChecklistCSV = () => {
    const headers = [
      'Section Code',
      'Title',
      'Chapter',
      'Applicability',
      'Max Penalty (Crores INR)',
      'Status',
      'Maturity Level',
      'Evidence Reference',
      'Audit Checklist Prompt'
    ];

    const rows = clauses.map(c => [
      `"${c.sectionCode}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.chapter}: ${c.chapterTitle}"`,
      `"${c.applicability}"`,
      `"${c.penaltyMaxCrores > 0 ? `₹${c.penaltyMaxCrores} Cr` : 'N/A'}"`,
      `"${c.status}"`,
      `"Level ${c.maturityLevel}/5"`,
      `"${(c.evidenceRef || '').replace(/"/g, '""')}"`,
      `"${c.auditChecklistQuestion.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DPDP_Act_2023_44_Clauses_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      title: 'Report Exported',
      description: 'Downloaded complete 44-clause DPDP Act statutory assessment audit CSV.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Readiness Strip */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                India DPDP Act 2023
              </span>
              <span className="text-xs text-slate-400">All 44 Statutory Sections & Central Rules</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>DPDP Compliance Assessment Checklist</span>
              <Shield className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Comprehensive audit framework spanning Chapters I through IX of the Digital Personal Data Protection Act, 2023. Evaluate technical safeguards, multilingual notice adherence, children data restrictions, and Significant Data Fiduciary (SDF) obligations.
            </p>
          </div>

          {/* Readiness Score Gauge */}
          <div className="flex items-center gap-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-400 font-mono">{stats.readinessScore}%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Readiness Score</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Compliant</span>
                <span className="font-mono font-bold text-emerald-400">{stats.compliant}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress</span>
                <span className="font-mono font-bold text-amber-400">{stats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Non-Compliant</span>
                <span className="font-mono font-bold text-rose-400">{stats.nonCompliant}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by section number, title, chapter, or requirement..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Chapter Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedChapter}
              onChange={e => setSelectedChapter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
            >
              {chapters.map(ch => (
                <option key={ch} value={ch}>
                  {ch === 'All' ? 'All 9 Chapters' : ch}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="In Progress">In Progress</option>
            <option value="Non-Compliant">Non-Compliant</option>
            <option value="Not Started">Not Started</option>
          </select>

          {/* SDF Toggle */}
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
            <input
              type="checkbox"
              checked={sdfOnly}
              onChange={e => setSdfOnly(e.target.checked)}
              className="rounded border-slate-700 text-amber-600 focus:ring-amber-500"
            />
            <span className="font-medium text-amber-300">SDF Mandatory Only</span>
          </label>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={exportChecklistCSV}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Export 44 Clauses (CSV)</span>
        </button>
      </div>

      {/* Clauses Interactive Accordion Table */}
      <div className="space-y-3">
        {filteredClauses.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <p className="text-sm">No DPDP statutory sections matched the active search filters.</p>
          </div>
        ) : (
          filteredClauses.map(clause => {
            const isExpanded = expandedSection === clause.sectionNumber;
            const statusBg =
              clause.status === 'Compliant'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : clause.status === 'In Progress'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : clause.status === 'Non-Compliant'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700';

            return (
              <div
                key={clause.sectionNumber}
                className={`rounded-xl border transition-all ${
                  isExpanded ? 'bg-slate-900/95 border-amber-500/40 shadow-lg shadow-black/40' : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedSection(isExpanded ? null : clause.sectionNumber)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start md:items-center space-x-3 min-w-0">
                    <div className="px-2.5 py-1 rounded-md bg-slate-950 font-mono text-xs font-bold text-amber-400 border border-slate-800 shrink-0">
                      {clause.sectionCode}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-white truncate">{clause.title}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">({clause.chapter})</span>
                        {clause.mandatoryForSdf && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            SDF Mandate
                          </span>
                        )}
                        {clause.penaltyMaxCrores > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Max Fine: ₹{clause.penaltyMaxCrores} Cr
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{clause.statutoryRequirement}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                    {/* Status Pill */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusBg}`}>
                      {clause.status}
                    </span>

                    {/* Maturity Level */}
                    <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span>CMMI</span>
                      <span className="font-bold text-amber-400 font-mono">{clause.maturityLevel}/5</span>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                      aria-label="Expand row"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Audit Panel */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 text-xs">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                      {/* Left: Statutory Requirement & Checklist */}
                      <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                            Statutory Legal Mandate
                          </div>
                          <p className="text-slate-200 leading-relaxed">{clause.statutoryRequirement}</p>
                        </div>

                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                            Auditor Verification Prompt
                          </div>
                          <p className="text-slate-300 italic">"{clause.auditChecklistQuestion}"</p>
                        </div>

                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Recommended Documentary Evidence
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {clause.recommendedEvidence.map((ev, idx) => (
                              <li key={idx}>{ev}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: In-Place Audit Controls */}
                      <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Compliance Status Selector */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Audit Conformance Status
                            </label>
                            <select
                              value={clause.status}
                              onChange={e =>
                                handleUpdateStatus(clause.sectionNumber, e.target.value as DPDPClauseItem['status'])
                              }
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                            >
                              <option value="Compliant">Compliant</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Non-Compliant">Non-Compliant</option>
                              <option value="Not Started">Not Started</option>
                              <option value="Not Applicable">Not Applicable</option>
                            </select>
                          </div>

                          {/* Maturity Rating */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Maturity Rating: {clause.maturityLevel} / 5
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={clause.maturityLevel}
                              onChange={e => handleUpdateMaturity(clause.sectionNumber, Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer mt-2"
                            />
                          </div>
                        </div>

                        {/* Evidence Reference */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Linked Evidence Reference / Policy Code
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. DPDP-POL-01, CMP-ARCH-v2, S3-ENCRYPT-AUDIT"
                            value={clause.evidenceRef || ''}
                            onChange={e => handleUpdateEvidence(clause.sectionNumber, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Applicability & Penalty Info Box */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
                          <span className="text-slate-400">
                            Applicable Entity: <strong className="text-slate-200">{clause.applicability}</strong>
                          </span>
                          <span className="text-amber-400 font-mono">
                            {clause.penaltyMaxCrores > 0
                              ? `Statutory Max Fine: ₹${clause.penaltyMaxCrores} Cr`
                              : 'No Direct Monetary Fine'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
