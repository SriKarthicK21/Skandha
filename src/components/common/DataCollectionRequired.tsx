import React from 'react';
import { Database, AlertCircle, ArrowUpRight, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';

export interface DataCollectionRequiredProps {
  /**
   * Layout variant:
   * - 'card': Standard spacious dashboard card / section empty state
   * - 'inline': Compact horizontal banner
   * - 'badge': Minimal inline pill for headers / tables
   * - 'table-cell': Styled for table column display
   * - 'full': Full view / page empty state
   */
  variant?: 'card' | 'inline' | 'badge' | 'table-cell' | 'full';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * DataCollectionRequired
 * 
 * Enterprise-grade empty state component for SKANDA GRC.
 * Displayed across governance, compliance, audit, and risk modules
 * when real data collection, evidence verification, or control baselines
 * have not yet been configured for an organization or tenant.
 * Replaces hardcoded demo fixtures and simulated compliance percentages.
 */
export const DataCollectionRequired: React.FC<DataCollectionRequiredProps> = ({
  variant = 'card',
  title = 'Data collection required',
  description = 'No verified compliance telemetry or evidence artifacts have been configured. Real data collection is required to calculate an audit-grade compliance score.',
  actionLabel = 'Configure Data Collection',
  onAction,
  className = '',
  theme = 'dark'
}) => {
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight border ${
          theme === 'light'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        } ${className}`}
        title="Real telemetry collection required"
      >
        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
        <span className="whitespace-nowrap font-mono">{title}</span>
      </span>
    );
  }

  if (variant === 'table-cell') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono ${className}`}>
        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl border ${
          theme === 'light'
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
        } ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>{title}</span>
            </div>
            <p className="text-[11px] text-amber-400/80 leading-relaxed mt-0.5">
              {description}
            </p>
          </div>
        </div>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="ml-4 shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 shadow-sm"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`w-full min-h-[380px] flex flex-col items-center justify-center p-8 rounded-2xl border text-center ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/60 border-slate-800 backdrop-blur-sm'
        } ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
          <Database className="w-8 h-8 text-amber-400" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2 font-mono">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{title}</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 max-w-md">
          Awaiting Real Organization Telemetry & Evidence
        </h3>
        <p className="text-xs text-slate-400 max-w-lg mt-2 leading-relaxed">
          {description}
        </p>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    );
  }

  // Default: 'card'
  return (
    <div
      className={`p-6 rounded-2xl border ${
        theme === 'light'
          ? 'bg-slate-50/80 border-slate-200 shadow-sm'
          : 'bg-[#0B111E] border-slate-800'
      } ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
          <Database className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-100">{title}</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-medium">
              Zero Fake Scores
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
          {onAction && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onAction}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>{actionLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
