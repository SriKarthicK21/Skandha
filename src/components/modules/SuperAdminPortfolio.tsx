import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  Globe2,
  Building2,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Award,
  ArrowRight,
  Database,
  Search,
  Filter,
  FileCheck2,
  Flame,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  BookmarkCheck,
  Users2
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';
import { DataCollectionRequired } from '../common/DataCollectionRequired';

export const SuperAdminPortfolio: React.FC = () => {
  const {
    tenants,
    switchTenant,
    masterCategories,
    masterIndustries,
    masterDepartments,
    addMasterCategory,
    deleteMasterCategory,
    addMasterIndustry,
    deleteMasterIndustry,
    addMasterDepartment,
    deleteMasterDepartment,
    superAdminRecommendations,
    addSuperAdminRecommendation,
    currentTenant,
    setActiveModule,
    startNewEntityOnboarding,
    findings,
    risks,
    evidence
  } = useGRC();

  const [activeTab, setActiveTab] = useState<'tenants' | 'risk_findings' | 'master_data' | 'recommendations'>('tenants');

  // Tenant / Company Risk Search & Filter
  const [tenantSearchQuery, setTenantSearchQuery] = useState<string>('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL');
  const [riskSeverityFilter, setRiskSeverityFilter] = useState<string>('ALL');

  // Master Data Add Forms
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [newIndName, setNewIndName] = useState('');
  const [newIndDesc, setNewIndDesc] = useState('');

  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCat, setNewDeptCat] = useState('Technology');

  // Recommendation Form
  const [recTargetTenantId, setRecTargetTenantId] = useState(currentTenant?.id || tenants[0]?.id || '');
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState<'Policy' | 'Control' | 'Regulatory' | 'Risk Mitigation'>('Policy');
  const [recTargetControl, setRecTargetControl] = useState('A.8.8 Management of technical vulnerabilities');
  const [recPriority, setRecPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [recDesc, setRecDesc] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addMasterCategory({
      name: newCatName,
      description: newCatDesc || 'Corporate registration classification',
      active: true
    });
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndName.trim()) return;
    addMasterIndustry({
      name: newIndName,
      description: newIndDesc || 'Industry Sector classification (Configured by Super Admin)',
      active: true
    });
    setNewIndName('');
    setNewIndDesc('');
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    addMasterDepartment({
      name: newDeptName,
      category: newDeptCat,
      active: true
    });
    setNewDeptName('');
  };

  const handleAddRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim()) return;
    addSuperAdminRecommendation({
      tenantId: recTargetTenantId,
      title: recTitle,
      category: recCategory,
      priority: recPriority,
      description: recDesc,
      recommendedActions: [recDesc],
      status: 'Open'
    });
    setRecTitle('');
    setRecDesc('');
  };

  // Quick Suggest from a Risk Finding
  const handleQuickSuggest = (tenantId: string, findingTitle: string, controlCode: string) => {
    setActiveTab('recommendations');
    setRecTargetTenantId(tenantId);
    setRecTitle(`Remediate Finding: ${findingTitle}`);
    setRecCategory('Policy');
    setRecTargetControl(controlCode || 'A.5.1 Information Security Policies');
    setRecPriority('High');
    setRecDesc(`Super Admin recommends updating organizational procedures and enforcing compliance checks to resolve finding: "${findingTitle}".`);
  };

  const filteredFindings = findings.filter(f => {
    const matchesTenant = selectedTenantFilter === 'ALL' || f.tenantId === selectedTenantFilter;
    const matchesSeverity = riskSeverityFilter === 'ALL' || f.severity === riskSeverityFilter;
    return matchesTenant && matchesSeverity;
  });

  return (
    <PageContainer id="super-admin-portfolio-module">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
                Super Admin Tier
              </span>
              <span className="text-xs text-slate-400">Multi-Tenant Governance & Risk Findings Hub</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Super Admin Portfolio & Master Governance Data</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monitor registered organizations, inspect client risk findings, suggest implementation of policies and regulations, maintain platform dropdowns (10+ industry types, 50+ departments), and manage Statement of Applicability (SoA) baselines.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-800/90 border border-slate-700 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'tenants' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tenants ({tenants.length})
            </button>
            <button
              onClick={() => setActiveTab('risk_findings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 ${
                activeTab === 'risk_findings' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Risk Findings ({findings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('master_data')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'master_data' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Master Dropdowns (50+ Depts)
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 ${
                activeTab === 'recommendations' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Suggest Policies ({superAdminRecommendations.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Multi-Tenant Portfolio Monitor */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          {/* Tenant Search & Registration Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={tenantSearchQuery}
                  onChange={e => setTenantSearchQuery(e.target.value)}
                  placeholder="Filter organizations by name, ID, email, or industry..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">
                {tenants.filter(t => !tenantSearchQuery.trim() || t.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) || t.id.toLowerCase().includes(tenantSearchQuery.toLowerCase())).length} of {tenants.length} Organizations
              </span>
              <button
                onClick={startNewEntityOnboarding}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-sky-900/30 transition-all hover:scale-[1.02]"
                id="btn-superadmin-register-entity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Register New Entity & Survey</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Organization / Tenant</th>
                    <th className="p-3.5">Industry Category</th>
                    <th className="p-3.5 text-center">Onboarding Phase</th>
                    <th className="p-3.5 text-center">Readiness</th>
                    <th className="p-3.5 text-center">Digital MoU</th>
                    <th className="p-3.5">Open Risk Findings</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tenants
                    .filter(t => {
                      if (!tenantSearchQuery.trim()) return true;
                      const q = tenantSearchQuery.toLowerCase();
                      return (
                        t.name.toLowerCase().includes(q) ||
                        t.id.toLowerCase().includes(q) ||
                        t.contactEmail.toLowerCase().includes(q) ||
                        t.industryType.toLowerCase().includes(q)
                      );
                    })
                    .map(t => {
                    const isSelected = t.id === currentTenant?.id;
                    const tenantFindingsCount = findings.filter(f => f.tenantId === t.id && f.status !== 'Closed Verified').length;
                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-sky-950/30' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">{t.name}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {t.id.toUpperCase()} • {t.contactEmail}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-white font-medium">{t.industryType}</div>
                          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                            {t.selectedFrameworks.join(', ')}
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              t.onboardingPhase === 5
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {t.onboardingPhase === 5 ? 'Live (Onboarded)' : `Phase ${t.onboardingPhase} of 4`}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          {t.isDemo || !t.soaBaselineLocked || !t.readinessScore || t.readinessScore === 0 ? (
                            <DataCollectionRequired variant="table-cell" title="Data collection required" />
                          ) : (
                            <div className="font-bold text-white text-sm">{t.readinessScore}%</div>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {t.mou.executed ? (
                            <span className="text-emerald-400 font-bold text-xs flex items-center justify-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Signed</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold text-xs">Pending</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-xs font-bold ${tenantFindingsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {tenantFindingsCount} Open Findings
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            SoA: {t.soaBaselineLocked ? 'Locked' : 'Review Pending'}
                          </div>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                          {t.onboardingPhase < 5 ? (
                            <button
                              onClick={() => {
                                switchTenant(t.id);
                                setActiveModule('onboarding_survey');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 inline-flex items-center space-x-1"
                              title="Resume or complete onboarding survey for this entity"
                            >
                              <span>Survey (P{t.onboardingPhase}) →</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                switchTenant(t.id);
                                setActiveModule('command_center');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 inline-flex items-center space-x-1"
                              title="Inspect Command Center for this live onboarded entity"
                            >
                              <span>Command Center →</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              switchTenant(t.id);
                              setActiveModule('business_discovery');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 text-xs font-semibold border border-sky-500/30"
                          >
                            Switch Tenant
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTenantFilter(t.id);
                              setActiveTab('risk_findings');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold border border-rose-500/30"
                          >
                            Findings
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Company Risk Findings Monitor & Policy Remediation Engine */}
      {activeTab === 'risk_findings' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter by Company</label>
                <select
                  value={selectedTenantFilter}
                  onChange={e => setSelectedTenantFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="ALL">All Companies ({tenants.length})</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Severity</label>
                <select
                  value={riskSeverityFilter}
                  onChange={e => setRiskSeverityFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="ALL">All Severities</option>
                  <option value="Major Non-Conformity">Major Non-Conformity</option>
                  <option value="Minor Non-Conformity">Minor Non-Conformity</option>
                  <option value="Observation">Observation</option>
                  <option value="Opportunity for Improvement">Opportunity for Improvement</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{filteredFindings.length}</span> risk findings across client portfolio.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFindings.map(finding => {
              const tenant = tenants.find(t => t.id === finding.tenantId);
              return (
                <div
                  key={finding.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {tenant?.name || finding.tenantId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {finding.findingCode}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{finding.title}</h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                      finding.severity.includes('Major')
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : finding.severity.includes('Minor')
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{finding.description}</p>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Clause / Control Ref:</span>
                      <span className="font-mono text-indigo-300 font-bold">{finding.clauseOrControl}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status / Root Cause:</span>
                      <span className="text-amber-400 font-medium">{finding.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      Due: {finding.capaPlan?.targetDate || '30 Days'}
                    </span>
                    <button
                      onClick={() => handleQuickSuggest(finding.tenantId, finding.title, finding.clauseOrControl)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggest Policy Implementation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Master Data Management (Dropdowns: 10+ Industries, 50+ Depts, Categories) */}
      {activeTab === 'master_data' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Master Categories */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Registered Legal Categories ({masterCategories.length})
            </h3>
            <p className="text-[11px] text-slate-400">Dropdown options for Phase 1 registration survey.</p>

            <form onSubmit={handleAddCategory} className="space-y-2">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="New Category (e.g. Non-Profit CIC)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                + Add Category
              </button>
            </form>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {masterCategories.map(cat => (
                <div
                  key={cat.id}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{cat.name}</span>
                  <button
                    onClick={() => deleteMasterCategory(cat.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Master Industries (10+ Categories and Custom) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Kind of Company / Industries ({masterIndustries.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Super Admin can add, modify, or extend industry types available in Phase 1.
            </p>

            <form onSubmit={handleAddIndustry} className="space-y-2">
              <input
                type="text"
                value={newIndName}
                onChange={e => setNewIndName(e.target.value)}
                placeholder="New Industry (e.g. Aerospace & Defense)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                + Add Industry Type
              </button>
            </form>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {masterIndustries.map(ind => (
                <div
                  key={ind.id}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{ind.name}</span>
                    <div className="text-[10px] text-slate-400">{ind.description}</div>
                  </div>
                  <button
                    onClick={() => deleteMasterIndustry(ind.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Master Departments (50+ items) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Master Department Catalogue ({masterDepartments.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Comprehensive taxonomy of up to 50 departments (HR, IT, Data Science, Power BI, Finance, etc.).
            </p>

            <form onSubmit={handleAddDepartment} className="space-y-2">
              <input
                type="text"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                placeholder="Department Name"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
              <select
                value={newDeptCat}
                onChange={e => setNewDeptCat(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white"
              >
                <option value="Technology">Technology & Cloud</option>
                <option value="Risk & Security">Risk, Security & Audit</option>
                <option value="People & Operations">People & Operations</option>
                <option value="Corporate & Finance">Corporate & Finance</option>
                <option value="Commercial & Growth">Commercial & Growth</option>
              </select>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                + Add Master Department
              </button>
            </form>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {masterDepartments.map(dept => (
                <div
                  key={dept.id}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{dept.name}</div>
                    <div className="text-[10px] text-slate-400">{dept.category}</div>
                  </div>
                  <button
                    onClick={() => deleteMasterDepartment(dept.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Policy & Regulation Implementation Suggester */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Broadcaster Form (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Suggest Policy / Regulation Implementation</h3>
            </div>
            <p className="text-xs text-slate-400">
              As Super Admin, issue official advisory recommendations for policies, regulations, and remediation controls directly to client organizations.
            </p>

            <form onSubmit={handleAddRecommendation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Client Organization</label>
                <select
                  value={recTargetTenantId}
                  onChange={e => setRecTargetTenantId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.industryType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recommendation Title</label>
                <input
                  type="text"
                  required
                  value={recTitle}
                  onChange={e => setRecTitle(e.target.value)}
                  placeholder="e.g. Enforce Hardware Token MFA for Data Science & Power BI"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Advisory Type</label>
                  <select
                    value={recCategory}
                    onChange={e => setRecCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Policy">Policy Implementation</option>
                    <option value="Regulatory">Regulatory Standard (MAS TRM / ISO)</option>
                    <option value="Control">Security Control Directive</option>
                    <option value="Risk Mitigation">Risk Mitigation Action</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={recPriority}
                    onChange={e => setRecPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Control / Framework Clause</label>
                <input
                  type="text"
                  required
                  value={recTargetControl}
                  onChange={e => setRecTargetControl(e.target.value)}
                  placeholder="e.g. ISO 27001:2022 A.8.5 & MAS TRM 6.1"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Suggested Implementation Actions</label>
                <textarea
                  rows={4}
                  required
                  value={recDesc}
                  onChange={e => setRecDesc(e.target.value)}
                  placeholder="Detail the suggested policy updates, technical configurations, or evidence requirements..."
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Advisory to Client</span>
              </button>
            </form>
          </div>

          {/* Active Directives List (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Published Policy & Regulation Recommendations ({superAdminRecommendations.length})</h3>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {superAdminRecommendations.map(rec => {
                const target = tenants.find(t => t.id === rec.tenantId);
                return (
                  <div key={rec.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{rec.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400">
                        {target?.name || rec.tenantId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{rec.description}</p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/50">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                        Type: {rec.category}
                      </span>
                      <span className="text-rose-400 font-bold">{rec.priority} Priority</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
