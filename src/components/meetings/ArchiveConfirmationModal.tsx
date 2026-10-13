import React, { useState } from 'react';
import {
  Archive,
  ShieldCheck,
  Lock,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Hash,
  X,
  AlertCircle
} from 'lucide-react';
import { MeetingInterviewSession } from '../../types/meetingScheduler';

export interface ArchiveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingsToArchive: MeetingInterviewSession[];
  onConfirmArchive: (
    sessionIds: string[],
    archiveMetadata: {
      archiveReason: string;
      retentionMonths: number;
      retentionExpiryDate: string;
      archivedBy: string;
    }
  ) => void;
  currentUser?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

const ARCHIVE_REASONS = [
  'Finalized Internal Audit & Evidence Mapping',
  'External Certification Stage 1 Fieldwork Sealed',
  'Clause 9.3 Management Review Ratification Completed',
  'Annual Audit Cycle Closed - Working Papers Sealed',
  'Routine Operational Pipeline Decluttering (Audit-Ready)'
];

export const ArchiveConfirmationModal: React.FC<ArchiveConfirmationModalProps> = ({
  isOpen,
  onClose,
  meetingsToArchive,
  onConfirmArchive,
  currentUser
}) => {
  if (!isOpen || meetingsToArchive.length === 0) return null;

  const isBulk = meetingsToArchive.length > 1;
  const primarySession = meetingsToArchive[0];

  const defaultMonths = primarySession.consents?.dataRetentionMonths || 36;
  const [selectedReason, setSelectedReason] = useState<string>(ARCHIVE_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [retentionMonths, setRetentionMonths] = useState<number>(defaultMonths);
  const [auditorName, setAuditorName] = useState<string>(
    currentUser?.name || primarySession.interviewer?.name || 'Lead ISMS Auditor'
  );

  // Compute calculated retention expiry date
  const computeExpiryDate = (months: number): string => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const calculatedRetentionExpiry = computeExpiryDate(retentionMonths);

  const handleConfirm = () => {
    const finalReason = customReason.trim() ? customReason.trim() : selectedReason;
    const sessionIds = meetingsToArchive.map(m => m.id);

    onConfirmArchive(sessionIds, {
      archiveReason: finalReason,
      retentionMonths,
      retentionExpiryDate: calculatedRetentionExpiry,
      archivedBy: auditorName
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>{isBulk ? `Archive ${meetingsToArchive.length} Completed Sessions` : 'Move Session to Audit Archive'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-700/50 text-amber-300 font-bold uppercase">
                  ISO 19011 Vault
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Declutters active dashboard while maintaining 100% cryptographic audit readiness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Target Meeting(s) Summary Card */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isBulk ? 'Sessions to be Sealed & Archived:' : 'Target Meeting Record:'}
            </span>

            {isBulk ? (
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {meetingsToArchive.map(m => (
                  <div key={m.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-mono text-sky-400 font-bold">{m.meetingCode}</span>
                      <span className="text-white truncate max-w-xs">{m.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold shrink-0">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
                    {primarySession.meetingCode}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    {primarySession.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {primarySession.scheduledDate}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{primarySession.title}</h4>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-1">
                  <span>Stakeholder: <strong className="text-slate-200">{primarySession.stakeholder.name}</strong></span>
                  <span>Dept: <strong className="text-slate-200">{primarySession.department}</strong></span>
                  <span>Project: <strong className="text-indigo-300">{primarySession.projectName}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Audit Assurance Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-start space-x-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-indigo-200 block">Audit Working Papers Integrity Guarantee</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Archived records are strictly preserved for regulatory compliance (ISO 19011:2018 Cl. 6.6 & ISO 27001:2022 Cl. 7.5). All SHA-256 consent hashes, transcripts, AI summaries, and mapped controls remain fully immutable, searchable, and exportable to official PDF reports.
              </p>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-4">
            {/* Archive Classification */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Archive Reason / Milestone</span>
                <span className="text-[11px] text-slate-500 font-normal">Audit Trail Log</span>
              </label>
              <select
                value={selectedReason}
                onChange={e => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {ARCHIVE_REASONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Custom Archive Notes (Optional)</span>
                <span className="text-[11px] text-slate-500 font-normal">Included in working paper</span>
              </label>
              <input
                type="text"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="e.g., Reviewed by Lead Auditor Sarah Chen for Stage 1 submission"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            {/* Retention Period & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Retention Period</span>
                </label>
                <select
                  value={retentionMonths}
                  onChange={e => setRetentionMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years - Standard ISO)</option>
                  <option value={60}>60 Months (5 Years - Enterprise)</option>
                  <option value={84}>84 Months (7 Years - Financial/MAS)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Calculated Expiry Date</span>
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs font-bold flex items-center justify-between">
                  <span>{calculatedRetentionExpiry}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Active Retention</span>
                </div>
              </div>
            </div>

            {/* Auditor Attestation Signature */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Auditor Attestation & Archiving Signer</span>
              </label>
              <input
                type="text"
                value={auditorName}
                onChange={e => setAuditorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95"
          >
            <Archive className="w-4 h-4" />
            <span>{isBulk ? `Archive All ${meetingsToArchive.length} Sessions` : 'Confirm & Move to Audit Archive'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
