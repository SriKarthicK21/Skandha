import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { OutdatedJustificationIssue } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Zap,
  ArrowRight,
  ExternalLink,
  Edit3,
  Check,
  Info,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface SoASyncVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoASyncVerifierModal: React.FC<SoASyncVerifierModalProps> = ({ isOpen, onClose }) => {
  const {
    soaVerifierReport,
    soaVerificationIssues,
    runSoASyncVerification,
    reincludeControlFromIssue,
    updateJustificationFromIssue,
    dismissSoAIssue,
    batchReconcileOutdatedSoA,
    simulateOutdatedSoARisk,
    setActiveModule
  } = useGRC();

  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [customJustification, setCustomJustification] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'threats' | 'direct'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleStartEdit = (issue: OutdatedJustificationIssue) => {
    setEditingIssueId(issue.id);
    setCustomJustification(issue.suggestedRevisedJustification || issue.currentJustification);
  };

  const handleSaveJustification = (issueId: string) => {
    if (!customJustification.trim()) return;
    updateJustificationFromIssue(issueId, customJustification);
    setEditingIssueId(null);
    showToast('Updated and re-certified justification in Statement of Applicability!');
  };

  const handleReinclude = (issue: OutdatedJustificationIssue) => {
    reincludeControlFromIssue(issue.id);
    showToast(`Control ${issue.controlCode} re-included as APPLICABLE in SoA.`);
  };

  const handleBatchReconcile = () => {
    const res = batchReconcileOutdatedSoA();
    showToast(`Batch reconciled ${res.count} control(s) into Statement of Applicability.`);
  };

  const handleSimulate = () => {
    const newRisk = simulateOutdatedSoARisk();
    showToast(`Simulated Risk ${newRisk.riskCode}: "${newRisk.title}". SoA Verifier detected outdated justification!`);
  };

  const filteredIssues = soaVerificationIssues.filter(issue => {
    if (activeTab === 'critical') return issue.severity === 'Critical';
    if (activeTab === 'threats') return issue.conflictType === 'THREAT_CONTRADICTION';
    if (activeTab === 'direct') return issue.conflictType === 'DIRECT_MITIGATION_MAPPING';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/80 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                ISO/IEC 27001:2022 Clause 6.1.3(d)
              </span>
              <span className="text-xs text-slate-400">Continuous Risk Register & SoA Alignment Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Statement of Applicability (SoA) Sync Verifier
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monitors modifications in the Risk Management module and notifies compliance leads when SoA justifications
              for excluded Annex A controls become outdated or contradicted by newly identified risks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close SoA Sync Verifier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Notification Toast */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Health Stats Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 border-b border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Verifier Health</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-bold ${
                  soaVerifierReport.verificationHealthScore >= 90
                    ? 'text-emerald-400'
                    : soaVerifierReport.verificationHealthScore >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {soaVerifierReport.verificationHealthScore}%
              </span>
              <span className="text-[11px] text-slate-500">Defensible</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Total Excluded Controls</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{soaVerifierReport.totalExcludedControls}</span>
              <span className="text-[11px] text-slate-500">in SoA Baseline</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-amber-400 tracking-wider">Outdated Justifications</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-400">{soaVerifierReport.outdatedCount}</span>
              {soaVerifierReport.criticalIssuesCount > 0 && (
                <span className="text-[11px] font-medium text-rose-400">({soaVerifierReport.criticalIssuesCount} Critical)</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">Valid Exclusions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{soaVerifierReport.validExclusionCount}</span>
              <span className="text-[11px] text-emerald-500/80">Certified</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filter Tabs */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              All Issues ({soaVerificationIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Critical ({soaVerifierReport.criticalIssuesCount})
            </button>
            <button
              onClick={() => setActiveTab('threats')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'threats' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Threat Contradictions
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'direct' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Mitigation Mappings
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulate}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-900/60 text-xs font-semibold transition"
              title="Simulate adding a new risk to test verifier detection"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate Risk Trigger</span>
            </button>

            {soaVerificationIssues.length > 0 && (
              <button
                onClick={handleBatchReconcile}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Batch Reconcile All ({soaVerificationIssues.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                runSoASyncVerification();
                showToast('Re-scanned Risk Register and Statement of Applicability.');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Re-run verifier"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {filteredIssues.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">All SoA Exclusions Are Fully Defensible</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                No contradictions detected between active Risk Register entries and the justifications recorded for excluded
                controls. ISO/IEC 27001:2022 Clause 6.1.3(d) compliance requirements are satisfied.
              </p>
              <button
                onClick={handleSimulate}
                className="mt-4 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Risk To Test Verifier</span>
              </button>
            </div>
          ) : (
            filteredIssues.map(issue => {
              const isEditing = editingIssueId === issue.id;

              return (
                <div
                  key={issue.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/70 hover:border-slate-600 transition space-y-3"
                >
                  {/* Issue Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300">
                        {issue.controlCode}
                      </span>
                      <h4 className="text-sm font-bold text-white">{issue.controlTitle}</h4>
                      <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-800/80">
                        {issue.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          issue.severity === 'Critical'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                            : issue.severity === 'High'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                            : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                        }`}
                      >
                        {issue.severity} Severity
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {issue.conflictType === 'DIRECT_MITIGATION_MAPPING'
                          ? 'Mitigation Conflict'
                          : issue.conflictType === 'THREAT_CONTRADICTION'
                          ? 'Threat Contradiction'
                          : 'Stale Justification'}
                      </span>
                    </div>
                  </div>

                  {/* Auditor Reason Warning */}
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-amber-300">Outdated Justification Rationale: </span>
                      <span className="text-xs text-amber-200/90">{issue.invalidationReason}</span>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Current SoA Justification */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Current Excluded Justification (in SoA)
                        </span>
                        <span className="text-[10px] text-rose-400 font-semibold">Exclusion Status: Applicable = No</span>
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{issue.currentJustification}"
                      </p>
                    </div>

                    {/* Triggering Risk Details */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          Contradicting Risk ({issue.triggeringRisk.riskCode})
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Score: {issue.triggeringRisk.inherentScore}/25 | {issue.triggeringRisk.department}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white">"{issue.triggeringRisk.title}"</p>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {issue.triggeringRisk.threatDescription}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Auditor Action */}
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 px-1">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      <strong className="text-slate-300">Recommendation:</strong> {issue.suggestedAction}
                    </span>
                  </div>

                  {/* Edit Justification Form */}
                  {isEditing && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/50 space-y-2 mt-2">
                      <label className="text-xs font-semibold text-indigo-300">
                        Revise Justification to Address Risk {issue.triggeringRisk.riskCode}:
                      </label>
                      <textarea
                        value={customJustification}
                        onChange={e => setCustomJustification(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                        placeholder="Document technical compensating controls or rationale complying with Clause 6.1.3(d)..."
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingIssueId(null)}
                          className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveJustification(issue.id)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                        >
                          Save & Re-certify Justification
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  {!isEditing && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReinclude(issue)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Re-include {issue.controlCode} as Applicable in SoA</span>
                        </button>

                        <button
                          onClick={() => handleStartEdit(issue)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Revise Justification</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            dismissSoAIssue(issue.id, 'Auditor accepted exception under documented business risk acceptance.');
                            showToast(`Auditor accepted exception for ${issue.controlCode}.`);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 px-2 py-1"
                          title="Accept risk exception without changing SoA"
                        >
                          Accept Exception Note
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            setActiveModule('risk_assessment');
                          }}
                          className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1"
                        >
                          <span>Inspect in Risk Register</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Audited under ISO/IEC 27001:2022 Stage 2 Information Security Management Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Verifier
          </button>
        </div>
      </div>
    </div>
  );
};
