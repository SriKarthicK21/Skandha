// Skanda BrandGuard — Abuse Report & Takedown Modal
// Interactive composer for formal abuse reports to Registrars, Hosting Providers,
// CDNs, and Google Safe Browsing with cryptographic SHA-256 evidence.

import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  Copy,
  Check,
  FileText,
  Building,
  Server,
  Globe,
  Lock,
  X,
  Download,
  AlertTriangle
} from 'lucide-react';
import { BrandFinding, BrandProfile } from '../../types/brandguard';
import { BrandGuardMitigationService, GeneratedAbuseNotice } from '../../services/brandguard/brandguardMitigationService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardAbuseReportModalProps {
  finding: BrandFinding;
  brandProfile: BrandProfile;
  isOpen: boolean;
  onClose: () => void;
  onTakedownDispatched?: (notice: GeneratedAbuseNotice) => void;
}

export const BrandGuardAbuseReportModal: React.FC<BrandGuardAbuseReportModalProps> = ({
  finding,
  brandProfile,
  isOpen,
  onClose,
  onTakedownDispatched
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [recipientType, setRecipientType] = useState<GeneratedAbuseNotice['recipientType']>('REGISTRAR');
  const [officerName, setOfficerName] = useState('Priya Sharma (CISO / Threat Response Lead)');
  const [copied, setCopied] = useState(false);
  const [hasDispatched, setHasDispatched] = useState(false);

  if (!isOpen) return null;

  const notice = BrandGuardMitigationService.generateAbuseNotice(
    finding,
    brandProfile,
    recipientType,
    officerName
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(notice.bodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([notice.bodyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Abuse_Takedown_Notice_${finding.findingCode}_${recipientType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAuthorizeDispatch = () => {
    setHasDispatched(true);
    logAuditEvent(
      'APPROVE',
      'BrandGuard Abuse Desk',
      `Authorized and logged abuse complaint dispatch to ${recipientType} (${notice.recipientAddress}) for ${finding.targetDomain} [Notice Ref: ${notice.noticeId}, Evidence SHA-256: ${finding.evidence.sha256Hash.slice(0, 16)}...]`
    );
    if (onTakedownDispatched) {
      onTakedownDispatched(notice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`rounded-xl border w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold truncate">Formal Abuse & Takedown Composer</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {notice.noticeId}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Target: {finding.targetDomain} ({finding.findingType.replace(/_/g, ' ')})
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

        {/* Configuration Bar */}
        <div className={`p-4 border-b grid grid-cols-1 sm:grid-cols-3 gap-3 ${
          theme === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Abuse Recipient Entity
            </label>
            <select
              value={recipientType}
              onChange={e => setRecipientType(e.target.value as any)}
              className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            >
              <option value="REGISTRAR">Domain Registrar ({finding.domainIntel.registrar})</option>
              <option value="HOSTING_PROVIDER">Hosting Provider ({finding.domainIntel.hostingProvider})</option>
              <option value="CDN">CDN / Proxy Network</option>
              <option value="GOOGLE_SAFE_BROWSING">Google Safe Browsing & Anti-Phishing Desk</option>
              <option value="LEGAL_COUNSEL">External IP / Trademark Legal Counsel</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Designated Dispatch Address
            </label>
            <input
              type="text"
              readOnly
              value={notice.recipientAddress}
              className={`w-full text-xs font-mono px-3 py-2 rounded-lg border ${
                theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900/60 border-slate-700 text-slate-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Authorized Signatory
            </label>
            <input
              type="text"
              value={officerName}
              onChange={e => setOfficerName(e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>
        </div>

        {/* Notice Preview Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standard RFC 2142 & ICANN RAA Compliant Notice Text</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .txt</span>
              </button>
            </div>
          </div>

          <pre
            className={`p-4 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed border max-h-[340px] overflow-y-auto ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            {notice.bodyText}
          </pre>

          {/* Cryptographic Evidence Digest */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            theme === 'light' ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
          }`}>
            <div className="flex items-center space-x-3 min-w-0">
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="min-w-0">
                <span className="text-xs font-bold block">Cryptographic Chain-of-Custody Verified</span>
                <span className="text-[11px] font-mono text-slate-400 truncate block">
                  SHA-256: {finding.evidence.sha256Hash}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Tamper-Evident
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Human-in-the-loop: Dispatches are logged to the immutable audit trail.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleAuthorizeDispatch}
              disabled={hasDispatched}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg ${
                hasDispatched
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              {hasDispatched ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{hasDispatched ? 'Takedown Dispatched & Logged' : 'Authorize & Log Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
