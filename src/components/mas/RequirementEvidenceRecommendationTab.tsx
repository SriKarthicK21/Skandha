import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  FolderCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Link as LinkIcon,
  Check,
  AlertTriangle,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { EnrichedMASRequirement } from './ComplianceGapVisualization';
import {
  generateRequirementGapRecommendation,
  EvidenceVaultMatch,
  PrescribedEvidenceTemplate
} from '../../services/evidenceRecommendationEngine';

interface RequirementEvidenceRecommendationTabProps {
  requirement: EnrichedMASRequirement;
  onOpenEvidenceVault?: (req: EnrichedMASRequirement) => void;
  onRefreshCalculations?: () => void;
}

export const RequirementEvidenceRecommendationTab: React.FC<RequirementEvidenceRecommendationTabProps> = ({
  requirement,
  onOpenEvidenceVault,
  onRefreshCalculations
}) => {
  const {
    evidence,
    masAssessments,
    updateMASAssessment,
    uploadEvidence,
    logAuditEvent
  } = useGRC();

  const { showToast } = useToast();

  const [linkingEvidenceId, setLinkingEvidenceId] = useState<string | null>(null);
  const [isScaffolding, setIsScaffolding] = useState(false);

  // Compute recommendation for this specific requirement
  const recommendation = useMemo(() => {
    const assess = masAssessments.find(
      (a) => a.requirementCode === requirement.requirementCode || a.id.includes(requirement.requirementCode)
    );
    const linkedEvidenceIds = assess?.linkedEvidenceIds || [];
    return generateRequirementGapRecommendation(requirement, evidence, linkedEvidenceIds);
  }, [requirement, evidence, masAssessments]);

  // Handle linking evidence
  const handleLink = async (match: EvidenceVaultMatch) => {
    try {
      setLinkingEvidenceId(match.evidence.id);

      const assess = masAssessments.find(
        (a) => a.requirementCode === requirement.requirementCode || a.id.includes(requirement.requirementCode)
      );

      if (assess) {
        const existingIds = assess.linkedEvidenceIds || [];
        if (!existingIds.includes(match.evidence.id)) {
          updateMASAssessment(assess.id, {
            linkedEvidenceIds: [...existingIds, match.evidence.id],
            complianceStatus: assess.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : assess.complianceStatus
          });
        }
      }

      logAuditEvent(
        'UPDATE',
        'AUTOMATED_EVIDENCE_RECOMMENDER',
        `Linked EvidenceVault item "${match.evidence.title}" (${match.evidence.id}) to ${requirement.requirementCode}.`
      );

      showToast({
        type: 'success',
        title: 'Evidence Linked',
        message: `Linked "${match.evidence.title}" to ${requirement.requirementCode}. Projected +${match.projectedReadinessUplift}% readiness uplift.`
      });

      if (onRefreshCalculations) {
        onRefreshCalculations();
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Linking Error',
        message: 'Could not link evidence to requirement.'
      });
    } finally {
      setLinkingEvidenceId(null);
    }
  };

  // Handle scaffolding template
  const handleScaffold = async (template: PrescribedEvidenceTemplate) => {
    try {
      setIsScaffolding(true);

      await uploadEvidence({
        title: template.title,
        controlCode: template.controlCode,
        department: template.department,
        fileName: template.suggestedFileName,
        fileSize: '1.2 MB (Placeholder)',
        fileType: template.suggestedFileType,
        tags: [...template.tags, requirement.requirementCode, 'AI-Scaffolded-Request'],
        initialStatus: 'Pending Review',
        documentExcerpt: `Automated compliance request scaffolded to bridge regulatory gap for ${requirement.requirementCode}. Prescribed mandatory safeguards: ${template.mandatorySafeguards.join('; ')}.`
      });

      logAuditEvent(
        'CREATE',
        'EVIDENCE_VAULT_SCAFFOLD',
        `Scaffolded evidence placeholder "${template.title}" for ${requirement.requirementCode}.`
      );

      showToast({
        type: 'success',
        title: 'Request Scaffolded',
        message: `Scaffolded "${template.title}" into EvidenceVault for ${requirement.requirementCode}.`
      });

      if (onRefreshCalculations) {
        onRefreshCalculations();
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Scaffolding Error',
        message: 'Could not scaffold evidence placeholder.'
      });
    } finally {
      setIsScaffolding(false);
    }
  };

  if (!recommendation) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h4 className="text-sm font-bold text-white">No Deficiencies or Missing Evidence</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          This requirement is currently evaluated as <strong className="text-emerald-400">{requirement.complianceStatusBadge}</strong>.
          Verified EvidenceVault artifacts are actively mapped and satisfy the supervisory audit requirement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Gap Context Box */}
      <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-rose-300">
              Regulatory Gap Status: {recommendation.complianceStatus}
            </span>
            <span className="text-rose-400/80 font-mono text-[11px]">
              ({recommendation.statutoryMandateNote})
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {recommendation.primaryDeficiencyReason}
          </p>
        </div>
      </div>

      {/* Matched EvidenceVault Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recommended Vault Artifacts to Bridge Gap ({recommendation.matchedVaultItems.length})</span>
          </div>
          {onOpenEvidenceVault && (
            <button
              onClick={() => onOpenEvidenceVault(requirement)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <span>Search All Evidence</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {recommendation.matchedVaultItems.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 text-center space-y-2">
            <Info className="w-7 h-7 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              No matching artifacts found in the tenant's EvidenceVault.
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Review the prescribed gold-standard template below and scaffold a formal evidence request into EvidenceVault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendation.matchedVaultItems.map((match) => {
              const isVerified = match.evidence.verificationState === 'Verified' || match.evidence.status === 'Verified';
              const isLinking = linkingEvidenceId === match.evidence.id;

              return (
                <div
                  key={match.evidence.id}
                  className="bg-slate-800/80 border border-slate-700 hover:border-slate-600 rounded-xl p-4 space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          match.confidenceLevel === 'HIGH_CONFIDENCE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          {match.confidenceScore}% Match
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          isVerified
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                        }`}>
                          {isVerified ? 'Verified' : 'Pending Review'}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        {match.evidence.title}
                      </h5>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30 shrink-0">
                      +{match.projectedReadinessUplift}% Uplift
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {match.gapBridgingRationale}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Control: {match.evidence.controlCode}
                    </span>

                    {match.recommendedAction === 'ALREADY_LINKED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Already Linked</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleLink(match)}
                        disabled={isLinking}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <LinkIcon className={`w-3 h-3 ${isLinking ? 'animate-spin' : ''}`} />
                        <span>{isLinking ? 'Linking...' : 'Link to Bridge Gap'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prescribed Gold-Standard Template */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold font-mono flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              Prescribed Gold-Standard Evidence Specification
            </span>
            <h5 className="text-sm font-bold text-white">
              {recommendation.prescribedTemplate.title}
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              {recommendation.prescribedTemplate.rationale}
            </p>
          </div>

          <button
            onClick={() => handleScaffold(recommendation.prescribedTemplate)}
            disabled={isScaffolding}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Plus className={`w-3.5 h-3.5 ${isScaffolding ? 'animate-spin' : ''}`} />
            <span>{isScaffolding ? 'Scaffolding...' : 'Scaffold Request in Vault'}</span>
          </button>
        </div>

        {/* Safeguards */}
        <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Mandatory Safeguards to Verify:
          </span>
          <ul className="space-y-1 text-xs text-slate-300">
            {recommendation.prescribedTemplate.mandatorySafeguards.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
          <div>Department: <strong className="text-slate-200">{recommendation.prescribedTemplate.department}</strong></div>
          <div>Cadence: <strong className="text-slate-200">{recommendation.prescribedTemplate.recommendedCadence}</strong></div>
          <div>Suggested File: <strong className="text-slate-200">{recommendation.prescribedTemplate.suggestedFileName}</strong></div>
          <div>Projected Uplift: <strong className="text-emerald-400">+{recommendation.prescribedTemplate.potentialReadinessUplift}%</strong></div>
        </div>
      </div>
    </div>
  );
};
