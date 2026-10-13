import React, { useState } from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  History,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  UserCheck,
  Building2,
  FileText
} from 'lucide-react';
import { EnterpriseRiskRecord, ShowMeWhyExplanation, ShowMeWhatChangedExplanation, ShowMeNextActionExplanation } from '../../types/enterpriseRiskTypes';

interface RiskExplainabilityModalProps {
  risk: EnterpriseRiskRecord;
  initialTab?: 'why' | 'what-changed' | 'next-action';
  onClose: () => void;
}

export const RiskExplainabilityModal: React.FC<RiskExplainabilityModalProps> = ({
  risk,
  initialTab = 'why',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'why' | 'what-changed' | 'next-action'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {risk.riskCode}
                </span>
                <span className="text-xs text-slate-400">{risk.category}</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">{risk.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('why')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'why'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Show Me Why (Score Derivation)
          </button>
          <button
            onClick={() => setActiveTab('what-changed')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'what-changed'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Show Me What Changed
          </button>
          <button
            onClick={() => setActiveTab('next-action')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'next-action'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            Show Me Next Action (Remediation)
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'why' && (
            <div className="space-y-5">
              {/* Score Equation Box */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Deterministic Scoring Formula</span>
                  <span className="font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Methodology: {risk.methodologyVersion}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
                    <div className="text-slate-400 text-[11px]">Inherent Risk</div>
                    <div className="text-lg font-bold text-rose-400 font-mono mt-1">
                      {risk.inherentLikelihood} × {risk.inherentImpact} = {risk.inherentRiskScore}/25
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">({risk.inherentLevel} Severity)</div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
                    <div className="text-slate-400 text-[11px]">Control Effectiveness</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                      {risk.currentControlEffectivenessPercent}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">({risk.controlOperatingRating})</div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
                    <div className="text-slate-400 text-[11px]">Residual Risk</div>
                    <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                      {risk.residualLikelihood} × {risk.residualImpact} = {risk.residualRiskScore}/25
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">({risk.residualLevel} Severity)</div>
                  </div>
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Key Contributing Threat & Exposure Factors
                </h4>
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3.5 space-y-2 text-slate-300">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Threat Scenario:</strong> {risk.riskScenario}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Exposed Business Services:</strong> {risk.businessServiceIds.join(', ')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Regulatory Mandates:</strong> {risk.requirementIds.join(', ') || 'General Enterprise Baseline'}</span>
                  </div>
                </div>
              </div>

              {/* Mitigating Controls Analysis */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Mitigating Controls & Assurance Evidence
                </h4>
                <div className="space-y-2">
                  {risk.controlIds.map((ctrlId) => (
                    <div
                      key={ctrlId}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-mono font-bold text-white">{ctrlId}</span>
                          <span className="text-slate-400 ml-2">Operating Effectiveness: {risk.currentControlEffectivenessPercent}%</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {risk.assuranceStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appetite Check */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {risk.isOutsideAppetite ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <div>
                    <span className="font-bold text-white">Board Risk Appetite Evaluation:</span>
                    <span className="text-slate-400 ml-1.5">
                      Threshold {risk.riskAppetiteScore}/25 | Assessed Residual {risk.residualRiskScore}/25
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded font-bold font-mono text-[11px] ${
                    risk.isOutsideAppetite
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {risk.isOutsideAppetite ? 'APPETITE BREACHED' : 'WITHIN TOLERANCE'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'what-changed' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-white text-xs">Assessment Score Trajectory</h4>
                <div className="flex items-center justify-around text-center py-2">
                  <div>
                    <span className="text-slate-400 text-[11px]">Last Assessed At</span>
                    <div className="text-sm font-semibold text-white mt-1">
                      {new Date(risk.lastAssessmentAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-slate-500">By {risk.lastAssessedBy}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                  <div>
                    <span className="text-slate-400 text-[11px]">Current Residual Score</span>
                    <div className="text-base font-bold text-amber-400 font-mono mt-1">
                      {risk.residualRiskScore}/25
                    </div>
                    <div className="text-[10px] text-slate-500">Trend: {risk.riskTrend}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                  <div>
                    <span className="text-slate-400 text-[11px]">Target Post-Treatment</span>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                      {risk.targetRiskScore}/25
                    </div>
                    <div className="text-[10px] text-slate-500">Target Date: {risk.treatmentTargetDate}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Recent Telemetry & Event Triggers
                </h4>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-slate-300">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Continuous Assurance Recalculation:</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Mitigating controls evaluated against integration telemetry and automated check packs. Control effectiveness verified at {risk.currentControlEffectivenessPercent}%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'next-action' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Active Risk Treatment Plan</span>
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Strategy: {risk.treatmentStrategy}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {risk.treatmentPlanDescription}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-700/40 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    Accountable: <strong className="text-white">{risk.riskOwner}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Budget: <strong className="text-white">${risk.treatmentPlanBudgetUSD?.toLocaleString()} USD</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Target: <strong className="text-white">{risk.treatmentTargetDate}</strong>
                  </span>
                </div>
              </div>

              {risk.isOutsideAppetite && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    Immediate Escalation Required
                  </div>
                  <p className="text-slate-300 text-xs">
                    This risk exceeds the approved board appetite limit ({risk.residualRiskScore} &gt; {risk.riskAppetiteScore}). An executive risk acceptance waiver or accelerated remediation must be approved by <strong>{risk.accountableExecutive}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Grounding: ISO 31000, ISO 27005 & MAS TRM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
