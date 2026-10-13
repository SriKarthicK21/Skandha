// Skanda GRC — Compliance Heatmap Dashboard Module Widget
// Embedded card component for CommandCenterDashboard grid
// Displays high-level compliance intensity matrix across departments with quick-expand to full heatmap view

import React, { useState, useMemo } from 'react';
import {
  Grid,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Maximize2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  ComplianceHeatmapService,
  HEATMAP_DEPARTMENTS,
  HEATMAP_ISO_CLAUSES,
  HEATMAP_MAS_MODULES
} from '../../services/complianceHeatmapService';
import { useGRC } from '../../context/GRCContext';

interface ComplianceHeatmapWidgetProps {
  onExpandToFullHeatmap?: () => void;
  onNavigateModule?: (moduleId: string) => void;
}

export const ComplianceHeatmapWidget: React.FC<ComplianceHeatmapWidgetProps> = ({
  onExpandToFullHeatmap,
  onNavigateModule
}) => {
  const { theme } = useGRC();
  const [selectedStandard, setSelectedStandard] = useState<'UNIFIED' | 'ISO' | 'MAS'>('UNIFIED');

  const cells = useMemo(() => ComplianceHeatmapService.getAllCells(), []);

  const metrics = useMemo(() => {
    const relevant = selectedStandard === 'UNIFIED'
      ? cells
      : cells.filter(c =>
          selectedStandard === 'ISO' ? c.dimensionType === 'ISO_27001' : c.dimensionType === 'MAS_TRM'
        );
    return ComplianceHeatmapService.calculateMetrics(relevant);
  }, [cells, selectedStandard]);

  // Key subset of clauses/domains for compact dashboard view
  const displayColumns = useMemo(() => {
    if (selectedStandard === 'ISO') {
      return HEATMAP_ISO_CLAUSES.slice(0, 6).map(c => ({
        id: c.id,
        label: c.clauseCode,
        targetCode: c.clauseCode,
        dimensionType: 'ISO_27001' as const,
        title: c.title
      }));
    } else if (selectedStandard === 'MAS') {
      return HEATMAP_MAS_MODULES.slice(0, 6).map(m => ({
        id: m.id,
        label: m.domainNumber,
        targetCode: m.domainNumber,
        dimensionType: 'MAS_TRM' as const,
        title: m.title
      }));
    } else {
      // Unified View: 3 ISO Clauses + 3 MAS Domains
      return [
        { id: 'iso-cl4', label: 'ISO Cl.4', targetCode: 'Clause 4', dimensionType: 'ISO_27001' as const, title: 'ISO Context' },
        { id: 'iso-cl6', label: 'ISO Cl.6', targetCode: 'Clause 6', dimensionType: 'ISO_27001' as const, title: 'ISO Risk Planning' },
        { id: 'iso-a8', label: 'ISO A.8', targetCode: 'Annex A.8', dimensionType: 'ISO_27001' as const, title: 'ISO Tech Controls' },
        { id: 'mas-dom-03', label: 'MAS 3.0', targetCode: 'DOM-03', dimensionType: 'MAS_TRM' as const, title: 'MAS Governance' },
        { id: 'mas-dom-06', label: 'MAS 6.0', targetCode: 'DOM-06', dimensionType: 'MAS_TRM' as const, title: 'MAS Access Control' },
        { id: 'mas-dom-14', label: 'MAS 14.0', targetCode: 'DOM-14', dimensionType: 'MAS_TRM' as const, title: 'MAS Cloud & Vendor' }
      ];
    }
  }, [selectedStandard]);

  const getCellColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <div className={`p-5 rounded-2xl border shadow-lg space-y-4 transition-colors ${
      theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Compliance & Risk Heatmap</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                Live Coverage
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Departmental coverage intensity across ISO 27001 & MAS TRM standards.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toggle Standard */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedStandard('UNIFIED')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                selectedStandard === 'UNIFIED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setSelectedStandard('ISO')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                selectedStandard === 'ISO' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ISO 27001
            </button>
            <button
              onClick={() => setSelectedStandard('MAS')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                selectedStandard === 'MAS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MAS TRM
            </button>
          </div>

          {/* Full Screen Expand Button */}
          {onExpandToFullHeatmap && (
            <button
              onClick={onExpandToFullHeatmap}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 flex items-center space-x-1 transition cursor-pointer"
              title="Open full interactive Compliance Heatmap view"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Expand View</span>
            </button>
          )}
        </div>
      </div>

      {/* Mini KPI Bar */}
      <div className="grid grid-cols-4 gap-2 pt-1 text-center">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Overall Score</span>
          <span className="text-base font-black font-mono text-white">{metrics.averageScore}%</span>
        </div>
        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 block">Compliant (Green)</span>
          <span className="text-base font-black font-mono text-emerald-400">{metrics.compliantCount}</span>
        </div>
        <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30">
          <span className="text-[10px] text-amber-400 block">In Progress (Yellow)</span>
          <span className="text-base font-black font-mono text-amber-400">{metrics.inProgressCount}</span>
        </div>
        <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30">
          <span className="text-[10px] text-rose-400 block">Critical Gaps (Red)</span>
          <span className="text-base font-black font-mono text-rose-400">{metrics.nonCompliantCount}</span>
        </div>
      </div>

      {/* Mini Matrix Preview */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
              <th className="py-2 pr-2">Department</th>
              {displayColumns.map(col => (
                <th key={col.id} className="py-2 px-1 text-center font-mono">
                  {col.label}
                </th>
              ))}
              <th className="py-2 pl-2 text-right">Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {HEATMAP_DEPARTMENTS.slice(0, 5).map(dept => {
              const deptCells = cells.filter(
                c =>
                  c.departmentId === dept.id &&
                  (selectedStandard === 'UNIFIED'
                    ? true
                    : c.dimensionType === (selectedStandard === 'ISO' ? 'ISO_27001' : 'MAS_TRM'))
              );
              const avg = deptCells.length > 0
                ? Math.round(deptCells.reduce((a, b) => a + b.score, 0) / deptCells.length)
                : 0;

              return (
                <tr key={dept.id} className="hover:bg-slate-800/30">
                  <td className="py-2 pr-2 font-medium text-slate-300 truncate max-w-[140px]">
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${dept.avatarColor}`} />
                      <span className="truncate">{dept.shortName}</span>
                    </div>
                  </td>
                  {displayColumns.map(col => {
                    const cell = deptCells.find(
                      c => c.targetCode === col.targetCode && c.dimensionType === col.dimensionType
                    );
                    const score = cell ? cell.score : 0;
                    const trend = cell?.trend || (cell?.scoreDelta && cell.scoreDelta > 0 ? 'UP' : cell?.scoreDelta && cell.scoreDelta < 0 ? 'DOWN' : 'STABLE');
                    const delta = cell?.scoreDelta ?? (cell?.previousScore !== undefined ? cell.score - cell.previousScore : 0);

                    return (
                      <td key={col.id} className="py-1 px-1 text-center">
                        <button
                          type="button"
                          onClick={onExpandToFullHeatmap}
                          className={`w-full py-1 px-0.5 rounded text-[10px] font-mono font-bold border transition flex items-center justify-center space-x-0.5 ${getCellColor(
                            score
                          )}`}
                          title={`${dept.name} × ${col.label} (${col.title}): ${score}%\nTrend: ${
                            trend === 'UP' ? `▲ Improved (+${delta}%)` : trend === 'DOWN' ? `▼ Regressed (${delta}%)` : '▬ Stable'
                          } vs prior cycle`}
                        >
                          <span>{score}%</span>
                          {trend === 'UP' ? (
                            <ArrowUp className="w-2.5 h-2.5 text-emerald-400 shrink-0 stroke-[3]" />
                          ) : trend === 'DOWN' ? (
                            <ArrowDown className="w-2.5 h-2.5 text-rose-400 shrink-0 stroke-[3]" />
                          ) : (
                            <Minus className="w-2.5 h-2.5 text-slate-400 opacity-60 shrink-0 stroke-[3]" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-2 pl-2 text-right font-mono font-bold text-white">
                    {avg}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Banner */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>&lt;50% Non-compliant</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>50-84% In progress</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>&ge;85% Compliant</span>
          </span>
        </div>

        {onExpandToFullHeatmap && (
          <button
            onClick={onExpandToFullHeatmap}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>Full Heatmap</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
