import React, { useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Server,
  FileCheck,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

export const ContinuousComplianceWidget: React.FC = () => {
  const { complianceSummary, fetchComplianceSummary, isLoading } = useTelemetryStore();

  useEffect(() => {
    fetchComplianceSummary('tenant-acme');
  }, [fetchComplianceSummary]);

  const summary = complianceSummary || {
    controlsMonitoredCount: 72,
    controlsPassingCount: 68,
    controlsDriftingCount: 3,
    controlsFailedCount: 1,
    evidenceFreshnessPercentage: 94,
    activeConnectorsCount: 6,
    healthyConnectorsCount: 6,
    activeDriftAlerts: []
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Continuous Compliance & Live Telemetry
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Real-time posture derived from 6 active connectors
            </span>
          </div>
        </div>

        <button
          onClick={() => GrcNavigationService.navigate({ module: 'integrations' })}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition"
        >
          View Connectors
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Key Continuous Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Controls Monitored</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {summary.controlsMonitoredCount}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {summary.controlsPassingCount} passing ({(summary.controlsPassingCount / summary.controlsMonitoredCount * 100).toFixed(0)}%)
          </span>
        </div>

        <div className={`p-3 rounded-lg border ${
          summary.controlsDriftingCount > 0
            ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
        }`}>
          <span className="text-[11px] font-medium text-red-700 dark:text-red-400 block">Controls Drifting</span>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">
            {summary.controlsDriftingCount}
          </div>
          <span className="text-[10px] text-red-700 dark:text-red-300">
            Requires attention
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Evidence Freshness</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {summary.evidenceFreshnessPercentage}%
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Auto-harvested via WORM
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Connector Health</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {summary.healthyConnectorsCount} / {summary.activeConnectorsCount}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            100% telemetry online
          </span>
        </div>
      </div>

      {/* Active Drift Alert Ribbon */}
      {summary.activeDriftAlerts && summary.activeDriftAlerts.length > 0 && (
        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              Real-Time Control Drift Alert: {summary.activeDriftAlerts[0].controlCode}
            </div>
            <button
              onClick={() => GrcNavigationService.navigate({ module: 'control-drift' })}
              className="text-[11px] font-bold text-red-700 dark:text-red-300 hover:underline flex items-center gap-1"
            >
              Investigate All ({summary.activeDriftAlerts.length})
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300/90">
            {summary.activeDriftAlerts[0].reason}
          </p>
        </div>
      )}
    </div>
  );
};
