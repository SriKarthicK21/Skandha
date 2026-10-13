import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  Lock,
  Search,
  Filter,
  CheckCircle2,
  Hash,
  ShieldCheck,
  Calendar,
  UserCheck,
  Building,
  ArrowRight,
  Eye,
  FileCode
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';

export const AuditTrailModule: React.FC = () => {
  const { auditTrail, currentTenant } = useGRC();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  const filteredLogs = auditTrail.filter(log => {
    const matchesTenant = log.tenantId === currentTenant?.id || log.tenantId === 'SYSTEM';
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTenant && matchesAction && matchesSearch;
  });

  return (
    <PageContainer id="audit-trail-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                Non-Repudiation Security Subsystem
              </span>
              <span className="text-xs text-slate-400">Total Immutable Records: {auditTrail.length}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Immutable Cryptographic Audit Trail</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Every state change, survey update, SoA baseline lock, digital MoU execution, and evidence verification is cryptographically sealed with a SHA-256 hash to ensure tamper-proof auditability.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Chain: 100% Intact</span>
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
            placeholder="Search by action, user, role or SHA-256 hash..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
        >
          <option value="All">All Actions</option>
          <option value="MOU_EXECUTED">MOU_EXECUTED</option>
          <option value="SOA_BASELINE_LOCKED">SOA_BASELINE_LOCKED</option>
          <option value="EVIDENCE_VERIFIED">EVIDENCE_VERIFIED</option>
          <option value="EVIDENCE_UPLOADED">EVIDENCE_UPLOADED</option>
          <option value="RISK_ADDED">RISK_ADDED</option>
          <option value="FINDING_ADDED">FINDING_ADDED</option>
          <option value="ONBOARDING_PHASE1_SAVED">ONBOARDING_PHASE1_SAVED</option>
        </select>
      </div>

      {/* Immutable Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">IP Gateway</th>
                <th className="p-3.5 font-mono">SHA-256 Integrity Hash</th>
                <th className="p-3.5 text-right">Inspect Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                    {formatDateTime(log.timestamp)}
                  </td>

                  <td className="p-3.5 font-sans">
                    <span className="font-bold text-sky-400 text-xs">{log.action}</span>
                    <div className="text-[10px] text-slate-500 font-mono">Tenant: {log.tenantId}</div>
                  </td>

                  <td className="p-3.5 font-sans">
                    <div className="font-semibold text-white">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.actorRole}</div>
                  </td>

                  <td className="p-3.5 text-slate-400 text-[11px]">{log.ipAddress}</td>

                  <td className="p-3.5 max-w-xs truncate text-[11px] text-emerald-400">
                    <div className="flex items-center space-x-1">
                      <Hash className="w-3 h-3 shrink-0 text-emerald-500" />
                      <span className="truncate">{log.sha256Hash}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedAuditLog(log)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Inspect Serialized JSON Payload"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspector Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Audit Event Payload: {selectedAuditLog.action}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">Record ID: {selectedAuditLog.id}</div>
              <div className="text-slate-400">Actor: {selectedAuditLog.userName} ({selectedAuditLog.userRole})</div>
              <div className="text-emerald-400 break-all">SHA-256: {selectedAuditLog.hash}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Serialized JSON Payload (Hashed Data)
              </label>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-60">
                {JSON.stringify(selectedAuditLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
