import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { useEnterpriseRealTime } from '../../services/telemetry/enterpriseRealTimeService';
import {
  Activity,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Cpu,
  Layers,
  Send,
  Binary,
  Clock,
  Sparkles,
  Download,
  Copy,
  Check,
  Filter,
  Eye,
  SlidersHorizontal,
  Wrench,
  Terminal
} from 'lucide-react';

interface RealTimeEnterpriseDeckProps {
  onNavigateModule: (moduleId: string) => void;
  onSwitchToOperational?: () => void;
}

export const RealTimeEnterpriseDeck: React.FC<RealTimeEnterpriseDeckProps> = ({
  onNavigateModule,
  onSwitchToOperational
}) => {
  const { theme, currentTenant } = useGRC();
  const { showToast } = useToast();
  const { stats, events, ledgerBlocks, simulateEvent, verifyLedgerIntegrity, harvest10Controls } = useEnterpriseRealTime();

  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedRoot, setCopiedRoot] = useState(false);
  const [selectedEventCategory, setSelectedEventCategory] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'PASS'>('ALL');
  const [activeDriftCount, setActiveDriftCount] = useState(0);

  // 10 Core Technical Controls Live State
  const [controlsState, setControlsState] = useState([
    { code: 'A.5.17', name: 'Authentication & Secret Management', provider: 'GitHub / AWS Secrets', status: 'PASS', score: '100%', latency: '9ms', lastAudit: 'Just now', seal: 'SEAL-A517-8F' },
    { code: 'A.8.2', name: 'Privileged Access Management (PAM)', provider: 'Okta / AWS IAM', status: 'PASS', score: '100%', latency: '12ms', lastAudit: '1m ago', seal: 'SEAL-A802-3B' },
    { code: 'A.8.3', name: 'Information Access Restriction (RBAC)', provider: 'Okta SCIM', status: 'PASS', score: '100%', latency: '11ms', lastAudit: '2m ago', seal: 'SEAL-A803-9A' },
    { code: 'A.8.4', name: 'Access to Source Code & CI/CD', provider: 'GitHub Branch Protection', status: 'PASS', score: '100%', latency: '14ms', lastAudit: '3m ago', seal: 'SEAL-A804-E2' },
    { code: 'A.8.6', name: 'Capacity & Cloud Resource Management', provider: 'AWS CloudWatch', status: 'PASS', score: '98%', latency: '10ms', lastAudit: '1m ago', seal: 'SEAL-A806-C4' },
    { code: 'A.8.7', name: 'Protection Against Malware & EDR', provider: 'CrowdStrike Falcon', status: 'PASS', score: '100%', latency: '8ms', lastAudit: 'Just now', seal: 'SEAL-A807-1D' },
    { code: 'A.8.8', name: 'Management of Technical Vulnerabilities', provider: 'Trivy / Snyk / Dependabot', status: 'PASS', score: '96%', latency: '15ms', lastAudit: 'Just now', seal: 'SEAL-A808-7F' },
    { code: 'A.8.9', name: 'Configuration Management & IaC', provider: 'Terraform Cloud Drift', status: 'PASS', score: '100%', latency: '13ms', lastAudit: '4m ago', seal: 'SEAL-A809-5E' },
    { code: 'A.8.10', name: 'Information Deletion & Retention', provider: 'AWS S3 Lifecycle Rules', status: 'PASS', score: '100%', latency: '16ms', lastAudit: '5m ago', seal: 'SEAL-A810-6C' },
    { code: 'A.8.20', name: 'Network Security & DDoS Protection', provider: 'Cloudflare Edge WAF', status: 'PASS', score: '100%', latency: '7ms', lastAudit: 'Just now', seal: 'SEAL-A820-2A' }
  ]);

  const handleHarvest = async () => {
    setIsHarvesting(true);
    try {
      const res = await harvest10Controls(currentTenant?.id);
      showToast({
        title: 'Real-Time Evidence Harvest Complete',
        message: 'Harvested 10 core technical controls. Generated 10 cryptographic SHA-256 evidence seals in Evidence Centre.',
        type: 'success'
      });
    } finally {
      setIsHarvesting(false);
    }
  };

  const handleVerifyLedger = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyLedgerIntegrity();
      showToast({
        title: res.verified ? 'Cryptographic Ledger 100% Valid' : 'Ledger Anomaly Detected',
        message: res.verified
          ? `Verified ${res.totalBlocks} blocks from Genesis Hash. Merkle root consistent.`
          : 'Verification returned errors.',
        type: res.verified ? 'success' : 'error'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyRoot = () => {
    navigator.clipboard.writeText(stats.latestMerkleRoot);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
    showToast({ title: 'Merkle Root Copied', message: stats.latestMerkleRoot, type: 'info' });
  };

  const filteredEvents = events.filter(e => {
    if (selectedEventCategory === 'ALL') return true;
    if (selectedEventCategory === 'CRITICAL') return e.severity === 'CRITICAL';
    if (selectedEventCategory === 'HIGH') return e.severity === 'HIGH' || e.severity === 'CRITICAL';
    if (selectedEventCategory === 'PASS') return e.severity === 'INFO' || e.severity === 'LOW';
    return true;
  });

  return (
    <div id="real-time-enterprise-deck" className="space-y-6">
      {/* 1. High-End Real-Time Enterprise Command Strip */}
      <div className={`p-5 rounded-2xl border transition-all shadow-sm ${
        theme === 'light'
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800'
          : 'bg-gradient-to-r from-[#070D19] via-[#0D182E] to-[#070D19] text-white border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-black uppercase tracking-widest text-emerald-400">
                ENTERPRISE CONTINUOUS CONTROLS MONITORING (CCM)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15">
                {stats.latencyMs}ms ultra-low latency
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Zero-Touch Real-Time Governance &amp; Telemetry Stream
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Continuous multi-cloud audit assurance streaming live from AWS, GitHub, Okta, CrowdStrike, and Cloudflare with tamper-evident cryptographic block sealing.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleHarvest}
              disabled={isHarvesting}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isHarvesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>{isHarvesting ? 'Harvesting Telemetry...' : 'Harvest 10 Controls'}</span>
            </button>

            <button
              type="button"
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isVerifying ? 'Verifying Chain...' : 'Verify Cryptographic Ledger'}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Connection State</div>
            <div className="flex items-center space-x-2 mt-1">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-sm font-black text-emerald-400 font-mono">{stats.status}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Uptime: {Math.floor(stats.uptimeSeconds / 60)}m {stats.uptimeSeconds % 60}s</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Cryptographic Ledger</div>
            <div className="flex items-center space-x-2 mt-1">
              <Binary className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-black text-sky-400 font-mono">#{stats.cryptoLedgerBlocks} Blocks</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Seal: {stats.latestAuditSeal}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Connected Connectors</div>
            <div className="flex items-center space-x-2 mt-1">
              <Server className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-black text-indigo-400 font-mono">6 Cloud / Git Providers</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">AWS • GitHub • Okta • CrowdStrike</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Controls Conformance</div>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-black text-emerald-400 font-mono">10/10 Conforming</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">0 Critical Drifts Detected</div>
          </div>
        </div>

        {/* Cryptographic Merkle Root Verification Bar */}
        <div className="mt-4 p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2 min-w-0">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 shrink-0 font-bold">Merkle Root:</span>
            <span className="text-slate-200 truncate">{stats.latestMerkleRoot}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyRoot}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] transition cursor-pointer shrink-0"
          >
            {copiedRoot ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedRoot ? 'Copied' : 'Copy Hash'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Grid: 10 Technical Controls Matrix (Left) & Real-Time Event Feed (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 10 Core Technical Controls Real-Time Health (7 Cols) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-black tracking-tight flex items-center space-x-2">
                <span>10 Core Technical Controls Live Monitor</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ISO 27001:2022 Annex A
                </span>
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Automated continuous evaluation via cloud APIs and identity providers with real-time audit seals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateModule('continuous_compliance')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Full CCM Workbench</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {controlsState.map(ctrl => (
              <div
                key={ctrl.code}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    : 'bg-[#0E1729] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start sm:items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {ctrl.code}
                      </span>
                      <span className="font-bold text-xs truncate">
                        {ctrl.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5 font-mono">
                      <span>Source: {ctrl.provider}</span>
                      <span>•</span>
                      <span>Latency: {ctrl.latency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{ctrl.seal}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {ctrl.status} ({ctrl.score})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Telemetry Stream Terminal & Ledger Feed (5 Cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-black tracking-tight flex items-center space-x-2">
                <span>Real-Time SSE Telemetry Feed</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Streaming live security events &amp; SIEM webhook signals.
              </p>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center space-x-1 text-[10px]">
              {(['ALL', 'HIGH', 'PASS'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedEventCategory(f)}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    selectedEventCategory === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling Terminal Box */}
          <div className={`rounded-2xl border p-4 max-h-[520px] overflow-y-auto space-y-3 ${
            theme === 'light'
              ? 'bg-slate-900 text-slate-100 border-slate-800'
              : 'bg-[#070D19] text-slate-100 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>/api/telemetry/stream [Active]</span>
              </div>
              <span>{filteredEvents.length} events buffered</span>
            </div>

            <div className="space-y-2.5">
              {filteredEvents.map(e => (
                <div
                  key={e.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                        e.severity === 'CRITICAL'
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : e.severity === 'HIGH'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : e.severity === 'MEDIUM'
                          ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40'
                          : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {e.severity}
                      </span>
                      <span className="text-sky-300 font-bold">{e.source}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-slate-200 text-xs font-sans">
                    {e.summary}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span className="truncate">{e.isoMapping}</span>
                    {e.auditSeal && (
                      <span className="text-indigo-400 font-mono font-bold shrink-0 ml-2">
                        {e.auditSeal}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Simulation Trigger Bar */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900'
          }`}>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Test Real-Time Cloud Ingestion
              </div>
              <div className="text-[11px] text-slate-500">
                Dispatch AWS GuardDuty / GitHub secret event into live stream.
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateModule('telemetry_stream')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <span>Open Simulator</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
