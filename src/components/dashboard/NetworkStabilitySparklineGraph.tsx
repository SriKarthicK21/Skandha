import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { RegionalNetworkNode } from './NetworkHealthHeatmap';

export interface StabilityDataPoint {
  minuteOffset: number; // -60 to 0 (where 0 is current "Now")
  timestamp: number; // Unix epoch ms
  latencyMs: number;
  jitterMs: number;
  packetVariation: number; // standard deviation delta
  status: 'STABLE' | 'NOMINAL' | 'ELEVATED_JITTER' | 'SPIKE';
}

export type SparklineViewMode = 'combined' | 'latency' | 'jitter';

interface NetworkStabilitySparklineGraphProps {
  node: RegionalNetworkNode;
  isLiveStreaming?: boolean;
  liveLatency?: number;
  className?: string;
}

/**
 * Generates a realistic deterministic 60-minute historical telemetry series
 * with 1 sample per minute (-60m to 0m)
 */
export const generate60MinuteStabilityData = (
  node: RegionalNetworkNode,
  liveLatency?: number
): StabilityDataPoint[] => {
  const now = Date.now();
  const points: StabilityDataPoint[] = [];
  const baseLat = liveLatency && liveLatency > 0 ? liveLatency : node.latencyMs;
  const baseJitter = node.jitterMs;
  const hasIncident = (node.activeIncidents ?? 0) > 0 || node.packetLossPercent > 0.5;

  // Use node id string as deterministic seed
  const seed = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let minute = 60; minute >= 0; minute--) {
    const timestamp = now - minute * 60 * 1000;
    const t = (60 - minute); // 0 to 60

    // Multi-frequency wave pattern to simulate real-world internet transit fluctuations
    const wave1 = Math.sin((t + seed) * 0.18) * 0.12;
    const wave2 = Math.cos((t * 0.45 + seed * 0.1)) * 0.08;
    const wave3 = Math.sin((t * 0.08)) * 0.05;
    
    // Occasional micro jitter spikes based on network incidents or deterministic intervals
    let spikeMultiplier = 1;
    if (hasIncident && (minute === 18 || minute === 19 || minute === 42)) {
      spikeMultiplier = 2.4;
    } else if (minute === 31) {
      spikeMultiplier = 1.6;
    }

    const calculatedLatency = Math.max(
      4,
      Math.round((baseLat * (1 + wave1 + wave2 + wave3) * (minute === 18 && hasIncident ? 1.4 : 1)) * 10) / 10
    );

    const calculatedJitter = Math.max(
      0.4,
      Math.round((baseJitter * (1 + wave2 * 1.5 + wave1 * 0.8) * spikeMultiplier) * 10) / 10
    );

    const packetVariation = Math.round((calculatedJitter / Math.max(calculatedLatency, 1)) * 1000) / 10;

    let status: StabilityDataPoint['status'] = 'STABLE';
    if (calculatedJitter > 6.0 || calculatedLatency > baseLat * 1.35) {
      status = 'SPIKE';
    } else if (calculatedJitter > 3.5 || calculatedLatency > baseLat * 1.18) {
      status = 'ELEVATED_JITTER';
    } else if (calculatedJitter > 2.0) {
      status = 'NOMINAL';
    }

    points.push({
      minuteOffset: -minute,
      timestamp,
      latencyMs: minute === 0 && liveLatency ? liveLatency : calculatedLatency,
      jitterMs: calculatedJitter,
      packetVariation,
      status
    });
  }

  return points;
};

export const NetworkStabilitySparklineGraph: React.FC<NetworkStabilitySparklineGraphProps> = ({
  node,
  isLiveStreaming = true,
  liveLatency,
  className = ''
}) => {
  const [dataPoints, setDataPoints] = useState<StabilityDataPoint[]>(() =>
    generate60MinuteStabilityData(node, liveLatency)
  );

  const [viewMode, setViewMode] = useState<SparklineViewMode>('combined');
  const [hoveredPoint, setHoveredPoint] = useState<StabilityDataPoint | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Update on node change
  useEffect(() => {
    setDataPoints(generate60MinuteStabilityData(node, liveLatency));
    setHoveredPoint(null);
  }, [node.id]);

  // Live streaming ticker: every 3 seconds, inject a live jitter/latency jitter drift
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setDataPoints(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const now = Date.now();
        const latDelta = (Math.random() - 0.49) * 1.6;
        const jitterDelta = (Math.random() - 0.48) * 0.6;

        const newLat = Math.max(4, Math.round((last.latencyMs + latDelta) * 10) / 10);
        const newJitter = Math.max(0.4, Math.round((last.jitterMs + jitterDelta) * 10) / 10);

        let status: StabilityDataPoint['status'] = 'STABLE';
        if (newJitter > 6.0) status = 'SPIKE';
        else if (newJitter > 3.5) status = 'ELEVATED_JITTER';
        else if (newJitter > 2.0) status = 'NOMINAL';

        const newPoint: StabilityDataPoint = {
          minuteOffset: 0,
          timestamp: now,
          latencyMs: liveLatency ?? newLat,
          jitterMs: newJitter,
          packetVariation: Math.round((newJitter / Math.max(newLat, 1)) * 1000) / 10,
          status
        };

        // Shift sliding window: recompute minute offsets for 61 samples (-60m to 0m)
        const updated = [...prev.slice(1), newPoint].map((pt, idx, arr) => ({
          ...pt,
          minuteOffset: idx - (arr.length - 1)
        }));

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, liveLatency]);

  // Summary statistics across 60 minutes
  const stats = useMemo(() => {
    if (dataPoints.length === 0) {
      return {
        meanLatency: node.latencyMs,
        minLatency: node.latencyMs,
        maxLatency: node.latencyMs,
        p95Latency: node.latencyMs,
        meanJitter: node.jitterMs,
        maxJitter: node.jitterMs,
        stabilityScore: 98.5,
        stabilityGrade: 'A+'
      };
    }

    const latencies = dataPoints.map(d => d.latencyMs).sort((a, b) => a - b);
    const jitters = dataPoints.map(d => d.jitterMs);

    const sumLat = latencies.reduce((acc, v) => acc + v, 0);
    const meanLatency = Math.round((sumLat / latencies.length) * 10) / 10;
    const minLatency = latencies[0];
    const maxLatency = latencies[latencies.length - 1];

    // P95 Latency
    const p95Index = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95));
    const p95Latency = latencies[p95Index];

    const sumJitter = jitters.reduce((acc, v) => acc + v, 0);
    const meanJitter = Math.round((sumJitter / jitters.length) * 10) / 10;
    const maxJitter = Math.max(...jitters);

    // Calculate stability index score (0-100%)
    // Factors: jitter variance, distance from nominal, spike occurrences
    const jitterPenalty = Math.min(30, meanJitter * 3.5);
    const maxJitterPenalty = Math.min(25, (maxJitter - meanJitter) * 2.2);
    const spikeCount = dataPoints.filter(d => d.status === 'SPIKE').length;
    const spikePenalty = Math.min(20, spikeCount * 4);

    const stabilityScore = Math.max(
      50,
      Math.round((100 - jitterPenalty - maxJitterPenalty - spikePenalty) * 10) / 10
    );

    let stabilityGrade = 'A+';
    if (stabilityScore < 75) stabilityGrade = 'C';
    else if (stabilityScore < 85) stabilityGrade = 'B';
    else if (stabilityScore < 95) stabilityGrade = 'A';

    return {
      meanLatency,
      minLatency,
      maxLatency,
      p95Latency,
      meanJitter,
      maxJitter,
      stabilityScore,
      stabilityGrade
    };
  }, [dataPoints, node.latencyMs, node.jitterMs]);

  // SVG dimensions and coordinate mapping
  const graphWidth = 600;
  const graphHeight = 160;
  const padding = { top: 20, right: 36, bottom: 26, left: 36 };

  const innerWidth = graphWidth - padding.left - padding.right;
  const innerHeight = graphHeight - padding.top - padding.bottom;

  // Latency bounds
  const minLatBound = Math.max(0, Math.floor(stats.minLatency * 0.85));
  const maxLatBound = Math.ceil(Math.max(stats.maxLatency * 1.15, stats.meanLatency + 5));

  // Jitter bounds
  const minJitterBound = 0;
  const maxJitterBound = Math.ceil(Math.max(stats.maxJitter * 1.3, 6));

  // Coordinate scales
  const getX = (index: number) => {
    return padding.left + (index / (dataPoints.length - 1)) * innerWidth;
  };

  const getLatencyY = (val: number) => {
    const ratio = (val - minLatBound) / (maxLatBound - minLatBound || 1);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const getJitterY = (val: number) => {
    const ratio = (val - minJitterBound) / (maxJitterBound - minJitterBound || 1);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  // Build SVG Path strings
  const latencyPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints.reduce((acc, pt, idx) => {
      const x = getX(idx);
      const y = getLatencyY(pt.latencyMs);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [dataPoints, minLatBound, maxLatBound]);

  const latencyArea = useMemo(() => {
    if (dataPoints.length === 0) return '';
    const bottomY = padding.top + innerHeight;
    const firstX = getX(0);
    const lastX = getX(dataPoints.length - 1);
    return `${latencyPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [latencyPath, dataPoints.length]);

  const jitterPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints.reduce((acc, pt, idx) => {
      const x = getX(idx);
      const y = getJitterY(pt.jitterMs);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [dataPoints, minJitterBound, maxJitterBound]);

  const jitterArea = useMemo(() => {
    if (dataPoints.length === 0) return '';
    const bottomY = padding.top + innerHeight;
    const firstX = getX(0);
    const lastX = getX(dataPoints.length - 1);
    return `${jitterPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [jitterPath, dataPoints.length]);

  // Mouse interaction for crosshair scrub
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || dataPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert to SVG viewBox scale
    const svgX = (clientX / rect.width) * graphWidth;
    const clampedX = Math.max(padding.left, Math.min(padding.left + innerWidth, svgX));

    const normalizedPos = (clampedX - padding.left) / innerWidth;
    const index = Math.round(normalizedPos * (dataPoints.length - 1));
    const targetPoint = dataPoints[Math.max(0, Math.min(dataPoints.length - 1, index))];

    if (targetPoint) {
      setHoveredPoint(targetPoint);
      setHoverPosition({ x: clampedX, y: clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverPosition(null);
  };

  const latestPoint = dataPoints[dataPoints.length - 1] ?? {
    latencyMs: node.latencyMs,
    jitterMs: node.jitterMs
  };

  return (
    <div
      id={`network-stability-sparkline-${node.id}`}
      className={`p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 shadow-sm space-y-3 font-mono ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              Real-Time Jitter &amp; Latency Sparkline
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-mono font-semibold">
              60m Rolling Window
            </span>
            {isLiveStreaming && (
              <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Feed</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Microsecond jitter packet dispersion and RTT telemetry for <strong className="text-slate-200">{node.name}</strong> ({node.code})
          </p>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('combined')}
            className={`px-2 py-1 rounded cursor-pointer transition flex items-center space-x-1.5 ${
              viewMode === 'combined'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            <span>Combined</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('latency')}
            className={`px-2 py-1 rounded cursor-pointer transition flex items-center space-x-1.5 ${
              viewMode === 'latency'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Latency (RTT)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('jitter')}
            className={`px-2 py-1 rounded cursor-pointer transition flex items-center space-x-1.5 ${
              viewMode === 'jitter'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Jitter (±ms)</span>
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {/* Current RTT Latency */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase block">Current Latency</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-bold text-cyan-400">{latestPoint.latencyMs}</span>
            <span className="text-[10px] text-slate-400">ms</span>
            <span className="text-[9px] text-slate-500">
              ({latestPoint.latencyMs >= stats.meanLatency ? '+' : ''}
              {(latestPoint.latencyMs - stats.meanLatency).toFixed(1)}ms)
            </span>
          </div>
          <span className="text-[9px] text-slate-500 block">Baseline: {stats.meanLatency}ms</span>
        </div>

        {/* Current Jitter */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase block">Packet Jitter</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-bold text-amber-400">±{latestPoint.jitterMs}</span>
            <span className="text-[10px] text-slate-400">ms</span>
          </div>
          <span className="text-[9px] text-slate-500 block">
            {latestPoint.jitterMs <= 2.5 ? 'Nominal Variation' : 'Elevated Jitter'}
          </span>
        </div>

        {/* 60m P95 Latency */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase block">60m P95 Latency</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-bold text-indigo-300">{stats.p95Latency}</span>
            <span className="text-[10px] text-slate-400">ms</span>
          </div>
          <span className="text-[9px] text-slate-500 block">Peak: {stats.maxLatency}ms</span>
        </div>

        {/* 60m Peak Jitter Spike */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase block">60m Peak Jitter</span>
          <div className="flex items-baseline space-x-1.5">
            <span
              className={`text-base font-bold ${
                stats.maxJitter > 5 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              ±{stats.maxJitter}
            </span>
            <span className="text-[10px] text-slate-400">ms</span>
          </div>
          <span className="text-[9px] text-slate-500 block">Mean: ±{stats.meanJitter}ms</span>
        </div>

        {/* Network Stability Index Score */}
        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase block">Stability Index</span>
          <div className="flex items-baseline space-x-1.5">
            <span
              className={`text-base font-bold ${
                stats.stabilityScore >= 90
                  ? 'text-emerald-400'
                  : stats.stabilityScore >= 80
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {stats.stabilityScore}%
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-800/40">
              {stats.stabilityGrade}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 block">SLA Threshold &gt; 90%</span>
        </div>
      </div>

      {/* The Interactive SVG Sparkline Canvas */}
      <div className="relative rounded-lg bg-slate-950/90 border border-slate-800/90 p-2 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className="w-full h-44 sm:h-48 cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Latency Gradient Fill */}
            <linearGradient id={`latGrad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
            </linearGradient>

            {/* Jitter Gradient Fill */}
            <linearGradient id={`jitterGrad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            {/* Grid Pattern */}
            <pattern id={`gridPattern-${node.id}`} width="50" height="25" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
            </pattern>
          </defs>

          {/* Background Grid Lines */}
          <rect
            x={padding.left}
            y={padding.top}
            width={innerWidth}
            height={innerHeight}
            fill={`url(#gridPattern-${node.id})`}
          />

          {/* Baseline Average Latency Reference Line */}
          {(viewMode === 'combined' || viewMode === 'latency') && (
            <g>
              <line
                x1={padding.left}
                y1={getLatencyY(stats.meanLatency)}
                x2={padding.left + innerWidth}
                y2={getLatencyY(stats.meanLatency)}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={padding.left + 6}
                y={getLatencyY(stats.meanLatency) - 4}
                fill="#818cf8"
                fontSize="8"
                fontFamily="monospace"
              >
                Mean Latency: {stats.meanLatency}ms
              </text>
            </g>
          )}

          {/* SLA Threshold for Jitter (±5.0ms) */}
          {(viewMode === 'combined' || viewMode === 'jitter') && maxJitterBound >= 5 && (
            <g>
              <line
                x1={padding.left}
                y1={getJitterY(5.0)}
                x2={padding.left + innerWidth}
                y2={getJitterY(5.0)}
                stroke="#f43f5e"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.55"
              />
              <text
                x={padding.left + innerWidth - 75}
                y={getJitterY(5.0) - 3}
                fill="#f43f5e"
                fontSize="7.5"
                fontFamily="monospace"
              >
                SLA Cap: ±5.0ms
              </text>
            </g>
          )}

          {/* LATENCY SPARKLINE (Cyan) */}
          {(viewMode === 'combined' || viewMode === 'latency') && (
            <g>
              <path d={latencyArea} fill={`url(#latGrad-${node.id})`} />
              <path
                d={latencyPath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* JITTER SPARKLINE (Amber) */}
          {(viewMode === 'combined' || viewMode === 'jitter') && (
            <g>
              <path d={jitterArea} fill={`url(#jitterGrad-${node.id})`} />
              <path
                d={jitterPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={viewMode === 'combined' ? 0.9 : 1}
              />
            </g>
          )}

          {/* Latest Point Indicator with Pulse Effect */}
          {dataPoints.length > 0 && (
            <g>
              {(viewMode === 'combined' || viewMode === 'latency') && (
                <g>
                  <circle
                    cx={getX(dataPoints.length - 1)}
                    cy={getLatencyY(latestPoint.latencyMs)}
                    r="4.5"
                    fill="#22d3ee"
                    className="animate-ping opacity-60"
                  />
                  <circle
                    cx={getX(dataPoints.length - 1)}
                    cy={getLatencyY(latestPoint.latencyMs)}
                    r="3.5"
                    fill="#22d3ee"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {(viewMode === 'combined' || viewMode === 'jitter') && (
                <g>
                  <circle
                    cx={getX(dataPoints.length - 1)}
                    cy={getJitterY(latestPoint.jitterMs)}
                    r="3"
                    fill="#f59e0b"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </g>
          )}

          {/* Left Y-Axis Scale Marks (Latency in ms) */}
          {(viewMode === 'combined' || viewMode === 'latency') && (
            <g>
              <text
                x={padding.left - 6}
                y={padding.top + 8}
                textAnchor="end"
                fill="#22d3ee"
                fontSize="8"
                fontFamily="monospace"
              >
                {maxLatBound}ms
              </text>
              <text
                x={padding.left - 6}
                y={padding.top + innerHeight}
                textAnchor="end"
                fill="#22d3ee"
                fontSize="8"
                fontFamily="monospace"
              >
                {minLatBound}ms
              </text>
            </g>
          )}

          {/* Right Y-Axis Scale Marks (Jitter in ±ms) */}
          {(viewMode === 'combined' || viewMode === 'jitter') && (
            <g>
              <text
                x={padding.left + innerWidth + 6}
                y={padding.top + 8}
                textAnchor="start"
                fill="#f59e0b"
                fontSize="8"
                fontFamily="monospace"
              >
                ±{maxJitterBound}ms
              </text>
              <text
                x={padding.left + innerWidth + 6}
                y={padding.top + innerHeight}
                textAnchor="start"
                fill="#f59e0b"
                fontSize="8"
                fontFamily="monospace"
              >
                ±0ms
              </text>
            </g>
          )}

          {/* X-Axis Time Labels (-60m, -45m, -30m, -15m, Now) */}
          {[-60, -45, -30, -15, 0].map(minuteOffset => {
            // Fraction from -60 (0.0) to 0 (1.0)
            const fraction = (minuteOffset + 60) / 60;
            const x = padding.left + fraction * innerWidth;
            const label = minuteOffset === 0 ? 'Now' : `${minuteOffset}m`;
            return (
              <g key={minuteOffset}>
                <line
                  x1={x}
                  y1={padding.top + innerHeight}
                  x2={x}
                  y2={padding.top + innerHeight + 4}
                  stroke="#475569"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 14}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Interactive Scrubbing Crosshair Line */}
          {hoveredPoint && hoverPosition && (
            <g>
              <line
                x1={hoverPosition.x}
                y1={padding.top}
                x2={hoverPosition.x}
                y2={padding.top + innerHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />

              {/* Dot on Latency */}
              {(viewMode === 'combined' || viewMode === 'latency') && (
                <circle
                  cx={hoverPosition.x}
                  cy={getLatencyY(hoveredPoint.latencyMs)}
                  r="4"
                  fill="#22d3ee"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}

              {/* Dot on Jitter */}
              {(viewMode === 'combined' || viewMode === 'jitter') && (
                <circle
                  cx={hoverPosition.x}
                  cy={getJitterY(hoveredPoint.jitterMs)}
                  r="3.5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}
        </svg>

        {/* Hover Crosshair Tooltip */}
        {hoveredPoint && hoverPosition && (
          <div
            className="absolute z-20 pointer-events-none p-2 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-[10px] font-mono text-white space-y-1 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoverPosition.x / graphWidth) * 100}%`,
              top: `${Math.max(16, hoverPosition.y - 12)}px`
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
              <span className="font-bold text-slate-300">
                {hoveredPoint.minuteOffset === 0 ? 'Current Time (Now)' : `${hoveredPoint.minuteOffset} min ago`}
              </span>
              <span
                className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                  hoveredPoint.status === 'SPIKE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : hoveredPoint.status === 'ELEVATED_JITTER'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {hoveredPoint.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px]">
              <div className="flex items-center space-x-1 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Latency: {hoveredPoint.latencyMs} ms</span>
              </div>

              <div className="flex items-center space-x-1 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Jitter: ±{hoveredPoint.jitterMs} ms</span>
              </div>

              <div className="text-slate-400 col-span-2 text-[8.5px] pt-0.5">
                Variance: {hoveredPoint.packetVariation}% packet delay delta
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend and Network Stability Assessment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 pt-1">
        {/* Legend */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 rounded bg-cyan-400" />
            <span className="text-slate-300 font-semibold">RTT Latency (ms)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 rounded bg-amber-400" />
            <span className="text-slate-300 font-semibold">Packet Jitter (±ms)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 border-t border-dashed border-indigo-400" />
            <span className="text-slate-400">Mean Baseline</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 border-t border-dashed border-rose-400" />
            <span className="text-slate-400">Jitter SLA (±5ms)</span>
          </div>
        </div>

        {/* Network Stability Summary Assessment */}
        <div className="flex items-center space-x-1.5 text-slate-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>
            Stability SLA: <strong className="text-emerald-400">99.8% nominal</strong> transit over 60m
          </span>
        </div>
      </div>
    </div>
  );
};
