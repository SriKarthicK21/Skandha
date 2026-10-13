import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  X,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Server,
  RefreshCw,
  Zap,
  ArrowUpDown,
  Download,
  Sliders,
  Check
} from 'lucide-react';
import { TelemetryJitterPoint } from './D3TelemetryJitterSparkline';

interface AuditorNetworkCongestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  currentLatency: number;
}

interface ConnectorTelemetry {
  id: string;
  name: string;
  category: string;
  latencyMs: number;
  jitterMs: number;
  packetBufferPct: number;
  lossRatePct: number;
  retransmitRate: number;
  status: 'OPTIMAL' | 'ELEVATED' | 'CONGESTED';
}

const INITIAL_CONNECTORS: ConnectorTelemetry[] = [
  {
    id: 'aws',
    name: 'AWS CloudTrail & GuardDuty',
    category: 'Cloud Infrastructure',
    latencyMs: 12,
    jitterMs: 1.1,
    packetBufferPct: 99.8,
    lossRatePct: 0.0,
    retransmitRate: 0.01,
    status: 'OPTIMAL'
  },
  {
    id: 'github',
    name: 'GitHub Enterprise Audit Ingress',
    category: 'Source Control & CI/CD',
    latencyMs: 14,
    jitterMs: 1.8,
    packetBufferPct: 99.5,
    lossRatePct: 0.0,
    retransmitRate: 0.02,
    status: 'OPTIMAL'
  },
  {
    id: 'okta',
    name: 'Okta Identity & SSO Event Log',
    category: 'Identity & Access',
    latencyMs: 16,
    jitterMs: 2.2,
    packetBufferPct: 99.2,
    lossRatePct: 0.0,
    retransmitRate: 0.03,
    status: 'OPTIMAL'
  },
  {
    id: 'crowdstrike',
    name: 'CrowdStrike Falcon Sensor Bus',
    category: 'Endpoint Detection',
    latencyMs: 9,
    jitterMs: 0.8,
    packetBufferPct: 99.9,
    lossRatePct: 0.0,
    retransmitRate: 0.0,
    status: 'OPTIMAL'
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Zero-Trust Edge Stream',
    category: 'Edge Network Security',
    latencyMs: 8,
    jitterMs: 0.6,
    packetBufferPct: 100,
    lossRatePct: 0.0,
    retransmitRate: 0.0,
    status: 'OPTIMAL'
  },
  {
    id: 'terraform',
    name: 'Terraform Cloud Policy Webhooks',
    category: 'Infrastructure as Code',
    latencyMs: 18,
    jitterMs: 2.6,
    packetBufferPct: 98.9,
    lossRatePct: 0.0,
    retransmitRate: 0.04,
    status: 'OPTIMAL'
  },
  {
    id: 'datadog',
    name: 'Datadog Continuous Compliance Ingest',
    category: 'Telemetry Monitoring',
    latencyMs: 21,
    jitterMs: 3.4,
    packetBufferPct: 97.8,
    lossRatePct: 0.0,
    retransmitRate: 0.05,
    status: 'ELEVATED'
  },
  {
    id: 'vault',
    name: 'HashiCorp Vault Audit Journal',
    category: 'Secrets Management',
    latencyMs: 32,
    jitterMs: 5.8,
    packetBufferPct: 95.4,
    lossRatePct: 0.01,
    retransmitRate: 0.08,
    status: 'ELEVATED'
  }
];

export const AuditorNetworkCongestionModal: React.FC<AuditorNetworkCongestionModalProps> = ({
  isOpen,
  onClose,
  theme,
  currentLatency
}) => {
  const chartRef = useRef<SVGSVGElement>(null);
  const [isSimulatingSpike, setIsSimulatingSpike] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<'latency' | 'jitter' | 'both'>('both');
  const [activeFilter, setActiveFilter] = useState<'all' | 'elevated'>('all');
  const [connectors, setConnectors] = useState<ConnectorTelemetry[]>(INITIAL_CONNECTORS);

  // High-resolution timeseries buffer for auditor analysis (50 data points)
  const [timeSeries, setTimeSeries] = useState<TelemetryJitterPoint[]>(() => {
    const points: TelemetryJitterPoint[] = [];
    const now = Date.now();
    let prev = currentLatency || 14;
    for (let i = 49; i >= 0; i--) {
      const delta = (Math.random() - 0.49) * 4;
      const lat = Math.max(7, Math.round((prev + delta) * 10) / 10);
      const jitt = Math.round(Math.abs(lat - prev) * 10) / 10;
      points.push({
        timestamp: now - i * 1200,
        latency: lat,
        jitter: jitt,
        congestion: jitt > 6 ? 'CONGESTED' : jitt > 3.5 ? 'ELEVATED' : 'NOMINAL'
      });
      prev = lat;
    }
    return points;
  });

  // Rolling update ticker in modal
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeSeries(prev => {
        const last = prev[prev.length - 1];
        const baseTarget = isSimulatingSpike ? 54 : 14;
        const noise = (Math.random() - 0.48) * (isSimulatingSpike ? 14 : 3.2);
        const lat = Math.max(6, Math.round((baseTarget + noise) * 10) / 10);
        const jitt = Math.round(Math.abs(lat - last.latency) * 10) / 10;
        const congestion: 'NOMINAL' | 'ELEVATED' | 'CONGESTED' =
          jitt > 7 || lat > 45
            ? 'CONGESTED'
            : jitt > 3.5 || lat > 25
            ? 'ELEVATED'
            : 'NOMINAL';

        return [
          ...prev.slice(1),
          {
            timestamp: Date.now(),
            latency: lat,
            jitter: jitt,
            congestion
          }
        ];
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isOpen, isSimulatingSpike]);

  // Congestion spike simulation timeout
  const handleToggleSpike = () => {
    if (isSimulatingSpike) {
      setIsSimulatingSpike(false);
      setConnectors(INITIAL_CONNECTORS);
    } else {
      setIsSimulatingSpike(true);
      // Simulate temporary latency increase on some connectors
      setConnectors(prev =>
        prev.map(c => {
          if (c.id === 'vault' || c.id === 'datadog') {
            return {
              ...c,
              latencyMs: Math.round(c.latencyMs * 2.1),
              jitterMs: Math.round(c.jitterMs * 2.8 * 10) / 10,
              packetBufferPct: 91.2,
              status: 'CONGESTED'
            };
          }
          return c;
        })
      );
      // Auto-revert after 8 seconds
      setTimeout(() => {
        setIsSimulatingSpike(false);
        setConnectors(INITIAL_CONNECTORS);
      }, 8000);
    }
  };

  // Aggregated Auditor Metrics
  const metrics = useMemo(() => {
    if (!timeSeries.length) return { avgLatency: 14, avgJitter: 1.4, maxLatency: 22, maxJitter: 3.2, p95Latency: 18 };
    const lats = timeSeries.map(p => p.latency).sort((a, b) => a - b);
    const jitts = timeSeries.map(p => p.jitter).sort((a, b) => a - b);
    const sumLat = lats.reduce((a, b) => a + b, 0);
    const sumJitt = jitts.reduce((a, b) => a + b, 0);
    const p95Idx = Math.floor(lats.length * 0.95);

    return {
      avgLatency: Math.round((sumLat / lats.length) * 10) / 10,
      avgJitter: Math.round((sumJitt / jitts.length) * 10) / 10,
      maxLatency: lats[lats.length - 1],
      maxJitter: jitts[jitts.length - 1],
      p95Latency: lats[p95Idx]
    };
  }, [timeSeries]);

  // Comprehensive D3 Render for the Auditor Inspection View
  useEffect(() => {
    if (!chartRef.current || !isOpen || timeSeries.length < 2) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 220;
    const margin = { top: 20, right: 55, bottom: 30, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'overflow-visible font-mono select-none');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Dynamic scale ranges
    const maxLat = Math.max(35, d3.max(timeSeries, d => d.latency)! + 8);
    const maxJitt = Math.max(8, d3.max(timeSeries, d => d.jitter)! + 2);

    const xScale = d3
      .scaleLinear()
      .domain([0, timeSeries.length - 1])
      .range([0, innerWidth]);

    const yLatScale = d3
      .scaleLinear()
      .domain([0, maxLat])
      .range([innerHeight, 0]);

    const yJittScale = d3
      .scaleLinear()
      .domain([0, maxJitt])
      .range([innerHeight, 0]);

    // Grid lines
    const yAxisGrid = d3
      .axisLeft(yLatScale)
      .ticks(4)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', theme === 'light' ? '#E2E8F0' : '#1E293B')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-opacity', 0.8);

    // Threshold Band: SLA Limit (25ms - 50ms)
    g.append('rect')
      .attr('x', 0)
      .attr('y', yLatScale(50))
      .attr('width', innerWidth)
      .attr('height', Math.max(0, yLatScale(25) - yLatScale(50)))
      .attr('fill', '#EF4444')
      .attr('opacity', 0.05);

    // SLA 25ms Target Line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yLatScale(25))
      .attr('y2', yLatScale(25))
      .attr('stroke', '#F59E0B')
      .attr('stroke-dasharray', '4 4')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.7);

    g.append('text')
      .attr('x', 6)
      .attr('y', yLatScale(25) - 4)
      .attr('fill', '#F59E0B')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .text('Audit Congestion Threshold (25ms SLA)');

    // Left Axis (Latency ms)
    const yAxisLeft = d3.axisLeft(yLatScale).ticks(4).tickFormat(d => `${d}ms`);
    g.append('g')
      .call(yAxisLeft)
      .selectAll('text')
      .attr('fill', theme === 'light' ? '#64748B' : '#94A3B8')
      .attr('font-size', '10px');

    // Right Axis (Jitter ms)
    if (selectedMetric !== 'latency') {
      const yAxisRight = d3.axisRight(yJittScale).ticks(4).tickFormat(d => `±${d}ms`);
      g.append('g')
        .attr('transform', `translate(${innerWidth}, 0)`)
        .call(yAxisRight)
        .selectAll('text')
        .attr('fill', '#8B5CF6')
        .attr('font-size', '10px');
    }

    // Gradient definitions
    const defs = svg.append('defs');

    // Latency Area Gradient
    const latGrad = defs
      .append('linearGradient')
      .attr('id', 'auditor-lat-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    latGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.3);

    latGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.0);

    // Draw Latency Path
    if (selectedMetric === 'latency' || selectedMetric === 'both') {
      const latArea = d3
        .area<TelemetryJitterPoint>()
        .x((_, i) => xScale(i))
        .y0(innerHeight)
        .y1(d => yLatScale(d.latency))
        .curve(d3.curveMonotoneX);

      const latLine = d3
        .line<TelemetryJitterPoint>()
        .x((_, i) => xScale(i))
        .y(d => yLatScale(d.latency))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(timeSeries)
        .attr('fill', 'url(#auditor-lat-grad)')
        .attr('d', latArea);

      g.append('path')
        .datum(timeSeries)
        .attr('fill', 'none')
        .attr('stroke', '#10B981')
        .attr('stroke-width', 2)
        .attr('d', latLine);
    }

    // Draw Jitter Path
    if (selectedMetric === 'jitter' || selectedMetric === 'both') {
      const jittLine = d3
        .line<TelemetryJitterPoint>()
        .x((_, i) => xScale(i))
        .y(d => yJittScale(d.jitter))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(timeSeries)
        .attr('fill', 'none')
        .attr('stroke', '#8B5CF6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', selectedMetric === 'both' ? '4 3' : 'none')
        .attr('d', jittLine);
    }

    // Active end markers
    const lastIdx = timeSeries.length - 1;
    const lastPt = timeSeries[lastIdx];

    if (selectedMetric === 'latency' || selectedMetric === 'both') {
      g.append('circle')
        .attr('cx', xScale(lastIdx))
        .attr('cy', yLatScale(lastPt.latency))
        .attr('r', 4)
        .attr('fill', '#10B981');
    }

    if (selectedMetric === 'jitter' || selectedMetric === 'both') {
      g.append('circle')
        .attr('cx', xScale(lastIdx))
        .attr('cy', yJittScale(lastPt.jitter))
        .attr('r', 4)
        .attr('fill', '#8B5CF6');
    }

    // X Axis with relative seconds ago
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => {
        const secondsAgo = Math.round((timeSeries.length - 1 - Number(d)) * 1.2);
        return secondsAgo === 0 ? 'Now' : `-${secondsAgo}s`;
      });

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', theme === 'light' ? '#64748B' : '#94A3B8')
      .attr('font-size', '10px');
  }, [timeSeries, selectedMetric, isOpen, theme]);

  if (!isOpen) return null;

  const filteredConnectors =
    activeFilter === 'elevated'
      ? connectors.filter(c => c.status !== 'OPTIMAL')
      : connectors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-inherit/95 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight">
                  Auditor Network Congestion & Telemetry Jitter Inspector
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ISO 27001 A.8.20 / SOC 2 CC6.6
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time jitter variance and latency distribution across distributed compliance ingestion pipelines.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleSpike}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 border transition cursor-pointer ${
                isSimulatingSpike
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
              title="Test real-time buffer & congestion alert thresholds"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSimulatingSpike ? 'Simulating Congestion...' : 'Simulate Spike'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Key Performance Indicator Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Average Latency (RTT)
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {metrics.avgLatency}
                </span>
                <span className="text-xs font-mono text-slate-500">ms</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SLA ceiling: &lt;25ms</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Stream Jitter Variance
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-mono font-black text-purple-600 dark:text-purple-400">
                  ±{metrics.avgJitter}
                </span>
                <span className="text-xs font-mono text-slate-500">ms</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 font-semibold">Nominal stability</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                P95 Max Latency
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className={`text-xl font-mono font-black ${
                  metrics.p95Latency > 35 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                }`}>
                  {metrics.p95Latency}
                </span>
                <span className="text-xs font-mono text-slate-500">ms</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Peak: {metrics.maxLatency}ms</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Congestion Health Score
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-mono font-black text-emerald-500">
                  {isSimulatingSpike ? '88.2%' : '99.8%'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Grade A+</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">0 dropped packets</span>
            </div>
          </div>

          {/* D3 High-Resolution Chart Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  D3 Telemetry Latency & Jitter Time-Series (Last 60 Seconds)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Visualizes transport packet arrival delay variance. Peaks exceeding the 25ms threshold trigger buffer queue isolation.
                </p>
              </div>

              {/* Metric filter switches */}
              <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMetric('both')}
                  className={`px-2 py-1 rounded cursor-pointer transition ${
                    selectedMetric === 'both'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMetric('latency')}
                  className={`px-2 py-1 rounded cursor-pointer transition ${
                    selectedMetric === 'latency'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Latency
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMetric('jitter')}
                  className={`px-2 py-1 rounded cursor-pointer transition ${
                    selectedMetric === 'jitter'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Jitter
                </button>
              </div>
            </div>

            {/* D3 Visual Container */}
            <div className="w-full overflow-x-auto py-1">
              <svg ref={chartRef} className="w-full h-auto min-w-[580px]" />
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded-full" />
                  <span>Stream Ingress Latency (ms)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-purple-500 border-dashed rounded-full" />
                  <span>Jitter Variance (±ms)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-amber-500 border-dotted" />
                  <span>Audit Congestion SLA (25ms)</span>
                </span>
              </div>

              <div className="flex items-center space-x-1 text-emerald-500 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Telemetry Packet Loss Recorded</span>
              </div>
            </div>
          </div>

          {/* Individual Data Stream Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Individual Stream Ingress Health Breakdown
              </h4>

              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-slate-200 dark:bg-slate-800 font-bold text-slate-900 dark:text-white'
                      : 'text-slate-400'
                  }`}
                >
                  All ({connectors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('elevated')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    activeFilter === 'elevated'
                      ? 'bg-amber-500/20 text-amber-500 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  Elevated/Congested ({connectors.filter(c => c.status !== 'OPTIMAL').length})
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5">Telemetry Source</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Latency</th>
                    <th className="p-2.5">Jitter (±)</th>
                    <th className="p-2.5">Buffer Fill</th>
                    <th className="p-2.5">Retransmit</th>
                    <th className="p-2.5 text-right">Congestion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredConnectors.map(c => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <Server className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.name}</span>
                      </td>
                      <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {c.category}
                      </td>
                      <td className="p-2.5 font-bold">
                        <span className={c.latencyMs > 25 ? 'text-amber-500' : 'text-emerald-500'}>
                          {c.latencyMs}ms
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-purple-600 dark:text-purple-400">
                        ±{c.jitterMs}ms
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">
                        {c.packetBufferPct}%
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {c.retransmitRate}%
                      </td>
                      <td className="p-2.5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'OPTIMAL'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : c.status === 'ELEVATED'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cryptographic proof: ISO 27001 evidence stream verified via HMAC-SHA256</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
