import React, { useState } from 'react';
import {
  X,
  Sliders,
  AlertTriangle,
  BellRing,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import {
  KPIAlertThresholdConfig,
  THRESHOLD_PRESETS,
  DEFAULT_KPI_ALERT_CONFIG
} from '../../utils/kpiAlertThresholds';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface KPIAlertThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: KPIAlertThresholdConfig;
  onSaveConfig: (newConfig: KPIAlertThresholdConfig) => void;
  overallScore?: number;
}

export const KPIAlertThresholdModal: React.FC<KPIAlertThresholdModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  overallScore = 96.4
}) => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [criticalThreshold, setCriticalThreshold] = useState<number>(config.criticalThreshold);
  const [warningThreshold, setWarningThreshold] = useState<number>(config.warningThreshold);
  const [isPulsingEnabled, setIsPulsingEnabled] = useState<boolean>(config.isPulsingEnabled);

  if (!isOpen) return null;

  // Live KPI metrics sample across the command center
  const liveKPISamples = [
    { id: 'compliance', label: 'Overall Compliance Health', value: 96.4, unit: '%' },
    { id: 'controls', label: 'Controls Effectiveness', value: 95.2, unit: '%' },
    { id: 'ai_gov', label: 'AI Model Governance (ISO 42001)', value: 91.5, unit: '%' },
    { id: 'evidence', label: 'Evidence Freshness & Health', value: 87.0, unit: '%' },
    { id: 'capa', label: 'CAPA Remediation Velocity', value: 71.0, unit: '%' },
    { id: 'risk_posture', label: 'Residual Risk Assurance', value: 96.0, unit: '%' }
  ];

  const criticalCount = liveKPISamples.filter(s => s.value < criticalThreshold).length;

  const handleSave = () => {
    const updated: KPIAlertThresholdConfig = {
      criticalThreshold,
      warningThreshold,
      isPulsingEnabled
    };
    onSaveConfig(updated);
    showToast({
      title: 'KPI Alert Thresholds Updated',
      message: `Critical threshold set to ${criticalThreshold}%. ${criticalCount} metric(s) currently flagged for executive attention.`,
      type: 'success'
    });
    onClose();
  };

  const handleReset = () => {
    setCriticalThreshold(DEFAULT_KPI_ALERT_CONFIG.criticalThreshold);
    setWarningThreshold(DEFAULT_KPI_ALERT_CONFIG.warningThreshold);
    setIsPulsingEnabled(DEFAULT_KPI_ALERT_CONFIG.isPulsingEnabled);
    showToast({
      title: 'Thresholds Reset',
      message: 'Restored default executive alert threshold of 85%.',
      type: 'info'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0E1627] border-[#1F2D47] text-[#FFFFFF]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A101D] border-[#1B2639]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl border ${
                isLight
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Executive KPI Alert Thresholds
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    criticalCount > 0
                      ? isLight
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                      : isLight
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {criticalCount} Critical {criticalCount === 1 ? 'Alert' : 'Alerts'}
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-[#7F8BA3]'
                }`}
              >
                Configure the threshold at which KPI cards activate a pulsing glow border to command executive attention.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#7F8BA3] border-[#1B2639]'
            }`}
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Threshold Configurator Card */}
          <div
            className={`p-4 rounded-xl border ${
              isLight
                ? 'bg-slate-50/70 border-slate-200'
                : 'bg-[#111A2C]/80 border-[#1B2639]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--skanda-text-secondary)]">
                  Critical Alert Threshold
                </label>
                <p className="text-xs text-[var(--skanda-text-secondary)] mt-0.5">
                  Metrics with scores below this level trigger the pulsing glow animation.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black font-mono tracking-tight text-rose-500">
                  {criticalThreshold}%
                </span>
              </div>
            </div>

            {/* Slider with Tactile Feedback */}
            <div className="space-y-2">
              <input
                type="range"
                min={60}
                max={95}
                step={1}
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />

              <div className="flex justify-between text-[10px] font-mono text-[var(--skanda-text-secondary)] px-1">
                <span>60% (Lenient)</span>
                <span>75%</span>
                <span className="font-bold text-rose-500">85% (Default)</span>
                <span>90%</span>
                <span>95% (High Assurance)</span>
              </div>
            </div>

            {/* Fast Presets Grid */}
            <div className="mt-4 pt-3 border-t border-[var(--skanda-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--skanda-text-secondary)] block mb-2">
                Executive Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THRESHOLD_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setCriticalThreshold(preset.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition text-left cursor-pointer flex flex-col ${
                      criticalThreshold === preset.value
                        ? isLight
                          ? 'bg-rose-50 text-rose-900 border-rose-400 shadow-xs'
                          : 'bg-rose-950 text-rose-200 border-rose-500 shadow-xs'
                        : isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-[#0E1627] hover:bg-[#152035] text-[#A7B0C0] border-[#1B2639]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono">{preset.value}%</span>
                      {criticalThreshold === preset.value && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--skanda-text-secondary)] truncate">
                      {preset.label.split(' ')[1] || preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pulsing Animation Toggle */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#111A2C]/80 border-[#1B2639]'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg border shrink-0 ${
                  isPulsingEnabled
                    ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                    : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}
              >
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--skanda-text-primary)]">
                  Pulsing Glow Border Animation
                </span>
                <p className="text-xs text-[var(--skanda-text-secondary)] mt-0.5">
                  Applies a subtle 2.4s breathing glow box-shadow to immediately highlight breached cards without causing jarring layouts.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPulsingEnabled(prev => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isPulsingEnabled ? 'bg-rose-500' : 'bg-slate-400 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={isPulsingEnabled}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isPulsingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Live KPI Cards Preview List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--skanda-text-secondary)]">
                Live Metric Simulation Preview ({liveKPISamples.length} Monitored KPIs)
              </span>
              <span className="text-[11px] font-mono text-[var(--skanda-text-secondary)]">
                Threshold: &lt;{criticalThreshold}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {liveKPISamples.map((sample) => {
                const isCritical = sample.value < criticalThreshold;
                return (
                  <div
                    key={sample.id}
                    className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                      isCritical && isPulsingEnabled
                        ? isLight
                          ? 'kpi-critical-glow ring-2 ring-rose-500/50 border-rose-400 bg-rose-50/40'
                          : 'kpi-critical-glow ring-2 ring-rose-500/50 border-rose-500/80 bg-rose-950/30'
                        : isLight
                        ? 'bg-white border-slate-200'
                        : 'bg-[#0E1627] border-[#1B2639]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-semibold block truncate text-[var(--skanda-text-primary)]">
                        {sample.label}
                      </span>
                      <span className="text-lg font-black font-mono tracking-tight text-[var(--skanda-text-heading)]">
                        {sample.value}{sample.unit}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center space-x-1.5">
                      {isCritical ? (
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isLight
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-rose-950/90 text-rose-300 border-rose-500/60'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          <span>CRITICAL</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>HEALTHY</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A101D] border-[#1B2639]'
          }`}
        >
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
            }`}
            title="Reset to 85% default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to 85% Default</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-[#111A2C] hover:bg-[#1B2639] text-[#A7B0C0] border-[#1B2639]'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition shadow-sm cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply Threshold ({criticalThreshold}%)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
