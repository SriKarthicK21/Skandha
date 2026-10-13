import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  FileCheck2,
  Lock,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Hash,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

export const ContinuousEvidenceWorkspace: React.FC = () => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const evidenceItems = [
    {
      id: 'EV-AWS-2026-001',
      name: 'AWS S3 Production Server-Side Encryption (KMS) Telemetry Snapshot',
      sourceSystem: 'AWS Security Hub',
      sourceType: 'Cloud Telemetry',
      collectedAt: '2026-10-05T12:00:00Z',
      validUntil: '2026-11-05T12:00:00Z',
      freshnessStatus: 'CURRENT',
      controlMappings: ['ISO 27001 A.8.24', 'SOC 2 CC6.6', 'MAS TRM Sec 11.2'],
      sha256Hash: 'a8b1c4e9d7f02341b5a6c8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
      status: 'VERIFIED'
    },
    {
      id: 'EV-ENTRA-2026-042',
      name: 'Entra ID Privileged Administrator MFA & WebAuthn Audit Extract',
      sourceSystem: 'Microsoft Entra ID',
      sourceType: 'Identity Telemetry',
      collectedAt: '2026-10-05T11:45:00Z',
      validUntil: '2026-11-05T11:45:00Z',
      freshnessStatus: 'CURRENT',
      controlMappings: ['ISO 27001 A.5.15', 'SOC 2 CC6.1', 'MAS TRM Sec 11.1'],
      sha256Hash: '3f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a',
      status: 'VERIFIED'
    },
    {
      id: 'EV-GH-2026-088',
      name: 'GitHub Enterprise Branch Protection & Mandatory Peer Review Gate Policy',
      sourceSystem: 'GitHub Enterprise',
      sourceType: 'DevOps Gate',
      collectedAt: '2026-10-05T10:30:00Z',
      validUntil: '2026-10-12T10:30:00Z',
      freshnessStatus: 'EXPIRING_SOON',
      controlMappings: ['ISO 27001 A.8.28', 'SOC 2 CC8.1', 'MAS TRM Sec 6.1'],
      sha256Hash: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
      status: 'VERIFIED'
    }
  ];

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Automated Evidence Vault
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Cryptographic WORM Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Continuous Evidence Harvesting
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Automated, tamper-proof evidence ingestion mapped to canonical controls with continuous freshness tracking and SHA-256 audit seals.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          Harvest Latest Telemetry
        </button>
      </div>

      {/* Freshness Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Freshness</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94%</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Valid compliance posture</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 shadow-sm bg-emerald-50/20 dark:bg-emerald-950/10">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Current Evidence</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">42</div>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-1 block">&gt; 14 days remaining</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-sm bg-amber-50/20 dark:bg-amber-950/10">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Expiring Soon</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">3</div>
          <span className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1 block">&lt; 7 days to auto-refresh</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 shadow-sm bg-purple-50/20 dark:bg-purple-950/10">
          <span className="text-xs font-medium text-purple-700 dark:text-purple-400">WORM Block Height</span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">#4,812</div>
          <span className="text-xs text-purple-600/80 dark:text-purple-400/70 mt-1 block">Immutable audit chain</span>
        </div>
      </div>

      {/* Harvested Evidence Cards */}
      <div className="space-y-4">
        {evidenceItems.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {item.id}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Source: <strong>{item.sourceSystem}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  item.freshnessStatus === 'CURRENT'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  {item.freshnessStatus.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires in 30 days
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {item.name}
            </h3>

            {/* Mappings */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Mapped Controls:</span>
              {item.controlMappings.map((mapping, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                >
                  {mapping}
                </span>
              ))}
            </div>

            {/* SHA-256 Digest */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  SHA-256: {item.sha256Hash}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(item.sha256Hash)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  title="Copy SHA-256 Digest"
                >
                  {copiedHash === item.sha256Hash ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => GrcNavigationService.openEntity360(item.id, 'EVIDENCE')}
                  className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1 font-medium"
                >
                  <Layers className="w-3 h-3" />
                  360° Lineage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
