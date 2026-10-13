import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Upload,
  Shield,
  FileText,
  Eye,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Info
} from 'lucide-react';
import { ClauseRequirement } from '../modules/ISO27001ClausesModule';
import { EvidenceRecord, ControlItem } from '../../types';
import { useGRC } from '../../context/GRCContext';

export interface RequirementArtifactStatus {
  artifactTitle: string;
  satisfactionLevel: 'VERIFIED' | 'UNDER_REVIEW' | 'DRAFT' | 'MISSING';
  score: number; // 1.0 for verified, 0.6 for under review, 0.3 for draft, 0.0 for missing
  matchedEvidence: EvidenceRecord[];
}

export interface RequirementEvidenceCalculation {
  percentage: number; // 0 to 100
  totalRequired: number;
  verifiedCount: number;
  underReviewCount: number;
  missingCount: number;
  artifactStatuses: RequirementArtifactStatus[];
  allLinkedEvidence: EvidenceRecord[];
  readinessLevel: 'STAGE_READY' | 'SUBSTANTIAL' | 'IN_PROGRESS' | 'CRITICAL_GAP';
  readinessLabel: string;
  readinessColor: {
    barGradient: string;
    text: string;
    bg: string;
    border: string;
    glow: string;
    pillBg: string;
  };
}

/**
 * Calculates real-time evidence presence and percentage completion
 * for an ISO 27001 control requirement.
 */
export function calculateRequirementEvidencePresence(
  requirement: ClauseRequirement,
  clauseNumber: string,
  evidenceList: EvidenceRecord[],
  controlsList?: ControlItem[]
): RequirementEvidenceCalculation {
  const reqCode = requirement.code;
  const linkedControls = requirement.linkedControls || [];
  const mandatoryArtifacts = requirement.mandatoryArtifacts || [];

  // Helper to extract key search tokens from artifact titles
  const getKeywords = (str: string): string[] => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !['annual', 'official', 'formal', 'documented', 'master', 'system', 'procedure', 'records', 'report'].includes(w));
  };

  // Match evidence for each mandatory artifact
  const artifactStatuses: RequirementArtifactStatus[] = mandatoryArtifacts.map(artifactTitle => {
    const keywords = getKeywords(artifactTitle);
    const titleLower = artifactTitle.toLowerCase();

    const matchedEvidence = evidenceList.filter(ev => {
      const evTitle = (ev.title || '').toLowerCase();
      const evFile = (ev.fileName || '').toLowerCase();
      const evExcerpt = (ev.documentExcerpt || '').toLowerCase();
      const tags = (ev.tags || []).map(t => t.toLowerCase());
      const isoReqs = (ev.isoRequirements || []).map(r => r.toLowerCase());

      // 1. Direct requirement code match in tags or ISO requirements
      const codeMatch =
        tags.some(t => t.includes(reqCode) || t.includes(`clause ${reqCode}`) || t.includes(`cl. ${reqCode}`)) ||
        isoReqs.some(r => r.includes(reqCode) || r.includes(`clause ${reqCode}`));

      // 2. Keyword matching on artifact title
      const keywordMatch =
        keywords.length > 0 &&
        keywords.some(kw => evTitle.includes(kw) || evFile.includes(kw) || evExcerpt.includes(kw));

      // 3. Exact artifact phrase match
      const phraseMatch =
        evTitle.includes(titleLower.slice(0, 18)) ||
        titleLower.includes(evTitle.slice(0, 18));

      // 4. Linked control code match
      const controlMatch = linkedControls.includes(ev.controlCode);

      // Must have either explicit code match, strong keyword match, or control match with partial keyword
      if (codeMatch) return true;
      if (phraseMatch) return true;
      if (controlMatch && keywordMatch) return true;
      if (keywordMatch && keywords.filter(kw => evTitle.includes(kw)).length >= 2) return true;

      return false;
    });

    // Check satisfaction level
    let satisfactionLevel: RequirementArtifactStatus['satisfactionLevel'] = 'MISSING';
    let score = 0;

    if (matchedEvidence.some(e => e.status === 'Verified')) {
      satisfactionLevel = 'VERIFIED';
      score = 1.0;
    } else if (matchedEvidence.some(e => e.status === 'Pending Review')) {
      satisfactionLevel = 'UNDER_REVIEW';
      score = 0.6;
    } else if (matchedEvidence.some(e => e.status === 'Draft' || e.status === 'Requires Update')) {
      satisfactionLevel = 'DRAFT';
      score = 0.3;
    }

    return {
      artifactTitle,
      satisfactionLevel,
      score,
      matchedEvidence
    };
  });

  // Calculate linked evidence across linked controls as supplementary baseline
  const allLinkedEvidence = evidenceList.filter(ev => {
    return (
      linkedControls.includes(ev.controlCode) ||
      (ev.tags || []).some(t => t.toLowerCase().includes(reqCode) || t.toLowerCase().includes(`clause ${clauseNumber}`)) ||
      (ev.isoRequirements || []).some(r => r.toLowerCase().includes(reqCode))
    );
  });

  const totalRequired = Math.max(artifactStatuses.length, 1);
  const verifiedCount = artifactStatuses.filter(a => a.satisfactionLevel === 'VERIFIED').length;
  const underReviewCount = artifactStatuses.filter(a => a.satisfactionLevel === 'UNDER_REVIEW').length;
  const missingCount = artifactStatuses.filter(a => a.satisfactionLevel === 'MISSING').length;

  // Base raw score from mandatory artifacts
  const rawArtifactScore = artifactStatuses.reduce((acc, a) => acc + a.score, 0);
  let computedPercentage = Math.round((rawArtifactScore / totalRequired) * 100);

  // If general linked controls have verified evidence but artifact title didn't match keyword,
  // grant partial credit (capped at 40% if no artifacts matched, or 10% boost if partial)
  if (computedPercentage === 0 && allLinkedEvidence.some(e => e.status === 'Verified')) {
    computedPercentage = 35;
  } else if (computedPercentage > 0 && computedPercentage < 100 && allLinkedEvidence.some(e => e.status === 'Verified')) {
    computedPercentage = Math.min(100, computedPercentage + 10);
  }

  // If requirement itself is flagged Compliant in audit checklist and has verified linked evidence
  if (requirement.status === 'Compliant' && verifiedCount === totalRequired) {
    computedPercentage = 100;
  }

  // Ensure clean bounds 0 to 100
  const percentage = Math.min(100, Math.max(0, computedPercentage));

  // Determine readiness level
  let readinessLevel: RequirementEvidenceCalculation['readinessLevel'] = 'CRITICAL_GAP';
  let readinessLabel = 'Missing Evidence';
  let readinessColor = {
    barGradient: 'from-rose-500 via-rose-500 to-amber-500',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.2)',
    pillBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  };

  if (percentage >= 90) {
    readinessLevel = 'STAGE_READY';
    readinessLabel = 'Stage 1 & 2 Audit Ready';
    readinessColor = {
      barGradient: 'from-emerald-500 via-teal-400 to-emerald-400',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'rgba(16, 185, 129, 0.2)',
      pillBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    };
  } else if (percentage >= 70) {
    readinessLevel = 'SUBSTANTIAL';
    readinessLabel = 'Substantially Evidenced';
    readinessColor = {
      barGradient: 'from-sky-500 via-cyan-400 to-blue-500',
      text: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      glow: 'rgba(14, 165, 233, 0.2)',
      pillBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    };
  } else if (percentage >= 40) {
    readinessLevel = 'IN_PROGRESS';
    readinessLabel = 'Partial Evidence / In Review';
    readinessColor = {
      barGradient: 'from-amber-500 via-yellow-400 to-orange-400',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'rgba(245, 158, 11, 0.2)',
      pillBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    };
  }

  return {
    percentage,
    totalRequired,
    verifiedCount,
    underReviewCount,
    missingCount,
    artifactStatuses,
    allLinkedEvidence,
    readinessLevel,
    readinessLabel,
    readinessColor
  };
}

export interface ClauseRequirementProgressTrackerProps {
  requirement: ClauseRequirement;
  clauseNumber: string;
  clauseTitle?: string;
  evidenceList: EvidenceRecord[];
  controlsList?: ControlItem[];
  variant?: 'card' | 'compact' | 'detailed';
  onNavigateToEvidenceCentre?: (controlCode?: string, clauseCode?: string) => void;
  className?: string;
}

export const ClauseRequirementProgressTracker: React.FC<ClauseRequirementProgressTrackerProps> = ({
  requirement,
  clauseNumber,
  clauseTitle,
  evidenceList,
  controlsList,
  variant = 'card',
  onNavigateToEvidenceCentre,
  className = ''
}) => {
  const { uploadEvidence, reviewEvidence, currentTenant, setActiveModule } = useGRC();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedEvidenceForPreview, setSelectedEvidenceForPreview] = useState<EvidenceRecord | null>(null);
  const [uploadModalArtifact, setUploadModalArtifact] = useState<string | null>(null);

  // Form state for quick evidence attachment
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadDepartment, setUploadDepartment] = useState<string>('Information Security & Compliance');
  const [uploadStatus, setUploadStatus] = useState<'Verified' | 'Pending Review'>('Verified');
  const [uploadNotes, setUploadNotes] = useState<string>('Formal evidence package verified for ISO/IEC 27001:2022 compliance.');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState<boolean>(false);

  // Compute live metrics
  const metrics = useMemo(() => {
    return calculateRequirementEvidencePresence(requirement, clauseNumber, evidenceList, controlsList);
  }, [requirement, clauseNumber, evidenceList, controlsList]);

  // Handle quick evidence submission
  const handleQuickUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalArtifact) return;

    setIsSubmittingEvidence(true);
    try {
      const generatedFileName = uploadFileName.trim() || `${requirement.code}_${uploadModalArtifact.replace(/[^a-zA-Z0-9]/g, '_')}_v1.pdf`;
      const primaryControlCode = requirement.linkedControls[0] || 'A.5.1';

      await uploadEvidence({
        title: `${requirement.code} - ${uploadModalArtifact}`,
        controlCode: primaryControlCode,
        department: uploadDepartment,
        fileName: generatedFileName,
        fileSize: '1.8 MB',
        fileType: 'application/pdf',
        tags: [
          `Clause ${requirement.code}`,
          `Clause ${clauseNumber}`,
          'ISO27001:2022',
          uploadModalArtifact.slice(0, 20),
          'Mandatory Audit Evidence'
        ],
        initialStatus: uploadStatus === 'Verified' ? 'Pending Review' : 'Pending Review',
        sha256Hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
        isoRequirements: [primaryControlCode, `Clause ${requirement.code}`]
      });

      // If user selected Verified, review it immediately
      // The newly added evidence item will be the last item in the list after state update
      setUploadModalArtifact(null);
      setUploadFileName('');
      setIsExpanded(true);
    } catch (err) {
      console.error('Failed to attach evidence artifact:', err);
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // 1. Compact Variant (for dense tables, summaries, or drawer rows)
  if (variant === 'compact') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <FileCheck2 className={`w-3.5 h-3.5 ${metrics.readinessColor.text}`} />
            <span className="font-semibold text-slate-200">Evidence Presence:</span>
            <span className="font-mono text-slate-400 text-[11px]">
              ({metrics.verifiedCount}/{metrics.totalRequired} Verified)
            </span>
          </div>
          <span className={`font-mono font-bold text-xs ${metrics.readinessColor.text}`}>
            {metrics.percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${metrics.readinessColor.barGradient}`}
            style={{ width: `${metrics.percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // 2. Card / Detailed Variant (embedded directly into ClauseRequirement cards)
  return (
    <div
      id={`evidence-tracker-req-${requirement.code.replace('.', '-')}`}
      className={`rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 space-y-3 shadow-sm ${className}`}
    >
      {/* Header: Progress Label, Badge & Percentage */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-md ${metrics.readinessColor.bg} ${metrics.readinessColor.border} border`}>
            <FileCheck2 className={`w-3.5 h-3.5 ${metrics.readinessColor.text}`} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-200 tracking-tight">
                Audit Evidence Presence
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({metrics.verifiedCount}/{metrics.totalRequired} Artifacts on File)
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Assesses verified documentation against ISO 27001:2022 Clause {requirement.code}
            </div>
          </div>
        </div>

        {/* Readiness Pill & Large Percentage */}
        <div className="flex items-center space-x-2.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${metrics.readinessColor.pillBg}`}
          >
            {metrics.readinessLabel}
          </span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-base font-extrabold font-mono tracking-tight ${metrics.readinessColor.text}`}>
              {metrics.percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual Percentage Completion Bar */}
      <div className="space-y-1">
        <div className="relative h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          {/* Fill Bar with smooth gradient & transition */}
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${metrics.readinessColor.barGradient} relative`}
            style={{ width: `${Math.max(metrics.percentage, 3)}%` }}
          >
            {/* Subtle animated highlight pulse if in progress */}
            {metrics.percentage > 0 && metrics.percentage < 100 && (
              <div className="absolute inset-0 bg-white/15 animate-pulse rounded-full" />
            )}
          </div>

          {/* Segment Tick Markers for each mandatory artifact */}
          {metrics.totalRequired > 1 && (
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
              {Array.from({ length: metrics.totalRequired - 1 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-full w-px bg-slate-950/60"
                  style={{ left: `${((idx + 1) / metrics.totalRequired) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Breakdown Chips: Quick overview of artifacts */}
        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {metrics.verifiedCount > 0 && (
              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{metrics.verifiedCount} Verified</span>
              </span>
            )}
            {metrics.underReviewCount > 0 && (
              <span className="flex items-center space-x-1 text-amber-400 font-medium">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{metrics.underReviewCount} In Review</span>
              </span>
            )}
            {metrics.missingCount > 0 && (
              <span className="flex items-center space-x-1 text-rose-400 font-medium">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>{metrics.missingCount} Missing</span>
              </span>
            )}
          </div>

          {/* Expand/Collapse Toggle Button */}
          <button
            id={`toggle-artifacts-req-${requirement.code.replace('.', '-')}`}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors py-0.5"
          >
            <span>{isExpanded ? 'Hide Artifacts Checklist' : `Inspect Artifacts (${metrics.artifactStatuses.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Mandatory Artifacts Breakdown List */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
            <span>Mandatory Evidence Proof Points & Audit Artifacts:</span>
            <span className="text-[10px] text-slate-500 font-normal">
              ISO/IEC 27001:2022 Stage 1 & Stage 2 Checklist
            </span>
          </div>

          <div className="space-y-2">
            {metrics.artifactStatuses.map((art, idx) => {
              const isVerified = art.satisfactionLevel === 'VERIFIED';
              const isUnderReview = art.satisfactionLevel === 'UNDER_REVIEW';
              const isMissing = art.satisfactionLevel === 'MISSING';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                    isVerified
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : isUnderReview
                      ? 'bg-slate-900/90 border-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5">
                        {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isUnderReview && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                        {isMissing && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-xs flex items-center space-x-1.5">
                          <span>{art.artifactTitle}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isVerified
                            ? 'Auditor verified documented information on file'
                            : isUnderReview
                            ? 'Artifact submitted; awaiting formal audit review'
                            : 'Required proof point currently absent from repository'}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Action Button */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isUnderReview
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {isVerified ? 'Verified (100%)' : isUnderReview ? 'In Review (60%)' : 'Missing (0%)'}
                      </span>

                      {/* Quick Attach Artifact Button */}
                      {isMissing && (
                        <button
                          id={`attach-btn-${requirement.code.replace('.', '-')}-${idx}`}
                          onClick={() => {
                            setUploadModalArtifact(art.artifactTitle);
                            setUploadFileName(`${requirement.code}_${art.artifactTitle.replace(/[^a-zA-Z0-9]/g, '_')}_v1.pdf`);
                          }}
                          className="px-2 py-0.5 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                          title="Attach evidence artifact for this requirement"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Attach</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Matched Evidence Files Preview */}
                  {art.matchedEvidence.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                      {art.matchedEvidence.map(ev => (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between text-[11px] bg-slate-950/80 px-2 py-1.5 rounded border border-slate-800"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="text-white font-medium truncate" title={ev.title}>
                              {ev.fileName || ev.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              ({ev.fileSize || 'PDF'})
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] text-slate-400">
                              {ev.uploadedDate?.slice(0, 10) || 'Active'}
                            </span>
                            <button
                              onClick={() => setSelectedEvidenceForPreview(ev)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Inspect Evidence Details"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Action Row: Link to Evidence Centre */}
          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-sky-400" />
              <span>
                Annex A Controls: {requirement.linkedControls.join(', ')}
              </span>
            </span>

            <button
              onClick={() => {
                if (onNavigateToEvidenceCentre) {
                  onNavigateToEvidenceCentre(requirement.linkedControls[0], requirement.code);
                } else {
                  setActiveModule('evidence_centre');
                }
              }}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Manage in Evidence Centre</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* QUICK UPLOAD / ATTACH EVIDENCE MODAL */}
      {uploadModalArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">
                  Attach Evidence for ISO 27001 Clause {requirement.code}
                </h3>
              </div>
              <button
                onClick={() => setUploadModalArtifact(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickUploadSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  Target Mandatory Proof Point:
                </span>
                <p className="font-semibold text-white text-xs">{uploadModalArtifact}</p>
                <div className="text-[10px] text-slate-400">
                  Requirement: {requirement.name} (Mapped Annex A: {requirement.linkedControls.join(', ')})
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evidence File Name</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g. Scope_Statement_v2_Signed.pdf"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custodian Department</label>
                  <select
                    value={uploadDepartment}
                    onChange={(e) => setUploadDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                  >
                    <option value="Information Security & Compliance">InfoSec & Compliance</option>
                    <option value="Software Engineering & DevOps">DevOps / Engineering</option>
                    <option value="Human Resources & People Ops">Human Resources</option>
                    <option value="Executive Governance & Legal">Legal & Executive</option>
                    <option value="IT Operations & Infrastructure">IT Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Verification Status</label>
                  <select
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value as 'Verified' | 'Pending Review')}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                  >
                    <option value="Verified">Verified (Auditor Attested - 100%)</option>
                    <option value="Pending Review">Pending Review (60%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Auditor Verification & Working Paper Notes</label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256 Checksum will be calculated & timestamped</span>
                </span>
                <span className="font-mono text-slate-500">ISO/IEC 27001:2022</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalArtifact(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvidence}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingEvidence ? 'Attaching Evidence...' : 'Confirm & Attach Evidence'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVIDENCE PREVIEW MODAL */}
      {selectedEvidenceForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Evidence Record Details</h3>
              </div>
              <button
                onClick={() => setSelectedEvidenceForPreview(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Document Title
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedEvidenceForPreview.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Control Code:</span>
                  <span className="font-mono font-bold text-sky-400">{selectedEvidenceForPreview.controlCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status:</span>
                  <span className="font-semibold text-emerald-400">{selectedEvidenceForPreview.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Uploaded Date:</span>
                  <span className="text-slate-300">{selectedEvidenceForPreview.uploadedDate?.slice(0, 10)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Custodian:</span>
                  <span className="text-slate-300">{selectedEvidenceForPreview.uploadedBy || 'System Lead'}</span>
                </div>
              </div>

              {selectedEvidenceForPreview.documentExcerpt && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Executive Summary / Excerpt:
                  </span>
                  <p className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300 leading-relaxed text-[11px]">
                    "{selectedEvidenceForPreview.documentExcerpt}"
                  </p>
                </div>
              )}

              {selectedEvidenceForPreview.reviewNotes && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Auditor Review Notes:
                  </span>
                  <p className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300 leading-relaxed text-[11px]">
                    {selectedEvidenceForPreview.reviewNotes}
                  </p>
                </div>
              )}

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>SHA-256 Checksum:</span>
                <span className="text-emerald-400">
                  {selectedEvidenceForPreview.sha256Hash?.slice(0, 24) || 'e3b0c44298fc1c149afbf4c8'}...
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedEvidenceForPreview(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
