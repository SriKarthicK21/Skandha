import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RiskRecord } from '../../types';
import { ArrowRight, TrendingDown, Shield, CheckCircle2 } from 'lucide-react';

interface RiskVectorShiftChartProps {
  risks: RiskRecord[];
  onSelectRisk?: (risk: RiskRecord) => void;
}

export const RiskVectorShiftChart: React.FC<RiskVectorShiftChartProps> = ({ risks, onSelectRisk }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const avgInherent = risks.length > 0
    ? (risks.reduce((acc, r) => acc + r.inherentScore, 0) / risks.length).toFixed(1)
    : '0';

  const avgResidual = risks.length > 0
    ? (risks.reduce((acc, r) => acc + r.residualScore, 0) / risks.length).toFixed(1)
    : '0';

  const reductionPct = parseFloat(avgInherent) > 0
    ? Math.round(((parseFloat(avgInherent) - parseFloat(avgResidual)) / parseFloat(avgInherent)) * 100)
    : 0;

  useEffect(() => {
    if (!svgRef.current || risks.length === 0) return;

    const width = 560;
    const height = 300;
    const margin = { top: 25, right: 30, bottom: 45, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'overflow-visible font-sans select-none');

    // Arrow marker definition
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'vector-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#38bdf8');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale 1 to 5 for Impact (X) and Likelihood (Y)
    const xScale = d3.scaleLinear().domain([1, 5]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([1, 5]).range([innerHeight, 0]);

    // Background quadrant bands
    // High Risk Zone (top right)
    g.append('rect')
      .attr('x', xScale(3))
      .attr('y', yScale(5))
      .attr('width', xScale(5) - xScale(3))
      .attr('height', yScale(3) - yScale(5))
      .attr('fill', '#ef4444')
      .attr('opacity', 0.08)
      .attr('rx', 8);

    g.append('text')
      .attr('x', xScale(4))
      .attr('y', yScale(4.5))
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#f87171')
      .attr('opacity', 0.6)
      .text('CRITICAL RAW ZONE');

    // Safe Zone (bottom left)
    g.append('rect')
      .attr('x', xScale(1))
      .attr('y', yScale(2))
      .attr('width', xScale(3) - xScale(1))
      .attr('height', yScale(1) - yScale(2))
      .attr('fill', '#10b981')
      .attr('opacity', 0.08)
      .attr('rx', 8);

    g.append('text')
      .attr('x', xScale(2))
      .attr('y', yScale(1.3))
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#34d399')
      .attr('opacity', 0.6)
      .text('SAFE CONTROLLED ZONE');

    // Grid lines
    [1, 2, 3, 4, 5].forEach(val => {
      // Horizontal
      g.append('line')
        .attr('x1', 0)
        .attr('y1', yScale(val))
        .attr('x2', innerWidth)
        .attr('y2', yScale(val))
        .attr('stroke', '#334155')
        .attr('stroke-dasharray', '2 2')
        .attr('opacity', 0.5);

      // Vertical
      g.append('line')
        .attr('x1', xScale(val))
        .attr('y1', 0)
        .attr('x2', xScale(val))
        .attr('y2', innerHeight)
        .attr('stroke', '#334155')
        .attr('stroke-dasharray', '2 2')
        .attr('opacity', 0.5);
    });

    // Draw Vector Lines with jitter for overlapping points
    risks.forEach((r, idx) => {
      const jitterX = ((idx % 3) - 1) * 6;
      const jitterY = (((idx * 2) % 3) - 1) * 6;

      const x1 = xScale(r.impact) + jitterX;
      const y1 = yScale(r.likelihood) + jitterY;
      const x2 = xScale(r.residualImpact) + jitterX;
      const y2 = yScale(r.residualLikelihood) + jitterY;

      // Inherent raw dot (Red)
      g.append('circle')
        .attr('cx', x1)
        .attr('cy', y1)
        .attr('r', 4)
        .attr('fill', '#f43f5e')
        .attr('stroke', '#881337')
        .attr('stroke-width', 1);

      // Transition Line
      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '3 2')
        .attr('marker-end', 'url(#vector-arrow)')
        .attr('opacity', 0.75);

      // Residual target dot (Green)
      const resDot = g.append('circle')
        .attr('cx', x2)
        .attr('cy', y2)
        .attr('r', 4)
        .attr('fill', '#10b981')
        .attr('stroke', '#064e3b')
        .attr('stroke-width', 1)
        .attr('class', 'cursor-pointer');

      if (onSelectRisk) {
        resDot.on('click', () => onSelectRisk(r));
      }
    });

    // Axes
    // Y Axis (Likelihood)
    [1, 2, 3, 4, 5].forEach(l => {
      g.append('text')
        .attr('x', -8)
        .attr('y', yScale(l) + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('font-mono', 'true')
        .attr('fill', '#94a3b8')
        .text(`L${l}`);
    });

    // X Axis (Impact)
    [1, 2, 3, 4, 5].forEach(i => {
      g.append('text')
        .attr('x', xScale(i))
        .attr('y', innerHeight + 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-mono', 'true')
        .attr('fill', '#94a3b8')
        .text(`I${i}`);
    });

    // Axis Titles
    svg.append('text')
      .attr('x', -(height / 2))
      .attr('y', 14)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('font-size', '9.5px')
      .attr('font-weight', 'bold')
      .attr('fill', '#cbd5e1')
      .text('LIKELIHOOD →');

    svg.append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9.5px')
      .attr('font-weight', 'bold')
      .attr('fill', '#cbd5e1')
      .text('IMPACT SEVERITY →');

  }, [risks]);

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
              D3.js Trajectory Vectors
            </span>
            <span className="text-xs text-slate-400">{risks.length} Risk Vectors</span>
          </div>
          <h3 className="text-sm font-bold text-white mt-1">
            Pre-Treatment (Inherent) → Post-Control (Residual) Migration
          </h3>
        </div>

        {/* Aggregate Reduction Metric */}
        <div className="flex items-center space-x-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Overall Score Drop</span>
            <span className="text-xs font-mono font-bold text-white">{avgInherent} → {avgResidual}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center space-x-1 text-emerald-400 font-bold text-sm font-mono">
            <TrendingDown className="w-4 h-4" />
            <span>-{reductionPct}%</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-center">
        <svg ref={svgRef} className="w-full max-w-xl" />
      </div>

      {/* Vector Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300" />
          <span className="text-slate-300 font-medium">Inherent Raw Threat (Before Controls)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-300 font-medium">Mitigation Vector Shift</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300" />
          <span className="text-slate-300 font-medium">Residual Controlled State</span>
        </div>
      </div>
    </div>
  );
};
