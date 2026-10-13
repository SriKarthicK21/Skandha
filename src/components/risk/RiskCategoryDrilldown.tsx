import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RiskRecord } from '../../types';
import {
  ShieldAlert,
  Layers,
  Building2,
  Server,
  Workflow,
  CheckCircle2,
  Filter,
  X,
  ChevronRight,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

interface RiskCategoryDrilldownProps {
  risks: RiskRecord[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedDepartment: string | null;
  onSelectDepartment: (dept: string | null) => void;
  onSelectRisk?: (risk: RiskRecord) => void;
}

interface CategoryStats {
  category: string;
  count: number;
  criticalCount: number;
  highCount: number;
  avgInherentScore: number;
  avgResidualScore: number;
  reductionPct: number;
  color: string;
  icon: React.ElementType;
}

const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  'Information Security': { color: '#ef4444', icon: ShieldAlert },
  'Legal & Compliance': { color: '#8b5cf6', icon: ShieldCheck },
  'Asset': { color: '#0ea5e9', icon: Server },
  'Process': { color: '#f59e0b', icon: Workflow },
  'Vendor': { color: '#ec4899', icon: Building2 },
  'Department': { color: '#10b981', icon: Layers },
};

export const RiskCategoryDrilldown: React.FC<RiskCategoryDrilldownProps> = ({
  risks,
  selectedCategory,
  onSelectCategory,
  selectedDepartment,
  onSelectDepartment,
  onSelectRisk
}) => {
  const chartRef = useRef<SVGSVGElement>(null);

  // Group risks by category
  const categories = Array.from(new Set(risks.map(r => r.category || 'Uncategorized')));
  
  const categoryStats: CategoryStats[] = categories.map(cat => {
    const catRisks = risks.filter(r => r.category === cat);
    const count = catRisks.length;
    const criticalCount = catRisks.filter(r => r.residualScore >= 16 || r.inherentScore >= 16).length;
    const highCount = catRisks.filter(r => (r.residualScore >= 10 && r.residualScore < 16) || (r.inherentScore >= 10 && r.inherentScore < 16)).length;
    
    const totalInherent = catRisks.reduce((acc, r) => acc + r.inherentScore, 0);
    const totalResidual = catRisks.reduce((acc, r) => acc + r.residualScore, 0);
    const avgInherentScore = count > 0 ? totalInherent / count : 0;
    const avgResidualScore = count > 0 ? totalResidual / count : 0;
    const reductionPct = avgInherentScore > 0 ? Math.round(((avgInherentScore - avgResidualScore) / avgInherentScore) * 100) : 0;

    const conf = CATEGORY_CONFIG[cat] || { color: '#64748b', icon: Layers };

    return {
      category: cat,
      count,
      criticalCount,
      highCount,
      avgInherentScore: parseFloat(avgInherentScore.toFixed(1)),
      avgResidualScore: parseFloat(avgResidualScore.toFixed(1)),
      reductionPct,
      color: conf.color,
      icon: conf.icon
    };
  }).sort((a, b) => b.count - a.count);

  // Render D3 Interactive Horizontal Category Distribution Bar Chart
  useEffect(() => {
    if (!chartRef.current || categoryStats.length === 0) return;

    const width = 360;
    const height = categoryStats.length * 44 + 30;
    const margin = { top: 10, right: 40, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'overflow-visible font-sans');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxCount = Math.max(...categoryStats.map(d => d.count), 1);

    const yScale = d3.scaleBand()
      .domain(categoryStats.map(d => d.category))
      .range([0, innerHeight])
      .padding(0.25);

    const xScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([0, innerWidth]);

    // Draw Bars
    categoryStats.forEach(d => {
      const y = yScale(d.category) || 0;
      const barHeight = yScale.bandwidth();
      const isSelected = selectedCategory === d.category;

      const barGroup = g.append('g')
        .attr('class', 'cursor-pointer group')
        .on('click', () => {
          onSelectCategory(isSelected ? null : d.category);
        });

      // Background Track
      barGroup.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', innerWidth)
        .attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', '#1e293b')
        .attr('opacity', 0.5);

      // Value Bar
      barGroup.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', d.color)
        .attr('opacity', isSelected ? 1 : 0.8)
        .transition()
        .duration(600)
        .attr('width', xScale(d.count));

      // Category Label (Y-axis left)
      barGroup.append('text')
        .attr('x', -8)
        .attr('y', y + barHeight / 2 + 3)
        .attr('text-anchor', 'end')
        .attr('font-size', '10.5px')
        .attr('font-weight', isSelected ? 'bold' : '500')
        .attr('fill', isSelected ? '#38bdf8' : '#cbd5e1')
        .text(d.category.length > 15 ? d.category.slice(0, 14) + '...' : d.category);

      // Value Count Label
      barGroup.append('text')
        .attr('x', xScale(d.count) + 6)
        .attr('y', y + barHeight / 2 + 3.5)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#f8fafc')
        .text(`${d.count}`);
    });

  }, [categoryStats, selectedCategory]);

  // Unique departments for secondary filter
  const departments = Array.from(new Set(risks.map(r => r.department).filter(Boolean)));

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Header & Drilldown Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Drilldown Hierarchy</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-sky-400 font-bold">
              {selectedCategory || 'All Risk Categories'}
            </span>
            {selectedDepartment && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-emerald-400 font-bold">{selectedDepartment}</span>
              </>
            )}
          </div>
          <h3 className="text-sm font-bold text-white mt-1">Category & Functional Domain Drilldown</h3>
        </div>

        {(selectedCategory || selectedDepartment) && (
          <button
            onClick={() => {
              onSelectCategory(null);
              onSelectDepartment(null);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* D3 Distribution Bar Chart */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>Risks per Category Distribution (D3.js)</span>
          <span className="text-[10px] text-sky-400">Click bar to drill down</span>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <svg ref={chartRef} className="w-full" />
        </div>
      </div>

      {/* Category Filter Cards Grid */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-400 block">Quick Category Select</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categoryStats.map(stat => {
            const Icon = stat.icon;
            const isSelected = selectedCategory === stat.category;

            return (
              <button
                key={stat.category}
                onClick={() => onSelectCategory(isSelected ? null : stat.category)}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-sky-950/70 border-sky-400 ring-1 ring-sky-400/50 shadow-lg shadow-sky-950/40'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: `${stat.color}33`, border: `1px solid ${stat.color}66` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                    {stat.count}
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold text-white truncate">{stat.category}</div>
                
                <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-400">
                  <TrendingDown className="w-3 h-3" />
                  <span>-{stat.reductionPct}% post-treatment</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Department Secondary Selector */}
      {departments.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">
            Filter by In-Scope Department
          </label>
          <select
            value={selectedDepartment || ''}
            onChange={(e) => onSelectDepartment(e.target.value ? e.target.value : null)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Departments ({risks.length} risks)</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept} ({risks.filter(r => r.department === dept).length} risks)
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
