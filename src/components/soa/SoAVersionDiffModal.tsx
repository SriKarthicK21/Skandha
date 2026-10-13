import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Download,
  FileCheck2,
  AlertTriangle,
  History,
  Check,
  X,
  Sparkles,
  Award,
  Hash
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface SoAVersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoAVersionDiffModal: React.FC<SoAVersionDiffModalProps> = ({ isOpen, onClose }) => {
  const { currentTenant, theme } = useGRC();
  const { showToast } = useToast();

  const [selectedBaseVersion, setSelectedBaseVersion] = useState<'v1.0' | 'v1.1'>('v1.0');
  const [selectedTargetVersion, setSelectedTargetVersion] = useState<'v2.0'>('v2.0');
  const [activeTab, setActiveTab] = useState<'diff' | 'signatures' | 'hash_history'>('diff');

  if (!isOpen) return null;

  // Realistic version differences for an enterprise undergoing ISO 27001:2022 transition
  const diffItems = [
    {
      controlCode: 'A.5.7',
      controlTitle: 'Threat Intelligence (2022 New Control)',
      baseStatus: 'Excluded (Not in 2013 Annex A)',
      baseJustification: 'Control did not exist in ISO 27001:2013 scope.',
      targetStatus: 'Included & Implemented',
      targetJustification: 'Threat feeds ingested via FS-ISAC and CISA integrated into SIEM pipeline.',
      changeType: 'ADDED_INCLUDED'
    },
    {
      controlCode: 'A.5.23',
      controlTitle: 'Information Security for Cloud Services (2022 New Control)',
      baseStatus: 'Excluded (Generic Supplier Clause)',
      baseJustification: 'Covered under general vendor management.',
      targetStatus: 'Included & Implemented',
      targetJustification: 'AWS & GCP Shared Responsibility matrices mapped and audited annually.',
      changeType: 'ADDED_INCLUDED'
    },
    {
      controlCode: 'A.8.11',
      controlTitle: 'Data Masking (2022 New Control)',
      baseStatus: 'Excluded',
      baseJustification: 'Legacy database lacked masking module.',
      targetStatus: 'Included & Implemented',
      targetJustification: 'Dynamic pseudonymisation implemented on non-production database copies.',
      changeType: 'ADDED_INCLUDED'
    },
    {
      controlCode: 'A.8.12',
      controlTitle: 'Data Leakage Prevention (DLP) (2022 New Control)',
      baseStatus: 'Draft / In Progress',
      baseJustification: 'Proof of concept evaluation in progress.',
      targetStatus: 'Included & Verified',
      targetJustification: 'Endpoint DLP agent deployed across 100% of corporate workstations.',
      changeType: 'MODIFIED_JUSTIFICATION'
    },
    {
      controlCode: 'A.8.28',
      controlTitle: 'Secure Coding (2022 New Control)',
      baseStatus: 'Partially Implemented',
      baseJustification: 'Ad-hoc code reviews without automated SAST.',
      targetStatus: 'Included & Implemented',
      targetJustification: 'SonarQube & GitHub Advanced Security blocking PRs with high severity CVSS vulnerabilities.',
      changeType: 'MODIFIED_JUSTIFICATION'
    },
    {
      controlCode: 'A.7.4',
      controlTitle: 'Physical Security Monitoring',
      baseStatus: 'Excluded on Remote Entity',
      baseJustification: 'Entity was fully remote with no physical datacenters.',
      targetStatus: 'Included (HQ Facility)',
      targetJustification: 'CCTV and badge telemetry added for Singapore operations headquarters.',
      changeType: 'SCOPE_EXPANSION'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  Statement of Applicability (SoA) Version Diff & Cryptographic Sign-Off
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  v2.0 Approved Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditable side-by-side comparison of control status and justification modifications across ISMS audit cycles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Selector Bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400 font-medium">Compare:</span>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-mono font-bold">
                {selectedBaseVersion} (2013 Scope Baseline)
              </span>
              <span className="text-slate-500">➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold">
                {selectedTargetVersion} (2022 Transition Final)
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'diff' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Control Diffs ({diffItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signatures')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'signatures' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Digital Sign-Off Stamps
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hash_history')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'hash_history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Cryptographic Audit Trail
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'diff' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 flex items-center justify-between">
                <span>Showing changes between ISO 27001:2013 baseline and ISO 27001:2022 Transition SoA:</span>
                <span className="font-bold text-white">6 High-Impact Inclusions & Justification Revisions</span>
              </div>

              <div className="space-y-3">
                {diffItems.map(item => (
                  <div
                    key={item.controlCode}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          {item.controlCode}
                        </span>
                        <span className="font-bold text-white">{item.controlTitle}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {item.changeType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                        <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                          <span>Base Version (v1.0):</span>
                          <span className="font-mono text-slate-400">[{item.baseStatus}]</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                          {item.baseJustification}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/50 space-y-1">
                        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span>Target Version (v2.0):</span>
                          <span className="font-mono text-emerald-300">[{item.targetStatus}]</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed text-[11px]">
                          {item.targetJustification}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'signatures' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white">Clause 6.1.3 (d) Mandatory Sign-Off Protocol</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Statement of Applicability must be formally approved by designated executive leadership prior to presentation to external Certification Body auditors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400">Chief Information Security Officer</div>
                  <div className="text-sm font-bold text-white">Alexander Wright, CISO</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Signed 2026-09-08 14:22 UTC</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-800">
                    SIG: 8f4a3b2c...7d9e
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400">ISMS Steering Committee Chair</div>
                  <div className="text-sm font-bold text-white">Sophia Tremblay, VP Risk</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Signed 2026-09-09 09:15 UTC</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-800">
                    SIG: c2d3e4f5...1a2b
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400">Data Protection Officer (DPO)</div>
                  <div className="text-sm font-bold text-white">Mei-Ling Tan, General Counsel</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Signed 2026-09-09 11:30 UTC</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-800">
                    SIG: e9f0a1b2...4c5d
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hash_history' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Active SoA Cryptographic Seal (v2.0)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold">
                    IMMUTABLE
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 font-mono text-xs text-indigo-300 break-all border border-slate-800">
                  sha256:7b92f458a2d1e67c89b4f30129a3e5c78912d09812f84578bceaf9102c98d712
                </div>
                <div className="text-[11px] text-slate-400">
                  Calculated across all 93 control statuses, inclusion/exclusion justifications, and regulatory cross-references. Verified tamper-proof.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <span className="text-xs text-slate-400">
            Statement of Applicability v2.0 • ISO/IEC 27001:2022 Certified Baseline
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            Close Diff Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
