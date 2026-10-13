import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Radio,
  Wifi,
  Database,
  Lock,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart3,
  Flame,
  Zap,
  Server,
  HeartPulse,
  Share2,
  Gauge,
  Info,
  AlertOctagon,
  Bell,
  BellOff
} from 'lucide-react';
import { RegionalNetworkNode } from './NetworkHealthHeatmap';
import { ThreatDetectionEvent, getRegionThreatSummary } from './ThreatDetectionTimeline';
import { PredictiveAnomalyScoreWidget } from './PredictiveAnomalyScoreWidget';
import { NetworkStabilitySparklineGraph } from './NetworkStabilitySparklineGraph';

export type AuditLogSeverity = 'Critical' | 'Warning' | 'Info';

export interface RegionalAuditLogEntry {
  id: string;
  timestamp: string;
  displayTime: string;
  eventType:
    | 'TLS_REKEY'
    | 'SENSORS_SYNC'
    | 'WORM_SEAL_VERIFIED'
    | 'BGP_HEALTH_CHECK'
    | 'ACCESS_AUDIT'
    | 'COMPLIANCE_ATTESTATION'
    | 'EGRESS_FIREWALL_BLOCK'
    | 'ROUTE_DAMPENING_ALERT';
  severity: AuditLogSeverity;
  summary: string;
  actorOrSystem: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
  wormHashSnippet: string;
  jurisdictionTag: string;
}

export interface ConnectivityDetailCardProps {
  node: RegionalNetworkNode;
  originPos: { x: number; y: number }; // Relative percentage or coordinates on viewport
  threatEvents: ThreatDetectionEvent[];
  onClose: () => void;
  onSelectSensor?: (sensorName: string) => void;
  onOpenThreatTimeline?: () => void;
}

/**
 * Deterministic real-time audit log generation based on regional node
 */
export const getRegionalAuditLogs = (node: RegionalNetworkNode): RegionalAuditLogEntry[] => {
  const isDegraded = node.status === 'DEGRADED';
  const isFair = node.status === 'FAIR';

  return [
    {
      id: `audit-${node.id}-01`,
      timestamp: '2026-09-20T00:14:22Z',
      displayTime: '00:14:22 UTC',
      eventType: 'WORM_SEAL_VERIFIED',
      severity: 'Info',
      summary: `Hardware Ledger Root Seal verified (${node.auditSeal}) with zero drift across 4 sovereign nodes.`,
      actorOrSystem: 'Skanda Consensus Engine v4.2',
      status: 'SUCCESS',
      wormHashSnippet: '0x9a8f...3e1d',
      jurisdictionTag: node.sovereignJurisdiction.split('•')[0].trim()
    },
    {
      id: `audit-${node.id}-02`,
      timestamp: '2026-09-20T00:11:05Z',
      displayTime: '00:11:05 UTC',
      eventType: isDegraded ? 'ROUTE_DAMPENING_ALERT' : 'EGRESS_FIREWALL_BLOCK',
      severity: isDegraded ? 'Critical' : 'Warning',
      summary: isDegraded
        ? `BGP Peering route flutter exceeded maximum threshold (>18 flaps/min). Emergency route dampening engaged.`
        : `Ingress firewall dropped 24 anomalous probe packets originating from unlisted transit Autonomous System.`,
      actorOrSystem: isDegraded ? 'Autonomous Edge BGP Guard' : 'Perimeter Ingress Firewall',
      status: isDegraded ? 'ALERT' : 'WARNING',
      wormHashSnippet: '0x3d41...7a9c',
      jurisdictionTag: node.sovereignJurisdiction.split('•')[0].trim()
    },
    {
      id: `audit-${node.id}-03`,
      timestamp: '2026-09-20T00:08:40Z',
      displayTime: '00:08:40 UTC',
      eventType: 'BGP_HEALTH_CHECK',
      severity: isDegraded ? 'Critical' : isFair ? 'Warning' : 'Info',
      summary: isDegraded
        ? `BGP Peering AS-Path deviation detected. Ingress traffic rerouted through secondary edge tunnel.`
        : isFair
        ? `BGP prefix announcement latency jitter (+12ms divergence against baseline carrier SLA) observed.`
        : `BGP Autonomous Peering route paths fully converged with nominal latency tolerances.`,
      actorOrSystem: 'Edge BGP Anomaly Watcher',
      status: isDegraded ? 'ALERT' : isFair ? 'WARNING' : 'SUCCESS',
      wormHashSnippet: '0x7e34...99f0',
      jurisdictionTag: node.sovereignJurisdiction.split('•')[0].trim()
    },
    {
      id: `audit-${node.id}-04`,
      timestamp: '2026-09-20T00:03:18Z',
      displayTime: '00:03:18 UTC',
      eventType: 'TLS_REKEY',
      severity: 'Info',
      summary: `Automated Post-Quantum TLS 1.3 session re-keying completed for edge ingress gateway.`,
      actorOrSystem: 'Cloud PKI Automated Lease Daemon',
      status: 'SUCCESS',
      wormHashSnippet: '0x2c71...b84a',
      jurisdictionTag: 'RFC 8446 In-Transit'
    },
    {
      id: `audit-${node.id}-05`,
      timestamp: '2026-09-19T23:59:12Z',
      displayTime: '23:59:12 UTC',
      eventType: 'COMPLIANCE_ATTESTATION',
      severity: 'Info',
      summary: `Regional cryptographic posture attested against ${node.sovereignJurisdiction}.`,
      actorOrSystem: 'Automated Continuous Compliance Auditor',
      status: 'SUCCESS',
      wormHashSnippet: '0xfa89...11c2',
      jurisdictionTag: 'Continuous SOC 2'
    },
    {
      id: `audit-${node.id}-06`,
      timestamp: '2026-09-19T23:45:00Z',
      displayTime: '23:45:00 UTC',
      eventType: 'ACCESS_AUDIT',
      severity: 'Info',
      summary: `Zero-Trust Bastion access validation for Cloud Provider Edge node (${node.cloudProvider}).`,
      actorOrSystem: 'IAM Security Principal Gateway',
      status: 'SUCCESS',
      wormHashSnippet: '0x55aa...df37',
      jurisdictionTag: 'Least-Privilege RBAC'
    }
  ];
};

export const ConnectivityDetailCard: React.FC<ConnectivityDetailCardProps> = ({
  node,
  originPos,
  threatEvents,
  onClose,
  onSelectSensor,
  onOpenThreatTimeline
}) => {
  const [activeTab, setActiveTab] = useState<'traffic' | 'stability' | 'anomaly' | 'audit' | 'threats'>('traffic');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Simulated live fluctuating throughput metrics for real-time visualization
  const [liveThroughput, setLiveThroughput] = useState(node.throughputPktsMin);
  const [liveBandwidth, setLiveBandwidth] = useState(node.throughputBandwidthMbps);
  const [liveLatency, setLiveLatency] = useState(node.latencyMs);

  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      const deltaThroughput = Math.floor((Math.random() - 0.48) * 8);
      const deltaLatency = Math.floor((Math.random() - 0.5) * 3);
      setLiveThroughput(prev => Math.max(12, prev + deltaThroughput));
      setLiveBandwidth(prev => +(Math.max(2.5, prev + (deltaThroughput * 0.15)).toFixed(1)));
      setLiveLatency(prev => Math.max(8, prev + deltaLatency));
    }, 2000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'ALL' | AuditLogSeverity>('ALL');

  // Mute Alerts fatigue reduction state (per selected region)
  const [isAlertsMuted, setIsAlertsMuted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(`mute_alerts_${node.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleMuteAlerts = () => {
    setIsAlertsMuted(prev => {
      const next = !prev;
      try {
        sessionStorage.setItem(`mute_alerts_${node.id}`, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const auditLogs = useMemo(() => getRegionalAuditLogs(node), [node]);

  const auditSeverityCounts = useMemo(() => {
    return {
      Critical: auditLogs.filter(l => l.severity === 'Critical').length,
      Warning: auditLogs.filter(l => l.severity === 'Warning').length,
      Info: auditLogs.filter(l => l.severity === 'Info').length,
      All: auditLogs.length
    };
  }, [auditLogs]);

  const displayedAuditLogs = useMemo(() => {
    if (auditSeverityFilter === 'ALL') return auditLogs;
    return auditLogs.filter(l => l.severity === auditSeverityFilter);
  }, [auditLogs, auditSeverityFilter]);

  const threatSummary = getRegionThreatSummary(node.id, threatEvents);
  const nodeThreatEvents = threatEvents.filter(e => e.nodeId === node.id);

  // Traffic volume series for mini visual bar chart (12 time slots)
  const trafficHistory = [
    Math.round(liveThroughput * 0.72),
    Math.round(liveThroughput * 0.85),
    Math.round(liveThroughput * 0.79),
    Math.round(liveThroughput * 0.94),
    Math.round(liveThroughput * 1.05),
    Math.round(liveThroughput * 0.88),
    Math.round(liveThroughput * 0.96),
    Math.round(liveThroughput * 1.12),
    Math.round(liveThroughput * 0.91),
    Math.round(liveThroughput * 1.02),
    Math.round(liveThroughput * 0.98),
    liveThroughput
  ];
  const maxTrafficVal = Math.max(...trafficHistory, 1);

  return (
    <motion.div
      id="connectivity-detail-card-backdrop"
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      {/* Morphing Expansion Card Container */}
      <motion.div
        id="connectivity-detail-card"
        className="relative w-full max-w-2xl bg-slate-900/95 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl ring-1 ring-white/10 text-slate-100 flex flex-col max-h-[92vh]"
        initial={{
          scale: 0.2,
          opacity: 0,
          x: originPos.x - 500, // Relative displacement from clicked beacon node
          y: originPos.y - 250
        }}
        animate={{
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0
        }}
        exit={{
          scale: 0.2,
          opacity: 0,
          x: originPos.x - 500,
          y: originPos.y - 250
        }}
        transition={{
          type: 'spring',
          damping: 26,
          stiffness: 280,
          mass: 0.9
        }}
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow:
            '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px -5px rgba(99, 102, 241, 0.25)'
        }}
      >
        {/* Card Header Strip */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-indigo-500/30 flex items-center space-x-1">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span>Connectivity Detail Card</span>
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">{node.code}</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider border ${
                  node.status === 'OPTIMAL'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : node.status === 'FAIR'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
                }`}
              >
                {node.status}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <span>{node.name}</span>
            </h3>

            <p className="text-xs text-slate-400 font-mono flex items-center space-x-1.5 flex-wrap">
              <span>{node.city}, {node.country}</span>
              <span>•</span>
              <span className="text-indigo-400 font-semibold">{node.cloudProvider} Cloud Edge</span>
              <span>•</span>
              <span className="text-slate-300">WORM Seal: {node.auditSeal}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* 'Mute Alerts' Toggle Switch (Reduces Alert Fatigue) */}
            <button
              id="connectivity-card-mute-alerts-toggle"
              type="button"
              role="switch"
              aria-checked={isAlertsMuted}
              onClick={handleToggleMuteAlerts}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer flex items-center space-x-2 ${
                isAlertsMuted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
              }`}
              title={
                isAlertsMuted
                  ? 'Alerts Muted: Non-critical severity badges (Warning & Info) suppressed for this region'
                  : 'Mute Alerts: Temporarily suppress non-critical severity badges (Warning & Info) to reduce alert fatigue'
              }
            >
              {isAlertsMuted ? (
                <BellOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="hidden sm:inline text-[10px] font-bold tracking-tight">
                {isAlertsMuted ? 'ALERTS MUTED' : 'MUTE ALERTS'}
              </span>
              {/* Toggle switch track and thumb */}
              <div
                className={`w-6 h-3.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                  isAlertsMuted ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-2.5 h-2.5 rounded-full shadow-xs transform transition-transform duration-200 ${
                    isAlertsMuted ? 'translate-x-2.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsLiveStreaming(prev => !prev)}
              className={`p-1.5 rounded-lg border text-xs font-mono transition cursor-pointer flex items-center space-x-1 ${
                isLiveStreaming
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isLiveStreaming ? 'Live Telemetry Active' : 'Live Stream Paused'}
            >
              <Zap className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-emerald-300' : ''}`} />
              <span className="hidden sm:inline text-[10px]">{isLiveStreaming ? 'STREAMING' : 'PAUSED'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close Detail Card (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 sm:px-5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('traffic')}
            className={`py-2.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'traffic'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Traffic Statistics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stability')}
            className={`py-2.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'stability'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Jitter &amp; Latency (60m)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anomaly')}
            className={`py-2.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'anomaly'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Predictive Anomaly Score</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Recent Audit Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-slate-300 font-mono">
              {auditLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('threats')}
            className={`py-2.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'threats'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Threat Incidents</span>
            {nodeThreatEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {nodeThreatEvents.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: REAL-TIME TRAFFIC STATISTICS */}
          {activeTab === 'traffic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Throughput Rate</span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold font-mono text-white">{liveThroughput}</span>
                    <span className="text-[10px] text-slate-400 font-mono">pkts/min</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    {liveBandwidth} Mbps Allocated
                  </span>
                </div>

                <div
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 cursor-pointer hover:border-cyan-500/60 transition group"
                  onClick={() => setActiveTab('stability')}
                  title="Click to view full 60-Minute Jitter & Latency Sparkline"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">RTT Latency</span>
                    <span className="text-[9px] text-cyan-400 font-mono opacity-80 group-hover:opacity-100 transition flex items-center space-x-0.5">
                      <span>60m</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold font-mono text-cyan-400">{liveLatency}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ms</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Jitter: ±{node.jitterMs}ms</span>
                    <span className="text-[9px] text-emerald-400">Stable</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Packet Loss</span>
                  <div className="flex items-baseline space-x-1.5">
                    <span
                      className={`text-xl font-bold font-mono ${
                        node.packetLossPercent === 0
                          ? 'text-emerald-400'
                          : node.packetLossPercent > 1
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {node.packetLossPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">loss</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    0 Frame Discards
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Health Index</span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {node.connectivityScore}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    SLA Conformant
                  </span>
                </div>
              </div>

              {/* Real-time 60-Minute Jitter & Latency Sparkline Graph */}
              <NetworkStabilitySparklineGraph
                node={node}
                isLiveStreaming={isLiveStreaming}
                liveLatency={liveLatency}
              />

              {/* Predictive Anomaly Score & Outage Likelihood Gauge Widget */}
              <PredictiveAnomalyScoreWidget
                node={node}
                threatEvents={threatEvents}
                currentLatency={liveLatency}
                currentThroughput={liveThroughput}
                isLiveStreaming={isLiveStreaming}
                onNavigateTimeline={onOpenThreatTimeline}
              />

              {/* Real-time Traffic Throughput Histogram */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white">Live Ingress Traffic Distribution</span>
                    <span className="text-[10px] text-slate-400">(Last 12 Rolling Windows)</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">Peak: {maxTrafficVal} pkts/min</span>
                </div>

                {/* Histogram Bars */}
                <div className="h-24 flex items-end justify-between gap-1.5 pt-3 pb-1 border-b border-slate-800/80">
                  {trafficHistory.map((val, idx) => {
                    const heightPercent = Math.max(14, Math.round((val / maxTrafficVal) * 100));
                    const isLatest = idx === trafficHistory.length - 1;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover Tooltip on Bar */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[9px] font-mono text-white px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                          {val} pkts/m
                        </div>
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${
                            isLatest
                              ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                              : 'bg-indigo-950/80 group-hover:bg-indigo-600/70'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>-12m</span>
                  <span>-6m</span>
                  <span className="text-indigo-400 font-bold">Now (Live)</span>
                </div>
              </div>

              {/* Connected Sensors in this Gateway */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Integrated Compliance Sensors ({node.connectedSensors.length})
                  </span>
                  <span className="text-[10px] text-emerald-400">All Heartbeats Verified</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {node.connectedSensors.map(sensor => (
                    <button
                      key={sensor}
                      type="button"
                      onClick={() => onSelectSensor?.(sensor)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-indigo-500 hover:bg-slate-900 transition cursor-pointer flex items-center space-x-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{sensor}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sovereign Jurisdiction & WORM Security Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Jurisdiction &amp; Regulatory Standard:</span>
                  <span className="text-indigo-300 font-bold">{node.sovereignJurisdiction}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">WORM Ledger Consensus:</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographically Anchored</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REAL-TIME JITTER & LATENCY SPARKLINE (60-MIN STABILITY) */}
          {activeTab === 'stability' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Main Real-time Sparkline Graph Component */}
              <NetworkStabilitySparklineGraph
                node={node}
                isLiveStreaming={isLiveStreaming}
                liveLatency={liveLatency}
              />

              {/* In-depth 60-Minute Stability Diagnostic Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                {/* Panel 1: Packet Delay Variation (PDV) */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <Activity className="w-4 h-4" />
                    <span className="font-bold text-white">Packet Delay Variation</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    RFC 3393 inter-arrival jitter measured via sub-millisecond continuous ICMP/UDP probes.
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jitter Variance:</span>
                      <span className="text-slate-300 font-bold">±{(node.jitterMs * 0.75).toFixed(2)} ms²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Dispersion:</span>
                      <span className="text-amber-400 font-bold">±{(node.jitterMs * 1.8).toFixed(1)} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jitter State:</span>
                      <span className="text-emerald-400 font-bold">Optimal Band (&lt; 3ms)</span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Routing Consistency & BGP Flap Risk */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Server className="w-4 h-4" />
                    <span className="font-bold text-white">BGP Route Stability</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Autonomous System Path (AS-PATH) hop stability and edge gateway peering health.
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active AS Hops:</span>
                      <span className="text-slate-300 font-bold">4 Hops (Direct Peer)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Route Flaps (60m):</span>
                      <span className="text-emerald-400 font-bold">0 Flaps Detected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Convergence Speed:</span>
                      <span className="text-indigo-300 font-bold">&lt; 280 ms</span>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Stability Compliance SLA */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold text-white">SLA Conformance</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Contractual latency and jitter limits monitored for regulatory and financial reporting.
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">SLA Latency Cap:</span>
                      <span className="text-slate-300 font-bold">60.0 ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SLA Jitter Cap:</span>
                      <span className="text-slate-300 font-bold">±5.0 ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">60m SLA Compliance:</span>
                      <span className="text-emerald-400 font-bold">99.98%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Quick Actions */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Sparkline data updates automatically in real-time when live feed is connected.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('anomaly')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Predictive Outage Gauge</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('traffic')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Back to Traffic Overview</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PREDICTIVE ANOMALY SCORE DEEP-DIVE */}
          {activeTab === 'anomaly' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <PredictiveAnomalyScoreWidget
                node={node}
                threatEvents={threatEvents}
                currentLatency={liveLatency}
                currentThroughput={liveThroughput}
                isLiveStreaming={isLiveStreaming}
                onNavigateTimeline={onOpenThreatTimeline}
              />

              {/* SRE Autonomous Prevention Playbook */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-white uppercase">
                      Automated Link Outage Mitigation Protocol
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Autonomous SRE v4.2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Trigger Threshold 1</span>
                    <p className="text-slate-200 font-bold">Score &gt; 25 (Warning)</p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Arm backup transit fibers and increase heartbeat polling from 2s to 500ms.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Trigger Threshold 2</span>
                    <p className="text-amber-300 font-bold">Score &gt; 50 (Elevated)</p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Dynamically route 40% non-critical ingress payloads via alternate peering points.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase">Trigger Threshold 3</span>
                    <p className="text-rose-400 font-bold">Score &gt; 75 (Critical)</p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Execute hitless BGP AS-Path withdrawal and activate standby sovereign gateway.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RECENT AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 text-[11px] uppercase font-bold font-mono">
                      Immutable Audit Ledger ({node.code})
                    </span>
                    {isAlertsMuted && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono flex items-center space-x-1">
                        <BellOff className="w-2.5 h-2.5" />
                        <span>Muted</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    WORM hardware root attested across sovereign jurisdiction perimeters.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Incident Severity Filter Chips */}
                  <div className="flex items-center space-x-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono shrink-0">
                    <button
                      type="button"
                      onClick={() => setAuditSeverityFilter('ALL')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition ${
                        auditSeverityFilter === 'ALL'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({auditSeverityCounts.All})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditSeverityFilter('Critical')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition flex items-center space-x-1 ${
                        auditSeverityFilter === 'Critical'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>Critical ({auditSeverityCounts.Critical})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditSeverityFilter('Warning')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition flex items-center space-x-1 ${
                        auditSeverityFilter === 'Warning'
                          ? 'bg-amber-600 text-white font-bold'
                          : isAlertsMuted
                          ? 'text-slate-500 hover:text-slate-400'
                          : 'text-amber-400 hover:text-amber-300'
                      }`}
                      title={isAlertsMuted ? 'Warning badges are currently suppressed' : undefined}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAlertsMuted ? 'bg-slate-600' : 'bg-amber-400'}`} />
                      <span>Warning ({auditSeverityCounts.Warning})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditSeverityFilter('Info')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition flex items-center space-x-1 ${
                        auditSeverityFilter === 'Info'
                          ? 'bg-sky-600 text-white font-bold'
                          : isAlertsMuted
                          ? 'text-slate-500 hover:text-slate-400'
                          : 'text-sky-400 hover:text-sky-300'
                      }`}
                      title={isAlertsMuted ? 'Info badges are currently suppressed' : undefined}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAlertsMuted ? 'bg-slate-600' : 'bg-sky-400'}`} />
                      <span>Info ({auditSeverityCounts.Info})</span>
                    </button>
                  </div>

                  {/* Inline Mute Alerts Quick Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAlertsMuted}
                    onClick={handleToggleMuteAlerts}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                      isAlertsMuted
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                    title={
                      isAlertsMuted
                        ? 'Click to unmute non-critical severity badges'
                        : 'Click to mute non-critical severity badges'
                    }
                  >
                    {isAlertsMuted ? (
                      <BellOff className="w-3 h-3 text-amber-400 shrink-0" />
                    ) : (
                      <Bell className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                    <span>{isAlertsMuted ? 'Muted' : 'Mute'}</span>
                    <div
                      className={`w-5 h-3 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                        isAlertsMuted ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2 h-2 rounded-full shadow-xs transform transition-transform duration-200 ${
                          isAlertsMuted ? 'translate-x-2' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Mute Alerts Fatigue Reduction Active Banner */}
              {isAlertsMuted && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/25 border border-amber-500/30 text-amber-200 text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <BellOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] leading-snug">
                      <strong className="text-amber-300">Alert Fatigue Guard Active:</strong> Non-critical severity badges (<span className="text-amber-300 font-semibold">Warning</span> &amp; <span className="text-sky-300 font-semibold">Info</span>) are temporarily suppressed for {node.name}. Critical badges remain active.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleMuteAlerts}
                    className="text-[10px] font-bold text-amber-300 underline hover:text-white cursor-pointer shrink-0 ml-2"
                  >
                    Unmute
                  </button>
                </div>
              )}

              {/* Audit Log Entries List */}
              <div className="space-y-2">
                {displayedAuditLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border transition space-y-2 ${
                      log.severity === 'Critical'
                        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                        : isAlertsMuted
                        ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        : log.severity === 'Warning'
                        ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-white tracking-wide">{log.eventType}</span>

                        {/* Critical Severity Badge: Always rendered (unsuppressed) */}
                        {log.severity === 'Critical' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse">
                            <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>Critical</span>
                          </span>
                        )}

                        {/* Warning Severity Badge: Suppressed when Mute Alerts is active */}
                        {log.severity === 'Warning' && (
                          isAlertsMuted ? (
                            <span
                              className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 border border-slate-800 bg-slate-900/60"
                              title="Non-critical Warning badge suppressed by Mute Alerts to reduce fatigue"
                            >
                              <BellOff className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              <span className="italic">Warning (Suppressed)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Warning</span>
                            </span>
                          )
                        )}

                        {/* Info Severity Badge: Suppressed when Mute Alerts is active */}
                        {log.severity === 'Info' && (
                          isAlertsMuted ? (
                            <span
                              className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 border border-slate-800 bg-slate-900/60"
                              title="Non-critical Info badge suppressed by Mute Alerts to reduce fatigue"
                            >
                              <BellOff className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              <span className="italic">Info (Suppressed)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                              <Info className="w-3 h-3 text-sky-400 shrink-0" />
                              <span>Info</span>
                            </span>
                          )
                        )}

                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                          {log.jurisdictionTag}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-slate-400 text-[10px] shrink-0">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{log.displayTime}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{log.summary}</p>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                      <span>Actor: {log.actorOrSystem}</span>
                      <span className="text-indigo-400 font-mono">Ledger Hash: {log.wormHashSnippet}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: THREAT INCIDENTS */}
          {activeTab === 'threats' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    Regional Threat Detections ({nodeThreatEvents.length})
                  </span>
                  {isAlertsMuted && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono flex items-center space-x-1">
                      <BellOff className="w-2.5 h-2.5" />
                      <span>Muted</span>
                    </span>
                  )}
                </div>
                {onOpenThreatTimeline && (
                  <button
                    type="button"
                    onClick={onOpenThreatTimeline}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open SOC-2 Timeline</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Mute Alerts Notice in Threat Tab */}
              {isAlertsMuted && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/25 border border-amber-500/30 text-amber-200 text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <BellOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] leading-snug">
                      <strong className="text-amber-300">Alert Fatigue Guard Active:</strong> Non-critical threat badges (High &amp; Medium) are suppressed. Critical threats remain active.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleMuteAlerts}
                    className="text-[10px] font-bold text-amber-300 underline hover:text-white cursor-pointer shrink-0 ml-2"
                  >
                    Unmute
                  </button>
                </div>
              )}

              {nodeThreatEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Active Threat Detections</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All perimeter sensors and egress firewalls report 0 breach indicators for {node.name} within the current telemetry window.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {nodeThreatEvents.map(evt => (
                    <div
                      key={evt.id}
                      className={`p-3.5 rounded-xl transition space-y-2 border ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-slate-950/90 border-rose-500/40'
                          : isAlertsMuted
                          ? 'bg-slate-950/70 border-slate-800'
                          : 'bg-slate-950/90 border-rose-500/25'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            {evt.severity === 'CRITICAL' ? (
                              <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse flex items-center space-x-1">
                                <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
                                <span>CRITICAL</span>
                              </span>
                            ) : isAlertsMuted ? (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded font-mono text-slate-500 border border-slate-800 bg-slate-900/60 flex items-center space-x-1"
                                title={`Non-critical ${evt.severity} badge suppressed by Mute Alerts to reduce fatigue`}
                              >
                                <BellOff className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                <span className="italic">{evt.severity} (Suppressed)</span>
                              </span>
                            ) : (
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                                  evt.severity === 'HIGH'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                }`}
                              >
                                {evt.severity}
                              </span>
                            )}
                            <span className="text-xs font-bold text-white">{evt.threatTitle}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {evt.threatCategory} • {evt.timeAgo}
                          </p>
                        </div>

                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                          {evt.mitigationStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{evt.description}</p>

                      <div className="p-2 rounded-lg bg-black/60 font-mono text-[9px] text-slate-400 space-y-0.5 border border-slate-900">
                        <div>Target Vector: {evt.targetVector}</div>
                        <div>Compliance: {evt.complianceImpact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300">Continuous Audit Stream Active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer text-xs"
          >
            Close Card
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
