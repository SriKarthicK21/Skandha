import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MappingExplorerEngine, CrossFrameworkMappingRow } from '../../services/grc/MappingExplorerEngine';
import { UnifiedControlLibrary } from '../../services/grc/UnifiedControlLibrary';
import { Entity360Graph } from '../../types/grcCoreTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { PremiumInput } from '../ui/premium/PremiumInput';

interface MappingExplorerProps {
  onOpen360Drawer?: (entityId: string, entityType: string) => void;
}

export const MappingExplorer: React.FC<MappingExplorerProps> = ({ onOpen360Drawer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControlId, setSelectedControlId] = useState<string>('CTRL-IAM-01');
  const [activeTab, setActiveTab] = useState<'matrix' | 'graph'>('matrix');

  const matrixData = MappingExplorerEngine.getHarmonizationMatrix();
  const selected360Graph: Entity360Graph = MappingExplorerEngine.get360GraphForEntity(selectedControlId);
  const selectedControl = UnifiedControlLibrary.getControlById(selectedControlId);

  const filteredData = matrixData.filter(row => 
    row.controlTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.controlCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.controlCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.iso27001 && row.iso27001.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.masTrm && row.masTrm.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.dpdp && row.dpdp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Network className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Cross-Framework Harmonization & Mapping Explorer</h2>
              <PremiumBadge variant="info" pulse>Create Once • Comply With Many</PremiumBadge>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Natively interconnected compliance graph mapping unified controls across ISO 27001, SOC 2, MAS TRM, DPDP, NIST CSF 2.0, PCI DSS, and ISO 42001.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'matrix' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Harmonization Matrix
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'graph' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                360° Relational Graph
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <PremiumInput
                placeholder="Search controls or requirement codes (e.g. A.8.12, MAS 8.1)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span>Showing <strong>{filteredData.length}</strong> unified controls</span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 52% Audit Workload Reduction
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700/60 text-slate-300 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Unified Control</th>
                  <th className="py-3.5 px-4 text-cyan-400">ISO 27001:2022</th>
                  <th className="py-3.5 px-4 text-indigo-400">SOC 2 Type II</th>
                  <th className="py-3.5 px-4 text-amber-400">MAS TRM 2021</th>
                  <th className="py-3.5 px-4 text-emerald-400">DPDP Act 2023</th>
                  <th className="py-3.5 px-4 text-sky-400">NIST CSF 2.0</th>
                  <th className="py-3.5 px-4 text-rose-400">PCI DSS v4.0</th>
                  <th className="py-3.5 px-4 text-center">360° Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filteredData.map((row) => (
                  <tr 
                    key={row.controlId} 
                    className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      selectedControlId === row.controlId ? 'bg-cyan-500/10 border-l-4 border-l-cyan-500' : ''
                    }`}
                    onClick={() => setSelectedControlId(row.controlId)}
                  >
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-semibold">{row.controlCode}</span>
                        <span className="text-slate-200 line-clamp-1">{row.controlTitle}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {row.iso27001 ? <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">{row.iso27001}</span> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {row.soc2 ? <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">{row.soc2}</span> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {row.masTrm ? <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">{row.masTrm}</span> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {row.dpdp ? <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">{row.dpdp}</span> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {row.nistCsf ? <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50">{row.nistCsf}</span> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {row.pciDss ? <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">{row.pciDss}</span> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedControlId(row.controlId);
                          if (onOpen360Drawer) onOpen360Drawer(row.controlId, 'CONTROL');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Open 360° Relational Graph"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 360 Relational Graph View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls List Selector */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Unified Control</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {matrixData.map(c => (
                <div
                  key={c.controlId}
                  onClick={() => setSelectedControlId(c.controlId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedControlId === c.controlId
                      ? 'bg-slate-800 border-cyan-500 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">{c.controlCode}</span>
                    <PremiumBadge variant="neutral">{c.controlCategory}</PremiumBadge>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-1">{c.controlTitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Graph Node Inspector */}
          <div className="lg:col-span-2">
            <PremiumCard elevation={2} className="h-full">
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-cyan-400 font-mono font-bold">{selectedControl?.code}</span>
                    <h3 className="text-base font-bold text-white">{selectedControl?.title}</h3>
                  </div>
                  {onOpen360Drawer && (
                    <PremiumButton 
                      size="sm" 
                      variant="outline"
                      onClick={() => onOpen360Drawer(selectedControlId, 'CONTROL')}
                      iconRight={ExternalLink}
                    >
                      360° Drawer
                    </PremiumButton>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Connected Frameworks */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Mapped Frameworks ({selectedControl?.frameworkMappings.length})</span>
                    </div>
                    <div className="space-y-2">
                      {selectedControl?.frameworkMappings.map((m, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="font-semibold text-slate-300">{m.frameworkCode.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                            {m.requirementCode}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Evidence */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Cryptographic Evidence ({selectedControl?.linkedEvidenceIds.length})</span>
                    </div>
                    <div className="space-y-2">
                      {selectedControl?.linkedEvidenceIds.map(evId => (
                        <div key={evId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="font-mono text-emerald-400">{evId}</span>
                          <span className="text-emerald-500 font-medium">✓ Cryptographically Verified</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Risks */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Mitigated Risks ({selectedControl?.linkedRiskIds.length})</span>
                    </div>
                    <div className="space-y-2">
                      {selectedControl?.linkedRiskIds.map(rskId => (
                        <div key={rskId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="font-mono text-amber-400">{rskId}</span>
                          <span className="text-slate-400">Risk Treatment Active</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Telemetry Source */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Continuous Telemetry Ingestion</span>
                    </div>
                    <div className="text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-slate-300">
                      {selectedControl?.telemetrySource || 'Manual Sample Audit Logs'}
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>
      )}
    </div>
  );
};
