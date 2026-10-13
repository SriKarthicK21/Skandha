// Skanda BrandGuard — Outbound Zero-Hour IoC Feeds & EDR Telemetry Hub
// Chief Antivirus Architect: Suricata, DNS RPZ, STIX 2.1, EDR KQL & MurmurHash3 Shodan Feeds
import React, { useState } from 'react';
import {
  ShieldAlert,
  Download,
  Copy,
  Check,
  Code,
  Terminal,
  Server,
  Zap,
  Radio,
  ExternalLink,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import { ZeroHourIocFeedBundle } from '../../types/brandguard';
import { BrandGuardIocFeedService } from '../../services/brandguard/brandguardIocFeedService';
import { useGRC } from '../../context/GRCContext';

export const BrandGuardZeroHourIocDesk: React.FC = () => {
  const { theme, logAuditEvent } = useGRC();

  const [feedBundle, setFeedBundle] = useState<ZeroHourIocFeedBundle>(() =>
    BrandGuardIocFeedService.generateIocFeedBundle()
  );
  const [activeFormat, setActiveFormat] = useState<
    'SURICATA' | 'DNS_RPZ' | 'STIX_TAXII' | 'SENTINEL_KQL' | 'CROWDSTRIKE' | 'PALO_ALTO_EDL'
  >('SURICATA');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    logAuditEvent('EXPORT', 'IoC Feed Clipboard', `Copied ${key} threat intelligence feed to clipboard.`);
  };

  const handleDownload = (content: string, filename: string) => {
    BrandGuardIocFeedService.downloadFeed(content, filename);
    logAuditEvent('EXPORT', 'IoC Feed Download', `Downloaded ${filename} for perimeter defense distribution.`);
  };

  const getContentForActiveFormat = () => {
    switch (activeFormat) {
      case 'SURICATA':
        return {
          content: feedBundle.snortSuricataRules,
          filename: 'brandguard_suricata_snort_rules.rules',
          mime: 'text/plain',
          desc: 'Network Intrusion Prevention System (NIPS/NIDS) rules detecting phishing domains, rogue HTTP POSTs, and cloned auth endpoints.'
        };
      case 'DNS_RPZ':
        return {
          content: feedBundle.dnsRpzZoneFile,
          filename: 'brandguard_dns_rpz.zone',
          mime: 'text/plain',
          desc: 'Response Policy Zone (RPZ) BIND 9 zone file to immediately sinkhole rogue domains to NXDOMAIN across internal enterprise resolvers.'
        };
      case 'STIX_TAXII':
        return {
          content: feedBundle.stix21BundleJson,
          filename: 'brandguard_stix21_bundle.json',
          mime: 'application/json',
          desc: 'OASIS STIX 2.1 standard JSON bundle consumable by TAXII 2.1 servers, MISP, Microsoft Sentinel, and OpenCTI.'
        };
      case 'SENTINEL_KQL':
        return {
          content: feedBundle.sentinelKqlQuery,
          filename: 'brandguard_microsoft_sentinel.kql',
          mime: 'text/plain',
          desc: 'Kusto Query Language (KQL) threat hunting rule for Microsoft Sentinel and Microsoft Defender for Endpoint (MDE).'
        };
      case 'CROWDSTRIKE':
        return {
          content: feedBundle.crowdstrikeFalconQuery,
          filename: 'brandguard_crowdstrike_falcon.txt',
          mime: 'text/plain',
          desc: 'CrowdStrike Falcon Event Search / Splunk hunting query targeting zero-hour malicious domains and Trojanized brand installers.'
        };
      case 'PALO_ALTO_EDL':
        return {
          content: feedBundle.paloAltoEdlFeed,
          filename: 'brandguard_palo_alto_edl.txt',
          mime: 'text/plain',
          desc: 'Flat newline-delimited External Dynamic List (EDL) for Palo Alto PAN-OS and Fortinet FortiGate Security Fabric.'
        };
    }
  };

  const currentPayload = getContentForActiveFormat();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${
        theme === 'light'
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800'
          : 'bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 text-white border-slate-800'
      } shadow-xl relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Chief Antivirus Architect Suite</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                OUTBOUND ZERO-HOUR IOC TELEMETRY
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Enterprise Defense & Endpoint Threat Feed Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Don't wait 48 hours for global blocklists to update. Syndicate verified BrandGuard phishing infrastructure,
              MurmurHash3 favicon digests, and cloned DOM hashes directly to firewalls, EDR agents, and DNS sinkholes in real time.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Zero-Hour IoCs</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">{feedBundle.totalActiveIocs}</span>
              <span className="text-[10px] text-emerald-400 block font-semibold">Ready for EDR / Firewall Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* MurmurHash3 Favicon Shodan Intelligence Card */}
      <div className={`p-5 rounded-xl border shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      } space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Rogue Favicon MurmurHash3 (mmh3) Shodan Feeds
              </h3>
              <p className="text-xs text-slate-400">
                32-bit signed MurmurHash3 digests of rogue website favicons. Uncovers attacker bulletproof infrastructure globally.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {feedBundle.rogueFaviconMurmurHashes.map((hash, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Rogue Asset #{idx + 1}</span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  mmh3
                </span>
              </div>
              <div className="font-mono text-sm font-black text-amber-400">{hash}</div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                http.favicon.hash:{hash}
              </div>
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(`http.favicon.hash:${hash}`, `shodan_${hash}`)}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  {copiedKey === `shodan_${hash}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy Shodan Query</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Format Switcher & Viewer */}
      <div className={`rounded-xl border overflow-hidden shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* Format Tabs */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          theme === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/40'
        }`}>
          <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'SURICATA', label: 'Suricata / Snort Rules' },
              { id: 'DNS_RPZ', label: 'DNS RPZ (BIND / Infoblox)' },
              { id: 'STIX_TAXII', label: 'STIX 2.1 / TAXII JSON' },
              { id: 'SENTINEL_KQL', label: 'Microsoft Sentinel (MDE KQL)' },
              { id: 'CROWDSTRIKE', label: 'CrowdStrike Falcon Query' },
              { id: 'PALO_ALTO_EDL', label: 'Palo Alto / Fortinet EDL' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFormat(tab.id as any)}
                className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeFormat === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : theme === 'light'
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(currentPayload.content, activeFormat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center space-x-1.5 transition-colors ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {copiedKey === activeFormat ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedKey === activeFormat ? 'Copied' : 'Copy Feed'}</span>
            </button>
            <button
              onClick={() => handleDownload(currentPayload.content, currentPayload.filename)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className={`px-5 py-2.5 border-b text-xs ${
          theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Format Target: </span>
          {currentPayload.desc}
        </div>

        {/* Code View */}
        <div className="p-4 bg-slate-950 font-mono text-xs text-indigo-300 overflow-x-auto max-h-96 border-t border-slate-800/80">
          <pre className="whitespace-pre">{currentPayload.content}</pre>
        </div>
      </div>
    </div>
  );
};
