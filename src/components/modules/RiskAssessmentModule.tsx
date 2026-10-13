import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { RiskRecord } from '../../types';
import { DPDPDpiaWorkbench } from '../dpdp/DPDPDpiaWorkbench';
import { SoASyncVerifierModal } from './SoASyncVerifierModal';
import { PageContainer } from '../layout/PageContainer';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Shield,
  ShieldCheck,
  Download,
  Printer,
  RefreshCw,
  Zap,
  ExternalLink,
  X
} from 'lucide-react';

export const RiskAssessmentModule: React.FC = () => {
  const {
    risks,
    addRisk,
    updateRisk,
    deleteRisk,
    currentTenant,
    setActiveModule,
    syncRiskRegisterAndSoA,
    controls,
    soaVerifierReport,
    soaVerificationIssues,
    simulateOutdatedSoARisk
  } = useGRC();
  const tenantRisks = risks.filter(r => r.tenantId === currentTenant?.id);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'risk_register' | 'dpdp_dpia'>('risk_register');
  const [showVerifierModal, setShowVerifierModal] = useState<boolean>(false);
  const [soaAlertDismissed, setSoaAlertDismissed] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskRecord | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RiskRecord['category']>('Information Security');
  const [linkedItem, setLinkedItem] = useState('AWS Cloud Infrastructure');
  const [department, setDepartment] = useState('IT & Infrastructure');
  const [threatDescription, setThreatDescription] = useState('');
  const [vulnerabilityDescription, setVulnerabilityDescription] = useState('');
  const [likelihood, setLikelihood] = useState<number>(3);
  const [impact, setImpact] = useState<number>(4);
  const [treatmentOption, setTreatmentOption] = useState<RiskRecord['treatmentOption']>('Mitigate');
  const [mitigationControl, setMitigationControl] = useState('A.8.1, A.8.2 MFA & Endpoint Policy');
  const [residualLikelihood, setResidualLikelihood] = useState<number>(1);
  const [residualImpact, setResidualImpact] = useState<number>(2);
  const [treatmentOwner, setTreatmentOwner] = useState('CISO');
  const [targetDate, setTargetDate] = useState('2026-10-15');

  // Real-time conflict detection: check if any excluded control is referenced or contradicted
  const conflictingExcludedControls = useMemo(() => {
    const textToCheck = `${title} ${threatDescription} ${mitigationControl}`.toLowerCase();
    const excluded = controls.filter(c => !c.applicable);
    return excluded.filter(c => {
      const code = c.controlCode.toLowerCase();
      const codeMatch = textToCheck.includes(code);
      const dlpMatch =
        (code.includes('a.8.12') || c.title.toLowerCase().includes('leakage')) &&
        (textToCheck.includes('leak') ||
          textToCheck.includes('exfiltrat') ||
          textToCheck.includes('pii') ||
          textToCheck.includes('dlp'));
      const mediaMatch =
        (code.includes('a.7.10') || c.title.toLowerCase().includes('storage media')) &&
        (textToCheck.includes('usb') ||
          textToCheck.includes('removable') ||
          textToCheck.includes('workstation') ||
          textToCheck.includes('laptop') ||
          textToCheck.includes('media'));
      return codeMatch || dlpMatch || mediaMatch;
    });
  }, [title, threatDescription, mitigationControl, controls]);

  const openAddModal = () => {
    setEditingRisk(null);
    setTitle('');
    setCategory('Information Security');
    setLinkedItem('AWS Cloud Infrastructure');
    setDepartment('IT & Infrastructure');
    setThreatDescription('');
    setVulnerabilityDescription('');
    setLikelihood(3);
    setImpact(4);
    setTreatmentOption('Mitigate');
    setMitigationControl('A.8.1 User Endpoint Protection');
    setResidualLikelihood(1);
    setResidualImpact(2);
    setTreatmentOwner('CISO');
    setTargetDate('2026-10-15');
    setShowAddModal(true);
  };

  const openEditModal = (r: RiskRecord) => {
    setEditingRisk(r);
    setTitle(r.title);
    setCategory(r.category);
    setLinkedItem(r.linkedItem);
    setDepartment(r.department);
    setThreatDescription(r.threatDescription);
    setVulnerabilityDescription(r.vulnerabilityDescription);
    setLikelihood(r.likelihood);
    setImpact(r.impact);
    setTreatmentOption(r.treatmentOption);
    setMitigationControl(r.mitigationControl);
    setResidualLikelihood(r.residualLikelihood);
    setResidualImpact(r.residualImpact);
    setTreatmentOwner(r.treatmentOwner);
    setTargetDate(r.targetDate);
    setShowAddModal(true);
  };

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRisk) {
      updateRisk(editingRisk.id, {
        title,
        category,
        linkedItem,
        department,
        threatDescription,
        vulnerabilityDescription,
        likelihood,
        impact,
        treatmentOption,
        mitigationControl,
        residualLikelihood,
        residualImpact,
        treatmentOwner,
        targetDate
      });
    } else {
      addRisk({
        title,
        category,
        linkedItem,
        department,
        threatDescription,
        vulnerabilityDescription,
        likelihood,
        impact,
        treatmentOption,
        mitigationControl,
        residualLikelihood,
        residualImpact,
        treatmentOwner,
        targetDate,
        status: 'Identified'
      });
    }
    setShowAddModal(false);
  };

  const filteredRisks = tenantRisks.filter(r => {
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesTreatment = treatmentFilter === 'All' || r.treatmentOption === treatmentFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.riskCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.linkedItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.threatDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesTreatment && matchesSearch;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 15) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (score >= 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (score >= 5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  // Metrics
  const criticalCount = tenantRisks.filter(r => r.inherentScore >= 15).length;
  const highCount = tenantRisks.filter(r => r.inherentScore >= 10 && r.inherentScore < 15).length;
  const mitigatedCount = tenantRisks.filter(r => r.treatmentOption === 'Mitigate').length;

  return (
    <PageContainer id="risk-assessment-module" className="font-sans">
      {/* Risk Architecture View Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveView('risk_register')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
            activeView === 'risk_register'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Information Security Risk Register (ISO 27001)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('dpdp_dpia')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
            activeView === 'dpdp_dpia'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>DPDP Data Protection Impact Assessment (DPIA) Template</span>
        </button>
      </div>

      {activeView === 'dpdp_dpia' ? (
        <DPDPDpiaWorkbench />
      ) : (
        <>
          {/* Header Banner - High Density Style */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
              ISO/IEC 27001:2022 Clause 6.1.2 & 6.1.3
            </span>
            <span className="text-xs text-slate-500 font-medium">Tenant: {currentTenant?.name}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Information Security Risk Register</h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Asset- and process-level risk assessment with threat/vulnerability modeling, treatment evaluation, and residual risk tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowVerifierModal(true)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              soaVerifierReport.outdatedCount > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Statement of Applicability (SoA) Sync Verifier (ISO 27001 Cl. 6.1.3 d)"
          >
            {soaVerifierReport.outdatedCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
            <span>SoA Verifier ({soaVerifierReport.outdatedCount})</span>
          </button>

          <button
            onClick={() => {
              simulateOutdatedSoARisk();
              setShowVerifierModal(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Simulate adding a new risk that triggers an outdated SoA justification"
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Simulate SoA Trigger</span>
          </button>

          <button
            onClick={() => {
              const res = syncRiskRegisterAndSoA();
              setSyncStatus(`Dynamically reconciled ${res.changesCount} control & risk links with Statement of Applicability.`);
              setTimeout(() => setSyncStatus(null), 4000);
            }}
            className="px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="ISO 27001 Cl. 6.1.2 & 6.1.3 Automated SoA & Risk Register Dynamic Sync"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600" />
            <span>Sync with SoA</span>
          </button>

          <button
            onClick={() => setActiveModule('risk_simulator')}
            className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Treatment Simulator</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Risk Record</span>
          </button>
        </div>
      </div>

      {/* Real-time SoA Sync Verifier Alert Banner */}
      {soaVerifierReport.outdatedCount > 0 && !soaAlertDismissed && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-start sm:items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="font-bold text-amber-900">SoA Sync Verifier Alert (ISO 27001 Cl. 6.1.3 d):</strong>
                <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-mono font-bold text-[10px]">
                  {soaVerifierReport.outdatedCount} Outdated Exclusion(s)
                </span>
              </div>
              <p className="text-amber-800 text-[11px] mt-0.5">
                New risks identified in this register have invalidated exclusion justifications for control(s):{' '}
                <strong>{soaVerificationIssues.map(i => i.controlCode).join(', ')}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowVerifierModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
            >
              Review in SoA Verifier
            </button>
            <button
              onClick={() => setActiveModule('soa')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 font-semibold text-xs transition"
            >
              Go to SoA Matrix
            </button>
            <button
              onClick={() => setSoaAlertDismissed(true)}
              className="p-1 rounded text-amber-600 hover:text-amber-900"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {syncStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncStatus}</span>
          </div>
          <button onClick={() => setSyncStatus(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Risks Identified</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{tenantRisks.length} Risks</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all departments</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Critical Inherent Risks (Score ≥ 15)</span>
          <div className="text-xl font-bold text-rose-600 mt-1">{criticalCount} Critical</div>
          <p className="text-[11px] text-rose-500 mt-0.5">Requires Lead Auditor Escalation</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Active Treatment Plans</span>
          <div className="text-xl font-bold text-blue-600 mt-1">{mitigatedCount} Mitigations</div>
          <p className="text-[11px] text-slate-400 mt-0.5">ISO 27001 controls assigned</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Scenario Simulator Status</span>
          <div className="text-xs font-bold text-emerald-700 mt-1.5 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Model Ready (Clause 6.1.3)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Live residual score projections</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by risk code, title, threat or asset..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Information Security">Information Security</option>
            <option value="Asset">Asset</option>
            <option value="Process">Process</option>
            <option value="Vendor">Vendor</option>
            <option value="Legal & Compliance">Legal & Compliance</option>
          </select>

          <select
            value={treatmentFilter}
            onChange={e => setTreatmentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="All">All Treatments</option>
            <option value="Mitigate">Mitigate</option>
            <option value="Transfer">Transfer</option>
            <option value="Avoid">Avoid</option>
            <option value="Accept">Accept</option>
          </select>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start md:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export Register PDF</span>
        </button>
      </div>

      {/* Risk Cards List */}
      <div className="space-y-3">
        {filteredRisks.map(risk => (
          <div
            key={risk.id}
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {risk.riskCode}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {risk.category}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Asset: <strong className="text-slate-700">{risk.linkedItem}</strong> ({risk.department})
                </span>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  onClick={() => setActiveModule('risk_simulator')}
                  className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  title="Simulate treatment scenarios for this risk"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Simulate</span>
                </button>
                <button
                  onClick={() => openEditModal(risk)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                  title="Edit risk"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteRisk(risk.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete risk"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title & Threat / Vulnerability Details */}
            <div>
              <h3 className="text-xs font-bold text-slate-900">{risk.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>Threat:</strong> {risk.threatDescription} • <strong>Vulnerability:</strong> {risk.vulnerabilityDescription}
              </p>
            </div>

            {/* Score Comparison & Treatment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium">Inherent Risk</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getScoreBadge(risk.inherentScore)}`}>
                    Score: {risk.inherentScore} (L{risk.likelihood} × I{risk.impact})
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 mt-1">
                  Treatment: <strong className="text-blue-700 font-semibold">{risk.treatmentOption}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium">Residual Risk</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getScoreBadge(risk.residualScore)}`}>
                    Score: {risk.residualScore} (L{risk.residualLikelihood} × I{risk.residualImpact})
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 mt-1 truncate">
                  Controls: <span className="text-slate-600">{risk.mitigationControl}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between text-[11px]">
                <div className="text-slate-500">Risk Owner: <strong className="text-slate-800">{risk.treatmentOwner}</strong></div>
                <div className="text-slate-500">Target Date: <strong className="text-slate-800">{risk.targetDate}</strong></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Risk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingRisk ? `Edit Risk — ${editingRisk.riskCode}` : 'Conduct Information Security Risk Assessment'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRisk} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Risk Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Unauthorized access to cloud database snapshot backups"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none"
                  >
                    <option value="Information Security">Information Security</option>
                    <option value="Asset">Asset</option>
                    <option value="Process">Process</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Item</label>
                  <input
                    type="text"
                    required
                    value={linkedItem}
                    onChange={e => setLinkedItem(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Threat Description</label>
                <textarea
                  rows={2}
                  value={threatDescription}
                  onChange={e => setThreatDescription(e.target.value)}
                  placeholder="e.g. Malicious external actor exploits leaked API credential"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vulnerability Description</label>
                <textarea
                  rows={2}
                  value={vulnerabilityDescription}
                  onChange={e => setVulnerabilityDescription(e.target.value)}
                  placeholder="e.g. Hardcoded secrets in client repository and lack of automated secret scanning"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inherent Likelihood (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={likelihood}
                    onChange={e => setLikelihood(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inherent Impact (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={impact}
                    onChange={e => setImpact(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Option</label>
                  <select
                    value={treatmentOption}
                    onChange={e => setTreatmentOption(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  >
                    <option value="Mitigate">Mitigate (Implement Controls)</option>
                    <option value="Transfer">Transfer (Insurance / SLA)</option>
                    <option value="Avoid">Avoid (Terminate Process)</option>
                    <option value="Accept">Accept (Residual Tolerance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Controls / Actions</label>
                  <input
                    type="text"
                    value={mitigationControl}
                    onChange={e => setMitigationControl(e.target.value)}
                    placeholder="e.g. A.8.1, A.8.2 MFA & Endpoint Policy"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residual Likelihood (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={residualLikelihood}
                    onChange={e => setResidualLikelihood(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residual Impact (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={residualImpact}
                    onChange={e => setResidualImpact(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Owner</label>
                  <input
                    type="text"
                    value={treatmentOwner}
                    onChange={e => setTreatmentOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Real-time SoA Exclusion Conflict Warning inside Form */}
              {conflictingExcludedControls.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>SoA Exclusion Conflict Detected (ISO 27001 Cl. 6.1.3 d)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Control <strong>{conflictingExcludedControls.map(c => `${c.controlCode} (${c.title})`).join(', ')}</strong> is currently marked <strong>EXCLUDED</strong> in your Statement of Applicability with justification: <em>"{conflictingExcludedControls[0].justification}"</em>.
                  </p>
                  <p className="text-[11px] text-amber-900 font-semibold">
                    Saving this risk will automatically flag this justification as outdated in the SoA Sync Verifier.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Save Risk Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* Statement of Applicability (SoA) Sync Verifier Modal */}
      <SoASyncVerifierModal isOpen={showVerifierModal} onClose={() => setShowVerifierModal(false)} />
    </PageContainer>
  );
};
