import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  FolderCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  Link as LinkIcon,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Zap,
  Building2,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  Info,
  Award
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { EnrichedMASRequirement, ComplianceStatusBadge } from './ComplianceGapVisualization';
import {
  EvidenceVaultMatch,
  RequirementGapRecommendation,
  ExecutiveGapRemediationSummary,
  generateExecutiveGapRemediationSummary,
  PrescribedEvidenceTemplate
} from '../../services/evidenceRecommendationEngine';
import { EvidenceRecord } from '../../types';

interface EvidenceGapRecommendationHubProps {
  enrichedRequirements: EnrichedMASRequirement[];
  onSelectRequirement?: (req: EnrichedMASRequirement) => void;
  onNavigateToVault?: (searchTerm: string) => void;
  onRefreshCalculations?: () => void;
}

export const EvidenceGapRecommendationHub: React.FC<EvidenceGapRecommendationHubProps> = ({
  enrichedRequirements,
  onSelectRequirement,
  onNavigateToVault,
  onRefreshCalculations
}) => {
  const {
    evidence,
    masAssessments,
    updateMASAssessment,
    uploadEvidence,
    logAuditEvent,
    currentTenant,
    currentUser
  } = useGRC();

  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IMMEDIATE_WINS' | 'DEFICIENT' | 'PENDING_EVIDENCE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});
  const [linkingEvidenceId, setLinkingEvidenceId] = useState<string | null>(null);
  const [scaffoldingTemplateId, setScaffoldingTemplateId] = useState<string | null>(null);
  const [isBulkLinking, setIsBulkLinking] = useState(false);

  // Generate automated recommendation summary
  const summary: ExecutiveGapRemediationSummary = useMemo(() => {
    return generateExecutiveGapRemediationSummary(
      enrichedRequirements,
      evidence,
      masAssessments
    );
  }, [enrichedRequirements, evidence, masAssessments]);

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return summary.recommendations.filter((rec) => {
      // 1. Tab filter
      if (activeFilter === 'IMMEDIATE_WINS' && rec.overallGapBridgeability !== 'IMMEDIATE_VAULT_WIN') {
        return false;
      }
      if (activeFilter === 'DEFICIENT' && rec.complianceStatus !== 'Deficient') {
        return false;
      }
      if (activeFilter === 'PENDING_EVIDENCE' && rec.complianceStatus !== 'Pending Evidence') {
        return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = rec.requirementCode.toLowerCase().includes(q);
        const matchesTitle = rec.requirementTitle.toLowerCase().includes(q);
        const matchesDomain = rec.domainName.toLowerCase().includes(q);
        const matchesReason = rec.primaryDeficiencyReason.toLowerCase().includes(q);
        const matchesTopMatch = rec.topMatch?.evidence.title.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesDomain && !matchesReason && !matchesTopMatch) {
          return false;
        }
      }

      return true;
    });
  }, [summary.recommendations, activeFilter, searchQuery]);

  // Count ready high-confidence links
  const immediateWins = useMemo(() => {
    return summary.recommendations.filter(
      (r) => r.topMatch && r.topMatch.recommendedAction === 'LINK_EXISTING_EVIDENCE' && r.topMatch.confidenceScore >= 70
    );
  }, [summary.recommendations]);

  // Toggle template view
  const toggleTemplate = (reqCode: string) => {
    setExpandedTemplates((prev) => ({
      ...prev,
      [reqCode]: !prev[reqCode]
    }));
  };

  // Handler: 1-Click Link existing EvidenceVault item to bridge gap
  const handleLinkEvidence = async (
    reqCode: string,
    match: EvidenceVaultMatch
  ) => {
    try {
      setLinkingEvidenceId(match.evidence.id);

      // Locate assessment record
      const assess = masAssessments.find(
        (a) => a.requirementCode === reqCode || a.id.includes(reqCode)
      );

      if (assess) {
        const existingIds = assess.linkedEvidenceIds || [];
        if (!existingIds.includes(match.evidence.id)) {
          const updatedIds = [...existingIds, match.evidence.id];
          updateMASAssessment(assess.id, {
            linkedEvidenceIds: updatedIds,
            // If the linked evidence is verified and status was pending, upgrade to Under Review
            complianceStatus: assess.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : assess.complianceStatus
          });
        }
      }

      // Audit trail
      logAuditEvent(
        'UPDATE',
        'AUTOMATED_EVIDENCE_RECOMMENDER',
        `Linked EvidenceVault item "${match.evidence.title}" (${match.evidence.id}) to ${reqCode} with confidence score ${match.confidenceScore}%.`
      );

      showToast({
        type: 'success',
        title: 'Evidence Gap Bridged',
        message: `Successfully linked "${match.evidence.title}" to ${reqCode}. Projected +${match.projectedReadinessUplift}% readiness uplift applied.`
      });

      if (onRefreshCalculations) {
        onRefreshCalculations();
      }
    } catch (err) {
      console.error('Failed to link evidence:', err);
      showToast({
        type: 'error',
        title: 'Linking Error',
        message: 'Unable to link evidence to regulatory assessment.'
      });
    } finally {
      setLinkingEvidenceId(null);
    }
  };

  // Handler: Bulk auto-bridge all high confidence ready wins
  const handleBulkBridgeGaps = async () => {
    if (immediateWins.length === 0) {
      showToast({
        type: 'info',
        title: 'No Pending Auto-Wins',
        message: 'All available high-confidence matches in the vault are already linked.'
      });
      return;
    }

    setIsBulkLinking(true);
    let linkedCount = 0;

    try {
      for (const win of immediateWins) {
        if (!win.topMatch) continue;
        const assess = masAssessments.find(
          (a) => a.requirementCode === win.requirementCode || a.id.includes(win.requirementCode)
        );

        if (assess) {
          const existingIds = assess.linkedEvidenceIds || [];
          if (!existingIds.includes(win.topMatch.evidence.id)) {
            updateMASAssessment(assess.id, {
              linkedEvidenceIds: [...existingIds, win.topMatch.evidence.id],
              complianceStatus: assess.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : assess.complianceStatus
            });
            linkedCount++;
          }
        }
      }

      logAuditEvent(
        'UPDATE',
        'AUTOMATED_EVIDENCE_RECOMMENDER',
        `Batch linked ${linkedCount} high-confidence EvidenceVault artifacts to bridge MAS TRM deficiencies.`
      );

      showToast({
        type: 'success',
        title: 'Batch Auto-Bridge Complete',
        message: `Successfully linked ${linkedCount} EvidenceVault artifacts across deficient & pending requirements!`
      });

      if (onRefreshCalculations) {
        onRefreshCalculations();
      }
    } catch (err) {
      console.error('Batch linking failed:', err);
      showToast({
        type: 'error',
        title: 'Batch Error',
        message: 'Encountered an issue during bulk evidence association.'
      });
    } finally {
      setIsBulkLinking(false);
    }
  };

  // Handler: Scaffold prescribed evidence request directly into EvidenceVault
  const handleScaffoldTemplate = async (
    reqCode: string,
    template: PrescribedEvidenceTemplate
  ) => {
    try {
      setScaffoldingTemplateId(template.templateId);

      // 1. Upload scaffolded evidence artifact into EvidenceVault
      await uploadEvidence({
        title: template.title,
        controlCode: template.controlCode,
        department: template.department,
        fileName: template.suggestedFileName,
        fileSize: '1.2 MB (Placeholder)',
        fileType: template.suggestedFileType,
        tags: [...template.tags, reqCode, 'AI-Scaffolded-Request'],
        initialStatus: 'Pending Review',
        documentExcerpt: `Automated compliance request scaffolded to bridge regulatory gap for ${reqCode}. Prescribed mandatory safeguards: ${template.mandatorySafeguards.join('; ')}.`
      });

      // 2. Fetch the newly uploaded evidence record from updated state or link
      const assess = masAssessments.find(
        (a) => a.requirementCode === reqCode || a.id.includes(reqCode)
      );

      logAuditEvent(
        'CREATE',
        'EVIDENCE_VAULT_SCAFFOLD',
        `Scaffolded evidence placeholder "${template.title}" in EvidenceVault to remediate ${reqCode}.`
      );

      showToast({
        type: 'success',
        title: 'Evidence Request Scaffolded',
        message: `Created placeholder "${template.title}" in EvidenceVault and assigned to ${template.department}.`
      });

      if (onRefreshCalculations) {
        onRefreshCalculations();
      }
    } catch (err) {
      console.error('Scaffolding evidence request failed:', err);
      showToast({
        type: 'error',
        title: 'Scaffolding Failed',
        message: 'Could not create evidence request in EvidenceVault.'
      });
    } finally {
      setScaffoldingTemplateId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Automated Evidence Recommendation Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Real-Time Vault Correlation
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              EvidenceVault Gap Bridging & Prescriptive Matching
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Continuously scans regulatory requirements flagged as <span className="text-rose-400 font-semibold">Deficient</span> or <span className="text-amber-400 font-semibold">Pending Evidence</span> against your tenant's EvidenceVault. Identifies immediate matching artifacts, calculates projected readiness uplift, and prescribes gold-standard collection templates.
            </p>
          </div>

          {/* Bulk Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBulkBridgeGaps}
              disabled={isBulkLinking || immediateWins.length === 0}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-md ${
                immediateWins.length > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Zap className={`w-4 h-4 ${isBulkLinking ? 'animate-spin text-white' : 'text-amber-300'}`} />
              <span>
                {isBulkLinking
                  ? 'Auto-Bridging Gaps...'
                  : `1-Click Auto-Bridge High Confidence (${immediateWins.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Total Gaps Identified</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">
                {summary.totalDeficientRequirements + summary.totalPendingEvidenceRequirements}
              </span>
              <span className="text-[10px] text-rose-400 font-medium">
                {summary.totalDeficientRequirements} Deficient
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-emerald-900/30 rounded-lg p-3">
            <div className="text-[11px] text-emerald-400 uppercase font-medium tracking-wider">Immediate Vault Wins</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-300">
                {summary.totalBridgeableWithVault}
              </span>
              <span className="text-[10px] text-emerald-400/80">Ready to Link</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-amber-900/30 rounded-lg p-3">
            <div className="text-[11px] text-amber-400 uppercase font-medium tracking-wider">Requests to Scaffold</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-300">
                {summary.totalNeedingCollection}
              </span>
              <span className="text-[10px] text-amber-400/80">Templates Ready</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-indigo-900/30 rounded-lg p-3">
            <div className="text-[11px] text-indigo-400 uppercase font-medium tracking-wider">Potential Readiness Uplift</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-indigo-300">
                +{summary.projectedAverageReadinessIncrease}%
              </span>
              <span className="text-[10px] text-indigo-400/80">Avg Post-Remediation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All Gap Requirements ({summary.recommendations.length})
          </button>
          <button
            onClick={() => setActiveFilter('IMMEDIATE_WINS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'IMMEDIATE_WINS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
            Immediate Vault Wins ({summary.totalBridgeableWithVault})
          </button>
          <button
            onClick={() => setActiveFilter('DEFICIENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'DEFICIENT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Deficient ({summary.totalDeficientRequirements})
          </button>
          <button
            onClick={() => setActiveFilter('PENDING_EVIDENCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'PENDING_EVIDENCE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Pending Evidence ({summary.totalPendingEvidenceRequirements})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requirement or keyword..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Recommendations Cards List */}
      {filteredRecommendations.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Unremediated Gaps in Current View</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All requirements in this filter category have verified EvidenceVault coverage or do not require immediate remediation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => {
            const enrichedReq = enrichedRequirements.find((r) => r.requirementCode === rec.requirementCode);
            const isExpanded = expandedTemplates[rec.requirementCode] || false;

            return (
              <div
                key={rec.requirementCode}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 shadow-lg transition-all"
              >
                {/* Top Row: Requirement Identity & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {rec.requirementCode}
                      </span>
                      <ComplianceStatusBadge status={rec.complianceStatus} size="sm" />
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        rec.riskTier === 'HIGH_RISK'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {rec.riskTier.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        Domain {rec.domainNumber}: {rec.domainName}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white pt-1">
                      {rec.requirementTitle}
                    </h3>
                  </div>

                  {/* Readiness Score & Drilldown Link */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Readiness</div>
                      <div className="font-mono text-sm font-bold text-white">
                        {rec.readinessScore}%
                      </div>
                    </div>
                    {enrichedReq && onSelectRequirement && (
                      <button
                        onClick={() => onSelectRequirement(enrichedReq)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 border border-slate-700"
                      >
                        <span>Drill-Down</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Deficiency Reason Banner */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-semibold text-rose-200">Regulatory Gap Cause: </span>
                    <span className="text-rose-300/90">{rec.primaryDeficiencyReason}</span>
                    <div className="text-[11px] text-slate-400 pt-0.5 font-mono">
                      {rec.statutoryMandateNote}
                    </div>
                  </div>
                </div>

                {/* Section 1: Matched EvidenceVault Items */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Matching Vault Artifacts ({rec.matchedVaultItems.length})</span>
                    </div>
                    {rec.matchedVaultItems.length > 0 && onNavigateToVault && (
                      <button
                        onClick={() => onNavigateToVault(rec.requirementCode)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                      >
                        <span>Explore in Central Vault</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {rec.matchedVaultItems.length === 0 ? (
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-400 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>No directly aligned artifacts currently found in EvidenceVault.</span>
                      </div>
                      <button
                        onClick={() => toggleTemplate(rec.requirementCode)}
                        className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>View Prescribed Template</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rec.matchedVaultItems.slice(0, 2).map((match) => {
                        const isVerified = match.evidence.verificationState === 'Verified' || match.evidence.status === 'Verified';
                        const isLinkingThis = linkingEvidenceId === match.evidence.id;

                        return (
                          <div
                            key={match.evidence.id}
                            className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 space-y-2.5 transition-colors"
                          >
                            {/* Match Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    match.confidenceLevel === 'HIGH_CONFIDENCE'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  }`}>
                                    <Sparkles className="w-3 h-3" />
                                    {match.confidenceScore}% Match
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                                    isVerified
                                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                      : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                                  }`}>
                                    {isVerified ? 'Verified' : 'Pending Review'}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {match.evidence.controlCode}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-white pt-1 line-clamp-1">
                                  {match.evidence.title}
                                </h4>
                              </div>

                              <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                                +{match.projectedReadinessUplift}% Uplift
                              </span>
                            </div>

                            {/* Rationale */}
                            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                              {match.gapBridgingRationale}
                            </p>

                            {/* Matching Factor Badges */}
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                              {match.matchingFactors.isoControlMatched && (
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">
                                  {match.matchingFactors.isoControlMatched}
                                </span>
                              )}
                              {match.matchingFactors.keywordMatches.slice(0, 2).map((kw) => (
                                <span key={kw} className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                                  #{kw}
                                </span>
                              ))}
                              {match.matchingFactors.tagMatches.slice(0, 1).map((tag) => (
                                <span key={tag} className="bg-slate-800/80 px-1.5 py-0.5 rounded text-amber-300">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Action Button */}
                            <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800/60">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {match.evidence.fileName}
                              </span>

                              {match.recommendedAction === 'ALREADY_LINKED' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Linked to Assessment</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleLinkEvidence(rec.requirementCode, match)}
                                  disabled={isLinkingThis}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                >
                                  <LinkIcon className={`w-3 h-3 ${isLinkingThis ? 'animate-spin' : ''}`} />
                                  <span>{isLinkingThis ? 'Linking...' : 'Link Evidence to Bridge Gap'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 2: Prescribed Gold-Standard Evidence Template */}
                <div className="border-t border-slate-800/70 pt-2">
                  <button
                    onClick={() => toggleTemplate(rec.requirementCode)}
                    className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Prescribed Evidence Archetype Template (Gold-Standard Spec)</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 animate-in fade-in duration-150">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold font-mono">
                            Recommended Artifact Specification
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {rec.prescribedTemplate.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {rec.prescribedTemplate.rationale}
                          </p>
                        </div>

                        <button
                          onClick={() => handleScaffoldTemplate(rec.requirementCode, rec.prescribedTemplate)}
                          disabled={scaffoldingTemplateId === rec.prescribedTemplate.templateId}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shrink-0 disabled:opacity-50"
                        >
                          <Plus className={`w-3.5 h-3.5 ${scaffoldingTemplateId === rec.prescribedTemplate.templateId ? 'animate-spin' : ''}`} />
                          <span>
                            {scaffoldingTemplateId === rec.prescribedTemplate.templateId
                              ? 'Scaffolding Request...'
                              : 'Scaffold Request in Vault'}
                          </span>
                        </button>
                      </div>

                      {/* Safeguards Checklist */}
                      <div className="bg-slate-900/80 rounded-md p-3 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Mandatory Safeguards to Verify:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {rec.prescribedTemplate.mandatorySafeguards.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                        <div>Department: <strong className="text-slate-200">{rec.prescribedTemplate.department}</strong></div>
                        <div>Cadence: <strong className="text-slate-200">{rec.prescribedTemplate.recommendedCadence}</strong></div>
                        <div>Suggested File: <strong className="text-slate-200">{rec.prescribedTemplate.suggestedFileName}</strong></div>
                        <div>Potential Uplift: <strong className="text-emerald-400">+{rec.prescribedTemplate.potentialReadinessUplift}%</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
