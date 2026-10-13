import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RiskRecord } from '../../types';
import { RiskEngine, HeatmapCellMasExposure } from '../../services/RiskEngine';

interface D3RiskHeatmapChartProps {
  risks: RiskRecord[];
  viewType: 'residual' | 'inherent' | 'comparison';
  selectedCategory: string | null;
  selectedDepartment: string | null;
  selectedCell: { likelihood: number; impact: number } | null;
  onSelectCell: (cell: { likelihood: number; impact: number } | null) => void;
  onSelectRisk: (risk: RiskRecord) => void;
  selectedMasRequirement?: string | null;
  highlightMasMapped?: boolean;
  showMasExposureOverlay?: boolean;
}

const LIKELIHOOD_LABELS = [
  '1 - Rare',
  '2 - Unlikely',
  '3 - Moderate',
  '4 - Likely',
  '5 - Almost Certain'
];

const IMPACT_LABELS = [
  '1 - Insignificant',
  '2 - Minor',
  '3 - Moderate',
  '4 - Major',
  '5 - Catastrophic'
];

export const D3RiskHeatmapChart: React.FC<D3RiskHeatmapChartProps> = ({
  risks,
  viewType,
  selectedCategory,
  selectedDepartment,
  selectedCell,
  onSelectCell,
  onSelectRisk,
  selectedMasRequirement,
  highlightMasMapped,
  showMasExposureOverlay = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredRisk, setHoveredRisk] = useState<RiskRecord | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ l: number; i: number } | null>(null);
  const [hoveredCellData, setHoveredCellData] = useState<HeatmapCellMasExposure | null>(null);

  // Filter risks based on active category & department filters & MAS TRM requirement
  const filteredRisks = risks.filter(r => {
    if (selectedCategory && r.category !== selectedCategory) return false;
    if (selectedDepartment && r.department !== selectedDepartment) return false;
    if (selectedMasRequirement) {
      const mappedIds = r.frameworkMappings?.masTrmRequirementIds || [];
      const sections = r.frameworkMappings?.masTrmSections || [];
      const matchId = mappedIds.some(id => id.toLowerCase().includes(selectedMasRequirement.toLowerCase()));
      const matchSec = sections.some(sec => sec.toLowerCase().includes(selectedMasRequirement.toLowerCase()));
      if (!matchId && !matchSec) return false;
    }
    return true;
  });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 640;
    const height = Math.max(480, Math.min(width * 0.85, 580));

    const margin = { top: 40, right: 30, bottom: 65, left: 95 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'select-none font-sans overflow-visible');

    // Defs: Gradients and filters
    const defs = svg.append('defs');

    // Drop shadow filter for active nodes
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main Chart Group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales (1 to 5)
    // Impact on X-axis (1 -> 5 from left to right)
    const xScale = d3.scaleBand<number>()
      .domain([1, 2, 3, 4, 5])
      .range([0, innerWidth])
      .padding(0.08);

    // Likelihood on Y-axis (5 at top -> 1 at bottom)
    const yScale = d3.scaleBand<number>()
      .domain([5, 4, 3, 2, 1])
      .range([0, innerHeight])
      .padding(0.08);

    const cellWidth = xScale.bandwidth();
    const cellHeight = yScale.bandwidth();

    // Risk Matrix Colors (Based on ISO 27005 standard score = L * I)
    const getRiskLevel = (score: number) => {
      if (score >= 16) return { level: 'Critical', bg: '#450a0a', border: '#ef4444', fill: 'rgba(239, 68, 68, 0.22)', text: '#fca5a5' };
      if (score >= 10) return { level: 'High', bg: '#431407', border: '#f97316', fill: 'rgba(249, 115, 22, 0.20)', text: '#fdba74' };
      if (score >= 5) return { level: 'Moderate', bg: '#422006', border: '#eab308', fill: 'rgba(234, 179, 8, 0.16)', text: '#fde047' };
      return { level: 'Low', bg: '#022c22', border: '#10b981', fill: 'rgba(16, 185, 129, 0.14)', text: '#86efac' };
    };

    // 1. Draw 5x5 Matrix Cell Rectangles
    [1, 2, 3, 4, 5].forEach(i => {
      [1, 2, 3, 4, 5].forEach(l => {
        const score = l * i;
        const style = getRiskLevel(score);
        const x = xScale(i) || 0;
        const y = yScale(l) || 0;
        const isSelected = selectedCell?.likelihood === l && selectedCell?.impact === i;

        // Calculate MAS-specific exposure metrics for this heatmap cell
        const cellMas = RiskEngine.calculateHeatmapCellMasExposure(
          l,
          i,
          risks,
          viewType === 'inherent' ? 'inherent' : 'residual'
        );

        // Cell group
        const cellGroup = g.append('g')
          .attr('class', `cell-group cursor-pointer`)
          .on('click', () => {
            if (isSelected) {
              onSelectCell(null);
            } else {
              onSelectCell({ likelihood: l, impact: i });
            }
          })
          .on('mouseenter', () => {
            setHoveredCell({ l, i });
            setHoveredCellData(cellMas);
          })
          .on('mouseleave', () => {
            setHoveredCell(null);
            setHoveredCellData(null);
          });

        // Background Rect
        cellGroup.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('rx', 10)
          .attr('ry', 10)
          .attr('fill', isSelected ? style.bg : style.fill)
          .attr('stroke', isSelected ? '#38bdf8' : (showMasExposureOverlay && cellMas.exposureTier === 'CRITICAL_EXPOSURE' ? '#f43f5e' : style.border))
          .attr('stroke-width', isSelected ? 2.5 : (showMasExposureOverlay && cellMas.exposureTier === 'CRITICAL_EXPOSURE' ? 1.8 : 1))
          .attr('stroke-opacity', isSelected ? 1 : 0.6)
          .attr('filter', isSelected ? 'url(#node-glow)' : null)
          .attr('transition', 'all 0.2s ease');

        // MAS Exposure Badge (Overlay Mode)
        if ((showMasExposureOverlay || highlightMasMapped || selectedMasRequirement) && cellMas.technologyRisksCount > 0) {
          const tierColors: Record<string, { bg: string; stroke: string; text: string }> = {
            CRITICAL_EXPOSURE: { bg: '#881337', stroke: '#f43f5e', text: '#fecdd3' },
            HIGH_EXPOSURE: { bg: '#7c2d12', stroke: '#fb923c', text: '#fed7aa' },
            MEDIUM_EXPOSURE: { bg: '#713f12', stroke: '#facc15', text: '#fef08a' },
            LOW_EXPOSURE: { bg: '#064e3b', stroke: '#34d399', text: '#a7f3d0' }
          };
          const colors = tierColors[cellMas.exposureTier] || tierColors.LOW_EXPOSURE;
          const badgeWidth = Math.min(64, Math.max(48, cellWidth * 0.52));

          const badgeGroup = cellGroup.append('g')
            .attr('transform', `translate(${x + 6}, ${y + 6})`);

          badgeGroup.append('rect')
            .attr('width', badgeWidth)
            .attr('height', 15)
            .attr('rx', 4)
            .attr('fill', colors.bg)
            .attr('stroke', colors.stroke)
            .attr('stroke-width', 0.9)
            .attr('opacity', 0.95);

          badgeGroup.append('text')
            .attr('x', badgeWidth / 2)
            .attr('y', 10.5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('font-family', 'monospace')
            .attr('font-weight', 'bold')
            .attr('fill', colors.text)
            .text(`MAS ${cellMas.masExposureScore}`);

          // Statutory Notice 644/655 Indicator Dot
          if (cellMas.isStatutoryExposed) {
            cellGroup.append('circle')
              .attr('cx', x + badgeWidth + 12)
              .attr('cy', y + 13.5)
              .attr('r', 3.5)
              .attr('fill', '#f43f5e')
              .attr('stroke', '#ffffff')
              .attr('stroke-width', 0.8);
          }
        }

        // Score watermark in top-right of cell
        cellGroup.append('text')
          .attr('x', x + cellWidth - 8)
          .attr('y', y + 15)
          .attr('text-anchor', 'end')
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold')
          .attr('fill', style.text)
          .attr('opacity', 0.45)
          .text(score);

        // Coordinates in bottom-left
        cellGroup.append('text')
          .attr('x', x + 8)
          .attr('y', y + cellHeight - 8)
          .attr('text-anchor', 'start')
          .attr('font-size', '9px')
          .attr('font-weight', '600')
          .attr('fill', style.text)
          .attr('opacity', 0.5)
          .text(`L${l}×I${i}`);
      });
    });

    // 2. Risk Nodes / Bubbles Placement
    // Map risks into grid cells
    const cellMap = new Map<string, RiskRecord[]>();
    filteredRisks.forEach(r => {
      const l = viewType === 'inherent' ? r.likelihood : r.residualLikelihood;
      const i = viewType === 'inherent' ? r.impact : r.residualImpact;
      const key = `${l}-${i}`;
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key)!.push(r);
    });

    // Draw nodes within each cell
    cellMap.forEach((cellRisks, key) => {
      const [lStr, iStr] = key.split('-');
      const l = parseInt(lStr, 10);
      const i = parseInt(iStr, 10);

      const cellX = xScale(i) || 0;
      const cellY = yScale(l) || 0;
      const centerX = cellX + cellWidth / 2;
      const centerY = cellY + cellHeight / 2;

      const score = l * i;
      const riskStyle = getRiskLevel(score);
      const hasActiveTelemetry = cellRisks.some(r => (r.telemetrySignals || []).some(s => s.active));
      const hasExecutiveAcceptance = cellRisks.some(r => r.executiveAcceptance?.status === 'Accepted');

      // Calculate cell MAS exposure metrics for this coordinate
      const cellMas = RiskEngine.calculateHeatmapCellMasExposure(
        l,
        i,
        risks,
        viewType === 'inherent' ? 'inherent' : 'residual'
      );

      // Node Count Pill
      const countGroup = g.append('g')
        .attr('class', 'risk-node-cluster cursor-pointer')
        .on('click', () => {
          onSelectCell({ likelihood: l, impact: i });
        });

      // Special Animated Pulse Ring if active live telemetry alert exists
      if (hasActiveTelemetry) {
        const telePulse = countGroup.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', 18)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '2 2')
          .attr('opacity', 0.9);

        telePulse.transition()
          .duration(800)
          .ease(d3.easeSinInOut)
          .attr('r', 28)
          .attr('opacity', 0)
          .transition()
          .duration(800)
          .attr('r', 18)
          .attr('opacity', 0.9);
      }

      if (cellRisks.length === 1) {
        // Single Risk Circle
        const risk = cellRisks[0];
        const isMasMapped = (risk.frameworkMappings?.masTrmRequirementIds || []).length > 0;
        const circle = countGroup.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', 0)
          .attr('fill', hasActiveTelemetry ? '#e11d48' : riskStyle.border)
          .attr('stroke', hasExecutiveAcceptance ? '#fbbf24' : (showMasExposureOverlay && isMasMapped ? '#a855f7' : '#ffffff'))
          .attr('stroke-width', hasExecutiveAcceptance ? 2.5 : (showMasExposureOverlay && isMasMapped ? 2.2 : 2))
          .attr('filter', score >= 15 || hasActiveTelemetry ? 'url(#node-glow)' : null)
          .on('mouseenter', (e) => {
            setHoveredRisk(risk);
            setHoveredCellData(cellMas);
          })
          .on('mouseleave', () => {
            setHoveredRisk(null);
            setHoveredCellData(null);
          })
          .on('click', (e) => {
            e.stopPropagation();
            onSelectRisk(risk);
          });

        circle.transition()
          .duration(500)
          .ease(d3.easeBackOut)
          .attr('r', 16);

        countGroup.append('text')
          .attr('x', centerX)
          .attr('y', centerY + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', '#ffffff')
          .attr('pointer-events', 'none')
          .text('1');
      } else {
        // Multi-Risk Cluster Circle with badge count
        const radius = Math.min(22, 14 + cellRisks.length * 2);
        const hasMasMappedInCell = cellRisks.some(r => (r.frameworkMappings?.masTrmRequirementIds || []).length > 0);

        const circle = countGroup.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', 0)
          .attr('fill', hasActiveTelemetry ? '#e11d48' : riskStyle.border)
          .attr('stroke', hasExecutiveAcceptance ? '#fbbf24' : (showMasExposureOverlay && hasMasMappedInCell ? '#a855f7' : '#ffffff'))
          .attr('stroke-width', hasExecutiveAcceptance ? 3 : (showMasExposureOverlay && hasMasMappedInCell ? 2.5 : 2.5))
          .attr('filter', score >= 15 || hasActiveTelemetry ? 'url(#node-glow)' : null)
          .on('mouseenter', (e) => {
            setHoveredRisk(cellRisks[0]);
            setHoveredCellData(cellMas);
          })
          .on('mouseleave', () => {
            setHoveredRisk(null);
            setHoveredCellData(null);
          });

        circle.transition()
          .duration(500)
          .ease(d3.easeBackOut)
          .attr('r', radius);

        countGroup.append('text')
          .attr('x', centerX)
          .attr('y', centerY + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', '900')
          .attr('fill', '#ffffff')
          .attr('pointer-events', 'none')
          .text(cellRisks.length);

        // Small pulse ring for critical high clusters
        if (score >= 15) {
          const pulse = countGroup.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', radius + 3)
            .attr('fill', 'none')
            .attr('stroke', riskStyle.border)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8);

          pulse.transition()
            .duration(1200)
            .ease(d3.easeSinInOut)
            .attr('r', radius + 8)
            .attr('opacity', 0)
            .transition()
            .duration(1200)
            .attr('r', radius + 3)
            .attr('opacity', 0.8);
        }
      }
    });

    // 3. Comparison Mode: Draw vector transition paths from Inherent to Residual!
    if (viewType === 'comparison') {
      filteredRisks.forEach(r => {
        const fromX = (xScale(r.impact) || 0) + cellWidth / 2;
        const fromY = (yScale(r.likelihood) || 0) + cellHeight / 2;
        const toX = (xScale(r.residualImpact) || 0) + cellWidth / 2;
        const toY = (yScale(r.residualLikelihood) || 0) + cellHeight / 2;

        if (fromX !== toX || fromY !== toY) {
          // Curved path
          const dx = toX - fromX;
          const dy = toY - fromY;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;

          const path = g.append('path')
            .attr('d', `M${fromX},${fromY}A${dr},${dr} 0 0,1 ${toX},${toY}`)
            .attr('fill', 'none')
            .attr('stroke', '#38bdf8')
            .attr('stroke-width', 1.8)
            .attr('stroke-dasharray', '3 3')
            .attr('stroke-opacity', 0.7)
            .attr('marker-end', 'url(#arrow)');

          // Small origin dot
          g.append('circle')
            .attr('cx', fromX)
            .attr('cy', fromY)
            .attr('r', 3)
            .attr('fill', '#f43f5e')
            .attr('opacity', 0.6);
        }
      });
    }

    // 4. Axis Labels & Grid Markers
    // Y-Axis: Likelihood
    const yAxisGroup = g.append('g').attr('class', 'y-axis');
    [5, 4, 3, 2, 1].forEach(l => {
      const y = (yScale(l) || 0) + cellHeight / 2;
      yAxisGroup.append('text')
        .attr('x', -14)
        .attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#94a3b8')
        .text(LIKELIHOOD_LABELS[l - 1]);
    });

    // Y-Axis Title
    svg.append('text')
      .attr('x', -(height / 2))
      .attr('y', 22)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.08em')
      .attr('fill', '#cbd5e1')
      .text('PROBABILITY / LIKELIHOOD (1 - 5) →');

    // X-Axis: Impact
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight + 18})`);

    [1, 2, 3, 4, 5].forEach(i => {
      const x = (xScale(i) || 0) + cellWidth / 2;
      xAxisGroup.append('text')
        .attr('x', x)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', '#94a3b8')
        .text(IMPACT_LABELS[i - 1].split(' - ')[1]);
      
      xAxisGroup.append('text')
        .attr('x', x)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-mono', 'true')
        .attr('fill', '#64748b')
        .text(`Impact ${i}`);
    });

    // X-Axis Title
    svg.append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.08em')
      .attr('fill', '#cbd5e1')
      .text('IMPACT / SEVERITY LEVEL (1 - 5) →');

  }, [filteredRisks, viewType, selectedCell, selectedCategory, selectedDepartment]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Interactive D3 SVG Canvas */}
      <div className="flex justify-center w-full overflow-x-auto py-2">
        <svg ref={svgRef} className="max-w-full drop-shadow-md" />
      </div>

      {/* Hover Tooltip Overlay */}
      {hoveredRisk && (
        <div
          ref={tooltipRef}
          className="absolute z-40 p-3 rounded-xl bg-slate-900/95 border border-sky-500/50 shadow-2xl backdrop-blur-md text-xs text-white max-w-xs pointer-events-none top-4 right-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-700">
            <span className="font-mono font-bold text-sky-400 text-[11px]">{hoveredRisk.riskCode}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
              {hoveredRisk.category}
            </span>
          </div>
          <div className="font-semibold text-white leading-tight mb-1">{hoveredRisk.title}</div>
          <div className="text-[11px] text-slate-300 line-clamp-2 mb-2">{hoveredRisk.threatDescription}</div>
          
          {/* Quick Badges in Tooltip */}
          <div className="flex flex-wrap gap-1 mb-2">
            {hoveredRisk.executiveAcceptance?.status === 'Accepted' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Clause 6.1.3 Accepted
              </span>
            )}
            {(hoveredRisk.telemetrySignals || []).some(s => s.active) && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                Live Telemetry Active
              </span>
            )}
            {(hoveredRisk.evidenceLinks || []).length > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {hoveredRisk.evidenceLinks?.length} Evidences Linked
              </span>
            )}
            {(hoveredRisk.frameworkMappings?.masTrmRequirementIds || []).length > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1 font-mono">
                <span>MAS:</span>
                <span>{hoveredRisk.frameworkMappings?.masTrmRequirementIds?.slice(0, 2).join(', ')}</span>
                {(hoveredRisk.frameworkMappings?.masTrmRequirementIds?.length || 0) > 2 && (
                  <span>+{(hoveredRisk.frameworkMappings?.masTrmRequirementIds?.length || 0) - 2}</span>
                )}
              </span>
            )}
          </div>

          {/* MAS TRM Exposure Metrics Ribbon in Risk Tooltip */}
          {hoveredCellData && hoveredCellData.technologyRisksCount > 0 && (
            <div className="p-2 mb-2 rounded-lg bg-indigo-950/70 border border-indigo-800/80">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-indigo-300">MAS TRM Exposure</span>
                <span className={`px-1.5 py-0.2 rounded font-bold font-mono text-[9px] ${
                  hoveredCellData.exposureTier === 'CRITICAL_EXPOSURE' ? 'bg-rose-900 text-rose-200' :
                  hoveredCellData.exposureTier === 'HIGH_EXPOSURE' ? 'bg-orange-900 text-orange-200' :
                  hoveredCellData.exposureTier === 'MEDIUM_EXPOSURE' ? 'bg-amber-900 text-amber-200' :
                  'bg-emerald-900 text-emerald-200'
                }`}>
                  Score {hoveredCellData.masExposureScore}/100 ({hoveredCellData.exposureTier.replace('_', ' ')})
                </span>
              </div>
              {hoveredCellData.isStatutoryExposed && (
                <div className="flex flex-wrap gap-1 text-[8.5px] font-semibold text-rose-300 mb-1">
                  {hoveredCellData.isStatutoryNotice644Exposed && (
                    <span className="bg-rose-950 px-1 py-0.5 rounded border border-rose-800">
                      ⚠️ Notice 644 (Critical 4h RTO)
                    </span>
                  )}
                  {hoveredCellData.isStatutoryNotice655Exposed && (
                    <span className="bg-rose-950 px-1 py-0.5 rounded border border-rose-800">
                      ⚠️ Notice 655 (Cyber Hygiene)
                    </span>
                  )}
                </div>
              )}
              {hoveredCellData.mappedRequirementCodes.length > 0 && (
                <div className="text-[9px] text-slate-300 truncate">
                  <span className="text-slate-400">Mapped: </span>
                  <span className="font-mono text-indigo-200">{hoveredCellData.mappedRequirementCodes.slice(0, 3).join(', ')}</span>
                  {hoveredCellData.mappedRequirementCodes.length > 3 && (
                    <span className="text-slate-400"> +{hoveredCellData.mappedRequirementCodes.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800 text-[10px]">
            <div className="bg-slate-800/80 p-1.5 rounded">
              <span className="text-slate-400 block">Inherent:</span>
              <span className="font-mono font-bold text-rose-300">
                Score {hoveredRisk.inherentScore} (L{hoveredRisk.likelihood}×I{hoveredRisk.impact})
              </span>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded">
              <span className="text-slate-400 block">Residual:</span>
              <span className="font-mono font-bold text-emerald-300">
                Score {hoveredRisk.residualScore} (L{hoveredRisk.residualLikelihood}×I{hoveredRisk.residualImpact})
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-sky-300 flex items-center justify-between">
            <span>Owner: {hoveredRisk.treatmentOwner}</span>
            <span className="underline font-semibold">Click to view details</span>
          </div>
        </div>
      )}

      {/* Hover Cell Inspector Tooltip (When hovering empty/cell coordinate without direct risk bubble hover) */}
      {!hoveredRisk && hoveredCellData && hoveredCellData.totalRisks > 0 && (
        <div
          className="absolute z-40 p-3 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-md text-xs text-white max-w-xs pointer-events-none top-4 right-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-700">
            <span className="font-mono font-bold text-indigo-300 text-[11px]">
              Cell L{hoveredCellData.likelihood} × I{hoveredCellData.impact} (Risk: {hoveredCellData.score})
            </span>
            <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono ${
              hoveredCellData.exposureTier === 'CRITICAL_EXPOSURE' ? 'bg-rose-900 text-rose-200' :
              hoveredCellData.exposureTier === 'HIGH_EXPOSURE' ? 'bg-orange-900 text-orange-200' :
              hoveredCellData.exposureTier === 'MEDIUM_EXPOSURE' ? 'bg-amber-900 text-amber-200' :
              'bg-emerald-900 text-emerald-200'
            }`}>
              {hoveredCellData.exposureTier.replace('_', ' ')}
            </span>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
            <div className="bg-slate-800/80 p-1.5 rounded">
              <span className="text-slate-400 block text-[9px]">MAS Exposure:</span>
              <span className="font-mono font-bold text-indigo-300 text-sm">
                {hoveredCellData.masExposureScore}/100
              </span>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded">
              <span className="text-slate-400 block text-[9px]">Total Risks:</span>
              <span className="font-mono font-bold text-white text-sm">
                {hoveredCellData.totalRisks}
              </span>
              <span className="text-[8.5px] text-slate-400 ml-1">
                ({hoveredCellData.mappedTechnologyRisksCount} tech mapped)
              </span>
            </div>
          </div>

          {/* Statutory Notices Alert */}
          {hoveredCellData.isStatutoryExposed && (
            <div className="p-1.5 mb-2 rounded bg-rose-950/80 border border-rose-800 text-[9.5px] text-rose-200">
              <span className="font-bold block">⚠️ Statutory Exposure Alert</span>
              {hoveredCellData.isStatutoryNotice644Exposed && (
                <div className="text-[8.5px] text-rose-300">• Notice 644 (Critical Systems 4h RTO)</div>
              )}
              {hoveredCellData.isStatutoryNotice655Exposed && (
                <div className="text-[8.5px] text-rose-300">• Notice 655 (Cyber Hygiene Mandate)</div>
              )}
            </div>
          )}

          {/* Mapped Requirements */}
          {hoveredCellData.mappedRequirementCodes.length > 0 && (
            <div className="mb-2">
              <span className="text-[9px] text-slate-400 block mb-1">Mapped MAS TRM Requirements:</span>
              <div className="flex flex-wrap gap-1">
                {hoveredCellData.mappedRequirementCodes.map(code => (
                  <span key={code} className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[8.5px] font-mono">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Risk Codes */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] text-slate-400">
            <span>Risks: {hoveredCellData.topRiskCodes.join(', ')}</span>
            <span className="text-sky-400 font-semibold">Click to select cell</span>
          </div>
        </div>
      )}
    </div>
  );
};
