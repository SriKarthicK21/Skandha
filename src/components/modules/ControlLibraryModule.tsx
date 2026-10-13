import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { ControlItem } from '../../types';
import { PageContainer } from '../layout/PageContainer';
import {
  Grid3X3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileCheck,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Edit2
} from 'lucide-react';

export const ControlLibraryModule: React.FC = () => {
  const { currentTenant, updateControl, evidence } = useGRC();
  const controls = currentTenant?.controls || [];
  const tenantEvidence = evidence.filter(e => e.tenantId === currentTenant?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [applicabilityFilter, setApplicabilityFilter] = useState<'All' | 'Applicable' | 'Excluded'>('All');
  const [expandedControlId, setExpandedControlId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedControlId(prev => (prev === id ? null : id));
  };

  const handleToggleApplicable = (ctrl: ControlItem, applicable: boolean) => {
    updateControl(ctrl.id, {
      applicable
    });
  };

  const handleUpdateJustification = (ctrl: ControlItem, justification: string) => {
    updateControl(ctrl.id, {
      justification
    });
  };

  const filteredControls = controls.filter(c => {
    const matchesSearch =
      c.controlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesApplicability =
      applicabilityFilter === 'All' ||
      (applicabilityFilter === 'Applicable' && c.applicable) ||
      (applicabilityFilter === 'Excluded' && !c.applicable);
    return matchesSearch && matchesCategory && matchesApplicability;
  });

  return (
    <PageContainer id="control-library-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                Master Security Controls Framework
              </span>
              <span className="text-xs text-slate-400">Standard: ISO/IEC 27001:2022 Annex A</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Control Library & Statement of Applicability</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Master catalogue of Annex A controls across Organizational (37), People (8), Physical (14), and Technological (34) categories. Inspect implementation guidance, review justifications, and link operational evidence.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              {controls.filter(c => c.applicable).length} Applicable
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
              {controls.filter(c => !c.applicable).length} Excluded
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search controls by code, title or text..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Categories</option>
            <option value="Organizational">Organizational (A.5)</option>
            <option value="People">People (A.6)</option>
            <option value="Physical">Physical (A.7)</option>
            <option value="Technological">Technological (A.8)</option>
          </select>

          <select
            value={applicabilityFilter}
            onChange={e => setApplicabilityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="Applicable">Applicable</option>
            <option value="Excluded">Excluded</option>
          </select>
        </div>
      </div>

      {/* Controls List Accordion */}
      <div className="space-y-3">
        {filteredControls.map(ctrl => {
          const isExpanded = expandedControlId === ctrl.id;
          const mappedEvidence = tenantEvidence.filter(e => e.controlCode === ctrl.controlCode);

          return (
            <div
              key={ctrl.id}
              className={`p-4 rounded-2xl border transition-all ${
                ctrl.applicable
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-70'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div
                  onClick={() => toggleExpand(ctrl.id)}
                  className="flex items-start space-x-3 cursor-pointer flex-1"
                >
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 shrink-0 mt-0.5">
                    {ctrl.controlCode}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{ctrl.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                        {ctrl.category}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {ctrl.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {/* Applicability Switch */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleToggleApplicable(ctrl, true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        ctrl.applicable
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Applicable</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleApplicable(ctrl, false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        !ctrl.applicable
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <X className="w-3 h-3" />
                      <span>Excluded</span>
                    </button>
                  </div>

                  <button
                    onClick={() => toggleExpand(ctrl.id)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-white mb-1">Standard Control Requirement & Guidance</h4>
                    <p className="text-slate-300 leading-relaxed">{ctrl.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-sky-400 text-[11px] uppercase">
                        Applicability Justification & Scope Context
                      </h4>
                      <input
                        type="text"
                        value={ctrl.justification}
                        onChange={e => handleUpdateJustification(ctrl, e.target.value)}
                        placeholder="State technical or organizational justification..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-emerald-400 text-[11px] uppercase">
                        Mapped Operational Evidence ({mappedEvidence.length} Artefacts)
                      </h4>
                      {mappedEvidence.length > 0 ? (
                        <div className="space-y-1">
                          {mappedEvidence.map(e => (
                            <div key={e.id} className="flex items-center justify-between text-[11px] text-slate-300">
                              <span className="truncate">{e.title}</span>
                              <span className="text-emerald-400 font-mono text-[10px]">{e.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-[11px]">No evidence artefacts mapped yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};
