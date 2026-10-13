import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import { MASNotice644IncidentDraft } from '../../types';

export interface MilestoneAlert {
  id: string;
  incidentId: string;
  incidentRef: string;
  milestoneId: '1h-notification' | 'containment' | '14d-rca';
  milestoneTitle: string;
  statutoryClause: string;
  severity: 'critical' | 'warning' | 'info';
  minutesRemaining: number;
  message: string;
  deadlineTimestamp: string;
  timestamp: string;
  dismissed?: boolean;
  actionRequired?: string;
}

interface ProactiveMilestoneAlertBannerProps {
  alerts: MilestoneAlert[];
  incident: MASNotice644IncidentDraft;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onDismissAlert: (id: string) => void;
  onDispatchInitialNotice?: (incident: MASNotice644IncidentDraft) => void;
  onSimulateUrgentThreshold?: (minutesRemaining: number) => void;
  drillRemainingSeconds?: number;
}

export const ProactiveMilestoneAlertBanner: React.FC<ProactiveMilestoneAlertBannerProps> = ({
  alerts,
  incident,
  audioEnabled,
  onToggleAudio,
  onDismissAlert,
  onDispatchInitialNotice,
  onSimulateUrgentThreshold,
  drillRemainingSeconds
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const activeAlerts = alerts.filter(a => !a.dismissed);

  if (activeAlerts.length === 0 && incident.notificationStatus !== 'Drafting') {
    return null;
  }

  const primaryAlert = activeAlerts[0];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden ${
        primaryAlert?.severity === 'critical'
          ? 'bg-gradient-to-r from-rose-950/80 via-slate-900/95 to-slate-900 border-rose-600/60 ring-1 ring-rose-500/30'
          : primaryAlert?.severity === 'warning'
          ? 'bg-gradient-to-r from-amber-950/80 via-slate-900/95 to-slate-900 border-amber-600/60 ring-1 ring-amber-500/30'
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 border-slate-800'
      }`}
    >
      {/* Top Banner Header Bar */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              primaryAlert?.severity === 'critical'
                ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                Proactive Regulatory Alert Engine
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  primaryAlert?.severity === 'critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}
              >
                {primaryAlert?.severity === 'critical' ? 'CRITICAL SLA NEARING DEADLINE' : 'STATUTORY NOTIFICATION WINDOW'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Automated surveillance monitoring statutory SLA thresholds under MAS Notice 644 and MAS TRM Guidelines.
            </p>
          </div>
        </div>

        {/* Action Controls & Simulator Drill Overrides */}
        <div className="flex items-center space-x-2">
          {/* Quick Simulation threshold testing triggers */}
          {onSimulateUrgentThreshold && (
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 px-1 font-mono">Simulate Proactive Alert:</span>
              <button
                onClick={() => onSimulateUrgentThreshold(15)}
                className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 transition"
                title="Simulate 15 Minutes Remaining Notification"
              >
                T-15m
              </button>
              <button
                onClick={() => onSimulateUrgentThreshold(5)}
                className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 transition"
                title="Simulate 5 Minutes Urgent Breach Warning"
              >
                T-5m
              </button>
            </div>
          )}

          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 border ${
              audioEnabled
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={audioEnabled ? 'Audible Chimes Enabled' : 'Audible Chimes Muted'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="text-[10px] hidden sm:inline">{audioEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Expanded Active Alert Cards List */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-slate-950/40">
          {activeAlerts.length > 0 ? (
            activeAlerts.map(alert => {
              const isUrgent = alert.severity === 'critical';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isUrgent
                      ? 'bg-rose-950/40 border-rose-600/80 shadow-md ring-1 ring-rose-500/40'
                      : 'bg-amber-950/30 border-amber-600/70 shadow-sm ring-1 ring-amber-500/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isUrgent ? (
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-xs text-white">
                          {alert.milestoneTitle}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {alert.statutoryClause}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isUrgent
                              ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                              : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                          }`}
                        >
                          {alert.minutesRemaining > 0
                            ? `~${alert.minutesRemaining} min remaining`
                            : 'Deadline Exceeded'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-snug">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1.5 font-mono">
                        <span>Incident: <strong className="text-slate-300">{alert.incidentRef}</strong></span>
                        <span>•</span>
                        <span>Deadline: <strong className="text-rose-300">{new Date(alert.deadlineTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {alert.milestoneId === '1h-notification' && onDispatchInitialNotice && incident.notificationStatus === 'Drafting' && (
                      <button
                        onClick={() => onDispatchInitialNotice(incident)}
                        className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-rose-600/30"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Template IT-01</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Acknowledge Alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All current statutory deadlines are within safe operating buffers. Continuous telemetry monitoring is active.</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400">SLA GREEN</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
