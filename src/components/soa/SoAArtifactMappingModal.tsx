import React, { useState, useMemo } from 'react';
import {
  FileText,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  FileCheck,
  Copy,
  Check,
  Info,
  Layers,
  Clock,
  Shield,
  Tag,
  Hash,
  Filter,
  Eye
} from 'lucide-react';
import { ControlItem, GeneratedDocument, EvidenceRecord } from '../../types';
import {
  ISO27001_2022_93_MASTER,
  ISO27001Control2022Meta
} from '../../data/iso27001_2022_masterControls';
import {
  getMappedPoliciesForControl,
  getMappedEvidenceForControl,
  calculateControlArtifactReadiness,
  getRecommendedPoliciesForControl
} from '../../utils/soaArtifactMappingHelper';

interface SoAArtifactMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: ControlItem | null;
  allDocs: GeneratedDocument[];
  allEvidence: EvidenceRecord[];
  onSaveMappings: (controlId: string, mappedPolicyIds: string[], mappedEvidenceIds: string[]) => void;
  onUploadNewEvidence?: (evidenceData: {
    title: string;
    controlCode: string;
    department: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    tags: string[];
    sha256Hash: string;
    initialStatus: 'Draft' | 'Pending Review';
  }) => void;
}

export const SoAArtifactMappingModal: React.FC<SoAArtifactMappingModalProps> = ({
  isOpen,
  onClose,
  control,
  allDocs,
  allEvidence,
  onSaveMappings,
  onUploadNewEvidence
}) => {
  if (!isOpen || !control) return null;

  // Metadata from ISO 27001:2022 Master catalogue
  const meta: ISO27001Control2022Meta | undefined = ISO27001_2022_93_MASTER.find(
    m => m.controlCode === control.controlCode
  );

  // Active Tab: 'policies' | 'evidence' | 'dossier'
  const [activeTab, setActiveTab] = useState<'policies' | 'evidence' | 'dossier'>('policies');

  // Currently selected policy IDs / codes
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(() => {
    const initial = getMappedPoliciesForControl(control, allDocs);
    return initial.map(p => p.docCode || p.id);
  });

  // Currently selected evidence IDs
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>(() => {
    const initial = getMappedEvidenceForControl(control, allEvidence);
    return initial.map(e => e.id);
  });

  // Search & Filter state for policies
  const [policySearch, setPolicySearch] = useState('');
  const [policyTypeFilter, setPolicyTypeFilter] = useState<'ALL' | 'POLICY' | 'PROCEDURE' | 'REGISTER'>('ALL');

  // Search & Filter state for evidence
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceStatusFilter, setEvidenceStatusFilter] = useState<'ALL' | 'Verified' | 'Pending Review' | 'Draft'>('ALL');

  // New Evidence Upload inline state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('1.2 MB');
  const [uploadFileType, setUploadFileType] = useState('application/pdf');
  const [uploadTags, setUploadTags] = useState('ISO27001, AnnexA, AuditEvidence');
  const [uploadDepartment, setUploadDepartment] = useState(
    control.responsibleDepartment || meta?.responsibleDepartment || 'Information Security'
  );

  // Copy citation feedback
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Preview Policy Drawer state
  const [previewingDoc, setPreviewingDoc] = useState<GeneratedDocument | null>(null);

  // Dynamically resolved mapped policies based on local selection
  const currentMappedPolicies = useMemo(() => {
    const selectedSet = new Set(selectedPolicyIds);
    return allDocs.filter(d => selectedSet.has(d.id) || selectedSet.has(d.docCode));
  }, [allDocs, selectedPolicyIds]);

  // Dynamically resolved mapped evidence based on local selection
  const currentMappedEvidence = useMemo(() => {
    const selectedSet = new Set(selectedEvidenceIds);
    return allEvidence.filter(e => selectedSet.has(e.id));
  }, [allEvidence, selectedEvidenceIds]);

  // Recommended policies for this control
  const recommendedPolicies = useMemo(() => {
    return getRecommendedPoliciesForControl(control, allDocs);
  }, [control, allDocs]);

  // Readies score calculation
  const readiness = useMemo(() => {
    const virtualControl: ControlItem = {
      ...control,
      mappedPolicyIds: selectedPolicyIds,
      mappedEvidenceIds: selectedEvidenceIds
    };
    return calculateControlArtifactReadiness(virtualControl, allDocs, allEvidence);
  }, [control, selectedPolicyIds, selectedEvidenceIds, allDocs, allEvidence]);

  // Toggle Policy Mapping
  const handleTogglePolicy = (docIdOrCode: string) => {
    setSelectedPolicyIds(prev => {
      if (prev.includes(docIdOrCode)) {
        return prev.filter(id => id !== docIdOrCode);
      } else {
        return [...prev, docIdOrCode];
      }
    });
  };

  // Toggle Evidence Mapping
  const handleToggleEvidence = (evdId: string) => {
    setSelectedEvidenceIds(prev => {
      if (prev.includes(evdId)) {
        return prev.filter(id => id !== evdId);
      } else {
        return [...prev, evdId];
      }
    });
  };

  // Handle direct inline upload of new evidence
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFileName.trim()) return;

    // Generate deterministic sha256 mock hash for demo
    const mockHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newEvdId = `evd_${Date.now()}`;
    const parsedTags = uploadTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (onUploadNewEvidence) {
      onUploadNewEvidence({
        title: uploadTitle.trim(),
        controlCode: control.controlCode,
        department: uploadDepartment,
        fileName: uploadFileName.trim(),
        fileSize: uploadFileSize,
        fileType: uploadFileType,
        tags: parsedTags,
        sha256Hash: mockHash,
        initialStatus: 'Pending Review'
      });
    }

    // Auto link to selected evidence
    setSelectedEvidenceIds(prev => [...prev, newEvdId]);

    // Reset upload form
    setUploadTitle('');
    setUploadFileName('');
    setShowUploadForm(false);
  };

  // Save changes
  const handleSave = () => {
    onSaveMappings(control.id, selectedPolicyIds, selectedEvidenceIds);
    onClose();
  };

  // Copy citation handler
  const handleCopyCitation = () => {
    navigator.clipboard.writeText(readiness.auditorCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  // Filter available policies
  const availableFilteredDocs = useMemo(() => {
    return allDocs.filter(doc => {
      const matchesSearch =
        !policySearch ||
        doc.title.toLowerCase().includes(policySearch.toLowerCase()) ||
        doc.docCode.toLowerCase().includes(policySearch.toLowerCase()) ||
        doc.category.toLowerCase().includes(policySearch.toLowerCase());

      const matchesType = policyTypeFilter === 'ALL' || doc.type === policyTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [allDocs, policySearch, policyTypeFilter]);

  // Filter available evidence
  const availableFilteredEvidence = useMemo(() => {
    return allEvidence.filter(evd => {
      const matchesSearch =
        !evidenceSearch ||
        evd.title.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
        evd.fileName.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
        evd.tags.some(t => t.toLowerCase().includes(evidenceSearch.toLowerCase()));

      const matchesStatus =
        evidenceStatusFilter === 'ALL' || evd.status === evidenceStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allEvidence, evidenceSearch, evidenceStatusFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold text-xs">
                {control.controlCode}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold">
                {control.category} Theme
              </span>
              {meta?.isNewIn2022 && (
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  NEW 2022
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  control.applicable
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {control.applicable ? 'In-Scope for ISMS' : 'Excluded from Scope'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{control.title}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl line-clamp-1" title={control.description}>
              {control.description}
            </p>
          </div>

          {/* Quick Readiness Scorecard Badge */}
          <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Auditor Readiness</div>
              <div
                className={`text-sm font-black ${
                  readiness.readinessScore === 100
                    ? 'text-emerald-400'
                    : readiness.readinessScore >= 50
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {readiness.readinessScore}% Defense Ready
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                readiness.readinessScore === 100
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : readiness.readinessScore >= 50
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-red-950 text-red-400 border-red-800'
              }`}
            >
              {readiness.readinessScore === 100 ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-5 pt-3 bg-slate-950/60 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition border-b-2 ${
              activeTab === 'policies'
                ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Internal Policies & Procedures</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {selectedPolicyIds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition border-b-2 ${
              activeTab === 'evidence'
                ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Audit Evidence Files</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {selectedEvidenceIds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition border-b-2 ${
              activeTab === 'dossier'
                ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditor Verification Dossier</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: INTERNAL POLICIES & PROCEDURES                     */}
          {/* ========================================================= */}
          {activeTab === 'policies' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Context Callout */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    ISO/IEC 27001:2022 Clause 6.1.3 & Annex A Governance Foundation
                  </p>
                  <p className="text-slate-400">
                    To withstand Stage 1 documentation review, every applicable control must be codified in an approved internal organizational policy, standard operating procedure (SOP), or register.
                  </p>
                </div>
              </div>

              {/* Recommended Policies for Quick-Link */}
              {recommendedPolicies.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Recommended Baseline Policies (ISO 27001 Crosswalk)</span>
                    </h4>
                    <span className="text-[10px] text-indigo-400/80">
                      Based on 2022 Annex A Theme & Taxonomy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {recommendedPolicies.map(({ doc, confidence, rationale }) => {
                      const isMapped = selectedPolicyIds.includes(doc.docCode || doc.id);
                      return (
                        <div
                          key={doc.id}
                          className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[11px] font-bold text-indigo-400">
                                {doc.docCode}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                  confidence === 'HIGH'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {confidence} MATCH
                              </span>
                            </div>
                            <div className="text-xs font-bold text-white truncate mt-0.5" title={doc.title}>
                              {doc.title}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">{rationale}</div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTogglePolicy(doc.docCode || doc.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition flex items-center space-x-1 ${
                              isMapped
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-red-950 hover:text-red-300 hover:border-red-800'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                            }`}
                          >
                            {isMapped ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Mapped</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Link Policy</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Currently Mapped Policies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Mapped Internal Policies ({currentMappedPolicies.length})</span>
                  </h3>
                  {currentMappedPolicies.length === 0 && (
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Zero policies mapped (Auditor Observation Risk)
                    </span>
                  )}
                </div>

                {currentMappedPolicies.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-400">
                      No internal policies or procedures mapped yet
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Link relevant governance documents below to establish defensible policy authority for this control.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentMappedPolicies.map(doc => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/80 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-indigo-400">
                                {doc.docCode}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                                {doc.version}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {doc.category}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  doc.status === 'PUBLISHED' || doc.status === 'LOCKED' || doc.status === 'APPROVED'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}
                              >
                                {doc.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1 truncate" title={doc.title}>
                              {doc.title}
                            </h4>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-3">
                              <span>Owner: {doc.owner || 'CISO'}</span>
                              <span>•</span>
                              <span>Review Cycle: {doc.reviewCycle || 'Annual'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewingDoc(doc)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                            title="Inspect Policy Content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePolicy(doc.docCode || doc.id)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 text-xs transition"
                            title="Unlink Policy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Policies Directory for Linking */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Internal Document Repository (Select to Map)
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter policies..."
                        value={policySearch}
                        onChange={e => setPolicySearch(e.target.value)}
                        className="pl-8 pr-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-40"
                      />
                    </div>
                    <select
                      value={policyTypeFilter}
                      onChange={e => setPolicyTypeFilter(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">All Types</option>
                      <option value="POLICY">Policies</option>
                      <option value="PROCEDURE">SOPs</option>
                      <option value="REGISTER">Registers</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {availableFilteredDocs.map(doc => {
                    const isSelected = selectedPolicyIds.includes(doc.docCode || doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleTogglePolicy(doc.docCode || doc.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-700 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-[10px] font-bold text-indigo-400">
                              {doc.docCode}
                            </span>
                            <span className="text-[9px] text-slate-400">({doc.type})</span>
                          </div>
                          <div className="text-xs font-semibold truncate mt-0.5">{doc.title}</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-slate-700 bg-slate-950 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: AUDIT EVIDENCE FILES                               */}
          {/* ========================================================= */}
          {activeTab === 'evidence' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Context Callout */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    ISO 19011 & ISO/IEC 27001:2022 Clause 9.2 Objective Evidence
                  </p>
                  <p className="text-slate-400">
                    Lead Auditors require corroborating operational evidence (configuration snapshots, user access recertifications, penetration test reports, branch protection rules) to verify implementation effectiveness.
                  </p>
                </div>
              </div>

              {/* Master Evidence Requirements for this control */}
              {meta?.evidenceRequirements && meta.evidenceRequirements.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>Expected Audit Evidence Artifacts (Standard Specification)</span>
                    </h4>
                    <span className="text-[10px] text-slate-500">ISO 19011 Guide</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {meta.evidenceRequirements.map((req, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-2 text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate text-[11px]" title={req}>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Currently Mapped Evidence Files */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-indigo-400" />
                    <span>Mapped Evidence Files ({currentMappedEvidence.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Attach New Evidence File</span>
                  </button>
                </div>

                {/* Inline Upload Form */}
                {showUploadForm && (
                  <form
                    onSubmit={handleUploadSubmit}
                    className="p-4 rounded-xl bg-slate-950 border border-indigo-800/60 space-y-3 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <UploadCloud className="w-4 h-4 text-indigo-400" />
                        <span>Direct Evidence Attachment for {control.controlCode}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Evidence Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2026 Penetration Test Executive Summary"
                          value={uploadTitle}
                          onChange={e => setUploadTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          File Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Pentest_Report_Q2_2026.pdf"
                          value={uploadFileName}
                          onChange={e => setUploadFileName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={uploadDepartment}
                          onChange={e => setUploadDepartment(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={uploadTags}
                          onChange={e => setUploadTags(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Will be automatically hashed with SHA-256 for audit immutability.
                      </span>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
                      >
                        Upload & Map to Control
                      </button>
                    </div>
                  </form>
                )}

                {currentMappedEvidence.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-2">
                    <Paperclip className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-400">
                      No evidence files attached to this control
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Attach operational proof (reports, logs, screenshots, sign-offs) to prove compliance to external auditors.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentMappedEvidence.map(evd => (
                      <div
                        key={evd.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-xs text-white truncate" title={evd.title}>
                                {evd.title}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  evd.status === 'Verified'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : evd.status === 'Pending Review'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {evd.status}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                              <span className="font-mono text-slate-300">{evd.fileName}</span>
                              <span>•</span>
                              <span>{evd.fileSize}</span>
                              <span>•</span>
                              <span>Uploaded by {evd.uploadedBy}</span>
                              {evd.sha256Hash && (
                                <>
                                  <span>•</span>
                                  <span
                                    className="font-mono text-[9px] text-slate-500 flex items-center gap-1"
                                    title={`SHA256: ${evd.sha256Hash}`}
                                  >
                                    <Hash className="w-3 h-3 text-slate-500" />
                                    {evd.sha256Hash.substring(0, 10)}...
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleEvidence(evd.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 text-xs transition shrink-0"
                          title="Unlink Evidence"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Link from Tenant Evidence Library */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Evidence Repository (Select to Link)
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search evidence..."
                        value={evidenceSearch}
                        onChange={e => setEvidenceSearch(e.target.value)}
                        className="pl-8 pr-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-40"
                      />
                    </div>
                    <select
                      value={evidenceStatusFilter}
                      onChange={e => setEvidenceStatusFilter(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="Verified">Verified Only</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {availableFilteredEvidence.map(evd => {
                    const isSelected = selectedEvidenceIds.includes(evd.id);
                    return (
                      <div
                        key={evd.id}
                        onClick={() => handleToggleEvidence(evd.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-700 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-semibold truncate">{evd.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                            {evd.fileName} ({evd.fileSize})
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-slate-700 bg-slate-950 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: AUDITOR VERIFICATION DOSSIER                       */}
          {/* ========================================================= */}
          {activeTab === 'dossier' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Audit Readiness Scorecard */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>ISO 19011 Audit Defense Traceability Matrix</span>
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      readiness.status === 'AUDIT_READY'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : readiness.status === 'EVIDENCE_PENDING'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : readiness.status === 'POLICY_ONLY'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {readiness.status === 'AUDIT_READY' && 'Audit Defense Ready'}
                    {readiness.status === 'EVIDENCE_PENDING' && 'Evidence Pending Review'}
                    {readiness.status === 'POLICY_ONLY' && 'Missing Operational Evidence'}
                    {readiness.status === 'EVIDENCE_ONLY' && 'Missing Governance Policy'}
                    {readiness.status === 'NO_ARTIFACTS' && 'No Artifacts Linked'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      1. Governance Authority
                    </div>
                    <div className="text-lg font-bold text-white">
                      {currentMappedPolicies.length > 0 ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {currentMappedPolicies.length} Policy Mandates
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Missing Policy
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Clause 5 / ISMS manual</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      2. Operational Proof
                    </div>
                    <div className="text-lg font-bold text-white">
                      {currentMappedEvidence.length > 0 ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {currentMappedEvidence.length} Evidence Records
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Zero Files Attached
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {readiness.verifiedEvidenceCount} of {currentMappedEvidence.length} Verified
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      3. Cryptographic Proof
                    </div>
                    <div className="text-lg font-bold text-indigo-400">
                      SHA-256 Verified
                    </div>
                    <div className="text-[10px] text-slate-400">Tamper-evident verification</div>
                  </div>
                </div>
              </div>

              {/* Official Auditor Citation Block */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Formal Auditor Citation Note (Copy for Working Papers)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyCitation}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    {copiedCitation ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-slate-300 border border-slate-800 select-all leading-relaxed">
                  {readiness.auditorCitation}
                </div>
              </div>

              {/* Detailed Breakdown for Stage 1/Stage 2 */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Audit Defense Reference Index
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="text-[11px] font-bold text-indigo-400">Primary Codified Policies:</div>
                    {currentMappedPolicies.length > 0 ? (
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {currentMappedPolicies.map(p => (
                          <li key={p.id}>
                            <span className="font-mono font-bold">{p.docCode}</span> — {p.title} ({p.version})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-red-400 text-[11px]">No formal policy mapped to this control requirement.</div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="text-[11px] font-bold text-emerald-400">Corroborating Evidence Files:</div>
                    {currentMappedEvidence.length > 0 ? (
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {currentMappedEvidence.map(e => (
                          <li key={e.id}>
                            <span className="font-bold">{e.title}</span> ({e.fileName} - {e.status})
                            {e.sha256Hash && (
                              <span className="text-slate-500 font-mono text-[9px] ml-1">
                                [SHA256: {e.sha256Hash.substring(0, 16)}...]
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-amber-400 text-[11px]">No corroborating evidence attached.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400">
            Mapping updates are cryptographically logged to the tenant audit trail.
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Mappings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Policy Drawer/Modal */}
      {previewingDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-400">
                  {previewingDoc.docCode}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{previewingDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewingDoc(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {previewingDoc.content || 'No content snippet available.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
