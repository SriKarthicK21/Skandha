import React from 'react';
import { PolicyDigitalSignature } from '../../types';
import {
  Award,
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Lock,
  QrCode,
  Calendar,
  UserCheck,
  Building2,
  FileText
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';
import { useToast } from '../common/ToastContainer';

interface PolicyCertificateModalProps {
  signature: PolicyDigitalSignature;
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyCertificateModal: React.FC<PolicyCertificateModalProps> = ({
  signature,
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(signature.verificationHash);
    showToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: 'Verification hash copied to clipboard!'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
              Cryptographic Proof
            </span>
            <span className="text-xs text-slate-500 font-mono">Serial: {signature.id}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-8 sm:p-10 space-y-6 bg-white relative">
          {/* Subtle Watermark/Emblem */}
          <div className="absolute right-8 top-10 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-emerald-950" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-1.5 pb-6 border-b-2 border-emerald-600/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-2 shadow-2xs">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-emerald-800">
              Skanda Trust Network • ISO/IEC 27001:2022 Compliance Ledger
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Certificate of Policy Attestation
            </h1>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Formal cryptographic sign-off evidencing executive endorsement and governance enactment in accordance with ISO 27001 Clause 5.1 & 7.5.
            </p>
          </div>

          {/* Target Document Details */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Code</span>
              <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">{signature.documentCode}</div>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policy Title</span>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{signature.documentTitle}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Version</span>
              <div className="text-xs font-mono font-semibold text-slate-900 mt-0.5">v{signature.documentVersion}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signing Purpose</span>
              <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                {signature.signingPurpose.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificate Status</span>
              <div className="flex items-center space-x-1 text-xs font-bold text-emerald-700 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>VALID & TAMPER-EVIDENT</span>
              </div>
            </div>
          </div>

          {/* Signatory Attestation Statement */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Signatory Attestation Declaration
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs text-slate-800 leading-relaxed italic">
              "{signature.auditDeclaration}"
            </div>
          </div>

          {/* Two-Column Signer & Cryptographic Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Signer Profile */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Signatory Identity</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-bold text-slate-900">{signature.signerName}</div>
                <div className="text-slate-600 font-medium">{signature.signerRole}</div>
                <div className="text-slate-500 font-mono text-[11px]">{signature.signerEmail}</div>
                <div className="text-slate-400 text-[10px] pt-1">Timestamp: {formatDateTime(signature.timestamp)}</div>
                <div className="text-slate-400 text-[10px]">Client Verification Node: {signature.ipAddress}</div>
              </div>
            </div>

            {/* Cryptographic Ledger Proofs */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cryptographic Digest</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Certificate Authority</span>
                  <span className="text-xs font-medium text-slate-700">{signature.certificateAuthority}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>SHA-256 Signature HMAC</span>
                    <button
                      onClick={handleCopyHash}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div
                    className="font-mono text-[10px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-200 truncate select-all cursor-pointer mt-0.5"
                    title={signature.verificationHash}
                  >
                    {signature.verificationHash}
                  </div>
                </div>
                {signature.documentChecksum && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Document Content SHA-256 Checksum</span>
                    <div
                      className="font-mono text-[10px] text-slate-600 bg-slate-100 p-1.5 rounded border border-slate-200 truncate select-all mt-0.5"
                      title={signature.documentChecksum}
                    >
                      {signature.documentChecksum}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Footer Stamp */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              Audit Guarantee: Verified in accordance with BSI / TÜV ISO 27001 auditor sampling requirements.
            </div>
            <div className="font-mono text-[10px] text-slate-500">
              HASH-VERIFIED • IMMUTABLE RECORD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
