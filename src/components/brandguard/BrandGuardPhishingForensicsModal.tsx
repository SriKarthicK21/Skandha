// Skanda BrandGuard — Phishing Kit Forensics & Heuristics Modal
// Chief Antivirus Architect: MurmurHash3, YARA Compiler, Exfiltration Sniffer & Anti-Cloaking Telemetry
import React, { useState } from 'react';
import {
  Cpu,
  Code,
  Copy,
  Check,
  Download,
  Terminal,
  ShieldAlert,
  Send,
  ExternalLink,
  Eye,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { BrandFinding, PhishingKitForensics } from '../../types/brandguard';
import { BrandGuardForensicsService } from '../../services/brandguard/brandguardForensicsService';
import { useGRC } from '../../context/GRCContext';

interface Props {
  finding: BrandFinding;
  onClose: () => void;
}

export const BrandGuardPhishingForensicsModal: React.FC<Props> = ({ finding, onClose }) => {
  const { logAuditEvent } = useGRC();
  const [forensics] = useState<PhishingKitForensics>(() =>
    BrandGuardForensicsService.analyzePhishingKit(finding.id, finding.targetDomain)
  );
  const [copiedYara, setCopiedYara] = useState(false);
  const [copiedMmh3, setCopiedMmh3] = useState(false);

  const handleCopyYara = () => {
    navigator.clipboard.writeText(forensics.compiledYaraRule);
    setCopiedYara(true);
    setTimeout(() => setCopiedYara(false), 2000);
    logAuditEvent('EXPORT', 'YARA Signature Clipboard', `Copied compiled YARA signature for ${finding.targetDomain}.`);
  };

  const handleCopyMmh3 = () => {
    navigator.clipboard.writeText(forensics.faviconShodanQuery);
    setCopiedMmh3(true);
    setTimeout(() => setCopiedMmh3(false), 2000);
  };

  const handleDownloadYara = () => {
    const blob = new Blob([forensics.compiledYaraRule], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brandguard_${finding.targetDomain.replace(/[^a-zA-Z0-9]/g, '_')}.yar`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full my-8 p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                  CHIEF ANTIVIRUS ARCHITECT DEEP DIVE
                </span>
                <span className="text-xs text-slate-400 font-mono">Kit: {forensics.kitFamily}</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                Phishing Kit Forensics & Heuristic Signature Extraction
              </h2>
              <p className="text-xs text-slate-400">
                Analysis of MurmurHash3 favicon digests, exfiltration channels, and anti-cloaking evasions for{' '}
                <span className="text-rose-400 font-bold font-mono">{finding.targetDomain}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
          >
            ✕
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* mmh3 Favicon */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Favicon MurmurHash3
            </span>
            <div className="font-mono text-lg font-black text-amber-300">{forensics.faviconMurmurHash3}</div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              {forensics.faviconShodanQuery}
            </div>
            <button
              onClick={handleCopyMmh3}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 mt-1"
            >
              {copiedMmh3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMmh3 ? 'Copied' : 'Copy Shodan Query'}</span>
            </button>
          </div>

          {/* Exfiltration Channels */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Exfiltration Channels
            </span>
            <div className="text-lg font-black text-rose-400">
              {forensics.exfiltrationChannels.telegramBotTokens.length +
                forensics.exfiltrationChannels.discordWebhooks.length +
                forensics.exfiltrationChannels.phpCredentialGates.length}{' '}
              Endpoints
            </div>
            <p className="text-[11px] text-slate-400">
              Intercepted hardcoded Telegram bot drops, Discord webhooks, and PHP dump gates.
            </p>
          </div>

          {/* Anti-Cloaking Status */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sandbox Anti-Cloaking
            </span>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                CLOAKING BYPASSED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Egress through US residential proxy mesh to evade adversary cloud datacenter IP blocks.
            </p>
          </div>
        </div>

        {/* Exfiltration Drop Details */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 text-rose-400 font-bold">
            <Send className="w-4 h-4" />
            <span>Extracted Attacker Exfiltration Endpoints:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 block mb-1">Telegram Exfiltration Bots:</span>
              <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-slate-300 space-y-1">
                {forensics.exfiltrationChannels.telegramBotTokens.map((tok, i) => (
                  <div key={i} className="truncate text-rose-300">{tok}</div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">PHP Credential Dumpers:</span>
              <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-slate-300 space-y-1">
                {forensics.exfiltrationChannels.phpCredentialGates.map((gate, i) => (
                  <div key={i} className="truncate text-amber-300">{gate}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Compiled YARA Rule Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">
                Auto-Compiled Syntactic YARA Rule (Heuristic DOM Signature):
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyYara}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5"
              >
                {copiedYara ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedYara ? 'Copied' : 'Copy YARA'}</span>
              </button>
              <button
                onClick={handleDownloadYara}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .YAR</span>
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black font-mono text-[11px] text-emerald-400 border border-slate-800 max-h-56 overflow-y-auto whitespace-pre">
            {forensics.compiledYaraRule}
          </div>
        </div>

        {/* Binary & APK Detonation Preview */}
        {forensics.binaryDetonation && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Secondary Malicious Payload & Android APK Detonation:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">File: </span>
                <span className="font-mono text-slate-200">{forensics.binaryDetonation.fileName}</span>
              </div>
              <div>
                <span className="text-slate-500">Authenticode: </span>
                <span className="font-bold text-rose-400">{forensics.binaryDetonation.authenticodeStatus}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Dangerous APK Permissions: </span>
                <span className="font-mono text-amber-300">
                  {forensics.binaryDetonation.androidApkDangerousPermissions?.join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close Forensics
          </button>
        </div>
      </div>
    </div>
  );
};
