import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export interface TelemetryJitterPoint {
  timestamp: number;
  latency: number; // in milliseconds
  jitter: number;  // in milliseconds (|latency_t - latency_{t-1}|)
  congestion: 'NOMINAL' | 'ELEVATED' | 'CONGESTED';
}

interface D3TelemetryJitterSparklineProps {
  currentLatency: number;
  flowSpeed?: 'normal' | 'fast' | 'paused';
  hasWarningOrDegraded?: boolean;
  theme: string;
  onOpenAuditDetail?: () => void;
  width?: number;
  height?: number;
  refreshTrigger?: number;
  latencyWarningThreshold?: number;
  latencyCriticalThreshold?: number;
  maxJitterThreshold?: number;
  isThresholdBreached?: boolean;
  breachSeverity?: 'NOMINAL' | 'WARNING' | 'CRITICAL';
}

export const D3TelemetryJitterSparkline: React.FC<D3TelemetryJitterSparklineProps> = ({
  currentLatency,
  flowSpeed = 'normal',
  hasWarningOrDegraded = false,
  theme,
  onOpenAuditDetail,
  width = 135,
  height = 36,
  refreshTrigger = 0,
  latencyWarningThreshold = 25,
  latencyCriticalThreshold = 45,
  maxJitterThreshold = 4.0,
  isThresholdBreached = false,
  breachSeverity = 'NOMINAL'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryJitterPoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Generate realistic rolling window of latency & jitter points
  const [history, setHistory] = useState<TelemetryJitterPoint[]>(() => {
    const initial: TelemetryJitterPoint[] = [];
    const now = Date.now();
    let prev = currentLatency || 14;
    for (let i = 24; i >= 0; i--) {
      const noise = (Math.random() - 0.48) * 3.5;
      const baseLat = Math.max(6, Math.round((prev + noise) * 10) / 10);
      const jitt = Math.round(Math.abs(baseLat - prev) * 10) / 10;
      initial.push({
        timestamp: now - i * 1500,
        latency: baseLat,
        jitter: jitt,
        congestion: jitt > 6 ? 'CONGESTED' : jitt > 3 ? 'ELEVATED' : 'NOMINAL'
      });
      prev = baseLat;
    }
    return initial;
  });

  // Ticker for real-time telemetry updates
  useEffect(() => {
    if (flowSpeed === 'paused') return;

    const intervalMs = flowSpeed === 'fast' ? 700 : 1400;
    const interval = setInterval(() => {
      setHistory(prev => {
        const last = prev[prev.length - 1];
        // Target base latency influenced by warning state
        const targetBase = hasWarningOrDegraded ? 28 : currentLatency || 13;
        const noise = (Math.random() - 0.46) * (hasWarningOrDegraded ? 6.5 : 2.8);
        const newLat = Math.max(6, Math.round((targetBase + noise) * 10) / 10);
        const jitter = Math.round(Math.abs(newLat - last.latency) * 10) / 10;
        const congestion: 'NOMINAL' | 'ELEVATED' | 'CONGESTED' =
          jitter > (maxJitterThreshold * 1.5) || newLat > latencyCriticalThreshold
            ? 'CONGESTED'
            : jitter > maxJitterThreshold || newLat > latencyWarningThreshold
            ? 'ELEVATED'
            : 'NOMINAL';

        const nextPoint: TelemetryJitterPoint = {
          timestamp: Date.now(),
          latency: newLat,
          jitter,
          congestion
        };

        const updated = [...prev.slice(1), nextPoint];
        return updated;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [flowSpeed, currentLatency, hasWarningOrDegraded, latencyCriticalThreshold, latencyWarningThreshold, maxJitterThreshold]);

  // Immediate re-fetch push when manual refresh is triggered
  useEffect(() => {
    if (!refreshTrigger) return;
    setHistory(prev => {
      const last = prev[prev.length - 1] || { latency: currentLatency || 12, jitter: 1.2 };
      const targetBase = hasWarningOrDegraded ? 26 : currentLatency || 12;
      const noise = (Math.random() - 0.5) * 2;
      const newLat = Math.max(6, Math.round((targetBase + noise) * 10) / 10);
      const jitter = Math.round(Math.abs(newLat - last.latency) * 10) / 10;
      const nextPoint: TelemetryJitterPoint = {
        timestamp: Date.now(),
        latency: newLat,
        jitter,
        congestion:
          jitter > (maxJitterThreshold * 1.5) || newLat > latencyCriticalThreshold
            ? 'CONGESTED'
            : jitter > maxJitterThreshold || newLat > latencyWarningThreshold
            ? 'ELEVATED'
            : 'NOMINAL'
      };
      return [...prev.slice(1), nextPoint];
    });
  }, [refreshTrigger, hasWarningOrDegraded, currentLatency, latencyCriticalThreshold, latencyWarningThreshold, maxJitterThreshold]);

  const latest = history[history.length - 1];
  const avgJitter = useMemo(() => {
    if (!history.length) return 1.5;
    const sum = history.reduce((acc, p) => acc + p.jitter, 0);
    return Math.round((sum / history.length) * 10) / 10;
  }, [history]);

  const isCongested =
    (isThresholdBreached && breachSeverity === 'CRITICAL') ||
    latest?.congestion === 'CONGESTED' ||
    hasWarningOrDegraded;
  const isElevated =
    (isThresholdBreached && breachSeverity === 'WARNING') ||
    latest?.congestion === 'ELEVATED';

  // D3 Rendering of Sparkline with Area Fill and Jitter Thresholds
  useEffect(() => {
    if (!svgRef.current || history.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 4, right: 6, bottom: 4, left: 4 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Dynamic scale domains with comfortable headroom
    const minLat = Math.max(0, d3.min(history, d => d.latency)! - 2);
    const maxLat = Math.max(22, d3.max(history, d => d.latency)! + 4);

    const xScale = d3
      .scaleLinear()
      .domain([0, history.length - 1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([minLat, maxLat])
      .range([innerHeight, 0]);

    // Unique gradient ID
    const gradId = `sparkline-grad-${Math.random().toString(36).substr(2, 9)}`;
    const defs = svg.append('defs');

    const linearGradient = defs
      .append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    const strokeColor = isCongested
      ? '#EF4444'
      : isElevated
      ? '#F59E0B'
      : '#10B981';

    linearGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', strokeColor)
      .attr('stop-opacity', theme === 'light' ? 0.35 : 0.45);

    linearGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', strokeColor)
      .attr('stop-opacity', 0.0);

    // D3 Area Generator
    const area = d3
      .area<TelemetryJitterPoint>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d.latency))
      .curve(d3.curveMonotoneX);

    // D3 Line Generator
    const line = d3
      .line<TelemetryJitterPoint>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.latency))
      .curve(d3.curveMonotoneX);

    // Draw SLA threshold reference dashed line if within view
    if (latencyWarningThreshold >= minLat && latencyWarningThreshold <= maxLat) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(latencyWarningThreshold))
        .attr('y2', yScale(latencyWarningThreshold))
        .attr(
          'stroke',
          isThresholdBreached
            ? breachSeverity === 'CRITICAL'
              ? '#EF4444'
              : '#F59E0B'
            : theme === 'light'
            ? '#CBD5E1'
            : '#334155'
        )
        .attr('stroke-dasharray', isThresholdBreached ? '3 1' : '2 2')
        .attr('stroke-width', isThresholdBreached ? 1.25 : 1)
        .attr('opacity', isThresholdBreached ? 0.85 : 0.6);
    }

    // Append Area Fill
    g.append('path')
      .datum(history)
      .attr('fill', `url(#${gradId})`)
      .attr('d', area);

    // Append Line Path
    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', strokeColor)
      .attr('stroke-width', 1.75)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // Latest real-time pulse beacon at right end
    const lastIndex = history.length - 1;
    const lastX = xScale(lastIndex);
    const lastY = yScale(history[lastIndex].latency);

    // Expanding ripple ring
    g.append('circle')
      .attr('cx', lastX)
      .attr('cy', lastY)
      .attr('r', 4.5)
      .attr('fill', strokeColor)
      .attr('opacity', 0.3)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('values', '3;6;3')
      .attr('dur', '1.6s')
      .attr('repeatCount', 'indefinite');

    // Solid core dot
    g.append('circle')
      .attr('cx', lastX)
      .attr('cy', lastY)
      .attr('r', 2.5)
      .attr('fill', strokeColor);

    // Interactive transparent overlay for cursor inspection
    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const index = Math.min(
          history.length - 1,
          Math.max(0, Math.round(xScale.invert(mx)))
        );
        const point = history[index];
        if (point) {
          setHoveredPoint(point);
          setHoverCoords({
            x: xScale(index) + margin.left,
            y: yScale(point.latency) + margin.top
          });
        }
      })
      .on('mouseleave', () => {
        setHoveredPoint(null);
        setHoverCoords(null);
      });
  }, [history, isCongested, isElevated, theme, width, height, latencyWarningThreshold, isThresholdBreached, breachSeverity]);

  return (
    <div
      className="relative flex flex-col justify-center cursor-pointer group select-none"
      onClick={onOpenAuditDetail}
      title="Click to launch Auditor Network Congestion & Telemetry Jitter Inspector"
    >
      {/* Top micro metric label: Latency & Jitter reading */}
      <div className="flex items-center justify-between gap-1 text-[9px] font-mono leading-none mb-1">
        <span className="text-slate-400 flex items-center space-x-1">
          <Activity className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
          <span>Jitter:</span>
          <span className={`font-bold ${
            isCongested ? 'text-rose-500' : isElevated ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            ±{latest?.jitter ?? 1.4}ms
          </span>
        </span>

        <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold uppercase inline-flex items-center space-x-1 ${
          isThresholdBreached
            ? breachSeverity === 'CRITICAL'
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
            : isCongested
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            : isElevated
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
        }`}>
          {isThresholdBreached && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
          )}
          <span>{isThresholdBreached ? 'SLA Breach' : isCongested ? 'Congestion' : isElevated ? 'Elevated' : 'Nominal'}</span>
        </span>
      </div>

      {/* D3 Sparkline SVG Container */}
      <div className="relative flex items-center justify-center">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
        />

        {/* Hover inspection dot */}
        {hoverCoords && (
          <div
            className="absolute pointer-events-none w-2 h-2 rounded-full border-2 border-white shadow-xs bg-indigo-500 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{ left: hoverCoords.x, top: hoverCoords.y }}
          />
        )}
      </div>

      {/* Real-time Hover Tooltip */}
      {hoveredPoint && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none px-2 py-1 rounded-md text-[9px] font-mono whitespace-nowrap shadow-md border ${
          theme === 'light'
            ? 'bg-slate-900 text-white border-slate-700'
            : 'bg-black text-slate-100 border-slate-800'
        }`}>
          <div className="flex items-center space-x-1.5 font-bold">
            <span>Latency: {hoveredPoint.latency}ms</span>
            <span className="opacity-60">•</span>
            <span>Jitter: ±{hoveredPoint.jitter}ms</span>
          </div>
          <div className="text-[8px] opacity-75 flex items-center justify-between gap-2 mt-0.5">
            <span>Status: {hoveredPoint.congestion}</span>
            <span>SLA &lt;{latencyWarningThreshold}ms</span>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 opacity-80 mt-0.5 group-hover:text-indigo-500 transition-colors">
        <span>RTT {latest?.latency ?? 14}ms</span>
        <span className="group-hover:underline">Audit Graph »</span>
      </div>
    </div>
  );
};
