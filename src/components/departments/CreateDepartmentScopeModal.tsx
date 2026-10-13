import React, { useState } from 'react';
import { DepartmentScopeProfile, DepartmentPolicyRequirement } from '../../types';
import { STANDARD_ISMS_POLICIES_AND_SOPS } from '../../data/departmentScopeMasterData';
import {
  X,
  Plus,
  Trash2,
  Check,
  Building2,
  Sparkles,
  Shield,
  Layers,
  Cpu,
  Lock,
  FileText,
  AlertTriangle,
  Users,
  Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DepartmentScopeProfile, 'tenantId' | 'updatedAt'>) => void;
}

export const CreateDepartmentScopeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave
}) => {
  // Navigation tabs in wizard/form
  const [activeTab, setActiveTab] = useState<'boundary' | 'processes' | 'systems' | 'policies' | 'threats'>('boundary');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Technology');
  const [isInScope, setIsInScope] = useState(true);
  const [leadOwner, setLeadOwner] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [headcount, setHeadcount] = useState(12);
  const [scopeBoundary, setScopeBoundary] = useState('');
  const [workLocations, setWorkLocations] = useState<string[]>(['Remote (100% Cloud)', 'Corporate HQ Office']);
  const [dataClassifications, setDataClassifications] = useState<Array<'Confidential' | 'Restricted' | 'Internal' | 'Public'>>(['Confidential', 'Internal']);
  
  // Core processes
  const [coreProcesses, setCoreProcesses] = useState<string[]>([
    'CI/CD Software Deployment Pipeline',
    'Customer Data Processing & Storage'
  ]);
  const [newProcessText, setNewProcessText] = useState('');

  // Critical assets
  const [criticalAssets, setCriticalAssets] = useState<string[]>([
    'AWS Production VPC & ECS Clusters',
    'PostgreSQL Database Clusters'
  ]);
  const [newAssetText, setNewAssetText] = useState('');

  // Threat vectors
  const [threatVectors, setThreatVectors] = useState<string[]>([
    'Cloud infrastructure misconfiguration',
    'Compromised developer credentials'
  ]);
  const [newThreatText, setNewThreatText] = useState('');

  // CMMI maturity & readiness
  const [maturityLevel, setMaturityLevel] = useState<number>(4);
  const [readinessScore, setReadinessScore] = useState<number>(85);
  const [auditorNotes, setAuditorNotes] = useState('');

  // Policies & Procedures
  const [policyRequirements, setPolicyRequirements] = useState<DepartmentPolicyRequirement[]>([]);

  if (!isOpen) return null;

  // Presets based on Category
  const applyCategoryTemplate = (cat: string) => {
    setCategory(cat);
    if (cat === 'Technology') {
      setName(name || 'Cloud Platform Engineering & DevOps');
      setScopeBoundary('Covers cloud architecture, CI/CD code deployment pipelines, container orchestration, microservice APIs, and production database administration across AWS/GCP cloud environments.');
      setCoreProcesses([
        'Continuous Integration & Deployment (CI/CD)',
        'Container Orchestration & Cluster Management',
        'Database Administration & Read/Write Replication',
        'Production Release Quality Assurance'
      ]);
      setCriticalAssets([
        'AWS Production Cloud VPC',
        'PostgreSQL Database Clusters',
        'GitHub Enterprise Source Code Repositories',
        'HashiCorp Vault Secrets Manager'
      ]);
      setThreatVectors([
        'Cloud infrastructure drift & misconfiguration',
        'Compromised developer credentials',
        'Supply chain dependency vulnerability injection'
      ]);
    } else if (cat === 'Risk & Security') {
      setName(name || 'Information Security & Compliance');
      setScopeBoundary('Covers 24/7 Security Operations Center (SOC), vulnerability management, incident response CSIRT mobilization, identity & access governance, and external ISO/regulatory audit coordination.');
      setCoreProcesses([
        'Security Operations & Telemetry Monitoring',
        'Vulnerability Scanning & Patch Coordination',
        'Identity & Access Governance Recertification',
        'Security Incident Response & Forensics'
      ]);
      setCriticalAssets([
        'SIEM / Telemetry Aggregator Console',
        'EDR Endpoint Agent Management',
        'Vulnerability Scanner & Cloud Security Posture Tool',
        'Incident Management War Room'
      ]);
      setThreatVectors([
        'Advanced Persistent Threat (APT) intrusion',
        'Zero-day vulnerability exploitation',
        'Ransomware and data extortion attempts'
      ]);
    } else if (cat === 'People & Operations') {
      setName(name || 'People Operations & HR');
      setScopeBoundary('Covers talent acquisition, employee pre-employment screening, workforce security awareness onboarding, disciplinary escalation, and immediate offboarding asset retrieval.');
      setCoreProcesses([
        'Staff Background Screening & Verification',
        'Security Awareness Training Onboarding',
        'Access Approval & Privilege Lifecycle',
        'Employee Offboarding & Asset Revocation'
      ]);
      setCriticalAssets([
        'HR Information System (HRIS)',
        'Applicant Tracking & Background Verification Portal',
        'Corporate Identity Management System'
      ]);
      setThreatVectors([
        'Social engineering & phishing credential harvest',
        'Insider threat & unauthorized data exfiltration',
        'Improper offboarding access persistence'
      ]);
    } else if (cat === 'Corporate & Finance') {
      setName(name || 'Finance & Legal Governance');
      setScopeBoundary('Covers financial accounting, vendor contract negotiations, payment processing segregation of duties, regulatory compliance filings, and external legal representation.');
      setCoreProcesses([
        'Dual-Authorized Payment Processing',
        'Vendor Commercial Risk & Contract Review',
        'Corporate Financial Reporting & Audit Prep',
        'Regulatory Compliance Filings'
      ]);
      setCriticalAssets([
        'Corporate ERP & Accounting System',
        'Corporate Banking Dual-Authorization Portals',
        'Legal Contract Management Vault'
      ]);
      setThreatVectors([
        'Business Email Compromise (BEC) wire fraud',
        'Unauthorized financial ledger manipulation',
        'Breach of commercial contractual confidentiality'
      ]);
    }
  };

  // Tag Helpers
  const handleAddProcess = () => {
    if (!newProcessText.trim()) return;
    setCoreProcesses(prev => [...prev, newProcessText.trim()]);
    setNewProcessText('');
  };

  const handleRemoveProcess = (idx: number) => {
    setCoreProcesses(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddAsset = () => {
    if (!newAssetText.trim()) return;
    setCriticalAssets(prev => [...prev, newAssetText.trim()]);
    setNewAssetText('');
  };

  const handleRemoveAsset = (idx: number) => {
    setCriticalAssets(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddThreat = () => {
    if (!newThreatText.trim()) return;
    setThreatVectors(prev => [...prev, newThreatText.trim()]);
    setNewThreatText('');
  };

  const handleRemoveThreat = (idx: number) => {
    setThreatVectors(prev => prev.filter((_, i) => i !== idx));
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

  // Auto-Map ISO Baseline Policies
  const handleAutoMapPolicies = () => {
    const relevant = STANDARD_ISMS_POLICIES_AND_SOPS.filter(std => {
      if (category === 'Technology' && (std.annexAControl.includes('A.8') || std.annexAControl.includes('A.5.15') || std.docCode.includes('PR07') || std.docCode.includes('PR04') || std.docCode.includes('PR01') || std.docCode.includes('P08'))) return true;
      if (category === 'Risk & Security') return true;
      if (category === 'People & Operations' && (std.annexAControl.includes('A.6') || std.annexAControl.includes('A.7') || std.docCode.includes('PR05') || std.docCode.includes('PR06') || std.docCode.includes('P04') || std.docCode.includes('P13') || std.docCode.includes('P14') || std.docCode.includes('P15'))) return true;
      if (category === 'Corporate & Finance' && (std.docCode.includes('P16') || std.docCode.includes('P17') || std.docCode.includes('P18') || std.docCode.includes('PR09') || std.docCode.includes('PR10'))) return true;
      return std.mandatory;
    });

    const mapped: DepartmentPolicyRequirement[] = relevant.map((std, idx) => ({
      id: `req_custom_${idx + 1}`,
      docCode: std.docCode,
      title: std.title,
      type: std.type,
      mandatory: std.mandatory,
      isoClause: std.isoClause,
      annexAControl: std.annexAControl,
      status: idx % 4 === 0 ? 'In Review' : 'Compliant & Approved',
      assignedOwner: leadOwner || 'Department Lead',
      version: std.version,
      lastAuditDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      implementationNotes: std.implementationNotes
    }));

    setPolicyRequirements(mapped);
  };

  const handleUpdatePolicyStatus = (id: string, newStatus: DepartmentPolicyRequirement['status']) => {
    setPolicyRequirements(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActiveTab('boundary');
      return;
    }

    const deptSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 16);
    const generatedId = `dept_${deptSlug}_${Date.now().toString().slice(-4)}`;

    // If no policies were mapped yet, auto-map now
    let finalPolicies = policyRequirements;
    if (finalPolicies.length === 0) {
      const relevant = STANDARD_ISMS_POLICIES_AND_SOPS.filter(std => std.mandatory);
      finalPolicies = relevant.map((std, idx) => ({
        id: `req_${generatedId}_${idx + 1}`,
        docCode: std.docCode,
        title: std.title,
        type: std.type,
        mandatory: std.mandatory,
        isoClause: std.isoClause,
        annexAControl: std.annexAControl,
        status: 'Compliant & Approved',
        assignedOwner: leadOwner || 'Department Lead',
        version: std.version,
        lastAuditDate: new Date().toISOString().split('T')[0],
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        implementationNotes: std.implementationNotes
      }));
    }

    onSave({
      id: generatedId,
      name: name.trim(),
      category,
      isInScope,
      leadOwner: leadOwner.trim() || 'Department Lead',
      leadEmail: leadEmail.trim() || 'lead@organization.internal',
      headcount: Number(headcount) || 1,
      scopeBoundary: scopeBoundary.trim() || `Operational scope and technical boundaries for ${name.trim()}.`,
      coreProcesses,
      criticalAssetsAndSystems: criticalAssets,
      workLocations,
      dataClassifications,
      threatVectors,
      applicableAnnexAControls: ['A.5.1', 'A.5.15', 'A.8.1'],
      applicableIsoClauses: ['Clause 4.3', 'Clause 5.3', 'Clause 8.1'],
      applicableFrameworks: ['ISO/IEC 27001:2022'],
      policyRequirements: finalPolicies,
      maturityLevel: Number(maturityLevel) || 4,
      readinessScore: Number(readinessScore) || 85,
      auditorNotes: auditorNotes.trim()
    });

    onClose();
  };

  const compliantCount = policyRequirements.filter(p => p.status === 'Compliant & Approved').length;
  const gapCount = policyRequirements.filter(p => p.status === 'Gap - Required').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/50 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                ISO 27001 Clause 4.3 & 5.3 Scope Data Entry
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                New Organizational Unit
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              <span>Enter Department Scope Data</span>
            </h2>
            <p className="text-xs text-slate-400">
              Define operational boundaries, core business processes, critical systems, and auto-map ISO policies for implementation compliance analysis.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Templates Banner */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Quick Department Presets:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Engineering & DevOps', cat: 'Technology' },
              { label: 'InfoSec & Risk', cat: 'Risk & Security' },
              { label: 'People & HR', cat: 'People & Operations' },
              { label: 'Finance & Legal', cat: 'Corporate & Finance' }
            ].map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyCategoryTemplate(preset.cat)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 overflow-x-auto">
          {[
            { id: 'boundary', label: '1. Boundary & Mandate', icon: Layers },
            { id: 'processes', label: `2. Processes (${coreProcesses.length})`, icon: Cpu },
            { id: 'systems', label: `3. Systems & Assets (${criticalAssets.length})`, icon: Shield },
            { id: 'threats', label: '4. Threats & Data Class', icon: Lock },
            { id: 'policies', label: `5. ISO Policies (${policyRequirements.length})`, icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-900/60">
            {/* TAB 1: Boundary & Mandate */}
            {activeTab === 'boundary' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Department Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Cloud DevOps & Platform Engineering"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
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
                      <option value="Commercial & Growth">Commercial & Customer Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      ISO 27001 Scope Status (Clause 4.3)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsInScope(!isInScope)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        isInScope
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isInScope ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{isInScope ? '● Included in Audit Scope' : '○ Excluded from Scope'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Department Lead / Asset Owner (Clause 5.3) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={leadOwner}
                      onChange={e => setLeadOwner(e.target.value)}
                      placeholder="e.g. Vikram Singhania (Head of Infrastructure)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Lead Contact Email
                    </label>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={e => setLeadEmail(e.target.value)}
                      placeholder="lead.contact@company.internal"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Headcount in Scope (Staff Members)
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
                    required
                    value={scopeBoundary}
                    onChange={e => setScopeBoundary(e.target.value)}
                    placeholder="Describe the operational boundaries, technical components, software environments, and physical/logical perimeter covered by this department for ISO certification..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
                  />
                </div>

                {/* Operating Locations */}
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
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
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
              </div>
            )}

            {/* TAB 2: Core Processes */}
            {activeTab === 'processes' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span>Core Business Processes (ISO 27001 Clause 8.1 Operational Planning)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Document the operational procedures and business workflows executed by this department that require ISO risk assessment and procedural SOPs.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newProcessText}
                    onChange={e => setNewProcessText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddProcess(); } }}
                    placeholder="Enter a process (e.g., Code Review & Pull Request Sign-off, Customer Onboarding)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddProcess}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Process</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {coreProcesses.map((proc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-slate-200 font-medium">{proc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProcess(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {coreProcesses.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No core processes entered yet. Add at least one key process for this department.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Critical Systems & Assets */}
            {activeTab === 'systems' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Critical Information Assets & Systems (ISO Annex A.5.9 / A.5.10)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    List the primary technical systems, databases, cloud repositories, or SaaS platforms managed or accessed by this team.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAssetText}
                    onChange={e => setNewAssetText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAsset(); } }}
                    placeholder="Enter system/asset (e.g. AWS Production VPC, GitHub Enterprise, Okta SSO)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAsset}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Asset</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {criticalAssets.map((ast, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-slate-200 font-medium">{ast}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {criticalAssets.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No critical assets listed yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Threats & Data Classification */}
            {activeTab === 'threats' && (
              <div className="space-y-4 animate-fade-in">
                {/* Data Classifications */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Data Classifications Processed (Annex A.5.12 Classification of Information)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Confidential', 'Restricted', 'Internal', 'Public'] as const).map(cls => {
                      const sel = dataClassifications.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClassification(cls)}
                          className={`p-3 rounded-xl border text-left transition ${
                            sel
                              ? 'bg-sky-950/40 border-sky-500/60 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{cls}</span>
                            {sel && <Check className="w-3.5 h-3.5 text-sky-400" />}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {cls === 'Confidential' && 'Customer PII, payment tokens, API keys'}
                            {cls === 'Restricted' && 'Source code, intellectual property, board minutes'}
                            {cls === 'Internal' && 'Internal wikis, team Slack channels'}
                            {cls === 'Public' && 'Marketing website, documentation'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Threat Vectors */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      Identified Departmental Threat Vectors (Clause 6.1.2)
                    </label>
                    <span className="text-[11px] text-slate-400">{threatVectors.length} threats logged</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newThreatText}
                      onChange={e => setNewThreatText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddThreat(); } }}
                      placeholder="Add a threat vector (e.g. Credential stuffing, Cloud misconfiguration)..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddThreat}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Threat</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {threatVectors.map((tht, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-xs text-slate-200">{tht}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveThreat(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maturity Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      CMMI Maturity Level (1 to 5)
                    </label>
                    <select
                      value={maturityLevel}
                      onChange={e => setMaturityLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value={1}>Level 1 - Initial / Ad-hoc</option>
                      <option value={2}>Level 2 - Managed / Repeatable</option>
                      <option value={3}>Level 3 - Defined / Standardized</option>
                      <option value={4}>Level 4 - Quantitatively Managed (Target)</option>
                      <option value={5}>Level 5 - Continuous Optimizing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Baseline Audit Readiness Score (0 - 100%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={readinessScore}
                      onChange={e => setReadinessScore(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ISO Policies & Implementation Compliance */}
            {activeTab === 'policies' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>ISO 27001 & ISO 42001 Policy & Procedure Mapping</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Auto-link standard policies and standard operating procedures (SOPs) based on your selected department category and critical assets.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoMapPolicies}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Map ISO Baseline</span>
                  </button>
                </div>

                {policyRequirements.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-400">
                        Mapped Policies & SOPs: <strong className="text-white">{policyRequirements.length}</strong>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-emerald-400 font-semibold">{compliantCount} Approved</span>
                        {gapCount > 0 && <span className="text-rose-400 font-semibold">{gapCount} Gaps</span>}
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {policyRequirements.map(req => (
                        <div
                          key={req.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[11px] font-bold text-sky-400">{req.docCode}</span>
                              <span className="text-xs font-bold text-white truncate">{req.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {req.type}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {req.isoClause} • {req.annexAControl}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <select
                              value={req.status}
                              onChange={e => handleUpdatePolicyStatus(req.id, e.target.value as any)}
                              className={`px-2.5 py-1 text-xs rounded-lg font-bold border focus:outline-none ${
                                req.status === 'Compliant & Approved'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                  : req.status === 'In Review'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                  : req.status === 'Gap - Required'
                                  ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <option value="Compliant & Approved">Approved & Compliant</option>
                              <option value="In Review">In Review</option>
                              <option value="Gap - Required">Gap - Required</option>
                              <option value="Exempt">Exempt / N/A</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-950 border border-dashed border-slate-800 space-y-2">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-medium text-slate-300">
                      No policies mapped yet. Click &quot;Auto-Map ISO Baseline&quot; above to instantly populate relevant ISO 27001 policies and procedures.
                    </p>
                    <button
                      type="button"
                      onClick={handleAutoMapPolicies}
                      className="px-4 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold inline-flex items-center space-x-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Map ISO Baseline Now</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Scope data is automatically saved to tenant state and audit logs.</span>
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
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-sky-600/20 transition"
              >
                <Check className="w-4 h-4" />
                <span>Save Department Scope & Policies</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
