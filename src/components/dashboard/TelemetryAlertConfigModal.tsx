import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  AlertTriangle,
  BellRing,
  Activity,
  CheckCircle2,
  RotateCcw,
  Zap,
  Info,
  ShieldAlert,
  Gauge,
  Wifi,
  Sparkles,
  Flame
} from 'lucide-react';
import {
  TelemetryAlertThresholdConfig,
  TELEMETRY_SLA_PRESETS,
  DEFAULT_TELEMETRY_ALERT_CONFIG,
  evaluateTelemetryBreaches
} from '../../utils/telemetryAlertThresholds';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface TelemetryAlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelemetryAlertThresholdConfig;
  onSaveConfig: (newConfig: TelemetryAlertThresholdConfig) => void;
  currentStats: {
    latencyMs: number;
    jitterMs: number;
    packetsPerMin: number;
    packetsPerSec: number;
    flowSpeed?: 'normal' | 'fast' | 'paused';
  };
}

export const TelemetryAlertConfigModal: React.FC<TelemetryAlertConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  currentStats
}) => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  // Local draft state
  const [latencyWarningMs, setLatencyWarningMs] = useState<number>(config.latencyWarningMs);
  const [latencyCriticalMs, setLatencyCriticalMs] = useState<number>(config.latencyCriticalMs);
  const [maxJitterMs, setMaxJitterMs] = useState<number>(config.maxJitterMs);
  const [throughputMinPacketsPerMin, setThroughputMinPacketsPerMin] = useState<number>(
    config.throughputMinPacketsPerMin
  );
  const [throughputMinPacketsPerSec, setThroughputMinPacketsPerSec] = useState<number>(
    config.throughputMinPacketsPerSec
  );
  const [isVisualPulseEnabled, setIsVisualPulseEnabled] = useState<boolean>(
    config.isVisualPulseEnabled
  );
  const [showBreachBanners, setShowBreachBanners] = useState<boolean>(
    config.showBreachBanners
  );
  const [isSimulatedBreachActive, setIsSimulatedBreachActive] = useState<boolean>(
    config.isSimulatedBreachActive || false
  );

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setLatencyWarningMs(config.latencyWarningMs);
      setLatencyCriticalMs(config.latencyCriticalMs);
      setMaxJitterMs(config.maxJitterMs);
      setThroughputMinPacketsPerMin(config.throughputMinPacketsPerMin);
      setThroughputMinPacketsPerSec(config.throughputMinPacketsPerSec);
      setIsVisualPulseEnabled(config.isVisualPulseEnabled);
      setShowBreachBanners(config.showBreachBanners);
      setIsSimulatedBreachActive(config.isSimulatedBreachActive || false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Active draft config for live evaluation preview
  const draftConfig: TelemetryAlertThresholdConfig = {
    latencyWarningMs,
    latencyCriticalMs,
    maxJitterMs,
    throughputMinPacketsPerMin,
    throughputMinPacketsPerSec,
    isVisualPulseEnabled,
    showBreachBanners,
    isSimulatedBreachActive
  };

  const previewEvaluation = evaluateTelemetryBreaches(currentStats, draftConfig);

  const handleApplyPreset = (presetId: string) => {
    const preset = TELEMETRY_SLA_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setLatencyWarningMs(preset.config.latencyWarningMs);
    setLatencyCriticalMs(preset.config.latencyCriticalMs);
    setMaxJitterMs(preset.config.maxJitterMs);
    setThroughputMinPacketsPerMin(preset.config.throughputMinPacketsPerMin);
    setThroughputMinPacketsPerSec(preset.config.throughputMinPacketsPerSec);

    showToast({
      title: 'Preset Applied',
      message: `Loaded parameters for "${preset.name}".`,
      type: 'info'
    });
  };

  const handleResetToDefaults = () => {
    setLatencyWarningMs(DEFAULT_TELEMETRY_ALERT_CONFIG.latencyWarningMs);
    setLatencyCriticalMs(DEFAULT_TELEMETRY_ALERT_CONFIG.latencyCriticalMs);
    setMaxJitterMs(DEFAULT_TELEMETRY_ALERT_CONFIG.maxJitterMs);
    setThroughputMinPacketsPerMin(DEFAULT_TELEMETRY_ALERT_CONFIG.throughputMinPacketsPerMin);
    setThroughputMinPacketsPerSec(DEFAULT_TELEMETRY_ALERT_CONFIG.throughputMinPacketsPerSec);
    setIsVisualPulseEnabled(DEFAULT_TELEMETRY_ALERT_CONFIG.isVisualPulseEnabled);
    setShowBreachBanners(DEFAULT_TELEMETRY_ALERT_CONFIG.showBreachBanners);
    setIsSimulatedBreachActive(false);

    showToast({
      title: 'Defaults Restored',
      message: 'Restored standard enterprise telemetry SLA alert thresholds.',
      type: 'info'
    });
  };

  const handleSave = () => {
    // Basic validation
    if (latencyCriticalMs <= latencyWarningMs) {
      showToast({
        title: 'Validation Error',
        message: 'Critical latency threshold must be greater than warning threshold.',
        type: 'error'
      });
      return;
    }

    onSaveConfig(draftConfig);
    showToast({
      title: 'Telemetry Alerts Configured',
      message: `Custom thresholds updated. Latency warning: ${latencyWarningMs}ms, Critical: ${latencyCriticalMs}ms, Min Throughput: ${throughputMinPacketsPerMin} pkts/min.`,
      type: 'success'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="telemetry-threshold-config-dialog"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-6 transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
            : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight">
                  Telemetry & Throughput Alert Thresholds
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                  Custom SLA Rules
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set custom bounds for data throughput, network latency, and jitter. Breached limits trigger dynamic visual indicators in the Command Center.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className={`p-1.5 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                isLight
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Reset all thresholds to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isLight
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-500'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Telemetry Health Status Banner */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              previewEvaluation.hasBreach
                ? previewEvaluation.severity === 'CRITICAL'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start space-x-2.5">
                {previewEvaluation.hasBreach ? (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {previewEvaluation.hasBreach
                        ? `${previewEvaluation.severity} SLA Limit Breach (${previewEvaluation.breachCount})`
                        : 'Current Telemetry Passes Custom Bounds'}
                    </span>
                    {previewEvaluation.hasBreach && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs mt-0.5 font-medium opacity-90">
                    {previewEvaluation.summaryMessage}
                  </p>
                </div>
              </div>

              {/* Simulation test toggle */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsSimulatedBreachActive(prev => !prev)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border transition cursor-pointer flex items-center space-x-1.5 ${
                    isSimulatedBreachActive
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : isLight
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle simulated network spike to test visual indicators"
                >
                  <Flame className={`w-3.5 h-3.5 ${isSimulatedBreachActive ? 'animate-pulse' : ''}`} />
                  <span>{isSimulatedBreachActive ? 'Spike Active' : 'Simulate Spike'}</span>
                </button>
              </div>
            </div>

            {/* Micro Live Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-current/15 text-[11px] font-mono">
              <div>
                <span className="opacity-70">Live Latency:</span>{' '}
                <span className="font-bold">
                  {isSimulatedBreachActive ? '48ms' : `${currentStats.latencyMs || 12}ms`}
                </span>
              </div>
              <div>
                <span className="opacity-70">Live Jitter:</span>{' '}
                <span className="font-bold">
                  {isSimulatedBreachActive ? '±6.2ms' : `±${currentStats.jitterMs || 1.4}ms`}
                </span>
              </div>
              <div>
                <span className="opacity-70">Throughput:</span>{' '}
                <span className="font-bold">
                  {isSimulatedBreachActive ? '110 pkts/m' : `${currentStats.packetsPerMin || 320} pkts/m`}
                </span>
              </div>
              <div>
                <span className="opacity-70">Intake Rate:</span>{' '}
                <span className="font-bold">
                  {isSimulatedBreachActive ? '1.8/s' : `${currentStats.packetsPerSec || 5.2}/s`}
                </span>
              </div>
            </div>
          </div>

          {/* SLA Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick SLA Archetype Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TELEMETRY_SLA_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer group ${
                    isLight
                      ? 'bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 border-slate-200'
                      : 'bg-slate-800/60 hover:bg-indigo-950/30 hover:border-indigo-700/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.config.latencyWarningMs}ms / {preset.config.throughputMinPacketsPerMin}p
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: Network Latency & Jitter Thresholds */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-bold tracking-tight">Network Latency & Jitter Bounds</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Latency Warning Threshold */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                    <span>Latency Warning (Amber)</span>
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={latencyWarningMs}
                      onChange={e => setLatencyWarningMs(Number(e.target.value))}
                      className={`w-16 px-2 py-0.5 rounded font-mono font-bold text-xs text-right border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <span className="text-xs font-mono text-slate-400">ms</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={5}
                  max={80}
                  step={1}
                  value={latencyWarningMs}
                  onChange={e => setLatencyWarningMs(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>5ms (Strict)</span>
                  <span>Current: {currentStats.latencyMs || 12}ms</span>
                  <span>80ms</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Triggers amber warning indicators on sparkline and telemetry panel when round-trip latency exceeds this bound.
                </p>
              </div>

              {/* Latency Critical Threshold */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                    <span>Latency Critical (Red)</span>
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={15}
                      max={200}
                      value={latencyCriticalMs}
                      onChange={e => setLatencyCriticalMs(Number(e.target.value))}
                      className={`w-16 px-2 py-0.5 rounded font-mono font-bold text-xs text-right border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <span className="text-xs font-mono text-slate-400">ms</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={15}
                  max={150}
                  step={1}
                  value={latencyCriticalMs}
                  onChange={e => setLatencyCriticalMs(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>15ms</span>
                  <span>High alert</span>
                  <span>150ms</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Triggers red critical SLA breach warning and logs high-priority compliance audit incident.
                </p>
              </div>
            </div>

            {/* Max Allowable Jitter */}
            <div
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Max Allowable Jitter Variance (±ms)
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={1.0}
                    max={15.0}
                    step={0.5}
                    value={maxJitterMs}
                    onChange={e => setMaxJitterMs(Number(e.target.value))}
                    className={`w-16 px-2 py-0.5 rounded font-mono font-bold text-xs text-right border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                  <span className="text-xs font-mono text-slate-400">ms</span>
                </div>
              </div>

              <input
                type="range"
                min={1.0}
                max={10.0}
                step={0.5}
                value={maxJitterMs}
                onChange={e => setMaxJitterMs(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>±1.0ms (Ultra-stable)</span>
                <span>Current: ±{currentStats.jitterMs || 1.4}ms</span>
                <span>±10.0ms</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Data Throughput Limits */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-bold tracking-tight">Data Throughput Ingress Bounds</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Minimum Ingress Throughput (pkts/min) */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Min Ingress (pkts/min)
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={20}
                      max={600}
                      step={10}
                      value={throughputMinPacketsPerMin}
                      onChange={e => setThroughputMinPacketsPerMin(Number(e.target.value))}
                      className={`w-18 px-2 py-0.5 rounded font-mono font-bold text-xs text-right border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <span className="text-xs font-mono text-slate-400">p/m</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={30}
                  max={450}
                  step={10}
                  value={throughputMinPacketsPerMin}
                  onChange={e => setThroughputMinPacketsPerMin(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>30 pkts/m</span>
                  <span>Current: {currentStats.packetsPerMin || 320}</span>
                  <span>450 pkts/m</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Flags an ingress starvation alert if live sensors fail to produce minimum compliance packets.
                </p>
              </div>

              {/* Minimum Rate (pkts/sec) */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Min Rate (pkts/sec)
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={0.5}
                      max={20.0}
                      step={0.5}
                      value={throughputMinPacketsPerSec}
                      onChange={e => setThroughputMinPacketsPerSec(Number(e.target.value))}
                      className={`w-16 px-2 py-0.5 rounded font-mono font-bold text-xs text-right border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                    <span className="text-xs font-mono text-slate-400">/s</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  value={throughputMinPacketsPerSec}
                  onChange={e => setThroughputMinPacketsPerSec(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0.5/s</span>
                  <span>Current: {currentStats.packetsPerSec || 5.2}/s</span>
                  <span>10.0/s</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Ensures sub-second telemetry heartbeat velocity across enterprise compliance adapters.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Visual Indicators & Alert Behaviors */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold tracking-tight flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-indigo-500" />
              <span>Visual Indicators & Notifications</span>
            </h4>

            <div className="space-y-2.5">
              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="pr-4">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Visual Pulsing Alerts on Breached Elements
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Flashes ambient amber/rose border rings on the Data Throughput panel and D3 sparkline during limit breaches.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isVisualPulseEnabled}
                  onChange={e => setIsVisualPulseEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="pr-4">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    High-Visibility Breach Banner & Badges
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Displays high-contrast SLA breach status pills and explicit delta indicators next to throughput counters.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showBreachBanners}
                  onChange={e => setShowBreachBanners(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {previewEvaluation.hasBreach ? (
              <span className="text-rose-500 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Active Breach: {previewEvaluation.summaryMessage}</span>
              </span>
            ) : (
              <span className="text-emerald-500 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All limits nominal under configured rules</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                isLight
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              id="save-telemetry-thresholds-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply & Save Thresholds</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
