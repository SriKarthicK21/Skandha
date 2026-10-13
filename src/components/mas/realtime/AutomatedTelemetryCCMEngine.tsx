import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  Server,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Terminal,
  Clock,
  ArrowRight,
  ExternalLink,
  Flame,
  Check,
  FileCheck,
  Play,
  RotateCcw,
  Sparkles,
  Database
} from 'lucide-react';

export interface TelemetryFeed {
  id: string;
  source: 'OKTA_IAM' | 'AZURE_AD' | 'CYBERARK_PAM' | 'QUALYS_VMDR' | 'TENABLE_IO' | 'AWS_GUARDDUTY' | 'HASHICORP_VAULT';
  name: string;
  category: 'IDENTITY_MFA' | 'VULNERABILITY' | 'INFRA_DRIFT' | 'PRIVILEGE_ACCESS';
  status: 'ACTIVE_STREAMING' | 'SYNCED' | 'DRIFT_DETECTED';
  masNoticeRef: string;
  lastHeartbeat: string;
  eventsIngestedToday: number;
  healthScore: number;
}

export interface LiveTelemetryEvent {
  id: string;
  timestamp: string;
  feedSource: string;
  eventType: string;
  actor: string;
  targetAsset: string;
  complianceVerdict: 'COMPLIANT' | 'DRIFT_ALERT' | 'HIGH_RISK_BREACH';
  details: string;
  masControlRef: string;
  remediationAction?: string;
}

export interface CCMDriftRule {
  id: string;
  controlCode: string;
  controlTitle: string;
  domainName: string;
  condition: string;
  currentStatus: 'COMPLIANT' | 'DRIFT_ACTIVE' | 'AUTO_REMEDIATING';
  lastEvaluated: string;
  monitoredAssetsCount: number;
  autoRemediationWebhook: string;
}

export const AutomatedTelemetryCCMEngine: React.FC<{
  onDriftDetected?: (controlCode: string, driftReason: string) => void;
  onNavigateToRequirement?: (controlCode: string) => void;
}> = ({ onDriftDetected, onNavigateToRequirement }) => {
  // Live Telemetry Feeds
  const [feeds, setFeeds] = useState<TelemetryFeed[]>([
    {
      id: 'FEED-OKTA',
      source: 'OKTA_IAM',
      name: 'Okta Enterprise Identity & Adaptive MFA',
      category: 'IDENTITY_MFA',
      status: 'ACTIVE_STREAMING',
      masNoticeRef: 'Notice 655 §4.1 (MFA Enforceability)',
      lastHeartbeat: '2 seconds ago',
      eventsIngestedToday: 14280,
      healthScore: 100
    },
    {
      id: 'FEED-CYBERARK',
      source: 'CYBERARK_PAM',
      name: 'CyberArk Privileged Access Manager (PAM)',
      category: 'PRIVILEGE_ACCESS',
      status: 'ACTIVE_STREAMING',
      masNoticeRef: 'Notice 655 §4.2 (Privileged Access Isolation)',
      lastHeartbeat: '5 seconds ago',
      eventsIngestedToday: 3890,
      healthScore: 99
    },
    {
      id: 'FEED-QUALYS',
      source: 'QUALYS_VMDR',
      name: 'Qualys Continuous VMDR & Patch Management',
      category: 'VULNERABILITY',
      status: 'ACTIVE_STREAMING',
      masNoticeRef: 'Notice 655 §6.1 (14-Day Critical MTTR)',
      lastHeartbeat: '18 seconds ago',
      eventsIngestedToday: 8420,
      healthScore: 98
    },
    {
      id: 'FEED-GUARDDUTY',
      source: 'AWS_GUARDDUTY',
      name: 'AWS CloudTrail & GuardDuty Security Hub',
      category: 'INFRA_DRIFT',
      status: 'ACTIVE_STREAMING',
      masNoticeRef: 'TRM Guidelines §11.2 (Cryptographic Storage)',
      lastHeartbeat: '3 seconds ago',
      eventsIngestedToday: 51200,
      healthScore: 100
    }
  ]);

  // Live Telemetry Events Stream
  const [events, setEvents] = useState<LiveTelemetryEvent[]>([
    {
      id: 'EVT-9041',
      timestamp: 'Just now (10:14:02 UTC)',
      feedSource: 'Okta Enterprise IAM',
      eventType: 'FIDO2_HARDWARE_TOKEN_AUTH',
      actor: 'admin.tan@dbs.bank.sg',
      targetAsset: 'Core Banking Production Bastion SG1',
      complianceVerdict: 'COMPLIANT',
      details: 'Hardware security key biometric challenge passed. MFA enforced per Notice 655 §4.',
      masControlRef: 'MAS-AM-02'
    },
    {
      id: 'EVT-9040',
      timestamp: '1 min ago (10:13:14 UTC)',
      feedSource: 'Qualys VMDR',
      eventType: 'CRITICAL_CVE_PATCH_VERIFIED',
      actor: 'Automated Ansible Remediation Bot',
      targetAsset: 'Payment Gateway Switch Linux Svr 04',
      complianceVerdict: 'COMPLIANT',
      details: 'CVE-2026-2184 (CVSS 9.8) remediated within 4 days (well within MAS 14-day limit). MTTR: 96 hrs.',
      masControlRef: 'MAS-VM-01'
    },
    {
      id: 'EVT-9039',
      timestamp: '3 mins ago (10:11:45 UTC)',
      feedSource: 'CyberArk PAM',
      eventType: 'BREAK_GLASS_SESSION_MONITORED',
      actor: 'devops.lim@dbs.bank.sg',
      targetAsset: 'MEPS+ Payment Settlement Database',
      complianceVerdict: 'COMPLIANT',
      details: 'Dual-custody authorization verified by CISO. Keystroke logging active & video session sealed.',
      masControlRef: 'MAS-AM-03'
    }
  ]);

  // Continuous Control Monitoring Drift Rules
  const [driftRules, setDriftRules] = useState<CCMDriftRule[]>([
    {
      id: 'RULE-01',
      controlCode: 'MAS-AM-02',
      controlTitle: 'Multi-Factor Authentication (MFA) on Administrative Logins',
      domainName: 'Domain 10: Access Control & IAM',
      condition: 'Flag DEFICIENT if any administrative session bypasses hardware/FIDO2 MFA token.',
      currentStatus: 'COMPLIANT',
      lastEvaluated: 'Just now',
      monitoredAssetsCount: 248,
      autoRemediationWebhook: 'https://security.bank.sg/api/remediation/enforce-mfa-session'
    },
    {
      id: 'RULE-02',
      controlCode: 'MAS-VM-01',
      controlTitle: 'Vulnerability Remediation & Critical Patch MTTR (<14 Days)',
      domainName: 'Domain 12: Cyber Incident & Vulnerability Mgmt',
      condition: 'Flag DEFICIENT if any unpatched Critical CVE exceeds 14 calendar days from release.',
      currentStatus: 'COMPLIANT',
      lastEvaluated: '10 mins ago',
      monitoredAssetsCount: 1420,
      autoRemediationWebhook: 'https://security.bank.sg/api/remediation/trigger-patch-cycle'
    },
    {
      id: 'RULE-03',
      controlCode: 'MAS-DS-01',
      controlTitle: 'Storage Bucket Cryptographic Encryption & Public Isolation',
      domainName: 'Domain 11: Cryptography & Key Management',
      condition: 'Flag DEFICIENT if any cloud storage bucket permits public ACLs or lacks AES-256-GCM encryption.',
      currentStatus: 'COMPLIANT',
      lastEvaluated: '2 mins ago',
      monitoredAssetsCount: 86,
      autoRemediationWebhook: 'https://security.bank.sg/api/remediation/isolate-s3-bucket'
    },
    {
      id: 'RULE-04',
      controlCode: 'MAS-NW-02',
      controlTitle: 'Production Demilitarized Zone (DMZ) Network Segmentation',
      domainName: 'Domain 09: Network Security',
      condition: 'Flag DEFICIENT if any inbound Security Group rule exposes SSH/RDP (ports 22/3389) to 0.0.0.0/0.',
      currentStatus: 'COMPLIANT',
      lastEvaluated: 'Just now',
      monitoredAssetsCount: 412,
      autoRemediationWebhook: 'https://security.bank.sg/api/remediation/revoke-open-security-groups'
    }
  ]);

  const [isSimulatingDrift, setIsSimulatingDrift] = useState<boolean>(false);
  const [driftSimulationActive, setDriftSimulationActive] = useState<boolean>(false);

  // Vulnerability MTTR Metrics
  const patchMetrics = {
    criticalMttrDays: 5.8,
    masCriticalThresholdDays: 14,
    highMttrDays: 18.2,
    masHighThresholdDays: 30,
    openCriticalVulnerabilities: driftSimulationActive ? 1 : 0,
    openHighVulnerabilities: 3,
    totalScannedAssets: 1860,
    lastFullScanDate: 'Today, 08:30 SGT'
  };

  // Simulate an immediate live drift event
  const handleTriggerSimulatedDrift = () => {
    setIsSimulatingDrift(true);
    setTimeout(() => {
      setDriftSimulationActive(true);
      setIsSimulatingDrift(false);

      // Mutate the Cloud Storage rule to DRIFT_ACTIVE
      setDriftRules((prev) =>
        prev.map((r) =>
          r.controlCode === 'MAS-DS-01'
            ? { ...r, currentStatus: 'DRIFT_ACTIVE', lastEvaluated: 'Just now (Drift Flagged)' }
            : r
        )
      );

      // Ingest live drift event into stream
      const newEvent: LiveTelemetryEvent = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now (LIVE DRIFT)',
        feedSource: 'AWS GuardDuty / CloudTrail',
        eventType: 'S3_BUCKET_PUBLIC_ACCESS_DRIFT',
        actor: 'dev.contractor@vendor.io',
        targetAsset: 's3://dbs-analytics-customer-vault-sg1',
        complianceVerdict: 'DRIFT_ALERT',
        details: 'CloudTrail captured unapproved modification modifying bucket policy to Public Read. Control MAS-DS-01 flipped to DEFICIENT.',
        masControlRef: 'MAS-DS-01',
        remediationAction: 'Auto-Remediation Webhook Dispatched: Revoking public ACL & sealing bucket.'
      };

      setEvents((prev) => [newEvent, ...prev]);

      if (onDriftDetected) {
        onDriftDetected('MAS-DS-01', 'Cloud Storage Public Bucket Exposure detected via AWS CloudTrail stream.');
      }
    }, 800);
  };

  // Trigger automated remediation
  const handleAutoRemediateDrift = () => {
    setDriftRules((prev) =>
      prev.map((r) =>
        r.controlCode === 'MAS-DS-01'
          ? { ...r, currentStatus: 'AUTO_REMEDIATING', lastEvaluated: 'Remediating...' }
          : r
      )
    );

    setTimeout(() => {
      setDriftSimulationActive(false);
      setDriftRules((prev) =>
        prev.map((r) =>
          r.controlCode === 'MAS-DS-01'
            ? { ...r, currentStatus: 'COMPLIANT', lastEvaluated: 'Just now (Remediated)' }
            : r
        )
      );

      const resolvedEvent: LiveTelemetryEvent = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now (RESOLVED)',
        feedSource: 'CCM Automated Orchestrator',
        eventType: 'AUTOMATED_REMEDIATION_EXECUTED',
        actor: 'Security Automator Service Principal',
        targetAsset: 's3://dbs-analytics-customer-vault-sg1',
        complianceVerdict: 'COMPLIANT',
        details: 'Bucket ACL successfully revoked to Private. AES-256 KMS Key enforced. Control MAS-DS-01 re-certified COMPLIANT.',
        masControlRef: 'MAS-DS-01'
      };

      setEvents((prev) => [resolvedEvent, ...prev]);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Supervisory Mandate Context */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                MAS TRM §3.1 & NOTICE 655 TELEMETRY ENGINE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Zero-Touch Continuous Evidence
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">
                4 Active Connectors &bull; 77,790 Events/Day
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Continuous Control Monitoring (CCM) & Live Telemetry Stream</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Eliminates point-in-time auditor attestations. Streams real-time authorization, vulnerability scanning, and infrastructure telemetry directly from Okta, CyberArk, Qualys, and AWS to verify continuous operating effectiveness under MAS Notice 655.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!driftSimulationActive ? (
              <button
                type="button"
                onClick={handleTriggerSimulatedDrift}
                disabled={isSimulatingDrift}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
              >
                <Flame className={`w-4 h-4 ${isSimulatingDrift ? 'animate-spin' : 'text-amber-300'}`} />
                <span>{isSimulatingDrift ? 'Simulating...' : 'Simulate Live Drift Event'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAutoRemediateDrift}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-emerald-200 animate-spin" />
                <span>Execute Auto-Remediation Webhook</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Connected Telemetry Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {feed.source}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10.5px] font-semibold text-emerald-400">Live Stream</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white truncate">{feed.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{feed.masNoticeRef}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-semibold">Events / Day</span>
                <span className="font-mono font-bold text-white text-sm">
                  {feed.eventsIngestedToday.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase block font-semibold">Heartbeat</span>
                <span className="font-mono text-cyan-300 text-xs">{feed.lastHeartbeat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notice 655 §6: Patch Management MTTR Gauge & Vulnerability Lifecycle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>MAS Notice 655 Section 6: Patch Lifecycle & Critical MTTR Metrics</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforcing statutory limit: Critical vulnerabilities affecting internet-facing & critical systems must be remediated in ≤ 14 calendar days.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
            MTTR Compliant: {patchMetrics.criticalMttrDays} Days (Limit: 14 Days)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gauge 1: Critical MTTR */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-rose-400 block tracking-wider">
              Critical CVE MTTR
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {patchMetrics.criticalMttrDays}
              </span>
              <span className="text-xs text-slate-400">days / patch</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(patchMetrics.criticalMttrDays / patchMetrics.masCriticalThresholdDays) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              MAS Limit: ≤ {patchMetrics.masCriticalThresholdDays} days (Buffer: +{(patchMetrics.masCriticalThresholdDays - patchMetrics.criticalMttrDays).toFixed(1)} days)
            </span>
          </div>

          {/* Gauge 2: High MTTR */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-amber-400 block tracking-wider">
              High Severity MTTR
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-300">
                {patchMetrics.highMttrDays}
              </span>
              <span className="text-xs text-slate-400">days / patch</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${(patchMetrics.highMttrDays / patchMetrics.masHighThresholdDays) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Internal SLA: ≤ {patchMetrics.masHighThresholdDays} days
            </span>
          </div>

          {/* Gauge 3: Active Critical CVEs */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            patchMetrics.openCriticalVulnerabilities > 0
              ? 'bg-rose-950/30 border-rose-500/50'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <span className="text-[10.5px] uppercase font-bold text-slate-400 block tracking-wider">
              Open Critical CVEs
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${
                patchMetrics.openCriticalVulnerabilities > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}>
                {patchMetrics.openCriticalVulnerabilities}
              </span>
              <span className="text-xs text-slate-400">in scope</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {patchMetrics.openCriticalVulnerabilities > 0
                ? 'Immediate remediation ticket active!'
                : '100% of production critical systems clear'}
            </span>
          </div>

          {/* Gauge 4: Total Scanned Assets */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-cyan-400 block tracking-wider">
              Scanned Endpoints
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-300">
                {patchMetrics.totalScannedAssets.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">assets</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Daily telemetry cadence: {patchMetrics.lastFullScanDate}
            </span>
          </div>
        </div>
      </div>

      {/* Continuous Control Monitoring (CCM) Real-Time Drift Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Continuous Control Monitoring (CCM) Evaluation Rules</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated drift evaluation rules that immediately flip control posture if an unauthorized change or vulnerability occurs.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {driftRules.filter((r) => r.currentStatus === 'COMPLIANT').length} / {driftRules.length} Rules Compliant
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[10.5px] uppercase font-semibold tracking-wider text-slate-400">
                <th className="py-3 px-4">Control & Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Continuous Assertion Condition</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Monitored Assets</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {driftRules.map((rule) => (
                <tr
                  key={rule.id}
                  className={`transition-colors ${
                    rule.currentStatus === 'DRIFT_ACTIVE'
                      ? 'bg-rose-950/30 hover:bg-rose-950/40'
                      : 'hover:bg-slate-950/50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                        {rule.controlCode}
                      </span>
                      <span className="font-bold text-white">{rule.controlTitle}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{rule.domainName}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-md text-[11px] leading-relaxed">
                    {rule.condition}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        rule.currentStatus === 'COMPLIANT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : rule.currentStatus === 'DRIFT_ACTIVE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {rule.currentStatus === 'COMPLIANT' && <Check className="w-3 h-3 text-emerald-400" />}
                      {rule.currentStatus === 'DRIFT_ACTIVE' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      {rule.currentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">
                    {rule.monitoredAssetsCount} items
                  </td>
                  <td className="py-3 px-4 text-right">
                    {onNavigateToRequirement && (
                      <button
                        type="button"
                        onClick={() => onNavigateToRequirement(rule.controlCode)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Telemetry Event Log Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Live Ingested Telemetry Feed (Real-Time Terminal)</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Auto-refreshed via SSE Stream</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs max-h-72 overflow-y-auto pr-1">
          {events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2 transition-all ${
                evt.complianceVerdict === 'DRIFT_ALERT'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  : 'bg-slate-950/80 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="text-cyan-400 font-bold">{evt.timestamp}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-amber-300">{evt.feedSource}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 border border-slate-700">
                    {evt.masControlRef}
                  </span>
                  <span className="text-white font-semibold">[{evt.eventType}]</span>
                </div>
                <p className="text-xs font-sans text-slate-200">{evt.details}</p>
                {evt.remediationAction && (
                  <p className="text-[11px] font-sans text-amber-300/90 font-medium">
                    &rarr; {evt.remediationAction}
                  </p>
                )}
              </div>

              <div className="shrink-0 self-start md:self-auto">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    evt.complianceVerdict === 'COMPLIANT'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                  }`}
                >
                  {evt.complianceVerdict}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
