import React, { useState, useEffect } from 'react';
import {
  Activity,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Layers,
  Code,
  ExternalLink,
  ChevronRight,
  Eye,
  Hash,
  Database
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { TelemetryObservation } from '../../types/telemetryTypes';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

export const TelemetryExplorerWorkspace: React.FC = () => {
  const { observations, fetchObservations } = useTelemetryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [activeObservation, setActiveObservation] = useState<TelemetryObservation | null>(null);

  useEffect(() => {
    fetchObservations('tenant-acme');
  }, [fetchObservations]);

  const filteredObservations = observations.filter(obs => {
    const matchesSearch =
      obs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.sourceSystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (obs.canonicalEntityId && obs.canonicalEntityId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity = severityFilter === 'ALL' || obs.severity === severityFilter;
    const matchesSource = sourceFilter === 'ALL' || obs.sourceSystem.toLowerCase().includes(sourceFilter.toLowerCase());

    return matchesSearch && matchesSeverity && matchesSource;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Intelligence & Ingestion
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Canonical Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Telemetry & Observation Explorer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Normalized streaming observations from connected cloud providers, identity systems, and source repositories.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search observations by ID, title, source, or entity tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Sources</option>
            <option value="AWS">AWS</option>
            <option value="Entra">Entra ID</option>
            <option value="GitHub">GitHub</option>
            <option value="Defender">Defender</option>
            <option value="Sentinel">Sentinel</option>
          </select>
        </div>
      </div>

      {/* Observations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Observation ID</th>
                <th className="py-3 px-4">Source System</th>
                <th className="py-3 px-4">Summary & Category</th>
                <th className="py-3 px-4">Canonical Entity</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Control Outcome</th>
                <th className="py-3 px-4">Drift</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredObservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No observations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredObservations.map(obs => (
                  <tr key={obs.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      {obs.id}
                    </td>

                    <td className="py-3 px-4 font-medium">
                      {obs.sourceSystem}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {obs.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {obs.normalizedCategory}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {obs.canonicalEntityId ? (
                        <button
                          onClick={() => GrcNavigationService.openEntity360(obs.canonicalEntityId!, obs.canonicalEntityType)}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-600 transition flex items-center gap-1"
                        >
                          {obs.canonicalEntityId}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Unbound</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        obs.severity === 'CRITICAL'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          : obs.severity === 'HIGH'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {obs.severity}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        obs.complianceResult === 'PASS'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}>
                        {obs.complianceResult}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {obs.driftDetected ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold text-[10px] animate-pulse">
                          DRIFT
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Stable</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveObservation(obs)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observation Inspection Modal */}
      {activeObservation && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div>
                <div className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
                  {activeObservation.id}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeObservation.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveObservation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-xs pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 block mb-1">Source System</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeObservation.sourceSystem}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 block mb-1">Confidence Score</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {(activeObservation.confidence * 100).toFixed(0)}% Certainty
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Cryptographic Evidence SHA-256</span>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all border border-slate-200 dark:border-slate-800">
                  {activeObservation.payloadHash}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Raw Telemetry JSON Ingest</span>
                <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(activeObservation.rawPayload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {activeObservation.canonicalEntityId && (
                <button
                  onClick={() => {
                    GrcNavigationService.openEntity360(activeObservation.canonicalEntityId!, activeObservation.canonicalEntityType);
                    setActiveObservation(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  View in Entity 360°
                </button>
              )}
              <button
                onClick={() => setActiveObservation(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
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
