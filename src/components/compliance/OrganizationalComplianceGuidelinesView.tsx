import React, { useState, useMemo } from 'react';
import {
  COMPLIANCE_GUIDELINES,
  REGULATORY_COMPARISON_MATRIX,
  ComplianceGuidelineFramework
} from '../../data/complianceGuidelinesMasterData';
import {
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BookOpen,
  Search,
  Filter,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  Terminal,
  Lock,
  ExternalLink,
  HelpCircle,
  Layers,
  Sparkles,
  Users,
  Check,
  Download
} from 'lucide-react';

interface Props {
  initialFrameworkCode?: string;
  onSelectFramework?: (code: string) => void;
}

export const OrganizationalComplianceGuidelinesView: React.FC<Props> = ({
  initialFrameworkCode,
  onSelectFramework
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>(
    initialFrameworkCode
      ? COMPLIANCE_GUIDELINES.find(f => f.code === initialFrameworkCode || f.id === initialFrameworkCode)?.id || COMPLIANCE_GUIDELINES[0].id
      : COMPLIANCE_GUIDELINES[0].id
  );
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<'ALL' | 'ENGINEERING' | 'INFOSEC' | 'HR' | 'LEGAL' | 'BOARD'>('ALL');
  const [viewMode, setViewMode] = useState<'detailed' | 'cheatsheet'>('detailed');
  const [copiedFrameworkId, setCopiedFrameworkId] = useState<string | null>(null);

  // Local state for interactive step checklist completion
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'fw_iso27001_2022-1': true,
    'fw_iso27001_2022-2': true,
    'fw_mas_trm_2021-1': true,
    'fw_dpdp_2023-1': true,
    'fw_gdpr_2016-1': true,
    'fw_ndpr_2019_2023-1': true
  });

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  // Filtered frameworks
  const filteredFrameworks = useMemo(() => {
    return COMPLIANCE_GUIDELINES.filter(fw => {
      const matchesCat = selectedCategory === 'ALL' || fw.category === selectedCategory;
      const matchesSearch =
        fw.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.authority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.keyGovernancePrinciples.some(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Selected framework
  const activeFw = useMemo(() => {
    return (
      COMPLIANCE_GUIDELINES.find(f => f.id === selectedFrameworkId) ||
      filteredFrameworks[0] ||
      COMPLIANCE_GUIDELINES[0]
    );
  }, [selectedFrameworkId, filteredFrameworks]);

  // Copy framework summary to clipboard
  const handleCopySummary = (fw: ComplianceGuidelineFramework) => {
    const text = `
=== ${fw.code}: ${fw.title} ===
Authority: ${fw.authority} (${fw.jurisdiction})
Effective Date: ${fw.effectiveDate}
Scope: ${fw.scopeSummary}
Incident Reporting Window: ${fw.incidentNotificationWindow.authorityWindow} (${fw.incidentNotificationWindow.regulatoryBody})
Maximum Penalties: ${fw.maximumPenalties}

Key Governance Principles:
${fw.keyGovernancePrinciples.map(p => `• ${p.title}: ${p.description}`).join('\n')}

Mandatory Policies & SOPs:
${fw.mandatoryPoliciesAndSops.map(s => `• [${s.code}] ${s.name} (${s.priority})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedFrameworkId(fw.id);
    setTimeout(() => setCopiedFrameworkId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-800">
                Authoritative Multi-Framework Guide
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ISO • MAS TRM • DPDP • GDPR • NDPR
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
              <BookOpen className="w-6 h-6 text-sky-400" />
              <span>Organizational Compliance Guidelines & Regulatory Playbook</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Step-by-step guidelines for what the organization and each department must follow to achieve full compliance across ISO standards, regional data privacy laws, and financial cybersecurity regulations.
            </p>
          </div>

          {/* View Mode Switcher & Print */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1 text-xs">
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'detailed' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                In-Depth Guide
              </button>
              <button
                onClick={() => setViewMode('cheatsheet')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'cheatsheet' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Executive Comparison Matrix
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Print Guidelines"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search clauses, rules, incident deadlines..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Categories (ISO, Privacy, Cyber)</option>
            <option value="ISO_STANDARDS">ISO Standards (27001, 42001, 27701)</option>
            <option value="PRIVACY_DATA_PROTECTION">Data Privacy Laws (DPDP, GDPR, NDPR)</option>
            <option value="FINANCIAL_CYBER">Financial Cyber Regulations (MAS TRM)</option>
          </select>

          <select
            value={selectedDepartmentFilter}
            onChange={e => setSelectedDepartmentFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Filter By Department: All Organizations</option>
            <option value="ENGINEERING">Technology & DevOps Engineering</option>
            <option value="INFOSEC">Information Security & Risk Management</option>
            <option value="HR">People Operations & Human Resources</option>
            <option value="LEGAL">Legal, Privacy & Finance</option>
            <option value="BOARD">Executive Leadership & Board of Directors</option>
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: Executive Comparison Matrix */}
      {viewMode === 'cheatsheet' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>Multi-Regulatory Comparison Matrix: Incident Timelines, Penalties & Mandates</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapid reference table comparing legal enforceability, breach notification deadlines, and mandatory accountability across ISO, MAS TRM, DPDP, GDPR, and NDPR.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Standard / Law</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Incident SLA</th>
                  <th className="p-3">Maximum Penalties</th>
                  <th className="p-3">Mandatory Officer</th>
                  <th className="p-3">Core Organizational Mandate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {REGULATORY_COMPARISON_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {row.framework}
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{row.jurisdiction}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800/80">
                        {row.incidentWindow}
                      </span>
                    </td>
                    <td className="p-3 text-rose-400 font-medium">{row.maxPenalty}</td>
                    <td className="p-3 text-sky-300">{row.mandatoryRole}</td>
                    <td className="p-3 text-slate-300 max-w-xs">{row.coreMandate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: In-Depth Implementation Guide */}
      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Framework Navigation List */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Select Framework / Standard ({filteredFrameworks.length})
            </h4>

            <div className="space-y-2">
              {filteredFrameworks.map(fw => {
                const isSelected = fw.id === activeFw.id;
                return (
                  <button
                    key={fw.id}
                    onClick={() => {
                      setSelectedFrameworkId(fw.id);
                      if (onSelectFramework) onSelectFramework(fw.code);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-400">{fw.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300">
                        {fw.jurisdiction.split('/')[0]}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white line-clamp-1">{fw.title}</h5>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Authority: {fw.authority.split('(')[0]}</span>
                      <span className="text-rose-400 font-bold">
                        {fw.incidentNotificationWindow.authorityWindow.split(' ')[0]} {fw.incidentNotificationWindow.authorityWindow.split(' ')[1] || ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Guidelines for Selected Framework */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card for Active Framework */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-800">
                      {activeFw.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {activeFw.jurisdiction}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {activeFw.enforceability.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeFw.title}</h2>
                  <p className="text-xs text-slate-400">
                    Governing Authority: <strong className="text-slate-200">{activeFw.authority}</strong> • Enforced: {activeFw.effectiveDate}
                  </p>
                </div>

                <button
                  onClick={() => handleCopySummary(activeFw)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {copiedFrameworkId === activeFw.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Summary!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Guideline</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scope & Penalty Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Scope of Application</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeFw.scopeSummary}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-400">Non-Compliance Penalties</span>
                  <p className="text-xs text-rose-300 font-medium leading-relaxed">{activeFw.maximumPenalties}</p>
                </div>
              </div>

              {/* Mandatory Incident Notification SLA Highlight */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-800/40 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <strong className="text-amber-300 uppercase tracking-wider text-[10px]">
                      Mandatory Incident Reporting SLA:
                    </strong>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold text-[11px] border border-amber-800/80">
                      {activeFw.incidentNotificationWindow.authorityWindow}
                    </span>
                  </div>
                  <p className="text-slate-300">{activeFw.incidentNotificationWindow.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Designated Recipient: <strong className="text-slate-200">{activeFw.incidentNotificationWindow.regulatoryBody}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Core Governance Principles */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>What the Organization Must Follow: Core Governance Principles</span>
              </h3>

              <div className="space-y-3">
                {activeFw.keyGovernancePrinciples.map((principle, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <h5 className="text-xs font-bold text-sky-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{principle.title}</span>
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{principle.description}</p>
                    <div className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-start space-x-2 text-slate-200">
                      <strong className="text-indigo-400 shrink-0 text-[11px] uppercase">Practical Action:</strong>
                      <span>{principle.practicalAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Department-Specific Responsibilities */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>Departmental Duties & Operational Execution</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    What each specific department must execute for {activeFw.code}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedDepartmentFilter === 'ALL' || selectedDepartmentFilter === 'ENGINEERING') && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                      Technology & DevOps Engineering
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {activeFw.departmentalGuidelines.engineeringDevOps.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-sky-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedDepartmentFilter === 'ALL' || selectedDepartmentFilter === 'INFOSEC') && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                      InfoSec & Risk Management
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {activeFw.departmentalGuidelines.infosecRisk.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-indigo-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedDepartmentFilter === 'ALL' || selectedDepartmentFilter === 'HR') && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
                      People Operations & HR
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {activeFw.departmentalGuidelines.peopleHr.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-teal-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedDepartmentFilter === 'ALL' || selectedDepartmentFilter === 'LEGAL') && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                      Legal, Privacy & Procurement
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {activeFw.departmentalGuidelines.legalFinance.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-amber-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedDepartmentFilter === 'ALL' || selectedDepartmentFilter === 'BOARD') && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 col-span-1 md:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
                      Executive Leadership & Board of Directors
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {activeFw.departmentalGuidelines.executiveBoard.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-purple-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Mandatory Policies, SOPs & Registers Required */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Mandatory Documentation Required by {activeFw.code}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeFw.mandatoryPoliciesAndSops.map(item => (
                  <div
                    key={item.code}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-400">{item.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    <p className="text-[11px] text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Step-by-Step Organizational Implementation Checklist */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Step-by-Step Implementation Roadmap & Readiness</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Track the organization's execution milestones for {activeFw.code}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {activeFw.stepByStepImplementationChecklist.map(step => {
                  const stepKey = `${activeFw.id}-${step.stepNumber}`;
                  const isDone = !!completedSteps[stepKey];

                  return (
                    <div
                      key={step.stepNumber}
                      onClick={() => toggleStep(stepKey)}
                      className={`p-3.5 rounded-xl border transition flex items-start space-x-3 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-800/50 hover:bg-emerald-950/30'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-700 bg-slate-900 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>

                      <div className="space-y-1 flex-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white">
                            Step {step.stepNumber}: {step.task}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {step.phase}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Target Deliverable: <strong className="text-slate-300">{step.deliverable}</strong> • Lead: {step.responsibleOwner}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Common Audit Pitfalls & Required Artifacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Common Audit Pitfalls to Avoid</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-200/90">
                  {activeFw.commonAuditPitfalls.map((pitfall, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Auditor Evidence Artifacts</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeFw.auditEvidenceArtifacts.map((artifact, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-sky-400 font-bold">✓</span>
                      <span>{artifact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
