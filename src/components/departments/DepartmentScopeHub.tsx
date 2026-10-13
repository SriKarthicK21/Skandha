import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { DepartmentScopeProfile } from '../../types';
import { DepartmentScopeModal } from './DepartmentScopeModal';
import { CreateDepartmentScopeModal } from './CreateDepartmentScopeModal';
import { DepartmentScopeDossierModal } from './DepartmentScopeDossierModal';
import { DepartmentPolicyAnalyzer } from './DepartmentPolicyAnalyzer';
import { DepartmentOverviewView } from './DepartmentOverviewView';
import { OrganizationalComplianceGuidelinesView } from '../compliance/OrganizationalComplianceGuidelinesView';
import {
  Building2,
  Plus,
  Sparkles,
  Printer,
  Shield,
  Search,
  Filter,
  Users,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  Lock,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Clock,
  ArrowRight,
  ChevronRight,
  Download,
  BookOpen,
  Globe,
  LayoutDashboard
} from 'lucide-react';

interface Props {
  initialTab?: 'overview' | 'profiles' | 'matrix' | 'guidelines' | 'statement';
}

export const DepartmentScopeHub: React.FC<Props> = ({ initialTab = 'overview' }) => {
  const {
    currentTenant,
    departmentScopes,
    updateDepartmentScope,
    addCustomDepartmentScope,
    deleteDepartmentScope,
    toggleDepartmentInScope,
    autoMapDepartmentPolicies,
    updateDepartmentPolicyRequirement
  } = useGRC();

  // Primary Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'matrix' | 'guidelines' | 'statement'>(initialTab);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterScopeStatus, setFilterScopeStatus] = useState<'all' | 'in_scope' | 'excluded'>('all');

  // Modal States
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<DepartmentScopeProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);

  // Filtered scopes
  const filteredDepartments = departmentScopes.filter(dept => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.leadOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.scopeBoundary && dept.scopeBoundary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || dept.category === selectedCategory;
    const matchesScope =
      filterScopeStatus === 'all' ||
      (filterScopeStatus === 'in_scope' && dept.isInScope) ||
      (filterScopeStatus === 'excluded' && !dept.isInScope);

    return matchesSearch && matchesCat && matchesScope;
  });

  // KPI Calculations
  const totalDepts = departmentScopes.length;
  const inScopeDepts = departmentScopes.filter(d => d.isInScope);
  const totalHeadcountInScope = inScopeDepts.reduce((acc, d) => acc + (d.headcount || 0), 0);
  const totalAssetsCount = inScopeDepts.reduce((acc, d) => acc + (d.criticalAssetsAndSystems?.length || 0), 0);

  // Policy stats across in-scope departments
  const allPolicyReqs = inScopeDepts.flatMap(d => d.policyRequirements || []);
  const compliantPolicies = allPolicyReqs.filter(p => p.status === 'Compliant & Approved').length;
  const gapPolicies = allPolicyReqs.filter(p => p.status === 'Gap - Required').length;
  const inReviewPolicies = allPolicyReqs.filter(p => p.status === 'In Review').length;
  const compliancePercentage = allPolicyReqs.length > 0 ? Math.round((compliantPolicies / allPolicyReqs.length) * 100) : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/50 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-800">
                ISO/IEC 27001:2022 • Clause 4.3 & 5.3 ISMS Scope
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {inScopeDepts.length} of {totalDepts} Units in Scope
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-sky-400" />
              <span>Department Scope & ISO Implementation Compliance</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Define departmental operational boundaries, headcount, core processes, and critical systems to analyze policy & procedure compliance against ISO 27001:2022 and ISO 42001:2023.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-sky-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enter New Department Scope</span>
            </button>

            <button
              onClick={() => autoMapDepartmentPolicies()}
              className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
              title="Automatically match baseline ISO 27001 policies across all in-scope departments"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Map All Policies</span>
            </button>

            <button
              onClick={() => setShowDossierModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Scope Dossier</span>
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">In-Scope Units</span>
            <div className="text-xl font-bold text-white">
              {inScopeDepts.length} <span className="text-xs font-normal text-slate-500">/ {totalDepts}</span>
            </div>
            <span className="text-[10px] text-emerald-400">100% boundary defined</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Staff Covered</span>
            <div className="text-xl font-bold text-sky-400">{totalHeadcountInScope}</div>
            <span className="text-[10px] text-slate-400">Clause 7.2 Personnel</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Critical Systems</span>
            <div className="text-xl font-bold text-indigo-400">{totalAssetsCount}</div>
            <span className="text-[10px] text-slate-400">VPC, DB, SSO, Repos</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Policy Compliance</span>
            <div className="text-xl font-bold text-emerald-400">{compliancePercentage}%</div>
            <span className="text-[10px] text-slate-400">{compliantPolicies} of {allPolicyReqs.length} Approved</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Actionable Gaps</span>
            <div className="text-xl font-bold text-rose-400">{gapPolicies}</div>
            <span className="text-[10px] text-slate-400">{inReviewPolicies} SOPs in review</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Departmental Overview & Drilldown</span>
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'profiles'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Scope Profiles & Data Entry ({departmentScopes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ISO Policy & Procedure Compliance Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'guidelines'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Global Compliance Guidelines (ISO, MAS TRM, DPDP, GDPR, NDPR)</span>
        </button>

        <button
          onClick={() => setActiveTab('statement')}
          className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'statement'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>ISMS Boundaries & Clause 4.3 Statement</span>
        </button>
      </div>

      {/* TAB 0: Departmental Overview & Drilldown View */}
      {activeTab === 'overview' && (
        <DepartmentOverviewView
          departmentScopes={departmentScopes}
          onOpenEditModal={dept => setSelectedDeptForEdit(dept)}
          onUpdatePolicyStatus={(deptId, policyReqId, newStatus) =>
            updateDepartmentPolicyRequirement(deptId, policyReqId, { status: newStatus })
          }
          onAutoMapPolicies={deptId => autoMapDepartmentPolicies(deptId)}
          onOpenGuidelines={() => setActiveTab('guidelines')}
        />
      )}

      {/* TAB 1: Department Scope Profiles List & Data Entry */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search department, lead owner, processes..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Categories</option>
                <option value="Technology">Technology & Cloud Engineering</option>
                <option value="Risk & Security">Information Security & Risk</option>
                <option value="People & Operations">People & Operations</option>
                <option value="Corporate & Finance">Corporate, Finance & Legal</option>
                <option value="Commercial & Growth">Commercial & Growth</option>
              </select>

              <select
                value={filterScopeStatus}
                onChange={e => setFilterScopeStatus(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Scope Statuses</option>
                <option value="in_scope">Included in ISMS Scope Only</option>
                <option value="excluded">Excluded Units Only</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enter New Department</span>
            </button>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDepartments.map(dept => {
              const reqs = dept.policyRequirements || [];
              const compliant = reqs.filter(r => r.status === 'Compliant & Approved').length;
              const gaps = reqs.filter(r => r.status === 'Gap - Required').length;
              const inReview = reqs.filter(r => r.status === 'In Review').length;
              const rate = reqs.length > 0 ? Math.round((compliant / reqs.length) * 100) : 0;

              const statusClass =
                rate >= 80
                  ? 'status-compliant'
                  : rate >= 50
                  ? 'status-attention'
                  : 'status-lagging';

              return (
                <div
                  key={dept.id}
                  className={`dept-card-interactive ${statusClass} p-5 rounded-2xl border flex flex-col justify-between shadow-sm space-y-4 ${
                    dept.isInScope
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-950/60 border-slate-800/60 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & In-Scope Toggle */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                          {dept.category}
                        </span>
                        <h3 className="text-base font-bold text-white">{dept.name}</h3>
                        <p className="text-xs text-slate-400">
                          Lead: <strong className="text-slate-200">{dept.leadOwner}</strong> • {dept.headcount} staff members
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => toggleDepartmentInScope(dept.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition flex items-center space-x-1 cursor-pointer ${
                            dept.isInScope
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                          title="Click to toggle in/out of ISMS scope"
                        >
                          {dept.isInScope ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-500" />}
                          <span>{dept.isInScope ? 'In Scope' : 'Excluded'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Scope Boundary Narrative */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      {dept.scopeBoundary || 'No operational boundary narrative entered yet.'}
                    </p>

                    {/* Core Processes */}
                    {dept.coreProcesses && dept.coreProcesses.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Core Operational Processes (Clause 8.1)
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dept.coreProcesses.slice(0, 3).map((proc, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 truncate max-w-[200px]">
                              {proc}
                            </span>
                          ))}
                          {dept.coreProcesses.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-semibold">
                              +{dept.coreProcesses.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Critical Systems & Assets */}
                    {dept.criticalAssetsAndSystems && dept.criticalAssetsAndSystems.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Critical Assets & Systems (Annex A.5.9)
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dept.criticalAssetsAndSystems.slice(0, 3).map((ast, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 truncate max-w-[180px]">
                              {ast}
                            </span>
                          ))}
                          {dept.criticalAssetsAndSystems.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-semibold">
                              +{dept.criticalAssetsAndSystems.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Policy Implementation Compliance Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">ISO Policy Implementation</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-emerald-400">{rate}% Compliant</span>
                          <span className="text-slate-500 text-[10px]">({compliant}/{reqs.length})</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                        <div style={{ width: `${rate}%` }} className="bg-emerald-500 h-full" />
                        <div style={{ width: `${(inReview / (reqs.length || 1)) * 100}%` }} className="bg-amber-500 h-full" />
                        <div style={{ width: `${(gaps / (reqs.length || 1)) * 100}%` }} className="bg-rose-500 h-full" />
                      </div>
                      {gaps > 0 && (
                        <div className="text-[10px] text-rose-400 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{gaps} mandatory policy/SOP gap(s) require creation</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      Readiness: <strong className="text-sky-400">{dept.readinessScore || 85}%</strong> (CMMI L{dept.maturityLevel || 4})
                    </div>

                    <div className="flex items-center space-x-2">
                      {dept.id.startsWith('dept_') && !['dept_it', 'dept_sec', 'dept_eng'].includes(dept.id) && (
                        <button
                          onClick={() => deleteDepartmentScope(dept.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Delete custom department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedDeptForEdit(dept)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-sky-400" />
                        <span>Edit Scope Data</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDeptForEdit(dept);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                      >
                        <span>Analyze Policies</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDepartments.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Department Scopes Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No departments matched your current search filters. Clear filters or click below to enter a new department scope profile.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enter New Department Scope</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISO Policy & Procedure Compliance Matrix */}
      {activeTab === 'matrix' && (
        <DepartmentPolicyAnalyzer
          departmentScopes={departmentScopes}
          onOpenDepartmentScope={(dept) => setSelectedDeptForEdit(dept)}
          onUpdatePolicyStatus={(deptId, reqId, status) =>
            updateDepartmentPolicyRequirement(deptId, reqId, { status })
          }
          onAutoMapAll={() => autoMapDepartmentPolicies()}
          generatedDocs={currentTenant?.generatedDocs || []}
        />
      )}

      {/* TAB 3: Defined ISMS Scope & Boundaries (Clause 4.3) */}
      {activeTab === 'statement' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Master ISMS Scope Statement (ISO 27001:2022 Clause 4.3)</h3>
              <p className="text-xs text-slate-400">
                Formal boundary established for external certification audit by BSI / DNV / TÜV SÜD.
              </p>
            </div>

            <button
              onClick={() => setShowDossierModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate Clause 4.3 Audit Dossier</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400">Formal Scope Definition</span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                &quot;{currentTenant?.businessScope?.statement || 'The Information Security Management System (ISMS) applies to the design, development, cloud infrastructure operations, customer support, and continuous maintenance of our SaaS platform hosted across AWS/GCP regions, encompassing all employees and contracted staff.'}&quot;
              </p>
            </div>

            {/* In-Scope vs Excluded Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>In-Scope Functional Units ({inScopeDepts.length})</span>
                </div>
                <div className="space-y-2">
                  {inScopeDepts.map(d => (
                    <div key={d.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{d.name}</div>
                        <div className="text-[10px] text-slate-400">{d.leadOwner} • {d.headcount} staff</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                        In Scope
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-slate-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Excluded Units & Justification (Clause 4.3)</span>
                </div>
                <div className="space-y-2">
                  {departmentScopes.filter(d => !d.isInScope).map(d => (
                    <div key={d.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-300">{d.name}</div>
                        <div className="text-[10px] text-slate-500">Excluded: Non-technical corporate entity</div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Excluded
                      </span>
                    </div>
                  ))}
                  {departmentScopes.filter(d => !d.isInScope).length === 0 && (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      All departments are currently included within the master ISMS audit scope.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Global Compliance Guidelines (ISO, MAS TRM, DPDP, GDPR, NDPR) */}
      {activeTab === 'guidelines' && (
        <OrganizationalComplianceGuidelinesView />
      )}

      {/* MODAL 1: Edit Department Scope */}
      {selectedDeptForEdit && (
        <DepartmentScopeModal
          department={selectedDeptForEdit}
          isOpen={true}
          onClose={() => setSelectedDeptForEdit(null)}
          onSave={(deptId, updates) => {
            updateDepartmentScope(deptId, updates);
            setSelectedDeptForEdit(null);
          }}
        />
      )}

      {/* MODAL 2: Create / Enter New Department Scope */}
      <CreateDepartmentScopeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(data) => {
          addCustomDepartmentScope(data);
          setShowCreateModal(false);
        }}
      />

      {/* MODAL 3: Formal Printable Scope Dossier */}
      <DepartmentScopeDossierModal
        tenant={currentTenant}
        departmentScopes={departmentScopes}
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
      />
    </div>
  );
};
