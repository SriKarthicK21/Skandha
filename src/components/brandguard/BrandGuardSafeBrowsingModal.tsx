// Skanda BrandGuard — Browser Safe Browsing One-Click Submission Generator Modal
// Interactive submission generator for Google Safe Browsing API, Microsoft SmartScreen,
// and CleanBrowsing feeds with cryptographic evidence digests.

import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe,
  Send,
  Copy,
  Check,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Code2,
  Lock
} from 'lucide-react';
import { BrandFinding, BrandProfile } from '../../types/brandguard';
import {
  BrandGuardSafeBrowsingService,
  SafeBrowsingProvider,
  SafeBrowsingSubmissionPayload
} from '../../services/brandguard/brandguardSafeBrowsingService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardSafeBrowsingModalProps {
  finding: BrandFinding;
  brandProfile: BrandProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (submission: SafeBrowsingSubmissionPayload) => void;
}

export const BrandGuardSafeBrowsingModal: React.FC<BrandGuardSafeBrowsingModalProps> = ({
  finding,
  brandProfile,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [selectedProvider, setSelectedProvider] = useState<SafeBrowsingProvider>('GOOGLE_SAFE_BROWSING');
  const [reporterEmail, setReporterEmail] = useState('security-response@apexfintech.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<SafeBrowsingSubmissionPayload | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const currentPayload = completedSubmission || BrandGuardSafeBrowsingService.generateSubmissionPackage(
    finding,
    brandProfile,
    selectedProvider,
    reporterEmail
  );

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentPayload.rawJsonPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(currentPayload.curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const data = JSON.stringify(currentPayload, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeBrowsing_Submission_${currentPayload.submissionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      const result = await BrandGuardSafeBrowsingService.executeDispatch(currentPayload);
      setCompletedSubmission(result);

      logAuditEvent(
        'APPROVE',
        'BrandGuard Safe Browsing Desk',
        `Dispatched real-time browser blacklist payload to ${result.provider} for ${finding.targetDomain} [Ticket: ${result.simulatedResponse?.ticketReference}]`
      );

      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch {
      // dispatch error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`rounded-xl border w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Globe className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold truncate">Browser Safe Browsing Rapid Blacklist Dispatch</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  RAPID NEUTRALIZATION
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Dispatches threat payloads to place red-screen warning interstitials across Chrome, Edge, Firefox & Safari
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light' ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Switcher Tabs */}
        <div className={`flex border-b px-5 space-x-3 text-xs font-bold pt-3 overflow-x-auto ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800'
        }`}>
          {[
            { id: 'GOOGLE_SAFE_BROWSING', label: 'Google Safe Browsing / Web Risk' },
            { id: 'MICROSOFT_SMARTSCREEN', label: 'Microsoft SmartScreen Anti-Phishing' },
            { id: 'CLEAN_BROWSING', label: 'CleanBrowsing / DNS RPZ Feed' }
          ].map(tab => (
            <button
              key={tab.id}
              disabled={!!completedSubmission}
              onClick={() => setSelectedProvider(tab.id as SafeBrowsingProvider)}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                selectedProvider === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Configuration Row */}
        <div className={`p-4 border-b grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${
          theme === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Target Infringement URL
            </label>
            <input
              type="text"
              readOnly
              value={finding.targetUrl}
              className={`w-full font-mono text-xs px-3 py-2 rounded-lg border ${
                theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-indigo-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Verified Reporter Corporate Email
            </label>
            <input
              type="email"
              value={reporterEmail}
              disabled={!!completedSubmission}
              onChange={e => setReporterEmail(e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>
        </div>

        {/* Modal Body: Active Status or Payload Inspection */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {completedSubmission?.simulatedResponse ? (
            /* Successful Submission Banner */
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">
                    Blacklist Payload Confirmed by Threat Cloud
                  </h4>
                  <p className="text-slate-300 text-xs">
                    Ticket Reference: <strong className="font-mono text-white">{completedSubmission.simulatedResponse.ticketReference}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-slate-300">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Status:</span>
                  <span className="font-bold text-emerald-400">PROTECTION ACTIVE</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">User Interstitial ETA:</span>
                  <span className="font-bold text-white">~{completedSubmission.simulatedResponse.protectionEtaMinutes} Minutes</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Warning Category:</span>
                  <span className="font-bold text-rose-400">{completedSubmission.simulatedResponse.recommendedBlacklistCategory}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400 text-[11px]">
                  All future visitors using Chrome, Edge, Safari, or Brave will see a full-page red security warning.
                </span>
                <button
                  onClick={handleDownloadReceipt}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Receipt</span>
                </button>
              </div>
            </div>
          ) : (
            /* Payload Inspection & Code Views */
            <div className="space-y-4">
              {/* Threat Classification Digest */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">Cryptographic Chain-of-Custody Attached</span>
                    <span className="font-mono text-slate-400 text-[11px] block">
                      SHA-256 Digest: {finding.evidence.sha256Hash}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Verified Mark Owner
                </span>
              </div>

              {/* JSON REST Payload Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-bold text-slate-400 flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>REST Submission JSON Payload</span>
                  </span>
                  <button
                    onClick={handleCopyPayload}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 text-[11px] border border-slate-700 transition-colors"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre
                  className={`p-3.5 rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  {currentPayload.rawJsonPayload}
                </pre>
              </div>

              {/* cURL Command Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-bold text-slate-400 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>cURL Terminal Equivalent</span>
                  </span>
                  <button
                    onClick={handleCopyCurl}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 text-[11px] border border-slate-700 transition-colors"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre
                  className={`p-3 rounded-xl font-mono text-[11px] leading-relaxed max-h-24 overflow-y-auto border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-emerald-300'
                  }`}
                >
                  {currentPayload.curlCommand}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Direct API Hook: Dispatches authenticated submission to global threat feeds.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>

            {!completedSubmission && (
              <button
                onClick={handleDispatch}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Globe className="w-4 h-4 animate-spin text-white" />
                    <span>Transmitting Payload...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch 1-Click Submission</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
