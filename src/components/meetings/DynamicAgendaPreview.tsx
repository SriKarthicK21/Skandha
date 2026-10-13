import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText,
  Layers,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { MeetingAgendaStructure, AgendaItem, StakeholderRole, InterviewObjective } from '../../types/meetingScheduler';
import { generateStructuredMeetingAgenda } from '../../data/dynamicAgendaData';

interface DynamicAgendaPreviewProps {
  framework: string;
  department: string;
  role?: StakeholderRole;
  interviewObjective?: InterviewObjective;
  objectiveDescription?: string;
  durationMinutes?: number;
  initialAgenda?: MeetingAgendaStructure;
  onAgendaGenerated?: (agenda: MeetingAgendaStructure) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
  compact?: boolean;
}

export const DynamicAgendaPreview: React.FC<DynamicAgendaPreviewProps> = ({
  framework = 'ISO/IEC 27001:2022',
  department = 'Software Engineering & DevOps',
  role = 'TECH_CUSTODIAN',
  interviewObjective = 'OPERATIONAL_CONTROLS_WALKTHROUGH',
  objectiveDescription = '',
  durationMinutes = 60,
  initialAgenda,
  onAgendaGenerated,
  onDurationChange,
  className = '',
  compact = false
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(durationMinutes);
  const [agenda, setAgenda] = useState<MeetingAgendaStructure>(() => {
    if (initialAgenda) return initialAgenda;
    return generateStructuredMeetingAgenda(
      framework,
      department,
      role,
      durationMinutes,
      interviewObjective
    );
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    OPENING: true,
    CONTEXT_GOVERNANCE: true,
    FIELDWORK_WALKTHROUGH: true,
    RISK_VERIFICATION: true,
    CLOSING_SYNTHESIS: true
  });

  // Synchronize when external durationMinutes prop changes
  useEffect(() => {
    if (durationMinutes && durationMinutes !== selectedDuration) {
      setSelectedDuration(durationMinutes);
    }
  }, [durationMinutes]);

  // Generate or re-fetch agenda
  const fetchOrGenerateAgenda = useCallback(
    async (dur: number = selectedDuration, forceAi: boolean = false) => {
      setIsLoading(true);

      // Attempt AI backend endpoint first if requested or mounted
      if (forceAi) {
        try {
          const resp = await fetch('/api/v1/meetings/generate-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              framework,
              department,
              role,
              durationMinutes: dur,
              interviewObjective,
              objectiveDescription
            })
          });

          if (resp.ok) {
            const data = await resp.json();
            if (data.success && data.agenda && Array.isArray(data.agenda.items)) {
              setAgenda(data.agenda);
              if (onAgendaGenerated) onAgendaGenerated(data.agenda);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // fallback to client heuristics
        }
      }

      // High-precision local domain engine generator
      const generated = generateStructuredMeetingAgenda(
        framework,
        department,
        role,
        dur,
        interviewObjective
      );
      setAgenda(generated);
      if (onAgendaGenerated) onAgendaGenerated(generated);
      setIsLoading(false);
    },
    [framework, department, role, interviewObjective, objectiveDescription, selectedDuration, onAgendaGenerated]
  );

  // Trigger regeneration when framework or department changes
  useEffect(() => {
    fetchOrGenerateAgenda(selectedDuration, false);
  }, [framework, department, role, interviewObjective, selectedDuration]);

  // Handle duration pill change
  const handleDurationSelect = (dur: number) => {
    setSelectedDuration(dur);
    if (onDurationChange) onDurationChange(dur);
    fetchOrGenerateAgenda(dur, false);
  };

  // Toggle single phase accordion
  const togglePhase = (phaseKey: string) => {
    setExpandedPhases(prev => ({ ...prev, [phaseKey]: !prev[phaseKey] }));
  };

  // Toggle all accordion phases
  const toggleAll = (expand: boolean) => {
    setExpandedPhases({
      OPENING: expand,
      CONTEXT_GOVERNANCE: expand,
      FIELDWORK_WALKTHROUGH: expand,
      RISK_VERIFICATION: expand,
      CLOSING_SYNTHESIS: expand
    });
  };

  // Copy Agenda as structured Markdown
  const handleCopyMarkdown = () => {
    let md = `# ${agenda.agendaTitle}\n`;
    md += `**Framework**: ${agenda.framework} | **Department**: ${agenda.department} | **Duration**: ${agenda.totalDurationMinutes} mins\n`;
    md += `**Audit Protocol Standard**: ${agenda.leadAuditorStandardProtocol}\n\n`;

    agenda.items.forEach((item, idx) => {
      const startMin = item.timeOffsetMinutes;
      const endMin = startMin + item.durationMinutes;
      const timeStr = `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')} - ${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')} (${item.durationMinutes} min)`;

      md += `## Phase ${idx + 1}: ${item.title} [${timeStr}]\n`;
      md += `**Responsible**: ${item.responsibleRole}\n\n`;

      md += `### Explicit ISO Audit Points & Clauses:\n`;
      item.isoAuditPoints.forEach(pt => {
        md += `- ${pt}\n`;
      });
      md += `\n`;

      md += `### Key Discussion & Inspection Checkpoints:\n`;
      item.discussionCheckpoints.forEach(cp => {
        md += `- ${cp}\n`;
      });
      md += `\n`;

      md += `### Mandatory Evidence / Records Inspected:\n`;
      item.mandatoryEvidence.forEach(ev => {
        md += `- [ ] ${ev}\n`;
      });
      md += `\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export Agenda as a text file
  const handleDownloadText = () => {
    let text = `================================================================================\n`;
    text += `${agenda.agendaTitle.toUpperCase()}\n`;
    text += `Standard Protocol: ${agenda.leadAuditorStandardProtocol}\n`;
    text += `Framework: ${agenda.framework} | Department: ${agenda.department} | Total Time: ${agenda.totalDurationMinutes} mins\n`;
    text += `Generated: ${agenda.generatedAt || new Date().toISOString()} (${agenda.generatedBy || 'ISO 19011 Engine'})\n`;
    text += `================================================================================\n\n`;

    agenda.items.forEach((item, idx) => {
      const startMin = item.timeOffsetMinutes;
      const endMin = startMin + item.durationMinutes;
      text += `[Phase ${idx + 1}] ${item.title}\n`;
      text += `Timeline: Minute ${startMin} to ${endMin} (${item.durationMinutes} min)\n`;
      text += `Lead/Attendees: ${item.responsibleRole}\n\n`;
      text += `EXPLICIT ISO AUDIT POINTS / CLAUSES:\n`;
      item.isoAuditPoints.forEach(pt => (text += `  • ${pt}\n`));
      text += `\nAUDIT CHECKPOINTS & QUESTIONS:\n`;
      item.discussionCheckpoints.forEach(cp => (text += `  - ${cp}\n`));
      text += `\nMANDATORY AUDIT EVIDENCE / ARTIFACTS:\n`;
      item.mandatoryEvidence.forEach(ev => (text += `  [ ] ${ev}\n`));
      text += `\n--------------------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ISO-Agenda-${department.replace(/[^a-zA-Z0-9]/g, '_')}-${agenda.totalDurationMinutes}min.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPhaseBadgeColor = (phase: string) => {
    switch (phase) {
      case 'OPENING':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
      case 'CONTEXT_GOVERNANCE':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
      case 'FIELDWORK_WALKTHROUGH':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'RISK_VERIFICATION':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'CLOSING_SYNTHESIS':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPhaseBorderColor = (phase: string) => {
    switch (phase) {
      case 'OPENING':
        return 'border-sky-500/30';
      case 'CONTEXT_GOVERNANCE':
        return 'border-indigo-500/30';
      case 'FIELDWORK_WALKTHROUGH':
        return 'border-emerald-500/30';
      case 'RISK_VERIFICATION':
        return 'border-amber-500/30';
      case 'CLOSING_SYNTHESIS':
        return 'border-purple-500/30';
      default:
        return 'border-slate-800';
    }
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 border border-indigo-500/30 shadow-lg overflow-hidden ${className}`}
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-indigo-500/20 bg-slate-950/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Dynamic Agenda Preview
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60">
              ISO 19011:2018 Cl. 6.4 Protocol
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>{agenda.generatedBy || 'ISO Audit Engine'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-400">
            High-level audit interview agenda tailored for{' '}
            <strong className="text-slate-200">{department}</strong> under{' '}
            <strong className="text-sky-300">{framework}</strong> with explicit ISO audit points.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
          {/* Duration Selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 text-xs">
            {[30, 45, 60, 90].map(dur => (
              <button
                key={dur}
                type="button"
                onClick={() => handleDurationSelect(dur)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  selectedDuration === dur
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`Scale agenda for ${dur} minutes`}
              >
                {dur}m
              </button>
            ))}
          </div>

          {/* AI Re-analyze */}
          <button
            type="button"
            onClick={() => fetchOrGenerateAgenda(selectedDuration, true)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Re-synthesize agenda with Gemini AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">AI Re-analyze</span>
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            title="Copy structured agenda as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Copy Markdown</span>
              </>
            )}
          </button>

          {/* Download Text */}
          <button
            type="button"
            onClick={handleDownloadText}
            className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Download formatted text agenda file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Duration Meter */}
      <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-300">
            Total Session Time: <strong className="text-white">{agenda.totalDurationMinutes} Minutes</strong>
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            5 Distinct Audit Phases (ISO 19011 Clause 6.4)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => toggleAll(true)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 transition"
          >
            Expand All
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={() => toggleAll(false)}
            className="text-[10px] text-slate-400 hover:text-slate-300 transition"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Timeline Phases Container */}
      <div className="p-4 sm:p-5 space-y-3">
        {agenda.items.map((item, idx) => {
          const isExpanded = !!expandedPhases[item.phase];
          const startMin = item.timeOffsetMinutes;
          const endMin = startMin + item.durationMinutes;
          const timeStr = `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')} - ${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

          return (
            <div
              key={item.id || idx}
              className={`rounded-xl bg-slate-900/90 border transition-all ${getPhaseBorderColor(
                item.phase
              )} overflow-hidden`}
            >
              {/* Collapsible Phase Header */}
              <div
                onClick={() => togglePhase(item.phase)}
                className="p-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850 transition"
              >
                <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                  {/* Phase Number Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${getPhaseBadgeColor(
                      item.phase
                    )}`}
                  >
                    #{idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded border ${getPhaseBadgeColor(
                          item.phase
                        )}`}
                      >
                        {item.phaseLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {timeStr} ({item.durationMinutes}m)
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-tight truncate">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="hidden lg:inline text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
                    Lead: {item.responsibleRole}
                  </span>
                  <button
                    type="button"
                    className="p-1 rounded-md text-slate-400 hover:text-white transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Phase Details */}
              {isExpanded && (
                <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-950/60 space-y-3.5 text-xs">
                  {/* 1. Explicit ISO Audit Points */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Explicit ISO Audit Points & Standard Clauses</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {item.isoAuditPoints.map((pt, pIdx) => (
                        <span
                          key={pIdx}
                          className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-200 border border-indigo-700/50 shadow-sm"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 2. Key Discussion Checkpoints & Audit Probes */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Discussion Checkpoints & Fieldwork Inquiries</span>
                    </div>

                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {item.discussionCheckpoints.map((cp, cIdx) => (
                        <li key={cIdx} className="flex items-start space-x-2">
                          <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                          <span className="leading-relaxed">{cp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Mandatory Evidence / Records to Verify */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mandatory Evidence & System Artifacts to Verify</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.mandatoryEvidence.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-2 text-[10px] text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Audit Protocol Note */}
      <div className="p-3 px-5 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            Compliant with <strong className="text-slate-200">ISO 19011:2018 Clause 6.4.2</strong> (Opening),{' '}
            <strong className="text-slate-200">6.4.4</strong> (Evidence), and{' '}
            <strong className="text-slate-200">6.4.10</strong> (Closing Meeting).
          </span>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          Last Synced: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
