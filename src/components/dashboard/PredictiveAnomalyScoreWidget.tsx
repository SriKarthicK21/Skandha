import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  Radio,
  RefreshCw,
  Info,
  TrendingUp,
  TrendingDown,
  Gauge,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Server
} from 'lucide-react';
import { RegionalNetworkNode } from './NetworkHealthHeatmap';
import { ThreatDetectionEvent, getRegionThreatSummary } from './ThreatDetectionTimeline';

export type RollingTimeWindow = '5m' | '15m' | '1h';

export interface TelemetrySample {
  timestamp: number;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  throughputPktsMin: number;
}

export interface PredictiveAnomalyBreakdown {
  score: number; // 0 - 100
  outageLikelihoodPercent: number; // 0 - 100
  riskBand: 'NOMINAL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  estimatedTimeToOutage: string;
  latencyDriftContribution: number; // 0 - 100
  packetLossContribution: number; // 0 - 100
  jitterContribution: number; // 0 - 100
  throughputContribution: number; // 0 - 100
  threatContribution: number; // 0 - 100
  trendDirection: 'RISING' | 'STABLE' | 'FALLING';
  recommendation: string;
  rollingMeanLatency: number;
  rollingMeanLoss: number;
  rollingJitterSigma: number;
}

interface PredictiveAnomalyScoreWidgetProps {
  node: RegionalNetworkNode;
  threatEvents: ThreatDetectionEvent[];
  currentLatency: number;
  currentThroughput: number;
  isLiveStreaming?: boolean;
  compactMode?: boolean;
  onNavigateTimeline?: () => void;
}

/**
 * Generate realistic rolling history buffer for a given node
 */
const generateInitialRollingBuffer = (
  node: RegionalNetworkNode,
  sampleCount: number = 15
): TelemetrySample[] => {
  const now = Date.now();
  const samples: TelemetrySample[] = [];
  const baseLat = node.latencyMs;
  const baseLoss = node.packetLossPercent;
  const baseJitter = node.jitterMs;
  const baseTp = node.throughputPktsMin;

  for (let i = sampleCount - 1; i >= 0; i--) {
    const timeOffsetMs = i * 2000;
    // Slight deterministic variance for historical baseline
    const noiseFactor = Math.sin(i * 0.7) * 0.15;
    samples.push({
      timestamp: now - timeOffsetMs,
      latencyMs: Math.max(5, Math.round(baseLat * (1 + noiseFactor * 0.5))),
      jitterMs: Math.max(1, Math.round(baseJitter * (1 + noiseFactor * 0.8))),
      packetLossPercent: Math.max(0, +(baseLoss + Math.max(0, noiseFactor * 0.6)).toFixed(1)),
      throughputPktsMin: Math.max(20, Math.round(baseTp * (1 + noiseFactor * 0.7)))
    });
  }
  return samples;
};

export const PredictiveAnomalyScoreWidget: React.FC<PredictiveAnomalyScoreWidgetProps> = ({
  node,
  threatEvents,
  currentLatency,
  currentThroughput,
  isLiveStreaming = true,
  compactMode = false,
  onNavigateTimeline
}) => {
  const [timeWindow, setTimeWindow] = useState<RollingTimeWindow>('5m');
  const [samples, setSamples] = useState<TelemetrySample[]>(() =>
    generateInitialRollingBuffer(node, 15)
  );
  const [isSpikeInjected, setIsSpikeInjected] = useState<boolean>(false);
  const [spikeCountdown, setSpikeCountdown] = useState<number>(0);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [scoreHistory, setScoreHistory] = useState<number[]>([12, 14, 13, 16, 15, 14, 18, 17]);

  // Rolling update when currentLatency or currentThroughput changes in real-time
  useEffect(() => {
    if (!isLiveStreaming) return;

    setSamples(prev => {
      const now = Date.now();
      const injectedLatencyMultiplier = isSpikeInjected ? 2.4 : 1.0;
      const injectedLossDelta = isSpikeInjected ? 4.2 : 0;
      const injectedJitterMultiplier = isSpikeInjected ? 3.5 : 1.0;

      const newSample: TelemetrySample = {
        timestamp: now,
        latencyMs: Math.round(currentLatency * injectedLatencyMultiplier),
        jitterMs: Math.round(node.jitterMs * injectedJitterMultiplier),
        packetLossPercent: +(node.packetLossPercent + injectedLossDelta).toFixed(1),
        throughputPktsMin: isSpikeInjected
          ? Math.round(currentThroughput * 0.45) // severe congestion drop
          : currentThroughput
      };

      const maxWindowSamples = timeWindow === '5m' ? 15 : timeWindow === '15m' ? 25 : 40;
      return [...prev.slice(-(maxWindowSamples - 1)), newSample];
    });
  }, [currentLatency, currentThroughput, isLiveStreaming, isSpikeInjected, timeWindow, node.jitterMs, node.packetLossPercent]);

  // Handle countdown for simulated anomaly spike
  useEffect(() => {
    if (!isSpikeInjected) return;
    setSpikeCountdown(12);
    const interval = setInterval(() => {
      setSpikeCountdown(prev => {
        if (prev <= 1) {
          setIsSpikeInjected(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSpikeInjected]);

  // Regional threat summary for security weighting
  const threatSummary = useMemo(
    () => getRegionThreatSummary(node.id, threatEvents),
    [node.id, threatEvents]
  );

  // Simple Rolling Anomaly & Outage Estimation Algorithm
  const breakdown: PredictiveAnomalyBreakdown = useMemo(() => {
    if (samples.length === 0) {
      return {
        score: 10,
        outageLikelihoodPercent: 10,
        riskBand: 'NOMINAL',
        estimatedTimeToOutage: '> 72h (Stable)',
        latencyDriftContribution: 8,
        packetLossContribution: 0,
        jitterContribution: 5,
        throughputContribution: 4,
        threatContribution: 0,
        trendDirection: 'STABLE',
        recommendation: 'Perimeter and routing links are nominal.',
        rollingMeanLatency: node.latencyMs,
        rollingMeanLoss: node.packetLossPercent,
        rollingJitterSigma: 1
      };
    }

    // 1. Mean & variance of latency over rolling window
    const latencies = samples.map(s => s.latencyMs);
    const meanLat = latencies.reduce((acc, l) => acc + l, 0) / latencies.length;
    const varianceLat =
      latencies.reduce((acc, l) => acc + Math.pow(l - meanLat, 2), 0) / latencies.length;
    const stdDevLat = Math.sqrt(varianceLat);

    const latestSample = samples[samples.length - 1];
    const baseBaseline = node.latencyMs;

    // Latency Drift Factor (0 - 100)
    // Measures how far current latency is above baseline plus rolling jitter penalty
    const latencyDriftRatio = (latestSample.latencyMs - baseBaseline) / Math.max(10, baseBaseline);
    const latencyDriftContribution = Math.min(
      100,
      Math.max(0, Math.round(latencyDriftRatio * 90 + (stdDevLat > 6 ? 15 : 0)))
    );

    // 2. Rolling Packet Loss Factor (0 - 100)
    // Loss is an exponential leading indicator of fiber cuts, buffer bloat, or DDoS
    const meanLoss =
      samples.reduce((acc, s) => acc + s.packetLossPercent, 0) / samples.length;
    const packetLossContribution = Math.min(
      100,
      Math.round(meanLoss * 24 + latestSample.packetLossPercent * 16)
    );

    // 3. Jitter Instability Factor (0 - 100)
    const jitters = samples.map(s => s.jitterMs);
    const meanJitter = jitters.reduce((acc, j) => acc + j, 0) / jitters.length;
    const varianceJitter =
      jitters.reduce((acc, j) => acc + Math.pow(j - meanJitter, 2), 0) / jitters.length;
    const stdDevJitter = Math.sqrt(varianceJitter);
    const jitterContribution = Math.min(
      100,
      Math.round((latestSample.jitterMs / 14) * 60 + stdDevJitter * 6)
    );

    // 4. Throughput Volatility Factor (0 - 100)
    // Sudden drops indicate congestion link saturation or blackholing
    const meanTp =
      samples.reduce((acc, s) => acc + s.throughputPktsMin, 0) / samples.length;
    const tpRatio = latestSample.throughputPktsMin / Math.max(1, meanTp);
    const throughputContribution = Math.min(
      100,
      Math.round(Math.abs(tpRatio - 1.0) * 80)
    );

    // 5. Threat Vector Factor (0 - 100)
    let threatContribution = 0;
    if (threatSummary.criticalAlertsCount > 0) {
      threatContribution += 45;
    }
    if (threatSummary.activeAlertsCount > 0) {
      threatContribution += 20;
    }
    if (node.status === 'DEGRADED') {
      threatContribution += 30;
    } else if (node.status === 'FAIR') {
      threatContribution += 12;
    }
    threatContribution = Math.min(100, threatContribution);

    // Composite Weighted Outage Likelihood:
    // w_lat = 0.28, w_loss = 0.32, w_jitter = 0.18, w_tp = 0.10, w_threat = 0.12
    const rawScore =
      0.28 * latencyDriftContribution +
      0.32 * packetLossContribution +
      0.18 * jitterContribution +
      0.10 * throughputContribution +
      0.12 * threatContribution;

    // Node status boundary enforcement
    const baseFloor =
      node.status === 'DEGRADED' ? 58 : node.status === 'FAIR' ? 26 : 5;
    const score = Math.min(100, Math.max(baseFloor, Math.round(rawScore)));

    // Categorization into risk bands
    let riskBand: 'NOMINAL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL' = 'NOMINAL';
    let estimatedTimeToOutage = '> 72h (Link Stable)';
    let recommendation = 'Nominal telemetry. Transit routes and SLA tolerances fully verified.';

    if (score >= 75) {
      riskBand = 'CRITICAL';
      estimatedTimeToOutage = '< 35 minutes (High Outage Probability)';
      recommendation =
        'CRITICAL: Pre-outage signature detected. Trigger automated BGP failover and isolate peering gateway immediately.';
    } else if (score >= 50) {
      riskBand = 'ELEVATED';
      estimatedTimeToOutage = '~ 2 to 6 hours (Degradation Imminent)';
      recommendation =
        'ELEVATED: Divert 40% ingress traffic to secondary Cloud Edge gateway. Monitor queue depths.';
    } else if (score >= 25) {
      riskBand = 'MODERATE';
      estimatedTimeToOutage = '~ 18 to 36 hours (Drift Watch)';
      recommendation =
        'MODERATE: Minor jitter divergence and latency drift observed. Maintain active watch.';
    }

    // Trend Direction from historical samples
    let trendDirection: 'RISING' | 'STABLE' | 'FALLING' = 'STABLE';
    if (samples.length >= 4) {
      const recentAvg =
        (samples[samples.length - 1].latencyMs + samples[samples.length - 2].latencyMs) / 2;
      const olderAvg =
        (samples[0].latencyMs + samples[1].latencyMs) / 2;
      if (recentAvg > olderAvg * 1.15) trendDirection = 'RISING';
      else if (recentAvg < olderAvg * 0.9) trendDirection = 'FALLING';
    }

    return {
      score,
      outageLikelihoodPercent: score,
      riskBand,
      estimatedTimeToOutage,
      latencyDriftContribution,
      packetLossContribution,
      jitterContribution,
      throughputContribution,
      threatContribution,
      trendDirection,
      recommendation,
      rollingMeanLatency: Math.round(meanLat),
      rollingMeanLoss: +meanLoss.toFixed(1),
      rollingJitterSigma: +stdDevJitter.toFixed(1)
    };
  }, [samples, node, threatSummary]);

  // Keep score history for trendline visualization
  useEffect(() => {
    setScoreHistory(prev => [...prev.slice(-9), breakdown.score]);
  }, [breakdown.score]);

  // SVG Gauge calculations
  // Semi-circle sweep from 180° to 0° (or -180° to 0°)
  // SVG ViewBox: 240 x 145. Arc radius = 80, Center = (120, 115)
  const radius = 78;
  const centerX = 120;
  const centerY = 110;
  // Circumference of semi-circle = PI * radius ≈ 245.04
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (breakdown.score / 100) * arcLength;

  // Gauge needle rotation angle from -90deg (0 score) to +90deg (100 score)
  const needleAngle = -90 + (breakdown.score / 100) * 180;

  // Dynamic status colors
  const getRiskColor = (band: typeof breakdown.riskBand) => {
    switch (band) {
      case 'CRITICAL':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          glow: 'rgba(244, 63, 94, 0.4)',
          stroke: '#f43f5e'
        };
      case 'ELEVATED':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          glow: 'rgba(245, 158, 11, 0.4)',
          stroke: '#f59e0b'
        };
      case 'MODERATE':
        return {
          text: 'text-sky-400',
          bg: 'bg-sky-500/15',
          border: 'border-sky-500/40',
          glow: 'rgba(56, 189, 248, 0.35)',
          stroke: '#38bdf8'
        };
      case 'NOMINAL':
      default:
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          glow: 'rgba(16, 185, 129, 0.35)',
          stroke: '#10b981'
        };
    }
  };

  const riskTheme = getRiskColor(breakdown.riskBand);

  return (
    <div
      id="predictive-anomaly-score-widget"
      className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800/90 shadow-xl space-y-4 relative overflow-hidden backdrop-blur-xl"
    >
      {/* Background ambient radial glow depending on anomaly score */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-20 transition-all duration-700"
        style={{ backgroundColor: riskTheme.stroke }}
      />

      {/* Widget Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Gauge className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <span>Predictive Anomaly Score</span>
              <span className="text-[10px] text-slate-400 font-normal">({node.code})</span>
            </h4>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider border ${riskTheme.bg} ${riskTheme.text} ${riskTheme.border}`}
            >
              {breakdown.riskBand} RISK
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Rolling statistical drift algorithm estimating pre-outage likelihood.
          </p>
        </div>

        {/* Action Controls: Window Selector & Simulation Toggle */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto shrink-0">
          {/* Time Window Tabs */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px] font-mono">
            {(['5m', '15m', '1h'] as RollingTimeWindow[]).map(win => (
              <button
                key={win}
                type="button"
                onClick={() => setTimeWindow(win)}
                className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
                  timeWindow === win
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Use ${win} rolling statistical window`}
              >
                {win}
              </button>
            ))}
          </div>

          {/* Test Simulation Button */}
          <button
            type="button"
            onClick={() => setIsSpikeInjected(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition flex items-center space-x-1 cursor-pointer ${
              isSpikeInjected
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
            title={isSpikeInjected ? 'Anomaly Spike Active' : 'Inject Simulated Telemetry Spike'}
          >
            <Zap className={`w-3 h-3 ${isSpikeInjected ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <span>{isSpikeInjected ? `Spiking (${spikeCountdown}s)` : 'Simulate Spike'}</span>
          </button>

          {/* Formula Info Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowFormulaModal(true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
            title="Inspect Predictive Rolling Algorithm Weights"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visual Display: Radial SVG Gauge & Core Prediction Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* LEFT COLUMN: Radial SVG Gauge with Animated Needle */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 relative">
          <div className="relative w-56 h-36 flex items-center justify-center">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 240 145"
            >
              <defs>
                {/* Multi-zone gradient for the gauge arc */}
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="35%" stopColor="#38bdf8" />
                  <stop offset="65%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>

                <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Arc Track (Semi-circle from 180° to 0°) */}
              <path
                d="M 42 110 A 78 78 0 0 1 198 110"
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Tick Marks for 0%, 25%, 50%, 75%, 100% */}
              {[
                { angle: 180, label: '0%' },
                { angle: 135, label: '25%' },
                { angle: 90, label: '50%' },
                { angle: 45, label: '75%' },
                { angle: 0, label: '100%' }
              ].map(tick => {
                const rad = (tick.angle * Math.PI) / 180;
                const x1 = centerX - Math.cos(rad) * 66;
                const y1 = centerY - Math.sin(rad) * 66;
                const x2 = centerX - Math.cos(rad) * 73;
                const y2 = centerY - Math.sin(rad) * 73;
                return (
                  <g key={tick.label}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* Colored Gauge Value Arc */}
              <path
                d="M 42 110 A 78 78 0 0 1 198 110"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                filter="url(#gaugeGlow)"
                style={{
                  transition: 'stroke-dashoffset 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              />

              {/* Center Hub Base */}
              <circle cx={centerX} cy={centerY} r="9" fill="#0f172a" stroke="#6366f1" strokeWidth="2.5" />
              <circle cx={centerX} cy={centerY} r="3" fill="#ffffff" />

              {/* Rotating Mechanical Needle */}
              <g
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Needle Body */}
                <polygon
                  points={`${centerX - 3.5},${centerY} ${centerX + 3.5},${centerY} ${centerX},${centerY - 68}`}
                  fill={riskTheme.stroke}
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.7))"
                />
                <circle cx={centerX} cy={centerY - 68} r="2.5" fill="#ffffff" />
              </g>

              {/* Scale Labels */}
              <text x="36" y="128" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                0 (Stable)
              </text>
              <text x="120" y="32" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                50 (Warning)
              </text>
              <text x="204" y="128" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                100 (Outage)
              </text>
            </svg>

            {/* Score Overlay inside the Needle Base */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <div className="flex items-baseline space-x-1">
                <span
                  className={`text-3xl font-black font-mono tracking-tight ${riskTheme.text}`}
                  style={{ textShadow: `0 0 16px ${riskTheme.glow}` }}
                >
                  {breakdown.score}
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">/ 100</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                Anomaly Index
              </span>
            </div>
          </div>

          {/* Mini Sparkline History Under Gauge */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span>Trend:</span>
              <span
                className={`font-bold flex items-center space-x-0.5 ${
                  breakdown.trendDirection === 'RISING'
                    ? 'text-rose-400'
                    : breakdown.trendDirection === 'FALLING'
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {breakdown.trendDirection === 'RISING' ? (
                  <TrendingUp className="w-3 h-3 text-rose-400" />
                ) : breakdown.trendDirection === 'FALLING' ? (
                  <TrendingDown className="w-3 h-3 text-emerald-400" />
                ) : null}
                <span>{breakdown.trendDirection}</span>
              </span>
            </div>

            {/* Mini bars for recent score history */}
            <div className="flex items-end space-x-1 h-4">
              {scoreHistory.map((val, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-t transition-all duration-300 ${
                    val >= 75
                      ? 'bg-rose-500'
                      : val >= 50
                      ? 'bg-amber-500'
                      : val >= 25
                      ? 'bg-sky-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ height: `${Math.max(20, (val / 100) * 100)}%` }}
                  title={`T-${scoreHistory.length - idx}: ${val}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Predictive Outage Likelihood & Time to Outage */}
        <div className="md:col-span-6 space-y-2.5">
          {/* Outage Likelihood Card */}
          <div
            className={`p-3 rounded-xl border transition-colors ${riskTheme.bg} ${riskTheme.border}`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300 font-bold uppercase">Estimated Outage Likelihood</span>
              <span className={`font-mono font-bold text-sm ${riskTheme.text}`}>
                {breakdown.outageLikelihoodPercent}%
              </span>
            </div>

            <div className="w-full bg-slate-950/80 rounded-full h-2 mt-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.score >= 75
                    ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                    : breakdown.score >= 50
                    ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                    : breakdown.score >= 25
                    ? 'bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.7)]'
                    : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                }`}
                style={{ width: `${breakdown.outageLikelihoodPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Est. Window:</span>
              </span>
              <span className="font-bold text-white tracking-tight">{breakdown.estimatedTimeToOutage}</span>
            </div>
          </div>

          {/* Actionable Engineering Recommendation */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
              <Server className="w-3 h-3 text-indigo-400" />
              <span>SRE Mitigation Advisory</span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {breakdown.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Algorithmic Breakdown Factors Grid */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="font-bold uppercase text-slate-300">
            Rolling Algorithmic Factor Decomposition ({timeWindow} Window)
          </span>
          <span>5-Parameter Weighted Matrix</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
          {/* Factor 1: Latency Drift */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Latency Drift</span>
              <span className="text-[9px] text-indigo-400 font-bold">28% wt</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-white font-bold">{breakdown.rollingMeanLatency}ms avg</span>
              <span
                className={`font-bold ${
                  breakdown.latencyDriftContribution > 50 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                +{breakdown.latencyDriftContribution}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.latencyDriftContribution}%` }}
              />
            </div>
          </div>

          {/* Factor 2: Packet Loss Penalty */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Packet Loss</span>
              <span className="text-[9px] text-indigo-400 font-bold">32% wt</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-white font-bold">{breakdown.rollingMeanLoss}%</span>
              <span
                className={`font-bold ${
                  breakdown.packetLossContribution > 30 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {breakdown.packetLossContribution} pts
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.packetLossContribution}%` }}
              />
            </div>
          </div>

          {/* Factor 3: Jitter Instability */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Jitter Flutter</span>
              <span className="text-[9px] text-indigo-400 font-bold">18% wt</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-white font-bold">±{breakdown.rollingJitterSigma}ms σ</span>
              <span
                className={`font-bold ${
                  breakdown.jitterContribution > 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {breakdown.jitterContribution} pts
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.jitterContribution}%` }}
              />
            </div>
          </div>

          {/* Factor 4: Throughput Volatility */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Throughput Flux</span>
              <span className="text-[9px] text-indigo-400 font-bold">10% wt</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-white font-bold">{currentThroughput} p/m</span>
              <span
                className={`font-bold ${
                  breakdown.throughputContribution > 40 ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {breakdown.throughputContribution} pts
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.throughputContribution}%` }}
              />
            </div>
          </div>

          {/* Factor 5: Security Threat Vector */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Threat Vector</span>
              <span className="text-[9px] text-indigo-400 font-bold">12% wt</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-white font-bold">
                {threatSummary.activeAlertsCount} active
              </span>
              <span
                className={`font-bold ${
                  breakdown.threatContribution > 30 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {breakdown.threatContribution} pts
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.threatContribution}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Details Modal Dialog */}
      <AnimatePresence>
        {showFormulaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowFormulaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 font-sans space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-white text-sm">
                    Predictive Anomaly Scoring Methodology
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 text-[11px]">
                  <code>
                    Score = 0.28·Z(Latency) + 0.32·F(PacketLoss) + 0.18·F(Jitter) +
                    0.10·F(Throughput) + 0.12·F(Threats)
                  </code>
                </div>

                <p className="font-sans text-xs text-slate-400">
                  The rolling algorithm computes statistical divergence over a rolling sliding window ({timeWindow}):
                </p>

                <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300 font-sans">
                  <li>
                    <strong className="text-white font-mono">Z(Latency):</strong> Evaluates RTT delta against the regional baseline ($\Delta L / L_0$) weighted by standard deviation ($\sigma_L$).
                  </li>
                  <li>
                    <strong className="text-white font-mono">F(PacketLoss):</strong> Exponential multiplier for packet drops (&gt;1% is strongly correlated with imminent BGP routing collapses).
                  </li>
                  <li>
                    <strong className="text-white font-mono">F(Jitter):</strong> Route flutter and transit buffer queue saturation index.
                  </li>
                  <li>
                    <strong className="text-white font-mono">F(Throughput):</strong> Divergence between ingress packet rates and moving window baselines.
                  </li>
                  <li>
                    <strong className="text-white font-mono">F(Threats):</strong> Real-time MITM/DDoS/TLS posture indicators actively detected in this sovereign perimeter.
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
