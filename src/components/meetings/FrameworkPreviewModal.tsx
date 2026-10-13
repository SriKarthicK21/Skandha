import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Download,
  HelpCircle,
  Users,
  Award,
  Layers,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import {
  FRAMEWORK_PREVIEWS_CATALOG,
  FrameworkScopeDetails
} from '../../data/frameworkPreviewData';
import { useToast } from '../common/ToastContainer';

interface FrameworkPreviewModalProps {
  frameworkId?: string;
  onClose: () => void;
  onSelectFramework?: (frameworkId: string) => void;
  showSelectAction?: boolean;
}

export const FrameworkPreviewModal: React.FC<FrameworkPreviewModalProps> = ({
  frameworkId = 'ISO/IEC 27001:2022',
  onClose,
  onSelectFramework,
  showSelectAction = false
}) => {
  const { showToast } = useToast();
  const [activeFrameworkId, setActiveFrameworkId] = useState<string>(
    FRAMEWORK_PREVIEWS_CATALOG[frameworkId] ? frameworkId : 'ISO/IEC 27001:2022'
  );
  const [copied, setCopied] = useState<boolean>(false);

  const framework = FRAMEWORK_PREVIEWS_CATALOG[activeFrameworkId] || FRAMEWORK_PREVIEWS_CATALOG['ISO/IEC 27001:2022'];

  const allFrameworksList = Object.values(FRAMEWORK_PREVIEWS_CATALOG);

  // Generate clean text summary for clipboard / email invite
  const generateTextBriefing = (): string => {
    let text = `PRE-MEETING STAKEHOLDER SCOPE BRIEFING: ${framework.name}\n`;
    text += `Standard Body: ${framework.standardBody}\n`;
    text += `Scope Summary: ${framework.overviewSummary}\n\n`;
    text += `KEY INTERVIEW FOCUS AREAS:\n`;

    framework.interviewFocusAreas.forEach((area, idx) => {
      text += `\n${idx + 1}. ${area.domain}\n`;
      text += `   - Scope: ${area.description}\n`;
      text += `   - Controls Tested: ${area.keyControls.join(', ')}\n`;
      text += `   - What to Know: ${area.whatStakeholderNeedsToKnow}\n`;
      text += `   - Typical Evidence to Have Ready: ${area.typicalEvidenceToPrepare.join(', ')}\n`;
    });

    text += `\nTARGET DELIVERABLE: ${framework.auditOutcomeDeliverable}\n`;
    text += `CONFIDENTIALITY: All interview responses and working papers are strictly confidential and protected under ISO 27001 Clause 7.5.\n`;
    return text;
  };

  const handleCopyBriefing = () => {
    const briefingText = generateTextBriefing();
    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Briefing Copied to Clipboard',
      message: 'Paste this scope briefing into calendar invites or stakeholder briefing emails.'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadBriefing = () => {
    const text = generateTextBriefing();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${framework.shortName.replace(/[\s/:]+/g, '_')}_Stakeholder_Briefing.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      type: 'info',
      title: 'Briefing Downloaded',
      message: 'Stakeholder scope briefing downloaded as plain text file.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto text-slate-200">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${framework.badgeColor}`}>
                {framework.shortName}
              </span>
              <span className="text-xs text-slate-400 font-medium">Framework Pre-Interview Scope Preview</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>{framework.name}</span>
            </h2>
            <p className="text-xs text-slate-400">{framework.tagline}</p>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            {/* Quick Framework selector */}
            <select
              value={activeFrameworkId}
              onChange={e => setActiveFrameworkId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {allFrameworksList.map(f => (
                <option key={f.id} value={f.id}>
                  {f.shortName}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Executive Overview & Scope Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Framework Purpose & Scoping Intent</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Standard Body: {framework.standardBody}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {framework.overviewSummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Primary Architecture:</span>
                <span className="text-slate-200 font-medium">{framework.primaryClausesOrDomains}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Audit Target Deliverable:</span>
                <span className="text-emerald-400 font-semibold">{framework.auditOutcomeDeliverable}</span>
              </div>
            </div>
          </div>

          {/* Key Areas the Interview Will Focus On (Main Feature) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Key Interview Focus Areas & Questions to Expect</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stakeholders should review these focus domains to understand what controls will be discussed and what evidence to have ready.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {framework.interviewFocusAreas.length} Core Domains
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {framework.interviewFocusAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/80 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{area.domain}</h4>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {area.keyControls.map(ctrl => (
                        <span
                          key={ctrl}
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800"
                        >
                          {ctrl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{area.description}</p>

                  {/* Stakeholder preparation callout */}
                  <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-900/40 space-y-2 text-xs">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-sky-300 block">What the Stakeholder Needs to Know:</span>
                        <p className="text-slate-300 mt-0.5">{area.whatStakeholderNeedsToKnow}</p>
                      </div>
                    </div>

                    {/* Typical evidence items */}
                    <div className="pt-2 border-t border-sky-900/30 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                        Evidence to Have Ready:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {area.typicalEvidenceToPrepare.map((ev, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-800 flex items-center space-x-1"
                          >
                            <FileText className="w-3 h-3 text-emerald-400" />
                            <span>{ev}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Stakeholder Roles Typically Interviewed */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Stakeholder Roles Typically Interviewed</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {framework.targetRolesToInterview.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 font-medium text-xs flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-sky-400" />
                  <span>{role}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Stakeholder FAQs for Pre-Meeting Clarity */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Stakeholder Scope FAQs (Reducing Interview Friction)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {framework.stakeholderScopeFaqs.map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <span className="font-bold text-amber-300 block">{faq.question}</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Strip with Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyBriefing}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Scope Briefing for Stakeholder'}</span>
            </button>

            <button
              onClick={handleDownloadBriefing}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download (.txt)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            {showSelectAction && onSelectFramework && (
              <button
                onClick={() => {
                  onSelectFramework(framework.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Select & Apply {framework.shortName}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
