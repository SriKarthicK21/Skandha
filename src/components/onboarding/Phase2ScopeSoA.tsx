import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { ControlItem, DepartmentScopeProfile, DepartmentPolicyRequirement } from '../../types';
import {
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  FileCheck2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Check,
  X,
  Hash,
  Building2,
  FileText,
  Sparkles,
  Sliders,
  Printer,
  ChevronRight,
  Users,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { DepartmentScopeModal } from '../departments/DepartmentScopeModal';
import { DepartmentPolicyAnalyzer } from '../departments/DepartmentPolicyAnalyzer';
import { DepartmentScopeDossierModal } from '../departments/DepartmentScopeDossierModal';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const Phase2ScopeSoA: React.FC<Props> = ({ onComplete, onBack }) => {
  const {
    currentTenant,
    masterDepartments,
    savePhase2Scope,
    lockSoABaseline,
    departmentScopes,
    updateDepartmentScope,
    addCustomDepartmentScope,
    deleteDepartmentScope,
    toggleDepartmentInScope,
    autoMapDepartmentPolicies,
    addPolicyRequirementToDepartment,
    updateDepartmentPolicyRequirement,
    removeDepartmentPolicyRequirement
  } = useGRC();

  // Business Scope Narrative
  const [statement, setStatement] = useState(
    currentTenant?.businessScope.statement ||
    'The Information Security Management System covers the design, development, cloud operations, customer onboarding, and ongoing maintenance of our SaaS platform, hosted in AWS/cloud regions, and operated from our corporate offices and remote workforce.'
  );

  // Exclusions
  const [exclusions, setExclusions] = useState<Array<{ id: string; controlOrProcess: string; justification: string }>>(
    currentTenant?.businessScope.exclusions || [
      {
        id: 'ex_1',
        controlOrProcess: 'A.7.11 Supporting utilities (On-premise diesel generator maintenance)',
        justification: 'The company operates a 100% cloud-native architecture. No physical datacenter facilities or primary electrical infrastructure are owned or managed by our personnel.'
      }
    ]
  );

  // Interested Parties
  const [interestedParties, setInterestedParties] = useState<Array<{ id: string; party: string; requirements: string; legalObligation: string }>>(
    currentTenant?.businessScope.interestedParties || [
      {
        id: 'ip_1',
        party: 'Enterprise SaaS Clients',
        requirements: 'ISO 27001 Certification, 99.9% API uptime, 24h breach notification SLA, and SOC 2 Type II attestation.',
        legalObligation: 'Master Service Agreement (MSA) & Data Processing Addendum (DPA)'
      },
      {
        id: 'ip_2',
        party: 'Statutory Data Protection Authorities (e.g. ICO / GDPR)',
        requirements: 'Privacy by design, Article 30 record of processing, DPO oversight, and 72-hour regulatory breach reporting.',
        legalObligation: 'UK GDPR / EU GDPR & Data Protection Act 2018'
      }
    ]
  );

  // Department Selection (from Master list)
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(
    currentTenant?.inScopeDepartmentIds || ['dept_it', 'dept_sec', 'dept_dev', 'dept_hr', 'dept_ops', 'dept_qa']
  );

  // Custom Departments
  const [customDepartments, setCustomDepartments] = useState(
    currentTenant?.customDepartments || []
  );
  const [newCustomDeptName, setNewCustomDeptName] = useState('');
  const [newCustomDeptOwner, setNewCustomDeptOwner] = useState('');
  const [newCustomDeptHeadcount, setNewCustomDeptHeadcount] = useState(10);

  // Department Sub-view: 'registry' | 'analyzer' | 'dossier'
  const [deptView, setDeptView] = useState<'registry' | 'analyzer'>('registry');
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<DepartmentScopeProfile | null>(null);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const [deptCategoryFilter, setDeptCategoryFilter] = useState('All');

  // Statement of Applicability Controls
  const [controls, setControls] = useState<ControlItem[]>(currentTenant?.controls || []);
  const [searchControl, setSearchControl] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'scope' | 'departments' | 'soa'>('scope');
  const [isLocking, setIsLocking] = useState(false);

  // Helpers for Exclusions
  const addExclusion = () => {
    setExclusions(prev => [
      ...prev,
      {
        id: `ex_${Date.now()}`,
        controlOrProcess: '',
        justification: ''
      }
    ]);
  };

  const removeExclusion = (id: string) => {
    setExclusions(prev => prev.filter(e => e.id !== id));
  };

  // Helpers for Interested Parties
  const addParty = () => {
    setInterestedParties(prev => [
      ...prev,
      {
        id: `ip_${Date.now()}`,
        party: '',
        requirements: '',
        legalObligation: ''
      }
    ]);
  };

  const removeParty = (id: string) => {
    setInterestedParties(prev => prev.filter(p => p.id !== id));
  };

  // Department toggles
  const toggleDept = (deptId: string) => {
    setSelectedDeptIds(prev =>
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
  };

  const addCustomDepartment = () => {
    if (!newCustomDeptName.trim()) return;
    const newDept = {
      id: `cdept_${Date.now()}`,
      name: newCustomDeptName,
      owner: newCustomDeptOwner || 'Department Lead',
      headcount: Number(newCustomDeptHeadcount) || 1
    };
    setCustomDepartments(prev => [...prev, newDept]);
    setNewCustomDeptName('');
    setNewCustomDeptOwner('');
  };

  const removeCustomDepartment = (id: string) => {
    setCustomDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Control update
  const updateControlApplicability = (ctrlId: string, applicable: boolean) => {
    setControls(prev =>
      prev.map(c => (c.id === ctrlId ? { ...c, applicable } : c))
    );
  };

  const updateControlJustification = (ctrlId: string, justification: string) => {
    setControls(prev =>
      prev.map(c => (c.id === ctrlId ? { ...c, justification } : c))
    );
  };

  const updateControlComments = (ctrlId: string, clientComments: string) => {
    setControls(prev =>
      prev.map(c => (c.id === ctrlId ? { ...c, clientComments } : c))
    );
  };

  const handleLockBaseline = async () => {
    setIsLocking(true);
    // Save current state first
    savePhase2Scope({
      statement,
      exclusions,
      interestedParties,
      inScopeDepartmentIds: selectedDeptIds,
      customDepartments,
      controls
    });
    await lockSoABaseline();
    setIsLocking(false);
  };

  const handleProceed = () => {
    savePhase2Scope({
      statement,
      exclusions,
      interestedParties,
      inScopeDepartmentIds: selectedDeptIds,
      customDepartments,
      controls
    });
    onComplete();
  };

  const filteredControls = controls.filter(c => {
    const matchesSearch =
      c.controlCode.toLowerCase().includes(searchControl.toLowerCase()) ||
      c.title.toLowerCase().includes(searchControl.toLowerCase()) ||
      c.description.toLowerCase().includes(searchControl.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const applicableCount = controls.filter(c => c.applicable).length;
  const excludedCount = controls.filter(c => !c.applicable).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800">
              Phase 2 of 4
            </span>
            <h2 className="text-xl font-bold text-white mt-2">Scope Definition & Statement of Applicability</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Establish the management boundary, record interested parties, select in-scope organizational departments, and review the Statement of Applicability (SoA) control-by-control before locking the baseline.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-700/60">
          <button
            onClick={() => setActiveTab('scope')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'scope'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            1. Business Scope & Exclusions
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'departments'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            2. Departmental Scope ({selectedDeptIds.length} In-Scope)
          </button>
          <button
            onClick={() => setActiveTab('soa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'soa'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>3. Statement of Applicability (SoA)</span>
            {currentTenant?.soaBaselineLocked && (
              <Lock className="w-3 h-3 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Business Scope & Exclusions */}
      {activeTab === 'scope' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Narrative Statement */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              ISMS Scope Statement (Products, Services, Cloud Regions & Locations) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={statement}
              onChange={e => setStatement(e.target.value)}
              placeholder="Detail the services, infrastructure platforms, locations, and data flows included..."
              className="w-full p-3 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-400">
              Defines the official reference point for all subsequent risk assessments, policies, and audits.
            </p>
          </div>

          {/* Explicit Exclusions */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200">Explicit Scope Exclusions</h3>
                <p className="text-[11px] text-slate-400">Any excluded standard control or operational facility must carry documented justification.</p>
              </div>
              <button
                type="button"
                onClick={addExclusion}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exclusion</span>
              </button>
            </div>

            <div className="space-y-3">
              {exclusions.map((ex, idx) => (
                <div key={ex.id} className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Exclusion #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExclusion(ex.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={ex.controlOrProcess}
                      onChange={e => {
                        const val = e.target.value;
                        setExclusions(prev => prev.map(item => item.id === ex.id ? { ...item, controlOrProcess: val } : item));
                      }}
                      placeholder="Excluded Control or Physical Site"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={ex.justification}
                      onChange={e => {
                        const val = e.target.value;
                        setExclusions(prev => prev.map(item => item.id === ex.id ? { ...item, justification: val } : item));
                      }}
                      placeholder="Technical / Architectural Justification"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interested Parties */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200">Interested Parties & Regulatory Obligations</h3>
                <p className="text-[11px] text-slate-400">Stakeholders whose requirements form mandatory compliance obligations.</p>
              </div>
              <button
                type="button"
                onClick={addParty}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Interested Party</span>
              </button>
            </div>

            <div className="space-y-3">
              {interestedParties.map((party, idx) => (
                <div key={party.id} className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Party #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeParty(party.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={party.party}
                      onChange={e => {
                        const val = e.target.value;
                        setInterestedParties(prev => prev.map(p => p.id === party.id ? { ...p, party: val } : p));
                      }}
                      placeholder="e.g. Enterprise SaaS Clients"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={party.requirements}
                      onChange={e => {
                        const val = e.target.value;
                        setInterestedParties(prev => prev.map(p => p.id === party.id ? { ...p, requirements: val } : p));
                      }}
                      placeholder="Security & Privacy Requirements"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={party.legalObligation}
                      onChange={e => {
                        const val = e.target.value;
                        setInterestedParties(prev => prev.map(p => p.id === party.id ? { ...p, legalObligation: val } : p));
                      }}
                      placeholder="Contractual / Statutory Mandate"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('departments')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1.5"
            >
              <span>Continue to Departments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Departmental Scope */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Top Bar with Metrics & View Switcher */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Departmental Scope & ISO Implementation Compliance</span>
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                    ISO 27001 Clauses 4.3 & 5.3
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define organizational boundary, core processes, critical systems, and analyze policy & procedure compliance per department.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <div className="inline-flex p-1 rounded-xl bg-slate-800/80 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setDeptView('registry')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    deptView === 'registry'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Scope Registry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeptView('analyzer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    deptView === 'analyzer'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>2. Policy Analyzer</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowDossierModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5"
                title="Print or Export ISO Scope Dossier"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Scope Dossier</span>
              </button>
            </div>
          </div>

          {/* Sub-view 1: Registry & Data Entry Cards */}
          {deptView === 'registry' && (
            <div className="space-y-6">
              {/* Quick Actions & Search Controls */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={deptSearch}
                      onChange={e => setDeptSearch(e.target.value)}
                      placeholder="Search department, owner, system, or process..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-center space-x-1 overflow-x-auto">
                    {['All', 'Technology', 'Operations', 'Governance', 'Business'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setDeptCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                          deptCategoryFilter === cat
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => autoMapDepartmentPolicies()}
                    className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-semibold border border-sky-800 flex items-center space-x-1.5"
                    title="Apply standard ISO 27001 / ISO 42001 policy mapping to all departments"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Auto-Map ISO Baseline</span>
                  </button>
                </div>
              </div>

              {/* Department Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentScopes
                  .filter(dept => {
                    const matchesSearch =
                      dept.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
                      dept.leadOwner.toLowerCase().includes(deptSearch.toLowerCase()) ||
                      dept.coreProcesses.some(p => p.toLowerCase().includes(deptSearch.toLowerCase())) ||
                      dept.criticalAssetsAndSystems.some(s => s.toLowerCase().includes(deptSearch.toLowerCase()));
                    const matchesCat = deptCategoryFilter === 'All' || dept.category === deptCategoryFilter;
                    return matchesSearch && matchesCat;
                  })
                  .map(dept => {
                    const compliantCount = (dept.policyRequirements || []).filter(p => p.status === 'Compliant & Approved').length;
                    const totalReqs = (dept.policyRequirements || []).length;
                    const compRate = totalReqs > 0 ? Math.round((compliantCount / totalReqs) * 100) : 0;

                    return (
                      <div
                        key={dept.id}
                        className={`rounded-2xl border transition-all flex flex-col justify-between ${
                          dept.isInScope
                            ? 'bg-slate-900 border-slate-700/80 shadow-md hover:border-sky-500/50'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="p-4 space-y-3">
                          {/* Card Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${dept.isInScope ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                <h4 className="text-xs font-bold text-white">{dept.name}</h4>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                  {dept.category}
                                </span>
                                <span>•</span>
                                <span>{dept.headcount} staff</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleDepartmentInScope(dept.id)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors border ${
                                dept.isInScope
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {dept.isInScope ? 'In-Scope' : 'Excluded'}
                            </button>
                          </div>

                          {/* Owner & Boundary Preview */}
                          <div className="space-y-1.5 text-[11px] text-slate-300 pt-1">
                            <div className="flex items-center justify-between text-slate-400 text-[10px]">
                              <span>Lead Owner:</span>
                              <span className="text-slate-200 font-medium truncate max-w-[150px]">{dept.leadOwner}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                              "{dept.scopeBoundary || 'No scope boundary defined yet. Click below to configure.'}"
                            </p>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                            <div className="p-1.5 rounded-lg bg-slate-800/50">
                              <div className="text-[10px] text-slate-400">Processes</div>
                              <div className="text-xs font-bold text-sky-400">{dept.coreProcesses.length}</div>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-800/50">
                              <div className="text-[10px] text-slate-400">Systems</div>
                              <div className="text-xs font-bold text-indigo-400">{dept.criticalAssetsAndSystems.length}</div>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-800/50">
                              <div className="text-[10px] text-slate-400">Policies</div>
                              <div className="text-xs font-bold text-emerald-400">{compliantCount}/{totalReqs}</div>
                            </div>
                          </div>

                          {/* Compliance Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>ISO Compliance Rate</span>
                              <span className="font-semibold text-slate-200">{compRate}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  compRate >= 90 ? 'bg-emerald-500' : compRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${compRate}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Footer CTA */}
                        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 rounded-b-2xl flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedDeptForEdit(dept)}
                            className="w-full px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                            id={`btn-edit-dept-${dept.id}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Enter / Configure Scope Data</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Custom Department Addition */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>Register Client-Specific Custom Department</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    value={newCustomDeptName}
                    onChange={e => setNewCustomDeptName(e.target.value)}
                    placeholder="Department Name (e.g. Open Banking)"
                    className="sm:col-span-2 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    value={newCustomDeptOwner}
                    onChange={e => setNewCustomDeptOwner(e.target.value)}
                    placeholder="Lead Owner Name"
                    className="px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCustomDeptName.trim()) return;
                      const newId = `cdept_${Date.now()}`;
                      addCustomDepartmentScope({
                        id: newId,
                        name: newCustomDeptName.trim(),
                        category: 'Technology',
                        isInScope: true,
                        leadOwner: newCustomDeptOwner.trim() || 'Department Lead',
                        headcount: 10,
                        scopeBoundary: `Specific operational scope for ${newCustomDeptName.trim()} including systems, data flows, and workforce compliance.`,
                        coreProcesses: ['Operational Workflows', 'Client Engagements'],
                        criticalAssetsAndSystems: ['Internal Workstations', 'Cloud Collaboration Suite'],
                        workLocations: ['Remote (100% Cloud)', 'Corporate HQ Office'],
                        dataClassifications: ['Confidential', 'Internal'],
                        threatVectors: ['Phishing & Credential Compromise', 'Misconfiguration'],
                        applicableAnnexAControls: ['A.5.1', 'A.8.1'],
                        applicableIsoClauses: ['Clause 4.3', 'Clause 5.3', 'Clause 8.1'],
                        applicableFrameworks: ['ISO/IEC 27001:2022'],
                        policyRequirements: [
                          {
                            id: `pol_c_${Date.now()}`,
                            title: 'Information Security Policy',
                            docCode: 'ISMS-POL-01',
                            type: 'POLICY',
                            mandatory: true,
                            isoClause: 'Clause 5.2',
                            annexAControl: 'A.5.1',
                            status: 'Compliant & Approved',
                            assignedOwner: newCustomDeptOwner.trim() || 'Department Lead',
                            version: '1.0',
                            lastAuditDate: new Date().toISOString().split('T')[0],
                            nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            implementationNotes: 'Staff onboarding sign-off recorded'
                          }
                        ],
                        maturityLevel: 3,
                        readinessScore: 80
                      });
                      setNewCustomDeptName('');
                      setNewCustomDeptOwner('');
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Add Department
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view 2: Interactive Policy & Procedure Compliance Analyzer */}
          {deptView === 'analyzer' && (
            <DepartmentPolicyAnalyzer
              departmentScopes={departmentScopes}
              onOpenDepartmentScope={dept => setSelectedDeptForEdit(dept)}
              onUpdatePolicyStatus={(deptId, reqId, status) =>
                updateDepartmentPolicyRequirement(deptId, reqId, { status })
              }
              onAutoMapAll={() => autoMapDepartmentPolicies()}
              generatedDocs={currentTenant?.generatedDocs || []}
            />
          )}

          {/* Bottom Step Nav */}
          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('scope')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Scope</span>
            </button>
            <button
              onClick={() => setActiveTab('soa')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-sky-900/30"
            >
              <span>Continue to SoA Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Statement of Applicability (SoA) */}
      {activeTab === 'soa' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Baseline Lock Status Box */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              currentTenant?.soaBaselineLocked
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {currentTenant?.soaBaselineLocked ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {currentTenant?.soaBaselineLocked
                    ? 'Statement of Applicability Baseline Locked'
                    : 'Statement of Applicability Pending Baseline Lock'}
                </h4>
                <p className="text-[11px] opacity-85 mt-0.5">
                  {currentTenant?.soaBaselineLocked
                    ? `Locked on ${new Date(currentTenant.soaBaselineTimestamp || '').toLocaleString()} by ${currentTenant.soaBaselineUser}`
                    : 'Review each control below, verify applicability and justification, then lock the baseline to enable document generation.'}
                </p>
                {currentTenant?.soaBaselineHash && (
                  <div className="mt-1 flex items-center space-x-1 font-mono text-[10px] text-emerald-400">
                    <Hash className="w-3 h-3" />
                    <span>SHA-256: {currentTenant.soaBaselineHash}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={handleLockBaseline}
                disabled={isLocking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                  currentTenant?.soaBaselineLocked
                    ? 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-900/30'
                }`}
                id="btn-lock-soa"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{currentTenant?.soaBaselineLocked ? 'Re-lock New Baseline Version' : 'Lock SoA Baseline'}</span>
              </button>
            </div>
          </div>

          {/* Stats & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <span className="font-semibold text-white">Controls Summary:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {applicableCount} Applicable
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                {excludedCount} Excluded
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchControl}
                  onChange={e => setSearchControl(e.target.value)}
                  placeholder="Filter controls by code or text..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Categories</option>
                <option value="Organizational">Organizational</option>
                <option value="People">People</option>
                <option value="Physical">Physical</option>
                <option value="Technological">Technological</option>
              </select>
            </div>
          </div>

          {/* Interactive Controls Table */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredControls.map(ctrl => (
              <div
                key={ctrl.id}
                className={`p-4 rounded-xl border transition-all ${
                  ctrl.applicable
                    ? 'bg-slate-850 bg-slate-800/60 border-slate-700'
                    : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-700/50">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-sky-950 text-sky-400 border border-sky-800">
                      {ctrl.controlCode}
                    </span>
                    <h4 className="text-xs font-bold text-white">{ctrl.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {ctrl.category}
                    </span>
                  </div>

                  {/* Applicability Switcher */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateControlApplicability(ctrl.id, true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        ctrl.applicable
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Applicable</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateControlApplicability(ctrl.id, false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        !ctrl.applicable
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <X className="w-3 h-3" />
                      <span>Excluded</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{ctrl.description}</p>

                {/* Justification and Comments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Applicability Justification
                    </label>
                    <input
                      type="text"
                      value={ctrl.justification}
                      onChange={e => updateControlJustification(ctrl.id, e.target.value)}
                      placeholder="e.g. Mandatory governance requirement..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Client Review Notes / Comments
                    </label>
                    <input
                      type="text"
                      value={ctrl.clientComments || ''}
                      onChange={e => updateControlComments(ctrl.id, e.target.value)}
                      placeholder="e.g. Handled by DevOps team using automated scripts..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('departments')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Departments</span>
            </button>
            <button
              onClick={handleProceed}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-900/30 flex items-center space-x-1.5"
              id="btn-proceed-phase3"
            >
              <span>Save & Proceed to Phase 3 (Doc Generation)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Department Scope & Policy Data Entry */}
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

      {/* Modal: ISO Scope Dossier Export */}
      {showDossierModal && (
        <DepartmentScopeDossierModal
          tenant={currentTenant}
          departmentScopes={departmentScopes}
          isOpen={showDossierModal}
          onClose={() => setShowDossierModal(false)}
        />
      )}
    </div>
  );
};
