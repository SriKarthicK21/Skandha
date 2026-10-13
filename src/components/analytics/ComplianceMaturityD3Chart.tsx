import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Clock,
  UserCheck,
  Hash,
  ArrowUpRight,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  type ComplianceSnapshot,
  type SnapshotComplianceTask,
  DEFAULT_12_MONTH_SNAPSHOTS as DEFAULT_SNAPSHOTS_WITH_TASKS
} from './complianceSnapshotData';
import { SnapshotTasksSidePanel } from './SnapshotTasksSidePanel';
import type { PredictiveAiAnalysis } from '../../services/predictiveMaturityService';
import { ListChecks, Loader2 } from 'lucide-react';

export type { ComplianceSnapshot, SnapshotComplianceTask };

// 12-Month Historical Snapshots Data (October 2025 - September 2026)
export const DEFAULT_12_MONTH_SNAPSHOTS: ComplianceSnapshot[] = DEFAULT_SNAPSHOTS_WITH_TASKS;

export interface MetricSeriesConfig {
  key: keyof Pick<
    ComplianceSnapshot,
    | 'overallMaturity'
    | 'iso27001Maturity'
    | 'masTrmMaturity'
    | 'controlsImplementedPct'
    | 'evidenceReadinessPct'
    | 'policyGovernancePct'
    | 'riskRemediationPct'
  >;
  label: string;
  color: string;
  strokeWidth: number;
  strokeDash?: string;
  description: string;
}

export const METRIC_SERIES_OPTIONS: MetricSeriesConfig[] = [
  {
    key: 'overallMaturity',
    label: 'Overall Compliance Maturity',
    color: '#38BDF8', // Sky 400
    strokeWidth: 3.5,
    description: 'Blended weighted index of controls, evidence integrity, and governance'
  },
  {
    key: 'iso27001Maturity',
    label: 'ISO 27001:2022 Readiness',
    color: '#34D399', // Emerald 400
    strokeWidth: 2.5,
    description: 'Alignment with Clauses 4-10 and 93 Annex A control requirements'
  },
  {
    key: 'masTrmMaturity',
    label: 'MAS TRM 14-Domain Alignment',
    color: '#818CF8', // Indigo 400
    strokeWidth: 2.5,
    description: 'Monetary Authority of Singapore Technology Risk Management maturity'
  },
  {
    key: 'controlsImplementedPct',
    label: 'Controls Implementation %',
    color: '#A78BFA', // Purple 400
    strokeWidth: 2,
    description: 'Proportion of applicable controls in Implemented status'
  },
  {
    key: 'evidenceReadinessPct',
    label: 'Verified Evidence Readiness',
    color: '#FBBF24', // Amber 400
    strokeWidth: 2,
    description: 'Fresh, tamper-verified evidence artifacts linked to active controls'
  },
  {
    key: 'policyGovernancePct',
    label: 'Policy Governance & Baselines',
    color: '#F43F5E', // Rose 400
    strokeWidth: 2,
    description: 'Approved security policies, SoA baselines, and MoU sign-offs'
  }
];

export interface ComplianceMaturityD3ChartProps {
  snapshots?: ComplianceSnapshot[];
  tenantName?: string;
  currentScore?: number;
  onSelectSnapshot?: (snapshot: ComplianceSnapshot) => void;
  isPredictiveMode?: boolean;
  predictiveAiAnalysis?: PredictiveAiAnalysis | null;
  isLoadingPredictions?: boolean;
  onTogglePredictiveMode?: (active: boolean) => void;
}

export const ComplianceMaturityD3Chart: React.FC<ComplianceMaturityD3ChartProps> = ({
  snapshots = DEFAULT_12_MONTH_SNAPSHOTS,
  tenantName = 'Enterprise Tenant',
  currentScore = 84,
  onSelectSnapshot,
  isPredictiveMode = false,
  predictiveAiAnalysis = null,
  isLoadingPredictions = false,
  onTogglePredictiveMode
}) => {
  // Drill-down side panel state
  const [isTasksPanelOpen, setIsTasksPanelOpen] = useState<boolean>(false);
  // Container & SVG references
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Active series toggles (default: Overall Maturity, ISO 27001, and MAS TRM active)
  const [activeSeriesKeys, setActiveSeriesKeys] = useState<string[]>([
    'overallMaturity',
    'iso27001Maturity',
    'masTrmMaturity'
  ]);

  // View timeframe filter
  const [timeframe, setTimeframe] = useState<'12M' | '6M' | '3M'>('12M');

  // Curve interpolation mode
  const [curveType, setCurveType] = useState<'monotone' | 'linear' | 'step'>('monotone');

  // Show milestone markers
  const [showMilestones, setShowMilestones] = useState<boolean>(true);

  // Show benchmark threshold lines
  const [showBenchmarks, setShowBenchmarks] = useState<boolean>(true);

  // Currently hovered or selected snapshot
  const [hoveredSnapshot, setHoveredSnapshot] = useState<ComplianceSnapshot | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ComplianceSnapshot>(
    snapshots[snapshots.length - 1] || DEFAULT_12_MONTH_SNAPSHOTS[11]
  );

  // Track container dimensions via ResizeObserver
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 400
  });

  // Filter snapshots based on timeframe
  const filteredSnapshots = useMemo(() => {
    if (timeframe === '3M') return snapshots.slice(-3);
    if (timeframe === '6M') return snapshots.slice(-6);
    return snapshots;
  }, [snapshots, timeframe]);

  // Overall 12-month progress calculation
  const startSnapshot = snapshots[0];
  const latestSnapshot = snapshots[snapshots.length - 1];
  const maturityDelta12M = latestSnapshot.overallMaturity - startSnapshot.overallMaturity;
  const avgMonthlyVelocity = (maturityDelta12M / (snapshots.length - 1)).toFixed(1);

  // Handle ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        // Adaptive height based on container width
        const height = Math.max(360, Math.min(460, Math.round(width * 0.42)));
        setDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Primary D3 Chart Render Hook
  useEffect(() => {
    if (!svgRef.current || filteredSnapshots.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean redraw

    const { width, height } = dimensions;
    const margin = { top: 35, right: 35, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // SVG root definitions (Gradients, Filters, Clips)
    const defs = svg.append('defs');

    // Gradient for primary area fill
    const areaGrad = defs
      .append('linearGradient')
      .attr('id', 'd3MaturityAreaGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#38BDF8')
      .attr('stop-opacity', 0.28);

    areaGrad
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#38BDF8')
      .attr('stop-opacity', 0.05);

    areaGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#38BDF8')
      .attr('stop-opacity', 0);

    // Glow filter for highlighted line
    const glowFilter = defs.append('filter').attr('id', 'd3Glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Chart Canvas Group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3
      .scalePoint<string>()
      .domain(filteredSnapshots.map((d) => d.monthLabel))
      .range([0, innerWidth])
      .padding(0.2);

    // Y Scale (0% - 100%)
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]).nice();

    // Select curve interpolation
    const getCurve = () => {
      switch (curveType) {
        case 'linear':
          return d3.curveLinear;
        case 'step':
          return d3.curveStepAfter;
        default:
          return d3.curveMonotoneX;
      }
    };

    // Horizontal Grid Lines
    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .call((gGroup) => gGroup.select('.domain').remove())
      .call((gGroup) =>
        gGroup
          .selectAll('.tick line')
          .attr('stroke', '#1E293B')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-opacity', 0.8)
      );

    // Benchmark Threshold Reference Lines
    if (showBenchmarks) {
      // 85% Stage 1 Certification Threshold
      const y85 = yScale(85);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y85)
        .attr('y2', y85)
        .attr('stroke', '#10B981')
        .attr('stroke-dasharray', '5,4')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85);

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', y85 - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#34D399')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text('Stage 1 Gate (85%)');

      // 80% MAS TRM Cyber Hygiene Baseline
      const y80 = yScale(80);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y80)
        .attr('y2', y80)
        .attr('stroke', '#6366F1')
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 1.2)
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', 6)
        .attr('y', y80 - 6)
        .attr('text-anchor', 'start')
        .attr('fill', '#818CF8')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text('MAS TRM Baseline (80%)');
    }

    // AI Predictive Horizon Boundary Line (if in predictive mode)
    if (isPredictiveMode && filteredSnapshots.length > 12) {
      const sepX = xScale('Sep 2026');
      if (sepX !== undefined) {
        // Vertical dividing line
        g.append('line')
          .attr('class', 'ai-horizon-line')
          .attr('x1', sepX)
          .attr('x2', sepX)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', '#A855F7')
          .attr('stroke-dasharray', '4,4')
          .attr('stroke-width', 2)
          .attr('opacity', 0.85);

        // Horizon Pill Header
        const horizonBadge = g.append('g').attr('transform', `translate(${sepX + 8}, 14)`);
        horizonBadge
          .append('rect')
          .attr('width', 130)
          .attr('height', 20)
          .attr('rx', 4)
          .attr('fill', '#581C87')
          .attr('stroke', '#A855F7')
          .attr('stroke-width', 1)
          .attr('opacity', 0.9);

        horizonBadge
          .append('text')
          .attr('x', 65)
          .attr('y', 14)
          .attr('text-anchor', 'middle')
          .attr('fill', '#F3E8FF')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text('AI FORECAST HORIZON');
      }

      // Confidence Envelope band for projected snapshots
      const projectedSnapshots = filteredSnapshots.filter(s => s.monthIndex >= 11);
      if (projectedSnapshots.length >= 2 && activeSeriesKeys.includes('overallMaturity')) {
        const confidenceAreaGen = d3
          .area<ComplianceSnapshot>()
          .x(d => xScale(d.monthLabel) || 0)
          .y0(d => yScale(Math.max(0, d.overallMaturity - 3.2)))
          .y1(d => yScale(Math.min(100, d.overallMaturity + 3.2)))
          .curve(getCurve());

        g.append('path')
          .datum(projectedSnapshots)
          .attr('class', 'ai-confidence-envelope')
          .attr('fill', '#9333EA')
          .attr('opacity', 0.18)
          .attr('d', confidenceAreaGen);
      }
    }

    // Gradient Area for Overall Maturity if active
    if (activeSeriesKeys.includes('overallMaturity')) {
      const areaGen = d3
        .area<ComplianceSnapshot>()
        .x((d) => xScale(d.monthLabel) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.overallMaturity))
        .curve(getCurve());

      g.append('path')
        .datum(filteredSnapshots)
        .attr('class', 'area-fill')
        .attr('fill', 'url(#d3MaturityAreaGrad)')
        .attr('d', areaGen);
    }

    // Render Metric Lines
    METRIC_SERIES_OPTIONS.forEach((series) => {
      if (!activeSeriesKeys.includes(series.key)) return;

      const lineGen = d3
        .line<ComplianceSnapshot>()
        .x((d) => xScale(d.monthLabel) || 0)
        .y((d) => yScale(d[series.key] as number))
        .curve(getCurve());

      const path = g
        .append('path')
        .datum(filteredSnapshots)
        .attr('class', `line-${series.key}`)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', series.strokeWidth)
        .attr('d', lineGen);

      if (series.strokeDash) {
        path.attr('stroke-dasharray', series.strokeDash);
      }

      // Entry animation
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 1000;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(900)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          if (series.strokeDash) {
            path.attr('stroke-dasharray', series.strokeDash);
          } else {
            path.attr('stroke-dasharray', null);
          }
        });

      // Data Point Dots
      g.selectAll(`.dot-${series.key}`)
        .data(filteredSnapshots)
        .enter()
        .append('circle')
        .attr('class', `dot-${series.key}`)
        .attr('cx', (d) => xScale(d.monthLabel) || 0)
        .attr('cy', (d) => yScale(d[series.key] as number))
        .attr('r', series.key === 'overallMaturity' ? 4.5 : 3.5)
        .attr('fill', '#0B0F19')
        .attr('stroke', series.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.95);
    });

    // Pulse ring on current/latest month for overall maturity
    if (activeSeriesKeys.includes('overallMaturity')) {
      const latest = filteredSnapshots[filteredSnapshots.length - 1];
      const latestX = xScale(latest.monthLabel) || 0;
      const latestY = yScale(latest.overallMaturity);

      g.append('circle')
        .attr('cx', latestX)
        .attr('cy', latestY)
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', '#38BDF8')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', '6; 14; 6')
        .attr('dur', '2.5s')
        .attr('repeatCount', 'indefinite');
    }

    // Milestone Flag Pins on primary line
    if (showMilestones && activeSeriesKeys.includes('overallMaturity')) {
      filteredSnapshots.forEach((d) => {
        if (d.milestoneTitle) {
          const cx = xScale(d.monthLabel) || 0;
          const cy = yScale(d.overallMaturity);

          // Small flag marker
          const flagGroup = g.append('g').attr('transform', `translate(${cx}, ${cy})`);

          flagGroup
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', -18)
            .attr('stroke', '#64748B')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,2');

          flagGroup
            .append('circle')
            .attr('cx', 0)
            .attr('cy', -21)
            .attr('r', 4.5)
            .attr('fill', '#38BDF8')
            .attr('stroke', '#0B0F19')
            .attr('stroke-width', 1.5)
            .attr('cursor', 'pointer');
        }
      });
    }

    // Highlight line for selected/active snapshot
    if (selectedSnapshot) {
      const selX = xScale(selectedSnapshot.monthLabel);
      if (selX !== undefined) {
        g.append('line')
          .attr('class', 'selection-guideline')
          .attr('x1', selX)
          .attr('x2', selX)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', '#38BDF8')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3')
          .attr('opacity', 0.6);
      }
    }

    // X-Axis
    const xAxis = d3.axisBottom(xScale).tickSize(6);
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .call((gGroup) => gGroup.select('.domain').attr('stroke', '#334155'))
      .call((gGroup) => gGroup.selectAll('.tick line').attr('stroke', '#334155'))
      .call((gGroup) =>
        gGroup
          .selectAll('.tick text')
          .attr('fill', '#94A3B8')
          .attr('font-size', '11px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('dy', '10px')
      );

    // Y-Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call((gGroup) => gGroup.select('.domain').attr('stroke', '#334155'))
      .call((gGroup) => gGroup.selectAll('.tick line').attr('stroke', '#334155'))
      .call((gGroup) =>
        gGroup
          .selectAll('.tick text')
          .attr('fill', '#94A3B8')
          .attr('font-size', '11px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('dx', '-4px')
      );

    // Y-Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -32)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748B')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('COMPLIANCE MATURITY SCORE (%)');

    // Interactive Overlay for Pointer Tracking & Tooltip
    const crosshair = g
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0);

    const activePointCircle = g
      .append('circle')
      .attr('class', 'crosshair-circle')
      .attr('r', 6)
      .attr('fill', '#38BDF8')
      .attr('stroke', '#0B0F19')
      .attr('stroke-width', 2)
      .attr('opacity', 0);

    // Find nearest month based on pointer x
    const bisectMonth = (mouseX: number): ComplianceSnapshot | null => {
      let closestSnap: ComplianceSnapshot | null = null;
      let minDistance = Infinity;

      filteredSnapshots.forEach((snap) => {
        const snapX = xScale(snap.monthLabel);
        if (snapX !== undefined) {
          const dist = Math.abs(snapX - mouseX);
          if (dist < minDistance) {
            minDistance = dist;
            closestSnap = snap;
          }
        }
      });

      return closestSnap;
    };

    // Overlay rect
    const overlay = g
      .append('rect')
      .attr('class', 'interactive-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('pointermove', function (event: PointerEvent) {
        const [mouseX] = d3.pointer(event);
        const snap = bisectMonth(mouseX);
        if (snap) {
          const snapX = xScale(snap.monthLabel) || 0;
          const snapY = yScale(snap.overallMaturity);

          crosshair.attr('x1', snapX).attr('x2', snapX).attr('opacity', 0.8);
          activePointCircle.attr('cx', snapX).attr('cy', snapY).attr('opacity', 1);

          setHoveredSnapshot(snap);
        }
      })
      .on('pointerleave', function () {
        crosshair.attr('opacity', 0);
        activePointCircle.attr('opacity', 0);
        setHoveredSnapshot(null);
      })
      .on('click', function (event: MouseEvent) {
        const [mouseX] = d3.pointer(event);
        const snap = bisectMonth(mouseX);
        if (snap) {
          setSelectedSnapshot(snap);
          setIsTasksPanelOpen(true);
          onSelectSnapshot?.(snap);
        }
      });
  }, [
    filteredSnapshots,
    dimensions,
    activeSeriesKeys,
    curveType,
    showBenchmarks,
    showMilestones,
    selectedSnapshot,
    onSelectSnapshot
  ]);

  // Toggle Series visibility
  const toggleSeries = (key: string) => {
    setActiveSeriesKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // Keep at least one active
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Export D3 SVG as downloadable file
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skanda-compliance-maturity-d3-trend-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Verdict style mapper
  const getVerdictBadge = (verdict: ComplianceSnapshot['auditReadinessVerdict']) => {
    switch (verdict) {
      case 'AUDIT_READY':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'ATTENTION_REQUIRED':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'IN_PROGRESS':
        return 'bg-sky-950/80 text-sky-300 border-sky-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Highlights */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-700/60 text-sky-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                <TrendingUp className="w-3 h-3 text-sky-400" />
                <span>D3.js Vector Analytics Engine</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
                12 Monthly Snapshots
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Compliance Maturity Trend & Trajectory (12 Months)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Historical timeline of audited maturity snapshots across ISO 27001:2022, MAS TRM, verified evidence density, and CAPA resolution velocity.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Baseline (M1)</div>
              <div className="text-lg font-black text-slate-300 mt-0.5">{startSnapshot.overallMaturity}%</div>
              <div className="text-[10px] text-slate-400 font-mono">Oct 2025</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Current (M12)</div>
              <div className="text-lg font-black text-sky-400 mt-0.5">{latestSnapshot.overallMaturity}%</div>
              <div className="text-[10px] text-slate-400 font-mono">Sep 2026</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">12M Net Gain</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">+{maturityDelta12M}%</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">~{avgMonthlyVelocity}% / mo</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Audit Gate</div>
              <div className="text-lg font-black text-purple-300 mt-0.5">READY</div>
              <div className="text-[10px] text-slate-400 font-mono">Stage 1 Pass</div>
            </div>
          </div>
        </div>
      </div>

      {/* D3 Chart Canvas Container */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        {/* Chart Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 text-xs">
          {/* Timeframe selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Horizon:</span>
            </span>
            {(['12M', '6M', '3M'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg font-semibold font-mono transition ${
                  timeframe === tf
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tf === '12M' ? 'All 12 Months' : tf === '6M' ? 'Last 6 Months' : 'Last Quarter'}
              </button>
            ))}
          </div>

          {/* Curve interpolation & benchmark toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 px-1.5">Curve:</span>
              <button
                onClick={() => setCurveType('monotone')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  curveType === 'monotone' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Smooth
              </button>
              <button
                onClick={() => setCurveType('linear')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  curveType === 'linear' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setCurveType('step')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  curveType === 'step' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Stepped
              </button>
            </div>

            <button
              onClick={() => setShowBenchmarks((prev) => !prev)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                showBenchmarks
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Audit Benchmarks (85% & 80%)</span>
            </button>

            <button
              onClick={() => setShowMilestones((prev) => !prev)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                showMilestones
                  ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Award className="w-3 h-3 text-sky-400" />
              <span>Milestone Pins</span>
            </button>

            <button
              onClick={handleExportSVG}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition"
              title="Download D3 SVG vector graph"
            >
              <Download className="w-3 h-3 text-slate-300" />
              <span>Export SVG</span>
            </button>
          </div>
        </div>

        {/* Metric Series Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center space-x-1">
            <Sliders className="w-3 h-3 text-slate-400" />
            <span>Metric Series:</span>
          </span>
          {METRIC_SERIES_OPTIONS.map((series) => {
            const isActive = activeSeriesKeys.includes(series.key);
            return (
              <button
                key={series.key}
                onClick={() => toggleSeries(series.key)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition select-none ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-sm ring-1'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                style={{
                  borderColor: isActive ? series.color : undefined,
                  boxShadow: isActive ? `0 0 10px ${series.color}20` : undefined
                }}
                title={series.description}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: series.color }}
                />
                <span>{series.label}</span>
              </button>
            );
          })}
        </div>

        {/* The D3 Responsive Canvas Wrapper */}
        <div
          ref={containerRef}
          className="w-full relative rounded-xl bg-slate-950/90 border border-slate-800/80 overflow-hidden"
          style={{ minHeight: '360px' }}
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto block select-none"
          />

          {/* Floating dynamic hover tooltip */}
          {hoveredSnapshot && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 z-20 p-3.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md max-w-xs space-y-2 pointer-events-none text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{hoveredSnapshot.monthLabel}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getVerdictBadge(hoveredSnapshot.auditReadinessVerdict)}`}>
                  {hoveredSnapshot.auditReadinessVerdict.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Overall Maturity:</span>
                  <strong className="text-sky-400">{hoveredSnapshot.overallMaturity}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ISO 27001:2022:</span>
                  <strong className="text-emerald-400">{hoveredSnapshot.iso27001Maturity}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MAS TRM:</span>
                  <strong className="text-indigo-400">{hoveredSnapshot.masTrmMaturity}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Controls Implemented:</span>
                  <span className="text-white">
                    {hoveredSnapshot.implementedControlsCount}/{hoveredSnapshot.totalControlsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Evidence:</span>
                  <span className="text-amber-400">
                    {hoveredSnapshot.verifiedEvidenceCount} artifacts
                  </span>
                </div>
              </div>

              {hoveredSnapshot.milestoneTitle && (
                <div className="pt-1.5 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>Key Milestone</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                    {hoveredSnapshot.milestoneTitle}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Legend & Instructions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block border-t border-dashed border-emerald-400" />
              <span>Stage 1 Threshold (85%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-0.5 bg-indigo-400 inline-block border-t border-dashed border-indigo-400" />
              <span>MAS TRM Baseline (80%)</span>
            </span>
          </div>
          <div>Click any month coordinate to inspect historical audit state</div>
        </div>
      </div>

      {/* Selected Snapshot Deep-Dive Inspector */}
      {selectedSnapshot && (
        <motion.div
          key={selectedSnapshot.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                  Snapshot #{selectedSnapshot.id}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Recorded: {new Date(selectedSnapshot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <span>{selectedSnapshot.monthLabel} Compliance Audit Ledger</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono border ${getVerdictBadge(selectedSnapshot.auditReadinessVerdict)}`}>
                  {selectedSnapshot.auditReadinessVerdict.replace('_', ' ')}
                </span>
              </h3>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Drill-Down Contributing Tasks Button */}
              <button
                onClick={() => setIsTasksPanelOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer ring-1 ring-indigo-400/30"
                title="Open side-panel listing specific tasks influencing compliance maturity at this date"
              >
                <ListChecks className="w-4 h-4 text-amber-300" />
                <span>Drill-Down Tasks ({selectedSnapshot.complianceTasks?.length || 0})</span>
              </button>

              {/* Cryptographic SHA-256 Hash Badge */}
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 flex items-center space-x-2 hidden sm:flex">
                <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div className="truncate max-w-[160px]">
                  SHA-256: <span className="text-slate-300">{selectedSnapshot.snapshotHash.substring(0, 16)}...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Maturity</span>
              <div className="text-xl font-black text-sky-400">{selectedSnapshot.overallMaturity}%</div>
              <div className="text-[10px] text-slate-400">Weighted Index</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ISO 27001:2022</span>
              <div className="text-xl font-black text-emerald-400">{selectedSnapshot.iso27001Maturity}%</div>
              <div className="text-[10px] text-slate-400">93 Controls Target</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MAS TRM</span>
              <div className="text-xl font-black text-indigo-400">{selectedSnapshot.masTrmMaturity}%</div>
              <div className="text-[10px] text-slate-400">14 Domains</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Controls Enacted</span>
              <div className="text-xl font-black text-purple-400">
                {selectedSnapshot.implementedControlsCount}
                <span className="text-xs text-slate-400 font-normal"> / 93</span>
              </div>
              <div className="text-[10px] text-purple-400/80">{selectedSnapshot.controlsImplementedPct}% Done</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Evidence</span>
              <div className="text-xl font-black text-amber-400">
                {selectedSnapshot.verifiedEvidenceCount}
                <span className="text-xs text-slate-400 font-normal"> / {selectedSnapshot.totalEvidenceCount}</span>
              </div>
              <div className="text-[10px] text-amber-400/80">{selectedSnapshot.evidenceReadinessPct}% Fresh</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Findings</span>
              <div className="text-xl font-black text-rose-400">
                {selectedSnapshot.openFindingsCount}
                <span className="text-xs text-slate-400 font-normal"> Open</span>
              </div>
              <div className="text-[10px] text-slate-400">{selectedSnapshot.closedCapaCount} CAPAs Done</div>
            </div>
          </div>

          {/* Milestone Details & Auditor Field Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-sky-400">
                <Award className="w-4 h-4" />
                <h4 className="font-bold uppercase tracking-wider text-[11px]">Associated ISMS Milestone</h4>
              </div>
              <div className="space-y-1">
                <div className="text-white font-semibold">
                  {selectedSnapshot.milestoneTitle || 'Operational Compliance Maintenance'}
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Phase: <strong className="text-slate-300">{selectedSnapshot.milestonePhase || 'Continuous Monitoring'}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <h4 className="font-bold uppercase tracking-wider text-[11px]">Lead Auditor Field Note & Sign-Off</h4>
              </div>
              <p className="text-slate-300 leading-relaxed italic">
                &ldquo;{selectedSnapshot.leadAuditorNote}&rdquo;
              </p>
              <div className="text-[10px] text-slate-400 font-mono pt-1">
                Signatory: <strong className="text-slate-300">{selectedSnapshot.recordedBy}</strong>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* Drill-Down Compliance Tasks Side-Panel */}
      <SnapshotTasksSidePanel
        isOpen={isTasksPanelOpen}
        onClose={() => setIsTasksPanelOpen(false)}
        snapshot={selectedSnapshot}
        allSnapshots={snapshots}
        onSelectSnapshot={(snap) => {
          setSelectedSnapshot(snap);
          onSelectSnapshot?.(snap);
        }}
      />
    </div>
  );
};
