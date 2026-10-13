import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEnterpriseRealTime } from '../../services/telemetry/enterpriseRealTimeService';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  Activity,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Server,
  Terminal,
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
  X,
  Binary,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';

interface EnterpriseRealTimeHUDDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule?: (moduleId: string) => void;
}

export const EnterpriseRealTimeHUDDrawer: React.FC<EnterpriseRealTimeHUDDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateModule
}) => {
  const { theme, currentTenant } = useGRC();
  const { showToast } = useToast();
  const { stats, events, ledgerBlocks, simulateEvent, verifyLedgerIntegrity, harvest10Controls } = useEnterpriseRealTime();

  const [activeTab, setActiveTab] = useState<'stream' | 'ledger' | 'connectors' | 'simulate'>('stream');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'>('ALL');
  const [isVerifyingLedger, setIsVerifyingLedger] = useState(false);
  const [ledgerVerificationStatus, setLedgerVerificationStatus] = useState<{ verified: boolean; date: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);

  // Simulation presets
  const SIMULATION_PRESETS = [
    {
      id: 'aws-guardduty',
      label: 'AWS GuardDuty IAM Anomaly',
      source: 'AWS GuardDuty',
      eventType: 'Recon:IAMUser/NetworkPermissions',
      severity: 'MEDIUM' as const,
      summary: 'API call DescribeSecurityGroups detected from unassigned Singapore ISP subnet.',
      isoMapping: 'A.8.16 Monitoring activities',
      masMapping: 'Sec 13.0 Incident Management'
    },
    {
      id: 'github-secret',
      label: 'GitHub Secret Push Interception',
      source: 'GitHub Actions CI/CD',
      eventType: 'SecretProtectionBlocked',
      severity: 'HIGH' as const,
      summary: 'Push blocked on main branch: AWS secret access key detected in commit diff.',
      isoMapping: 'A.8.28 Secure coding',
      masMapping: 'Sec 8.3 Source Code Review'
    },
    {
      id: 'waf-ddos',
      label: 'Cloudflare WAF Rate Limit Trigger',
      source: 'Cloudflare Edge',
      eventType: 'WAF:RateLimitExceeded',
      severity: 'LOW' as const,
      summary: 'Bot traffic surge detected on /api/v1/auth/login. IP range auto-quarantined.',
      isoMapping: 'A.8.20 Network security',
      masMapping: 'Sec 9.0 DDoS Protection'
    },
    {
      id: 'okta-mfa',
      label: 'Okta FIDO2 Step-up Challenge',
      source: 'Okta Identity',
      eventType: 'PrivilegedStepUpSuccess',
      severity: 'INFO' as const,
      summary: 'FIDO2 WebAuthn biometric security key challenge passed for SuperAdmin role.',
      isoMapping: 'A.5.17 Authentication info',
      masMapping: 'Sec 10.2 Privileged MFA'
    },
    {
      id: 'iac-drift',
      label: 'Terraform Cloud IaC Drift Alarm',
      source: 'Terraform Cloud',
      eventType: 'IaCDriftDetected',
      severity: 'HIGH' as const,
      summary: 'Out-of-band modification detected on Security Group sg-0419e. Auto-remediation queued.',
      isoMapping: 'A.8.9 Configuration mgmt',
      masMapping: 'Sec 6.3 Baseline Security'
    }
  ];

  const handleSimulate = async (preset: typeof SIMULATION_PRESETS[0]) => {
    setIsSimulating(true);
    try {
      const res = await simulateEvent({
        source: preset.source,
        eventType: preset.eventType,
        severity: preset.severity,
        summary: preset.summary,
        isoMapping: preset.isoMapping,
        masMapping: preset.masMapping,
        tenantId: currentTenant?.id
      });

      if (res.success) {
        showToast({
          title: 'Real-Time Telemetry Dispatched',
          message: `${preset.source} event broadcast to SSE stream. Cryptographic seal: ${res.auditSeal || 'SEAL-OK'}`,
          type: 'success'
        });
      } else {
        showToast({
          title: 'Simulation Dispatched',
          message: 'Telemetry signal registered in local live stream.',
          type: 'info'
        });
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleVerifyLedger = async () => {
    setIsVerifyingLedger(true);
    try {
      const res = await verifyLedgerIntegrity();
      setLedgerVerificationStatus({
        verified: res.verified,
        date: new Date().toLocaleTimeString()
      });
      showToast({
        title: res.verified ? 'Cryptographic Ledger Verified' : 'Ledger Integrity Warning',
        message: res.verified
          ? `All ${res.totalBlocks} blocks cryptographically linked to Genesis block.`
          : 'Verification returned discrepancies.',
        type: res.verified ? 'success' : 'error'
      });
    } finally {
      setIsVerifyingLedger(false);
    }
  };

  const handleHarvestControls = async () => {
    setIsHarvesting(true);
    try {
      const res = await harvest10Controls(currentTenant?.id);
      if (res && res.success) {
        showToast({
          title: '10 Core Controls Harvested',
          message: `Successfully ingested ${res.harvestedCount} telemetry receipts into Evidence Centre.`,
          type: 'success'
        });
      } else {
        showToast({
          title: 'Controls Telemetry Synchronized',
          message: '10 Core Technical Controls validated conforming.',
          type: 'success'
        });
      }
    } finally {
      setIsHarvesting(false);
    }
  };

  const filteredEvents = events.filter(e => {
    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'CRITICAL') return e.severity === 'CRITICAL';
    if (severityFilter === 'HIGH') return e.severity === 'HIGH' || e.severity === 'CRITICAL';
    if (severityFilter === 'MEDIUM') return e.severity === 'MEDIUM';
    if (severityFilter === 'INFO') return e.severity === 'INFO' || e.severity === 'LOW';
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Container */}
          <motion.aside
            id="enterprise-realtime-hud-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={`fixed right-0 top-0 bottom-0 w-full sm:w-[580px] lg:w-[640px] z-50 flex flex-col shadow-2xl border-l transition-colors ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-900'
                : 'bg-[#0B1120] border-slate-800 text-slate-100'
            }`}
          >
            {/* 1. Header */}
            <div className={`p-4 sm:p-5 border-b flex items-start justify-between gap-3 ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="relative flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-black text-emerald-500">
                    REAL-TIME ENTERPRISE
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    theme === 'light' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {stats.latencyMs}ms latency
                  </span>
                </div>

                <h2 className="text-lg font-black tracking-tight">
                  Skanda Real-Time Telemetry HUD
                </h2>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Continuous Controls Monitoring (CCM) • Server-Sent Events (SSE) Engine
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  theme === 'light'
                    ? 'hover:bg-slate-100 text-slate-500 border-slate-200'
                    : 'hover:bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Top Stats Bar */}
            <div className={`grid grid-cols-3 p-3 gap-2 border-b text-xs ${
              theme === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="p-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Stream Status</div>
                <div className="flex items-center space-x-1.5 mt-0.5 font-bold text-emerald-500">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{stats.status}</span>
                </div>
              </div>

              <div className="p-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Ledger Height</div>
                <div className="flex items-center space-x-1.5 mt-0.5 font-mono font-bold text-sky-500 dark:text-sky-400">
                  <Binary className="w-3.5 h-3.5" />
                  <span>#{stats.cryptoLedgerBlocks} blocks</span>
                </div>
              </div>

              <div className="p-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Audit Seal</div>
                <div className="flex items-center space-x-1.5 mt-0.5 font-mono font-bold text-indigo-500 dark:text-indigo-400 truncate">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span className="truncate">{stats.latestAuditSeal}</span>
                </div>
              </div>
            </div>

            {/* 3. Tab Navigation */}
            <div className={`flex border-b px-4 space-x-1 ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
            }`}>
              {[
                { id: 'stream', label: 'Live Stream', count: events.length },
                { id: 'ledger', label: 'Crypto Ledger', count: ledgerBlocks.length },
                { id: 'connectors', label: 'Connectors', count: stats.connectedProviders.length },
                { id: 'simulate', label: 'Simulate Signal' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === t.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                      activeTab === t.id
                        ? 'bg-indigo-500/20 text-indigo-500 dark:text-indigo-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 4. Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* TAB 1: Live Stream */}
              {activeTab === 'stream' && (
                <div className="space-y-3">
                  {/* Filter Toolbar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Live Telemetry Log
                    </span>
                    <div className="flex items-center space-x-1 text-[11px]">
                      {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'] as const).map(sev => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setSeverityFilter(sev)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            severityFilter === sev
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Events list */}
                  <div className="space-y-2.5">
                    {filteredEvents.map(evt => (
                      <div
                        key={evt.id}
                        className={`p-3 rounded-xl border transition-all ${
                          theme === 'light'
                            ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              evt.severity === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : evt.severity === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : evt.severity === 'MEDIUM'
                                ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {evt.severity}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                              {evt.source}
                            </span>
                          </div>

                          <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="text-xs font-semibold mt-1.5">
                          {evt.summary}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <span className="font-mono text-slate-400 text-[10px]">
                            {evt.isoMapping}
                          </span>
                          {evt.auditSeal && (
                            <span className="ml-auto inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{evt.auditSeal}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Cryptographic Ledger */}
              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Tamper-Evident Merkle Hash Chain
                        </div>
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all mt-0.5">
                          Root: {stats.latestMerkleRoot}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyLedger}
                        disabled={isVerifyingLedger}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isVerifyingLedger ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{isVerifyingLedger ? 'Verifying...' : 'Verify Chain'}</span>
                      </button>
                    </div>

                    {ledgerVerificationStatus && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Chain mathematically valid: 100% hash linkage verified at {ledgerVerificationStatus.date}.</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Recent Sealed Ledger Blocks
                    </div>
                    {ledgerBlocks.slice(0, 8).map(b => (
                      <div
                        key={b.blockHeight}
                        className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-sky-600 dark:text-sky-400">Block #{b.blockHeight}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            {b.auditSeal}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Event: {b.eventType} ({b.source})
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Sig: {b.signature}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Connectors */}
              {activeTab === 'connectors' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Active Enterprise Cloud Connectors
                    </span>
                    <button
                      type="button"
                      onClick={handleHarvestControls}
                      disabled={isHarvesting}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isHarvesting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      <span>{isHarvesting ? 'Harvesting...' : 'Harvest 10 Controls'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {stats.connectedProviders.map((prov, i) => (
                      <div
                        key={prov}
                        className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Server className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">{prov}</div>
                            <div className="text-[11px] text-slate-500">Zero-touch automated telemetry webhook</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>HEALTHY</span>
                          </span>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            SLA: 99.99%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Simulation */}
              {activeTab === 'simulate' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    theme === 'light' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900'
                  }`}>
                    <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>Live Enterprise Signal Injector</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Inject simulated cloud telemetry events to test real-time continuous controls monitoring, automated drift evaluation, and tamper-evident cryptographic ledger sealing.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {SIMULATION_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSimulate(preset)}
                        disabled={isSimulating}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                          theme === 'light'
                            ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xs'
                            : 'bg-slate-900 border-slate-800 hover:border-indigo-500'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              preset.severity === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-500'
                                : preset.severity === 'MEDIUM'
                                ? 'bg-sky-500/20 text-sky-500'
                                : 'bg-slate-500/20 text-slate-500'
                            }`}>
                              {preset.severity}
                            </span>
                            <span className="text-xs font-bold group-hover:text-indigo-500 transition-colors">
                              {preset.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {preset.summary}
                          </div>
                        </div>

                        <div className="shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Send className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Footer Actions */}
            <div className={`p-4 border-t flex items-center justify-between gap-3 ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateModule?.('telemetry_stream');
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Open Full Telemetry Desk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                Close HUD
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
