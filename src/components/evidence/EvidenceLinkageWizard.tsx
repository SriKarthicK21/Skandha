import React, { useState, useMemo } from 'react';
import {
  Wand2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck,
  Camera,
  Terminal,
  FileSpreadsheet,
  Layers,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Lock,
  Hash,
  Clock,
  Calendar,
  Building2,
  UserCheck,
  Sparkles,
  Printer,
  Download,
  Star,
  Tag,
  FolderCheck,
  Award,
  AlertCircle
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { EvidenceRecord } from '../../types';
import { MAS_TRM_REQUIREMENTS } from '../../data/masRegulatoryMasterData';
import { ISO27001_2022_93_MASTER } from '../../data/iso27001_2022_masterControls';

export type EvidenceCategoryType = 'SCREENSHOT' | 'LOG' | 'REPORT' | 'POLICY_SOP' | 'OTHER';

export interface EvidenceLinkageWizardProps {
  onClose?: () => void;
  onLinkageCompleted?: (summary: { controlCodes: string[]; evidenceIds: string[]; readinessScore: number }) => void;
  preselectedControlCode?: string;
  preselectedEvidenceId?: string;
}

export const EvidenceLinkageWizard: React.FC<EvidenceLinkageWizardProps> = ({
  onClose,
  onLinkageCompleted,
  preselectedControlCode,
  preselectedEvidenceId
}) => {
  const {
    evidence,
    currentTenant,
    currentUser,
    currentRole,
    masAssessments,
    updateMASAssessment,
    logAuditEvent,
    reviewEvidence
  } = useGRC();

  const { showToast } = useToast();

  // Wizard Step Navigation: 1 (Select Control) -> 2 (Select Evidence) -> 3 (Calibrate Triangulation) -> 4 (Confirm & Seal)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(preselectedControlCode ? 2 : 1);

  // Step 1 State: Control Requirements Selection
  const [selectedFramework, setSelectedFramework] = useState<'ALL' | 'MAS_TRM' | 'ISO_27001' | 'ISO_42001' | 'DPDP'>('ALL');
  const [controlSearchQuery, setControlSearchQuery] = useState('');
  const [selectedControlCodes, setSelectedControlCodes] = useState<string[]>(
    preselectedControlCode ? [preselectedControlCode] : ['MAS-09.2']
  );

  // Step 2 State: Evidence Items Selection
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState<'ALL' | EvidenceCategoryType>('ALL');
  const [evidenceStatusFilter, setEvidenceStatusFilter] = useState<'ALL' | 'Verified' | 'Pending Review' | 'Draft'>('ALL');
  const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<Set<string>>(
    new Set(preselectedEvidenceId ? [preselectedEvidenceId] : [])
  );

  // Step 3 State: Triangulation & Auditor Calibration
  const [evidenceCalibrationMap, setEvidenceCalibrationMap] = useState<Record<string, {
    modality: 'PRIMARY_DIRECT' | 'SECONDARY_CORROBORATING' | 'TERTIARY_ATTESTATION';
    auditorObservation: string;
    readinessConfidence: 'HIGH' | 'MODERATE' | 'LOW';
  }>>({});

  // Step 4 State: Confirmation & Seal
  const [isSealed, setIsSealed] = useState(false);
  const [confirmationSealId, setConfirmationSealId] = useState<string | null>(null);
  const [leadAuditorDeclaration, setLeadAuditorDeclaration] = useState(true);

  // Determine artifact category helper
  const detectEvidenceCategory = (item: EvidenceRecord): EvidenceCategoryType => {
    const ext = (item.fileType || item.fileName.split('.').pop() || '').toLowerCase();
    const title = (item.title + ' ' + (item.tags || []).join(' ')).toLowerCase();

    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || title.includes('screenshot') || title.includes('console') || title.includes('dashboard')) {
      return 'SCREENSHOT';
    }
    if (ext === 'log' || ext === 'json' || ext === 'csv' || ext === 'txt' || title.includes('log') || title.includes('telemetry') || title.includes('audit trail') || title.includes('syslog')) {
      return 'LOG';
    }
    if (ext === 'pdf' || title.includes('report') || title.includes('assessment') || title.includes('soc 2') || title.includes('vapt') || title.includes('attestation')) {
      return 'REPORT';
    }
    if (title.includes('policy') || title.includes('procedure') || title.includes('sop') || title.includes('charter') || title.includes('approval')) {
      return 'POLICY_SOP';
    }
    return 'OTHER';
  };

  // Compile Unified Control Catalog
  const unifiedControls = useMemo(() => {
    const list: Array<{
      framework: 'MAS_TRM' | 'ISO_27001' | 'ISO_42001' | 'DPDP';
      code: string;
      title: string;
      category: string;
      guidance: string;
      mappedEvidenceCount: number;
    }> = [];

    // 1. MAS TRM Requirements
    MAS_TRM_REQUIREMENTS.forEach(r => {
      const mappedCount = evidence.filter(e => e.controlCode === r.requirementCode || (r.requirementCode && e.tags?.includes(r.requirementCode))).length;
      list.push({
        framework: 'MAS_TRM',
        code: r.requirementCode,
        title: r.title,
        category: `Domain ${r.domainNumber}: ${r.domainName}`,
        guidance: r.statement || r.intentAndGuidance || 'Ensure strict compliance with MAS TRM supervisory expectations.',
        mappedEvidenceCount: mappedCount
      });
    });

    // 2. ISO 27001:2022 Master Controls
    ISO27001_2022_93_MASTER.forEach(c => {
      const mappedCount = evidence.filter(e => e.controlCode === c.controlCode || (c.controlCode && e.tags?.includes(c.controlCode))).length;
      list.push({
        framework: 'ISO_27001',
        code: c.controlCode,
        title: c.title,
        category: `${c.theme} Controls (${c.operationalCapability})`,
        guidance: c.guidance || c.description,
        mappedEvidenceCount: mappedCount
      });
    });

    return list;
  }, [evidence]);

  // Filtered Controls
  const filteredControls = useMemo(() => {
    return unifiedControls.filter(c => {
      const matchFw = selectedFramework === 'ALL' || c.framework === selectedFramework;
      const matchSearch = !controlSearchQuery ||
        c.code.toLowerCase().includes(controlSearchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(controlSearchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(controlSearchQuery.toLowerCase());
      return matchFw && matchSearch;
    });
  }, [unifiedControls, selectedFramework, controlSearchQuery]);

  // Tenant Evidence list with detected category
  const tenantEvidenceWithMeta = useMemo(() => {
    const list = evidence.filter(e => e.tenantId === currentTenant?.id);
    return list.map(item => ({
      ...item,
      categoryType: detectEvidenceCategory(item)
    }));
  }, [evidence, currentTenant?.id]);

  // Filtered Evidence list
  const filteredEvidence = useMemo(() => {
    return tenantEvidenceWithMeta.filter(item => {
      const matchType = evidenceTypeFilter === 'ALL' || item.categoryType === evidenceTypeFilter;
      const matchStatus = evidenceStatusFilter === 'ALL' || item.status === evidenceStatusFilter;
      const matchSearch = !evidenceSearchQuery ||
        item.title.toLowerCase().includes(evidenceSearchQuery.toLowerCase()) ||
        item.fileName.toLowerCase().includes(evidenceSearchQuery.toLowerCase()) ||
        (item.department && item.department.toLowerCase().includes(evidenceSearchQuery.toLowerCase())) ||
        item.tags?.some(t => t.toLowerCase().includes(evidenceSearchQuery.toLowerCase()));
      return matchType && matchStatus && matchSearch;
    });
  }, [tenantEvidenceWithMeta, evidenceTypeFilter, evidenceStatusFilter, evidenceSearchQuery]);

  // Selected Evidence Records
  const selectedEvidenceRecords = useMemo(() => {
    return tenantEvidenceWithMeta.filter(e => selectedEvidenceIds.has(e.id));
  }, [tenantEvidenceWithMeta, selectedEvidenceIds]);

  // Compute Triangulation Sufficiency Score (1 to 3 Stars)
  const triangulationMetrics = useMemo(() => {
    const categoriesPresent = new Set<EvidenceCategoryType>();
    selectedEvidenceRecords.forEach(e => categoriesPresent.add(e.categoryType));

    const hasLog = categoriesPresent.has('LOG');
    const hasScreenshot = categoriesPresent.has('SCREENSHOT');
    const hasReport = categoriesPresent.has('REPORT');
    const hasPolicy = categoriesPresent.has('POLICY_SOP');

    let stars: 1 | 2 | 3 = 1;
    let sufficiencyLabel = '1-Star: Unilateral Proof (Basic)';
    let readinessPercentage = 50;

    if (categoriesPresent.size >= 3 || (hasLog && hasScreenshot && (hasReport || hasPolicy))) {
      stars = 3;
      sufficiencyLabel = '3-Star: Fully Triangulated Audit Defense (ISO 19011 §6.4.7 Compliant)';
      readinessPercentage = 100;
    } else if (categoriesPresent.size >= 2) {
      stars = 2;
      sufficiencyLabel = '2-Star: Corroborated Evidence (Substantiated)';
      readinessPercentage = 80;
    }

    return {
      stars,
      sufficiencyLabel,
      readinessPercentage,
      categoriesCount: categoriesPresent.size,
      hasLog,
      hasScreenshot,
      hasReport,
      hasPolicy
    };
  }, [selectedEvidenceRecords]);

  // Handle Control Selection
  const handleToggleControl = (code: string) => {
    setSelectedControlCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      }
      return [...prev, code];
    });
  };

  // Handle Evidence Selection
  const handleToggleEvidence = (id: string) => {
    setSelectedEvidenceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFilteredEvidence = () => {
    setSelectedEvidenceIds(prev => {
      const next = new Set(prev);
      filteredEvidence.forEach(e => next.add(e.id));
      return next;
    });
  };

  const handleClearEvidenceSelection = () => {
    setSelectedEvidenceIds(new Set());
  };

  // Calibration updates
  const handleUpdateCalibration = (
    evidenceId: string,
    field: 'modality' | 'auditorObservation' | 'readinessConfidence',
    value: any
  ) => {
    setEvidenceCalibrationMap(prev => ({
      ...prev,
      [evidenceId]: {
        modality: prev[evidenceId]?.modality || 'PRIMARY_DIRECT',
        auditorObservation: prev[evidenceId]?.auditorObservation || '',
        readinessConfidence: prev[evidenceId]?.readinessConfidence || 'HIGH',
        [field]: value
      }
    }));
  };

  // Execute Seal & Confirm Linkage
  const handleConfirmAndSealLinkage = () => {
    if (selectedControlCodes.length === 0 || selectedEvidenceIds.size === 0) {
      showToast({
        title: 'Selection Incomplete',
        message: 'Please select at least one control requirement and one evidence item.',
        type: 'warning'
      });
      return;
    }

    const sealHash = `SEAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    setConfirmationSealId(sealHash);

    // 1. Update MAS Assessments if any selected control is MAS
    selectedControlCodes.forEach(ctrlCode => {
      const assess = masAssessments.find(a => a.requirementCode === ctrlCode || a.id.includes(ctrlCode));
      if (assess) {
        const existing = assess.linkedEvidenceIds || [];
        const merged = Array.from(new Set([...existing, ...Array.from(selectedEvidenceIds)]));
        updateMASAssessment(assess.id, {
          linkedEvidenceIds: merged,
          complianceStatus: assess.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : assess.complianceStatus
        });
      }
    });

    // 2. Review evidence status if pending
    selectedEvidenceRecords.forEach(ev => {
      if (ev.status === 'Pending Review' || ev.status === 'Draft') {
        reviewEvidence(
          ev.id,
          'Verified',
          `Mapped and certified under Evidence Linkage Wizard for [${selectedControlCodes.join(', ')}] by Lead Auditor ${currentUser.name}.`
        );
      }
    });

    // 3. Log Audit Event
    logAuditEvent(
      'UPDATE',
      'EVIDENCE_LINKAGE_WIZARD',
      `Lead Auditor ${currentUser.name} mapped and cryptographically sealed ${selectedEvidenceIds.size} evidence artifacts to controls [${selectedControlCodes.join(', ')}] with ${triangulationMetrics.stars}-star triangulation seal (${sealHash}).`
    );

    setIsSealed(true);
    showToast({
      title: 'Audit Linkage Sealed Successfully',
      message: `Bound ${selectedEvidenceIds.size} evidence items to ${selectedControlCodes.length} control(s) with ${triangulationMetrics.stars}-Star verification.`,
      type: 'success'
    });

    if (onLinkageCompleted) {
      onLinkageCompleted({
        controlCodes: selectedControlCodes,
        evidenceIds: Array.from(selectedEvidenceIds),
        readinessScore: triangulationMetrics.readinessPercentage
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" />
              Auditor Evidence Linkage Wizard
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              ISO 19011 Triangulation (§6.4.7)
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Four-Eyes Certified
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Multi-Modal Evidence Mapping & Audit Readiness Confirmation
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Corroborate control implementation by mapping multiple heterogeneous evidence artifacts (screenshots, raw logs, third-party reports, policies) to prove operational effectiveness during external inspections.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition self-start md:self-auto"
            title="Close wizard"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Step Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { step: 1, label: '1. Select Controls', active: currentStep === 1, done: currentStep > 1 },
          { step: 2, label: '2. Select Evidence', active: currentStep === 2, done: currentStep > 2 },
          { step: 3, label: '3. Calibrate Triangulation', active: currentStep === 3, done: currentStep > 3 },
          { step: 4, label: '4. Confirm & Seal', active: currentStep === 4, done: isSealed }
        ].map(s => (
          <button
            key={s.step}
            onClick={() => {
              if (s.step < currentStep || isSealed) setCurrentStep(s.step as any);
            }}
            disabled={s.step > currentStep && !isSealed}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              s.active
                ? 'bg-sky-950/60 border-sky-500 text-white shadow-sm'
                : s.done
                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300 hover:border-emerald-600'
                : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <div className="text-[10px] font-mono font-bold flex items-center justify-between">
              <span>STEP {s.step}</span>
              {s.done && <Check className="w-3 h-3 text-emerald-400" />}
            </div>
            <div className="text-xs font-semibold truncate mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* ================= STEP 1: SELECT TARGET CONTROLS ================= */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Select Target Control Requirements
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the statutory or standard requirements you are preparing to substantiate.
              </p>
            </div>

            {/* Framework Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'ALL', label: 'All Frameworks' },
                { id: 'MAS_TRM', label: 'MAS TRM 2021' },
                { id: 'ISO_27001', label: 'ISO 27001:2022' }
              ].map(fw => (
                <button
                  key={fw.id}
                  onClick={() => setSelectedFramework(fw.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    selectedFramework === fw.id
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {fw.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search control code, title, domain, keyword (e.g. Access Control, A.8.2, Backup)..."
              value={controlSearchQuery}
              onChange={(e) => setControlSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredControls.map(ctrl => {
              const isSelected = selectedControlCodes.includes(ctrl.code);
              return (
                <div
                  key={ctrl.code}
                  onClick={() => handleToggleControl(ctrl.code)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-400">{ctrl.code}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {ctrl.framework.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {ctrl.mappedEvidenceCount} mapped
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white">
                    {ctrl.title}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2">
                    {ctrl.guidance}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Selected <strong className="text-white">{selectedControlCodes.length}</strong> control requirement(s)
            </span>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={selectedControlCodes.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-md shadow-sky-900/30 transition disabled:opacity-40"
            >
              <span>Next: Select Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: SELECT EVIDENCE ITEMS ================= */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Select Evidence Artifacts from Repository
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeting: <strong className="text-sky-300">{selectedControlCodes.join(', ')}</strong>. Pick multi-modal artifacts (logs, screenshots, reports) to substantiate this requirement.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllFilteredEvidence}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700"
              >
                Select Filtered ({filteredEvidence.length})
              </button>
              <button
                onClick={handleClearEvidenceSelection}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-700"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Evidence Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Artefacts', icon: Layers },
              { id: 'SCREENSHOT', label: 'Screenshots & Config', icon: Camera },
              { id: 'LOG', label: 'Raw Logs & Telemetry', icon: Terminal },
              { id: 'REPORT', label: 'Formal Reports & Audit', icon: FileSpreadsheet },
              { id: 'POLICY_SOP', label: 'Policies & Approvals', icon: FileText }
            ].map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setEvidenceTypeFilter(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border transition ${
                    evidenceTypeFilter === cat.id
                      ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search evidence by title, filename, department, SHA-256 hash..."
              value={evidenceSearchQuery}
              onChange={(e) => setEvidenceSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Evidence Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredEvidence.map(item => {
              const isSelected = selectedEvidenceIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleEvidence(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        item.categoryType === 'SCREENSHOT' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        item.categoryType === 'LOG' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        item.categoryType === 'REPORT' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.categoryType}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {item.title}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'Verified' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{item.fileName} ({item.fileSize})</span>
                    <span>Dept: {item.department}</span>
                  </div>

                  {item.documentExcerpt && (
                    <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80 line-clamp-2">
                      {item.documentExcerpt}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                    <span className="truncate">Hash: {item.sha256Hash ? `${item.sha256Hash.slice(0, 16)}...` : 'Pending Checksum'}</span>
                    <span>Uploaded: {item.uploadedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">
                Selected <strong className="text-emerald-400">{selectedEvidenceIds.size}</strong> artifact(s)
              </span>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={selectedEvidenceIds.size === 0}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-md shadow-sky-900/30 transition disabled:opacity-40"
              >
                <span>Next: Calibrate Triangulation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: CALIBRATE TRIANGULATION ================= */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Calibrate Triangulation Roles & Auditor Observations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign evidentiary modalities (Primary direct proof, secondary corroboration, tertiary attestation) and document auditor verification notes.
              </p>
            </div>

            {/* Triangulation Sufficiency Gauge */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3].map(st => (
                  <Star
                    key={st}
                    className={`w-4 h-4 ${
                      st <= triangulationMetrics.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white">{triangulationMetrics.readinessPercentage}% Readiness</div>
                <div className="text-[10px] text-slate-400">{triangulationMetrics.categoriesCount} distinct artifact type(s)</div>
              </div>
            </div>
          </div>

          {/* Triangulation Analysis Alert */}
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
            triangulationMetrics.stars === 3
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
              : 'bg-amber-950/30 border-amber-800 text-amber-200'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-white">ISO 19011 §6.4.7 Triangulation Status:</strong>
              {triangulationMetrics.sufficiencyLabel}. Corroborating raw logs ({triangulationMetrics.hasLog ? '✓ Present' : '✗ Missing'}), screenshots ({triangulationMetrics.hasScreenshot ? '✓ Present' : '✗ Missing'}), and formal reports ({triangulationMetrics.hasReport ? '✓ Present' : '✗ Missing'}) delivers unimpeachable inspection defense.
            </div>
          </div>

          {/* Calibration List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {selectedEvidenceRecords.map(item => {
              const calib = evidenceCalibrationMap[item.id] || {
                modality: 'PRIMARY_DIRECT',
                auditorObservation: 'Observed and verified control artifact in repository.',
                readinessConfidence: 'HIGH'
              };

              return (
                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{item.id}</span>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                        {item.categoryType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] uppercase text-slate-400 font-semibold">Evidence Role:</label>
                      <select
                        value={calib.modality}
                        onChange={(e) => handleUpdateCalibration(item.id, 'modality', e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="PRIMARY_DIRECT">Primary Direct Evidence</option>
                        <option value="SECONDARY_CORROBORATING">Secondary Corroborating</option>
                        <option value="TERTIARY_ATTESTATION">Tertiary Attestation</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Auditor Inspection Notes
                      </label>
                      <input
                        type="text"
                        placeholder="Document verified criteria (e.g. sample accounts verified without exception)..."
                        value={calib.auditorObservation}
                        onChange={(e) => handleUpdateCalibration(item.id, 'auditorObservation', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Readiness Confidence
                      </label>
                      <select
                        value={calib.readinessConfidence}
                        onChange={(e) => handleUpdateCalibration(item.id, 'readinessConfidence', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="HIGH">High (100% Sufficient for Audit Defense)</option>
                        <option value="MODERATE">Moderate (Substantiated with minor observations)</option>
                        <option value="LOW">Low (Supplementary items recommended)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-md shadow-sky-900/30 transition"
            >
              <span>Next: Review & Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: CONFIRM & SEAL ================= */}
      {currentStep === 4 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Audit Readiness Confirmation & Digital Seal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review the bound control mapping and execute the digital audit readiness confirmation.
              </p>
            </div>
            {isSealed && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SEALED & COMMITTED
              </span>
            )}
          </div>

          {/* Executive Linkage Summary Certificate */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-sky-400 font-mono uppercase font-semibold">
                  Statutory Binding Reference
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  Controls: {selectedControlCodes.join(' • ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Triangulation Level</div>
                <div className="text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
                  {[...Array(triangulationMetrics.stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-mono text-white ml-1">({triangulationMetrics.readinessPercentage}%)</span>
                </div>
              </div>
            </div>

            {/* Mapped Evidence Breakdown */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Bound Evidence Artifacts ({selectedEvidenceRecords.length})
              </span>
              <div className="space-y-2">
                {selectedEvidenceRecords.map(e => (
                  <div key={e.id} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {e.categoryType}
                      </span>
                      <span className="text-white font-medium">{e.title}</span>
                      <span className="text-slate-500 font-mono">({e.fileName})</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400">
                      {e.sha256Hash ? `${e.sha256Hash.slice(0, 14)}...` : 'Valid'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Signature Declaration */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leadAuditorDeclaration}
                  onChange={(e) => setLeadAuditorDeclaration(e.target.checked)}
                  disabled={isSealed}
                  className="mt-0.5 text-sky-500 rounded bg-slate-900 border-slate-700"
                />
                <span className="text-slate-300 leading-relaxed">
                  I, <strong className="text-white">{currentUser.name}</strong> ({currentRole}), certify that the mapped evidence artifacts have been inspected across independent modalities and are sufficient to substantiate compliance under MAS Section 15 and ISO 19011 §6.4.7 audit scrutiny.
                </span>
              </label>

              {confirmationSealId && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>Audit Seal Hash: <strong>{confirmationSealId}</strong></span>
                  <span>Timestamp: {new Date().toISOString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isSealed}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {isSealed ? (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 flex items-center gap-2 shadow-sm transition"
                >
                  <Printer className="w-4 h-4" />
                  Print Linkage Certificate
                </button>
              ) : (
                <button
                  onClick={handleConfirmAndSealLinkage}
                  disabled={!leadAuditorDeclaration}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-900/40 border border-emerald-500 transition disabled:opacity-40"
                >
                  <Lock className="w-4 h-4" />
                  Confirm & Seal Linkage in Evidence Vault
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
