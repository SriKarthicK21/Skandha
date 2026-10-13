import React, { useState, useEffect, useMemo } from 'react';
import { RiskRecord, RiskTreatmentOption, RiskEvidenceLink, RiskTelemetrySignal } from '../../types';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { safeConfirm } from '../../utils/safeConfirm';
import { RiskEngine } from '../../services/RiskEngine';
import { MAS_TRM_REQUIREMENTS_2021 } from '../../data/masTRMRequirements2021';
import {
  X,
  Shield,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  Layers,
  Save,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  FileCheck,
  FileText,
  Lock,
  Cpu,
  Radio,
  Plus,
  Hash,
  Clock,
  RotateCcw,
  Check,
  AlertCircle,
  Award,
  ExternalLink
} from 'lucide-react';

interface RiskDetailModalProps {
  risk: RiskRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({ risk, isOpen, onClose }) => {
  const { updateRisk, deleteRisk, currentUser, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'scoring' | 'acceptance' | 'evidence' | 'crosswalk' | 'telemetry'>('scoring');
  const [formData, setFormData] = useState<Partial<RiskRecord>>({});

  // New Evidence Attachment Form State
  const [newEvidenceName, setNewEvidenceName] = useState('');
  const [newEvidenceControl, setNewEvidenceControl] = useState('A.5.15');
  const [newEvidenceType, setNewEvidenceType] = useState('Audit Log & Config Artifact');
  const [newEvidenceHash, setNewEvidenceHash] = useState('');
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);

  // New Framework Mapping Tag State
  const [newIso27001Tag, setNewIso27001Tag] = useState('');
  const [newIso42001Tag, setNewIso42001Tag] = useState('');
  const [newMasTrmTag, setNewMasTrmTag] = useState('');
  const [selectedMasReqToAdd, setSelectedMasReqToAdd] = useState('');

  // Intelligent Suggestions for MAS TRM Mapping based on title, category, threat
  const suggestedMasReqs = useMemo(() => {
    if (!risk) return [];
    return RiskEngine.suggestMasRequirementMappings(formData);
  }, [formData, risk]);

  // Handle adding/removing specific MAS TRM requirement IDs
  const handleAddMasRequirementId = (reqId: string) => {
    if (!reqId) return;
    const currentReqs = formData.frameworkMappings?.masTrmRequirementIds || [];
    if (currentReqs.includes(reqId)) return;

    setFormData(prev => ({
      ...prev,
      frameworkMappings: {
        ...prev.frameworkMappings,
        masTrmRequirementIds: [...currentReqs, reqId]
      } as any
    }));
    setSelectedMasReqToAdd('');
  };

  const handleRemoveMasRequirementId = (reqId: string) => {
    setFormData(prev => ({
      ...prev,
      frameworkMappings: {
        ...prev.frameworkMappings,
        masTrmRequirementIds: (prev.frameworkMappings?.masTrmRequirementIds || []).filter(id => id !== reqId)
      } as any
    }));
  };

  useEffect(() => {
    if (risk) {
      setFormData({
        ...risk,
        controlEffectiveness: risk.controlEffectiveness || 90,
        evidenceLinks: risk.evidenceLinks || [],
        frameworkMappings: risk.frameworkMappings || {
          iso27001Controls: ['A.5.15'],
          iso42001Controls: [],
          masTrmSections: ['MAS TRM 5.1']
        },
        executiveAcceptance: risk.executiveAcceptance || {
          required: false,
          status: 'Not Required',
          reviewFrequencyMonths: 12
        },
        telemetrySignals: risk.telemetrySignals || []
      });
      setActiveTab('scoring');
    }
  }, [risk]);

  if (!isOpen || !risk) return null;

  const inherentScore = (formData.likelihood || 1) * (formData.impact || 1);
  const residualScore = (formData.residualLikelihood || 1) * (formData.residualImpact || 1);

  const getScoreBadge = (score: number) => {
    if (score >= 16) return { text: 'Critical', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    if (score >= 10) return { text: 'High', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (score >= 5) return { text: 'Moderate', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
    return { text: 'Low / Acceptable', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  const handleSave = () => {
    if (!risk) return;
    updateRisk(risk.id, {
      ...formData,
      inherentScore,
      residualScore
    });

    logAuditEvent(
      'UPDATE',
      'Risk Management',
      `Updated ${risk.riskCode} ("${risk.title}") - Residual Score: ${residualScore}`
    );

    showToast({
      title: 'Risk Record Updated',
      message: `${risk.riskCode} scores, evidence, and executive workflows saved.`,
      type: 'success'
    });
    onClose();
  };

  const handleDelete = () => {
    if (!risk) return;
    if (safeConfirm(`Are you sure you want to remove ${risk.riskCode}?`)) {
      deleteRisk(risk.id);
      showToast({
        title: 'Risk Deleted',
        message: `${risk.riskCode} was removed from the risk register.`,
        type: 'info'
      });
      onClose();
    }
  };

  // Clause 6.1.3 Sign-Off Workflow
  const handleExecuteExecutiveSignoff = () => {
    const timestamp = new Date().toISOString();
    const expiry = new Date();
    const months = formData.executiveAcceptance?.reviewFrequencyMonths || 12;
    expiry.setMonth(expiry.getMonth() + months);

    const updatedAcceptance = {
      required: true,
      status: 'Accepted' as const,
      acceptedBy: `${currentUser.name} (${currentUser.role})`,
      acceptedAt: timestamp,
      reviewFrequencyMonths: months,
      expiryDate: expiry.toISOString().split('T')[0],
      justification: formData.executiveAcceptance?.justification || `Residual score of ${residualScore} is within organizational risk appetite threshold.`,
      compensatingControls: formData.executiveAcceptance?.compensatingControls || 'Continuous SIEM alerting and quarterly re-assessment.',
      boardMeetingRef: formData.executiveAcceptance?.boardMeetingRef || `Q3-2026-BOR-APP-${risk.riskCode}`
    };

    setFormData(prev => ({
      ...prev,
      treatmentOption: 'Accept',
      executiveAcceptance: updatedAcceptance
    }));

    showToast({
      title: 'Executive Acceptance Signed',
      message: `Clause 6.1.3 formal approval recorded by ${currentUser.name}.`,
      type: 'success'
    });
  };

  // Add Evidence link
  const handleAddEvidence = () => {
    if (!newEvidenceName.trim()) return;

    const newEvidence: RiskEvidenceLink = {
      id: `ev_${Date.now()}`,
      name: newEvidenceName,
      controlCode: newEvidenceControl,
      type: newEvidenceType,
      sha256Hash: newEvidenceHash.trim() || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadedDate: new Date().toISOString().split('T')[0],
      status: 'Verified'
    };

    setFormData(prev => ({
      ...prev,
      evidenceLinks: [...(prev.evidenceLinks || []), newEvidence]
    }));

    setNewEvidenceName('');
    setNewEvidenceHash('');
    setIsAddingEvidence(false);

    showToast({
      title: 'Evidence Artifact Linked',
      message: `Attached ${newEvidence.name} to ${risk.riskCode}.`,
      type: 'success'
    });
  };

  // Remove Evidence Link
  const handleRemoveEvidence = (id: string) => {
    setFormData(prev => ({
      ...prev,
      evidenceLinks: (prev.evidenceLinks || []).filter(e => e.id !== id)
    }));
  };

  // Add Framework Tags
  const handleAddFrameworkTag = (type: 'iso27' | 'iso42' | 'mas') => {
    if (type === 'iso27' && newIso27001Tag.trim()) {
      setFormData(prev => ({
        ...prev,
        frameworkMappings: {
          ...prev.frameworkMappings,
          iso27001Controls: [...(prev.frameworkMappings?.iso27001Controls || []), newIso27001Tag.trim()]
        } as any
      }));
      setNewIso27001Tag('');
    } else if (type === 'iso42' && newIso42001Tag.trim()) {
      setFormData(prev => ({
        ...prev,
        frameworkMappings: {
          ...prev.frameworkMappings,
          iso42001Controls: [...(prev.frameworkMappings?.iso42001Controls || []), newIso42001Tag.trim()]
        } as any
      }));
      setNewIso42001Tag('');
    } else if (type === 'mas' && newMasTrmTag.trim()) {
      setFormData(prev => ({
        ...prev,
        frameworkMappings: {
          ...prev.frameworkMappings,
          masTrmSections: [...(prev.frameworkMappings?.masTrmSections || []), newMasTrmTag.trim()]
        } as any
      }));
      setNewMasTrmTag('');
    }
  };

  const handleRemoveFrameworkTag = (type: 'iso27' | 'iso42' | 'mas', tag: string) => {
    setFormData(prev => {
      const mappings = prev.frameworkMappings || { iso27001Controls: [], iso42001Controls: [], masTrmSections: [] };
      if (type === 'iso27') {
        return {
          ...prev,
          frameworkMappings: { ...mappings, iso27001Controls: mappings.iso27001Controls.filter(t => t !== tag) }
        };
      }
      if (type === 'iso42') {
        return {
          ...prev,
          frameworkMappings: { ...mappings, iso42001Controls: mappings.iso42001Controls.filter(t => t !== tag) }
        };
      }
      return {
        ...prev,
        frameworkMappings: { ...mappings, masTrmSections: mappings.masTrmSections.filter(t => t !== tag) }
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-bold text-xs text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800">
              {risk.riskCode}
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{risk.title}</h2>
              <span className="text-xs text-slate-400">{risk.category} • {risk.department} • {risk.linkedItem}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-5 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scoring')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'scoring'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Scoring & Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('acceptance')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'acceptance'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Clause 6.1.3 Executive Acceptance</span>
            {formData.executiveAcceptance?.status === 'Accepted' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Evidence & Control Efficacy ({formData.evidenceLinks?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('crosswalk')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'crosswalk'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tri-Framework Crosswalk</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Telemetry CCM</span>
            {(formData.telemetrySignals || []).some(s => s.active) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: SCORING & THREAT DETAILS */}
          {activeTab === 'scoring' && (
            <div className="space-y-6">
              {/* Risk Scoring Panel: Inherent vs Residual Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                {/* Inherent (Raw Threat) */}
                <div className="space-y-3 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>Inherent Risk (Raw Threat)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getScoreBadge(inherentScore).bg}`}>
                      Score: {inherentScore} ({getScoreBadge(inherentScore).text})
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Likelihood: {formData.likelihood || 1} / 5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.likelihood || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, likelihood: parseInt(e.target.value) as any }))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Impact Severity: {formData.impact || 1} / 5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.impact || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, impact: parseInt(e.target.value) as any }))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Residual (Post-Control) */}
                <div className="space-y-3 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Residual Risk (Post-Control)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getScoreBadge(residualScore).bg}`}>
                      Score: {residualScore} ({getScoreBadge(residualScore).text})
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Residual Likelihood: {formData.residualLikelihood || 1} / 5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.residualLikelihood || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, residualLikelihood: parseInt(e.target.value) as any }))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Residual Impact: {formData.residualImpact || 1} / 5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.residualImpact || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, residualImpact: parseInt(e.target.value) as any }))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Threat & Vulnerability Details */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Threat Description</label>
                  <textarea
                    value={formData.threatDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, threatDescription: e.target.value }))}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Vulnerability / Root Cause</label>
                  <textarea
                    value={formData.vulnerabilityDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, vulnerabilityDescription: e.target.value }))}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Treatment Strategy & Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Treatment Strategy</label>
                  <select
                    value={formData.treatmentOption || 'Mitigate'}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatmentOption: e.target.value as RiskTreatmentOption }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Mitigate">Mitigate (Implement Controls)</option>
                    <option value="Transfer">Transfer (Insurance / Vendor SLA)</option>
                    <option value="Avoid">Avoid (Terminate Activity)</option>
                    <option value="Accept">Accept (Within Formal Appetite)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Treatment Owner</label>
                  <input
                    type="text"
                    value={formData.treatmentOwner || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatmentOwner: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Mitigation Controls & Description</label>
                <textarea
                  value={formData.mitigationControl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, mitigationControl: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="escalate-toggle"
                  checked={formData.escalatedToSuperAdmin || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, escalatedToSuperAdmin: e.target.checked }))}
                  className="w-4 h-4 rounded accent-rose-500"
                />
                <label htmlFor="escalate-toggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Escalate to Executive Risk Committee / Super Admin Console
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CLAUSE 6.1.3 EXECUTIVE ACCEPTANCE */}
          {activeTab === 'acceptance' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 flex items-start space-x-3">
                <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    ISO/IEC 27001:2022 Clause 6.1.3 & ISO 27005 Formal Risk Acceptance
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Formal accountability and digital sign-off by designated CISO or Board Risk Committee.
                    All accepted residual risks require compensating controls, documented justification, and scheduled periodic re-evaluations.
                  </p>
                </div>
              </div>

              {/* Digital Acceptance Status Card */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-300">Acceptance Sign-off State</div>
                    <div className="text-[11px] text-slate-500">Clause 6.1.3 Digital Approval Registry</div>
                  </div>

                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    formData.executiveAcceptance?.status === 'Accepted'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {formData.executiveAcceptance?.status || 'Not Required'}
                  </span>
                </div>

                {formData.executiveAcceptance?.status === 'Accepted' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Accepted By:</span>
                      <strong className="text-white">{formData.executiveAcceptance.acceptedBy}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Signed At:</span>
                      <strong className="text-white">{new Date(formData.executiveAcceptance.acceptedAt || '').toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Next Re-Assessment Expiry:</span>
                      <strong className="text-amber-400">{formData.executiveAcceptance.expiryDate || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Board Minute Ref:</span>
                      <strong className="text-sky-400">{formData.executiveAcceptance.boardMeetingRef || 'N/A'}</strong>
                    </div>
                  </div>
                )}

                {/* Form Controls */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Risk Acceptance Justification (Clause 6.1.3 Rationale)
                    </label>
                    <textarea
                      value={formData.executiveAcceptance?.justification || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        executiveAcceptance: {
                          ...prev.executiveAcceptance,
                          justification: e.target.value
                        } as any
                      }))}
                      placeholder="Detail why this residual risk is acceptable to the board..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Compensating Security Controls
                    </label>
                    <textarea
                      value={formData.executiveAcceptance?.compensatingControls || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        executiveAcceptance: {
                          ...prev.executiveAcceptance,
                          compensatingControls: e.target.value
                        } as any
                      }))}
                      placeholder="Specify compensating controls (e.g. enhanced real-time SIEM alarms, token verification)..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Board Meeting / Audit Committee Reference
                      </label>
                      <input
                        type="text"
                        value={formData.executiveAcceptance?.boardMeetingRef || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          executiveAcceptance: {
                            ...prev.executiveAcceptance,
                            boardMeetingRef: e.target.value
                          } as any
                        }))}
                        placeholder="e.g. Q3-2026-BOR-MIN-04"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Review Frequency
                      </label>
                      <select
                        value={formData.executiveAcceptance?.reviewFrequencyMonths || 12}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          executiveAcceptance: {
                            ...prev.executiveAcceptance,
                            reviewFrequencyMonths: parseInt(e.target.value)
                          } as any
                        }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value={3}>Quarterly (Every 3 Months)</option>
                        <option value={6}>Semi-Annual (Every 6 Months)</option>
                        <option value={12}>Annual (Every 12 Months)</option>
                      </select>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={handleExecuteExecutiveSignoff}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-950 transition-all"
                    >
                      <Award className="w-4 h-4" />
                      <span>Execute Digital Sign-off & Approve Acceptance</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE & CONTROL EFFICACY */}
          {activeTab === 'evidence' && (
            <div className="space-y-5">
              {/* Control Effectiveness Slider */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Control Effectiveness Score</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formData.controlEffectiveness || 90}% Efficacy
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={formData.controlEffectiveness || 90}
                  onChange={(e) => setFormData(prev => ({ ...prev, controlEffectiveness: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50% (Weak / Partially Implemented)</span>
                  <span>75% (Substantial)</span>
                  <span>100% (Fully Automated & Tested)</span>
                </div>
              </div>

              {/* Evidence Artifacts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">
                    Linked Evidence Artifacts & Cryptographic Checksums
                  </span>
                  <button
                    onClick={() => setIsAddingEvidence(!isAddingEvidence)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link New Evidence</span>
                  </button>
                </div>

                {isAddingEvidence && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-sky-900/60 space-y-3">
                    <div className="font-bold text-white text-xs">Attach Evidence Artifact</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Artifact Title</label>
                        <input
                          type="text"
                          value={newEvidenceName}
                          onChange={(e) => setNewEvidenceName(e.target.value)}
                          placeholder="e.g. AWS IAM Identity Center OIDC Policy"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Control Code</label>
                        <input
                          type="text"
                          value={newEvidenceControl}
                          onChange={(e) => setNewEvidenceControl(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Artifact Type</label>
                        <input
                          type="text"
                          value={newEvidenceType}
                          onChange={(e) => setNewEvidenceType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">SHA-256 Checksum Hash (Optional)</label>
                      <input
                        type="text"
                        value={newEvidenceHash}
                        onChange={(e) => setNewEvidenceHash(e.target.value)}
                        placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setIsAddingEvidence(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddEvidence}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold"
                      >
                        Add to Risk Record
                      </button>
                    </div>
                  </div>
                )}

                {(formData.evidenceLinks || []).length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                    <FileText className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                    <p className="font-semibold text-xs">No evidence artifacts attached yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(formData.evidenceLinks || []).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{ev.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">
                                {ev.controlCode}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                                {ev.status}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-xl">
                              SHA256: {ev.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveEvidence(ev.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TRI-FRAMEWORK CROSSWALK */}
          {activeTab === 'crosswalk' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/60">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Harmonized Multi-Standard Compliance Crosswalk</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Tag which specific framework controls and regulatory guidelines are satisfied by resolving this risk.
                </p>
              </div>

              {/* ISO 27001 Annex A */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 text-xs flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>ISO/IEC 27001:2022 Annex A Controls</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.frameworkMappings?.iso27001Controls || []).map(tag => (
                    <span key={tag} className="flex items-center space-x-1 text-xs font-mono font-bold px-2 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-800">
                      <span>{tag}</span>
                      <button onClick={() => handleRemoveFrameworkTag('iso27', tag)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add ISO 27001 control (e.g. A.5.15, A.8.7)"
                    value={newIso27001Tag}
                    onChange={(e) => setNewIso27001Tag(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white flex-1"
                  />
                  <button
                    onClick={() => handleAddFrameworkTag('iso27')}
                    className="px-3 py-1 rounded-lg bg-sky-600 text-white font-bold text-xs"
                  >
                    Add Control
                  </button>
                </div>
              </div>

              {/* ISO 42001 AIMS AI */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400 text-xs flex items-center space-x-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>ISO/IEC 42001:2023 AIMS AI Controls</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.frameworkMappings?.iso42001Controls || []).map(tag => (
                    <span key={tag} className="flex items-center space-x-1 text-xs font-mono font-bold px-2 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800">
                      <span>{tag}</span>
                      <button onClick={() => handleRemoveFrameworkTag('iso42', tag)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add ISO 42001 control (e.g. A.5.1, A.6.2)"
                    value={newIso42001Tag}
                    onChange={(e) => setNewIso42001Tag(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white flex-1"
                  />
                  <button
                    onClick={() => handleAddFrameworkTag('iso42')}
                    className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs"
                  >
                    Add Control
                  </button>
                </div>
              </div>

              {/* MAS TRM Singapore & Requirement ID Mapping */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 text-xs flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>MAS Technology Risk Management (TRM) &amp; Notices 644/655</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(formData.frameworkMappings?.masTrmRequirementIds || []).length} Requirements Mapped
                  </span>
                </div>

                {/* 1. Specific MAS Requirement IDs */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Mapped MAS TRM Requirement IDs (Heatmap Exposure Drivers):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.frameworkMappings?.masTrmRequirementIds || []).length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No specific MAS requirements linked yet.</span>
                    ) : (
                      (formData.frameworkMappings?.masTrmRequirementIds || []).map(reqId => {
                        const reqDef = MAS_TRM_REQUIREMENTS_2021.find(r => r.id === reqId || r.requirementCode === reqId);
                        return (
                          <span
                            key={reqId}
                            className="inline-flex items-center space-x-1 text-xs font-mono font-bold px-2 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800"
                            title={reqDef?.title || reqId}
                          >
                            <span>{reqId}</span>
                            {reqDef?.criticalSystemsMandate && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                                Notice
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMasRequirementId(reqId)}
                              className="hover:text-rose-400 ml-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Dropdown Selector for Adding MAS Requirement */}
                <div className="flex items-center space-x-2 pt-1">
                  <select
                    value={selectedMasReqToAdd}
                    onChange={(e) => setSelectedMasReqToAdd(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select MAS TRM Requirement to Map --</option>
                    {MAS_TRM_REQUIREMENTS_2021.map(req => (
                      <option key={req.id} value={req.id}>
                        {req.requirementCode} (D{req.domainNumber}): {req.title.slice(0, 48)}... {req.criticalSystemsMandate ? '[Notice]' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddMasRequirementId(selectedMasReqToAdd)}
                    disabled={!selectedMasReqToAdd}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-colors"
                  >
                    Map Requirement
                  </button>
                </div>

                {/* Intelligent AI / Rule Suggested Mappings */}
                {suggestedMasReqs.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Suggested MAS TRM Requirement Mappings:</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedMasReqs.map(sug => {
                        const isAlreadyMapped = (formData.frameworkMappings?.masTrmRequirementIds || []).includes(sug.requirementId);
                        if (isAlreadyMapped) return null;
                        return (
                          <button
                            key={sug.requirementId}
                            type="button"
                            onClick={() => handleAddMasRequirementId(sug.requirementId)}
                            className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 transition-colors cursor-pointer"
                            title={sug.rationale}
                          >
                            <span>+ {sug.requirementId}</span>
                            <span className="text-[9px] text-slate-400">({Math.round(sug.confidence * 100)}%)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* General MAS TRM Section Tags */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <label className="text-[10px] text-slate-400 block font-medium">General MAS Section Tags (Legacy / Crosswalk):</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.frameworkMappings?.masTrmSections || []).map(tag => (
                      <span key={tag} className="flex items-center space-x-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <span>{tag}</span>
                        <button type="button" onClick={() => handleRemoveFrameworkTag('mas', tag)} className="hover:text-rose-400">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add MAS section (e.g. MAS Notice 644, TRM 5.1)"
                      value={newMasTrmTag}
                      onChange={(e) => setNewMasTrmTag(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFrameworkTag('mas')}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      Add Section
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE TELEMETRY SIGNALS */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/60 flex items-start space-x-3">
                <Radio className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Continuous Control Telemetry & Dynamic Threat Elevation
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Real-time webhook events linked directly to this risk asset. Active signals dynamically elevate likelihood and residual scoring until resolved.
                  </p>
                </div>
              </div>

              {(formData.telemetrySignals || []).length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                  <Radio className="w-6 h-6 text-slate-600 mx-auto mb-1 animate-pulse" />
                  <p className="font-semibold text-xs">No active telemetry alerts for this risk.</p>
                  <p className="text-[11px] text-slate-500 mt-1">All telemetry sensors currently reporting normal baseline.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(formData.telemetrySignals || []).map((sig, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        sig.active
                          ? 'bg-rose-950/30 border-rose-700'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                            {sig.source}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            sig.active ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {sig.active ? 'ACTIVE ALERT' : 'RESOLVED'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(sig.detectedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white mt-1.5">
                        {sig.alertTitle}
                      </div>

                      {sig.rawPayloadSnippet && (
                        <div className="mt-2 p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-400 border border-slate-800">
                          {sig.rawPayloadSnippet}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-900/60 font-semibold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Risk</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-950 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update D3 Heatmap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
