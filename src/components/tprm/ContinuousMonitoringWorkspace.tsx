/**
 * SKANDA ENTERPRISE CONTINUOUS THIRD-PARTY MONITORING WORKSPACE
 * Path: src/components/tprm/ContinuousMonitoringWorkspace.tsx
 */

import React, { useState } from 'react';
import {
  Activity,
  Radio,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Clock,
  RotateCw,
  Plus,
  Zap,
  Server,
  Lock,
  ExternalLink,
  Search
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { MonitoringSignalCategory } from '../../types/tprmTypes';

export const ContinuousMonitoringWorkspace: React.FC = () => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const { vendors, selectedVendor, actions: { ingestMonitoringSignal } } = useTprmStore();

  const [selectedCategory, setSelectedCategory] = useState<MonitoringSignalCategory>('CERTIFICATE_EXPIRING');
  const [signalHeadline, setSignalHeadline] = useState('TLS/SSL Certificate Expiring in 7 Days');
  const [signalDetails, setSignalDetails] = useState('External automated scanner detected that the TLS 1.3 certificate for primary API ingress will expire on 2026-10-16.');
  const [signalSeverity, setSignalSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const isLight = theme === 'light';

  // Aggregate signals across all vendors
  const allSignals = vendors.flatMap(v => v.monitoringSignals);

  const handleInjectSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    const res = ingestMonitoringSignal({
      vendorId: selectedVendor.id,
      category: selectedCategory,
      severity: signalSeverity,
      sourceAttribution: 'SHODAN_SCANNER',
      headline: signalHeadline,
      details: signalDetails
    });

    if (res.success) {
      showToast({
        title: 'Telemetry Signal Ingested',
        message: res.message,
        type: 'warning'
      });
    } else {
      showToast({
        title: 'Signal Skipped',
        message: res.message,
        type: 'info'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Connectors Strip */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-rose-500/15 text-rose-400 border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-1" />
                Live Event Ingestion Pipeline
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Active Telemetry Feeds: 5 Sources
              </span>
            </div>
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Continuous Third-Party Attack Surface & Signal Monitoring
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Automated telemetry from SecurityScorecard API, Shodan attack surface scanner, NVD CVE watch, and Certificate Transparency logs.
            </p>
          </div>
        </div>

        {/* Connector Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">SecurityScorecard API</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">CONNECTED</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Freshness: 4m ago • Zero Lag</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Shodan TLS Scanner</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">CONNECTED</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Hourly Certificate Audit</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">NVD CVE Watch Feed</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">CONNECTED</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Continuous Vulnerability Ingest</span>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">BitSight Telemetry</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-500/15 text-slate-400 font-mono font-bold">CONFIGURED</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Ready for API credentials</span>
          </div>
        </div>
      </div>

      {/* 2. Main Signal Stream & Injection Testing Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Stream */}
        <div
          className={`p-5 rounded-2xl border space-y-4 lg:col-span-2 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-sky-400" />
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Active Telemetry & Signal Audit Stream ({allSignals.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Idempotent Deduplication Active</span>
          </div>

          <div className="space-y-3">
            {allSignals.map(sig => (
              <div
                key={sig.id}
                className={`p-4 rounded-xl border space-y-2 transition ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{sig.vendorName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-slate-800 text-slate-300 border-slate-700">
                        {sig.sourceAttribution}
                      </span>
                      {sig.reassessmentTriggered && (
                        <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 animate-pulse">
                          REASSESSMENT TRIGGERED
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-sky-400">{sig.headline}</h4>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold border shrink-0 ${
                      sig.severity === 'CRITICAL' || sig.severity === 'HIGH'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    {sig.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{sig.details}</p>

                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-700/60 flex items-center justify-between">
                  <span>Timestamp: {sig.eventTimestamp}</span>
                  <span>Status: <strong className="text-emerald-400">{sig.status}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation / Signal Ingestion Console */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Signal Testing & Ingestion Console
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Inject external telemetry events to validate automated risk scoring surge, reassessment triggers, and CAPA finding generation.
          </p>

          <form onSubmit={handleInjectSignal} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Target Vendor:</label>
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-white">
                {selectedVendor?.profile.legalName || 'No Vendor Selected'}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Signal Category:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as MonitoringSignalCategory)}
                className={`w-full p-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="CERTIFICATE_EXPIRING">Certificate Expiring Alert</option>
                <option value="CVE_VULNERABILITY_EXPOSURE">CVE Vulnerability Exposure</option>
                <option value="PUBLIC_BREACH_NOTIFICATION">Public Security Incident</option>
                <option value="SECURITY_RATING_CHANGE">SecurityScorecard Rating Decline</option>
                <option value="SUBPROCESSOR_MODIFICATION">Subprocessor Modification</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Severity:</label>
              <select
                value={signalSeverity}
                onChange={e => setSignalSeverity(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <option value="CRITICAL">CRITICAL (Immediate Action)</option>
                <option value="HIGH">HIGH (Trigger Reassessment)</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Headline:</label>
              <input
                type="text"
                value={signalHeadline}
                onChange={e => setSignalHeadline(e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Details:</label>
              <textarea
                rows={3}
                value={signalDetails}
                onChange={e => setSignalDetails(e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Ingest Signal & Evaluate Trigger
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
