import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Lock,
  Baby,
  Globe,
  Trash2,
  Award,
  Layers,
  X
} from 'lucide-react';
import { DPDP_STATUTORY_CLAUSES } from '../../data/dpdpMasterData';

interface DPDPRegulatoryDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DPDPRegulatoryDossierModal: React.FC<DPDPRegulatoryDossierModalProps> = ({
  isOpen,
  onClose
}) => {
  const [dpoSignatory] = useState('Elena Rostova, Lead DPO & Chief DPDP Implementer');
  const [generationTimestamp] = useState(new Date().toISOString());

  if (!isOpen) return null;

  const compliantClauses = DPDP_STATUTORY_CLAUSES.filter(c => c.status === 'Compliant').length;
  const inProgressClauses = DPDP_STATUTORY_CLAUSES.filter(c => c.status === 'In Progress').length;
  const compliancePercentage = Math.round((compliantClauses / DPDP_STATUTORY_CLAUSES.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        {/* Modal Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white">DPBI Statutory Compliance Dossier</h2>
              <div className="text-xs text-slate-400">
                Digital Personal Data Protection Act, 2023 • Official Board & Regulatory Filing
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive Document Body */}
        <div className="space-y-6 bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-xs leading-relaxed">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider text-[10px] border border-amber-500/30">
                STATUTORY REGULATORY ATTESTATION
              </span>
              <h1 className="text-xl font-black text-white mt-2">
                Enterprise GRC Systems (India) Private Limited
              </h1>
              <div className="text-slate-400 text-xs">
                Registration No: SDF-DPDP-IND-2026-0044 • Significant Data Fiduciary (SDF) Classification
              </div>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-400 space-y-0.5">
              <div>Date of Dossier: <span className="text-white font-bold">{generationTimestamp.split('T')[0]}</span></div>
              <div>Jurisdiction: Republic of India</div>
              <div>Governing Authority: DPBI / MeitY</div>
            </div>
          </div>

          {/* Executive Summary & Scorecard */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              1. Executive Statutory Conformance Scorecard
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Overall Conformance</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{compliancePercentage}%</div>
                <span className="text-[10px] text-emerald-500/90">{compliantClauses} of 44 Clauses</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Grievance SLA (Sec 13)</span>
                <div className="text-2xl font-black text-white mt-1">100%</div>
                <span className="text-[10px] text-slate-400">&lt; 30 Day Statutory Window</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Child Safeguards (Sec 9)</span>
                <div className="text-2xl font-black text-rose-400 mt-1">Active</div>
                <span className="text-[10px] text-rose-300">VPC & Zero Tracking</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Breach SLA (Sec 8.6)</span>
                <div className="text-2xl font-black text-amber-400 mt-1">3h 30m</div>
                <span className="text-[10px] text-amber-400/80">Well Under 6h Mandate</span>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Pillar Highlights */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              2. Core Statutory Safeguards Implemented
            </h3>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Section 5 & 6: Notice, Multilingual Consent & Registered Consent Manager Interoperability</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  All processing notices are dynamically rendered in English and the 22 Eighth Schedule Indian languages. Machine-readable Consent Artifacts conform with MeitY / Sahamati open API standards.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Section 8(7) & 12(3): Automated Erasure Cascade with Statutory Legal Hold Preservation</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Upon consent revocation or purpose conclusion, deletion is cascaded across all downstream processors (AWS, Snowflake, Salesforce). In strict harmony with Section 8(7)(b), statutory retention mandates (PMLA, Income Tax Act) automatically override premature deletion with auditable DPO justification.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Section 9: Verifiable Parental Consent (VPC) & Prohibition of Minor Profiling</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Minor age gating and guardian verification implemented via tokenized DigiLocker KYC. Behavioral tracking, targeted ads, and harmful profiling are permanently locked out on all child profiles (Section 9(2)).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Section 16: Cross-Border Transfers & Whitelist Compliance</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Zero outbound data transfers route through Central Government blacklisted territories. All foreign transfers are bound by Standard Contractual Clauses (SCC) with end-to-end AES-256 encryption.
                </p>
              </div>
            </div>
          </div>

          {/* Formal Attestation by DPO */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
            <div className="font-bold text-white text-sm">3. Formal DPO Attestation & Sign-Off</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              "I hereby attest on behalf of the Data Fiduciary that our technical, organizational, and contractual safeguards have been verified against all 44 statutory sections of the Digital Personal Data Protection Act, 2023. Operational records, consent logs, erasure certificates, and DPIAs are maintained in an immutable, audit-defensible format ready for inspection by the Data Protection Board of India."
            </p>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-white">{dpoSignatory}</div>
                <div className="text-[10px] text-slate-400">Designated Lead DPO under Section 10(2)(a)</div>
              </div>
              <div className="font-mono text-[10px] text-amber-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                DIGITAL ATTESTATION ID: DPBI-ATT-2026-9904
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>Official DPBI Readiness Artifact • Confidential</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
