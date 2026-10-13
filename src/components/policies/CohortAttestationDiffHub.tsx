import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitCompare,
  Zap,
  Send,
  FileCheck,
  Check,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Calendar,
  BellRing,
  HelpCircle,
  ShieldCheck,
  Building2
} from 'lucide-react';
import {
  INITIAL_COHORT_GROUPS
} from '../../services/isoPolicyGovernanceEngine';
import { CohortAttestationGroup } from '../../types';
import { useToast } from '../common/ToastContainer';

export const CohortAttestationDiffHub: React.FC = () => {
  const { showToast } = useToast();
  const { currentTenant, logAuditEvent } = useGRC();

  const [cohorts, setCohorts] = useState<CohortAttestationGroup[]>(INITIAL_COHORT_GROUPS);
  const [selectedCohort, setSelectedCohort] = useState<CohortAttestationGroup>(cohorts[0]);

  // Differential Diff states
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [hasAttestedDiff, setHasAttestedDiff] = useState(false);
  const [isTriggeringCadence, setIsTriggeringCadence] = useState(false);
  const [cadenceSuccessMsg, setCadenceSuccessMsg] = useState<string | null>(null);

  // Trigger event-based cadence
  const handleTriggerEventCadence = (event: CohortAttestationGroup['cadenceTriggerEvent'], label: string) => {
    setIsTriggeringCadence(true);
    setTimeout(() => {
      setCohorts(prev =>
        prev.map(c => ({
          ...c,
          lastCadenceTrigger: new Date().toISOString().split('T')[0],
          cadenceTriggerEvent: event,
          pendingAttestations: Math.max(1, Math.floor(c.totalAssignedUsers * 0.15))
        }))
      );
      setIsTriggeringCadence(false);
      setCadenceSuccessMsg(`Event Cadence Triggered: ${label}`);
      logAuditEvent(
        'UPDATE',
        `Event-driven attestation review triggered: ${label} for all cohort groups.`,
        'PASS'
      );
      setTimeout(() => setCadenceSuccessMsg(null), 4000);
    }, 800);
  };

  const handleAttestDifferential = () => {
    setHasAttestedDiff(true);
    setTimeout(() => {
      setCohorts(prev =>
        prev.map(c => {
          if (c.id === selectedCohort.id) {
            return {
              ...c,
              completedAttestations: c.totalAssignedUsers,
              pendingAttestations: 0
            };
          }
          return c;
        })
      );
      logAuditEvent(
        'APPROVE',
        `Employee completed differential re-attestation for substantive modifications in ARP_ISMS_P03 v1.2.`,
        'PASS'
      );
    }, 600);
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                  Pillar 4: Continuous Lifecycle &amp; Attestation
                </span>
                <span className="text-xs text-slate-500">Targeted Cohorts &amp; Differential Diffs</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Granular Role-Based Attestation &amp; Differential Re-Attestation
              </h3>
            </div>
          </div>

          {/* Quick Event Cadence Action */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDiffModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Preview Differential Diff View</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          <strong>The Problem:</strong> Forcing all employees to sign 40-page technical policies leads to rubber-stamping. Scrambling 30 days before audit with blunt annual reminders fails Clause 7.3 (Awareness).
          <br />
          <strong>The Fix:</strong> Target policies to distinct role cohorts (Engineers get SDLC; all staff get Acceptable Use). When policies update, employees attest only to substantive diffs rather than re-reading the entire manual.
        </p>
      </div>

      {/* SECTION 1: Event-Driven Review Cadence Triggers */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Automated Event-Driven Cadence Triggers (Beyond Fixed Annual Cycles)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              ISO 27001 Clause 9.3 and Clause 10 mandate review when significant external or internal operational shifts occur.
            </p>
          </div>
          {cadenceSuccessMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {cadenceSuccessMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => handleTriggerEventCadence('MAJOR_INCIDENT', 'Major Security Incident / Credential Leak')}
            disabled={isTriggeringCadence}
            className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-left transition space-y-1.5 cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800">Incident Review Trigger</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <p className="text-[11px] text-rose-950">
              Trigger emergency re-attestation of incident response and credential rotation SOPs.
            </p>
          </button>

          <button
            onClick={() => handleTriggerEventCadence('CLOUD_MIGRATION', 'Cloud Migration / Multi-Cloud Architecture')}
            disabled={isTriggeringCadence}
            className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 text-left transition space-y-1.5 cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800">Tech Stack Migration Trigger</span>
              <Layers className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <p className="text-[11px] text-sky-950">
              Trigger architecture review when new cloud providers or Kubernetes clusters are introduced.
            </p>
          </button>

          <button
            onClick={() => handleTriggerEventCadence('AUDIT_PREP', 'Pre-Audit 60-Day Surveillance Sweep')}
            disabled={isTriggeringCadence}
            className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-left transition space-y-1.5 cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">Audit Surveillance Sweep</span>
              <BellRing className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-[11px] text-purple-950">
              Automate verification sweep 60 days before external ISO 27001 audit window.
            </p>
          </button>
        </div>
      </div>

      {/* SECTION 2: Role-Based Cohort Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cohort Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 border-b border-slate-100 pb-2">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Targeted Attestation Cohorts</span>
            </h4>

            <div className="space-y-2">
              {cohorts.map(c => {
                const isSelected = selectedCohort.id === c.id;
                const completionPct = Math.round((c.completedAttestations / c.totalAssignedUsers) * 100);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCohort(c)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                        : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{c.name}</h5>
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.targetDepartments.join(', ')}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        completionPct === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {completionPct}% Complete
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Attestation Status</span>
                        <span>{c.completedAttestations} / {c.totalAssignedUsers} Users</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${completionPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cohort Details & Policy Scope (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600">Cohort Details</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedCohort.name}</h4>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Trigger: {selectedCohort.cadenceTriggerEvent} ({selectedCohort.lastCadenceTrigger})
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedCohort.description}
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-900 block">Assigned ISMS Policies for this Cohort:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCohort.assignedPolicyCodes.map((code, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-slate-800">Pending Attestations: {selectedCohort.pendingAttestations} Staff</div>
                <div className="text-[11px] text-slate-500">Automated Slack/Email reminders queued</div>
              </div>
              <button
                onClick={() => {
                  showToast({
                    type: 'success',
                    title: 'Reminders Dispatched',
                    message: `Automated differential reminder dispatched to ${selectedCohort.pendingAttestations} pending members of ${selectedCohort.name}!`
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Dispatch Differential Reminders</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Differential Diff Modal / Drawer */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Differential Re-Attestation Diff View
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    ARP_ISMS_P03: Identity &amp; Access Policy (v1.1 &rarr; v1.2)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <strong>Differential Attestation:</strong> You do not need to re-read the full 38-page policy. Please review the <strong>substantive modifications</strong> highlighted below and click attest.
              </div>

              {/* Diff Block */}
              <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                <div className="bg-slate-100 p-2 text-slate-600 font-bold border-b border-slate-200">
                  Section 4.2 - Authentication &amp; Multi-Factor Standards
                </div>
                {/* Red Deletion */}
                <div className="bg-rose-50 text-rose-900 p-3 border-b border-rose-100 flex items-start space-x-2">
                  <span className="font-bold text-rose-600 shrink-0">- [DEPRECATED]</span>
                  <span>
                    Passwords must be at least 12 characters and changed every 90 days. SMS multi-factor authentication is permitted as a fallback.
                  </span>
                </div>
                {/* Green Addition */}
                <div className="bg-emerald-50 text-emerald-950 p-3 flex items-start space-x-2 font-semibold">
                  <span className="font-bold text-emerald-600 shrink-0">+ [ENACTED v1.2]</span>
                  <span>
                    Passwords must be at least 16 characters. Arbitrary 90-day password expiration is deprecated per NIST SP 800-63B. Mandatory FIDO2 hardware keys (YubiKey / WebAuthn) or Okta Verify are enforced. SMS/Voice MFA is strictly prohibited.
                  </span>
                </div>
              </div>

              {/* Attestation Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="diff_agree"
                    checked={hasAttestedDiff}
                    onChange={e => setHasAttestedDiff(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="diff_agree" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                    I acknowledge and confirm that I have reviewed the substantive modifications in Section 4.2 of the Identity &amp; Access Policy (v1.2). I agree to abide by the mandatory FIDO2 hardware key standard.
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowDiffModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleAttestDifferential();
                      setShowDiffModal(false);
                    }}
                    disabled={!hasAttestedDiff}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-40"
                  >
                    Submit Differential Attestation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
