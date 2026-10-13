import React, { useState, useMemo } from 'react';
import { DepartmentScopeProfile, DepartmentPolicyRequirement, GeneratedDocument } from '../../types';
import { STANDARD_ISMS_POLICIES_AND_SOPS } from '../../data/departmentScopeMasterData';
import { useGRC } from '../../context/GRCContext';
import {
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  Layers,
  Building2,
  Edit2,
  Check,
  X,
  ArrowUpDown,
  BookOpen,
  Plus
} from 'lucide-react';

interface Props {
  departmentScopes: DepartmentScopeProfile[];
  onOpenDepartmentScope: (dept: DepartmentScopeProfile) => void;
  onUpdatePolicyStatus: (deptId: string, policyReqId: string, newStatus: DepartmentPolicyRequirement['status']) => void;
  onAutoMapAll?: () => void;
  generatedDocs?: GeneratedDocument[];
}

export const DepartmentPolicyAnalyzer: React.FC<Props> = ({
  departmentScopes,
  onOpenDepartmentScope,
  onUpdatePolicyStatus,
  onAutoMapAll,
  generatedDocs = []
}) => {
  const { addFinding, logAuditEvent, currentUser } = useGRC();
  const [loggedCAPAs, setLoggedCAPAs] = useState<Record<string, boolean>>({});

  const inScopeDepts = useMemo(() => {
    return departmentScopes.filter(d => d.isInScope);
  }, [departmentScopes]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'POLICY' | 'SOP'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards' | 'gaps'>('matrix');

  // Stats calculation
  const totalInScope = inScopeDepts.length;
  let totalRequirements = 0;
  let compliantCount = 0;
  let gapCount = 0;
  let inReviewCount = 0;

  inScopeDepts.forEach(dept => {
    (dept.policyRequirements || []).forEach(req => {
      totalRequirements++;
      if (req.status === 'Compliant & Approved') compliantCount++;
      else if (req.status === 'Gap - Required') gapCount++;
      else if (req.status === 'In Review') inReviewCount++;
    });
  });

  const overallComplianceRate = totalRequirements > 0
    ? Math.round((compliantCount / totalRequirements) * 100)
    : 0;

  // Filtered departments
  const filteredDepts = inScopeDepts.filter(d => {
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.leadOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.policyRequirements || []).some(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.docCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCat && matchesSearch;
  });

  // Unique list of all standard policies present across in-scope departments
  const allPolicyCodes = useMemo(() => {
    const codeMap = new Map<string, { docCode: string; title: string; type: string }>();
    STANDARD_ISMS_POLICIES_AND_SOPS.forEach(std => {
      codeMap.set(std.docCode, { docCode: std.docCode, title: std.title, type: std.type });
    });
    inScopeDepts.forEach(d => {
      (d.policyRequirements || []).forEach(r => {
        if (!codeMap.has(r.docCode)) {
          codeMap.set(r.docCode, { docCode: r.docCode, title: r.title, type: r.type });
        }
      });
    });
    return Array.from(codeMap.values());
  }, [inScopeDepts]);

  const filteredPolicyCodes = allPolicyCodes.filter(p => {
    if (selectedTypeFilter === 'POLICY' && p.type !== 'POLICY') return false;
    if (selectedTypeFilter === 'SOP' && p.type !== 'SOP' && p.type !== 'PROCEDURE') return false;
    return true;
  });

  const handleLogGapCAPA = (dept: DepartmentScopeProfile, req: DepartmentPolicyRequirement) => {
    const key = `${dept.id}_${req.id}`;
    addFinding({
      severity: 'Minor Non-Conformity',
      source: 'INTERNAL_AUDIT',
      title: `Policy/SOP Gap: Unapproved ${req.docCode} (${req.title}) in ${dept.name}`,
      clauseOrControl: `${req.isoClause} / ${req.annexAControl}`,
      department: dept.name,
      description: `Identified unapproved or missing procedure for ${req.title}. Department currently lacks verified operational SOP evidence and approval record.`,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          `Why is ${req.docCode} marked as Gap? -> Documentation not formally reviewed by department lead.`,
          `Why was it not reviewed? -> Department lacked assigned GRC review cadence.`,
          `Why was cadence missing? -> Implementation was not mapped to operational sprint cycle.`,
          `Why was sprint mapping absent? -> Cross-functional GRC integration was delayed.`,
          `Root Cause Statement: Lack of automated GRC workflow coupling policy approval with department sprint planning.`
        ],
        rootCauseStatement: `Lack of automated GRC workflow coupling policy approval with department sprint planning.`
      },
      capaPlan: {
        correctiveAction: `Draft and operationalize standard operating procedure for ${req.title} with technical guardrail integration.`,
        preventiveAction: `Incorporate policy review into quarterly department operational reviews and require CI/CD/MDM automation hook.`,
        owner: req.assignedOwner || dept.leadOwner,
        targetDate: '2026-10-15',
        evidenceRequired: `Approved SOP document v1.0 and initial 30 days of execution logs.`
      },
      implementationNotes: `Raised from Department Policy Analyzer to satisfy ISO 27001 Clause 10.1 corrective action tracking.`,
      status: 'CAPA Submitted'
    });

    setLoggedCAPAs(prev => ({ ...prev, [key]: true }));
    logAuditEvent('CREATE', 'Findings & CAPA', `Logged CAPA for missing ${req.docCode} in ${dept.name}`);
  };

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>In-Scope Departments</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalInScope}</div>
          <div className="text-[11px] text-slate-400">Enforcing ISO 27001 Policies</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Policy Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{overallComplianceRate}%</div>
          <div className="text-[11px] text-slate-400">{compliantCount} of {totalRequirements} mapped policies approved</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Identified Policy Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{gapCount}</div>
          <div className="text-[11px] text-slate-400">Require SOP creation before Stage 1</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>In-Review SOPs</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{inReviewCount}</div>
          <div className="text-[11px] text-slate-400">Pending department lead sign-off</div>
        </div>
      </div>

      {/* Control Bar & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search department, policy, or owner..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Categories</option>
            <option value="Technology">Technology & DevOps</option>
            <option value="Risk & Security">Risk & Security</option>
            <option value="People & Operations">People & Operations</option>
            <option value="Corporate & Finance">Corporate & Finance</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={e => setSelectedTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Document Types</option>
            <option value="POLICY">Policies Only</option>
            <option value="SOP">SOPs & Procedures Only</option>
          </select>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'matrix' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cross-Matrix
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'cards' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Department Cards
            </button>
            <button
              onClick={() => setViewMode('gaps')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'gaps' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gap Remediation ({gapCount})
            </button>
          </div>

          {onAutoMapAll && (
            <button
              onClick={onAutoMapAll}
              className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Auto-map standard ISO 27001 policy baseline to all in-scope departments"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Map All</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: Interactive Policy Matrix */}
      {viewMode === 'matrix' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">ISO Policy & SOP Department Applicability Matrix</h3>
              <p className="text-[11px] text-slate-400">
                Cross-sectional mapping showing policy enforcement status across all in-scope departments. Click any cell to cycle compliance state.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Compliant</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>In Review</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Gap</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span>Exempt / N/A</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3 sticky left-0 z-20 bg-slate-950 min-w-[220px]">
                    Department / Lead Owner
                  </th>
                  <th className="p-3 text-center min-w-[90px]">
                    Compliance
                  </th>
                  {filteredPolicyCodes.map(pol => (
                    <th key={pol.docCode} className="p-3 min-w-[150px] border-l border-slate-800/80">
                      <div className="font-mono text-sky-400">{pol.docCode}</div>
                      <div className="text-[10px] text-slate-300 font-normal truncate max-w-[140px]" title={pol.title}>
                        {pol.title}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredDepts.map(dept => {
                  const reqs = dept.policyRequirements || [];
                  const compCount = reqs.filter(r => r.status === 'Compliant & Approved').length;
                  const deptRate = reqs.length > 0 ? Math.round((compCount / reqs.length) * 100) : 0;

                  return (
                    <tr key={dept.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 sticky left-0 z-10 bg-slate-900 border-r border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white flex items-center space-x-1.5">
                              <span>{dept.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {dept.leadOwner} ({dept.headcount} staff)
                            </div>
                          </div>
                          <button
                            onClick={() => onOpenDepartmentScope(dept)}
                            className="p-1 text-slate-400 hover:text-sky-400 rounded-md hover:bg-slate-800 transition"
                            title="Edit department scope & policies"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          deptRate >= 90
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : deptRate >= 70
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {deptRate}%
                        </span>
                      </td>

                      {filteredPolicyCodes.map(pol => {
                        const match = reqs.find(r => r.docCode === pol.docCode);
                        const status = match?.status;

                        const cycleStatus = () => {
                          if (!match) return;
                          const order: DepartmentPolicyRequirement['status'][] = [
                            'Compliant & Approved',
                            'In Review',
                            'Gap - Required',
                            'Exempt'
                          ];
                          const nextIdx = (order.indexOf(match.status) + 1) % order.length;
                          onUpdatePolicyStatus(dept.id, match.id, order[nextIdx]);
                        };

                        return (
                          <td
                            key={pol.docCode}
                            onClick={cycleStatus}
                            className="p-2.5 border-l border-slate-800/80 cursor-pointer hover:bg-slate-800/60 transition"
                            title={match ? `${pol.title}: ${status}. Click to cycle status.` : 'Not assigned to this department'}
                          >
                            {match ? (
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    status === 'Compliant & Approved'
                                      ? 'bg-emerald-400 ring-2 ring-emerald-400/20'
                                      : status === 'In Review'
                                      ? 'bg-amber-400 ring-2 ring-amber-400/20'
                                      : status === 'Gap - Required'
                                      ? 'bg-rose-400 ring-2 ring-rose-400/20'
                                      : 'bg-slate-600'
                                  }`}
                                />
                                <span className={`text-[10px] font-semibold truncate ${
                                  status === 'Compliant & Approved'
                                    ? 'text-emerald-300'
                                    : status === 'In Review'
                                    ? 'text-amber-300'
                                    : status === 'Gap - Required'
                                    ? 'text-rose-300'
                                    : 'text-slate-500'
                                }`}>
                                  {status === 'Compliant & Approved' ? 'Approved' : status === 'In Review' ? 'In Review' : status === 'Gap - Required' ? 'Gap' : 'Exempt'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Department Cards Drilldown */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDepts.map(dept => {
            const reqs = dept.policyRequirements || [];
            const compliant = reqs.filter(r => r.status === 'Compliant & Approved').length;
            const gaps = reqs.filter(r => r.status === 'Gap - Required').length;
            const inRev = reqs.filter(r => r.status === 'In Review').length;
            const rate = reqs.length > 0 ? Math.round((compliant / reqs.length) * 100) : 0;

            return (
              <div
                key={dept.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                        {dept.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">{dept.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Lead: <strong className="text-slate-200">{dept.leadOwner}</strong> • {dept.headcount} staff
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        rate >= 90
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : rate >= 70
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {rate}% Compliant
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Policy Implementation Status</span>
                      <span>{compliant} of {reqs.length} Policies Approved</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${rate}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${(inRev / (reqs.length || 1)) * 100}%` }} className="bg-amber-500 h-full" />
                      <div style={{ width: `${(gaps / (reqs.length || 1)) * 100}%` }} className="bg-rose-500 h-full" />
                    </div>
                  </div>

                  {/* Policy Pills */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Assigned ISMS Policies & SOPs ({reqs.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {reqs.map(r => (
                        <span
                          key={r.id}
                          className={`text-[10px] px-2 py-1 rounded-lg font-medium border flex items-center space-x-1 ${
                            r.status === 'Compliant & Approved'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                              : r.status === 'Gap - Required'
                              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                              : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                          }`}
                          title={`${r.title} (${r.status})`}
                        >
                          <span className="font-mono font-bold">{r.docCode}</span>
                          <span className="truncate max-w-[120px]">{r.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    CMMI Level {dept.maturityLevel || 4} Maturity
                  </span>
                  <button
                    onClick={() => onOpenDepartmentScope(dept)}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1 transition shadow-xs"
                  >
                    <span>Configure Scope & Policies</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: Gap Remediation Priority Roadmap */}
      {viewMode === 'gaps' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Identified Departmental Policy & SOP Gaps</h3>
              <p className="text-xs text-slate-400">
                The following standard policies or SOPs are designated as &quot;Gap - Required&quot; and must be drafted or approved before external audit.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
              {gapCount} Actionable Gaps
            </span>
          </div>

          <div className="space-y-3">
            {inScopeDepts.flatMap(dept =>
              (dept.policyRequirements || [])
                .filter(r => r.status === 'Gap - Required')
                .map(r => ({ dept, req: r }))
            ).map(({ dept, req }, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-rose-400">{req.docCode}</span>
                    <span className="text-xs font-bold text-white">{req.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {dept.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Required for: <strong className="text-slate-300">{req.isoClause} ({req.annexAControl})</strong> • Assigned Lead: <span className="text-sky-300">{req.assignedOwner || dept.leadOwner}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleLogGapCAPA(dept, req)}
                    disabled={loggedCAPAs[`${dept.id}_${req.id}`]}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
                      loggedCAPAs[`${dept.id}_${req.id}`]
                        ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                        : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 cursor-pointer'
                    }`}
                    title="Log an official ISO 27001 Clause 10.1 corrective action finding"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{loggedCAPAs[`${dept.id}_${req.id}`] ? 'CAPA Logged' : 'Log CAPA'}</span>
                  </button>
                  <button
                    onClick={() => onUpdatePolicyStatus(dept.id, req.id, 'Compliant & Approved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Approved</span>
                  </button>
                  <button
                    onClick={() => onOpenDepartmentScope(dept)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Open Scope
                  </button>
                </div>
              </div>
            ))}

            {gapCount === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-300">Zero Policy Gaps Detected!</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  All in-scope departments have 100% compliant and approved ISO/IEC 27001 policies and operating procedures.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
