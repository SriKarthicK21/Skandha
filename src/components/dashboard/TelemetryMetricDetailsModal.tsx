import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Activity,
  Server,
  Clock,
  CheckCircle2,
  Database,
  Radio,
  Zap,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export interface TelemetryMetricDetail {
  title: string;
  metricKey: 'coreIntake' | 'throughput' | 'jitter' | 'systemHealth';
  value: string;
  subValue?: string;
  source: string;
  lastUpdated: string;
  collectionInterval: string;
  status: string;
  backendHealth: string;
  description: string;
  history?: Array<{ timestamp: string; latencyMs: number; jitterMs: number }>;
}

interface TelemetryMetricDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: TelemetryMetricDetail | null;
}

export const TelemetryMetricDetailsModal: React.FC<TelemetryMetricDetailsModalProps> = ({
  isOpen,
  onClose,
  metric
}) => {
  if (!isOpen || !metric) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#0B1220] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-[#0E1626] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {metric.title} Diagnostics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authoritative telemetry metric specification & audit provenance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 font-mono text-xs">
            {/* Primary Value Callout */}
            <div className="p-4 rounded-xl bg-[#0E1626] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Current Reading</span>
                <span className="text-2xl font-bold text-white tracking-tight">{metric.value}</span>
                {metric.subValue && (
                  <span className="text-xs text-slate-400 block mt-0.5">{metric.subValue}</span>
                )}
              </div>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{metric.status}</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {metric.description}
            </p>

            {/* Metric Provenance Grid */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-[11px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Telemetry Source:</span>
                </span>
                <strong className="text-slate-200">{metric.source}</strong>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Last Updated:</span>
                </span>
                <strong className="text-slate-200">
                  {new Date(metric.lastUpdated).toLocaleTimeString()}
                </strong>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Collection Cadence:</span>
                </span>
                <strong className="text-slate-200">{metric.collectionInterval}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Backend Health:</span>
                </span>
                <strong className="text-emerald-400">{metric.backendHealth}</strong>
              </div>
            </div>

            {/* Optional Jitter/Latency Samples History */}
            {metric.history && metric.history.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 block mb-2 font-semibold">
                  Recent Latency / Jitter Buffer (Last {metric.history.length} samples):
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-black/40 p-2 rounded-lg border border-slate-800">
                  {metric.history.map((sample, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(sample.timestamp).toLocaleTimeString()}</span>
                      <span>Latency: <strong className="text-slate-200">{sample.latencyMs}ms</strong></span>
                      <span>Jitter: <strong className="text-indigo-300">+{sample.jitterMs}ms</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-[#0E1626] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
