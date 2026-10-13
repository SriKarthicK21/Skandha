import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  X,
  Lock,
  FileCheck2,
  CheckCircle2,
  Info,
  Scale,
  Award,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';
import { computeSamplingAuditSeal } from '../../utils/iso19011SamplingRationaleExporter';

export interface InternalAuditorProfile {
  id: string;
  name: string;
  primaryRole: string;
  department: string;
  qualifications: string[];
  ownedControls: string[]; // Controls they own or operate operationally
  assignedScopes: string[]; // Clauses or control areas assigned to audit
  impartialityAttested: boolean;
  attestedDate?: string;
  attestationSeal?: string;
}

const INITIAL_AUDITORS: InternalAuditorProfile[] = [
  {
    id: 'aud_1',
    name: 'Dr. Sarah Chen',
    primaryRole: 'Lead Internal Auditor (Independent GRC)',
    department: 'Governance, Risk & Compliance',
    qualifications: ['ISO/IEC 27001 Lead Auditor (PECB)', 'ISO 19011 Certified', 'CISA'],
    ownedControls: [], // Independent, owns no operational controls
    assignedScopes: ['Clause 4-10 Governance', 'A.5 Organizational Controls', 'A.8 Technological Controls'],
    impartialityAttested: true,
    attestedDate: '2026-08-15',
    attestationSeal: 'SEAL-IMPARTIAL-SC-8F92A1'
  },
  {
    id: 'aud_2',
    name: 'Alex Rivera',
    primaryRole: 'Lead DevOps & Cloud Architect',
    department: 'Software Engineering & DevOps',
    qualifications: ['AWS Certified Solutions Architect', 'ISO 27001 Internal Auditor'],
    ownedControls: ['A.8.20 Network Security', 'A.8.28 Secure Coding', 'A.8.31 Separation of Dev/Prod'],
    assignedScopes: ['A.7 Physical Security', 'A.6 People Controls'], // Correctly separated from DevOps!
    impartialityAttested: false
  },
  {
    id: 'aud_3',
    name: 'Priya Sharma',
    primaryRole: 'Head of People Operations',
    department: 'Human Resources',
    qualifications: ['SHRM-SCP', 'ISO 27001 Auditor Trained'],
    ownedControls: ['A.6.1 Screening', 'A.6.2 Terms of Employment', 'A.6.4 Disciplinary Process'],
    assignedScopes: ['A.5.19 Supplier Relationships', 'A.8.8 Technical Vulnerabilities'],
    impartialityAttested: false
  },
  {
    id: 'aud_4',
    name: 'Marcus Vance',
    primaryRole: 'Chief Information Security Officer (CISO)',
    department: 'Executive Management',
    qualifications: ['CISSP', 'CISM', 'CISO Certified'],
    ownedControls: ['Clause 5.1 Leadership', 'Clause 6.1 Risk Assessment', 'A.5.1 Policies'],
    assignedScopes: ['Clause 6.1 Risk Assessment', 'A.8.24 Cryptography'], // Conflict: CISO auditing Clause 6.1 risk assessment!
    impartialityAttested: false
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
}

export const AuditorIndependenceMatrixModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tenantName
}) => {
  const { showToast } = useToast();
  const [auditors, setAuditors] = useState<InternalAuditorProfile[]>(INITIAL_AUDITORS);
  const [selectedAuditor, setSelectedAuditor] = useState<InternalAuditorProfile | null>(INITIAL_AUDITORS[0]);
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationStatement, setAttestationStatement] = useState(
    'I solemnly declare under ISO 19011:2018 §7 and ISO/IEC 27001:2022 Clause 9.2.2 that I possess complete objectivity and independence regarding my assigned audit scopes. I hold no operational ownership, managerial approval duties, or direct responsibility for the controls, processes, or departmental assets under my evaluation. I have disclosed all potential conflicts of interest.'
  );

  if (!isOpen) return null;

  // Detect conflicts: Does assignedScope overlap with ownedControls or primary department?
  const detectConflicts = (auditor: InternalAuditorProfile) => {
    const conflicts: string[] = [];
    auditor.assignedScopes.forEach(scope => {
      // Check direct control ownership overlap
      auditor.ownedControls.forEach(owned => {
        if (scope.toLowerCase().includes(owned.split(' ')[0].toLowerCase())) {
          conflicts.push(`Self-Review Risk: Assigned to audit ${scope} while having operational ownership of ${owned}.`);
        }
      });
      // Check leadership/risk conflict for CISO
      if (auditor.primaryRole.toLowerCase().includes('ciso') && scope.toLowerCase().includes('risk')) {
        conflicts.push(`Clause 9.2.2 Conflict: CISO cannot serve as sole internal auditor for Clause 6.1 Risk Management which they author and direct.`);
      }
    });
    return conflicts;
  };

  const handleExecuteAttestation = (auditorId: string) => {
    setIsAttesting(true);
    setTimeout(() => {
      const seal = computeSamplingAuditSeal(`IMPARTIAL-${auditorId}-${Date.now()}`);
      setAuditors(prev =>
        prev.map(a =>
          a.id === auditorId
            ? {
                ...a,
                impartialityAttested: true,
                attestedDate: new Date().toISOString().split('T')[0],
                attestationSeal: `SEAL-${seal.slice(0, 16)}`
              }
            : a
        )
      );
      setIsAttesting(false);
      showToast({
        title: 'Attestation Recorded',
        message: 'ISO 19011 Impartiality & Independence Declaration signed with cryptographic seal.',
        type: 'success'
      });
    }, 600);
  };

  const handleResolveConflict = (auditorId: string, forbiddenScope: string, replacementScope: string) => {
    setAuditors(prev =>
      prev.map(a =>
        a.id === auditorId
          ? {
              ...a,
              assignedScopes: a.assignedScopes.map(s => (s === forbiddenScope ? replacementScope : s)),
              impartialityAttested: false
            }
          : a
      )
    );
    showToast({
      title: 'Audit Scope Realigned',
      message: `Reassigned ${forbiddenScope} to independent scope: ${replacementScope}. Impartiality requirement satisfied.`,
      type: 'success'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl my-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/50 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-800 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                ISO/IEC 27001:2022 Cl. 9.2.2 & ISO 19011:2018 §7
              </span>
              <span className="text-xs text-slate-400">Auditor Objectivity & Impartiality Engine</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1.5">
              Auditor Independence Matrix & Conflict-of-Interest Enforcement
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Mandatory accreditation control: Prevent self-review violations by blocking internal auditors from evaluating controls, departments, or risk assessments they operationally own or oversee.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto text-xs text-slate-300 flex-1">
          {/* Regulatory Citation Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-white font-bold">PECB / TÜV / BSI Lead Auditor Audit Mandate:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Under ISO 27001 Clause 9.2.2(c), auditors shall <em>"ensure objectivity and the impartiality of the audit process"</em>. Certification bodies will issue a <strong>Major Non-Conformity</strong> if an internal audit report covering technical or operational controls is executed by personnel with operational responsibility for those controls without documented independent segregation.
              </p>
            </div>
          </div>

          {/* Auditor Roster & Conflict Heatmap */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Auditor Independence Register ({auditors.length} Active Assessors)</span>
              <span className="text-[11px] font-normal text-slate-400">
                Tenant: <strong className="text-white">{tenantName}</strong>
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {auditors.map(auditor => {
                const conflicts = detectConflicts(auditor);
                const hasConflicts = conflicts.length > 0;

                return (
                  <div
                    key={auditor.id}
                    onClick={() => setSelectedAuditor(auditor)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      selectedAuditor?.id === auditor.id
                        ? 'bg-slate-850 border-sky-500 shadow-md shadow-sky-950/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{auditor.name}</div>
                          <div className="text-[11px] text-slate-400">{auditor.primaryRole}</div>
                        </div>

                        {hasConflicts ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Conflict Detected
                          </span>
                        ) : auditor.impartialityAttested ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Attested
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Attestation Pending
                          </span>
                        )}
                      </div>

                      {/* Operational Ownership vs Assigned Scope */}
                      <div className="text-[11px] space-y-1 pt-1 border-t border-slate-800/80">
                        <div>
                          <span className="text-slate-400">Operational Ownership: </span>
                          <span className="text-slate-200">
                            {auditor.ownedControls.length > 0 ? auditor.ownedControls.join(', ') : 'None (Fully Independent)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Assigned Audit Scope: </span>
                          <span className="text-sky-300 font-semibold">{auditor.assignedScopes.join(', ')}</span>
                        </div>
                      </div>

                      {/* Conflict Alert Box */}
                      {hasConflicts && (
                        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/80 text-rose-300 text-[11px] space-y-1.5">
                          {conflicts.map((c, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>{c}</span>
                            </div>
                          ))}
                          {auditor.id === 'aud_4' && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleResolveConflict('aud_4', 'Clause 6.1 Risk Assessment', 'A.5.2 Information Security Roles & Responsibilities');
                              }}
                              className="mt-1 px-2 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white font-bold text-[10px] transition"
                            >
                              Auto-Resolve: Reassign to A.5.2 (Independent Scope)
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Attestation status ribbon */}
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Department: {auditor.department}</span>
                      {auditor.attestationSeal && (
                        <span className="font-mono text-emerald-400">{auditor.attestationSeal}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impartiality Attestation Signing Panel */}
          {selectedAuditor && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold text-white">
                    Formal ISO 19011:2018 Impartiality Attestation for {selectedAuditor.name}
                  </h4>
                </div>
                {selectedAuditor.impartialityAttested && (
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Signed on {selectedAuditor.attestedDate}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] italic leading-relaxed">
                "{attestationStatement}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-slate-400">
                  Qualifications: <strong className="text-slate-200">{selectedAuditor.qualifications.join(' • ')}</strong>
                </div>

                <div className="flex items-center space-x-2">
                  {detectConflicts(selectedAuditor).length > 0 ? (
                    <button
                      disabled
                      className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed border border-slate-700 flex items-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Signing Blocked: Resolve Active Conflicts First</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleExecuteAttestation(selectedAuditor.id)}
                      disabled={isAttesting || selectedAuditor.impartialityAttested}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-sky-600/20"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>
                        {selectedAuditor.impartialityAttested
                          ? 'Attestation Cryptographically Sealed'
                          : isAttesting
                          ? 'Recording Seal...'
                          : 'Sign & Attest Impartiality'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Internal audit reports submitted to Clause 9.3 Management Review require 100% attested auditor independence.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
