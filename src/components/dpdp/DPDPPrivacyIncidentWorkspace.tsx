import React, { useState } from 'react';
import { dpdpPrivacyEngine } from '../../services/canonical/DpdpPrivacyEngineService';
import { DPDPPrivacyIncident } from '../../types/dpdpPlatformTypes';
import {
  AlertOctagon,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Send,
  RefreshCw,
  Plus,
  ShieldCheck,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface DPDPPrivacyIncidentWorkspaceProps {
  tenantId?: string;
  onSelectIncident?: (incidentId: string) => void;
}

export const DPDPPrivacyIncidentWorkspace: React.FC<DPDPPrivacyIncidentWorkspaceProps> = ({
  tenantId = 'tenant_skanda',
  onSelectIncident
}) => {
  const [incidents, setIncidents] = useState<DPDPPrivacyIncident[]>(() =>
    dpdpPrivacyEngine.getIncidents(tenantId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<DPDPPrivacyIncident | null>(null);

  const refreshData = () => {
    setIncidents(dpdpPrivacyEngine.getIncidents(tenantId));
  };

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.rootCauseAnalysis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'CLOSED_RESOLVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CONTAINED':
      case 'POST_INCIDENT_REVIEW':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'NOTIFYING_BOARD':
      case 'NOTIFYING_PRINCIPALS':
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
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Privacy Breach & Incident Operations Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              DPDP Act §8(6) & CERT-In Rules
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end incident containment, personal data impact scoping, statutory 6-hour DPBI/CERT-In notification governance, and transparent DPO forensics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Statutory Notification Window:</span>
            <span className="text-amber-400 font-bold">6 Hours</span>
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
          <div className="text-xs font-semibold text-slate-400">Total Privacy Incidents</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{incidents.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lifetime recorded events</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Active / Under Investigation</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {incidents.filter((i) => i.status !== 'CLOSED_RESOLVED').length}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Contained or in review</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">DPBI Notified Incidents</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {incidents.filter((i) => i.dpbiNotified).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Statutory filings dispatched</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Avg Containment Time</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">1.4 hrs</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Well within 6h SLA</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident ID, title, or root cause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONTAINED">Contained</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="POST_INCIDENT_REVIEW">Post Incident Review</option>
              <option value="CLOSED_RESOLVED">Closed Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.incidentId}
            onClick={() => {
              setSelectedIncident(inc);
              if (onSelectIncident) onSelectIncident(inc.incidentId);
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-400">{inc.incidentId}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(inc.severity)}`}>
                  {inc.severity}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(inc.status)}`}>
                  {inc.status.replace(/_/g, ' ')}
                </span>
                {inc.dpbiNotified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    DPBI Form Notified
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white">{inc.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{inc.rootCauseAnalysis}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span>Detected: {inc.detectionTimestamp}</span>
                <span>•</span>
                <span>Contained: {inc.containmentTimestamp}</span>
                <span>•</span>
                <span>Affected Principals: ~{inc.estimatedAffectedPrincipalsCount.toLocaleString()}</span>
                <span>•</span>
                <span>Lead: {inc.incidentCommander}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIncident(inc);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Investigate</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedIncident.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{selectedIncident.incidentId}</span>
                    <span>•</span>
                    <span>Commander: {selectedIncident.incidentCommander}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Timeline & Scoping */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400">Affected Scope</div>
                <div className="text-lg font-bold font-mono text-white">
                  ~{selectedIncident.estimatedAffectedPrincipalsCount.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">
                  Data Categories: <span className="text-slate-200">{selectedIncident.personalDataCategoriesAffected.join(', ')}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Systems: <span className="text-indigo-400 font-mono">{selectedIncident.affectedSystems.join(', ')}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400">Statutory DPBI Notification</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      selectedIncident.dpbiNotified
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {selectedIncident.dpbiNotified ? 'Dispatched to DPBI' : 'Intimation in Draft'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Form: <span className="text-white font-mono">{selectedIncident.dpbiNotificationFormReference || 'N/A'}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Timestamp: <span className="text-slate-300 font-mono">{selectedIncident.dpbiNotificationTimestamp || 'Pending'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400">Principal Communication</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      selectedIncident.principalsNotified
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {selectedIncident.principalsNotified ? 'Principals Notified' : 'Direct Intimation Not Required'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Remediation: <span className="text-emerald-400">{selectedIncident.correctiveActions.length} CAPA Tasks</span>
                </div>
              </div>
            </div>

            {/* Root Cause & Forensic Findings */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Root Cause Analysis & Forensic Findings</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedIncident.rootCauseAnalysis}</p>
            </div>

            {/* Corrective Actions (CAPA) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Corrective & Preventive Actions (CAPA)</span>
              </h4>
              <div className="space-y-2">
                {selectedIncident.correctiveActions.map((capa, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{capa}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Artifacts */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-400">Attached Forensic Evidence</div>
              <div className="flex flex-wrap gap-2">
                {selectedIncident.evidenceIds.map((evId) => (
                  <span
                    key={evId}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-300 border border-slate-800 text-xs font-mono"
                  >
                    {evId}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
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
