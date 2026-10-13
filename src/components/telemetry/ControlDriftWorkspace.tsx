import React, { useEffect } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  Layers,
  FileCheck
} from 'lucide-react';
import { useTelemetryStore } from '../../stores/useTelemetryStore';
import { GrcNavigationService } from '../../services/grc/grcNavigationService';

export const ControlDriftWorkspace: React.FC = () => {
  const { complianceSummary, fetchComplianceSummary, isLoading } = useTelemetryStore();

  useEffect(() => {
    fetchComplianceSummary('tenant-acme');
  }, [fetchComplianceSummary]);

  const alerts = complianceSummary?.activeDriftAlerts || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              Phase 12 Control Drift Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Continuous Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400" />
            Continuous Control Drift & Telemetry Gaps
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time detection of controls that drifted from compliant baseline into non-compliance based on live infrastructure telemetry.
          </p>
        </div>

        <button
          onClick={() => fetchComplianceSummary('tenant-acme')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary-500' : ''}`} />
          Re-evaluate Controls
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Controls Continuously Monitored</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {complianceSummary?.controlsMonitoredCount || 72}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block">
            {complianceSummary?.controlsPassingCount || 68} passing baseline
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-sm bg-red-50/20 dark:bg-red-950/10">
          <span className="text-xs font-medium text-red-700 dark:text-red-400">Active Drifting Controls</span>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {alerts.length}
          </div>
          <span className="text-xs text-red-600/80 dark:text-red-400/70 mt-1 block">Requires immediate remediation</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-sm bg-blue-50/20 dark:bg-blue-950/10">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Evidence Freshness Index</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {complianceSummary?.evidenceFreshnessPercentage || 94}%
          </div>
          <span className="text-xs text-blue-600/80 dark:text-blue-400/70 mt-1 block">42 current, 3 expiring soon</span>
        </div>
      </div>

      {/* Drift Alert Cards */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Active Control Drift</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All continuously evaluated controls conform to compliance baselines.
            </p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.controlId}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {alert.controlCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                    {alert.frameworkCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                    {alert.severity} SEVERITY DRIFT
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Detected at {alert.detectedAt}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {alert.controlTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    <strong>Drift Reason:</strong> {alert.reason}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Source System: <strong className="text-slate-700 dark:text-slate-300">{alert.sourceSystem}</strong></span>
                  {alert.impactedRiskId && (
                    <>
                      <span>•</span>
                      <span>Impacted Risk: <strong className="text-red-600 dark:text-red-400">{alert.impactedRiskId}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  onClick={() => GrcNavigationService.openEntity360(alert.controlId, 'CONTROL')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Entity 360°
                </button>

                <button
                  onClick={() => GrcNavigationService.navigate({
                    module: 'remediation',
                    filters: { controlId: alert.controlId, tab: 'capas' }
                  })}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Create CAPA
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
