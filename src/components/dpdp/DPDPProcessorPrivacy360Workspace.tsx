import React, { useState } from 'react';
import { dpdpPrivacyEngine } from '../../services/canonical/DpdpPrivacyEngineService';
import { DPDPProcessor360 } from '../../types/dpdpPlatformTypes';
import {
  Server,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  GitBranch
} from 'lucide-react';

interface DPDPProcessorPrivacy360WorkspaceProps {
  tenantId?: string;
  onSelectProcessor?: (processorId: string) => void;
}

export const DPDPProcessorPrivacy360Workspace: React.FC<DPDPProcessorPrivacy360WorkspaceProps> = ({
  tenantId = 'tenant_skanda',
  onSelectProcessor
}) => {
  const [processors, setProcessors] = useState<DPDPProcessor360[]>(() =>
    dpdpPrivacyEngine.getProcessors(tenantId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [dpaFilter, setDpaFilter] = useState<string>('ALL');
  const [selectedProcessor, setSelectedProcessor] = useState<DPDPProcessor360 | null>(null);

  const refreshData = () => {
    setProcessors(dpdpPrivacyEngine.getProcessors(tenantId));
  };

  const filtered = processors.filter((p) => {
    const matchesSearch =
      p.processorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.processorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.servicesProvided.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
    const matchesDpa =
      dpaFilter === 'ALL' ||
      (dpaFilter === 'VALID' && p.dpaExecutionStatus === 'EXECUTED_VALID') ||
      (dpaFilter === 'EXPIRING' && p.dpaExecutionStatus === 'EXPIRING_SOON') ||
      (dpaFilter === 'MISSING' && p.dpaExecutionStatus === 'MISSING_NON_COMPLIANT');
    return matchesSearch && matchesRisk && matchesDpa;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getDpaBadge = (status: string) => {
    switch (status) {
      case 'EXECUTED_VALID':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'EXPIRING_SOON':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'EXPIRED':
      case 'MISSING_NON_COMPLIANT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Data Processor Privacy 360 & DPA Oversight
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              DPDP Act §8(1) & §8(2)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise registry of Data Processors, downstream Sub-processors, statutory Data Processing Agreements (DPA), cross-border locations, and continuous risk scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Processors</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{processors.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active Third-Party Vendors</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Executed DPAs</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {processors.filter((p) => p.dpaExecutionStatus === 'EXECUTED_VALID').length}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Contractually Governed</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">High / Critical Risk</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {processors.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Requires Priority Audit</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Avg Risk Score</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {processors.length > 0
              ? Math.round(processors.reduce((acc, p) => acc + p.processorRiskScore, 0) / processors.length)
              : 0}
            /100
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Composite Vendor Health</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search processor name, ID, or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
            >
              <option value="ALL">All Risks</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>DPA Status:</span>
            <select
              value={dpaFilter}
              onChange={(e) => setDpaFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
            >
              <option value="ALL">All DPAs</option>
              <option value="VALID">Valid Executed</option>
              <option value="EXPIRING">Expiring Soon</option>
              <option value="MISSING">Missing / Non-Compliant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Processors Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Processor & Services</th>
              <th className="py-3 px-4">Data Categories</th>
              <th className="py-3 px-4">Storage Jurisdiction</th>
              <th className="py-3 px-4">DPA Status</th>
              <th className="py-3 px-4">Sub-processors</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Review Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((proc) => (
              <tr
                key={proc.processorId}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedProcessor(proc);
                  if (onSelectProcessor) onSelectProcessor(proc.processorId);
                }}
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-sm">{proc.processorName}</div>
                  <div className="text-[11px] text-indigo-400 font-mono">{proc.processorId}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                    {proc.servicesProvided.join(', ')}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {proc.personalDataCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 font-medium text-slate-200">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{proc.storageLocations.join(', ')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Systems: {proc.systemsHosted.join(', ')}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDpaBadge(
                      proc.dpaExecutionStatus
                    )}`}
                  >
                    {proc.dpaExecutionStatus.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Valid to: {proc.dpaExpiryDate}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 text-slate-300">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-bold">{proc.subProcessors.length}</span>
                    <span className="text-slate-500">Tier-2</span>
                  </div>
                  {proc.subProcessors.length > 0 && (
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {proc.subProcessors.map((s) => s.subProcessorName).join(', ')}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge(
                        proc.riskLevel
                      )}`}
                    >
                      {proc.riskLevel}
                    </span>
                    <span className="font-mono text-slate-300 font-bold">{proc.processorRiskScore}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[11px] font-semibold ${
                      proc.reviewStatus === 'ACTIVE_APPROVED'
                        ? 'text-emerald-400'
                        : proc.reviewStatus === 'REVIEW_OVERDUE'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {proc.reviewStatus.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[10px] text-slate-500">Next: {proc.nextAssessmentDate}</div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProcessor(proc);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    Inspect 360
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Processor 360 Detail Modal */}
      {selectedProcessor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProcessor.processorName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>ID: {selectedProcessor.processorId}</span>
                    <span>•</span>
                    <span>DPA: {selectedProcessor.dpaAgreementReference}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProcessor(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400">DPA & Contractual Basis</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getDpaBadge(
                      selectedProcessor.dpaExecutionStatus
                    )}`}
                  >
                    {selectedProcessor.dpaExecutionStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Signed: <span className="text-white font-mono">{selectedProcessor.dpaExecutionDate}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Expires: <span className="text-amber-400 font-mono">{selectedProcessor.dpaExpiryDate}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400">Risk & Security Assessment</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskBadge(
                      selectedProcessor.riskLevel
                    )}`}
                  >
                    {selectedProcessor.riskLevel} ({selectedProcessor.processorRiskScore}/100)
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Last Assessment:{' '}
                  <span className="text-white font-mono">{selectedProcessor.lastAssessmentDate}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Next Due:{' '}
                  <span className="text-indigo-400 font-mono">{selectedProcessor.nextAssessmentDate}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400">Assurance & Audits</div>
                <div className="text-xs text-slate-300">
                  Linked Controls:{' '}
                  <span className="text-white font-mono">{selectedProcessor.linkedControlIds.join(', ')}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Evidence Records:{' '}
                  <span className="text-emerald-400 font-mono">{selectedProcessor.evidenceIds.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Mandatory DPDP Privacy Clauses */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Statutory DPA Privacy Clauses (DPDP Act 2023 §8)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedProcessor.privacyObligations.map((ob, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ob}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-processors List */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <span>Sub-processors (Tier-2 Downstream Flow)</span>
              </h4>
              {selectedProcessor.subProcessors.length === 0 ? (
                <div className="text-xs text-slate-500">No sub-processors declared for this vendor.</div>
              ) : (
                <div className="space-y-2">
                  {selectedProcessor.subProcessors.map((sp) => (
                    <div
                      key={sp.subProcessorId}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{sp.subProcessorName}</div>
                        <div className="text-slate-400">
                          Role: {sp.role} • Jurisdiction: {sp.jurisdiction}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            sp.fiduciaryApprovalStatus === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {sp.fiduciaryApprovalStatus}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          DPA: {sp.dpaBackToBackStatus}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProcessor(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
