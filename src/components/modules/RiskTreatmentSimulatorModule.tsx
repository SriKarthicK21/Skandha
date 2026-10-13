import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { RiskRecord, RiskTreatmentScenario } from '../../types';
import {
  ShieldAlert,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Save,
  Check,
  RotateCcw,
  FileCheck,
  Zap,
  DollarSign,
  Calendar,
  User,
  Shield,
  HelpCircle,
  Clock,
  Trash2,
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';
import { PageContainer } from '../layout/PageContainer';

export const RiskTreatmentSimulatorModule: React.FC = () => {
  const {
    risks,
    riskScenarios,
    saveRiskScenario,
    deleteRiskScenario,
    applyRiskTreatmentFromSimulation,
    currentTenant,
    currentUser,
    setActiveModule
  } = useGRC();

  const tenantRisks = risks.filter(r => r.tenantId === currentTenant?.id);
  const tenantScenarios = riskScenarios.filter(s => s.tenantId === currentTenant?.id);

  // Selected Risk to simulate
  const [selectedRiskId, setSelectedRiskId] = useState<string>(tenantRisks[0]?.id || '');
  const selectedRisk = tenantRisks.find(r => r.id === selectedRiskId) || tenantRisks[0];

  // Simulation Controls & Strategy Form State
  const [scenarioName, setScenarioName] = useState('Scenario 1: Control Hardening & Automation');
  const [treatmentOption, setTreatmentOption] = useState<RiskRecord['treatmentOption']>('Mitigate');
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [customControlText, setCustomControlText] = useState('');
  const [projectedLikelihood, setProjectedLikelihood] = useState<number>(1);
  const [projectedImpact, setProjectedImpact] = useState<number>(2);
  const [treatmentOwner, setTreatmentOwner] = useState('SriKarthiK (CISO)');
  const [targetDate, setTargetDate] = useState('2026-10-15');
  const [estimatedCostEffort, setEstimatedCostEffort] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [justificationNotes, setJustificationNotes] = useState('');

  // Notification state for actions
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Available Annex A ISO 27001 Controls Bank
  const ANNEX_A_CONTROLS_BANK = [
    { code: 'A.5.15', label: 'A.5.15 Access control & Identity Verification' },
    { code: 'A.5.19', label: 'A.5.19 Information security in supplier relationships' },
    { code: 'A.5.22', label: 'A.5.22 Monitoring, review & change of supplier services' },
    { code: 'A.5.29', label: 'A.5.29 Information security during disruption (BCP/DR)' },
    { code: 'A.6.3', label: 'A.6.3 Information security awareness, education & training' },
    { code: 'A.8.7', label: 'A.8.7 Protection against malware (EDR & Heuristics)' },
    { code: 'A.8.8', label: 'A.8.8 Management of technical vulnerabilities (Patch SLA)' },
    { code: 'A.8.9', label: 'A.8.9 Configuration management & Baseline Drift Detection' },
    { code: 'A.8.19', label: 'A.8.19 Information security in use of cloud services' },
    { code: 'A.8.20', label: 'A.8.20 Network security & Micro-segmentation' },
    { code: 'A.8.24', label: 'A.8.24 Use of cryptography & Automated Key Rotation' },
    { code: 'A.8.28', label: 'A.8.28 Secure coding & Static Application Testing' }
  ];

  // Sync state when selected risk changes
  useEffect(() => {
    if (selectedRisk) {
      setScenarioName(`Simulation for ${selectedRisk.riskCode}: ${selectedRisk.title.substring(0, 35)}...`);
      setTreatmentOption(selectedRisk.treatmentOption || 'Mitigate');
      setProjectedLikelihood(selectedRisk.residualLikelihood || 1);
      setProjectedImpact(selectedRisk.residualImpact || 2);
      setTreatmentOwner(selectedRisk.treatmentOwner || `${currentUser.name} (${currentUser.role})`);
      setTargetDate(selectedRisk.targetDate || '2026-10-30');
      setCustomControlText(selectedRisk.mitigationControl || '');
      setJustificationNotes('');
    }
  }, [selectedRiskId]);

  // Calculations
  const inherentLikelihood = selectedRisk?.likelihood || 3;
  const inherentImpact = selectedRisk?.impact || 4;
  const inherentScore = inherentLikelihood * inherentImpact;

  const projectedResidualScore = projectedLikelihood * projectedImpact;
  const scoreDelta = inherentScore - projectedResidualScore;
  const riskReductionPercentage = inherentScore > 0 ? Math.round((scoreDelta / inherentScore) * 100) : 0;

  const getScoreBadge = (score: number) => {
    if (score >= 15) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (score >= 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (score >= 5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 15) return 'Critical Risk';
    if (score >= 10) return 'High Risk';
    if (score >= 5) return 'Medium Risk';
    return 'Low (Acceptable)';
  };

  const toggleControl = (ctrl: string) => {
    if (selectedControls.includes(ctrl)) {
      setSelectedControls(selectedControls.filter(c => c !== ctrl));
    } else {
      setSelectedControls([...selectedControls, ctrl]);
    }
  };

  const handleSaveDraftScenario = () => {
    if (!selectedRisk) return;
    const combinedControls = [
      ...selectedControls,
      customControlText.trim() ? customControlText.trim() : ''
    ].filter(Boolean);

    saveRiskScenario({
      riskId: selectedRisk.id,
      riskCode: selectedRisk.riskCode,
      riskTitle: selectedRisk.title,
      scenarioName: scenarioName.trim() || `Treatment Plan for ${selectedRisk.riskCode}`,
      treatmentOption,
      proposedControls: combinedControls,
      customControlDescription: customControlText,
      targetOwner: treatmentOwner,
      targetDate,
      inherentLikelihood,
      inherentImpact,
      inherentScore,
      projectedLikelihood,
      projectedImpact,
      projectedResidualScore,
      scoreDelta,
      riskReductionPercentage,
      estimatedCostEffort,
      justificationNotes: justificationNotes.trim()
    });

    showToast(`Simulation scenario "${scenarioName}" saved to comparisons.`, 'success');
  };

  const handleApplyTreatmentToRiskRegister = () => {
    if (!selectedRisk) return;
    const combinedControlStr = [
      ...selectedControls,
      customControlText.trim()
    ].filter(Boolean).join('; ');

    applyRiskTreatmentFromSimulation(selectedRisk.id, {
      treatmentOption,
      mitigationControl: combinedControlStr || 'ISO 27001 Controls Implemented',
      residualLikelihood: projectedLikelihood,
      residualImpact: projectedImpact,
      treatmentOwner,
      targetDate,
      notes: justificationNotes
    });

    showToast(`Simulated treatment successfully committed to Risk ${selectedRisk.riskCode} in live Risk Register!`, 'success');
  };

  const showToast = (text: string, type: 'success' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <PageContainer id="risk-treatment-simulator-module" className="font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-3.5 rounded-xl border shadow-md flex items-center justify-between text-xs font-semibold animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-blue-50 text-blue-800 border-blue-300'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Header Banner - High Density Style */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
              Risk Decision Support
            </span>
            <span className="text-xs text-slate-500 font-medium">ISO/IEC 27001:2022 Clause 6.1.3</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Risk Treatment Scenario Simulator</h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Simulate the mathematical impact of mitigation controls, risk transfers, avoidance, and acceptance strategies on inherent likelihood and impact scores before committing treatments.
          </p>
        </div>

        {/* Global Action Shortcut */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveModule('risk_assessment')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>View Risk Register</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Interactive Controls vs Live Projection 5x5 Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Risk Selector & Treatment Strategy Playground (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Risk Target Selector */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>1. Select Target Risk from Register</span>
              </label>
              <span className="text-[11px] text-slate-500">{tenantRisks.length} active risks in register</span>
            </div>

            <select
              value={selectedRiskId}
              onChange={e => setSelectedRiskId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tenantRisks.map(r => (
                <option key={r.id} value={r.id}>
                  {r.riskCode} - {r.title} (Inherent Score: {r.inherentScore} • {getScoreLabel(r.inherentScore)})
                </option>
              ))}
            </select>

            {/* Inherent Risk Card Summary */}
            {selectedRisk && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700 text-xs">{selectedRisk.riskCode}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getScoreBadge(selectedRisk.inherentScore)}`}>
                    Inherent: Score {selectedRisk.inherentScore} (L{selectedRisk.likelihood} × I{selectedRisk.impact}) • {getScoreLabel(selectedRisk.inherentScore)}
                  </span>
                </div>

                <div className="text-slate-800 font-semibold">{selectedRisk.title}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Threat Vector:</span>
                    <span className="font-medium text-slate-700 line-clamp-2">{selectedRisk.threatDescription || 'Unspecified external threat vector'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vulnerability Exposure:</span>
                    <span className="font-medium text-slate-700 line-clamp-2">{selectedRisk.vulnerabilityDescription || 'Unpatched configuration or access weakness'}</span>
                  </div>
                </div>

                {selectedRisk.inherentScore >= 15 && (
                  <div className="p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span><strong>Super Admin Escalation Active:</strong> Score exceeds the 15-point regulatory threshold.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Treatment Option & Strategy Selection */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>2. Configure Treatment Strategy & Controls</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">ISO 27001 6.1.3</span>
            </div>

            {/* Treatment Strategy Cards (Mitigate / Transfer / Avoid / Accept) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                {
                  id: 'Mitigate',
                  label: 'Mitigate (Control)',
                  desc: 'Apply ISO controls to reduce probability/impact',
                  color: 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500'
                },
                {
                  id: 'Transfer',
                  label: 'Transfer (Share)',
                  desc: 'Cyber insurance, SLA indemnities, vendor shift',
                  color: 'border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-500'
                },
                {
                  id: 'Avoid',
                  label: 'Avoid (Terminate)',
                  desc: 'Decommission legacy system or cancel process',
                  color: 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                },
                {
                  id: 'Accept',
                  label: 'Accept (Retain)',
                  desc: 'Informed executive sign-off within risk appetite',
                  color: 'border-slate-500 bg-slate-100 text-slate-900 ring-1 ring-slate-500'
                }
              ].map(opt => {
                const isSelected = treatmentOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setTreatmentOption(opt.id as any)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? opt.color
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <p className="text-[10px] opacity-80 mt-0.5 line-clamp-2">{opt.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Annex A Control Selector Bank */}
            {treatmentOption === 'Mitigate' && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Select Applicable ISO/IEC 27001:2022 Annex A Controls:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                  {ANNEX_A_CONTROLS_BANK.map(ctrl => {
                    const isSelected = selectedControls.includes(ctrl.label);
                    return (
                      <button
                        type="button"
                        key={ctrl.code}
                        onClick={() => toggleControl(ctrl.label)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ctrl.code} - {ctrl.label.split('(')[0].replace(ctrl.code, '').trim()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Control Description / Transfer Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Implementation Details & Remediation Safeguards
              </label>
              <textarea
                rows={2}
                value={customControlText}
                onChange={e => setCustomControlText(e.target.value)}
                placeholder="e.g. Enforce WebAuthn hardware security keys, deploy automated KMS key rotation, and configure drift alerting"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Interactive Sliders for Projected Residual Likelihood & Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              {/* Likelihood Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Projected Likelihood:</span>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Level {projectedLikelihood} / 5 ({projectedLikelihood === 1 ? 'Rare' : projectedLikelihood === 2 ? 'Unlikely' : projectedLikelihood === 3 ? 'Possible' : projectedLikelihood === 4 ? 'Likely' : 'Almost Certain'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={projectedLikelihood}
                  onChange={e => setProjectedLikelihood(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Rare)</span>
                  <span>3 (Moderate)</span>
                  <span>5 (Frequent)</span>
                </div>
              </div>

              {/* Impact Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Projected Impact:</span>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Level {projectedImpact} / 5 ({projectedImpact === 1 ? 'Insignificant' : projectedImpact === 2 ? 'Minor' : projectedImpact === 3 ? 'Moderate' : projectedImpact === 4 ? 'Major' : 'Catastrophic'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={projectedImpact}
                  onChange={e => setProjectedImpact(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Negligible)</span>
                  <span>3 (Moderate)</span>
                  <span>5 (Catastrophic)</span>
                </div>
              </div>
            </div>

            {/* Treatment Metadata: Owner, Target Date, Effort */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Owner</label>
                <input
                  type="text"
                  value={treatmentOwner}
                  onChange={e => setTreatmentOwner(e.target.value)}
                  placeholder="e.g. SriKarthiK (CISO)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estimated Effort</label>
                <select
                  value={estimatedCostEffort}
                  onChange={e => setEstimatedCostEffort(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none"
                >
                  <option value="Low">Low (&lt; 20 hrs / low cost)</option>
                  <option value="Medium">Medium (1-2 sprints / moderate)</option>
                  <option value="High">High (Enterprise project / high cost)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={handleSaveDraftScenario}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-slate-600" />
                <span>Save Simulation Scenario</span>
              </button>

              <button
                type="button"
                onClick={handleApplyTreatmentToRiskRegister}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Treatment to Risk Register</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic 5x5 Heatmap & Live Projections (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time KPI Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Simulated Risk Reduction Projection</span>
              </span>
              <span className="font-mono text-emerald-600 text-xs font-bold">-{riskReductionPercentage}% Reduction</span>
            </h2>

            {/* Before vs After Scoreboard */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Inherent Risk (Before)</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{inherentScore}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  L{inherentLikelihood} × I{inherentImpact} • <span className="font-bold">{getScoreLabel(inherentScore)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-medium block">Projected Residual (After)</span>
                <div className="text-2xl font-black text-emerald-700 mt-0.5">{projectedResidualScore}</div>
                <div className="text-[10px] text-emerald-800 mt-0.5">
                  L{projectedLikelihood} × I{projectedImpact} • <span className="font-bold">{getScoreLabel(projectedResidualScore)}</span>
                </div>
              </div>
            </div>

            {/* Delta & Escalation Status Pill */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Risk Score Delta:</span>
              <span className="font-mono font-bold text-slate-900">
                {inherentScore} ➔ {projectedResidualScore} (Δ {scoreDelta} points)
              </span>
            </div>

            {/* Super Admin Escalation Resolution Check */}
            {inherentScore >= 15 && projectedResidualScore < 15 ? (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Escalation Resolved:</strong> Residual score drops below 15; automatic audit escalation cleared.</span>
              </div>
            ) : projectedResidualScore >= 15 ? (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>Residual Escalation:</strong> Projected score remains ≥ 15; requires formal Board exception sign-off.</span>
              </div>
            ) : null}
          </div>

          {/* Dynamic 5x5 Risk Heatmap Visualizer */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">5x5 Risk Matrix Projection Trajectory</h3>
              <div className="flex items-center space-x-2 text-[10px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="text-slate-600">Inherent</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-300" />
                  <span className="text-slate-600">Projected</span>
                </span>
              </div>
            </div>

            {/* 5x5 Grid */}
            <div className="space-y-1">
              <div className="flex text-[10px] text-slate-400 font-semibold mb-1 pl-6">
                <span>Impact (1 = Negligible ➔ 5 = Catastrophic)</span>
              </div>

              {[5, 4, 3, 2, 1].map(l => (
                <div key={l} className="flex items-center space-x-1">
                  <span className="w-5 text-[10px] font-mono font-bold text-slate-400 text-right pr-1">
                    L{l}
                  </span>
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map(i => {
                      const cellScore = l * i;
                      const isInherent = inherentLikelihood === l && inherentImpact === i;
                      const isProjected = projectedLikelihood === l && projectedImpact === i;

                      // Color coding based on ISO standard matrix
                      let cellColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                      if (cellScore >= 15) cellColor = 'bg-rose-50 text-rose-800 border-rose-100';
                      else if (cellScore >= 10) cellColor = 'bg-amber-50 text-amber-800 border-amber-100';
                      else if (cellScore >= 5) cellColor = 'bg-yellow-50 text-yellow-800 border-yellow-100';

                      return (
                        <div
                          key={i}
                          className={`h-9 rounded flex flex-col items-center justify-center border font-mono text-[10px] font-bold relative transition-all ${cellColor} ${
                            isInherent ? 'ring-2 ring-rose-500 ring-offset-1 z-10' : ''
                          } ${
                            isProjected ? 'ring-2 ring-emerald-500 ring-offset-1 z-20 shadow-md' : ''
                          }`}
                        >
                          <span className="text-[10px] opacity-75">{cellScore}</span>

                          {/* Marker for Inherent */}
                          {isInherent && (
                            <span className="absolute -top-1.5 -left-1.5 px-1 py-0.2 rounded-full bg-rose-600 text-white text-[8px] font-sans font-bold shadow-xs">
                              Before
                            </span>
                          )}

                          {/* Marker for Projected */}
                          {isProjected && (
                            <span className="absolute -bottom-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-sans font-bold shadow-xs">
                              After
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 pt-1 pl-6">
              <span>I1</span>
              <span>I2</span>
              <span>I3</span>
              <span>I4</span>
              <span>I5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Treatment Scenarios Comparison Table */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Saved Simulation Scenarios & Treatment Options</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare multiple hypothetical treatment scenarios side-by-side to evaluate cost-benefit and regulatory compliance prior to implementation.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Scenario Name</th>
                <th className="py-2.5 px-3">Target Risk</th>
                <th className="py-2.5 px-3">Option</th>
                <th className="py-2.5 px-3">Inherent ➔ Projected</th>
                <th className="py-2.5 px-3">Score Reduction</th>
                <th className="py-2.5 px-3">Effort</th>
                <th className="py-2.5 px-3">Owner & Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenantScenarios.length > 0 ? (
                tenantScenarios.map(scen => (
                  <tr key={scen.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{scen.scenarioName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Simulated by {scen.simulatedBy}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-blue-700">{scen.riskCode}</div>
                      <div className="text-slate-600 text-[11px] line-clamp-1">{scen.riskTitle}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]">
                        {scen.treatmentOption}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-slate-500">{scen.inherentScore}</span> ➔ <strong className="text-emerald-700">{scen.projectedResidualScore}</strong>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>-{scen.riskReductionPercentage}%</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        scen.estimatedCostEffort === 'Low' ? 'bg-emerald-50 text-emerald-700' : scen.estimatedCostEffort === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {scen.estimatedCostEffort} Effort
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      <div>{scen.targetOwner}</div>
                      <div className="text-slate-400">{scen.targetDate}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            applyRiskTreatmentFromSimulation(scen.riskId, {
                              treatmentOption: scen.treatmentOption,
                              mitigationControl: scen.proposedControls.join('; ') || scen.customControlDescription,
                              residualLikelihood: scen.projectedLikelihood,
                              residualImpact: scen.projectedImpact,
                              treatmentOwner: scen.targetOwner,
                              targetDate: scen.targetDate
                            });
                            showToast(`Applied scenario "${scen.scenarioName}" to live risk register!`, 'success');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                          title="Apply this simulated scenario directly to risk register"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => deleteRiskScenario(scen.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete scenario draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No simulation scenarios saved yet. Use the simulator above to model treatment options.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};
