import React, { useState, useMemo } from 'react';
import { DepartmentScopeProfile, DepartmentPolicyRequirement } from '../../types';
import { COMPLIANCE_GUIDELINES } from '../../data/complianceGuidelinesMasterData';
import {
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Shield,
  Layers,
  Users,
  Server,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Edit2,
  Plus,
  Printer,
  ChevronRight,
  TrendingUp,
  Globe,
  Database,
  MapPin,
  Lock,
  Tag,
  Check,
  X
} from 'lucide-react';

interface Props {
  departmentScopes: DepartmentScopeProfile[];
  onOpenEditModal: (dept: DepartmentScopeProfile) => void;
  onUpdatePolicyStatus: (deptId: string, policyReqId: string, newStatus: DepartmentPolicyRequirement['status']) => void;
  onAutoMapPolicies?: (deptId?: string) => void;
  onOpenGuidelines?: (frameworkId?: string) => void;
}

export const DepartmentOverviewView: React.FC<Props> = ({
  departmentScopes,
  onOpenEditModal,
  onUpdatePolicyStatus,
  onAutoMapPolicies,
  onOpenGuidelines
}) => {
  // State for search, category filter, and selected department
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    departmentScopes[0]?.id || ''
  );
  const [policyStatusFilter, setPolicyStatusFilter] = useState<'All' | 'Compliant & Approved' | 'In Review' | 'Gap - Required'>('All');
  const [showAddProcessModal, setShowAddProcessModal] = useState(false);
  const [newProcessName, setNewProcessName] = useState('');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');

  // Filtered departments list
  const filteredDepartments = useMemo(() => {
    return departmentScopes.filter(dept => {
      const matchesCategory = selectedCategory === 'All' || dept.category === selectedCategory;
      const matchesSearch =
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.leadOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.coreProcesses || []).some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dept.criticalAssetsAndSystems || []).some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [departmentScopes, selectedCategory, searchTerm]);

  // Currently focused department
  const currentDept = useMemo(() => {
    return (
      departmentScopes.find(d => d.id === selectedDeptId) ||
      filteredDepartments[0] ||
      departmentScopes[0]
    );
  }, [departmentScopes, selectedDeptId, filteredDepartments]);

  // Policy statistics for current department
  const currentPolicies = currentDept?.policyRequirements || [];
  const compliantPolicies = currentPolicies.filter(p => p.status === 'Compliant & Approved');
  const inReviewPolicies = currentPolicies.filter(p => p.status === 'In Review');
  const gapPolicies = currentPolicies.filter(p => p.status === 'Gap - Required');
  const complianceRate = currentPolicies.length > 0
    ? Math.round((compliantPolicies.length / currentPolicies.length) * 100)
    : 0;

  // Filtered policies based on status filter
  const displayedPolicies = useMemo(() => {
    if (policyStatusFilter === 'All') return currentPolicies;
    return currentPolicies.filter(p => p.status === policyStatusFilter);
  }, [currentPolicies, policyStatusFilter]);

  // Derive which framework guidelines apply to this department
  const relevantFrameworks = useMemo(() => {
    const isTech = currentDept?.category === 'Technology';
    const isSec = currentDept?.category === 'Risk & Security';
    const isPeople = currentDept?.category === 'People & Operations';
    const isLegal = currentDept?.category === 'Corporate & Finance';

    return COMPLIANCE_GUIDELINES.map(fw => {
      let deptDuties: string[] = [];
      if (isTech) deptDuties = fw.departmentalGuidelines.engineeringDevOps;
      else if (isSec) deptDuties = fw.departmentalGuidelines.infosecRisk;
      else if (isPeople) deptDuties = fw.departmentalGuidelines.peopleHr;
      else if (isLegal) deptDuties = fw.departmentalGuidelines.legalFinance;
      else deptDuties = fw.departmentalGuidelines.executiveBoard;

      return {
        ...fw,
        dutiesForThisDept: deptDuties
      };
    });
  }, [currentDept]);

  if (!currentDept) {
    return (
      <div className="p-8 text-center text-slate-400">
        No department profiles found. Please enter department scopes first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filter, and Department Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search departments, processes, assets..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Categories</option>
            <option value="Technology">Technology & Cloud Engineering</option>
            <option value="Risk & Security">Information Security & Risk</option>
            <option value="People & Operations">People & Operations</option>
            <option value="Corporate & Finance">Corporate, Finance & Legal</option>
            <option value="Commercial & Growth">Commercial & Growth</option>
          </select>
        </div>

        {/* Selected Department Switcher Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Inspecting:</span>
          <select
            value={currentDept.id}
            onChange={e => setSelectedDeptId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-950/60 border border-sky-600/50 text-sky-300 focus:outline-none focus:border-sky-400 shadow-sm"
          >
            {filteredDepartments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Select Carousel / Horizontal Cards for All Departments */}
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredDepartments.map(dept => {
          const reqs = dept.policyRequirements || [];
          const comp = reqs.filter(r => r.status === 'Compliant & Approved').length;
          const pct = reqs.length > 0 ? Math.round((comp / reqs.length) * 100) : 0;
          const isSelected = dept.id === currentDept.id;
          const statusClass =
            pct >= 80
              ? 'status-compliant'
              : pct >= 50
              ? 'status-attention'
              : 'status-lagging';

          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`dept-card-interactive ${statusClass} min-w-[230px] p-3.5 rounded-xl border text-left shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800/80">
                  {dept.category.split(' ')[0]}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  pct >= 80 ? 'bg-emerald-500/20 text-emerald-300' : pct >= 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {pct}% Comp
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{dept.name}</h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Lead: {dept.leadOwner} • {dept.headcount} staff
              </p>
              <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Department Breakdown Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-800">
                {currentDept.category}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                currentDept.isInScope
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {currentDept.isInScope ? 'Included in ISMS Scope (Clause 4.3)' : 'Formally Excluded from Scope'}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                CMMI Maturity: Level {currentDept.maturityLevel || 3} of 5
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
              <Building2 className="w-6 h-6 text-sky-400" />
              <span>{currentDept.name}</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              <strong className="text-slate-200">Clause 4.3 Scope Boundary:</strong> {currentDept.scopeBoundary}
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenEditModal(currentDept)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-sky-600/20"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Department Scope</span>
            </button>

            {onAutoMapPolicies && (
              <button
                onClick={() => onAutoMapPolicies(currentDept.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
                title="Auto-map required ISO policies to this department"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Auto-Map Policies</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Audit Summary</span>
            </button>
          </div>
        </div>

        {/* Operational Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Department Lead</span>
              <Users className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-sm font-bold text-white truncate">{currentDept.leadOwner}</div>
            <span className="text-[10px] text-slate-400">{currentDept.headcount} Personnel (Clause 7.2)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Core Processes</span>
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-sm font-bold text-indigo-300">
              {(currentDept.coreProcesses || []).length} Business Procedures
            </div>
            <span className="text-[10px] text-slate-400">Clause 8.1 Operations</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Critical Systems</span>
              <Server className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-amber-300">
              {(currentDept.criticalAssetsAndSystems || []).length} Tech Assets
            </div>
            <span className="text-[10px] text-slate-400">Annex A.5.9 Inventory</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Policy Compliance</span>
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-emerald-400 flex items-center space-x-1">
              <span>{complianceRate}%</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({compliantPolicies.length}/{currentPolicies.length})
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {gapPolicies.length} Required Gaps
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Audit Readiness</span>
              <Shield className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-base font-bold text-sky-300">
              {currentDept.readinessScore || 85} / 100
            </div>
            <span className="text-[10px] text-emerald-400">Stage 2 Audit Ready</span>
          </div>
        </div>

        {/* Operating Environment & Classification Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 font-medium">Work Locations: </span>
              <span className="text-slate-200 font-semibold">
                {(currentDept.workLocations || []).join(' • ') || 'Remote (100% Cloud)'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 font-medium">Data Handled: </span>
              <span className="text-slate-200 font-semibold">
                {(currentDept.dataClassifications || []).join(', ') || 'Confidential, Internal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Linked Policies, Procedures & Compliance Status */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <span>Linked Policies, SOPs & ISO Compliance Status</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and update policies mandatory for {currentDept.name} under ISO 27001:2022 and ISO 42001:2023.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setPolicyStatusFilter('All')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                policyStatusFilter === 'All' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({currentPolicies.length})
            </button>
            <button
              onClick={() => setPolicyStatusFilter('Compliant & Approved')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                policyStatusFilter === 'Compliant & Approved'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Approved ({compliantPolicies.length})
            </button>
            <button
              onClick={() => setPolicyStatusFilter('In Review')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                policyStatusFilter === 'In Review'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              In Review ({inReviewPolicies.length})
            </button>
            <button
              onClick={() => setPolicyStatusFilter('Gap - Required')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                policyStatusFilter === 'Gap - Required'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Gaps ({gapPolicies.length})
            </button>
          </div>
        </div>

        {/* Policy Requirements Grid/Table */}
        {displayedPolicies.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800/80 text-slate-400 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No policies found matching filter "{policyStatusFilter}".</p>
            {onAutoMapPolicies && (
              <button
                onClick={() => onAutoMapPolicies(currentDept.id)}
                className="mt-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 transition cursor-pointer"
              >
                Auto-Link Standard Policies Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPolicies.map(policy => (
              <div
                key={policy.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                      {policy.docCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {policy.type}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/50 border border-indigo-900/60">
                      {policy.isoClause} • {policy.annexAControl}
                    </span>
                    {policy.mandatory && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                        Mandatory ISO Core
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">{policy.title}</h4>

                  <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Owner: <strong className="text-slate-300">{policy.assignedOwner}</strong></span>
                    <span>Version: <strong className="text-slate-300">{policy.version || 'v1.0'}</strong></span>
                    <span>Last Audit: <strong className="text-slate-300">{policy.lastAuditDate || '2026-08-15'}</strong></span>
                    <span>Next Review: <strong className="text-slate-300">{policy.nextReviewDate || '2027-08-15'}</strong></span>
                  </p>

                  {policy.implementationNotes && (
                    <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 mt-1 italic">
                      Evidence/Notes: {policy.implementationNotes}
                    </p>
                  )}
                </div>

                {/* Status Dropdown & Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
                  <select
                    value={policy.status}
                    onChange={e =>
                      onUpdatePolicyStatus(
                        currentDept.id,
                        policy.id,
                        e.target.value as DepartmentPolicyRequirement['status']
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition focus:outline-none cursor-pointer ${
                      policy.status === 'Compliant & Approved'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50'
                        : policy.status === 'In Review'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-600/50'
                        : policy.status === 'Gap - Required'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-600/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <option value="Compliant & Approved">✓ Compliant & Approved</option>
                    <option value="In Review">⏳ In Review</option>
                    <option value="Gap - Required">⚠ Gap - Required</option>
                    <option value="Exempt">✕ Exempt</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Core Processes (Clause 8.1) and Critical Systems (Annex A.5.9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Business Processes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Core Business Processes (Clause 8.1)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Key operational procedures managed by {currentDept.name}
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              {(currentDept.coreProcesses || []).length} Active
            </span>
          </div>

          <div className="space-y-2.5">
            {(currentDept.coreProcesses || []).map((process, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{process}</h5>
                    <p className="text-[10px] text-slate-400">Operational SLA: High Availability • ISO 8.1 Mapped</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Systems & Technology Assets */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span>Critical Systems & Tech Assets (A.5.9)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Primary cloud, database, code and vendor assets
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              {(currentDept.criticalAssetsAndSystems || []).length} Systems
            </span>
          </div>

          <div className="space-y-2.5">
            {(currentDept.criticalAssetsAndSystems || []).map((asset, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-[10px] font-bold text-amber-400">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{asset}</h5>
                    <p className="text-[10px] text-slate-400">Tier 1 Production Infrastructure • Encrypted At Rest</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/50">
                  Tier 1
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Threat Vectors & Operational Security Risk Profile */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Departmental Threat Vectors & Risk Profile (Clause 6.1.2)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Specific threat scenarios mapped to {currentDept.name} with mitigation controls
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
            {(currentDept.threatVectors || []).length} Threats Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(currentDept.threatVectors || []).map((threat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white">{threat}</h5>
                <p className="text-[11px] text-slate-400">
                  Controls: MFA, Zero-Standing Access, SIEM Monitoring, Regular Penetration Testing.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Mitigation Active
                  </span>
                  <span className="text-[9px] text-slate-500">Residual Risk: Low</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Multi-Regulatory Guidelines Alignment for This Department */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                Multi-Standard Harmonization
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                ISO 27001 • MAS TRM • DPDP • GDPR • NDPR
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>Regulatory Guidelines Specific to {currentDept.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact mandates and operational duties this department must observe across major global standards and laws.
            </p>
          </div>

          {onOpenGuidelines && (
            <button
              onClick={() => onOpenGuidelines()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
            >
              <span>Explore Master Guidelines</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Frameworks Duties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantFrameworks.slice(0, 4).map(fw => (
            <div
              key={fw.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-white">{fw.code}</span>
                  <span className="text-[10px] text-slate-400">({fw.jurisdiction})</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                  Incident: {fw.incidentNotificationWindow.authorityWindow.split(' ')[0]} {fw.incidentNotificationWindow.authorityWindow.split(' ')[1] || ''}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Mandatory Duties for {currentDept.name}:
                </span>
                <ul className="space-y-1">
                  {fw.dutiesForThisDept.slice(0, 3).map((duty, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                      <span className="text-sky-400 font-bold mt-0.5">•</span>
                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
