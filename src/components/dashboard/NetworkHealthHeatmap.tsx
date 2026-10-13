import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Activity,
  Wifi,
  WifiOff,
  Server,
  Radio,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Zap,
  RefreshCw,
  Sliders,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Share2,
  Maximize2,
  Minimize2,
  Flame,
  Info,
  X,
  ShieldAlert,
  HeartPulse
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  ThreatDetectionTimeline,
  INITIAL_THREAT_EVENTS,
  ThreatDetectionEvent,
  getRegionThreatSummary
} from './ThreatDetectionTimeline';
import { ConnectivityDetailCard } from './ConnectivityDetailCard';

export type ConnectivityStatus = 'OPTIMAL' | 'FAIR' | 'DEGRADED';
export type HeatmapMetricMode = 'strength' | 'latency' | 'throughput' | 'packetLoss';
export type VisualDisplayMode = 'geo-map' | 'node-graph';

export interface RegionalNetworkNode {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  coordinates: { x: number; y: number }; // Normalized 0-1000 x 0-500 for SVG World Map
  graphCoordinates: { x: number; y: number }; // Graph coords 0-1000 x 0-500
  cloudProvider: 'AWS' | 'Cloudflare' | 'Azure' | 'GCP' | 'Hybrid Edge';
  connectivityScore: number; // 0 - 100%
  status: ConnectivityStatus;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  throughputPktsMin: number;
  throughputBandwidthMbps: number;
  connectedSensors: string[];
  activeIncidents: number;
  sovereignJurisdiction: string;
  auditSeal: string;
  isPrimaryHub?: boolean;
}

export const INITIAL_REGIONAL_NODES: RegionalNetworkNode[] = [
  {
    id: 'reg-us-east',
    name: 'US East (N. Virginia)',
    code: 'us-east-1',
    city: 'Ashburn',
    country: 'United States',
    coordinates: { x: 268, y: 172 },
    graphCoordinates: { x: 300, y: 150 },
    cloudProvider: 'AWS',
    connectivityScore: 99.8,
    status: 'OPTIMAL',
    latencyMs: 12,
    jitterMs: 1.2,
    packetLossPercent: 0.01,
    throughputPktsMin: 148,
    throughputBandwidthMbps: 48.6,
    connectedSensors: ['AWS GuardDuty', 'Okta SCIM & MFA', 'Cloudflare WAF'],
    activeIncidents: 0,
    sovereignJurisdiction: 'US FedRAMP / SOC 2 Type II',
    auditSeal: 'SEAL-USE1-890A'
  },
  {
    id: 'reg-us-west',
    name: 'US West (Oregon)',
    code: 'us-west-2',
    city: 'Boardman',
    country: 'United States',
    coordinates: { x: 178, y: 158 },
    graphCoordinates: { x: 200, y: 260 },
    cloudProvider: 'AWS',
    connectivityScore: 99.4,
    status: 'OPTIMAL',
    latencyMs: 22,
    jitterMs: 1.8,
    packetLossPercent: 0.02,
    throughputPktsMin: 86,
    throughputBandwidthMbps: 26.4,
    connectedSensors: ['Terraform IaC', 'GitHub CI/CD'],
    activeIncidents: 0,
    sovereignJurisdiction: 'US NIST SP 800-53',
    auditSeal: 'SEAL-USW2-441F'
  },
  {
    id: 'reg-eu-central',
    name: 'Europe Central (Frankfurt)',
    code: 'eu-central-1',
    city: 'Frankfurt',
    country: 'Germany',
    coordinates: { x: 522, y: 142 },
    graphCoordinates: { x: 500, y: 100 },
    cloudProvider: 'Hybrid Edge',
    connectivityScore: 99.6,
    status: 'OPTIMAL',
    latencyMs: 26,
    jitterMs: 1.5,
    packetLossPercent: 0.01,
    throughputPktsMin: 112,
    throughputBandwidthMbps: 38.2,
    connectedSensors: ['CrowdStrike EDR', 'Vault PKI'],
    activeIncidents: 0,
    sovereignJurisdiction: 'EU GDPR • BSI C5 (Sovereign)',
    auditSeal: 'SEAL-EUC1-B722'
  },
  {
    id: 'reg-eu-west',
    name: 'Europe West (London)',
    code: 'europe-west2',
    city: 'London',
    country: 'United Kingdom',
    coordinates: { x: 485, y: 132 },
    graphCoordinates: { x: 400, y: 120 },
    cloudProvider: 'GCP',
    connectivityScore: 99.2,
    status: 'OPTIMAL',
    latencyMs: 24,
    jitterMs: 1.7,
    packetLossPercent: 0.03,
    throughputPktsMin: 68,
    throughputBandwidthMbps: 21.0,
    connectedSensors: ['Cloudflare WAF', 'GitHub CI/CD'],
    activeIncidents: 0,
    sovereignJurisdiction: 'UK PRA / Bank of England PS21/3',
    auditSeal: 'SEAL-EUW2-66DF'
  },
  {
    id: 'reg-ap-southeast',
    name: 'Asia Pacific (Singapore)',
    code: 'ap-southeast-1',
    city: 'Singapore',
    country: 'Singapore',
    coordinates: { x: 755, y: 282 },
    graphCoordinates: { x: 740, y: 320 },
    cloudProvider: 'Cloudflare',
    connectivityScore: 100.0,
    status: 'OPTIMAL',
    latencyMs: 8,
    jitterMs: 0.8,
    packetLossPercent: 0.0,
    throughputPktsMin: 136,
    throughputBandwidthMbps: 54.2,
    connectedSensors: ['Cloudflare WAF (SIN Edge)', 'Okta SCIM & MFA'],
    activeIncidents: 0,
    sovereignJurisdiction: 'MAS TRM 13.0 • MAS Notice 644',
    auditSeal: 'SEAL-SIN-00A1'
  },
  {
    id: 'reg-ap-northeast',
    name: 'Asia Pacific (Tokyo)',
    code: 'ap-northeast-1',
    city: 'Tokyo',
    country: 'Japan',
    coordinates: { x: 864, y: 172 },
    graphCoordinates: { x: 800, y: 180 },
    cloudProvider: 'AWS',
    connectivityScore: 84.5,
    status: 'FAIR',
    latencyMs: 78,
    jitterMs: 5.2,
    packetLossPercent: 1.4,
    throughputPktsMin: 22,
    throughputBandwidthMbps: 6.8,
    connectedSensors: ['Datadog SIEM'],
    activeIncidents: 1,
    sovereignJurisdiction: 'Japan APPI • FISC Security Guidelines',
    auditSeal: 'SEAL-NRT1-DE31'
  },
  {
    id: 'reg-sa-east',
    name: 'South America (São Paulo)',
    code: 'sa-east-1',
    city: 'São Paulo',
    country: 'Brazil',
    coordinates: { x: 348, y: 358 },
    graphCoordinates: { x: 320, y: 400 },
    cloudProvider: 'Azure',
    connectivityScore: 95.8,
    status: 'OPTIMAL',
    latencyMs: 115,
    jitterMs: 3.4,
    packetLossPercent: 0.08,
    throughputPktsMin: 34,
    throughputBandwidthMbps: 11.5,
    connectedSensors: ['Vault PKI (Mirror)'],
    activeIncidents: 0,
    sovereignJurisdiction: 'Brazil LGPD • Bacen Res. 4893',
    auditSeal: 'SEAL-SAE1-71C2'
  },
  {
    id: 'reg-me-central',
    name: 'Middle East (Dubai)',
    code: 'me-central-1',
    city: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { x: 635, y: 205 },
    graphCoordinates: { x: 650, y: 210 },
    cloudProvider: 'AWS',
    connectivityScore: 98.9,
    status: 'OPTIMAL',
    latencyMs: 36,
    jitterMs: 2.1,
    packetLossPercent: 0.02,
    throughputPktsMin: 44,
    throughputBandwidthMbps: 14.2,
    connectedSensors: ['AWS GuardDuty'],
    activeIncidents: 0,
    sovereignJurisdiction: 'UAE NESAS • CBUAE Stored Value Facility',
    auditSeal: 'SEAL-DXB1-9988'
  },
  {
    id: 'reg-ap-southeast-2',
    name: 'Australia (Sydney)',
    code: 'ap-southeast-2',
    city: 'Sydney',
    country: 'Australia',
    coordinates: { x: 885, y: 395 },
    graphCoordinates: { x: 780, y: 420 },
    cloudProvider: 'AWS',
    connectivityScore: 99.1,
    status: 'OPTIMAL',
    latencyMs: 42,
    jitterMs: 2.4,
    packetLossPercent: 0.02,
    throughputPktsMin: 52,
    throughputBandwidthMbps: 17.8,
    connectedSensors: ['CrowdStrike EDR', 'Terraform IaC'],
    activeIncidents: 0,
    sovereignJurisdiction: 'APRA CPS 234 • Privacy Act 1988',
    auditSeal: 'SEAL-SYD2-55C1'
  }
];

// Central Skanda GRC WORM Ledger Hub
const CENTRAL_LEDGER_HUB = {
  id: 'hub-skanda-core',
  name: 'Skanda Global Immutable WORM Mesh Hub',
  code: 'skanda-hub-zero',
  city: 'Global Distributed Anycast',
  coordinates: { x: 500, y: 250 },
  graphCoordinates: { x: 500, y: 260 }
};

/**
 * Calculates breathing animation cycle duration (in seconds) based on regional traffic latency.
 * The pulse rate (frequency) increases proportionally to the amount of traffic latency reported:
 * - Low latency (~12-20ms): ~4.2s - 4.6s deep, calm breathing period (~13-14 bpm)
 * - Moderate latency (~35-60ms): ~2.8s - 3.4s standard breathing period (~18-21 bpm)
 * - Elevated latency (~80-120ms): ~1.8s - 2.2s active breathing period (~27-33 bpm)
 * - Critical / Spiked latency (200-350ms+): ~0.75s - 1.1s rapid warning pulse (~55-80 bpm)
 */
export const getLatencyBreathingDurationSec = (latencyMs: number): number => {
  const safeLatency = Math.max(8, latencyMs);
  const dur = 0.65 + 3.85 / (1 + Math.pow(safeLatency / 50, 1.15));
  return Math.max(0.65, Math.min(4.8, Math.round(dur * 100) / 100));
};

export const getLatencyBreathingBpm = (durationSec: number): number => {
  return Math.round(60 / durationSec);
};

interface NetworkHealthHeatmapProps {
  onSelectSensor?: (sensorName: string) => void;
  className?: string;
}

export const NetworkHealthHeatmap: React.FC<NetworkHealthHeatmapProps> = ({
  onSelectSensor,
  className = ''
}) => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  // Component State
  const [nodes, setNodes] = useState<RegionalNetworkNode[]>(INITIAL_REGIONAL_NODES);
  const [threatEvents, setThreatEvents] = useState<ThreatDetectionEvent[]>(INITIAL_THREAT_EVENTS);
  const [displayMode, setDisplayMode] = useState<VisualDisplayMode>('geo-map');
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('strength');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('reg-ap-southeast');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [expandedNodeOrigin, setExpandedNodeOrigin] = useState<{ x: number; y: number }>({ x: 500, y: 250 });
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isSimulatingFailover, setIsSimulatingFailover] = useState<boolean>(false);
  const [isProbingNetwork, setIsProbingNetwork] = useState<boolean>(false);
  const [isPingTesting, setIsPingTesting] = useState<boolean>(false);
  const [pingTestLogs, setPingTestLogs] = useState<string[]>([]);
  const [showCoverageContours, setShowCoverageContours] = useState<boolean>(true);
  const [showDataArcs, setShowDataArcs] = useState<boolean>(true);
  const [sidePanelTab, setSidePanelTab] = useState<'threats' | 'telemetry'>('threats');

  // Periodic heartbeat animation & slight live fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes =>
        prevNodes.map(node => {
          if (isSimulatingFailover && node.id === 'reg-ap-northeast') {
            return {
              ...node,
              connectivityScore: 61.2,
              status: 'DEGRADED',
              latencyMs: 248,
              jitterMs: 14.8,
              packetLossPercent: 4.8,
              activeIncidents: 2
            };
          }
          if (isSimulatingFailover && node.id === 'reg-eu-central') {
            return {
              ...node,
              connectivityScore: 82.0,
              status: 'FAIR',
              latencyMs: 92,
              jitterMs: 6.1,
              packetLossPercent: 1.2
            };
          }

          // Small natural variance
          const deltaLat = (Math.random() - 0.5) * 2;
          const currentLat = Math.max(6, Math.round((node.latencyMs + deltaLat) * 10) / 10);
          return {
            ...node,
            latencyMs: currentLat
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulatingFailover]);

  // Aggregate stats
  const aggregateMetrics = useMemo(() => {
    const total = nodes.length;
    const avgScore =
      Math.round((nodes.reduce((acc, n) => acc + n.connectivityScore, 0) / total) * 10) / 10;
    const avgLatency =
      Math.round((nodes.reduce((acc, n) => acc + n.latencyMs, 0) / total) * 10) / 10;
    const totalThroughput = nodes.reduce((acc, n) => acc + n.throughputPktsMin, 0);
    const totalBandwidth =
      Math.round(nodes.reduce((acc, n) => acc + n.throughputBandwidthMbps, 0) * 10) / 10;
    const optimalCount = nodes.filter(n => n.status === 'OPTIMAL').length;
    const fairCount = nodes.filter(n => n.status === 'FAIR').length;
    const degradedCount = nodes.filter(n => n.status === 'DEGRADED').length;

    return {
      total,
      avgScore,
      avgLatency,
      totalThroughput,
      totalBandwidth,
      optimalCount,
      fairCount,
      degradedCount
    };
  }, [nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (filterProvider !== 'ALL' && node.cloudProvider !== filterProvider) return false;
      if (filterStatus !== 'ALL' && node.status !== filterStatus) return false;
      return true;
    });
  }, [nodes, filterProvider, filterStatus]);

  const activeSelectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Handlers
  const handleProbeAllGateways = () => {
    setIsProbingNetwork(true);
    showToast({
      title: 'Probing Global Telemetry Mesh',
      message: 'Dispatching ICMP & TLS 1.3 synthetic heartbeats to 9 regional ingress points...',
      type: 'info'
    });

    setTimeout(() => {
      setIsProbingNetwork(false);
      showToast({
        title: 'Mesh Health Sweep Complete',
        message: '9/9 regional gateways verified. Cryptographic WORM integrity certified.',
        type: 'success'
      });
    }, 1800);
  };

  const handleToggleFailoverSim = () => {
    const next = !isSimulatingFailover;
    setIsSimulatingFailover(next);
    if (next) {
      showToast({
        title: 'Simulation: Regional Fiber Reroute',
        message: 'Injected trans-Pacific link degradation. AP-Northeast (Tokyo) latency spiked to 248ms.',
        type: 'warning'
      });
    } else {
      setNodes(INITIAL_REGIONAL_NODES);
      showToast({
        title: 'Simulation Cleared',
        message: 'Restored nominal carrier peering across all global cloud regions.',
        type: 'success'
      });
    }
  };

  const handleTriggerNodePing = (node: RegionalNetworkNode) => {
    setIsPingTesting(true);
    setPingTestLogs([
      `Initiating TLS handshake with ${node.code} (${node.city})...`,
      `Resolved Gateway IP: 198.51.100.${Math.floor(Math.random() * 200 + 10)}`,
      `TCP SYN-ACK roundtrip: ${Math.max(4, Math.round(node.latencyMs * 0.7))}ms`,
      `TLS 1.3 session established with cipher TLS_AES_256_GCM_SHA384`,
      `Auditor WORM Seal: ${node.auditSeal} valid • 0.00% packet loss`
    ]);

    setTimeout(() => {
      setIsPingTesting(false);
    }, 1200);
  };

  // Color mapping based on metric mode
  const getNodeColor = (node: RegionalNetworkNode) => {
    if (metricMode === 'strength') {
      if (node.connectivityScore >= 98) return '#10B981'; // Emerald
      if (node.connectivityScore >= 90) return '#06B6D4'; // Cyan
      if (node.connectivityScore >= 75) return '#F59E0B'; // Amber
      return '#EF4444'; // Rose
    }
    if (metricMode === 'latency') {
      if (node.latencyMs <= 20) return '#10B981'; // Fast
      if (node.latencyMs <= 45) return '#06B6D4'; // Good
      if (node.latencyMs <= 90) return '#F59E0B'; // Elevated
      return '#EF4444'; // Degraded
    }
    if (metricMode === 'throughput') {
      if (node.throughputPktsMin >= 100) return '#8B5CF6'; // High Purple
      if (node.throughputPktsMin >= 50) return '#3B82F6'; // Medium Blue
      if (node.throughputPktsMin >= 20) return '#06B6D4'; // Cyan
      return '#F59E0B'; // Low
    }
    // Packet Loss
    if (node.packetLossPercent === 0) return '#10B981';
    if (node.packetLossPercent < 0.1) return '#06B6D4';
    if (node.packetLossPercent < 1.0) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div
      id="network-health-heatmap-layer"
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isLight
          ? 'bg-slate-900 border-slate-800 text-white shadow-xl'
          : 'bg-[#050914] border-slate-800/90 text-white shadow-2xl'
      } ${className}`}
    >
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Pulse Indicator */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Network Health Heatmap</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 inline-flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real-Time Ingress Mesh</span>
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Live geographic and node-graph visualization of connectivity strength, RTT latency, and throughput across 9 global cloud regions.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Action Tools */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Visual Mode: Map vs Node-Graph */}
          <div className="flex items-center p-0.5 rounded-lg border bg-slate-900/90 border-slate-800">
            <button
              type="button"
              onClick={() => setDisplayMode('geo-map')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                displayMode === 'geo-map'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Geographic World Projection View"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Geographic Map</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('node-graph')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                displayMode === 'node-graph'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Force-Directed Regional Node-Graph View"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Node Graph</span>
            </button>
          </div>

          {/* Metric Dimension Selector */}
          <div className="hidden sm:flex items-center space-x-1 p-0.5 rounded-lg border bg-slate-900/90 border-slate-800 text-[11px] font-mono">
            {[
              { id: 'strength', label: 'Signal Strength' },
              { id: 'latency', label: 'RTT Latency' },
              { id: 'throughput', label: 'Throughput' },
              { id: 'packetLoss', label: 'Packet Loss' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetricMode(m.id as HeatmapMetricMode)}
                className={`px-2 py-1 rounded transition cursor-pointer ${
                  metricMode === m.id
                    ? 'bg-slate-800 text-indigo-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Simulation Toggle: Reroute / Failover */}
          <button
            type="button"
            onClick={handleToggleFailoverSim}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono border transition cursor-pointer flex items-center space-x-1.5 ${
              isSimulatingFailover
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Simulate regional fiber cut to test rerouting and heatmap alerting"
          >
            <Flame className={`w-3.5 h-3.5 ${isSimulatingFailover ? 'animate-pulse text-amber-300' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isSimulatingFailover ? 'Sim Spike Active' : 'Simulate Spike'}
            </span>
          </button>

          {/* Side-Panel Tab Switcher: Threat Timeline vs Gateway Inspector */}
          <button
            type="button"
            onClick={() => setSidePanelTab(prev => (prev === 'threats' ? 'telemetry' : 'threats'))}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono border transition cursor-pointer flex items-center space-x-1.5 ${
              sidePanelTab === 'threats'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-xs'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Toggle side-panel Threat Detection Timeline"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Threat Timeline</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-950 text-rose-300 font-bold border border-rose-700/50">
              Live
            </span>
          </button>

          {/* Sweep / Probe All Gateways */}
          <button
            type="button"
            onClick={handleProbeAllGateways}
            disabled={isProbingNetwork}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Dispatch synthetic ping test to all connected regions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProbingNetwork ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isProbingNetwork ? 'Pinging...' : 'Probe Mesh'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 border-b border-slate-800/80 bg-slate-950/40 divide-x divide-slate-800/60 text-xs font-mono">
        <div className="p-3 pl-4 sm:pl-5 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Global Health</span>
          <div className="flex items-center space-x-1.5">
            <span className={`text-base font-black ${
              aggregateMetrics.avgScore >= 98
                ? 'text-emerald-400'
                : aggregateMetrics.avgScore >= 90
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}>
              {aggregateMetrics.avgScore}%
            </span>
            <span className="text-[10px] text-slate-500">Score</span>
          </div>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg RTT Latency</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-black text-indigo-400">
              {aggregateMetrics.avgLatency}ms
            </span>
            <span className="text-[10px] text-slate-500">&lt;50ms SLA</span>
          </div>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Ingress</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-black text-white">
              {aggregateMetrics.totalThroughput}
            </span>
            <span className="text-[10px] text-slate-500">pkts/min</span>
          </div>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Aggregate Bandwidth</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-black text-cyan-400">
              {aggregateMetrics.totalBandwidth}
            </span>
            <span className="text-[10px] text-slate-500">Mbps</span>
          </div>
        </div>

        <div className="p-3 space-y-0.5 hidden lg:block">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Regional Status</span>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-emerald-400 font-bold">{aggregateMetrics.optimalCount} Optimal</span>
            {aggregateMetrics.fairCount > 0 && (
              <span className="text-amber-400 font-bold">{aggregateMetrics.fairCount} Fair</span>
            )}
            {aggregateMetrics.degradedCount > 0 && (
              <span className="text-rose-400 font-bold">{aggregateMetrics.degradedCount} Degraded</span>
            )}
          </div>
        </div>

        <div className="p-3 space-y-0.5 hidden lg:block">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">WORM Node Peering</span>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>9/9 Certified</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN VISUAL CANVAS & REGION INSPECTOR SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative min-h-[440px]">
        {/* Interactive Map / Graph Canvas (Left / Main) */}
        <div className="lg:col-span-8 p-3 sm:p-5 relative flex flex-col justify-between overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          {/* Canvas Toolbar Overlays */}
          <div className="relative z-10 flex items-center justify-between pb-2 flex-wrap gap-2 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono">Heatmap Metric:</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold font-mono border border-slate-700 capitalize">
                {metricMode}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[10px]">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCoverageContours}
                  onChange={e => setShowCoverageContours(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>Signal Contours</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDataArcs}
                  onChange={e => setShowDataArcs(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>Ingress Mesh Arcs</span>
              </label>
            </div>
          </div>

          {/* SVG Map / Graph Viewport */}
          <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center select-none">
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Radial Glow Gradients for Regional Heat halos */}
                <radialGradient id="emerald-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#10B981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="cyan-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="amber-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="rose-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#EF4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#818CF8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </radialGradient>

                {/* Linear gradient for mesh arcs */}
                <linearGradient id="arc-gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#10B981" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="arc-gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="arc-gradient-rose" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#EF4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* -------------------------------------------------------------
                  MODE A: GEOGRAPHIC WORLD MAP BACKGROUND
                  ------------------------------------------------------------- */}
              {displayMode === 'geo-map' && (
                <g id="world-map-geometry" opacity="0.85">
                  {/* Subtle Geodesic Latitude / Longitude lines */}
                  <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35">
                    <line x1="0" y1="125" x2="1000" y2="125" />
                    <line x1="0" y1="250" x2="1000" y2="250" strokeWidth="0.8" stroke="#475569" strokeDasharray="none" />
                    <line x1="0" y1="375" x2="1000" y2="375" />
                    <line x1="250" y1="0" x2="250" y2="500" />
                    <line x1="500" y1="0" x2="500" y2="500" strokeWidth="0.8" stroke="#475569" strokeDasharray="none" />
                    <line x1="750" y1="0" x2="750" y2="500" />
                  </g>

                  {/* North America Continental Landmass */}
                  <path
                    d="M 120 70 Q 180 50 250 60 Q 290 80 270 120 Q 300 130 310 160 Q 280 180 260 210 Q 230 230 200 210 Q 180 180 150 170 Q 130 150 110 110 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Alaska */}
                  <path
                    d="M 60 70 Q 100 60 120 70 Q 110 100 80 110 Q 60 90 60 70 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Greenland */}
                  <path
                    d="M 330 35 Q 380 30 400 65 Q 380 100 340 90 Q 320 60 330 35 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                    opacity="0.8"
                  />
                  {/* Central America & Caribbean */}
                  <path
                    d="M 200 210 Q 240 230 250 260 Q 220 250 200 210 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* South America */}
                  <path
                    d="M 260 270 Q 330 260 370 300 Q 380 350 350 410 Q 320 460 290 470 Q 270 410 260 340 Q 240 290 260 270 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Europe */}
                  <path
                    d="M 460 90 Q 520 75 560 100 Q 570 140 520 160 Q 480 170 460 140 Q 440 120 460 90 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Scandinavia / UK */}
                  <path
                    d="M 480 60 Q 520 45 530 80 Q 490 90 480 60 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <path
                    d="M 450 115 Q 470 110 475 130 Q 455 140 450 115 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Africa */}
                  <path
                    d="M 470 180 Q 550 170 580 220 Q 590 280 560 350 Q 520 400 490 360 Q 460 300 450 240 Q 440 200 470 180 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Asia / Eurasia */}
                  <path
                    d="M 570 85 Q 700 60 850 70 Q 920 110 900 170 Q 860 220 780 230 Q 720 240 680 210 Q 620 200 580 160 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Indian Subcontinent */}
                  <path
                    d="M 670 210 Q 720 220 730 260 Q 700 300 680 280 Q 660 240 670 210 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Southeast Asia & Archipelago */}
                  <path
                    d="M 750 240 Q 790 250 810 280 Q 780 320 740 290 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <circle cx="760" cy="305" r="7" fill="#1E293B" stroke="#334155" strokeWidth="0.8" />
                  <circle cx="790" cy="315" r="9" fill="#1E293B" stroke="#334155" strokeWidth="0.8" />
                  {/* Japan Archipelago */}
                  <path
                    d="M 865 145 Q 890 170 870 200 Q 855 185 865 145 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* Australia */}
                  <path
                    d="M 800 330 Q 890 320 910 360 Q 900 420 840 430 Q 780 410 790 360 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  {/* New Zealand */}
                  <path
                    d="M 940 410 Q 955 430 945 450 Q 935 440 940 410 Z"
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth="0.8"
                  />
                </g>
              )}

              {/* -------------------------------------------------------------
                  MODE B: REGIONAL NODE-GRAPH TOPOLOGY LAYOUT
                  ------------------------------------------------------------- */}
              {displayMode === 'node-graph' && (
                <g id="node-graph-skeleton">
                  {/* Radial Distance Rings around Central WORM Ledger Hub */}
                  <circle
                    cx={CENTRAL_LEDGER_HUB.graphCoordinates.x}
                    cy={CENTRAL_LEDGER_HUB.graphCoordinates.y}
                    r="120"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                    opacity="0.4"
                  />
                  <circle
                    cx={CENTRAL_LEDGER_HUB.graphCoordinates.x}
                    cy={CENTRAL_LEDGER_HUB.graphCoordinates.y}
                    r="240"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                    opacity="0.3"
                  />
                  <circle
                    cx={CENTRAL_LEDGER_HUB.graphCoordinates.x}
                    cy={CENTRAL_LEDGER_HUB.graphCoordinates.y}
                    r="340"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                    opacity="0.2"
                  />
                </g>
              )}

              {/* -------------------------------------------------------------
                  INTERCONNECTING DATA ARCS / LINKS
                  ------------------------------------------------------------- */}
              {showDataArcs && (
                <g id="mesh-connectivity-links">
                  {filteredNodes.map(node => {
                    const origin =
                      displayMode === 'geo-map'
                        ? CENTRAL_LEDGER_HUB.coordinates
                        : CENTRAL_LEDGER_HUB.graphCoordinates;
                    const dest =
                      displayMode === 'geo-map'
                        ? node.coordinates
                        : node.graphCoordinates;

                    // Compute curved quadratic control point
                    const midX = (origin.x + dest.x) / 2;
                    const midY = (origin.y + dest.y) / 2 - 35; // Arc curvature

                    const strokeGradient =
                      node.status === 'DEGRADED'
                        ? 'url(#arc-gradient-rose)'
                        : node.status === 'FAIR'
                        ? 'url(#arc-gradient-amber)'
                        : 'url(#arc-gradient-emerald)';

                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;

                    return (
                      <g key={`link-${node.id}`}>
                        {/* Static Arc */}
                        <path
                          d={`M ${origin.x} ${origin.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`}
                          fill="none"
                          stroke={strokeGradient}
                          strokeWidth={isSelected || isHovered ? 2.5 : 1.2}
                          strokeDasharray={node.status === 'DEGRADED' ? '4 3' : 'none'}
                          opacity={isSelected || isHovered ? 0.95 : 0.45}
                          className="transition-all duration-200"
                        />

                        {/* Animated packet stream particle along arc */}
                        <circle r={isSelected ? 3.5 : 2.5} fill="#A5B4FC">
                          <animateMotion
                            path={`M ${origin.x} ${origin.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`}
                            dur={
                              node.status === 'DEGRADED'
                                ? '4s'
                                : `${Math.max(1.2, node.latencyMs / 35).toFixed(1)}s`
                            }
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* -------------------------------------------------------------
                  REGIONAL HEATMAP HALOS (Signal Density & Connectivity Glow)
                  ------------------------------------------------------------- */}
              {showCoverageContours && (
                <g id="heatmap-halos" pointerEvents="none">
                  {filteredNodes.map(node => {
                    const pos =
                      displayMode === 'geo-map'
                        ? node.coordinates
                        : node.graphCoordinates;

                    const breathingSec = getLatencyBreathingDurationSec(node.latencyMs);

                    let glowGrad = 'url(#emerald-glow)';
                    let haloRadius = 46;

                    if (metricMode === 'strength') {
                      if (node.connectivityScore < 80) {
                        glowGrad = 'url(#rose-glow)';
                        haloRadius = 55;
                      } else if (node.connectivityScore < 95) {
                        glowGrad = 'url(#amber-glow)';
                        haloRadius = 50;
                      }
                    } else if (metricMode === 'latency') {
                      if (node.latencyMs > 100) {
                        glowGrad = 'url(#rose-glow)';
                        haloRadius = 60;
                      } else if (node.latencyMs > 45) {
                        glowGrad = 'url(#amber-glow)';
                        haloRadius = 52;
                      }
                    }

                    return (
                      <circle
                        key={`halo-${node.id}`}
                        cx={pos.x}
                        cy={pos.y}
                        r={haloRadius}
                        fill={glowGrad}
                      >
                        <animate
                          attributeName="r"
                          values={`${haloRadius * 0.9};${haloRadius * 1.14};${haloRadius * 0.9}`}
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.45;0.82;0.45"
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    );
                  })}
                </g>
              )}

              {/* -------------------------------------------------------------
                  CENTRAL WORM LEDGER HUB BEACON
                  ------------------------------------------------------------- */}
              <g
                id="central-hub-beacon"
                className="cursor-pointer"
                onClick={() => setSelectedNodeId(null)}
              >
                {(() => {
                  const hubPos =
                    displayMode === 'geo-map'
                      ? CENTRAL_LEDGER_HUB.coordinates
                      : CENTRAL_LEDGER_HUB.graphCoordinates;

                  return (
                    <>
                      {/* Pulse Wave */}
                      <circle
                        cx={hubPos.x}
                        cy={hubPos.y}
                        r="24"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="1.5"
                        opacity="0.4"
                      >
                        <animate
                          attributeName="r"
                          values="14;34;14"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0.1;0.6"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Hub Solid Core */}
                      <circle cx={hubPos.x} cy={hubPos.y} r="8" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx={hubPos.x} cy={hubPos.y} r="3" fill="#FFFFFF" />

                      {/* Text Label */}
                      <text
                        x={hubPos.x}
                        y={hubPos.y - 12}
                        textAnchor="middle"
                        fill="#A5B4FC"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="pointer-events-none drop-shadow-md"
                      >
                        SKANDA WORM HUB
                      </text>
                    </>
                  );
                })()}
              </g>

              {/* -------------------------------------------------------------
                  REGIONAL NODES & INTERACTIVE BEACONS
                  ------------------------------------------------------------- */}
              {/* -------------------------------------------------------------
                  REGIONAL NODES & INTERACTIVE BEACONS (With Latency-Proportional Breathing)
                  ------------------------------------------------------------- */}
              <g id="regional-interactive-nodes">
                {filteredNodes.map(node => {
                  const pos =
                    displayMode === 'geo-map'
                      ? node.coordinates
                      : node.graphCoordinates;

                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const nodeColor = getNodeColor(node);
                  const breathingSec = getLatencyBreathingDurationSec(node.latencyMs);
                  const breathingBpm = getLatencyBreathingBpm(breathingSec);

                  const handleNodeClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                    setExpandedNodeId(node.id);
                    setExpandedNodeOrigin({ x: pos.x, y: pos.y });
                    setHoveredNodeId(null);
                  };

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer group"
                      onClick={handleNodeClick}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      {/* Interactive Touch Target */}
                      <circle cx={pos.x} cy={pos.y} r="20" fill="transparent" />

                      {/* Continuous Subtle Breathing Aura: Pulse rate scales proportionally with latency */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 10 : 7}
                        fill={nodeColor}
                        opacity="0.25"
                        pointerEvents="none"
                      >
                        <animate
                          attributeName="r"
                          values={`${isSelected ? 8 : 6};${isSelected ? 18 : 13.5};${isSelected ? 8 : 6}`}
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.32;0.04;0.32"
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Pulsing ring for warning/degraded or selected node synced to latency frequency */}
                      {(isSelected || node.status !== 'OPTIMAL') && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isSelected ? 14 : 11}
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth="1.5"
                          opacity="0.75"
                        >
                          <animate
                            attributeName="r"
                            values="6;16;6"
                            dur={`${breathingSec}s`}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.9;0.1;0.9"
                            dur={`${breathingSec}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}

                      {/* Outer Ring with subtle breathing radius & stroke opacity */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 8 : 6}
                        fill="#0F172A"
                        stroke={nodeColor}
                        strokeWidth={isSelected ? 2.5 : 1.75}
                        className="transition-all duration-200"
                      >
                        <animate
                          attributeName="r"
                          values={`${(isSelected ? 8 : 6) * 0.92};${(isSelected ? 8 : 6) * 1.15};${(isSelected ? 8 : 6) * 0.92}`}
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          values="0.8;1.0;0.8"
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Core Center Dot with subtle breathing pulse */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 4 : 2.5}
                        fill={nodeColor}
                        className="transition-all duration-200"
                      >
                        <animate
                          attributeName="r"
                          values={`${(isSelected ? 4 : 2.5) * 0.85};${(isSelected ? 4 : 2.5) * 1.3};${(isSelected ? 4 : 2.5) * 0.85}`}
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="fill-opacity"
                          values="0.75;1.0;0.75"
                          dur={`${breathingSec}s`}
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Regional Node Tag / Label */}
                      <g className="transition-opacity duration-200">
                        <rect
                          x={pos.x + 8}
                          y={pos.y - 12}
                          width={node.code.length * 6.5 + 14}
                          height="16"
                          rx="4"
                          fill="#0F172A"
                          fillOpacity="0.85"
                          stroke={isSelected ? nodeColor : '#334155'}
                          strokeWidth="0.8"
                        />
                        <text
                          x={pos.x + 13}
                          y={pos.y - 1}
                          fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                          fontSize="8.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {node.code}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Floating Live Hover 'Quick Summary' Tooltip */}
            {hoveredNodeId && (
              (() => {
                const node = nodes.find(n => n.id === hoveredNodeId);
                if (!node) return null;

                const pos =
                  displayMode === 'geo-map'
                    ? node.coordinates
                    : node.graphCoordinates;

                const threatSummary = getRegionThreatSummary(node.id, threatEvents);
                const activeAlertsCount = Math.max(node.activeIncidents, threatSummary.activeAlertsCount);
                const breathingSec = getLatencyBreathingDurationSec(node.latencyMs);
                const breathingBpm = getLatencyBreathingBpm(breathingSec);

                // Viewport edge-aware adaptive positioning (viewBox: 1000 x 500)
                const leftPercent = (pos.x / 1000) * 100;
                const topPercent = (pos.y / 500) * 100;

                const isNearTop = pos.y < 165;
                const isNearLeft = pos.x < 220;
                const isNearRight = pos.x > 780;

                let transformClass = '-translate-x-1/2 -translate-y-full -translate-y-3';
                if (isNearTop) {
                  transformClass = isNearLeft
                    ? 'translate-x-2 translate-y-3'
                    : isNearRight
                    ? '-translate-x-full -translate-x-2 translate-y-3'
                    : '-translate-x-1/2 translate-y-3';
                } else {
                  transformClass = isNearLeft
                    ? 'translate-x-2 -translate-y-full -translate-y-3'
                    : isNearRight
                    ? '-translate-x-full -translate-x-2 -translate-y-full -translate-y-3'
                    : '-translate-x-1/2 -translate-y-full -translate-y-3';
                }

                return (
                  <div
                    className={`absolute pointer-events-none z-40 transform ${transformClass}`}
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`
                    }}
                  >
                    <div
                      className="w-80 p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700/90 shadow-2xl backdrop-blur-xl text-slate-200 font-sans space-y-2.5 transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none ring-1 ring-white/10"
                      style={{
                        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.85), 0 0 30px -5px rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      {/* Top Bar: Quick Summary Chip & Regional Identity */}
                      <div className="flex items-start justify-between border-b border-slate-800/90 pb-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold tracking-wider uppercase border border-indigo-500/30 flex items-center space-x-1">
                              <Zap className="w-2.5 h-2.5 text-indigo-400" />
                              <span>Quick Summary</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{node.code}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white tracking-tight leading-snug pt-0.5">
                            {node.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                            <span>{node.city}, {node.country}</span>
                            <span>•</span>
                            <span className="text-indigo-400 font-semibold">{node.cloudProvider} Edge</span>
                          </p>
                        </div>

                        {/* Node Gateway Status Pill */}
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider shrink-0 border ${
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

                      {/* SECTION 1: Active Alerts in this Region */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          activeAlertsCount > 0
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              activeAlertsCount > 0 ? 'bg-rose-500/20' : 'bg-emerald-500/20'
                            }`}
                          >
                            {activeAlertsCount > 0 ? (
                              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-[11px]">Active Alerts:</span>
                              <span
                                className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                                  activeAlertsCount > 0
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {activeAlertsCount} {activeAlertsCount === 1 ? 'Alert' : 'Alerts'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {activeAlertsCount > 0
                                ? threatSummary.criticalAlertsCount > 0
                                  ? `${threatSummary.criticalAlertsCount} Critical Breach Active • Mitigation Needed`
                                  : 'Elevated Latency Threshold Warning'
                                : 'All Perimeter Controls Clean • 0 Active Threats'}
                            </p>
                          </div>
                        </div>

                        {activeAlertsCount > 0 && (
                          <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 shrink-0">
                            ACTION REQ
                          </span>
                        )}
                      </div>

                      {/* SECTION 2: Most Recent Threat Detection Timestamp */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800/80 pb-1">
                          <div className="flex items-center space-x-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-300">
                              Most Recent Threat Detection
                            </span>
                          </div>
                          <span className="text-amber-400 font-bold text-[10px]">
                            {threatSummary.latestThreatTimeAgo}
                          </span>
                        </div>

                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-baseline justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Timestamp:</span>
                            <span className="text-white font-bold tracking-tight">
                              {threatSummary.latestThreatDisplayTime}{' '}
                              <span className="text-[9px] text-slate-400 font-normal">
                                ({threatSummary.latestThreatTimestamp.split('T')[0]})
                              </span>
                            </span>
                          </div>

                          <div className="pt-1 border-t border-slate-800/50">
                            <div className="text-[11px] font-medium text-slate-100 truncate">
                              {threatSummary.latestThreatTitle}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                              <span className="truncate max-w-[150px]">{threatSummary.latestThreatCategory}</span>
                              <div className="flex items-center space-x-1">
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold ${
                                    threatSummary.latestThreatSeverity === 'CRITICAL'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : threatSummary.latestThreatSeverity === 'HIGH'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : threatSummary.latestThreatSeverity === 'MEDIUM'
                                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  }`}
                                >
                                  {threatSummary.latestThreatSeverity}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                  {threatSummary.latestMitigationStatus.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: Live Telemetry & Breathing Pulse */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[9px]">Latency (RTT):</span>
                          <div className="flex items-baseline space-x-1">
                            <span className="text-indigo-300 font-bold text-xs">{node.latencyMs}ms</span>
                            <span className="text-[8.5px] text-cyan-400 flex items-center space-x-0.5 ml-auto">
                              <HeartPulse className="w-2.5 h-2.5 animate-pulse inline" />
                              <span>{breathingBpm} bpm</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[9px]">Packet Loss:</span>
                          <span
                            className={`font-bold text-xs ${
                              node.packetLossPercent > 1 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {node.packetLossPercent}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[9px]">Throughput:</span>
                          <span className="text-slate-300 font-bold">{node.throughputPktsMin} pkts/min</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[9px]">Health Score:</span>
                          <span className="text-emerald-400 font-bold">{node.connectivityScore}%</span>
                        </div>
                      </div>

                      {/* Footer Guidance */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                        <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>Click node to expand Detail Card</span>
                        </span>
                        <span className="text-slate-400 font-medium flex items-center space-x-0.5">
                          <span>Traffic &amp; Audit Logs</span>
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Morphing Expansion Detail Card Overlay */}
            <AnimatePresence>
              {expandedNodeId && (() => {
                const node = nodes.find(n => n.id === expandedNodeId);
                if (!node) return null;
                return (
                  <ConnectivityDetailCard
                    node={node}
                    originPos={expandedNodeOrigin}
                    threatEvents={threatEvents}
                    onClose={() => setExpandedNodeId(null)}
                    onSelectSensor={onSelectSensor}
                    onOpenThreatTimeline={() => {
                      setExpandedNodeId(null);
                      setSidePanelTab('threats');
                    }}
                  />
                );
              })()}
            </AnimatePresence>
          </div>

          {/* Bottom Map Legend */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center space-x-3 text-slate-400">
              <span className="font-semibold uppercase text-[10px]">Signal Health:</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Optimal (&gt;98%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Fair (80-97%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Degraded (&lt;80%)</span>
              </div>
            </div>

            {/* Breathing Animation Indicator */}
            <div className="flex items-center space-x-2 text-[10px]">
              <div className="flex items-center space-x-1 text-cyan-400 font-semibold">
                <HeartPulse className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
                <span>Node Breathing Pulse:</span>
              </div>
              <span className="text-slate-300">∝ Regional Traffic Latency</span>
              <span className="text-slate-500 hidden md:inline">
                (14ms ~ 4.5s pace | 250ms+ ~ 0.8s pace)
              </span>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            SIDE-PANEL: THREAT DETECTION TIMELINE & GATEWAY TELEMETRY
            ----------------------------------------------------------------- */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-950/70 p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
          {/* Side-Panel Tab Bar */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setSidePanelTab('threats')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition cursor-pointer flex items-center space-x-1.5 ${
                  sidePanelTab === 'threats'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>Threat Timeline</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-950 text-rose-300 font-black border border-rose-700/50">
                  Live
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSidePanelTab('telemetry')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition cursor-pointer flex items-center space-x-1.5 ${
                  sidePanelTab === 'telemetry'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Gateway Telemetry</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              {sidePanelTab === 'threats' ? 'SOC-2 Event Correlation' : `${activeSelectedNode?.code || 'Edge'}`}
            </span>
          </div>

          {/* TAB 1: THREAT DETECTION TIMELINE SIDE-PANEL */}
          {sidePanelTab === 'threats' ? (
            <div className="flex-1">
              <ThreatDetectionTimeline
                selectedNodeId={selectedNodeId}
                onSelectNode={nodeId => setSelectedNodeId(nodeId)}
                onSwitchToInspector={() => setSidePanelTab('telemetry')}
                threatEvents={threatEvents}
                onThreatEventsChange={setThreatEvents}
              />
            </div>
          ) : (
            /* TAB 2: REGIONAL GATEWAY INSPECTOR */
            <>
              {activeSelectedNode ? (
                <div className="space-y-4 flex-1">
                  {/* Active Threat Correlation Alert Banner */}
                  {activeSelectedNode.status !== 'OPTIMAL' && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center space-x-2 text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                        <span className="truncate">Security breach correlated with latency spike.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSidePanelTab('threats')}
                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition flex items-center space-x-1 shrink-0 ml-2"
                      >
                        <span>Timeline</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Node Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30 uppercase">
                          {activeSelectedNode.cloudProvider} Edge
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            activeSelectedNode.status === 'OPTIMAL'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : activeSelectedNode.status === 'FAIR'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {activeSelectedNode.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1.5 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{activeSelectedNode.name}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {activeSelectedNode.city}, {activeSelectedNode.country} • {activeSelectedNode.code}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-emerald-400">
                        {activeSelectedNode.connectivityScore}%
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Health Score</span>
                    </div>
                  </div>

                  {/* Node Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Round-Trip Latency</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-sm font-bold text-white">{activeSelectedNode.latencyMs}</span>
                        <span className="text-[10px] text-slate-400">ms</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1 font-mono ml-auto">
                          <HeartPulse className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                          <span>{getLatencyBreathingBpm(getLatencyBreathingDurationSec(activeSelectedNode.latencyMs))} bpm</span>
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 block">
                        Jitter: ±{activeSelectedNode.jitterMs}ms • Pulse: {getLatencyBreathingDurationSec(activeSelectedNode.latencyMs)}s/cycle
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Throughput Volume</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-sm font-bold text-white">
                          {activeSelectedNode.throughputPktsMin}
                        </span>
                        <span className="text-[10px] text-slate-400">p/min</span>
                      </div>
                      <span className="text-[9px] text-cyan-400 mt-1 block">
                        {activeSelectedNode.throughputBandwidthMbps} Mbps
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Packet Loss</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span
                          className={`text-sm font-bold ${
                            activeSelectedNode.packetLossPercent === 0
                              ? 'text-emerald-400'
                              : activeSelectedNode.packetLossPercent > 1
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {activeSelectedNode.packetLossPercent}%
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 block">0 Dropped Frames</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Active Incidents</span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span
                          className={`text-sm font-bold ${
                            activeSelectedNode.activeIncidents === 0
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {activeSelectedNode.activeIncidents} Active
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 block">SLA Conformant</span>
                    </div>
                  </div>

                  {/* Connected Compliance Sensors in this Region */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Connected Regional Sensors ({activeSelectedNode.connectedSensors.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSelectedNode.connectedSensors.map(sensor => (
                        <button
                          key={sensor}
                          type="button"
                          onClick={() => onSelectSensor?.(sensor)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white hover:border-indigo-500 transition cursor-pointer flex items-center space-x-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{sensor}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compliance & Sovereign Jurisdiction */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Sovereign Boundary:</span>
                      <span className="text-emerald-400 font-bold">Encrypted In-Transit</span>
                    </div>
                    <div className="text-slate-200 font-semibold truncate">
                      {activeSelectedNode.sovereignJurisdiction}
                    </div>
                    <div className="text-[9px] text-slate-500 pt-0.5 flex items-center justify-between">
                      <span>Audit Seal: {activeSelectedNode.auditSeal}</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>

                  {/* Simulated Ping Traceroute Console Output */}
                  {pingTestLogs.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-black/80 border border-slate-800 font-mono text-[10px] space-y-1 max-h-32 overflow-y-auto animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-0.5">
                        <span>SYNTHETIC TRACEROUTE LOG</span>
                        <span className="text-emerald-400">200 OK</span>
                      </div>
                      {pingTestLogs.map((line, idx) => (
                        <div key={idx} className="text-slate-300">
                          &gt; {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Select any regional gateway on the map to inspect telemetry health.</p>
                </div>
              )}

              {/* Action Trigger in Footer */}
              {activeSelectedNode && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pos =
                        displayMode === 'geo-map'
                          ? activeSelectedNode.coordinates
                          : activeSelectedNode.graphCoordinates;
                      setExpandedNodeOrigin(pos);
                      setExpandedNodeId(activeSelectedNode.id);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 border border-indigo-500/30"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand Detail Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTriggerNodePing(activeSelectedNode)}
                    disabled={isPingTesting}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isPingTesting ? 'animate-bounce text-amber-300' : ''}`} />
                    <span>{isPingTesting ? 'Pinging...' : `Ping ${activeSelectedNode.code}`}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
