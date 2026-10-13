import React, { useState } from 'react';
import {
  ContinuousComplianceEngineStatus,
  ContinuousComplianceEngineRunLog
} from '../../types/continuousCompliance';
import {
  Activity,
  Play,
  Pause,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sliders,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Terminal,
  FileCheck2,
  Layers,
  History,
  Info,
  BellRing
} from 'lucide-react';
import { complianceToastService } from '../../services/compliance/ComplianceToastService';

interface ContinuousComplianceEngineTabProps {
  engineStatus: ContinuousComplianceEngineStatus | null;
  engineLogs: ContinuousComplianceEngineRunLog[];
  pollingNow: boolean;
  updatingScheduler: boolean;
  customIntervalSeconds: number;
  onPollNow: () => Promise<void>;
  onToggleScheduler: () => Promise<void>;
  onUpdateInterval: (intervalSeconds: number) => Promise<void>;
  onToggleAutoDrift: (enabled: boolean) => Promise<void>;
}

export const ContinuousComplianceEngineTab: React.FC<ContinuousComplianceEngineTabProps> = ({
  engineStatus,
  engineLogs,
  pollingNow,
  updatingScheduler,
  customIntervalSeconds,
  onPollNow,
  onToggleScheduler,
  onUpdateInterval,
  onToggleAutoDrift
}) => {
  const [selectedLog, setSelectedLog] = useState<ContinuousComplianceEngineRunLog | null>(null);

  const isRunning = engineStatus?.schedulerStatus === 'RUNNING';
  const pollingSec = engineStatus ? Math.round(engineStatus.pollingIntervalMs / 1000) : customIntervalSeconds;

  return (
    <div className="space-y-6" id="continuous-compliance-engine-tab">
      {/* Top Banner: Engine Orchestrator State */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-inner ${
              isRunning
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
            }`}>
              <Cpu className={`w-6 h-6 ${isRunning ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isRunning
                    ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-700/60 text-amber-300'
                }`}>
                  {isRunning ? 'DAEMON ACTIVE • CONTINUOUS SWEEP' : 'DAEMON PAUSED • ON-DEMAND ONLY'}
                </span>
                <span className="text-[11px] font-mono text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Cadence: {pollingSec}s</span>
                </span>
                <span className="text-[11px] font-bold text-slate-300 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  Total Cycles: {engineStatus?.totalRunsCount || 0}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Continuous Compliance Background Engine & Scheduler
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
                Autonomous background daemon continually interrogating operational controls, computing evidence decay thresholds, evaluating automated test telemetries, and generating immutable drift events.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onPollNow}
              disabled={pollingNow}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${pollingNow ? 'animate-spin' : ''}`} />
              <span>{pollingNow ? 'Executing Sweep...' : 'Trigger Poll Sweep Now'}</span>
            </button>

            <button
              onClick={onToggleScheduler}
              disabled={updatingScheduler}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition disabled:opacity-50 cursor-pointer ${
                isRunning
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Scheduler' : 'Resume Scheduler'}</span>
            </button>

            <button
              onClick={() => {
                complianceToastService.simulateBreachAlert('CRITICAL');
              }}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Emit custom compliance drift event and test real-time breach toast notification"
            >
              <BellRing className="w-4 h-4 text-rose-400" />
              <span>Test Drift Alert</span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Last Polled</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {engineStatus?.lastRunTimestamp ? new Date(engineStatus.lastRunTimestamp).toLocaleTimeString() : 'Pending'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Next Scheduled Sweep</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {engineStatus?.nextRunTimestamp && isRunning
                ? new Date(engineStatus.nextRunTimestamp).toLocaleTimeString()
                : 'Suspended'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Controls Monitored</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {engineStatus?.controlsMonitoredCount || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Drifts</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {engineStatus?.activeDriftsCount || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Evidence Files Checked</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {engineStatus?.evidenceMonitoredCount || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Daemon Health</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Operational</span>
            </span>
          </div>
        </div>
      </div>

      {/* Cadence Configuration & Decay Threshold Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cadence Tuner Card */}
        <div className="p-5 rounded-2xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Scheduler Cadence & Policies</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sweep Frequency (Interval)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 60, 300].map(sec => (
                  <button
                    key={sec}
                    onClick={() => onUpdateInterval(sec)}
                    className={`py-2 text-xs font-mono font-bold rounded-lg border transition cursor-pointer ${
                      pollingSec === sec
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-inner'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Fast intervals (15s–30s) are recommended for active surveillance sprints; 60s–300s for steady-state post-certification monitoring.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Automated Drift Detection</span>
                <span className="text-[11px] text-slate-400">Generate drift records on SLA breach</span>
              </div>
              <button
                onClick={() => onToggleAutoDrift(!(engineStatus?.autoDriftDetectionEnabled ?? true))}
                className={`w-11 h-6 rounded-full transition relative cursor-pointer ${
                  engineStatus?.autoDriftDetectionEnabled ?? true
                    ? 'bg-indigo-600'
                    : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    engineStatus?.autoDriftDetectionEnabled ?? true ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Evidence Freshness Mathematical Decay Model */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Continuous Evidence Decay Matrix (Threshold Logic)</h3>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            The ContinuousComplianceEngine computes evidence decay at each polling sweep. When evidence age exceeds frequency thresholds, operational effectiveness is automatically downgraded and compliance drift flagged.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Continuous / Daily Controls</span>
              <span className="text-slate-400 block text-[11px] mb-2">e.g. A.5.17 MFA, A.8.15 Logs, A.8.18 Deprovisioning</span>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-emerald-400">Fresh: &le; 1 day</div>
                <div className="text-sky-400">Aging: 2–3 days</div>
                <div className="text-amber-400">Stale: 4–7 days</div>
                <div className="text-rose-400 font-bold">Expired: &gt; 7 days</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">Weekly / Monthly Controls</span>
              <span className="text-slate-400 block text-[11px] mb-2">e.g. A.6.3 Awareness, A.5.19 Vendors, A.8.9 Config</span>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-emerald-400">Fresh: &le; 30 days</div>
                <div className="text-sky-400">Aging: 31–45 days</div>
                <div className="text-amber-400">Stale: 46–60 days</div>
                <div className="text-rose-400 font-bold">Expired: &gt; 60 days</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-indigo-400 block mb-1">Quarterly / Annual Governance</span>
              <span className="text-slate-400 block text-[11px] mb-2">e.g. Cl.9.2 Internal Audit, Cl.9.3 Management Review</span>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-emerald-400">Fresh: &le; 90 days</div>
                <div className="text-sky-400">Aging: 91–180 days</div>
                <div className="text-amber-400">Stale: 181–365 days</div>
                <div className="text-rose-400 font-bold">Expired: &gt; 365 days (NC)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sweep Execution Audit History Logs */}
      <div className="p-6 rounded-2xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Engine Sweep Audit Execution Logs</h3>
              <p className="text-xs text-slate-400">Telemetry generated by background job scheduler and manual sweeps</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Retaining last {engineLogs.length} execution cycles
          </span>
        </div>

        {engineLogs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400">
            No sweep logs recorded yet. Trigger a manual poll sweep or wait for the next scheduled background cycle.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Run ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Controls Polled</th>
                  <th className="p-3">Freshness (F / A / S / E / M)</th>
                  <th className="p-3">Tests Polled</th>
                  <th className="p-3">Drifts Detected</th>
                  <th className="p-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {engineLogs.map(log => (
                  <tr
                    key={log.runId}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="p-3 text-indigo-400 font-bold">{log.runId}</td>
                    <td className="p-3 text-slate-400 font-sans">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-slate-200">{log.durationMs}ms</td>
                    <td className="p-3 text-emerald-400 font-bold">{log.controlsEvaluated}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1 text-[11px]">
                        <span className="text-emerald-400 font-bold" title="Fresh">{log.freshCount}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-sky-400 font-bold" title="Aging">{log.agingCount}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-amber-400 font-bold" title="Stale">{log.staleCount}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-rose-400 font-bold" title="Expired">{log.expiredCount}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400 font-bold" title="Missing">{log.missingCount}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 font-bold">{log.automatedTestsChecked}</td>
                    <td className="p-3">
                      {log.driftsDetected > 0 ? (
                        <span className="text-amber-400 font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{log.driftsDetected} Drift(s)</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">0 Drift</span>
                      )}
                    </td>
                    <td className="p-3">
                      {log.status === 'SUCCESS' ? (
                        <span className="text-emerald-400 font-sans text-[11px] font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>OK</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-sans text-[11px] font-bold flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{log.status}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Log Inspection Drawer/Modal */}
      {selectedLog && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white font-mono">{selectedLog.runId} Detailed Sweep Telemetry</h4>
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Controls Inspected</span>
              <span className="font-mono text-white font-bold">{selectedLog.controlsEvaluated} controls</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Automated Tests Re-run</span>
              <span className="font-mono text-white font-bold">{selectedLog.automatedTestsChecked} test suites</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Sweep Duration</span>
              <span className="font-mono text-white font-bold">{selectedLog.durationMs} milliseconds</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Drift Events Identified</span>
              <span className="font-mono text-amber-400 font-bold">{selectedLog.driftsDetected} events</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Execution Summary:</span>
            <p className="text-slate-300 font-sans leading-relaxed">{selectedLog.details}</p>
          </div>

          {selectedLog.newDriftEvents && selectedLog.newDriftEvents.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs">
              <span className="text-amber-400 font-bold block mb-1">Generated Drift IDs:</span>
              <div className="flex flex-wrap gap-1.5 font-mono">
                {selectedLog.newDriftEvents.map(id => (
                  <span key={id} className="px-2 py-0.5 rounded bg-slate-900 border border-amber-600/40 text-amber-300 text-[11px]">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
