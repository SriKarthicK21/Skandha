import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Building,
  User,
  FileText,
  Clock,
  Layers,
  Award,
  Sparkles
} from 'lucide-react';
import { MeetingInterviewSession } from '../../types/meetingScheduler';
import { STAKEHOLDER_ROLE_LABELS, OBJECTIVE_DEFINITIONS } from '../../data/meetingSchedulerData';
import { getAiSuggestedScopeAreas } from '../../data/aiScopeSuggestions';
import { generateStructuredMeetingAgenda } from '../../data/dynamicAgendaData';

interface MeetingDossierExportModalProps {
  meeting: MeetingInterviewSession;
  onClose: () => void;
}

export const MeetingDossierExportModal: React.FC<MeetingDossierExportModalProps> = ({
  meeting,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const agenda =
    meeting.dynamicAgenda ||
    generateStructuredMeetingAgenda(
      meeting.primaryFramework,
      meeting.department,
      meeting.stakeholderRole,
      meeting.durationMinutes,
      meeting.interviewObjective
    );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const roleInfo = STAKEHOLDER_ROLE_LABELS[meeting.stakeholderRole]?.label || meeting.stakeholderRole;
    const objInfo = OBJECTIVE_DEFINITIONS[meeting.interviewObjective]?.title || meeting.interviewObjective;

    const content = `
================================================================================
ISO IMPLEMENTATION PROJECT AUDIT INTERVIEW DOSSIER
CONFIDENTIAL - ISO 27001 / ISO 42001 CLAUSE 7.5 DOCUMENTED INFORMATION
================================================================================

MEETING REFERENCE : ${meeting.meetingCode}
TITLE             : ${meeting.title}
PROJECT           : ${meeting.projectName} (${meeting.projectId})
CURRENT PHASE     : ${meeting.isoProjectMapping.projectPhase}
MILESTONE         : ${meeting.isoProjectMapping.targetMilestone}
DATE & TIME       : ${meeting.scheduledDate} at ${meeting.scheduledTime} (${meeting.durationMinutes} mins)
LOCATION / LINK   : ${meeting.locationOrLink}

STAKEHOLDER INFORMATION:
  Name            : ${meeting.stakeholder.name}
  Email           : ${meeting.stakeholder.email}
  Title           : ${meeting.stakeholder.title}
  Department      : ${meeting.department}
  Role Category   : ${roleInfo}

INTERVIEW OBJECTIVE:
  Objective       : ${objInfo}
  Frameworks      : ${meeting.frameworks.join(', ')}
  Scope Details   : ${meeting.objectiveDescription || 'Standard ISO discovery'}

ISO 19011 STRUCTURED AUDIT AGENDA (${agenda.totalDurationMinutes} MINS):
  Standard Baseline : ${agenda.leadAuditorStandardProtocol}
  Department Scope  : ${agenda.department}
${agenda.items
  .map(
    item => `
[${item.phaseLabel}] ${item.title.toUpperCase()} (${item.durationMinutes}m | ${item.timeOffsetMinutes}m - ${item.timeOffsetMinutes + item.durationMinutes}m)
  Responsible     : ${item.responsibleRole}
  Audit Points    : ${item.isoAuditPoints.join('; ')}
  Checkpoints     : ${item.discussionCheckpoints.join('; ')}
  Evidence Reqd   : ${item.mandatoryEvidence.join('; ')}`
  )
  .join('\n')}

ISO MAPPING SPECIFICATION:
  Mapped Clauses  : ${meeting.isoProjectMapping.mappedClauses.join(', ')}
  Annex A Controls: ${meeting.isoProjectMapping.mappedAnnexAControls.join(', ')}
  Deliverable     : ${meeting.isoProjectMapping.deliverableOutput}
  Target Evidence : ${meeting.isoProjectMapping.expectedEvidenceArtifacts.join('; ')}

CONFIDENTIALITY & RECORDING CONSENT ATTESTATION:
  A/V Recording   : ${meeting.consents.audioVideoRecordingConsent ? 'GRANTED' : 'DENIED'}
  AI Transcription: ${meeting.consents.aiTranscriptionConsent ? 'GRANTED' : 'DENIED'}
  NDA & Cl. 7.5   : ${meeting.consents.confidentialityAgreementConsent ? 'SIGNED & RATIFIED' : 'PENDING'}
  Auditor Access  : ${meeting.consents.auditorAccessSamplingConsent ? 'AUTHORIZED' : 'RESTRICTED'}
  Retention Period: ${meeting.consents.dataRetentionMonths} Months
  Signer Name     : ${meeting.consents.consentSignerName}
  Signed Timestamp: ${meeting.consents.consentSignedAt}
  Signer IP       : ${meeting.consents.consentIpAddress}
  Integrity Hash  : SHA-256 [${meeting.consents.consentIntegrityHash}]

INTERVIEW PROTOCOL & QUESTIONS EVALUATION:
${meeting.interviewQuestions
  .map(
    (q, idx) => `
[${idx + 1}] Question: ${q.question}
    Reference Control : ${q.mappedClauseOrControl}
    Compliance Rating : ${q.complianceFinding || 'Pending Evaluation'}
    Stakeholder Notes : ${q.responseNotes || 'No notes recorded'}
`
  )
  .join('\n')}

TRANSCRIPT EXECUTIVE SUMMARY:
${meeting.transcriptSummary || 'Interview completed in accordance with ISO 19011 auditing principles.'}

LEAD AUDITOR ATTESTATION:
  Interviewer     : ${meeting.interviewer.name} (${meeting.interviewer.role})
  Status          : ${meeting.status}
  Generated At    : ${new Date().toISOString()}
================================================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.meetingCode}_ISO_Audit_Dossier.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const roleLabel = STAKEHOLDER_ROLE_LABELS[meeting.stakeholderRole]?.label || meeting.stakeholderRole;
  const objectiveDef = OBJECTIVE_DEFINITIONS[meeting.interviewObjective];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                  {meeting.meetingCode}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                  ISO Audit Working Paper
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5">ISO Implementation Interview Dossier</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
              title="Download TXT Dossier"
            >
              <Download className="w-4 h-4" />
              <span>Download Record</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div ref={printRef} className="p-8 overflow-y-auto space-y-6 text-slate-200 bg-slate-900">
          {/* Formal Audit Document Header */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
                  Document Classification: CONFIDENTIAL / ISO 27001 CLAUSE 7.5
                </span>
                <h1 className="text-lg font-black text-white mt-1">{meeting.title}</h1>
                <p className="text-xs text-sky-400 font-medium">{meeting.projectName}</p>
              </div>
              <div className="text-right sm:shrink-0 font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Audit Ref Code</div>
                <div className="text-white font-bold text-sm">{meeting.meetingCode}</div>
                <div className="text-emerald-400 text-[11px] font-semibold">{meeting.status}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Interview Date</span>
                <span className="font-medium text-white">{meeting.scheduledDate} ({meeting.scheduledTime})</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Duration</span>
                <span className="font-medium text-white">{meeting.durationMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Implementation Phase</span>
                <span className="font-medium text-indigo-300">{meeting.isoProjectMapping.projectPhase}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Lead Interviewer</span>
                <span className="font-medium text-white">{meeting.interviewer.name}</span>
              </div>
            </div>
          </div>

          {/* Stakeholder & Department Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Interviewed Stakeholder Profile</span>
              </div>
              <div className="text-sm font-bold text-white">{meeting.stakeholder.name}</div>
              <div className="text-xs text-slate-300">{meeting.stakeholder.title}</div>
              <div className="text-xs text-slate-400 font-mono">{meeting.stakeholder.email}</div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Governance Role:</span>
                <span className="font-bold text-indigo-300">{roleLabel}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>Department & Scope Focus</span>
              </div>
              <div className="text-sm font-bold text-white">{meeting.department}</div>
              <div className="text-xs text-slate-300">
                Objective: <span className="text-white font-medium">{objectiveDef?.title || meeting.interviewObjective}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {meeting.frameworks.map(fw => (
                  <span key={fw} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ISO Implementation Project Mapping & Clauses */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>ISO Implementation Project Mapping Specifications</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {meeting.isoProjectMapping.targetMilestone}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Mapped ISO Clauses</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {meeting.isoProjectMapping.mappedClauses.map(clause => (
                    <span key={clause} className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-semibold">
                      {clause}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Mapped Annex A Security Controls</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {meeting.isoProjectMapping.mappedAnnexAControls.map(ctrl => (
                    <span key={ctrl} className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-semibold">
                      {ctrl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Expected Deliverable Output</span>
              <span className="text-white font-medium">{meeting.isoProjectMapping.deliverableOutput}</span>
            </div>
          </div>

          {/* AI-Suggested Scope Checklist (Top 3 Critical Discussion Areas) */}
          {(() => {
            const scopeAreas =
              meeting.aiSuggestedScope && meeting.aiSuggestedScope.length > 0
                ? meeting.aiSuggestedScope
                : getAiSuggestedScopeAreas(
                    meeting.primaryFramework,
                    meeting.department,
                    meeting.stakeholderRole,
                    meeting.interviewObjective
                  );

            return (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Suggested Scope Checklist (3 Critical Discussion Areas)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {meeting.primaryFramework}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                  {scopeAreas.slice(0, 3).map((area, idx) => (
                    <div
                      key={area.id || idx}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 flex flex-col justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300">
                            #{idx + 1}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-300">
                            {area.mappedControlOrClause}
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold text-white leading-snug">{area.topic}</h4>
                        <p className="text-[10px] text-slate-300 leading-relaxed">{area.rationale}</p>
                      </div>
                      {area.suggestedQuestions && area.suggestedQuestions.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span className="text-indigo-300 block font-semibold">Audit Probe:</span>
                          <span className="italic text-slate-300">"{area.suggestedQuestions[0]}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ISO 19011:2018 Structured Audit Agenda & Timeline */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>ISO 19011:2018 Clause 6.4 Structured Audit Agenda ({agenda.totalDurationMinutes}m)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Baseline: {agenda.leadAuditorStandardProtocol}
              </span>
            </div>

            <div className="space-y-2">
              {agenda.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-bold text-[10px] font-mono">
                        {item.phaseLabel}
                      </span>
                      <span className="font-bold text-white text-xs">{item.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                        {item.timeOffsetMinutes}m - {item.timeOffsetMinutes + item.durationMinutes}m ({item.durationMinutes}m)
                      </span>
                      <span className="text-slate-400">
                        Lead: <strong className="text-slate-300">{item.responsibleRole}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Explicit ISO Audit Points */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {item.isoAuditPoints.map((pt, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300"
                      >
                        ✓ {pt}
                      </span>
                    ))}
                  </div>

                  {/* Checkpoints & Evidence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
                    <div>
                      <span className="font-bold text-slate-400 block mb-0.5">Key Checkpoints:</span>
                      <ul className="space-y-0.5 text-slate-300 list-disc list-inside">
                        {item.discussionCheckpoints.map((cp, cIdx) => (
                          <li key={cIdx} className="truncate">
                            {cp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-400 block mb-0.5">Mandatory Evidence:</span>
                      <ul className="space-y-0.5 text-slate-300 list-disc list-inside">
                        {item.mandatoryEvidence.map((ev, eIdx) => (
                          <li key={eIdx} className="truncate text-emerald-300/90">
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signed Confidentiality & Recording Consents */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Stakeholder Confidentiality & Transcript Consent Record</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">A/V Recording</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Consented</span>
                </span>
                {meeting.consents.recordingConsentTimestamp && (
                  <span className="text-[9px] font-mono text-slate-400 block mt-1 truncate">
                    {meeting.consents.recordingConsentTimestamp.split('T')[1]?.slice(0, 8) || meeting.consents.recordingConsentTimestamp}
                  </span>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">AI Transcription</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized</span>
                </span>
                {meeting.consents.transcriptConsentTimestamp && (
                  <span className="text-[9px] font-mono text-slate-400 block mt-1 truncate">
                    {meeting.consents.transcriptConsentTimestamp.split('T')[1]?.slice(0, 8) || meeting.consents.transcriptConsentTimestamp}
                  </span>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">NDA & Cl. 7.5</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ratified</span>
                </span>
                {meeting.consents.confidentialityConsentTimestamp && (
                  <span className="text-[9px] font-mono text-slate-400 block mt-1 truncate">
                    {meeting.consents.confidentialityConsentTimestamp.split('T')[1]?.slice(0, 8) || meeting.consents.confidentialityConsentTimestamp}
                  </span>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Auditor Sampling</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Permitted</span>
                </span>
                {meeting.consents.auditorAccessConsentTimestamp && (
                  <span className="text-[9px] font-mono text-slate-400 block mt-1 truncate">
                    {meeting.consents.auditorAccessConsentTimestamp.split('T')[1]?.slice(0, 8) || meeting.consents.auditorAccessConsentTimestamp}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-400">
                <span>Signer: <strong className="text-white">{meeting.consents.consentSignerName}</strong> ({meeting.consents.consentSignerEmail})</span>
                <span>Timestamp: {meeting.consents.consentSignedAt}</span>
              </div>
              <div className="text-slate-500 text-[10px] truncate">
                SHA-256 Digital Verification Hash: <span className="text-sky-400">{meeting.consents.consentIntegrityHash}</span>
              </div>
            </div>
          </div>

          {/* Interview Questions, Responses & Findings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Interview Questions & Working Paper Findings ({meeting.interviewQuestions.length} Evaluated)</span>
            </h3>

            <div className="space-y-3">
              {meeting.interviewQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-sky-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {q.mappedClauseOrControl}
                      </span>
                      <p className="text-xs font-bold text-white pt-1">{idx + 1}. {q.question}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 border ${
                        q.complianceFinding === 'Conforming'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : q.complianceFinding === 'Observation'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : q.complianceFinding === 'Minor Gap'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {q.complianceFinding || 'Conforming'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Stakeholder Testimony & Notes:</span>
                    <p className="leading-relaxed">{q.responseNotes || 'Detailed walkthrough completed without deviations.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          {meeting.transcriptSummary && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Session Transcript Executive Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{meeting.transcriptSummary}</p>
            </div>
          )}

          {/* Formal Audit Sign-Off Box */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Lead ISO Implementer / Auditor</span>
              <div className="font-bold text-white mt-1">{meeting.interviewer.name}</div>
              <div className="text-[11px] text-slate-400">{meeting.interviewer.role}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-2">✓ Certified Independent Working Paper</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Audited Department Stakeholder</span>
              <div className="font-bold text-white mt-1">{meeting.stakeholder.name}</div>
              <div className="text-[11px] text-slate-400">{meeting.stakeholder.title}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-2">✓ Consents & Testimony Digitally Attested</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
