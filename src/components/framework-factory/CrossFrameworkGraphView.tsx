/**
 * SKANDA Enterprise Framework Factory — Cross-Framework Control Graph & Harmonization Explorer
 * Path: src/components/framework-factory/CrossFrameworkGraphView.tsx
 */

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Layers,
  ShieldCheck,
  Search,
  Filter,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  FileCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { CanonicalControl, CrossFrameworkMappingEdge, FrameworkRecord } from '../../types/frameworkFactoryTypes';

interface CrossFrameworkGraphViewProps {
  frameworks: FrameworkRecord[];
  controls: CanonicalControl[];
  mappings: CrossFrameworkMappingEdge[];
  onSelectControl?: (controlId: string) => void;
}

export const CrossFrameworkGraphView: React.FC<CrossFrameworkGraphViewProps> = ({
  frameworks,
  controls,
  mappings,
  onSelectControl
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedControl, setSelectedControl] = useState<CanonicalControl | null>(controls[0] || null);

  const domains = [
    { id: 'ALL', label: 'All Control Domains' },
    { id: 'ACCESS_CONTROL', label: 'Access Control (IAM)' },
    { id: 'CRYPTOGRAPHY', label: 'Cryptography & Data Protection' },
    { id: 'LOGGING_MONITORING', label: 'Logging, SIEM & Telemetry' },
    { id: 'VULNERABILITY_MGMT', label: 'Vulnerability & Patching' },
    { id: 'BUSINESS_CONTINUITY', label: 'Business Continuity (BCM)' },
    { id: 'THIRD_PARTY_RISK', label: 'Third-Party Risk (TPRM)' },
    { id: 'AI_GOVERNANCE', label: 'AI Governance & Safety' },
    { id: 'PRIVACY', label: 'Privacy & Data Subject Rights' }
  ];

  const filteredControls = controls.filter(c => {
    if (selectedDomain !== 'ALL' && c.domain !== selectedDomain) return false;
    if (selectedFramework !== 'ALL' && !c.supportedFrameworks.includes(selectedFramework)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.controlCode.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  const activeControlMappings = selectedControl
    ? mappings.filter(m => m.canonicalControlId === selectedControl.controlId)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Cross-Framework Control Graph & Harmonization Crosswalk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize how 1 canonical control satisfies obligations across ISO 27001, SOC 2, NIST CSF, PCI DSS, MAS TRM, DORA, and DPDP Act.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search canonical controls..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {domains.map(d => {
          const isActive = selectedDomain === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Graph Layout: Controls Matrix on Left, Crosswalk Impact on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Canonical Controls List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Canonical Control Library ({filteredControls.length})</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">1 Control → Multi-Framework</span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredControls.map(ctrl => {
              const isSelected = selectedControl?.controlId === ctrl.controlId;
              return (
                <div
                  key={ctrl.controlId}
                  onClick={() => setSelectedControl(ctrl)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/40 px-2 py-0.5 rounded">
                      {ctrl.controlCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      {ctrl.supportedFrameworks.length} Frameworks
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {ctrl.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {ctrl.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {ctrl.supportedFrameworks.slice(0, 4).map(fwCode => (
                      <span key={fwCode} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {fwCode.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {ctrl.supportedFrameworks.length > 4 && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        +{ctrl.supportedFrameworks.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Multi-Framework Crosswalk Breakdown */}
        <div className="lg:col-span-7">
          {selectedControl ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded">
                      {selectedControl.controlCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Domain: {selectedControl.domain}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                    {selectedControl.title}
                  </h2>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {selectedControl.type}
                </span>
              </div>

              {/* Implementation Guidance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Canonical Implementation Standard
                </h4>
                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedControl.implementationGuidance}
                </div>
              </div>

              {/* Supported Frameworks Badges Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Simultaneously Satisfies {selectedControl.supportedFrameworks.length} Framework Obligations
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedControl.supportedFrameworks.map(fwCode => (
                    <div key={fwCode} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {fwCode.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crosswalk Mapping Edges */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Authoritative Cross-Framework Mapping Edges ({activeControlMappings.length})
                </h4>

                <div className="space-y-2.5">
                  {activeControlMappings.map(edge => (
                    <div key={edge.mappingId} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">{edge.sourceRequirementCode}</span>
                          <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-cyan-600 dark:text-cyan-400">{edge.targetRequirementCode}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          {edge.confidence} MATCH
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {edge.mappingRationale}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Provenance: {edge.provenance} • Verified by {edge.verifiedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Select a canonical control to inspect crosswalk linkages and multi-standard coverage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
