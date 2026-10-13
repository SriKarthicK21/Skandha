import React, { useState } from 'react';
import {
  DPDPDpiaRecord,
  INITIAL_DPDP_DPIA_RECORDS,
  DPDPDpiaComment,
  DPDPDpiaCommentStatus
} from '../../data/dpdpMasterData';
import { DPDPDpiaCommentSection } from './DPDPDpiaCommentSection';
import { useToast } from '../common/ToastContainer';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  UserCheck,
  MessageSquare
} from 'lucide-react';

export const DPDPDpiaWorkbench: React.FC = () => {
  const { showToast } = useToast();
  const [dpias, setDpias] = useState<DPDPDpiaRecord[]>(INITIAL_DPDP_DPIA_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('dpia_1');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Software Engineering & DevOps');
  const [newProcessingActivity, setNewProcessingActivity] = useState('');
  const [newVolume, setNewVolume] = useState<DPDPDpiaRecord['volumeOfDataPrincipals']>('Medium (10k-500k)');
  const [newInvolvesChildren, setNewInvolvesChildren] = useState(false);
  const [newSensitivities, setNewSensitivities] = useState('Biometrics, Financial Transactions');
  const [newNecessity, setNewNecessity] = useState('');
  const [newRiskDesc, setNewRiskDesc] = useState('');
  const [newSafeguard, setNewSafeguard] = useState('');

  const filteredDpias = dpias.filter(
    d =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.assessmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.processingActivity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCommentToDpia = (dpiaId: string, comment: DPDPDpiaComment) => {
    setDpias(prev =>
      prev.map(d => {
        if (d.id === dpiaId) {
          return {
            ...d,
            comments: [comment, ...(d.comments || [])]
          };
        }
        return d;
      })
    );
  };

  const handleUpdateCommentStatus = (
    dpiaId: string,
    commentId: string,
    newStatus: DPDPDpiaCommentStatus,
    resolutionNote?: string,
    resolvedBy?: string
  ) => {
    setDpias(prev =>
      prev.map(d => {
        if (d.id === dpiaId) {
          return {
            ...d,
            comments: (d.comments || []).map(c => {
              if (c.id === commentId) {
                return {
                  ...c,
                  status: newStatus,
                  resolutionNote,
                  resolvedBy: resolvedBy || 'Elena Rostova (Chief DPO)',
                  resolvedAt: new Date().toISOString()
                };
              }
              return c;
            })
          };
        }
        return d;
      })
    );
  };

  const handleCreateDpia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProcessingActivity) return;

    const newRecord: DPDPDpiaRecord = {
      id: `dpia_${Date.now()}`,
      assessmentCode: `DPIA-2026-0${dpias.length + 1}`,
      title: newTitle,
      department: newDepartment,
      processingActivity: newProcessingActivity,
      volumeOfDataPrincipals: newVolume,
      involvesChildrenData: newInvolvesChildren,
      involvesSpecialSensitivities: newSensitivities.split(',').map(s => s.trim()),
      necessityAndProportionalityEvaluation: newNecessity || 'Evaluation confirms processing is essential for service fulfillment with proportionality safeguards.',
      identifiedRisks: [
        {
          riskDescription: newRiskDesc || 'Potential unauthorized access or retention creep.',
          impactOnDataPrincipal: 'High',
          likelihood: 'Possible',
          safeguards: newSafeguard || 'AES-256 KMS encryption and automated 90-day retention purge.',
          residualRiskLevel: 'Low'
        }
      ],
      isSignificantDataFiduciaryTriggered: true,
      independentDataAuditorEngaged: true,
      dpoApprovalStatus: 'APPROVED',
      dpoNotes: 'Approved by DPO subject to annual third-party independent data audit.',
      assessmentDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      comments: []
    };

    setDpias([newRecord, ...dpias]);
    setShowCreateModal(false);
    setExpandedId(newRecord.id);

    showToast({
      title: 'DPDP DPIA Created',
      description: `Logged assessment ${newRecord.assessmentCode} under Section 10(2)(c).`,
      type: 'success'
    });
  };

  const exportDpiaReport = (dpia: DPDPDpiaRecord) => {
    const json = JSON.stringify(dpia, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DPDP_DPIA_${dpia.assessmentCode}_${dpia.assessmentDate}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      title: 'DPIA Exported',
      description: `Downloaded statutory DPIA assessment file for ${dpia.assessmentCode}.`,
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Section 10(2)(c) Mandate
              </span>
              <span className="text-xs text-slate-400">Significant Data Fiduciary (SDF) Governance</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Data Protection Impact Assessment (DPIA) Workbench</span>
              <Cpu className="w-5 h-5 text-purple-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Conduct formal risk assessments on digital processing activities, algorithmic scoring, biometric verification, and minor data handling to ensure necessity, proportionality, and residual risk minimization.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shrink-0 shadow-lg shadow-purple-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Conduct New DPDP DPIA</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search DPIA assessments by code, title, department, or activity..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* DPIA Cards */}
      <div className="space-y-4">
        {filteredDpias.map(dpia => {
          const isExpanded = expandedId === dpia.id;
          const statusBg =
            dpia.dpoApprovalStatus === 'APPROVED'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : dpia.dpoApprovalStatus === 'CONDITIONAL_APPROVAL'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30';

          return (
            <div
              key={dpia.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : dpia.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start space-x-3">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 font-mono text-xs font-bold text-purple-400 border border-slate-800 shrink-0">
                    {dpia.assessmentCode}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-base font-bold text-white">{dpia.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {dpia.department}
                      </span>
                      {dpia.isSignificantDataFiduciaryTriggered && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          SDF Mandatory
                        </span>
                      )}
                      {(dpia.comments?.length ?? 0) > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{dpia.comments?.length} Dept Notes</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 border border-slate-800 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>0 Dept Notes</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{dpia.processingActivity}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusBg}`}>
                    DPO: {dpia.dpoApprovalStatus.replace(/_/g, ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      exportDpiaReport(dpia);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Export DPIA Dossier JSON"
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Card Body */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Data Principal Volume</div>
                      <div className="text-sm font-bold text-white mt-0.5 font-mono">{dpia.volumeOfDataPrincipals}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Children Data Handled</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {dpia.involvesChildrenData ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> YES (Verifiable Parental Consent)
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> NO (Adults Only)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Assessment & Next Review</div>
                      <div className="text-xs text-slate-300 mt-0.5 font-mono">
                        {dpia.assessmentDate} &rarr; {dpia.nextReviewDate}
                      </div>
                    </div>
                  </div>

                  {/* Sensitivities */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Identified High-Sensitivity Data Elements
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dpia.involvesSpecialSensitivities.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-[11px] bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Necessity & Proportionality */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Necessity & Proportionality Evaluation
                    </div>
                    <p className="text-slate-300 leading-relaxed">{dpia.necessityAndProportionalityEvaluation}</p>
                  </div>

                  {/* Risk & Mitigations Table */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Identified Privacy Risks to Data Principals & Technical Safeguards
                    </div>
                    <div className="space-y-2">
                      {dpia.identifiedRisks.map((risk, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">{risk.riskDescription}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                risk.residualRiskLevel === 'Low'
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : 'bg-amber-500/10 text-amber-300'
                              }`}
                            >
                              Residual Risk: {risk.residualRiskLevel}
                            </span>
                          </div>
                          <div className="text-slate-300 text-[11px] flex items-start space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Safeguards Deployed:</strong> {risk.safeguards}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DPO Review Notes */}
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start space-x-2">
                    <UserCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-purple-300">Data Protection Officer (DPO) Formal Attestation: </span>
                      <span className="text-slate-300 text-xs">{dpia.dpoNotes}</span>
                    </div>
                  </div>

                  {/* Department Collaboration & Audit-Trailed Notes */}
                  <DPDPDpiaCommentSection
                    dpiaId={dpia.id}
                    assessmentCode={dpia.assessmentCode}
                    assessmentTitle={dpia.title}
                    comments={dpia.comments || []}
                    onAddComment={newComment => handleAddCommentToDpia(dpia.id, newComment)}
                    onUpdateCommentStatus={(commentId, newStatus, resNote, resBy) =>
                      handleUpdateCommentStatus(dpia.id, commentId, newStatus, resNote, resBy)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE DPIA MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Conduct New DPDP DPIA (Section 10)</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDpia} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. LLM Customer Chatbot Vector Processing Pipeline"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Volume of Data Principals</label>
                  <select
                    value={newVolume}
                    onChange={e => setNewVolume(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="Low (<10k)">Low (&lt;10k)</option>
                    <option value="Medium (10k-500k)">Medium (10k-500k)</option>
                    <option value="High (>500k)">High (&gt;500k)</option>
                    <option value="Massive (>10M)">Massive (&gt;10M)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description of Digital Processing Activity</label>
                <textarea
                  rows={2}
                  required
                  value={newProcessingActivity}
                  onChange={e => setNewProcessingActivity(e.target.value)}
                  placeholder="Describe data flows, algorithms, cloud storage, and automated decisions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Special Sensitive Data Categories (comma-separated)</label>
                <input
                  type="text"
                  value={newSensitivities}
                  onChange={e => setNewSensitivities(e.target.value)}
                  placeholder="e.g. Biometrics, Financial Transactions, Aadhaar Token, Geolocation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newInvolvesChildren}
                  onChange={e => setNewInvolvesChildren(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600"
                />
                <span className="font-semibold text-purple-300">
                  Processes Personal Data of Children (&lt;18 Years)
                </span>
              </label>

              <div>
                <label className="block text-slate-400 mb-1">Necessity & Proportionality Evaluation</label>
                <textarea
                  rows={2}
                  value={newNecessity}
                  onChange={e => setNewNecessity(e.target.value)}
                  placeholder="Justify why processing is necessary and cannot be achieved with less intrusive means..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Key Identified Risk</label>
                  <input
                    type="text"
                    value={newRiskDesc}
                    onChange={e => setNewRiskDesc(e.target.value)}
                    placeholder="e.g. Algorithmic bias in credit decisioning"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mitigating Safeguard</label>
                  <input
                    type="text"
                    value={newSafeguard}
                    onChange={e => setNewSafeguard(e.target.value)}
                    placeholder="e.g. Human-in-the-loop manual review"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save & Attest DPIA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
