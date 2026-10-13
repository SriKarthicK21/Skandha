import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import confetti from 'canvas-confetti';
import {
  FileSignature,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building,
  UserCheck,
  Hash,
  Download,
  Printer,
  Sparkles
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const Phase4MoUExecution: React.FC<Props> = ({ onComplete, onBack }) => {
  const { currentTenant, currentUser, executeMoU, setActiveModule } = useGRC();

  const [signatoryName, setSignatoryName] = useState(
    currentTenant?.mou.executed
      ? currentTenant.mou.signatoryName
      : currentUser.name || ''
  );
  const [signatoryRole, setSignatoryRole] = useState(
    currentTenant?.mou.executed
      ? currentTenant.mou.signatoryRole
      : currentUser.title || 'Authorized Signatory & CISO'
  );
  const [signatoryEmail, setSignatoryEmail] = useState(
    currentTenant?.mou.executed
      ? currentTenant.mou.signatoryEmail
      : currentUser.email || currentTenant?.contactEmail || ''
  );
  const [commercialTier, setCommercialTier] = useState(
    currentTenant?.mou.commercialTier || 'Enterprise Audit Practice Partnership'
  );
  const [confidentialityAccepted, setConfidentialityAccepted] = useState(
    currentTenant?.mou.confidentialityTermsAccepted || false
  );
  const [isSigning, setIsSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAlreadyExecuted = currentTenant?.mou.executed;

  const handleSignMoU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatoryName.trim()) {
      setErrorMsg('Please provide the full legal name of the authorized signatory.');
      return;
    }
    if (!signatoryEmail.trim() || !signatoryEmail.includes('@')) {
      setErrorMsg('Please provide a valid corporate email address for the signatory.');
      return;
    }
    if (!confidentialityAccepted) {
      setErrorMsg('You must review and accept the confidentiality and audit terms.');
      return;
    }

    setErrorMsg('');
    setIsSigning(true);

    try {
      await executeMoU({
        signatoryName,
        signatoryRole,
        signatoryEmail,
        commercialTier
      });

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback if canvas is not mounted
      }

      setIsSigning(false);
      onComplete();
    } catch (err) {
      setErrorMsg('An error occurred executing the digital MoU.');
      setIsSigning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800">
              Phase 4 of 4 — Final Milestone
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              Digital Memorandum of Understanding (MoU) Execution
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Execution of this digital agreement unlocks and releases the generated ISO documentation pack to the client dashboard, confirms external audit practice timelines, and creates an immutable cryptographic record.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <FileSignature className="w-6 h-6" />
          </div>
        </div>
      </div>

      {isAlreadyExecuted && (
        <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-700/60 shadow-lg space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-300">
                Digital MoU Successfully Executed & Verified
              </h3>
              <p className="text-xs text-emerald-400/80">
                Cryptographic integrity hash recorded in immutable ledger. All {currentTenant?.generatedDocs.length} generated compliance documents are active.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-800/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Authorized Signatory</div>
              <div className="font-bold text-white mt-0.5">{currentTenant?.mou.signatoryName}</div>
              <div className="text-slate-400 text-[11px]">{currentTenant?.mou.signatoryRole}</div>
              <div className="text-sky-400 text-[11px]">{currentTenant?.mou.signatoryEmail}</div>
            </div>

            <div>
              <div className="text-slate-400 text-[10px] uppercase">Execution Timestamp & IP</div>
              <div className="text-slate-200 mt-0.5">{formatDateTime(currentTenant?.mou.timestamp)}</div>
              <div className="text-slate-400 text-[11px]">IP Gateway: {currentTenant?.mou.ipAddress}</div>
              <div className="text-emerald-400 text-[10px] truncate mt-1">
                SHA-256: {currentTenant?.mou.documentHash}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Execution Certificate</span>
            </button>
            <button
              onClick={() => setActiveModule('policies')}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Explore Released Policies & Procedures</span>
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MoU Legal Terms Viewer */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-sky-400">
              AGREEMENT REF: MOU-GRC-{currentTenant?.id.toUpperCase()}-2026
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              MEMORANDUM OF UNDERSTANDING FOR COMPLIANCE AUDIT & MANAGEMENT SYSTEM GOVERNANCE
            </h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            Version 2026.1
          </span>
        </div>

        {/* Scrollable Terms Text */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto space-y-3 font-sans">
          <p>
            This Memorandum of Understanding (the <strong>"MoU"</strong>) is entered into between{' '}
            <strong className="text-white">GRC Audit Practice & Certification Platform</strong> and{' '}
            <strong className="text-white">{currentTenant?.name || 'Client Organisation'}</strong> (the <strong>"Client"</strong>).
          </p>

          <h4 className="font-bold text-white pt-1">1. Scope of Engagement & Standard Adopted</h4>
          <p>
            The Client adopts the <strong>{currentTenant?.selectedFrameworks.join(', ') || 'ISO/IEC 27001:2022'}</strong> standard. The scope encompasses all registered business operations, cloud services, and in-scope departments as formally confirmed in Phase 2 Statement of Applicability baseline.
          </p>

          <h4 className="font-bold text-white pt-1">2. Release of Generated Management System Documentation</h4>
          <p>
            Upon digital execution of this MoU, the platform immediately releases the full suite of synthesized policies, standard operating procedures, asset registers, and evidence collection schedules. These documents remain legally owned by the Client with perpetual usage rights.
          </p>

          <h4 className="font-bold text-white pt-1">3. Confidentiality, Data Isolation & Non-Disclosure</h4>
          <p>
            Both parties agree that all evidence items, vulnerability assessments, penetration test findings, and internal audit working papers submitted to the GRC portal shall be treated as Strictly Confidential. The platform guarantees strict tenant isolation and AES-256 / TLS 1.3 cryptographic protection.
          </p>

          <h4 className="font-bold text-white pt-1">4. External Audit Practice Timelines</h4>
          <p>
            External audits shall be performed by lead external auditors according to the agreed engagement timeline:
            <br />
            • <strong>Stage 1 Readiness Assessment:</strong> Document review and governance walkthrough.
            <br />
            • <strong>Stage 2 Fieldwork Audit:</strong> Technical control verification, sampling, and certification readiness recommendation.
          </p>
        </div>

        {/* Signatory Form */}
        {!isAlreadyExecuted && (
          <form onSubmit={handleSignMoU} className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200">Authorized Legal Signatory Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Signatory Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signatoryName}
                  onChange={e => setSignatoryName(e.target.value)}
                  placeholder="e.g. SriKarthiK"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Corporate Role / Board Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signatoryRole}
                  onChange={e => setSignatoryRole(e.target.value)}
                  placeholder="e.g. Chief Information Security Officer"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Corporate Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={signatoryEmail}
                  onChange={e => setSignatoryEmail(e.target.value)}
                  placeholder="e.g. srikarthik@apexfintech.io"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Checkbox Terms */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start space-x-3">
              <input
                type="checkbox"
                id="confidentiality"
                checked={confidentialityAccepted}
                onChange={e => setConfidentialityAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-600 text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor="confidentiality" className="text-xs text-slate-300 cursor-pointer">
                I hereby confirm on behalf of <strong className="text-white">{currentTenant?.name}</strong> that I have reviewed the scope of engagement, confidentiality obligations, and external audit milestones. I authorize the digital execution of this Memorandum of Understanding and generation of an immutable cryptographic audit record.
              </label>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Doc Generation</span>
              </button>

              <button
                type="submit"
                disabled={isSigning}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] disabled:opacity-50"
                id="btn-execute-mou"
              >
                <FileSignature className="w-4 h-4" />
                <span>{isSigning ? 'Executing & Hashing...' : 'Sign Digital MoU & Unlock Dashboard'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
