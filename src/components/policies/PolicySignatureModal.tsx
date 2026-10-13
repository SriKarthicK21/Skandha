import React, { useState } from 'react';
import { GeneratedDocument, PolicyDigitalSignature } from '../../types';
import {
  ShieldCheck,
  X,
  FileCheck,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Hash,
  Award
} from 'lucide-react';

interface PolicySignatureModalProps {
  document: GeneratedDocument;
  isOpen: boolean;
  onClose: () => void;
  onSignPolicy: (signatureData: {
    signerName: string;
    signerRole: string;
    signerEmail?: string;
    signingPurpose: PolicyDigitalSignature['signingPurpose'];
    auditDeclaration?: string;
    notes?: string;
  }) => Promise<PolicyDigitalSignature>;
}

export const PolicySignatureModal: React.FC<PolicySignatureModalProps> = ({
  document,
  isOpen,
  onClose,
  onSignPolicy
}) => {
  const [signerName, setSignerName] = useState(document.approvedBy || 'Sarah Jenkins');
  const [signerRole, setSignerRole] = useState(document.documentOwner || 'Chief Information Security Officer (CISO)');
  const [signerEmail, setSignerEmail] = useState('ciso@company.internal');
  const [signingPurpose, setSigningPurpose] = useState<PolicyDigitalSignature['signingPurpose']>('EXECUTIVE_ATTESTATION');
  const [auditDeclarationAccepted, setAuditDeclarationAccepted] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !auditDeclarationAccepted) return;

    setIsSigning(true);
    try {
      await onSignPolicy({
        signerName: signerName.trim(),
        signerRole: signerRole.trim(),
        signerEmail: signerEmail.trim(),
        signingPurpose,
        auditDeclaration: 'I hereby attest and certify that this policy has been formally reviewed, validated against ISO/IEC 27001:2022 & regulatory mandates, and is authorized for active governance enforcement.',
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                  ISO 27001 Cl. 5.1 Management Commitment
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">{document.docCode}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                Execute Cryptographic Digital Signature
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Document Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">{document.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Version: <span className="font-mono font-bold text-emerald-700">v{document.version}</span> • Classification: {document.classification || 'Private (Internal)'}
              </div>
            </div>
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 shrink-0">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>SHA-256 HMAC Sealed</span>
            </div>
          </div>

          {/* Signer Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Signatory Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Signatory Professional Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                placeholder="e.g. Chief Information Security Officer (CISO)"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Signatory Corporate Email
              </label>
              <input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="e.g. ciso@company.com"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Signing Purpose / Legal Intent <span className="text-rose-500">*</span>
              </label>
              <select
                value={signingPurpose}
                onChange={(e) => setSigningPurpose(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="EXECUTIVE_ATTESTATION">Executive CISO Attestation</option>
                <option value="INITIAL_APPROVAL">Initial Approval & Baselines</option>
                <option value="ANNUAL_RECERTIFICATION">Annual ISO 27001 Recertification</option>
                <option value="LEGAL_SIGN_OFF">Legal & DPO Compliance Sign-Off</option>
                <option value="EMERGENCY_REVISION">Emergency Control Revision</option>
              </select>
            </div>
          </div>

          {/* Audit Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Audit Notes / Certification Justification (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Annual ISMS Governance review concluded with no material deficiencies noted..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Legal Attestation Declaration */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Formal Auditor Compliance Attestation Declaration</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              "I hereby attest and certify that this policy has been formally reviewed, validated against ISO/IEC 27001:2022 Clause 5.1/5.2, statutory data privacy guidelines, and organizational mandates. This cryptographic signature serves as immutable evidence of management endorsement for Stage 1 and Stage 2 external certification audits."
            </p>
            <label className="flex items-center space-x-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={auditDeclarationAccepted}
                onChange={(e) => setAuditDeclarationAccepted(e.target.checked)}
                className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                required
              />
              <span className="text-xs font-bold text-emerald-900">
                I accept and legally endorse this compliance declaration
              </span>
            </label>
          </div>

          {/* Tamper Evidence Notice */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Applying this signature generates a SHA-256 HMAC digital seal tied to the document's binary contents.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSigning || !auditDeclarationAccepted}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isSigning ? 'Computing Hash & Signing...' : 'Apply Digital Signature'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
