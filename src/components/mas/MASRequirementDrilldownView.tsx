import React, { useState, useMemo } from 'react';
import {
  FolderCheck,
  AlertTriangle,
  CheckSquare,
  FileText,
  CheckCircle2,
  Clock,
  Hash,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Server,
  ShieldAlert,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  AlertOctagon,
  ArrowRight,
  Info,
  Wrench,
  Sparkles,
  Tag,
  Zap,
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';
import { EvidenceRecord, FindingCAPARecord } from '../../types';
import { UnifiedRemediationItem } from '../../types/remediation';
import { EnrichedMASRequirement } from './ComplianceGapVisualization';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  generateRequirementGapRecommendation,
  EvidenceVaultMatch,
  PrescribedEvidenceTemplate
} from '../../services/evidenceRecommendationEngine';

export interface MASRequirementDrilldownViewProps {
  requirement: EnrichedMASRequirement;
  onOpenEvidenceVault: (req: EnrichedMASRequirement) => void;
  onUploadProof: (req: EnrichedMASRequirement) => void;
  onNavigateToFindingCAPA: (findingCode: string) => void;
  onCopyHash: (hash: string) => void;
  copiedHash: string | null;
  unifiedRemediations?: UnifiedRemediationItem[];
  allFindings?: FindingCAPARecord[];
  compact?: boolean;
}

export const MASRequirementDrilldownView: React.FC<MASRequirementDrilldownViewProps> = ({
  requirement,
  onOpenEvidenceVault,
  onUploadProof,
  onNavigateToFindingCAPA,
  onCopyHash,
  copiedHash,
  unifiedRemediations = [],
  allFindings = [],
  compact = false
}) => {
  const {
    evidence,
    masAssessments,
    updateMASAssessment,
    uploadEvidence,
    logAuditEvent
  } = useGRC();
  const { showToast } = useToast();

  const isGap = requirement.complianceStatusBadge === 'Deficient' || requirement.complianceStatusBadge === 'Pending Evidence';
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'FINDINGS' | 'CAPA' | 'GUIDANCE' | 'RECOMMENDATIONS'>(
    isGap ? 'RECOMMENDATIONS' : 'EVIDENCE'
  );
  const [selectedHashCopied, setSelectedHashCopied] = useState<string | null>(null);
  const [linkingEvidenceId, setLinkingEvidenceId] = useState<string | null>(null);
  const [scaffoldingTemplateId, setScaffoldingTemplateId] = useState<string | null>(null);

  // Derive linked evidence IDs from assessment record
  const matchingAssessment = useMemo(() => {
    return masAssessments.find(
      (a) => a.requirementCode === requirement.requirementCode || a.id.includes(requirement.requirementCode)
    );
  }, [masAssessments, requirement.requirementCode]);

  // Derive automated evidence recommendations for bridging Deficient / Pending Evidence gap
  const gapRecommendation = useMemo(() => {
    return generateRequirementGapRecommendation(
      requirement,
      evidence,
      matchingAssessment?.linkedEvidenceIds || []
    );
  }, [requirement, evidence, matchingAssessment]);

  // Handler: Link EvidenceVault item to bridge gap
  const handleLinkEvidenceToRequirement = async (match: EvidenceVaultMatch) => {
    try {
      setLinkingEvidenceId(match.evidence.id);
      if (matchingAssessment) {
        const existingIds = matchingAssessment.linkedEvidenceIds || [];
        if (!existingIds.includes(match.evidence.id)) {
          updateMASAssessment(matchingAssessment.id, {
            linkedEvidenceIds: [...existingIds, match.evidence.id],
            complianceStatus: matchingAssessment.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : matchingAssessment.complianceStatus
          });
        }
      }

      logAuditEvent(
        'UPDATE',
        'AUTOMATED_EVIDENCE_RECOMMENDER',
        `Linked EvidenceVault item "${match.evidence.title}" (${match.evidence.id}) to ${requirement.requirementCode} via drilldown recommender.`
      );

      showToast({
        type: 'success',
        title: 'Evidence Gap Bridged',
        message: `Successfully mapped "${match.evidence.title}" to ${requirement.requirementCode}. Projected +${match.projectedReadinessUplift}% readiness uplift applied.`
      });
    } catch (err) {
      console.error('Failed to link evidence in drilldown:', err);
      showToast({
        type: 'error',
        title: 'Linking Failed',
        message: 'Could not associate evidence artifact to assessment.'
      });
    } finally {
      setLinkingEvidenceId(null);
    }
  };

  // Handler: Scaffold prescribed template into EvidenceVault
  const handleScaffoldTemplate = async (template: PrescribedEvidenceTemplate) => {
    try {
      setScaffoldingTemplateId(template.templateId);
      await uploadEvidence({
        title: template.title,
        controlCode: template.controlCode,
        department: template.department,
        fileName: template.suggestedFileName,
        fileSize: '1.4 MB (Scaffolded)',
        fileType: template.suggestedFileType,
        tags: [...template.tags, requirement.requirementCode, 'AI-Scaffolded-Request'],
        initialStatus: 'Pending Review',
        documentExcerpt: `Automated compliance request scaffolded to bridge regulatory gap for ${requirement.requirementCode}. Prescribed mandatory safeguards: ${template.mandatorySafeguards.join('; ')}.`
      });

      logAuditEvent(
        'CREATE',
        'EVIDENCE_VAULT_SCAFFOLD',
        `Scaffolded evidence placeholder "${template.title}" in EvidenceVault to remediate ${requirement.requirementCode}.`
      );

      showToast({
        type: 'success',
        title: 'Evidence Request Scaffolded',
        message: `Created placeholder "${template.title}" in EvidenceVault and assigned to ${template.department}.`
      });
    } catch (err) {
      console.error('Failed to scaffold template:', err);
      showToast({
        type: 'error',
        title: 'Scaffolding Failed',
        message: 'Could not create evidence request in EvidenceVault.'
      });
    } finally {
      setScaffoldingTemplateId(null);
    }
  };

  // Derive all associated evidence items specifically for this requirement ID
  const associatedEvidence: EvidenceRecord[] = requirement.associatedEvidence || [];
  const verifiedEvidence = associatedEvidence.filter(
    (e) => e.verificationState === 'Verified' || e.status === 'Verified'
  );
  const pendingEvidence = associatedEvidence.filter(
    (e) => e.verificationState !== 'Verified' && e.status !== 'Verified'
  );

  // Derive all associated findings specifically for this requirement ID
  const associatedFindings: FindingCAPARecord[] = React.useMemo(() => {
    const directFindings = requirement.openFindings || [];
    const extraFindings = (allFindings || []).filter((f) => {
      if (directFindings.some((df) => df.id === f.id || df.findingCode === f.findingCode)) return false;
      const clause = (f.clauseOrControl || '').toLowerCase();
      const text = `${f.title} ${f.description || ''}`.toLowerCase();
      const reqCode = requirement.requirementCode.toLowerCase();
      return clause.includes(reqCode) || text.includes(reqCode);
    });
    return [...directFindings, ...extraFindings];
  }, [requirement, allFindings]);

  // Derive CAPA items specifically for this requirement ID
  const capaRecords = React.useMemo(() => {
    const list: Array<{
      id: string;
      findingCode: string;
      findingTitle: string;
      severity: string;
      findingStatus: string;
      correctiveAction: string;
      preventiveAction: string;
      rootCauseStatement?: string;
      rootCauseMethodology?: string;
      owner: string;
      targetDate: string;
      implementationStatus: string;
      evidenceRequired?: string;
      independentAuditValidation?: any;
      unifiedRemediation?: UnifiedRemediationItem;
    }> = [];

    associatedFindings.forEach((finding) => {
      if (finding.capaPlan) {
        // Find matching unified remediation if available
        const matchedRem = unifiedRemediations.find(
          (rem) =>
            rem.sourceEntityId === finding.id ||
            rem.sourceRefCode?.includes(requirement.requirementCode) ||
            rem.sourceRefCode?.includes(finding.findingCode) ||
            rem.title.toLowerCase().includes(requirement.requirementCode.toLowerCase())
        );

        list.push({
          id: `capa-${finding.id}`,
          findingCode: finding.findingCode,
          findingTitle: finding.title,
          severity: finding.severity,
          findingStatus: finding.status,
          correctiveAction: finding.capaPlan.correctiveAction,
          preventiveAction: finding.capaPlan.preventiveAction,
          rootCauseStatement: finding.rootCauseAnalysis?.rootCauseStatement,
          rootCauseMethodology: finding.rootCauseAnalysis?.methodology,
          owner: finding.capaPlan.owner,
          targetDate: finding.capaPlan.targetDate,
          implementationStatus: finding.capaPlan.implementationStatus || 'In Progress',
          evidenceRequired: finding.capaPlan.evidenceRequired,
          independentAuditValidation: finding.independentAuditValidation,
          unifiedRemediation: matchedRem
        });
      }
    });

    // Check if there are unified remediations matching without a direct finding
    unifiedRemediations.forEach((rem) => {
      const matchesReq =
        rem.sourceRefCode?.includes(requirement.requirementCode) ||
        rem.title.toLowerCase().includes(requirement.requirementCode.toLowerCase()) ||
        rem.linkedControls?.includes(requirement.requirementCode);

      if (matchesReq && !list.some((c) => c.unifiedRemediation?.id === rem.id)) {
        list.push({
          id: `capa-rem-${rem.id}`,
          findingCode: rem.remediationCode,
          findingTitle: rem.title,
          severity: rem.severity,
          findingStatus: rem.status,
          correctiveAction: rem.correctiveActionPlan || rem.proposedActionPlan || 'Remediate elevated access controls and deploy time-bound JIT revocation.',
          preventiveAction: rem.preventiveActionPlan || 'Enforce continuous policy-as-code guardrails and automate quarterly audit verification.',
          rootCauseStatement: rem.rootCauseAnalysis || rem.threatOrGapSummary,
          owner: rem.assignedOwner || 'CISO / Tech Risk Lead',
          targetDate: rem.targetResolutionDate || rem.slaDueDate || '2026-09-30',
          implementationStatus: rem.status === 'CLOSED_VERIFIED' ? 'Implemented' : 'In Progress',
          unifiedRemediation: rem
        });
      }
    });

    return list;
  }, [associatedFindings, unifiedRemediations, requirement]);

  const handleCopy = (hash: string) => {
    onCopyHash(hash);
    setSelectedHashCopied(hash);
    setTimeout(() => {
      setSelectedHashCopied(null);
    }, 2000);
  };

  return (
    <div className="bg-slate-950/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl space-y-0 text-left">
      {/* Top Banner: Requirement Summary & Statutory Crosswalk */}
      <div className="bg-slate-900/95 border-b border-slate-800 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {requirement.requirementCode}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  requirement.riskTier === 'HIGH_RISK'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : requirement.riskTier === 'MEDIUM_RISK'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {requirement.riskTier.replace(/_/g, ' ')}
              </span>
              {requirement.criticalSystemsMandate && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                  <Server className="w-3 h-3 text-sky-400" />
                  Notice 644 Critical Systems
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-mono">
                {requirement.statutoryMandateType.replace(/_/g, ' ')}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">
              {requirement.title}
            </h4>
            <p className="text-xs text-slate-400">
              Domain {requirement.domainNumber}: {requirement.domainName}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onUploadProof(requirement)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              Upload Proof
            </button>
            <button
              onClick={() => onOpenEvidenceVault(requirement)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <FolderCheck className="w-3.5 h-3.5" />
              Vault ({associatedEvidence.length})
            </button>
          </div>
        </div>

        {/* Readiness and Risk Score Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-400">Readiness Score</div>
            <div className={`text-base font-bold font-mono ${
              requirement.readinessScore >= 80 ? 'text-emerald-400' : requirement.readinessScore >= 60 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {requirement.readinessScore}%
            </div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-400">Vault Evidence Items</div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {associatedEvidence.length} <span className="text-[11px] text-slate-400 font-normal">({verifiedEvidence.length} Verified)</span>
            </div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-400">Audit Non-Conformities</div>
            <div className={`text-base font-bold font-mono ${
              associatedFindings.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {associatedFindings.length} <span className="text-[11px] text-slate-400 font-normal">Open</span>
            </div>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-400">CAPA Corrective Plans</div>
            <div className="text-base font-bold text-purple-300 font-mono">
              {capaRecords.length} <span className="text-[11px] text-slate-400 font-normal">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Tabs for Drilldown */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('RECOMMENDATIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'RECOMMENDATIONS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : isGap
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/60'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGap ? 'text-amber-300 animate-pulse' : 'text-indigo-400'}`} />
            <span>AI Recommendations</span>
            {gapRecommendation && gapRecommendation.matchedVaultItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-900/80 text-indigo-200 border border-indigo-400/40 font-bold">
                {gapRecommendation.matchedVaultItems.length} Match{gapRecommendation.matchedVaultItems.length > 1 ? 'es' : ''}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'EVIDENCE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Evidence Vault</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-200 border border-emerald-500/30">
              {associatedEvidence.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('FINDINGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'FINDINGS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            <span>Findings</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950/60 text-rose-200 border border-rose-500/30">
              {associatedFindings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CAPA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'CAPA'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-purple-300" />
            <span>CAPA Records</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950/60 text-purple-200 border border-purple-500/30">
              {capaRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('GUIDANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'GUIDANCE'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-300" />
            <span>Statutory Guidance</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          ISO 27001 Crosswalk: <strong className="text-sky-300">{requirement.crossFrameworkMappings?.iso27001?.join(', ') || 'Annex A.5.15'}</strong>
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="p-4 bg-slate-900/30 space-y-4">
        {/* ========================================================================= */}
        {/* TAB 0: AUTOMATED EVIDENCE RECOMMENDATION ENGINE                           */}
        {/* ========================================================================= */}
        {activeTab === 'RECOMMENDATIONS' && (
          <div className="space-y-4">
            {gapRecommendation ? (
              <>
                {/* Gap Condition & Supervisory Assessment Banner */}
                <div className="bg-slate-900 border border-indigo-900/50 rounded-xl p-4 relative overflow-hidden shadow-lg">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Automated Gap Remediation Engine
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gapRecommendation.overallGapBridgeability === 'IMMEDIATE_VAULT_WIN'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : gapRecommendation.overallGapBridgeability === 'REFRESH_REQUIRED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}>
                          {gapRecommendation.overallGapBridgeability === 'IMMEDIATE_VAULT_WIN'
                            ? '⚡ Immediate Vault Win'
                            : gapRecommendation.overallGapBridgeability === 'REFRESH_REQUIRED'
                            ? '⏳ Verification Refresh Needed'
                            : '📋 New Collection Required'}
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {gapRecommendation.statutoryMandateNote}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-white leading-snug">
                        Gap Bridging Rationale for {requirement.requirementCode}
                      </h5>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        {gapRecommendation.primaryDeficiencyReason}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-indigo-900/60 rounded-lg p-3 text-right shrink-0">
                      <div className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                        Projected Readiness Uplift
                      </div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                        +{gapRecommendation.topMatch?.projectedReadinessUplift || gapRecommendation.prescribedTemplate.potentialReadinessUplift}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {requirement.readinessScore}% &rarr;{' '}
                        <span className="text-emerald-300 font-semibold font-mono">
                          {Math.min(
                            100,
                            requirement.readinessScore +
                              (gapRecommendation.topMatch?.projectedReadinessUplift ||
                                gapRecommendation.prescribedTemplate.potentialReadinessUplift)
                          )}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Matched EvidenceVault Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FolderCheck className="w-4 h-4 text-emerald-400" />
                      <span>Matching Artifacts Discovered in EvidenceVault</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {gapRecommendation.matchedVaultItems.length} candidate{gapRecommendation.matchedVaultItems.length !== 1 ? 's' : ''}
                      </span>
                    </h5>
                    <button
                      onClick={() => onOpenEvidenceVault(requirement)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <span>Explore EvidenceVault</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {gapRecommendation.matchedVaultItems.length === 0 ? (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center space-y-2">
                      <FileCheck className="w-7 h-7 text-slate-500 mx-auto" />
                      <div className="text-xs font-semibold text-slate-300">
                        No pre-existing EvidenceVault artifacts reached the &ge; 40% correlation threshold
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                        Scaffold a structured evidence collection request below to notify the responsible department to upload the prescribed audit packet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {gapRecommendation.matchedVaultItems.map((match) => {
                        const isVerified =
                          match.evidence.verificationState === 'Verified' ||
                          match.evidence.status === 'Verified';
                        const isLinking = linkingEvidenceId === match.evidence.id;

                        return (
                          <div
                            key={match.evidence.id}
                            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                      match.confidenceScore >= 80
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : match.confidenceScore >= 60
                                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    }`}
                                  >
                                    {match.confidenceScore}% Vault Match
                                  </span>

                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      isVerified
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    }`}
                                  >
                                    {isVerified ? 'Verified Auditor-Grade' : 'Pending Verification'}
                                  </span>

                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {match.evidence.fileName} &bull; {match.evidence.department}
                                  </span>
                                </div>

                                <h6 className="text-sm font-bold text-white pt-0.5">
                                  {match.evidence.title}
                                </h6>
                              </div>

                              {/* Action Button: Link Evidence to Requirement */}
                              <div className="shrink-0 flex items-center gap-2">
                                {match.recommendedAction === 'LINK_EXISTING_EVIDENCE' ? (
                                  <button
                                    onClick={() => handleLinkEvidenceToRequirement(match)}
                                    disabled={isLinking}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer transition-all disabled:opacity-50"
                                  >
                                    <Zap className={`w-3.5 h-3.5 ${isLinking ? 'animate-spin' : 'text-amber-300'}`} />
                                    <span>
                                      {isLinking ? 'Bridging Gap...' : `Link to Bridge Gap (+${match.projectedReadinessUplift}%)`}
                                    </span>
                                  </button>
                                ) : match.recommendedAction === 'ALREADY_LINKED' ? (
                                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Linked in Vault</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => onOpenEvidenceVault(requirement)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/40 flex items-center gap-1.5 transition-colors"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Verify in Vault</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Correlation Rationale */}
                            <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                              <strong className="text-indigo-300">Matching Intelligence:</strong> {match.gapBridgingRationale}
                            </p>

                            {/* Correlation Factor Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1">
                                Correlation Factors:
                              </span>
                              {match.matchingFactors.controlCodeMatch && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  ✓ Control Code Match (+30%)
                                </span>
                              )}
                              {match.matchingFactors.isoControlMatched && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  ✓ ISO 27001 Crosswalk ({match.matchingFactors.isoControlMatched}) (+25%)
                                </span>
                              )}
                              {match.matchingFactors.departmentAlignment && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  ✓ Dept Synergy: {match.evidence.department} (+10%)
                                </span>
                              )}
                              {match.matchingFactors.verificationStatusBonus > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                  ✓ Cryptographically Verified (+{match.matchingFactors.verificationStatusBonus}%)
                                </span>
                              )}
                              {match.matchingFactors.keywordMatches.map((kw) => (
                                <span
                                  key={kw}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                                >
                                  #{kw}
                                </span>
                              ))}
                            </div>

                            {/* Cryptographic SHA-256 seal info */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                              <span className="truncate max-w-sm">
                                SHA-256: {match.evidence.sha256Hash || match.evidence.auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopy(
                                    match.evidence.sha256Hash ||
                                      match.evidence.auditHash ||
                                      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                                  )
                                }
                                className="text-sky-400 hover:text-sky-300 shrink-0 ml-2"
                              >
                                {selectedHashCopied ===
                                (match.evidence.sha256Hash || match.evidence.auditHash)
                                  ? 'Copied'
                                  : 'Copy Hash'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 2: Prescribed Gold-Standard Evidence Collection Template */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Prescribed Collection Template
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {gapRecommendation.prescribedTemplate.department} &bull; Cadence: {gapRecommendation.prescribedTemplate.recommendedCadence}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white pt-0.5">
                        {gapRecommendation.prescribedTemplate.title}
                      </h5>
                    </div>

                    <button
                      onClick={() => handleScaffoldTemplate(gapRecommendation.prescribedTemplate)}
                      disabled={scaffoldingTemplateId === gapRecommendation.prescribedTemplate.templateId}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow transition-all shrink-0 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {scaffoldingTemplateId === gapRecommendation.prescribedTemplate.templateId
                          ? 'Scaffolding...'
                          : 'Scaffold Request in Vault'}
                      </span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {gapRecommendation.prescribedTemplate.rationale}
                  </p>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                    <div className="text-[11px] font-semibold text-slate-300">
                      Mandatory Safeguards to Validate in Document Excerpt:
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-slate-400 text-[11px]">
                      {gapRecommendation.prescribedTemplate.mandatorySafeguards.map((safeguard, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{safeguard}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="font-mono">
                      Suggested File: <strong className="text-slate-200">{gapRecommendation.prescribedTemplate.suggestedFileName}</strong>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Potential Readiness Uplift: +{gapRecommendation.prescribedTemplate.potentialReadinessUplift}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Requirement is Compliant / Under Review */
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">No Compliance Deficiencies Detected</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Requirement <strong className="text-white">{requirement.requirementCode}</strong> is currently evaluated with status{' '}
                  <span className="text-emerald-400 font-semibold">{requirement.complianceStatusBadge}</span> and readiness score{' '}
                  <span className="font-mono font-bold text-emerald-300">{requirement.readinessScore}%</span>.
                  The automated recommendation engine operates when requirements are flagged as <em>Deficient</em> or <em>Pending Evidence</em> to bridge audit coverage gaps.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('EVIDENCE')}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                  >
                    View Associated Evidence ({associatedEvidence.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: EVIDENCE VAULT ITEMS                                                */}
        {/* ========================================================================= */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-300">
                <strong className="text-white">Evidence Vault Integrity:</strong> Displaying all artifacts linked specifically to{' '}
                <code className="text-rose-400 font-mono">{requirement.requirementCode}</code>.
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {verifiedEvidence.length} Verified &bull; {pendingEvidence.length} Pending Review
              </span>
            </div>

            {associatedEvidence.length === 0 ? (
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 text-center space-y-2.5">
                <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">Evidence Gap Detected for {requirement.requirementCode}</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Zero verified auditor-grade artifacts are currently linked to this statutory requirement in the Evidence Vault.
                  Upload your operational policy, access review audit log, or architecture diagram to close this gap.
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    onClick={() => onUploadProof(requirement)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Required Artifact
                  </button>
                  <button
                    onClick={() => onOpenEvidenceVault(requirement)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Search Entire Vault
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {associatedEvidence.map((art) => {
                  const isVerified = art.verificationState === 'Verified' || art.status === 'Verified';
                  const currentHash = art.sha256Hash || art.auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

                  return (
                    <div
                      key={art.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                isVerified
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {isVerified ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Verified Auditor-Grade
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  Pending Review
                                </>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">v{art.version || '1.0'}</span>
                          </div>
                          <h5 className="text-xs font-bold text-white line-clamp-1">{art.title}</h5>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {art.fileName} &bull; {art.fileSize || '2.4 MB'} &bull; {art.department || 'Security & Compliance'}
                          </p>
                        </div>

                        <button
                          onClick={() => onOpenEvidenceVault(requirement)}
                          title="Open in Evidence Vault"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                      </div>

                      {art.documentExcerpt && (
                        <div className="text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-800 italic">
                          "{art.documentExcerpt}"
                        </div>
                      )}

                      {/* Cryptographic SHA-256 Hash */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Hash className="w-3 h-3 text-emerald-400" /> SHA-256 Digest Seal
                          </span>
                          <button
                            onClick={() => handleCopy(currentHash)}
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                          >
                            {selectedHashCopied === currentHash || copiedHash === currentHash ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Hash
                              </>
                            )}
                          </button>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded truncate border border-slate-800/80">
                          {currentHash}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Uploaded: {art.uploadedBy || 'System Admin'}</span>
                        <span>Exp: {art.expiryDate || '2027-08-30'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AUDIT FINDINGS                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'FINDINGS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-300">
                <strong className="text-white">Audit Non-Conformities:</strong> Traceable gaps identified by internal or external auditors.
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {associatedFindings.length} Total Finding{associatedFindings.length !== 1 ? 's' : ''}
              </span>
            </div>

            {associatedFindings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">Zero Non-Conformities Logged</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No open audit non-conformities or observations are currently active against{' '}
                  <strong className="text-white">{requirement.requirementCode}</strong>. Control execution meets current regulatory expectations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {associatedFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-colors shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                          {finding.findingCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            finding.severity === 'Major Non-Conformity'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : finding.severity === 'Minor Non-Conformity'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-xs text-slate-400">
                          Status: <strong className="text-white">{finding.status}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigateToFindingCAPA(finding.findingCode)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      >
                        <span>Open in CAPA Desk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-white">{finding.title}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                      <div className="text-slate-400">
                        <span>Source: </span>
                        <strong className="text-slate-200">{finding.source?.replace(/_/g, ' ') || 'Internal Audit'}</strong>
                      </div>
                      <div className="text-slate-400">
                        <span>Raised By: </span>
                        <strong className="text-slate-200">{finding.raisedBy} ({finding.raisedDate})</strong>
                      </div>
                    </div>

                    {finding.rootCauseAnalysis && (
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-400" />
                            Root Cause Analysis ({finding.rootCauseAnalysis.methodology || '5-Whys'})
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {finding.rootCauseAnalysis.rootCauseStatement}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CAPA RECORDS (Corrective and Preventive Action)                      */}
        {/* ========================================================================= */}
        {activeTab === 'CAPA' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-300">
                <strong className="text-white">CAPA Action Register:</strong> Structured Corrective & Preventive Action plans linked to this requirement ID.
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {capaRecords.length} Active Plan{capaRecords.length !== 1 ? 's' : ''}
              </span>
            </div>

            {capaRecords.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">No Active Corrective Action Plans</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are no pending CAPA remediation records for{' '}
                  <strong className="text-white">{requirement.requirementCode}</strong>. The organization's operating controls are currently effective.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {capaRecords.map((capa) => (
                  <div
                    key={capa.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 shadow-md"
                  >
                    {/* Header: Finding Reference, Severity & Target Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                          {capa.findingCode}
                        </span>
                        <span className="text-xs font-semibold text-white">{capa.findingTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {capa.implementationStatus}
                        </span>
                        <button
                          onClick={() => onNavigateToFindingCAPA(capa.findingCode)}
                          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <span>Manage CAPA</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dual Action: Corrective (Immediate) vs Preventive (Long-Term) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Corrective Action */}
                      <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                          <span>Corrective Action (Containment & Direct Fix):</span>
                        </div>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          {capa.correctiveAction}
                        </p>
                      </div>

                      {/* Preventive Action */}
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Preventive Action (Systemic Governance):</span>
                        </div>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          {capa.preventiveAction}
                        </p>
                      </div>
                    </div>

                    {/* Ownership, SLA Countdown & Milestones */}
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Owner: <strong className="text-white">{capa.owner}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target: <strong className="text-white">{capa.targetDate}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>SLA: <strong className="text-purple-300">Within Regulatory Mandate</strong></span>
                        </div>
                      </div>

                      {capa.evidenceRequired && (
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          <span className="text-slate-300 font-medium">Auditor Closure Requirement: </span>
                          <span>{capa.evidenceRequired}</span>
                        </div>
                      )}

                      {/* If Unified Remediation has Milestones */}
                      {capa.unifiedRemediation?.milestones && capa.unifiedRemediation.milestones.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                            Remediation Milestones:
                          </span>
                          <div className="space-y-1">
                            {capa.unifiedRemediation.milestones.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                              >
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  {m.isCompleted ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-amber-400" />
                                  )}
                                  <span>{m.title}</span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{m.targetDate}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Independent Auditor Validation (if logged) */}
                    {capa.independentAuditValidation && (
                      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Independent Auditor Validation Signed
                          </span>
                          <span className="text-slate-400 font-mono">
                            {capa.independentAuditValidation.validationDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic">
                          "{capa.independentAuditValidation.auditorObservations || capa.independentAuditValidation.effectivenessConclusion}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STATUTORY GUIDANCE & MAPPINGS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'GUIDANCE' && (
          <div className="space-y-3 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                Official MAS Statutory Statement
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {requirement.statement}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                MAS Supervisory Intent & Guidance
              </span>
              <p className="text-slate-300 leading-relaxed">
                {requirement.intentAndGuidance}
              </p>
              <div className="text-[11px] text-rose-400 font-mono pt-1">
                Statutory Reference: {requirement.regulatorySourceRef}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsible Enterprise Roles:</span>
                <p className="text-slate-200">{requirement.responsibleRoles?.join(', ') || 'Board of Directors, CISO, Head of Technology Risk'}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">ISO/IEC 27001 Crosswalk:</span>
                <p className="text-sky-300 font-mono">{requirement.crossFrameworkMappings?.iso27001?.join(', ') || 'Annex A.5.15 Access Control'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
