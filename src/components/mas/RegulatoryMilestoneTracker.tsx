import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Search,
  FileCheck2,
  Check,
  Send,
  ShieldAlert,
  Milestone
} from 'lucide-react';
import { MASNotice644IncidentDraft } from '../../types';

export type RegulatoryMilestoneStatus = 'Completed' | 'Active' | 'Pending' | 'Overdue';

export interface RegulatoryMilestone {
  id: string;
  name: string;
  shortClause: string;
  description: string;
  status: RegulatoryMilestoneStatus;
  slaLabel: string;
  timestampOrDeadline?: string;
  actionButton?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    buttonClass: string;
  };
}

interface RegulatoryMilestoneTrackerProps {
  incident: MASNotice644IncidentDraft;
  onDispatchInitialNotice?: (incident: MASNotice644IncidentDraft) => void;
  onAttestContainment?: (newStatus: 'Active Isolation' | 'Contained' | 'Failover Complete') => void;
  onConfirmRootCause?: (newStatus: 'Evidence Preservation' | 'Memory Dump Analyzed' | 'Root Cause Confirmed') => void;
  onSubmitFinalRCA?: () => void;
  drillRemainingSeconds?: number;
}

export const RegulatoryMilestoneTracker: React.FC<RegulatoryMilestoneTrackerProps> = ({
  incident,
  onDispatchInitialNotice,
  onAttestContainment,
  onConfirmRootCause,
  onSubmitFinalRCA,
  drillRemainingSeconds
}) => {
  const now = Date.now();
  const oneHourDeadlineTime = new Date(incident.oneHourDeadline).getTime();
  const fourteenDayDeadlineTime = new Date(incident.fourteenDayDeadline).getTime();

  // Determine seconds remaining for 1h notification: from drillRemainingSeconds if provided, or from deadline
  const calculatedSecondsRemaining = drillRemainingSeconds !== undefined
    ? drillRemainingSeconds
    : Math.max(0, Math.floor((oneHourDeadlineTime - now) / 1000));
  const is1hNearingDeadline = incident.notificationStatus === 'Drafting' && calculatedSecondsRemaining > 0 && calculatedSecondsRemaining <= 15 * 60;

  // Milestone 1: Incident Declared
  const m1Status: RegulatoryMilestoneStatus = 'Completed';

  // Milestone 2: 1-Hour Notification (MAS)
  const is1hDispatched = incident.notificationStatus !== 'Drafting';
  let m2Status: RegulatoryMilestoneStatus = 'Pending';
  if (is1hDispatched) {
    m2Status = 'Completed';
  } else if (now > oneHourDeadlineTime) {
    m2Status = 'Overdue';
  } else {
    m2Status = 'Active';
  }

  // Milestone 3: Containment
  const containmentState = incident.containmentStatus || (is1hDispatched ? 'Contained' : 'Active Isolation');
  const isContained = containmentState === 'Contained' || containmentState === 'Failover Complete';
  let m3Status: RegulatoryMilestoneStatus = 'Pending';
  if (isContained) {
    m3Status = 'Completed';
  } else if (m2Status === 'Completed' || m2Status === 'Overdue') {
    // Discovery + 4 hours RTO SLA under MAS TRM
    const fourHourLimit = new Date(incident.discoveryTimestamp).getTime() + 4 * 60 * 60 * 1000;
    if (now > fourHourLimit) {
      m3Status = 'Overdue';
    } else {
      m3Status = 'Active';
    }
  } else {
    m3Status = 'Pending';
  }

  // Milestone 4: Forensic Analysis
  const forensicState = incident.forensicStatus || (incident.notificationStatus === '14d RCA Submitted' ? 'Root Cause Confirmed' : 'Memory Dump Analyzed');
  const isForensicDone = forensicState === 'Root Cause Confirmed' || incident.notificationStatus === '14d RCA Submitted';
  let m4Status: RegulatoryMilestoneStatus = 'Pending';
  if (isForensicDone) {
    m4Status = 'Completed';
  } else if (isContained || is1hDispatched) {
    m4Status = 'Active';
  } else {
    m4Status = 'Pending';
  }

  // Milestone 5: Final Root Cause Report (14 Days)
  const is14dSubmitted = incident.notificationStatus === '14d RCA Submitted';
  let m5Status: RegulatoryMilestoneStatus = 'Pending';
  if (is14dSubmitted) {
    m5Status = 'Completed';
  } else if (now > fourteenDayDeadlineTime) {
    m5Status = 'Overdue';
  } else if (m4Status === 'Completed' || is1hDispatched) {
    m5Status = 'Active';
  } else {
    m5Status = 'Pending';
  }

  const milestones: RegulatoryMilestone[] = [
    {
      id: 'incident-declared',
      name: 'Incident Declared',
      shortClause: 'T0 Discovery',
      description: `Outage logged on ${incident.isCriticalSystem ? 'Critical CIS' : 'System'}. Severity: ${incident.severityLevel}.`,
      status: m1Status,
      slaLabel: 'T0 Logged',
      timestampOrDeadline: new Date(incident.discoveryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: '1h-notification',
      name: '1-Hour Notification (MAS)',
      shortClause: 'Notice 644 Cl. 4(1)',
      description: is1hNearingDeadline
        ? `⚠️ URGENT: Only ~${Math.ceil(calculatedSecondsRemaining / 60)}m left before statutory breach of Clause 4(1)!`
        : 'Statutory preliminary Template IT-01 notification dispatched within 60 minutes of discovery.',
      status: m2Status,
      slaLabel: m2Status === 'Overdue' ? '60m Breached' : is1hNearingDeadline ? `⚠️ ${Math.ceil(calculatedSecondsRemaining / 60)}m Left` : '60m SLA',
      timestampOrDeadline: is1hDispatched
        ? `Dispatched (${new Date(incident.oneHourDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        : `Due: ${new Date(incident.oneHourDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      actionButton: (!is1hDispatched && onDispatchInitialNotice) ? {
        label: is1hNearingDeadline ? '⚡ Urgent Dispatch' : 'Dispatch IT-01',
        icon: <Send className="w-2.5 h-2.5" />,
        onClick: () => onDispatchInitialNotice(incident),
        buttonClass: is1hNearingDeadline ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' : 'bg-rose-600 hover:bg-rose-500 text-white'
      } : undefined
    },
    {
      id: 'containment',
      name: 'Containment',
      shortClause: '4-Hour RTO Cap',
      description: 'Network perimeter isolation, DR failover to hot standby, and blast radius containment.',
      status: m3Status,
      slaLabel: m3Status === 'Overdue' ? 'RTO Breached' : '4h RTO SLA',
      timestampOrDeadline: isContained ? `Contained (${incident.durationMinutes}m)` : 'Target: < 4h RTO',
      actionButton: (!isContained && onAttestContainment) ? {
        label: 'Attest Failover',
        icon: <ShieldAlert className="w-2.5 h-2.5 text-emerald-400" />,
        onClick: () => onAttestContainment('Failover Complete'),
        buttonClass: 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
      } : undefined
    },
    {
      id: 'forensic-analysis',
      name: 'Forensic Analysis',
      shortClause: 'SIEM & Evidence',
      description: 'Preservation of memory dumps, hashed audit logs, correlation of vectors, and root-cause determination.',
      status: m4Status,
      slaLabel: 'Forensics',
      timestampOrDeadline: isForensicDone ? 'Root Cause Confirmed' : 'Memory & Log Dump',
      actionButton: (!isForensicDone && onConfirmRootCause) ? {
        label: 'Confirm Root Cause',
        icon: <Search className="w-2.5 h-2.5" />,
        onClick: () => onConfirmRootCause('Root Cause Confirmed'),
        buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white'
      } : undefined
    },
    {
      id: 'final-rca-report',
      name: 'Final Root Cause Report (14 Days)',
      shortClause: 'Notice 644 Cl. 4(2)',
      description: 'Statutory 14-day comprehensive root-cause analysis submitted with CAPA roadmap and Board TRMC signoff.',
      status: m5Status,
      slaLabel: m5Status === 'Overdue' ? '14d Breached' : '14d Statutory',
      timestampOrDeadline: is14dSubmitted
        ? `Submitted (${new Date(incident.fourteenDayDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
        : `Due: ${new Date(incident.fourteenDayDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
      actionButton: (!is14dSubmitted && onSubmitFinalRCA) ? {
        label: 'Submit 14d RCA',
        icon: <FileCheck2 className="w-2.5 h-2.5" />,
        onClick: () => onSubmitFinalRCA(),
        buttonClass: 'bg-purple-600 hover:bg-purple-500 text-white'
      } : undefined
    }
  ];

  // Helper for color-coded status badge styling
  const renderStatusBadge = (status: RegulatoryMilestoneStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 stroke-[2.5]" />
            <span>Completed</span>
          </span>
        );
      case 'Active':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-amber-950/80 text-amber-300 border border-amber-600/60 flex items-center gap-1 shadow-sm ring-1 ring-amber-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Active</span>
          </span>
        );
      case 'Overdue':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-rose-950/90 text-rose-300 border border-rose-600 flex items-center gap-1 shadow-md ring-1 ring-rose-500/40 animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
            <span>Overdue</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-slate-900/80 text-slate-400 border border-slate-700/60 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-slate-500" />
            <span>Pending</span>
          </span>
        );
    }
  };

  // Card border and background styling based on milestone status
  const getCardStyle = (status: RegulatoryMilestoneStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/60 shadow-sm';
      case 'Active':
        return 'bg-amber-950/30 border-amber-500 shadow-md ring-1 ring-amber-500/40';
      case 'Overdue':
        return 'bg-rose-950/30 border-rose-500 shadow-md ring-1 ring-rose-500/50';
      case 'Pending':
      default:
        return 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700';
    }
  };

  // Milestone sequence step number indicator
  const getStepNumberIndicator = (index: number, status: RegulatoryMilestoneStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-500 text-slate-950 shadow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        );
      case 'Active':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-amber-500 text-slate-950 shadow animate-pulse">
            {index + 1}
          </div>
        );
      case 'Overdue':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-rose-600 text-white shadow animate-pulse">
            !
          </div>
        );
      case 'Pending':
      default:
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-slate-800 text-slate-400 border border-slate-700">
            {index + 1}
          </div>
        );
    }
  };

  // Calculate percentage for progress connector line
  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const progressPercent = Math.min(100, Math.max(10, completedCount * 22));

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950/95 to-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Component Header & Color-Coded Status Badge Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400">
            <Milestone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Regulatory Milestone Tracker
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-950/90 text-rose-300 border border-rose-800 font-bold">
                MAS Notice 644
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Horizontal sequence of statutory milestones with real-time Pending, Active, Completed, and Overdue status tracking.
            </p>
          </div>
        </div>

        {/* 4 Status Badges Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="text-slate-400 mr-1 text-[10px]">Status Key:</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Completed
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Active
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-700/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Pending
          </span>
          <span className="px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Overdue
          </span>
        </div>
      </div>

      {/* Horizontal Sequence Track with Connecting Progress Line */}
      <div className="pt-2 pb-1">
        <div className="relative">
          {/* Background Connecting Bar (Visible on desktop/tablet) */}
          <div className="absolute top-5 left-10 right-10 h-1 bg-slate-800/90 -translate-y-1/2 z-0 hidden lg:block">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Horizontal Grid of 5 Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
            {milestones.map((milestone, idx) => {
              const cardClass = getCardStyle(milestone.status);

              return (
                <div
                  key={milestone.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${cardClass}`}
                >
                  <div>
                    {/* Top Row: Milestone Step Number + Color-Coded Status Badge */}
                    <div className="flex items-center justify-between">
                      {getStepNumberIndicator(idx, milestone.status)}
                      {renderStatusBadge(milestone.status)}
                    </div>

                    {/* Milestone Name & Description */}
                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {milestone.name}
                      </h4>
                      <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                        {milestone.shortClause}
                      </span>
                      <p className="text-[10px] text-slate-300 mt-1 leading-snug line-clamp-2">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Timestamp / Deadline / Action Button */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                    {milestone.timestampOrDeadline && (
                      <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                        <span className="text-slate-400">{milestone.slaLabel}:</span>
                        <span className={`font-semibold ${
                          milestone.status === 'Completed'
                            ? 'text-emerald-400'
                            : milestone.status === 'Overdue'
                            ? 'text-rose-400'
                            : milestone.status === 'Active'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}>
                          {milestone.timestampOrDeadline}
                        </span>
                      </div>
                    )}

                    {milestone.actionButton && (
                      <button
                        onClick={milestone.actionButton.onClick}
                        className={`w-full py-1 px-1.5 rounded-lg font-bold text-[9px] flex items-center justify-center space-x-1 transition shadow ${milestone.actionButton.buttonClass}`}
                      >
                        {milestone.actionButton.icon}
                        <span>{milestone.actionButton.label}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
