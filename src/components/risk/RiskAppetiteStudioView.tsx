import React, { useState } from 'react';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  UserCheck,
  Calendar,
  DollarSign,
  Clock,
  Send,
  X,
  Building2,
  FileCheck2
} from 'lucide-react';
import { EnterpriseRiskRecord, RiskAppetiteThreshold } from '../../types/enterpriseRiskTypes';

interface RiskAppetiteStudioProps {
  risks: EnterpriseRiskRecord[];
  thresholds: RiskAppetiteThreshold[];
  onAcceptRisk: (
    riskId: string,
    approvalData: {
      approverName: string;
      approverRole: string;
      justification: string;
      compensatingControls: string[];
      expiryDate: string;
    }
  ) => void;
}

export const RiskAppetiteStudioView: React.FC<RiskAppetiteStudioProps> = ({
  risks,
  thresholds,
  onAcceptRisk
}) => {
  const [selectedRiskForAcceptance, setSelectedRiskForAcceptance] = useState<EnterpriseRiskRecord | null>(null);

  // Acceptance Form State
  const [approverName, setApproverName] = useState('Sarah Chen');
  const [approverRole, setApproverRole] = useState('CISO');
  const [justification, setJustification] = useState('');
  const [compensatingControls, setCompensatingControls] = useState('Daily manual audit of Datadog logs and client-side PII filtering');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const breaches = risks.filter(r => r.isOutsideAppetite);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRiskForAcceptance) return;
    setErrorMsg(null);

    // SoD Check
    if (selectedRiskForAcceptance.riskOwner.toLowerCase().includes(approverName.toLowerCase())) {
      const allowed = ['CRO', 'Chief Risk Officer', 'CISO', 'Board Risk Committee', 'CEO'];
      if (!allowed.some(a => approverRole.toUpperCase().includes(a.toUpperCase()))) {
        setErrorMsg('Segregation of Duties Violation: Risk Owner cannot approve their own risk acceptance without executive escalation.');
        return;
      }
    }

    onAcceptRisk(selectedRiskForAcceptance.id, {
      approverName,
      approverRole,
      justification,
      compensatingControls: compensatingControls.split(',').map(s => s.trim()),
      expiryDate
    });

    setSelectedRiskForAcceptance(null);
    setJustification('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Board Risk Appetite & Tolerance Studio</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Board-approved risk boundaries, appetite breach workflows, and Segregation-of-Duties (SoD) executive risk acceptances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs flex items-center gap-2">
            <span className="text-slate-400">Total Breaches:</span>
            <span className={`font-mono font-bold ${breaches.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {breaches.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* APPETITE DIMENSIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {thresholds.map((dim, idx) => {
          const matchingRisks = risks.filter(r => r.category.toLowerCase().includes(dim.dimension.toLowerCase().split(' ')[0]));
          const hasBreach = matchingRisks.some(r => r.residualRiskScore > dim.maxAcceptableScore);

          return (
            <div
              key={idx}
              className={`bg-slate-900/60 border rounded-xl p-4 space-y-3 ${
                hasBreach ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white line-clamp-1">{dim.dimension}</h4>
                {hasBreach ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Breach
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Nominal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="bg-slate-800/40 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-500 block text-[10px]">Appetite Limit</span>
                  <strong className="font-mono text-white text-xs">{dim.maxAcceptableScore}/25 Score</strong>
                </div>
                <div className="bg-slate-800/40 p-2 rounded border border-slate-700/30">
                  <span className="text-slate-500 block text-[10px]">Max Fin. Loss</span>
                  <strong className="font-mono text-white text-xs">${(dim.maxFinancialLossUSD / 1000).toFixed(0)}K USD</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between items-center">
                <span>Escalation: <strong>{dim.escalationRole}</strong></span>
                <span>{dim.requiresBoardApproval ? 'Board Approval Required' : 'Executive Delegated'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE APPETITE BREACH QUEUE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Active Risk Appetite Breach Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Risks currently operating outside approved Board boundaries requiring formal risk acceptance or accelerated remediation.
            </p>
          </div>
        </div>

        {breaches.length === 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center text-xs text-emerald-300 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="font-bold">Zero Risk Appetite Breaches Active</span>
            <p className="text-slate-400 max-w-md">
              All enterprise risks are currently operating within configured Board Risk Committee appetite limits.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {breaches.map((risk) => (
              <div
                key={risk.id}
                className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {risk.riskCode}
                    </span>
                    <span className="text-xs text-slate-400">{risk.category}</span>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      Score: {risk.residualRiskScore} &gt; Appetite: {risk.riskAppetiteScore}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{risk.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{risk.riskStatement}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedRiskForAcceptance(risk)}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Authorize Risk Acceptance
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXECUTIVE RISK ACCEPTANCE MODAL */}
      {selectedRiskForAcceptance && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Executive Risk Acceptance Waiver</h3>
              </div>
              <button
                onClick={() => setSelectedRiskForAcceptance(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 space-y-1">
                <span className="font-mono text-indigo-400 font-bold">[{selectedRiskForAcceptance.riskCode}]</span>
                <div className="font-semibold text-white">{selectedRiskForAcceptance.title}</div>
                <div className="text-slate-400 text-[11px]">
                  Owner: {selectedRiskForAcceptance.riskOwner} | Residual Score: {selectedRiskForAcceptance.residualRiskScore}/25
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Authorizing Executive Name</label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Executive Role</label>
                  <input
                    type="text"
                    value={approverRole}
                    onChange={(e) => setApproverRole(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Business Justification</label>
                <textarea
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why this risk is being accepted and why immediate mitigation is not feasible..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Compensating Controls</label>
                <input
                  type="text"
                  value={compensatingControls}
                  onChange={(e) => setCompensatingControls(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Acceptance Expiry Date (Max 6 Months)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRiskForAcceptance(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Sign & Authorize Acceptance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
