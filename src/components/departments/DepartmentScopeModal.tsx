import React, { useState } from 'react';
import { DepartmentScopeProfile, DepartmentPolicyRequirement } from '../../types';
import { STANDARD_ISMS_POLICIES_AND_SOPS } from '../../data/departmentScopeMasterData';
import {
  X,
  Shield,
  Layers,
  FileText,
  Users,
  Cpu,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Building2,
  Globe,
  Database,
  ExternalLink,
  ChevronRight,
  Printer,
  Check,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Props {
  department: DepartmentScopeProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deptId: string, updates: Partial<DepartmentScopeProfile>) => void;
  onAutoMapPolicies?: (deptId: string) => void;
}

export const DepartmentScopeModal: React.FC<Props> = ({
  department,
  isOpen,
  onClose,
  onSave,
  onAutoMapPolicies
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'boundary' | 'processes' | 'controls' | 'policies' | 'threats'>('boundary');

  // Form state
  const [name, setName] = useState(department.name);
  const [category, setCategory] = useState(department.category);
  const [isInScope, setIsInScope] = useState(department.isInScope);
  const [leadOwner, setLeadOwner] = useState(department.leadOwner);
  const [leadEmail, setLeadEmail] = useState(department.leadEmail || '');
  const [headcount, setHeadcount] = useState(department.headcount || 1);
  const [scopeBoundary, setScopeBoundary] = useState(department.scopeBoundary || '');
  const [maturityLevel, setMaturityLevel] = useState(department.maturityLevel || 4);
  const [readinessScore, setReadinessScore] = useState(department.readinessScore || 90);
  const [auditorNotes, setAuditorNotes] = useState(department.auditorNotes || '');

  // Lists state
  const [coreProcesses, setCoreProcesses] = useState<string[]>(department.coreProcesses || []);
  const [newProcessText, setNewProcessText] = useState('');

  const [criticalAssets, setCriticalAssets] = useState<string[]>(department.criticalAssetsAndSystems || []);
  const [newAssetText, setNewAssetText] = useState('');

  const [workLocations, setWorkLocations] = useState<string[]>(
    department.workLocations || ['Remote (100% Cloud)', 'Corporate HQ Office']
  );

  const [dataClassifications, setDataClassifications] = useState<Array<'Confidential' | 'Restricted' | 'Internal' | 'Public'>>(
    department.dataClassifications || ['Confidential', 'Internal']
  );

  const [threatVectors, setThreatVectors] = useState<string[]>(department.threatVectors || []);
  const [newThreatText, setNewThreatText] = useState('');

  const [policyRequirements, setPolicyRequirements] = useState<DepartmentPolicyRequirement[]>(
    department.policyRequirements || []
  );

  // New Policy Form Modal state
  const [showAddPolicyForm, setShowAddPolicyForm] = useState(false);
  const [newPolDocCode, setNewPolDocCode] = useState('');
  const [newPolTitle, setNewPolTitle] = useState('');
  const [newPolType, setNewPolType] = useState<'POLICY' | 'PROCEDURE' | 'SOP' | 'REGISTER' | 'PLAN'>('POLICY');
  const [newPolMandatory, setNewPolMandatory] = useState(true);
  const [newPolIsoClause, setNewPolIsoClause] = useState('Clause 8.1');
  const [newPolAnnexA, setNewPolAnnexA] = useState('A.5.15');
  const [newPolStatus, setNewPolStatus] = useState<'Compliant & Approved' | 'In Review' | 'Gap - Required' | 'Exempt'>('Compliant & Approved');
  const [newPolOwner, setNewPolOwner] = useState(leadOwner);
  const [newPolVersion, setNewPolVersion] = useState('1.0');
  const [newPolNotes, setNewPolNotes] = useState('');

  // Helpers
  const handleAddProcess = () => {
    if (!newProcessText.trim()) return;
    setCoreProcesses(prev => [...prev, newProcessText.trim()]);
    setNewProcessText('');
  };

  const handleRemoveProcess = (index: number) => {
    setCoreProcesses(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAsset = () => {
    if (!newAssetText.trim()) return;
    setCriticalAssets(prev => [...prev, newAssetText.trim()]);
    setNewAssetText('');
  };

  const handleRemoveAsset = (index: number) => {
    setCriticalAssets(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddThreat = () => {
    if (!newThreatText.trim()) return;
    setThreatVectors(prev => [...prev, newThreatText.trim()]);
    setNewThreatText('');
  };

  const handleRemoveThreat = (index: number) => {
    setThreatVectors(prev => prev.filter((_, i) => i !== index));
  };

  const toggleLocation = (loc: string) => {
    setWorkLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const toggleClassification = (cls: 'Confidential' | 'Restricted' | 'Internal' | 'Public') => {
    setDataClassifications(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleAddCustomPolicy = () => {
    if (!newPolTitle.trim()) return;
    const newReq: DepartmentPolicyRequirement = {
      id: `pol_${Date.now()}`,
      docCode: newPolDocCode || `ARP_ISMS_P${Math.floor(Math.random() * 90 + 10)}`,
      title: newPolTitle.trim(),
      type: newPolType,
      mandatory: newPolMandatory,
      isoClause: newPolIsoClause,
      annexAControl: newPolAnnexA,
      status: newPolStatus,
      assignedOwner: newPolOwner || leadOwner,
      version: newPolVersion || '1.0',
      lastAuditDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      implementationNotes: newPolNotes
    };

    setPolicyRequirements(prev => [...prev, newReq]);
    setShowAddPolicyForm(false);
    setNewPolTitle('');
    setNewPolDocCode('');
    setNewPolNotes('');
  };

  const handleRemovePolicyReq = (id: string) => {
    setPolicyRequirements(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePolicyStatus = (id: string, newStatus: DepartmentPolicyRequirement['status']) => {
    setPolicyRequirements(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handleQuickAutoMap = () => {
    // Recommend standard matching policies based on category
    const relevant = STANDARD_ISMS_POLICIES_AND_SOPS.filter(std => {
      if (category === 'Technology' && (std.annexAControl.includes('A.8') || std.annexAControl.includes('A.5.15') || std.docCode.includes('PR07') || std.docCode.includes('PR04') || std.docCode.includes('PR01'))) return true;
      if (category === 'Risk & Security') return true;
      if (category === 'People & Operations' && (std.annexAControl.includes('A.6') || std.annexAControl.includes('A.7') || std.docCode.includes('PR05') || std.docCode.includes('PR06') || std.docCode.includes('P04'))) return true;
      if (category === 'Corporate & Finance' && (std.docCode.includes('P16') || std.docCode.includes('P17') || std.docCode.includes('P18') || std.docCode.includes('PR09') || std.docCode.includes('PR10'))) return true;
      return std.mandatory;
    });

    const mapped: DepartmentPolicyRequirement[] = relevant.map((std, idx) => ({
      id: `req_${department.id}_${idx + 1}`,
      docCode: std.docCode,
      title: std.title,
      type: std.type,
      mandatory: std.mandatory,
      isoClause: std.isoClause,
      annexAControl: std.annexAControl,
      status: 'Compliant & Approved',
      assignedOwner: leadOwner,
      version: std.version,
      lastAuditDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      implementationNotes: std.implementationNotes
    }));

    setPolicyRequirements(mapped);
  };

  const handleSaveAll = () => {
    onSave(department.id, {
      name,
      category,
      isInScope,
      leadOwner,
      leadEmail,
      headcount: Number(headcount),
      scopeBoundary,
      coreProcesses,
      criticalAssetsAndSystems: criticalAssets,
      workLocations,
      dataClassifications,
      threatVectors,
      policyRequirements,
      maturityLevel: Number(maturityLevel),
      readinessScore: Number(readinessScore),
      auditorNotes,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  // Stats
  const compliantPolicies = policyRequirements.filter(p => p.status === 'Compliant & Approved').length;
  const gapPolicies = policyRequirements.filter(p => p.status === 'Gap - Required').length;
  const inReviewPolicies = policyRequirements.filter(p => p.status === 'In Review').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/50 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                ISO 27001 Clause 4.3 & 5.3 Scope Profile
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isInScope
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isInScope ? '● In Audit Scope' : '○ Excluded from Scope'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              <span>{name}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Departmental Operational Mandate, Critical Assets, Threat Profile & ISO Policy Implementation Compliance
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuickAutoMap}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Automatically match standard ISO 27001 / ISO 42001 policies for this department"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Map ISO Policies</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Department Lead</div>
            <div className="text-slate-200 font-bold truncate">{leadOwner || 'Unassigned'}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Headcount in Scope</div>
            <div className="text-slate-200 font-bold">{headcount} Staff Members</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Policies & SOPs</div>
            <div className="text-sky-400 font-bold">
              {compliantPolicies} Compliant {gapPolicies > 0 && <span className="text-rose-400 font-normal">({gapPolicies} Gaps)</span>}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Audit Readiness</div>
            <div className="text-emerald-400 font-bold">{readinessScore}% (CMMI L{maturityLevel})</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 overflow-x-auto">
          {[
            { id: 'boundary', label: '1. Scope & Mandate', icon: Layers },
            { id: 'processes', label: '2. Processes & Systems', icon: Cpu },
            { id: 'controls', label: '3. Controls & Clauses', icon: Shield },
            { id: 'policies', label: `4. Policies & SOPs (${policyRequirements.length})`, icon: FileText },
            { id: 'threats', label: '5. Risk & Maturity', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-semibold flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-900/60">
          {/* TAB 1: Boundary & Mandate */}
          {activeTab === 'boundary' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Department Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organizational Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Technology">Technology & Cloud Engineering</option>
                    <option value="Risk & Security">Information Security & Risk</option>
                    <option value="People & Operations">People & Operations</option>
                    <option value="Corporate & Finance">Corporate, Finance & Legal</option>
                    <option value="Commercial & Growth">Commercial & Customer Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Audit Scope Inclusion
                  </label>
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsInScope(!isInScope)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        isInScope
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isInScope ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{isInScope ? 'Included in ISMS Scope' : 'Excluded from ISMS'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Department Lead / Asset Owner (Clause 5.3) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={leadOwner}
                    onChange={e => setLeadOwner(e.target.value)}
                    placeholder="e.g. Arjun Mehta (VP of Engineering)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Lead Email Address
                  </label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    placeholder="arjun.mehta@company.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Staff Headcount in Scope (Clause 7.2)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={headcount}
                    onChange={e => setHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Scope Boundary & Operational Mandate Description (ISO 27001 Clause 4.3) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={scopeBoundary}
                  onChange={e => setScopeBoundary(e.target.value)}
                  placeholder="Detail the technical environments, physical facilities, software applications, repositories, and personnel covered by this department's ISMS scope..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              {/* Work Locations */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Operating Locations & Work Modes (Annex A.6.7 / A.7.1)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Remote (100% Cloud)', 'Corporate HQ Office', 'Hybrid', 'Branch Office', 'Co-Location Datacenter'].map(loc => {
                    const sel = workLocations.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleLocation(loc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1 ${
                          sel
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sel && <Check className="w-3 h-3 text-sky-400" />}
                        <span>{loc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Classifications */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Information Classifications Processed (Annex A.5.12)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Confidential', desc: 'Internal Secrets & Source Code' },
                    { name: 'Restricted', desc: 'Customer PII, Payment & Medical Data' },
                    { name: 'Internal', desc: 'Internal Employee Information' },
                    { name: 'Public', desc: 'Marketing & Public Documents' }
                  ].map(cls => {
                    const sel = dataClassifications.includes(cls.name as any);
                    return (
                      <button
                        key={cls.name}
                        type="button"
                        onClick={() => toggleClassification(cls.name as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
                          sel
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sel && <Check className="w-3 h-3 text-purple-400" />}
                        <span>{cls.name}</span>
                        <span className="text-[10px] text-slate-500">({cls.desc})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Core Processes & Critical Assets */}
          {activeTab === 'processes' && (
            <div className="space-y-6 animate-fade-in">
              {/* Core Business Processes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">Core Operational Processes Handled</h3>
                    <p className="text-[11px] text-slate-400">Key business and technical workflows executed by this department under ISMS control.</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {coreProcesses.length} Active Processes
                  </span>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newProcessText}
                    onChange={e => setNewProcessText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddProcess())}
                    placeholder="e.g. Automated CI/CD pipeline gating & SAST vulnerability scanning..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddProcess}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Process</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {coreProcesses.map((proc, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200">{proc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProcess(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {coreProcesses.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      No core processes defined. Enter standard departmental workflows above.
                    </div>
                  )}
                </div>
              </div>

              {/* Critical Systems & Repositories */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">Critical Systems, SaaS Platforms & Repositories</h3>
                    <p className="text-[11px] text-slate-400">Applications, cloud accounts, databases and infrastructure owned or operated by this team.</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {criticalAssets.length} In-Scope Assets
                  </span>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAssetText}
                    onChange={e => setNewAssetText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAsset())}
                    placeholder="e.g. AWS Production Account (ap-southeast-1), GitHub Enterprise, Jira Service Desk..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAsset}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add System</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {criticalAssets.map((asset, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-slate-200 truncate">{asset}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {criticalAssets.length === 0 && (
                    <div className="col-span-full p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      No critical systems registered for this department.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Applicable Controls & Clauses */}
          {activeTab === 'controls' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-xs font-bold text-slate-200">ISO/IEC 27001:2022 Applicable Annex A Controls</h3>
                <p className="text-[11px] text-slate-400">Controls directly enforced, audited, or evidenced by this department.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { domain: 'A.5 Organizational Controls', count: '37 Controls', desc: 'Policies, access control, supplier relationships, inventory' },
                  { domain: 'A.6 People Controls', count: '8 Controls', desc: 'Screening, training, offboarding, disciplinary process' },
                  { domain: 'A.7 Physical Controls', count: '14 Controls', desc: 'Physical perimeter, entry, clear desk/screen, cabling' },
                  { domain: 'A.8 Technological Controls', count: '34 Controls', desc: 'Secure coding, SSDLC, encryption, vulnerability management, backups' }
                ].map(dom => (
                  <div key={dom.domain} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dom.domain}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        {dom.count}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{dom.desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300">Enforced Annex A Controls</h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {(department.applicableAnnexAControls || []).map((ctrl, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-sky-400 font-bold">{ctrl.split(' ')[0]}</span>
                        <span className="text-slate-300">{ctrl.substring(ctrl.indexOf(' ') + 1)}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Audited
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Policies & SOPs Compliance Requirements */}
          {activeTab === 'policies' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white">Departmental Policy & Procedure (SOP) Compliance</h3>
                  <p className="text-[11px] text-slate-400">
                    Mandatory ISMS documentation assigned to this department for implementation and workforce compliance.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddPolicyForm(true)}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Policy / SOP</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAutoMap}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold border border-slate-700 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reset Recommended</span>
                  </button>
                </div>
              </div>

              {/* Inline Add Policy Form Modal */}
              {showAddPolicyForm && (
                <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400">Add New Departmental Policy or Procedure Requirement</span>
                    <button onClick={() => setShowAddPolicyForm(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Doc Code</label>
                      <input
                        type="text"
                        value={newPolDocCode}
                        onChange={e => setNewPolDocCode(e.target.value)}
                        placeholder="e.g. ARP_ISMS_P11"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Policy / SOP Title</label>
                      <input
                        type="text"
                        value={newPolTitle}
                        onChange={e => setNewPolTitle(e.target.value)}
                        placeholder="e.g. Access Control & Privileged User Policy"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Type</label>
                      <select
                        value={newPolType}
                        onChange={e => setNewPolType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="POLICY">Policy</option>
                        <option value="SOP">SOP (Procedure)</option>
                        <option value="REGISTER">Register</option>
                        <option value="PLAN">Plan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">ISO Clause</label>
                      <input
                        type="text"
                        value={newPolIsoClause}
                        onChange={e => setNewPolIsoClause(e.target.value)}
                        placeholder="Clause 8.1"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Compliance Status</label>
                      <select
                        value={newPolStatus}
                        onChange={e => setNewPolStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="Compliant & Approved">Compliant & Approved</option>
                        <option value="In Review">In Review</option>
                        <option value="Gap - Required">Gap - Required</option>
                        <option value="Exempt">Exempt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Version</label>
                      <input
                        type="text"
                        value={newPolVersion}
                        onChange={e => setNewPolVersion(e.target.value)}
                        placeholder="1.0"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Implementation & Audit Notes</label>
                    <input
                      type="text"
                      value={newPolNotes}
                      onChange={e => setNewPolNotes(e.target.value)}
                      placeholder="Notes on enforcement mechanism, tools used, or evidence attached..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddPolicyForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomPolicy}
                      className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                    >
                      Save Policy Requirement
                    </button>
                  </div>
                </div>
              )}

              {/* Policies List Table / Cards */}
              <div className="space-y-2.5">
                {policyRequirements.map(req => {
                  const isCompliant = req.status === 'Compliant & Approved';
                  const isGap = req.status === 'Gap - Required';
                  const isInReview = req.status === 'In Review';

                  return (
                    <div
                      key={req.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isGap
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : isInReview
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-sky-400">{req.docCode}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              req.type === 'POLICY'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}>
                              {req.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{req.isoClause}</span>
                            <span className="text-[10px] text-slate-500">v{req.version}</span>
                          </div>
                          <div className="text-xs font-bold text-white">{req.title}</div>
                          {req.implementationNotes && (
                            <div className="text-[11px] text-slate-400">{req.implementationNotes}</div>
                          )}
                        </div>

                        {/* Status dropdown & delete */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <select
                            value={req.status}
                            onChange={e => handleUpdatePolicyStatus(req.id, e.target.value as any)}
                            className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                              isCompliant
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isGap
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <option value="Compliant & Approved">Compliant & Approved</option>
                            <option value="In Review">In Review</option>
                            <option value="Gap - Required">Gap - Required</option>
                            <option value="Exempt">Exempt</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemovePolicyReq(req.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Remove policy requirement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {policyRequirements.length === 0 && (
                  <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-400">No Policy Requirements Assigned</div>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Click &quot;Auto-Map ISO Policies&quot; to populate standard ISO/IEC 27001 policies and procedures for this department.
                    </p>
                    <button
                      type="button"
                      onClick={handleQuickAutoMap}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Map Recommended Policies</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Threat Profile & Maturity */}
          {activeTab === 'threats' && (
            <div className="space-y-6 animate-fade-in">
              {/* Threat Profile */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">Departmental Threat Vectors (Clause 6.1)</h3>
                    <p className="text-[11px] text-slate-400">Specific cybersecurity and compliance threats applicable to this functional unit.</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {threatVectors.length} Monitored Vectors
                  </span>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newThreatText}
                    onChange={e => setNewThreatText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddThreat())}
                    placeholder="e.g. Credential stuffing on VPN, rogue SaaS shadow IT, malicious dependency injection..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddThreat}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Threat</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {threatVectors.map((threat, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-200">{threat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveThreat(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {threatVectors.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      No threat vectors registered. Enter primary departmental risk scenarios above.
                    </div>
                  )}
                </div>
              </div>

              {/* CMMI Maturity & Readiness */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white">ISO Implementation Maturity & Readiness Index</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      CMMI Implementation Maturity Level (1-5)
                    </label>
                    <select
                      value={maturityLevel}
                      onChange={e => setMaturityLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value={1}>Level 1: Initial / Ad-Hoc</option>
                      <option value={2}>Level 2: Managed / Repeatable</option>
                      <option value={3}>Level 3: Defined / Standardized</option>
                      <option value={4}>Level 4: Quantitatively Managed (Target for ISO 27001)</option>
                      <option value={5}>Level 5: Continuous Optimization</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Audit Readiness Score: <span className="text-sky-400">{readinessScore}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={readinessScore}
                      onChange={e => setReadinessScore(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Auditor Notes & Implementation Guidance
                  </label>
                  <textarea
                    rows={2}
                    value={auditorNotes}
                    onChange={e => setAuditorNotes(e.target.value)}
                    placeholder="Documented remarks regarding audit readiness, evidence collection, and interview preparedness..."
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Last updated: <span className="text-slate-200">{department.updatedAt ? new Date(department.updatedAt).toLocaleDateString() : 'Initial'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Department Scope</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
