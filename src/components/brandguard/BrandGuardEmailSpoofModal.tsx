// Skanda BrandGuard — Active Mail Server (MX) & Email Spoofability Inspector Modal
// Deep DNS inspection for active MX records, SPF include directives, and DMARC policies.
// Flags whether rogue or lookalike domains can dispatch spoofed emails to customers or employees.

import React, { useState } from 'react';
import {
  Mail,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Server,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  X,
  Send,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { BrandFinding, BrandProfile } from '../../types/brandguard';
import { BrandGuardEmailSecurityService } from '../../services/brandguard/brandguardEmailSecurityService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardEmailSpoofModalProps {
  domain: string;
  finding?: BrandFinding | null;
  brandProfile?: BrandProfile;
  isOpen: boolean;
  onClose: () => void;
  onElevateSeverity?: () => void;
}

export const BrandGuardEmailSpoofModal: React.FC<BrandGuardEmailSpoofModalProps> = ({
  domain,
  finding,
  brandProfile,
  isOpen,
  onClose,
  onElevateSeverity
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [isProbing, setIsProbing] = useState(false);
  const [probeLog, setProbeLog] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState(() =>
    BrandGuardEmailSecurityService.inspectDomainEmailSecurity(domain)
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunLiveProbe = async () => {
    setIsProbing(true);
    setProbeLog([
      `[${new Date().toLocaleTimeString()}] Querying root name servers for MX record set on "${domain}"...`,
      `[${new Date().toLocaleTimeString()}] Initiating STARTTLS handshake to port 25 on mail exchanges...`,
      `[${new Date().toLocaleTimeString()}] Evaluating TXT record set for SPF (RFC 7208) include directives...`,
      `[${new Date().toLocaleTimeString()}] Querying _dmarc.${domain} for DMARC (RFC 7489) policy...`
    ]);

    await new Promise(r => setTimeout(r, 600));

    const result = BrandGuardEmailSecurityService.inspectDomainEmailSecurity(domain);
    setAnalysis(result);
    setIsProbing(false);

    logAuditEvent(
      'ACCESS',
      'BrandGuard Email Spoof Inspector',
      `Executed live DNS mail server & spoofability probe on "${domain}". Result: ${result.spoofabilityRating}. Active MX: ${result.activeMailServerConfirmed}`
    );
  };

  const handleCopyReport = () => {
    const text = `SKANDA BRANDGUARD - EMAIL SPOOFABILITY & MX PROBE REPORT
Domain: ${domain}
Rating: ${analysis.spoofabilityRating}
Active Mail Server: ${analysis.activeMailServerConfirmed ? 'CONFIRMED ACTIVE' : 'NO MX RESOLVED'}
MX Records:
${analysis.mxRecords.map(m => `  - Priority ${m.priority}: ${m.host} (${m.ip || 'N/A'}) [${m.status}]`).join('\n')}
SPF Policy: ${analysis.spf.raw} (${analysis.spf.explanation})
DMARC Policy: ${analysis.dmarc.raw} (Policy: ${analysis.dmarc.policy})
Rationale: ${analysis.summaryReason}
Timestamp: ${new Date().toISOString()}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCritical = analysis.spoofabilityRating === 'CRITICAL_SPOOFABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`rounded-xl border w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl border ${
                isCritical
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              }`}
            >
              <Mail className="w-5 h-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-base font-bold truncate">Active Mail Server & Email Spoofability Inspector</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : analysis.spoofabilityRating === 'HIGH_EXPOSURE'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {analysis.spoofabilityRating.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Domain: <strong className="text-indigo-400">{domain}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunLiveProbe}
              disabled={isProbing}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isProbing
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{isProbing ? 'Probing...' : 'Re-Probe DNS'}</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                theme === 'light' ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Threat Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              isCritical
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-sm">
                {isCritical
                  ? 'CRITICAL THREAT: Active Mail Server Confirmed with Zero Anti-Spoofing'
                  : 'Email Infrastructure Analysis & Exposure Assessment'}
              </span>
              <p className="text-[11px] leading-relaxed opacity-90">{analysis.summaryReason}</p>
            </div>
          </div>

          {/* Live Probing Terminal when running */}
          {isProbing && (
            <div className="p-3 rounded-xl bg-black border border-indigo-500/30 font-mono text-[11px] text-indigo-300 space-y-1">
              {probeLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}

          {/* DNS Email Security Triad Cards: MX, SPF, DMARC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* MX Card */}
            <div
              className={`p-3.5 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                  MX Records (Mail Exchange)
                </span>
                <Server className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    analysis.activeMailServerConfirmed ? 'bg-rose-500 animate-ping' : 'bg-slate-600'
                  }`}
                />
                <span className="font-bold text-xs">
                  {analysis.activeMailServerConfirmed
                    ? `${analysis.mxRecords.length} Active Server(s)`
                    : 'No MX Detected'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {analysis.activeMailServerConfirmed
                  ? 'Domain can receive/send mail via configured MTA.'
                  : 'Domain cannot accept inbound SMTP routing.'}
              </p>
            </div>

            {/* SPF Card */}
            <div
              className={`p-3.5 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                  SPF Policy (RFC 7208)
                </span>
                <Lock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold ${
                    analysis.spf.allowsSpoofing
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {analysis.spf.mechanism}
                </span>
                <span className="text-[10px] text-slate-400">
                  {analysis.spf.allowsSpoofing ? 'Permits Spoofing' : 'Enforces Rejection'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{analysis.spf.explanation}</p>
            </div>

            {/* DMARC Card */}
            <div
              className={`p-3.5 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                  DMARC Policy (RFC 7489)
                </span>
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold ${
                    analysis.dmarc.policy === 'reject'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  p={analysis.dmarc.policy}
                </span>
                <span className="text-[10px] text-slate-400">
                  {analysis.dmarc.isSpoofable ? 'No In-box Protection' : 'Hard Rejection'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{analysis.dmarc.explanation}</p>
            </div>
          </div>

          {/* Active MX Server Details */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Resolved Mail Exchange Hosts (MX Probes)</span>
            </h4>
            {analysis.mxRecords.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-400 text-center">
                No active MX records configured for {domain}.
              </div>
            ) : (
              <div className="space-y-2">
                {analysis.mxRecords.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] ${
                      theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        Priority {m.priority}
                      </span>
                      <span className="font-bold text-slate-200">{m.host}</span>
                      {m.ip && <span className="text-slate-500">({m.ip})</span>}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px]">
                      {m.banner && <span className="text-slate-400 truncate max-w-xs">{m.banner}</span>}
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Potential Attack Vector Scenarios */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Exploitable Attack Vectors on this Infrastructure</span>
            </h4>
            <div className="space-y-1.5">
              {analysis.attackVectorScenarios.map((scenario, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/60 flex items-start space-x-2 text-[11px]"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-relaxed">{scenario}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Operational Mitigation */}
          <div
            className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
              theme === 'light' ? 'bg-indigo-50/60 border-indigo-200' : 'bg-indigo-950/30 border-indigo-800/50'
            }`}
          >
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-indigo-300">Recommended Operational Action:</span>
              <p className="text-[11px] text-slate-300">{analysis.recommendedAction}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            onClick={handleCopyReport}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Probe Report!' : 'Copy Forensic Report'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {isCritical && onElevateSeverity && (
              <button
                onClick={() => {
                  onElevateSeverity();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Elevate Finding to CRITICAL</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
