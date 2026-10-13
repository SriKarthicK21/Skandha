import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Download,
  Printer,
  Search,
  ChevronRight,
  ChevronDown,
  Calculator,
  MessageSquare,
  Sparkles,
  Building,
  Cpu,
  Users,
  Briefcase,
  Scale,
  Truck,
  Eye,
  Layers,
  Copy,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import {
  DEPARTMENT_AUDIT_CHECKLISTS,
  DepartmentAuditProfile,
  DepartmentPBCItem,
  computeDepartmentAuditMetrics
} from '../../data/departmentAuditChecklists';

interface Props {
  initialDepartmentId?: string;
  onNavigateToEvidence?: (evidenceId?: string) => void;
}

export const DepartmentAuditChecklistHub: React.FC<Props> = ({
  initialDepartmentId = 'dept_it',
  onNavigateToEvidence
}) => {
  // Navigation & Filter States
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartmentId);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeLens, setActiveLens] = useState<'AUDITOR' | 'IMPLEMENTER'>('AUDITOR');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Expanded PBC row IDs
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Status tracking state (with localStorage persistence)
  const [itemStatuses, setItemStatuses] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('grc_department_pbc_statuses');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initial: Record<string, string> = {};
    DEPARTMENT_AUDIT_CHECKLISTS.forEach(dept => {
      dept.pbcItems.forEach(item => {
        initial[item.id] = item.defaultStatus;
      });
    });
    return initial;
  });

  const updateItemStatus = (itemId: string, newStatus: string) => {
    setItemStatuses(prev => {
      const updated = { ...prev, [itemId]: newStatus };
      try {
        localStorage.setItem('grc_department_pbc_statuses', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Modals
  const [showSamplingModal, setShowSamplingModal] = useState<boolean>(false);
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [showBriefingSheet, setShowBriefingSheet] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sampling calculator state
  const [sampleControlFrequency, setSampleControlFrequency] = useState<'ANNUAL' | 'QUARTERLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY'>('DAILY');
  const [samplePopulation, setSamplePopulation] = useState<number>(365);
  const [sampleTestLevel, setSampleTestLevel] = useState<'STANDARD' | 'HIGH_SCRUTINY'>('STANDARD');

  // Interview Simulator state
  const [interviewStep, setInterviewStep] = useState<number>(0);
  const [userSpokenAnswer, setUserSpokenAnswer] = useState<string>('');
  const [revealedModelAnswer, setRevealedModelAnswer] = useState<boolean>(false);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return DEPARTMENT_AUDIT_CHECKLISTS.filter(dept => {
      if (categoryFilter !== 'ALL' && dept.category !== categoryFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = dept.departmentName.toLowerCase().includes(term);
        const matchesHead = dept.headRole.toLowerCase().includes(term);
        const matchesPBC = dept.pbcItems.some(i => 
          i.title.toLowerCase().includes(term) || 
          i.description.toLowerCase().includes(term) ||
          i.standardMappings.some(s => s.standard.toLowerCase().includes(term) || s.clauseOrControl.toLowerCase().includes(term))
        );
        return matchesName || matchesHead || matchesPBC;
      }
      return true;
    });
  }, [categoryFilter, searchTerm]);

  // Currently selected department profile
  const currentDept: DepartmentAuditProfile = useMemo(() => {
    return (
      DEPARTMENT_AUDIT_CHECKLISTS.find(d => d.departmentId === selectedDeptId) ||
      DEPARTMENT_AUDIT_CHECKLISTS[0]
    );
  }, [selectedDeptId]);

  // Metrics
  const globalMetrics = useMemo(() => {
    return computeDepartmentAuditMetrics(itemStatuses);
  }, [itemStatuses]);

  // Dept specific metrics
  const currentDeptMetrics = useMemo(() => {
    const total = currentDept.pbcItems.length;
    let verified = 0;
    let prepared = 0;
    let inProgress = 0;
    let missing = 0;

    currentDept.pbcItems.forEach(i => {
      const st = itemStatuses[i.id] || i.defaultStatus;
      if (st === 'Verified & Submitted') verified++;
      else if (st === 'Prepared') prepared++;
      else if (st === 'In Progress') inProgress++;
      else if (st === 'Missing / Gap') missing++;
    });

    const score = total > 0 ? Math.round(((verified + prepared * 0.8 + inProgress * 0.4) / total) * 100) : 0;
    return { total, verified, prepared, inProgress, missing, score };
  }, [currentDept, itemStatuses]);

  // Filtered PBC items for current department
  const filteredPBCItems = useMemo(() => {
    return currentDept.pbcItems.filter(item => {
      if (selectedStatusFilter !== 'ALL') {
        const status = itemStatuses[item.id] || item.defaultStatus;
        if (status !== selectedStatusFilter) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(term);
        const matchesDesc = item.description.toLowerCase().includes(term);
        const matchesCode = item.code.toLowerCase().includes(term);
        const matchesStandards = item.standardMappings.some(
          s => s.standard.toLowerCase().includes(term) || s.clauseOrControl.toLowerCase().includes(term)
        );
        return matchesTitle || matchesDesc || matchesCode || matchesStandards;
      }
      return true;
    });
  }, [currentDept, selectedStatusFilter, searchTerm, itemStatuses]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Department',
      'PBC Code',
      'Title',
      'Type',
      'Format',
      'Cadence',
      'Sample Size',
      'Standards',
      'Status',
      'Auditor Testing Procedure',
      'Deficiency Severity'
    ];

    const rows: string[][] = [];
    DEPARTMENT_AUDIT_CHECKLISTS.forEach(dept => {
      dept.pbcItems.forEach(item => {
        const st = itemStatuses[item.id] || item.defaultStatus;
        const stds = item.standardMappings.map(s => `${s.standard} (${s.clauseOrControl})`).join('; ');
        rows.push([
          dept.departmentName,
          item.code,
          `"${item.title.replace(/"/g, '""')}"`,
          item.itemType,
          `"${item.requiredFormat.replace(/"/g, '""')}"`,
          item.submissionCadence,
          `"${item.minimumSampleSize.replace(/"/g, '""')}"`,
          `"${stds.replace(/"/g, '""')}"`,
          st,
          `"${item.auditorTestingProcedure.replace(/"/g, '""')}"`,
          item.deficiencySeverityIfMissing
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `External_Audit_PBC_Master_Checklist_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for department icon
  const getDeptIcon = (category: string) => {
    switch (category) {
      case 'Technology': return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'Risk & Security': return <ShieldCheck className="w-5 h-5 text-rose-400" />;
      case 'People & Operations': return <Users className="w-5 h-5 text-amber-400" />;
      case 'Corporate & Finance': return <Scale className="w-5 h-5 text-indigo-400" />;
      case 'Commercial & Growth': return <Briefcase className="w-5 h-5 text-emerald-400" />;
      default: return <Building className="w-5 h-5 text-slate-400" />;
    }
  };

  // Helper for scrutiny badge
  const getScrutinyBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL_HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">CRITICAL SCRUTINY</span>;
      case 'VERY_HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">VERY HIGH SCRUTINY</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">HIGH SCRUTINY</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-500/20 text-slate-300 border border-slate-500/30">STANDARD SCRUTINY</span>;
    }
  };

  // Helper for status styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified & Submitted':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified & Submitted</span>;
      case 'Prepared':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-sky-400" /> Prepared for Audit</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> In Progress</span>;
      case 'Missing / Gap':
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> Missing / Gap</span>;
    }
  };

  // Sampling calculation formula
  const calculatedSampleSize = useMemo(() => {
    if (sampleControlFrequency === 'ANNUAL') return 1;
    if (sampleControlFrequency === 'QUARTERLY') return sampleTestLevel === 'HIGH_SCRUTINY' ? 4 : 2;
    if (sampleControlFrequency === 'MONTHLY') return sampleTestLevel === 'HIGH_SCRUTINY' ? 5 : 2;
    if (sampleControlFrequency === 'WEEKLY') return sampleTestLevel === 'HIGH_SCRUTINY' ? 15 : 10;
    // Daily
    if (sampleTestLevel === 'HIGH_SCRUTINY') return Math.min(45, Math.max(25, Math.round(samplePopulation * 0.1)));
    return Math.min(25, Math.max(15, Math.round(samplePopulation * 0.05)));
  }, [sampleControlFrequency, samplePopulation, sampleTestLevel]);

  return (
    <div className="space-y-6" id="department-external-audit-center">
      {/* Top Header & Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-lg">
                <ShieldCheck className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  Department-Wise External Auditor Checklists & PBC Center
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    Big 4 & Certification Body Ready
                  </span>
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                  Comprehensive Provided-By-Client (PBC) requirements, inquiry protocols, live demonstration artifacts,
                  and common audit deficiency triggers for <strong>each and every enterprise department</strong> undergoing
                  ISO 27001:2022, SOC 2 Type II, ISO 42001, and MAS TRM audits.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSamplingModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors shadow-sm"
              title="ISO 19011 & AICPA Statistical Sampling Calculator"
            >
              <Calculator className="w-4 h-4 text-sky-400" />
              Sampling Calculator
            </button>
            <button
              onClick={() => setShowInterviewModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors shadow-sm"
              title="Practice simulated tough auditor interviews"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Interview Simulator
            </button>
            <button
              onClick={() => setShowBriefingSheet(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-colors shadow-md"
              title="Printable Department Audit Briefing Sheet"
            >
              <Printer className="w-4 h-4" />
              Department Briefing Sheet
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors shadow-sm"
              title="Export complete master checklist as CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export All PBC (CSV)
            </button>
          </div>
        </div>

        {/* Global Metric Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 font-medium">Total Departments</div>
            <div className="text-xl font-bold text-white mt-0.5">{globalMetrics.totalDepartments} Scoped</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 font-medium">Master PBC Items</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{globalMetrics.totalPBCItems} Artifacts</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 font-medium">Verified & Submitted</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{globalMetrics.verifiedItems} Items</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 font-medium">Prepared for Review</div>
            <div className="text-xl font-bold text-sky-300 mt-0.5">{globalMetrics.preparedItems} Items</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
            <div className="text-slate-400 font-medium">Audit Gaps / Missing</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{globalMetrics.missingItems} Open</div>
          </div>
          <div className="p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/30">
            <div className="text-indigo-300 font-medium">Audit Readiness Score</div>
            <div className="text-xl font-bold text-indigo-200 mt-0.5">{globalMetrics.readinessScore}% Big 4 Ready</div>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Department Browser Sidebar + Right Department Detail Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Department List with Search & Category Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search department, role, PBC..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'Technology', label: 'Tech' },
                { id: 'Risk & Security', label: 'Security' },
                { id: 'People & Operations', label: 'People' },
                { id: 'Corporate & Finance', label: 'Finance' },
                { id: 'Commercial & Growth', label: 'Commercial' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Department Cards List */}
          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredDepartments.map(dept => {
              const isSelected = dept.departmentId === selectedDeptId;

              // Compute dept stats
              let readyCount = 0;
              dept.pbcItems.forEach(i => {
                const st = itemStatuses[i.id] || i.defaultStatus;
                if (st === 'Verified & Submitted' || st === 'Prepared') readyCount++;
              });
              const pct = dept.pbcItems.length > 0 ? Math.round((readyCount / dept.pbcItems.length) * 100) : 0;

              return (
                <button
                  key={dept.departmentId}
                  onClick={() => setSelectedDeptId(dept.departmentId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 bg-slate-800 rounded-lg border border-slate-700/60 shrink-0 mt-0.5">
                    {getDeptIcon(dept.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {dept.shortName}
                      </h3>
                      {getScrutinyBadge(dept.leadAuditorScrutinyLevel)}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {dept.headRole}
                    </p>
                    
                    {/* Progress Bar & Item count */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{dept.pbcItems.length} PBC Requirements</span>
                      <span className={pct >= 80 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                        {pct}% Ready
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Department Detailed PBC & Auditor Blueprint (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Department Overview Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {currentDept.category}
                  </span>
                  {getScrutinyBadge(currentDept.leadAuditorScrutinyLevel)}
                  <span className="text-xs text-slate-400">
                    Target Auditee: <strong className="text-slate-200">{currentDept.headRole}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                  {currentDept.departmentName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                  <span>Additional Auditees:</span>
                  {currentDept.auditeeRoles.map((role, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-800/80 rounded text-slate-300 border border-slate-700/60">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Department Readiness Mini Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-right shrink-0">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Department Readiness</div>
                <div className="text-2xl font-bold text-indigo-300 mt-0.5">{currentDeptMetrics.score}%</div>
                <div className="text-[10px] text-slate-400">
                  {currentDeptMetrics.verified + currentDeptMetrics.prepared} of {currentDeptMetrics.total} Items Ready
                </div>
              </div>
            </div>

            {/* Applicable Standards Tags */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Mandated Standards in Scope:
              </span>
              {currentDept.mandatedStandards.map((std, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                  {std}
                </span>
              ))}
            </div>
          </div>

          {/* Dual Perspective Lens Switcher & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
            {/* Perspective Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveLens('AUDITOR')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeLens === 'AUDITOR'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Auditor Lens (Big 4 Testing Protocol)
              </button>
              <button
                onClick={() => setActiveLens('IMPLEMENTER')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeLens === 'IMPLEMENTER'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Client Implementer Lens (Preparation Guide)
              </button>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Verified & Submitted">Verified & Submitted</option>
                <option value="Prepared">Prepared for Audit</option>
                <option value="In Progress">In Progress</option>
                <option value="Missing / Gap">Missing / Gap</option>
              </select>
            </div>
          </div>

          {/* Provided-By-Client (PBC) Evidence Checklist Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Provided By Client (PBC) Evidence Items ({filteredPBCItems.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Specific documentary records, technical configs, and sign-offs requested for {currentDept.shortName}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                Click any item to view {activeLens === 'AUDITOR' ? 'Auditor Testing Protocol' : 'Packaging Guide'}
              </span>
            </div>

            {/* PBC Item Rows */}
            <div className="divide-y divide-slate-800/70">
              {filteredPBCItems.map(item => {
                const currentStatus = itemStatuses[item.id] || item.defaultStatus;
                const isExpanded = expandedRowId === item.id;

                return (
                  <div key={item.id} className="transition-colors hover:bg-slate-800/30">
                    <div
                      className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                      onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                            {item.code}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/60">
                            {item.itemType}
                          </span>
                          <span className="text-xs text-slate-400">
                            Cadence: <strong>{item.submissionCadence}</strong>
                          </span>
                          <span className="text-xs text-slate-400">
                            Sample: <strong>{item.minimumSampleSize}</strong>
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Right Controls: Status & Expand Chevron */}
                      <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                        <select
                          value={currentStatus}
                          onChange={e => updateItemStatus(item.id, e.target.value)}
                          className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border focus:outline-none transition-colors ${
                            currentStatus === 'Verified & Submitted'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : currentStatus === 'Prepared'
                              ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                              : currentStatus === 'In Progress'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          <option value="Verified & Submitted">Verified & Submitted</option>
                          <option value="Prepared">Prepared for Audit</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Missing / Gap">Missing / Gap</option>
                        </select>

                        <button
                          onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Drawer Details */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-4">
                        {/* Standard Crosswalk Chips */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400 font-semibold">Standard Crosswalk:</span>
                          {item.standardMappings.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs rounded bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
                              {s.standard} → {s.clauseOrControl}
                            </span>
                          ))}
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ml-auto ${
                            item.deficiencySeverityIfMissing.includes('Major')
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            If Missing: {item.deficiencySeverityIfMissing}
                          </span>
                        </div>

                        {/* Dual Lens Content */}
                        {activeLens === 'AUDITOR' ? (
                          <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-lg space-y-2">
                            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-rose-400" />
                              Lead Auditor Testing Procedure & Inspection Protocols:
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {item.auditorTestingProcedure}
                            </p>
                            <div className="text-xs text-slate-400 pt-1 flex items-center justify-between">
                              <span>Mandatory Testing Format: <strong className="text-slate-200">{item.requiredFormat}</strong></span>
                              <span>Sampling Rule: <strong className="text-slate-200">{item.minimumSampleSize}</strong></span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-sky-950/20 border border-sky-500/20 rounded-lg space-y-2">
                            <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-sky-400" />
                              Chief Implementer Packaging & Submission Tip:
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {item.implementerTip}
                            </p>
                            <div className="text-xs text-slate-400 pt-1 flex items-center justify-between">
                              <span>Required Deliverable Format: <strong className="text-slate-200">{item.requiredFormat}</strong></span>
                              <span>Review Cycle: <strong className="text-slate-200">{item.submissionCadence}</strong></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Auditor Inquiry & Walkthrough Protocol Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Auditor Walkthrough Scope & Inquiry Topics for {currentDept.shortName}
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {currentDept.auditorWalkthroughScope}
              </p>
            </div>

            {/* Key Inquiry Questions */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Top Auditor Interview Questions During Walkthrough:
              </div>
              <div className="space-y-2">
                {currentDept.keyInquiryQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 font-medium">
                      "{q}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Demonstration Requirements */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Mandatory Live System Demonstrations (Shared Screens):
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentDept.liveDemonstrationRequirements.map((demo, idx) => (
                  <li key={idx} className="p-2.5 bg-slate-950/70 border border-slate-800/70 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{demo}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fatal Traps Callout Box */}
            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-2">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Top Audit Traps & Common Non-Conformity Triggers to Avoid:
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc pl-5">
                {currentDept.commonAuditTrapsAndRedFlags.map((trap, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <strong className="text-rose-200">{trap}</strong>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exemplary Interview Simulation Block */}
            {currentDept.sampleInterviewQA && currentDept.sampleInterviewQA.length > 0 && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Model Auditor Q&A Simulation ({currentDept.sampleInterviewQA[0].targetRole})
                  </span>
                  <button
                    onClick={() => handleCopy(currentDept.sampleInterviewQA[0].modelAnswer, 'qa-model')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedText === 'qa-model' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Model Answer
                  </button>
                </div>

                <div className="text-xs text-slate-200 font-semibold bg-slate-900 p-2.5 rounded border border-slate-800">
                  Q: "{currentDept.sampleInterviewQA[0].question}"
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded space-y-1">
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Model Exemplary Response:
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      "{currentDept.sampleInterviewQA[0].modelAnswer}"
                    </p>
                  </div>

                  <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded space-y-1">
                    <div className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" /> Fatal Trap Answer (Never Say):
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      "{currentDept.sampleInterviewQA[0].fatalTrapAnswer}"
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>Mandatory Backing Artifact:</span>
                  <span className="font-mono text-indigo-300 font-semibold">
                    {currentDept.sampleInterviewQA[0].backingArtifact}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ISO 19011 & AICPA Sampling Calculator Modal */}
      {showSamplingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Calculator className="w-5 h-5 text-sky-400" />
                ISO 19011 & AICPA Audit Sampling Calculator
              </div>
              <button
                onClick={() => setShowSamplingModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              External auditors apply standardized sample sizing rules based on control frequency and population.
              Use this tool to determine how many sample records the auditor will request from your department.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Control Execution Frequency:</label>
                <select
                  value={sampleControlFrequency}
                  onChange={e => setSampleControlFrequency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="ANNUAL">Annual Control (e.g. BCP Drill, Board MRM, Pentest)</option>
                  <option value="QUARTERLY">Quarterly Control (e.g. Access Recertification, Vulnerability Scan)</option>
                  <option value="MONTHLY">Monthly Control (e.g. Phishing simulation, Patch review)</option>
                  <option value="WEEKLY">Weekly Control (e.g. Change Advisory Board approvals)</option>
                  <option value="DAILY">Daily / Continuous (e.g. Pull requests, Offboarding, Deployments)</option>
                </select>
              </div>

              {sampleControlFrequency === 'DAILY' && (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Estimated Annual Population Size:</label>
                  <input
                    type="number"
                    value={samplePopulation}
                    onChange={e => setSamplePopulation(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Audit Scrutiny Level:</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="scrutiny"
                      checked={sampleTestLevel === 'STANDARD'}
                      onChange={() => setSampleTestLevel('STANDARD')}
                    />
                    Standard Testing (AICPA Sample Table)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="scrutiny"
                      checked={sampleTestLevel === 'HIGH_SCRUTINY'}
                      onChange={() => setSampleTestLevel('HIGH_SCRUTINY')}
                    />
                    High Scrutiny / Prior Deficiency (Expanded Sample)
                  </label>
                </div>
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-lg text-center space-y-1">
              <div className="text-xs text-sky-300 font-semibold uppercase tracking-wider">Required Auditor Sample Size</div>
              <div className="text-3xl font-bold text-white">{calculatedSampleSize} Records</div>
              <p className="text-[11px] text-slate-300 mt-1">
                The lead auditor will select <strong>{calculatedSampleSize} random samples</strong> across the 12-month period to test operating effectiveness without a single deviation.
              </p>
            </div>

            <button
              onClick={() => setShowSamplingModal(false)}
              className="w-full py-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* Mock Interview Simulator Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Auditor Interview Simulator: {currentDept.shortName}
              </div>
              <button
                onClick={() => {
                  setShowInterviewModal(false);
                  setRevealedModelAnswer(false);
                  setUserSpokenAnswer('');
                }}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs text-purple-200">
              Lead Auditor Question for <strong>{currentDept.headRole}</strong>:
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-sm font-semibold text-white">
              "{currentDept.sampleInterviewQA[0]?.question || currentDept.keyInquiryQuestions[0]}"
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Type your proposed answer (how you would explain this to the auditor):
              </label>
              <textarea
                rows={3}
                value={userSpokenAnswer}
                onChange={e => setUserSpokenAnswer(e.target.value)}
                placeholder="We enforce this by..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {!revealedModelAnswer ? (
              <button
                onClick={() => setRevealedModelAnswer(true)}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Compare with Big 4 Model Answer
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Benchmark Model Answer:
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    "{currentDept.sampleInterviewQA[0]?.modelAnswer}"
                  </p>
                </div>

                <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-xs space-y-1">
                  <div className="text-rose-400 font-bold flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" /> Fatal Audit Trap (What Never to Say):
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    "{currentDept.sampleInterviewQA[0]?.fatalTrapAnswer}"
                  </p>
                </div>

                <div className="text-xs text-slate-400 pt-1">
                  Mandatory Backing Artifact: <strong className="text-indigo-300">{currentDept.sampleInterviewQA[0]?.backingArtifact}</strong>
                </div>

                <button
                  onClick={() => {
                    setRevealedModelAnswer(false);
                    setUserSpokenAnswer('');
                  }}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Reset & Try Another Answer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Department Briefing Sheet Modal */}
      {showBriefingSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Printer className="w-5 h-5 text-indigo-400" />
                Department Audit Briefing Sheet: {currentDept.departmentName}
              </div>
              <button
                onClick={() => setShowBriefingSheet(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-indigo-200 text-xs leading-relaxed">
              <strong>Instructions for Auditee:</strong> Hand this briefing sheet to <strong>{currentDept.headRole}</strong> 30 minutes before the external auditor interview. Review all PBC items and ensure required demonstration screens are open in browser tabs.
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                1. Scrutiny Level & Mandated Standards:
              </div>
              <p className="text-slate-300">
                Level: {currentDept.leadAuditorScrutinyLevel} | Standards: {currentDept.mandatedStandards.join(', ')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                2. Mandatory Screens to Have Ready (Live Walkthrough):
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {currentDept.liveDemonstrationRequirements.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                3. Provided-By-Client (PBC) Documents on File:
              </div>
              <div className="space-y-1.5">
                {currentDept.pbcItems.map((p, i) => (
                  <div key={i} className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-white">{p.code}: {p.title}</strong>
                      <div className="text-slate-400 text-[10px]">{p.requiredFormat} | Sample: {p.minimumSampleSize}</div>
                    </div>
                    {getStatusBadge(itemStatuses[p.id] || p.defaultStatus)}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-rose-300 uppercase tracking-wider text-[11px]">
                4. Audit Traps & What NOT to Say:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-rose-200">
                {currentDept.commonAuditTrapsAndRedFlags.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
              <button
                onClick={() => setShowBriefingSheet(false)}
                className="px-4 py-2.5 font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
