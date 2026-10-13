import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Flame,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { EnterpriseRiskRecord, EnterpriseRiskCategory, RiskVelocityStatus } from '../../types/enterpriseRiskTypes';

interface EnterpriseRiskRegisterProps {
  risks: EnterpriseRiskRecord[];
  onSelectRisk: (risk: EnterpriseRiskRecord) => void;
  onOpenExplainability: (risk: EnterpriseRiskRecord, tab: 'why' | 'what-changed' | 'next-action') => void;
  onCreateRiskModal: () => void;
}

export const EnterpriseRiskRegisterView: React.FC<EnterpriseRiskRegisterProps> = ({
  risks,
  onSelectRisk,
  onOpenExplainability,
  onCreateRiskModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [appetiteFilter, setAppetiteFilter] = useState<string>('ALL');

  const filteredRisks = risks.filter((r) => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (appetiteFilter === 'BREACH' && !r.isOutsideAppetite) return false;
    if (appetiteFilter === 'NOMINAL' && r.isOutsideAppetite) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.riskCode.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.riskOwner.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const categories: string[] = [
    'ALL',
    'Cybersecurity',
    'Information Security',
    'Privacy & Personal Data',
    'Third-Party & Supply Chain',
    'Artificial Intelligence',
    'Regulatory Compliance'
  ];

  return (
    <div className="space-y-4">
      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search risks by code, title, threat scenario, or owner..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* CATEGORY DROPDOWN */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* APPETITE FILTER */}
          <select
            value={appetiteFilter}
            onChange={(e) => setAppetiteFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Appetite States</option>
            <option value="BREACH">Appetite Breaches Only</option>
            <option value="NOMINAL">Within Tolerance</option>
          </select>
        </div>

        <button
          onClick={onCreateRiskModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Register New Risk
        </button>
      </div>

      {/* RISKS TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Risk Identifier & Title</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-center">Inherent</th>
                <th className="py-3.5 px-3 text-center">Control Eff.</th>
                <th className="py-3.5 px-3 text-center">Residual Score</th>
                <th className="py-3.5 px-3 text-center">Appetite Status</th>
                <th className="py-3.5 px-3 text-center">Velocity</th>
                <th className="py-3.5 px-3">Owner / Executive</th>
                <th className="py-3.5 px-4 text-right">Explainability Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    No risk records match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => {
                  const severityBadge =
                    risk.residualRiskScore >= 16
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : risk.residualRiskScore >= 10
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : risk.residualRiskScore >= 5
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                  return (
                    <tr
                      key={risk.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px] border border-indigo-500/20">
                              {risk.riskCode}
                            </span>
                            <span
                              onClick={() => onSelectRisk(risk)}
                              className="font-semibold text-white group-hover:text-indigo-300 cursor-pointer transition-colors line-clamp-1"
                            >
                              {risk.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-md">
                            {risk.riskStatement}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                          {risk.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                        {risk.inherentRiskScore}/25
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        <span className="text-emerald-400 font-bold">
                          {risk.currentControlEffectivenessPercent}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${severityBadge}`}>
                          {risk.residualRiskScore}/25 ({risk.residualLevel})
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {risk.isOutsideAppetite ? (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Breach ({risk.riskAppetiteScore})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Nominal (≤{risk.riskAppetiteScore})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            risk.riskVelocity === 'INCREASING'
                              ? 'text-orange-400 bg-orange-500/10'
                              : risk.riskVelocity === 'DECREASING'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          {risk.riskVelocity}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        <div className="text-[11px] font-medium">{risk.riskOwner}</div>
                        <div className="text-[10px] text-slate-500">{risk.accountableExecutive}</div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenExplainability(risk, 'why')}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                          >
                            Why
                          </button>
                          <span className="text-slate-700">|</span>
                          <button
                            onClick={() => onOpenExplainability(risk, 'what-changed')}
                            className="text-[11px] text-slate-400 hover:text-slate-300 font-medium hover:underline"
                          >
                            Changed
                          </button>
                          <span className="text-slate-700">|</span>
                          <button
                            onClick={() => onOpenExplainability(risk, 'next-action')}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-medium hover:underline"
                          >
                            Action
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
