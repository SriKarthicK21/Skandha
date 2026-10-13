import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Shield,
  FileText,
  Paperclip,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Keyboard,
  Clock,
  Sparkles,
  Save
} from 'lucide-react';
import { ControlItem } from '../../types';
import { useToast } from '../common/ToastContainer';

export interface SpeedReviewControlItem {
  id: string;
  controlCode: string;
  title: string;
  category: string;
  description: string;
  guidance?: string;
  applicable: boolean;
  justification?: string;
  implementationStatus: string;
  responsibleDepartment?: string;
  evidenceRequirements?: string[];
  acceptanceCriteria?: string;
  collectionFrequency?: string;
  framework?: string;
}

interface AuditorSpeedReviewDockProps {
  isOpen: boolean;
  onClose: () => void;
  controls: (ControlItem | SpeedReviewControlItem)[];
  currentControlIndex: number;
  onSelectControlIndex: (index: number) => void;
  onUpdateControl: (controlId: string, updates: Partial<SpeedReviewControlItem>) => void;
  theme?: string;
  isPims?: boolean;
}

export const AuditorSpeedReviewDock: React.FC<AuditorSpeedReviewDockProps> = ({
  isOpen,
  onClose,
  controls,
  currentControlIndex,
  onSelectControlIndex,
  onUpdateControl,
  theme = 'dark',
  isPims = false
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'EVIDENCE' | 'SOA'>('DETAILS');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [justification, setJustification] = useState<string>('');
  const [auditorNotes, setAuditorNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const currentControl = controls[currentControlIndex];

  // Sync state whenever currentControl changes
  useEffect(() => {
    if (currentControl) {
      setJustification(currentControl.justification || '');
      setAuditorNotes((currentControl as any).auditorNotes || '');
      setIsSaved(false);
    }
  }, [currentControl?.id, currentControl?.controlCode]);

  // Handle Global Keyboard Shortcuts for Speed Review
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in a textarea or input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentControlIndex < controls.length - 1) {
          onSelectControlIndex(currentControlIndex + 1);
        }
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentControlIndex > 0) {
          onSelectControlIndex(currentControlIndex - 1);
        }
      } else if (e.key === '1') {
        e.preventDefault();
        handleSetStatus('Implemented');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSetStatus(isPims ? 'Partially Implemented' : 'In Progress');
      } else if (e.key === '3') {
        e.preventDefault();
        handleSetStatus('Not Applicable');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setActiveTab(prev => (prev === 'EVIDENCE' ? 'DETAILS' : 'EVIDENCE'));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentControlIndex, controls.length, currentControl, isPims]);

  if (!isOpen || !currentControl) return null;

  const handleSetStatus = (newStatus: string) => {
    if (!currentControl) return;
    const isNA = newStatus === 'Not Applicable';
    onUpdateControl(currentControl.id, {
      implementationStatus: newStatus,
      applicable: !isNA
    });
    setIsSaved(true);
    showToast({
      title: `${currentControl.controlCode}: ${newStatus}`,
      message: 'Status updated via speed keyboard shortcut.',
      type: 'success'
    });
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveJustification = () => {
    if (!currentControl) return;
    onUpdateControl(currentControl.id, {
      justification,
      applicable: currentControl.implementationStatus !== 'Not Applicable'
    });
    setIsSaved(true);
    showToast({
      title: 'Justification Saved',
      message: `Updated Statement of Applicability for ${currentControl.controlCode}`,
      type: 'success'
    });
    setTimeout(() => setIsSaved(false), 2000);
  };

  const progressPercent = Math.round(((currentControlIndex + 1) / controls.length) * 100);

  return (
    <aside
      id="auditor-speed-review-dock"
      aria-label="Auditor speed review panel"
      className={`fixed right-0 top-14 bottom-0 z-30 border-l shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300 ${
        isExpanded ? 'w-full md:w-[680px]' : 'w-full md:w-[460px] lg:w-[500px]'
      } ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
          : 'bg-[#0B0F19]/95 border-slate-800 text-white shadow-black/80'
      }`}
    >
      {/* Keyboard Shortcuts HUD Bar */}
      <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono select-none ${
        theme === 'light' ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-slate-950/90 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center space-x-2">
          <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">SPEED-REVIEW:</span>
          <span className="hidden sm:inline text-slate-400">
            [<strong className="text-white">J/K</strong>] Nav • [<strong className="text-white">1</strong>] Impl • [<strong className="text-white">2</strong>] In Prog • [<strong className="text-white">3</strong>] N/A • [<strong className="text-white">E</strong>] Evidence
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Collapse Dock' : 'Expand Dock'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Dock (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Title & Stepper Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold">
              {currentControl.controlCode}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {currentControl.category}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono text-slate-400">
              {currentControlIndex + 1} of {controls.length} ({progressPercent}%)
            </span>
            <div className="flex items-center space-x-0.5">
              <button
                disabled={currentControlIndex === 0}
                onClick={() => onSelectControlIndex(currentControlIndex - 1)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                title="Previous Control (K or Up)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentControlIndex === controls.length - 1}
                onClick={() => onSelectControlIndex(currentControlIndex + 1)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition cursor-pointer"
                title="Next Control (J or Down)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold leading-snug">
          {currentControl.title}
        </h3>

        {/* Status Pills Quick Setter */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleSetStatus('Implemented')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
              currentControl.implementationStatus === 'Implemented'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/50'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Implemented [1]</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetStatus(isPims ? 'Partially Implemented' : 'In Progress')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
              currentControl.implementationStatus === 'In Progress' || currentControl.implementationStatus === 'Partially Implemented'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/50'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>In Progress [2]</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetStatus('Not Applicable')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
              currentControl.implementationStatus === 'Not Applicable'
                ? 'bg-slate-700/60 text-slate-200 border-slate-600 ring-1 ring-slate-500/50'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>N/A [3]</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('DETAILS')}
          className={`py-2.5 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'DETAILS'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Requirement & Guidance
        </button>
        <button
          onClick={() => setActiveTab('EVIDENCE')}
          className={`py-2.5 px-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'EVIDENCE'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Evidence Checklist</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {currentControl.evidenceRequirements?.length || 1}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('SOA')}
          className={`py-2.5 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'SOA'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          SoA Justification
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === 'DETAILS' && (
          <div className="space-y-4">
            {/* Description */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Control Specification
              </span>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {currentControl.description}
              </p>
            </div>

            {/* Implementation Guidance */}
            {currentControl.guidance && (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>ISO 27002 / PIMS Auditor Guidance</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {currentControl.guidance}
                </p>
              </div>
            )}

            {/* Department & Acceptance Criteria */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
              <div>
                <span className="text-[10px] text-slate-400 block">Assigned Department</span>
                <span className="font-semibold text-slate-200">{currentControl.responsibleDepartment}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Collection Frequency</span>
                <span className="font-semibold text-slate-200">{currentControl.collectionFrequency || 'Quarterly'}</span>
              </div>
            </div>

            {/* Acceptance Criteria */}
            {currentControl.acceptanceCriteria && (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-400 block">Auditor Acceptance Criteria</span>
                <p className="text-slate-300 text-xs">{currentControl.acceptanceCriteria}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'EVIDENCE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Required Audit Artifacts
              </span>
              <span className="text-[10px] font-mono text-emerald-400">SLA: Fresh</span>
            </div>

            {currentControl.evidenceRequirements && currentControl.evidenceRequirements.length > 0 ? (
              currentControl.evidenceRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start space-x-2.5 hover:border-slate-700 transition"
                >
                  <Paperclip className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-200">{req}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                      <span>Status: Attached & Signed</span>
                      <span>•</span>
                      <span className="text-emerald-400">Valid for 2026 Audit</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 text-center text-slate-400">
                Standard operating procedure and management sign-off required.
              </div>
            )}
          </div>
        )}

        {activeTab === 'SOA' && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Statement of Applicability (SoA) Justification
              </label>
              <textarea
                rows={4}
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Detail the operational rationale, risk treatment reference, or justification for exclusion..."
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                  theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveJustification}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved' : 'Save Justification'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dock Footer Navigation */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          disabled={currentControlIndex === 0}
          onClick={() => onSelectControlIndex(currentControlIndex - 1)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous [K]</span>
        </button>

        <button
          disabled={currentControlIndex === controls.length - 1}
          onClick={() => onSelectControlIndex(currentControlIndex + 1)}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-md shadow-indigo-900/40"
        >
          <span>Next Control [J]</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
