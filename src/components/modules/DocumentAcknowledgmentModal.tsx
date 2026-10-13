import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { GeneratedDocument } from '../../types';
import {
  FileCheck,
  Shield,
  UserCheck,
  Clock,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Building,
  FileText
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';

interface DocumentAcknowledgmentModalProps {
  document: GeneratedDocument;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DocumentAcknowledgmentModal: React.FC<DocumentAcknowledgmentModalProps> = ({
  document,
  onClose,
  onSuccess
}) => {
  const { currentUser, currentRole, currentTenant, submitDocumentAcknowledgment } = useGRC();

  const [signatureText, setSignatureText] = useState(`${currentUser.name} / ${currentUser.role.replace('_', ' ')}`);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedAck, setSubmittedAck] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      setErrorMsg('You must agree to the compliance declaration before submitting.');
      return;
    }
    if (!signatureText.trim()) {
      setErrorMsg('Please enter your digital signature text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const ack = await submitDocumentAcknowledgment({
        documentId: document.id,
        documentCode: document.docCode,
        documentTitle: document.title,
        documentVersion: document.version,
        signatureText: signatureText.trim(),
        declarationAccepted: true,
        notes: notes.trim() ? notes.trim() : undefined
      });

      setSubmittedAck(ack);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to record document acknowledgment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Digital Document Acknowledgment</h2>
              <p className="text-xs text-slate-500">ISO/IEC 27001:2022 ISMS Policy Compliance Workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedAck ? (
          /* Success Receipt View */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold">Acknowledgment Recorded & Verified</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your digital signature for <strong>{document.docCode} (v{document.version})</strong> has been cryptographically logged to the audit ledger.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs font-sans">
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Document</span>
                <span className="font-semibold text-slate-900">{submittedAck.documentCode} — {submittedAck.documentTitle}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Version</span>
                <span className="font-mono font-bold text-blue-600">v{submittedAck.documentVersion}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Signatory</span>
                <span className="font-semibold text-slate-900">{submittedAck.userName} ({submittedAck.userEmail})</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Role & Department</span>
                <span className="text-slate-700">{submittedAck.userRole} • {submittedAck.department}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Timestamp</span>
                <span className="font-mono text-slate-700">{formatDateTime(submittedAck.timestamp)}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 font-medium block mb-1">Cryptographic Integrity Hash (SHA-256)</span>
                <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                  {submittedAck.verificationHash}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Acknowledgment Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Document Target Card */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                  {document.docCode}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200">
                  Version: v{document.version}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">{document.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Classification: <span className="font-medium text-slate-700">{document.classification}</span> • Category: <span className="font-medium text-slate-700">{document.category}</span>
              </p>
            </div>

            {/* Signatory Identity Information */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-0.5">Acknowledging User</span>
                <div className="font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block mb-0.5">Role & Organization</span>
                <div className="font-semibold text-slate-900">{currentRole.replace('_', ' ')}</div>
                <div className="text-[11px] text-slate-500">{currentTenant?.name}</div>
              </div>
            </div>

            {/* Legal Declaration */}
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs space-y-2">
              <div className="flex items-start space-x-2.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  By digitally signing below, I certify that I have thoroughly read, understood, and agreed to abide by all the policies, standards, and security controls defined in <strong>{document.title} (v{document.version})</strong>. I understand that adherence is an active condition of employment and ISO 27001 regulatory compliance.
                </p>
              </div>

              <label className="flex items-center space-x-2.5 pt-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={e => setDeclarationAccepted(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-900">
                  I accept and confirm this compliance declaration
                </span>
              </label>
            </div>

            {/* Signature Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Digital Signature / Sign-off Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={signatureText}
                onChange={e => setSignatureText(e.target.value)}
                placeholder="e.g. SriKarthiK / CISO"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Acknowledgment Remarks / Scope Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Completed during annual Q3 ISMS refresher walkthrough"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center text-[11px] text-slate-500 space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>SHA-256 Cryptographic Audit Proof</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !declarationAccepted}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  {isSubmitting ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Sign & Acknowledge</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
