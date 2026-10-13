import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  X,
  ShieldAlert,
  Clock,
  User,
  Building2,
  Check,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { StakeholderRole } from '../../types/meetingScheduler';
import { DocumentationItem } from '../../data/rolePreparationData';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface RequestEvidenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: StakeholderRole;
  roleTitle: string;
  stakeholderName?: string;
  departmentName?: string;
  evidenceItems: DocumentationItem[];
  preSelectedDocIds?: string[];
  onRequestDispatched: (
    requestedDocIds: string[],
    details: {
      assignedTo: string;
      department: string;
      dueDate: string;
      slaHours: number;
      referenceCode: string;
      notes: string;
    }
  ) => void;
}

export const RequestEvidenceDialog: React.FC<RequestEvidenceDialogProps> = ({
  isOpen,
  onClose,
  role,
  roleTitle,
  stakeholderName,
  departmentName,
  evidenceItems,
  preSelectedDocIds,
  onRequestDispatched
}) => {
  const { addTask } = useGRC();
  const { showToast } = useToast();

  const [recipientName, setRecipientName] = useState<string>(stakeholderName || roleTitle);
  const [recipientDepartment, setRecipientDepartment] = useState<string>(
    departmentName || 'Enterprise Scope'
  );
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [slaOption, setSlaOption] = useState<'48h' | '24h' | '72h' | 'custom'>('48h');
  const [customDueDate, setCustomDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync recipient state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setRecipientName(stakeholderName || roleTitle);
      setRecipientDepartment(departmentName || 'Enterprise Scope');

      if (preSelectedDocIds && preSelectedDocIds.length > 0) {
        setSelectedDocIds(preSelectedDocIds);
      } else {
        // Default to all missing items or all items
        const missingIds = evidenceItems
          .filter(item => item.defaultMissingInSkanda || item.priority === 'Critical / Blocker')
          .map(item => item.id);
        setSelectedDocIds(missingIds.length > 0 ? missingIds : evidenceItems.map(i => i.id));
      }

      setCustomNotes(
        `Dear ${stakeholderName || roleTitle},\n\nPlease upload the requested mandatory audit evidence documentation to the Skanda Compliance Vault. These artifacts are required by external certification auditors to verify operating effectiveness for the upcoming ISO interview.`
      );
    }
  }, [isOpen, stakeholderName, roleTitle, departmentName, evidenceItems, preSelectedDocIds]);

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === evidenceItems.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(evidenceItems.map(d => d.id));
    }
  };

  const calculatedDueDate = useMemo(() => {
    const now = new Date();
    if (slaOption === '24h') {
      now.setDate(now.getDate() + 1);
      return now.toISOString().split('T')[0];
    }
    if (slaOption === '48h') {
      now.setDate(now.getDate() + 2);
      return now.toISOString().split('T')[0];
    }
    if (slaOption === '72h') {
      now.setDate(now.getDate() + 3);
      return now.toISOString().split('T')[0];
    }
    return customDueDate;
  }, [slaOption, customDueDate]);

  const slaHours = useMemo(() => {
    if (slaOption === '24h') return 24;
    if (slaOption === '48h') return 48;
    if (slaOption === '72h') return 72;
    return 48;
  }, [slaOption]);

  const handleDispatch = () => {
    if (selectedDocIds.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Documents Selected',
        message: 'Please select at least one evidence artifact to request.'
      });
      return;
    }

    setIsSubmitting(true);

    const referenceCode = `REQ-EV-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Create GRC tasks for each requested artifact
      selectedDocIds.forEach(docId => {
        const item = evidenceItems.find(d => d.id === docId);
        if (item) {
          addTask({
            title: `[Evidence Request] ${item.name} (${roleTitle})`,
            description: `Mandatory evidence requested by Skanda Audit Scheduler.\nClause Mapping: ${item.mandatoryFor.join(', ')}\nFile Format: ${item.suggestedFileFormat}\nSLA Deadline: ${calculatedDueDate} (${slaHours}h SLA)\nTracking Ref: ${referenceCode}\nInstructions: ${customNotes}`,
            category: 'Evidence Collection',
            priority: item.priority === 'Critical / Blocker' ? 'High' : 'Medium',
            status: 'To Do',
            assignedTo: recipientName,
            department: recipientDepartment,
            dueDate: calculatedDueDate,
            linkedControl: item.mandatoryFor[0] || 'Clause 6.4'
          });
        }
      });

      // Dispatch callback
      onRequestDispatched(selectedDocIds, {
        assignedTo: recipientName,
        department: recipientDepartment,
        dueDate: calculatedDueDate,
        slaHours,
        referenceCode,
        notes: customNotes
      });

      showToast({
        type: 'success',
        title: 'Evidence Request Dispatched',
        message: `Dispatched request for ${selectedDocIds.length} mandatory artifact(s) to ${recipientName}. Ref: ${referenceCode}`
      });

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      showToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: 'Unable to create evidence collection tasks. Please retry.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="request-evidence-modal-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="request-evidence-modal-container"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700/70 flex items-center justify-center text-rose-400 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  Request Mandatory Audit Evidence
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-rose-300 font-bold">
                  Skanda Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Assign formal collection tasks to the stakeholder with ISO compliance SLA tracking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* STAKEHOLDER RECIPIENT CARD */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Designated Stakeholder Recipient</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                {roleTitle}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Stakeholder Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Department / Scope
                </label>
                <input
                  type="text"
                  value={recipientDepartment}
                  onChange={e => setRecipientDepartment(e.target.value)}
                  placeholder="e.g. Engineering & DevOps"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* ARTIFACTS SELECTION LIST */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Evidence Artifacts to Request ({selectedDocIds.length}/{evidenceItems.length})
                </h4>
              </div>

              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                {selectedDocIds.length === evidenceItems.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {evidenceItems.map(doc => {
                const isSelected = selectedDocIds.includes(doc.id);
                const isMissing = doc.defaultMissingInSkanda;

                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleSelectDoc(doc.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-3 select-none ${
                      isSelected
                        ? 'bg-rose-950/30 border-rose-800/80 text-white'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded bg-rose-600 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-slate-600 bg-slate-900" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white leading-tight">
                          {doc.name}
                        </span>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {isMissing && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              DEFICIT
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              doc.priority === 'Critical / Blocker'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                : 'bg-amber-950/80 text-amber-300 border-amber-800'
                            }`}
                          >
                            {doc.priority}
                          </span>
                        </div>
                      </div>

                      {doc.skandaDetectionReason && (
                        <p className="text-[11px] text-rose-300/90 leading-relaxed font-mono bg-rose-950/40 p-1.5 rounded border border-rose-900/60">
                          ⚠ Skanda Telemetry: {doc.skandaDetectionReason}
                        </p>
                      )}

                      <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 flex-wrap">
                        <span>Format: <strong className="text-slate-300">{doc.suggestedFileFormat}</strong></span>
                        <span>•</span>
                        <span>Clause: <strong className="text-sky-300">{doc.mandatoryFor[0]}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLA & DEADLINE SELECTION */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Evidence Fulfillment SLA & Target Deadline</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                Due: {calculatedDueDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSlaOption('48h')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                  slaOption === '48h'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">48 Hours</div>
                <div className="text-[10px] opacity-80">Pre-Audit SLA</div>
              </button>

              <button
                type="button"
                onClick={() => setSlaOption('24h')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                  slaOption === '24h'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">24 Hours</div>
                <div className="text-[10px] opacity-80">Urgent Escalation</div>
              </button>

              <button
                type="button"
                onClick={() => setSlaOption('72h')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                  slaOption === '72h'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">72 Hours</div>
                <div className="text-[10px] opacity-80">Standard Queue</div>
              </button>

              <button
                type="button"
                onClick={() => setSlaOption('custom')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                  slaOption === 'custom'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">Custom</div>
                <div className="text-[10px] opacity-80">Manual Date</div>
              </button>
            </div>

            {slaOption === 'custom' && (
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Select Custom Due Date
                </label>
                <input
                  type="date"
                  value={customDueDate}
                  onChange={e => setCustomDueDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* AUDITOR INSTRUCTION NOTES */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Auditor Notice & Submission Guidance
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Provide specific directions on file formats, encryption standards, or target systems..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Dispatches formal notification and registers tasks in the central GRC worklist.
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDispatch}
              disabled={isSubmitting || selectedDocIds.length === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-rose-950/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Dispatching Request...'
                  : `Dispatch Request (${selectedDocIds.length} Item${selectedDocIds.length === 1 ? '' : 's'})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
