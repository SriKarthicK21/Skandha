import React, { useState } from 'react';
import { 
  FileSearch, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  PlusCircle, 
  Send,
  Lock,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react';
import { FrameworkLibrary } from '../../services/grc/FrameworkLibrary';
import { UnifiedControlLibrary } from '../../services/grc/UnifiedControlLibrary';
import { SmartEvidenceEngine } from '../../services/grc/SmartEvidenceEngine';
import { AuditRemediationEngine } from '../../services/grc/AuditRemediationEngine';
import { FrameworkRequirement, UnifiedControl, SmartEvidenceItem } from '../../types/grcCoreTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumInput } from '../ui/premium/PremiumInput';

interface AuditorCleanRoomProps {
  onOpen360Drawer?: (entityId: string, entityType: string) => void;
}

export const AuditorCleanRoom: React.FC<AuditorCleanRoomProps> = ({ onOpen360Drawer }) => {
  const reqs = FrameworkLibrary.getRequirementsForFramework('ISO_27001_2022');
  const [selectedReqCode, setSelectedReqCode] = useState<string>(reqs[0]?.code || 'A.5.15');
  const [observationText, setObservationText] = useState('');
  const [auditDecision, setAuditDecision] = useState<'CONFORMING' | 'NON_CONFORMING' | 'OBSERVATION'>('CONFORMING');

  const activeAudit = AuditRemediationEngine.getAllAudits()[0];
  const selectedReq = reqs.find(r => r.code === selectedReqCode);
  const mappedControls: UnifiedControl[] = selectedReq 
    ? UnifiedControlLibrary.getControlsForRequirement(selectedReq.code) 
    : [];

  const evidenceItems: SmartEvidenceItem[] = mappedControls.flatMap(c => 
    SmartEvidenceEngine.getEvidenceForControl(c.id)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                <FileSearch className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Auditor Clean Room & Inspection Workspace</h2>
              <PremiumBadge variant="info" pulse>Auditor Independence Active</PremiumBadge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal">
              Precision 2-pane audit testing workbench for external and internal auditors. Inspect requirements, evaluate controls, verify cryptographic evidence, and record findings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Active Engagement</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{activeAudit?.auditCode} • {activeAudit?.auditFirm}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Pane Clean Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* LEFT PANE: Requirements & Control Checklist (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Audit Requirements Scope ({reqs.length})
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">80/82 Sampled Passed</span>
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {reqs.map((req) => {
              const isSelected = selectedReqCode === req.code;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReqCode(req.code)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-slate-800 border-blue-500 dark:border-cyan-500 shadow-sm ring-1 ring-blue-500/20 dark:ring-cyan-500/20'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">{req.code}</span>
                    <PremiumBadge variant="neutral">Mandatory</PremiumBadge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{req.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{req.statement}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Evidence Inspector & Audit Finding Recorder (7 Cols) */}
        <div className="lg:col-span-7">
          <PremiumCard elevation={1} className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="p-6 space-y-6">
              {/* Selected Requirement Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">{selectedReq?.code}</span>
                  {onOpen360Drawer && (
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      onClick={() => onOpen360Drawer(selectedReq?.id || selectedReqCode, 'REQUIREMENT')}
                      iconRight={ExternalLink}
                    >
                      360° Relational View
                    </PremiumButton>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedReq?.title}</h3>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mt-3 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-blue-700 dark:text-cyan-400 font-semibold">Auditor Evaluation Guidance:</strong> {selectedReq?.auditGuidance}
                </div>
              </div>

              {/* Mapped Unified Controls */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Implemented Controls Under Test ({mappedControls.length})
                </h4>
                <div className="space-y-2">
                  {mappedControls.map(ctrl => (
                    <div key={ctrl.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{ctrl.code}</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{ctrl.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ctrl.owner} • Tested {ctrl.frequency}</p>
                      </div>
                      <PremiumBadge variant="success">✓ {ctrl.operatingEffectiveness}</PremiumBadge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Cryptographic Evidence */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Supporting Cryptographic Evidence ({evidenceItems.length})
                </h4>
                <div className="space-y-2">
                  {evidenceItems.map(ev => (
                    <div key={ev.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium text-slate-900 dark:text-slate-200">{ev.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                          {ev.evidenceCode}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        SHA-256: {ev.sha256Hash}
                      </div>
                    </div>
                  ))}
                  {evidenceItems.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      No evidence artifacts currently attached to this requirement checkpoint.
                    </div>
                  )}
                </div>
              </div>

              {/* Auditor Assessment Form */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Record Audit Determination & Observations
                </h4>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuditDecision('CONFORMING')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      auditDecision === 'CONFORMING'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    ✓ Conforming
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditDecision('OBSERVATION')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      auditDecision === 'OBSERVATION'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    ⚠ Observation
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditDecision('NON_CONFORMING')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      auditDecision === 'NON_CONFORMING'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    ✗ Non-Conformity
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                  placeholder="Enter auditor workpaper notes, sample details, and testing conclusions..."
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <PremiumButton size="sm" variant="secondary">
                    Attach Workpaper Note
                  </PremiumButton>
                  {auditDecision === 'NON_CONFORMING' && (
                    <PremiumButton size="sm" variant="danger">
                      Raise Formal Finding & CAPA
                    </PremiumButton>
                  )}
                  {auditDecision === 'CONFORMING' && (
                    <PremiumButton size="sm" variant="success">
                      Sign Off Checkpoint
                    </PremiumButton>
                  )}
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default AuditorCleanRoom;
