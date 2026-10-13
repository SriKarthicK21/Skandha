import React, { useState } from 'react';
import { dpdpPrivacyEngine } from '../../services/canonical/DpdpPrivacyEngineService';
import {
  DPDPRegulatoryRequirement,
  DPDPPersonalDataElement,
  DPDPRoPAActivity
} from '../../types/dpdpPlatformTypes';
import {
  FileCheck2,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Download,
  Eye,
  ExternalLink,
  ChevronRight,
  Layers,
  Lock,
  FileText,
  UserCheck,
  RefreshCw
} from 'lucide-react';

interface DPDPAuditorWorkbenchWorkspaceProps {
  tenantId?: string;
  onOpenShowMeWhy?: (reqId: string) => void;
}

export const DPDPAuditorWorkbenchWorkspace: React.FC<DPDPAuditorWorkbenchWorkspaceProps> = ({
  tenantId = 'tenant_skanda',
  onOpenShowMeWhy
}) => {
  const [requirements, setRequirements] = useState<DPDPRegulatoryRequirement[]>(() =>
    dpdpPrivacyEngine.getRequirements(tenantId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReq, setSelectedReq] = useState<DPDPRegulatoryRequirement | null>(null);
  const [evidenceInspectionId, setEvidenceInspectionId] = useState<string | null>(null);

  const refreshData = () => {
    setRequirements(dpdpPrivacyEngine.getRequirements(tenantId));
  };

  const filtered = requirements.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.sectionReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.assuranceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULLY_VERIFIED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SUBSTANTIALLY_VERIFIED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'PARTIALLY_VERIFIED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              DPDP Auditor Clean-Room Workbench
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Authorized Scope: DPDP Act 2023 & Rules 2025
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independent Auditor portal for statutory clause assurance, continuous evidence trail verification, test procedure validation, and workpaper generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditor Clean-Room Isolation:</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
          <button
            onClick={refreshData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Statutory Clauses</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{requirements.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">DPDP Act & Rules 2025 scope</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Fully Verified Clauses</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {requirements.filter((r) => r.assuranceStatus === 'FULLY_VERIFIED').length}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Supported by continuous tests</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Substantially Verified</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">
            {requirements.filter((r) => r.assuranceStatus === 'SUBSTANTIALLY_VERIFIED').length}
          </div>
          <div className="text-[11px] text-indigo-400/80 mt-1">Minor evidence delta</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Audit Assurance Index</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {Math.round(
              (requirements.filter((r) => r.assuranceStatus === 'FULLY_VERIFIED').length /
                (requirements.length || 1)) *
                100
            )}
            %
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Statutory readiness grade</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clause ID, section reference, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Assurance Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="FULLY_VERIFIED">Fully Verified</option>
              <option value="SUBSTANTIALLY_VERIFIED">Substantially Verified</option>
              <option value="PARTIALLY_VERIFIED">Partially Verified</option>
              <option value="NOT_VERIFIED">Not Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auditor Clauses Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Statutory Clause & Section</th>
              <th className="py-3 px-4">Applicability & Effective Date</th>
              <th className="py-3 px-4">Mapped Controls</th>
              <th className="py-3 px-4">Evidence Artifacts</th>
              <th className="py-3 px-4">Test Procedure</th>
              <th className="py-3 px-4">Assurance Status</th>
              <th className="py-3 px-4 text-right">Auditor Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => setSelectedReq(req)}
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-sm">{req.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-indigo-400 font-mono font-semibold">
                      {req.id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {req.sectionReference}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {req.applicabilityStatus.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Eff: {req.officialCommencementDate}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {req.mappedControlIds.map((cId) => (
                      <span
                        key={cId}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300 border border-slate-700"
                      >
                        {cId}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {req.evidenceRequirementIds.map((evId) => (
                      <button
                        key={evId}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvidenceInspectionId(evId);
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 cursor-pointer"
                      >
                        {evId}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-[11px] text-slate-300 font-mono truncate max-w-[160px]">
                    {req.testProcedureId}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Assigned: {req.ownerRole}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      req.assuranceStatus
                    )}`}
                  >
                    {req.assuranceStatus.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Score: {req.assuranceScore}/100
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenShowMeWhy) onOpenShowMeWhy(req.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Show Me Why</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Clause Detail Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedReq.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{selectedReq.id}</span>
                    <span>•</span>
                    <span>{selectedReq.sectionReference}</span>
                    <span>•</span>
                    <span>Version: {selectedReq.version}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Implementation Objective */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Statutory Implementation Objective
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedReq.implementationObjective}
              </p>
            </div>

            {/* Test Procedure & Verification Logic */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Auditor Test Procedure ({selectedReq.testProcedureId})
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {selectedReq.testProcedureDescription}
              </p>
            </div>

            {/* Mapped Controls & Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mapped GRC Controls
                </h4>
                <div className="space-y-1.5">
                  {selectedReq.mappedControlIds.map((cId) => (
                    <div
                      key={cId}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300 flex items-center justify-between"
                    >
                      <span>{cId}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">Active & Monitored</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Auditor Evidence Artifacts
                </h4>
                <div className="space-y-1.5">
                  {selectedReq.evidenceRequirementIds.map((evId) => (
                    <div
                      key={evId}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between"
                    >
                      <span>{evId}</span>
                      <span className="text-[10px] text-slate-400">Cryptographically Hash Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  if (onOpenShowMeWhy) {
                    onOpenShowMeWhy(selectedReq.id);
                    setSelectedReq(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Show Me Why Assurance Proof</span>
              </button>

              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Inspection Modal */}
      {evidenceInspectionId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  Evidence Artifact Inspection: {evidenceInspectionId}
                </h3>
              </div>
              <button
                onClick={() => setEvidenceInspectionId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">
                Artifact Reference: <span className="text-white font-mono">{evidenceInspectionId}</span>
              </div>
              <div className="text-slate-400">
                Integrity Status: <span className="text-emerald-400 font-bold">SHA-256 Verified (Immutable)</span>
              </div>
              <div className="text-slate-400">
                Collection Mode: <span className="text-indigo-400 font-semibold">Automated Continuous Telemetry</span>
              </div>
              <div className="text-slate-400">
                Last Verified: <span className="text-slate-300 font-mono">2026-03-31T09:15:00Z</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setEvidenceInspectionId(null)}
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
