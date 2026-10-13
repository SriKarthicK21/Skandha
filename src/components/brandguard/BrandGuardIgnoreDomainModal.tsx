import React, { useState } from 'react';
import { EyeOff, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrandFinding } from '../../types/brandguard';

interface BrandGuardIgnoreDomainModalProps {
  finding: BrandFinding | null;
  domainToIgnore?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmIgnore: (domain: string, reason: string, findingId?: string) => void;
  theme?: string;
}

const COMMON_IGNORE_REASONS = [
  'Authorized partner, vendor, or internal development asset',
  'Coincidental string match with no trademark infringement or malicious intent',
  'Academic, educational, or benign informational reference',
  'Fair-use commentary, review, or customer feedback forum',
  'Custom justification'
];

export const BrandGuardIgnoreDomainModal: React.FC<BrandGuardIgnoreDomainModalProps> = ({
  finding,
  domainToIgnore,
  isOpen,
  onClose,
  onConfirmIgnore,
  theme = 'dark'
}) => {
  const targetDomain = domainToIgnore || finding?.targetDomain || '';
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_IGNORE_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [persistPermanently, setPersistPermanently] = useState<boolean>(true);

  if (!isOpen || !targetDomain) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Custom justification'
      ? (customReason.trim() || 'Marked as false positive by threat analyst')
      : selectedReason;

    onConfirmIgnore(targetDomain, finalReason, finding?.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ignore-domain-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800/80 text-amber-400 border border-slate-700">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ignore-domain-modal-title" className="text-sm font-bold">
                Ignore Impersonation Domain
              </h2>
              <p className="text-[11px] text-slate-400">
                Hide false positive and persist exception in database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Domain Card */}
          <div className={`p-3.5 rounded-xl border ${
            theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Target Impersonation Domain
            </span>
            <div className="font-mono text-sm font-bold text-indigo-400 mt-0.5 break-all">
              {targetDomain}
            </div>
            {finding && (
              <div className="mt-1 flex items-center space-x-2 text-[11px] text-slate-400">
                <span>Code: {finding.findingCode}</span>
                <span>•</span>
                <span>Type: {finding.findingType.replace(/_/g, ' ')}</span>
                <span>•</span>
                <span>Risk: {finding.riskScore?.totalScore ?? 'N/A'}/100</span>
              </div>
            )}
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Select Reason for Marking False Positive
            </label>
            <div className="space-y-1.5">
              {COMMON_IGNORE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                      : theme === 'light'
                      ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      : 'border-slate-800 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="ignoreReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          {selectedReason === 'Custom justification' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Custom Justification Details
              </label>
              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explain why this domain is non-infringing or authorized..."
                className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
                required
              />
            </div>
          )}

          {/* Persistence Notice */}
          <div className="flex items-start space-x-2 p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-slate-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-300">Persistent Preference:</span> This domain will be stored in your organization&apos;s False-Positive Whitelist registry. Future automated crawler sweeps and Certificate Transparency feeds will automatically suppress alerts for this domain.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 rounded-xl font-semibold cursor-pointer ${
                theme === 'light' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ignore & Hide Domain</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
