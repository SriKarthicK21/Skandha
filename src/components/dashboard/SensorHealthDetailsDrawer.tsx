import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Server,
  Lock,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MonitoringSensor, reconnectSensor, formatTimeAgo } from '../../services/telemetry/complianceCoreMonitoringService';

interface SensorHealthDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sensors: MonitoringSensor[];
  onSensorUpdated?: (updated: MonitoringSensor) => void;
  onRefreshAll?: () => void;
}

export const SensorHealthDetailsDrawer: React.FC<SensorHealthDetailsDrawerProps> = ({
  isOpen,
  onClose,
  sensors,
  onSensorUpdated,
  onRefreshAll
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'STREAMING' | 'ALERTS' | 'UNCONFIGURED'>('ALL');
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const [reconnectNotice, setReconnectNotice] = useState<{ id: string; message: string; isError?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const streamingCount = sensors.filter(s => s.status === 'HEALTHY').length;
  const warningCount = sensors.filter(s => s.status === 'WARNING').length;
  const disconnectedCount = sensors.filter(s => s.status === 'DISCONNECTED').length;
  const notConfiguredCount = sensors.filter(s => s.status === 'NOT_CONFIGURED').length;

  const filteredSensors = sensors.filter(s => {
    if (filterTab === 'STREAMING' && s.status !== 'HEALTHY') return false;
    if (filterTab === 'ALERTS' && (s.status !== 'WARNING' && s.status !== 'DISCONNECTED')) return false;
    if (filterTab === 'UNCONFIGURED' && s.status !== 'NOT_CONFIGURED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.standardMapping.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReconnect = async (sensorId: string) => {
    setReconnectingId(sensorId);
    setReconnectNotice(null);
    try {
      const result = await reconnectSensor(sensorId);
      if (result.success && result.updatedSensor) {
        setReconnectNotice({ id: sensorId, message: result.message });
        if (onSensorUpdated) {
          onSensorUpdated(result.updatedSensor);
        }
      } else {
        setReconnectNotice({ id: sensorId, message: result.error || 'Reconnection failed', isError: true });
      }
    } catch (err: any) {
      setReconnectNotice({ id: sensorId, message: err.message || 'Network error during sensor reconnection', isError: true });
    } finally {
      setReconnectingId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="relative w-full max-w-4xl bg-[#0B1220] border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col h-full z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-[#0E1626] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Compliance Sensors Health & Diagnostic Fleet
                  </h2>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {sensors.length} Connectors Cataloged
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time telemetry ingestion nodes, cryptographic seals, and protocol health
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onRefreshAll && (
                <button
                  type="button"
                  onClick={onRefreshAll}
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                  title="Refresh all sensor heartbeats"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="px-6 py-3 bg-[#0A101D] border-b border-slate-800/80 grid grid-cols-4 gap-3 shrink-0 text-xs font-mono">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <div>
                <span className="text-sm font-bold block">{streamingCount}</span>
                <span className="text-[10px] uppercase text-emerald-300/80">Streaming</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <div>
                <span className="text-sm font-bold block">{warningCount}</span>
                <span className="text-[10px] uppercase text-amber-300/80">Latency Warning</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <WifiOff className="w-4 h-4" />
              <div>
                <span className="text-sm font-bold block">{disconnectedCount}</span>
                <span className="text-[10px] uppercase text-rose-300/80">Disconnected</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
              <Server className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-sm font-bold block">{notConfiguredCount}</span>
                <span className="text-[10px] uppercase text-slate-400">Not Configured</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs & Search */}
          <div className="px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filterTab === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({sensors.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('STREAMING')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filterTab === 'STREAMING'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Healthy ({streamingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('ALERTS')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filterTab === 'ALERTS'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Alerts ({warningCount + disconnectedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('UNCONFIGURED')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filterTab === 'UNCONFIGURED'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Available ({notConfiguredCount})
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sensor, source, or standard..."
                className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Reconnect notice banner if triggered */}
          {reconnectNotice && (
            <div className={`mx-6 mt-3 p-3 rounded-lg border text-xs flex items-center justify-between ${
              reconnectNotice.isError
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <div className="flex items-center space-x-2">
                {reconnectNotice.isError ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>{reconnectNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setReconnectNotice(null)}
                className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Sensor List Table / Card Flow */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredSensors.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Server className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold">No sensors match your filter criteria.</p>
              </div>
            ) : (
              filteredSensors.map(sensor => {
                const isReconnecting = reconnectingId === sensor.id;
                return (
                  <div
                    key={sensor.id}
                    className={`p-4 rounded-xl border transition-all ${
                      sensor.status === 'HEALTHY'
                        ? 'bg-[#0E1626]/80 border-slate-800 hover:border-slate-700'
                        : sensor.status === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60'
                        : sensor.status === 'DISCONNECTED'
                        ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Left: Sensor details & badges */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white tracking-tight">
                            {sensor.name}
                          </span>

                          {/* Operational Status Pill */}
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                            sensor.status === 'HEALTHY'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : sensor.status === 'WARNING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                              : sensor.status === 'DISCONNECTED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              sensor.status === 'HEALTHY' ? 'bg-emerald-400 animate-pulse' : sensor.status === 'WARNING' ? 'bg-amber-400' : sensor.status === 'DISCONNECTED' ? 'bg-rose-400' : 'bg-slate-500'
                            }`} />
                            <span>{sensor.status === 'NOT_CONFIGURED' ? 'NOT CONNECTED' : sensor.status}</span>
                          </span>

                          {/* Auth status tag */}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Auth: {sensor.authStatus.replace('_', ' ')}
                          </span>

                          {/* Data Freshness */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            sensor.dataFreshness === 'FRESH'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : sensor.dataFreshness === 'AGING'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            Freshness: {sensor.dataFreshness}
                          </span>
                        </div>

                        {/* Subline */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span>Source: <strong className="text-slate-200">{sensor.source}</strong></span>
                          <span>•</span>
                          <span>Category: <strong className="text-slate-200">{sensor.category}</strong></span>
                          <span>•</span>
                          <span>Protocol: <strong className="font-mono text-slate-300">{sensor.protocol}</strong></span>
                          <span>•</span>
                          <span>Mapping: <strong className="font-mono text-indigo-400">{sensor.standardMapping}</strong></span>
                        </div>

                        {/* Warning/Degraded description */}
                        {sensor.warningReason && (
                          <div className="mt-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-start space-x-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{sensor.warningReason}</span>
                          </div>
                        )}

                        {/* Last successful event display */}
                        {sensor.lastSuccessfulEvent && (
                          <div className="text-[11px] font-mono text-slate-400 pt-1 flex items-center space-x-2">
                            <span className="text-slate-500">Last Event:</span>
                            <span className="text-slate-300 truncate max-w-md">{sensor.lastSuccessfulEvent.summary}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Metrics & Actions */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 space-y-1 text-right font-mono text-xs">
                        <div className="flex items-center space-x-3 sm:space-x-0 sm:flex-col sm:items-end">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Intake</span>
                            <span className="font-bold text-white">
                              {sensor.packetsPerMin !== null ? `${sensor.packetsPerMin} pkts/m` : 'Unavailable'}
                            </span>
                          </div>

                          <div className="mt-0 sm:mt-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
                            <span className={`font-bold ${
                              sensor.latencyMs !== null && sensor.latencyMs > 50
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}>
                              {sensor.latencyMs !== null ? `${sensor.latencyMs}ms` : 'N/A'}
                            </span>
                          </div>

                          <div className="mt-0 sm:mt-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Heartbeat</span>
                            <span className="text-slate-300 text-[11px]">
                              {sensor.lastHeartbeatSecondsAgo >= 0 ? formatTimeAgo(sensor.lastHeartbeatSecondsAgo) : 'Never'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
                          {sensor.isConfigured ? (
                            <button
                              type="button"
                              onClick={() => handleReconnect(sensor.id)}
                              disabled={isReconnecting}
                              className={`px-3 py-1 rounded-md text-xs font-bold border transition cursor-pointer flex items-center space-x-1.5 ${
                                sensor.status === 'DISCONNECTED' || sensor.status === 'WARNING'
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                              } disabled:opacity-50`}
                            >
                              <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin text-white' : ''}`} />
                              <span>{isReconnecting ? 'Reconnecting...' : sensor.status === 'DISCONNECTED' ? 'Reconnect' : 'Probe'}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic block">
                              Requires API Key
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-[#0E1626] flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>All telemetry streams secured with mutual TLS and signed SHA-256 HMAC tokens</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
