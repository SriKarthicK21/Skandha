import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Award,
  FileDown
} from 'lucide-react';
import {
  MeetingSegmentAiSummary,
  MeetingInterviewSession,
  LiveTranscriptSegment,
  TranscriptEntity
} from '../../types/meetingScheduler';
import { exportMeetingReportPDF } from '../../utils/meetingReportPdfExporter';

export interface MeetingSegmentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MeetingSegmentAiSummary | null;
  session: MeetingInterviewSession;
  onRegenerate: () => void;
  isRegenerating: boolean;
  segmentCount: number;
  segments?: LiveTranscriptSegment[];
  entities?: TranscriptEntity[];
}

export const MeetingSegmentSummaryModal: React.FC<MeetingSegmentSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  session,
  onRegenerate,
  isRegenerating,
  segmentCount,
  segments = [],
  entities = []
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  if (!isOpen || !summary) return null;

  const handleExportPdfReport = () => {
    setIsExportingPdf(true);
    try {
      exportMeetingReportPDF({
        session,
        summary,
        segments,
        entities,
        tenantName: 'SKANDA Enterprise Organization',
        leadAuditorName: session.interviewer?.name || 'Dr. Sarah Chen',
        leadAuditorRole: session.interviewer?.role || 'Lead ISO Auditor & GRC Evaluator',
        leadAuditorEmail: session.interviewer?.email || 'audit.lead@skanda-grc.internal'
      });
    } catch (err: any) {
      console.error('Failed to export meeting report PDF:', err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 800);
    }
  };

  // Build markdown export text
  const markdownText = `# Meeting Segment Summary - ${session.stakeholder.title} (${session.stakeholder.name})
**Framework**: ${session.primaryFramework}
**Department**: ${session.isoProjectMapping.projectName}
**Date & Time**: ${session.scheduledDate} ${session.scheduledTime}
**Segments Analyzed**: ${segmentCount}
**AI Model**: ${summary.source || 'gemini-3.8-flash'}
**Generated At**: ${summary.generatedAt || new Date().toISOString()}

---

## Executive Summary
${summary.executiveSummary}

---

## Key Discussions
${summary.keyDiscussions.map(d => `- ${d}`).join('\n')}

---

## Compliance & Control Findings
${summary.complianceFindings
  .map(
    f =>
      `### [${f.findingType}] ${f.topic} (${f.controlRef})\n${f.detail}\n`
  )
  .join('\n')}

---

## Remediation & Evidence Action Items
${summary.actionItems
  .map(
    a =>
      `- **[${a.priority}]** ${a.task}\n  *Owner*: ${a.owner} | *Deadline*: ${a.dueDate}`
  )
  .join('\n')}

---

## Audit Readiness Verdict
${summary.auditReadinessVerdict}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-summary-${session.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-700/60 flex items-center justify-center text-violet-300 shadow-sm">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Meeting Segment AI Summary
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet-950/90 text-violet-300 border border-violet-700/60">
                  {summary.source || 'gemini-3.8-flash'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                  {segmentCount} dialogue turns
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {session.stakeholder.title} • {session.isoProjectMapping.projectName} • {session.primaryFramework}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy markdown summary to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download summary as markdown file"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handleExportPdfReport}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Convert this summary, findings, and verbatim transcript into an official PDF document for audit compliance"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-100" />
              <span>Export Meeting Report (PDF)</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-2.5 py-1.5 rounded-lg bg-violet-950/80 hover:bg-violet-900 text-violet-300 text-xs font-medium border border-violet-700/60 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Re-run AI model summarization"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6 text-slate-200">
          {/* Executive Overview Card */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-violet-950/30 via-slate-900 to-indigo-950/30 border border-violet-800/40">
            <div className="flex items-center gap-2 text-violet-300 font-semibold text-xs tracking-wide uppercase mb-2">
              <Award className="w-4 h-4 text-violet-400" />
              <span>Executive Overview</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              {summary.executiveSummary}
            </p>
          </div>

          {/* Key Discussions (Bullet Points) */}
          <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs tracking-wide uppercase mb-3">
              <FileText className="w-4 h-4" />
              <span>Key Technical & Governance Discussions</span>
            </div>
            <ul className="space-y-2.5">
              {summary.keyDiscussions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance Findings & Control Citations */}
          <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Control Evaluations & Compliance Findings</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {summary.complianceFindings.length} findings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summary.complianceFindings.map((finding, idx) => {
                const isCompliant = finding.findingType === 'COMPLIANT' || finding.findingType === 'STRENGTH';
                const isGap = finding.findingType === 'GAP';
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {finding.topic}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                            isCompliant
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                              : isGap
                              ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                              : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          }`}
                        >
                          {finding.findingType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {finding.detail}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Control Reference:</span>
                      <span className="text-sky-400 font-semibold">{finding.controlRef}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remediation & Evidence Action Items */}
          <div className="rounded-xl p-4 bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wide uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Remediation & Evidence Tasks</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {summary.actionItems.length} action items
              </span>
            </div>

            <div className="space-y-2.5">
              {summary.actionItems.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border mt-0.5 shrink-0 ${
                        action.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : action.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {action.priority}
                    </span>
                    <span className="text-xs text-slate-200 font-medium leading-relaxed">
                      {action.task}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-400 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-300">{action.owner}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{action.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Readiness Verdict */}
          <div className="rounded-xl p-4 bg-sky-950/30 border border-sky-800/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-700/60 flex items-center justify-center shrink-0 text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
                Audit Readiness Verdict
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {summary.auditReadinessVerdict}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Generated via SKANDA Enterprise GRC Intelligence Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
